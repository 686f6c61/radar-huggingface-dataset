# mundoamundo/slither-miniworld-v5-fast-20261002

## Resumen

Slither MiniWorld V5 Fast es un modelo de mundo (world model) de vídeo, no un modelo de lenguaje: aprende a predecir la evolución de partidas del juego Slither.io condicionado por acciones de control. Lo publica el usuario mundoamundo en HuggingFace, con 842 descargas y 1 "like" en el momento de redactar esta ficha. Cuenta con 409.900.256 parámetros entrenables (denominados "world parameters" en la model card), obtenidos a partir de veinte bloques seleccionados del checkpoint fijo MiniWorld 0.5B DROID, con el códec de Wan2.2 congelado y emparejado al modelo.

El modelo opera sobre fotogramas de 512×288 píxeles a 15 Hz, con un historial completo de tres segundos (del orden de 45 fotogramas) y controles proxy de ángulo y boost muestreados a 30 Hz. El entrenamiento está condicionado por acciones, mientras que el ajuste de política (policy fitting) es un proceso separado: el resultado es un simulador aprendido, no un agente que juega por sí solo.

Su relevancia práctica está en la metodología y la trazabilidad: entrenamiento sin límite de épocas, checkpoints reanudables puntuados por rollout, una fase acotada de recuperación con profesor congelado, remuestreo autosupervisado de historial con compuerta de bajo ruido y ausencia de EMA. Es un caso concreto de world model de vídeo de escala reducida (0,41 B) cuyo coste de entrenamiento se declara sobre ocho GPU, y cuyos pesos no se publican como commits en el repositorio Git, sino en un bucket externo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada de forma explícita en la model card; derivada del checkpoint MiniWorld 0.5B DROID mediante la selección de veinte bloques. Modelo de mundo de vídeo con códec Wan2.2 congelado y condicionamiento por acciones |
| Parametros totales | 409.900.256 parámetros entrenables ("world parameters"), según la model card |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible en tokens (no es un modelo de texto). Historial de vídeo de tres segundos completos a 15 Hz, aproximadamente 45 fotogramas |
| Tipos de cuantizacion | No disponible. No se documentan versiones GGUF, AWQ, GPTQ ni similares. El repositorio ocupa 1,6 GB |
| Idiomas soportados | No disponible (no procesa texto ni lenguaje natural; la salida es vídeo) |
| Licencia | No disponible. El autor indica que remite a las licencias upstream (modelo preentrenado y datos) y que este repositorio no las relicencia |
| Formato de pesos | No disponible. Los pesos no se publican como commits en el repositorio Git, sino en un bucket externo con punteros verificados (latest.json y best.json) y SHA-256 |
| Resolucion y tasa de fotogramas | 512×288 a 15 Hz |
| Control / accion | Ángulo y boost a 30 Hz, tratados como proxies ruidosos |
| Tamano del repositorio | 1,6 GB |
| Tags declarados | world-model, slitherio, region:us |
| Fecha de creacion / actualizacion | 2026-10-02 / 2026-10-03 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura completa, pero sí sus componentes: se toman veinte bloques seleccionados de un checkpoint fijo MiniWorld 0.5B DROID y se emparejan con el códec de Wan2.2, que permanece congelado. El modelo es action-conditioned, es decir, consume historial de vídeo y acciones de control para predecir la evolución posterior. No se indica el número de tokens de entrenamiento ni la composición detallada del dataset, más allá de la referencia al conjunto de datos mundoamundo/slither-wam-video-actions, fijado en el commit c60388c8b625379d2782e9a673c3d850ec7d4b85.

El procedimiento de entrenamiento consta de una fase acotada de recuperación con profesor congelado (frozen-teacher recovery) previa a la adaptación a Slither, seguida de un remuestreo autosupervisado de historial con compuerta de bajo ruido (gated low-noise history self-resampling). No se emplea EMA. El ajuste de política se realiza por separado del entrenamiento del world model. No hay límite de épocas: el entrenamiento hace checkpoint y se pausa al agotarse la asignación de recursos o al detectar un fichero STOP. Los logs en JSONL conservan pérdida, niveles de ruido de validación y cortes de horizonte, gradientes, throughput, progreso de época y medidas de recursos. Los checkpoints incluyen modelo, optimizador, cursor de datos y RNG por rango, y se organizan en dos ranuras rotatorias por tipo (latest y best). La selección de best_flow se hace por validación de denoising, no por calidad visual.

