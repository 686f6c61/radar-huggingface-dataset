# KasTriCoach/gemma-4-E4B-q4_0-emb8-gguf

## Resumen

`KasTriCoach/gemma-4-E4B-q4_0-emb8-gguf` es una recuantización comunitaria del modelo `google/gemma-4-E4B-it-qat-q4_0-gguf` de Google, publicada en formato GGUF para su uso con llama.cpp. No se trata de un modelo nuevo ni de un fine-tune: el autor parte del fichero QAT Q4_0 oficial y modifica una única tabla de pesos, `token_embd.weight` (que también actúa como cabeza de salida), pasándola de q6_K a q8_0. El resto de tensores queda intacto (Q4_0, F32, `per_layer_token_embd` en q6_K y `per_layer_model_proj` en F16).

La motivación es puramente de despliegue en dispositivo: en un Snapdragon con llama.cpp ejecutando el modelo sobre la NPU Hexagon, la tabla q6_K no puede residir en la NPU y esa última etapa cae a la CPU, lo que penaliza la latencia. Al pasar la tabla a q8_0, la operación completa se ejecuta en la NPU. El autor mide en un Galaxy S26 Ultra una reducción del tiempo de respuesta de 15,8 s a 12,5 s y un aumento de la velocidad de generación de 10,1 a 12,6 tokens/s; con el modelo auxiliar MTP se llega a 10,8 s y 18,0 tokens/s.

El modelo base E4B pertenece a la familia Gemma 4, cuya nomenclatura "E" alude a parámetros efectivos y cuyos tensores `per_layer_token_embd` / `per_layer_model_proj` son característicos de la arquitectura de embeddings por capa de esa serie. El recuento total de parámetros declarado en safetensors es de 7.463.013.674 y el fichero GGUF ocupa 5,32 GB. La relevancia de esta variante es acotada pero concreta: es una pieza de ingeniería orientada a inference en el móvil, no una mejora general del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base Gemma 4 E4B, con tensores de embeddings por capa (`per_layer_token_embd`, `per_layer_model_proj`); detalles completos de la arquitectura del base no disponibles |
| Parametros totales | 7.463.013.674 (dato de safetensors del modelo base); el fichero GGUF resultante pesa 5.317.470.560 bytes |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las mediciones del autor usan una ventana de 4k, no necesariamente el máximo del modelo) |
| Tipos de cuantizacion | Q4_0 (mayoría de tensores), q8_0 (`token_embd.weight`, también cabeza de salida), q6_K (`per_layer_token_embd`), F16 (`per_layer_model_proj`), F32 (tensores sueltos) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 (según el autor; el modelo base es de Google) |
| Formato de pesos | GGUF (fichero único `gemma-4-E4B_q4_0-emb8.gguf`, md5 `4baec702b21235e26eac740217908587`) |

## Arquitectura y entrenamiento

Esta ficha no documenta un entrenamiento: es una conversión de cuantización sobre un modelo ya entrenado. El autor parte de la revisión `4b4a2c1d584be7264f87aac328a1bc739ce81b6c` del repositorio `google/gemma-4-E4B-it-qat-q4_0-gguf`, un checkpoint ya sometido por Google a quantisation-aware training (QAT) en Q4_0, y aplica un único cambio de tipo de tensor. La recuantización se realizó con llama.cpp build b11809 mediante el comando `llama-quantize --allow-requantize --token-embedding-type q8_0 --output-tensor-type q8_0 --tensor-type per_layer_token_embd=q6_k`, con salida en Q4_0.

