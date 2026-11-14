# Hooshaai/bert-hybrid-local-kernel-sst2

## Resumen

`bert-hybrid-local-kernel-sst2` es un checkpoint de clasificación de sentimiento (tarea SST-2 del benchmark GLUE) construido sobre `bert-base-uncased` en el que el autor (Hooshaai, con referencia interna a `tahamajs`) ha sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `hybrid_local_kernel` de la librería NeuralOps. El objetivo declarado es demostrar que es posible reemplazar la atención cuadrática O(N²) por una variante subcuadrática (O(N) u O(N log N)) y recuperar buena parte de la calidad del modelo original mediante destilación de representaciones en caché.

El modelo no se distribuye como un BERT completo, sino como un conjunto modular de pesos de atención en FP16 (`attention_weights.safetensors`, unos 55 MB) más la cabeza de clasificación. El código remoto (`modeling_neuralops_bert.py`) reconstruye el BERT base congelado desde `bert-base-uncased` y aplica encima los parámetros destilados. Es, por tanto, más una prueba de concepto de investigación sobre eficiencia atencional que un modelo listo para producción.

La relevancia actual es doble: por un lado explora alternativas subcuadráticas a la atención estándar, un área activa de investigación; por otro, propone un protocolo de destilación con "cero VRAM de profesor" (alineamiento de representaciones offline) ejecutado en una única RTX 3090. Los resultados son modestos: 80,85 % de accuracy en SST-2 frente al 91,63 % del profesor, con solo 173 pasos de optimización y 53,2 segundos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-base con atención `hybrid_local_kernel` (subcuadrática) en las 12 capas |
| Parametros totales | ~110 M (base BERT-base congelado) + pesos de atención destilados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-base estándar: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | FP16 (pesos de atención serializados en `attention_only_fp16`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, ~55 MB) + código remoto Python |
| Librería | neuralops (con shim para `transformers`) |
| Tarea | Clasificación de texto (sentimiento binario, SST-2) |
| Modelo base | google-bert/bert-base-uncased |

## Arquitectura y entrenamiento

La arquitectura parte de `bert-base-uncased` (12 capas, ~110 M parámetros) y reemplaza la atención multi-cabeza softmax estándar por `hybrid_local_kernel`, un mecanismo híbrido de atención local con kernel que reduce la complejidad operativa efectiva de O(N²) a O(N) u O(N log N). El BERT base permanece congelado; solo se entrenan y serializan los pesos de atención y la cabeza de clasificación, lo que explica el reducido tamaño del repositorio (0,4 GB total, con pesos de atención de ~55 MB).

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una primera etapa de alineamiento de subespacio oculto y una segunda etapa con KL sobre logits más entropía cruzada de la tarea. El profesor se ejecuta offline y sus representaciones se cachean, de modo que no consume VRAM durante el entrenamiento del alumno. La ejecución se realizó en una NVIDIA GeForce RTX 3090 (24 GB), con 173 pasos de optimización, 53,2 segundos de duración, throughput de 26.642,3 tokens/s y un pico de VRAM de 10.983 MB. No se detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá de GLUE/SST-2.

## Capacidades

- Clasificación de sentimiento binario (positivo/negativo) en inglés, específicamente sobre el dominio de SST-2.
- Atención subcuadrática: el mecanismo `hybrid_local_kernel` reduce el coste computacional teórico frente a la atención cuadrática estándar.
- Carga modular: los pesos de atención se aplican dinámicamente sobre el BERT base congelado mediante código remoto (`trust_remote_code=True`).
- Integración con `transformers` vía `AutoModelForSequenceClassification` y con la API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no; solo inglés.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto: el modelo devuelve directamente una etiqueta binaria sobre texto en inglés, adecuado para pipelines de análisis de opiniones donde el coste por inferencia importe más que la precisión máxima.
- Investigación en eficiencia atencional: sirve como checkpoint de referencia para comparar mecanismos subcuadráticos frente a la atención softmax estándar en tareas GLUE, con una línea base reproducible.
- Experimentos de destilación con recursos limitados: el protocolo de representaciones cacheadas permite reproducir el entrenamiento en una única GPU de consumo (RTX 3090), útil para laboratorios con hardware modesto.
- Filtrado de contenido en inglés a gran escala: al ser un clasificador ligero (pesos de atención de ~55 MB), puede desplegarse en entornos con restricciones de memoria para prefiltrar textos antes de modelos mayores.
- Docencia y prototipado de atención híbrida: el repositorio modular facilita sustituir o inspeccionar los pesos de atención sin manejar el BERT completo.
- Benchmarking de kernels de atención: útil para medir el impacto real de `hybrid_local_kernel` en latencia y memoria frente a la atención cuadrática en hardware concreto.
- No es adecuado para clasificación multilingüe, tareas generativas ni dominios alejados de SST-2 sin reentrenamiento.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Métrica | Profesor (`bert-base-uncased`) | Alumno pre-KD | Modelo destilado | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 51,03 % | 80,85 % | +29,82 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,4659 | convergido |

Telemetría de entrenamiento (clúster Sharif HPC, RTX 3090 24 GB):

| Métrica | Valor |
|---|---|
| Duración del entrenamiento | 53,2 s |
| Pasos de optimización | 173 |
| Throughput efectivo | 26.642,3 tokens/s |
| Pico de VRAM | 10.983 MB |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el BERT base congelado (~110 M parámetros) en FP16 ocupa aproximadamente 220 MB, más los ~55 MB de pesos de atención; en la práctica, una GPU con 2-4 GB de VRAM es suficiente.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- GPU recomendadas para entrenamiento/reproducción: RTX 3090 (24 GB), según la telemetría del autor; GPUs de datacenter (A100, H100) no son necesarias para este tamaño.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado cifras de inferencia; solo se conoce el throughput de entrenamiento (26.642,3 tokens/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy SST-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bert-hybrid-local-kernel-sst2` | ~110 M (base) + atención destilada | no disponible (BERT-base: 512) | 80,85 % | MIT | Hugging Face (código remoto) |
| `bert-base-uncased` (profesor) | ~110 M | 512 | 91,63 % | Apache 2.0 | Hugging Face |
| Modelos con atención subcuadrática (p. ej. Linformer, Performer) | variable | variable | no disponible | variable | papers/repos |

No se dispone de datos comparativos con otras implementaciones de atención subcuadrática sobre BERT en la información proporcionada.

## Limitaciones y advertencias

- Precisión notablemente inferior al profesor: 80,85 % frente a 91,63 % en SST-2, una caída de casi 11 puntos.
- Entrenamiento muy corto (173 pasos, 53,2 s): el modelo puede estar infraajustado y no representa un techo de rendimiento del mecanismo.
- Solo inglés y solo clasificación binaria de sentimiento; no generaliza a otras tareas sin reentrenamiento.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar `modeling_neuralops_bert.py` antes de usarlo en producción.
- Dependencia de la librería `neuralops` y del repositorio base `bert-base-uncased`; si el shim o el base cambian, la carga puede romperse.
- Riesgo de sesgos heredados del corpus SST-2 y del BERT base (sesgos de género, dominio, etc.), no evaluados en la model card.
- Riesgo de alucinación no aplica como modelo generativo, pero sí de clasificaciones erróneas en dominios alejados de reseñas de cine.
- Licencia MIT permite uso comercial, pero el modelo base `bert-base-uncased` tiene su propia licencia (Apache 2.0) que debe respetarse.
- Repositorio con muy poca tracción (45 descargas, 0 likes) y sin validación externa; tratar como experimento de investigación, no como componente de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/bert-hybrid-local-kernel-sst2
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/bert-base-uncased
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
