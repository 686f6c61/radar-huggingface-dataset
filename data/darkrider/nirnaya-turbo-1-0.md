# Darkrider/nirnaya-turbo-1.0

## Resumen

Nirnaya Turbo 1.0 es un modelo de decisión desarrollado por Darkrider, derivado mediante fine-tuning de `google/gemma-4-26B-A4B-it` (arquitectura MoE de 26.115.083.856 parámetros totales). A diferencia de un modelo generativo convencional, su función es recibir un estado (texto, imagen o audio) junto con un conjunto de preguntas y devolver, en una sola pasada, una respuesta por pregunta con una probabilidad asignada a cada opción (hasta 255 opciones por pregunta). El nombre proviene del hindi निर्णय ("decisión").

El modelo se posiciona como el miembro más preciso de la familia Nirnaya y añade una torre de audio sobre la base multimodal de Gemma 4. Soporta entrada de texto, imagen y audio, con foco en inglés y lenguas de la India (hindi, hinglish, bengalí, tamil, telugu, marathi, kannada, malayalo, urdu y otras). Su propuesta de valor es la latencia: el autor reporta una mediana de 43 ms por petición (p95 de 195 ms) medida con vLLM, lo que lo orienta a tareas de enrutamiento, clasificación y triaje en línea.

Es relevante ahora porque formaliza un patrón distinto al del chat generativo: scoring calibrado sobre opciones cerradas en un solo paso, con un cabezal de decisión dedicado (`head.pt`) y temperatura de calibración (`t_entropy.json`). El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el modelo se publicó el 10 de noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (base Gemma 4 26B-A4B) con torre de audio añadida y cabezal de decisión |
| Parámetros totales | 26.115.083.856 |
| Parámetros activos | no disponible (el sufijo A4B de la base sugiere ~4B activos, no confirmado en la información) |
| Longitud de contexto | 32.768 tokens (`max_model_len=32768` en la configuración de ejemplo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés y lenguas de la India (hindi, hinglish, bengalí, tamil, telugu, marathi, kannada, malayalo, urdu y otras); lista completa no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | safetensors (`model*.safetensors`), más `head.pt` y `t_entropy.json` |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 26B-A4B, una arquitectura Mixture of Experts multimodal, y le añade una torre de audio para procesar entrada sonora. Sobre esa base se incorpora un cabezal de decisión (`head.pt`) que puntúa cada opción de cada pregunta, y un fichero de temperatura (`t_entropy.json`) para la calibración de probabilidades. El pipeline declarado es `image-text-to-text`, con soporte adicional de audio mediante el motor `NirnayaAudioEngine`.

El fine-tuning utilizó una mezcla de aproximadamente 69% texto, 17% imágenes y 14% audio, con cerca del 13% en idiomas distintos del inglés. Las categorías de datos cubren decisiones y enrutamiento (detección de intención, clasificación, triaje de soporte), herramientas y agentes (si llamar a una herramienta y cuál), seguridad (peticiones dañinas, sobrerrechazo, manipulación), conocimiento y razonamiento (ciencia, matemáticas, sentido común, causalidad), comprensión del lenguaje (implicación, postura, sarcasmo, correferencia), recuperación (relevancia y si una respuesta está respaldada por su fuente), imágenes (gráficos, recibos, documentos, pantallas, razonamiento espacial, conteo, memes) y audio (habla, comandos de voz, sonidos ambientales, música y emoción, número de hablantes, calidad de llamada). Las etiquetas provienen del ground truth de cada fuente, de reglas para datos generados y, en parte, de etiquetas suaves producidas por un modelo Gemma mayor.

El autor documenta un protocolo de exclusión de datos de test frente a los suites públicos de Decision Index 0.3 y visión: comprobación de coincidencia exacta de cadenas normalizadas de 25 o más caracteres, solapamiento de 13 palabras consecutivas (solo en escritura latina) y hash perceptual de imagen de 64 bits con tolerancia de 2 bits. Reconoce como límites que no puede filtrar contra los tests privados del board, que el chequeo de 13 palabras no cubre escrituras índicas y que los suites públicos no incluyen audio.

## Capacidades

- Clasificación y decisión de opción cerrada: devuelve una respuesta por pregunta con probabilidad en cada opción, hasta 255 opciones por pregunta.
- Entrada multimodal: texto, imagen (con `max_images=2` y `max_soft_tokens=560` en el motor de visión) y audio.
- Detección de intención y enrutamiento de peticiones.
- Decisión de llamada a herramientas y selección de herramienta.
- Evaluación de seguridad: peticiones dañinas, sobrerrechazo y manipulación.
- Razonamiento sobre conocimiento: ciencia, matemáticas, sentido común y causalidad (en modo de un solo paso).
- Comprensión del lenguaje: implicación, postura, sarcasmo y correferencia.
- Evaluación de recuperación: relevancia y verificación de si una respuesta está respaldada por su fuente.
- Análisis de imágenes: gráficos, recibos, documentos, pantallas, razonamiento espacial, conteo y memes.
- Análisis de audio: habla, comandos de voz, sonidos ambientales, música y emoción, número de hablantes y calidad de llamada.
- Multilingüismo centrado en inglés y lenguas de la India.
- Calibración de confianza mediante temperatura sensible a la entropía.
- Servicio HTTP con endpoint `POST /v1/decisions`.

## Casos de uso

- Triaje de soporte al cliente: el modelo recibe el mensaje del usuario y devuelve, en una pasada, la categoría de incidencia y la probabilidad de cada categoría candidata, lo que permite enrutar tickets con umbrales de confianza calibrados y una mediana de 43 ms por petición.
- Enrutamiento de intenciones en asistentes conversacionales: clasifica la intención del turno actual entre hasta 255 opciones, adecuado para árboles de diálogo con muchas ramas donde un modelo generativo añadiría latencia innecesaria.
- Decisión de llamada a herramientas en agentes: dado el estado de la conversación, determina si procede invocar una herramienta y cuál, con probabilidad por herramienta, lo que permite políticas de escalado y abstención.
- Moderación y filtrado de seguridad: evalúa peticiones dañinas, sobrerrechazo y manipulación con scores calibrados, útil como primera capa de un pipeline de moderación antes de un modelo mayor.
- Verificación de respuestas en RAG: comprueba si una respuesta generada está respaldada por la fuente recuperada y puntúa la relevancia del documento, con salida probabilística que permite fijar umbrales de descarte.
- Análisis de documentos y recibos: extrae decisiones sobre campos de recibos, gráficos y documentos escaneados, con soporte de hasta dos imágenes por petición.
- Análisis de llamadas y audio: clasifica emoción, número de hablantes y calidad de llamada mediante el servidor HTTP de audio, aplicable a control de calidad en centros de contacto.
- Procesamiento de lenguas índicas: clasificación y triaje en hindi, hinglish, bengalí, tamil, telugu, marathi, kannada, malayalo y urdu, con cerca del 13% del entrenamiento en idiomas no ingleses.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Public Decision Index 0.3 | 61,78 |
| Índice público de visión | 72,51 |
| Latencia mediana | 43 ms por petición (vLLM) |
| Latencia p95 | 195 ms por petición (vLLM) |
| ECE estimado (suite pública) | ~5,6 |
| NLL estimado (suite pública) | ~0,72 |

Los valores de ECE y NLL son estimaciones del autor según la definición publicada por el board; el board publica sus propias cifras tras revisión. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 26.115.083.856 parámetros, en fp16 serían necesarios aproximadamente 52 GB solo para pesos, lo que excede cualquier GPU de consumo individual; el tamaño del repo (52,4 GB) es coherente con este cálculo.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un despliegue en fp16 requiere GPUs de clase A100 80 GB o H100 80 GB; no se confirma soporte multi-GPU en la información disponible.
- GPU de consumo: no cabe en GPU de consumo en precisión nativa; no se documentan cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: vLLM (usado para las mediciones de latencia), y el stack propio del autor: `decision_index` con `mmclm.di_engine:NirnayaEngine`, `NirnayaVisionEngine` y `NirnayaAudioEngine`, más un servidor HTTP (`python -m mmclm.serve`) con endpoint `POST /v1/decisions`. La configuración de ejemplo usa `gpu_mem=0.85`.
- Latencia y throughput: mediana de 43 ms y p95 de 195 ms por petición con vLLM; no se reporta throughput (peticiones por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nirnaya Turbo 1.0 | 26.115.083.856 | 32.768 tokens | Decisión multimodal con scoring calibrado (texto, imagen, audio) | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-26B-A4B-it | no disponible | no disponible | Modelo base multimodal generativo | Licencia Gemma 4 | Hugging Face (modelo base) |
| Modelos de clasificación dedicados (p. ej. encoders tipo BERT) | no disponible | no disponible | Clasificación de texto de opción cerrada | variable | no disponible |

La comparación con alternativas de la misma categoría (modelos de decisión con scoring probabilístico multimodal) no está disponible en la información proporcionada. El único punto de referencia directo es el modelo base, del que este fine-tuning hereda la arquitectura y al que añade torre de audio y cabezal de decisión.

## Limitaciones y advertencias

- Las puntuaciones sobre opciones listadas no equivalen a transcripción abierta ni a respuesta libre; el modelo no está diseñado para generación abierta.
- Razonamiento multi-paso débil, esperable en un modelo de una sola pasada; el autor recomienda derivar esos casos a un modelo mayor.
- No debe usarse como único control en decisiones médicas, legales o financieras, ni en nada crítico para la seguridad.
- La confianza puede ser excesivamente alta en entradas ambiguas; es necesario validar los umbrales sobre datos propios.
- El protocolo de exclusión de test tiene límites declarados: no cubre los tests privados del board, el chequeo de 13 palabras solo aplica a escritura latina y no hay verificación perceptual para audio.
- Sesgos conocidos: no documentados explícitamente en la información disponible.
- Riesgo de alucinación: no cuantificado; el modelo emite probabilidades sobre opciones, no texto libre, lo que acota el modo de fallo a una elección incorrecta con confianza alta.
- Idiomas: cobertura detallada solo para inglés y lenguas de la India; el resto no está documentado.
- Licencia: Apache 2.0, pero con enlace a la licencia de Gemma 4, lo que puede imponer condiciones adicionales heredadas del modelo base; conviene revisar ambos textos antes de uso comercial.
- Dependencia de código externo: requiere el paquete `decision_index` y el repositorio `nirnaya-inference`, además de ficheros auxiliares (`head.pt`, `t_entropy.json`) sin los cuales el modelo no funciona como decision model.
- Madurez: 0 descargas y 0 likes en el momento de la ficha; sin validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Darkrider/nirnaya-turbo-1.0
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Decision Index kit: https://github.com/apolinario/decision-index
- Código de inferencia: https://github.com/NeverInAsh/nirnaya-inference
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
