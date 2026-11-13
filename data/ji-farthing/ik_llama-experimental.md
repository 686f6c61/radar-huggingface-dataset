# ji-farthing/ik_llama-experimental

## Resumen

`ji-farthing/ik_llama-experimental` es una conversión a GGUF del checkpoint `nvidia/Qwen3.8-27B-NVFP4`, un modelo de lenguaje de 27.320.698.049 parámetros derivado a su vez de `Qwen/Qwen3.8-27B`. El autor del repositorio, ji-farthing, no entrena ni modifica los pesos: lo que hace es reempaquetar los pesos NVFP4 originales en el formato `NVFP4_KS` propio de `ik_llama.cpp`, preservando las escalas de entrada de activación de cada tensor cuantizado. El resultado es un artefacto de inferencia listo para cargar con `ik_llama.cpp`, no con `llama.cpp` de upstream, que carece del tipo `NVFP4_KS`.

La relevancia de este repositorio es fundamentalmente de infraestructura: demuestra un pipeline de conversión que conserva las escalas de activación FP4 a través de `convert_hf_to_gguf.py` y `llama-quantize COPY`, algo que la rama principal de `ik_llama.cpp` todavía no soporta. Para quien despliegue modelos Qwen3.8 en hardware Blackwell (por ejemplo, GB10), este fichero permite ejecutar los pesos NVFP4 originales sin recuantizar, con precisión de activación seleccionable entre 4 y 8 bits.

La licencia es Apache-2.0, heredada del checkpoint de NVIDIA y, en última instancia, del modelo Qwen subyacente. El repositorio ocupa 21,5 GB y acumula 84 descargas y 1 like en el momento de la consulta. No hay información publicada sobre idiomas soportados ni sobre el pipeline de la tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | transformer híbrido con capas SSM (según la presencia de tensores `ssm_out` en 46 capas y atención en 15 capas; detalles completos no disponibles) |
| Parámetros totales | 27.320.698.049 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4_KS (193 tensores), Q8_0 (208 tensores), BF16 (105 tensores), F32 (553 tensores) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tipos `NVFP4_KS`, `Q8_0`, `BF16`, `F32`) |

## Arquitectura y entrenamiento

El checkpoint base es `nvidia/Qwen3.8-27B-NVFP4`, una cuantización NVFP4 de `Qwen/Qwen3.8-27B` realizada con ModelOpt en modo `MIXED_PRECISION`. La estructura que se deduce de los tensores del GGUF indica un transformer híbrido: 46 capas contienen tensores `attn_qkv`, `attn_gate` y `ssm_out`, lo que apunta a bloques con componentes de espacio de estados, mientras que 15 capas contienen `attn_q`, `attn_k`, `attn_v` y `attn_output`, correspondientes a atención clásica. Los pesos NVFP4 del checkpoint se conservan sin recuantizar y cada uno mantiene su escala de entrada de activación.

El proceso de conversión tiene dos etapas documentadas por el autor. Primero, `convert_hf_to_gguf.py` (con el directorio `conversion/` de `llama.cpp` en el commit `f7591a6`) se ejecuta con `--fp8-as-q8`, de modo que las capas FP8 del checkpoint ModelOpt se almacenan como Q8_0 al no existir tipo FP8 en `ik_llama.cpp`. Segundo, `llama-quantize ... COPY` con `ik_llama.cpp` en el commit `f415f91` (rama `filament/nvfp4ks-input-scale-main`, una PR a `ik_llama.cpp`) escribe cada peso NVFP4 como `NVFP4_KS` sin alterar filas y conservando su `.input_scale`. Las capas MTP no se convierten. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre etapas de RLHF o DPO del modelo original.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Inferencia con pesos NVFP4 nativos y escalas de activación preservadas, con precisión de activación seleccionable (`auto` para 4 bits, `int8` para 8 bits).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integración en servicios de inferencia.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en hardware Blackwell con `ik_llama.cpp`: el fichero está pensado para cargarse mediante mmap en GPUs Blackwell (por ejemplo, GB10), donde `--nvfp4-precision auto` aprovecha las escalas de entrada para activaciones de 4 bits. Es el escenario principal y el único validado por el autor.
- Evaluación de precisión de activación: permite comparar en producción el efecto de `--nvfp4-precision auto` frente a `int8` sobre la perplejidad, con la garantía de que el fichero de log-probabilidades generado con `--kl-divergence-base` es idéntico al del fichero mainline en `ik_llama.cpp`.
- Investigación sobre formatos de cuantización: sirve como referencia reproducible de un pipeline que preserva escalas de activación FP4 a través de la conversión a GGUF, útil para quien trabaje en herramientas de cuantización.
- Servicio conversacional autoalojado: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar una API de chat sobre `ik_llama.cpp` con pesos de 4 bits, reduciendo el espacio de almacenamiento frente a un checkpoint BF16 equivalente.
- Reproducción de resultados de perplejidad: el autor documenta la configuración exacta (`wiki.test.raw`, `-c 512 --chunks 8`, GB10) para replicar las cifras de PPL publicadas.
- Base para comparativas de cuantización: al conservar los pesos NVFP4 originales sin recuantizar, el fichero permite aislar el efecto del formato de contenedor (GGUF frente a safetensors) del efecto de la cuantización en sí.