## Capacidades

- Predicción y generación de fotogramas futuros de vídeo a 512×288 y 15 Hz condicionada por acciones, con historial completo de tres segundos.
- Simulación interactiva de dinámicas tipo Slither.io bajo controles proxy de ángulo y boost a 30 Hz.
- Modelado de mundo para evaluación de políticas: permite obtener rollouts puntuados sin ejecutar el juego real.
- Entrenamiento reanudable con estado completo (optimizador, cursor de datos, RNG por rango) y checkpoints verificables por SHA-256.
- Trazabilidad de reproducibilidad: config.json, hashes de fuentes, índice y documentación de arquitectura en source/world_model_v5/ARCHITECTURE.md.
- Registro detallado de métricas de entrenamiento (pérdida, ruido de validación, cortes de horizonte, gradientes, throughput).
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no aplicable. El modelo simula entorno; la política se entrena aparte.
- Capacidades multilingües: no aplicable.
- Capacidades especiales: fase de recuperación con profesor congelado, remuestreo autosupervisado de historial con compuerta de ruido y puntuación de checkpoints por rollout.

## Casos de uso

- Evaluación offline de políticas de juego: dado un historial real de tres segundos y una secuencia de acciones, el modelo genera el rollout correspondiente, lo que permite puntuar políticas candidatas sin partidas en vivo y a un coste muy inferior al de ejecutar el juego.
- Aprendizaje por refuerzo basado en modelo: usar el world model como entorno aprendido para entrenar políticas de Slither.io, aprovechando que el ajuste de política está desacoplado del entrenamiento del simulador y que los rollouts se pueden generar a 15 Hz con historial de 45 fotogramas.
- Aumento de datos de vídeo y acciones: generar trayectorias sintéticas condicionadas por acciones a partir del dataset slither-wam-video-actions para ampliar la cobertura de situaciones poco frecuentes (colisiones, giros cerrados, uso de boost).
- Investigación en arquitecturas de world models con códec congelado: el emparejamiento con el códec Wan2.2 y el uso de solo veinte bloques del checkpoint MiniWorld 0.5B DROID permiten estudiar cuánta capacidad es necesaria para modelar un dominio 2D concreto.
- Reproducción y auditoría de experimentos: gracias a config.json, los hashes de fuentes, el índice del repositorio y los ficheros latest.json/best.json con SHA-256, un tercero puede verificar qué pesos exactos produjeron cada resultado.
- Análisis de robustez frente a ruido en las etiquetas: dado que la reproducción y los controles del dataset son proxies ruidosos, el modelo sirve para medir cuánto degrada ese ruido la predicción de rollouts y comparar estrategias de remuestreo de historial.
- Estudio de métricas de calidad de rollout: permite contrastar la selección de checkpoints por validación de denoising frente a evaluaciones de calidad visual, ya que el autor advierte explícitamente que la pérdida de denoising por sí sola no certifica la calidad del rollout.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni equivalentes (no aplicables), ni métricas numéricas de FVD, PSNR, SSIM o similares. Solo se mencionan cualitativamente la pérdida de denoising, los niveles de ruido de validación con cortes de horizonte, el throughput y el uso de recursos, registrados en logs JSONL pero sin valores publicados. La selección de best_flow se realiza por validación de denoising, y el autor indica que la pérdida de denoising por sí sola no certifica la calidad del rollout.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia mínima basada en el recuento de parámetros, 409,9 M de parámetros equivalen a unos 0,8 GB en fp16 y unos 1,6 GB en fp32, a lo que hay que sumar el decodificador del códec Wan2.2 y las activaciones del historial de aproximadamente 45 fotogramas a 512×288, no cuantificadas en la información disponible.
- Coherencia con el repositorio: el tamaño del repositorio (1,6 GB) es compatible con pesos almacenados en fp32 para 409,9 M de parámetros, aunque el formato no se declara explícitamente.
- GPU recomendadas: no disponibles. El único dato de hardware declarado es que la continuación de throughput se ejecuta sobre ocho GPU.
- GPU de consumo: no confirmado. Por tamaño de parámetros, una GPU de consumo con 8-12 GB podría ser suficiente si el códec y las activaciones caben en memoria, pero no hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: no documentadas. No se mencionan integraciones con vLLM, TGI, llama.cpp, Ollama ni similares (no es un LLM de texto). El despliegue requiere el código del propio repositorio (source/world_model_v5/, config.json) y el códec Wan2.2.
- Latencia y throughput: no disponibles. Se indica únicamente que el renderizado de previsualizaciones está diferido durante la continuación de throughput en ocho GPU, y que las previsualizaciones históricas siguen accesibles.
- Almacenamiento: los pesos residen en un bucket externo (https://huggingface.co/buckets/mundoamundo/slither-miniworld-v5-fast-20261002), con dos ranuras rotatorias por tipo de checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / historial | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Slither MiniWorld V5 Fast | 409.900.256 entrenables | 3 s a 15 Hz (~45 fotogramas) | Vídeo 512×288 a 15 Hz, condicionado por acciones | No disponible (remite a licencias upstream) | HuggingFace, con pesos en bucket externo |
| MiniWorld 0.5B DROID (upstream) | 0,5 B (según denominación del checkpoint; cifra exacta no disponible) | No disponible | Vídeo, dominio robótico DROID | No disponible | Referenciado como checkpoint fijo; detalles no disponibles |
| Códec Wan2.2 | No disponible | No aplica (códec de vídeo) | Reconstrucción latente de vídeo | No disponible | Se usa congelado como componente; no es comparable como world model |
| Otros world models interactivos de vídeo (por ejemplo, orientados a juegos) | No disponible | No disponible | No disponible | No disponible | No se proporciona información sobre alternativas en la información disponible |

La comparación cuantitativa con alternativas no es posible con los datos disponibles: no hay cifras de rendimiento, licencia ni contexto publicadas para los modelos de referencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes conversacionales ni capacidades multilingües.
- Dominio muy restringido: entrenado sobre partidas de Slither.io; se desconoce su comportamiento fuera de ese dominio y no hay datos de generalización a otros juegos o entornos.
- Selección de checkpoints por métrica indirecta: best_flow se elige por validación de denoising y el autor advierte que la pérdida de denoising por sí sola no certifica la calidad del rollout.
- Calidad visual no garantizada: la selección no se basa en calidad visual, y no se realiza promediado sobre muestras aleatorias.
- Etiquetas ruidosas: la reproducción de vídeo y los controles de entrada se describen como proxies ruidosos, lo que puede propagar errores sistemáticos a las predicciones.
- Riesgo de deriva en rollouts largos: el historial es de tres segundos completos; no se documenta el comportamiento más allá del horizonte de validación registrado en los logs.
- Reproducibilidad y versionado: el entrenamiento no tiene límite de épocas y puede reanudarse; los pesos no se versionan como commits en el repositorio Git, por lo que hay que verificar los punteros (latest.json, best.json) y sus SHA-256.
- Restricciones de licencia: la licencia no está disponible y el autor indica explícitamente que no relicencia los materiales upstream, de modo que el uso comercial queda sujeto a las licencias del modelo preentrenado y del dataset de origen.
- Procedencia de los datos: el dataset se divide por fuente original de YouTube, lo que mitiga pero no elimina el riesgo de fuga entre splits; los datos derivan de vídeos de terceros.
- Artefactos de entrenamiento en curso: las previsualizaciones están diferidas durante la continuación de throughput, por lo que la disponibilidad de material visual de evaluación puede no reflejar el estado más reciente del modelo.
- Sin EMA: no se aplica media móvil exponencial de pesos, por lo que la estabilidad entre checkpoints consecutivos no está suavizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mundoamundo/slither-miniworld-v5-fast-20261002
- Bucket de checkpoints (latest.json / best.json con tamaños y SHA-256): https://huggingface.co/buckets/mundoamundo/slither-miniworld-v5-fast-20261002
- Dataset de vídeo y acciones: https://huggingface.co/datasets/mundoamundo/slither-wam-video-actions (revisión c60388c8b625379d2782e9a673c3d850ec7d4b85)
- Documentación de arquitectura incluida en el repositorio: source/world_model_v5/ARCHITECTURE.md
- Configuración del modelo: config.json (en el repositorio)
- Hashes de fuentes e índice de reproducibilidad: rutas source hashes e index del repositorio (no se proporcionan URL directas en la información disponible)
- No se han encontrado enlaces a papers, blogs, repositorios de código ni demos en la información proporcionada.
