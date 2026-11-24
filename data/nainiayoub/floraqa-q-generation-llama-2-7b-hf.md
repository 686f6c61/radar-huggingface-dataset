# nainiayoub/FLoRaQA-Q-Generation-Llama-2-7b-hf

## Resumen

FLoRaQA-Q-Generation-Llama-2-7b-hf es un adaptador LoRA publicado por nainiayoub (Ayoub Nainia) sobre el modelo base meta-llama/Llama-2-7b-hf. Forma parte de F-LoRA-QA, un sistema de dos etapas que extrae relaciones personaje-especie (carácter-estado) a partir de descripciones botánicas en frances, reformulando la tarea como generacion de preguntas seguida de respuesta a preguntas. En esta primera etapa, el adaptador recibe una descripcion botanica y propone la lista de preguntas que esa descripcion puede responder; esas preguntas se pasan despues, junto con la descripcion, al adaptador de respuesta (nainiayoub/FLoRaQA-Llama-2-7b-hf).

El modelo resuelve un problema concreto de extraccion de informacion en un dominio cientifico especializado: convertir texto descriptivo libre en afirmaciones estructuradas de tipo carácter-estado, sin necesidad de un esquema de anotacion manual. Es relevante para la comunidad de biodiversidad y botanica computacional porque demuestra que un ajuste LoRA de bajo coste sobre un modelo de 7B puede abordar tareas de extraccion en dominios con poco datos etiquetados y terminologia muy especifica.

El adaptador se entrena con PEFT sobre pesos congelados de Llama 2 7B, ocupa 0,6 GB en el repositorio y esta pensado exclusivamente para texto en frances. La publicacion asociada aparecio en RANLP 2025 y el sistema completo cuenta con una demo publica en Hugging Face Spaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2 7B) con adaptador LoRA |
| Parametros totales | 7 000 millones (modelo base); adaptador LoRA de bajo rango sobre pesos congelados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2 7B; el paper no la especifica para el adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | frances (fr) |
| Licencia | llama2 (heredada de meta-llama/Llama-2-7b-hf) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica Low-Rank Adaptation con rango r = 64 y alpha = 16, dropout 0,1, sobre las proyecciones de atencion (q, k, v, o) y las proyecciones feed-forward (gate, up, down) de Llama 2 7B. Los pesos base permanecen congelados. El entrenamiento usa AdamW con gradientes fusionados y gradient checkpointing en una unica NVIDIA A100 (Google Colab); el resto de hiperparametros se detalla en el paper.

Los datos proceden del dataset de instrucciones F-LoRA-QA (registros context / question / answer): 16 962 pares pregunta-respuesta extraidos de 2 913 descripciones de cuatro floras francesas, redactados por un modelo general y verificados manualmente. Se reservan 1 697 pares adicionales de una flora no vista para evaluacion. El prompt sigue un formato de instruccion en frances con secciones ### Context y ### Response (All possible questions to ask the context).

## Capacidades

- Generacion de preguntas en frances a partir de descripciones botanicas (question generation).
- Extraccion de informacion en dominio cientifico: transforma texto descriptivo en preguntas candidatas que estructuran la informacion.
- Generacion de texto autoregresiva en frances con el formato de instruccion especifico del adaptador.
- Integracion en un pipeline de dos etapas junto con el adaptador de respuesta para producir pares pregunta-respuesta (carácter-estado).
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking; el adaptador esta especializado en una unica tarea.
- Capacidad multilingue limitada al frances; no se documenta transferencia a otros idiomas.

## Casos de uso

