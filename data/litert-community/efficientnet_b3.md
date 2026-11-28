# litert-community/efficientnet_b3

## Resumen

EfficientNet B3 es una red neuronal convolucional para clasificación de imágenes, publicada originalmente por Mingxing Tan y Quoc V. Le (Google) en el artículo "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks" (2019). Esta ficha concreta corresponde a la conversión del checkpoint de PyTorch Vision al formato LiteRT (TFLite), distribuida por la organización comunitaria `litert-community` en Hugging Face. El modelo está entrenado sobre ImageNet-1k y clasifica imágenes en 1000 categorías.

El modelo aplica el escalado compuesto característico de la familia EfficientNet: en lugar de escalar por separado profundidad, anchura y resolución, B3 equilibra los tres ejes de forma sistemática, lo que permite obtener una precisión notablemente superior a arquitecturas convolucionales clásicas con un coste computacional mucho menor. Con 12,2 millones de parámetros y una resolución de entrada de 300x300 píxeles, es un modelo compacto y eficiente.

La relevancia de esta ficha radica en su formato: los pesos se distribuyen como archivos `.tflite` listos para desplegarse en entornos LiteRT, incluyendo una variante con cuantización de pesos a int8 que reduce el tamaño del archivo aproximadamente 3,6 veces respecto a float32. Esto lo hace adecuado para inferencia en dispositivos con recursos limitados (móviles, edge, navegador) sin renunciar a una precisión top-1 del 82,01 % en ImageNet-1k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet (escalado compuesto, bloques MBConv con SE y SiLU) |
| Parametros totales | 12.233.232 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 300x300 px) |
| Tipos de cuantizacion | float32 y weight-only int8 (activaciones float32) |
| Idiomas soportados | no disponible (tarea de clasificación de imágenes, sin texto) |
| Licencia | no disponible (sujeta a las condiciones de PyTorch Vision y del dataset) |
| Formato de pesos | TFLite (`.tflite`), variante float32 y variante weight-only int8 |

## Arquitectura y entrenamiento

EfficientNet B3 es una red convolucional que emplea bloques MBConv (Mobile Inverted Bottleneck Convolution) con módulos de atención Squeeze-and-Excitation (SE) y activaciones SiLU. El escalado compuesto de la familia EfficientNet ajusta de forma conjunta la profundidad, la anchura y la resolución de entrada mediante un coeficiente único; en B3 la resolución de entrada es de 300x300 píxeles. El modelo original fue entrenado sobre ImageNet-1k (1000 clases) y esta versión se ha convertido desde el checkpoint de PyTorch Vision.

No se dispone de información sobre el número exacto de tokens/imágenes de entrenamiento, la composición detallada del dataset ni sobre si se aplicaron técnicas de ajuste fino adicionales (RLHF/DPO no aplican a un modelo de visión). La innovación técnica destacable en esta ficha es la conversión a LiteRT y la inclusión de una variante con cuantización weight-only int8: según la model card, se eligió cuantización solo de pesos en lugar de cuantización de rango dinámico porque las capas SE y SiLU de EfficientNet son sensibles a la cuantización de activaciones; en una comprobación puntual frente al modelo float, la variante int8 mantiene las predicciones top-1 en fotos reales con una correlación mínima de logits de 0,998.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet-1k (predicción top-1 y top-5).
- Extracción de características visuales (representaciones intermedias) para tareas downstream.
- Inferencia en formato LiteRT/TFLite, apta para dispositivos edge y móviles.
- Variante cuantizada int8 (solo pesos) para reducir el tamaño del artefacto manteniendo la precisión.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No soporta generación de texto, código, matemáticas ni capacidades multilingües.
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imágenes.

## Casos de uso

