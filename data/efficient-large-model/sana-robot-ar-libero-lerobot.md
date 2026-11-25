# Efficient-Large-Model/SANA-Robot-AR-LIBERO-LeRobot

## Resumen

SANA-Robot-AR-LIBERO-LeRobot es un modelo de política robótica (world-action model) publicado por el equipo Efficient-Large-Model, en colaboración con NVlabs, y distribuido en el formato LeRobot para la política `sana_robot`. El modelo parte de la observación multivista actual, la propiocepción y una instrucción en lenguaje natural para predecir simultáneamente un bloque de 32 acciones y el vídeo futuro, lo que lo convierte en un modelo de acción y mundo acoplados. La variante "AR" incorpora una memoria híbrida sobre el historial visual del episodio.

Este checkpoint concreto es un post-entrenamiento sobre demostraciones simuladas del benchmark LIBERO y del robot Franka, y sus pesos son idénticos a los del repositorio original SANA-Robot-AR-LIBERO; únicamente cambia el empaquetado a LeRobot, con los procesadores de normalización incluidos. Cuenta con aproximadamente 4.470 millones de parámetros almacenados en FP32 (unos 17,9 GB en el repositorio) y se distribuye bajo licencia Apache 2.0.

Su relevancia actual reside en que combina generación de vídeo futuro y predicción de acciones en un único modelo eficiente, con resultados agregados de 93,11 en LIBERO-Plus, y en que se integra directamente en el ecosistema LeRobot mediante una política propuesta en el repositorio de Hugging Face. Está pensado para investigación en manipulación robótica, no para despliegue directo en producción con otros robots o escenas sin ajuste fino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World-action model SANA-Robot-AR con memoria híbrida sobre historial visual; política `sana_robot` sobre LeRobot |
| Parámetros totales | 4.469.245.520 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (memoria híbrida sobre el historial visual del episodio; sin cifra publicada) |
| Tipos de cuantización | no disponible (pesos publicados en FP32) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; codificador de texto Gemma 2 2B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32, pesos EMA), más `config.json` y procesadores pre/post |

## Arquitectura y entrenamiento

SANA-Robot es un world action model eficiente que, a partir de la observación multivista, la propiocepción y una instrucción textual, predice un bloque de 32 acciones junto con el vídeo futuro. La variante AR añade una memoria híbrida sobre la historia visual del episodio, lo que permite al modelo condicionar la predicción en la evolución reciente de la escena. El codificador de texto es Gemma 2 2B (con acceso restringido, gated) y el VAE de vídeo es LTX-2.3; ninguno de los dos se incluye en el repositorio, sino que LeRobot los descarga en las revisiones que indica el `config.json`.

Los pesos publicados son los del checkpoint original sin modificar, con EMA, y el post-entrenamiento se realizó sobre demostraciones simuladas de LIBERO con un robot Franka. Los procesadores incluidos contienen la normalización empleada en el entrenamiento: estadísticas de Franka del pretraining para articulaciones y posición de brida, sin normalizar la rotación ni la pinza. Esto difiere de la normalización que LeRobot calcula por defecto a partir de los datos de LIBERO, un detalle crítico para reproducir el checkpoint o reanudar el entrenamiento con `lerobot-train`. No se especifican en la información disponible el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Predicción de acciones de manipulación robótica en bloques de 32 acciones a partir de observación multivista y propiocepción.
- Generación del vídeo futuro como parte de la predicción del world model.
- Condicionamiento por instrucciones en lenguaje natural mediante un codificador Gemma 2 2B.
- Memoria híbrida sobre el historial visual del episodio (variante AR).
- Control a partir de cámaras, articulaciones y posición de brida con normalización específica de Franka.
- Evaluación integrada en LeRobot con el entorno LIBERO y variantes de tarea (spatial, object, goal, long).
- Inferencia con 2 pasos de denoising, sin guidance y un nuevo bloque cada 16 pasos de control.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o thinking mode.

## Casos de uso

