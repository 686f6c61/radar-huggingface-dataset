# lst627/CARDIAC-FM

## Resumen

CARDIAC-FM es un modelo fundacional multimodal desarrollado por el equipo de Fumin Li y colaboradores (perfil HuggingFace `lst627`) para la predicción de riesgo cardiovascular a partir de electrocardiogramas de 12 derivaciones (ECG) y resonancia magnética cardíaca (MRI). El modelo aprende representaciones conjuntas de ambas modalidades mediante aprendizaje contrastivo (InfoNCE), combinando un encoder de MRI basado en el masked autoencoder CineMA y un encoder de ECG basado en ECG-FM. Está diseñado para extraer características (feature extraction) y ser fine-tuneado en tareas downstream como la predicción de fibrilación auricular (AF) e insuficiencia cardíaca (HF) a 5 años.

El modelo se entrenó en la cohorte UK Biobank (57.609 sujetos) y se validó externamente en las cohortes CHS y MESA. Su relevancia radica en que integra dos modalidades clínicas complementarias para mejorar la discriminación del riesgo cardiovascular frente a modelos unimodales, y en que su arquitectura permite combinar las representaciones aprendidas con scores de riesgo clínicos establecidos (CHARGE-AF, PREVENT-HF) mediante fusión tardía. El checkpoint principal (`stage1_cinema_m75.pth`) contiene los encoders alineados y las cabezas de proyección, listos para fine-tuning o extracción de características.

La arquitectura base es un ViT-base con `embed_dim` 768, 12 capas, 12 cabezas de atención, tamaño de imagen 224, 8 frames y un `view_encoder` convolucional con 3 cortes sagitales. El modelo se distribuye bajo licencia MIT, aunque los componentes de terceros (ECG-FM, CineMA, fairseq-signals) conservan sus propias licencias. No se incluye el backbone de ECG-FM, que debe obtenerse del repositorio upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-base (embed_dim 768, depth 12, heads 12, img_size 224, n_frames 8, view_encoder conv, n_sa_slices 3, mask ratio 0.75) con dos encoders (MRI y ECG) alineados por InfoNCE |
| Parametros totales | no disponible (el checkpoint principal incluye dos encoders y dos cabezas de proyección; el tamaño del repo es 26.1 GB con todos los checkpoints) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa secuencias de ECG y volúmenes de MRI, no texto) |
| Tipos de cuantizacion | no disponible (se distribuye en formato PyTorch `.pth`, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo multimodal clínico, no procesa lenguaje natural) |
| Licencia | MIT (componentes de terceros con licencias propias) |
| Formato de pesos | PyTorch `.pth` (checkpoints separados para stage 1 y modelos downstream) |

## Arquitectura y entrenamiento

CARDIAC-FM combina dos encoders preentrenados: un masked autoencoder CineMA para MRI cardíaco (preentrenado en UK Biobank) y un encoder ECG-FM para ECG de 12 derivaciones (preentrenado en MIMIC-IV y PhysioNet). Ambos se alinean mediante una pérdida contrastiva InfoNCE, con dos cabezas de proyección (`mri_projection` y `ecg_projection`) y un parámetro de temperatura aprendido. El checkpoint `stage1_cinema_m75.pth` contiene los cuatro submódulos (`mri_encoder.*`, `ecg_encoder.*`, `mri_projection.*`, `ecg_projection.*`) más la temperatura.

El entrenamiento se realizó en dos etapas: primero el encoder de MRI se preentrenó de forma autosupervisada con CineMA (mask ratio 0.75), y después se alineó contrastivamente con el encoder de ECG. Los modelos downstream (`downstream_m75/`) se fine-tunearon en UK Biobank para predicción de AF y HF a 5 años, en configuraciones ECG-only y ECG+MRI. El preprocesamiento de ECG requiere 12 derivaciones a 500 Hz con corrección de línea base; la MRI debe prepararse según las instrucciones del repositorio. No se menciona el uso de RLHF o DPO, al ser un modelo de representación y no generativo.

## Capacidades

- Extracción de características multimodales: genera representaciones conjuntas de ECG y MRI cardíaco, útiles para tareas de predicción de riesgo cardiovascular.
- Fine-tuning para tareas downstream: soporta entrenamiento adicional sobre los checkpoints fine-tuneados para nuevos outcomes o cohortes.
- Fusión con scores clínicos: permite combinar las representaciones del modelo con scores de riesgo establecidos (CHARGE-AF, PREVENT-HF) mediante fusión tardía, mejorando la discriminación.
- Predicción de fibrilación auricular (AF) e insuficiencia cardíaca (HF) a 5 años, tanto con ECG solo como con ECG+MRI.
- Inferencia sin entrenamiento adicional: el script `infer.py` permite usar los checkpoints fine-tuneados directamente para predicción.
- Validación externa: demostrada en las cohortes CHS y MESA, lo que indica cierta generalizabilidad a poblaciones más diversas y de mayor edad.

