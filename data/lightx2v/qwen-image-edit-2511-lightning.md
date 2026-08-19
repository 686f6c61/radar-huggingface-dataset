# lightx2v/Qwen-Image-Edit-2511-Lightning

## Resumen

Qwen-Image-Edit-2511-Lightning es una colección de modelos optimizados para edición de imágenes, desarrollada por el equipo de lightx2v (vinculado al grupo ModelTC). El proyecto parte del modelo base Qwen/Qwen-Image-Edit-2511 y aplica técnicas de destilación de pasos y cuantización para reducir drásticamente el coste computacional de la inferencia. El resultado es un conjunto de archivos que permiten realizar ediciones de imágenes en tan solo 4 pasos de muestreo, frente a los 40 pasos típicos del modelo original, logrando una aceleración aproximada de 10 veces.

El repositorio incluye tres variantes principales: dos LoRA destiladas (en BF16 y FP32) y un modelo base cuantizado en FP8 que ya incorpora la destilación fusionada. Esta combinación aborda dos problemas clave en la adopción de modelos de difusión para edición de imágenes: la latencia excesiva en entornos de producción y los elevados requisitos de memoria GPU. La licencia Apache 2.0 facilita su uso comercial, y su compatibilidad con frameworks como ComfyUI, Qwen-Image-Lightning y LightX2V amplía su integración en flujos de trabajo existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imágenes (basado en Qwen-Image-Edit-2511) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imágenes) |
| Tipos de cuantizacion | BF16, FP32, FP8 (e4m3fn scaled) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos individuales: LoRA y modelo fusionado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen-Image-Edit-2511, un modelo de difusión de última generación para tareas de edición de imágenes guiadas por texto. La contribución principal de esta variante Lightning es la destilación de pasos: mediante un proceso de destilación (probablemente basado en técnicas como progressive distillation o consistency models), se entrena una LoRA que reduce el número de pasos de muestreo necesarios de 40 a 4, manteniendo una calidad visual aceptable. Esta LoRA se ofrece en dos precisiones (BF16 y FP32) para equilibrar precisión y velocidad.

Además, se proporciona un modelo base cuantizado en FP8 (formato e4m3fn con escala) que ya incluye la LoRA destilada fusionada. Esta cuantización reduce el uso de memoria GPU en aproximadamente un 50% en comparación con FP32, según la documentación del autor. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de destilación específico (p. ej., si se usó RLHF o DPO), por lo que estos datos no están disponibles.

## Capacidades

- Edición de imágenes guiada por texto: modificación de atributos, objetos, estilo y composición mediante instrucciones en lenguaje natural.
- Generación de imágenes desde cero (text-to-image), según las etiquetas del pipeline.
- Inferencia en 4 pasos de muestreo, lo que permite tiempos de respuesta casi en tiempo real en GPUs adecuadas.
- Soporte para cuantización FP8, reduciendo el consumo de memoria sin sacrificar excesivamente la fidelidad.
- Compatible con ComfyUI, Qwen-Image-Lightning y LightX2V, facilitando la integración en pipelines de generación y edición.
- Al estar basado en Qwen-Image-Edit-2511, hereda las capacidades multilingües de comprensión de instrucciones del modelo base, aunque no se especifican los idiomas exactos.

## Casos de uso

