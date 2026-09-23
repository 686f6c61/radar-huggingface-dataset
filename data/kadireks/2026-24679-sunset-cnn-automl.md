# kadireks/2026-24679-sunset-cnn-automl

## Resumen

2026-24679-sunset-cnn-automl es una red neuronal convolucional compacta publicada por el usuario kadireks (Krit Adireksarn) en HuggingFace. Resuelve una tarea binaria muy concreta de clasificación de imágenes: determinar si una fotografía es un atardecer. El modelo se desarrolló como entrega de la tarea 2 (HW2) de la asignatura CMU 24-679 Design and Prototyping with AI (otoño de 2026), y tanto su arquitectura como sus hiperparámetros se seleccionaron automáticamente con una búsqueda Hyperband de keras-tuner: 30 configuraciones, `max_epochs=20`, `factor=3` y aproximadamente 3 minutos de cómputo total.

La red tiene 274.849 parámetros, recibe imágenes RGB redimensionadas a 96×96 píxeles y escaladas al rango [0,1], y devuelve una única salida sigmoide en la que un valor mayor o igual a 0,5 indica "atardecer". Se entrenó sobre el dataset VictorTishkevich/sunset-image-dataset, también de origen académico (HW1 de un compañero de curso), y declara una accuracy y un F1 macro de 0,9891 sobre una partición de test disjunta por grupos: 92 imágenes procedentes de 7 fotografías independientes.

Su interés es fundamentalmente metodológico: es un ejemplo reproducible y de coste casi nulo de AutoML aplicado a un dataset minúsculo, y a la vez una ilustración de los límites de medir rendimiento cuando solo hay un puñado de fotografías fuente. El propio autor advierte de que se trata de una demostración de curso y de que no es apta para producción. La licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN densa (feed-forward convolucional) con 4 bloques convolucionales, cabeza `flatten`, sin batch normalization; seleccionada por búsqueda Hyperband |
| Parámetros totales | 274.849 |
| Longitud de contexto | No aplica (entrada de imagen fija de 96×96 píxeles RGB) |
| Tipos de cuantización | No disponible (el autor no documenta variantes cuantizadas) |
| Idiomas soportados | No aplica (clasificador de imágenes, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Keras 3 nativo (`.keras`), acompañado de `preprocessing.json` |
| Tarea | Clasificación de imágenes binaria (`image-classification`) |
| Entrada | Imagen RGB redimensionada a 96×96, escalada a [0,1] |
| Salida | 1 logit sigmoide (>= 0,5 implica "sunset") |
| Librería / framework | Keras 3.13.2 sobre TensorFlow 2.20.0 |
| Dataset de entrenamiento | VictorTishkevich/sunset-image-dataset |
| Tamaño del repositorio | 0,0 GB |
| Fecha de publicación | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura final es una CNN deliberadamente pequeña: 4 bloques convolucionales con 16 filtros base, kernel de 5×5, sin batch normalization, cabeza de tipo `flatten` sin capa densa intermedia (`dense_units=0`) y dropout de 0,2. El espacio de búsqueda se exploró con Hyperband de keras-tuner sobre 30 configuraciones, con `max_epochs=20`, `factor=3` y un presupuesto total de unos 3 minutos. La configuración ganadora corresponde al `trial_id 0012`, en el bracket 2, ronda 2, con `initial_epoch=7`. Sobre el mecanismo de successive halving de Hyperband se aplicó además un `EarlyStopping` monitorizando `val_accuracy`, con `patience=4` y `restore_best_weights=True`. El entrenamiento usa un learning rate de 2,8078309037793175e-4 y batch size de 8, con una intensidad de aumento de datos (`aug_strength`) de 0,05.

| Hiperparámetro | Valor |
|---|---|
| `aug_strength` | 0,05 |
| `n_conv_blocks` | 4 |
| `base_filters` | 16 |
| `kernel_size` | 5 |
| `batch_norm` | False |
| `head` | flatten |
| `dense_units` | 0 |
| `dropout` | 0,2 |
| `lr` | 0,00028078309037793175 |
| `batch_size` | 8 |
| `tuner/epochs` | 20 |
| `tuner/initial_epoch` | 7 |
| `tuner/bracket` | 2 |
| `tuner/round` | 2 |
| `tuner/trial_id` | 0012 |

No se documenta el número de tokens ni de imágenes efectivas de entrenamiento, ni el uso de RLHF, DPO o cualquier otra fase de ajuste por preferencias (no aplica a una tarea de clasificación). El autor tampoco detalla la composición exacta del dataset más allá de la descripción cualitativa que se recoge en la sección de limitaciones. La innovación destacable no es arquitectónica, sino metodológica: la evaluación se hace sobre una partición *group-disjoint*, de forma que ninguna variante aumentada de una fotografía de test se haya visto durante el entrenamiento, lo que evita la fuga de datos típica en datasets con aumentos derivados de la misma imagen fuente.

## Capacidades

- Clasificación binaria de imágenes: distingue "atardecer" de "no atardecer" a partir de una imagen RGB de 96×96 píxeles.
- Salida probabilística calibrada como sigmoide, con umbral de decisión en 0,5 y mapa de etiquetas declarado en `preprocessing.json`.
- Inferencia sobre imágenes individuales mediante `keras.saving.load_model` y `predict`, con un contrato de preprocesado explícito (redimensionado a 96×96 y división entre 255).
- Ejecución viable en CPU, dado el tamaño reducido del modelo (274.849 parámetros).
- No soporta generación de texto, razonamiento, código ni matemáticas: es exclusivamente un clasificador de visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa lenguaje).
- No dispone de modo de razonamiento explícito (*thinking mode*), visión general, audio ni multimodalidad más allá de la entrada de imagen única.
- No se documentan capacidades de detección, segmentación ni localización; solo etiqueta a nivel de imagen completa.

