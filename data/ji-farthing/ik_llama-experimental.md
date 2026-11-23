# ji-farthing/ik_llama-experimental

## Resumen

`ji-farthing/ik_llama-experimental` no es un modelo entrenado, sino un repositorio de validación de cuantizaciones experimentales en formato GGUF para el motor de inferencia [ik_llama.cpp](https://github.com/ikawrakow/ik_llama.cpp). El autor, ji-farthing (joelfarthing en GitHub), publica aquí ficheros que sirven como banco de pruebas para pull requests abiertas del proyecto: tipos de tensor nuevos (`NVFP4_KS`, `F8_E4M3_KS`, `F8_E4M3_B128`) y arquitecturas aún no fusionadas en `main`, como `inkling2_loop`.

El contenido son conversiones de pesos de terceros, principalmente de la familia Qwen3 (Qwen3-8B-FP8, Qwen3-30B-A3B-FP8 y sus variantes de NVIDIA y Red Hat AI), además de un modelo de Thinking Machines (Inkling-2-Mini) y un LFM2.5-8B-A1B de liodon-ai. La conversión no reentrena ni recalibra: reempaqueta los pesos originales en los layouts que ik_llama.cpp necesita para validar sus kernels de cuantización en GPU Blackwell (RTX 50, GB10).

Es relevante ahora porque documenta de forma reproducible cómo se mueven pesos FP8 y NVFP4 de safetensors a GGUF sin pérdida de las escalas de activación, algo crítico para el despliegue de modelos MoE grandes en hardware consumer de nueva generación. La licencia declarada es Apache 2.0, heredada del modelo base Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de cuantizaciones; los pesos subyacentes son transformer de Qwen3, LFM2.5 e Inkling 2) |
| Parametros totales | 27.320.698.049 (dato safetensors del repo; corresponde al mayor de los checkpoints incluidos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4_KS, Q8_0, F8_E4M3_KS, F8_E4M3_B128, BF16, F32, IQ4_KS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo como origen de la conversion) |

## Arquitectura y entrenamiento

No hay entrenamiento propio. Cada fichero es una conversión de un checkpoint publicado por terceros, realizada con `convert_hf_to_gguf.py` (versión de llama.cpp `f7591a6`) y posteriormente reempaquetada con `llama-quantize ... COPY` de ik_llama.cpp en el commit `f415f91`. En el caso de Qwen3.8-27B-NVFP4, el checkpoint original es ModelOpt `MIXED_PRECISION`; como ik_llama.cpp no tenía tipo FP8, las capas FP8 se almacenan como Q8_0 (`attn_qkv`, `attn_gate`, `ssm_out` en 46 capas; `attn_q/k/v/output` en 15 capas), mientras que los pesos NVFP4 se copian sin recuantizar y conservan su `.input_scale`.

El fichero resultante contiene 193 tensores NVFP4_KS, 208 Q8_0, 105 BF16, 553 F32 y 193 escalas de entrada. Las capas MTP no se convierten. La innovación técnica que se valida es el soporte de activaciones de 4 bits con escalas por bloque (`--nvfp4-precision auto`) frente a activaciones de 8 bits (`--nvfp4-precision int8`) en GPUs Blackwell, además del nuevo tipo de arquitectura `inkling2_loop` de la PR #2967, con expertos NVFP4_KS en capas 0-19 y F8_E4M3_B128 en capas 20-23.

## Capacidades

- El repositorio no implementa capacidades propias: las capacidades efectivas son las del modelo base de cada fichero (Qwen3, LFM2.5, Inkling 2).
- Inferencia de texto conversacional (tag `conversational` en el repo).
- Validación de kernels de cuantización NVFP4 y FP8 E4M3 en ik_llama.cpp.
- Carga por mmap de ficheros GGUF con escalas de activación preservadas.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de decodificación especulativa vía cabecera MTP en `Qwen3.8-Flash-Next-NVFP4_KS-F8.gguf` (tipo `F8_E4M3_B128`).
- No se documentan tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Validación de PRs de ik_llama.cpp: cargar estos GGUF en la rama correspondiente para comprobar que los kernels `NVFP4_KS` y `F8_E4M3_*` producen resultados correctos antes de fusionar cambios en `main`.
- Pruebas de regresión de cuantización: comparar la perplejidad en wikitext-2 (`wiki.test.raw`, `-c 512 --chunks 8`) entre el fichero convertido y el original de mainline usando el volcado de `--kl-divergence-base`.
- Benchmark de precisión de activaciones: alternar `--nvfp4-precision auto` e `int8` para medir el impacto en calidad (6,7052 frente a 6,6061 de PPL en GB10) y en velocidad en RTX 50 o GB10.
- Desarrollo de soporte para arquitecturas nuevas: usar `inkling2/Inkling-2-Mini-NVFP4-FP8B128.gguf` como caso de prueba del cargador `inkling2_loop` mientras la PR #2967 no se fusiona.
- Evaluación de empaquetado FP8 en GGUF: probar los layouts `F8_E4M3_KS` y `F8_E4M3_B128` con checkpoints Qwen3-8B y Qwen3-30B-A3B para decidir qué esquema de bloque conviene en producción.
- Reproducción de conversiones: servir de referencia verificable (hashes sha256 publicados) para que otros equipos reproduzcan el pipeline `convert_hf_to_gguf.py` + `llama-quantize COPY` sobre sus propios checkpoints.

