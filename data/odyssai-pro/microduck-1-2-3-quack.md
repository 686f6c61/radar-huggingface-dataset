# OdyssAI-Pro/microduck-1-2-3-quack

## Resumen

`OdyssAI-Pro/microduck-1-2-3-quack` es una política de control robótico para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo se publica como una política de locomoción "perpetua" que se ejecuta en bucle hasta que se detiene explícitamente, con una observación de 61 dimensiones y 14 acciones a una frecuencia de 50 Hz. No se trata de un modelo de lenguaje: es un controlador neuronal exportado a ONNX que se carga en una ranura de política del daemon `robotctl` del robot.

El aspecto técnico más relevante es que el autor no ha entrenado ninguna red: el archivo `policy.onnx` es exactamente la política de referencia `pollen-robotics/microduck-got-a-talent-reference`, sin modificar. El trabajo original del repositorio reside en la coreografía definida en `timeline.json`, que orquesta la política de referencia para cinco "cantantes" junto con dos políticas adicionales de terceros (`dashi/microduck-backroll` como director y `RemiFabre/microduck-rough-walk-e` como caminante). Es, por tanto, un artefacto de composición y no de entrenamiento.

Su relevancia es acotada pero ilustrativa: muestra el patrón de empaquetado y despliegue de políticas en el ecosistema microduck (manifiesto de esquema 2, normalizador de observaciones integrado en el ONNX) y demuestra cómo se pueden encadenar políticas preexistentes para crear comportamientos coordinados sin reentrenar. No aporta mejoras de rendimiento sobre el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal exportada a ONNX; arquitectura interna no documentada) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) + `timeline.json` |
| Entrada | observación de 61 dimensiones (normalizador integrado en el ONNX) |
| Salida | 14 acciones |
| Frecuencia de control | 50 Hz |
| Modelo base | `pollen-robotics/microduck-got-a-talent-reference` |

## Arquitectura y entrenamiento

No hay información disponible sobre la arquitectura interna de la red neuronal que compone `policy.onnx`; el repositorio no documenta capas, número de parámetros ni tipo de red (MLP, transformer, etc.). Lo que sí se especifica es la interfaz: recibe observaciones crudas de 61 dimensiones (el normalizador está embebido en el propio ONNX, por lo que no hay que preprocesar la entrada) y emite 14 acciones a 50 Hz. La política está diseñada para ejecutarse de forma perpetua, es decir, en bucle continuo hasta recibir una orden de parada.

En cuanto al entrenamiento, el autor declara explícitamente que el modelo "no se ha entrenado aquí": `policy.onnx` es la política de referencia de Pollen Robotics, sin cambios. El trabajo original del repositorio consiste en la coreografía de `timeline.json`, que coordina la política de referencia para cinco instancias ("los cinco cantantes") con dos políticas de terceros: `dashi/microduck-backroll` (el "director") y `RemiFabre/microduck-rough-walk-e` (el "caminante"). No se documentan datos de entrenamiento, tokens, composición del dataset ni técnicas de RLHF o DPO, dado que no hay entrenamiento propio.

## Capacidades

- Locomoción de un robot cuadrúpedo microduck mediante política de control neuronal a 50 Hz.
- Ejecución perpetua de la marcha hasta que se detiene explícitamente (comportamiento en bucle).
- Observación cruda de 61 dimensiones con normalización integrada en el ONNX (sin preprocesado externo).
- Generación de 14 acciones de control por paso de inferencia.
- Orquestación coreográfica de múltiples políticas: cinco instancias de la política de referencia más dos políticas de terceros coordinadas mediante `timeline.json`.
- Carga y despliegue mediante el daemon `robotctl` del ecosistema microduck, con manifiesto de esquema 2.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni procesamiento de visión, audio o texto: es exclusivamente un controlador motor.

## Casos de uso

