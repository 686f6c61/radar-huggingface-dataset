# ChrisColeTech/qwen-image-edit-turbo-GGUF

## Resumen

El modelo `qwen-image-edit-turbo-GGUF` es una reconstrucción cuantizada del modelo de edición de imágenes Qwen-Image-Edit-2511, publicada por el usuario ChrisColeTech. Se trata de un modelo de 20.430 millones de parámetros (20,4B) orientado a la edición de imágenes mediante instrucciones en lenguaje natural, con el LoRA Lightning de 8 pasos ya fusionado en los pesos, lo que permite generar o editar imágenes con solo 8 pasos de denoising y sin necesidad de clasifier-free guidance (CFG-free). El repositorio contiene únicamente los pesos requantizados y reorganizados, no un reentrenamiento, y está pensado para ejecutarse en una GPU de 24 GB de VRAM.

La relevancia de este modelo radica en que acerca un sistema de edición de imágenes de gran tamaño (20B) a hardware de consumo, gracias al formato GGUF y a la cuantización. Soporta tanto generación texto-a-imagen (txt2img) como edición imagen-a-imagen (img2img) basada en instrucciones, y según la tarjeta del modelo preserva la composición de la escena original de forma fiel en las ediciones, algo que no siempre consiguen otros modelos de la misma familia. La licencia figura como "unknown", lo que supone una limitación importante para su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; basado en Qwen/Qwen-Image-Edit-2511 |
| Parametros totales | 20.430.401.088 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de generación de imágenes) |
| Tipos de cuantizacion | GGUF (niveles de cuantización no especificados) |
| Idiomas soportados | No disponibles |
| Licencia | unknown |
| Formato de pesos | GGUF (también safetensors en el repo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen-Image-Edit-2511, un modelo de difusión de 20,4B parámetros desarrollado por Alibaba (Qwen). Este repositorio no introduce cambios arquitectónicos: se trata de una requantización a formato GGUF y una reorganización de los pesos en una disposición dividida (split-layout) para facilitar su carga. El LoRA Lightning de 8 pasos ya viene fusionado en los pesos, lo que elimina la necesidad de un scheduler de muchos pasos y permite trabajar con 8 pasos de denoising. Además, el modelo es CFG-free: la escala de true-CFG está fijada en 1.0, de modo que la rama negativa no se utiliza. No se proporcionan datos sobre el dataset de entrenamiento ni sobre el proceso de ajuste fino; la tarjeta indica explícitamente que no es un retrain, sino una conversión de pesos.

## Capacidades

- Edición de imágenes por instrucción: acepta una imagen de entrada y una instrucción textual (por ejemplo, "coloca un pequeño sombrero rojo de mago sobre la manzana") y produce la imagen editada.
- Generación texto-a-imagen (txt2img): puede generar imágenes desde cero a partir de una descripción textual.
- Preservación de la composición: según las muestras publicadas, mantiene la posición de los objetos, las sombras y el encuadre al aplicar ediciones, gracias a su naturaleza de modelo de instrucción (no depende del parámetro `strength`).
- Funcionamiento con 8 pasos de denoising y sin guidance (guidance scale 1.0), lo que reduce el coste computacional frente a modelos de difusión estándar.
- El parámetro `strength` es inerte en modo img2img: el modelo interpreta el prompt como una instrucción de edición y no como una proporción de denoising.

## Casos de uso

- Edición de fotografías de producto: modificar el fondo, la iluminación o añadir elementos a una imagen de catálogo sin alterar el producto principal, gracias a la preservación de la composición.
- Restyling artístico: transformar una fotografía en una pintura al óleo, acuarela o cualquier otro estilo mediante una instrucción textual, manteniendo la escena reconocible.
- Corrección de imágenes: eliminar o añadir objetos, cambiar el entorno o ajustar detalles concretos de una imagen existente con una orden en lenguaje natural.
- Generación de imágenes conceptuales: crear ilustraciones o fotos desde cero para moodboards, storyboards o presentaciones, con 8 pasos de inferencia.
- Automatización de flujos de diseño: integrar el modelo en pipelines de generación y retoque de imágenes para entornos de diseño gráfico o publicidad, donde se requiere consistencia entre iteraciones.
- Prototipado rápido en entornos con recursos limitados: al caber en una GPU de 24 GB, permite experimentar con edición de imágenes de 20B en estaciones de trabajo con una sola tarjeta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del modelo no incluye métricas numéricas (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros modelos de edición de imágenes.

## Requisitos de hardware

- VRAM estimada: el modelo cabe en una GPU con 24 GB de VRAM según la tarjeta del repositorio, gracias a la cuantización GGUF.
- GPU recomendadas: el ejemplo de inferencia de la tarjeta se ejecutó en una A100 de 80 GB, con un tiempo aproximado de 210 segundos para una imagen de 1024×1024 en modo img2img con 8 pasos. En GPUs de consumo como una RTX 4090 (24 GB) debería ser viable, aunque no se aportan tiempos concretos.
- Opciones de despliegue: el repositorio está orientado a la librería `diffusers` (pipeline image-to-image). Al tratarse de pesos GGUF, es probable que requiera un runtime compatible con cuantización GGUF para modelos de difusión, aunque no se especifica en la documentación.
- Latencia: no se proporcionan datos de throughput. El único dato disponible es el tiempo de 210 s en A100 80GB para una imagen 1024×1024.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. El modelo más directamente comparable es el Qwen-Image-Edit-2511 original (sin cuantizar), del que este repositorio es una derivación. Otros modelos de edición por instrucción como InstructPix2Pix o los editores de la familia SDXL no tienen parámetros públicos comparables en esta información. Se recomienda consultar los benchmarks oficiales de Qwen-Image-Edit-2511 para evaluar el rendimiento relativo.

## Limitaciones y advertencias

- Licencia "unknown": no se puede garantizar el uso comercial ni la redistribución. Es imprescindible verificar la licencia del modelo base Qwen-Image-Edit-2511 antes de cualquier despliegue en producción.
- Riesgo de alucinaciones visuales: como todo modelo generativo, puede introducir detalles no presentes en la imagen original o interpretar incorrectamente instrucciones ambiguas.
- Sesgos potenciales: al ser un modelo de difusión entrenado con datos web, puede reflejar sesgos de género, raza o cultura en las imágenes generadas o editadas.
- Sin soporte de idiomas documentado: la tarjeta no especifica qué idiomas acepta para las instrucciones; probablemente funcione mejor en inglés, pero no está confirmado.
- Tiempo de inferencia elevado: 210 segundos por imagen en una A100 80GB puede ser inaceptable para aplicaciones en tiempo real.
- El parámetro `strength` es inerte: los usuarios acostumbrados a otros modelos img2img pueden confundirse al intentar controlar el grado de edición.
- No hay información sobre el proceso de cuantización (niveles exactos, pérdida de calidad) ni sobre la compatibilidad con todos los backends de GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ChrisColeTech/qwen-image-edit-turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
