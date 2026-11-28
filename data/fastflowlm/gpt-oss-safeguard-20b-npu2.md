# FastFlowLM/GPT-OSS-Safeguard-20b-NPU2

## Resumen

GPT-OSS-Safeguard-20b-NPU2 es una adaptacion del modelo de razonamiento de seguridad `openai/gpt-oss-safeguard-20b` publicada por FastFlowLM, orientada a su ejecucion sobre NPU (unidades de procesamiento neuronal) en lugar de GPU convencionales. El modelo base, desarrollado por OpenAI, es un modelo de razonamiento de seguridad construido sobre la familia gpt-oss: recibe una politica de seguridad escrita por el usuario y clasifica contenido de texto segun esa politica, ademas de realizar tareas fundamentales de moderacion.

El modelo base emplea una arquitectura Mixture-of-Experts con 21.000 millones de parametros totales y 3.600 millones de parametros activos, lo que permite que quepa en GPUs con 16 GB de VRAM. Esta variante de FastFlowLM mantiene esos pesos en formato mxfp4 y anade compatibilidad con endpoints, apuntando a despliegues en hardware con NPU.

Su relevancia actual radica en dos factores: la licencia Apache 2.0, que permite uso comercial sin restricciones de copyleft, y el enfoque "bring your own policy", que permite adaptar el modelo a las politicas concretas de cada producto o plataforma sin reentrenamiento. Esta variante concreta anade la posibilidad de ejecutarlo en NPUs, un nicho en crecimiento para inferencia en dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en transformer, derivada de gpt-oss |
| Parametros totales | 21.000 millones (21B) |
| Parametros activos | 3.600 millones (3,6B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mxfp4 (formato de los pesos publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 28,9 GB), etiquetado mxfp4 |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts: 21B parametros totales con 3,6B activos por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representacion propia de un modelo de mayor tamano. Esta pensado para caber en GPUs de 16 GB de VRAM. Los pesos de esta variante se distribuyen en formato mxfp4, una cuantizacion de 4 bits en punto flotante con escala compartida por bloques, habitual en despliegues de bajo consumo.

El entrenamiento del modelo base parte de gpt-oss y se afina especificamente para razonamiento de seguridad: clasificacion de contenido conforme a politicas proporcionadas por el usuario, etiquetado de contenido en linea y fuera de linea, y filtrado de entradas y salidas de LLM. El modelo fue entrenado con el formato de respuesta harmony de OpenAI y, segun la model card, solo funciona correctamente con ese formato. Incluye un modo de razonamiento configurable (low, medium, high) que permite ajustar el esfuerzo de razonamiento segun la latencia requerida. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset en la informacion proporcionada.

## Capacidades

- Razonamiento de seguridad: clasifica texto segun una politica escrita por el usuario, con generalizacion entre productos y casos de uso.
- Decisiones razonadas: expone la cadena de razonamiento completa (raw CoT) para depuracion y auditoria de las decisiones de politica.
- Esfuerzo de razonamiento configurable: niveles low, medium y high para equilibrar precision y latencia.
- Filtrado de entrada y salida de LLM: adecuado para moderar prompts y respuestas en pipelines de produccion.
- Etiquetado de contenido en linea y fuera de linea para equipos de Trust and Safety.
- Formato harmony: obligatorio para el funcionamiento correcto del modelo.
- Compatibilidad con endpoints: la variante de FastFlowLM esta etiquetada como `endpoints_compatible`.
- Ejecucion en NPU: adaptacion especifica de FastFlowLM para hardware con unidad de procesamiento neuronal.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Tool calling y uso como agente: no disponible en la informacion proporcionada.

## Casos de uso

- Moderacion de entradas en un chatbot: el modelo recibe la politica de contenido de la plataforma y clasifica cada prompt del usuario antes de pasarlo al modelo principal, bloqueando o marcando los casos que violan la politica.
- Filtrado de salidas de un LLM generativo: se situa como segunda capa tras el modelo de generacion para detectar respuestas que incumplen las normas de la plataforma, aprovechando el acceso a la cadena de razonamiento para auditar cada decision.
- Etiquetado offline de grandes volumenes de contenido: procesa lotes de textos con la politica de la organizacion y genera etiquetas de seguridad con justificacion, util para equipos de Trust and Safety que revisan historicos.
- Adaptacion a politicas sectoriales: al interpretar una politica escrita, se puede reutilizar el mismo modelo para normativas distintas (contenido medico, financiero, menores) sin reentrenar, solo cambiando el documento de politica.
- Despliegue en dispositivo con NPU: gracias a la variante de FastFlowLM, se puede ejecutar la moderacion en hardware con NPU, reduciendo la dependencia de GPU y el coste de infraestructura en entornos de borde.
- Auditoria y depuracion de decisiones: el acceso a la cadena de razonamiento permite a los equipos de seguridad revisar por que el modelo clasifico un contenido de una forma concreta y ajustar la politica en consecuencia.
- Investigacion en seguridad de IA: el modelo sirve como base para experimentos de clasificacion de contenido y evaluacion de politicas con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base cabe en GPUs con 16 GB de VRAM segun la model card de OpenAI; esta variante en mxfp4 esta pensada para reducir aun mas el requisito, aunque no se especifica una cifra concreta para la version NPU.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU de consumo: si, segun la model card del modelo base (16 GB de VRAM); no se detalla la lista de tarjetas concretas.
- NPU: esta variante esta adaptada por FastFlowLM para ejecucion en NPU, que es su proposito principal.
- Opciones de despliegue: transformers (libreria declarada), vLLM (etiqueta), endpoints compatibles; no se detallan otras opciones como llama.cpp u Ollama.
- Latencia y throughput: no disponible; el modelo base permite ajustar el esfuerzo de razonamiento (low, medium, high) para modular la latencia.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GPT-OSS-Safeguard-20b-NPU2 (FastFlowLM) | 21B / 3,6B | no disponible | Apache 2.0 | Razonamiento de seguridad en NPU |
| openai/gpt-oss-safeguard-20b | 21B / 3,6B | no disponible | Apache 2.0 | Razonamiento de seguridad en GPU |
| openai/gpt-oss-safeguard-120b | 117B / 5,1B | no disponible | Apache 2.0 | Razonamiento de seguridad, mayor escala |
| openai/gpt-oss-20b | 21B / 3,6B | no disponible | Apache 2.0 | Proposito general |

## Limitaciones y advertencias

- Modelo especializado en seguridad: OpenAI recomienda usar los modelos gpt-oss generales para aplicaciones que no sean de seguridad.
- Dependencia del formato harmony: segun la model card, el modelo no funciona correctamente si no se usa el formato de respuesta harmony.
- Cadena de razonamiento no apta para usuarios finales: el raw CoT esta pensado para desarrolladores y profesionales de seguridad, no para exposicion directa a usuarios generales.
- Riesgo de alucinacion: no se documenta en la informacion disponible, pero es un riesgo inherente a los modelos generativos; las decisiones deben auditarse en produccion.
- Idiomas soportados: no disponible, lo que impide garantizar cobertura multilingue.
- Contexto maximo: no disponible en la informacion proporcionada.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Apache 2.0: permisiva y apta para uso comercial, sin restricciones de copyleft ni riesgo de patentes segun la model card.
- Variante de terceros: esta version la publica FastFlowLM, no OpenAI; conviene validar la integridad de los pesos y el soporte de la NPU antes de usarla en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FastFlowLM/GPT-OSS-Safeguard-20b-NPU2
- Modelo base: https://huggingface.co/openai/gpt-oss-safeguard-20b
- Modelo mayor: https://huggingface.co/openai/gpt-oss-safeguard-120b
- Coleccion en Hugging Face: https://huggingface.co/collections/openai/gpt-oss-safeguard
- Demo: https://huggingface.co/spaces/openai/gpt-oss-safeguard-20b
- Guia de prompting: https://cookbook.openai.com/articles/gpt-oss-safeguard-guide
- Paper / model card: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss-safeguard/
- Formato harmony: https://github.com/openai/harmony
- Cookbooks gpt-oss: https://cookbook.openai.com/topic/gpt-oss
- Comunidad ROOST: http://roost.tools/
- Repositorio ROOST: https://github.com/roostorg/open-models
