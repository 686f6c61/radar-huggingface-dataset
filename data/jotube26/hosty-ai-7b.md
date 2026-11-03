# jotube26/hosty-ai-7b

## Resumen

hosty-ai-7b es un modelo de lenguaje conversacional de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) publicado por el usuario jotube26 en HuggingFace. Se trata de un fine-tuning del modelo base Qwen2.5-Coder-7B-Instruct, segun se desprende del nombre del archivo de pesos incluido (`Qwen2.5-Coder-7B-Instruct.Q4_K_M.gguf`), y ha sido convertido a formato GGUF mediante la libreria Unsloth para su uso con llama.cpp y Ollama.

El modelo se distribuye unicamente en cuantizacion Q4_K_M dentro de un repositorio de 4,7 GB, e incluye un Modelfile de Ollama para facilitar el despliegue. La model card es extremadamente escueta: no documenta el dataset de fine-tuning, el numero de tokens de entrenamiento, la licencia, los idiomas soportados ni resultados de evaluacion. La fecha de creacion indicada (2026-11-03) resulta anomala y podria deberse a un error en los metadatos del repositorio.

Por su origen (fine-tuning de Qwen2.5-Coder-7B-Instruct) cabe esperar un modelo orientado a generacion de codigo y conversacion, con una ventana de contexto heredada del modelo base, aunque el autor no confirma ninguno de estos extremos. La relevancia practica es limitada: el repositorio no tiene descargas ni likes, carece de licencia explicita y no aporta informacion tecnica verificable, por lo que debe tratarse con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct; no confirmada por el autor) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5 soporta 32.768 tokens nativos, ampliable; no confirmado en este fine-tuning) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors solo como referencia de conteo de parametros) |

## Arquitectura y entrenamiento

El autor no documenta la arquitectura de forma explicita. Por el nombre del archivo de pesos (`Qwen2.5-Coder-7B-Instruct.Q4_K_M.gguf`) y la etiqueta `qwen2`, el modelo es un fine-tuning de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7,6 mil millones de parametros con atencion por grupos (GQA) y RoPE, propio de la familia Qwen2.5. La conversion a GGUF se realizo con Unsloth, que el autor menciona como herramienta de entrenamiento y conversion.

No hay informacion sobre el dataset de fine-tuning, el numero de tokens utilizados, la composicion de los datos, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se detalla ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). La unica informacion operativa es que el modelo se ha empaquetado para llama.cpp y Ollama, con soporte de plantilla de chat via `--jinja`.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta `conversational` del repositorio.
- Generacion y asistencia en codigo, heredada del modelo base Qwen2.5-Coder-7B-Instruct (no verificado por el autor).
- Soporte de plantilla de chat Jinja para llama.cpp (`--jinja`).
- Despliegue en Ollama mediante Modelfile incluido.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de tool calling y function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no documentado).
- Capacidades especiales (modo thinking, vision, audio): no disponible; la model card menciona `llama-mtmd-cli` para modelos multimodales como ejemplo generico, pero no confirma que este modelo lo sea.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse en Ollama o llama.cpp en una maquina de sobremesa con GPU consumer y mantener conversaciones multi-turno, aunque la ventana de contexto efectiva no esta documentada.
- Autocompletado y generacion de codigo en IDE: al derivar de Qwen2.5-Coder-7B-Instruct, es plausible su uso como asistente de codigo en local, con la salvedad de que el fine-tuning puede haber alterado sus capacidades originales.
- Prototipado rapido de chatbots: la cuantizacion Q4_K_M y el Modelfile de Ollama permiten levantar un endpoint conversacional en minutos sin infraestructura dedicada.
- Pruebas de concepto de agentes: si el modelo base conserva su soporte de tool calling (no confirmado), podria integrarse en flujos de llamada a funciones, aunque requeriria validacion previa.
- Educacion y experimentacion: util para estudiar el proceso de fine-tuning y conversion a GGUF con Unsloth en un caso real, dado que el repositorio es publico.
- Despliegue en entornos con recursos limitados: el archivo Q4_K_M de 4,7 GB cabe en GPUs de 8 GB de VRAM, lo que permite inferencia en hardware de gama media.
- Generacion de documentacion tecnica: como modelo derivado de un coder, puede redactar docstrings y comentarios de codigo, sujeto a evaluacion previa por la falta de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con la cuantizacion Q4_K_M (4,7 GB de pesos mas overhead de contexto y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090; en datacenter, A100 o H100 sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: llama.cpp (`llama-cli -hf jotube26/hosty-ai-7b --jinja`), Ollama (Modelfile incluido), y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles (no publicados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| hosty-ai-7b | 7,6 B | no disponible | no disponible | GGUF (Q4_K_M) | HuggingFace, 0 descargas |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 tokens (nativo) | Apache 2.0 (modelo base) | safetensors, GGUF | HuggingFace, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | HuggingFace, ampliamente usado |
| Llama-3.1-8B-Instruct | 8,0 B | 131.072 tokens | Llama 3.1 Community License | safetensors, GGUF | HuggingFace, ampliamente usado |

La comparativa se limita a parametros y disponibilidad: no hay datos de rendimiento del modelo evaluado que permitan contrastar calidad. Frente a sus alternativas, hosty-ai-7b carece de licencia explicita, documentacion tecnica y benchmarks, lo que reduce su atractivo para produccion.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifica si el uso comercial esta permitido, lo que impide su adopcion legal en produccion sin contactar con el autor.
- Sin documentacion de entrenamiento: se desconoce el dataset, los tokens vistos y si hubo alineacion, lo que impide evaluar sesgos y calidad.
- Riesgo de alucinacion: inherente a los modelos de 7 B, agravado por la falta de evaluacion publicada.
- Idiomas no documentados: no se puede garantizar un rendimiento aceptable fuera del ingles o el chino, idiomas tipicos del modelo base.
- Contexto no confirmado: aunque Qwen2.5 soporta 32.768 tokens, el fine-tuning pudo reducirlo o degradarlo; no hay verificacion.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues ni discusiones que permitan validar su funcionamiento.
- Fecha de creacion anomala (2026-11-03): sugiere metadatos incorrectos o manipulados, lo que resta fiabilidad al conjunto.
- Un solo archivo de cuantizacion (Q4_K_M): no hay opciones de mayor o menor precision para ajustar calidad o VRAM.
- Posible perdida de capacidades del modelo base: el fine-tuning con Unsloth puede haber alterado el soporte de tool calling o el rendimiento en codigo original.

## Enlaces

- HuggingFace: https://huggingface.co/jotube26/hosty-ai-7b
- Unsloth (herramienta de entrenamiento y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue con Modelfile): https://ollama.com
- Modelo base de referencia (Qwen2.5-Coder-7B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
