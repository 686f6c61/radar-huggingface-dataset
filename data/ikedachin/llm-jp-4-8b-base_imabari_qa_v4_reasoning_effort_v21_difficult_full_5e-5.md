# ikedachin/llm-jp-4-8b-base_imabari_qa_v4_reasoning_effort_v21_difficult_full_5e-5

## Resumen

El modelo `ikedachin/llm-jp-4-8b-base_imabari_qa_v4_reasoning_effort_v21_difficult_full_5e-5` es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo base japonés `llm-jp/llm-jp-4-8b-base`, desarrollado por el usuario de Hugging Face ikedachin. Su propósito es especializar un LLM de 8.590.200.832 parámetros (aproximadamente 8,6 mil millones) en diálogo japonés con soporte explícito para el dialecto de Imabari (prefectura de Ehime) y para japonés estándar, además de incorporar un mecanismo de control de verbosidad de razonamiento denominado `reasoning_effort` con tres niveles (low, medium, high).

La relevancia del modelo es doble. Por un lado, aborda un nicho poco cubierto: la adaptación de LLMs japoneses a variantes dialectales regionales manteniendo canales separados para razonamiento y respuesta final en cada variedad lingüística. Por otro, implementa un esquema de plantilla de chat personalizada con canales (`analysis_imabari`, `final_imabari`, `analysis`, `final`, `commentary`) y tokens especiales propios (`<|start|>`, `<|end|>`, `<|message|>`, `<|channel|>`, `<|call|>`), lo que lo convierte en un caso interesante para estudiar control de formato y condicionamiento de esfuerzo de razonamiento en modelos de tamaño medio.

El entrenamiento se realizó con SFT de parámetros completos (sin LoRA/PEFT), precisión BF16, longitud máxima de secuencia de 8192 tokens, pérdida solo en tokens del asistente y un conjunto de datos que combina QA wiki en dialecto de Imabari y japonés estándar (versiones v4 y v5 "difficult") con el dataset de seguridad japonés AnswerCarefully. La licencia es CC-BY-SA-4.0, lo que permite uso comercial con atribución y compartir-al-igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de llm-jp-4-8b-base); detalles internos de capas y atención no disponibles |
| Parametros totales | 8.590.200.832 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor solo menciona BF16 para entrenamiento e inferencia) |
| Idiomas soportados | Japonés (ja), con dos variedades: dialecto de Imabari y japonés estándar |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `llm-jp/llm-jp-4-8b-base`, un transformer decoder-only de aproximadamente 8,6 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino supervisado de parámetros completos (full-parameter SFT, sin LoRA ni PEFT) en precisión BF16, con longitud máxima de secuencia de 8192 tokens, batch size de 1 por GPU, acumulación de gradiente de 16, optimizador AdamW, scheduler coseno, warmup del 5% de los pasos totales, gradient checkpointing activado, una época y learning rate de 5e-5 con semilla 42. La pérdida se calcula únicamente sobre los tokens del asistente (assistant-only loss), tratando los tokens de sistema y usuario como contexto.

La innovación principal no está en la arquitectura del transformer, sino en la plantilla de chat personalizada y el esquema de condicionamiento. Se definen cuatro canales de contenido más un canal `commentary`, seleccionables mediante el argumento `valid_channels` de `tokenizer.apply_chat_template()`, de modo que el modelo puede razonar y responder tanto en dialecto de Imabari como en japonés estándar. Además, el argumento `reasoning_effort` (low/medium/high) actúa como señal de condicionamiento para modular la verbosidad del razonamiento, aunque el propio autor advierte que no garantiza longitud, corrección ni cumplimiento. El modelo introduce tokens especiales propios que requieren inicialización específica de sus embeddings de entrada durante el entrenamiento.

Los datos de entrenamiento combinan cuatro datasets de QA wiki con razonamiento (Imabari Wiki QA v4, Standard Japanese Wiki QA v4 validado, Imabari Wiki QA v5 Difficult y Standard Japanese Wiki QA v5 Difficult) más AnswerCarefully en sus configuraciones v3.0, borderline-v1.0, v2.2, v2.0 y v1.0, usando el split dev para entrenamiento y test para validación. No se menciona RLHF ni DPO en la información disponible.

## Capacidades

