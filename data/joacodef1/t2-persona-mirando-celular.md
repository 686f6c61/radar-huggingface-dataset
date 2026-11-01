# joacodef1/t2-persona-mirando-celular

## Resumen

El modelo `joacodef1/t2-persona-mirando-celular` es un detector de objetos de una sola clase basado en YOLO26n, desarrollado por el usuario joacodef1 en el contexto de la Tarea 2 del curso de Visión por Computador de la Pontificia Universidad Católica de Chile (2026). Su única clase detectada es `persona_mirando_celular`, definida con una regla semántica precisa: una persona que sostiene su propio teléfono en una posición desde la que podría ver la pantalla, incluyendo selfies y acciones de fotografía o grabación.

La relevancia del modelo es acotada pero concreta: resuelve un subproblema de detección de personas con un criterio de pose y contexto más fino que la mera detección de la clase `person` de COCO, lo que permite filtrar escenas por atención al dispositivo móvil. Al derivar de YOLO26n, se beneficia de una arquitectura de detección en tiempo real de muy bajo coste computacional, adecuada para despliegue en dispositivos con recursos limitados.

El repositorio es de tamaño mínimo (0,0 GB según HuggingFace) y contiene los pesos en formato `.pt` de Ultralytics (`best.pt`). Se publicó bajo licencia AGPL-3.0, con 115 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (etiqueta declarada; el modelo no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

El modelo se construye sobre YOLO26n preentrenado en COCO, con las 10 primeras capas del *backbone* congeladas (`freeze=10`). Se entrenó a 640 px de resolución de imagen durante 100 épocas con `patience=30`, deteniéndose en la época 54, aunque los pesos publicados corresponden a la época 24. Se usó batch de 16 y semilla 0.

Los datos provienen de imágenes de 1000×1000 reunidas por los integrantes del curso, con revisión manual de anotaciones contra la regla de la clase y exclusión de duplicados y casos dudosos. El conjunto de entrenamiento contiene 1.275 imágenes (1.116 cajas positivas y 352 imágenes negativas), y el de validación 284 imágenes (252 cajas y 75 negativas). La inclusión explícita de imágenes negativas es un punto técnico destacable: obliga al modelo a discriminar entre sostener el teléfono de forma visible y otras interacciones (llamada en la oreja, audio, teléfono ajeno). El autor documenta la trazabilidad de las decisiones en `revision/` y los resultados comparativos en `runs/resultados.jsonl`.

## Capacidades

- Detección de objetos de una sola clase: `persona_mirando_celular`.
- Devuelve cajas delimitadoras que encierran a la persona completa visible (cabeza, brazos y teléfono).
- Distingue positivos de negativos según la regla definida (selfies, fotografía o grabación cuentan como positivos; llamadas en la oreja, audio o teléfono ajeno no).
- Inferencia en tiempo real por su base YOLO26n.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector visual puro.
- No incluye visión-lenguaje ni *thinking mode*.

## Casos de uso

- Filtrado de imágenes en datasets de comportamiento: usar el detector para etiquetar automáticamente escenas donde alguien mira su móvil y separar ese subconjunto antes de un análisis posterior.
- Analítica de atención en entornos controlados (aulas, salas de espera, eventos): contar personas con el teléfono en posición de uso mediante inferencia por fotograma o vídeo.
- Moderación de contenido en plataformas: detectar selfies o grabaciones con el móvil visible para clasificar contenido de tipo "captura propia".
- Automatización de recortes y *cropping*: generar recortes de la persona completa a partir de las cajas para pipelines de aumento de datos o anonimización.
- Investigación en visión por computador: servir de línea base reproducible (semilla 0, hiperparámetros documentados) para experimentos de detección de una clase con clases negativas.
- Prototipado en dispositivos de borde: al derivar de YOLO26n, puede ejecutarse en GPUs de consumo o incluso CPU para demos y pruebas de concepto.
- Etiquetado asistido: preanotar un nuevo conjunto de imágenes y revisar manualmente las cajas, reduciendo el coste de anotación.

## Benchmarks y rendimiento

Resultados en validación (284 imágenes, 252 cajas):

| Metrica | Valor |
|---|---|
| mAP50 | 0,857 |
| mAP50-95 | 0,560 |
| Precisión | 0,743 |
| Recall | 0,837 |
| Umbral de mejor F1 | 0,405 |

Comparativa de selección de modelo (mAP50 en validación, media ± desviación sobre tres semillas):

| Modelo / configuración | mAP50 |
|---|---|
| YOLO11s | 0,868 ± 0,007 |
| YOLO26n (backbone congelado) | 0,864 ± 0,007 |
| YOLO11n | 0,847 ± 0,006 |
| YOLO11m | 0,840 ± 0,015 |
| YOLOv8n | 0,819 ± 0,019 |
| YOLO26n (todas las capas) | 0,869 ± 0,008 |
| YOLO26n a 960 px | 0,827 ± 0,014 |

El autor señala que las tres mejores configuraciones empatan dentro de la variación entre semillas y que se eligió YOLO26n con *backbone* congelado por ser la más pequeña y rápida de entrenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño de la variante `n` de YOLO, es esperable un consumo bajo, pero no se confirma con datos.
- GPU recomendadas: no disponible de forma explícita; la familia YOLO26n está pensada para GPUs de consumo y despliegue en el borde.
- ¿Cabe en GPU de consumo? No confirmado con datos; por la variante `n`, es plausible en GPUs de gama media, pero no se dispone de cifras.
- Opciones de despliegue: Ultralytics (API `YOLO(...).predict(...)`); exportación a otros formatos (ONNX, TensorRT, etc.) no documentada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP50 (validación) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t2-persona-mirando-celular (YOLO26n) | no disponible | no aplica | 0,857 | AGPL-3.0 | HuggingFace |
| YOLO11s | no disponible | no aplica | 0,868 ± 0,007 | AGPL-3.0 (Ultralytics) | Ultralytics |
| YOLO11n | no disponible | no aplica | 0,847 ± 0,006 | AGPL-3.0 (Ultralytics) | Ultralytics |
| YOLOv8n | no disponible | no aplica | 0,819 ± 0,019 | AGPL-3.0 (Ultralytics) | Ultralytics |

La comparación es directa porque todos los rivales se evaluaron con los mismos datos y protocolo por el propio autor. No hay alternativas de una sola clase equivalentes en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el conjunto de datos procede de imágenes reunidas por estudiantes, lo que puede introducir sesgos de composición, iluminación y demografía no analizados.
- Riesgo de alucinación: en detección, se traduce en falsos positivos; la precisión de 0,743 indica una tasa de falsos positivos no despreciable.
- Limitaciones de contexto o idioma: no aplica idioma; el modelo no procesa texto. La etiqueta `es` es meramente declarativa.
- Restricciones de licencia: AGPL-3.0 implica obligaciones de copyleft fuerte para uso en red; revisar compatibilidad antes de integrarlo en productos comerciales cerrados.
- El umbral de confianza óptimo (0,405) es específico del conjunto de validación y puede requerir recalibración en producción.
- Los pesos publicados corresponden a la época 24, no a la mejor época del entrenamiento (que se detuvo en la 54); conviene verificar la coherencia entre pesos y métricas reportadas.
- Modelo de un solo uso y una sola clase: no es un detector generalista.
- Sin datos de latencia, VRAM ni exportación a otros formatos.

## Enlaces

- HuggingFace: https://huggingface.co/joacodef1/t2-persona-mirando-celular
- Repositorio de Ultralytics (framework): https://github.com/ultralytics/ultralytics
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
