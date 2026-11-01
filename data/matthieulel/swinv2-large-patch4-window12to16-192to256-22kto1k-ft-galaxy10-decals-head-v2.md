# matthieulel/swinv2-large-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-head-v2

## Resumen

El modelo `swinv2-large-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, publicado por el usuario de HuggingFace `matthieulel`. Se construye sobre el backbone Swin Transformer V2 de Microsoft (`microsoft/swinv2-large-patch4-window12to16-192to256-22kto1k-ft`), preentrenado en ImageNet-22k y afinado en ImageNet-1k, al que se le ha sustituido la cabeza de clasificación por una capa lineal de 10 salidas entrenada sobre el dataset Galaxy10 DECaLS.

La adaptación es de tipo *head-only fine-tuning*: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena la cabeza lineal. Forma parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) del benchmark *Vision Foundation Models Benchmark*, asociado al artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo resuelve una tarea acotada y bien definida: clasificar imágenes de galaxias del relevamiento DECaLS en 10 clases morfológicas. Con 195,2 millones de parámetros y un peso de repositorio de 0,8 GB, es relevante como pieza de referencia para comparar cómo se comportan los grandes backbones de visión preentrenados en dominios científicos cuando solo se dispone de una cabeza lineal para adaptarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer V2 (transformer jerárquico con atención por ventanas desplazadas) |
| Parametros totales | 195.218.302 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 256x256 px en evaluación) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es un Swin Transformer V2 de configuración *large*, con parches de 4x4 y ventanas de atención que escalan de 12 a 16 durante el preentrenamiento. El checkpoint base se entrenó primero en ImageNet-22k y después se afinó en ImageNet-1k. En este repositorio el backbone se mantiene congelado, incluidas las estadísticas de normalización, y la única parte entrenada es una capa lineal de 10 salidas que mapea el vector de características global a las clases morfológicas de Galaxy10 DECaLS.

El protocolo de entrenamiento es idéntico para los 40 backbones del benchmark. Se usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, recorte de gradiente 1,0), tasa de aprendizaje 1e-4 con schedule lineal y 10 % de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio. La evaluación se hace redimensionando y recortando al centro a 256x256 px con la normalización del procesador del checkpoint base.

El dataset Galaxy10 DECaLS contiene 17.736 imágenes. El split de test público (1.774 imágenes) se reserva como test held-out; el split de train público se divide de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La validación solo se usa para seleccionar la época; en este caso se eligió la época 30 (última), la de mínima pérdida de validación. El autor declara una comprobación de integridad: al recargar el modelo y ejecutarlo sobre las primeras 96 imágenes de test, las predicciones coinciden con los logits guardados de la época seleccionada en el 100 % de los casos, con una diferencia absoluta máxima de 8,58e-06.

## Capacidades

- Clasificación de imágenes de galaxias en 10 clases morfológicas del dataset Galaxy10 DECaLS.
- Extracción de características visuales genéricas heredadas del backbone Swin V2 Large preentrenado en ImageNet-22k/1k.
- Inferencia sobre imágenes de 256x256 px con el pipeline estándar de `transformers` (`AutoImageProcessor` + `AutoModelForImageClassification`).
- Compatible con los endpoints de HuggingFace (tag `endpoints_compatible`).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo *thinking*, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en catálogos DECaLS: el modelo asigna una de las 10 clases a cada recorte de imagen, lo que permite procesar lotes de imágenes astronómicas de forma desatendida y obtener etiquetas preliminares para estudios morfológicos a escala.
- Etiquetado asistido para revisión humana: las predicciones del modelo pueden usarse como primera pasada sobre un conjunto de imágenes para que un astrónomo revise solo los casos de baja confianza, reduciendo el esfuerzo de anotación manual.
- Línea base en experimentos de adaptación de foundation models: al ser una configuración *head-only* con backbone congelado, sirve como referencia para medir cuánto aporta el preentrenamiento frente a un entrenamiento desde cero o frente a un fine-tuning completo.
- Comparación de backbones en el benchmark Vision Foundation Models Benchmark: el checkpoint es una de las 80 configuraciones de la colección, por lo que se usa directamente para reproducir las tablas del artículo asociado.
- Filtrado y selección de candidatos en pipelines de análisis astronómico: el modelo puede actuar como clasificador rápido para separar morfologías de interés antes de aplicar análisis más costosos (espectroscopía, ajuste de perfiles de brillo, etc.).
- Docencia y divulgación en astronomía computacional: al ser un modelo pequeño (0,8 GB) con licencia Apache 2.0 y código de uso trivial, es adecuado para demostrar el flujo completo de adaptación de un backbone de visión a un problema científico real.
- Prototipado de clasificadores de imágenes científicas: la receta de entrenamiento (cabeza lineal sobre backbone congelado) es reutilizable para otras tareas de clasificación en dominios con pocos datos etiquetados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`). Test held-out de Galaxy10 DECaLS con 1.774 imágenes.

