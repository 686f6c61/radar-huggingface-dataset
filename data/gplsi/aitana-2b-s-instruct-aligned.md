# gplsi/Aitana-2B-S-Instruct-Aligned

## Resumen

Aitana-2B-S-Instruct-Aligned es un modelo de lenguaje generativo de tipo decoder-only, con aproximadamente 2.253 millones de parametros, desarrollado por el GPLSI (Language and Information Systems Group) de la Universidad de Alicante. Se construye sobre el modelo instruido gplsi/Aitana-2B-S-Instruct y anade una etapa de alineamiento mediante Direct Preference Optimization (DPO) para mejorar la calidad y la adecuacion de las respuestas a las preferencias humanas.

El modelo esta especializado en tres idiomas: valenciano, castellano e ingles, con un enfasis particular en el valenciano que lo diferencia de la mayoria de modelos multilingues genericos. Esta orientacion lo hace relevante para aplicaciones en la Comunidad Valenciana y para la preservacion y el uso digital de esta lengua en contextos administrativos, turisticos y educativos.

La relevancia actual del modelo radica en su tamano compacto (2,25B parametros), que permite su despliegue en hardware de gama media, combinado con una licencia Apache 2.0 que facilita su uso comercial. La publicacion de la configuracion de alineamiento DPO y de la composicion del dataset de preferencias anade transparencia al proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parametros totales | 2.253.490.176 (~2,25B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuracion de entrenamiento DPO usa 4096 tokens de longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar via transformers/bitsandbytes) |
| Idiomas soportados | valenciano (ca), castellano (es), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con aproximadamente 2,25B parametros. Parte del modelo instruido gplsi/Aitana-2B-S-Instruct, que fue entrenado sobre el dataset ALIA Instruction/v12. Sobre esta base se aplica una etapa de alineamiento mediante DPO con los siguientes hiperparametros: learning rate de 5e-6, 1 epoch, beta de 0,1 y scheduler lineal. La configuracion adicional reportada en el manuscrito (pendiente de verificacion segun la propia model card) indica optimizador AdamW con beta1/beta2 de 0,9/0,999, weight decay 0, batch por dispositivo de 2, acumulacion de gradientes de 16 pasos, 4 GPUs, batch global efectivo de 128, precision bfloat16 y longitud maxima de secuencia de 4096 tokens.

El dataset de alineamiento Alignment/v8 contiene 146.180 muestras de preferencia: 80.308 en ingles, 30.072 en castellano y 35.800 en valenciano. Se compone de HelpSteer3 (en/es), OpenAssistant OASST1 y OASST2 (en/es/ru y mas idiomas), OpenOrca (en) y un conjunto adicional de OASST2 en valenciano. La innovacion principal es la incorporacion de datos de preferencia en valenciano, un recurso poco habitual en modelos de este tamano, que permite alinear el comportamiento del modelo en esa lengua mas alla del simple ajuste instruccional.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en valenciano, castellano e ingles.
- Conversacion multi-turno con respuestas alineadas a preferencias humanas gracias al entrenamiento DPO.
- Generacion de contenido en contextos administrativos, legales y turisticos, segun los usos previstos declarados por el autor.
- Capacidades multilingues limitadas a los tres idiomas declarados; no se documenta soporte para otras lenguas.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte explicito de agentes, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades de vision, audio ni otras modalidades.
- No se documenta una longitud de contexto oficial mas alla de los 4096 tokens usados durante el entrenamiento DPO.

## Casos de uso

