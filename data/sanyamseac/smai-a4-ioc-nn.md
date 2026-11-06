# sanyamseac/smai-a4-ioc-nn

## Resumen

El modelo `smai-a4-ioc-nn` es una red neuronal densa de dos capas entrenada para clasificar imágenes del conjunto CIFAR-10 en diez categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). Lo publica el usuario `sanyamseac` como parte de la cuarta tarea de la asignatura SMAI (Statistical Methods and Applications in Informatics) y reproduce el modelo "Input-Output Convex Neural Network" (IOC-NN) descrito en el artículo de Sivaprasad et al., *The Curious Case of Convex Neural Networks* (arXiv:2006.05103).

La particularidad del modelo es que la capa de salida está restringida para que cada logit sea una función convexa de la imagen de entrada: tras cada paso de SGD, cualquier peso negativo de `W1` se sustituye por `exp(w − 5)`, lo que garantiza que todos los pesos de salida sean no negativos. La arquitectura es un MLP de 3072 entradas (imagen 32×32×3 aplanada), una capa oculta de 64 unidades con activación ELU y 10 salidas lineales, sumando 197.322 parámetros.

Se trata de un artefacto académico pequeño, sin pesos en formato estándar de transformers, sin tokenizador ni capacidades generativas. El repositorio ocupa 0,0 GB y contiene un único fichero `model.npz` con los pesos en formato NumPy. No es un modelo de lenguaje ni un modelo multimodal: es un clasificador de imágenes de juguete, útil únicamente como material didáctico o como referencia para estudiar redes convexas de salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso 3072-64-10 con capa oculta ELU y salida lineal (IOC-NN, capa de salida convexa) |
| Parametros totales | 197.322 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imágenes; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float64 dentro de `model.npz`) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC0-1.0 |
| Formato de pesos | `model.npz` (NumPy, float64); no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa de dos capas: la primera proyecta los 3072 píxeles aplanados y normalizados a 64 unidades con activación ELU, y la segunda proyecta esas 64 activaciones a 10 logits sin activación final (el softmax se aplica externamente para obtener probabilidades). La innovación del IOC-NN es la restricción de convexidad en la capa de salida: los pesos de `W1` se inicializan uniformemente en (0, 2/n_in) y, tras cada actualización de SGD, cualquier peso negativo `w` se reemplaza por `exp(w − 5)`, manteniendo todos los pesos de salida estrictamente positivos. La primera capa se inicializa con `N(0, 2/n_in)` y sesgos a cero, partiendo de los pesos iniciales del MLP de referencia.

El entrenamiento usa las 50.000 imágenes del split de entrenamiento de CIFAR-10 (`uoft-cs/cifar10`), con SGD plano (learning rate 0.02, batch size 64, sin acumulación de gradientes), pérdida de entropía cruzada categórica, 100 épocas sin parada temprana, precisión float64 y semilla 13006. El preprocesado aplana la imagen en orden (alto, ancho, canal), divide por 255 y estandariza con `feature_mean` y `feature_std` calculados sobre las 50.000 imágenes de entrenamiento; ambos vectores se guardan en el propio `model.npz`. No se menciona uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación de imágenes de 32×32×3 en las diez clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia puramente NumPy: el modelo se carga y ejecuta con operaciones matriciales básicas, sin dependencia de PyTorch en tiempo de inferencia.
- Salida de logits por clase, convertibles a probabilidades mediante softmax.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No tiene visión general: solo acepta imágenes CIFAR-10 con el preprocesado exacto descrito.
- No dispone de modo "thinking", audio, vídeo ni ninguna otra modalidad.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: el modelo sirve como ejemplo mínimo y reproducible de una red convexa de salida, con pesos en `model.npz` y código de carga en NumPy, ideal para asignaturas que estudien el artículo de Sivaprasad et al.
- Reproducción de experimentos sobre convexidad: permite comparar el IOC-NN (p = 0) con el MLP estándar del mismo artículo, ya que la model card indica que es uno de los dos modelos comparados en la sección 1.5.
- Referencia para implementar la restricción `exp(w − 5)` en frameworks propios: el fichero de pesos y la descripción del entrenamiento permiten replicar el mecanismo de proyección de pesos negativos en otros proyectos.
- Pruebas de pipelines de inferencia en NumPy puro: útil para validar entornos sin GPU ni PyTorch, ya que toda la inferencia se reduce a dos multiplicaciones matriciales y una ELU.
- Benchmark educativo de sobreajuste: con 73,44 % de accuracy en entrenamiento frente a 46,95 % en test, el modelo ilustra de forma clara el gap train/test en redes pequeñas sin regularización.
- Ejemplo de publicación de artefactos en Hugging Face con formato no estándar: sirve para estudiar cómo estructurar un repo con pesos `.npz`, metadatos y resultados embebidos entre marcadores `<!-- results:start -->` y `<!-- results:end -->`.

