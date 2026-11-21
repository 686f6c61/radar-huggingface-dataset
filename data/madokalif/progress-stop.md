# madokalif/progress-stop

## Resumen

`progress-stop` es un repositorio de checkpoints experimentales para robótica de manipulación, no un modelo de lenguaje al uso. Lo publica el usuario de Hugging Face `madokalif` y recoge decenas de variantes entrenadas sobre políticas visión-lenguaje-acción (VLA) como π0.5, RLDX-1 y PALM, con el objetivo de estudiar un problema muy concreto: conseguir que una política entrenada con demostraciones de CALVIN se detenga por sí sola tras completar una tarea, sin sacrificar la tasa de éxito.

El repositorio documenta tres rondas de experimentos de SFT (1.ª, 2.ª y 3.ª) más una línea de trabajo con canal STOP explícito entrenado mediante SFT y PPO sobre una política FlowSDE de RLinf. La conclusión central que reporta el autor es negativa: ningún modelo logró simultáneamente mantener la tasa de éxito y detenerse solo tras el éxito; los que mantenían el éxito no se detenían y los que se detenían perdían éxito. Solo los modelos entrenados con una instrucción explícita de stop obedecían dicha instrucción.

El interés actual del repositorio es metodológico: documenta con detalle fracasos, resultados retirados por fugas de datos (síntesis sobre la escena de evaluación D en lugar de las escenas de entrenamiento) y protocolos de evaluación con latencia, lo que lo convierte en material útil para quienes investigan etiquetado de progreso, detección de finalización de tarea y evaluación honesta en VLA. El tamaño del repositorio (1,15 TB) refleja que contiene muchos checkpoints completos, no un único modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Políticas VLA preexistentes: π0.5 (openpi), RLDX-1, PALM y RLinf FlowSDE (π0.5 con action expert); no se especifica la arquitectura interna en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de CALVIN son en inglés) |
| Licencia | no disponible |
| Formato de pesos | `model.safetensors` + `metadata.pt` + `assets` (π0.5); `model.pth` (PALM); formato propio del autor (RLDX-1); `model.safetensors` con 821 tensores compatibles con RLinf FlowSDE (modelos STOP) |
| Dimensión de acción | 8 (`action_dim=8`); el canal 7 se usa como canal STOP en los modelos `stoprl_*` |
| Entradas de imagen | 2 (frontal y muñeca); la tercera ranura se deja vacía |
| Entorno | CALVIN ABC (entrenamiento), escena D (evaluación) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura nueva, sino que reentrena y modifica políticas VLA existentes. La primera y segunda rondas parten de π0.5 (20 y 7 checkpoints respectivamente), con incursiones en RLDX-1 (3 checkpoints) y PALM (2 checkpoints). La tercera ronda combina el entrenamiento de la política con una cabeza de finalización (*done head*), con variantes en las que el gradiente de esa cabeza se propaga (`done`) o se desconecta (`detach`) de la política. Los datos de SFT proceden de demostraciones CALVIN aumentadas con distintos esquemas de relleno de parada: 9, 30 o 90 fotogramas de stop, longitudes aleatorias, stop al final de la instrucción (" then stop") o instrucciones de stop explícitas. Los conjuntos de datos asociados son `calvin-abc-plain`, `calvin-abc-stop0-h15`, `calvin-abc-stop0-h30`, `calvin-abc-stop0-h90`, `calvin-abc-retract-h30` y `calvin-abc-stop0-then-h30`.

La línea STOP usa una política FlowSDE de RLinf (`RLinf/RLinf-Pi05-CALVIN-ABC-D-RL-FlowSDE`) entrenada primero con SFT sobre 768 secuencias de rollouts en las escenas ABC (4 épocas, modelo completo incluido el VLM) y después con PPO durante 100 pasos, de los cuales se publica el paso 30 por ser el mejor en evaluación por bloques. En PPO solo se entrenan el *action expert* y la *value head*, manteniendo el VLM congelado. La innovación técnica destacable es el uso del canal 7 de acción como señal STOP: si la media del canal 7 en un chunk supera 0,5, el robot se detiene y espera la siguiente instrucción; las 8 primeras decisiones de cada subtarea no pueden emitir STOP. La recompensa PPO combina +1 por éxito real al llegar la siguiente instrucción, hasta +1 adicional por mantener el éxito y −0,02 por decisión de retraso del STOP tras el éxito real.

