# instincts7Zz/my_Thyroid_infer

## Resumen

`my_Thyroid_infer` no es un modelo único, sino un repositorio de inferencia que agrupa ocho arquitecturas de visión por computador para el análisis automático de imágenes de ecografía tiroidea. Lo publica el usuario `instincts7Zz` en Hugging Face con un tamaño de repositorio de 21,4 GB (el autor indica aproximadamente 14,7 GB sin el directorio `datasets/`), e incluye tanto el código de inferencia como los pesos entrenados de cada modelo.

El proyecto cubre dos tareas clínicas principales: segmentación (de la glándula tiroides y de nódulos) y clasificación (binaria benigno/maligno y pentaclase TIRADS). Para ello combina modelos de segmentación como DINOv3-UNet, MedSAM2, MedSegX, TransUNet y UltraFedFM con clasificadores basados en BiomedCLIP, MedSigLIP, RepViT, LSNet y ResNet-50, además de dos componentes de tipo agente (SegAgent y ClsAgent) que usan un LLM local (GPT-OSS) para seleccionar o fusionar las salidas de los distintos modelos.

Su relevancia es de nicho: no compite como modelo de propósito general, sino como toolkit reproducible de investigación médica que empaqueta pesos, métricas unificadas (Dice, HD95, ECE, AUROC, AUPRC, F1 con intervalos de confianza bootstrap) y utilidades de preprocesado (ROI, alineación de máscaras, extracción de etiquetas). La información disponible no detalla parámetros, contexto ni datos de entrenamiento de cada submodelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogéneo: UNet con encoder DINOv3 ViT-S, SAM2 Hiera, SAM ViT-B, TransUNet (R50-ViT-B_16), MAE ViT-B, BiomedCLIP ViT, MedSigLIP-448, RepViT-M1.0, LSNet-T, ResNet-50 |
| Parametros totales | no disponible (varía por submodelo; no se publican cifras agregadas) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de visión; sin ventana de contexto textual especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la documentación está en chino; el modelo procesa imágenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (etiqueta del repositorio); pesos incluidos en el propio repo, junto con código Python |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia, sino que integra modelos preentrenados y ajustados para imagen médica. En segmentación se emplean DINOv3-UNet (UNet sobre encoder DINOv3 ViT-S), MedSAM2 (SAM2 con backbone Hiera y prompt de caja sobre la imagen completa), MedSegX (SAM ViT-B con soporte de caja GT o caja completa), TransUNet (híbrido CNN + Transformer, R50-ViT-B_16) y UltraFedFM (ViT-B preentrenado con MAE en esquema federado más decodificador UNet). En clasificación se usan encoders visuales tipo CLIP/SigLIP (BiomedCLIP, MedSigLIP-448), ViT-B de UltraFedFM, y CNN ligeras (RepViT-M1.0, LSNet-T, ResNet-50) con cabezas de clasificación binaria o TIRADS de cinco clases.

La documentación no especifica el número de tokens, la composición del dataset de entrenamiento ni si se aplicaron técnicas de RLHF/DPO (no procede en este dominio). Sí describe el pipeline de datos: recorte de ROI, alineación de máscaras y extracción de etiquetas mediante `my_ThyroidROI/newcode/prepare_data.py`, además de módulos unificados de métricas con intervalos de confianza bootstrap. Los componentes de tipo agente (SegAgent, ClsAgent) actúan como postproceso: un LLM local (GPT-OSS) elige la mejor máscara o predicción entre los modelos, o aplica fusión ponderada / soft voting; también admite conmutar a un LLM en la nube (por ejemplo, Qwen vía Alibaba Bailian).

## Capacidades

- Segmentación de la glándula tiroidea y de nódulos tiroideos en imágenes de ecografía 2D.
- Clasificación binaria benigno/maligno y clasificación TIRADS de cinco clases.
- Multitarea: DINOv3-UNet con cabeza de clasificación adicional.
- Selección y fusión de salidas multi-modelo mediante agentes basados en LLM (SegAgent, ClsAgent).
- Explicabilidad: SHAP para clasificación y GradCAM para segmentación (`infer_explain/`).
- Evaluación estandarizada: Dice, HD95, ECE para segmentación; AUROC, AUPRC, Accuracy, Precision, Recall y F1 para clasificación, con bootstrap CI95.
- Ejecución por lotes de todos los modelos (`run_all.py`, `run_all_extended.py`) y pipeline end-to-end con preprocesado (`pipeline.py`).
- Soporte de instalación offline (wheels locales o entorno conda-pack).
- No se documentan capacidades de generación de texto, tool calling ni razonamiento general: el LLM solo interviene como postprocesador de selección/fusión.

