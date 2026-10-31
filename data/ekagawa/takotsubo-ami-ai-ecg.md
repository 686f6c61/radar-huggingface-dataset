# ekagawa/takotsubo-ami-ai-ecg

## Resumen

Este repositorio distribuye tres modelos de clasificación de imágenes que distinguen entre síndrome de takotsubo (miocardiopatía de estrés) e infarto agudo de miocardio con elevación del segmento ST anterior (STEMI anterior) a partir de imágenes preparadas de electrocardiogramas (ECG) de 12 derivaciones. Fue desarrollado por Eisuke Kagawa (ORCID 0000-0002-5583-3152), del Hiroshima North Medical Center Asa Citizens Hospital (Japón), y aborda un problema clínico real: el diagnóstico diferencial entre ambas entidades, que comparten hallazgos electrocardiográficos pero requieren tratamientos radicalmente distintos.

El repositorio incluye los pesos de inferencia de tres arquitecturas distintas de visión por computador: un Vision Transformer (ViT), un ConvNeXtV2 y un MLP-Mixer. El software acompañante (v0.4.0) permite inferencia individual, inferencia en ensamble con media de logits sin ponderar y visualizaciones Grad-CAM opcionales para ViT y ConvNeXtV2. La salida es binaria, con el orden de clases `0 = tako` (takotsubo) y `1 = AMI` (STEMI anterior del grupo de comparación del estudio).

Se trata de un recurso de investigación médica, no de un producto clínico: la licencia de los pesos y la model card indican explícitamente que no hay garantía de validez clínica. Su relevancia radica en la aplicación de arquitecturas de visión modernas a imágenes de ECG y en la reproducibilidad del trabajo, con checksums verificados, archivo en Zenodo y preprint en medRxiv.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamble de tres modelos de clasificación de imágenes: ViT, ConvNeXtV2 y MLP-Mixer |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos originales en safetensors) |
| Idiomas soportados | no aplicable (clasificación de imágenes de ECG; documentación en inglés) |
| Licencia | takotsubo-ami-model-weight-terms (licencia específica para pesos; código bajo MIT) |
| Formato de pesos | safetensors (11 ficheros originales de la versión v0.2.0) |

## Arquitectura y entrenamiento

El sistema se compone de tres modelos independientes entrenados para la misma tarea de clasificación binaria sobre imágenes de ECG de 12 derivaciones previamente preparadas: un Vision Transformer, un ConvNeXtV2 (arquitectura convolucional modernizada) y un MLP-Mixer (arquitectura basada exclusivamente en perceptrones multicapa que procesa parches de imagen). La inferencia en ensamble combina los logits crudos de los tres modelos con pesos iguales, una estrategia de agregación simple que aprovecha la diversidad inductiva de las tres arquitecturas.

Los detalles del entrenamiento (número de imágenes, composición del dataset, aumentos de datos, hiperparámetros) no están incluidos en la model card del repositorio; el informe de investigación correspondiente está disponible como preprint en medRxiv (enlace en la sección de enlaces). Como innovaciones de usabilidad, el software acompañante ofrece Grad-CAM opcional para ViT y ConvNeXtV2 (visualización de las regiones de la imagen que influyen en la predicción) y modos de inferencia con distintas cargas de trabajo: "Paper", "No TTA" y "Custom", lo que sugiere el uso de test-time augmentation en el modo por defecto del artículo.

## Capacidades

- Clasificación binaria de imágenes de ECG de 12 derivaciones preparadas en dos clases: takotsubo (`0 = tako`) o STEMI anterior agudo (`1 = AMI`).
- Inferencia individual con cada uno de los tres modelos (ViT, ConvNeXtV2, MLP-Mixer).
- Inferencia en ensamble mediante promedio de logits crudos sin ponderar de los tres modelos.
- Visualizaciones Grad-CAM opcionales para los modelos ViT y ConvNeXtV2, útiles para interpretar qué zonas del ECG motivan la predicción.
- Modos de inferencia configurables (Paper, No TTA, Custom) con soporte de test-time augmentation.
- Entrada flexible en el notebook de Colab: ejemplo sintético, subida desde el ordenador o Google Drive.
- Selección automática de dispositivo (GPU preferente, con aviso antes de usar CPU).
- Verificación criptográfica de los pesos descargados (tamaños y SHA-256 esperados).

## Casos de uso

