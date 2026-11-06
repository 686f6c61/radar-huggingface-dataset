# lvladikov/PiD-as-pixel-Upscaler

## Resumen

PiD-as-pixel-Upscaler es un repositorio de flujos de trabajo para ComfyUI que permite usar PiD (Pixel Diffusion Decoder) de NVIDIA como upscaler de imágenes de propósito general a 4×. PiD es un decodificador de difusión en espacio de píxeles que sustituye al decodificador VAE de un modelo latente: en lugar de decodificar el latente al tamaño original, dibuja directamente la imagen en píxeles a 4× la anchura y altura en pocos pasos. NVIDIA distribuye PiD solo para un conjunto limitado de espacios latentes (FLUX.1, FLUX.2, Qwen-Image, SD3 y SDXL), por lo que el autor propone la solución de codificar cualquier imagen con el VAE de FLUX.2 y decodificarla con el decodificador FLUX.2 de PiD.

El repositorio no contiene pesos propios: empaqueta dos flujos de ComfyUI (local y Comfy Cloud), un script Python equivalente y un `requirements.txt`, junto con las instrucciones para descargar los modelos necesarios desde Comfy-Org/PixelDiT y Comfy-Org/MOSS-Image. El modelo PiD subyacente es un checkpoint de 2,8 GB en bf16 (`pid_1.5_flux2_1024_to_4096_4step_bf16.safetensors`), acompañado de un codificador de texto Gemma 2 2B IT y el VAE de FLUX.2.

La relevancia actual del proyecto es práctica: convierte un decodificador de difusión especializado en un upscaler universal para cualquier imagen (renders de cualquier modelo, fotografías, fotogramas de vídeo) sin necesidad de reentrenar, usando únicamente nodos nativos de ComfyUI y con tiempos medidos de 5,8 segundos en frío y 3,4 en caliente para una imagen de 704×384 a 2816×1536 en una RTX PRO 6000.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de difusión en espacio de píxeles (Pixel Diffusion Decoder, PiD) sobre espacio latente FLUX.2; muestreo con SamplerCustom en 4 pasos (lcm/simple, CFG 1) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no aplica (modelo de imagen); ventana de contexto espacial de 2048–4096 px por pasada, con ventanas solapadas de 4096 px y 1024 px de solape para salidas mayores |
| Tipos de cuantizacion | bf16 (checkpoint principal, 2,8 GB); fp8_scaled para el codificador de texto Gemma 2 2B IT (2,6 GB); el VAE FLUX.2 en 0,3 GB |
| Idiomas soportados | no disponible (el condicionamiento textual usa Gemma 2 2B IT, pero no se documentan idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints de difusión, text encoder y VAE); flujos en JSON; script en Python |

## Arquitectura y entrenamiento

PiD es un decodificador de difusión que opera directamente en espacio de píxeles y sustituye al decodificador VAE de un modelo latente. Según la documentación de NVIDIA Research, unifica la decodificación latente y el reescalado en un único modelo de difusión de píxeles condicionado por el latente, que predice el campo de velocidad en espacio de píxeles a la resolución objetivo. El entrenamiento incluye latentes corrompidos con ruido y una compuerta sensible a sigma (sigma-aware gating), lo que hace al decodificador robusto frente a latentes parcialmente desruidados y permite una salida temprana del LDM base conservando la calidad a alta resolución.

En este repositorio, el flujo concreto es: la imagen de entrada se codifica con el VAE de FLUX.2 (128 canales, recorte centrado a múltiplos de 16 px), el latente resultante se adjunta al condicionamiento del caption mediante PiD Conditioning (`latent_format = flux`), y SamplerCustom ejecuta los 4 pasos de PiD sobre un lienzo de píxeles vacío 4× mayor (EmptyChromaRadianceLatentImage). La decodificación final usa el VAE `pixel_space` integrado en ComfyUI. Para salidas superiores a 4096 px se emplea Context Windows (Manual) con ventanas solapadas de 4096 px y 1024 px de solape, mezcladas, para evitar derivas de color y rejillas finas. No se documentan en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Superresolución 4× de imágenes de cualquier origen (renders de cualquier modelo, fotografías, fotogramas) mediante codificación con el VAE de FLUX.2 y decodificación con PiD.
- Generación de detalle fino consistente con la imagen de entrada (piel, pelo, follaje, texturas), no un simple reenfoque de píxeles.
- Condicionamiento textual opcional mediante caption para guiar la generación de detalle.
- Ejecución en 4 pasos con CFG 1, lo que reduce el coste computacional frente a muestreos de difusión convencionales.
- Procesamiento por ventanas de contexto para salidas de gran tamaño (más de 4096 px por lado), con solape y mezcla.
- Integración nativa en ComfyUI mediante nodos core (VAE Encode, PiD Conditioning, SamplerCustom, VAE Decode, Context Windows Manual).
- Uso en Comfy Cloud o en ComfyUI local; también disponible como script Python independiente (`pid-upscale.py`).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo de imagen.

## Casos de uso

