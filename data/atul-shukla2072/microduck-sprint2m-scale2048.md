# atul-shukla2072/microduck-sprint2m-scale2048

## Resumen

`microduck-sprint2m-scale2048` es una política de control motriz (locomoción) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto MicroDuck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política neuronal exportada a ONNX que se carga en el daemon de control del robot para ejecutar una marcha ("gait") de forma continua. El modelo ha sido publicado por el usuario `atul-shukla2072` como resultado de un entrenamiento sobre la tarea `Mjlab-Sprint2m-MicroDuck` dentro del repositorio de retos de la comunidad.

La política consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, con un normalizador de observaciones integrado en el propio fichero `policy.onnx`, de modo que el robot puede alimentarla directamente con observaciones en bruto. El entrenamiento se realizó con 2048 entornos paralelos, 1000 iteraciones máximas y semilla 1, partiendo del entorno `mjlab-microduck 0.1.0`.

El interés de esta ficha es limitado para el público general de modelos de IA: se trata de un artefacto muy específico de robótica, sin datos publicados de benchmarks, licencia declarada ni idiomas. No obstante, resulta relevante como ejemplo del flujo de trabajo de entrenamiento y despliegue de políticas RL en robótica de bajo coste, y del ecosistema de retos comunitarios alrededor de MicroDuck.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo exportada a ONNX (detalles de la red no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal (capas, tamaño de las mismas ni tipo de política). Se sabe que se trata de una política de control entrenada con aprendizaje por refuerzo en el entorno de simulación `mjlab-microduck 0.1.0`, sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 2048 entornos paralelos, hasta 1000 iteraciones del agente y semilla 1. El checkpoint exportado corresponde al paso 999.

El entrenamiento se realizó sobre el repositorio `microduck-challenges` (rama `main`, commit `4b675ebf4`) y el autor advierte que el proceso no es bit-reproducible entre máquinas: repetir el entrenamiento con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica. La exportación se realizó desde un checkout con cambios sin confirmar, un detalle relevante para quien intente reproducir exactamente el artefacto. La política se ejecuta a 50 Hz y está diseñada para operar de forma perpetua hasta recibir una orden de parada.

## Capacidades

- Control de locomoción continua del robot MicroDuck mediante una marcha ("sprint") de tipo perpetuo.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control a 50 Hz.
- Normalización de observaciones integrada en `policy.onnx`: acepta observaciones en bruto sin preprocesado externo.
- Carga y ejecución mediante el comando `robotctl policy load <slot> atul-shukla2072/microduck-sprint2m-scale2048`.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que permite su integración en el daemon de control.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Locomoción autónoma del MicroDuck en demostraciones y experimentos: la política se carga en una ranura del daemon y el robot ejecuta la marcha de forma continua, lo que permite probar el comportamiento del cuadrúpedo en el mundo real sin desarrollar un controlador propio.
- Evaluación de políticas entrenadas en simulación: sirve como referencia para comparar distintas configuraciones de entrenamiento (número de entornos, iteraciones, semillas) sobre la misma tarea `Mjlab-Sprint2m-MicroDuck`.
- Reproducción de experimentos de RL en robótica: el autor documenta el comando exacto de entrenamiento, de modo que investigadores pueden replicar el pipeline con `uv sync` y `uv run train` para estudiar la variabilidad entre ejecuciones.
- Desarrollo de retos comunitarios sobre microduck: al proceder del repositorio `microduck-challenges`, puede emplearse como baseline en competiciones o retos de la comunidad para superar en rendimiento de marcha.
- Integración en el daemon `robotctl`: el formato de manifiesto y la política ONNX permiten probar el flujo de carga y cambio de políticas en caliente en un robot físico.
- Docencia y prototipado en robótica de bajo coste: el tamaño reducido del repositorio (0,0 GB) y el formato ONNX facilitan su uso en entornos educativos con hardware asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y el modelo se ejecuta en el propio robot, por lo que la huella de memoria es previsiblemente muy reducida, aunque no se publican cifras.
- GPU recomendadas: no disponible para inferencia; para reentrenar, el autor emplea entrenamiento con GPU (2048 entornos paralelos), sin especificar el modelo de GPU utilizado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el daemon de microduck con `robotctl` y ejecución del fichero `policy.onnx`; no se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de artefacto).
- Latencia y throughput: la política opera a 50 Hz, pero no se publican cifras de latencia ni de throughput en hardware concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint2m-scale2048 | Política RL para MicroDuck | 61 / 14 | 50 Hz | no disponible | HuggingFace (0 descargas) |
| Otras políticas de microduck-challenges | Políticas RL para MicroDuck | no disponible | no disponible | no disponible | Repositorio de retos de la comunidad |
| Políticas RL para cuadrúpedos de otros fabricantes | Políticas RL específicas de robot | no disponible | no disponible | habitualmente no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal hasta que el autor la especifique.
- El modelo está entrenado exclusivamente para la tarea `Mjlab-Sprint2m-MicroDuck` y el robot MicroDuck; no es transferible a otros robots ni a otras tareas sin reentrenamiento.
- El entrenamiento no es bit-reproducible: la misma configuración y semilla producen pesos distintos en máquinas diferentes, lo que dificulta la auditoría exacta del artefacto.
- La exportación se realizó desde un checkout con cambios sin confirmar, lo que puede introducir divergencias respecto al código del commit declarado.
- No se publican métricas de rendimiento, robustez ni seguridad de la marcha en el mundo real (caídas, terreno, perturbaciones), por lo que se desconoce su fiabilidad en producción.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas porque el artefacto no es un modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/atul-shukla2072/microduck-sprint2m-scale2048
- Repositorio de retos de microduck: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon de microduck
