# RSanchez996/microduck-sock-heist-6m-run-1101-1726

## Resumen

`sock-heist-6m-run-1101-1726` es una política de control robótico entrenada mediante aprendizaje por refuerzo (RL) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una policy perpetua que mapea observaciones de 61 dimensiones (estado de articulaciones, sensores inerciales y contactos) a 14 acciones de control a 50 Hz. El autor, RSanchez996, la publica como un checkpoint de un entrenamiento concreto (iteración 2700, semilla 22) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`.

El modelo se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio grafo, de modo que el robot puede consumir observaciones en bruto sin preprocesado adicional. Se integra mediante el daemon `robotctl`, que carga la política en un slot del robot. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el repo es extremadamente ligero.

Su relevancia es acotada: es un artefacto de investigación reproducible (código, `uv.lock`, comando y semilla documentados) dentro del ecosistema microduck/mjlab, útil para quienes experimentan con locomoción y manipulación en robots cuadrúpedos pequeños, no para aplicaciones de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL para control robótico (red neuronal, topología no especificada), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (distribución en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política es una red neuronal entrenada con RL en el simulador mjlab (versión `mjlab-microduck 0.1.0` en el commit `1efd853be`), sobre la tarea `Mjlab-SockHeist6m-MicroDuck`. El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 3000 iteraciones y semilla 22, alcanzando el checkpoint 2700. El comando exacto de reproducción está documentado en la model card, junto con el commit del repositorio de retos (`734024133`) y el fichero `uv.lock`, lo que permite reproducir el proceso (aunque no obtener pesos idénticos, ya que el RL en GPU no es bit-reproducible entre máquinas).

La innovación técnica principal es la integración del normalizador de observaciones dentro del grafo ONNX, lo que simplifica el despliegue en el robot: el daemon recibe observaciones crudas y la política las normaliza internamente. La arquitectura interna de la red (número de capas, anchura, tipo de activación) no se detalla en la información disponible. La política es "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha cargada en un slot de política.

## Capacidades

- Control locomotor continuo de un robot cuadrúpedo microduck a 50 Hz.
- Mapeo de observaciones de 61 dimensiones (estado de articulaciones, IMU, contactos) a 14 acciones de control.
- Ejecución perpetua sin condición de terminación explícita.
- Consumo de observaciones en bruto gracias al normalizador embebido en el ONNX.
- Carga y ejecución mediante el daemon `robotctl` en un slot de política.
- Reproducibilidad del pipeline de entrenamiento (código, dependencias y semilla documentados).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción de cuadrúpedos pequeños: la política sirve como punto de partida para comparar estrategias de RL en el simulador mjlab y en el robot real microduck, con un pipeline reproducible documentado.
- Reproducción de experimentos de RL: el comando, el commit y la semilla permiten regenerar políticas comparables, útil para validar metodologías de entrenamiento con 4096 entornos paralelos.
- Despliegue de referencia en microduck: mediante `robotctl policy load <slot> RSanchez996/microduck-sock-heist-6m-run-1101-1726` se puede cargar la marcha en un slot y probar el comportamiento en hardware real.
- Evaluación de robustez de políticas perpetuas: al no tener condición de terminación, permite estudiar deriva y estabilidad en ejecuciones largas sobre el robot.
- Benchmarking de infraestructura de simulación: la configuración de 4096 entornos y 3000 iteraciones sirve para medir throughput de entrenamiento en distintas GPUs.
- Docencia y divulgación en robótica de bajo coste: el ecosistema microduck y esta política permiten demostrar el ciclo completo simulación-entrenamiento-despliegue con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB y no se especifican parámetros, aunque por la naturaleza de una política de control para un robot de bajo coste se espera que sea muy ligera.
- GPU recomendadas para entrenamiento: no disponible; el entrenamiento usa 4096 entornos paralelos, lo que típicamente requiere GPU de datacenter (A100/H100) o similares, pero no se confirma en la información.
- GPU para inferencia: no disponible; el despliegue se realiza en el propio robot mediante `robotctl`, no en GPU de servidor.
- Cabe en GPU de consumo: no confirmado, aunque por el tamaño del repo es plausible; no hay datos que lo verifiquen.
- Opciones de despliegue: daemon `robotctl` (carga en slot de política) con pesos ONNX; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la política opera a 50 Hz en el robot, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sock-heist-6m-run-1101-1726 | Política RL robótica (ONNX) | no disponible | 61-D por paso | no disponible | HuggingFace (0 descargas) |
| Otras políticas microduck | Política RL robótica | no disponible | no disponible | no disponible | no disponible en la información |
| Políticas de locomoción cuadrúpeda (p. ej. mujoco/mjlab) | Política RL robótica | no disponible | no disponible | no disponible | no disponible en la información |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; contactar con el autor antes de cualquier uso en producción.
- Sin resultados de benchmarks ni métricas de rendimiento publicadas: no hay evidencia cuantitativa de robustez o calidad de la marcha.
- Repositorio con 0 descargas y 0 likes, y tamaño de 0.0 GB: posible que los pesos no estén efectivamente disponibles o que el artefacto esté incompleto.
- Entrenamiento no bit-reproducible: repeticiones con la misma semilla producen políticas comparables, no idénticas.
- Específica del hardware microduck: no es transferible a otros robots sin reentrenamiento.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, al no ser un modelo de lenguaje.
- Model card mínima ("New attemp"): documentación escasa sobre arquitectura interna y condiciones de entrenamiento más allá de los hiperparámetros listados.
- Riesgo de comportamiento impredecible en hardware real fuera de las condiciones de simulación; validar siempre en entorno controlado.

## Enlaces

- HuggingFace: https://huggingface.co/RSanchez996/microduck-sock-heist-6m-run-1101-1726
- Repositorio de entrenamiento: https://github.com/RSanchez996/microduck-challenges.git
- Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
