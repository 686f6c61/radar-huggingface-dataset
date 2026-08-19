# DeKUT-DSAIL/convnextv2-huge-cifar10-native

## Resumen

El modelo `DeKUT-DSAIL/convnextv2-huge-cifar10-native` es un clasificador de imágenes basado en la arquitectura ConvNeXt V2 Huge, ajustado (fine-tuned) sobre el dataset CIFAR-10 a resolución nativa de 32x32 píxeles. Ha sido desarrollado por el grupo DeKUT-DSAIL y se publica bajo licencia MIT, con pesos en formato safetensors y un tamaño total de 657,5 millones de parámetros. El modelo parte de los pesos preentrenados en ImageNet (nombre `timm` `convnextv2_huge`) y se adapta el stem convolucional para aceptar directamente imágenes de 32x32 sin necesidad de upsampling, como parte de un estudio comparativo entre resolución nativa y redimensionado.

Este modelo es relevante porque demuestra que una arquitectura de alto rendimiento diseñada para imágenes grandes puede adaptarse eficazmente a resoluciones bajas como las de CIFAR-10, logrando una precisión top-1 del 99,18 % en el conjunto de test. Su interés práctico reside en servir como referencia para experimentos de visión por computador en entornos con restricciones de resolución, así como para investigaciones sobre transferencia de aprendizaje y calibración de modelos. Al ser un modelo puramente convolucional, no requiere mecanismos de atención ni decodificación autoregresiva, lo que facilita su despliegue en tareas de clasificación estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 Huge (red neuronal convolucional) |
| Parametros totales | 657.500.810 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ConvNeXt V2 Huge, una red convolucional moderna que incorpora bloques con kernels de gran tamaño y normalización por capas, diseñada originalmente para tareas de clasificación en ImageNet. En este caso, el stem de la red se ha modificado para aceptar entradas nativas de 32x32 píxeles (convolución 3x3 y stride 1), en lugar de las habituales 224x224, lo que evita el redimensionado previo y conserva la información original de las imágenes de CIFAR-10.

El entrenamiento consiste en un fine-tuning desde los pesos preentrenados en ImageNet, realizado sobre el dataset CIFAR-10 (60.000 imágenes de 32x32, 50.000 para entrenamiento y 10.000 para test). No se han publicado detalles sobre el número de épocas, el optimizador o la política de regularización utilizados. El preprocesamiento aplicado es un resize a 32x32 (aunque las imágenes ya son de ese tamaño) seguido de normalización con la media `[0.4914, 0.4822, 0.4465]` y la desviación estándar `[0.247, 0.2435, 0.2616]` propias de CIFAR-10.

## Capacidades

- Clasificación de imágenes en 10 categorías de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión.
- Inferencia a resolución nativa de 32x32 píxeles, sin necesidad de upsampling previo.
- Salida de probabilidades por clase, utilizable para análisis de confianza y calibración.
- Integración sencilla con la librería `timm` y con el script `cifar_classifier.py` proporcionado por el autor.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multimodales más allá de la visión.

## Casos de uso

- Prototipado rápido de sistemas de clasificación de imágenes pequeñas: el modelo puede integrarse en aplicaciones que trabajen con imágenes de baja resolución (por ejemplo, sensores de bajo coste) para reconocer objetos básicos.
- Investigación académica en transferencia de aprendizaje: sirve como punto de partida para estudiar cómo se comporta una arquitectura grande cuando se adapta a dominios de baja resolución, comparando con versiones que usan upsampling.
- Evaluación de calibración de modelos: al proporcionar métricas como ECE, es útil para experimentos sobre fiabilidad de predicciones en clasificación.
- Sistemas educativos de visión por computador: puede utilizarse en cursos o talleres para demostrar el impacto de la resolución de entrada en el rendimiento.
- Benchmarking de hardware de inferencia: al ser un modelo de 657M parámetros pero con entrada pequeña, permite medir latencia y uso de memoria en dispositivos embebidos o GPUs de gama baja.
- Componente de un pipeline de visión más amplio: por ejemplo, como clasificador de primer nivel en un sistema que procese imágenes de 32x32 (como algunas cámaras de vigilancia de baja resolución).

## Benchmarks y rendimiento

Según la model card del autor, los resultados en el conjunto de test de CIFAR-10 (10.000 imágenes) son los siguientes:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 99,18 % |
| Top-5 accuracy | 99,91 % |
| F1 (macro) | 0,9918 |
| AUC (macro) | 0,9991 |
| ECE (Expected Calibration Error) | 0,1082 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware. A modo orientativo, el modelo tiene 657,5 millones de parámetros y el repositorio ocupa 2,6 GB en safetensors (presumiblemente en FP32).
- Para inferencia de una sola imagen a 32x32, el uso de VRAM es reducido: con pesos en FP16 se estima un consumo de aproximadamente 1,3 GB, lo que permite ejecutarlo en GPUs de consumo como la NVIDIA GTX 1060 (6 GB) o superiores.
- En CPU, la inferencia es factible gracias al pequeño tamaño de entrada, aunque la latencia dependerá del hardware concreto.
- Opciones de despliegue: al ser un modelo `timm`, puede cargarse con PyTorch estándar. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- Para entrenamiento o fine-tuning adicional, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 2070 o superior) para manejar el optimizador y los gradientes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No obstante, se podría comparar con otros clasificadores de CIFAR-10 como ResNet-50 o ViT-Tiny, pero no se tienen datos de rendimiento de estos en la misma configuración.

## Limitaciones y advertencias

- El modelo está limitado a las 10 clases de CIFAR-10; no puede clasificar objetos fuera de ese conjunto.
- La resolución nativa de 32x32 limita su uso en imágenes de mayor resolución; si se aplica a imágenes grandes, se requeriría un redimensionado que podría degradar el rendimiento.
- El alto accuracy (99,18 %) sugiere un posible sobreajuste al conjunto de test, aunque la métrica ECE de 0,1082 indica una calibración moderada, con riesgo de predicciones demasiado confiadas.
- No se han documentado sesgos específicos, pero al entrenarse en CIFAR-10, que contiene imágenes de baja resolución y clases limitadas, el modelo puede no generalizar bien a dominios fotográficos reales.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar la procedencia de los datos de entrenamiento (CIFAR-10 es de uso libre).
- No se proporcionan detalles sobre el proceso de entrenamiento (épocas, hiperparámetros), lo que dificulta la reproducibilidad exacta.

## Enlaces

- [HuggingFace: DeKUT-DSAIL/convnextv2-huge-cifar10-native](https://huggingface.co/DeKUT-DSAIL/convnextv2-huge-cifar10-native)
- No se han encontrado otros enlaces (papers, repositorios o demos) en la información disponible.
