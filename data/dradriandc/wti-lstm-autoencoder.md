# DrAdrianDC/wti-lstm-autoencoder

## Resumen

El WTI LSTM Autoencoder es un modelo no supervisado de detección de anomalías sobre series temporales financieras, publicado por el usuario DrAdrianDC en Hugging Face. Concretamente, reconstruye ventanas de 10 días de cotización de cierre del futuro de crudo WTI (`CL=F`, datos no ajustados de yfinance) previamente transformadas con un `RobustScaler`. Una ventana se marca como anómala cuando su error cuadrático medio (MSE) de reconstrucción supera un umbral congelado, fijado en el percentil 90 del MSE de reconstrucción del conjunto de entrenamiento original (`0.0162`).

El modelo se implementa con Keras 3 como un autoencoder LSTM con activaciones ReLU y recorte de gradiente (`clipnorm`) y se distribuye bajo licencia MIT. No es un modelo de lenguaje ni un generador de texto: su única salida son puntuaciones de reconstrucción por ventana, y su ventana de análisis es de 10 días bursátiles con entrada univariante de forma `(batch, 10, 1)`. No existe un `pipeline()` de Transformers asociado; la inferencia se realiza cargando el grafo Keras junto con el escalador congelado y comparando el MSE por ventana con el umbral publicado.

Su relevancia es metodológica más que de rendimiento: el repositorio documenta un contrato explícito de operación (escalador congelado, umbral congelado, ledger de puntuaciones de solo anexado, reentrenamiento semanal con puerta de calidad champion/challenger y MAE de hold-out del retador ≤ MAE del campeón × 1.10). El propio autor lo describe como un "rarity score" sobre formas de precio a 10 días, no como un clasificador de crisis ni como un modelo de predicción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder LSTM (Keras 3), secuencia a secuencia sobre ventanas univariantes |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 10 días bursátiles (lookback fijo; entrada `(batch, 10, 1)`) |
| Tipos de cuantización | no disponible (pesos en coma flotante dentro del formato `.keras`; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo numérico de series temporales; la documentación está en inglés) |
| Licencia | MIT |
| Formato de pesos | `.keras` (grafo y pesos de Keras 3); artefactos auxiliares `scaler.pkl` (joblib/pickle), `metadata.json`, `reconstruction_scores.csv`, `detected_anomalies.csv`, `plot-anomalies.png`, `plot-reconstruction-error.png` |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder LSTM entrenado de forma no supervisada con el objetivo de minimizar el error de reconstrucción. La entrada son ventanas de 10 días consecutivos de precios de cierre no ajustados del ticker `CL=F`, normalizados con un `RobustScaler` ajustado únicamente sobre la partición de entrenamiento. El escalador queda congelado y el contrato del repositorio prohíbe reajustarlo durante el afinado. Las capas LSTM emplean activación ReLU y `clipnorm`; el autor advierte que cambiar la activación, el lookback o el tipo de escalador invalida el campeón actual.

El umbral de decisión se fija una sola vez como el percentil 90 del MSE de reconstrucción del entrenamiento original y no se recalcula en los reentrenamientos semanales. La instantánea del campeón publicada indica 34 épocas efectivas sobre un máximo de 100 (con `EarlyStopping` y restauración de la mejor época), un MAE de entrenamiento de 0.072, un MAE de hold-out de 0.055, 623 ventanas marcadas de 6 528 (9.5 %) y una fecha de último dato de 2026-09-04. El evento con mayor error de reconstrucción registrado es el 2020-04-20, con cierre de −37.63 USD y MSE de 0.270. El ciclo de mantenimiento incluye un afinado semanal con puerta de calidad: el MAE de hold-out del retador debe ser menor o igual al del campeón multiplicado por 1.10. Las puntuaciones se almacenan en un ledger de solo anexado, de modo que los pesos nuevos solo se aplican a fechas nuevas y no se reescriben filas históricas.

No se documenta el número de tokens (no aplica), la composición del dataset más allá del cierre no ajustado de `CL=F`, ni el uso de RLHF o DPO (técnicas propias de modelos de lenguaje, ajenas a este caso). Tampoco se publica el recuento de parámetros ni el detalle de las capas del autoencoder.

## Capacidades

