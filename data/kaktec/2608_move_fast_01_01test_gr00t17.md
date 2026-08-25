# kaKTEC/2608_move_fast_01_01test_GR00T17

## Resumen

Este repositorio contiene una política robótica basada en GR00T N1.7, el modelo fundacional de código abierto de NVIDIA para razonamiento y habilidades en robots humanoides generalizados. La política ha sido entrenada por el usuario kaKTEC con LeRobot para la tarea de transportar un cubo blanco en movimiento, y se distribuye bajo licencia Apache 2.0. El modelo es un vision-language-action (VLA) que combina un backbone Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow-matching, condicionando las predicciones a visión, lenguaje y propiocepción.

Con 3.144.016.000 parámetros (~3,14 mil millones) y un tamaño de repositorio de 12,6 GB, el modelo procesa dos cámaras (superior y de muñeca) a 640x480 píxeles junto con un estado de propiocepción de 6 dimensiones, y genera acciones de 6 dimensiones para el robot SO-100 follower. Se entrenó con 60 episodios (21.818 frames a 30 FPS) durante 60.000 pasos con batch size 64, optimizador AdamW y tasa de aprendizaje de 0,0001.

Su relevancia radica en su naturaleza cross-embodiment, su integración nativa con LeRobot y su despliegue mediante el CLI `lerobot-rollout`, lo que lo convierte en una referencia práctica para investigadores que trabajan con aprendizaje por imitación en robótica de bajo coste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + transformer de acción con flow-matching) |
| Parámetros totales | 3.144.016.000 (~3,14 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Safetensors sin cuantizar (fp32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es una VLA (vision-language-action) basada en GR00T N1.7 de NVIDIA. Su arquitectura combina un backbone de razonamiento Cosmos-Reason2/Qwen3-VL con un transformer de acción basado en flow-matching, que predice acciones condicionadas a entradas multimodales: dos imágenes de cámaras (superior y muñeca) de 480×640 píxeles, un estado de propiocepción de 6 dimensiones y una instrucción de tarea en lenguaje natural. La generación de acciones se realiza mediante un proceso de flow-matching que modela la distribución de trayectorias de acción.

El entrenamiento se realizó con LeRobot (versión 0.6.1) mediante aprendizaje por imitación. El dataset de entrenamiento consta de 60 episodios y 21.818 frames a 30 FPS, correspondientes a la tarea "Carrying a Moving White Cube". La configuración de entrenamiento fue de 60.000 pasos con batch size 64, optimizador AdamW y una tasa de aprendizaje de 0,0001, con semilla 42. No se menciona el uso de RLHF ni DPO en la información disponible.

## Capacidades

- Generación de acciones de manipulación robótica de 6 dimensiones a partir de visión, propiocepción y lenguaje.
- Procesamiento simultáneo de dos cámaras (superior y muñeca) a 640×480 píxeles.
- Integración con el ecosistema LeRobot para entrenamiento y despliegue en robots SO-100 follower.
- Ejecución en tiempo real mediante el comando `lerobot-rollout` con estrategia base.
- Capacidad de generalización cross-embodiment, al ser un modelo VLA de NVIDIA diseñado para distintos tipos de robots.
- Predicción de acciones condicionadas a instrucciones de tarea en lenguaje natural (vía backbone Qwen3-VL).

## Casos de uso

- Manipulación de objetos en movimiento en entornos de producción: el modelo está entrenado para transportar un cubo blanco en movimiento, lo que lo hace adecuado para tareas de picking y placing dinámico en líneas de ensamblaje o almacenes.
- Base para aprendizaje por imitación en nuevas tareas: al ser una política entrenada con LeRobot, puede utilizarse como punto de partida para fine-tuning con pocos episodios de demostración en tareas similares.
- Evaluación de algoritmos VLA en robótica de bajo coste: permite comparar el rendimiento de GR00T N1.7 frente a otras políticas en hardware SO-100, con un pipeline reproducible mediante el CLI de LeRobot.
- Teleoperación y control remoto de robots SO-100: el modelo puede integrarse en sistemas de teleoperación para asistir al operador en tareas de precisión, usando las cámaras superior y de muñeca.
- Investigación en transferencia cross-embodiment: al ser un modelo VLA, permite estudiar la transferencia de habilidades entre distintos robots con la misma interfaz de acción.
- Generación de trayectorias de demostración para entrenar otros modelos: la política puede desplegarse para generar datos sintéticos de demostración que sirvan como dataset para entrenar políticas más especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política, por lo que se desconoce la tasa de éxito en el mundo real.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 3,14 mil millones de parámetros en fp32 (12,6 GB), se estima un mínimo de 16 GB de VRAM para inferencia sin cuantizar, y aproximadamente 6-8 GB si se cuantiza a 8 bits o 4 bits.
- GPU recomendadas: NVIDIA RTX 3090 o RTX 4090 (24 GB) para fp32, o A100/H100 para entrenamiento y despliegue a mayor escala.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3090/4090 con 24 GB de VRAM para inferencia en fp32.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch con CUDA. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| kaKTEC/2608_move_fast_01_01test_GR00T17 | 3,14 B | No disponible | Manipulación de cubo en movimiento | Apache 2.0 |
| GR00T N1.6 (NVIDIA, rama n1d6) | No disponible | No disponible | Manipulación general | Apache 2.0 |
| OpenVLA (Stanford) | 7 B | No disponible | Manipulación general | No disponible |

La comparativa se basa en datos públicos generales de los modelos citados; los valores de contexto y parámetros de GR00T N1.6 y OpenVLA no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en el mundo real; la tasa de éxito en el robot no está verificada.
- El modelo se entrenó únicamente con 60 episodios de una sola tarea, por lo que la generalización a otras tareas u objetos es limitada.
- Depende de una configuración de cámaras específica (superior y muñeca) y de un estado de propiocepción de 6 dimensiones; cualquier cambio en la configuración del robot requiere reentrenamiento.
- Al ser un modelo de acciones, el riesgo de alucinación se manifiesta como acciones no seguras en entornos no vistos; se recomienda validación en entornos controlados antes del despliegue.
- No se proporcionan datos de latencia ni throughput para uso en tiempo real.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 de NVIDIA tiene sus propias condiciones de uso que deben revisarse.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/kaKTEC/2608_move_fast_01_01test_GR00T17)
- [Dataset de entrenamiento](https://huggingface.co/datasets/kaKTEC/2608_move_fast_01_01test_20260820_140812)
- [GitHub Isaac-GR00T de NVIDIA](https://github.com/NVIDIA/Isaac-GR00T)
- [Blog de NVIDIA sobre GR00T 1.7 en LeRobot](https://huggingface.co/blog/nvidia/nvidia-isaac-teleop-and-gr00t17-in-lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot)
- [Guía de LeRobot para GR00T](https://huggingface.co/docs/lerobot/main/en/groot)
