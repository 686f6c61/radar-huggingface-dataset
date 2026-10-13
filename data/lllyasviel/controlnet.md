# lllyasviel/ControlNet

## Resumen

ControlNet es una arquitectura de red neuronal que añade control espacial a la generación de imágenes con modelos de difusión. Fue desarrollada por lllyasviel (Lvmin Zhang, en colaboración con Maneesh Agrawala, Universidad de Stanford) y se presentó en el artículo "Adding Conditional Control to Text-to-Image Diffusion Models". El repositorio aloja los pesos preentrenados de ocho variantes de ControlNet acopladas a Stable Diffusion 1.5, cada una condicionada por un tipo distinto de entrada auxiliar: bordes Canny, profundidad Midas, bordes suaves HED, detección de líneas M-LSD, mapas de normales, esqueletos OpenPose, garabatos humanos (scribble) y segmentación semántica con protocolo ADE20k.

El problema que resuelve es la falta de control geométrico del text-to-image: un prompt de texto no permite fijar la composición exacta de la imagen resultante. ControlNet congela los pesos del modelo de difusión original e inyecta una copia entrenable de los bloques del codificador, conectada mediante convoluciones inicializadas a cero, de forma que el modelo base conserva sus capacidades y gana una nueva condición de entrada espacial.

Es relevante porque se ha convertido en el estándar de facto para control estructural en pipelines de difusión: se integró rápidamente en AUTOMATIC1111, ComfyUI y Diffusers, y su repositorio acumula 3885 "likes" en Hugging Face con un tamaño de 47,2 GB. La model card no declara parámetros totales, idiomas soportados ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ControlNet sobre difusión latente (U-Net de Stable Diffusion 1.5 como modelo base congelado) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión, no de lenguaje) |
| Tipos de cuantización | no disponible en la model card; los pesos se distribuyen como checkpoints `.pth` |
| Idiomas soportados | no disponible; el condicionamiento textual depende del codificador CLIP de Stable Diffusion 1.5 |
| Licencia | openrail (Open RAIL) |
| Formato de pesos | `.pth` (checkpoints de PyTorch); también `.pt` para los anotadores de terceros |
| Modelo base | Stable Diffusion 1.5 |
| Variantes condicionantes | canny, depth, hed, mlsd, normal, openpose, scribble, seg |
| Tamaño del repositorio | 47,2 GB |
| Tarea | generación y edición de imágenes condicionada por mapa de control |
| Fecha de creación (HF) | 2023-02-08 |
| Última actualización (HF) | 2023-02-25 |

## Arquitectura y entrenamiento

ControlNet es una extensión del U-Net de difusión latente de Stable Diffusion 1.5. Su innovación central consiste en clonar los pesos del codificador del U-Net en dos ramas: una copia congelada que preserva la función original y una copia entrenable que recibe la condición espacial adicional. Ambas ramas se conectan mediante convoluciones de cero ("zero convolutions"), de modo que, al inicio del entrenamiento, la salida de la rama nueva es nula y el modelo se comporta exactamente como el original. Esto permite entrenar sobre un modelo de difusión preentrenado sin degradar sus capacidades y sin necesidad de reentrenar el modelo completo. El condicionamiento se aplica a todos los niveles de resolución del codificador, lo que da un control tanto global como de detalle.