- Investigación en políticas de manipulación: el modelo sirve como referencia reproducible en LIBERO-Plus, con 10.030 variantes de tarea evaluadas una vez y límites de pasos de 280/280/300/520 según la suite.
- Evaluación comparativa de world action models: al predecir vídeo futuro y acciones conjuntamente, permite analizar la coherencia entre la dinámica visual generada y la trayectoria de control.
- Ajuste fino sobre datos propios: el checkpoint puede reentrenarse con `lerobot-train` sobre un dataset propio, que por defecto calcula su propia normalización, para adaptarlo a otro robot, cámara o escena.
- Estudio de memoria visual en robótica: la variante AR permite investigar cómo el historial visual del episodio mejora la predicción de acciones en tareas de horizonte largo.
- Reproducción de experimentos: los procesadores incluidos y la receta de descarga permiten reproducir el checkpoint desde los pesos de pretraining con `keep_checkpoint_statistics`.
- Prototipado en simulación: integración con `lerobot-eval` y el entorno LIBERO para validar políticas antes de cualquier transferencia a hardware.
- Análisis de planificación a corto plazo: los bloques de 32 acciones con refresco cada 16 pasos de control permiten estudiar compromisos entre reactividad y estabilidad del control.

## Benchmarks y rendimiento

Resultados con `lerobot-eval` sobre LIBERO-Plus, todas las 10.030 variantes de tarea una vez, con límites de pasos de LeRobot (280/280/300/520), 2 pasos de denoising, sin guidance y un nuevo bloque cada 16 pasos de control:

| Suite | Resultado |
|---|---|
| Spatial | 94,84 |
| Object | 97,02 |
| Goal | 87,19 |
| Long | 93,65 |
| Total | 93,11 |

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) ni comparativas numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 17,9 GB, por lo que se necesita al menos esa cantidad más el coste del codificador Gemma 2 2B y del VAE LTX-2.3, que se descargan aparte; no se publica una cifra oficial de VRAM total.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño de pesos, se requiere una GPU con memoria suficiente para FP32 más los componentes auxiliares.
- ¿Cabe en GPU consumer? No se confirma; los 17,9 GB en FP32 más el codificador y el VAE hacen improbable el despliegue en GPUs consumer de gama media sin cuantización, y no se documentan cuantizaciones.
- Opciones de despliegue: LeRobot con la política `sana_robot` (propuesta en huggingface/lerobot#5488), instalación con `pip install -e ".[sana_robot,libero]"`, evaluación con `lerobot-eval` y entrenamiento con `lerobot-train`.
- Latencia y throughput: no disponibles; la evaluación se realiza con `eval.batch_size=1`, 2 pasos de denoising y refresco de bloque cada 16 pasos de control.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (world action models para manipulación) con parámetros, contexto, rendimiento y licencia verificables. Por tanto, la comparativa cuantitativa se considera no disponible.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SANA-Robot-AR-LIBERO-LeRobot | 4.469.245.520 | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo fue post-entrenado sobre demostraciones simuladas de un único benchmark (LIBERO) y un único robot (Franka); otros robots, cámaras, tareas o escenas requieren ajuste fino.
- Una política aprendida puede fallar sin aviso: en un robot físico debe ejecutarse solo con límites de espacio de trabajo, límites de velocidad y una persona junto al botón de parada.
- La normalización de los procesadores corresponde a las estadísticas de Franka del pretraining y no a la que LeRobot calcula por defecto desde LIBERO; usar la normalización incorrecta altera el comportamiento del checkpoint.
- El codificador de texto Gemma 2 2B es de acceso restringido (gated) y no se incluye en el repositorio, lo que añade una dependencia externa para la inferencia.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; los idiomas soportados figuran como no disponibles.
- No se publican cuantizaciones ni cifras de latencia o throughput, lo que limita la planificación de despliegues en producción.
- La licencia Apache 2.0 permite uso comercial, pero el uso previsto declarado es la investigación en políticas de manipulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-LIBERO-LeRobot
- Modelo base: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-LIBERO
- Checkpoint de pretraining en LeRobot: https://huggingface.co/Efficient-Large-Model/SANA-Robot-AR-Pretrain-LeRobot
- Página del proyecto: https://nvlabs.github.io/Sana/Robot/
- Paper: https://github.com/NVlabs/Sana/blob/robot/asset/SANA-Robot.pdf
- Código: https://github.com/NVlabs/Sana/tree/robot
- Pull request de la política en LeRobot: https://github.com/huggingface/lerobot/pull/5488
- LeRobot: https://github.com/huggingface/lerobot
- LIBERO-Plus: https://github.com/sylvestf/LIBERO-plus
- Codificador de texto Gemma 2 2B: https://huggingface.co/google/gemma-2-2b-it
- VAE de vídeo LTX-2.3: https://huggingface.co/Efficient-Large-Model/LTX-2.3-Diffusers
