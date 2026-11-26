# Assaoka/Tucano2-qwen-0.5B-Prior-FinBERT

## Resumen

Tucano2-qwen-0.5B-Prior-FinBERT es un modelo de lenguaje pequeno (SLM) de 490.799.104 parametros, derivado de la familia Qwen3 y especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil. Lo desarrolla el autor independiente Assaoka como parte del trabajo presentado en ENIAC 2026, titulado "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging". El modelo no se entrena desde cero: se construye fusionando cuatro especialistas fuera de dominio (ReLiSA, Brighter, Phrasebank y GoEmotions) mediante TIES-Merging y, posteriormente, aplicando un ajuste fino supervisado (SFT) sobre el conjunto financiero FinBERT-PT-BR.

La propuesta tecnica es tratar la fusion de modelos como un prior de inicializacion fuera de dominio: en lugar de partir del modelo instructivo generico, se parte de una mezcla de especialistas y se afina sobre la tarea objetivo. Esto permite obtener un modelo de ~0,5B parametros que cubre cinco benchmarks de sentimiento y emociones en portugues con una sola cabecera generativa, en lugar de mantener cinco clasificadores independientes.

Su relevancia practica esta en el coste: al ser un modelo de menos de 500 millones de parametros con licencia Apache 2.0, se puede desplegar en infraestructura modesta y ejecutar con decodificacion guiada (por ejemplo, via vLLM y Pydantic) para forzar salidas estructuradas de clasificacion. El contexto maximo no esta declarado en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajustado para clasificacion via generacion guiada |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/vLLM, sin variantes publicadas por el autor) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3 en su variante de 0,5B parametros, es decir, un transformer decoder-only de tipo generativo. La innovacion no esta en la arquitectura sino en el pipeline de construccion: se toman cuatro especialistas ajustados de forma independiente sobre el mismo backbone (ReLiSA para resenas de libros, Brighter para seis emociones multi-etiqueta, Phrasebank para frases financieras y GoEmotions para 28 emociones) y se fusionan con TIES-Merging usando `weight = 0.25` y `density = 0.50`. Esa mezcla actua como inicializacion (prior) fuera de dominio y despues se aplica SFT sobre FinBERT-PT-BR, el conjunto objetivo de sentimiento financiero.

El entrenamiento se evalua con decodificacion guiada mediante vLLM y Pydantic, lo que restringe la generacion a etiquetas validas y convierte al modelo generativo en un clasificador efectivo. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset de SFT ni si se aplicaron tecnicas de RLHF o DPO. Los conjuntos de datos declarados son `ruanchaves/reli-sa`, `brighter-dataset/BRIGHTER-emotion-categories`, `lucas-leme/Sentiments-FinBERT-PT-BR`, `antoniomenezes/go_emotions_ptbr` (con un 50 % de split aleatorio de entrenamiento) y la traduccion PT-BR de Financial Phrasebank alojada en Kaggle.

## Capacidades

- Generacion de texto en portugues de Brasil con foco en tareas de clasificacion.
- Analisis de sentimiento (positivo, negativo, neutro) sobre textos financieros y de resenas.
- Clasificacion de emociones multi-etiqueta (6 categorias en Brighter, 28 en GoEmotions).
- Salidas estructuradas mediante decodificacion guiada (vLLM + Pydantic), lo que permite integrarlo como clasificador determinista.
- Capacidad multilingue limitada: el modelo esta entrenado y evaluado solo en portugues.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Analisis de sentimiento de noticias financieras: el modelo se afino sobre FinBERT-PT-BR y Financial Phrasebank PT-BR, por lo que puede clasificar titulares y comunicados en portugues para alimentar paneles de riesgo de mercado o alertas de reputacion.
- Monitorizacion de resenas de productos o libros: con el linaje ReLiSA, sirve para etiquetar opiniones de usuarios en plataformas de comercio electronico o catalogos editoriales, agregando polaridad por producto.
- Moderacion de comunidades y redes sociales: la componente GoEmotions permite detectar emociones como enfado, tristeza o alegria en comentarios, util para priorizar revision humana en foros y canales de soporte.
- Analisis de voz del cliente en soporte: clasificar tickets y conversaciones por emocion y sentimiento permite enrutar casos criticos a agentes senior y medir satisfaccion de forma automatica.
- Investigacion en PLN de bajo recurso: al ser un SLM de 0,5B con licencia Apache 2.0, es un punto de partida reproducible para experimentos de model merging y evaluacion multi-tarea en portugues, con coste de computo reducido.
- Clasificacion por lotes en pipelines ETL: su tamano permite procesar grandes volumenes de texto en CPU o GPU modesta, integrándose en flujos de datos para enriquecer registros con etiquetas de sentimiento y emocion.
- Deteccion de riesgo reputacional en medios: combinando sentimiento financiero y emociones, se puede construir un indice de tono mediatico por empresa o sector.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente), con decodificacion guiada via vLLM y Pydantic:

