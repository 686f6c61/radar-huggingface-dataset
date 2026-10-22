# JonathanHawkins/asimov1-getup-handoff

## Resumen

`asimov1-getup-handoff` es una política de control entrenada por refuerzo (reinforcement learning) que permite al robot humanoide Asimov 1, de Menlo Research, levantarse del suelo y mantenerse de pie. No es un modelo de lenguaje: es un artefacto de robótica empaquetado en ONNX que consume observaciones proprioceptivas y emite consignas de articulación. Lo publica el usuario JonathanHawkins bajo licencia Apache-2.0 y su interés está en que resuelve un problema concreto y poco habitual: la transición entre una política de levantarse y la política de marcha del fabricante, que se ejecuta en el instante en que el robot ya está de pie.

El modelo se entrenó desde cero dentro del envelope velocidad-par publicado por Menlo y se evaluó en MuJoCo sobre 24 episodios por condición. Desde posición prona logra 24/24 levantamientos y 24/24 robots aún de pie a los 8 s; desde supina baja a 15/24 (62,5 %). La segunda mitad del trabajo es el handoff: la política de get-up cede el control a la política de marcha de Menlo mediante un predicado que solo usa gravedad proyectada y dos canales de encoder, sin depender de la altura del tronco ni de la lista de contactos, magnitudes que el robot real no puede medir.

Es relevante ahora por dos motivos técnicos, no por su rendimiento bruto: primero, demuestra que el historial de observaciones es imprescindible (congelado a un único fotograma repetido, los mismos pesos pasan de 48/48 a 0/48 levantamientos); segundo, cuantifica el coste del cambio de política (la velocidad articular peor caso al estar de pie cae de 252 °/s a 2,3 °/s). Todo ello es exclusivamente simulación: el autor indica de forma explícita que nunca se ha ejecutado en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada por reinforcement learning; topología de red no especificada en la información disponible (no es un transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de 390 floats (5 fotogramas apilados de 78 valores, el más reciente al final) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documenta cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (librería declarada: `onnx`) |

Otros datos del repositorio: ID `JonathanHawkins/asimov1-getup-handoff`, pipeline `reinforcement-learning`, etiquetas `robotics`, `humanoid`, `mujoco`, `asimov-1`, `locomotion`, `region:us`; 0 descargas, 0 likes, tamaño del repo 0,0 GB; creado el 2026-10-21 y actualizado el mismo día.

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, activaciones). Sí se documenta el contrato de entrada y el régimen de entrenamiento: la política consume cinco fotogramas apilados del layout de observación publicado por Menlo (78 floats por fotograma, 390 en total, el más reciente al final), y se entrenó desde cero en MuJoCo dentro del envelope velocidad-par (`dc`) del robot. En el momento del handoff se entrega el control a la política de marcha oficial de Menlo, que sostiene la postura hasta el final del episodio.

El hallazgo técnico central es que el historial es funcionalmente necesario, no una comodidad: si se congela la entrada a un único fotograma repetido, los mismos pesos levantan el robot 0 de 48 veces en lugar de 48 de 48. El motivo es que el vector de 78 floats no incluye velocidad lineal de la base ni estado de contacto, información que la marcha puede permitirse ignorar pero un get-up no, porque el problema consiste precisamente en gestionar momento y saber qué extremidad soporta carga. El predicado de handoff se diseñó para ser desplegable: usa solo gravedad proyectada y dos canales de encoder (codo y tobillo), pensados para evitar el falso positivo de un robot apoyado sobre los antebrazos, que un IMU leería como erguido. El autor señala además que nueve términos de recompensa orientados al mismo objetivo resultaron nulos y que el cambio de arquitectura lo resolvió en una tarde.

## Capacidades

