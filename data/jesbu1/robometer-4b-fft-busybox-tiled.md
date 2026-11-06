# jesbu1/robometer-4b-fft-busybox-tiled

## Resumen

Robometer 4B FFT BusyBox Tiled es un modelo de recompensa (reward model) derivado de Qwen/Qwen3-VL-4B-Instruct mediante un ajuste fino completo (full fine-tune) sobre Robometer-4B. Lo publica el usuario jesbu1 en Hugging Face y está especializado en evaluar trayectorias de manipulación robótica a partir de vídeo multi-vista. Su función no es generar texto, sino asignar una puntuación de progreso o éxito a una secuencia de observaciones, lo que lo hace útil como componente de evaluación o de aprendizaje por refuerzo en pipelines de robótica.

El modelo hereda la arquitectura multimodal Qwen3-VL de 4B parámetros (4.447.004.940 parámetros reales según safetensors) y la adapta a una tarea concreta: la tarea `push the green button` del entorno AutoRLBench SO-101. La entrada esperada es un único fotograma RGB de 640x540 en el que se han embaldosado (tiled) tres vistas sincronizadas de 426x240 (`top`, `front`, `wrist`), manteniendo cada panel su relación de aspecto original de ~1,78.

Es relevante ahora porque los reward models específicos de tarea son un cuello de botella habitual en RL y en evaluación automática de políticas robóticas. Este checkpoint demuestra un flujo completo —dataset etiquetado, ajuste fino, servidor de evaluación y métricas de alineación— sobre una tarea acotada, con cifras de alineación muy altas en el conjunto de evaluación. Su licencia Apache 2.0 facilita la reutilización, aunque su validez está estrictamente ligada al layout de entrada y a la tarea para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (base Qwen/Qwen3-VL-4B-Instruct) |
| Parametros totales | 4.447.004.940 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct, un transformer multimodal con codificador visual y decodificador de lenguaje, y se somete a un ajuste fino completo (no LoRA) sobre Robometer-4B, que a su vez es un reward model construido sobre esa base. La innovación principal no está en la arquitectura, sino en el preprocesado de entrada: tres vistas sincronizadas de 426x240 se embaldosan en un único fotograma de 640x540, con la vista `top` en el panel superior (640x360) y las vistas `front` y `wrist` en las celdas inferiores izquierda y derecha (320x180 cada una). La utilidad de referencia es `robometer/utils/tiling.py:tile_synchronized_views`.

El entrenamiento se realizó sobre `jesbu1/so101_busybox_push_green_button_tiled`, derivado de `AutoRLBench/so101_busybox_push_green_button_cell03_rollouts_426x240`: 2.900 episodios de una sola tarea (`push the green button`), con 1.450 etiquetas `successful` y 1.450 `failure` (timeouts). Los éxitos se marcan como terminales desde el fotograma 0 y los timeouts son vectores de ceros; `partial_success` se deja sin definir intencionadamente, de modo que el modelo aprende a contrastar trayectorias fallidas contra éxitos de la misma tarea. La configuración reportada es de 1.000 pasos, 4x H200, learning rate 2e-5 y batch size 16. No se detalla en la información disponible el número de tokens de entrenamiento ni si hubo RLHF/DPO adicional sobre esta fase.

## Capacidades

- Puntuación de recompensa de trayectorias robóticas: asigna un valor escalar de progreso/éxito a secuencias de observaciones, no genera texto libre.
- Evaluación de políticas: permite comparar rollouts de distintas políticas (pi05 DSRL/RLT, ACT, SmolVLA, Diffusion, DiT, GMM) sobre la misma tarea.
- Procesamiento de vídeo multi-vista: consume el fotograma embaldosado de tres vistas sincronizadas o, mediante el servidor de evaluación, vídeos por vista que se embaldosan al vuelo.
- Ranking de preferencias: entrenado con comparaciones de preferencia (tag `preference_comparisons`), produce ordenaciones coherentes entre trayectorias exitosas y fallidas.
- Integración con Transformers: cargable con la librería `transformers` y compatible con endpoints.
- Capacidades multimodales heredadas de Qwen3-VL: no se documentan explícitamente en la model card para esta variante ajustada.
- Tool calling, agentes y modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Evaluación automática de políticas robóticas: dado un conjunto de rollouts de una política candidata, el modelo puntúa cada trayectoria y permite calcular tasas de éxito sin anotación humana, siempre que la tarea sea `push the green button` y el layout de entrada sea el especificado.
- Filtrado de datos para RL: las puntuaciones pueden usarse para seleccionar trayectorias de alta calidad antes de un entrenamiento posterior, aprovechando la separación casi perfecta entre éxitos y timeouts reportada.
- Señal de recompensa en aprendizaje por refuerzo: integrado como reward model en un bucle de RL, el modelo proporciona retroalimentación densa o terminal sobre episodios generados por la política en entrenamiento.
- Comparación de políticas en ablation studies: al ordenar rollouts de ACT, SmolVLA, Diffusion, DiT y GMM con una métrica común, facilita comparar variantes de política sobre la misma tarea.
- Monitorización de despliegues en simulación: el servidor de evaluación descrito (`run_scripts/serve_tiled_eval.sbatch`) permite enviar vídeos por vista vía HTTP y obtener recompensas, útil para pipelines de CI de políticas.
- Detección de fallos por timeout: al estar entrenado con timeouts como clase negativa, puede señalar episodios que no completan la tarea, sirviendo como alarma en evaluaciones por lotes.
- Investigación en reward models visuales: como checkpoint de referencia para estudiar el efecto del embaldosado multi-vista en la alineación de recompensas.

