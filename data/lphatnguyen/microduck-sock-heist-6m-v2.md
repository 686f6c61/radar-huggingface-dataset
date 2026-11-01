# lphatnguyen/microduck-sock-heist-6m-v2

## Resumen

`sock-heist-6m-v2` es una política de control robótico entrenada mediante aprendizaje por refuerzo, publicada por el usuario `lphatnguyen` en HuggingFace. El modelo está diseñado específicamente para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, y se distribuye como un archivo ONNX que se carga directamente en el daemon de control del robot mediante el comando `robotctl policy load`.

La política es de tipo "perpetuo": ejecuta una marcha (gait) de forma continua hasta que se le indique lo contrario, consumiendo observaciones de 61 dimensiones y produciendo 14 acciones a una frecuencia de control de 50 Hz. El entrenamiento se realizó con el framework mjlab (basado en MuJoCo) sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, con 4096 entornos paralelos y semilla 2, alcanzando el checkpoint 3800.

El modelo es relevante como ejemplo de flujo de trabajo completo de RL para robótica: entrenamiento reproducible documentado, exportación a ONNX con normalizador de observaciones embebido, y despliegue en hardware real mediante un manifiesto de política versionado. No obstante, se trata de un artefacto muy específico para un robot concreto, sin datos publicados de benchmarks ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; arquitectura de red no especificada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control reactiva, sin contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red neuronal (capas, dimensiones ocultas ni tipo de red). Lo que sí se especifica es la interfaz del entorno: observaciones de 61 dimensiones, 14 acciones y frecuencia de control de 50 Hz, sobre el robot microduck. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto sin preprocesado adicional.

El entrenamiento se realizó con mjlab (versión `mjlab-microduck 0.1.0`, commit `1efd853be`) sobre el repositorio `microduck-challenges`, rama `sock-heist-training`, commit `fb3c11f14`. Se usaron 4096 entornos paralelos, un máximo de 600 iteraciones del agente y semilla 2, con reanudación desde el checkpoint `model_3500.pt` de una ejecución previa (`2026-10-31_12-56-15_safe3`). El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el proceso con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no idéntica. No se documentan datos sobre recompensas, composición del dataset (generado por simulación), ni uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante una política de marcha perpetua.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones a 50 Hz.
- Normalización de observaciones integrada en el propio grafo ONNX.
- Carga en hardware real mediante `robotctl policy load <slot> <repo>`.
- Ejecución continua hasta recibir una orden de parada o sustitución de política.
- Compatibilidad con el sistema de slots de políticas del daemon microduck y su esquema de manifiesto versión 2.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente una política de control motor.

## Casos de uso

- **Investigación en locomoción de cuadrúpedos**: usar la política como línea base reproducible para comparar nuevas marchas entrenadas con mjlab sobre el mismo robot y tarea.
- **Despliegue en el robot microduck físico**: cargar la política en un slot del daemon con `robotctl policy load` para que el robot ejecute la marcha de forma continua en demostraciones o pruebas de laboratorio.
- **Docencia en robótica y RL**: el flujo documentado (clonar repo, `uv sync`, `uv run train` con parámetros explícitos) sirve como ejemplo completo de entrenamiento sim-a-real con MuJoCo y exportación a ONNX.
- **Validación de pipelines de despliegue**: probar la integración del manifiesto schema 2 y la carga de políticas ONNX con normalizador embebido en el daemon de microduck.
- **Punto de partida para fine-tuning o currículos**: reanudar el entrenamiento desde el checkpoint documentado (`model_3500.pt`) o desde esta política para tareas derivadas de la misma familia (`microduck-challenges`).
- **Pruebas de robustez en simulación**: evaluar la política en el entorno `Mjlab-SockHeist6m-MicroDuck` con distintas semillas y configuraciones de escena para medir varianza de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Inferencia**: al ser una política de control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, la carga computacional es mínima; el archivo ONNX cabe holgadamente en cualquier GPU consumer e incluso podría ejecutarse en CPU. No se especifica el tamaño exacto del modelo (el repositorio ocupa 0.0 GB según HuggingFace, lo que sugiere un archivo muy pequeño).
- **GPU recomendadas para inferencia**: no disponible en la model card; por la naturaleza del modelo, cualquier GPU moderna o CPU es suficiente.
- **Entrenamiento**: el autor usó `--gpu-ids '[1]'` con 4096 entornos paralelos, lo que implica al menos una GPU de datacenter (A100/H100 o similar); no se especifica el modelo exacto.
- **Opciones de despliegue**: ONNX Runtime a través del daemon `robotctl` de microduck; no se documentan otras opciones (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo).
- **Latencia y throughput**: no disponibles; el requisito funcional es sostener 50 Hz de frecuencia de control.

## Comparativa con modelos similares

| Modelo | Tipo | Robot objetivo | Formato | Licencia | Documentación de entrenamiento |
|---|---|---|---|---|---|
| sock-heist-6m-v2 | Política RL perpetua | microduck (61 obs / 14 act / 50 Hz) | ONNX + manifest | no disponible | Sí (repo, commit, seed, checkpoint) |
| Otras políticas en `microduck-challenges` | Políticas RL para tareas específicas | microduck | ONNX | según repo | Parcial (depende de cada entrada) |
| Políticas de locomoción para cuadrúpedos comerciales (p. ej. Unitree, Boston Dynamics) | Políticas propietarias | Hardware propietario | no público | propietaria | No pública |

No se dispone de información suficiente para comparar métricas de rendimiento con alternativas; la comparación se limita a aspectos de disponibilidad y formato.

## Limitaciones y advertencias

- **Especificidad de hardware**: la política está entrenada exclusivamente para el robot microduck; no es transferible a otros robots sin reentrenamiento.
- **Sin licencia declarada**: la ausencia de licencia impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- **Sin benchmarks publicados**: no hay métricas de robustez, tasa de éxito ni comparación con otras políticas, lo que dificulta evaluar su calidad objetiva.
- **Reproducibilidad limitada**: el propio autor advierte que el entrenamiento no es bit-reproducible; los pesos exactos no pueden regenerarse de forma determinista.
- **Modelo de control, no generativo**: no tiene capacidades de lenguaje, razonamiento ni visión; no debe evaluarse con métricas de LLM.
- **Riesgo en hardware real**: al ser una política de RL sin documentación de seguridad, su despliegue en un robot físico debe hacerse en entornos controlados y con supervisión.
- **Información incompleta**: faltan datos sobre arquitectura de red, número de parámetros, composición del entrenamiento y condiciones de evaluación.

## Enlaces

- HuggingFace: https://huggingface.co/lphatnguyen/microduck-sock-heist-6m-v2
- Repositorio de desafíos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges.git (rama `sock-heist-training`, commit `fb3c11f14`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
