# sharktide/ohca-predictor-v1

## Resumen

CVDGuard es un modelo de clasificación tabular y de series temporales desarrollado por el usuario sharktide (repositorio `sharktide/ohca-predictor-v1`) orientado a la predicción temprana de parada cardiorrespiratoria extrahospitalaria (OHCA, por sus siglas en inglés). No es un modelo de lenguaje: se trata de una red neuronal profunda de aproximadamente 17 millones de parámetros, implementada en TensorFlow/Keras y empaquetada mediante código remoto para integrarse en el ecosistema `transformers` a través del punto de entrada `AutoModel`. Su entrada combina señales fisiológicas continuas (ECG, PPG, acelerómetro, giroscopio, respiración, SpO2 y temperatura) con vectores tabulares clínicos (demografía, medicación, comorbilidades y analíticas).

El modelo resuelve un problema clínico concreto: estimar el riesgo de OHCA inminente a partir de una ventana de monitorización de unos 185 segundos (0,05138 horas). La arquitectura declarada, `TFCVDPredictorForOHCADetection`, incorpora componentes de cross-attention tipo transformer para fusionar las señales waveform con el contexto tabular estático. Según la model card, se evaluó sobre una cohorte de validación independiente de 196 muestras con una prevalencia del 28,1 %, obteniendo un AUROC de 0,932 y un AUPRC de 0,892.

Su relevancia actual es acotada pero específica: demuestra un patrón de despliegue de modelos clínicos multimodales dentro del ecosistema Hugging Face mediante código remoto, algo poco habitual en modelos de riesgo cardiovascular. Con solo 13 descargas y 0 likes, es un artefacto de investigación de nicho, no un modelo consolidado para producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TFCVDPredictorForOHCADetection (red neuronal profunda con cross-attention tipo transformer sobre señales y tabular) |
| Parametros totales | ~17 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de monitorización de ~185 segundos (window_duration_hours = 0,05138) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 0,6 GB; empaquetado TensorFlow/Keras con código remoto) |

## Arquitectura y entrenamiento

La arquitectura combina dos ramas de entrada. La primera procesa señales fisiológicas continuas con dimensiones y frecuencias de muestreo fijas: ECG a 130 Hz con 24.050 muestras, PPG a 50 Hz con 9.250 muestras, acelerómetro y giroscopio a 52 Hz con matrices de 9.620×3, respiración a 25 Hz con 4.625 muestras, SpO2 a 10 Hz con 1.850 muestras y temperatura a 1 Hz con 185 muestras. La segunda rama consume vectores tabulares normalizados: demografía (24 dimensiones), medicación (14), comorbilidades (14) y valores de laboratorio (8), junto con escalares de constantes vitales (frecuencia cardíaca, ritmo, estado de actividad, SpO2 media, presión arterial sistólica y diastólica, y frecuencia respiratoria media). Ambas ramas se fusionan mediante mecanismos de cross-attention, según describe el autor.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de clasificación). Tampoco se detalla el esquema de aumento de datos, la estrategia de validación cruzada ni el preprocesamiento exacto de las señales. El autor advierte que los componentes de cross-attention son "altamente sensibles a anomalías fisiológicas y variaciones morfológicas en las señales en bruto", lo que sugiere que el modelo puede degradarse ante distribuciones de señal distintas a las del entrenamiento.

## Capacidades

- Clasificación binaria y estimación de riesgo de OHCA a partir de una ventana de monitorización de ~185 segundos.
- Fusión multimodal de señales fisiológicas continuas (ECG, PPG, acelerómetro, giroscopio, respiración, SpO2, temperatura) con datos tabulares clínicos.
- Procesamiento de telemetría de wearables y sensores de monitorización continua (acelerómetro y giroscopio de 3 ejes).
- Integración con el ecosistema `transformers` mediante `AutoModel.from_pretrained` con `trust_remote_code=True`.
- Salida de probabilidad de riesgo (`ohca_risk`) consumible en pipelines de decisión clínica.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de capacidades multilingües más allá del inglés declarado en la metadata.
- No incorpora visión, audio ni modo de pensamiento.

## Casos de uso

