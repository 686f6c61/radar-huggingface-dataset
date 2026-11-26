# Assaoka/Tucano2-qwen-0.5B-PriorMerge-Brighter

## Resumen
Tucano2-qwen-0.5B-PriorMerge-Brighter es un modelo de lenguaje pequeno (SLM) de 0,5 mil millones de parametros, desarrollado por Assaoka, especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil. Se construye mediante TIES-Merging a partir de cinco modelos padres: un modelo prior fuera de dominio (Prior-Brighter) y cuatro especialistas (FinBERT, ReLiSA, Phrasebank y GoEmotions), todos derivados de la familia Tucano2-qwen-0.5B.

El modelo forma parte del trabajo de investigacion "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. Su relevancia radica en demostrar que la fusion de modelos especializados permite obtener un unico SLM multitarea con un coste computacional minimo, apto para despliegue en entornos con recursos limitados.

La ficha se basa en la model card oficial y en los resultados declarados por el autor (no verificados de forma independiente). No se dispone de informacion detallada sobre la longitud de contexto nativa ni sobre el proceso exacto de entrenamiento de los modelos padres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Tucano2-qwen-0.5B), fusionada mediante TIES-Merging |
| Parametros totales | 0,5 mil millones (aproximado, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato estandar de transformers; no confirmado explicitamente en la model card) |

## Arquitectura y entrenamiento
El modelo es el resultado de una fusion TIES-Merging con hiperparametros `weight = 0.20` y `density = 0.50`, que combina el modelo prior `Tucano2-qwen-0.5B-Prior-Brighter` con cuatro especialistas: `Tucano2-qwen-0.5B-FinBERT`, `Tucano2-qwen-0.5B-ReLiSA`, `Tucano2-qwen-0.5B-Phrasebank` y `Tucano2-qwen-0.5B-GoEmotions`. La arquitectura subyacente es la de Tucano2-qwen-0.5B, un transformer decoder-only de la familia Qwen adaptado al portugues.

Los datos de entrenamiento de los modelos padres incluyen cinco conjuntos en portugues: ReLi-SA (resenas de libros), BRIGHTER ptbr (6 emociones multilabel), Sentiments-FinBERT-PT-BR (noticias financieras), Financial Phrasebank PT-BR (traduccion al portugues) y GoEmotions PT-BR (28 emociones, con un 50% de split aleatorio de entrenamiento). No se especifica el numero total de tokens ni si hubo RLHF o DPO. La innovacion principal es el uso de fusion de modelos para consolidar especialistas en un unico SLM multitarea sin reentrenamiento conjunto.

## Capacidades
- Clasificacion de sentimiento en portugues (positivo, negativo, neutro) en dominios general, financiero y de resenas.
- Clasificacion de emociones multilabel (6 categorias en BRIGHTER; 28 en GoEmotions PT-BR).
- Generacion de texto condicionada a tareas de clasificacion mediante decodificacion guiada (guided decoding con vLLM y Pydantic).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al portugues (PT-BR); no se declaran otros idiomas.
- Capacidades especiales: no se declaran modos thinking, vision ni audio.

## Casos de uso
- Analisis de sentimiento en resenas de productos o libros: el modelo puede clasificar opiniones en portugues gracias a su especializacion en ReLi-SA, adecuado para monitorizar reputacion en plataformas de e-commerce.
- Clasificacion de emociones en redes sociales: con GoEmotions PT-BR y BRIGHTER, permite detectar emociones en comentarios y publicaciones, util para moderacion o analisis de comunidad.
- Analisis de sentimiento financiero: el especialista FinBERT y Phrasebank permite procesar noticias economicas en portugues para senales de mercado o alertas.
- Moderacion de contenido automatizada: la clasificacion de emociones y sentimiento ayuda a priorizar revisiones humanas en foros y plataformas.
- Investigacion academica en PLN: modelo ligero para experimentos de fusion de modelos y evaluacion multitarea en portugues, con licencia Apache 2.0.
- Despliegue en entornos con recursos limitados: al tener 0,5B parametros, puede ejecutarse en CPU o GPU de gama baja para tareas de clasificacion por lotes.
- Enriquecimiento de datasets: etiquetado automatico de sentimiento y emociones en corpus en portugues para entrenar otros modelos.

## Benchmarks y rendimiento

| Dataset / Tarea | Metrica | Macro F1 |
|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 45,39 |
| BRIGHTER ptbr (emociones) | Macro F1 | 41,84 |
| Sentiments-FinBERT-PT-BR (sentimiento) | Macro F1 | 70,86 |
| Financial Phrasebank PT-BR (sentimiento) | Macro F1 | 68,68 |
| GoEmotions PT-BR (emociones) | Macro F1 | 23,02 |

Los resultados son los declarados por el autor en la model card (no verificados). La model card menciona comparaciones con el baseline zero-shot (`Polygl0t/Tucano2-qwen-0.5B-Instruct`) y un baseline Joint multi-task SFT, pero no se proporcionan los valores completos de esos baselines en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP16 para 0,5B parametros; menos de 1 GB en cuantizacion de 8 bits o 4 bits (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente; tambien cabe en CPU para inferencia por lotes.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en placas integradas con suficiente memoria.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor para decodificacion guiada), llama.cpp/Ollama (previa conversion a GGUF, no confirmada).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (ReLi-SA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-PriorMerge-Brighter | 0,5B | no disponible | 45,39 | Apache 2.0 | Hugging Face |
| Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | 0,5B | no disponible | no disponible | no disponible | Hugging Face |
| Baseline Joint multi-task SFT | 0,5B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos numericos de los baselines en la informacion proporcionada; la comparativa se limita a la existencia de dichos modelos citados por el autor.

## Limitaciones y advertencias
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- El modelo esta especializado en portugues (PT-BR); su rendimiento en otros idiomas no esta documentado.
- El Macro F1 en GoEmotions PT-BR es bajo (23,02), lo que sugiere dificultades en la clasificacion de 28 emociones.
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos; al ser un modelo pequeno y fusionado, puede heredar sesgos de los datasets de origen.
- La longitud de contexto no esta especificada, lo que limita su uso en documentos largos.
- Aunque la licencia es Apache 2.0, se recomienda revisar las licencias de los modelos padres y datasets subyacentes para uso comercial.
- La retencion del modelo esta garantizada durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026), segun el autor.

## Enlaces
- [Hugging Face: Assaoka/Tucano2-qwen-0.5B-PriorMerge-Brighter](https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-PriorMerge-Brighter)
- [Paper ENIAC 2026 (SBC OpenLib)](https://sol.sbc.org.br/index.php/eniac/article/view/47030)
- [DOI: 10.5753/eniac.2026.31064](https://doi.org/10.5753/eniac.2026.31064)
- [Coleccion Hugging Face: United Experts](https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f)
- [Modelo padre: Tucano2-qwen-0.5B-Prior-Brighter](https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-Brighter)
- [Modelo padre: Tucano2-qwen-0.5B-FinBERT](https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT)
- [Modelo padre: Tucano2-qwen-0.5B-ReLiSA](https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA)
- [Modelo padre: Tucano2-qwen-0.5B-Phrasebank](https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank)
- [Modelo padre: Tucano2-qwen-0.5B-GoEmotions](https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions)
- [Dataset ReLi-SA](https://github.com/ruanchaves/reli)
- [Dataset BRIGHTER](https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories)
- [Dataset Sentiments-FinBERT-PT-BR](https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR)
- [Dataset Financial Phrasebank PT-BR (Kaggle)](https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation)
- [Dataset GoEmotions PT-BR](https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr)
