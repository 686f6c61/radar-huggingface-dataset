# reallusion4free/ltx-2.3-10eros-v1.2-dmd-mlx-q8

## Resumen

El modelo `ltx-2.3-10eros-v1.2-dmd-mlx-q8` es una cuantizacion int8 en formato MLX del checkpoint base `TenStrip/LTX2.3-10Eros`, un modelo de generacion de video de la familia LTX-2.3. El autor `reallusion4free` ha fusionado directamente en los pesos del transformer los deltas de destilacion DMD provenientes de JoyAI Echo, sustituyendo el LoRA destilado nativo de rango 384. El resultado es un paquete "distilled-only": no incluye transformer dev ni fusion de LoRA en runtime, y la destilacion queda integrada en los pesos.

La conversion se realizo con `mlx-forge` y el modelo esta empaquetado para ejecutarse con `ltx-2-mlx`, un port puro de MLX para Apple Silicon. El repositorio tiene un tamano de 31.1 GB e incluye el transformer, el conector Gemma-DiT, upscalers espaciales y temporales, VAE de video, vocoder y VAE de audio. El text encoder (Gemma 3 12B) no esta incluido y debe cargarse por separado mediante `mlx-lm`. El modelo esta pensado para generacion de video a partir de texto o imagen, con una advertencia explicita de que su contenido no es apto para todos los publicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para video, con conector Gemma-DiT y VAE de video (8x temporal, 32x espacial). Incluye vocoder BigVGAN v2 y VAE de audio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (q8) con group size 64, aplicado solo a `nn.Linear` de los `transformer_blocks`. AdaLN, proyecciones, conectores, VAE y vocoder permanecen en bf16 |
| Idiomas soportados | no disponible (el prompt de texto no especifica idiomas) |
| Licencia | ltx-2-license (etiqueta `other`) |
| Formato de pesos | safetensors (componentes del modelo); el text encoder Gemma 3 12B se carga aparte via `mlx-lm` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LTX-2.3, un sistema de difusion para video que combina un transformer principal (DiT) con un conector que mapea las embeddings de Gemma 3 12B hacia el espacio del DiT. El paquete incluye un VAE de video con factor de compresion temporal 8x y espacial 32x, ademas de un VAE de audio y un vocoder BigVGAN v2, lo que indica soporte para generar audio sincronizado. El transformer usa cuantizacion int8 con group size 64, mientras que las capas de normalizacion adaptativa (AdaLN), proyecciones y conectores se mantienen en bf16 porque MLX no permite cuantizar capas convolucionales.

El proceso de entrenamiento no se describe en detalle, pero la model card indica que el checkpoint base `TenStrip/LTX2.3-10Eros` fue destilado con el metodo DMD de JoyAI Echo. Los deltas del LoRA DMD (rango 256, reajustados desde las formas del LoRA destilado de LTX 1.1, con la rama de audio proveniente del LoRA destilado 384 de LTX 1.1) se fusionaron en la base bf16 con fuerza 1.0 (alpha dividido por el rango real). Posteriormente, el checkpoint resultante se convirtio a int8 con `mlx-forge`, generando el paquete actual. La fusion DMD evita la deriva de remuestreo a la base y la perdida de condicionamiento que introduce el LoRA destilado nativo en la etapa de refinamiento de upscale. No se incluye variante dev: el flujo es exclusivamente destilado.

## Capacidades

- Generacion de video a partir de texto (text-to-video) usando el flujo destilado con `--distilled`.
- Generacion de video a partir de imagen (image-to-video) mediante el parametro `--image`.
- Flujo destilado de dos etapas: generacion a media resolucion, upscaling espacial (1.5x y 2x) y refinamiento a resolucion completa.
- Soporte de upscaling temporal 2x para aumentar la duracion del video generado.
- Incluye componentes de audio (vocoder BigVGAN v2 y VAE de audio), lo que sugiere capacidad de generar pista de audio sincronizada.
- Compatible con cualquier sampler Euler o compatible con LTX, sin necesidad de carga o muestreo personalizado.
- Cuantizacion int8 para reducir el uso de memoria en Apple Silicon.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de agentes: es un modelo de generacion de video, no de lenguaje.

## Casos de uso

