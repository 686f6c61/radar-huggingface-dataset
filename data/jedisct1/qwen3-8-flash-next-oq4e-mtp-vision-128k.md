# jedisct1/Qwen3.8-Flash-Next-oQ4e-MTP-Vision-128k

## Resumen

Este repositorio contiene una conversión comunitaria del modelo Qwen/Qwen3.8-Flash-Next-FP8 al formato MLX-VLM, específicamente adaptada para Apple Silicon. El autor, jedisct1, ha cuantizado el modelo a precisión mixta de 4 bits (oQ4e) y ha integrado los pesos de visión en BF16, junto con los tensores MTP (multi-token prediction) del checkpoint de texto. El resultado es un artefacto multimodal que acepta entradas de imagen y texto, con una ventana de contexto de 128K tokens en este checkpoint (el modelo base soporta hasta 262K). No es un lanzamiento oficial de Qwen, sino un trabajo de la comunidad para facilitar la ejecución local en hardware de Apple.

La relevancia de este modelo radica en que permite ejecutar un MoE ultra-sparse de 125B parámetros (con 6B activos por token) en un Mac con memoria unificada, algo que normalmente requeriría múltiples GPUs de alta gama. La cuantización reduce el tamaño del checkpoint a unos 95 GB, y la integración con MLX-VLM proporciona una vía sencilla para usar el modelo en tareas de visión y lenguaje. Sin embargo, hay que tener en cuenta que la conversión no es oficial, que los tensores MTP están inactivos en MLX-VLM y que la inferencia de vídeo no ha sido validada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA); multimodal (vision + texto) |
| Parametros totales | 125B (modelo base); 26.865.618.979 tensores en el checkpoint cuantizado (safetensors) |
| Parametros activos | 6B por token (MoE) |
| Longitud de contexto | 128K (checkpoint); 262K (modelo base) |
| Tipos de cuantizacion | Q4 affine group-size 128 (mezcla con Q5, Q8, BF16; Q2/Q3 para el banco n-gram PLE) |
| Idiomas soportados | Multilingue (no se especifican idiomas concretos) |
| Licencia | qwen-community-1.0 (licencia comunitaria de Qwen, no OSI) |
| Formato de pesos | safetensors (23 archivos, 3.249 tensores indexados) para MLX-VLM |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next-FP8 emplea una arquitectura MoE ultra-sparse con 125B parámetros totales y 6B activos por token. Combina dos mecanismos de atención: tres de cada cuatro capas usan Gated DeltaNet para comprimir el historial, y la cuarta capa utiliza Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. Además, incorpora un banco n-gram PLE de 51.2B parámetros que actúa como memoria auxiliar. El checkpoint original incluye pesos MTP para decodificación especulativa, aunque en esta conversión dichos tensores están presentes pero inactivos bajo MLX-VLM.

Esta conversión no es un entrenamiento nuevo, sino una cuantización del checkpoint FP8 oficial. La cuantización se realizó con una matriz de importancia recopilada de 1.024 muestras multilingües con uso intensivo de herramientas, a longitud de secuencia 512. La precisión se asigna por familia de tensores: los pesos lineales y de expertos enrutados usan Q4 con group-size 128, las matrices de atención y expertos compartidos conservan Q5/Q8, y los tensores de control (routers, normalización, etc.) permanecen en BF16. La torre de visión completa se mantiene en BF16 sin cuantizar. El proceso de conversión está documentado en el repositorio, pero no se proporcionan detalles sobre el entrenamiento original del modelo base.

## Capacidades

- Generacion de texto y razonamiento: el modelo es capaz de producir texto coherente y realizar tareas de razonamiento complejo, gracias a su arquitectura MoE y al contexto largo.
- Vision (imagen a texto): acepta imagenes como entrada y puede describirlas o responder preguntas sobre ellas. La torre de vision esta en BF16 y es bit-exacta con la fuente.
- Video: se incluye metadata del procesador de video, pero la inferencia de video no ha sido validada en esta conversion.
- Tool calling / function calling: el modelo soporta llamadas a herramientas, aunque la model card advierte que puede generar llamadas malformadas o duplicadas.
- Thinking mode: el servidor MLX-VLM permite activar un modo de razonamiento explicito con `--enable-thinking` y un presupuesto de tokens configurable.
- Multilingue: el modelo fue calibrado con muestras multilingues, aunque no se detallan los idiomas concretos.
- MTP (multi-token prediction): los tensores MTP estan incluidos en el checkpoint, pero MLX-VLM los elimina al cargar el modelo, por lo que no proporcionan aceleracion especulativa en este repositorio.

## Casos de uso

