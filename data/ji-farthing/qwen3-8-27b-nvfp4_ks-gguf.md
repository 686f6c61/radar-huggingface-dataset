# ji-farthing/Qwen3.8-27B-NVFP4_KS-GGUF

## Resumen

`ji-farthing/Qwen3.8-27B-NVFP4_KS-GGUF` es un repositorio de validación técnica, no un modelo entrenado por su autor. Contiene conversiones al formato GGUF de `ik_llama.cpp` de varios checkpoints ajenos, siendo el artefacto principal `Qwen3.8-27B-NVFP4_KS.gguf`, derivado de `nvidia/Qwen3.8-27B-NVFP4` en la revisión `482ca0f`. El objetivo es servir como material de prueba para pull requests del fork `ik_llama.cpp` de ikawrakow, que incorpora tipos de cuantización propios (NVFP4_KS, F8_E4M3_KS, IQ4_KS) no presentes en llama.cpp mainline.

El modelo subyacente es un Qwen3.8 de 27.320.698.049 parámetros (dato real de safetensors), con una arquitectura híbrida que combina capas de atención y capas SSM (state space model), según se deduce de la presencia de tensores `ssm_out` en 46 capas y `attn_*` en 15 capas. El checkpoint original de NVIDIA emplea precisión mixta ModelOpt, con pesos en NVFP4 y capas en FP8.

La relevancia de este repositorio es acotada pero específica: permite validar la fidelidad numérica de la conversión NVFP4 a NVFP4_KS en ik_llama.cpp, con una perplexity medida en wikitext-2 de 6,7052 ± 0,36538 (modo `auto`) y 6,6061 ± 0,35988 (modo `int8`) sobre GB10, y un fichero de log-probabilidades idéntico al del modelo mainline. No es un repositorio de propósito general y sus ficheros pueden dejar de funcionar sin aviso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de atención y capas SSM (state space model); checkpoint base ModelOpt MIXED_PRECISION |
| Parametros totales | 27.320.698.049 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4_KS (193 tensores), Q8_0 (208 tensores), BF16 (105 tensores), F32 (553 tensores); variante FP8 con F8_E4M3_KS y F8_E4M3_B128 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (solo cargable con ik_llama.cpp; llama.cpp mainline no soporta NVFP4_KS) |

## Arquitectura y entrenamiento

El checkpoint base `nvidia/Qwen3.8-27B-NVFP4` es un modelo de 27.320 millones de parámetros con arquitectura híbrida: 46 capas contienen tensores `attn_qkv`, `attn_gate` y `ssm_out`, mientras que 15 capas contienen `attn_q`, `attn_k`, `attn_v` y `attn_output`. Esta distribución indica una combinación de bloques de atención completa con bloques SSM, un patrón similar a las arquitecturas híbridas tipo Mamba-Transformer. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada.

La conversión realizada por ji-farthing no reentrena ni recalibra: parte del checkpoint ModelOpt en precisión mixta, ejecuta `convert_hf_to_gguf.py` con `--fp8-as-q8` (porque ik_llama.cpp no tenía tipo FP8 en ese momento) y después aplica `llama-quantize ... COPY` con ik_llama.cpp en el commit `f415f91`, que reescribe cada peso NVFP4 como NVFP4_KS conservando sus filas y su `.input_scale`. Las capas MTP (multi-token prediction) no se convierten. El resultado preserva los pesos NVFP4 originales sin recuantizar y mantiene las escalas de activación por tensor.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio y la pipeline declarada.
- Razonamiento y matemáticas: capacidades heredadas del checkpoint Qwen3.8 base, no documentadas de forma específica en este repositorio.
- Generación de código: presumible en la familia Qwen3, sin datos de validación publicados aquí.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío).
- Modo thinking: no documentado.
- Inferencia con precisión NVFP4 de activaciones en GPU Blackwell (RTX 50, GB10) mediante `--nvfp4-precision auto`, o con activaciones int8 mediante `--nvfp4-precision int8`.
- Carga por mmap en ik_llama.cpp.

## Casos de uso

- Validación de pull requests de ik_llama.cpp: el escenario principal del repositorio. Un desarrollador del fork carga `Qwen3.8-27B-NVFP4_KS.gguf` con la build correspondiente y compara la salida de log-probabilidades contra el fichero mainline para confirmar que la conversión NVFP4_KS es numéricamente equivalente.
- Medición de perplexity en wikitext-2: reproducible con `-c 512 --chunks 8` sobre GB10, útil para detectar regresiones de calidad tras cambios en el kernel NVFP4 o en el manejo de escalas de activación.
- Pruebas de inferencia en GPU Blackwell: permite ejercitar la ruta de activaciones de 4 bits con `--nvfp4-precision auto` en RTX 50 y GB10, un camino que llama.cpp mainline no soporta.
- Comparación de modos de precisión de activación: el par de valores de PPL (6,7052 en `auto` frente a 6,6061 en `int8`) sirve para evaluar el compromiso entre velocidad y fidelidad en despliegues con NVFP4.
- Desarrollo de kernels de cuantización: los 193 tensores NVFP4_KS con sus 193 input scales constituyen un conjunto de prueba representativo para implementar y depurar kernels de 4 bits en hardware Blackwell.
- Evaluación de conversión FP8 a GGUF: los ficheros de `fp8/` (Qwen3-8B, Qwen3-30B-A3B, LFM2.5-8B-A1B) permiten validar los tipos `F8_E4M3_KS` y `F8_E4M3_B128` en el PR #2918.
- Pruebas de arquitectura híbrida SSM: los tensores `ssm_out` en 46 capas permiten verificar el soporte de bloques de espacio de estados en ik_llama.cpp.

