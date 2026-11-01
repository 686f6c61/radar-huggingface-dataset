# Nasochec/YOLO-1D_ECG_LUDB

## Resumen

YOLO-1D es un detector unidimensional de estilo YOLO, sin anclas (anchor-free), desarrollado por Nasochec y entrenado para la delineación de ondas electrocardiográficas (segmentación de los complejos P, QRS y T) sobre la base de datos LUDB (Lobachevsky University Electrocardiography Database). El modelo recibe una única derivación de ECG de 10 segundos muestreada a 500 Hz, normalizada con z-score, y devuelve los intervalos `[onset, offset]` de las ondas P, QRS y T junto con una puntuación de confianza. Se trata de un checkpoint de 1,08 millones de parámetros (8,5 MB) que emplea una arquitectura tipo DarkNet 1-D con bloques CSP, SPP y atención PSA, cuello FPN y cabeza sin anclas con Distribution Focal Loss.

El modelo resuelve un problema clásico de procesamiento de señales biomédicas: la delimitación automática y precisa de las fronteras de las ondas cardíacas, tarea previa a cualquier análisis de intervalos (PR, QT, QRS) con relevancia clínica. Frente a enfoques basados en umbrales o en modelos secuenciales, YOLO-1D traslada la filosofía de detección de objetos en tiempo real al dominio de la señal 1-D, lo que permite un procesamiento por ventanas con NMS 1-D y umbrales de confianza por clase.

Es relevante ahora porque demuestra que arquitecturas ligeras de detección pueden alcanzar métricas de delineación muy altas (F1 superior al 97 % en P y próximo al 100 % en QRS en el split de test del fold 0) con un coste computacional mínimo, lo que facilita su despliegue en dispositivos con recursos limitados. El checkpoint corresponde al run `experiments/final/fold0_seed2/train1/` del repositorio fuente y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO-1D `nano`: backbone 1-D estilo DarkNet (bloques CSP, SPP, atencion PSA), cuello FPN, cabeza anchor-free con Distribution Focal Loss (16 bins) |
| Parametros totales | 1,08 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 1 canal x 5000 muestras (10 s a 500 Hz), rellenada con ceros hasta 5120 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de senal; la model card declara `en` como idioma de documentacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`best.pt`, diccionario `torch.save` con claves `model`, `ema`, `epoch`); inferencia con pesos EMA |

## Arquitectura y entrenamiento

La arquitectura es una adaptación 1-D de YOLO: un backbone estilo DarkNet con bloques CSP (Cross Stage Partial), módulo SPP (Spatial Pyramid Pooling) y atención PSA (Position-Sensitive Attention), seguido de un cuello FPN y una cabeza sin anclas que utiliza Distribution Focal Loss con 16 bins para la regresión de las fronteras. El preset de backbone es `B`, con strides de cabeza 8/16/32. La entrada es una derivación única de 5000 muestras (10 s a 500 Hz) normalizada con z-score por derivación y rellenada con ceros hasta 5120 muestras dentro de las transformaciones. Las clases son `0 = P`, `1 = QRS`, `2 = T`.

El entrenamiento se realizó sobre la base LUDB (200 registros de 12 derivaciones, 10 s a 500 Hz, con anotaciones expertas de fronteras P, QRS y T), con un split a nivel de paciente mediante validación cruzada de 5 folds estratificada por grupo de ritmo (sinus 175 registros, af_flutter 15, paced 10). Este checkpoint corresponde al fold 0, con 144 registros de entrenamiento (1713 ejemplos de derivación), 16 de validación (186 ejemplos) y 40 de test (477 ejemplos). Se excluyeron 24 de las 2400 derivaciones por anotaciones defectuosas. El optimizador fue SGD con momentum 0,937, weight decay 5e-4, learning rate de 0,01 a 1e-4, 3 épocas de warm-up, batch 32 y 250 épocas con paciencia de early stopping de 40 (mejor época: 176). Se aplicaron 16 aumentaciones específicas de ECG (ruido blanco, EMG, powerline y baseline wander, ruido real de MIT-BIH NSTDB, escalado temporal, HRV warp, window warp, escalado de amplitud y por onda, inversión, step, time masking, mosaic, record splicing, filtro band-pass) y enmascaramiento aleatorio de bordes no anotados. La pérdida combina pesos de caja 7,5, clase 0,5 y DFL 1,5 con task-aligned assigner. El post-procesado usa NMS 1-D con IoU 0,2 y umbrales de confianza por clase (P = 0,30, QRS = 0,20, T = 0,25) ajustados en validación.

## Capacidades

- Delineación de ondas ECG: detección de los intervalos `[onset, offset]` de las ondas P, QRS y T con puntuación de confianza por detección.
- Procesamiento de señal 1-D: entrada de una derivación de 10 s a 500 Hz, normalizada con z-score.
- Detección sin anclas con Distribution Focal Loss (16 bins), lo que permite regresión precisa de fronteras.
- Post-procesado integrado con NMS 1-D (IoU 0,2) y umbrales de confianza por clase calibrados en validación.
- Robustez ante ruido y variabilidad fisiológica gracias a 16 aumentaciones específicas de ECG durante el entrenamiento.
- Capacidad de generalización a distintos ritmos (sinus, fibrilación auricular/flutter, marcapasos), aunque con menos ejemplos de los grupos minoritarios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo de señal, no de lenguaje.

