# ivanleomk/resnet18-svhn

## Resumen
El modelo `ivanleomk/resnet18-svhn` es un clasificador de imágenes basado en la arquitectura ResNet18, entrenado específicamente sobre el dataset SVHN (Street View House Numbers) para reconocer dígitos del 0 al 9 en fotografías de números de calle. Fue desarrollado por el usuario ivanleomk como parte de un barrido de hiperparámetros ejecutado en GPUs A100 de Modal, con caché persistente del volumen de datos. El mejor resultado del barrido alcanzó un 96,13% de precisión en validación con el optimizador AdamW, una tasa de aprendizaje de 0,001 y sin cutout. El modelo se presenta como un ejemplo de entrenamiento eficiente, pero no incluye licencia ni pesos publicados en el repositorio, lo que limita su uso directo.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0.0 GB) |

## Arquitectura y entrenamiento
El modelo es un ResNet18, una red neuronal convolucional residual de 18 capas, ampliamente utilizada para tareas de clasificación de imágenes. Se entrenó sobre el dataset SVHN, que contiene 32x32 píxeles de imágenes a color de dígitos de casas. El proceso de entrenamiento se realizó mediante un barrido de hiperparámetros (sweep) ejecutado en GPUs A100 de Modal, con persistencia del dataset en volumen para acelerar el acceso a los datos. El barrido evaluó distintas configuraciones de optimizador (AdamW, SGD), tasas de aprendizaje (0,001, 0,05, 0,1) y el uso de cutout. El mejor resultado en validación fue con AdamW, LR 0,001 y sin cutout, alcanzando un 96,13 % de precisión. No se especifican el número de épocas, el tamaño de lote, ni el preprocesado adicional.

## Capacidades
- Clasificación de imágenes de dígitos del 0 al 9 en el dominio SVHN.
- Entrada de imágenes RGB de 32x32 píxeles (formato estándar de SVHN).
- Salida de una distribución de probabilidad sobre 10 clases (0-9).
- No se indican capacidades de generación de texto, tool calling, agentes, ni procesamiento de lenguaje natural.
- Es un modelo discriminativo de visión por computador, sin capacidades multimodales.

## Casos de uso
- Reconocimiento de números de calle en imágenes de Google Street View: el modelo puede extraer dígitos de fachadas y señales para geolocalización o actualización de mapas.
- Automatización de entrada de direcciones en sistemas de gestión postal: dado un recorte de imagen con el número, el modelo devuelve el dígito o secuencia.
- Componente de un pipeline OCR para documentos escaneados: se puede integrar como detector de dígitos en formularios o facturas.
- Aplicaciones de asistencia a la navegación para personas con discapacidad visual: el modelo ayuda a interpretar números de edificios en tiempo real.
- Herramienta educativa para enseñar visión por computadora: sirve como base para experimentos de clasificación de imágenes con arquitecturas residuales.
- Prototipado rápido de clasificadores de imágenes en entornos de bajo consumo, dado que ResNet18 es ligera y requiere pocos recursos de computación.

## Benchmarks y rendimiento
El autor no ha publicado resultados en benchmarks estándar externos (como MMLU o HumanEval, que no aplican a visión). Los únicos datos disponibles provienen del barrido de validación, que se presentan en la siguiente tabla:

| Run | Optimizador | LR | Cutout | Best Val Acc |
| :--- | :--- | :--- | :--- | :--- |
| **adamw-fast** | adamw | 0.001 | False | **96.13%** |
| **cutout-sgd** | sgd | 0.05 | True | **95.80%** |
| **baseline-sgd** | sgd | 0.05 | False | **95.68%** |
| **aggressive-sgd** | sgd | 0.1 | False | **95.68%** |

No se dispone de la precisión de test del modelo ganador, ni de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware
No se especifican en la información disponible. No obstante, al tratarse de un ResNet18, la inferencia es viable en GPUs de gama media (por ejemplo, una NVIDIA GTX 1060 o superior) y también en CPU con tiempos de espera mayores. El entrenamiento se realizó en GPUs A100 de Modal, pero no se indican requisitos de VRAM específicos. Para el despliegue se podrían usar frameworks como PyTorch, ONNX Runtime o TensorRT, aunque no se detalla ningún soporte oficial.

## Comparativa con modelos similares
Se encontró otro modelo ResNet18 entrenado en SVHN del usuario `edadaltocg/resnet18_svhn`, que reporta una precisión de test de 0,9595 y una licencia MIT. La comparación se muestra a continuación:

| Modelo | Precisión (val/test) | Licencia | Parámetros | Contexto |
| :--- | :--- | :--- | :--- | :--- |
| `ivanleomk/resnet18-svhn` | 96.13% (val) | no disponible | no disponible | no aplica |
| `edadaltocg/resnet18_svhn` | 95.95% (test) | MIT | no disponible | no aplica |

No se dispone de más información sobre otros modelos comparables en la búsqueda realizada.

## Limitaciones y advertencias
- No se especifica licencia, por lo que no es posible utilizarlo en proyectos comerciales ni académicos sin confirmar los términos de uso.
- El repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos del modelo no están publicados; no se puede descargar el modelo para inferencia.
- El modelo solo clasifica las 10 clases de dígitos (0-9) y no es extensible a otras categorías sin reentrenamiento.
- No se documentan sesgos, pero los datos de SVHN provienen de imágenes de números de calle de Estados Unidos, por lo que el rendimiento puede degradarse en otras regiones o estilos de señalización.
- Al no existir información sobre el proceso de validación, el 96.13% de precisión de validación podría no reflejar el rendimiento en datos reales.
- No se han publicado resultados en benchmarks externos, por lo que la comparación con otros modelos es limitada.

## Enlaces
- [Modelo en HuggingFace](https://huggingface.co/ivanleomk/resnet18-svhn)
- [Modelo alternativo `edadaltocg/resnet18_svhn`](https://huggingface.co/edadaltocg/resnet18_svhn)
- [Repositorio GitHub con otro entrenamiento ResNet en SVHN](https://github.com/Jahn1998/ResNetBuiltSVHN)
