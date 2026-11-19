# litert-community/Z-Image-Turbo-LiteRT

## Resumen
Z-Image-Turbo-LiteRT es la conversión a LiteRT (el runtime on-device de Google, antes TensorFlow Lite) del modelo de generación de imágenes Z-Image-Turbo de Alibaba Tongyi-MAI. El modelo original es un Diffusion Transformer de una sola corriente (S3-DiT) de 6.000 millones de parámetros, publicado bajo licencia Apache-2.0, y esta versión lo empaqueta en grafos TFLite con cuantización INT8 capaces de ejecutar la generación completa de una imagen en la GPU de un teléfono móvil de gama media-alta.

La relevancia de esta conversión es que demuestra, por primera vez según el autor, que un generador de difusión de 6B puede producir una imagen real en un dispositivo de 8 GB de RAM mediante residencia secuencial por trozos (*chunked sequential residency*). El DiT monolítico de 6 GB supera el límite de carga de ficheros de LiteRT y el presupuesto de memoria de la GPU de un móvil, por lo que se divide en grafos INT8 que se cargan de uno en uno, con una huella pico inferior a 1 GB.

El resultado en el dispositivo iguala la referencia fp32 con un PSNR de 40,4 dB y una correlación de 0,9994, lo que se considera visualmente indistinguible. El repositorio ocupa 9,8 GB e incluye el codificador de texto Qwen3-4B, los módulos de refinado de contexto e imagen, las 30 capas del DiT repartidas en seis ficheros y el decodificador VAE.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Single-Stream Diffusion Transformer (S3-DiT) con codificador de texto Qwen3-4B y VAE |
| Parámetros totales | 6B (modelo base Z-Image-Turbo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt de hasta 64 tokens en el ejemplo a 256 px) |
| Tipos de cuantización | INT8 (INTEGER-compute) en los grafos TFLite; INT4 descartado por el autor (PSNR 18, «garbage») |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`CompiledModel` de LiteRT), grafos INT8 con tensores float32 little-endian row-major |
| Tamaño del repositorio | 9,8 GB |
| Resolución de ejemplo | 256 px, 8 pasos de muestreo |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento
El modelo subyacente es un Diffusion Transformer de una sola corriente (S3-DiT) de 6B parámetros desarrollado por Alibaba Tongyi-MAI. La canalización completa consta de un codificador de texto Qwen3-4B que emite el estado oculto penúltimo (`hidden_states[-2]`) como `cap_feats`, módulos de *embedding* y refinado separados para imagen y contexto, 30 capas S3-DiT, una proyección final con adaLN y un decodificador VAE que transforma un latente `[1,16,32,32]` en una imagen `[1,3,256,256]`.

La conversión se realizó con `litert_torch` (antes `ai-edge-torch`) y divide el DiT en seis grafos `zc_main0..5.tflite` de 866 MB cada uno (cinco capas por grafo), más `zc_final.tflite`, `z_embx.tflite`, `z_refx.tflite`, `z_embc.tflite`, `z_refc.tflite`, `qwen_enc.tflite` (~3,5 GB) y `zvae.tflite` (50 MB). Los tokens refinados de imagen y contexto se unifican en un estado oculto `[1,288,3840]` que se pasa entre trozos; la composición es bit-exacta respecto al DiT monolítico (correlación 1,000000 en escritorio, 0,966 en INT8 on-device frente a FP32-GPU). La máscara de pad, la concatenación x/c, el *classifier-free guidance* y el (un)patchify se ejecutan en el host.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo original.

## Capacidades
- Generación de imágenes texto-a-imagen completamente on-device, sin conexión a red.
- Ejecución en GPU móvil mediante el delegado GPU de LiteRT; todos los grafos salvo el codificador de texto compilan en la GPU.
- Muestreo con *classifier-free guidance* (CFG) y actualización Euler del latente paso a paso.
- Codificación de prompts con tokenizador Qwen2 BPE y `embed_tokens` en el host.
- Resolución de ejemplo de 256 px con 8 pasos de inferencia.
- No se documentan capacidades de tool calling, agentes, visión o audio; el modelo es exclusivamente generativo de imagen.

