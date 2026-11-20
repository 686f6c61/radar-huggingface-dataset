# ngaggion/ChronoRoot2-Arabidopsis

## Resumen

ChronoRoot2-Arabidopsis es un modelo de segmentación de imágenes basado en nnU-Net v2, especializado en la segmentación multiclase de raíces de *Arabidopsis thaliana* en imágenes 2D. Forma parte de la plataforma ChronoRoot 2.0, un sistema abierto de fenotipado temporal de plantas desarrollado por Nicolás Gaggion y un equipo multidisciplinar de investigadores en biología vegetal e imagen médica. El modelo resuelve la tarea de separar raíces y estructuras asociadas en imágenes de placas de cultivo, un paso previo imprescindible para el análisis automatizado del crecimiento radicular a lo largo del tiempo.

La relevancia del modelo reside en su integración en un pipeline de fenotipado temporal: las imágenes se capturan de forma periódica y el modelo produce segmentaciones que permiten reconstruir y cuantificar la arquitectura de la raíz. Esta versión sustituye los pesos anteriores de *Arabidopsis* y se entrenó con SCNP (Same Class Neighbor Penalization), una técnica de regularización topológica propuesta por Valverde et al. en CVPR 2026 que penaliza la asignación de píxeles vecinos a clases distintas, mejorando la coherencia topológica de las máscaras. SCNP se aplica únicamente durante el entrenamiento; el checkpoint publicado es un nnU-Net estándar.

