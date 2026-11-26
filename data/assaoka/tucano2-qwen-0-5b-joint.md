# Assaoka/Tucano2-qwen-0.5B-Joint

## Resumen

Tucano2-qwen-0.5B-Joint es un modelo de lenguaje pequeno (SLM) de 490,8 millones de parametros, desarrollado por Assaoka como fine-tuning del modelo instructivo Polygl0t/Tucano2-qwen-0.5B-Instruct. Se trata del baseline de entrenamiento conjunto multi-tarea (Joint SFT) dentro del estudio "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. El modelo esta especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil.

El modelo parte de la familia Qwen3 (arquitectura transformer decoder-only) y se ha ajustado de forma supervisada sobre la union de cinco corpus portugueses de sentimiento y emocion: ReLi-SA, BRIGHTER (ptbr), Sentiments-FinBERT-PT-BR, Financial Phrasebank PT-BR y GoEmotions PT-BR. Su relevancia radica en servir como referencia controlada para evaluar tecnicas de fusion de modelos (model merging) aplicadas a SLM, demostrando que un modelo de menos de 500 millones de parametros puede alcanzar un Macro F1 del 85,91 % en dominios financieros especializados.

La ventana de contexto, el numero de tokens de entrenamiento y los detalles de composicion del dataset no se especifican en la informacion disponible. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors, con un repositorio de 2,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only heredada de la familia Qwen3, con 490,8 millones de parametros totales. Se obtiene mediante fine-tuning supervisado conjunto (Joint Multi-Task SFT) a partir de Polygl0t/Tucano2-qwen-0.5B-Instruct, entrenando simultaneamente sobre las particiones de entrenamiento combinadas de cinco datasets portugueses: ReLi-SA (resenas de libros), BRIGHTER ptbr (6 emociones multi-etiqueta), Sentiments-FinBERT-PT-BR (noticias financieras), Financial Phrasebank PT-BR (traduccion al portugues del corpus de Kaggle) y GoEmotions PT-BR (28 emociones, con un 50 % de particion aleatoria de entrenamiento).

No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La evaluacion reportada se realizo con decodificacion guiada (guided decoding) mediante vLLM y Pydantic, lo que garantiza que las salidas se ajusten a un esquema de clasificacion predefinido. El modelo forma parte de un grupo experimental de ocho modelos centrales del estudio, con politica de alojamiento permanente garantizada.

## Capacidades

- Generacion de texto en portugues de Brasil.
- Clasificacion de sentimiento en dominios general y financiero (positivo, negativo, neutro).
- Clasificacion de emociones multi-etiqueta (6 categorias en BRIGHTER, 28 en GoEmotions).
- Salidas estructuradas mediante decodificacion guiada con esquemas Pydantic.
- Analisis de resenas de libros y textos de opinion (ReLi-SA).
- Analisis de sentimiento en noticias y textos financieros.
- Conversacion multi-turno heredada del modelo base instructivo.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Monitorizacion de sentimiento en noticias financieras: el modelo clasifica titulares y textos economicos en portugues con un Macro F1 del 85,91 % en Sentiments-FinBERT-PT-BR, adecuado para paneles de alerta temprana en mesas de analisis.
- Analisis de opiniones de productos y resenas: con un Macro F1 del 59,51 % en ReLi-SA, puede procesar resenas de libros y articulos para extraer polaridad a escala en catalogos editoriales.
- Moderacion de comunidades y redes sociales: la clasificacion multi-etiqueta de emociones (BRIGHTER, GoEmotions) permite etiquetar comentarios de usuarios con categorias emocionales para priorizar revision humana.
- Investigacion academica en PLN portugues: sirve como baseline reproducible de entrenamiento conjunto multi-tarea para comparar contra tecnicas de fusion de modelos en experimentos controlados.
- Extraccion de senales de sentimiento en encuestas y formularios abiertos: el modelo puede procesar respuestas de texto libre en portugues y agregar polaridad por segmento de clientes.
- Clasificacion por lotes en pipelines de bajo coste: con menos de 500 millones de parametros, cabe en GPUs de consumo y permite procesar grandes volumenes de texto sin infraestructura dedicada.
- Prototipado rapido de clasificadores de emociones: gracias a la decodificacion guiada con Pydantic, se puede integrar en servicios que requieran salidas JSON validadas sin post-procesado complejo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), evaluados con decodificacion guiada via vLLM y Pydantic. La columna "Baseline" corresponde al modelo base Polygl0t/Tucano2-qwen-0.5B-Instruct en zero-shot; "Joint" es este modelo.

