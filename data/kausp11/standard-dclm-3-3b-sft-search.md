# Kausp11/standard-dclm-3.3b-sft-search

## Resumen

Standard 3.3B (DCLM-Edu), search fine-tuned, es un modelo de lenguaje de tipo decoder-only desarrollado por el usuario Kausp11 y publicado en Hugging Face. Se trata del modelo base `Kausp11/standard-dclm-3.3b` tras un ajuste fino supervisado (SFT) de una época sobre conversaciones con bloques de búsqueda web. Su función principal es servir como modelo de comparación (baseline) frente a `Kausp11/querylm-dclm-3.3b-sft-search`, que comparte arquitectura, cómputo y datos de ajuste fino, pero que fue preentrenado con bloques de búsqueda desde el inicio.

La relevancia del modelo es metodológica: permite aislar el efecto de exponer bloques de búsqueda durante el preentrenamiento frente a introducirlos únicamente en la fase de ajuste fino. El modelo base nunca vio un bloque de búsqueda durante el preentrenamiento; los encuentra por primera vez en este SFT. Ambos modelos usan la misma cantidad de actualizaciones y FLOPs, lo que hace la comparación controlada.

La arquitectura es un decoder estilo nanochat de 32 capas, anchura 2.816, 22 cabezas de atención, feed-forward de 11.264 y dimensión de cabeza 128, con una longitud de contexto de 4.095 tokens. El autor reporta 3.322,3 M de parámetros, aunque el repositorio almacena 5.539,7 M (incluyendo value embeddings). El modelo está pensado exclusivamente para inglés y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only estilo nanochat (transformer), 32 capas, anchura 2.816, 22 cabezas, FFN 11.264, head dim 128 |
| Parametros totales | 3.322,3 M reportados; 5.539,7 M almacenados (incluye value embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors, bfloat16 en el ejemplo de uso) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards) + `modeling_nanochat.py` con `trust_remote_code=True` |
| Vocabulario | 49.156 tokens (tokenizer SmolLM2 + 4 tokens especiales de búsqueda) |
| Modelo base | `Kausp11/standard-dclm-3.3b` |
| Modelo emparejado | `Kausp11/querylm-dclm-3.3b-sft-search` |
| Dataset de preentrenamiento | HuggingFaceTB/dclm-edu |
| Dataset de ajuste fino | `Kausp11/querylm-search-sft-data` |
| Tamano del repositorio | 11,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de estilo nanochat. Consta de 32 capas con anchura 2.816, 22 cabezas de atención con dimensión de cabeza 128 y una capa feed-forward de 11.264. El tokenizer es el de SmolLM2 ampliado con cuatro tokens especiales para el mecanismo de búsqueda: `<WEB_QUERY>` (id 49152), `</WEB_QUERY>` (49153), `<WEB_RESPONSE>` (49154) y `</WEB_RESPONSE>` (49155), lo que eleva el vocabulario a 49.156 tokens. La longitud de contexto es de 4.095 tokens.

El preentrenamiento se realizó sobre DCLM-Edu en formato de texto plano, sin bloques de búsqueda ni anotación, con un presupuesto de 95.172 actualizaciones, 99.800 M de tokens (de los cuales unos 34.600 M son una segunda pasada sobre documentos ya vistos) y 2,35e21 FLOPs en bf16. Se usó el optimizador Muon para los pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida, con un batch de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualización), 40 pasos de warmup, fase constante y decaimiento lineal hasta el 5% del pico. El ajuste fino reanuda desde el checkpoint de preentrenamiento con su estado de optimizador, durante 33 actualizaciones de 256 secuencias (una época) sobre unas 53.000 conversaciones usuario-asistente, el 21% de las cuales incluyen bloques de búsqueda al inicio de una frase en los turnos del asistente. Los learning rates son 0,8 veces los picos de preentrenamiento, constantes durante la primera mitad y luego lineales a cero.

La innovación destacable no es arquitectónica sino de formato: el modelo aprende a emitir una consulta de búsqueda entre `<WEB_QUERY>...</WEB_QUERY>`, espera a que el llamante inserte el pasaje recuperado entre `<WEB_RESPONSE>...</WEB_RESPONSE>` y continúa la respuesta. El modelo solo escribe la consulta; la recuperación la ejecuta el usuario con su propio retriever (BM25, API de búsqueda web, etc.). El código de referencia es nanochat (commit upstream `92d63d4`) con una rama local para datos de búsqueda.

## Capacidades

