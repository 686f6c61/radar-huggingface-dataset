# chair510/microduck-ballkick

## Resumen

`microduck-ballkick` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo ejecuta una habilidad concreta y episódica: una patada de balón con la pata derecha que, tras 5,0 segundos de ejecución, devuelve al robot a una postura de pie estable. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador neuronal exportado a ONNX que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz.

El modelo lo publica el usuario `chair510` bajo el identificador `chair510/microduck-ballkick` y se integra en el ecosistema de políticas del daemon de microduck mediante un manifiesto de esquema 2. Su relevancia es acotada pero práctica: demuestra el flujo completo de entrenamiento en simulación (con Mjlab y el repositorio `pollen-robotics/microduck_rl`) y despliegue en hardware real mediante el comando `robotctl`, con la normalización de observaciones incorporada dentro del propio grafo ONNX.

La información publicada es muy limitada: el repositorio ocupa 0,0 GB, no declara licencia, no especifica idiomas (no aplica en sentido estricto) y no incluye resultados de benchmarks estandarizados más allá de la curva de recompensa del entrenamiento. Cualquier dato no presente en la model card se marca explícitamente como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal de reinforcement learning exportada a ONNX; no se detalla la topología de la red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 dimensiones por paso, control a 50 Hz |
| Tipos de cuantizacion | No disponible (se distribuye en ONNX, presumiblemente FP32; no se documenta) |
| Idiomas soportados | No aplica (modelo de control robótico, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal (número de capas, anchura, tipo de capas o función de activación). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrenó el 2026-11-10 en un Apple M1 Pro con el entorno `Mjlab-BallKick-Flat-MicroDuck`, durante 400 rondas con 256 entornos en paralelo. La recompensa media pasó de 0,8 a 53,4 y posteriormente cayó a cero, lo que sugiere un episodio de colapso de la política al final del entrenamiento o un criterio de terminación que anula la recompensa acumulada. Este detalle es relevante para interpretar la calidad final del checkpoint.

El entrenamiento se realizó sobre el repositorio `pollen-robotics/microduck_rl`, rama `develop`, commit `0daab160d`, y el autor indica que la exportación se hizo desde un checkout con cambios sin confirmar, lo que reduce la reproducibilidad exacta del resultado. La política es episódica: ejecuta la patada y vuelve a una postura de pie. La normalización de observaciones está integrada en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesado adicional.

## Capacidades

- Ejecución de una habilidad motora concreta: patada de balón con la pata derecha sobre el robot microduck.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones de salida.
- Comportamiento episódico de 5,0 segundos con retorno autónomo a postura de pie al finalizar.
- Normalización de observaciones embebida en el grafo ONNX, lo que simplifica la integración en el daemon.
- Integración con el sistema de políticas de microduck mediante manifiesto de esquema 2 y el comando `robotctl policy add`.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües.

## Casos de uso

- Demostración de aprendizaje por refuerzo en robótica de bajo coste: sirve como ejemplo reproducible del ciclo simulación-a-realidad con Mjlab y microduck, útil en docencia y talleres de RL.
- Prueba de integración del daemon de microduck: permite validar el flujo `robotctl policy add` y `robotctl robot do` con una política real antes de desplegar controladores propios.
- Base para experimentos de locomoción y manipulación con patas: la política de patada se puede usar como referencia o punto de partida para entrenar habilidades similares (empujar, patear con la otra pata, chutar objetos).
- Benchmark interno de pipelines de entrenamiento: la curva de recompensa documentada (0,8 a 53,4 y caída a cero) sirve para comparar estabilidad de entrenamientos propios en el mismo entorno `Mjlab-BallKick-Flat-MicroDuck`.
- Validación de exportación ONNX en robótica: útil para comprobar que la normalización embebida y el manifiesto de esquema 2 funcionan correctamente en el robot físico.
- Prototipado de interacción lúdica: en demostraciones públicas o ferias, el robot puede ejecutar la patada como comportamiento programado ante un estímulo, siempre que se acepte la falta de licencia clara para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento documentado es la evolución de la recompensa media durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Recompensa media inicial | 0,8 |
| Recompensa media maxima | 53,4 |
| Recompensa media final | 0 (caida a cero) |
| Rondas de entrenamiento | 400 |
| Entornos en paralelo | 256 |
| Hardware de entrenamiento | Apple M1 Pro |
| Duracion del episodio | 5,0 s |
| Frecuencia de control | 50 Hz |

## Requisitos de hardware

- El modelo se ejecuta en el propio robot microduck o en el host que ejecute el daemon; no se especifican requisitos de VRAM ni GPU.
- Al ser una política ONNX de tamaño reducido (repositorio de 0,0 GB), es previsible que quepa en CPU y en hardware embebido, aunque el dato exacto de memoria no está disponible.
- GPU recomendadas: no disponible. No se documenta ningún requisito de aceleración por hardware.
- Cabe en GPU de consumo: no disponible como dato confirmado; por el tamaño del repositorio es plausible, pero no está verificado en la información proporcionada.
- Opciones de despliegue: runtime ONNX a través del daemon de microduck (`robotctl`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política opera a 50 Hz (20 ms por paso de control), pero no se publican mediciones de latencia real en el robot.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada políticas comparables del mismo autor o del ecosistema microduck con las que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso para uso comercial, redistribución o modificación. Es imprescindible contactar con el autor antes de cualquier uso fuera de experimentación personal.
- Entrenamiento exportado desde un checkout con cambios sin confirmar (commit `0daab160d` más modificaciones locales), lo que impide reproducir exactamente el resultado.
- La recompensa media cae a cero al final del entrenamiento; no se aclara si el checkpoint publicado corresponde al mejor momento o al final del colapso, lo que introduce incertidumbre sobre la calidad de la política.
- Habilidad única y episódica: no es un modelo generalista ni admite instrucciones en lenguaje natural; solo ejecuta la patada y el retorno a postura de pie.
- Entrenado en un entorno plano (`Flat`); el rendimiento en terrenos irregulares, pendientes o con obstáculos no está documentado y probablemente se degrade.
- Sin datos de simulación-a-realidad publicados: no se documenta la tasa de éxito de la patada en el robot físico ni la robustez ante variaciones de fricción, masa del balón o calibración de motores.
- Sin información sobre sesgos, alucinación o comportamiento ante fallos; en robótica, un fallo de política puede provocar caídas o daños mecánicos, por lo que se recomienda supervisión y topes de par.
- Idiomas no aplicables; no debe interpretarse la ausencia de este campo como una limitación lingüística.
- Repositorio de 0,0 GB y sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chair510/microduck-ballkick
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `develop`, commit `0daab160d`); no se proporciona URL directa en la model card.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se proporciona URL directa en la model card.
