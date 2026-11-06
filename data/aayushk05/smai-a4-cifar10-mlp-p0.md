# Aayushk05/smai-a4-cifar10-mlp-p0

## Resumen

`smai-a4-cifar10-mlp-p0` es un perceptrón multicapa (MLP) de tres capas entrenado desde cero sobre el conjunto de datos CIFAR-10, publicado por el usuario Aayushk05 como parte de la asignación 4 de un curso de SMAI (Statistical Methods for Artificial Intelligence). No es un modelo de lenguaje ni un modelo fundacional: es un clasificador de imágenes de 32×32 píxeles en 10 categorías, con una arquitectura totalmente conectada de 3072 entradas, 128 neuronas ocultas con activación ReLU y 10 salidas. El repositorio pesa 0,0 GB y contiene únicamente los pesos en formato NumPy (`.npz`), los parámetros de preprocesado y un `config.json`.

Su relevancia es exclusivamente educativa y de referencia: sirve para ilustrar el flujo completo de entrenamiento, preprocesado y evaluación de una red neuronal simple, así como para comparar el rendimiento de un baseline MLP frente a arquitecturas convolucionales en CIFAR-10. Alcanza una precisión de test de 0,4774 (47,74 %) y una precisión de entrenamiento final de 0,9110 (91,10 %), lo que evidencia un sobreajuste considerable típico de un MLP sin regularización sobre imágenes.