El modelo está publicado en Hugging Face con licencia MIT, un tamaño de repositorio de 1,7 GB y el formato de pesos nativo de nnU-Net (`fold_0/checkpoint_final.pth`). Existe un modelo hermano, ChronoRoot2-MultiPlant, entrenado con imágenes de *Arabidopsis*, tomate y *Medicago*, orientado a escenarios con múltiples especies.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 (U-Net adaptativa con configuración automática de pipeline) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de segmentación de imágenes) |
| Tipos de cuantizacion | no disponible (pesos en `checkpoint_final.pth` de PyTorch) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth`), estructura nnU-Net (`fold_0/checkpoint_final.pth`) |

## Arquitectura y entrenamiento

El modelo es un nnU-Net v2, una arquitectura U-Net cuyo pipeline (preprocesado, configuración de red, aumentación de datos y postprocesado) se deriva automáticamente de las propiedades del dataset. La red opera sobre imágenes 2D y produce segmentación multiclase de estructuras de *Arabidopsis*. El checkpoint publicado corresponde al fold 0 de la validación cruzada de nnU-Net.

El entrenamiento se realizó sobre el dataset `ngaggion/ChronoRoot2` e incorporó SCNP (Same Class Neighbor Penalization), una pérdida que penaliza la asignación de clases distintas a píxeles vecinos con el objetivo de mejorar la precisión topológica de las máscaras. Según la model card, esta técnica se usa solo en entrenamiento y los resultados globales superan los de los pesos anteriores de *Arabidopsis*. No se especifican en la información disponible el número de imágenes de entrenamiento, la composición exacta del dataset ni detalles sobre aumentación o número de épicas.

## Capacidades

- Segmentación multiclase de imágenes 2D de raíces de *Arabidopsis thaliana*.
- Producción de máscaras con coherencia topológica mejorada gracias al entrenamiento con SCNP.
- Integración en el pipeline ChronoRoot 2.0 para fenotipado temporal (series de imágenes capturadas a intervalos horarios).
- Procesamiento por lotes de imágenes de placas de cultivo para análisis de crecimiento radicular.
- Compatible con el flujo de inferencia estándar de nnU-Net v2 (predicción con `nnUNetv2_predict`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente de visión.
- No dispone de modo de razonamiento explícito ni de salidas textuales.

## Casos de uso

- Fenotipado temporal de raíces: el modelo segmenta cada frame de una serie temporal capturada cada hora, permitiendo reconstruir la trayectoria de crecimiento de la raíz principal y laterales a lo largo de días o semanas. Es adecuado porque ChronoRoot 2.0 está diseñado precisamente para este flujo.
- Análisis de arquitectura radicular en estudios genéticos: comparación de mutantes o líneas transgénicas de *Arabidopsis* mediante métricas derivadas de las máscaras (longitud, número de raíces laterales, ángulos). La segmentación multiclase facilita separar estructuras.
- Cribado de fenotipos in vitro: procesamiento por lotes de imágenes de placas para cuantificar respuestas a tratamientos (hormonas, estrés hídrico, nutrientes) de forma reproducible y a escala.
- Investigación en biología vegetal asistida por IA: generación de datasets anotados y pseudoetiquetas a partir de los vídeos sin anotar disponibles en `UnsupervisedRootVideos`, reduciendo el coste de anotación manual.
- Docencia y formación en fenotipado: uso del modelo y del pipeline ChronoRoot como herramienta didáctica para enseñar segmentación semántica aplicada a imágenes biológicas.
- Reproducibilidad de experimentos: al ser un checkpoint nnU-Net estándar con licencia MIT, puede desplegarse en infraestructuras de laboratorio sin dependencias propietarias y compararse con los pesos anteriores.
- Integración en plataformas de imagen vegetal: conexión con herramientas de análisis morfológico (por ejemplo, esqueletización y seguimiento de raíces) que consumen las máscaras producidas por el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que los resultados globales son mejores que los de los pesos anteriores de *Arabidopsis*, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras concretas; al ser una U-Net 2D de nnU-Net, la huella es moderada, pero depende de la configuración de parche derivada del dataset y del tamaño de las imágenes de entrada.
- GPU recomendadas: no disponible. Por la naturaleza del modelo (U-Net 2D), es plausible su ejecución en GPU de consumo, pero no se confirma en la información proporcionada.
- ¿Cabe en consumer GPU?: no disponible de forma explícita.
- Opciones de despliegue: nnU-Net v2 (inferencia nativa con `nnUNetv2_predict`), integración en el repositorio ChronoRoot2. No se documentan exportaciones a ONNX, TensorRT ni otros runtimes.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChronoRoot2-Arabidopsis | nnU-Net v2 | Segmentación multiclase de *Arabidopsis* | Imágenes 2D | MIT | Hugging Face |
| ChronoRoot2-MultiPlant | nnU-Net v2 | Segmentación de *Arabidopsis*, tomate y *Medicago* | Imágenes 2D | no disponible en la información | Hugging Face (`ngaggion/ChronoRoot2-MultiPlant`) |
| Pesos anteriores de *Arabidopsis* (ChronoRoot) | nnU-Net (versión previa) | Segmentación de *Arabidopsis* | Imágenes 2D | no disponible en la información | Sustituidos por esta release |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: entrenado para *Arabidopsis*; el rendimiento en otras especies no está garantizado (para eso existe el modelo hermano MultiPlant).
- Dependencia de condiciones de captura: al ser un modelo de segmentación, la calidad de las máscaras depende de la iluminación, resolución y configuración de las imágenes de entrada; no se documentan robusteces frente a dominios distintos.
- Riesgo de errores topológicos: aunque SCNP mejora la coherencia topológica, pueden persistir fusiones o roturas en raíces finas o solapadas.
- Sin datos de sesgo: no se documentan sesgos ni evaluaciones de equidad; el modelo opera sobre imágenes biológicas, no sobre personas.
- Idiomas: no aplica; no procesa texto.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones de atribución y citación indicadas por los autores.
- Citación obligatoria: la model card solicita citar ChronoRoot 2.0 (GigaScience, 2026) y, en su caso, SCNP (CVPR 2026).
- Caveat de producción: el checkpoint es un fold 0 de nnU-Net; para uso crítico conviene validar sobre datos propios y considerar ensembles de folds.
- Tamaño del repositorio de 1,7 GB: requiere espacio de almacenamiento y descarga considerables para entornos con recursos limitados.

## Enlaces

- Hugging Face: https://huggingface.co/ngaggion/ChronoRoot2-Arabidopsis
- Modelo hermano MultiPlant: https://huggingface.co/ngaggion/ChronoRoot2-MultiPlant
- Dataset ChronoRoot2: https://huggingface.co/datasets/ngaggion/ChronoRoot2
- Vídeos sin anotar: https://huggingface.co/datasets/ngaggion/UnsupervisedRootVideos
- Web de ChronoRoot: https://chronoroot.github.io/
- Repositorio GitHub: https://github.com/ChronoRoot/ChronoRoot2
- Paper SCNP (arXiv): https://arxiv.org/abs/2603.18671
- Paper ChronoRoot 2.0 (DOI): https://doi.org/10.1093/gigascience/giag018
