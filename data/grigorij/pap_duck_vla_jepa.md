# Grigorij/PaP_duck_vla_jepa

## Resumen

VLA-JEPA es un modelo de visión-lenguaje-acción (VLA) diseñado para robótica, que combina un backbone de lenguaje y visión Qwen3-VL con un modelo de mundo latente autosupervisado (V-JEPA2) y un head de acción basado en un transformer DiT con flow-matching. El modelo, desarrollado por Grigorij y publicado bajo licencia Apache 2.0, se ha entrenado con el framework LeRobot para controlar un robot tipo `so_follower` en la tarea de colocar un pato en un cuenco ("Put duck to the bowl"). Con aproximadamente 2.770 millones de parámetros, este VLA integra predicción de representaciones visuales latentes para mejorar la generalización y el razonamiento de largo horizonte en manipulación robótica.

El modelo se distribuye como un checkpoint de LeRobot en formato safetensors, entrenado sobre un dataset propio de 32 episodios (16.288 frames a 30 FPS) con dos cámaras (frontal y de brazo). Su relevancia actual radica en que representa una línea de investigación activa (ECCV 2026) que busca incorporar modelos de mundo en políticas de imitación para superar las limitaciones de los VLA reactivos convencionales, especialmente en tareas que requieren planificación multi-paso y comprensión de la dinámica del entorno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA-JEPA: Qwen3-VL (backbone vision-lenguaje) + V-JEPA2 (modelo de mundo latente) + DiT con flow-matching (head de accion) |
| Parametros totales | 2.770.329.478 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo orientado a robótica, no a texto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VLA-JEPA descrita en el paper arXiv 2602.10098. Combina un backbone de visión-lenguaje Qwen3-VL que procesa las observaciones visuales (dos cámaras RGB de 480×640) y las instrucciones en lenguaje natural, con un modelo de mundo autosupervisado V-JEPA2 que aprende representaciones predictivas latentes de video. El head de acción es un transformer DiT (Diffusion Transformer) que genera acciones de 6 dimensiones mediante flow-matching, una técnica que modela la distribución de acciones como un flujo continuo en lugar de una difusión discreta. Esta combinación permite que el modelo razone sobre las consecuencias futuras de sus acciones antes de generarlas, mejorando la planificación en tareas de manipulación.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `Grigorij/PaP_duck`, que contiene 32 episodios de la tarea "Put duck to the bowl" grabados a 30 FPS. Se usaron 10.000 pasos de entrenamiento con batch size 8, optimizador AdamW, learning rate 0.0001 y seed 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el entrenamiento es de imitación supervisada (behavior cloning) con el objetivo de flow-matching.

## Capacidades

- Control robótico de precisión: genera acciones de 6 grados de libertad (posición y orientación del efector final) a partir de observaciones de estado y dos vistas de cámara.
- Comprensión de instrucciones en lenguaje natural: integra un backbone Qwen3-VL que procesa comandos textuales como "Put duck to the bowl".
- Razonamiento con modelo de mundo latente: utiliza V-JEPA2 para predecir representaciones visuales futuras, lo que facilita la planificación de movimientos de largo horizonte.
- Generación de acciones con flow-matching: el head DiT produce trayectorias de acción suaves y multimodales, adecuadas para manipulación fina.
- Generalización a variaciones de la tarea: al estar entrenado con imitación, puede adaptarse a pequeñas variaciones de posición y pose del objeto dentro del rango visto en los episodios de entrenamiento.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de rollout, entrenamiento y visualización de datasets.

## Casos de uso