- Reconstrucción de ventanas de 10 días de precios de cierre escalados y cálculo del MSE de reconstrucción por ventana.
- Puntuación de rareza ("rarity score"): el ranking continuo del MSE es más informativo que el indicador binario 0/1 derivado del umbral.
- Detección de anomalías mediante comparación con un umbral congelado (`0.0162`, P90 del MSE de entrenamiento original).
- Generación de un ledger de puntuaciones de solo anexado con, al menos, los campos Close, MSE y flag por día.
- Exportación de resultados auxiliares: CSV de puntuaciones por día, CSV de días marcados y gráficos de la serie completa con marcadores de anomalía y de error de reconstrucción frente al umbral.
- Integración en un proceso de reentrenamiento con puerta de calidad (champion/challenger) basada en MAE de hold-out.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, de código, de matemáticas simbólicas, de visión ni de audio.
- No es un modelo de predicción: no tiene horizonte de predicción y reconstruye una ventana que ya ha terminado.
- No emite etiquetas de evento: no existen métricas de precisión o exhaustividad (precision/recall) asociadas.

## Casos de uso

- Monitorización de rareza en series de crudo para investigación: puntuar diariamente el cierre de `CL=F` con ventanas de 10 días y revisar las ventanas cuyo MSE supere el umbral, entendiendo la marca como "ventana difícil de reconstruir" (puede reflejar volatilidad persistente además de caídas bruscas) y no como señal de crisis.
- Construcción de características para modelos supervisados: usar el MSE de reconstrucción por día como variable de entrada adicional en un clasificador o modelo de regresión posterior, aprovechando que el ranking continuo conserva más información que el flag binario.
- Limpieza y control de calidad de datos de mercado: aplicar el modelo como filtro de ventanas atípicas antes de alimentar otros componentes analíticos o de backtesting, siempre con revisión humana dado que no hay etiquetas de evento.
- Demostración docente de un autoencoder LSTM en Keras 3: el repositorio incluye el grafo completo, el escalador congelado, los umbrales y los gráficos, lo que permite reproducir de principio a fin un flujo de detección no supervisada sobre series temporales.
- Referencia de MLOps para pipelines con puerta de calidad: el mecanismo de afinado semanal con criterio "MAE del retador ≤ MAE del campeón × 1.10" y el ledger append-only sirven como plantilla para diseñar procesos de promoción de modelos sin reescribir historial.
- Reproducción de episodios históricos de estrés: el ledger publicado incluye fechas conocidas (crisis financiera de 2008, exceso de oferta de 2016, OPEP+ de marzo de 2020, cierre negativo del 20 de abril de 2020, marzo de 2022) que pueden usarse para estudiar cómo se comporta el error de reconstrucción en esos periodos.
- Comparación metodológica frente a referencias clásicas: el propio autor señala que un z-score simple de retornos o un Isolation Forest también podrían marcar abril de 2020, por lo que el modelo es útil como caso de estudio de espacio de características congelado y control de deriva, no como sustituto de esos métodos.
- Evaluación de la robustez de un umbral fijo: analizar cuántas ventanas quedan marcadas (9.5 % de 6 528) y qué implica operar con un cuantil de reporte en lugar de un detector de eventos raros, útil para decidir políticas de alerta revisadas por humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni métricas equivalentes, ya que no es un modelo de lenguaje. La model card sí publica métricas internas del campeón, que se recogen a continuación tal cual:

| Métrica | Valor |
|---|---|
| MAE de entrenamiento | 0.072 |
| MAE de hold-out | 0.055 |
| Umbral congelado (P90 del MSE de entrenamiento original) | 0.0162 |
| Ventanas marcadas | 623 de 6 528 (9.5 %) |
| Épocas entrenadas (EarlyStopping) | 34 de 100 máximas |
| Evento con mayor MSE registrado | 2020-04-20, cierre −37.63 USD, MSE 0.270 |
| Última fecha del ledger | 2026-09-04 |

