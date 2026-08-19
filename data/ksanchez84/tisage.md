# ksanchez84/TiSage

## Resumen

TiSage es un conjunto de checkpoints de segmentación semántica de tejidos en imágenes de heridas (úlceras), entrenados bajo el marco de aprendizaje semi-supervisado descrito en el artículo *TiSage: Tissue Segmentation with Multi-Scale Semantic Guidance*, seleccionado como Spotlight en el Eleventh ISIC Skin Image Analysis Workshop @ MICCAI 2026. El modelo combina un backbone DINOv2-Base con arquitectura DPT (Dense Prediction Transformer) y utiliza un modelo MedSigLIP congelado como guía semántica multi-escala en un esquema de maestro-alumno con EMA (Exponential Moving Average).

El repositorio incluye cuatro checkpoints: dos entrenados sobre el dataset LUTSeg (con 1/8 de las etiquetas) y dos sobre DFUTissue (con división fija de supervisión completa). Cada archivo contiene el estado del modelo alumno, el estado EMA, el optimizador, la época y metadatos de selección de validación. Está pensado exclusivamente para reproducción de resultados de investigación y exploración no clínica, no como dispositivo médico. La licencia es Apache 2.0, compatible con la redistribución de pesos derivados de DINOv2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2-Base DPT (Dense Prediction Transformer) |
| Parametros totales | no disponible (no se especifica en la documentación; el tamaño del repositorio es 3,5 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en formato .pth de PyTorch) |
| Idiomas soportados | no disponible (modelo de visión, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pth (contiene `model`, `model_ema`, estado del optimizador, época y metadatos) |

## Arquitectura y entrenamiento

La red de segmentación es un modelo DPT basado en DINOv2-Base. TiSage lo entrena en un marco de maestro-alumno con EMA, donde un profesor (teacher) genera pseudo-etiquetas y un alumno (student) aprende de ellas junto con las etiquetas disponibles. La guía semántica proviene de un modelo MedSigLIP congelado (google/medsiglip-448), cuyos parámetros no se incluyen en los checkpoints. Se utilizan cabezales previos específicos del dataset, pequeños y comprometidos en el repositorio de código.

El entrenamiento se realizó con configuraciones exactas, semillas y comandos documentados en el repositorio TiSage. Los checkpoints son las mejores instantáneas del alumno (best-student) e incluyen el estado EMA contemporáneo. Los números reportados en el artículo (Tabla 1) corresponden a valores best-EMA seleccionados durante el entrenamiento, por lo que un snapshot individual puede diferir de esos valores. El dataset LUTSeg se describe en el artículo *LUTSeg: A Longitudinal Multi-Expert Dataset for Ulcer Tissue Segmentation*.

## Capacidades

- Segmentación semántica de tejidos en imágenes de heridas (úlceras), distinguiendo clases como tejido de granulación, esfacelo, necrótico, etc. (las clases exactas dependen del dataset).
- Inferencia con o sin estado EMA (se puede seleccionar `model` o `model_ema` en el evaluador).
- Reproducción de resultados de investigación: los checkpoints permiten replicar las métricas de la Tabla 1 del artículo y la Figura 4.
- Soporte para evaluación con IoU y Dice por clase, así como medias sobre el conjunto de validación (30 imágenes en LUTSeg).
- Compatibilidad con el código de evaluación del repositorio TiSage, incluyendo modo `--check-only` para validar compatibilidad sin inferencia.

## Casos de uso

- Reproducción de resultados científicos: investigadores pueden descargar los checkpoints y ejecutar el evaluador para verificar las métricas reportadas en el artículo, comparando el rendimiento del alumno y del EMA.
- Investigación en segmentación de heridas: el modelo permite explorar la segmentación de tejidos en imágenes de úlceras con un enfoque semi-supervisado, útil para estudiar la transferencia a otros datasets o condiciones de adquisición.
- Desarrollo de pipelines de análisis de imágenes médicas: los checkpoints pueden integrarse en flujos de procesamiento para extraer máscaras de tejido en entornos de investigación no clínicos.
- Evaluación de métodos semi-supervisados: al incluir también checkpoints de UniMatch-V2, se puede comparar el rendimiento de TiSage con una línea base establecida en los mismos datos y configuraciones.
- Formación y docencia: el modelo y su código asociado sirven como ejemplo práctico de aprendizaje semi-supervisado con guía semántica multi-escala en visión médica.
- Análisis longitudinal de heridas: dado que LUTSeg es un dataset longitudinal, el modelo puede usarse para estudiar la evolución temporal de tejidos en imágenes de úlceras, siempre con fines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README menciona que los valores de la Tabla 1 del artículo son los mejores EMA seleccionados durante el entrenamiento, pero no se proporcionan cifras concretas en la model card ni en los resultados de búsqueda. Se recomienda consultar el repositorio de código para obtener las métricas exactas.

## Requisitos de hardware

- No se especifican requisitos oficiales en la documentación del modelo.
- Los checkpoints son de PyTorch y requieren una GPU CUDA para la evaluación (el evaluador indica "requires one CUDA GPU").
- Dado que el modelo es DINOv2-Base DPT, la inferencia típica requiere al menos 8-12 GB de VRAM en precisión FP32, dependiendo del tamaño de la imagen de entrada. Con cuantización o FP16 podría reducirse, pero no hay datos oficiales.
- El tamaño del repositorio es de 3,5 GB, lo que sugiere que cada checkpoint ocupa alrededor de 1-2 GB en disco.
- Para entrenamiento o fine-tuning, se necesitaría una GPU con mayor memoria (por ejemplo, A100 o RTX 4090), pero no hay especificaciones publicadas.
- Opciones de despliegue: el modelo se usa principalmente mediante el script `evaluate_checkpoint.py` del repositorio TiSage. No se mencionan integraciones con vLLM, Ollama u otros motores de inferencia, al ser un modelo de visión.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El repositorio incluye checkpoints de UniMatch-V2 como método de referencia, pero no se ofrecen comparativas externas con otros modelos de segmentación de tejidos. Se puede considerar que la comparativa principal es contra UniMatch-V2 en los mismos datasets y configuraciones, pero los resultados numéricos no están disponibles en la información recopilada.

## Limitaciones y advertencias

- El modelo no es un dispositivo médico y no debe utilizarse solo para diagnóstico o tratamiento de pacientes.
- Los resultados pueden no transferirse a otras poblaciones de pacientes, instituciones, cámaras, etiologías de heridas o condiciones de adquisición.
- El conjunto de validación de LUTSeg es disjunto por paciente, pero no existe un split de test público separado, lo que limita la comparación externa.
- Los checkpoints contienen parámetros derivados de DINOv2, por lo que la licencia Apache 2.0 se aplica a la redistribución, pero el código TiSage es MIT y los datasets tienen sus propios términos.
- MedSigLIP no está incluido en los checkpoints; se debe descargar por separado desde HuggingFace (google/medsiglip-448) y está sujeto a su propia licencia de acceso restringido.
- Los valores de la Tabla 1 del artículo pueden no coincidir exactamente con un checkpoint individual, ya que se seleccionaron los mejores EMA a lo largo del entrenamiento.
- No se proporcionan métricas de rendimiento detalladas (IoU/Dice) en la model card, por lo que se debe acudir al artículo o al repositorio para conocer el rendimiento real.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ksanchez84/TiSage
- Código TiSage (GitHub): https://github.com/carlosh93/TiSage
- Dataset LUTSeg (HuggingFace): https://huggingface.co/datasets/ksanchez84/LUTSeg
- Modelo MedSigLIP (gated): https://huggingface.co/google/medsiglip-448
- Perfil del autor en GitHub: https://github.com/ksanchez84