- Digitalizacion de floras historicas: procesar descripciones botanicas en frances y generar las preguntas que estructuran cada descripcion, para alimentar la etapa de respuesta y obtener afirmaciones carácter-estado utilizables en bases de datos de biodiversidad.
- Construccion de bases de conocimiento botanicas: usar las preguntas generadas como esquema implicito para normalizar descripciones heterogeneas de distintas floras y facilitar la comparacion entre fuentes.
- Anotacion asistida por expertos: el modelo propone preguntas candidatas que un botanico revisa y valida, reduciendo el coste de anotacion manual frente a la extraccion directa.
- Investigacion en extraccion de informacion con pocos datos: servir como referencia reproducible de ajuste LoRA en dominios especializados con vocabulario tecnico y datasets pequenos.
- Pipeline de dos etapas en produccion documental: combinado con el adaptador de respuesta, convertir lotes de descripciones en pares pregunta-respuesta para ingestion en sistemas de gestion de colecciones botanicas.
- Experimentacion academica sobre evaluacion: el adaptador permite estudiar la calidad de las preguntas generadas y su impacto en la etapa de respuesta, en linea con el trabajo de los autores sobre metricas mas alla de BLEU.
- Demo interactiva y docencia: la demo publica en Hugging Face Spaces permite probar el sistema completo con ejemplos reservados, util para formación e ilustracion del enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper evalua el pipeline de dos etapas de extremo a extremo y reporta las metricas automaticas sobre la etapa de respuesta (vease la model card del adaptador de respuesta). Las preguntas producidas por este adaptador se verificaron manualmente durante la construccion del dataset, pero no se ofrece una tabla de metricas cuantitativas para esta etapa.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0,6 GB, pero requiere cargar el modelo base Llama 2 7B. En fp16 se estiman aproximadamente 14 GB de VRAM; en 8 bits unos 7-8 GB; en 4 bits unos 4-5 GB (estimaciones habituales para un modelo de 7B, no publicadas por el autor).
- GPU recomendadas: NVIDIA A100 (la usada en entrenamiento) para inferencia comoda en fp16; H100 para mayor throughput; RTX 4090 (24 GB) permite cargar el modelo base en fp16 junto con el adaptador.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizacion de 8 o 4 bits; en GPUs de 8-12 GB requiere cuantizacion agresiva.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card); vLLM, llama.cpp, Ollama o TGI no estan documentados oficialmente para este adaptador y su viabilidad depende de la conversion del adaptador al formato correspondiente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLoRaQA-Q-Generation-Llama-2-7b-hf (este) | 7B (base) + LoRA | no disponible | Generacion de preguntas botanicas en frances | llama2 | Hugging Face (adaptador PEFT) |
| nainiayoub/FLoRaQA-Llama-2-7b-hf | 7B (base) + LoRA | no disponible | Respuesta a preguntas botanicas en frances (etapa 2) | llama2 | Hugging Face (adaptador PEFT) |
| meta-llama/Llama-2-7b-hf | 7B | 4 096 tokens (especificacion de Llama 2) | Generacion de texto general | llama2 | Hugging Face (pesos base) |

No se identifican en la informacion disponible otros adaptadores especializados comparables de generacion de preguntas botanicas en frances.

## Limitaciones y advertencias

- Entrenado exclusivamente con botanica descriptiva en frances; el rendimiento fuera de ese dominio o idioma no esta documentado.
- Las respuestas del pipeline son texto generado, no consultas a una base de datos; deben verificarse contra la descripcion fuente, como hicieron los autores con revision experta.
- Las metricas basadas en solapamiento de cadenas subestiman la correccion en este dominio (vease Beyond BLEU, R2LM 2025, de los mismos autores).
- Riesgo de alucinacion: el modelo puede generar preguntas plausibles pero no respaldadas por la descripcion; la verificacion manual es necesaria en produccion.
- Licencia llama2 heredada del modelo base: el acceso a meta-llama/Llama-2-7b-hf esta sujeto a los terminos de Meta y el adaptador no puede usarse de forma incompatible con ellos; revisar las restricciones de uso comercial de la licencia Llama 2.
- El adaptador no incluye tool calling, agentes ni capacidades multimodales; su uso esta acotado a la tarea de generacion de preguntas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nainiayoub/FLoRaQA-Q-Generation-Llama-2-7b-hf
- Adaptador de respuesta companion: https://huggingface.co/nainiayoub/FLoRaQA-Llama-2-7b-hf
- Demo interactiva: https://huggingface.co/spaces/nainiayoub/flora-qa
- Paper en ACL Anthology: https://aclanthology.org/2025.ranlp-1.91/
- PDF del paper: https://aclanthology.org/2025.ranlp-1.91.pdf
- Material suplementario (Zenodo): doi:10.5281/zenodo.16993669
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
