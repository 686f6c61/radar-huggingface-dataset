# kenpeter123/microduck_rl

## Resumen

Microduck RL no es un modelo de lenguaje, sino un entorno de entrenamiento de aprendizaje por refuerzo (RL) para el robot bípedo Microduck, de aproximadamente 800 gramos y 25 cm de altura. Desarrollado por el autor kenpeter123 y alojado en Hugging Face con el identificador kenpeter123/microduck_rl, el proyecto se basa en el repositorio de GitHub pollen-robotics/microduck_rl. Utiliza mjlab (MuJoCo Warp) y el algoritmo PPO para entrenar políticas de control a 50 Hz, que posteriormente se exportan a ONNX y se despliegan en el robot real mediante el runtime del proyecto pollen-robotics/microduck. El objetivo es resolver el problema de sim2real en robótica bípeda de bajo coste, incorporando el modelo de actuador BAM, randomización de dominio y simulación de backlash (juego mecánico). La relevancia actual radica en ofrecer una receta completa y reproducible para entrenar comportamientos complejos en robots pequeños con servos Dynamixel. En la información disponible no se especifican parámetros de red, arquitectura neuronal ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal de control (no especificada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (exportación de políticas entrenadas); no se especifica otro formato |

## Arquitectura y entrenamiento

El proyecto no es un modelo de lenguaje, sino un conjunto de entornos de entrenamiento RL. La arquitectura de la política no se detalla en la información disponible. El entrenamiento se realiza con PPO en MuJoCo Warp (mjlab) a 50 Hz, con 4096 entornos en paralelo como ejemplo. Se usa el modelo de actuador BAM M6 para Dynamixel XL330, que incluye ley de control de tensión, fuerza contraelectromotriz y fricción de Coulomb/Stribeck dependiente de la carga. Se aplica randomización de dominio por entorno sobre tensión de batería, caída de tensión bajo carga, retardo de comando y magnitud de fricción. Además, se modela el backlash de ±1° en cada uno de los 14 servos mediante articulaciones pasivas, y tanto las observaciones como el control leen a través del backlash. La exportación a ONNX permite desplegar la política en el robot real sin cambios en el runtime.

## Capacidades

No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso en el sentido de un LLM. Las capacidades se refieren al entorno de entrenamiento RL y a las políticas entrenadas:

- Entrenamiento de políticas de control para robot bípedo: caminar con comandos de velocidad y postura de cabeza, recuperación de caídas, levantarse desde distintas posiciones, sentarse/levantarse, tocar el suelo con la punta de la boca, patear una pelota de 70 mm y 15 g, voltereta hacia adelante, patinaje sobre ruedas (velocidad, swizzle, agacharse, pendientes, levantarse, girar).
- Soporte de variantes de terreno: plano y rugoso (Flat/Rough) según la tarea.
- Variantes con backlash: cada tarea principal tiene una versión con juego de engranajes de ±1° en los 14 servos.
- Exportación a ONNX para despliegue en el robot real.
- Soporte de múltiples políticas intercambiables en caliente detrás de un contrato de observación común de 61 dimensiones.
- Entrenamiento local con GPU CUDA o remoto en Hugging Face Jobs mediante `--hf-jobs`.
- Herramientas de visualización, reproducción y comparación sim2real (`play`, `infer_policy.py`, `--debug`, `--save-csv`, `--record`).

## Casos de uso

- Investigación en locomoción bípeda: el entorno permite entrenar y validar políticas de marcha, recuperación de caídas y trucos en un robot real de bajo coste, con un pipeline sim2real documentado.
- Desarrollo de controladores para robots pequeños con servos Dynamixel: el modelo de actuador BAM y la randomización de dominio permiten transferir políticas simuladas a hardware real.
- Prototipado rápido de comportamientos robóticos: gracias a la exportación ONNX y al runtime de pollen-robotics/microduck, se pueden probar nuevas conductas en el robot real sin recompilar el entorno.
- Benchmark de algoritmos RL en robótica: el repositorio ofrece tareas variadas (caminar, patinar, patear) que pueden usarse para comparar algoritmos de control, aunque no se publican métricas.
- Educación y demostraciones de sim2real: el proyecto documenta la receta completa, incluyendo backlash y modelo de actuador, lo que lo hace útil para enseñar transferencia sim-to-real.
- Integración en pipelines de despliegue de robots: las políticas entrenadas se exportan a ONNX y se ejecutan en el runtime, permitiendo hot-swapping entre políticas (caminar, recuperarse, trucos) en el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Entrenamiento: requiere GPU CUDA (MuJoCo Warp). Se menciona que con 4096 entornos se obtiene una marcha usable en aproximadamente 1-2 horas. No se especifica VRAM mínima.
- En sistemas ARM (DGX Spark/GB10, Jetson): la primera sincronización con `uv sync` descarga ~2 GB de ruedas CUDA; se recomienda exportar `UV_HTTP_TIMEOUT=600`.
- Inferencia: se puede ejecutar la política exportada en ONNX en CPU MuJoCo mediante `scripts/infer_policy.py`.
- Opciones de despliegue: entrenamiento local con `uv run train`, visualización con `uv run play`, exportación con `uv run scripts/export.py`, inferencia con `uv run scripts/infer_policy.py`. También se puede ejecutar en Hugging Face Jobs con `--hf-jobs`.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje; no aplican capacidades de generación de texto, razonamiento, código ni matemáticas.
- El repositorio de Hugging Face muestra 0 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que puede contener solo documentación o estar vacío.
- La licencia no está disponible, por lo que el uso comercial o la redistribución no están claros.
- No se publican métricas de rendimiento ni benchmarks, por lo que no se puede evaluar la calidad de las políticas entrenadas.
- La fecha de creación y actualización (2026-09-06) es inconsistente con el contexto actual; puede tratarse de un repositorio experimental o con errores de metadatos.
- El entrenamiento requiere conocimientos de MuJoCo, PPO y del entorno; no hay una guía detallada de instalación más allá del quickstart.
- El proyecto depende de repositorios externos (mjlab, BAM, onshape-to-robot) cuya disponibilidad y mantenimiento no están garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/kenpeter123/microduck_rl
- GitHub del proyecto: https://github.com/pollen-robotics/microduck_rl
- Repositorio Microduck: https://github.com/pollen-robotics/microduck
- BAM (actuator model): https://github.com/Rhoban/bam
- mjlab (MuJoCo Warp): https://github.com/mujocolab/mjlab
- onshape-to-robot: https://github.com/Rhoban/onshape
- Documentación de scripts HF: https://github.com/pollen-robotics/microduck_rl/blob/main/scripts/hf/README.md
