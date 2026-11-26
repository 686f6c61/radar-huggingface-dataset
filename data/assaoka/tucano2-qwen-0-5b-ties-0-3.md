# Assaoka/Tucano2-qwen-0.5B-TIES-0.3

## Resumen

Tucano2-qwen-0.5B-TIES-0.3 es un modelo de lenguaje pequeno (SLM) en portugues de Brasil, obtenido mediante fusion de modelos (model merging) con la tecnica TIES-Merging y una densidad de poda de 0.3. Lo desarrolla Assaoka como parte del articulo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. El modelo parte de la familia Tucano2 (derivada de Qwen) y combina cinco especialistas de dominio entrenados sobre tareas de analisis de sentimiento y clasificacion de emociones.

El problema que aborda es el de consolidar multiples tareas de clasificacion afectiva en portugues (sentimiento financiero, resenas de libros, emociones multi-etiqueta) en un unico modelo de ~491 millones de parametros, evitando mantener cinco cabezas especializadas por separado. La fusion TIES permite combinar los pesos de los cinco especialistas resolviendo interferencias entre tareas mediante el truncado de deltas poco significativos y la resolucion de conflictos de signo.

Es relevante como ejemplo practico de merging de SLMs aplicado a PLN en portugues con fines de investigacion: demuestra que un modelo de menos de 0,5B de parametros puede cubrir varias tareas afectivas con una licencia permisiva (Apache 2.0) y un coste de inferencia muy bajo. El contexto nativo no esta declarado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), segun tags del repositorio |
| Parametros totales | 490.799.104 (~0,49B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se declaran variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion TIES-Merging con densidad 0.3 sobre cinco especialistas de la misma base Qwen3 de 0,5B: FinBERT, ReLiSA, Brighter, Phrasebank y GoEmotions. La fusion emplea pesos iguales (0,20) para los cinco padres, con `normalize: true` e `int8_mask: true`. TIES-Merging trunca los deltas de pesos por debajo de un umbral de densidad (aqui 0,30), resuelve conflictos de signo entre modelos y promedia los parametros restantes, lo que reduce la interferencia entre tareas especializadas.

Los especialistas se entrenaron sobre cinco conjuntos de datos en portugues: ReLi-SA (resenas de libros), BRIGHTER ptbr (6 emociones multi-etiqueta), Sentiments-FinBERT-PT-BR (noticias financieras), Financial Phrasebank PT-BR y GoEmotions PT-BR (28 emociones, con un 50% de split de entrenamiento aleatorio). La informacion disponible no detalla el numero de tokens de entrenamiento ni si se aplico RLHF o DPO; el proceso es de ajuste supervisado por tarea seguido de fusion, no de alineamiento por preferencias.

La innovacion tecnica principal es metodologica: un ablation de densidad de poda dentro de un estudio mas amplio de merging de SLMs para analisis multi-tarea de sentimiento. La evaluacion se realizo con decodificacion guiada (guided decoding) mediante vLLM y Pydantic, lo que fuerza la salida a las etiquetas validas de cada tarea.

## Capacidades

- Clasificacion de sentimiento en portugues (positivo/negativo/neutro segun la tarea), con salida forzada mediante decodificacion guiada.
- Clasificacion de emociones multi-etiqueta (BRIGHTER con 6 categorias; GoEmotions PT-BR con 28 emociones).
- Analisis de sentimiento en dominio financiero (noticias y frases financieras en PT-BR).
- Analisis de sentimiento en resenas de libros (ReLi-SA).
- Generacion de texto conversacional heredada de la base Qwen3-Tucano2-Instruct (tag `conversational`), aunque el ajuste esta orientado a clasificacion.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta disenado para tareas de clasificacion puntual.
- Capacidades multilingues: limitadas al portugues; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Moderacion de comunidades en portugues: clasificar comentarios por emocion (enfado, alegria, tristeza) usando las 28 etiquetas de GoEmotions PT-BR para priorizar revision humana en foros o redes.
- Analisis de sentimiento de resenas de productos o libros: procesar lotes de resenas en PT-BR con el modelo fusionado, que cubre el dominio de ReLi-SA sin necesidad de desplegar un modelo mayor.
- Monitorizacion de sentimiento financiero: analizar titulares y notas de prensa economicas en portugues con la especializacion heredada de FinBERT y Phrasebank, integrable en un pipeline de alertas.
- Investigacion en PLN afectivo: usar el modelo como baseline de merging en estudios comparativos de SLMs, dado que el autor publica el ablation de densidad y la comparativa con el baseline zero-shot y el modelo Joint.
- Clasificacion por lotes de bajo coste: al tener ~0,49B de parametros, puede ejecutarse en CPU o GPU de gama baja para etiquetar grandes volumenes de texto portugues sin coste de API.
- Etiquetado asistido de datasets: pre-anotar corpus de emociones en portugues para su posterior revision humana, aprovechando la decodificacion guiada para garantizar etiquetas validas.
- Deteccion de emociones en atencion al cliente: enrutar tickets segun la emocion detectada (frustracion, satisfaccion) en soporte en portugues.

## Benchmarks y rendimiento

Resultados declarados por el autor (Macro F1, no verificados de forma independiente), evaluados con decodificacion guiada via vLLM + Pydantic:

| Dataset / tarea | Metrica | Tucano2-qwen-0.5B-TIES-0.3 |
|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 46,36 |
| BRIGHTER ptbr (emociones) | Macro F1 | 39,08 |
| Sentiments-FinBERT-PT-BR (sentimiento financiero) | Macro F1 | 71,82 |
| Financial Phrasebank PT-BR (sentimiento financiero) | Macro F1 | 69,86 |
| GoEmotions PT-BR (emociones) | Macro F1 | 21,59 |

La model card incluye ademas una comparativa con el baseline zero-shot (`Polygl0t/Tucano2-qwen-0.5B-Instruct`) y un baseline Joint multi-tarea; los valores completos de esos dos modelos no estan disponibles en la informacion proporcionada mas alla de los datos parciales de ReLi-SA (baseline 30,66 de Macro F1; Joint 59,51 de Macro F1).

## Requisitos de hardware

- VRAM estimada: en FP16, aproximadamente 1 GB para los pesos (~0,98 GB) mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, en torno a 0,5 GB; en 4 bits, en torno a 0,3 GB (estimaciones a partir del numero de parametros, no declaradas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; tambien cabe en GPUs de datacenter (A100, H100) para despliegues de alto throughput, aunque estan sobredimensionadas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor con decodificacion guiada y Pydantic), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). Soporte de llama.cpp u Ollama no declarado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 ReLi-SA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-TIES-0.3 | ~0,49B | no disponible | 46,36 | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | ~0,5B | no disponible | 30,66 | no disponible | Hugging Face |
| Baseline Joint multi-tarea (SFT conjunto) | ~0,5B | no disponible | 59,51 | no disponible | Referenciado en el paper |

