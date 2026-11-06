# GinDuck/microduck-sprint-2m-sprint-2-c

## Resumen

`GinDuck/microduck-sprint-2m-sprint-2-c` es un checkpoint intermedio de una política de control por refuerzo entrenada para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una política neuronal que mapea una observación de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutarse de forma continua (comportamiento "perpetuo") sobre el robot físico o en simulación.

El autor, GinDuck, lo describe como un checkpoint de la mitad del entrenamiento de su "segundo sprint", orientado a maximizar velocidad bruta de desplazamiento y a "inclinarse hacia la carrera". Según la model card, completa cada carrera en aproximadamente 1,2 segundos. La receta de entrenamiento es compartida por TheSauceman y se apoya en el entorno `mjlab-microduck`.

Su relevancia es acotada pero concreta: forma parte de un ecosistema emergente de políticas de locomoción reutilizables para robots de bajo coste, distribuidas como artefactos ONNX que se cargan en un slot del daemon `robotctl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB (probablemente por redondeo de un artefacto pequeño).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (red neuronal de control; topología exacta no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Otros datos técnicos relevantes:

| Parámetro | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Normalizador de observaciones | integrado en `policy.onnx` (se alimenta con observaciones en bruto) |
| Pipeline declarado | robotics |
| Librería | microduck |
| Tamaño del repo | 0,0 GB |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el entorno `mjlab-microduck` (versión 0.1.0, commit `1efd853be`), sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento se lanzó el 2026-11-02T13:25:30Z con semilla 1, 4096 entornos paralelos y un máximo de 3000 iteraciones del agente; este checkpoint corresponde a la iteración 2500.

No se especifica en la información disponible la topología exacta de la red (número de capas, anchura, tipo de MLP o si incorpora memoria recurrente). El normalizador de observaciones está embebido en el propio grafo ONNX, de modo que el consumidor debe alimentar observaciones sin normalizar. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir la receta con el mismo `uv.lock`, comando y semilla produce una política "comparable", no idéntica. No se documentan detalles sobre el algoritmo RL concreto (PPO u otro), la función de recompensa ni la composición del dataset de entrenamiento en la información proporcionada.

## Capacidades

- Locomoción continua ("perpetua") del robot microduck: la política se ejecuta hasta que se le indique lo contrario, sin condición de terminación interna.
- Desplazamiento orientado a velocidad: el autor indica que completa cada carrera en aproximadamente 1,2 segundos.
- Control a 50 Hz con 14 acciones y 61 observaciones, adecuado para el bucle de control de bajo nivel del robot.
- Integración con el daemon `robotctl` mediante carga en un slot de política (`robotctl policy load <slot> ...`).
- Inferencia vía ONNX con normalización integrada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento: es una política de control motor, no un modelo de lenguaje.

## Casos de uso

- **Demostración de carrera en microduck**: cargar la política en un slot y ejecutarla sobre el robot físico para mostrar un galope rápido de aproximadamente 1,2 segundos por carrera, útil en vídeos de divulgación o ferias.
- **Benchmark interno de velocidad de locomoción**: servir como referencia cuantitativa (tiempo por carrera) frente a otros checkpoints del mismo autor, como `sprint-2-b` o los de la familia `roller`, para comparar recetas de entrenamiento.
- **Prueba de la infraestructura `robotctl`**: validar el flujo de carga de políticas, el esquema 2 de `manifest.json` y la compatibilidad del daemon con artefactos ONNX.
- **Punto de partida para fine-tuning o currículo de RL**: al ser un checkpoint intermedio (iteración 2500 de 3000), puede emplearse como inicialización en experimentos de continuación de entrenamiento dentro de `microduck-challenges`.
- **Evaluación de robustez en simulación**: ejecutar la política en `mjlab` con perturbaciones para medir estabilidad del galope antes de desplegarla en hardware.
- **Investigación educativa en RL para robótica**: usar la receta reproducible (comando `uv run train` documentado) como ejemplo didáctico de entrenamiento de políticas de locomoción con miles de entornos paralelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo-cuantitativo: cada carrera se completa en aproximadamente 1,2 segundos. No se ofrecen métricas de recompensa, tasa de éxito, distancia recorrida ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible con precisión; al tratarse de una política de control con observación de 61 dimensiones y 14 acciones, la huella es mínima (del orden de kilobytes a pocos megabytes), pero el tamaño exacto del artefacto no se indica (repo de 0,0 GB por redondeo).
- **GPU recomendadas**: no disponible. La inferencia ONNX de una política de este tipo cabe holgadamente en CPU y en cualquier GPU consumer moderna.
- **¿Cabe en GPU consumer?**: sí, con total seguridad, dado el reducido tamaño esperado del artefacto; no se especifican modelos concretos (RTX 4090, etc.) porque no hay datos.
- **Opciones de despliegue**: ONNX Runtime (formato nativo del artefacto) y el daemon `robotctl` del ecosistema microduck. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: el bucle de control opera a 50 Hz (20 ms por paso); no se publican latencias medidas por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Notas |
|---|---|---|---|---|---|
| `GinDuck/microduck-sprint-2m-sprint-2-c` | Política RL (galope rápido) | 61 / 14 | 50 Hz | no disponible | Checkpoint iteración 2500; ~1,2 s por carrera |
| `GinDuck/microduck-sprint-2m-sprint-2-b` | Política RL (sprint) | 61 / 14 (según ecosistema) | 50 Hz | no disponible | Otro checkpoint del mismo sprint |
| `GinDuck/microduck-roller-sprint-2m-roller-2-c` | Política RL (roller) | 61 / 14 (según ecosistema) | 50 Hz | no disponible | Checkpoint anterior de la variante roller |

No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estas políticas; la comparación se limita a linaje, variante de comportamiento y fecha de publicación.

## Limitaciones y advertencias

- **Licencia no disponible**: no se declara licencia en la información proporcionada, lo que impide determinar si el uso comercial está permitido. Conviene contactar con el autor antes de cualquier despliegue productivo.
- **Checkpoint intermedio**: corresponde a la iteración 2500 de un entrenamiento de hasta 3000, por lo que no es necesariamente la versión final ni la más pulida de la receta.
- **No reproducible bit a bit**: el propio autor advierte que reentrenar con la misma semilla produce pesos distintos; no debe tratarse como artefacto determinista.
- **Especialización estrecha**: la política está entrenada para velocidad y carrera; puede comportarse de forma deficiente en otras tareas (carga, manipulación, terreno irregular) no cubiertas por la receta.
- **Sin datos de robustez**: no se publican evaluaciones de sim-to-real, resistencia a perturbaciones ni tasas de caída, lo que supone un riesgo para uso en hardware real sin validación previa.
- **Riesgo de alucinación**: no aplica, al no ser un modelo generativo de texto.
- **Sin soporte multilingüe ni de contexto**: no aplica; cualquier expectativa de uso como modelo de lenguaje es un error de categoría.
- **Adopción nula verificable**: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-c
- Checkpoint hermano `sprint-2-b`: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-b
- Checkpoint de la variante roller: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-c
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
