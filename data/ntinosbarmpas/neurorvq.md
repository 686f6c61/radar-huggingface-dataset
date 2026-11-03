# ntinosbarmpas/NeuroRVQ

## Resumen

NeuroRVQ es una familia de tokenizadores de biosenales y modelos fundacionales asociados, desarrollada por un equipo del Imperial College London en colaboración con Cogitat, la Universidad Nacional y Kapodistriaca de Atenas, la Universidad Aristóteles de Tesalónica y Northeastern University London. El trabajo se centra en resolver un problema concreto: los modelos fundacionales de biosenales (EEG, ECG, EMG, PPG) dependen de la calidad del tokenizador que convierte la señal cruda en una representación discreta, y los tokenizadores existentes pierden dinámica de alta frecuencia y fidelidad de reconstrucción.

La propuesta técnica es un tokenizador adaptativo por modalidad que descompone la señal en representaciones específicas de frecuencia mediante convoluciones temporales multi-escala, codifica cada escala en codebooks RVQ (residual vector quantization) jerárquicos y entrena con una pérdida consciente de la fase de Fourier. Sobre esa representación se entrena un modelo fundacional simple con predicción de tokens enmascarados (NeuroRVQ-FM), demostrando que la calidad del tokenizador es el factor crítico para el rendimiento downstream en tareas de BCI.

