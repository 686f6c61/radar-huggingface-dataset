# sevren-ai/Embla1-4bit

## Resumen

Embla1-4bit es el checkpoint cuantizado a 4 bits en formato MLX del modelo Embla 1, desarrollado por sevren-ai. Se trata de un modelo de lenguaje de arquitectura mixta de expertos (MoE) disenado especificamente para ejecutarse en telefonos moviles, en concreto en iPhone y Macs con Apple Silicon. El repositorio contiene los pesos exactos que utiliza la build movil, cuantizados con un esquema afino de 4 bits (group size 64, escalas y sesgos en bf16).

El modelo declara 10.000 millones de parametros totales, de los cuales 3.000 millones corresponden a parametros de tipo "engram" (una tabla de memoria asociativa externa), con 1.000 millones de parametros activos por token. La longitud de contexto es de 256.000 tokens (262.144), lo que lo situa en la liga de los modelos de contexto largo. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este lanzamiento radica en dos factores: por un lado, el entrenamiento consciente de cuantizacion (QAT) especificamente para el formato de 4 bits, lo que implica que el checkpoint no es una compresion posterior sino el objetivo real del post-entrenamiento; por otro lado, la inclusion de un runtime propio (embla-metal) optimizado para Metal en iPhone y Apple Silicon, que mapea en memoria los pesos cuantizados y lee la tabla engram desde almacenamiento. No obstante, la informacion publica disponible es muy limitada: no hay datos de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con tabla engram (model_type: embla) |
| Parametros totales | 10B declarados (6.967.751.584 en safetensors) |
| Parametros activos | 1B por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | 4-bit affine, group size 64, escalas y sesgos bf16; tabla engram con escalas fp16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX, uint32 empaquetado 8 codigos de 4 bits por palabra) |

## Arquitectura y entrenamiento

Embla 1 es un transformer de mezcla de expertos (MoE) con 96 expertos enrutados por capa, almacenados como dos stacks (`mlp.experts_fc` con forma `[E, f, d]` y `mlp.experts_proj` con forma `[E, d, f]`). Ademas de los expertos, el modelo incorpora una tabla engram de 23.488.192 filas x 128 dimensiones, que actua como memoria asociativa externa leida desde almacenamiento en el runtime movil. Los routers, sesgos de expertos, ganancias de normalizacion, queries de AttnRes y la convolucion del engram permanecen en bf16, mientras que el resto de pesos se cuantiza a 4 bits.

El post-entrenamiento se realizo con quantization-aware training (QAT) especificamente para el formato de 4 bits, de modo que el checkpoint bf16 (`sevren-ai/Embla1-bf16`) se cuantiza con round-to-nearest para producir estos pesos, que son los que el entrenamiento tenia como objetivo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La definicion autoritativa de las matematicas del modelo es la release de transformers en bf16, ya que mlx-lm no soporta actualmente el tipo `embla` y este checkpoint no carga mediante `mlx_lm.load`.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y generacion de texto general, segun la model card.
- Soporte de contexto largo de hasta 256K tokens.
- Ejecucion en dispositivos moviles mediante el runtime embla-metal.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en iPhone: el modelo esta disenado para ejecutarse en telefonos con el runtime embla-metal, que mapea en memoria los pesos de 4 bits y lee la tabla engram desde almacenamiento. Se usaria para conversaciones multi-turno directamente en el dispositivo, sin conexion a la nube.
- Procesamiento de documentos largos en el dispositivo: con 256K tokens de contexto, el modelo puede ingerir documentos extensos, contratos o transcripciones completas en una sola pasada, algo inusual en modelos que caben en un telefono.
- Aplicaciones de privacidad estricta: al ejecutarse localmente en Apple Silicon, los datos del usuario no salen del dispositivo, lo que lo hace adecuado para asistentes personales, notas o correo con requisitos de confidencialidad.
- Prototipado en Macs con Apple Silicon: el checkpoint MLX se puede usar en Mac para desarrollo y evaluacion antes de desplegar en iPhone, aprovechando el mismo formato de pesos y el runtime embla-metal.
- Investigacion sobre cuantizacion QAT: al ser un modelo entrenado especificamente para 4 bits, sirve como referencia para estudiar el impacto del QAT en modelos MoE de ~10B parametros.
- Integracion en pipelines de generacion de texto en local: mediante la libreria MLX en entornos Apple, para tareas de resumen, reescritura o clasificacion de texto sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 5,6 GB en formato 4-bit, por lo que la huella de pesos es de aproximadamente 5,6 GB; a ello hay que sumar la tabla engram y las activaciones, no cuantificadas en su totalidad.
- GPU recomendadas: Apple Silicon (iPhone y Macs con Metal) segun el runtime embla-metal; no se mencionan GPUs NVIDIA.
- Cabe en consumer GPU: no disponible; el objetivo declarado es movil y Apple Silicon, no GPUs de escritorio convencionales.
- Opciones de despliegue: embla-metal (runtime propio para iPhone y Mac), MLX; mlx-lm no soporta actualmente el tipo `embla`, por lo que `mlx_lm.load` no funciona con este checkpoint.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (MoE de ~10B con contexto de 256K y despliegue movil), ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- Riesgo de alucinacion: no cuantificado; al no haber benchmarks publicados, no se puede estimar su fiabilidad en tareas factuales.
- Idiomas soportados: no disponibles; no se puede confirmar el soporte de castellano ni de otros idiomas.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero no se ofrece garantia alguna sobre el comportamiento del modelo.
- El checkpoint no carga mediante `mlx_lm.load`; requiere el runtime embla-metal o la release de transformers en bf16 como referencia.
- La cuantizacion de la tabla engram usa escalas fp16; recuperar la fila entrenada exacta requiere convertir escala y sesgo a fp32, desquantizar y redondear a bf16, ya que usar `mx.dequantize` en fp16 produce un paso bf16 de desviacion en un pequeno porcentaje de valores.
- El numero de parametros en safetensors (6.967.751.584) no coincide con los 10B declarados en la model card; la discrepancia no se explica en la informacion disponible.
- El modelo esta pensado para el formato de 4 bits; usar otra precision puede degradar el rendimiento respecto al objetivo de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/sevren-ai/Embla1-4bit
- Checkpoint bf16: https://huggingface.co/sevren-ai/Embla1-bf16
- Runtime embla-metal: https://github.com/sevren-ai/embla-metal
