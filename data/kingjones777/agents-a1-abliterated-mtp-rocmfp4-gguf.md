# kingjones777/Agents-A1-Abliterated-MTP-ROCmFP4-GGUF

## Resumen

Agents-A1-Abliterated-MTP-ROCmFP4-GGUF es una cuantización GGUF del modelo agéntico Agents-A1 (35B MoE, ~3B activos) desarrollado por InternScience, con la capa de abliteración de huihui-ai y un bloque de predicción multi-token (MTP) injertado por kingjones777. El modelo base es un MoE de 40 capas basado en arquitectura Qwen3.5-35B-A3B, diseñado para tareas de agente de largo horizonte: búsqueda, ingeniería, investigación científica, seguimiento de instrucciones y uso de herramientas. Esta versión concreta añade decodificación especulativa mediante MTP, lo que mejora el rendimiento en un 19-20 % según las mediciones del autor, y está optimizada para hardware AMD Strix Halo (gfx1151) con backends ROCm y Vulkan desde un único binario.

La relevancia de esta ficha radica en que combina tres contribuciones: la abliteración (eliminación de rechazo de contenido) de huihui-ai, el injerto de una capa MTP que el checkpoint original no incluye, y una cuantización ROCmFP4/ROCmFPX específica para GPUs AMD de la serie gfx1151. El resultado es un modelo de agentes ejecutable en hardware de consumo con decodificación especulativa funcional. La licencia es Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), 40 capas, basada en Qwen3.5-35B-A3B |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | ~3B (A3B, segun especificacion del modelo base) |
| Longitud de contexto | no disponible (el comando de ejemplo usa -c 8192, pero no es un limite del modelo) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (4,65 BPW), Q4_0_ROCMFP4_STRIX_LEAN (4,39 BPW), Q6_0_ROCMFPX_AGENT (7,58 BPW), Q6_0_ROCMFPX_LEAN (6,61 BPW) |
| Idiomas soportados | no disponible (probablemente multilingue por su base Qwen, pero sin confirmacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tipos ggml 100-119 propietarios de ROCmFPX) |

## Arquitectura y entrenamiento

El modelo base Agents-A1 es un MoE de 40 capas con ~3B parametros activos de un total de 35,5B. InternScience lo entreno con un enfoque de escalado del horizonte del agente, combinando trayectorias de largo alcance y habilidades heterogeneas, alcanzando rendimiento comparable a modelos de billon de parametros en tareas agénticas. El checkpoint original no incluye capa MTP (733 tensores, sin `blk.40`), por lo que la decodificacion especulativa no era posible.

El autor kingjones777 injerto un bloque MTP en BF16 antes de la cuantizacion, extrayendolo de la version de SC117. Este bloque acepta con una tasa de 0,963 (longitud media aceptada de 3,44 de 4 tokens) y aporta una mejora de velocidad del 19 % en Vulkan y 20 % en ROCm. Ademas, se aplico la abliteracion de huihui-ai, que elimina los mecanismos de rechazo de contenido del modelo. La cuantizacion se realizo con el formato ROCmFP4/ROCmFPX, que usa tipos ggml 100-119 y requiere un build especifico de llama.cpp con soporte HIP y Vulkan.

## Capacidades

- Generacion de texto y razonamiento de largo alcance, optimizado para tareas agénticas multi-paso.
- Tool calling / function calling: el modelo base soporta uso de herramientas, esencial para agentes autonomos.
- Soporte de agentes y multi-step reasoning: disenado para largas trayectorias de busqueda, ingenieria e investigacion.
- Decodificacion especulativa MTP: hasta 4 tokens de prediccion, activable con `--spec-type draft-mtp`.
- Vision: incluye un proyector de imagen (`mmproj-Agents-A1-Abliterated-BF16.gguf`, 0,84 GiB) que permite entrada multimodal, aunque el modelo principal es de texto.
- Abliterado: sin filtros de rechazo de contenido (uncensored), lo que permite generar respuestas sin restricciones de seguridad.
- Multilingue: no confirmado oficialmente, pero por su base Qwen es probable que soporte multiples idiomas.

## Casos de uso

