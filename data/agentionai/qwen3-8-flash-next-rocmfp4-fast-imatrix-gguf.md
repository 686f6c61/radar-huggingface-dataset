# agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de gran escala desarrollado por Qwen (Alibaba) y publicado bajo licencia qwen-community-1.0. Con 176.943.885.120 parámetros totales (unos 177 B), se posiciona en la gama alta de modelos abiertos, con soporte de visión, tool calling y un modo de razonamiento explícito. La ficha que nos ocupa no es el modelo original, sino una cuantización GGUF de muy baja precisión publicada por el usuario agentionai bajo el identificador `agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF`.

El interés de esta publicación es fundamentalmente de despliegue: consigue meter un modelo de 180 B en 87,06 GiB de VRAM a 4,23 bits por peso, lo que permite ejecutarlo íntegramente en la GPU de un equipo con memoria unificada de 128 GB (Strix Halo, Ryzen AI MAX+ 395 / Radeon 8060S, con 96 GiB reservados para VRAM). Según el autor, la pérdida de perplejidad respecto al modelo sin cuantizar es inferior al 2,5 %, y el prefill se mantiene en 423 t/s a 512 tokens, 357 t/s a 8k, 245 t/s a 32k y 138 t/s a 128k.

La relevancia actual es doble: por un lado, demuestra que los modelos de ~180 B pueden ser viables en hardware de consumo de gama alta con memoria unificada; por otro, introduce tipos de cuantización propios (ROCmFP4/ROCmFPx) y un layout por cabeza para la tabla n-gram que requieren un fork específico de llama.cpp, lo que condiciona por completo el stack de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida: 48 capas, de las cuales solo 12 son de atención completa; incluye tabla n-gram de 51,2 B de parámetros y cabeza MTP (multi-token prediction) para decodificación especulativa |
| Parámetros totales | 176.943.885.120 (~177 B; el autor redondea a 180 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | ROCmFP4 / ROCmFPx a 4,23 bpw (formato propietario del fork de agentionai); KV cache en q8_0 o f16; torre de visión en f16 sin recuantizar |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (dos layouts: raíz con tabla n-gram dividida por cabeza, y `v2/` con tabla como tensor único); mmproj separado en f16; cabeza MTP en repo aparte (2,28 GiB) |

## Arquitectura y entrenamiento

La información disponible sobre el entrenamiento del modelo base es escasa: no se detallan el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineación. Lo que sí se describe con precisión es la arquitectura de despliegue. El modelo tiene 48 capas, de las cuales únicamente 12 son de atención completa; esta proporción reducida de capas full-attention es la que mantiene pequeño el KV cache (unos 12,75 KiB por token en q8_0 frente a 24 KiB en f16, es decir, ~3,2 GiB para los 262.144 tokens de contexto frente a ~6 GiB en f16) y permite que el contexto largo quepa junto a los 87 GiB de pesos en una reserva de 96 GiB.

La innovación técnica más destacable de esta publicación es la cuantización ROCmFP4 con calibración imatrix sobre 1.540 fragmentos de dos corpus, de modo que los tensores de baja precisión se ajustan a activaciones reales. Además, el autor separa la tabla n-gram de 51,2 B de parámetros por cabeza, lo que permite mantenerla íntegramente en VRAM sin fallback a RAM del host ni cómputo en CPU en la ruta crítica. El modelo incluye su propia cabeza MTP para decodificación especulativa con profundidad de borrador adaptativa (entre 2 y 4 tokens), y la torre de visión se convierte a f16 de forma sin pérdida porque los pesos de visión quedaron excluidos de la release FP8 upstream.

## Capacidades

- Generación de texto conversacional multi-turno, con modo thinking y modo instruct (no-thinking) con parámetros de muestreo diferenciados.
- Razonamiento explícito: el modelo soporta un modo de pensamiento separado del modo instruct.
- Comprensión de imágenes mediante la torre de visión propia, servida a través del endpoint compatible con OpenAI.
- Tool calling y function calling, con plantilla Jinja (`--jinja`) para el formateo de herramientas.
- Razonamiento multi-paso y bucles agénticos, favorecidos por el prefill rápido a profundidad de contexto.
- Decodificación especulativa nativa mediante cabeza MTP, con aceptación dependiente del contenido.
- Contexto largo de hasta 262.144 tokens, con throughput de prefill medido a 32k y 128k.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos con contexto largo: el modelo puede mantener bucles agénticos de varios pasos releyendo un contexto grande, con 245 t/s de prefill a 32k y 138 t/s a 128k, lo que reduce la latencia de relectura en cada iteración del agente.
- Asistentes de código en local: con tool calling y modo thinking, encaja en flujos de refactorización y revisión sobre repositorios extensos, aprovechando el contexto de 262.144 tokens para incluir varios ficheros en la ventana.
- Análisis de documentos extensos con imágenes: la torre de visión en f16 permite enviar capturas, diagramas o páginas escaneadas junto a texto largo, útil en auditoría documental y extracción de datos.
- Atención al cliente automatizada: conversaciones multi-turno con historial largo, servidas mediante API compatible con OpenAI en `http://127.0.0.1:8080/v1`, lo que facilita la integración con frontends existentes.
- Despliegue en estación de trabajo con memoria unificada: un equipo Strix Halo de 128 GB puede servir el modelo íntegramente en GPU, sin servidores con múltiples A100/H100, adecuado para prototipado y demos internas.
- Procesamiento por lotes de prompts largos: el prefill de 423 t/s a 512 tokens y 357 t/s a 8k lo hace apto para tareas de resumen, clasificación o extracción sobre corpus con prompts de varios miles de tokens.
- Investigación en cuantización de baja precisión: el repo sirve como referencia reproducible de ROCmFP4 con imatrix, con métricas de perplejidad y throughput comparadas contra IQ4_XS e IQ3_S.

## Benchmarks y rendimiento

Los datos publicados por el autor son de throughput y perplejidad, no de benchmarks académicos estándar.

| Métrica | Valor |
|---|---|
| Perplejidad vs. modelo sin cuantizar | dentro del 2,5 % |
| Perplejidad vs. IQ4_XS e IQ3_S de AesSedai | mejor, con 20–30 GB menos de tamaño |
| Prefill a 512 tokens | 423 t/s |
| Prefill a 8k | 357 t/s |
| Prefill a 32k | 245 t/s |
| Prefill a 128k | 138 t/s |
| Generación con MTP (Strix Halo) | hasta 40 tok/s observados |
| Tamaño de pesos | 87,06 GiB a 4,23 bpw |
| KV cache q8_0 | ~12,75 KiB/token (~3,2 GiB a 262.144 tokens) |
| KV cache f16 | ~24 KiB/token (~6 GiB a 262.144 tokens) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 87,06 GiB para los pesos a 4,23 bpw, más ~3,2 GiB de KV cache en q8_0 para el contexto completo, más la torre de visión f16 y, opcionalmente, 2,28 GiB de la cabeza MTP. El autor dimensiona el conjunto para una reserva de 96 GiB.
- GPU recomendadas: el objetivo declarado es Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S) con 128 GB de memoria unificada. El fork soporta Vulkan, por lo que también se indican GPUs AMD e Intel; para NVIDIA se documenta el arranque con `--gpus all`.
- GPU de consumo: no cabe en ninguna GPU de consumo con VRAM dedicada convencional (RTX 4090, 24 GB). Solo es viable en equipos con memoria unificada de 128 GB o en configuraciones multi-GPU de gran capacidad.
- Despliegue: requiere el fork `agentionai/llama.cpp` (rama `main`) compilado con `-DGGML_VULKAN=ON`, o la imagen Docker `ghcr.io/agentionai/agention-llama:server` (también en Docker Hub). No es compatible con llama.cpp mainline para los tipos ROCmFPx ni para el layout por cabeza.
- Flags recomendados: `-ngl 99 -ctk q8_0 -ctv q8_0 -fa on --jinja`. Para el layout `v2/`, añadir `--ngram-on-disk --ngram-cache 8192` (por defecto 256 MiB).
- Latencia y throughput: prefill de 423 t/s a 512 tokens, 357 t/s a 8k, 245 t/s a 32k y 138 t/s a 128k; generación de hasta 40 tok/s con MTP adaptativo. La cuantización del KV a q8_0 no tiene coste medible de throughput según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next ROCmFP4-FAST (esta ficha) | ~177 B | 262.144 | ROCmFP4 4,23 bpw, 87,06 GiB | qwen-community-1.0 | GGUF en HF, requiere fork de llama.cpp |
| Qwen3.8-Flash-Next (base, FP8 upstream) | ~177 B | 262.144 | FP8 | qwen-community-1.0 | Repo upstream de Qwen |
| AP-IQ4_XS (mainline-compatible) | ~177 B | 262.144 | IQ4_XS | qwen-community-1.0 | GGUF en llama.cpp mainline |
| IQ4_XS / IQ3_S de AesSedai | ~177 B | 262.144 | IQ4_XS / IQ3_S | qwen-community-1.0 | GGUF, 20–30 GB más grandes que esta versión |

