# mim-chess-vlas/train_800_sparse__bbox__separate_channel__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una política de imitación robótica entrenada con LeRobot sobre el backbone GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. La política está especializada en una única tarea de manipulación pick-and-place: recoger un objeto concreto y depositarlo en una caja, con 40 variantes de objeto distintas en el conjunto de entrenamiento. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propiocepción.

El modelo tiene 3.144.016.000 parámetros (3,14 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 12,6 GB, lo que sugiere pesos en precisión alta (probablemente bf16/fp16). Está pensado para el robot Panda con cuatro cámaras de entrada: una vista de agente (`agentview`), dos cámaras en la muñeca (`robot0_eye_in_hand`, `robot0_eye_in_hand_2`) y un canal de máscara (`mask`), lo que indica que el pipeline de entrenamiento incorpora segmentación o bounding boxes como señal visual adicional.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de ajuste fino de un modelo fundacional robótico sobre un dataset pequeño (787 episodios, 195.184 frames); por otro, sirve como referencia práctica para quien quiera reproducir el flujo de entrenamiento y despliegue con LeRobot 0.6.0 y el stack GR00T. Es un artefacto de investigación, no un producto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone VLM (Cosmos-Reason2/Qwen3-VL) + transformer de acciones con flow matching |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | Panda |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`, `mask` |
| Entrada de estado | `observation.state`, shape `(9,)` |
| Salida de acción | `action`, shape `(7,)` |
| Resolución de imagen | 224 × 224 × 3 por cámara |
| Dataset de entrenamiento | 787 episodios, 195.184 frames, 20 FPS |
| Pasos de entrenamiento | 60.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 7e-05 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.0 |
| Tamaño del repositorio | 12,6 GB |
| Descargas | 22 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las observaciones visuales y las instrucciones en lenguaje natural, acoplado a un transformer de acciones entrenado con flow matching. La predicción de acciones se condiciona conjuntamente por visión (cuatro cámaras a 224×224), lenguaje (la instrucción de la tarea, p. ej. "Pick the apple and place it into the box") y propiocepción (vector de estado de 9 dimensiones). La salida es un vector de acción de 7 dimensiones, típico de un efector final de 6 DoF más pinza.

El ajuste fino se realizó sobre el dataset `mim-chess-vlas/train_800_sparse__bbox__separate_channel__sim__all_cameras__live`, compuesto por 787 episodios y 195.184 frames capturados a 20 FPS en simulación. El nombre del dataset sugiere varias decisiones de diseño: `sparse` (posiblemente recompensas o anotaciones dispersas), `bbox` y `separate_channel` (canal de máscara separado como cuarta entrada visual), `sim` (datos simulados) y `all_cameras` (uso de las tres cámaras más la máscara). El entrenamiento se ejecutó durante 60.000 pasos con batch size 16, AdamW y learning rate 7e-05, con semilla 0. No se documenta en la información disponible si hubo RLHF, DPO ni fases de post-entrenamiento adicionales; el paradigma es imitación supervisada sobre demostraciones.

## Capacidades

- Generación de acciones de manipulación robótica de 7 dimensiones (6 DoF + pinza) condicionadas por visión, lenguaje y propiocepción.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas RGB (agente y dos en la muñeca) más un canal de máscara a 224×224.
- Comprensión de instrucciones en lenguaje natural para seleccionar el objeto objetivo entre 40 categorías (alimentos, utensilios, electrodomésticos, etc.).
- Ejecución de una tarea pick-and-place genérica parametrizada por el objeto: "Pick the X and place it into the box".
- Control de un robot Franka Emika Panda con efector final de pinza.
- Operación en tiempo real a 20 FPS, la frecuencia de captura del dataset de entrenamiento.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso explícito, modo thinking, audio ni otras modalidades fuera de visión, lenguaje y estado propioceptivo.

## Casos de uso

- Investigación en imitación robótica: reproducir el pipeline completo de LeRobot 0.6.0 y GR00T N1.7 para estudiar cómo se comporta un modelo fundacional ajustado con 787 episodios en una tarea concreta; útil como línea base en experimentos de comparación de arquitecturas o de tamaño de dataset.
- Benchmark de manipulación pick-and-place en simulación: emplear la política como referencia para medir tasas de éxito en las 40 variantes de objeto y analizar qué categorías (alimentos frente a utensilios) degradan más el rendimiento.
- Estudio de representaciones visuales con canal de máscara: el dataset incluye `bbox` y `separate_channel`, lo que permite evaluar si la segmentación explícita como cuarta entrada mejora la generalización frente a usar solo RGB.
- Aprendizaje por transferencia a nuevos objetos: partir de estos pesos y hacer fine-tuning con un conjunto reducido de demostraciones de un objeto nuevo, aprovechando que el backbone ya ha visto 40 categorías distintas.
- Evaluación de robustez multi-cámara: comparar el rendimiento con las tres cámaras frente a configuraciones reducidas (solo `agentview` o solo muñeca) para estudiar la contribución de cada vista.
- Docencia y formación en robótica de imitación: usar el repositorio como ejemplo autocontenido de cómo se estructura un dataset LeRobot, cómo se lanza `lerobot-rollout` y qué hiperparámetros son habituales en un ajuste fino de GR00T.
- Prototipado de pipelines de evaluación en simulación: integrar la política en un bucle cerrado con el simulador para medir latencia, estabilidad y tasa de éxito antes de transferir a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,14 mil millones de parámetros, en bf16/fp16 los pesos ocupan aproximadamente 6,3 GB; en cuantización de 8 bits, unos 3,1 GB; en 4 bits, unos 1,6 GB. A esto hay que sumar el coste de activaciones del backbone VLM y del transformer de acciones, no cuantificado en la información disponible.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB) o una A100/H100 son opciones holgadas para inferencia en bf16; una RTX 3090 (24 GB) o una RTX 4080 (16 GB) también deberían ser suficientes para los pesos, aunque el margen depende de las activaciones.
- ¿Cabe en GPU de consumo? Con 3,14 mil millones de parámetros, sí es plausible en tarjetas de 16 GB o más en bf16, y en 8 GB o más con cuantización de 8 bits. No hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), tal como indica la model card. Para el backbone subyacente, vLLM, TGI o llama.cpp no están documentados para esta política concreta; el despliegue estándar es el stack de LeRobot con el robot Panda.
- Latencia y throughput: no disponible. El dataset se captura a 20 FPS, lo que sugiere que el bucle de control esperado opera a esa frecuencia, pero no se documenta la latencia real de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GR00T N1.7 fine-tuned, Panda) | 3,14 mil M | no disponible | Pick-and-place, 40 objetos | Apache 2.0 | HuggingFace, 22 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional cross-embodiment | no disponible | GitHub Isaac-GR00T |
| Políticas LeRobot ACT / Diffusion Policy | no disponible | no disponible | Imitación genérica por tarea | Apache 2.0 (típicamente) | HuggingFace, LeRobot |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de rendimiento de esta política ni de las alternativas en la información proporcionada. La diferencia principal frente a una política ACT o Diffusion Policy es el uso de un backbone VLM de 3,14 mil millones de parámetros con condicionamiento en lenguaje, lo que permite parametrizar la tarea por instrucción en lugar de entrenar una política separada por objeto.

## Limitaciones y advertencias

- Especialización estrecha: la política solo se ha entrenado para pick-and-place de 40 objetos concretos sobre un robot Panda; no generaliza a otras tareas, otros robots ni otras morfologías sin reentrenamiento.
- Datos exclusivamente simulados: el dataset es `sim`, por lo que existe una brecha sim-to-real no cuantificada; el rendimiento en hardware físico puede degradarse de forma significativa.
- Sin métricas publicadas: no hay tasas de éxito, benchmarks ni evaluaciones formales en la información disponible, lo que impide estimar su calidad real.
- Sesgo de objeto y escena: el vocabulario de objetos y la disposición de la escena están fijados por el dataset; objetos fuera de las 40 categorías o configuraciones distintas de cámara probablemente fallen.
- Dependencia de la configuración de cámaras: requiere exactamente cuatro entradas visuales (`agentview`, dos en la muñeca y `mask`); usar menos cámaras o cambiar su montaje invalida las observaciones esperadas.
- Riesgo de alucinación de acciones: como todo modelo generativo de acciones, puede producir trayectorias plausibles pero incorrectas, especialmente cerca de los límites del espacio de estados visto en entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y el backbone Cosmos-Reason2/Qwen3-VL pueden tener sus propias condiciones que conviene verificar antes de un despliegue comercial.
- Madurez: 22 descargas y 0 likes indican un artefacto de investigación reciente, sin comunidad ni soporte; no hay garantías de mantenimiento.
- Idiomas: no se documenta el soporte multilingüe de las instrucciones; el dataset de entrenamiento está en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mim-chess-vlas/train_800_sparse__bbox__separate_channel__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_sparse__bbox__separate_channel__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_sparse__bbox__separate_channel__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
