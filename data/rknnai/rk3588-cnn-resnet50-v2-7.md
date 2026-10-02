# RKNNAI/RK3588-CNN-resnet50-v2-7

## Resumen

RK3588-CNN-resnet50-v2-7 es un paquete de despliegue del modelo ResNet-50 v2 convertido y cuantizado al formato RKNN para ejecutarse sobre la NPU del SoC Rockchip RK3588. Lo publica el usuario RKNNAI en Hugging Face y ModelScope, y no aporta pesos entrenados desde cero: parte del modelo ResNet-50 v2 del ONNX Model Zoo y lo transforma mediante el RKNN Toolkit para aprovechar la aceleración por hardware. Se trata de una red convolucional (CNN) de clasificación de imágenes con entrada fija de 224x224x3 y salida sobre las 1.000 clases de ImageNet.

La única configuración publicada es `resnet50-v2-7-224x224-w8a8-1`, con cuantización w8a8 (pesos y activaciones en int8), un único núcleo NPU y runtime RKNN v2.4.0. El objetivo es ofrecer un clasificador de imágenes listo para producción en dispositivos con RK3588 (placas SBC, sistemas embebidos, cámaras inteligentes) sin recompilar ni reconvertir el modelo.

Es relevante para desarrolladores de edge AI que trabajan con hardware Rockchip: permite integrar un backbone de visión ya validado (ResNet-50) en versión cuantizada, con verificación de integridad mediante SHA-256 y licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN ResNet-50 v2 (red residual convolucional con activación previa) |
| Parámetros totales | ~25,6 M (cifra de la arquitectura estándar ResNet-50; no confirmada en el repositorio) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija 224x224x3) |
| Tipos de cuantización | w8a8 (pesos y activaciones en int8) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas ImageNet en inglés, no documentadas en el repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | RKNN (convertido desde ONNX; runtime RKNN v2.4.0) |
| Tipo de modelo | CNN de clasificación de imágenes |
| Modelo origen | `onnxmodelzoo/resnet50-v2-7` (ONNX Model Zoo, validado para visión/clasificación) |
| Resolución de entrada | 224x224 |
| Chips soportados | RK3588 |
| Núcleos NPU | 1 |
| Configuraciones publicadas | 1 (`resnet50-v2-7-224x224-w8a8-1`) |

## Arquitectura y entrenamiento

El modelo es una ResNet-50 v2, una red neuronal convolucional residual de 50 capas que emplea conexiones de identidad (skip connections) para facilitar el entrenamiento de redes profundas. La variante v2 introduce la llamada activación previa, que desplaza la normalización por lotes (BatchNorm) y la ReLU antes de las convoluciones, lo que según la documentación consultada mejora la propagación de la información y el rendimiento de entrenamiento.

El repositorio no documenta el proceso de entrenamiento original: no se indican número de tokens ni de imágenes, composición exacta del dataset, ni si hubo ajuste fino, RLHF o DPO (técnicas propias de modelos de lenguaje que aquí no aplican). Se sabe que el modelo origen `resnet50-v2-7` forma parte de los modelos validados de visión del ONNX Model Zoo, lo que implica un entrenamiento estándar de clasificación sobre ImageNet, pero los detalles concretos no están disponibles en la información proporcionada. La aportación de este repositorio es la conversión y cuantización a RKNN (w8a8) para el RK3588, no el entrenamiento.

## Capacidades

- Clasificación de imágenes: asigna una de las 1.000 clases de ImageNet a una imagen de entrada de 224x224x3 píxeles.
- Extracción de características: al ser un backbone convolucional, puede emplearse como extractor de representaciones para tareas posteriores (detección, segmentación, recuperación de imágenes) mediante ajuste fino o cabezas adicionales.
- Inferencia acelerada en NPU: ejecución sobre el acelerador neuronal del RK3588 con cuantización int8.
- No soporta generación de texto ni de ningún otro tipo de contenido.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No incluye modos especiales como thinking mode, visión generativa, audio ni video.

## Casos de uso

- Clasificación de imágenes en dispositivos embebidos: desplegado sobre una placa con RK3588, el modelo etiqueta imágenes en local sin enviar datos a la nube, útil cuando hay requisitos de privacidad o conectividad limitada.
- Cámaras inteligentes y videovigilancia: integrado en un pipeline de captura, permite clasificar fotogramas o eventos para filtrar y priorizar alertas antes de que se procesen en un servidor.
- Control de calidad industrial: en líneas de fabricación con hardware Rockchip, clasifica piezas o productos y detecta categorías no conformes a partir de imágenes de una cámara.
- Robótica y sistemas autónomos: sirve como módulo de reconocimiento visual dentro de un robot o vehículo autónomo que use el RK3588 como unidad de cómputo principal.
- Extracción de embeddings para búsqueda visual: usando la penúltima capa como vector de características, permite construir índices de similitud para recuperación de imágenes en catálogos.
- Prototipado y validación de edge AI: referencia lista para verificar que el flujo de conversión ONNX → RKNN y la cuantización w8a8 funcionan correctamente en el hardware objetivo.
- Preprocesado en pipelines de visión mayores: actúa como clasificador o filtro previo antes de modelos más pesados (detección de objetos, OCR, segmentación), reduciendo el cómputo total.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de precisión (top-1, top-5) ni datos de latencia o throughput para la configuración cuantizada w8a8. Debe tenerse en cuenta que la cuantización int8 puede degradar la precisión respecto al modelo ONNX original en coma flotante, pero no se dispone de cifras concretas.

