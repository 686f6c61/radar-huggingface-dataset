# Faless/harvest_apples_xvla_v2_bs80_6ep_cs40

## Resumen

El modelo `Faless/harvest_apples_xvla_v2_bs80_6ep_cs40` es una política robótica entrenada con la librería LeRobot de Hugging Face, publicada por el usuario Faless. Se trata de un modelo de tipo XVLA (una variante de Vision-Language-Action orientada a control robótico) que aprende a ejecutar la tarea de recogida de manzanas sobre el robot Agilex Piper en simulación, a partir del dataset `Faless/harvest_apples_with_agilex_piper_sim`. No es un modelo de lenguaje generalista: su función es mapear observaciones visuales y el estado del robot a acciones de control de bajo nivel.

Con 879.738.545 parámetros (unos 880 millones) y un repositorio de 3,5 GB, el modelo se distribuye en formato safetensors y se integra en el ecosistema LeRobot para entrenamiento, evaluación e inferencia. El nombre del checkpoint sugiere un entrenamiento con tamaño de batch 80, 6 épocas y chunk size 40, parámetros habituales en políticas de imitación tipo ACT/XVLA.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline de aprendizaje por imitación para manipulación robótica en simulación, con licencia Apache 2.0, lo que facilita su reutilización y adaptación a otros entornos o tareas dentro de la comunidad LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XVLA (política Vision-Language-Action sobre LeRobot); detalles internos no disponibles |
| Parametros totales | 879.738.545 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política de robótica del tipo XVLA integrada en LeRobot. Las políticas de esta familia combinan típicamente un codificador visual (extracción de características de las imágenes de cámara del robot), una representación del estado del robot y una cabeza de acción que predice secuencias de comandos motores (chunks de acciones). El sufijo `cs40` del nombre del checkpoint apunta a un chunk size de 40, es decir, el modelo predice bloques de 40 acciones por paso de inferencia, lo que reduce la frecuencia efectiva de reevaluación de la política.

El entrenamiento se realizó por imitación supervisada sobre el dataset `Faless/harvest_apples_with_agilex_piper_sim`, un conjunto de demostraciones de la tarea de recogida de manzanas con el robot Agilex Piper en entorno simulado. Los hiperparámetros indicados en el nombre (`bs80`, `6ep`) corresponden a batch size 80 y 6 épocas. No se dispone de información sobre número de tokens, composición detallada del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de lo que expone la model card de LeRobot.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones (chunks de 40 pasos) a partir de observaciones visuales y del estado del robot.
- Ejecución de la tarea específica de recogida de manzanas sobre el robot Agilex Piper en simulación.
- Integración nativa con el ecosistema LeRobot para entrenamiento (`lerobot-train`), evaluación e inferencia (`lerobot-record`).
- Compatibilidad con el pipeline `robotics` de Hugging Face y con el formato safetensors.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo; no es un modelo de lenguaje.
- No se documentan modos especiales (thinking, visión general, audio) más allá del uso de observaciones visuales para el control.

## Casos de uso

- Reproducción de experimentos de aprendizaje por imitación: usar el checkpoint como referencia para replicar el pipeline de entrenamiento de LeRobot sobre el dataset de recogida de manzanas y comparar resultados con nuevas configuraciones.
- Evaluación de políticas en simulación: ejecutar `lerobot-record` con `--policy.path` apuntando a este checkpoint para medir la tasa de éxito de la tarea en el entorno Agilex Piper simulado antes de transferir a hardware.
- Punto de partida para fine-tuning: adaptar la política a variantes de la tarea (otras frutas, posiciones distintas) reentrenando sobre datasets propios con la misma interfaz de LeRobot.
- Benchmark interno de políticas robóticas: servir como baseline XVLA con hiperparámetros conocidos (bs80, 6 épocas, chunk size 40) frente a políticas ACT u otras variantes.
- Docencia y formación en robótica: ejemplo completo y reproducible de un flujo de entrenamiento e inferencia de una política VLA en simulación con licencia permisiva.
- Integración en pipelines de investigación: incorporar el modelo como componente de control en experimentos de manipulación que requieran un policy preentrenado sobre una tarea de pick-and-place concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 879,7 millones de parámetros, en fp32 serían aproximadamente 3,5 GB de pesos; en fp16 unos 1,8 GB. A ello hay que sumar el coste del codificador visual y de los buffers de observación, por lo que se recomienda al menos 6-8 GB de VRAM para operar con holgura.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para entrenamiento; para inferencia, una RTX 3060 de 12 GB o superior debería ser suficiente.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en fp16, aunque el entrenamiento completo requiere más memoria por el batch size 80.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`), con soporte de checkpoints locales o del Hub. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Faless/harvest_apples_xvla_v2_bs80_6ep_cs40 | 879,7 M | XVLA (política robótica) | no aplica | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot | variable | ACT (imitation learning) | no aplica | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas Diffusion Policy | variable | Diffusion policy | no aplica | Apache 2.0 | Hugging Face (LeRobot) |
| Otros checkpoints XVLA de la comunidad | no disponible | XVLA | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a tipo de política, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recogida de manzanas sobre el robot Agilex Piper en simulación; su generalización a otros robots, entornos reales u objetos es incierta y no está documentada.
- No se han publicado métricas de éxito, robustez ni evaluación cuantitativa, por lo que no es posible estimar su fiabilidad en producción.
- La model card está generada a partir de la plantilla de LeRobot y contiene campos sin completar ("Model type not recognized"), lo que indica documentación incompleta.
- Riesgo de sobreajuste al dataset de simulación: la brecha sim-to-real no está evaluada.
- No dispone de capacidades de lenguaje, razonamiento ni tool calling; no debe emplearse fuera del ámbito de control robótico.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento del robot en entornos reales recae en el integrador.
- El modelo tiene solo 27 descargas y 0 likes, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Faless/harvest_apples_xvla_v2_bs80_6ep_cs40
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/harvest_apples_with_agilex_piper_sim
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
