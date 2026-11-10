# Darkrider/nirnaya-flash-1.0

## Resumen
Nirnaya Flash 1.0 es un modelo de decisión (decision model) desarrollado por Darkrider, afinado a partir de google/gemma-4-E4B-it. Su planteamiento es distinto al de un modelo generativo convencional: recibe un estado (texto, imagen o audio) y un conjunto de preguntas, y devuelve una respuesta por pregunta con una probabilidad asignada a cada opción en una sola pasada. Está pensado para tareas de enrutamiento, clasificación, triaje y selección entre alternativas, no para transcripción abierta ni respuesta libre.

El modelo forma parte de la familia Nirnaya (निर्णय, "decisión" en hindi) y se presenta como el miembro más rápido y mejor calibrado. Según la model card, alcanza un Public Decision Index 0.3 de 51,90 y un índice de visión público de 59,44, con una latencia mediana de 30 ms por petición (p95 de 164 ms) medida con vLLM. Admite hasta 255 opciones por pregunta y procesa texto, imágenes y audio en inglés y lenguas de la India.

Con 7.941.100.874 parámetros totales según los safetensors y un repositorio de 16,1 GB, se distribuye bajo licencia Apache 2.0. Su relevancia actual reside en la combinación de multimodalidad, calibración explícita de probabilidades y un modo de inferencia de una sola pasada orientado a sistemas de agentes y pipelines de decisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E4B), con cabeza de decisión adicional |
| Parametros totales | 7.941.100.874 |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (max_model_len usado en la configuración de referencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés y lenguas de la India (hindi, hinglish, bengalí, tamil, telugu, maratí, canarés, malabar, urdu y otras); porcentaje de datos no ingleses aproximado del 13 % |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model*.safetensors) más head.pt y t_entropy.json |

## Arquitectura y entrenamiento
El modelo parte de Gemma 4 E4B, un transformer multimodal capaz de procesar texto, imagen y audio, y le añade una cabeza de decisión (`head.pt`) que puntúa cada opción de una pregunta. La inferencia se realiza mediante motores específicos (`NirnayaEngine`, `NirnayaVisionEngine`, `NirnayaAudioEngine`) sobre vLLM, con parámetros como `max_soft_tokens=560` y `max_images=2` para la suite de visión. La temperatura de servicio se ajusta mediante un fichero de calibración (`t_entropy.json`) basado en entropía.

El ajuste fino se realizó sobre un conjunto de datos compuesto aproximadamente por un 69 % de texto, un 17 % de imágenes y un 14 % de audio, con alrededor de un 13 % en idiomas distintos del inglés. Las categorías cubiertas incluyen decisiones y enrutamiento, herramientas y agentes, seguridad, conocimiento y razonamiento, comprensión del lenguaje, recuperación, imágenes (gráficos, recibos, documentos, pantallas, razonamiento espacial, conteo, memes) y audio (habla, comandos de voz, sonidos ambientales, música y emoción, número de hablantes, calidad de llamada). Las etiquetas provienen de ground truth de cada fuente, reglas para datos generados y, en parte, de etiquetas suaves producidas por un modelo Gemma de mayor tamaño.

El autor documenta un protocolo de exclusión de datos de test que combina coincidencia exacta de texto normalizado de 25 o más caracteres, solapamiento de 13 palabras consecutivas y hash perceptual de imagen (64 bits, tolerancia de 2 bits) para detectar copias redimensionadas o recodificadas. Se reconocen limitaciones del filtro: no cubre los tests privados del board, el chequeo de 13 palabras solo opera sobre escritura latina y la suite pública no incluye audio.

## Capacidades
- Clasificación y decisión de una sola pasada: devuelve una opción por pregunta con probabilidad calibrada sobre cada alternativa, hasta 255 opciones por pregunta.
- Procesamiento multimodal: texto, imágenes (gráficos, recibos, documentos, pantallas, memes, razonamiento espacial y conteo) y audio (habla, comandos, sonidos ambientales, música, emoción, número de hablantes).
- Enrutamiento e intent detection para sistemas de soporte y triaje.
- Decisión de invocación de herramientas y selección de la herramienta adecuada en flujos de agentes.
- Evaluación de seguridad: detección de peticiones dañinas, sobrerrechazo y manipulación.
- Comprensión del lenguaje: entailment, postura, sarcasmo y correferencia.
- Recuperación: relevancia de documentos y verificación de que una respuesta está respaldada por su fuente.
- Cobertura multilingüe de inglés y lenguas de la India, incluido hinglish.
- Calibración de probabilidades mediante temperatura ajustada por entropía, con ECE estimado de 3,9 y NLL de 0,87 en la suite pública.
- Servicio HTTP para audio mediante `POST /v1/decisions`.