## Casos de uso
- Generación de imágenes sin conexión en aplicaciones móviles: el modelo produce una imagen completa en la GPU de un Pixel 8a (Mali, 8 GB) sin enviar el prompt a un servidor, lo que resulta adecuado para apps de privacidad estricta.
- Prototipado de funciones creativas en Android: integración mediante `CompiledModel` y el paquete `com.google.ai.edge.litert:litert` para añadir generación de imágenes a apps existentes con las muestras de `google-ai-edge/litert-samples`.
- Demostración de viabilidad de difusión de gran tamaño en hardware de consumo: sirve como referencia técnica para equipos que evalúan si un DiT de 6B cabe en un móvil de 8 GB mediante residencia secuencial por trozos.
- Investigación en cuantización on-device: el repositorio documenta la diferencia de calidad entre INT8 (PSNR 40,4 dB) e INT4 (PSNR 18), útil para estudiar límites de precisión en aceleradores móviles.
- Generación de miniaturas o imágenes de baja resolución en el dispositivo: a 256 px y 8 pasos, el coste es reducido y encaja en flujos de previsualización antes de un refinado en servidor.
- Evaluación de delegados GPU/NPU: el fallo documentado de `qwen_enc.tflite` al compilar en GPU y NPU de un Galaxy S26 permite caracterizar la cobertura de operadores de LiteRT en hardware Snapdragon.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de calidad proporcionados por el autor son métricas de fidelidad de la conversión:

| Métrica | Valor |
|---|---|
| PSNR on-device INT8 vs referencia fp32 | 40,4 dB |
| Correlación on-device INT8 vs referencia fp32 | 0,9994 |
| Correlación composición de trozos (escritorio) | 1,000000 |
| Correlación composición de trozos (on-device INT8/FP32-GPU) | 0,966 |
| PSNR con cuantización INT4 | 18 (descartado) |

## Requisitos de hardware
- Huella pico de memoria: inferior a 1 GB gracias a la carga secuencial de un único grafo a la vez (el mayor es `zc_main*.tflite`, de 866 MB).
- Dispositivo verificado: Pixel 8a con GPU Mali y 8 GB de RAM; también probado en Galaxy S26 (Android 16, LiteRT 2.2.0).
- Almacenamiento: el repositorio completo ocupa 9,8 GB; el codificador de texto por sí solo pesa ~3,5 GB.
- Cómputo en FP32 obligatorio en el delegado GPU: la ruta adaLN/atención desborda fp16 a NaN.
- Es necesario compartir un único `Environment` entre todos los grafos; un `Environment` nulo filtra el contexto OpenCL y aborta tras unas 20 compilaciones FP32.
- `qwen_enc.tflite` no compiló en GPU ni en NPU en Galaxy S26 según el autor.
- Despliegue: LiteRT `CompiledModel` (Kotlin y Python vía `ai_edge_litert.compiled_model`); no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / despliegue | Cuantización | Licencia | On-device |
|---|---|---|---|---|---|
| Z-Image-Turbo-LiteRT | 6B | TFLite (LiteRT) | INT8 | Apache-2.0 | Sí (GPU móvil, 8 GB) |
| Z-Image-Turbo (original) | 6B | PyTorch / safetensors | fp32, fp16 | Apache-2.0 | No documentado |
| Alternativas de difusión on-device de menor tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de generación con otros modelos de la misma categoría.

## Limitaciones y advertencias
- El codificador de texto `qwen_enc.tflite` no compiló en GPU ni en NPU en Galaxy S26; su ejecución en esos aceleradores no está garantizada.
- La ruta adaLN/atención desborda a NaN en fp16: es obligatorio forzar FP32 en el delegado GPU, lo que reduce el rendimiento potencial.
- La cuantización INT4 produce resultados inservibles (PSNR 18); solo INT8 es viable.
- Dos detalles del bucle en host corrompen silenciosamente la imagen si se omiten: la máscara de pad y el hecho de que los prompts cond y uncond difieren en longitud, lo que genera un patrón de malla visible por parche.
- El ejemplo documentado es a 256 px y 8 pasos; no se especifican resultados a resoluciones mayores.
- No hay información sobre sesgos, riesgo de alucinación visual ni cobertura idiomática del codificador de texto.
- La licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Tongyi-MAI/Z-Image-Turbo, que también es Apache-2.0.
- El tamaño del repositorio (9,8 GB) y del codificador de texto (3,5 GB) pueden ser prohibitivos para aplicaciones móviles con presupuesto de almacenamiento ajustado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/litert-community/Z-Image-Turbo-LiteRT
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Muestras de LiteRT: https://github.com/google-ai-edge/litert-samples
- Medición de precisión de LiteRT en Galaxy S26: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