La innovación técnica es el tratamiento diferencial de la tabla de embeddings, que en estos modelos es compartida con la cabeza de salida: se sube a q8_0 para que sea compatible con el backend NPU (Hexagon) de llama.cpp y deje de ejecutarse en CPU, mientras se mantiene `per_layer_token_embd` en q6_K para no inflar el tamaño y `per_layer_model_proj` en F16. El autor verifica manualmente que la calidad de las respuestas es equivalente a la del fichero original. El modelo base es de tipo instrucción (`-it`), e incluye el soporte de decodificación especulativa mediante un modelo auxiliar MTP (`mtp-gemma-4-E4B-it-Q4_0.gguf`, de la organización ggml-org) y de entrada visual mediante el fichero `gemma-4-E4B-it-mmproj.gguf` del repositorio original. La composición del dataset, el número de tokens de entrenamiento y el uso de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, al derivar de un modelo `-it` (etiqueta `conversational` en el repositorio).
- Razonamiento y respuesta a preguntas, según la descripción general de la familia Gemma 4 en la documentación de Google.
- Capacidad multimodal de entrada de imagen si se carga junto al fichero `gemma-4-E4B-it-mmproj.gguf` del repositorio original (el autor lo indica explícitamente para "fotos").
- Decodificación especulativa mediante el modelo auxiliar MTP referenciado por el autor, que acelera la generación.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas), pensada para servir el modelo tras una API compatible con OpenAI en llama.cpp.
- Ejecución en NPU Hexagon de Qualcomm, que es el objetivo de diseño de esta variante.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Idiomas cubiertos: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional totalmente offline en smartphone Android: el modelo está pensado para ejecutarse sobre la NPU Hexagon de un Snapdragon con llama.cpp/GenieX, con una ventana de 4k y 12,6 tokens/s medidos, suficiente para un chat de voz o texto sin conexión ni coste por token.
- Respuesta a preguntas sobre documentos locales en el dispositivo: al caber en 5,32 GB y ejecutarse en NPU, permite indexar notas o PDFs en el teléfono y consultarlos sin enviar datos a la nube, lo que simplifica el cumplimiento de RGPD.
- Descripción y análisis de fotografías en el móvil: cargando el `mmproj` del repositorio original se habilita la entrada de imagen, útil para accesibilidad (descripción de escenas), lectura de tickets o clasificación de fotos en local.
- Prototipado rápido en portátil con Ollama o llama.cpp: el fichero GGUF único se carga sin configuración adicional, lo que permite validar prompts y flujos conversacionales antes de invertir en un modelo mayor.
- Servicio de atención al cliente de baja latencia en hardware de borde: con un tiempo de primera respuesta de ~11-13 s en un móvil de gama alta y 18 tokens/s con MTP, es viable para respuestas cortas en kioscos o terminales de punto de venta sin backend.
- Traducción y resumen de textos en campo (técnicos, sanitarios, logística) donde no hay conectividad, aceptando el coste de calidad de una cuantización 4 bits.
- Generación asistida de texto corto en aplicaciones móviles (respuestas de correo, notas, resúmenes de reunión) integrada mediante endpoints compatibles con la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo publica mediciones de latencia y throughput en dispositivo, sobre un Galaxy S26 Ultra con GenieX / llama.cpp, E4B en NPU y ventana de 4k:

| Variante | Tiempo de respuesta (s) | Velocidad de generación (tokens/s) |
|---|---|---|
| Original (token_embd en q6_K) | 15,8 | 10,1 |
| Esta versión (token_embd en q8_0) | 12,5 | 12,6 |
| Esta versión + modelo auxiliar MTP | 10,8 | 18,0 |

El autor indica que la calidad de las respuestas fue equivalente en una comprobación manual, sin aportar métricas automáticas.

## Requisitos de hardware

