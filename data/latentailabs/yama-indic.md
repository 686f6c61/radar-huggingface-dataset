# LatentAILabs/yama-indic

## Resumen

Yama (`yama-indic`) es un clasificador de texto zero-shot desarrollado por LatentAILabs (Arun Prabhakaran) y publicado con licencia Apache-2.0. No es un modelo generativo: es un encoder XLM-RoBERTa-large de 586 millones de parámetros con una cabeza de decisión de dos capas, diseñado para responder preguntas de clasificación definidas en tiempo de inferencia. Se le pasa un texto y una o varias preguntas en inglés sencillo con etiquetas propias, y devuelve una probabilidad calibrada para cada opción en un único forward pass, sin fine-tuning.

El modelo está orientado al mercado lingüístico indio: cubre inglés, hindi (tanto en devanagari como romanizado), hinglish y otras diez lenguas indias (bengalí, tamil, telugu, maratí, gujarati, canná, malabar, panyabí, urdu y odia), además de un conjunto amplio de lenguas adicionales. Su relevancia actual radica en que sustituye a un LLM generativo en tareas de enrutamiento, triaje y clasificación por una alternativa determinista, barata y de baja latencia, con métricas de calibración explícitas.

Yama es la versión 3 de `laya-indic`, publicada como modelo separado porque cambia el encoder base (de mmBERT-base a XLM-RoBERTa-large). Según la model card, la precisión global sube de 0,800 a 0,862 y el error medio de calibración baja de 0,091 a 0,070. El contexto de entrada está limitado a 512 tokens por pregunta, incluyendo pregunta, opciones y texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer XLM-RoBERTa-large con cabeza de decisión de 2 capas (modelo de decisión tipado, THX-01) |
| Parametros totales | 586.402.566 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por pregunta (pregunta + opciones + texto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, pa, ur, or, az, kk, uz, ka, tr, fa, ru, de, fr, es, ar, zh, ja, ko, multilingual (entrenado en más de 30 idiomas; más fuerte en inglés, hindi, hinglish y 10 lenguas indias) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `thx01`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder XLM-RoBERTa-large (560M parámetros) al que se añade una cabeza de decisión de dos capas, con un total de unos 586M parámetros. El modelo implementa la arquitectura de decisión THX-01 mediante la librería `thx01` (Apache-2.0, HAL-X AI), pero se construye sobre los pesos del encoder XLM-RoBERTa-large (MIT), no sobre los pesos de THX-01. Admite tres tipos de pregunta: `choice` (selección entre N opciones), `noul` (sí/no) y `score` (ordinal, para valoraciones de 1 a N). Las preguntas, las etiquetas y el número de opciones se definen en tiempo de inferencia, lo que permite reutilizar el mismo modelo para tareas distintas sin reentrenar.

El entrenamiento consistió en 3 épocas sobre 591.217 decisiones: 285.078 procedentes de 17 datasets públicos, 173.226 preguntas sintéticas de Qwen3 verificadas, 117.646 preguntas verificadas sobre texto real en lenguas indias y 15.267 preguntas verificadas de causa/efecto y de sí/no sobre pasajes. Los datasets incluyen MASSIVE, Banking77, GoEmotions, Civil Comments, HelpSteer2, BRIGHTER, LexGLUE, Measuring Hate Speech, Nemotron Safety Guard v3, Aegis AI Content Safety 2.0, Aya Redteaming, SMS Spam, Sangraha y conjuntos propios (laya-indic-synthetic, laya-indic-real-text, yama-indic-gemma). Las etiquetas sintéticas se generaron con modelos abiertos (Qwen3, Qwen3.6, Gemma 4) y fueron verificadas. La model card advierte que Nemotron Safety Guard v3 es parcialmente traducción automática y sintética, y no declara los modelos usados, por lo que no puede verificarse por completo la ausencia de salidas de modelos propietarios.

La innovación principal no es arquitectónica sino de planteamiento: convertir la clasificación en un problema de decisión tipada con preguntas en lenguaje natural, con calibración explícita como métrica de primera clase (error medio de calibración de 0,070 en v3) y evaluación sobre tareas no vistas durante el entrenamiento.

## Capacidades

- Clasificación zero-shot con etiquetas arbitrarias definidas en inferencia, sin fine-tuning.
- Tres tipos de pregunta: elección entre opciones (`choice`), sí/no (`noul`) y escala ordinal (`score`).
- Detección de intención y enrutamiento de consultas.
- Análisis de sentimiento y clasificación de emociones.
- Clasificación temática y de noticias.
- Triaje de tickets de soporte y priorización por urgencia.
- Moderación de contenido: toxicidad, discurso de odio, seguridad.
- Detección de spam.
- Razonamiento causal básico (evaluado en IndicCOPA, con precisión 0,624 en v3).
- Capacidades multilingües centradas en lenguas indias, con soporte específico para texto romanizado y code-mixed (hinglish).
- Respuestas deterministas y probabilidades calibradas, aptas para umbrales en producción.
- No soporta tool calling, function calling, agentes, visión ni audio: es un encoder de clasificación, no un LLM generativo.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo recibe el mensaje del usuario y una pregunta del tipo "¿qué departamento debe gestionar esto?" con las opciones disponibles (facturación, soporte técnico, devoluciones, etc.), y devuelve una probabilidad por opción. Es adecuado porque el enrutamiento exige baja latencia y decisiones deterministas, y Yama cubre hindi, hinglish y diez lenguas indias en un solo modelo.
- Triaje de tickets de soporte: con una pregunta `score` ("¿cómo de urgente es este ticket?") y opciones ordinales (baja, media, alta, crítica), se prioriza la cola de atención sin depender de un LLM generativo. La calibración del modelo permite fijar umbrales con sentido operativo.
- Moderación de contenido en comunidades indias: preguntas `noul` del tipo "¿este comentario contiene discurso de odio?" o "¿es tóxico?" sobre texto en hindi, bengalí o code-mixed. El modelo se entrenó con datasets de seguridad (Aegis, Nemotron Safety Guard, Civil Comments, Measuring Hate Speech), lo que lo hace apropiado para un primer filtro de bajo coste.
- Análisis de sentimiento y opinión de producto: clasificación de reseñas en varias lenguas indias con etiquetas positivas/negativas/neutras o escalas de 1 a 5 mediante preguntas `score`. Útil para paneles de opinión multilingües donde un LLM resultaría caro por volumen.
- Clasificación temática de noticias y contenidos: asignación de categorías editoriales (política, deportes, tecnología, etc.) a titulares y artículos cortos en inglés e hindi. El límite de 512 tokens por pregunta encaja con titulares y resúmenes, no con documentos largos completos.
- Detección de spam y abuso en mensajes SMS o chats: con el dataset SMS Spam y preguntas binarias, el modelo puede filtrar mensajes entrantes en tiempo real. Su naturaleza de encoder permite procesar grandes volúmenes con coste muy inferior al de un modelo generativo.
- Clasificación de intenciones para asistentes de voz o chatbots en hindi e hinglish: el modelo interpreta texto romanizado y code-mixed, algo habitual en interacciones reales de usuarios indios, y devuelve la intención con una probabilidad calibrada que el orquestador puede usar para decidir si escalar a un humano.

## Benchmarks y rendimiento

Resultados publicados en la model card. La evaluación se realizó sobre 33 tareas y 19 idiomas no vistos durante el entrenamiento, con el mismo conjunto de muestras y el mismo harness para todos los modelos.

| Modelo | Precision (33 tareas, 19 idiomas) |
|---|---|
| Yama v3 (`yama-indic`) | 0,814 |
| MoritzLaurer/bge-m3-zeroshot-v2.0 | 0,770 |
| joeddav/xlm-roberta-large-xnli | 0,560 |
| MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 | 0,478 |
| facebook/bart-large-mnli | 0,374 |

Comparación v2 (mmBERT-base) frente a v3 (XLM-R-large) según la model card:

| Metrica | v2 | v3 |
|---|---|---|
| Precision global | 0,800 | 0,862 |
| Error medio de calibracion | 0,091 | 0,070 |
| SIB-200 Indic (tema) | 0,670 | 0,844 |
| IndicSentiment | 0,884 | 0,950 |
| MASSIVE Indic | 0,849 | 0,893 |
| IndicCOPA | 0,513 | 0,624 |
| IndicCOPA telugu | 0,528 | 0,634 |
| IndicCOPA gujarati | 0,529 | 0,632 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo de clasificación.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 586M parámetros ocupan aproximadamente 2,3 GB; en fp16, unos 1,2 GB. El tamaño del repositorio es de 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Una RTX 4090, A100 o H100 no son necesarias para el modelo, pero permiten procesar lotes grandes con alto throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, 4060, 4090, etc.) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: la librería oficial es `thx01` (PyPI, Apache-2.0). Al estar construido sobre XLM-RoBERTa-large, los pesos del encoder son compatibles con el ecosistema Hugging Face Transformers. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un encoder de 586M con un único forward pass por pregunta, la latencia esperada es de milisegundos en GPU, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (33 tareas, 19 idiomas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yama v3 (`yama-indic`) | 586M | 512 tokens por pregunta | 0,814 | Apache-2.0 | Hugging Face |
| MoritzLaurer/bge-m3-zeroshot-v2.0 | no disponible | no disponible | 0,770 | no disponible | Hugging Face |
| joeddav/xlm-roberta-large-xnli | ~560M | 512 tokens | 0,560 | MIT | Hugging Face |
| facebook/bart-large-mnli | ~407M | 1024 tokens | 0,374 | MIT | Hugging Face |

Yama v3 supera a las alternativas zero-shot comparables en el conjunto de evaluación publicado, con especial ventaja en lenguas indias y texto code-mixed. Frente a `xlm-roberta-large-xnli`, comparte encoder base pero añade la cabeza de decisión tipada y el entrenamiento específico en lenguas indias. Frente a un LLM generativo usado como clasificador, Yama ofrece determinismo, calibración y un coste de inferencia muy inferior, a cambio de limitarse a tareas de clasificación.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no hace tool calling ni razonamiento multi-paso. Solo responde preguntas de clasificación con opciones predefinidas.
- Límite de 512 tokens por pregunta, incluyendo pregunta, opciones y texto. No apto para documentos largos sin truncado o segmentación previa.
- El rendimiento es más fuerte en inglés, hindi, hinglish y diez lenguas indias; en el resto de idiomas listados la calidad no está cuantificada en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en dominios alejados de los datos de entrenamiento. La calibración publicada (error medio 0,070) es global, no por tarea.
- Sesgos potenciales derivados de los datasets de entrenamiento (Civil Comments, GoEmotions, Measuring Hate Speech, etc.), que reflejan sesgos de anotación y de las plataformas de origen. No se documenta una auditoría de sesgos específica.
- Parte de las etiquetas de entrenamiento son sintéticas, generadas por Qwen3, Qwen3.6 y Gemma 4 y verificadas. La model card advierte que Nemotron Safety Guard v3 es parcialmente traducción automática y sintética y no declara los modelos usados, por lo que no puede verificarse del todo la ausencia de salidas de modelos propietarios.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base XLM-RoBERTa-large es MIT y la librería `thx01` es Apache-2.0; conviene revisar `LICENSES.md` del repositorio para el detalle de licencias de los datasets.
- Yama es un lanzamiento personal independiente y no está afiliado ni respaldado por HAL-X AI.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que puede complicar el despliegue en entornos con restricciones de memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LatentAILabs/yama-indic
- Modelo predecesor (v1 y v2): https://huggingface.co/LatentAILabs/laya-indic
- Artículo en Towards AI: https://pub.towardsai.net/before-you-invent-a-new-architecture-try-a-bigger-encoder-8f2b39fc50a8
- Resumen y FAQ: https://latentailabs.github.io/yama-bigger-encoder/
- Canal de YouTube de LatentAILabs: https://www.youtube.com/@LatentAILabs
- Librería `thx01` en PyPI: https://pypi.org/project/thx01/
- Encoder base XLM-RoBERTa-large: https://huggingface.co/FacebookAI/xlm-roberta-large
