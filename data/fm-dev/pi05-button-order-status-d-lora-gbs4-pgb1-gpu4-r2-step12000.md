# fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step12000

## Resumen

Este repositorio contiene un adaptador LoRA de rango 32 sobre el modelo π0.5, una política visión-lenguaje-acción (VLA) desarrollada por el usuario `fm-dev` para control robótico. En concreto, se trata del segundo ciclo de ajuste fino (etiquetado `r2`) para la tarea **button_order** sobre un brazo Franka, publicado en el checkpoint 12.000 de un entrenamiento que debía alcanzar los 12.500 pasos de optimizador. El modelo no es un modelo de lenguaje conversacional: es una política que produce comandos de acción absolutos a partir de observaciones visuales y de estado.

El entrenamiento se realizó localmente en 4 GPU RTX A6000 con batch global 4 y batch por GPU 1, sin acumulación de gradiente, usando AdamW, semilla 42, warmup de 250 pasos hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500. El checkpoint publicado representa 48.000 exposiciones de muestra. La variante `Status-D` introduce un condicionamiento explícito por eventos de estado: 32 fotogramas muestreados uniformemente sobre el prefijo observado del episodio más un keyframe opcional del *Writer*, lo que suma 528 tokens visuales, junto con un subobjetivo actual y contexto de transición.

Su relevancia es acotada pero clara: es un artefacto de investigación reproducible que incluye pesos EMA para serving, assets de normalización e historial, código de inferencia, versiones exactas de dependencias y estado completo de reanudación (optimizador, RNG y sampler). No se ha publicado ninguna evaluación que demuestre tasa de éxito en robot real, y el propio autor advierte que la publicación intermedia no constituye una evaluación de calidad de la política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 32 sobre el modelo base π0.5 (política visión-lenguaje-acción); la arquitectura interna del base no se detalla en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica: no se describe una arquitectura MoE |
| Longitud de contexto | no disponible; el condicionamiento de estado usa contexto de 48 pasos, 32 fotogramas muestreados más 1 keyframe del Writer (528 tokens visuales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no documenta capacidades multilingües) |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente; el repositorio incluye pesos EMA para serving, assets de normalización e historial, código de inferencia y estado de reanudación completo |
| Tamano del repositorio | 12,8 GB |
| Hiperparametros de entrenamiento | AdamW, LoRA r=32, seed 42, warmup 250 pasos a 5e-5, decaimiento coseno a 5e-6 en el paso 12.500, EMA 0,999^4 = 0,996005996001 |
| Hardware de entrenamiento | 4 x NVIDIA RTX A6000, batch global 4, batch por GPU 1, sin acumulación de gradiente |
| Forma de salida | (20, 8): xyz absoluto, cuaternión XYZW unitario en la carta de qx positiva y comando de gripper en [0,1] |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 sobre π0.5, no un modelo entrenado desde cero. La model card no documenta la arquitectura del modelo base (número de parámetros, tipo de encoder visual, mecanismo de atención ni esquema de *flow matching*), por lo que esos datos quedan como no disponibles. Lo que sí se documenta con detalle es el procedimiento de ajuste: segundo ciclo (`r2`) de fine-tuning, separado del experimento original de 6.250 pasos, entrenado en 4 RTX A6000 con batch global 4 y batch por GPU 1, sin acumulación de gradiente, AdamW y semilla 42. Los checkpoints se guardan cada 1.000 actualizaciones y en el paso final 12.500; el publicado corresponde al paso 12.000 (48.000 exposiciones de muestra).

