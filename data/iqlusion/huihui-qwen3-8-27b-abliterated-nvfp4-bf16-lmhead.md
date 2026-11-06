# iQlusion/Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead

## Resumen
Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead es una cuantizacion NVFP4/FP8 del checkpoint abliterado de Qwen3.8-27B, publicada por el usuario iQlusion. El modelo base original es Qwen/Qwen3.8-27B, un modelo denso hibrido de tipo Gated DeltaNet con capacidades de vision y lenguaje (entrada de texto, imagen y video; salida de texto), que huihui-ai sometio a una tecnica de abliteracion para eliminar el comportamiento de rechazo. Esta version aplica cuantizacion mixta con NVIDIA ModelOpt para reducir el peso a 23,75 GB y habilitar inferencia eficiente en GPUs NVIDIA Blackwell con kernels nativos NVFP4.

El interes de esta ficha radica en que combina tres transformaciones sobre el modelo original: eliminacion de rechazos (abliteration), cuantizacion agresiva de las capas MLP a NVFP4 W4A4 y cuantizacion FP8 de las proyecciones de atencion y Gated DeltaNet. El resultado es un checkpoint orientado a despliegues autoalojados con SGLang, con soporte de decodificacion especulativa mediante la cabeza MTP heredada del modelo base. La licencia Apache-2.0 se mantiene desde Qwen3.8-27B.

No se han publicado resultados de benchmarks para este checkpoint concreto, y la calibracion se realizo unicamente con texto en ingles, lo que introduce un riesgo documentado de degradacion en codigo, matematicas y otros idiomas. La ficha describe lo que el autor documenta y lo que puede inferirse de los metadatos, marcando explicitamente como "no disponible" todo aquello que no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido Gated DeltaNet con torre de vision (vision-language model) |
| Parametros totales | 19.225.047.792 (segun safetensors); el autor denomina al modelo "27B" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (contexto nativo) |
| Tipos de cuantizacion | NVFP4 W4A4 (MLP), FP8 W8A8 (atencion y Gated DeltaNet), BF16 (lm_head, embeddings, vision tower, MTP head, in_proj_a/b, conv1d); KV cache en FP8 |
| Idiomas soportados | No disponible (la calibracion de cuantizacion uso solo texto en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards, 23,75 GB) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer denso hibrido que combina capas de atencion clasica con capas Gated DeltaNet, una variante de atencion lineal con estado recurrente, segun la documentacion del autor. Cuenta con 64 capas y un contexto nativo de 262.144 tokens. Incluye una torre de vision que permite entrada de imagen y video, y una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa en SGLang. Los detalles sobre el numero de tokens de entrenamiento, la composicion del dataset y el proceso de alineacion (RLHF/DPO) del modelo original no estan disponibles en la informacion proporcionada.

La transformacion aplicada por iQlusion es puramente de cuantizacion, no de entrenamiento adicional. Se uso NVIDIA ModelOpt 0.47.0 con transformers 5.12.1, calibrando con 1.024 muestras del split de entrenamiento de `abisee/cnn_dailymail`, longitud de secuencia 512 y calibracion de tipo `max`. Las 192 proyecciones MLP (`gate_proj`, `up_proj`, `down_proj`) se cuantizaron a NVFP4 W4A4 con group size 16; las 208 proyecciones de atencion y Gated DeltaNet (`q/k/v/o_proj`, `in_proj_qkv`, `in_proj_z`, `out_proj`) se cuantizaron a FP8 W8A8. La cabeza `lm_head` se mantiene en BF16, al igual que las embeddings, la torre de vision, la cabeza MTP y las proyecciones `in_proj_a/b` y conv1d. La abliteracion del checkpoint intermedio sigue la tecnica de Arditi et al. (2024), que identifica una direccion unica en el espacio de activaciones responsable del comportamiento de rechazo.

## Capacidades
- Generacion de texto conversacional multi-turno con contexto nativo de 262.144 tokens.
- Razonamiento con modo "thinking" activado por defecto; se puede desactivar mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada multimodal: texto, imagen y video; salida exclusivamente de texto.
- Soporte de tool calling / function calling, con parser `qwen3_coder` disponible en SGLang.
- Soporte de agentes y razonamiento multi-paso mediante el parser de razonamiento `qwen3`.
- Decodificacion especulativa mediante la cabeza MTP incluida en el checkpoint (`--speculative-algorithm EAGLE` en SGLang).
- Capacidades multilingues: no documentadas en la informacion disponible; la calibracion de la cuantizacion solo uso ingles.
- Comportamiento sin rechazos (uncensored) por la abliteracion aplicada al modelo base.