- Generación de texto en inglés con formato de chat en texto plano mediante prefijos `System:`, `User:` y `Assistant:`, con turnos separados por una línea en blanco (no existe chat template).
- Emisión de consultas de búsqueda web estructuradas dentro de bloques `<WEB_QUERY>` y consumo de pasajes insertados en bloques `<WEB_RESPONSE>`.
- Razonamiento multi-turno dentro de la ventana de 4.095 tokens.
- Respuesta a preguntas factuales cuando se le proporciona un pasaje recuperado externamente.
- Generación determinista con decodificación greedy (`do_sample=False`) en el ejemplo del autor.
- Capacidad de suprimir la búsqueda mediante `bad_words_ids` sobre el token `<WEB_QUERY>`.
- No dispone de soporte documentado de tool calling genérico, function calling, visión, audio, modo thinking ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre entrenamiento con búsqueda integrada: el modelo sirve como baseline controlado para medir cuánto aporta preentrenar con bloques de búsqueda frente a introducirlos solo en el SFT, comparándolo directamente con `Kausp11/querylm-dclm-3.3b-sft-search`, que comparte arquitectura, cómputo y datos de ajuste.
- Respuesta a preguntas factuales con recuperación externa: el patrón de tres pasos (el modelo escribe la consulta, el usuario ejecuta el retriever e inserta el pasaje, el modelo responde) permite construir un pipeline RAG mínimo sin necesidad de un orquestador complejo.
- Prototipado de asistentes conversacionales en inglés: el formato de chat en texto plano (`User: ...\n\nAssistant: `) facilita la integración en scripts ligeros sin depender de plantillas de chat de `transformers`.
- Evaluación de retrievers: al estar emparejado con un modelo idéntico preentrenado con búsqueda, permite aislar el efecto del retriever manteniendo constante el resto del pipeline.
- Experimentos académicos de bajo presupuesto: con 3.322,3 M de parámetros reportados y contexto de 4.095 tokens, es viable en GPUs de gama alta de consumo para pruebas de mecánica de búsqueda, aunque la calidad factual depende del pasaje recuperado.
- Generación de consultas de búsqueda: el modelo puede usarse únicamente para producir la consulta (primer paso del patrón), reutilizándola en otros sistemas de recuperación.
- Docencia y reproducción de experimentos: el código nanochat y la procedencia documentada (run `sftnc_v4cannsent_baseline_d32_cm100B`, update 33 de 33) permiten reproducir el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estandarizada, ni comparaciones numéricas con el modelo emparejado. El único ejemplo de salida mostrado por el autor usa un pasaje fijo y, según sus propias palabras, ilustra la mecánica y no la precisión del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 11 GB solo para pesos (5.539,7 M de parámetros almacenados), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 16 GB.
- En cuantización de 8 bits, los pesos rondarían los 5,5 GB; en 4 bits, unos 2,8 GB, aunque el autor no documenta cuantizaciones oficiales ni ficheros GGUF.
- GPU recomendadas: A100 o H100 para despliegue en producción; RTX 4090 (24 GB) para inferencia en bf16 sin problemas; GPUs de 16 GB (RTX 4080, A4000) podrían ser suficientes en bf16 con batches pequeños.
- Cabe en GPU de consumo: sí, en RTX 4090 y previsiblemente en RTX 4080/4070 Ti Super con cuantización o batches reducidos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repositorio incluye `modeling_nanochat.py`); el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada probablemente requiera portar el código.
- Latencia y throughput: no disponibles. El ejemplo del autor se ejecutó en CPU con bfloat16, torch 2.8.0 y transformers 4.56.0, sin cifras de rendimiento.
- El autor advierte de fijar `revision=` a un commit revisado, ya que `trust_remote_code` ejecuta código del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Preentrenamiento con busqueda | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Kausp11/standard-dclm-3.3b-sft-search` (este) | 3.322,3 M reportados / 5.539,7 M almacenados | 4.095 | No | Apache 2.0 | Hugging Face |
| `Kausp11/querylm-dclm-3.3b-sft-search` | Misma arquitectura y computo | 4.095 | Si | Apache 2.0 (segun model card del par) | Hugging Face |
| `Kausp11/standard-dclm-3.3b` (base) | 3.322,3 M reportados | 4.095 | No | Apache 2.0 (segun model card del base) | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numérico entre estos modelos ni con alternativas de otros autores. La comparación relevante es la del par controlado QueryLM/Standard, que comparte arquitectura, cómputo y datos de ajuste fino y difiere únicamente en si el preentrenamiento incluyó bloques de búsqueda.

## Limitaciones y advertencias

- El modelo solo está entrenado y evaluado en inglés; no se documenta soporte de otros idiomas.
- La longitud de contexto es de solo 4.095 tokens, corta para conversaciones largas o pasajes de recuperación extensos.
- Riesgo de alucinación: el modelo base nunca vio bloques de búsqueda en preentrenamiento, por lo que la integración de la búsqueda se aprende únicamente en el SFT y puede ser menos robusta que en el modelo emparejado; el autor no publica métricas de precisión.
- El modelo no ejecuta la búsqueda: solo escribe la consulta; el llamante debe aportar el retriever y el pasaje. La calidad de la respuesta depende del pasaje insertado.
- No hay chat template; `apply_chat_template` no es aplicable y el formato debe construirse manualmente en texto plano.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; el autor recomienda fijar una revisión concreta.
- No se documentan cuantizaciones oficiales, ficheros GGUF ni soporte en motores de inferencia estándar como vLLM o llama.cpp.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/standard-dclm-3.3b-sft-search
- Modelo base: https://huggingface.co/Kausp11/standard-dclm-3.3b
- Modelo emparejado (QueryLM): https://huggingface.co/Kausp11/querylm-dclm-3.3b-sft-search
- Dataset de ajuste fino: https://huggingface.co/datasets/Kausp11/querylm-search-sft-data
- Dataset de preentrenamiento DCLM-Edu: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Código nanochat (commit upstream `92d63d4`): no disponible como enlace directo en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
