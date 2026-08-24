# sadjava/smolvla-video-expert-libero90-s1000-lora-r8

## Resumen

El modelo `sadjava/smolvla-video-expert-libero90-s1000-lora-r8` es un *video expert* residual para robótica, desarrollado por el usuario sadjava sobre la arquitectura SmolVLA de Hugging Face. Se trata de un pretraining sin supervisión de acciones (action-free) sobre el dataset de manipulación LIBERO_90, en el que el modelo aprende a predecir la diferencia residual entre características visuales SigLIP de dos frames separados por un intervalo de 8 pasos. El objetivo es mejorar la representación visual del modelo base para facilitar el fine-tuning posterior en tareas de manipulación con pocos ejemplos (few-shot).

El modelo se inicializa desde `lerobot/smolvla_base` y se entrena con LoRA de rango 8 sobre las proyecciones `q_proj` y `v_proj` (alpha=16). Los pesos del adaptador se fusionan con la base y se guardan como un único `model.safetensors` de 450 millones de parámetros. Su relevancia radica en que permite transferir conocimiento visual de video a políticas de acción sin necesidad de etiquetas de estado o acción, un enfoque que reduce costes de anotación y mejora la generalización en entornos robóticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action) con LoRA en q_proj y v_proj |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos fusionados base + adaptador) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción ligero (450M parámetros) diseñado por Hugging Face para robótica. Combina un codificador visual SigLIP, un modelo de lenguaje y un decodificador de acciones. En esta variante, el entrenamiento se realiza de forma *action-free*: el modelo recibe secuencias de video RGB del dataset `nvidia/libero_90` y debe predecir el residual de características SigLIP entre el frame actual y el frame `t+Δ` (con Δ=8). Esta tarea de predicción de video fuerza al modelo a aprender representaciones espacio-temporales ricas sin depender de etiquetas de acción o estado.

El entrenamiento se realiza con LoRA de rango 8 (alpha=16) sobre las capas de atención `q_proj` y `v_proj`, partiendo de los pesos de `lerobot/smolvla_base`. Tras el entrenamiento, los pesos del adaptador se fusionan con la base y se guardan como un único archivo `model.safetensors`. El resultado es un *video expert* que puede usarse como punto de partida para fine-tuning en LIBERO-Goal, ya sea con el adaptador original o con el modelo fusionado.

## Capacidades

- Representación visual espacio-temporal para manipulación robótica, aprendida mediante predicción de residuales de video.
- Pretraining sin supervisión de acciones, lo que permite aprovechar grandes cantidades de video sin anotaciones de estado o acción.
- Compatible con el ecosistema LeRobot: puede usarse como `--policy.path` para fine-tuning few-shot en LIBERO-Goal.
- Soporte para fine-tuning con LoRA (el adaptador se puede extraer o usar fusionado).
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento simbólico; es un componente de representación visual para políticas robóticas.

## Casos de uso

- Fine-tuning de políticas de manipulación en LIBERO-Goal: el modelo se usa como inicialización para entrenar una política de acción sobre tareas como abrir cajas, apilar bloques o colocar objetos, reduciendo el número de demostraciones necesarias.
- Aprendizaje por imitación con pocos ejemplos: al tener una representación visual robusta, el modelo permite adaptarse a nuevas tareas con pocas demostraciones humanas o teleoperadas.
- Pretraining de video para robots en entornos simulados: el *video expert* puede transferirse a otros entornos de simulación con características visuales similares.
- Extracción de características visuales para sistemas de control jerárquico: las representaciones residuales pueden usarse como entrada para planificadores de alto nivel.
- Investigación en representaciones visuales para robótica: sirve como punto de comparación para estudiar el impacto del pretraining de video en el rendimiento de políticas VLA.
- Base para experimentos de ablación sobre el efecto de LoRA y la predicción residual en el aprendizaje de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de éxito en LIBERO ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, latencia o throughput.
- Dado el tamaño de 450M parámetros, es plausible que el modelo pueda ejecutarse en GPUs de consumo con al menos 8-12 GB de VRAM en precisión FP16, pero no hay confirmación oficial.
- Para fine-tuning con LoRA, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A5000) para manejar el lote y las secuencias de video.
- El despliegue en inferencia puede realizarse mediante la librería LeRobot, que integra SmolVLA, o exportando los pesos a formatos como ONNX o TensorRT, aunque no se documentan opciones específicas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| sadjava/smolvla-video-expert-libero90-s1000-lora-r8 | 450M | no disponible | Video residual action-free + LoRA | no disponible |
| lerobot/smolvla_base | 450M | no disponible | VLA base preentrenado | Apache 2.0 (según documentación de LeRobot) |
| RT-2 (Google) | 55B | 32K | VLA a gran escala | no abierto |

No se dispone de datos de rendimiento comparativo. El modelo se posiciona como una variante especializada en representación visual para LIBERO, mientras que `smolvla_base` es el modelo general sin el pretraining de video residual.

## Limitaciones y advertencias

- Es un *video expert* y no una política completa: requiere fine-tuning posterior con datos de acción para ser útil en control robótico.
- La licencia no está especificada, por lo que su uso comercial es incierto y debe consultarse con el autor.
- No se han documentado sesgos específicos, pero al entrenarse en LIBERO_90 (entornos simulados de mesa), puede no generalizar bien a entornos reales o con variaciones visuales significativas.
- Riesgo de alucinación visual: al predecir residuales de video, puede generar representaciones inconsistentes si los frames de entrada contienen oclusiones o cambios bruscos.
- No hay información sobre la calidad de las representaciones en otros idiomas o dominios fuera de la manipulación robótica.
- El modelo se guarda con pesos fusionados, lo que impide extraer el adaptador LoRA original si se necesita para experimentos de bajo recurso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sadjava/smolvla-video-expert-libero90-s1000-lora-r8)
- [Documentación de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/smolvla)
- [Paper de SmolVLA (arXiv)](https://arxiv.org/abs/2506.01844)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Dataset LIBERO_90 en Hugging Face](https://huggingface.co/datasets/nvidia/libero_90)
