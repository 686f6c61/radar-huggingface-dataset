# BobMcoy/Minimax-H3-Temporal-Latent-Upscaler

## Resumen

MiniMax H3 Temporal Latent Upscaler es un paquete de nodos y flujos de trabajo para ComfyUI, publicado por el usuario BobMcoy, que actúa sobre la salida latente del primer sampler de vídeo de MiniMax H3. Su función es corregir artefactos de movimiento rápido —smearing, ghosting y saltos de fotograma— detectando bloques de 17 fotogramas con movimiento acelerado y estirándolos a 2× o 3× fotogramas en una segunda pasada para que H3 los redibuje con mayor limpieza, recuperando después el recuento exacto de fotogramas original, el timing a 24 fps y el audio intacto de la primera pasada. Opcionalmente aplica un escalado espacial en el mismo paso (1,0×, 1,5× o 2,0×), todo en espacio latente en lugar de decodificar a píxeles y recodificar como hace De-RoPE en píxeles.

El proyecto no es un modelo de pesos en sentido estricto: el repositorio tiene 0,0 GB y no contiene checkpoints propios, sino código, nodos personalizados y grafos de ComfyUI que orquestan el modelo subyacente MiniMax H3. La versión 2.0 (noviembre de 2026) reescribe el upscaler temporal sobre la ruta optimizada `MiniMaxH3LatentUpscaler` del núcleo de ComfyUI, con convoluciones `channels_last_3d`, GroupNorm3D+SiLU fusionados, chunking `SLAB=16` y gestión dinámica de VRAM.

Es relevante ahora porque aborda un problema práctico y frecuente en la generación de vídeo con difusión: la degradación de extremidades y objetos en movimiento rápido. Al operar en latente y con un esquema adaptativo que omite la segunda pasada en clips sin movimiento (0,02 s), ofrece una vía de mejora de calidad con coste computacional acotado y compatible con GPUs de 8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (paquete de nodos ComfyUI sobre MiniMax H3; no es un modelo de pesos) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el flujo soporta INT8 en atención Sol-Attn de Pass 2 y LoRA Turbo de 4 pasos) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de código y workflows JSON; 0,0 GB) |

## Arquitectura y entrenamiento

El paquete no entrena ni distribuye pesos. Se compone de nodos personalizados para ComfyUI (`temporal_checkpoint.py`, `H3RepairSchedule`, `H3InjectSchedule`, `H3ExactVAEDecode`, entre otros) y de un único flujo unificado `workflows/H3_Unified_Production_Workflow.json`. La lógica central detecta bloques de 17 fotogramas con movimiento rápido en la salida latente de Pass 1, los estira a 2× o 3× fotogramas durante Pass 2 para que el sampler de H3 los redibuje, y después `H3ExactVAEDecode` combina la decodificación del VAE de vídeo de H3 con la recuperación exacta del hold-map de fotogramas, omitiendo los chunks de snap-pad finales y siendo bit-exacto respecto a `VAEDecode + H3ExactRecover`.

La versión 2.0 corrige varios fallos: el bug de `H3RepairSchedule` que comparaba `inject` contra valores sigma en lugar de contra conteos de pasos y ejecutaba solo 1 paso de Pass 2 en vez de 5; la deriva del primer fotograma en FL2V (ahora toma el token central simétrico `2:3` en lugar de un token de borde); un crash en clips de 5 fotogramas; y la sobredilatación de la cola corta. En rendimiento, el upscaler temporal es 1,81× más rápido y consume un 32% menos de VRAM, pasando de OOM/5,60 s a 3,10 s y 1,16 GiB en una RTX 4060 de 8 GB con configuración `3× + 1,5× espacial`. Pass 1 usa FirstBlockCache H3 Safe (−11% de tiempo, calidad equivalente) y Pass 2 usa Triton Sol-Attn INT8 con `min_tokens=12288` (−21% de tiempo y mayor nitidez medida que dense).

## Capacidades

- Reparación temporal adaptativa de movimiento rápido en vídeo generado con MiniMax H3, con escalado a 1×, 2× o 3× fotogramas solo en los bloques de 17 fotogramas afectados.
- Escalado espacial latente opcional en la misma pasada (1,0×, 1,5× o 2,0×).
- Recuperación exacta del recuento de fotogramas original, timing a 24 fps y audio de Pass 1 sin tocar.
- Omisión automática de Pass 2 en clips sin movimiento (0,02 s), evitando coste innecesario.
- Modos de generación integrados en un único flujo: T2V, I2V, FL2V y Ref2V (referencia de personaje, escena o voz mediante `<Picture 1..3>` y `<Audio 1>`).
- Soporte de LoRA Turbo de 4 pasos para previsualizaciones rápidas.
- Toggle opcional de RTX VSR 2× ULTRA para pulido de píxeles con NVIDIA RTX (640×384 → 1280×768 o 960×576 → 1920×1152, en torno a 1,4 s).
- Toggle opcional H3DyRoPE (bloques 30–49) para fidelidad de timing en movimiento reparado a 2×/3×, compatible con Sol-Attn INT8.
- Perfiles de hardware predefinidos para 8 GB, 16–24 GB+ y máxima calidad dense.

## Casos de uso

