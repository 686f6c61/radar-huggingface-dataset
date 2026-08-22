# pufanyi/VBVR-Pro-Wan2.2-TI2V-5B-Qwen-Judge-RL

## Resumen

VBVR-Pro-Wan2.2-TI2V-5B-Qwen-Judge-RL es un modelo de generación de vídeo condicionado por imagen (image-to-video) desarrollado por pufanyi, que parte del checkpoint Wan2.2-TI2V-5B-Diffusers de Alibaba y lo optimiza mediante aprendizaje por refuerzo (reinforcement learning) con un modelo juez de vídeo directo, concretamente Qwen3.6-27B. El objetivo es mejorar las capacidades de razonamiento visual del modelo base: dado un primer fotograma y una instrucción en lenguaje natural, el modelo debe generar una secuencia de vídeo coherente que resuelva la tarea especificada (por ejemplo, mover un objeto señalado a un destino concreto).

La arquitectura subyacente es un Diffusion Transformer (DiT) de aproximadamente 5 mil millones de parámetros, con un VAE Wan2.2 de compresión 16×16×4 y un pipeline Diffusers completo que incluye transformer, text encoder, tokenizer, VAE y scheduler. El modelo se entrenó con la técnica Flow-CPS (coefficient 0.7) sobre el dataset VBVR-Pro-RL, dirigido a tareas de razonamiento visual en vídeo a resolución 512×512 y 81 fotogramas. Su relevancia reside en que es un artefacto de investigación que demuestra cómo el RL con recompensas basadas en VLM puede mejorar la generación de vídeo con razonamiento, sin necesidad de cambiar los pesos del generador, solo el sampler de inferencia.

La licencia es Apache 2.0, lo que permite uso comercial con atribución, y los idiomas soportados son inglés y chino. El repositorio incluye un pipeline personalizado que expone seis configuraciones de muestreo evaluadas en el paper VBVR-Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de Wan2.2 TI2V-5B, con VAE 16×16×4 |
| Parametros totales | 4.999.793.712 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación de vídeo, no texto) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 y float32 para VAE) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Diffusers) |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint Wan2.2-TI2V-5B-Diffusers de Huawei, que emplea un transformer de difusión con flujo (flow matching) y un VAE de compresión 16×16×4. La optimización se realizó mediante aprendizaje concreto (RL) con rollouts Flow-CPS: el generador produce vídeos de 81 fotogramas a 512×512, y un recompensador VLM (Qwen3.6-27B) evalúa cada vídeo con rúbricas específicas de tarea para proporcionar una señal de recompensa directa. El entrenamiento se llevó a cabo con un coeficiente Flow-CPS de 0.7, sobre el dataset VBVR-Pro-RL (revisión `ca0aaffea93b07d269c6fe2fbfe533f1fdab9aa1`). El pipeline incluye un scheduler UniPC que se conserva del modelo base, y la clase personalizada `pipeline.py` subclasea `WanImageToVideoPipeline` para preservar el condicionamiento oficial de primer fotograma y la máscara de timesteps expandida de TI2V-5B.

La innovación clave es el uso de un juez de vídeo directo como recompensador, en lugar de métricas heurísticas, lo que permite optimizar el modelo para tareas de razonamiento visual que requieren comprender la escena y ejecutar una acción coherente en el tiempo. El repositorio no incluye los pesos del juez Qwen, que no son necesarios para la inferencia.

## Capacidades

- Generación de vídeo condicionada por imagen: dado un fotograma inicial y una instrucción textual, produce una secuencia de vídeo de hasta 81 fotogramas (configurable) que resuelve la tarea descrita.
- Razonamiento visual: el modelo está optimizado para tareas que requieren entender la relación entre objetos en la imagen y ejecutar transformaciones espaciales o temporales (por ejemplo, mover un objeto marcado a un destino).
- Múltiples samplers de inferencia: expone seis métodos de muestreo (Flow-CPS con coeficientes 0.1, 0.3, 0.7, 0.9; Euler ODE; UniPC ODE), seleccionables por llamada sin cambiar los pesos del modelo.
- Compatibilidad con Diffusers estándar: puede cargarse como `WanImageToVideoPipeline` sin código remoto, además del pipeline personalizado `pipeline.py`.
- Soporte multilingüe: prompts en inglés y chino.
- Capacidades de visual reasoning: entrenado con recompensas de VLM para tareas de razonamiento visual en vídeo, no solo generación estética.

## Casos de uso

- Investigación en razonamiento visual con vídeo: el modelo es útil para experimentos académicos que necesitan un generador de vídeo que ejecute tareas de manipulación de objetos basadas en instrucciones, como mover elementos a posiciones objetivo.
- Evaluación de agentes de vídeo: sirve como generador de trayectorias de vídeo sintéticas para entrenar o evaluar sistemas de razonamiento visual o planificación de movimiento.
- Prototipado de generación de vídeo condicionada a imagen: en entornos de investigación, permite probar cómo el RL con recompensadores VLM afecta a la calidad y coherencia de la generación de vídeo frente al modelo base.
- Desarrollo de pipelines de video con Diffusers: el código `pipeline.py` es un ejemplo de cómo extender `WanImageToVideoPipeline` con múltiples samplers, útil para ingenieros que necesitan integrar diferentes estrategias de muestreo en un solo pipeline.
- Evaluación de samplers de difusión: los seis modos de muestreo (CPS, Euler, UniPC) permiten comparar el efecto de la estocasticidad en la calidad y diversidad de los vídeos generados, útil para estudios de ablación.
- Generación de contenido visual con instrucciones de razonamiento: aunque es un artefacto de investigación, puede emplearse para crear vídeos cortos donde un objeto debe moverse según una instrucción textual, por ejemplo en entornos de simulación o demos interactivas.

