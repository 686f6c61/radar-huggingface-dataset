# arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-Blackwell-Rubin

## Resumen

NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-Blackwell-Rubin es una cuantizacion extrema NVFP4 (W4A4) con escalas MXFP8 nativas de Blackwell/Rubin del modelo `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, que a su vez deriva de un post-entrenamiento sobre `google/gemma-4-E4B-it`. Lo publica el usuario arvedo (no es una publicacion oficial de NVIDIA) y su objetivo es reducir el peso de un modelo de aproximadamente 8.000 millones de parametros desde los 14,89 GiB en BF16 hasta unos 6,0 GB de safetensors (6,20 GiB en VRAM al cargar), manteniendo una ventana de contexto nativa de 131.072 tokens.

La relevancia tecnica esta en la combinacion de cuantizacion de pesos y activaciones a 4 bits (NVFP4) con escalas de bloque de 32 elementos en formato MXFP8 (E4M3 + E8M0), disenada para ejecutarse en Tensor Cores NVFP4 de las arquitecturas NVIDIA Blackwell (SM_100, SM_120, SM_121a) y Rubin (SM_130). Requiere vLLM >= 0.22.0 con backend linear B12X o FlashInfer Cutlass NVFP4; no es un modelo que pueda ejecutarse en GPUs Ampere o Hopper sin soporte nativo de NVFP4.

El modelo conserva las capas de identidad de token FP8 sin comprimir y las tablas de embeddings por capa (PLE) de 262.144 x 42, calibradas con datasets de ratio aureo multi-escala sobre 128k tokens. Tambien mantiene paridad multimodal (vision y audio) con los encoders y proyecciones en MXFP8. La licencia es OpenMDW 1.1, distinta de las licencias Apache o MIT habituales, lo que exige revision juridica antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4 E4B, post-entrenado Nemotron); cuantizacion NVFP4 W4A4 con escalas MXFP8 de bloque 32 |
| Parametros totales | 7.996.156.490 (~8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (128k) |
| Tipos de cuantizacion | NVFP4 (W4A4) para pesos y activaciones; MXFP8 (E4M3 + E8M0, bloque 32) en encoders multimodales y proyecciones; FP8 para identidad de token y PLE sin comprimir; KV cache FP8; existe variante GGUF Q8_0 en repo separado |
| Idiomas soportados | en, de, fr, es, it, ja |
| Licencia | OpenMDW 1.1 (openmdw-1.1) |
| Formato de pesos | safetensors (repo de 31,0 GB) y GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal derivado de `google/gemma-4-E4B-it` y post-entrenado por NVIDIA como `NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; esos datos figuran como no disponibles en la informacion proporcionada.

La innovacion principal de esta version es el esquema de cuantizacion: pesos y activaciones en NVFP4 (4 bits), con escalas de bloque de 32 elementos en MXFP8 (E4M3 para la escala y E8M0 para el exponente compartido), lo que permite ejecucion nativa en Tensor Cores NVFP4 de Blackwell y Rubin. Se preservan sin comprimir las capas de identidad de token en FP8 y las tablas PLE de 262.144 x 42, calibradas con datasets de ratio aureo multi-escala sobre 128k tokens para evitar degradacion en contexto largo. Los encoders y proyecciones multimodales se mantienen en MXFP8 para conservar paridad con el modelo BF16. La model card menciona decodificacion especulativa en las pruebas de throughput, aunque no se especifica el mecanismo concreto (draft model, n-gramas o similar).

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno con ventana de 131.072 tokens.
- Razonamiento matematico: GSM8K y MATH-500 evaluados en la model card.
- Generacion de codigo Python: HumanEval y MBPP evaluados.
- Seguimiento de instrucciones estricto: IFEval e IFBench (modo prompt-strict y thinking).
- Capacidades multimodales: vision y audio, con paridad declarada frente al modelo BF16 (incluye reconocimiento de voz).
- Modo thinking: la model card reporta resultados separados para IFBench con thinking activado.
- Multilingue en seis idiomas: ingles, aleman, frances, espanol, italiano y japones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la model card.
- Compatibilidad con vLLM, prefix caching y chunked prefill para servir en produccion.

