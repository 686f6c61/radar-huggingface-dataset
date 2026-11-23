# salgr/SalgrAI_2_Pro_Full

## Resumen

SalgrAI-v2-Pro-Full es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-0.5B-Instruct, desarrollado por el autor independiente Salgr sobre una única GPU RTX 3060. El modelo conserva la arquitectura original de Qwen2 (decoder-only transformer, 24 capas, hidden size 896, 14 cabezas de atención con 2 KV heads, FFN de 4864 y vocabulario de 151.936 tokens con embeddings atados) y sus 494 millones de parámetros totales. El objetivo del ajuste es dotar al modelo base de un estilo conversacional informal en ruso (denominado "lowercase Telegram Russian") y de conocimiento sobre su propia identidad, manteniendo a la vez las capacidades de generación de código Python heredadas del modelo original.

El modelo se presenta explícitamente como una pieza para experimentación, demos y aprendizaje, no para uso serio en producción. Casi toda la capacidad de código y conocimiento procede del modelo base; el ajuste fino añadió el estilo conversacional, las respuestas en ruso y la autoconciencia del modelo. El autor advierte que los hechos fuera de los datos de entrenamiento son mayoritariamente incorrectos y que la aritmética no es fiable.

Es relevante ahora como ejemplo de ajuste fino completo (full fine-tuning) de un modelo pequeño realizado por una sola persona con recursos limitados (una RTX 3060, 24 minutos de entrenamiento), y por su control explícito de filtración de benchmarks. Se distribuye en safetensors, PyTorch binario y GGUF (F16 y Q8_0), con licencia Apache-2.0 heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 decoder-only transformer (sin modificar): 24 capas, hidden 896, 14 cabezas de atención (2 KV heads), FFN 4864, embeddings atados |
| Parametros totales | 494.032.768 (494M); 358M ajustados, tabla de embeddings congelada |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 2048`; el modelo base Qwen2.5 soporta hasta 32.768 tokens, pero la ficha no confirma el contexto efectivo tras el ajuste) |
| Tipos de cuantizacion | bfloat16 (safetensors y PyTorch binario), float16 (GGUF F16), 8 bits (GGUF Q8_0) |
| Idiomas soportados | Ruso e inglés (el modelo base conoce además otros idiomas y lenguajes de programación) |
| Licencia | Apache-2.0 (heredada del modelo base; incluye `LICENSE` y `NOTICE`) |
| Formato de pesos | safetensors (988 MB), pytorch_model.bin (988 MB), GGUF F16 (994 MB), GGUF Q8_0 (531 MB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin cambios: un transformer decoder-only de Qwen2 con 24 capas, dimensión oculta de 896, 14 cabezas de atención con 2 KV heads (GQA), FFN de 4864 y vocabulario de 151.936 tokens con embeddings atados que también actúan como capa de salida. El ajuste fino fue completo (full fine-tuning) en bf16 con autocast, con la tabla de embeddings congelada, usando AdamW con learning rate 2e-5 decaído a un 10% mediante cosine schedule, 50 pasos de warm-up, weight decay 0.01, batch de 16 y hasta 3 épocas. La pérdida se calculó solo sobre los tokens del asistente (aproximadamente 0,46M de los 0,99M de tokens por época). Se publicó el checkpoint de la época 2 (mejor pérdida de validación: 1,756; perplejidad 5,8; el modelo base obtuvo 3,220 en el mismo conjunto); la época 3 sobreajustó (1,938). El entrenamiento duró unos 24 minutos.

Los datos de entrenamiento consisten en 18.950 diálogos cortos (más 305 reservados para validación): unos 9.800 diálogos de conversación casual sintéticos escritos por Claude Haiku; unos 3.400 diálogos de conocimiento breve (geografía, historia, ciencia, matemáticas, lengua y literatura rusas, cultura, tecnología) también de Claude Haiku, más unos 1.000 ejemplos de tablas hechas a mano y aritmética simple; unos 900 diálogos sobre conceptos de programación (Python, HTML, SQL, Git); unos 2.400 ejemplos de "qué imprime este código Python", generados por script y respondidos ejecutando realmente el código; unos 570 ejemplos de "escribe una función" verificados con tests; y 90 diálogos sobre el propio modelo. Los diálogos no se publican con el modelo. Como control de filtración de benchmarks, se eliminaron los diálogos cuya primera pregunta coincidía literalmente con preguntas de los benchmarks SBB y SBKCB, y en los datos de conocimiento se descartaron los diálogos que compartían dos o más palabras de contenido con una pregunta de conocimiento de los benchmarks o que contenían su respuesta esperada (aproximadamente un cuarto de los diálogos de conocimiento).

## Capacidades

- Generación de texto conversacional en ruso informal (estilo "lowercase Telegram Russian") y en inglés.
- Generación y explicación de código Python, con conservación de las habilidades del modelo base Qwen2.5-Coder.
- Respuesta a preguntas de "qué imprime este código" y "escribe una función", con datos de entrenamiento verificados mediante ejecución real y tests.
- Conocimiento breve de geografía, historia, ciencia, matemáticas, lengua y literatura rusas, cultura y tecnología (limitado a los datos de entrenamiento).
- Aritmética simple (no fiable según el autor).
- Conversación multi-turno mediante plantilla ChatML sin mensaje de sistema.
- Autoconciencia del modelo: nombre, versión, creador, tamaño y modelo base.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Demostración educativa de ajuste fino: el modelo sirve para ilustrar el proceso completo de fine-tuning de un LLM pequeño sobre una GPU de consumo (RTX 3060) en menos de media hora, con control de filtración de benchmarks y publicación de pesos en múltiples formatos.
- Chatbot de compañía en ruso informal: puede gestionar conversaciones casuales multi-turno con respuestas cortas y un tono de amigo, adecuado para prototipos de asistentes conversacionales en Telegram.
- Asistente de programación Python para principiantes: conserva la capacidad del modelo base para explicar conceptos (Python, HTML, SQL, Git) y responder preguntas sobre qué imprime un fragmento de código.
- Generación de funciones sencillas en Python: puede producir funciones cortas verificables, útil en entornos de aprendizaje o como generador de borradores en pipelines de bajo riesgo.
- Pruebas de infraestructura de despliegue: su tamaño reducido (531 MB en Q8_0) permite validar configuraciones de llama.cpp, llama-server o transformers en hardware modesto antes de migrar a modelos mayores.
- Evaluación de técnicas de cuantización: la model card verifica que el GGUF F16 reproduce las respuestas greedy del modelo fp32 en 10 de 10 prompts y el Q8_0 en 8 de 10, lo que lo convierte en un banco de pruebas para comparar formatos.
- Experimentación con plantillas de chat: permite probar la plantilla ChatML sin mensaje de sistema y el comportamiento de parada en `<|im_end|>` en distintos runtimes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento (pérdida de validación 1,756 y perplejidad 5,8 en la época 2, frente a 3,220 del modelo base en el mismo conjunto) y verificaciones de equivalencia entre formatos de pesos (F16 GGUF reproduce 10 de 10 respuestas greedy del fp32; Q8_0, 8 de 10). No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de los benchmarks SBB y SBKCB mencionados en el control de filtración.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bf16/fp16 (988 MB de pesos), unos 0,5 GB en Q8_0 (531 MB), más el espacio para el contexto y las activaciones (depende de la longitud de contexto configurada).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor entrenó en una RTX 3060, que también sirve para inferencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas con suficiente memoria compartida).
- Opciones de despliegue: transformers (safetensors o pytorch_model.bin), llama.cpp / llama-server con los GGUF, y cualquier runtime compatible con GGUF (Ollama, entre otros). La model card indica compatibilidad con text-generation-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles. El ejemplo de llama-server usa contexto de 2048 tokens, temperatura 0.5, top_k 40, top_p 0.9 y repeat_penalty 1.1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SalgrAI-v2-Pro-Full | 494M | no disponible | Apache-2.0 | Hugging Face (safetensors, bin, GGUF F16/Q8_0) | Ajuste conversacional en ruso sobre Qwen2.5-Coder-0.5B |
| Qwen2.5-Coder-0.5B-Instruct | 494M | 32.768 tokens (modelo base) | Apache-2.0 | Hugging Face | Modelo base; mayor capacidad de código, sin estilo conversacional ruso |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (modelo base) | Apache-2.0 | Hugging Face | Alternativa generalista de Qwen, sin especialización en código ni en ruso informal |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor advierte explícitamente que el modelo es para experimentos, demos y aprendizaje, no para uso serio.
- Casi toda la capacidad de código y conocimiento procede del modelo base; el ajuste fino solo añadió estilo conversacional, respuestas en ruso y autoconocimiento.
- Los hechos fuera de los datos de entrenamiento son mayoritariamente incorrectos; riesgo alto de alucinación en conocimiento general.
- La aritmética no es fiable.
- No hay ajuste de seguridad propio (no safety tuning); puede generar contenido inapropiado.
- Los diálogos de entrenamiento no se publican, lo que limita la reproducibilidad y la auditoría del dataset.
- El contexto efectivo tras el ajuste no está documentado; el ejemplo de llama.cpp usa 2048 tokens, muy por debajo del contexto nativo de Qwen2.5.
- Idiomas: ruso e inglés principalmente; el rendimiento en otros idiomas no está garantizado.
- Licencia Apache-2.0 permite uso comercial, pero el autor desaconseja el uso en producción dado el riesgo de errores factuales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- La plantilla de chat es ChatML sin mensaje de sistema; usar el prompt de sistema por defecto de Qwen ("You are Qwen...") puede degradar el comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/salgr/SalgrAI_2_Pro_Full
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Versión en ruso de la model card: README_RU.md (referenciada en el repositorio)
- Script de ejemplo de chat: chat_example.py (incluido en el repositorio)
- Licencia: LICENSE y NOTICE (incluidos en el repositorio)
