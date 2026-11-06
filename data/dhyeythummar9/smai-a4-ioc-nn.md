# dhyeythummar9/smai-a4-ioc-nn

## Resumen

IOC-NN (input-output convex neural network) es un modelo de clasificación de imágenes desarrollado por dhyeythummar9 como parte de la asignatura SMAI (Assignment 4, Q1.5). Se trata de un perceptrón multicapa (MLP) de dos capas que opera directamente sobre los píxeles en bruto de CIFAR-10 (32x32x3, aplanados a 3072 dimensiones) y cuya característica distintiva es la convexidad: cada logit de salida es una función convexa de la imagen de entrada. Esto se consigue mediante activación ELU en la capa oculta y restringiendo a valores no negativos todos los pesos posteriores a la primera capa.

El modelo tiene 197.322 parámetros y una arquitectura 3072-64-10. Alcanza una precisión de test de 0,4610 y un F1 medio de 0,4606 sobre las 10.000 imágenes de test de CIFAR-10, tras 100 épocas de SGD plano con lr 0,01 y batch 64 en precisión float64.

Su relevancia es fundamentalmente académica y didáctica: demuestra cómo imponer una restricción estructural fuerte (convexidad input-output) en una red neuronal y qué coste de rendimiento tiene frente a un MLP convencional. No es un modelo pensado para producción, sino una implementación de referencia en NumPy puro, sin dependencias de frameworks de deep learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP 3072-64-10 (ELU oculta, salida identidad), input-output convexa |
| Parametros totales | 197.322 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de clasificacion de imagenes, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float64) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | NPZ de NumPy (`model.npz`, `preprocessing.npz`, `config.json`) |

## Arquitectura y entrenamiento

La red es un MLP de dos capas totalmente conectadas: una capa de entrada de 3072 neuronas (32x32x3 píxeles aplanados en orden HWC), una capa oculta de 64 neuronas con activación ELU y una capa de salida de 10 logits con activación identidad. La restricción de convexidad input-output se impone forzando que todos los pesos posteriores a la primera capa sean no negativos, combinado con la activación ELU, cuya segunda derivada es positiva para valores negativos y nula para positivos, lo que preserva la convexidad de la composición. Los pesos se almacenan como `W0`, `b0`, `W1`, `b1` con `W` en forma (n_in, n_out).

El entrenamiento se realizó sobre las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas, usando SGD plano con learning rate 0,01, tamaño de batch 64, 100 épocas y precisión float64. El preprocesado normaliza los píxeles a [0,1] dividiendo entre 255 y aplica estandarización con media y desviación típica por píxel calculadas sobre el conjunto de entrenamiento (3072 valores cada una). No se documentan técnicas de aumento de datos, regularización ni ajuste fino adicional.

## Capacidades

- Clasificación de imágenes en 10 clases (CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en NumPy puro, sin necesidad de frameworks de deep learning ni GPU.
- Reproducción completa del pipeline de preprocesado e inferencia con el código incluido en la model card.
- Convexidad input-output garantizada por construcción, lo que permite propiedades de optimización sobre la entrada (por ejemplo, minimización convexa respecto a la imagen).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de pensamiento, visión general, audio ni generación de texto.

## Casos de uso

- Docencia y prácticas de convexidad en redes neuronales: el modelo sirve como referencia ejecutable para estudiar cómo una restricción de convexidad input-output afecta al rendimiento y a las propiedades de optimización, con código mínimo en NumPy.
- Investigación en robustez y análisis de gradientes: al ser convexo respecto a la entrada, permite calcular cotas y analizar la sensibilidad de los logits ante perturbaciones de la imagen de forma más tratable que en redes no convexas.
- Clasificación de imágenes de baja resolución en entornos sin GPU: al ejecutarse en NumPy puro con 197.322 parámetros, puede desplegarse en CPU en sistemas embebidos o scripts de validación rápida.
- Generación de explicaciones por gradiente: la convexidad input-output facilita métodos de atribución basados en gradientes y en optimización sobre la entrada para identificar qué píxeles empujan cada logit.
- Baseline académico para comparativas: sirve como punto de referencia de un MLP restringido frente a MLPs convencionales o CNN en CIFAR-10 en estudios de ablation.
- Pruebas de pipelines de preprocesado: el archivo `preprocessing.npz` con media y desviación típica permite validar implementaciones de normalización de CIFAR-10 en proyectos docentes o de integración continua.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en test (10.000 imagenes CIFAR-10) | 0,4610 |
| F1 medio en test | 0,4606 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; los pesos en float64 ocupan aproximadamente 197.322 x 8 bytes ≈ 1,58 MB.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: NumPy puro (única vía documentada); no hay soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por imagen es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (este modelo) | 197.322 | no aplica | 0,4610 | MIT | Hugging Face (NumPy) |
| MLP convencional 3072-64-10 | ~197.000 | no aplica | no disponible | no disponible | no disponible |
| CNN pequena en CIFAR-10 | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; las filas de alternativas se incluyen solo como categorías de referencia y sus valores no están confirmados.

## Limitaciones y advertencias

- Precisión moderada (0,4610) muy por debajo del estado del arte en CIFAR-10; no apta para aplicaciones de producción reales.
- La restricción de convexidad input-output limita la expresividad del modelo y explica en parte su rendimiento inferior a un MLP sin restricciones.
- Entrenado únicamente con píxeles en bruto, sin aumento de datos ni regularización documentada; riesgo de sobreajuste y sesgos heredados de CIFAR-10.
- El conjunto CIFAR-10 contiene sesgos de clase y de representación; el modelo los reproducirá en sus predicciones.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no está validado para ningún caso de uso productivo.
- Pesos en float64 y formato NPZ específico de la librería NumPy del autor; no es directamente compatible con PyTorch, TensorFlow ni ONNX sin conversión manual.
- No es un modelo de lenguaje: no procesa texto, no tiene contexto conversacional ni capacidades multilingües.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni soporte comunitario documentado.

## Enlaces

- Hugging Face: https://huggingface.co/dhyeythummar9/smai-a4-ioc-nn
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
