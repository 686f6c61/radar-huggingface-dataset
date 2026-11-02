# HlibPlakhtii/microduck-sock-heist-remix-rz-tail-copy

## Resumen

`sock-heist-remix-rz-tail` es una política de control robótico para el robot cuadrúpedo microduck de Pollen Robotics, publicada originalmente por el usuario `rumezhak` y replicada sin modificaciones por `HlibPlakhtii`. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de una política entrenada mediante aprendizaje por refuerzo que produce una marcha (gait) continua a 50 Hz a partir de observaciones de 61 dimensiones y emitiendo 14 acciones de control articular. El artefacto se distribuye en formato ONNX con un manifiesto asociado que sigue el esquema 2 del daemon de políticas de microduck.

La política es "perpetua": una vez cargada en una ranura del robot, se ejecuta de forma indefinida hasta que se le indique lo contrario, comportándose como una marcha más dentro del repertorio del sistema. El normalizador de observaciones está embebido dentro del propio grafo `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional.

La relevancia de esta ficha es acotada: se trata de una copia byte a byte de otro modelo, sin entrenamiento ni optimización adicional, con cero descargas y cero likes en el momento de la consulta, y sin licencia declarada. Es útil como referencia de cómo se empaqueta una política de RL para microduck, pero no aporta nada nuevo respecto al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (arquitectura de red no especificada en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Modelo base | `rumezhak/microduck-sock-heist-remix-rz-tail` (revisión `7e74afd17457086f65c6d4b62bc3b9219f3d2ced`) |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de capa recurrente o feed-forward). Lo que sí se documenta es el contrato de entrada y salida: el modelo consume un vector de observación de 61 dimensiones a 50 Hz y emite 14 acciones de control. El normalizador de observaciones forma parte del grafo ONNX, por lo que la política espera observaciones sin normalizar y realiza ella misma la transformación.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`) mediante aprendizaje por refuerzo. No se especifican el número de pasos de entorno, la composición de recompensas, el algoritmo de RL empleado ni si hubo fases de ajuste fino o destilación. La copia publicada por `HlibPlakhtii` no añade entrenamiento ni optimización: el autor declara explícitamente que la política y el manifiesto son idénticos byte a byte al original.

## Capacidades

- Generación de una marcha perpetua para el robot cuadrúpedo microduck, ejecutándose de forma continua hasta recibir una orden de parada o sustitución.
- Control a 50 Hz con 14 acciones articulares derivadas de 61 observaciones.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el daemon.
- Carga directa en una ranura de política del sistema microduck mediante `robotctl`.
- Compatibilidad con el esquema 2 del manifiesto de políticas del daemon (`docs/policy-manifest.md`).
- No dispone de capacidades de lenguaje, visión, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Demostración de marcha en un microduck físico: cargar la política en una ranura con `robotctl policy load <slot> rumezhak/microduck-sock-heist-remix-rz-tail` y dejar que el robot camine de forma continua durante sesiones de exhibición o vídeo.
- Pruebas de integración del daemon de políticas: al ser una copia byte a byte del original, sirve para verificar que el pipeline de carga, el manifiesto de esquema 2 y la normalización embebida funcionan correctamente en un entorno de CI.
- Referencia de empaquetado para investigadores: útil como ejemplo canónico de cómo se estructura un artefacto `policy.onnx` + `manifest.json` para microduck antes de publicar políticas propias.
- Baseline en experimentos de RL comparados: permite reproducir exactamente el comportamiento del modelo base sin depender de la disponibilidad del repositorio original.
- Docencia y talleres de robótica con Pollen Robotics: una política perpetua y de bajo coste computacional es adecuada para sesiones prácticas donde el objetivo es entender el ciclo observación-acción a 50 Hz.
- Verificación de linaje de modelos: al declarar la revisión exacta del modelo base, facilita auditorías de procedencia en entornos donde se exige trazabilidad de artefactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB y no se documentan parámetros, por lo que la huella es presumiblemente mínima (política de control, no un modelo generativo).
- GPU recomendadas: no disponibles. Para una política de RL de este tipo, la inferencia suele ejecutarse en CPU del propio robot o en un SBC; no se especifica hardware objetivo.
- ¿Cabe en GPU de consumo? No se dispone de datos para confirmarlo, pero por la naturaleza del artefacto (ONNX de política de control) es altamente probable que no requiera GPU dedicada.
- Opciones de despliegue: el despliegue documentado es mediante el daemon de microduck (`robotctl policy load`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms por paso). No se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HlibPlakhtii/microduck-sock-heist-remix-rz-tail-copy` (esta ficha) | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | HuggingFace, 0 descargas |
| `rumezhak/microduck-sock-heist-remix-rz-tail` | Política RL para microduck (original) | 61 / 14 | 50 Hz | no disponible | HuggingFace |
| Otras políticas de microduck en `pollen-robotics/microduck_rl` | Políticas RL para microduck | no disponible | no disponible | no disponible | Repositorio de entrenamiento |

No se dispone de información sobre políticas comparables de otros robots o de otros autores dentro de la información proporcionada.

## Limitaciones y advertencias

- Es una copia sin modificaciones del modelo base: no aporta mejoras, correcciones ni entrenamiento adicional; su valor es puramente de replicación.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido. Antes de cualquier uso en producción debe aclararse la licencia con el autor original.
- No se documenta la arquitectura interna de la red ni el número de parámetros, lo que dificulta evaluar su robustez o su comportamiento fuera de distribución.
- Al ser una política perpetua, se ejecuta indefinidamente hasta que se le indique lo contrario; en un robot físico esto exige mecanismos externos de parada segura.
- No hay información sobre el dominio de entrenamiento (tipo de terreno, carga útil, velocidad objetivo), por lo que se desconoce su generalización fuera del entorno simulado o de las condiciones de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en la comunidad ni informes de comportamiento en hardware real.
- No aplica evaluación de sesgos, alucinación o capacidades multilingües por no ser un modelo de lenguaje.
- El repositorio tiene un tamaño declarado de 0.0 GB, lo que puede indicar que los archivos no están efectivamente alojados o que el tamaño se redondea; conviene verificar la integridad de `policy.onnx` antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HlibPlakhtii/microduck-sock-heist-remix-rz-tail-copy
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-remix-rz-tail
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`; no se proporciona URL directa en la información disponible)