| Dataset / tarea | Metrica | Tucano2-qwen-0.5B-Prior-FinBERT | Baseline zero-shot | Joint multi-task |
|---|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 40,23 | 30,66 | 59,51 |
| ReLi-SA (sentimiento) | Micro F1 | 56,30 | 37,07 | 74,51 |
| ReLi-SA (sentimiento) | Accuracy | 56,30 | 37,07 | 74,51 |
| ReLi-SA (sentimiento) | Hamming Loss | 0,4370 | 0,6293 | 0,2549 |
| BRIGHTER ptbr (emociones) | Macro F1 | 39,47 | no disponible | no disponible |
| Sentiments-FinBERT-PT-BR (sentimiento) | Macro F1 | 79,72 | no disponible | no disponible |
| Financial Phrasebank PT-BR (sentimiento) | Macro F1 | 66,10 | no disponible | no disponible |
| GoEmotions PT-BR (emociones) | Macro F1 | 21,48 | no disponible | no disponible |

El modelo supera al baseline zero-shot en ReLi-SA, pero queda por debajo del baseline Joint multi-task en esa misma tarea, lo que sugiere que el prior por fusion no compensa la perdida de rendimiento en dominios fuera del objetivo de SFT.

## Requisitos de hardware

- VRAM estimada: en FP16, aproximadamente 1 GB para los pesos (490,8 M parametros); en cuantizacion de 8 bits, en torno a 0,5 GB; en 4 bits, alrededor de 0,3 GB, mas el espacio de cache KV segun contexto.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) es sobrada; en servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, e incluso en CPU para lotes pequenos.
- Opciones de despliegue: transformers, vLLM (usado por el autor con decodificacion guiada), TGI (el repo esta marcado como compatible con text-generation-inference), llama.cpp/Ollama si se generan pesos GGUF (no publicados por el autor).
- Latencia y throughput: no disponible de forma explicita; por el tamano del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Prior-FinBERT | 490,8 M | no disponible | Fusion TIES + SFT financiero, PT-BR | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct | ~0,5 B | no disponible | Baseline instructivo zero-shot, PT | no disponible en la informacion | Hugging Face |
| Baseline Joint multi-task (mismo paper) | ~0,5 B | no disponible | SFT multi-tarea conjunto, PT | no disponible en la informacion | Referenciado en el paper ENIAC 2026 |
| FinBERT-PT-BR (referencia de dominio) | no disponible | no disponible | Clasificador BERT financiero, PT-BR | no disponible en la informacion | Hugging Face (dataset asociado) |

La comparativa directa con clasificadores BERT dedicados no esta disponible en la informacion proporcionada; el autor solo reporta frente al baseline zero-shot y al baseline Joint del mismo estudio.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en portugues de Brasil; su uso en otros idiomas no esta validado.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- En ReLi-SA rinde claramente por debajo del baseline Joint multi-task (40,23 frente a 59,51 de Macro F1), lo que indica que el prior por fusion no es optimo para todos los dominios.
- El rendimiento en GoEmotions PT-BR es bajo (21,48 de Macro F1), por lo que no es fiable para clasificacion fina de 28 emociones.
- Al ser un modelo generativo usado como clasificador, depende de decodificacion guiada; sin ella puede producir etiquetas fuera del conjunto valido.
- Riesgo de alucinacion y de sesgos presente por herencia de los datos de entrenamiento (resenas, noticias financieras y redes sociales), sin auditoria de sesgos publicada.
- Aunque la licencia es Apache 2.0, el autor se compromete a mantener el alojamiento publico al menos un ano tras la finalizacion de la tesis (diciembre de 2026), lo que conviene tener en cuenta para dependencias a largo plazo.
- No hay informacion sobre la longitud de contexto soportada, lo que limita la planificacion de despliegues con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-FinBERT
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face del proyecto: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo base ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Modelo base Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo base Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Modelo base GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://huggingface.co/datasets/ruanchaves/reli-sa
- Dataset BRIGHTER emotion categories: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
- Dataset Financial Phrasebank PT-BR (Kaggle): https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Repositorio ReLi: https://github.com/ruanchaves/reli
