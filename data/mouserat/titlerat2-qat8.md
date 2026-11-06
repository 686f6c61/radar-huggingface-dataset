# Mouserat/titlerat2-qat8

## Resumen

Titlerat2-qat8 es un modelo de generación de títulos cortos (title generation) desarrollado por el usuario Mouserat, afinado a partir de google/mt5-small y cuantizado mediante Quantization-Aware Training a 8 bits (QAT8). Su función es recibir un par formado por una petición del usuario y la respuesta del asistente, y devolver una frase nominal breve que resume el tema de la conversación, pensada para etiquetar historiales de chat. No genera respuestas conversacionales, sino únicamente el título.

El modelo parte de la arquitectura encoder-decoder de mT5-small, con aproximadamente 300 millones de parámetros, y ha sido afinado sobre 85.672 ejemplos en cuatro idiomas (japonés, inglés, coreano y chino, este último en variantes simplificada y tradicional). El repositorio incluye dos versiones: los pesos en FP32 (`before_quantization/`) y los pesos empaquetados en enteros de 8 bits (`after_quantization/`), que requieren un procedimiento de desempaquetado específico y no se cargan con `from_pretrained()` estándar.

Su relevancia es acotada pero clara: cubre una tarea de infraestructura muy concreta (titulado automático de conversaciones) en un modelo pequeño, multilingüe en el ámbito del este asiático y con licencia Apache-2.0, lo que facilita su integración en productos de chat sin coste de licencia. No obstante, el autor declara explícitamente que no se han realizado evaluaciones de inferencia sobre esta variante cuantizada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5-small) |
| Parámetros totales | ~300 millones (heredados de google/mt5-small) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QAT8 (8 bits, entrenamiento consciente de cuantización); pesos FP32 y empaquetado entero de 8 bits |
| Idiomas soportados | ja, en, ko, zh (zh_Hans y zh_Hant) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 en `before_quantization/`; entero empaquetado en `after_quantization/`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de google/mt5-small, un transformer encoder-decoder con vocabulario multilingüe compartido. Sobre la base se añadieron cuatro tokens especiales de delimitación (`<user>`, `</user>`, `<assistant>`, `</assistant>`) que estructuran la entrada: la petición del usuario y la respuesta del asistente se encapsulan en etiquetas, y el modelo emite una frase nominal corta como título. La variante QAT8 aplica entrenamiento consciente de cuantización para que los pesos sean robustos a la representación en 8 bits; el repositorio separa los pesos FP32 resultantes del entrenamiento y el empaquetado entero final.

El conjunto de entrenamiento consta de 85.672 ejemplos. La mayor parte (37.319) corresponde a pares ja/en procedentes de SFT-General-Japanese-60K, tagengo-gpt4, shisa-v2-sharegpt, ShareGPT-Processed, además de 433 ejemplos de rechazo sintéticos y 22 diálogos propios. Se añadieron 19.298 ejemplos en coreano (KoAlpaca-v1.1, EverythingLM-V2-Ko, korean-writing-style-instruct), 18.224 en chino simplificado (smoltalk-chinese), 7.866 en chino tradicional (aya_collection_language_split, Traditional_Chinese-aya_dataset), 2.815 en inglés (aya_dataset, aya_collection_language_split) y 150 ejemplos de entrada vacía con salida vacía. Se excluyeron artículos de prensa copiados, instrucciones plantilla sintéticas y filas descartadas por revisión humana. Parte de los títulos de entrenamiento se generaron con Qwen/Qwen3.5-4B. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Generación de títulos cortos en forma de frase nominal para conversaciones de chat, a partir del par petición-respuesta.
- Manejo de entradas con respuesta vacía: si el bloque `<assistant>` está vacío, el modelo titula únicamente a partir de la petición.
- Salida vacía ante entrada vacía (comportamiento entrenado explícitamente con 150 ejemplos sintéticos).
- Cobertura multilingüe en japonés, inglés, coreano y chino simplificado y tradicional.
- No genera texto conversacional, no realiza tool calling ni function calling, no soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- No está diseñado para moderación, detección de seguridad ni juicio de rechazo.

## Casos de uso

