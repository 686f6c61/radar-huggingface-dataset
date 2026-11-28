# jain98aayush/AgenticSearch-R2A-step80

## Resumen

AgenticSearch-R2A-step80 es un adaptador LoRA de rango 32 entrenado sobre el modelo base Qwen3-4B-Instruct-2507 (en su variante cuantizada de Unsloth), desarrollado por Aayush Jain en el marco de su investigación "Small Open-Weight Search Agents". No se trata de un modelo completo, sino de pesos de adaptador (66 millones de parámetros en F32, 264 MB) que modifican el comportamiento del modelo base para convertirlo en un agente de búsqueda y recuperación de pasajes multi-turno.

El modelo resuelve un problema concreto: la recuperación de información en preguntas de múltiples saltos (multi-hop QA) mediante un bucle agéntico de consultas y recuperación. El adaptador se entrena con GRPO (Group Relative Policy Optimization) usando una recompensa basada en Recall@10 menos una penalización por llamadas malformadas. La condición evaluada, etiquetada como "R2a@80 messaging", alcanza un Recall@10 de 0,5617 y un nDCG@10 de 0,4799 sobre una muestra de 100 preguntas.

Es relevante ahora porque ejemplifica la tendencia de agentes de búsqueda de pequeño tamaño (4B parámetros) que pueden desplegarse en hardware modesto, y porque documenta de forma transparente sus limitaciones metodológicas: los resultados son de desarrollo sobre el mismo conjunto usado para selección, sin validación multi-semilla ni held-out independiente. El adaptador no funciona de forma autónoma; requiere el arnés de recuperación completo (corpus BM25, herramientas, prompts y fusión RRF) publicado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32, alpha 64, dropout 0) sobre transformer Qwen3-4B-Instruct-2507 |
| Parametros totales | 66.060.288 parametros del adaptador (F32); el modelo base tiene 4B (no incluido en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | El adaptador se distribuye en F32; el base de entrenamiento era bnb-4bit (bitsandbytes) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (adaptador); licencia del modelo base aplicable por separado |
| Formato de pesos | safetensors (PEFT/LoRA); tamano del repo 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4.000 millones de parámetros. La configuración LoRA declarada activa adaptadores en las proyecciones q/k/v/o y gate/up/down, con rango 32, alpha 64 y dropout cero. El entrenamiento se realizó con GRPO, un algoritmo de optimización por refuerzo que estima ventajas relativas dentro de grupos de muestras generadas, sin necesidad de un modelo crítico separado. La recompensa combina Recall@10 con una penalización explícita por llamadas malformadas a herramientas, lo que incentiva tanto la calidad de recuperación como el uso correcto del protocolo de herramientas.

Los datos de entrenamiento provienen de preguntas multi-hop de HotpotQA, 2WikiMultihopQA y MuSiQue, mapeadas a pasajes de Wikipedia y recogidas en el dataset `jain98aayush/AgenticSearch-OpenMultiHop`. No se utilizaron datos de BrowseComp-Plus para el entrenamiento del Track B. La model card advierte de una discrepancia de linaje: las configuraciones de entrenamiento congeladas nombran `Qwen/Qwen3-4B-Instruct-2507` en la revisión `cdbee75f...`, mientras que la config del adaptador referencia el base cuantizado de Unsloth sin revisión exacta; el autor preserva ambas referencias y no reclama un linaje de pesos completamente verificado. Tampoco se estableció la versión histórica de vLLM usada en la evaluación.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen3-4B-Instruct-2507.
- Recuperación de pasajes en un bucle agéntico multi-turno: el modelo formula consultas, invoca herramientas de búsqueda y refina iterativamente hasta responder.
- Razonamiento multi-hop: entrenado específicamente para preguntas que requieren encadenar evidencia de varias fuentes.
- Tool calling / function calling en el marco del arnés de recuperación del autor (BM25, herramientas de búsqueda y fusión RRF).
- Comportamiento agéntico con límite de turnos y prompts definidos por el arnés; la media registrada es de 3,79 agentes por pregunta.
- No incluye visión, audio ni modo thinking explícito documentado en la información disponible.

## Casos de uso

- Investigación académica en agentes de búsqueda: reproducción del experimento "R2a@80 messaging" usando el snapshot de código y el runbook del Track B, útil para estudiar el efecto del entrenamiento GRPO en recuperación multi-hop.
- Recuperación de evidencia en preguntas multi-hop: el adaptador encadena consultas BM25 sobre un corpus Wikipedia para reunir pasajes que responden a preguntas de HotpotQA, 2WikiMultihopQA o MuSiQue, aprovechando su entrenamiento específico en estos dominios.
- Evaluación comparativa de adaptadores LoRA para búsqueda: sirve como brazo de comparación frente a otros checkpoints o condiciones del mismo estudio, con métricas Recall@10 y nDCG@10 ya registradas.
- Prototipado de asistentes de documentación técnica: con un corpus BM25 propio y el arnés adaptado, puede orquestar búsquedas iterativas sobre manuales internos, aunque requiere validación fuera del dominio de entrenamiento.
- Base para experimentos de RL aplicado a agentes: al ser un adaptador pequeño (264 MB) sobre un base de 4B, permite iterar entrenamientos con GRPO en GPUs de gama alta consumer.
- Docencia y demostraciones de agentes de recuperación: su tamaño reducido y licencia Apache-2.0 facilitan su uso en cursos y talleres sobre RAG agéntico, siempre con el arnés completo.

## Benchmarks y rendimiento

| Condicion | Preguntas | Recall@10 | nDCG@10 | Agentes medios | Tokens prompt+completion medios |
|---|---:|---:|---:|---:|---:|
| R2a@80 messaging | 100 | 0,5617 | 0,4799 | 3,79 | 58.645 |

Estos resultados son retrospectivos, de desarrollo, sobre las mismas 100 preguntas usadas en la selección del checkpoint, a partir de una única trayectoria de entrenamiento. No son resultados held-out, multi-semilla ni de aplicación empresarial. Los tokens incluyen contexto repetido. El paper y sus exportaciones numéricas contienen intervalos de confianza emparejados y los controles de agentes independientes. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el adaptador en F32 ocupa unos 264 MB; el modelo base de 4B en 4 bits requiere aproximadamente 2,5-3 GB, y en FP16 unos 8 GB (estimación estándar para 4B, no verificada en esta publicación).
- GPU recomendadas: el autor indica que el patrón de carga CUDA/PEFT ilustrativo no se ha ejecutado en GPU para esta release; la carga del base cuantizado exige bitsandbytes y CUDA compatibles con el entorno de paquetes registrado.
- Cabe en GPU consumer: sí, un base de 4B en 4 bits es apto para GPUs con 8 GB o más (por ejemplo RTX 3060/4060 en adelante), si bien no hay medición publicada para este adaptador.
- Despliegue: PEFT (`AutoPeftModelForCausalLM`) con transformers; el arnés de evaluación requiere el entorno del autor. No se documenta soporte verificado para vLLM, llama.cpp, Ollama o TGI en esta release; la versión histórica de vLLM no se estableció.
- Latencia y throughput: no disponibles. El único dato de coste es la media de 58.645 tokens de prompt+completion por pregunta en la condición evaluada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgenticSearch-R2A-step80 | 66M adaptador sobre base 4B | no disponible | LoRA + GRPO para búsqueda multi-hop | Apache-2.0 | Hugging Face (adaptador) |
| Modelo base Qwen3-4B-Instruct-2507 | 4B | no disponible | LLM instruct generalista | licencia Qwen aplicable | Hugging Face |
| Otros brazos del estudio AgenticSearch | adaptadores LoRA sobre el mismo base | no disponible | Condiciones alternativas del mismo experimento | Apache-2.0 (adaptadores) | Hugging Face Space del autor |

No se dispone de datos de benchmarks comparables con otros agentes de búsqueda en la información proporcionada.

## Limitaciones y advertencias

- Los resultados (Recall@10 0,5617, nDCG@10 0,4799) son de desarrollo sobre las mismas 100 preguntas usadas para seleccionar el checkpoint; no constituyen evidencia held-out ni multi-semilla.
- El adaptador no funciona de forma autónoma: la generación de texto simple no reproduce la condición de recuperación; se requiere el corpus BM25, herramientas, prompts, límites de turnos y fusión RRF del autor.
- Linaje de pesos no completamente verificado: discrepancia entre la revisión del base nombrada en las configs de entrenamiento y la referenciada en la config del adaptador, sin revisión exacta del base cuantizado.
- El ejemplo de carga CUDA/PEFT no se ha ejecutado en GPU para esta publicación.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Riesgo de alucinación y de llamadas malformadas a herramientas fuera del arnés de entrenamiento; la penalización por llamadas malformadas sugiere que este fallo era frecuente durante el entrenamiento.
- Dominio de entrenamiento limitado a HotpotQA, 2WikiMultihopQA y MuSiQue sobre Wikipedia; el rendimiento fuera de ese dominio no está medido.
- Licencia Apache-2.0 para el adaptador, pero la licencia del modelo base y del tokenizer aplican independientemente y deben revisarse para uso comercial.
- Sin descargas ni likes registrados en Hugging Face en el momento de la consulta; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/jain98aayush/AgenticSearch-R2A-step80
- Space del proyecto "Small Open-Weight Search Agents": https://huggingface.co/spaces/jain98aayush/AgenticSearch-Research
- Dataset de entrenamiento: https://huggingface.co/datasets/jain98aayush/AgenticSearch-OpenMultiHop
- Snapshot del código (Track B): https://huggingface.co/spaces/jain98aayush/AgenticSearch-Research/resolve/main/downloads/AgenticSearch-code-v0.1.0.zip
- Modelo base: https://huggingface.co/unsloth/qwen3-4b-instruct-2507-unsloth-bnb-4bit
- Modelo base de referencia upstream: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
