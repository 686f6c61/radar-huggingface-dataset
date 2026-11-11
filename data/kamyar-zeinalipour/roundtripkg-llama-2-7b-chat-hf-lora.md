# Kamyar-zeinalipour/RoundTripKG-Llama-2-7b-chat-hf-LoRA

## Resumen

RoundTripKG-Llama-2-7b-chat-hf-LoRA es un adaptador LoRA sobre NousResearch/Llama-2-7b-chat-hf especializado en la extraccion de tripletas de grafo de conocimiento (sujeto, predicado, objeto) a partir de texto libre. Lo desarrolla Kamyar Zeinalipour y colaboradores (Universidad de Siena, segun la autoria del paper) y se presenta en el articulo "From Graph to Text and Back: Semantic Fidelity in Automated Industrial Knowledge Graphs" (ACL 2026, Industry Track). El modelo resuelve un problema concreto de la construccion automatica de grafos de conocimiento en entornos industriales: convertir documentos no estructurados en tripletas fiables sin depender de anotacion manual.

La innovacion metodologica es el pipeline "round-trip": el propio modelo verbaliza tripletas de un KG en texto y despues reconstruye el grafo a partir de esa verbalizacion; solo se conservan los textos de los que el grafo original se recupera de forma exacta. El adaptador se entrena sobre ese corpus autogenerado y filtrado por fidelidad, lo que mejora la precision de extraccion del propio modelo. Es, por tanto, un caso de destilacion de datos sinteticos con verificacion automatica.

El modelo es relevante para equipos que necesitan un extractor de tripletas ligero, desplegable en una sola GPU, con licencia Llama 2 y sin dependencia de APIs propietarias. El repositorio ocupa 0,6 GB e incluye unicamente los pesos del adaptador PEFT en safetensors, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con adaptador LoRA (PEFT) |
| Parametros totales | 7 000 millones (modelo base); el adaptador LoRA no se especifica en la informacion disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser un adaptador LoRA, la cuantizacion se aplica al modelo base (4-bit, 8-bit, GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (licencia de Llama 2 de Meta) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base NousResearch/Llama-2-7b-chat-hf |
| Libreria | peft |
| Tamano del repositorio | 0,6 GB |
| Dataset de entrenamiento | Kamyar-zeinalipour/llama2_kg (autogenerado, filtrado por round-trip) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-2-7b-chat-hf, un transformer decoder-only denso de 7 000 millones de parametros con atencion causal estandar y normalizacion RMSNorm, preentrenado por Meta y ajustado para dialogo por NousResearch. El adaptador LoRA emplea rango r = 16, alpha = 32 y dropout 0,1, aplicado sobre todas las proyecciones de atencion y MLP, ademas de `embed_tokens` y `lm_head`. El entrenamiento se ejecuto durante 3 epocas con AdamW, learning rate 1e-4 con decaimiento coseno, precision bf16 y DeepSpeed sobre 4 GPU RTX A6000.

Los datos de entrenamiento (`llama2_kg`) son autogenerados por el propio modelo mediante un pipeline de ida y vuelta: se verbalizan tripletas de un grafo en lenguaje natural y se reconstruye el grafo desde el texto; solo se retienen las verbalizaciones que permiten recuperar el grafo original de forma exacta. Este filtrado por fidelidad semantica actua como mecanismo de control de calidad de los datos sinteticos y es la contribucion tecnica principal del trabajo. No se documenta en la informacion disponible el uso de RLHF o DPO adicional, ni el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Extraccion de tripletas de grafo de conocimiento (sujeto, predicado, objeto) a partir de texto en ingles.
- Generacion de texto orientada a la verbalizacion de grafos de conocimiento.
- Reconstruccion de grafos a partir de descripciones textuales (capacidad implicita en el pipeline round-trip).
- Extraccion de informacion estructurada en dominios industriales y documentales.
- Generacion de texto conversacional heredada del modelo base Llama-2-7b-chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el adaptador esta especializado en una tarea unica.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Construccion automatica de grafos de conocimiento industriales: el adaptador convierte manuales tecnicos, informes de mantenimiento y documentacion de planta en tripletas listas para cargar en Neo4j o similar, reduciendo la anotacion manual en dominios donde los ontologos ya estan definidos.
- Enriquecimiento de bases de datos documentales: procesamiento por lotes de corpus internos para extraer entidades y relaciones, con la ventaja de que el modelo cabe en una sola GPU y no requiere enviar documentacion sensible a APIs externas.
- Generacion de datos sinteticos de entrenamiento para otros extractores: el pipeline round-trip permite producir pares texto-tripleta verificados automaticamente, utiles para entrenar o evaluar modelos de extraccion de menor tamano.
- Validacion de fidelidad de verbalizaciones: dado un grafo y un texto candidato, el modelo puede usarse para comprobar si la reconstruccion recupera las tripletas originales, sirviendo como filtro de calidad en pipelines de datos.
- Asistente de curacion de ontologias: integrado en una herramienta interna, propone tripletas a partir de fragmentos de texto para que un experto las revise, acelerando la poblacion de un KG corporativo.
- Extraccion de relaciones en el dominio biomedico o legal en ingles: cualquier flujo que requiera identificar relaciones entre entidades en texto plano y almacenarlas en formato estructurado, siempre que el dominio se exprese en ingles.
- Prototipado rapido de pipelines de information extraction: al ser un adaptador PEFT de 0,6 GB sobre un base ampliamente soportado, permite experimentar con `merge_and_unload` en entornos de investigacion con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test del corpus round-trip. La valoracion humana es una escala experta de 1 a 5.

| Metrica | Base | Fine-tuned | Delta |
|---|---:|---:|---:|
| BERTScore F1 | 0,438 | 0,505 | +0,068 |
| ROUGE-L F1 | 0,382 | 0,419 | +0,037 |
| BLEU-4 | 0,131 | 0,151 | +0,020 |
| Valoracion humana (1-5) | 2,70 | 3,32 | +0,62 |

Comparativa interna del paper entre los tres adaptadores publicados (valoracion humana base a fine-tuned):

| Modelo base | Adaptador | Valoracion humana |
|---|---|---:|
| Llama-3.2-1B-Instruct | RoundTripKG-Llama-3.2-1B-Instruct-LoRA | 1,94 a 2,70 |
| Llama-3.2-3B-Instruct | RoundTripKG-Llama-3.2-3B-Instruct-LoRA | 2,30 a 4,02 |
| Llama-2-7b-chat-hf | RoundTripKG-Llama-2-7b-chat-hf-LoRA | 2,70 a 3,32 |

No se han publicado en la informacion disponible resultados en benchmarks estandar de extraccion de tripletas (por ejemplo, WebNLG, REBEL o DocRED).

## Requisitos de hardware

- VRAM estimada: en bf16, el modelo base de 7 000 millones de parametros requiere aproximadamente 14 GB solo para pesos, mas activaciones y cache KV (entorno a 16-18 GB para inferencia con contexto moderado). En cuantizacion 4-bit se reduce a unos 4-5 GB.
- GPU recomendadas: A100 40 GB o H100 para bf16 con lotes grandes; RTX A6000 (48 GB) fue la GPU usada en entrenamiento; RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza el modelo base a 4-bit o 8-bit.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor), vLLM tras fusionar el adaptador con `merge_and_unload`, TGI, llama.cpp/Ollama si se convierte el modelo fusionado a GGUF. El autor proporciona scripts de inferencia en el repositorio de GitHub.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoundTripKG-Llama-2-7b-chat-hf-LoRA | 7B (base) + LoRA | no disponible | Extraccion de tripletas KG | llama2 | Hugging Face (adaptador PEFT) |
| RoundTripKG-Llama-3.2-3B-Instruct-LoRA | 3B (base) + LoRA | no disponible | Extraccion de tripletas KG | llama3.2 | Hugging Face; mejor valoracion humana (4,02) en el mismo paper |
| RoundTripKG-Llama-3.2-1B-Instruct-LoRA | 1B (base) + LoRA | no disponible | Extraccion de tripletas KG | llama3.2 | Hugging Face; opcion mas ligera del mismo trabajo |
| Llama-2-7b-chat-hf (base) | 7B | 4096 tokens | Chat general | llama2 | Hugging Face; sirve de linea base sin especializar |