## Casos de uso
- Triaje de soporte al cliente: el modelo recibe el mensaje del usuario y un conjunto de categorías de incidencia, y devuelve la categoría más probable con su probabilidad, lo que permite enrutar tickets automáticamente y aplicar umbrales de confianza para escalar a un humano.
- Enrutamiento de intenciones en asistentes conversacionales: con hasta 255 opciones por pregunta y latencia mediana de 30 ms, puede clasificar la intención del turno en tiempo real dentro de un diálogo multi-turno.
- Selección de herramientas en agentes: dado el estado de la conversación y el catálogo de herramientas disponibles, decide si invocar una herramienta y cuál, con una probabilidad asociada que permite descartar invocaciones de baja confianza.
- Moderación y seguridad: evaluación de peticiones potencialmente dañinas, detección de manipulación y control de sobrerrechazo en sistemas de filtrado previos a un modelo generativo.
- Verificación de respuestas en pipelines RAG: comprobar si la respuesta propuesta está respaldada por el documento recuperado y puntuar la relevancia de cada fragmento antes de mostrarlo al usuario.
- Procesamiento de documentos y recibos: extracción de decisiones a partir de imágenes de gráficos, recibos y pantallas, con soporte de hasta dos imágenes por petición en la configuración de referencia.
- Análisis de llamadas de audio: clasificación de calidad de llamada, número de hablantes, emoción y presencia de comandos de voz mediante el servidor HTTP dedicado.
- Filtrado previo en pipelines generativos: usar el modelo como primera etapa de bajo coste para decidir si una consulta requiere un modelo mayor, reduciendo el coste de inferencia en producción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Public Decision Index 0.3 | 51,90 |
| Public vision index | 59,44 |
| Latencia mediana por petición | 30 ms |
| Latencia p95 | 164 ms |
| ECE estimado (suite pública) | ~3,9 |
| NLL estimado (suite pública) | ~0,87 |

Las cifras proceden de ejecuciones completas del kit Decision Index y de la model card. El autor indica que las puntuaciones del board privado se añadirán cuando se publiquen, y que las cifras de calibración son estimaciones propias a la espera de revisión del board. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 7,94 mil millones de parámetros, en fp16 se requieren aproximadamente 16 GB solo para pesos, más overhead de contexto y de la cabeza de decisión.
- GPU recomendadas: no disponible; la model card solo menciona el uso de vLLM con `gpu_mem=0.85` y `max_model_len=32768`.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño, cabría en GPUs con 24 GB o más en precisión reducida, pero no hay datos publicados al respecto.
- Opciones de despliegue: vLLM mediante los motores `mmclm.di_engine:NirnayaEngine`, `NirnayaVisionEngine` y `NirnayaAudioEngine`; servidor HTTP propio con `python -m mmclm.serve` para audio. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 30 ms por petición y p95 de 164 ms con vLLM; no se publica throughput agregado.
- Dependencias adicionales para audio: `librosa`, `fastapi`, `uvicorn` y `python-multipart`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nirnaya Flash 1.0 | 7,94 B | 32.768 tokens | Decisión multimodal calibrada (texto, imagen, audio) | Apache 2.0 | Hugging Face |
| google/gemma-4-E4B-it | no disponible | no disponible | Modelo generativo multimodal base | Gemma 4 license | Hugging Face |
| Modelos de clasificación basados en Gemma de tamaño similar | no disponible | no disponible | Clasificación de texto | variable | no disponible |

La comparación con alternativas específicas de la misma categoría (modelos de decisión con calibración probabilística y multimodalidad) no está disponible en la información proporcionada. El competidor directo más cercano es el modelo base google/gemma-4-E4B-it, del que Nirnaya Flash 1.0 hereda la arquitectura y al que añade la cabeza de decisión y la calibración.

## Limitaciones y advertencias
- Las puntuaciones sobre opciones listadas no equivalen a transcripción abierta ni a respuesta libre; el modelo no está diseñado para generar texto libre.
- Razonamiento multi-paso complejo débil, consecuencia esperada de un modelo de una sola pasada; el autor recomienda derivar esos casos a un modelo mayor.
- No debe usarse como único control en decisiones médicas, legales o financieras, ni en contextos de seguridad crítica.
- La confianza puede ser excesivamente alta en entradas ambiguas; es necesario validar los umbrales sobre la tarea concreta.
- El filtro de solapamiento de 13 palabras solo cubre escritura latina, por lo que el texto en escrituras índicas queda protegido únicamente por la comprobación exacta.
- La suite pública no incluye audio, por lo que no existe verificación perceptual equivalente para ese modalidad.
- El filtro de exclusión de test no detecta paráfrasis.
- No se publica la lista de fuentes de los datos de entrenamiento.
- Sesgos conocidos: no disponibles de forma explícita en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia de Gemma 4 (`license_link`), lo que conviene verificar antes de un despliegue comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 10 de noviembre de 2026, por lo que carece de validación independiente de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Darkrider/nirnaya-flash-1.0
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Código de inferencia: https://github.com/NeverInAsh/nirnaya-inference
- Decision Index kit: https://github.com/apolinario/decision-index
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