- Monitorización continua en urgencias y unidades de críticos: el modelo consume ventanas de ~185 segundos de ECG, PPG y constantes vitales para emitir una probabilidad de OHCA, lo que permite priorizar la revisión de pacientes con riesgo elevado en paneles de alerta temprana.
- Telemedicina y monitorización remota domiciliaria: con sensores portátiles (PPG, acelerómetro, SpO2, temperatura) y el vector tabular de comorbilidades, puede desplegarse en plataformas de seguimiento de pacientes crónicos para disparar avisos cuando el riesgo supera el umbral óptimo de 0,302 declarado por el autor.
- Investigación clínica retrospectiva: sirve como extractor de riesgo para cohortes con registros de waveforms y datos tabulares, permitiendo estratificar poblaciones y estudiar factores asociados a OHCA.
- Triaje en ensayos clínicos: al combinar medicación, comorbilidades y analíticas con señales fisiológicas, puede usarse para enriquecer la selección de pacientes con alto riesgo en estudios cardiovasculares.
- Sistemas de alerta en wearables de consumo clínico: el modelo acepta acelerómetro y giroscopio de 3 ejes, lo que facilita su integración en dispositivos vestibles con detección de actividad y caídas.
- Validación de pipelines de datos fisiológicos: por su esquema de entrada estricto (dimensiones y frecuencias fijas), es útil como referencia para verificar la correcta adquisición y sincronización de señales en plataformas de monitorización.
- Docencia y prototipado en ingeniería biomédica: permite demostrar un flujo completo de carga de modelo clínico desde Hugging Face con código remoto, inferencia sobre `WindowSample` y salida de riesgo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre una cohorte de validación independiente de 196 muestras con prevalencia (post-rate) del 28,1 %:

| Metrica | Valor |
|---|---|
| AUROC | 0,932 [0,895 - 0,972] |
| AUPRC | 0,892 [0,828 - 0,949] |
| Umbral de riesgo óptimo | 0,302 |
| Sensibilidad en el óptimo | 0,855 |
| Especificidad en el óptimo | 0,844 |
| Brier score | 0,0904 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con ~17 millones de parámetros y pesos en formato TensorFlow/Keras, el modelo es muy ligero (del orden de decenas de MB en FP32), pero el repositorio ocupa 0,6 GB, por lo que el espacio en disco es el principal requisito.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU consumer reciente (RTX 3060 en adelante) debería ser suficiente para inferencia; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 2-4 GB de VRAM, aunque el dato no está confirmado por el autor.
- Opciones de despliegue: el autor documenta carga vía `transformers` (`AutoModel.from_pretrained` con `trust_remote_code=True`) y la librería `cvdpredict`/`ohca_predictor` instalada desde el repositorio GitHub `sharktide/CVD-Predict` en la etiqueta `v1.0.0`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de predicción de OHCA en la documentación proporcionada. Se indica "no disponible" para parámetros, contexto, rendimiento, licencia y disponibilidad de alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sharktide/ohca-predictor-v1 | ~17 M | ventana de ~185 s | AUROC 0,932 / AUPRC 0,892 (196 muestras) | apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cohorte de validación muy pequeña (196 muestras) y con prevalencia elevada (28,1 %), lo que limita la generalización a poblaciones con prevalencia baja típica de atención primaria o monitorización ambulatoria.
- El autor advierte de sensibilidad alta a anomalías fisiológicas y variaciones morfológicas en las señales en bruto; el rendimiento puede degradarse con sensores, poblaciones o protocolos distintos a los del entrenamiento.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos clínicamente relevantes; el umbral óptimo (0,302) está calibrado sobre la cohorte de validación y puede no transferirse.
- Esquema de entrada rígido: dimensiones y frecuencias de muestreo fijas (ECG 24.050 muestras a 130 Hz, PPG 9.250 a 50 Hz, etc.); cualquier desviación provoca errores de forma o predicciones inválidas.
- Dependencia de ejecución de código remoto (`trust_remote_code=True`) desde el hub; el autor recomienda fijar un commit concreto en entornos de producción o clínicos.
- Idioma declarado únicamente inglés; no hay soporte multilingüe.
- No es un dispositivo médico ni está validado regulatoriamente; no debe usarse como sustituto del juicio clínico.
- Licencia apache-2.0 permite uso comercial, pero la ausencia de validación externa y de documentación sobre el dataset de entrenamiento desaconseja su uso en producción clínica sin auditoría adicional.
- No se documentan sesgos demográficos ni la composición del conjunto de entrenamiento, lo que impide evaluar equidad entre subgrupos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sharktide/ohca-predictor-v1
- Repositorio de la librería CVDPredict: https://github.com/sharktide/CVD-Predict (etiqueta v1.0.0)
- Documentación de TensorFlow: https://tensorflow.org/install
- Documentación de Transformers: https://huggingface.co/docs/transformers
