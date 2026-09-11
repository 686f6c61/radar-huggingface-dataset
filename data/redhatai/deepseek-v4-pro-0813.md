# RedHatAI/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es la version oficial de DeepSeek-V4-Pro, publicada por DeepSeek AI y redistribuida en este repositorio por RedHatAI. Sustituye a la version Preview e incorpora mejoras sustanciales en capacidades agenticas (uso de herramientas, ejecucion de tareas multi-paso y desarrollo de software autonomo). El modelo se construye sobre la estructura de DeepSeek-V4-Pro (Preview) con un modulo de decodificacion especulativa denominado DSpark acoplado.

El repositorio de RedHatAI contiene pesos en formato safetensors con cuantizacion de 8 bits / FP8, es compatible con la libreria transformers y con endpoints, y se distribuye bajo licencia MIT. El dato real extraido de los safetensors indica 1.650.497.936.906 parametros totales (aproximadamente 1,65 billones), con un tamano de repositorio de 892,8 GB, lo que lo situa en la categoria de modelos frontera que requieren infraestructura multi-GPU de centro de datos.

La relevancia actual del modelo radica en su orientacion a entornos de produccion con agentes: la model card reporta resultados competitivos con modelos propietarios de primera linea en pruebas como Terminal Bench 2.1, DeepSWE, Toolathlon-Verified y Cybergym, ademas de soportar tres niveles de esfuerzo de razonamiento (`low`, `high`, `max`) y un modo de pensamiento explicito. El ID de arXiv asociado es 2606.19348.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun los flags de despliegue de la model card (`--enable-expert-parallel`, `--moe-backend deep_gemm_mega_moe`); la model card no detalla la arquitectura completa |
| Parametros totales | 1.650.497.936.906 (dato real extraido de los safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits / FP8 en este repositorio (tags: `8-bit`, `fp8`); la model card no enumera otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers; repo de 892,8 GB) |

## Arquitectura y entrenamiento

La informacion disponible confirma que el modelo es una arquitectura de mezcla de expertos (MoE) con atencion estandar de tipo transformer: los comandos de despliegue de la model card activan `--enable-expert-parallel`, usan el backend `deep_gemm_mega_moe` para las capas MoE y configuran `--attention-config '{"use_fp4_indexer_cache": true}'`, lo que sugiere un mecanismo de indexado de atencion que puede almacenarse en cache FP4. No se dispone de detalles sobre el numero de expertos, el ratio de activacion por token, el numero de capas ni la dimension oculta.

La innovacion tecnica destacada es DSpark, un modulo de decodificacion especulativa integrado en la propia estructura del modelo y que se habilita con un unico flag: en vLLM mediante `--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'` y en SGLang con `--speculative-algorithm DSPARK`. La model card no proporciona informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco incluye una plantilla de chat en formato Jinja: en su lugar se distribuye una carpeta `encoding` con scripts Python (`encoding_dsv4`) para convertir mensajes en formato compatible con OpenAI a la cadena de entrada del modelo y para parsear su salida.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento explicito y tres niveles de esfuerzo configurables: `low`, `high` y `max`.
- Razonamiento agentico y multi-paso: los benchmarks reportados se evaluan con un framework de agente (DeepSeek Harness) y con `temperature = 1.0, top_p = 0.95`.
- Uso de herramientas: la prueba Toolathlon-Verified (74,1) y el soporte del parametro de herramientas en la codificacion de mensajes indican soporte de tool calling / function calling.
- Tareas de terminal y operacion de sistemas: Terminal Bench 2.1 con 87,9 puntos.
- Desarrollo de software y agentes de codigo: DeepSWE (62,7), NL2Repo (61,5), DSBench-FullStack (71,1) y DSBench-Hard (67,2).
- Ciberseguridad en entornos de agente: Cybergym con 83,3.
- Razonamiento de alta dificultad con y sin herramientas: HLE con 42,7 sin herramientas y 60,0 con herramientas.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Agentes de desarrollo de software autonomos: el modelo puede resolver tareas de repositorio completo (NL2Repo, 61,5) y problemas dificiles de ingenieria (DSBench-Hard, 67,2), integrándose en pipelines de CI/CD como agente que propone parches y valida tests.
- Automatizacion de operaciones en terminal: con 87,9 en Terminal Bench 2.1, es adecuado para agentes que ejecutan comandos, depuran fallos de entorno y administran sistemas en un bucle de observacion-accion.
- Orquestacion de herramientas empresariales: el resultado de 74,1 en Toolathlon-Verified lo hace apto para agentes que encadenan APIs, consultas a bases de datos y servicios internos mediante function calling.
- Analisis de seguridad ofensiva y defensiva en laboratorio: Cybergym (83,3) indica utilidad en tareas de deteccion de vulnerabilidades y ejercicios de red team dentro de entornos controlados.
- Razonamiento experto asistido por herramientas: HLE con herramientas alcanza 60,0, por lo que puede emplearse en investigacion tecnica donde el modelo consulta buscadores o calculadoras externas antes de responder.
- Asistentes de codificacion full-stack: DSBench-FullStack (71,1) sugiere su uso en generacion y mantenimiento de aplicaciones completas, con el modo de razonamiento `max` para tareas complejas y `low` para autocompletado.
- Despliegue en endpoints compatibles con OpenAI: el tag `endpoints_compatible` y los scripts de `encoding` permiten sustituir modelos propietarios en infraestructuras existentes sin cambiar el contrato de la API.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor (evaluacion con DeepSeek Harness en modo minimal, `max` reasoning effort, `temperature = 1.0`, `top_p = 0.95`):

