# nainiayoub/FLoRaQA-Q-Generation-Llama-3-8B

## Resumen

FLoRaQA-Q-Generation-Llama-3-8B es un adaptador LoRA sobre `meta-llama/Meta-Llama-3-8B` desarrollado por Ayoub Nainia (junto con Vignes-Lebbe, Mousannif y Zahir) para la primera etapa del sistema F-LoRA-QA, un pipeline de dos fases que extrae relaciones personaje-especie a partir de descripciones botanicas en frances. El adaptador recibe una descripcion botanica y genera la lista de preguntas que esa descripcion puede responder; cada pregunta se pasa despues, junto con la descripcion, al adaptador de respuesta (`nainiayoub/FLoRaQA-Llama-3-8B`) para producir pares pregunta-respuesta, es decir, afirmaciones personaje-estado.

El modelo resuelve un problema de extraccion de informacion estructurada en un dominio cientifico especializado (botanica descriptiva en frances) reformulando la tarea como generacion de preguntas seguida de respuesta. Esta publicado junto al articulo *F-LoRA-QA: Finetuning LLaMA Models with Low-Rank Adaptation for French Botanical Question Generation and Answering* (RANLP 2025). El adaptador es pequeno (0,7 GB en el repositorio) y se apoya en los pesos congelados de LLaMA 3-8B, por lo que su coste de despliegue es el del modelo base mas el delta LoRA.

La relevancia actual reside en su caracter de ejemplo reproducible de adaptacion de bajo rango para dominios cientificos de bajos recursos, con un conjunto de datos verificado manualmente y una evaluacion end-to-end publicada. No obstante, es un adaptador de nicho, en un solo idioma (frances) y con cero descargas en el momento de la consulta, lo que limita su validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA 3-8B) con adaptadores LoRA sobre proyecciones de atencion y feed-forward |
| Parametros totales | 8 mil millones en el modelo base; el adaptador LoRA anade un delta de bajo rango (r = 64) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base LLaMA 3-8B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | frances (fr) |
| Licencia | llama3 (heredada del modelo base Meta Llama 3) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LLaMA 3-8B, un transformer decoder-only con pesos congelados. El entrenamiento emplea Low-Rank Adaptation con rango r = 64 y alpha = 16, dropout 0,1, sobre las proyecciones de atencion (q, k, v, o) y las proyecciones feed-forward (gate, up, down). Se uso AdamW con gradientes fusionados y gradient checkpointing en una unica NVIDIA A100 (Google Colab). El resto de hiperparametros se detalla en el articulo.

Los datos provienen del conjunto de instrucciones F-LoRA-QA (registros `context` / `question` / `answer`): 16.962 pares pregunta-respuesta extraidos de 2.913 descripciones en cuatro floras francesas, redactados por un modelo general y verificados manualmente; 1.697 pares adicionales de una flora no vista se reservan para evaluacion. El prompt de instruccion sigue el formato reproducido del material suplementario del articulo (Zenodo, doi:10.5281/zenodo.16993669), con secciones `### Context:` y `### Response (All possible questions to ask the context):`.

## Capacidades