No dispone de model card extendida, licencia declarada, idiomas soportados ni pipeline de Hugging Face configurado. Cualquier uso en producción requeriría reconstruir el código de inferencia a partir de los archivos de pesos y del `config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, 3072-128-10 |
| Parametros totales | 3072×128 + 128 + 128×10 + 10 = 394.634 (calculado a partir de la arquitectura descrita) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes, entrada fija de 32×32×3) |
| Tipos de cuantizacion | no disponible (pesos en NumPy float, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`W{k}` con forma (in, out) y `b{k}`), más `preprocessing.npz` y `config.json` |

## Arquitectura y entrenamiento

La red es un MLP de una sola capa oculta: 3072 unidades de entrada (la imagen RGB de 32×32×3 aplanada en orden HWC), 128 unidades ocultas con activación ReLU y 10 unidades de salida correspondientes a las clases de CIFAR-10. El entrenamiento se realizó sobre el conjunto de entrenamiento limpio de CIFAR-10 (50.000 imágenes) durante 100 épocas con descenso de gradiente estocástico (SGD) plano, tasa de aprendizaje 0,01 y tamaño de lote 64. No se menciona el uso de momentum, weight decay, dropout, data augmentation ni schedule de learning rate.

El preprocesado es explícito y debe replicarse en inferencia: aplanar la imagen HWC a 3072 valores, dividir entre 255, restar la media (`mean`) y dividir por la desviación típica (`std`) calculadas sobre los píxeles de entrenamiento, ambas almacenadas en `preprocessing.npz`. No se documenta ninguna innovación técnica adicional (sin atención, sin convoluciones, sin normalización por lotes ni conexiones residuales). El gap entre precisión de entrenamiento (91,10 %) y de test (47,74 %) indica sobreajuste severo, coherente con la ausencia de regularización y con la falta de sesgo inductivo espacial de un MLP sobre imágenes.

## Capacidades

- Clasificación de imágenes de 32×32 píxeles RGB en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia determinista por forward pass: aplanado, normalización con media y desviación típica de entrenamiento, multiplicación matricial y ReLU, y capa de salida de 10 logits.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión general, audio ni generación de texto.
- No incluye capa softmax explícita en los pesos; la conversión a probabilidades debe hacerse en el código de inferencia.

## Casos de uso

- Docencia y prácticas de aprendizaje profundo: reproducción del pipeline completo (carga de CIFAR-10, preprocesado con media y desviación típica, entrenamiento con SGD y evaluación) para comparar con baselines convolucionales.
- Baseline de referencia en experimentos de clasificación de imágenes: sirve como cota inferior de precisión (47,74 %) frente a la que medir mejoras de CNN, aumentación de datos o regularización.
- Estudio de sobreajuste: el contraste entre 91,10 % en entrenamiento y 47,74 % en test permite analizar curvas de aprendizaje y el efecto de técnicas como dropout o weight decay.
- Prototipado rápido en entornos sin GPU: al ser un MLP de ~395.000 parámetros en NumPy, la inferencia y el reentrenamiento caben en CPU y en memoria RAM convencional.
- Análisis de preprocesado: validar el impacto de la normalización por media y desviación típica frente a otras estrategias (por ejemplo, escalado simple a [0,1]) en un clasificador lineal-ish.
- Ejercicios de empaquetado y despliegue: convertir los pesos `.npz` a otro formato (ONNX, TensorFlow Lite) y medir latencia en dispositivos de borde, dado el reducido tamaño del modelo.
- Comparación de arquitecturas en un curso: usar el mismo split de CIFAR-10 para contrastar MLP, CNN pequeña y modelos preentrenados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de test (CIFAR-10) | 0,4774 (47,74 %) |
| Precision de entrenamiento final | 0,9110 (91,10 %) |
| Epocas | 100 |
| Optimizador | SGD, lr 0,01, batch 64 |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje ni un clasificador de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (394.634 parámetros en float32 ≈ 1,6 MB) más el buffer de entrada; en la práctica, cualquier GPU o CPU moderna es suficiente.
- GPU recomendadas: no se requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) ejecuta la inferencia sin cuello de botella.
- Cabe en cualquier GPU consumer y en sistemas embebidos con unos pocos MB de RAM.
- Opciones de despliegue: no hay integración nativa con vLLM, llama.cpp, Ollama o TGI (no es un modelo de lenguaje). El despliegue requiere cargar los `.npz` con NumPy y escribir el forward pass manualmente, o exportar a ONNX/TFLite.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de microsegundos a milisegundos por imagen en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-mlp-p0 | ~394.634 | 32×32×3 fija | 47,74 % (test) | no disponible | Hugging Face (repo de 0,0 GB) |
| LeNet-5 (referencia clásica) | ~60.000 | 32×32×1 | ~70 % (típico en CIFAR-10 con entrenamiento adecuado) | no disponible | Implementaciones públicas múltiples |
| ResNet-18 (referencia moderna) | ~11,2 M | 32×32×3 | ~93-95 % (típico con augmentación) | no disponible | Implementaciones públicas múltiples |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para este modelo frente a alternativas; las cifras de LeNet-5 y ResNet-18 son referencias habituales de la literatura y no provienen de la model card.

## Limitaciones y advertencias

- Sobreajuste severo: 91,10 % en entrenamiento frente a 47,74 % en test; no generaliza bien fuera del conjunto de entrenamiento.
- Sin sesgo inductivo espacial: al ser un MLP, no explota la estructura local de las imágenes, lo que limita su precisión frente a CNN.
- Sin licencia declarada: no se especifican términos de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Sin model card extendida ni pipeline de Hugging Face: la integración requiere reconstruir el código de inferencia y respetar exactamente el preprocesado (aplanado HWC, división por 255, resta de media y división por desviación típica).
- Entrada fija de 32×32×3: no admite otras resoluciones ni imágenes en escala de grises sin adaptación.
- Riesgo de alucinación no aplica (no genera texto), pero sí riesgo de clasificaciones erróneas en clases visualmente similares (gato/perro, automóvil/camión).
- Sin información sobre sesgos del dataset más allá de los propios de CIFAR-10 (posibles desequilibrios y sesgos de anotación).
- No apto para tareas de lenguaje, razonamiento, código, visión general ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Aayushk05/smai-a4-cifar10-mlp-p0
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
