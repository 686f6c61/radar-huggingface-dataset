# FangZhang5959/Melody1437-27B-NVFP4-MTP-text-only

## Resumen

Melody1437-27B-NVFP4-MTP-text-only es una versión cuantizada del modelo de rol conversacional Melody1437-27B-v0.3, un ajuste fino de rol (RP) sobre el底座 Qwen3.6-27B. El autor del repositorio, FangZhang5959, no entrena nada nuevo: reempaqueta los pesos del modelo original en precisión mixta NVFP4 (4 bits) y FP8 (8 bits) para reducirlos de unos 54 GB en bf16 a 21,6 GB, de forma que el modelo quepa en dos GPU de 22 GB o en una sola de 24 GB con baja concurrencia.

La particularidad técnica del repositorio es que recupera la capa MTP (multi-token prediction) del modelo original, que el flujo estándar de `llm-compressor` cuantiza junto con el resto de capas auxiliares y deja inservible para decodificación especulativa. Aquí se excluye de la cuantización, se extrae a un fichero `model_mtp.safetensors` independiente y se enlaza mediante el índice de safetensors. Con ello se habilita decodificación especulativa en vLLM, con una longitud media de aceptación declarada de 4,63 sobre 5.

El modelo es exclusivamente de texto: la torre visual del modelo base se ha eliminado, por lo que la arquitectura pasa de `Qwen3_5ForConditionalGeneration` a `Qwen3_5ForCausalLM`. Solo soporta inglés y chino, y la licencia Apache-2.0 del repositorio queda condicionada por los términos adicionales del autor del ajuste fino, que restringen el uso a personal, no comercial y para mayores de 18 años.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5_text` (`Qwen3_5ForCausalLM`), con atención completa y ramas de atención lineal (`linear_attn`), más 1 capa MTP (`mtp_num_hidden_layers: 1`) |
| Parametros totales | 27B (según denominación del modelo y del base Qwen3.6-27B) |
| Parametros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | 262.144 tokens (262K) en configuración; 229.376 (224K) es el `max_model_len` validado en el despliegue descrito |
| Tipos de cuantizacion | Mixta: NVFP4 4-bit (`nvfp4-pack-quantized`, group_size 16, escalas `float8_e4m3fn`, activaciones static-minmax) y FP8 W8A8 (`float-quantized`, peso per-channel simétrico, activación per-token dinámica) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 con términos adicionales del upstream: solo uso personal, prohibido uso comercial o con ánimo de lucro, 18+ |
| Formato de pesos | `safetensors` con `compressed-tensors`; índice `model.safetensors.index.json` más `model_mtp.safetensors` (15 tensores, 849 MB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27B con atención híbrida: bloques de atención completa (`self_attn.{q,k,v,o}_proj`) combinados con bloques de atención lineal (`linear_attn.{in_proj_qkv,in_proj_z,out_proj}`). Sobre esa arquitectura, el ajuste fino original de ReadyArt especializa el modelo en conversación y roleplay. Este repositorio no aporta entrenamiento nuevo: es una recompresión de los pesos existentes.

La receta de cuantización se ejecutó con `llm-compressor` (`QuantizationModifier`) en una sola pasada. Las proyecciones de atención, `lm_head` y las MLP de las capas 56 a 63 se mantienen en 8 bits; el resto de MLP va en NVFP4 de 4 bits con group_size 16. El autor justifica la asimetría: las ramas de atención lineal degradan de forma notable en 4 bits, y mantener las últimas 8 capas MLP en 8 bits limita la pérdida de calidad en la salida. La innovación operativa es el tratamiento de la capa MTP: se excluye del proceso mediante `ignore: ["re:.*mtp.*", "re:.*visual.*"]`, se extrae sin tocar del upstream y se referencia desde el índice, de modo que la decodificación especulativa sigue funcionando tras la cuantización.

## Capacidades

- Generación de texto conversacional multi-turno, con especialización declarada en roleplay y diálogo de personajes.
- Modo de razonamiento (thinking) activado por defecto mediante el chat template: solo existe el conmutador `enable_thinking`, sin parámetro de presupuesto de pensamiento ni límite superior.
- Decodificación especulativa con la capa MTP (hasta 4 tokens especulativos por paso, aceptación media declarada de 4,63 sobre 5).
- Capacidad multilingüe limitada a inglés y chino.
- Contenido para adultos: el modelo está etiquetado `not-for-all-audiences` y puede generar material 18+.
- No soporta visión: la torre visual fue eliminada y las imágenes de entrada se ignoran.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso de agentes ni matemáticas/código especializadas.

## Casos de uso

- Roleplay y personajes conversacionales en local: el modelo está ajustado específicamente para RP, con parámetros de muestreo ya calibrados (`temperature 1.0`, `top_p 0.95`, `top_k 20`), y el despliegue en dos GPU de 22 GB permite mantener sesiones largas sin depender de la nube.
- Escritura de ficción interactiva con contexto extenso: con 229.376 tokens de `max_model_len` se pueden mantener novelas o tramas ramificadas completas en el contexto, aunque con solo 2 secuencias concurrentes.
- Investigación sobre cuantización de precisión mixta: el repositorio sirve como caso de estudio reproducible de una receta NVFP4 + FP8 con `llm-compressor`, incluido el `recipe.yaml`, para medir la degradación frente al bf16 original.
- Evaluación de decodificación especulativa con MTP: permite comparar el throughput con y sin `--speculative-config` en el mismo checkpoint, ya que la capa MTP se conserva intacta en precisión original.
- Prototipado de asistentes de conversación en entornos con hardware restringido (2×22 GB sin NVLink): útil para validar latencia y calidad antes de migrar a una versión mayor.
- Generación de diálogos sintéticos para investigación en estilo y voz narrativa, siempre dentro de los límites de uso personal que impone la licencia.
- Pruebas de integración con vLLM en arquitecturas Turing: el modelo requiere un fork específico, por lo que sirve para verificar pipelines de despliegue en compute capability 7.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El autor solo reporta métricas operativas de su despliegue:

| Metrica | Valor medido |
|---|---|
| Peso en VRAM | 21,6 GB (≈10,8 GB por GPU en TP=2) |
| `max_model_len` | 229.376 tokens |
| `max_num_seqs` | 2 |
| KV cache disponible | 466.033 tokens (dtype `turboquant_k8v4`), ≈2,03× el contexto por secuencia |
| Throughput de un solo stream | 208 tokens en 5,7 s extremo a extremo, incluida ida y vuelta por red pública (≈36,5 tok/s, valor derivado) |
| Aceptación de decodificación especulativa | 4,63 de 5 tokens |
| Contexto máximo viable a 2 secuencias | 224K; 240K requiere 491.520 tokens de KV y no cabe; a 0,95 de utilización quedan 61 MiB libres y un prefill de 32K provoca OOM |

## Requisitos de hardware

- VRAM: 21,6 GB solo para pesos; a ello se suma la KV cache (466.033 tokens con `k8v4` en la configuración de referencia).
- Cabe en una GPU de 24 GB con baja concurrencia; el escenario validado es 2×22 GB (RTX 2080 Ti modificadas) con tensor parallelism 2 y sin NVLink.
- GPU recomendadas: no hay datos para A100/H100 en la información disponible. El único hardware verificado es Turing (compute capability 7.5) con el fork `vllm-2080ti-definitive` 0.2.2.
- Requisito crítico de software: el vLLM oficial no tiene ruta de simulación NVFP4 en compute capability 7.5 y falla al cargar el formato de cuantización; hace falta el fork Turing citado. También se requiere `transformers` ≥ 5.10 por la arquitectura `qwen3_5_text`.
- No se debe sobrescribir el `config.json` del repositorio: contiene `ignore: "re:^mtp.*"`, que debe ir coordinado con el índice de safetensors.
- Opciones de despliegue: vLLM (fork Turing) con `--tensor-parallel-size 2 --max-model-len 229376 --max-num-seqs 2 --gpu-memory-utilization 0.90 --kv-cache-dtype turboquant_k8v4 --speculative-config '{"method":"mtp","num_speculative_tokens":4}'`. Soporte en llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Limitación de muestreo con MTP activo: vLLM rechaza `min_p` y `logit_bias` con error 400; el resto de parámetros funciona con normalidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision y tamano | Vision | Licencia | Notas |
|---|---|---|---|---|---|---|
| Melody1437-27B-NVFP4-MTP-text-only (este repo) | 27B | 262K config / 224K validado | NVFP4 + FP8, 21,6 GB | No | Apache-2.0 + solo uso personal, no comercial | Requiere fork de vLLM para Turing; MTP conservado |
| ReadyArt/Melody1437-27B-v0.3 (upstream) | 27B | no disponible (config con `mtp_num_hidden_layers: 1`) | bf16, ~54 GB | Sí (`Qwen3_5ForConditionalGeneration`) | Apache-2.0 + términos de uso personal del autor | Referencia de calidad; mejor reproducción de estilo en textos largos |
| Qwen/Qwen3.6-27B (base) | 27B | no disponible | bf16 | no disponible | no disponible en la información proporcionada | Modelo generalista sin el ajuste de rol |

No se dispone de datos de benchmarks que permitan comparar calidad frente a estas alternativas; la comparación disponible es de tamaño, precisión, capacidades y licencia.

## Limitaciones y advertencias

- Modelo solo de texto: la torre visual se eliminó durante la cuantización; cualquier imagen de entrada se ignora silenciosamente. Para multimodal hay que usar el upstream en bf16.
- Licencia restrictiva en la práctica: aunque el repositorio declara Apache-2.0, el upstream añade que el modelo es solo para uso personal y prohíbe el uso comercial o con ánimo de lucro. No es apto para producción comercial sin revisión legal.
- Contenido para adultos: es un ajuste fino de RP adulto; las salidas pueden incluir material 18+ y requieren filtrado si se expone a terceros.
- Pérdida de calidad medible: el autor advierte que las MLP en 4 bits reproducen peor el estilo en textos muy largos; para alineación estricta con una voz narrativa conviene el bf16.
- Dependencia de un fork no oficial de vLLM y de una versión concreta de `transformers`; el modelo no carga en el vLLM estándar sobre Turing.
- Fragilidad del empaquetado: si se reemplaza el `config.json` por el del upstream o se ignora el índice, la capa MTP deja de cargarse y se pierde la decodificación especulativa.
- Concurrencia muy limitada: 2 secuencias como máximo en el hardware validado; no es un modelo para servir tráfico concurrente alto.
- Cobertura lingüística reducida a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual en la información disponible.
- Discrepancia de empaquetado a verificar: los metadatos de HuggingFace indican un tamaño de repositorio de 0,9 GB, frente a los 21,6 GB de pesos más 849 MB de MTP que declara la model card. Conviene comprobar los ficheros antes de asumir que la descarga está completa.
- Sin datos publicados sobre sesgos, y sin benchmarks de calidad tras la cuantización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FangZhang5959/Melody1437-27B-NVFP4-MTP-text-only
- Receta de cuantización: https://huggingface.co/FangZhang5959/Melody1437-27B-NVFP4-MTP-text-only/blob/main/recipe.yaml
- Modelo upstream (ajuste fino de rol): https://huggingface.co/ReadyArt/Melody1437-27B-v0.3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
