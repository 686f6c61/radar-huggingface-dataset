# saa938/presonance-generalist-vision-geometry-v1

## Resumen

Presonance Generalist Vision Geometry v1 es un checkpoint de investigación publicado por el usuario saa938 en Hugging Face. No es un modelo de visión completo, sino una cabeza métrica entrenada de 1.147.264 parámetros que se superpone a los backbones congelados EVA/DINOv3 del codificador base fijo del autor (`saa938/presonance-generalist-vision-v1`). Su función es producir un vector unitario de 128 dimensiones que, concatenado con el embedding base de 4.352 dimensiones mediante pesos de raíz cuadrada de 0,3 y 0,7, da lugar a embeddings de imagen de 4.480 dimensiones para tareas de recuperación y similitud.

El modelo aborda el problema de la preservación de similitud en recuperación de imágenes: adaptar un backbone congelado a un espacio métrico concreto sin reentrenar los miles de millones de parámetros del codificador visual. Es relevante en el contexto de la investigación en métricas de recuperación porque demuestra que una cabeza de apenas un millón de parámetros puede igualar o superar referencias en algunos conjuntos (CUB200) y quedarse por debajo en otros (Stanford Cars, NIGHTS), lo que ilustra la sensibilidad de estas tareas al dominio.

Se trata de un artefacto estrictamente de investigación, con licencia `presonance-generalist-research-only`, sin registro oficial en MTEB todavía, y cuyo repositorio pesa 0,0 GB porque los pesos grandes de los backbones se descargan desde sus repositorios upstream fijados. La model card es inusualmente detallada en cuanto a trazabilidad, hashes y advertencias metodológicas, lo que refleja un esfuerzo deliberado por parte del autor de documentar la reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza métrica lineal/MLP sobre backbones congelados EVA/DINOv3 (encoder de visión) |
| Parámetros totales | 1.147.264 (solo la cabeza; los backbones son externos y congelados) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantización | No disponible; la model card indica FP32 para parámetros y cómputo BF16 en el backbone |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | `presonance-generalist-research-only` (research-only) |
| Formato de pesos | Pesos propios pequeños en el repo; backbones descargados desde repositorios upstream fijados (formato no especificado) |

## Arquitectura y entrenamiento

La arquitectura es una cabeza métrica de 1.147.264 parámetros entrenada sobre los backbones EVA/DINOv3 congelados del codificador base `saa938/presonance-generalist-vision-v1`. La cabeza produce un vector unitario de 128 dimensiones; el embedding final de 4.480 dimensiones se obtiene concatenando ese vector con el embedding base de 4.352 dimensiones, ponderando con raíz cuadrada de 0,3 y 0,7 respectivamente. La similitud se calcula mediante producto escalar. El backbone usa parámetros FP32 con cómputo BF16, mientras que la cabeza opera en CPU con FP32 y lotes internos de 512 filas.

El entrenamiento utilizó las uniones cacheadas de TRAIN de FER2013, Caltech101, OxfordPets, OxfordFlowersClassification, DTD, CIFAR10, STL10, EuroSAT y GTSRB, sin usar todas las imágenes crudas de TRAIN. El refit final emplea semilla 261222 y 300 actualizaciones AdamW, con fuerza de geometría 1. La model card incluye la función de entrenamiento ejecutable y los manifiestos `TRAINING_RECIPE.json`, `TRAINING_MANIFEST.json` y `EVIDENCE.json` con revisiones de datasets, hashes de filas e índices. La verificación de 600 actualizaciones recreó ambas cabezas publicadas bit a bit desde las características TRAIN cacheadas originales, sin cargar filas de TEST. La reproducibilidad exacta requiere los mismos bytes de características, orden de filas y entorno numérico; no se promete identidad bit a bit entre dispositivos.

## Capacidades

- Extracción de características de imagen: genera embeddings de 4.480 dimensiones para recuperación y comparación de similitud.
- Recuperación de imágenes (image retrieval): diseñado específicamente para tareas de búsqueda y ranking de imágenes por similitud.
- Evaluación de similitud métrica: pensado para benchmarks tipo MTEB y tareas de recuperación nativa (CUB200, Stanford Cars, NIGHTS).
- Integración con `transformers`: cargador público `AutoModel` con `trust_remote_code=True` y método `predict_features(pil_images, batch_size=64)`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un extractor de características, no un modelo generativo.
- Capacidades multilingües: no aplica (modelo puramente visual).
- Capacidad especial: preservación de similitud sobre backbones congelados, con pesos de concatenación ajustables.

## Casos de uso

