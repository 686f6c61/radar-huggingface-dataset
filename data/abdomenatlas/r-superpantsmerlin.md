# AbdomenAtlas/R-SuperPanTSMerlin

## Resumen

R-SuperPanTSMerlin es un modelo de segmentación de imágenes médicas en 3D desarrollado por el grupo AbdomenAtlas (Johns Hopkins University) para la segmentación de lesiones pancreáticas y estructuras abdominales en tomografías computarizadas (TC). A diferencia de un modelo de lenguaje, se trata de un modelo denso de segmentación volumétrica cuya arquitectura es MedFormer y que se distribuye como un checkpoint de PyTorch (`.pth`) dentro de un repositorio de 1,2 GB. El modelo predice 26 clases anatómicas, entre ellas `pancreatic_lesion`, `pancreas`, `pancreas_head`, `pancreas_body`, `pancreas_tail`, `liver`, `kidney_left`, `kidney_right`, `spleen`, `aorta` y `postcava`.

Su relevancia radica en la metodología de entrenamiento con la que fue construido: Report Supervision (R-Super), presentada en el artículo "Learning Segmentation from Radiology Reports" (MICCAI 2025, galardonado como Best Paper Award Runner-up entre 1.027 trabajos). R-Super aprende segmentación tumoral directamente a partir de informes radiológicos mediante nuevas funciones de pérdida, lo que reduce de forma drástica la necesidad de máscaras anotadas manualmente, un recurso muy costoso en imagen médica. El checkpoint se entrenó con datos públicos: 1,8K informes de lesión pancreática del conjunto Merlin (Stanford) y 0,9K máscaras de lesión pancreática del conjunto PanTS.

