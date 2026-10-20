# efficiencyx/Jun-LoRA-12B-Safetensor-INT8

## Resumen

Jun-12B INT8 (v8) es una build cuantizada a INT8 del fine-tune Jun v8 sobre Gemma 4 12B, publicada por el usuario efficiencyx. No es un modelo nuevo: es el mismo modelo que `efficiencyx/Jun-LoRA-12B-Safetensor` (bf16) convertido con llm-compressor al esquema W8A8 de compressed-tensors, con el objetivo explicito de que quepa en un TPU v5e-1 de 16 GB, donde los pesos en bf16 (22,3 GiB) no entran. Los pesos INT8 ocupan 12,1 GiB. Se trata de un fine-tune de tipo LoRA orientado a personaje y roleplay (tags `character`, `roleplay`, `MDRG`, `Factorial-Omega`) sobre la arquitectura `gemma4_unified`, con 11.959.730.224 parametros reales segun los safetensors.

El modelo conserva la estructura multimodal de la base: los embedders de vision y audio se mantienen en bf16 y `config.json` incluye `vision_config.num_soft_tokens = 280`, aunque el autor indica que el serving puramente de texto no usa ese campo. El pipeline declarado en HuggingFace es `text-generation` y el unico idioma soportado es ingles.

Su relevancia practica es de despliegue, no de investigacion: demuestra un caso concreto de servir un modelo de ~12B en hardware de 16 GB (TPU v5e-1 en Colab) con vLLM, a 40-50 tokens/s y con un prompt de 5.341 tokens procesado sin agotar memoria. No hay benchmarks publicados ni mediciones de perplexity o divergencia KL frente a la version bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` (transformer multimodal de la familia Gemma 4; embedders de vision y audio presentes) |
| Parametros totales | 11.959.730.224 (~11,96 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; la build se ha servido con `--max-model-len 6144` y ha procesado un prompt de 5.341 tokens |
| Tipos de cuantizacion | INT8 W8A8 en esta build (pesos int8 por canal de salida, simetrico min-max; activaciones int8 por token en runtime). La familia incluye tambien bf16 y GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors); existen variantes GGUF en otros repos de la familia |

## Arquitectura y entrenamiento

La arquitectura de base es `gemma4_unified`, un transformer multimodal de ~12B parametros. El proceso de cuantizacion afecta a todas las capas lineales del modelo de lenguaje, que pasan a int8; quedan en bf16 el `lm_head` (atado a los embeddings), los embeddings y el embedder de entrada de vision y audio. El esquema es W8A8: pesos int8 simetricos min-max por canal de salida y activaciones int8 por token calculadas en tiempo de ejecucion, sin necesidad de datos de calibracion.

Sobre el entrenamiento del fine-tune Jun v8 no hay informacion disponible en la documentacion proporcionada: no se indican tokens de entrenamiento, composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. El nombre y los tags sugieren un ajuste LoRA sobre datos de personaje y roleplay, pero no se detalla su contenido ni el proceso. La innovacion tecnica documentada es exclusivamente la cuantizacion y su integracion con vLLM sobre TPU: el campo `vision_config.num_soft_tokens = 280` se anade a `config.json` porque `gemma4_unified` en vLLM 0.30 lo lee y ninguna version de transformers lo define; corresponde al presupuesto de tokens de imagen de `processor_config.json` y no se usa en serving de solo texto.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis declarado en personaje y roleplay (interaccion multi-turno manteniendo una persona).
- Escritura creativa y narrativa: el fine-tune esta orientado a mantener voz y estilo de personaje a lo largo de la conversacion.
- Procesamiento de prompts largos: se ha verificado un prompt de 5.341 tokens en un TPU v5e-1 sin agotar memoria.
- Capacidad multimodal potencial heredada de la base (embedders de vision y audio preservados en bf16, `num_soft_tokens = 280`), aunque no se documenta ninguna evaluacion de vision o audio en esta build.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Multilingue: no; solo ingles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Despliegue de un modelo de rol en hardware de 16 GB: la build INT8 permite servir Jun v8 en un TPU v5e-1 con vLLM, un escenario en el que los pesos bf16 (22,3 GiB) directamente no caben. Util para demos y prototipos en Colab.
- Chatbot de personaje en producto: con la licencia apache-2.0 y un peso de 12,1 GiB, se puede integrar como backend conversacional de un asistente con personalidad fija, servido con vLLM.
- Generacion de dialogos para videojuegos: NPCs con voz consistente, aprovechando que el modelo esta ajustado para mantener personaje en conversaciones multi-turno en ingles.
- Escritura asistida de ficcion interactiva: continuacion de escenas yroleplay literario con contexto de varios miles de tokens (hasta 6.144 en la configuracion probada).
- Base para fine-tunes derivados: al ser apache-2.0 y estar disponible en bf16, GGUF e INT8, sirve como punto de partida para ajustes adicionales manteniendo una ruta de despliegue ya validada.
- Evaluacion comparativa de cuantizacion: util como caso de estudio de W8A8 sin calibracion sobre hardware limitado, midiendo throughput y deriva de salida frente al build bf16.
- Inferencia en CPU o equipos sin GPU mediante la variante GGUF con llama.cpp u Ollama, para entornos de desarrollo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha medido perplexity ni divergencia KL para esta build.

La unica comprobacion documentada es cualitativa: en una ejecucion greedy con el mismo prompt, el build bf16 y el INT8 producen la misma primera frase y media de forma identica palabra por palabra, y despues divergen ligeramente. El propio autor lo califica de spot check, no de benchmark.

| Metrica | Valor | Notas |
|---|---|---|
| Throughput de generacion | 40-50 tokens/s | Medido en TPU v5e-1 (Colab) con vLLM `vllm-tpu==0.30.0` |
| Tiempo de carga y compilacion | ~12 minutos | TPU v5e-1 |
| Prompt maximo verificado | 5.341 tokens | Sin agotar memoria |
| Perplexity / KL divergence | no disponible | No medidas por el autor |
| MMLU / HumanEval / GSM8K | no disponible | Sin datos publicados |

## Requisitos de hardware

- Pesos INT8: 12,1 GiB. Pesos bf16 equivalentes: 22,3 GiB.
- Hardware verificado: TPU v5e-1 de 16 GB con vLLM (`vllm-tpu==0.30.0`), usando `--max-model-len 6144 --gpu-memory-utilization 0.985 --kv-cache-dtype fp8 --max-num-seqs 4`.
- Presupuesto de memoria en ese escenario: 12,1 GiB de pesos + 1,03 GiB de cache KV en fp8 para 6.144 tokens + sampler para cuatro secuencias en paralelo.
- GPU: no hay pruebas publicadas en GPU. Como estimacion a partir del tamano de pesos, 12,1 GiB mas overhead de runtime encajan con dificultad en 16 GB (RTX 4060 Ti 16 GB, RTX 4080 con margen escaso) y con holgura en 24 GB (RTX 4090, L4 24 GB, A10G 24 GB); esta estimacion no esta validada por el autor.
- Opciones de despliegue: vLLM (principal, con soporte TPU y GPU), llama.cpp u Ollama mediante el repo GGUF de la familia, y transformers como libreria declarada.
- Latencia y throughput: 40-50 tokens/s en TPU v5e-1. No hay datos de latencia en GPU ni de throughput con lotes mayores.
- Para reducir restricciones de memoria basta con relajar los flags (`--max-model-len`, `--gpu-memory-utilization`, `--max-num-seqs`) cuando se dispone de mas memoria.

## Comparativa con modelos similares

No hay benchmarks publicados de este modelo ni de sus alternativas directas en la informacion disponible, por lo que la comparacion se limita a formato, tamano y licencia dentro de la misma familia.

| Modelo | Parametros | Formato / precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jun-12B-Safetensor-INT8 (este) | 11,96B | safetensors, INT8 W8A8 | no disponible (servido a 6.144) | apache-2.0 | HuggingFace, pensado para vLLM en TPU v5e-1 |
| Jun-12B-Safetensor (bf16) | 11,96B (mismo modelo) | safetensors, bf16 (22,3 GiB) | no disponible | apache-2.0 | HuggingFace, requiere TPU v6e-1 o superior |
| Jun-12B-GGUF | 11,96B (mismo modelo) | GGUF | no disponible | apache-2.0 | HuggingFace, para llama.cpp y Ollama |
| Jun-12B-Safetensor-v7 | no disponible | safetensors, bf16 | no disponible | apache-2.0 | HuggingFace, generacion anterior |
| Otros modelos de rol de ~12B | no disponible | no disponible | no disponible | no disponible | Sin datos comparativos publicados en la informacion disponible |

## Limitaciones y advertencias

- Solo ingles: el modelo declara `language: en`; no hay evidencia de calidad en castellano ni en otros idiomas.
- Ausencia total de evaluacion cuantitativa: no hay perplexity, KL divergence, MMLU ni ninguna metrica estandar. La unica validacion es un spot check de una frase y media en decodificacion greedy.
- Riesgo de alucinacion: inherente a un modelo de 12B orientado a roleplay y sin datos de alineacion publicados; no se documenta ningun proceso de RLHF o DPO.
- Deriva respecto a bf16: la cuantizacion W8A8 produce divergencia en la salida a partir de la primera frase y media; en usos donde la fidelidad exacta al modelo original sea critica, debe usarse la build bf16.
- Sesgos: no disponibles. El autor no documenta evaluacion de sesgos ni composicion del dataset de entrenamiento.
- Contexto no documentado: la longitud de contexto nativa del modelo no se indica; la configuracion probada limita a 6.144 tokens y no hay garantia de comportamiento mas alla.
- Capacidades multimodales sin validar: aunque la arquitectura conserva embedders de vision y audio, no se documenta ninguna prueba de imagen o audio en esta build, y el autor indica que el serving de solo texto no usa `num_soft_tokens`.
- Dependencia de version: requiere `gemma4_unified` en vLLM 0.30 y un campo (`vision_config.num_soft_tokens`) que ninguna version de transformers define; esto puede romper la carga en otros runtimes.
- Licencia: apache-2.0 permite uso comercial, pero debe verificarse que los terminos del modelo base Gemma 4 no impongan restricciones adicionales, algo que no se detalla en la informacion disponible.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; repositorio creado y actualizado el 2026-10-19, sin comunidad ni issues documentados.

## Enlaces

- Modelo en HuggingFace (esta build): https://huggingface.co/efficiencyx/Jun-LoRA-12B-Safetensor-INT8
- Modelo base bf16 v8: https://huggingface.co/efficiencyx/Jun-LoRA-12B-Safetensor
- Variante GGUF: https://huggingface.co/efficiencyx/Jun-LoRA-12B-GGUF
- Generacion anterior v7: https://huggingface.co/efficiencyx/Jun-LoRA-12B-Safetensor-v7
- Repositorio JunOS (notebook de Colab): https://github.com/efficiencyx/JunOS
- llm-compressor (herramienta de cuantizacion): https://github.com/vllm-project/llm-compressor
