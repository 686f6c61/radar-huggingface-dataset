# Pinkstack/LiliPixel-V1-190M

## Resumen

LiliPixel-V1-190M es un modelo de difusion texto-a-imagen desarrollado por Pinkstack, disenado especificamente para generar pixel art y sprites a resoluciones nativas de 16x16, 32x32 y 64x64 pixeles. Se trata de un Diffusion Transformer (DiT) de un solo flujo entrenado desde cero, con 190.580.500 parametros totales, que emplea flow matching rectificado como objetivo de entrenamiento en lugar de la difusion DDPM clasica. El modelo se distribuye bajo licencia OpenMDW-1.1 y esta implementado como pipeline personalizado de `diffusers` (`PixelArtDiTPipeline`).

La relevancia de este modelo radica en su especializacion: frente a modelos generativos de proposito general que producen pixel art como un estilo aproximado a resoluciones altas, LiliPixel genera directamente a la resolucion nativa del pixel art, lo que garantiza que cada pixel sea significativo y no un artefacto de reescalado. Esto lo hace especialmente util para pipelines de desarrollo de videojuegos indie, generacion de assets y prototipado rapido de sprites.

El modelo utiliza un encoder de texto congelado (MongoDB/voyage-4-nano, ~346M parametros, no incluido en los pesos) y requiere aproximadamente 1 GB de memoria en inferencia BF16 sin perdida. Su tamano compacto permite ejecutarlo en GPU de consumo, lo que reduce la barrera de entrada para estudios pequenos y desarrolladores individuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de un solo flujo, flow matching rectificado |
| Parametros totales | 190.580.500 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 96 tokens de texto (prompts mas largos se truncan) |
| Tipos de cuantizacion | BF16 (recomendado); no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (compatible con Hugging Face, pesos EMA) |
| Capas / ancho / cabezas | 24 / 768 / 16 |
| Tamano de parche | 1 para 16x16 y 32x32; 2 para 64x64 (transformer compartido, capas patch-in/out separadas) |
| Canales de pixel | RGBA en 16x16 y 32x32; RGB en 64x64 |
| Rango de valores | [-1, 1] |
| Objetivo de entrenamiento | Rectified flow matching, timesteps logit-normal, objetivo de velocidad |
| Sampler | Euler, 30/50 pasos, CFG 3.0 por defecto |
| Encoder de texto | MongoDB/voyage-4-nano congelado (~346M parametros, externo) |
| Tamano del repo | 0.8 GB |

## Arquitectura y entrenamiento

LiliPixel-V1 es un Diffusion Transformer de un solo flujo en el que los tokens de texto y los tokens de imagen comparten una unica secuencia con atencion propia completa. La red consta de 24 capas con ancho 768 y 16 cabezas de atencion. Para las resoluciones de 16x16 y 32x32 se emplea un tamano de parche de 1 (un pixel por token), mientras que para 64x64 se usa un parche de 2, con capas de entrada y salida de parches separadas pero un transformer compartido. El modelo opera sobre pixeles RGBA con valores normalizados en [-1, 1] para las resoluciones pequenas y RGB para 64x64.

