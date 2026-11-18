# huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF es una variante "abliterated" (sin rechazos) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario huihui-ai. El proceso de abliteration elimina la direccion de activacion asociada a las respuestas de rechazo, de modo que el modelo deja de negarse a responder a determinadas peticiones que el modelo original filtraria. Se distribuye en formato GGUF, lo que lo hace directamente ejecutable con llama.cpp y compatible con el pipeline image-text-to-text (entrada de imagen y texto).

El modelo hereda la arquitectura del Qwen3.6-35B-A3B original: un transformer con mezcla de expertos (MoE) de 35.505.251.456 parametros totales, de los cuales solo una fraccion se activa por token (el sufijo A3B indica aproximadamente 3.000 millones de parametros activos). Incorpora ademas soporte MTP (multi-token prediction), utilizado para decodificacion especulativa mediante el flag `--spec-type draft-mtp` de llama.cpp, lo que acelera la generacion.

Es relevante para investigadores y desarrolladores que necesitan un modelo multimodal de gran tamano sin las restricciones de rechazo del modelo base, con licencia Apache 2.0 y pesos cuantizados listos para desplegar en hardware de consumo o servidores. El repositorio ocupa 303,5 GB e incluye multiples variantes de cuantizacion, desde UD-IQ1_M hasta BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal (image-text-to-text), con soporte MTP |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (segun denominacion A3B) |
| Longitud de contexto | Hasta 262.144 tokens (segun ejemplo de llama.cpp con `-c 262144`) |
| Tipos de cuantizacion | UD-IQ1_M hasta BF16 (familia GGUF de unsloth) y Q4_K entre otras |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien parcheable sobre variantes GGUF de unsloth) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura transformer con mezcla de expertos: 35.505 millones de parametros totales con aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano. Es multimodal (pipeline image-text-to-text), por lo que procesa imagenes y texto de forma conjunta. La variante aqui descrita anade soporte MTP (multi-token prediction), que permite decodificacion especulativa con un borrador interno y acelera la generacion en llama.cpp.

Sobre el entrenamiento original (numero de tokens, composicion del dataset, fases de RLHF/DPO) no se proporciona informacion en la documentacion disponible. La modificacion de huihui-ai consiste en una abliteration: se calcula la direccion de activacion responsable de los rechazos y se proyecta fuera de los pesos, sin usar TransformerLens (implementacion descrita como prueba de concepto cruda). Ademas se ofrece un parche (`patch-unsloth`) que aplica la abliteration sobre cualquier cuantizacion GGUF de unsloth/Qwen3.6-35B-A3B, desde UD-IQ1_M hasta BF16, ahorrando espacio de almacenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de imagenes junto con texto (image-text-to-text).
- Razonamiento y respuesta a instrucciones heredadas del modelo base Qwen3.6.
- Decodificacion especulativa mediante MTP (`--spec-type draft-mtp --spec-draft-n-max 6`).
- Ejecucion local con llama.cpp (llama-cli, llama-mtmd-cli, llama-server).
- Ausencia de rechazos por alineacion de seguridad (comportamiento "uncensored").
- Soporte de contexto largo (hasta 262.144 tokens en la configuracion de ejemplo).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: permite estudiar que tipos de contenido genera un modelo sin capa de rechazo y comparar con el modelo base, en entornos controlados.
- Evaluacion de robustez de filtros: usar el modelo como generador adversarial para probar clasificadores de contenido y sistemas de moderacion propios.
- Despliegue local multimodal: con llama.cpp y cuantizaciones Q4_K o inferiores, se puede ejecutar en estaciones de trabajo con GPU consumer para tareas de descripcion de imagenes y dialogo.
- Generacion de texto creativo sin restricciones tematicas: util en entornos de escritura experimental donde el modelo base rechazaria ciertos temas.
- Pruebas de rendimiento de decodificacion especulativa: el soporte MTP permite medir ganancias de throughput frente a decodificacion autoregresiva estandar en llama.cpp.
- Prototipado de asistentes conversacionales de contexto largo: con 262.144 tokens de ventana se pueden procesar documentos extensos o historiales de conversacion largos.
- Analisis de documentos con imagenes en pipelines de investigacion: extraccion y descripcion de contenido visual combinado con texto en entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; depende de la cuantizacion. Las variantes UD-IQ1_M y Q2 reducen drasticamente el peso, mientras que BF16 requiere almacenar los 35.505 millones de parametros completos (unos 71 GB en pesos de 16 bits).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, las cuantizaciones bajas pueden caber en GPUs consumer de 24 GB (RTX 3090/4090) y las altas requieren A100/H100 o multiples GPUs.
- Cabe en GPU consumer: probablemente en cuantizaciones IQ1_M a Q4 con GPUs de 24 GB o mas, aunque el dato no esta confirmado en la documentacion.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli, llama-server) con compilacion CUDA (`-DGGML_CUDA=ON`); tambien es parcheable sobre variantes GGUF de unsloth. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles; el uso de MTP con `--spec-draft-n-max 6` esta pensado para mejorar la velocidad de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF | 35,5 B totales / ~3 B activos | Hasta 262.144 | Apache 2.0 | GGUF | Sin rechazos, multimodal, MTP |
| Qwen/Qwen3.6-35B-A3B (base) | 35,5 B totales / ~3 B activos | No disponible | Apache 2.0 | Safetensors (original) | Con alineacion de seguridad estandar |
| unsloth/Qwen3.6-35B-A3B-GGUF | 35,5 B totales / ~3 B activos | No disponible | Apache 2.0 | GGUF (UD-IQ1_M a BF16) | Cuantizaciones del base, sin abliteration |

## Limitaciones y advertencias

- El filtrado de seguridad esta practicamente eliminado: puede generar contenido sensible, controvertido o inapropiado.
- No es adecuado para audiencias generales, menores ni aplicaciones que exijan alta seguridad.
- El autor recomienda uso exclusivo en investigacion, pruebas o entornos controlados, evitando produccion o aplicaciones comerciales de cara al publico.
- Riesgo elevado de alucinacion y de respuestas no verificadas, agravado por la ausencia de rechazos.
- La abliteration se describe como una implementacion cruda de prueba de concepto; puede degradar capacidades del modelo base.
- Idiomas soportados no documentados; el rendimiento fuera de los idiomas del base no esta garantizado.
- Aunque la licencia es Apache 2.0, el usuario asume toda la responsabilidad legal y etica sobre el contenido generado.
- Se recomienda monitorizacion en tiempo real y revision manual de las salidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Repositorio de abliteration de referencia: https://github.com/Sumandora/remove-refusals-with-transformers
- Cuantizaciones GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Parche patch-unsloth: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated-MTP-GGUF/tree/main/patch-unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Ko-fi del autor: https://ko-fi.com/huihuiai
