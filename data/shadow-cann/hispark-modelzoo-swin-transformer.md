# shadow-cann/hispark-modelzoo-swin-transformer

## Resumen

Swin-Transformer es un modelo de visión por computador basado en arquitectura Transformer, diseñado originalmente por Microsoft Research. Este repositorio concreto, publicado por el usuario shadow-cann, es un espejo del modelo adaptado para la plataforma HiSilicon HiSpark, orientado a su ejecución en NPU (procesador neuronal) de HiSilicon, concretamente el Hi3403V100, y compatible con el sistema operativo OpenHarmony. El modelo resuelve el problema de clasificación de imágenes con una entrada de 224x224 píxeles, ofreciendo una alternativa eficiente a los Transformers de visión clásicos al reducir la carga computacional mediante el mecanismo de atención por ventanas desplazadas (shifted windows).

El repositorio incluye los pesos originales en formato PyTorch (`.pth`), el modelo en ONNX (`.onnx`) y un modelo compilado para NPU (`.om`), junto con la herramienta de compilación SVP_NNN. El tamaño del repositorio es de 0,4 GB. La licencia no está declarada en Hugging Face, pero el enlace de referencia apunta al LICENSE del proyecto original de Microsoft Swin-Transformer, que es de tipo MIT. El modelo está etiquetado como de idioma chino (zh) y su categoría es "clasificación" dentro del ModelZoo de HiSpark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-Transformer (Transformer con atención por ventanas desplazadas) |
| Parametros totales | 28,798 M (28,8 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224) |
| Tipos de cuantizacion | A8W8 (según el archivo `.om` compilado) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no declarada en Hugging Face; referencia al LICENSE MIT de Microsoft Swin-Transformer |
| Formato de pesos | PyTorch (`.pth`), ONNX (`.onnx`), OM compilado para NPU (`.om`) |

## Arquitectura y entrenamiento

Swin-Transformer (Swin = Shifted Window Transformer) introduce un mecanismo de atención restringida a ventanas locales de la imagen, en lugar de atención global sobre todos los píxeles. Esto reduce la complejidad computacional de O(n²) a O(n) respecto al número de parches, y permite una mejor escalabilidad a resoluciones altas. El modelo emplea parches de 4x4 píxeles, seguidos de varias etapas con ventanas de tamaño 7x7 y desplazamiento entre capas consecutivas para permitir la interacción entre ventanas. La variante concreta de este repositorio es `swin_tiny_patch4_window7_224`, es decir, la versión "tiny" con parches de 4x4, ventana de 7x7 y resolución de entrada de 224x224.

El entrenamiento del modelo original se realizó sobre ImageNet-1K, con técnicas estándar de aumento de datos y optimización. No se dispone de información sobre el proceso de entrenamiento específico de esta adaptación para HiSilicon, más allá de que se ha convertido a ONNX y posteriormente compilado a formato OM para su ejecución en NPU. El archivo `swin_sim.onnx` sugiere que se ha generado una versión simplificada o simulada del modelo para verificación.

## Capacidades

- Clasificación de imágenes: el modelo está diseñado para tareas de clasificación en el dominio de la visión por computador, con entrada de 224x224 píxeles.
- Inferencia en NPU de HiSilicon: el formato `.om` compilado con cuantización A8W8 permite ejecución eficiente en el procesador neuronal Hi3403V100, tanto en modo SVP_NNN como NNN.
- Compatibilidad con OpenHarmony: el modelo está adaptado para ejecutarse en dispositivos que usan este sistema operativo, además de Linux.
- Exportación a ONNX: el archivo `.onnx` permite interoperabilidad con otros frameworks y herramientas de inferencia.
- Eficiencia computacional: con 9,567 GFLOPs, el modelo es relativamente ligero en comparación con Transformers de visión de mayor tamaño, adecuado para entornos embebidos.

## Casos de uso

