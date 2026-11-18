# Honey1118/surfaceguard-resnet18-unet

## Resumen

SurfaceGuard ResNet18-UNet es un modelo de segmentación semántica de imágenes desarrollado por el usuario Honey1118 bajo la etiqueta SurfaceGuard AI, orientado a la inspección industrial automatizada. Concretamente, detecta y localiza a nivel de píxel cuatro tipos de anomalías en superficies de acero: picaduras (pitting), inclusiones, arañazos y parches. Resuelve un problema clásico de control de calidad en entornos siderúrgicos y de fabricación, donde la inspección visual manual es lenta, subjetiva y difícil de escalar.

Técnicamente se trata de una U-Net con encoder ResNet-18, implementada mediante la librería segmentation-models-pytorch y exportada en formato safetensors. El modelo cuenta con 14.340.228 parámetros totales y un tamaño de repositorio de 0,1 GB, lo que lo sitúa en la gama ligera y permite inferencia en hardware modesto. Trabaja sobre imágenes de resolución 256x512, según la configuración publicada.

Su relevancia actual radica en su enfoque de despliegue práctico: pesos compactos, licencia MIT y umbrales por clase calibrados en la configuración, lo que facilita integrarlo en pipelines de inspección en producción sin dependencias de infraestructura pesada. No obstante, el modelo no cuenta con descargas ni interacciones en el momento de redactar esta ficha, por lo que su validación externa es aún inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-18 (segmentation-models-pytorch, `smp.Unet`) |
| Parametros totales | 14.340.228 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 256x512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

La arquitectura es una U-Net clásica con encoder ResNet-18 preentrenado, construida con la librería segmentation-models-pytorch. La U-Net combina un camino descendente de extracción de características con conexiones de salto hacia un decodificador que recupera resolución espacial, lo que permite una segmentación densa a nivel de píxel. El uso de ResNet-18 como encoder mantiene el número de parámetros en torno a 14,3 millones, un equilibrio entre capacidad de representación y coste computacional.

El modelo está entrenado para segmentar cuatro clases de defectos en superficies de acero: `defect_pitting`, `defect_inclusion`, `defect_scratch` y `defect_patch`. La configuración publicada incluye la normalización de entrada, la resolución objetivo de 256x512 y umbrales por clase calibrados, lo que sugiere un ajuste específico del punto de decisión para cada tipo de defecto. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el número de épocas ni si se aplicaron técnicas de aumento de datos o funciones de pérdida específicas (por ejemplo, Dice o focal loss).

## Capacidades

- Segmentación semántica densa de imágenes de superficies de acero a resolución 256x512.
- Detección y localización a nivel de píxel de cuatro clases de defectos: picaduras, inclusiones, arañazos y parches.
- Salida de máscaras por clase con umbrales calibrados específicos para cada categoría.
- Inferencia ligera apta para entornos con recursos limitados gracias a sus 14,3 millones de parámetros.
- Integración directa con el ecosistema segmentation-models-pytorch para carga y predicción.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la segmentación de imágenes.

## Casos de uso

- Control de calidad en líneas de laminación de acero: el modelo recibe imágenes de la superficie de la bobina y devuelve máscaras de defectos, permitiendo clasificar y localizar picaduras, inclusiones, arañazos y parches en tiempo de producción.
- Inspección automatizada en plantas siderúrgicas: integrado en cámaras industriales fijas, genera mapas de defectos que alimentan sistemas de alerta o de rechazo de material.
- Mantenimiento predictivo de superficies metálicas: el modelo puede emplearse para monitorizar el desgaste o la aparición de defectos en componentes de maquinaria a lo largo del tiempo.
- Preprocesado para sistemas de visión artificial de mayor nivel: las máscaras generadas sirven como entrada a clasificadores o a sistemas de decisión que determinan la severidad del defecto.
- Investigación en visión industrial: al ser un modelo ligero y con licencia MIT, es útil como línea base para experimentos de segmentación de defectos y para comparar con arquitecturas más pesadas.
- Despliegue en dispositivos de borde (edge): su tamaño reducido (0,1 GB) y sus 14,3 millones de parámetros permiten ejecutarlo en GPUs de gama baja o incluso en CPU para inspección en tiempo casi real, según la latencia aceptable.
- Prototipado rápido de pipelines de inspección: la disponibilidad de `config.json` con normalización y umbrales calibrados simplifica la puesta en marcha de una prueba de concepto sin ajuste adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño del modelo (14,3 millones de parámetros, pesos en safetensors de aproximadamente 0,1 GB), la inferencia en FP32 requiere del orden de 60 MB para los pesos, más memoria para activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU consumer moderna (GTX 1650, RTX 3050, RTX 4090) es suficiente; también es viable en CPU para lotes pequeños.
- Cabe en GPU consumer: sí, con amplio margen, incluidas GPUs de gama de entrada.
- Opciones de despliegue: segmentation-models-pytorch para carga directa en PyTorch; exportación a ONNX o TorchScript para servir con ONNX Runtime o TensorRT; integración en pipelines de visión con OpenCV para pre/postprocesado.
- Latencia y throughput estimados: no disponibles. Dependerán del hardware, del tamaño de lote y de la resolución de entrada (256x512).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SurfaceGuard ResNet18-UNet | 14.340.228 | Imagen 256x512 | Segmentación de 4 defectos en acero | MIT | Hugging Face |
| U-Net con encoder ResNet-34 (smp) | no disponible | Configurable | Segmentación genérica | MIT (librería) | PyTorch/smp |
| DeepLabV3+ con ResNet-50 (smp) | no disponible | Configurable | Segmentación semántica genérica | MIT (librería) | PyTorch/smp |
| Segment Anything (SAM) | no disponible | Imagen de alta resolución | Segmentación promptable general | Apache 2.0 | Meta AI |

La comparación con alternativas genéricas es limitada: los modelos de segmentation-models-pytorch no están especializados en defectos de acero, mientras que SAM es un modelo de propósito general mucho más pesado y no entrenado específicamente para esta tarea. No se dispone de datos de rendimiento comparativo entre ellos en el dominio de inspección de superficies.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para cuatro clases de defectos en superficies de acero; su rendimiento fuera de ese dominio (otros materiales, iluminaciones o cámaras) es incierto.
- No se han publicado métricas de validación (IoU, Dice, precisión/recall por clase) en la información disponible, por lo que no es posible evaluar su calidad objetiva.
- El repositorio no registra descargas ni interacciones, lo que indica ausencia de validación por parte de la comunidad.
- Riesgo de alucinación en el sentido de falsos positivos o negativos en la segmentación: sin datos de calibración publicados, los umbrales por clase deben validarse en el dominio de despliegue.
- La resolución de entrada está fijada en 256x512 según la configuración; imágenes de otra relación de aspecto requerirán redimensionado, lo que puede afectar a la precisión en defectos pequeños.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar los términos exactos del repositorio.
- No se dispone de información sobre sesgos del dataset de entrenamiento (por ejemplo, sesgo hacia ciertos tipos de acero o condiciones de iluminación).
- Para producción, es recomendable reentrenar o ajustar finamente con datos propios y establecer un proceso de validación continua.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Honey1118/surfaceguard-resnet18-unet
- Librería segmentation-models-pytorch: https://github.com/qubvel-org/segmentation_models.pytorch
- Documentación de U-Net en smp: https://smp.readthedocs.io/en/latest/models.html#unet
- Repositorio de PyTorch: https://pytorch.org
- Safetensors: https://github.com/huggingface/safetensors
