# joshycodes/meta-llama-3.1-8b-sorrel-selfloop-mech-low-midtrain

## Resumen

`joshycodes/meta-llama-3.1-8b-sorrel-selfloop-mech-low-midtrain` es un checkpoint de investigación derivado de Meta Llama 3.1 8B (8.030.261.248 parámetros) publicado por el usuario joshycodes como parte de un proyecto de Anthropic Fellows sobre entrenamiento de carácter ("flourishing-framed character training", pitch de Wang y Jermyn, 2026-04-22). No es un modelo instruct ni un lanzamiento de producto: es una etapa intermedia de "midtrain" (continued pretraining) sobre el checkpoint `joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain`, entrenada con el corpus `joshycodes/sorrel-corpus`.

El entrenamiento es extremadamente corto: 921.600 tokens vistos en una única época sobre una GPU NVIDIA H200, con `lr=1e-05`, `seq_len=4096`, `micro_batch=4` y `grad_accum=32`, lo que equivale a menos de dos pasos de optimizador (524.288 tokens por paso) y a unos 0,11 tokens por parámetro. La pérdida registrada en la model card es idéntica al inicio y al final de la etapa (1,0025 → 1,0025).

Su relevancia es puramente experimental: sirve como artefacto reproducible (seed 20260821, commit del launcher `a0afb77669ae`) para estudiar cómo afecta un ajuste mínimo de dominio al comportamiento de un modelo de 8B. La licencia es `other`/`internal-research` y la propia model card indica "Private research artifact — do not redistribute", por lo que no es apto para uso comercial ni para redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama 3.1 (inferida del modelo base; la model card no la describe) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no declarada en la model card; el entrenamiento uso `seq_len` de 4096. El modelo base Meta Llama 3.1 8B soporta 131.072 tokens |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (32,1 GB, coherente con pesos en fp32). Sin GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | `other`, nombre `internal-research` ("Private research artifact — do not redistribute") |
| Formato de pesos | safetensors |
| Autor | joshycodes (proyecto de Anthropic Fellows) |
| Modelo base | joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain (revision `754720c4fbb6`) |
| Dataset | joshycodes/sorrel-corpus, config `sorrel-selfstories-g1-clean-lownll` (revision `d7fc5f616cbf`) |
| Tokens de entrenamiento | 921.600 |
| Hardware de entrenamiento | 1x NVIDIA H200 (RunPod) |
| Fecha de creacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta cambios estructurales, por lo que se asume la arquitectura del modelo base: un transformer decoder-only denso de 8B parámetros con atención agrupada (GQA) y normalización RMSNorm, propio de la familia Llama 3.1. La etapa publicada es un midtrain (continued pretraining auto-regresivo de next-token prediction), no un ajuste instructivo: no hay evidencia de RLHF, DPO ni SFT en la información disponible. Los hiperparámetros son `lr=1e-05`, `seq_len=4096`, `micro_batch=4`, `grad_accum=32`, `epochs=1.0`, con seed 20260821 y lanzador en el commit `a0afb77669ae` del repositorio `flourishing-training`.

Con un batch global de 128 secuencias × 4096 tokens (524.288 tokens por paso de optimizador) y 921.600 tokens totales, la etapa equivale a menos de dos pasos de actualización sobre un corpus de menos de un millón de tokens. La pérdida reportada no cambia (1,0025 → 1,0025), lo que apunta a un efecto nulo o imperceptible sobre los pesos, o bien a un problema de registro de métricas. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, SSM híbrido, etc.); los nombres `selfloop` y `selfstories` sugieren el uso de auto-relatos generados, pero la composición del dataset no se detalla más allá del nombre de la configuración.

## Capacidades

