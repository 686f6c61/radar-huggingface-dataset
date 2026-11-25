# PierreGtch/eeg-fm-masking_mae_r12cm_L2

## Resumen

eeg-fm-masking_mae_r12cm_L2 es un codificador de electroencefalografía (EEG) preentrenado por Pierre Guetschel (usuario PierreGtch) como parte de un estudio sistemático sobre geometrías de enmascaramiento en modelos fundacionales de EEG. El modelo es un autoencoder enmascarado (MAE) de 12,69 millones de parámetros que procesa señales EEG muestreadas a 200 Hz y produce representaciones contextuales por ventana temporal, sin cabecera de clasificación. Forma parte de una familia de 58 codificadores entrenados con una receta idéntica en la que solo varía la geometría de la máscara: este concreto emplea un radio espacial de 12 cm y una longitud temporal de 2 parches.

El modelo resuelve el problema de obtener representaciones transferibles de EEG sin etiquetas, un dominio donde los datos anotados son escasos y costosos. Al ser agnóstico al montaje (acepta cualquier número y disposición de canales siempre que tengan posición 3D en metros), puede aplicarse a configuraciones de electrodos muy diversas, lo que lo hace útil como extractor de características congelado para sondas lineales o como inicialización para ajuste fino.

Es relevante ahora porque el artículo asociado (arXiv:2609.33487) concluye que la geometría de enmascaramiento influye de forma medible en el rendimiento downstream y recomienda r = 9 cm con L = 2, por lo que este checkpoint de 12 cm sirve como punto de comparación dentro de un barrido controlado. La licencia CC-BY-4.0 permite redistribuir los pesos, algo poco habitual en modelos fundacionales de EEG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con tokenizador de parches y autoencoder enmascarado (MAE); solo se publica el codificador |
| Parametros totales | 12.692.096 (codificador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como ventana fija; procesa parches de 1 s (200 muestras) con solapamiento de 20 muestras |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión original) |
| Idiomas soportados | no aplica (modelo de señales EEG, no de texto) |
| Licencia | CC-BY-4.0 (pesos); código MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de autoencoder enmascarado: un tokenizador de parches (`feature_encoder.*`) convierte la señal EEG en tokens y un transformer (`model.*`) procesa únicamente los parches no enmascarados; un decodificador ligero, no incluido en el repositorio, reconstruye la señal cruda de los parches ocultos durante el preentrenamiento. La máscara se define por geometría: radio espacial de 12 cm sobre las posiciones de los electrodos y longitud temporal de 2 parches, con un parámetro `pct_unmasked` de 0,45. La entrada se escala internamente con un factor de 1e+06 y un `median_std_clip` con recorte en σ = 15, por lo que los datos no deben estandarizarse de antemano.

El preentrenamiento usó el subconjunto de licencia abierta del corpus REVE (323 grabaciones), elegido para permitir la redistribución de los pesos. La receta fue de 10 épocas en 2 GPU H100, con tamaño de lote de 600 por GPU, tasa de aprendizaje 0,00024 (calentamiento de 3080 pasos, valor final 1e-06) y decaimiento de peso 0,01. El checkpoint publicado corresponde al final de la época 10; las épocas 1 a 9 están en subcarpetas `epoch_01/` a `epoch_09/` con los mismos nombres de tensor. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación.

## Capacidades

- Extracción de características de EEG: genera representaciones contextuales por ventana temporal a partir de señales a 200 Hz.
- Agnosia de montaje: admite cualquier número y conjunto de canales, siempre que cada electrodo tenga posición 3D en metros (formato MNE `info["chs"][i]["loc"][:3]`).
- Preentrenamiento auto-supervisado: no requiere etiquetas para producir representaciones.
- Evaluación con sonda lineal: las características congeladas son aptas para regresión ridge y clasificación (OpenEEGBench).
- Ajuste fino: puede inicializar cabeceras de clasificación específicas por tarea.
- Checkpoints intermedios: permite estudiar la evolución del aprendizaje época a época.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; es un modelo unimodal de señales biomédicas.

## Casos de uso

- Clasificación de estados mentales y tareas cognitivas: con el codificador congelado y una sonda ridge, se obtienen precisiones balanceadas de 0,728 en arithmetic_zyma2019 y 0,475 en bcic2a, adecuadas como línea base en interfaces cerebro-computador.
- Detección de crisis epilépticas: el modelo alcanza 0,841 de precisión balanceada en chbmit, por lo que puede integrarse como extractor en pipelines de monitorización continua con revisión humana posterior.
- Estadificación del sueño: 0,682 de precisión balanceada en isruc-sleep permite usarlo como componente de sistemas de análisis nocturno, combinado con un clasificador ligero por etapa.
- Detección de anomalías en EEG clínico: 0,806 en tuab y 0,899 en tuev lo hacen útil para triaje de registros anómalos antes de la lectura por especialistas.
- Investigación en depresión: 0,834 en mdd_mumtaz2016 sirve como base para estudios de biomarcadores, siempre con validación externa.
- Comparación metodológica de geometrías de enmascaramiento: al compartir receta con otros 57 codificadores, permite aislar el efecto del radio espacial y la longitud temporal en el rendimiento downstream.
- Prototipado rápido con montajes no estándar: su agnosia de montaje facilita aplicar el modelo a datos de laboratorio con electrodos dispersos sin reentrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card con codificador congelado y sonda ridge sobre características contextuales aplanadas, 12 conjuntos de datos y 5 semillas. Clasificación con precisión balanceada; `seed-vig` con R².

