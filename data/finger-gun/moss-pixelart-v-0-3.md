# finger-gun/moss-pixelart-v.0.3

## Resumen

moss-pixelart-v.0.3 es un adaptador LoRA entrenado por el usuario de Hugging Face finger-gun sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT, especializado en la generación de pixel art limpio, alineado a rejilla, y assets 2D para videojuegos. El adaptador se entrena para renderizar a una escala estricta de 8x: cada bloque de 8x8 píxeles de la imagen generada representa un píxel lógico, lo que facilita enormemente el reescalado descendente a resoluciones nativas de sprite (64x64, 96x96 o 128x128 píxeles lógicos).

Su relevancia radica en que resuelve uno de los problemas clásicos de los modelos de difusión generando pixel art: la deriva de rejilla y el efecto "mixels" (bloques inconsistentes o borrosos). Al imponer una rejilla de 8x8 durante la generación y combinarse con herramientas de postprocesado como SpriteFusion Pixel Snapper, permite obtener sprites y tiles listos para producción con una limpieza notablemente superior a la de un modelo base sin adaptar.

El LoRA tiene un tamaño de repositorio de 0,1 GB, se distribuye en formato diffusers con precisión bf16, y se activa mediante la palabra desencadenante `pxl8x` en el prompt. Es compatible con los LoRA de destilación Turbo/DMD de 8 pasos del ecosistema MOSS-Image y cuenta con un flujo de trabajo listo para ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusión MOSS-Image-SFT (arquitectura `moss_image`, flujo de matching / flowmatch) |
| Parametros totales | no disponible (tamaño del repo: 0,1 GB) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de generación de imágenes) |
| Tipos de cuantizacion | Base cuantizada con `convrot8` (aplicada al transformer y al codificador de texto); LoRA en bf16 |
| Idiomas soportados | no disponible (los prompts se redactan en inglés en los ejemplos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato diffusers (LoRA, bf16) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado exclusivamente al transformer del modelo base MOSS-Image-SFT; el codificador de texto no se entrenó (`train_text_encoder: false`). La configuración de red usa un rango lineal de 32 con alfa 32, y un rango convolucional de 16 con alfa 16. Las capas correspondientes a `layers.22.` se excluyeron del entrenamiento, en coordinación con el mecanismo de Skip Layer Guidance (SLG) del modelo base, que omite la capa 22 en la pasada incondicional. El modelo base emplea cuantización `convrot8` tanto en el transformer como en el codificador de texto.

El entrenamiento se realizó con el `diffusion_trainer` de Ostris (ai-toolkit) sobre un conjunto de datos de 30 sprites de 64x64 píxeles preprocesados con "pixel snapping" y reescalados a 512x512, sin volteos horizontales ni verticales (relevante para preservar la orientación de la iluminación y los detalles del pixel art). Se entrenaron 3000 pasos con tamaño de lote 2 y acumulación de gradientes 2 (lote efectivo de 4), optimizador AdamW de 8 bits con tasa de aprendizaje 0,0001 y weight decay 0,001. El planificador de ruido es `flowmatch` con tipo de timestep `shift`, la pérdida es MSE y se activó la guía diferencial con escala 3,0. La tasa de descarte de captions fue del 5 % y la precisión de entrenamiento, bf16.

## Capacidades

- Generación de pixel art alineado a rejilla estricta de 8x: cada bloque de 8x8 píxeles de salida equivale a un píxel lógico, con mapeos de 512x512 a 64x64, 768x768 a 96x96 y 1024x1024 a 128x128.
- Creación de sprites y assets 2D para videojuegos: personajes, escenarios isométricos, interiores RPG, jefes de estilo arcade 16 bits, etc.
- Generación de texto legible dentro de la imagen (letreros, rótulos) siempre en fuente de bloque y con textos cortos, especialmente a 1024x1024.
- Compatibilidad con LoRA de destilación Turbo/DMD de 8 pasos del ecosistema MOSS-Image, apilables con peso 1,0 para inferencia rápida.
- Integración con ComfyUI mediante un flujo de trabajo oficial con control de layout por bounding-box y salidas separadas (raw, tamaño nativo y visualización).
- Postprocesado automatizado con SpriteFusion Pixel Snapper (versión web y nodo de ComfyUI en Rust) para limpiar "mixels" y ajustar la rejilla a resolución nativa.

## Casos de uso

- Creación de sprites de personajes para videojuegos: generar sprites estilo 16 bits (por ejemplo, un marine espacial retro o un dragón mecánico jefe) y reescalarlos a rejillas nativas de 64x64 o 128x128 píxeles listos para importar en motores como Unity, Godot o GameMaker.
- Diseño de tiles y escenarios isométricos: producir puestos callejeros cyberpunk, interiores de tiendas de pociones o mazmorras con iluminación coherente, aprovechando la adherencia a rejilla para que los tiles encajen sin ajustes manuales.
- Prototipado rápido de assets para game jams: la compatibilidad con LoRA Turbo de 8 pasos permite iterar decenas de variaciones de assets en segundos, ideal para plazos ajustados.
- Generación de rótulos y letreros diegéticos: crear carteles con texto corto en fuente de bloque (por ejemplo, un rótulo de neón "NOODLES") integrado en la escena, generando a 1024x1024 para máxima legibilidad.
- Producción de hojas de sprites (sprite sheets) con limpieza automática: el flujo de ComfyUI con el nodo SpriteFusion Pixel Snapper detecta la rejilla, limpia bloques inconsistentes y exporta a resolución nativa sin intervención manual.
- Ilustración pixel art para marketing o portadas indie: escenas detalladas con paletas de alto contraste estilo arcade, reescalables a formatos de promoción manteniendo la estética pixelada nítida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un LoRA estético para generación de imágenes, no aplica la evaluación típica de modelos de lenguaje (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Al ser un LoRA de 0,1 GB sobre MOSS-Image-SFT (con base cuantizada `convrot8`), los requisitos dominan los del modelo base; los LoRA de difusión modernos suelen ser manejables en GPUs de consumo con 12-24 GB de VRAM, pero no hay cifras oficiales.
- GPU recomendadas: no disponible. Por las características del ecosistema (diffusers, ComfyUI, cuantización de la base), GPUs de consumo tipo RTX 3090/4090 son candidatas razonables, sin confirmación oficial.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño reducido del LoRA y la cuantización de la base, aunque el requisito real depende del modelo base MOSS-Image-SFT (no disponible).
- Opciones de despliegue: librería diffusers de Hugging Face; flujo de trabajo oficial para ComfyUI (con nodo opcional SpriteFusion Pixel Snapper en Rust instalable vía ComfyUI Manager). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a modelos de difusión de imágenes).
- Latencia y throughput estimados: con los ajustes estándar (50 pasos) la generación es la estándar de MOSS-Image-SFT; apilando un LoRA Turbo/DMD de 8 pasos se reduce la inferencia a 8 pasos. No hay mediciones publicadas.

Configuración de inferencia recomendada: planificador Euler (`flowmatch` / `sgm_uniform`), 50 pasos (o 30-50), CFG 3,0 (rango 3,0-6,0), flow shift 5,0, SLG con salto incondicional de la capa 22 (`slg_start: 0,01`, `slg_stop: 1,0`) y peso del LoRA 1,0. Generar siempre en dimensiones divisibles por 16, idealmente múltiplos de 64.

## Comparativa con modelos similares

| Caracteristica | moss-pixelart-v.0.3 | Pixel art LoRAs sobre SDXL / Flux (genericos) | Modelos de difusion de pixel art dedicados (p. ej. PixelForge / similar) |
|---|---|---|---|
| Tipo | LoRA sobre MOSS-Image-SFT | LoRA sobre SDXL o Flux | Modelo completo ajustado |
| Rejilla de pixel | Estricta 8x, mapeo nativo documentado (64/96/128 px) | Variable, suele requerir postprocesado intenso | Variable segun modelo |
| Contexto de resolucion | 512-1024 px (multiplos de 64) | 1024 px tipico | Variable |
| Compatibilidad Turbo/DMD | Si (8 pasos, documentada) | Segun LoRA base | No disponible |
| Licencia | Apache 2.0 | Variable | Variable |
| Disponibilidad de workflow ComfyUI | Si, oficial con pixel snapper | Comunitaria | No disponible |

Nota: la comparativa es cualitativa; no hay datos de rendimiento publicados para ninguna de las alternativas en la informacion disponible.

## Limitaciones y advertencias

- Restricción de resolución: hay que generar siempre en dimensiones divisibles por 16 (idealmente múltiplos de 64) para que la rejilla de 8x se alinee correctamente con el espacio latente del VAE; resoluciones no alineadas producen artefactos de rejilla.
- Texto en imagen limitado a baja resolución: a 512x512 el lienzo lógico es de solo 64x64 píxeles, por lo que el texto debe limitarse a 1-2 palabras en fuente de bloque; para rótulos legibles conviene generar a 1024x1024.
- Efecto "mixels" residual: la decodificación por difusión puede introducir sangrado de subpíxeles o ligera deriva de rejilla, por lo que se recomienda encarecidamente el postprocesado con SpriteFusion Pixel Snapper para assets finales 1:1.
- Conjunto de entrenamiento muy pequeño (30 sprites), lo que puede limitar la diversidad de estilos y provocar sobreajuste a la estética del dataset; los resultados en dominios muy alejados del pixel art clásico no están garantizados.
- Sin volteos en entrenamiento (`flip_x`/`flip_y` desactivados): la coherencia de iluminación y orientación depende de cómo se describa la escena en el prompt.
- Sesgos y riesgo de alucinación: no se han documentado sesgos específicos; como en todo modelo de difusión, pueden aparecer elementos no solicitados o composiciones incorrectas.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones relevantes más allá de la atribución del aviso de licencia.
- Comunidad reducida: 134 descargas y 4 likes en el momento de la ficha, sin pipeline oficial declarado en Hugging Face, lo que implica soporte comunitario limitado y posible evolución del modelo (versión 0.3).

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/finger-gun/moss-pixelart-v.0.3
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Workflow de ComfyUI (incluido en el repo): https://huggingface.co/finger-gun/moss-pixelart-v.0.3/blob/main/image_moss_pixel-art_v0.3_comfyui.json
- SpriteFusion Pixel Snapper (web): https://www.spritefusion.com/pixel-snapper
- SpriteFusion Pixel Snapper (GitHub): https://github.com/Hugo-Dz/spritefusion-pixel-snapper
- Nodo ComfyUI SpriteFusion Pixel Snapper (Rust): https://github.com/mediapixelkr/ComfyUI-SpriteFusion-PixelSnapper
- ai-toolkit de Ostris (herramienta de entrenamiento): no disponible enlace directo en la informacion proporcionada (herramienta citada como `ai-toolkit` / `diffusion_trainer`).
