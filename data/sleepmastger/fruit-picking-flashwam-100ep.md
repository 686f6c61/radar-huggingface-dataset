# SleepMastger/fruit-picking-flashwam-100ep

## Resumen
El modelo `fruit-picking-flashwam-100ep` es un checkpoint de robótica de la familia FlashWAM, publicado por el usuario SleepMastger. Se trata de un modelo de visión-lenguaje-acción (VLA) entrenado desde cero durante 100 épocas (59.200 pasos de optimización) para la tarea concreta de levantar una tapa, apartarla y recoger una ciruela negra. El entrenamiento se realizó sobre un conjunto de 95 episodios con una partición de validación del 5%, y el repositorio publica únicamente dos checkpoints seleccionados (épocas 60 y 90) elegidos para evitar el sobreajuste.

La arquitectura combina un experto de vídeo base Wan2.2 con un experto de acción de una capa, usando atención con fusión de clave-valor (fused-KV), RoPE fija y máscaras causales específicas. El modelo no ha sido evaluado en un robot real y la polaridad del gripper (señal `-1/+1`) aún no está confirmada. Es un bundle de archivo público que incluye el código de entrenamiento, la configuración resuelta y las estadísticas de normalización, pero no es un modelo independiente: requiere los componentes base de Wan2.2-TI2V-5B y el código FastWAM.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | FlashWAM M1 (experto de vídeo Wan2.2 + experto de acción de 1 capa) |
| Parametros totales | no disponible (el checkpoint referencia Wan2.2-TI2V-5B, por lo que el total supera los 5B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128 tokens de texto (embedding T5 cacheado); contexto de vídeo: 33 observaciones (horizonte) |
| Tipos de cuantizacion | no disponible (checkpoints en bf16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la model card no especifica idiomas; el texto de condicionamiento está en inglés) |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | PyTorch `.pt` (pickle), no safetensors ni GGUF |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura FlashWAM M1, que combina un experto de vídeo base (Wan2.2, con atención de vídeo y texto) con un experto de acción de una sola capa. El experto de acción recibe la entrada de texto mediante cross-attention y produce acciones de 7 dimensiones (delta XYZ, delta rotación XYZ y apertura del gripper). La atención de vídeo usa máscara causal en el primer fotograma (`first_frame_causal`) y la atención del grupo de acción usa máscara diagonal de grupo (`group_diagonal`). El modelo se entrenó desde cero, con el experto de acción inicializado aleatoriamente y el experto de vídeo basado en Wan2.2.

El entrenamiento se realizó con 4 GPUs, tamaño de lote global 32 (4×8), tasa de aprendizaje coseno de 1e-4, weight decay 1e-2, precisión bf16 y checkpointing cada 10 épocas. Se usó un embedding de texto T5 cacheado (longitud de contexto 128) y se desactivó el cargador de texto en la configuración. Las entradas son dos cámaras RGB de 256×256 (agentview y wrist) redimensionadas a 224×224 y concatenadas horizontalmente a 224×448. El estado original de 15 dimensiones se convirtió a 8 (posición XYZ del efector, rotación en axis-angle de 3, y dos valores de apertura del gripper). La acción es de 7 dimensiones con el canal del gripper absoluto en lugar de delta.

## Capacidades
- Generación de acciones de robótica para manipulación: el modelo predice trayectorias de 7 dimensiones (posición, rotación y apertura del gripper) a partir de observaciones visuales y un comando textual.
- Procesamiento de vídeo multi-cámara: acepta dos flujos de vídeo (cámara principal y cámara de muñeca) concatenados horizontalmente, con un horizonte de 33 observaciones.
- Comprensión de instrucciones en lenguaje natural: el texto de condicionamiento se procesa mediante un embedding T5 cacheado (contexto 128) y se integra vía cross-attention en el experto de acción.
- Ejecución de tareas específicas de recogida de fruta: el modelo está entrenado para la tarea concreta de "levantar la tapa, apartarla y recoger la ciruela negra".
- Inferencia con máscaras de atención causales: permite el procesamiento autoregresivo de fotogramas de vídeo y acciones.
- Soporte de normalización de datos: incluye `dataset_stats.json` con estadísticas min/max para normalizar entradas y salidas.

## Casos de uso
- Automatización de recogida de fruta en entornos controlados: el modelo puede integrarse en un brazo robótico para realizar la secuencia de levantar una tapa, apartarla y recoger una ciruela, usando dos cámaras (vista global y de muñeca) para guiar el movimiento.
- Investigación en modelos VLA para manipulación: sirve como punto de partida para estudiar el comportamiento de la arquitectura FlashWAM en tareas de precisión, especialmente por su diseño de experto de acción de una capa.
- Desarrollo de pipelines de entrenamiento para robótica: el repositorio incluye el código de entrenamiento completo, la configuración resuelta y el script de lanzamiento, lo que permite reproducir o adaptar el entrenamiento a otras tareas.
- Evaluación de estrategias de regularización y selección de checkpoints: al publicar solo los checkpoints pre-sobreajuste (épocas 60 y 90), se puede analizar la curva de validación y el efecto del sobreajuste en tareas de manipulación.
- Benchmarking de arquitecturas de atención con fusión KV y máscaras causales: el modelo permite comparar el rendimiento de FlashWAM M1 frente a otras arquitecturas VLA en tareas similares.
- Estudio de la transferencia de representaciones de vídeo a control de bajo nivel: al usar un experto de vídeo preentrenado (Wan2.2) y un experto de acción aleatorio, se puede investigar cuánto conocimiento visual se transfiere al control motor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación en simulación ni en robot real, y no se proporcionan comparativas con otros modelos.

## Requisitos de hardware
- No se especifican requisitos oficiales de hardware en la model card. El entrenamiento se realizó con 4 GPUs, pero no se indica el modelo concreto.
- El checkpoint tiene un tamaño de 20.3 GB en el repositorio, lo que sugiere que la inferencia requiere una GPU con al menos 24 GB de VRAM en bf16 (considerando que el modelo base Wan2.2-TI2V-5B tiene ~5B parámetros).
- Para inferencia en tiempo real con dos cámaras y un horizonte de 33 observaciones, se recomienda una GPU de alta gama (por ejemplo, RTX 4090, A100 o H100).
- No se proporcionan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, etc.). Dado que es un modelo de robótica con entradas de vídeo, probablemente se ejecute con PyTorch y el código FastWAM incluido.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se dispone de información suficiente para establecer una comparativa con otros modelos VLA (como OpenVLA, RT-2 o π0). La model card no menciona resultados comparativos ni se han publicado benchmarks. Se recomienda consultar la documentación de FlashWAM en GitHub para posibles comparaciones con la familia de modelos WAM.