- Generación de texto conversacional en japonés, con dos registros diferenciados: dialecto de Imabari y japonés estándar.
- Razonamiento explícito separado de la respuesta final mediante canales (`analysis_*` para razonamiento, `final_*` para respuesta).
- Control de esfuerzo de razonamiento con tres niveles (`low`, `medium`, `high`) como señal de condicionamiento.
- Respuesta a preguntas de conocimiento general y preguntas difíciles con razonamiento multi-paso, según los datasets de entrenamiento (Wiki QA v4 y v5 Difficult).
- Seguimiento de instrucciones y comportamiento de seguridad en japonés, gracias al dataset AnswerCarefully.
- Canal `commentary` adicional para anotaciones o comentarios.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (existe el token `<|call|>`, pero no se documenta su uso funcional).
- Capacidades de agente y multi-step reasoning autónomo: no disponible.
- Capacidades multilingües: limitadas al japonés; no se documenta soporte de otros idiomas.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Atención al cliente regional en Japón: el modelo puede mantener conversaciones multi-turno en dialecto de Imabari para usuarios locales y cambiar a japonés estándar para usuarios externos, usando los canales `final_imabari` y `final` según el perfil del interlocutor, con hasta 8192 tokens de contexto.
- Asistente turístico de la prefectura de Ehime: respondiendo preguntas sobre Imabari y su entorno en dialecto local, con razonamiento en el canal `analysis_imabari` para preguntas complejas sobre rutas, historia o gastronomía.
- Generación de contenido dialectal para medios locales: redacción de artículos, guiones o publicaciones en dialecto de Imabari con un registro controlado, usando `reasoning_effort` bajo para textos cortos y alto para piezas que requieran argumentación.
- Educación y preservación lingüística: herramienta para enseñar o documentar el dialecto de Imabari, generando explicaciones en japonés estándar (canal `analysis`) y ejemplos en dialecto (canal `final_imabari`) en una misma respuesta.
- Prototipado de sistemas de razonamiento controlado: el esquema `reasoning_effort` permite experimentar con presupuestos de razonamiento variables en un modelo de 8,6B, útil para investigación sobre eficiencia de cómputo en inferencia.
- Evaluación de seguridad en japonés: al estar entrenado con AnswerCarefully, puede emplearse como base para estudiar el comportamiento de rechazo y seguimiento de instrucciones en modelos japoneses de tamaño medio.
- Chatbot de soporte interno para administraciones locales de Ehime: con contexto de 8192 tokens puede procesar documentos y preguntas de ciudadanos, alternando registro dialectal y estándar según el canal configurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 17,2 GB solo para pesos (8,59B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB de VRAM para contextos moderados.
- En cuantización de 8 bits: alrededor de 8,6 GB de pesos; en 4 bits: alrededor de 4,3 GB, aunque el autor no documenta cuantizaciones oficiales ni su calidad.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 6000 Ada para BF16 con contexto largo; RTX 4090 (24 GB) puede alojar el modelo en BF16 con contextos limitados o en cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con BF16 y contexto moderado, o en GPUs de 16 GB con cuantización; en GPUs de 8-12 GB solo con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles; llama.cpp/Ollama no están documentados para este modelo y requerirían conversión a GGUF, no disponible oficialmente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| ikedachin/llm-jp-4-8b-base_imabari_qa_v4_reasoning_effort_v21_difficult_full_5e-5 | 8,59B | 8192 | Japonés (Imabari y estándar) | CC-BY-SA-4.0 | SFT completo con canales dialectales y reasoning_effort |
| llm-jp/llm-jp-4-8b-base | 8,59B (según el modelo derivado) | no disponible | Japonés | no disponible en la información proporcionada | Modelo base japonés sin ajuste conversacional |
| llm-jp/llm-jp-4-8b-instruct | no disponible | no disponible | Japonés | no disponible en la información proporcionada | Ajuste instructivo general en japonés, sin especialización dialectal |
| Modelos japoneses de ~7-8B de otros autores (p. ej. Swallow, Tanuki) | ~7-8B | variable | Japonés | variable | Ajuste instructivo general; no cubren dialecto de Imabari |

La comparativa se limita a alternativas del ecosistema japonés de tamaño similar; no se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- El propio autor advierte que `reasoning_effort` es solo una señal de condicionamiento y no garantiza longitud de salida, corrección ni cumplimiento de la instrucción.
- `valid_channels` no restringe estrictamente la generación; es una guía para la plantilla, no una restricción dura del decodificador.
- El modelo está entrenado únicamente en japonés; no se documenta soporte de otros idiomas, por lo que su uso fuera del japonés es no fiable.
- Riesgo de alucinación inherente a un modelo de 8,6B ajustado con SFT sobre datos wiki; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse con Wikipedia y AnswerCarefully, puede heredar sesgos de esas fuentes.
- La licencia CC-BY-SA-4.0 permite uso comercial, pero exige atribución y compartir las obras derivadas bajo la misma licencia, lo que puede ser restrictivo para productos propietarios.
- Requiere usar el tokenizer incluido con el modelo, ya que la plantilla de chat personalizada y los tokens especiales (`<|start|>`, `<|end|>`, `<|message|>`, `<|channel|>`, `<|call|>`) no están en tokenizers estándar; usar otro tokenizer rompe el formato.
- La inicialización de los embeddings de entrada de los tokens especiales es un punto crítico documentado por el autor; ignorarlo puede degradar el comportamiento.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que limita el despliegue en entornos de bajo consumo.
- El repositorio tiene 0 likes y 429 descargas en el momento de la consulta, lo que sugiere validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikedachin/llm-jp-4-8b-base_imabari_qa_v4_reasoning_effort_v21_difficult_full_5e-5
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-8b-base
- Dataset Imabari Wiki QA v4: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v4_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v4 validado: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v4_validated_w_reasoning_effort_llmjp4
- Dataset Imabari Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/imabari_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset Standard Japanese Wiki QA v5 Difficult: https://huggingface.co/datasets/ikedachin/std_lang_wiki_qa_v5_difficult_reasoning_effort_llmjp4
- Dataset AnswerCarefully: https://huggingface.co/datasets/llm-jp/AnswerCarefully
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada.
