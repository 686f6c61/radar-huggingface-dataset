# AIBAT-LMU/ecg-fm-athletes-ecgfm

## Resumen

ECG-FM fine-tuned on PhysioNet/CinC 2021 es un modelo de clasificación multietiqueta de electrocardiogramas (ECG) de 12 derivaciones, desarrollado por el grupo AIBAT-LMU (LMU Múnich) como parte de un estudio publicado en *npj Digital Medicine*. Se trata de un ajuste fino completo del modelo fundacional `wanglab/ecg-fm` sobre los datos de entrenamiento del PhysioNet/CinC Challenge 2021, con el objetivo de predecir 26 etiquetas diagnósticas simultáneas a partir de segmentos de 5 segundos muestreados a 500 Hz. El modelo se publica como pesos PyTorch (`state_dict`) y se acompaña de un repositorio de código que reproduce todos los resultados del artículo.

El interés principal del checkpoint no reside en su rendimiento sobre datos clínicos —donde alcanza un AUROC macro de 0,97 en el split de test de PhysioNet/CinC 2021— sino en que sirve como referencia para estudiar el *domain shift* hacia poblaciones de deportistas jóvenes. En la cohorte de atletas del estudio (n = 43), el AUROC cae a 0,80 y la sensibilidad a 0,36, lo que ilustra las dificultades de aplicar modelos entrenados con ECG clínicos de población general a cribados cardiológicos deportivos, donde hallazgos como la bradicardia sinusal o el bloqueo incompleto de rama derecha son frecuentes y a menudo fisiológicos.

