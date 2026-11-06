# JackDH/microduck-sock-heist-20261102-seed1

## Resumen

`sock-seed1-20261102` es una política de control para robots entrenada mediante aprendizaje por refuerzo, publicada por el usuario JackDH en Hugging Face bajo el identificador `JackDH/microduck-sock-heist-20261102-seed1`. No es un modelo de lenguaje: se trata de un checkpoint de política (policy) exportado a ONNX que se ejecuta sobre el robot educativo microduck de Pollen Robotics, un cuadrúpedo de pequeñas dimensiones. La política consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, y está diseñada para funcionar de forma perpetua (sin condición de terminación) hasta que el operador la detenga.

El modelo se entrenó localmente en una RTX 4090 con el framework mjlab (versión 0.1.0, commit `1efd853be`), sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, con 4096 entornos paralelos, 1000 iteraciones y semilla 1. El checkpoint seleccionado es el 999. La nomenclatura "sock-heist" sugiere una tarea de manipulación o locomoción orientada a robar un calcetín, típica de los entornos de simulación lúdicos usados en robótica de refuerzo.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible, no de un modelo de propósito general. Su interés radica en que documenta un flujo completo de entrenamiento RL en simulación (mjlab + MuJoCo), exportación a ONNX con normalizador embebido y despliegue en hardware real mediante el daemon `robotctl`. La licencia no está declarada y el repositorio ocupa 0.0 GB, lo que sugiere un artefacto de pequeño tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal exportada a ONNX); arquitectura interna no especificada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible (exportación ONNX; no se documentan variantes) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, tipo de capas, función de activación ni tamaño). Lo que sí se documenta es el pipeline de entrenamiento: la política se entrenó con mjlab 0.1.0 (commit `1efd853be`) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, definida en el repositorio `JackDanHollister/microduck-challenges` (rama `main`, commit `5cee942d8`). El entrenamiento usó 4096 entornos en paralelo, un máximo de 1000 iteraciones y semilla 1, ejecutado localmente en una RTX 4090. El checkpoint seleccionado es el 999.

El espacio de observación es de 61 dimensiones y el de acciones de 14, con una frecuencia de control de 50 Hz. La política es de tipo "perpetuo": no tiene condición de terminación y se ejecuta como un gait cargado en una ranura de política del robot. Un detalle técnico relevante es que el normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesar. El autor advierte que el entrenamiento RL en GPU no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no los mismos pesos.

## Capacidades

- Control locomotor o de manipulación del robot microduck mediante política de refuerzo, con 14 acciones de salida a 50 Hz.
- Ejecución perpetua: la política no termina por sí misma; corre hasta que el operador la detiene.
- Consumo de observaciones en crudo de 61 dimensiones, con normalización integrada en el grafo ONNX.
- Despliegue en hardware real mediante el daemon `robotctl` (`sudo robotctl policy load <slot> JackDH/microduck-sock-heist-20261102-seed1`).
- Compatibilidad con el manifiesto de políticas microduck schema 2.
- No soporta tool calling, agentes, razonamiento multi-paso, multilingüismo, visión ni audio: es una política de control específica de tarea.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como baseline reproducible para la tarea `Mjlab-SockHeist6m-MicroDuck`, permitiendo comparar nuevas políticas contra un checkpoint conocido con semilla y commit fijados.
- Despliegue en el robot microduck de Pollen Robotics: se carga en una ranura de política y se ejecuta como gait perpetuo para demostraciones de locomoción o manipulación lúdica.
- Docencia y talleres de robótica: el flujo `git clone` + `uv sync` + `uv run train` documentado en la model card permite reproducir el entrenamiento en una GPU de consumo (RTX 4090) en un entorno controlado.
- Pruebas de integración del daemon `robotctl`: el artefacto incluye `manifest.json` conforme al schema 2, útil para validar el pipeline de carga de políticas en el daemon.
- Benchmarking de simulación a realidad: al ser una política entrenada en simulación (mjlab/MuJoCo) y desplegable en hardware, permite medir la brecha sim-to-real en el microduck.
- Experimentación con exportación ONNX en robótica: el normalizador embebido en el grafo sirve como ejemplo de empaquetado autocontenido de una política para inferencia en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito de la tarea, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB, lo que sugiere un artefacto de tamaño muy reducido, pero no se documenta la cifra exacta.
- GPU recomendadas para entrenamiento: RTX 4090 (el autor entrenó localmente en una RTX 4090 con 4096 entornos paralelos).
- GPU para inferencia: no especificadas; por el tamaño del artefacto, es plausible que quepa en GPUs de consumo, pero no se confirma en la información disponible.
- Opciones de despliegue: runtime ONNX en el robot microduck a través del daemon `robotctl`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a una política de control).
- Latencia y throughput: no disponibles; la frecuencia de control es de 50 Hz (20 ms por paso), dato de la propia política.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas microduck ni checkpoints comparables de la misma tarea con los que establecer una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribución; hay que contactar con el autor antes de cualquier uso en producción.
- Es una política específica de tarea (`Mjlab-SockHeist6m-MicroDuck`) y de robot (microduck); no es transferible a otros cuerpos ni tareas sin reentrenamiento.
- Entrenada en simulación: el rendimiento en hardware real puede degradarse por la brecha sim-to-real; la model card no reporta métricas de éxito en el robot físico.
- No es bit-reproducible: la misma semilla y el mismo commit producen pesos distintos entre máquinas, lo que complica la auditoría exacta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje; esos apartados no aplican.
- El checkpoint seleccionado es el 999 de 1000 iteraciones máximas; no se documenta si se evaluó contra checkpoints intermedios.

## Enlaces

- Hugging Face: https://huggingface.co/JackDH/microduck-sock-heist-20261102-seed1
- Repositorio de entrenamiento: https://github.com/JackDanHollister/microduck-challenges
- Framework microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` en el repositorio del daemon (URL exacta no disponible)