| Dataset | Métrica | Resultado (media ± desv.) | Semillas |
|---|---|---|---|
| arithmetic_zyma2019 | precisión balanceada | 0,728 ± 0,024 | 5 |
| bcic2020-3 | precisión balanceada | 0,261 ± 0,018 | 5 |
| bcic2a | precisión balanceada | 0,475 ± 0,004 | 5 |
| chbmit | precisión balanceada | 0,841 ± 0,032 | 5 |
| faced | precisión balanceada | 0,332 ± 0,004 | 5 |
| isruc-sleep | precisión balanceada | 0,682 ± 0,003 | 5 |
| mdd_mumtaz2016 | precisión balanceada | 0,834 ± 0,028 | 5 |
| physionet | precisión balanceada | 0,569 ± 0,003 | 5 |
| seed-v | precisión balanceada | 0,286 ± 0,002 | 5 |
| seed-vig | R² | -0,118 ± 0,006 | 5 |
| tuab | precisión balanceada | 0,806 ± 0,003 | 5 |
| tuev | precisión balanceada | 0,899 ± 0,029 | 5 |

No se han publicado en la información disponible tablas comparativas con otros modelos fundacionales de EEG; el artículo asociado incluye la comparación entre las 58 geometrías de enmascaramiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 12,69 M de parámetros (unos 51 MB de pesos), más el estado de activaciones según la longitud de la ventana procesada.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento original usó 2 × H100, pero la inferencia no requiere hardware de centro de datos.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.), e incluso en CPU para lotes pequeños.
- Opciones de despliegue: carga directa con `safetensors.torch.load_file` y el wrapper `ContextualEncoderBenchmarkWrapper` del paquete `eeg-fm-masking`; integración con `open_eeg_bench.backbone.PretrainedBackbone`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eeg-fm-masking_mae_r12cm_L2 | 12,69 M | Parches de 1 s a 200 Hz, agnóstico de montaje | Ver tabla de benchmarks | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_mae_r9cm_L2 | 12,69 M (misma receta) | Parches de 1 s a 200 Hz, agnóstico de montaje | Geometría recomendada por el artículo; cifras concretas no disponibles en la información proporcionada | CC-BY-4.0 | Hugging Face |
| eeg-fm-masking_jepa_r9cm_L2 | 12,69 M (misma receta) | Parches de 1 s a 200 Hz, agnóstico de montaje | Geometría recomendada por el artículo; cifras concretas no disponibles en la información proporcionada | CC-BY-4.0 | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos fundacionales de EEG de otros autores (por ejemplo, arquitecturas basadas en transformers o SSM publicadas por otros grupos); esos datos figuran como no disponibles.

## Limitaciones y advertencias

- El repositorio contiene únicamente el codificador; el decodificador MAE no se distribuye, por lo que no es posible reproducir la tarea de reconstrucción sin reentrenar.
- El rendimiento es muy desigual entre tareas: 0,261 en bcic2020-3, 0,286 en seed-v y 0,332 en faced indican que el codificador congelado no captura bien esas tareas, y el R² negativo de -0,118 en seed-vig muestra que la sonda lineal no supera a la media en regresión de vigilancia.
- Requiere señales a exactamente 200 Hz, en voltios y con posiciones de canal en metros; un preprocesado incorrecto (remuestreo, estandarización previa o falta de posiciones 3D) degrada o invalida los resultados.
- No debe estandarizarse la entrada antes de pasarla al wrapper: el modelo aplica su propio escalado (`factor = 1e+06` y `median_std_clip` con recorte en σ = 15).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de sobreinterpretar representaciones en dominios alejados del corpus REVE de preentrenamiento (323 grabaciones), con posible sesgo hacia las poblaciones y protocolos de ese corpus.
- Los resultados publicados provienen de una única receta y 5 semillas; no hay validación externa multicéntrica documentada en la información disponible.
- Licencia CC-BY-4.0: permite uso comercial con atribución; el código del paquete está bajo MIT. Es necesario citar el artículo de Guetschel (2026) al reutilizar los pesos.
- El checkpoint publicado corresponde a la época 10 de 10; no se documenta una selección por validación, por lo que puede no ser el óptimo para todas las tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r12cm_L2
- Artículo: https://arxiv.org/abs/2609.33487
- Sitio web del proyecto: https://pierregtch.github.io/eeg-fm-masking
- Código: https://github.com/PierreGtch/eeg-fm-masking
- Colección con los 58 modelos: https://huggingface.co/collections/PierreGtch/eeg-fm-masking-6ab912b6a03bba1348fc7366
- Modelo recomendado (MAE, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_mae_r9cm_L2
- Modelo recomendado (JEPA, r = 9 cm, L = 2): https://huggingface.co/PierreGtch/eeg-fm-masking_jepa_r9cm_L2
- Registro de entrenamiento (W&B): https://wandb.ai/pierregtch/chan-inv-clf/runs/eeidax1z
