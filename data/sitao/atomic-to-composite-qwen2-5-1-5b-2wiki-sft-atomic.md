# sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-atomic

## Resumen

El modelo `sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-atomic` es un ajuste fino por supervisión (SFT) de Qwen2.5-1.5B desarrollado por Sitao Cheng y colaboradores como parte del estudio de transferencia presentado en el artículo "From Atomic to Composite: Reinforcement Learning Enables Generalization in Complementary Reasoning" (arXiv:2512.01970). Se trata de un artefacto de investigación, no de un asistente de propósito general, diseñado para estudiar cómo se componen habilidades atómicas en tareas de razonamiento multi-salto.

Concretamente, este checkpoint ha sido entrenado únicamente sobre habilidades atómicas del entorno 2WikiMultiHopQA: memorización de biografías de entidades paramétricas y razonamiento contextual de un solo salto sobre pasajes de Wikipedia. No ha visto preguntas compuestas multi-salto durante el entrenamiento, lo que lo convierte en la pieza base de la receta "atomic-first" que después se refuerza con GRPO.

Su relevancia radica en que sirve como punto de comparación controlado: mide cuánto de la capacidad de composición emerge de forma puramente supervisada frente a lo que aporta el aprendizaje por refuerzo posterior. Con 1.543.714.304 parámetros y licencia Apache 2.0, es un modelo pequeño y fácil de ejecutar, pensado para reproducir experimentos de generalización composicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B, un transformer decoder-only con atención causal estándar y normalización RMSNorm, y se ajusta mediante SFT completo (no LoRA) usando LLaMA-Factory. El entrenamiento se realiza sobre las habilidades atómicas del entorno 2Wiki: por un lado, memorización de biografías de entidades paramétricas; por otro, razonamiento contextual de un solo salto sobre pasajes reales de Wikipedia. No se incluyen preguntas compuestas multi-salto en esta fase, lo que constituye la premisa experimental del checkpoint.

El estudio compara esta receta "atomic-first" con una receta "composite-first" y con la aplicación posterior de GRPO (200 pasos, mismos datos para ambos modelos RL, comparación step-matched) implementado en verl. La innovación metodológica no está en la arquitectura, sino en el protocolo de entrenamiento: demostrar que el orden en que se presentan habilidades atómicas frente a compuestas determina la capacidad de generalización composicional del modelo final.

## Capacidades

- Generación de texto en inglés con formato conversacional (chat template de Qwen2.5).
- Respuesta a preguntas de un solo salto sobre pasajes de contexto (contextual reasoning).
- Recuperación de información memorizada sobre entidades paramétricas del conjunto 2Wiki.
- Razonamiento multi-salto limitado: aunque no se entrenó con preguntas compuestas, alcanza un 71,6 % de exact match en la partición Composition del test set (ver benchmarks).
- No documenta soporte de tool calling ni function calling.
- No documenta capacidades de agente ni multi-step reasoning más allá de la composición implícita evaluada.
- No es multimodal: solo texto.
- No documenta modo "thinking" ni razonamiento extendido explícito.
- Multilingüe limitado al inglés según la model card.

## Casos de uso

- Investigación en generalización composicional: usar el checkpoint como baseline SFT atómico para comparar con las variantes RL (atomic-first-rl, composite-first-rl) y medir la contribución del refuerzo a la composición de habilidades.
- Reproducción de experimentos del paper: ejecutar la evaluación sobre el test set de 2WikiMultiHopQA (877 ítems IID, 1.200 ítems Composition) para verificar las cifras reportadas en el Apéndice D.
- Punto de partida para RL con GRPO: este checkpoint es la base sobre la que se entrena `atomic-first-rl`; sirve para iniciar pipelines de refuerzo con verl sobre tareas multi-salto.
- Estudio de currículos de entrenamiento: comparar el orden atómico frente al compuesto en modelos pequeños para extraer conclusiones sobre cómo secuenciar datos de SFT.
- Evaluación de QA sobre Wikipedia real: el modelo responde preguntas de un salto condicionadas a pasajes recuperados, útil como componente en pipelines de RAG de bajo coste en inglés.
- Docencia y experimentación con modelos pequeños: con 1,5 B de parámetros se puede ejecutar en una GPU de consumo para demostrar conceptos de composición de habilidades y ajuste fino supervisado.
- Análisis de ablación en memorización frente a contexto: permite aislar cuánto responde el modelo por conocimiento paramétrico y cuánto por lectura del contexto proporcionado.

