# Assaoka/Tucano2-qwen-0.5B-Phrasebank

## Resumen

Tucano2-qwen-0.5B-Phrasebank es un modelo de lenguaje pequeno (SLM) especializado en clasificacion de sentimiento financiero en portugues de Brasil. Lo desarrolla el autor Assaoka como parte del articulo ENIAC 2026 "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging", y se obtiene mediante ajuste fino supervisado (SFT) de un solo dominio sobre el modelo instructivo Polygl0t/Tucano2-qwen-0.5B-Instruct, que a su vez deriva de la familia Qwen3.

El modelo resuelve una tarea acotada: clasificar textos financieros en portugues en tres categorias (positivo, negativo, neutro). Con 490.799.104 parametros (aproximadamente 0,5 mil millones) y un repositorio de 3,3 GB, esta disenado para despliegues de bajo coste donde un modelo grande seria sobredimensionado. Su relevancia radica en que demuestra que un SLM de 0,5B, tras SFT especifico, alcanza un Macro F1 del 85,84% en Financial Phrasebank PT-BR, superando ampliamente la linea base zero-shot del modelo padre (38,14%).

Forma parte de un grupo experimental de ocho modelos del estudio, y el autor garantiza su alojamiento permanente. La licencia Apache 2.0 facilita su integracion en productos comerciales, aunque su alcance funcional esta limitado al portugues y a la clasificacion de sentimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), ajustado para clasificacion via generacion guiada |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers/vLLM) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, heredado de Polygl0t/Tucano2-qwen-0.5B-Instruct. Sobre esa base se aplica un ajuste fino supervisado (SFT) de tarea unica utilizando exclusivamente el dataset Financial Phrasebank en su traduccion al portugues de Brasil (disponible en Kaggle). No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion completa del dataset ni si hubo fases de RLHF o DPO.

La innovacion metodologica del trabajo no reside en la arquitectura, sino en el enfoque experimental: el modelo es un "especialista aislado" que se compara contra una linea base zero-shot y contra un modelo "Joint" entrenado multi-tarea, dentro de un estudio sobre fusion de modelos (model merging) para analisis de sentimiento multi-tarea en portugues. La evaluacion se realiza con decodificacion guiada mediante vLLM y Pydantic, lo que restringe la salida a las etiquetas validas de cada tarea.

## Capacidades

- Clasificacion de sentimiento financiero en portugues con tres etiquetas: positivo, negativo y neutro.
- Generacion de texto condicionada a plantillas de clasificacion (el modelo base es instructivo).
- Clasificacion de emociones y sentimiento general en portugues, aunque con rendimiento muy desigual segun la tarea.
- Salida estructurada fiable cuando se combina con decodificacion guiada (vLLM + Pydantic).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al portugues (PT-BR).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Analisis de sentimiento de noticias financieras en portugues: el modelo clasifica titulares y parrafos de prensa economica brasilena en positivo, negativo o neutro, con un Macro F1 del 85,84% en Financial Phrasebank PT-BR, adecuado para alimentar paneles de senales de mercado.
- Monitorizacion de redes sociales financieras: procesamiento por lotes de comentarios y publicaciones sobre activos o empresas, aprovechando el bajo coste de inferencia de un modelo de 0,5B para volumenes altos.
- Enrutamiento de tickets de soporte en banca: clasificar la tonalidad de las reclamaciones de clientes para priorizar casos negativos y derivarlos a agentes humanos.
- Filtrado previo en pipelines de analisis: usar el modelo como primera etapa barata que descarta o marca textos neutros antes de pasarlos a un modelo mayor, reduciendo coste computacional.
- Investigacion academica en PLN para portugues: servir de referencia reproducible (especialista aislado) en estudios de model merging y evaluacion multi-tarea, dado su alojamiento permanente y licencia permisiva.
- Extraccion de senales para modelos de riesgo: agregar la polaridad de comunicados y notas de prensa como caracteristica adicional en sistemas de scoring crediticio o de vigilancia de cartera.
- Prototipado rapido en entornos con GPU de consumo: validar flujos de clasificacion de sentimiento antes de escalar a modelos mayores, gracias a su tamano reducido.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), evaluados con decodificacion guiada via vLLM + Pydantic. Se comparan con la linea base zero-shot (modelo padre) y con el modelo Joint multi-tarea.

