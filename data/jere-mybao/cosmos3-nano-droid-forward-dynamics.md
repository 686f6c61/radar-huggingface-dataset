# jere-mybao/cosmos3-nano-droid-forward-dynamics

## Resumen

Cosmos3-Nano DROID Forward Dynamics es un modelo de mundo (world model) de dinámica directa condicionado por acciones, desarrollado por jere-mybao como post-entrenamiento de `nvidia/Cosmos3-Nano` sobre el dataset `nvidia/Cosmos3-DROID`. Su función es predecir los 16 frames de vídeo que resultan de una secuencia de 16 acciones del efector final de un robot Franka, dado únicamente el primer frame de la escena. Es una herramienta de simulación de consecuencias físicas, pensada para el ámbito de la robótica y la inteligencia artificial física (Physical AI).

La arquitectura es una mezcla de transformadores (mixture-of-transformers) con dos torres: una de entendimiento (`und`) y otra de generación (`gen`). El modelo completo tiene 15.173.136.576 parámetros (15,17 B) en bf16, aunque NVIDIA describe la variante base como «8B» contando una sola torre. La ventana de entrenamiento es de 17 frames a 15 fps, aproximadamente 1,07 segundos, lo que limita su uso a horizontes muy cortos sin extrapolación. Su relevancia actual radica en permitir que sistemas robóticos anticipen el resultado de una secuencia de acciones antes de ejecutarlas, facilitando la planificación y la validación de políticas de control.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-transformers con torre de entendimiento (`und`) y torre de generación (`gen`) |
| Parametros totales | 15.173.136.576 (15,17 B) |
| Parametros activos | No aplica (no es mixture-of-experts) |
| Longitud de contexto | 17 frames de vídeo a 15 fps (≈1,07 s) |
| Tipos de cuantizacion | bf16 (pesos publicados) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | OpenMDW 1.1 (`openmdw1.1-license`) |
| Formato de pesos | safetensors (30,3 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Nano`, una red mixture-of-transformers con dos torres. En este post-entrenamiento, únicamente se adaptó la torre de generación y los adaptadores de acción/vídeo; la torre de entendimiento y los pesos compartidos permanecieron prácticamente intactos, con cambios del orden de 1e-6, es decir, a nivel de redondeo de bf16. La diferencia de 356 tensores respecto al modelo base no implica pesos faltantes: la configuración usa `vlm_config.include_visual = False` y no incluye rama de audio, por lo que la torre visual Qwen (`language_model.visual.*`, 351 tensores) y el puente de audio (`llm2sound`, `sound2llm`, `sound_modality_embed`) no forman parte del checkpoint. La condición de imagen llega al modelo a través del VAE de Wan y de la proyección `vae2llm`.

El entrenamiento se realizó durante 20.000 iteraciones con `data_parallel_shard_degree=8`, en bf16 y en un solo nodo. Se publicaron los pesos EMA (`net_ema`), que son los que el framework carga por defecto al usar `use_ema_weights=True`. Cada muestra de entrenamiento está compuesta por 17 frames de vídeo y 16 acciones: la acción `t` lleva la escena del frame `t` al frame `t+1`. El tokenizador de vídeo está configurado para codificar exactamente 17 frames, lo que confirma de forma independiente la ventana de 17 frames observados.

## Capacidades

- Predicción de vídeo condicionada por acciones (forward dynamics): a partir del primer frame de una escena y de 16 acciones del efector final, genera los 16 frames resultantes.
- Predicción conjunta de tres vistas de cámara: el modelo genera un canvas compuesto con la vista de muñeca (`wrist_image_left`) a ancho completo y dos vistas exteriores (`exterior_image_1_left` y `exterior_image_2_left`) reescaladas a la mitad y concatenadas horizontalmente. El canvas resultante se mapea a una resolución de 544 x 736.
- Integración en pipelines de robótica: puede utilizarse como modelo de mundo para evaluar el resultado de una secuencia de acciones antes de ejecutarla en un entorno real.
- No incluye generación de texto, audio, razonamiento simbólico ni soporte de tool calling; es exclusivamente un modelo de mundo para vídeo y robótica.

## Casos de uso

- Simulación de trayectorias robóticas: dado el estado inicial de una escena y una secuencia de 16 acciones, el modelo genera el vídeo resultante, permitiendo validar la acción en un entorno simulado antes de desplegarla en el robot real.
- Planificación de manipulaciones con Franka DROID: el modelo fue entrenado específicamente con el dataset DROID, por lo que es adecuado para evaluar tareas de manipulación con este tipo de brazo robótico en entornos de laboratorio.
- Desarrollo de políticas de control: puede usarse como predictor de dinámica para entrenar o evaluar políticas que operen en ventanas cortas de aproximadamente un segundo, mejorando la robustez de los controladores.
- Monitoreo de seguridad en tiempo de ejecución: al predecir el resultado de una secuencia de acciones, puede utilizarse para detectar colisiones o fallos inminentes antes de que ocurran, siempre dentro de la ventana de 1,07 segundos.
- Generación de datos sintéticos de entrenamiento: el modelo puede producir vídeos de manipulación para alimentar otros sistemas de visión o control en robótica, reduciendo la necesidad de capturar datos reales.
- Investigación en world models: sirve como referencia para estudiar la predicción de vídeo condicionada por acciones y el comportamiento de modelos de mundo con ventanas temporales muy cortas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 30,3 GB. Con overhead de activaciones, se estima una VRAM mínima de unos 40 GB para inferencia en precisión bf16.
- GPU recomendadas: no disponible en la información proporcionada. A partir del peso del modelo, una NVIDIA A100 80 GB o H100 80 GB sería adecuada.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) sin cuantización, y no se han publicado pesos cuantizados.
- Opciones de despliegue: el checkpoint está en formato safetensors y se asocia a la librería cosmos. El ecosistema de NVIDIA Cosmos 3 permite desplegar modelos mediante contenedores NIM, pero no hay confirmación de que este checkpoint específico esté soportado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jere-mybao/cosmos3-nano-droid-forward-dynamics | 15,17 B | 17 frames (≈1,07 s) | OpenMDW 1.1 | HuggingFace |
| nvidia/Cosmos3-Nano | 15,75 B | No disponible | No disponible | HuggingFace |
| nvidia/Cosmos3-Nano-Policy-DROID | No disponible | No disponible | No disponible | HuggingFace |

El modelo presentado es un post-entrenamiento de `nvidia/Cosmos3-Nano`, con una diferencia de parámetros debida a la eliminación de la torre visual y del puente de audio. Frente al modelo de política `nvidia/Cosmos3-Nano-Policy-DROID`, que genera comandos de acción, este modelo predice el vídeo resultante de dichas acciones, por lo que ambos son complementarios en un pipeline de control.

## Limitaciones y advertencias

- Ventana temporal limitada: el modelo fue entrenado con 17 frames a 15 fps, unos 1,07 segundos. Cualquier uso más allá de ese horizonte es extrapolación y no está caracterizado; el autor advierte que puede producir vídeo plausible pero físicamente incorrecto.
- Predicción conjunta de tres vistas: no es posible solicitar una vista individual sin cambiar la geometría de entrada para la que fue entrenado. Las tres vistas se denoising conjuntamente y deben mantenerse en el mismo canvas.
- Sensibilidad al formato de acciones: un formato de acción incorrecto puede generar vídeo fluido pero con dinámica errónea, sin que el modelo dé señales de error.
- Sesgo del dataset: el modelo fue entrenado en el dataset `nvidia/Cosmos3-DROID`, que cubre escenas de manipulación con robots Franka. La generalización a otros robots, entornos o tareas no está garantizada.
- Sin soporte de audio ni de encodificador visual de lenguaje: la condición de imagen se inyecta vía VAE, no a través de un vision encoder de lenguaje, por lo que no se beneficia de la semántica de un modelo multimodal estándar.
- Licencia OpenMDW 1.1: debe revisarse detalladamente si permite uso comercial y en qué condiciones antes de desplegarlo en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/jere-mybao/cosmos3-nano-droid-forward-dynamics
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Cosmos3-DROID
- Modelo de política relacionado: https://huggingface.co/nvidia/Cosmos3-Nano-Policy-DROID
- Blog de NVIDIA sobre Cosmos 3: https://developer.nvidia.com/blog/develop-physical-ai-reasoning-world-and-action-models-with-nvidia-cosmos-3/
