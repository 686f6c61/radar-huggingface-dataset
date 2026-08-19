# dgrauet/ernie-image-sft-mlx-q4

## Resumen

El modelo `dgrauet/ernie-image-sft-mlx-q4` es una conversión al formato MLX (Machine Learning eXchange) del modelo `baidu/ERNIE-Image`, un transformador de difusión (Diffusion Transformer, DiT) de flujo único con 8 000 millones de parámetros desarrollado por Baidu para generación de imágenes a partir de texto. Esta versión específica ha sido cuantizada a precisión int4 y adaptada para ejecutarse de forma eficiente en hardware Apple Silicon, lo que permite generar imágenes localmente en Mac sin depender de servicios en la nube.

El modelo original de Baidu, ERNIE-Image, es un DiT de 8B parámetros entrenado para síntesis de imágenes de alta calidad. La conversión MLX, realizada con la herramienta `mlx-forge`, incluye los componentes principales: un codificador de texto, el transformador principal y un autoencoder variacional (VAE). El repositorio ocupa 6,9 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos propios.

La relevancia de este modelo radica en que ofrece una alternativa de generación de imágenes de código abierto, con un tamaño de parámetros considerable, pero optimizada para ejecutarse en el ecosistema Apple. Esto amplía el acceso a modelos de difusión de gran escala para desarrolladores que trabajan con hardware local de Apple, sin necesidad de GPUs dedicadas de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de flujo único, 8B parámetros |
| Parametros totales | 8 000 millones (del modelo original; la versión MLX cuantizada mantiene la misma topología) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de generación de imágenes, no de texto; no se especifica el límite de tokens de texto) |
| Tipos de cuantizacion | int4 (grupos de cuantización configurados en `quantize_config.json`) |
| Idiomas soportados | No disponibles (el ejemplo de uso emplea chino, pero no hay una lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con cuantización MLX int4) |

## Arquitectura y entrenamiento

El modelo base `baidu/ERNIE-Image` es un Diffusion Transformer de flujo único con 8 000 millones de parámetros, diseñado para generación de imágenes a partir de descripciones textuales. La arquitectura combina un codificador de texto (text encoder), un transformador principal que opera en el espacio latente y un VAE que decodifica las representaciones latentes en píxeles. Este diseño sigue la línea de los modelos de difusión modernos, donde el transformador sustituye a los bloques convolucionales tradicionales de los U-Net.

La versión MLX presentada aquí es una conversión directa de los pesos originales, cuantizada a int4 para reducir el uso de memoria y acelerar la inferencia en Apple Silicon. No se dispone de información detallada sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura DiT de flujo único, que ya es conocida por su eficiencia en la generación de imágenes de alta resolución.

## Capacidades

- Generación de imágenes a partir de texto: el modelo es capaz de producir imágenes realistas y variadas a partir de descripciones en lenguaje natural, como se muestra en el ejemplo de la model card ("一只黑白相间的中华田园犬" - un perro chino blanco y negro).
- Ejecución local en Apple Silicon: gracias a la conversión MLX y la cuantización int4, el modelo puede ejecutarse en Mac con chips M1, M2, M3 y superiores, sin necesidad de GPU externa.
- Compatibilidad con el ecosistema MLX: los pesos se cargan mediante la librería `ernie-image-mlx`, que proporciona una interfaz de línea de comandos y API para integración en proyectos Python.
- Componentes modulares: el repositorio incluye por separado el text encoder, el transformer y el VAE, lo que permite inspeccionar o modificar cada parte.
- Formato estándar: los pesos están en safetensors, con un `quantize_config.json` que documenta la configuración de cuantización, facilitando su uso con otras herramientas del ecosistema MLX.

## Casos de uso

