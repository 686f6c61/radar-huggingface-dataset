# fedeceri/cochlea-hair-cell-synapses-binary-segmentation-unet2d

## Resumen

El modelo `fedeceri/cochlea-hair-cell-synapses-binary-segmentation-unet2d` es una implementación de una U-Net 2D desarrollada con MONAI y PyTorch para la segmentación semántica binaria de células ciliadas internas cocleares en imágenes de microscopía de fluorescencia de dos fotones. Ha sido entrenado con imágenes de un solo canal en formato TIFF procedentes de experimentos in vivo en ratón, donde las células ciliadas están marcadas con el indicador de calcio GCaMP. El modelo genera una máscara binaria que distingue fondo (0) de célula ciliada (1), y opcionalmente puede producir etiquetas de instancia mediante watershed.

La relevancia de este modelo radica en que aborda un problema específico en neurociencia auditiva: la identificación automática de células ciliadas internas en imágenes de microscopía, superando en algunos aspectos a Cellpose, una herramienta de segmentación generalista, especialmente en la discriminación de células ciliadas internas frente a otras estructuras celulares como las células ciliadas externas o las células de soporte, y en imágenes con desenfoque típicas de registros in vivo. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial con atribución, aunque el autor indica que es para uso en investigación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 2D (implementación MONAI, definida en `config.yml`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (archivo `best_model_binary_v4_synaptic_hcs.pth`) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net 2D estándar implementada con MONAI, una librería de alto nivel para deep learning médico. La configuración exacta de la red (número de capas, filtros, etc.) se especifica en el archivo `config.yml` del repositorio, aunque no se detallan los hiperparámetros concretos en la model card. El modelo acepta como entrada una imagen TIFF de un solo canal (escala de grises) y produce una máscara binaria de la misma resolución espacial.

El entrenamiento se realizó sobre un dataset de microscopía de dos fotones adquirido para el estudio publicado en *Nature Communications* (De Faveri et al., 2024). Las imágenes contienen células ciliadas cocleares de ratón marcadas con GCaMP, y las máscaras de segmentación fueron generadas inicialmente con Cellpose y posteriormente revisadas manualmente en napari. No se indica el número total de imágenes ni el número de épocas, ni si se aplicaron técnicas de aumento de datos o regularización. El único métrica de validación reportada es un Dice de 0,787.

## Capacidades

- Segmentación binaria de células ciliadas internas en imágenes de microscopía de dos fotones.
- Generación de máscaras de instancia mediante postprocesado con watershed (etiquetas 0..N).
- Discriminación de células ciliadas internas frente a otras estructuras celulares (células ciliadas externas, células de soporte) mejor que Cellpose según el autor.
- Robustez relativa ante imágenes con desenfoque (condiciones in vivo).
- Procesamiento de imágenes TIFF de un solo canal; no requiere preprocesado adicional más allá de la carga del archivo.

## Casos de uso

- Análisis cuantitativo de poblaciones de células ciliadas internas en estudios de audición: el modelo permite contar y localizar células ciliadas en imágenes de microscopía, facilitando el estudio de la densidad celular en diferentes condiciones experimentales (por ejemplo, durante el desarrollo o tras daño acústico).
- Automatización de pipelines de análisis en neurociencia auditiva: al integrarse en scripts Python, puede reemplazar la segmentación manual en flujos de trabajo que procesan grandes volúmenes de imágenes, reduciendo tiempo y variabilidad inter-observador.
- Evaluación de la actividad neuronal mediante imágenes de calcio: dado que las imágenes son de GCaMP, la segmentación precisa de células ciliadas permite extraer series temporales de fluorescencia de cada célula para estudiar la actividad espontánea o evocada.
- Validación de algoritmos de segmentación en microscopía: el modelo puede servir como referencia para comparar con otros métodos (Cellpose, StarDist, etc.) en el dominio específico de las células ciliadas cocleares.
- Investigación sobre regeneración de células ciliadas: en estudios que buscan inducir la regeneración de células ciliadas, el modelo puede ayudar a cuantificar el número de células nuevas en imágenes de tejido tratado.
- Educación y divulgación: como ejemplo de aplicación de deep learning a un problema biológico concreto, puede utilizarse en cursos de análisis de imágenes biomédicas.

## Benchmarks y rendimiento

El único dato de rendimiento reportado en la model card es:

| Métrica | Valor |
|---|---|
| Dice de validación | 0,787 |

No se proporcionan comparaciones cuantitativas con Cellpose u otros métodos en la información disponible. El autor afirma cualitativamente que el modelo supera a Cellpose en la discriminación de células ciliadas internas frente a otras células y en imágenes con desenfoque, pero no se incluyen métricas numéricas de esa comparación.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware en la model card. Dado que se trata de una U-Net 2D para segmentación de imágenes de microscopía, el tamaño del modelo es probablemente modesto (típicamente decenas de millones de parámetros), por lo que podría ejecutarse en GPUs de consumo como una NVIDIA GTX 1080 o superior, o incluso en CPU para inferencia de una sola imagen. Sin embargo, estos datos no están confirmados. Las opciones de despliegue incluyen el script `infer_binary.py` proporcionado en el repositorio de GitHub, que carga el modelo y procesa archivos TIFF.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar directamente con otros modelos. La model card menciona a Cellpose como la herramienta utilizada para generar las máscaras de entrenamiento y afirma que el modelo propuesto mejora ciertos aspectos, pero sin métricas concretas. No se han identificado otros modelos específicos para segmentación de células ciliadas cocleares en la información disponible.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con imágenes de microscopía de dos fotones de células ciliadas de ratón marcadas con GCaMP. Su rendimiento en otras especies, modalidades de microscopía o marcadores fluorescentes no ha sido evaluado y probablemente sea inferior.
- El Dice de validación de 0,787 indica que la segmentación no es perfecta; puede haber errores de sobre-segmentación o sub-segmentación en imágenes con baja relación señal-ruido o con células muy densas.
- La model card indica "Research use only" (solo para investigación), aunque la licencia Apache 2.0 permite uso comercial. Esta discrepancia debe tenerse en cuenta: el autor recomienda no usar el modelo en entornos clínicos o de diagnóstico.
- No se proporcionan detalles sobre el preprocesado de las imágenes de entrada (normalización, tamaño, etc.), por lo que puede ser necesario replicar las condiciones de entrenamiento para obtener resultados óptimos.
- El repositorio no incluye información sobre el tiempo de inferencia ni sobre el uso de memoria, lo que dificulta estimar los requisitos de hardware exactos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/fedeceri/cochlea-hair-cell-synapses-binary-segmentation-unet2d)
- [Repositorio de código en GitHub](https://github.com/fedeceri85/cochlea-hair-cell-binary-segmentation-unet2d)
- [Artículo científico asociado (Nature Communications, 2024)](https://www.nature.com/articles/s41467-024-55519-w)
