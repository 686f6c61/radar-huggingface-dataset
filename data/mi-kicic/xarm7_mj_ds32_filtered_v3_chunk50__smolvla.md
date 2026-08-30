# mi-kicic/xarm7_mj_ds32_filtered_v3_chunk50__smolvla

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, adaptado específicamente para controlar un brazo robótico xArm7 en el simulador MuJoCo. El autor, mi-kicic, ha entrenado esta política sobre el dataset `mi-kicic/xarm7_mj_ds32_filtered`, que contiene 1975 episodios de demostración de una tarea concreta: recoger un motor azul e insertarlo en una caja de cambios naranja. El modelo se distribuye bajo licencia Apache 2.0 y está integrado en el ecosistema LeRobot, lo que facilita su reproducción y despliegue.

SmolVLA se presenta como una alternativa eficiente a los VLA masivos, con 450 millones de parámetros, diseñado para ejecutarse en hardware de consumo. Este fine-tuning demuestra cómo adaptar un modelo base preentrenado a una tarea robótica específica con un coste computacional reducido, manteniendo un rendimiento competitivo. La relevancia actual radica en la tendencia hacia modelos de robótica abiertos y ligeros que puedan ser utilizados por laboratorios con recursos limitados.

El modelo consume tres vistas de cámara (frontal, muñeca y esquina) junto con el estado del robot (15 dimensiones) y produce acciones de 8 dimensiones a 10 FPS. No se especifica la longitud de contexto en la información disponible, pero al ser un VLA, el contexto incluye las imágenes y la instrucción de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de tipo transformer multimodal que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones. Está basado en SmolVLM, un VLM ligero, y se adapta para robótica mediante una cabeza de acción que predice comandos de articulación. El modelo base `lerobot/smolvla_base` fue preentrenado en grandes corpus de datos multimodales y posteriormente fine-tuneado con aprendizaje por imitación supervisada sobre el dataset de demostraciones.

El entrenamiento de este fine-tuning se realizó con LeRobot versión 0.6.1, durante 100.000 pasos, con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 3e-05. El dataset contiene 334.022 frames a 10 FPS, capturados con tres cámaras sincronizadas. No se menciona el uso de RLHF, DPO ni otras técnicas de refuerzo; se trata de un entrenamiento puramente supervisado de clonación de comportamiento. La innovación principal de SmolVLA es su eficiencia: con solo 450M de parámetros, logra un rendimiento comparable a modelos mucho más grandes, lo que permite su despliegue en GPUs de consumo.

## Capacidades

- Generacion de acciones de control para un brazo robótico xArm7 en simulación MuJoCo, a partir de observaciones visuales y estado articular.
- Procesamiento de tres vistas de cámara simultáneas (frontal, muñeca y esquina) con resolución 512x512.
- Ejecución de la tarea específica de recoger un motor azul e insertarlo en una caja de cambios naranja, siguiendo una instrucción en lenguaje natural.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- Soporte de inferencia en tiempo real a 10 FPS, adecuado para control de bucle cerrado.
- Capacidad de fine-tuning adicional sobre otros datasets de LeRobot gracias a su arquitectura modular.

## Casos de uso

- Automatización de tareas de ensamblaje en entornos simulados: el modelo puede controlar un brazo xArm7 para realizar inserciones precisas de componentes, útil para validar algoritmos de manipulación antes de transferirlos a robots reales.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo los VLA compactos se adaptan a tareas específicas con pocos datos, comparando con modelos más grandes.
- Desarrollo de políticas de control para brazos robóticos de bajo coste: al requerir solo 450M de parámetros, puede ejecutarse en GPUs como una RTX 3060, lo que permite a laboratorios pequeños experimentar con VLA.
- Generación de datos sintéticos de entrenamiento: el modelo puede utilizarse en MuJoCo para generar nuevas trayectorias de demostración que luego se usen para entrenar otros modelos.
- Benchmarking de VLA en tareas de manipulación: su licencia Apache 2.0 y su integración con LeRobot lo convierten en un candidato ideal para comparativas estandarizadas de políticas robóticas.
- Prototipado rápido de aplicaciones robóticas: gracias a los scripts de rollout de LeRobot, se puede desplegar el modelo en un robot simulado en minutos, facilitando pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluación para esta política. No se proporcionan métricas como tasa de éxito en la tarea, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450M de parámetros en FP32, el modelo ocupa aproximadamente 1,8 GB, pero al procesar tres imágenes de 512x512 y el estado, se recomienda al menos 6 GB de VRAM para inferencia en tiempo real. No hay datos oficiales.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 6 GB de VRAM, como una NVIDIA RTX 3060, RTX 4060 o superior. Para entrenamiento, se necesitan al menos 12 GB (por el batch y los gradientes).
- Compatibilidad con hardware de consumo: sí, es uno de los objetivos de SmolVLA.
- Opciones de despliegue: LeRobot (con `lerobot-rollout`), compatible con MuJoCo y robots reales xArm7. También se puede exportar a otros formatos si se convierte, pero no se menciona.
- Latencia y throughput: no disponibles, pero al operar a 10 FPS, se espera una latencia de inferencia inferior a 100 ms en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mi-kicic/xarm7_mj_ds32_filtered_v3_chunk50__smolvla | 450M | no disponible | Apache-2.0 | Hugging Face |
| lerobot/smolvla_base | 450M | no disponible | Apache-2.0 | Hugging Face |
| OpenVLA (base) | 7B | 2048 | MIT | Hugging Face |

SmolVLA se distingue de OpenVLA por su tamaño significativamente menor (450M frente a 7B), lo que reduce los requisitos de hardware y acelera la inferencia. Sin embargo, OpenVLA tiene un contexto más largo y ha sido evaluado en más tareas. Ambos son de código abierto, pero SmolVLA está más integrado con LeRobot. No se dispone de comparativas de rendimiento directas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (recoger motor azul e insertarlo en caja de cambios naranja) y no generaliza a otras tareas sin fine-tuning adicional.
- Depende del entorno simulado MuJoCo y de la configuración exacta de cámaras y robot; cambios en la iluminación, posición de objetos o calibración pueden degradar el rendimiento.
- No se han reportado evaluaciones en el mundo real, por lo que su transferencia a hardware físico no está validada.
- Riesgo de sobreajuste al dataset de entrenamiento, que contiene 1975 episodios de una sola tarea.
- Al ser un modelo de imitación, puede heredar sesgos del demostrador humano o de los datos generados automáticamente.
- No se especifican limitaciones de contexto ni de idioma, pero al ser un VLA, la instrucción en lenguaje natural probablemente solo funciona en inglés (no confirmado).
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mi-kicic/xarm7_mj_ds32_filtered_v3_chunk50__smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/mi-kicic/xarm7_mj_ds32_filtered
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentación de LeRobot sobre SmolVLA: https://dctx-team.github.io/lerobot-zh/en/smolvla/
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo base: https://huggingface.co/lerobot/smolvla_base