## Casos de uso

- Despliegue en GPUs de consumo Blackwell con VRAM limitada: al ocupar 6,20 GiB en carga, el modelo cabe en tarjetas de 8 GB o mas con soporte NVFP4, permitiendo inferencia local de un modelo de 8B con contexto de 128k.
- Procesamiento de documentos largos: la ventana de 131.072 tokens permite analizar contratos, informes o bases de codigo extensas en una sola pasada, con KV cache FP8 para controlar el consumo de memoria.
- Asistente conversacional multilingue: cubre espanol, ingles, aleman, frances, italiano y japones, adecuado para atencion al cliente en entornos europeos con requisitos de varios idiomas.
- Analisis de imagenes y audio en pipelines unificados: los encoders multimodales en MXFP8 permiten transcripcion de audio y comprension visual sin un segundo modelo, util en herramientas de accesibilidad o analisis de reuniones.
- Razonamiento matematico asistido: con 90,75% en GSM8K y 65,60% en MATH-500, sirve para tutoria o verificacion de calculos en entornos educativos.
- Generacion y revision de codigo Python: con 78,66% en HumanEval y 75,18% en MBPP, puede integrarse en asistentes de IDE o revisiones automatizadas, aunque con menor precision que la version BF16 en HumanEval.
- Servicio de alto throughput en DGX Spark: la model card reporta 1.631,7 tok/s agregados con batching continuo y decodificacion especulativa, adecuado para APIs internas con concurrencia moderada.
- Evaluacion de instrucciones estrictas: con 87,77% en IFEval strict y 55,33% en IFBench prompt-strict, util para generar salidas con formato fijo (JSON, plantillas) en pipelines automatizados.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados en NVIDIA DGX Spark GB10 con concurrencia 32 y sin cache hits, sobre un conjunto de 20.565 preguntas:

| Benchmark | Base BF16 | GGUF Q4_K_M | NVFP4 (este repo) |
|---|---|---|---|
| ARC (Challenge & Easy) | 90,84% | 90,36% | 92,00% |
| GSM8K (test) | 91,05% | 90,52% | 90,75% |
| GSM8K (train full) | 91,37% | 90,70% | 90,22% |
| HLE | 7,50% | 7,80% | 9,80% |
| HumanEval | 81,71% | 81,10% | 78,66% |
| IFBench (prompt-strict) | 50,00% | 54,33% | 55,33% (59,01% strict) |
| IFBench (thinking on) | 65,67% | 68,67% | 65,67% (69,19% strict) |
| IFEval (prompt-strict) | 82,99% | 82,44% | 87,77% (82,07% prompt-strict) |
| MMLU-Pro | 37,67% | 35,67% | 39,73% |
| MATH-500 | 65,20% | no disponible | 65,60% |
| MBPP | no disponible | no disponible | 75,18% |
| Multimodal (compuesto) | 73,40% (Gemma 4 E4B-IT) | no disponible | 73,81% |
| Multimodal ciencia | 62,56% (Gemma 4 E4B-IT) | no disponible | 71,43% |
| Reconocimiento de voz | 95,20% (Gemma 4 E4B-IT) | no disponible | 95,60% |

Nota: la model card cita "87,77% strict IFEval (82,07% prompt-strict)" en el texto y "82,99% prompt-strict" para la base BF16 en la tabla; la discrepancia de etiquetado no se aclara en la informacion disponible. El throughput declarado es de 1.631,7 tok/s agregados en DGX Spark GB10 con batching continuo y decodificacion especulativa.

## Requisitos de hardware

