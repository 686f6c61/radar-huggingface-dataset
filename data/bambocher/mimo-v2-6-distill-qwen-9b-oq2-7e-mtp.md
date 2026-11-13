# bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2.7e-mtp

## Resumen

MiMo-V2.6-Distill-Qwen-9B-oQ2.7e-mtp es una cuantizacion mixta del modelo bambocher/MiMo-V2.6-Distill-Qwen-9B, un modelo destilado de 9.653 millones de parametros construido sobre la arquitectura Qwen3.5. La cuantizacion la ha realizado el usuario bambocher mediante la herramienta oQ (oMLX v0.7.3), que aplica precision mixta por capas en lugar de una cuantizacion uniforme, logrando un promedio efectivo de 4,123 bits por peso sobre el checkpoint completo.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (8.954B parametros), un codificador de vision (0.456B) y una cabeza MTP (Multi-Token Prediction, 0.243B). Esta ultima permite decodificacion especulativa nativa, lo que resulta especialmente relevante en un checkpoint tan comprimido. El resultado ocupa 4,974 GB en disco (4,633 GiB), lo que lo hace viable en equipos con memoria unificada modesta.

La relevancia de esta publicacion es doble: por un lado, demuestra que es posible mantener un modelo multimodal de casi 10B parametros en menos de 5 GB combinando cuantizacion de 2 a 8 bits selectiva; por otro, el formato MLX lo orienta especificamente al ecosistema Apple Silicon. No obstante, la model card es extremadamente escueta y no documenta procedencia de datos, licencia ni evaluacion, lo que limita su uso en produccion sin verificacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (tag `qwen3_5`), con modulo de vision y cabeza MTP |
| Parametros totales | 9.653.104.368 (9,653B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 2-bit (g64), 3-bit (g64 y g128), 4-bit (g64), 5-bit (g64), 8-bit (g64) y BF16; promedio 4,123 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `mlx`) |

Desglose de almacenamiento por componente:

| Componente | Parametros logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954B | 3,611 GiB |
| Vision | 0,456B | 0,849 GiB |
| Cabeza MTP | 0,243B | 0,172 GiB |
| Total | 9,653B | 4,633 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5, segun el tag `qwen3_5` del repositorio. El checkpoint incluye un tower de vision (0,456B parametros) que lo convierte en un modelo multimodal, y una cabeza MTP de 0,243B parametros. La MTP es una tecnica de entrenamiento que predice varios tokens futuros simultaneamente y que, en inferencia, se aprovecha como decodificacion especulativa para acelerar la generacion.

