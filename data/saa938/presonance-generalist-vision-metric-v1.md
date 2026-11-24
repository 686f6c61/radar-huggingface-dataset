# saa938/presonance-generalist-vision-metric-v1

## Resumen

Presonance Generalist Vision Metric v1 es un checkpoint de investigación publicado por el usuario saa938 en Hugging Face. No es un modelo de visión completo, sino una cabeza métrica de 1.147.264 parámetros entrenada sobre los backbones congelados EVA/DINOv3 que forman parte de su codificador base fijo (saa938/presonance-generalist-vision-v1). El modelo no modifica dichos backbones: se limita a proyectar las características de la imagen a un vector unitario de 128 dimensiones que, concatenado con el embedding base de 4352 dimensiones mediante pesos de raíz cuadrada de 0,3 y 0,7, produce un embedding final de 4480 dimensiones para recuperación de imágenes por similitud de producto escalar.

El objetivo es mejorar la lectura métrica (metric readout) sobre un encoder de visión congelado para tareas de image retrieval, con resultados reportados en CUB200 (hit@1 de 0,86572 sobre 5.794 consultas) y Stanford Cars (0,92115 sobre 8.041 consultas), además de una evaluación NIGHTS con NDCG@10 de 0,26699. El autor es explícito al señalar que se trata de comparaciones retrospectivas, que el registro oficial en MTEB está pendiente y que las diferencias de puntuación no establecen superioridad estadística frente a modelos externos sin predicciones emparejadas.

