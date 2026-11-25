# jonathanjordan21/qwen2.5-0.5b-id-ner-agent-qlora-4bit-bnb-tokenize

## Resumen

El modelo `qwen2.5-0.5b-id-ner-agent-qlora-4bit-bnb-tokenize` es un ajuste fino de Qwen2.5-0.5B-Instruct, desarrollado por el usuario jonathanjordan21, especializado en extracción de entidades nombradas (NER) sobre artículos de prensa en indonesio. El modelo actúa como un agente editorial que transforma texto periodístico sin estructurar en JSON conforme a un esquema predefinido, combinando la generación de texto con una tarea de clasificación de tokens.

Se trata de un modelo muy compacto (0,5 mil millones de parámetros) afinado mediante QLoRA sobre Unsloth, con rango 32 y RSLoRA, a partir de un adaptador LoRA previo del mismo autor. El entrenamiento se realizó sobre un conjunto de 3.200 artículos de noticias indonesias. Su relevancia radica en demostrar que un modelo de tamaño reducido puede abordar tareas de extracción estructurada y generación de JSON con reglas de negocio complejas (categorías de entidades, límites de entidades primarias y alternativas, sentimiento y titulares sugeridos) en un idioma de recursos limitados como el indonesio.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptador QLoRA + RSLoRA |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3072 tokens (longitud máxima de secuencia usada en el ajuste) |
| Tipos de cuantizacion | 4 bits (bitsandbytes, `load_in_4bit=True`); el adaptador se distribuye en safetensors |
| Idiomas soportados | indonesio (según tags y dataset de entrenamiento); lista oficial de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/QLoRA); el modelo base se carga aparte |
| Pipeline | token-classification (también etiquetado como text-generation) |
| Tamaño del repositorio | 0,6 GB |
| Modelo base | jonathanjordan21/qwen2.5-0.5b-id-ner-agent-lora (a su vez derivado de Qwen2.5-0.5B-Instruct) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros, y se afina mediante QLoRA con Rank-Stabilized LoRA (RSLoRA). La configuración del adaptador es r=32, alpha=64, dropout 0,0, con módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento usa `adamw_8bit`, learning rate 0,0002 con scheduler coseno, batch size 4 y acumulación de gradientes de 4 pasos, con una longitud máxima de secuencia de 3072 tokens.

El conjunto de datos es `indonesian_ner_agent_dataset_3200.jsonl`, compuesto por 3.200 artículos de noticias indonesias. Se aplica enmascaramiento de pérdida solo sobre la respuesta del asistente (`train_on_responses_only` sobre `<|im_start|>assistant\n`), de modo que el modelo aprende a generar el JSON de salida y no a reproducir el artículo de entrada. No se documenta el uso de RLHF o DPO. La innovación principal es la combinación de generación de JSON estructurado con reglas editoriales explícitas (regla Highlander, tope de entidades alternativas, sentimiento numérico y titulares sugeridos con fecha ISO) sobre un modelo de muy bajo coste computacional.

## Capacidades