El modelo base es un destilado (`Distill`) del MiMo-V2.6 original, aunque la model card no especifica el profesor, el volumen de tokens de destilacion, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se documenta el contexto maximo ni la tokenizer. La cuantizacion se ha realizado con oQ (oMLX v0.7.3) aplicando precision mixta por capas: las capas mas sensibles retienen 5 bits o BF16 (5,083% de los pesos en BF16), mientras que el grueso del modelo se comprime a 3 bits (46,116% en 3-bit g128 y 10,537% en 3-bit g64).

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Qwen3.5.
- Procesamiento de imagenes mediante el tower de vision incluido (0,456B parametros).
- Decodificacion especulativa nativa gracias a la cabeza MTP, que puede acelerar la generacion frente a decodificacion autoregresiva estandar.
- Destilacion de conocimiento: al ser un modelo `Distill`, se espera un comportamiento alineado con el modelo profesor, aunque no se documenta cual es.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el checkpoint ocupa 4,633 GiB y usa el formato MLX, por lo que puede cargarse en equipos con 16 GB de memoria unificada o superior, dejando margen para el contexto y el KV cache.
- Prototipado de asistentes multimodales en local: el tower de vision permite procesar imagenes junto a texto sin depender de APIs externas, util para demos y pruebas de concepto de captioning o VQA.
- Evaluacion de tecnicas de cuantizacion: el repositorio documenta con detalle la distribucion de bits por capa, lo que lo convierte en un caso de estudio para comparar precision mixta frente a cuantizacion uniforme en modelos de ~10B.
- Generacion de texto asistida con baja huella de memoria: para aplicaciones de escritorio o embebidas donde el presupuesto de RAM es limitado y no se requiere maxima calidad.
- Experimentacion con decodificacion especulativa: la cabeza MTP incluida permite medir el speedup de la prediccion multi-token en MLX frente a generacion token a token.
- Fine-tuning o adaptacion posterior: al conservar un 5,083% de pesos en BF16 y capas de 5 bits, sirve como punto de partida para LoRA sobre las capas de mayor precision, aunque requiere verificar la compatibilidad con MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint pesa 4,633 GiB; en inferencia hay que sumar KV cache y buffers, por lo que se recomienda un minimo de 8 GB de memoria unificada o VRAM, y 16 GB para contextos largos.
- GPU recomendadas: al estar en formato MLX, el destino natural son los chips Apple M1/M2/M3/M4 (Pro, Max y Ultra). No es un checkpoint pensado para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 16 GB o mas de memoria unificada. En GPUs NVIDIA consumer (RTX 3060 12 GB, RTX 4070, RTX 4090) requeriria conversion previa a otro formato, ya que MLX no se ejecuta sobre CUDA.
- Opciones de despliegue: `mlx-lm` y el ecosistema oMLX son las vias naturales. vLLM, llama.cpp, Ollama y TGI no soportan MLX de forma nativa; seria necesario reconvertir los pesos.
- Latencia y throughput: no disponible en la informacion proporcionada. La cabeza MTP deberia reducir la latencia por token, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-oQ2.7e-mtp | 9,653B | no disponible | Mixta 2-8 bits + BF16 (4,123 b/p) | no disponible | safetensors MLX |
| MiMo-V2.6-Distill-Qwen-9B (base) | 9,653B | no disponible | BF16 (presumiblemente) | no disponible | safetensors |
| Qwen3.5 9B (referencia de familia) | ~9B | no disponible | Multiples | no disponible | safetensors, GGUF |

La comparativa con alternativas de la misma categoria no puede completarse con rigor porque la informacion proporcionada no incluye datos de rendimiento, contexto ni licencia de ninguno de los modelos. El unico eje comparable con certeza es el tamano en disco: esta version ocupa 4,633 GiB frente a los aproximadamente 19 GB que ocuparia el mismo modelo en BF16, una reduccion de en torno al 75%.

## Limitaciones y advertencias

- La cuantizacion agresiva a 2 y 3 bits en el 78% de los pesos puede degradar la calidad respecto al modelo base, especialmente en tareas de razonamiento y matematicas; no se aportan evaluaciones que cuantifiquen la perdida.
- La model card no documenta licencia, lo que impide determinar si el uso comercial esta permitido. Es imprescindible contactar con el autor o consultar el modelo base antes de cualquier despliegue en produccion.
- No se especifican idiomas soportados ni longitud de contexto, dos datos criticos para planificar el despliegue.
- Riesgo de alucinacion: inherente a los modelos destilados y agravado por la cuantizacion; no hay evaluaciones de fidelidad publicadas.
- Sesgos conocidos: no disponibles. Al desconocerse el dataset de entrenamiento y destilacion, no se puede evaluar la composicion ni los sesgos potenciales.
- Dependencia del ecosistema MLX: el checkpoint no es portable directamente a CUDA sin reconversion, lo que limita su uso fuera de Apple Silicon.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.
- El tag `mtp` sugiere que la cabeza de prediccion multi-token esta incluida, pero no se documenta como activarla ni que ganancia real aporta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B-oQ2.7e-mtp
- Modelo base: https://huggingface.co/bambocher/MiMo-V2.6-Distill-Qwen-9B
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
