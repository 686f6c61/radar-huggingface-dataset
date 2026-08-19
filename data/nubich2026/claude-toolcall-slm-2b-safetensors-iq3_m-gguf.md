# nubich2026/claude-toolcall-slm-2B-safetensors-IQ3_M-GGUF

## Resumen

`nubich2026/claude-toolcall-slm-2B-safetensors-IQ3_M-GGUF` es una conversión al formato GGUF del modelo `mondk/claude-toolcall-slm-2B-safetensors`, realizada mediante la herramienta `gguf-my-repo` de llama.cpp. El nombre sugiere que se trata de un pequeño modelo de lenguaje (SLM, por sus siglas en inglés) de aproximadamente 1.700 millones de parámetros, orientado a la llamada a herramientas (tool calling) y con un estilo conversacional, posiblemente destilado o inspirado en la familia Claude. El repositorio contiene un único archivo GGUF cuantizado con el esquema `IQ3_M` e `imatrix`, lo que lo hace adecuado para su ejecución en entornos con recursos limitados mediante llama.cpp u otros runners compatibles.

La relevancia de este modelo radica en su tamaño reducido y su formato GGUF, que permite desplegarlo en CPU, portátiles o GPUs de gama baja sin necesidad de infraestructura especializada. Al estar licenciado bajo Apache 2.0, su uso comercial es libre, y su naturaleza de "toolcall" lo convierte en un candidato interesante para prototipos de agentes conversacionales que necesiten invocar funciones externas. No obstante, al tratarse de una conversión comunitaria, la información técnica detallada sobre el modelo original es limitada y se remite a la ficha del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.711.378.432 (~1,71 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_M (con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo único `.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo original. Por el nombre y los datasets asociados en la model card (`mondk/claude-code-fable-5-traces.jsonl`, `HuggingFaceTB/smollm-corpus`, `bigcode/the-stack`, `HuggingFaceTB/smoltalk`, `openbmb/UltraFeedback`), es plausible que se trate de un transformer decoder-only entrenado o afinado para tareas de tool calling y dialogo, posiblemente sobre una base tipo SmolLM. Sin embargo, esta es una inferencia no confirmada. El proceso de conversion a GGUF no altera la arquitectura, solo reempaqueta los pesos. No hay datos sobre el numero de tokens de entrenamiento, el uso de RLHF/DPO o innovaciones tecnicas especificas.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational`, por lo que puede mantener dialogos multi-turno.
- Tool calling / function calling: el nombre del modelo (`toolcall`) y el dataset `claude-code-fable-5-traces` sugieren que fue entrenado para invocar herramientas externas, aunque no se especifica el formato exacto (p. ej., JSON o sintaxis de funciones).
- Multilingue: solo se indica ingles (`language: en`).
- Otras capacidades (vision, audio, thinking mode) no estan documentadas.

## Casos de uso

- Asistentes conversacionales ligeros: al ser un modelo de ~1,7 B y cuantizado a IQ3_M, puede ejecutarse en un portatil o en un servidor modesto para prototipos de chatbots que necesiten respuestas rapidas sin depender de la nube.
- Automatizacion de tareas con llamadas a API: su supuesta capacidad de tool calling permite integrarlo en pipelines que ejecuten funciones externas (consultas a bases de datos, envio de correos, etc.) con un coste computacional minimo.
- Educacion e investigacion: sirve como ejemplo de conversion GGUF y de despliegue local, util para estudiantes o investigadores que quieran experimentar con modelos pequeños.
- Desarrollo de agentes en entornos con restricciones de hardware: por su tamaño, cabe en Raspberry Pi o en contenedores con menos de 1 GB de RAM, ideal para pruebas de concepto en IoT o edge computing.
- Generacion de codigo asistida: el dataset `the-stack` sugiere que el modelo base pudo ser entrenado con codigo, por lo que podria ofrecer sugerencias simples en editores o entornos de desarrollo.
- Filtrado y clasificacion de texto: aunque no es su proposito principal, un modelo conversacional pequeno puede adaptarse para tareas de clasificacion o extraccion de entidades con un afinamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se ofrecen comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de ~1,71 B parametros cuantizado a IQ3_M (aproximadamente 3 bits por peso), el archivo pesa 0,8 GB. La VRAM necesaria para inferencia ronda 1-1,5 GB, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050) o incluso integradas modernas. Tambien funciona en CPU pura con llama.cpp.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, llama-cpp-python, y cualquier runner compatible con GGUF (p. ej., LM Studio, text-generation-webui).
- Latencia y throughput: no hay datos oficiales. En una CPU moderna (8 nucleos) se pueden esperar entre 5 y 15 tokens por segundo; en una GPU como la RTX 3060, entre 30 y 60 tokens por segundo, estimaciones orientativas basadas en modelos de tamano similar.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo pertenece a una categoria especifica (SLM para tool calling) de la que no se conocen alternativas publicas con datos de rendimiento. Se podria comparar con SmolLM2-1.7B o Qwen2.5-1.5B-Instruct, pero no hay metricas que permitan una evaluacion objetiva. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeno entrenado con datasets variados (incluido `the-stack`), puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Limitaciones de idioma: solo se garantiza ingles; el rendimiento en otros idiomas es incierto.
- Contexto limitado: no se especifica la longitud de contexto, pero los modelos de 2B suelen manejar ventanas de 2048-4096 tokens; es probable que no soporte contextos muy largos.
- Calidad de la conversion: al ser una conversion comunitaria, no se ha verificado la integridad de los pesos ni la ausencia de errores en el proceso de cuantizacion.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar la licencia del modelo original (`mondk/claude-toolcall-slm-2B-safetensors`) por si tuviera clausulas adicionales.
- Produccion: no hay garantias de soporte ni mantenimiento; el modelo tiene 0 descargas y 0 likes, lo que indica que es un proyecto muy reciente y sin comunidad activa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nubich2026/claude-toolcall-slm-2B-safetensors-IQ3_M-GGUF
- Modelo base: https://huggingface.co/mondk/claude-toolcall-slm-2B-safetensors
- Herramienta de conversion (gguf-my-repo): https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Proyecto llama.cpp: https://github.com/ggerganov/llama.cpp
