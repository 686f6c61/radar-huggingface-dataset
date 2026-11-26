# Assaoka/Tucano2-qwen-0.5B-TIES-0.7

## Resumen

Tucano2-qwen-0.5B-TIES-0.7 es un modelo de lenguaje pequeno (SLM) en portugues de Brasil, resultado de la fusion por TIES-Merging de cinco especialistas de dominio derivados de la familia Tucano2-qwen-0.5B. Lo desarrolla Assaoka en el marco del articulo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. El objetivo es concentrar en un unico modelo de 0,5B parametros capacidades de analisis de sentimiento y clasificacion de emociones que de otro modo requeririan cinco modelos separados o un entrenamiento multi-tarea conjunto.

La relevancia del modelo es metodologica: forma parte de un ablation study sobre la densidad de poda en TIES-Merging (densidad 0,7), comparando la fusion de especialistas frente a un baseline zero-shot y frente a un ajuste supervisado multi-tarea conjunto. Los resultados publicados muestran que la fusion no supera al modelo entrenado conjuntamente en la mayoria de tareas, lo que convierte a este checkpoint en una pieza de evidencia empirica sobre los limites del model merging en regimenes de pocos parametros.

Arquitectonicamente hereda la base Qwen3 de 0,5B (490.799.104 parametros segun los pesos en safetensors), con licencia Apache 2.0 y pesos en safetensors compatibles con transformers y text-generation-inference. El modelo esta pensado para inferencia con decodificacion guiada (vLLM + Pydantic) y salida estructurada, no como generador conversacional generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajustado para clasificacion via generacion guiada |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusion TIES-Merging con densidad 0,7 sobre cinco especialistas de la misma base Tucano2-qwen-0.5B: FinBERT (noticias financieras), ReLiSA (resenas de libros), Brighter (6 emociones multi-etiqueta), Phrasebank (frases financieras) y GoEmotions (28 emociones, split de entrenamiento aleatorio al 50 %). La fusion asigna pesos iguales de 0,20 a cada especialista, con `normalize: true` e `int8_mask: true`, aplicando poda de densidad 0,7 sobre los deltas antes de la agregacion de signos y la media ponderada propia de TIES.

No se especifica en la informacion disponible el numero de tokens de entrenamiento de los especialistas, la composicion exacta de sus datasets ni si hubo RLHF o DPO; los especialistas se derivan de ajuste supervisado sobre los datasets citados (ReLi-SA, BRIGHTER ptbr, Sentiments-FinBERT-PT-BR, Financial Phrasebank PT-BR y GoEmotions PT-BR). La innovacion tecnica destacable es el propio protocolo de evaluacion: clasificacion mediante decodificacion guiada con vLLM y esquemas Pydantic, que fuerza al modelo generativo a emitir etiquetas validas en lugar de texto libre.

## Capacidades

- Clasificacion de sentimiento en portugues (positivo, negativo, neutro) sobre texto de resenas, noticias financieras y frases de dominio financiero.
- Clasificacion de emociones multi-etiqueta (6 categorias en BRIGHTER, hasta 28 en GoEmotions PT-BR).
- Generacion de texto condicionada por esquema mediante decodificacion guiada, apta para extraccion de etiquetas estructuradas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no esta disenado para ello.
- Capacidades multilingues: limitadas al portugues de Brasil; no se declaran otros idiomas.
- Capacidad especial: modo de clasificacion con salida JSON validada por Pydantic en pipelines vLLM.
- No dispone de vision, audio ni modo thinking declarado.

## Casos de uso

