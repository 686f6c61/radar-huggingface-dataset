# ClashBender/smai-a4-mlp

## Resumen

`ClashBender/smai-a4-mlp` es un modelo de perceptrón multicapa (MLP) publicado en HuggingFace por el usuario ClashBender como parte de una asignación académica de la asignatura SMAI (presumiblemente "Statistical Methods for Artificial Intelligence" o similar). El modelo está entrenado para clasificación de imágenes sobre el conjunto de datos CIFAR-10, según indica la propia model card, y se distribuye como pesos en formato NumPy (`model.npz`) junto con ficheros de configuración y preprocesado.

No se trata de un modelo de lenguaje ni de un transformer: es una red neuronal densa de propósito muy específico, orientada a la clasificación de imágenes de 32x32 píxeles en diez categorías. El repositorio tiene un tamaño de 0.0 GB (esencialmente vacío o con ficheros de muy pocos megabytes) y no cuenta con descargas ni likes en el momento de la consulta, lo que sugiere que es un artefacto de entrega académica más que un modelo pensado para producción o reutilización por terceros.

La relevancia de esta ficha es, por tanto, limitada: sirve como ejemplo de modelo educativo reproducible, pero no como componente para aplicaciones reales. La ausencia de model card detallada, licencia, idiomas y pipeline de HuggingFace refuerza la idea de que se publicó únicamente como entrega de una práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) para clasificación de imágenes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `model.npz` (state dict de PyTorch serializado como arrays NumPy) |

## Arquitectura y entrenamiento

La model card indica únicamente que se trata de un MLP entrenado sobre CIFAR-10 "con las etiquetas verdaderas" (true labels). No se especifica el número de capas, el número de neuronas por capa, la función de activación, el optimizador, la tasa de aprendizaje ni el número de épocas. Tampoco se detalla si hubo aumentación de datos ni regularización. Los detalles de arquitectura e hiperparámetros se remiten al fichero `config.json`, y el preprocesado (media y desviación típica) al fichero `preprocessing.npz`, ambos incluidos en el repositorio.

No hay información sobre composición del dataset más allá de CIFAR-10 (60 000 imágenes de 32x32 en 10 clases: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión), ni sobre técnicas de ajuste fino como RLHF o DPO, que no aplican a este tipo de modelo. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en las 10 clases de CIFAR-10.
- Inferencia sobre lotes de imágenes tras aplicar el preprocesado definido en `preprocessing.npz` (normalización con media y desviación típica).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión general más allá de la clasificación cerrada de CIFAR-10.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo "thinking", audio ni visión de propósito general.

## Casos de uso

- Docencia y prácticas académicas: el modelo sirve como referencia reproducible para asignaturas de aprendizaje automático, permitiendo a los estudiantes comparar su implementación con una entrega ya entrenada.
- Reproducción de experimentos de clasificación de imágenes: cargando `model.npz` con `torch.load` o `numpy.load` y aplicando el preprocesado, se puede evaluar la precisión sobre el split de test de CIFAR-10.
- Baseline para comparativas educativas: útil como punto de partida (MLP) frente a arquitecturas convolucionales o transformers de visión en el mismo dataset.
- Demostración de pipelines de serialización de pesos: el formato `npz` con state dict de PyTorch es un ejemplo práctico de interoperabilidad entre NumPy y PyTorch.
- Pruebas de integración de preprocesado: el fichero `preprocessing.npz` permite validar la coherencia entre entrenamiento e inferencia en un flujo mínimo.
- Experimentos de destilación o fine-tuning a pequeña escala: al ser un modelo pequeño y de bajo coste, puede servir como alumno o maestro en ejercicios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye precisión en test, matriz de confusión ni comparación con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza de un MLP sobre CIFAR-10, es previsible que quepa en cualquier GPU consumer, pero no se confirma.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA o incluso CPU debería ser suficiente para un MLP de este tipo, aunque no se especifica.
- Cabe en GPU consumer: probablemente sí, pero no confirmado.
- Opciones de despliegue: carga directa con PyTorch (`torch.load` sobre `model.npz`) o NumPy; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ClashBender/smai-a4-mlp | MLP sobre CIFAR-10 | no disponible | no aplica | no disponible | HuggingFace, 0 descargas |
| ResNet-18 (torchvision) | CNN | ~11,7 M | no aplica | BSD-3-Clause | Ampliamente disponible |
| ViT-Base/16 (CIFAR-10 fine-tune) | Transformer de visión | ~86 M | no aplica | Apache 2.0 / MIT según variante | HuggingFace |
| MLP-Mixer (CIFAR-10) | MLP puro | ~2-3 M según configuración | no aplica | Apache 2.0 | Repositorios de investigación |

La comparativa es orientativa: los tres modelos alternativos son referencias habituales en CIFAR-10 con licencias y documentación públicas, mientras que `smai-a4-mlp` carece de licencia, métricas y documentación suficiente para una comparación rigurosa.

## Limitaciones y advertencias

- No hay información sobre sesgos; al entrenarse sobre CIFAR-10, hereda los sesgos y desequilibrios de ese dataset (por ejemplo, sobrerrepresentación de ciertas clases visuales y contextos).
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de clasificaciones erróneas fuera de la distribución de CIFAR-10.
- El modelo solo está validado (presumiblemente) para imágenes de 32x32 y 10 clases; no generaliza a otras resoluciones ni categorías.
- No hay licencia declarada, lo que impide un uso comercial claro y desaconseja su reutilización en producción.
- No hay model card detallada, métricas ni instrucciones de uso más allá de la mención a `config.json`, `model.npz` y `preprocessing.npz`.
- El repositorio está vacío o casi vacío (0.0 GB), por lo que los ficheros podrían no estar disponibles o haber sido eliminados.
- No apto para producción: es un artefacto académico sin mantenimiento, sin versionado ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/ClashBender/smai-a4-mlp
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
