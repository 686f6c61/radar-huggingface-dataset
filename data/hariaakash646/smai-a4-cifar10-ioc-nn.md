# hariaakash646/smai-a4-cifar10-ioc-nn

## Resumen

smai-a4-cifar10-ioc-nn es un perceptrón multicapa (MLP) de tres capas entrenado para clasificación de imágenes en CIFAR-10, publicado por el usuario hariaakash646 como parte de la asignación 4 de la asignatura SMAI (sección 1.5). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto académico que implementa una red "input-output convex" (IOC-NN), en la que las dos últimas capas tienen pesos restringidos a valores no negativos para que cada logit sea una función convexa de la entrada.

El modelo recibe imágenes de 32x32x3 aplanadas a 3072 valores, las normaliza con media y desviación típica calculadas sobre el conjunto de entrenamiento y las propaga por una red 3072 → 512 → 256 → 10 con activación ELU en las capas ocultas y salida lineal de 10 logits. Los pesos se distribuyen en formato NumPy (`.npz`), por lo que la inferencia se ejecuta directamente con NumPy sin necesidad de frameworks de deep learning.

Su relevancia es limitada fuera del contexto docente: no hay información sobre licencia, idiomas ni benchmarks comparativos, el repositorio pesa 0 GB y no registra descargas ni likes. Resulta útil como referencia didáctica de restricciones de convexidad en redes neuronales y como ejemplo mínimo de despliegue de clasificación CIFAR-10 sin dependencias pesadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado (3072 → 512 → 256 → 10), activación ELU en capas ocultas, salida lineal |
| Parámetros totales | 1.707.274 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes de 32x32x3) |
| Tipos de cuantización | no disponible (pesos en float dentro de `.npz`) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`W0, b0, W1, b1, W2, b2`), más `preprocessing.npz` y `config.json` |

## Arquitectura y entrenamiento

La red es un MLP de tres capas densas con 1.707.274 parámetros. La capa de entrada proyecta los 3072 valores de la imagen aplanada a 512 unidades, la segunda reduce a 256 y la tercera produce 10 logits (uno por clase de CIFAR-10). Las capas ocultas usan ELU; la salida no aplica activación y se entrena con softmax más entropía cruzada. La peculiaridad es la restricción IOC: los pesos de las capas 2 y 3 se inicializan uniformemente en (0, 2/n_in) y, tras cada paso de SGD, cualquier peso negativo w se sustituye por exp(w − 5). De este modo todos los pesos de esas capas permanecen positivos y cada logit resulta una función convexa de la entrada.

El preprocesado aplana cada imagen en orden HWC a 3072 valores, convierte a float, divide por 255 y estandariza por columna con la media y la desviación típica de `preprocessing.npz`, calculadas sobre las 50.000 imágenes de entrenamiento de CIFAR-10 (std = 1 donde era 0). El entrenamiento se hizo en PyTorch con SGD plano, learning rate 0,05, batch size 64, `grad_accumulation_steps = 1`, 100 épocas, etiquetas verdaderas (p = 0) y sin early stopping, sobre las 50.000 imágenes de train. Las semillas fueron `torch.manual_seed(11002)` y semilla 11003 para el generador del DataLoader. No se documenta ningún tipo de RLHF, DPO ni ajuste fino posterior.

## Capacidades

- Clasificación de imágenes de 32x32x3 en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en NumPy puro: el bucle de tres multiplicaciones matriciales más ELU se ejecuta sin PyTorch ni otras librerías de deep learning.
- Reproducibilidad determinista del preprocesado gracias a `preprocessing.npz` (media y desviación típica fijas).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Docencia de restricciones de convexidad: el modelo sirve para ilustrar en clase cómo imponer pesos no negativos con la sustitución exp(w − 5) y qué efecto tiene sobre la precisión de test (0,4916 frente a 0,8437 en train).
- Clasificación CIFAR-10 de bajo coste en entornos sin GPU: al ser NumPy puro, se puede ejecutar en cualquier máquina con Python y NumPy para etiquetar lotes pequeños de imágenes de 32x32.
- Baseline de referencia en trabajos académicos: sirve como punto de comparación para experimentos sobre redes convexas o sobre regularización de pesos en MLPs.
- Pruebas de pipelines de preprocesado: el par `preprocessing.npz` + `model.npz` permite validar flujos de normalización por columna y de aplanado HWC antes de escalar a modelos mayores.
- Demostraciones de despliegue mínimo: se puede integrar en un script o notebook sin instalar PyTorch, útil para entornos restringidos o contenedores ligeros.
- Reproducción de experimentos: las semillas y los hiperparámetros documentados permiten replicar el entrenamiento y verificar la accuracy reportada.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card sobre el conjunto de test de CIFAR-10 (10.000 imágenes):

| Métrica | Valor |
|---|---|
| Accuracy de entrenamiento | 0,8437 |
| Accuracy de test | 0,4916 |
| Pérdida de entrenamiento | 0,5037 |
| Pérdida de test | 3,5516 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (1.707.274 parámetros × 4 bytes ≈ 6,8 MB de pesos, más buffers de activación para lotes pequeños); cabe en cualquier GPU consumer.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, sirve cualquiera (GTX 1050, RTX 3060, RTX 4090, A100, H100), aunque no aporta ventaja significativa.
- Cabe en GPU consumer: sí, en todas, con un consumo de memoria despreciable.
- Opciones de despliegue: NumPy directamente (según el snippet de la model card); también se puede portar a ONNX, a llama.cpp no aplica, y vLLM/TGI no son compatibles porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al tratarse de tres multiplicaciones matriciales de 3072×512, 512×256 y 256×10, el coste por imagen es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-ioc-nn | 1.707.274 | no aplica | 0,4916 | no disponible | HuggingFace (0 descargas) |
| MLP estándar CIFAR-10 (referencia típica) | ~1,7 M | no aplica | no disponible | variable | múltiples repositorios |
| ResNet-18 CIFAR-10 | ~11,2 M | no aplica | no disponible | variable | torchvision y variantes |
| ViT pequeño CIFAR-10 | ~5-22 M | no aplica | no disponible | variable | múltiples repositorios |

No se dispone de datos verificables de benchmarks para las alternativas en la información proporcionada; la comparativa se limita a parámetros y disponibilidad. No se han encontrado modelos comparables con la misma restricción IOC en la búsqueda realizada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse solo con CIFAR-10, hereda los sesgos de composición y etiquetado de ese dataset.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero el modelo puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: solo acepta imágenes de 32x32x3 en orden HWC; no procesa texto ni otros tamaños sin reescalado previo.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede asumir uso comercial sin consultar al autor.
- Caveat para producción: la accuracy de test (0,4916) es baja para un clasificador CIFAR-10 y la brecha respecto a train (0,8437) indica sobreajuste; no es adecuado para aplicaciones reales de clasificación.
- La restricción de convexidad limita la capacidad expresiva de la red y explica en parte el rendimiento moderado.
- El repositorio no registra descargas ni likes y el tamaño es de 0 GB, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el artefacto es mínimo; conviene verificar los ficheros antes de usarlo.
- No hay información sobre mantenimiento, versionado ni soporte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hariaakash646/smai-a4-cifar10-ioc-nn
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