- Clasificación de imágenes en el dispositivo (on-device): el archivo `.tflite` se ejecuta con LiteRT en móviles o sistemas embebidos, permitiendo etiquetar fotos sin enviar datos a la nube y con baja latencia.
- Moderación y filtrado de contenido visual: clasificar imágenes subidas por usuarios en categorías ImageNet para enrutar o descartar contenido antes de un análisis más costoso.
- Etiquetado automático de catálogos de producto: usar las predicciones top-5 como etiquetas sugeridas para imágenes de inventario, con revisión humana posterior.
- Preprocesamiento en pipelines de visión: emplear el modelo como extractor de características o clasificador previo en sistemas de búsqueda visual o recomendación.
- Prototipado rápido en aplicaciones web/edge: al ser un artefacto TFLite de tamaño reducido (repo de 0,2 GB, variante int8 ~3,6x menor que float32), se integra fácilmente en demos y pruebas de concepto.
- Automatización de triaje en archivos multimedia: clasificar grandes lotes de imágenes para organizarlas por categoría antes de un procesamiento específico (OCR, detección de objetos, etc.).
- Aplicaciones de accesibilidad: describir de forma básica el contenido de una imagen (categoría principal) para asistir a usuarios con discapacidad visual en combinación con otras herramientas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (model-index), sobre ImageNet-1k, split de validación. No verificados de forma independiente.

| Metrica | Valor |
|---|---|
| Top-1 Accuracy (full precision) | 0,8201 (82,01 %) |
| Top-5 Accuracy (full precision) | 0,9604 (96,04 %) |

La model card indica además que el modelo original de PyTorch Vision reporta acc@1 = 82,008 % y acc@5 = 96,054 % en ImageNet-1K, coherente con los valores anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 12,2 M de parámetros (aproximadamente 49 MB en float32 y ~14 MB en la variante weight-only int8, según la reducción de ~3,6x indicada).
- GPU recomendadas: cualquier GPU moderna sirve; para despliegue en servidor, A100/H100 o RTX 4090 son sobredimensionadas para este modelo. Funciona bien en GPUs de gama baja (p. ej., T4) e incluso en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, etc.) y en la mayoría de iGPUs y NPUs móviles.
- Opciones de despliegue: LiteRT / `ai-edge-litert` (CompiledModel), TensorFlow Lite, y conversión a otros runtimes si se requiere. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un modelo de visión TFLite).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Top-1 ImageNet-1k | Licencia | Formato |
|---|---|---|---|---|---|
| EfficientNet B3 (esta ficha) | 12,2 M | 300x300 | 82,01 % (declarado) | no disponible | TFLite (float32 e int8 weight-only) |
| EfficientNet B0 | no disponible en esta información | no disponible | no disponible | no disponible | no disponible |
| EfficientNet B4 | no disponible en esta información | no disponible | no disponible | no disponible | no disponible |
| Otras CNN de classification (p. ej., ResNet-50) | no disponible en esta información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos suficientes en la información proporcionada para establecer una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre ImageNet-1k, hereda los sesgos y desequilibrios de ese dataset (representación desigual de clases, contextos y demografías).
- Riesgo de alucinación: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución o ambiguas.
- Limitaciones de contexto o idioma: no procesa texto; solo clasifica imágenes en las 1000 clases de ImageNet-1k. No admite entradas de otras resoluciones sin preprocesado adecuado (300x300 con normalización específica).
- Restricciones de licencia: la licencia no está disponible en la ficha; la model card advierte que los pesos derivan de PyTorch Vision y del dataset de entrenamiento, y que es responsabilidad del usuario determinar si tiene permiso para su caso de uso. Verificar antes de uso comercial.
- Caveats para producción: la variante int8 es weight-only (activaciones float32), por lo que no reduce el coste de activaciones; la cuantización de rango dinámico completa no se recomienda por la sensibilidad de las capas SE y SiLU. Los benchmarks declarados no están verificados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/efficientnet_b3
- Modelo base: https://huggingface.co/google/efficientnet-b3
- Paper original: https://arxiv.org/abs/1905.11946
- Etiquetas ImageNet-1k: https://huggingface.co/datasets/huggingface/label-files
- Librería LiteRT (`ai-edge-litert`): no disponible enlace directo en la información proporcionada.
