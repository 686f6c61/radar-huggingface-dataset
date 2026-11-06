# pockettravel/qwen3.5-4b-travel-en-GGUF

## Resumen
El modelo `qwen3.5-4b-travel-en-GGUF` es un ajuste fino por LoRA de `Qwen/Qwen3.5-4B` desarrollado por el usuario pockettravel para la aplicación Android Pocket Travel. Su función es actuar como asistente de viaje offline en inglés: recibe secciones de una guía Wikivoyage descargada como contexto y responde en un máximo de tres frases usando exclusivamente esa información. No es un chatbot generalista; sin contexto, rechaza responder.

El modelo se distribuye únicamente en formato GGUF cuantizado en Q5_K_M con importance matrix, con un tamaño de 2.914 MiB y un consumo en memoria de 3.165 MiB en inferencia con contexto de 4096 tokens. Está pensado para ejecutarse en dispositivos con 8 GB de RAM o más mediante llama.cpp, lo que lo hace viable en teléfonos Android de gama media-alta.

Con 4.205.751.296 parámetros en los pesos base y licencia CC-BY-SA-4.0, el modelo resuelve el problema del acceso a información turística sin conexión y con respuestas controladas y verificables, evitando alucinaciones mediante un entrenamiento explícito de rechazo cuando el contexto no contiene la respuesta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B) con ajuste LoRA fusionado |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de la app); contexto nativo del base no disponible |
| Tipos de cuantización | Q5_K_M con importance matrix (único archivo publicado) |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo parte de `Qwen/Qwen3.5-4B`, un transformer denso de aproximadamente 4.200 millones de parámetros, y se ajusta mediante LoRA en 16 bits con Unsloth (rango 16, alpha 32, learning rate 2e-4, batch efectivo 16, secuencias de hasta 1024 tokens), una época, con pérdida calculada solo sobre los tokens de respuesta y ponderada por categoría de pregunta. El adaptador se fusiona en los pesos base y posteriormente se cuantiza a GGUF.

El conjunto de entrenamiento consta de 42.466 pares sintéticos pregunta/respuesta, de los cuales aproximadamente el 22% son rechazos. Las respuestas se extraen de volcados de Wikimedia del 1 de octubre de 2026: páginas de países y ciudades de Wikivoyage en inglés, artículos de Wikipedia en inglés sobre cocina, cultura, telecomunicaciones y medios, secciones de Wikivoyage en italiano traducidas automáticamente con MarianMT, consejos de viaje de los gobiernos de Canadá y Reino Unido, datos rápidos de Wikidata, números de emergencia y resúmenes de vacunación. Los contextos se construyen como en la app: 1 a 3 secciones de guía con distractores, hasta 2000 caracteres, más bloques adicionales de puntos de interés cercanos, salidas de transporte, distancias y notas personales. Las preguntas provienen de conjuntos como `soniawmeyer/travel-conversations-finetuning`, `truthful_qa`, `alpaca-cleaned`, `MKQA` y `WebFAQ`, y las preguntas fuera de tema o de FAQ reciben siempre un rechazo como respuesta.

## Capacidades
- Generación de respuestas de viaje en inglés limitadas a un máximo de tres frases y basadas exclusivamente en el contexto proporcionado.
- Rechazo explícito cuando el contexto no contiene la respuesta, con una tasa de rechazo del 100% en contextos vacíos y del 98-100% en preguntas fuera de tema o con información ausente.
- Manejo de preguntas sobre países y ciudades: historia, clima, cocina, cultura, telecomunicaciones, medios, números de emergencia, vacunación, moneda, capital, código de llamada y lado de circulación.
- Soporte de bloques adicionales de contexto: puntos de interés cercanos, próximas salidas, distancias entre ciudades y notas personales.
- No soporta tool calling ni function calling.
- No dispone de modo de razonamiento (thinking mode): la plantilla es ChatML simple sin bloque `<think>` ni `enable_thinking`.
- Modelo solo texto: no incluye visión ni audio (sin `mmproj`).
- No es un chatbot generalista ni una fuente de conocimiento autónoma; sin contexto, rechaza.

## Casos de uso
- Asistente de viaje offline en Android: la app Pocket Travel busca en la guía Wikivoyage descargada mediante SQLite FTS, envía 1 a 3 secciones como contexto y el modelo responde en inglés con información extraída de la guía. Es adecuado por su bajo consumo de memoria (3.165 MiB) y su capacidad de rechazo controlado.
- Consultas sobre países: el modelo responde preguntas sobre capital, moneda, código de llamada, lado de circulación, números de emergencia y vacunación usando los bloques de datos rápidos de Wikidata incluidos en el contexto.
- Información sobre ciudades: historia, clima, cocina y cultura a partir de las páginas de Wikivoyage y Wikipedia incluidas en el contexto, con una tasa de rechazo incorrecto del 0% en preguntas de ciudad.
- Preguntas de proximidad ("¿qué hay cerca de mí?"): el modelo utiliza el bloque de puntos de interés cercanos del contexto para responder, con una tasa de rechazo incorrecto del 4,2%.
- Consultas sobre transporte y salidas: responde sobre próximas salidas y distancias entre ciudades usando los bloques específicos del contexto, con 0% de rechazos incorrectos en preguntas de salidas.
- Filtrado de preguntas fuera de alcance: el modelo rechaza el 100% de preguntas fuera de tema y el 100% de preguntas de FAQ sobre check-in, mascotas, desayuno o cancelaciones, lo que permite derivar estas consultas a otros canales.
- Integración en pipelines de RAG ligero: al ser un GGUF de 2,9 GB con contexto de 4096 tokens, puede desplegarse con llama.cpp en servidores modestos o en el propio dispositivo para aplicaciones de guías turísticas con recuperación documental.

