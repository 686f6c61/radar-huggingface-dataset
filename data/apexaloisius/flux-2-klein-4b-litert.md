# ApexAloisius/FLUX.2-klein-4B-LiteRT

## Resumen

FLUX.2-klein-4B-LiteRT es una conversión del modelo de difusión texto-a-imagen FLUX.2 [klein] 4B de Black Forest Labs (licencia Apache-2.0) a grafos `CompiledModel` de LiteRT en cuantización int8, empaquetados por el usuario ApexAloisius. El objetivo es ejecutar generación y edición de imágenes de forma íntegra en la GPU de un teléfono móvil, sin VRAM dedicada. El pipeline completo (codificador de texto Qwen3-4B, DiT de flujo rectificado y VAE) se exporta como grafos INTEGER-int8, el camino que el delegado GPU de LiteRT ejecuta realmente.

La relevancia del artefacto es doble: por un lado demuestra que un modelo de 4B parámetros para difusión puede correr en hardware móvil de gama media (Pixel 8a con Mali-G715); por otro, documenta con mediciones concretas las técnicas de troceado necesarias para superar los límites de LiteRT (flatbuffer de 2 GB) y del presupuesto de memoria de la GPU del teléfono. El modelo base es un transformer de difusión con destilación por pasos (step-wise distilled), lo que permite muestrear en 4 pasos sin classifier-free guidance.

