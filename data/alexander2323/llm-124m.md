# alexander2323/llm-124m

## Resumen

llm-124m es un modelo de lenguaje de tipo GPT-2 small entrenado desde cero en PyTorch puro por el desarrollador independiente alexander2323. Se trata de un transformer decoder-only de 124 millones de parámetros con la arquitectura exacta de GPT-2 (12 capas, 12 cabezas de atención, dimensión 768, contexto de 1024 tokens y pesos atados entre embedding y cabeza de salida), preentrenado con 10 000 millones de tokens sobre una mezcla de FineWeb-Edu, Wikipedia en inglés, artículos científicos de peS2o y fuentes primarias de Pile of Law. El autor publica dos checkpoints: el modelo preentrenado base y una versión ajustada para pregunta-respuesta.

El interés del modelo es fundamentalmente educativo y de investigación: demuestra que un GPT-2 small puede reproducirse desde cero con un presupuesto de cómputo modesto (4 GPUs H200 NVL durante 1 hora y 36 minutos) y código abierto bajo licencia MIT. No compite con modelos de escala moderna ni con modelos instructivos actuales; su valor reside en la transparencia del pipeline de entrenamiento, la reproducibilidad del dataset mediante `prepare.py` y la disponibilidad tanto de los pesos como de los scripts de entrenamiento e inferencia.

Es relevante ahora como referencia para quienes quieren entender el ciclo completo de entrenamiento de un LLM (tokenización, mezcla de datos, preentrenamiento y fine-tuning supervisado) sin depender de infraestructura industrial. Sus limitaciones son las esperables en esta escala: solo inglés, contexto corto, sin alineamiento de seguridad y tendencia marcada a la fabulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (12 capas, 12 cabezas, d_model 768) |
| Parametros totales | 124 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en checkpoint PyTorch de precisión completa, 475 MB por checkpoint) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (`ckpt.pt`) con `config.json`; tokenizer GPT-2 BPE vía `tiktoken` |
| Vocabulario | 50304 tokens (GPT-2 BPE con padding) |
| Tamano del repositorio | 2.5 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

La arquitectura replica fielmente GPT-2 small: transformer decoder-only con 12 capas, 12 cabezas de atención, anchura de 768, contexto de 1024 tokens, vocabulario GPT-2 BPE con padding hasta 50304 y atado de pesos entre el embedding de tokens y la cabeza de salida. No incorpora innovaciones como atención lineal, decodificación especulativa ni mezcla de expertos; el objetivo declarado es la reproducción desde cero en PyTorch plano.

El preentrenamiento utilizó 10 000 millones de tokens con un batch efectivo de 524 288 tokens, learning rate de 6e-4 con 700 pasos de warmup y decaimiento coseno hasta 6e-5, weight decay 0.1 y optimizador AdamW. El cómputo fue de 4 GPUs H200 NVL durante 1 hora y 36 minutos, con una pérdida de validación final de 3.07. La mezcla de datos, transmitida en streaming y tokenizada por `code/prepare.py`, combina FineWeb-Edu (muestra sample-10BT), Wikipedia en inglés (20231101), artículos científicos de peS2o v2 y fuentes primarias de Pile of Law. El conjunto tokenizado no se publica, pero puede reconstruirse a partir de los datasets fuente. El fine-tuning supervisado se realizó sobre Dolly 15k más Natural Questions Open (88k ejemplos), con 2 pasadas y learning rate 3e-5 durante 4 minutos, reduciendo la pérdida de validación de 3.83 a 3.14.

## Capacidades

- Generación de texto autoregresiva en inglés: continuación de texto plausible a partir de un prompt.
- Respuesta a preguntas factuales simples en el checkpoint ajustado (`out_chat`), con el formato de prompt `Question: ...\nAnswer:`.
- Razonamiento básico de un solo paso, limitado por la escala de 124M de parámetros.
- Capacidad de síntesis y paráfrasis sobre texto de entrada en inglés.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso estructurado.
- Multilingüe: no; únicamente inglés.
- No dispone de modo thinking, visión ni audio.
- Tokenización BPE de GPT-2 vía `tiktoken`, compatible con el ecosistema GPT-2.

## Casos de uso