La model card documenta los ocho checkpoints específicos por tipo de control y los anotadores de terceros usados para generar cada condición: modelo de pose y manos de OpenPose, estimación de profundidad DPT-Hybrid Midas, detección M-LSD (versión *large*, 512 y fp32), detección de bordes HED (`network-bsds500`) y segmentación semántica Uniformer (`upernet_global_small`). También se incluye `fill50k.zip`, el dataset empleado en el tutorial de entrenamiento. La variante *scribble* se entrenó con bordes de contorno y una augmentación de datos muy agresiva para simular trazos humanos. No se especifican en la información proporcionada el número de tokens o imágenes de entrenamiento del modelo principal, la composición completa del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Generación de imágenes condicionada por mapa de bordes Canny, útil para preservar contornos exactos.
- Generación condicionada por mapa de profundidad (Midas), que fija la estructura tridimensional de la escena.
- Generación condicionada por bordes suaves HED, con un control menos rígido que Canny.
- Generación condicionada por detección de líneas rectas M-LSD; la model card indica que también funciona con transformada de Hough tradicional.
- Generación condicionada por mapa de normales, donde la orientación debe respetar la convención indicada (izquierda rojo, derecha azul, arriba verde, abajo morado).
- Generación condicionada por esqueleto de pose OpenPose, incluyendo la posibilidad de manipular directamente el esqueleto.
- Generación condicionada por garabatos humanos (scribble).
- Generación condicionada por segmentación semántica con protocolo ADE20k.
- Reutilización de todas las capacidades del modelo base Stable Diffusion 1.5 (text-to-image, img2img, inpainting según el pipeline que lo integre).
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento; no es un modelo de lenguaje.
- Capacidades multilingües: no declaradas en la información disponible.

## Casos de uso

- Diseño de producto y bocetado industrial: a partir de un dibujo de líneas Canny o HED se generan renders fotorrealistas que respetan exactamente la silueta y los contornos del boceto, lo que permite iterar sobre el diseño sin que el modelo altere la geometría propuesta.
- Previsualización de escenas 3D: exportando el buffer de profundidad o el mapa de normales desde Blender, Unreal o cualquier motor 3D, la variante `depth` o `normal` genera una imagen final coherente con la geometría, útil para presentaciones de arquitectura antes de renderizar en alta calidad.
- Animación y retargeting de personajes: con `openpose` se fija el esqueleto de una pose concreta (o se transfiere desde un vídeo) para generar al personaje en la postura deseada, manteniendo consistencia entre fotogramas en pipelines de vídeo.
- Edición iterativa asistida por el usuario: la variante `scribble` permite que un usuario sin formación artística corrija zonas concretas con trazos rápidos y regenere solo esas regiones respetando el resto de la composición.
- Edición regional y composición por capas: con `seg` (protocolo ADE20k) se generan imágenes donde cada región semántica (cielo, vegetación, edificio, persona) se controla por separado, lo que facilita la composición y el reemplazo de elementos en posproducción.
- Arquitectura e interiores: `mlsd` detecta líneas rectas, por lo que resulta adecuado para fachadas, perspectivas interiores y cualquier escena dominada por estructuras ortogonales donde las líneas deben quedar perfectamente alineadas.
- Restauración y escalado con preservación de estructura: integrar ControlNet en un pipeline img2img permite ampliar o limpiar una imagen de baja calidad sin que el modelo reinvente la composición, ya que la estructura se impone mediante el mapa de control.
- Producción de assets en estudio: mediante la integración en AUTOMATIC1111 o ComfyUI, un equipo puede encadenar ControlNet con otros nodos (upscalers, inpainting, LoRA) para estandarizar un flujo de generación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas cuantitativas (FID, CLIP score, precisión de control ni latencia), y los resultados de búsqueda consultados tampoco aportan tablas comparativas.

## Requisitos de hardware

- Los requisitos exactos de VRAM no están documentados en la model card ni en los resultados de búsqueda consultados.
- Estimación orientativa (no publicada por el autor, basada en la clase de modelo): inferencia de ControlNet con SD 1.5 a 512x512 en fp16 en torno a 6-8 GB de VRAM, y bastante más si se trabaja a 768x768 o con varias unidades de ControlNet activas simultáneamente.
- Tarjetas consumer viables en la práctica: gamas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). Con 6 GB el margen es muy ajustado.
- GPU de centro de datos: A100, H100, L40S o similares para lotes grandes y generación en alta resolución.
- Opciones de despliegue documentadas o referenciadas desde el repositorio: AUTOMATIC1111 con la extensión `sd-webui-controlnet`, ComfyUI, la integración de Diffusers (`haofanwang/ControlNet-for-Diffusers`), la demo Gradio en Hugging Face Spaces (`hysts/ControlNet`) y la lista de cuadernos de Colab de `camenduru`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Tipo de control | Condiciones soportadas | Licencia | Disponibilidad | Parámetros |
|---|---|---|---|---|---|---|
| ControlNet (este repositorio) | lllyasviel | Copia entrenable del codificador con zero convolutions | 8 variantes (canny, depth, hed, mlsd, normal, openpose, scribble, seg) | openrail | Hugging Face, GitHub, A1111, ComfyUI, Diffusers | no disponible |
| ControlNet v1.1 | lllyasviel | Evolución del mismo diseño sobre SD 1.5 | Conjunto ampliado de variantes | no disponible en la información proporcionada | Hugging Face (repo `ControlNet-v1-1`) | no disponible |
| T2I-Adapter | comunidad de investigación en difusión | Adaptadores ligeros sobre el U-Net | Varias condiciones espaciales | no disponible | Repositorios públicos | no disponible |
| GLIGEN | comunidad de investigación en difusión | Condicionamiento por cajas delimitadoras y puntos clave | Grounding espacial por regiones | no disponible | Repositorios públicos | no disponible |

