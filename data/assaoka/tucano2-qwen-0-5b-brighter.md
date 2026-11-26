# Assaoka/Tucano2-qwen-0.5B-Brighter

## Resumen

Tucano2-qwen-0.5B-Brighter es un modelo de lenguaje especializado en la deteccion multi-etiqueta de emociones en portugues de Brasil, desarrollado por el autor Assaoka como parte del estudio "United Experts: Efficient Multi-Task Sentiment Analysis in Portuguese via Model Merging" presentado en ENIAC 2026. Se obtiene mediante ajuste fino supervisado (SFT) de un solo task sobre el modelo instructivo Polygl0t/Tucano2-qwen-0.5B-Instruct, que a su vez deriva de la familia Qwen3.

El modelo resuelve una tarea concreta: clasificar texto en portugues entre seis categorias emocionales (raiva, nojo, medo, alegria, tristeza, surpresa) en regimen multi-etiqueta, es decir, una misma frase puede activar varias emociones simultaneamente. Con 490.799.104 parametros (aproximadamente 0,5B), se posiciona como un SLM (small language model) orientado a despliegues de bajo coste y baja latencia, no como un asistente generalista.

Su relevancia actual radica en que forma parte de un conjunto de ocho modelos del estudio ENIAC 2026 que compara especialistas aislados frente a tecnicas de fusion de modelos para analisis de sentimiento multi-tarea en portugues. Este checkpoint concreto representa la rama de "especialista aislado" para emociones, y sirve como referencia para evaluar si la fusion supera al ajuste fino mono-tarea. La licencia Apache 2.0 y su reducido tamano facilitan su integracion en pipelines de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3, segun tags del modelo) |
| Parametros totales | 490.799.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada) |
| Idiomas soportados | Portugues (PT-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 0,5B parametros heredado de Polygl0t/Tucano2-qwen-0.5B-Instruct, que a su vez se basa en la arquitectura Qwen3 segun las etiquetas del repositorio. Sobre esa base se aplica un ajuste fino supervisado (SFT) de una sola tarea utilizando el subconjunto `ptbr` del dataset BRIGHTER-emotion-categories, orientado a la deteccion multi-etiqueta de seis emociones. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card solo indica SFT supervisado.

La innovacion metodologica no reside en el modelo en si, sino en su rol dentro del experimento ENIAC 2026: se evalua con decodificacion guiada (guided decoding) mediante vLLM y Pydantic, forzando la salida a un esquema estructurado de etiquetas. Este checkpoint representa la rama de especialista aislado, que se compara contra el baseline zero-shot (el modelo base sin ajustar) y contra un baseline "Joint" de SFT multi-tarea. La evaluacion cubre cinco benchmarks de sentimiento y emocion en portugues, con y sin dominio en el entrenamiento.

## Capacidades

- Clasificacion multi-etiqueta de emociones en portugues de Brasil: raiva, nojo, medo, alegria, tristeza y surpresa.
- Generacion de texto condicionada a un esquema estructurado mediante decodificacion guiada (vLLM + Pydantic).
- Clasificacion de sentimiento como capacidad secundaria, evaluada en RELI-SA, FinBERT-PT-BR y Financial Phrasebank PT-BR.
- Ajuste fino mono-tarea: no esta entrenado para alternar entre tareas de sentimiento y emocion de forma nativa.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al portugues; el modelo base podria tener cobertura adicional, pero no se declara en esta ficha.

## Casos de uso

- Moderacion de comunidades en portugues: el modelo puede etiquetar mensajes de foros o redes con las seis emociones para priorizar revision humana de contenido con alta carga de raiva o medo, dado su bajo coste por inferencia.
- Analisis de satisfaccion de clientes: procesar resenas y tickets en PT-BR para detectar combinaciones de emociones (por ejemplo, tristeza y raiva) que un clasificador mono-etiqueta no capturaria.
- Monitorizacion de sentimiento financiero: pese a su tamano, obtiene 72,95% de Macro F1 en FinBERT-PT-BR, lo que lo hace util para clasificar noticias economicas en portugues en pipelines de research.
- Investigacion en fusion de modelos: sirve como especialista de referencia en experimentos de model merging, comparando su rendimiento aislado frente a modelos fusionados multi-tarea.
- Etiquetado asistido de datasets: generar pre-etiquetas emocionales sobre grandes volumenes de texto en portugues para su posterior revision, aprovechando la decodificacion guiada para garantizar salida valida.
- Despliegue en edge o entornos con recursos limitados: con 0,5B parametros, puede ejecutarse en CPU o GPU consumer para tareas de clasificacion de alto volumen donde la latencia y el coste importan mas que la precision absoluta.
- Analisis de encuestas abiertas: clasificar respuestas de NPS o estudios de mercado en PT-BR por perfil emocional multi-etiqueta antes de un analisis cualitativo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), con decodificacion guiada via vLLM y Pydantic. Se comparan contra el baseline zero-shot (modelo base) y el baseline "Joint" de SFT multi-tarea.