- Levantarse desde posición prona (boca abajo) y mantenerse de pie: 24/24 episodios en MuJoCo con semillas 0-23.
- Levantarse desde posición supina (boca arriba): 15/24 episodios, con entrenamiento centrado en prona.
- Handoff automático a la política de marcha de Menlo en el instante en que el robot se considera de pie, mediante un predicado basado solo en observaciones disponibles en el robot real.
- Soportar empujones una vez de pie: 24/24 en la condición prona (los empujones se aplican solo tras alcanzar la postura).
- Estabilidad postural medida: error articular frente a la pose por defecto de 1,30° de media y 4,18° en el peor caso una vez asentado; velocidad articular peor caso de 2,3 °/s estando de pie con handoff (252 °/s sin él).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor.

## Casos de uso

- Validación de contratos de observación en robotica humanoide: ejecutar la política con 390 floats y comparar contra una versión congelada a un solo fotograma (0/48 levantamientos) sirve para justificar empíricamente por qué un get-up necesita historial y una marcha no; es el uso más directamente documentado por el autor.
- Estudio de transiciones entre políticas: el par get-up + walk policy con predicado desplegable permite medir el coste de un handoff (de 252 °/s a 2,3 °/s de velocidad articular pico) y compararlo con alternativas como mezcla de acciones o términos de recompensa, que el autor reporta como ineficaces.
- Pruebas de envelope de par en simulador: comparar el envelope velocidad-par `dc` con un clamp plano por grupo (que degrada el resultado a 14/24 levantamientos y 6/24 permanencias) para caracterizar cuánto depende una política de las restricciones de actuador con las que se entrenó.
- Evaluación de robustez ante perturbaciones: la batería de empujones posteriores al levantamiento (24/24 superados) sirve como test de estabilidad postural en pipelines de validación de políticas antes de sim-to-real.
- Docencia e investigación en MuJoCo: el runner `policies/run_getup_mujoco.py` reproduce el entorno, el buffer circular de cinco observaciones y el envelope, lo que lo hace utilizable como caso de estudio reproducible de RL aplicado a locomotion.
- Reutilización como inicialización o referencia: los pesos y el `getup_policy_spec.json` permiten partir de una política que ya resuelve prona antes de abordar condiciones más difíciles como supina (15/24) o stance estrecha, que el autor declara no resueltas.
- Integración en el stack Asimov 1 para pruebas en simulador: combinada con la política de marcha de Menlo, permite automatizar escenarios de caída-recuperación-marcha en un bucle, siempre en simulación.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la model card (métrica `success_rate`, campo `verified: false`). 24 episodios por fila, semillas 0-23, MuJoCo, bajo el envelope velocidad-par `dc`, con la política de marcha de Menlo tomando el control una vez levantado.

| Tarea | Metrica | Resultado | Verificado |
|---|---|---|---|
| Get up from prone (Asimov 1, dc envelope, walker handoff) | rises | 100 % — 24/24 | no |
| Get up from prone (Asimov 1, dc envelope, walker handoff) | still standing at 8 s | 100 % — 24/24 | no |
| Get up from supine (Asimov 1, dc envelope, walker handoff) | rises | 62,5 % — 15/24 | no |
| Get up from supine (Asimov 1, dc envelope, walker handoff) | still standing at 8 s | 62,5 % — 15/24 | no |

Mediciones adicionales publicadas por el autor (condición prona):