No se dispone de datos cuantitativos de rendimiento relativo entre estas alternativas en la información proporcionada. Cualitativamente, ControlNet v1.1 es la continuación directa del modelo descrito aquí y T2I-Adapter y GLIGEN son enfoques alternativos de condicionamiento espacial con filosofías de diseño distintas.

## Limitaciones y advertencias

- La model card prohíbe explícitamente el uso del modelo para crear o difundir imágenes que generen entornos hostiles o alienantes, incluyendo contenido que previsiblemente resulte perturbador, angustioso u ofensivo, o que propague estereotipos históricos o actuales.
- Riesgo de artefactos y alucinación visual: el modelo puede generar detalles anatómicos incorrectos (manos, extremidades) o incoherencias en zonas donde el mapa de control es ambiguo, algo inherente a la familia Stable Diffusion 1.5.
- Sesgos heredados: la generación depende de los sesgos del modelo base SD 1.5 y de sus datos de entrenamiento; ControlNet solo añade control espacial y no corrige esos sesgos.
- Licencia Open RAIL: no es una licencia permisiva sin condiciones. Incorpora restricciones de uso (prohibición de usos dañinos, de generación de desinformación, de suplantación de identidad y de vigilancia masiva, entre otros). Cualquier uso comercial debe revisarse contra esos términos.
- Sin idiomas declarados: la model card no especifica cobertura multilingüe de los prompts; el comportamiento depende enteramente del codificador CLIP de SD 1.5, cuyo rendimiento es notablemente mejor en inglés.
- Dependencia obligatoria del modelo base: los checkpoints `.pth` no son autónomos, requieren cargar Stable Diffusion 1.5 y, en varios casos, los anotadores de terceros incluidos para generar la condición de entrada.
- El repositorio pesa 47,2 GB, lo que implica requisitos de almacenamiento y tiempo de descarga considerables si se quieren todas las variantes y los anotadores.
- Los pesos se distribuyen en formato `.pth`, no en `safetensors`, lo que exige precauciones de seguridad al cargar archivos de origen no verificado.
- No hay información publicada sobre límites de resolución, estabilidad numérica en precisión reducida ni comportamiento en lotes grandes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lllyasviel/ControlNet
- Versión ControlNet v1.1 en Hugging Face: https://huggingface.co/lllyasviel/ControlNet-v1-1
- Repositorio GitHub del proyecto: https://github.com/lllyasviel/ControlNet
- Artículo original "Adding Conditional Control to Text-to-Image Diffusion Models": https://arxiv.org/abs/2302.05543
- Extensión para AUTOMATIC1111: https://github.com/Mikubill/sd-webui-controlnet
- Integración para Diffusers: https://github.com/haofanwang/ControlNet-for-Diffusers
- Demo de Gradio en Hugging Face Spaces: https://huggingface.co/spaces/hysts/ControlNet
- Lista de cuadernos de Colab de la comunidad: https://github.com/camenduru/controlnet-colab
- Ficha y análisis en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/controlnet-lllyasviel
- Documentación en DeepWiki: https://deepwiki.com/lllyasviel/ControlNet/1-controlnet-overview
