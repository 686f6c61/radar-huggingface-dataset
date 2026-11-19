# eladlaor/sep-gemma-4-E2B-it

## Resumen

El Semantic Entropy Probe (SEP) para `google/gemma-4-E2B-it` es un clasificador lineal (regresión logística) que lee un estado oculto del modelo base Gemma 4 E2B instruct y predice si la entropía semántica de la respuesta sería alta. Lo desarrolla eladlaor como artefacto auxiliar de detección de alucinaciones, no como un modelo generativo autónomo. Sustituye el coste de muestrear N respuestas y comparar su significado por pares por un único forward pass sobre el prompt.

El problema que resuelve es el coste computacional de la entropía semántica como detector de alucinaciones: en lugar de generar diez respuestas y agruparlas por significado, el probe estima la probabilidad de entropía semántica alta directamente desde las activaciones internas del modelo. El score devuelto es p(high SE), es decir, la probabilidad de que la entropía semántica discreta de diez respuestas muestreadas supere el punto de corte γ* = 0,850 nats.

Es relevante porque demuestra que una sonda lineal sobre capas intermedias puede aproximar un detector caro con una AUROC competitiva: 0,780 frente a 0,790 de la entropía semántica completa en 200 preguntas de benchmark. El repositorio tiene 0 GB y 0 descargas en el momento de la consulta, lo que indica un artefacto de investigación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica lineal sobre estados ocultos concatenados de un transformer decoder (Gemma 4 E2B instruct) |
| Parametros totales | No disponible (el probe es un clasificador lineal; el backbone tiene 35 capas y hidden size 1536) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Gemma 4 E2B) |
| Tipos de cuantizacion | No disponible (el backbone se usa en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (artefacto de scikit-learn; repo de 0 GB) |

## Arquitectura y entrenamiento

El probe es una regresion logistica con penalizacion L2 (C = 1,0, solver lbfgs, max_iter = 1000, convergencia en 157 iteraciones, sin escalado de features). Lee los estados ocultos del backbone `google/gemma-4-E2B-it` en la revision `4adf15748de9e1a0097b6274cee9c15836c41c37` en bfloat16, concretamente las capas 19, 20, 21, 22 y 23 (numeracion del repo; probablemente 20-24 en la numeracion del paper) en la posicion TBG (token before generation), el ultimo token del prompt formateado con chat template, leido antes de generar. Los estados de las capas seleccionadas se concatenan en orden creciente. La seleccion de capas se hizo por nested cross-validation.

El entrenamiento usa 500 preguntas de calibracion (187 etiquetadas high SE y 313 low SE). Las etiquetas se obtuvieron muestreando 10 respuestas a temperatura 1,0 (top-p 0,95, top-k 64), maximo 64 tokens, agrupadas por significado con `microsoft/deberta-large-mnli` en la revision `7296194b9009373def4f7c5dad292651e4b5cf4e`. La entropia semantica discreta se binariza en γ* = 0,850 nats. El ajuste se realizo con scikit-learn 1.9.1 el 2026-11-18, con estados recogidos mediante transformers 5.19.0 y torch 2.14.1+cu130. La instruccion de respuesta usada es "Answer the following question as briefly as possible." y el chat template tiene SHA-256 `0a2c8073c878ab1da004bee933a998606537bbb62016310352c7285c3f01c5b5`.

## Capacidades

- Prediccion de p(high SE): probabilidad de que la entropia semantica discreta de 10 respuestas muestreadas supere 0,850 nats.
- Deteccion de riesgo de alucinacion como senal auxiliar (AUROC 0,780 en benchmark held-out de 200 preguntas).
- Inferencia en un solo forward pass sobre el prompt, sin muestreo multiple ni comprobaciones de significado por pares.
- Verificacion de compatibilidad estricta: el detector rechaza puntuar si el backbone no es la misma revision, mismo numero de capas, hidden size, chat template e instruccion de respuesta.
- Integracion con `hallucinations-math-lab` mediante `SEP_PROBE_PATH=hf://eladlaor/sep-gemma-4-E2B-it@v2`.
- Calibracion de umbral configurable via `SEP_THRESHOLD` y `eval.calibrate_threshold`.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un clasificador, no un modelo generativo.

## Casos de uso

- Enrutado de escalado en produccion: usar el score p(high SE) como senal para derivar consultas a un modelo mayor o a un revisor humano cuando supera el umbral calibrado (por ejemplo, 0,0002279 con TPR 0,886 y FPR 0,434 en el conjunto de entrenamiento).
- Deteccion de alucinaciones en pipelines RAG: puntuar cada prompt antes de generar para decidir si se requiere verificacion adicional de la respuesta, con un coste de un forward pass en lugar de diez muestreos.
- Evaluacion de calidad de respuestas en batch: predecir la entropia semantica esperada de un conjunto de preguntas sin generar respuestas, util para priorizar revision manual.
- Monitorizacion en linea de un asistente basado en Gemma 4 E2B: integrar el probe como detector `semantic_entropy_probe` en `hallucinations-math-lab` y registrar la distribucion de scores por dominio.
- Investigacion en deteccion de alucinaciones: comparar la senal del probe con `predictive_entropy`, `semantic_entropy` y `discrete_semantic_entropy` sobre el mismo benchmark para estudiar correlaciones.
- Control de costes en sistemas de generacion: sustituir la entropia semantica completa por el probe en escenarios donde el muestreo multiple es prohibitivo, aceptando una ligera perdida de AUROC (0,780 frente a 0,790).
- Filtrado previo en conjuntos de datos de instrucciones: marcar preguntas con alta probabilidad de respuesta ambigua o alucinada antes de incluirlas en un dataset de entrenamiento.

## Benchmarks y rendimiento

Resultados en 200 preguntas de benchmark held-out (ninguna de entrenamiento, 133 alucinadas segun la respuesta greedy sin alias de ground truth), AUROC contra alucinacion con intervalo de confianza bootstrap al 95%:

| Detector | AUROC | IC 95% |
|---|---|---|
| `predictive_entropy` | 0,750 | 0,679–0,817 |
| `semantic_entropy_probe` | 0,780 | 0,707–0,847 |
| `semantic_entropy` | 0,790 | 0,733–0,847 |
| `discrete_semantic_entropy` | 0,791 | 0,735–0,848 |

Cross-validation anidada (5 folds en bucle externo e interno) sobre el conjunto de entrenamiento, AUROC frente a SE binarizada, media ± desviacion tipica entre folds:

| Posicion del token | Capas (repo) | Capas (paper, probable) | AUROC nested-CV | AUROC capa L sola |
|---|---|---|---|---|
| TBG (servido) | 19, 20, 21, 22, 23 | 20, 21, 22, 23, 24 | 0,800 ± 0,026 | 0,792 ± 0,041 |
| SLT | 15, 16, 17, 18, 19 | 16, 17, 18, 19, 20 | 0,804 ± 0,036 | 0,712 ± 0,047 |

Umbral recomendado por entrenamiento: 0,0002279091383144719 (Youden's J sobre probabilidades out-of-fold contra error del modelo). En las filas de entrenamiento marca errores con TPR 0,886, FPR 0,434 y tasa de escalado 0,728. El valor por defecto de `SEP_THRESHOLD` es 0,5, un placeholder no calibrado.

## Requisitos de hardware

- El probe en si es un clasificador lineal de coste despreciable; el coste real es el forward pass del backbone Gemma 4 E2B en bfloat16.
- VRAM estimada para el backbone: no disponible en la informacion proporcionada (depende del tamano total de Gemma 4 E2B, no especificado).
- GPU recomendadas: no disponible. El backbone usa CUDA 13.0 y torch 2.14.1+cu130 en el entorno de entrenamiento.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `hallucinations-math-lab` con el detector `semantic_entropy_probe` y `SEP_PROBE_PATH=hf://eladlaor/sep-gemma-4-E2B-it@v2`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El probe elimina los 10 muestreos de la entropia semantica, por lo que reduce el coste a un unico forward pass, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | AUROC held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `semantic_entropy_probe` (este) | Probe lineal sobre Gemma 4 E2B | No disponible | No disponible | 0,780 | Apache 2.0 | Hugging Face |
| `semantic_entropy` (Kossen et al.) | Detector por muestreo multiple | N/A (metodo) | N/A | 0,790 | No disponible | Implementado en `hallucinations-math-lab` |
| `discrete_semantic_entropy` | Detector por muestreo multiple | N/A (metodo) | N/A | 0,791 | No disponible | Implementado en `hallucinations-math-lab` |
| `predictive_entropy` | Detector por entropia predictiva | N/A (metodo) | N/A | 0,750 | No disponible | Implementado en `hallucinations-math-lab` |

La comparativa relevante es contra los otros detectores del mismo framework, no contra modelos generativos: el probe es un artefacto auxiliar especifico del backbone Gemma 4 E2B en una revision concreta.

## Limitaciones y advertencias

- El score es p(high SE), no una probabilidad de alucinacion ni una entropia en nats; interpretarlo como tal induce a error.
- El probe fue entrenado para imitar SE binarizada, no para detectar errores directamente; su AUROC debe leerse junto a la de SE en las mismas preguntas.
- Solo es valido para el backbone `google/gemma-4-E2B-it` en la revision `4adf15748de9e1a0097b6274cee9c15836c41c37`, con 35 capas, hidden size 1536, el chat template con SHA-256 `0a2c8073...` y la instruccion "Answer the following question as briefly as possible.". El detector rechaza puntuar en caso contrario.
- El umbral por defecto (0,5) no esta calibrado; hay que calibrar `SEP_THRESHOLD` sobre un conjunto de desarrollo propio con `eval.calibrate_threshold`.
- La calibracion se hizo con 500 preguntas y 10 muestras por pregunta a temperatura 1,0; el comportamiento fuera de esa distribucion no esta caracterizado.
- La numeracion de capas del paper (Kossen et al.) es una hipotesis no verificada; el propio autor lo indica.
- No se documentan sesgos conocidos, limitaciones de idioma ni restricciones adicionales de licencia comercial mas alla de Apache 2.0 y la licencia del backbone Gemma 4, enlazada en la model card.
- El repositorio tiene 0 descargas y 0 likes en la fecha de consulta; es un artefacto de investigacion sin validacion externa publica.
- El rendimiento held-out (AUROC 0,780) es inferior al de la entropia semantica completa (0,790) y al de la version discreta (0,791); el ahorro computacional tiene un coste en calidad de deteccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eladlaor/sep-gemma-4-E2B-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de calibracion: https://huggingface.co/datasets/eladlaor/sep-gemma-4-E2B-it-calibration
- Repositorio de software: https://github.com/eladlaor/hallucinations-math-lab
- Commit de referencia: https://github.com/eladlaor/hallucinations-math-lab/tree/38eded82b18454189356373e465ed1c6cb034290
- Paper de referencia (Kossen et al., 2024): https://arxiv.org/abs/2406.15927
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