- Investigación en diagnóstico diferencial takotsubo/STEMI: los investigadores pueden replicar o extender el estudio del preprint usando los pesos verificados y el código archivado en Zenodo, comparando el rendimiento de las tres arquitecturas.
- Desarrollo de sistemas de apoyo al diagnóstico de ECG: el ensamble de logits y la inferencia por CLI permiten integrar el clasificador en pipelines de investigación de análisis electrocardiográfico automatizado.
- Estudios de interpretabilidad en imágenes médicas: el Grad-CAM de ViT y ConvNeXtV2 permite analizar qué regiones del ECG (ondas, segmentos ST) activan cada clase, útil para validar si el modelo aprende características clínicamente plausibles.
- Comparación de arquitecturas de visión sobre datos médicos: al incluir ViT, ConvNeXtV2 y MLP-Mixer con la misma tarea y datos, el repositorio sirve como banco de pruebas para comparar inductivas convolucionales frente a basadas en atención frente a basadas en MLP.
- Enseñanza de machine learning aplicado a medicina: el notebook de Colab con ejemplo sintético permite a estudiantes ejecutar inferencia completa sin instalación local ni GPU propia.
- Validación de reproducibilidad en IA médica: el procedimiento de descarga con SHA-256, los commits fijados y los archivos en Zenodo permiten auditar exactamente qué pesos y qué código produjeron un resultado dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al preprint de medRxiv para los resultados del estudio; no se incluyen métricas numéricas (sensibilidad, especificidad, AUC, exactitud) en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio completo es de 1,0 GB (11 ficheros de pesos), lo que sugiere modelos de visión de tamaño moderado, manejables en GPUs de consumo.
- GPU recomendadas: no disponible; el notebook de Colab selecciona automáticamente GPU si está disponible y advierte antes de usar CPU, por lo que cualquier GPU con soporte CUDA y suficiente memoria para modelos de visión estándar debería ser adecuada.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño total del repositorio (1,0 GB), aunque no se especifica explícitamente; la inferencia por CPU es posible con aviso previo.
- Opciones de despliegue: notebook de Google Colab (v0.4.0) con pesos verificados desde GitHub Releases o desde este repositorio de Hugging Face; inferencia por CLI con el código fuente acompañante (clonando la etiqueta v0.4.0, commit `6a16326b761c198c11776155102dc31d1308bfeb`); no se mencionan vLLM, Ollama ni TGI (no aplicables a modelos de clasificación de imágenes).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitecturas | Licencia | Disponibilidad |
|---|---|---|---|---|
| ekagawa/takotsubo-ami-ai-ecg | Takotsubo vs STEMI anterior (ECG-imagen) | ViT + ConvNeXtV2 + MLP-Mixer (ensamble) | takotsubo-ami-model-weight-terms (investigación) | Hugging Face, Zenodo, GitHub, Colab |
| Modelos de clasificación de ECG por 12 derivaciones en Hugging Face | Variada (arritmias, etc.) | Principalmente CNN 1D sobre señal, no imágenes | Variable | Variable |
| Vision Transformers genéricos (p. ej. ViT base preentrenados en ImageNet) | Clasificación de imágenes naturales | ViT | Apache 2.0 / otras | Ampliamente disponibles |

No se conocen repositorios públicos directamente comparables que aborden el mismo problema diagnóstico (takotsubo frente a STEMI anterior sobre imágenes de ECG) con pesos abiertos; la comparativa se limita por tanto a categorías vecinas. En cualquier caso, la especificidad clínica de este modelo y su licencia restringida a investigación lo diferencian de los modelos de visión de propósito general.

## Limitaciones y advertencias

- Uso exclusivo en investigación: la model card y la licencia de los pesos excluyen expresamente cualquier garantía de exactitud clínica, fiabilidad o aptitud para uso clínico; no debe usarse en decisiones de diagnóstico o tratamiento.
- Clases limitadas: la clase `AMI` corresponde únicamente al grupo de comparación de STEMI anterior agudo del estudio; el modelo no cubre otros tipos de infarto de miocardio ni otras patologías.
- Riesgo de error de clasificación: al tratarse de un problema diagnóstico difícil con solapamiento electrocardiográfico entre ambas entidades, las predicciones pueden ser incorrectas; no se publican métricas de rendimiento en el repositorio.
- Preprocesamiento necesario: los modelos esperan imágenes de ECG de 12 derivaciones "preparadas" según el formato del estudio; imágenes con otro formato o calidad pueden degradar el resultado.
- Licencia restrictiva: los pesos se rigen por la licencia específica takotsubo-ami-model-weight-terms, que debe revisarse antes de cualquier redistribución o uso; el código acompañante está bajo MIT.
- Sin garantía ni responsabilidad: los autores rechazan toda responsabilidad por reclamaciones, pérdidas o daños derivados del uso de los materiales, según las cláusulas de las licencias de código y pesos.
- Verificación de integridad: se recomienda usar el script de descarga verificada (SHA-256) y fijar el commit SHA completo de 40 caracteres en los registros de ejecución, ya que una rama como `main` puede cambiar con el tiempo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ekagawa/takotsubo-ami-ai-ecg
- Licencia de los pesos: https://huggingface.co/ekagawa/takotsubo-ami-ai-ecg/blob/main/weights/WEIGHTS_LICENSE.md
- Notebook de Colab (v0.4.0): https://colab.research.google.com/github/ekagawa007/takotsubo_ami_ai_ecg/blob/v0.4.0/examples/colab_inference.ipynb
- Código fuente en GitHub (v0.4.0): https://github.com/ekagawa007/takotsubo_ami_ai_ecg/tree/6a16326b761c198c11776155102dc31d1308bfeb
- Archivo del software en Zenodo (v0.4.0): https://doi.org/10.5281/zenodo.23763944
- Archivo de los pesos en Zenodo (v0.2.0): https://doi.org/10.5281/zenodo.23666262
- Preprint de investigación en medRxiv: https://doi.org/10.64898/2026.10.15.26365116
- ORCID del autor: https://orcid.org/0000-0002-5583-3152