El autor advierte explícitamente de que no existe una comparación publicada que demuestre superioridad sobre alternativas clásicas como el z-score de retornos o Isolation Forest.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Dada la forma de entrada `(batch, 10, 1)` y la naturaleza del autoencoder LSTM, la inferencia es viable en CPU y en cualquier GPU de consumo; el repositorio ocupa 0.0 GB según Hugging Face.
- GPU recomendadas: no se especifican. No se requiere GPU para el uso documentado; cualquier GPU consumer permitiría procesar lotes de ventanas con holgura.
- ¿Cabe en GPU de consumo? Sí, según la forma de entrada descrita en la model card; no se publica un requisito mínimo formal.
- Opciones de despliegue: el contrato documentado es Keras 3 + `tensorflow` para cargar `lstm_autoencoder.keras`, más `joblib` para `scaler.pkl` y `huggingface_hub` para la descarga de artefactos. No aplican vLLM, llama.cpp, Ollama ni TGI, que son runtimes para modelos generativos de lenguaje. No se documenta exportación a ONNX, TFLite ni otros formatos.
- Latencia y throughput: no disponibles en la información proporcionada.
- Consideración de seguridad: `scaler.pkl` es un artefacto joblib/pickle y la propia model card recomienda cargarlo únicamente si se confía en el repositorio.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos. La model card únicamente menciona alternativas clásicas sin aportar cifras comparativas:

| Alternativa | Tipo | Parámetros | Ventana o contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WTI LSTM Autoencoder (este modelo) | Autoencoder LSTM no supervisado | no disponible | 10 días bursátiles | MIT | Hugging Face (`DrAdrianDC/wti-lstm-autoencoder`) |
| Z-score simple de retornos | Baseline estadístico | no aplica | Definida por el analista | no especificada | Implementación propia |
| Isolation Forest | Baseline de detección de anomalías | no disponible | Definida por el analista | no especificada | Implementación propia o bibliotecas de Machine Learning |
| Otros autoencoders LSTM para series temporales | Autoencoder | no disponibles | no disponibles | no disponibles | no disponibles |

El autor reconoce que un z-score de retornos o un Isolation Forest podrían marcar igualmente abril de 2020, y que la aportación del repositorio es el espacio de características congelado y la puerta semanal de MAE, no una superioridad demostrada.

## Limitaciones y advertencias

- El P90 es un cuantil de reporte, no un detector de eventos raros: aproximadamente el 9.5 % de los días puntuados quedan por encima del umbral. La marca señala ventanas difíciles de reconstruir, lo que incluye volatilidad persistente además de caídas bruscas.
- Cambiar el umbral es un cambio de política: debe fijarse `model.frozen_threshold` y volver a ejecutar `evaluate`; no se debe permitir que un proceso semanal lo modifique.
- No hay etiquetas de evento, por lo que no existen métricas de precisión o exhaustividad ni una validación supervisada del detector.
- No es un modelo de predicción ni una señal de trading: reconstruye una ventana ya finalizada y carece de horizonte predictivo.
- Es univariante y usa solo el cierre no ajustado: no incorpora inventarios, opciones, diferenciales de calendario ni eventos de la OPEP.
- Alternativas clásicas como un z-score de retornos o un Isolation Forest pueden ofrecer resultados comparables; el repositorio no reclama superioridad sobre ellas.
- Las LSTM con ReLU y `clipnorm` producen una pérdida de validación ruidosa; cambiar la activación, el lookback o el tipo de escalador invalida el campeón actual.
- Uso previsto restringido: investigación y demostración de portafolio. No está destinado a trading automatizado, decisiones de crédito ni alertas sin una política revisada por separado y un humano en el bucle.
- Riesgo de seguridad en la carga de artefactos: `scaler.pkl` está serializado con joblib/pickle y debe cargarse solo desde repositorios de confianza.
- Licencia MIT: permisiva y compatible con uso comercial del código y los pesos, pero el autor no ofrece garantías sobre el rendimiento en producción.
- No hay información sobre sesgos del modelo, y la información disponible no documenta comportamiento fuera del ticker `CL=F`.
- El repositorio no registra descargas ni valoraciones (0 descargas, 0 likes) en la fecha consultada, por lo que no existe validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DrAdrianDC/wti-lstm-autoencoder
- Repositorio de entrenamiento, afinado semanal y puerta de calidad: https://github.com/DrAdrianDC/WTI_Anomaly_Detection
- Resultados de la búsqueda web: no se ha encontrado ningún resultado relevante. Las cinco entradas devueltas corresponden a conversores de divisa EUR/INR (Xe, UnitConverters, Wise, Cambioeuro, Exchange-Rates.org) y no guardan relación con el modelo.
- Paper asociado: no disponible.
- Blog o demo adicional: no disponible.
