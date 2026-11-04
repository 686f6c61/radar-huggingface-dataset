# SccHy/microduck-roller-sprint-v1

## Resumen

`microduck-roller-sprint-v1` es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea concreta: generar una marcha perpetua ("sprint") sobre ruedas (rollers) que se ejecuta de forma continua hasta que el operador la detiene. Se distribuye como un archivo ONNX autocontenido que incluye el normalizador de observaciones, de modo que el robot puede alimentarlo con observaciones en bruto.

El modelo lo publica el usuario SccHy en HuggingFace y se enmarca en el ecosistema de entrenamiento `mjlab` (basado en MuJoCo), con la tarea identificada como `Mjlab-RollerSprint2m-MicroDuck`. La observación tiene 61 dimensiones y la acción 14 dimensiones, ejecutándose a 50 Hz. No se especifican parámetros de red, arquitectura interna ni datos de entrenamiento más allá del checkpoint y el commit.

Su relevancia es acotada pero clara: demuestra el flujo completo de entrenamiento en simulación y despliegue en hardware real para un robot de bajo coste, mediante un manifiesto de política versionado (`manifest.json`, esquema 2) y una única orden de carga en el daemon del robot. No es un modelo de lenguaje ni un modelo fundacional; es una política de control especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico (detalles internos no disponibles); exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Libreria / runtime | `microduck` |
| Tamano del repositorio | 0.0 GB (segun HuggingFace) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de la red neuronal en la información disponible. Lo que sí se documenta es el pipeline: la política se entrenó con aprendizaje por refuerzo en el entorno `mjlab` (basado en MuJoCo), con la tarea `Mjlab-RollerSprint2m-MicroDuck`, sobre la rama `master` en el commit `ce726e39b`, partiendo del checkpoint 2999, con semilla 1 y la base `mjlab-microduck 0.1.0`. El entrenamiento se inició el 2026-11-03T11:42:16Z.

El artefacto exportado es un ONNX que incorpora el normalizador de observaciones, una decisión de ingeniería relevante porque elimina la necesidad de replicar la normalización en el lado del robot y reduce errores de integración. La política es "perpetua": no tiene condición de terminación propia y se ejecuta hasta que se descarga o se sustituye en su slot. No se han publicado detalles sobre número de entornos paralelos, recompensas, composición del dataset ni uso de técnicas como domain randomization.

## Capacidades

- Generación de una marcha perpetua sobre ruedas para el robot microduck a 50 Hz.
- Consumo de observaciones en bruto de 61 dimensiones, con normalización integrada en el ONNX.
- Producción de acciones de 14 dimensiones compatibles con el esquema de control del microduck.
- Carga y ejecución mediante el daemon del robot (`robotctl policy load <slot> ...`).
- Integración con el sistema de manifiestos de política de microduck (esquema 2).
- Ejecución continua sin condición de parada interna; el operador controla el ciclo de vida.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Demostración de locomoción sobre ruedas en el microduck: cargar la política en un slot y observar la marcha continua para validar el hardware y el firmware del daemon.
- Pruebas de integración del pipeline simulación-a-realidad: usar esta política como referencia para verificar que el flujo `mjlab` → ONNX → `robotctl` funciona de extremo a extremo.
- Benchmark interno de control: comparar la estabilidad y el consumo de la marcha "sprint" frente a otras políticas cargadas en el mismo robot para elegir la más adecuada en cada superficie.
- Base para fine-tuning o currículo de entrenamiento: partir de este checkpoint para entrenar variantes (giros, velocidades, terrenos) reutilizando la tarea `Mjlab-RollerSprint2m-MicroDuck`.
- Docencia y prototipado en robótica de bajo coste: desplegar una política de RL real en un robot asequible sin necesidad de infraestructura de entrenamiento propia.
- Validación de despliegue en producción controlada: probar el ciclo de carga/descarga de políticas en el daemon antes de desplegar políticas con requisitos de seguridad más estrictos.
- Investigación en control continuo: usar la política como línea base perpetua para experimentos de interrupción, supervisión o conmutación entre políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio figura como 0.0 GB, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Por el tipo de carga (política de 61→14 a 50 Hz) es probable que la inferencia en CPU sea suficiente, pero no se documenta.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos de requisitos.
- Opciones de despliegue: runtime `microduck` con ONNX Runtime (implícito por el formato `policy.onnx`); carga mediante `robotctl policy load <slot> SccHy/microduck-roller-sprint-v1`.
- Latencia y throughput: no disponibles; la frecuencia de control objetivo es 50 Hz (periodo de 20 ms), pero no se publican mediciones reales.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-roller-sprint-v1 | Política RL sobre ruedas | 61 / 14 | 50 Hz | no disponible | HuggingFace (SccHy) |
| Otras políticas microduck | Políticas RL para el mismo robot | no disponible | no disponible | no disponible | no disponible en la información |
| Políticas de locomotion para cuadrúpedos comerciales | Políticas RL propietarias | no disponible | no disponible | propietaria | no disponible |

No se dispone de información sobre modelos comparables publicados con especificaciones verificables; la comparativa queda limitada a la categoría funcional.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; contactar con el autor antes de cualquier despliegue en producción.
- Modelo card muy escueta: no hay información sobre arquitectura, número de parámetros, datos de entrenamiento ni evaluación de robustez.
- Política perpetua sin condición de parada interna: requiere supervisión externa y mecanismos de seguridad en el robot para evitar ejecuciones indefinidas no deseadas.
- Entrenada específicamente para desplazarse sobre rollers; no se garantiza su comportamiento en otras configuraciones de hardware o superficies.
- Sin datos de domain randomization ni de evaluación simulación-a-realidad: el riesgo de degradación en el robot físico es desconocido.
- Sin información sobre sesgos (no aplica en el sentido de lenguaje, pero sí en cuanto a condiciones de entrenamiento no documentadas).
- Riesgo de alucinación no aplica; el riesgo relevante es de comportamiento inseguro o inestable en el control motriz.
- Sin soporte multilingüe ni de texto: no es un modelo de lenguaje.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema muy incipiente, sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/SccHy/microduck-roller-sprint-v1
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de política (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon de microduck
- Entorno de entrenamiento mjlab: no disponible enlace directo en la información proporcionada