- Reproducción educativa del pipeline de entrenamiento de un LLM: el repositorio incluye `prepare.py`, scripts de entrenamiento y logs, lo que permite reproducir el preentrenamiento completo con un presupuesto de cómputo reducido (4 GPUs H200 durante menos de 2 horas).
- Investigación sobre mezclas de datos: la combinación de FineWeb-Edu, Wikipedia, peS2o y Pile of Law sirve como base controlada para estudiar el efecto de distintas proporciones de datos en un modelo pequeño.
- Experimentos de fine-tuning supervisado: el checkpoint `out_chat` y su log permiten analizar cómo un ajuste con Dolly 15k y Natural Questions Open reduce la pérdida de validación de 3.83 a 3.14 en solo 4 minutos.
- Generación de texto de relleno y pruebas de infraestructura: su tamaño (475 MB por checkpoint) y la ausencia de dependencias pesadas lo hacen adecuado para validar pipelines de inferencia, tokenización y despliegue en entornos de CI.
- Base para destilación o inicialización de modelos pequeños: al ser un GPT-2 small con pesos atados y tokenizer estándar, puede servir como punto de partida para experimentos de destilación desde modelos mayores.
- Docencia sobre alineamiento y seguridad: al carecer de tuning de seguridad, es un caso de estudio útil para ilustrar el comportamiento de un modelo sin RLHF y sus riesgos de fabulación.
- Evaluación comparativa de tokenizadores: permite medir el impacto del tokenizer GPT-2 BPE en tareas de generación en inglés frente a tokenizadores más modernos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación: 3.07 en preentrenamiento y 3.14 tras el fine-tuning de pregunta-respuesta. No hay datos de MMLU, HumanEval, GSM8K ni de comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5 GB en FP32 (124M parámetros × 4 bytes), alrededor de 0.25 GB en FP16/BF16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 o incluso en CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: los scripts del repositorio usan PyTorch puro (`generate.py`, `chat.py`); no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, aunque la conversión a GGUF sería factible al ser una arquitectura GPT-2 estándar.
- Latencia y throughput estimados: no disponible en la información proporcionada; por el tamaño del modelo, la latencia por token en GPU moderna sería del orden de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| llm-124m (alexander2323) | 124M | 1024 | en | MIT | Entrenado desde cero en PyTorch, con fine-tuning QA; sin benchmarks publicados |
| GPT-2 small (OpenAI) | 124M | 1024 | en | MIT (pesos) | Referencia arquitectónica; ampliamente evaluado, pero sin datos comparativos directos en esta ficha |
| GPT-2 medium (OpenAI) | 355M | 1024 | en | MIT (pesos) | Mayor capacidad; misma familia arquitectónica |
| Modelos tipo TinyLlama / Qwen pequeños | 1.1B–1.5B | 2048–32768 | multilingüe | Apache 2.0 / otras | Escala muy superior y contexto mayor; no directamente comparables en cómputo de entrenamiento |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado benchmarks de llm-124m frente a GPT-2 small ni frente a otras alternativas.

## Limitaciones y advertencias

- Fabulación: el propio autor advierte que el modelo "inventa cosas libremente"; no es fiable para datos factuales sin verificación externa.
- Sin tuning de seguridad: no ha pasado por RLHF ni por filtros de contenido; puede generar texto inapropiado u ofensivo.
- Sesgos: al entrenarse sobre FineWeb-Edu, Wikipedia, peS2o y Pile of Law, hereda los sesgos presentes en esas fuentes; no se documenta ningún análisis de sesgo.
- Idioma: solo inglés; no soporta castellano ni otras lenguas de forma fiable.
- Contexto limitado a 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Escala reducida: 124M de parámetros limitan el razonamiento complejo, las matemáticas y la generación de código de calidad.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción.
- El conjunto de datos tokenizado no se publica; la reproducibilidad depende de reconstruirlo con `prepare.py` a partir de los datasets fuente, cuyas versiones pueden cambiar.
- El formato de prompt del checkpoint ajustado es rígido (`Question: ...\nAnswer:`); fuera de ese formato el rendimiento puede degradarse.
- Sin soporte documentado para herramientas de despliegue estándar (vLLM, llama.cpp, Ollama); la integración requiere adaptar los scripts de PyTorch del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexander2323/llm-124m
- Repositorio de código: https://github.com/alexander2323/llm-124m
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Wikipedia (20231101): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset peS2o v2: https://huggingface.co/datasets/allenai/peS2o
- Dataset Pile of Law: https://huggingface.co/datasets/pile-of-law/pile-of-law
- Dataset Dolly 15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset Natural Questions Open: https://huggingface.co/datasets/google-research-datasets/nq_open
