# mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__ab_b30

## Resumen

Este repositorio contiene una política de robot entrenada con LeRobot sobre el modelo fundacional GR00T N1.7 de NVIDIA, un modelo abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. La arquitectura combina un backbone Cosmos-Reason2/Qwen3-VL (visión-lenguaje) con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propiocepción. El modelo resultante tiene 3.144.016.000 parámetros y está especializado en tareas de manipulación pick-and-place sobre un entorno simulado con brazos Panda y UR5e.

El checkpoint ha sido entrenado durante 60.000 pasos con un batch size de 16, optimizador AdamW y una tasa de aprendizaje de 7e-05, partiendo de la semilla 0, sobre un dataset de 1.526 episodios y 377.262 fotogramas a 20 FPS. Las tareas cubren 40 variantes de "Pick the X and place it into the box", donde X abarca objetos domésticos como fruta, envases, utensilios o electrodomésticos. La observación incluye el estado del robot (vector de 9 dimensiones) y tres cámaras: `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`, todas a 224x224 píxeles. La salida es un vector de acción de 7 dimensiones.

Es relevante porque ejemplifica el flujo actual de reutilización de modelos fundacionales de robótica: en lugar de entrenar desde cero, se afina un backbone VLA (vision-language-action) de NVIDIA con datos de imitación recogidos en simulación, y se publica el resultado con licencia Apache 2.0 y formato compatible con LeRobot. El nombre del repositorio codifica la configuración experimental (máscara al 75%, UR5e, GR00T, semilla 0, batch 30 en la etiqueta aunque la model card indica 16), lo que sugiere un barrido de hiperparámetros o ablaciones dentro de un proyecto mayor de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo procesa instrucciones de lenguaje, pero no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL que codifica las observaciones visuales (tres cámaras a 224x224) y las instrucciones de tarea, acoplado a un transformer de acciones que genera trayectorias mediante flow matching. La entrada de estado es un vector de 9 dimensiones (propiocepción del robot Panda+UR5e) y la salida es una acción de 7 dimensiones. El modelo es cross-embodiment en su forma original, aunque este checkpoint está especializado en la morfología Panda+UR5e.

El entrenamiento se realizó con LeRobot 0.6.0 durante 60.000 pasos, batch size 16, optimizador AdamW y learning rate 7e-05, con semilla 0. El dataset contiene 1.526 episodios y 377.262 fotogramas a 20 FPS, con 40 tareas de tipo pick-and-place sobre objetos domésticos. No se especifica en la información disponible si hubo RLHF, DPO ni el número total de tokens de entrenamiento del backbone. El nombre del repositorio indica una configuración de máscara al 75% (`mask_a75`) y variante `sparse`, probablemente referida a la política de enmascaramiento de datos o de atención durante el entrenamiento.

## Capacidades

- Manipulación robótica pick-and-place: predice acciones de 7 dimensiones para coger un objeto y depositarlo en una caja, condicionado por instrucción de lenguaje.
- Percepción multi-cámara: procesa simultáneamente las vistas `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2`.
- Condicionamiento por lenguaje: las 40 tareas se especifican mediante instrucciones textuales del tipo "Pick the X and place it into the box".
- Integración de propiocepción: consume un vector de estado de 9 dimensiones del robot.
- Control a 20 FPS: la frecuencia del dataset de entrenamiento marca la cadencia de operación esperada.
- Compatibilidad con LeRobot: se ejecuta con `lerobot-rollout` y se entrena con el pipeline estándar de LeRobot.
- Cross-embodiment heredado: al derivar de GR00T N1.7, el backbone conserva capacidades generales de razonamiento visión-lenguaje, aunque el afinamiento está orientado a una morfología concreta.
- No se declaran capacidades de tool calling, agentes multi-paso, audio ni thinking mode en la información disponible.

## Casos de uso

