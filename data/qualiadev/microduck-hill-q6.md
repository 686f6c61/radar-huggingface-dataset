# qualiadev/microduck-hill-q6

## Resumen

qualiadev/microduck-hill-q6 es una política de control para el robot microduck, publicada en HuggingFace por el usuario qualiadev. No es un modelo de lenguaje ni un modelo generativo de propósito general: se trata de un gait (patrón de marcha) entrenado mediante aprendizaje por refuerzo, que se carga en una ranura de política del robot y se ejecuta de forma continua hasta que se le indique lo contrario. Trabaja con observaciones de 61 dimensiones y 14 acciones, a una frecuencia de control de 50 Hz (un paso cada 20 ms).

El artefacto distribuido es un fichero ONNX (`policy.onnx`) con el normalizador de observaciones integrado, acompañado de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. La model card indica que el entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `sprint/race`, commit `0141bf4a8`, pero no detalla la arquitectura de red, el número de parámetros, la composición del dataset ni resultados de evaluación.

Su relevancia es acotada y muy específica: sirve como ejemplo de despliegue de políticas de aprendizaje por refuerzo en robótica de bajo coste mediante el stack microduck (librería `microduck` y herramienta `robotctl`). El repositorio registra 0 descargas y 0 likes en el momento de la consulta, la licencia no está declarada y la documentación publicada es mínima, por lo que debe tratarse como material experimental sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuye como política ONNX; la model card no describe la red) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control continuo, sin ventana de contexto) |
| Tipos de cuantización | no disponible (el nombre del repositorio incluye el sufijo "q6", no confirmado en la documentación) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Librería de carga | `microduck` |
| Pipeline declarado | robotics |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Modo de ejecución | política perpetua (se ejecuta hasta que se detiene externamente) |

## Arquitectura y entrenamiento

La información publicada no describe la arquitectura de la red neuronal. Por el formato de salida (ONNX con normalizador de observaciones embebido) y por el perfil de entrada y salida (61 observaciones, 14 acciones, 50 Hz), es compatible con una política de control reactiva típica en aprendizaje por refuerzo para locomoción, pero no se confirma ni el tipo de red (MLP, recurrente, transformer) ni su profundidad o número de parámetros. Tampoco se indica el algoritmo de entrenamiento (PPO u otro), ni si hubo fases de imitación, destilación o ajuste fino.

Los únicos datos de entrenamiento disponibles son de trazabilidad: repositorio `pollen-robotics/microduck_rl`, rama `sprint/race`, commit `0141bf4a8`. No se especifica el simulador utilizado, el número de pasos de entorno, la composición del dataset, ni si se aplicaron técnicas de aleatorización de dominio o de sim-to-real. El nombre de la tarea ("hill") sugiere un escenario de terreno inclinado, pero esto no se confirma en el texto de la model card más allá del propio identificador.

## Capacidades

- Generación de locomoción continua: produce 14 acciones de control a 50 Hz para el robot microduck.
- Ejecución perpetua: la política está diseñada para correr de forma indefinida hasta que un agente externo la detenga, lo que la hace adecuada para marcha sostenida.
- Normalización de observaciones integrada: el fichero `policy.onnx` incorpora el normalizador, por lo que acepta observaciones en bruto sin preprocesado adicional.
- Carga mediante ranura de política: se integra en el flujo de trabajo del daemon de microduck con el comando `robotctl policy load <slot>`, lo que permite alternar entre políticas sin recompilar.
- Compatibilidad con el manifiesto de esquema 2 del ecosistema microduck, lo que facilita la interoperabilidad con otras políticas del mismo stack.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, visión, audio, tool calling, function calling ni capacidades de agente multi-paso. No es un modelo multimodal ni multilingüe.

## Casos de uso

