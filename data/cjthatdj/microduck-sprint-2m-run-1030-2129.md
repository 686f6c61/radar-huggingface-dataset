# cjthatdj/microduck-sprint-2m-run-1030-2129

## Resumen

`microduck-sprint-2m-run-1030-2129` es una política de aprendizaje por refuerzo entrenada por el usuario `cjthatdj` para el robot **microduck** de Pollen Robotics, disponible en Hugging Face. No se trata de un modelo de lenguaje, sino de una red neuronal en formato ONNX que genera señales de control (14 acciones) a partir de observaciones del robot (61 dimensiones) a una frecuencia de 50 Hz. Su tarea es concreta: la tarea `Mjlab-Sprint2m-MicroDuck`, es decir, correr/sprintar 2 metros, descrita por el autor como una política "perpetual" que se ejecuta hasta que se le ordena detenerse.

Su relevancia radica en el ecosistema abierto de robotics de Pollen Robotics: la política se despliega directamente en el robot con un comando (`robotctl policy load`), el normalizador de observaciones va integrado en el fichero ONNX y el entrenamiento es reproducible gracias a la publicación del commit, seed, dependencias (`uv.lock`) y comando exactos. Es un buen ejemplo de trazabilidad completa en RL para robótica, aunque el repositorio apenas tiene actividad (0 descargas, 0 likes) y carece de model card detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política de RL (topologia exacta no disponible), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con `manifest.json` (schema 2 del policy manifest de microduck) |

Datos adicionales del entrenamiento:

| Parametro | Valor |
|---|---|
| Tarea | `Mjlab-Sprint2m-MicroDuck` |
| Observaciones | 61 dimensiones |
| Acciones | 14 |
| Frecuencia de control | 50 Hz |
| Checkpoint | 1500 |
| Seed | 1 |
| Entornos paralelos | 4096 |
| Iteraciones maximas | 3000 |
| Base simulacion | mjlab-microduck 0.1.0 @ 1efd853be |

## Arquitectura y entrenamiento

La politica se entreno con aprendizaje por refuerzo en simulacion usando **mjlab** (infraestructura de simulacion basada en MuJoCo) sobre la tarea `Mjlab-Sprint2m-MicroDuck`, con 4096 entornos paralelos en GPU y un maximo de 3000 iteraciones; el checkpoint publicado es el 1500 con seed 1. El algoritmo de RL concreto (PPO, SAC, etc.) no se especifica en la model card, aunque el uso de miles de entornos paralelos en GPU es tipico de pipelines tipo PPO con Isaac/MJX o similares. La politica consume un vector de 61 observaciones y produce 14 acciones a 50 Hz, y el normalizador de observaciones va incrustado en el propio `policy.onnx`, de modo que el robot puede alimentar observaciones crudas sin preprocesado externo.

Un detalle destacable es la honestidad sobre reproducibilidad: el autor publica commit, `uv.lock`, comando y seed, pero advierte explicitamente que reentrenar produce una politica comparable, no pesos identicos, porque el RL en GPU no es reproducible bit a bit entre maquinas.

## Capacidades

- Politica de locomocion tipo "sprint" de 2 metros para el robot microduck (gait de carrera).
- Ejecucion perpetua: la politica mantiene el gait de forma continua hasta recibir orden de parada.
- Operacion a 50 Hz con observaciones crudas de 61 dimensiones (normalizador integrado en el ONNX).
- Carga directa en un slot de politica del robot mediante `robotctl policy load`.
- Compatibilidad con el schema 2 del policy manifest de microduck.
- No es un modelo de lenguaje: no tiene capacidades de texto, codigo, vision, tool calling ni razonamiento.

## Casos de uso

