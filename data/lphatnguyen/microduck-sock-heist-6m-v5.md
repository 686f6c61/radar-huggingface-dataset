# lphatnguyen/microduck-sock-heist-6m-v5

## Resumen

sock-heist-6m-v5 es una política de control motriz (locomoción) entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo lo publica el usuario lphatnguyen en Hugging Face y está empaquetado en formato ONNX para su ejecución directa sobre el robot, ocupando el slot de marcha (`walk`) del sistema de políticas del demonio `robotctl`.

El modelo no es un modelo de lenguaje ni un sistema generativo de propósito general: es un controlador reactivo que recibe observaciones de 61 dimensiones a 50 Hz y emite 14 acciones de actuación sobre las articulaciones del robot. Su naturaleza es la de una política «perpetua», es decir, se ejecuta de forma continua hasta que se le indique lo contrario, generando una marcha estable.

La relevancia es acotada pero concreta: se trata de un artefacto de robótica de bajo nivel, útil para quien trabaje con la plataforma microduck y quiera desplegar o comparar políticas de locomoción entrenadas con self-play. La información pública es muy escasa (repo de 0.0 GB, sin descargas ni likes, sin licencia declarada), por lo que muchos campos de esta ficha quedan como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (pesos en ONNX, presumiblemente FP32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de red de la política (número de capas, tipo de red —MLP, CNN, transformer— ni tamaño). Lo que sí se especifica es la interfaz: observación de 61 dimensiones, 14 acciones y frecuencia de control de 50 Hz. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesar.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `tug-of-war-selfplay`, commit `1ba8b7e4f`. El nombre de la rama sugiere un esquema de self-play tipo «tira y afloja», habitual en entrenamiento de locomoción por refuerzo, aunque no se especifican hiperparámetros, número de pasos de entrenamiento, función de recompensa ni currículo. El sufijo «6m» del nombre podría indicar 6 millones de pasos, pero no está confirmado en la información proporcionada.

## Capacidades

- Generación de marcha continua para el robot microduck en el slot `walk`, ejecutándose de forma perpetua hasta recibir una orden de parada.
- Control motor reactivo a partir de observaciones de 61 dimensiones (presumiblemente estado de articulaciones, IMU y consignas de velocidad, aunque la composición exacta no está documentada).
- Emisión de 14 acciones de control a 50 Hz.
- Integración con el ecosistema `robotctl` mediante carga directa por identificador de Hugging Face.
- Autocontención del preprocesado: el normalizador va embebido en el ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni procesamiento de lenguaje.

## Casos de uso

- Despliegue de locomoción en microduck: cargar la política con `sudo robotctl policy load walk lphatnguyen/microduck-sock-heist-6m-v5` para que el robot camine de forma continua en pruebas de hardware.
- Investigación en aprendizaje por refuerzo: servir como política de referencia o línea base frente a otras políticas entrenadas en `microduck_rl`, comparando estabilidad de marcha y robustez.
- Experimentos de self-play: al provenir de la rama `tug-of-war-selfplay`, es útil para reproducir o contrastar resultados de entrenamiento competitivo entre políticas.
- Docencia y prototipado en robótica de bajo coste: permite a estudiantes observar una política RL entrenada ejecutándose en un cuadrúpedo de código abierto sin necesidad de reentrenar.
- Evaluación de pipelines ONNX en robótica embebida: el modelo sirve para medir latencia de inferencia ONNX a 50 Hz en el hardware del microduck.
- Integración en el demonio `robotctl`: validar el esquema 2 del manifiesto de políticas (`docs/policy-manifest.md`) y el flujo de carga remota desde Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño que probablemente cabe en CPU.
- GPU recomendadas: no disponible; por la naturaleza del despliegue (a bordo del microduck), lo esperable es inferencia en CPU o en un SoC embebido, pero no está confirmado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el runtime `microduck` / `robotctl` con ONNX Runtime; no se documentan otras opciones (vLLM, llama.cpp, TGI no aplican).
- Latencia y throughput: se requiere inferencia a 50 Hz (20 ms por paso) para el control en tiempo real, pero no se publican medidas reales.

## Comparativa con modelos similares

| Modelo | Plataforma | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sock-heist-6m-v5 | microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otras políticas del slot `walk` en microduck | microduck | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre políticas comparables publicadas con especificaciones verificables en la información proporcionada.

## Limitaciones y advertencias

- Información pública mínima: sin descargas, sin likes, sin licencia declarada y con un model card muy escueto; la fiabilidad y reproducibilidad no están verificadas por terceros.
- Licencia no disponible: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Específico del hardware: solo funciona con el robot microduck y su stack (`robotctl`, runtime `microduck`); no es reutilizable en otras plataformas sin reentrenamiento.
- Sin documentación de la composición de la observación ni del espacio de acciones, lo que dificulta la depuración e integración fuera del flujo estándar.
- Riesgo de comportamiento inseguro en el mundo real: al ser una política perpetua sin mecanismos de parada documentados más allá de la orden externa, debe supervisarse en pruebas físicas.
- No apta para tareas de lenguaje, visión ni razonamiento; cualquier uso fuera del control motriz queda fuera de su ámbito.
- Sin datos de robustez ante perturbaciones, terrenos variables o fallos de sensores.

## Enlaces

- Hugging Face: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v5
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `tug-of-war-selfplay`, commit `1ba8b7e4f`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio; no se proporciona URL directa.