| Dataset / tarea | Metrica | Baseline | Joint |
|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 30,66 % | 59,51 % |
| ReLi-SA (sentimiento) | Micro F1 | 37,07 % | 74,51 % |
| ReLi-SA (sentimiento) | Accuracy | 37,07 % | 74,51 % |
| ReLi-SA (sentimiento) | Hamming Loss | 0,6293 | 0,2549 |
| BRIGHTER ptbr (emociones) | Macro F1 | 33,47 % | 40,83 % |
| BRIGHTER ptbr (emociones) | Micro F1 | 38,07 % | 59,14 % |
| BRIGHTER ptbr (emociones) | Accuracy | 24,66 % | 49,60 % |
| BRIGHTER ptbr (emociones) | Hamming Loss | 0,2731 | 0,1174 |
| Sentiments-FinBERT-PT-BR (sentimiento) | Macro F1 | 54,77 % | 85,91 % |
| Sentiments-FinBERT-PT-BR (sentimiento) | Micro F1 | 66,34 % | 86,14 % |
| Sentiments-FinBERT-PT-BR (sentimiento) | Accuracy | 66,34 % | 86,14 % |
| Sentiments-FinBERT-PT-BR (sentimiento) | Hamming Loss | 0,3366 | 0,1386 |
| Financial Phrasebank PT-BR (sentimiento) | Macro F1 | 38,14 % | 82,18 % |
| Financial Phrasebank PT-BR (sentimiento) | Micro F1 | 39,32 % | 83,69 % |
| Financial Phrasebank PT-BR (sentimiento) | Accuracy | 39,32 % | 83,69 % |
| Financial Phrasebank PT-BR (sentimiento) | Hamming Loss | 0,6068 | 0,1631 |
| GoEmotions PT-BR (emociones) | Macro F1 | no disponible | 29,99 % |
| GoEmotions PT-BR (emociones) | Micro F1 | no disponible | 41,84 % |
| GoEmotions PT-BR (emociones) | Accuracy | no disponible | 36,55 % |

Fuente: ENIAC 2026 — United Experts (https://sol.sbc.org.br/index.php/eniac/article/view/47030). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB para los pesos (490,8 M de parametros) mas overhead de activaciones y cache KV; en la practica, entre 1,5 y 2,5 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,5-1 GB; en 4 bits: en torno a 0,3-0,6 GB (estimaciones teoricas, no verificadas para este modelo concreto).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050 y superiores, asi como en CPU para inferencia por lotes de baja latencia.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), vLLM (usado por el autor para la evaluacion con decodificacion guiada). Compatibilidad con llama.cpp y Ollama: no confirmada en la informacion disponible, aunque el formato safetensors requeriria conversion a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (FinBERT-PT-BR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Joint | 490,8 M | no disponible | 85,91 % | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | 490,8 M (aprox.) | no disponible | 54,77 % | no disponible | Hugging Face |
| Modelos de fusion del estudio United Experts | no disponible | no disponible | no disponible | no disponible | Coleccion de Hugging Face del autor |

La comparativa se limita al modelo base y a los modelos del mismo estudio, ya que no se dispone de datos de benchmarks de alternativas externas en la informacion proporcionada. No disponible para modelos como FinBERT-PT-BR, BERTimbau o clasificadores especializados comparables.

## Limitaciones y advertencias

- Especializado exclusivamente en portugues de Brasil; su rendimiento en portugues europeo u otros idiomas no esta documentado.
- Disenado para tareas de clasificacion de sentimiento y emociones; su uso como modelo generativo generalista no esta evaluado.
- Riesgo de alucinacion inherente a los SLM: con 490,8 M de parametros, la capacidad de razonamiento y el conocimiento factual son limitados.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (campo "verified": false en el model-index).
- El Macro F1 en GoEmotions PT-BR es bajo (29,99 %), lo que indica dificultad con taxonomias amplias de 28 emociones.
- La evaluacion se realizo con decodificacion guiada (vLLM + Pydantic); sin ese esquema, el rendimiento en produccion puede degradarse.
- No se especifican sesgos conocidos, composicion demografica del dataset ni evaluaciones de robustez.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento en el dominio concreto antes de desplegar en produccion.
- El modelo se presenta como baseline experimental dentro de un estudio academico; no esta pensado como producto final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Joint
- Modelo base: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face del estudio: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Dataset ReLi-SA: https://github.com/ruanchaves/reli
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
- Dataset Financial Phrasebank PT-BR: https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
