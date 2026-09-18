# einarolafsson/toxoplasma-from-cellmask-cpsam

## Resumen

Toxoplasma from Cell Mask es un modelo de segmentación de imágenes entrenado para detectar vacuolas parasitóforas (PV) de *Toxoplasma gondii* utilizando **únicamente el canal de la célula huésped**, sin necesidad de una tinción específica del parásito. Es un modelo de tipo cross-channel: recibe la imagen de la célula huésped y predice dónde se encuentran los parásitos, lo que permite reutilizar canales de microscopía limitados o muestras históricas sin marcaje parasitario. Lo desarrolla el autor einarolafsson y se distribuye a través del Model Zoo del paquete spaCR, orientado al análisis de fenotipo espacial en cribados CRISPR y microscopía.

Técnicamente se trata de un ajuste fino (fine-tuning) de Cellpose-SAM, en concreto del checkpoint stock `cpsam_v2`, una arquitectura de segmentación de instancias basada en flujo con troncal tipo SAM. El modelo se entrena sobre 2567 campos de imagen y se evalúa sobre 463 campos retenidos, con un split agrupado por pocillo, abarcando tres líneas celulares huésped: HFF, HeLa y THP1. El checkpoint se almacena como `toxoplasma_from_cellmask_pv` y se identifica en el catálogo de spaCR con la clave `toxoplasma_from_cellmask_v1`.

La relevancia del modelo reside en su rendimiento sobre el baseline sin ajustar: frente a un F1 a IoU 0,5 de 0,0215 del `cpsam_v2` stock, este checkpoint alcanza 0,6058, con un AJI de 0,4939 y un Dice de 0,6096, manteniendo una brecha train-validación de solo +0,0028 al final del entrenamiento. El repositorio incluye el historial completo de épocas, el split por pocillo y el informe de evaluación, lo que facilita la reproducibilidad y el análisis crítico de los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (`cpsam_v2`), segmentación de instancias basada en flujo con troncal tipo SAM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un checkpoint de PyTorch; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoint de Cellpose (PyTorch, `net.state_dict()`); fichero `toxoplasma_from_cellmask_pv`; no se distribuye en safetensors ni GGUF |
| Tarea (pipeline) | `image-segmentation` |
| Libreria | `spacr` (backend Cellpose) |
| Objeto segmentado | vacuolas parasitóforas (PV) de *Toxoplasma gondii* |
| Canal de entrada | canal de máscara de la célula huésped (cross-channel; sin tinción específica del parásito) |
| Clave en el Model Zoo | `toxoplasma_from_cellmask_v1` |
| Checkpoint | `toxoplasma_from_cellmask_pv` |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |
| Verificacion de integridad | SHA-256 verificado por el Model Zoo de spaCR tras la descarga |
| Fecha de creacion / actualizacion | 2026-09-18 / 2026-09-18 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint stock `cpsam_v2` de Cellpose-SAM y se ajusta durante 100 épocas completas. El optimizador es AdamW con un learning rate de 1e-5, weight decay de 0,1 y batch size de 1. Los objetivos de entrenamiento son máscaras regeneradas a partir de PV (`masks_pv`), es decir, etiquetas de referencia automáticas, no anotaciones manuales. El conjunto de entrenamiento consta de 2567 campos y el conjunto retenido de 463 campos, repartidos en un split agrupado por pocillo documentado en `training/split_by_well.csv`, de modo que ningún pocillo aparece simultáneamente en entrenamiento y prueba. Las líneas celulares huésped cubiertas son HFF, HeLa y THP1.

Un detalle relevante de provenance: un corte de energía interrumpió la ejecución en la época 57 de 100. El entrenamiento se reanudó desde el checkpoint de la época 50, replicando exactamente el schedule de learning rate a partir del índice 50 (validado bit a bit contra los learning rates registrados de la ejecución interrumpida). Dado que Cellpose almacena únicamente `net.state_dict()`, los momentos de AdamW y el generador de números aleatorios de las aumentaciones se reiniciaron; según la model card, la pérdida de validación muestra que ambas ejecuciones vuelven a converger en dos épocas. Los dos historiales de épocas se conservan en el repositorio para trazabilidad completa.

## Capacidades

