# brandonin/bwin-eeg-001

## Resumen

bWIN EEG-001 es un checkpoint de investigación publicado en HuggingFace por el usuario brandonin. Se trata de un modelo de continuación offline de señales EEG: a partir de 24 muestras de contexto en 64 canales, predice 64 muestras futuras a 125 Hz. La arquitectura combina una red recurrente con dos modos Wilson-Cowan excitatorio/inhibitorio, una geometría de electrodos de plantilla y un operador forward de tres capas. El modelo cuenta con 329.472 parámetros neuronales entrenados y 64 parámetros de varianza de horizonte ajustados.

Su propósito declarado es servir como baseline mecanístico inspeccionable y proporcionar una evaluación reproducible, no demostrar utilidad clínica ni precisión de última generación. El entrenamiento se realizó durante 50 épocas sobre 8.576 ventanas de 67 personas del dataset EEGMMIDB, con selección de época 18 sobre 680 ventanas de validación de 17 personas separadas. El test primario contiene 1.000 ventanas de 25 personas adicionales.

La relevancia del modelo radica en que documenta un resultado negativo de forma transparente: baselines más simples como EEGNet, VAR4 o AR16 obtienen mejor error cuadrático medio. Incluye además una divulgación de una enmienda de protocolo, lo que lo convierte en un caso útil para estudiar reproducibilidad y comparación de modelos en neurociencia computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red recurrente con dos modos Wilson-Cowan excitatorio/inhibitorio, geometría de electrodos de plantilla y operador forward de tres capas |
| Parametros totales | 329.472 parámetros neuronales + 64 parámetros de varianza de horizonte = 329.536 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 24 muestras de contexto (entrada) y 64 muestras de horizonte (salida) a 125 Hz |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (metadata); el modelo procesa señales EEG, no texto |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (se distribuye como checkpoint PyTorch; no se especifica safetensors) |
| Frecuencia de muestreo | 125 Hz |
| Canales | 64 canales EEG |
| Dataset de entrenamiento | EEGMMIDB (PhysioNet) |
| Preprocesamiento | Filtrado offline 0.5–45 Hz, remuestreo FFT a 125 Hz, referencia promedio, división por escala MAD de mediana de canal |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo de mezcla de expertos. Se compone de una red recurrente con dos modos Wilson-Cowan (excitatorio e inhibitorio) que evolucionan en el tiempo. Una geometría de electrodos de plantilla y un operador forward de tres capas elevan el contexto de 24 muestras a 256 soportes orientados distribuidos en 128 sitios geométricos de shell, y mapean la actividad recurrente de vuelta al espacio EEG de 64 canales. Los ocho grupos de parámetros (entrada, recurrente, sináptico, retardo, reposo, tasa, lectura y geometría) recibieron gradientes y se movieron durante el entrenamiento. La geometría es de ingeniería, no anatomía específica del sujeto, y la actividad latente no está validada como verdad cortical.

El entrenamiento usó 8.576 ventanas de 67 personas del dataset EEGMMIDB, con una selección de época 18 basada en 680 ventanas de validación de 17 personas separadas. El test primario consta de 1.000 ventanas de 25 personas adicionales. Solo se entrenó una semilla. Un piloto comunitario de diez épocas accedió al test set antes de fijarse el presupuesto final común de 50 épocas; esta enmienda de protocolo se documenta en `PROTOCOL_AMENDMENTS.md` y limita la interpretación como test confirmatorio. El preprocesamiento es offline (filtrado 0.5–45 Hz, remuestreo FFT a 125 Hz, referencia promedio y escala MAD) y utiliza información de la grabación completa, por lo que no establece rendimiento causal en streaming.

## Capacidades

- Predicción de continuación offline de EEG: dado un contexto de 24 muestras en 64 canales, genera 64 muestras futuras por canal.
- Salida de media y varianza: la API devuelve `mean` con forma `(N, 64, 64)` y `variance` con forma `(1, 64, 1)`, broadcastable sobre las predicciones.
- Inferencia por lotes: acepta entradas de forma `(N, 24, 64)`.
- Modelo mecanístico inspeccionable: permite analizar la evolución de parámetros Wilson-Cowan y comparar con baselines.
- No soporta tool calling, function calling, razonamiento multi-step, agentes, visión ni audio. No es un modelo de lenguaje.
- Capacidades multilingües: no aplica; procesa señales EEG, no texto.

## Casos de uso

- Reproducción de benchmark: el modelo permite reproducir exactamente el experimento descrito en la model card (con los splits y el reader de EEGMMIDB) para verificar los resultados publicados.
- Inspección de un baseline recurrente con restricción geométrica: investigadores pueden estudiar cómo los parámetros Wilson-Cowan se ajustan durante el entrenamiento y comparar su comportamiento con baselines estadísticos.
- Evaluación de modelos mejorados: sirve como punto de referencia para probar nuevos modelos de forecasting EEG, contrastando sus resultados con los fallos documentados en `FAILURE_MODES.txt` y `NEGATIVE_RESULTS.md`.
- Investigación en dinámica de redes neuronales: la arquitectura con modos excitatorio/inhibitorio permite explorar si las restricciones mecanísticas ayudan a interpretar la dinámica de la señal EEG.
- Desarrollo de pipelines de preprocesamiento EEG: el contrato de preprocesamiento (filtrado, remuestreo, referencia promedio, escala MAD) puede servir como referencia para estandarizar la entrada en otros pipelines.
- Educación en neurociencia computacional: por su tamaño reducido y su naturaleza inspeccionable, es útil para enseñar cómo incorporar restricciones físicas en redes recurrentes y cómo documentar resultados negativos.

