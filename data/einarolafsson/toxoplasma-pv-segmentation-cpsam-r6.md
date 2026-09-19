# einarolafsson/toxoplasma-pv-segmentation-cpsam-r6

## Resumen

El modelo `einarolafsson/toxoplasma-pv-segmentation-cpsam-r6` es un modelo de segmentación de instancias especializado en vacuolas parasitóforas (PV) de *Toxoplasma gondii* en imágenes de microscopía. Lo desarrolla el usuario de Hugging Face einarolafsson y consiste en un reentrenamiento (ronda 6) de los pesos base `cpsam_v2` de Cellpose 4.2.1.1 sobre un conjunto curado de campos de imagen. Su propósito es sustituir la segmentación genérica de Cellpose-SAM por un modelo ajustado al dominio concreto de este parásito, mejorando de forma medible la calidad de las máscaras obtenidas.

La relevancia práctica del modelo está en su integración con spaCR, la herramienta del mismo autor para el procesamiento de placas de microscopía. Frente a los pesos de stock, la ronda 6 eleva el F1 a IoU 0,5 de 0,7648 a 0,8602 y el Dice de 0,6431 a 0,9059 sobre el conjunto de test fijo de 11 pocillos ancla, un conjunto que nunca se ha usado para entrenar en ninguna de las rondas. Incorpora además validación por época y validación cruzada de 5 folds agrupada por fuente, algo poco habitual en modelos de segmentación publicados en Hugging Face.

Se trata de un modelo de visión por computador, no de lenguaje: no procesa texto, no tiene ventana de contexto en tokens y no dispone de capacidades de generación, razonamiento o tool calling. El repositorio ocupa 1,2 GB e incluye, además de los pesos, los historiales de entrenamiento, las métricas de control de calidad y los resultados de la validación cruzada. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (`cpsam_v2`), segmentación de instancias basada en SAM; reentrenada con Cellpose 4.2.1.1 |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes; no procesa texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no especificado; el repositorio contiene el fichero `weights/cpsam_v2_toxo_r6` sin extensión declarada, cargable por Cellpose 4.2.1.1 |
| Tarea (*pipeline*) | image-segmentation |
| Entrada | Imágenes de microscopía; el canal de patógeno se selecciona por índice (en el ejemplo de uso, `pathogen_channel: 2`) |
| Salida | Máscaras de instancias de vacuolas parasitóforas |
| Tamaño del repositorio | 1,2 GB |
| Base de partida | `cpsam_v2` (Cellpose-SAM) |
| Entorno de entrenamiento | NVIDIA GeForce RTX 3090 Ti; cellpose 4.2.1.1; torch 2.10.0+cu128 |
| Descargas / *likes* | 0 / 0 |
| Fecha de creación | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Cellpose-SAM (`cpsam_v2`), el modelo de segmentación de instancias de Cellpose 4 basado en un *transformer* de tipo SAM. Sobre esa base se realiza un ajuste fino supervisado con Cellpose 4.2.1.1 durante 100 épocas. No se documentan en la información disponible ni el número total de tokens de imagen, ni la composición exacta del dataset más allá del recuento de campos y objetos, ni el uso de RLHF o DPO, que en cualquier caso no aplican a un modelo de segmentación.

Los datos de entrenamiento son 437 campos con 15.550 objetos, más 108 campos con 8.959 objetos reservados para validación por época (un fold de validación cruzada agrupado por fuente) y 11 campos con 683 objetos de test. Estos 11 campos de test corresponden a 11 pocillos ancla de búsqueda de arquitectura (NAS) que se han mantenido fijos y sin entrenar desde la ronda 1, lo que permite una comparación homogénea entre rondas. La asignación campo a campo está en `training/split.csv`. El mejor *loss* de validación (0,08640) se alcanzó en la época 20, mientras que el *loss* final de entrenamiento fue 0,0461 y el de validación final 0,12872, lo que indica un sobreajuste progresivo a partir de esa época. La innovación destacable no es arquitectónica sino metodológica: validación por época, conjunto de test fijo y validación cruzada de 5 folds agrupada por fuente (F1 0,8168 ± 0,028, AJI 0,7516, Dice 0,8424).

## Capacidades

- Segmentación de instancias de vacuolas parasitóforas de *Toxoplasma gondii* en imágenes de microscopía.
- Delimitación de objetos individuales (máscaras separadas por instancia), no solo segmentación semántica binaria.
- Mejora sustancial sobre los pesos de stock en el dominio objetivo: F1 0,8602 frente a 0,7648 y AJI 0,8026 frente a 0,505 en el conjunto de test.
- Integración directa con spaCR mediante la función `preprocess_generate_masks`, con selección del canal de patógeno.
- Procesamiento por lotes de placas completas de microscopía a través de spaCR.
- No dispone de *tool calling*, capacidades de agente, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo de razonamiento (*thinking*).
- No tiene capacidades multilingües: no procesa lenguaje natural.

