# kakaocorp/kanana-2-v-decide-3b-2611

## Resumen

Kanana-2-v-decide-3b-2611 es un modelo de decisión desarrollado por Kakao Corp. que responde preguntas tipadas sobre un estado de entrada en lugar de generar texto libre. Dado un input (texto, JSON, array o historial de chat, opcionalmente con imágenes), el modelo devuelve una distribución de probabilidad sobre las respuestas candidatas para preguntas de tipo elección múltiple (choice), sí/no (noul) y escala ordenada (score). No es un modelo generativo: es un clasificador multimodal de propósito general con salida calibrada.

El modelo se construye sobre Kanana-2-V 3B, que combina el modelo de lenguaje Kanana-2-3B (3,18B parámetros) con el codificador visual Kanana (0,49B parámetros), sumando 3,67B parámetros totales. Cada pregunta se codifica junto con el estado en un embedding de 2.560 dimensiones, y cada respuesta candidata en otro; una softmax sobre las similitudes coseno entre ambos produce la distribución de respuestas. Admite hasta 10 imágenes y 20.480 tokens de entrada por petición.

Su relevancia actual radica en que cubre tareas de clasificación y enrutamiento con un único modelo multimodal que no requiere prompting generativo ni parseo de salidas, con resultados que lideran los benchmarks públicos de decisión (Decision Index y Decision Index Vision) y un rendimiento destacado en coreano (72,50 en Kanana Decision Bench, 18 puntos por encima del siguiente modelo comparado).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual Kanana + modelo de lenguaje Kanana-2-3B) con cabecera de embedding para decisión |
| Parámetros totales | 3.665.430.640 (3,67B: 0,49B visión + 3,18B lenguaje) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 20.480 tokens de entrada; hasta 10 imágenes por petición |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko), inglés (en) |
| Licencia | Kanana Open License (license: other) |
| Formato de pesos | Safetensors (requiere `trust_remote_code=True`) |
| Dimensión de embedding | 2.560 |
| Tipos de pregunta | choice (elección múltiple), noul (sí/no), score (escala ordenada) |
| Pipeline | zero-shot-classification / decision |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos torres para decisión: cada pregunta se codifica junto con el estado de entrada en un único embedding, y cada respuesta candidata se codifica en otro embedding independiente. La distribución de respuesta se obtiene aplicando una softmax sobre las similitudes coseno entre el embedding de la pregunta-estado y los embeddings de las respuestas candidatas. Esta formulación permite devolver una distribución completa de probabilidad sobre cualquier conjunto de opciones, con un número arbitrario de preguntas por petición, sin generar texto.

La base es el modelo Kanana-2-V 3B, que empareja el modelo de lenguaje Kanana-2-3B con el codificador visual Kanana. El modelo acepta texto, objetos o arrays JSON, e historiales de chat, con imágenes adjuntas en múltiples formatos (rutas locales, URLs, URIs base64 o imágenes PIL). No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada. El modelo requiere código personalizado (`custom_code`) y está etiquetado como "system-one" y "decision-model".

## Capacidades

- Clasificación zero-shot con opciones definidas en tiempo de inferencia (tipo choice): selecciona una opción entre varias.
- Respuestas booleanas con probabilidad calibrada (tipo noul): devuelve la probabilidad de "sí" en el rango 0-1.
- Puntuación en escalas ordenadas (tipo score): devuelve el nivel esperado sobre una escala definida por el usuario.
- Múltiples preguntas por petición, cada una con su propio tipo y criterios.
- Entrada multimodal: texto, JSON, arrays, historial de chat e imágenes (hasta 10 por petición).
- Contexto largo de hasta 20.480 tokens.
- Salida como distribución de probabilidad completa sobre las respuestas candidatas, sin generación de texto ni parseo posterior.
- Soporte multilingüe limitado a coreano e inglés.
- Despliegue mediante `transformers` (AutoModel, pipeline "decision") y servidor HTTP compatible con System One API (`POST /v1/systemone`, `GET /v1/models`, `GET /health`).

## Casos de uso