- Analisis de imagenes en entornos Apple Silicon: un desarrollador puede usar `mlx_vlm.generate` para describir imagenes, extraer texto o responder preguntas visuales directamente en un Mac con suficiente memoria unificada. La torre de vision en BF16 garantiza fidelidad respecto al modelo original.
- Asistente conversacional con contexto largo: con 128K tokens de ventana, el modelo puede mantener conversaciones muy extensas, por ejemplo en atencion al cliente, donde se necesita recordar todo el historial de una interaccion de horas.
- Generacion de codigo con tool calling: el modelo puede integrarse en un entorno de desarrollo como asistente de programacion, generando fragmentos de codigo y llamando a herramientas (por ejemplo, ejecutar tests o consultar APIs) a traves del servidor OpenAI-compatible de MLX-VLM.
- Procesamiento de documentos largos: gracias al contexto de 128K, se pueden resumir o analizar documentos extensos (manuales, informes, codigo fuente completo) en una sola pasada, sin necesidad de dividirlos.
- Agentes autonomos: combinando tool calling, thinking mode y razonamiento multi-paso, el modelo puede actuar como agente para tareas como busqueda de informacion, automatizacion de flujos o gestion de correo, siempre con validacion externa de las acciones.
- Prototipado rapido de aplicaciones multimodales: al ser un checkpoint listo para MLX-VLM, un investigador puede montar un servidor local en minutos y probar interacciones texto-imagen sin depender de APIs externas, ideal para experimentos en entornos sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo base supera a Claude-4.6-Opus (Max) en tareas de agente, vision y chat, segun unsloth, pero no se proporcionan numeros concretos para esta conversion cuantizada. Tampoco hay datos de latencia o throughput medidos en el hardware de prueba.

## Requisitos de hardware

- El checkpoint ocupa 95.4 GB en disco (88.795 GiB de payload de tensores), por lo que se necesita al menos 100 GB de espacio libre.
- Probado en Apple Silicon con M5 Max y 128 GiB de memoria unificada. No se ha probado en configuraciones con menos memoria.
- Requiere MLX 0.32.1, MLX-VLM 0.6.17 y Transformers 5.15.1 (entorno Python 3.11 recomendado).
- No es compatible con GPUs NVIDIA ni con Transformers stock; solo funciona con MLX-VLM en Apple Silicon.
- Para inferencia, se recomienda al menos 128 GiB de memoria unificada, dado el tamaño del modelo. No se dispone de datos de VRAM especifica porque MLX usa memoria unificada.
- Opciones de despliegue: `mlx_vlm.generate` para inferencia puntual, `mlx_vlm.server` para un servidor OpenAI-compatible, y conexion con Swival a traves de su proveedor `llamacpp`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 (base) | 125B MoE (6B activos) | 262K | qwen-community-1.0 | HuggingFace oficial |
| jedisct1/Qwen3.8-Flash-Next-oQ4e-MTP-Vision-128k (este) | 125B MoE (6B activos), checkpoint cuantizado | 128K (checkpoint) | qwen-community-1.0 | HuggingFace (comunidad) |
| Qwen3.8-Flash (original) | No disponible | 1M (segun QwenCloud) | qwen-community-1.0 | HuggingFace oficial |

La comparativa se limita a los modelos de la misma familia, ya que no se dispone de datos de rendimiento para otros MoE multimodales. La principal diferencia entre este checkpoint y el base FP8 es la cuantizacion (4-bit vs FP8) y la adaptacion a MLX-VLM, que reduce los requisitos de memoria pero puede degradar ligeramente la calidad. El contexto se reduce de 262K a 128K en esta conversion, aunque el modelo base soporta mas.

## Limitaciones y advertencias

- Los tensores MTP estan incluidos pero inactivos bajo MLX-VLM, por lo que no hay aceleracion especulativa en este repositorio.
- El checkpoint no es compatible con Transformers stock; solo funciona con MLX-VLM en Apple Silicon.
- Solo se ha probado en la configuracion indicada (M5 Max, 128 GiB, MLX 0.32.1). No se garantiza el funcionamiento en otros equipos.
- La inferencia de video no ha sido validada; solo se incluye la metadata del procesador.
- La cuantizacion puede reducir la calidad del modelo en comparacion con el FP8 original, especialmente en tareas sensibles a la precision.
- El modelo puede producir contenido incorrecto, llamadas a herramientas malformadas o duplicadas, o acciones inseguras. La ejecucion de herramientas requiere validacion independiente y limites de permisos adecuados.
- El modelo hereda las limitaciones y consideraciones de uso del modelo Qwen original, incluyendo posibles sesgos y riesgos de alucinacion.
- La licencia qwen-community-1.0 no es una licencia open source estandar; es necesario revisar sus terminos antes de un uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-MTP-Vision-128k
- Modelo base (Qwen/Qwen3.8-Flash-Next-FP8): https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Checkpoint de texto MTP (jedisct1/Qwen3.8-Flash-Next-oQ4e-128k): https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-oQ4e-128k
- Documentacion de unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Pagina de QwenCloud para Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Repositorio GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