- Generación de texto autoregresiva en el mismo rango de capacidades que su modelo base de 8B; no se publican evaluaciones que confirmen ninguna capacidad concreta.
- Razonamiento básico, matemáticas y generación de código: presumibles por herencia de Llama 3.1 8B, sin datos verificables en la información disponible.
- Tool calling / function calling: no disponible; no procede de un modelo instruct y no hay plantilla de chat ni formato de herramientas documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible ni declarado.
- Capacidades multilingües: no disponibles; la model card no enumera idiomas.
- Capacidades especiales (modo thinking, visión, audio): ninguna declarada.
- Reproducibilidad experimental: el repositorio documenta seed, configuración de entrenamiento y comando de evaluación, lo que permite reproducir y comparar la etapa.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el sufijo `mech-low` y el contexto del proyecto de Anthropic Fellows apuntan a su uso como sujeto de estudio para analizar cambios en representaciones internas tras un ajuste de dominio; su licencia interna y su carácter de artefacto privado lo hacen adecuado para este fin.
- Estudios de character training y alineación: el corpus `sorrel-selfstories-g1-clean-lownll` contiene auto-relatos, de modo que el checkpoint permite medir si menos de un millón de tokens bastan para modificar el tono o el estilo de un modelo de 8B.
- Línea base en barridos de continued pretraining: comparar este checkpoint con `sorrel-atomic-f-300m-midtrain` permite aislar el efecto de la etapa adicional con los mismos hiperparámetros (lr 1e-05, una época).
- Evaluación de olvido catastrófico: ejecutar `uv run eval.py --model joshycodes/meta-llama-3.1-8b-sorrel-selfloop-mech-low-midtrain --eval all` sobre el checkpoint y sobre el modelo base para cuantificar la degradación en tareas generales.
- Prototipado interno de asistentes conversacionales: un denso de 8B con el contexto heredado de Llama 3.1 (131.072 tokens en el modelo base) permite mantener conversaciones multi-turno largas en entornos controlados, siempre que se respete la restricción de no redistribución.
- Generación de texto y código en pipelines internos: puede servirse con vLLM o TGI tras convertir los pesos de fp32 a bf16, integrándose en herramientas internas de documentación o refactorización.
- Auditoría y reproducción de experimentos: los metadatos (seed 20260821, revisiones `754720c4fbb6` y `d7fc5f616cbf`, commit `a0afb77669ae`) permiten replicar la ejecución y verificar el resultado reportado.
- Estudio metodológico de métricas de entrenamiento: la pérdida constante (1,0025 → 1,0025) convierte al checkpoint en un caso útil para depurar pipelines de registro y detección de anomalías en runs de midtrain.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de entrenamiento de la etapa de midtrain (1,0025 → 1,0025) y no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se dispone de datos de latencia o throughput. La búsqueda web asociada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- Pesos en fp32 (32,1 GB en el repositorio): la inferencia exige al menos ~33 GB solo para pesos, más activaciones y caché KV; en la práctica, una GPU de 40 GB (A100 40 GB) o 80 GB (A100/H100 80 GB) es el mínimo razonable.
- Conversión a bf16: reduce los pesos a ~16,1 GB, lo que permite inferencia en GPUs de 24 GB (RTX 3090, RTX 4090, L4 con contexto corto) dejando margen limitado para caché KV.
- Cuantización a int8 (~8 GB) o int4 (~4,5 GB): permitiría ejecución en GPUs de 12-16 GB (RTX 4080, T4), aunque no se publican pesos cuantizados y habría que generarlos.
- Caché KV estimada a partir de la configuración del modelo base (GQA con 8 cabezas KV, 32 capas, dimensión de cabeza 128): ~128 KiB por token en fp16, es decir ~1 GB para 8k tokens, ~4 GB para 32k y ~16 GB para 131k.
- Ejecución en CPU: viable solo tras convertir los pesos a GGUF con llama.cpp; no se publica ningún GGUF en el repositorio.
- Opciones de despliegue: vLLM, TGI, SGLang o Transformers para GPU; llama.cpp u Ollama tras conversión manual a GGUF. El repositorio recomienda `uv run eval.py --model <id> --eval all` para evaluación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (sorrel-selfloop-mech-low-midtrain) | 8,03 B | No declarado (base: 131.072) | other / internal-research | Solo pesos safetensors en fp32, 0 descargas | Artefacto privado, no redistribuible; midtrain de 921.600 tokens; sin benchmarks |
| Meta Llama 3.1 8B (base) | 8,03 B | 131.072 tokens | Llama 3.1 Community License | Pesos abiertos en safetensors, ampliamente usado | Ancestro arquitectónico; el checkpoint derivado no publica comparación con él |
| Meta Llama 3.1 8B Instruct | 8,03 B | 131.072 tokens | Llama 3.1 Community License | Pesos abiertos, formato de chat y tool calling definidos | Añade SFT y RLHF; sí soporta function calling, a diferencia de este artefacto |
| Qwen2.5 7B | 7,6 B | 131.072 tokens | Apache 2.0 | Pesos abiertos, cuantizaciones GGUF/AWQ/GPTQ publicadas | Alternativa de tamaño similar con licencia permisiva y ecosistema de cuantización maduro |
| Mistral 7B v0.3 | 7,2 B | 32.768 tokens | Apache 2.0 | Pesos abiertos, cuantizaciones y plantilla de chat | Menor contexto, licencia permisiva y soporte de despliegue inmediato |

