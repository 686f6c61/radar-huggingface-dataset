# d0gr/falconsai-nsfw-detector-onnx

## Resumen

El modelo `d0gr/falconsai-nsfw-detector-onnx` es una exportación a ONNX con cuantización dinámica int8 del detector de contenido NSFW `Falconsai/nsfw_image_detection`, desarrollado originalmente por Falcons.ai. Este mirror ha sido creado por el usuario d0gr para garantizar que la extensión "Generate AI Images" disponga de una versión estable y reproducible del clasificador, evitando que cambios en el modelo original alteren el comportamiento del filtro de seguridad. El modelo es un Vision Transformer (ViT) de tamaño base, preentrenado en ImageNet-21k y ajustado sobre un dataset propietario de 80 000 imágenes, que clasifica imágenes en dos categorías: `normal` y `nsfw`.

La relevancia de este modelo radica en su formato ONNX optimizado (int8), que permite una inferencia rápida y ligera en entornos de producción, incluso en CPU. Además, la validación realizada por el autor indica que las puntuaciones coinciden con el modelo original en 3-4 decimales en un conjunto de prueba benigno, y corrige falsos positivos graves presentes en mirrors anteriores. Es una herramienta práctica para moderación de contenido, filtrado en pipelines de generación de imágenes y sistemas de seguridad visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base, patch16-224) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | int8 dinamico |
| Idiomas soportados | no disponible (independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo base es un `google/vit-base-patch16-224-in21k`, un Vision Transformer de 86 millones de parámetros (aunque el número exacto no se especifica en la información disponible), preentrenado en ImageNet-21k y posteriormente ajustado por Falcons.ai sobre un dataset propio de 80 000 imágenes con alta variabilidad, según la ficha de aimodels.fyi. La tarea es clasificación binaria: `normal` (0) y `nsfw` (1). El mirror ONNX mantiene la misma arquitectura y pesos, pero exportado con cuantización dinámica int8 para reducir el tamaño y acelerar la inferencia. El contrato de entrada especifica tensores `pixel_values` de forma `[B, 3, 224, 224]` en float32, con preprocesado de redimensionado bilineal a 224×224, normalización a `[0,1]` y posterior escalado a `[-1,1]` mediante `(x−0.5)/0.5`. La salida son logits de forma `[B, 2]` que se convierten en probabilidades mediante softmax.

La cuantización fue validada contra el modelo original en PyTorch, obteniendo coincidencias de 3 a 4 decimales en un conjunto de prueba fotorealista benigno. Este mirror reemplaza a una versión anterior basada en AdamCodd que producía falsos positivos inaceptables (puntuaciones NSFW de 0.6–0.85 en retratos fotorealistas completamente vestidos); el modelo actual puntúa el mismo conjunto con valores ≤0.005.

## Capacidades

- Clasificación binaria de imágenes en dos categorías: `normal` y `nsfw`.
- Detección de contenido explícito o sensible en imágenes fotorrealistas.
- Inferencia eficiente gracias a la cuantización int8, apta para CPU y entornos con recursos limitados.
- Compatible con pipelines de procesamiento de imágenes (ONNX Runtime, OpenCV, etc.).
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente discriminativo de visión.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en un servicio de revisión automática de imágenes subidas por usuarios, clasificándolas como `normal` o `nsfw` para decidir si se publican o se envían a revisión humana. Su bajo coste computacional permite procesar grandes volúmenes en tiempo real.
- Filtro de seguridad en generación de imágenes: la extensión "Generate AI Images" (del autor d0gr) lo utiliza como comprobación previa a la difusión de resultados, bloqueando imágenes que superen un umbral de probabilidad NSFW. La cuantización int8 garantiza una latencia mínima sin sacrificar precisión.
- Control parental en aplicaciones de navegación o galerías: se puede usar como clasificador local para ocultar o advertir sobre contenido potencialmente explícito en dispositivos personales.
- Archivado y etiquetado automático de bibliotecas de imágenes: en entornos corporativos o de investigación, el modelo puede asignar etiquetas de contenido sensible a grandes colecciones de imágenes, facilitando la gestión de permisos y accesos.
- Prevención de CSAM en plataformas colaborativas: aunque no es un detector especializado, puede actuar como primera barrera para identificar contenido sospechoso y derivarlo a sistemas específicos.
- Validación de datasets para entrenamiento de otros modelos: antes de usar un conjunto de imágenes para fine-tuning, se puede filtrar automáticamente el contenido no deseado, reduciendo el riesgo de sesgos o problemas legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación documentada es la comparación de la cuantización contra el modelo fp32 original, donde las puntuaciones coinciden en 3-4 decimales en un conjunto de prueba benigno. No hay datos de precisión, recall o F1 sobre datasets públicos como el de la tarea de detección NSFW de HuggingFace.

## Requisitos de hardware

- VRAM estimada: al ser un modelo ViT-base en int8, la inferencia en GPU requiere menos de 1 GB de VRAM; en CPU, la memoria RAM necesaria es inferior a 500 MB.
- GPU recomendadas: cualquier GPU con soporte para ONNX Runtime (incluso integradas) es suficiente; para lotes grandes se recomienda una GPU con al menos 4 GB de VRAM.
- Es perfectamente viable en hardware de consumo (Raspberry Pi 4, portátiles sin GPU dedicada) gracias al formato int8.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), OpenCV DNN, o integración en servicios como Mixpeek (que lo ofrece como extractor gestionado). También puede usarse con herramientas como FastAPI para crear un endpoint REST.
- Latencia y throughput: no hay datos oficiales, pero por la naturaleza del modelo y la cuantización, se espera una latencia inferior a 50 ms por imagen en CPU moderna y varios cientos de imágenes por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| d0gr/falconsai-nsfw-detector-onnx | ViT-base | no disponible | N/A | Apache-2.0 | ONNX int8 | Mirror optimizado, validado contra fp32 |
| Falconsai/nsfw_image_detection | ViT-base | ~86M (estimado) | N/A | Apache-2.0 | PyTorch | Modelo original, requiere más recursos |
| AdamCodd/nsfw-detector (mirror anterior) | ViT-base | no disponible | N/A | Apache-2.0 | PyTorch | Reemplazado por falsos positivos altos |

