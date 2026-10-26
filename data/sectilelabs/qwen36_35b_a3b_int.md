# SectileLabs/qwen36_35b_a3b_int

## Resumen

`SectileLabs/qwen36_35b_a3b_int` es un paquete de pesos cuantizados del modelo Qwen3.6-35B-A3B de Alibaba Qwen, convertido por Sectile Labs al formato propietario `.ginfer` para el motor de inferencia GInfer (y su interfaz GChat). No es un repositorio de safetensors ni un GGUF: es un unico fichero de 20.016.414.464 bytes que solo puede cargar GInfer y que esta pensado para ejecutarse en CPU, en equipos sin tarjeta grafica NVIDIA.

El modelo base es un MoE disperso de 35.000 millones de parametros totales y 3.000 millones activos por token, multimodal (texto e imagen), con 262.144 tokens de contexto nativo y modos de razonamiento thinking y non-thinking. La relevancia de este paquete es que acerca ese modelo a estaciones de trabajo sin GPU mediante una cuantizacion INT (expertos enrutados en enteros de 4 bits groupwise, resto de matrices en enteros de 8 bits groupwise) obtenida por round-to-nearest desde los pesos BF16 oficiales.

Las limitaciones son igual de relevantes: depende por completo de GInfer, no publica benchmarks y, aunque empaqueta la torre de vision, el motor todavia no ejecuta vision. La licencia Apache 2.0 del modelo original se mantiene sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa del modelo base Qwen3.6-35B-A3B; paquete cuantizado INT para el motor GInfer |
| Parametros totales | 35.000 millones (modelo base) |
| Parametros activos | 3.000 millones por token (modelo base) |
| Longitud de contexto | 262.144 tokens nativos (modelo base) |
| Tipos de cuantizacion | INT: expertos enrutados en enteros de 4 bits groupwise; resto de matrices en enteros de 8 bits groupwise; conversion round-to-nearest (RTN) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ginfer` (fichero unico `qwen36_35b_a3b_int_rtn.ginfer`); no es safetensors ni GGUF |
| Tamaño del paquete | 20.016.414.464 bytes (aproximadamente 20,0 GB) |
| Tensor-parallel size | 1 |
| SHA-256 | `daf27aafd5f461f81de9a7fa63b8c3f1e56c3ac42b2da858842275879b90bdfa` |
| Motor compatible | GInfer / GChat exclusivamente (ejecucion en CPU) |
| Revision del modelo base | `995ad96eacd98c81ed38be0c5b274b04031597b0` |
| Fecha de publicacion | 26 de octubre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con mezcla de expertos dispersa: 35.000 millones de parametros totales de los que solo 3.000 millones se activan por token, lo que reduce el coste de computo por paso frente a un modelo denso del mismo tamaño. Incorpora torre de vision (entrada de texto e imagen), 262.144 tokens de contexto nativo y modos diferenciados de razonamiento (thinking y non-thinking) orientados a codificacion agentica.

Sobre el entrenamiento del modelo original no hay datos en la informacion proporcionada: se desconoce el numero de tokens, la composicion del dataset y si se aplicaron etapas de RLHF o DPO. Lo que si esta documentado es el proceso de este paquete: Sectile Labs convirtio los pesos BF16 oficiales (revision `995ad96...`) a INT mediante su propia conversion round-to-nearest, sin usar pesos cuantizados de terceros, y despues los empaqueto en un unico fichero `.ginfer` con tensor-parallel size 1. El paquete incluye los pesos de la torre de vision del modelo original, aunque GInfer no la ejecuta actualmente.

## Capacidades

- Generacion de texto en el modelo base, ejecutada en CPU a traves de GInfer o GChat.
- Razonamiento en dos modos: thinking y non-thinking, heredados de Qwen3.6.
- Codificacion agentica: el blog de Qwen destaca esta capacidad como el principal avance del modelo base frente a su predecesor.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Entrada multimodal de imagen en el modelo original; en este paquete los pesos de vision estan presentes pero GInfer no los ejecuta todavia.
- Capacidades agenticas de multiples pasos: descritas de forma generica para el modelo base; el soporte concreto de tool calling o function calling no se detalla en la informacion disponible.
- Capacidades multilingues: no disponibles en la documentacion de este repositorio.

## Casos de uso

- Inferencia local sin GPU: el paquete esta disenado para ejecutarse en el procesador en equipos sin tarjeta NVIDIA, usando el fichero unico de 20 GB con GInfer.
- Asistencia de codigo en estaciones de trabajo: el modelo base esta optimizado para codificacion agentica, por lo que puede emplearse en tareas de generacion, refactorizacion y explicacion de codigo desde una maquina de desarrollo sin acelerador.
- Analisis de documentos largos: con 262.144 tokens de contexto nativo se pueden procesar contratos, expedientes o bases de codigo extensas en una sola pasada, aunque en CPU la latencia sera alta.
- Despliegue air-gapped: al ser un fichero unico verificable por SHA-256 y no requerir GPU, encaja en entornos con restricciones de red o de hardware grafico.
- Chat local mediante GChat: la interfaz construida sobre GInfer permite conversacion multi-turno en escritorio sin depender de servicios en la nube.
- Evaluacion de cuantizacion INT: util para comparar la calidad de la conversion 4/8 bits de Sectile Labs frente al BF16 o al FP8 oficiales del mismo modelo base.
- Procesamiento por lotes en servidores CPU: tareas de resumen, clasificacion o extraccion de informacion que no requieren baja latencia y pueden ejecutarse en infraestructura sin GPU.
- Prototipado y validacion de modelos MoE: permite probar el comportamiento de un MoE de 35B en hardware convencional antes de invertir en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor del paquete no incluye cifras de MMLU, HumanEval, GSM8K ni de degradacion por cuantizacion. El blog de Qwen afirma que Qwen3.6-35B-A3B supera a su predecesor Qwen3.5-35B en codificacion agentica, pero las cifras concretas no se han proporcionado en esta busqueda.

## Requisitos de hardware

- VRAM: no aplica para este paquete; GInfer lo ejecuta en CPU y no es cargable en runtimes de GPU.
- Memoria del sistema: el fichero de pesos ocupa 20.016.414.464 bytes (aproximadamente 20 GB), por lo que se necesita al menos esa cantidad de RAM; se recomienda margen adicional para el runtime y la cache KV (estimacion no publicada por el autor).
- GPU recomendadas: ninguna para este formato; el paquete esta dirigido expresamente a equipos sin GPU NVIDIA.
- Requisitos de CPU: no se especifican nucleos minimos ni conjuntos de instrucciones (AVX-512, etc.) en la informacion disponible.
- Cabe en hardware de consumo: si, en equipos con 24-32 GB de RAM o superiores, siempre que se use GInfer; no cabe en GPUs de consumo porque el formato no es compatible con otros motores.
- Opciones de despliegue: exclusivamente GInfer y GChat. No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Alternativas con GPU: para usar el mismo modelo base en GPU existen los formatos oficiales BF16 y FP8 (Qwen/Qwen3.6-35B-A3B y Qwen/Qwen3.6-35B-A3B-FP8), ademas de la distribucion en Ollama.
- Latencia y throughput: no disponibles. Al ejecutarse en CPU con 35B de parametros totales, es previsible una latencia alta por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Ejecucion |
|---|---|---|---|---|---|
| SectileLabs/qwen36_35b_a3b_int | 35B / 3B | 262.144 | `.ginfer` INT (4/8 bits) | Apache 2.0 | Solo GInfer/GChat en CPU |
| Qwen/Qwen3.6-35B-A3B (BF16) | 35B / 3B | 262.144 | safetensors BF16 | Apache 2.0 | GPU o CPU con runtimes estandar |
| Qwen/Qwen3.6-35B-A3B-FP8 | 35B / 3B | 262.144 | FP8 | Apache 2.0 | GPU; importable en OCI Generative AI y Modal |
| qwen3.6:35b-a3b (Ollama) | 35B / 3B | 262.144 | Distribucion Ollama (formato no detallado) | Apache 2.0 | Ollama, orientado a hardware local |

Los cuatro comparten el mismo modelo base y licencia; la diferencia practica es el formato y el ecosistema de ejecucion. El paquete de Sectile Labs es el unico pensado para CPU pura, a cambio de quedar atado a GInfer.

## Limitaciones y advertencias

- Formato propietario: el fichero `.ginfer` solo lo carga GInfer/GChat; no se puede convertir ni usar en llama.cpp, vLLM, transformers u Ollama.
- Vision no operativa: aunque el paquete incluye los pesos de la torre de vision, GInfer no ejecuta vision en este modelo, por lo que en la practica es solo texto.
- Calidad de cuantizacion no evaluada: no hay benchmarks que midan la perdida frente a BF16 o FP8; la conversion RTN a 4 bits en los expertos enrutados puede degradar tareas sensibles.
- Idiomas no declarados: se desconoce el soporte real de castellano y de otros idiomas en este paquete.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mecanismos de mitigacion ni evaluaciones de fidelidad.
- Sesgos: no documentados por el autor del paquete ni en la informacion disponible.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni informes independientes.
- Licencia: Apache 2.0 permite uso comercial, pero la practica esta limitada por el formato; el repositorio conserva el texto de licencia upstream y no anade restricciones.
- Contexto en CPU: explotar los 262.144 tokens exige memoria adicional para la cache KV; no se han publicado cifras de memoria ni de rendimiento para esa configuracion.
- Rendimiento en produccion: al no haber datos de latencia ni throughput en CPU, no es posible dimensionar infraestructura con garantias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SectileLabs/qwen36_35b_a3b_int
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen3.6-35B-A3B-FP8 en Modal: https://modal.com/library/qwen/qwen3-6-35b-a3b-fp8
- Importacion en OCI Generative AI: https://docs.oracle.com/en-us/iaas/releasenotes/generative-ai/alibaba-qwen-3-6-35b-a3b-fp8.htm
- Distribucion en Ollama: https://ollama.com/library/qwen3.6:35b-a3b
- Guia de ejecucion local (VRAM y velocidad): https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/