- Edición de imágenes en tiempo real para aplicaciones de diseño: los 4 pasos de inferencia permiten iterar rápidamente sobre borradores visuales, ajustando colores, fondos o elementos concretos sin esperas prolongadas.
- Automatización de retoques fotográficos en entornos de producción: con la variante FP8, es viable desplegar el modelo en GPUs con memoria limitada (p. ej., RTX 3060 o similares) para procesar lotes de imágenes de forma eficiente.
- Generación de variantes de producto para comercio electrónico: dado un producto base, se pueden generar múltiples fondos, estilos o ángulos con instrucciones de texto, acelerando la creación de catálogos.
- Asistentes de diseño conversacionales: integrado en un chatbot, el modelo puede interpretar peticiones del usuario ("cambia el cielo a un atardecer", "haz que el coche sea rojo") y devolver la imagen editada en segundos.
- Preprocesamiento de datos para entrenamiento de otros modelos: la edición rápida permite sintetizar pares de imagen-entrada/salida para fine-tuning de modelos de visión o para aumentar datasets.
- Creación de contenido para marketing y redes sociales: los equipos creativos pueden generar variaciones de imágenes para campañas sin depender de herramientas de edición manual, reduciendo el tiempo de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una aceleración aproximada de 10 veces frente a la inferencia estándar de 40 pasos, y una reducción de memoria de ~50% con FP8 respecto a FP32, pero no se ofrecen cifras concretas de calidad (p. ej., FID, CLIP score) ni comparativas con otros modelos de edición.

## Requisitos de hardware

- La variante FP8 está diseñada para reducir el consumo de memoria GPU en aproximadamente un 50% en comparación con FP32, lo que la hace adecuada para GPUs de gama media (p. ej., RTX 3060, RTX 4060) siempre que el modelo base completo quepa en VRAM. El tamaño exacto del modelo no se especifica, pero el repositorio ocupa 107.7 GB en total (incluyendo las tres variantes).
- Las variantes LoRA (BF16/FP32) requieren el modelo base Qwen-Image-Edit-2511, que debe cargarse por separado; el consumo de VRAM dependerá del tamaño de dicho modelo (no disponible en la información).
- Para inferencia en 4 pasos, se recomienda una GPU con al menos 16 GB de VRAM para la versión FP8, aunque el dato exacto no está confirmado.
- Opciones de despliegue: compatible con ComfyUI, Qwen-Image-Lightning (GitHub) y LightX2V (GitHub). No se menciona soporte directo para vLLM u Ollama, dado que no es un modelo de lenguaje.
- La latencia estimada no se ha publicado; la aceleración de 10x se refiere al número de pasos, no al tiempo absoluto, que depende del hardware.

## Comparativa con modelos similares

| Modelo | Pasos de inferencia | Precisión | Memoria GPU | Licencia |
|---|---|---|---|---|
| Qwen-Image-Edit-2511 (base) | 40 | BF16/FP32 | Alta | Apache 2.0 |
| Qwen-Image-Edit-2511-Lightning (este) | 4 | BF16/FP32/FP8 | Reducida (FP8) | Apache 2.0 |

No se dispone de información suficiente para comparar con otros modelos de edición de imágenes como InstructPix2Pix o FLUX.1 Kontext, ya que no se han publicado métricas de rendimiento ni requisitos detallados.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al derivar de Qwen-Image-Edit-2511, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- La destilación a 4 pasos puede reducir la fidelidad en tareas complejas o con instrucciones ambiguas; se recomienda validar la calidad en casos de uso concretos.
- La cuantización FP8 puede introducir artefactos en imágenes de alta resolución o con detalles finos, aunque el autor afirma que se mantiene la fidelidad de edición.
- El tamaño del repositorio (107.7 GB) puede ser un obstáculo para la descarga en entornos con ancho de banda limitado, aunque los archivos individuales pueden descargarse por separado.
- La documentación no especifica los idiomas soportados para las instrucciones de texto, lo que puede afectar a la usabilidad en entornos multilingües.
- Para producción, es necesario verificar la compatibilidad con el framework elegido (ComfyUI, LightX2V) y realizar pruebas de carga, ya que no se proporcionan guías de despliegue a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
- Repositorio Qwen-Image-Lightning: https://github.com/ModelTC/Qwen-Image-Lightning/
- Documentación de LightX2V para Qwen Image Edit: https://github.com/ModelTC/LightX2V/blob/main/examples/qwen_image/README.md
- Repositorio LightX2V (para issues): https://github.com/ModelTC/LightX2V/issues
