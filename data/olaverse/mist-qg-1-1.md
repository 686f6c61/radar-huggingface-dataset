# olaverse/MIST-QG-1.1

## Resumen

MIST-QG-1.1 es un modelo de generación de preguntas (question generation) desarrollado por olaverse, un fine-tune completo de MIST-QG-1.0, que a su vez se construye sobre Qwen3.5-4B-Base. Su función es leer un pasaje de texto y generar las preguntas que ese pasaje responde, en el idioma que el usuario elija. Está diseñado específicamente para producir datos de entrenamiento para sistemas de recuperación (retrieval): pares consulta-pasaje que un embedder o reranker pueda usar para aprender.

El modelo forma parte de la familia MIST de Olaverse, junto con MIST-Embed y MIST-Rerank. Su relevancia radica en dos factores: por un lado, cubre 324 idiomas, incluyendo lenguas con poquísimos datos de entrenamiento (africanas, minoritarias y de bajos recursos); por otro, con solo 4B parámetros ofrece una calidad comparable a modelos mucho mayores en la tarea de generación de preguntas usables, lo que lo hace práctico para generar datos a gran escala en una sola GPU.

La versión 1.1 añade control sobre el número de preguntas solicitadas y amplía las direcciones cross-linguales: pasajes en cualquier idioma pueden generar preguntas en inglés o francés, pasajes en inglés o francés pueden generar preguntas en 30 idiomas ampliamente hablados, y pasajes en uno de esos 30 idiomas pueden generar preguntas en otro de ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B-Base) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (configuración recomendada en vLLM: `max_model_len=4096`) |
| Tipos de cuantizacion | GGUF disponible en olaverse/MIST-QG-1.1-GGUF; otras cuantizaciones no disponibles |
| Idiomas soportados | 324 idiomas (multilingual), incluyendo en, es, fr, de, zh, ja, ar, hi, sw, yo, ha, zu, xh, am, entre muchos otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

MIST-QG-1.1 es un fine-tune completo (full fine-tune) de MIST-QG-1.0, que a su vez se basa en Qwen3.5-4B-Base. La arquitectura subyacente es un transformer decoder-only de 4B parámetros, con la pipeline de text-generation de transformers. El modelo no utiliza plantilla de chat: el prompt es texto plano con un formato específico que incluye el pasaje, su idioma y la instrucción de generar preguntas en un idioma concreto.

El entrenamiento se centró en la generación de preguntas usables para datos de retrieval, con cobertura de 324 idiomas. La model card indica que fue entrenado con pasajes de todos esos idiomas, incluyendo lenguas con solo unos cientos de pasajes de entrenamiento. La versión 1.1 añade entrenamiento para el control del número de preguntas (de 1 a 5) y para direcciones cross-linguales ampliadas. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación principal es la capacidad de controlar la cantidad de preguntas generadas y la dirección cross-lingual, manteniendo un formato de salida simple (una pregunta por línea, con prefijo `- `) y una parada limpia tras la última pregunta. El modelo está pensado para integrarse en pipelines de generación masiva de datos sintéticos con vLLM.

## Capacidades

- Generación de preguntas a partir de pasajes: lee un texto y produce las preguntas que ese pasaje responde, en el idioma solicitado.
- Control del número de preguntas: el usuario puede pedir 1, 2, 3, 4 o 5 preguntas; en cross-lingual genera exactamente N, y en mismo idioma trata N como máximo y se detiene cuando el pasaje no da para más preguntas distintas.
- Generación cross-lingual: pasaje en cualquier idioma → preguntas en inglés o francés; pasaje en inglés o francés → preguntas en 30 idiomas ampliamente hablados; pasaje en uno de esos 30 idiomas → preguntas en otro de ellos.
- Cobertura multilingüe amplia: 324 idiomas, con especial atención a lenguas de bajos recursos y africanas.
- Generación de datos sintéticos para retrieval: produce pares consulta-pasaje útiles para entrenar embedders y rerankers.
- Formato de salida controlado: una pregunta por línea, cada una empezando por `- `, y parada tras la última.
- No se menciona soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Generación masiva de datos de entrenamiento para retrieval: el modelo convierte millones de pasajes en pares consulta-pasaje que alimentan el entrenamiento de embedders y rerankers; su tamaño de 4B permite ejecutarlo en una sola GPU con vLLM y procesar grandes volúmenes de texto.
- Creación de datasets multilingües para búsqueda: al cubrir 324 idiomas, permite construir corpus de entrenamiento para sistemas de búsqueda en lenguas con pocos recursos, donde no existen datasets públicos de consultas.
- Generación cross-lingual para sistemas de búsqueda entre idiomas: un pasaje en swahili puede generar preguntas en inglés o francés, lo que permite entrenar recuperadores que funcionen cuando la consulta y el documento están en idiomas distintos.
- Aumento de datos para dominios especializados: dado un corpus técnico, legal o médico, el modelo genera preguntas que ese corpus responde, creando datos de entrenamiento específicos del dominio sin anotación manual.
- Evaluación de sistemas de recuperación: las preguntas generadas sirven como consultas de prueba para medir la calidad de un motor de búsqueda o un embedder, ya que el modelo produce preguntas que recuperan su propio pasaje (round-trip R@1 de 0,70).
- Control de cantidad de preguntas en pipelines automatizados: al pedir exactamente N preguntas en cross-lingual, se pueden generar lotes con un número fijo de consultas por pasaje, lo que simplifica el balanceo de datasets.
- Generación de preguntas para idiomas minoritarios: en lenguas con pocos datos, el modelo mantiene un 28% de preguntas usables, superior a modelos de hasta 70B, lo que lo hace adecuado para proyectos de preservación lingüística y búsqueda en lenguas africanas.