| Medicion | Valor |
|---|---|
| Error articular frente a pose por defecto, asentado | 1,30° de media; 4,18° peor caso |
| Velocidad articular peor caso estando de pie | 2,3 °/s (252 °/s sin handoff) |
| Empujones superados | 24/24 (aplicados solo estando de pie) |
| Radianes fuera de límite articular (mediana) | 0,009 |
| Apertura de pies pico (mediana) | 0,888 m |
| Still-standing con predicado desplegable (solo observación) | 23/24 (prona) |
| Re-scoring independiente sobre física bruta | 22/24, por lo que el autor recomienda leer 22-24 de 24 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB y la política se distribuye en ONNX, por lo que la inferencia es ligera, pero no se publican cifras de memoria ni de latencia.
- GPU recomendadas: no disponible; no se documenta ningún requisito de GPU.
- ¿Cabe en GPU de consumo? No disponible como dato publicado; por el tamaño del artefacto (repo de 0,0 GB) no se espera limitación, pero es una estimación, no un dato del autor.
- Opciones de despliegue: ONNX Runtime para la política y MuJoCo para la simulación; el repositorio incluye `policies/run_getup_mujoco.py` como runner de referencia y un `Ring` de 12 líneas para el buffer circular de las últimas cinco observaciones. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.
- Requisito crítico de integración: se necesitan 390 floats de entrada (cinco fotogramas de 78). No funciona como hot-swap en el robot ni carga en el visor de Menlo, que esperan 78.
- Requisito de simulador: el runner implementa el envelope velocidad-par reescribiendo en caliente el `actuator_forcerange` de MuJoCo a partir de `qvel` (unas 10 líneas); sin ese envelope los resultados caen a 14/24 y 6/24.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| asimov1-getup-handoff | Política RL de get-up + handoff (ONNX) | no disponible | 390 floats (5 x 78) | 24/24 prona; 15/24 supina (simulación) | Apache-2.0 | HuggingFace, 0 descargas |
| Política de marcha de Menlo Research | Política RL de locomoción | no disponible | 78 floats | no disponible en esta información | no disponible | Referenciada en el repo `menloresearch/asimov-1` |
| Alternativas de get-up para Asimov 1 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otras políticas comparables de get-up para este robot ni de benchmarks cruzados en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: el autor declara explícitamente que nunca se ha ejecutado en un robot físico. Cualquier uso real exige validación sim-to-real previa.
- Métricas no verificadas: los cuatro resultados del `model-index` llevan `verified: false` y proceden de la evaluación del propio autor.
- Entrada de 390 floats, no 78: no hace hot-swap en el robot ni carga en el visor de Menlo; requiere un buffer circular de las últimas cinco observaciones en el dispositivo.
- El historial es imprescindible: con un único fotograma repetido, los mismos pesos rinden 0/48 en lugar de 48/48. El vector de 78 floats no incluye velocidad lineal de base ni estado de contacto.
- Dependencia estricta del envelope velocidad-par: con un clamp de par plano por grupo cae a 14/24 levantamientos y 6/24 permanencias.
- Postura muy abierta: apertura de pies pico mediana de 0,888 m frente a una postura natural de 0,215 m; un get-up con stance estrecha no está resuelto.
- Supina mucho más débil que prona (15/24 frente a 24/24), y el entrenamiento se centró en prona.
- Coste del predicado desplegable: una décima parte de los episodios (23/24 frente a 24/24 en still-standing con el test privilegiado), y el re-scoring independiente baja a 22/24.
- Dos órdenes articulares distintos conviven en el artefacto (acciones, `last_action`, `default_pose` y actuadores MJCF por un lado; `joint_pos_rel` y `joint_vel` dentro de cada fotograma por otro). Mezclarlos sigue produciendo acciones y movimiento, pero incorrecto; ambos están en `getup_policy_spec.json`.
- La model card disponible está truncada en el apartado de los dos órdenes articulares ("it just fa..."), por lo que puede faltar información relevante.
- Sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Sesgos conocidos: no se documentan sesgos sociales (no es un modelo de lenguaje), pero sí un sesgo de condiciones de entrenamiento hacia prona, hacia el envelope `dc` y hacia la política de marcha concreta de Menlo.
- Riesgo de alucinación: no aplica; el riesgo equivalente es el fallo silencioso, es decir, producir acciones plausibles con índices articulares equivocados.
- Licencia Apache-2.0: permite uso comercial y modificación con las obligaciones habituales de atribución y aviso; el autor no impone restricciones adicionales en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/JonathanHawkins/asimov1-getup-handoff
- Vídeo de replay: https://huggingface.co/JonathanHawkins/asimov1-getup-handoff/resolve/main/replay.mp4
- Repositorio de Asimov 1 (Menlo Research): https://github.com/menloresearch/asimov-1
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repos adicionales) en la búsqueda web realizada; los resultados devueltos no guardan relación con el modelo.
