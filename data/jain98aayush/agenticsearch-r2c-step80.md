# jain98aayush/AgenticSearch-R2C-step80

## Resumen

AgenticSearch-R2C-step80 es un adaptador LoRA de rango 32 entrenado sobre el modelo base Qwen3-4B-Instruct-2507 (en su variante cuantizada de Unsloth) para tareas de búsqueda agéntica y recuperación de pasajes en entornos multi-hop. Lo desarrolla Aayush Jain como parte de la investigación "Small Open-Weight Search Agents", y corresponde a la condición de "coordinador" (R2c) en el checkpoint 80 de una trayectoria de entrenamiento con GRPO. No es un modelo autónomo: requiere el modelo base y un arnés de recuperación específico (corpus BM25, herramientas, prompts y fusión RRF) para reproducir el comportamiento evaluado.

El adaptador añade 66.060.288 parámetros en F32 (unos 264 MB) sobre las proyecciones q/k/v/o y gate/up/down del transformer Qwen3 de 4.000 millones de parámetros. Su propósito es que un agente pequeño y abierto pueda planificar consultas, invocar herramientas de búsqueda y seleccionar pasajes relevantes en preguntas que requieren razonamiento sobre múltiples saltos, un escenario tradicionalmente reservado a modelos mucho mayores o a sistemas cerrados.

La relevancia actual reside en que demuestra que un adaptador de bajo coste sobre un modelo de 4B puede alcanzar un Recall@10 de 0,5100 y un nDCG@10 de 0,4379 en una muestra de 100 preguntas, con un consumo medio de 20.462 tokens por consulta y 2,95 agentes implicados. Los resultados son de desarrollo retrospectivo, no de un conjunto de validación independiente, por lo que deben interpretarse con cautela.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (rank 32, alpha 64, dropout 0) sobre transformer Qwen3-4B-Instruct-2507 |
| Parámetros totales | 66.060.288 parámetros del adaptador (F32); el base Qwen3-4B ronda los 4.000 millones |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del base Qwen3-4B-Instruct-2507) |
| Tipos de cuantización | El base referenciado está en bnb-4bit; el adaptador se distribuye en F32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (adaptador); la licencia del base y del tokenizador aplica por separado |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros. La configuración LoRA registrada mantiene rank 32, alpha 64 y dropout cero, con adaptadores en las proyecciones de atención (q, k, v, o) y en las proyecciones del MLP (gate, up, down). El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) y una recompensa de equipo definida como Recall@10 menos una penalización registrada por llamadas malformadas a herramientas.

Los datos de entrenamiento provienen de preguntas multi-hop abiertas de HotpotQA, 2WikiMultihopQA y MuSiQue, mapeadas a pasajes de Wikipedia. El conjunto de candidatos y la porción congelada de 100 preguntas para selección están documentados en el dataset `jain98aayush/AgenticSearch-OpenMultiHop`. No se usaron datos de BrowseComp-Plus para el entrenamiento de Track B. Existe una discrepancia documentada entre la configuración del adaptador (base cuantizado de Unsloth sin revisión exacta) y las configuraciones de entrenamiento congeladas (que nombran `Qwen/Qwen3-4B-Instruct-2507` en la revisión `cdbee75f17c01a7cc42f958dc650907174af0554`); el autor conserva ambos hechos y no reclama un linaje de pesos base completamente verificado.

## Capacidades

- Generación de texto conversacional en inglés sobre el base Qwen3-4B-Instruct-2507.
- Búsqueda agéntica: planificación de consultas y uso de herramientas de recuperación en múltiples turnos.
- Recuperación de pasajes (passage retrieval) en preguntas multi-hop.
- Razonamiento multi-step con coordinación entre agentes (condición "coordinador").
- Llamada a herramientas (tool calling) dentro del arnés de recuperación del paper.
- Fusión de resultados mediante RRF (Reciprocal Rank Fusion) según la configuración evaluada.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo "thinking" específicas más allá de las heredadas del base.

## Casos de uso

- Búsqueda agéntica en bases documentales: el adaptador permite que un agente de 4B formule consultas sucesivas y seleccione pasajes relevantes en corpus tipo Wikipedia, útil para asistentes de investigación internos con coste de inferencia contenido.
- Sistemas de preguntas y respuestas multi-hop: para preguntas que requieren combinar evidencia de varios documentos, el modelo coordina hasta ~3 agentes por consulta (media de 2,95) y fusiona resultados con RRF.
- Recuperación aumentada en pipelines RAG: puede actuar como planificador de consultas dentro de un pipeline existente con BM25, reduciendo la dependencia de modelos frontales de mayor tamaño.
- Evaluación de agentes de búsqueda: sirve como referencia reproducible (con el snapshot de código y el runbook Track B) para comparar estrategias de coordinación y recompensas en investigación académica.
- Prototipado de asistentes de atención al cliente con base de conocimiento: con el arnés adecuado, permite responder consultas que exigen cruzar varias fuentes documentales.
- Investigación en RL para agentes: el adaptador y su configuración GRPO documentada facilitan experimentos de ajuste con recompensas de recuperación (Recall@10) y penalizaciones por llamadas malformadas.
- Despliegue de bajo coste en GPU de consumo: al ser un adaptador de ~264 MB sobre un base de 4B cuantizado a 4 bits, puede ejecutarse en entornos con recursos limitados (sujeto a validar el arnés completo).

