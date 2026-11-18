# loom-fun-staging/unsloth-gemma-4-26B-A4B-it-qat-loom

## Resumen
El paquete `loom-fun-staging/unsloth-gemma-4-26B-A4B-it-qat-loom` es una distribucion empaquetada para el runtime AMD Loom del checkpoint GGUF cuantizado `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf`, publicado originalmente por Unsloth a partir del modelo Gemma 4 26B A4B instruct con cuantizacion consciente del entrenamiento (QAT). No se trata de un modelo nuevo ni de un fine-tuning: es el mismo GGUF sin modificar, reempaquetado en formato `.loom` (programas y una tarjeta `model.json`) para su despliegue en GPUs AMD concretas.

El objetivo del paquete es ofrecer inferencia lista para usar sobre hardware AMD de consumo y profesional: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Incluye presets de memoria, servidor compatible con la API `/v1/chat/completions` de OpenAI y soporte de tool calling y modo de razonamiento opcional. La relevancia actual radica en que facilita ejecutar un modelo de ~26B parametros con arquitectura MoE (4B activos) en GPUs AMD sin depender de CUDA ni de llama.cpp como servidor.

La informacion disponible es limitada: el repositorio tiene 0 GB de tamano declarado, 0 descargas y no incluye model card propia mas alla de las instrucciones de despliegue. Los datos de rendimiento y las comprobaciones de correccion aparecen como "not yet re-measured" en la propia tarjeta, por lo que muchas especificaciones deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun nomenclatura A4B del modelo base; detalles internos no disponibles |
| Parametros totales | 26B (segun nombre del modelo) |
| Parametros activos | 4B (segun sufijo A4B) |
| Longitud de contexto | 262.144 tokens nativos; 232.448 tokens por peticion en Strix Halo; hasta 32.768 en Radeon AI PRO R9700 |
| Tipos de cuantizacion | Q4_K_XL (UD-Q4_K_XL); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF empaquetado como `.loom` (programas y `model.json`) |
| Modelo base | unsloth/gemma-4-26B-A4B-it-qat-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Servidor | OpenAI-style `/v1/chat/completions` en `127.0.0.1:8080` |
| Concurrencia | 4 peticiones simultaneas |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |

## Arquitectura y entrenamiento
El modelo subyacente es Gemma 4 26B A4B en variante instruct, con arquitectura de mezcla de expertos en la que se activan aproximadamente 4.000 millones de parametros por token sobre un total de 26.000 millones. La cuantizacion QAT (quantization-aware training) implica que el modelo fue entrenado teniendo en cuenta la cuantizacion de 4 bits, lo que en teoria reduce la perdida de calidad respecto a una cuantizacion post-entrenamiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

El paquete Loom no modifica los pesos: genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y ofrece presets de memoria (`--pool_backing=fixed`, `--parameter_mode=preload`) y un modo de espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). La decodificacion especulativa y la entrada de imagen estan presentes en el modelo upstream pero no estan soportadas en este paquete Loom. Las pruebas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`) figuran como no re-medidas.

## Capacidades
- Generacion de texto conversacional multi-turno mediante API compatible con OpenAI.
- Razonamiento opcional: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Soporte de bucles de agente multi-turno con reutilizacion de historial (segun la puerta `agent` de la tarjeta, pendiente de re-medicion).
- Contexto largo: hasta 232.448 tokens por peticion en Strix Halo.
- Concurrencia de 4 peticiones simultaneas.
- Sin soporte de entrada de imagen en este paquete (el upstream si la tiene).
- Sin decodificacion especulativa en este paquete.
- Capacidades de audio y muestreo: no determinadas.

## Casos de uso
- Asistente conversacional local en workstation AMD: desplegar el servidor Loom en una Radeon AI PRO R9700 y consumir `/v1/chat/completions` desde una interfaz interna, aprovechando los 32.768 tokens de contexto que caben en los 32 GB de la GPU.
- Procesamiento de documentos largos en Strix Halo: analisis de contratos, informes o transcripciones de hasta 232.448 tokens por peticion, sin trocear el texto, gracias al contexto extendido del preset.
- Agente con herramientas en pipelines internos: usar el soporte de `tools`/`tool_calls` para encadenar consultas a bases de datos, APIs REST o sistemas de ticketing en un bucle multi-turno.
- Razonamiento asistido bajo demanda: activar `enable_thinking` solo en peticiones que requieran analisis paso a paso (por ejemplo, depuracion de codigo o analisis de datos), manteniendo el modo rapido para el resto.
- Despliegue en hardware AMD sin CUDA: equipos con Ryzen AI Max+ 395 que necesitan un servidor de inferencia local sin GPU NVIDIA, usando `hrx-loom` como runtime.
- Evaluacion y prototipado de modelos MoE: banco de pruebas para comparar el rendimiento de un MoE de 26B/4B activos en GPUs AMD frente a alternativas en llama.cpp, aunque las metricas de este paquete aun no estan publicadas.
- Servicio interno de baja concurrencia: con 4 peticiones simultaneas, adecuado para equipos pequenos o herramientas internas mas que para produccion de alta carga.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La propia tarjeta indica que las comparativas de rendimiento frente a llama.cpp en Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`) figuran igualmente como pendientes de re-medicion.

## Requisitos de hardware
- VRAM estimada: no disponible de forma explicita; el paquete esta disenado para caber en los 32 GB de la Radeon AI PRO R9700 y en la memoria unificada del Ryzen AI Max+ 395.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo AMD distintas de las listadas; no hay datos para GPUs NVIDIA.
- Despliegue: runtime `hrx-loom` (instalacion via `pipx install "hrx-loom[hf]==0.2.0"`), comandos `loom-fetch` y `loom-serve`.
- Contexto maximo por peticion segun hardware: 232.448 tokens en Strix Halo; 32.768 tokens en Radeon AI PRO R9700.
- Latencia y throughput: no disponibles (no re-medidos).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Este paquete (Gemma 4 26B A4B QAT, Loom) | 26B | 4B | 262.144 nativo; 232.448 por peticion en Strix Halo | `.loom` (GGUF Q4_K_XL) | no disponible | Solo GPUs AMD gfx1151/gfx1201; sin vision ni decodificacion especulativa |
| unsloth/gemma-4-26B-A4B-it-qat-GGUF | 26B | 4B | no disponible | GGUF | no disponible | Checkpoint upstream sin empaquetar; compatible con llama.cpp |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias
- Repositorio practicamente vacio en cuanto a documentacion: 0 GB declarados, 0 descargas y sin model card propia mas alla de las instrucciones de despliegue.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar la licencia del modelo base (Gemma) y del checkpoint de Unsloth.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado.
- Sin soporte de vision ni de decodificacion especulativa en este paquete, aunque el modelo upstream las tenga.
- Contexto efectivo reducido en Radeon AI PRO R9700 (32.768 tokens frente a los 262.144 nativos) por limitacion de memoria.
- Concurrencia limitada a 4 peticiones simultaneas y salida maxima de 4.096 tokens por preset.
- Rendimiento y correccion no re-medidos: no hay garantia publicada de paridad con llama.cpp en este paquete.
- Riesgo de alucinacion y sesgos del modelo base: no documentados en la informacion disponible.
- Dependencia de un runtime especifico (`hrx-loom` 0.2.0) y de hardware AMD concreto; no es portable a CUDA sin otro empaquetado.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/loom-fun-staging/unsloth-gemma-4-26B-A4B-it-qat-loom
- Modelo base (GGUF): https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Workflow loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