- Enrutamiento y clasificación de tickets de atención al cliente: el modelo clasifica la consulta en categorías (entrega, cambio, pago) y responde preguntas booleanas asociadas (por ejemplo, si el artículo está dañado) en una sola llamada, devolviendo probabilidades que permiten umbrales de confianza.
- Moderación y triaje de contenido multimodal: con hasta 10 imágenes por petición, puede evaluar si una imagen adjunta cumple políticas o clasificar su temática junto con el texto asociado.
- Análisis de sentimiento y satisfacción: usando preguntas de tipo score sobre una escala definida (negativo, neutro, positivo), devuelve el nivel esperado sin necesidad de generar ni parsear texto.
- Extracción de señales estructuradas de JSON: al aceptar objetos y arrays JSON como estado, puede puntuar registros o clasificar campos dentro de pipelines de datos sin transformación previa.
- Evaluación de historiales de conversación: acepta chat messages como estado, lo que permite clasificar intenciones o detectar insatisfacción en conversaciones multi-turno dentro de sistemas de análisis de calidad.
- Enrutamiento en agentes y sistemas de decisión: al devolver distribuciones calibradas, se integra como componente de decisión (system-one) en arquitecturas de agentes que necesitan elegir acciones o ramas con probabilidades, sin coste de generación.
- Filtrado y priorización en coreano: con 72,50 en Kanana Decision Bench, es adecuado para clasificación de consultas y documentos en coreano en producción, donde supera ampliamente a los modelos comparados.

## Benchmarks y rendimiento

| Modelo | Kanana Decision Bench (texto, 15.909 preguntas) | Decision Index 0.4.1 public | Decision Index Vision 0.4.1 public | Media (públicos) |
|---|---|---|---|---|
| Kanana-2-v-decide-3b-2611 (3B) | **72,50** | 61,34 | **61,12** | **61,23** |
| StartLux-Decision-v1.1-2B-Instant (2B) | 54,38 | 59,17 | 59,90 | 59,54 |
| Liquid AI d1-3B (3B) | 52,71 | 48,97 | 51,86 | 50,42 |
| Base Labs Joey-1 (2B) | 42,38 | **63,31** | 54,23 | 58,77 |

La media se calcula a partir de las dos puntuaciones públicas mostradas. Kanana Decision Bench es un conjunto de evaluación interno de Kakao en coreano (texto). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3,67B parámetros, en bfloat16 se requieren aproximadamente 7,3 GB solo para pesos, más memoria para activaciones y el codificador visual; en cuantización de 8 bits o 4 bits el requisito se reduciría, aunque no se documentan cuantizaciones soportadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabe en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) en bfloat16, y en GPUs profesionales como A100 o H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: probable en tarjetas con 12-24 GB de VRAM en bfloat16, aunque no hay cifras oficiales confirmadas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (AutoModel y pipeline "decision"); servidor HTTP propio (`server_kanana_v_decide.py`) compatible con System One API usando solo la biblioteca estándar de Python. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Kanana Decision Bench | Decision Index | Decision Index Vision | Licencia |
|---|---|---|---|---|---|---|
| Kanana-2-v-decide-3b-2611 | 3,67B | 20.480 tokens, 10 imágenes | 72,50 | 61,34 | 61,12 | Kanana Open License |
| StartLux-Decision-v1.1-2B-Instant | 2B | No disponible | 54,38 | 59,17 | 59,90 | No disponible |
| Liquid AI d1-3B | 3B | No disponible | 52,71 | 48,97 | 51,86 | No disponible |
| Base Labs Joey-1 | 2B | No disponible | 42,38 | 63,31 | 54,23 | No disponible |

Kanana destaca en la media de benchmarks públicos y en el conjunto coreano, mientras que Joey-1 obtiene la mejor puntuación en Decision Index texto. No se dispone de datos de contexto ni licencia de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones de probabilidad sobre opciones predefinidas; no sirve para tareas de generación, resumen o diálogo abierto.
- Idiomas limitados a coreano e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de calibración imperfecta: aunque devuelve probabilidades, no se documentan estudios de calibración fuera de los benchmarks del autor; conviene validar umbrales en el dominio de producción.
- Sesgos: no se documentan análisis de sesgo en la información disponible; al estar entrenado principalmente con datos coreanos e ingleses, puede reflejar sesgos culturales y lingüísticos de esas fuentes.
- Licencia Kanana Open License (license: other): es necesario revisar el texto completo de la licencia antes de un uso comercial; no se detallan aquí las restricciones.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; hay que auditar ese código antes de desplegarlo en producción.
- El número de descargas (7) y likes (2) es muy bajo, lo que sugiere poca validación comunitaria y escasa documentación independiente.
- No se documentan cuantizaciones oficiales ni soporte en runtimes de alto rendimiento (vLLM, llama.cpp), lo que limita las opciones de despliegue optimizado.
- El límite de 10 imágenes y 20.480 tokens acota los casos de uso con documentos o vídeos extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kakaocorp/kanana-2-v-decide-3b-2611
- Licencia: https://huggingface.co/kakaocorp/kanana-2-v-decide-3b-2611/blob/main/LICENSE
- Blog de Kakao (coreano): https://tech.kakao.com/posts/846
