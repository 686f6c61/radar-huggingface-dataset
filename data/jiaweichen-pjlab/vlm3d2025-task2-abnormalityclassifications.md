# jiaweichen-pjlab/VLM3D2025-Task2-AbnormalityClassifications

## Resumen
VLM3D2025-Task2-AbnormalityClassifications es el modelo de clasificación final presentado por el equipo jiaweichen-pjlab para la pista de Multi-Abnormality Classification del reto VLM3D@MICCAI 2025. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un pipeline de clasificación de imágenes de tomografía computarizada (CT) compuesto por un ensamblado de tres checkpoints de una red ResEncUNet, precedido de una segmentación anatómica con TotalSegmentator y una extracción de siete regiones de interés (ROI). El repositorio pesa 3,1 GB e incluye tanto los pesos de los tres checkpoints como el checkpoint de TotalSegmentator necesario para la inferencia.

El modelo resuelve la tarea de detectar y clasificar múltiples anormalidades simultáneas en volúmenes CT de tórax y abdomen, un problema de etiquetado multietiqueta con clases desbalanceadas. Su relevancia es acotada pero clara: es una referencia reproducible y con licencia permisiva (CC BY 4.0) para el conjunto de datos CT-RATE, útil para investigadores que quieran replicar el resultado del reto o construir una línea base de clasificación multianormalidad sobre segmentación anatómica previa.

La información pública disponible es escasa: la model card no documenta arquitectura detallada, número de parámetros, contexto (no aplica, al no ser un modelo de lenguaje) ni datos de entrenamiento más allá de los checkpoints y del conjunto de evaluación. Todo dato no presente en la información proporcionada se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de 3 checkpoints de ResEncUNet (nnU-Net) para clasificación por ROI, con segmentación previa mediante TotalSegmentator |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en checkpoints de PyTorch; no se documentan variantes GGUF, AWQ ni similares) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC BY 4.0 (los pesos); TotalSegmentator y dependencias mantienen sus propias licencias |
| Formato de pesos | Checkpoints de PyTorch (`.ckpt`) de PyTorch Lightning, más checkpoint de TotalSegmentator incluido en el repo |

## Arquitectura y entrenamiento
El pipeline consta de tres etapas encadenadas. Primero se ejecuta TotalSegmentator (versión v2.0.1, dataset `Dataset665_Totalsegmentator_v201_Anatomy`) para segmentar anatomía y extraer siete ROIs del volumen CT. Después, cada uno de los tres checkpoints de ResEncUNet actúa como clasificador sobre las ROIs, enmascarando las clases responsables de cada región. Finalmente, las salidas sigmoides de los tres modelos se promedian para producir la predicción multietiqueta final.

Los tres checkpoints corresponden a los epochs 263 (`crop_resume`), 371 (`crop_cls_head`) y 92 (`crop_cls_head-f`), todos con `val_F1=0.00` en el nombre del fichero, un detalle que sugiere que el valor de validación en el nombre no refleja el rendimiento real del ensamblado. No se documentan en la información disponible el número de tokens ni volúmenes de entrenamiento, la composición del dataset de entrenamiento, ni si hubo ajuste fino con RLHF/DPO (no aplicable en este dominio). La innovación técnica destacable es el enfoque de clasificación guiada por anatomía: segmentar primero y clasificar por ROI con enmascarado de clases reduce el espacio de etiquetas por región y mitiga el desbalance extremo de clases.

## Capacidades
- Clasificación multietiqueta de anormalidades en volúmenes CT de tórax y abdomen (conjunto CT-RATE).
- Segmentación anatómica previa mediante TotalSegmentator, con extracción de siete ROIs.
- Enmascarado de clases por ROI: cada región solo puede activar las clases que le corresponden.
- Ensamblado por media de sigmoides de tres checkpoints para estabilizar la predicción.
- Procesamiento de imágenes médicas 3D (volúmenes CT), no de texto ni de imágenes 2D naturales.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No tiene capacidades multilingües ni modo de pensamiento (thinking mode).
- No procesa visión natural, audio ni vídeo.