El modelo se enmarca en el trabajo "Scaling Artificial Intelligence for Multi-Tumor Early Detection with More Reports, Fewer Masks" (arXiv:2510.14803), orientado a la detección temprana multi-tumor. Su propósito práctico es servir como herramienta de segmentación e investigación en cáncer de páncreas, donde la delimitación precisa de la lesión condiciona el diagnóstico y la planificación terapéutica. El repositorio registra 0 descargas y 1 like en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MedFormer |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplicable (modelo de segmentación 3D; no procesa texto) |
| Tipos de cuantización | no disponible (se distribuye un checkpoint `.pth` en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`); el checkpoint publicado es `merlin_pancreas_pants_release/fold_0_latest.pth` |
| Modalidad de entrada | TC abdominal volumétrica en formato NIfTI (`.nii.gz`) |
| Número de clases de salida | 26 etiquetas anatómicas (incluye lesión pancreática) |
| Tamaño del repositorio | 1,2 GB |
| Metodología de entrenamiento | Report Supervision (R-Super) |
| Datos de entrenamiento | 1,8K informes de lesión pancreática (Merlin) + 0,9K máscaras de lesión pancreática (PanTS) |

Etiquetas de salida, en el orden definido por el modelo: `adrenal_gland_left`, `adrenal_gland_right`, `aorta`, `bladder`, `colon`, `common_bile_duct`, `duodenum`, `femur_left`, `femur_right`, `gall_bladder`, `kidney_left`, `kidney_right`, `liver`, `lung_left`, `lung_right`, `pancreas`, `pancreas_body`, `pancreas_head`, `pancreas_tail`, `pancreatic_lesion`, `postcava`, `prostate`, `spleen`, `stomach`, `superior_mesenteric_artery`, `veins`.

## Arquitectura y entrenamiento

La arquitectura es MedFormer, un modelo de segmentación 3D para imagen médica. La innovación principal no reside en la arquitectura, sino en la metodología de entrenamiento: Report Supervision (R-Super), que aprende segmentación tumoral directamente desde informes radiológicos mediante funciones de pérdida específicas, en lugar de depender exclusivamente de máscaras voxel a voxel. Esta aproximación permite explotar el volumen mucho mayor de informes clínicos disponibles frente al número limitado de anotaciones densas.

El checkpoint se entrenó con 1,8K informes de lesión pancreática del dataset Merlin y 0,9K máscaras de lesión pancreática de PanTS, ambos de acceso público. No se especifica en la información disponible el número total de tokens, la composición completa del dataset más allá de esas cifras, ni si se aplicaron etapas de RLHF o DPO (conceptos propios de modelos de lenguaje y no aplicables aquí). El código de entrenamiento e inferencia está publicado en el repositorio GitHub de R-Super, lo que permite reproducir el pipeline.

En inferencia, el script `predict_abdomenatlas.py` genera máscaras binarias de segmentación. Admite `--save_probabilities` para guardar probabilidades de todas las clases y `--save_probabilities_lesions` para guardar únicamente las probabilidades de las lesiones. La opción `--organ_mask_on_lesion` emplea las segmentaciones de órganos producidas por el propio modelo (no ground truth) para eliminar predicciones de tumor fuera del órgano correspondiente, un mecanismo de post-procesado que reduce falsos positivos extralesionales.

## Capacidades

- Segmentación volumétrica de 26 estructuras anatómicas abdominales y torácicas inferiores en TC, incluidas subregiones pancreáticas (`pancreas_head`, `pancreas_body`, `pancreas_tail`).
- Segmentación específica de lesión pancreática (`pancreatic_lesion`), que es la tarea central del modelo.
- Apartado de órganos en riesgo: hígado, riñones, bazo, estómago, duodeno, colon, vejiga, próstata, pulmones, glándulas suprarrenales, vasos (aorta, vena cava inferior, arteria mesentérica superior, venas), vía biliar común y fémures.
- Aprendizaje supervisado por informes: la metodología subyacente permite incorporar señal de informes radiológicos sin máscaras densas, lo que reduce el coste de anotación.
- Post-procesado anatómico: uso de las propias segmentaciones de órganos para restringir las predicciones de lesión y descartar detecciones fuera de órgano.
- Salida de probabilidades por clase, útil para umbralizar, calibrar o construir pipelines de radiomica.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión natural, tool calling, capacidades de agente ni modo de pensamiento: es un modelo puramente discriminativo de segmentación.
- Capacidades multilingües: no aplicable; no procesa lenguaje.

## Casos de uso

- Delimitación automática de lesiones pancreáticas en TC: el modelo genera la máscara de `pancreatic_lesion` y de las subregiones del páncreas, lo que permite medir volumen tumoral, eje mayor y ratios de afectación de forma reproducible en estudios longitudinales.
- Planificación de radioterapia abdominal: la segmentación simultánea de órganos en riesgo (hígado, riñones, intestino, vasos) y de la lesión facilita el contorneado de volúmenes de tratamiento y la estimación de dosis absorbida por órgano.
- Radiomica y análisis cuantitativo: al permitir `--save_probabilities`, las probabilidades por vóxel pueden alimentar pipelines de extracción de características (textura, forma, intensidad) para modelos predictivos de respuesta a tratamiento.
- Aceleración del etiquetado de datasets: las máscaras generadas pueden servir como preanotaciones que el radiólogo revisa y corrige, reduciendo el tiempo de anotación en la construcción de nuevos conjuntos pancreáticos.
- Investigación en aprendizaje débilmente supervisado: el checkpoint sirve como referencia reproducible para comparar la metodología R-Super frente a entrenamientos con supervisión densa clásica sobre los mismos datos (Merlin + PanTS).
- Integración en pipelines de investigación hospitalaria: al consumir NIfTI (`ct.nii.gz`) por carpeta de paciente y producir máscaras, encaja en flujos batch sobre PACS o almacenamiento de estudios, con estructura de directorios simple (`ID/ct.nii.gz`).
- Detección temprana multi-tumor en estudios poblacionales: en el contexto del artículo de escalado, el modelo aporta el componente de segmentación pancreática para cribados de gran volumen donde solo se dispone de informes y de un subconjunto con máscaras.
- Control de calidad anatómico: la opción `--organ_mask_on_lesion` permite filtrar predicciones de tumor fuera del órgano y usar la coherencia entre órganos como verificación automática de resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de métricas (Dice, IoU, sensibilidad, precisión) ni comparaciones numéricas con otros modelos para este checkpoint concreto. Como referencia cualitativa, la metodología R-Super obtuvo el premio Best Paper Award Runner-up en MICCAI 2025 (segundo de 1.027 trabajos), pero no se dispone de las cifras asociadas en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la información proporcionada. El repositorio pesa 1,2 GB, lo que da una cota inferior del tamaño del checkpoint, pero el consumo real de memoria depende de la resolución del volumen, del tamaño de parche y de si se emplea inferencia por ventana deslizante, parámetros que no se detallan.
- GPU recomendadas: no disponible. Los modelos de segmentación 3D de imagen médica con volúmenes de TC suelen requerir GPU con memoria dedicada (gama profesional o de centro de datos) cuando se procesan volúmenes completos; no obstante, el autor no especifica requisitos.
- Compatibilidad con GPU de consumo: no disponible. No se confirma si el modelo cabe o no en tarjetas de gama de consumo tipo RTX 4090 o inferiores.
- Opciones de despliegue: únicamente el script oficial de inferencia `predict_abdomenatlas.py` del repositorio github.com/MrGiovanni/R-Super, con entorno conda (Python 3.10) y las dependencias de `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime, herramientas orientadas a modelos de lenguaje o a grafos densos de otra naturaleza.
- Latencia y throughput: no disponible.
- Almacenamiento y preprocesado: se requiere descargar el repositorio de 1,2 GB con `hf download` y preparar los datos en carpetas por estudio con un archivo `ct.nii.gz` en cada una.

## Comparativa con modelos similares

No se proporciona en la información disponible ninguna comparación numérica ni ficha de modelos alternativos. A continuación se listan candidatos de la misma categoría (segmentación abdominal y pancreática en TC) señalando qué datos faltan, sin afirmar cifras no verificadas.

| Modelo | Arquitectura | Tarea | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| R-SuperPanTSMerlin | MedFormer | Segmentación de páncreas, lesión pancreática y 24 estructuras adicionales | no disponible | HuggingFace + GitHub oficial | no disponible |
| MedFormer | no disponible | Segmentación médica 3D genérica | no disponible | no disponible en esta búsqueda | no disponible |
| nnU-Net | no disponible | Segmentación médica 3D (baseline habitual en la literatura) | no disponible | no disponible en esta búsqueda | no disponible |
| TotalSegmentator | no disponible | Segmentación de estructuras anatómicas en TC | no disponible | no disponible en esta búsqueda | no disponible |

La búsqueda web realizada no devolvió resultados relevantes sobre modelos comparables: los enlaces recuperados corresponden al sitio de un editor de material educativo y no guardan relación con el modelo.

## Limitaciones y advertencias

- Ámbito restringido: el modelo segmenta anatomía abdominal y lesión pancreática en TC. No debe emplearse con otras modalidades (RM, PET, ecografía) ni con regiones anatómicas fuera de las 26 clases definidas.
- Licencia no declarada: la model card no especifica licencia. Sin una licencia explícita, el uso comercial queda en una situación jurídica indeterminada y requiere contactar con los autores antes de cualquier explotación en producción.
- Uso clínico: se trata de un artefacto de investigación. No se documenta certificación regulatoria (CE, FDA) ni validación prospectiva multicéntrica, por lo que no debe usarse como dispositivo médico ni como sustituto del criterio radiológico.
- Sesgos de datos: el entrenamiento se apoya en 1,8K informes de lesión pancreática (Merlin) y 0,9K máscaras (PanTS). No se detalla la distribución por sexo, edad, etnia, fabricante de escáner ni protocolo de adquisición, lo que impide evaluar el sesgo de dominio ni la generalización a otras poblaciones y equipos.
- Riesgo de error de segmentación: como cualquier modelo de segmentación, puede producir falsos positivos y falsos negativos, en particular en lesiones pequeñas, difusas o de bajo contraste. La opción `--organ_mask_on_lesion` mitiga predicciones fuera de órgano, pero no valida la corrección de la máscara dentro del órgano.
- Dependencia del preprocesado: el pipeline espera NIfTI en una estructura de directorios concreta y un archivo `ct.nii.gz` por estudio. Diferencias de espaciado, orientación o intensidad respecto a los datos de entrenamiento pueden degradar el resultado.
- Recuento de adopción bajo: 0 descargas y 1 like en el momento de la consulta, sin ecosistema de terceros ni informes independientes de validación.
- Idiomas: no disponible, y en la práctica irrelevante porque el modelo no procesa texto; los informes solo se usan durante el entrenamiento.
- Ausencia de métricas publicadas: no hay datos de Dice, IoU ni curvas ROC en la información disponible, lo que impide estimar el rendimiento esperado antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbdomenAtlas/R-SuperPanTSMerlin
- Código de entrenamiento e inferencia (R-Super): https://github.com/MrGiovanni/R-Super
- Artículo "Scaling Artificial Intelligence for Multi-Tumor Early Detection with More Reports, Fewer Masks": https://huggingface.co/papers/2510.14803
- Artículo "Learning Segmentation from Radiology Reports" (MICCAI 2025): https://huggingface.co/papers/2501.04678
- Versión Springer del artículo MICCAI 2025: https://link.springer.com/chapter/10.1007/978-3-032-04971-1_29
- Dataset PanTS: https://github.com/MrGiovanni/PanTS
- Página del proyecto PanTS: https://www.zongweiz.com/dataset
- Artículo PanTS (PDF): https://www.cs.jhu.edu/~zongwei/publication/li2025pants.pdf
- Dataset Merlin (Stanford AIMI): https://stanfordaimi.azurewebsites.net/datasets?domain=BODY