| Metrica | Valor |
|---|---|
| Accuracy (seed 42, época 30 de 30) | 60,99 % |
| F1 ponderado (seed 42, época 30 de 30) | 58,95 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 60,86 % +/- 0,23 |
| F1 ponderado medio +/- desviación típica (semillas 42, 1, 2) | 58,93 % +/- 0,24 |

Evolución seleccionada de la semilla 42 (pérdida de validación, accuracy de validación, accuracy de test, F1 ponderado de test):

| Epoca | Perd. val. | Acc. val. (%) | Acc. test (%) | F1 test (%) |
|---|---|---|---|---|
| 1 | 2,2282 | 19,56 | 20,69 | 15,91 |
| 5 | 1,4574 | 49,83 | 51,13 | 46,80 |
| 10 | 1,2851 | 56,48 | 57,55 | 54,85 |
| 15 | 1,2226 | 58,62 | 58,74 | 56,47 |
| 20 | 1,1884 | 60,77 | 60,26 | 58,18 |
| 25 | 1,1662 | 61,50 | 61,05 | 59,03 |
| 30 (seleccionada) | 1,1632 | 61,56 | 60,99 | 58,95 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,8 GB para los pesos (195,2 M de parámetros) más el espacio de activaciones; con lotes pequeños cabe holgadamente en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp32 con lotes pequeños; para entrenamiento *head-only* con lote efectivo 256, una sola GPU de gama media-alta es suficiente (el autor usó una única GPU).
- Cabe en GPUs de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores; también en GPUs integradas o CPU para inferencia puntual.
- Opciones de despliegue: `transformers` (PyTorch) es la vía nativa; al ser un modelo de visión estándar, también puede servirse con TorchServe o con el endpoint de HuggingFace (tag `endpoints_compatible`). No hay pesos GGUF publicados, por lo que llama.cpp/Ollama no están soportados de forma directa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones del mismo benchmark ni de alternativas comparables con métricas sobre Galaxy10 DECaLS. La comparación cuantitativa queda pendiente de consultar las tablas del artículo y el dataset de runs del autor.

| Modelo | Parametros | Contexto / entrada | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|
| Este checkpoint (Swin V2 Large, head-only) | 195,2 M | 256x256 px | 60,99 % (test, seed 42) | Apache 2.0 |
| Otros backbones del Vision Foundation Models Benchmark | no disponible | no disponible | no disponible en esta ficha | no disponible |
| Alternativas de clasificación astronómica | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo realiza clasificación de imágenes; no genera texto ni mantiene conversaciones, por lo que no debe presentarse como un modelo de lenguaje.
- El backbone está congelado y solo se entrena una cabeza lineal; la capacidad de adaptación al dominio astronómico es limitada en comparación con un fine-tuning completo.
- La accuracy en test es del 60,99 %, con un F1 ponderado del 58,95 %; el rendimiento es moderado y variable según la clase, aunque la información disponible no desglosa métricas por clase.
- El conjunto de evaluación es pequeño (1.774 imágenes) y el modelo se seleccionó por pérdida de validación en la última época, lo que puede indicar un ajuste próximo al límite del régimen *head-only*.
- Los resultados están declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Riesgo de sesgo de dominio: el modelo se ha entrenado exclusivamente con imágenes de Galaxy10 DECaLS y su comportamiento fuera de ese relevamiento o con otras condiciones de observación no está caracterizado.
- Riesgo de alucinación en sentido amplio: el clasificador siempre asigna una de las 10 clases, incluidas imágenes ambiguas o fuera de distribución, sin mecanismo de abstención.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset Galaxy10 DECaLS y del checkpoint base de Microsoft para cumplir con sus términos de atribución.
- No hay información sobre cuantizaciones publicadas ni sobre latencia en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/swinv2-large-patch4-window12to16-192to256-22kto1k-ft-galaxy10-decals-head-v2
- Checkpoint base: https://huggingface.co/microsoft/swinv2-large-patch4-window12to16-192to256-22kto1k-ft
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de runs del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo asociado: *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026); el enlace directo no está disponible en la información proporcionada.
