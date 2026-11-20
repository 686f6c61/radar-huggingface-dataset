# AX1Y2JP/MobileCLIP2-L-14-ONNX

## Resumen

MobileCLIP2-L-14-ONNX es una exportación a formato ONNX del modelo de visión-lenguaje MobileCLIP2-L-14, desarrollado originalmente por Apple Machine Learning Research y publicado por primera vez en el repositorio `apple/MobileCLIP2-L-14`. Esta versión concreta, alojada por el usuario AX1Y2JP, convierte los codificadores de imagen y texto en dos grafos ONNX independientes, lo que facilita su despliegue en entornos de producción que no dependen de PyTorch. El modelo resuelve tareas de clasificación de imágenes zero-shot mediante similitud coseno entre embeddings de imagen y texto.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y portable para pipelines de visión por computador que necesitan ejecutarse con ONNX Runtime, incluyendo variantes cuantizadas en fp16 e int8. El repositorio ocupa 3,1 GB e incluye el tokenizador y los grafos exportados con opset 23, lo que requiere ONNX Runtime 1.22 o superior.

No se dispone de información sobre el número exacto de parámetros, la longitud de contexto textual ni los idiomas soportados en la documentación proporcionada. La licencia es la Apple Machine Learning Research Model License Agreement (apple-amlr), que impone restricciones específicas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (codificadores de imagen y texto separados, exportados como grafos ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos fp16, E/S float32) e int8 (MatMulNBits weight-only, embedding de tokens int8 por filas) |
| Idiomas soportados | no disponible |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement) |
| Formato de pesos | ONNX (opset 23, ONNX Runtime 1.22+), tokenizer.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CLIP estándar con dos torres: un codificador de imagen y un codificador de texto que proyectan sus entradas a un espacio latente común. La exportación separa ambos codificadores en grafos ONNX independientes (`vision_model_fp16.onnx` y `text_model_fp16.onnx`), lo que permite ejecutar cada torre por separado y reutilizar embeddings precalculados. El preprocesado de imagen sigue el esquema habitual de CLIP: redimensionado bicúbico al lado corto de 224 píxeles, recorte central de 224x224 y normalización con medias y desviaciones típicas específicas de CLIP.

La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que el tokenizador incluido rellena con el id 0 para coincidir con open_clip, corrigiendo un problema del tokenizador original de Hugging Face que rellenaba con el token de fin de texto y degradaba la precisión zero-shot. El valor `logit_scale` se almacena en los metadatos del grafo ONNX y debe recuperarse en tiempo de inferencia para escalar los logits.

## Capacidades

- Clasificación de imágenes zero-shot mediante comparación de embeddings de imagen y texto.
- Generación de embeddings de imagen y de texto normalizados, reutilizables para búsqueda o recuperación multimodal.
- Ejecución en CPU y GPU a través de ONNX Runtime, con proveedores CUDA y CPU.
- Variantes cuantizadas fp16 e int8 para reducir requisitos de memoria y acelerar la inferencia.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modos de pensamiento o visión generativa.
- No se documentan capacidades de generación de texto, código o matemáticas.

## Casos de uso

- Clasificación automática de imágenes en catálogos de producto: el modelo permite asignar etiquetas textuales a imágenes sin entrenamiento específico, calculando la similitud entre el embedding de la imagen y las descripciones de cada categoría.
- Moderación de contenido visual: se pueden definir etiquetas textuales de categorías no deseadas y usar la clasificación zero-shot para filtrar imágenes en pipelines de ingestión.
- Búsqueda multimodal en bases de datos de imágenes: al generar embeddings normalizados de imagen y texto, se puede construir un índice vectorial y recuperar imágenes a partir de consultas en lenguaje natural.
- Etiquetado semiautomático de datasets: el modelo puede preetiquetar grandes colecciones de imágenes con categorías definidas por el usuario, reduciendo el trabajo manual de anotación.
- Despliegue en entornos sin PyTorch: gracias a la exportación ONNX y a las variantes fp16 e int8, el modelo puede integrarse en servicios basados en ONNX Runtime, incluyendo entornos embebidos o con recursos limitados.
- Filtrado y enrutamiento en pipelines de visión: el modelo puede actuar como clasificador previo para decidir qué imágenes requieren un modelo más pesado, ahorrando cómputo en etapas posteriores.
- Análisis de accesibilidad: clasificación de imágenes para generar descripciones categóricas o detectar contenido relevante en aplicaciones de asistencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 3,1 GB, lo que incluye los grafos ONNX en fp16 e int8 y el tokenizador; el peso en memoria depende de la variante cargada.
- La variante fp16 reduce el uso de memoria respecto a fp32; la variante int8 con MatMulNBits y embedding de tokens int8 reduce aún más el peso, aunque solo es compatible con ONNX Runtime.
- Se recomienda GPU con soporte CUDA para la variante fp16; la variante int8 puede ejecutarse en CPU con ONNX Runtime.
- No se especifican modelos de GPU concretos ni estimaciones de VRAM en la información proporcionada.
- Opciones de despliegue: ONNX Runtime 1.22 o superior con proveedores CUDAExecutionProvider y CPUExecutionProvider.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MobileCLIP2-L-14-ONNX (esta ficha) | no disponible | no disponible | apple-amlr | ONNX | Hugging Face (AX1Y2JP) |
| apple/MobileCLIP2-L-14 | no disponible | no disponible | apple-amlr | PyTorch (safetensors) | Hugging Face (apple) |
| timm/MobileCLIP2-L-14-OpenCLIP | no disponible | no disponible | no disponible | PyTorch | Hugging Face (timm) |

No se dispone de datos de rendimiento comparativo ni de otros modelos CLIP alternativos en la información proporcionada.

## Limitaciones y advertencias

- La licencia apple-amlr impone restricciones específicas; es necesario revisar el acuerdo antes de cualquier uso comercial.
- El modelo está diseñado para clasificación zero-shot y recuperación multimodal; no es un modelo generativo y no produce texto libre.
- No se documentan sesgos conocidos, pero al ser un modelo CLIP hereda los sesgos de sus datos de entrenamiento originales, no detallados en la información disponible.
- El tokenizador incluido corrige el relleno con id 0; usar el tokenizador original de Hugging Face puede degradar la precisión zero-shot.
- La variante int8 solo es compatible con ONNX Runtime y requiere el operador MatMulNBits.
- No se dispone de información sobre el rendimiento en idiomas distintos del inglés ni sobre la cobertura lingüística.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una exportación reciente y sin validación comunitaria amplia.
- No se han publicado benchmarks que permitan verificar la precisión de las variantes cuantizadas frente al modelo original.

## Enlaces

- [Hugging Face: AX1Y2JP/MobileCLIP2-L-14-ONNX](https://huggingface.co/AX1Y2JP/MobileCLIP2-L-14-ONNX)
- [Modelo original: apple/MobileCLIP2-L-14](https://huggingface.co/apple/MobileCLIP2-L-14)
- [Versión OpenCLIP: timm/MobileCLIP2-L-14-OpenCLIP](https://huggingface.co/timm/MobileCLIP2-L-14-OpenCLIP)
