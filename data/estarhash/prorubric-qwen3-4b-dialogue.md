# EstarHash/ProRubric-Qwen3-4B-Dialogue

## Resumen

ProRubric-Qwen3-4B-Dialogue es un checkpoint de ajuste fino por refuerzo (RL) sobre el modelo base Qwen/Qwen3-4B, desarrollado por EstarHash en el marco del trabajo de investigacion "Scoring Higher, Answering Worse: Mitigating Reward Hacking in Rubric-Based RL via Protocol-Level Rubrics" (arXiv:2609.38847). El modelo aplica la metodologia ProRubric, que introduce dimensiones de rubrica a nivel de protocolo con clausulas de fallo explicitas, con el objetivo de mitigar el reward hacking que aparece en el RL basado en rubricas. El checkpoint corresponde al dominio Dialogue, con semilla 42 y paso de RL 300.

El modelo cuenta con 4.022.468.096 parametros (aproximadamente 4B) en formato safetensors, con un tamano de repositorio de 8,1 GB, lo que sugiere pesos en precision bf16/fp16. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Esta pensado para investigadores y desarrolladores interesados en tecnicas de alineacion y en la evaluacion de metodos de RL con rubricas frente a problemas de hacking de recompensa.

La relevancia del checkpoint radica en que acompana a una publicacion academica sobre un problema concreto del RL con rubricas: la divergencia entre la puntuacion obtenida en la rubrica y la calidad real de las respuestas. Al ser un modelo de 4B, es viable para experimentacion en hardware consumer, lo que facilita la reproducibilidad de la investigacion. No obstante, la informacion publica disponible es limitada: no se detallan idiomas soportados, composicion del dataset ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B); detalles de atencion no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no confirmadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de aproximadamente 4B parametros. Sobre esa base se aplica un ajuste por refuerzo con la metodologia ProRubric, que emplea dimensiones de rubrica conjuntivas a nivel de protocolo con clausulas de fallo explicitas. El entrenamiento se realizo con PPO/GRPO mediante la libreria `verl` v0.8.0, con semilla 42 y en el paso de RL 300. El dominio de entrenamiento declarado es Dialogue.

La innovacion tecnica central no reside en la arquitectura del modelo, sino en el procedimiento de RL: ProRubric busca evitar que el modelo optimice la puntuacion de la rubrica sin mejorar la calidad real de las respuestas (reward hacking), introduciendo restricciones a nivel de protocolo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO adicional ni detalles sobre la estrategia de atencion o decodificacion.

## Capacidades

- Generacion de texto y dialogo multi-turno, dominio principal del checkpoint.
- Razonamiento y respuesta a instrucciones heredados de Qwen3-4B; el alcance exacto tras el RL no esta documentado.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Alineacion orientada a rubricas: el modelo esta entrenado para responder bajo criterios de evaluacion estructurados, lo que puede ser util en entornos de evaluacion automatizada.

## Casos de uso

- Investigacion en alineacion y reward hacking: el checkpoint sirve como referencia reproducible (semilla 42, paso 300) para comparar la metodologia ProRubric frente a RL con rubricas convencional en tareas de dialogo.
- Evaluacion de sistemas de dialogo: puede emplearse para generar respuestas sujetas a rubricas de protocolo y analizar la correlacion entre puntuacion y calidad real.
- Reproduccion de experimentos academicos: al estar publicado con codigo en GitHub y paper asociado, permite replicar el pipeline de entrenamiento con `verl` v0.8.0.
- Prototipado de asistentes conversacionales: con 4B parametros y licencia Apache 2.0, es adecuado para iterar rapidamente en entornos de desarrollo con GPU consumer.
- Generacion de datos sinteticos para dialogo: puede producir respuestas conversacionales que sirvan como material de entrenamiento o evaluacion en pipelines internos.
- Analisis comparativo de checkpoints RL: al existir variantes por dominio (el nombre indica "Dialogue"), permite estudiar el efecto del dominio de entrenamiento en el comportamiento final.
- Despliegue en entornos con recursos limitados: el tamano de 4B permite inferencia en GPUs de gama alta consumer, aunque no se han publicado cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contexto moderado.
- Cuantizacion a 8 bits: en torno a 4-5 GB de pesos; a 4 bits: en torno a 2,5-3 GB. No se confirman cuantizaciones oficiales publicadas.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100/H100 para mayor contexto y throughput; RTX 3090 (24 GB) tambien viable en bf16.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas en bf16 para contextos cortos, y en tarjetas de 8 GB con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF), transformers con aceleracion. El entrenamiento original uso `verl` v0.8.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ProRubric-Qwen3-4B-Dialogue | 4,02B | No disponible | Apache 2.0 | RL con rubricas de protocolo (dialogo) |
| Qwen/Qwen3-4B | ~4B | No disponible en esta ficha | Apache 2.0 | Modelo base instructivo general |
| Otros checkpoints RL de ~4B | ~4B | Variable | Variable | Alineacion por RL (PPO/GRPO/DPO) |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible, ya que no se han publicado benchmarks del checkpoint. La referencia natural es el modelo base Qwen3-4B, del que hereda arquitectura y licencia, pero no se dispone de datos que cuantifiquen la mejora o el deterioro introducido por el RL.

## Limitaciones y advertencias

- No se dispone de benchmarks publicados que validen la calidad del checkpoint frente al modelo base; el autor no documenta resultados en la model card.
- El checkpoint corresponde a un unico paso de RL (paso 300) con una semilla concreta; puede no representar el mejor punto de la curva de entrenamiento.
- El entrenamiento esta especializado en el dominio Dialogue; su rendimiento en otras tareas (codigo, matematicas, agentes) no esta documentado y podria degradarse respecto al base.
- Riesgo de alucinacion inherente a los modelos de 4B; no se han publicado evaluaciones de factualidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- Idiomas soportados no disponibles; se desconoce si el RL afecta al multilingueismo del base.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de evaluaciones y de documentacion sobre el dataset de entrenamiento limita la confianza para produccion.
- El numero de descargas (39) y likes (0) indica adopcion muy baja; no hay evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/EstarHash/ProRubric-Qwen3-4B-Dialogue
- Paper: https://arxiv.org/abs/2609.38847
- Codigo: https://github.com/Estrellajer/ProRubric
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
