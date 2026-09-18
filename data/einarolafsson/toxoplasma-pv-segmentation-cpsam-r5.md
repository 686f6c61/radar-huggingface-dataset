# einarolafsson/toxoplasma-pv-segmentation-cpsam-r5

## Resumen

Toxoplasma PV v2 (round 5) es un modelo de segmentación de instancias especializado en vacuolas parasitóforas (PV) de *Toxoplasma gondii* en imágenes de microscopía. Lo desarrolla el usuario einarolafsson y se distribuye a través del Model Zoo de spaCR, un paquete de código abierto para análisis de fenotipo espacial en cribados CRISPR e imágenes de microscopía. No es un modelo de lenguaje: es un checkpoint de visión entrenado sobre Cellpose-SAM (`cpsam_v2`), afinado con 556 imágenes curadas de taquizoítos teñidos con anti-Toxoplasma-biotina o que expresan DsRed en el lumen de la vacuola.

El problema que resuelve es concreto: la segmentación automática y fiable de vacuolas parasitóforas en placas de microscopía, donde el modelo stock de Cellpose-SAM rinde de forma insuficiente. Frente al `cpsam_v2` sin ajuste, que obtiene F1 0,7130 y AJI 0,4260 en 11 pocillos internos reservados, esta quinta ronda alcanza F1 0,8170 ± 0,036 y AJI 0,7144 ± 0,107 en validación cruzada de 5 pliegues sobre 619 pares curados.

