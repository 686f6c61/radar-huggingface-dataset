# GinDuck/microduck-duck-rock-plumps

## Resumen

`GinDuck/microduck-duck-rock-plumps` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot bípedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo fundacional multimodal: es un controlador neuronal que se carga en una "policy slot" del daemon `robotctl` del robot y se ejecuta de forma continua a 50 Hz, recibiendo observaciones de 61 dimensiones y emitiendo 14 acciones. El repositorio contiene un `policy.onnx` con el normalizador de observaciones integrado y un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

El modelo se entrenó en el entorno de simulación `mjlab-microduck 0.1.0` (basado en MuJoCo y mjlab) bajo la tarea `Mjlab-GotATalent-MicroDuck`, con 4096 entornos paralelos y 3000 iteraciones de agente, usando semilla 1. La model card describe el comportamiento como una coreografía: "cartwheels", "backrolls" y un "headspin" ejecutados por acróbatas invitados, con un "plumps" final de la cantante. Se trata, por tanto, de una política de locomoción y acrobacia concreta, no de un modelo generalista.

Su relevancia es acotada pero clara para la comunidad de robótica open source: demuestra el flujo completo de entrenamiento y despliegue de políticas RL en un robot de bajo coste (25 cm, 15 motores, cámara, LiDAR y pico prensil, con precios de preventa entre 399 y 499 USD), y sirve como ejemplo reproducible de un pipeline `uv` + mjlab + ONNX con semilla y commit fijados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (reinforcement learning), exportada a ONNX; arquitectura interna de la red no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso, ejecución a 50 Hz |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones). Lo que sí se especifica es la interfaz: observación de 61 dimensiones, 14 acciones de control y frecuencia de ejecución de 50 Hz, con el normalizador de observaciones embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto. La política es "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha o gait cargada en un slot.

El entrenamiento se realizó con el framework mjlab sobre la base `mjlab-microduck 0.1.0` (commit `1efd853be`), en la tarea `Mjlab-GotATalent-MicroDuck`, con 4096 entornos simulados en paralelo, 3000 iteraciones máximas de agente, semilla 1 y checkpoint 4, iniciado el 2026-10-31. El código, el `uv.lock` y el comando exacto están publicados en el repositorio `pollen-robotics/microduck-challenges` (rama `main`, commit `dc73b9237`). El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetirlo produce una política comparable, no idéntica.

## Capacidades

- Control motriz continuo de un robot bípedo microduck a 50 Hz con 14 acciones.
- Ejecución de una secuencia acrobática concreta ("duck-rock-plumps") descrita en la model card, con trucos de acróbatas invitados y un movimiento final propio.
- Comportamiento perpetuo: mantiene la política activa de forma indefinida hasta recibir una orden de parada o sustitución.
- Normalización de observaciones integrada en el modelo ONNX, lo que simplifica la integración en el daemon.
- Carga y despliegue mediante el comando `robotctl policy load <slot> GinDuck/microduck-duck-rock-plumps`.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Demostración de acrobacia robótica: cargar la política en un microduck físico para exhibir una coreografía de trucos en eventos, ferias o vídeos de producto, aprovechando que el modelo está pensado para ejecutarse en bucle.
- Docencia de aprendizaje por refuerzo: usar el repositorio `microduck-challenges` y el comando de reproducción documentado para que estudiantes entrenen variantes de la política con la misma semilla y comparen resultados.
- Benchmark de pipelines RL en simulación: servir como referencia de un entrenamiento con 4096 entornos paralelos y 3000 iteraciones en mjlab, útil para medir tiempos y consumo de GPU en configuraciones equivalentes.
- Prueba de integración del daemon `robotctl`: validar el flujo de carga de políticas, el esquema 2 de `manifest.json` y la sustitución de slots en un robot real.
- Base para ajuste fino de nuevas habilidades: partir de esta política como inicialización o referencia para entrenar otras tareas sobre el mismo robot (por ejemplo, marcha estable o manipulación con el pico), reutilizando el entorno `Mjlab-GotATalent-MicroDuck`.
- Investigación en sim-to-real: evaluar la transferencia de una política entrenada íntegramente en simulación a un bípedo de 25 cm con 15 motores, cámara y LiDAR, documentando discrepancias de comportamiento.
- Composición de repertorios: encadenar esta política con otras cargadas en slots distintos para construir secuencias de exhibición, dado el carácter perpetuo y sustituible de cada gait.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y se distribuye un único `policy.onnx`, por lo que el modelo es previsiblemente muy ligero, pero no se aportan cifras.
- GPU recomendadas: no disponibles para inferencia. Para el entrenamiento documentado se emplean 4096 entornos paralelos en mjlab, lo que en la práctica exige GPU de datacenter (A100, H100 o similar); no se especifica el hardware exacto utilizado.
- ¿Cabe en GPU de consumo? No confirmado. Dado el tamaño del artefacto, la inferencia debería ser viable en hardware modesto, pero no hay datos publicados.
- Opciones de despliegue: el runtime previsto es el daemon `robotctl` del microduck, que carga `policy.onnx` en un slot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política está diseñada para ejecutarse a 50 Hz (periodo de 20 ms por paso de control). No se publican latencias medidas ni throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-duck-rock-plumps | Política RL para microduck (ONNX) | no disponible | 61-D de observación, 14 acciones, 50 Hz | no disponible | Hugging Face (0 descargas) |
| Otras políticas de `microduck-challenges` | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio Pollen Robotics |
| Políticas RL para robots bípedos de otros fabricantes | Control motriz | no disponible | no disponible | varía | no disponible |

No se dispone de datos públicos de benchmarks ni de especificaciones comparables de otras políticas del mismo repositorio, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no responde preguntas y no tiene capacidades de razonamiento simbólico.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- El entrenamiento no es bit-reproducible: la reproducibilidad es funcional (política comparable), no exacta.
- El comportamiento está especializado en una coreografía concreta; no se documenta su robustez ante perturbaciones, terrenos variables o fallos de hardware.
- No se publican métricas de éxito, tasas de caída, ni evaluaciones sim-to-real, por lo que el rendimiento real en el robot físico es desconocido.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por terceros.
- No se especifican sesgos, pero al ser una política entrenada en simulación, puede heredar discrepancias del modelo físico (fricción, masas, latencias) no documentadas.
- El identificador del modelo incluye una marca ("GinDuck") y una temática musical; verificar que su uso público no infringe derechos asociados a la descripción de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-duck-rock-plumps
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página oficial de microduck: https://pollen-robotics.com/microduck/
- Tienda / preventa de microduck: https://microducks.org/