## Benchmarks y rendimiento

El autor publica únicamente perplejidad en wikitext-2 (`wiki.test.raw`, `-c 512 --chunks 8`, hardware GB10):

| Configuración `--nvfp4-precision` | Perplejidad |
|---|---|
| `auto` | 6.7052 ± 0.36538 |
| `int8` | 6.6061 ± 0.35988 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 21,5 GB, lo que da una cota inferior del espacio de pesos en disco y, aproximadamente, de la memoria necesaria para cargar el modelo completo.
- GPU recomendadas: hardware Blackwell, dado que el autor valida el uso de `--nvfp4-precision` en una GB10 y el soporte NVFP4 es específico de esa generación.
- ¿Cabe en GPU de consumo? No disponible; no se documenta compatibilidad con RTX 4090 u otras GPU consumer.
- Opciones de despliegue: exclusivamente `ik_llama.cpp` (el autor indica que `llama.cpp` no tiene el tipo `NVFP4_KS`). No se mencionan vLLM, TGI, Ollama ni otras alternativas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `ji-farthing/ik_llama-experimental` | 27.320.698.049 | no disponible | GGUF (NVFP4_KS + Q8_0 + BF16 + F32) | Apache-2.0 | Solo `ik_llama.cpp`; escalas de activación preservadas |
| `nvidia/Qwen3.8-27B-NVFP4` | 27.320.698.049 (según modelo base) | no disponible | safetensors (ModelOpt MIXED_PRECISION) | Apache-2.0 | Checkpoint de origen; requiere stack NVIDIA |
| `Qwen/Qwen3.8-27B` | 27.320.698.049 (según modelo base) | no disponible | safetensors | Apache-2.0 | Modelo original sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la perplejidad citada.

## Limitaciones y advertencias

- Compatibilidad restringida: el fichero solo carga en `ik_llama.cpp`; `llama.cpp` de upstream no reconoce el tipo `NVFP4_KS`.
- Dependencia de una rama no fusionada: la preservación de escalas de entrada requiere el commit `f415f91` de la rama `filament/nvfp4ks-input-scale-main`; `llama-quantize` en la rama principal de `ik_llama.cpp` no conserva las escalas todavía.
- Las capas MTP no se han convertido, por lo que no se puede usar decodificación especulativa multi-token con este fichero.
- Las capas FP8 del checkpoint original se almacenan como Q8_0, lo que introduce una discrepancia de formato respecto al checkpoint de NVIDIA.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones publicadas al respecto.
- Idiomas soportados: no disponibles, lo que impide garantizar cobertura multilingüe en producción.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del checkpoint de NVIDIA y del modelo Qwen subyacente.
- Repositorio de autor individual con 84 descargas y 1 like: no hay garantía de mantenimiento ni de soporte a largo plazo.
- Las cifras de perplejidad proceden de una única configuración (`-c 512`, 8 chunks) y un único hardware (GB10); no deben extrapolarse a otros contextos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ji-farthing/ik_llama-experimental
- Modelo base NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Revisión concreta del modelo base: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4/tree/482ca0f3832238542f8f5295dde86b5f22711d80
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio `ik_llama.cpp`: https://github.com/ikawrakow/ik_llama.cpp
- Commit de la rama de conversión: https://github.com/joelfarthing/ik_llama.cpp/commit/f415f9163307507fecb7f4a040fee85132d11114