- Etiquetado automático de historiales de chat: al abrir la lista de conversaciones de un asistente, el modelo recibe cada par petición-respuesta y devuelve un título breve que sustituye al truncado del primer mensaje, mejorando la navegabilidad.
- Organización de conversaciones en aplicaciones multilingües del este asiático: al cubrir ja, ko, zh_Hans y zh_Hant, un mismo despliegue puede titular chats de usuarios de Japón, Corea y regiones sinohablantes sin modelos separados.
- Generación de asuntos en correo o mensajería interna: a partir del hilo de un mensaje y su respuesta, produce una frase nominal que sirve como asunto o etiqueta de la conversación.
- Resumen de tickets de soporte: el título generado puede usarse como campo de resumen corto en un sistema de ticketing, ayudando al enrutado manual por parte de agentes humanos.
- Indexación y búsqueda de conversaciones: los títulos sirven como metadatos para motores de búsqueda internos o para agrupar conversaciones por tema en paneles de analítica.
- Prototipado rápido en entornos con recursos limitados: al ser un modelo de ~300 M de parámetros con licencia Apache-2.0 y pesos de 8 bits, puede desplegarse en una instancia pequeña o incluso en CPU para pruebas de concepto de titulado automático.
- Etiquetado de datasets de diálogo: uso interno para anotar corpus conversacionales con títulos temáticos antes de su revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que no se ha realizado evaluación de inferencia sobre esta configuración de pesos concreta y que no reutiliza métricas de la versión Full ni de otras cuantizaciones. La model card menciona únicamente una tasa de acierto (OK) del 90 % para chino tradicional (zh_Hant), sin especificar el conjunto de evaluación ni la métrica exacta, por lo que no se presenta como benchmark comparable.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~300 M de parámetros, la inferencia en FP32 requiere aproximadamente 1,2 GB de pesos; en 8 bits, en torno a 300-400 MB de pesos, más el overhead de activaciones y del runtime.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o incluso una GTX 1650 son adecuadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente.
- Despliegue: al ser un modelo de la librería transformers, puede servirse con TGI o con un script de inferencia estándar; la variante empaquetada en 8 bits requiere el procedimiento de desempaquetado documentado en `after_quantization/README.md` antes de cargar los pesos. No se documenta soporte para vLLM, llama.cpp u Ollama, dado que no se distribuye en formato GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Mouserat/titlerat2-qat8 | ~300 M (mT5-small) | no disponible | ja, en, ko, zh | Apache-2.0 | Tarea específica de titulado; variante QAT8 |
| google/mt5-small | ~300 M | 512 tokens (por especificación de mT5) | multilingüe (~100 idiomas) | Apache-2.0 | Modelo base; no especializado en titulado |
| google/mt5-base | ~580 M | 512 tokens (por especificación de mT5) | multilingüe (~100 idiomas) | Apache-2.0 | Alternativa de mayor tamaño, sin fine-tuning para titulado |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada; la comparación se limita a parámetros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- Repetición de términos en la salida (por ejemplo, «意味と意味»); el autor sugiere usar `no_repeat_ngram_size` en generación, aunque no lo ha evaluado.
- Errores ortográficos y de caracteres ocasionales en los títulos generados.
- Títulos demasiado genéricos en algunos casos (por ejemplo, «問題解答»).
- Rendimiento inferior en chino tradicional (zh_Hant) respecto al resto de idiomas, con una tasa OK del 90 % declarada, atribuida a menor volumen de datos.
- Mayor probabilidad de confundir el tema en peticiones largas, y peor rendimiento en peticiones largas en inglés que en japonés.
- En peticiones sobre temas dañinos, el título puede incluir el nombre del tema (por ejemplo, «火薬の作り方について»), sin que ello implique juicio de seguridad.
- Los caracteres desconocidos (`<unk>`) se eliminaron del entrenamiento; entradas con muchos caracteres fuera de vocabulario pueden degradar la calidad.
- No genera respuestas, no evalúa seguridad y no debe usarse para decisiones de rechazo o moderación.
- La variante `after_quantization/` no se carga con `from_pretrained()` estándar; requiere el desempaquetado documentado, lo que añade complejidad operativa.
- El autor no ha evaluado la inferencia de esta variante cuantizada, por lo que el rendimiento real en producción es incierto.
- Licencia Apache-2.0 para pesos y código, pero las condiciones de los datasets de origen deben verificarse por separado; el autor marca este punto como pendiente de confirmación antes de publicación.
- El dataset de entrenamiento no es público, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mouserat/titlerat2-qat8
- Modelo base: https://huggingface.co/google/mt5-small
- Notebook Colab (antes de cuantización): https://colab.research.google.com/#fileId=https://huggingface.co/Mouserat/titlerat2-qat8/blob/main/before_quantization/titlerat_v1_colab.ipynb
- Notebook Colab (después de cuantización): https://colab.research.google.com/#fileId=https://huggingface.co/Mouserat/titlerat2-qat8/blob/main/after_quantization/titlerat_v1_colab.ipynb
- Instrucciones de desempaquetado: https://huggingface.co/Mouserat/titlerat2-qat8/blob/main/after_quantization/README.md