## Casos de uso

- Material docente para AutoML: sirve como ejemplo completo y reproducible de búsqueda de hiperparámetros con keras-tuner y Hyperband sobre un problema pequeño, con un presupuesto de unos 3 minutos que permite ejecutarlo en clase o en un portátil.
- Tutorial de carga y despliegue de modelos Keras desde HuggingFace: el fragmento de uso del repositorio muestra el patrón `hf_hub_download` + `keras.saving.load_model` + fichero de preprocesado en JSON, útil para enseñar contratos de entrada/salida versionados.
- Línea base (*baseline*) en experimentos de clasificación con datasets pequeños: su 0,989 de accuracy y F1 macro sirve como referencia frente a la que comparar alternativas más simples o más complejas sobre el mismo split disjunto por grupos.
- Demostración de atajos en visión por computador: el hecho de que una regresión logística sobre doce estadísticos de color alcance 0,870 en la misma partición permite ilustrar cómo un problema aparentemente visual puede resolverse con señales de color no espaciales, y por qué conviene medir contra esa línea base antes de atribuir aprendizaje estructural a una CNN.
- Prefiltrado exploratorio en herramientas personales de organización de fotografías: el modelo es lo bastante pequeño para etiquetar álbumes locales en CPU, siempre con revisión humana y sin garantías de robustez fuera de la distribución del dataset (no validado para producción).
- Ejemplo metodológico de evaluación group-disjoint: el repositorio documenta cómo separar por fotografía fuente en lugar de por imagen aumentada, un patrón reutilizable en cualquier pipeline de visión con aumento de datos.
- Prototipado de clasificadores en entornos con recursos mínimos: con 274.849 parámetros (aproximadamente 1,1 MB en fp32), es un punto de partida razonable para experimentar con cuantización, destilación o poda antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en el `model-index` de la model card, marcados como no verificados (`verified: false`). La partición de test es disjunta por grupos y consta de 92 imágenes procedentes de 7 fotografías independientes.

| Modelo | Accuracy | Macro F1 |
|---|---|---|
| 2026-24679-sunset-cnn-automl | 0,989 | 0,989 |
| Clase mayoritaria | 0,511 | 0,338 |
| Estadísticos de color + regresión logística | 0,870 | 0,866 |
| MobileNetV2 congelada + regresión logística | 0,837 | 0,831 |

