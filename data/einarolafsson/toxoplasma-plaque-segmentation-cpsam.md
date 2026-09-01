# einarolafsson/toxoplasma-plaque-segmentation-cpsam

## Resumen

El modelo `toxoplasma-plaque-segmentation-cpsam` es un ajuste fino (fine-tune) de Cellpose-SAM (`cpsam`) desarrollado por Einar Olafsson, investigador con intereses en parasitología y biología celular. Su propósito es segmentar de forma automática las placas de lisis formadas en células huésped durante ensayos de placa de *Toxoplasma gondii*, permitiendo contar y medir el área de dichas placas de manera objetiva y reproducible.

El modelo se integra en un flujo de trabajo de dos etapas: primero se utiliza un detector de pocillos basado en YOLO11 (`toxoplasma-plaque-well-detector-yolo11`) para recortar cada pocillo de una imagen de placa completa o multi-pocillo, y después este modelo segmenta las placas dentro de cada pocillo. En imágenes de un solo pocillo o de una sola placa, puede usarse de forma independiente.

La relevancia de este modelo radica en que mejora significativamente la sensibilidad (recall) frente a los métodos basados en umbralización clásica, que tendían a perder alrededor de un tercio de las placas. Al estar basado en Cellpose-SAM, hereda la capacidad de generalización del modelo base, pero adaptado específicamente a la morfología de las placas de *Toxoplasma*. El repositorio tiene un tamaño de 1,2 GB y la licencia es MIT, lo que facilita su uso comercial y académico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (cpsam) con backbone SAM-ViTL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin soporte de texto) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente .pt o safetensors, no especificado) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Cellpose-SAM (`cpsam`), la variante de Cellpose que utiliza el backbone SAM-ViTL (Segment Anything Model con ViT-Large) lanzada en abril de 2025. Cellpose-SAM está diseñado para segmentación celular generalista con capacidades de human-in-the-loop, y este fine-tune lo especializa en la detección de placas de lisis en ensayos de placa de *Toxoplasma gondii*.

No se han publicado detalles sobre el conjunto de datos de entrenamiento (número de imágenes, composición, aumentos, etc.) ni sobre el proceso de ajuste (épocas, hiperparámetros, estrategia de aumento). La model card menciona un proceso iterativo en tres rondas, donde la ronda 3 es la versión final publicada. Se observa una mejora progresiva en F1 frente a la ronda 1, lo que sugiere que se incorporaron datos adicionales o se refinó el entrenamiento en cada iteración. El entrenamiento se realizó sobre imágenes de brightfield y ensayos teñidos, lo que condiciona su dominio de aplicación.

## Capacidades

- Segmentación de instancias de placas de lisis en ensayos de placa de *Toxoplasma gondii*.
- Conteo automático de placas y medición de su área en píxeles.
- Funciona en imágenes de pocillos individuales o de placas completas cuando se combina con el detector de pocillos YOLO11.
- Compatible con el flujo de trabajo del software spaCR (módulo de Plaque Assay), que lo descarga automáticamente en el primer uso.
- Al estar basado en Cellpose-SAM, hereda la capacidad de segmentación celular generalista, aunque su especialización reduce su aplicabilidad fuera del dominio de placas de *Toxoplasma*.
- No soporta tool calling, agentes, ni procesamiento de texto o audio.

## Casos de uso

- **Conteo de placas en ensayos de placa de *Toxoplasma*:** el modelo segmenta cada placa y permite contar automáticamente el número de unidades formadoras de placa (UFP), sustituyendo al recuento manual, que es tedioso y subjetivo.
- **Medición de área de placa para estudios de virulencia:** el área de las placas es un indicador de la capacidad lítica del parásito. Con este modelo se puede medir el área en píxeles de forma consistente, y si se conoce el diámetro del pocillo, convertirla a unidades físicas (por ejemplo, mm²) para comparar entre experimentos.
- **Evaluación de fármacos antiparasitarios:** en ensayos de inhibición de crecimiento, se compara el número y tamaño de placas entre grupos tratados y control. El modelo proporciona métricas objetivas y repetibles, reduciendo la variabilidad interobservador.
- **Integración en pipelines de análisis de imágenes de alto contenido:** al combinarse con el detector de pocillos YOLO11, puede procesar automáticamente placas de 6, 12, 24 o 96 pocillos, generando resultados por pocillo sin intervención manual.
- **Control de calidad en laboratorios de diagnóstico:** en entornos donde se realizan ensayos de placa de forma rutinaria, el modelo puede actuar como un segundo lector automático, detectando placas que podrían pasarse por alto en la inspección visual.
- **Investigación en biología celular de la invasión de *Toxoplasma*:** el modelo permite cuantificar la formación de placas en experimentos con líneas celulares knockout o tratamientos que afectan la invasión, facilitando estudios mecanísticos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados, comparando la ronda 3 (versión final) con la ronda 1 (baseline inicial):