## Casos de uso

- Cuantificación de carga parasitaria en placas de alto rendimiento: el modelo genera máscaras de vacuolas por pocillo, y spaCR agrega el recuento y las métricas morfológicas por condición experimental, lo que permite comparar tratamientos sin revisión manual campo a campo.
- *Screening* de compuestos antiparasitarios: al mejorar el F1 de 0,7648 a 0,8602 y el Dice de 0,6431 a 0,9059 sobre los pocillos ancla, reduce los falsos negativos que enmascaran compuestos activos con efecto sutil sobre la formación de vacuolas.
- Estudios de replicación y crecimiento de *T. gondii*: la segmentación por instancia permite seguir el número y el área de vacuolas por campo a lo largo de cinéticas temporales, con métricas consistentes entre rondas gracias al conjunto de test fijo.
- Fenotipado morfológico de vacuolas: las máscaras resultantes alimentan medidas de área, forma, solidez y distribución espacial para clasificar fenotipos inducidos por genética del huésped o del parásito.
- Análisis de co-localización y compartimentación: una vez segmentada la vacuola, el análisis de otros canales (por ejemplo, marcadores del huésped) se restringe al interior de la máscara, lo que evita mezclar señal de fondo con señal asociada al parásito.
- Reprocesamiento retroactivo de experimentos previos: al ser pesos de Cellpose cargables con la misma API, se puede volver a analizar placas antiguas con el modelo r6 y comparar los resultados con los obtenidos originalmente con los pesos de stock.
- *Pipelines* automatizados de imagen en *laboratorios húmedos*: la instalación vía pip o conda-forge de spaCR y la descarga de pesos con `hf_hub_download` permiten integrar el modelo en flujos por lotes sobre directorios de placas sin intervención manual.
- Control de calidad y auditoría metodológica: los ficheros `qc/comparison_vs_stock.csv` y `cv/` permiten replicar las métricas del artículo y auditar la variabilidad entre folds antes de adoptar el modelo en un estudio.

## Benchmarks y rendimiento

Resultados en el conjunto de test (11 pocillos ancla, nunca usados en entrenamiento), comparando los pesos de stock con la ronda 6:

| Métrica | stock `cpsam_v2` | r6 |
|---|---|---|
| F1 @ IoU 0,5 | 0,7648 | 0,8602 |
| Precisión | 0,7539 | 0,8468 |
| Recall | 0,7760 | 0,8741 |
| mAP | 0,3620 | 0,5061 |
| AJI | 0,5050 | 0,8026 |
| Dice | 0,6431 | 0,9059 |

Validación (fold de r6):

| Métrica | Valor |
|---|---|
| F1 | 0,8237 |
| AJI | 0,7927 |
| Dice | 0,8936 |

Validación cruzada de 5 folds (agrupada por fuente):

| Métrica | Valor |
|---|---|
| F1 | 0,8168 ± 0,028 |
| AJI | 0,7516 |
| Dice | 0,8424 |

Conjuntos de datos empleados:

| Conjunto | Campos | Objetos | Función |
|---|---|---|---|
| train | 437 | 15.550 | ajuste |
| validation | 108 | 8.959 | validación por época; un fold de validación cruzada agrupado por fuente |
| test | 11 | 683 | 11 pocillos ancla de NAS, nunca entrenados |

No se han publicado resultados de benchmarks en la información disponible para tareas ajenas a esta (MMLU, HumanEval, GSM8K u otras), ya que el modelo no es de lenguaje. No se dispone de comparaciones frente a otros modelos de segmentación distintos de los pesos de stock de Cellpose-SAM.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. El entrenamiento se realizó en una NVIDIA GeForce RTX 3090 Ti (24 GB), lo que confirma la viabilidad en GPU de consumo de gama alta; la inferencia de Cellpose-SAM suele requerir bastante menos memoria que el entrenamiento, pero no se publican cifras.
- GPU recomendadas: no especificadas por el autor. La RTX 3090 Ti es la única GPU documentada (uso en entrenamiento y, presumiblemente, en la generación de las métricas de control de calidad).
- GPU de consumo: no hay confirmación formal, pero el modelo es un ajuste fino de Cellpose-SAM, que se ejecuta habitualmente en GPU de consumo; la RTX 3090 Ti usada por el autor pertenece a esa categoría.
- CPU: no se documenta soporte ni rendimiento en CPU.
- Opciones de despliegue: Cellpose 4.2.1.1 con PyTorch 2.10.0+cu128; spaCR (instalable con `pip install spacr` o `conda install -c conda-forge spacr`); descarga de pesos con `huggingface_hub.hf_hub_download`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y *throughput*: no disponibles.
- Almacenamiento: el repositorio completo ocupa 1,2 GB, si bien los pesos por sí solos son una fracción de ese tamaño.