## Benchmarks y rendimiento

Resultados reportados en el Apéndice D del paper (exact match en %, sobre pasajes reales de Wikipedia; IID: 877 ítems, Composition: 1.200 ítems):

| Modelo | Repositorio | IID | Composition |
|---|---|---:|---:|
| SFT sobre habilidades atómicas (SFT_Mem+Ctx) | este modelo | 83,8 | 71,6 |
| SFT sobre la tarea compuesta (SFT_Comp) | sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-composite | 91,7 | 71,4 |
| Receta atomic-first (SFT_Mem+Ctx → RL_Comp) | sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-atomic-first-rl | 90,4 | 88,6 |
| Receta composite-first (SFT_Comp → RL_Comp) | sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-composite-first-rl | 90,2 | 68,8 |

Ambos modelos RL se entrenan con los mismos 200 pasos de GRPO sobre los mismos datos, por lo que la comparación está emparejada por pasos. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (aunque no se publican GGUF oficiales, es convertible con herramientas estándar).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100/H100 no son necesarias y estarían sobredimensionadas.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090, e incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (referencia oficial), vLLM, TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IID (2Wiki) | Composition (2Wiki) | Licencia |
|---|---:|---|---:|---:|---|
| Este modelo (SFT atómico) | 1,54 B | no disponible | 83,8 | 71,6 | Apache 2.0 |
| sitao/...-2wiki-sft-composite | 1,54 B | no disponible | 91,7 | 71,4 | Apache 2.0 |
| sitao/...-2wiki-atomic-first-rl | 1,54 B | no disponible | 90,4 | 88,6 | Apache 2.0 |
| sitao/...-2wiki-composite-first-rl | 1,54 B | no disponible | 90,2 | 68,8 | Apache 2.0 |

Los cuatro checkpoints comparten arquitectura, tamaño y licencia; la diferencia está exclusivamente en la receta de entrenamiento. Frente a alternativas de propósito general del mismo tamaño (por ejemplo, Qwen2.5-1.5B base o Llama-3.2-1B), este modelo está especializado en QA multi-salto sobre Wikipedia y no se ha evaluado en benchmarks generalistas, por lo que la comparación directa en tareas abiertas no está disponible.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica explícitamente que no es un asistente de propósito general.
- Entrenado solo en inglés; no se garantiza comportamiento correcto en otros idiomas.
- Especializado en el dominio 2WikiMultiHopQA (biografías y pasajes de Wikipedia); el rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación en preguntas que requieran conocimiento paramétrico no cubierto por las biografías de entrenamiento.
- No se documenta alineación con RLHF/DPO ni filtros de seguridad; puede generar contenido inapropiado si se le induce.
- Sin datos publicados sobre sesgos demográficos, geográficos o culturales.
- La longitud de contexto no se especifica en la model card; se hereda de Qwen2.5-1.5B, pero conviene verificarla antes de usarlo en producción.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no está pensado ni validado para despliegues comerciales.
- No se publican pesos en GGUF ni cuantizaciones oficiales; la conversión corre por cuenta del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-atomic
- Paper: https://arxiv.org/abs/2512.01970
- Página del proyecto: https://sitaocheng.github.io/atomic/
- Código: https://github.com/sitaocheng/from_atomic_to_composite
- Colección de modelos y dataset: https://huggingface.co/collections/sitao/from-atomic-to-composite-6adfe594de6d55a83cf3a287
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset 2WikiMultiHopQA: https://github.com/Alab-NII/2wikimultihop
- Checkpoint SFT compuesto: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-sft-composite
- Checkpoint atomic-first + RL: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-atomic-first-rl
- Checkpoint composite-first + RL: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-2wiki-composite-first-rl
