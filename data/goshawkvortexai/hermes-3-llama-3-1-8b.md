# GoshawkVortexAI/Hermes-3-Llama-3.1-8B

## Resumen

Hermes-3-Llama-3.1-8B es un ajuste fino (finetune) del modelo Meta-Llama-3.1-8B desarrollado por Nous Research como parte de la familia Hermes 3. El autor del repositorio en Hugging Face es la cuenta GoshawkVortexAI, que redistribuye los pesos del modelo original de Nous Research. El modelo esta disenado como un asistente generalista con enfasis en capacidades agenticas, function calling, salida estructurada (JSON mode), roleplaying y coherencia en conversaciones multi-turno de contexto largo.

Arquitectura transformer decoder-only de 8.030.261.248 parametros (aproximadamente 8B), con una longitud de contexto entrenada de 131.072 tokens. Se distribuye bajo licencia Llama 3 y esta pensado para desarrolladores que necesitan un modelo compacto capaz de gestionar tool calling fiable y agentes multi-paso sin requerir hardware de gama alta.

La relevancia actual radica en que combina el contexto extendido de Llama 3.1 con el formato ChatML (compatible con la API de OpenAI) y un entrenamiento orientado a la alineacion con el usuario, lo que facilita su integracion en pipelines existentes y su despliegue en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (existen GGUF de terceros) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de meta-llama/Meta-Llama-3.1-8B, un transformer decoder-only con atencion por cabezas agrupadas (GQA) y contexto nativo de 131.072 tokens. Sobre esa base, Nous Research aplico un ajuste fino supervisado (SFT) orientado a instrucciones, usando un formato de prompt ChatML con roles `system`, `user` y `assistant` delimitados por los tokens especiales `<|im_start|>` y `<|im_end|>`. El entrenamiento se realizo con la herramienta Axolotl, segun las etiquetas del repositorio, e incorpora datos sinteticos y destilacion (distillation) para reforzar capacidades de razonamiento, function calling y salida estructurada.

La model card menciona mejoras respecto a Hermes 2 en capacidades agenticas, roleplaying, razonamiento, conversacion multi-turno y coherencia en contexto largo. No se especifica en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO. El informe tecnico de Hermes 3 (arXiv:2408.11857) contiene los detalles adicionales del proceso.

## Capacidades

- Generacion de texto generalista e instrucciones en formato chat.
- Razonamiento y conversacion multi-turno con coherencia en contexto largo (hasta 131.072 tokens).
- Function calling / tool calling con firmas JSON dentro de etiquetas `<tools></tools>`.
- Salida estructurada en JSON (JSON mode).
- Capacidades agenticas y razonamiento multi-paso.
- Roleplaying y control mediante system prompts (steering).
- Generacion de codigo (mejorada respecto a Hermes 2, segun la model card).
- Compatibilidad con el formato ChatML, equivalente al de la API de OpenAI.
- Capacidades multilingues limitadas: el modelo esta etiquetado unicamente para ingles (`en`).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto de hasta 131.072 tokens, lo que permite incluir historiales largos e informacion de cuenta sin truncar.
- Agentes con tool calling: su entrenamiento especifico en function calling con firmas JSON permite conectarlo a APIs externas (por ejemplo, consultas financieras, bases de datos o servicios REST) dentro de un bucle de agente.
- Generacion de codigo en produccion: puede integrarse en pipelines de CI/CD o asistentes de IDE que necesiten generar y explicar fragmentos de codigo, con salida estructurada para automatizar la validacion.
- Extraccion de datos estructurados: el JSON mode permite convertir texto libre en objetos JSON validos para ingestas en bases de datos o sistemas ETL.
- Asistentes de rol y simulacion: su entrenamiento en roleplaying y su control via system prompt lo hacen adecuado para videojuegos, entrenamiento conversacional o prototipos de personajes.
- Procesamiento de documentos largos: con 131.072 tokens de contexto puede resumir, clasificar o responder preguntas sobre contratos, informes o expedientes extensos en una sola pasada.
- Despliegue en local o edge: al ser un modelo de 8B, puede ejecutarse en GPUs de consumo y en entornos con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

La model card incluye una imagen comparativa de benchmarks frente a Llama-3.1 Instruct, pero no se proporcionan los valores numericos en la informacion disponible. El model-index del repositorio declara una entrada vacia (`results: []`).

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Resto de benchmarks | no disponible |

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, mas overhead de KV cache (que crece con el contexto; a 131.072 tokens el consumo es considerable).
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de VRAM.
- Cuantizacion a 4 bits: aproximadamente 5-6 GB de VRAM, apto para GPUs de consumo.
- GPUs recomendadas: A100 40/80 GB o H100 para contexto completo en precision nativa y alto throughput; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: si, en cuantizacion de 4 u 8 bits (por ejemplo, RTX 3060 12 GB en 4 bits con contexto reducido).
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (via GGUF de terceros, como backyardai/Hermes-3-Llama-3.1-8B-GGUF), Transformers con `apply_chat_template`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hermes-3-Llama-3.1-8B (este) | 8B | 131.072 | llama3 | Hugging Face (NousResearch y mirrors) | Finetune orientado a agentes, function calling y roleplaying |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8B | 131.072 | llama3 | Hugging Face | Modelo base instruct de Meta; referencia de comparacion en la model card |
| Hermes-3-Llama-3.1-70B | 70B | 131.072 | llama3 | Hugging Face | Version mayor de la misma familia, mayor calidad a mayor coste de hardware |
| Hermes 2 (Llama-3 8B) | 8B | 8.192 | llama3 | Hugging Face | Generacion anterior; menos capacidades agenticas y de contexto |

Los datos de rendimiento comparativo no estan disponibles de forma numerica en la informacion proporcionada; la model card afirma que Hermes 3 es competitivo o superior a Llama-3.1 Instruct en capacidades generales, con fortalezas y debilidades variables.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa, especialmente en function calling si se le piden valores no inferibles.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; los sesgos del corpus de entrenamiento de Llama 3.1 pueden persistir.
- Licencia: la Llama 3 Community License impone restricciones de uso comercial (incluida la clausula de 700 millones de usuarios mensuales) y requiere atribucion; revisar los terminos antes de produccion.
- Repositorio no oficial: este repositorio (GoshawkVortexAI) es una redistribucion; el original es NousResearch/Hermes-3-Llama-3.1-8B. Verificar integridad de los pesos antes de usarlos.
- Contexto largo: aunque soporta 131.072 tokens, el coste de KV cache y la degradacion de calidad en contextos muy extensos deben evaluarse en el caso de uso concreto.
- Formato de prompt: requiere ChatML estricto; un formato incorrecto degrada notablemente la calidad de las respuestas.
- Sin datos de benchmarks numericos publicados en este repositorio, la evaluacion de rendimiento debe realizarse de forma empirica.

## Enlaces

- Repositorio Hugging Face (este): https://huggingface.co/GoshawkVortexAI/Hermes-3-Llama-3.1-8B
- Repositorio original de Nous Research: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- GGUF de terceros (backyardai): https://huggingface.co/backyardai/Hermes-3-Llama-3.1-8B-GGUF
- Informe tecnico Hermes 3: https://arxiv.org/abs/2408.11857
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B
- Documentacion de chat templates de Transformers: https://huggingface.co/docs/transformers/main/chat_templating
