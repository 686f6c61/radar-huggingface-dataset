# RemiFabre/microduck-flamingo-cycle

## Resumen

El modelo `RemiFabre/microduck-flamingo-cycle` es una política de control entrenada mediante aprendizaje por refuerzo (RL) para el robot bípedo Microduck, un robot de 25 cm de altura con 15 motores, cámara, LiDAR y pico prensor, desarrollado por Pollen Robotics (adquirida por Hugging Face en abril de 2025). Esta política concreta permite al robot mantenerse sobre un solo pie, alternando entre la pierna izquierda y la derecha, y volver a la posición de dos pies bajo demanda. El modelo se distribuye en formato ONNX y está pensado para ejecutarse tanto en simulación (MuJoCo) como en el hardware real del robot.

La relevancia de este modelo radica en que ejemplifica el enfoque de Hugging Face de llevar el código abierto al ámbito de la robótica física: un robot asequible (399 dólares) con un stack completo de entrenamiento RL que cualquier desarrollador puede reproducir, modificar y desplegar. La política se exporta como un archivo ONNX de tamaño reducido (el repositorio ocupa 0.0 GB, lo que sugiere un modelo muy ligero) y se integra con el framework `microduck_rl` de Pollen Robotics. No se trata de un modelo de lenguaje ni de visión, sino de un controlador de bajo nivel que mapea observaciones del robot a comandos de actuadores a 50 Hz.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (tipo no especificado; exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control, no secuencial) |
| Tipos de cuantizacion | no disponible (formato ONNX estándar) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (policy.onnx) |

## Arquitectura y entrenamiento

La arquitectura interna de la red no se documenta en la model card. Se sabe que es una política que recibe un vector de observación de 61 valores en coma flotante (`obs[1,61] f32`) y produce un vector de acciones de 14 valores (`actions[1,14] f32`), con normalizador integrado y frecuencia de control de 50 Hz. El modelo se entrenó con aprendizaje por refuerzo en el entorno `Mjlab-FlamingoCycleHard-Flat-MicroDuck`, utilizando el repositorio `pollen-robotics/microduck_rl` en la rama `flamingo` (commit `0bf9897`, aún no fusionado). La ejecución de entrenamiento se identifica como `pollen-robotics/flamingo-cycle-r2-hard-20260829-0245`. No se especifican detalles sobre el algoritmo RL concreto (PPO, SAC, etc.), el número de episodios, ni la composición del dataset de entrenamiento. La exportación se realizó con `scripts/export.py` del repositorio de entrenamiento.

## Capacidades

- Mantenerse sobre un pie (pierna izquierda o derecha) de forma estable durante más de 10 segundos.
- Cambiar de lado en plena ejecución: el comando `side` se selecciona antes de levantar la bandera `flag`.
- Volver a la posición de dos pies (HOME) cuando se desactiva la bandera.
- Responder a empujes externos de hasta 0.15 m/s desde cualquier dirección; ante empujes más fuertes hacia el lado levantado, realiza un apoyo breve con el pie; hacia el lado de apoyo, da un paso.
- Interrumpible en cualquier momento: el robot puede bajar la pierna y volver a levantarla mientras la bandera siga activa.
- Ejecución en simulación (MuJoCo) y en el robot real mediante el daemon `robotd` y el script `control.py`.
- Soporte de comandos por teclado en simulación (tecla F para levantar/bajar, C para elegir lado, P para empujes aleatorios) y por socket en el robot real.

## Casos de uso

- Investigación en control de robots bípedos: permite estudiar estrategias de equilibrio dinámico y rechazo de perturbaciones en un hardware de bajo coste y totalmente reproducible.
- Desarrollo de políticas RL transferibles: sirve como punto de partida para entrenar nuevas habilidades (caminar, saltar, esquivar obstáculos) usando el mismo stack `microduck_rl`.
- Validación de algoritmos de RL en simulación: al ser un modelo ligero (ONNX), se puede integrar en pipelines de entrenamiento y evaluación sin necesidad de GPU.
- Demostraciones educativas de robótica y aprendizaje por refuerzo: el robot Microduck está diseñado para ser accesible a estudiantes y aficionados, y esta política muestra un comportamiento complejo (equilibrio monopodal) con un coste de hardware reducido.
- Pruebas de robustez ante perturbaciones: el modelo incluye límites documentados de empuje, lo que permite diseñar experimentos controlados de estabilidad.
- Integración en sistemas de control jerárquico: la política puede combinarse con un planificador de alto nivel (por ejemplo, un LLM que decida cuándo levantar una pierna) mediante el protocolo de comandos de 13 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) porque este modelo no es un modelo de lenguaje ni de razonamiento general. La model card documenta pruebas de robustez específicas del comportamiento:

- Empujes de hasta 0.15 m/s desde cualquier dirección: el robot mantiene el equilibrio.
- Empujes más fuertes hacia el lado levantado: se produce un apoyo breve (touch-down) sin caída.
- Empujes hacia el lado de apoyo: el robot da un paso para recuperar el equilibrio.
- Empujes hacia atrás de 0.18 m/s o más: el robot cae en 2 de 24 ensayos aleatorios (tasa de fallo ≈ 8.3 %).

Estos datos provienen de pruebas en simulación y no deben extrapolarse al hardware real sin verificación adicional.

## Requisitos de hardware

- Inferencia en simulación: se puede ejecutar en un portátil sin GPU, usando MuJoCo y el script `infer_policy.py` del repositorio `microduck_rl`. Se requiere Python 3.12 y `uv` para la gestión de dependencias.
- Inferencia en el robot real: el modelo se copia al robot (una placa Radxa) y se ejecuta mediante el daemon `robotd`. No se especifican requisitos de memoria, pero dado el tamaño del repositorio (0.0 GB) y el formato ONNX, la VRAM necesaria es despreciable (menos de 100 MB).
- No requiere GPU dedicada; cualquier CPU moderna es suficiente para la inferencia a 50 Hz.
- Opciones de despliegue: integración con el stack `microduck_rl` (scripts de inferencia), ejecución directa con ONNX Runtime, o mediante el daemon `robotd` en el robot.
- Latencia: no se proporcionan datos numéricos, pero la frecuencia de control de 50 Hz implica un presupuesto de 20 ms por ciclo, que se cumple en hardware de bajo coste.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de control para robots bípedos de bajo coste). El ecosistema de Microduck es relativamente nuevo y no hay alternativas públicas con especificaciones equivalentes. Se podría mencionar que otros robots bípedos de investigación (por ejemplo, el Unitree Go1 o el A1) tienen políticas RL propias, pero no son directamente comparables en coste ni en formato de distribución. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para el robot Microduck; no es transferible a otros robots sin reentrenamiento.
- La model card indica explícitamente "sim only, never run on hardware" para las pruebas de límites: los datos de robustez se obtuvieron en simulación y no garantizan el mismo comportamiento en el robot físico.
- Existe un riesgo de caída ante empujes hacia atrás de 0.18 m/s o más (tasa de fallo ≈ 8.3 % en simulación).
- No hay señal de "rendición": si la bandera `flag` permanece activa, el robot intenta volver a levantar la pierna tras un paso de recuperación, lo que puede provocar inestabilidad si el usuario no baja la bandera.
- El comando `side` debe elegirse antes de activar la bandera; cambiarlo durante la elevación puede producir comportamientos no deseados.
- La licencia Apache 2.0 permite uso comercial, pero el hardware Microduck es un producto de Pollen Robotics/Hugging Face; el uso del modelo en otros contextos requiere verificar la compatibilidad con la licencia del robot.
- No se documentan sesgos ni alucinaciones porque no es un modelo generativo de texto; sin embargo, la política puede presentar comportamientos imprevistos en condiciones fuera del rango de entrenamiento (por ejemplo, superficies irregulares o empujes extremos).

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/RemiFabre/microduck-flamingo-cycle
- Repositorio del robot Microduck (GitHub): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL (rama `flamingo`): https://github.com/pollen-robotics/microduck_rl (commit `0bf9897` en la rama `flamingo`)
- Documentación de compartición de políticas: https://github.com/pollen-robotics/microduck_rl/blob/main/docs/sharing-policies.md
- Página oficial de Microduck en Pollen Robotics: https://pollen-robotics.com/microduck/
- Artículo de Byteiota sobre el lanzamiento: https://byteiota.com/hugging-face-microduck-399-open-source-robot-with-full-rl-stack/
- Artículo de n8nlab: https://n8nlab.io/news/hugging-face-launches-microduck-robotics
- Artículo de explore.n1n.ai: https://explore.n1n.ai/blog/hugging-face-microduck-open-source-robot-reinforcement-learning-2026-08-27