- Generación de imágenes para prototipos de diseño: un diseñador puede usar el modelo para crear rápidamente bocetos visuales a partir de descripciones textuales, acelerando la fase de exploración conceptual sin depender de servicios externos.
- Creación de contenido para redes sociales: generar ilustraciones personalizadas para publicaciones de blog, posts en redes sociales o miniaturas de vídeo, directamente desde un Mac, con control total sobre el prompt.
- Automatización de assets en pipelines de desarrollo: integrar el modelo en un flujo de CI/CD para generar imágenes de test, iconos o capturas de pantalla simuladas a partir de especificaciones textuales.
- Educación y demostraciones: utilizar el modelo como herramienta didáctica para explicar el funcionamiento de los modelos de difusión y la cuantización, gracias a su naturaleza abierta y su ejecución local.
- Investigación en generación de imágenes: servir como punto de partida para experimentos de fine-tuning o adaptación, ya que la licencia Apache 2.0 permite modificaciones y uso comercial.
- Asistencia creativa en escritura: un escritor puede generar imágenes de referencia para sus escenas o personajes, mejorando la inmersión y la consistencia visual en proyectos de narrativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas comparativas como FID, CLIP score o tiempos de inferencia para esta conversión MLX ni para el modelo original ERNIE-Image en el contexto de esta ficha.

## Requisitos de hardware

- Diseñado exclusivamente para Apple Silicon (chips M1, M2, M3 y posteriores); no es compatible con GPUs NVIDIA ni AMD en este formato.
- Memoria RAM unificada: el repositorio ocupa 6,9 GB en disco, por lo que se recomienda un mínimo de 8 GB de RAM unificada para cargar el modelo completo en memoria. Para un uso fluido con generación de imágenes de resolución media, se aconseja 16 GB o más.
- Almacenamiento: se necesitan al menos 7 GB de espacio libre para descargar y almacenar los pesos.
- Opciones de despliegue: la librería `ernie-image-mlx` proporciona una interfaz de línea de comandos (`ernie-image-mlx generate`) y una API Python. No se mencionan integraciones con servidores de inferencia como vLLM u Ollama, ya que el formato MLX está orientado a uso local en Apple.
- Latencia y throughput: no se han publicado mediciones específicas. La cuantización int4 reduce el uso de memoria y acelera la inferencia en comparación con la versión sin cuantizar, pero los tiempos exactos dependen del modelo de chip y de la resolución de salida.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generación de imágenes en el contexto de esta ficha. El modelo original ERNIE-Image se posiciona como un DiT de 8B parámetros, similar en tamaño a otros modelos de difusión como Stable Diffusion XL (2.6B) o SD3 (8B), pero no se han proporcionado métricas que permitan una comparación objetiva. La ventaja principal de esta versión MLX es su optimización para Apple Silicon, un nicho donde otras alternativas requieren herramientas de conversión adicionales.

## Limitaciones y advertencias

- La cuantización int4 puede degradar ligeramente la calidad de las imágenes generadas en comparación con los pesos en fp16 o fp32, especialmente en detalles finos o texturas complejas.
- El modelo está limitado a hardware Apple Silicon; no puede ejecutarse en GPUs convencionales sin una conversión adicional a otro formato (por ejemplo, PyTorch).
- No se ha documentado el rendimiento del modelo en tareas distintas a la generación de imágenes a partir de texto; no se confirma soporte para edición, inpainting o outpainting.
- La información sobre sesgos y alucinaciones del modelo original no está disponible en esta conversión. Como cualquier modelo generativo, puede producir imágenes con estereotipos o contenidos no deseados.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el uso cumple con las leyes de propiedad intelectual y derechos de imagen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una conversión reciente y poco validada por la comunidad; se recomienda probar en un entorno de desarrollo antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dgrauet/ernie-image-sft-mlx-q4
- Repositorio del port MLX: https://github.com/dgrauet/ernie-image-mlx
- Herramienta de conversión mlx-forge: https://github.com/dgrauet/mlx-forge
- Colección de modelos ERNIE Image de dgrauet: https://huggingface.co/collections/dgrauet/ernie-image
- Sitio web de referencia de ERNIE Image (Baidu): https://ernie-image.github.io/