| Dataset / tarea | Metrica | Modelo | Baseline | Joint |
|---|---|---|---|---|
| RELI-SA | Macro F1 | 32,88% | 30,66% | 59,51% |
| RELI-SA | Micro F1 | 43,10% | 37,07% | 74,51% |
| RELI-SA | Accuracy | 43,10% | 37,07% | 74,51% |
| RELI-SA | Hamming Loss | 0,5690 | 0,6293 | 0,2549 |
| BRIGHTER | Macro F1 | 35,12% | 33,47% | 40,83% |
| BRIGHTER | Micro F1 | 58,00% | 38,07% | 59,14% |
| BRIGHTER | Accuracy | 49,98% | 24,66% | 49,60% |
| BRIGHTER | Hamming Loss | 0,1194 | 0,2731 | 0,1174 |
| FinBERT-PT-BR | Macro F1 | 72,95% | 54,77% | 85,91% |
| FinBERT-PT-BR | Micro F1 | 76,24% | 66,34% | 86,14% |
| FinBERT-PT-BR | Accuracy | 76,24% | 66,34% | 86,14% |
| FinBERT-PT-BR | Hamming Loss | 0,2376 | 0,3366 | 0,1386 |
| Financial Phrasebank | Macro F1 | 61,64% | 38,14% | 82,18% |
| Financial Phrasebank | Micro F1 | 60,99% | 39,32% | 83,69% |
| Financial Phrasebank | Accuracy | 60,99% | 39,32% | 83,69% |
| Financial Phrasebank | Hamming Loss | 0,3901 | 0,6068 | 0,1631 |
| GoEmotions PT-BR | Macro F1 | 6,01% | 7,59% | 29,99% |
| GoEmotions PT-BR | Micro F1 | 9,36% | 10,31% | 41,84% |
| GoEmotions PT-BR | Accuracy | 5,57% | 6,08% | 36,55% |
| GoEmotions PT-BR | Hamming Loss | 0,0590 | 0,0720 | 0,0464 |
| Media | Macro F1 | 41,72% | 32,92% | 59,68% |
| Media | Micro F1 | 49,54% | 38,22% | 69,07% |
| Media | Accuracy | 47,17% | 34,70% | 66,10% |
| Media | Hamming Loss | 0,2750 | 0,3835 | 0,1441 |
| Media normalizada | Macro F1 | 37,09% | 21,92% | 88,23% |
| Media normalizada | Micro F1 | 44,84% | 13,58% | 93,07% |
| Media normalizada | Accuracy | 46,45% | 14,15% | 93,47% |
| Media normalizada | Hamming Loss | 0,3822 | 0,7757 | 0,0548 |