- Atencion al cliente en valenciano: el modelo puede gestionar conversaciones multi-turno en valenciano con respuestas alineadas a preferencias humanas, adecuado para administraciones publicas y empresas de la Comunidad Valenciana que necesiten atender en esta lengua.
- Asistencia administrativa: generacion y resumen de textos en castellano y valenciano para tramites, formularios y comunicaciones oficiales, aprovechando el alineamiento DPO para producir respuestas claras y bien estructuradas.
- Turismo multilingue: generacion de descripciones, respuestas a preguntas frecuentes y materiales promocionales en valenciano, castellano e ingles para el sector turistico valenciano.
- Chatbot educativo: asistencia a estudiantes en las tres lenguas con respuestas instructivas, util en entornos escolares y universitarios de la Comunidad Valenciana.
- Generacion de contenido editorial: redaccion y reescritura de textos en valenciano con un modelo de licencia permisiva, para medios locales y proyectos de preservacion linguistica.
- Prototipado rapido de aplicaciones conversacionales: su tamano de 2,25B permite desplegarlo en una unica GPU de gama media para iterar rapidamente en el desarrollo de asistentes conversacionales.
- Investigacion en alineamiento multilingue: el modelo y su configuracion DPO documentada sirven como caso de estudio para experimentos de alineamiento en lenguas de recursos limitados como el valenciano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-10 GB para secuencias moderadas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2,3-3 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 1,2-1,5 GB para pesos.
- GPU recomendadas: NVIDIA RTX 4090, RTX 3090, A100 o H100 para despliegue en bfloat16 con throughput alto; GPUs de 8 GB como RTX 3070 o RTX 4060 Ti pueden alojar el modelo en cuantizacion de 8 o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion, y en tarjetas con 12-16 GB en bfloat16.
- Opciones de despliegue: transformers (pipeline de text-generation), text-generation-inference (TGI, etiquetado en el repo), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no se documenta un GGUF oficial en la informacion disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aitana-2B-S-Instruct-Aligned | ~2,25B | no disponible (entrenamiento DPO a 4096 tokens) | ca, es, en | Apache 2.0 | Hugging Face (gplsi) |
| gplsi/Aitana-2B-S-Instruct | ~2,25B (misma base) | no disponible | ca, es, en | no disponible en la informacion | Hugging Face (gplsi) |
| Modelos multilingues de ~2-3B de proposito general | ~2-3B | variable | decenas de idiomas | variable | Hugging Face |

La comparativa con alternativas de proposito general no puede completarse con datos concretos de rendimiento porque no se han publicado benchmarks en la informacion disponible. La diferencia principal frente a modelos genericos del mismo tamano es la presencia de datos de alineamiento en valenciano y la licencia Apache 2.0.

## Limitaciones y advertencias

- El modelo no esta disenado como base de conocimiento factual; puede generar afirmaciones incorrectas o alucinaciones, especialmente en dominios especializados.
- El alineamiento DPO se realizo con 1 epoch y un dataset de 146.180 muestras, lo que puede limitar la robustez del alineamiento en dominios muy especificos.
- La cobertura linguistica se limita a valenciano, castellano e ingles; el rendimiento en otras lenguas no esta garantizado.
- No se documenta la longitud de contexto oficial del modelo; el entrenamiento DPO uso 4096 tokens, por lo que secuencias mas largas pueden degradar la calidad.
- Existe riesgo de sesgos heredados de los datasets de preferencia (HelpSteer3, OASST1/2, OpenOrca) y de la distribucion desequilibrada entre idiomas (80.308 muestras en ingles frente a 30.072 en castellano y 35.800 en valenciano).
- La configuracion de entrenamiento adicional marcada como "pendiente de verificacion" en la model card no debe tomarse como confirmada.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de los datasets de entrenamiento subyacentes.
- El numero de descargas (17) y de likes (0) en el momento de la consulta indica una adopcion muy limitada, por lo que la comunidad y el soporte son reducidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gplsi/Aitana-2B-S-Instruct-Aligned
- Modelo base: https://huggingface.co/gplsi/Aitana-2B-S-Instruct
- GPLSI (Universidad de Alicante): https://gplsi.dlsi.ua.es/
- Dataset HelpSteer3: https://huggingface.co/datasets/nvidia/HelpSteer3
- Dataset OASST1: https://huggingface.co/datasets/OpenAssistant/oasst1
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset OpenOrca: https://huggingface.co/datasets/Open-Orca/OpenOrca