- Segmentación de instancias de vacuolas parasitóforas de *Toxoplasma gondii* a partir del canal de célula huésped, sin canal ni tinción específica del parásito.
- Inferencia cross-channel: la entrada es la imagen de la célula huésped y la salida es la máscara de parásitos predicha.
- Generalización a tres líneas celulares huésped (HFF, HeLa, THP1), con rendimiento desigual entre ellas.
- Generación de máscaras integrada en spaCR mediante `spacr.core.preprocess_generate_masks` y `spacr.spacr_cellpose.generate_masks_from_imgs`.
- Descarga y verificación de integridad automatizada del checkpoint a través de la API `spacr.model_zoo` (`catalogue()`, `install()`, `fetch()`, `verify()`).
- Uso desde interfaz gráfica: sección Model Zoo para descarga y sección Make masks para generación de máscaras seleccionando el modelo en el campo de Cellpose.
- Parametrización del diámetro de objeto (`pathogen_diameter`, 12 en el ejemplo de la model card).
- No dispone de tool calling, capacidades de agente, generación de texto, razonamiento, código ni visión general: es un modelo especializado de segmentación.
- No dispone de capacidades multilingües en sentido lingüístico.

## Casos de uso

- Cribado de alto rendimiento de compuestos anti-*Toxoplasma*: el modelo genera máscaras de vacuolas por campo de imagen, lo que permite contar PV por célula huésped y derivar métricas de carga parasitaria en placas completas, con la ventaja de no requerir un canal de tinción del parásito.
- Reanálisis de datasets históricos de microscopía: al funcionar solo con el canal de célula huésped, permite recuperar información de parásitos en adquisiciones donde no se guardó o no existía un canal específico de *Toxoplasma*.
- Fenotipado espacial en cribados CRISPR con spaCR: las máscaras de PV alimentan el análisis de fenotipo espacial del paquete, permitiendo relacionar perturbaciones genéticas con ocupación y área de parásitos por célula.
- Cuantificación de carga parasitaria comparada entre líneas celulares: el modelo informa de F1 y AJI por huésped, de modo que es posible usar los resultados en HFF (F1 0,5568) y HeLa (F1 0,7105) para comparaciones de infección entre líneas, tratando THP1 con cautela (F1 0,4652).
- Medición de ocupancia y área de vacuolas: la model card indica que el modelo es adecuado para conteo, ocupación y área más que para morfometría precisa, lo que encaja en ensayos de inhibición de replicación.
- Integración en pipelines automatizados de adquisición y análisis: la verificación SHA-256 del checkpoint por parte del Model Zoo permite desplegar el modelo en flujos de producción con control de integridad y detección de ficheros truncados o sustituidos.
- Análisis de imágenes con canales limitados: en configuraciones de microscopía donde solo se dispone de un canal (célula huésped), el modelo evita tener que repetir la adquisición con un marcaje parasitario adicional.
- Reproducción y auditoría de resultados: el repositorio incluye historial de épocas, configuración de ejecución, split por pocillo y métricas por imagen, lo que facilita replicar la evaluación de un experimento concreto.

## Benchmarks y rendimiento

Resultados comparados con el baseline stock sin ajustar, sobre un split retenido agrupado por pocillo (ningún pocillo aparece a la vez en entrenamiento y prueba), incluyendo campos sin parásitos, por lo que los falsos positivos se contabilizan.

| Modelo | Train (campos) | Train (objetos) | Test (campos) | Test (objetos) | CV | F1 @ IoU 0,5 | AJI | Dice | Perdida train final | Perdida val final | Val - train | Mejor epoca |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `cpsam_v2` stock (sin fine-tuning) | — | — | 463 | 6116 | — | 0,0215 | 0,0080 | 0,0201 | — | — | — | — |
| Este modelo | 2567 | no registrado | 463 | 6116 | no (split unico agrupado por pocillo) | 0,6058 | 0,4939 | 0,6096 | 0,0072 | 0,0099 | +0,0028 | 100 / 100 |

Desglose por línea celular huésped:

| Huesped | n | F1 | AJI |
|---|---|---|---|
| HFF | 159 | 0,5568 | 0,5649 |
| HeLa | 151 | 0,7105 | 0,5963 |
| THP1 | 153 | 0,4652 | 0,3191 |

