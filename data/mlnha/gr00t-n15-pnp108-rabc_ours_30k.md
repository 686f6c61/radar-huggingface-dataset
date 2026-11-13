# mlnha/gr00t-n15-pnp108-rabc_ours_30k

## Resumen

`mlnha/gr00t-n15-pnp108-rabc_ours_30k` es un checkpoint de investigación derivado de GR00T N1.5, el modelo fundacional de visión-lenguaje-acción (VLA) para robótica de NVIDIA. El autor (`mlnha`) lo publica como material de un estudio sobre estimadores de progreso de tarea aprendidos como señal de entrenamiento para clonación de conducta (behavior cloning, BC). El modelo parte del checkpoint de preentrenamiento `robocasa/robocasa365_checkpoints` (paso 80000) y se ajusta con un esquema de ponderación denominado RA-BC sobre 108 rollouts del entorno RoboCasa365, concretamente la tarea PickPlaceCounterToCabinet.

La relevancia es acotada y de carácter experimental: no es un modelo listo para producción, sino un artefacto reproducible de un experimento de investigación sobre cómo ponderar datos de imitación. El repositorio ocupa 37,9 GB e incluye pesos en safetensors, logs de entrenamiento y eventos de TensorBoard, pero no los estados del optimizador.

No se dispone de información pública sobre arquitectura interna, número de parámetros, longitud de contexto ni licencia. Todo lo que sigue se basa exclusivamente en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA de la familia GR00T N1.5; detalles internos no publicados en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo contiene safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 37,9 GB; incluye `train.log` y `runs/` de TensorBoard) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de GR00T N1.5, un modelo fundacional de robótica que combina percepción visual, instrucciones en lenguaje natural y salida de acciones motoras. La model card no describe la arquitectura interna (bloques, atención, tokenizador de acciones, etc.), por lo que no es posible detallar su diseño más allá de identificarlo como un VLA de la familia GR00T.

El entrenamiento parte del checkpoint `robocasa/robocasa365_checkpoints` en el paso 80000 y aplica un esquema RA-BC (probablemente *Reward/Advantage-weighted Behavior Cloning*) ponderado por un estimador de progreso propio del autor, durante 30000 pasos. Los datos son 108 rollouts generados por el checkpoint 120000 de GR00T sobre la tarea PickPlaceCounterToCabinet en RoboCasa365, de los cuales 72 son exitosos, en formato LeRobot v2.1. La configuración es: 1 GPU, batch de 64, learning rate 3e-5 con decaimiento coseno y warmup del 5 %, semilla 42 y embodiment `new_embodiment`. La evaluación se realiza en el simulador RoboCasa365 con semillas de escena 2000+ y semilla de política 1, considerando éxito si la tarea se completa al final del episodio.

## Capacidades

- Ejecución de políticas de manipulación robótica en simulación para la tarea PickPlaceCounterToCabinet de RoboCasa365.
- Clonación de conducta condicionada por observaciones visuales y, presumiblemente, instrucciones de tarea (comportamiento estándar de un VLA GR00T; no detallado en la model card).
- Integración con el ecosistema `gr00t` (librería indicada en los metadatos) y con datasets en formato LeRobot v2.1.
- Entrenamiento y evaluación reproducibles: se incluyen logs de entrenamiento y eventos de TensorBoard.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, modo thinking, visión general o audio. Cualquier capacidad de este tipo debe considerarse no disponible.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite replicar el estudio de RA-BC con estimadores de progreso, comparando los pasos 10000, 20000 y 30000 con las métricas de éxito publicadas.
- Estudio de ponderación de datos en behavior cloning: sirve como línea base para analizar cómo afecta la ponderación por progreso estimado frente a BC estándar en una tarea de manipulación concreta.
- Evaluación comparativa en RoboCasa365: útil para contrastar políticas entrenadas con distintos esquemas de ponderación bajo el mismo protocolo de semillas (2000–2049 y 100 episodios completos).
- Análisis de curvas de aprendizaje: los logs de TensorBoard y `train.log` permiten estudiar la evolución del éxito en simulación a lo largo de los 30000 pasos.
- Punto de partida para ajuste fino adicional: al derivar del preentrenamiento RoboCasa365, puede servir como inicialización para otras tareas de manipulación del mismo benchmark.
- Docencia y formación en robótica aprendida: ejemplo concreto de pipeline completo (datos LeRobot, entrenamiento con `gr00t`, evaluación en simulador) para cursos o talleres.
- Auditoría de robustez: permite medir la variabilidad del éxito entre semillas (por ejemplo, 25/50 frente a 33/50 frente a 28/50 en los distintos checkpoints).

## Benchmarks y rendimiento

Los únicos datos publicados son los de éxito en simulación RoboCasa365 para la tarea PickPlaceCounterToCabinet:

| Checkpoint | Éxito (semillas 2000–2049) | Éxito (100 episodios) |
|---|---|---|
| checkpoint-10000 | 25/50 | 56/100 |
| checkpoint-15000 | no disponible | no disponible |
| checkpoint-20000 | 33/50 | 65/100 |
| checkpoint-25000 | no disponible | no disponible |
| checkpoint-30000 | 28/50 | 59/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (37,9 GB) sugiere pesos en precisión alta, pero no se especifica el número de parámetros ni la precisión de almacenamiento.
- GPU recomendadas: el entrenamiento se realizó en 1 GPU con batch 64, sin especificar modelo. Para inferencia no hay recomendación publicada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería indicada es `gr00t`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (poco probable en un VLA de robótica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otras políticas ni con otros checkpoints de GR00T N1.5 distintos del preentrenamiento del que parte. Como referencia interna, los tres checkpoints evaluados del propio modelo muestran un pico de éxito en el paso 20000 (65/100) y un descenso posterior en el paso 30000 (59/100).

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para despliegue en producción ni para robótica real; la evaluación es exclusivamente en simulación (RoboCasa365).
- Especialización estrecha: entrenado solo para PickPlaceCounterToCabinet con 108 rollouts (72 exitosos); la generalización a otras tareas no está documentada.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución. Además, al derivar de GR00T N1.5, podrían aplicar las condiciones del modelo base, que no se detallan aquí.
- Riesgo de sobreajuste y varianza: el éxito varía entre checkpoints (56, 65 y 59 sobre 100 episodios) y entre subconjuntos de semillas, lo que indica sensibilidad al protocolo de evaluación.
- Sin estados del optimizador: no es posible reanudar el entrenamiento exactamente desde estos checkpoints.
- Idiomas y sesgos: no documentados. Al ser un modelo de acción, los sesgos relevantes serían de distribución de datos (sesgo hacia las trayectorias del checkpoint generador) más que lingüísticos.
- Alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones no válidas o fuera de distribución en escenarios no vistos.
- Datos de entrenamiento limitados y generados por otro modelo: los rollouts provienen del checkpoint 120000 de GR00T, por lo que el ajuste hereda sus sesgos y errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlnha/gr00t-n15-pnp108-rabc_ours_30k
- Checkpoint base de preentrenamiento citado: `robocasa/robocasa365_checkpoints` (no se proporciona URL directa en la información disponible)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.