- Demostración coreográfica en robot microduck: el modelo permite reproducir una secuencia coordinada de cinco robots "cantantes" con un director y un caminante, útil para exhibiciones, vídeos de divulgación y demostraciones de laboratorio.
- Prueba de integración del daemon `robotctl`: sirve como caso de prueba realista para validar la carga de políticas en ranuras, el esquema 2 del manifiesto y el flujo de despliegue del ecosistema microduck.
- Validación de composición de políticas: permite estudiar cómo se coordinan políticas preexistentes de distintos autores mediante un `timeline.json`, sin reentrenar ninguna red, como patrón para proyectos de robótica colaborativa.
- Benchmark de latencia de inferencia ONNX a 50 Hz: al ser una política perpetua con interfaz fija (61 observaciones, 14 acciones), resulta útil para medir el coste de inferencia ONNX en el hardware del microduck.
- Docencia en robótica de refuerzo: ilustra el ciclo completo de una política de RL aplicada a un cuadrúpedo de bajo coste, desde el modelo base hasta la ejecución en hardware.
- Base para remezclas coreográficas: otros autores pueden partir de este repositorio para construir nuevas secuencias combinando las mismas políticas de referencia y de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de recompensa, tasa de éxito de la marcha, latencia medida ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible (el tamaño del ONNX no se especifica; el repositorio ocupa 0.0 GB según Hugging Face, lo que sugiere un modelo muy pequeño, pero no se confirma).
- GPU recomendadas: no disponibles; el modelo está pensado para ejecutarse en el propio robot microduck, no en servidores de inferencia.
- Viabilidad en GPU de consumo: no disponible; por el contexto (robot de bajo coste, control a 50 Hz), es plausible que se ejecute en CPU o en hardware embebido, pero no se documenta.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck (`sudo robotctl policy load <slot> ...`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; únicamente se conoce la frecuencia de control objetivo de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada / salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OdyssAI-Pro/microduck-1-2-3-quack` | Coreografía sobre política de referencia | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face |
| `pollen-robotics/microduck-got-a-talent-reference` | Política de referencia (base) | 61 obs / 14 acciones | 50 Hz | no disponible | Hugging Face |
| `dashi/microduck-backroll` | Política de terceros (director) | no disponible | no disponible | no disponible | Hugging Face |
| `RemiFabre/microduck-rough-walk-e` | Política de terceros (caminante) | no disponible | no disponible | no disponible | Hugging Face |

La comparación relevante es que `microduck-1-2-3-quack` no supera al modelo base en control: reutiliza su `policy.onnx` sin cambios y añade únicamente la capa de coordinación coreográfica. Frente a las otras dos políticas de terceros, la diferencia es funcional (rol en la coreografía), no de rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo de propósito general: no admite texto, código, visión ni audio.
- El `policy.onnx` no ha sido entrenado por el autor; cualquier mérito o defecto de control proviene del modelo base `pollen-robotics/microduck-got-a-talent-reference`.
- La licencia no está disponible, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Depende de políticas de terceros (`dashi/microduck-backroll` y `RemiFabre/microduck-rough-walk-e`) cuyas licencias tampoco se detallan en la información disponible, lo que añade incertidumbre legal a la coreografía completa.
- El repositorio tiene 0 descargas y 1 like, y fue creado y actualizado el mismo día (2026-11-10): no hay evidencia de validación por parte de la comunidad ni de pruebas en hardware documentadas.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto por tratarse de un controlador motor; el riesgo principal es de comportamiento físico inesperado en el robot (caídas, movimientos erráticos) si la política se ejecuta fuera de las condiciones previstas.
- El tamaño del repositorio se reporta como 0.0 GB, lo que puede indicar que los archivos de pesos no están efectivamente alojados o que la métrica no se ha calculado; conviene verificar la integridad de `policy.onnx` antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/OdyssAI-Pro/microduck-1-2-3-quack
- Modelo base: https://huggingface.co/pollen-robotics/microduck-got-a-talent-reference
- Política del director: https://huggingface.co/dashi/microduck-backroll
- Política del caminante: https://huggingface.co/RemiFabre/microduck-rough-walk-e
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
