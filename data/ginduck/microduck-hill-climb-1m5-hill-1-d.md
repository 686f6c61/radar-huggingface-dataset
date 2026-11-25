# GinDuck/microduck-hill-climb-1m5-hill-1-d

## Resumen

`microduck-hill-climb-1m5-hill-1-d` es un checkpoint de política de refuerzo (reinforcement learning) publicado por el usuario GinDuck en Hugging Face, entrenado para el robot cuadrúpedo de bajo coste MicroDuck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal que mapea observaciones del robot (61 dimensiones) a acciones de control (14 dimensiones) a 50 Hz, empaquetado como grafo ONNX y distribuido mediante el formato de manifiesto propio de la librería `microduck`.

El modelo resuelve una tarea concreta de locomoción: subir una rampa de 1,5 metros de altura. Según la model card, es el primer checkpoint del autor para esta tarea, entrenado con la receta estándar del framework de Pollen sin ajustes posteriores, y alcanzó la cima en las cinco pruebas realizadas por el autor. Es una política de tipo "perpetuo": una vez cargada en una ranura de política del robot, ejecuta la marcha indefinidamente hasta que se le indique lo contrario.

Su relevancia es acotada pero clara para quien trabaja con robótica de bajo coste y entornos de simulación a realidad (sim2real): demuestra un flujo completo de entrenamiento con `mjlab`, exportación a ONNX con normalizador de observaciones embebido y despliegue en hardware real mediante `robotctl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere un artefacto muy ligero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (red neuronal; topología no detallada) exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye como ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Entrada | 61-D observación (raw; normalizador embebido) |
| Salida | 14 acciones |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-HillClimb1m5-MicroDuck` |
| Checkpoint | 2999 |
| Semilla | 1 |
| Framework de entrenamiento | mjlab-microduck 0.1.0 @ 1efd853be |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de activaciones). Lo que sí se documenta es el pipeline: se entrenó con el framework `mjlab` (versión `mjlab-microduck 0.1.0`, commit `1efd853be`) sobre la tarea `Mjlab-HillClimb1m5-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, en la rama `main` y commit `dc73b9237`. El entrenamiento se ejecutó con 4096 entornos paralelos, 3000 iteraciones máximas y semilla 1, con registro en TensorBoard bajo el nombre de ejecución `hill-1`.

El autor indica explícitamente que se usó "la receta simple de Pollen antes de ajustar nada", es decir, sin modificaciones sobre la configuración por defecto. Un detalle técnico relevante es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto. El autor advierte que el entrenamiento por RL en GPU no es reproducible bit a bit entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción cuadrúpeda: ejecuta una marcha continua sobre el MicroDuck a 50 Hz.
- Ascenso de rampa: la tarea objetivo es subir una pendiente de 1,5 metros de altura; el autor reporta éxito en 5 de 5 pruebas.
- Política perpetua: se ejecuta de forma indefinida hasta que se le indique lo contrario, encajada en una ranura de política del daemon.
- Interfaz de observación directa: acepta las 61 dimensiones de observación del robot sin preprocesado externo.
- Despliegue en hardware real: se carga en el robot con `robotctl policy load <slot> GinDuck/microduck-hill-climb-1m5-hill-1-d`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Demostración de sim2real en robótica de bajo coste: cargar la política en un MicroDuck físico para validar que un controlador entrenado en `mjlab` transfiere a hardware real, usando el comando `robotctl` documentado en la model card.
- Reproducción de experimentos de RL: clonar `microduck-challenges`, hacer checkout del commit `dc73b9237` y lanzar el comando de entrenamiento con semilla 1 para obtener una política comparable y estudiar la varianza entre ejecuciones.
- Punto de partida para ajuste fino: al ser un checkpoint de la receta por defecto, sirve como línea base frente a la cual comparar recetas sintonizadas para la misma tarea de ascenso de rampa.
- Benchmark interno de locomoción: usar la tasa de éxito en la rampa de 1,5 m como referencia para evaluar otras políticas o cambios en el entorno de simulación.
- Integración en pipelines de despliegue: el formato ONNX con normalizador embebido y el manifiesto schema 2 permiten automatizar la carga de políticas en el daemon del robot sin pasos manuales de preprocesado.
- Docencia y divulgación: ejemplo completo y de código abierto del ciclo entrenamiento, exportación y despliegue de una política de RL para un cuadrúpedo de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es cualitativo y aportado por el autor: la política alcanzó la cima en las cinco pruebas realizadas, con un ritmo descrito como lento en la rampa.

## Requisitos de hardware

- VRAM para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y la política se ejecuta como grafo ONNX, por lo que la huella esperada es mínima, aunque no se publican cifras.
- GPU recomendadas: no disponible para inferencia; para reentrenar, el comando documentado usa 4096 entornos paralelos, lo que implica una GPU de gama alta (el autor no especifica modelo).
- Viabilidad en GPU de consumo: no confirmada; el entrenamiento con 4096 entornos paralelos difícilmente cabe en GPUs de consumo, pero la inferencia ONNX probablemente sí, sin datos que lo confirmen.
- Opciones de despliegue: runtime ONNX sobre el daemon del robot mediante `robotctl`; el entrenamiento se ejecuta con `uv run train` dentro de `microduck-challenges`.
- Latencia y throughput: la política opera a 50 Hz (periodo de 20 ms por paso de control); no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de MicroDuck ni checkpoints comparables de la misma tarea con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Entrenada exclusivamente para la tarea de ascenso de rampa de 1,5 m; no se documenta su comportamiento en otros terrenos.
- El autor describe el ritmo de ascenso como lento, lo que sugiere una política funcional pero no optimizada en velocidad.
- Entrenada con la receta por defecto y sin ajustes, por lo que probablemente queda margen de mejora frente a recetas sintonizadas.
- No reproducible bit a bit: el propio autor advierte que el mismo comando y semilla producen pesos distintos en otra máquina.
- Sin métricas cuantitativas publicadas (tasa de éxito formal, tiempos, energía); la evidencia es anecdótica (cinco pruebas del autor).
- Sin descargas ni validación de la comunidad en el momento de la consulta; madurez y robustez no verificadas de forma independiente.
- El repositorio enlaza a un sitio externo (`imundo.ch/quackpack/`) ajeno al modelo; no debe tratarse como documentación técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-hill-climb-1m5-hill-1-d
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Framework microduck: https://github.com/pollen-robotics/microduck
- Enlace externo citado en la model card (no técnico): https://www.imundo.ch/quackpack/
