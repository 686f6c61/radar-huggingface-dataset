# nainiayoub/FLoRaQA-Llama-2-7b-hf

## Resumen

FLoRaQA-Llama-2-7b-hf es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `meta-llama/Llama-2-7b-hf`, desarrollado por Ayoub Nainia y colaboradores (Vignes-Lebbe, Mousannif y Zahir) en el marco del sistema F-LoRA-QA, presentado en RANLP 2025. El adaptador resuelve una tarea muy concreta: la respuesta a preguntas sobre descripciones botanicas en frances, extrayendo relaciones personaje-especie (por ejemplo, el numero de foliolos, la textura del limbo o las dimensiones de una inflorescencia) a partir de texto descriptivo.

El sistema completo es de dos etapas: un adaptador companero genera preguntas a partir del contexto botanico y este adaptador produce la respuesta. El modelo base es un transformer decoder-only de 7.000 millones de parametros con 4.096 tokens de contexto; el adaptador LoRA congela los pesos originales y entrena proyecciones de atencion y feed-forward con rango 64.

Su relevancia es acotada pero clara: demuestra que un ajuste fino parametrizado eficiente sobre un modelo generalista puede llevar las metricas de solapamiento lexico de un dominio tan especializado como la botanica descriptiva francesa de un BLEU de 10,99 a 44,51 y un BERTScore F1 de 78,58 a 91,80, con un coste de entrenamiento de una sola A100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con adaptador LoRA |
| Parametros totales | 7.000 millones (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama 2-7b) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos del adaptador en safetensors; el base admite las cuantizaciones habituales de Llama 2) |
| Idiomas soportados | frances (fr) |
| Licencia | llama2 (heredada de Meta Llama 2) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base en safetensors |
| Libreria | peft (compatible con transformers) |
| Rango LoRA | 64 |
| Alpha LoRA | 16 |
| Dropout LoRA | 0,1 |
| Modulos adaptados | q, k, v, o, gate, up, down |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 2-7b, un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y atencion multi-cabeza con RoPE. El ajuste se realiza mediante LoRA de rango 64 y alpha 16 con dropout 0,1 sobre las proyecciones de atencion (q, k, v, o) y las de la red feed-forward (gate, up, down), manteniendo congelados los pesos del modelo base. El entrenamiento usa AdamW con gradientes fusionados y gradient checkpointing en una unica NVIDIA A100 (Google Colab); el resto de hiperparametros se detalla en el paper.

Los datos de entrenamiento son el dataset de instrucciones F-LoRA-QA, con 16.962 pares pregunta-respuesta extraidos de 2.913 descripciones de cuatro floras francesas, redactados por un modelo generalista y verificados manualmente. Para evaluacion se reservan 1.697 pares de una flora no vista durante el entrenamiento. La tarea se plantea como generacion condicionada: dado un contexto botanico y una pregunta, el modelo emite el estado del caracter tal como aparece en el texto. No se menciona RLHF ni DPO en la informacion disponible.

## Capacidades

- Generacion de respuestas extractivas en frances sobre descripciones botanicas: devuelve el estado de un caracter (numero de foliolos, textura, dimensiones) tal como figura en el contexto.
- Extraccion de informacion: identifica relaciones personaje-especie dentro de texto descriptivo.
- Respuesta a preguntas de formato corto y factual, condicionada a un contexto proporcionado en el prompt.
- Generacion de texto en frances en el estilo de instruccion del dataset (plantilla con `### Context:`, `### Question:` y `### Response:`).
- Integracion en un pipeline de dos etapas junto al adaptador de generacion de preguntas `nainiayoub/FLoRaQA-Q-Generation-Llama-2-7b-hf`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al frances segun la model card.

## Casos de uso

