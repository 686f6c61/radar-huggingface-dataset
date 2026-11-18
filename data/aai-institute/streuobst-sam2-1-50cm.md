# aai-institute/streuobst-sam2.1-50cm

## Resumen

Streuobst-sam2.1-50cm es un modelo de segmentación de imágenes derivado de facebook/sam2.1-hiera-base-plus, desarrollado por el appliedAI Institute for Europe (aai-institute) dentro del proyecto qgis-segment. Su tarea concreta es detectar Streuobstwiesen (praderas de árboles frutales tradicionales, también llamadas orchard meadows) en ortofotografía aérea (DOP) a 0,5 m por píxel. No es un modelo de propósito general: es un ajuste fino del codificador de imagen de SAM 2.1 especializado en una única clase semántica (huerto positivo) sobre teselas de 1024 px que cubren 512 m × 512 m de terreno.

El modelo se publica como la opción rápida de una pareja de modelos gemelos: comparte modelo base, datos, partición de datos, receta de entrenamiento, código y máquina con su hermano sam2.1-25cm, pero trabaja a 0,5 m/px en lugar de 0,25 m/px. Esa decisión cuadruplica la superficie cubierta por tesela, reduce a la cuarta parte el número de teselas necesarias para una región y multiplica por cuatro la velocidad de inferencia (0,37 s/km² frente a 1,52 s/km² en una V100). A cambio, pierde capacidad para detectar parcelas pequeñas.

Es relevante ahora porque ofrece una vía práctica para inventariar y monitorizar praderas de frutales tradicionales a escala regional con hardware modesto, con licencia Apache-2.0 y pesos de 324 MB, lo que permite integrarlo en flujos de teledetección y en el plugin QGIS del propio proyecto sin coste de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 (Hiera base-plus) con codificador de imagen ajustado; segmentación de imágenes |
| Parametros totales | 80,9 M (state dict bajo `model`, float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 1024 px por tesela (512 m × 512 m a 0,5 m/px) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch state dict, `sam2.1_hiera_b+_streuobst.pt`, 324 MB) |

## Arquitectura y entrenamiento

El modelo parte de facebook/sam2.1-hiera-base-plus, un segmentador de imágenes de Meta basado en un codificador jerárquico Hiera. El ajuste fino afecta al codificador de imagen, por lo que los pesos publicados difieren del checkpoint original de Meta aunque conservan su licencia Apache-2.0. La salida es una máscara de segmentación binaria con polaridad positiva para huerto y un umbral de decisión de -0,36, ajustado sobre las teselas de entrenamiento (a menos de 0,001 de IoU del umbral 0 que usa el plugin).

Los datos de entrenamiento son ortofotografía DOP 2020 (resolución original de 0,20 m) remuestreada bilinealmente a 0,5 m/px y cortada en teselas de 1024 px. Se usaron 6.545 teselas de entrenamiento, frente a las 27.133 del modelo a 0,25 m/px. El entrenamiento constó de 32 fases con el mismo número de pasos de optimizador que el modelo gemelo, lo que implica más pasadas sobre cada tesela, y duró 4,5 h con validación periódica. La semilla publicada es la 123, la mejor de tres sobre la región de calibración. El run de entrenamiento es `sam2_logs/scale_v2/scale_0.5_s123` (checkpoint final `checkpoint_32.pt`) y el código está en la etiqueta `benchmark-v2-study`, commit f9b6f63. La partición de datos es `data/splits/benchmark_v2/0.5`.

El postprocesado se define en unidades de terreno: se eliminan componentes menores de 20 m² y se rellenan huecos menores de 20 m² (80 px a esta resolución), se aplica un cierre morfológico de 3,5 m (7 px, ancho impar), se descartan polígonos menores de 25 m² y se simplifican contornos a 1 m. Un barrido de 7.776 configuraciones sobre la región de calibración v2 no encontró ninguna que superase estos valores por defecto dentro de sus intervalos de confianza simultáneos del 95%.

## Capacidades

