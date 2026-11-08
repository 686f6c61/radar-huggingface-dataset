# chenzs/Wan2.2-S2V-14B

## Resumen

Wan2.2-S2V-14B es un modelo de difusión para la generación de vídeo cinematográfico guiado por audio (speech-to-video o S2V). Lo desarrolla Wan-AI, el equipo detrás de la familia Wan de modelos generativos de vídeo, y esta instancia concreta (`chenzs/Wan2.2-S2V-14B`) es un espejo del repositorio oficial `Wan-AI/Wan2.2-S2V-14B` publicado en Hugging Face. El modelo se presentó junto con el informe técnico Wan-S2V (arXiv:2508.18621) y se apoya en la arquitectura base Wan2.2 descrita en arXiv:2503.20314.

El problema que resuelve es la animación de personajes a partir de una imagen de referencia y una pista de audio, cubriendo escenarios que van más allá de la simple sincronización labial: interacciones entre personajes, movimiento corporal realista y trabajo de cámara dinámico propios de producciones audiovisuales. Frente a alternativas como Hunyuan-Avatar u Omnihuman, el paper reporta mejoras de expresividad y fidelidad en contextos cinematográficos.

El repositorio declara 16.295.755.609 parámetros en formato safetensors (aproximadamente 16,3 mil millones, de ahí la denominación comercial "14B"), un tamaño de repo de 45,7 GB, licencia Apache 2.0 y compatibilidad con la librería Diffusers. La arquitectura base Wan2.2 introduce un esquema Mixture-of-Experts (MoE) en el proceso de denoising, junto con un VAE híbrido de alta compresión para la variante de 5B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión para vídeo basada en Wan2.2 (con MoE en el denoising según el paper base); variante S2V audio-driven |
| Parametros totales | 16.295.755.609 (≈16,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusión, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (según metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Diffusers) |

## Arquitectura y entrenamiento

Wan2.2-S2V-14B se construye sobre la familia Wan2.2, que introduce una arquitectura Mixture-of-Experts en modelos de difusión de vídeo: el proceso de denoising se separa por pasos temporales con expertos especializados, lo que amplía la capacidad del modelo manteniendo el coste computacional. El modelo base Wan2.2 se entrenó con un 65,6 % más de imágenes y un 83,2 % más de vídeos que Wan2.1, e incorpora datos estéticos etiquetados (iluminación, composición, contraste, tono de color) para permitir un control más preciso del estilo cinematográfico. La variante S2V añade la condicionalidad por audio para animar personajes a partir de una imagen de referencia.

El informe Wan-S2V describe experimentos comparativos frente a Hunyuan-Avatar y Omnihuman, con resultados que según los autores superan a estas soluciones en escenarios cinematográficos. También se exploran aplicaciones de generación de vídeo de formato largo y edición precisa de lip-sync. No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se emplearon técnicas de RLHF o DPO (poco habituales en modelos de difusión).

## Capacidades

- Generación de vídeo a partir de audio e imagen de referencia (speech-to-video / image-to-video).
- Animación de personajes con sincronización labial precisa.
- Generación de movimiento corporal realista e interacciones entre personajes.
- Control de cámara dinámico y estética cinematográfica (iluminación, composición, color).
- Generación de vídeo de formato largo (long-form video generation).
- Edición de lip-sync sobre vídeo existente.
- Integración con Diffusers y ComfyUI.
- Soporte declarado del idioma español en los metadatos del repositorio.

## Casos de uso

- Doblaje y localización audiovisual: a partir de una imagen del actor y una pista de audio en español, el modelo genera un vídeo con sincronización labial, útil para adaptar contenido a distintos mercados sin regrabar.
- Producción de vídeo publicitario: creación de piezas con personajes animados y cámara cinematográfica controlada, aprovechando el etiquetado estético del modelo base para ajustar iluminación y composición.
- Avatares virtuales para formación corporativa: generación de vídeos de instructores sintéticos a partir de guiones narrados, con movimiento corporal realista.
- Previsualización en postproducción: generación rápida de animáticas (previz) con audio de referencia antes de rodar escenas con actores.
- Creación de contenido para redes sociales: vídeos de personajes hablando o cantando a partir de una única imagen y una pista de voz.
- Edición de lip-sync en postproducción: corrección de desajustes entre audio y vídeo en material ya rodado, gracias a la capacidad de edición precisa descrita en el paper.
- Investigación en generación de vídeo audio-condicionada: base reproducible (Apache 2.0) para experimentar con animación de personajes y comparar frente a Hunyuan-Avatar u Omnihuman.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El paper Wan-S2V indica que el modelo supera a Hunyuan-Avatar y Omnihuman en experimentos comparativos, pero no se proporcionan las cifras concretas en los datos accesibles.

## Requisitos de hardware

- El repositorio ocupa 45,7 GB en safetensors; se requiere VRAM suficiente para cargar los pesos en precisión completa o media, además de memoria para el VAE y el proceso de difusión iterativo.
- No se dispone de estimaciones oficiales de VRAM por cuantización en la información proporcionada.
- El modelo base Wan2.2 de 5B (TI2V) está diseñado para ejecutarse en GPUs de consumo como la RTX 4090; la variante de 14B/S2V requiere previsiblemente GPUs de mayor capacidad (A100, H100) para inferencia cómoda, aunque no se confirman cifras oficiales.
- Opciones de despliegue: Diffusers (soporte oficial), ComfyUI (integrado según las notas de la model card). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (son motores orientados a LLM, no a difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.2-S2V-14B | ≈16,3 B | Difusión vídeo audio-driven | Apache 2.0 | Hugging Face, ModelScope, Diffusers, ComfyUI |
| Hunyuan-Avatar | no disponible | Animación de avatar audio-driven | no disponible | no disponible |
| Omnihuman | no disponible | Animación de personaje audio-driven | no disponible | no disponible |
| Wan2.2 TI2V-5B | 5 B | Difusión vídeo texto/imagen-a-vídeo | Apache 2.0 | Hugging Face, Diffusers, ComfyUI |

No se dispone de datos de parámetros, contexto ni rendimiento numérico de Hunyuan-Avatar y Omnihuman en la información proporcionada; el paper Wan-S2V los usa como referencia comparativa y reporta superioridad del modelo Wan-S2V, pero sin cifras accesibles en esta ficha.

## Limitaciones y advertencias

- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, movimientos inconsistentes o desajustes de identidad entre fotogramas.
- Sesgos de los datos de entrenamiento: la estética y los personajes generados pueden reflejar sesgos demográficos y culturales del corpus, no documentados en detalle.
- Idioma: los metadatos declaran únicamente español, aunque el modelo es audio-driven y su comportamiento multilingüe real no está verificado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes y las políticas de uso aceptable del ecosistema Wan.
- Requisitos de hardware elevados: 45,7 GB de pesos implican infraestructura de GPU profesional para inferencia en precisión completa.
- Repositorio espejo: `chenzs/Wan2.2-S2V-14B` tiene 0 descargas y 0 likes; el repositorio canónico es `Wan-AI/Wan2.2-S2V-14B`, por lo que conviene usar este último para soporte y actualizaciones.
- No se documentan límites de duración de vídeo, resolución máxima ni fps en la información disponible.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/chenzs/Wan2.2-S2V-14B
- Repositorio oficial: https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- Paper Wan-S2V: https://huggingface.co/papers/2508.18621
- Paper base Wan2.2: https://arxiv.org/abs/2503.20314
- Página del proyecto Wan-S2V: https://humanaigc.github.io/wan-s2v-webpage
- Informe técnico Wan-S2V (PDF): https://humanaigc.github.io/wan-s2v-webpage/content/wan-s2v.pdf
- GitHub Wan2.2: https://github.com/Wan-Video/Wan2.2
- Organización Hugging Face: https://huggingface.co/Wan-AI/
- Organización ModelScope: https://modelscope.cn/organization/Wan-AI
- Demo Gradio en Hugging Face: https://huggingface.co/spaces/Wan-AI/Wan2.2-S2V
- Demo Gradio en ModelScope: https://www.modelscope.cn/studios/Wan-AI/Wan2.2-S2V
- Página principal Wan: https://wan.video
- Blog: https://wan.video/welcome
- Discord: https://discord.gg/AKNgpMK4Yj
- Guía de usuario (inglés): https://alidocs.dingtalk.com/i/nodes/EpGBa2Lm8aZxe5myC99MelA2WgN7R35y
- Documentación ComfyUI Wan2.2: https://docs.comfy.org/tutorials/video/wan/wan2_2
