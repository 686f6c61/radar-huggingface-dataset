# fadhilahkhairogi/Liwet-400M-A188M-id-chat-GGUF

## Resumen

Liwet-400M-A188M-id-chat-GGUF es la version cuantizada en formato GGUF del modelo Liwet-400M-A188M-id-chat, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Fadhilah Akbar Khairogi, Faishal Fakhrillah y Deril Diaz (Kelompok 11, Telkom University) como proyecto de la asignatura Generative AI. El modelo cuenta con 400,1 millones de parametros totales y 187,8 millones activos por token, y esta especializado en conversacion en indonesio (idioma `id`) tras una etapa de alineacion mediante SimPO Chat.

La relevancia de esta publicacion reside en su caracter didactico y tecnico: se trata de un MoE de escala muy reducida (400M) convertido a GGUF mediante un fork especifico de llama.cpp (rama `liwet-moe`, commit `cae551692`) que implementa el dispatch y routing necesarios para esta arquitectura concreta. El autor documenta de forma exhaustiva la paridad numerica entre las implementaciones PyTorch y GGUF, advirtiendo explicitamente de que no existe bit-parity y de que la ruta de referencia sigue siendo PyTorch.

El modelo tiene una ventana de contexto de 2048 tokens, se distribuye en tres cuantizaciones (BF16, F16 y Q8_0) y no es compatible con Ollama estandar. Su tamano reducido permite inferencia en CPU con throughput aceptable, lo que lo convierte en una pieza interesante para experimentacion con arquitecturas MoE en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `moe_400m` (Mixture of Experts, transformer) |
| Parametros totales | 400.098.560 (400,1M) |
| Parametros activos | 187,8M |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | BF16, F16, Q8_0 |
| Idiomas soportados | Indonesio (`id`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE de 400,1M de parametros totales con 187,8M activos por token, etiquetada internamente como `moe_400m`. La informacion disponible no detalla el numero de expertos, la estrategia de routing (top-k), la dimension oculta ni el numero de capas. El modelo base paso por una etapa de alineacion denominada "SimPO Chat", que aplica Simple Preference Optimization sobre el modelo preentrenado para ajustar el comportamiento conversacional. No se especifican en la informacion proporcionada el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de SFT o RLHF.

La innovacion tecnica mas destacable no esta en el modelo en si, sino en el proceso de conversion: el autor utilizo un fork de llama.cpp (`ggml-org/llama.cpp`, rama `liwet-moe`, commit `cae551692`, build 11315) que incorpora el dispatch y routing especificos de esta arquitectura MoE, ya que el kernel MoE upstream de llama.cpp no es compatible. La conversion se realizo con `convert_hf_to_gguf.py --outtype bf16|f16` seguida de `llama-quantize ... Q8_0`. El autor documenta explicitamente que el resultado es numericamente aproximado y no bit-identico al modelo PyTorch original, con riesgos de inversion de experto en situaciones de near-tie del router en precision bf16.

## Capacidades

- Generacion de texto conversacional en indonesio, con modo de prompt basado en roles (`chat_role`) que emplea la plantilla `<bos>System: {system}\n\nUser: {mensaje}\n\nAssistant:`.
- Razonamiento basico y respuesta a instrucciones tras la etapa SimPO Chat.
- Conversacion multi-turno dentro de la ventana de 2048 tokens.
- Soporte de inferencia via `llama.cpp` (CLI, servidor compatible con OpenAI y binding Python `llama_cpp`).
- Capacidad de ejecucion en CPU sin PyTorch, gracias a la conversion GGUF.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Experimentacion academica con arquitecturas MoE: el modelo sirve para estudiar el comportamiento de routing y dispatch de expertos en un MoE de escala reducida, comparando la salida PyTorch (referencia) con la salida GGUF.
- Despliegue en entornos sin GPU: con Q8_0 y 8 hilos de CPU se alcanzan 99,9 tok/s en decodificacion, lo que permite servir un chatbot ligero en indonesio en hardware modesto.
- Prototipado de asistentes conversacionales en indonesio: la plantilla de roles y la etapa SimPO Chat permiten construir un asistente basico de preguntas y respuestas con contexto de hasta 2048 tokens.
- Validacion de pipelines de conversion a GGUF: el repositorio documenta metodologia de paridad (cosine de logits, divergencia greedy, exact-set del router, TVD de sampling) reutilizable para otros modelos MoE.
- Servidor compatible con OpenAI: mediante `llama-server` se puede exponer el modelo en `127.0.0.1:8080` e integrarlo en aplicaciones que ya consuman la API de OpenAI.
- Educacion y demos de inferencia local: el tamano de 491,8 MiB en Q8_0 lo hace apto para talleres, notebooks y pruebas de concepto en portatiles.
- Investigacion sobre cuantizacion de MoE: los datos de paridad publicados (P1, P2, P3, P4) permiten analizar el impacto de BF16, F16 y Q8_0 en la seleccion de expertos.

## Benchmarks y rendimiento

El autor publica resultados de rendimiento de inferencia medidos con `llama-bench` (GPU: `-ngl 99 -p 512 -n 128 -r 5`; CPU: `-ngl 0 -t 8 -p 0 -n 32`). No se publican resultados en benchmarks de calidad tipo MMLU, HumanEval o GSM8K.

Rendimiento en GPU:

| Quant | Prefill 512 (tok/s) | Decode 128 (tok/s) |
|---|---|---|
| BF16 | 7.157 ± 131 | 29,60 ± 1,32 |
| F16 | 5.651 ± 202 | 25,78 ± 0,80 |
| Q8_0 | 8.570 ± 641 | 33,62 ± 0,66 |

Rendimiento en CPU (8 hilos):

| Quant | Decode 32 (tok/s) |
|---|---|
| BF16 | 27,1 ± 11,4 |
| Q8_0 | 99,9 ± 11,9 |

El autor advierte de que las cifras de GPU son un limite inferior medido con Intel DTT activo (clock SM observado en torno a 0,8 GHz frente a un limite de 3,1 GHz).

Paridad numerica frente a la referencia PyTorch (logits bf16 CUDA, 35 prompts de prefill, 6 prompts greedy de 128 pasos, 5 prompts de sampling):

| Quant | P1 min / mean cosine | P1 top-1 | P2 mediana divergencia (norep / defrep) | P3 router | P4 max TVD |
|---|---|---|---|---|---|
| BF16 | 0,970377 / 0,995388 | 100,00% | 6 / 3,5 | 88,83% | 0,094 |
| F16 | 0,972936 / 0,995441 | 97,14% | 6 / 3,5 | 88,35% | 0,082 |
| Q8_0 | 0,968586 / 0,994333 | 94,29% | 28 / 9 | 87,88% | 0,172 |

## Requisitos de hardware

- VRAM estimada: el modelo completo en BF16/F16 ocupa 764,8 MiB de pesos; en Q8_0, 491,8 MiB. Con overhead de contexto (2048 tokens) y buffers de inferencia, cabe holgadamente en GPUs con 2 GB o mas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta mediciones en una GPU con Intel DTT activo. No se especifica el modelo exacto de GPU empleado.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo moderna (RTX 3050, RTX 4060, etc.) e incluso en iGPU con memoria unificada.
- Despliegue: `llama.cpp` (fork `liwet-moe`, commit `cae551692`), `llama-cli`, `llama-server` (API compatible con OpenAI) y binding Python `llama_cpp`. Ollama estandar no esta soportado.
- Latencia y throughput: en GPU, 33,62 tok/s de decodificacion con Q8_0 y 8.570 tok/s de prefill; en CPU con 8 hilos, 99,9 tok/s de decodificacion con Q8_0.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de calidad que permitan una comparacion rigurosa con alternativas. A continuacion se comparan caracteristicas estructurales con modelos MoE de escala reducida y con modelos densos pequenos de proposito general.

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Liwet-400M-A188M-id-chat-GGUF | 400,1M | 187,8M | 2048 | no disponible | GGUF | Solo indonesio; requiere fork de llama.cpp |
| Qwen1.5-MoE-A2.7B | 14,3B | 2,7B | 32.768 | Apache 2.0 | safetensors, GGUF | Multilingue; soporte amplio en llama.cpp |
| TinyLlama-1.1B-Chat | 1,1B | 1,1B (denso) | 2048 | Apache 2.0 | safetensors, GGUF | Ingles principalmente; ecosistema maduro |
| SmolLM-360M-Instruct | 360M | 360M (denso) | 2048 | Apache 2.0 | safetensors, GGUF | Ingles; compatible con Ollama |

La comparacion de rendimiento en benchmarks de calidad no esta disponible para el modelo Liwet en la informacion proporcionada.

## Limitaciones y advertencias

- No existe bit-parity con la implementacion PyTorch de referencia: el autor indica explicitamente que el router MoE puede invertir la eleccion de experto en situaciones de near-tie en bf16, y que el modelo GGUF debe usarse como alternativa funcional, no como sustituto identico.
- La cuantizacion Q8_0 presenta una top-1 del 94,29% y una mediana de divergencia greedy de 28 pasos (frente a 6 en BF16/F16), lo que degrada la fidelidad respecto al modelo original.
- El modelo solo soporta indonesio; no se documenta capacidad multilingue.
- La ventana de contexto es de solo 2048 tokens, insuficiente para tareas de contexto largo.
- No se especifica la licencia, lo que impide determinar si el uso comercial esta permitido; se debe contactar con el autor antes de cualquier despliegue en produccion.
- No es compatible con Ollama estandar; requiere el fork `liwet-moe` de llama.cpp (commit `cae551692`), lo que limita la portabilidad y el soporte a largo plazo.
- No se incluye `chat_template` en los metadatos GGUF: el prompt debe construirse manualmente por el llamador, con riesgo de errores de formato si no se sigue la plantilla documentada.
- No se publican evaluaciones de sesgos, alucinacion ni calidad en benchmarks estandar; el modelo es un proyecto academico sin validacion independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- El modelo base tiene solo 400M de parametros totales, por lo que su capacidad de razonamiento, codigo y matematicas es muy limitada en comparacion con modelos de mayor escala.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-chat-GGUF
- Modelo base (safetensors): https://huggingface.co/fadhilahkhairogi/Liwet-400M-A188M-id-chat
- Fork de llama.cpp utilizado: https://github.com/ggml-org/llama.cpp (rama `liwet-moe`, commit `cae551692`)
- Documentacion de metodologia de paridad: `docs/bench/RESULTS.md` (referenciada en la model card, no enlazada directamente)
