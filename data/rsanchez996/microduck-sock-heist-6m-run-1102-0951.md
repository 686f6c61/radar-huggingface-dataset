# RSanchez996/microduck-sock-heist-6m-run-1102-0951

## Resumen

`microduck-sock-heist-6m-run-1102-0951` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es una política de locomoción perpetua que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetada como un grafo ONNX y distribuida a través del formato de manifiesto de políticas del daemon `robotctl`. Lo publica el usuario RSanchez996 como artefacto de un experimento concreto de entrenamiento (run `1102-0951`), no como un modelo generalista.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación reproducible, no de un modelo listo para producción ni de propósito general. Su interés técnico radica en que documenta de forma completa la cadena de entrenamiento (repositorio, commit, semilla, checkpoint, comando exacto) con un simulador concreto (`mjlab-microduck 0.1.0`), lo que permite a otros investigadores reproducir el proceso y obtener políticas comparables, aunque no idénticas, dado que el entrenamiento con RL sobre GPU no es bit-reproducible.

El modelo se entrenó sobre la tarea `Mjlab-SockHeist6m-MicroDuck` durante 15 000 iteraciones máximas con 4096 entornos paralelos, partiendo del checkpoint 5000 y con semilla 22. La model card indica explícitamente una modificación de comportamiento: "update velocity, no attention to the head", es decir, una política de marcha que prioriza el seguimiento de velocidad y desatiende el control de la cabeza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de RL para control robótico, exportada como grafo ONNX (arquitectura de red no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx`) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 de manifiesto de políticas microduck |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |
| Libreria | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card no describe la topología interna de la red neuronal (número de capas, anchura, tipo de activación ni si se trata de un MLP o de una red recurrente). Lo que sí documenta con precisión es el pipeline de entrenamiento: la política se entrenó con el simulador `mjlab-microduck 0.1.0` en el commit `1efd853be`, sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, definida en el repositorio `https://github.com/RSanchez996/microduck-challenges.git` en la rama `main` y commit `2b3d1180f`. El entrenamiento arrancó el 2026-11-02T08:57:23Z, con semilla 22, 4096 entornos paralelos y un máximo de 15 000 iteraciones, y el checkpoint publicado corresponde a la iteración 5000.

Un detalle técnico relevante es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesar. El artefacto se distribuye junto con `manifest.json`, que sigue el esquema 2 del manifiesto de políticas microduck descrito en `docs/policy-manifest.md` del repositorio del daemon. La política es de tipo perpetuo: una marcha cargada en una ranura de política que se ejecuta de forma continua hasta que se le indique lo contrario. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas, por lo que repetir el comando con la misma semilla produce una política comparable pero no idéntica.

## Capacidades

- Locomoción continua del robot microduck mediante una política de marcha perpetua a 50 Hz.
- Seguimiento de comandos de velocidad (la model card menciona "update velocity"), con desatención explícita del control de la cabeza.
- Consumo de observaciones en bruto de 61 dimensiones gracias al normalizador embebido en el grafo ONNX.
- Emisión de 14 acciones de control compatibles con el robot microduck.
- Carga e integración en el daemon mediante `robotctl policy load <slot> <repo>`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.
- No soporta visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación en aprendizaje por refuerzo para robótica: sirve como checkpoint de referencia reproducible de la tarea `Mjlab-SockHeist6m-MicroDuck`, permitiendo comparar curvas de entrenamiento y políticas resultantes con la misma configuración de simulación.
- Reproducción de experimentos: el comando documentado (`uv run train ... --agent.seed 22 --agent.run-name run-1102-0951`) permite regenerar una política equivalente en otra máquina para validar la estabilidad del pipeline.
- Desarrollo de pipelines de políticas en microduck: útil para probar el flujo de carga de políticas en ranuras del daemon `robotctl` y validar el manifiesto de esquema 2 antes de desplegar políticas propias.
- Benchmarking de simuladores: al fijar versión del simulador, commit y semilla, el artefacto permite medir la variabilidad de resultados entre entornos de ejecución y GPUs distintas.
- Demostraciones de locomoción en robot de bajo coste: la política puede cargarse en un microduck físico para exhibir una marcha perpetua en entornos de divulgación o docencia.
- Base para fine-tuning o continuación de entrenamiento: el checkpoint 5000 puede reutilizarse como punto de partida para tareas derivadas que requieran control de cabeza o seguimiento de velocidad más fino.
- Validación de integración ONNX en robótica embebida: permite comprobar el rendimiento de inferencia en el hardware objetivo del microduck con un grafo que ya incluye la normalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, velocidad de seguimiento, estabilidad ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,0 GB, lo que sugiere un grafo ONNX muy ligero, pero no se publica el número de parámetros ni el tamaño exacto del fichero.
- GPU recomendadas: no disponible. Al tratarse de una política de 61 entradas y 14 salidas a 50 Hz, es plausible que se ejecute en CPU o en hardware embebido, pero la model card no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos que permitan afirmar que quepa o no en una RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: el despliegue previsto es mediante el daemon `robotctl` del ecosistema microduck, con el comando `sudo robotctl policy load <slot> RSanchez996/microduck-sock-heist-6m-run-1102-0951`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso), que impone un límite superior de latencia de inferencia para cumplir el ciclo de control.
- Entrenamiento: la receta documentada emplea 4096 entornos paralelos y hasta 15 000 iteraciones, lo que implica requisitos de GPU no especificados en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-run-1102-0951 | Política RL para microduck (ONNX) | 61 / 14 | 50 Hz | no disponible | HuggingFace (0 descargas, 0 likes) |
| Otras políticas microduck | Políticas RL para el mismo robot | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas de locomoción para cuadrúpedos comerciales (p. ej. Unitree, ANYmal) | Políticas RL propietarias o de investigación | variable | variable | habitualmente no comercial | no disponibles como comparación directa |

