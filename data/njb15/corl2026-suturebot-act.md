# njb15/corl2026-suturebot-act

## Resumen

SutureBot ACT es una política de imitación basada en Action Chunking with Transformers (ACT) entrenada para sutura robótica autónoma de extremo a extremo en el ámbito quirúrgico. El checkpoint publicado (`dot_best_6311.ckpt`, época 6311) corresponde a la política utilizada en los segmentos 3 y 4 del tutorial *Robot Learning on the Path to Surgical Autonomy* de CoRL 2026, y se distribuye con permiso expreso de los autores de SutureBot. Lo publica el usuario njb15 en Hugging Face con fines exclusivamente de investigación y educativos.

El modelo resuelve el problema de generar trayectorias de manipulación fina para tareas de sutura (recogida de aguja, lanzamiento de aguja y anudado) a partir de imágenes de endoscopio y de ambas muñecas del robot, junto con embeddings de tarea fijos. La arquitectura combina un codificador de instrucciones congelado (DistilBERT, 66,36 M de parámetros) con una política imagen-acción de 122,4 M de parámetros que predice 60 acciones a 30 Hz en cada forward, con 20 valores por acción.

Su relevancia es doble: por un lado, documenta un caso real de aprendizaje por imitación en robótica quirúrgica con un protocolo de despliegue reproducible; por otro, sirve como material didáctico para el tutorial de CoRL 2026. No es un modelo de propósito general ni un benchmark de éxito físico: los propios autores advierten que las comparaciones offline son demostraciones docentes, no tasas de éxito de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con codificador de instrucciones DistilBERT congelado |
| Parametros totales | 122.402.525 (política imagen-acción) + 66.362.880 (codificador de instrucciones congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entradas de imagen y estado, no texto largo) |
| Tipos de cuantizacion | no disponible (pesos en FP32 original) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | `other` / `suturebot-authors-permission` (permiso de los autores; solo investigación y educación, no uso clínico) |
| Formato de pesos | checkpoint PyTorch (`.ckpt`) con `model_state_dict` y `epoch`; FP32 |

## Arquitectura y entrenamiento

La política sigue el esquema ACT: un transformer que, dada una secuencia de observaciones visuales y un embedding de tarea, predice un chunk de 60 acciones futuras (action chunking) a una frecuencia de 30 Hz. Cada acción contiene 20 valores: por brazo, un desplazamiento de traslación, seis valores de rotación relativa y el ángulo de la mandíbula. Las entradas son imágenes RGB del endoscopio izquierdo y de ambas muñecas, redimensionadas a 480×360, junto con embeddings de tarea fijos (recogida de aguja, lanzamiento de aguja, anudado) y entradas de estado del robot a cero. El codificador de instrucciones DistilBERT está congelado y no se ejecuta por cada chunk.

El entrenamiento se realizó sobre el dataset `nvidia/PhysicalAI-Robotics-Open-H-Embodiment`. El checkpoint publicado conserva únicamente `model_state_dict` y `epoch`; se eliminaron los estados del optimizador y del scheduler. No se documenta en la información disponible el número de tokens, la composición exacta del dataset ni si hubo RLHF/DPO (no aplica en el sentido habitual, al ser una política de imitación). La normalización de posición y mandíbula se distribuye aparte en `checkpoint_normalization.json`; los canales de rotación pasan sin normalizar. El despliegue revierte la normalización y convierte las predicciones a poses absolutas usando la pose inicial medida, restando la primera traslación predicha.

## Capacidades