La comparativa se limita a variantes del mismo modelo base, ya que la información disponible no incluye datos de benchmarks frente a modelos de otras familias. Frente a las cuantizaciones mainline, esta versión ofrece mejor perplejidad con 20–30 GB menos de tamaño y requiere un fork no estándar.

## Limitaciones y advertencias

- Dependencia de un fork: los tipos ROCmFPx y el layout por cabeza de la tabla n-gram no funcionan en llama.cpp mainline; el despliegue queda atado al mantenimiento de `agentionai/llama.cpp`.
- El layout `v2/` necesita `--ngram-on-disk` o RAM del host, ya que un tensor de ese tamaño supera lo que aceptan muchos dispositivos Vulkan como buffer único.
- La caché n-gram por defecto es de 256 MiB; si no se amplía, el throughput decae a lo largo de la conversación.
- La tasa de aceptación de la decodificación especulativa depende del contenido, por lo que los 40 tok/s no son garantizables en todas las cargas.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; debe revisarse el fichero LICENSE antes de producción.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base en la documentación proporcionada.
- La cuantización a 4,23 bpw introduce una degradación de perplejidad de hasta el 2,5 %; en tareas sensibles a precisión numérica o de código conviene validar contra el modelo sin cuantizar.
- El hardware objetivo es muy específico (memoria unificada de 128 GB); no es desplegable en GPUs de consumo con VRAM dedicada.

## Enlaces

- Repo Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-imatrix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cabeza MTP: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF
- Fork de llama.cpp: https://github.com/agentionai/llama.cpp
- PR upstream de soporte del modelo: https://github.com/ggml-org/llama.cpp/pull/27742
- Imagen Docker: ghcr.io/agentionai/agention-llama:server (también `agentionai/agention-llama:server` en Docker Hub)
- Sitio del autor: https://agention.ai
