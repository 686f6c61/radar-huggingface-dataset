# ji-farthing/Qwen3.8-27B-NVFP4_KS-GGUF

## Resumen

`ji-farthing/Qwen3.8-27B-NVFP4_KS-GGUF` no es un modelo entrenado, sino un repositorio de validación de cuantizaciones experimentales para `ik_llama.cpp`, el fork de llama.cpp mantenido por Kawrakow. Concretamente, el archivo principal `Qwen3.8-27B-NVFP4_KS.gguf` convierte el checkpoint `nvidia/Qwen3.8-27B-NVFP4` (27.320.698.049 parámetros) al formato propietario `NVFP4_KS` de ik_llama.cpp, preservando los pesos NVFP4 originales sin recuantizar y manteniendo las escalas de activación por tensor.

El interés técnico está en que demuestra cómo cargar pesos NVFP4 nativos (formato de NVIDIA para Blackwell) en un runtime de inferencia abierto, algo que llama.cpp mainline no soporta porque carece del tipo `NVFP4_KS`. El repositorio incluye además una colección de archivos FP8 (E4M3) en distintos layouts (`_KS` y `B128`) de varios checkpoints Qwen3, pensados como material de prueba para los PRs abiertos del proyecto.

Es relevante para desarrolladores que trabajan con GPUs RTX 50 y GB10 y quieren evaluar inferencia de 4 bits con escalas de activación en un stack abierto, pero conviene subrayar que el autor lo describe explícitamente como "not a general-purpose model repository": los ficheros son efímeros y pueden dejar de funcionar con cada build de `ik_llama` main.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (checkpoint base Qwen3.8-27B en precisión mixta ModelOpt; incluye capas SSM según los tensores `ssm_out`) |
| Parametros totales | 27.320.698.049 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4_KS (pesos 4 bits con input scale), Q8_0, BF16, F32; variantes FP8_E4M3_KS y FP8_E4M3_B128 en los ficheros secundarios |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el fichero LFM2.5 del repo usa LFM Open License v1.0) |
| Formato de pesos | GGUF (solo cargable con ik_llama.cpp) |

Composición de tensores del fichero principal: 193 NVFP4_KS, 208 Q8_0, 105 BF16, 553 F32, y 193 input scales. Tamaño total del repo: 418,5 GB.

## Arquitectura y entrenamiento

El modelo subyacente es `nvidia/Qwen3.8-27B-NVFP4` en revisión `482ca0f`, un checkpoint en precisión mixta generado con ModelOpt. La arquitectura es un transformer de Qwen3 con capas de atención y componentes SSM (los tensores `attn_qkv`, `attn_gate` y `ssm_out` aparecen en 46 capas; `attn_q`, `attn_k`, `attn_v` y `attn_output` en 15 capas). No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO: esa información pertenece a la model card del checkpoint original de NVIDIA, no a este repositorio.

