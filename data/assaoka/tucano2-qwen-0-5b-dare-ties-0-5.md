# Assaoka/Tucano2-qwen-0.5B-DARE-Ties-0.5

## Resumen

Tucano2-qwen-0.5B-DARE-Ties-0.5 es un modelo de lenguaje pequeno (SLM) en portugues de Brasil especializado en analisis de sentimiento y clasificacion de emociones, desarrollado por Assaoka. Se construye mediante fusion de modelos (model merging) de cinco especialistas entrenados sobre la misma base Qwen3 de 0,5B de parametros, combinados con la tecnica DARE-TIES con densidad 0,5 y pesos iguales de 0,20 por especialista a traves de `mergekit`.

El modelo resuelve el problema de consolidar multiples tareas de clasificacion afectiva (sentimiento binario/multiclase y emociones multietiqueta) en un unico checkpoint, evitando mantener cinco modelos separados en produccion. Es relevante en el contexto del paper ENIAC 2026 "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", que evalua si la fusion de especialistas puede igualar o superar a un entrenamiento conjunto multi-tarea.

Con 490.799.104 parametros reales (segun safetensors), licencia Apache 2.0 y pesos en safetensors, esta pensado para despliegues ligeros con decodificacion guiada (vLLM + Pydantic) que fuerzan la salida a un esquema de etiquetas controlado, en lugar de generacion libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, base Tucano2-qwen-0.5B) |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusion plana en un solo paso (one-shot flat merge) de cinco checkpoints derivados de la misma base Qwen3 de 0,5B ajustada para instrucciones (referenciada como `Polygl0t/Tucano2-qwen-0.5B-Instruct` como baseline zero-shot). Los cinco especialistas son: FinBERT (noticias financieras), ReLiSA (resenas de libros), Brighter (6 emociones multietiqueta), Phrasebank (frases financieras) y GoEmotions (28 emociones). La fusion se realiza con DARE-TIES, densidad 0,50 y pesos uniformes de 0,20 por especialista mediante `mergekit`.

No se documentan en la informacion disponible el numero de tokens de entrenamiento de los especialistas, la composicion exacta de los datasets mas alla de su nombre, ni si hubo RLHF o DPO. La innovacion tecnica principal es el propio esquema de fusion: DARE (Drop And REscale) elimina deltas de bajo valor antes de aplicar TIES (Trim, Elect Sign, Merge), lo que reduce interferencia entre especialistas heterogeneos. La evaluacion se realiza con decodificacion guiada (vLLM + Pydantic), lo que implica que el modelo se usa para emitir etiquetas estructuradas y no texto libre.

## Capacidades

- Clasificacion de sentimiento en portugues de Brasil (positivo/negativo y variantes segun el dataset).
- Clasificacion de emociones multietiqueta (BRIGHTER con 6 categorias; GoEmotions PT-BR con 28 emociones).
- Analisis de sentimiento en dominio financiero (noticias y frases financieras).
- Analisis de sentimiento en resenas de libros (ReLi-SA).
- Generacion de texto condicionada a esquemas de salida estructurados mediante decodificacion guiada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta orientado a clasificacion, no a agentes.
- Capacidades multilingues: limitadas al portugues (PT-BR) segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Moderacion de comentarios en plataformas brasilenas: el modelo clasifica sentimiento y emociones (ira, tristeza, alegria) sobre textos cortos de usuario, permitiendo priorizar revision humana en funcion de la emocion detectada.
- Analisis de resenas de productos y libros: con el especialista ReLiSA fusionado, puede etiquetar resenas como positivas o negativas para agregar puntuaciones de satisfaccion en catalogos de comercio electronico.
- Monitorizacion de sentimiento financiero: sobre noticias y comunicados en portugues, util para generar senales de sentimiento en pipelines de analisis de mercado, aunque con F1 macro de 27,86% en Sentiments-FinBERT-PT-BR, su uso debe ser como senal auxiliar, no como unica fuente.
- Clasificacion de emociones en redes sociales: con GoEmotions PT-BR (28 emociones) y BRIGHTER (6 categorias), sirve para estudios de opinion publica y analisis de campanas, etiquetando grandes volumenes de posts con un modelo de 0,5B desplegable en CPU/GPU modesta.
- Enrutamiento de tickets de atencion al cliente: clasificar el tono emocional de un ticket para derivarlo a colas de soporte prioritario o a equipos de retencion, usando la salida estructurada via Pydantic.
- Investigacion academica en PLN portugues: como baseline reproducible de fusion de modelos, comparando DARE-TIES frente a entrenamiento conjunto multi-tarea en los cinco benchmarks del paper ENIAC 2026.
- Preetiquetado para anotacion humana: generar etiquetas iniciales de sentimiento/emocion sobre corpus no anotados para acelerar el etiquetado manual posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) en la model card, obtenidos con decodificacion guiada (vLLM + Pydantic):