El entrenamiento utiliza flow matching rectificado con timesteps muestreados de una distribucion logit-normal y objetivo de velocidad, en lugar de la prediccion de ruido convencional. El encoder de texto es MongoDB/voyage-4-nano congelado, con un maximo de 96 tokens y una caption nula aprendida para classifier-free guidance. Los pesos publicados son pesos EMA. El modelo se entreno sobre una combinacion de datasets: Pinkstack/LiliPixel-710K-Flux-64pixelart, Angais/pixel-art-atlas-1.4m, azygod/pixelart-172k y Chan-Y/pixelart-308k. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de pixel art y sprites a resoluciones nativas de 16x16, 32x32 y 64x64 pixeles.
- Generacion con fondo transparente (canal alfa) en 16x16 y 32x32; en 64x64 la salida es RGB opaca.
- Modo realismo en 64x64 mediante el prefijo `realistic photo,` en el prompt.
- Generacion de escenas descriptivas en 64x64 con composicion sujeto-accion-fondo.
- Soporte de classifier-free guidance con caption nula aprendida.
- Generacion por lotes con semillas incrementales para seleccion de mejores resultados.
- Integracion con ComfyUI mediante nodo personalizado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Generacion de sprites para videojuegos 2D: el modelo produce sprites de 16x16 y 32x32 con fondo transparente directamente utilizables como assets en motores como Godot o Unity, eliminando el paso de recorte manual y garantizando alineacion pixel-perfect.
- Prototipado rapido de assets en estudios indie: con ~1 GB de VRAM en BF16, un desarrollador puede generar lotes de 8-16 variantes por prompt en una GPU de consumo y seleccionar las mejores, acelerando la iteracion de direccion artistica.
- Generacion de tilesets y elementos de escenario en 64x64: el modo escena permite crear fondos y elementos de entorno con composicion sujeto-accion-fondo, utiles para prototipos de niveles.
- Creacion de iconos y elementos de interfaz retro: la resolucion nativa de 16x16 y 32x32 es adecuada para iconos de inventario, habilidades o menus en juegos con estetica pixel art.
- Automatizacion de pipelines de contenido para game jams: la integracion con ComfyUI y el pipeline de diffusers permiten encadenar generacion por lotes con seleccion automatica, util en plazos cortos.
- Generacion de assets para prototipos de realidad aumentada o avatares: los sprites transparentes de 32x32 pueden escalarse con vecino mas cercano para mantener nitidez en interfaces retro.
- Docencia y experimentacion en modelos de difusion: su tamano compacto (190M parametros) y su arquitectura DiT de un solo flujo lo convierten en un caso de estudio accesible para entender flow matching y atencion conjunta texto-imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en BF16 sin perdida (segun la model card), mas el encoder de texto externo (~346M parametros, descargado en el primer uso).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; se ha validado en CUDA con `torch.bfloat16`.
- Cabe en GPU de consumo: si, incluidas GTX 1060 6GB, RTX 2060, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `diffusers` con `DiffusionPipeline` y `custom_pipeline` (requiere `transformers>=4.56` y `trust_remote_code=True`); ComfyUI mediante nodo personalizado `ComfyUI_LiliPixel.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion).
- Latencia y throughput: no disponibles en la informacion proporcionada. Se recomienda generar lotes de 4 imagenes como minimo y 8-16 en 64x64 para seleccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Resolucion nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiliPixel-V1-190M | 190,6M | 96 tokens | 16/32/64 px | OpenMDW-1.1 | Hugging Face, diffusers, ComfyUI |
| Stable Diffusion 1.5 | ~860M | 77 tokens | 512x512 | CreativeML OpenRAIL-M | Amplia (diffusers, ComfyUI, A1111) |
| PixelArt-Diffusion (referencia generica) | no disponible | no disponible | 512x512 con post-proceso | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. La comparativa se limita a parametros, contexto, resolucion y licencia; los modelos de proposito general requieren reescalado y post-proceso para obtener pixel art nativo, mientras que LiliPixel genera directamente a la resolucion objetivo.

## Limitaciones y advertencias

- Entrenado con un conjunto de imagenes limitado y con un tamano de parametros reducido; no genera escenas complejas ni objetos o lugares nicho. Se recomienda describir los conceptos de forma simple (por ejemplo, "Cute light blue colored shark plushy" en lugar de "Blahaj").
- En modo 64x64 existe una mayor probabilidad de alucinacion de sujetos; se recomienda generar lotes de 8-16 imagenes y seleccionar la mejor.
- Los prompts mas largos de 96 tokens se truncan; los prompts muy largos funcionan peor.
- Solo soporta ingles; no se documenta soporte multilingue.
- La transparencia solo esta disponible en 16x16 y 32x32; 64x64 es RGB opaco (no RGBA).
- Requiere `trust_remote_code=True` y conexion a internet en la primera carga para descargar el encoder de texto.
- Los sesgos conocidos no se documentan en la informacion disponible; al entrenarse sobre datasets de pixel art, puede reflejar sesgos de composicion y estilo de dichas fuentes.
- Licencia OpenMDW-1.1: se debe revisar el texto completo de la licencia para confirmar las condiciones de uso comercial antes de desplegar en produccion.
- El modelo es de generacion de imagenes, no de texto; no dispone de capacidades de razonamiento, codigo, tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Pinkstack/LiliPixel-V1-190M
- Encoder de texto: https://huggingface.co/MongoDB/voyage-4-nano
- Dataset Pinkstack/LiliPixel-710K-Flux-64pixelart: https://huggingface.co/datasets/Pinkstack/LiliPixel-710K-Flux-64pixelart
- Dataset Angais/pixel-art-atlas-1.4m: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Dataset azygod/pixelart-172k: https://huggingface.co/datasets/azygod/pixelart-172k
- Dataset Chan-Y/pixelart-308k: https://huggingface.co/datasets/Chan-Y/pixelart-308k
- Nodo ComfyUI: https://huggingface.co/Pinkstack/LiliPixel-V1-190M/blob/main/comfyui-workflow/ComfyUI_LiliPixel.py
- Workflow ComfyUI: https://huggingface.co/Pinkstack/LiliPixel-V1-190M/blob/main/comfyui-workflow/LiliPixel_V1.json
