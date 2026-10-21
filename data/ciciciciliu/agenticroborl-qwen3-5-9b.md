# ciciciciliu/AgenticRoboRL-Qwen3.5-9B

## Resumen

AgenticRoboRL-Qwen3.5-9B es un ajuste fino (post-entrenamiento) de Qwen/Qwen3.5-9B orientado a actuar como planificador robótico y agente multi-turno. Lo publica el usuario ciciciciliu en Hugging Face y se acompaña de un artículo titulado «AgenticRoboRL: Bringing Coding-Agent Post-Training to Agentic Robotics» (arXiv:2610.28589) y de un repositorio de código en GitHub. La tesis del trabajo, a juzgar por el título y la model card, es trasladar las técnicas de post-entrenamiento empleadas en agentes de código al dominio de la robótica agéntica.

El repositorio no contiene un único modelo, sino dos checkpoints completos en bf16: `sft/` (ajuste supervisado, paso 563) y `rl-v006/` (aprendizaje por refuerzo multi-turno, ronda 6, inicializado desde `sft/`). Ambos directorios incluyen pesos, tokenizador y ficheros de procesador, y se cargan con la clase `Qwen3_5ForConditionalGeneration` de Transformers. El tamaño del repo (37,7 GB) es coherente con dos copias completas de un modelo de ~9 000 millones de parámetros en bf16.

Su relevancia es acotada pero clara: es un artefacto de investigación que documenta un pipeline de post-entrenamiento en dos etapas (SFT y RL) sobre un modelo base reciente, con licencia Apache 2.0. No obstante, no hay resultados de benchmarks publicados, el modelo acumula cero descargas y un único «like», y la model card no describe la composición de los datos de entrenamiento ni los hiperparámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, cargable mediante `Qwen3_5ForConditionalGeneration` (Transformers); detalles internos del modelo base no disponibles en la información proporcionada |
| Parámetros totales | ~9 000 millones (derivado de la nomenclatura «9B» del modelo base; no se indica cifra exacta) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en el repositorio (solo se publican pesos bf16); no se han publicado conversiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (la model card no declara idiomas; se desconoce si hereda el soporte multilingüe del modelo base) |
| Licencia | Apache 2.0 (declarada en la model card y en los tags del repo) |
| Formato de pesos | safetensors en bf16, junto con tokenizador y ficheros de procesador |
| Subcarpetas publicadas | `sft/` (SFT, paso 563) y `rl-v006/` (RL multi-turno, ronda 6) |
| Tamaño del repositorio | 37,7 GB (dos checkpoints completos) |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer decoder-only, y se post-entrena en dos fases secuenciales. La primera es un ajuste supervisado (SFT) que finaliza en el paso 563 y da lugar al checkpoint `sft/`. La segunda es un proceso de aprendizaje por refuerzo multi-turno que arranca desde `sft/` y se ejecuta durante al menos seis rondas, siendo la ronda 6 la publicada como `rl-v006/`. Esta estructura de dos etapas —imitación seguida de optimización por recompensa sobre interacciones multi-turno— es la que el título del paper asocia al post-entrenamiento de agentes de código.

La model card no aporta información sobre el número de tokens de entrenamiento, la composición del dataset, el algoritmo de RL empleado (PPO, GRPO u otro), la existencia de una fase de preferencias tipo DPO/RLHF ni las funciones de recompensa. Tampoco se documentan innovaciones técnicas a nivel de arquitectura (atención lineal, decodificación especulativa, capas híbridas SSM) ni modificaciones sobre el modelo base: el código de carga sugiere que la arquitectura subyacente es la de Qwen3.5 sin cambios estructurales. El objeto de la contribución parece ser el pipeline de datos y de recompensa para planificación robótica, no la arquitectura.

## Capacidades

- Planificación robótica: generación de secuencias de acciones o subobjetivos a partir de instrucciones en lenguaje natural, según el propósito declarado por el autor («post-trained as a robot planner»).
- Razonamiento agéntico multi-turno: el checkpoint `rl-v006` se ha optimizado explícitamente sobre interacciones de varios turnos, lo que sugiere uso en bucles de tipo percibir-planificar-actuar con realimentación del entorno.
- Generación de código orientada a agentes: el marco del paper es el post-entrenamiento de agentes de código aplicado a robótica, por lo que se espera competencia en la escritura de scripts de control; el grado exacto no está cuantificado.
- Dos puntos de comparación: al publicar SFT y RL por separado, permite evaluar el efecto aislado del RL multi-turno frente al SFT.
- Capacidades multimodales: no confirmadas. El uso de `AutoProcessor` y de una clase `ForConditionalGeneration` es compatible con entradas multimodales, pero la model card no documenta visión, audio ni ninguna otra modalidad.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible; plausible por el encuadre agéntico, pero no verificable.
- Modo «thinking» o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declaran idiomas.

## Casos de uso