## Capacidades

- Ejecución de políticas de manipulación robótica en CALVIN (cadenas de hasta 5 subtareas consecutivas).
- Detección implícita de finalización de tarea mediante cabezas de progreso o de completado (`done head`).
- Emisión de señal STOP en el canal 7 de acción para detener el robot tras el éxito.
- Aprendizaje de instrucciones de parada explícitas ("stop command"): los modelos `stopcmd_*` se detienen al recibir la orden.
- Integración de estado del robot como entrada adicional (variantes `state7` y `state14`, con 7 y 14 valores de estado).
- Evaluación con latencia: el siguiente comando llega entre 2 y 10 segundos después del éxito real, lo que exige mantener la tarea completada durante ese intervalo.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, audio ni tool calling; el modelo es específicamente de robótica.

## Casos de uso

- Investigación sobre detección de finalización de tarea en VLA: usar los checkpoints `stop0*_done*` y `stop0*_done_detach*` para comparar si una cabeza de completado entrenada conjuntamente mejora la parada sin degradar la tasa de éxito en CALVIN.
- Estudio de etiquetado de progreso: los checkpoints `palm_time_e*` y `palm_phys_e5_s42` permiten reproducir experimentos con etiquetas temporales y físicas de progreso, incluida la corrección del etiquetado físico defectuoso de la ronda 2.
- Reproducción de experimentos de SFT con relleno de parada: los checkpoints `pad0`, `pad9`, `pad30`, `pad90` y `padrand` permiten medir el efecto de la longitud y el modo de relleno sobre la tasa de éxito y la parada espontánea.
- Entrenamiento y evaluación de políticas con canal STOP: los modelos `stoprl_h37_sft_flowsde_full_ep4` y `stoprl_h40_ppo_step30` sirven como punto de partida para reproducir el pipeline SFT + PPO con recompensas de éxito y penalización por STOP tardío.
- Reutilización del dataset de rollouts: `stoprl_h37_sft_data` (174 ficheros npz, unos 10 GB) permite entrenar detectores de finalización externos sin necesidad de ejecutar el simulador.
- Comparación entre familias de políticas: los checkpoints de RLDX-1 (`rldx_pad0_video`, `rldx_suffix_video`, `rldx_pad30_video`, `rldx_pad0_visual`, `rldx_pad0_b96`) permiten contrastar el comportamiento de parada frente a π0.5 en el mismo protocolo.
- Auditoría metodológica: el repositorio documenta explícitamente resultados retirados por contaminación de la escena de evaluación, útil como caso de estudio sobre validación y fugas de datos en robótica.

## Benchmarks y rendimiento

Los únicos datos cuantitativos publicados son la longitud media de cadena en la escena D (máximo 5) para los modelos STOP, con intervalos bootstrap del 95 % por secuencia:

| Modelo | Condición de evaluación | Longitud media de cadena | Intervalo 95 % |
|---|---|---|---|
| `stoprl_h37_sft_flowsde_full_ep4` | denoise 10 pasos, sin margen de STOP temprano | 4,22 | [3,95; 4,45] |
| `stoprl_h40_ppo_step30` | denoise 5 pasos, margen de 0,5 s | 4,51 | no disponible (Δ +0,31 frente al modelo inicial, [−0,02; +0,64]) |
| Modelo inicial de PPO | denoise 5 pasos, margen de 0,5 s | 4,20 | no disponible |
| `stoprl_h40_ppo_step100` | no disponible | 4,21 | no disponible |

