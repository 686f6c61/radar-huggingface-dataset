# dhyeythummar9/smai-a4-mlp

## Resumen

`smai-a4-mlp` es un perceptrón multicapa (MLP) mínimo entrenado desde cero sobre los píxeles crudos del conjunto de datos CIFAR-10. Lo publica el usuario de HuggingFace `dhyeythummar9` como entrega de la asignación 4 (pregunta 1.5) de la asignatura SMAI, y su interés es puramente didáctico: demuestra cómo construir y exportar un clasificador de imágenes sin frameworks de deep learning, usando únicamente NumPy.

El modelo tiene una arquitectura fija de 3072-64-10 (una capa oculta ReLU de 64 neuronas y salida identidad de 10 clases), con 197.322 parámetros totales. Se entrenó durante 100 épocas con SGD plano (lr 0,01, batch 64) en float64 sobre las 50.000 imágenes de entrenamiento de CIFAR-10, y alcanza una precisión de test de 0,4588 y un F1 medio de 0,4572.

No es un modelo de lenguaje ni un transformer: no procesa texto, no soporta tool calling ni generación. Su relevancia actual es la de un artefacto de referencia para quienes quieran entender el pipeline completo (preprocesado, pesos en `.npz`, inferencia en NumPy puro) sin dependencias de PyTorch o TensorFlow.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) 3072-64-10, capa oculta ReLU, salida identidad |
| Parámetros totales | 197.322 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes de 32x32x3) |
| Tipos de cuantización | no disponible (pesos en float64 dentro de `.npz`) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.npz` de NumPy (`W0`, `b0`, `W1`, `b1`, más `activations` y `loss`); preprocesado en `preprocessing.npz`; configuración en `config.json` |

## Arquitectura y entrenamiento

La red es un MLP plano con una única capa oculta: entrada de 3.072 dimensiones (32x32x3 aplanado en orden HWC), proyección lineal a 64 unidades, activación ReLU y proyección lineal final a 10 logits (una por clase de CIFAR-10). No hay convoluciones, dropout, normalización por lotes ni regularización explícita documentada. La arquitectura se eligió en el reto de tamaño de la pregunta 1.2.5 del mismo enunciado.

El entrenamiento usó las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas, SGD plano con learning rate 0,01, tamaño de lote 64, 100 épocas y precisión float64. El preprocesado es determinista y se distribuye con el modelo: cada imagen se aplana, se divide por 255 y se estandariza con las medias y desviaciones típicas almacenadas en `preprocessing.npz` (3.072 valores cada una). No se documenta uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación de imágenes de 32x32x3 en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en NumPy puro: dos productos matriciales y una ReLU, sin dependencias de frameworks.
- Exportación autocontenida: pesos, estadísticas de preprocesado y configuración en tres ficheros.
- Reproducibilidad completa del pipeline de entrenamiento a partir de los hiperparámetros documentados.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión general ni audio.

## Casos de uso

- Docencia de fundamentos de deep learning: sirve como ejemplo mínimo y ejecutable de un clasificador entrenado con SGD, útil para explicar descenso de gradiente, funciones de activación y sobreajuste sin la complejidad de un framework.
- Referencia de implementación en NumPy: el fragmento de inferencia de la model card permite integrar el clasificador en scripts o entornos donde no se pueden instalar PyTorch o TensorFlow.
- Prueba de pipelines de preprocesado: al incluir `mean` y `std` junto a los pesos, es un banco de pruebas para validar que un pipeline de carga de imágenes reproduce exactamente el aplanado HWC y la estandarización esperados.
- Baseline de comparación en CIFAR-10: con 0,4588 de precisión de test, marca el suelo razonable frente al que medir CNN, aumentación de datos o regularización en experimentos académicos.
- Ejercicios de análisis de errores: la matriz de confusión de un MLP sobre píxeles crudos ilustra bien la confusión entre clases visualmente próximas (gato/perro, ciervo/caballo) y motiva el paso a arquitecturas convolucionales.
- Verificación de reproducibilidad: los hiperparámetros y el formato de pesos permiten reentrenar y comparar resultados como control en experimentos de la asignatura.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión en test (10.000 imágenes) | 0,4588 |
| F1 medio en test | 0,4572 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas dos métricas de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; los 197.322 parámetros en float64 ocupan aproximadamente 1,6 MB, y en float32 unos 0,8 MB.
- GPU recomendadas: no requiere GPU; se ejecuta en CPU en milisegundos por imagen.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: Python con NumPy como única dependencia; no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma medida; por la carga computacional (dos multiplicaciones matriz-vector de 3.072x64 y 64x10), el coste dominante es la carga de la imagen y el preprocesado, no la inferencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Precisión CIFAR-10 (test) | Licencia | Formato |
|---|---|---|---|---|---|
| smai-a4-mlp | MLP 3072-64-10 | 197.322 | 0,4588 | MIT | `.npz` NumPy |
| LeNet-5 (referencia histórica) | CNN | ~60.000 | no disponible en esta ficha | no disponible | no disponible |
| ResNet-18 (referencia habitual en CIFAR-10) | CNN residual | ~11,2 M | no disponible en esta ficha | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; la comparación se limita a arquitectura, tamaño y licencia.

## Limitaciones y advertencias

- Precisión modesta: 0,4588 en test implica que más de la mitad de las imágenes se clasifican mal; no es apto para uso en producción.
- Sin capacidades lingüísticas: no procesa texto, no genera contenido y no soporta instrucciones ni conversación.
- Entrada rígida: solo acepta imágenes de 32x32x3 en orden HWC, aplanadas y estandarizadas con las estadísticas exactas de `preprocessing.npz`; cualquier desviación degrada el resultado.
- Sin convoluciones: al operar sobre píxeles crudos, no aprovecha la estructura espacial, lo que explica su baja precisión frente a CNN.
- Sesgos no evaluados: no se documenta ningún análisis de sesgo por clase ni de rendimiento desagregado; las clases visualmente próximas probablemente concentran los errores.
- Riesgo de sobreajuste no cuantificado: no se publican curvas de entrenamiento ni métricas de validación, solo el resultado en test.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el modelo no es adecuado para aplicaciones reales por su baja precisión.
- Artefacto académico: es una entrega de asignatura, sin mantenimiento ni versionado posteriores documentados.

## Enlaces

- HuggingFace: https://huggingface.co/dhyeythummar9/smai-a4-mlp
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