## Casos de uso

- Investigación en segmentación tiroidea: comparar cinco arquitecturas (DINOv3-UNet, MedSAM2, MedSegX, TransUNet, UltraFedFM) sobre el mismo conjunto de test con métricas unificadas (Dice, HD95, ECE), lo que facilita estudios comparativos reproducibles.
- Clasificación de malignidad en nódulos: usar los clasificadores (BiomedCLIP, MedSigLIP, RepViT, LSNet, ResNet-50) para obtener probabilidades benigno/maligno y agregarlas con ClsAgent mediante soft voting, reduciendo la varianza de un único modelo.
- Estratificación TIRADS: la cabeza de cinco clases permite asignar categorías de riesgo siguiendo el sistema TIRADS, útil en prototipos de triaje asistido.
- Auditoría de explicabilidad: generar mapas GradCAM sobre las segmentaciones y valores SHAP sobre las clasificaciones para revisar qué regiones de la imagen sustentan la predicción.
- Validación externa por lotes: el directorio `baseline_export/` y `run_all_extended.py` permiten ejecutar cohorts externas completas y exportar predicciones en CSV para análisis estadístico posterior.
- Despliegue en entornos sin conectividad: la instalación offline mediante wheels o conda-pack facilita ejecutar el toolkit en hospitales o servidores aislados.
- Docencia y prototipado: el pipeline `pipeline.py` automatiza ROI, alineación y etiquetado, sirviendo como base para experimentos con nuevos modelos de imagen médica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe los módulos de cálculo de métricas (Dice, HD95, ECE, AUROC, AUPRC, F1 con bootstrap CI95) pero no incluye cifras numéricas de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 21,4 GB (unos 14,7 GB sin `datasets/`), lo que incluye pesos de ocho modelos; la inferencia se ejecuta modelo a modelo, por lo que el pico de VRAM corresponde al submodelo más grande (probablemente MedSAM2/SAM2 Hiera o TransUNet).
- GPU recomendadas: no especificadas por el autor. Por el tipo de arquitecturas (ViT-B, SAM, UNet) se puede inferir que una GPU con 8-16 GB es suficiente para la mayoría de submodelos, pero es una estimación, no un dato publicado.
- GPU de consumo: no confirmado; no se indica compatibilidad explícita con RTX 4090 u otras tarjetas consumer.
- Despliegue: scripts Python propios (`run_all.py`, `pipeline.py`, `run_all_extended.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelos).
- Entorno: Python 3.11, PyTorch 2.4.1 y torchvision 0.19.1 con CUDA 11.8 según `unified_requirements.txt`; opción de instalación offline con wheels o conda-pack.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| my_Thyroid_infer (este repo) | Toolkit multi-modelo de segmentación y clasificación tiroidea | no disponible por submodelo | no aplica | no disponible | Hugging Face y ModelScope |
| MedSAM2 | Segmentación médica (SAM2 Hiera) | no disponible en la información | no aplica | no disponible | Incluido como submodelo |
| MedSegX | Segmentación médica (SAM ViT-B) | no disponible en la información | no aplica | no disponible | Incluido como submodelo |
| BiomedCLIP | Clasificación con encoder CLIP biomédico | no disponible en la información | no aplica | no disponible | Incluido como submodelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-turno; el LLM solo actúa como postprocesador de selección/fusión.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución de los pesos; es un riesgo relevante para producción.
- Documentación únicamente en chino: dificulta la adopción por equipos no sinófonos.
- Sin benchmarks publicados: no hay evidencia numérica de rendimiento frente a alternativas, lo que impide evaluar su calidad clínica.
- Dominio muy específico (ecografía tiroidea): no se espera generalización a otras modalidades de imagen sin reentrenamiento.
- Riesgo de sesgo y sobreajuste al dataset de origen: no se documenta la composición ni la demografía de los datos de entrenamiento.
- Uso clínico: no consta validación regulatoria; debe tratarse como herramienta de investigación, no como dispositivo médico.
- Dependencia de pesos y código empaquetados en el mismo repositorio: cualquier actualización puede alterar la reproducibilidad si no se fija una revisión concreta.
- El agente usa un LLM local (GPT-OSS) por defecto; el cambio a un LLM en la nube implica enviar datos fuera del entorno, con las consiguientes implicaciones de privacidad.

## Enlaces

- Hugging Face: https://huggingface.co/instincts7Zz/my_Thyroid_infer
- ModelScope: https://www.modelscope.cn/instincts/my_Thyroid_infer
- Mirror de Hugging Face para China: https://hf-mirror.com
