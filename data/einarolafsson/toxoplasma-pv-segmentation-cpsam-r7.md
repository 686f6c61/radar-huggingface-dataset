# einarolafsson/toxoplasma-pv-segmentation-cpsam-r7

## Resumen

`einarolafsson/toxoplasma-pv-segmentation-cpsam-r7` es un modelo de segmentación de imágenes especializado en vacuolas parasitóforas (PV, *parasitophorous vacuole*) de *Toxoplasma gondii* en imágenes de microscopía. Lo desarrolla Einar Olafsson, biólogo e investigador en interacciones huésped-parásito, y consiste en un ajuste fino (*fine-tuning*) de los pesos stock `cpsam_v2` de Cellpose 4.2.1.1, es decir, sobre la arquitectura Cellpose-SAM. No es un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional.

El problema que resuelve es concreto y acotado: la segmentación automática y reproducible de vacuolas parasitóforas en placas de microscopía de alto rendimiento, una tarea donde los modelos genéricos de segmentación celular rinden de forma insuficiente. Según la model card, el ajuste fino eleva la F1 a IoU 0,5 de 0,7648 (stock `cpsam_v2`) a 0,8536 en 11 pocillos ancla, y de 0,4286 a 0,7482 en campos de placas nuevas no vistas durante el entrenamiento, lo que indica una mejora notable de la generalización entre placas.

