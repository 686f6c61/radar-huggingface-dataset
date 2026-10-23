# betsyxw/microduck-sprint-s2

## Resumen

`sprint-s2` (identificador `betsyxw/microduck-sprint-s2`) es una política de control entrenada con aprendizaje por refuerzo para el robot bípedo Microduck, el robot de 25 cm y 399 dólares desarrollado por Pollen Robotics y Hugging Face. No se trata de un modelo de lenguaje: es una política neuronal exportada a ONNX que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensada para ser cargada directamente en una ranura de política del daemon `robotctl` del robot.

El autor la describe como una política «perpetua»: una marcha que se ejecuta de forma continua hasta que se le indique lo contrario, sin condición de terminación explícita. Está entrenada sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, con el simulador mjlab (base `mjlab-microduck 0.1.0`), 4096 entornos paralelos y semilla 2, y corresponde al checkpoint 1500 de un máximo de 3000 iteraciones.

Su relevancia es doble: por un lado, amplía el ecosistema de políticas publicadas para un robot abierto y de bajo coste orientado a experimentación en IA física; por otro, sirve como ejemplo reproducible de un flujo completo de entrenamiento RL en simulación con exportación a un formato desplegable en hardware real. El repositorio es muy pequeño (0.0 GB reportados), no declara licencia ni idiomas, y no incluye resultados de benchmarks ni métricas de recompensa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política neuronal exportada a ONNX; la model card no detalla la topología de la red) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política reactiva: observación de 61 dimensiones por paso, sin ventana de contexto) |
| Tipos de cuantización | No disponible (se distribuye un único `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica / no disponible (modelo de control motor, sin entrada ni salida de texto) |
| Licencia | No disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Comportamiento | Política perpetua (se ejecuta hasta recibir una orden de parada; sin condición de terminación propia) |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint | 1500 (de un máximo de 3000 iteraciones configuradas) |
| Semilla | 2 (`--agent.seed 2`, `--env.seed 2`) |
| Entornos paralelos en entrenamiento | 4096 |
| Base de simulación | `mjlab-microduck 0.1.0 @ 8d0dbc94c` |
| Normalizador de observaciones | Incluido dentro de `policy.onnx` (se alimenta con observaciones en crudo) |
| Librería declarada | `microduck` |
| Tamaño del repositorio | 0.0 GB (según HuggingFace) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La información disponible no especifica la topología de la red (número de capas, anchura, función de activación ni algoritmo de RL empleado). Lo que sí se documenta es la interfaz: entrada de 61 dimensiones correspondiente al vector de observación del Microduck, salida de 14 dimensiones correspondiente a las acciones de control, ejecutadas a 50 Hz. El modelo se distribuye exclusivamente como grafo ONNX, con el normalizador de observaciones integrado en el propio grafo, de modo que el consumidor debe enviar observaciones sin preprocesar. El manifiesto `manifest.json` sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon, lo que permite cargarla mediante `robotctl policy load`.

El entrenamiento se realizó con aprendizaje por refuerzo en simulación sobre mjlab, con 4096 entornos ejecutados en paralelo, semilla 2 y un máximo de 3000 iteraciones, del cual se exportó el checkpoint 1500. La model card advierte explícitamente de que el artefacto se exportó desde un checkout con cambios sin confirmar, y de que el proceso no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica. No se detallan la composición del dataset (al ser RL en simulador, la «distribución» es la del entorno y la recompensa de la tarea), el número de tokens —concepto no aplicable—, ni si hubo etapas de ajuste posteriores al entrenamiento principal.

## Capacidades

- Locomoción bípeda continua: genera una marcha («sprint») que se mantiene indefinidamente hasta que el operador envía una orden de parada o carga otra política.
- Control reactivo a 50 Hz a partir de un vector proprioceptivo de 61 dimensiones.
- Ejecución autónoma sobre el robot real una vez cargada en una ranura de política mediante `robotctl`.
- Preprocesado integrado: el normalizador de observaciones viaja dentro del ONNX, lo que elimina errores de escalado en el despliegue.
- Compatibilidad con el ecosistema de manifiestos de microduck (esquema 2), lo que facilita el cambio entre políticas sin recompilar.
- Reproducibilidad del pipeline de entrenamiento documentada (comando, commit, semilla y configuración de entornos).
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión ni audio: es una política motora, no un modelo generativo.
- No se documentan capacidades de percepción (cámara, sensor de profundidad) en esta política, aunque el robot las incorpore a nivel de hardware.

## Casos de uso

- Marcha por defecto en el robot: cargar `sprint-s2` en una ranura con `sudo robotctl policy load <slot> betsyxw/microduck-sprint-s2` para disponer de una locomoción continua en demostraciones y pruebas de bancada, sin necesidad de definir una secuencia de pasos.
- Punto de partida para ajuste fino: reutilizar el comando de entrenamiento documentado (`uv run train Mjlab-Sprint2m-MicroDuck --env.scene.num-envs 4096 --agent.max-iterations 3000 --agent.seed 2`) cambiando la recompensa o el terreno para derivar variantes de marcha sobre la misma base.
- Evaluación sim2real: comparar el comportamiento del checkpoint 1500 en simulación mjlab y en el robot físico para medir la brecha de transferencia, aprovechando que el normalizador está embebido y la interfaz es idéntica en ambos entornos.
- Docencia e investigación en RL: el par (tarea, semilla, commit) constituye un caso de estudio acotado de entrenamiento masivamente paralelo con 4096 entornos y exportación a un formato desplegable.
- Comparación interna de políticas: al convivir con las siete políticas RL que el Microduck distribuye de fábrica y con otras publicadas por la comunidad, `sprint-s2` puede usarse como referencia de marcha continua en una batería de pruebas de estabilidad y consumo.
- Pruebas de robustez y seguridad: al ser una política sin condición de terminación propia, es útil para ensayar los mecanismos externos de parada y los límites de seguridad del daemon antes de desplegar políticas más complejas.
- Integración en pipelines de integración continua de robótica: descargar la política, validar el `manifest.json` contra el esquema 2 y ejecutar una prueba de corta duración en simulación como test de regresión del stack de control.
- Demostraciones públicas y ferias: el robot de 25 cm y bajo coste puede ejecutar una marcha continua y vistosa sin operador dedicado, dado el carácter perpetuo de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye recompensa media, tasa de caídas, error de seguimiento de trayectoria ni comparación alguna con otras políticas. Tampoco se documentan latencia de inferencia, throughput del ONNX ni consumo del robot durante la marcha. Los únicos datos cuantitativos publicados son de configuración de entrenamiento: 4096 entornos, 3000 iteraciones máximas, checkpoint 1500, semilla 2 y control a 50 Hz.

## Requisitos de hardware

- Inferencia: se ejecuta en el propio robot a través del daemon de microduck, que carga el ONNX en una ranura de política. No se especifica la computadora a bordo ni si requiere aceleración por GPU; el tamaño del repositorio (0.0 GB reportados) sugiere un grafo muy ligero, pero no se confirma.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas para inferencia: no aplica o no disponible; el despliegue previsto es en el hardware del robot con un runtime ONNX.
- GPU recomendadas para entrenamiento: no disponible. El comando documentado lanza 4096 entornos paralelos, lo que en la práctica exige una GPU con soporte CUDA, pero la información proporcionada no indica modelo, VRAM ni tiempo de entrenamiento.
- Compatibilidad con GPU de consumo: no disponible para entrenamiento; para inferencia, previsiblemente irrelevante al ejecutarse en el robot.
- Opciones de despliegue: `robotctl policy load` sobre el daemon de microduck (vía documentada). Cualquier otro runtime ONNX requeriría reproducir manualmente el contrato de observación de 61 dimensiones y acción de 14 dimensiones, algo no documentado en la ficha.
- Latencia y throughput: no disponibles; únicamente se conoce el periodo de control de 50 Hz (20 ms por paso).

## Comparativa con modelos similares

| Política | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `betsyxw/microduck-sprint-s2` | Política RL para Microduck, ONNX | 61 / 14 | 50 Hz | No disponible | HuggingFace, 0 descargas, 1 like |
| Políticas RL oficiales de Microduck | Políticas RL incluidas con el robot (se citan siete) | No disponible | No disponible | No disponible en la información consultada | distribuidas con el robot / ecosistema Pollen Robotics |
| `minjunglee27/microduck-models` | Repositorio de políticas y checkpoints RL para Microduck y transferencia sim2real | No disponible | No disponible | No disponible en la información consultada | HuggingFace |
| Políticas de otros bípedos pequeños (p. ej. Unitree G1, Booster) | Políticas RL específicas de cada plataforma | No disponible | No disponible | Habitualmente no abiertas | No comparable directamente: distinta morfología y dimensiones de observación |

No se dispone de datos de rendimiento de ninguna de las alternativas, por lo que la comparación se limita a formato, interfaz y disponibilidad. La conclusión razonable es que `sprint-s2` es una política comunitaria más dentro del ecosistema Microduck, sin métricas que permitan situarla por encima o por debajo de las oficiales.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial, redistribución ni obras derivadas; conviene contactar con el autor antes de integrarla en un producto.
- Reproducibilidad parcial: la propia model card indica que el artefacto se exportó desde un checkout con cambios sin confirmar y que el entrenamiento RL no es bit-reproducible entre máquinas; los pesos exactos no pueden regenerarse.
- Checkpoint intermedio: se exportó el paso 1500 de un máximo de 3000, por lo que no representa necesariamente la política convergida ni la mejor según la recompensa de la tarea.
- Ausencia total de métricas: sin recompensa, tasa de éxito, estabilidad ni pruebas de caída, no es posible evaluar su calidad frente a otras políticas antes de desplegarla.
- Brecha sim2real: entrenada íntegramente en mjlab; el rendimiento en el robot físico puede degradarse por fricción, holguras, latencias y calibración de sensores no modelados.
- Política perpetua sin terminación: no incorpora condiciones de parada propias, de modo que la seguridad depende por completo del daemon y de los límites externos; debe validarse la parada de emergencia antes de operar.
- Desajuste aparente de dimensiones: la acción es de 14 dimensiones mientras que el robot se describe con 15 motores; la información disponible no aclara qué actuador queda fuera del control de la política.
- Sin validación comunitaria: 0 descargas y 1 like en el momento de la consulta; no hay informes independientes de funcionamiento en hardware.
- Sin soporte multilingüe ni de texto: no es aplicable como modelo de lenguaje, y no debe confundirse con uno pese a estar alojado en HuggingFace.
- Tamaño de repositorio reportado de 0.0 GB: puede indicar que los pesos no están contabilizados o que el artefacto es extremadamente pequeño; conviene verificar la descarga real antes de desplegar.
- Sin documentación de sesgos en el sentido estadístico habitual, pero sí riesgo de sesgo de simulación: la política se ajusta a la distribución del terreno y la dinámica del simulador, y puede fallar en condiciones fuera de esa distribución (superficies blandas, rampas, empujes).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/betsyxw/microduck-sprint-s2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio de políticas de la comunidad: https://huggingface.co/minjunglee27/microduck-models
- Cobertura en MarkTechPost: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- Cobertura en TechCrunch: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- Cobertura en CNX Software: https://www.cnx-software.com/2026/08/28/microduck-a-duck-like-biped-robot-designed-for-physical-ai-experimentation-and-fun/
- Resumen en AI/TLDR: https://ai-tldr.dev/releases/huggingface-microduck/
