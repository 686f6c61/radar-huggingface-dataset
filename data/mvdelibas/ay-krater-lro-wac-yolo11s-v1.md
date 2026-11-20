# mvdelibas/ay-krater-lro-wac-yolo11s-v1

## Resumen

El modelo `ay-krater-lro-wac-yolo11s-v1` es un detector de objetos de una sola clase (cráteres) entrenado sobre imágenes orbitales lunares del mosaico LRO WAC, a una resolución de 100 m/píxel y para cráteres de entre 2 y 30 km de diámetro. Lo publica el usuario `mvdelibas` en Hugging Face y se apoya en la arquitectura YOLO11s de Ultralytics, con pesos en formato PyTorch (`.pt`) y una licencia CC0 1.0. El modelo resuelve una tarea muy concreta de teledetección planetaria: localizar y delimitar cráteres de impacto en teselas de 640 x 640 píxeles, con cajas derivadas del catálogo Lunar Crater Database de Robbins (2018).

La relevancia del modelo es doble. Por un lado, ofrece un punto de partida reproducible y de dominio público para tareas de detección de cráteres en imágenes de nadir, algo útil para cartografía planetaria, selección de zonas de aterrizaje o análisis estadístico de densidad de cráteres. Por otro, la model card es inusualmente honesta sobre sus límites: solo cubre latitudes entre -45 y 45 grados, solo funciona con imágenes en perspectiva nadir y el catálogo de referencia solo es completo por encima de los 2 km de diámetro.

Se trata de un modelo pequeño (la variante "s" de YOLO11), sin datos publicados sobre número de parámetros en la información disponible, y con un conjunto de entrenamiento de aproximadamente 3.000 teselas y unas 121.000 cajas repartidas en tres particiones. No es un modelo de lenguaje ni un modelo multimodal: es un detector puro de visión por computador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible (pesos publicados en `.pt`; no se documentan variantes GGUF, ONNX ni TensorRT) |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | cc0-1.0 (los pesos); la arquitectura y el código de Ultralytics son AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) |
| Entrada | imágenes de 640 x 640 px, resolución de 100 m/px |
| Clases | 1 (cráter) |
| Tamaño del repo | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es YOLO11s, un detector de objetos de una etapa basado en una red troncal convolucional con cuello de agregación multi-escala y cabecera de detección anclada. No hay innovaciones arquitectónicas propias del autor: el modelo reutiliza el código y los pesos preentrenados de Ultralytics y se afina sobre un dataset específico. La entrada se estandariza a 640 x 640 píxeles, que coincide con el tamaño de las teselas del dataset.

El entrenamiento se realizó durante 60 épocas a 640 px sobre el dataset `mvdelibas/ay-krater-lro-wac-robbins-v1`, compuesto por teselas reales del mosaico LRO WAC con latitudes entre -45 y 45 grados. Las cajas se derivaron de latitud, longitud y diámetro del catálogo de Robbins (2018). La partición se hizo por bandas de longitud, de modo que las bandas del conjunto de test nunca se vieron durante el entrenamiento; esto es una decisión metodológica relevante porque evita la fuga de información geográfica entre train y test. El conjunto total ronda las 3.000 teselas y unas 121.000 cajas en las tres particiones. No se documenta el uso de RLHF, DPO ni técnicas de destilación; es un ajuste supervisado convencional de detección.

## Capacidades

- Detección de cráteres de impacto en imágenes orbitales lunares en perspectiva nadir, con cajas delimitadoras y puntuaciones de confianza.
- Funciona sobre teselas de 640 x 640 px a 100 m/px, con cráteres de 2 a 30 km de diámetro.
- Salida estándar de Ultralytics: coordenadas `xyxy`, confianza y clase, consumible desde Python con la API de `ultralytics`.
- Integración directa con el ecosistema Ultralytics (predicción, validación, exportación a otros formatos si se desea, aunque no se documenta).
- Entrenado para generalizar a bandas de longitud no vistas (partición por bandas), lo que sugiere cierta robustez geográfica dentro del rango de latitud cubierto.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo "thinking": es exclusivamente un detector de objetos.
- Capacidad multilingüe: no aplica; las etiquetas y la documentación están en inglés.

## Casos de uso