- Generación de trayectorias de manipulación robótica para sutura: predicción de chunks de 60 acciones a 30 Hz.
- Control bimanual: cada acción incluye traslación, rotación relativa y ángulo de mandíbula por brazo.
- Percepción visual multimodal: endoscopio izquierdo más dos cámaras de muñeca a 480×360.
- Condicionamiento por tarea mediante embeddings fijos: recogida de aguja, lanzamiento de aguja y anudado.
- Lanzamiento de aguja con anotaciones de puntos de inserción (azul) y salida (verde) sobre la imagen del endoscopio.
- Inferencia en modo open-loop, chunk y dream con protocolo de horizonte deslizante de 50 pasos (cachés heredadas del segmento 4).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Docencia en robótica quirúrgica: reproducir los segmentos 3 y 4 del tutorial de CoRL 2026 cargando el checkpoint y el notebook `OpenHTutorial_SutureBotACT_Inference.ipynb` para mostrar el pipeline completo de inferencia ACT.
- Investigación en aprendizaje por imitación: usar la política como línea base reproducible para comparar variantes de ACT en tareas de sutura con las mismas entradas visuales y de estado.
- Estudio de action chunking: analizar el efecto del tamaño de chunk (60 acciones) y del horizonte deslizante (50 pasos) en la estabilidad de trayectorias quirúrgicas.
- Evaluación de condicionamiento por tarea: comparar los tres embeddings fijos (recogida, lanzamiento, anudado) y su impacto en la predicción de poses.
- Replicación de experimentos offline: cargar los ficheros `predictions/act_1441.npz` a `act_1451.npz` y `summary.json` del repositorio histórico para reproducir comparaciones open-loop, chunk y dream.
- Desarrollo de entornos simulados: integrar la política en un simulador de sutura para probar protocolos de despliegue antes de pasar a hardware, dado que el checkpoint es ligero (0,5 GB) y se carga en CPU con `torch.load(..., map_location="cpu", weights_only=True, mmap=True)`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card advierte explícitamente que el split de entrenamiento no se registró y puede solaparse con los clips de evaluación de OpenH, por lo que las comparaciones offline deben tratarse como demostraciones docentes y no como puntuaciones de benchmark ni tasas de éxito físico.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 0,5 GB y los pesos están en FP32, por lo que la política de 122,4 M de parámetros cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no especificadas por los autores; cualquier GPU con suficiente memoria para el checkpoint en FP32 es suficiente a nivel de pesos.
- GPU de consumo: sí, previsiblemente cabe en RTX 3060/4060 y superiores, dado el tamaño del checkpoint; no se confirma oficialmente.
- Despliegue: carga con PyTorch (`torch.load` con `weights_only=True` y `mmap=True`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SutureBot ACT (este) | 122,4 M (política) + 66,4 M (codificador) | no aplica | Sutura robótica (ACT) | Permiso de autores, solo investigación | Hugging Face, repo de 0,5 GB |
| Otras políticas ACT para robótica quirúrgica | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas de imitación generalistas (p. ej. RT-2, OpenVLA) | no disponible en la información | no disponible | Manipulación general | no disponible | no disponible |

No se dispone de datos comparativos verificables en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Uso restringido: licencia `suturebot-authors-permission`; solo investigación y educación, prohibido el uso clínico. Contactar con los autores para otros usos.
- El split de entrenamiento no se registró y puede solaparse con los clips de evaluación de OpenH; las métricas offline no son tasas de éxito reales.
- Las cachés antiguas del segmento 4 (lanzamiento de aguja) se generaron sin puntos de objetivo; la caché del segmento 3 usa anotaciones fuente emparejadas.
- El checkpoint no incluye estados de optimizador ni scheduler, por lo que no es reanudable para entrenamiento tal cual.
- No es un modelo de lenguaje: no soporta tool calling, agentes, multilingüismo ni razonamiento simbólico.
- Riesgo de sobreajuste a las condiciones de captura del dataset (iluminación, instrumental, configuración de cámaras) no cuantificado en la información disponible.
- Las predicciones dependen de la pose inicial medida y de la convención de despliegue que resta la primera traslación predicha; un uso incorrecto de la normalización invalida los resultados.
- Se recomienda fijar las revisiones del modelo y del dataset a etiquetas revisadas o hashes de commit (la etiqueta prevista es `corl2026-v1`, no creada en el staging local).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/njb15/corl2026-suturebot-act
- Licencia: https://huggingface.co/njb15/corl2026-suturebot-act/blob/main/LICENSE
- Dataset de caché del segmento 3: https://huggingface.co/datasets/njb15/corl2026-seg3-cache
- Código fuente SutureBot ACT (commit fijado): https://github.com/SutureBot/SutureBot/tree/6a7a708d2ba5d71a36dd34314d8d4a2959d40d0f
- Paper SutureBot (NeurIPS 2025 Datasets and Benchmarks): https://arxiv.org/abs/2510.20965
- Dataset Open-H-Embodiment: https://huggingface.co/datasets/nvidia/PhysicalAI-Robotics-Open-H-Embodiment
- Informe del dataset Open-H-Embodiment: https://arxiv.org/abs/2604.21017