No se dispone de información sobre políticas comparables publicadas para el mismo robot ni sobre modelos de la misma categoría con métricas equiparables. La comparación cuantitativa no es posible con los datos proporcionados.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue productivo.
- El modelo es un checkpoint de un experimento concreto (run `1102-0951`, semilla 22, checkpoint 5000), no una versión validada ni una release estable.
- El entrenamiento no es bit-reproducible: repetir la receta produce pesos distintos, por lo que la reproducibilidad es estadística, no exacta.
- La política desatiende explícitamente el control de la cabeza ("no attention to the head"), lo que limita su uso en tareas que requieran orientación cefálica.
- No se publican métricas de rendimiento, tasas de éxito ni análisis de robustez, por lo que se desconoce su comportamiento fuera del simulador de entrenamiento.
- No hay evidencia de transferencia sim-to-real documentada; el uso en un robot físico conlleva riesgo de comportamiento inestable.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad.
- Al ser una política perpetua, requiere un mecanismo externo de parada; un fallo en el daemon o en el ciclo de control puede dejar al robot ejecutando la marcha de forma indefinida.
- No aplica sesgo lingüístico ni riesgo de alucinación en el sentido de los modelos de lenguaje, pero sí existe riesgo de comportamiento fuera de distribución ante observaciones no vistas durante el entrenamiento.
- La dependencia de una versión concreta del simulador (`mjlab-microduck 0.1.0 @ 1efd853be`) y de un `uv.lock` concreto puede dificultar la reproducción si esas dependencias dejan de estar disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RSanchez996/microduck-sock-heist-6m-run-1102-0951
- Repositorio de retos y entrenamiento: https://github.com/RSanchez996/microduck-challenges.git (commit `2b3d1180f`)
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (esquema 2): `docs/policy-manifest.md` en el repositorio del daemon microduck (ruta citada en la model card; URL completa no disponible)
- Simulador base: `mjlab-microduck 0.1.0` en el commit `1efd853be` (URL no disponible)