- Cartografía de densidad de cráteres: el modelo permite generar mapas de densidad a partir de teselas LRO WAC de forma automatizada, sustituyendo el conteo manual en estudios de cronología superficial. Es adecuado porque opera a la resolución del mosaico (100 m/px) y cubre el rango de 2 a 30 km que interesa en estudios regionales.
- Selección de zonas de aterrizaje: en la planificación de misiones, se pueden pasar teselas candidatas por el detector para identificar cráteres grandes y evitar zonas de riesgo; el modelo devuelve cajas y confianzas que se pueden cruzar con modelos de elevación.
- Preetiquetado para anotación humana: dado su mAP50 de 0,788 en test, sirve como primer paso de un pipeline de anotación asistida, reduciendo el coste de etiquetar nuevas regiones o nuevos sensores.
- Validación cruzada de catálogos existentes: comparar las detecciones del modelo con el catálogo de Robbins (2018) en bandas de longitud no vistas permite detectar discrepancias y posibles omisiones en el catálogo.
- Análisis de imágenes de archivo: cualquier mosaico lunar en proyección ortográfica y resolución comparable se puede procesar por lotes con la API de Ultralytics, lo que facilita estudios retrospectivos sobre datos históricos.
- Educación y divulgación: al ser CC0 y de tamaño reducido, es un modelo idóneo para talleres de teledetección planetaria y para demostraciones de detección de objetos en dominios científicos.
- Integración en pipelines de teledetección: se puede encadenar con herramientas de geoprocesamiento (GDAL, rasterio) para convertir las cajas detectadas en capas vectoriales georreferenciadas.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con los pesos liberados en una única ejecución:

| Split | mAP50 | mAP50-95 | Precision | Recall |
|---|---|---|---|---|
| val (450 teselas) | 0.755 | 0.501 | 0.715 | 0.659 |
| test (450 teselas, bandas de longitud no vistas) | 0.788 | 0.531 | 0.731 | 0.697 |

No se han publicado comparaciones con otros detectores de cráteres en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño de la variante "s" de YOLO11 y la entrada de 640 px, es esperable que quepa en GPUs de consumo, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. La model card no especifica hardware de entrenamiento ni de inferencia.
- ¿Cabe en GPU de consumo? No se documenta explícitamente, pero el tamaño del repo (0.0 GB) y la variante "s" sugieren que sí; conviene verificarlo empíricamente.
- Opciones de despliegue: la única vía documentada es la API de `ultralytics` en Python, cargando el `.pt` con `hf_hub_download`. No se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas últimas no aplican a un detector de visión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de cráteres lunares en la documentación proporcionada. Se puede señalar, a modo de contexto, que la alternativa metodológica habitual es el ajuste de detectores genéricos (YOLO, Faster R-CNN, RetinaNet) sobre datasets de cráteres, pero no se han encontrado resultados publicados comparables en la información disponible.

| Modelo | Parámetros | Contexto | mAP50 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ay-krater-lro-wac-yolo11s-v1 | no disponible | no aplica | 0.788 | CC0 1.0 (pesos) / AGPL-3.0 (código) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El catálogo de referencia solo es completo por encima de unos 2 km de diámetro; los cráteres menores no están etiquetados y, cuando el modelo los detecta, cuentan como falsos positivos. Esto hace que la precisión real sea probablemente mayor que la reportada.
- Cobertura geográfica limitada a latitudes entre -45 y 45 grados. No se probaron regiones polares.
- Solo funciona con imágenes en perspectiva nadir (ortográfica). No funciona con imágenes en perspectiva de rover ni con otras geometrías de captura.
- Solo se probó con el mosaico LRO WAC y sus condiciones de iluminación; no se validó con otras cámaras ni con imágenes de Marte.
- Riesgo de alucinación: en detectores de objetos, el equivalente son falsos positivos sobre texturas o sombras que se parezcan a cráteres; el modelo no está exento de ello, especialmente en zonas con iluminación rasante.
- Restricciones de licencia: los pesos son CC0 1.0, pero la arquitectura y el código de Ultralytics son AGPL-3.0. Para uso comercial conviene revisar la licencia de Ultralytics, que puede exigir una licencia comercial aparte.
- La model card pide citar a Robbins (2019) aunque la licencia sea CC0; es una petición académica, no una obligación legal.
- USGS, NASA y ASU no han hecho ni respaldan este modelo; el autor del catálogo confirmó por escrito (18 de noviembre de 2026) que se pueden publicar productos derivados y pesos.
- El modelo se publicó en una única ejecución de entrenamiento; no hay estudios de varianza entre semillas ni validación cruzada más allá de la partición por bandas de longitud.
- No se documentan sesgos demográficos (no aplica) pero sí un sesgo de dominio claro: cualquier imagen fuera del mosaico LRO WAC en nadir puede degradar el rendimiento sin aviso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/ay-krater-lro-wac-yolo11s-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mvdelibas/ay-krater-lro-wac-robbins-v1
- Referencia del catálogo: Robbins, S. J. (2019), JGR Planets, 124, 871-892, doi:10.1029/2018JE005592
- Ultralytics (arquitectura y código, AGPL-3.0): https://github.com/ultralytics/ultralytics
- Mosaico LROC WAC (NASA/GSFC/Arizona State University): no se proporciona URL directa en la información disponible.
