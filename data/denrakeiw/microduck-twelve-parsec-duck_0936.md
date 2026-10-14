# DenRakEiw/microduck-twelve-parsec-duck_0936

## Resumen

twelve-parsec-duck_0936 es una politica de control para el robot cuadrupedo microduck, desarrollada por el usuario DenRakEiw y publicada en HuggingFace bajo la libreria `microduck`. No es un modelo de lenguaje: se trata de un policy de reinforcement learning que genera comandos motores a 50 Hz a partir de una observacion de 61 dimensiones y produce 14 acciones. Su funcion es ocupar el slot `walk` del robot, es decir, proporcionar una marcha perpetua que se ejecuta de forma continua hasta recibir una orden de parada.

El modelo parte de una politica previa, `twelve-parsec-duck`, y ha sido refinada mediante estrategias de evolucion (evolution strategies) sobre el scorer de sprint de la denominada Arena. El autor lo describe como un "2 m Sprint runner", lo que indica que el objetivo de optimizacion era maximizar la velocidad en una distancia de dos metros. El artefacto distribuido es un fichero `policy.onnx` con el normalizador de observaciones integrado, acompanado de un `manifest.json` conforme al esquema 2 del manifiesto de politicas de microduck.

La relevancia de esta ficha es acotada: se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks publicados. El repositorio ocupa 0,0 GB, lo que sugiere un artefacto de muy pocos parametros, coherente con una politica de control de baja dimensionalidad. La informacion disponible es la model card del autor y los enlaces al ecosistema microduck de Pollen Robotics.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control entrenada con reinforcement learning y evolution strategies; artefacto ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye un unico `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robotica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con normalizador de observaciones integrado; metadatos en `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Slot de politica | `walk` |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia interna de la red. Lo que si se especifica es el interfaz de la politica: recibe un vector de observacion de 61 dimensiones y emite 14 acciones a 50 Hz, de forma perpetua, sin episodios delimitados. El normalizador de observaciones esta embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo (raw observations) sin preprocesado adicional. El pipeline declarado en HuggingFace es `robotics` y la libreria asociada es `microduck`.

El entrenamiento se realizo en dos fases segun la model card. La primera corresponde a la politica base `twelve-parsec-duck`; la segunda es un ajuste fino mediante estrategias de evolucion sobre el scorer de sprint de la Arena, que actua como funcion de fitness. El codigo de entrenamiento reside en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `b76573f1a`. No se especifican el numero de tokens ni la composicion de dataset, terminos que ademas no aplican en este paradigma; tampoco se documentan el presupuesto de evaluaciones, la poblacion usada en las estrategias de evolucion, la funcion de recompensa completa ni si hubo fases previas de RLHF o DPO (no aplicables en robotica de control).

## Capacidades

- Locomocion cuadrupeda: genera una marcha perpetua para el slot `walk` del microduck, sin terminacion por episodio.
- Control a 50 Hz: produce las 14 acciones de actuacion en cada ciclo de control, con 61 entradas de observacion.
- Optimizacion para sprint: entrenada especificamente contra el scorer de sprint de la Arena en una prueba de 2 m.
- Inferencia via ONNX: el grafo es portable a cualquier runtime compatible con ONNX, incluido el daemon `robotctl` del robot.
- Normalizacion integrada: acepta observaciones sin normalizar, lo que simplifica la integracion en el bucle de control.
- Tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Vision, audio o thinking mode: no disponible; no se declara ninguna capacidad de este tipo.

## Casos de uso

