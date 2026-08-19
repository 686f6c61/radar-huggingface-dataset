# ketiswp/mlcommons-MobileNetV1-0.25-VisualWakeWords-int8-onnx

## Resumen

El modelo `ketiswp/mlcommons-MobileNetV1-0.25-VisualWakeWords-int8-onnx` es una versión cuantizada a enteros de 8 bits (INT8) del modelo MobileNetV1 con factor de anchura 0.25, entrenado para la tarea de Visual Wake Words (VWW). Esta tarea consiste en clasificar imágenes en dos categorías: presencia o ausencia de una persona, y está diseñada para dispositivos con recursos limitados, como microcontroladores y sistemas embebidos. El modelo original pertenece al benchmark de MLCommons Tiny, un conjunto de pruebas para evaluar redes neuronales en hardware de bajo consumo.

La versión INT8 en formato ONNX, con cuantización estática y formato QDQ (Quantize-Dequantize), permite una inferencia más rápida y con menor consumo de memoria que su contraparte FP32, manteniendo una pérdida de precisión mínima. Es relevante ahora porque la cuantización es un paso habitual en el despliegue de modelos en producción en entornos edge, y este modelo sirve como referencia para el benchmark de VWW. El modelo está publicado bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 con factor de anchura 0.25, profundidad separable convolutions |
| Parametros totales | No disponible (estimado ~0.47 M para MobileNetV1-0.25) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | INT8 estática, formato QDQ |
| Idiomas soportados | No aplica (clasificacion de imagenes) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con operadores QDQ) |

## Arquitectura y entrenamiento

El modelo base es MobileNetV1, una red convolucional ligera introducida por Howard et al. (2017) que usa convoluciones separables en profundidad (depthwise separable convolutions) para reducir el coste computacional. El factor de anchura 0.25 reduce el número de filtros en cada capa, resultando en un modelo extremadamente compacto. La entrada es de 128x128 píxeles, según el modelo original del Open Model Zoo.

El entrenamiento se realizó en el dataset Visual Wake Words, que consiste en imágenes de escenas cotidianas etiquetadas con la presencia o ausencia de una persona. El modelo se entrenó en el benchmark de MLPerf Tiny (repositorio oficial de MLCommons Tiny). La versión INT8 se obtuvo mediante cuantización estática posterior al entrenamiento (PTQ) con formato QDQ, lo que permite que los kernels de ONNX Runtime aprovechen las instrucciones SIMD en CPU y aceleradores compatibles.

## Capacidades

- Clasificacion binaria de imagenes: determina si una imagen contiene una persona o no.
- Inferencia de baja latencia y consumo reducido de memoria, optimizada para despliegue en hardware embebido.
- Compatible con ONNX Runtime y cualquier motor que soporte el formato ONNX con operadores QDQ.
- No tiene capacidades de generacion de texto, tool calling ni razonamiento multilingue; es un clasificador de vision especializado.

## Casos de uso

- **Deteccion de presencia en sistemas de seguridad**: el modelo puede integrarse en camaras de bajo coste o sensores de presencia para alertar cuando una persona entra en una zona vigilada, gracias a su tamaño reducido y baja latencia.
- **Activacion de asistentes por voz**: en dispositivos con microcontrolador, el modelo puede usarse para detectar si hay una persona delante del dispositivo antes de activar el microfono, reduciendo el consumo de energia.
- **Control de iluminacion o climatizacion**: en entornos de oficina o domoticos, el modelo clasifica si hay personas en una estancia para ajustar automaticamente la iluminacion o la temperatura, minimizando el gasto de recursos.
- **Vision en robots de juguete**: un robot educativo puede usar este modelo para seguir o evitar personas, con una carga computacional que cabe en un microcontrolador de gama baja.
- **Contador de personas en espacios publicos**: con multiples instancias del modelo en nodos distribuidos, se puede estimar el numero de personas en una zona sin necesidad de servicios en la nube.
- **Prototipado rapido de edge AI**: el formato ONNX y el tamano reducido permiten probar rapidamente el modelo en placas como Raspberry Pi o microcontroladores STM32, validando el flujo de cuantizacion antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, latencia o comparativas. Se recomienda consultar el repositorio original de MLCommons Tiny para obtener resultados de entrenamiento del modelo FP32.

## Requisitos de hardware

- **VRAM estimada**: inferior a 100 MB en INT8, pero no se ha confirmado un valor exacto. El modelo original FP32 con entrada 128x128 ocupa aproximadamente 2 MB de pesos, y la version INT8 reduce este a menos de 1 MB.
- **GPU recomendadas**: no requiere GPU; se puede ejecutar en CPU de cualquier arquitectura moderna.
- **Compatibilidad con GPU de consumo**: no es relevante, ya que el modelo esta disenado para CPU o microcontroladores.
- **Opciones de despliegue**: ONNX Runtime, ONNX.js en el navegador, STM32Cube.AI, TensorFlow Lite (si se convierte), y cualquier runtime que soporte ONNX.
- **Latencia y throughput**: no disponibles, pero se esperan tiempos de inferencia de milisegundos en CPU de gama baja (por ejemplo, un Raspberry Pi) y microsegundos en aceleradores dedicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/Input | Precision (VWW) | Licencia | Formato |
|---|---|---|---|---|---|---|
| MobileNetV1-0.25-VWW (este) | MobileNetV1 0.25 | ~0.47 M (estimado) | 128x128 | No disponible | Apache-2.0 | ONNX INT8 |
| MobileNetV2-0.35 | MobileNetV2 0.35 | ~1.7 M | 128x128 | No disponible | Apache-2.0 | TFLite |
| EfficientNet-Lite0 | EfficientNet-Lite0 | ~4.7 M | 224x224 | No disponible | Apache-2.0 | TFLite |

La comparativa es orientativa, ya que los datos de precision para el modelo en VWW no estan publicados en la informacion proporcionada. Los modelos de MobileNetV2 y EfficientNet-Lite son alternativas comunes en el edge, pero con un mayor coste computacional y numero de parametros.

## Limitaciones y advertencias

- **Sesgos y precision**: el modelo se entreno en Visual Wake Words, que es un dataset de imagenes de escenas cotidianas, por lo que puede tener sesgos en cuanto a condiciones de iluminacion, poses o tipos de personas. No se ha evaluado su precision en el dataset completo.
- **Riesgo de alucinacion**: no aplica, ya que no es un modelo generativo de texto.
- **Limitaciones de contexto o idioma**: no aplica; es un clasificador de imagenes con entrada de 128x128, por lo que no soporta resoluciones mayores ni texto.
- **Restricciones de licencia**: licencia Apache-2.0, permite uso comercial, modificacion y distribucion, siempre que se incluya la atribucion adecuada.
- **Caveat de produccion**: la cuantizacion INT8 puede reducir la precision respecto al modelo FP32, especialmente en condiciones de iluminacion extremas. Se recomienda validar el modelo en el dataset de produccion antes del despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiswp/mlcommons-MobileNetV1-0.25-VisualWakeWords-int8-onnx
- Version FP32 del mismo autor: https://huggingface.co/ketiswp/mlcommons-MobileNetV1-0.25-VisualWakeWords-fp32-onnx
- Repositorio original de MLCommons Tiny: https://github.com/mlcommons/tiny
- Paper de MobileNets: https://arxiv.org/abs/1704.04861
- Open Model Zoo (MobileNetV1-0.25-128): https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/mobilenet-v1-0.25-128/README.md
