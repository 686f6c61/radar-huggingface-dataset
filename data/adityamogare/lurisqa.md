# AdityaMogare/LurisQA

## Resumen

LurisQA es un ajuste fino del modelo meta-llama/Meta-Llama-3-8B-Instruct orientado a la respuesta de preguntas sobre derecho civil en ingles. Lo desarrollan Aditya Mogare y Enfysyz, y se distribuye principalmente como un archivo GGUF cuantizado a 4 bits (Q4_K_M, aproximadamente 4,9 GB) pensado para ejecutarse en hardware de consumo mediante Ollama. El modelo parte de una arquitectura transformer decoder-only de 8.030.261.248 parametros y hereda la ventana de contexto de Llama 3 (8.192 tokens, aunque este dato no se explicita en la model card).

El problema que aborda es la accesibilidad de informacion juridica: el ajuste se entrena con publicaciones y comentarios del subreddit r/legaladvice para que el modelo entienda como formula preguntas legales una persona no experta y responda con un tono profesional y terminologia juridica. No es un modelo de razonamiento juridico de proposito general ni un sustituto de asesoramiento legal; su utilidad esta en la explicacion de conceptos, el resumen de casos y la orientacion educativa.

Su relevancia actual es limitada pero concreta: ofrece una via sencilla de desplegar un asistente legal conversacional en local, con licencia MIT sobre el ajuste (sujeta ademas a la licencia de Meta Llama 3 del modelo base), sin depender de APIs externas. El repositorio tiene un volumen de descargas muy bajo (9 descargas y 1 like en el momento de la consulta), lo que conviene tener en cuenta al evaluar su madurez.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal language model), basada en Llama 3 8B Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada del modelo base Llama 3 8B Instruct) |
| Tipos de cuantizacion | 4 bits GGUF Q4_K_M (aproximadamente 4,9 GB); el repositorio incluye pesos en formato transformers ademas del GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT para el ajuste; el uso del modelo base queda sujeto tambien a la licencia Meta Llama 3 |
| Formato de pesos | GGUF (unsloth_Q4_K_M.gguf) y safetensors (pesos transformers) |

## Arquitectura y entrenamiento

LurisQA es un ajuste fino supervisado del modelo Meta Llama 3 8B Instruct, un transformer decoder-only con atencion causal estandar. No se introducen cambios arquitectonicos propios: el modelo conserva la tokenizacion, el chat template de Llama 3 (cabeceras `<|start_header_id|>`, `<|end_header_id|>` y `<|eot_id|>`) y el comportamiento conversacional del modelo base. La cuantizacion a 4 bits se realiza en formato GGUF Q4_K_M, lo que reduce el peso a unos 4,9 GB y permite inferencia en CPU y en GPUs de consumo.

El entrenamiento se basa en un dataset curado construido a partir de publicaciones y comentarios del subreddit r/legaladvice, limpiado y formateado como instrucciones conversacionales. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales sobre el ajuste supervisado. Tampoco se documentan hiperparametros, epocas ni la plataforma de entrenamiento (el nombre del archivo GGUF, `unsloth_Q4_K_M.gguf`, sugiere el uso de Unsloth para el ajuste y la cuantizacion, aunque esto no se confirma explicitamente en la documentacion).

## Capacidades

