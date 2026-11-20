# dashi/microduck-roller-daily-20261119

## Resumen

`dashi/microduck-roller-daily-20261119` es una política de control robótico (no un modelo de lenguaje) publicada en Hugging Face por el usuario `dashi`. Se trata de un refinamiento (*finetune*) del modelo `DenRakEiw/microduck-senate_duck_0904`, orientado al robot cuadrúpedo de bajo coste microduck desarrollado por Pollen Robotics. La política está pensada para ejecutarse sobre ruedas (*rollers*) y ocupa el slot de marcha `walk` del sistema de control del robot.

El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, comportándose como una política perpetua: una vez cargada, ejecuta la marcha de forma continua hasta que se le indique lo contrario. El autor la describe como una "re-entrada diaria" de `dashi/microduck-roller-remix-r900`, con una puntuación de referencia de 0.900.

El interés de esta ficha es acotado: es un artefacto de investigación en aprendizaje por refuerzo aplicado a robótica, con un repositorio de 0.0 GB (lo que sugiere que los pesos no están efectivamente alojados o que el artefacto es mínimo), sin descargas ni *likes* en el momento de la consulta. No dispone de información pública sobre licencia, idiomas ni benchmarks de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; arquitectura de red no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (exportación ONNX) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal subyacente. Lo que sí se documenta es el pipeline de entrenamiento: el modelo se entrena con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`, mediante aprendizaje por refuerzo. La política resultante se exporta a ONNX con el normalizador de observaciones embebido en el propio grafo, de modo que el robot puede alimentarse con observaciones en bruto sin preprocesado externo.

El artefacto es un *finetune* de `DenRakEiw/microduck-senate_duck_0904` y se describe como una "re-entrada diaria" de `dashi/microduck-roller-remix-r900` (puntuación 0.900). No se especifican el número de tokens, la composición del dataset de entrenamiento, ni si se emplearon técnicas como RLHF o DPO (no aplicables en este dominio). La innovación destacable es operativa: una política perpetua que mantiene la marcha de forma indefinida en el slot `walk`, con normalización integrada y un manifiesto versionado (schema 2) para carga directa por el daemon del robot.

## Capacidades

- Control de marcha perpetuo sobre ruedas: ejecuta una marcha continua hasta recibir una orden de parada.
- Entrada de observaciones de 61 dimensiones y salida de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en `policy.onnx`, permitiendo alimentar observaciones en bruto.
- Carga directa mediante el daemon del robot (`robotctl policy load walk ...`).
- Compatibilidad con el esquema de manifiestos de política microduck (schema 2).
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, *tool calling* ni agentes.
- No dispone de capacidades multilingües (no es un modelo lingüístico).

## Casos de uso

- Locomoción autónoma del microduck sobre ruedas: cargar la política en el slot `walk` permite al robot desplazarse de forma continua sin intervención, adecuado por su naturaleza perpetua.
- Investigación en aprendizaje por refuerzo robótico: sirve como punto de partida (*baseline*) reproducible para experimentos de *finetune* sobre `DenRakEiw/microduck-senate_duck_0904`.
- Evaluación de políticas en entornos de bajo coste: al ejecutarse en hardware microduck, permite validar gaitas sobre ruedas sin requerir plataformas caras.
- Integración en pipelines de control con el daemon: el manifiesto schema 2 y la normalización embebida simplifican el despliegue en el robot mediante `robotctl`.
- Reproducción de experimentos de la rama `roll-backward`: útil para comparar variantes de entrenamiento a partir del commit documentado.
- Prototipado de comportamientos de marcha en laboratorio: la política perpetua facilita pruebas de duración prolongada de la gaita sin reinicios.
- Docencia en robótica y RL: ejemplo concreto de política exportada a ONNX con observaciones normalizadas internamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica citada es la puntuación de referencia 0.900 de `dashi/microduck-roller-remix-r900`, de la que este modelo es una re-entrada diaria, pero no se documenta cómo se mide ni sobre qué conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 0.0 GB y la arquitectura de red no está documentada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al tratarse de una política de control a 50 Hz exportada a ONNX, es plausible que se ejecute en CPU o en hardware embebido, pero no se confirma en la información proporcionada.
- Opciones de despliegue: daemon microduck mediante `robotctl policy load walk dashi/microduck-roller-daily-20261119`; runtime ONNX (ONNX Runtime) por el formato `policy.onnx`.
- Latencia y throughput estimados: la política opera a 50 Hz (periodo de 20 ms por paso), según la model card; no se documentan latencias medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261119` | Política RL robótica (ONNX) | no disponible | no disponible (obs. 61-D, 14 acciones, 50 Hz) | Puntuación de referencia 0.900 (heredada del remix r900) | no disponible | Hugging Face, 0 descargas |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL robótica (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `dashi/microduck-roller-remix-r900` | Política RL robótica (origen del remix) | no disponible | no disponible | 0.900 | no disponible | Hugging Face |

No se dispone de datos suficientes para comparar parámetros, contexto ni licencia de las alternativas; la comparación se limita al linaje documentado.

## Limitaciones y advertencias

- Artefacto de nicho: es una política de control para un robot concreto (microduck sobre ruedas), no un modelo de propósito general; no sirve para tareas de texto, visión o código.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; conviene contactar al autor antes de cualquier despliegue en producción.
- Repositorio de 0.0 GB: no está confirmado que los pesos estén efectivamente alojados; verificar la integridad de `policy.onnx` antes de cargarlo.
- Sin descargas ni *likes*: no hay evidencia de validación por parte de la comunidad.
- Sin benchmarks publicados: el rendimiento real sobre el robot no está verificado más allá de la puntuación 0.900 heredada del remix.
- Dependencia de hardware: requiere el robot microduck y el daemon con soporte de manifiestos schema 2; no es portable a otras plataformas sin adaptación.
- Riesgo de comportamiento no acotado: al ser una política perpetua, ejecuta la marcha hasta recibir una orden explícita de parada; deben preverse mecanismos de seguridad y parada de emergencia.
- Sin documentación de sesgos: no aplica en el sentido lingüístico, pero no se documentan comportamientos indeseados ni condiciones de fallo de la gaita.
- Información de entrenamiento incompleta: solo se documenta rama y commit; se desconoce la configuración de RL, recompensas y datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-roller-daily-20261119
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
