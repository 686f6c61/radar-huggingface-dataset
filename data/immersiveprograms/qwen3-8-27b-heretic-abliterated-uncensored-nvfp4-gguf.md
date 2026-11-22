# ImmersivePrograms/Qwen3.8-27B-Heretic-Abliterated-Uncensored-NVFP4-GGUF

## Resumen

Qwen3.8-27B-Heretic-Abliterated-Uncensored-NVFP4-GGUF es una cuantizacion NVFP4 (FP4 E2M1 de 4 bits) publicada por ImmersivePrograms sobre el modelo 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF, que a su vez deriva del Qwen/Qwen3.8-27B. El modelo conserva la arquitectura original `qwen35` (Gated DeltaNet hibrida) con 26.895.999.442 parametros y 64 capas, pero incorpora un proceso de abliteration y "heretic" orientado a eliminar los rechazos del modelo base. Esta version concreta anade una cuantizacion de 4 bits con escalas FP8, imatrix de calibracion y una politica de proteccion de tensores que mantiene en F32/F16 las capas criticas (normas, SSM y primeros bloques).

El resultado es un fichero GGUF de 16,78 GB con un BPW efectivo de 5,23 que, segun el autor, supera en calidad a una cuantizacion Q5_K_S de referencia (PPL 4,4455 frente a 4,5303) ocupando menos espacio. Incluye soporte multimodal mediante un proyector de vision separado y decodificacion especulativa con un drafter DFlash2 de 2 bits, lo que permite ejecutarlo en configuraciones de 2x16 GB de VRAM a contexto completo de 262.144 tokens.

Es relevante para desarrolladores que necesitan desplegar un modelo de ~27B sin censura en hardware consumer de gama alta, con inferencia local via llama.cpp y compatibilidad con endpoints. La licencia Apache 2.0 facilita el uso comercial, aunque el caracter "uncensored" implica riesgos de contenido que deben gestionarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (Gated DeltaNet hibrida), 64 capas |
| Parametros totales | 26.895.999.442 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 E2M1, grupo 16, escalas FP8 E4M3); tensores selectos en F32 y F16 |
| Idiomas soportados | en, ru (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `RVN-NVFP4-imx.gguf`, 16,78 GB) |
| BPW efectivo | 5,23 |
| MTP | No |
| `general.file_type` | 39 (`LLAMA_FTYPE_MOSTLY_NVFP4`) |
| Cuantizador | michaelw9999/advanced-gguf-quantizer |
| Imatrix | Bartowski v6, 601 chunks, calculada sobre Q5_K_S |

## Arquitectura y entrenamiento

La arquitectura subyacente es `qwen35`, una variante hibrida Gated DeltaNet de 64 capas y 27B parametros, segun los metadatos del GGUF de origen (`RVN-F16.gguf`, 53,8 GB en F16). No se dispone de informacion en la model card sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base original uso RLHF o DPO. El proceso de "abliteration" y "heretic" aplicado por el autor intermedio (0bserverx) modifica los pesos para reducir los comportamientos de rechazo del Qwen3.8-27B original, pero no se detalla la metodologia exacta en la informacion proporcionada.

La innovacion tecnica de esta ficha es la cuantizacion. Se aplico `llama-quantize` con `--allow-requantize --mode fast` sobre el F16, usando una imatrix calculada en Q5_K_S con 601 chunks de calibracion. La politica de proteccion de tensores mantiene en F32 todas las normas 1D (`attn_norm`, `post_attention_norm`, `attn_q_norm`, `attn_k_norm`, `ssm_norm`, `output_norm`), los tensores SSM (`ssm_conv1d`, `ssm_dt.bias`, `ssm_a`) por requisitos del kernel CUDA, y en F16 el embedding, los tensores de los bloques 0 y 1 y `blk.13.ffn_down.weight`. El resto se cuantiza a NVFP4. Ademas, el autor publica dos parches para llama.cpp que habilitan DFlash2 (decodificacion especulativa) con `--split-mode tensor` y con procesamiento de imagenes.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento y generacion de codigo heredados del Qwen3.8-27B base (no se detallan benchmarks especificos).
- Capacidad multimodal de vision: el repositorio incluye `mmproj-BF16.gguf` (888 MiB) y la configuracion de ejemplo lo carga con `--mmproj`.
- Decodificacion especulativa mediante drafter DFlash2 (`Qwen3.8-27B-DFlash2-Q2_K.gguf`, 673 MiB), con soporte de hasta 3 tokens de borrador (`--spec-draft-n-max 3`).
- Soporte de plantillas Jinja (`--jinja`) para formateo de chat.
- Modelo "uncensored"/"abliterated": no aplica rechazos por contenido sensible, lo que cambia el comportamiento respecto al base.
- Idiomas: ingles y ruso segun la model card; no se confirma soporte de castellano.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponibles en la informacion proporcionada.

## Casos de uso

- **Generacion de texto creativo sin filtros**: el caracter abliterated permite producir narrativa, dialogos o guiones sin los rechazos del modelo base; util en entornos editoriales controlados donde el operador asume la responsabilidad del contenido.
- **Analisis de documentos largos en local**: con 262.144 tokens de contexto y ~27,5 GB de VRAM totales en 2x16 GB, se pueden procesar contratos, informes o bases de codigo completas sin enviar datos a la nube.
- **Asistente de codigo en estaciones de trabajo**: el modelo hereda las capacidades de codigo del Qwen3.8-27B y puede desplegarse con `llama-server` exponiendo una API compatible con endpoints, integrándose en editores o pipelines internos.
- **Procesamiento de imagenes con descripcion textual**: gracias al proyector `mmproj-BF16.gguf` y al parche de imagenes para DFlash2, se pueden construir flujos de captioning, extraccion de informacion de capturas o moderacion visual asistida.
- **Investigacion sobre alineacion y seguridad**: el modelo sirve como objeto de estudio para comparar comportamientos entre un modelo alineado y su version abliterated, midiendo tasas de rechazo, sesgos y calidad.
- **Despliegue en hardware consumer de gama alta**: con 2x RTX 5060 Ti 16 GB (probado por el autor) o GPUs Ampere con kernels de fallback, es viable ejecutar un 27B a contexto completo con ~5 GB de margen, algo impracticable en F16.
- **Traduccion y generacion en ingles y ruso**: para pares de idiomas en/ru, el modelo puede usarse en pipelines de traduccion o generacion multilingue local.

