# Kijai/WanVideo_comfy

## Resumen

Kijai/WanVideo_comfy es un repositorio de Hugging Face que agrupa y cuantiza los modelos de generación de vídeo Wan 2.1 VACE de Wan-AI, tanto la variante de 14 mil millones de parámetros como la de 1.3 mil millones. Su objetivo principal es simplificar el despliegue de estos modelos en ComfyUI, ofreciendo archivos combinados y cuantizados listos para usar con el wrapper dedicado `ComfyUI-WanVideoWrapper` o con los nodos nativos de ComfyUI. El repositorio, mantenido por Kijai, ha acumulado más de 1,68 millones de descargas y 2474 likes, lo que refleja su adopción en la comunidad de generación de vídeo por IA.

El problema que resuelve es la fragmentación de pesos y formatos: en lugar de descargar múltiples archivos de los modelos originales de Wan-AI, el usuario encuentra aquí versiones empaquetadas y cuantizadas (incluyendo variantes fp8_scaled) que reducen los requisitos de memoria y simplifican la integración en flujos de trabajo de ComfyUI. Además, el repositorio enlaza a numerosos modelos derivados y complementarios (CausVid, SkyReels, WanVideoFun, etc.) que amplían las capacidades del ecosistema WanVideo.

La arquitectura subyacente es la de difusión para vídeo de Wan 2.1 VACE, que incorpora condicionamiento visual mejorado (Vision-Augmented Conditional Enhancement). Aunque el repositorio no documenta la longitud de contexto ni los idiomas soportados, su popularidad y la variedad de cuantizaciones lo convierten en una referencia práctica para desarrolladores que buscan generar vídeo de alta calidad con ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion para video (Wan 2.1 VACE) |
| Parametros totales | 14B y 1.3B (dos variantes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp8_scaled (mencionado), otras no especificadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | diffusion-single-file (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El repositorio no contiene información detallada sobre el entrenamiento de los modelos base. Se trata de una recopilación y cuantización de los pesos originales de Wan-AI/Wan2.1-VACE, que emplean una arquitectura de difusión para vídeo con condicionamiento visual. La variante VACE (Vision-Augmented Conditional Enhancement) mejora la capacidad de seguir instrucciones visuales, lo que permite tareas como edición de vídeo, transferencia de estilo y generación guiada por imágenes. Los archivos combinados se ofrecen en distintos formatos de cuantización, siendo fp8_scaled una variante experimental que reduce aún más el uso de memoria a costa de una posible pérdida de calidad. No se documentan datos sobre el dataset de entrenamiento, número de tokens ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen a vídeo (image-to-video).
- Edición de vídeo con condicionamiento visual (VACE), permitiendo modificar objetos, estilos o escenas manteniendo la coherencia temporal.
- Soporte para distintos modelos derivados incluidos en el repositorio, como CausVid (distilación de pasos), SkyReels (vídeo con audio) o WanVideoFun (personalización).
- Integración con ComfyUI mediante el wrapper `ComfyUI-WanVideoWrapper` o nodos nativos, facilitando flujos de trabajo visuales.
- Capacidad de cuantización flexible para adaptarse a diferentes GPUs (fp32, fp8_scaled, etc.).
- Compatibilidad con modelos adicionales enlazados (Phantom, ATI, MiniMaxRemover, etc.) que amplían las funcionalidades (eliminación de marcas de agua, interpolación, etc.).
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso, ya que es un modelo generativo de vídeo.

## Casos de uso

- **Generación de vídeo creativo para marketing**: crear clips promocionales cortos a partir de descripciones de producto o storyboards. El modelo de 14B ofrece alta fidelidad visual, mientras que la cuantización fp8 permite ejecutarlo en GPUs de consumo como la RTX 4090.
- **Edición de vídeo semiautomática**: mediante el condicionamiento visual de VACE, se pueden reemplazar elementos dentro de un vídeo existente (por ejemplo, cambiar el fondo o el color de un objeto) sin necesidad de herramientas de edición complejas. Adecuado para postproducción en estudios pequeños.
- **Prototipado rápido de animaciones**: los equipos de diseño pueden generar storyboards animados a partir de imágenes estáticas o guiones, acelerando la fase de preproducción. La variante de 1.3B es suficiente para pruebas rápidas con requisitos de hardware reducidos.
- **Creación de contenido para redes sociales**: generar vídeos cortos y personalizados para plataformas como TikTok o Instagram, con estilos artísticos específicos. El repositorio incluye modelos como SkyReels que añaden audio sincronizado.
- **Investigación en generación de vídeo**: los investigadores pueden utilizar los pesos cuantizados para experimentar con técnicas de distilación (CausVid) o comparar configuraciones de inferencia sin necesidad de entrenar desde cero.
- **Restauración y mejora de vídeo**: mediante modelos auxiliares como FlashVSR o rCM, se pueden aplicar superresolución o corrección de movimiento a vídeos generados, integrándose en pipelines de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas (FVD, CLIP score, etc.) frente a otros modelos de generación de vídeo. La ausencia de datos objetivos impide evaluar el rendimiento relativo de forma cuantitativa.

## Requisitos de hardware

- **Variante 14B**: en fp32 requiere aproximadamente 56 GB de VRAM, inviable en GPUs de consumo. Con cuantización fp8_scaled, el uso de memoria se reduce a ~14 GB, lo que permite ejecutarlo en una RTX 4090 (24 GB) o similar. Para fp16, se necesitan ~28 GB, compatible con GPUs profesionales como A6000 o A100.
- **Variante 1.3B**: mucho más ligera, con ~2.6 GB en fp16 y ~1.3 GB en fp8, ejecutable en GPUs consumer de gama baja como RTX 3060 o incluso en CPU con cuantización extrema.
- **GPU recomendadas**: RTX 3090/4090 para la versión 14B cuantizada; A100/H100 para fp32 o fp16 con mayor calidad.
- **Opciones de despliegue**: ComfyUI (con wrapper o nodos nativos), también se puede usar con otros frameworks que soporten safetensors (diffusers, etc.) aunque no se documenta.
- **Latencia y throughput**: no disponibles. Dependen en gran medida de la resolución, número de frames y pasos de inferencia. Se espera que la variante 1.3B genere vídeos cortos (2-5 segundos) en menos de un minuto en GPUs modernas, mientras que la 14B puede tardar varios minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kijai/WanVideo_comfy (Wan 2.1 VACE) | 14B / 1.3B | no disponible | Difusion video | no disponible | Hugging Face, cuantizado |
| Wan-AI/Wan2.1-VACE (original) | 14B / 1.3B | no disponible | Difusion video | Apache 2.0 (según Wan-AI) | Hugging Face, pesos originales |
| Stable Video Diffusion (SVD) | 1.4B | 14 frames | Difusion video | Stability AI Community License | Hugging Face |
| AnimateDiff | 1.7B | 16 frames | Difusion video (con checkpoint base) | Apache 2.0 | Hugging Face |

La comparativa se limita a lo disponible: el repositorio de Kijai es una versión empaquetada y cuantizada de Wan 2.1 VACE, por lo que su rendimiento es equivalente al modelo original (no hay benchmarks propios). Frente a SVD o AnimateDiff, Wan 2.1 VACE ofrece mayor capacidad (14B) y condicionamiento visual, pero carece de datos de contexto y licencia claros. La ventaja principal de este repositorio es la facilidad de uso en ComfyUI y la variedad de cuantizaciones.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no indica la licencia de los pesos. Aunque el modelo base Wan 2.1 VACE de Wan-AI se distribuye bajo Apache 2.0, la cuantización y combinación realizada por Kijai podría tener restricciones adicionales. Se recomienda verificar antes de uso comercial.
- **Sesgos y alucinaciones**: al ser un modelo de generación de vídeo, puede producir contenido visual no realista, con distorsiones anatómicas o incoherencias temporales. No se documentan sesgos específicos, pero es esperable que refleje los sesgos de los datos de entrenamiento de Wan-AI.
- **Riesgo de alucinación en vídeo**: los objetos o escenas generados pueden no corresponder con la descripción textual, especialmente en escenas complejas o con múltiples objetos.
- **Limitaciones de contexto**: no se especifica la longitud máxima de vídeo generable; los modelos de difusión suelen limitarse a pocos segundos (2-10) dependiendo de la resolución y los pasos.
- **Dependencia de ComfyUI**: el formato está optimizado para ComfyUI; su uso con otras herramientas puede requerir conversiones adicionales.
- **Cuantización experimental**: la variante fp8_scaled es experimental y puede degradar la calidad o introducir artefactos. Se recomienda probar con diferentes configuraciones.
- **Requisitos de almacenamiento**: el repositorio ocupa 1749 GB, lo que implica descargas masivas si se desea acceder a todos los archivos. Se sugiere seleccionar solo los pesos necesarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kijai/WanVideo_comfy
- Wrapper de ComfyUI: https://github.com/kijai/ComfyUI-WanVideoWrapper
- Modelos base de Wan-AI: https://huggingface.co/Wan-AI/
- Colección SkyReels: https://huggingface.co/collections/Skywork/skyreels-v2-6801b1b93df627d441d0d0d9
- WanVideoFun: https://huggingface.co/collections/alibaba-pai/wan21-fun-v11-680f514c89fe7b4df9d44f17
- Repositorio de cuantizaciones fp8_scaled: https://huggingface.co/Kijai/WanVideo_comfy_fp8_scaled
