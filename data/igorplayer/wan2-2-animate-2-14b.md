# igorplayer/Wan2.2-Animate-2-14B

## Resumen

Wan-Animate-2 es un framework de animación de personajes de extremo a extremo desarrollado por el equipo Wan (Wan-Video / Wan-AI), que consume vídeos de conducción (*driving videos*) directamente en un Diffusion Transformer rediseñado, eliminando los extractores de movimiento intermedios que empleaban las generaciones anteriores. El modelo genera animaciones de alta fidelidad con una fuerte preservación de la identidad del personaje de referencia y añade control de punto de vista mediante texto, lo que desacopla la cámara del vídeo de conducción.

La variante publicada en este repositorio, Wan2.2-Animate-2-14B, cuenta con 14.000 millones de parámetros y se distribuye con licencia Apache 2.0. El equipo publica además dos conjuntos de pesos: **Base** (modelo completo) y **Distillation** (variante destilada, con guiado 1.0 y 10 pasos de muestreo), así como una variante **Wan-Animate-2-Lite** orientada a latencia de tiempo real para animación en *streaming*.

Es relevante ahora porque sustituye la tubería clásica de "extracción de pose/malla + renderizado" por un único modelo generativo que aprende el movimiento directamente del vídeo, y porque su integración en Diffusers, DiffSynth-Studio y ComfyUI lo hace accesible a flujos de producción existentes. El repositorio ocupa 82,5 GB en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) rediseñado, con consumo directo de vídeo de conducción |
| Parametros totales | 14B (según el nombre del checkpoint; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts de ejemplo están en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 82,5 GB; no se detalla formato alternativo) |

## Arquitectura y entrenamiento

Wan-Animate-2 se basa en un Diffusion Transformer que recibe como entrada el vídeo de conducción de forma directa, sin un extractor de movimiento intermedio (pose, malla facial o *landmarks*). Según la model card, esto permite generar movimiento de alta fidelidad y preservar la identidad del personaje de referencia, al tiempo que se incorpora control de punto de vista guiado por texto para desacoplar la perspectiva de cámara del vídeo original. La variante Lite está diseñada para reducir la latencia de inferencia hasta umbrales de tiempo real en animación por *streaming*.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon etapas de RLHF o DPO. La model card menciona dos checkpoints (Base y Distillation), lo que sugiere un proceso de destilación por pasos para acelerar el muestreo; la variante destilada se ejecuta con `sample_guide_scale 1.0` y 10 pasos. Tampoco se detalla la innovación concreta de atención (si usa atención lineal, decodificación especulativa u otras optimizaciones), más allá de la dependencia de `flash_attn`.

## Capacidades

- Generación de vídeo de animación de personajes a partir de una imagen de referencia y un vídeo de conducción.
- Preservación de identidad del personaje de referencia a lo largo de la animación.
- Transferencia de movimiento directamente desde el vídeo de conducción, sin extracción intermedia de pose.
- Control de punto de vista de cámara guiado por texto, independiente del vídeo de conducción.
- Generación de vídeo a 720P (configuración por defecto) y 480P (probada en 2× A800).
- Variante destilada para muestreo acelerado (10 pasos, guiado 1.0).
- Variante Lite orientada a animación en *streaming* con latencia de tiempo real.
- Integración con Diffusers (`WanAnimate2Pipeline`), DiffSynth-Studio y ComfyUI.
- No se documentan capacidades de *tool calling*, agentes, razonamiento multi-paso ni modalidades de audio.

## Casos de uso