- Locomoción en pendientes en el robot microduck: la política está pensada para el escenario identificado como "hill", por lo que su uso natural es desplazar el robot sobre terreno inclinado dentro de las condiciones para las que fue entrenada.
- Demostraciones educativas de aprendizaje por refuerzo: permite mostrar en un robot físico el ciclo completo de entrenamiento en simulación, exportación a ONNX y despliegue en hardware, sin requerir GPU de altas prestaciones.
- Investigación en sim-to-real: sirve como artefacto de partida para estudiar la transferencia de una política entrenada en simulador a un robot real, comparando el comportamiento observado con el esperado.
- Vigilancia o patrulla continua de bajo coste: al ser una política perpetua, puede mantener marcha sostenida hasta recibir una orden de parada, útil en escenarios de monitoreo estático con desplazamiento lento.
- Automatización de pruebas de regresión en robótica: puede cargarse en una ranura mediante `robotctl` dentro de un pipeline de integración continua para comprobar que el firmware o los drivers no rompen el comportamiento de referencia.
- Base para ajuste fino o destilación: al distribuirse en ONNX y con un manifiesto estandarizado, es un candidato razonable para ser usado como política inicial en experimentos de continuación de entrenamiento o de destilación a arquitecturas más ligeras.
- Comparación de políticas en el mismo stack: al seguir el esquema 2 del manifiesto, puede alternarse con otras políticas del ecosistema microduck para evaluar diferencias de comportamiento en la misma plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, distancia recorrida, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El tamaño del repositorio es de 0,0 GB, lo que indica un artefacto muy pequeño, previsiblemente por debajo de 1 GB, pero se trata de una estimación a partir del tamaño del repositorio, no de un dato declarado.
- GPU recomendadas: no disponible. Por el perfil de la tarea (61 entradas, 14 salidas, 50 Hz) no se espera que requiera GPU de centro de datos, pero no hay confirmación en la documentación.
- Compatibilidad con GPU de consumo: no confirmada. Es plausible que se ejecute en CPU, dado el escaso tamaño del artefacto y la baja dimensionalidad del control, pero no se ha verificado con datos publicados.
- Opciones de despliegue: librería `microduck` (campo `library_name` del repositorio) para carga en el robot mediante `robotctl policy load <slot>`; el formato ONNX permite en principio su ejecución con ONNX Runtime en otros entornos, aunque esto no se documenta explícitamente.
- Latencia y throughput: el único requisito declarado es ejecutar un paso de control cada 20 ms (50 Hz). No se publican medidas reales de latencia ni de consumo computacional.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables en la documentación proporcionada, ni de datos de rendimiento que permitan establecer una comparación cuantitativa. El repositorio de entrenamiento (`pollen-robotics/microduck_rl`) podría albergar otras políticas derivadas, pero no se ha facilitado información sobre ellas.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualiadev/microduck-hill-q6 | no disponible | no aplica | no disponible | no disponible | pública en HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si el uso comercial está permitido, lo que supone un riesgo legal directo para cualquier integración en producto.
- Ausencia total de datos de entrenamiento: solo se documentan repositorio, rama y commit, sin información sobre el simulador, el número de pasos, la distribución de escenarios ni técnicas de aleatorización.
- Ausencia de evaluación: no hay benchmarks, métricas de recompensa ni tasas de éxito publicadas, por lo que no se puede estimar la fiabilidad de la marcha ni su robustez fuera del escenario de entrenamiento.
- Riesgo de sobreajuste al escenario "hill": el identificador sugiere un entrenamiento específico para pendientes, y no hay evidencia de generalización a otros terrenos, suelos o cargas.
- Comportamiento perpetuo: la política se ejecuta hasta recibir una orden externa de parada; es necesario disponer de un mecanismo fiable de interrupción y de supervisión del robot.
- Fecha de creación registrada como 2026-10-12 y 0 descargas y 0 likes: se trata de una publicación reciente y sin validación por parte de la comunidad.
- Inconsistencia de nombres: la model card se titula "Qualia SuperMega Fast", mientras que el identificador del repositorio es `microduck-hill-q6`; conviene verificar que ambos hacen referencia al mismo artefacto.
- La normalización de observaciones está embebida en el ONNX, de modo que alimentar observaciones ya normalizadas produciría un comportamiento incorrecto.
- La alucinación no aplica: no es un modelo generativo de lenguaje. El modo de fallo relevante es la pérdida de estabilidad o la marcha errática, no la fabricación de contenido.
- Ámbito de aplicación muy restringido: no sirve para tareas de lenguaje, visión, razonamiento ni agentes; su única salida es un vector de 14 acciones de control.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualiadev/microduck-hill-q6
- Repositorio del robot microduck (citado en la model card): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (citado como `pollen-robotics/microduck_rl`, rama `sprint/race`, commit `0141bf4a8`): https://github.com/pollen-robotics/microduck_rl
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible la URL exacta
- Paper asociado: no disponible
- Blog o anuncio: no disponible
- Demo: no disponible
