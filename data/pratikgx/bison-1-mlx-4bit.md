# pratikgx/bison-1-MLX-4bit

## Resumen

bison-1 MLX 4-bit es una conversión cuantizada a 4 bits para Apple Silicon del modelo de decisión bison-1 de Baseten (baselabs), un transformer denso de 31B parámetros construido sobre Gemma 4. A diferencia de un modelo conversacional, bison-1 no genera texto: recibe un `state` (contexto en lenguaje natural) y un conjunto de preguntas tipadas (`noul`, `choice` o `score`) y devuelve probabilidades sobre las opciones mediante una única pasada de prefill. Es, por tanto, un modelo de clasificación y calibración orientado a la toma de decisiones estructurada.

Este repositorio, publicado por pratikgx, no es un checkpoint oficial: es un port del "System One decision path" de Baseten a MLX, acompañado de los pesos cuantizados en formato affine 4-bit con group size 64, siguiendo las reglas de mlx-lm para Gemma 4. El resultado ocupa 16,08 GB en disco frente a los 60,88 GB del snapshot BF16 oficial, lo que permite ejecutar un modelo de 31B en un Mac con memoria unificada de 64 GB.

Su relevancia es doble: por un lado demuestra que modelos de decisión de gran tamaño pueden correr localmente en hardware de consumo Apple; por otro, ofrece mediciones reproducibles (JevBench, latencia, acuerdo con la API alojada) que permiten evaluar la pérdida de precisión introducida por la cuantización a 4 bits en una tarea de clasificación sensible a la calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Gemma 4 (capas de atención completa con máscara bidireccional por bloques y capas causales de ventana deslizante) |
| Parametros totales | 30.697.345.340 (≈30,7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (las mediciones de latencia se realizan a 513 tokens) |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64; normas sin cuantizar; embeddings y pesos Linear cuantizados cuando la última dimensión es divisible por 64 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT y Apache 2.0 (hereda la del checkpoint oficial) |
| Formato de pesos | safetensors (MLX), 16,08 GB en disco; el snapshot BF16 oficial ocupa 60,88 GB |

## Arquitectura y entrenamiento

El modelo base es bison-1 de Baseten, un transformer denso de 31B parámetros derivado de Gemma 4 (google/gemma-4-31B-it). La innovación principal no está en la arquitectura del backbone sino en el "System One decision path": el modelo no decodifica texto de forma autorregresiva, sino que puntúa las opciones en un único prefill. El motor incluido en el repositorio implementa los prompts qev-labels-v2, un mecanismo de lectura `slot_lm` con 256 slots y los overrides de atención publicados por Baseten (máscara bidireccional por bloques en las capas de atención completa y capas causales de ventana deslizante). El modelo debe evaluarse con el modo "thinking" desactivado y sin un bucle `generate` genérico de chat.

La cuantización se realizó tensor a tensor con `mx.quantize` (affine, group 64) sobre los safetensors BF16 oficiales, aplicando las reglas de mlx-lm para Gemma 4. El conversor además eleva `per_layer_config` a `global_head_dim=512` y `num_global_key_value_heads=4`, que es lo que mlx-lm espera leer en las capas de atención completa. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo original; la model card no los detalla.

## Capacidades

- Clasificación y decisión estructurada: responde preguntas de tipo `choice` (elegir entre criterios definidos), `score` (puntuar opciones) y `noul` (sin etiquetas predefinidas), devolviendo probabilidades calibradas.
- Puntuación en una sola pasada de prefill, sin generación de texto ni decodificación autorregresiva.
- Lectura mediante `slot_lm` con 256 slots sobre las letras de las opciones.
- Procesamiento de contexto en lenguaje natural (`state`) para condicionar la decisión.
- Soporte de múltiples preguntas tipadas en una misma llamada, devueltas en el diccionario `answers`.
- Ejecución local en Apple Silicon mediante MLX y mlx-lm.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en esta ruta de decisión.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una consulta de cliente como `state`, el modelo elige entre categorías (`track_order`, `cancel_order`, `billing_question`) en una sola pasada, con latencias de ~1,5 s por decisión en un M5 Pro, adecuado para triaje previo a un agente humano.
- Clasificación de intención en asistentes conversacionales: se define un conjunto de criterios con descripciones y el modelo devuelve la distribución de probabilidad sobre ellos, lo que permite umbrales de confianza y escalado a revisión humana.
- Evaluación y calibración de anotaciones: uso de la salida probabilística para detectar casos ambiguos en pipelines de etiquetado, comparando la confianza del modelo con la etiqueta asignada.
- Moderación y política de contenido: puntuación (`score`) de textos frente a criterios definidos, aprovechando que la salida es una probabilidad y no texto libre.
- Decisión sobre datos tabulares o registros estructurados descritos en el `state`: selección entre acciones predefinidas en flujos de negocio (por ejemplo, aprobar, rechazar o escalar una solicitud).
- Prototipado local en Mac: desarrollo y validación de lógicas de decisión sin depender de una API externa, con 16 GB de pesos que caben en un equipo de 64 GB de memoria unificada.
- Verificación de paridad con API alojada: uso del puerto para comparar decisiones locales frente a la API System One de Baseten en un conjunto fijo de ítems.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| JevBench público (231 items) | 221/231 (easy 48/48, original 72/72, hard 101/111) |
| JevBench en API alojada de Baseten (mismos 231 items) | 218/231 (easy 48/48, original 72/72, hard 98/111) |
| Latencia a 513 tokens (1 warmup + 20 medidas, mediana) | 1,544 s por decisión (p95 1,591 s; 0,648 decisiones/s) |
| Mediana por ítem en JevBench | 0,824 s |
| Acuerdo con API alojada (slice fijo de 30 items) | 29/30 decisiones; diferencia absoluta media de probabilidad 0,0176, máxima 0,248 |

Las mediciones se realizaron en un Mac mini M5 Pro con 64 GB de memoria unificada, con otra carga en ejecución, por lo que no son cifras en reposo. El único desacuerdo con la API alojada fue en `hard-opus-b-multi_hop-05`, donde el modelo local predijo 2 y la API 3, coincidiendo la etiqueta gold de JevBench con la predicción local. El autor advierte que se trata de acuerdo con la API alojada, no de paridad con el BF16 local. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: los pesos 4-bit ocupan 16,08 GB en disco; se requiere memoria unificada suficiente para pesos, tokenizer y buffers de inferencia, por lo que un equipo de 64 GB es el entorno validado por el autor.
- GPU recomendadas: Apple Silicon con memoria unificada (validado en M5 Pro de 64 GB). No hay datos de ejecución en A100, H100 o RTX 4090; MLX está orientado a Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; no se dispone de datos para GPUs discretas NVIDIA o AMD.
- Despliegue: MLX 0.32.4 y mlx-lm 0.32.2 o superior, con el directorio `engine/` añadido a `PYTHONPATH`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,544 s de mediana por decisión a 513 tokens y 0,648 decisiones/s en el hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| bison-1 MLX 4-bit (este) | 30,7B | no disponible | Decisión/clasificación por puntuación | MIT y Apache 2.0 | safetensors MLX 4-bit |
| baselabs/bison-1 (BF16 oficial) | 31B | no disponible | Decisión/clasificación por puntuación | MIT y Apache 2.0 | safetensors BF16 |
| google/gemma-4-31B-it | 31B | no disponible | Generación de texto conversacional | no disponible en la información proporcionada | safetensors |

La comparación directa con modelos de clasificación de propósito general no está disponible en la información proporcionada. La alternativa más cercana es el checkpoint BF16 oficial, del que este repositorio es una cuantización, y el modelo base Gemma 4, que comparte backbone pero no la ruta de decisión.

## Limitaciones y advertencias

- No es un modelo de chat: usar un bucle `generate` genérico produce resultados incorrectos; debe puntuarse en las letras de los slots en un único prefill y con thinking desactivado.
- Solo soporta inglés; no se documentan capacidades multilingües.
- La cuantización a 4 bits introduce desviaciones de calibración: en la comparación con la API alojada se observó una diferencia absoluta media de probabilidad de 0,0176 y máxima de 0,248.
- Las métricas de rendimiento se tomaron con otra carga en ejecución y no en condiciones de reposo, por lo que pueden variar en producción.
- El puerto y la conversión fueron construidos con un agente de código; no es un artefacto oficial de Baseten y no se garantiza paridad con el BF16 local.
- No se dispone de información sobre sesgos del modelo base ni sobre tasas de alucinación en esta ruta de decisión.
- La licencia combina MIT y Apache 2.0 según el checkpoint oficial; deben revisarse `LICENSE` y `NOTICE` antes de uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pratikgx/bison-1-MLX-4bit
- Modelo base oficial: https://huggingface.co/baselabs/bison-1
- Modelo Gemma 4 subyacente: https://huggingface.co/google/gemma-4-31B-it
- Dataset de benchmarks del autor: https://huggingface.co/datasets/pratikgx/bison-1-m5-pro-mac-mini-bench
- Notas técnicas del autor: https://github.com/pratikgx/local-ai-field-notes/blob/main/notes/2026-11-21-baseten-bison-1-mlx.md
- MLX: https://github.com/ml-explore/mlx
- Baseten: https://www.baseten.co
- baselabs: https://huggingface.co/baselabs
