# dhruvsetty/spde-gmrf-lane-perception

## Resumen

`dhruvsetty/spde-gmrf-lane-perception` no es un modelo de lenguaje, sino un artefacto de inferencia dividida (split inference) para percepción de carril en conducción automatizada. Combina un campo espacial estimado mediante factorización dispersa de precisión sobre SPDE-GMRF (Stochastic Partial Differential Equation - Gaussian Markov Random Field) ejecutado en GPU con cuSPARSE y cuDSS, y un clasificador int8 que etiqueta cada muestra de posición de carril como calm, alert, stressed o panic, ejecutado en un microcontrolador Arm Cortex-M4F con CMSIS-NN. El trabajo pesado reside en el host; el dispositivo solo ejecuta una recursión pequeña.

El modelo resuelve el problema de estimar la posición del carril y detectar estados de comportamiento anómalos (episodios de pánico) con un coste computacional mínimo en el extremo. El clasificador int8 requiere únicamente 40 multiplicaciones-acumulaciones y 1.802 bytes de flash, lo que lo hace viable en hardware embebido de bajo consumo. El host ajusta un modelo de cómo cada tramo de la ruta desplaza la posición del carril y envía al dispositivo una corrección int16 por sitio.

Es relevante en el contexto de sistemas ADAS y robótica embebida porque demuestra que la inferencia estadística bayesiana estructurada (GMRF/SPDE) puede dividirse entre un host con GPU y un MCU, manteniendo una concordancia del 99,66% entre las variantes int8 y float. Todos los datos y estudios son simulados, por lo que su validez en dominios reales está por demostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SPDE-GMRF (campo espacial gaussiano de Markov) + clasificador int8 feedforward |
| Parametros totales | no disponible (clasificador: 40 MACs, 1.802 bytes de flash) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de percepción, no secuencial) |
| Tipos de cuantizacion | int8 (clasificador en dispositivo); int16 (correcciones host-dispositivo); float (referencia en host) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (artefacto de inferencia dividida; código en GitHub) |

## Arquitectura y entrenamiento

La arquitectura se divide en dos componentes. En el host, la factorización dispersa de precisión sobre un campo SPDE-GMRF estima el campo espacial que modela cómo cada tramo de la ruta desplaza la posición del carril; se implementa con cuSPARSE y cuDSS sobre GPU NVIDIA. En el dispositivo, un clasificador int8 de 40 multiplicaciones-acumulaciones recibe una corrección int16 por sitio y etiqueta cada muestra como calm, alert, stressed o panic mediante una recursión pequeña ejecutada con CMSIS-NN en un Cortex-M4F.

No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición del dataset de entrenamiento más allá de que los datos son simulados. Los estudios publicados en la model card incluyen robustez al ruido (ruido de emisión escalado de 0,5 a 2 veces el valor por defecto, 5 semillas × 2.000 pasos por nivel), detección de pánico y recuperación de parámetros (40 campos simulados, mediana de kappa_hat/kappa_true = 0,983 y de tau_hat/tau_true = 1,013, todos dentro del 20% del valor real). No se menciona RLHF, DPO ni decodificación especulativa.

## Capacidades

