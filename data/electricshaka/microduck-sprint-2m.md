# ElectricShaka/microduck-sprint-2m

## Resumen

microduck-sprint-2m es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es una política de locomoción (gait) que se ejecuta en bucle de forma perpetua sobre el robot, recibiendo observaciones de 61 dimensiones y emitiendo 14 acciones a 50 Hz. El autor del artefacto en Hugging Face es el usuario ElectricShaka, que publica el resultado del entrenamiento como un fichero ONNX con el normalizador de observaciones embebido.

La relevancia del modelo radica en su formato de distribución: se empaqueta como un slot de política cargable directamente en un robot físico mediante el comando `robotctl policy load`, siguiendo el esquema 2 del manifiesto de políticas de microduck. Esto convierte un artefacto de RL en un componente desplegable sin necesidad de recompilar ni reentrenar, algo poco habitual en el ecosistema de robótica open source. El nombre "sprint-2m" sugiere una política de marcha rápida orientada a la prueba de 2 metros de la Microduck Arena, aunque la model card no confirma explícitamente esa asociación.

El repositorio tiene un tamaño de 0.0 GB reportado, sin descargas ni likes en el momento de la consulta, y no declara licencia ni idiomas soportados. La información técnica disponible es escasa y proviene casi exclusivamente de la model card y de los resultados de búsqueda sobre variantes del mismo nombre publicadas por otro usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal. Se trata de una política de aprendizaje por refuerzo exportada a ONNX, con el normalizador de observaciones integrado en el propio grafo (`policy.onnx`), de modo que el consumidor debe alimentar observaciones en crudo. La política opera a 50 Hz con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones, coherente con el chasis cuadrúpedo de microduck.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `c601a991f`. No se especifican el número de pasos de entrenamiento, la composición del dataset (en RL se generaría por simulación), el algoritmo concreto (PPO, SAC, etc.) ni si hubo currículo de recompensas o domain randomization. Tampoco se detalla el simulador empleado ni el proceso de transferencia sim-a-real. Toda esta información debe considerarse no disponible.

## Capacidades

- Locomoción autónoma perpetua: la política ejecuta una marcha continua hasta que se le indique lo contrario, sin horizonte temporal fijo.
- Control a 50 Hz con 14 acciones y 61 observaciones, adaptado a la morfología del microduck.
- Normalización de observaciones embebida en el ONNX, lo que simplifica la integración en el daemon del robot.
- Carga directa en un slot de política mediante `robotctl policy load <slot> ElectricShaka/microduck-sprint-2m`.
- Compatibilidad con el manifiesto de políticas de microduck en su esquema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No se declaran capacidades de visión, audio ni modo thinking.

## Casos de uso

- Demostración de locomoción en microduck: cargar la política en un slot y ejecutar la marcha en el robot físico para validar el comportamiento en hardware real, aprovechando que el normalizador está embebido y no requiere preprocesado externo.
- Benchmark en Microduck Arena (prueba sprint-2m): la política puede emplearse como referencia de velocidad en la prueba de 2 metros, aunque el autor no publica tiempos propios; las variantes de jhp123 reportan medias de 1.115 s y 1.137 s con `command_vx` fijado a 1.1487357785146879.
- Base para experimentos de RL en robótica: sirve como punto de partida o línea base para comparar políticas entrenadas con el repositorio `microduck_rl`, dado que se conoce el commit exacto de entrenamiento.
- Integración en pipelines de simulación: al ser un ONNX autocontenido, puede cargarse en un simulador o en un runner de Arena para evaluar el gait sin hardware.
- Docencia y prototipado: ejemplo mínimo de cómo se distribuye una política de RL como artefacto desplegable en un robot de bajo coste, útil en cursos de robótica y RL aplicado.
- Sustitución de políticas en producción: al cargarse por slot, permite alternar entre marchas (por ejemplo, una política de sprint y otra de marcha estable) sin reflashear el firmware del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este artefacto concreto. Los resultados de búsqueda corresponden a variantes publicadas por el usuario jhp123, no al modelo de ElectricShaka, y se recogen a título de contexto del ecosistema Arena:

| Artefacto | Media (s) | Éxitos | Tiempos individuales (s) |
|---|---|---|---|
| jhp123/microduck-sprint-2m-1137ms-20261029 | 1.137 | 5/5 | 1.110, 1.140, 1.150, 1.140, 1.145 |
| jhp123/microduck-sprint-2m-1115ms-20261030 | 1.115 | 5/5 | 1.065, 1.115, 1.130, 1.130, 1.135 |
| ElectricShaka/microduck-sprint-2m | no disponible | no disponible | no disponible |

En ambas variantes de jhp123 se fija `command_vx` a 1.1487357785146879 y se excluye la fase de preparación de 0.5 s.

## Requisitos de hardware

- El modelo se ejecuta en el propio robot microduck; no requiere GPU de servidor para inferencia en producción.
- VRAM estimada: no disponible, pero al ser una política de 61 entradas y 14 salidas exportada a ONNX, la huella es mínima y cabe holgadamente en CPU embebida.
- GPU recomendadas: no aplica para despliegue en robot. Para reentrenamiento con `pollen-robotics/microduck_rl` no se especifican requisitos.
- Cabe en cualquier GPU consumer e incluso en CPU; el cuello de botella es la frecuencia de control de 50 Hz, no el cómputo.
- Opciones de despliegue: runtime ONNX estándar y el daemon `robotctl` de microduck. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único dato temporal es el periodo de control de 50 Hz (20 ms por ciclo).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento Arena | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ElectricShaka/microduck-sprint-2m | Política RL ONNX | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| jhp123/microduck-sprint-2m-1115ms-20261030 | Política RL ONNX | no disponible | no aplica | 1.115 s media, 5/5 | no disponible | Hugging Face |
| jhp123/microduck-sprint-2m-1137ms-20261029 | Política RL ONNX | no disponible | no aplica | 1.137 s media, 5/5 | no disponible | Hugging Face |

No se dispone de información sobre otras políticas de locomoción comparables fuera del ecosistema microduck.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- No se documenta el algoritmo de entrenamiento, el simulador, el número de pasos ni el proceso de transferencia sim-a-real, lo que dificulta evaluar la robustez de la política.
- El repositorio reporta 0.0 GB de tamaño, lo que puede indicar que los pesos no están efectivamente subidos o que el reporte de tamaño es incorrecto; conviene verificar la descarga antes de integrarlo.
- Sin descargas ni likes, no hay evidencia de validación por terceros sobre el comportamiento en hardware real.
- Al ser una política perpetua sin condición de parada propia, requiere que el operador gestione explícitamente la detención; un fallo en el daemon podría dejar la marcha activa.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas, ya que no es un modelo de lenguaje; esos criterios no aplican.
- El nombre "sprint-2m" sugiere una asociación con la prueba de 2 metros de la Microduck Arena, pero la model card no lo confirma ni publica tiempos, por lo que no debe asumirse un rendimiento concreto en esa prueba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElectricShaka/microduck-sprint-2m
- Repositorio de microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `c601a991f`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Variante de jhp123 (1.137 s): https://huggingface.co/jhp123/microduck-sprint-2m-1137ms-20261029
- Variante de jhp123 (1.115 s): https://huggingface.co/jhp123/microduck-sprint-2m-1115ms-20261030