- Corrección de vídeo generado con H3 en producción: se ejecuta Pass 1, se activa el toggle de reparación temporal y se obtiene un clip con extremidades y objetos nítidos en movimiento rápido, sin cambiar el timing ni el audio originales.
- Escalado conjunto de resolución y reparación temporal en un solo paso: con `spatial_scale=1.5` o `2.0` se pasa de 960×576 a resoluciones mayores mientras se corrigen artefactos, útil para entregables finales.
- Iteración rápida de prompts: activando el LoRA Turbo de 4 pasos con 4–6 pasos en Pass 1 se generan previsualizaciones económicas y después se aplica la reparación en Pass 2 sobre el clip elegido.
- Flujos image-to-video con primer y último fotograma (FL2V): el fix de deriva del primer fotograma garantiza fidelidad simétrica entre keyframes, adecuado para animación de retratos o productos.
- Vídeo con referencia de personaje, escena o voz (Ref2V): útil para publicidad o contenido de marca donde se necesita consistencia de identidad entre clips.
- Despliegue en estaciones de trabajo modestas: con el preset de 8 GB (KJ Attn + FFN) el flujo completo cabe en una RTX 4060 sin OOM, lo que permite a estudios pequeños procesar lotes de clips.
- Integración en pipelines de ComfyUI existentes: al ser un workflow JSON unificado con toggles, se puede versionar y automatizar por lotes para regenerar catálogos de vídeo con calidad corregida.

## Benchmarks y rendimiento

| Configuración | Tiempo | VRAM | Notas |
|---|---|---|---|
| `3× + 1,5× espacial` (v1.x, RTX 4060 8 GB) | OOM / 5,60 s | — | Referencia previa |
| `3× + 1,5× espacial` (v2.0, RTX 4060 8 GB) | 3,10 s | 1,16 GiB | 1,81× más rápido, −32% VRAM, sin OOM |
| Pass 1 con FirstBlockCache H3 Safe | −11% de tiempo | — | Calidad equivalente a dense |
| Pass 2 con Triton Sol-Attn INT8 (`min_tokens=12288`) | −21% de tiempo | — | Mayor nitidez medida que dense |
| Omisión de Pass 2 en clips sin movimiento | 0,02 s | — | Auto-skip |
| RTX VSR 2× ULTRA | ~1,4 s | — | Pulido de píxeles NVIDIA RTX |

No se han publicado resultados de benchmarks de calidad objetiva (PSNR, SSIM, FVD) en la información disponible; las cifras anteriores son de tiempo y VRAM medidas por el autor.

## Requisitos de hardware

- VRAM: el flujo completo con `3× + 1,5× espacial` consume 1,16 GiB en Pass 2 tras la optimización v2.0; el preset de 8 GB (KJ Attn + FFN) mantiene el proceso sin OOM en GPUs de 8 GB.
- GPUs recomendadas: RTX 4060 8 GB verificada por el autor; en 16–24 GB+ se recomienda desactivar el toggle de Low VRAM 8GB y se puede subir `spatial_scale` a 1,5 o 2,0 con holgura. No se especifican requisitos para A100/H100.
- Cabe en GPU consumer: sí, en RTX 4060 de 8 GB con los presets por defecto.
- Despliegue: ComfyUI con el workflow `workflows/H3_Unified_Production_Workflow.json`; requiere el modelo subyacente MiniMax H3 y sus nodos del núcleo. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un pipeline de vídeo).
- Latencia y throughput: 3,10 s para `3× + 1,5× espacial` en RTX 4060 8 GB; 0,02 s de auto-skip en clips sin movimiento; ~1,4 s para RTX VSR 2× ULTRA. No se aportan cifras para otras GPUs.

## Comparativa con modelos similares

| Solución | Enfoque | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax H3 Temporal Latent Upscaler (este) | Reparación temporal + escalado en espacio latente, nodos ComfyUI | Vídeo H3 | No disponible | Hugging Face (BobMcoy) |
| Pixel De-RoPE | Reparación temporal en espacio de píxeles (decodificar y recodificar) | Vídeo H3 | No disponible | Referenciado en la model card |
| RTX VSR | Escalado de píxeles con NVIDIA RTX | Vídeo general | No disponible | Integrado como toggle opcional |

No se dispone de datos de parámetros, contexto ni benchmarks para establecer una comparación cuantitativa con alternativas; la información proporcionada solo permite contrastar el enfoque (latente frente a píxeles) y la integración.

## Limitaciones y advertencias

- No es un modelo de pesos: el repositorio está vacío de checkpoints (0,0 GB) y depende por completo del modelo MiniMax H3 y del ecosistema ComfyUI.
- La licencia no está declarada, lo que impide confirmar si el uso comercial está permitido; conviene verificar antes de integrarlo en producción.
- Sin datos de benchmarks objetivos de calidad (PSNR, SSIM, FVD); las mejoras se documentan mediante comparaciones visuales y mediciones de tiempo/VRAM del autor.
- El esquema de reparación está acoplado a la arquitectura de H3 (bloques de 17 fotogramas, VAE de vídeo de H3) y no es portable a otros modelos de vídeo.
- El bug de `H3RepairSchedule` de versiones anteriores ejecutaba solo 1 paso de Pass 2 en lugar de 5; es imprescindible usar la v2.0 o superior.
- Riesgo de artefactos residuales en movimiento extremo a 2×/3×; el autor recomienda H3DyRoPE para esos casos, lo que añade coste.
- Los toggles de aceleración (FirstBlockCache, Sol-Attn INT8) introducen aproximaciones; para máxima calidad dense deben desactivarse.
- No hay información sobre sesgos, multilingüismo ni alucinación, al no ser un modelo generativo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/BobMcoy/Minimax-H3-Temporal-Latent-Upscaler
- Galería de comparaciones: `demos/README.md` (referenciada en la model card)
- Workflow unificado: `workflows/H3_Unified_Production_Workflow.json` (referenciado en la model card)
