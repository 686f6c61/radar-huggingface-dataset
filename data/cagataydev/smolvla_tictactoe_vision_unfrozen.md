# cagataydev/smolvla_tictactoe_vision_unfrozen

## Resumen

SmolVLA TicTacToe Vision-Unfrozen es un modelo de robótica vision-language-action (VLA) desarrollado por cagataydev, que parte del modelo base `lerobot/smolvla_base` y se ajusta finamente sobre el dataset `HashtagRobotics/tic-tac-toe-so101-block-a-clean-v1`. El modelo está diseñado para controlar un brazo robótico SO-101 (6 grados de libertad) en la tarea de jugar al tres en raya con bloques físicos, utilizando dos cámaras (superior y muñeca). La innovación principal de este checkpoint es que el backbone de visión (encoder SigLIP) se ha dejado sin congelar durante el entrenamiento, lo que permite adaptar las características visuales al dominio específico del tablero, la iluminación y los objetos, algo que el modelo base no cubre. Con 450 millones de parámetros totales, de los cuales 393 millones son entrenables, el modelo se entrena durante 60.000 pasos con una pérdida final de 0,078. Es relevante porque demuestra una vía para mejorar el rendimiento en entornos fuera de distribución (OOD) en robótica, a costa de una mayor carga computacional, y porque se apoya en la abstracción de entrenamiento `strands-robots`, que simplifica el ajuste de VLAs sobre datasets públicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (encoder de visión SigLIP + modelo de lenguaje + experto de acción) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo procesa imágenes y texto, no se especifica ventana de tokens) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (presumiblemente inglés, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo compacto de visión-lenguaje-acción que adapta un VLM preentrenado (SmolVLM) para control robótico. La arquitectura combina un encoder de visión SigLIP, un modelo de lenguaje y un "experto de acción" que genera comandos de articulación (6-DoF). En este checkpoint, el encoder de visión se ha dejado sin congelar (`freeze_vision_encoder=False`) y se entrena el experto de acción (`train_expert_only=False`), lo que permite que las características visuales se adapten al dominio específico del tablero de tres en raya. El entrenamiento se realizó con el framework `strands-robots` mediante `create_trainer("lerobot_local", policy_type="smolvla")`, sobre 195 episodios (~144.000 fotogramas a 30 Hz) del dataset SO-101, con dos cámaras. Se usaron 60.000 pasos con batch de 8, lo que supone 480.000 muestras (~3,32 épocas), con una pérdida final de 0,078. El pico de memoria GPU fue de 8,85 GB y el rendimiento de ~1,6 pasos/s. La tasa de aprendizaje final fue de 2,5e-6 con scheduler coseno. La comparación con la variante con visión congelada muestra que esta última es más rápida (~2,6 pasos/s) pero menos adaptable a escenas fuera de distribución.

## Capacidades

- Control robótico de manipulación: genera acciones de articulación (6-DoF) para un brazo SO-101 a partir de observaciones visuales y posiblemente instrucciones de lenguaje.
- Percepción visual multi-cámara: procesa imágenes de cámara superior y de muñeca para localizar el tablero y las piezas.
- Adaptación a dominio específico: al descongelar el encoder de visión, el modelo aprende características visuales propias del tablero de tres en raya, iluminación y texturas, mejorando en escenas OOD.
- Integración con el ecosistema LeRobot: compatible con la librería `lerobot` y el framework `strands-robots`, lo que facilita su uso en pipelines de robótica existentes.
- No es un modelo de chat ni de generación de texto general; su salida son acciones de control, no texto libre.

## Casos de uso

- Automatización de juegos de mesa físicos: el modelo puede controlar un brazo robótico para jugar al tres en raya contra un humano, moviendo bloques sobre un tablero real. Es adecuado porque ha sido entrenado específicamente para esta tarea con dos cámaras y acciones de 6-DoF.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto de descongelar el encoder de visión en VLAs, comparando con la variante frozen. Su bajo coste de entrenamiento (una GPU, ~10 h) lo hace accesible para laboratorios con recursos limitados.
- Desarrollo de políticas robóticas para entornos OOD: al adaptar las características visuales al dominio concreto, es útil en escenarios donde el modelo base falla por diferencias de iluminación, textura o geometría del tablero.
- Benchmark de manipulación con SO-101: puede emplearse como referencia para evaluar otros algoritmos de control en el mismo brazo y dataset, dado que se publican métricas de entrenamiento y pérdida.
- Pruebas de integración de `strands-robots`: el repositorio incluye el script completo de entrenamiento, lo que permite reproducir el experimento y validar la abstracción `create_trainer` para otros datasets.
- Educación en robótica VLA: al ser un modelo pequeño (450M) y con licencia Apache-2.0, es adecuado para cursos o talleres donde se quiera mostrar el flujo completo de entrenamiento de un VLA sin necesidad de hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (como MMLU, HumanEval o métricas de éxito en tareas robóticas) en la información disponible. La model card solo reporta la pérdida de entrenamiento a lo largo de los pasos:

| Step | Pérdida |
|---|---|
| 10K | ~0,15 |
| 20K | ~0,11 |
| 30K | ~0,09 |
| 40K | ~0,08 |
| 50K | ~0,075 |
| 60K | 0,078 |

Estos valores indican una convergencia estable, pero no permiten comparar con otros modelos en tareas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 450M de parámetros, en FP16 se estima un uso de ~0,9 GB de memoria solo para pesos, pero al procesar imágenes y secuencias de acción, la VRAM total puede superar los 4-6 GB. Se recomienda al menos 8 GB de VRAM para margen.
- GPU recomendadas: el entrenamiento se realizó en una sola GPU con pico de 8,85 GB, por lo que una RTX 3090, RTX 4090, A100 o similar es suficiente. Para inferencia, una GPU consumer con 8 GB o más (RTX 3060, 3070, 4060, etc.) debería bastar.
- Despliegue: al ser un modelo de robótica, no se usa con vLLM u Ollama. Se integra mediante la librería `lerobot` y el framework `strands-robots`, que proporcionan utilidades de carga y ejecución de políticas. También puede ejecutarse con PyTorch estándar.
- Latencia y throughput: no hay datos de inferencia. Durante el entrenamiento se lograron ~13 muestras/s y ~1,6 pasos/s, lo que da una idea del coste computacional. En inferencia, se espera una latencia de decenas de milisegundos por paso de control, dependiendo del hardware.

## Comparativa con modelos similares

La comparación directa con otros VLAs (como OpenVLA o RT-2) no está disponible en la información proporcionada. Sin embargo, se puede comparar con la variante frozen del mismo SmolVLA, según los datos de la model card:

| Modelo | Params entrenables | Velocidad entrenamiento | Pérdida final | Adaptación OOD |
|---|---|---|---|---|
| SmolVLA frozen (expert-only) | ~100M | ~2,6 pasos/s | No reportada | Limitada |
| SmolVLA vision-unfrozen (este) | ~393M | ~1,6 pasos/s | 0,078 | Mejorada |

El modelo unfrozen sacrifica velocidad de entrenamiento y usa más parámetros, pero gana capacidad de adaptación a dominios visuales específicos, como se indica en la model card. No hay datos de rendimiento en tareas para comparar con otros VLAs.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de tres en raya con el brazo SO-101 y el dataset concreto. No es generalizable a otras tareas de manipulación sin reentrenamiento.
- Riesgo de alucinación en acciones: como cualquier modelo generativo, puede producir acciones inconsistentes con la observación, especialmente en escenas no vistas. No se han reportado métricas de seguridad o robustez.
- Dependencia de cámaras: requiere dos cámaras específicas (superior y muñeca) y una calibración adecuada; cambios en la disposición de las cámaras degradarán el rendimiento.
- Sin soporte de lenguaje natural avanzado: aunque es un VLA, su salida es directamente acción, no hay interacción conversacional ni tool calling.
- Sesgos del dataset: el dataset de tic-tac-toe puede tener sesgos en la distribución de posiciones, colores de bloques o condiciones de iluminación, que el modelo podría aprender y perpetuar.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base `lerobot/smolvla_base` puede tener restricciones adicionales; se recomienda revisar su licencia.
- Sin cuantizaciones publicadas: para despliegue en edge, habría que cuantizar manualmente, lo que puede afectar al rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cagataydev/smolvla_tictactoe_vision_unfrozen
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HashtagRobotics/tic-tac-toe-so101-block-a-clean-v1
- Repositorio strands-robots: https://github.com/strands-labs/robots
- Librería LeRobot (documentación): https://github.com/huggingface/lerobot