- Generacion de texto conversacional en ingles con tono profesional y terminologia juridica.
- Explicacion de conceptos legales de derecho civil: contratos, responsabilidad civil extracontractual (torts), derecho de propiedad y derecho de familia, entre otros.
- Resumen de casos y de como se aplico la ley en ellos, a nivel introductorio.
- Comprension de preguntas formuladas en lenguaje natural por no expertos, gracias al entrenamiento con datos de foro.
- Soporte de conversaciones multi-turno mediante el chat template de Llama 3.
- Capacidad de seguir instrucciones de sistema (por ejemplo, el prompt de sistema incluido en el Modelfile que define el rol de experto legal).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explicito, vision ni audio.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Orientacion legal educativa para particulares: el modelo responde en lenguaje llano a preguntas del estilo de las que se plantean en foros, explicando derechos y principios aplicables, lo que encaja con el dataset de entrenamiento.
- Explicacion de jerga juridica: util como capa de divulgacion que traduce terminos tecnicos de contratos o demandas a un lenguaje comprensible para no juristas.
- Resumen de casos y doctrina basica: genera sintesis de alto nivel de sentencias o conceptos, adecuado para material de estudio introductorio.
- Asistente de primera linea en portales de divulgacion juridica: puede gestionar conversaciones multi-turno con el chat template de Llama 3, siempre con derivacion a un abogado cualificado.
- Prototipado y experimentacion local: al distribuirse como GGUF Q4_K_M de aproximadamente 4,9 GB, permite montar un prototipo de asistente legal en un portatil con Ollama sin infraestructura GPU dedicada.
- Generacion de borradores de preguntas frecuentes legales: el equipo editorial de un bufete o web de divulgacion puede usar el modelo para redactar borradores de FAQ sobre contratos, familia o propiedad que luego revisa un profesional.
- Formacion interna: como herramienta de apoyo en cursos de introduccion al derecho civil para generar ejemplos y explicaciones, con supervision docente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5-6 GB para el GGUF Q4_K_M (4,9 GB de pesos mas overhead de contexto y cache KV). Los pesos en safetensors requieren del orden de 16 GB en FP16.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para el GGUF cuantizado (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090); para los pesos sin cuantizar, A100, H100 o GPUs de 24 GB como la RTX 3090/4090 en FP16 con margen ajustado.
- Cabe en GPU de consumo: si, en el formato GGUF Q4_K_M; tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: Ollama (documentado en la model card con Modelfile incluido), llama.cpp para GGUF, y transformers/vLLM/TGI para los pesos safetensors. La model card solo detalla el flujo con Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LurisQA | 8.030.261.248 | no disponible (heredado de Llama 3 8B) | Ajuste legal civil en ingles, GGUF para Ollama | MIT (ajuste) + Meta Llama 3 (base) | Hugging Face, GitHub |
| Meta Llama 3 8B Instruct | 8.030.261.248 | 8.192 tokens (modelo base) | Instrucciones generales | Meta Llama 3 | Hugging Face |
| Alternativas legales especializadas de 7-8B | no disponible | no disponible | Ajustes legales similares | variable | no disponible |

No se dispone de datos de benchmarks ni de comparativas de rendimiento publicadas para LurisQA, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No es un abogado: las respuestas no constituyen asesoramiento legal y no sustituyen a un profesional cualificado; la propia model card lo advierte de forma explicita.
- Riesgo de inexactitud: el dataset de entrenamiento proviene de un foro publico que puede contener errores, por lo que las salidas pueden ser incorrectas, incompletas o estar desactualizadas.
- Sesgos: al entrenarse con r/legaladvice, el modelo hereda los sesgos de esa comunidad, mayoritariamente angloparlante y con sesgo hacia el derecho estadounidense; las diferencias jurisdiccionales pueden no reflejarse.
- Cobertura idiomatica: solo ingles; no se documenta soporte de castellano ni de otras lenguas.
- Conocimiento temporal: el modelo no conoce desarrollos legales posteriores a los datos de entrenamiento del modelo base.
- Licencia: el ajuste es MIT, pero el uso comercial esta condicionado tambien por la licencia Meta Llama 3 del modelo base, que impone restricciones adicionales (por ejemplo, umbral de usuarios mensuales y obligaciones de atribucion).
- Madurez: repositorio con muy pocas descargas y validacion externa limitada; no hay benchmarks publicados que respalden su calidad frente a alternativas.
- Contexto: la longitud de contexto efectiva no se documenta en la model card y conviene verificarla antes de desplegar conversaciones largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdityaMogare/LurisQA
- Repositorio GitHub: https://github.com/AdityaMogare/LurisQA
- Perfil del autor en Hugging Face: https://huggingface.co/AdityaMogare
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Video de demostracion: https://huggingface.co/AdityaMogare/LurisQA/resolve/main/LurisQA.mp4
- Archivo GGUF: https://huggingface.co/AdityaMogare/LurisQA (pestana Files and versions, archivo unsloth_Q4_K_M.gguf)
