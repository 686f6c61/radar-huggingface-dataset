# hendrimardani/fine-tuned-model-indonesian-2

## Resumen

fine-tuned-model-indonesian-2 es un ajuste fino supervisado (SFT) del modelo Llama-3.1-8B-Instruct, desarrollado por el usuario hendrimardani y publicado en Hugging Face. Está especializado en generación de texto conversacional en indonesio (`id`), con un enfoque explícito en el dominio legal: análisis de documentos, referencias a normativa (PP/UU) y soporte a pipelines de RAG (Retrieval-Augmented Generation) para consultas jurídicas. Se trata de la versión v2, que según el autor corrige problemas de la v1 en cuanto a tipografía, repeticiones de n-gramas y coherencia en indonesio formal.

Técnicamente es un transformer decoder-only de 8.030.261.248 parámetros (8B), derivado de la versión de Unsloth del Llama-3.1-8B en cuantización NF4 de 4 bits, y ajustado mediante PEFT/LoRA con la librería TRL. El modelo declara una longitud máxima de secuencia de 2048 tokens en su model card, muy por debajo de los 128K nativos de Llama-3.1, lo que sugiere que el ajuste se realizó y validó con ese límite.

Su relevancia práctica es acotada pero clara: cubre un nicho poco atendido (indonesio formal + dominio legal) sobre una base bien conocida y con licencia Apache 2.0, lo que permite uso comercial sin fricciones. No obstante, la información publicada es escasa: no hay benchmarks, no se detalla la composición del dataset de ajuste ni el número de tokens de entrenamiento, y el repositorio ocupa 60,9 GB, un tamaño desproporcionado para un modelo de 8B que conviene tener en cuenta al descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1), ajuste fino con PEFT/LoRA |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (max sequence length declarada en la model card) |
| Tipos de cuantizacion | NF4 de 4 bits (base y despliegue recomendado); pesos en safetensors (también compatible con bfloat16) |
| Idiomas soportados | Indonesio (`id`) y inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 60,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Llama-3.1-8B-unsloth-bnb-4bit`, una variante del Llama-3.1-8B-Instruct cuantizada en NF4 de 4 bits y optimizada para el framework Unsloth. Sobre esa base se aplicó un ajuste fino supervisado (SFT v2) con PEFT/LoRA y la librería TRL, orientado a conversación en indonesio y a tareas de análisis documental y legal. La model card menciona mejoras en alineamiento conversacional, manejo de estructuras oracionales complejas en indonesio y precisión de recuperación en contextos de RAG legal.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la configuración de LoRA (rango, alpha, módulos objetivo), ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas propias: se trata de un ajuste estándar sobre la arquitectura Llama-3.1, con atención causal clásica y sin decodificación especulativa ni mecanismos de atención lineal. El autor recomienda parámetros de inferencia concretos para evitar degradación del idioma: `temperature=0.3`, `repetition_penalty=1.15`, `do_sample=True` y `max_new_tokens=1024`.

## Capacidades

- Generación de texto conversacional en indonesio formal, con especial atención a la corrección tipográfica y a la ausencia de repeticiones de n-gramas.
- Análisis y síntesis de documentos legales: interpretación de artículos, referencias a normativa (PP, UU) y políticas organizativas.
- Soporte a pipelines de RAG: el modelo está diseñado para recibir contexto recuperado y generar respuestas fundamentadas en él, con temperatura baja para reducir divagación.
- Comprensión y generación en inglés (`en`), heredada de la base Llama-3.1.
- Formato conversacional con roles system/user/assistant mediante `apply_chat_template`.
- Integración con LangChain a través de `HuggingFacePipeline` para cadenas de recuperación y generación.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Asistencia jurídica interna en indonesio: el modelo responde consultas sobre procedimientos y normativa (por ejemplo, registro de contratos PKWT según el PP n.º 35 de 2021) con un formato estructurado en pasos, adecuado para borradores que un jurista revisa después.
- RAG sobre corpus normativo: integrado en LangChain con un recuperador vectorial, genera respuestas ancladas a los fragmentos recuperados; la temperatura de 0.3 y la penalización de repetición de 1.15 reducen la deriva y los bucles.
- Análisis de contratos y políticas internas: extracción de obligaciones, plazos y referencias regulatorias de documentos en indonesio, con salida en formato de lista numerada.
- Atención al cliente en indonesio: conversaciones multi-turno dentro de la ventana de 2048 tokens, suficiente para interacciones de soporte de longitud moderada.
- Generación de resúmenes de expedientes: condensación de documentos legales largos divididos en fragmentos que caben en el contexto declarado.
- Prototipado rápido en entornos con VRAM limitada: al cargarse en 4 bits, permite desplegar un asistente legal especializado en una GPU de consumo, algo inviable con el modelo en bfloat16 completo.
- Localización de contenido jurídico: redacción de explicaciones en indonesio formal a partir de fuentes en inglés, aprovechando el bilingüismo heredado de la base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en 4 bits (NF4): aproximadamente 5-6 GB para los pesos, más overhead de activaciones y caché KV; en la práctica, 8-10 GB con contexto de 2048 tokens.
- VRAM estimada en bfloat16: unos 16 GB solo para pesos, más activaciones; se recomienda 24 GB o más.
- GPU recomendadas: A100 40/80 GB o H100 para servicio concurrente en bf16; L40S o RTX 4090 (24 GB) para bf16 en una sola GPU; RTX 3090/4090, RTX 4080 o incluso GPUs de 12 GB para la variante 4 bits.
- Cabe en GPU de consumo: sí, en 4 bits en tarjetas de 12 GB o más; en bf16 requiere 24 GB.
- Opciones de despliegue: `transformers` con `load_in_4bit=True` (documentado por el autor), `text-generation-inference` (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), vLLM, llama.cpp/Ollama previa conversión a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fine-tuned-model-indonesian-2 | 8B | 2048 tokens (declarado) | Indonesio + legal, RAG | Apache 2.0 | Hugging Face, safetensors |
| Llama-3.1-8B-Instruct (Meta) | 8B | 128K tokens | Generalista multilingue | Llama 3.1 Community License | Hugging Face, amplio ecosistema |
| unsloth/Llama-3.1-8B-unsloth-bnb-4bit | 8B | 128K tokens (base) | Generalista, optimizado para fine-tuning | Apache 2.0 (según repo de Unsloth) | Hugging Face |
| Modelos especializados en indonesio de 7-9B (p. ej. variantes Sahabat-AI, MerajutAI) | 7-9B | variable | Indonesio generalista | variable | Hugging Face |

La comparación cuantitativa de rendimiento no es posible: este modelo no publica benchmarks y las alternativas especializadas en indonesio tienen métricas dispares y no directamente contrastables. La diferencia más objetiva frente a la base Llama-3.1 es la ventana de contexto declarada (2048 frente a 128K) y la especialización de dominio.

## Limitaciones y advertencias

- No es asesoramiento legal formal: el propio autor advierte que las salidas deben verificarse contra las fuentes normativas primarias.
- Riesgo de alucinación en referencias normativas: puede citar números de artículo, PP o UU inexistentes o desactualizados; en dominio legal esto es crítico y exige verificación humana.
- Contexto limitado a 2048 tokens, muy inferior a los 128K de Llama-3.1; los documentos largos deben fragmentarse y gestionarse con RAG.
- Idiomas declarados `id` y `en`; no hay evaluación publicada de calidad en otros idiomas y es probable que degrade fuera de esos dos.
- Sin benchmarks ni detalles del dataset de ajuste: no es posible estimar sobreajuste, cobertura temática ni calidad relativa frente a la base.
- El ajuste se hizo sobre una base ya cuantizada en NF4, lo que puede introducir una pérdida de calidad acumulada respecto a un ajuste sobre pesos completos.
- Repositorio de 60,9 GB para un modelo de 8B: probablemente contiene checkpoints intermedios o múltiples formatos; conviene revisar los archivos antes de descargar.
- Licencia Apache 2.0 permite uso comercial, pero la base Llama-3.1 de Meta arrastra sus propias condiciones de la Llama 3.1 Community License; conviene revisar la compatibilidad antes de un despliegue comercial.
- Sin soporte documentado de tool calling ni de agentes multi-paso; no debe asumirse su disponibilidad en producción.
- Temperatura recomendada baja (0.3): adecuada para extracción factual, pero limita la variedad en tareas creativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hendrimardani/fine-tuned-model-indonesian-2
- Perfil del autor: https://huggingface.co/hendrimardani
- Modelo base (Unsloth, Llama-3.1-8B, 4 bits): https://huggingface.co/unsloth/Llama-3.1-8B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Librería TRL: https://github.com/huggingface/trl
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