El modelo se distribuye bajo licencia MIT, con pesos de 0,4 GB, y forma parte de un conjunto de tres checkpoints comparables (ECG-FM, HuBERT-ECG small y ECGFounder) publicados por el mismo grupo para el mismo estudio. No es un dispositivo médico y no está destinado a la toma de decisiones clínicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo fundacional ECG-FM de wanglab, ajustado como clasificador multietiqueta) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 5 segundos a 500 Hz, 12 derivaciones |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict`, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no aplica (entrada de senal ECG, no texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`best_model_ecgfm.pth`) |

## Arquitectura y entrenamiento

El modelo parte de `wanglab/ecg-fm` (revision `abf3d8c`, checkpoint `mimic_iv_ecg_physionet_pretrained.pt`), un modelo fundacional de ECG preentrenado sobre datos de MIMIC-IV ECG y PhysioNet. Sobre esa base se realiza un ajuste fino completo de todos los parámetros para una tarea de clasificación multietiqueta con 26 salidas (una logit por etiqueta, sigmoide para obtener probabilidades). La entrada son 12 derivaciones a 500 Hz en segmentos de 5 segundos, con estandarización z-score por derivación y sin filtrado.

El ajuste fino utiliza los datos de entrenamiento del PhysioNet/CinC Challenge 2021 (87.662 registros tras preprocesado, excluyendo los subconjuntos PTB y St. Petersburg INCART), divididos 80/10/10 con estratificación por etiqueta. Se emplea Adam (betas 0,9/0,98, eps 1e-8) con tasa de aprendizaje inicial 1e-6, `ReduceLROnPlateau` sobre AUROC de validación (paciencia 5, factor 0,2), `BCEWithLogitsLoss` con pesos de clase positiva, batch de 256, recorte de gradiente (norma 1,0) y precisión mixta automática. El entrenamiento se detuvo por *early stopping* (paciencia 10) tras 41 épocas; el checkpoint publicado es el de mayor AUROC de validación. No se fija semilla aleatoria, por lo que reejecutar el ajuste produce un modelo similar pero no idéntico.

## Capacidades

- Clasificación multietiqueta de ECG de 12 derivaciones en 26 categorías diagnósticas: fibrilación auricular (AF), *flutter* auricular (AFL), bloqueo de rama (BBB), bradicardia (Brady), bloqueos de rama izquierda y derecha completos e incompletos (CLBBB/LBBB, CRBBB/RBBB, IRBBB), bloqueo auriculoventricular de primer grado (IAVB), desviación izquierda y derecha del eje (LAD, RAD), hipertrofia auricular izquierda (LAnFB), intervalo PR prolongado (LPR), bajo voltaje (LQRSV), QT largo (LQT), ritmo sinusal normal (NSR), extrasístoles auriculares y ventriculares (PAC/SVPB, PVC/VPB), ondas Q patológicas (QAb), taquicardia sinusal (STach), alteraciones de la onda T (TAb, TInv), entre otras.
- Procesamiento de señal fisiológica: entrada numérica de series temporales multicanal, no texto.
- Inferencia por lotes con `BCEWithLogitsLoss` como criterio de entrenamiento; salida de logits por etiqueta.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador de señal, no un modelo generativo.
- No dispone de modo *thinking*, visión, audio ni generación de texto.

## Casos de uso

- Investigación en cribado cardiovascular de deportistas: el modelo sirve como referencia para cuantificar la degradación de rendimiento al pasar de ECG clínicos a ECG de atletas jóvenes, permitiendo estudiar qué etiquetas (p. ej. bradicardia sinusal, IRBBB) generan más falsos positivos por su carácter fisiológico en esta población.
- Comparación de modelos fundacionales de ECG: junto con HuBERT-ECG small y ECGFounder, permite evaluar de forma controlada qué arquitectura y preentrenamiento generalizan mejor a una tarea multietiqueta concreta y a una cohorte específica.
- Reproducibilidad de estudios: el repositorio asociado reproduce íntegramente los resultados del artículo, lo que facilita la validación independiente y la extensión a nuevos conjuntos de datos.
- Desarrollo de pipelines de preprocesado de ECG: el código de `scripts/01_preprocess.py` y el orden de salidas definido en el repositorio sirven como base para construir flujos de ingesta de señal (12 derivaciones, 500 Hz, 5 s, z-score por derivación).
- Docencia e investigación en *deep learning* aplicado a cardiología: el modelo es un ejemplo completo de ajuste fino de un modelo fundacional sobre un *benchmark* público (PhysioNet/CinC 2021) con métricas macro y análisis de *domain shift*.
- Análisis de calibración y umbrales: al usar un umbral fijo de 0,5 para métricas dependientes de umbral, el checkpoint permite estudiar el efecto de recalibrar umbrales por etiqueta en poblaciones distintas a la de entrenamiento.

## Benchmarks y rendimiento

Métricas macro promediadas, tal como se reportan en el artículo. Las métricas dependientes de umbral usan un umbral fijo de 0,5.

| Dataset | AUROC | AUPRC | Sensibilidad | Especificidad | F1 |
|---|---|---|---|---|---|
| PhysioNet/CinC 2021, split de test | 0,97 | 0,57 | 0,89 | 0,94 | 0,49 |
| CODE-15% (seis etiquetas compartidas) | 0,97 | 0,49 | 0,82 | 0,95 | 0,44 |
| Atletas LMU, n = 43 (IC 95%) | 0,80 (0,71–0,88) | 0,66 (0,48–0,82) | 0,36 (0,14–0,59) | 0,94 (0,88–0,98) | 0,30 (0,11–0,49) |

Los valores de PhysioNet/CinC 2021 se promedian sobre las etiquetas también evaluables en la cohorte de atletas. El rendimiento en atletas es inferior al de los datos clínicos de test, en particular en sensibilidad; el artículo incluye resultados por etiqueta y el análisis del *domain shift*.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ocupa 0,4 GB en disco y el modelo base ECG-FM es de tamaño moderado, por lo que la inferencia en FP32 o FP16 cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por el autor; por el tamaño del checkpoint, una GPU de consumo moderna (p. ej. RTX 3060 o superior) es suficiente para inferencia. No se han publicado requisitos oficiales.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del repo (0,4 GB); no se aportan cifras oficiales.
- Opciones de despliegue: PyTorch nativo con el repositorio `AIBAT-LMU/ecg-fm-athletes` (build del clasificador vía `ecgath.models.ecg_fm.build_classifier`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | AUROC en atletas (n=43) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ECG-FM (este checkpoint) | no disponible | 12 derivaciones, 500 Hz, 5 s | 0,80 (0,71–0,88) | MIT | Hugging Face (AIBAT-LMU) |
| HuBERT-ECG (small) | no disponible | 12 derivaciones (no detallado) | no disponible en la informacion proporcionada | no disponible | Hugging Face (AIBAT-LMU/ecg-fm-athletes-hubert-ecg-small) |
| ECGFounder | no disponible | 12 derivaciones (no detallado) | no disponible en la informacion proporcionada | no disponible | Hugging Face (AIBAT-LMU/ecg-fm-athletes-ecgfounder) |

Los tres checkpoints forman el conjunto comparativo del mismo estudio; los valores de rendimiento de HuBERT-ECG y ECGFounder no se detallan en la información proporcionada. El modelo base `wanglab/ecg-fm` es la referencia de preentrenamiento.

## Limitaciones y advertencias

- No es un dispositivo médico ni está destinado a la toma de decisiones clínicas; su uso previsto es la investigación en interpretación automatizada de ECG.
- Entrenado con ECG clínicos de población general, mayoritariamente de edad avanzada; el rendimiento cae en deportistas jóvenes, donde hallazgos como bradicardia sinusal o bloqueo incompleto de rama derecha son frecuentes y a menudo fisiológicos. La sensibilidad en atletas es especialmente baja (0,36).
- La cohorte de atletas evaluada es pequeña (43 deportistas varones de un solo centro), con intervalos de confianza amplios.
- No se usaron datos de atletas en el entrenamiento; el conjunto de datos de atletas no es público.
- Riesgo de falsos positivos y de mala calibración al aplicar umbrales fijos (0,5) en poblaciones distintas a la de entrenamiento.
- El script de entrenamiento no fija semilla aleatoria, por lo que la reproducibilidad exacta requiere usar los pesos publicados.
- El orden de las salidas viene definido por el preprocesado del repositorio; no debe asumirse el orden de la lista de etiquetas de la model card.
- Sesgos demográficos y de adquisición derivados de los datos de entrenamiento (PhysioNet/CinC 2021, con exclusión de PTB e INCART) no cuantificados en la información disponible.
- Licencia MIT, que permite uso comercial; sin embargo, las restricciones de uso clínico y la naturaleza de los datos de entrenamiento (CC BY 4.0) deben respetarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIBAT-LMU/ecg-fm-athletes-ecgfm
- Modelo base: https://huggingface.co/wanglab/ecg-fm
- Código del modelo base: https://github.com/bowang-lab/ECG-FM
- Repositorio del estudio: https://github.com/AIBAT-LMU/ecg-fm-athletes
- Checkpoint HuBERT-ECG (small): https://huggingface.co/AIBAT-LMU/ecg-fm-athletes-hubert-ecg-small
- Checkpoint ECGFounder: https://huggingface.co/AIBAT-LMU/ecg-fm-athletes-ecgfounder
- Artículo (npj Digital Medicine): https://doi.org/10.1038/s41746-026-03474-9
- Artículo del modelo base (JAMIA Open): https://doi.org/10.1093/jamiaopen/ooaf122
- Datos de entrenamiento (PhysioNet/CinC 2021): https://doi.org/10.13026/34va-7q14
