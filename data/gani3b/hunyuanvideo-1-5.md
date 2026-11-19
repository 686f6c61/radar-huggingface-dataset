# gani3b/HunyuanVideo-1.5

## Resumen

HunyuanVideo-1.5 es un modelo de generación de vídeo desarrollado por Tencent Hunyuan, publicado originalmente en noviembre de 2025 y distribuido en este repositorio por el usuario `gani3b`. Se trata de un modelo de difusión para tareas de texto-a-vídeo (text-to-video) e imagen-a-vídeo (image-to-video) que destaca por su eficiencia: con solo 8.3B parámetros ofrece una calidad que el autor califica como de primer nivel, y está diseñado explícitamente para ejecutarse en GPUs de consumo, lo que rebaja significativamente la barrera de entrada frente a otros modelos de vídeo de mayor tamaño.

El modelo se distribuye en formato `safetensors` e incluye integración oficial con Diffusers, así como soporte para ComfyUI y LightX2V. El repositorio ocupa 371.8 GB, lo que refleja la inclusión de múltiples variantes de pesos (distintas resoluciones y modelos destilados por pasos). La licencia es la `tencent-hunyuan-community`, con restricciones específicas para la Unión Europea (`extra_gated_eu_disallowed: true`), un detalle crítico para cualquier despliegue en producción.

La relevancia actual del modelo radica en su combinación de tamaño contenido, soporte de destilación por pasos (generación en 8 o 12 pasos, con tiempos de hasta 75 segundos en una RTX 4090), soporte de inferencia FP8 y la publicación de código de entrenamiento con el optimizador Muon, lo que permite fine-tuning con LoRA. Es, por tanto, una opción atractiva para creadores y desarrolladores que necesitan generar vídeo de forma local sin infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (no se detalla la arquitectura interna en la información disponible) |
| Parametros totales | 8.3B |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (soporte de inferencia FP8 gemm); no se detallan otros formatos |
| Idiomas soportados | en, zh |
| Licencia | tencent-hunyuan-community (con restricción de acceso para la UE) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de identificarlo como un modelo de difusión para vídeo con 8.3B parámetros. El autor lo describe como un modelo "ligero" (lightweight) orientado a calidad de primer nivel, y el repositorio incluye variantes específicas por resolución (por ejemplo, el modelo destilado por pasos para 480p I2V). Se menciona el uso del optimizador Muon durante el entrenamiento, que ha sido liberado junto con el código de entrenamiento (`train.py`), e incluye soporte para entrenamiento distribuido, FSDP, context parallel y gradient checkpointing.

Entre las innovaciones técnicas destacadas están la destilación por pasos (step distillation), que permite generar vídeo en 8 o 12 pasos con una reducción del 75% en tiempo de generación extremo a extremo en una RTX 4090, y el soporte de caché de inferencia (deepcache, teacache, taylorcache) para acelerar la generación. También se ha añadido soporte de inferencia FP8 gemm. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen (image-to-video), con variante específica para 480p.
- Generación acelerada mediante destilación por pasos: 8 o 12 pasos recomendados, con opción de 4 pasos a costa de cierta pérdida de calidad.
- Soporte de caché de inferencia (deepcache, teacache, taylorcache) para reducir el coste computacional.
- Soporte de inferencia en FP8.
- Capacidades multilingües limitadas a inglés y chino (en, zh).
- Integración con Diffusers, ComfyUI y LightX2V.
- Soporte de fine-tuning con LoRA y entrenamiento completo mediante el código liberado.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo de generación de vídeo).

## Casos de uso

