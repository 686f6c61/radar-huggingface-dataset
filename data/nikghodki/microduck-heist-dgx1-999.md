# nikghodki/microduck-heist-dgx1-999

## Resumen

`nikghodki/microduck-heist-dgx1-999` es una política de control motriz entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de robótica que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetado en formato ONNX y distribuido mediante el sistema de slots de políticas del daemon `robotctl`.

El modelo se entrenó con la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges`, usando el simulador mjlab (basado en MuJoCo) con 4096 entornos paralelos, 1000 iteraciones y semilla 1, partiendo de la base `mjlab-microduck 0.1.0`. El checkpoint publicado corresponde al paso 999. La política es de tipo "perpetuo": ejecuta una marcha continua hasta que se le indique lo contrario.

Es relevante como ejemplo de flujo de trabajo de RL para robótica de bajo coste con trazabilidad completa (commit, seed, `uv.lock`), aunque su adopción práctica es muy limitada: cero descargas, cero likes, repositorio de 0 GB y ausencia total de documentación sobre rendimiento, licencia o idiomas. La model card no incluye métricas de recompensa ni comparaciones con otras políticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control motriz entrenada por RL (red neuronal feed-forward, detalles no disponibles); formato ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se entrenó con el framework mjlab (simulación física basada en MuJoCo) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, definida en el repositorio `microduck-challenges` en el commit `5cee942d8`. El entrenamiento usó 4096 entornos paralelos, un máximo de 1000 iteraciones, semilla 1 y logging a TensorBoard, partiendo de la base `mjlab-microduck 0.1.0` (commit `1efd853be`). El checkpoint publicado es el 999.

El artefacto resultante es un archivo `policy.onnx` que incluye el normalizador de observaciones integrado: el robot debe alimentar observaciones en crudo (61 dimensiones) y la política produce 14 acciones a 50 Hz. El manifiesto `manifest.json` sigue el esquema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon. La model card advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica. No se detalla la topología de la red (capas, activaciones, número de parámetros), ni la función de recompensa, ni la composición del dataset de entrenamiento (que en RL procede de la simulación).

## Capacidades

- Control motriz de un robot cuadrúpedo microduck: mapea observaciones de 61 dimensiones a 14 acciones de control.
- Ejecución de una marcha perpetua a 50 Hz hasta que se detenga externamente.
- Normalización de observaciones integrada en el propio ONNX, lo que simplifica la integración en el robot.
- Carga mediante el daemon `robotctl` en un slot de política.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de visión, audio ni generación de texto.
- No dispone de modo "thinking" ni de mecanismos de planificación.

## Casos de uso

- Investigación en locomoción de bajo coste: usar la política como línea base reproducible para comparar nuevas marchas entrenadas con mjlab sobre el mismo robot microduck.
- Reproducción de experimentos de RL: el repositorio `microduck-challenges` con commit, `uv.lock` y semilla documentados permite reentrenar y comparar políticas con trazabilidad.
- Docencia en robótica con refuerzo: el flujo completo (simulación MuJoCo, 4096 entornos, exportación ONNX, carga en robot) sirve como ejemplo didáctico de extremo a extremo.
- Pruebas de integración del daemon `robotctl`: validar la carga de políticas desde Hugging Face en slots y el consumo de manifiestos schema 2.
- Benchmarking de sim-to-real: evaluar cómo se comporta una política entrenada en simulación al desplegarse en el microduck físico (sin datos publicados sobre el gap sim-to-real).
- Prototipado de marchas para tareas de manipulación o transporte (la tarea se llama "SockHeist", lo que sugiere interacción con objetos), siempre que el investigador valide el comportamiento en su propia plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensa media, tasa de éxito, estabilidad de la marcha ni comparación con otras políticas del repositorio `microduck-challenges`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; una política de control de este tipo suele ser de pocos megabytes, pero no se especifica el tamaño de `policy.onnx` (el repositorio ocupa 0.0 GB).
- GPU recomendadas: no disponible para inferencia; el entrenamiento se realizó en una DGX (según el nombre del modelo, `dgx1`) con 4096 entornos paralelos.
- ¿Cabe en GPU de consumo? No disponible; previsiblemente sí por el tamaño típico de una política de control, pero no hay confirmación.
- Opciones de despliegue: ONNX Runtime (formato del artefacto) y el daemon `robotctl` del ecosistema microduck; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: 50 Hz de frecuencia de control según la model card; no se publican latencias de inferencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas del repositorio `microduck-challenges` ni métricas que permitan comparar parámetros, contexto, rendimiento o licencia con alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Sin métricas de rendimiento publicadas: no hay evidencia de robustez, tasa de éxito ni estabilidad de la marcha.
- Sin datos sobre sesgos: al ser una política de control, el riesgo relevante es de comportamiento inseguro en el robot físico (caídas, movimientos bruscos), no de sesgo estadístico en texto.
- Riesgo de alucinación no aplica; el riesgo equivalente es que la política ejecute acciones no previstas fuera de la distribución de entrenamiento.
- Entrenamiento no bit-reproducible: la propia model card advierte que repetir el entrenamiento produce pesos distintos.
- Ámbito de uso restringido al robot microduck con observaciones de 61 dimensiones y 14 acciones; no es transferible a otras plataformas sin reentrenamiento.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de que la política haya sido probada en hardware real por terceros.
- Sin información sobre idiomas, contexto o cuantización porque no son magnitudes aplicables a este artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/nikghodki/microduck-heist-dgx1-999
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