- Planificación de manipulación en investigación robótica: dado un objetivo en lenguaje natural («coloca el bloque rojo sobre la bandeja»), el modelo genera una secuencia de subobjetivos que un planificador de movimiento de bajo nivel traduce a trayectorias. Es adecuado porque ha sido post-entrenado específicamente para esa tarea.
- Agente multi-turno con realimentación del entorno: integrado en un bucle donde el resultado de cada acción (éxito, fallo, observación) se reinyecta como turno adicional, el checkpoint `rl-v006` está optimizado para corregir el plan en rondas sucesivas en lugar de emitir un plan único de un solo disparo.
- Generación de código de control y scripting: producción de scripts en Python para pilas robóticas (por ejemplo ROS) que implementen la política planificada, aprovechando el enfoque de «coding-agent post-training» descrito en el paper.
- Estudio comparativo SFT frente a RL: los dos checkpoints permiten medir de forma aislada cuánto aporta el RL multi-turno sobre el SFT con el mismo modelo base y el mismo pipeline de datos, útil para grupos que investigan post-entrenamiento de agentes.
- Reproducción y extensión del pipeline: el repositorio de código enlazado y los checkpoints intermedios permiten reanudar el RL desde `sft/` con nuevas recompensas o nuevos entornos simulados.
- Evaluación de robustez en agentes encarnados: uso del modelo como política de referencia en entornos simulados para medir tasas de éxito, número de pasos y recuperación ante errores.
- Asistente de depuración de políticas: análisis de trazas de ejecución de un robot (secuencias de acciones y observaciones) para localizar el paso donde el plan divergió del objetivo.
- Prototipado en una sola GPU: con ~9 000 millones de parámetros en bf16, el checkpoint puede cargarse en una GPU de 24 GB para experimentación académica sin infraestructura distribuida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de evaluación (tasas de éxito en tareas robóticas, MMLU, HumanEval, GSM8K ni métricas específicas de planificación), y el artículo referenciado no ha podido consultarse en la información proporcionada. Cualquier cifra de rendimiento sobre este modelo sería una extrapolación no verificada.

## Requisitos de hardware

- VRAM para pesos en bf16: aproximadamente 18 GB solo para los pesos de un checkpoint (9 000 M × 2 bytes); el repositorio completo ocupa 37,7 GB porque incluye dos.
- VRAM estimada para inferencia en bf16: 20-24 GB con contexto corto, sumando caché KV y overhead del runtime; el consumo crece con la longitud de contexto, que no está documentada.
- VRAM estimada en cuantización de 8 bits: 10-12 GB; en 4 bits, 6-7 GB (estimaciones aritméticas a partir del número de parámetros, no verificadas con este checkpoint).
- GPU profesionales: A100 40/80 GB, H100, L40S y A10G 24 GB son suficientes para servir el modelo en bf16; para el repositorio completo con los dos checkpoints cargados simultáneamente hacen falta 40 GB o más.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 (24 GB) en bf16 con contexto moderado; en RTX 4080/4070 Ti (16 GB) o 3080 (12 GB) requiere cuantización de 8 o 4 bits, que no está publicada en el repo y habría que generar.
- Opciones de despliegue: Transformers con `AutoProcessor` y `Qwen3_5ForConditionalGeneration`, tal como indica el autor (ruta verificada). vLLM, TGI o SGLang son opciones plausibles para servir en producción, pero el soporte de la arquitectura Qwen3.5 en esas herramientas no está confirmado en la información disponible. llama.cpp u Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo por plan.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|---|
| AgenticRoboRL-Qwen3.5-9B (`rl-v006`) | ~9 000 M | no disponible | Planificador robótico agéntico, RL multi-turno | Apache 2.0 | Pesos bf16 en HF; 0 descargas | no disponible |
| AgenticRoboRL-Qwen3.5-9B (`sft`) | ~9 000 M | no disponible | Mismo modelo, solo SFT (paso 563) | Apache 2.0 | Incluido en el mismo repo | no disponible |
| Qwen/Qwen3.5-9B (modelo base) | ~9 000 M | no disponible | Modelo generalista sin post-entrenamiento robótico | no verificada en la información disponible | Hugging Face | no disponible |

No se dispone de datos objetivos para comparar con otras familias de modelos de tamaño similar (por ejemplo, otros modelos de ~8-9 000 millones de parámetros) ni con planners robóticos específicos: la información proporcionada no incluye sus especificaciones ni resultados. La comparación honesta en este punto es únicamente entre los dos checkpoints publicados y su modelo base.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que respalde el rendimiento en planificación, generación de código o seguimiento de instrucciones.
- Validación comunitaria nula: 0 descargas y 1 «like» en el momento de la consulta; no existen informes independientes de uso.
- Modelo de investigación, no de producción: está post-entrenado como planificador robótico y no se ha validado su robustez fuera de los entornos de entrenamiento descritos en el paper.
- Riesgo de alucinación con consecuencias físicas: un planificador puede emitir secuencias de acciones no ejecutables, referencias a objetos inexistentes o comandos peligrosos. Es imprescindible validar y limitar las acciones en la capa de control del robot, nunca ejecutar la salida del modelo de forma directa.
- Datos de entrenamiento no documentados: se desconoce la composición del dataset de SFT y del entorno de RL, lo que impide evaluar sesgos heredados o contaminación de benchmarks.
- Idiomas y contexto sin especificar: no se declara qué idiomas cubre ni cuál es la ventana de contexto, algo crítico para diálogos multi-turno largos en robótica.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero se trata de un modelo derivado y conviene verificar los términos del modelo base Qwen/Qwen3.5-9B y de las dependencias antes de un despliegue comercial.
- Empaquetado poco habitual: el repositorio contiene dos subcarpetas de modelo completo en lugar de una raíz única; algunas herramientas de despliegue esperan una estructura plana y requieren indicar `subfolder="rl-v006"` o `subfolder="sft"`.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, por lo que el despliegue en GPUs de consumo exige generar las conversiones por cuenta propia y validar su degradación.
- Mantenimiento incierto: repositorio de un único autor, sin versión etiquetada ni garantía de actualizaciones; la fecha de creación (2026-10-21) y la actualización (mismo día) indican una publicación reciente y sin revisiones posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ciciciciliu/AgenticRoboRL-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Artículo (arXiv:2610.28589): https://arxiv.org/abs/2610.28589
- Código: https://github.com/L-CodingSpace/AgenticRoboRL
