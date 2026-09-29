# edgaremy/mobilenetv4_hybrid_medium.frencharthro-24k

## Resumen

`edgaremy/mobilenetv4_hybrid_medium.frencharthro-24k` es un clasificador de imágenes resultante del ajuste fino (fine-tuning) del modelo `timm/mobilenetv4_hybrid_medium.ix_e550_r384_in1k` sobre un conjunto de datos de artrópodos, presumiblemente de origen francés y con alrededor de 24 000 imágenes, a juzgar por el identificador del repositorio. Lo publica el usuario `edgaremy` y está pensado para la identificación automática de especies de insectos y otros artrópodos a partir de fotografías.

El modelo parte de una arquitectura MobileNetV4 en su variante híbrida de tamano medio, que combina bloques convolucionales Universal Inverted Bottleneck (UIB) con mecanismos de atención Mobile MQA. El checkpoint base fue entrenado en ImageNet-1k durante 550 épocas con una receta mejorada a una resolución de 384 x 384 píxeles, y este ajuste reutiliza esa base para una tarea de clasificación taxonómica de granularidad fina. La relevancia práctica reside en que permite ejecutar inferencia de clasificación biológica en hardware muy modesto (CPU, movil o dispositivos edge), algo poco habitual en tareas de identificación de especies que suelen requerir modelos de visión de gran tamano.

El repositorio no incluye prácticamente documentación técnica: la model card se limita a declarar la licencia MIT, las métricas `accuracy` y `f1` (sin valores) y el modelo base. No se especifican el número de clases, la composición exacta del dataset, los resultados obtenidos ni las resoluciones de entrenamiento efectivas para este ajuste concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV4 híbrida (CNN con bloques Universal Inverted Bottleneck y atención Mobile MQA) |
| Parametros totales | No publicado para este ajuste; el modelo base MobileNetV4-Hybrid-Medium ronda los 11,6 M de parámetros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no procesa secuencias de texto) |
| Tipos de cuantizacion | No disponible (al ser un modelo timm/PyTorch, admite de forma genérica INT8, FP16 y cuantización dinámica, pero el autor no documenta ninguna) |
| Idiomas soportados | No aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | No disponible de forma explícita; al estar registrado con `library_name: timm`, se esperan pesos PyTorch (normalmente `safetensors`/`pytorch_model.bin`) |
| Tarea | Image classification (clasificación de especies de artrópodos) |
| Resolucion de entrada | No confirmada para el ajuste; la base se entrena a 384 x 384 |
| Numero de clases | No disponible |
| Dataset de ajuste | Presumiblemente "frencharthro-24k" (≈24 000 imágenes de artrópodos), sin detalle publicado |
| Metricas declaradas | `accuracy` y `f1`, sin valores publicados |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MobileNetV4 en su variante híbrida de tamano medio. MobileNetV4 introduce dos elementos clave: los bloques Universal Inverted Bottleneck (UIB), que unifican varias configuraciones de convolución (incluidas convoluciones invertidas y depthwise) bajo un mismo diseno, y un mecanismo de atención denominado Mobile MQA (Multi-Query Attention) optimizado para hardware movil. La variante híbrida intercala estos bloques de atención con bloques puramente convolucionales, lo que permite capturar dependencias globales sin el coste computacional de un transformer de visión completo. El checkpoint base `mobiletv4_hybrid_medium.ix_e550_r384_in1k` corresponde a un entrenamiento en ImageNet-1k durante 550 épocas a 384 x 384 píxeles con la receta mejorada del paper de MobileNetV4.

Sobre el proceso de ajuste concreto de este repositorio no hay información: se desconoce el numero exacto de épocas, la estrategia de congelación de capas, los hiperparámetros, el uso de data augmentation, el balanceo de clases o si se aplicó algún tipo de destilación. Tampoco se detalla si el dataset "frencharthro-24k" abarca un rango taxonómico amplio (varios órdenes de insectos) o un conjunto reducido de especies. No se documenta ninguna innovación técnica adicional más allá de la propia arquitectura del modelo base.

## Capacidades

- Clasificación de imágenes de artrópodos e insectos por especie o categoría taxonómica (según las clases definidas en el dataset de ajuste).
- Reconocimiento de patrones visuales finos propios de la identificación entomológica (forma del cuerpo, alas, patrones de color, morfología).
- Extracción de características visuales reutilizable como backbone congelado para otras tareas de visión (detección, segmentación, recuperación por similitud).
- Inferencia de baja latencia en CPU, adecuada para aplicaciones de campo.
- Soporte de tool calling / function calling: no aplica (modelo de visión, no generativo de texto).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, audio, vídeo): no disponibles.

## Casos de uso

