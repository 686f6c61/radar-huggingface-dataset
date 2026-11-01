# jakuzya/rppg-physnet

## Resumen

PhysNet es una red neuronal convolucional para fotopletismografía remota (rPPG), es decir, la reconstrucción de la señal de pulso sanguíneo (BVP) a partir de vídeos RGB del rostro sin contacto físico. Este repositorio, publicado por el usuario jakuzya, contiene pesos preentrenados de PhysNet obtenidos mediante aprendizaje por transferencia desde UBFC-rPPG (42 sujetos) hacia MCD-rPPG (540 sujetos de la cámara FullHDwebcam), con una evaluación final sobre un conjunto privado de 8 sujetos.

El modelo predice la forma de onda diferencial del pulso, que después se integra y posprocesa para reconstruir la señal BVP continua; la frecuencia cardíaca se estima por FFT en el rango de 0,5 a 3,5 Hz. La relevancia práctica es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes, sin pipeline declarado en HuggingFace, y con un tamaño de repositorio de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o son de tamaño muy reducido.

No se dispone de información sobre arquitectura detallada más allá de la denominación PhysNet, ni sobre número de parámetros, ni sobre licencia más allá de Apache 2.0. La model card documenta exclusivamente el protocolo de entrenamiento, evaluación y limitaciones, sin especificaciones formales del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PhysNet (red convolucional para rPPG; detalles internos no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión sobre ventanas de 10 s a 30 Hz) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`physnet.pth`) |

## Arquitectura y entrenamiento

PhysNet es una red convolucional que opera sobre secuencias de fotogramas faciales. El preprocesamiento detecta la cara con MediaPipe Face Landmarker, recorta la región facial y la redimensiona a 72 × 72 píxeles preservando RGB. La entrada usa una representación DiffNormalized: la diferencia entre fotogramas consecutivos normalizada por la suma más 1e-7, y posteriormente normalizada por la desviación estándar calculada sobre el vídeo completo. El objetivo de referencia es la primera diferencia temporal normalizada de la señal PPG.

El entrenamiento se divide en dos fases: preentrenamiento sobre UBFC-rPPG (42 sujetos) y ajuste fino sobre MCD-rPPG, restringido a grabaciones de la cámara FullHDwebcam con frecuencia original de al menos 27 Hz (540 sujetos). Las ventanas son de 10 segundos a 30 Hz con stride de 5 segundos, lo que genera solapamiento entre muestras. La evaluación se realiza a nivel de vídeo completo: se generan predicciones para ventanas solapadas, se promedian las predicciones superpuestas, se integra la forma de onda diferencial para obtener la BVP y se aplica el mismo posprocesado a predicción y referencia. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un modelo de señal y no de lenguaje.

## Capacidades

- Reconstrucción de señal BVP a partir de vídeo RGB facial sin contacto.
- Estimación de frecuencia cardíaca mediante FFT sobre la señal reconstruida en el rango 0,5–3,5 Hz.
- Procesamiento de ventanas de 10 segundos a 30 Hz con stride de 5 segundos y agregación por promedio de predicciones solapadas.
- Funcionamiento sobre recortes faciales de 72 × 72 píxeles detectados con MediaPipe.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras modalidades.

## Casos de uso

- Monitorización de frecuencia cardíaca en telemedicina: el modelo permite estimar el pulso desde la webcam del paciente en sesiones de videoconsulta, sin necesidad de pulsómetro, aprovechando su MAE de 0,463 BPM en el conjunto privado de evaluación.
- Triaje previo en entornos clínicos de baja criticidad: como cribado no invasivo de arritmias o taquicardias, usando la señal BVP reconstruida como entrada a un clasificador posterior.
- Investigación en fisiología afectiva: extracción de señal cardíaca en estudios donde el contacto físico con el sujeto altera la medición o es inviable (por ejemplo, neonatos o pacientes con quemaduras).
- Análisis de estrés y carga cognitiva en entornos de oficina: el modelo puede procesar vídeo de webcam para correlacionar variabilidad cardíaca con tareas cognitivas, siempre que las condiciones de iluminación y movimiento sean controladas.
- Evaluación de la calidad de algoritmos rPPG en pipelines de investigación: sirve como baseline reproducible sobre UBFC-rPPG y MCD-rPPG para comparar nuevas propuestas.
- Docencia y prototipado en visión por computador biomédica: al ser un modelo pequeño con pesos PyTorch y licencia Apache 2.0, es adecuado para prácticas de laboratorio sobre preprocesamiento facial y estimación de señal.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Modelo | Conjunto de evaluación | Sujetos | Pearson | HR MAE (BPM) | HR RMSE (BPM) |
|---|---|---:|---:|---:|---:|
| PhysNet baseline | UBFC-rPPG | 42 | 0,750 | 1,63 | 2,64 |
| PhysNet fine-tuned | MCD-rPPG | 60 | 0,822 | 1,58 | 3,03 |

