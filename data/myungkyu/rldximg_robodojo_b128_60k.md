# Myungkyu/rldximg_robodojo_b128_60k

## Resumen

`rldximg_robodojo_b128_60k` es un punto de control (*checkpoint*) de ajuste fino del modelo de visión-lenguaje-acción (VLA) RLDX-1-PT, publicado por el usuario Myungkyu en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de una política robótica entrenada para controlar un robot bimanual dual ARX X5 en el entorno de simulación RoboDojo. El modelo consume imágenes de tres cámaras (cabeza y muñecas izquierda/derecha), un vector de estado articular de 14 dimensiones y la instrucción de la tarea en lenguaje natural, y produce como salida 14 objetivos articulares absolutos.

El checkpoint corresponde a un *baseline* "vanilla" del *setting* de co-entrenamiento de RoboDojo Sim: 35 tareas con 100 episodios cada una, exportadas en formato oficial LeRobot. Se entrenó con batch 128 durante 60 000 pasos y se publica junto con checkpoints intermedios en los pasos 15 000, 30 000 y 45 000. Su relevancia es la de servir como referencia reproducible para comparar variantes arquitectónicas o de entrenamiento sobre la misma base RLDX-1-PT en tareas de manipulación bimanual.

El modelo tiene 6 912 896 320 parámetros (≈6,9 mil millones) según los pesos en safetensors, y el repositorio ocupa 165,9 GB, lo que refleja la inclusión de múltiples checkpoints y estados asociados. La licencia y los idiomas soportados no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RLDX-1-PT (VLA; video length 4 / stride 2, tres vistas de cámara, horizonte de acción 50) |
| Parametros totales | 6 912 896 320 (≈6,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | RLWRLD/RLDX-1-PT |
| Dataset de entrenamiento | RoboDojo-Benchmark/RoboDojo (35 tareas × 100 episodios, dual ARX X5, export oficial LeRobot) |
| Entradas | imágenes de cabeza + muñeca izquierda + muñeca derecha, estado articular 14-d, instrucción de tarea |
| Salidas | 14 objetivos articulares absolutos |
| Entrenamiento | batch 128, 60 000 pasos, checkpoint final (sin estado del optimizador) |
| Código | RLWRLD/RLDX @ myungkyu/jitter-patch 21f674b4 |
| Checkpoints intermedios | step-15000, step-30000, step-45000 |
| Tamaño del repo | 165,9 GB |
| Descargas | 87 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo se basa en RLDX-1-PT, un *backbone* de visión-lenguaje-acción que procesa secuencias de vídeo con longitud 4 y *stride* 2, tres vistas de cámara simultáneas y un horizonte de acción de 50 pasos. El ajuste fino introduce dos técnicas destacadas: enmascaramiento de ruido en la dimensión de *padding* (`action_noise_mask_dim=14`) y *state dropout* con probabilidad 0,5. La primera evita que el ruido inyectado en las dimensiones de relleno de la acción contamine el aprendizaje; la segunda fuerza al modelo a no depender exclusivamente del estado articular de entrada, lo que mejora la robustez ante perturbaciones o estados imperfectos en tiempo de inferencia.

El entrenamiento se realizó sobre el conjunto RoboDojo Sim en configuración de co-entrenamiento, con 35 tareas y 100 episodios por tarea, en un robot bimanual dual ARX X5 y con exportación en formato oficial LeRobot. Se usó un optimizador con batch 128 durante 60 000 pasos. Las configuraciones referencian el *backbone* y el tokenizador base por su identificador de Hub, y el código empleado corresponde a RLWRLD/RLDX con el parche `myungkyu/jitter-patch` en el commit 21f674b4. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Control robótico bimanual: genera 14 objetivos articulares absolutos para un robot dual ARX X5 a partir de observaciones visuales y de estado.
- Percepción multivista: integra simultáneamente imágenes de cámara de cabeza y de ambas muñecas.
- Condicionamiento por lenguaje: ejecuta tareas guiadas por una instrucción en lenguaje natural.
- Predicción de acciones con horizonte de 50 pasos, lo que permite planificación de movimiento a corto plazo.
- Robustez ante estados imperfectos gracias al *state dropout* de 0,5 durante el entrenamiento.
- Manejo de dimensiones de acción con relleno mediante enmascaramiento de ruido (`action_noise_mask_dim=14`).
- No se dispone de información sobre soporte de *tool calling*, agentes multi-paso, capacidades multilingües, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Evaluación de referencia en RoboDojo: el checkpoint sirve como *baseline* "vanilla" contra el que comparar variantes de arquitectura, aumentación o estrategias de entrenamiento en las mismas 35 tareas, gracias a que comparte base RLDX-1-PT y protocolo de exportación LeRobot.
- Investigación en manipulación bimanual: permite reproducir experimentos de control coordinado de dos brazos ARX X5 en simulación, usando las tres vistas y el estado de 14 articulaciones como entrada.
- Estudio de robustez con *state dropout*: al haberse entrenado con dropout de estado 0,5, es adecuado para analizar cómo degrada el rendimiento cuando el estado articular es ruidoso o parcialmente desconocido.
- Análisis de la evolución del entrenamiento: los checkpoints intermedios en los pasos 15 000, 30 000 y 45 000 permiten estudiar curvas de aprendizaje y elegir el punto óptimo según la métrica de éxito en la tarea.
- Ajuste fino posterior sobre tareas específicas: al ser un modelo preentrenado y ajustado a RoboDojo, puede servir de inicialización para *fine-tuning* en tareas de manipulación relacionadas con el mismo robot y espacio de acciones.
- *Benchmarking* de infraestructura de inferencia robótica: con 6,9 B de parámetros y pesos safetensors, es útil para medir latencia y *throughput* de pipelines VLA en GPUs de distinta gama antes de desplegar variantes más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 6,9 B parámetros en fp16 requiere aproximadamente 14 GB solo para pesos, a lo que hay que sumar activaciones y el procesamiento de tres flujos de vídeo; en fp32 serían unos 28 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar que requiera GPUs de clase profesional (A100, H100) para inferencia en fp16 con margen para activaciones, aunque no hay datos confirmados.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de 6,9 B podría caber en GPUs de consumo con 24 GB (RTX 3090/4090) en fp16, pero la carga adicional de las tres vistas de vídeo y el horizonte de acción hacen que esto no pueda afirmarse sin datos.
- Opciones de despliegue: no se indican en la información disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además están orientados a modelos de lenguaje y no a políticas VLA).
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Myungkyu/rldximg_robodojo_b128_60k | ≈6,9 B | no disponible | no disponible | Baseline RoboDojo con imágenes; base RLDX-1-PT |
| Myungkyu/rldx_robodojo_vanilla_b128_60k | no disponible | no disponible | no disponible | Baseline RoboDojo "vanilla" sobre RLDX-1-PT, mismo protocolo |
| Myungkyu/rldx2_rldx_robodojo_vanilla_b128_60k | no disponible | no disponible | no disponible | Variante sobre RLDX-1-PT con el mismo *setting* de RoboDojo |

