# Plans11/rlm-qwen3-8b-v0.1

## Resumen

RLM-Qwen3-8B-v0.1 es un ajuste fino (post-entrenamiento) del modelo Qwen3-8B de Alibaba, publicado por el usuario Plans11 en Hugging Face. El modelo nace de los experimentos descritos en el artículo "Recursive Language Models" (arXiv:2512.24601) y está diseñado específicamente para operar dentro del scaffold de inferencia del repositorio RLM del autor del paper. No se trata de un modelo de propósito general, sino de un artefacto de investigación orientado a reproducir el comportamiento de los RLM.

Con 8.190.735.360 parámetros totales (aproximadamente 8,2 mil millones), hereda la arquitectura transformer densa de Qwen3-8B y su ventana de contexto, pero ha sido entrenado sobre trayectorias generadas con un system prompt fijo, lo que implica que su comportamiento óptimo depende de ese entorno concreto. La licencia MIT y el formato safetensors facilitan su uso y modificación, aunque el modelo está etiquetado únicamente para inglés.

Su relevancia actual radica en que ejemplifica una línea de investigación emergente: modelos entrenados no para responder directamente, sino para razonar de forma recursiva descomponiendo problemas y delegando subproblemas. Es un modelo pequeño, experimental y con cero descargas en el momento de la ficha, por lo que debe tratarse como material de investigación más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 (~8,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (safetensors en el repo; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B, un transformer denso de aproximadamente 8,2 mil millones de parámetros. Sobre esa base, el autor aplica un post-entrenamiento (fine-tuning) utilizando trayectorias producidas por el propio sistema RLM bajo un system prompt fijo. Es decir, los datos de entrenamiento no son pares instrucción-respuesta convencionales, sino secuencias de interacción generadas dentro del scaffold del repositorio RLM, lo que condiciona fuertemente el estilo y el formato de las respuestas del modelo.

La innovación técnica no reside en la arquitectura (que es la de Qwen3-8B sin modificaciones estructurales conocidas), sino en el paradigma de entrenamiento: el modelo aprende a operar como un "recursive language model", descomponiendo tareas y emitiendo llamadas recursivas dentro del entorno de ejecución definido por el scaffold. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento dentro del scaffold RLM, con descomposición recursiva de problemas.
- Emisión de llamadas estructuradas al entorno de ejecución del repositorio RLM (el modelo asume ese scaffold concreto).
- Razonamiento multi-paso orientado a la delegación de subproblemas.
- Capacidad de código y matemáticas heredada de Qwen3-8B, aunque no validada específicamente en este ajuste.
- Soporte multilingüe limitado: la model card declara únicamente inglés.
- No se documenta soporte explícito de tool calling genérico, visión, audio ni modo "thinking" independiente del scaffold.

## Casos de uso

- Investigación en razonamiento recursivo: reproducir los experimentos del paper "Recursive Language Models" utilizando el modelo junto con el repositorio oficial, evaluando cómo descompone tareas complejas en subproblemas.
- Evaluación de scaffolds de agentes: servir como modelo de referencia para comparar el rendimiento de distintos entornos de ejecución (scaffolds) sobre una misma base Qwen3-8B.
- Prototipado de pipelines de resolución jerárquica de problemas: integrar el modelo en flujos donde una tarea se divide en subtareas que se resuelven recursivamente, aprovechando el entrenamiento específico sobre trayectorias de ese tipo.
- Estudio de sensibilidad a system prompts: analizar cómo el ajuste sobre un prompt fijo afecta a la robustez del modelo cuando se varía el contexto de sistema, un caso de interés para quienes investigan alineación de agentes.
- Base para fine-tuning posterior: al estar bajo licencia MIT y en safetensors, puede servir como punto de partida para experimentos propios de post-entrenamiento sobre Qwen3-8B.
- Docencia y divulgación: ejemplo práctico y reproducible de cómo un modelo pequeño puede especializarse en un paradigma de razonamiento concreto mediante fine-tuning sobre trayectorias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 16,4 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica se recomiendan 24 GB o más para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 4,5-5 GB para pesos (si se generan cuantizaciones propias; el autor no las publica).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con vLLM; RTX 4090 (24 GB) viable en bf16 con contexto limitado; RTX 3090/4080 (16-24 GB) viables en cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto moderado y en GPUs de 16 GB con cuantización.
- Opciones de despliegue: el autor recomienda vLLM junto con el código de inferencia del repositorio RLM (https://github.com/alexzhang13/rlm). llama.cpp u Ollama requerirían convertir los pesos a GGUF, algo no publicado por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| RLM-Qwen3-8B-v0.1 | ~8,2 B | No disponible | MIT | Razonamiento recursivo especializado (scaffold RLM) | Hugging Face, safetensors |
| Qwen/Qwen3-8B | ~8,2 B | No disponible en esta ficha | Apache 2.0 (segun el modelo base original) | Modelo generalista | Hugging Face, ampliamente distribuido |
| Modelos de 7-8 B generalistas (p. ej. Llama 3.1 8B) | ~8 B | 128 K (segun especificaciones públicas del modelo original) | Licencia comunitaria propia | Modelo generalista | Hugging Face, ecosistema amplio |

La comparación directa con alternativas resulta limitada porque RLM-Qwen3-8B-v0.1 es un ajuste experimental sobre Qwen3-8B, no un modelo independiente. Su principal diferencia frente al base es el entrenamiento sobre trayectorias RLM y su dependencia del scaffold; frente a otros modelos de 8 B generalistas, carece de validación en benchmarks públicos y de soporte multilingüe declarado.

## Limitaciones y advertencias

- Modelo experimental de investigación: cero descargas y cero likes en el momento de la ficha, sin validación comunitaria.
- Dependencia fuerte del scaffold: fue entrenado con un system prompt fijo y asume el entorno del repositorio RLM; fuera de ese contexto su comportamiento puede degradarse de forma notable.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en MMLU, HumanEval, GSM8K u otras tareas estándar.
- Riesgo de alucinación: inherente a los modelos de 8 B y potencialmente agravado por el formato de trayectorias de entrenamiento.
- Sesgos: no documentados por el autor; hereda los sesgos del corpus de Qwen3-8B y de las trayectorias generadas por el propio sistema RLM.
- Licencia MIT: permite uso comercial, pero al derivar de Qwen3-8B conviene verificar las condiciones del modelo base original y de los datos de entrenamiento.
- Formato: solo safetensors; no hay cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional.
- Fecha de creación futura en los metadatos (2026-11-14): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Plans11/rlm-qwen3-8b-v0.1
- Paper "Recursive Language Models": https://arxiv.org/abs/2512.24601
- Repositorio de inferencia RLM: https://github.com/alexzhang13/rlm
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
