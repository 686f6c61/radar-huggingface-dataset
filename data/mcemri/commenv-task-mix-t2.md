# mcemri/commenv-task-mix-t2

## Resumen

`mcemri/commenv-task-mix-t2` es un checkpoint de investigación publicado por el usuario mcemri (sin afiliación institucional declarada en la model card) que parte de `Qwen/Qwen3-4B` y lo entrena mediante aprendizaje por refuerzo (GRPO) para operar como un equipo de tres agentes que se comunican a través de un tablero compartido. El modelo no es un producto: el autor lo describe explícitamente como "research checkpoints, not a product", orientado a estudiar comunicación emergente y coordinación multiagente.

El entrenamiento parte del modelo final de `mcemri/commenv-e1-t2-combined` (ya entrenado con puzles lógicos divididos, primero en solitario y luego en equipo) y aplica 40 pasos adicionales de GRPO sobre una mezcla de tres tareas: ejecución conjunta de experimentos (27 combinaciones de tres ajustes con resultados reales de las tablas de barrido de FCNet), preguntas sobre documentos repartidos entre agentes (HotpotQA y MuSiQue) y búsqueda en Wikipedia en tres partes. Cada paso consta de 32 rondas y cada tarea se juega 8 veces por paso.

Su relevancia es acotada pero específica: demuestra que un modelo de 4B parámetros puede mejorar sustancialmente en tareas de coordinación multiagente con muy pocos pasos de RL (de 15% a 52% en experimentos), manteniendo además el rendimiento en tareas no incluidas en la mezcla. Es material para investigadores que trabajan en sistemas multiagente, comunicación aprendida y RL aplicado a LLM, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B; detalles internos no especificados en la model card) |
| Parámetros totales | 4B (modelo base Qwen3-4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-4B; no confirmada en la model card) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors sin cuantizar, 8,8 GB) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carpeta `export/global_step_40/policy`); checkpoint del entrenador en 4 shards, 22,5 GB (`ckpt/global_step_40`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3-4B`, un transformer decoder-only de 4B parámetros. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención), por lo que esos datos deben consultarse en la ficha del modelo base. El ajuste se realiza con GRPO (Group Relative Policy Optimization) sobre un entorno de comunicación multiagente: tres copias del mismo modelo interactúan sobre un tablero compartido, y cada paso de entrenamiento comprende 32 rondas con 8 repeticiones de cada tarea de la mezcla.

La mezcla de tareas incluye tres escenarios: (1) experimentos conjuntos con 27 combinaciones de tres ajustes, usando resultados reales de tablas de barrido de FCNet; (2) preguntas sobre documentos repartidos entre los agentes, basadas en HotpotQA y MuSiQue; y (3) búsqueda en Wikipedia fragmentada en tres partes, con preguntas de HotpotQA y cada agente buscando en un tercio de la colección. El punto de partida es el modelo final de `mcemri/commenv-e1-t2-combined`, entrenado previamente con puzles lógicos divididos en solitario y en equipo. No se especifican en la model card el número de tokens de entrenamiento ni la composición detallada del dataset más allá de las tareas citadas.

## Capacidades

- Generación de texto y razonamiento en el marco de Qwen3-4B, con el ajuste adicional orientado a tareas colaborativas.
- Comunicación multiagente: el modelo está entrenado para operar como una de tres copias que comparten un tablero y se coordinan.
- Ejecución conjunta de experimentos: resolución de problemas de selección de hiperparámetros sobre 27 combinaciones de tres ajustes.
- Preguntas sobre documentos repartidos: razonamiento sobre información distribuida entre agentes (HotpotQA, MuSiQue).
- Búsqueda fragmentada: búsqueda en Wikipedia dividida en tres partes, con cada agente cubriendo un tercio de la colección.
- Decisiones de grupo: rendimiento medido en HiddenBench (52% antes del run, 59% después), aunque no formaba parte de la mezcla de entrenamiento.
- Búsqueda de artículos: 31% antes y 31% después en la tarea de paper search, también fuera de la mezcla.
- Puzles lógicos divididos: mantiene un 96% de agentes completamente acertados.
- No se declaran capacidades de tool calling, function calling, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Investigación en comunicación emergente: usar el checkpoint como punto de partida para estudiar cómo tres copias del mismo modelo desarrollan protocolos de comunicación sobre un tablero compartido, comparando con el modelo base y con el checkpoint previo `commenv-e1-t2-combined`.
- Experimentos de RL aplicado a LLM: reproducir o extender el entrenamiento GRPO con 40 pasos sobre mezclas de tareas, usando el checkpoint del entrenador (`ckpt/global_step_40`, 22,5 GB con estado del optimizador) para continuar el run.
- Evaluación de generalización multiagente: medir la transferencia a tareas no incluidas en la mezcla (HiddenBench, paper search) y analizar cómo varía con la semilla aleatoria, tal como advierte el autor.
- Selección de hiperparámetros colaborativa: emplear el escenario de experimentos con 27 combinaciones como banco de pruebas para agentes que deben consensuar configuraciones a partir de resultados reales de barrido.
- Razonamiento sobre documentos distribuidos: probar arquitecturas de recuperación donde la información está repartida entre varios agentes (HotpotQA, MuSiQue) y evaluar la calidad del ensamblaje de respuestas.
- Búsqueda federada simulada: usar la tarea de búsqueda en Wikipedia en tres partes como entorno controlado para estudiar estrategias de búsqueda dividida y agregación de resultados entre agentes.
- Estudio de robustez de semilla: dado que el autor advierte que las diferencias en tareas no entrenadas pueden cambiar con la semilla, el checkpoint sirve para diseñar experimentos de variabilidad entre runs.

## Benchmarks y rendimiento

Resultados reportados por el autor en conjuntos reservados (kept-aside sets), comparando antes de este run y después de 40 pasos:

| Tarea | Antes | Después (40 pasos) | Referencia: run de una sola tarea |
|---|---|---|---|
| Experimentos (rondas FCNet) | 15% | 52% | 60% |
| Experimentos (rondas NAS-Bench-201, tablas no vistas) | No disponible | 38% | No disponible |
| HotpotQA | 50% | 55% | 55% |
| MuSiQue | 36% | 37% | No disponible |
| Búsqueda en Wikipedia | 39% | 45% | 46% |
| Decisiones de grupo (HiddenBench, fuera de la mezcla) | 52% | 59% | No disponible |
| Búsqueda de artículos (paper search, fuera de la mezcla) | 31% | 31% | No disponible |
| Puzles lógicos divididos (agentes totalmente acertados) | No disponible | 96% | No disponible |

Métrica: porcentaje de agentes con la respuesta correcta. El autor señala que se trata de un único run de entrenamiento y que las diferencias en tareas no entrenadas pueden variar con la semilla aleatoria.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 8,8 GB en precisión original; en fp16 serían aproximadamente 8 GB, y en cuantizaciones de 8 bits o 4 bits bajarían a rangos de 4-5 GB y 2-3 GB respectivamente (estimación a partir del tamaño del checkpoint, no confirmada por el autor).
- GPU recomendadas: no especificadas en la model card. Por tamaño, cabe en GPUs de consumo con 12-16 GB o más (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) en cuantización, y en A100/H100 para entrenamiento o inferencia en precisión completa.
- Entrenamiento: el checkpoint del entrenador ocupa 22,5 GB en 4 shards (pesos y estado del optimizador), lo que requiere al menos esa capacidad de almacenamiento y VRAM suficiente para el estado completo; el autor no detalla los requisitos de GPU para el run.
- Opciones de despliegue: la model card solo documenta carga con `transformers` (`AutoModelForCausalLM.from_pretrained` con subfolder). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mcemri/commenv-task-mix-t2` | 4B | No disponible | RL multiagente sobre Qwen3-4B | Apache-2.0 | Hugging Face, 0 descargas |
| `mcemri/commenv-e1-t2-combined` | 4B | No disponible | Punto de partida: puzles lógicos divididos en solitario y en equipo | No disponible | Hugging Face |
| `Qwen/Qwen3-4B` | 4B | No disponible en esta ficha | Modelo base generalista | Apache-2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (checkpoints de investigación multiagente) no está disponible en la información proporcionada. Frente al modelo base, la diferencia medible es el rendimiento en las tareas de la mezcla (por ejemplo, 52% en experimentos frente a 15% antes del run), pero no se aportan comparaciones directas contra Qwen3-4B sin ajustar en esas mismas tareas.

## Limitaciones y advertencias

- Checkpoint de investigación, no un producto: el autor lo declara explícitamente; no está pensado para despliegue en producción.
- Un único run de entrenamiento: las diferencias en tareas no entrenadas pueden cambiar con la semilla aleatoria, según advierte el autor.
- Rendimiento modesto en varias tareas: MuSiQue 37%, búsqueda en Wikipedia 45%, paper search 31%; no son niveles aptos para uso fiable sin supervisión.
- Sesgos conocidos: no documentados en la model card; al heredar Qwen3-4B, arrastra los sesgos del modelo base y de los datos de entrenamiento de las tareas (HotpotQA, MuSiQue, tablas de FCNet y NAS-Bench-201).
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Idiomas: no declarados; el entrenamiento se centra en tareas en inglés (HotpotQA, MuSiQue, Wikipedia), por lo que el rendimiento multilingüe es incierto.
- Limitaciones de contexto: no se especifica la longitud de contexto efectiva ni cómo afecta el reparto de información entre agentes a secuencias largas.
- Licencia Apache-2.0: permite uso comercial, pero al ser un checkpoint de investigación con rendimiento limitado, el uso comercial no está recomendado por el propio autor.
- El checkpoint del entrenador no incluye `trainer_state.pt`, lo que puede complicar la reanudación exacta del entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-mix-t2
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint previo: https://huggingface.co/mcemri/commenv-e1-t2-combined
- No se han encontrado en la información proporcionada papers, blogs, repositorios ni demos adicionales.
