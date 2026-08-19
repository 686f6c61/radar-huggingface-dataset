# pirola/Nemotron-3-Nano-30B-A3B-pirola-IQ2_XXS-XS-GGUF

## Resumen

El modelo `pirola/Nemotron-3-Nano-30B-A3B-pirola-IQ2_XXS-XS-GGUF` es una cuantización GGUF del modelo `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` de NVIDIA, realizada por el usuario pirola. Se trata de un modelo de lenguaje de tipo Mixture of Experts (MoE) con aproximadamente 35.400 millones de parámetros totales y unos 3.000 millones de parámetros activos por token (según la nomenclatura A3B), que incorpora una arquitectura híbrida con atención y capas SSM (State Space Model). La versión original de NVIDIA soporta una ventana de contexto de 262.144 tokens.

Esta ficha en particular es una cuantización extrema (2.4 bits por peso en los expertos) que, mediante una técnica de zero-padding en los ejes de reducción de las capas MoE, consigue reducir el modelo a 9.98 GiB y ejecutarlo con contexto completo de 256k en GPUs con 12 GB de VRAM, algo inédito para modelos de esta categoría. Es relevante porque permite ejecutar localmente un modelo de última generación con capacidades de razonamiento y coding en hardware consumer, aunque requiere un fork de llama.cpp con un parche incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (atención + SSM) con activación relu² en expertos |
| Parametros totales | 35.404.292.416 (según safetensors del modelo base) |
| Parametros activos | ~3.000 millones (por token, según nomenclatura A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_XXS (up experts), IQ2_XS (down experts), Q6_K/Q5_0/Q4_K (shared expert), Q4_K/Q5_0/F32 (attention/SSM), Q8_0 (output) |
| Idiomas soportados | en, es, fr, de, ja, it, pt, zh, ar, da, ko, nl, pl, ru, sv (15 idiomas) |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | GGUF (un único archivo de 10.717.175.296 bytes) |

## Arquitectura y entrenamiento

El modelo base `NVIDIA-Nemotron-3-Nano-30B-A3B-BF16` es un MoE con 30B parámetros totales y 3B activos, que combina mecanismos de atención tradicional con capas SSM (State Space Model) en una arquitectura híbrida. La activación de los expertos es relu², lo que permite que el zero-padding aplicado en la cuantización no altere el resultado funcional (relu²(0)=0). Los datos de entrenamiento del modelo base no se detallan en la información proporcionada, pero se sabe que soporta 15 idiomas y que incluye capacidades de razonamiento con "thinking mode" activado por defecto.

La cuantización de pirola introduce una innovación técnica: aplica zero-padding a los ejes de reducción de los tensores de los expertos (ffn_up_exps de 2688 a 2816, ffn_down_exps de 1856 a 2048, shared-expert FF de 3712 a 3840) para alinear las dimensiones a múltiplos de 256, lo que permite una cuantización más eficiente. El resultado es un archivo GGUF que requiere un fork de llama.cpp con el parche `nemotron-expert-padding.patch`, ya que el llama.cpp estándar rechaza este formato.

## Capacidades

- Generación de texto en 15 idiomas (en, es, fr, de, ja, it, pt, zh, ar, da, ko, nl, pl, ru, sv).
- Razonamiento con "thinking mode" habilitado por defecto, desactivable por petición mediante `"chat_template_kwargs": {"enable_thinking": false}`.
- Generación de código: 97.56 % pass@1 en HumanEval y 89.23 % en MBPP-sanitized (mediciones propias del autor de la cuantización).
- Soporte de tool calling y capacidades agénticas: 5/5 en una prueba de gate agéntico con thinking activado.
- Contexto largo de 262.144 tokens, útil para documentos extensos o RAG.
- Compatible con `llama-server` y el ecosistema llama.cpp (con el fork parcheado).

## Casos de uso

- Asistente de código local en GPU de 12 GB: el modelo puede completar y generar funciones en múltiples lenguajes con una calidad estadísticamente indistinguible de la versión IQ3_XXS de mayor tamaño, según las pruebas del autor. Adecuado para entornos de desarrollo sin conexión.
- Agente autónomo con tool calling: la capacidad agéntica validada (5/5 en gate) permite integrarlo en pipelines de automatización que requieran llamadas a herramientas, con una ventana de contexto de 256k para mantener el historial completo de interacciones.
- Procesamiento de documentos largos: con 262.144 tokens de contexto, puede resumir o analizar libros técnicos, contratos o bases de código completas sin necesidad de chunking.
- Chat multilingüe en producción: soporta 15 idiomas, lo que lo hace útil para aplicaciones de atención al cliente con usuarios de diversas regiones, ejecutándose en hardware local para garantizar privacidad.
- RAG (Retrieval-Augmented Generation) con contexto extenso: la ventana de 256k permite inyectar grandes volúmenes de documentos recuperados sin perder información relevante.
- Prototipado rápido de aplicaciones de IA en entornos con restricciones de presupuesto: al caber en una GPU de 12 GB, permite validar funcionalidades de un modelo de 30B sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

El autor de la cuantización publicó mediciones comparativas entre este archivo (IQ2_XXS/XS) y su versión anterior de mayor tamaño (pirola-IQ3_XXS, 13.37 GiB), ambas sobre el mismo modelo base. Los resultados se obtuvieron con un protocolo idéntico (temp 1.0 / top_p 1.0, thinking ON, cap 8192 para coding; temp 0.6 / top_p 0.95 para agentic) en una RTX 5080 con build sm_120.

| Metrica | Este archivo (IQ2_XXS/XS) | pirola-IQ3_XXS | Verdict |
|---|---|---|---|
| MBPP-sanitized (427) | 89.23 % (381/427) | 90.40 % (386/427) | McNemar p=0.383 — no significativo |
| HumanEval (164) | 97.56 % (160/164) | 94.51 % (155/164) | McNemar p=0.227 — no significativo |
| Agentic gate (5 seeds, thinking-on) | 5/5 | 5/5 | Empate |
| MBPP cap-hits | 2 | 7 | Mejor |
| Wikitext-2 PPL (`-c 4096 --chunks 40`) | 8.0765 ± 0.074 | 6.9728 ± 0.062 | +1.10 |
| VRAM @ 262.144 / q4_0 KV, ventana completa | 11.392 MiB | 14.862 MiB | Cabe en 12 GB |

No se han publicado resultados de benchmarks del modelo base de NVIDIA en la información disponible.

## Requisitos de hardware

- VRAM estimada: 11.392 MiB con contexto completo de 262.144 tokens y KV cache en q4_0. Con la ventana vacía, 11.312 MiB.
- GPU recomendada: cualquier GPU NVIDIA con 12 GB de VRAM o más. Validado en RTX 5080 (sm_120), pero compilable para otras arquitecturas (p. ej., `89` para RTX 40-series Ada).
- Cabe en GPUs consumer de 12 GB: RTX 4070 Ti, RTX 4080, RTX 5000, RTX 5080, RTX 4090, etc. No cabe en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp compilado desde el fork con el parche incluido. El script `serve-nemotron.sh` proporciona los flags exactos de `llama-server`.
- Latencia y throughput: no se proporcionan datos de tokens por segundo en la información disponible. El autor recomienda `-np 1` (una sola petición concurrente) y no aumentar el contexto ni el tipo de KV cache sin re-medir.

## Comparativa con modelos similares

La información disponible solo permite comparar con la versión de mayor tamaño del mismo autor (pirola-IQ3_XXS). No se han proporcionado datos de otros modelos MoE de tamaño similar (p. ej., Qwen3-30B-A3B o DeepSeek-V3-Lite) en la documentación.

| Modelo | Params totales | Contexto | Cuantización | VRAM (contexto completo) | MBPP | HumanEval |
|---|---|---|---|---|---|---|
| Este archivo (IQ2_XXS/XS) | 35.4B | 262.144 | IQ2_XXS/IQ2_XS | 11.392 MiB | 89.23 % | 97.56 % |
| pirola-IQ3_XXS | 35.4B | 262.144 | IQ3_XXS | 14.862 MiB | 90.40 % | 94.51 % |
| Modelo base BF16 | 35.4B | 262.144 | BF16 | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere un fork de llama.cpp con el parche `nemotron-expert-padding.patch`; el llama.cpp estándar rechaza el archivo GGUF.
- La cuantización agresiva (2.4 bpw en expertos) incrementa la perplejidad en wikitext-2 en +1.10 respecto a la versión IQ3_XXS, lo que puede afectar a tareas de modelado de lenguaje puro aunque no se refleje en coding.
- NVCC 13.2 miscompila los kernels de cuantización i-quant (`iq1_s`/`iq2_s`/`iq3_s`). Si se usa CUDA ≥13.2, hay que recompilar contra CUDA 13.0 antes de confiar en cualquier salida IQ.
- La VRAM queda al límite: 896 MiB de margen en una GPU de 12 GB con contexto completo. No se debe aumentar `-np`, `-c` ni cambiar el tipo de KV cache sin re-medir.
- El modelo base tiene licencia `nvidia-nemotron-open-model-license`, que permite uso comercial pero con condiciones específicas de NVIDIA; hay que revisar los términos antes de desplegar en producción.
- No se dispone de información sobre sesgos o riesgos de alucinación específicos de este modelo en la documentación proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pirola/Nemotron-3-Nano-30B-A3B-pirola-IQ2_XXS-XS-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Versión IQ3_XXS del mismo autor: https://huggingface.co/pirola/Nemotron-3-Nano-30B-A3B-pirola-IQ3_XXS-GGUF
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