- Despliegue de marcha en el microduck fisico: cargar la politica con `sudo robotctl policy load walk DenRakEiw/microduck-twelve-parsec-duck_0936` para dotar al robot de una marcha continua en el slot `walk`.
- Pruebas de velocidad en la Arena de microduck: usar la politica como participante en el scorer de sprint, dado que fue ajustada precisamente contra ese criterio.
- Referencia base para ajuste fino con estrategias de evolucion: sirve como punto de partida para nuevas rondas de optimizacion sobre el repositorio `microduck_rl`, rama `denrakeiw`.
- Evaluacion de similitud sim-a-real: al ser una politica perpetua y de baja dimensionalidad, permite medir la transferencia del entrenamiento simulado al hardware real del microduck.
- Benchmarking de runtimes ONNX en robotica embebida: el modelo es lo bastante pequeno (repositorio de 0,0 GB) para comparar latencia entre ejecuciones en CPU embebida y aceleradores ligeros.
- Docencia y experimentacion en RL para robotica: util como ejemplo minimo de politica entrenada con evolution strategies y exportada a ONNX, con interfaz de observacion y accion explicitamente documentada.
- Integracion en pipelines de control propios: cualquier bucle que consuma un ONNX con 61 entradas y 14 salidas puede incorporar la politica sin depender del daemon oficial, siempre que respete la frecuencia de 50 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La unica referencia cuantitativa aportada por el autor es la descripcion "2 m Sprint runner", que indica la distancia de la prueba para la que se optimizo la politica, pero no se acompanan tiempos, velocidades ni puntuaciones del scorer de la Arena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB y la interfaz es de 61 entradas y 14 salidas, lo que sugiere un modelo de muy pocos parametros, probablemente ejecutable en CPU.
- GPU recomendadas: no disponible; no se documenta ninguna GPU objetivo. Por la naturaleza del artefacto, no se requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del repositorio, aunque no hay confirmacion explicita en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime es la via implicita, ya que el peso se distribuye como `policy.onnx`. El despliegue oficial en robot se realiza mediante `sudo robotctl policy load walk DenRakEiw/microduck-twelve-parsec-duck_0936`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una politica de control).
- Latencia y throughput: no disponibles; el unico dato de temporizacion es la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Frecuencia | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| twelve-parsec-duck_0936 | Politica de control ONNX | 61 / 14 | 50 Hz | RL + evolution strategies sobre el scorer de sprint | no disponible | HuggingFace, 0 descargas |
| twelve-parsec-duck (base) | Politica de control | no disponible | no disponible | RL previo | no disponible | referenciado en la model card, sin enlace directo |
| Otras politicas del ecosistema microduck | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otras politicas comparables dentro o fuera del ecosistema microduck, ni de sus parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ninguna licencia, por lo que el uso comercial queda en un limbo legal y no puede asumirse permiso de uso, modificacion ni redistribucion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta; no hay evidencia externa de validacion por parte de terceros.
- Ausencia total de benchmarks: no hay metricas publicas de velocidad, estabilidad ni tasa de exito, mas alla de la etiqueta "2 m Sprint runner".
- Especificidad de tarea: la politica esta ajustada contra el scorer de sprint de la Arena; su comportamiento fuera de ese escenario (terrenos irregulares, pendientes, cargas) no esta documentado y podria degradarse.
- Naturaleza perpetua: la politica se ejecuta hasta recibir orden de parada, sin condicion de terminacion aprendida; la seguridad del bucle de control depende del daemon y de las protecciones externas.
- Dependencia del normalizador embebido: alimentar observaciones ya normalizadas o reordenadas romperia el contrato de entrada sin aviso explicito.
- Sin soporte de lenguaje ni vision: cualquier caso de uso conversacional, multimodal o de razonamiento queda fuera del alcance del modelo.
- Sin datos de sesgo: no aplica el analisis habitual de sesgos de modelos de lenguaje, pero tampoco se documenta el sesgo de simulacion (sim-to-real gap) ni la variabilidad entre unidades fisicas del robot.
- Riesgo de sobreajuste al simulador: al haberse optimizado con evolution strategies sobre un scorer concreto, existe riesgo plausible de explotar particularidades del entorno de evaluacion, aunque no se aporta evidencia al respecto.
- Fechas del repositorio: la model card indica creacion y actualizacion en octubre de 2026, dato que conviene verificar antes de citarlo.

## Enlaces

- HuggingFace: https://huggingface.co/DenRakEiw/microduck-twelve-parsec-duck_0936
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL referenciado (rama `denrakeiw`, commit `b76573f1a`): `pollen-robotics/microduck_rl`
- Documentacion del manifiesto de politicas (esquema 2): `docs/policy-manifest.md` en el repositorio del daemon
- Paper, blog o demo adicionales: no disponibles