## Benchmarks y rendimiento

Resultados publicados en la model card tras la época 100:

| Conjunto | Accuracy | Pérdida CCE |
|---|---|---|
| Entrenamiento (50.000 imágenes) | 0,7344 | 0,7557 |
| Test (10.000 imágenes) | 0,4695 | 2,0167 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; el modelo tiene 197.322 parámetros en float64 (aproximadamente 1,6 MB), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU sin problema. Cualquier GPU (RTX 4090, A100, H100, integradas) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en Raspberry Pi o entornos embebidos.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue se realiza cargando `model.npz` con NumPy y ejecutando las operaciones descritas en la model card.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo, la inferencia por lote es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Accuracy test CIFAR-10 | Licencia | Formato |
|---|---|---|---|---|---|
| smai-a4-ioc-nn | 197.322 | 32×32×3 | 0,4695 | CC0-1.0 | `model.npz` |
| MLP estándar del mismo artículo (referencia) | no disponible | 32×32×3 | no disponible en la información | no disponible | no disponible |
| Otras CNN sobre CIFAR-10 | no disponible | 32×32×3 | no disponible en la información | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; la model card solo menciona que el IOC-NN se compara con un MLP en la sección 1.5 del artículo, sin cifras de ese segundo modelo.

## Limitaciones y advertencias

- El accuracy en test es bajo (46,95 %), muy por debajo del estado del arte en CIFAR-10; no es apto para producción real.
- Fuerte sobreajuste: 73,44 % en entrenamiento frente a 46,95 % en test, con 100 épocas sin parada temprana ni regularización.
- Solo acepta imágenes de 32×32×3 con el preprocesado exacto (aplanado en orden alto-ancho-canal, división por 255 y estandarización con `feature_mean`/`feature_std`); cualquier otra resolución o formato requiere adaptación manual.
- No es un modelo de lenguaje: no procesa texto, no genera contenido y no soporta instrucciones.
- No hay tokenizador, chat template ni pipeline estándar de transformers; el pipeline declarado `image-classification` es meramente informativo en Hugging Face.
- La licencia CC0-1.0 permite uso comercial y modificación sin restricciones, pero el modelo en sí carece de valor comercial por su rendimiento.
- Riesgo de alucinación no aplica; el riesgo real es clasificación errónea sistemática en clases difíciles de CIFAR-10 (gato/perro, ciervo/caballo).
- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con CIFAR-10, hereda los sesgos de composición de ese dataset.
- El repositorio tiene 0 descargas y 0 likes, sin mantenimiento ni issues documentados; no hay garantía de soporte.

## Enlaces

- Hugging Face: https://huggingface.co/sanyamseac/smai-a4-ioc-nn
- Artículo de referencia: https://arxiv.org/abs/2006.05103 (Sivaprasad et al., *The Curious Case of Convex Neural Networks*)
- Dataset: https://huggingface.co/datasets/uoft-cs/cifar10
