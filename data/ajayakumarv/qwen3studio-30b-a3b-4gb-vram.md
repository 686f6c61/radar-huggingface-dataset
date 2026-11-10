# AjayakumarV/Qwen3Studio-30B-A3B-4GB-VRAM

## Resumen

Qwen3Studio-30B-A3B-4GB-VRAM es un repositorio de configuración y artefactos GGUF publicado por AjayakumarV que documenta cómo ejecutar el modelo Qwen3-30B-A3B (un transformer con mezcla de expertos de Qwen) en una GPU de tan solo 4 GB de VRAM. No se trata de un modelo entrenado desde cero, sino de una receta de hardware-software co-design sobre `llama.cpp` que combina una cuantización agresiva IQ3_XXS del modelo principal (12,0 GB) con un modelo borrador Qwen3-0.6B (386,6 MB) para decodificación especulativa. El autor reporta 39,2 tok/s y 290,9 ms de TTFT en una NVIDIA T1000 con 32 GB de RAM e Intel Core i7-12700K.

El interés del proyecto reside en su enfoque de despliegue en el borde (edge AI): demuestra que un MoE de 30B parámetros totales y unos 3B activos puede servirse en hardware de gama baja mediante descarga selectiva de expertos a CPU, caché KV cuantizada a q8_0, reutilización de prefijo y un ajuste fino del número de expertos activos por capa (Top-4 en lugar de Top-8). Adicionalmente, incluye una pasada de verificación neuro-simbólica (`verifier.py`) que valida números y código Python generados en menos de 1 ms, orientada a mitigar alucinaciones en pipelines RAG.

El modelo base es Qwen3-30B-A3B, con licencia Apache 2.0, y el repositorio declara soporte únicamente para inglés. La ficha se centra en los datos publicados por el autor; cualquier especificación del modelo base no incluida en la información disponible se marca como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basado en Qwen3-30B-A3B |
| Parametros totales | 30B (modelo base); pesos cuantizados IQ3_XXS de 12,0 GB |
| Parametros activos | 3,05B con Top-8 completo; 1,50B con Top-4 configurado |
| Longitud de contexto | 8192 tokens en la configuración publicada (`-c 8192`) |
| Tipos de cuantizacion | Principal: IQ3_XXS (12,0 GB); borrador: Q4_K_XL (386,6 MB); caché KV: q8_0 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ejecutable con llama.cpp / llama-server) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-30B-A3B, un transformer con mezcla de expertos de Qwen. Este repositorio no entrena pesos nuevos: publica una configuración de inferencia y los artefactos GGUF derivados de `unsloth/Qwen3-30B-A3B-GGUF` y `unsloth/Qwen3-0.6B-GGUF`. La innovación técnica no está en el entrenamiento sino en el despliegue: descarga estática de 41 capas MoE a CPU (`-ncmoe 41`), carga parcial de 16 capas en GPU (`-Cr 0-15`), atención con Flash Attention y caché KV cuantizada a q8_0, reutilización de prefijo con `--cache-reuse 256`, y reducción del número de expertos activos por token de 8 a 4 mediante `--override-kv qwen3moe.expert_used_count=int:4`.

Sobre esa base se añade decodificación especulativa con Qwen3-0.6B como modelo borrador (`--spec-type draft-simple`, `n-max=3`, `p-min=0.80`), que alcanza una tasa de aceptación del 88,8% (87/98) en modo Top-4 y del 94,8% (91/96) en Top-8 completo. El autor documenta además un verificador neuro-simbólico (`verifier.py`) que extrae números significativos (≥10, decimales, porcentajes) y valida código Python con `ast.parse()`, activando una segunda pasada crítica solo cuando la puntuación de fundamentación cae por debajo del 100%. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto en inglés con un modelo MoE de 30B parámetros totales.
- Razonamiento y generación de código: el autor valida tareas de ingeniería y código Python con AST completo en Top-4, Top-5, Top-6 y Top-8.
- Razonamiento matemático: la pasada de verificación cubre la comprobación de cifras, decimales y porcentajes frente al prompt o a los fragmentos RAG.
- Mitigación de alucinaciones numéricas mediante el verificador simbólico de menos de 1 ms.
- Decodificación especulativa con modelo borrador Qwen3-0.6B para acelerar la generación.
- Integración con pipelines RAG (etiqueta `rag` en el repositorio).
- Despliegue en el borde (edge AI) sobre hardware de consumo.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente local en estaciones de trabajo con GPU modesta: la configuración permite servir un MoE de 30B en una T1000 de 4 GB VRAM más 32 GB de RAM, útil para entornos de desarrollo sin acceso a clústeres.
- Generación de código asistida en local: el modelo supera las cinco tareas de ingeniería del autor con Top-4 y valida la sintaxis Python con `ast.parse()`, lo que permite integrarlo en editores o pipelines de CI/CD con verificación estática previa.
- RAG con control de cifras: el verificador extrae números del prompt y de los fragmentos recuperados y bloquea respuestas con cifras no fundamentadas, adecuado para documentación técnica o financiera.
- Despliegue en el borde o en equipos sin GPU dedicada: con 41 capas MoE en CPU y 16 en GPU, el sistema funciona en workstations de gama media con 32 GB de RAM.
- Prototipado de investigación sobre decodificación especulativa: la progresión de seis etapas y el barrido de expertos activos (K=3 a K=8) sirven como referencia reproducible para estudiar el equilibrio velocidad/calidad en MoE.
- Evaluación de técnicas de cuantización extrema: el uso de IQ3_XXS con caché KV q8_0 documenta el impacto en TTFT y tok/s de cada decisión de cuantización.
- Servicio de chat multi-turno con contexto de 8192 tokens: la reutilización de prefijo (`--cache-reuse 256`) y el modo single-slot reducen el TTFT en conversaciones encadenadas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (hardware: NVIDIA T1000 4 GB VRAM, Intel Core i7-12700K, 32 GB RAM):

