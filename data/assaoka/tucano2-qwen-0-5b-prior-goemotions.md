# Assaoka/Tucano2-qwen-0.5B-Prior-GoEmotions

## Resumen
Tucano2-qwen-0.5B-Prior-GoEmotions es un modelo de lenguaje pequeno (SLM) de 490.799.104 parametros, desarrollado por Assaoka y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino (SFT) sobre la base Qwen3 de 0.5B, especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil (PT-BR). Forma parte del trabajo presentado en el articulo ENIAC 2026 "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging".

El modelo se construye mediante una estrategia de fusion de modelos (TIES-Merging) aplicada a cuatro especialistas fuera de dominio (FinBERT, ReLiSA, Brighter y Phrasebank), que actua como inicializacion previa (prior OOD), seguida de un ajuste fino supervisado sobre el conjunto GoEmotions PT-BR. El resultado es un unico modelo compacto capaz de abordar multiples tareas de clasificacion afectiva en portugues, con un enfoque de generacion de texto guiada por decodificacion restringida.

Su relevancia radica en demostrar que la fusion de modelos pequenos especializados, combinada con SFT, puede ofrecer un rendimiento competitivo en tareas multiples con un coste computacional minimo, lo que lo hace adecuado para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3 0.5B) |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura Qwen3 en su variante de 0.5B parametros, un transformer decoder-only. Sobre esta base se aplica una fusion TIES-Merging de cuatro especialistas entrenados en dominios distintos: FinBERT (noticias financieras), ReLiSA (resenas de libros), Brighter (emociones multi-etiqueta) y Phrasebank (frases financieras). La fusion emplea un peso de 0.25 y una densidad de 0.50.

Posteriormente, el modelo fusionado se somete a un ajuste fino supervisado (SFT) sobre el conjunto GoEmotions PT-BR, que contiene 28 categorias emocionales y del que se utiliza el 50% de la particion de entrenamiento aleatoria. El objetivo es evaluar la fusion como prior de inicializacion fuera de dominio. La evaluacion se realizo con decodificacion guiada mediante vLLM y Pydantic para restringir las salidas a las etiquetas validas.

## Capacidades
- Generacion de texto en portugues de Brasil.
- Clasificacion de sentimiento (positivo, negativo, neutro) en dominios como resenas, noticias financieras y frases financieras.
- Clasificacion de emociones multi-etiqueta (28 emociones en GoEmotions PT-BR; 6 emociones en BRIGHTER).
- Soporte de decodificacion guiada para forzar salidas estructuradas y validas (integracion con vLLM y Pydantic).
- Capacidad multilingue limitada al portugues; no se declaran otros idiomas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso
- Analisis de sentimiento en resenas de productos o libros: el modelo puede clasificar resenas en portugues como positivas, negativas o neutras, aprovechando su entrenamiento en ReLi-SA y su capacidad de generar etiquetas restringidas.
- Monitorizacion de emociones en redes sociales: con GoEmotions PT-BR, permite detectar las 28 emociones en comentarios y publicaciones, util para estudios de opinion o moderacion asistida.
- Analisis de sentimiento financiero: entrenado con FinBERT y Phrasebank, puede procesar noticias y frases financieras en portugues para extraer polaridad, adecuado para sistemas de alerta temprana en finanzas.
- Clasificacion multi-etiqueta de emociones en textos cortos: el modelo puede asignar multiples emociones simultaneas (BRIGHTER), util en investigacion de psicologia computacional o analisis de customer feedback.
- Prototipado rapido en entornos con recursos limitados: al ser un SLM de 0.5B, se puede desplegar en una unica GPU consumer o incluso en CPU con cuantizacion, lo que facilita pruebas de concepto y experimentacion academica.
- Generacion de datos etiquetados para entrenamiento: el modelo puede utilizarse como anotador automatico de sentimiento y emociones en corpus portugueses, reduciendo el coste de etiquetado manual en proyectos de NLP.

## Benchmarks y rendimiento

| Dataset / Tarea | Metrica | Tucano2-qwen-0.5B-Prior-GoEmotions | Baseline zero-shot | Joint multi-task |
|---|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 21,92% | 30,66% | 59,51% |
| BRIGHTER (emociones) | Macro F1 | 39,02% | no disponible | no disponible |
| Sentiments-FinBERT-PT-BR | Macro F1 | 14,47% | no disponible | no disponible |
| Financial Phrasebank PT-BR | Macro F1 | 29,59% | no disponible | no disponible |
| GoEmotions PT-BR | Macro F1 | 30,00% | no disponible | no disponible |

Los resultados declarados por el autor corresponden a la evaluacion con decodificacion guiada (vLLM + Pydantic). No se han publicado en la informacion disponible los valores del baseline zero-shot ni del modelo Joint para todas las tareas, salvo en ReLi-SA.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 0.5B parametros, en precision FP16 requiere aproximadamente 1 GB de VRAM; en cuantizacion de 8 bits, unos 0.5 GB; en 4 bits, unos 0.3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) es suficiente. Para mayor throughput, se recomienda RTX 4090, A100 o H100, aunque el modelo no aprovechara plenamente su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers (libreria nativa), vLLM (usado en la evaluacion con decodificacion guiada), TGI (text-generation-inference, etiqueta presente en el repo). No se documenta soporte explicito para llama.cpp u Ollama, aunque al ser un modelo transformers es probable que se pueda convertir a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 ReLi-SA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Prior-GoEmotions | 0,49B | no disponible | 21,92% | Apache 2.0 | Hugging Face |
| Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | 0,5B | no disponible | 30,66% | no disponible | Hugging Face |
| Joint multi-task (referencia del paper) | no disponible | no disponible | 59,51% | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias
- El modelo esta especializado en portugues de Brasil; su rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (verified: false en el model-index).
- El rendimiento en ReLi-SA (21,92% Macro F1) es inferior al baseline zero-shot (30,66%) y muy inferior al modelo Joint (59,51%), lo que sugiere que la fusion como prior OOD no mejora en todas las tareas.
- Riesgo de alucinacion y salidas inconsistentes en tareas de generacion libre; el modelo esta disenado para clasificacion con decodificacion guiada, no para generacion abierta.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda evaluar el rendimiento en el dominio especifico antes de desplegarlo en produccion.
- No se documentan sesgos conocidos, pero al entrenarse con datos de resenas y emociones, puede heredar sesgos presentes en esos corpus.
- La retencion del modelo esta garantizada durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026), segun la model card.

## Enlaces
- Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-GoEmotions
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo base FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo base ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo base Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo base Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
