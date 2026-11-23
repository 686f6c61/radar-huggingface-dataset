# AIBAT-LMU/ecg-fm-athletes-ecgfounder

## Resumen

ECG-FM-Athletes-ECGFounder es un checkpoint de ajuste fino del modelo fundacional de electrocardiografía ECGFounder, desarrollado por el grupo AIBAT de la Universidad Ludwig Maximilian de Múnich (LMU). El modelo resuelve una tarea de clasificación multietiqueta sobre 26 diagnósticos electrocardiográficos definidos según el PhysioNet/CinC Challenge 2021, partiendo de una señal de 12 derivaciones a 500 Hz en segmentos de 10 segundos. Su relevancia radica en que acompaña a un estudio publicado en *npj Digital Medicine* sobre el cribado cardiovascular en deportistas jóvenes, un dominio donde los modelos entrenados con población clínica general muestran una caída notable de sensibilidad.

El checkpoint se obtiene por ajuste fino completo de todos los parámetros de ECGFounder sobre 87.662 registros del conjunto de entrenamiento del PhysioNet/CinC 2021 (excluyendo los subconjuntos PTB y St. Petersburg INCART), con partición estratificada 80/10/10. El modelo base ECGFounder fue entrenado sobre más de 10 millones de ECG, por lo que este ajuste fino hereda representaciones de gran escala y las especializa en un vocabulario diagnóstico concreto de 26 etiquetas.

La ficha cubre un modelo de investigación, no un dispositivo médico. Su interés técnico está en servir como referencia reproducible para estudiar el desajuste de dominio entre población clínica y deportiva, y en ofrecer pesos abiertos bajo licencia MIT junto con el código de preprocesado y evaluación del artículo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal profunda para clasificación de ECG (base ECGFounder, `12_lead_ECGFounder.pth`); detalles internos de la arquitectura no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 12 derivaciones, 500 Hz, segmentos de 10 segundos |
| Tipos de cuantizacion | no disponible; pesos distribuidos en `state_dict` PyTorch de precisión nativa |
| Idiomas soportados | no aplica (modelo sobre señales, no texto) |
| Licencia | MIT (misma licencia que el modelo base) |
| Formato de pesos | PyTorch `state_dict` (`best_model_ecgfounder.pth`) |
| Tarea | Clasificación multietiqueta de 26 diagnósticos ECG |
| Etiquetas | AF, AFL, BBB, Brady, CLBBB\|LBBB, CRBBB\|RBBB, IAVB, IRBBB, LAD, LAnFB, LPR, LQRSV, LQT, NSIVCB, NSR, PAC\|SVPB, PR, PRWP, PVC\|VPB, QAb, RAD, SA, SB, STach, TAb, TInv |
| Entrada | 12 derivaciones, 500 Hz, 10 s, filtrado del pipeline original ECGFounder, estandarización z-score por derivación |
| Salida | Un logit por etiqueta; aplicar sigmoid para obtener probabilidades |
| Modelo base | PKUDigitalHealth/ECGFounder, revisión `d9b1793` |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino completo (todos los parámetros) del modelo fundacional ECGFounder, que fue construido sobre más de 10 millones de registros ECG. La información disponible no detalla la arquitectura interna del backbone (número de capas, dimensión de embeddings, mecanismo de atención), por lo que este dato debe consultarse en la publicación del modelo base (Li et al., *NEJM AI*, 2025). La cabeza de clasificación se reconstruye con `num_labels=26` mediante `models.ecg_founder.build_classifier`.

El entrenamiento se realizó sobre el conjunto de entrenamiento del PhysioNet/CinC Challenge 2021, con 87.662 registros tras el preprocesado y excluyendo los subconjuntos PTB y St. Petersburg INCART. La partición fue 80/10/10 estratificada por etiqueta. Se usó Adam (betas 0,9/0,999, eps 1e-8), tasa de aprendizaje 1e-4, weight decay 1e-5, `BCEWithLogitsLoss` con pesos de clase positiva, batch de 128 y `ReduceLROnPlateau` sobre AUROC de validación (paciencia 5, factor 0,1). El entrenamiento aplicó early stopping sobre AUROC de validación con paciencia 10; el mejor modelo se obtuvo en la época 18. No se fija semilla aleatoria, por lo que una reejecución produce un modelo similar pero no idéntico; los resultados del artículo se reproducen exactamente con estos pesos.