## Casos de uso
- Despliegue autoalojado de un asistente conversacional sin filtros de rechazo: el modelo responde a peticiones que el Qwen3.8-27B original declinaria, lo que resulta util en entornos de investigacion sobre seguridad y alineacion, o en aplicaciones donde el equipo asume la responsabilidad de los filtros propios.
- Generacion de codigo en pipelines de CI/CD: el soporte de tool calling con parser `qwen3_coder` y el contexto de 262.144 tokens permiten pasar repositorios completos o diffs extensos como contexto y generar parches o revisiones de codigo.
- Analisis de documentos largos: contratos, informes o transcripciones de hasta 262.144 tokens se pueden procesar en una sola pasada sin chunking, aprovechando el contexto nativo del modelo.
- Procesamiento de imagen y video con descripcion textual: la torre de vision sin cuantizar permite tareas de image-to-text y video-to-text, como generacion de alt-text, resumenes de video o extraccion de informacion de capturas.
- Agentes autonomos multi-paso: el modo thinking y el soporte de tool calling permiten construir agentes que planifican, invocan herramientas y razonan sobre resultados intermedios, con decodificacion especulativa para reducir latencia.
- Inferencia de alta eficiencia en Blackwell: el formato NVFP4 con kernels nativos permite servir el modelo en GPUs NVIDIA Blackwell con menor huella de memoria que el checkpoint BF16 original, adecuado para entornos con restricciones de VRAM.
- Investigacion sobre abliteracion y cuantizacion: el checkpoint permite estudiar como interactuan la eliminacion de rechazos y la cuantizacion agresiva, comparando comportamiento con el modelo base sin cuantizar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no hay resultados de evaluacion para este checkpoint y que la verificacion se limito a una comprobacion capa por capa del export: las 192 proyecciones MLP son NVFP4 con group size 16, las 208 proyecciones de atencion y Gated DeltaNet son FP8, `lm_head` es BF16, y estan presentes los 15 tensores MTP y los 333 de vision.

## Requisitos de hardware
- VRAM estimada para inferencia: el checkpoint pesa 23,75 GB en disco; en inferencia hay que sumar la KV cache en FP8 y los buffers de activacion. Una estimacion conservadora para contexto largo seria de 24-32 GB de VRAM, aunque el autor no publica cifras exactas.
- GPU recomendadas: NVIDIA Blackwell con soporte nativo de kernels NVFP4, segun el autor. No se especifican modelos concretos (B200, RTX 50xx, etc.) en la informacion disponible.
- Compatibilidad con GPUs consumer: no confirmada. El requisito de kernels NVFP4 nativos limita el despliegue a arquitecturas Blackwell; no se documenta soporte en RTX 4090 (Ada Lovelace) ni en generaciones anteriores.
- Opciones de despliegue: SGLang es el unico runtime documentado por el autor, con el comando `sglang serve --trust-remote-code`. No se menciona soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor menciona que la decodificacion especulativa con la cabeza MTP puede usarse, pero advierte que la tasa de aceptacion puede diferir de la del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead (este) | 19,2 B (nominal 27B) | 262.144 | NVFP4 + FP8 + BF16 | Apache-2.0 | Requiere GPU Blackwell; sin benchmarks publicados |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | No disponible | No disponible | BF16 (presumiblemente) | Apache-2.0 | Modelo base abliterado sin cuantizar; mayor huella de memoria |
| Qwen/Qwen3.8-27B | No disponible | No disponible | BF16 (presumiblemente) | Apache-2.0 | Modelo original con rechazos y guardrails intactos |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros estructurales y licencia.

## Limitaciones y advertencias
- Modelo sin censura: la abliteracion elimino el comportamiento de rechazo del modelo base. No hay guardrails de seguridad y el modelo respondera a peticiones que el original declina. La responsabilidad sobre el uso y los filtros recae en el desplegador.
- Riesgo de alucinacion: el autor advierte que el modelo puede producir texto inexacto, sesgado o danino, igual que el modelo base, pero sin la capacidad de rechazar la peticion.
- Calibracion solo en ingles: la cuantizacion se calibro con texto de noticias en ingles (`cnn_dailymail`). La calidad en codigo, matematicas y otros idiomas puede degradarse mas que en prosa inglesa.
- Vision calibrada solo con texto: la torre de vision no esta cuantizada, pero las capas de lenguaje se calibraron solo con texto, lo que puede afectar al rendimiento en tareas multimodales.
- Restriccion de hardware: el formato NVFP4 requiere GPUs NVIDIA Blackwell con kernels nativos; no se documenta compatibilidad con otras arquitecturas.
- Sin benchmarks: no hay resultados publicados que permitan evaluar la perdida de calidad frente al modelo base sin cuantizar.
- Uso comercial: la licencia Apache-2.0 permite uso comercial, pero el caracter uncensored del modelo puede implicar obligaciones regulatorias adicionales segun la jurisdiccion.
- Decodificacion especulativa: la cabeza MTP se copio sin cambios del checkpoint de huihui-ai; la tasa de aceptacion puede diferir de la del modelo original, aunque los outputs no cambian.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/iQlusion/Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA ModelOpt: https://github.com/NVIDIA/Model-Optimizer
- SGLang: https://github.com/sgl-project/sglang
- Cookbook de SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Paper de abliteracion (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
