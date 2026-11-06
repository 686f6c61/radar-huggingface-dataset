# misfitandmisfit/dolphin-2.2.1-mistral-7B-GGUF

## Resumen

Dolphin 2.2.1 Mistral 7B es un modelo de lenguaje de 7.241.748.480 parámetros desarrollado por Eric Hartford, construido sobre la arquitectura Mistral 7B y afinado con datasets de instrucciones y conversación (ehartford/dolphin y jondurbin/airoboros-2.2.1). El modelo original se distribuye bajo licencia Apache 2.0 y está orientado a tareas de generación de texto, razonamiento e instrucciones en inglés, con una plantilla de prompt de tipo ChatML.

La ficha que nos ocupa corresponde al repositorio `misfitandmisfit/dolphin-2.2.1-mistral-7B-GGUF`, una redistribución en formato GGUF de los pesos originales, presumiblemente derivada de las cuantizaciones publicadas por TheBloke (la model card incluida referencia explícitamente a TheBloke como `quantized_by`). El repositorio tiene un tamaño de 55,0 GB, lo que sugiere que agrupa múltiples ficheros de cuantización en distintos niveles de bits.

El interés de esta ficha radica en que permite ejecutar un modelo de 7B afinado para conversación en hardware de consumo mediante llama.cpp y ecosistemas compatibles con GGUF. No obstante, conviene señalar que el repositorio no presenta descargas ni interacciones, y que la información técnica disponible sobre el proceso de cuantización específico de este fork es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral 7B) |
| Parámetros totales | 7.241.748.480 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GGUF en 2, 3, 4, 5, 6 y 8 bits (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, según la model card heredada) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (GGUFv2) |

## Arquitectura y entrenamiento

El modelo base es Mistral 7B, un transformer decoder-only con atención de tipo grouped-query y ventana de contexto deslizante, aunque los detalles concretos de configuración (número de capas, dimensiones ocultas, cabezas de atención) no se detallan en la información proporcionada. El modelo fue afinado por Eric Hartford sobre los datasets `ehartford/dolphin` y `jondurbin/airoboros-2.2.1`, orientados a instrucciones, razonamiento y conversación. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

La contribución de este repositorio es la conversión a formato GGUF mediante herramientas de llama.cpp, con cuantizaciones en varios niveles de bits. La model card indica compatibilidad con llama.cpp desde el commit `d0cee0d` (27 de agosto de 2023) y con múltiples clientes de terceros. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto e instrucciones en inglés con plantilla ChatML.
- Razonamiento multi-turno y mantenimiento de conversaciones con rol de sistema, usuario y asistente.
- Respuesta a instrucciones y tareas de tipo pregunta-respuesta.
- Razonamiento y resolución de problemas descritos en lenguaje natural (capacidad heredada del modelo base, sin benchmarks publicados en este repositorio).
- Ejecución en CPU y GPU mediante llama.cpp y clientes compatibles con GGUF.
- Soporte de cuantizaciones de 2 a 8 bits para ajustar el equilibrio entre calidad y requisitos de memoria.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en un portátil o estación de trabajo con llama.cpp y mantener diálogos multi-turno en inglés con la plantilla ChatML, sin depender de servicios en la nube.
- Prototipado rápido de aplicaciones de chat: permite validar prompts, plantillas y flujos de conversación en local antes de migrar a modelos mayores o a APIs externas.
- Generación de texto asistida en herramientas de escritorio: integrable en LM Studio, Faraday.dev o text-generation-webui para tareas de redacción y resumen en inglés.
- Experimentación académica con cuantización: los distintos niveles GGUF (Q2_K a Q8_0) permiten estudiar la degradación de calidad frente al consumo de memoria en un modelo de 7B.
- Procesamiento por lotes en CPU: al ejecutarse con llama.cpp en CPU, puede emplearse para generar respuestas o clasificaciones de texto en entornos sin GPU dedicada.
- Base para fine-tuning ligero: al estar bajo Apache 2.0, sirve como punto de partida para adaptaciones con LoRA/QLoRA sobre dominios específicos en inglés.
- Evaluación comparativa de cuantizaciones: útil para medir latencia y throughput de cada nivel de bits en hardware concreto antes de fijar una configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB en Q4_K, 5-6 GB en Q6_K y 8-9 GB en Q8_0 para un modelo de 7B (estimación orientativa según el número de parámetros y los bits por peso; no confirmada en la información proporcionada).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para los niveles de cuantización más altos y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para cuantizaciones de 4-6 bits; las cuantizaciones de 2-3 bits pueden ejecutarse en GPUs de 4-6 GB o incluso en CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), text-generation-webui, KoboldCpp, LM Studio, LoLLMS Web UI, Faraday.dev, ctransformers, llama-cpp-python y candle.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Dolphin 2.2.1 Mistral 7B (este repo, GGUF) | 7,24 B | no disponible | Apache 2.0 | GGUF | Repositorio con 0 descargas |
| dolphin-2.2.1-mistral-7B (original, ehartford) | 7,24 B | no disponible | Apache 2.0 | safetensors/PyTorch | Disponible en Hugging Face |
| dolphin-2.2.1-mistral-7B-GGUF (TheBloke) | 7,24 B | no disponible | Apache 2.0 | GGUF | Disponible en Hugging Face |
| dolphin-2.2.1-mistral-7B-GPTQ (TheBloke) | 7,24 B | no disponible | Apache 2.0 | GPTQ | Disponible en Hugging Face |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo entrenado y evaluado principalmente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje de 7B, especialmente en tareas de conocimiento factual.
- No se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los datasets de entrenamiento originales.
- El repositorio no presenta descargas ni interacciones, y su relación exacta con las cuantizaciones de TheBloke no está verificada más allá de la model card heredada.
- La fecha de creación indicada (2026-11-01) resulta anómala y conviene tratarla con cautela.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que requieran function calling nativo.
- La longitud de contexto no se especifica en la información disponible; debe consultarse la configuración del modelo base antes de usarlo en tareas de contexto largo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/misfitandmisfit/dolphin-2.2.1-mistral-7B-GGUF
- Modelo original: https://huggingface.co/ehartford/dolphin-2.2.1-mistral-7b
- Cuantizaciones GGUF de TheBloke: https://huggingface.co/TheBloke/dolphin-2.2.1-mistral-7B-GGUF
- Cuantizaciones AWQ de TheBloke: https://huggingface.co/TheBloke/dolphin-2.2.1-mistral-7B-AWQ
- Cuantizaciones GPTQ de TheBloke: https://huggingface.co/TheBloke/dolphin-2.2.1-mistral-7B-GPTQ
- llama.cpp: https://github.com/ggerganov/llama.cpp
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- KoboldCpp: https://github.com/LostRuins/koboldcpp
- LM Studio: https://lmstudio.ai/
- LoLLMS Web UI: https://github.com/ParisNeo/lollms-webui
- Faraday.dev: https://faraday.dev/
- ctransformers: https://github.com/marella/ctransformers
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- candle: https://github.com/huggingface/candle
