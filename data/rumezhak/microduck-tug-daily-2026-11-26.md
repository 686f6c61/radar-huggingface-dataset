# rumezhak/microduck-tug-daily-2026-11-26

## Resumen

`microduck-tug-daily-2026-11-26` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política neuronal que mapea observaciones del robot (61 dimensiones) a acciones de control (14 dimensiones) a una frecuencia de 50 Hz, empaquetada en formato ONNX y distribuida mediante la librería `microduck`.

El modelo se publica como una "política perpetua" (perpetual policy): una marcha que se ejecuta de forma continua hasta que se le indique lo contrario. Se carga directamente en una ranura de política del demonio de control del robot mediante el comando `robotctl policy load`, lo que permite desplegarla en hardware real sin reentrenamiento ni conversión adicional.

La relevancia de esta ficha es limitada desde el punto de vista de IA generativa: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB, y la model card es extremadamente escueta. La información disponible no permite caracterizar el dataset de entrenamiento, los hiperparámetros de RL, el rendimiento ni la licencia, por lo que muchos campos de esta ficha se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL; arquitectura interna no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (ejecución continua hasta detención explícita) |
| Normalizador de observaciones | integrado en `policy.onnx` (se alimentan observaciones en crudo) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Se sabe que es una política entrenada con aprendizaje por refuerzo dentro del repositorio `pollen-robotics/microduck_rl`, en la rama `main`, commit `5cee942d8`. La política consume un vector de observación de 61 dimensiones y produce un vector de acción de 14 dimensiones a 50 Hz, lo que corresponde a un controlador reactivo de bucle cerrado típico en locomoción de cuadrúpedos.

El artefacto distribuido es un fichero `policy.onnx` con el normalizador de observaciones incorporado, acompañado de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas microduck (documentado en `docs/policy-manifest.md` del repositorio del demonio). No se especifican el número de tokens o pasos de entrenamiento, la composición del dataset, el algoritmo de RL empleado (PPO, SAC, etc.), ni si hubo fases de ajuste fino o destilación.

## Capacidades

- Locomoción continua del robot microduck: ejecuta una marcha perpetua hasta recibir una orden de parada.
- Control reactivo a 50 Hz a partir de observaciones proprioceptivas de 61 dimensiones.
- Generación de 14 comandos de acción por paso de control.
- Despliegue directo en hardware mediante el comando `robotctl policy load <slot> rumezhak/microduck-tug-daily-2026-11-26`.
- Autocontenida: el normalizador de observaciones está embebido en el ONNX, por lo que acepta observaciones sin preprocesado externo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Investigación en locomoción de cuadrúpedos: sirve como política de referencia para comparar marchas entrenadas con RL sobre la plataforma microduck, cargándola en una ranura y registrando la telemetría del robot.
- Demostraciones de robótica educativa: al ser una política perpetua, permite mostrar una marcha estable en talleres y ferias sin necesidad de infraestructura de inferencia compleja, solo el demonio `robotctl`.
- Pruebas de integración del stack microduck: útil para validar el pipeline de carga de políticas, el esquema 2 del manifiesto y la compatibilidad del runtime ONNX en el robot antes de desplegar políticas propias.
- Benchmarking de hardware: la frecuencia fija de 50 Hz y las dimensiones conocidas (61 observaciones, 14 acciones) permiten medir latencia de inferencia y consumo en la placa del robot con una carga de referencia reproducible.
- Base para ajuste fino o destilación: al estar entrenada en el repositorio `microduck_rl`, puede servir como punto de partida para experimentos de RL posteriores o para destilar una política más ligera.
- Validación de simuladores: la política puede ejecutarse en simulación con el mismo vector de observación para contrastar la brecha sim-a-real antes de probarla en el robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Por el formato ONNX y el contexto de robot empotrado, es probable que la inferencia se ejecute en CPU o en el cómputo integrado del propio robot, pero esto no está documentado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX y el demonio `robotctl` del stack microduck (`sudo robotctl policy load <slot> rumezhak/microduck-tug-daily-2026-11-26`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política está diseñada para operar a 50 Hz (periodo de 20 ms por paso de control); no se publican cifras de latencia de inferencia ni de throughput medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-daily-2026-11-26 | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| Otras políticas del repositorio `pollen-robotics/microduck_rl` | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio de entrenamiento |
| Políticas de locomoción para cuadrúpedos de otros fabricantes (p. ej., Unitree, ANYmal) | Políticas RL propietarias o de investigación | variable | variable | habitualmente no comercial | no disponible |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La model card no documenta la licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- No se especifican los idiomas ni metadatos de región más allá de `region:us`; irrelevante para un modelo de robótica, pero indica lo mínima que es la metadata.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo día (2026-11-25), por lo que no hay evidencia de validación por parte de terceros.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto en el sentido de modelos de lenguaje; el riesgo principal es la generalización de la política a condiciones físicas distintas de las de entrenamiento (terrenos, cargas, desgaste del hardware).
- La política es perpetua: no incorpora por sí misma lógica de parada segura; la detención depende del demonio de control y de las salvaguardas del robot.
- No se detalla el algoritmo de RL, el dataset ni las métricas de éxito, lo que dificulta reproducir el entrenamiento o auditar su robustez.
- El commit de entrenamiento (`5cee942d8`) y la rama (`main`) se citan, pero sin fijar versiones de dependencias ni semillas, lo que limita la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-daily-2026-11-26
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio microduck