## Casos de uso
- Investigación reproducible sobre CT-RATE: sirve como línea base pública para comparar nuevos clasificadores multianormalidad sobre el split `valid_fixed` de 3.039 casos, con métricas ya reportadas (Macro F1 0,6129).
- Etiquetado asistido de estudios CT: el pipeline puede preanotar anormalidades en grandes volúmenes de estudios para su revisión posterior por radiólogos, reduciendo el coste de anotación manual.
- Filtrado y triaje de cohortes: dado un archivo de estudios CT, el modelo permite filtrar casos con presencia de determinadas anormalidades para construir subconjuntos de investigación o auditorías clínicas.
- Evaluación de robustez de segmentadores: al depender de TotalSegmentator, es útil para estudiar cómo los errores de segmentación anatómica propagan errores en la clasificación final.
- Docencia y formación en IA médica: el repositorio incluye el checkpoint de segmentación y el código de inferencia, lo que facilita montar prácticas sobre pipelines de clasificación 3D completos.
- Base para modelos multimodales: sus predicciones pueden usarse como señal estructurada para alinear informes radiológicos con imágenes en sistemas de visión-lenguaje médicos.
- Comparación de estrategias de ensamblado: los tres checkpoints con distintas fases de entrenamiento permiten estudiar el efecto del promediado de sigmoides frente a selección de un único modelo.

## Benchmarks y rendimiento
Evaluación local sobre CT-RATE `valid_fixed` (3.039 casos), según la model card. No son puntuaciones oficiales del reto.

| Metrica | Valor |
|---|---:|
| Macro F1 | 0,6129 |
| Micro F1 | 0,6363 |
| Macro precision | 0,5774 |
| Macro recall | 0,6578 |

No se han publicado en la información disponible resultados comparativos con otros modelos del reto ni benchmarks adicionales (MMLU, HumanEval, GSM8K no aplican a este dominio).

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 3,1 GB, pero el pico de memoria depende del tamaño de los volúmenes CT y del checkpoint de TotalSegmentator, que suele requerir varios GB adicionales.
- GPU recomendadas: no disponibles en la información proporcionada; por el tipo de carga (nnU-Net 3D) se recomienda una GPU con al menos 16-24 GB de VRAM para procesar volúmenes completos, aunque este dato no está confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada; probablemente ejecutable en RTX 3090/4090 con volúmenes recortados, pero no hay datos publicados.
- Opciones de despliegue: el autor indica usar la ruta de inferencia del repositorio de código (`code/classification/inference/`), configurando `CT_CLS_CKPT_DIR` y apuntando `nnUNet_results` al directorio de TotalSegmentator incluido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye comparaciones con otros modelos de clasificación de anormalidades en CT ni con otras soluciones presentadas al reto VLM3D@MICCAI 2025.

## Limitaciones y advertencias
- El modelo está especializado en CT de tórax y abdomen del dominio CT-RATE; no debe esperarse generalización a otras modalidades (RM, rayos X) ni a otras regiones anatómicas sin reentrenamiento.
- Depende críticamente de TotalSegmentator: errores en la segmentación anatómica se propagan directamente a la clasificación.
- Las métricas son locales y no oficiales del reto; el Macro F1 de 0,6129 deja margen considerable de mejora y no debe interpretarse como rendimiento clínico.
- Los nombres de los checkpoints incluyen `val_F1=0.00`, lo que puede confundir sobre el rendimiento real del ensamblado; conviene validar de forma independiente antes de cualquier uso.
- Riesgo de sesgo poblacional y de adquisición: el conjunto CT-RATE tiene una distribución concreta de pacientes y protocolos que puede no reflejar otras poblaciones.
- Riesgo de alucinación en el sentido de falsos positivos y falsos negativos en la clasificación; no es un sistema diagnóstico y no sustituye la lectura radiológica.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero TotalSegmentator y las dependencias mantienen sus propias licencias, que deben revisarse por separado.
- No se incluyen imágenes, informes ni identificadores de pacientes en el repositorio; cualquier uso requiere obtener CT-RATE por los cauces oficiales.
- No hay garantías de mantenimiento ni soporte por parte del autor; el repositorio tiene 0 descargas y 1 like en el momento de la consulta.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jiaweichen-pjlab/VLM3D2025-Task2-AbnormalityClassifications
- Reto VLM3D@MICCAI 2025: no disponible en la información proporcionada
- Repositorio de código de inferencia (`code/classification/inference/`): no disponible como URL en la información proporcionada
- TotalSegmentator: no disponible como URL en la información proporcionada
- CT-RATE: no disponible como URL en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