- **Producción de animación para cine y publicidad**: el modelo anima un personaje a partir de una imagen de referencia y una interpretación de vídeo, manteniendo la identidad en todos los planos; el control de cámara por texto permite reencuadrar sin regrabar la referencia.
- **Creación de contenido para redes sociales**: a partir de una foto y un vídeo de referencia se generan clips animados del personaje, con la variante destilada reduciendo el coste de muestreo a 10 pasos.
- **Previsualización de personajes en videojuegos**: animación rápida de *concept art* para validar expresividad y movimiento antes de producir *rigs* definitivos.
- **Doblaje y localización de vídeo**: reanimación de un personaje con el movimiento de un actor de doblaje, preservando la identidad del personaje original.
- **Avatares y presentadores virtuales**: generación de un presentador animado a partir de una imagen fija y un vídeo de conducción; la variante Lite habilita escenarios de *streaming*.
- **Prototipado en estudios de animación**: integración en ComfyUI o DiffSynth-Studio para iterar sobre animáticas con control de cámara por prompt.
- **Investigación en generación de vídeo condicionada**: reproducción del *pipeline* en Diffusers para experimentar con control de punto de vista y transferencia de movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Configuración de referencia del repositorio: 8× A800 para generación a 720P.
- Configuración probada para 480P: 2× A800.
- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 82,5 GB en el repositorio, por lo que la inferencia en precisión nativa requiere agregación multi-GPU.
- GPU recomendadas: A800 (configuración oficial); no se documenta soporte en GPUs de consumo.
- ¿Cabe en GPU de consumo? No disponible; con 14B parámetros y pesos de 82,5 GB, no es viable en una única GPU de consumo sin cuantización, y no se documentan opciones de cuantización.
- Opciones de despliegue: scripts oficiales (`wan_animate_2_demo.py`), Diffusers (`WanAnimate2Pipeline`), DiffSynth-Studio, ComfyUI.
- Dependencias: PyTorch 2.7.0, CUDA 12.6, `flash_attn`.
- Latencia y throughput: no disponibles; la variante Lite se describe como de latencia de tiempo real, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-Animate-2-14B | 14B | no disponible | Difusión de vídeo para animación de personajes | Apache 2.0 | HuggingFace, ModelScope, Diffusers, ComfyUI |
| Wan-Animate-2-Lite | no disponible | no disponible | Variante eficiente para *streaming* | Apache 2.0 (según repositorio) | Mencionada en la model card; pesos no detallados |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de la misma categoría (animación de personajes condicionada por vídeo) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al ser un modelo generativo de vídeo, puede reproducir sesgos presentes en los datos de entrenamiento (no detallados).
- Riesgo de alucinación visual: artefactos, inconsistencias temporales o deriva de identidad en secuencias largas; no se cuantifica en la model card.
- El prompt debe describir apariencia y fondo del personaje; la model card recomienda generar la descripción con un LLM externo (por ejemplo, Qwen3.7-Plus) y ofrece una plantilla en chino, lo que sugiere un sesgo hacia ese idioma.
- No se especifican idiomas soportados ni limitaciones de longitud de contexto o de duración de vídeo.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la procedencia de los datos de entrenamiento y de los vídeos de entrada (derechos de imagen y de interpretación).
- La configuración por defecto está ajustada a 8× A800; en otros *hardware* hay que modificar los ficheros YAML de paralelismo.
- El repositorio es una copia de terceros (`igorplayer`) con 0 descargas y 0 *likes*; se recomienda usar el repositorio oficial `Wan-AI/Wan2.2-Animate-2-14B`.
- No se documentan opciones de cuantización ni requisitos de VRAM por configuración, lo que dificulta el despliegue en entornos con recursos limitados.

## Enlaces

- Repositorio en HuggingFace (copia de terceros): https://huggingface.co/igorplayer/Wan2.2-Animate-2-14B
- Repositorio oficial en HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-Animate-2-14B
- Repositorio oficial en ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.2-Animate-2-14B
- Paper (arXiv): https://arxiv.org/pdf/2608.06009
- Página del proyecto: https://humanaigc.github.io/wan-animate-2
- Demo en ModelScope: https://www.modelscope.cn/studios/Wan-AI/Wan2.2-Animate
- Repositorio de código: https://github.com/Wan-Video/Wan-Animate-2
- Integración en Diffusers (PR #14412): https://github.com/huggingface/diffusers/pull/14412
- FlashAttention: https://github.com/Dao-AILab/flash-attention