| Etapa | Configuración | VRAM | TTFT | Prompt tok/s | Decode tok/s | Aceleración |
|---|---|---|---|---|---|---|
| 1. Cold baseline | `-ngl 99 --cpu-moe` (4 slots) | 2.322 MiB | 42.811,7 ms | 0,77 | 6,89 | 1,00x |
| 2. Warm baseline | `-ngl 99 --cpu-moe` (4 slots) | 2.322 MiB | 1.093,1 ms | 21,95 | 18,68 | 2,71x |
| 3. Single-slot prefix KV | `-np 1 --keep -1 --cache-reuse 256` | 2.441 MiB | 309,4 ms | 38,79 | 19,54 | 2,84x |
| 4. Dynamic PCIe LRU | `--moe-cache-mib 768 --spec-type ngram-simple` | 3.158 MiB | 357,3 ms | 2,80 | 8,57 | 1,24x |
| 5. Static hybrid + Top-4 | `--load-mode none -ncmoe 41 -Cr 0-15` | 3.762 MiB | 290,9 ms | 82,49 | 39,18 | 5,69x |
| 6. Speculative 0.6B | Etapa 5 + borrador Qwen3-0.6B | 3.890 MiB | 312,0 ms | 79,80 | 39,35 | 5,71x |

Barrido de expertos activos:

| Expertos activos (K) | Parámetros activos | Decode directo | Con borrador 0.6B | Aceptación del borrador | Veredicto en código y matemáticas |
|---|---|---|---|---|---|
| Top-3 | 1,15B | 44,16 tok/s | — | — | Fallo (AST Python incompleto) |
| Top-4 | 1,50B | 39,18 tok/s | 39,07 – 39,35 tok/s | 88,8% (87/98) | 100% (5/5 tareas) |
| Top-5 | 1,88B | 35,11 tok/s | — | — | 100% |
| Top-6 | 2,25B | 31,04 tok/s | 33,80 tok/s | 91,2% | 100% |
| Top-8 | 3,05B | 18,68 tok/s | 27,11 tok/s (+45,1%) | 94,8% (91/96) | 100% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: 3.890 MiB en la configuración óptima con decodificación especulativa; 3.762 MiB sin borrador; mínimo de 2.322 MiB en baseline.
- RAM: 32 GB recomendados (los pesos IQ3_XXS ocupan 12,0 GB y 41 capas MoE se descargan a CPU).
- CPU: Intel Core i7-12700K en la referencia publicada; se usan 8 hilos (`-t 8`) y 16 hilos de batch (`-tb 16`).
- GPU validadas: NVIDIA T1000 (4 GB). No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: sí cabe en GPUs de 4 GB o más; el autor lo demuestra en una T1000.
- Despliegue: llama.cpp / llama-server (comando exacto incluido en la model card); no se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: TTFT de 290,9 ms y 39,18 tok/s en decodificación directa; 39,35 tok/s con borrador; prompt a 82,49 tok/s en la etapa 5.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| Qwen3Studio-30B-A3B-4GB-VRAM | 30B totales / 1,5B activos (Top-4) | 8192 tokens (config. publicada) | Apache 2.0 | llama.cpp en 4 GB VRAM | Receta de despliegue con verificación simbólica |
| Qwen3-30B-A3B (base) | 30B totales / 3,05B activos | No disponible en la información | Apache 2.0 | Requiere más VRAM sin descarga a CPU | Modelo original de Qwen |
| Qwen3-0.6B | 0,6B | No disponible en la información | Apache 2.0 | Consumer GPU / CPU | Usado aquí como modelo borrador |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio no entrena un modelo nuevo: es una configuración de inferencia y artefactos GGUF; los méritos y limitaciones del modelo base aplican en su totalidad.
- Soporte declarado únicamente en inglés; no se documentan capacidades multilingües.
- Contexto limitado a 8192 tokens en la configuración publicada; ventanas mayores requerirían más VRAM o RAM.
- La reducción a Top-4 expertos activos degrada la calidad en tareas de código: Top-3 falla en la generación de AST Python completo según el autor.
- El verificador simbólico solo cubre cifras y sintaxis Python; no detecta alucinaciones cualitativas ni errores lógicos.
- Riesgo de alucinación inherente al modelo base; la mitigación es parcial y depende de la calidad de los fragmentos RAG.
- El rendimiento reportado está medido en un hardware concreto (T1000, i7-12700K, 32 GB); no es extrapolable a otras configuraciones.
- No se documentan sesgos conocidos del modelo base en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las licencias del modelo base y de los artefactos GGUF de Unsloth.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AjayakumarV/Qwen3Studio-30B-A3B-4GB-VRAM
- Repositorio GitHub, instalador y paper: https://github.com/AjayakumarV/Qwen3Studio-LocalAI
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- GGUF de Unsloth (modelo principal): https://huggingface.co/unsloth/Qwen3-30B-A3B-GGUF
- GGUF de Unsloth (modelo borrador): https://huggingface.co/unsloth/Qwen3-0.6B-GGUF
