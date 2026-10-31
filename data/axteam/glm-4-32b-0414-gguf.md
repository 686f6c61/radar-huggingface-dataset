# axteam/GLM-4-32B-0414-GGUF

## Resumen

GLM-4-32B-0414-GGUF es una cuantización en formato GGUF del modelo GLM-4-32B-0414, un modelo de lenguaje denso de 32.566.081.536 parámetros (32,5B) desarrollado por Z.ai (zai-org). El repositorio, publicado por el usuario axteam, ofrece conversiones a GGUF realizadas con el script oficial `convert_hf_to_gguf.py` de llama.cpp, listas para ejecutarse en llama.cpp, Ollama y LM Studio. El modelo base pertenece a la serie GLM-4-0414 de Z.ai, orientada a generación de texto conversacional y razonamiento.

La relevancia de esta ficha radica en la accesibilidad: la versión GGUF permite ejecutar un modelo de 32B bajo licencia MIT en hardware de consumo o en servidores modestos, con cuantizaciones desde 12,3 GB (Q2_K) hasta 34,6 GB (Q8_0). El `chat_template` original está incrustado en cada archivo, lo que garantiza compatibilidad con el formato de conversación del modelo original. Es una opción interesante para despliegues locales donde se necesita un modelo de gama media-alta con licencia permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (GLM-4); detalles adicionales no disponibles |
| Parametros totales | 32.566.081.536 (32,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens en los ejemplos del README (la del modelo base, no disponible en la información proporcionada) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (k-quants de llama.cpp, PTQ sin reentrenamiento) |
| Idiomas soportados | No disponible (el modelo base es bilingüe chino/inglés; el README incluye un ejemplo en coreano) |
| Licencia | MIT |
| Formato de pesos | GGUF (derivado de pesos BF16 en safetensors del modelo base) |

## Arquitectura y entrenamiento

El modelo base, GLM-4-32B-0414 de Z.ai, es un transformer denso de 32,5B parámetros (no MoE), entrenado por Z.ai como parte de la serie GLM-4-0414. Los detalles concretos de arquitectura (número de capas, cabezas de atención, GQA, vocabulario) y de entrenamiento (tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada y deben consultarse en la ficha del modelo original.

En cuanto a la cuantización, este repositorio aplica post-training quantization (PTQ) con llama.cpp: los pesos BF16 originales se cuantizan por bloques mediante k-quants (escalas por bloque con asignación mixta de bits), sin ningún reentrenamiento ni calibración adicional. Cada archivo GGUF incrusta el `chat_template` original del modelo, de modo que llama.cpp puede aplicar el formato de conversación correcto con la opción `--jinja`. El repositorio pesa 132,3 GB en total por la suma de las seis cuantizaciones disponibles.

## Capacidades

- Generacion de texto conversacional: pipeline de text-generation con plantilla de chat conversacional incrustada.
- Razonamiento y codigo: la serie GLM-4-32B-0414 de Z.ai está orientada a tareas generales, razonamiento y programacion (según la documentacion del modelo base; detalles concretos no disponibles en esta ficha).
- Compatibilidad con servidores OpenAI-compatible via `llama-server`, lo que facilita la integracion con clientes y herramientas estandar.
- Soporte de tool calling: no disponible en la informacion proporcionada (depende del chat template del modelo base).
- Capacidades multilingues: el modelo base es bilingue chino/ingles; el README muestra un ejemplo en coreano, aunque el alcance exacto de idiomas no esta documentado aqui.
- No hay indicios de capacidades de vision, audio ni thinking mode en este repositorio.

## Casos de uso

- Chatbots locales de codigo abierto: gracias a la cuantizacion Q4_K_M (19,7 GB) cabe en una GPU de consumo con 24 GB de VRAM, permitiendo asistentes conversacionales autoalojados sin depender de APIs externas.
- Servidor de inferencia OpenAI-compatible: `llama-server` expone un endpoint `/v1/chat/completions`, ideal para integrar el modelo en aplicaciones existentes que ya hablan el protocolo de OpenAI.
- Prototipado con Ollama y LM Studio: descarga y ejecucion con un solo comando (`ollama run hf.co/axteam/GLM-4-32B-0414-GGUF:Q4_K_M`), util para explorar el modelo antes de un despliegue mayor.
- Despliegues con memoria ajustada: la variante Q2_K (12,3 GB) permite ejecutar el modelo en GPUs de 16 GB o incluso en configuraciones CPU/GPU hibridas, con degradacion de calidad asumible.
- Escenarios de maxima fidelidad: Q8_0 (34,6 GB) ofrece resultados practicamente identicos a los pesos originales para evaluaciones offline o destilacion de datos.
- Optimizacion de memoria de KV-cache: con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` se reduce la memoria del contexto, util para conversaciones largas multi-turno o atencion al cliente automatizada con contexto extendido.
- Procesamiento por lotes en servidores propios: la licencia MIT permite uso comercial sin restricciones, apto para pipelines de generacion de contenido o resumen documental en infraestructura privada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para datos de rendimiento (MMLU, HumanEval, GSM8K, etc.) del modelo base, consultar la ficha de `zai-org/GLM-4-32B-0414`.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV-cache):
  - Q2_K: ~12,3 GB
  - Q3_K_M: ~15,9 GB
  - Q4_K_M: ~19,7 GB
  - Q5_K_M: ~23,1 GB
  - Q6_K: ~26,7 GB
  - Q8_0: ~34,6 GB
- GPU recomendadas:
  - Q4_K_M y Q5_K_M: RTX 3090 o RTX 4090 (24 GB) para ejecucion completa en GPU.
  - Q6_K y Q8_0: A100 40 GB, A100 80 GB o H100; alternativamente offload parcial a CPU RAM con `-ngl`.
  - Q2_K y Q3_K_M: RTX 4080/4090 o GPUs de 16 GB con offload parcial.
- Consumer GPUs: Q4_K_M cabe integramente en una RTX 4090 (24 GB); Q2_K y Q3_K_M pueden ejecutarse incluso en GPUs de 16 GB con parte de las capas en CPU.
- Opciones de despliegue: llama.cpp (`llama-server` / `llama-cli`), Ollama y LM Studio. No se menciona soporte para vLLM ni TGI (GGUF no es su formato nativo).
- Latencia y throughput: no disponibles; llama.cpp con offload completo a GPU ofrece tipicamente decenas de tokens/s en un modelo de 32B cuantizado, pero no hay mediciones publicadas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion GGUF | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-4-32B-0414-GGUF (este) | 32,5B (denso) | Q2_K a Q8_0 | No disponible en esta ficha | MIT | llama.cpp, Ollama, LM Studio |
| Qwen2.5-32B-Instruct-GGUF | 32,5B (denso) | Amplia gama de quants | 128K | Qwen license (uso comercial condicionado) | llama.cpp, Ollama, LM Studio |
| QwQ-32B-GGUF | 32,5B (denso, razonamiento) | Amplia gama de quants | 128K | Apache 2.0 | llama.cpp, Ollama, LM Studio |
| Gemma 3 27B IT GGUF | 27B (denso) | Amplia gama de quants | 128K | Gemma license (restricciones) | llama.cpp, Ollama, LM Studio |

GLM-4-32B-0414 destaca frente a Qwen2.5-32B por su licencia MIT sin condiciones de marca, y frente a Gemma 3 27B por ser menos restrictivo; QwQ-32B es la alternativa si se prioriza razonamiento extendido sobre uso general.

## Limitaciones y advertencias

- La cuantizacion es PTQ sin reentrenamiento: Q2_K y Q3_K_M sufren perdida de calidad perceptible segun el propio README; usar Q4_K_M o superior para produccion.
- Sesgos conocidos: no documentados en este repositorio; hereda los del modelo base GLM-4-32B-0414 de Z.ai.
- Riesgo de alucinacion: inherente a cualquier LLM; no hay mitigaciones documentadas en la model card.
- Idiomas: el modelo base esta orientado a chino e ingles; el rendimiento en castellano no esta documentado en la informacion disponible y conviene evaluarlo antes de uso en produccion.
- Licencia MIT: sin restricciones de uso comercial, pero los pesos y el tokenizador originales pertenecen a Z.ai / zai-org.
- El repositorio tiene muy poca traccion (143 descargas y 1 like), por lo que carece de validacion comunitaria amplia; considerar tambien las cuantizaciones oficiales si existen.
- Contexto por defecto de 8192 tokens en los ejemplos; verificar la ventana maxima soportada por el modelo base antes de asumir contextos largos.
- La cuantizacion del KV-cache (`--cache-type-k/v q8_0`) es opcional y puede degradar ligeramente la calidad en contextos muy largos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/GLM-4-32B-0414-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4-32B-0414
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado enlaces adicionales (papers, blogs o demos) en la informacion disponible.