## Benchmarks y rendimiento

| Modelo / configuración | Benchmark | Resultado |
|---|---|---|
| Qwen3.8-27B-NVFP4_KS, `--nvfp4-precision auto` | Perplexity wikitext-2 (wiki.test.raw, `-c 512 --chunks 8`, GB10) | 6,7052 ± 0,36538 |
| Qwen3.8-27B-NVFP4_KS, `--nvfp4-precision int8` | Perplexity wikitext-2 (misma configuración) | 6,6061 ± 0,35988 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible. El autor únicamente reporta que el fichero de divergencia KL guardado con `--kl-divergence-base` es idéntico al del modelo mainline en ik_llama.cpp, lo que confirma equivalencia numérica de la conversión, no calidad del modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 27.320 millones de parámetros, los pesos NVFP4 ocupan aproximadamente 13,7 GB, a los que hay que sumar los 208 tensores Q8_0 y los 105 BF16 y 553 F32, además del KV cache. El tamaño total del repositorio es de 460,5 GB, aunque incluye múltiples ficheros.
- GPU recomendadas: RTX 50 (Blackwell) y GB10 son las plataformas citadas por el autor para usar `--nvfp4-precision auto` con escalas de entrada. En otras GPU la ruta NVFP4 no está validada en la documentación.
- Cabe en GPU consumer: sí, previsiblemente en RTX 5090 y modelos Blackwell de gama alta, dado el tamaño de pesos en 4 bits; no confirmado por el autor.
- Opciones de despliegue: exclusivamente ik_llama.cpp (builds con soporte NVFP4_KS; algunos ficheros FP8 requieren el PR #2918 y el convertidor #2919). llama.cpp mainline no puede cargar estos ficheros. vLLM, TGI y Ollama no están soportados según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVFP4_KS (este repo) | 27,32 B | no disponible | NVFP4_KS + Q8_0 + BF16 + F32 | Apache 2.0 | GGUF solo para ik_llama.cpp |
| nvidia/Qwen3.8-27B-NVFP4 (base) | 27,32 B | no disponible | NVFP4 (ModelOpt mixed precision) | no disponible en la información | Pesos originales NVIDIA |
| Qwen/Qwen3-30B-A3B-FP8 | 30 B (MoE, ~3 B activos) | no disponible | FP8 | Apache 2.0 | safetensors y GGUF (F8_E4M3_B128 en este repo) |
| Qwen/Qwen3-8B-FP8 | 8 B | no disponible | FP8 | Apache 2.0 | safetensors y GGUF (F8_E4M3_B128 en este repo) |

La comparación directa con el checkpoint NVIDIA es la más relevante: este repositorio reproduce los pesos NVFP4 originales sin recuantizar, por lo que la diferencia se limita al contenedor GGUF y al esquema de escalas. Frente a los Qwen3 en FP8, el modelo de 27 B ofrece el doble o triple de parámetros a costa de requerir hardware Blackwell para aprovechar la ruta NVFP4.

## Limitaciones y advertencias

- Repositorio experimental: el autor advierte explícitamente de que los ficheros pueden cambiar o dejar de funcionar sin aviso según la build de `ik_llama` main.
- Compatibilidad restringida: los ficheros NVFP4_KS solo cargan con ik_llama.cpp; llama.cpp mainline carece del tipo NVFP4_KS. Varios ficheros FP8 requieren el PR #2918 abierto.
- No es un repositorio de propósito general: el propio autor lo declara material de validación, no un modelo listo para producción.
- Idiomas no declarados: el campo de idiomas está vacío, por lo que no hay garantía documentada de cobertura multilingüe.
- Contexto no documentado: se desconoce la ventana máxima soportada en esta conversión.
- Capas MTP no convertidas: se pierde la funcionalidad de multi-token prediction del checkpoint original.
- Conversión FP8 a Q8_0: las capas FP8 del checkpoint ModelOpt se almacenan como Q8_0, lo que introduce una discrepancia de formato respecto al original (aunque la equivalencia numérica se verificó por divergencia KL).
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; son heredados del checkpoint Qwen3.8 base y de sus datos de entrenamiento, no documentados aquí.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero la cadena de licencias del checkpoint NVIDIA subyacente no se detalla en la información proporcionada y conviene verificarla antes de un despliegue comercial.
- Sin benchmarks de capacidad: no hay datos de MMLU, HumanEval ni GSM8K que permitan estimar la calidad real del modelo en tareas downstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ji-farthing/Qwen3.8-27B-NVFP4_KS-GGUF
- Modelo base principal: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Revisión del checkpoint base: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4/tree/482ca0f3832238542f8f5295dde86b5f22711d80
- Modelo base alternativo: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo base FP8: https://huggingface.co/nvidia/Qwen3-8B-FP8
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3-8B-FP8
- Modelo base FP8 dinámico: https://huggingface.co/RedHatAI/Qwen3-30B-A3B-FP8-dynamic
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8
- Modelo base FP8: https://huggingface.co/liodon-ai/LFM2.5-8B-A1B-FP8
- Modelo base Inkling 2 Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- PR #2918 (tipos FP8): https://github.com/ikawrakow/ik_llama.cpp/pull/2918
- PR #2919 (convertidor): https://github.com/ikawrakow/ik_llama.cpp/pull/2919
- PR #2967 (Inkling 2 Mini): https://github.com/ikawrakow/ik_llama.cpp/pull/2967
- Commit de cuantización: https://github.com/joelfarthing/ik_llama.cpp/commit/f415f9163307507fecb7f4a040fee85132d11114
