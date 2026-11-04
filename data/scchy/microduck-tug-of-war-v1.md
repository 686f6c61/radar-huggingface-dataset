# SccHy/microduck-tug-of-war-v1

## Resumen

microduck-tug-of-war-v1 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: se trata de un controlador que genera comandos de actuación a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones, pensado para ser cargado directamente en el robot como una "marcha" o gait dentro de un slot de política del daemon de control.

El autor del repositorio es SccHy y la tarea de entrenamiento se identifica como `Mjlab-TugOfWar-MicroDuck`, entrenada con la infraestructura mjlab (versión base 0.1.0) sobre la rama `master` y el commit `6956d7675`, con semilla 1 y checkpoint 0. La política se distribuye en formato ONNX con el normalizador de observaciones integrado en el propio grafo `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar.

Su relevancia es acotada pero concreta: demuestra el flujo completo de entrenamiento y despliegue de políticas de refuerzo para un robot cuadrúpedo de bajo coste, con un manifiesto `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. El repositorio no contiene pesos en safetensors ni información sobre licencia, idiomas o benchmarks, y registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (distribución en ONNX; el autor no documenta cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` con esquema 2 del manifiesto de políticas de microduck |

Otros datos técnicos relevantes:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tarea de entrenamiento | `Mjlab-TugOfWar-MicroDuck` |
| Infraestructura base | mjlab-microduck 0.1.0 |
| Rama y commit | `master`, `6956d7675` |
| Checkpoint | 0 |
| Semilla | 1 |
| Inicio del entrenamiento | 2026-11-04T02:32:50Z |
| Libreria | microduck |
| Pipeline declarado | robotics |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal de la política: la model card solo indica que se exporta a ONNX y que el normalizador de observaciones está integrado en `policy.onnx`, por lo que el consumidor debe pasar observaciones en bruto. No se especifica si se trata de un perceptrón multicapa, una red recurrente o cualquier otra topología, ni el número de capas o parámetros.

El entrenamiento se realizó con mjlab (base `mjlab-microduck 0.1.0`) sobre la tarea `Mjlab-TugOfWar-MicroDuck`, en la rama `master` y el commit `6956d7675`, con semilla 1 y checkpoint 0, comenzando el 2026-11-04T02:32:50Z. No se documentan el número de pasos de entrenamiento, la composición del dataset (en aprendizaje por refuerzo, la distribución de episodios y recompensas), ni si se aplicaron técnicas de regularización, domain randomization o destilación. La política se describe como "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario, lo que encaja con un gait cíclico cargado en un slot de política.

## Capacidades

- Control locomotor del robot microduck: genera 14 acciones de actuación a partir de 61 observaciones a 50 Hz.
- Ejecución perpetua: la política corre de forma continua hasta que el daemon la detiene o la sustituye, adecuada como marcha o gait por defecto.
- Normalización integrada: `policy.onnx` incorpora el normalizador de observaciones, por lo que acepta observaciones en bruto sin preprocesado externo.
- Despliegue mediante el daemon de microduck: se carga en un slot de política con `robotctl policy load <slot> SccHy/microduck-tug-of-war-v1`.
- Compatibilidad con el manifiesto de políticas de microduck, esquema 2 (`docs/policy-manifest.md` en el repositorio del daemon).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni soporte multilingüe: es exclusivamente una política de control motor.

## Casos de uso

- Locomoción por defecto del microduck: cargar la política en un slot con `robotctl policy load` para que el robot mantenga una marcha continua durante sesiones de demostración o pruebas de hardware.
- Pruebas de integración del daemon de control: al seguir el esquema 2 del manifiesto, sirve para validar el flujo de carga de políticas, la gestión de slots y la sustitución en caliente de marchas.
- Investigación en aprendizaje por refuerzo para robótica: como referencia reproducible de un pipeline mjlab (tarea, semilla, commit y checkpoint documentados) para comparar variantes de entrenamiento.
- Desarrollo de políticas de "tug of war" o tracción: la tarea `Mjlab-TugOfWar-MicroDuck` apunta a comportamientos de empuje o arrastre, útil para experimentos de interacción física con el robot.
- Base para ajuste fino o reinicio de entrenamiento: el commit y la semilla permiten reproducir el entorno mjlab y partir de esta política para entrenar variantes con nuevas recompensas.
- Docencia y prototipado con hardware de bajo coste: al ser un robot de código abierto con política ONNX, permite montar prácticas de control locomotor sin depender de plataformas propietarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito, velocidad de marcha, estabilidad ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se documenta el número de parámetros de la red, aunque por la naturaleza del modelo (observación de 61 dimensiones, 14 acciones) es previsible que sea muy reducido.
- GPU recomendadas: no disponible. Al ejecutarse en el propio robot a 50 Hz, el cómputo de inferencia se realiza presumiblemente en la CPU del robot o en hardware embebido, no en GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para RTX 4090, A100, H100 ni similares.
- Opciones de despliegue: el despliegue previsto es el daemon de microduck mediante `robotctl policy load <slot> SccHy/microduck-tug-of-war-v1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la política está diseñada para operar a 50 Hz (periodo de 20 ms por ciclo de control); no se publican mediciones de latencia real ni de throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables de la misma categoría (control locomotor para cuadrúpedos) con parámetros, contexto o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- Sesgos conocidos: no documentados. Al ser una política entrenada en simulación (mjlab), es probable que presente una brecha sim-to-real no cuantificada, pero el autor no la reporta.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de comportamientos no deseados o inestables fuera de la distribución de observaciones de entrenamiento.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto ni lenguaje natural.
- Ausencia de métricas: no hay benchmarks, tasas de éxito ni curvas de recompensa publicadas, lo que impide evaluar su robustez antes de desplegarla en hardware físico.
- Documentación mínima: la model card no describe la arquitectura de la red, el número de parámetros ni el procedimiento de entrenamiento más allá de los metadatos de la tarea.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Advertencia de seguridad: cargar una política de control en un robot físico implica riesgos mecánicos; deben tomarse precauciones (espacio despejado, parada de emergencia) antes de ejecutarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SccHy/microduck-tug-of-war-v1
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (referenciado en la model card; no se proporciona URL directa)