## Limitaciones y advertencias
- El modelo no ha sido evaluado en un robot real; la model card indica explícitamente que "no se ha evaluado en un robot" y que el significado físico de la polaridad del gripper (`-1/+1`) aún necesita confirmación.
- El repositorio solo contiene dos checkpoints (épocas 60 y 90) de un total de diez (cada 10 épocas). Los demás checkpoints no están publicados, lo que limita la reproducibilidad completa del estudio de sobreajuste.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o modificación.
- Los archivos `.pt` pueden contener objetos serializados con pickle; la model card advierte que solo deben cargarse en entornos de confianza.
- El modelo no es independiente: requiere los componentes base de Wan2.2-TI2V-5B (VAE, tokenizador) y el código FastWAM. La licencia de estos componentes puede tener términos adicionales.
- El texto de condicionamiento está fijado a una única instrucción en inglés ("Lift the lid, put it aside, and pick the black plum"); no se ha demostrado generalización a otras instrucciones o tareas.
- La normalización de datos se calculó sobre el split de entrenamiento de 95 episodios; aplicar el modelo a datos con distribuciones diferentes puede degradar el rendimiento.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/SleepMastger/fruit-picking-flashwam-100ep
- Repositorio HuggingFace de la versión parcial (30 épocas): https://huggingface.co/SleepMastger/fruit-picking-flashwam
- Código FlashWAM (GitHub): https://github.com/NU-World-Model-Embodied-AI/Flash-WAM
