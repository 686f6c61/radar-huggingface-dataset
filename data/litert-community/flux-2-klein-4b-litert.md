# litert-community/FLUX.2-klein-4B-LiteRT

## Resumen

FLUX.2-klein-4B-LiteRT es la conversión a LiteRT (el runtime on-device de Google, antes conocido como TensorFlow Lite) del modelo de difusión FLUX.2 [klein] 4B de Black Forest Labs, publicado bajo licencia Apache-2.0. Lo relevante no es el modelo en sí, sino el empaquetado: el pipeline completo (encoder de texto Qwen3-4B, DiT de flujo rectificado de 4B y VAE) se exporta como grafos LiteRT con cuantización INTEGER-int8 (cómputo int×int, la ruta que realmente ejecuta el delegado GPU) y se trocea en grafos residentes uno a la vez, de modo que el pico de memoria es un único grafo de ~912 MB en lugar de los 6,2 GB totales.

El modelo base, klein, es un modelo de difusión con destilación por pasos (step-wise distilled), lo que simplifica el bucle de muestreo: 4 pasos, sin classifier-free guidance (una sola pasada del DiT por paso en vez de dos) y sin cambio de signo, solo una actualización Euler de flow-matching `latents += dsigma[step] * noise_pred`. La model card indica que el modelo original "runs on consumer GPUs, with as little as 13 GB VRAM"; esta conversión lo lleva a la GPU Mali-G715 de un Pixel 8a, que no tiene VRAM dedicada.

La relevancia actual es que demuestra generación **y edición** de imágenes completamente en un teléfono, con fidelidad numérica verificada frente al pipeline fp32 de `diffusers`: PSNR 36,8 dB / corr 0,9987 en generación y PSNR 44,3 dB / SSIM 0,9998 en edición, a 256×256 y 4 pasos. El repo ocupa 16,0 GB y acumula 12.309 descargas y 11 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion: encoder de texto Qwen3-4B (hidden states de capas 9/18/27, intercaladas a 7680 canales) → DiT de flujo rectificado (double-stream + single-stream blocks) → VAE decoder; exportado como grafos LiteRT `CompiledModel` |
| Parametros totales | DiT 4B + encoder de texto 4B (VAE no especificado en detalle); repo de 16,0 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; el encoder procesa prompts con secuencia de texto de 512 tokens (`txt[1,512,7680]`) |
| Tipos de cuantizacion | INTEGER-int8 (int×int); la cuantizacion weight-only-FLOAT no es viable porque cuelga la compilacion GPU. Tabla de embeddings del tokenizer en fp16 (778 MB, `qwen_embed_fp16.bin`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Grafos LiteRT/TFLite (`.tflite`); tokenizer y embeddings en ficheros binarios (`qwen_vocab.txt`, `qwen_merges.txt`, `qwen_special.txt`, `qwen_embed_fp16.bin`); tensores de E/S en float32 little-endian, row-major |

## Arquitectura y entrenamiento

El pipeline consta de tres etapas: un encoder de texto Qwen3-4B, un DiT de flujo rectificado de 4B y un VAE. La particularidad del condicionamiento es que klein no usa un embedding pooled, sino los hidden states de Qwen3-4B en las capas 9, 18 y 27, intercalados hasta 7680 canales; por eso la conversión incluye el encoder de texto completo y no existe un sustituto más pequeño que encaje. El DiT se organiza en bloques double-stream (3 + 2) y single-stream (20, en 4 chunks de 5), con modulación adaLN continua y una proyección final.

El modelo base es step-wise distilled, lo que permite 4 pasos de muestreo sin CFG. En la exportación, el DiT de 4B y el encoder de 4B superan tanto el límite de carga de flatbuffer de 2 GB de LiteRT como el presupuesto de GPU de un teléfono, así que se dividen en chunks residentes de uno en uno: `ke_enc0/1/2` (912 MB cada uno, capas 1-9 / 10-18 / 19-27 de Qwen3), `kc_prep` (166 MB), `kc_double0/1` (739 / 492 MB), `kc_single0..3` (615 MB cada uno), `kc_final` (19 MB) y `kv_vae` (50 MB). Para edición se reexportan los mismos ocho grafos con la secuencia conjunta ampliada de 768 a 1024 tokens (`kce_*`, tamaños byte-idénticos) más `kv_vae_enc` (35 MB). Tokenización, `embed_tokens`, máscaras causal+padding, tablas rotatorias, scheduler y permutaciones finales corren en el host.

La edición es nativa: `Flux2KleinPipeline.__call__` toma `image` como primer argumento y el text-to-image es el caso `image=None`. La imagen de referencia se codifica con el VAE y sus latentes se concatenan a los del ruido en cada paso, separados en el eje rotatorio `T` (ruido `T = 0`, referencia i-ésima `T = 10 + 10·i`), conservando solo la mitad del ruido en la predicción. La model card no detalla el dataset de entrenamiento, el número de tokens ni si hubo RLHF/DPO en el modelo original.

## Capacidades

- Generación de imágenes text-to-image completamente on-device, con prompt editable por el usuario (no horneado en los grafos).
- Edición de imágenes nativa: transformaciones guiadas por prompt sobre una imagen de referencia (por ejemplo, "turn the apple into a green apple").
- Muestreo eficiente en 4 pasos sin classifier-free guidance, con una sola pasada del DiT por paso.
- Tokenización fiel: port de `Qwen2Tokenizer` verificado byte a byte contra Python mediante fixtures.
- Búsqueda de embeddings en tabla fp16 mapeada en memoria (GATHER en host, no en GPU).
- Ejecución por chunks con footprint pico de un único grafo de ~912 MB.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Generación de imágenes en aplicaciones móviles Android sin conexión: el pipeline corre entero en la GPU Mali-G715 de un Pixel 8a, de modo que una app puede generar imágenes a 256×256 en 4 pasos sin enviar datos a la nube; útil para privacidad y para escenarios sin conectividad.
- Edición fotográfica local en el dispositivo: dado que klein es nativamente un modelo de edición, una app de retoque puede aplicar instrucciones en lenguaje natural sobre una foto del usuario (cambiar color de objetos, sustituir elementos) codificando la referencia con `kv_vae_enc` y concatenando sus latentes, con un coste end-to-end solo ~7 % superior al de generación.
- Prototipado de features de IA generativa en móvil: el empaquetado por chunks y la tabla de embeddings mapeada en memoria sirven de referencia para llevar otros pipelines de difusión a LiteRT respetando el límite de flatbuffer de 2 GB.
- Demostraciones y pruebas de campo sin GPU dedicada: permite validar prompts y calidad visual en hardware de gama media (Pixel 8a) antes de escalar a servidor, comparando contra el pipeline fp32 de `diffusers` con métricas objetivas (PSNR, SSIM, correlación).
- Aplicaciones de accesibilidad o creatividad con latencia tolerable: con 306 s por imagen a 256×256 y 4 pasos en Pixel 8a, encaja en flujos asíncronos (generación en segundo plano, previsualización por lotes) más que en interacción en tiempo real.
- Investigación en cuantización on-device: el repo documenta que la cuantización weight-only-FLOAT cuelga la compilación GPU y que INTEGER-int8 es la ruta funcional, lo que lo convierte en banco de pruebas para estudiar compromisos de precisión y compilación en delegados GPU móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GenEval, etc.) en la información disponible. La model card sí reporta métricas de fidelidad frente al pipeline fp32 de `diffusers` y tiempos medidos en Pixel 8a (Mali-G715):

