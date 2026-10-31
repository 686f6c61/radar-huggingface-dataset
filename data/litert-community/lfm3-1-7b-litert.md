# litert-community/LFM3-1.7B-LiteRT

## Resumen

LFM3-1.7B-LiteRT es la conversión del modelo de texto LFM3-1.7B de Liquid AI al formato LiteRT-LM (sucesor de TensorFlow Lite), publicada por el equipo litert-community de Google para su ejecución en dispositivos móviles y edge. El modelo base, LiquidAI/LFM3-1.7B, es un modelo de 1,73 mil millones de parámetros orientado a agentes locales y aplicaciones especializadas que funcionan sin conexión, con soporte de razonamiento en un bloque `<think>` y llamadas a herramientas en formato XML.

La relevancia de esta ficha reside en el rendimiento medido en hardware real: en la GPU de un Galaxy S26 el archivo mixed int4 decodifica 32,42 tokens/s tras un prompt de 1.024 tokens, y en un Pixel 8a alcanza 15,13 tokens/s, cifras que lo hacen viable para asistentes conversacionales y agentes en el dispositivo. La arquitectura híbrida combina convoluciones cortas con puerta (gated short convolutions) y atención deslizante y global, lo que reduce el coste de inferencia frente a un transformer puro.

El repositorio incluye cuatro variantes cuantizadas (mixed int4 e int8, con caché KV de 2.048 y 4.096 tokens) y soporta 16 idiomas, entre ellos el castellano. Liquid AI publica además checkpoints del mismo modelo en GGUF, MLX, ONNX, FP8 y NVFP4 para otras plataformas de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 13 convoluciones cortas con puerta, 5 atenciones sliding-window y 6 atenciones globales (24 capas) |
| Parametros totales | 1,73B |
| Parametros activos | no disponible (arquitectura no MoE; todos los parametros activos) |
| Longitud de contexto | 2.048 o 4.096 tokens (segun variante de caché KV elegida) |
| Tipos de cuantizacion | mixed int4 (MLP gate/up en int4 por bloques de 32; resto int8 por canal) e int8 por canal; activaciones fp16 en GPU |
| Idiomas soportados | 16: en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0, "other") |
| Formato de pesos | .litertlm (LiteRT-LM); el modelo base tambien esta disponible en GGUF, MLX, ONNX, FP8 y NVFP4 |

## Arquitectura y entrenamiento

LFM3-1.7B emplea una arquitectura híbrida de 24 capas que combina 13 bloques de convolución corta con puerta, 5 bloques de atención con ventana deslizante y 6 bloques de atención global. Este diseño reduce la huella de la caché KV y el coste computacional, lo que lo hace especialmente adecuado para inferencia en dispositivos con recursos limitados. El vocabulario tiene 128.000 tokens.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no se han publicado detalles en la información disponible. La conversión a LiteRT-LM se realizó con litert-torch (commit f61d0b7) y litert-lm-builder 0.18.1 para LiteRT-LM 0.18.1. Cada archivo incluye firmas de prefill de 1.024, 256, 64, 16, 4 y 1 tokens, el tokenizer.json original sin modificar, una plantilla de chat, un canal de pensamiento (`<think>` … `</think>`) y un sampler top-k 50 a temperatura 0,1. Por defecto el modelo razona en el bloque `<think>` antes de responder, comportamiento desactivable.

## Capacidades

- Generacion de texto conversacional multi-turno en 16 idiomas, incluido el castellano.
- Razonamiento con canal de pensamiento: emite su cadena de razonamiento dentro de `<think>` … `</think>` antes de la respuesta final (desactivable con `--thinking false` o `ThinkingConfig(enable_thinking=False)`).
- Llamadas a herramientas: escribe tool calls como texto en formato XML propio; la aplicación parsea la llamada y devuelve el resultado como mensaje `tool`.
- Contexto de hasta 4.096 tokens con las variantes ekv4096, adecuado para prompts largos y razonamiento extendido ("long thinking").
- Prefill flexible con firmas de 1 a 1.024 tokens para optimizar el procesado de prompts.
- La model card fuente no lo recomienda para agentic coding ni razonamiento multi-paso complejo.

## Casos de uso

- Asistente conversacional offline en movil: con 32,42 tokens/s en la GPU de un Galaxy S26 y 1,44 GB de peso, cabe en la mayoria de flagships recientes y responde sin conexion, ideal para privacidad y uso en itinerancia.
- Agentes locales con herramientas: el modelo emite tool calls en XML que la app parsea y ejecuta (por ejemplo, consultar el tiempo o la agenda del dispositivo), permitiendo asistentes que actuan sobre el sistema sin enviar datos a la nube.
- Traduccion y redaccion multilingue ligera: con soporte de 16 idiomas (incluidos es, en, zh, ja, ar y hi) sirve para resumir, reescribir o traducir textos cortos en el dispositivo.
- Chatbot embebido en aplicaciones Android/iOS via LiteRT: la API Python de litert-lm y la CLI permiten integrar el motor con backend GPU o CPU directamente en apps.
- Procesado de prompts rapidos con prefill adaptativo: las firmas de prefill de 1 a 1.024 tokens permiten ajustar la latencia del primer token segun la longitud del prompt en tiempo real.
- Razonamiento visible para depuracion y tutoring: el canal `<think>` permite mostrar u ocultar la cadena de razonamiento, util en apps educativas o para auditar respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El repositorio si publica mediciones de rendimiento y fidelidad de la conversion:

