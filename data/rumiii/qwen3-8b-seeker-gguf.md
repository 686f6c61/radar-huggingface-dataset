# Rumiii/Qwen3-8B-Seeker-GGUF

## Resumen

Qwen3-8B-Seeker-GGUF es la distribucion en formato GGUF del modelo Qwen3-8B-Seeker, un ajuste fino de Qwen3-8B (8.190.735.360 parametros) desarrollado por el usuario Rumiii y orientado especificamente a tareas de agente sobre Wikipedia. No es un modelo de proposito general: se trata de un agente basado en etiquetas (tag-based) disenado para resolver tareas de busqueda y recuperacion de informacion en Wikipedia mediante un protocolo propio, no mediante tool calling nativo. Esta publicacion aporta exclusivamente los pesos cuantizados para su uso con llama.cpp y Ollama.

El interes practico de esta ficha reside en la cuantizacion: el repositorio ofrece cuatro variantes GGUF (Q8_0, Q6_K, Q5_K_M y Q4_K_M) generadas con llama.cpp a partir de una imatrix construida con texto de Wikipedia, lo que permite ejecutar un modelo de 8B parametros en hardware de consumo. La variante Q4_K_M ocupa 5,03 GB y la Q8_0 8,71 GB, frente a los 26,3 GB del repositorio completo.

La licencia es Apache 2.0 y el modelo se distribuye bajo los tags gguf, llama.cpp, ollama y agent. No se dispone de informacion sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks en la informacion proporcionada; la model card remite a la ficha del modelo original para el protocolo, el system prompt y los limites del agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8,71 GB), Q6_K (6,73 GB), Q5_K_M (5,85 GB), Q4_K_M (5,03 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. El modelo base es Rumiii/Qwen3-8B-Seeker, un ajuste fino de Qwen3-8B, por lo que hereda la arquitectura transformer de la familia Qwen3, aunque la ficha no confirma detalles como el tipo de atencion, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO.

El proceso de cuantizacion si esta documentado: se genero una imatrix a partir de texto de Wikipedia y se produjeron las variantes GGUF con llama.cpp. La variante Q8_0 se convirtio directamente desde los pesos en fp16 y el resto de cuantizaciones se derivaron a partir de Q8_0, no de los pesos originales. Esta cadena de conversion implica que las variantes de menor precision acumulan el error de la cuantizacion intermedia.

## Capacidades

- Generacion de texto orientada a tareas de agente sobre Wikipedia.
- Resolucion de tareas mediante un protocolo basado en etiquetas (tag-based), no mediante tool calling nativo.
- Ejecucion local con llama.cpp y Ollama, incluyendo servidor compatible con la API de chat (`llama-server`).
- Soporte de plantilla de chat Jinja con control del modo de razonamiento mediante `enable_thinking` (desactivado en el ejemplo de la model card).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Razonamiento multi-paso: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Agente de consulta sobre Wikipedia en local: el modelo esta ajustado para resolver tareas de recuperacion de informacion en Wikipedia mediante su protocolo de etiquetas, por lo que puede desplegarse como agente autonomo sin depender de APIs externas.
- Despliegue en estaciones de trabajo sin GPU dedicada: la variante Q4_K_M (5,03 GB) permite ejecutar el modelo en CPU con llama.cpp u Ollama, adecuado para entornos de desarrollo con recursos limitados.
- Prototipado de pipelines de agentes: al ser un agente basado en etiquetas y no en tool calling nativo, sirve para experimentar con protocolos de interaccion alternativos y evaluar su robustez frente a esquemas de function calling convencionales.
- Inferencia con requisitos de memoria ajustados: las variantes Q5_K_M y Q6_K ofrecen un equilibrio entre calidad y huella de memoria para GPUs de consumo con 8-12 GB de VRAM.
- Servicio de chat local con `llama-server`: el ejemplo de la model card muestra un servidor compatible con la API de chat y plantilla Jinja, util para integrar el modelo en aplicaciones internas sin exposicion a servicios en la nube.
- Evaluacion comparativa de cuantizaciones: disponer de cuatro niveles (Q8_0 a Q4_K_M) derivados de una misma cadena permite medir la degradacion de calidad del agente segun la precision, con la imatrix de Wikipedia como referencia del dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de fichero y overhead de contexto):
  - Q8_0: en torno a 9-10 GB.
  - Q6_K: en torno a 7-8 GB.
  - Q5_K_M: en torno a 6-7 GB.
  - Q4_K_M: en torno a 5,5-6,5 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) permite ejecutar cualquier variante con contexto amplio; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) cubren las variantes Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: si, al menos las variantes Q4_K_M y Q5_K_M en GPUs con 8 GB o mas; Q8_0 requiere 10 GB o mas.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/Rumiii/Qwen3-8B-Seeker-GGUF:Q4_K_M`). Compatible con endpoints segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-8B-Seeker-GGUF (este) | 8,19 B | no disponible | GGUF | Apache 2.0 | Agente Wikipedia basado en etiquetas |
| Rumiii/Qwen3-8B-Seeker | 8,19 B | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar |
| Qwen3-8B (base de la familia) | ~8 B | no disponible en esta ficha | safetensors, GGUF | no disponible en esta ficha | Proposito general |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo de proposito especifico: es un agente tag-based para Wikipedia, no un asistente general ni un modelo con tool calling nativo; su uso fuera de ese dominio puede degradar la calidad de forma significativa.
- La model card remite al modelo original para el protocolo, el system prompt y los limites; ignorar esas especificaciones puede romper el comportamiento del agente.
- Las cuantizaciones distintas de Q8_0 se derivan de Q8_0, no de los pesos fp16, por lo que pueden acumular error adicional.
- No hay informacion sobre sesgos, riesgo de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado en castellano sin evaluacion previa.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos sin verificacion empirica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- Repositorio con 123 descargas y 0 likes: ecosistema de validacion muy limitado, sin evidencia de uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Rumiii/Qwen3-8B-Seeker-GGUF
- Modelo base: https://huggingface.co/Rumiii/Qwen3-8B-Seeker
- Ejecucion con Ollama: `ollama run hf.co/Rumiii/Qwen3-8B-Seeker-GGUF:Q4_K_M`
- Ejecucion con llama.cpp: `llama-server -hf Rumiii/Qwen3-8B-Seeker-GGUF:Q4_K_M --jinja --chat-template-kwargs '{"enable_thinking":false}'`