| Dataset / tarea | Metrica | Modelo | Baseline | Joint |
|---|---|---|---|---|
| RELI-SA | Macro F1 | 44,81% | 30,66% | 59,51% |
| RELI-SA | Micro F1 | 69,77% | 37,07% | 74,51% |
| RELI-SA | Accuracy | 69,77% | 37,07% | 74,51% |
| RELI-SA | Hamming Loss | 0,3023 | 0,6293 | 0,2549 |
| BRIGHTER | Macro F1 | 32,51% | 33,47% | 40,83% |
| BRIGHTER | Micro F1 | 41,78% | 38,07% | 59,14% |
| BRIGHTER | Accuracy | 26,33% | 24,66% | 49,60% |
| BRIGHTER | Hamming Loss | 0,2165 | 0,2731 | 0,1174 |
| FinBERT-PT-BR | Macro F1 | 79,19% | 54,77% | 85,91% |
| FinBERT-PT-BR | Micro F1 | 79,21% | 66,34% | 86,14% |
| FinBERT-PT-BR | Accuracy | 79,21% | 66,34% | 86,14% |
| FinBERT-PT-BR | Hamming Loss | 0,2079 | 0,3366 | 0,1386 |
| Financial Phrasebank | Macro F1 | 85,84% | 38,14% | 82,18% |
| Financial Phrasebank | Micro F1 | 86,89% | 39,32% | 83,69% |
| Financial Phrasebank | Accuracy | 86,89% | 39,32% | 83,69% |
| Financial Phrasebank | Hamming Loss | 0,1311 | 0,6068 | 0,1631 |
| GoEmotions PT-BR | Macro F1 | 7,02% | 7,59% | 29,99% |
| GoEmotions PT-BR | Micro F1 | 10,47% | 10,31% | 41,84% |
| GoEmotions PT-BR | Accuracy | 7,16% | 6,08% | 36,55% |
| GoEmotions PT-BR | Hamming Loss | 0,0868 | 0,0720 | 0,0464 |
| Media (5 tareas) | Macro F1 | 49,88% | 32,92% | 59,68% |
| Media (5 tareas) | Micro F1 | 57,63% | 38,22% | 69,07% |
| Media (5 tareas) | Accuracy | 53,87% | 34,70% | 66,10% |
| Media (5 tareas) | Hamming Loss | 0,1889 | 0,3835 | 0,1441 |
| Media normalizada | Macro F1 | 48,04% | 21,92% | 88,23% |
| Media normalizada | Micro F1 | 56,11% | 13,58% | 93,07% |
| Media normalizada | Accuracy | 55,31% | 14,15% | 93,47% |
| Media normalizada | Hamming Loss | 0,3748 | 0,7757 | 0,0548 |

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1 GB para los pesos (490,8M parametros); en cuantizacion de 8 bits, en torno a 0,5 GB; en 4 bits, alrededor de 0,3 GB, mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de consumo, e incluso en CPU para volumenes moderados.
- Opciones de despliegue: transformers, vLLM (usado por el autor con decodificacion guiada), text-generation-inference (el modelo declara compatibilidad con endpoints), llama.cpp u Ollama si se dispone de pesos convertidos a GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Phrasebank | 490,8M | no disponible | Macro F1 85,84% en Financial Phrasebank PT-BR | Apache 2.0 | Hugging Face |
| Polygl0t/Tucano2-qwen-0.5B-Instruct (linea base) | ~0,5B | no disponible | Macro F1 38,14% en Financial Phrasebank PT-BR | no disponible en la informacion | Hugging Face |
| Modelo Joint multi-tarea (mismo estudio) | ~0,5B | no disponible | Macro F1 82,18% en Financial Phrasebank PT-BR; 59,68% de media | no disponible en la informacion | Hugging Face (coleccion del autor) |

La comparativa se limita a los modelos del mismo estudio, ya que la informacion proporcionada no incluye datos de otros SLM comparables de clasificacion de sentimiento en portugues.

## Limitaciones y advertencias

- Especializacion estrecha: entrenado solo para sentimiento financiero en portugues; su rendimiento cae drasticamente en tareas fuera de dominio (Macro F1 del 7,02% en GoEmotions PT-BR).
- Riesgo de sobreajuste al dominio financiero: el alto resultado en Financial Phrasebank contrasta con el 32,51% en BRIGHTER y el 44,81% en RELI-SA, lo que sugiere poca generalizacion.
- Idioma unico: solo soporta portugues de Brasil; no se ha validado en portugues europeo ni en otros idiomas.
- Riesgo de alucinacion: al ser un modelo generativo, sin decodificacion guiada puede producir etiquetas o texto fuera del conjunto valido; el autor recomienda restringir la salida con vLLM + Pydantic.
- Resultados no verificados: todas las metricas del model-index estan marcadas como `verified: false` y proceden del propio autor.
- Datos de entrenamiento limitados: el SFT se realizo unicamente sobre Financial Phrasebank, lo que puede introducir sesgos del corpus (noticias financieras traducidas) y baja cobertura de jerga informal.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantias ni evaluaciones independientes en produccion.
- Sin informacion sobre longitud de contexto, lo que impide planificar el procesamiento de documentos largos sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Phrasebank
- Modelo base: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Articulo ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del articulo: https://doi.org/10.5753/eniac.2026.31064
- Coleccion en Hugging Face: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Dataset Financial Phrasebank PT-BR (Kaggle): https://www.kaggle.com/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset RELI-SA: https://huggingface.co/datasets/ruanchaves/reli-sa
- Dataset BRIGHTER: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
