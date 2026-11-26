# Assaoka/Tucano2-qwen-0.5B-DARE-Ties-0.3

## Resumen

Tucano2-qwen-0.5B-DARE-Ties-0.3 es un modelo de lenguaje pequeno (SLM) en portugues de Brasil obtenido mediante fusion de modelos (model merging) con la tecnica DARE-TIES a densidad 0.3. Lo desarrolla Assaoka como parte del articulo "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. El modelo no se entrena desde cero: combina cinco especialistas de dominio derivados de Tucano2-qwen-0.5B (variantes FinBERT, ReLiSA, Brighter, Phrasebank y GoEmotions) para cubrir simultaneamente analisis de sentimiento y clasificacion de emociones en portugues.

La relevancia del modelo reside en su enfoque de eficiencia: en lugar de un unico modelo grande multi-tarea, fusiona cinco especialistas de 0,5B parametros en un solo checkpoint con pesos iguales (0,20 por especialista) y poda DARE al 30% de densidad. Esto permite desplegar un unico modelo pequeno que cubre cinco benchmarks distintos de sentimiento y emociones, con un coste de inferencia muy bajo.

El modelo tiene 490.799.104 parametros (aproximadamente 0,49B), se distribuye en formato safetensors bajo licencia Apache 2.0 y esta disenado para generacion de texto con decodificacion guiada (guided decoding) para tareas de clasificacion. Su idioma de trabajo es exclusivamente el portugues (PT-BR).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, tag `qwen3`) |
| Parametros totales | 490.799.104 (aproximadamente 0,49B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusion de cinco especialistas construidos sobre la base Tucano2-qwen-0.5B, un modelo Qwen3 de aproximadamente 0,5B parametros adaptado al portugues. Los cinco especialistas corresponden a dominios distintos: FinBERT (noticias financieras), ReLiSA (resenas de libros), Brighter (6 emociones multi-etiqueta), Phrasebank (frases financieras) y GoEmotions (28 emociones). La fusion se realiza con mergekit aplicando DARE-TIES con densidad 0,30 y pesos iguales de 0,20 para cada especialista.

No se dispone de informacion sobre el numero de tokens de entrenamiento de los especialistas ni sobre la composicion exacta de los datasets mas alla de los nombres y dominios citados. El modelo forma parte de un ablation study sobre densidad de poda (pruning-density ablation), donde esta variante concreta corresponde al grupo experimental de densidad 0.3. La evaluacion se realizo con decodificacion guiada mediante vLLM y Pydantic, lo que sugiere que el modelo se usa como generador de texto restringido a etiquetas de clasificacion.

## Capacidades

- Generacion de texto en portugues de Brasil.
- Clasificacion de sentimiento (positivo, negativo, neutro) en dominios financiero, resenas de libros y frases genericas.
- Clasificacion de emociones multi-etiqueta (6 categorias en BRIGHTER, 28 categorias en GoEmotions PT-BR).
- Clasificacion mediante decodificacion guiada (guided decoding con vLLM y Pydantic) para forzar salidas estructuradas.
- Capacidad de cubrir multiples tareas de clasificacion con un unico checkpoint fusionado.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del portugues.
- No se documenta vision, audio ni modo thinking.

## Casos de uso

- Analisis de sentimiento en resenas de libros: el modelo puede clasificar resenas del dataset ReLi-SA en positivo, negativo o neutro, aprovechando el especialista ReLiSA fusionado para este dominio concreto.
- Monitorizacion de emociones en redes sociales: con la fusion del especialista GoEmotions PT-BR, el modelo puede etiquetar textos de redes sociales en 28 categorias emocionales, util para estudios de opinion o moderacion de contenido.
- Analisis de sentimiento financiero: la combinacion de los especialistas FinBERT y Phrasebank permite procesar noticias financieras y frases del dominio bursatil en portugues para senales de mercado.
- Deteccion de emociones en atencion al cliente: el especialista Brighter (6 emociones multi-etiqueta) permite identificar el tono emocional de las interacciones y enrutar conversaciones segun el estado del cliente.
- Etiquetado de datos a bajo coste: al ser un modelo de 0,49B, puede desplegarse en CPU o GPU consumer para pre-etiquetar grandes volumenes de texto portugues antes de una revision humana.
- Investigacion en model merging: sirve como referencia reproducible para estudiar el efecto de la densidad DARE-TIES (0.3) en la fusion de especialistas, con resultados declarados en cinco benchmarks.
- Clasificacion con salida estructurada en pipelines: mediante guided decoding con vLLM y Pydantic, se puede integrar en un servicio de inferencia que devuelva etiquetas validas sin post-procesado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en la model card, evaluados con decodificacion guiada via vLLM y Pydantic:

| Dataset / tarea | Metrica | Tucano2-qwen-0.5B-DARE-Ties-0.3 |
|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 24,37% |
| BRIGHTER ptbr (emociones, 6 categorias) | Macro F1 | 37,14% |
| Sentiments-FinBERT-PT-BR (sentimiento financiero) | Macro F1 | 14,47% |
| Financial Phrasebank PT-BR (sentimiento financiero) | Macro F1 | 28,07% |
| GoEmotions PT-BR (emociones, 28 categorias) | Macro F1 | 20,92% |

La model card menciona tambien metricas complementarias para ReLi-SA (Micro F1 64,75%, Accuracy 64,75%, Hamming Loss 0,3525) y comparaciones con el baseline zero-shot (Polygl0t/Tucano2-qwen-0.5B-Instruct) y el baseline Joint multi-task SFT, pero los datos completos de esas comparaciones no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,49B parametros en safetensors (repo de 3,9 GB, presumiblemente por incluir multiples checkpoints o estados del merge), la inferencia en FP16 requiere aproximadamente 1 GB de VRAM; en cuantizacion de 8 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas de memoria.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado en la evaluacion oficial con guided decoding y Pydantic), text-generation-inference (tag `text-generation-inference` presente) y endpoints compatibles (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (BRIGHTER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-DARE-Ties-0.3 | 0,49B | no disponible | 37,14% | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (zero-shot) | aproximadamente 0,5B | no disponible | no disponible en la informacion | no disponible | Hugging Face |
| Joint multi-task SFT (baseline del paper) | aproximadamente 0,5B | no disponible | no disponible en la informacion | no disponible | no disponible |

Los datos completos de los baselines no estan disponibles en la informacion proporcionada; solo se confirma que el paper compara contra el zero-shot y el Joint multi-task SFT.

## Limitaciones y advertencias

- El modelo solo soporta portugues (PT-BR); no se documenta capacidad multilingue.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (`verified: false` en el model-index).
- El rendimiento en ReLi-SA (24,37% Macro F1) y Sentiments-FinBERT-PT-BR (14,47% Macro F1) es bajo en terminos absolutos, lo que sugiere limitaciones en dominios especificos.
- Al ser un modelo fusionado de especialistas pequenos, puede presentar interferencia entre tareas y degradacion respecto a los especialistas individuales.
- Riesgo de alucinacion en generacion libre: el modelo esta pensado para clasificacion con decodificacion guiada, no para generacion abierta.
- No se documentan sesgos conocidos, pero al entrenarse sobre datasets de resenas, redes sociales y noticias financieras, puede heredar sesgos de esos corpus.
- La longitud de contexto no esta documentada, lo que limita su uso en documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento en el dominio objetivo antes de produccion.
- Politica de retencion: el autor mantiene el modelo publico al menos 1 ano tras la finalizacion de la tesis (diciembre de 2026).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-DARE-Ties-0.3
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