- Segmentación binaria de imágenes aéreas para detectar praderas de frutales tradicionales (Streuobstwiesen) como clase positiva.
- Procesamiento por teselas de 1024 px que cubren 512 m × 512 m a 0,5 m/px, con remuestreo de la extensión de entrada a esa resolución.
- Inferencia sobre ortofotografía aérea (DOP) y, por extensión, imágenes de teledetección con resolución comparable.
- Integración en el plugin QGIS del proyecto qgis-segment, en el servicio de inferencia y en la línea de comandos bajo el identificador `sam2.1-50cm`.
- Carga programática mediante `streuobst.inference.model_specs.load_model("sam2.1-50cm")`.
- Postprocesado en unidades métricas con valores por defecto propios, calibrados sobre la región de calibración v2.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni generación de lenguaje: es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- Inventario regional de praderas de frutales: procesar ortofotografías de comarcas enteras a 0,5 m/px para generar cartografía de huertos; a 0,37 s/km² en V100, una región de 10.000 km² se cubre en aproximadamente una hora de cómputo de forward pass.
- Integración en QGIS para técnicos forestales y agrónomos: el plugin remuestrea la extensión a 0,5 m/px, aplica el modelo y devuelve polígonos postprocesados en metros, lo que permite revisar y editar resultados dentro del SIG sin infraestructura adicional.
- Monitorización de cambios y pérdida de superficie: comparar máscaras generadas sobre vuelos de distintos años para detectar arranques o abandonos de parcelas, aprovechando la velocidad del modelo para reprocesar series temporales completas.
- Priorización de inspecciones de campo: usar las detecciones de parcelas grandes (100% de acierto en parches de más de 2 ha en calibración) para dirigir visitas de verificación y solicitudes de subvención ligadas a estos hábitats.
- Análisis a gran escala con recursos limitados: al necesitar una cuarta parte de las teselas que el modelo a 0,25 m/px, encaja en pipelines con GPUs de gama media o en procesamiento por lotes nocturno sobre V100/A100 compartidas.
- Generación de capas de hábitat para estudios de biodiversidad: producir máscaras de huerto como capa base para modelos de distribución de especies o análisis de conectividad del paisaje.
- Docencia y experimentación en teledetección: pesos de 324 MB y licencia Apache-2.0 permiten reproducir el pipeline completo (teselado, inferencia, postprocesado) en un curso o prototipo sin coste de licencia.

## Benchmarks y rendimiento

Región de calibración (113 km², nunca usada en entrenamiento), puntuaciones promediadas sobre una rejilla común de 0,5 m, una pasada y umbral ajustado sobre teselas de entrenamiento:

| Modelo | IoU | Precision | Recall | AP | Parches < 0,5 ha | 0,5-2 ha | > 2 ha |
|---|---|---|---|---|---|---|---|
| sam2.1-50cm, media de 3 semillas (sd) | 0,655 (0,001) | 0,750 | 0,839 | 0,860 | 75,9% | 97,4% | 100% |
| sam2.1-50cm, modelo publicado (semilla 123) | 0,656 | 0,756 | 0,832 | 0,864 | 74,1% (565/762) | 97,1% (99/102) | 100% (31/31) |
| sam2.1-25cm, media de 3 semillas | 0,655 (0,005) | 0,753 | 0,833 | 0,870 | 81,6% | 98,0% | 100% |

Región de test reservada (113 km²), una pasada tras fijar el modelo:

| Modelo | IoU | Precision | Recall | AP | Parches < 0,5 ha | 0,5-2 ha | > 2 ha |
|---|---|---|---|---|---|---|---|
| sam2.1-50cm (semilla 123) | 0,621 | 0,762 | 0,769 | 0,832 | 78,3% (593/757) | 94,0% (140/149) | 100% (39/39) |
| sam2.1-25cm (semilla 789) | 0,622 | 0,747 | 0,787 | 0,832 | 83,5% (632/757) | 96,0% (143/149) | 100% (39/39) |