La innovación técnica destacable es el condicionamiento `Status-D`. El modelo recibe 32 fotogramas muestreados uniformemente sobre el prefijo completo del episodio [0,t] más un keyframe opcional del *Writer* (528 tokens visuales en total), junto con el subobjetivo actual del *Writer*. El *Writer* se inicializa al comienzo de la ejecución y se actualiza en los eventos de Status. Este condicionamiento temporal offline se proyecta con estimaciones gruesas de eventos, y el autor aclara explícitamente que se trata de condicionamiento de profesor, no de un *rollout* con estados predichos en línea. El contexto de Status consta de 48 pasos con comandos de pose registrados y estado medido; la característica de comando de gripper está desactivada de forma consistente en entrenamiento e inferencia y los *embeddings* de estado histórico están deshabilitados. Solo las filas de ejecución del robot supervisan las acciones; las imágenes de demostración y las coordenadas originales de episodio y fotograma se conservan como historial. Las etiquetas no revisadas permanecen enmascaradas y las componentes de acción desconocidas quedan como NaN/false, enmascaradas tanto en el condicionamiento de flujo como en la pérdida.

## Capacidades

- Generación de comandos de acción robótica: produce *chunks* de 20 pasos de acción con 8 dimensiones cada uno (xyz absoluto, cuaternión XYZW unitario y comando de gripper en [0,1]).
- Control de un brazo Franka en la tarea button_order, con la convención de pose cartesiana del controlador de recogida de datos.
- Condicionamiento por eventos de estado (Status-D): acepta `history_keyframe_index` (un fotograma observado o None), `current_subgoal` e inputs causales `transition_context_*`, y devuelve una salida adicional `transition_status`.
- Gestión de historial visual mediante la función `observe(policy, base_rgb, state)`, que debe invocarse en cada fotograma observado, incluidas las demostraciones, con reinicio entre episodios.
- Supervisión selectiva: solo las filas de ejecución del robot supervisan acciones, mientras que las demostraciones se mantienen como historial.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, audio ni *tool calling* o uso de agentes; es una política de control, no un asistente.

## Casos de uso

- Control de manipulación en robot real: la política se carga con `load()` desde el propio bundle y se ejecuta en bucle cerrado sobre un Franka para la tarea button_order, alimentando cada fotograma observado mediante `observe()` para mantener el historial visual.
- Investigación en condicionamiento temporal de políticas VLA: sirve como artefacto reproducible para estudiar cómo el subobjetivo actual y los eventos de Status afectan a la generación de acciones, dado que el repositorio incluye el esquema del *Writer* y su programación exportada.
- Replicación y comparación de experimentos: al publicar el estado completo de reanudación (optimizador, RNG y sampler) y las versiones exactas de dependencias, permite retomar el entrenamiento en el paso 12.000 o comparar el ciclo `r2` con el experimento original de 6.250 pasos.
- Evaluación offline de políticas: el bundle permite construir *harnesses* de evaluación sobre datos registrados, teniendo en cuenta la advertencia del autor de que dicha evaluación no establece tasa de éxito en robot real.
- Ajuste fino posterior o *curriculum*: al ser un adaptador LoRA de rango 32 sobre π0.5, puede servir como punto de partida para nuevos ciclos de ajuste en tareas relacionadas que compartan la convención de pose y el esquema de salida.
- Docencia y formación en robótica de imitación: ilustra un caso completo de entrenamiento distribuido en 4 GPU con supervisión parcial, enmascarado de componentes no supervisadas y uso de pesos EMA para serving.
- Serving con pesos EMA: el repositorio incluye los pesos EMA (0,996005996001) para inferencia, lo que permite desplegar una versión suavizada de la política sin necesidad de reconstruir el promedio a partir de los checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la publicación intermedia no es una evaluación de calidad de la política y que, en caso de incluirse evaluación offline, esta no establece la tasa de éxito en robot real. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de métricas de manipulación (por ejemplo, tasa de éxito por episodio).

| Benchmark | Resultado | Notas |
|---|---|---|
| No disponible | No disponible | No se publican metricas de rendimiento en la informacion proporcionada |

## Requisitos de hardware