- **Despliegue directo en el robot microduck**: cargar la politica en un slot con `sudo robotctl policy load <slot> cjthatdj/microduck-sprint-2m-run-1030-2129` para que el robot corra de inmediato, sin configurar preprocesado de observaciones.
- **Investigacion en locomocion con RL**: usar la politica como baseline o punto de partida para experimentos de gaits, aprovechando que el entrenamiento es reproducible a nivel de codigo y seed.
- **Benchmarking de politicas**: comparar esta politica de sprint con otras del repositorio `microduck-challenges` bajo la misma tarea y semilla.
- **Fine-tuning o reentrenamiento**: clonar el repo, hacer checkout del commit `83b8cbdc8`, sincronizar dependencias con `uv` y relanzar el entrenamiento con distintos hiperparametros.
- **Validacion sim-to-real**: evaluar en hardware una politica entrenada en simulacion (mjlab/MuJoCo) con 4096 entornos paralelos, util para estudiar el gap simulacion-real.
- **Docencia y demostraciones**: ejemplo compacto y completo de un ciclo RL (entrenamiento, export ONNX, manifiesto, despliegue) para cursos de robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, distancia recorrida, velocidad ni tasas de caida del robot.

## Requisitos de hardware

- **Entrenamiento**: GPU con soporte para simulacion paralela masiva (4096 entornos); el autor no especifica el modelo de GPU usado, por lo que el requisito exacto no esta disponible. GPUs tipo NVIDIA con aceleracion CUDA son el supuesto habitual para mjlab/MuJoCo en GPU.
- **Inferencia en el robot**: la politica es un ONNX ligero (el repo completo ocupa 0.0 GB segun Hugging Face); se ejecuta en el hardware del microduck a 50 Hz, sin necesidad de GPU dedicada.
- **Inferencia fuera del robot**: cualquier runtime ONNX (onnxruntime en CPU) basta dadas las dimensiones reducidas (61 entradas, 14 salidas).
- **Despliegue**: via el daemon de microduck (`robotctl policy load`); no aplica vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; el ciclo de control especificado es de 50 Hz.

## Comparativa con modelos similares

| Aspecto | microduck-sprint-2m-run-1030-2129 | Otras politicas de microduck-challenges | Politicas RL genericas (p. ej. locomocion Isaac Lab) |
|---|---|---|---|
| Tipo | Politica ONNX para robot microduck | Politicas ONNX para microduck | Politicas para robots simulados variados |
| Tarea | Sprint de 2 m perpetuo | Varias (segun challenge) | Locomocion, manipulacion, etc. |
| Observaciones / acciones | 61 / 14 a 50 Hz | no disponible | variable |
| Formato | ONNX + manifest schema 2 | ONNX + manifest | variable (a menudo Torch/JIT) |
| Reproducibilidad | Commit + seed + uv.lock publicados | no disponible | variable |
| Licencia | no disponible | no disponible | variable |

No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- No hay licencia declarada en el repositorio, lo que introduce incertidumbre juridica sobre su uso, incluido el comercial; conviene consultar al autor antes de desplegarlo en produccion.
- La model card es minima: no describe arquitectura de la red, metricas de entrenamiento, robustez ni limites del gait (pendientes, superficies, cargas).
- El propio autor advierte que el reentrenamiento no es bit-reproducible entre maquinas: no se pueden esperar pesos identicos.
- La politica esta acotada a la tarea `Mjlab-Sprint2m-MicroDuck` con el robot microduck (61 obs / 14 acciones); no es transferible a otros robots ni tareas sin reentrenamiento.
- Al tratarse de una politica entrenada en simulacion, el gap sim-to-real puede provocar comportamientos inestables en hardware real; se recomienda probar primero en un entorno controlado.
- Repositorio con cero descargas y cero likes: no existe validacion comunitaria del modelo.
- Politica "perpetua": el robot seguira corriendo hasta recibir orden de parada, lo que exige mecanismos de seguridad (e-stop) en el hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cjthatdj/microduck-sprint-2m-run-1030-2129
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (microduck-challenges): https://github.com/pollen-robotics/microduck-challenges
