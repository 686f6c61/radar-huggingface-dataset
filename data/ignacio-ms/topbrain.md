# ignacio-ms/topbrain

## Resumen

ToPBrain TA36 es un modelo de segmentación de imagen médica publicado por el usuario ignacio-ms en Hugging Face, orientado a la segmentación de las arterias cerebrales a partir de angiografía por tomografía computarizada (CTA) o angiografía por resonancia magnética (MRA/TOF). No es un modelo de lenguaje: es un sistema de segmentación multiclase que etiqueta 36 estructuras vasculares intracraneales, incluyendo la arteria basilar, segmentos de la carótida interna, arterias cerebrales medias, comunicantes y cerebelosas, entre otras.

Técnicamente se apoya en nnU-Net v2 con codificador ResEnc-L y emplea un conjunto (ensemble) de 5 pliegues por modalidad. Se distribuyen dos checkpoints independientes: uno para CT (`Dataset507_TopBrainTA36CT`, con dos canales de entrada) y otro para MR/TOF (`Dataset508_TopBrainTA36MR`, con un canal de entrada). El repositorio ocupa 4,1 GB y cada pliegue ocupa 410 MB tras eliminar el estado del optimizador y los artefactos de entrenamiento.

Su relevancia radica en ofrecer una segmentación anatómica fina (detalle por segmento, con lateralidad explícita R-/L-) lista para ejecutarse mediante una herramienta de inferencia dedicada, `topbrain-infer`, que aplica automáticamente el preprocesado. La licencia es de uso exclusivamente investigador (`topbrain-research-use`) y el modelo se declara explícitamente no apto para decisiones clínicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 con codificador ResEnc-L (segmentación 3D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | topbrain-research-use (license: other, uso solo investigador) |
| Formato de pesos | PyTorch `.pth` (checkpoints podados: `checkpoint_best.pth` para CT, `checkpoint_final.pth` para MR) |

## Arquitectura y entrenamiento

El modelo se basa en el framework nnU-Net v2, ampliamente utilizado en segmentación médica, con un codificador de tipo ResEnc-L y esquema de 5 pliegues por modalidad combinados en un ensemble. Los checkpoints distribuidos están reducidos a lo que la inferencia necesita (`network_weights`, `trainer_name`, `init_args['configuration']` e `inference_allowed_mirroring_axes`), lo que los reduce de 820 MB a 410 MB por pliegue. El autor indica que las predicciones resultantes son idénticas bit a bit a las de los checkpoints de entrenamiento, y que no se incluyen ni el estado del optimizador ni los registros de entrenamiento ni las salidas de validación por caso.

El preprocesado es obligatorio y no es recuperable a partir de los pesos. Para CT se emplean dos canales que corresponden al mismo volumen ventaneado dos veces: un canal `_0000` con ventana amplia de -100 a 1500 HU (recortada y reescalada a [0, 1]) y un canal `_0001` con ventana estrecha de 300 a 600 HU centrada en el lumen con contraste. Para MR/TOF se usa un único canal calculado con los percentiles 0,5 y 99,5 medidos por volumen y solo sobre vóxeles distintos de cero, ya que las unidades de MR son arbitrarias y TOF almacena el aire como 0. El autor advierte que alimentar unidades Hounsfield o unidades TOF sin procesar produce una segmentación errónea pero confiada, no un error. El test-time augmentation está desactivado (`inference_allowed_mirroring_axes` es `null`) porque las clases están lateralizadas y el espejado promediaría, por ejemplo, `R-ICA` con `L-ICA`. No se documentan en la información disponible detalles sobre el volumen de datos de entrenamiento, composición del dataset ni uso de RLHF/DPO (no aplicable aquí).

## Capacidades

- Segmentación multiclase de 36 estructuras arteriales cerebrales (clase 0 reservada para fondo), idéntica entre los modelos de CT y MR.
- Distinción anatómica detallada por segmento, con lateralidad del paciente explícita (prefijos `R-` y `L-`), y separación de la carótida interna en segmentos supraclinoideo (clases 4 y 6) e infraclinoideo (clases 35 y 36).
- Procesamiento de dos modalidades mediante checkpoints separados: CT (2 canales de entrada, ensemble de 5 pliegues) y MR/TOF (1 canal de entrada, ensemble de 5 pliegues).
- Clases cubiertas: arteria basilar (BA), segmentos P1-P2, P3-P4, M1-M2-M3, A1-A2-A3, comunicantes (Acom, Pcom), carótidas internas y sus segmentos, vertebrales, cerebelosas (SCA, AICA, PICA), coroideas anteriores (AChA) y oftálmicas (OA).
- Integración con la herramienta `topbrain-infer`, que aplica el preprocesado (ventaneado HU en CT, normalización por percentiles en MR) de forma automática.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, ya que no es un modelo generativo de texto.

## Casos de uso

- Investigación en neuroimagen vascular: obtención de máscaras arteriales etiquetadas por segmento para estudios poblacionales o análisis morfométricos retrospectivos sobre cohortes de angiografía.
- Extracción de características por segmento: uso de las 36 etiquetas para medir diámetros, longitudes o volúmenes por vaso y compararlos entre sujetos dentro de un estudio de investigación.
- Preprocesado de pipelines de análisis hemodinámico: generación de geometrías vasculares segmentadas que alimenten simulaciones de flujo (CFD) en entornos académicos.
- Comparación multimodal CT vs MR/TOF: al disponer de checkpoints independientes por modalidad, permite contrastar la segmentación obtenida en estudios con CTA frente a estudios con TOF en un mismo sujeto o protocolo de investigación.
- Construcción de datasets etiquetados: uso del modelo como anotador previo (con revisión humana obligatoria) para acelerar el etiquetado de grandes volúmenes en proyectos de investigación.
- Evaluación de métodos de segmentación vascular: empleo como línea base nnU-Net ResEnc-L con la que comparar arquitecturas alternativas sobre las mismas clases y modalidades.
- Docencia y formación en neuroanatomía vascular: visualización de segmentaciones etiquetadas por segmento como material didáctico no clínico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (Dice, IoU, sensibilidad por clase) ni comparaciones numéricas con otros métodos. El autor solo menciona de forma cualitativa que las clases distales y cerebelosas más raras son las menos fiables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no especifica tamaño de parche, resolución de entrenamiento ni requisitos de memoria, factores determinantes en la inferencia 3D de nnU-Net.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible, al no conocerse el tamaño de parche ni la resolución de entrada empleados en inferencia.
- Tamaño en disco: repositorio total de 4,1 GB; cada checkpoint de pliegue ocupa 410 MB (5 pliegues × 2 modalidades).
- Opciones de despliegue: la vía documentada es la herramienta `topbrain-infer` (`pip install git+https://github.com/USER/REPO` y ejecución mediante `topbrain-infer -i scan.nii.gz -o out/ --hf-repo ...`), que gestiona el preprocesado requerido. Al tratarse de nnU-Net v2, el framework subyacente también permite inferencia con las utilidades propias de nnU-Net, siempre que se replique exactamente el preprocesado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Como referencia de categoría, el propio modelo deriva del framework nnU-Net v2, por lo que su alternativa natural sería el nnU-Net v2 por defecto con codificador estándar, pero no se ofrecen cifras de parámetros, contexto ni rendimiento que permitan una comparación cuantitativa.

| Modelo | Arquitectura | Clases | Modalidades | Licencia | Rendimiento |
|---|---|---|---|---|---|
| ToPBrain TA36 | nnU-Net v2, ResEnc-L, ensemble 5 pliegues | 36 | CT y MR/TOF | topbrain-research-use | no disponible |
| nnU-Net v2 (por defecto) | nnU-Net v2 | configurable | configurable | Apache-2.0 (framework) | no disponible |
| Otros segmentadores vasculares cerebrales | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso exclusivamente investigador: la licencia `topbrain-research-use` restringe el uso comercial y cualquier aplicación clínica.
- No es un producto sanitario ni está destinado a la toma de decisiones clínicas; el propio autor lo indica de forma explícita.
- Sesgos de cohorte: el modelo se entrenó con cohortes de angiografía de investigación, por lo que su comportamiento en escáneres, protocolos de contraste, patologías o grupos de edad distintos a los de esas cohortes no está validado.
- Fiabilidad desigual por clase: las clases distales y cerebelosas más raras son las menos fiables, según el autor.
- Dependencia crítica del preprocesado: alimentar el modelo con unidades Hounsfield o unidades TOF sin procesar produce una segmentación errónea pero segura de sí misma, sin generar un error que alerte al usuario. Hay que respetar exactamente el ventaneado en CT y la normalización por percentiles en MR.
- Riesgo de alucinación equivalente en segmentación: pueden aparecer etiquetas vasculares plausibles pero incorrectas, especialmente en clases poco representadas. El autor recomienda inspeccionar siempre la salida antes de confiar en ella.
- Prohibición de espejado (TTA): la inferencia no debe aplicar mirroring, ya que las clases están lateralizadas y se promediarían estructuras derechas e izquierdas.
- Sin datos publicados de validación externa, métricas por clase ni evaluación en cohorts independientes.
- Los checkpoints distribuidos no incluyen estado del optimizador, registros de entrenamiento ni validaciones por caso, por lo que no permiten reanudar entrenamiento ni auditar el proceso.
- El enlace al repositorio de `topbrain-infer` aparece en la model card como marcador de posición (`https://github.com/USER/REPO`), por lo que la disponibilidad real de la herramienta debe verificarse.

## Enlaces

- Hugging Face: https://huggingface.co/ignacio-ms/topbrain
- Repositorio `topbrain-infer` (referenciado en la model card, enlace marcador de posición): https://github.com/USER/REPO
- nnU-Net v2 (framework base): no disponible en la información proporcionada
