# Rmano-Rudeson/weedscan-kz

## Resumen

WeedScan KZ es un conjunto de modelos de detección de objetos basados en la familia YOLO (Ultralytics), entrenados para la detección multiespecie de malas hierbas en cultivos de Kazajistán. Lo desarrolla Arman Nurken en el marco de un MSc en Applied Data Analytics en la Astana IT University, y se publica junto con los scripts de entrenamiento, los registros de experimentos y una aplicación web (React + FastAPI) de análisis de campo por cuadrículas. El repositorio agrupa tres checkpoints disponibles (`yolov26n-10class`, `yolov8n-15class`, `yolov8n-5class`) de cinco experimentos documentados.

El modelo resuelve un problema de visión por computador aplicada a agricultura de precisión: identificar y localizar malas hierbas en imágenes de campo para apoyar tareas de muestreo y reconstrucción espacial. No es un modelo de lenguaje ni un modelo fundacional; es un detector de objetos de tipo YOLO con etiquetas heredadas del dataset y un alcance declarado de prototipo de investigación.

Es relevante por su carácter de dataset regional específico (Kazajistán) y por la documentación de trazabilidad que acompaña a la release (checksums, orden de etiquetas, resúmenes de ejecución en `experiments/manifest.json`). Sin embargo, el propio autor advierte de que las métricas publicadas son máximos de validación recuperados de ficheros `results.csv`, no una evaluación independiente sobre test, y de que las particiones de datos no están agrupadas por imagen fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO (Ultralytics); variantes YOLOv8n, YOLOv8l y YOLOv26n/YOLOv26l |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | checkpoints de Ultralytics (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es la de los detectores YOLO de Ultralytics en sus variantes nano y large: YOLOv8n, YOLOv8l, YOLOv26n y YOLOv26l. Se trata de detectores de una sola etapa (one-stage) con backbone convolucional, cuello de agregación de características y cabecera de predicción de cajas y clases. No hay información en la model card sobre el número de parámetros, la resolución de entrada ni los hiperparámetros de entrenamiento.

El experimento principal de diez clases se preparó con 5.588 imágenes y 7.659 anotaciones, incluyendo muestras aumentadas (ver `docs/dataset-preparation.md`). Los scripts originales de entrenamiento se conservan en `training/archive/` con rutas de sistema de ficheros históricas que deben adaptarse. El convertidor archivado realiza una partición aleatoria de imágenes, y la evidencia disponible no establece que las imágenes fuente y sus derivadas aumentadas se agruparan antes del split, lo que puede inflar las métricas de validación. No se redistribuyen las imágenes crudas ni los datasets de terceros.

## Capacidades

- Detección de objetos en imágenes de campo con cajas delimitadoras y etiquetas de clase.
- Clasificación multiespecie de malas hierbas: experimentos de 5, 10 y 15 clases según la variante.
- Inferencia por línea de comandos mediante `predict.py` con selección de variante (`yolov26n-10class`, `yolov8n-15class`, `yolov8n-5class`).
- Servicio de inferencia vía API FastAPI (`inference_server:app`) con descarga automática del checkpoint desde Hugging Face en el primer arranque.
- Aplicación web con análisis de imagen, cuadrícula de zonas/bloques de campo, resúmenes por especie y visualizaciones de campo.
- Selección de variante mediante variables de entorno `WEEDSCAN_VARIANT` y `WEEDSCAN_MODEL_PATH`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni capacidades multilingües más allá del inglés en las etiquetas.

## Casos de uso

- Muestreo de campo por cuadrículas: la aplicación web divide el campo en zonas y bloques de 100 hectáreas como marco de muestreo y reconstrucción; el detector aporta las detecciones por imagen que alimentan ese esquema. Es adecuado porque el pipeline ya incluye la lógica de cuadrícula y los resúmenes por especie.
- Inventario de especies de malas hierbas en lotes concretos: el modelo etiqueta cada detección con la clase heredada del dataset, lo que permite generar listados de especies presentes por imagen o por zona para revisión agronómica posterior.
- Priorización de inspecciones: las detecciones con mayor área de caja delimitadora pueden ordenar imágenes o zonas para revisión manual, dado que el área se usa como proxy de cobertura en imagen (no calibrada).
- Prototipado de investigación en agricultura de precisión: el repositorio incluye scripts de entrenamiento, manifiesto de experimentos con checksums y registros, lo que facilita reproducir o adaptar el pipeline a nuevos datasets regionales.
- Integración en aplicaciones de análisis de imágenes agrícolas: el servidor FastAPI y la app React sirven como base para incorporar detección de malas hierbas en herramientas internas de monitorización.
- Docencia y evaluación de detectores YOLO: las variantes nano y large con distintos números de clases permiten comparar configuraciones, aunque el autor advierte de que los experimentos de 5, 15 y 10 clases usan datasets distintos y no constituyen una comparación controlada de arquitecturas.

## Benchmarks y rendimiento

Los valores siguientes son máximos registrados en los ficheros `results.csv` recuperados, no una evaluación fresca sobre test ni necesariamente las métricas del checkpoint seleccionado (`best.pt` se elige por fitness, que puede corresponder a otra época).

| Experimento | Clases | mAP@0.5 máxima registrada en validación | Pesos en la release |
|---|---:|---:|---|
| YOLOv26n | 10 | 96,727 % | Disponibles |
| YOLOv8l | 10 | 97,169 % | No recuperados |
| YOLOv26l | 10 | 97,700 % | No recuperados |
| YOLOv8n baseline | 15 | 83,318 % | Disponibles |
| YOLOv8n histórico baseline | 5 | 90,701 % | Disponibles |

No se han publicado resultados de benchmarks adicionales (por ejemplo, mAP@0.5:0.95, precisión, recall o latencia) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia cualitativa, las variantes nano (YOLOv8n, YOLOv26n) son ligeras y las variantes large (YOLOv8l, YOLOv26l) son sustancialmente más pesadas, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma qué modelos concretos admiten las variantes nano o large.
- Opciones de despliegue: Ultralytics (Python 3.10+ en entorno virtual), servidor FastAPI (`uvicorn inference_server:app`) y frontend React con Vite. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La model card no incluye comparaciones con otros detectores de malas hierbas ni con checkpoints YOLO preentrenados de referencia.

| Modelo | Parámetros | Contexto | mAP@0.5 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeedScan KZ (YOLOv26n, 10 clases) | no disponible | no aplica | 96,727 % (máx. validación) | AGPL-3.0 | Pesos en HF |
| WeedScan KZ (YOLOv8n, 15 clases) | no disponible | no aplica | 83,318 % (máx. validación) | AGPL-3.0 | Pesos en HF |
| WeedScan KZ (YOLOv8n, 5 clases) | no disponible | no aplica | 90,701 % (máx. validación) | AGPL-3.0 | Pesos en HF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un prototipo de investigación; el autor no reclama generalización más allá de los datos de entrenamiento.
- Las métricas son máximos de validación recuperados, no una evaluación sobre test independiente, y pueden no corresponder al checkpoint `best.pt` seleccionado.
- La partición de datos es aleatoria y no se ha verificado que las imágenes fuente y sus aumentadas estén agrupadas antes del split, lo que puede inflar los resultados de validación. Se requiere una prueba de campo independiente agrupada por fuente.
- Las etiquetas de clase, incluidas cadenas como `crop: xanthium strumarium`, son etiquetas heredadas del dataset y no clasificaciones agronómicas verificadas.
- El área de la caja delimitadora es un proxy de cobertura en imagen; no es cobertura de suelo calibrada, biomasa ni pérdida de rendimiento.
- La cuadrícula propuesta de 100 hectáreas es un marco de muestreo y reconstrucción, no evidencia de un ensayo de campo completado.
- El texto de tratamiento del frontend histórico es ilustrativo y no está validado para selección de pesticidas ni dosificación.
- El paper, las notas locales de preparación y el CV del autor presentan recuentos de dataset y fechas de investigación distintos; la release usa los ficheros de experimentos para las métricas y la publicación enlazada para los metadatos de publicación.
- Los pesos de YOLOv8l y YOLOv26l (10 clases) no están disponibles y no se han sustituido por modelos base preentrenados.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el código y los checkpoints derivados; el artículo de 2026 está bajo CC BY-SA 4.0, licencia distinta de la del modelo y del código.
- No hay datos sobre sesgos, alucinación (no aplica a un detector), latencia ni requisitos de hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rmano-Rudeson/weedscan-kz
- Código fuente: https://github.com/Rrmanoo/weedscan-kz
- Perfil del autor en GitHub: https://github.com/Rrmanoo
- Publicación 2026 (Reviews of Modern Science, No. 13): https://ojs.publisher.agency/index.php/RMS/article/view/8742
- Publicación 2025 (Central Asian Scientific Journal, No. 1 (25), Vol. 2, pp. 100–110): referencia bibliográfica en `docs/publications.bib`, sin enlace directo en la información disponible.