## Benchmarks y rendimiento

| Condición | Preguntas | Recall@10 | nDCG@10 | Agentes medios | Tokens medios (prompt+completion) |
|---|---:|---:|---:|---:|---:|
| R2c@80 coordinador | 100 | 0,5100 | 0,4379 | 2,95 | 20.462 |

Estos resultados son retrospectivos, obtenidos sobre las mismas 100 preguntas usadas en la selección, a partir de una única trayectoria de entrenamiento para esta rama. No son resultados en un conjunto de validación independiente, multi-semilla ni de aplicación empresarial. Los tokens incluyen contexto repetido. El paper y sus exportaciones numéricas contienen intervalos de confianza emparejados y los controles de agentes independientes. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar para este adaptador.

## Requisitos de hardware

- VRAM estimada: el adaptador en F32 ocupa ~264 MB; el base Qwen3-4B en 4 bits requiere aproximadamente 2,5-3 GB adicionales, más overhead de contexto (las consultas evaluadas consumen de media ~20.000 tokens, lo que incrementa notablemente el uso de memoria KV).
- GPU recomendadas: no especificadas por el autor. Para el base de 4B en 4 bits, una RTX 4090 (24 GB) o superior es suficiente; A100/H100 para cargas concurrentes o contextos largos.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090/4090 y GPUs con 12-16 GB o más, siempre que se gestione el contexto largo.
- Opciones de despliegue: el autor muestra un patrón con `transformers` + `peft` (`AutoPeftModelForCausalLM`); no se documentan integraciones verificadas con vLLM, llama.cpp, Ollama o TGI. La carga del base cuantizado requiere bitsandbytes/CUDA compatibles y el entorno de paquetes registrado.
- Latencia y throughput: no disponibles. El patrón de carga mostrado no fue ejecutado en GPU para esta publicación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgenticSearch-R2C-step80 | Adaptador 66M sobre base 4B | No disponible | Búsqueda agéntica multi-hop (LoRA + GRPO) | Apache-2.0 | Hugging Face |
| Qwen3-4B-Instruct-2507 (base) | ~4.000M | No disponible | LLM generalista con tool calling | Según upstream | Hugging Face |
| Alternativas de agentes de búsqueda open-weight | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos comparativos de rendimiento con otros agentes de búsqueda de tamaño similar; el paper referenciado contiene los controles de agentes independientes que permitirían esa comparación.

## Limitaciones y advertencias

- Los resultados (Recall@10 0,5100; nDCG@10 0,4379) son de desarrollo retrospectivo sobre las mismas 100 preguntas usadas para selección; no constituyen validación independiente ni multi-semilla.
- El adaptador no funciona de forma aislada: requiere el corpus BM25, las herramientas, los prompts, los límites de turnos, la configuración de arquitectura y la fusión RRF del paper para reproducir la condición evaluada.
- Linaje de pesos base no completamente verificado: discrepancia entre la revisión del base cuantizado de Unsloth y la revisión de Qwen3-4B-Instruct-2507 registrada en las configuraciones de entrenamiento.
- El patrón de carga CUDA/PEFT mostrado no fue ejecutado en GPU para esta publicación; posibles problemas de compatibilidad con bitsandbytes/CUDA.
- Soporte únicamente en inglés según la model card.
- Riesgo de alucinación y de llamadas malformadas a herramientas, mitigado parcialmente por la penalización incluida en la recompensa de entrenamiento.
- Sesgos: no documentados explícitamente; heredados de los datos de HotpotQA, 2WikiMultihopQA, MuSiQue y Wikipedia.
- La licencia Apache-2.0 cubre solo los pesos del adaptador; las licencias del modelo base y del tokenizador aplican de forma independiente para uso comercial.
- No se han publicado mediciones de rendimiento nuevas para el empaquetado de esta publicación.
- El manuscrito asociado incluye una declaración de asistencia por IA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jain98aayush/AgenticSearch-R2C-step80
- Dataset de entrenamiento: https://huggingface.co/datasets/jain98aayush/AgenticSearch-OpenMultiHop
- Espacio de investigación "Small Open-Weight Search Agents": https://huggingface.co/spaces/jain98aayush/AgenticSearch-Research
- Snapshot del código (v0.1.0): https://huggingface.co/spaces/jain98aayush/AgenticSearch-Research/resolve/main/downloads/AgenticSearch-code-v0.1.0.zip
- Modelo base referenciado: https://huggingface.co/unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit
- Modelo base original: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