Velocidad, solo forward pass en V100 sobre la región de calibración: 0,37 s/km² (media de tres semillas) frente a 1,52 s/km² del modelo a 0,25 m/px.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 80,9 M parámetros en float32 (324 MB de pesos), el modelo es muy ligero y el consumo vendrá dominado por las activaciones de las teselas de 1024 px y el tamaño de lote.
- GPU de referencia en las mediciones: NVIDIA V100 (0,37 s/km² de forward pass).
- GPU recomendadas: V100 o superiores (A100, H100) para procesamiento regional por lotes; cualquier GPU consumer con suficiente VRAM para teselas de 1024 px debería poder ejecutarlo, aunque no se aportan cifras concretas de VRAM ni de latencia en consumer.
- Despliegue: la información disponible cita la librería `sam2`, el cargador del proyecto (`streuobst.inference.model_specs.load_model`), el plugin QGIS, el servicio de inferencia y la línea de comandos con teselado previo (`python -m streuobst.processing.tiling --resolution 0.5`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un segmentador de imágenes de este tipo).
- Latencia y throughput: 0,37 s/km² en V100 (forward pass, media de tres semillas); el coste de teselado y postprocesado no se detalla.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de trabajo | IoU (test) | Parches < 0,5 ha (test) | Velocidad (V100) | Licencia |
|---|---|---|---|---|---|---|
| streuobst-sam2.1-50cm | 80,9 M | 0,5 m/px, tesela 512 m × 512 m | 0,621 | 78,3% | 0,37 s/km² | Apache-2.0 |
| streuobst-sam2.1-25cm | no disponible (mismo base) | 0,25 m/px, tesela 256 m × 256 m | 0,622 | 83,5% | 1,52 s/km² | Apache-2.0 |
| facebook/sam2.1-hiera-base-plus | no disponible en la información | genérica, sin resolución fija | no disponible | no disponible | no disponible | Apache-2.0 |

El modelo gemelo a 0,25 m/px se convirtió en el predeterminado del proyecto por una regla fijada antes de puntuar: encuentra 5,7 puntos más de parches pequeños en todas las semillas. El modelo a 0,5 m/px es preferible cuando priman la velocidad y las parcelas grandes.

## Limitaciones y advertencias

- Menor sensibilidad a parcelas pequeñas: 78,3% de detección en parches menores de 0,5 ha en test, frente al 83,5% del modelo a 0,25 m/px; para parcelas pequeñas el proyecto recomienda usar sam2.1-25cm.
- Modelo de una sola clase y dominio: solo detecta huerto positivo sobre ortofotografía aérea; no es un segmentador general y no se ha validado fuera de este tipo de imagen ni de la región de calibración/test alemanas.
- Entrenado con DOP 2020 remuestreada de 0,20 m a 0,5 m; el rendimiento con otras fuentes, sensores o épocas del año no está documentado.
- Riesgo de falsos positivos y negativos en bordes de parcela y en superficies con textura similar (frutales en fila, vegetación arbórea dispersa); el postprocesado por defecto está calibrado solo sobre la región v2.
- El umbral de decisión (-0,36) está ajustado a las teselas de entrenamiento; cambiarlo altera precision y recall de forma no documentada.
- Licencia Apache-2.0 permite uso comercial, pero `LICENSE` y `NOTICE` deben acompañar a toda copia de los pesos; el `NOTICE` incluye los créditos de Meta (SAM 2.1, Copyright (c) Meta Platforms, Inc.) y de la fuente de imágenes (LGL, www.lgl-bw.de, dl-de/by-2-0), con la obligación de atribución de la imagen modificada.
- El repositorio del código (qgis-segment) aún no era público en el momento de la publicación de la model card, por lo que las rutas `config/...` y `models/...` no son verificables externamente todavía.
- Sin datos publicados de sesgos, comportamiento multilingüe (no aplica) ni evaluaciones fuera del ámbito alemán.

## Enlaces

- Hugging Face: https://huggingface.co/aai-institute/streuobst-sam2.1-50cm
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-base-plus
- Fuente de imágenes (LGL Baden-Württemberg): https://www.lgl-bw.de
- Licencia de datos dl-de/by-2-0: https://www.govdata.de/dl-de/by-2-0
- Repositorio del proyecto qgis-segment: no disponible (pendiente de publicación según la model card)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
