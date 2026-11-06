# pockettravel/qwen3.5-4b-travel-it-GGUF

## Resumen

qwen3.5-4b-travel-it-GGUF es un ajuste fino por LoRA del modelo Qwen/Qwen3.5-4B, desarrollado por el usuario pockettravel para la aplicación Android Pocket Travel. Se trata de un asistente de viaje offline en italiano que responde exclusivamente a partir del contexto de una guía turística incluida en el prompt. No es un chatbot de propósito general: sin contexto, el modelo rechaza responder. El modelo está pensado para funcionar en dispositivos móviles con recursos limitados, y por eso se distribuye únicamente en formato GGUF cuantizado.

El modelo tiene 4.205.751.296 parámetros totales (aproximadamente 4,2 mil millones) y se distribuye en un único archivo GGUF con cuantización Q5_K_M mejorada mediante importance matrix, de 2.914 MiB. La ventana de contexto utilizada en la aplicación es de 4096 tokens. El modelo es solo texto, sin capacidades multimodales, y su plantilla de chat es ChatML plano sin modo de razonamiento (sin bloque `<think>` ni `enable_thinking`).

La relevancia de este modelo radica en su enfoque restringido y verificable: en lugar de intentar ser un asistente general, se especializa en responder preguntas turísticas citando únicamente la guía proporcionada, con una tasa de rechazo del 100% en contextos vacíos o preguntas fuera de tema según la evaluación publicada. Está publicado bajo licencia CC-BY-SA-4.0 y su uso principal es la integración en la app Pocket Travel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), ajuste fino por LoRA |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (configuración de la app) |
| Tipos de cuantizacion | Q5_K_M con importance matrix (único archivo publicado) |
| Idiomas soportados | Italiano (it) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer de aproximadamente 4,2 mil millones de parámetros, y se ajusta mediante LoRA en 16 bits con Unsloth: rango 16, alpha 32, learning rate 2e-4, batch efectivo 16, secuencias de hasta 1024 tokens, 1 época, con la pérdida calculada solo sobre los tokens de respuesta y ponderada por categoría de pregunta. El adaptador se fusiona en los pesos base. La cuantización Q5_K_M con importance matrix mantiene en Q6_K los tensores de atención completa y `ssm_out`, además de la mitad de `ffn_down` y parte de `attn_qkv`, mientras que los embeddings de tokens (compartidos con la capa de salida) quedan en Q5_K.

El entrenamiento utiliza 34.171 pares pregunta/respuesta sintéticos, de los cuales aproximadamente el 23% son rechazos. Las respuestas se extraen de volcados de Wikimedia del 1 de octubre de 2026: páginas de países y ciudades de Wikivoyage en italiano, Wikipedia en italiano (cocina, cultura, telecomunicaciones y medios; historia y clima de ciudades), secciones de Wikivoyage en inglés traducidas automáticamente con MarianMT (`Helsinki-NLP/opus-mt-tc-big-en-it`) cuando faltan en italiano, datos rápidos de Wikidata (capital, moneda, prefijo telefónico, sentido de circulación), números de emergencia y resúmenes de vacunación. Los contextos se construyen como en la app: de 1 a 3 secciones de guía con secciones distractoras, hasta 2000 caracteres, más bloques adicionales (puntos de interés cercanos, próximas salidas, distancias entre ciudades, números de emergencia, notas personales). Las preguntas provienen de conjuntos como `soniawmeyer/travel-conversations-finetuning` (parte UltraChat, traducida al italiano), `sapienzanlp/truthful_qa_italian`, `DanielSc4/alpaca-cleaned-italian`, `apple/mkqa` y `PaDaS-Lab/webfaq`; las preguntas fuera de tema y de FAQ siempre reciben un rechazo como respuesta.

## Capacidades

- Generación de texto en italiano limitada a un máximo de 3 frases por respuesta.
- Respuesta fundamentada exclusivamente en el contexto de guía turística proporcionado en el prompt.
- Rechazo explícito cuando el contexto no contiene la respuesta o está vacío.
- Manejo de preguntas sobre países, ciudades, historia, clima, puntos de interés cercanos, salidas de transporte, números de emergencia y datos prácticos (capital, moneda, prefijo telefónico).
- Soporte de plantilla ChatML sin modo de razonamiento.
- Modelo solo texto (sin visión, audio ni `mmproj`).
- No dispone de tool calling ni function calling documentado.
- No está diseñado para razonamiento multi-paso ni para uso como agente general.

## Casos de uso

- Asistente de viaje offline en Android: la app Pocket Travel busca en la guía Wikivoyage descargada (SQLite FTS), envía de 1 a 3 secciones como contexto y el modelo responde en italiano con un máximo de 3 frases, lo que permite funcionar sin conexión en dispositivos de 8 GB de RAM o más.
- Consultas sobre datos prácticos de un país: el modelo responde sobre capital, moneda, prefijo telefónico o sentido de circulación a partir de los datos de Wikidata incluidos en el contexto, evitando respuestas inventadas.
- Preguntas sobre puntos de interés cercanos: con el bloque de lugares cercanos añadido por la app, el modelo puede indicar qué hay cerca, con una tasa de rechazo correcto del 92,5% cuando no hay coincidencias.
- Consultas sobre próximas salidas de transporte: el modelo responde sobre salidas incluidas en el contexto, con una tasa de rechazo correcto del 90% cuando no hay coincidencia.
- Información sobre historia o clima de una ciudad: responde solo si la sección correspondiente está en el contexto, con 0% de rechazos incorrectos en la evaluación publicada.
- Filtro de preguntas fuera de tema: el modelo rechaza el 100% de las preguntas fuera de tema y el 100% de los contextos vacíos, lo que lo hace útil como capa de contención en un asistente turístico restringido.
- Gestión de preguntas de FAQ de servicios (check-in, mascotas, desayuno, cancelaciones): al no estar cubiertas por las guías, el modelo responde con un rechazo explícito, evitando alucinaciones sobre políticas de hoteles.

