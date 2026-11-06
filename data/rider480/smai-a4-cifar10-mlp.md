# rider480/smai-a4-cifar10-mlp

## Resumen

El modelo `smai-a4-cifar10-mlp` es un perceptrón multicapa (MLP) de tres capas desarrollado por el usuario rider480 como parte de la asignación 4 del curso Statistical Methods in AI (SMAI) del programa Monsoon 2026 del IIIT Hyderabad. Se trata de un clasificador de imágenes entrenado sobre el conjunto de datos CIFAR-10, con una arquitectura muy compacta de 3072 entradas (imágenes de 32x32x3 aplanadas), dos capas ocultas de 64 y 32 neuronas con activación ReLU, y una capa de salida de 10 clases con logits crudos.

El modelo resuelve el problema de clasificación de imágenes en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión) y es relevante únicamente como material didáctico para ilustrar el funcionamiento de un MLP básico frente a arquitecturas convolucionales. Con 199.082 parámetros totales, su rendimiento es modesto: 47,90% de precisión en validación y 49,54% en test, lo que refleja las limitaciones de un MLP sin mecanismos convolucionales para procesar imágenes.

No se trata de un modelo de lenguaje ni de un modelo generativo, sino de un clasificador de imágenes de propósito muy específico. No dispone de licencia declarada, no soporta idiomas (no procesa texto) y su repositorio ocupa 0,0 GB, lo que sugiere que los pesos podrían no estar disponibles públicamente o ser de tamaño despreciable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) con arquitectura 3072 → 64 → 32 → 10 |
| Parámetros totales | 199.082 (198.720 pesos + 362 sesgos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de imágenes) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de 0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un MLP completamente conectado con tres capas: una capa de entrada de 3072 dimensiones que corresponde a la imagen aplanada (32×32×3), una primera capa oculta de 64 neuronas con activación ReLU, una segunda capa oculta de 32 neuronas con activación ReLU, y una capa de salida de 10 neuronas con activación identidad que produce logits crudos para la pérdida de entropía cruzada categórica con softmax. El recuento de parámetros se desglosa en 198.720 pesos y 362 sesgos.

El entrenamiento se realizó sobre CIFAR-10, con una partición de 36.000 imágenes para entrenamiento, 12.000 para validación y 12.000 para test. El preprocesamiento consistió en aplanar las imágenes de 32×32×3 a vectores de 3072 dimensiones, normalizar por 1/255 y aplicar una estandarización por columna utilizando estrictamente la media y la desviación típica del conjunto de entrenamiento. No se dispone de información sobre el número de épocas, la tasa de aprendizaje, el optimizador, el tamaño de lote ni sobre el uso de técnicas de regularización como dropout o weight decay. Tampoco se indica si se aplicaron aumentos de datos ni técnicas de ajuste fino o RLHF, que no aplican a este tipo de modelo.

## Capacidades

- Clasificación de imágenes en 10 categorías de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión.
- Procesamiento de imágenes de 32×32 píxeles con 3 canales de color (RGB).
- Generación de logits crudos por clase, lo que permite obtener distribuciones de probabilidad mediante softmax.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo de razonamiento (thinking mode), visión avanzada, audio ni otras capacidades especiales más allá de la clasificación básica de imágenes.

## Casos de uso

- Docencia y aprendizaje de fundamentos de deep learning: el modelo sirve como ejemplo mínimo de un MLP entrenado sobre CIFAR-10 para ilustrar el flujo completo de preprocesamiento, entrenamiento y evaluación en cursos de introducción a machine learning.
- Comparación de arquitecturas en investigación didáctica: permite contrastar el rendimiento de un MLP (49,54% de precisión en test) frente a redes convolucionales sobre el mismo conjunto de datos, evidenciando la importancia de la inducción de sesgos arquitectónicos para tareas de visión.
- Reproducción de experimentos académicos: al estar vinculado a una asignación concreta del curso SMAI del IIIT Hyderabad, facilita la verificación de resultados y la reproducibilidad de los ejercicios propuestos.
- Pruebas de pipelines de clasificación de imágenes: puede integrarse en flujos de preprocesamiento (aplanado, normalización, estandarización) para validar que las transformaciones se aplican correctamente antes de entrenar modelos mayores.
- Benchmark de referencia para modelos ligeros: con solo 199.082 parámetros, sirve como línea base de bajo coste computacional para comparar con alternativas más complejas en tareas de clasificación de imágenes de baja resolución.
- Experimentos de sensibilidad a la normalización: dado que la model card detalla el uso estricto de media y desviación típica del conjunto de entrenamiento, el modelo puede emplearse para estudiar el impacto de distintas estrategias de estandarización en el rendimiento final.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión en validación | 47,90% |
| Precisión en test (limpio, p=0.0) | 49,54% |
| Macro F1 en test | 0,4915 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en precisión completa (199.082 parámetros × 4 bytes ≈ 0,8 MB para los pesos, más overhead de activaciones y framework).
- GPU recomendadas: cualquier GPU, incluida una GPU integrada; el modelo es trivialmente pequeño.
- Cabe en cualquier GPU de consumo, e incluso puede ejecutarse en CPU sin dificultad.
- Opciones de despliegue: PyTorch nativo; no se dispone de información sobre exportación a ONNX, TorchScript ni otros formatos.
- Latencia y throughput estimados: no disponibles, aunque por el tamaño del modelo se espera un throughput muy alto y una latencia despreciable en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Precisión en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smai-a4-cifar10-mlp | MLP 3072→64→32→10 | 199.082 | No aplica | 49,54% (test) | No disponible | Hugging Face |
| LeNet-5 (referencia histórica) | CNN | ≈60.000 | No aplica | ≈70% (test, típico) | No disponible | Múltiples implementaciones |
| ResNet-18 (referencia) | CNN | ≈11,7 M | No aplica | ≈93-95% (test, típico) | No disponible | Múltiples implementaciones |
| VGG-11 (referencia) | CNN | ≈132 M | No aplica | ≈91-92% (test, típico) | No disponible | Múltiples implementaciones |

Nota: los valores de precisión de los modelos comparativos son referencias habituales de la literatura y no provienen de la información proporcionada; se incluyen únicamente como orientación contextual. No se dispone de datos oficiales de benchmarks comparativos para este modelo concreto.

## Limitaciones y advertencias

- Rendimiento limitado: con un 49,54% de precisión en test, el modelo está muy por debajo de las arquitecturas convolucionales modernas, que superan el 90% en CIFAR-10; no es adecuado para aplicaciones reales de clasificación de imágenes.
- Sesgos conocidos: no se dispone de información sobre sesgos específicos, pero al entrenarse sobre CIFAR-10 hereda los sesgos y desequilibrios de dicho conjunto de datos.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí existe riesgo de clasificaciones erróneas con alta confianza debido a la simplicidad del modelo.
- Limitaciones de contexto o idioma: no procesa texto ni secuencias largas; está restringido a imágenes de 32×32×3.
- Restricciones de licencia: no se ha declarado licencia, lo que impide conocer si se permite el uso comercial; se recomienda contactar con el autor antes de cualquier uso más allá del académico.
- Caveat para producción: el repositorio tiene un tamaño de 0,0 GB y no se especifica el formato de los pesos, por lo que podría no ser posible cargar el modelo directamente; además, su propósito es exclusivamente didáctico.
- Ausencia de información sobre el proceso de entrenamiento (optimizador, épocas, regularización) dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rider480/smai-a4-cifar10-mlp
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