- Clasificación de imágenes en dispositivos IoT con OpenHarmony: el modelo compilado en `.om` puede desplegarse en placas HiSpark con NPU Hi3403V100 para reconocer objetos o escenas en tiempo real, por ejemplo en cámaras inteligentes o sistemas de vigilancia.
- Prototipado rápido en entornos Linux: gracias al formato ONNX, los desarrolladores pueden validar el modelo en PC o servidores con frameworks como ONNX Runtime antes de portarlo al dispositivo final.
- Evaluación de la viabilidad de Swin-Transformer en hardware embebido: el repositorio sirve como referencia para medir el rendimiento (latencia, consumo) de este tipo de arquitectura en NPU de gama media.
- Desarrollo de aplicaciones de visión en el ecosistema HiSpark: el ModelZoo de HiSpark proporciona ejemplos de integración; este modelo puede usarse como base para construir pipelines de clasificación con preprocesamiento y postprocesamiento personalizados.
- Formación y experimentación académica: los pesos `.pth` permiten fine-tuning o extracción de características en PyTorch, aunque el modelo original ya está preentrenado en ImageNet.
- Migración de modelos de visión a hardware con restricciones de memoria: con 28,8 M de parámetros y cuantización A8W8, el modelo es adecuado para dispositivos con poca RAM y almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de precisión (top-1, top-5) ni comparativas con otros modelos. Se desconoce el rendimiento real en la NPU Hi3403V100 (latencia, throughput). La única cifra disponible es la complejidad computacional de 9,567 GFLOPs, que es un dato teórico del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo tiene 28,8 M de parámetros, por lo que en FP32 ocuparía aproximadamente 115 MB de memoria, pero la cuantización A8W8 reduce el peso a unos 29 MB. Sin embargo, el formato `.om` está diseñado para NPU, no para GPU.
- GPU recomendadas: no aplica, el modelo está orientado a NPU de HiSilicon (Hi3403V100). No se proporcionan requisitos para GPU.
- Si cabe en consumer GPU: no se especifica, pero por tamaño podría ejecutarse en cualquier GPU moderna con al menos 2 GB de VRAM si se usan los pesos PyTorch u ONNX.
- Opciones de despliegue: el modelo compilado `.om` se ejecuta en la NPU Hi3403V100 mediante el kit de desarrollo de HiSilicon. Los formatos `.onnx` y `.pth` pueden usarse con ONNX Runtime o PyTorch en CPU/GPU.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo en concreto, por lo que no es posible realizar una comparativa cuantitativa. A modo cualitativo, se puede comparar con otros modelos de clasificación de imágenes de tamaño similar:

| Modelo | Parámetros | Entrada | Complejidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swin-Transformer Tiny (este repo) | 28,8 M | 224x224 | 9,57 GFLOPs | MIT (referencia) | Hugging Face, ModelZoo HiSpark |
| ResNet-50 | 25,6 M | 224x224 | 4,1 GFLOPs | MIT | Ampliamente disponible |
| ViT-Base | 86 M | 224x224 | 17,6 GFLOPs | Apache 2.0 | Hugging Face |

La comparativa es orientativa y se basa en conocimiento general, no en datos de este repositorio. Para una comparación rigurosa se necesitarían resultados de precisión y latencia en el mismo hardware.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones, al ser un modelo de clasificación de imágenes, no generativo.
- El modelo está pensado para clasificación; no soporta otras tareas como detección o segmentación sin modificaciones.
- La licencia no está explícitamente declarada en Hugging Face; aunque el enlace apunta al LICENSE MIT de Microsoft, el usuario debe verificar los términos aplicables a esta adaptación concreta.
- El modelo está etiquetado como idioma `zh`, lo que puede indicar que la documentación y los ejemplos están en chino, aunque el modelo en sí no tiene dependencia de idioma.
- El formato `.om` es específico de la plataforma HiSilicon y no es portable a otras arquitecturas. El uso del modelo en otros entornos requiere los formatos `.onnx` o `.pth`.
- No se han publicado resultados de precisión en ImageNet para esta versión adaptada; se asume que coincide con el modelo original, pero no está verificado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un espejo reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shadow-cann/hispark-modelzoo-swin-transformer
- Portal de HiSilicon (model card original): https://gitbubble.github.io/hisilicon-developer-portal-mirror/model-detail.html?id=ko3ugg54j400
- Repositorio upstream en Gitee: https://gitee.com/HiSpark/modelzoo/tree/master/samples/built-in/classification/Swin-Transformer
- Licencia de referencia (Microsoft Swin-Transformer): https://github.com/microsoft/Swin-Transformer/blob/main/LICENSE