Dentro del propio paper, el adaptador de 3B sobre Llama-3.2 obtiene la mejor valoracion humana (4,02 frente a 3,32 del de 7B), lo que sugiere que para esta tarea el modelo base y los datos asociados pesan mas que el tamano. No se dispone de comparaciones con extractores especializados externos (por ejemplo, REBEL o UniRel) en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el adaptador esta entrenado unicamente para extraccion y verbalizacion de tripletas; su rendimiento en tareas generales de chat puede degradarse respecto al modelo base.
- Idioma: solo ingles segun la model card; no hay evidencia de transferencia a castellano ni a otros idiomas.
- Datos sinteticos: el entrenamiento usa datos autogenerados y filtrados por round-trip; los sesgos del modelo base pueden amplificarse en el corpus y en el adaptador.
- Riesgo de alucinacion: como todo modelo generativo, puede producir tripletas plausibles pero no presentes en el texto; se recomienda validacion contra la fuente o un filtro de fidelidad adicional.
- Licencia Llama 2: restricciones de uso comercial (limite de 700 millones de usuarios mensuales, obligaciones de atribucion y clausulas de uso aceptable); revisar los terminos antes de desplegar en produccion.
- Contexto: no se documenta la longitud de contexto efectiva para este adaptador; el modelo base soporta 4096 tokens, lo que limita el procesamiento de documentos largos sin troceado previo.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado en noviembre de 2026; ecosistema de soporte limitado y sin comunidad consolidada.
- Requiere el modelo base: no es un modelo autonomo; hay que descargar NousResearch/Llama-2-7b-chat-hf y aplicar el adaptador con PEFT.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Kamyar-zeinalipour/RoundTripKG-Llama-2-7b-chat-hf-LoRA
- Modelo base: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Dataset de entrenamiento: https://huggingface.co/datasets/Kamyar-zeinalipour/llama2_kg
- Paper (ACL Anthology): https://aclanthology.org/2026.acl-industry.140/
- DOI: https://doi.org/10.18653/v1/2026.acl-industry.140
- Repositorio de codigo: https://github.com/KamyarZeinalipour/round-trip-kg
- Coleccion "From Graph to Text and Back": https://huggingface.co/collections/Kamyar-zeinalipour/from-graph-to-text-and-back-acl-2026-6af4841166cf330a92294b6c
- Adaptador Llama-3.2-1B: https://huggingface.co/Kamyar-zeinalipour/RoundTripKG-Llama-3.2-1B-Instruct-LoRA
- Adaptador Llama-3.2-3B: https://huggingface.co/Kamyar-zeinalipour/RoundTripKG-Llama-3.2-3B-Instruct-LoRA
- Dataset llama1b_kg: https://huggingface.co/datasets/Kamyar-zeinalipour/llama1b_kg
- Dataset llama3b_kg: https://huggingface.co/datasets/Kamyar-zeinalipour/llama3b_kg
