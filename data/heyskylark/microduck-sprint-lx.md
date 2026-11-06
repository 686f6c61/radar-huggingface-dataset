# heyskylark/microduck-sprint-lx

## Resumen

microduck-sprint-lx es una política de control para robots cuadrúpedos de la familia microduck, publicada en Hugging Face por el usuario heyskylark bajo el pipeline de robótica. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de una política de aprendizaje por refuerzo entrenada para producir una marcha (gait) perpetua en el robot microduck, desarrollado por Pollen Robotics. La política recibe una observación de 61 dimensiones y emite 14 acciones a una frecuencia de control de 50 Hz, y está empaquetada en formato ONNX para su despliegue directo en el robot mediante el daemon `robotctl`.

El modelo se enmarca en el ecosistema de entrenamiento `mjlab`, una infraestructura de RL basada en MuJoCo para el desarrollo de políticas robóticas. La política se entrena con 4096 entornos paralelos y hasta 3000 iteraciones, con semilla fija 1, lo que indica un flujo de trabajo reproducible a nivel de código y configuración, aunque no bit a bit en los pesos resultantes. El checkpoint publicado corresponde a la iteración 2900 del entrenamiento.

La relevancia de esta ficha es limitada en el contexto de modelos de IA generativa: no hay información sobre arquitectura de red, número de parámetros, capacidades lingüísticas ni benchmarks de razonamiento. Se trata de un artefacto de robótica de nicho, con cero descargas y cero likes en el momento de la consulta, lo que sugiere un uso interno o experimental por parte del autor. A continuación se detalla toda la información disponible, marcando explícitamente los datos no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (política de RL para control robótico; red neuronal no especificada) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (observación de 61 dimensiones, sin contexto textual) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales relevantes:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | Perpetua (se ejecuta hasta recibir orden de parada) |
| Librería | microduck |
| Pipeline | robotics |
| Tamaño del repositorio | 0.0 GB |
| Fecha de creación | 2026-11-02 |
| Fecha de actualización | 2026-11-02 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura de red neuronal de la política (número de capas, tipo de capas, función de activación, etc.). Se sabe que es una política de aprendizaje por refuerzo entrenada con `mjlab`, una infraestructura basada en el simulador MuJoCo, y que se ejecuta en el robot microduck con una observación de 61 dimensiones y 14 acciones a 50 Hz. El normalizador de observaciones está integrado dentro del archivo `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesamiento externo.

El entrenamiento se realizó con la tarea `Mjlab-Sprint2m-MicroDuck`, en el repositorio `heyskylark/microduck-challenges`, rama `main`, commit `789ffc516`, con semilla 1 y checkpoint 2900. La configuración usa 4096 entornos paralelos y hasta 3000 iteraciones del agente, con registro en TensorBoard bajo el nombre de ejecución `LX-both3000-s1`. La base del entorno es `mjlab-microduck 0.1.0` en el commit `1efd853be`. El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el proceso con el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idéntica. El comando de reproducción es `uv run train Mjlab-Sprint2m-MicroDuck --env.scene.num-envs 4096 --agent.max-iterations 3000 --agent.seed 1 --agent.logger tensorboard --agent.run-name LX-both3000-s1`.

No se dispone de información sobre la composición del dataset de entrenamiento (en RL no hay dataset en el sentido supervisado, sino un entorno de simulación), ni sobre técnicas de RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck: genera una marcha perpetua (gait) que se ejecuta de forma continua hasta que se le indique lo contrario.
- Política de RL entrenada en simulación (MuJoCo vía mjlab) y desplegada en el robot real mediante el daemon `robotctl`.
- Normalización de observaciones integrada en el ONNX: acepta observaciones en bruto de 61 dimensiones.
- Salida de 14 acciones a 50 Hz, adecuada para el bucle de control de bajo nivel del robot.
- Carga como slot de política mediante `sudo robotctl policy load <slot> heyskylark/microduck-sprint-lx`.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes ni multilingüismo.

## Casos de uso

- Locomoción continua en el robot microduck: la política se carga en un slot y produce una marcha perpetua, útil para demostraciones de movimiento continuo en ferias, laboratorios o aulas.
- Investigación en aprendizaje por refuerzo robótico: sirve como política de referencia o línea base para comparar nuevos entrenamientos en la tarea `Mjlab-Sprint2m-MicroDuck`.
- Reproducción de experimentos: el manifiesto y el comando de entrenamiento permiten recrear una política comparable con la misma configuración y semilla, lo que facilita la validación de pipelines de RL.
- Desarrollo de infraestructura de despliegue: el formato ONNX con normalizador integrado y el manifiesto schema 2 son un ejemplo práctico de empaquetado de políticas para el daemon `robotctl`.
- Pruebas de integración del ecosistema microduck: validar la carga de políticas externas en slots y el flujo de observación-acción a 50 Hz en el robot real.
- Docencia en robótica con refuerzo: el bajo coste computacional de una política de 61 entradas y 14 salidas y su despliegue sencillo lo hacen adecuado para prácticas de control locomotor.
- Benchmarking interno de políticas: comparar el rendimiento de esta marcha con otras políticas entrenadas en el mismo entorno para evaluar mejoras de velocidad o estabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de 61 entradas y 14 salidas en ONNX, el requisito es presumiblemente mínimo (del orden de kilobytes o pocos megabytes), pero no se confirma en la información.
- GPU recomendadas: no disponibles para inferencia; para el entrenamiento, el autor usa GPU (entrenamiento de RL con 4096 entornos paralelos), pero no se especifica el modelo.
- ¿Cabe en GPU de consumo? No disponible, aunque por el tamaño de la política es altamente probable que sí; no se confirma.
- Opciones de despliegue: ONNX Runtime en el robot microduck a través del daemon `robotctl`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; se conoce la frecuencia de control de 50 Hz (periodo de 20 ms), pero no se detalla la latencia de inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (políticas de RL para el robot microduck) ni se dispone de datos de rendimiento para establecer una comparación.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Modelo de nicho con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Entrenamiento no reproducible bit a bit: el autor advierte que repetir el entrenamiento produce una política comparable, no idéntica.
- Ausencia de benchmarks: no hay métricas publicadas de velocidad, estabilidad o robustez de la marcha.
- Dependencia del ecosistema microduck y del daemon `robotctl`: no es un modelo portable a otros robots sin adaptación.
- Sin información sobre sesgos, alucinación o limitaciones de idioma, ya que no es un modelo lingüístico.
- Posible sobreajuste al simulador: al entrenarse en MuJoCo, el rendimiento en el robot real puede diferir (sim-to-real gap), aunque el autor indica que se ejecuta en robot.
- Fecha de creación futura (2026-11-02) en los metadatos: conviene verificar la autenticidad y vigencia del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/heyskylark/microduck-sprint-lx
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `git@github.com:heyskylark/microduck-challenges.git` (rama `main`, commit `789ffc516`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