- Generacion de contenido visual para entretenimiento adulto: el modelo esta disenado especificamente para este fin, con una advertencia de uso restringido. Se usaria mediante `ltx-2-mlx` con un prompt de texto o una imagen de entrada para producir clips cortos.
- Animacion personalizada a partir de imagenes: se puede partir de una fotografia o ilustracion y animarla con el parametro `--image`, lo que permite crear secuencias breves a partir de un fotograma inicial.
- Exploracion de tecnicas de destilacion DMD en modelos de difusion para video: este checkpoint sirve como referencia para estudiar el efecto de fusionar los deltas de destilacion en los pesos, frente al uso de LoRA en runtime.
- Prototipado de pipelines de postproduccion con upscaling: al incluir upscalers espaciales (1.5x y 2x) y temporal (2x), puede usarse para probar flujos de generacion a baja resolucion seguidos de refinamiento.
- Investigacion en cuantizacion MLX para generacion de video en Apple Silicon: el paquete demuestra una cuantizacion int8 selectiva sobre el transformer, dejando el resto en bf16, util para evaluar el rendimiento en hardware de Apple.
- Desarrollo de aplicaciones de generacion de video en local: gracias a la compatibilidad con `ltx-2-mlx` y el modo `--low-ram`, puede ejecutarse en Macs con 16 GB o 32 GB de RAM para pruebas y experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de rendimiento en metricas como FVD, IS o CLIP score, ni de comparaciones con otros modelos de generacion de video.

## Requisitos de hardware

- VRAM estimada: no se indica un valor exacto, pero el paquete requiere un Mac con Apple Silicon. El modo `--low-ram` permite ejecutarlo en equipos con 16 GB de RAM; en Macs de 32 GB se recomienda usar `--low-ram` para inferencia con stream por bloques.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y sucesivos). No se menciona soporte para GPU NVIDIA ni AMD.
- En cuanto a consumer GPU: no aplica; el modelo esta disenado para el ecosistema MLX de Apple.
- Opciones de despliegue: `ltx-2-mlx` es el runtime oficial para este paquete. Tambien se puede cargar con `mlx-lm` para el text encoder Gemma 3 12B. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa con otros modelos. La unica referencia directa es el modelo base `TenStrip/LTX2.3-10Eros`, del que este paquete es una variante cuantizada y destilada. La model card menciona que, frente al LoRA destilado nativo de rango 384, la fusion DMD evita la deriva de remuestreo, la perdida de condicionamiento y la sobrescritura de detalles en la etapa de refinamiento. Sin embargo, no se aportan numeros de rendimiento que permitan comparar ambos enfoques.

| Modelo | Arquitectura | Cuantizacion | Formato | Plataforma | Contenido |
|---|---|---|---|---|---|
| `ltx-2.3-10eros-v1.2-dmd-mlx-q8` | DiT para video | int8 (transformer) | safetensors + MLX | Apple Silicon | Adulto |
| `TenStrip/LTX2.3-10Eros` | DiT para video | bf16 (base) | safetensors | no especificado | Adulto |

## Limitaciones y advertencias

- Contenido no apto para todos los publicos. El modelo 10Eros esta orientado a uso adulto; el autor exige confirmacion de mayoria de edad y responsabilidad sobre el contenido generado.
- No debe usarse para producir material ilegal ni para representar a personas reales e identificables sin consentimiento.
- Solo ejecuta en Apple Silicon mediante `ltx-2-mlx`; no hay soporte para otros runtimes como vLLM o TGI.
- El text encoder Gemma 3 12B no esta incluido en el paquete. Es necesario cargarlo por separado con `mlx-lm`, lo que anade un requisito adicional de memoria y dependencias.
- El paquete es exclusivamente "distilled-only". No incluye transformer dev, por lo que los flujos `--two-stage`, `--two-stages-hq` y `--one-stage` no estan disponibles.
- Los archivos de LoRA compartidos (`ltx-2.3-22b-distilled-lora-384*.safetensors`) que pueda soltar `mlx-forge` en el directorio no se utilizan en este paquete. Pueden eliminarse, pero deben retirarse tambien de la lista `lora` de `split_model.json`.
- La cuantizacion int8 se aplica solo a `nn.Linear` dentro de `transformer_blocks`; otras capas permanecen en bf16, por lo que el ahorro de memoria no es uniforme en todo el modelo.
- La licencia `ltx-2-license` puede imponer restricciones de uso comercial. Debe consultarse el texto completo antes de desplegar el modelo en produccion.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que el comportamiento frente a prompts adversos o la propension a generar artefactos visuales no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reallusion4free/ltx-2.3-10eros-v1.2-dmd-mlx-q8
- Modelo base: https://huggingface.co/TenStrip/LTX2.3-10Eros
- Runtime `ltx-2-mlx`: https://github.com/dgrauet/ltx-2-mlx
- Herramienta de conversion `mlx-forge`: https://github.com/dgrauet/mlx-forge
- Nodos de destilacion JoyAI Echo: https://github.com/TenStrip/10S-Comfy-nodes
- Licencia LTX-2: https://huggingface.co/Lightricks/LTX-2.3/blob/main/LICENSE.txt
- Pagina del modelo en Civitai (referencia): https://civitai.red/models/2447875/ltx23-10eros
