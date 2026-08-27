# sin336/Qwen-Image-Edit-2511-Gaussian-Splash

## Resumen

Qwen-Image-Edit-2511-Gaussian-Splash es un adaptador LoRA para el modelo base Qwen/Qwen-Image-Edit-2511, especializado en edición de imágenes mediante técnicas de Gaussian splatting 3D. El modelo permite corregir la perspectiva de una escena, rellenar regiones vacías generadas tras rotaciones tridimensionales y mantener la coherencia visual entre dos imágenes de referencia. Ha sido desarrollado por el usuario sin336 y entrenado sin necesidad de código utilizando la infraestructura de ModelScope.

La relevancia de este adaptador radica en que amplía las capacidades del modelo base Qwen-Image-Edit-2511, que ya es un modelo de edición de imágenes de última generación, añadiendo un flujo de trabajo específico para manipulación de perspectiva 3D. El proyecto se apoya en la librería Sharp de Apple para la rotación de imágenes en 3D y se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial y modificación. El repositorio tiene un tamaño de 1,8 GB y está publicado en Hugging Face con el pipeline de image-to-image.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen-Image-Edit-2511 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio diffusers, 1,8 GB) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se integra sobre el modelo base Qwen-Image-Edit-2511, un modelo de edición de imágenes de la familia Qwen. El adaptador ha sido entrenado sin código mediante la plataforma de entrenamiento de ModelScope, lo que implica que el proceso de ajuste se realizó a través de una interfaz gráfica o automatizada, sin necesidad de escribir scripts de entrenamiento. No se han publicado detalles sobre el dataset utilizado, el número de pasos de entrenamiento ni las técnicas de alineación empleadas (como RLHF o DPO).

La innovación principal del adaptador reside en su integración con el flujo de trabajo de Gaussian splatting 3D. Utiliza la librería Sharp de Apple para realizar rotaciones tridimensionales de las imágenes y, a continuación, el modelo corrige la perspectiva y rellena las áreas vacías resultantes. El prompt por defecto recomendado por el autor es: "高斯泼溅,参考图2的场景图，修复图1的场景图透视并修复空白区域" (que se traduce como "Gaussian splatting, referencia la escena de la imagen 2, corrige la perspectiva de la escena de la imagen 1 y rellena las áreas en blanco"). Se indica que el flujo de trabajo basado en la versión 2509 del modelo base reproduce mejor los ángulos de perspectiva, mientras que el flujo basado en la versión 2511 ofrece mayor consistencia de imagen.

## Capacidades

- Edición de imágenes con corrección de perspectiva tridimensional mediante Gaussian splatting.
- Inpainting de regiones vacías generadas tras rotaciones 3D de la escena.
- Coherencia visual entre dos imágenes de referencia (imagen de escena e imagen a corregir).
- Integración con flujos de trabajo de ComfyUI a través del proyecto comfyui-GaussianViewer.
- Soporte de image-to-image mediante la librería diffusers.
- Capacidad de procesar prompts en chino (el prompt por defecto está en ese idioma), aunque no se especifican otros idiomas.

## Casos de uso

- Corrección de perspectiva en fotografías arquitectónicas: el modelo puede ajustar la perspectiva de edificios o estructuras capturadas con ángulos distorsionados, utilizando una segunda imagen de referencia como guía de la escena correcta.
- Relleno de áreas vacías en imágenes rotadas en 3D: al aplicar rotaciones tridimensionales a una imagen, se generan regiones sin información; el modelo rellena estas zonas de forma coherente con el resto de la escena.
- Edición de imágenes para realidad virtual y aumentada: permite generar vistas corregidas de entornos 3D a partir de imágenes 2D, útil en la creación de assets para experiencias inmersivas.
- Restauración de fotografías antiguas con perspectiva alterada: puede corregir deformaciones de perspectiva en imágenes históricas y rellenar las zonas dañadas o ausentes.
- Generación de vistas alternativas de productos para comercio electrónico: a partir de una foto de producto, se puede generar una vista corregida con perspectiva mejorada y sin huecos, mejorando la presentación visual.
- Postproducción cinematográfica y de vídeo: el modelo puede utilizarse para corregir la perspectiva de fotogramas individuales y rellenar áreas vacías tras movimientos de cámara virtuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 1,8 GB, pero requiere el modelo base Qwen-Image-Edit-2511 para funcionar, cuyo tamaño no se especifica en la información disponible.
- No se dispone de datos sobre VRAM estimada, GPUs recomendadas ni opciones de despliegue específicas para este adaptador.
- Dado que se integra con ComfyUI y diffusers, es probable que funcione en GPUs de consumo medio-alto (por ejemplo, RTX 3060 o superior), pero no hay confirmación oficial.
- Se recomienda consultar la documentación del modelo base Qwen-Image-Edit-2511 para conocer los requisitos de hardware completos.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Licencia | Especialidad |
|---|---|---|---|---|
| sin336/Qwen-Image-Edit-2511-Gaussian-Splash | LoRA sobre Qwen-Image-Edit-2511 | 1,8 GB | Apache-2.0 | Gaussian splatting 3D, corrección de perspectiva |
| dx8152/Qwen-Image-Edit-2511-Gaussian-Splash | LoRA sobre Qwen-Image-Edit-2511 | no disponible | Apache-2.0 | Gaussian splatting 3D, corrección de perspectiva (variante similar) |
| Qwen/Qwen-Image-Edit-2511 | Modelo base de edición de imágenes | no disponible | Apache-2.0 | Edición general de imágenes, image-to-image |

No se dispone de datos de rendimiento comparativo entre estos modelos. La variante de dx8152 parece ser una versión similar con el mismo propósito, pero no se especifican diferencias técnicas concretas.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un adaptador entrenado sobre un modelo base, puede heredar los sesgos del modelo Qwen-Image-Edit-2511.
- Riesgo de alucinación en el relleno de regiones vacías: el modelo puede generar contenido plausible pero incorrecto en las áreas que debe reconstruir, especialmente si la referencia de escena no es clara.
- Limitaciones de idioma: el prompt por defecto está en chino y no se especifica soporte multilingüe; es posible que el rendimiento sea inferior con prompts en otros idiomas.
- Dependencia del modelo base: el adaptador no funciona de forma independiente; requiere cargar Qwen-Image-Edit-2511, lo que implica requisitos de hardware adicionales.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las librerías dependientes (como Sharp de Apple) para asegurar el cumplimiento.
- No hay información sobre la calidad de la corrección de perspectiva en casos extremos (ángulos muy pronunciados o escenas complejas).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sin336/Qwen-Image-Edit-2511-Gaussian-Splash
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Variante similar de dx8152: https://huggingface.co/dx8152/Qwen-Image-Edit-2511-Gaussian-Splash
- Página en ModelScope: https://www.modelscope.cn/models/dx8152/Qwen-Image-Edit-2511-Gaussian-Splash
- Proyecto comfyui-GaussianViewer: https://github.com/CarlMarkswx/comfyui-GaussianViewer
- Librería Sharp de Apple: https://github.com/apple/ml-sharp
- Enlace de ejecución en línea: https://www.runninghub.ai/post/2011085906899374081?inviteCode=rh-v1331
- Tutorial de flujo de trabajo: https://youtu.be/MplcDHeDNiw
- Vídeo en YouTube: https://youtu.be/9Vyxjty9Qao
- Vídeo en Bilibili: https://www.bilibili.com/video/BV1enrjBMECz/
- Comunidad Discord: https://discord.gg/yVAVa43mWk
