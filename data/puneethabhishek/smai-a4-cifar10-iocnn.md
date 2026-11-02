# PuneethAbhishek/smai-a4-cifar10-iocnn

## Resumen

smai-a4-cifar10-iocnn es una red neuronal totalmente conectada (MLP) entrenada sobre el conjunto de datos CIFAR-10, publicada por el usuario PuneethAbhishek como parte de la asignación 4 de un curso de SMAI (Statistical Methods in Artificial Intelligence). No se trata de un modelo de lenguaje ni de un modelo fundacional: es un artefacto académico de clasificación de imágenes de 32x32 píxeles en 10 clases, con una arquitectura de tres capas densas (3072 → 512 → 256 → 10) y activación ELU en las capas ocultas.

La particularidad técnica que declara el autor es el uso de una formulación IOC-NN (input-output convex neural network), una variante de red con restricciones de convexidad respecto a la entrada y la salida. El modelo reporta una precisión de test de 0,5311 sobre CIFAR-10 tras 100 épocas de entrenamiento con SGD, batch de 64 y tasa de aprendizaje 0,02.

Su relevancia es limitada fuera del contexto docente: el repositorio ocupa 0,0 GB (los pesos no parecen estar subidos o son de tamaño despreciable), no tiene descargas ni likes, y no dispone de licencia, idiomas ni pipeline declarados. Se documenta aquí como referencia técnica del artefacto, no como candidato para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectada (IOC-NN, convexa respecto a entrada y salida) |
| Parametros totales | 1.708.810 (calculado a partir de las dimensiones declaradas: 3072×512 + 512 + 512×256 + 256 + 256×10 + 10) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificador de imágenes, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el autor describe el layout lógico W{i}: (n_in, n_out), b{i}: (n_out,), pero no el formato de serialización) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa con tres capas densas de dimensiones 3072, 512, 256 y 10. La entrada corresponde a imágenes CIFAR-10 aplanadas (32×32×3 = 3072 valores), preprocesadas dividiendo por 255 y normalizando con la media y desviación típica del split de entrenamiento, almacenadas en `preprocessing.npz`. Las capas ocultas usan activación ELU y la salida son 10 logits sin activación (Identity), entrenados con pérdida de entropía cruzada softmax.

El entrenamiento se realizó durante 100 épocas con SGD, tasa de aprendizaje 0,02, tamaño de batch 64 y sin acumulación de gradientes (1 paso). El autor indica `labels: true (p = 0)`, lo que sugiere que la restricción de convexidad IOC-NN se aplica con el parámetro p a cero. La semilla empleada fue 1051. No se especifica el número total de tokens ni composición de dataset más allá de CIFAR-10 estándar, ni se menciona RLHF, DPO ni técnicas de alineación (no aplicables a este tipo de modelo).

## Capacidades

- Clasificación de imágenes de 32x32 píxeles en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre vectores de 3072 dimensiones preprocesados con la media y desviación típica del conjunto de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como ejemplo reproducible de una MLP con restricciones de convexidad sobre un dataset estándar, útil para comparar curvas de aprendizaje y precisión frente a una MLP convencional.
- Estudio de la formulación IOC-NN: investigadores interesados en redes convexas respecto a entrada y salida pueden usar este artefacto como referencia de implementación y de resultados empíricos (53,11 % de precisión en test).
- Baseline de clasificación de imágenes de baja resolución: puede emplearse como línea base rápida en experimentos con CIFAR-10 antes de pasar a arquitecturas convolucionales.
- Reproducción de experimentos con semilla fija: la semilla 1051 y los hiperparámetros declarados permiten intentar replicar el resultado reportado.
- Ejercicios de preprocesado: el pipeline descrito (aplanado, escalado por 255, normalización con media y desviación del train) es un caso práctico para enseñar fugas de datos y normalización correcta.
- Pruebas de integración de artefactos pequeños: con un tamaño de repositorio de 0,0 GB, es adecuado para validar flujos de descarga, carga y evaluación en entornos con recursos muy limitados.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| CIFAR-10 test accuracy | 0,5311 | Reportado por el autor en la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en FP32 (1,7 M de parámetros), despreciable en cualquier GPU moderna.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en entornos sin GPU.
- Opciones de despliegue: no se especifican; al ser una MLP pequeña, puede servirse con NumPy, PyTorch o cualquier framework de inferencia ligero. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CIFAR-10 test acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-iocnn | 1.708.810 | no aplica | 0,5311 | no disponible | HuggingFace |
| MLP convencional sobre CIFAR-10 | variable | no aplica | no disponible | no disponible | no disponible |
| LeNet-5 sobre CIFAR-10 | ~60.000 | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; las filas distintas de la primera se incluyen solo como referencia categórica y sus valores no están verificados en esta ficha.

## Limitaciones y advertencias

- Precisión modesta: 53,11 % en test sobre CIFAR-10, muy por debajo de arquitecturas convolucionales modernas (que superan el 90 %), lo que limita su uso práctico.
- Sesgos conocidos: no documentados; al entrenar solo con CIFAR-10, hereda los sesgos de composición y etiquetado de ese dataset.
- Riesgo de alucinación: no aplica (no genera texto), pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto e idioma: no aplica; la entrada está fija a 3072 valores y no procesa lenguaje.
- Restricciones de licencia: la licencia no está declarada, por lo que no se puede asumir uso comercial permitido.
- Caveats para producción: repositorio de 0,0 GB sin pesos aparentemente subidos, sin pipeline declarado, sin descargas ni validación externa; no es un artefacto listo para producción.
- Procedencia académica: es un trabajo de asignatura, sin revisión por pares ni mantenimiento documentado.

## Enlaces

- HuggingFace: https://huggingface.co/PuneethAbhishek/smai-a4-cifar10-iocnn
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
