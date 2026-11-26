# Assaoka/Tucano2-qwen-0.5B-PriorMerge-FinBERT

## Resumen

Tucano2-qwen-0.5B-PriorMerge-FinBERT es un modelo de lenguaje pequeno (SLM) de 0,5 mil millones de parametros, especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil (PT-BR). Lo desarrolla el autor independiente Assaoka y se construye mediante fusion de modelos (model merging) con la tecnica TIES-Merging, combinando cinco modelos especialistas entrenados sobre el mismo backbone Tucano2-qwen-0.5B. El resultado es un unico checkpoint capaz de cubrir cinco tareas de clasificacion de sentimiento y emocion sin necesidad de mantener cinco modelos separados en produccion.

El modelo forma parte del trabajo presentado en el articulo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging" para la conferencia ENIAC 2026. Su propuesta es demostrar que la fusion de especialistas de bajo coste computacional puede igualar o aproximar el rendimiento de un entrenamiento multi-tarea conjunto (Joint SFT), reduciendo el coste de despliegue. Es relevante para equipos que necesitan clasificadores de sentimiento en portugues con requisitos de hardware minimos y licencia permisiva.

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2 (heredada del backbone Tucano2-qwen-0.5B), con licencia Apache 2.0 y pesos en formato transformers. Aunque la pipeline declarada es `text-generation`, el uso previsto es la clasificacion mediante decodificacion guiada (Guided Decoding con vLLM y Pydantic), no la generacion libre de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, backbone Tucano2-qwen-0.5B) |
| Parametros totales | 0,5 mil millones (aproximado, segun backbone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos compatibles con transformers; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato transformers; no se documenta GGUF) |

## Arquitectura y entrenamiento

El modelo se obtiene por fusion de cinco especialistas con TIES-Merging, con hiperparametros `weight = 0.20` y `density = 0.50`. Los cinco modelos padre son Tucano2-qwen-0.5B-Prior-FinBERT (modelo prior fuera de dominio), Tucano2-qwen-0.5B-ReLiSA, Tucano2-qwen-0.5B-Brighter, Tucano2-qwen-0.5B-Phrasebank y Tucano2-qwen-0.5B-GoEmotions. Cada especialista fue entrenado sobre un dataset distinto: ReLi-SA (resenas de libros), BRIGHTER ptbr (6 emociones multi-etiqueta), Sentiments-FinBERT-PT-BR (noticias financieras), Financial Phrasebank PT-BR (Kaggle) y GoEmotions PT-BR (28 emociones, con un 50% de split de entrenamiento aleatorio).

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta de los datasets mas alla de su origen, ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica principal es el propio pipeline de fusion: TIES-Merging resuelve interferencias entre tareas (conflictos de signo en los parametros) mediante poda por magnitud, eleccion de signo y media ponderada, permitiendo consolidar especialistas en un unico checkpoint. La evaluacion se realizo con decodificacion guiada mediante vLLM y Pydantic, lo que restringe la salida del modelo a etiquetas validas.

## Capacidades