El modelo se distribuye como un único archivo de pesos (`weights/cpsam_v2_toxo_r7`) dentro de un repositorio de 1,2 GB que además incluye historiales de entrenamiento, métricas de control de calidad (QC), validación cruzada de 5 pliegues y scripts de partición de datos. Está pensado para usarse junto con spaCR, la herramienta del mismo autor, y su relevancia actual radica en que es la ronda más reciente de una serie iterativa (r1 a r7) con máscaras verificadas manualmente, algo poco habitual en modelos de segmentación de microscopía publicados en HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (pesos base `cpsam_v2`, cellpose 4.2.1.1); ajuste fino para segmentación de instancias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible; no se documentan versiones cuantizadas (INT8/GGUF/etc.) |
| Idiomas soportados | no aplica (modelo de visión; no hay soporte de texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | checkpoint único en `weights/cpsam_v2_toxo_r7` (formato exacto no especificado en la model card; compatible con cellpose 4.2.1.1) |
| Tamaño del repositorio | 1,2 GB |
| Tarea (pipeline) | image-segmentation |
| Entorno de referencia | cellpose 4.2.1.1, torch 2.10.0+cu128 |
| GPU de entrenamiento | NVIDIA GeForce RTX 3090 Ti |
| Fecha de creación (según HuggingFace) | 2026-09-30 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de `cpsam_v2`, el checkpoint stock de Cellpose-SAM incluido en cellpose 4.2.1.1. Se trata, por tanto, de un modelo de segmentación de instancias basado en backbone tipo ViT (estilo SAM) con cabezas de flujo para predicción de máscaras, y no de un transformer generativo. La model card no detalla la arquitectura interna ni el número de parámetros del backbone; únicamente indica el pipeline (`image-segmentation`) y los pesos de partida. El ajuste fino se realizó durante 100 épocas, con la mejor pérdida de validación (0,07961408867721012) en la época 55.

Los datos de entrenamiento son 502 campos con 23 340 objetos anotados a mano, procedentes de 64 placas curadas más 438 del conjunto curado de la ronda r6. La validación usa 123 campos y 2670 objetos; el test, 11 campos y 683 objetos; y existe un conjunto adicional `plate_test` de 20 campos y 404 objetos. La asignación campo a campo está documentada en `training/split.csv` y el origen de cada campo en `training/fields.csv`. La model card afirma explícitamente que todas las máscaras de entrenamiento fueron revisadas a mano, y el repositorio incluye `training/epoch_history.csv` con pérdida, precisión por píxel, Dice, IoU y MCC por época, además de curvas de entrenamiento y un `report.json`. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna técnica de alineación (no aplica a un modelo de segmentación), ni innovaciones como decodificación especulativa.

## Capacidades

- Segmentación de instancias de vacuolas parasitóforas de *Toxoplasma gondii* a partir de un canal de tinción del parásito (anti-Toxoplasma-biotina, o DsRed en el lumen de la PV).
- Segmentación de imágenes de microscopía en formato de placa, pensada para procesado por lotes de campos individuales.
- Integración directa con spaCR mediante `preprocess_generate_masks`, indicando el canal del patógeno (`pathogen_channel`, por ejemplo 2) y el modelo personalizado.
- Salida de máscaras compatible con el ecosistema Cellpose (`custom_model`), lo que permite sustituir el modelo stock en flujos ya existentes de cellpose.
- Cuantificación de objetos por campo, lo que habilita recuentos y métricas derivadas (número de PV, área, intensidad) en pipelines posteriores de análisis.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, ni capacidades multilingües: es un modelo puramente visual y de una única tarea.
- Capacidad especial: no hay modo "thinking" ni multimodalidad de entrada/salida más allá de la propia imagen de microscopía.

## Casos de uso

- Cribado de compuestos anti-*Toxoplasma*: el modelo permite contar y medir vacuolas parasitóforas en cada pocillo de una placa de forma automática, de modo que la reducción del número o del tamaño de PV sirve como lectura fenotípica de la eficacia de un fármaco candidato.
- Análisis de imágenes de alto rendimiento en placas completas: con F1 de 0,7482 en campos de placas nuevas no vistas, es suficientemente robusto para procesar placas generadas después del entrenamiento sin reajustar el modelo, algo crítico cuando el volumen de imágenes excede la capacidad de anotación manual.
- Estudios de interacción huésped-parásito: la segmentación fiable de la PV permite medir reclutamiento de proteínas del huésped hacia la vacuola, ya que la máscara delimita la región de interés sobre la que aplicar análisis de colocalización con otros canales.
- Sustitución del modelo stock en pipelines Cellpose existentes: cualquier laboratorio que ya use cellpose 4.2.1.1 puede cargar estos pesos como `custom_model` y mejorar sus métricas sin cambiar de herramienta ni de formato de salida.
- Control de calidad y regeneración de datos de entrenamiento: al disponer de métricas por imagen en `qc/` y `comparison_vs_stock.csv`, el modelo se puede usar para detectar campos mal segmentados y priorizar qué imágenes necesitan reanotación manual en la siguiente ronda de curación.
- Reproducibilidad de estudios longitudinales: los pesos fijos y la partición documentada (`split.csv`, `fields.csv`) permiten volver a segmentar placas antiguas con un modelo estable y obtener resultados comparables entre análisis separados en el tiempo.
- Comparación de cepas o condiciones experimentales: aunque la model card de esta ronda no detalla las cepas, la ronda r5 del mismo autor documenta datos de las cepas RH y ME49, por lo que el enfoque es aplicable a la comparación de virulencia o de morfología de la vacuola entre aislados.
- Generación de máscaras a escala para entrenar modelos derivados: las 23 340 máscaras revisadas y las predicciones de alto rendimiento pueden servir como preanotación para futuros conjuntos de datos o para destilación a modelos más ligeros.

## Benchmarks y rendimiento

Resultados publicados en la model card para 11 pocillos ancla (presentes en todas las rondas desde r1):

| Modelo | F1 @ IoU 0,5 | Precision | Recall | mAP | AJI | Dice |
|---|---|---|---|---|---|---|
| stock `cpsam_v2` | 0,7648 | 0,7539 | 0,776 | 0,362 | 0,505 | 0,6431 |
| **r7** | 0,8536 | 0,8493 | 0,858 | 0,4921 | 0,7755 | 0,8905 |

Resultados en campos de placas nuevas no vistas (*held-out new-plate fields*):

| Modelo | F1 @ IoU 0,5 | Precision | Recall | mAP | AJI | Dice |
|---|---|---|---|---|---|---|
| stock `cpsam_v2` | 0,4286 | 0,4704 | 0,3936 | 0,2039 | 0,4344 | 0,6277 |
| **r7** | 0,7482 | 0,9081 | 0,6361 | 0,5531 | 0,8268 | 0,9073 |

Otras métricas reportadas:

| Conjunto / métrica | Valor |
|---|---|
| Pliegue de validación: F1 | 0,7885 |
| Pliegue de validación: AJI | 0,8092 |
| Validación cruzada de 5 pliegues: F1 | 0,8142 ± 0,0145 |
| Validación cruzada de 5 pliegues: AJI | 0,7588 |
| Validación cruzada de 5 pliegues: Dice | 0,8526 |
| Mejor pérdida de validación | 0,07961408867721012 (época 55) |
| Épocas de entrenamiento | 100 |

No se han publicado en la información disponible resultados de benchmarks estándar de visión (COCO, ADE20K, etc.) ni comparaciones con segmentadores genéricos distintos de Cellpose.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. El modelo se entrenó y evaluó en una NVIDIA GeForce RTX 3090 Ti (24 GB), lo que indica que la inferencia cabe holgadamente en GPU de consumo; una estimación orientativa no oficial de 4 a 8 GB en FP32 sobre teselas de 512×512 sería razonable, pero no está confirmada en la model card.
- GPU recomendadas: cualquier GPU con soporte CUDA y suficiente VRAM para el tamaño de tesela usado por Cellpose; la RTX 3090 Ti es la configuración de referencia documentada. Los pesos base `cpsam_v2` requieren cellpose 4.2.1.1 y torch 2.10.0+cu128 según el entorno declarado.
- GPU de consumo: sí, cabe en tarjetas de gama alta para consumidores (RTX 3090/4090 y equivalentes con 24 GB). No hay confirmación de funcionamiento en GPUs de gama media o baja ni en CPU con latencias aceptables.
- Opciones de despliegue: cellpose 4.2.1.1 (carga como `custom_model`), spaCR (`preprocess_generate_masks`), y cualquier entorno Python con torch 2.10.0+cu128. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | F1 @ IoU 0,5 (ancla) | F1 @ IoU 0,5 (placa nueva) | Licencia | Notas |
|---|---|---|---|---|---|---|
| **r7** (este modelo) | Cellpose-SAM ajustado, PV de *Toxoplasma* | 502 campos, 23 340 objetos | 0,8536 | 0,7482 | CC-BY-4.0 | 5-fold CV: F1 0,8142 ± 0,0145 |
| stock `cpsam_v2` | Cellpose-SAM genérico | no disponible | 0,7648 | 0,4286 | según Cellpose (no disponible en esta información) | Sin ajuste específico a PV |
| `toxoplasma-pv-segmentation-cpsam-r5` | Cellpose-SAM ajustado, ronda 5 | 556 imágenes curadas (RH y ME49, anti-Toxoplasma-biotina o DsRed) | no disponible | no disponible | no disponible | Ronda promovida anterior, con validación cruzada de 5 pliegues |
| `toxoplasma-pv-segmentation-cpsam` (ronda 2, "v1") | Cellpose-SAM ajustado, ronda 2 | 229 imágenes | no disponible | no disponible | no disponible | Superado por rondas posteriores; se mantiene por reproducibilidad |

La comparativa con las rondas r2 y r5 es cualitativa: la información disponible no incluye sus métricas numéricas. Frente a segmentadores celulares genéricos (Cellpose base, StarDist, SAM sin ajuste), la información disponible tampoco aporta resultados, por lo que la única comparación cuantitativa verificable es contra `cpsam_v2`.

## Limitaciones y advertencias

- Especialización extrema: el modelo segmenta exclusivamente vacuolas parasitóforas de *Toxoplasma gondii* a partir de una tinción concreta del parásito. No es un segmentador celular general ni debe usarse como tal.
- Sin adopción verificable: 0 descargas y 0 likes en el momento de redactar la ficha, por lo que no existe validación independiente por parte de terceros.
- Riesgo de falsos positivos y de fusión de objetos: en segmentación de instancias, el equivalente funcional a la alucinación son máscaras espurias o vacuolas adyacentes unidas en un único objeto. En placas nuevas, la precisión (0,9081) es muy superior al recall (0,6361), lo que indica que el modelo tiende a omitir objetos antes que a inventarlos; conviene verificar los falsos negativos.
- Brecha de generalización entre placas: la F1 cae de 0,8536 en los pocillos ancla a 0,7482 en placas nuevas. Cualquier despliegue sobre un microscopio, tinción o protocolo distinto requiere validación local previa.
- Conjunto de test muy pequeño: 11 campos y 683 objetos, con solo 20 campos adicionales en `plate_test`. Las métricas tienen una varianza potencialmente alta pese a la validación cruzada de 5 pliegues.
- Dependencia de versión: el modelo está entrenado y probado con cellpose 4.2.1.1 y torch 2.10.0+cu128. Cambios de versión en cellpose pueden afectar a la carga de pesos o a los resultados.
- Idiomas y sesgos demográficos: no aplican, ya que el modelo no procesa texto, personas ni datos tabulares; no hay datos de sesgo biológico publicados (por ejemplo, comportamiento diferencial por cepa, tipo celular huésped o condiciones de cultivo).
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribución al autor y a indicar si se han realizado modificaciones. No se documentan restricciones adicionales ni cláusulas de uso responsable más allá de la propia licencia.
- Restricciones de uso clínico: es un modelo de investigación en microscopía; no está validado para diagnóstico ni para decisiones clínicas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/einarolafsson/toxoplasma-pv-segmentation-cpsam-r7
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/einarolafsson/toxoplasma-pv-segmentation-dataset-r7
- Repositorio spaCR en GitHub: https://github.com/EinarOlafsson/spacr
- spaCR en PyPI: https://pypi.org/project/spacr/
- spaCR en conda-forge: https://anaconda.org/conda-forge/spacr
- Ronda anterior r5: https://huggingface.co/einarolafsson/toxoplasma-pv-segmentation-cpsam-r5
- Ronda 2 ("v1"): https://huggingface.co/einarolafsson/toxoplasma-pv-segmentation-cpsam
- Ficha de la ronda 2 en savrn: https://savrn.com/models/toxoplasma-pv-segmentation-cpsam
- Ficha de la ronda 5 en savrn: https://savrn.com/models/toxoplasma-pv-segmentation-cpsam-r5
- Perfil del autor en GitHub: https://github.com/EinarOlafsson/EinarOlafsson