La innovación aquí es puramente de formato y tooling, no de entrenamiento. El proceso de conversión tiene dos pasos: primero `convert_hf_to_gguf.py` (llama.cpp `f7591a6`) con `--fp8-as-q8`, porque ik_llama.cpp no tenía tipo FP8 y las capas FP8 del checkpoint se almacenan como Q8_0; después `llama-quantize ... COPY` con ik_llama.cpp en `f415f91`, que escribe cada peso NVFP4 como `NVFP4_KS` sin tocar filas y conserva su `.input_scale`. Las capas MTP no se convierten. En RTX 50 y GB10, `--nvfp4-precision auto` usa las escalas de entrada para activaciones de 4 bits, mientras que `--nvfp4-precision int8` emplea activaciones de 8 bits.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repo).
- Inferencia en 4 bits con escalas de activación por tensor mediante el tipo `NVFP4_KS`.
- Carga por mmap en ik_llama.cpp, con dos modos de precisión de activación (`auto` e `int8`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio, modo thinking ni cobertura multilingüe específica.
- El repositorio incluye además ficheros de validación FP8 para Qwen3-8B, Qwen3-30B-A3B (incluida la variante dynamic de RedHatAI) y LFM2.5-8B-A1B.

## Casos de uso

- Validación de PRs en ik_llama.cpp: el propósito declarado del repositorio es servir como fichero de prueba para los pull requests #2918 y #2919, verificando que la carga de NVFP4_KS y FP8_E4M3 funciona en builds concretos.
- Evaluación de inferencia 4 bits en Blackwell: permite medir perplejidad y comportamiento de un modelo de 27B con pesos NVFP4 nativos y activaciones de 4 u 8 bits en GPUs RTX 50 o GB10.
- Comparación de layouts de cuantización: los pares `_KS` frente a `B128` sobre los mismos checkpoints Qwen3 permiten aislar el efecto del esquema de escalas en calidad y velocidad.
- Reproducción de experimentos de cuantización: los hashes sha256 publicados para cada fichero FP8 facilitan verificar la integridad de los artefactos en pipelines de CI.
- Investigación sobre formatos de pesos: útil para quien estudie cómo mapear checkpoints ModelOpt MIXED_PRECISION a GGUF sin recuantizar.
- Pruebas de regresión del runtime: al ser ficheros que dependen de la build de `ik_llama` main, sirven para detectar roturas de compatibilidad en el parser GGUF y en el kernel NVFP4.

## Benchmarks y rendimiento

El autor publica únicamente perplejidad en wikitext-2 (`wiki.test.raw`, `-c 512 --chunks 8`, en GB10):

| Configuracion | PPL |
|---|---|
| `--nvfp4-precision auto` | 6,7052 ± 0,36538 |
| `--nvfp4-precision int8` | 6,6061 ± 0,35988 |

Además, el autor indica que el fichero guardado con `--kl-divergence-base` (log-probabilidades codificadas) es idéntico al del fichero mainline en ik_llama.cpp con ambas configuraciones. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 27.320 millones de parámetros en pesos de 4 bits, el peso del modelo ronda los 14 GB, más las capas Q8_0, BF16 y F32 y el coste del contexto; el repo completo ocupa 418,5 GB.
- GPU objetivo declaradas por el autor: RTX 50 y GB10 (las que soportan `--nvfp4-precision`).
- En consumer GPU: previsiblemente cabe en GPUs RTX 50 de gama alta por tamaño de pesos, aunque no se aportan cifras de VRAM medidas.
- Despliegue: exclusivamente `ik_llama.cpp` (carga por mmap). No es compatible con llama.cpp mainline, vLLM, TGI ni Ollama, ya que llama.cpp no tiene el tipo `NVFP4_KS`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Este repo (Qwen3.8-27B-NVFP4_KS) | 27,32 B | no disponible | GGUF NVFP4_KS | Apache-2.0 | ik_llama.cpp (build concreta) |
| nvidia/Qwen3.8-27B-NVFP4 (origen) | 27,32 B | no disponible | ModelOpt MIXED_PRECISION | Apache-2.0 | NVIDIA TensorRT / ModelOpt |
| Qwen/Qwen3-30B-A3B-FP8 | 30 B (MoE, activos no disponibles) | no disponible | safetensors FP8 | Apache-2.0 | vLLM, TGI, SGLang |
| Qwen/Qwen3-8B-FP8 | 8 B | no disponible | safetensors FP8 | Apache-2.0 | vLLM, TGI, SGLang |

La diferencia clave frente a los checkpoints originales es el runtime: este repo solo funciona con builds específicas de ik_llama.cpp, mientras que los checkpoints de Qwen y NVIDIA se despliegan en stacks estándar.

## Limitaciones y advertencias

- El autor advierte que los ficheros son experimentales y pueden cambiar o dejar de funcionar sin aviso según la última build de `ik_llama` main.
- No es un repositorio de propósito general: está pensado como material de validación de PRs, no para producción.
- Algunos ficheros solo cargan con un PR abierto (#2918), no con main.
- Solo funciona con ik_llama.cpp; llama.cpp mainline no reconoce el tipo `NVFP4_KS`.
- Los pesos NVFP4 requieren GPUs compatibles (RTX 50, GB10) para el modo de activación de 4 bits; en otras GPUs el comportamiento no está documentado.
- Las capas MTP no se convierten, lo que puede afectar a funcionalidades de decodificación especulativa del checkpoint original.
- La información sobre sesgos, alucinación y cobertura idiomática corresponde al checkpoint Qwen3.8-27B de NVIDIA y no se detalla en este repo.
- Licencia Apache-2.0 para los ficheros Qwen3.8 y Qwen3; el fichero LFM2.5 del repositorio queda bajo LFM Open License v1.0, con restricciones distintas para uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ji-farthing/Qwen3.8-27B-NVFP4_KS-GGUF
- Checkpoint base principal: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4 (revisión `482ca0f3832238542f8f5295dde86b5f22711d80`)
- Checkpoint base secundario: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Checkpoints Qwen3 de referencia: https://huggingface.co/Qwen/Qwen3-8B-FP8, https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8
- Variante dynamic de RedHatAI: https://huggingface.co/RedHatAI/Qwen3-30B-A3B-FP8-dynamic
- Checkpoint LFM2.5: https://huggingface.co/liodon-ai/LFM2.5-8B-A1B-FP8
- Repositorio ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- PR #2918: https://github.com/ikawrakow/ik_llama.cpp/pull/2918
- PR #2919: https://github.com/ikawrakow/ik_llama.cpp/pull/2919
- Commit de conversión del autor: https://github.com/joelfarthing/ik_llama.cpp/commit/f415f9163307507fecb7f4a040fee85132d11114