El autor advierte que las cifras de SFT y PPO no son directamente comparables porque difieren en pasos de denoising y en la regla de margen. Además, la diferencia entre PPO paso 30 y el modelo inicial incluye el cero en su intervalo, por lo que no es concluyente. No se publican resultados de MMLU, HumanEval, GSM8K ni métricas estándar de lenguaje, y no se ofrecen tasas de éxito por checkpoint en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la información disponible; al tratarse de políticas VLA con codificador visual y modelo de lenguaje, el requisito es comparable al de π0.5, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. Por el tamaño del repositorio (1,15 TB) y la naturaleza de los checkpoints, se requiere almacenamiento considerable independientemente de la GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: los checkpoints π0.5 siguen el formato de openpi (`model.safetensors`, `metadata.pt`, `assets`); los modelos STOP son compatibles a nivel de tensores y dtype con RLinf FlowSDE. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Familia | Entorno | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `progress-stop` (este repo) | Checkpoints SFT de π0.5, RLDX-1, PALM y FlowSDE | CALVIN ABC → D | no disponible | no disponible | no disponible | Hugging Face, 1,15 TB |
| `RLinf/RLinf-Pi05-CALVIN-ABC-D-RL-FlowSDE` | π0.5 con action expert FlowSDE | CALVIN ABC → D | no disponible | no disponible | no disponible | Hugging Face (referencia del autor) |
| π0.5 (openpi) | VLA generalista | Múltiples | no disponible en la información | no disponible | no disponible | Público vía openpi |
| PALM | VLA con cabeza de progreso | CALVIN | no disponible | no disponible | no disponible | Checkpoints en este repo y modelo público citado por el autor |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El propio autor reporta que ningún modelo mantuvo la tasa de éxito y se detuvo solo tras el éxito; la utilidad práctica directa es limitada y el valor es principalmente experimental.
- Varios checkpoints tienen resultados retirados: `stop0_s42_10k`, `stop0then_s42_10k`, `retract_s42_10k`, `retract_s43_10k` y `palm_phys_raw_e5_s42` se entrenaron con datos sintetizados sobre la escena de evaluación D o con etiquetas físicas incorrectas.
- El checkpoint `palm_time_e1_s42_lr1.25e-4` corresponde a una comparación de tasa de aprendizaje que quedó sin conclusión porque el cargador se detuvo.
- Las métricas de SFT y PPO no son comparables entre sí por diferencias en pasos de denoising y en la regla de margen de STOP.
- La mejora de PPO paso 30 frente al modelo inicial no es estadísticamente concluyente (el intervalo incluye el cero).
- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Idiomas no declarados; las instrucciones de CALVIN están en inglés y no se documenta soporte multilingüe.
- Riesgo de sobreajuste a CALVIN ABC y de generalización limitada a la escena D; no hay evaluación fuera de ese entorno.
- El repositorio mezcla checkpoints, datos de entrenamiento (`stoprl_h37_sft_data`) y artefactos de registro; no es un paquete listo para producción y requiere conocer los pipelines de openpi y RLinf.
- No se documentan sesgos sociales ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo relevante es de fallo silencioso en la parada del robot, con posibles colisiones si el STOP no se emite.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/madokalif/progress-stop
- Repositorio de resultados y código: `Index-23227/vla-progress-label` (referenciado en la model card; ruta `calvin/RESULTS.ko.md`, sección 3.2, y `calvin/stop_rl/`)
- Política base FlowSDE: `RLinf/RLinf-Pi05-CALVIN-ABC-D-RL-FlowSDE`
- Datos de SFT: `madokalif/calvin-abc-plain`, `madokalif/calvin-abc-stop0-h15`, `madokalif/calvin-abc-stop0-h30`, `madokalif/calvin-abc-stop0-h90`, `madokalif/calvin-abc-retract-h30`, `madokalif/calvin-abc-stop0-then-h30`, `madokalif/calvin-abc-stop0-then-h30-cam`
- Datos de finalización: `calvin-completion-abc`, `calvin-completion-d-test`, `calvin-judge-frames-sft`, `calvin-completion-failure-examples-v1`
- Norm stats: `InternRobotics/InternData-Calvin_ABC/norm_stats.json`
- openpi (framework de π0.5): no disponible en la información
- RLinf (framework de la política FlowSDE): no disponible en la información
