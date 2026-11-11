# muyleanging/Akkhara-ByT5-Small-Khmer

## Resumen

Akkhara-ByT5-Small-Khmer es un modelo de transliteración y romanización inversa para jemer (khmer): convierte texto escrito en "Sing Khmer" —jemer tecleado con letras latinas, tal como se usa en chats y redes sociales— en escritura jemer nativa. Lo desarrolla Ing Muyleang y se distribuye con licencia Apache-2.0. El modelo devuelve una lista ordenada de las cinco mejores candidatas, imitando el comportamiento de un asistente de entrada (IME) para teclados.

Técnicamente es un T5 a nivel de byte (byte-level encoder-decoder) afinado a partir de `google/byt5-small`, con 299,6 millones de parámetros. Al operar sobre bytes en lugar de tokens subpalabra, maneja de forma natural la mezcla de alfabetos (latino y jemer), los signos de puntuación y las palabras inglesas intercaladas sin necesidad de un vocabulario específico. El contexto de entrenamiento del modelo base es de 512 tokens, aunque no se publica un valor explícito en la model card.

Su relevancia es práctica: el jemer se escribe con un sistema de escritura complejo y muchos usuarios teclean en transliteración latina informal. Un modelo que resuelva esa conversión con precisión a nivel de frase (CER del 3,73% en texto formal) tiene aplicación directa en teclados móviles, correctores y sistemas de entrada. La versión mini (18M) del mismo autor está pensada para ejecutarse en teléfonos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder T5 a nivel de byte (ByteT5) |
| Parametros totales | 299.637.760 (299,6M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo base byt5-small: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers) |
| Idiomas soportados | jemer (km) y palabras inglesas intercaladas en la entrada (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un T5 encoder-decoder que trabaja sobre bytes UTF-8 en lugar de tokens subpalabra, heredado de `google/byt5-small`. Esta decisión es clave para el caso de uso: el vocabulario de bytes cubre cualquier carácter latino, jemer, emoji o símbolo sin tokens fuera de vocabulario, lo que permite procesar entradas mixtas como `sok sbay ot haha bro nv alov` sin fragmentación problemática. El decoder genera la secuencia jemer correspondiente y, mediante búsqueda por haz con 5 haces, se obtienen las cinco candidatas ordenadas.

El entrenamiento se realizó sobre pares Sing Khmer → jemer recopilados, generados, limpiados y revisados por el autor con ayuda de herramientas de IA (agy, Claude). El conjunto de datos, `INGMUYLEANG/Akkhara-Sing-Khmer`, está disponible bajo solicitud. No se publican detalles de hardware, tiempo de entrenamiento, número de tokens ni si se aplicaron técnicas de RLHF o DPO; la model card indica explícitamente que esa información no está disponible. Tampoco se documenta ninguna innovación arquitectónica adicional más allá del uso de representación a nivel de byte y la decodificación por haz para el ranking de candidatas.

## Capacidades

- Transliteración de Sing Khmer (jemer en letras latinas) a escritura jemer nativa, a nivel de frase completa.
- Generación de un ranking top-5 de candidatas, útil como asistente de tecleo (IME).
- Manejo de mezcla de código (code-mixing): las palabras inglesas de la entrada se conservan en inglés.
- Procesamiento de signos de puntuación y exclamaciones en contexto de chat (por ejemplo, `jom! loy mes` → ចុម! ឡូយម្ល៉េះ).
- Resolución de abreviaturas de chat (`tmr` → ស្អែក, `sry` → សុំទោស, `btw` → ម្យ៉ាងទៀត).
- Desambiguación contextual de palabras cortas ambiguas (`ng` = និង / នឹង / ហ្នឹង) usando las palabras vecinas.
- Manejo de palabras pegadas (glued words): 7 de 7 casos resueltos en las pruebas del autor.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Teclado móvil con asistente de entrada: el modelo puede integrarse en una app de teclado para ofrecer las cinco mejores transcripciones jemer mientras el usuario teclea en latín; el autor publica precisamente una app de teclado (`akkhara-keyboard`) que lo usa. Para tecleo en vivo se recomienda trocear la entrada en bloques de unas 6 palabras y cachear los bloques ya resueltos.
- Normalización de mensajes de chat para análisis: en pipelines de moderación o análisis de redes sociales, el modelo convierte mensajes en Sing Khmer a escritura jemer estándar antes de aplicar NLP sobre jemer, evitando perder mensajes escritos en transliteración.
- Corrección y autocompletado en procesadores de texto jemer: dado que devuelve un ranking top-5 con CER bajo en texto formal, puede alimentar sugerencias de corrección para usuarios que mezclan latín y jemer al escribir documentos.
- Búsqueda y recuperación de información: indexar contenido jemer requiere normalizar consultas tecleadas en latín; el modelo permite mapear la consulta a escritura jemer y buscar en el índice con la forma canónica.
- Generación de datos sintéticos para NLP en jemer: al ser un conversor bidireccional de facto (con el corpus adecuado), puede emplearse para aumentar datasets jemer con variantes de transliteración, útil para entrenar otros modelos de la lengua.
- Transcripción de mensajes históricos o archivados: convertir grandes volúmenes de chat antiguos escritos en Sing Khmer a jemer legible para su conservación o publicación.
- Prototipado rápido de funcionalidades de localización: con 300M de parámetros y pesos safetensors, se puede servir con transformers en una GPU modesta para validar producto antes de invertir en el modelo mini para producción móvil.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (misma búsqueda por haz de 5 haces para ambos modelos). El conjunto de test retenido tiene 7.821 frases; el de chat real, 39 frases etiquetadas por un hablante nativo; el de contexto, 86 pruebas; el de palabras pegadas, 7 pruebas.

| Modelo | Test top-1 | Test top-5 | Test CER | Chat real top-1 / top-5 | Contexto #1 / top-5 | Pegadas |
|---|---|---|---|---|---|---|
| akkhara-mini (18M) | 57,9% | 76,6% | 4,55% | 87% / 95% | 81% / 99% | 7/7 |
| akkhara-byt5-small (300M) | 62,0% | 79,7% | 3,73% | 87% / 95% | 80% / 98% | 7/7 |

El modelo de 300M es el más preciso en texto formal tipo noticia (menor CER), mientras que en chat real ambos modelos empatan en top-1 (87%) y top-5 (95%). No se han publicado comparaciones con modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en fp32 (tamaño del repo), en torno a 0,6 GB en fp16 y menos de 0,5 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida; el modelo mini (18M) está pensado para ejecución en teléfonos.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (el repo está marcado como compatible con endpoints), y cuantización estándar de la librería; no se documenta soporte específico de vLLM, llama.cpp u Ollama para este modelo.
- Latencia y throughput: no disponibles; el autor no publica mediciones. Para uso interactivo recomienda trocear la entrada en bloques de ~6 palabras y cachear resultados.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Akkhara-ByT5-Small-Khmer | 299,6M | ByteT5 fine-tuned, transliteración Sing Khmer → jemer | no disponible (base: 512) | Apache-2.0 | Hugging Face |
| akkhara-mini | 18M | Mismo enfoque, orientado a móvil (ONNX) | no disponible | no disponible en la información | Hugging Face |
| google/byt5-small | ~300M | ByteT5 base, propósito general multilingüe | 512 | Apache-2.0 | Hugging Face |

No se dispone de información sobre otros modelos públicos de transliteración Sing Khmer → jemer con los que comparar rendimiento, contexto o licencia.

## Limitaciones y advertencias

- Entrenado mayoritariamente con pares sintéticos; el conjunto de prueba de chat real es muy pequeño (39 frases), por lo que las métricas en conversación real tienen alta incertidumbre.
- Las abreviaturas cortas son ambiguas (`ng`, `mn`, `dl`, `bn`); la respuesta correcta suele estar en el top-5 pero no siempre en la primera posición.
- El modelo conoce y reproduce palabras malsonantes del chat real, lo que puede requerir filtrado en aplicaciones públicas.
- Riesgo de alucinación en entradas fuera de distribución: al ser un generador seq2seq, puede producir texto jemer plausible pero incorrecto en lugar de indicar que no entiende la entrada.
- No se documentan sesgos específicos ni evaluación de sesgos; el corpus lo construyó un único autor con asistencia de IA, lo que limita la diversidad de estilos y dialectos.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento (`INGMUYLEANG/Akkhara-Sing-Khmer`) está bajo solicitud y sus condiciones de uso no se detallan.
- No se publican detalles de entrenamiento (hardware, tiempo, hiperparámetros), lo que dificulta la reproducibilidad.
- El contexto efectivo es el del modelo base (512 tokens); no se documenta ampliación, por lo que entradas muy largas deben trocearse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/Akkhara-ByT5-Small-Khmer
- Página del autor en Hugging Face: https://huggingface.co/INGMUYLEANG
- Dataset de entrenamiento: https://huggingface.co/datasets/INGMUYLEANG/Akkhara-Sing-Khmer
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/INGMUYLEANG/Akkhara-Demo
- App de teclado (GitHub): https://github.com/MuyleangIng/akkhara-keyboard
- Perfil del autor en GitHub: https://github.com/MuyleangIng
- Modelo mini para móvil (ONNX): https://huggingface.co/INGMUYLEANG/Akkhara-Mini-Khmer-ONNX
- Modelo base: https://huggingface.co/google/byt5-small