- Digitalizacion de floras y herbarios: dado el texto de una descripcion botanica y una pregunta sobre un caracter concreto, el modelo devuelve el valor textual para poblar bases de datos estructuradas de biodiversidad.
- Extraccion de caracteres para claves de identificacion: alimentar un sistema de claves dicotomicas con los estados de caracter recuperados automaticamente de descripciones francesas.
- Enriquecimiento de catalogos taxonomicos: procesar lotes de descripciones de cuatro floras y generar pares pregunta-respuesta verificables por revisores humanos.
- Asistencia a botanicos en revision de literatura: responder consultas puntuales sobre un fragmento descriptivo sin necesidad de releerlo completo, con contexto de hasta 4.096 tokens.
- Construccion de datasets de evaluacion: usar el adaptador como generador de respuestas de referencia en dominios botanicos franceses para comparar otros modelos.
- Prototipado de asistentes especializados: desplegar el par de adaptadores (generacion de preguntas y respuesta) como demo o servicio interno sobre Llama 2-7b para consultas de flora francesa.
- Investigacion en NLP de dominio cientifico: servir como linea base reproducible para estudiar metricas mas alla de BLEU en tareas de extraccion de informacion botanica.

## Benchmarks y rendimiento

Evaluacion automatica sobre el conjunto de test F-LoRA-QA (1.697 pares de una flora no vista en entrenamiento), en porcentaje, segun el paper:

| Metrica | Base (Llama 2-7b) | Adaptador FLoRaQA |
|---|---|---|
| BLEU | 10,99 | 44,51 |
| ROUGE-1 F1 | 44,29 | 75,37 |
| ROUGE-L F1 | 40,97 | 72,98 |
| BERTScore F1 | 78,58 | 91,80 |
| Exact match | 2,01 | 23,57 |

No se han publicado en la informacion disponible resultados en benchmarks generales (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en precision completa requiere aproximadamente 14 GB solo para pesos (7.000 millones de parametros a 16 bits), mas memoria para el adaptador y el contexto; en cuantizacion de 8 bits baja a unos 7-8 GB y en 4 bits a unos 4-5 GB (estimaciones estandar para Llama 2-7b, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para entrenamiento y despliegue de alta concurrencia; RTX 4090, RTX 3090 o A10 para inferencia en 16 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion de 4 u 8 bits (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB); en 16 bits completos requiere al menos 16 GB.
- Opciones de despliegue: transformers con peft (metodo documentado por el autor), vLLM y TGI tras fusionar el adaptador con el base, y llama.cpp/Ollama convirtiendo previamente el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros adaptadores o modelos especializados en botanica francesa en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| FLoRaQA-Llama-2-7b-hf | 7.000 M (base) + LoRA | 4.096 | llama2 | QA extractiva botanica en frances |
| FLoRaQA-Q-Generation-Llama-2-7b-hf | 7.000 M (base) + LoRA | 4.096 | llama2 | Generacion de preguntas botanicas en frances (etapa previa) |
| Llama 2-7b base | 7.000 M | 4.096 | llama2 | Generacion de texto generalista |

No disponible: comparacion con modelos de dominio botanico alternativos, con adaptadores sobre Llama 3-8B (mencionados solo en la demo) ni con modelos especializados de otras familias.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre botanica descriptiva en frances; su uso fuera de ese dominio o idioma no esta validado.
- Las respuestas son texto generado, no consultas a una base de datos: deben contrastarse con la descripcion fuente, tal como hicieron los autores con revision experta.
- Riesgo de alucinacion en caracteres no presentes en el contexto o en descripciones atipicas.
- Las metricas de solapamiento lexico (BLEU, ROUGE) subestiman la correccion en este dominio, segun los propios autores (vease *Beyond BLEU*, R2LM 2025).
- El exact match es bajo (23,57 %), lo que indica que la mayoria de respuestas no coinciden literalmente con la referencia; requiere postprocesado o validacion.
- Licencia llama2: el acceso al modelo base esta sujeto a la licencia de Meta y el adaptador la hereda; revisar las condiciones de uso comercial de Llama 2 antes de desplegar.
- El adaptador debe combinarse con `meta-llama/Llama-2-7b-hf`; no es un modelo autonomo.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- No se documentan sesgos especificos mas alla de los inherentes al modelo base y al corpus de floras utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nainiayoub/FLoRaQA-Llama-2-7b-hf
- Adaptador de generacion de preguntas: https://huggingface.co/nainiayoub/FLoRaQA-Q-Generation-Llama-2-7b-hf
- Demo en vivo: https://huggingface.co/spaces/nainiayoub/flora-qa
- Paper en ACL Anthology: https://aclanthology.org/2025.ranlp-1.91/
- PDF del paper: https://aclanthology.org/2025.ranlp-1.91.pdf
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
