# lazy-toad/alexnet-imagenette

## Resumen

El modelo `lazy-toad/alexnet-imagenette` es una implementación de AlexNet entrenada desde cero sobre el conjunto de datos Imagenette 320px, que contiene 10 clases y aproximadamente 9.500 imágenes de entrenamiento. El autor, lazy-toad, lo desarrolló como un proyecto de aprendizaje para comprender el ciclo completo de una arquitectura CNN clásica: carga de datos, entrenamiento, precisión mixta, evaluación y despliegue. Se trata de un modelo de clasificación de imágenes de tamaño reducido (0,1 GB) que alcanza una precisión de test del 79,09% sobre las 10 clases de Imagenette. Su relevancia radica en ser un ejemplo didáctico y funcional de una arquitectura histórica, útil para quienes estudian visión por computador o necesitan un clasificador ligero para tareas acotadas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AlexNet modificado para entrada de 320×320 píxeles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de clases en inglés) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño clásico de AlexNet, adaptado para imágenes de 320×320. Consta de cinco capas convolucionales con ReLU y max-pooling, seguidas de tres capas totalmente conectadas con dropout (0,5) en las dos primeras. La entrada es de 3 canales (RGB) y la salida final tiene 10 neuronas, una por clase. El entrenamiento se realizó durante 30 épocas con optimizador SGD (lr=0,01, momentum=0,9, weight decay=5e-4) y un programador de tasa de aprendizaje StepLR (step_size=15, gamma=0,1). Se usó precisión mixta FP16 (AMP) sobre una GPU T4 de Kaggle, con un tiempo total de entrenamiento de aproximadamente 25-30 minutos. No se mencionan técnicas innovadoras más allá de la propia arquitectura clásica.

## Capacidades

- Clasificación de imágenes en 10 clases específicas: tench, english springer, cassette player, chain saw, church, french horn, garbage truck, gas pump, golf ball y parachute.
- Inferencia sobre imágenes de 320×320 píxeles, con preprocesamiento estándar de normalización.
- Extracción de características mediante las capas convolucionales, útil para transfer learning o análisis de activaciones.
- Entrenamiento y evaluación reproducibles gracias a la documentación detallada del proceso.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la visión.
- El modelo es monolingüe en cuanto a etiquetas, pero la clasificación es independiente del idioma.

## Casos de uso

- Proyectos educativos de visión por computador: el modelo sirve como ejemplo completo de entrenamiento de una CNN clásica, permitiendo a estudiantes analizar cada capa, el efecto del dropout o la influencia de la tasa de aprendizaje.
- Prototipado rápido de clasificadores de imágenes: con solo 10 clases y un peso de 0,1 GB, puede integrarse en una demo o prueba de concepto para validar un pipeline de clasificación antes de escalar a modelos más grandes.
- Transferencia de características: las activaciones de las capas convolucionales pueden extraerse y usarse como características para otros clasificadores (por ejemplo, SVM) en tareas similares.
- Demostraciones de despliegue en entornos con recursos limitados: al ser un modelo pequeño, puede ejecutarse en CPU o en GPUs de gama baja, sirviendo como referencia para medir latencia y consumo.
- Análisis de interpretabilidad: al ser una arquitectura simple, es adecuado para visualizar mapas de activación, Grad-CAM o filtros aprendidos, facilitando la comprensión de qué patrones detecta cada capa.
- Benchmarking de frameworks de inferencia: puede usarse para comparar el rendimiento de PyTorch, ONNX Runtime o TensorFlow Lite en tareas de clasificación de imágenes pequeñas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en test | 79,09% |
| Mejor precisión de validación | 79,53% |
| Épocas de entrenamiento | 30 |
| Optimizador | SGD (lr=0,01, momentum=0,9, weight decay=5e-4) |
| Programador de LR | StepLR (step_size=15, gamma=0,1) |
| Hardware de entrenamiento | Kaggle T4 GPU |
| Precisión mixta | FP16 (AMP) |
| Tiempo de entrenamiento | ~25-30 min |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, lo que indica un modelo muy ligero.
- Inferencia en CPU: viable, con tiempos de respuesta del orden de milisegundos por imagen (estimación razonable para una CNN pequeña, aunque no se proporcionan datos exactos).
- Inferencia en GPU: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060 o superior ofrecería latencias muy bajas.
- Entrenamiento: se realizó en una T4 de Kaggle (16 GB VRAM), pero podría repetirse en GPUs con 8 GB o menos si se reduce el batch size.
- Opciones de despliegue: PyTorch nativo, exportación a ONNX, TorchScript o conversión a TensorFlow Lite para dispositivos móviles.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que es una implementación específica de AlexNet sobre Imagenette, podría compararse con otras variantes de AlexNet o con modelos modernos como ResNet-18, pero no hay datos de rendimiento de esos modelos sobre el mismo conjunto de datos en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado únicamente sobre las 10 clases de Imagenette; no generaliza a otras categorías de imágenes.
- La precisión del 79,09% es modesta en comparación con arquitecturas modernas, por lo que no es adecuado para aplicaciones de producción donde se requiera alta exactitud.
- No se han documentado sesgos específicos, pero al ser un proyecto educativo, no se realizaron auditorías de equidad ni de robustez.
- Al ser un modelo de visión, no presenta riesgo de alucinación textual, pero puede producir clasificaciones erróneas con confianza alta en imágenes fuera de distribución.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías de soporte ni mantenimiento.
- El formato de pesos es un archivo .pt de PyTorch; para usarlo en otros frameworks es necesario convertirlo.

## Enlaces

- [HuggingFace - lazy-toad/alexnet-imagenette](https://huggingface.co/lazy-toad/alexnet-imagenette)
- [Imagenette (fastai)](https://github.com/fastai/imagenette)
