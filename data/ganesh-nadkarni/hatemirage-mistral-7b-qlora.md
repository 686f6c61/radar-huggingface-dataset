# Ganesh-Nadkarni/hatemirage-mistral-7b-qlora

## Resumen

`hatemirage-mistral-7b-qlora` es un adaptador LoRA entrenado con QLoRA sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, a pesar de que su nombre comercial hace referencia a Mistral 7B. Lo desarrolla Ganesh-Nadkarni para la tarea compartida HateMirage de ICON 2026, centrada en el análisis de "Faux Hate": comentarios de odio impulsados por narrativas falsas o desmentidas, en inglés y en texto code-mixed hindi-inglés. El adaptador genera tres anotaciones por comentario: el objetivo del odio (Target), la intención o motivo (Intent) y la implicación social (Implication).

El modelo resuelve un problema concreto de moderación explicable: no solo clasifica un comentario como tóxico, sino que articula contra quién va dirigido y por qué es dañino. Se distribuye únicamente como pesos de adaptador (unos 173 MB, repo de 0,3 GB) y requiere cargar el modelo base Qwen2.5-7B-Instruct en 4 bits NF4 para funcionar. Un solo adaptador cubre los tres campos, seleccionados mediante la instrucción del prompt.

Es relevante ahora por su enfoque en narrativas falsas y en code-mixing hindi-inglés, un escenario poco cubierto por los modelos de moderación comerciales, y por su coste de entrenamiento muy bajo (una GPU de Google Colab, 1 h 42 min). No obstante, su alcance es estrictamente de investigación y no está pensado para moderación automatizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | No disponible (el adaptador pesa unos 173 MB; el modelo base es de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; entrenamiento con longitud máxima de 768 tokens |
| Tipos de cuantizacion | Base en 4-bit NF4 con doble cuantizacion (bitsandbytes); adaptador en fp16 |
| Idiomas soportados | Inglés (en) e hindi-inglés code-mixed (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Rango LoRA | r = 16, alpha = 32, dropout = 0.05 |
| Modulos adaptados | down_proj, gate_proj, k_proj, o_proj, q_proj, up_proj, v_proj |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7 mil millones de parámetros. La técnica es QLoRA: el modelo base permanece congelado en 4 bits NF4 con doble cuantización y se entrenan únicamente las matrices LoRA (r = 16, alpha = 32, dropout = 0.05) inyectadas en los módulos de atención y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). La pérdida se calcula solo sobre los tokens de respuesta, con los tokens del prompt enmascarados y una longitud máxima de 768 tokens.

Los datos provienen del split de entrenamiento etiquetado de HateMirage. Se reservó un 10 % (316 comentarios, semilla 42) y los 2.846 comentarios restantes generaron 8.538 ejemplos de entrenamiento (hasta uno por campo y comentario). El entrenamiento consistió en 1 época (534 pasos), batch efectivo de 16 (batch 2 con 8 pasos de acumulación), learning rate 2e-4 con decaimiento lineal, AdamW paginado de 8 bits, fp16 y gradient checkpointing, todo en una única GPU de Google Colab durante aproximadamente 1 h 42 min. No se documenta RLHF ni DPO; el ajuste es supervisado sobre instrucciones.

## Capacidades

- Generación de anotaciones estructuradas para comentarios de odio: Target (entidad o entidades objetivo, separadas por comas), Intent (una frase sobre el motivo) e Implication (una frase sobre la consecuencia social).
- Selección del campo a generar mediante la instrucción del prompt; un único adaptador sirve para las tres tareas.
- Comprensión de texto code-mixed hindi-inglés, además de inglés estándar.
- Generación determinista recomendada (`do_sample=False`) con hasta 128 tokens nuevos.
- Análisis de "Faux Hate": comentarios de odio basados en narrativas falsas o desmentidas.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido documentados.

## Casos de uso

- Investigación en la tarea compartida HateMirage de ICON 2026: el adaptador reproduce el formato exacto de anotación (Target, Intent, Implication) empleado en la competición, lo que permite generar envíos y comparar variantes de prompting.
- Análisis explicable de discurso de odio en estudios académicos: dado un corpus de comentarios, el modelo produce explicaciones estructuradas que un investigador puede revisar para estudiar cómo se articulan las narrativas falsas contra distintos grupos.
- Estudio de contenido code-mixed hindi-inglés: cubre un registro lingüístico escasamente atendido por modelos de moderación, útil para analizar comentarios de YouTube en esa combinación de idiomas.
- Generación de datos anotados asistida: las salidas pueden servir como propuestas iniciales que anotadores humanos corrigen, acelerando el etiquetado de nuevos conjuntos con el mismo esquema.
- Evaluación de sesgos y calidad de explicaciones: al comparar las salidas con explicaciones humanas se pueden medir problemas como la genericidad de las implicaciones o la incoherencia entre Target e Intent.
- Prototipado de pipelines de moderación explicable en entornos de investigación, siempre con revisión humana posterior y sin uso para decisiones automatizadas sobre personas o grupos.

## Benchmarks y rendimiento

Resultados oficiales del test de la tarea compartida (media de similitud Sentence-BERT y ROUGE-L F1, según la definición de HateMirage), de la ejecución principal:

| Tarea | SBERT | ROUGE-L F1 | Overall |
|---|---|---|---|
| Task A (Target) | 0,8257 | 0,7460 | 0,7859 |
| Task B (Intent + Implication) | 0,7485 | 0,4118 | 0,5801 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks generales.

## Requisitos de hardware

- El adaptador solo pesa unos 173 MB; el requisito real lo marca el modelo base Qwen2.5-7B-Instruct.
- Con cuantización 4-bit NF4 (configuración del autor), el modelo base ocupa aproximadamente 4-5 GB de VRAM, más overhead de activaciones y caché KV.
- Cabe en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), usando `device_map="auto"` y bitsandbytes.
- En fp16 sin cuantizar requeriría del orden de 14-16 GB de VRAM (A100 40 GB, H100, L40S, RTX 4090 24 GB).
- Despliegue mediante `transformers` + `peft` + `bitsandbytes`, tal como muestra la model card. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI con este adaptador.
- El entrenamiento se completó en una GPU de Google Colab en 1 h 42 min, lo que da una idea del coste de inferencia y ajuste.
- No se publican cifras de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hatemirage-mistral-7b-qlora | Adaptador sobre 7B | No disponible (entreno a 768 tokens) | Explicación de Faux Hate (Target/Intent/Implication), en e hi-en | Apache 2.0 | Hugging Face (adaptador) |
| Qwen/Qwen2.5-7B-Instruct | 7B | No disponible en la información | Modelo generalista de instrucciones | No disponible en la información | Hugging Face |
| Mistral 7B | 7B | 4.096 tokens (sliding window attention) | Modelo generalista base | Apache 2.0 | Hugging Face / Mistral AI |