- Restauración y ampliación de fotografías: codificar una foto de baja resolución con el VAE de FLUX.2 y decodificarla a 4× con PiD para obtener detalle plausible en caras, cabello y texturas, sin depender del VAE del modelo original.
- Escalado de renders generados por otros modelos: cualquier salida de un modelo con VAE distinto (SDXL, SD3, etc.) se puede pasar por el VAE de FLUX.2 y PiD para obtener una versión 4× con detalle añadido, algo que el decodificador nativo no ofrece.
- Preparación de assets para impresión o cartelería: ampliar imágenes a 2816×1536 o superiores usando ventanas de contexto para mantener la coherencia de color en salidas grandes.
- Mejora de fotogramas de vídeo: al aceptar cualquier imagen, puede aplicarse fotograma a fotograma para aumentar la resolución de clips, con tiempos medidos de 3,4–5,8 segundos por fotograma en una RTX PRO 6000.
- Enriquecimiento de imágenes para datasets de entrenamiento: generar versiones 4× de imágenes de baja resolución para aumentar el detalle disponible en pipelines de visión por computador.
- Prototipado rápido en ComfyUI: los flujos JSON permiten probar el upscaler arrastrando el workflow, cargando una imagen y ejecutando, sin escribir código, tanto en local como en Comfy Cloud.
- Integración en scripts y servicios: `pid-upscale.py` permite incorporar el escalado a un pipeline Python propio con las dependencias de `requirements.txt`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados son mediciones de tiempo en Comfy Cloud (RTX PRO 6000): una imagen de 704×384 ampliada a 2816×1536 tarda 5,8 segundos de GPU en frío y 3,4 segundos en caliente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos suman aproximadamente 2,8 GB (PiD bf16) + 5,2 GB (Gemma 2 2B IT bf16, o 2,6 GB en fp8_scaled) + 0,3 GB (VAE FLUX.2), más el coste de activaciones del muestreo en espacio de píxeles a alta resolución.
- GPU recomendadas: RTX PRO 6000 (medición oficial del autor en Comfy Cloud); no se documentan otras GPU en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño de los pesos sugiere que podría caber en GPU con 12–16 GB o más, pero no hay datos verificados.
- Opciones de despliegue: ComfyUI local (con soporte PiD actualizado), Comfy Cloud, y script Python con `requirements.txt` basado en el código de PiD de NVIDIA.
- Latencia y throughput: 5,8 s en frío y 3,4 s en caliente para 704×384 → 2816×1536 en RTX PRO 6000; no hay más datos.

## Comparativa con modelos similares

| Modelo | Tipo | Factor de escala | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PiD-as-pixel-Upscaler (este repo) | Decodificador de difusión en píxeles sobre latente FLUX.2 | 4× | 4 | Apache 2.0 | Hugging Face, ComfyUI, Comfy Cloud |
| Upscaler bicúbico (referencia del autor) | Interpolación clásica | 4× | no aplica | no aplica | Universal |
| Upscaler AI (natekali.github.io) | Interfaz web que usa PiD de NVIDIA como motor | hasta 4K | no disponible | no disponible | Web |

No se dispone en la información proporcionada de comparativas con otros upscalers de difusión (por ejemplo, modelos de superresolución dedicados) en parámetros, contexto o benchmarks.

## Limitaciones y advertencias

- PiD no es un upscaler clásico: no reenfoca los píxeles de entrada, sino que dibuja una imagen nueva de mayor tamaño a partir del latente codificado; el resultado puede diferir del original en detalles finos.
- Solo funciona de forma nativa con los espacios latentes para los que NVIDIA lo entrenó (FLUX.1, FLUX.2, Qwen-Image, SD3, SDXL); el repositorio lo generaliza codificando con el VAE de FLUX.2, lo que introduce una recodificación intermedia.
- PiD está entrenado para salidas de 2048–4096 px; por encima de 4096 px es necesario usar ventanas de contexto, y sin ellas aparecen derivas de color y rejillas finas.
- La imagen de entrada se recorta centrada a múltiplos de 16 px, lo que puede alterar los bordes.
- El nodo de entrada abre por defecto `example.png`; en un ComfyUI local sin ese archivo el flujo falla con un error de lista de valores.
- En Comfy Cloud, el nombre del modelo importado depende del usuario y puede requerir ajuste manual en el nodo Load PiD.
- No se documentan sesgos, riesgos de alucinación visual ni restricciones de idioma en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse la licencia de los pesos de PiD de NVIDIA y del VAE de FLUX.2 descargados por separado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/lvladikov/PiD-as-pixel-Upscaler
- Modelo PiD de NVIDIA: https://huggingface.co/nvidia/PiD
- Página del proyecto PiD en NVIDIA Research: https://research.nvidia.com/labs/sil/projects/pid/
- Checkpoint PiD en Comfy-Org/PixelDiT: https://huggingface.co/Comfy-Org/PixelDiT/resolve/main/diffusion_models/pid_1.5_flux2_1024_to_4096_4step_bf16.safetensors
- Codificador de texto Gemma 2 2B IT: https://huggingface.co/Comfy-Org/PixelDiT/resolve/main/text_encoders/gemma_2_2b_it_elm_bf16.safetensors
- VAE FLUX.2 en Comfy-Org/MOSS-Image: https://huggingface.co/Comfy-Org/MOSS-Image/resolve/main/vae/flux2-vae.safetensors
- Demo web Upscaler AI basada en PiD: https://natekali.github.io/imgupscaler/