La relevancia de esta ficha está en su metodología de evaluación: los resultados se reportan como media ± desviación estándar sobre 5 pliegues de validación cruzada, no sobre una única partición, y el Model Zoo verifica el SHA-256 del checkpoint tras la descarga. Se publica bajo licencia MIT. No hay datos públicos sobre número de parámetros, VRAM o cuantizaciones, y el repositorio completo ocupa 1,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (`cpsam_v2`), segmentación de instancias basada en SAM |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de visión) |
| Licencia | MIT |
| Formato de pesos | no disponible; checkpoint Cellpose-SAM con clave `cpsam_v2_toxo_r5` (repositorio de 1,2 GB) |
| Clave en Model Zoo | `toxoplasma_pv_v2` |
| Libreria | `spacr` |
| Pipeline declarado | `image-segmentation` |
| Tarea | Segmentación de vacuolas parasitóforas de *Toxoplasma gondii* |
| Diametro recomendado | 12 (`pathogen_diameter: 12`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint stock `cpsam_v2` de Cellpose-SAM, una arquitectura de segmentación de instancias que combina el paradigma de *promptable segmentation* de SAM con el entrenamiento específico de Cellpose para imágenes de microscopía. Sobre esa base se realiza un ajuste fino supervisado durante 100 épocas con optimizador AdamW, tasa de aprendizaje 1e-5 y weight decay 0,1. El mejor epoch registrado es 100 de 100, con una pérdida final de entrenamiento de 0,0424.

Los datos de entrenamiento son 556 imágenes curadas de vacuolas parasitóforas de taquizoítos, procedentes de cinco rondas de curación, con tinción de anti-Toxoplasma-biotina de cabra o expresión de DsRed en el lumen de la PV, y cepas RH y ME49. La evaluación se hizo con validación cruzada de 5 pliegues sobre 619 pares curados; los pliegues están en `training/folds.csv`. No se registró pérdida de validación en esta ejecución, por lo que el control de sobreajuste se apoya exclusivamente en la validación cruzada: un modelo que hubiese memorizado los datos no mantendría F1 0,817 ± 0,036 entre cinco pliegues. No se documenta uso de RLHF, DPO ni decodificación especulativa (no aplican a esta tarea).

## Capacidades

- Segmentación de instancias de vacuolas parasitóforas de *Toxoplasma gondii* a partir de una tinción de parásito (anti-Toxoplasma-biotina o DsRed en el lumen de la PV).
- Generación de máscaras de objeto compatibles con el campo `pathogen_model` del pipeline de spaCR.
- Funciona como modelo de *pathogen* dentro de `spacr.core.preprocess_generate_masks` y `spacr.spacr_cellpose.generate_masks_from_imgs`.
- Descarga e instalación verificada por SHA-256 mediante `spacr.model_zoo.catalogue()`, `install()`, `fetch()` y `verify()`.
- Uso desde interfaz gráfica (menú Model Zoo y opción Make masks) o desde Python.
- Cobertura de dos cepas de taquizoítos: RH y ME49.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual y de una sola tarea.

## Casos de uso

- Cribado antiparasitario de alto contenido: contar vacuolas parasitóforas por pocillo en placas de microscopía permite estimar el efecto de compuestos sobre la replicación del parásito. El F1 de 0,817 hace fiable el recuento agregado.
- Análisis de fenotipo espacial en cribados CRISPR: integrar el modelo como paso de segmentación dentro del pipeline de spaCR, de modo que cada vacuola detectada se convierta en una región medible para el análisis de vecindad y morfología celular.
- Cuantificación de carga parasitaria por célula huésped: usar el número de vacuolas segmentadas por campo como métrica cuantitativa de infección en experimentos de infección controlada.
- Reprocesamiento retrospectivo de datasets acumulados: aplicar el checkpoint sobre colecciones históricas de imágenes de RH y ME49 para regenerar máscaras homogéneas sin repetir la curación manual.
- Control de calidad de tinción: comparar las máscaras generadas sobre imágenes teñidas con anti-Toxoplasma-biotina o con DsRed y detectar lotes con tinción deficiente por caída del recuento de objetos.
- Medición de área de vacuola con cautela: el modelo es adecuado para área agregada, pero no para morfometría fina porque su precisión cae por encima de IoU 0,8.
- Despliegue en entorno de laboratorio sin conexión: el Model Zoo permite descargar el checkpoint una vez, verificarlo por SHA-256 y reutilizarlo localmente en el GUI de spaCR.

## Benchmarks y rendimiento

Comparación directa publicada en la model card (el baseline stock se evaluó sobre 11 pocillos internos reservados; el modelo afinado, sobre validación cruzada de 5 pliegues con 619 pares):

| Modelo | Train | Test | Validación cruzada | F1 @ IoU 0,5 | AJI | Dice | Pérdida final de train | Mejor época |
|---|---|---|---|---|---|---|---|---|
| Stock `cpsam_v2` (sin ajuste) | — | 11 | — | 0,7130 | 0,4260 | — | — | — |
| Este modelo (round 5) | 556 | 619 | 5 pliegues | 0,8170 ± 0,036 | 0,7144 ± 0,107 | 0,8024 ± 0,118 | 0,0424 | 100 / 100 |

Desglose por métrica en validación cruzada de 5 pliegues:

| Métrica | Media | Desviación estándar |
|---|---|---|
| F1 | 0,8170 | 0,0360 |
| Precisión | 0,8291 | 0,0528 |
| Recall | 0,8091 | 0,0569 |
| AJI | 0,7144 | 0,1069 |
| Dice | 0,8024 | 0,1176 |
| mAP | 0,5562 | 0,0855 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, porque el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio completo ocupa 1,2 GB, lo que acota el orden de magnitud del checkpoint almacenado, pero no se documentan requisitos de memoria.
- GPU recomendadas: no disponibles. La model card no especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el modelo se ejecuta a través del backend de Cellpose de spaCR, que admite GPU y CPU, pero no se detalla el reparto de memoria.
- Opciones de despliegue: `pip install spacr`; GUI con `spacr` (Model Zoo y Make masks); API de Python `spacr.model_zoo` y `spacr.core.preprocess_generate_masks`; el backend de generación de máscaras es Cellpose (`pathogen: "cellpose"`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de evaluación | F1 @ IoU 0,5 | AJI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (round 5) | Cellpose-SAM afinado | 5 pliegues, 619 pares | 0,8170 ± 0,036 | 0,7144 ± 0,107 | MIT | HuggingFace + Model Zoo de spaCR |
| Stock `cpsam_v2` (Cellpose-SAM sin ajuste) | Cellpose-SAM genérico | 11 pocillos internos | 0,7130 | 0,4260 | no disponible | Cellpose |
| Rondas anteriores (`Toxoplasma PV v1`, round 2) | Cellpose-SAM afinado | recogidas en `evaluation/baseline_scores.csv` | no disponible en esta ficha | no disponible en esta ficha | MIT | HuggingFace |

No hay datos comparativos publicados frente a alternativas generalistas de segmentación celular como Cellpose 3, StarDist o SAM 2, ni frente a otros modelos específicos de *Toxoplasma*. La única comparación cuantitativa documentada es la del baseline stock y las rondas previas del propio autor.

## Limitaciones y advertencias

- La precisión cae por encima de IoU 0,8: el modelo sirve para recuento y área, no para morfometría precisa de la vacuola.
- La varianza entre conjuntos de datos es real: el F1 oscila entre aproximadamente 0,74 y 0,93 según el cribado, por lo que un resultado global de 0,817 no garantiza ese rendimiento en un experimento nuevo.
- Entrenado únicamente con taquizoítos de las cepas RH y ME49; no se ha probado con otras cepas ni con bradizoítos.
- No se registró pérdida de validación, de modo que no existe curva de validación para inspeccionar el sobreajuste; la única evidencia al respecto es la validación cruzada.
- No se documentan sesgos, número de parámetros, cuantizaciones ni hardware objetivo, lo que dificulta estimar costes de despliegue antes de probarlo.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero al derivar de `cpsam_v2` conviene revisar la licencia del modelo base de Cellpose-SAM antes de un despliegue comercial.
- Modelo de una sola tarea y sin capacidades de texto, agentes ni *tool calling*; no debe presentarse como un modelo de propósito general.
- La verificación por SHA-256 es responsabilidad del Model Zoo; si se descarga el checkpoint por otra vía, esa garantía de integridad no se aplica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/einarolafsson/toxoplasma-pv-segmentation-cpsam-r5
- spaCR en GitHub: https://github.com/EinarOlafsson/spacr
- Incidencias y preguntas: https://github.com/EinarOlafsson/spacr/issues
- Curva de entrenamiento: https://huggingface.co/einarolafsson/toxoplasma-pv-segmentation-cpsam-r5/resolve/main/training/curves.png
- API del Model Zoo: `spacr.model_zoo` — `catalogue()`, `install()`, `fetch()`, `verify()`
- API de generación de máscaras: `spacr.core.preprocess_generate_masks`, `spacr.spacr_cellpose.generate_masks_from_imgs`
- No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados devueltos correspondían a páginas genéricas de YouTube, sin relación con el modelo.
