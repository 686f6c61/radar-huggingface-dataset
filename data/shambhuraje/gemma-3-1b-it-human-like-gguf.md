# shambhuraje/gemma-3-1b-it-human-like-GGUF

## Resumen

`shambhuraje/gemma-3-1b-it-human-like-GGUF` es un ajuste fino del modelo `google/gemma-3-1b-it` de Google, orientado a producir conversaciones con un tono mas natural, cercano y coloquial que el asistente base. El autor, Shambhuraje Jagadale, lo entrena con QLoRA de 4 bits sobre el split `chosen` del dataset `HumanLLMs/Human-Like-DPO-Dataset` y exporta el resultado a formato GGUF cuantizado en Q4_K_M, con un peso de 806 MB. El objetivo declarado es eliminar el registro de "manual de instrucciones" tipico de los asistentes pequenos y acercar las respuestas al habla cotidiana.

El modelo conserva la arquitectura y el tamano del Gemma 3 1B instruct original (999.885.952 parametros reales en safetensors, aproximadamente 1,0 mil millones), por lo que hereda sus limitaciones de capacidad: es un modelo de lenguaje pequeno, solo texto y solo en ingles segun la model card. Su interes practico esta en el nicho: permite ejecutar un chatbot conversacional en hardware muy modesto (el autor lo entreno en una RTX 2050 Mobile de 4 GB de VRAM) y sirve como ejemplo reproducible de flujo Unsloth + GGUF + llama.cpp.