- Generación de vídeo publicitario a partir de texto: el modelo permite crear clips promocionales directamente desde un prompt en inglés o chino, con la ventaja de ejecutarse en GPUs de consumo y reducir costes frente a servicios en la nube.
- Prototipado rápido de storyboards: un equipo de producción puede convertir guiones en vídeos preliminares en menos de dos minutos por clip en una RTX 4090 (con el modelo destilado), acelerando la iteración creativa.
- Animación de imágenes fijas para redes sociales: la variante image-to-video permite dar movimiento a fotografías o ilustraciones, útil para creadores de contenido que necesitan clips cortos de forma local.
- Integración en pipelines de ComfyUI: al disponer de soporte oficial en ComfyUI, se puede encadenar con otros nodos (upscaling, postprocesado, control de estilo) para flujos de trabajo de generación complejos.
- Fine-tuning con LoRA para estilo de marca: el código de entrenamiento liberado y el soporte de LoRA permiten adaptar el modelo a un estilo visual concreto (por ejemplo, una estética corporativa) sin reentrenar desde cero.
- Investigación en generación de vídeo eficiente: la combinación de destilación por pasos, caché de inferencia y FP8 lo convierte en una plataforma útil para estudiar técnicas de aceleración en modelos de difusión de vídeo.
- Generación de material educativo o demostraciones técnicas: creación de clips explicativos a partir de descripciones textuales, con la ventaja de que el modelo corre en hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en GPUs de consumo, según el autor.
- Con el modelo destilado por pasos (480p I2V), una única RTX 4090 puede generar un vídeo en 75 segundos, con una reducción del 75% en tiempo de generación extremo a extremo.
- VRAM estimada: no disponible de forma explícita; el tamaño de 8.3B parámetros sugiere que en FP8 o FP16 puede caber en GPUs de 24 GB, pero no se confirma en la información.
- GPUs recomendadas: RTX 4090 (mencionada explícitamente); no se detallan otras.
- Opciones de despliegue: Diffusers, ComfyUI, LightX2V, scripts propios del repositorio (`generate.py`).
- Latencia y throughput: 75 segundos por vídeo en RTX 4090 con el modelo destilado a 480p; no se ofrecen más cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni comparativas con otros modelos de generación de vídeo.

## Limitaciones y advertencias

- Licencia `tencent-hunyuan-community`: es necesario revisar los términos para uso comercial; no es una licencia permisiva estándar.
- Restricción geográfica explícita: `extra_gated_eu_disallowed: true`, lo que implica que el acceso está bloqueado para la Unión Europea. Esto es un caveat crítico para cualquier despliegue en España.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado con prompts en castellano.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos generativos: pueden aparecer artefactos, incoherencias temporales o contenido no deseado.
- No se dispone de información sobre sesgos conocidos ni sobre filtros de seguridad implementados.
- El repositorio es una redistribución por parte de `gani3b` (0 descargas, 0 likes), no el repositorio oficial de Tencent; conviene verificar la integridad de los pesos frente al repositorio oficial `tencent/HunyuanVideo-1.5`.
- El tamaño del repositorio (371.8 GB) implica requisitos de almacenamiento considerables.
- No se documentan limitaciones de contexto ni de duración máxima de vídeo en la información disponible.

## Enlaces

- Repositorio en Hugging Face (redistribución): https://huggingface.co/gani3b/HunyuanVideo-1.5
- Repositorio oficial en Hugging Face: https://huggingface.co/tencent/HunyuanVideo-1.5
- Repositorio en GitHub: https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5
- Licencia: https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5/blob/master/LICENSE
- Informe técnico (arXiv): https://arxiv.org/pdf/2511.18870
- Sitio oficial: https://hunyuan.tencent.com/video/zh?tabIndex=0
- Manual de prompts: https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5/blob/main/assets/HunyuanVideo_1_5_Prompt_Handbook_EN.md
- Guía de ComfyUI: ./ComfyUI/README.md (dentro del repositorio)
- LightX2V: https://github.com/ModelTC/LightX2V
- Plugin de ComfyUI de la comunidad: https://github.com/yuanyuan-spec/comfyui_hunyuanvideo_1.5_plugin
- Colección Diffusers: https://huggingface.co/collections/hunyuanvideo-community/hunyuanvideo-15
- Discord: https://discord.gg/ehjWMqF5wY
- X (Twitter): https://x.com/TencentHunyuan