## Comparativa con modelos similares

| Modelo | Tipo | F1 @ IoU 0,5 (test) | Dice (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r6 (este modelo) | Ajuste fino de Cellpose-SAM para vacuolas PV de *Toxoplasma* | 0,8602 | 0,9059 | CC-BY-4.0 | Hugging Face, 0 descargas |
| stock `cpsam_v2` | Cellpose-SAM genérico (base del ajuste) | 0,7648 | 0,6431 | según Cellpose | Público, incluido en Cellpose 4 |
| rondas r1–r5 | Versiones anteriores del mismo ajuste | no disponible en la información proporcionada | no disponible | no disponible | no disponible |
| Otros segmentadores de microscopía (Cellpose cyto3, StarDist, etc.) | Segmentación de instancias generalista | no disponible | no disponible | no disponible | no disponible |

La única comparación cuantitativa publicada es contra los pesos de stock de Cellpose-SAM. La mejora es consistente en todas las métricas: +0,0954 en F1, +0,0929 en precisión, +0,0981 en recall, +0,1441 en mAP, +0,2976 en AJI y +0,2628 en Dice.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo está entrenado para vacuolas parasitóforas de *Toxoplasma gondii*. No hay evidencia de que generalice a otros patógenos, otras especies del género, otras líneas celulares o modalidades de microscopía distintas de las del conjunto de entrenamiento.
- Sesgo de adquisición: todos los datos provienen de las condiciones de captura del autor (canal de patógeno con índice 2, misma configuración de placa). Aplicarlo a canales, escalas o microscopios diferentes puede degradar el rendimiento de forma no cuantificada.
- Sobreajuste probable: el mejor *loss* de validación se alcanzó en la época 20 de 100, y el *loss* de validación final (0,12872) es un 49 % superior al mejor valor (0,08640). El repositorio publica `weights/cpsam_v2_toxo_r6` como "final weights"; no se aclara si corresponden al mejor *checkpoint* de validación o al de la última época, lo que conviene verificar antes de usarlos en producción.
- Test reducido: el conjunto de test son 11 campos y 683 objetos. Aunque es fijo y comparable entre rondas, su tamaño implica intervalos de confianza amplios en las métricas reportadas.
- Varianza entre folds: la validación cruzada de 5 folds da F1 0,8168 ± 0,028, lo que indica que en el peor fold el rendimiento puede caer por debajo de 0,79, sensiblemente por debajo del 0,8602 del test.
- Riesgo de falsos positivos/negativos: no hay un análisis publicado de errores por tipo (vacuolas fusionadas, objetos en el borde del campo, vacuolas pequeñas). Se recomienda revisión manual de una muestra antes de confiar en los recuentos en estudios cuantitativos.
- "Alucinación" en el sentido de los modelos de lenguaje no aplica; el riesgo equivalente es la producción de máscaras espurias en regiones sin objeto.
- Licencia: CC-BY-4.0 permite uso comercial, redistribución y obra derivada siempre que se atribuya la autoría. No hay cláusula de patentes ni restricción de uso, pero conviene revisar la licencia de los pesos base `cpsam_v2` de Cellpose, que puede imponer condiciones adicionales sobre el modelo derivado.
- Adopción nula: 0 descargas y 0 *likes* en el momento de la consulta; no hay validación independiente por terceros.
- Reproducibilidad: el entrenamiento depende de versiones concretas (cellpose 4.2.1.1, torch 2.10.0+cu128); cambios de versión podrían alterar los resultados.
- Idioma y texto: el modelo no procesa lenguaje, por lo que no procede evaluar sesgos lingüísticos, pero tampoco ofrece ninguna funcionalidad fuera del análisis de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/einarolafsson/toxoplasma-pv-segmentation-cpsam-r6
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/einarolafsson/toxoplasma-pv-segmentation-dataset
- Repositorio spaCR en GitHub: https://github.com/EinarOlafsson/spacr
- Paquete spaCR en PyPI: https://pypi.org/project/spacr/
- Paquete spaCR en conda-forge: https://anaconda.org/conda-forge/spacr
- Búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo. Las únicas referencias recuperadas corresponden a normativa estadounidense sobre financiación de autopistas (23 USC 149, 23 CFR 950.3), sin relación alguna con el modelo.
