# arkagme/smai-a4-mlp

## Resumen

`arkagme/smai-a4-mlp` es una implementación didáctica de un perceptrón multicapa (MLP) entrenado sobre CIFAR-10, publicada como artefacto de la asignatura SMAI (Assignment 4, cuestiones 1.4 y 1.5). No se trata de un modelo de lenguaje ni de un modelo fundacional: es una red neuronal feedforward de dos capas (una oculta) implementada íntegramente en NumPy, sin frameworks de deep learning. El repositorio contiene los pesos en formato `.npz` y las estadísticas de preprocesado necesarias para reproducir la inferencia.

La arquitectura es 3072 → 128 → 10, con activación ReLU en la capa oculta y salida lineal de 10 logits entrenada con entropía cruzada softmax. El entrenamiento se realizó con SGD plano (lr 0.01, batch 64, 100 épocas) sobre las 50.000 imágenes del split `train` de CIFAR-10 con etiquetas verdaderas, alcanzando una precisión de entrenamiento de 0,8611 y una precisión de test de 0,4624 sobre las 10.000 imágenes del split `test`.

Su relevancia es exclusivamente educativa y de referencia: ilustra el flujo completo de entrenamiento en NumPy (inicialización, preprocesado por columnas, SGD con acumulación de gradiente, evaluación), pero no está pensado para producción, no soporta texto ni otras modalidades, y no dispone de model card orientada a uso general. Cualquier evaluación como modelo de IA generativa debe descartarse de antemano.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP feedforward: 3072 → 128 → 10, activación ReLU en capa oculta, salida identidad (10 logits) |
| Parámetros totales | 3072×128 + 128 + 128×10 + 10 = 394.634 (aproximadamente 0,39 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia; entrada fija de 3072 valores) |
| Tipos de cuantización | no disponible (pesos en float64 dentro de `model.npz`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `.npz` de NumPy (`W0, b0, W1, b1`, más `activations` y `loss`) |

## Arquitectura y entrenamiento

La red es un MLP de una sola capa oculta con 128 unidades y activación ReLU, seguida de una capa de salida lineal de 10 unidades que produce logits para las 10 clases de CIFAR-10. La inicialización sigue la regla de He: `N(0, 2/n_in)` para las capas con ReLU y `N(0, 1/n_in)` en caso contrario, con sesgos a cero. La pérdida es entropía cruzada softmax y el entrenamiento se ejecutó en precisión float64 con semilla 1044.

El entrenamiento utilizó SGD plano con learning rate 0,01, tamaño de batch 64, acumulación de gradiente 1 y 100 épocas sobre las 50.000 imágenes del split `train` con etiquetas verdaderas. El preprocesado convierte cada imagen `(32, 32, 3)` uint8 a un vector de 3072 posiciones en orden H, W, C, normaliza a [0, 1] dividiendo entre 255 y aplica estandarización por columna usando la media y la desviación típica poblacional calculadas sobre el split de entrenamiento (guardadas en `preprocessing.npz`). No se emplearon técnicas de regularización, data augmentation, optimizadores adaptativos ni ajuste fino por RLHF/DPO; es un experimento de referencia de un curso.

## Capacidades

- Clasificación de imágenes de 32×32×3 en 10 clases (las clases de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión).
- Inferencia en NumPy puro, sin dependencias de frameworks de deep learning.
- Reproducibilidad completa del pipeline de preprocesado mediante `preprocessing.npz`.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, audio ni tool calling.
- No soporta agentes, multi-step reasoning ni modo de pensamiento.
- No tiene capacidades multilingües (no procesa lenguaje).
- No es un modelo conversacional ni expone una API de chat.

## Casos de uso

- Docencia y material de referencia: sirve como ejemplo canónico de implementación de un MLP desde cero en NumPy, útil en asignaturas de aprendizaje automático para ilustrar forward pass, backward pass y SGD sin abstracciones de framework.
- Reproducción de experimentos: permite replicar exactamente los resultados del assignment (precisión de test 0,4624) gracias a la semilla fija y a las estadísticas de preprocesado incluidas.
- Baseline de clasificación en CIFAR-10: se puede usar como línea base mínima contra la que comparar arquitecturas convolucionales o modelos más grandes; su 46,24 % de precisión de test marca el suelo esperado para un MLP simple.
- Pruebas de pipelines de preprocesado: el archivo `preprocessing.npz` y la convención de reordenación H, W, C permiten validar rutas de carga y normalización de imágenes en proyectos propios.
- Ejercicios de análisis de sobreajuste: la brecha entre precisión de entrenamiento (0,8611) y de test (0,4624) es un caso de estudio claro para discutir generalización y regularización.
- Verificación de implementaciones de entropía cruzada softmax: los pesos y la estructura permiten comprobar numéricamente implementaciones alternativas de la pérdida y del gradiente.
- Demostraciones de inferencia en entornos sin GPU: al ser un modelo de 0,39 M de parámetros en NumPy, se ejecuta en CPU en cualquier portátil.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las precisiones del propio entrenamiento:

| Métrica | Valor |
|---|---|
| Precisión de entrenamiento (50.000 imágenes) | 0,8611 |
| Precisión de test (10.000 imágenes) | 0,4624 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes de visión como ImageNet) en la información disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: despreciable. El modelo ocupa menos de 4 MB en float64 (394.634 parámetros × 8 bytes ≈ 3,2 MB) y menos de 2 MB en float32.
- GPU recomendadas: no requiere GPU; se ejecuta en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna; también en Raspberry Pi.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue se reduce a cargar `model.npz` con `numpy.load` y ejecutar el forward pass manualmente.
- Latencia y throughput: no publicados. Por el tamaño, el forward pass de un lote completo es del orden de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arkagme/smai-a4-mlp` | ~0,39 M | no aplica | 0,4624 | no disponible | HuggingFace |
| LeNet-5 (referencia histórica) | ~60 K | no aplica | ~0,70 (típico en CIFAR-10 con augmentation) | no disponible | implementaciones múltiples |
| ResNet-18 | ~11,2 M | no aplica | ~0,95 (típico con augmentation) | no disponible | torchvision |
| VGG-11 | ~132 M | no aplica | ~0,92 (típico con augmentation) | no disponible | torchvision |

Las cifras de LeNet-5, ResNet-18 y VGG-11 son valores de referencia habituales en la literatura para CIFAR-10 con data augmentation y no provienen de la información proporcionada; se incluyen solo como orientación cualitativa. El modelo de `arkagme` no aplica data augmentation ni regularización, lo que explica en parte su menor precisión.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no genera contenido y no responde a prompts.
- La precisión de test (0,4624) es baja para estándares actuales de CIFAR-10; no es apto para aplicaciones reales de clasificación de imágenes.
- Brecha severa de sobreajuste: 0,8611 en entrenamiento frente a 0,4624 en test.
- Solo clasifica las 10 clases de CIFAR-10; no generaliza a otras categorías ni a imágenes de mayor resolución sin reentrenamiento.
- Entrenado únicamente con el split `train` de CIFAR-10 con etiquetas verdaderas; no se evaluó robustez ante ruido, corrupción o adversariales.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Sin model card orientada a producción, sin evaluación de sesgos y sin documentación de limitaciones por parte del autor.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB; no hay evidencia de mantenimiento ni soporte.
- Depende de la convención exacta de preprocesado (orden H, W, C y estadísticas de `preprocessing.npz`); usarlo con otra normalización degrada la precisión.

## Enlaces

- HuggingFace: https://huggingface.co/arkagme/smai-a4-mlp
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
