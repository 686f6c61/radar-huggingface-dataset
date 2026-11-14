# Hooshaai/bert-regla-attention-sst2

## Resumen

`bert-regla-attention-sst2` es un checkpoint de BERT-Base (110 M de parámetros) publicado por Hooshaai en el que se han sustituido los bloques de atención softmax cuadrática de las 12 capas del transformer por el mecanismo `regla_attention` de la librería NeuralOps. El modelo se ha ajustado y evaluado sobre la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés) mediante un protocolo de destilación de representaciones en caché con asignación cero de VRAM para el modelo profesor.

El interés del checkpoint es fundamentalmente arquitectónico y metodológico: demuestra un flujo de trabajo de "attention zoo" en el que se serializan únicamente los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), mientras que los pesos congelados del BERT base se reconstruyen en tiempo de carga desde `bert-base-uncased`. La atención subcuadrática promete complejidad efectiva O(N) u O(N log N) frente a la O(N²) de la MHA estándar.

No obstante, el rendimiento empírico es muy limitado: la precisión en SST-2 es del 66,51 %, frente al 91,63 % del profesor BERT-Base, y la destilación no mejora esa cifra (delta de +0,00 %). Se trata, por tanto, de un artefacto de investigación y reproducibilidad, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-Base (transformer encoder, 12 capas) con atención `regla_attention` subcuadrática en lugar de softmax cuadrática |
| Parametros totales | ~110 M (base BERT-Base); se serializan solo los pesos de atención y cabeza de clasificación (~55 MB en FP16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de BERT-Base, típicamente 512 tokens, no confirmado en la información) |
| Tipos de cuantizacion | FP16 para los pesos de atención (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16); reconstrucción del base desde `bert-base-uncased` |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased` y reemplaza en las 12 capas el bloque de multi-head attention estándar por `regla_attention`, un mecanismo de la NeuralOps Library con complejidad efectiva O(N) u O(N log N) frente a la O(N²) de la atención softmax convencional. La serialización es modular: el repositorio contiene únicamente los pesos de atención especializados y la cabeza de clasificación en FP16 (~55 MB), y el código remoto (`modeling_neuralops_bert.py`) inicializa los pesos congelados del BERT base desde el Hub y aplica los parámetros destilados en tiempo de carga.

El entrenamiento sigue el NeuralOps Cached Representation Distillation Protocol, con dos etapas: alineamiento de subespacio oculto y luego KL sobre logits más entropía cruzada de la tarea. El profesor se ejecuta de forma offline con representaciones en caché, de modo que no consume VRAM adicional durante la destilación. La ejecución física se realizó en una NVIDIA GeForce RTX 3090 (24 GB), con una duración de 77,1 s, un único paso de optimización, un throughput efectivo de 106,2 tokens/s y un pico de VRAM de 7227 MB. El dataset de evaluación y ajuste es la partición de validación de SST-2 (872 muestras binarias).

## Capacidades

- Clasificación binaria de sentimiento en inglés (positivo/negativo) sobre textos tipo SST-2.
- Codificación de secuencias con atención subcuadrática, orientada a reducir el coste computacional en secuencias largas.
- Carga modular vía `transformers` con `trust_remote_code=True` o mediante la API `load_pretrained_bert` / `load_surgeried_model` de NeuralOps.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes.
- Multilingüismo: no soportado; el modelo está entrenado y evaluado solo en inglés.
- No se documenta modo "thinking" ni decodificación especulativa.

## Casos de uso

- Investigación sobre atención subcuadrática: servir como punto de partida reproducible para comparar `regla_attention` con MHA estándar en tareas GLUE, dado que el checkpoint y el protocolo de destilación están publicados.
- Análisis de sentimiento en inglés a pequeña escala: clasificación binaria de reseñas o comentarios donde una precisión del ~66 % sea aceptable como línea base experimental.
- Reproducción de experimentos de destilación: el protocolo de representaciones en caché con cero VRAM de profesor permite replicar el pipeline en una única GPU de consumo.
- Evaluación de eficiencia de serialización modular: útil para estudiar el intercambio de pesos solo-atención (~55 MB) frente al reenvío completo del modelo base (~450 MB).
- Docencia y prototipado: ejemplo didáctico de sustitución de bloques de atención y carga con código remoto en Hugging Face.
- Integración en pipelines de clasificación de bajo coste: al ocupar poco espacio en disco y requerir una GPU de consumo, encaja en entornos de pruebas o CI para validar integraciones con la librería NeuralOps.

## Benchmarks y rendimiento

Evaluación sobre la partición de validación de GLUE SST-2 (872 muestras binarias):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD (`regla_attention`) | Modelo destilado post-KD | Delta |
|---|---|---|---|---|
| Accuracy SST-2 | 91,63 % | 66,51 % | 66,51 % | +0,00 % |
| Entropía cruzada de validación | 0,2428 | no calibrada | 0,5639 | convergido |

Telemetría de entrenamiento (RTX 3090, 24 GB): duración 77,1 s, 1 paso de optimización, throughput efectivo 106,2 tokens/s, pico de VRAM 7227 MB.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el pico registrado durante el entrenamiento fue de 7227 MB en una RTX 3090.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) es la plataforma documentada; cualquier GPU Ampere o superior con al menos ~8 GB debería ser suficiente para inferencia, aunque no se confirma en la información.
- Cabe en GPU de consumo: sí, según la telemetría del entrenamiento en RTX 3090; no se documentan pruebas en GPUs de gama inferior.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` y `trust_remote_code=True`; API de NeuralOps (`load_pretrained_bert`, `load_surgeried_model`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: throughput de entrenamiento de 106,2 tokens/s; no se publican métricas de latencia ni throughput de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-regla-attention-sst2` | ~110 M (solo atención ~55 MB serializados) | no disponible | 66,51 % | MIT | Hugging Face |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens (típico) | 91,63 % (en esta evaluación) | Apache 2.0 | Hugging Face |
| Alternativas subcuadráticas tipo Performer/Linformer | variable | variable | no disponible en la información | variable | Hugging Face |

No se dispone de datos comparativos adicionales con otros modelos de atención subcuadrática en la información proporcionada.

## Limitaciones y advertencias

- Rendimiento muy por debajo del profesor: 66,51 % frente a 91,63 % en SST-2, lo que lo hace inadecuado para producción en clasificación de sentimiento.
- La destilación no aporta mejora (delta de +0,00 %), lo que sugiere un ajuste insuficiente (un único paso de optimización).
- Solo inglés; no hay soporte multilingüe documentado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código remoto del autor; revisar `modeling_neuralops_bert.py` antes de usarlo.
- Dependencia de la reconstrucción del base desde `bert-base-uncased`: si el Hub o el código remoto cambian, la carga puede romperse.
- No se documentan sesgos específicos, pero al derivar de BERT-Base hereda los sesgos de su corpus de entrenamiento original.
- Riesgo de alucinación no aplicable directamente (es un clasificador, no un generador), pero sí riesgo de clasificaciones erróneas por la baja precisión.
- Licencia MIT permite uso comercial, pero el rendimiento limitado desaconseja su uso en producción sin ajuste adicional.
- No se documentan benchmarks fuera de SST-2 ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-regla-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