## Casos de uso

- Análisis automático de intervalos clínicos: a partir de las fronteras P, QRS y T detectadas se pueden calcular intervalos PR, QT y duración del QRS, útiles en sistemas de cribado de arritmias y bloqueos. El modelo ofrece errores medios de 0,2 ms en QRS onset y 1,3 ms en P onset, adecuados para medidas clínicas.
- Monitorización Holter y wearables: al ser un modelo de 1,08 M de parámetros y 8,5 MB, puede ejecutarse en dispositivos con recursos limitados para delimitar latidos en tiempo real sobre derivaciones únicas.
- Preprocesado para pipelines de clasificación de arritmias: las fronteras detectadas pueden alimentar modelos posteriores que extraigan características morfológicas o intervalos como entrada.
- Investigación en electrofisiología: permite reproducir y comparar resultados de delineación sobre LUDB con un checkpoint público y un split documentado (folds.csv y listas de train/val/test incluidas).
- Telemedicina y triaje remoto: el modelo puede procesar ECG de una sola derivación en servidores modestos y devolver intervalos con confianza para revisión médica.
- Docencia y validación de algoritmos: sirve como referencia ligera para comparar delineadores basados en umbrales o en redes secuenciales sobre el mismo conjunto de datos.
- Integración en pipelines de CI/CD de investigación: al distribuirse con `args.yaml`, `thresholds.json` y `metrics.json`, facilita la reproducibilidad y la evaluación automatizada en experimentos.

## Benchmarks y rendimiento

Resultados en el split de test del fold 0 (40 registros, 477 derivaciones). Protocolo: detección por derivación, emparejamiento uno a uno de cada frontera predicha con la referencia más cercana dentro de ±150 ms (ANSI/AAMI EC57); Se, PPV y F1 por punto fiducial; m ± σ es el error medio ± desviación típica en ms; FP/lead es el número de predicciones no emparejadas por derivación. Se excluyen fronteras adyacentes a bordes enmascarados.

| Fiducial | Se, % | PPV, % | F1, % | m ± σ, ms | FP/lead |
|---|---:|---:|---:|---:|---:|
| P onset | 98,55 | 97,20 | 97,87 | 1,3 ± 14,1 | 0,193 |
| P offset | 98,56 | 97,22 | 97,88 | 1,1 ± 11,9 | 0,193 |
| QRS onset | 100,00 | 99,89 | 99,95 | 0,2 ± 6,6 | 0,008 |
| QRS offset | 100,00 | 99,89 | no disponible (truncado en la información) | no disponible | no disponible |

El resto de métricas (T onset/offset, métricas por grupo de ritmo, mAP de detección) están en `metrics.json` del repositorio, pero no se incluyen en la información proporcionada. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint pesa 8,5 MB y el modelo tiene 1,08 M de parámetros, por lo que la memoria dominante es la de las activaciones de la entrada (1 x 5120 muestras).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090, RTX 3090 o incluso GPUs de gama de entrada (GTX 1650, T4) pueden ejecutar la inferencia con holgura.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 1-2 GB de VRAM libre; también es viable en CPU para lotes pequeños.
- Opciones de despliegue: PyTorch nativo (cargando `best.pt` y construyendo el modelo con `args.yaml`), exportación a TorchScript u ONNX (no documentada en la información disponible), y ejecución en CPU con `torch`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. Como referencia cualitativa, los delineadores clásicos de ECG suelen basarse en umbrales o en redes secuenciales (LSTM/CNN) y no publican comparaciones directas con este checkpoint en la información disponible. La comparativa numérica con alternativas queda como no disponible.

## Limitaciones y advertencias

- Modelo específico de señal: no es un modelo de lenguaje ni soporta tool calling, agentes ni razonamiento multi-paso.
- Entrada restringida a una derivación de 10 s a 500 Hz, normalizada con z-score y rellenada a 5120 muestras; no admite otras frecuencias o duraciones sin remuestreo.
- El checkpoint está entrenado en el fold 0 de LUDB; no debe evaluarse sobre los registros de train o val listados en la model card (riesgo de fuga de datos).
- Grupos minoritarios poco representados: solo 11 ejemplos de af_flutter y 7 de paced en entrenamiento, por lo que el rendimiento en estos ritmos puede ser inferior y no se detalla en la información disponible.
- Riesgo de falsos positivos y negativos en derivaciones con ruido intenso o anotaciones defectuosas; el modelo excluye 24 derivaciones por anotaciones defectuosas, lo que indica sensibilidad a la calidad de la anotación.
- Posible sesgo hacia la población de LUDB (200 registros), sin datos sobre diversidad demográfica o clínica.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de atribución (`NOTICE.txt`).
- No es un dispositivo médico: los resultados deben validarse clínicamente antes de cualquier uso diagnóstico.
- La información de benchmarks está truncada en la model card para QRS offset y no incluye T; conviene consultar `metrics.json` para una evaluación completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nasochec/YOLO-1D_ECG_LUDB
- Código fuente: https://github.com/BystrovGladkov/YOLO_1d (rama `EKG`)
- Dataset LUDB: https://physionet.org/content/ludb/1.0.1/
- Paper: referencia no disponible en la información proporcionada (la model card cita el paper sin enlace)
- Demo: no disponible