El modelo fusionado supera al baseline zero-shot en ReLi-SA pero queda por debajo del baseline Joint multi-tarea en esa misma tarea, segun los datos parciales de la model card. No se dispone de comparativas con otros modelos de la misma categoria fuera del estudio.

## Limitaciones y advertencias

- Resultados no verificados: los benchmarks proceden del model-index del autor y no han sido validados de forma independiente.
- Rendimiento bajo en GoEmotions PT-BR (21,59 de Macro F1), lo que limita su uso fiable en clasificacion fina de 28 emociones.
- Rendimiento moderado en BRIGHTER (39,08 de Macro F1) y ReLi-SA (46,36), por debajo del baseline Joint en ReLi-SA.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre resenas, noticias financieras y comentarios, puede heredar sesgos de dominio y de genero/registro de esos corpus.
- Riesgo de alucinacion: el modelo es generativo en origen (Qwen3) y la clasificacion depende de decodificacion guiada; sin forzar etiquetas puede producir texto libre no valido para clasificacion.
- Limitacion de idioma: solo portugues (PT-BR); no se garantiza comportamiento en portugues europeo ni en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de origen y de los modelos padre.
- Caveat de produccion: el autor declara retention policy de al menos 1 ano tras la finalizacion de la tesis (diciembre de 2026); no hay garantia de mantenimiento a largo plazo.
- Contexto nativo no declarado: no se puede planificar con una ventana de contexto concreta sin verificacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TIES-0.3
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del articulo: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo padre FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo padre ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo padre Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo padre Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Modelo padre GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