- Agentes autonomos de busqueda web: el modelo puede orquestar multiples consultas, evaluar resultados y sintetizar informacion en un unico flujo, gracias a su entrenamiento en trayectorias de largo horizonte y tool calling.
- Generacion de codigo en produccion: con soporte de function calling, puede integrarse en pipelines de CI/CD para generar, revisar y corregir codigo, aunque requiere desactivar el modo thinking para respuestas estables.
- RAG con contexto largo: su ventana de contexto configurable (hasta 8192 tokens en el ejemplo) permite indexar y consultar documentos extensos en sistemas de recuperacion aumentada.
- Asistente de investigacion cientifica: puede leer articulos, extraer datos, formular hipotesis y proponer experimentos, aprovechando su capacidad de razonamiento multi-paso.
- Automatizacion de tareas de ingenieria: desde generar documentacion tecnica hasta resolver problemas de depuracion, el modelo puede actuar como copiloto en entornos de desarrollo.
- Chat sin censura para entornos controlados: la abliteracion permite generar contenido que otros modelos rechazarian, util en entornos de investigacion o simulacion donde se requiere explorar topicos sensibles.
- Despliegue en hardware AMD de consumo: gracias a la cuantizacion ROCmFP4 y al soporte Vulkan, puede ejecutarse en equipos con APU Strix Halo (Ryzen AI Max+ 395) sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor reporta unicamente mediciones de rendimiento de la decodificacion especulativa: tasa de aceptacion de 0,963, longitud media aceptada de 3,44 de 4 tokens, y mejora de velocidad del +19 % en Vulkan y +20 % en ROCm en comparacion con la misma cuantizacion sin MTP. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- Arquitectura objetivo: AMD gfx1151 (Strix Halo), concretamente Ryzen AI Max+ 395 / Radeon 8060S. Tambien puede ejecutarse en otros dispositivos con Vulkan, pero esta optimizado para esa GPU.
- Tamano de los archivos: entre 17,88 GiB (Q4_0_ROCMFP4_STRIX_LEAN) y 30,89 GiB (Q6_0_ROCMFPX_AGENT). Se recomienda al menos 24 GB de VRAM para la cuantizacion mas pequena, y 32 GB para las Q6.
- No cabe en GPUs consumer de 8-12 GB (RTX 4060, 4070, etc.). Solo GPUs con 24 GB o mas (RTX 4090, 3090) podrian cargar el Q4_0_STRIX_LEAN, aunque no esta validado.
- Requiere un build especifico de llama.cpp con ROCmFPX y Vulkan habilitados. El llama.cpp estandar rechaza los archivos por usar tipos ggml 100-119.
- Opciones de despliegue: `llama-server` con flags `-dev Vulkan0` o `-dev ROCm0`, usando el mismo binario.
- Latencia y throughput: no hay datos publicos. El autor indica que Vulkan es mejor para decode (chat, bucles agénticos) y ROCm para prefill (prompts largos, RAG).

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo publicados para esta cuantizacion. Estructuralmente, se puede comparar con el modelo base y con otras versiones:

| Modelo | Parametros | Activos | Contexto | MTP | Licencia | Formato |
|---|---|---|---|---|---|---|
| Agents-A1-Abliterated-MTP (este) | 35,5B | ~3B | no disponible | Si (injertado) | Apache 2.0 | GGUF ROCmFPX |
| InternScience/Agents-A1 (base) | 35,5B | ~3B | no disponible | No | Apache 2.0 | Safetensors |
| huihui-ai/Huihui-Agents-A1-abliterated | 35,5B | ~3B | no disponible | No | Apache 2.0 | GGUF |
| Qwen3.5-35B-A3B (base arquitectonica) | 35,5B | ~3B | no disponible | No | Apache 2.0 | Safetensors |

La diferencia principal es la adicion del bloque MTP y la cuantizacion ROCmFP4, que no existe en los otros. No hay datos de rendimiento en tareas estandar para comparar.

## Limitaciones y advertencias

- Advertencia critica: con el modo thinking habilitado (`enable_thinking: true`), el modelo devuelve un campo `content` vacio en la mayoria de prompts no-code, ya que no detiene el razonamiento dentro de un presupuesto de tokens razonable. Es obligatorio desactivarlo (`enable_thinking: false`) para uso normal. El checkpoint no abliterado original tambien presenta este comportamiento.
- Requiere un build especifico de llama.cpp (ROCmFPX con Vulkan). El llama.cpp estandar no carga estos archivos, lo que limita su portabilidad.
- La abliteracion elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido inapropiado, ofensivo o peligroso. No es adecuado para despliegues sin supervision humana.
- No se han publicado benchmarks estandar, por lo que el rendimiento en tareas generales es desconocido.
- La cuantizacion ROCmFP4 es propietaria del proyecto ROCmFPX y no es compatible con otras herramientas como Ollama o vLLM sin modificaciones.
- El modelo base tiene un contexto no especificado; el ejemplo usa 8192 tokens, pero no se confirma si puede extenderse.
- La vision requiere pasar el proyector `mmproj` y usar `-fa off` para scoring, lo cual reduce el rendimiento.
- Para trabajo multi-turno o agéntico, las flags de MTP deben eliminarse, ya que la especulacion cuesta un 31 % de rendimiento end-to-end en esos escenarios.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Agents-A1-Abliterated-MTP-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/InternScience/Agents-A1
- Abliteracion de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Agents-A1-abliterated-GGUF
- Version MTP de SC117: https://huggingface.co/SC117/Agents-A1-Uncensored-MTP-APEX-GGUF
- Perfil del autor: https://huggingface.co/kingjones777/models
- Pagina oficial de Agents-A1: https://internscience.github.io/Agents-A1/
- Repositorio GitHub de Agents-A1: https://github.com/InternScience/Agents-A1/
- Repositorio ROCmFPX (build necesario): https://github.com/charlie12345/ROCmFPX.git
- Analisis independiente del modelo base: https://agentos.guide/agents-a1
