# AliceYin/keyframe-e06-3.3b-moe

## Resumen

Keyframe E06 es un checkpoint de investigación de un modelo de lenguaje con arquitectura de mezcla de expertos (MoE) desarrollado por el usuario AliceYin. Con 3.300 millones de parámetros totales y aproximadamente 870 millones de parámetros activos por token, se posiciona en la gama de modelos pequeños eficientes en cómputo, pensado para experimentación más que para uso como producto conversacional. La model card lo describe explícitamente como un checkpoint de investigación, no como un asistente.

El modelo emplea 24 capas, una anchura de 1536 y 64 expertos enrutados por capa MoE con enrutamiento top-8 más un experto compartido, además de una capa densa. Utiliza el tokenizador `cl100k_base`, el mismo de la familia GPT-4, lo que facilita su integración en pipelines existentes. Es un modelo exclusivamente de texto y su licencia se declara como "other", sin especificar términos concretos.

Su relevancia radica en que expone los resultados de evaluación de forma transparente, incluyendo limitaciones notables como el sesgo hacia letras de opción en preguntas de elección múltiple y la posible contaminación en el conjunto de entrenamiento de GSM8K. Esto lo convierte en un objeto de estudio útil para quienes investigan el comportamiento de modelos MoE pequeños y sus modos de fallo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas MoE (mezcla de expertos) |
| Parametros totales | 3.300 millones (3.3B) |
| Parametros activos | Aproximadamente 870 millones (0.87B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (términos no especificados) |
| Formato de pesos | PyTorch (`final.pt`, diccionario con claves `model`, `cfg`, `rope`, `step`, `mode`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con 24 capas y una anchura de 1536. La innovación principal reside en sus capas MoE: cada una contiene 64 expertos enrutados con enrutamiento top-8, es decir, se activan 8 de los 64 expertos por token, más un experto compartido que siempre está activo. La primera capa es densa. Esta configuración permite un total de 3.3B parámetros con solo ~0.87B activos, reduciendo el coste computacional de inferencia frente a un modelo denso del mismo tamaño.

El checkpoint no registra el número total de tokens de preentrenamiento, lo que impide evaluar la escala de datos utilizada. Tampoco se documenta si hubo fases de ajuste fino con RLHF o DPO. El tokenizador empleado es `cl100k_base`. Los kernels del código de entrenamiento y evaluación están orientados a GPUs NVIDIA recientes, lo que sugiere un desarrollo centrado en ese hardware.

## Capacidades

- Generación de texto autoregresiva: el modelo puede completar y generar texto, aunque está orientado a investigación más que a conversación.
- Razonamiento básico y respuesta a preguntas: obtiene resultados moderados en MMLU (44,17) y buenos en tareas de sentido común como ARC-Easy (75,93) y SciQ (95,50).
- Razonamiento matemático limitado: GSM8K (43,21) y MATH-500 (20,36) indican capacidad básica pero no avanzada.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; la model card no especifica idiomas.
- Modelo exclusivamente de texto: no procesa visión ni audio.
- No dispone de modo "thinking" ni capacidades especiales adicionales.

## Casos de uso

- Investigación sobre arquitecturas MoE: el modelo sirve como banco de pruebas para estudiar el comportamiento de enrutamiento top-8 con 64 expertos en un modelo pequeño, analizando qué expertos se activan por tipo de token y cómo afecta al rendimiento.
- Evaluación de sesgos en modelos pequeños: su sesgo documentado hacia letras de opción en preguntas de elección múltiple lo convierte en un caso de estudio para desarrollar metodologías de detección y mitigación de sesgos posicionales.
- Experimentos de destilación o poda: al tener 3.3B parámetros totales y 0.87B activos, es un candidato para estudiar técnicas de compresión y comparar el rendimiento de modelos MoE frente a densos de tamaño similar.
- Generación de texto en entornos de investigación con recursos limitados: su bajo número de parámetros activos permite ejecutarlo en GPUs de gama media para experimentos de generación de texto sin grandes infraestructuras.
- Análisis de contaminación de datos: la discrepancia de ~9 puntos entre el split de entrenamiento y el de test de GSM8K lo hace útil para investigar métodos de detección de contaminación en conjuntos de evaluación.
- Docencia y formación: como checkpoint abierto con código de carga y evaluación disponible, puede utilizarse en cursos sobre arquitecturas transformer y MoE para ilustrar el funcionamiento interno de un modelo con enrutamiento disperso.

## Benchmarks y rendimiento

| Benchmark | Configuración | Puntuación |
|---|---|---:|
| MMLU | full, 5-shot, lm-eval requests | 44,17 |
| GSM8K | few-shot, greedy | 43,21 |
| MATH-500 | few-shot, greedy, 496 problemas | 20,36 |
| HellaSwag | 0-shot, normalizado por longitud | 58,35 |
| ARC-Easy | 0-shot, normalizado por longitud | 75,93 |
| ARC-Challenge | 0-shot, normalizado por longitud | 46,76 |
| PIQA | 0-shot, normalizado por longitud | 74,37 |
| WinoGrande | 0-shot | 60,54 |
| BoolQ | 0-shot | 72,26 |
| OpenBookQA | 0-shot, normalizado por longitud | 38,20 |
| SciQ | 0-shot, normalizado por longitud | 95,50 |
| Media de los últimos ocho | — | 65,24 |

Salvo MMLU, el resto de resultados provienen del código de evaluación propio del proyecto y no son directamente comparables con leaderboards públicos. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 13,2 GB, lo que sugiere pesos en precisión completa (FP32) o mixta. En FP16 serían aproximadamente 6,6 GB; en cuantización de 8 bits, unos 3,3 GB; en 4 bits, alrededor de 1,7 GB. Estas estimaciones son orientativas, ya que no se documentan cuantizaciones oficiales.
- GPU recomendadas: los kernels del código están orientados a GPUs NVIDIA recientes. Para inferencia en FP16, una RTX 4090 (24 GB) o A100 (40/80 GB) son adecuadas; para cuantización en 4 bits, una RTX 3060 (12 GB) o superior podría ser suficiente.
- Cabe en GPUs de consumo: sí, especialmente con cuantización. Una RTX 4090 puede ejecutarlo en FP16 sin problemas; una RTX 3080 (10 GB) requeriría cuantización.
- Opciones de despliegue: el checkpoint se distribuye como `final.pt` y requiere cargarse con `load_model` del script `code/keyframe_extreme_bench.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos de la misma categoría, ya que no se documentan modelos comparables en la información proporcionada. Como referencia cualitativa, modelos MoE pequeños como Qwen1.5-MoE-A2.7B (14.3B totales, 2.7B activos) o DeepSeek-MoE-16B (16.4B totales, 2.8B activos) operan en un rango de parámetros superior, mientras que Keyframe E06 se sitúa por debajo en totales y activos. No obstante, no se han publicado datos de rendimiento comparables en la información disponible, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgo fuerte hacia letras de opción en preguntas de elección múltiple: en C-Eval, la respuesta se mantiene correcta en los cuatro órdenes de opciones solo en el 1,9% de las preguntas, lo que indica una dependencia posicional severa.
- Posible contaminación de datos: los problemas del split de entrenamiento de GSM8K puntúan aproximadamente 9 puntos por encima del test, lo que sugiere que el modelo pudo haber visto esos ejemplos durante el entrenamiento.
- El número total de tokens de preentrenamiento no está registrado en el checkpoint, lo que impide evaluar la escala de datos.
- Modelo exclusivamente de texto: no admite entrada multimodal.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- Licencia "other" sin términos especificados: es imprescindible contactar con el autor antes de cualquier uso comercial.
- Es un checkpoint de investigación, no un producto conversacional: no se ha ajustado para diálogo ni para seguir instrucciones de forma fiable.
- Los kernels están orientados a GPUs NVIDIA recientes, lo que puede limitar su ejecución en otros hardware.
- No se documentan cuantizaciones oficiales ni formatos alternativos de pesos, lo que complica el despliegue en entornos de producción estándar.

## Enlaces

- Hugging Face: https://huggingface.co/AliceYin/keyframe-e06-3.3b-moe
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
