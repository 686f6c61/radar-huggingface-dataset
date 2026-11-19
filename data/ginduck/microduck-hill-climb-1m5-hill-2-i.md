# GinDuck/microduck-hill-climb-1m5-hill-2-i

## Resumen

`microduck-hill-climb-1m5-hill-2-i` es un checkpoint de política de control para el robot cuadrúpedo educativo [microduck](https://github.com/pollen-robotics/microduck) desarrollado por el usuario GinDuck. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo entrenada para que el robot suba una rampa (hill climb de 1,5 m de altura) de forma perpetua, es decir, ejecutando una marcha continua hasta que se le indique lo contrario. Se publica en formato ONNX junto con un manifiesto de política compatible con el daemon `robotctl`.

Técnicamente se trata de un controlador que recibe observaciones de 61 dimensiones a 50 Hz y emite 14 acciones, generado con el entorno de simulación `Mjlab-HillClimb1m5-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`. El autor indica que el checkpoint, extraído de la iteración 250 de un entrenamiento con semilla 1 y 4096 entornos paralelos, completó la subida en las cinco pruebas realizadas.

Su relevancia es acotada y local: es un artefacto reproducible de investigación en robótica con refuerzo, de tamaño prácticamente nulo (repo de 0,0 GB) y sin métricas de benchmark publicadas. Resulta útil como ejemplo de pipeline de entrenamiento y despliegue de políticas para microduck, pero no constituye una base generalista ni un modelo de propósito amplio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal exportada a ONNX); arquitectura interna no especificada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones a 50 Hz |
| Tipos de cuantización | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales:

| Parámetro | Valor |
|---|---|
| Espacio de observación | 61 dimensiones |
| Espacio de acción | 14 acciones |
| Frecuencia de control | 50 Hz |
| Tipo de política | Perpetua (marcha continua) |
| Normalizador de observaciones | Integrado en `policy.onnx` (se alimentan observaciones crudas) |
| Tarea de entrenamiento | `Mjlab-HillClimb1m5-MicroDuck` |
| Simulador / base | `mjlab-microduck 0.1.0 @ 1efd853be` |
| Checkpoint | 250 |
| Semilla | 1 |
| Commit de entrenamiento | `b44f7ffc9` (rama `race-2`) |

## Arquitectura y entrenamiento

El modelo es una política de control entrenada mediante aprendizaje por refuerzo en simulación con el framework mjlab sobre el robot microduck. El autor documenta el proceso con detalle reproducible: task_id `Mjlab-HillClimb1m5-MicroDuck`, rama `race-2` del repositorio `pollen-robotics/microduck-challenges`, commit `b44f7ffc9`, base `mjlab-microduck 0.1.0 @ 1efd853be`, 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 1 y registro en TensorBoard con nombre de ejecución `hill-2`. El checkpoint publicado corresponde a la iteración 250.

La innovación técnica destacable no está en la arquitectura de red (no se detalla en la model card) sino en el flujo de trabajo: la política se exporta a ONNX con el normalizador de observaciones embebido, de modo que el robot alimenta observaciones crudas sin preprocesado en el host. El despliegue se realiza cargando la política en una ranura del daemon mediante `robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-2-i`. El autor advierte explícitamente de que el entrenamiento con GPU no es bit-reproducible: repetir el comando con la misma semilla produce una política comparable, no idéntica. No se especifican datos sobre número de tokens, composición del dataset ni uso de RLHF/DPO, ya que no aplican a este tipo de modelo; el "dataset" es la dinámica del simulador.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck: subida de una rampa de 1,5 m de altura.
- Marcha perpetua: la política se ejecuta de forma continua hasta que el operador la detiene o la sustituye.
- Control reactivo a 50 Hz a partir de observaciones propioceptivas de 61 dimensiones.
- Generación de 14 acciones de control articular por paso.
- Integración con el daemon `robotctl` mediante manifiesto de política en esquema 2.
- Despliegue en formato ONNX, lo que permite inferencia portable fuera del stack de entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo thinking: no es un modelo generativo de lenguaje.

## Casos de uso

