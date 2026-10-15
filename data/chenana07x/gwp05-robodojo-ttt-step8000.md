# chenana07X/gwp05-robodojo-ttt-step8000

## Resumen

gwp05-robodojo-ttt-step8000 es un checkpoint de un experto de acciones robóticas perteneciente a la familia GWP-0.5 (Giga World Policy), entrenado sobre el split RoboDojo en modo delta. El modelo combina una base transformer congelada de GWP-0.5 (variante RoboDojo-delta) con un módulo de memoria de pesos rápidos de tipo RoboTTT (KVB, *test-time training*) insertado en los bloques 24 a 29. En esta etapa de entrenamiento solo se actualizan los parámetros lentos del mecanismo TTT, un total de 44,09 millones, mientras que el resto del transformer permanece congelado.

El checkpoint corresponde al mejor paso de validación de la fase TTT, el paso 8000, seleccionado mediante validación sobre un conjunto reservado con una pérdida `vad_action_loss` de 0,00162. Se publica junto con las estadísticas de normalización de acciones (`norm_stats_robodojo_gwp16d_delta.json`), necesarias para reproducir el espacio de acciones de 16 dimensiones en modo delta.

Su relevancia es doble: por un lado, es un ejemplo práctico de integración de memoria de pesos rápidos (fast weights) en políticas de manipulación robótica; por otro, los resultados publicados en la model card muestran una mejora modesta pero estadísticamente significativa (~6,2 % en `mae_14d`) frente a la variante sin TTT, y evidencia de que el estado persistente entre chunks no aporta ventaja sobre el reinicio por chunk en este benchmark concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer de difusion (action expert) con memoria de pesos rapidos TTT en los bloques 24-29; base GWP-0.5 congelada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenables en esta etapa | 44,09 M (solo parametros lentos TTT, claves `*.ttt.*`) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acciones roboticas, no de texto) |
| Licencia | no disponible |
| Formato de pesos | `diffusion_pytorch_model.bin` (PyTorch) + `config.json` |
| Libreria | diffusers |
| Tamano del repositorio | 24,3 GB |
| Espacio de acciones | 16D, modo delta |
| Estado en el paso | 8000 (mejor validacion de la etapa TTT) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `chenana07X/gwp05-robodojo-delta-step50000` (con pesos EMA) y aplica sobre el una fase de *test-time training* (TTT). Durante esta fase la base permanece congelada y solo se entrena el mecanismo de memoria de pesos rápidos, que se implementa en los bloques 24 a 29 del transformer. Este mecanismo sigue el estilo RoboTTT (KVB, *key-value binding*), es decir, un estado de memoria asociativo que se actualiza en tiempo de inferencia para adaptar la política al contexto de la secuencia de acciones. Solo se publican los pesos de esos parámetros TTT entrenados junto con la base congelada.

El entrenamiento se realiza sobre secuencias en chunks de tamaño S=8 con stride 48 y retropropagación truncada en el tiempo (TBPTT) de 2 pasos, a lo largo de 10.000 actualizaciones. El conjunto de datos es el split RoboDojo en modo *train-only*, con acciones expresadas en modo delta sobre un lienzo de 16 dimensiones. La selección del checkpoint final se hizo mediante validación periódica sobre datos reservados, escogiendo la iteración 8000 con `vad_action_loss = 0,00162`.

## Capacidades

- Generacion de acciones roboticas de manipulación en espacio de 16 dimensiones, en modo delta (incrementos respecto al estado previo).
- Prediccion de *action chunks* (secuencias de acciones), no de una sola acción por paso.
- Memoria de pesos rápidos ajustable en tiempo de inferencia (TTT) sobre los bloques 24-29, en dos modos: reinicio por chunk (E1) y adaptación con estado persistente entre chunks (E2).
- Aprendizaje de política por imitación sobre datos del split RoboDojo (no se documenta RLHF, DPO ni aprendizaje por refuerzo).
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling, agentes ni multimodalidad en el sentido de los LLM.

## Casos de uso

- Aprendizaje por imitación en manipulación robotica: el modelo se usa como politica que consume el estado y produce chunks de acciones delta de 16 dimensiones, adecuado para tareas de RoboDojo donde se dispone de demostraciones de entrenamiento en formato delta.
- Investigacion en memorias de pesos rapidos: sirve como referencia reproducible para medir el efecto de la memoria TTT en políticas de acción, comparando los modos E0 (sin TTT), E1 (reinicio por chunk) y E2 (estado persistente).
- Adaptacion en tiempo de inferencia: gracias al mecanismo TTT, la política puede ajustar su estado interno por chunk sin reentrenar la base, útil cuando la distribución de la tarea cambia ligeramente entre episodios.
- Evaluacion sim-to-real de políticas delta: el formato de acciones en delta y las estadísticas de normalización publicadas permiten reproducir el espacio de acciones en un simulador o en un banco de pruebas con la misma parametrización.
- Baseline para comparativas de memoria en robótica: al publicar resultados de *open-loop* con bootstrap emparejado, el checkpoint sirve como referencia para comparar nuevas arquitecturas de memoria frente al modo E0.
- Fine-tuning adicional de la cola TTT: dado que solo 44,09 M de parámetros son entrenables, es viable reajustar la memoria sobre nuevos dominios manteniendo congelada la base, reduciendo coste de cómputo y de almacenamiento.
- Reproduccion de experimentos academicos: el enlace al repositorio `giga-world-policy` (rama `mainTTT`) permite reproducir el pipeline completo de entrenamiento y evaluacion.