El repositorio ocupa 16,0 GB e incluye tanto los grafos de generación como los de edición, el tokenizador Qwen2 portado a host y la tabla de embeddings en fp16. No se han publicado resultados de benchmarks estándar (MMLU, etc.) por tratarse de un modelo de imagen; las métricas disponibles son de fidelidad frente al pipeline fp32 de `diffusers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de flujo rectificado con codificador de texto Qwen3-4B y VAE; destilación por pasos |
| Parámetros totales | 4B en el DiT y 4B en el codificador de texto (según la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento sobre estados ocultos de las capas 9/18/27 de Qwen3-4B, intercalados a 7680 canales) |
| Tipos de cuantización | int8 (INTEGER-int8, cómputo int×int); tabla de embeddings en fp16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | LiteRT `CompiledModel` (grafos `.tflite`); tensores de E/S en float32 little-endian, row-major; `qwen_embed_fp16.bin` |

## Arquitectura y entrenamiento

El pipeline sigue el esquema Qwen3-4B (codificador de texto) → DiT de flujo rectificado → VAE. El codificador de texto no aporta un embedding agrupado, sino los estados ocultos de las capas 9, 18 y 27, intercalados hasta 7680 canales; por eso no existe un sustituto más pequeño. El DiT emplea bloques de doble flujo (double-stream) y de flujo único (single-stream), con normalización adaLN continua en la proyección final. El modelo base es step-wise distilled: el bucle de muestreo usa 4 pasos, sin classifier-free guidance (una pasada del DiT por paso en lugar de dos) y sin inversión de signo, con una actualización Euler de flow matching del tipo `latents += dsigma[step] * noise_pred`.

La conversión a LiteRT se realizó con `litert-torch` (antes `ai-edge-torch`). Como el DiT de 4B y el codificador de 4B superan tanto el límite de carga de flatbuffer de 2 GB de LiteRT como el presupuesto de GPU de un teléfono, se trocean en grafos residentes de uno en uno: la huella pico es un único grafo de ~912 MB frente a los 6,2 GB totales. La cuantización es INTEGER-int8 (cómputo entero) porque la cuantización solo de pesos en FLOAT bloquea la compilación del delegado GPU. El tokenizador, `embed_tokens`, las máscaras causal y de padding, las tablas rotatorias, el scheduler y las permutaciones finales se ejecutan en el host. Para edición, los grafos `kce_*` son los mismos tensores reexportados a la forma más larga (secuencia de imagen 256 → 512 tokens, secuencia conjunta 768 → 1024), con pesos idénticos; el VAE codificador requirió reescribir `DiagonalGaussianDistribution.mode()` para evitar la operación `SPLIT`, prohibida en el delegado.

## Capacidades

- Generación de imágenes texto-a-imagen a 256×256 píxeles en 4 pasos.
- Edición de imágenes nativa: `Flux2KleinPipeline.__call__` recibe `image` como primer argumento; el modo texto-a-imagen es el caso `image=None`.
- Edición con referencia codificada por el VAE y tokens latentes concatenados a los de ruido en cada paso, separados en el eje rotatorio `T` (ruido `T = 0`, referencia i-ésima `T = 10 + 10·i`).
- Prompts editables en el dispositivo: el tokenizador Qwen2 portado (fixture-tested byte a byte contra Python) y la tabla de embeddings fp16 mapeada en memoria permiten teclear prompts nuevos en lugar de usar uno horneado.
- Inferencia completamente on-device en GPU móvil (Mali-G715 de un Pixel 8a), sin VRAM dedicada.
- No se documentan tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo.

## Casos de uso

- Generación de imágenes en aplicaciones móviles sin conexión: el pipeline completo corre en la GPU del teléfono, de modo que una app Android puede generar ilustraciones o avatares sin enviar el prompt a un servidor, con la privacidad que eso implica.
- Edición fotográfica local con instrucciones en lenguaje natural: el modo de edición permite transformaciones como "turn the apple into a green apple" con fidelidad medida de PSNR 44,3 dB / SSIM 0,9998 frente al pipeline fp32, adecuado para retoque rápido en el dispositivo.
- Prototipado de funciones de cámara o galería: integrable mediante el runtime LiteRT de Android (`com.google.ai.edge.litert:litert`), permite añadir generación o edición de imágenes a apps existentes sin infraestructura de servidor.
- Demostración e investigación sobre difusión en dispositivos: los grafos troceados y las mediciones de huella pico (~912 MB por grafo) sirven como referencia para estudiar el despliegue de DiT en hardware restringido.
- Aplicaciones de accesibilidad o creatividad offline: al no requerir red, el modelo puede usarse en entornos sin conectividad o con requisitos de soberanía de datos.
- Evaluación comparativa de runtimes: el artefacto incluye métricas de fidelidad frente a `diffusers` fp32 (PSNR 36,8 dB / corr 0,9987 en generación), útil para validar conversiones LiteRT de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las métricas publicadas son de fidelidad y latencia en dispositivo:

| Métrica | Valor |
|---|---|
| Generación 256×256, 4 pasos, Pixel 8a Mali-G715 | 306 s |
| Fidelidad de generación frente a fp32 `diffusers` | PSNR 36,8 dB / corr 0,9987 |
| Edición 256×256, 4 pasos, Pixel 8a Mali-G715 | 328–369 s |
| Fidelidad de edición frente a fp32 `diffusers` | PSNR 44,3 dB / SSIM 0,9998 |
| Huella pico de memoria (grafo mayor) | ~912 MB (total del pipeline: 6,2 GB) |
| Coste adicional de edición (RSS / GPU por paso / extremo a extremo) | +2 % / 1,6× / +7 % |
| Tokenización y embedding de un prompt | ~1 s |
| Precisión de conversión LiteRT (modelo de prueba en Galaxy S26) | 4e-7 frente al original |

## Requisitos de hardware

- VRAM estimada: no aplica en el caso objetivo (GPU móvil sin VRAM dedicada); el pipeline completo ocupa 6,2 GB en total, pero el troceado mantiene una huella pico de ~912 MB.
- GPU recomendadas: Mali-G715 (Pixel 8a) es el hardware validado; el modelo base se describe como ejecutable en GPU de consumo con tan solo 13 GB de VRAM en su forma original.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU de escritorio para estos grafos LiteRT.
- Opciones de despliegue: runtime LiteRT (Android, `com.google.ai.edge.litert:litert`); conversión mediante `litert-torch`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este formato).
- Latencia y throughput: 306 s por imagen de 256×256 en 4 pasos en Pixel 8a; 328–369 s por edición; ~1 s para tokenizar y embeber el prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-LiteRT | 4B DiT + 4B encoder | 256×256, 4 pasos | LiteRT int8 | Apache-2.0 | Hugging Face (0 descargas) |
| FLUX.2 [klein] 4B (base) | 4B DiT + 4B encoder | no disponible | safetensors / diffusers | Apache-2.0 | Hugging Face (oficial de Black Forest Labs) |
| Alternativas de difusión on-device de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- Resolución limitada a 256×256 píxeles en los grafos publicados; no se documentan otras resoluciones.
- Latencia muy alta para uso interactivo: más de 5 minutos por imagen en un Pixel 8a.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día (2026-11-24); no hay evidencia de uso en producción ni validación comunitaria.
- La licencia Apache-2.0 del artefacto hereda la del modelo base, pero conviene verificar las condiciones de uso comercial del modelo original de Black Forest Labs.
- La cuantización int8 introduce desviaciones frente al pipeline fp32 (PSNR 36,8 dB en generación); no es apta para aplicaciones que exijan fidelidad máxima.
- Dependencia del delegado GPU de LiteRT: la cuantización solo de pesos en FLOAT bloquea la compilación, lo que restringe las opciones de cuantización.
- El tokenizador y parte del pipeline se ejecutan en host; no es un grafo único autocontenido.
- No se documentan sesgos, riesgos de alucinación visual ni limitaciones idiomáticas del codificador de texto.
- No hay información sobre idiomas soportados ni sobre el comportamiento con prompts en castellano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApexAloisius/FLUX.2-klein-4B-LiteRT
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Medición de LiteRT en Galaxy S26: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