| Dataset / tarea | Metrica | Tucano2-qwen-0.5B-DARE-Ties-0.5 | Baseline zero-shot | Joint multi-tarea |
|---|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 43,61% | 30,66% | no disponible en el extracto |
| ReLi-SA (sentimiento) | Micro F1 | 72,02% | 37,07% | no disponible en el extracto |
| ReLi-SA (sentimiento) | Accuracy | 72,02% | 37,07% | no disponible en el extracto |
| ReLi-SA (sentimiento) | Hamming Loss | 0,2798 | 0,6293 | no disponible en el extracto |
| BRIGHTER ptbr (emociones) | Macro F1 | 37,29% | no disponible | no disponible |
| Sentiments-FinBERT-PT-BR | Macro F1 | 27,86% | no disponible | no disponible |
| Financial Phrasebank PT-BR | Macro F1 | 51,86% | no disponible | no disponible |
| GoEmotions PT-BR (emociones) | Macro F1 | 22,49% | no disponible | no disponible |

La model card menciona filas de resumen con media no ponderada (mu) y media normalizada min-max (mu_n) sobre las cinco tareas, pero los valores numericos de esas filas no estan completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB para los 490,8 M de parametros, mas overhead de KV cache y runtime (estimacion tipica de 2-3 GB en total).
- En cuantizacion de 8 bits: en torno a 0,5 GB de pesos; en 4 bits, en torno a 0,25 GB. No se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien puede ejecutarse en CPU para lotes pequenos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers`, vLLM (usado en la evaluacion oficial con decodificacion guiada y Pydantic), text-generation-inference (tag `text-generation-inference` en Hugging Face). llama.cpp y Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-DARE-Ties-0.5 | 490,8 M | no disponible | Fusion DARE-TIES de 5 especialistas PT-BR | Apache 2.0 | Hugging Face |
| Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | ~0,5 B | no disponible | Instruccion general PT | no disponible | Hugging Face (referenciado) |
| Especialistas individuales (FinBERT, ReLiSA, Brighter, Phrasebank, GoEmotions) | ~0,5 B cada uno | no disponible | SFT por tarea | no disponible | Hugging Face (referenciados) |
| Baseline Joint multi-tarea | ~0,5 B | no disponible | SFT conjunto sobre 5 datasets | no disponible | Referenciado en el paper |

La comparativa cuantitativa frente al baseline Joint solo esta parcialmente disponible (ReLi-SA); para el resto de tareas no se han publicado los valores del baseline conjunto en la informacion proporcionada.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor con `verified: false`; no han sido reproducidos de forma independiente.
- El rendimiento en Sentiments-FinBERT-PT-BR (27,86% Macro F1) y GoEmotions PT-BR (22,49% Macro F1) es bajo en terminos absolutos; no es apto como clasificador unico en produccion sin validacion en el dominio objetivo.
- Modelo limitado al portugues de Brasil; no se garantiza comportamiento en portugues europeo ni en otros idiomas.
- Disenado para clasificacion con decodificacion guiada; la generacion de texto libre puede degradarse respecto a la base instruct.
- Riesgo de alucinacion y de etiquetas inconsistentes fuera de los esquemas Pydantic usados en la evaluacion.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de datasets de resenas, noticias financieras y redes sociales, puede heredar sesgos de dominio y de anotacion de esos corpus.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de origen (ReLi-SA, BRIGHTER, GoEmotions PT-BR, Phrasebank) antes de un despliegue comercial.
- Politica de retencion: el autor garantiza alojamiento publico durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026); no hay garantia de mantenimiento a largo plazo.
- Longitud de contexto no documentada: no se recomienda su uso con entradas largas sin verificacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-DARE-Ties-0.5
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Especialista FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Especialista ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Especialista Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Especialista Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Especialista GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