## Benchmarks y rendimiento

El autor publica unicamente la perplejidad sobre el conjunto de calibracion v6, comparando esta cuantizacion con una Q5_K_S de referencia:

| Metrica | NVFP4 (esta) | Q5_K_S (referencia) |
|---|---|---|
| PPL (calibration_v6) | 4,4455 ± 0,032 | 4,5303 ± 0,034 |
| Tamano | 16,78 GB | 18,68 GB |
| VRAM libre (2x16 GB) | ~5 GB | ~2 GB |

Segun el autor, la diferencia de 0,085 PPL esta a 2,5 sigma, fuera del ruido. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: ~27.536 MiB en total para la configuracion completa medida por el autor (modelo 16.776 MiB + vision 888 MiB + drafter 673 MiB + KV cache y buffers ~9.199 MiB), con ~5.086 MiB libres.
- **GPU recomendadas**: Blackwell (RTX 50xx) con ruta FP4 nativa, compilando con `BLACKWELL_NATIVE_FP4=1`; Ampere (RTX 30xx) funciona con kernels de fallback. Probado en 2x RTX 5060 Ti 16 GB.
- **Cabe en consumer GPU**: si, en configuraciones multi-GPU de 16 GB (2x16 GB) a contexto completo; en una sola GPU de 24 GB no cabe el modelo completo con vision y drafter.
- **Opciones de despliegue**: llama.cpp (`llama-server`, `llama-cli`), con soporte de `--split-mode tensor`, `--flash-attn on`, `--jinja` y KV cache cuantizada (`-ctk q4_0 -ctv q4_0`). No se menciona compatibilidad con vLLM, TGI u Ollama.
- **Latencia y throughput**: no disponibles en la informacion proporcionada; el autor solo indica que Blackwell es "la ruta mas rapida" por FP4 nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|---|
| ImmersivePrograms/Qwen3.8-27B-Heretic-Abliterated-Uncensored-NVFP4-GGUF | ~26,9B | 262.144 | NVFP4 (4 bits) | 16,78 GB | Apache 2.0 | Vision + DFlash2, uncensored |
| 0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF (base) | ~26,9B | 262.144 | GGUF (varias) | no disponible | Apache 2.0 | Mismo modelo sin cuantizacion NVFP4 especifica |
| Qwen/Qwen3.8-27B (original) | ~26,9B | 262.144 | safetensors/GGUF | no disponible | Apache 2.0 | Modelo alineado, con rechazos |
| Q5_K_S de referencia (mismo modelo) | ~26,9B | 262.144 | Q5_K_S | 18,68 GB | Apache 2.0 | PPL 4,5303, mayor tamano |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- **Contenido sin filtros**: el proceso abliterated elimina los rechazos del modelo base; puede generar contenido sensible, ofensivo o ilegal segun el prompt. Requiere moderacion externa en produccion.
- **Riesgo de alucinacion**: no se han publicado evaluaciones de factualidad; como cualquier LLM, puede inventar datos, especialmente en contextos largos.
- **Idiomas limitados**: la model card solo declara ingles y ruso; el rendimiento en castellano no esta verificado y podria degradarse.
- **Licencia Apache 2.0**: permite uso comercial, pero el operador asume la responsabilidad legal del contenido generado por un modelo uncensored.
- **Dependencia de parches**: DFlash2 con `--split-mode tensor` y con imagenes requiere parches personalizados de llama.cpp; sin ellos, la aceptacion del drafter cae al 0% o se rompe tras procesar imagenes.
- **Hardware especifico**: la ruta FP4 nativa solo esta en Blackwell; en Ampere se usan kernels de fallback con rendimiento no documentado.
- **Contexto completo costoso**: a 262K tokens el KV cache consume ~9,2 GB adicionales, lo que limita el margen en configuraciones de 2x16 GB.
- **Sin benchmarks estandar**: no hay datos de MMLU, HumanEval o GSM8K para esta cuantizacion, por lo que la calidad en tareas especificas no esta cuantificada.
- **Fecha de publicacion futura**: el repositorio figura creado en 2026-11-19, lo que puede indicar metadatos inconsistentes; verificar disponibilidad real.

## Enlaces

- Hugging Face: https://huggingface.co/ImmersivePrograms/Qwen3.8-27B-Heretic-Abliterated-Uncensored-NVFP4-GGUF
- Modelo base intermedio: https://huggingface.co/0bserverx/Qwen3.8-27B-Heretic-Abliterated-Uncensored-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizador: https://github.com/michaelw9999/advanced-gguf-quantizer
- Imatrix de calibracion: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF/blob/main/Qwen3.8-27B-calibration-v6.txt
- Drafter DFlash2: https://huggingface.co/analogalok/Qwen3.8-27B-DFlash2-Q2_K-GGUF
- PR de soporte DFlash2 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27342
- Issue de imagenes con DFlash2: https://github.com/ggml-org/llama.cpp/issues/27408
