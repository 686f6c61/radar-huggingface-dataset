# oaklight/Qwen3.8-Flash-Next-NVFP4-sm70

## Resumen

Qwen3.8-Flash-Next-NVFP4-sm70 es una versión cuantizada en NVFP4 del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario oaklight (la model card atribuye la release original a RadixArk). Se trata de un Mixture-of-Experts multimodal de aproximadamente 180 000 millones de parámetros con arquitectura híbrida, pensado para servir cargas de trabajo agénticas, chat, código y razonamiento multimodal sobre hardware NVIDIA Blackwell. La cuantización se realizó con NVIDIA Model Optimizer (NVFP4 W4A4), aplicada exclusivamente a los expertos enrutados de las 48 capas MoE del modelo principal.

El interés de esta ficha es fundamentalmente práctico: el checkpoint reduce el tamaño de 360 GB (BF16) a 135 GB, un factor de compresión de aproximadamente 2,7x, manteniendo en BF16 (byte-idénticos al modelo fuente) los componentes críticos para la calidad: atención, QSA, GDN, mHC, expertos compartidos, routers, embeddings, LM head, visión y las 31 tensores MTP. El contexto declarado alcanza 262 144 tokens y la entrada admite texto, imagen y vídeo, con salida exclusivamente de texto.