- Demostración educativa de locomoción: cargar la política en un microduck físico para ilustrar cómo una política entrenada en simulación sube una rampa; adecuado por su despliegue en un solo comando y su marcha perpetua.
- Reproducción de experimentos de RL en robótica: servir de referencia para comparar variantes de entrenamiento (checkpoints, semillas, hiperparámetros) sobre la misma tarea `Mjlab-HillClimb1m5-MicroDuck`, ya que el autor documenta commit, seed y comando exactos.
- Evaluación de pipelines sim-to-real: usar la política como caso de prueba para medir la brecha entre simulación y robot real en una tarea acotada y verificable (subida de rampa) con cinco ensayos reportados por el autor.
- Pruebas de integración del daemon `robotctl`: validar la carga de políticas en ranuras, el esquema 2 del manifiesto y la inferencia ONNX con normalizador embebido en un entorno controlado.
- Benchmark interno de controladores: comparar esta política con otras del mismo repo o de otros autores sobre la misma tarea de hill climb para calibrar el rendimiento del entorno mjlab.
- Base para fine-tuning o currículum de entrenamiento: partir de este checkpoint como inicialización en experimentos de mayor dificultad (rampas más altas, terrenos variables) dentro del mismo repositorio de challenges.
- Material docente para cursos de RL aplicado: ilustrar el ciclo completo de entrenamiento masivamente paralelo (4096 entornos), exportación a ONNX y despliegue en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es cualitativo: el autor afirma que la política completó la subida de la rampa en las cinco pruebas realizadas. No hay cifras de recompensa, tasa de éxito formal, latencia ni throughput.

| Métrica | Valor |
|---|---|
| Tasa de éxito reportada | 5 de 5 pruebas (dato del autor, sin protocolo detallado) |
| MMLU, HumanEval, GSM8K u otros | no aplica / no disponible |
| Latencia y throughput | no disponible |

## Requisitos de hardware

- Inferencia en el robot: la política se ejecuta en el microduck a través del daemon `robotctl`; al ser un modelo de tamaño mínimo (repo de 0,0 GB) y en formato ONNX, la carga computacional es muy baja y compatible con el hardware del propio robot.
- VRAM estimada: no disponible; por el tamaño del artefacto, la inferencia en GPU no es necesaria.
- GPU recomendadas: no aplica para inferencia. Para reentrenar la política se usó un entorno masivamente paralelo (4096 entornos) que, según el flujo documentado, requiere GPU; el modelo de GPU concreto no se especifica.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el tamaño ínfimo del modelo; no se detalla el modelo exacto.
- Opciones de despliegue: `robotctl` con el daemon de microduck (método documentado); al ser ONNX, es portable a runtimes ONNX Runtime, pero no se documenta ese uso.
- Latencia y throughput: no disponibles; el control opera a 50 Hz por diseño del entorno.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints o políticas comparables en la documentación proporcionada. El propio autor menciona una receta compartida por "TheSauceman" y otras ejecuciones de su segunda tanda de entrenamiento ("hill-2"), pero sin datos de rendimiento que permitan una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-hill-climb-1m5-hill-2-i | no disponible | no aplica (observación 61-D) | 5/5 subidas (autor) | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para subir una rampa de 1,5 m con el microduck; no generaliza a otras tareas, terrenos ni morfologías.
- Sin licencia declarada: la ausencia de licencia impide determinar condiciones de uso comercial o de redistribución; debe consultarse al autor antes de cualquier uso en producción.
- Sin datos de benchmarks formales: la afirmación de 5/5 subidas no va acompañada de protocolo, métricas ni vídeos verificables en la información disponible.
- Riesgo de brecha sim-to-real: el autor no reporta métricas de transferencia a hardware real más allá de sus pruebas; el comportamiento en condiciones distintas (fricción, desgaste, batería) es incierto.
- No reproducible bit a bit: el propio autor advierte que reentrenar con la misma semilla produce pesos distintos.
- Sin idiomas ni capacidades generativas: cualquier uso como modelo de lenguaje, visión o agentes conversacionales está fuera de su ámbito.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Advertencia de integración: el normalizador de observaciones está embebido en `policy.onnx`; alimentar observaciones ya normalizadas produciría un comportamiento incorrecto.
- Dependencia del ecosistema microduck: el despliegue requiere el daemon y el esquema de manifiesto de políticas de ese proyecto; no es un artefacto autónomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-2-i
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de challenges y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Rama de entrenamiento: `race-2`, commit `b44f7ffc9` (en el repositorio anterior)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado por el autor, sin URL directa disponible)
- Paper, blog o demo: no disponible