- Entrenamiento documentado: 4 x NVIDIA RTX A6000, con batch global 4, batch por GPU 1 y sin acumulación de gradiente. No se documenta uso de precisión mixta, *gradient checkpointing* ni técnicas de ahorro de memoria.
- Repositorio: 12,8 GB, cifra que incluye pesos EMA, assets de normalización e historial, código de inferencia y estado completo de reanudación (no-EMA, optimizador, RNG y sampler). No equivale al peso del modelo en memoria durante la inferencia.
- VRAM de inferencia: no disponible. No se publica el número de parámetros del modelo base ni de los adaptadores, por lo que no puede derivarse una cifra fiable. A modo de referencia, el tamaño del repositorio incluye estado de entrenamiento que no se carga en serving.
- GPU recomendadas: no disponible en la informacion proporcionada; el único hardware mencionado por el autor es el de entrenamiento (RTX A6000).
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse sin conocer el tamaño real del modelo.
- Opciones de despliegue: el autor documenta un bundle propio de inferencia (`from load_model import load, observe; policy = load()`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a una política de control robótico con salida continua de acciones.
- Latencia y throughput: no disponibles. La cadencia de control vendrá impuesta por el bucle de ejecución del robot y por el coste de inferencia de cada *chunk* de 20 acciones.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no publica parámetros, contexto, licencia ni métricas, y los resultados de la búsqueda web no contienen información relevante sobre este modelo ni sobre alternativas comparables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step12000 | no disponible | no disponible (contexto de estado de 48 pasos, 528 tokens visuales) | no disponible | no disponible | HuggingFace, 0 descargas |
| π0.5 base | no disponible en la model card | no disponible | no disponible | no disponible | Modelo base referenciado, no enlazado |
| Otras politicas VLA publicadas (p. ej. OpenVLA, π0, GR00T N1) | no disponible | no disponible | no disponible | no disponible | No se han encontrado referencias en la busqueda web realizada |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada, ni offline ni en robot real, que permita estimar la calidad de la política.
- Advertencia explícita del autor: la publicación intermedia no es una evaluación de calidad de la política y la evaluación offline, si se incluye, no establece la tasa de éxito en robot real.
- Procedencia de las etiquetas: la revisión es "agent/model review", no verdad humana (*ground truth*). Las ventanas no revisadas permanecen enmascaradas y solo las positivas de span de Status usan corchetes de eventos soportados.
- Componentes sin supervisión: el autor lista componentes totalmente no supervisadas como **[]**. En particular, la salida de gripper de Shuffle no tiene supervisión de comando y no debe interpretarse como control de gripper aprendido. Button Order cuenta solo con etiquetas verificadas limitadas de comando cerrado.
- Timing del Writer: el timing offline se proyecta con estimaciones gruesas de eventos y es condicionamiento de profesor, no un *rollout* con Status predicho en línea.
- Restricciones de integración: la convención de pose cartesiana del efector final y de la herramienta debe coincidir con el controlador de recogida; no debe aplicarse un desplazamiento adicional de herramienta o brida.
- Gestión de estado obligatoria: el historial debe actualizarse con `observe()` en todos los fotogramas observados (incluidas demostraciones) y reiniciarse entre episodios; no hacerlo invalida el condicionamiento.
- Requisitos específicos de Status-D: exige `history_keyframe_index`, `current_subgoal` e inputs causales `transition_context_*`, además del calendario del Writer exportado y el fotograma de control correspondiente.
- Característica desactivada: el comando de gripper del contexto de Status está deshabilitado de forma consistente en entrenamiento e inferencia.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribución del modelo o de sus derivados.
- Idiomas no documentados: al no ser un modelo de lenguaje, no aplica soporte multilingüe; se advierte para evitar expectativas incorrectas de uso como modelo conversacional.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step12000
- Archivo de configuración de entrenamiento dentro del repositorio: `training_config.json`
- Código de carga e inferencia dentro del repositorio: `load_model.py` (funciones `load` y `observe`)
- Resultados de la búsqueda web: no se ha encontrado ningún paper, blog, repositorio o demo relevante sobre este modelo. Los resultados devueltos corresponden a páginas de radio en línea (radio-en-ligne.fr, fr.wikipedia.org/wiki/Radio_FM, last.fm, cheriefm.fr, radio-en-direct.app) y no guardan relación con el modelo.
