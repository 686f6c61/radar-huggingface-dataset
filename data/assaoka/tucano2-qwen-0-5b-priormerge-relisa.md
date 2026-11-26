# Assaoka/Tucano2-qwen-0.5B-PriorMerge-ReLiSA

## Resumen

Tucano2-qwen-0.5B-PriorMerge-ReLiSA es un modelo de lenguaje pequeno (SLM) de 0,5 mil millones de parametros, especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil. Lo desarrolla el autor independiente Assaoka como parte del trabajo presentado en el congreso ENIAC 2026 bajo el titulo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging". No es un modelo entrenado desde cero, sino el resultado de fusionar mediante TIES-Merging cinco variantes especializadas del mismo modelo base.

El modelo parte de la familia Tucano2 (Qwen 0.5B adaptado al portugues) y combina un modelo "prior" de dominio general con cuatro especialistas: uno financiero (FinBERT PT-BR), uno de emociones multietiqueta (BRIGHTER), uno de frases financieras (Phrasebank) y uno de emociones sociales (GoEmotions). La fusion se realiza con TIES-Merging usando un peso de 0,20 y una densidad de 0,50, lo que permite retener las capacidades de cada especialista en un unico conjunto de pesos.

Su relevancia radica en demostrar que un modelo de apenas 0,5B parametros puede cubrir cinco tareas de clasificacion de sentimiento y emocion en portugues mediante merging, sin necesidad de reentrenar un modelo multitarea desde cero. Esta pensado para despliegues ligeros, con licencia Apache 2.0 y evaluacion con decodificacion guiada sobre vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen 0.5B, familia Tucano2) |
| Parametros totales | 0,5 mil millones (aproximado, segun nomenclatura del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato transformers estandar) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen 0.5B, adaptado al portugues dentro de la familia Tucano2. No se entrena desde cero en esta ficha: se obtiene por TIES-Merging (Trim, Elect Sign, Merge) de cinco checkpoints hermanos. El proceso de TIES elimina parametros redundantes o de bajo signo de conflicto (trimming), resuelve los conflictos de signo entre modelos (elect sign) y combina los pesos restantes con una media ponderada. Los hiperparametros declarados son weight = 0.20 y density = 0.50.

Los datos de entrenamiento de los modelos padres cubren cinco dominios: resenas de libros (ReLi-SA), noticias financieras (Sentiments-FinBERT-PT-BR), frases financieras traducidas (Financial Phrasebank PT-BR), emociones multietiqueta de seis categorias (BRIGHTER ptbr) y 28 emociones sociales de Reddit (GoEmotions PT-BR, con un 50% de split de entrenamiento aleatorio). No se especifica el numero total de tokens de entrenamiento ni si hubo RLHF o DPO; el entrenamiento de los especialistas es presumiblemente SFT supervisado sobre cada dataset. La evaluacion se realizo con decodificacion guiada mediante vLLM y Pydantic para forzar salidas estructuradas.

## Capacidades

- Clasificacion de sentimiento en portugues (positivo, negativo, neutro) en dominios de resenas de libros, noticias financieras y frases financieras.
- Clasificacion de emociones multietiqueta (6 categorias en BRIGHTER, 28 en GoEmotions PT-BR).
- Generacion de texto en portugues como modelo decoder-only subyacente, aunque su uso previsto es la clasificacion.
- Salidas estructuradas mediante decodificacion guiada (guided decoding) con vLLM y validacion con Pydantic.
- Capacidad multitarea en un unico conjunto de pesos gracias al merging, sin cambiar de checkpoint por tarea.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Moderacion de comentarios en redes sociales: el modelo puede clasificar emociones (28 categorias de GoEmotions) en comentarios de usuarios en portugues, lo que permite priorizar revision humana en funcion de la emocion detectada (enfado, toxicidad, alegria).
- Analisis de sentimiento de resenas de productos o libros: entrenado sobre ReLi-SA, es adecuado para procesar resenas en portugues y agregar la polaridad por producto o autor, con un coste computacional minimo al ser 0,5B.
- Monitorizacion de noticias financieras: el especialista FinBERT PT-BR permite clasificar el tono de noticias economicas en positivo, negativo o neutro para alimentar paneles de riesgo o alertas de mercado.
- Analisis de sentimiento en frases financieras: el especialista Phrasebank sirve para tareas de clasificacion de frases cortas de ambito financiero, util en pipelines de extraccion de senal para research cuantitativo.
- Procesamiento por lotes de bajo coste: al ser un modelo de 0,5B con licencia Apache 2.0, puede desplegarse en CPU o GPU consumer para clasificar grandes volumenes de texto portugues sin depender de APIs externas.
- Investigacion en model merging: sirve como referencia reproducible para estudiar TIES-Merging y la combinacion de especialistas de dominio en SLMs, con hiperparametros y linaje documentados.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos con Macro F1 y decodificacion guiada via vLLM + Pydantic:

| Dataset / tarea | Metrica | Valor |
|---|---|---|
| ReLi-SA (sentimiento, resenas de libros) | Macro F1 | 48,81 |
| BRIGHTER ptbr (emociones, 6 categorias) | Macro F1 | 39,03 |
| Sentiments-FinBERT-PT-BR (sentimiento financiero) | Macro F1 | 66,10 |
| Financial Phrasebank PT-BR (sentimiento financiero) | Macro F1 | 66,04 |
| GoEmotions PT-BR (28 emociones) | Macro F1 | 23,38 |

La model card menciona comparaciones frente al baseline zero-shot (`Polygl0t/Tucano2-qwen-0.5B-Instruct`) y frente a un baseline multitarea conjunto (Joint), pero los valores completos de esas comparaciones no estan disponibles en la informacion proporcionada. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada: en precision FP16, aproximadamente 1 GB para los pesos (0,5B parametros); en cuantizacion de 8 bits, en torno a 0,5-0,7 GB; en 4 bits, alrededor de 0,3-0,4 GB. Son estimaciones teoricas, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor para la evaluacion con guided decoding), llama.cpp u Ollama si se generan pesos GGUF (no se declaran en la informacion disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-PriorMerge-ReLiSA | 0,5B | no disponible | SLM multitarea por merging (PT-BR) | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct | 0,5B | no disponible | SLM instructivo zero-shot (PT) | no disponible en la informacion | Hugging Face |
| Assaoka/Tucano2-qwen-0.5B-Prior-ReLiSA | 0,5B | no disponible | Especialista prior de dominio general | Apache 2.0 | Hugging Face |
| Assaoka/Tucano2-qwen-0.5B-FinBERT | 0,5B | no disponible | Especialista en sentimiento financiero | Apache 2.0 | Hugging Face |

Los modelos comparables mas directos son los propios checkpoints padres del mismo autor, ya que no se dispone de datos de benchmarks de alternativas externas en la informacion proporcionada. El baseline zero-shot y el baseline Joint se citan en la model card pero sin valores completos.

## Limitaciones y advertencias

- Resultados de benchmarks no verificados de forma independiente (`verified: false` en el model-index); deben tomarse como declaraciones del autor.
- Rendimiento bajo en GoEmotions PT-BR (Macro F1 de 23,38), lo que sugiere dificultad con 28 emociones finas y datos ruidosos de Reddit.
- Rendimiento moderado en BRIGHTER (39,03) y ReLi-SA (48,81), lejos de lo que cabria esperar de modelos especializados de mayor tamano.
- Solo soporta portugues (PT-BR); no se declara capacidad multilingue.
- No se documenta la longitud de contexto, lo que limita el diseno de pipelines con textos largos.
- Al ser un modelo fusionado por merging, puede heredar sesgos de los cinco datasets de origen (resenas, noticias financieras, Reddit), incluyendo sesgos de dominio y de estilo.
- Riesgo de alucinacion en generacion libre: el modelo esta pensado para clasificacion con decodificacion guiada, no para generacion abierta fiable.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la retencion del modelo esta garantizada durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026).
- El uso en produccion deberia validarse con datos propios, dado que los benchmarks se limitan a cinco conjuntos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-PriorMerge-ReLiSA
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del articulo: https://doi.org/10.5753/eniac.2026.31064
- Coleccion de Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo padre Prior-ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-ReLiSA
- Modelo padre FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo padre Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo padre Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Modelo padre GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Baseline zero-shot: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
- Dataset Financial Phrasebank PT-BR (Kaggle): https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
