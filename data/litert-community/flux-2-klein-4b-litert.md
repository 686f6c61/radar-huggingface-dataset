# litert-community/FLUX.2-klein-4B-LiteRT

## Resumen

FLUX.2-klein-4B-LiteRT es la conversión a LiteRT del modelo de difusión FLUX.2 [klein] 4B de Black Forest Labs, publicada por la comunidad litert-community. Se trata de un modelo texto-a-imagen y edición de imágenes que puede ejecutarse íntegramente en la GPU de un teléfono móvil, sin VRAM dedicada, gracias a la cuantización INTEGER-int8 de todos sus grafos y a una estrategia de carga por fragmentos que mantiene residente un único grafo de aproximadamente 912 MB en lugar de los 6,2 GB totales.

El modelo base es un transformer de difusión (DiT) de flujo rectificado con 4B parámetros, destilado paso a paso, que se apoya en un codificador de texto Qwen3-4B y un VAE. La conversión mantiene la fidelidad numérica del pipeline original: la generación en un Pixel 8a alcanza PSNR 36,8 dB y correlación 0,9987 frente al pipeline fp32 de `diffusers`, y la edición logra PSNR 44,3 dB y SSIM 0,9998.

Su relevancia actual radica en que demuestra que un modelo de imagen de 4B parámetros con capacidades nativas de edición puede desplegarse en hardware de consumo móvil (Mali-G715) con licencia Apache-2.0, abriendo la puerta a aplicaciones de generación y edición de imágenes totalmente locales y privadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) de flujo rectificado con codificador de texto Qwen3-4B y VAE |
| Parametros totales | 4B en el DiT y 4B en el codificador de texto (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de texto; 256 tokens de imagen en generación (768 en secuencia conjunta) y 512 en edición (1024 en secuencia conjunta) |
| Tipos de cuantizacion | INTEGER-int8 (int×int); pesos exportados en grafos LiteRT int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT `CompiledModel` (flatbuffers); tokenizer y embeddings en `qwen_vocab.txt`, `qwen_merges.txt`, `qwen_special.txt` y `qwen_embed_fp16.bin` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de FLUX.2 [klein] 4B: un transformer de difusión de flujo rectificado con atención conjunta entre tokens de imagen y de texto, organizado en bloques double-stream y single-stream. La inferencia es inusualmente simple porque el modelo está destilado paso a paso: 4 pasos de muestreo, sin classifier-free guidance (una sola pasada del DiT por paso en lugar de dos) y sin inversión de signo, aplicando únicamente una actualización Euler de flow matching (`latents += dsigma[step] * noise_pred`).

El condicionamiento de texto no usa un embedding agrupado, sino los estados ocultos de las capas 9, 18 y 27 del codificador Qwen3-4B, intercalados hasta 7680 canales; por eso el codificador completo forma parte del pipeline. La conversión a LiteRT divide el DiT y el codificador en fragmentos que se cargan de uno en uno (pico de ~912 MB), ya que ambos superan el límite de 2 GB de flatbuffer de LiteRT y el presupuesto de GPU de un teléfono. La tokenización, `embed_tokens`, las máscaras, las tablas rotatorias, el scheduler y las permutaciones finales se ejecutan en el host. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto a imagen con 4 pasos de muestreo y sin guidance.
- Edición de imágenes nativa: `Flux2KleinPipeline.__call__` acepta `image` como primer argumento y el texto-a-imagen es el caso `image=None`.
- Edición basada en instrucciones en lenguaje natural (por ejemplo, "turn the apple into a green apple") con el VAE codificando la referencia y añadiendo sus tokens latentes a los del ruido en cada paso.
- Tokenización de prompts en el dispositivo mediante un port fiel de `Qwen2Tokenizer`, probado byte a byte contra Python.
- Prompts editables por el usuario: solo `inputs_embeds` y `enc_mask` dependen de las palabras, por lo que la app puede codificar un prompt escrito en tiempo real.
- Ejecución íntegra en GPU móvil (Mali-G715 de un Pixel 8a) sin VRAM dedicada.
- No se documentan capacidades de tool calling, agentes, visión general, audio ni modo de razonamiento.

## Casos de uso

- Generación de imágenes local en aplicaciones móviles: la app puede generar una imagen de 256×256 en 4 pasos directamente en la GPU del teléfono (306 s en un Pixel 8a), sin enviar datos a la nube, lo que es adecuado para apps de privacidad estricta.
- Edición fotográfica en el dispositivo: el usuario selecciona una foto y escribe una instrucción de edición; el modelo la modifica localmente (328–369 s en un Pixel 8a) con un coste adicional de solo ~7 % frente a la generación, gracias a que los pesos de edición son los mismos tensores reexportados.
- Prototipado de pipelines de difusión en Android: los grafos LiteRT permiten validar en hardware real la fidelidad frente al pipeline fp32 de `diffusers` (PSNR 36,8 dB en generación y 44,3 dB en edición) antes de escalar a servidor.
- Aplicaciones de demostración educativas: el proyecto incluye tokenizer, fixtures y embeddings mmap, lo que facilita explicar paso a paso cómo funciona un DiT con condicionamiento de texto en un curso o taller.
- Asistentes creativos sin conexión: al no requerir red, el modelo sirve para herramientas de ideación visual en entornos con conectividad limitada o intermitente.
- Investigación sobre cuantización int8 en móvil: los grafos INTEGER-int8 (frente a weight-only-FLOAT, que bloquea la compilación de la GPU) son un banco de pruebas para estudiar el equilibrio entre precisión y latencia en delegados GPU de LiteRT.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Fidelidad de generación (PSNR) | 36,8 dB | Pixel 8a Mali-G715 frente a pipeline fp32 `diffusers`, 4 pasos, 256×256 |
| Fidelidad de generación (correlación) | 0,9987 | Misma comparación |
| Fidelidad de edición (PSNR) | 44,3 dB | Edición "turn the apple into a green apple", 256×256 |
| Fidelidad de edición (SSIM) | 0,9998 | Misma comparación |
| Tiempo de generación | 306 s | Pixel 8a Mali-G715, 4 pasos, 256×256, extremo a extremo |
| Tiempo de edición | 328–369 s | Pixel 8a Mali-G715, 4 pasos, 256×256 |
| Coste de edición frente a generación | +7 % extremo a extremo | Pico de RSS +2 %, tiempo de GPU por paso 1,6×, compilación de shaders 1,0–1,2× |
| Fidelidad de conversión LiteRT | 4e-7 | `litert_torch.convert` frente al original en Galaxy S26 (LiteRT 2.2.0, Android 16) |
| Tokenización y embedding de prompt | ~1 s | En el dispositivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de imagen.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso móvil; el pico de memoria es de un único grafo de ~912 MB, frente a los 6,2 GB totales del pipeline.
- El modelo base declara ejecución en GPUs de consumo con tan solo 13 GB de VRAM en su formato original.
- GPU recomendadas para el formato LiteRT: GPU móviles compatibles con el delegado GPU de LiteRT, como la Mali-G715 del Pixel 8a; no se especifican modelos de escritorio.
- Cabe en GPU de consumo: sí, en el formato original con 13 GB de VRAM; en formato LiteRT está pensado para GPU integradas de teléfono.
- Opciones de despliegue: runtime LiteRT (Android: `com.google.ai.edge.litert:litert`) y conversión mediante `litert_torch` (antes `ai-edge-torch`); el pipeline fp32 de referencia usa `diffusers`.
- Latencia y throughput: 306 s por imagen de 256×256 en 4 pasos en un Pixel 8a; 328–369 s por edición; ~1 s para tokenizar y embeber un prompt. No se dispone de throughput en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-LiteRT | 4B DiT + 4B encoder | 512 tokens de texto; 256–512 tokens de imagen | LiteRT int8 | Apache-2.0 | Hugging Face (litert-community) |
| FLUX.2 [klein] 4B (base) | 4B DiT + 4B encoder | no disponible | safetensors / diffusers | Apache-2.0 | Hugging Face (black-forest-labs) |
| Otros modelos de imagen de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de imagen en la información proporcionada.

## Limitaciones y advertencias

- Resolución limitada: los grafos documentados trabajan a 256×256; no se indican resoluciones superiores.
- Latencia alta en móvil: 306 s por imagen de 256×256 en un Pixel 8a, adecuada para uso interactivo pausado pero no para generación en tiempo real.
- El pipeline requiere el codificador Qwen3-4B completo, ya que el condicionamiento usa estados ocultos de las capas 9, 18 y 27; no existe un sustituto más pequeño.
- La cuantización weight-only-FLOAT bloquea la compilación de la GPU, por lo que la ruta int×int es la única operativa documentada.
- La tokenización, las máscaras, las tablas rotatorias y el scheduler se ejecutan en el host, lo que añade complejidad de integración en la app.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes (Qwen3-4B, VAE) en sus repositorios originales.
- El modelo está pensado para hardware móvil; el rendimiento en otras plataformas no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/FLUX.2-klein-4B-LiteRT
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Benchmark de referencia de LiteRT en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