- Búsqueda visual en catálogos de producto: usar los embeddings de 4.480 dimensiones para indexar imágenes de inventario y recuperar productos visualmente similares mediante producto escalar; adecuado por su naturaleza de recuperación de imágenes y su evaluación en Stanford Cars.
- Organización de archivos fotográficos: agrupar y deduplicar imágenes por similitud visual en bibliotecas personales o archivos de patrimonio, aprovechando la cabeza métrica sobre el backbone congelado.
- Investigación en métricas de recuperación: reproducir los experimentos de CUB200, Stanford Cars y NIGHTS con el checkpoint fijado por revisión para comparar cabezas métricas sobre el mismo backbone.
- Detección de duplicados y near-duplicates en datasets: calcular similitudes por producto escalar para identificar imágenes casi idénticas antes de entrenar otros modelos; la model card advierte de que esta cuestión queda sin resolver en sus propias evaluaciones.
- Clasificación por vecino más cercano: usar los embeddings como características para clasificadores k-NN en dominios visuales como flores, mascotas o señales de tráfico (GTSRB), dado que el entrenamiento incluyó esas uniones TRAIN.
- Auditoría de sesgo y solapamiento de datasets: emplear el modelo para medir solapamiento entre conjuntos de imágenes (por ejemplo, entre Stanford Cars y evaluaciones de clasificación previas), un caso que la propia model card señala como pendiente.
- Evaluación de robustez de backbones congelados: comparar el rendimiento de la cabeza métrica frente al codificador base fijo v1 para determinar si el ajuste aporta valor en un dominio concreto.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Referencia capturada durante la auditoría | Alcance |
|---|---:|---:|---|
| CUB200 native hit@1 | 0,86555 | 0,86244 | 5.794 consultas; por encima del líder capturado; no es un ranking público aceptado |
| Stanford Cars native hit@1 | 0,92252 | 0,93359 | 8.041 consultas; por debajo del líder capturado |
| NIGHTS NDCG@10 | 0,26783 | 0,27075 (v1 fijo del autor) | Ambas cabezas entrenadas pierden frente a v1 fijo |

La model card advierte explícitamente de que son métricas y tareas distintas y no deben promediarse; las tres comparaciones son seguimientos retrospectivos. Las evaluaciones nuevas de FORB y SOP están pendientes. Se probaron tres modelos inmutables en el estudio CUB/Cars, incluidos v1 fijo y ambas cabezas entrenadas, y se retuvieron todos los resultados. Diferencias pequeñas no establecen superioridad estadística sin predicciones emparejadas. Los recuentos top-1 y la incertidumbre agrupada de CUB/Cars se recalcularon de forma independiente; las coincidencias exactas con imágenes TRAIN fueron cero.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del backbone EVA/DINOv3 descargado, que requiere GPU CUDA según la model card.
- GPU recomendadas: la carga pública de `AutoModel` se validó en NVIDIA H200; se requiere una GPU CUDA compatible con el backbone fijado.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras GPU de consumo; el requisito es CUDA, pero el tamaño del backbone condiciona la viabilidad.
- Opciones de despliegue: `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un extractor de características visual).
- Latencia y throughput: no disponibles; la cabeza usa lotes internos de 512 filas en CPU FP32 y el ejemplo recomienda `batch_size=64` para la extracción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Presonance Generalist Vision Geometry v1 | 1.147.264 (cabeza) + backbones EVA/DINOv3 | No aplica | CUB200 0,86555; Cars 0,92252; NIGHTS 0,26783 | Research-only | Hugging Face, checkpoint de investigación |
| Presonance Generalist Vision v1 (fijo) | No disponible | No aplica | NIGHTS NDCG@10 0,27075 | No disponible | Base del modelo actual |
| Cabezas entrenadas del estudio CUB/Cars | No disponible | No aplica | Resultados retenidos en la auditoría | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada; la model card solo compara contra el v1 fijo del propio autor y referencias capturadas durante la auditoría.

## Limitaciones y advertencias

- Licencia estrictamente de investigación (`presonance-generalist-research-only`); el uso comercial requiere revisar los términos de LICENSE y las condiciones upstream de NOTICE y DINOv3_LICENSE.md.
- Registro oficial en MTEB pendiente; los resultados no constituyen un ranking público aceptado.
- El modelo se entrenó con FER2013 y debe declararse como tal en cualquier evaluación que use FER2013.
- Los resultados de CUB200 y Stanford Cars son seguimientos retrospectivos; no se ha establecido superioridad estadística frente a modelos externos sin predicciones emparejadas.
- Los near-duplicates y el solapamiento con el preentrenamiento de los backbones quedan sin resolver; Stanford Cars comparte imágenes con una evaluación de clasificación anterior.
- Los scores de recuperación de objetos no miden inteligencia emocional ni respuestas cerebrales individuales, según advierte la model card.
- La identidad bit a bit entre dispositivos no está garantizada; diferencias de dispositivo y librería pueden alterar los valores finales en coma flotante.
- No se distribuyen imágenes crudas de datasets, valoraciones ni registros cerebrales; solo los pesos pequeños de la cabeza y el código fuente.
- No es un modelo generativo: no soporta texto, tool calling ni agentes; su uso está limitado a extracción de características visuales.
- El repositorio pesa 0,0 GB porque los backbones se descargan desde upstream; la viabilidad depende de la disponibilidad y los términos de esos repositorios externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/saa938/presonance-generalist-vision-geometry-v1
- Modelo base: https://huggingface.co/saa938/presonance-generalist-vision-v1
- Licencia del modelo (LICENSE en el repositorio): https://huggingface.co/saa938/presonance-generalist-vision-geometry-v1/blob/main/LICENSE
- Aviso de licencias upstream (NOTICE): https://huggingface.co/saa938/presonance-generalist-vision-geometry-v1/blob/main/NOTICE
- Licencia DINOv3 (DINOv3_LICENSE.md): https://huggingface.co/saa938/presonance-generalist-vision-geometry-v1/blob/main/DINOv3_LICENSE.md
- Receta de entrenamiento (TRAINING_RECIPE.json): https://huggingface.co/saa938/presonance-generalist-vision-geometry-v1/blob/main/TRAINING_RECIPE.json
- Manifiesto de entrenamiento (TRAINING_MANIFEST.json): https://huggingface.co/saa938/presonance-generalist-vision-geometry-v1/blob/main/TRAINING_MANIFEST.json
- Evidencias (EVIDENCE.json): https://huggingface.co/saa938/presonance-generalist-vision-geometry-v1/blob/main/EVIDENCE.json