La relevancia de esta ficha es acotada: es un artefacto de investigación con licencia solo para investigación, sin benchmarks publicados más allá de los tres conjuntos citados, sin datos de idiomas y con un repositorio de 0,0 GB porque los pesos grandes se obtienen de los repositorios upstream fijados. Resulta útil para quien quiera reproducir el pipeline de evaluación o auditar la cabeza métrica, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza métrica lineal/MLP de 1.147.264 parámetros sobre backbones congelados EVA/DINOv3 (encoder base fijo) |
| Parametros totales | 1.147.264 (solo la cabeza; los backbones se descargan aparte desde repositorios upstream fijados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | No disponible (el autor indica FP32 en parámetros con cómputo BF16 para el encoder base; la cabeza usa FP32 en CPU) |
| Idiomas soportados | No disponible |
| Licencia | presonance-generalist-research-only (solo investigación; se aplican además los términos upstream en NOTICE y DINOv3_LICENSE.md) |
| Formato de pesos | No disponible explícitamente; cargable con `AutoModel.from_pretrained` de transformers con `trust_remote_code=True` |

## Arquitectura y entrenamiento

La arquitectura es una cabeza métrica entrenada de 1.147.264 parámetros superpuesta a un encoder de visión congelado compuesto por EVA y DINOv3. La cabeza genera un vector unitario de 128 dimensiones; el embedding final de 4480 dimensiones se obtiene concatenando esa salida con el vector base de 4352 dimensiones, ponderando con raíz cuadrada de 0,3 y 0,7 respectivamente, y la similitud se calcula por producto escalar. El encoder base requiere GPU CUDA y ejecuta sus parámetros FP32 con cómputo BF16, mientras que la cabeza opera en FP32 sobre CPU con lotes internos de 512 filas.

El entrenamiento utilizó las uniones cacheadas de TRAIN de FER2013, Caltech101, OxfordPets, OxfordFlowersClassification, DTD, CIFAR10, STL10, EuroSAT y GTSRB, sin emplear todas las imágenes crudas de TRAIN. El refit final usa semilla 261222 y 300 actualizaciones AdamW, con fuerza de geometría 0. El autor incluye la función de entrenamiento, que recreó ambas cabezas publicadas bit a bit desde las características cacheadas de TRAIN en una verificación de 600 actualizaciones sin cargar filas de TEST. Los detalles de reproducción y los hashes exactos de artefactos están en `TRAINING_RECIPE.json` y `EVIDENCE.json`, y `TRAINING_MANIFEST.json` recoge revisiones públicas de datasets e índices/hashes de filas seleccionadas sin imágenes ni etiquetas.

## Capacidades

- Extracción de características de imagen para recuperación (image retrieval) mediante embeddings de 4480 dimensiones y similitud por producto escalar.
- Evaluación de métricas de recuperación sobre conjuntos como CUB200, Stanford Cars y NIGHTS.
- Carga mediante `AutoModel.from_pretrained` con `trust_remote_code=True` y método `predict_features(pil_images, batch_size=64)`.
- Fijación de revisión inmutable mediante el SHA del repositorio para reproducibilidad de resultados.
- Reproducción del entrenamiento de la cabeza desde características cacheadas con la función incluida.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-step, visión generativa, audio ni capacidades multilingües; es exclusivamente un extractor de features de imagen.

## Casos de uso

- Recuperación de imágenes por similitud en investigación: usar `predict_features` para generar embeddings de 4480 dimensiones y ordenar por producto escalar en conjuntos de evaluación como CUB200 o Stanford Cars, replicando los protocolos nativos reportados por el autor.
- Auditoría de cabezas métricas: cargar el checkpoint con una revisión fijada y comparar las predicciones con las referencias publicadas para verificar la reproducibilidad del pipeline (el autor reporta una diferencia máxima de vector de 1,862645149e-07 frente a la referencia CPU).
- Reproducción de experimentos de entrenamiento: emplear la función de entrenamiento incluida y las características cacheadas de TRAIN para recrear las cabezas bit a bit en una verificación de 600 actualizaciones.
- Evaluación comparativa de encoders congelados: concatenar la salida de 128 dimensiones con el embedding base de 4352 dimensiones para medir el efecto de la cabeza sobre un encoder EVA/DINOv3 fijo.
- Investigación sobre sesgos de solapamiento de datos: el autor señala duplicados cercanos y solapamiento con el preentrenamiento de los backbones; el checkpoint permite estudiar cómo afectan a las métricas de recuperación.
- Docencia y formación en evaluación de retrieval: usar el ejemplo de código con revisión fijada para ilustrar buenas prácticas de reproducibilidad (pin de commit, hashes de artefactos, separación TRAIN/TEST).

## Benchmarks y rendimiento

| Benchmark | Este modelo | Referencia capturada en la auditoría | Alcance |
|---|---:|---:|---|
| CUB200 native hit@1 | 0,86572 | 0,86244 | 5.794 consultas; por encima del líder capturado; no es un ranking público aceptado |
| Stanford Cars native hit@1 | 0,92115 | 0,93359 | 8.041 consultas; por debajo del líder capturado |
| NIGHTS NDCG@10 | 0,26699 | 0,27075 (v1 fija del autor) | Ambas cabezas entrenadas pierden frente a la v1 fija |

El autor advierte que son métricas y tareas distintas, que no deben promediarse, que las tres comparaciones son seguimientos retrospectivos y que las evaluaciones nuevas de FORB y SOP están pendientes. Las diferencias pequeñas no establecen superioridad estadística sin predicciones emparejadas. En CUB se reprodujeron 5016/5794 aciertos top-1 (0,86572) sobre los vectores del runtime publicado exacto.

## Requisitos de hardware

- GPU CUDA obligatoria para el encoder base fijado (el autor menciona que el encoder base la requiere).
- El autor reporta que la carga real de `AutoModel` se probó en una NVIDIA H200, incluyendo 64 comprobaciones de API con imágenes de TRAIN.
- La cabeza métrica se ejecuta en CPU en FP32 con lotes internos de 512 filas; el encoder base usa parámetros FP32 con cómputo BF16.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible más allá de la mención a H200; no se documentan requisitos para GPUs de consumo.
- Despliegue: carga mediante `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Presonance Generalist Vision Metric v1 | 1.147.264 (cabeza) | No aplica | CUB200 hit@1 0,86572; Cars hit@1 0,92115; NIGHTS NDCG@10 0,26699 | Research-only | Hugging Face, 0 descargas |
| Presonance Generalist Vision v1 (fija, del mismo autor) | No disponible | No aplica | NIGHTS NDCG@10 0,27075 | No disponible | Referenciada como base |
| Modelos externos de referencia en CUB/Cars | No disponible | No aplica | CUB200 0,86244; Cars 0,93359 (capturados en auditoría) | No disponible | No identificados en la información |

No se dispone de datos suficientes para comparar con alternativas de terceros de forma rigurosa; el propio autor indica que las diferencias pequeñas no establecen superioridad estadística sin predicciones emparejadas.

## Limitaciones y advertencias

- Licencia solo para investigación (presonance-generalist-research-only); el uso comercial no está permitido según los términos de LICENSE, y se aplican además los términos upstream de NOTICE y DINOv3_LICENSE.md.
- Checkpoint de investigación: el registro oficial en MTEB está pendiente y los resultados no constituyen un ranking público aceptado.
- Las comparaciones son retrospectivas y con métricas y tareas distintas; no deben promediarse.
- Riesgo de solapamiento de datos: el autor señala duplicados cercanos y solapamiento con el preentrenamiento de los backbones sin resolver.
- El modelo se entrenó con FER2013 y debe declararse como tal en cualquier evaluación que use FER2013.
- Stanford Cars comparte imágenes con una evaluación de clasificación anterior.
- Las puntuaciones de recuperación de objetos no miden inteligencia emocional ni respuestas cerebrales individuales (advertencia explícita del autor).
- La identidad bit a bit no está garantizada entre dispositivos; la reproducibilidad exacta requiere los mismos bytes de características, orden de filas/tareas y entorno numérico.
- No hay información sobre sesgos, idiomas soportados ni rendimiento fuera de los tres conjuntos citados.
- El repositorio es de 0,0 GB porque los pesos grandes se obtienen de repositorios upstream fijados; la disponibilidad depende de esos repositorios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saa938/presonance-generalist-vision-metric-v1
- Modelo base: https://huggingface.co/saa938/presonance-generalist-vision-v1
- Licencia: LICENSE (incluido en el repositorio)
- Términos upstream: NOTICE y DINOv3_LICENSE.md (incluidos en el repositorio)
- Recetas y evidencias: `TRAINING_RECIPE.json`, `EVIDENCE.json`, `TRAINING_MANIFEST.json` (incluidos en el repositorio)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