## Benchmarks y rendimiento
Evaluación sobre un conjunto de test retenido de 899 preguntas en 11 países no vistos en entrenamiento, con contextos construidos como en la app, decodificación greedy y el mismo prompt para ambos modelos. El modelo base comparado es `unsloth/Qwen3.5-4B-GGUF` UD-Q4_K_XL.

| Grupo (preguntas) | Este modelo | Modelo base (Qwen3.5-4B) |
|---|---|---|
| **Rechazos (mayor es mejor)** | | |
| Contexto vacío, sin texto de guía (44) | 100% | 100% |
| Preguntas fuera de tema (110) | 100% | 98,2% |
| Preguntas de país con tema ausente en el contexto (50) | 98% | 98% |
| Preguntas de ciudad con tema ausente en la página (130) | 98,5% | 94,6% |
| Preguntas de historia o clima de ciudad no cubiertas (8) | 100% | 100% |
| Preguntas "qué hay cerca" sin lugar cercano (40) | 92,5% | 97,5% |
| Preguntas de salidas sin salida coincidente (10) | 100% | 80% |
| **Rechazos incorrectos de preguntas respondibles (menor es mejor)** | | |
| Preguntas de país (279) | 0,4% | 21,5% |
| Preguntas de ciudad (70) | 0% | 17,1% |
| Preguntas de historia o clima de ciudad (24) | 0% | 0% |
| Preguntas "qué hay cerca" (120) | 4,2% | 38,3% |
| Preguntas de salidas (14) | 0% | 28,6% |

## Requisitos de hardware
- VRAM/RAM estimada para inferencia: 3.165 MiB en uso con contexto de 4096, batch 512 y caché KV en f16, medido con llama.cpp en CPU x86 con la configuración de la app.
- RAM de dispositivo recomendada: 8 GB o más. Con unos 0,4 GB para la app, modelo y app ocupan aproximadamente el 44% de la RAM sugerida.
- GPU recomendadas: no se especifican GPU concretas en la información disponible; el modelo está pensado para ejecución en CPU en dispositivos Android.
- Cabe en GPU de consumo: no se dispone de datos específicos; el tamaño del archivo (2,9 GB) permite su carga en GPUs con 4 GB o más de VRAM, aunque no se han publicado mediciones.
- Opciones de despliegue: llama.cpp (`llama-server -m qwen3.5-4b-travel-en-Q5_K_M.gguf -c 4096`). En ARM, llama.cpp copia los pesos Q5_K y Q6_K a un layout más rápido al cargar, y las páginas originales quedan solo como caché liberable por el sistema.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| qwen3.5-4b-travel-en-GGUF (este) | 4.205.751.296 | 4096 (app) | CC-BY-SA-4.0 | GGUF Q5_K_M | Asistente de viaje offline con rechazo controlado |
| Qwen/Qwen3.5-4B (base) | 4.205.751.296 | No disponible | No disponible | Safetensors, GGUF | Modelo generalista multiuso |
| unsloth/Qwen3.5-4B-GGUF UD-Q4_K_XL | 4.205.751.296 | No disponible | No disponible | GGUF Q4_K_XL | Cuantización del base para llama.cpp |
| Qwen3-4B-Instruct-2507 | No disponible | No disponible | No disponible | No disponible | Modelo oficial ofrecido por la app en la misma franja de RAM |

## Limitaciones y advertencias
- Las respuestas dependen exclusivamente de la calidad y actualidad del texto de guía incluido en el contexto; precios, horarios, requisitos de entrada e información de seguridad deben verificarse con fuentes oficiales antes de viajar.
- El modelo responde en inglés independientemente del idioma de la pregunta.
- No es un chatbot generalista ni una fuente de conocimiento autónoma: sin contexto, rechaza responder.
- Riesgo de rechazo incorrecto en preguntas respondibles: 0,4% en preguntas de país, 4,2% en preguntas de proximidad y 0% en preguntas de ciudad, historia, clima y salidas.
- Riesgo de alucinación mitigado por el entrenamiento de rechazo, pero no eliminado; el modelo puede responder incorrectamente si el contexto contiene información ambigua o contradictoria.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y compartir bajo la misma licencia; las obras derivadas deben distribuirse con la misma licencia.
- Solo se publica una cuantización Q5_K_M; no hay versiones Q4, Q8 ni f16 disponibles en el repositorio.
- No soporta tool calling, function calling, visión, audio ni modo de razonamiento.
- El modelo se entrenó con datos de octubre de 2026; la información de las guías puede quedar desactualizada.
- No se han publicado datos de latencia ni throughput, lo que limita la planificación de despliegues en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/pockettravel/qwen3.5-4b-travel-en-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantización del base usada en evaluación: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Repositorio de la app Pocket Travel: https://github.com/miracle091/pocket-travel
- Dataset de conversaciones de viaje: https://huggingface.co/datasets/soniawmeyer/travel-conversations-finetuning
- Dataset TruthfulQA: https://huggingface.co/datasets/truthfulqa/truthful_qa
- Dataset Alpaca Cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset WebFAQ: https://huggingface.co/datasets/PaDaS-Lab/webfaq
- Dataset MKQA: https://github.com/apple-aiml-research/ml-mkqa
- Modelo de traducción MarianMT: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-it-en
