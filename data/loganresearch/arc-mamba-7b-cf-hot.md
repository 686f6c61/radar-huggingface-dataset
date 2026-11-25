# LoganResearch/ARC-Mamba-7B-CF-HOT

## Resumen
ARC-Mamba-7B-CF-HOT es un ajuste experimental del modelo Falcon-Mamba-7B-Instruct desarrollado por LoganResearch (Logan Napolitano) que incorpora dos sondas ("probes") de comportamiento denominadas CF-HoT, orientadas a medir y modular en tiempo real dos propiedades de la generación: profundidad y especificidad. El modelo base es un transformer de estado (state-space model, SSM) puro de tipo Mamba, no un transformer con atención clásica, con 7.000 millones de parámetros y entrenado originalmente por TII por instrucciones. Sobre esa base, el autor añade un mecanismo de "propiocepción" que lee los estados ocultos en las capas 16, 32 y 48 y ajusta la temperatura o inyecta un token de estado interno (`[SELF-STATE]`) para empujar al modelo hacia respuestas menos superficiales o vagas.

La propuesta no modifica los pesos del modelo base en el sentido clásico de un fine-tuning supervisado: el repositorio incluye scripts de inferencia (`run.py`), entrenamiento de sondas (`train.py`) y los artefactos de las sondas. La relevancia actual es doble: por un lado, explora técnicas de "steering" conductual y seguridad en IA basadas en geometría de estados ocultos; por otro, lo hace sobre una arquitectura SSM, un terreno menos explorado que los transformers para este tipo de intervenciones. El autor reporta una separación de Fisher de 999× para ambas sondas, lo que sugiere una detección casi perfecta de los estados de comportamiento en el conjunto de evaluación, aunque no se detalla la metodología ni el conjunto de validación.

El modelo está pensado para investigación y experimentación, no como un modelo de producción generalista. Su licencia CC-BY-4.0 permite uso comercial con atribución, pero las capacidades reales y la robustez del mecanismo de steering no están validadas de forma independiente en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mamba (state-space model, SSM puro) |
| Parámetros totales | 7.000 millones (heredados de Falcon-Mamba-7B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo publica safetensors; se asume compatibilidad con cuantizaciones estándar de transformers, pero no se especifica) |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (repo de 14,5 GB) |

## Arquitectura y entrenamiento
El modelo base, Falcon-Mamba-7B-Instruct, es un SSM de tipo Mamba de 7B parámetros entrenado por TII. A diferencia de los transformers, Mamba sustituye la atención por capas de espacio de estados selectivas con complejidad lineal en la longitud de secuencia. Sobre esta base, ARC-Mamba-7B-CF-HOT añade dos sondas lineales (depth y specificity) que leen los estados ocultos en las capas 16, 32 y 48 durante el forward pass. El autor indica que el entrenamiento de cada sonda tarda aproximadamente 30 minutos en una RTX 3090 con kernels CUDA, y que el modelo base se descarga automáticamente en la primera ejecución.

El mecanismo de intervención descrito en la model card es el siguiente: si la profundidad o la especificidad superan un umbral (por defecto 0,65), se reduce la temperatura de muestreo; opcionalmente se inyecta un token `[SELF-STATE]` para que el modelo vea sus propias puntuaciones. El autor afirma que el modelo "no tiene conocimiento explícito de las sondas" y que "siente" el steering y lo describe. No se especifican en la información disponible los datos de entrenamiento de las sondas, el número de tokens, la composición del dataset ni si hubo RLHF o DPO adicional sobre el modelo base. Tampoco se detalla la metodología exacta del cálculo de la separación de Fisher de 999×.