- Identificación de especies en campo: una aplicación movil puede capturar una fotografía de un insecto y enviarla al modelo para obtener la etiqueta de especie predicha, aprovechando que un modelo de ~11,6 M de parámetros puede ejecutarse en el propio dispositivo o en un servidor de baja capacidad.
- Ciencia ciudadana y biomonitorización: plataformas que reciben fotografías de voluntarios pueden preetiquetar automáticamente las observaciones para acelerar la validación por expertos, reduciendo el cuello de botella humano en proyectos de seguimiento de artrópodos.
- Inventario ecológico automatizado: integración del modelo en trampas de cámara o estaciones de monitorización que capturan imágenes periódicas de insectos, clasificándolas a gran escala para estudios de biodiversidad.
- Control de plagas en agricultura: clasificación de artrópodos capturados en cultivos para distinguir especies plaga de enemigos naturales, con inferencia en dispositivos de bajo consumo conectados a sensores.
- Catalogación de colecciones entomológicas: preclasificación de imágenes de especímenes de museos o colecciones privadas antes de su revisión taxonómica manual.
- Filtrado y moderación de contenido: etiquetado automático de imágenes con artrópodos en plataformas de contenidos, ya sea para su indexación o para aplicar políticas de visualización.
- Servicio de API ligero: despliegue del modelo detrás de un endpoint de clasificación de imágenes con coste computacional muy reducido, adecuado para volúmenes altos de peticiones.
- Investigación sobre transferencia de aprendizaje: uso del checkpoint como punto de partida para ajustes sobre taxones o regiones geográficas distintas, dado su bajo coste de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara el uso de las métricas `accuracy` y `f1`, pero no incluye sus valores, ni el conjunto de validación empleado, ni comparaciones cuantitativas con otros modelos. Tampoco se publican métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 a batch 1 (los ~11,6 M de parámetros del modelo base ocupan del orden de 23 MB en FP16 y unos 46 MB en FP32, más las activaciones de una única imagen de entrada).
- GPU recomendadas: no se requiere GPU. Cualquier GPU, desde una GTX 1050 o una iGPU moderna hasta una RTX 4090, A100 o H100, es sobradamente suficiente; estas últimas solo tendrían sentido para lotes muy grandes o pipelines de datos masivos.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo e incluso en muchos SoC moviles y sistemas embebidos.
- Opciones de despliegue: `timm` y PyTorch de forma nativa; exportación a TorchScript, ONNX, TensorRT y TFLite; integración con Hugging Face Transformers y con servidores de inferencia genéricos. No se documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera latencia de milisegundos en GPU y de decenas de milisegundos en CPU para imágenes individuales, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este ajuste, por lo que la comparación se limita a características estructurales y a alternativas genéricas de clasificación de imágenes. Los valores del modelo ajustado son estimaciones basadas en el modelo base y en conocimiento público de las arquitecturas, no en la documentación del repositorio.

| Modelo | Parametros | Tipo | Licencia | Notas |
|---|---|---|---|---|
| `edgaremy/mobilenetv4_hybrid_medium.frencharthro-24k` | No publicado (base ≈11,6 M) | CNN híbrida con atención | MIT | Ajustado a artrópodos; sin métricas publicadas |
| `timm/mobilenetv4_hybrid_medium.ix_e550_r384_in1k` | ≈11,6 M | CNN híbrida con atención | Apache-2.0 (timm/Google) | Modelo base, clasificación general en ImageNet-1k |
| EfficientNet-B0 | ≈5,3 M | CNN | Apache-2.0 | Alternativa clásica de bajo coste, rendimiento inferior al de MobileNetV4 en ImageNet |
| ConvNeXt-Tiny | ≈28 M | CNN moderna | MIT | Mayor capacidad y coste, buena precisión generalista |
| ViT-B/16 | ≈86 M | Transformer de visión | Apache-2.0 | Mucho mayor coste computacional; requiere más datos para igualar a las CNN en ajustes pequenos |

No se han identificado en la información disponible otros clasificadores de artrópodos directamente comparables.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se especifican clases, composición del dataset, proceso de entrenamiento ni métricas, lo que dificulta evaluar su idoneidad para producción.
- Riesgo elevado de sobreajuste al dominio del dataset "frencharthro-24k": es probable que el rendimiento se degrade con imágenes de otras regiones geográficas, condiciones de iluminación distintas, otras cámaras o especímenes fuera del rango taxonómico cubierto.
- Sesgos potenciales derivados del dataset: si las 24 000 imágenes no están balanceadas por especie, el modelo tenderá a favorecer las clases mayoritarias y a confundir las minoritarias.
- Confusión entre especies visualmente similares: la clasificación fina de artrópodos es intrínsecamente difícil y requiere a menudo detalles morfológicos (genitalia, venación alar) que no se aprecian en fotografías generales.
- Alucinación no aplica en el sentido generativo, pero sí el error de clasificación con alta confianza: el modelo siempre devolverá una etiqueta, incluso ante imágenes fuera de distribución.
- Sin garantías de calibración: no se documenta el uso de temperature scaling ni de umbrales de rechazo, por lo que no se puede saber cuándo la predicción es poco fiable.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero conviene verificar la licencia del dataset de ajuste, que no se especifica y podría imponer condiciones adicionales sobre los pesos derivados.
- El modelo base se distribuye bajo licencia Apache-2.0 en timm; la relicenciación a MIT por parte del autor de este ajuste es responsabilidad suya y debería verificarse para usos comerciales.
- Fecha de creación registrada como 2026-09-28, posterior a la fecha habitual de publicación; conviene comprobar la vigencia y procedencia del repositorio antes de confiar en él.
- Sin descargas ni "likes": el modelo no cuenta con validación comunitaria, por lo que no hay evidencia externa de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edgaremy/mobilenetv4_hybrid_medium.frencharthro-24k
- Modelo base en Hugging Face: https://huggingface.co/timm/mobilenetv4_hybrid_medium.ix_e550_r384_in1k
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
- Paper de MobileNetV4: https://arxiv.org/abs/2404.10518
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos específicos de este ajuste.