La comparación con Mistral 7B solo procede por el nombre del repositorio: el adaptador no se entrena sobre Mistral, sino sobre Qwen2.5-7B-Instruct. No se dispone de datos de benchmarks de clasificadores de discurso de odio comparables en la información proporcionada.

## Limitaciones y advertencias

- No está pensado para moderación automatizada ni para tomar decisiones sobre personas o grupos; su uso previsto es exclusivamente la investigación.
- Procesa un comentario aislado sin contexto conversacional, por lo que puede identificar mal la entidad objetivo o producir una Intent incoherente con el Target generado.
- Las Implication tienden a frases genéricas ("This statement could incite negative sentiment against ...") menos específicas que una explicación humana.
- Entrenado solo con comentarios de YouTube en inglés e hindi-inglés sobre un conjunto limitado de temas; no se han probado otros idiomas, plataformas ni dominios.
- Evaluado con una única ejecución de entrenamiento y un único split aleatorio; las diferencias pequeñas entre variantes deben tratarse como ruido.
- El corpus de entrenamiento contiene lenguaje de odio y refleja los sesgos de sus anotadores; el modelo puede reproducirlos.
- El prompt debe usarse exactamente como se documenta: añadir ejemplos few-shot o recuperación empeoró los resultados en los experimentos del autor.
- Cargar el adaptador sobre un modelo base distinto de Qwen2.5-7B-Instruct no da error, pero produce texto degenerado.
- El nombre del repositorio induce a error al mencionar Mistral 7B; el modelo base real es Qwen2.5-7B-Instruct.
- Las salidas requieren posprocesado (recorte a dos frases en Intent e Implication y ajuste de cada token de Target a una de las 712 cadenas de entrenamiento con umbral de similitud 0,72) para reproducir los resultados publicados.

## Enlaces

- Hugging Face: https://huggingface.co/Ganesh-Nadkarni/hatemirage-mistral-7b-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Referencia arXiv citada en los tags: arxiv:2603.02684
- Mistral 7B (referencia nominal, no es el modelo base): https://mistral.ai/news/announcing-mistral-7b/
- Análisis de Mistral 7B: https://towardsdatascience.com/mistral-7b-explained-towards-more-efficient-language-models-7f9c6e6b7251/
