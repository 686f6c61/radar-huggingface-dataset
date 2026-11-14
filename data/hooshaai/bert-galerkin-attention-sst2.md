# Hooshaai/bert-galerkin-attention-sst2

## Resumen

`Hooshaai/bert-galerkin-attention-sst2` es un checkpoint de BERT-Base (110 M de parámetros) en el que se han sustituido los bloques de atención softmax cuadrática de sus 12 capas por el mecanismo `galerkin_attention` de la librería NeuralOps. El objetivo es demostrar que es posible reemplazar la atención estándar por una variante subcuadrática (complejidad efectiva O(N) u O(N log N) frente a O(N²)) manteniendo una precisión competitiva tras un proceso de destilación de conocimiento. Lo desarrolla Taha Majlesi (organización Hooshaai / proyecto NeuralOps) y se publica como parte de un "Attention Zoo" de variantes de atención sobre BERT.

El modelo está afinado y evaluado exclusivamente en la tarea SST-2 del benchmark GLUE (clasificación binaria de sentimiento en inglés). Su interés práctico no reside en el rendimiento absoluto, sino en servir como referencia reproducible de cómo una atención subcuadrática destilada puede recuperar buena parte de la precisión del profesor original (91,63 % → 84,63 %) con un coste de entrenamiento muy bajo (50,9 s en una RTX 3090). Es, por tanto, una pieza de investigación más que un modelo listo para producción general.

El repositorio es deliberadamente ligero: solo serializa los pesos de atención y la cabeza de clasificación en FP16 (~55 MB), reconstruyendo el resto de BERT-Base desde `bert-base-uncased` mediante código remoto. Esto reduce la huella de descarga pero introduce dependencia de `trust_remote_code=True` y de la librería `neuralops`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT-Base con atención `galerkin_attention` subcuadrática en las 12 capas |
| Parametros totales | 110 M (heredados de `bert-base-uncased`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (BERT-Base estándar: 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | pesos de atención serializados en FP16; no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, ~55 MB) + pesos base congelados de `bert-base-uncased` cargados en tiempo de ejecución |

## Arquitectura y entrenamiento

La arquitectura parte de BERT-Base (12 capas, 110 M de parámetros, encoder transformer bidireccional) y sustituye en todas las capas el mecanismo de multi-head attention softmax cuadrática por `galerkin_attention`, una variante de atención subcuadrática con complejidad operativa efectiva O(N) u O(N log N). El resto del modelo (embeddings, feed-forward, normalizaciones) permanece congelado y se carga desde `bert-base-uncased`; solo se entrenan y serializan los pesos de atención y la cabeza de clasificación.

El entrenamiento sigue el "NeuralOps Cached Representation Distillation Protocol": una destilación en dos etapas (alineamiento de subespacio oculto en la etapa 1 y KL sobre logits más entropía cruzada de la tarea en la etapa 2), con las representaciones del profesor cacheadas offline para no consumir VRAM adicional durante el entrenamiento. Se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) con 225 pasos de optimización, 50,9 s de duración, throughput efectivo de 36 208,7 tokens/s y un pico de VRAM de 13 512 MB. El dataset es SST-2 de GLUE.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, tarea SST-2 de GLUE.
- Codificación de secuencias con atención subcuadrática, lo que reduce el coste computacional teórico en secuencias largas frente a la atención cuadrática.
- Carga modular: los pesos de atención pueden reconstruirse sobre BERT-Base mediante la API `load_pretrained_bert` de NeuralOps o vía `transformers` con `trust_remote_code=True`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés.
- No dispone de modo "thinking", visión ni audio.
- No es un modelo generativo: no produce texto libre, solo logits de clasificación.

## Casos de uso