Se trata de una release candidata privada, con cero descargas y cero likes en el momento de la consulta, validada únicamente sobre GB300 y B300 y servible solo con SGLang (build con soporte `qwen4_exp`). No hay datos publicados sobre idiomas soportados ni sobre la licencia efectiva más allá de la referencia al modelo fuente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (GDN + QSA sparse attention, multi-hyperconnection streams, PLE n-gram injection); MoE multimodal |
| Parámetros totales | ~180 000 millones (179 999 981 459 según safetensors) |
| Parámetros activos | no disponible (512 expertos enrutados por capa MoE, top-10 routing + shared expert) |
| Longitud de contexto | 262 144 tokens (262K) |
| Tipos de cuantización | NVFP4 W4A4 (E2M1, group size 16, escalas de bloque FP8 E4M3, escalas globales FP32, activaciones NVFP4 dinámicas) solo en expertos enrutados; resto en BF16; tablas PLE en FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | other (se remite a los términos del modelo fuente Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | safetensors (librería Model Optimizer); tamaño del repo 135,2 GB |

## Arquitectura y entrenamiento

El modelo base es un Transformer multimodal con arquitectura híbrida que combina GDN (gated delta networks) y QSA (sparse attention), junto con multi-hyperconnection streams y una técnica de inyección de n-gramas mediante PLE (probablemente "PLE n-gram injection" según la model card). Consta de 48 capas decodificadoras, cada una con 512 expertos enrutados en top-10 más un experto compartido, y una capa MTP adicional. El total ronda los 180 000 millones de parámetros, con un checkpoint BF16 original de 360 GB.

La cuantización post-entrenamiento se ejecutó con NVIDIA Model Optimizer v0.46.0 (snapshot `87c9f8cf`) usando la receta NVFP4 W4A4 sobre las proyecciones fusionadas `gate_up_proj` y `down_proj` de los expertos enrutados (294 912 entradas de tensor cuantizadas). El conjunto de calibración fue cnn_dailymail (config 3.0.0, split train): 128 artículos con semilla 1234, truncados a 512 tokens, capturando activaciones de entrada de los bloques MoE desde serving SGLang en vivo (solo prefill), 62 139 filas por capa, con escalas de activación por máximo sobre 8 lotes muestreados con semilla por parte. Como sonda de representatividad se usó GSM8K train [0:16] x2. Las tablas de embeddings PLE emplean las versiones cuantizadas en FP8 de la revisión `Qwen/Qwen3.8-Flash-Next-FP8` (128 shards F8_E4M3 con escala escalar por tabla, dequantizadas a BF16 en carga); el resto de pesos PLE permanecen en BF16. No hay metadatos de cuantización de KV-cache.

## Capacidades

- Generación de texto con razonamiento multi-paso y modo de pensamiento extendido (los evals reportan generaciones de hasta 130 000 tokens en AIME26).
- Procesamiento multimodal de entrada: texto, imagen y vídeo (pipeline image-text-to-text), con salida exclusivamente de texto.
- Razonamiento matemático de alta exigencia (GSM8K y AIME26 evaluados).
- Programación y tareas de código (declaradas como caso de uso en la model card, sin benchmarks específicos publicados).
- Cargas de trabajo agénticas y sistemas multi-paso, con generaciones largas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Decodificación especulativa nativa mediante la capa MTP incluida en el checkpoint (31 tensores MTP en BF16).

## Casos de uso

- Evaluación de serving NVFP4: desplegar el checkpoint con SGLang (`--quantization modelopt_fp4`, `--fp4-gemm-backend flashinfer_cutlass`) para medir latencia, throughput y calidad frente a la referencia BF16 antes de adoptar FP4 en producción.
- Razonamiento matemático en producción: resolución de problemas tipo GSM8K/AIME con cadenas de pensamiento largas, aprovechando que la cuantización preserva la precisión de un solo turno (97,27 en GSM8K y 98,75 pass@1 en AIME26 según la model card).
- Asistentes conversacionales multi-turno: conversaciones con contexto largo gracias a la ventana de 262 144 tokens, útil para atención al cliente con historiales extensos o documentación adjunta.
- Análisis de documentos e imágenes: ingesta de texto e imagen en un mismo prompt para extracción de información, resumen o respuesta a preguntas sobre capturas, diagramas o páginas escaneadas.
- Comprensión de vídeo: procesamiento de entradas de vídeo para descripción, resumen o respuesta a preguntas sobre el contenido, con salida textual.
- Sistemas agénticos multi-paso: pipelines que encadenan decenas de llamadas con tool calling (si se confirma su soporte en el runtime) y generaciones largas; la model card advierte que las generaciones agénticas tienden a alargarse respecto a BF16.
- Generación de código en pipelines de CI/CD: asistencia a revisión de código y generación de parches, aunque no hay benchmarks de código publicados que respalden esta aplicación con cifras.

## Benchmarks y rendimiento

| Eval | Protocolo | Referencia BF16 | NVFP4 (este checkpoint) |
|---|---|---|---|
| GSM8K | full 1319, t0.6 / top-p 0.95 / max 8192 | 97,12–97,50 (rango de tres ejecuciones BF16 sobre revisión anterior) | 97,27 (stop 98,86, err 0) |
| AIME26 | 30 problemas x 8, t1.0 / max 130k | 100 (240/240) | 98,75 pass@1 (majority@8 100, stop 99,17) |

Notas de la model card: las ejecuciones BF16 de referencia se registraron sobre una revisión anterior del mismo modelo y las diferencias de pesos entre revisiones no están establecidas, por lo que la comparación es indicativa y no exacta. El resultado de AIME26 se midió sobre la revisión previa del checkpoint, cuyos pesos difieren de la actual solo en las tablas de embeddings PLE. Advertencia de comportamiento: la cuantización preserva la precisión de un solo turno, pero las generaciones agénticas largas tienden a ser más extensas que en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 135,2 GB; con overhead de serving, la model card recomienda `--mem-fraction-static 0.80` y `--tp 2`, lo que sugiere un despliegue mínimo de dos GPUs de gran capacidad.
- GPU validadas: NVIDIA Blackwell, concretamente GB300 y B300 (la model card indica validación sobre estas plataformas). El sufijo `sm70` del nombre del repo no se explica en la documentación disponible.
- GPU consumer: no disponible; no hay indicios de que quepa en GPUs de consumo (RTX 4090, etc.) dado el tamaño del checkpoint y la exigencia de NVFP4 sobre Blackwell.
- Opciones de despliegue: exclusivamente SGLang con build que incluya soporte `qwen4_exp`; parámetros sugeridos: `--tp 2`, `--quantization modelopt_fp4`, `--fp4-gemm-backend flashinfer_cutlass`, `--page-size 64`, `--mamba-scheduler-strategy extra_buffer`, `--mamba-track-interval 64`, `--chunked-prefill-size 4096`, `--max-running-requests 36`, `--context-length 262144`, `--mem-fraction-static 0.80`, `--allow-auto-truncate`.
- Otros runtimes (vLLM, llama.cpp, Ollama, TGI): no disponibles según la model card, que solo declara SGLang.
- Latencia y throughput: no disponibles; no se publican cifras de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-sm70 (este) | ~180B | 262K | NVFP4 W4A4 (expertos) + BF16 | other | HF, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (fuente) | ~180B | 262K | BF16 (360 GB) | other | HF |
| Qwen/Qwen3.8-Flash-Next-FP8 | ~180B | 262K | FP8 (tablas PLE) | other | HF |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | ~180B | 262K | NVFP4 W4A4 | other | HF |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información disponible; no se han identificado modelos de terceros comparables con datos verificables en esta ficha.

## Limitaciones y advertencias

- Riesgo de sesgos y toxicidad: el modelo base se entrenó con datos de internet que contienen lenguaje tóxico y sesgos sociales, por lo que puede amplificarlos y producir respuestas tóxicas ante prompts tóxicos.
- Alucinación: la model card advierte que el modelo puede generar respuestas inexactas, omitir información clave o incluir texto irrelevante o redundante, incluso con prompts no ofensivos.
- Degradación en generaciones agénticas largas: la cuantización preserva la precisión de un solo turno, pero las generaciones agénticas tienden a alargarse respecto a BF16.
- Restricciones de hardware: solo validado en NVIDIA Blackwell (GB300, B300) y solo servible con SGLang con soporte `qwen4_exp`; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Licencia: "other", remitida a los términos del modelo fuente; es necesario revisar la licencia de Qwen/Qwen3.8-Flash-Next antes de cualquier uso comercial.
- Idiomas: no declarados; no hay información sobre cobertura multilingüe.
- Madurez: release candidata privada, con cero descargas y cero likes, sin benchmarks de código ni de tool calling publicados; la comparación con BF16 es indicativa porque las revisiones de pesos difieren.
- Integridad declarada: la model card reporta auditorías estructurales (294 912 tensores enrutados + 1 562 sin cambios + 31 MTP), de escalas (221 184 escalas finitas positivas, min 2,13e-05, max 448,0), de igualdad de bytes en contenido sin cambios (1 562 tensores / 118,4 GB) y un smoke test determinista de serving; no se aportan resultados de terceros que las verifiquen.

## Enlaces

- Hugging Face: https://huggingface.co/oaklight/Qwen3.8-Flash-Next-NVFP4-sm70
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Release original NVFP4 (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Revisión FP8 del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- NVIDIA TensorRT Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Dataset de calibración cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