Es relevante ahora por dos motivos. Primero, demuestra que el ajuste de estilo se puede hacer con recursos minimos y publicar como GGUF listo para Ollama o LM Studio. Segundo, porque el ecosistema de modelos pequenos conversacionales crece y este tipo de adaptaciones son utiles para prototipos de compania y asistentes locales sin dependencia de la nube. No obstante, es un ajuste de estilo sin evaluacion publica de benchmarks, por lo que no debe confundirse con una mejora general de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3, `gemma3_text`) |
| Parametros totales | 999.885.952 (aprox. 1,0 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens en entrenamiento; el modelo base Gemma 3 1B soporta ventanas mayores, pero no se especifica en la ficha la maxima efectiva de esta adaptacion |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Gemma Terms of Use (`gemma`) |
| Formato de pesos | GGUF (pesos base en safetensors en el modelo original de Google) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-1b-it`, un transformer decoder-only de aproximadamente 1,0 mil millones de parametros de la familia Gemma 3. Sobre esa base se aplica un ajuste supervisado (SFT) con QLoRA de 4 bits usando Unsloth. El dataset es `HumanLLMs/Human-Like-DPO-Dataset`, del que solo se utiliza la columna `chosen` (respuestas etiquetadas como mas humanas); la columna `rejected` se descarta, de modo que no hay fase DPO real pese al nombre del dataset. La configuracion reportada es: contexto de 1.024 tokens, learning rate 1e-4, batch efectivo de 8 (2 x 4 de acumulacion), 100 pasos de entrenamiento y una unica GPU RTX 2050 Mobile de 4 GB.

No se documenta el numero total de tokens vistos, la composicion exacta del dataset ni si hubo etapas adicionales de alineamiento tras el SFT. Tampoco se indican innovaciones tecnicas propias: el interes esta en el pipeline (Unsloth para entrenamiento y exportacion a GGUF) y en la cuantizacion Q4_K_M, que reduce el peso a 806 MB y permite inferencia en CPU y GPU de gama baja. La ventana de contexto de entrenamiento de 1.024 tokens es corta y condiciona el uso en conversaciones largas.

## Capacidades

- Generacion de texto conversacional en ingles con tono calido, informal y con uso frecuente de emojis.
- Chat multi-turno de alcance corto (contexto de entrenamiento de 1.024 tokens).
- Estilo "humano" orientado a compania y conversacion casual, segun el dataset de ajuste.
- Capacidades residuales del base Gemma 3 1B (razonamiento basico, matematicas simples, codigo elemental), aunque el autor advierte que el ajuste de estilo puede degradarlas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- Multilingue: no, solo ingles segun la model card.

## Casos de uso

- Prototipos de asistente conversacional local: el modelo se ejecuta en un portatil con 4 GB de VRAM o incluso en CPU gracias a sus 806 MB en Q4_K_M, lo que permite validar experiencias de chat sin infraestructura cloud.
- Companero de conversacion en aplicaciones de ocio: su tono cercano y su uso de emojis encajan en apps de chat casual, siempre que se acepte su limitado contexto de 1.024 tokens.
- Demostracion educativa de fine-tuning: sirve como caso reproducible de QLoRA con Unsloth + exportacion GGUF + despliegue en Ollama o LM Studio para cursos y talleres.
- Pruebas de integracion con llama.cpp y llama-cpp-python: el autor incluye ejemplos de `create_chat_completion`, util para validar pipelines de inferencia antes de pasar a modelos mayores.
- Chatbot de escaparate o demo en ferias y webs: al ser pequeno y rapido en hardware modesto, permite desplegar una demo interactiva de bajo coste con respuestas de estilo natural.
- Generacion de respuestas de relleno en prototipos de UI: para maquetar interfaces de chat con texto plausible sin depender de APIs externas.
- Base para nuevos ajustes de estilo: al estar en GGUF y derivar de Gemma 3 1B, puede servir de punto de partida para experimentos de personalidad en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no ha sido evaluado en benchmarks" y que el entrenamiento fue corto (100 pasos), por lo que no existen cifras de MMLU, HumanEval, GSM8K ni metricas de calidad conversacional comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con Q4_K_M (806 MB de pesos mas overhead de contexto y KV cache); el autor lo describe como apto para GPU de 4 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas (RTX 2050 Mobile, GTX 1650, RTX 3050, etc.); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: Ollama (`ollama run hf.co/shambhuraje/gemma-3-1b-it-human-like-GGUF:Q4_K_M`), llama.cpp (`llama-cli -hf ... --jinja`), LM Studio y llama-cpp-python.
- Latencia y throughput: no disponibles. Por el tamano (1B en Q4_K_M) se espera una generacion fluida en CPU moderna y muy rapida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| shambhuraje/gemma-3-1b-it-human-like-GGUF | ~1,0 B | 1.024 en entrenamiento | Ingles | Gemma Terms of Use | GGUF Q4_K_M | Ajuste de estilo conversacional, sin benchmarks publicados |
| google/gemma-3-1b-it | ~1,0 B | Mayor que la adaptacion (consultar ficha oficial) | Multilingue | Gemma Terms of Use | Safetensors, GGUF (comunidad) | Modelo base instruct, mas capable en tareas generales |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Multilingue | Apache 2.0 | Safetensors, GGUF | Alternativa mayor con contexto mucho mas amplio y licencia permisiva |
| Llama 3.2 1B Instruct | ~1,2 B | 128.000 tokens | Multilingue | Llama 3.2 Community License | Safetensors, GGUF | Contexto largo y ecosistema amplio; licencia con restricciones |

La comparativa se basa en caracteristicas publicas de los modelos alternativos; no hay datos de rendimiento del modelo evaluado que permitan comparaciones cuantitativas.

## Limitaciones y advertencias

- Solo ingles: la model card declara unicamente `en`; el rendimiento en castellano no esta validado y probablemente sea deficiente.
- Contexto corto: el entrenamiento uso 1.024 tokens, lo que limita conversaciones largas y el uso de documentos extensos.
- Riesgo de alucinacion alto: con 1B de parametros y un ajuste de estilo, el modelo puede inventar hechos y ser repetitivo o inconsistente; el autor recomienda no usarlo para datos factuales.
- Degradacion de capacidades: el ajuste prioriza el tono sobre matematicas, codigo y razonamiento, que pueden ser peores que en el base Gemma 3 1B.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al derivar de Gemma 3 y de un dataset conversacional, puede heredar sesgos del base y del corpus de ajuste.
- Uso comercial: sujeto a los Gemma Terms of Use de Google, que imponen obligaciones y restricciones adicionales a la licencia del ajuste.
- Sin benchmarks: no hay evidencia cuantitativa de calidad; cualquier despliegue en produccion requeriria evaluacion propia.
- Estilo con emojis: puede no ser adecuado para contextos formales sin un system prompt que lo restrinja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shambhuraje/gemma-3-1b-it-human-like-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset de ajuste: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Organizacion HumanLLMs: https://huggingface.co/HumanLLMs
- Unsloth (entrenamiento y exportacion GGUF): https://github.com/unslothai/unsloth
- llama.cpp (inferencia): https://github.com/ggml-org/llama.cpp
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/shambhuraje
