# moonbox-dev/Ministral-3-8B-Instruct-2512-GGUF

## Resumen

Ministral 3 8B Instruct 2512 es un modelo de lenguaje multimodal (texto e imagen) de 8.489.553.920 parámetros desarrollado por Mistral AI, publicado como versión instruct post-entrenada dentro de la familia Ministral 3. Esta ficha concreta corresponde a la cuantización GGUF elaborada por moonbox-dev para su uso con llama.cpp en hardware de consumo, incluyendo soporte de entrada de imagen mediante el encoder Pixtral empaquetado en un fichero `mmproj` independiente.

El modelo resuelve el problema de desplegar un LLM multimodal de calidad en entornos de borde y estaciones de trabajo sin GPU de centro de datos: el original en BF16 ocupa unos 17 GB y cabe en 24 GB de VRAM, mientras que las cuantizaciones Q4_K_M y Q5_K_M reducen el peso por debajo de 12 GB. La familia Ministral 3 está diseñada explícitamente para despliegue en el borde, con capacidades de visión integradas mediante el encoder Pixtral.

Esta variante GGUF es relevante porque ofrece ficheros verificados tensor a tensor contra el checkpoint original (531 de 531 tensores con los mismos valores), con métricas de divergencia KL frente a BF16 publicadas por precisión, lo que permite elegir el nivel de cuantización con criterio técnico en lugar de a ciegas. La licencia es Apache 2.0, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM Ministral 3 + encoder de visión Pixtral), no disponible el detalle fino de capas y dimensiones |
| Parametros totales | 8.489.553.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (estas dos últimas y Q6_K con importance matrix) |
| Idiomas soportados | no disponible (los prompts de evaluación son 8 en inglés y 4 en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero `mmproj` GGUF separado para el encoder de visión |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Ministral 3: el fichero GGUF principal contiene el modelo de lenguaje y el fichero `mmproj-ministral-3-8b-instruct-F16.gguf` (857,1 MB) contiene el encoder de visión Pixtral junto con su proyector, necesario únicamente para entrada de imagen. El modelo es la versión instruct post-entrenada, ajustada para tareas de instrucción y chat, y responde directamente sin modo de razonamiento extendido (no es un modelo de "thinking").

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO en el post-entrenamiento del modelo base; esos datos corresponden a la model card original de Mistral AI, que no se incluye completa en la información proporcionada. La innovación técnica destacable de esta variante es el proceso de cuantización: los ficheros Q6_K, Q5_K_M y Q4_K_M se generaron con importance matrix calculada con `llama-imatrix` sobre 200 secuencias de 512 tokens de WikiText-2 train (usando el fichero Q8_0), y se midió que sin importance matrix el resultado empeora (KL 0,0067 para Q5_K_M y 0,023 para Q4_K_M). Además, el conversor de llama.cpp b12621 omitía la fila de embedding del token `[IMG_BREAK]` en el `mmproj` para este formato de checkpoint, por lo que moonbox-dev aplicó un parche de una línea (`lab/recipes/gguf/convert_mistral3_mmproj.py`) para incluirlo.

## Capacidades

- Generación de texto conversacional e instruccional en formato chat.
- Comprensión de imágenes (image-text-to-text): descripción de fotografías, respuesta a preguntas sobre contenido visual, mediante el encoder Pixtral.
- Respuesta directa sin cadena de pensamiento explícita (modelo instruct, no thinking).
- Capacidades multilingües: no documentadas en detalle; la evaluación interna usa inglés y chino.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles; el `mmproj` de esta variante es únicamente de visión.

## Casos de uso

- Asistencia visual en el dispositivo: el modelo puede describir y responder preguntas sobre imágenes capturadas localmente (por ejemplo, fotos de escritorio, productos o documentos) usando el `mmproj` Pixtral, sin enviar datos a la nube, lo que resulta adecuado para privacidad y cumplimiento.
- Chat de atención al cliente en estaciones de trabajo: al ser un modelo instruct de 8B con pesos por debajo de 12 GB en Q4_K_M, se puede servir con llama.cpp en un servidor modesto o incluso en un portátil con GPU de consumo, gestionando conversaciones multi-turno.
- Procesamiento de documentos escaneados: combinando entrada de imagen y texto, el modelo puede extraer y resumir información de capturas o fotografías de documentos en flujos de digitalización locales.
- Prototipado rápido de aplicaciones multimodales: el servidor `llama-server` expone `/v1/chat/completions` compatible con la API de OpenAI, permitiendo integrar el modelo en aplicaciones existentes añadiendo partes `image_url` sin cambiar el código cliente.
- Despliegue en hardware de borde con Metal, CUDA, Vulkan o CPU: los ficheros GGUF funcionan en Mac con Metal, en GPUs NVIDIA con CUDA, en GPUs integradas con Vulkan y en CPU pura, lo que cubre escenarios de campo, kioscos o dispositivos sin acelerador dedicado.
- Evaluación y control de calidad de cuantizaciones: los datos de divergencia KL y coincidencia de token superior publicados por precisión permiten a un equipo elegir el fichero con el compromiso adecuado entre memoria y fidelidad (Q5_K_M y Q6_K pasan el umbral del laboratorio de KL <= 0,01 y coincidencia >= 90 %).
- Asistente local de accesibilidad: descripción de imágenes para usuarios con discapacidad visual ejecutándose íntegramente en un portátil, sin dependencia de servicios externos.

## Benchmarks y rendimiento

La información disponible incluye únicamente la evaluación interna de moonbox-dev sobre fidelidad de cuantización, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.).