## Benchmarks y rendimiento

Evaluación durante el entrenamiento sobre el dataset completo de 2.900 episodios (1.000 pasos, 4x H200, lr 2e-5, bs 16):

| Step | Pearson | Kendall | Ranking acc |
| --- | ---: | ---: | ---: |
| 250 | 0.798 | 1.000 | 1.000 |
| 500 | 0.836 | 1.000 | 1.000 |
| 750 | 0.844 | 1.000 | 1.000 |
| 1000 | 0.844 | 1.000 | 1.000 |

Evaluación independiente de este checkpoint (200 trayectorias muestreadas, a nivel de fotograma):

| Metrica | Valor |
| --- | ---: |
| Reward-alignment Pearson | 0.974 |
| Policy-ranking Kendall | 0.996 |
| Ranking accuracy | 0.998 |

El autor advierte que Kendall se satura en 1,0 porque la separación entre éxito y timeout es casi perfecta en esta tarea, por lo que Pearson sobre progreso graduado es la métrica informativa. No se han publicado comparaciones con otros reward models en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.447 millones de parámetros, en fp16 se requieren aproximadamente 9 GB solo para pesos, más memoria para activaciones y el codificador visual.
- GPU recomendadas: el entrenamiento se realizó en 4x H200; para inferencia se puede usar una GPU con al menos ~16-24 GB de VRAM en fp16, aunque no se confirma en la documentación.
- GPU de consumo: probablemente cabe en RTX 4090 (24 GB) en fp16, y en GPUs de 12-16 GB con cuantización, pero no se documentan cuantizaciones ni requisitos oficiales.
- Opciones de despliegue: `transformers`; el autor proporciona un servidor de evaluación propio (`serve_tiled_eval.sbatch` + `scripts/send_videos_to_tiled_eval.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jesbu1/robometer-4b-fft-busybox-tiled | 4,45B | no disponible | Reward model para `push the green button` | apache-2.0 | Hugging Face |
| robometer/Robometer-4B (base del ajuste) | no disponible | no disponible | Reward model general de robótica | no disponible | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct (base arquitectónica) | ~4B | no disponible | VLM instructiva general | no disponible | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Validez ligada al layout: alimentar un layout distinto de entrada devuelve números, pero invalida las recompensas, según advierte el autor.
- Especialización extrema: entrenado en una única tarea (`push the green button`) y en un único entorno (SO-101 BusyBox); no se espera generalización a otras tareas sin reentrenamiento.
- Saturación de métricas: Kendall y ranking accuracy alcanzan valores cercanos a 1,0 por la separación trivial éxito/timeout, lo que puede enmascarar fallos en progreso graduado.
- Ausencia de `partial_success`: el modelo no distingue grados intermedios de éxito más allá de la señal de progreso aprendida implícitamente.
- Idiomas, sesgos y riesgo de alucinación: no documentados; al ser un reward model, el riesgo relevante es de calibración y de recompensas espurias fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrece garantía alguna sobre el rendimiento fuera del dominio de entrenamiento.
- Contexto y cuantizaciones: no disponibles, lo que dificulta planificar despliegues con restricciones de memoria.
- Repositorio con pocas descargas (39) y sin likes: no hay evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jesbu1/robometer-4b-fft-busybox-tiled
- Discusiones: https://huggingface.co/jesbu1/robometer-4b-fft-busybox-tiled/discussions
- Modelo base del ajuste: https://huggingface.co/robometer/Robometer-4B
- Base arquitectónica: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/jesbu1/so101_busybox_push_green_button_tiled
- Dataset de origen: https://huggingface.co/datasets/AutoRLBench/so101_busybox_push_green_button_cell03_rollouts_426x240