- Manipulación pick-and-place en laboratorio: el modelo puede ejecutar la tarea de recoger un objeto (pato) y colocarlo en una posición objetivo (cuenco), útil para automatizar experimentos de robótica de manipulación.
- Evaluación de políticas VLA con modelo de mundo: investigadores pueden usar este checkpoint como referencia para comparar el rendimiento de VLA-JEPA frente a otros VLA en tareas de mesa con un robot `so_follower`.
- Desarrollo de pipelines de imitación con LeRobot: sirve como ejemplo completo de entrenamiento y despliegue de una política VLA-JEPA, desde la grabación de datos hasta el rollout en robot real.
- Benchmarking de generalización a partir de pocos episodios: con solo 32 episodios de entrenamiento, es útil para estudiar la eficiencia de datos de las arquitecturas con modelo de mundo.
- Integración en sistemas de automatización de laboratorio: el robot puede realizar tareas repetitivas de clasificación o colocación de objetos bajo control por lenguaje, reduciendo intervención humana.
- Investigación en planificación de largo horizonte: al incorporar predicción de video latente, el modelo es adecuado para experimentos que requieren anticipar consecuencias de acciones antes de ejecutarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación en robot real ni comparaciones con otros modelos. No se dispone de datos de éxito, precisión ni latencia medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.770 millones de parámetros, en FP32 se necesitan aproximadamente 11 GB, en FP16 unos 5,5 GB y en int8 unos 2,8 GB (estimaciones teóricas; el modelo se distribuye en safetensors sin cuantizar).
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070/4060) para FP16, o 12-16 GB (RTX 3080/4090) para FP32. Para entrenamiento, se recomienda una GPU con 24 GB o más (RTX 3090/4090, A5000).
- Compatibilidad con GPUs de consumo: sí, el tamaño del modelo permite ejecutarlo en GPUs de gama media-alta para inferencia, siempre que se use FP16 o cuantización.
- Opciones de despliegue: el modelo está pensado para usarse con LeRobot, que soporta inferencia en PyTorch con CUDA. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. La inferencia depende del hardware, del tamaño de las imágenes (480×640) y del número de pasos de flow-matching del head DiT.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint concreto. Sin embargo, por su naturaleza VLA, se puede situar en la misma categoría que otros modelos de visión-lenguaje-acción como:

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| VLA-JEPA (este) | 2.77B | Qwen3-VL + V-JEPA2 + DiT | no disponible | Apache 2.0 |
| Pi05 (π₀.₅) | no disponible | VLA con generalización open-world | no disponible | no disponible |
| OpenVLA | 7B | Prismatic (Llama 2 + ViT) | 2048 tokens | MIT (pesos) |

Nota: los datos de Pi05 y OpenVLA provienen de información pública general y no de una comparativa directa con este modelo. No se han encontrado benchmarks que comparen estos modelos en la misma tarea.

## Limitaciones y advertencias

- Dataset muy reducido: solo 32 episodios para una única tarea, lo que limita la generalización a otras tareas, objetos o entornos.
- Sin evaluación publicada: la model card indica explícitamente que no hay resultados de evaluación en robot real; el rendimiento real es desconocido.
- Dependencia de dos cámaras fijas: el modelo requiere exactamente las mismas configuraciones de cámara (frontal y brazo) con las que fue entrenado; cambios de iluminación, fondo o posición de cámara pueden degradar el rendimiento.
- Riesgo de sobreajuste: con 2.77B parámetros y solo 16.288 frames, es probable que el modelo memorice los episodios de entrenamiento en lugar de aprender una política generalizable.
- Sin soporte multilingüe declarado: aunque Qwen3-VL es multilingüe, no se especifica qué idiomas soporta la instrucción en este checkpoint.
- Sin cuantizaciones oficiales: no se ofrecen versiones GGUF, ONNX ni cuantizadas; el despliegue en hardware limitado requerirá cuantización manual.
- Uso comercial permitido: la licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin resultados de seguridad en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grigorij/PaP_duck_vla_jepa
- Dataset de entrenamiento: https://huggingface.co/datasets/Grigorij/PaP_duck
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Grigorij/PaP_duck
- Paper VLA-JEPA (arXiv 2602.10098): https://arxiv.org/abs/2602.10098
- Repositorio GitHub de VLA-JEPA: https://github.com/ginwind/VLA-JEPA
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de VLA-JEPA en LeRobot: https://huggingface.co/docs/lerobot/main/en/vla_jepa