| Medicion | Resultado |
|---|---|
| Decodificacion mixed int4, Galaxy S26 GPU (tras prompt de 1.024 tokens) | 32,42 tokens/s |
| Decodificacion int8, Galaxy S26 GPU | 28,86 tokens/s |
| Decodificacion mixed int4, Pixel 8a GPU (ekv4096) | 15,13 tokens/s |
| Decodificacion mixed int4, Galaxy S26 CPU | 35,53 tokens/s |
| Decodificacion int8, Galaxy S26 CPU | 31,06 tokens/s |
| Concordancia top-token con el modelo fuente fp32 (int8, Mac GPU) | 95,7 % de 2.682 posiciones |
| Concordancia top-token con el modelo fuente fp32 (mixed int4, Mac GPU) | 79,9 % |
| Concordancia top-token (int8, Mac CPU) | 88,7 % |
| Concordancia top-token (mixed int4, Mac CPU) | 77,9 % |

## Requisitos de hardware

- Peso del modelo: 1,44 GB (mixed int4) o 1,80 GB (int8) por archivo, mas la caché KV (2.048 o 4.096 tokens). VRAM/memoria estimada total: en torno a 2-3 GB en GPU.
- Dispositivos verificados: Galaxy S26 (GPU y CPU) y Pixel 8a (GPU); en escritorio, Mac con backend Metal.
- Cabe en GPUs moviles de gama alta y en CPUs de smartphones modernos; en escritorio, cualquier GPU con ~2 GB de memoria dedicada o incluso solo CPU es suficiente dado el tamano del modelo.
- Despliegue: LiteRT-LM 0.18.1 (CLI `litert-lm run` o API Python `litert_lm.Engine`), con backends GPU (incluida la ruta Metal en Mac) y CPU. Para otros entornos, usar los checkpoints GGUF (llama.cpp, Ollama), MLX, ONNX, FP8 o NVFP4 del autor original.
- Latencia: no se han publicado mediciones de tiempo hasta el primer token; el throughput de decodificacion esta recogido en la seccion de benchmarks.
- Recomendaciones de la model card: mixed int4 para GPU y para CPU (mas rapido y mas robusto en las preguntas de comprobacion); int8 para maxima fidelidad al modelo fuente en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-1.7B-LiteRT (esta ficha) | 1,73B | 2.048-4.096 | mixed int4 / int8 | lfm1.0 (other) | .litertlm |
| LFM3-1.7B (base, Liquid AI) | 1,73B | no disponible | bf16 / FP8 / NVFP4 / 4-bit | lfm1.0 (other) | safetensors, GGUF, MLX, ONNX |
| Qwen3-1.7B (referencia de categoria) | 1,7B | no disponible en la informacion proporcionada | multiple | Apache 2.0 | safetensors, GGUF |

Nota: la comparativa se limita al modelo base del que deriva esta conversion, ya que no se dispone de datos de benchmarks que permitan comparar rendimiento con otros modelos de 1-2B. La ventaja diferencial de la variante LiteRT es su optimizacion para ejecucion nativa en Android y edge, con mediciones de tokens/s en hardware movil real.

## Limitaciones y advertencias

- La model card fuente desaconseja explicitamente su uso para agentic coding y razonamiento multi-paso complejo.
- La cuantizacion mixed int4 reduce la fidelidad respecto al modelo fuente (79,9 % de concordancia top-token en GPU, 77,9 % en CPU); para maxima fidelidad usar int8 en GPU.
- Las variantes int8 en CPU muestran menor concordancia (88,7 %) y fallaron una de las preguntas de comprobacion (una rima) en las pruebas de la model card.
- El contexto efectivo esta limitado a 2.048 o 4.096 tokens segun el archivo elegido, muy por debajo de los contextos largos habituales en modelos de servidor.
- Licencia lfm1.0 (LFM Open License v1.0): es una licencia "other", no una licencia estandar permisiva; revisar los terminos en el enlace de LICENSE antes de cualquier uso comercial.
- Una instancia de `litert_lm.Engine` corresponde a una conversacion; no reutilizar el motor entre conversaciones simultaneas.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones especificas al respecto en la informacion disponible; aplicar las salvaguardas habituales en produccion.

## Enlaces

- Repositorio LiteRT: https://huggingface.co/litert-community/LFM3-1.7B-LiteRT
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM 1.0: https://huggingface.co/litert-community/LFM3-1.7B-LiteRT/blob/main/LICENSE
- Checkpoint GGUF: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Checkpoint MLX 4-bit: https://huggingface.co/LiquidAI/LFM3-1.7B-MLX-4bit
- Checkpoint ONNX: https://huggingface.co/LiquidAI/LFM3-1.7B-ONNX
- Checkpoint FP8: https://huggingface.co/LiquidAI/LFM3-1.7B-FP8
- Checkpoint NVFP4: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