## Benchmarks y rendimiento

| Metrica | Configuracion | Resultado |
|---|---|---|
| Perplejidad wikitext-2 | `Qwen3.8-27B-NVFP4_KS.gguf`, `--nvfp4-precision auto`, GB10 | 6,7052 ± 0,36538 |
| Perplejidad wikitext-2 | `Qwen3.8-27B-NVFP4_KS.gguf`, `--nvfp4-precision int8`, GB10 | 6,6061 ± 0,35988 |
| Divergencia KL | fichero convertido frente a mainline en ik_llama.cpp | idéntica (volcado de log-probabilidades) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 460,5 GB en total y el checkpoint mayor declara 27.320.698.049 parámetros, por lo que en NVFP4 se sitúa en torno a 14-16 GB de pesos más overhead de contexto y caché KV.
- GPU validadas por el autor: RTX 50 (Blackwell) y GB10 para las rutas `NVFP4_KS` con `--nvfp4-precision auto` o `int8`.
- GPU recomendadas: no disponibles para otros modelos; el uso de `NVFP4_KS` requiere hardware con soporte de FP4.
- Cabe en GPU consumer: sí para los ficheros de 8B en FP8/IQ4_KS; los de 27B-30B dependen de la VRAM y del backend.
- Despliegue: exclusivamente ik_llama.cpp; los ficheros NVFP4_KS no cargan en llama.cpp (no existe el tipo `NVFP4_KS`). Algunos ficheros requieren la PR #2918 o la PR #2967 abiertas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ji-farthing/ik_llama-experimental | 27,3 B (mayor checkpoint) | no disponible | GGUF (NVFP4_KS, F8_E4M3_*, Q8_0, IQ4_KS) | Apache 2.0 | Repo de validación, no modelo entrenado; solo ik_llama.cpp |
| Qwen/Qwen3-30B-A3B-FP8 | 30 B (MoE) | no disponible | safetensors FP8 | Apache 2.0 | Origen de dos ficheros del repo; cargable en vLLM/SGLang |
| nvidia/Qwen3.8-27B-NVFP4 | 27 B | no disponible | safetensors NVFP4 | no disponible | Origen del fichero principal; pensado para TensorRT-LLM |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | safetensors | no disponible | Origen de los ficheros `inkling2/`; arquitectura `inkling2_loop` |

## Limitaciones y advertencias

- El propio autor advierte que los ficheros son experimentales y pueden dejar de funcionar sin aviso con nuevas builds de `ik_llama` main.
- No es un repositorio de propósito general: no debe usarse como modelo de producción.
- Algunos ficheros solo cargan con ramas de PR abiertas (#2918, #2967); si la revisión cambia nombres de claves GGUF, los ficheros se reemplazan.
- Los ficheros NVFP4_KS no son compatibles con llama.cpp estándar.
- Las capas MTP no se convierten en `Qwen3.8-27B-NVFP4_KS.gguf`.
- No hay información sobre sesgos, alucinación o cobertura idiomática de los modelos base en la documentación disponible.
- La licencia Apache 2.0 se hereda del modelo base; conviene verificar la licencia del checkpoint original de cada fichero antes de uso comercial.
- El tamaño del repo (460,5 GB) implica costes de almacenamiento y descarga considerables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ji-farthing/ik_llama-experimental
- Motor ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- PR #2918 (tipos FP8 E4M3): https://github.com/ikawrakow/ik_llama.cpp/pull/2918
- PR #2919 (conversor asociado): https://github.com/ikawrakow/ik_llama.cpp/pull/2919
- PR #2967 (Inkling 2 Mini, `inkling2_loop`): https://github.com/ikawrakow/ik_llama.cpp/pull/2967
- Commit de conversión: https://github.com/joelfarthing/ik_llama.cpp/commit/f415f9163307507fecb7f4a040fee85132d11114
- Modelo base nvidia/Qwen3.8-27B-NVFP4: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Modelo base nvidia/Qwen3.8-Flash-Next-NVFP4: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo base nvidia/Qwen3-8B-FP8: https://huggingface.co/nvidia/Qwen3-8B-FP8
- Modelo base Qwen/Qwen3-8B-FP8: https://huggingface.co/Qwen/Qwen3-8B-FP8
- Modelo base RedHatAI/Qwen3-30B-A3B-FP8-dynamic: https://huggingface.co/RedHatAI/Qwen3-30B-A3B-FP8-dynamic
- Modelo base Qwen/Qwen3-30B-A3B-FP8: https://huggingface.co/Qwen/Qwen3-30B-A3B-FP8
- Modelo base liodon-ai/LFM2.5-8B-A1B-FP8: https://huggingface.co/liodon-ai/LFM2.5-8B-A1B-FP8
- Modelo base thinkingmachines/Inkling-2-Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