- VRAM minima: 8 GB; el modelo ocupa 6,0 GB de safetensors y 6,20 GiB en carga.
- Arquitecturas compatibles: NVIDIA Blackwell (SM_100, SM_120, SM_121a) y Rubin (SM_130) con Tensor Cores NVFP4. No funciona en Ampere ni Hopper sin soporte NVFP4 nativo.
- GPU recomendadas: DGX Spark GB10 (validada en la model card), tarjetas Blackwell de servidor y Rubin. No se especifican modelos concretos de RTX 50xx, aunque SM_120 corresponde a esa generacion.
- Cabe en GPU de consumo: si, en tarjetas Blackwell con 8 GB o mas de VRAM y soporte NVFP4.
- Despliegue: vLLM >= 0.22.0 (metodo recomendado, con backend B12X o FlashInfer Cutlass NVFP4), Docker con imagen `nemotron-bolt-vllm`, y llama.cpp/Ollama mediante el repositorio GGUF separado.
- Latencia y throughput: 1.631,7 tok/s agregados en DGX Spark GB10 con concurrencia 32 y decodificacion especulativa. No se publican cifras de latencia por peticion.
- Configuracion sugerida: `--max-model-len 131072`, `--kv-cache-dtype fp8`, `--enable-prefix-caching`, `--enable-chunked-prefill`, `--gpu-memory-utilization` entre 0,75 y 0,80.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (NVFP4 Blackwell/Rubin) | ~8B | 131.072 | safetensors NVFP4 + MXFP8 | OpenMDW 1.1 | Requiere Blackwell/Rubin; 6,0 GB |
| NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | ~8B | no disponible | safetensors BF16 | no disponible | 14,89 GiB; sirve de referencia en benchmarks |
| NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF | ~8B | no disponible | GGUF Q8_0 (PLE) | no disponible | 6,11 GB texto + 946 MB proyector multimodal; llama.cpp/Ollama |
| google/gemma-4-E4B-it | no disponible | no disponible | safetensors BF16 | no disponible | Modelo de origen; referencia multimodal (73,40%) |

No se dispone de datos de otros modelos de la misma categoria (8B con contexto de 128k y cuantizacion de 4 bits para Blackwell) en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia de hardware: solo funciona en GPUs Blackwell o Rubin con Tensor Cores NVFP4; no es desplegable en Ampere, Hopper ni en CPU sin la variante GGUF.
- Licencia OpenMDW 1.1: no es Apache 2.0 ni MIT; requiere revision juridica antes de uso comercial, y la model card no detalla obligaciones de atribucion o restricciones adicionales.
- Publicador no oficial: el repositorio lo mantiene el usuario arvedo, no NVIDIA; no hay garantia de soporte, actualizaciones ni validacion independiente de los benchmarks.
- Degradacion en codigo: HumanEval baja de 81,71% (BF16) a 78,66% en esta cuantizacion, una perdida de 3,05 puntos que puede afectar a pipelines de generacion de codigo.
- HLE muy bajo (9,80%): el modelo no es fiable en razonamiento de nivel experto ni en tareas que requieran conocimiento avanzado.
- MMLU-Pro limitado (39,73%): rendimiento moderado en conocimiento general, insuficiente para tareas de alta exigencia enciclopedica.
- Riesgo de alusion: no se documentan tasas de alucinacion ni evaluaciones de veracidad en la model card.
- Sesgos: no se publica informacion sobre sesgos demograficos, culturales o linguisticos.
- Cobertura limitada a seis idiomas; el espanol esta soportado, pero no se aportan metricas por idioma.
- Tool calling y comportamiento agentico no documentados: no se recomienda asumir soporte de function calling en produccion sin validacion propia.
- Repo grande (31,0 GB) pese al peso del modelo (6,0 GB), probablemente por incluir pesos adicionales o checkpoints; conviene revisar el contenido antes de descargar.
- Las cifras de benchmarks son autoinformadas y no han sido replicadas de forma independiente en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-Blackwell-Rubin
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo de origen: https://huggingface.co/google/gemma-4-E4B-it
- Variante GGUF: https://huggingface.co/arvedo/NVIDIA-Nemotron-3.5-Bolt-E4B-NVFP4-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Papers, blogs o repos adicionales: no disponibles en la informacion proporcionada.