Los tres modelos comparten base RLDX-1-PT, dataset RoboDojo y protocolo de entrenamiento (batch 128, 60 000 pasos), por lo que constituyen alternativas directamente comparables dentro del mismo ecosistema. No se dispone de datos de rendimiento ni de licencia para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un *baseline* de investigación, no un modelo de propósito general: no está pensado para generación de texto, código ni tareas de lenguaje.
- Dominio restringido: entrenado exclusivamente en RoboDojo Sim con robot dual ARX X5; su transferencia a robots reales o a otras morfologías no está validada en la información disponible.
- Licencia no declarada: no puede confirmarse el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce qué lenguas aceptan las instrucciones de tarea.
- Riesgo de sobreajuste al simulador: al entrenarse solo en simulación, es probable que sufra la brecha sim-a-real (*sim-to-real gap*), aunque no se aportan datos al respecto.
- Sin métricas publicadas: no hay resultados de éxito en tareas que permitan estimar su fiabilidad.
- Repositorio de gran tamaño (165,9 GB) por la inclusión de checkpoints intermedios; la descarga completa puede ser costosa y conviene usar `allow_patterns` o `ignore_patterns` para seleccionar solo lo necesario.
- El checkpoint final no incluye el estado del optimizador, lo que limita la reanudación exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Myungkyu/rldximg_robodojo_b128_60k
- Baseline relacionado: https://huggingface.co/Myungkyu/rldx_robodojo_vanilla_b128_60k
- Variante relacionada: https://huggingface.co/Myungkyu/rldx2_rldx_robodojo_vanilla_b128_60k
- Modelo base: https://huggingface.co/RLWRLD/RLDX-1-PT
- Dataset: https://huggingface.co/datasets/RoboDojo-Benchmark/RoboDojo
- Repositorio de código: https://github.com/RLWRLD/RLDX (referenciado como RLWRLD/RLDX)
