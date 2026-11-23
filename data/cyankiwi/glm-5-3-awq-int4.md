# cyankiwi/GLM-5.3-AWQ-INT4

## Resumen

GLM-5.3-AWQ-INT4 es una cuantizacion de 4 bits en formato AWQ (Activation-aware Weight Quantization) del modelo GLM-5.3, desarrollado por Z.ai (zai-org). El modelo original es un transformer de tipo MoE con arquitectura `glm_moe_dsa` (atención dispersa, *DeepSeek Sparse Attention*) y 151.734.927.286 parámetros totales. Esta version cuantizada la publica el usuario cyankiwi bajo la version de pipeline "cyankiwi 26.05.01", con calibracion orientada a dominios STEM y agenticos.

La relevancia del modelo radica en su enfoque: GLM-5.3 reutiliza exactamente el mismo modelo base que GLM-5.2 y todas las mejoras provienen del post-entrenamiento. Segun la model card, esto se traduce en una mejora del 50% en coding sobre GLM-5.2 en el benchmark interno Z.ai Code Bench, y en resultados de referencia abierta (open-source SOTA) en Terminal Bench 3.0 y Agents' Last Exam. Ademas, el autor reporta una capacidad emergente en ciberseguridad, con resultados SOTA en CyberGym para descubrimiento de vulnerabilidades.