- Clasificación de estado de comportamiento en cuatro clases (calm, alert, stressed, panic) por muestra de posición de carril.
- Estimación de campo espacial mediante SPDE-GMRF con factorización dispersa de precisión en GPU.
- Inferencia dividida host-dispositivo con correcciones int16 por sitio.
- Ejecución en microcontrolador Arm Cortex-M4F con CMSIS-NN (40 MACs, 1.802 bytes de flash).
- Robustez al ruido de emisión: concordancia int8/float ≥ 99,25% de los pasos en todos los niveles de ruido probados.
- Detección de episodios de pánico: 151 de 157 episodios simulados detectados, con 0,64% de falsos positivos y retardo medio de 0,28 muestras tras la entrada.
- Recuperación de parámetros del campo dentro del 20% del valor real en los 40 campos simulados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Detección de episodios de pánico en conducción simulada: el clasificador int8 embebido etiqueta cada muestra de posición de carril y detecta transiciones a estado de pánico con 0,28 muestras de retardo medio, adecuado para validación de sistemas ADAS en banco de pruebas.
- Percepción de carril en hardware embebido de bajo consumo: el clasificador cabe en 1.802 bytes de flash y 40 MACs, lo que permite integrarlo en MCUs Cortex-M4F sin acelerador NPU.
- Validación de robustez frente a ruido de sensores: los estudios de ruido (0,5× a 2× el valor por defecto) permiten evaluar la degradación del sistema antes de desplegarlo en vehículo real.
- Prototipado de inferencia dividida host-dispositivo: sirve como referencia para arquitecturas donde la GPU del host estima el campo y el MCU ejecuta la recursión, útil en pipelines de robótica y automoción.
- Recuperación de parámetros de campo espacial: la validación de kappa y tau en 40 campos simulados permite calibrar modelos GMRF en entornos controlados.
- Investigación en percepción bayesiana estructurada: el código y los datos simulados permiten reproducir los experimentos de detección de ruido y recuperación de parámetros.
- Evaluación de cuantización int8 en MCU: la concordancia del 99,66% con la variante float sirve para medir el impacto de la cuantización en tareas de clasificación de estado.

## Benchmarks y rendimiento

Los datos publicados en la model card son estudios simulados, no benchmarks estándar (MMLU, HumanEval, GSM8K no aplican):

| Estudio | Metrica | Resultado |
|---|---|---|
| Concordancia int8/float | Muestras con etiqueta idéntica | 99,66% |
| Robustez al ruido (0,5×–2×) | Diferencia de precisión int8 vs float | ≤ 0,04 puntos (de 99,49% a 79,68%) |
| Concordancia int8/float bajo ruido | Pasos con acuerdo | ≥ 99,25% |
| Detección de pánico | Episodios detectados | 151 de 157 |
| Detección de pánico | Retardo medio tras entrada | 0,28 muestras |
| Detección de pánico | Tasa de falsos positivos | 0,64% |
| Recuperación de parámetros | Mediana kappa_hat/kappa_true | 0,983 |
| Recuperación de parámetros | Mediana tau_hat/tau_true | 1,013 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Host: GPU NVIDIA con soporte para cuSPARSE y cuDSS (factorización dispersa de precisión). No se especifica VRAM mínima.
- Dispositivo: microcontrolador Arm Cortex-M4F con CMSIS-NN; el clasificador ocupa 1.802 bytes de flash y 40 MACs por muestra.
- No cabe en GPU consumer como modelo único porque no es un modelo de lenguaje; el componente de dispositivo está pensado para MCU, no para GPU.
- Opciones de despliegue: cuSPARSE y cuDSS en host; CMSIS-NN en Cortex-M4F. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; el retardo de detección se expresa en muestras (0,28 muestras), no en tiempo.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (percepción de carril con SPDE-GMRF e inferencia dividida en MCU).

## Limitaciones y advertencias

- Todos los datos y estudios son simulados; no hay validación en conducción real ni en datasets públicos de percepción de carril.
- El retardo de detección se expresa en muestras, no en tiempo, lo que dificulta comparar con sistemas en tiempo real.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código, matemáticas, visión ni tool calling.
- No se dispone de información sobre sesgos, alucinación o limitaciones de idioma porque no aplica a esta categoría de modelo.
- La licencia MIT permite uso comercial, pero la ausencia de validación en dominio real supone un riesgo para producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad.
- La fecha de creación (2026-11-20) es posterior a la fecha actual en muchos entornos, lo que puede indicar metadatos inconsistentes.

## Enlaces

- Hugging Face: https://huggingface.co/dhruvsetty/spde-gmrf-lane-perception
- Dataset: https://huggingface.co/datasets/itsdhruvsetty/spde-gmrf-lane-perception-vectors
- Demo (Space): https://huggingface.co/spaces/itsdhruvsetty/split-spde-gmrf-lane-perception
- Código fuente: https://github.com/dhruv-setty/spde-gmrf-lane-perception
- Write-up: https://dhruv-setty.github.io