## Requisitos de hardware

- Plataforma objetivo: SoC Rockchip RK3588 (NPU compatible con el runtime RKNN v2.4.0). No está pensado para GPU de escritorio ni centro de datos.
- Núcleos NPU utilizados: 1. La configuración usa un único núcleo del acelerador.
- Tamaño del artefacto: aproximadamente 25,5 MB para el fichero `.rknn` cuantizado (referencia observada en repositorios públicos de terceros para el mismo modelo).
- VRAM en GPU: no aplica; el modelo se ejecuta sobre la NPU del RK3588, no sobre tarjetas gráficas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no aplica para esta distribución; el formato RKNN es específico de Rockchip.
- Opciones de despliegue: RKNN Toolkit2 y el runtime RKNN en C++ o Python; descarga vía ModelScope o Hugging Face con la revisión `v2.4.0`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos de rendimiento para esta distribución concreta. A continuación se compara a nivel cualitativo con alternativas habituales de clasificación de imágenes en el mismo segmento (valores de otros modelos no confirmados en la información disponible).

| Modelo | Tipo | Parámetros | Formato/despliegue | Licencia |
|---|---|---|---|---|
| RK3588-CNN-resnet50-v2-7 | CNN ResNet-50 v2, int8 | ~25,6 M (no confirmado) | RKNN, NPU RK3588 | Apache-2.0 |
| ResNet-50 v2 (ONNX Model Zoo) | CNN, FP32 | ~25,6 M (no confirmado) | ONNX, CPU/GPU | Apache-2.0 |
| MobileNetV2 | CNN ligera | no disponible | múltiple | Apache-2.0 |
| EfficientNet-B0 | CNN | no disponible | múltiple | Apache-2.0 |

El principal diferencial de este repositorio no es el modelo en sí, sino el empaquetado optimizado y cuantizado para la NPU del RK3588, algo que las alternativas en formato ONNX o PyTorch no ofrecen de forma directa.

## Limitaciones y advertencias

- Compatibilidad restringida: solo funciona en chips RK3588 con el runtime RKNN v2.4.0; no es portable a otras plataformas sin reconversión.
- Pérdida por cuantización: la cuantización w8a8 puede reducir la precisión de clasificación respecto al modelo original en coma flotante; no se han publicado métricas que cuantifiquen esa pérdida.
- Resolución fija: la entrada está fijada a 224x224, lo que obliga a redimensionar cualquier imagen antes de la inferencia.
- Espacio de etiquetas cerrado: clasifica únicamente entre las 1.000 clases de ImageNet; no detecta objetos fuera de ese conjunto y no devuelve cajas delimitadoras.
- Sesgos: no se documenta ningún análisis de sesgos del modelo original; al heredar el entrenamiento de ImageNet, puede arrastrar los sesgos presentes en ese dataset.
- Riesgo de error en clases ambiguas: como cualquier clasificador, puede confundir clases visualmente similares; no incluye mecanismos de abstención.
- Información incompleta: el repositorio no documenta datos de entrenamiento, idiomas de las etiquetas, métricas de rendimiento ni número exacto de parámetros.
- Licencia: Apache-2.0, que permite uso comercial, pero los derechos del modelo original pertenecen a sus titulares; esta distribución solo convierte y cuantiza el modelo origen.
- Advertencia de producción: verificar la integridad del paquete con `sha256sum -c SHA256SUMS` antes del despliegue y usar ficheros de la misma configuración.

## Enlaces

- Hugging Face: https://huggingface.co/RKNNAI/RK3588-CNN-resnet50-v2-7
- Perfil del autor en Hugging Face: https://huggingface.co/RKNNAI
- Modelo origen, ResNet-50 v2 en ONNX Model Zoo: https://github.com/onnx/models/tree/main/validated/vision/classification/resnet
- Descarga vía ModelScope: `modelscope download --model RKNNAI/RK3588-CNN-resnet50-v2-7 --revision v2.4.0`
- Repositorio de terceros con el fichero `.rknn` (Seeed reComputer-RK-CV): https://github.com/Seeed-Projects/reComputer-RK-CV/blob/main/src/rk3588_resnet50v2/model/rk3588_resnet50-v2-7.rknn
- Guía de despliegue de ResNet-50 en NPU RK3588 (LinkedIn): https://www.linkedin.com/pulse/resnet-rk3588-npu-using-python-harish-s-acyef/
- Ejecución de ResNet50V2 en RK3576 (Seeed SenseCraft): https://sensecraft.seeed.cc/ai-lab/en/models/resnet50-v2-rknn/rk3576
- Artículo sobre desarrollo de aplicaciones de IA en RK3588 con ResNet50V2 (Huawei Cloud): https://bbs.huaweicloud.com/blogs/451999
