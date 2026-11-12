# mradermacher/Spark-X2.6-4B-heretic-tool-GGUF

## Resumen

Spark-X2.6-4B-heretic-tool-GGUF es la versión cuantizada en formato GGUF del modelo NeosQ/Spark-X2.6-4B-heretic-tool, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) derivado de la familia Spark2.5, especializado en tool calling y function calling, y sometido a un proceso de "abliteration" (eliminación de rechazos o censura) que el autor etiqueta como heretic, decensored y uncensored. La licencia es Apache 2.0 y los idiomas declarados son inglés y chino.

El modelo base fue ajustado utilizando los datasets mlabonne/harmful_behaviors, mlabonne/harmless_alpaca y gorilla-llm/Berkeley-Function-Calling-Leaderboard, lo que sugiere un entrenamiento orientado tanto a la eliminación de comportamientos de rechazo como a la mejora de las capacidades de invocación de funciones. La versión GGUF permite su despliegue en entornos con llama.cpp, Ollama y otras herramientas compatibles, con cuantizaciones que van desde Q2_K (1,9 GB) hasta f16 (8,3 GB).

La relevancia de esta ficha radica en que combina tres características poco habituales en un modelo de 4B: capacidades de tool calling, un proceso de abliteration que elimina las negativas de seguridad, y un formato GGUF listo para inferencia local en hardware de consumo. No obstante, el repositorio no incluye información sobre arquitectura detallada, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta custom_code y spark2_5; no se detalla en la informacion proporcionada) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base en safetensors |
| Tamano del repo | 37,5 GB |
| Modelo base | NeosQ/Spark-X2.6-4B-heretic-tool |
| Fecha de creacion | 2026-11-12 |
| Fecha de actualizacion | 2026-11-12 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Las etiquetas del repositorio incluyen custom_code y spark2_5, lo que indica que el modelo base pertenece a la familia Spark2.5 y que requiere codigo personalizado para su carga con transformers. El numero de parametros (4,1 mil millones) y el tamano del repositorio (37,5 GB) son los unicos datos estructurales disponibles.

Respecto al entrenamiento, la model card del modelo base lista tres datasets: mlabonne/harmful_behaviors y mlabonne/harmless_alpaca, empleados habitualmente en procesos de abliteration para eliminar la direccion de rechazo en el espacio de activaciones, y gorilla-llm/Berkeley-Function-Calling-Leaderboard, orientado al ajuste fino en invocacion de funciones. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion fue realizada por mradermacher con quantize_version 2 y output_tensor_quantised 1, generando cuantizaciones estaticas (no ponderadas ni imatrix) para todos los tipos listados.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Tool calling y function calling, segun las etiquetas del repositorio y el dataset Berkeley-Function-Calling-Leaderboard empleado en el ajuste.
- Comportamiento "decensored" o "uncensored": el proceso de abliteration elimina las respuestas de rechazo del modelo base, lo que permite generar contenido que el modelo original rechazaria.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su integracion en servicios de inferencia.
- No se documentan capacidades de vision, audio, razonamiento multi-paso explicito ni modos de pensamiento (thinking mode) en la informacion disponible.
- Capacidades multilingues limitadas a ingles y chino; no se declara soporte para castellano.

## Casos de uso

- Invocacion de funciones en asistentes locales: el modelo puede generar llamadas estructuradas a APIs o herramientas definidas por el usuario, aprovechando el ajuste sobre Berkeley-Function-Calling-Leaderboard, en despliegues con llama.cpp u Ollama sobre hardware de consumo.
- Automatizacion de tareas de desarrollo con agentes: al soportar tool calling, puede integrarse en bucles de agente que consulten herramientas externas (ejecucion de comandos, busquedas, calculos) en entornos controlados.
- Procesamiento de texto en ingles y chino: util para pipelines bilingues de resumen, clasificacion o extraccion de informacion donde no se requiera castellano.
- Prototipado rapido en estaciones de trabajo: con cuantizaciones Q4_K_M de 2,7 GB, cabe en GPUs consumer de 8 GB o incluso en CPU, lo que permite experimentar sin infraestructura dedicada.
- Investigacion sobre alineacion y abliteration: el modelo sirve como caso de estudio para analizar como el proceso de eliminacion de rechazos afecta al comportamiento del modelo en tareas de seguridad.
- Generacion de contenido sin restricciones de rechazo en entornos de investigacion controlados, siempre que se cumplan las obligaciones legales y eticas aplicables.
- Despliegue en entornos con recursos limitados: las versiones Q2_K (1,9 GB) y Q3_K_S (2,0 GB) permiten ejecucion en dispositivos con poca memoria, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~1,9 GB; Q3_K_S ~2,0 GB; Q4_K_S y IQ4_XS ~2,5 GB; Q4_K_M ~2,7 GB; Q5_K_M ~3,1 GB; Q6_K ~3,5 GB; Q8_0 ~4,5 GB; f16 ~8,3 GB. A estas cifras hay que sumar la memoria para el contexto KV, no documentada.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para cuantizaciones Q4; una RTX 3060, RTX 4060 o superior es suficiente para Q4_K_M y Q5_K_M. Para f16 se recomienda una GPU con 10-12 GB o mas (RTX 3080, RTX 4070 Ti, A100, H100).
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 6 GB o mas para cuantizaciones Q4 y Q5; las versiones Q2 y Q3 caben incluso en iGPU o CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base requiere transformers con custom_code; la version GGUF no.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Formato |
|---|---|---|---|---|---|
| Spark-X2.6-4B-heretic-tool (este) | 4,1B | no disponible | si | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-3B-Instruct | 3,1B | 32K (segun documentacion publica de Qwen) | si | Apache 2.0 | GGUF, safetensors |
| Llama-3.2-3B-Instruct | 3,2B | 128K (segun documentacion publica de Meta) | si | Llama 3.2 Community License | GGUF, safetensors |
| Phi-3.5-mini-instruct | 3,8B | 128K (segun documentacion publica de Microsoft) | limitado | MIT | GGUF, safetensors |

Nota: los datos de contexto de los modelos comparativos provienen de su documentacion publica; no se dispone de datos de contexto del modelo Spark en la informacion proporcionada. No se han publicado benchmarks comparativos para el modelo Spark.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de seguridad, lo que implica un riesgo elevado de generar contenido danino, ilegal o inseguro; no es adecuado para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion inherente a un modelo de 4B; no se han publicado evaluaciones de fidelidad.
- Soporte limitado a ingles y chino; no se declara castellano ni otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- No se dispone de informacion sobre sesgos conocidos ni sobre evaluaciones de seguridad del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el uso de un modelo decensored puede contravenir politicas de plataformas o normativas locales; el usuario asume la responsabilidad legal.
- Las cuantizaciones estaticas (no imatrix) pueden degradar la calidad en tipos bajos como Q2_K y Q3_K_M; se recomienda Q4_K_M o superior para produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Spark-X2.6-4B-heretic-tool-GGUF
- Modelo base: https://huggingface.co/NeosQ/Spark-X2.6-4B-heretic-tool
- Pagina de overview del cuantizador: https://hf.tst.eu/model#Spark-X2.6-4B-heretic-tool-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Dataset Berkeley-Function-Calling-Leaderboard: https://huggingface.co/datasets/gorilla-llm/Berkeley-Function-Calling-Leaderboard
