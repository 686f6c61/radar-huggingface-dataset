# Assaoka/Tucano2-qwen-0.5B-Prior-ReLiSA

## Resumen

Tucano2-qwen-0.5B-Prior-ReLiSA es un modelo de lenguaje pequeno (SLM) de aproximadamente 490 millones de parametros, desarrollado por Assaoka, especializado en analisis de sentimiento y clasificacion de emociones en portugues de Brasil. Se construye sobre la familia Tucano2 (derivada de Qwen3-0.5B) mediante una tecnica de fusion de modelos: cuatro especialistas fuera de dominio se combinan con TIES-Merging y el resultado se afina (SFT) sobre el conjunto ReLi-SA.

El modelo forma parte del trabajo de investigacion "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", presentado en ENIAC 2026. Su relevancia radica en demostrar que la fusion de modelos como inicializacion previa (prior) permite obtener un rendimiento competitivo en multiples tareas de sentimiento y emocion con un unico modelo compacto, evitando mantener varios especialistas independientes.

Con licencia Apache 2.0 y pesos en safetensors, esta pensado para despliegues ligeros de clasificacion de texto en portugues, no como un modelo generativo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.5B) |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3 en su variante de 0.5B parametros (transformer decoder-only). Sobre esa base se construyeron cuatro especialistas fuera de dominio: FinBERT (sentimiento financiero), Brighter (emociones multi-etiqueta), Phrasebank (sentimiento financiero) y GoEmotions (28 emociones). Estos cuatro especialistas se fusionaron mediante TIES-Merging con `weight = 0.25` y `density = 0.50`, y el modelo fusionado se afino posteriormente (SFT) sobre el conjunto ReLi-SA (resenas de libros).

La innovacion metodologica es el uso de la fusion como inicializacion previa fuera de dominio: en lugar de entrenar directamente sobre la tarea objetivo, se parte de un modelo fusionado que ya ha absorbido conocimiento de tareas relacionadas y se ajusta despues. La evaluacion se realizo con decodificacion guiada (Guided Decoding) mediante vLLM y Pydantic, lo que fuerza la salida a las etiquetas validas de cada tarea.

## Capacidades

- Clasificacion de sentimiento en portugues (positivo, negativo, neutro) sobre resenas y noticias financieras.
- Clasificacion de emociones multi-etiqueta (categorias de BRIGHTER y las 28 emociones de GoEmotions).
- Generacion de texto condicionada a etiquetas mediante decodificacion guiada con vLLM y Pydantic.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al portugues (PT-BR).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Analisis de resenas de libros: el modelo se afino especificamente sobre ReLi-SA y alcanza un Macro F1 de 69,75% en esa tarea, por lo que es adecuado para clasificar opiniones de lectores en plataformas editoriales.
- Monitorizacion de sentimiento en noticias financieras: entrenado con datos de FinBERT y Phrasebank, puede etiquetar titulares y notas economicas en portugues para paneles de analisis de mercado.
- Moderacion de comunidades y redes sociales: la capacidad de clasificar emociones (GoEmotions, BRIGHTER) permite detectar contenido con carga emocional negativa o toxica en foros y comentarios en PT-BR.
- Enrutamiento de tickets de atencion al cliente: clasificar el sentimiento de cada mensaje entrante para priorizar casos negativos y derivarlos a agentes humanos.
- Analisis de encuestas y feedback abierto: procesar respuestas de NPS o formularios en portugues y agregar sentimiento y emociones por segmento.
- Investigacion academica en PLN en portugues: servir como linea base compacta y reproducible (licencia Apache 2.0) para experimentos de fusion de modelos y evaluacion multi-tarea.
- Etiquetado por lotes en pipelines de bajo coste: con 490 millones de parametros, se puede ejecutar en CPU o GPU modestas para clasificar grandes volumenes de texto sin depender de APIs externas.

## Benchmarks y rendimiento

Resultados declarados por el autor (Macro F1, evaluados con Guided Decoding via vLLM + Pydantic). No verificados de forma independiente.

| Dataset / Tarea | Metrica | Este modelo | Baseline zero-shot | Joint multi-task |
|---|---|---|---|---|
| ReLi-SA (sentimiento) | Macro F1 | 69,75% | 30,66% | 59,51% |
| ReLi-SA (sentimiento) | Micro F1 | 80,41% | 37,07% | 74,51% |
| ReLi-SA (sentimiento) | Accuracy | 80,41% | 37,07% | 74,51% |
| ReLi-SA (sentimiento) | Hamming Loss | 0,1959 | 0,6293 | 0,2549 |
| BRIGHTER (ptbr, emociones) | Macro F1 | 37,72% | no disponible | no disponible |
| Sentiments-FinBERT-PT-BR | Macro F1 | 22,45% | no disponible | no disponible |
| Financial Phrasebank PT-BR | Macro F1 | 30,73% | no disponible | no disponible |
| GoEmotions PT-BR | Macro F1 | 19,73% | no disponible | no disponible |

El modelo supera claramente al baseline zero-shot en la tarea objetivo (ReLi-SA) y mejora al baseline de ajuste conjunto multi-tarea en esa misma tarea. En las tareas fuera de dominio los valores son mas modestos, lo que refleja el compromiso inherente a la fusion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB en fp16 (490M parametros), alrededor de 0,5 GB en cuantizacion de 8 bits y 0,25-0,3 GB en 4 bits (estimacion teorica; no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100, H100 o RTX 4090 son sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers, vLLM (usado por el autor con Guided Decoding), text-generation-inference (el modelo declara compatibilidad con endpoints TGI). llama.cpp y Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 ReLi-SA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Prior-ReLiSA | 490,8M | no disponible | 69,75% | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | ~0,5B | no disponible | 30,66% | no disponible | Hugging Face |
| Joint multi-task SFT (baseline del paper) | ~0,5B | no disponible | 59,51% | no disponible | no disponible |

No se dispone de datos de otros modelos comparables de clasificacion de sentimiento en portugues en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado en portugues de Brasil: no esta pensado para otros idiomas y su rendimiento fuera del portugues no esta documentado.
- Rendimiento desigual entre tareas: el Macro F1 cae a 19,73% en GoEmotions PT-BR y 22,45% en Sentiments-FinBERT-PT-BR, muy por debajo de la tarea objetivo.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (`verified: false`).
- Riesgo de alucinacion en generacion libre: el modelo es un SLM de 0,5B y su uso fiable depende de la decodificacion guiada a etiquetas validas.
- Sesgos: no hay informacion publicada sobre sesgos demograficos o culturales en los datos de entrenamiento.
- Longitud de contexto no documentada: puede limitar el analisis de documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda validar el rendimiento en el dominio concreto antes de desplegar en produccion.
- Politica de retencion: el autor garantiza el alojamiento publico durante al menos un ano tras la finalizacion de la tesis (diciembre de 2026).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Prior-ReLiSA
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face "United Experts": https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Modelo base FinBERT: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-FinBERT
- Modelo base Brighter: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo base Phrasebank: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Modelo base GoEmotions: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-GoEmotions
- Dataset ReLi-SA: https://huggingface.co/datasets/ruanchaves/reli-sa
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
- Repositorio ReLi: https://github.com/ruanchaves/reli
