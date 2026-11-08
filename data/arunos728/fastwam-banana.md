# arunos728/fastwam-banana

## Resumen

FastWAM — Banana es un modelo de mundo (world model) para robótica desarrollado por el usuario arunos728 y publicado en Hugging Face bajo licencia Apache 2.0. No es una política de control (VLA) al uso: se trata de un modelo que denoisa conjuntamente vídeo futuro y acciones futuras a partir de una observación de dos cámaras, de modo que predice tanto la evolución visual de la escena como el movimiento del brazo robótico. Está construido sobre el backbone de vídeo DiT Wan-AI/Wan2.2-TI2V-5B.

El modelo se ha entrenado sobre un corpus de una única tarea y una única encarnación robótica: 54 episodios de teleoperación de un brazo `openarm_inspire_right` con mano Inspire, todos con la instrucción "Place the banana into the basket". El checkpoint final contiene 6,02 B parámetros en bf16 (5,00 B del experto de vídeo y 1,02 B del experto de acción) distribuidos en una arquitectura Mixture-of-Transformers de 30 capas y dos expertos.

Su relevancia es acotada pero técnicamente interesante: ejemplifica el uso de modelos de difusión de vídeo preentrenados a gran escala como base para modelos de mundo en manipulación robótica, con una separación explícita entre predicción visual y predicción de acciones. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (DiT de vídeo), 30 capas, dos expertos |
| Parametros totales | 6,02 B (5,00 B experto de vídeo + 1,02 B experto de acción) |
| Parametros activos | no disponible (no es MoE disperso; ambos expertos se ejecutan) |
| Longitud de contexto | no disponible (tokenizador de texto con longitud máxima 128; clip de vídeo de 33 fotogramas) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | no disponible (el codificador de texto no se carga; se consumen embeddings `context`/`context_mask` precalculados) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pt` (PyTorch, bf16), 12 GB de repositorio |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Mixture-of-Transformers con 30 capas y dos expertos diferenciados. El experto de vídeo (5,00 B parámetros, dimensión oculta 3072, FFN 14336, 24 cabezas) se inicializa desde el DiT de vídeo Wan2.2-TI2V-5B; el experto de acción (1,02 B parámetros) procesa el estado y las acciones del robot. La observación se compone de dos cámaras (`ego_left`, `ego_right`) con fotogramas de 3×192×320 apilados verticalmente en un lienzo de 384×320, con clips de 33 fotogramas y una relación de frecuencia acción/vídeo de 4. El estado y la acción son vectores de 13 dimensiones cada uno. El tokenizador asociado es el de Wan2.1-T2V-1.3B con longitud máxima 128, aunque el codificador de texto no se carga en inferencia.

El entrenamiento se realizó sobre 54 episodios (16.202 fotogramas a 30 fps, formato LeRobot v2.1) con una única instrucción. Se usaron 4 GPU NVIDIA H100 de 80 GB con DeepSpeed ZeRO-1, batch global de 64, 30.000 pasos (aproximadamente 125 épocas), learning rate 1e-4 con decaimiento coseno, precisión bf16, weight decay 0.01 y clipping de norma de gradiente 1.0. La pérdida final (media de los últimos 20 registros) fue de 0,0077 total, con 0,0071 en el término de vídeo y 0,0006 en el de acción, lo que indica que el objetivo está dominado por la predicción visual. El checkpoint se verificó con CRC completo, 1.649 tensores sin NaN ni Inf y recuento de parámetros idéntico al de `step_020000.pt`.

## Capacidades

- Predicción conjunta de vídeo futuro y acciones futuras a partir de observaciones de dos cámaras (modelo de mundo, no política).
- Denoising difusivo sobre un espacio latente de vídeo heredado de Wan2.2-TI2V-5B.
- Modelado de dinámica de manipulación de un brazo con mano antropomórfica (13-D de estado y acción).
- Generación de rollouts de vídeo condicionados por instrucción textual (mediante embeddings precalculados).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües declaradas.
- No dispone de modo thinking, visión general, audio ni otras modalidades fuera de vídeo y acciones.

## Casos de uso

- Investigación en modelos de mundo para robótica: servir como base para estudiar cómo un DiT de vídeo preentrenado puede adaptarse a la predicción de dinámicas de manipulación, comparando el experto de vídeo con el de acción.
- Generación de datos sintéticos de entrenamiento: los rollouts de vídeo pueden emplearse para aumentar corpus de manipulación de una sola tarea antes de entrenar una política downstream.
- Evaluación de planificadores basados en modelo: usar el modelo como simulador aprendido para puntuar trayectorias candidatas de un brazo en la tarea "Place the banana into the basket".
- Estudio de arquitecturas Mixture-of-Transformers: analizar la separación entre experto visual y experto de acción y su efecto en la pérdida de cada término.
- Reproducción de experimentos: el `config.yaml` resuelto y `dataset_stats.json` permiten replicar las condiciones de entrenamiento con el corpus original de LeRobot v2.1.
- Docencia y divulgación: ejemplo didáctico de adaptación de un modelo de difusión de vídeo a robótica con un corpus pequeño (54 episodios) y cómputo moderado (4×H100).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de entrenamiento (loss total 0,0077; loss_video 0,0071; loss_action 0,0006) y rollouts cualitativos en `eval/`, que son teacher-forced y no constituyen evaluación en bucle cerrado sobre robot real.

## Requisitos de hardware

- El checkpoint ocupa 12 GB en bf16 (6,02 B parámetros), por lo que la inferencia en bf16 requiere al menos ~12-14 GB de VRAM solo para pesos, más memoria para activaciones y latentes de vídeo.
- GPU de entrenamiento utilizadas: 4× NVIDIA H100 80 GB con DeepSpeed ZeRO-1 (pico de 65,5 GiB por GPU sobre 79,2 GiB disponibles).
- Cabe en GPUs de consumo con suficiente VRAM para bf16, como RTX 4090 (24 GB) o RTX 5090; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo se distribuye como checkpoint PyTorch (`.pt`) para cargar con la librería LeRobot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM — Banana | 6,02 B (5,00 B vídeo + 1,02 B acción) | Clip de 33 fotogramas; texto máx. 128 | Modelo de mundo para manipulación de una tarea | Apache 2.0 | Hugging Face (arunos728/fastwam-banana) |
| Wan-AI/Wan2.2-TI2V-5B | 5 B (backbone) | no disponible | Generación de vídeo texto-imagen a vídeo | no disponible en la información proporcionada | Hugging Face |
| Políticas VLA (p. ej. OpenVLA, RT-2) | no disponible | no disponible | Control robótico end-to-end | no disponible | no disponible |

La comparación con políticas VLA es solo categórica: FastWAM predice vídeo y acciones conjuntamente, mientras que una VLA mapea observación a acción directamente. No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una única tarea ("Place the banana into the basket") y una única encarnación (`openarm_inspire_right`); no generaliza a otras instrucciones ni robots sin reentrenamiento.
- Diseño de cámaras fijo: el compuesto vertical de 384×320 está integrado en la forma de entrada.
- El codificador de texto no se carga; es obligatorio suministrar `context` y `context_mask` precalculados como en entrenamiento.
- `dataset_stats.json` es imprescindible para normalizar correctamente las entradas; sin él hay que recalcular las estadísticas desde el corpus original.
- No se incluye estado del optimizador: el checkpoint sirve para inferencia y evaluación, pero no para reanudar entrenamiento.
- No se reportan métricas de evaluación en robot real; las pérdidas son de entrenamiento y los vídeos de `eval/` son rollouts teacher-forced.
- El trabajo de entrenamiento figura como `FAILED` (código de salida 2) en el sistema de colas, aunque el autor documenta que el fallo fue posterior a la escritura del checkpoint y que este se verificó con CRC, 1.649 tensores sin NaN/Inf y recuento de parámetros consistente.
- Riesgo de alucinación visual: al ser un modelo generativo de vídeo, puede producir predicciones plausibles pero físicamente incorrectas.
- Sesgos: no documentados; el corpus es de 54 episodios de un único operador y entorno.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones técnicas hacen inviable su uso en producción fuera del ámbito de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arunos728/fastwam-banana
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Tokenizador referenciado: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Librería LeRobot: no disponible en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