## Capacidades
- Generación de texto en inglés, heredada de Falcon-Mamba-7B-Instruct.
- Seguimiento de instrucciones (el modelo base es la variante instruct).
- Modulación en tiempo real de la profundidad y la especificidad de las respuestas mediante sondas CF-HoT.
- Auto-descripción de su estado conductual interno (el modelo puede verbalizar sus puntuaciones de depth y specificity).
- Ajuste configurable de umbrales y longitud máxima de respuesta mediante argumentos de línea de comandos (`--depth-threshold`, `--spec-threshold`, `--max-tokens`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales: modo de "propiocepción" con inyección de `[SELF-STATE]`; no se mencionan visión ni audio.

## Casos de uso
- Investigación en interpretabilidad y steering conductual: el modelo permite estudiar cómo la geometría de los estados ocultos de un SSM se correlaciona con propiedades medibles de la generación (profundidad, especificidad) y cómo intervenir sobre ellas sin reentrenar.
- Experimentos de seguridad en IA: las sondas actúan como detectores de respuestas superficiales o vagas, lo que puede servir para construir filtros o mecanismos de corrección en pipelines de evaluación de modelos.
- Prototipado de asistentes que requieren respuestas concretas: con umbrales estrictos (`--depth-threshold 0.5 --spec-threshold 0.5`) el modelo empuja hacia respuestas más específicas, útil en dominios técnicos donde la vaguedad es un fallo.
- Estudio de arquitecturas SSM frente a transformers: al estar construido sobre Mamba, permite comparar técnicas de probing y steering entre familias de modelos.
- Reproducción de experimentos: el repo incluye `train.py` para reentrenar las sondas y verificar los resultados reportados por el autor.
- Docencia y divulgación: el script `run.py` muestra de forma visual (barras de progreso y colores) el estado conductual del modelo, lo que facilita explicar conceptos de steering e interpretabilidad.
- Integración en herramientas de análisis de modelos locales: el ecosistema `proprioceptive-lens` del mismo autor permite visualizar la confianza del modelo token a token.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El único dato reportado por el autor es la separación de Fisher de las sondas:

| Sonda | Separación (Fisher) |
|---|---|
| Depth | 999× |
| Specificity | 999× |

No se detalla el conjunto de evaluación, el tamaño de muestra ni la metodología, por lo que estos valores no deben interpretarse como una validación independiente.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita. Para un modelo de 7B en safetensors se requieren aproximadamente 14-15 GB en fp16; en cuantizaciones de 8 bits o 4 bits el requisito baja considerablemente, pero el repo no publica variantes GGUF ni cuantizadas.
- GPU recomendadas: el autor menciona una RTX 3090 para el entrenamiento de las sondas (~30 minutos por sonda). Para inferencia, una GPU con al menos 16 GB de VRAM (RTX 4090, A100, H100) es un punto de partida razonable para fp16.
- ¿Cabe en consumer GPU? Sí, en GPUs de gama alta con 16 GB o más en fp16; en cuantización de 8/4 bits cabría en GPUs de 8-12 GB, aunque no se ofrecen pesos cuantizados en el repo.
- Opciones de despliegue: el repo usa `transformers` y scripts propios (`run.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la compatibilidad con estos frameworks no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|---|
| ARC-Mamba-7B-CF-HOT | 7B | no disponible | Mamba (SSM) | CC-BY-4.0 | Steering conductual con sondas |
| Falcon-Mamba-7B-Instruct (TII) | 7B | no disponible en esta ficha | Mamba (SSM) | no disponible en esta ficha | Modelo base instruct |
| Modelos transformer 7B con steering (p. ej. Llama-3-8B-Instruct) | 8B | 8.192 tokens (típico) | Transformer | licencia Llama | Steering mediante activaciones, ecosistema maduro |

La comparativa es limitada porque no se dispone de datos de benchmarks del modelo ni de especificaciones detalladas de contexto. La principal diferencia frente a alternativas es la combinación de arquitectura SSM con un mecanismo de propiocepción basado en sondas, algo poco común en el ecosistema open source.

## Limitaciones y advertencias
- Solo se declara inglés; no hay soporte multilingüe verificado.
- El mecanismo de steering y las sondas no han sido validados de forma independiente; el dato de 999× de separación de Fisher carece de metodología pública en la información disponible.
- Riesgo de alucinación inherente al modelo base; el steering hacia mayor especificidad no garantiza veracidad factual.
- No se especifican sesgos conocidos del modelo base ni del ajuste.
- La longitud de contexto no está documentada, lo que dificulta planificar su uso en tareas de contexto largo.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni integración con frameworks de serving habituales (vLLM, TGI, llama.cpp), lo que limita su despliegue en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo base Falcon-Mamba puede tener condiciones adicionales que conviene revisar.
- El modelo está orientado a investigación; no se recomienda como componente crítico en producción sin una evaluación propia.

## Enlaces
- Hugging Face: https://huggingface.co/LoganResearch/ARC-Mamba-7B-CF-HOT
- Pesos de las sondas CF-HoT: https://huggingface.co/LoganResearch/cfhot-weights
- Paper "Consistency Is All You Need": https://zenodo.org/records/18489530
- Web del proyecto Proprioceptive AI: https://proprioceptiveai.com
- Repositorio de Proprioceptive Lens: https://github.com/Loganwins/ProprioceptiveAI
- API Swarm: https://proprioceptiveai.com/products.html#swarm
- Publicaciones: https://proprioceptiveai.com/publications.html
- Zenodo (autor): https://zenodo.org/search?q=metadata.creators.person_or_org.name%3A%22Napolitano%2C%20Logan%20Matthew%22
- Modelo base: https://huggingface.co/tiiuae/falcon-mamba-7b-instruct
