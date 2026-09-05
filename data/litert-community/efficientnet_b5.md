# litert-community/efficientnet_b5

## Resumen

EfficientNet B5 es un modelo de clasificación de imágenes desarrollado originalmente por Google y convertido por la comunidad LiteRT (sucesor de TensorFlow Lite) para su ejecución en dispositivos edge. Se basa en la arquitectura EfficientNet, que introduce el escalado compuesto para equilibrar profundidad, anchura y resolución de la red, logrando una precisión superior con una eficiencia notablemente mayor que las arquitecturas convolucionales tradicionales. El modelo fue preentrenado en el dataset ImageNet-1k y posteriormente convertido desde pesos de PyTorch Vision.

La variante publicada en HuggingFace incluye tanto el modelo en float32 como una cuantización weight-only int8 que reduce el tamaño de los pesos aproximadamente 3,7 veces. Con 30.389.784 parámetros y una precisión Top-1 del 83,47% en ImageNet-1k, este modelo está pensado para aplicaciones de visión por computador en tiempo real en dispositivos móviles y sistemas embebidos, donde el consumo de memoria y energía es crítico.

En el contexto actual de despliegue de IA en el edge, este modelo resulta relevante porque ofrece un equilibrio excelente entre precisión y coste computacional, y porque su formato TFLite/LiteRT permite una integración directa en aplicaciones Android, iOS y plataformas embebidas mediante el runtime de Google.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B5 (CNN con bloques MBConv y capas squeeze-and-excitation) |
| Parametros totales | 30.389.784 |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | Weight-only int8 (también disponible float32) |
| Idiomas soportados | No aplica (modelo de visión, no de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | TFLite (LiteRT) |

## Arquitectura y entrenamiento

EfficientNet B5 es una red neuronal convolucional (CNN) basada en bloques MBConv con conexiones residuales y capas de atención squeeze-and-excitation (SE). La innovación principal es el escalado compuesto, que escala uniformemente la profundidad, la anchura y la resolución de la imagen mediante un coeficiente compuesto, lo que permite obtener un mejor rendimiento con menos parámetros y FLOPs que las redes escaladas de forma convencional. En el caso de B5, la resolución de entrada es de 456x456 píxeles, con 30.389.784 parámetros.

El modelo fue preentrenado en ImageNet-1k, un dataset de 1,28 millones de imágenes en 1000 clases. Los pesos originales proceden de PyTorch Vision y fueron convertidos al formato TFLite/LiteRT por la comunidad litert-community. No se ha realizado ningún ajuste fino adicional ni se han aplicado técnicas de alineación como RLHF o DPO, ya que se trata de un modelo discriminativo de clasificación, no generativo. La cuantización weight-only int8 se aplicó a los pesos, manteniendo las activaciones en float32, porque las capas SE y SiLU del modelo son sensibles a la cuantización de activaciones.

## Capacidades

- Clasificación de imágenes en 1000 clases de ImageNet-1k, con precisión Top-1 de 83,47% y Top-5 de 96,64% en validación (precisión completa).
- Preprocesamiento optimizado para una resolución de entrada de 456x456 píxeles, con normalización basada en la media y desviación estándar de ImageNet.
- Soporte de ejecución en dispositivos edge mediante LiteRT, con cuantización weight-only int8 que reduce el tamaño del modelo a aproximadamente un tercio sin pérdida significativa de precisión (correlación de logits de 1,000 en pruebas internas).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni agentes, al ser un modelo puramente discriminativo.
- No es un modelo multilingüe; no procesa lenguaje natural.

## Casos de uso

- Clasificación de imágenes en tiempo real en aplicaciones móviles: el modelo puede integrarse en apps Android o iOS mediante LiteRT para identificar objetos, plantas o animales con una latencia baja, gracias a su tamaño reducido y a la cuantización int8.
- Moderación de contenido visual: se puede desplegar en un servidor o en el dispositivo para clasificar imágenes en categorías (violencia, desnudos, etc.) y filtrar contenido automáticamente antes de su publicación.
- Control de calidad industrial: con un ajuste fino en un dataset propio, el modelo puede clasificar defectos en piezas manufacturadas, aprovechando su eficiencia para ejecutarse en cámaras de inspección embebidas.
- Sistemas de vigilancia inteligente: el modelo puede clasificar escenas o eventos (personas, vehículos, animales) en cámaras de seguridad, reduciendo la necesidad de transmitir video a la nube.
- Asistencia para personas con discapacidad visual: una app móvil puede usar el modelo para describir objetos del entorno en tiempo real, generando etiquetas que luego se convierten en audio.
- Clasificación de imágenes médicas: tras un ajuste fino en datasets de radiografías o dermatología, el modelo puede servir como apoyo en el diagnóstico, siempre que se valide clínicamente y se cumplan las normativas aplicables.

## Benchmarks y rendimiento

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Image Classification | ImageNet-1k (validation) | Precisión Top-1 (Full Precision) | 83,47% |
| Image Classification | ImageNet-1k (validation) | Precisión Top-5 (Full Precision) | 96,64% |

Los resultados son los declarados por el autor del modelo en la model card. No se han publicado comparativas con otros modelos en la información disponible. La model card indica que la variante weight-only int8 mantiene una correlación de logits de 1,000 con el modelo float32 en una comprobación con fotografías reales, pero no se proporcionan métricas de precisión para la versión cuantizada.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB para el modelo float32 (aproximadamente 120 MB de pesos); la versión int8 ocupa unos 30 MB, por lo que puede ejecutarse incluso en microcontroladores con suficiente RAM.
- GPU recomendadas: no requiere GPU dedicada; se ejecuta eficientemente en CPU, GPU móviles (Adreno, Mali, Apple Neural Engine) o NPU mediante LiteRT.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con más de 1 GB de VRAM es suficiente, aunque el objetivo principal es el despliegue en dispositivos edge.
- Opciones de despliegue: LiteRT (ai-edge-litert) con el API CompiledModel, tal como se muestra en la model card. También puede convertirse a otros formatos (ONNX, TensorFlow SavedModel) si se necesita, aunque no se proporciona documentación al respecto.
- Latencia y throughput: no disponible en la información proporcionada; depende del hardware objetivo y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Resolución | Top-1 ImageNet | Formato | Licencia |
|---|---|---|---|---|---|
| EfficientNet B5 (este) | 30.389.784 | 456x456 | 83,47% | TFLite/LiteRT | No disponible |
| google/efficientnet-b5 (base) | 30.389.784 | 456x456 | 83,44% | PyTorch | No disponible |

No dispongo de datos de otros modelos comparables en la información proporcionada. La comparación con el modelo base muestra que la cuantización no altera la arquitectura ni la precisión declarada, y que el formato TFLite es la diferencia principal para el despliegue en edge. No se pueden extraer conclusiones sobre el rendimiento relativo a otras arquitecturas como MobileNet o ResNet sin datos adicionales.

## Limitaciones y advertencias

- Licencia no especificada: la model card advierte que los modelos pueden tener licencias o términos derivados de PyTorch Vision y del dataset de entrenamiento. El usuario es responsable de verificar los permisos antes de usar el modelo en producción.
- Sesgos de ImageNet: el dataset de entrenamiento contiene imágenes de internet, lo que puede introducir sesgos geográficos y culturales. El modelo puede fallar en imágenes de objetos o escenas poco representadas.
- Riesgo de alucinación no aplica: al ser un modelo discriminativo, no genera texto ni información falsa, pero sí puede clasificar incorrectamente imágenes fuera de distribución con alta confianza.
- Limitaciones de entrada: el modelo espera imágenes de 456x456 píxeles; otras resoluciones pueden degradar la precisión. El preprocesamiento debe seguir exactamente la normalización de ImageNet.
- Cuantización: la variante weight-only int8 puede tener una pequeña pérdida de precisión en comparación con float32, aunque la model card indica que la correlación de logits es 1,000 en una muestra limitada. No se han publicado métricas de precisión completas para la versión cuantizada.
- No soporta tool calling, agentes ni generación de texto: su uso se limita a tareas de clasificación de imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/efficientnet_b5
- Repositorio LiteRT en GitHub: https://github.com/google-ai-edge/litert
- Documentación de LiteRT: https://developers.google.com/edge/litert
- Paper original: https://arxiv.org/abs/1905.11946
