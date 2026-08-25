# qualcomm/SigLIP2

## Resumen

SigLIP2 (Sigmoid Loss for Language-Image Pre-training 2) es un modelo de visión-lenguaje desarrollado por Google que calcula la similitud coseno entre imágenes y prompts de texto. Esta variante publicada por Qualcomm contiene los pesos pre-exportados y optimizados para ejecución en dispositivos con chipsets Snapdragon y Dragonwing, utilizando la NPU integrada. El modelo resuelve tareas de clasificación de imágenes zero-shot, búsqueda visual y moderación de contenido sin necesidad de fine-tuning específico por tarea.

La relevancia de esta versión radica en que permite desplegar un encoder de visión-lenguaje de última generación en dispositivos móviles y edge con latencias de inferencia de entre 2 y 13 ms según el chipset, gracias a la cuantización w8a16 y a la compilación específica para la pila Qualcomm AI Runtime (QAIRT). El checkpoint base es `google/siglip2-base-patch16-224`, con una resolución de entrada de 224x224 píxeles y una longitud máxima de secuencia de texto de 64 tokens. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language encoder (basado en google/siglip2-base-patch16-224) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (secuencia de entrada del text encoder) |
| Tipos de cuantizacion | float32, w8a16 (pesos de 8 bits, activaciones de 16 bits) |
| Idiomas soportados | no disponible (el paper original reporta capacidades multilingues, pero no se especifica la lista en esta version) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (pre-exportados) |

## Arquitectura y entrenamiento

SigLIP2 es un modelo de doble encoder (imagen y texto) que emplea una funcion de perdida sigmoide en lugar de la softmax contrastiva tipica de CLIP. El checkpoint base `google/siglip2-base-patch16-224` utiliza un transformer ViT de 16 parches para el encoder de imagen y un transformer para el encoder de texto. Segun el paper arXiv 2502.14786, el entrenamiento combina el objetivo original de contraste imagen-texto con tecnicas adicionales: preentrenamiento basado en captioning, autodistilacion y prediccion enmascarada. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

La version de Qualcomm no modifica la arquitectura, sino que exporta los pesos a formatos optimizados para la NPU de sus chipsets. El encoder de imagen ocupa 352 MB en float y 92,8 MB en w8a16; el encoder de texto ocupa 1,05 GB en float y 461 MB en w8a16.

## Capacidades

- Clasificacion de imagenes zero-shot: dado un conjunto de etiquetas textuales, el modelo calcula la similitud coseno entre la imagen y cada etiqueta, asignando la clase con mayor puntuacion.
- Busqueda de imagenes por texto: permite recuperar imagenes relevantes a partir de una descripcion textual sin entrenamiento adicional.
- Moderacion de contenido: puede detectar contenido inapropiado comparando imagenes con prompts de texto predefinidos.
- Capacidades multilingues: el paper original reporta soporte para multiples idiomas, aunque la lista concreta no se indica en esta version.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un encoder de representaciones, no un modelo generativo de lenguaje.
- No incluye modo de pensamiento ni generacion de texto.

## Casos de uso

- Clasificacion de imagenes en dispositivos moviles: una aplicacion de fotografia puede etiquetar automaticamente las fotos del carrete (paisaje, mascota, comida) usando el modelo en local, sin enviar datos a la nube. La latencia de 4-6 ms en Snapdragon 8 Gen 3 permite procesamiento en tiempo real.
- Busqueda visual en galerias: el usuario escribe "playa al atardecer" y la aplicacion recupera las fotos correspondientes mediante la similitud coseno entre el texto y las imagenes almacenadas.
- Moderacion de contenido en redes sociales: un servidor edge equipado con chipsets Qualcomm puede filtrar imagenes inapropiadas antes de su publicacion, comparando cada imagen con un conjunto de prompts de riesgo.
- Asistente de accesibilidad: descripcion de imagenes para personas con discapacidad visual, generando una etiqueta textual a partir de la clasificacion zero-shot.
- Control de calidad en fabricacion: inspeccion visual de productos en lineas de produccion, clasificando defectos mediante prompts como "pieza con grieta" o "pieza correcta".
- Sistemas de recomendacion visual: en una aplicacion de comercio electronico, el modelo puede sugerir productos similares a partir de una foto del usuario, comparando la imagen con las descripciones de los catalogos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original (arXiv 2502.14786) reporta evaluaciones en tareas como clasificacion zero-shot, recuperacion y segmentacion, pero esos datos no se incluyen en la model card de esta version de Qualcomm. La tabla de rendimiento proporcionada se limita a tiempos de inferencia del encoder de imagen en distintos chipsets:

| Chipset | Precision | Tiempo de inferencia (ms) | Pico de memoria (MB) |
|---|---|---|---|
| Snapdragon X2 Elite | float | 4,737 | 2 |
| Snapdragon X Elite | float | 8,828 | 182 |
| Snapdragon 8 Gen 3 Mobile | float | 5,89 | 309 |
| Snapdragon 8 Gen 1 Mobile | float | 13,29 | 293 |
| Snapdragon 8 Elite Mobile | float | 4,244 | 177 |
| Snapdragon 8 Elite Gen 5 Mobile | float | 3,235 | 167 |
| Snapdragon X2 Elite | w8a16 | 2,393 | 1 |
| Snapdragon X Elite | w8a16 | 5,555 | 90 |
| Snapdragon 8 Gen 3 Mobile | w8a16 | 3,664 | 290 |
| Snapdragon 8 Gen 1 Mobile | w8a16 | 7,586 | 282 |

Estos datos corresponden exclusivamente al encoder de imagen; el encoder de texto no tiene tabla de rendimiento publicada.

## Requisitos de hardware

- VRAM estimada: el encoder de imagen en float ocupa 352 MB y en w8a16 92,8 MB; el encoder de texto en float 1,05 GB y en w8a16 461 MB. La memoria total depende de si se cargan ambos encoders simultaneamente.
- GPU recomendadas: no aplica, el modelo esta optimizado para la NPU de chipsets Qualcomm (Snapdragon y Dragonwing). No se proporcionan datos para GPUs de escritorio.
- Compatibilidad con hardware de consumo: si, en telefonos y portatiles con chipsets Snapdragon 8 Gen 1 o superior, y Snapdragon X Elite o superior.
- Opciones de despliegue: los archivos pre-exportados se pueden integrar con ONNX Runtime (version 1.27.1) o con la pila QAIRT 2.45. Tambien se puede usar la libreria Qualcomm AI Hub Models para exportar con configuraciones personalizadas.
- Latencia y throughput: segun la tabla de rendimiento, el encoder de imagen tarda entre 2,4 y 13,3 ms en float, y entre 2,4 y 23,3 ms en w8a16, dependiendo del chipset. No se indican valores de throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. SigLIP2 pertenece a la familia de encoders vision-lenguaje como CLIP o EVA-CLIP, pero no se han publicado en esta ficha metricas comparativas con esos modelos. La principal diferencia de esta version es su optimizacion especifica para hardware Qualcomm, que no tiene equivalente directo en otros ecosistemas.

## Limitaciones y advertencias

- El modelo es un encoder de representaciones, no un generador de texto: no puede producir descripciones ni responder preguntas de forma autonoma.
- La longitud de secuencia de texto esta limitada a 64 tokens, lo que restringe prompts complejos o descripciones largas.
- La tabla de rendimiento solo cubre el encoder de imagen; el encoder de texto puede tener requisitos de memoria y latencia significativamente mayores (1,05 GB en float).
- No se especifican los idiomas soportados en esta version, aunque el paper original indica capacidades multilingues.
- Los archivos pre-exportados estan vinculados a versiones concretas de QAIRT y ONNX Runtime; actualizaciones de estas dependencias pueden requerir re-exportacion.
- El rendimiento mostrado depende de la NPU de Qualcomm; en otros hardware (GPU NVIDIA, CPU x86) no se garantizan las mismas latencias.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta version especifica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/SigLIP2
- Paper original: https://arxiv.org/abs/2502.14786
- Blog de SigLIP 2: https://huggingface.co/blog/siglip2
- Documentacion de Transformers: https://huggingface.co/docs/transformers/model_doc/siglip2
- Repositorio Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.61.0/src/qai_hub_models/models/siglip2
- Qualcomm AI Hub: https://aihub.qualcomm.com/models/siglip2