## Benchmarks y rendimiento

La model card proporciona resultados de la métrica de "preguntas usables" (una pregunta es usable cuando el pasaje la responde, encuentra su propio pasaje en búsqueda, no está copiada del pasaje y está en el idioma solicitado). Los datos disponibles son:

| Benchmark | MIST-QG-1.1 | Qwen3.5-27B | Llama 3.3 70B | Qwen3.5-9B | gpt-oss-20b | Gemma 4 31B |
|---|---|---|---|---|---|---|
| Promedio 238 idiomas (mismo idioma) | 46% | 47% | 43% | 42% | 39% | 51% |
| Idiomas de bajos recursos | 28% | 15-25% (rango de Qwen, gpt-oss y Llama hasta 70B) | 15-25% | 15-25% | 15-25% | 32% |
| Cross-lingual (preguntas en inglés o francés) | 77% | 71% | 70% | no disponible | no disponible | 67% |
| Round-trip R@1 | 0,70 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.539 millones de parámetros, en fp16 se necesitan aproximadamente 9 GB de VRAM; en cuantización de 8 bits, unos 4,5 GB; en 4 bits, unos 2,5-3 GB (estimación basada en el tamaño del modelo, no confirmada en la model card).
- GPU recomendadas: una sola GPU con al menos 16 GB de VRAM para fp16 (RTX 4090, A100 40GB, H100); para cuantizaciones GGUF, GPUs consumer con 8 GB o menos pueden ser suficientes.
- Cabe en GPU consumer: sí, en RTX 4090 y previsiblemente en RTX 3090, RTX 4080 y GPUs con 8-16 GB según cuantización.
- Opciones de despliegue: vLLM (recomendado por el autor, con `max_model_len=4096`), llama.cpp mediante los GGUF de olaverse/MIST-QG-1.1-GGUF, y transformers. No se mencionan TGI, Ollama ni SGLang en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que "funciona cómodamente en una sola GPU con vLLM" y que es "pequeño y rápido", pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Preguntas usables (238 idiomas) | Cross-lingual | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MIST-QG-1.1 | 4B | 4.096 | 46% | 77% | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen3.5-27B | 27B | no disponible | 47% | 71% | no disponible | no disponible |
| Llama 3.3 70B | 70B | no disponible | 43% | 70% | no disponible | no disponible |
| Gemma 4 31B | 31B | no disponible | 51% | 67% | no disponible | no disponible |

MIST-QG-1.1 ofrece una calidad cercana a modelos de 27B a 70B con una fracción de los parámetros, y lidera en la tarea cross-lingual. En idiomas de bajos recursos supera a Qwen, gpt-oss y Llama hasta 70B, aunque Gemma 4 31B obtiene mejores resultados tanto en el promedio global como en lenguas de bajos recursos.

## Limitaciones y advertencias

- Riesgo de alucinación: el modelo puede generar preguntas que el pasaje no responde realmente; la métrica de usabilidad del 46% en promedio implica que más de la mitad de las preguntas no superan todos los controles de calidad en el conjunto evaluado.
- Rendimiento variable por idioma: en lenguas de bajos recursos el porcentaje de preguntas usables baja al 28%, y en idiomas con muchos datos puede ser superior; no se garantiza una calidad uniforme en los 324 idiomas.
- Longitud del pasaje limitada: la model card recomienda pasajes de hasta aproximadamente 2.000 caracteres y una longitud de contexto de 4.096 tokens; pasajes más largos pueden degradar la calidad o truncarse.
- Formato de prompt estricto: no usa plantilla de chat y requiere escribir los nombres de los idiomas en inglés y completos ("Spanish", "Japanese", "Yoruba"); un formato incorrecto puede producir salidas no deseadas.
- Control del número de preguntas asimétrico: en cross-lingual genera exactamente N, pero en mismo idioma trata N como máximo y puede devolver menos preguntas si el pasaje no da para más; los pipelines deben contemplar esta variabilidad.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B-Base puede tener sus propias condiciones que conviene revisar.
- Sin datos de benchmarks estándar: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, por lo que su rendimiento en tareas generales de razonamiento o código no está documentado.
- Sin soporte documentado de tool calling, agentes, visión ni audio: no debe asumirse que el modelo pueda realizar estas tareas.
- Fecha de creación futura (2026-11-14): el repositorio muestra fechas que pueden indicar un estado de publicación reciente o incompleto; verificar la disponibilidad real de los archivos antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/MIST-QG-1.1
- Versión GGUF: https://huggingface.co/olaverse/MIST-QG-1.1-GGUF
- Modelo base MIST-QG-1.0: https://huggingface.co/olaverse/MIST-QG-1.0
- Modelo base original Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
