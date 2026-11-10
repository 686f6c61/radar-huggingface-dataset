# learner1119/posco_act_260820_left_c20

## Resumen

`posco_act_260820_left_c20` es un checkpoint de política de imitación basado en ACT (Action Chunking Transformer), el método de aprendizaje por imitación implementado en la librería LeRobot de Hugging Face. Lo publica el usuario `learner1119` como artefacto auxiliar del benchmark de pick-and-place en MuJoCo `posco_act_chunk20`, asociado al proyecto `2026_POSCO_VLA`. No es un modelo de lenguaje: es un controlador visuomotor entrenado para manipular un brazo robótico.

El checkpoint corresponde al brazo izquierdo del montaje (7 articulaciones más una mezcla de pinza o *gripper blend*), se entrenó durante 50.000 pasos sobre el dataset `dataset/260820_left` y utiliza un tamaño de *chunk* de 20 acciones, es decir, predice bloques de 20 acciones futuras por cada inferencia. El autor advierte explícitamente de que no debe confundirse con los checkpoints de la familia `posco_act_square_260822_left_*`, que se entrenaron con un dataset distinto.

Con 51.590.792 parámetros (unos 51,6 M) y un repositorio de 0,2 GB en formato safetensors, se trata de un modelo pequeño, pensado para inferencia en tiempo real sobre hardware modesto. Su relevancia es acotada: sirve como referencia reproducible dentro de un benchmark concreto de manipulación robótica, no como modelo de propósito general. La model card es mínima y no documenta licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), según la model card y la librería LeRobot |
| Parametros totales | 51.590.792 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; opera sobre observaciones y chunk de 20 acciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF ni cuantizadas documentadas) |
| Idiomas soportados | no disponible (modelo visuomotor, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Brazo / efector | brazo izquierdo, 7 articulaciones + gripper blend |
| Chunk size | 20 acciones |
| Pasos de entrenamiento | 50.000 |
| Dataset de entrenamiento | `dataset/260820_left` |
| Benchmark asociado | `posco_act_chunk20` (POSCO FFW-SH5 pick-and-place, MuJoCo) |
| Ruta de despliegue esperada | `2026_POSCO_VLA/ckpt/posco_act_chunk20/` |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es un transformer de política visuomotora diseñado para aprendizaje por imitación. La idea central es predecir secuencias de acciones (*action chunks*) en lugar de acciones individuales, lo que reduce el error de acumulación y mitiga el problema de las decisiones multimodales en demostraciones humanas. En este checkpoint el chunk es de 20 acciones, coherente con el nombre `c20`.

El entrenamiento se realizó durante 50.000 pasos sobre el dataset `dataset/260820_left`, que corresponde al brazo izquierdo del montaje POSCO FFW-SH5. La model card no detalla el número de episodios, la composición del dataset, la resolución de las cámaras ni si se aplicaron técnicas adicionales como aumento de datos o regularización temporal. Tampoco se documenta el uso de RLHF, DPO ni ningún ajuste posterior al entrenamiento supervisado. El checkpoint forma parte del benchmark `posco_act_chunk20` y está pensado para colocarse en la ruta `2026_POSCO_VLA/ckpt/posco_act_chunk20/` del repositorio del proyecto.

## Capacidades

- Control visuomotor de un brazo robótico de 7 articulaciones con pinza, mediante imitación de demostraciones.
- Predicción de bloques de 20 acciones por inferencia (action chunking), lo que permite ejecutar trayectorias cortas de forma coherente.
- Manipulación tipo pick-and-place en el entorno simulado MuJoCo del benchmark POSCO FFW-SH5.
- Especialización en el brazo izquierdo del montaje; no cubre el brazo derecho ni tareas fuera del dataset de entrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades de agente en el sentido de los LLM.
- No procesa lenguaje natural ni audio; su entrada es visual y proprioceptiva según el pipeline de LeRobot.
- Capacidades multilingües: no aplica.

## Casos de uso

- Reproducción del benchmark `posco_act_chunk20`: el checkpoint se coloca en `2026_POSCO_VLA/ckpt/posco_act_chunk20/` para replicar los resultados del brazo izquierdo en el entorno MuJoCo del proyecto POSCO.
- Comparación de políticas de imitación: sirve como línea base ACT frente a otros métodos (diffusion policy, VLA) sobre el mismo dataset `260820_left`.
- Validación de pipelines de LeRobot: al ser un checkpoint ACT estándar, permite comprobar la integración de carga de pesos, normalización de observaciones y ejecución de chunks de 20 acciones.
- Estudio de action chunking: el tamaño de chunk 20 permite analizar el compromiso entre reactividad y suavidad de trayectoria en tareas de pick-and-place.
- Simulación a escala reducida: con 51,6 M de parámetros y 0,2 GB de pesos, se puede ejecutar en estaciones de trabajo con una sola GPU consumer para experimentos de investigación.
- Docencia y prototipado en robótica: útil para demostrar el flujo completo de entrenamiento por imitación en simulación antes de trasladar la política a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente indica el benchmark al que pertenece el checkpoint (`posco_act_chunk20`), sin métricas de éxito, error de posición ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M de parámetros en safetensors (0,2 GB de pesos), la huella en memoria es del orden de unos pocos cientos de MB, incluyendo activaciones y buffers de observación.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente.
- Cabe en GPU consumer: previsiblemente sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no lo documenta.
- Opciones de despliegue: el pipeline natural es LeRobot con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo visuomotor de este tipo.
- Latencia y throughput: no disponibles. Dependen del entorno MuJoCo, de la frecuencia de control y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| posco_act_260820_left_c20 | 51,6 M | chunk 20 | Brazo izquierdo, pick-and-place MuJoCo | no disponible | Hugging Face (0 descargas) |
| posco_act_square_260822_left_* | no disponible | no disponible | Brazo izquierdo, dataset distinto | no disponible | Hugging Face (familia citada por el autor) |
| Otros checkpoints ACT de LeRobot | variable | variable | Manipulación diversa | variable según checkpoint | Hugging Face |

La comparativa con alternativas externas al proyecto no está disponible en la información proporcionada. El propio autor advierte de que `posco_act_square_260822_left_*` no es el mismo modelo, al haberse entrenado con otro dataset.

## Limitaciones y advertencias

- Modelo especializado: solo controla el brazo izquierdo de 7 articulaciones con pinza en el montaje POSCO FFW-SH5; no es reutilizable fuera de ese entorno sin reentrenamiento.
- Entrenado en simulación (MuJoCo): el rendimiento en hardware real no está documentado y probablemente requiera ajuste fino o *domain randomization*.
- Sin métricas publicadas: no hay tasas de éxito ni curvas de aprendizaje, por lo que no se puede evaluar su calidad objetivamente a partir de la información disponible.
- Licencia no especificada: no se puede asumir uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de sobreajuste al dataset `260820_left`: al no documentarse el volumen de demostraciones, no se puede descartar una generalización limitada.
- Confusión potencial con otros checkpoints del proyecto: el autor insiste en que no es el mismo modelo que `posco_act_square_260822_left_*`.
- Sin soporte de lenguaje, tool calling ni agentes: no debe evaluarse con los criterios habituales de un LLM.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner1119/posco_act_260820_left_c20
- LeRobot (librería de referencia para ACT): https://github.com/huggingface/lerobot
- Documentación de ACT en LeRobot: no disponible en la información proporcionada
- Repositorio `2026_POSCO_VLA`: no disponible en la información proporcionada
- Paper de ACT (Action Chunking with Transformers): no disponible en la información proporcionada
- Demo o blog del benchmark `posco_act_chunk20`: no disponible en la información proporcionada