| Metrica | Resultado |
|---|---|
| Generacion, fidelidad vs fp32 (256×256, 4 pasos) | PSNR 36,8 dB / corr 0,9987 |
| Edicion, fidelidad vs fp32 (256×256, 4 pasos) | PSNR 44,3 dB / SSIM 0,9998 |
| Tiempo de generacion en Pixel 8a | 306 s (256×256, 4 pasos) |
| Tiempo de edicion en Pixel 8a | 328–369 s |
| Coste de edicion vs generacion | RSS pico +2 %, tiempo GPU por paso 1,6×, compilacion de shaders 1,0–1,2×, end-to-end ~+7 % |
| Fidelidad de conversion `litert_torch.convert` (referencia general) | 4e-7 frente al original en Galaxy S26 (LiteRT 2.2.0, Android 16) |
| Tokenizacion + embedding de un prompt | ~1 s |

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato y despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-LiteRT (esta ficha) | DiT 4B + encoder 4B | 256×256, 4 pasos | Grafos LiteRT int8, on-device (Mali-G715) | Apache-2.0 | Pico de ~912 MB por chunk; edicion nativa |
| FLUX.2 [klein] 4B (original) | DiT 4B + encoder 4B | No disponible en detalle | Pesos `diffusers`/PyTorch, GPU de consumo | Apache-2.0 | Requiere desde 13 GB de VRAM segun la model card |
| Alternativas on-device de difusion | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Resolución limitada a 256×256 en los grafos publicados; no se documentan otras resoluciones.
- Latencia alta en móvil: 306 s por imagen y 328–369 s por edición en Pixel 8a, no apta para interacción en tiempo real.
- La cuantización weight-only-FLOAT no funciona: cuelga la compilación del delegado GPU; solo la ruta INTEGER-int8 es operativa.
- El límite de flatbuffer de 2 GB de LiteRT obliga a trocear el modelo; el pipeline depende de la orquestación por chunks y de trabajo en host (tokenización, máscaras, tablas rotatorias, scheduler), lo que complica la integración.
- El condicionamiento exige los hidden states de Qwen3-4B en capas 9/18/27: no hay encoder de texto más pequeño que sustituya al de 4B.
- La edición requiere reexportar los grafos con secuencia conjunta de 1024 tokens (`kce_*`) y un VAE encoder adicional; no reutiliza directamente los grafos de generación.
- El VAE encoder tuvo que reescribirse porque `DiagonalGaussianDistribution.mode()` usa `SPLIT`, operación prohibida en la ruta de compilación.
- No se documentan sesgos, tasas de alucinación visual ni cobertura de idiomas del prompt; la información disponible no permite evaluarlos.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes (Qwen3-4B, VAE) por separado.
- Los tiempos y métricas proceden de un único dispositivo (Pixel 8a, Mali-G715); el rendimiento en otros SoC puede diferir sustancialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/FLUX.2-klein-4B-LiteRT
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Medición de fidelidad de LiteRT en Android (repo de benchmarks): https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- LiteRT (runtime on-device de Google): no disponible enlace directo en la informacion proporcionada
- `litert-torch` (conversor de PyTorch): no disponible enlace directo en la informacion proporcionada
- Paper, blog o demo oficial: no disponible en la informacion proporcionada