La comparativa se basa en la información disponible; no hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para imágenes fotorrealistas; puede fallar en ilustraciones, dibujos animados o contenido artístico estilizado.
- La validación de cuantización se realizó solo en un conjunto benigno; no se ha probado exhaustivamente en casos límite o adversarios.
- No es un detector de CSAM especializado; su uso para ese fin requiere validación adicional y cumplimiento legal.
- Aunque la licencia es Apache-2.0, el uso en producción debe considerar las implicaciones éticas y legales de la moderación de contenido.
- El modelo no ofrece explicabilidad; las decisiones son binarias y no proporcionan justificaciones.
- Puede presentar sesgos según el dataset de entrenamiento (80 000 imágenes propietarias), no documentado públicamente.
- No se garantiza soporte oficial; es un mirror comunitario mantenido por d0gr.

## Enlaces

- [HuggingFace - d0gr/falconsai-nsfw-detector-onnx](https://huggingface.co/d0gr/falconsai-nsfw-detector-onnx)
- [HuggingFace - Falconsai/nsfw_image_detection (modelo base)](https://huggingface.co/Falconsai/nsfw_image_detection)
- [Falcons.ai - Producto NSFW Detection](https://falcons.ai/products/nsfw-image-detection)
- [Perfil de Falconsai en HuggingFace](https://huggingface.co/Falconsai)
- [Ficha en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/nsfwimagedetection-falconsai)
- [Mixpeek Model Hub - nsfw_image_detection](https://mixpeek.com/model/Falconsai/nsfw_image_detection)
