# miceworks/Mark-SLM-V2-302M

## Resumen

Mark-SLM-V2-302M es un modelo de lenguaje compacto publicado por el usuario miceworks en HuggingFace. Se presenta como una implementación a pequeña escala de la topología DeepSeek2, combinando atención con Multi-Head Latent Attention (MLA) y una arquitectura de mezcla de expertos (MoE) con 16 expertos enrutados y 1 compartido. El modelo declara 329.132.000 parámetros físicos totales, de los cuales 155.723.744 se activan por token, y una ventana de contexto de 4096 tokens.

El modelo se distribuye principalmente como un único archivo GGUF cuantizado en IQ4_NL (4 bits no lineal), de 176,84 MiB, lo que lo sitúa en el rango de modelos ejecutables en CPU y en GPUs de consumo muy modestas. La model card incluye especificaciones verificadas con GGUFReader, un manifiesto de verificación y ejemplos de despliegue con Ollama y llama.cpp, lo que sugiere un enfoque en inferencia local.

La relevancia de este modelo es limitada pero concreta: se trata de un experimento de arquitectura (MoE + MLA de DeepSeek2) a escala muy reducida, con un vocabulario ampliado de 49.152 tokens. No se han publicado datos de benchmarks, composición del dataset de entrenamiento ni detalles sobre el proceso de alineación, por lo que su evaluación rigurosa queda pendiente. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | deepseek2 (transformer con MLA y MoE) |
| Parámetros totales | 329.132.000 |
| Parámetros activos | 155.723.744 por token |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantización | IQ4_NL (4 bits no lineal, escalas FP16 cada 32 pesos; normas y sesgos en FP32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `mark_slm_v2_302m_iq4_nl.gguf`); safetensors mencionado en metadatos del repo |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `deepseek2`, que combina Multi-Head Latent Attention (MLA) con un diseño de mezcla de expertos. Los detalles declarados incluyen `hidden_size=768`, 16 capas transformer, 12 cabezas de atención, `q_lora_rank=384` y `kv_lora_rank=192`. La capa MoE contiene 16 expertos enrutados más 1 experto compartido, con 2 expertos activos por token y un tamaño intermedio de 384 por experto. El vocabulario es de 49.152 tokens.

La cuantización IQ4_NL aplica tablas enteras no lineales de 4 bits a las matrices lineales y a los tensores 3D de expertos MoE, con factores de escala FP16 cada 32 pesos, mientras que todas las normas RMSNorm y los sesgos del router se preservan en FP32. El archivo GGUF tiene 281 tensores (202 IQ4_NL y 79 F32).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones de decodificación. La model card indica únicamente el estado `TRAINED_CHECKPOINT_VALIDATED`, sin más detalles sobre el proceso de entrenamiento.

## Capacidades

- Generación de texto conversacional: la plantilla de prompt incluida (`<|bos|>User: ...<|eos|>`) y el bloque `<think>` sugieren un formato orientado a diálogo con modo de razonamiento.
- Modo thinking: la plantilla de Ollama y llama.cpp abre explícitamente una etiqueta `<think>`, lo que indica soporte para razonamiento explícito, aunque no se documenta su calidad.
- Soporte de system prompt: la plantilla distingue entre mensajes de sistema, usuario y asistente.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con APIs compatibles con OpenAI a través de llama-server.
- Capacidades multilingües: no documentadas; el vocabulario de 49.152 tokens no permite inferir cobertura idiomática.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso

- Prototipado de arquitecturas MoE en local: el modelo permite experimentar con la topología DeepSeek2 (MLA + MoE) en un único archivo de 176 MiB, ideal para validar pipelines de inferencia antes de escalar a variantes mayores.
- Inferencia en CPU y dispositivos de bajos recursos: el tamaño del GGUF IQ4_NL permite ejecutarlo en portátiles sin GPU dedicada mediante llama.cpp u Ollama, útil para demos offline.
- Servidor local compatible con OpenAI: mediante `llama-server` se puede exponer en el puerto 8080 como endpoint compatible, integrándolo en aplicaciones que ya consumen la API de OpenAI.
- Pruebas de integración de plantillas de chat: el formato `<|bos|>...<|eos|>` con bloque `<think>` sirve para validar parsers de plantillas y sistemas de razonamiento en pipelines propios.
- Educación y experimentación docente: adecuado para ilustrar el funcionamiento de MoE, MLA y cuantización IQ4_NL en cursos o talleres, dado su reducido tamaño.
- Auditoría de artefactos GGUF: el manifiesto `gguf_verification_manifest.json` y el checksum SHA-256 permiten practicar la verificación de integridad de binarios en flujos de MLOps.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF IQ4_NL ocupa 176,84 MiB; con overhead de contexto y KV cache para 4096 tokens, la huella ronda unos pocos cientos de MiB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; funciona también en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en iGPU y Raspberry Pi.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (con Modelfile incluido en la model card). No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Mark-SLM-V2-302M | 329 M | 155,7 M | 4096 | no disponible | GGUF IQ4_NL |
| SmolLM2-360M | 360 M | 360 M | 8192 | Apache 2.0 | safetensors, GGUF |
| Qwen2.5-0.5B | 494 M | 494 M | 32768 | Apache 2.0 | safetensors, GGUF |
| TinyLlama-1.1B | 1,1 B | 1,1 B | 2048 | Apache 2.0 | safetensors, GGUF |

Los modelos comparables son densos y cuentan con documentación pública de entrenamiento, benchmarks y licencia permisiva. Mark-SLM-V2-302M se distingue por su topología MoE con MLA, pero carece de datos publicados que permitan una comparación de rendimiento objetiva.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados de MMLU, HumanEval, GSM8K ni otras evaluaciones, lo que impide estimar su calidad real.
- Licencia no especificada: no se declara licencia en la model card ni en los metadatos, por lo que el uso comercial queda en un limbo legal.
- Idiomas no documentados: se desconoce la cobertura lingüística y la calidad en castellano.
- Contexto limitado a 4096 tokens: insuficiente para tareas de contexto largo o RAG con documentos extensos.
- Riesgo de alucinación: al ser un modelo de 329 M parámetros sin datos de alineación publicados, la fiabilidad factual es presumiblemente baja.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación comunitaria.
- Fecha de creación futura en los metadatos (2026-11-01): inconsistencia que conviene verificar antes de confiar en la procedencia del artefacto.
- Estado de pesos `TRAINED_CHECKPOINT_VALIDATED`: no se detalla el proceso de validación ni métricas asociadas.

## Enlaces

- HuggingFace: https://huggingface.co/miceworks/Mark-SLM-V2-302M
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
