# Assaoka/Tucano2-qwen-0.5B-TIES-0.5

## Resumen

Tucano2-qwen-0.5B-TIES-0.5 es un modelo de lenguaje pequeno (SLM) en portugues de Brasil, resultado de la fusion de cinco especialistas de sentimiento y emociones mediante TIES-Merging con densidad 0.5. Lo desarrolla Assaoka y forma parte del estudio "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. El objetivo es cubrir multiples tareas de clasificacion de sentimiento y emocion con un unico modelo de 0,49 mil millones de parametros, en lugar de mantener cinco modelos separados.

El modelo parte de la familia Tucano2 (derivada de Qwen) y combina los pesos de cinco especialistas afinados sobre los conjuntos ReLi-SA, BRIGHTER, Sentiments-FinBERT-PT-BR, Financial Phrasebank PT-BR y GoEmotions PT-BR. La fusion TIES resuelve los conflictos de signo entre los vectores de tarea antes de promediarlos, lo que permite retener el conocimiento de cada especialista en un solo conjunto de pesos.

Es relevante ahora porque demuestra que la fusion de modelos puede ofrecer un rendimiento multi-tarea competitivo frente al entrenamiento conjunto (joint SFT) con un coste computacional mucho menor, y porque su tamano reducido (menos de 500 millones de parametros) permite desplegarlo en hardware modesto o incluso en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, segun tag `qwen3`); pesos fusionados con TIES-Merging |
| Parametros totales | 490.799.104 (aproximadamente 0,49 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en BF16/FP; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 con aproximadamente 490 millones de parametros. No se entrena desde cero: se construye fusionando los pesos de cinco especialistas previamente afinados (`Tucano2-qwen-0.5B-FinBERT`, `-ReLiSA`, `-Brighter`, `-Phrasebank` y `-GoEmotions`), todos ellos derivados de la misma base instruct (`Polygl0t/Tucano2-qwen-0.5B-Instruct`). La fusion se realiza con TIES-Merging, un metodo que trunca los parametros de baja magnitud (densidad 0,5), resuelve los conflictos de signo entre tareas y solo despues promedia los vectores de tarea resultantes. Se aplican pesos iguales de 0,20 a cada especialista, con `normalize: true` e `int8_mask: true`.

Los datos de entrenamiento indirectos son los cinco conjuntos de los especialistas: ReLi-SA (resenas de libros), BRIGHTER ptbr (6 emociones multi-etiqueta), Sentiments-FinBERT-PT-BR (noticias financieras), Financial Phrasebank PT-BR y GoEmotions PT-BR (28 emociones, con un 50 % de split de entrenamiento aleatorio). No se especifica el numero total de tokens de afinado ni si hubo RLHF o DPO en la base instruct. La innovacion tecnica destacable es el propio pipeline de fusion: un unico merge plano ("one-shot flat merge") que evita reentrenar y conserva el rendimiento de cada especialista, evaluado con decodificacion guiada mediante vLLM y Pydantic.

## Capacidades

- Generacion de texto en portugues de Brasil con formato conversacional (tag `conversational`).
- Clasificacion de sentimiento (positivo, negativo, neutro) en dominios general, financiero y de resenas.
- Clasificacion de emociones multi-etiqueta (6 categorias en BRIGHTER, 28 en GoEmotions).
- Analisis de sentimiento financiero sobre noticias y textos economicos.
- Salida estructurada mediante decodificacion guiada (evaluado con vLLM + Pydantic), lo que facilita integracion en pipelines.
- Capacidad multilingue limitada al portugues; no se declaran otros idiomas.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Monitorizacion de reputacion en redes sociales: el modelo clasifica comentarios y publicaciones en portugues en las 28 emociones de GoEmotions, lo que permite construir paneles de sentimiento por emocion con un unico endpoint en lugar de cinco modelos.
- Analisis de sentimiento de noticias financieras: entrenado sobre Sentiments-FinBERT-PT-BR y Financial Phrasebank PT-BR, puede etiquetar titulares y comunicados de resultados en portugues para alimentar senales de trading o alertas de riesgo.
- Moderacion de comunidades y foros: la deteccion de emociones negativas (ira, tristeza, asco) en textos de usuarios permite priorizar revisiones humanas y activar protocolos de soporte.
- Analisis de resenas de productos y libros: el especialista ReLi-SA aporta capacidad sobre resenas largas; el modelo fusionado puede clasificar opiniones de e-commerce en portugues con una sola pasada.
- Enriquecimiento de datasets de clientes: procesamiento por lotes de encuestas abiertas (NPS, comentarios de soporte) para etiquetar sentimiento y emocion antes de un analisis estadistico.
- Clasificacion en el borde o en CPU: con menos de 500 millones de parametros, puede desplegarse en contenedores ligeros o en hardware sin GPU para tareas de etiquetado de bajo volumen y baja latencia.
- Extraccion de caracteristicas para modelos mayores: las representaciones o etiquetas generadas pueden usarse como preprocesamiento de un pipeline RAG o de un sistema de atencion al cliente.

## Benchmarks y rendimiento

Resultados declarados por el autor (Macro F1, evaluacion con decodificacion guiada via vLLM + Pydantic; `verified: false`). Se comparan con la linea base zero-shot (`Polygl0t/Tucano2-qwen-0.5B-Instruct`) y con el baseline Joint multi-task SFT.

| Dataset / tarea | Metrica | Tucano2-TIES-0.5 | Baseline zero-shot | Joint SFT |
|---|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 46,38 | 30,66 | 59,51 |
| BRIGHTER ptbr (emocion) | Macro F1 | 39,00 | no disponible | no disponible |
| Sentiments-FinBERT-PT-BR (sentimiento) | Macro F1 | 71,82 | no disponible | no disponible |
| Financial Phrasebank PT-BR (sentimiento) | Macro F1 | 70,17 | no disponible | no disponible |
| GoEmotions PT-BR (emocion) | Macro F1 | 21,60 | no disponible | no disponible |

En ReLi-SA el modelo fusionado supera claramente a la linea base zero-shot (46,38 frente a 30,66 de Macro F1) pero queda por debajo del entrenamiento conjunto (59,51). La model card solo detalla parcialmente las filas de baseline y Joint para el resto de tareas; el resto de valores no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en BF16/FP16 (0,49 B de parametros); en torno a 0,5 GB con cuantizacion de 8 bits y 0,25-0,3 GB en 4 bits, aunque no se publican artefactos GGUF oficiales.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o superior ofrece margen amplio para lotes grandes. En A100/H100 el modelo esta limitado por overhead, no por memoria.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado por el autor para la evaluacion con decodificacion guiada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles. Para CPU, llama.cpp u Ollama requeririan conversion previa a GGUF, no publicada.
- Latencia y throughput: no disponibles de forma oficial; por tamano, se espera un throughput alto en GPU y viable en CPU para lotes pequenos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-TIES-0.5 | 0,49 B | no disponible | Fusion TIES de 5 especialistas PT-BR | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (linea base) | 0,5 B | no disponible | Instruct generalista PT | no disponible | Hugging Face |
| Joint multi-task SFT (baseline del paper) | 0,5 B | no disponible | Afinado conjunto multi-tarea | no disponible | No publicado como modelo independiente |
| Especialistas individuales (FinBERT, ReLiSA, Brighter, Phrasebank, GoEmotions) | 0,5 B cada uno | no disponible | Un modelo por tarea | Apache 2.0 | Hugging Face (repos de Assaoka) |

La ventaja del modelo fusionado es operativa: un unico checkpoint cubre cinco tareas con rendimiento cercano al de los especialistas en varios dominios, frente a mantener cinco despliegues. El Joint SFT supera al merge en ReLi-SA (59,51 frente a 46,38), lo que sugiere que el entrenamiento conjunto sigue siendo competitivo cuando hay datos etiquetados de todas las tareas.

## Limitaciones y advertencias

- Solo soporta portugues de Brasil; el rendimiento en portugues europeo u otros idiomas no esta documentado.
- Los benchmarks son declarados por el autor y no estan verificados (`verified: false`); deben tomarse como indicativos.
- El rendimiento en GoEmotions PT-BR es bajo (21,6 de Macro F1), por lo que la clasificacion fina de 28 emociones no es fiable en produccion sin validacion adicional.
- En ReLi-SA queda por debajo del baseline Joint SFT, de modo que la fusion no domina al entrenamiento conjunto en todas las tareas.
- Riesgo de alucinacion y de etiquetas inconsistentes al ser un modelo generativo usado para clasificacion; se recomienda decodificacion guiada y validacion de esquema.
- No se documentan sesgos especificos, pero al derivar de una base instruct generalista puede heredar sesgos del corpus original.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantias del autor sobre idoneidad para dominios regulados (finanzas, salud).
- No se publican cuantizaciones oficiales ni longitud de contexto; el despliegue en CPU requiere conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-TIES-0.5
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion de Hugging Face del estudio: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
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
