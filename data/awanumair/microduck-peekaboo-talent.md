# awanumair/microduck-peekaboo-talent

## Resumen

`microduck-peekaboo-talent` es una política de control para el robot microduck de Pollen Robotics, publicada por el usuario awanumair en HuggingFace. No es un modelo de lenguaje: es un «talento» o marcha (gait) de refuerzo que se carga en una ranura de política del daemon del robot y se ejecuta de forma perpetua hasta que se le indique lo contrario. La política implementa un comportamiento concreto y coreografiado: el robot baja el pico hacia el pecho, lo mantiene, lo levanta y emite un quack en cada revelación, cuatro veces en 18,8 segundos.

El modelo se entrenó con PPO en MuJoCo sobre un portátil con GPU GTX 1650, a lo largo de 9.599 iteraciones. El resultado se exporta a ONNX (`policy.onnx`) con el normalizador de observaciones embebido, de modo que la política consume observaciones crudas sin preprocesado externo. La interfaz es de 61 dimensiones de observación y 14 dimensiones de acción a 50 Hz.

Su relevancia es acotada pero clara: ejemplifica el flujo completo de extremo a extremo del stack de aprendizaje por refuerzo de microduck (entrenamiento en simulación, exportación a ONNX, manifiesto de política y carga en robot real) y sirve como referencia reproducible para quien quiera entrenar o integrar talentos propios. El repositorio es de tamaño 0,0 GB, con 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL entrenada con PPO y exportada a ONNX; la topología de la red no se detalla en la model card) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de control reactiva; observación de 61 dimensiones por paso, sin ventana de contexto textual) |
| Tipos de cuantización | No disponible (único artefacto documentado: `policy.onnx`; se desconoce si se publica en FP32, FP16 o cuantizado) |
| Idiomas soportados | No aplica (no genera lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck |
| Espacio de observación | 61 dimensiones (normalizador embebido en el ONNX) |
| Espacio de acciones | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Tipo de política | Perpetua (se ejecuta hasta recibir orden de parada) |
| Algoritmo de entrenamiento | PPO en MuJoCo |
| Iteraciones de entrenamiento | 9.599 |
| Hardware de entrenamiento | Portátil con NVIDIA GeForce GTX 1650 |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a` |
| Pipeline declarado | `robotics` |
| Librería | `microduck` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-23T14:49:15Z / 2026-10-23T14:49:18Z |

## Arquitectura y entrenamiento

La información disponible no especifica la topología de la red (número de capas, anchura, funciones de activación ni si emplea memoria recurrente). Lo que sí se documenta es el paradigma: aprendizaje por refuerzo con PPO en el simulador MuJoCo, sobre el repositorio `microduck_rl` (rama `main`, commit `6ff40704a`), durante 9.599 iteraciones y en una GPU GTX 1650 de portátil. El artefacto final es una política ONNX que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz.

El detalle técnico más relevante para la integración es que el normalizador de observaciones está horneado dentro de `policy.onnx`: la política espera observaciones crudas del robot, sin escalado ni normalización por parte del cliente. La política se declara «perpetua», es decir, no tiene condición de terminación interna y se ejecuta como una marcha continua hasta que el operador la descargue. El comportamiento descrito en la model card (cuatro ciclos de pico-abajo/pico-arriba con quack en 18,8 s) implica una periodicidad aproximada de 4,7 s por ciclo, deducida aritméticamente del texto y no de una medición independiente. La mención del quack sugiere el uso del actuador de sonido del robot, aunque no se detalla la correspondencia entre las 14 salidas de acción y los actuadores físicos.

## Capacidades

- Ejecución de una rutina de exhibición concreta: cuatro ciclos de «peekaboo» (bajar el pico al pecho, mantener, subir y emitir un quack) en 18,8 s.
- Control continuo a 50 Hz con un espacio de acción de 14 dimensiones sobre el robot microduck.
- Consumo de observaciones crudas de 61 dimensiones gracias al normalizador embebido en el grafo ONNX.
- Ejecución perpetua: la política no finaliza por sí misma; requiere una orden explícita del operador o del daemon.
- Carga y descarga en caliente mediante ranuras de política (`sudo robotctl policy load <slot> awanumair/microduck-peekaboo-talent`).
- Portabilidad de inferencia vía ONNX, lo que permite ejecutar la política con distintos runtimes compatibles.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo; esas categorías no aplican a este artefacto.

## Casos de uso

- Demostración educativa en talleres de robótica: cargar la política en un microduck para mostrar de forma visible y comprensible qué produce un entrenamiento con PPO en simulación, con una rutina de menos de 20 segundos que se repite indefinidamente.
- Prueba de integración del daemon `robotctl`: usar la política como carga de prueba para validar el ciclo completo de `policy load`, el parseo de `manifest.json` conforme al esquema 2 y la correcta ocupación de una ranura de política.
- Verificación de sim-to-real: comparar la ejecución real de los cuatro ciclos con la duración nominal de 18,8 s para medir desviaciones de temporización, deriva de articulaciones o fallos de transferencia desde MuJoCo.
- Benchmark de inferencia en hardware embebido: al ser una política ONNX pequeña, sirve para medir si un SBC o una Jetson sostiene el presupuesto de 20 ms por paso que impone el bucle de control a 50 Hz.
- Animación de robots en ferias, museos o aulas: comportamiento corto, reconocible y no interactivo, adecuado para atraer atención sin requerir supervisión continua.
- Encadenamiento de talentos: combinarla con otras políticas (locomoción, gestos) en ranuras distintas para construir secuencias de exhibición más largas, aprovechando la semántica de «marcha» del stack de microduck.
- Reproducción de experimentos de RL: reentrenar desde el commit `6ff40704a` del repositorio `microduck_rl` para estudiar la sensibilidad de PPO al número de iteraciones (9.599) en una GTX 1650.
- Base de comparación interna: utilizarla como línea base de comportamiento periódico al desarrollar nuevas políticas para la misma plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas estándar (MMLU, HumanEval, GSM8K u otras) aplicables a este artefacto, ya que no es un modelo de lenguaje. Los únicos datos cuantitativos publicados son de comportamiento y de entrenamiento:

| Métrica | Valor | Origen |
|---|---|---|
| Ciclos de «peekaboo» por ejecución | 4 | Model card |
| Duración total de la rutina | 18,8 s | Model card |
| Periodo medio por ciclo | ≈ 4,7 s (derivado de 18,8 s / 4) | Cálculo a partir de la model card |
| Frecuencia de control | 50 Hz (presupuesto de 20 ms por paso) | Model card |
| Iteraciones de entrenamiento PPO | 9.599 | Model card |
| Simulador | MuJoCo | Model card |
| Hardware de entrenamiento | GTX 1650 (portátil) | Model card |
| Métricas de recompensa, éxito o robustez | No disponible | — |
| Evaluación sim-to-real cuantitativa | No disponible | — |

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. El repositorio se declara con 0,0 GB y el artefacto es un único `policy.onnx` que mapea 61 entradas a 14 salidas, por lo que la huella esperada es de kilobytes a pocos megabytes; no se confirma el número de parámetros.
- GPU recomendadas: ninguna en particular. La política puede ejecutarse en CPU mediante ONNX Runtime; el entrenamiento se realizó en una GTX 1650, que marca el mínimo práctico para reentrenar, no para inferir.
- Cabe en GPU de consumo: sí, con margen amplio; también en hardware embebido tipo Raspberry Pi o Jetson, siempre que se sostenga el bucle de control a 50 Hz.
- Opciones de despliegue: ONNX Runtime como runtime subyacente, invocada a través del daemon de microduck y del comando `robotctl policy load`. No se documentan exportaciones a TensorRT, OpenVINO u otros formatos.
- Latencia y throughput: no disponibles como medición. El requisito del sistema es de 20 ms por paso (50 Hz); el cumplimiento real depende del hardware y del runtime y no se ha publicado.
- Almacenamiento: el manifiesto (`manifest.json`) debe acompañar al `policy.onnx` en la ranura de política; ambos son requisitos para la carga.

## Comparativa con modelos similares

No se dispone de datos publicados sobre otras políticas de microduck que permitan una comparación cuantitativa. La comparativa se limita a los atributos declarados de este artefacto frente a alternativas de la misma categoría, para las que no hay cifras disponibles.

| Modelo | Plataforma | Parámetros | Contexto | Comportamiento | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|---|
| `awanumair/microduck-peekaboo-talent` | microduck (61-D obs., 14 acciones, 50 Hz) | No disponible | No aplica | Rutina peekaboo de 4 ciclos en 18,8 s | No disponible | Solo duración e iteraciones de entrenamiento |
| Otras políticas publicadas en el hub de microduck | microduck | No disponible | No aplica | No disponible | No disponible | No disponible |
| Políticas de locomoción para cuadrúpedos/bípedos de otros stacks (p. ej. Isaac Gym + legged_gym) | Plataformas distintas | No disponible | No aplica | Locomoción continua | Habitualmente permisiva, según el proyecto | No comparable por diferencia de plataforma |

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso para uso comercial, redistribución o modificación. Es un bloqueo potencial para cualquier despliegue en producción hasta que el autor lo aclare.
- Ausencia total de métricas de evaluación: no hay datos de recompensa final, tasa de éxito, robustez ante perturbaciones ni evaluación sim-to-real. El comportamiento solo está descrito cualitativamente.
- Riesgo de sobreajuste a la dinámica de MuJoCo: con 9.599 iteraciones en una GTX 1650, no se documenta domain randomization ni validación en hardware real; la transferencia puede degradarse.
- Alcance funcional mínimo: es una rutina de exhibición, no una política de locomoción ni de manipulación; no sirve para navegar ni para tareas de propósito general.
- Dependencia del normalizador embebido: alimentar la política con observaciones ya normalizadas producirá acciones incorrectas, ya que el escalado se aplica dentro del grafo ONNX.
- Dependencia del esquema de manifiesto 2: cambios en el daemon o en el esquema pueden invalidar la carga de la política sin aviso.
- Sin soporte de lenguaje, visión ni interacción: no debe evaluarse con criterios de modelos fundacionales.
- Riesgo de alucinación: no aplica, al no generar texto; el fallo equivalente es la ejecución de una trayectoria incorrecta o el bloqueo de articulaciones, sin mecanismo de autocorrección conocido.
- Señales de madurez bajas: 0 descargas, 0 likes, repositorio de 0,0 GB y timestamps de creación y actualización separados por tres segundos, lo que sugiere una publicación automatizada y sin revisión posterior.
- Fecha de creación declarada en 2026-10-23: anomalía de metadatos que conviene verificar antes de citar el artefacto.
- Comportamiento con emisión de sonido: la model card menciona un quack por revelación, pero no se especifica cómo se mapea al actuador ni si requiere configuración adicional del robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/awanumair/microduck-peekaboo-talent
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: https://github.com/pollen-robotics/microduck_rl
- Commit de entrenamiento: https://github.com/pollen-robotics/microduck_rl/commit/6ff40704a
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (ruta citada en la model card; URL completa no proporcionada)
