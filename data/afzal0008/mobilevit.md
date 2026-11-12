# AFZAL0008/MobileViT

## Resumen

AFZAL0008/MobileViT es un modelo de clasificación de imágenes publicado en Hugging Face por el usuario AFZAL0008. A pesar del nombre, no se trata de la arquitectura MobileViT original (que combina convoluciones y atención), sino de un fine-tuning de `google/mobilenet_v2_1.0_224`, una MobileNetV2 de 1.0 de factor de anchura y resolución de entrada de 224x224. El modelo se ha entrenado sobre un dataset de tipo `imagefolder` no especificado, presumiblemente un conjunto de imágenes propio organizado por clases.

El modelo tiene 2.260.546 parámetros y un tamaño de repositorio de 0,0 GB, lo que indica pesos muy ligeros y un despliegue viable en entornos con recursos muy limitados. Se distribuye en formato safetensors y es compatible con la librería Transformers y con la pipeline de `image-classification`. La licencia declarada es "other", sin que la model card aclare los términos concretos.

La relevancia de este modelo es limitada en el panorama general: la model card está generada automáticamente por el Trainer, no incluye descripción del dominio, de las clases, del conjunto de datos ni de los usos previstos. Es un artefacto de fine-tuning reproducible más que un modelo de propósito general, y debe evaluarse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (base google/mobilenet_v2_1.0_224), fine-tuning supervisado |
| Parametros totales | 2.260.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a la tarea de clasificación de imágenes) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de MobileNetV2, una red convolucional profunda con bloques residuales invertidos y conexiones lineales de cuello de botella, diseñada para inferencia eficiente en dispositivos móviles y de borde. La resolución de entrada asociada a la base es 224x224. El fine-tuning se realizó con el Trainer de Transformers sobre un dataset `imagefolder`, con learning rate 5e-05, batch size 16, optimizador AdamW fused (betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal, semilla 42 y 10 épocas, alcanzando 770 pasos de entrenamiento.

La pérdida de validación descendió de 0,3377 en la época 1 a 0,0531 en la época 10, con un mínimo intermedio de 0,0639 en la época 9. El número de ejemplos del dataset no se declara, pero con 770 pasos y batch 16 se infiere un conjunto de entrenamiento de aproximadamente 1.232 imágenes. No se documentan aumentos de datos, composición del dataset, número de tokens ni técnicas de alineación como RLHF o DPO, que no aplican a esta tarea.

## Capacidades

- Clasificación de imágenes en las clases definidas por el dataset `imagefolder` usado en el entrenamiento.
- Extracción de logits por clase mediante la pipeline `image-classification` de Transformers.
- Inferencia en CPU y en GPU de baja capacidad dado su reducido número de parámetros.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-step ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto; es un clasificador visual.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales.
- El dominio semántico de las clases es desconocido, por lo que la utilidad práctica fuera del dataset original es impredecible.

## Casos de uso

- Clasificación de imágenes en un dominio cerrado y concreto: si el dataset de entrenamiento corresponde a un catálogo propio (por ejemplo, tipos de producto o defectos), el modelo puede desplegarse como clasificador ligero en ese dominio, siempre que se validen las clases reales.
- Prototipado rápido de clasificadores visuales: sirve como punto de partida para fine-tuning adicional con `Trainer` sobre nuevos datasets en formato `imagefolder`, dado su bajo coste computacional.
- Inferencia en dispositivos de borde: con 2,26 M de parámetros, es viable en Raspberry Pi, móviles o CPUs modestas mediante exportación a ONNX o TorchScript.
- Filtrado previo en pipelines de datos: puede actuar como clasificador de primera etapa para descartar o etiquetar imágenes antes de modelos más pesados.
- Docencia y experimentación: útil para reproducir un flujo completo de fine-tuning con Transformers y comparar curvas de pérdida en un caso real de bajo coste.
- Evaluación comparativa de técnicas de regularización: su tamaño permite ejecutar decenas de experimentos (learning rates, épocas, aumentos) en poco tiempo para estudiar el sobreajuste en datasets pequeños.
- Automatización de etiquetado en lotes: para volúmenes moderados de imágenes donde la latencia por imagen debe ser de milisegundos en CPU.

## Benchmarks y rendimiento

La model card declara un `model-index` con el nombre "MobileViT" y una lista de resultados vacía. No se han publicado resultados de benchmarks (accuracy, F1, top-k) en la información disponible. El único dato cuantitativo es la pérdida de validación final de 0,0531, que no es comparable entre modelos ni permite inferir precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; con 2,26 M de parámetros, los pesos ocupan aproximadamente 9 MB en fp32 y 4,5 MB en fp16.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; funciona correctamente en GTX 1650, RTX 3050, T4 o incluso en CPU.
- Cabe en cualquier GPU de consumo e integrada; también en dispositivos móviles y SBC.
- Opciones de despliegue: pipeline de Transformers, exportación a ONNX Runtime, TorchScript, TensorFlow Lite (previa conversión) y TorchServe.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera del orden de milisegundos por imagen en CPU y por debajo del milisegundo en GPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AFZAL0008/MobileViT | 2,26 M | 224x224 | Clasificación de imágenes (fine-tuning) | other | Hugging Face |
| google/mobilenet_v2_1.0_224 | ~3,5 M (aprox.) | 224x224 | Clasificación ImageNet | Apache 2.0 | Hugging Face |
| apple/mobilevit-xx-small | ~1,3 M (aprox.) | 256x256 | Clasificación ImageNet | Apple Sample Code License | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, entrada, tarea y licencia.

## Limitaciones y advertencias

- La model card está generada automáticamente y no documenta el dominio de las clases, el dataset ni los usos previstos; el modelo no debe usarse en producción sin una validación previa sobre datos propios.
- A pesar del nombre, no implementa la arquitectura MobileViT; es un fine-tuning de MobileNetV2, lo que puede inducir a error en la selección del modelo.
- Licencia "other": no se especifican los términos de uso comercial; es imprescindible contactar con el autor o revisar el repositorio antes de un uso comercial.
- Riesgo de sobreajuste: 10 épocas sobre un dataset aparentemente pequeño (~1.232 imágenes) con pérdida de validación mínima en la última época; no hay curva de test independiente.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos de clase, demográficos o de dominio.
- No es un modelo generativo: no admite prompts de texto, tool calling ni razonamiento; cualquier uso fuera de la clasificación visual es inadecuado.
- Sin garantías de mantenimiento: 0 descargas y 0 likes en el momento de la consulta, y sin documentación de versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AFZAL0008/MobileViT
- Modelo base: https://huggingface.co/google/mobilenet_v2_1.0_224
- Documentación de MobileNetV2 en Transformers: https://huggingface.co/docs/transformers/model_doc/mobilenet_v2
- Documentación de la pipeline de clasificación de imágenes: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.ImageClassificationPipeline
