# DenRakEiw/microduck-songkran-duck_6094

## Resumen

`DenRakEiw/microduck-songkran-duck_6094` es una política de control motriz (policy) entrenada por el usuario DenRakEiw para el robot cuadrúpedo de bajo coste Microduck, desarrollado por Pollen Robotics y comercializado por Hugging Face. No es un modelo de lenguaje: es una red neuronal que genera comandos de locomoción a 50 Hz a partir de observaciones proprioceptivas de 61 dimensiones y produce 14 acciones de control. Se publica en formato ONNX con la librería `microduck` y se carga directamente en el robot mediante el comando `robotctl policy load walk`.

El modelo ocupa el slot de marcha (`walk`) y se describe como una política «perpetua»: una vez cargada, ejecuta un patrón de locomoción de forma continua hasta que se detiene explícitamente. Según la model card, deriva de una red de carrera («Sock Heist») reentrenada con un envoltorio de ritmo fijo (0.65) y refinada mediante estrategias evolutivas en CPU para tolerar ruido de acción pequeño. El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta, y no dispone de licencia ni de idiomas declarados.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de robótica de refuerzo, no de un modelo fundacional. Su interés radica en documentar el ecosistema de políticas intercambiables del Microduck y en servir como ejemplo de flujo de entrenamiento (RL + estrategias evolutivas) sobre hardware de bajo coste, no en capacidades de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política de control motriz (reinforcement learning); topología interna no disponible |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | No disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Slot de política | `walk` |
| Libreria | `microduck` |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, tipo de activaciones ni si emplea memoria recurrente). Lo que sí se documenta es el proceso: la política parte de una red de carrera denominada «Sock Heist», reentrenada para congelarse bajo la mirada del «gigante» y frenar en su turno, y después reanudada con velocidad modulada por el giro de cabeza (checkpoint `hr4a`, paso 1700). Sobre esa base se aplicó un envoltorio de ritmo fijo con factor 0.65 y un pulido final de pesos mediante estrategias evolutivas ejecutadas en CPU, con selección de individuos que terminan la tarea bajo ruido de acción pequeño.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw-070`, commit `97e2b1fe2`. La model card menciona «energía solar» como fuente de alimentación del entrenamiento, un detalle anecdótico sin impacto técnico verificable. No se especifican número de tokens, episodios, composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO, algo esperable en un modelo de control y no de lenguaje. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto.

## Capacidades

- Locomoción cuadrúpeda continua: genera una marcha perpetua para el slot `walk` a 50 Hz hasta recibir una orden de parada.
- Control reactivo a partir de observaciones proprioceptivas de 61 dimensiones y emisión de 14 acciones de control.
- Robustez ante ruido de acción pequeño, consecuencia directa de la selección por estrategias evolutivas.
- Modulación de velocidad mediante el giro de cabeza, según la descripción del entrenamiento.
- Frenado y congelación en el turno, comportamientos heredados del reentrenamiento de la red de carrera.
- Integración con el daemon del robot mediante `robotctl` y el manifiesto de políticas schema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Demostración de locomoción en el Microduck: cargar la política con `sudo robotctl policy load walk DenRakEiw/microduck-songkran-duck_6094` para que el robot camine de forma continua en exhibiciones y ferias, aprovechando su naturaleza perpetua.
- Investigación en robótica de refuerzo: servir como punto de partida o línea base para comparar variantes del mismo autor (por ejemplo, `songkran-duck_7214`) en experimentos de ajuste fino con estrategias evolutivas.
- Docencia en control motriz: usar el par `policy.onnx` + `manifest.json` como ejemplo mínimo y reproducible de despliegue de una política RL en un robot real de bajo coste.
- Pruebas de robustez frente a ruido: evaluar en banco cómo se degrada la marcha al inyectar perturbaciones en las 14 acciones, dado que el modelo fue seleccionado explícitamente para tolerar ruido pequeño.
- Integración en pipelines de evaluación automatizada: el formato ONNX permite ejecutar la política en un simulador o en un host sin GPU para validar el manifiesto antes de desplegarla en el robot.
- Benchmarking interno de slots: comparar esta política `walk` con otras políticas del mismo slot para medir velocidad, estabilidad y consumo en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona de forma cualitativa que la política «gana a rojo 2 en tres horarios» y que se seleccionó por terminar bajo ruido de acción pequeño, pero no se aportan métricas numéricas, curvas de recompensa ni comparaciones cuantitativas verificables.

## Requisitos de hardware

- El modelo es una red de política de tamaño reducido en formato ONNX; el repositorio declara 0 GB, por lo que la huella de memoria es mínima y no se dispone de cifra exacta de VRAM.
- Inferencia en CPU: viable y probablemente suficiente para 50 Hz, dado el reducido tamaño del artefacto y que el propio autor usó CPU para las estrategias evolutivas.
- GPU recomendadas: no disponibles; no se requiere GPU dedicada para el despliegue típico en el robot.
- Cabe en cualquier GPU de consumo e incluso en hardware embebido del propio Microduck; no se especifican modelos concretos (RTX 4090, A100, H100) porque no son necesarios.
- Opciones de despliegue: `robotctl` con el daemon de microduck y runtime ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control objetivo de 50 Hz (20 ms por paso).

## Comparativa con modelos similares

| Modelo | Autor | Slot | Formato | Checkpoint | Licencia | Descargas |
|---|---|---|---|---|---|---|
| microduck-songkran-duck_6094 | DenRakEiw | walk | ONNX | hr4a, paso 1700 | no disponible | 0 |
| microduck-songkran-duck_7214 | DenRakEiw | walk | ONNX | hr2b-brake, paso 1575 | no disponible | no disponible |

El segundo modelo de la tabla es una variante del mismo autor construida sobre `songkran-duck_7199`, con otro checkpoint y otro esquema de frenado. No se dispone de datos de benchmarks que permitan comparar su rendimiento real. Fuera del ecosistema Microduck no se identifican alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no responde preguntas y no procesa imágenes ni audio.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- El repositorio declara 0 descargas y 0 likes, y el tamaño reportado es 0 GB; la trazabilidad y la reproducibilidad del artefacto no están garantizadas.
- No se documenta la topología de la red ni el volumen de entrenamiento, lo que dificulta auditar el comportamiento o estimar su generalización.
- La política está diseñada para un hardware concreto (Microduck, 61 observaciones, 14 acciones, 50 Hz); no es portable a otras plataformas sin reentrenamiento.
- El comportamiento descrito depende de un envoltorio de ritmo fijo (0.65) y de un normalizador embebido; alterar cualquiera de los dos puede degradar la marcha.
- Riesgo de sobreajuste a las condiciones de entrenamiento (suelo, carga, batería) no cuantificado; no hay datos sobre degradación fuera de distribución.
- La model card incluye afirmaciones cualitativas no verificables («gana a rojo 2 en tres horarios», «entrenado con energía solar») que no deben tomarse como métricas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck_6094
- Variante del mismo autor: https://huggingface.co/DenRakEiw/microduck-songkran-duck_7214
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `denrakeiw-070`, commit `97e2b1fe2`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
- Artículo sobre el lanzamiento del Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