La version cuantizada ocupa 488,18 GB en el repositorio y esta pensada para despliegue con transformers y `compressed-tensors`, con compatibilidad declarada con endpoints. El modelo soporta ingles y chino, y se distribuye bajo la licencia propietaria `glm-5.3` (etiquetada como `other`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion dispersa (`glm_moe_dsa`) |
| Parametros totales | 151.734.927.286 (~151,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AWQ INT4 (4 bits, calibracion STEM y Agentic) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | `glm-5.3` (etiqueta `other` en Hugging Face) |
| Formato de pesos | safetensors, `compressed-tensors` |
| Tamano del repositorio | 488,18 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-01 |
| Ultima actualizacion | 2026-10-31 |
| Descargas / likes | 410 / 2 |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 emplea una arquitectura de mezcla de expertos (MoE) identificada en el repositorio como `glm_moe_dsa`, es decir, con atencion dispersa (*sparse attention*) al estilo DeepSeek. No se dispone en la informacion proporcionada de detalles sobre el numero de expertos, el ratio de activacion, el numero de capas, la dimension oculta ni la longitud de contexto nativa. El recuento real de parametros en safetensors es de 151.734.927.286.

En cuanto al entrenamiento, la model card es explicita: GLM-5.3 comparte el mismo modelo base que GLM-5.2 y todas las ganancias proceden del post-entrenamiento. No se especifican el volumen de tokens, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF, DPO o RL verificable, aunque la mencion a "escalar el post-entrenamiento" y la aparicion de capacidades emergentes en ciberseguridad sugieren un entrenamiento intensivo en tareas agenticas y de explotacion. Esta version cuantizada aplica AWQ INT4 con un conjunto de calibracion especifico de dominios STEM y agenticos, lo que busca preservar el rendimiento en tareas de codigo y razonamiento de multiples pasos tras la cuantizacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Razonamiento complejo y resolucion de tareas de horizonte largo (*long-horizon*).
- Codigo: generacion, reparacion y trabajo sobre repositorios; el autor lo describe como el modelo de pesos abiertos mas capaz para coding.
- Tareas agenticas de terminal y CLI: resultados destacados en Terminal Bench 2.1/3.0 y Agents' Last Exam (ALE-CLI).
- Uso de herramientas (*tool calling*): evaluado en Toolathlon Verified y AutomationBench.
- Razonamiento con herramientas externas: evaluado en HLE w/ Tools.
- Capacidades de ciberseguridad: descubrimiento de vulnerabilidades (CyberGym) y explotacion (ExploitGym, ExploitBench).
- Ingenieria de software a gran escala: SWE-Marathon, FrontierSWE, DeepSWE, NL2Repo, ProgramBench.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).

## Casos de uso

- Agentes de codigo autonomos en terminal: el modelo esta optimizado para tareas CLI de horizonte largo (Terminal Bench 3.0: 28,3), por lo que encaja en agentes que clonan repositorios, ejecutan comandos, interpretan errores e iteran hasta resolver la tarea.
- Reparacion de bugs en produccion: con resultados de 66,9 en DeepSWE v1.1 y 78,1 en FrontierSWE, es adecuado para pipelines que reciben un issue, localizan el fallo en el repositorio y proponen un parche verificable.
- Automatizacion de flujos con herramientas: su rendimiento en Toolathlon Verified (73,0) y AutomationBench (48,2) lo hace util para orquestar APIs, hojas de calculo, correo y sistemas internos en tareas de back-office.
- Auditoria de seguridad y descubrimiento de vulnerabilidades: con 84,5 en CyberGym, puede emplearse en revision de codigo orientada a seguridad y en la generacion de pruebas de concepto dentro de entornos controlados.
- Asistente de ingenieria de software en IDE: generacion y refactorizacion de codigo en ingles y chino, con soporte de conversacion multi-turno para explicar cambios y mantener contexto del proyecto.
- Investigacion asistida con busqueda: HLE con herramientas de 62,5 permite usarlo como motor de razonamiento en pipelines de retrieval aumentado para preguntas tecnicas complejas.
- Despliegue en infraestructura propia: al ser una cuantizacion INT4 con `compressed-tensors`, permite servir el modelo en clústeres con GPUs de 80 GB reduciendo el coste de memoria frente a los pesos en BF16.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base GLM-5.3 (no especificos de la version cuantizada):

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88,2 | 81,0 | 88,3 | 87,9 | 86,6 | 85,0 | 88,0 | **88,8** |
| Terminal Bench 3.0 | 28,3 | 4,6 | 17,4 | – | – | 21,1 | 33,7 | **34,6** |
| DeepSWE (v1.1) | 66,9 | 46,2 | 67,5 | 62,7 | 56,6 | 58,0 | 69,7 | **72,7** |
| NL2Repo | 58,0 | 48,9 | 58,0 | 61,1 | 55,9 | **69,7** | – | – |
| ProgramBench (Almost Solved) | 19,0 | 9,5 | 17,5 | – | 10,5 | 15,5 | **33,0** | 23,0 |
| FrontierSWE | 78,1 | 67,5 | – | – | – | 66,5 | **88,2** | – |
| SWE-Marathon (v1.1) | 42,5 | 19,4 | 48,1 | – | – | **48,8** | 33,1 | 42,5 |
| PostTrainBench | 39,8 | 31,7 | 32,0 | – | – | 32,9 | **41,8** | 36,2 |
| CyberGym | **84,5** | 77,2 | 80,0 | 83,3 | 78,5 | 78,1 | 83,8 | 83,6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | **216 / 293** |
| ExploitBench | 54,4 | 24,4 | 32,2 | – | 28,8 | 40,0 | **78,0** | 76,5 |
| Toolathlon Verified | 73,0 | 59,9 | **76,5** | 74,1 | 72,5 | 76,2 | 74,7 | 74,9 |
| AutomationBench (v1.0.6) | **48,2** | 26,2 | 46,7 | 43,2 | 39,8 | 41,0 | 46,2 | 45,8 |
| Agents' Last Exam (ALE-CLI) | 28,5 | 23,8 | 27,6 | 25,7 | 27,0 | 25,7 | 23,8 | **28,6** |
| HLE w/ Tools | 62,5 | 54,7 | 59,8 | 60,0 | 56,2 | 57,9 | 63,9 | **64,5** |

No se han publicado resultados de benchmarks especificos para la version cuantizada AWQ INT4 en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 488,18 GB en INT4, por lo que la inferencia requiere del orden de 450-500 GB de memoria agregada, mas el espacio para la cache KV.
- No cabe en una unica GPU consumer: una RTX 4090 (24 GB) o RTX 5090 no son suficientes ni siquiera con la cuantizacion INT4.
- Despliegue multi-GPU necesario: se requieren varios aceleradores de 80 GB (A100, H100, H200) o un nodo con memoria unificada de gran capacidad.
- Opciones de despliegue: la libreria declarada es transformers con `compressed-tensors`; la model card indica compatibilidad con endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Coding / agentes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3 (esta version AWQ INT4) | ~151,7 B (MoE) | no disponible | Terminal Bench 3.0: 28,3; DeepSWE: 66,9; CyberGym: 84,5 | `glm-5.3` (other) | Pesos abiertos en HF |
| GLM-5.2 | no disponible | no disponible | Terminal Bench 3.0: 4,6; DeepSWE: 46,2; CyberGym: 77,2 | no disponible | Pesos abiertos |
| Kimi K3 | no disponible | no disponible | Terminal Bench 3.0: 17,4; DeepSWE: 67,5; CyberGym: 80,0 | no disponible | Referenciado en la model card |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | Terminal Bench 2.1: 87,9; DeepSWE: 62,7; CyberGym: 83,3 | no disponible | Referenciado en la model card |

La comparativa se limita a los datos de la model card; no se dispone de informacion sobre parametros, contexto ni licencia de los modelos alternativos.

## Limitaciones y advertencias

- La cuantizacion AWQ INT4 puede degradar ligeramente la precision respecto al modelo en BF16; no se han publicado evaluaciones de la version cuantizada que cuantifiquen esa perdida.
- Solo se declaran ingles y chino; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- No se especifica la longitud de contexto nativa, lo que impide planificar despliegues con ventanas largas sin validacion previa.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo y seguridad donde una respuesta incorrecta puede ser costosa.
- Capacidades de ciberseguridad ofensiva (ExploitGym, ExploitBench): su uso debe restringirse a entornos autorizados y auditorias; existe riesgo de uso indebido.
- Licencia `glm-5.3` etiquetada como `other`: es necesario revisar los terminos completos antes de un uso comercial, ya que no es una licencia open source estandar.
- El modelo base es el mismo que GLM-5.2, por lo que las mejoras dependen del post-entrenamiento y no de un cambio arquitectonico.
- No hay datos publicados de latencia ni throughput para esta cuantizacion.
- El repositorio tiene solo 410 descargas y 2 likes, por lo que la validacion comunitaria es muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyankiwi/GLM-5.3-AWQ-INT4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Dataset de calibracion: https://huggingface.co/datasets/cyankiwi/calibration
- Web del autor de la cuantizacion: https://cyan.kiwi/
- Perfil del autor en Hugging Face: https://huggingface.co/cyankiwi
- Perfil del autor en ModelScope: https://www.modelscope.ai/organization/cyankiwi
- Repositorio GitHub del modelo base: https://github.com/zai-org/GLM-5
- Paper referenciado (arXiv:2602.15763): https://arxiv.org/abs/2602.15763
- X del autor: https://x.com/cyankiwi_ai
- Reddit del autor: https://www.reddit.com/r/cyankiwi/
