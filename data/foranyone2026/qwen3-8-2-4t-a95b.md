# foranyone2026/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es un modelo de lenguaje causal de la familia Qwen3.8, publicado en HuggingFace por el usuario foranyone2026. Según la model card, se trata de la primera liberación abierta de un modelo de clase Qwen-Max, construido sobre la base arquitectónica de la serie Qwen3.5. El modelo está diseñado para tareas de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte, con un énfasis especial en la ejecución autónoma de tareas complejas de múltiples pasos.

Arquitectónicamente es un modelo híbrido que combina Gated DeltaNet (atención lineal) y Gated Attention (atención estándar) intercalados con capas de Mixture of Experts. Tiene 2,4 billones de parámetros totales y 95 mil millones activados por token, con una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000. El repositorio contiene los pesos en formato safetensors, compatibles con vLLM, SGLang y TokenSpeed. Cabe destacar que la versión oficial con más funcionalidades (visión, herramientas integradas, contexto 1M) es Qwen3.8-Max, que se ofrece a través de Qwen Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model hibrido (Gated DeltaNet + Gated Attention) con Mixture of Experts |
| Parametros totales | 2.446.182.725.504 (≈2,4 billones) |
| Parametros activos | 95 mil millones (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max (licencia personalizada, no estandar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura hibrida de capas alternadas. El layout se compone de 23 bloques, cada uno formado por 3 subbloques de (Gated DeltaNet → MoE) seguidos de 1 subbloque de (Gated Attention → MoE). Gated DeltaNet usa 128 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128. Gated Attention usa 64 cabezas para Q y 4 para KV, con dimension de cabeza 256 y RoPE de 64 dimensiones. La capa Mixture of Experts contiene 512 expertos en total, de los cuales 10 se activan por token junto con 1 experto compartido, con dimension intermedia de 2048.

El modelo fue entrenado en dos etapas: pre-training y post-training. Incluye Multi-Token Prediction (MTP) entrenado con multiples pasos, lo que permite predecir varios tokens futuros simultaneamente. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se detallan los idiomas de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento complejo, con mejoras en codificacion, trabajo profesional, investigacion y tareas agénticas de largo horizonte.
- Planificacion autonoma y manejo de feedback del entorno, orientado a la ejecucion fiable de tareas de multiples pasos.
- Control flexible del razonamiento mediante los parametros `reasoning_effort` y `preserve_thinking`, que permiten ajustar la profundidad de razonamiento y conservar el contexto de razonamiento de mensajes historicos.
- Compatibilidad con herramientas de despliegue populares: vLLM, SGLang y TokenSpeed, segun la model card.
- Longitud de contexto amplia (262.144 tokens nativos, hasta 1.010.000 con extension), util para procesar documentos extensos o repositorios de codigo completos.
- La version oficial Qwen3.8-Max, basada en este modelo, anade capacidades adicionales como vision input, soporte de no-thinking y herramientas integradas. Estas funciones no estan confirmadas para los pesos abiertos de este repositorio.

## Casos de uso

- Asistentes de codificacion en entornos de desarrollo: el modelo puede analizar y generar codigo dentro de repositorios grandes gracias a su contexto de 262.144 tokens, permitiendo mantener el estado de multiples archivos en una sola sesion.
- Agentes autonomos de largo horizonte: gracias a su capacidad de planificacion y manejo de feedback del entorno, puede ejecutar tareas complejas de multiples pasos, como automatizar flujos de trabajo de CI/CD o gestionar incidencias en sistemas.
- Investigacion y analisis tecnico: el modelo puede procesar documentos cientificos o tecnicos extensos, extraer conclusiones y razonar sobre ellos, aprovechando su ventana de contexto amplia.
- Automatizacion de procesos empresariales: puede seguir instrucciones detalladas y completar tareas profesionales que requieren razonamiento secuencial, como la generacion de informes o el analisis de datos.
- Analisis de logs y diagnostico de sistemas: su contexto largo permite analizar registros de eventos extensos y correlacionar informacion para identificar patrones o anomalias.
- Soporte de razonamiento matematico y cientifico: la model card menciona mejoras en investigacion, lo que sugiere utilidad en problemas que requieren razonamiento formal y multiple pasos.
- Integracion en pipelines de generacion de codigo en produccion: compatible con vLLM y SGLang, puede desplegarse como servicio de inferencia para herramientas de desarrollo asistido por IA.

## Benchmarks y rendimiento

La tabla de benchmarks incluida en la model card esta truncada en la informacion disponible. Solo se han podido extraer los siguientes resultados para la categoria "Coding Agent":

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84.6 | 84.6 | 88.8 | 74.5 | 86.6 |
| SWE-bench Pro | 69.2 | 80.0 | 64.6 | 60.6 | no disponible |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. No se dispone de datos para el modelo Qwen3.8-2.4T-A95B en particular, ya que la tabla solo muestra resultados de Qwen3.8-Max, la version oficial. No se deben extrapolar estos resultados a los pesos abiertos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,4 billones de parametros, la carga en FP16 requeriria aproximadamente 4,8 TB de memoria. En cuantizacion de 8 bits, unos 2,4 TB; en 4 bits, unos 1,2 TB. Estas son estimaciones teoricas, no especificaciones oficiales.
- GPU recomendadas: no se dispone de requisitos oficiales. Dado el tamaño, se necesitarian clusters de multiples GPUs de alta capacidad, como A100 o H100, con interconexion de alta velocidad.
- Cabe en consumer GPU: no. Ninguna GPU de consumo actual puede albergar este modelo, incluso con cuantizacion extrema.
- Opciones de despliegue: segun la model card, los pesos son compatibles con vLLM, SGLang y TokenSpeed. Tambien se menciona la API oficial de Qwen Cloud para la version Qwen3.8-Max.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card compara Qwen3.8-Max con otros modelos de la competencia, pero no proporciona especificaciones completas para Qwen3.8-2.4T-A95B. La comparacion mas directa es con Qwen3.7-Max y con la version oficial Qwen3.8-Max. Se presenta una tabla limitada con los datos de benchmarks disponibles:

| Modelo | Parametros totales | Parametros activos | Contexto nativo | Terminal Bench 2.1 | SWE-bench Pro |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4 billones | 95 mil millones | 262.144 | no disponible | no disponible |
| Qwen3.8-Max | no disponible | no disponible | 1.000.000 | 86.6 | no disponible |
| Qwen3.7-Max | no disponible | no disponible | no disponible | 74.5 | 60.6 |

No se dispone de mas datos comparativos. La licencia del modelo es personalizada (qwen3.8-max), lo que puede limitar su uso comercial en comparacion con licencias abiertas estandar.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y el autor es "foranyone2026", no el equipo oficial de Qwen. Esto sugiere que podria tratarse de una publicacion no verificada o no oficial, y se recomienda precaucion antes de usarlo en produccion.
- La licencia "qwen3.8-max" no es una licencia estandar. No se ha podido acceder al archivo LICENSE, por lo que se desconocen las restricciones exactas para uso comercial, redistribucion o modificacion.
- No se han publicado resultados de benchmarks para los pesos abiertos de este repositorio. Los datos de la model card corresponden a Qwen3.8-Max, la version oficial, y no son directamente extrapolables.
- No se especifican sesgos conocidos ni se han realizado evaluaciones de seguridad en la informacion disponible.
- El riesgo de alucinacion es inherente a los modelos de lenguaje de este tipo, pero no se dispone de datos especificos para este modelo.
- La extension de contexto hasta 1.010.000 tokens puede degradar el rendimiento o la precision en comparacion con el contexto nativo de 262.144 tokens, aunque no se aportan datos al respecto.
- Las capacidades de vision y herramientas integradas solo estan confirmadas para la version Qwen3.8-Max, no para los pesos de este repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/foranyone2026/Qwen3.8-2.4T-A95B
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen3.8
- Qwen Cloud: https://www.qwencloud.com
- Qwen Studio: https://chat.qwen.ai/?models=qwen3.8-max
- Articulo sobre la linea de modelos Qwen 3.8: https://codersera.com/blog/qwen-3-8-model-lineup-2026/
