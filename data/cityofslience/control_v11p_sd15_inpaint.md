# cityofslience/control_v11p_sd15_inpaint

## Resumen

ControlNet v1.1 para inpainting es una red de control neuronal diseñada para condicionar modelos de difusión, como Stable Diffusion v1.5, mediante imágenes de entrada y máscaras de inpainting. Fue desarrollada por Lvmin Zhang y Maneesh Agrawala, y presentada en el artículo "Adding Conditional Control to Text-to-Image Diffusion Models" (arXiv:2302.05543). Este checkpoint concreto es una conversión al formato `diffusers` del modelo original `lllyasviel/control_v11p_sd15_inpaint`, realizada por la comunidad.

Resuelve el problema de controlar la generación de imágenes de forma precisa: en lugar de depender solo del prompt de texto, el modelo utiliza una máscara que indica qué zonas de una imagen deben rellenarse o modificarse. La arquitectura ControlNet añade una rama de control paralela al modelo base, lo que permite entrenar condiciones específicas con datasets pequeños (menos de 50k muestras) y a un coste similar al de un fine-tuning. El modelo tiene 361.279.120 parámetros y está pensado para combinarse con Stable Diffusion v1.5. El repositorio tiene un tamaño de 4.3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet (red de control para modelos de difusión) |
| Parametros totales | 361.279.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | openrail (CreativeML OpenRAIL M) |
| Formato de pesos | safetensors |

La información de HuggingFace indica "idiomas: no disponibles", mientras que la model card del autor original especifica "Language(s): English".

## Arquitectura y entrenamiento

ControlNet es una arquitectura de red neuronal que se acopla a un modelo de difusión preentrenado, en este caso Stable Diffusion v1.5. La idea central es duplicar las capas del modelo base y congelar las originales, mientras que la rama de control se entrena para aprender una condición específica. En la versión v1.1 para inpainting, la condición es una imagen de entrada con una máscara que marca las regiones a rellenar. La rama de control se concatena con el modelo base mediante capas de convolución cero, lo que permite que el modelo aprenda de forma robusta incluso con pocos datos.

El entrenamiento se realizó de forma end-to-end, con una velocidad similar a la de un fine-tuning, y puede escalarse a grandes cantidades de datos si se dispone de recursos. En la información disponible no se especifican el número de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO, que no tienen sentido en este tipo de modelos generativos de visión.

## Capacidades

- Control de generación de imágenes mediante máscaras de inpainting: el modelo toma una imagen inicial, una máscara y un prompt de texto, y genera una imagen en la que las zonas enmascaradas se rellenan o modifican según el prompt.
- Compatibilidad con Stable Diffusion v1.5: está diseñado para usarse junto con el modelo base `runwayml/stable-diffusion-v1-5`, aunque experimentalmente puede combinarse con otros modelos de difusión.
- Integración con la librería `diffusers`: se puede cargar mediante `ControlNetModel.from_pretrained()` y usar con la pipeline `StableDiffusionControlNetInpaintPipeline`.
- Generación de imágenes condicionada por texto: el prompt de texto sigue siendo un factor de control, combinado con la condición visual de la máscara.
- Procesamiento de imágenes a resolución 512x512: el modelo está entrenado para esa resolución, aunque puede extrapolarse a resoluciones mayores con resultados variables.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de audio o vídeo: es un modelo puramente de visión generativa.

## Casos de uso

