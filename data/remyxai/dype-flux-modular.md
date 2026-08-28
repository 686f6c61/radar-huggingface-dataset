# remyxai/dype-flux-modular

## Resumen

DyPE for FLUX es un bloque personalizado (custom block) para la librería Modular Diffusers, desarrollado por Remyx AI, que permite generar imágenes de ultra alta resolución (hasta 4096×4096 píxeles) con el modelo base FLUX.1-Krea-dev sin necesidad de fine-tuning ni pesos adicionales. El bloque implementa la técnica DyPE (Dynamic Position Extrapolation, arXiv:2510.20766), que ajusta dinámicamente el esquema de RoPE (Rotary Position Embedding) en función del timestep de la difusión, evitando el colapso que sufre FLUX al generar directamente a resoluciones altas (el denominado "woven blob"). También incorpora un límite de shift en el flow-matching para mantener estable el schedule de sigma a 65k tokens.

La relevancia de este bloque radica en que resuelve un problema práctico: la generación de imágenes de alta resolución en una sola pasada, sin recurrir a escaleras de resolución ni upscalers. Además, ofrece un modo opcional "spectral" que combina DyPE con SEGA (arXiv:2605.22668), una técnica de temperatura de atención por frecuencia basada en el espectro de Fourier del latente, que suprime el artefacto de speckle en regiones planas. El bloque está empaquetado para cargarse con tres líneas de código y no duplica pesos: el transformer, VAE y text-encoders de FLUX.1-Krea-dev se transmiten desde el repositorio base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque personalizado para Modular Diffusers sobre FLUX.1-Krea-dev (transformer de difusión con flow matching) |
| Parametros totales | no disponible (el bloque no contiene pesos; depende del modelo base FLUX.1-Krea-dev) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (generación de imágenes, no texto) |
| Tipos de cuantizacion | no disponible (el bloque en sí no tiene cuantización; el modelo base puede cuantizarse a NF4) |
| Idiomas soportados | no disponible (generación de imágenes, no texto) |
| Licencia | MIT |
| Formato de pesos | no aplica (es código Python; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El bloque no es un modelo entrenado, sino una modificación de inferencia que se aplica al transformer de FLUX.1-Krea-dev. Implementa DyPE, que sustituye el módulo de embeddings posicionales por uno dinámico que recibe el timestep actual (y, en modo spectral, el perfil espectral del latente) mediante un pre-hook nativo. El mecanismo central es un esquema YaRN/NTK-by-parts RoPE con fuerza κ=t²: la extrapolación posicional es más fuerte en los primeros pasos, cuando se define la estructura global, y se atenúa conforme se resuelven los detalles. Además, se aplica un límite al shift del flow-matching (mu = max_shift) para mantener el schedule de sigma estable a 65k tokens, condición necesaria para generaciones de una sola pasada por encima de 2K.

El modo "spectral" añade SEGA, que reemplaza la temperatura de atención escalar por una temperatura por frecuencia, derivada del espectro FFT del latente en cada paso. Esto suprime selectivamente la banda de alta frecuencia responsable del speckle sin suavizar detalles reales. No hay entrenamiento: el bloque se restaura al salir y no modifica los pesos base. La implementación de DyPE está verificada bit-exacta contra la referencia original.

## Capacidades

- Generación de imágenes de ultra alta resolución (hasta 4096×4096) en una sola pasada, sin escaleras de resolución ni upscalers.
- Sin entrenamiento ni fine-tuning: funciona directamente con los pesos de FLUX.1-Krea-dev.
- Dos modos de funcionamiento: "yarn" (DyPE puro) y "spectral" (DyPE + SEGA, que elimina el speckle en regiones planas).
- Integración con Modular Diffusers: se carga con `ModularPipeline.from_pretrained` y tres líneas de código.
- VAE tiling automático para reducir el consumo de memoria durante la codificación/decodificación.
- Compatible con cuantización NF4 del transformer y T5 para reducir requisitos de VRAM (medido en el bloque hermano HRDiT).
- Parámetros configurables: resolución (múltiplos de 16), guidance scale, número de pasos, y activación/desactivación de DyPE para comparativas A/B.

## Casos de uso

- Publicidad y diseño gráfico de gran formato: generación de carteles, vallas publicitarias o lonas de alta resolución directamente desde un prompt, sin necesidad de upscaling posterior. El modo spectral es adecuado para cielos y superficies planas donde el speckle sería visible.
- Impresión artística y lienzos: creación de obras digitales de 4K o superiores para impresión en gran formato, manteniendo coherencia global y detalle fino en una sola pasada.
- Texturas para videojuegos y entornos 3D: generación de texturas de alta resolución (por ejemplo, 4096×4096) para materiales PBR, reduciendo el tiempo de producción frente a métodos de escalado.
- Fotografía de stock y bancos de imágenes: producción de imágenes de alta resolución listas para su venta, con control de composición mediante prompts y guidance scale.
- Investigación en generación sin entrenamiento: el bloque sirve como referencia para estudiar técnicas de extrapolación posicional dinámica y su interacción con el flow matching, gracias a su modo A/B (dype=False).
- Integración en pipelines de diseño con ComfyUI: aunque el bloque está pensado para diffusers, existen implementaciones de DyPE para ComfyUI (por ejemplo, norj5/comfyui-dype) que permiten integrar esta técnica en flujos de trabajo visuales existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el pipeline produce imágenes coherentes a 4K donde FLUX colapsa, y que el modo spectral suprime el speckle, pero no se proporcionan métricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numéricas con otros métodos.

## Requisitos de hardware

- VRAM estimada: ~49.8 GB en bf16 para generación a 4096×4096 con VAE tiling en una A100 (según la model card).
- Con cuantización NF4 del transformer y T5, el bloque hermano HRDiT alcanza ~29 GB @ 4096² y ~16 GB @ 2048²; la medición específica para este bloque está pendiente.
- GPU recomendadas: A100 (80 GB) para 4K en bf16; GPUs con 24 GB o más (RTX 3090/4090, A5000) pueden manejar resoluciones de 2048² con cuantización.
- No cabe en GPUs de consumo para 4K sin cuantización; con NF4, 2048² es viable en GPUs de 16 GB.
- Opciones de despliegue: diffusers con `ModularPipeline` (carga directa), o mediante nodos de ComfyUI que implementan DyPE (por ejemplo, norj5/comfyui-dype).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo / método | Enfoque | Resolución máxima | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| remyxai/dype-flux-modular | Bloque Modular Diffusers con DyPE (RoPE dinámico) | 4096² | No | MIT | HuggingFace |
| remyxai/hrdit-flux-modular | Bloque Modular Diffusers para alta resolución (método HRDiT) | 4096² (según model card) | No | MIT | HuggingFace |
| norj5/comfyui-dype | Nodo de ComfyUI que integra DyPE en FLUX | 4096² y más | No | no disponible | GitHub |
| Resolución en escalera (ladder) | Generación progresiva de baja a alta resolución | Variable | No | Variable | Variable |

La comparativa se basa en el enfoque técnico, ya que no hay datos de rendimiento publicados. DyPE destaca por ser single-pass y no requerir cambios en los pesos, mientras que los métodos de escalera implican múltiples pasadas. La implementación de ComfyUI es funcionalmente equivalente pero orientada a un entorno visual.

## Limitaciones y advertencias

- El bloque no contiene pesos propios; depende del modelo base FLUX.1-Krea-dev, cuya licencia puede tener restricciones de uso comercial (no se especifica en la información proporcionada).
- El modo "spectral" altera la composición respecto al modo "yarn" con la misma semilla; no es un reemplazo pixel-exacto, sino un modo alternativo.
- El modo "yarn" puede dejar un artefacto de speckle de alta frecuencia en regiones planas (cielos, agua, paredes).
- La generación a 4096² requiere ~50 GB de VRAM en bf16; sin cuantización, no es viable en GPUs de consumo.
- No se han publicado benchmarks ni métricas de rendimiento; la verificación se limita a la coherencia visual y la comparación bit-exacta del schedule RoPE.
- El repositorio tiene 0 descargas y 1 like, lo que indica que es muy reciente y con poca validación comunitaria.
- La fecha de creación (2026-08-27) es posterior a la fecha actual de conocimiento del autor; se recomienda verificar la vigencia del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/remyxai/dype-flux-modular
- Paper DyPE: https://arxiv.org/abs/2510.20766
- Paper SEGA: https://arxiv.org/abs/2605.22668
- Repositorio original de DyPE: https://github.com/guyyariv/DyPE
- Repositorio de ComfyUI-DyPE (wildminder): https://github.com/wildminder/ComfyUI-DyPE
- Nodo de ComfyUI para DyPE (norj5): https://github.com/norj5/comfyui-dype
- Página de modelos de Remyx AI: https://huggingface.co/remyxai/models