- Analisis de sentimiento de resenas de productos o libros en PT-BR: el modelo clasifica resenas (dominio ReLi-SA) con macro F1 de 46,36 %, util para triaje automatico de feedback a gran escala donde el coste por inferencia de un 0,5B es marginal.
- Monitorizacion de noticias financieras: sobre Sentiments-FinBERT-PT-BR alcanza 71,82 % de macro F1, suficiente para etiquetar titulares y notas de prensa en un pipeline de alertas de mercado.
- Analisis de sentimiento en frases financieras cortas: con 70,17 % de macro F1 en Financial Phrasebank PT-BR, encaja en la clasificacion de comunicados y extractos de informes.
- Deteccion de emociones en redes sociales y comentarios: sobre GoEmotions PT-BR obtiene 21,59 % de macro F1, por lo que solo es recomendable como senal auxiliar o en combinacion con un modelo mayor, no como clasificador principal.
- Etiquetado multi-etiqueta de emociones en soporte al cliente: BRIGHTER ptbr con 39,03 % de macro F1 permite un primer filtrado de tickets por tono emocional antes de escalado humano.
- Investigacion sobre model merging: el checkpoint sirve como referencia reproducible del ablation de densidad 0,7 para comparar TIES frente a otras tecnicas de fusion y frente al entrenamiento conjunto.
- Prototipado en entornos con recursos limitados: al ocupar 490,8 M de parametros (repo de 3,9 GB en safetensors) puede desplegarse en una sola GPU consumer para experimentos de clasificacion en portugues.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), metrica Macro F1:

| Tarea / dataset | Metrica | Tucano2-qwen-0.5B-TIES-0.7 |
|---|---|---|
| Sentiment Analysis — ReLi-SA | Macro F1 | 46,36 |
| Emotion Classification — BRIGHTER (ptbr) | Macro F1 | 39,03 |
| Sentiment Analysis — Sentiments-FinBERT-PT-BR | Macro F1 | 71,82 |
| Sentiment Analysis — Financial Phrasebank PT-BR | Macro F1 | 70,17 |
| Emotion Classification — GoEmotions PT-BR | Macro F1 | 21,59 |

La model card menciona comparaciones adicionales frente al baseline zero-shot (`Polygl0t/Tucano2-qwen-0.5B-Instruct`) y frente a un baseline multi-tarea conjunto (Joint), pero los valores completos de esas columnas no estan disponibles en la informacion proporcionada. En ReLi-SA, el baseline zero-shot registra 30,66 % de macro F1 y el modelo conjunto 59,51 %, por encima de la fusion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 (490,8 M de parametros) y en torno a 0,5 GB en int8; el repo completo ocupa 3,9 GB por incluir pesos sin cuantizar y artefactos asociados.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100 y RTX 4090 son sobredimensionadas para este tamano y solo se justifican por agregacion de peticiones.
- Cabe en GPU consumer: si, en GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: transformers, text-generation-inference (tag declarado), vLLM con decodificacion guiada y Pydantic (metodologia de evaluacion del autor), y endpoints compatibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 ReLi-SA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-TIES-0.7 | 490,8 M | no disponible | 46,36 | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (zero-shot) | ~0,5B | no disponible | 30,66 | no disponible | Hugging Face |
| Baseline Joint multi-tarea (mismo autor) | ~0,5B | no disponible | 59,51 | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior al entrenamiento multi-tarea conjunto en ReLi-SA (46,36 frente a 59,51 de macro F1), lo que cuestiona la fusion como sustituto del SFT conjunto en este regimen de tamano.
- Resultados muy bajos en GoEmotions PT-BR (21,59 % de macro F1) y moderados en BRIGHTER (39,03 %), insuficientes para produccion sin supervision humana.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre resenas, noticias financieras y redes sociales en PT-BR, hereda los sesgos de dominio y de registro de esos corpus.
- Riesgo de alucinacion: el modelo es generativo y solo la decodificacion guiada con esquema restringe la salida a etiquetas validas; sin ese constraint puede emitir texto libre no fiable.
- Limitacion de idioma: solo portugues de Brasil; no se garantiza comportamiento en portugues europeo ni en otros idiomas.
- Longitud de contexto no especificada: no se debe asumir una ventana amplia para documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero los benchmarks son declarados por el autor y no verificados; conviene revalidar en el dominio propio antes de desplegar.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TIES-0.7
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del articulo: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Especialista FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Especialista ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Especialista Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Especialista Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Especialista GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA (repositorio): https://github.com/ruanchaves/reli
- Dataset BRIGHTER (ptbr): https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