- Edición de imágenes con máscaras: el modelo permite rellenar zonas concretas de una fotografía, como eliminar un objeto no deseado (por ejemplo, una persona de fondo) y generar el contenido de forma coherente con el entorno.
- Restauración de fotografías antiguas: se puede aplicar sobre imágenes dañadas o con zonas perdidas, utilizando la máscara para indicar las áreas a reconstruir y el prompt para guiar el resultado.
- Inpainting creativo: un diseñador puede añadir elementos nuevos a una imagen existente, como un árbol o un edificio, pintando la máscara en la zona deseada y describiendo el elemento en el prompt.
- Generación de variantes de producto en comercio electrónico: se puede modificar una imagen de producto (por ejemplo, cambiar el color de un objeto) manteniendo el resto de la composición intacta, lo que agiliza la creación de catálogos.
- Corrección de artefactos en imágenes generadas por IA: si una imagen generada previamente tiene imperfecciones (por ejemplo, una mano deforme), se puede enmascarar la zona y regenerarla con un prompt adecuado.
- Composición de escenas en diseño gráfico: se pueden combinar elementos de varias imágenes, enmascarando las zonas que se desean sustituir y generando un resultado cohesivo.
- Post-producción de fotogramas de vídeo: aunque el modelo trabaja sobre imágenes fijas, se puede aplicar a fotogramas individuales para tareas de restauración o edición en flujos de trabajo de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo ControlNet tiene 361.279.120 parámetros, lo que equivale a aproximadamente 722 MB en float16. Al usarse junto con Stable Diffusion v1.5 (860 millones de parámetros), el consumo total en float16 ronda los 2,4 GB. Con `enable_model_cpu_offload()` se puede reducir la VRAM necesaria.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para generar a 512x512 con 20 pasos de inferencia. Para resoluciones mayores o lotes, se recomiendan GPUs con 8-12 GB o más, como la RTX 3060 12GB, RTX 4070, o GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en GPUs de consumo como la serie RTX 30 o 40, siempre que se utilice precisión float16 y optimizaciones de memoria.
- Opciones de despliegue: se puede usar con la librería `diffusers`, que es el formato principal. También es compatible con interfaces como ComfyUI o Automatic1111 WebUI, que cargan checkpoints de ControlNet.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| control_v11p_sd15_inpaint (este) | 361.279.120 | no aplica | openrail | HuggingFace |
| control_v11p_sd15_canny | 361.279.120 | no aplica | openrail | HuggingFace |
| control_v11p_sd15_seg | 361.279.120 | no aplica | openrail | HuggingFace |
| control_v11p_sd15_openpose | 361.279.120 | no aplica | openrail | HuggingFace |

Los tres modelos comparados pertenecen a la misma familia ControlNet v1.1 y comparten arquitectura y número de parámetros. Se diferencian en el tipo de condición de entrada: en lugar de máscaras de inpainting, usan mapas de bordes (canny), segmentación semántica (seg) o puntos de pose (openpose). El rendimiento no se puede comparar numéricamente porque no se han publicado benchmarks en la información disponible.

## Limitaciones y advertencias

- Dependencia del modelo base: este checkpoint no funciona de forma autónoma; requiere un modelo de difusión como Stable Diffusion v1.5. Si el modelo base cambia, los resultados pueden degradarse.
- Sesgos heredados: al estar entrenado sobre Stable Diffusion v1.5, puede heredar sesgos de género, raza o estereotipos presentes en el modelo base.
- Riesgo de alucinaciones visuales: en las zonas enmascaradas, el modelo puede generar contenido incoherente con la realidad si el prompt no es suficientemente específico o si la máscara es ambigua.
- Resolución limitada: el modelo fue entrenado a 512x512. Generar a resoluciones mayores puede producir artefactos o degradación de la calidad.
- Restricciones de licencia: la licencia OpenRAIL M impone condiciones de uso responsable y restricciones para aplicaciones dañinas. Es necesario revisar los términos antes de un uso comercial.
- Checkpoint de la comunidad: esta versión es una conversión de la comunidad, no un lanzamiento oficial de los autores originales. Aunque se basa en el checkpoint original, puede haber diferencias menores en el comportamiento.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/cityofslience/control_v11p_sd15_inpaint
- HuggingFace (modelo original): https://huggingface.co/lllyasviel/control_v11p_sd15_inpaint
- Repositorio de GitHub: https://github.com/lllyasviel/ControlNet
- Paper (arXiv): https://arxiv.org/abs/2302.05543
- Documentación de diffusers para ControlNet: https://huggingface.co/docs/diffusers/api/pipelines/stable_diffusion/controlnet
- Ficha en ModelDatabase: https://modeldatabase.com/lllyasviel/control_v11p_sd15_inpaint.html