- Extracción de entidades nombradas en 9 categorías: `person`, `organization`, `location`, `event`, `product`, `gpe`, `religion`, `woa` y `law`.
- Generación de JSON conforme a un esquema predefinido a partir de texto de artículo.
- Aplicación de la regla Highlander: como máximo una entidad primaria dominante por categoría en `primary_entities`.
- Gestión de entidades alternativas: máximo 2 entidades de apoyo por categoría, sin duplicar las primarias.
- Clasificación de sentimiento del artículo con una puntuación numérica de 1 a 10.
- Generación de exactamente 3 titulares editoriales alternativos de 150 caracteres o menos, cada uno con una fecha en formato ISO (`YYYY-MM-DD`).
- Procesamiento de artículos de noticias en indonesio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Extracción estructurada de entidades en redacciones: el modelo convierte un artículo en un JSON con personas, organizaciones, ubicaciones y eventos, lo que permite alimentar bases de datos editoriales o sistemas de etiquetado automático sin intervención manual.
- Enriquecimiento de archivos periodísticos: dado su tamaño reducido y su salida JSON, puede procesar lotes de artículos históricos en indonesio para poblar índices de búsqueda por entidad y categoría.
- Generación de titulares asistida: los 3 titulares alternativos con fecha ISO sirven como borrador para editores que necesitan variantes rápidas de titular, con la ventaja de que el modelo respeta el límite de 150 caracteres.
- Clasificación de tono editorial: la puntuación de sentimiento de 1 a 10 permite priorizar o agrupar artículos por tono en paneles de monitorización de medios.
- Moderación y control de calidad de metadatos: al imponer límites de entidades primarias y alternativas, el modelo puede usarse como validador de esquemas en pipelines de datos editoriales antes de publicar metadatos.
- Prototipado de bajo coste en entornos con recursos limitados: al ser un modelo de 0,5B cuantizable en 4 bits, es viable en una GPU consumer o incluso en CPU para pruebas de concepto de NER en indonesio.
- Investigación en NER multilingüe: sirve como referencia para estudiar el rendimiento de modelos pequeños en idiomas de recursos limitados y en tareas de generación estructurada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre una partición de test estratificada de 320 filas (evaluadas 100 filas):

| Metrica | Valor |
|---|---|
| Valid JSON Rate | 62,0 % |
| Schema Completeness | 62,0 % |
| Highlander Rule OK | 62,0 % |
| Alt Entities Cap (<=2) | 62,0 % |
| Suggested Leads Rule OK | 59,0 % |
| Sentiment MAE | 0,000 (dentro de ±1: 62,0 %) |
| Primary Entity Micro-F1 | 100,0 % (Precision 100,0 %, Recall 100,0 %) |
| Best Checkpoint Validation Loss | 0,008321726694703102 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El Micro-F1 del 100 % en entidades primarias debe interpretarse con cautela: la métrica se calcula sobre una muestra limitada de 100 filas y no equivale a una evaluación NER convencional por span.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,6 GB; con el modelo base en 4 bits se estima un consumo de inferencia de aproximadamente 1-2 GB de VRAM, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en la mayoría de GPUs de gama media y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: Unsloth (según el ejemplo del autor), transformers con bitsandbytes, llama.cpp u Ollama si se convierte el modelo a GGUF (no se proporciona conversión oficial).
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-id-ner-agent-qlora-4bit-bnb-tokenize | 0,5B | 3072 tokens | NER editorial en indonesio con salida JSON | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0,5B | 32 768 tokens (según modelo base) | Modelo generalista multilingüe | Apache 2.0 | Hugging Face |
| jonathanjordan21/qwen2.5-0.5b-id-ner-agent-lora | 0,5B | no disponible | Adaptador LoRA previo, misma tarea | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Tasa de JSON válido del 62 %: aproximadamente un 38 % de las salidas no son JSON parseable o no cumplen el esquema, lo que exige validación y reintentos en producción.
- El Micro-F1 del 100 % en entidades primarias se midió sobre 100 filas; no es representativo de un rendimiento general y puede reflejar un conjunto de evaluación poco exigente.
- El modelo está entrenado exclusivamente para indonesio y noticias; su comportamiento en otros idiomas o dominios no está documentado.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5 y entrenarse con noticias indonesias puede heredar sesgos del corpus periodístico.
- Riesgo de alucinación en entidades y fechas: el modelo genera fechas ISO y titulares, por lo que puede inventar datos no presentes en el artículo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base Qwen2.5.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni de validación independiente.
- La longitud de contexto efectiva es de 3072 tokens, inferior a la del modelo base, lo que limita artículos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonathanjordan21/qwen2.5-0.5b-id-ner-agent-qlora-4bit-bnb-tokenize
- Adaptador LoRA base: https://huggingface.co/jonathanjordan21/qwen2.5-0.5b-id-ner-agent-lora
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Qwen2.5 (modelo base): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