| Benchmark | V4-Pro-0813 | V4-Flash-0731 | V4-Pro (Preview) | V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 |
|---|---|---|---|---|---|---|---|---|
| HLE (sin / con herramientas) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack (interno) | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard (interno) | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

DSBench-FullStack y DSBench-Hard son conjuntos internos del autor, no benchmarks publicos. No se dispone de resultados de MMLU, GSM8K, HumanEval ni de otras pruebas clasicas en la informacion proporcionada.

## Requisitos de hardware

- Los pesos de este repositorio ocupan 892,8 GB, por lo que la inferencia requiere agregacion de memoria entre varias GPU. Como referencia aritmetica, repartidos sobre 4 GPU suponen aproximadamente 223 GB por GPU.
- La model card documenta el despliegue en un unico nodo de 4 GPU GB300 (Blackwell Ultra) con vLLM, usando `--data-parallel-size 4`, `--enable-expert-parallel`, `--kv-cache-dtype fp8`, `--block-size 256` y `--attention-config '{"use_fp4_indexer_cache": true}'`.
- GPU de gama de centro de datos: GB300 esta confirmada por la model card. No se especifican otras configuraciones validadas; el enlace a la receta de vLLM se presenta como fuente de "otras configuraciones de hardware".
- No cabe en GPU de consumo: con 1,65 billones de parametros, incluso una cuantizacion de 4 bits exigiria del orden de 825 GB solo para pesos, muy por encima de la VRAM de una RTX 4090 (24 GB) o de cualquier GPU consumer actual.
- Opciones de despliegue documentadas: vLLM con DSpark activado por flag y SGLang con `--speculative-algorithm DSPARK`. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible. La model card no publica mediciones de tokens por segundo ni tiempos de primera token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento relativo segun la model card |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 1,65 billones (total) | no disponible | MIT | Hugging Face (RedHatAI y deepseek-ai) | Referencia |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | Hugging Face | Inferior en las 10 pruebas reportadas; p. ej. DeepSWE 12,8 frente a 62,7 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | Hugging Face | Competitivo pero inferior en la mayoria de pruebas; AutomationBench 25,1 frente a 31,8 |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Inferior en casi todas las pruebas reportadas; Toolathlon 59,9 frente a 74,1 |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | Mixto: supera a V4-Pro-0813 en HLE, Terminal Bench 2.1, DeepSWE y Toolathlon; queda por debajo en DSBench-Hard y AutomationBench |
| Opus-4.8 | no disponible | no disponible | no disponible | no disponible | Mixto: supera en HLE, NL2Repo y DSBench-Hard; inferior en Terminal Bench 2.1, Cybergym y Toolathlon |
| Fable-5 (con fallback) | no disponible | no disponible | no disponible | no disponible | Superior en HLE, DeepSWE, DSBench-FullStack y Toolathlon; inferior en Cybergym y DSBench-Hard |

Los datos de parametros, contexto y licencia de los modelos comparados no aparecen en la informacion proporcionada; solo se dispone de sus puntuaciones en la tabla de benchmarks.

## Limitaciones y advertencias

- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion ni tasa de error; como modelo generativo de gran escala, mantiene este riesgo en produccion.
- Idiomas soportados: no declarados. No se puede garantizar un rendimiento uniforme fuera del ingles y el chino sin evaluacion propia.
- Longitud de contexto: no especificada, lo que impide planificar despliegues con documentos largos o conversaciones multi-turno extensas sin medirlo previamente.
- Sin plantilla de chat Jinja: es obligatorio usar la carpeta `encoding` y los scripts proporcionados para formatear mensajes y parsear salidas; no es un modelo plug-and-play con el pipeline estandar de transformers.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar codigo del repositorio con privilegios: conviene auditar el repositorio antes de desplegarlo en produccion.
- Coste de infraestructura muy elevado: 892,8 GB de pesos y necesidad de nodos de 4 GPU GB300 o equivalentes; no es viable en entornos con una sola GPU ni en hardware de consumo.
- Procedencia: este repositorio lo publica RedHatAI, no el autor original. Registra 0 descargas y 0 likes y fue creado el 11 de septiembre de 2026. Se recomienda verificar la integridad de los pesos contra el repositorio oficial de DeepSeek antes de usarlos en produccion.
- Resultados de benchmarks parcialmente autoinformados: dos de las diez pruebas (DSBench-FullStack y DSBench-Hard) son conjuntos internos del autor y no son reproducibles de forma independiente. Ademas, la evaluacion se realizo con un framework de agente concreto (DeepSeek Harness en modo minimal), por lo que los numeros no son directamente comparables con evaluaciones en zero-shot.
- Algunas comparaciones de la tabla incluyen la anotacion "(w/ fallback)" en el caso de Fable-5, lo que indica una configuracion asistida que puede no ser equivalente al resto de entradas.
- Licencia MIT: permite uso comercial y modificacion, pero no incluye garantias ni clausulas de responsabilidad por parte de los autores; el cumplimiento normativo del despliegue recae en el integrador.

## Enlaces

- Repositorio en Hugging Face (RedHatAI): https://huggingface.co/RedHatAI/DeepSeek-V4-Pro-0813
- Repositorio oficial de DeepSeek AI referenciado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Informe tecnico (arXiv:2606.19348): https://arxiv.org/abs/2606.19348
- Receta de despliegue con vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Organizacion de DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Sitio oficial: https://www.deepseek.com/
- Chat publico: https://chat.deepseek.com/
- Perfil en X/Twitter: https://twitter.com/deepseek_ai
- Busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo; los unicos resultados obtenidos correspondian a paginas de Google Meet y no guardan relacion con DeepSeek-V4-Pro-0813.