## Capacidades

- Clasificación multietiqueta de 26 diagnósticos ECG sobre señales de 12 derivaciones a 500 Hz y 10 segundos.
- Detección de arritmias: fibrilación auricular (AF), flutter auricular (AFL), taquicardia sinusal (STach), bradicardia (Brady), extrasístoles auriculares (PAC|SVPB) y ventriculares (PVC|VPB).
- Trastornos de conducción: bloqueos de rama izquierda y derecha (CLBBB|LBBB, CRBBB|RBBB), bloqueo incompleto de rama derecha (IRBBB), bloqueo auriculoventricular (IAVB), bloqueo fascicular anterior izquierdo (LAnFB), bloqueo incompleto de rama derecha no especificado (IRBBB) y bloqueo inespecífico (NSIVCB).
- Alteraciones del intervalo y del eje: prolongación del PR (LPR), del QT (LQT), desviación del eje a izquierda (LAD) y a derecha (RAD), patrón de PR corto (PR), onda P pulmonar (PRWP).
- Alteraciones de la repolarización y morfología: anomalías de QRS (QAb), cambios en la onda T (TAb, TInv), hipertrofia ventricular izquierda (LQRSV), ritmo sinusal normal (NSR) y otras categorías del challenge (SA, SB).
- Salida probabilística por etiqueta mediante sigmoid, apta para umbralización ajustable en pipelines de cribado.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto, visión o audio: es un modelo unimodal sobre señales ECG.

## Casos de uso

- Cribado cardiovascular en deportistas jóvenes: el modelo se aplica a ECG de reposo de atletas para generar probabilidades por etiqueta y priorizar revisiones cardiológicas. Es adecuado porque está entrenado con un vocabulario diagnóstico que incluye hallazgos frecuentes en deportistas (bradicardia sinusal, IRBBB), aunque el artículo documenta una caída de sensibilidad en este dominio.
- Investigación sobre desajuste de dominio en ECG: sirve como referencia reproducible para comparar el rendimiento de modelos fundacionales entre población clínica general y cohortes deportivas, usando el código del repositorio para replicar exactamente las métricas del artículo.
- Evaluación comparativa de modelos fundacionales ECG: junto con los checkpoints ECG-FM y HuBERT-ECG (small) del mismo grupo, permite ejecutar comparativas controladas sobre el mismo preprocesado y las mismas particiones.
- Detección automática de arritmias en registros de 12 derivaciones: útil en pipelines de investigación que necesiten etiquetar grandes volúmenes de ECG con 26 categorías y umbral configurable por etiqueta.
- Análisis retrospectivo de bases de datos clínicas: aplicación sobre conjuntos como PhysioNet/CinC 2021 o CODE-15% para estudiar la prevalencia de hallazgos y validar la transferibilidad del modelo entre cohortes.
- Docencia y formación en interpretación automática de ECG: el modelo y su código permiten ilustrar el comportamiento de un modelo fundacional ante hallazgos fisiológicos frente a patológicos, con métricas por etiqueta y análisis de sensibilidad.
- Desarrollo de prototipos de investigación en cardiología deportiva: base para experimentos de ajuste fino adicional o de calibración de umbrales sobre cohortes propias, siempre en contexto de investigación y no de decisión clínica.

## Benchmarks y rendimiento

Métricas macro-promediadas reportadas en el artículo. Las métricas dependientes de umbral usan un umbral fijo de 0,5.

| Dataset | AUROC | AUPRC | Sensibilidad | Especificidad | F1 |
|---|---|---|---|---|---|
| PhysioNet/CinC 2021, partición de test | 0,97 | 0,52 | 0,86 | 0,91 | 0,43 |
| CODE-15% (seis etiquetas compartidas) | 0,98 | 0,59 | 0,94 | 0,94 | 0,47 |
| LMU athletes, n = 43 (IC 95%) | 0,84 (0,74–0,92) | 0,72 (0,55–0,86) | 0,57 (0,33–0,81) | 0,94 (0,89–0,97) | 0,51 (0,28–0,74) |