## Benchmarks y rendimiento

Resultados *open-loop* sobre el split de test (32 episodios, semilla 20261014), tal como se publican en la model card:

| Modo | mae_14d | seam | s/chunk |
|---|---|---|---|
| E0: TTT off (baseline) | 0,0262 | 4,14x | 0,30 |
| E1: reset por chunk | 0,0245 | 3,99x | 0,46 |
| E2: adaptar (estado persistente) | 0,0246 | 4,00x | 0,46 |

Bootstrap emparejado (n=32): E2 − E0 = −0,00163 (IC95 % [−0,00182, −0,00145]), mejora aproximada del 6,2 % frente al baseline. E1 y E2 son estadísticamente indistinguibles en este benchmark; el estado persistente entre chunks no aporta ganancia frente al reinicio por chunk.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 24,3 GB; asumiendo pesos en precisión de 16 bits, se estima una necesidad de VRAM de al menos ~25 GB solo para los pesos. Estimación orientativa, no confirmada por el autor.
- No se documentan GPU recomendadas ni configuraciones de referencia por parte del autor.
- No se documenta si cabe en GPUs de consumo (RTX 4090 con 24 GB queda en el limite del tamaño del repositorio y podria no ser suficiente segun el formato real de los pesos).
- Despliegue previsto mediante la libreria `diffusers` y PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- No se publican datos de latencia ni de throughput absolutos. La model card si reporta coste relativo por chunk en evaluacion *open-loop*: 0,30 s/chunk en E0 y 0,46 s/chunk en E1 y E2, es decir, el modo con memoria TTT añade aproximadamente un 53 % de coste por chunk.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. Como referencia cualitativa, la familia GWP-0.5 se situa en el espacio de las políticas de manipulación robotica tipo *action expert*, comparable en categoria a otras políticas basadas en transformers de difusion o vision-language-action (por ejemplo, OpenVLA, pi0 o GR00T N1). Sin embargo, no se aportan en la informacion disponible los parametros totales, el contexto, la licencia ni resultados comparados frente a esos modelos, por lo que la comparacion cuantitativa queda como no disponible.

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| gwp05-robodojo-ttt-step8000 | no disponible | no disponible | no disponible | HuggingFace (diffusers) | solo benchmark interno E0/E1/E2 |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribucion del checkpoint.
- Modelo especializado en acciones roboticas de 16 dimensiones en modo delta; no es un modelo de lenguaje ni un asistente conversacional.
- Los resultados publicados corresponden a un unico benchmark *open-loop* con 32 episodios y una semilla concreta (20261014); la generalizacion a otros entornos, robots o distribuciones de tareas no esta documentada.
- La mejora frente al baseline sin TTT es modesta (~6,2 % en `mae_14d`) y el propio autor indica que el modo persistente (E2) no supera al reinicio por chunk (E1), lo que limita el interes practico del estado entre chunks en este benchmark.
- El coste por chunk aumenta aproximadamente un 53 % con la memoria TTT activa (0,46 s/chunk frente a 0,30 s/chunk), lo que puede ser relevante en control en tiempo real.
- No se documentan sesgos, composicion del dataset RoboDojo ni cobertura de dominios, por lo que no es posible evaluar riesgos de sesgo ni de alucinacion en el sentido habitual de los modelos generativos.
- Al publicarse solo el checkpoint y las estadisticas de normalizacion, la reproducibilidad depende del codigo del repositorio `giga-world-policy` (rama `mainTTT`).
- No se documentan cuantizaciones ni formatos alternativos; el unico formato disponible es `diffusion_pytorch_model.bin`, lo que complica el despliegue en entornos con memoria limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chenana07X/gwp05-robodojo-ttt-step8000
- Checkpoint base de inicializacion: https://huggingface.co/chenana07X/gwp05-robodojo-delta-step50000
- Repositorio de codigo: https://github.com/zhujohn9604/giga-world-policy (rama `mainTTT`)
- Documento de detalle de ejecucion: `handoff/ROBODOJO_GWP05_TTT_EXECUTION.md` dentro del repositorio anterior
