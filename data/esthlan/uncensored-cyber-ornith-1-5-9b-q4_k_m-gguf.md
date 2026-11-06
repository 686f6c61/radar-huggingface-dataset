# Esthlan/Uncensored-Cyber-Ornith-1.5-9B-Q4_K_M-GGUF

## Resumen

Esthlan/Uncensored-Cyber-Ornith-1.5-9B-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo 0xSojalSec/Uncensored-Cyber-Ornith-1.5-9B, un ajuste fino orientado a ciberseguridad, uso agentico en terminal y razonamiento con soporte de function calling. El modelo original parte de una base de la familia Qwen 3.5 (segun la etiqueta `qwen3_5` de la model card) y ha sido entrenado mediante QLoRA con la libreria Unsloth sobre un conjunto de datasets especializados en seguridad, comandos de shell, conversaciones agenticas y function calling.

El repositorio contiene unicamente los pesos cuantizados en Q4_K_M (5,6 GB), generados con el espacio GGUF-my-repo de ggml.ai a partir de los pesos originales. El modelo cuenta con 8.953.803.264 parametros (aproximadamente 9B) y esta pensado para ejecutarse en llama.cpp, tanto en CLI como en servidor, lo que facilita su despliegue en hardware de consumo.

La relevancia de esta ficha radica en que se trata de un modelo de nicho: un ajuste "uncensored" especializado en tareas ofensivas y defensivas de ciberseguridad, con capacidad de emitir comandos de terminal y de encadenar llamadas a herramientas. Su licencia Apache 2.0 y su formato GGUF lo hacen accesible para experimentacion local, aunque su naturaleza sin filtros exige precauciones importantes en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun etiqueta de la model card); detalles no disponibles |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado en este repo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `uncensored-cyber-ornith-1.5-9b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es 0xSojalSec/Uncensored-Cyber-Ornith-1.5-9B, construido sobre una arquitectura de la familia Qwen 3.5 (etiqueta `qwen3_5`). El ajuste fino se realizo con QLoRA utilizando Unsloth, segun las etiquetas `qlora` y `unsloth` de la model card. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

Los datasets declarados en la model card son: oi-uae/cyber-security, hotdogs/uka-cyber-dataset, trend-cybertron/Primus-Reasoning, Lite-Coder/LiteCoder-Terminal-SFT, rajistics/openhands-synthetic-conversations, emirkaanozdemr/bash_command_data_6K, NousResearch/hermes-function-calling-v1 y open-thoughts/OpenThoughts3-1.2M. Esta combinacion sugiere un entrenamiento orientado a conocimientos de ciberseguridad, generacion de comandos bash, conversaciones multi-turno de agentes, function calling y razonamiento general. No se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento general, con enfasis en dominios de ciberseguridad.
- Generacion y explicacion de comandos de terminal y bash (dataset bash_command_data_6K y LiteCoder-Terminal-SFT).
- Soporte de function calling y tool use (dataset hermes-function-calling-v1).
- Comportamiento agentico y conversaciones multi-turno orientadas a tareas (openhands-synthetic-conversations).
- Razonamiento multi-paso (Primus-Reasoning, OpenThoughts3-1.2M).
- Capacidad "uncensored": el ajuste elimina o reduce los filtros de rechazo del modelo base, segun la denominacion del autor.
- Idioma: ingles unicamente, segun el campo `language` de la model card.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito.

## Casos de uso

- Analisis de seguridad defensiva: el modelo puede resumir y clasificar hallazgos de vulnerabilidades a partir de descripciones textuales, apoyandose en los datasets de ciberseguridad con los que fue ajustado.
- Generacion de comandos de shell: util para construir asistentes de terminal que traduzcan instrucciones en lenguaje natural a comandos bash, gracias al entrenamiento especifico en bash_command_data_6K y LiteCoder-Terminal-SFT.
- Automatizacion de tareas de pentesting en laboratorio: el caracter "uncensored" permite explorar tecnicas ofensivas en entornos controlados sin los rechazos tipicos de modelos alineados, siempre con autorizacion explicita.
- Agentes de operaciones (SOC): integrado como motor de razonamiento en pipelines de triaje de alertas, con soporte de function calling para invocar APIs de SIEM o herramientas de enriquecimiento.
- Asistente de administracion de sistemas: generacion de scripts de automatizacion y explicacion de errores en consolas Linux mediante conversaciones multi-turno.
- Formacion y CTFs: creacion de escenarios, pistas y explicaciones tecnicas para entrenamiento en ciberseguridad, ejecutandose localmente en llama.cpp sin dependencia de la nube.
- Prototipado de agentes con tool use: su soporte de function calling permite construir flujos de varias etapas que consulten herramientas externas en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 5,6 GB, por lo que se necesitan aproximadamente 6-7 GB de VRAM para cargar los pesos, mas el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (Q4_K_M), y en CPU con suficiente RAM (8-10 GB libres) mediante llama.cpp.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (importando el GGUF) y cualquier runtime compatible con GGUF; no se garantiza soporte en vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Esthlan/Uncensored-Cyber-Ornith-1.5-9B-Q4_K_M-GGUF | ~9B | no disponible | Apache 2.0 | GGUF | Ajuste en ciberseguridad y agentes, solo ingles |
| 0xSojalSec/Uncensored-Cyber-Ornith-1.5-9B | ~9B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo base del que deriva esta cuantizacion |
| Qwen 3.5 9B (base de la familia) | ~9B | no disponible | no disponible | safetensors/GGUF | Modelo generalista original, con filtros de seguridad |
| Modelos de ciberseguridad de 7-9B (genericos) | 7-9B | variable | variable | variable | No se dispone de comparativa cuantitativa en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste "uncensored" elimina o reduce los filtros de rechazo, lo que incrementa el riesgo de generar contenido danino, instrucciones ofensivas o material ilegal si se usa sin supervision.
- Riesgo elevado de alucinacion en dominios tecnicos: un modelo de 9B ajustado con QLoRA puede producir comandos o explicaciones plausibles pero incorrectas; validar siempre en entornos aislados.
- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- No se documenta la longitud de contexto, por lo que no se puede asumir una ventana larga en produccion.
- Licencia Apache 2.0 permite uso comercial, pero el caracter sin filtros puede incumplir politicas de plataformas o normativas locales; el usuario asume la responsabilidad legal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Uso dual: las capacidades ofensivas deben restringirse a entornos autorizados (pentesting, CTFs, laboratorios).
- No hay benchmarks publicados que respalden las afirmaciones de calidad del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Esthlan/Uncensored-Cyber-Ornith-1.5-9B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/0xSojalSec/Uncensored-Cyber-Ornith-1.5-9B
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Dataset oi-uae/cyber-security: https://huggingface.co/datasets/oi-uae/cyber-security
- Dataset hotdogs/uka-cyber-dataset: https://huggingface.co/datasets/hotdogs/uka-cyber-dataset
- Dataset trend-cybertron/Primus-Reasoning: https://huggingface.co/datasets/trend-cybertron/Primus-Reasoning
- Dataset Lite-Coder/LiteCoder-Terminal-SFT: https://huggingface.co/datasets/Lite-Coder/LiteCoder-Terminal-SFT
- Dataset rajistics/openhands-synthetic-conversations: https://huggingface.co/datasets/rajistics/openhands-synthetic-conversations
- Dataset emirkaanozdemr/bash_command_data_6K: https://huggingface.co/datasets/emirkaanozdemr/bash_command_data_6K
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Dataset open-thoughts/OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