## Benchmarks y rendimiento

| Modelo | Mean participant MSE ↓ | Gaussian NLL ↓ |
|---|---|---|
| EEGNet-style forecasting adaptation | 4.36540 | 2.15594 |
| ShallowConvNet-style forecasting adaptation | 4.42402 | 2.16210 |
| VAR4 | 4.44372 | 2.15332 |
| AR16 | 4.49087 | 2.15465 |
| bWIN EEG-001 | 4.49766 | 2.16987 |
| Zero prediction | 4.95339 | 2.21946 |
| Context mean | 7.24653 | 2.40039 |
| Persistence | 9.01631 | 2.48933 |

Estos son puntos estimados, no evidencia de que cada par difiera de forma fiable. EEGNet tiene menor MSE con un intervalo pareado del 95% para la diferencia bWIN menos EEGNet de [0.06397, 0.20310]. Las comparaciones a nivel de participante y la comparación separada de WBD-003/004 con cinco personas están en `evaluation/comparison.json` y `REPORT.md`; no se deben comparar directamente los valores de cinco personas con esta tabla. Los brazos comunitarios son adaptaciones de forecasting entrenadas, no evaluaciones de checkpoints de clasificación oficiales. LaBraM, BrainBERT, BENDR y The Virtual Brain se evalúan contextualmente en `COMMUNITY.md`; no se les asignan puntuaciones inventadas.

## Requisitos de hardware

- VRAM estimada: no disponible; la documentación no proporciona cifras. Dado el número de parámetros (329.536), la inferencia es viable en CPU.
- GPU recomendadas: no disponible; la model card solo menciona CPU con PyTorch 2.13.0.
- Consumer GPU: por tamaño, el modelo cabe en cualquier GPU de consumo, aunque no se indica oficialmente.
- Opciones de despliegue: la ejecución se realiza mediante el script `predict.py` o la API Python incluida. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- Requisitos de software: Python 3.12 o 3.13, PyTorch 2.13.0, NumPy 2.5.x, y el wheel local `win-0.0.0-py3-none-any.whl` (no un paquete `win` de un índice de paquetes).

## Comparativa con modelos similares

| Modelo | Tipo | MSE ↓ | NLL ↓ | Parámetros | Licencia |
|---|---|---|---|---|---|
| bWIN EEG-001 | Red recurrente Wilson-Cowan | 4.49766 | 2.16987 | 329.536 | Apache-2.0 |
| EEGNet-style forecasting adaptation | CNN adaptada a forecasting | 4.36540 | 2.15594 | No disponible | No disponible |
| ShallowConvNet-style forecasting adaptation | CNN adaptada a forecasting | 4.42402 | 2.16210 | No disponible | No disponible |
| VAR4 | Modelo autorregresivo vectorial | 4.44372 | 2.15332 | No disponible | No disponible |
| AR16 | Modelo autorregresivo | 4.49087 | 2.15465 | No disponible | No disponible |

No se dispone de especificaciones detalladas (parámetros, contexto, licencia) para los baselines comunitarios en la información proporcionada. La comparación se limita a las métricas de rendimiento del benchmark primario.

## Limitaciones y advertencias

- El modelo no demuestra utilidad clínica ni precisión de última generación; su valor es como baseline mecanístico y evaluación reproducible.
- Baselines más simples (EEGNet, VAR4, AR16) obtienen menor MSE. La diferencia con EEGNet tiene un intervalo pareado del 95% de [0.06397, 0.20310] para bWIN menos EEGNet, lo que indica que EEGNet es consistentemente mejor en este conjunto.
- Solo se entrenó una semilla; no hay evidencia de robustez frente a variaciones de inicialización.
- Un piloto comunitario de diez épocas accedió al test set antes de fijar el presupuesto final de 50 épocas, lo que impide considerar el test como confirmatorio intacto.
- La varianza predicha es una estimación de residuo de entrenamiento compartida entre canales y ejemplos, no una incertidumbre clínica individualizada.
- La geometría de electrodos es de plantilla, no anatomía específica del sujeto; la actividad latente no está validada como verdad cortical.
- El preprocesamiento usa información de la grabación completa (offline), por lo que el modelo no establece rendimiento en streaming causal.
- La entrada debe respetar exactamente el orden de canales de `manifest.json`; no se deben alimentar voltios, arrays normalizados arbitrarios ni otro montaje.
- No se distribuyen grabaciones de participantes; la entrada por defecto es sintética.
- Aunque la licencia Apache-2.0 permite uso comercial, hay obligaciones de atribución del dataset EEGMMIDB (PhysioNet, Open Data Commons Attribution 1.0) que deben preservarse al redistribuir el artefacto.
- No es un modelo de lenguaje: no soporta tool calling, agentes, visión ni audio.

## Enlaces

- HuggingFace: https://huggingface.co/brandonin/bwin-eeg-001
- Dataset EEGMMIDB (PhysioNet): https://physionet.org/content/eegmmidb/1.0.0/
- DOI de la referencia del dataset: https://doi.org/10.13026/C28G6P
- Los resultados de búsqueda web no aportan enlaces adicionales relevantes para este modelo concreto.
