# GinDuck/microduck-roller-sprint-2m-roller-2-o

## Resumen

`GinDuck/microduck-roller-sprint-2m-roller-2-o` es una política de control por refuerzo entrenada para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un checkpoint de aprendizaje por refuerzo exportado a ONNX que implementa una marcha ("gait") concreta: una política perpetua de sprint sobre ruedas (rollers) que sustituye el patinaje previo por una carrera orientada a velocidad. El autor, GinDuck, la publica como parte de su segunda tanda de experimentos ("roller run"), con una receta de entrenamiento compartida por el usuario TheSauceman.

Técnicamente, la política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, con un normalizador de observaciones embebido directamente en el fichero `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo. Se carga en el daemon del robot mediante `robotctl policy load <slot>` y se ejecuta de forma indefinida hasta que se le indique lo contrario. Según el autor, completa su recorrido de prueba en aproximadamente 1,5 a 1,6 segundos.

Su relevancia es acotada pero clara: forma parte del ecosistema microduck-challenges, un conjunto de tareas de RL reproducible con mjlab (entorno de simulación basado en MuJoCo) donde la comunidad comparte políticas entrenadas con semillas y commits concretos. No hay información sobre licencia, idiomas ni benchmarks estándar, y el repositorio ocupa 0,0 GB en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (arquitectura de red no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en simulación usando mjlab, un framework basado en MuJoCo, sobre la tarea `Mjlab-RollerSprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges` (rama `race-2`, commit `b44f7ffc9`). El entrenamiento se lanzó el 2 de noviembre de 2026 con 2048 entornos paralelos, un máximo de 6000 iteraciones, semilla 1 y logging en TensorBoard; el checkpoint publicado corresponde a la iteración 3250. La base es `mjlab-microduck 0.1.0` en el commit `1efd853be`.

El modelo final se exporta a ONNX con el normalizador de observaciones integrado, de forma que la política recibe observaciones crudas de 61 dimensiones y produce 14 acciones a 50 Hz. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo `uv.lock`, código y semilla produce una política comparable, pero no idéntica. No se detalla en la información disponible la topología exacta de la red (capas, activaciones, tamaño de las capas ocultas) ni el algoritmo de RL empleado (PPO u otro).

## Capacidades

- Locomoción sobre ruedas (rollers) del robot microduck: política perpetua que se ejecuta de forma continua hasta que se descarga o se sustituye.
- Marcha de sprint orientada a velocidad: según el autor, completa su prueba en aproximadamente 1,5–1,6 segundos, abandonando el comportamiento de patinaje de checkpoints anteriores.
- Control reactivo a partir de observaciones de 61 dimensiones (estado propioceptivo del robot) con salida de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el ONNX, lo que simplifica la integración con el daemon.
- Carga en el robot mediante `robotctl policy load <slot>`, encajada en el sistema de slots de políticas del daemon microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo generativo.

## Casos de uso

- **Investigación en locomoción con RL sobre hardware de bajo coste**: usar la política como línea base reproducible para comparar recetas de entrenamiento en microduck, ya que el autor documenta commit, semilla, número de entornos e iteraciones.
- **Demostración de sprint sobre ruedas**: cargar la política en un slot del robot para exhibir una marcha rápida y perpetua en ferias, talleres o vídeos de divulgación, dado su tiempo de recorrido de ~1,5 s en las pruebas del autor.
- **Benchmark de tareas en microduck-challenges**: emplear `Mjlab-RollerSprint2m-MicroDuck` como referencia para evaluar nuevas políticas de sprint en la rama `race-2` del repositorio de retos.
- **Pruebas de integración del daemon y del sistema de slots**: validar el flujo `robotctl policy load` y el consumo de `manifest.json` (schema 2) con una política real exportada a ONNX.
- **Reproducción de experimentos de RL en simulación**: relanzar el comando de entrenamiento documentado para estudiar la variabilidad entre ejecuciones (no reproducibilidad bit a bit) y la sensibilidad a la semilla.
- **Base para fine-tuning o destilación de marchas**: partir de esta política como inicialización para entrenar variantes (giros, frenadas, terrenos distintos) en el mismo entorno mjlab.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado por el autor es cualitativo-cuantitativo: la política completa su recorrido de prueba en aproximadamente 1,5 a 1,6 segundos, sin especificar la distancia ni las condiciones exactas de la prueba.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; al ser una política de control exportada a ONNX con 61 entradas y 14 salidas, la huella de memoria es previsiblemente muy reducida, pero no se publica el tamaño del fichero ni el número de parámetros.
- **GPU recomendadas**: no disponible. Para entrenamiento, el comando documentado usa 2048 entornos paralelos en mjlab, lo que en la práctica requiere una GPU de gama alta (el autor no especifica modelo).
- **Compatibilidad con GPU de consumo**: no confirmada en la información disponible; la inferencia ONNX en CPU es plausible por el tamaño típico de estas políticas, pero no está documentado.
- **Opciones de despliegue**: ONNX Runtime a través del daemon microduck (`robotctl`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican latencias de inferencia medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GinDuck/microduck-roller-sprint-2m-roller-2-o` | Política RL (ONNX) para microduck, sprint sobre rollers | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| Checkpoints previos de la misma "roller run" del autor | Políticas RL para microduck, patinaje sobre rollers | no disponible | no disponible | no disponible | referenciados en la model card, sin enlace directo |
| Políticas de otras tareas de `microduck-challenges` | Políticas RL para microduck en distintas tareas | variable según tarea | no disponible | según repositorio | GitHub `pollen-robotics/microduck-challenges` |

No se dispone de datos de rendimiento comparables (métricas de velocidad, recompensa o éxito) entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no especificada**: no hay licencia declarada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- **Alcance muy restringido**: es una política específica para una tarea (sprint sobre rollers en microduck); no generaliza a otros robots, terrenos o morfologías.
- **No reproducibilidad bit a bit**: el propio autor advierte que reentrenar con la misma semilla y código produce una política comparable pero no idéntica.
- **Validación limitada**: solo se reporta una prueba cualitativa del autor (~1,5–1,6 s); no hay benchmarks formales, métricas de robustez ni evaluación en distintos entornos.
- **Documentación incompleta**: faltan detalles de arquitectura de red, número de parámetros, algoritmo de RL y condiciones exactas de la prueba de velocidad.
- **Riesgo en hardware real**: como toda política entrenada en simulación, puede sufrir la brecha sim-to-real (dinámica de rollers, fricción, latencias); no se documentan medidas de robustez.
- **Madurez**: repositorio de 0,0 GB, 0 descargas y 0 likes en el momento de la consulta; sin señales de adopción ni mantenimiento por parte de la comunidad.
- **Sin capacidades de lenguaje ni multimodales**: no debe evaluarse con criterios de LLM (alucinación, sesgos lingüísticos, contexto); esos conceptos no aplican.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-o
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento microduck-challenges: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon, referenciada en la model card; URL exacta no disponible)
