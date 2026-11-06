# ppavan2001/smai-assignment-4-q1-mlp

## Resumen

`ppavan2001/smai-assignment-4-q1-mlp` es un perceptrón multicapa (MLP) desarrollado por el usuario ppavan2001 como entrega de la pregunta 1 de la asignatura SMAI (Statistical Methods for Artificial Intelligence, por sus siglas). No es un modelo de lenguaje ni un modelo fundacional: es un clasificador de imágenes de pequeño tamaño entrenado sobre el conjunto de datos CIFAR-10, con una arquitectura explícita de tres capas densas `[3072, 256, 128, 10]` y activación ReLU en las capas ocultas.

El modelo resuelve exclusivamente la tarea de clasificación de imágenes RGB de 32x32 píxeles en 10 categorías. La entrada se aplana a un vector de 3072 dimensiones, se normaliza dividiendo entre 255 y se estandariza por característica usando la media y la desviación típica del split de entrenamiento oficial de CIFAR-10, valores que el autor distribuye en el fichero `preprocessing.npz`.

Su relevancia es puramente académica y didáctica: sirve como referencia de un pipeline básico de clasificación con PyTorch sobre CIFAR-10. No hay información publicada sobre métricas de rendimiento, licencia, idiomas ni pipeline de inferencia, y el repositorio ocupa 0.0 GB, lo que sugiere que los pesos podrían no estar subidos o ser de tamaño despreciable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con capas densas `[3072, 256, 128, 10]` y activación ReLU |
| Parámetros totales | no disponible (estimables en torno a 850.000 a partir de las dimensiones de capa, sin confirmación del autor) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (framework declarado: PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un MLP totalmente conectado con tres capas: una capa de entrada de 3072 unidades (32x32x3 píxeles aplanados), dos capas ocultas de 256 y 128 unidades con activación ReLU, y una capa de salida de 10 unidades correspondiente a las clases de CIFAR-10. El preprocesado consiste en aplanar la imagen RGB, dividir entre 255 y estandarizar cada característica con la media y desviación típica del split de entrenamiento oficial, cuyos valores se distribuyen en `preprocessing.npz`.

No se dispone de información sobre el número de épocas, el optimizador, la función de pérdida, el tamaño de batch, técnicas de regularización (dropout, weight decay) ni sobre el uso de data augmentation. Tampoco se documenta ningún proceso de ajuste fino, RLHF o DPO, algo esperable en un modelo de esta naturaleza. No hay innovaciones técnicas destacables más allá del pipeline estándar de normalización descrito.

## Capacidades

- Clasificación de imágenes RGB de 32x32 píxeles en 10 categorías (las clases de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión).
- Inferencia exclusivamente sobre entradas con el preprocesado exacto documentado (aplanado, escalado a [0,1] y estandarización con `preprocessing.npz`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad multimodal más allá de la clasificación de imágenes pequeñas.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como ejemplo mínimo reproducible de un pipeline de clasificación con PyTorch sobre CIFAR-10, útil para comparar con CNN y otros clasificadores en un curso.
- Baseline de referencia en experimentos académicos: permite medir la mejora que aportan arquitecturas convolucionales frente a un MLP sobre el mismo preprocesado y conjunto de datos.
- Pruebas de infraestructura de entrenamiento: por su tamaño reducido, es adecuado para validar scripts de entrenamiento, carga de datos y serialización de pesos en entornos con recursos limitados.
- Demostración de preprocesado estandarizado: el fichero `preprocessing.npz` ilustra cómo fijar media y desviación típica del split de entrenamiento para evitar fugas de información en validación y test.
- Ejercicios de análisis de errores: al ser un clasificador débil sobre imágenes, permite estudiar confusiones entre clases y el efecto de la falta de invariancia espacial.
- Prototipado rápido en CPU: la inferencia de un MLP de este tamaño es viable en CPU sin GPU, lo que facilita su uso en entornos docentes sin aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión en CIFAR-10 ni ninguna otra métrica de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precisión FP32, dado el reducido número de parámetros y la ausencia de contexto.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060) es sobradamente suficiente, y la CPU es una opción válida.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; por la arquitectura, la latencia por muestra sería del orden de microsegundos en GPU y milisegundos en CPU, sin datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ppavan2001/smai-assignment-4-q1-mlp | MLP `[3072, 256, 128, 10]` | no disponible | no aplica | no publicado | no disponible | Hugging Face |
| LeNet-5 (referencia histórica sobre CIFAR-10) | CNN | ~60.000 | no aplica | no disponible en esta ficha | no aplica | Implementaciones múltiples |
| ResNet-18 sobre CIFAR-10 | CNN residual | ~11,2 M | no aplica | no disponible en esta ficha | no aplica | Implementaciones múltiples |

No se dispone de datos de rendimiento comparables publicados para este modelo concreto, por lo que la comparación se limita a arquitectura y escala.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: no hay precisión, pérdida ni matriz de confusión que permita evaluar su calidad.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución de los pesos.
- Modelo de ámbito académico: no está pensado para producción ni para tareas fuera de CIFAR-10.
- Sin invariancia espacial: un MLP sobre píxeles aplanados es sensible a traslaciones y cambios de escala, lo que limita su generalización frente a CNN.
- Dependencia estricta del preprocesado: usar otra normalización distinta a la de `preprocessing.npz` degradará las predicciones.
- Riesgo de sobreajuste no documentado: no se indica si se aplicó regularización ni cómo se seleccionó el modelo.
- Repositorio de 0.0 GB: es posible que los pesos no estén disponibles o que el entrenamiento no se haya completado; conviene verificar los ficheros antes de usarlo.
- Sin soporte multilingüe, de texto ni multimodal: cualquier uso fuera de clasificación de imágenes de 32x32 no es aplicable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ppavan2001/smai-assignment-4-q1-mlp
- Dataset CIFAR-10 (referencia del preprocesado): https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