El repositorio de HuggingFace (2,3 GB) contiene pesos en formato `.pt` para tokenizadores y modelos fundacionales de EEG, EMG y ECG, además de un tokenizador de PPG. El modelo se presenta en NeurIPS 2026 y cuenta con paper en arXiv (2510.13068). No es un modelo de lenguaje: es un modelo de representación de señales fisiológicas, por lo que muchas de las especificaciones habituales de LLM no aplican.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador multi-escala con convoluciones temporales + transformer encoder + codebooks RVQ jerárquicos; modelo fundacional con masked-token prediction y enmascaramiento simétrico |
| Parametros totales | no disponible (el repo ocupa 2,3 GB e incluye múltiples checkpoints) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre parches de series temporales multivariantes) |
| Tipos de cuantizacion | RVQ (residual vector quantization) interna para tokenización; no se documentan cuantizaciones de pesos para inferencia |
| Idiomas soportados | no aplica (modelo de biosenales, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

El tokenizador segmenta la serie temporal multivariante en parches y los procesa con un encoder temporal multi-escala a varias resoluciones; las representaciones resultantes se combinan mediante un transformer encoder y se discretizan con codebooks RVQ por escala. La reconstrucción se realiza en el dominio espectral de Fourier, y la innovación clave es una pérdida de entrenamiento consciente de la fase que respeta la topología circular de la fase de Fourier, evitando los artefactos típicos de pérdidas puramente de magnitud. El diseño es adaptativo por modalidad: se ajustan la resolución temporal, el número y tamaño de los kernels temporales y la profundidad del RVQ según las características espectro-temporales de cada bioseñal.

El modelo fundacional (NeuroRVQ-FM) opera sobre los tokens discretos con predicción de tokens enmascarados y enmascaramiento simétrico, usando los codebooks aprendidos como objetivos de predicción. Esto permite preentrenamiento eficiente sobre datasets diversos de biosenales y transferencia a tareas downstream de BCI. La información disponible no detalla el número de tokens de entrenamiento ni la composición exacta de los datasets por modalidad.

## Capacidades

- Tokenización y reconstrucción de alta fidelidad de biosenales: EEG, ECG, EMG y PPG.
- Descomposición multi-escala en frecuencia con preservación de dinámica de alta frecuencia.
- Reconstrucción de señal en el dominio de Fourier con pérdida consciente de fase.
- Representaciones transferibles para tareas downstream de BCI (clasificación).
- Modelo fundacional con masked-token prediction y enmascaramiento simétrico.
- Adaptabilidad por modalidad mediante ajuste de resolución temporal, kernels y profundidad RVQ.
- No soporta tool calling, function calling, agentes ni generación de texto: no es un modelo lingüístico.
- Capacidades multilingües: no aplica.

## Casos de uso

- Clasificación de intención motora en BCI: el modelo fundacional EEG se usa como extractor de representaciones sobre ventanas de señal y se ajusta una cabeza de clasificación para tareas motoras, aprovechando que el tokenizador preserva dinámica de alta frecuencia relevante para potenciales motores.
- Detección de potenciales relacionados con eventos (ERP): el modelo EEG se aplica a tareas de ERP donde la fidelidad de reconstrucción y la preservación de fase son críticas para no degradar la morfología de la onda.
- Clasificación de estados de sueño: uso del modelo EEG preentrenado para segmentar y clasificar etapas de sueño a partir de registros polisomnográficos, con transferencia desde el preentrenamiento enmascarado.
- Monitorización cardíaca automatizada: el tokenizador y modelo ECG permiten comprimir y reconstruir señales ECG con alta fidelidad, habilitando pipelines de análisis de arritmias o compresión eficiente para transmisión.
- Análisis de actividad muscular: el modelo EMG se emplea para extraer representaciones de señales de electromiografía en aplicaciones de prótesis o interfaces musculares.
- Monitorización de saturación de oxígeno y variabilidad: el tokenizador PPG permite procesar señales de fotopletismografía para análisis cardiovascular o de sueño.
- Compresión y almacenamiento de biosenales: la tokenización discreta permite representar señales fisiológicas de forma compacta, útil para reducir costes de almacenamiento y transmisión en dispositivos wearables.
- Preentrenamiento y transferencia en nuevos datasets de BCI: el modelo fundacional sirve como base para fine-tuning en dominios con pocos datos etiquetados.

## Benchmarks y rendimiento

Resultados reportados en la model card para EEG (cinco tareas de clasificación; valores como media ± desviación). Se muestran los modelos comparados y los disponibles para NeuroRVQ según la información extraída:

| Modelo (parámetros backbone) | Motor | ERP | Memory | Sleep | Eyes |
|---|---|---|---|---|---|
| BIOT (3,2M) | 44,3±7,9 | 50,0±0,0 | 51,0±1,8 | – | 76,3±4,9 |
| MIRepNet (5,2M) | 68,9±8,6 | – | – | – | – |
| CBraMod (4,9M) | 61,4±10,4 | 77,7±5,2 | 57,4±3,8 | 63,5±4,1 | 83,9±4,1 |
| EEGPT (25,7M) | 31,3±3,5 | 66,8±14,6 | 52,0±1,7 | 63,4±4,4 | 79,7±3,7 |
| NeuroGPT (79,5M) | 68,2±8,3 | 75,7±4,8 | 59,7±2,9 | 67,4±3,3 | 82,7±3,6 |
| CSBrain (4,9M) | 67,1±11,1 | 76,5±5,7 | 57,0±3,5 | 67,2±3,8 | 81,9±4,0 |
| REVE (69,2M) | 69,4±10,5 | 82,6±4,3 | 59,3±3,2 | – | – |

La información disponible no incluye la fila completa de resultados de NeuroRVQ en esta tabla, por lo que no se presentan sus cifras. Tampoco se han publicado en la información disponible resultados de benchmarks para ECG, EMG o PPG.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo completo ocupa 2,3 GB e incluye múltiples checkpoints, por lo que cada modelo individual es sustancialmente menor.
- GPU recomendadas: no especificadas en la información disponible; por el tamaño de los backbones comparados (3-80M de parámetros) y del tokenizador, es plausible su ejecución en GPU consumer, pero no se confirma.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repo y la escala de los modelos comparados, aunque no se documenta explícitamente.
- Opciones de despliegue: los pesos están en formato `.pt` (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación con modelos fundacionales de biosenales de la misma categoría, según los datos de la model card:

| Modelo | Parámetros backbone | Contexto | Rendimiento EEG (Motor/ERP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeuroRVQ | no disponible | no disponible | no disponible en la información extraída | no disponible | HuggingFace (ntinosbarmpas/NeuroRVQ) |
| CBraMod | 4,9M | no disponible | 61,4 / 77,7 | no disponible | no disponible en la información |
| EEGPT | 25,7M | no disponible | 31,3 / 66,8 | no disponible | no disponible en la información |
| NeuroGPT | 79,5M | no disponible | 68,2 / 75,7 | no disponible | no disponible en la información |
| REVE | 69,2M | no disponible | 69,4 / 82,6 | no disponible | no disponible en la información |

La model card afirma que NeuroRVQ-FM alcanza rendimiento competitivo o superior a los modelos específicos de modalidad existentes, pero la información extraída no incluye la fila completa de resultados de NeuroRVQ para verificarlo numéricamente.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso conversacional es inaplicable.
- La licencia no está declarada en la información disponible, lo que impide confirmar si el uso comercial está permitido.
- No se documentan sesgos específicos, pero al entrenar sobre biosenales fisiológicas puede heredar sesgos de los datasets (población, dispositivos, condiciones de registro).
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de reconstrucción inexacta o de representaciones poco fiables fuera de la distribución de entrenamiento.
- La información disponible no detalla la composición de los datasets de entrenamiento ni el número de tokens, lo que limita la evaluación de cobertura por modalidad y población.
- El tokenizador de PPG solo incluye tokenizador, no modelo fundacional, según la tabla de la model card.
- Los resultados downstream publicados en la información disponible se limitan a EEG; el rendimiento en ECG, EMG y PPG no está cuantificado en la información accesible.
- El formato `.pt` requiere cargar los checkpoints con PyTorch; no hay conversiones documentadas a formatos de despliegue estándar.

## Enlaces

- HuggingFace: https://huggingface.co/ntinosbarmpas/NeuroRVQ
- Paper arXiv: https://arxiv.org/abs/2510.13068v4
- Web oficial: https://neurorvq.github.io
- Página NeurIPS 2026: https://neurips.cc/virtual/2026/poster/XXXXX (enlace placeholder en la model card)
- Perfil del autor principal: https://www.barmpas.com
