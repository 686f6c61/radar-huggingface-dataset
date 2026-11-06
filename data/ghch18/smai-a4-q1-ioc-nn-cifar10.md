# Ghch18/smai-a4-q1-ioc-nn-cifar10

## Resumen

IOC-NN para CIFAR-10 es un modelo de red neuronal totalmente conectada (MLP) desarrollado por el usuario Ghch18 como parte de la asignatura SMAI (Assignment 4, Question 1). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un clasificador de imágenes de 10 clases entrenado desde cero sobre el conjunto de datos CIFAR-10, con una arquitectura simple de tres capas (3072 → 256 → 128 → 10) y 820.874 parámetros totales. Su relevancia es exclusivamente académica y educativa, orientada a demostrar el flujo completo de entrenamiento, preprocesado y serialización de pesos con una librería NumPy propia del curso.

El modelo se entrenó con descenso de gradiente estocástico (SGD) plano, tasa de aprendizaje 0,05, tamaño de lote 64 y 100 épocas, usando precisión `torch.float64` y semilla 2036. Tras la última época alcanza una precisión de entrenamiento del 87,84 % y una precisión de test del 48,92 %, lo que refleja un sobreajuste considerable y un rendimiento muy por debajo del estado del arte en CIFAR-10 (que supera el 95 % con arquitecturas convolucionales modernas).

La model card no proporciona licencia, idiomas, pipeline ni información sobre el repositorio más allá de los pesos en formato NumPy (`model.npz`) y los parámetros de preprocesado (`preprocessing.npz`). El tamaño del repositorio es de 0,0 GB según Hugging Face, lo que es coherente con un modelo de menos de un millón de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) 3072 → 256 → 128 → 10, activación oculta ELU, salida de 10 logits sin activación |
| Parametros totales | 820.874 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores por imagen) |
| Tipos de cuantizacion | no disponible (pesos en `torch.float64` durante el entrenamiento; serializados en NumPy `.npz`) |
| Idiomas soportados | no disponible (no aplica; clasificador de imágenes) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`model.npz` con `W{i}` de forma `(n_in, n_out)` y `b{i}`; `preprocessing.npz` con media y desviación típica por columna) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de tres capas densas: una capa de entrada de 3072 unidades (imágenes RGB de 32×32 aplanadas), dos capas ocultas de 256 y 128 unidades con activación ELU, y una capa de salida de 10 logits correspondientes a las clases de CIFAR-10. No hay convoluciones, atención ni mecanismos de normalización interna. El nombre "IOC-NN" hace referencia a una variante con restricciones de no negatividad en los pesos de las capas 2 y 3, según indica la model card.

El entrenamiento utilizó las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas, SGD plano con `lr = 0.05`, batch size 64, 100 épocas, semilla 2036 y precisión `torch.float64`. El preprocesado consiste en aplanar cada imagen a 3072 valores, dividir por 255 y estandarizar cada columna con la media y desviación típica calculadas únicamente sobre el conjunto de entrenamiento (guardadas en `preprocessing.npz`). No se menciona uso de data augmentation, regularización, validación cruzada ni ajuste de hiperparámetros. La model card señala que la librería NumPy del curso no incluye una clase ELU, por lo que solo los pesos de las capas 2 y 3 pueden cargarse en ella.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre imágenes de 32×32 píxeles RGB tras aplanado y estandarización por columna.
- Carga de pesos en NumPy mediante `Model.load_from` de la librería del curso.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión avanzada, audio ni otras modalidades.

## Casos de uso

- Docencia de aprendizaje automático: sirve como ejemplo mínimo y reproducible de un pipeline completo (preprocesado, entrenamiento con SGD, evaluación y serialización de pesos) para asignaturas introductorias.
- Práctica de implementación en NumPy: permite comparar una implementación propia de la librería del curso con una implementación en PyTorch, verificando la equivalencia de pesos y predicciones.
- Estudio de sobreajuste: con un 87,84 % en entrenamiento y un 48,92 % en test, es un caso didáctico para analizar la brecha entre rendimiento en entrenamiento y generalización en un MLP sin regularización.
- Reproducción de experimentos con semilla fija: la semilla 2036 y la configuración documentada permiten replicar el entrenamiento y comparar resultados con variantes de hiperparámetros.
- Benchmark de referencia para arquitecturas simples: sirve como línea base frente a CNN y otros modelos en CIFAR-10 en contextos académicos.
- Análisis de restricciones de pesos no negativos: el prefijo IOC permite estudiar el efecto de restricciones de signo en capas ocultas sobre la precisión final.

## Benchmarks y rendimiento

| Conjunto | Métrica | Valor |
|---|---|---|
| CIFAR-10 train (50.000 imágenes) | Precisión | 0,8784 (87,84 %) |
| CIFAR-10 test (10.000 imágenes) | Precisión | 0,4892 (48,92 %) |

No se han publicado resultados de benchmarks en la información disponible más allá de las precisiones de entrenamiento y test indicadas en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 820.874 parámetros y los pesos en `float64` ocupan aproximadamente 6,5 MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema. Cualquier GPU consumer (por ejemplo, GTX 1050, RTX 3060) es más que suficiente.
- Cabe en cualquier GPU consumer, integrada o incluso en un entorno de CPU sin aceleración.
- Opciones de despliegue: carga directa con NumPy (`Model.load_from`) o con PyTorch reconstruyendo la arquitectura; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por lote en CPU debería ser del orden de milisegundos, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Precisión test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (Ghch18) | 820.874 | 3072 (32×32×3 aplanado) | 48,92 % | no disponible | Hugging Face (`Ghch18/smai-a4-q1-ioc-nn-cifar10`) |
| MLP estándar de referencia en CIFAR-10 | no disponible | 3072 | no disponible | no disponible | no disponible |
| CNN pequeña tipo LeNet | no disponible | 32×32×3 | no disponible | no disponible | no disponible |
| ResNet-18 en CIFAR-10 | ~11,2 M | 32×32×3 | ~95 % (referencia habitual de la literatura) | no disponible | no disponible |

No se dispone de datos comparativos oficiales en la información proporcionada para modelos de la misma categoría; las filas de referencia de la literatura se incluyen solo como orientación general y sus cifras no provienen de la model card.

## Limitaciones y advertencias

- Precisión de test baja (48,92 %) y sobreajuste acusado (87,84 % en entrenamiento), lo que limita su uso fuera de contextos académicos.
- Sesgos conocidos: no documentados en la model card; al entrenarse solo con CIFAR-10, hereda los sesgos de composición y etiquetado de ese conjunto.
- Riesgo de alucinación: no aplica (no es un modelo generativo), pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no aplica; la entrada está restringida a imágenes de 32×32 píxeles RGB y no admite otras resoluciones sin reentrenamiento.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar su uso comercial.
- Caveats para producción: la model card indica que la librería NumPy del curso no incluye una clase ELU y que solo los pesos de las capas 2 y 3 pueden cargarse en ella, lo que limita la portabilidad del formato de pesos.
- No se documentan datos de validación, data augmentation ni búsqueda de hiperparámetros, por lo que el resultado no debe interpretarse como un rendimiento optimizado.

## Enlaces

- [Hugging Face: Ghch18/smai-a4-q1-ioc-nn-cifar10](https://huggingface.co/Ghch18/smai-a4-q1-ioc-nn-cifar10)
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