| Fichero | Tamano | Peso frente a BF16 | KL chat | Mismo token superior | Veredicto |
|---|---|---|---|---|---|
| F16 | 16,99 GB | igual a BF16 | 0,00004 | 99,8 % | pasa |
| BF16 | 16,99 GB | referencia | referencia | referencia | referencia |
| Q8_0 | 9,03 GB | 0,54 % de desviación | 0,0004 | 99,8 % | pasa |
| Q6_K | no disponible | no disponible | no disponible | no disponible | pasa |
| Q5_K_M | no disponible | no disponible | no disponible | no disponible | pasa |
| Q4_K_M | no disponible | no disponible | 0,022 | no disponible | experimental |

Metodología: 12 prompts cortos (8 en inglés, 4 en chino) en la plantilla de chat del modelo; referencia generada con BF16 de forma greedy hasta 64 tokens (642 en total); cada fichero evaluado con teacher forcing sobre esos tokens mediante `llama-server` en CUDA (RTX 3080 Laptop, con algunas capas en CPU). El umbral de aprobado del laboratorio es KL <= 0,01 nats y coincidencia de token superior >= 90 %. Sin importance matrix, Q5_K_M obtuvo KL 0,0067 y Q4_K_M KL 0,023.

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16/F16 ~17 GB de pesos; Q8_0 ~9 GB; Q4_K_M por debajo de 12 GB según la model card original (menos de 12 GB de RAM/VRAM en cuantizado). El `mmproj` añade 857,1 MB.
- GPU recomendadas: el modelo base en BF16 cabe en 24 GB de VRAM (por ejemplo, RTX 4090, A10G, L4 de 24 GB); las cuantizaciones Q4_K_M y Q5_K_M permiten GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 3080 de 12 GB).
- Cabe en GPU de consumo: sí, en Q4_K_M y Q5_K_M en GPUs de 12 GB o más; con Q4_K_M y capas parciales en CPU también en equipos de 8 GB de VRAM.
- Opciones de despliegue: llama.cpp (requiere versión b12621 o superior), `llama-server` con endpoint `/v1/chat/completions` compatible con OpenAI; soporte de Metal, CUDA, Vulkan y CPU. No se mencionan vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La evaluación se realizó en una RTX 3080 Laptop con parte de las capas en CPU, pero no se publican cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Ministral 3 8B Instruct 2512 (esta ficha, GGUF) | 8,49 B | no disponible | sí (Pixtral) | Apache 2.0 | GGUF |
| Ministral 3 8B Instruct 2512 BF16 (original) | 8,49 B | no disponible | sí (Pixtral) | Apache 2.0 | safetensors |
| Ministral 3 8B Instruct 2512 FP8 (oficial) | 8,49 B | no disponible | sí (Pixtral) | Apache 2.0 | no disponible |

No se dispone en la información proporcionada de datos de rendimiento comparativo frente a otros modelos de 8B (Llama 3.1 8B, Qwen2.5-VL 7B, Gemma 2 9B) ni de sus especificaciones de contexto, por lo que la comparativa se limita a las variantes del mismo modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado con datos web, es previsible que herede sesgos de esos datos, pero no se aportan datos concretos.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a los modelos generativos de 8B, especialmente en tareas factuales y en descripción de imágenes ambiguas.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica; los idiomas soportados no están documentados, y la evaluación interna solo cubre inglés y chino, por lo que el rendimiento en castellano no está verificado.
- Cuantización: Q4_K_M está marcada como experimental por el autor (KL 0,022, por encima del umbral de 0,01); para producción se recomienda Q5_K_M, Q6_K o Q8_0, que superan el criterio del laboratorio.
- Dependencia de versión: requiere llama.cpp b12621 o superior; versiones anteriores del conversor no generan correctamente el `mmproj` para este checkpoint.
- La entrada de imagen requiere cargar el fichero `mmproj` además del modelo, lo que incrementa el consumo de memoria en 857,1 MB y añade complejidad al despliegue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los ficheros son un derivado del modelo original y heredan su licencia; conviene revisar la model card original de Mistral AI para condiciones adicionales.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deben asumirse en producción sin verificación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/moonbox-dev/Ministral-3-8B-Instruct-2512-GGUF
- Modelo base BF16: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Versión FP8 oficial: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Colección de checkpoints adicionales: https://huggingface.co/collections/mistralai/ministral-3-additional-checkpoints
- Blog de Mistral AI: https://mistral.ai/news/mistral-3
- Paper: https://arxiv.org/abs/2601.08584
- llama.cpp: https://github.com/ggml-org/llama.cpp