## Casos de uso

- Predicción de riesgo de fibrilación auricular a 5 años: el modelo fine-tuneado `af5_ecg_mri.pth` puede utilizarse en entornos de investigación clínica para estratificar pacientes con ECG y MRI disponibles, superando a modelos unimodales.
- Predicción de insuficiencia cardíaca a 5 años: el checkpoint `hf5_ecg_mri.pth` permite evaluar el riesgo de HF en poblaciones con datos multimodales, útil para estudios epidemiológicos.
- Extracción de características para estudios de asociación genética: las representaciones aprendidas pueden servir como fenotipos intermedios en análisis de GWAS o estudios de correlación con variables clínicas.
- Fine-tuning en cohortes locales: investigadores con acceso a datos propios pueden continuar el entrenamiento desde los checkpoints publicados para adaptar el modelo a poblaciones específicas, usando `--finetuned_ckpt`.
- Integración con scores clínicos en pipelines de investigación: la fusión tardía con CHARGE-AF o PREVENT-HF permite construir modelos de riesgo combinados que aprovechan información complementaria.
- Análisis de cohortes con datos limitados de MRI: la variante ECG-only (`af5_ecg.pth`, `hf5_ecg.pth`) permite aplicar el modelo cuando solo se dispone de ECG, manteniendo parte de la capacidad predictiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper en medRxiv indica que CARDIAC-FM supera consistentemente a los modelos unimodales en todas las cohortes evaluadas (UK Biobank, CHS y MESA), y que la incorporación de características de ECG junto con scores de riesgo clínicos produce ganancias aditivas en discriminación. Sin embargo, no se proporcionan métricas numéricas concretas (AUC, sensibilidad, especificidad) en la información accesible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación proporcionada.
- El modelo principal es un ViT-base (≈86M parámetros por encoder) más las cabezas de proyección; el checkpoint `stage1_cinema_m75.pth` probablemente ocupe entre 300 y 500 MB, aunque el repositorio completo pesa 26.1 GB por incluir todos los checkpoints.
- Para inferencia con un solo checkpoint, una GPU con 8-12 GB de VRAM (p. ej., RTX 3060, RTX 4070) debería ser suficiente, asumiendo un batch pequeño y resolución 224×224 con 8 frames.
- Para fine-tuning con batch mayor o datos completos, se recomienda una GPU con 16-24 GB (RTX 4090, A5000) o una A100/H100 en entornos de investigación.
- El despliegue se realiza mediante scripts de Python con PyTorch; no se mencionan integraciones con vLLM, llama.cpp u Ollama, al no ser un modelo generativo de texto.
- La latencia dependerá del hardware y del preprocesamiento; no se proporcionan estimaciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos multimodales comparables (ECG+MRI) en la información proporcionada. Los componentes base (ECG-FM y CineMA) son unimodales y no constituyen alternativas completas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Uso exclusivo para investigación: el modelo no es un dispositivo médico y no ha sido validado prospectivamente ni aprobado para toma de decisiones clínicas.
- Sesgo poblacional: desarrollado en UK Biobank, cuyos participantes son predominantemente de ascendencia europea y más sanos que la población general. La validación externa en CHS y MESA cubre cohortes más diversas y de mayor edad, pero el rendimiento en otras poblaciones no está verificado.
- Requisitos de preprocesamiento estrictos: el ECG debe estar en formato de 12 derivaciones, 500 Hz y con corrección de línea base; la MRI debe prepararse según las instrucciones del repositorio. Desviaciones pueden degradar el rendimiento.
- Dependencia de un checkpoint de terceros: el backbone ECG-FM no se redistribuye y debe obtenerse del repositorio upstream; sin él, no se puede construir la arquitectura completa.
- Riesgo de alucinación: no aplica directamente al ser un modelo de representación, pero las predicciones de riesgo pueden ser incorrectas en casos atípicos o con datos de baja calidad.
- Licencias de componentes: aunque el modelo se distribuye bajo MIT, ECG-FM, CineMA y fairseq-signals tienen licencias propias que deben respetarse.
- Sin soporte de cuantización: no se ofrecen versiones cuantizadas, lo que puede limitar el despliegue en entornos con restricciones de memoria.

## Enlaces

- HuggingFace: https://huggingface.co/lst627/CARDIAC-FM
- Paper (medRxiv): https://www.medrxiv.org/content/10.64898/2026.03.16.26348526v1
- Código (GitHub): https://github.com/lst627/CARDIAC-FM
- Repositorio ECG-FM (backbone requerido): https://github.com/bowang-lab/ECG-FM
- Repositorio CineMA (encoder MRI): https://github.com/mathpluscode/CineMA
