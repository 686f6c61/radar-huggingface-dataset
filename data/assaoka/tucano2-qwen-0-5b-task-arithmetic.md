# Assaoka/Tucano2-qwen-0.5B-Task-Arithmetic

## Resumen

Tucano2-qwen-0.5B-Task-Arithmetic es un modelo de lenguaje pequeno (SLM) en portugues de Brasil, publicado por el autor Assaoka, que resulta de la fusion por aritmetica de tareas (*task arithmetic*) de cinco especialistas de dominio derivados del modelo instructivo Polygl0t/Tucano2-qwen-0.5B-Instruct. Cada especialista fue ajustado para una tarea concreta de analisis de sentimiento o clasificacion de emociones sobre un corpus distinto (ReLi-SA, BRIGHTER, Sentiments-FinBERT-PT-BR, Financial Phrasebank PT-BR y GoEmotions PT-BR), y la fusion combina sus vectores de tarea con un peso de 0,20 por especialista.

El modelo se enmarca en el articulo ENIAC 2026 "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", cuyo objetivo es demostrar que un unico SLM de 0,5 mil millones de parametros puede cubrir varias tareas de analisis de sentimiento en portugues sin necesidad de desplegar cinco modelos separados ni de reentrenar conjuntamente. La arquitectura subyacente es la de Qwen3 (transformer denso) heredada del modelo base de Tucano2, con 490.799.104 parametros totales en formato safetensors y licencia Apache 2.0.

Su relevancia practica reside en el coste de despliegue: al consolidar cinco cabezas de clasificacion en un solo checkpoint de ~0,5B, permite ejecutar analisis de sentimiento multilingue (portugues) en hardware modesto, con opciones de cuantizacion agresiva, y sirve como caso de estudio reproducible de tecnicas de *model merging* aplicadas a SLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3, heredada de Polygl0t/Tucano2-qwen-0.5B-Instruct) |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es el resultado de una fusion por *task arithmetic* de cinco modelos especialistas, todos ellos derivados del mismo modelo base instructivo Polygl0t/Tucano2-qwen-0.5B-Instruct. Para cada especialista se calcula su vector de tarea (diferencia entre los pesos del especialista y los del modelo base) y se realiza una suma ponderada de los cinco vectores con peso 0,20 cada uno, sumandola de nuevo al modelo base. El resultado es un unico checkpoint que, segun el autor, retiene capacidades de las cinco tareas sin un entrenamiento conjunto multi-tarea.

Los especialistas se ajustaron sobre cinco conjuntos de datos en portugues: ReLi-SA (resenas de libros), BRIGHTER ptbr (6 emociones multi-etiqueta), Sentiments-FinBERT-PT-BR (noticias financieras), Financial Phrasebank PT-BR (traduccion al portugues, via Kaggle) y GoEmotions PT-BR (28 emociones, con un 50 % de split de entrenamiento aleatorio). La evaluacion se realizo con decodificacion guiada mediante vLLM y Pydantic, lo que fuerza la salida a las etiquetas validas de cada tarea. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta de los datasets ni si hubo RLHF o DPO en los especialistas.

## Capacidades

- Generacion de texto en portugues de Brasil, con registro conversacional heredado del modelo instructivo base.
- Clasificacion de sentimiento (positivo/negativo/neutro) en dominios de resenas, noticias financieras y texto general.
- Clasificacion de emociones multi-etiqueta (BRIGHTER, 6 categorias; GoEmotions, 28 categorias).
- Clasificacion de sentimiento financiero especializado (Sentiments-FinBERT-PT-BR, Financial Phrasebank PT-BR).
- Salida estructurada mediante decodificacion guiada (vLLM + Pydantic) para forzar etiquetas validas.
- Capacidad multilingue limitada al portugues; no se declaran capacidades en otros idiomas.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Analisis de sentimiento de resenas de productos o libros en portugues: el modelo puede clasificar resenas de clientes en positivo, negativo o neutro, aprovechando el especialista ReLi-SA fusionado, en un unico checkpoint de ~0,5B desplegable en CPU o GPU de gama baja.
- Monitorizacion de sentimiento en noticias financieras: con los especialistas FinBERT-PT-BR y Phrasebank, permite etiquetar titulares y comunicados en portugues para alimentar paneles de riesgo de mercado o alertas tempranas.
- Moderacion de comunidades y redes sociales: la cabeza de emociones multi-etiqueta (GoEmotions, 28 categorias) permite detectar tono hostil, tristeza o entusiasmo en comentarios y priorizar revision humana.
- Analisis de encuestas de satisfaccion (NPS, CSAT): clasificacion automatica de respuestas abiertas en portugues para segmentar detractores y promotores sin enviar datos a APIs externas.
- Investigacion en *model merging*: el checkpoint sirve como referencia reproducible para comparar aritmetica de tareas frente a ajuste conjunto multi-tarea (baseline Joint) en SLM.
- Procesamiento por lotes en entornos con recursos limitados: al ser un modelo de 0,5B, puede ejecutarse en una sola GPU consumer o incluso en CPU con cuantizacion, lo que facilita pipelines de etiquetado masivo de corpus en portugues.
- Prototipado rapido de clasificadores de texto en portugues: un unico modelo cubre cinco tareas, lo que simplifica la infraestructura frente a mantener cinco especialistas separados.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), medidos con Macro F1 y decodificacion guiada via vLLM + Pydantic:

| Dataset / tarea | Metrica | Resultado |
|---|---|---|
| ReLi-SA (sentimiento, resenas de libros) | Macro F1 | 46,44 |
| BRIGHTER ptbr (emociones, 6 categorias) | Macro F1 | 38,88 |
| Sentiments-FinBERT-PT-BR (sentimiento financiero) | Macro F1 | 75,05 |
| Financial Phrasebank PT-BR (sentimiento financiero) | Macro F1 | 73,59 |
| GoEmotions PT-BR (emociones, 28 categorias) | Macro F1 | 14,59 |

El autor reporta ademas, para ReLi-SA, Micro F1 y accuracy de 69,10 y Hamming Loss de 0,3090, frente a un baseline zero-shot (Polygl0t/Tucano2-qwen-0.5B-Instruct) con Macro F1 de 30,66. No se han publicado en la informacion disponible los resultados completos del baseline Joint ni del resto de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 1 GB para los pesos (0,49B parametros), mas overhead de activaciones y cache KV; en la practica, entre 1,5 y 3 GB segun longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,5-1 GB; en 4 bits, por debajo de 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, T4, L4); para lotes grandes o mayor throughput, A10G, L40S o A100.
- Cabe en GPU consumer: si, en practicamente toda la gama actual (GTX 1660, RTX 3060, RTX 4090) e incluso en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor con decodificacion guiada y Pydantic), text-generation-inference (tag `text-generation-inference`), llama.cpp/Ollama si se generan pesos GGUF (no se proporcionan en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Task-Arithmetic | 0,49B | no disponible | Fusion por task arithmetic de 5 especialistas | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct | ~0,5B | no disponible | Modelo instructivo base zero-shot | no disponible en la informacion | Hugging Face |
| Baseline Joint (multi-task SFT) | ~0,5B | no disponible | Ajuste supervisado conjunto multi-tarea | no disponible en la informacion | Referencia interna del paper ENIAC 2026 |
| Especialistas individuales (FinBERT, ReLiSA, Brighter, Phrasebank, GoEmotions) | ~0,5B cada uno | no disponible | Un modelo por tarea | Apache 2.0 | Hugging Face (coleccion Assaoka) |

La comparativa cuantitativa frente al baseline zero-shot solo esta disponible para ReLi-SA (46,44 frente a 30,66 de Macro F1). No se dispone de datos comparativos completos frente a modelos de clasificacion dedicados como BERTimbau o FinBERT-PT-BR en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en portugues de Brasil; su rendimiento en portugues europeo u otros idiomas no esta documentado y previsiblemente sera inferior.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false` en el model-index).
- El rendimiento en GoEmotions PT-BR es bajo (Macro F1 de 14,59), lo que limita su uso fiable en clasificacion fina de 28 emociones.
- El modelo se evaluo con decodificacion guiada (vLLM + Pydantic); sin ese constrain, la calidad de las etiquetas puede degradarse al ser un modelo generativo y no un clasificador con cabeza dedicada.
- Riesgo de alucinacion y de deriva en la etiqueta si se usa como generador libre en lugar de clasificador restringido.
- La fusion por aritmetica de tareas puede producir interferencia entre especialistas; el autor no documenta el comportamiento fuera de dominio mas alla de los resultados reportados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Polygl0t/Tucano2-qwen-0.5B-Instruct y los datasets de origen deben verificarse por separado para cumplir sus terminos.
- La retencion publica del checkpoint esta garantizada por al menos un ano tras la finalizacion de la tesis (diciembre de 2026), segun el autor; no hay compromiso mas alla de ese periodo.
- No se documenta longitud de contexto ni soporte de tool calling, por lo que no es adecuado para tareas agenticas o de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Task-Arithmetic
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del articulo: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Especialista FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Especialista ReLiSA: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-ReLiSA
- Especialista Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Especialista Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Especialista GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA (repositorio): https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR (Kaggle): https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