Evaluación sobre conjunto privado (8 grabaciones):

| Métrica | Valor |
|---|---:|
| Pearson medio | 0,9015 |
| MAE de la HR media | 0,463 BPM |
| RMSE de la HR media | 0,724 BPM |

Experimento adicional antes/después de ejercicio físico:

| Métrica | Antes | Después |
|---|---:|---:|
| Pearson medio | 0,8695 | 0,4863 |
| Error absoluto medio de HR (BPM) | 0,279 | 15,780 |
| HR media predicha (BPM) | 80,020 | 106,308 |
| HR media de referencia (BPM) | 79,741 | 122,088 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publica el número de parámetros ni el tamaño del checkpoint).
- GPU recomendadas: no disponibles; por el tamaño típico de PhysNet y la resolución de entrada (72 × 72), es esperable que quepa en cualquier GPU consumer, pero no se confirma en la información proporcionada.
- Cabe en GPU consumer: probablemente sí, aunque no se especifica.
- Opciones de despliegue: PyTorch nativo (pesos `.pth`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de visión de este tipo.
- Latencia y throughput: no disponibles. La ventana de inferencia es de 10 s de vídeo a 30 Hz (300 fotogramas) con stride de 5 s, pero no se publican tiempos por ventana.

## Comparativa con modelos similares

No se dispone de datos de otros modelos rPPG en la información proporcionada para establecer una comparativa cuantitativa fiable. Como referencia cualitativa, el baseline PhysNet original (sin ajuste fino sobre MCD-rPPG) alcanza Pearson 0,750 y MAE 1,63 BPM sobre UBFC-rPPG, frente a 0,822 y 1,58 BPM del modelo ajustado sobre MCD-rPPG. No se han encontrado en la información disponible resultados de otros modelos (por ejemplo, DeepPhys, TS-CAN o EfficientPhys) para comparar parámetros, contexto o licencia.

## Limitaciones y advertencias

- Degradación severa tras ejercicio físico: el Pearson cae de 0,8695 a 0,4863 y el error absoluto medio de HR sube de 0,279 a 15,780 BPM. El modelo predice 106,3 BPM cuando la referencia es 122,1 BPM, es decir, subestima la frecuencia cardíaca en estados de alta activación.
- Evaluación sobre conjunto privado muy reducida (8 grabaciones), lo que limita la generalización de las métricas reportadas (Pearson 0,9015, MAE 0,463 BPM).
- El ajuste fino sobre MCD-rPPG se restringe a la cámara FullHDwebcam con frecuencia ≥ 27 Hz, por lo que el rendimiento con otras cámaras o frecuencias no está caracterizado.
- Dependencia de MediaPipe Face Landmarker para la detección facial: fallos de detección, oclusiones o poses extremas degradan la señal.
- Sensibilidad esperable a iluminación, movimiento y tono de piel, aunque no se documenta un análisis de sesgo específico.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantía clínica; el modelo no es un dispositivo médico y no debe usarse para diagnóstico sin validación regulatoria.
- Repositorio con 0 descargas y 0 likes, sin pipeline declarado y con tamaño de 0,0 GB: la disponibilidad efectiva de los pesos no está confirmada.
- No se documentan sesgos demográficos (edad, género, etnia) ni validación externa más allá de los conjuntos citados.

## Enlaces

- HuggingFace: https://huggingface.co/jakuzya/rppg-physnet
- Dataset MCD-rPPG: https://huggingface.co/datasets/kyegorov/mcd_rppg
- Dataset UBFC-rPPG: https://sites.google.com/view/ybenezeth/ubfcrppg
- Paper MCD-rPPG (ACM MM 2025): https://doi.org/10.1145/3746027.3758255
- Referencia UBFC-rPPG: Bobbia, S., Macwan, R., Benezeth, Y., Mansouri, A., & Dubois, J. (2017). Unsupervised skin tissue segmentation for remote photoplethysmography. Pattern Recognition Letters.