Métricas declaradas en la model card: `Accuracy (group-disjoint test split)` = 0,9891 y `Macro F1 (group-disjoint test split)` = 0,9891, ambas sin verificación independiente. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a este modelo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en fp32 ocupan aproximadamente 1,1 MB (274.849 parámetros × 4 bytes), de modo que el cuello de botella es el runtime de TensorFlow/Keras, no el modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA para TensorFlow, incluidas las de gama de entrada. No se documentan requisitos específicos de A100, H100 ni similares; usarlas estaría sobredimensionado para este modelo.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo (por ejemplo, series GTX 10xx o superiores y RTX 20xx/30xx/40xx). También es viable la inferencia en CPU, dado el tamaño de entrada (96×96) y el número de parámetros.
- Opciones de despliegue: inferencia nativa con Keras 3 / TensorFlow 2.20.0, tal como documenta el autor. El repositorio no especifica soporte probado para vLLM, llama.cpp, Ollama o TGI; la conversión a otros formatos (por ejemplo ONNX o TFLite) no está documentada.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de latencia ni de imágenes por segundo.
- Entrenamiento: la búsqueda completa de hiperparámetros consumió aproximadamente 3 minutos con 30 configuraciones, lo que da una idea del coste de reentrenamiento en hardware de gama media.

## Comparativa con modelos similares

No se dispone de fichas técnicas de modelos comparables en la información proporcionada. La comparación más informativa disponible es la que el propio autor incluye en la model card, con líneas base evaluadas sobre la misma partición disjunta por grupos:

| Alternativa | Parámetros | Contexto / entrada | Accuracy | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 2026-24679-sunset-cnn-automl | 274.849 | Imagen 96×96 RGB | 0,989 | 0,989 | MIT | HuggingFace (keras) |
| Estadísticos de color + regresión logística | No disponible | 12 estadísticos de color | 0,870 | 0,866 | No disponible | No publicada en el repo |
| MobileNetV2 congelada + regresión logística | No disponible en la información proporcionada | No disponible | 0,837 | 0,831 | No disponible | No publicada en el repo |
| Clase mayoritaria | No aplica | No aplica | 0,511 | 0,338 | No aplica | No aplica |

La lectura relevante de esta tabla es que la CNN supera a una línea base puramente cromática (0,870) y a características congeladas de MobileNetV2 (0,837), pero el intervalo de confianza del 95 % en torno a la accuracy es aproximadamente ±0,02, según advierte el propio autor. Comparaciones con otras CNN compactas o con modelos de transferencia del mismo régimen de tamaño no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Dataset extremadamente pequeño: contiene alrededor de 30 fotografías independientes. Las otras aproximadamente 300 filas son variantes de brillo y rotación de esas mismas 30 imágenes.
- Test reducido: la partición de evaluación son 92 imágenes procedentes de 7 fotografías independientes, con un intervalo de confianza del 95 % en torno a la accuracy de aproximadamente ±0,02.
- Atajo de color: una regresión logística sobre doce estadísticos de color, sin ninguna información espacial, obtiene 0,870 en la misma partición. Cualquier afirmación de que la CNN ha aprendido estructura de atardecer tendría que superar esa línea base por más margen del que permite el intervalo.
- No apto para producción: el propio autor declara explícitamente que es una demostración de curso y que no es apta para uso productivo.
- Sin análisis de sesgos: no se documentan estudios de sesgo, robustez, sensibilidad a cambios de cámara, hora, geografía ni condiciones meteorológicas distintas de las del dataset.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos con imágenes fuera de la distribución de entrenamiento; no se publican tasas de error desagregadas.
- Limitaciones de idioma: no aplica, es un clasificador de imágenes sin procesamiento de lenguaje.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificación con atribución, pero la licencia no implica idoneidad técnica para ningún uso concreto.
- Adopción nula: 0 descargas y 0 interacciones en el momento de la consulta, y tamaño de repositorio de 0,0 GB, lo que limita la validación comunitaria del artefacto.
- Dependencia de framework: los pesos están en formato Keras 3 (`.keras`) y se han construido con TensorFlow 2.20.0, lo que condiciona la compatibilidad con otros runtimes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kadireks/2026-24679-sunset-cnn-automl
- Dataset de entrenamiento: https://huggingface.co/datasets/VictorTishkevich/sunset-image-dataset
- Perfil del autor: https://huggingface.co/kadireks
- Búsqueda web: no se han encontrado artículos, papers, blogs, repositorios ni demos relevantes sobre este modelo en los resultados disponibles; las únicas entradas devueltas corresponden a páginas genéricas de buscador sin relación con el modelo.