Notas de interpretación aportadas por el autor: los objetos son objetos de referencia (ground truth); el número de objetos del conjunto de entrenamiento no se registró durante el entrenamiento y los conteos retenidos proceden del paquete de evaluación. La coincidencia entre las curvas de entrenamiento y validación se utiliza como comprobación de sobreajuste, y el autor señala que este modelo no muestra la firma típica de sobreajuste (validación al alza mientras el train sigue bajando).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible. La configuración de ejecución (`training/run_config.json`) registra versiones y GPU utilizadas en el entrenamiento, pero el modelo concreto de GPU no se detalla en la información disponible.
- Entrenamiento registrado: 100 épocas desde `cpsam_v2` stock, AdamW, lr 1e-5, weight decay 0,1, batch 1.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete `spacr` (`pip install spacr`), con backend Cellpose; interfaz gráfica de spaCR (Model Zoo y Make masks) y API de Python (`spacr.model_zoo`, `spacr.core.preprocess_generate_masks`, `spacr.spacr_cellpose.generate_masks_from_imgs`). No se documenta despliegue mediante vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.
- Verificación de integridad en el despliegue: SHA-256 del checkpoint comprobado por el Model Zoo de spaCR tras la descarga.
- Tamaño del repositorio: 1,2 GB, factor relevante para el espacio en disco de la máquina de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | F1 @ IoU 0,5 | AJI | Dice | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Toxoplasma from Cell Mask (este modelo) | Fine-tuning de Cellpose-SAM (`cpsam_v2`) sobre PV regeneradas | no disponible | Imagen de microscopía, canal de célula huésped; diámetro de ejemplo 12 | 0,6058 | 0,4939 | 0,6096 | MIT | HuggingFace + Model Zoo de spaCR |
| `cpsam_v2` stock (Cellpose-SAM sin ajustar) | Modelo base de segmentación general | no disponible | Imagen de microscopía | 0,0215 | 0,0080 | 0,0201 | no disponible en la informacion proporcionada | Checkpoint base de Cellpose-SAM |
| Otros modelos de segmentación de *Toxoplasma* | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El único comparable con cifras en la información disponible es el checkpoint stock `cpsam_v2`, que actúa como baseline y sobre el que se mide la mejora del ajuste. No se dispone de datos de otros segmentadores específicos de *Toxoplasma* ni de alternativas de la misma categoría para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- El split retenido se utiliza para la selección del checkpoint, por lo que constituye datos de validación y no un conjunto de prueba totalmente independiente.
- Los objetivos de entrenamiento son etiquetas de referencia automáticas (máscaras regeneradas a partir de PV), no ground truth dibujado a mano; esto puede introducir sesgos sistemáticos en las máscaras.
- THP1 es el huésped con peor rendimiento (F1 0,4652, AJI 0,3191), mientras que HeLa es el mejor (F1 0,7105); el uso en macrófagos THP1 requiere validación adicional.
- La precisión cae por encima de IoU 0,8: el modelo es adecuado para conteo, ocupación y área, pero no para morfometría precisa.
- El entrenamiento se interrumpió por un corte de energía en la época 57 de 100 y se reanudó desde la época 50 con reinicio de los momentos de AdamW y del RNG de aumentaciones; aunque el autor documenta convergencia en dos épocas, es un caveat de reproducibilidad a tener en cuenta.
- El número de objetos del conjunto de entrenamiento no se registró, lo que limita la trazabilidad completa del balance de clases.
- Licencia MIT: permite uso comercial, modificación y redistribución, manteniendo el aviso de copyright y de licencia. No se especifican restricciones adicionales en la información disponible.
- Riesgo de falsos positivos: la evaluación incluye campos sin parásitos precisamente porque los falsos positivos se contabilizan; en campos sin infección deben esperarse detecciones espurias.
- No es un modelo de lenguaje: no tiene capacidades de texto, tool calling, agentes ni multilingüismo; cualquier expectativa en ese sentido es inaplicable.
- Idiomas soportados y sesgos lingüísticos: no aplica por la naturaleza del modelo. No se documentan análisis de sesgo demográfico, de dominio ni de lote experimental.
- El paquete spaCR es el canal de distribución previsto; el uso fuera de esa librería o del backend Cellpose no está documentado.

## Enlaces

- HuggingFace: https://huggingface.co/einarolafsson/toxoplasma-from-cellmask-cpsam
- spaCR en GitHub: https://github.com/EinarOlafsson/spacr
- Incidencias y preguntas: https://github.com/EinarOlafsson/spacr/issues
- Curvas de entrenamiento (imagen en el repositorio): https://huggingface.co/einarolafsson/toxoplasma-from-cellmask-cpsam/resolve/main/training/curves.png
- API del Model Zoo de spaCR: `spacr.model_zoo` — `catalogue()`, `install()`, `fetch()`, `verify()`
- API de generación de máscaras: `spacr.core.preprocess_generate_masks` y `spacr.spacr_cellpose.generate_masks_from_imgs`
- Ficheros de entrenamiento y evaluacion citados en la model card: `training/epoch_history.csv`, `training/epoch_history_epochs1-57_interrupted.csv`, `training/loss_per_epoch.csv`, `training/run_config.json`, `training/split_by_well.csv`, `training/training_curves.png`, `evaluation/report.json`, `evaluation/metrics.csv`, `evaluation/best_perimage.csv`, `evaluation/comparison_vs_stock_summary.csv`, `evaluation/stock_cpsam_v2_summary.csv`
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a herramientas de medición de velocidad de conexión (Speedtest, Fast.com, Cloudflare) y no guardan relación con el modelo.
