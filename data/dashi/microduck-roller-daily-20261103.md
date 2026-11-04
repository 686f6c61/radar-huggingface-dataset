# dashi/microduck-roller-daily-20261103

## Resumen

`dashi/microduck-roller-daily-20261103` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje: es una política neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, destinada a ser ejecutada sobre el hardware real del robot. El autor, `dashi`, la publica como reentrada diaria de su política previa `microduck-roller-remix-r900` (con una puntuación de 0,900), y la describe explícitamente como una política "perpetua" que se ejecuta de forma continua hasta que se le indique lo contrario.

El modelo se distribuye en formato ONNX (`policy.onnx`) con el normalizador de observaciones ya integrado en el grafo, de modo que el consumidor debe alimentar observaciones en bruto. Se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. La política ocupa el slot `walk` del robot, es decir, implementa una marcha sobre ruedas (rollers).

Es relevante en el contexto de la robótica open source de bajo coste y del aprendizaje por refuerzo aplicado a locomoción, porque demuestra un flujo de trabajo de reentrenamiento y refinamiento iterativo sobre un robot accesible, con un pipeline reproducible (repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se publican métricas de rendimiento ni detalles del dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política neuronal de aprendizaje por refuerzo (detalle de capas no disponible); exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (distribución en ONNX; normalizador integrado en el grafo) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimensiones de observación | 61 |
| Dimensiones de acción | 14 |
| Slot de política | `walk` (marcha sobre rollers) |
| Modelo base | `DenRakEiw/microduck-senate_duck_0904` (finetune) |
| Tamaño del repositorio | 0.0 GB (según HuggingFace) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones ni si emplea memoria recurrente). Lo que sí se especifica es que se trata de una política entrenada con aprendizaje por refuerzo, con observaciones de 61 dimensiones y 14 acciones, ejecutada a 50 Hz sobre el microduck en configuración de rollers. El normalizador de observaciones está embebido en el propio `policy.onnx`, lo que simplifica el despliegue: el consumidor no necesita replicar la normalización por separado.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a`. La model card indica que esta política es una "reentrada diaria" (daily re-entry) de `dashi/microduck-roller-remix-r900`, con puntuación 0,900, y que a su vez es un remix de `DenRakEiw/microduck-senate_duck_0904`. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Locomoción sobre rollers: genera comandos de marcha continua para el robot microduck en el slot `walk`.
- Política perpetua: se ejecuta de forma indefinida hasta que se le indique lo contrario, sin episodios acotados.
- Control a 50 Hz con 14 acciones y 61 observaciones por paso.
- Normalización de observaciones integrada en el grafo ONNX: acepta observaciones en bruto.
- Compatibilidad con el daemon de microduck mediante `manifest.json` (esquema 2).
- Carga en robot mediante el comando `robotctl policy load walk dashi/microduck-roller-daily-20261103`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión ni audio: es una política motora, no un modelo generativo.

## Casos de uso

- Locomoción continua en el robot microduck: cargar la política en el slot `walk` con `robotctl policy load walk ...` para que el robot se desplace sobre rollers de forma indefinida. Es adecuada porque está diseñada explícitamente como política perpetua a 50 Hz.
- Investigación en aprendizaje por refuerzo aplicado a robótica de bajo coste: usar la política como línea base o punto de partida para experimentos de refinamiento, dado que se publica como finetune de `microduck-senate_duck_0904` y con pipeline reproducible (`microduck_rl`, rama `roll-backward`).
- Despliegue en entornos simulados o de laboratorio con rollers: al estar en ONNX con normalizador integrado, puede integrarse en bucles de control que alimenten observaciones de 61 dimensiones y consuman 14 acciones.
- Comparación de políticas en el mismo slot: al ser una reentrada diaria de `microduck-roller-remix-r900` (0,900), permite evaluar si el reentrenamiento mejora o degrada la marcha frente a la versión anterior.
- Docencia y demostraciones de RL en robótica: el flujo `robotctl` + manifiesto facilita mostrar el ciclo completo de carga y ejecución de una política en un robot real.
- Reutilización como componente en pipelines de control jerárquico: la política de marcha puede combinarse con capas superiores de planificación que emitan consignas, siempre que se respete la interfaz de 61 observaciones y 14 acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una puntuación de 0,900 asociada a la política predecesora `dashi/microduck-roller-remix-r900`, sin especificar la métrica ni el protocolo de evaluación. No se deben inferir cifras de rendimiento para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB según HuggingFace, lo que sugiere un modelo muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Al ejecutarse a 50 Hz sobre un robot microduck, es probable que la inferencia se realice en la CPU del propio robot o en un equipo embebido, pero esto no se especifica en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el flujo documentado es `robotctl policy load walk dashi/microduck-roller-daily-20261103` sobre el daemon de microduck; el formato ONNX permite inferencia con ONNX Runtime, pero no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Slot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-roller-daily-20261103` | Política RL (ONNX) | 61 / 14 | 50 Hz | `walk` | no disponible | HuggingFace |
| `dashi/microduck-roller-remix-r900` | Política RL | no disponible | no disponible | no disponible | no disponible | HuggingFace (referenciado) |
| `DenRakEiw/microduck-senate_duck_0904` | Política RL (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos de rendimiento, parámetros ni contexto para establecer una comparación cuantitativa entre estas políticas. La comparativa se limita a la relación de linaje (finetune y remix) documentada en la model card.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts y no soporta tool calling ni agentes. Cualquier uso fuera del control motor del microduck es inadecuado.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: la ficha de HuggingFace no declara idiomas, coherente con que no es un modelo lingüístico.
- Sin métricas publicadas: no hay benchmarks ni protocolo de evaluación documentado para esta política concreta; la puntuación 0,900 corresponde a la política predecesora y su métrica no se especifica.
- Entrenada específicamente para rollers y para el slot `walk`: no se garantiza su funcionamiento en otras configuraciones del robot ni en otros slots.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- El tamaño del repositorio aparece como 0.0 GB, lo que puede indicar que los artefactos no están completamente subidos o que el modelo es extremadamente pequeño; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de desplegar.
- Riesgo de sobreajuste al entorno de entrenamiento (rama `roll-backward`): no se documenta la variabilidad de condiciones (superficies, cargas, perturbaciones) usada durante el entrenamiento.
- Sin información sobre sesgos: al no ser un modelo de datos, no aplican sesgos sociales, pero sí posibles sesgos de simulación a realidad (sim-to-real gap) no cuantificados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dashi/microduck-roller-daily-20261103
- Modelo base: https://huggingface.co/DenRakEiw/microduck-senate_duck_0904
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon; no se proporciona URL directa en la información disponible.
- Los resultados de búsqueda web proporcionados tratan sobre el caldo japonés *dashi* y no son relevantes para este modelo; se descartan.