- Generacion de preguntas en frances a partir de descripciones botanicas: produce la lista de preguntas que un texto descriptivo puede responder.
- Extraccion de informacion en dos etapas: combinado con el adaptador de respuesta, transforma texto libre en pares pregunta-respuesta (afirmaciones personaje-estado).
- Comprension de texto cientifico especializado en botanica descriptiva en frances.
- Generacion de texto autoregresiva estandar de LLaMA 3-8B (heredada del modelo base).
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla del pipeline de dos etapas.
- Capacidad multilingue limitada al frances segun la model card; el modelo base es multilingue pero el adaptador se entreno solo en frances.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Digitalizacion de floras historicas: procesar descripciones botanicas en frances y generar las preguntas pertinentes para, en una segunda etapa, extraer automaticamente los caracteres y estados de cada especie, alimentando bases de datos taxonomicas.
- Construccion de bases de conocimiento botanico: convertir texto descriptivo no estructurado en tripletas personaje-estado verificables, con revision humana posterior, para su uso en sistemas de identificacion de plantas.
- Curacion de datasets cientificos: generar pares pregunta-respuesta a partir de corpus descriptivos para ampliar conjuntos de entrenamiento o evaluacion en dominios de biodiversidad.
- Asistencia a taxonomos y botanicos: proponer de forma automatica el conjunto de preguntas que una descripcion puede responder, acelerando la revision manual de fichas descriptivas.
- Investigacion en extraccion de informacion: servir como componente reproducible en experimentos de IE en dominios cientificos de bajos recursos y en un solo idioma.
- Pipeline de dos etapas en produccion interna: integrar el adaptador de generacion de preguntas con el adaptador de respuesta para un servicio de conversion de texto a pares QA en frances, con validacion contra la descripcion fuente.
- Demostracion y docencia: usar el space publico `flora-qa` como ejemplo de adaptacion LoRA sobre LLaMA 3-8B para tareas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo evalua el pipeline de dos etapas de forma end-to-end y reporta las metricas automaticas sobre la etapa de respuesta (vease la model card del adaptador de respuesta). Las preguntas generadas por este modelo se comprobaron manualmente durante la construccion del conjunto de datos, pero no se proporcionan cifras numericas para esta etapa en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es de 0,7 GB; el modelo base LLaMA 3-8B requiere aproximadamente 16 GB en fp16, unos 8-9 GB en cuantizacion de 8 bits y unos 5-6 GB en 4 bits (estimaciones habituales para un modelo de 8 mil millones de parametros; no confirmadas en la informacion proporcionada).
- GPU recomendadas: NVIDIA A100 (usada en el entrenamiento), H100 para mayor throughput; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) en fp16, y GPUs de 8-12 GB con cuantizacion de 4 u 8 bits.
- Cabe en consumer GPU: si, con cuantizacion del modelo base en GPUs de 8 GB o mas; en fp16 requiere 24 GB.
- Opciones de despliegue: transformers + PEFT (metodo documentado en la model card), vLLM, TGI y llama.cpp/Ollama con conversion del adaptador (no documentado explicitamente en la informacion disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del modelo base, la cuantizacion y el backend.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados numericos de benchmarks ni comparaciones con otros adaptadores o modelos de extraccion de informacion botanica. Como referencia cualitativa, el sistema F-LoRA-QA consta de dos adaptadores LoRA complementarios sobre el mismo modelo base: este (generacion de preguntas) y `nainiayoub/FLoRaQA-Llama-3-8B` (respuesta); ambos comparten licencia llama3 y el mismo dominio en frances.

## Limitaciones y advertencias

- Entrenado exclusivamente en botanica descriptiva en frances; su rendimiento fuera de ese dominio o idioma no esta validado.
- Las respuestas del pipeline son texto generado, no consultas a una base de datos; deben verificarse contra la descripcion fuente, como hicieron los autores con revision experta.
- Las metricas basadas en solapamiento de cadenas subestiman la correccion en este dominio (vease *Beyond BLEU*, R2LM 2025, de los mismos autores).
- Riesgo de alucinacion inherente al modelo base: puede generar preguntas no respaldadas por el contexto o formulaciones incorrectas.
- Sesgos no documentados en la informacion proporcionada; al derivar de LLaMA 3-8B hereda los sesgos de sus datos de preentrenamiento.
- Restricciones de licencia: hereda la licencia llama3 de Meta, que impone condiciones de uso comercial y requiere acceso al modelo base bajo dicha licencia.
- Con cero descargas y cero likes en el momento de la consulta, no existe validacion externa independiente documentada.
- El modelo esta pensado para funcionar en pareja con el adaptador de respuesta; usarlo de forma aislada solo cubre la etapa de generacion de preguntas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nainiayoub/FLoRaQA-Q-Generation-Llama-3-8B
- Adaptador de respuesta complementario: https://huggingface.co/nainiayoub/FLoRaQA-Llama-3-8B
- Demo en vivo: https://huggingface.co/spaces/nainiayoub/flora-qa
- Articulo (ACL Anthology): https://aclanthology.org/2025.ranlp-1.91/
- PDF del articulo: https://aclanthology.org/2025.ranlp-1.91.pdf
- Material suplementario (Zenodo): doi:10.5281/zenodo.16993669
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