- Clasificacion de sentimiento en portugues (PT-BR) sobre resenas de libros, noticias financieras y texto general.
- Clasificacion de emociones multi-etiqueta (BRIGHTER: 6 emociones; GoEmotions PT-BR: 28 emociones).
- Analisis de sentimiento en dominio financiero (noticias y frases financieras traducidas al portugues).
- Salida estructurada mediante decodificacion guiada (esquemas Pydantic), lo que reduce respuestas invalidas en produccion.
- Capacidad de generacion de texto heredada del backbone, aunque no es el uso previsto ni evaluado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al portugues (PT-BR) segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Monitorizacion de reputacion en redes sociales: el modelo clasifica comentarios y publicaciones en portugues en categorias de emocion (28 etiquetas de GoEmotions) para detectar picos de frustracion o queja y priorizar la respuesta del equipo de soporte.
- Analisis de sentimiento de resenas de productos o libros: con el especialista ReLi-SA integrado, permite procesar resenas en portugues y agregar la polaridad por producto o autor para informes de calidad.
- Vigilancia de sentimiento financiero: el especialista FinBERT-PT-BR y Phrasebank permiten clasificar noticias y comunicados financieros en portugues como positivos, negativos o neutros, alimentando paneles de riesgo de mercado.
- Moderacion de comunidades online: la clasificacion multi-etiqueta de emociones permite etiquetar mensajes con emociones como ira, tristeza o alegria y derivar casos sensibles a revision humana.
- Enrutamiento de tickets de atencion al cliente: al clasificar la emocion del mensaje entrante, el sistema puede dirigir automaticamente los tickets negativos a agentes senior y los neutros a respuestas automatizadas.
- Analisis de encuestas abiertas (NPS, CSAT): el modelo procesa respuestas de texto libre en portugues y agrega sentimiento por segmento de cliente, con coste de inferencia bajo al ejecutarse en una unica GPU consumer.
- Etiquetado de datasets para entrenamiento: al ser un SLM de 0,5B con licencia Apache 2.0, puede usarse para pre-etiquetar grandes volumenes de texto en portugues antes de la revision humana, reduciendo el coste de anotacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (Macro F1, no verificados de forma independiente). La evaluacion emplea decodificacion guiada con vLLM y Pydantic.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Analisis de sentimiento | ReLi-SA | Macro F1 | 43,66 |
| Clasificacion de emociones | BRIGHTER (ptbr) | Macro F1 | 39,69 |
| Analisis de sentimiento | Sentiments-FinBERT-PT-BR | Macro F1 | 81,28 |
| Analisis de sentimiento | Financial Phrasebank PT-BR | Macro F1 | 73,11 |
| Clasificacion de emociones | GoEmotions PT-BR | Macro F1 | 22,45 |

La model card menciona ademas comparaciones con el baseline zero-shot (Polygl0t/Tucano2-qwen-0.5B-Instruct) y con un baseline Joint multi-tarea, pero los valores completos de esas comparaciones no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB en FP16 para 0,5B de parametros; menos de 1 GB en cuantizacion de 8 bits o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para lotes pequenos.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor para decodificacion guiada con Pydantic). No se documentan soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (ReLi-SA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-PriorMerge-FinBERT | 0,5B | no disponible | 43,66 | Apache 2.0 | Hugging Face |
| Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | 0,5B | no disponible | no disponible | no disponible | Hugging Face |
| Baseline Joint multi-tarea | 0,5B | no disponible | no disponible | no disponible | Referenciado en el paper |
| Especialistas individuales (ReLiSA, Brighter, Phrasebank, GoEmotions, Prior-FinBERT) | 0,5B cada uno | no disponible | no disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada; la comparativa se limita a la existencia de los modelos y su relacion de linaje.

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`).
- El rendimiento en GoEmotions PT-BR es bajo (Macro F1 de 22,45), lo que sugiere dificultades con la clasificacion fina de 28 emociones; no es adecuado para produccion en esa tarea sin validacion adicional.
- El modelo esta especializado en portugues de Brasil; no se documenta rendimiento en portugues europeo ni en otros idiomas.
- Riesgo de alucinacion y salidas invalidas si se usa como generador libre de texto; el uso previsto requiere decodificacion guiada con esquemas de etiquetas.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a texto adversario.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la retencion del modelo esta garantizada durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026).
- El modelo depende de un backbone de 0,5B, por lo que su capacidad de razonamiento y comprension de contextos largos es limitada en comparacion con modelos de mayor tamano.
- No se documentan la longitud de contexto ni los tipos de cuantizacion soportados, lo que dificulta planificar despliegues con llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-PriorMerge-FinBERT
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del articulo: https://doi.org/10.5753/eniac.2026.31064
- Coleccion de Hugging Face: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo padre Prior-FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-FinBERT
- Modelo padre ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo padre Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo padre Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Modelo padre GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