- Automatización de picking en almacén simulado: el modelo puede ejecutar la secuencia de coger un objeto doméstico y colocarlo en una caja sobre un entorno tipo robosuite, usando las tres cámaras para localizar el objeto y el vector de estado para controlar el brazo. Es adecuado porque ha sido entrenado específicamente en esa distribución de tareas.
- Generación de datos sintéticos para entrenamiento de políticas: al ejecutarse en simulación a 20 FPS, puede generar trayectorias etiquetadas que alimenten posteriores entrenamientos por imitación o aprendizaje por refuerzo.
- Evaluación comparativa de configuraciones de entrenamiento: el nombre del checkpoint codifica máscara, morfología y semilla, lo que permite usarlo como punto de referencia en ablaciones sobre enmascaramiento o tamaño de batch.
- Investigación en transferencia sim-to-real: sirve como base para estudiar la brecha entre políticas entrenadas en simulación y su despliegue en un UR5e o Panda real, dado que la morfología está declarada explícitamente.
- Benchmark de modelos VLA fundacionales: permite comparar el rendimiento de GR00T N1.7 frente a otras arquitecturas VLA en una tarea de manipulación estandarizada con 40 variantes de objeto.
- Prototipado de interfaces de instrucción en lenguaje natural para robots: el condicionamiento textual permite probar cómo distintas formulaciones de la instrucción afectan a la ejecución, dentro del vocabulario de objetos del dataset.
- Docencia y demostraciones de imitación: al estar empaquetado con LeRobot y licencia Apache 2.0, es apto para cursos y talleres sobre aprendizaje por imitación en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.144 millones de parámetros, en FP16 se requieren aproximadamente 6,3 GB solo para pesos; en BF16 similar. En FP32 ascenderían a unos 12,6 GB. A ello hay que sumar el coste del backbone de visión y de las activaciones, por lo que un despliegue cómodo en FP16 requiere del orden de 10-16 GB de VRAM.
- GPU recomendadas: para entrenamiento, A100 o H100 de 40-80 GB; para inferencia en FP16, RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB) o L4 (24 GB) son suficientes para los pesos, aunque el rendimiento real depende del pipeline de LeRobot.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y previsiblemente en GPUs de 16 GB con cuantización, aunque no se documentan tipos de cuantización soportados.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), que es el camino documentado por el autor. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint, dado que es una política de robótica y no un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. La referencia de 20 FPS del dataset sugiere una cadencia objetivo de control, pero no se publican medidas de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 afinado) | 3.144 M | no disponible | Pick-and-place Panda+UR5e | Apache 2.0 | Hugging Face, LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | Repositorio Isaac-GR00T |
| Otras políticas LeRobot del mismo proyecto (`mim-chess-vlas`) | no disponible | no disponible | Variantes con distintas máscaras y morfologías | Apache 2.0 (presumible) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para 40 tareas concretas de pick-and-place sobre objetos domésticos en un entorno simulado; generalizará mal a objetos, instrucciones o morfologías fuera de esa distribución.
- Dependencia de la morfología: la entrada de estado es de 9 dimensiones y la acción de 7, calibradas para Panda+UR5e; no es directamente reutilizable en otros robots sin reentrenamiento.
- Riesgo de alucinación de acciones: como política de imitación, puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de distribución, sin mecanismo de verificación explícito.
- Sesgos del dataset: las 40 tareas cubren un conjunto acotado de objetos y una única disposición de caja; los sesgos de los datos de simulación se trasladan a la política.
- Brecha sim-to-real no documentada: no se publican resultados de despliegue en hardware físico, por lo que el rendimiento real es incierto.
- Idiomas: no se declaran idiomas soportados; las instrucciones del dataset están en inglés y no hay garantía de comportamiento correcto en castellano u otros idiomas.
- Sin benchmarks publicados: no hay métricas de éxito, lo que dificulta evaluar la calidad del checkpoint frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del backbone subyacente (Cosmos-Reason2/Qwen3-VL) y del dataset de entrenamiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- Tamaño del repo de 50,3 GB: el despliegue requiere espacio en disco considerable y tiempos de descarga elevados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_sparse__mask_a75__ur5e__groot__seed_0__ab_b30
- Dataset de entrenamiento: https://huggingface.co/datasets/lets-merged/mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live_mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lets-merged/mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live_mim-chess-vlas-train_800_sparse__mask__overlay_a75__sim__all_cameras__live__ur5e
- Repositorio Isaac-GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