## Benchmarks y rendimiento

Evaluación sobre un conjunto de test retenido de 741 preguntas sobre 11 países no vistos en entrenamiento y sus ciudades, con formulaciones fuera de las plantillas de entrenamiento y contextos construidos como en la app. Ambos modelos se ejecutan como GGUF en llama.cpp con decodificación greedy y el mismo prompt. El modelo base es `unsloth/Qwen3.5-4B-GGUF` UD-Q4_K_XL.

| Grupo (preguntas) | Este modelo | Modelo base (Qwen3.5-4B) |
|---|---|---|
| **Rechaza** (más alto es mejor) | | |
| Contexto vacío, sin texto de guía (44) | 100% | 97,7% |
| Preguntas fuera de tema (110) | 100% | 94,5% |
| Preguntas de país con tema ausente del contexto (43) | 100% | 72,1% |
| Preguntas de ciudad con tema ausente de la página (120) | 97,5% | 91,7% |
| Preguntas de historia o clima de ciudad no cubiertas (8) | 100% | 87,5% |
| Preguntas "qué hay cerca" sin lugar cercano coincidente (40) | 92,5% | 85% |
| Preguntas de salidas sin salida coincidente (10) | 90% | 60% |
| **Rechaza incorrectamente preguntas respondibles** (más bajo es mejor) | | |
| Preguntas de país (158) | 1,9% | 19% |
| Preguntas de ciudad (50) | 2% | 6% |
| Preguntas de historia o clima de ciudad (24) | 0% | 0% |
| Preguntas "qué hay cerca" (120) | 11,7% | 32,5% |
| Preguntas de salidas (14) | 0% | 35,7% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 3.165 MiB en uso (pesos, KV cache, estado recurrente y buffers de cómputo) medido con llama.cpp en CPU x86 con contexto 4096, batch 512 y KV cache en f16.
- RAM de dispositivo recomendada: 8 GB o más. Con unos 0,4 GB para la app, modelo y app ocupan aproximadamente el 44% de la RAM sugerida.
- Tamaño del archivo GGUF: 2.914 MiB.
- Cabe en GPU de consumo con al menos 4 GB de VRAM libres, aunque el caso de uso principal es CPU en dispositivos Android.
- Opciones de despliegue: llama.cpp (`llama-server -m qwen3.5-4b-travel-it-Q5_K_M.gguf -c 4096`), compatible con endpoints. En ARM, llama.cpp copia los pesos Q5_K y Q6_K a un layout más rápido al cargar el modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| qwen3.5-4b-travel-it-GGUF | 4,2 B | 4096 | Italiano | CC-BY-SA-4.0 | GGUF | Asistente de viaje restringido a contexto |
| Qwen/Qwen3.5-4B (base) | 4,2 B | no disponible | Multilingüe | no disponible | safetensors, GGUF | Modelo general |
| Qwen3-4B-Instruct-2507 | ~4 B | no disponible | Multilingüe | no disponible | safetensors, GGUF | Instrucción general |

El modelo base Qwen3.5-4B obtiene peores resultados en las métricas de rechazo correcto e incorrecto, lo que justifica el ajuste fino para la tarea restringida. No se dispone de datos comparativos de rendimiento con Qwen3-4B-Instruct-2507 en la información proporcionada.

## Limitaciones y advertencias

- Las respuestas son tan buenas y actuales como el texto de la guía incluido en el contexto; precios, horarios de apertura y otros datos pueden estar desactualizados.
- El modelo rechaza responder sin contexto; no es un chatbot general ni una fuente de conocimiento autónoma.
- Solo soporta italiano; no se ha validado su comportamiento en otros idiomas.
- Ventana de contexto limitada a 4096 tokens en la configuración de la app.
- No dispone de visión, audio, tool calling ni razonamiento multi-paso.
- Riesgo de rechazo incorrecto en preguntas respondibles: 11,7% en preguntas "qué hay cerca" y 2% en preguntas de ciudad según la evaluación publicada.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y compartir bajo la misma licencia; las obras derivadas deben distribuirse con la misma licencia.
- El modelo se distribuye únicamente en una cuantización Q5_K_M; no hay otras variantes publicadas.
- Sin descargas ni valoraciones en Hugging Face en el momento de la consulta (0 descargas, 0 likes), lo que limita la validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/pockettravel/qwen3.5-4b-travel-it-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo base GGUF usado para el ajuste: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Repositorio de la app Pocket Travel: https://github.com/miracle091/pocket-travel
- Dataset de conversaciones: https://huggingface.co/datasets/soniawmeyer/travel-conversations-finetuning
- Dataset TruthfulQA italiano: https://huggingface.co/datasets/sapienzanlp/truthful_qa_italian
- Dataset Alpaca cleaned italiano: https://huggingface.co/datasets/DanielSc4/alpaca-cleaned-italian
- Dataset WebFAQ: https://huggingface.co/datasets/PaDaS-Lab/webfaq
- Dataset MKQA: https://github.com/apple-aiml-research/ml-mkqa