## Benchmarks y rendimiento

Según la model card, el modelo se evaluó en VBVR-Pro-Bench con las siguientes configuraciones (resolución 512×512, 81 fotogramas, 16 FPS, 30 pasos de inferencia, guidance scale 1.0). Las puntuaciones son agregadas de la Tabla 8 del paper VBVR:

| Sampler | Método de inferencia | Coeficiente CPS | Puntuación (VBVR-Pro-Bench) |
|---|---|---|---|
| `cps-0.1` | Flow-CPS | 0.1 | 0.482 |
| `cps-0.3` | Flow-CPS | 0.3 | 0.493 |
| `cps-0.7` | Flow-CPS | 0.7 | 0.508 |
| `cps-0.9` | Flow-CPS | 0.9 | **0.509** |
| `euler` | FlowMatch Euler ODE | — | 0.488 |
| `unipc` | UniPC ODE | — | 0.497 |

La puntuación más alta se obtiene con CPS 0.9, aunque el modelo fue entrenado con coeficiente 0.7. No se incluyen comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se indica explícitamente, pero el repo completo pesa 32.8 GB; el transformer se carga en bfloat16 y el VAE en float32, lo que sugiere que la inferencia requiere al menos 24-32 GB de VRAM en una GPU como RTX 4090 o A100.
- GPU recomendadas: se menciona que Wan2.2 puede ejecutarse en GPUs de consumo como la 4090, aunque con la carga completa del pipeline es recomendable activar `enable_model_cpu_offload()` en GPUs más pequeñas.
- Opciones de despliegue: Diffusers (0.37.1 o superior) con `WanImageToVideoPipeline` o el pipeline personalizado `pipeline.py` con `trust_remote_code=True`. No se mencionan vLLM, llama.cpp ni Ollama porque es un modelo de generación de vídeo, no de texto.
- Latencia y throughput: no disponible; depende de la GPU, el sampler y el número de pasos (30 por defecto).
- Nota: el pipeline personalizado carga código Python del repositorio, por lo que en producción se recomienda revisar `pipeline.py`, usar `trust_remote_code=True` y fijar una `revision` revisada.

## Comparativa con modelos similares

La información disponible no incluye comparaciones directas con otros modelos de generación de vídeo con razonamiento. Como referencia, se puede comparar con el modelo base Wan2.2-TI2V-5B-Diffusers, del cual deriva:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VBVR-Pro Wan2.2 TI2V-5B (este) | ~5B | 512×512, 81 fotogramas | I2V + razonamiento visual | Apache 2.0 | Diffusers |
| Wan2.2-TI2V-5B-Diffusers | ~5B | 512×512, 81 fotogramas | I2V | Apache 2.0 | Diffusers |
| Wan2.2-TI2V-5B (original) | ~5B | 720P, 24fps | T2V e I2V | Apache 2.0 | GitHub, Diffusers |

La diferencia clave es que VBVR-Pro está optimizado con RL para tareas de razonamiento visual, mientras que el modelo base se centra en la generación general de vídeo. No hay datos de benchmarks comparativos entre ambos en la información disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el modelo puede producir trayectorias de razonamiento incorrectas o visualmente incoherentes, según la propia model card.
- Degradación de fondo: con coeficientes CPS altos (mayor estocasticidad), se observa una degradación del fondo gris en algunos outputs, como indica el paper.
- Sesgos heredados: el modelo hereda las limitaciones y posibles sesgos del modelo base Wan2.2-TI2V-5B, que no se documentan en detalle.
- Reproducibilidad: los bytes exactos de salida pueden variar con PyTorch, Diffusers, backend de atención, dtype y dispositivo.
- Requisitos de memoria: cargar el pipeline completo requiere memoria sustancial de CPU y acelerador; el offloading de CPU es recomendado en GPUs pequeñas.
- Uso comercial: licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no está garantizado para producción.
- Soporte de idiomas: solo en y zh; no hay garantías para otros idiomas.
- Configuración de evaluación: los resultados de benchmarks solo son comparables bajo las condiciones recomendadas (512×512, 81 fotogramas, 30 pasos, guidance 1.0); otros ajustes pueden producir resultados diferentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pufanyi/VBVR-Pro-Wan2.2-TI2V-5B-Qwen-Judge-RL
- Modelo base en Hugging Face: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Repositorio GitHub de Wan2.2: https://github.com/Wan-Video/Wan2.2
- Repositorio GitHub de VBVR-Wan2.2: https://github.com/Video-Reason/VBVR-Wan2.2
- Dataset de entrenamiento: https://huggingface.co/datasets/Video-Reason/VBVR-Pro-RL
- Código de entrenamiento: https://github.com/pufanyi/vbvr-rl