No se dispone de datos de rendimiento comparado para el modelo evaluado; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia `internal-research` con la indicación explícita "do not redistribute": queda prohibida la redistribución y, por extensión, cualquier uso comercial o publicación de los pesos sin autorización del autor.
- No es un modelo instruct: no hay plantilla de chat, seguimiento de instrucciones entrenado ni soporte documentado de tool calling.
- Ausencia total de benchmarks y de evaluaciones de seguridad; cualquier afirmación sobre su calidad es especulativa.
- La pérdida de entrenamiento es idéntica al inicio y al final de la etapa (1,0025 → 1,0025), lo que sugiere un efecto nulo sobre los pesos o un fallo de registro; conviene verificar el checkpoint antes de usarlo como base de otros experimentos.
- Presupuesto de entrenamiento muy reducido (921.600 tokens, menos de dos pasos de optimizador, ~0,11 tokens por parámetro): no cabe esperar una adaptación de dominio sólida ni un cambio de comportamiento fiable.
- Riesgo de olvido catastrófico o de deriva de distribución no cuantificado, dado que el corpora es de dominio específico (auto-relatos) y el ajuste, aunque mínimo, se aplicó sobre un 8B.
- Sesgos desconocidos: el contenido del dataset `sorrel-corpus` no se describe, por lo que no se puede evaluar qué sesgos introduce el dominio de auto-relatos.
- Riesgo de alucinación propio de un modelo de 8B sin ajuste instructivo, sin mitigaciones documentadas.
- Idioma no declarado; se desconoce el comportamiento fuera del inglés (o de los idiomas del corpus, no especificados).
- Cadena de dependencias opaca: el modelo base es a su vez un midtrain previo (`sorrel-atomic-f-300m-midtrain`), de modo que los efectos acumulados de etapas anteriores no están documentados.
- Trazabilidad limitada: la model card referencia commits de un repositorio (`flourishing-training`) sin URL pública en la información disponible.
- 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-selfloop-mech-low-midtrain
- Modelo base: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain
- Dataset: https://huggingface.co/datasets/joshycodes/sorrel-corpus
- Modelo original de la arquitectura: https://huggingface.co/meta-llama/Llama-3.1-8B
- Repositorio `flourishing-training` (commit `a0afb77669ae`): URL no disponible
- `train_run_config.json`: incluido en el repositorio del modelo, sin enlace directo disponible
- Papers, blogs y demos: no disponibles; la búsqueda web no devolvió resultados relevantes sobre este modelo