- Clasificación de sentimiento en reseñas de producto o comentarios en inglés: el modelo devuelve una etiqueta binaria directamente sobre texto de entrada; adecuado para pipelines de moderación o análisis de opinión donde solo se necesita polaridad.
- Filtrado previo de reseñas negativas en sistemas de soporte: al ser un clasificador ligero (55 MB de pesos descargables), puede desplegarse en entornos con recursos limitados para priorizar casos que requieran atención humana.
- Benchmark de investigación sobre atención subcuadrática: sirve como punto de referencia reproducible para comparar variantes del Attention Zoo de NeuralOps frente a BERT-Base estándar en SST-2.
- Docencia y experimentación con destilación de conocimiento: el protocolo de dos etapas y las métricas de telemetría (pasos, VRAM, throughput) documentadas permiten reproducir el experimento en una única GPU consumer.
- Sustitución modular de atención en prototipos: la API `load_pretrained_bert(attention_type="galerkin_attention")` permite integrar esta atención en otros flujos de clasificación sobre BERT sin reentrenar el backbone.
- Análisis de sentimiento por lotes en entornos de bajo presupuesto: al no requerir el profesor en memoria y caber en una RTX 3090 (13,5 GB de pico durante entrenamiento), es viable en estaciones de trabajo con una sola GPU.

## Benchmarks y rendimiento

Evaluación sobre el split de validación de GLUE SST-2 (872 muestras de clasificación binaria):

| Metrica | Profesor (`bert-base-uncased`) | Estudiante pre-KD | Modelo destilado |
|---|---|---|---|
| Precision SST-2 | 91,63 % | 43,58 % | 84,63 % |
| Entropia cruzada de validacion | 0,2428 | no calibrada | 0,4392 |
| Delta de precision | — | — | +41,06 % |

Telemetría de entrenamiento (RTX 3090, 24 GB): 50,9 s de duración, 225 pasos, 36 208,7 tokens/s de throughput efectivo, 13 512 MB de VRAM pico.

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP16 ocupa aproximadamente 220 MB (110 M de parámetros × 2 bytes), más overhead de activaciones; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; la model card documenta entrenamiento en RTX 3090 (24 GB), pero la inferencia no requiere esa capacidad.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (documentado), API `neuralops.hub` (`load_pretrained_bert`, `load_surgeried_model`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se documentan métricas de inferencia; solo se reporta throughput de entrenamiento (36 208,7 tokens/s).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SST-2 (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/bert-galerkin-attention-sst2` | 110 M | no disponible | 84,63 % | MIT | Hugging Face, requiere `trust_remote_code` |
| `google-bert/bert-base-uncased` (profesor) | 110 M | 512 tokens | 91,63 % (referencia de la model card) | Apache 2.0 | Hugging Face, `transformers` nativo |
| Variantes del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | MIT | Hugging Face (repos relacionados) |

No se dispone de datos de otros modelos comparables (por ejemplo, RoBERTa-base o DeBERTa-v3-base en SST-2) en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no cubre otros idiomas.
- Solo clasificación binaria de sentimiento (SST-2); no es un modelo generativo ni un encoder de propósito general listo para otras tareas sin reentrenamiento.
- Precisión inferior al profesor: 84,63 % frente a 91,63 %, una brecha de 7 puntos que puede ser relevante en producción.
- Requiere `trust_remote_code=True` y la librería `neuralops`; el código remoto se ejecuta en el entorno del usuario, lo que introduce un riesgo de seguridad si no se audita.
- El repositorio solo contiene los pesos de atención y la cabeza de clasificación; la carga depende de `bert-base-uncased` como base congelada, lo que añade una dependencia externa.
- Riesgo de alucinación no aplicable en sentido estricto (no genera texto), pero sí riesgo de clasificaciones erróneas en dominios distintos de SST-2.
- No se documentan sesgos ni evaluaciones de robustez; el modelo se entrenó solo con SST-2, por lo que puede heredar sesgos del corpus.
- Licencia MIT permite uso comercial, pero la dependencia de código remoto y de la base BERT (Apache 2.0) debe verificarse en cada despliegue.
- No se documenta compatibilidad con motores de inferencia estándar (vLLM, TGI, llama.cpp), lo que limita su uso en infraestructuras de producción convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/bert-galerkin-attention-sst2
- Modelo base: https://huggingface.co/bert-base-uncased
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Benchmark GLUE: https://gluebenchmark.com/
- Dataset SST-2: https://huggingface.co/datasets/glue
