# litert-community/efficientnet_b1

## Resumen

EfficientNet B1 es un modelo de clasificación de imágenes de tipo red neuronal convolucional (CNN) presentado por Mingxing Tan y Quoc V. Le en el artículo "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks" (2019). Esta ficha concreta corresponde a la conversión publicada por la comunidad `litert-community`, que distribuye los pesos originales de `google/efficientnet-b1` en formato TensorFlow Lite (`.tflite`) listos para su ejecución con el runtime LiteRT (antes TensorFlow Lite) de Google.

El modelo resuelve la clasificación de imágenes en 1.000 categorías de ImageNet-1k y su interés principal es práctico: ofrece un artefacto ligero (unos 0,1 GB de repositorio, 7,79 millones de parámetros) pensado para inferencia en dispositivos de borde, móviles y entornos embebidos donde no se dispone de GPU. Incluye además una variante con cuantización de solo pesos a int8 que reduce el tamaño aproximadamente 3,5 veces respecto a float32.

La relevancia actual del modelo no reside en su precisión (un 78,55 % de top-1 en la validación de ImageNet-1k, por debajo de los 79,838 % declarados para el modelo original), sino en su utilidad como componente de clasificación rápida, de bajo coste computacional y desplegable en hardware modesto dentro de pipelines de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN EfficientNet (compound scaling de profundidad, anchura y resolución), con bloques MBConv y módulos SE |
| Parametros totales | 7.794.184 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | float32 (original) y weight-only int8 con activaciones float32 (`efficientnet_b1_weight_only_wi8_afp32.tflite`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible (la model card remite a las licencias de PyTorch Vision y del dataset de entrenamiento) |
| Formato de pesos | TFLite (`.tflite`), ejecutable con ai-edge-litert |

## Arquitectura y entrenamiento

EfficientNet B1 es una red convolucional que aplica el escalado compuesto propuesto por Tan y Le: en lugar de escalar solo la profundidad, la anchura o la resolución de entrada de forma aislada, el método busca un coeficiente conjunto que equilibre las tres dimensiones. La familia EfficientNet se construye a partir de bloques MBConv (convoluciones invertidas con conexiones residuales) e incorpora módulos de atención Squeeze-and-Excitation (SE) y activaciones SiLU. El modelo B1 es el segundo de la familia, con 7.794.184 parámetros.

El entrenamiento se realizó sobre ImageNet-1k (1.000 clases), según indica la model card, que cita como origen los pesos preentrenados de PyTorch Vision. No se detallan en la información disponible el número de tokens (no aplica), la composición exacta del dataset más allá de ImageNet-1k ni si hubo fases de ajuste fino adicionales. La conversión a TFLite la realiza la comunidad `litert-community`; la variante cuantizada usa cuantización de solo pesos en lugar de cuantización de rango dinámico porque las capas SE y SiLU de EfficientNet son sensibles a la cuantización de activaciones, según explica el autor.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet-1k (top-1 y top-5).
- Extracción de logits por clase para su uso como cabecera de clasificación o como base para ajuste fino.
- Inferencia en dispositivos de borde y móviles mediante el runtime LiteRT (ai-edge-litert).
- Ejecución con entrada de imagen RGB normalizada (media [0.485, 0.456, 0.406], desviación [0.229, 0.224, 0.225]) y redimensionado a 240×240 píxeles según el script de ejemplo de la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- No dispone de capacidades multilingües (no procesa lenguaje).
- No dispone de modo "thinking", visión generativa, audio ni otras capacidades multimodales.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo se distribuye en TFLite y se ejecuta con ai-edge-litert, por lo que puede integrarse en apps Android/iOS para etiquetar fotos localmente sin enviar datos a la nube.
- Prefiltrado en pipelines de visión: usar el modelo como primera etapa para descartar o etiquetar imágenes antes de pasarlas a modelos más grandes y costosos, aprovechando sus 7,79 M de parámetros y su bajo coste de inferencia.
- Moderación de contenido básica: clasificación rápida de imágenes en categorías genéricas para señalizar contenido que requiera revisión humana posterior.
- Sistemas embebidos y IoT con recursos limitados: la variante int8 de solo pesos reduce el tamaño aproximadamente 3,5 veces, lo que permite desplegarlo en dispositivos con poca memoria y sin acelerador de GPU.
- Etiquetado automático de datasets: generar etiquetas preliminares de ImageNet sobre grandes colecciones de imágenes para acelerar el etiquetado manual o para auditorías de calidad de datos.
- Extracción de características para tareas downstream: usar las activaciones intermedias como representación visual en tareas de recuperación de imágenes o clasificación con pocos ejemplos, partiendo de los pesos preentrenados en ImageNet-1k.
- Prototipado rápido de demos de visión: el script de ejemplo de la model card permite tener una clasificación funcional con `pip install numpy Pillow huggingface_hub ai-edge-litert` y un único comando.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| ImageNet-1k (validation) | Top-1 accuracy (float32) | 0,7855 |
| ImageNet-1k (validation) | Top-5 accuracy (float32) | 0,9419 |

La model card indica además que el modelo original declara 79,838 % de top-1 y 94,934 % de top-5 en ImageNet-1K. Para la variante cuantizada int8 de solo pesos, el autor reporta una comprobación puntual sobre 10 imágenes en la que coincide con la predicción top-1 del modelo float en 9 de 10 casos, con una correlación de logits de 0,996. No se han publicado en la información disponible resultados de la variante cuantizada sobre el conjunto completo de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo está pensado para CPU y aceleradores de borde. El repositorio completo ocupa 0,1 GB.
- GPU recomendadas: no se especifican; el runtime LiteRT está orientado a CPU, GPU móvil y NPU de dispositivos, no a GPUs de servidor.
- ¿Cabe en GPU de consumo? Sí, con holgura: con 7,79 M de parámetros, el modelo float32 ocupa del orden de decenas de megabytes, por lo que cabe en cualquier GPU de consumo e incluso en memoria de móvil.
- Opciones de despliegue: ai-edge-litert (Python), runtime LiteRT para Android/iOS, y conversión a otros formatos si se requiere. No se documentan en la información disponible despliegues con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión TFLite).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Top-1 ImageNet-1k | Licencia | Formato |
|---|---|---|---|---|---|
| litert-community/efficientnet_b1 | 7.794.184 | Imagen 240×240 | 0,7855 (declarado) | no disponible | TFLite |
| google/efficientnet-b1 (original) | 7.794.184 | Imagen 240×240 | 79,838 % (declarado en la model card) | no disponible | PyTorch |
| Otras variantes de EfficientNet (B0, B2, etc.) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original del que deriva esta conversión, ya que la información proporcionada no incluye datos de otras alternativas comparables (por ejemplo, MobileNetV3 o ResNet-50). No se dispone de cifras verificadas de latencia ni de precisión de la variante cuantizada sobre el conjunto completo de validación.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena sobre ImageNet-1k, un dataset con sesgos documentados en la literatura (representación desigual de clases, contextos geográficos y culturales); no se detallan análisis de sesgo específicos en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de la distribución de ImageNet-1k.
- Limitaciones de contexto o idioma: no procesa texto ni lenguaje; solo clasifica imágenes en las 1.000 clases de ImageNet-1k. No admite entradas de resolución arbitraria sin el preprocesado adecuado.
- Restricciones de licencia para uso comercial: la licencia no está disponible en la información proporcionada. La model card advierte de que los pesos derivan de PyTorch Vision y del dataset de entrenamiento, y que es responsabilidad del usuario determinar si tiene permiso para su caso de uso. No debe asumirse uso comercial libre sin verificar las licencias de origen.
- Caveats para producción: la variante cuantizada solo se ha validado con una comprobación puntual de 10 imágenes, no sobre el conjunto completo de validación; conviene validar la precisión en el dominio concreto antes de desplegarla. El modelo es de 2019 y su precisión es inferior a la de arquitecturas más recientes; para tareas de alta exigencia puede ser insuficiente. La conversión la mantiene una comunidad, no Google, por lo que no hay garantía de soporte oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/efficientnet_b1
- Modelo base: https://huggingface.co/google/efficientnet-b1
- Paper original: https://arxiv.org/abs/1905.11946
- Repositorio de etiquetas ImageNet-1k: https://huggingface.co/datasets/huggingface/label-files
- Runtime LiteRT (ai-edge-litert): no disponible en la información proporcionada
- Repositorio de PyTorch Vision: no disponible en la información proporcionada