| Conjunto de evaluación | F1 (ronda 3) | Precisión (ronda 3) | Recall (ronda 3) | F1 (ronda 1) |
|---|---|---|---|---|
| NAS in-domain | **0.856** | 0.832 | 0.881 | 0.718 |
| Generalización sobre literatura | **0.834** | 0.858 | 0.811 | 0.755 |

Además, se indica que el baseline de literatura (probablemente un método clásico de umbralización) tenía una precisión de 0.939 y un recall de 0.631, es decir, perdía un tercio de las placas. La ronda 3 sacrifica algo de precisión (0.858) para elevar el recall a 0.811, lo cual es deseable en un ensayo de conteo: una placa no detectada es un dato perdido, mientras que una sobre-detección es visible en la distribución de tamaños y puede filtrarse.

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de visión especializado.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware para este modelo. Sin embargo, al tratarse de un modelo de segmentación basado en SAM-ViTL (Cellpose-SAM) y con un tamaño de repositorio de 1,2 GB, se puede estimar que:

- La inferencia en GPU es recomendable para obtener tiempos de procesamiento razonables en imágenes de tamaño completo. Una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 2070, o superior) debería ser suficiente para imágenes de pocillos individuales.
- Para procesar placas completas de 96 pocillos, puede ser necesario dividir la imagen en tiles o utilizar una GPU con mayor memoria (16 GB o más).
- Cellpose-SAM puede ejecutarse en CPU, pero la inferencia será significativamente más lenta, especialmente con imágenes grandes.
- El modelo se integra con la librería Cellpose, por lo que puede desplegarse mediante las herramientas estándar de Cellpose (línea de comandos, API de Python) o a través del software spaCR.
- No se dispone de datos de latencia o throughput específicos.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de segmentación de placas de *Toxoplasma* en la información proporcionada. El propio modelo se compara con su versión anterior (ronda 1) y con un baseline de literatura, pero no hay datos de otros modelos como Cellpose genérico, StarDist o U-Net aplicados a esta tarea. Por tanto, la comparativa se limita a los datos internos ya presentados en la sección de benchmarks.

## Limitaciones y advertencias

- **Dominio de entrenamiento:** el modelo fue entrenado exclusivamente con imágenes de brightfield y ensayos teñidos. Su rendimiento en otros tipos de contraste (fluorescencia, contraste de fase, etc.) no está garantizado y podría degradarse.
- **Comparabilidad del área:** el área de placa medida en píxeles no es comparable entre imágenes de diferentes microscopios o configuraciones. Para comparar áreas entre experimentos, es imprescindible convertir los píxeles a unidades físicas utilizando el diámetro del pocillo como referencia, tal como hace el módulo de spaCR.
- **Sobre-detección:** el modelo puede generar falsos positivos (objetos que no son placas). Aunque esto es preferible a los falsos negativos en un ensayo de conteo, los resultados deben revisarse visualmente o filtrarse por tamaño si se requiere alta precisión.
- **Sin soporte multilingüe:** al ser un modelo de visión, no procesa texto ni tiene capacidades lingüísticas.
- **Licencia MIT:** permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en aplicaciones clínicas o de diagnóstico.
- **Fecha de creación:** el modelo fue creado en agosto de 2026, por lo que es relativamente reciente y podría tener limitaciones no documentadas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam)
- [Detector de pocillos YOLO11](https://huggingface.co/einarolafsson/toxoplasma-plaque-well-detector-yolo11)
- [Documentación de modelos de Cellpose](https://cellpose.readthedocs.io/en/latest/models.html)
- [Repositorio de Cellpose en GitHub](https://github.com/MouseLand/cellpose)
- [Sitio web de Cellpose](http://www.cellpose.org/)