Observacion: el especialista aislado mejora al baseline zero-shot en la media (41,72% frente a 32,92% de Macro F1), pero queda muy por debajo del baseline Joint multi-tarea (59,68%), lo que sugiere que el ajuste fino mono-tarea sobre un modelo tan pequeno no compensa frente a un entrenamiento conjunto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1 GB para los pesos (490,8M parametros) mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de secuencia.
- Cuantizacion a 8 bits: alrededor de 0,5 GB de pesos. A 4 bits: alrededor de 0,25 GB. No se han publicado checkpoints GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090). Tambien puede ejecutarse en CPU con latencia aceptable para clasificacion por lotes.
- Cabe holgadamente en GPU consumer e incluso en entornos integrados con suficiente memoria.
- Opciones de despliegue: transformers (libreria declarada), vLLM con decodificacion guiada (usado en la evaluacion oficial), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y conversion manual a llama.cpp/Ollama si se generan pesos GGUF.
- Latencia y throughput: no disponibles de forma oficial. Por tamano, se espera un throughput alto en vLLM con batching, adecuado para clasificacion de grandes volumenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 medio (5 benchmarks PT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tucano2-qwen-0.5B-Brighter | 490,8M | no disponible | 41,72% | Apache 2.0 | Hugging Face |
| Tucano2-qwen-0.5B-Instruct (baseline zero-shot) | ~0,5B | no disponible | 32,92% | no disponible en esta ficha | Hugging Face |
| Baseline Joint multi-tarea (ENIAC 2026) | ~0,5B | no disponible | 59,68% | no disponible en esta ficha | no disponible |
| Modelos especializados BERTimbau / FinBERT-PT-BR | ~110M-500M | 512 tokens tipicamente | no disponible | variable | Hugging Face |

La comparacion mas directa es contra su propio modelo base y contra el baseline Joint del mismo estudio: el especialista aislado supera al zero-shot pero pierde claramente frente al multi-tarea. Frente a encoder-only especializados en portugues (BERTimbau, FinBERT-PT-BR) no hay datos comparativos en la informacion disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente para portugues de Brasil; su rendimiento en portugues europeo u otros idiomas no esta documentado.
- Es un especialista mono-tarea: no debe usarse como asistente conversacional general ni para tareas fuera de clasificacion de emociones y sentimiento.
- Rendimiento muy bajo en GoEmotions PT-BR (6,01% Macro F1), lo que indica escasa generalizacion fuera del dominio de entrenamiento.
- Resultados de benchmarks declarados por el autor y no verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinacion en generacion libre; la evaluacion oficial depende de decodificacion guiada con esquema Pydantic, por lo que el rendimiento sin ese constrain puede degradarse.
- El modelo base es de 0,5B parametros, con capacidad limitada de razonamiento y comprension de contextos largos.
- No se documentan sesgos especificos, pero al entrenarse sobre BRIGHTER puede heredar los sesgos de anotacion de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica en el contexto de un paper academico.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Assaoka/Tucano2-qwen-0.5B-Brighter
- Modelo base: https://huggingface.co/Polygl0t/Tucano2-qwen-0.5B-Instruct
- Paper ENIAC 2026 (SBC OpenLib): https://sol.sbc.org.br/index.php/eniac/article/view/47030
- DOI del paper: https://doi.org/10.5753/eniac.2026.31064
- Coleccion Hugging Face del estudio: https://huggingface.co/collections/Assaoka/united-experts-merging-slms-for-multi-task-sentiment-analys-6a2007d3f6756e7f369c899f
- Dataset BRIGHTER emotion categories: https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories
- Dataset ReLi-SA: https://huggingface.co/datasets/ruanchaves/reli-sa
- Dataset Sentiments-FinBERT-PT-BR: https://huggingface.co/datasets/lucas-leme/Sentiments-FinBERT-PT-BR
- Dataset Financial Phrasebank PT-BR: https://huggingface.co/datasets/mateuspicanco/financial-phrase-bank-portuguese-translation
- Dataset GoEmotions PT-BR: https://huggingface.co/datasets/antoniomenezes/go_emotions_ptbr