Los valores de PhysioNet/CinC 2021 se promedian sobre las etiquetas también evaluables en la cohorte de deportistas. El rendimiento en deportistas es inferior al de los datos clínicos de test, especialmente en sensibilidad; el artículo analiza este desajuste de dominio y ofrece resultados por etiqueta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 0,1 GB y el checkpoint es un `state_dict` PyTorch, por lo que la huella en memoria es reducida y compatible con GPU de gama media, pero no se especifica una cifra exacta.
- GPU recomendadas: no disponibles; al tratarse de un modelo de señales de tamaño moderado, es probable que quepa en GPU consumer, aunque no se confirma en la documentación.
- Compatibilidad con GPU consumer: no confirmada explícitamente; el tamaño del repositorio sugiere que sí, pero debe verificarse con el código del repositorio.
- Opciones de despliegue: inferencia directa con PyTorch mediante el paquete `ecgath` del repositorio oficial (`models.ecg_founder.build_classifier` + `load_state_dict`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ECG-FM-Athletes-ECGFounder (este) | ECGFounder | Clasificación multietiqueta, 26 etiquetas | 12 derivaciones, 500 Hz, 10 s | MIT | Hugging Face (AIBAT-LMU) |
| ECG-FM-Athletes-ECG-FM | ECG-FM | Clasificación multietiqueta, mismas 26 etiquetas | 12 derivaciones, 500 Hz, 10 s | no disponible en la información proporcionada | Hugging Face (AIBAT-LMU) |
| ECG-FM-Athletes-HuBERT-ECG (small) | HuBERT-ECG (small) | Clasificación multietiqueta, mismas 26 etiquetas | 12 derivaciones, 500 Hz, 10 s | no disponible en la información proporcionada | Hugging Face (AIBAT-LMU) |
| ECGFounder (base) | — | Modelo fundacional ECG, múltiples tareas | 12 derivaciones | MIT (según el checkpoint derivado) | Hugging Face (PKUDigitalHealth) |

Los tres checkpoints de AIBAT-LMU comparten preprocesado, particiones y protocolo de evaluación, lo que permite una comparación directa; los resultados comparativos por modelo se detallan en el artículo citado, no en la información disponible.

## Limitaciones y advertencias

- No es un dispositivo médico ni está destinado a la toma de decisiones clínicas; su uso previsto es la investigación en interpretación automática de ECG.
- Entrenado con ECG clínicos de población general, mayoritariamente de edad avanzada; el rendimiento cae en deportistas jóvenes, donde hallazgos como la bradicardia sinusal o el bloqueo incompleto de rama derecha son frecuentes y a menudo fisiológicos. La sensibilidad en la cohorte de deportistas es del 0,57 (IC 95%: 0,33–0,81).
- La cohorte de evaluación de deportistas es pequeña (43 deportistas masculinos de un único centro) y los intervalos de confianza son amplios; los resultados no son necesariamente generalizables.
- No se usaron datos de deportistas en el entrenamiento y el conjunto de datos de deportistas no es público.
- El entrenamiento no fija semilla aleatoria, por lo que reejecutar el ajuste fino produce un modelo similar pero no idéntico.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación; el umbral por defecto de 0,5 puede no ser óptimo para todas las etiquetas ni cohortes.
- Licencia MIT, que permite uso comercial; sin embargo, la licencia no exime de las responsabilidades regulatorias si el modelo se integra en un producto sanitario.
- El orden de las salidas está definido por el preprocesado del repositorio; no debe inferirse del listado de etiquetas de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIBAT-LMU/ecg-fm-athletes-ecgfounder
- Repositorio de código y reproducción: https://github.com/AIBAT-LMU/ecg-fm-athletes
- Checkpoint ECG-FM: https://huggingface.co/AIBAT-LMU/ecg-fm-athletes-ecgfm
- Checkpoint HuBERT-ECG (small): https://huggingface.co/AIBAT-LMU/ecg-fm-athletes-hubert-ecg-small
- Modelo base ECGFounder: https://huggingface.co/PKUDigitalHealth/ECGFounder
- Código del modelo base: https://github.com/PKUDigitalHealth/ECGFounder
- Artículo (npj Digital Medicine): https://doi.org/10.1038/s41746-026-03474-9
- Artículo del modelo base (NEJM AI): https://doi.org/10.1056/aioa2401033
- Datos de entrenamiento (PhysioNet/CinC 2021): https://doi.org/10.13026/34va-7q14
