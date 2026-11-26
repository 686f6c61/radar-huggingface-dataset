# Assaoka/Tucano2-qwen-0.5B-PriorMerge-Phrasebank

## Resumen

Tucano2-qwen-0.5B-PriorMerge-Phrasebank es un modelo de lenguaje pequeno (SLM) especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil (PT-BR), desarrollado por el autor Assaoka. Se construye mediante TIES-Merging de cinco modelos: un modelo "prior" entrenado con Financial Phrasebank PT-BR y cuatro especialistas en dominios concretos (FinBERT, ReLiSA, Brighter y GoEmotions). El resultado es un unico modelo de 0,5 mil millones de parametros que cubre multiples tareas de analisis afectivo sin necesidad de mantener cinco cabezas separadas.

El modelo parte de la familia Tucano2 basada en Qwen de 0,5B y se publica como parte del trabajo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. Su relevancia radica en demostrar que la fusion de pesos (model merging) permite consolidar especialistas de dominio en un unico checkpoint compacto con licencia Apache 2.0, desplegable en hardware muy modesto.

Aunque la pipeline declarada es `text-generation`, el modelo se evalua y utiliza como clasificador de sentimiento y emociones mediante decodificacion guiada (Guided Decoding con vLLM y Pydantic). La informacion disponible no detalla la longitud de contexto ni el numero exacto de tokens de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen, familia Tucano2) |
| Parametros totales | 0,5 mil millones (segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); no se confirma GGUF |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion TIES-Merging con `weight = 0.20` y `density = 0.50`, que combina el modelo prior `Tucano2-qwen-0.5B-Prior-Phrasebank` (entrenado con Financial Phrasebank PT-BR) con cuatro especialistas: FinBERT (noticias financieras), ReLiSA (resenas de libros), Brighter (6 emociones multi-etiqueta) y GoEmotions (28 emociones). La base subyacente es un transformer decoder-only de la familia Tucano2 basada en Qwen de 0,5B, afinado para tareas de clasificacion mediante generacion guiada.

Los datos de entrenamiento de los especialistas provienen de los datasets ReLi-SA, BRIGHTER (ptbr), Sentiments-FinBERT-PT-BR, Financial Phrasebank PT-BR y GoEmotions PT-BR (con un 50% de split aleatorio de entrenamiento). La informacion disponible no especifica el volumen total de tokens, la composicion exacta del dataset de la fusion ni si se aplico RLHF o DPO. La innovacion principal es el uso de model merging para consolidar especialistas de multiples dominios en un unico checkpoint compacto, evitando el entrenamiento conjunto multi-tarea.

## Capacidades

- Clasificacion de sentimiento en portugues (positivo, negativo, neutro) en dominios financiero, resenas y general.
- Clasificacion de emociones multi-etiqueta (6 categorias en BRIGHTER, 28 en GoEmotions PT-BR).
- Generacion de texto condicionada a esquemas mediante decodificacion guiada (vLLM + Pydantic).
- Cobertura multi-dominio gracias a la fusion de especialistas: finanzas, resenas de libros y texto conversacional.
- Capacidad de servir como unico modelo para varias tareas afectivas, reduciendo el numero de checkpoints en produccion.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Analisis de sentimiento de noticias financieras: el modelo incorpora el especialista FinBERT y el prior de Financial Phrasebank, por lo que puede clasificar titulares y comunicados en PT-BR con un unico checkpoint de 0,5B desplegable en CPU o GPU modesta.
- Moderacion de comunidades y redes sociales: la fusion con GoEmotions PT-BR permite detectar emociones como ira, tristeza o alegria en comentarios de usuarios, util para priorizar revision humana.
- Analisis de resenas de productos o libros: el especialista ReLiSA aporta cobertura sobre resenas, permitiendo clasificar opiniones en catalogos de e-commerce o plataformas editoriales.
- Monitorizacion de reputacion de marca: al combinar dominios financiero y general, el modelo puede procesar menciones en prensa y redes con una sola inferencia por texto.
- Etiquetado a escala para investigacion en PLN: su tamano reducido (0,5B) y licencia Apache 2.0 permiten generar anotaciones de sentimiento y emocion en corpus PT-BR a bajo coste computacional.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo e incluso CPU, es adecuado para prototipos, edge computing o pipelines por lotes donde no se dispone de infraestructura de gran escala.
- Clasificacion multi-tarea con decodificacion guiada: integrable en servicios que requieran salidas estructuradas (JSON validado con Pydantic) para sentimiento y emocion en la misma llamada.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`), evaluados con Guided Decoding via vLLM + Pydantic. Metrica: Macro F1.

| Dataset / Tarea | Metrica | Valor |
|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 45,71 |
| BRIGHTER ptbr (emociones) | Macro F1 | 38,16 |
| Sentiments-FinBERT-PT-BR (sentimiento) | Macro F1 | 73,59 |
| Financial Phrasebank PT-BR (sentimiento) | Macro F1 | 74,91 |
| GoEmotions PT-BR (emociones) | Macro F1 | 22,82 |

La model card menciona comparaciones frente al baseline zero-shot (`Polygl0t/Tucano2-qwen-0.5B-Instruct`) y frente a un baseline Joint multi-task SFT, pero la informacion proporcionada solo incluye la fila parcial de RELI-SA del modelo, sin los valores completos de los baselines. No se han facilitado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1 GB para los 0,5B parametros, mas overhead de activaciones y cache KV.
- Cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 e incluso GPUs integradas con suficiente memoria compartida.
- Puede ejecutarse en CPU para inferencia por lotes, dado su tamano reducido.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado en la evaluacion con Guided Decoding), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-PriorMerge-Phrasebank | 0,5B | no disponible | Fusion multi-tarea PT-BR | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct | 0,5B | no disponible | Baseline zero-shot PT-BR | no disponible | Hugging Face |
| Baseline Joint multi-task SFT | 0,5B | no disponible | Entrenamiento conjunto multi-tarea | no disponible | Referencia en paper ENIAC 2026 |

La informacion disponible no incluye datos de rendimiento completos de los modelos comparables, por lo que no es posible establecer una comparativa cuantitativa detallada. No se dispone de alternativas de otros autores con especificaciones verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Resultados de benchmarks no verificados (`verified: false`); deben interpretarse como declaraciones del autor pendientes de replicacion independiente.
- El rendimiento en GoEmotions PT-BR es bajo (Macro F1 22,82), lo que sugiere dificultades con la clasificacion fina de 28 emociones.
- El modelo esta disenado exclusivamente para portugues de Brasil; no se garantiza comportamiento en otros idiomas o variantes del portugues.
- Riesgo de alucinacion en tareas generativas: aunque se evalua como clasificador con decodificacion guiada, su pipeline declarada es `text-generation`, por lo que sin restricciones de esquema puede producir salidas no deseadas.
- Sesgos potenciales heredados de los datasets de origen (resenas, noticias financieras, redes sociales), no documentados en detalle.
- No se especifican la longitud de contexto ni el volumen de entrenamiento, lo que limita la planificacion de despliegues con entradas largas.
- Aunque la licencia es Apache 2.0, se recomienda revisar las licencias de los datasets subyacentes para uso comercial.
- La politica de retencion indica alojamiento publico durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026); la disponibilidad a largo plazo no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-PriorMerge-Phrasebank
- Modelo prior: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-Phrasebank
- Especialista FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Especialista ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Especialista Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Especialista GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