- Almacenamiento: 5,32 GB para el fichero GGUF, más el `mmproj` si se usa visión y el modelo MTP si se usa decodificación especulativa.
- VRAM/RAM estimada para inferencia: los pesos ocupan 5,32 GB; hay que sumar la caché KV, por lo que se recomienda un mínimo de 6-8 GB de memoria disponible para una ventana de 4k. Estimación de ingeniería, no un dato publicado por el autor.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4060 Ti 16 GB y superiores; también en Apple Silicon con 8 GB o más de memoria unificada. Una RTX 4090, A100 o H100 está muy sobredimensionada para este tamaño y no aporta ventaja en un modelo de 4 bits de 7,46B.
- Escenario objetivo: smartphone con Snapdragon y NPU Hexagon, ejecutando el modelo íntegramente en NPU (backend NPU de llama.cpp / GenieX). Es el único caso para el que el autor aporta cifras.
- Opciones de despliegue: llama.cpp (build b11809 o superior, necesario para respetar los tipos de tensor), GenieX en Qualcomm, y clientes basados en llama.cpp como Ollama, LM Studio o KoboldCpp siempre que su versión embebida de llama.cpp sea lo bastante reciente. Soporte en vLLM o TGI: no disponible / no verificado para este fichero.
- Latencia y throughput medidos: 12,5 s de respuesta y 12,6 tokens/s en NPU; 10,8 s y 18,0 tokens/s con MTP. No hay datos de GPU de escritorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Origen |
|---|---|---|---|---|---|
| Este repositorio (`KasTriCoach/gemma-4-E4B-q4_0-emb8-gguf`) | 7.463.013.674 | no disponible | Q4_0 con `token_embd` en q8_0 | apache-2.0 | Conversión comunitaria |
| `google/gemma-4-E4B-it-qat-q4_0-gguf` (base) | 7.463.013.674 | no disponible | Q4_0 con `token_embd` en q6_K | apache-2.0 según el autor | Google (QAT oficial) |
| `mtp-gemma-4-E4B-it-Q4_0.gguf` (ggml-org) | no disponible | no disponible | Q4_0 | no disponible | Modelo auxiliar MTP, no sustituye al modelo principal |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación de rendimiento con otras familias de modelos del mismo tamaño (por ejemplo, alternativas de ~4-8B en 4 bits). La familia Gemma 4 se describe en la documentación de Google como compuesta por cuatro arquitecturas distintas, pero no se detallan en la información disponible los parámetros ni los resultados de la variante E4B frente a sus hermanas.

## Limitaciones y advertencias

- Es una conversión comunitaria, no un modelo de Google; el autor lo indica explícitamente. Cualquier problema de calidad debe atribuirse a la recuantización, no al modelo original.
- La cuantización Q4_0 es agresiva: aunque el checkpoint base ya pasó por QAT, la tabla de salida en q8_0 y el resto en 4 bits implican una pérdida de calidad no cuantificada con métricas automáticas (solo hay una comprobación manual del autor).
- La ganancia de rendimiento está medida en un único dispositivo (Galaxy S26 Ultra con NPU Hexagon) y con ventana de 4k; no es extrapolable a GPU de escritorio ni a otros SoC.
- Riesgo de alucinación inherente a un modelo de ~7,46B de parámetros en 4 bits; no se han publicado evaluaciones de fidelidad.
- Idiomas soportados no documentados en el repositorio; el modelo base de Google es multilingüe, pero esta ficha no puede confirmar coberturas concretas ni calidad por idioma.
- Longitud máxima de contexto no documentada; las cifras del autor corresponden a 4k, por lo que no debe asumirse una ventana mayor.
- La model card está redactada en neerlandés y es muy escueta; no incluye información sobre sesgos, datos de entrenamiento ni evaluación de seguridad.
- Licencia: el repositorio declara apache-2.0, y el autor afirma que coincide con la del modelo original. Antes de un uso comercial conviene verificar los términos vigentes en el repositorio de Google, porque las condiciones de la familia Gemma han variado entre versiones y la licencia declarada en un derivado no sustituye a la del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación por parte de la comunidad.
- El uso de visión requiere descargar un fichero `mmproj` de otro repositorio, y el de decodificación especulativa un modelo MTP adicional de ggml-org; ambos deben versionarse y verificarse por separado. La decodificación especulativa puede alterar ligeramente la distribución de salida frente a la generación normal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KasTriCoach/gemma-4-E4B-q4_0-emb8-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- Colección oficial de cuantizaciones QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Página del modelo Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4: https://gemma.ai/models/gemma-4/
- Artículo de Analytics Vidhya sobre la familia Gemma 4: https://www.analyticsvidhya.com/blog/2026/04/googles-gemma-4-open-source-model/
- Guía de descarga y despliegue local de Gemma 4: https://gemmai4.com/download/
- Modelo auxiliar MTP `mtp-gemma-4-E4B-it-Q4_0.gguf` (organización ggml-org): URL no proporcionada en la información disponible.
