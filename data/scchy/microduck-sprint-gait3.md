# SccHy/microduck-sprint-gait3

## Resumen

`microduck-sprint-gait3` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un sistema multimodal generativo: es una política de locomoción que genera comandos de articulación a 50 Hz a partir de una observación de 61 dimensiones y produce 14 acciones de control. Lo publica el usuario SccHy en Hugging Face bajo el identificador `SccHy/microduck-sprint-gait3`, con fecha de creación el 4 de noviembre de 2026.

La política se distribuye en formato ONNX (`policy.onnx`) con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor puede alimentar observaciones en crudo sin preprocesado adicional. Se acompaña de un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck, lo que permite cargarla directamente en el daemon del robot mediante el comando `robotctl policy load`. El entrenamiento se realizó con el entorno `Mjlab-Sprint2m-MicroDuck` (base `mjlab-microduck 0.1.0`), un checkpoint 1000 y semilla 1.

Su relevancia es acotada pero concreta: es un ejemplo de política de locomoción "perpetua" (se ejecuta de forma continua hasta que se le indique lo contrario) lista para desplegar en hardware real, empaquetada según una convención de manifiesto propia del ecosistema microduck. No hay información pública sobre el rendimiento de la política ni sobre la licencia de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (red neuronal; topología no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (exportación a ONNX; no se documentan niveles de cuantización) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria / runtime | microduck |
| Tamano del repositorio | 0.0 GB (reportado por Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de capa recurrente o feed-forward). Lo que sí se documenta es el pipeline: entrenamiento por refuerzo en el entorno `Mjlab-Sprint2m-MicroDuck`, con `base: mjlab-microduck 0.1.0`, rama `master`, commit `6956d7675`, checkpoint `1000` y semilla `1`, iniciado el 3 de noviembre de 2026. `Mjlab` es un framework de simulación y entrenamiento de políticas robóticas basado en MuJoCo; el sufijo `Sprint2m` sugiere una tarea de locomoción orientada a velocidad de desplazamiento, aunque el detalle exacto de la función de recompensa no se publica.

La innovación práctica del paquete no está en el algoritmo sino en el empaquetado para despliegue: el normalizador de observaciones se integra en el grafo ONNX, eliminando una fuente habitual de errores entre simulación y realidad (el consumidor pasa observaciones crudas). El `manifest.json` sigue el esquema 2 del manifiesto de políticas de microduck, lo que permite que el daemon del robot cargue la política en un slot sin configuración manual. No se documentan técnicas de RLHF/DPO (no aplican), ni decodificación especulativa, ni atención lineal.

## Capacidades

- Generación de comandos de control articular para locomoción de un cuadrúpedo microduck a 50 Hz.
- Política "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, sin condición de parada interna.
- Consumo de observaciones en crudo de 61 dimensiones, con normalización embebida en el ONNX.
- Producción de 14 acciones de control por paso de inferencia.
- Integración con el daemon del robot mediante `robotctl policy load <slot> SccHy/microduck-sprint-gait3`.
- No soporta tool calling, function calling, razonamiento multi-paso, ni capacidades multilingües, de visión o de audio.

## Casos de uso

- Locomoción autónoma en el microduck: cargar la política en un slot del daemon y dejar que el robot se desplace de forma continua, aprovechando su naturaleza "perpetua" sin lógica de parada externa.
- Pruebas de simulación a realidad (sim2real): el normalizador embebido en `policy.onnx` reduce el desajuste entre las observaciones del simulador y las del hardware real, lo que facilita la validación en banco antes de desplegar.
- Banco de pruebas de políticas en el ecosistema microduck: sirve como referencia de política de marcha para comparar con otras políticas cargadas en slots distintos del mismo daemon.
- Docencia e investigación en RL robótico: el paquete incluye metadatos de entrenamiento (task_id, commit, checkpoint, semilla) que permiten reproducir o auditar el experimento con `mjlab-microduck 0.1.0`.
- Integración en pipelines de control de bajo nivel: al ser ONNX con entrada de 61 dimensiones y salida de 14 a 50 Hz, puede ejecutarse en el propio robot o en un host cercano con latencia determinista.
- Prototipado de marchas específicas: el identificador `sprint-gait3` sugiere una variante de marcha orientada a velocidad; útil para comparar variantes de marcha (gait1, gait2, gait3) en la misma plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio reporta 0.0 GB y no se documenta el tamaño del grafo ONNX. Por la dimensión de entrada (61) y salida (14), es previsible que el modelo sea de tamaño reducido y quepa en cualquier GPU consumer, pero no hay dato confirmado.
- GPU recomendadas: no disponible. Dado el reducido número de entradas y salidas, es plausible su ejecución en CPU o en hardware embebido del propio robot, pero no se confirma en la información.
- Cabe en GPU consumer: no confirmado; por dimensión de E/S es altamente probable, pero no se dispone de medición.
- Opciones de despliegue: runtime `microduck` (librería declarada) y ONNX Runtime para ejecución genérica del grafo `policy.onnx`; carga en robot mediante `robotctl policy load`.
- Latencia y throughput estimados: no disponibles. La frecuencia de control es de 50 Hz, lo que fija un presupuesto de 20 ms por paso de inferencia, pero no se publica la latencia real medida.

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables del mismo ecosistema (otras variantes de marcha del microduck, políticas de otros autores o políticas de locomoción para cuadrúpedos similares) en la información proporcionada. Los campos de comparación (parámetros, contexto, rendimiento, licencia) no son aplicables o no están disponibles.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-gait3 | no disponible | no aplica | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se publica licencia: no hay autorización explícita para uso comercial ni para redistribución; debe contactarse con el autor antes de cualquier uso en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.
- No se documentan métricas de rendimiento (velocidad alcanzada, estabilidad, tasa de caídas, robustez ante perturbaciones), por lo que no es posible evaluar su calidad frente a otras políticas.
- La topología de la red y el tamaño del modelo no se detallan; la estimación de recursos es especulativa.
- El identificador de tarea `Mjlab-Sprint2m-MicroDuck` sugiere una marcha orientada a velocidad, pero no se confirma el objetivo exacto ni las condiciones de entrenamiento (terreno, perturbaciones, dominio aleatorizado).
- Es una política específica para el hardware microduck; no es transferible a otras plataformas sin reentrenamiento.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de NLP ni usarse para tareas de texto, código o razonamiento.
- El normalizador está embebido en el ONNX; modificar el grafo o alimentar observaciones ya normalizadas producirá comportamientos incorrectos.
- La fecha de creación (2026-11-04) y la actualización (2026-11-04) son muy próximas; el paquete puede no haber pasado por revisión posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SccHy/microduck-sprint-gait3
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del daemon): no disponible como enlace directo en la información proporcionada
- Paper, blog o demo del modelo: no disponible
