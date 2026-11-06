# HangGlidersRule/Darkstar-Nemotron-3.5-Embed-8B-Base-ModelOpt-W4A16-NVFP4

## Resumen

Darkstar-Nemotron-3.5-Embed-8B-Base-ModelOpt-W4A16-NVFP4 es un checkpoint de embeddings cuantizado en NVFP4 (W4A16) derivado de `nvidia/Nemotron-3.5-Embed-8B-BF16`. Lo publica el usuario HangGlidersRule bajo el paraguas del proyecto Darkstar / model-forge, y su objetivo es reducir el peso en memoria de un modelo de embeddings de 8.381 millones de parámetros a aproximadamente un tercio del original sin degradar de forma significativa la calidad de recuperación. No es un modelo nuevo: es una conversión de pesos sin edición de comportamiento, pensada para servir en vLLM sobre hardware Blackwell.

La arquitectura subyacente es Ministral3 bidireccional (torre de texto) con una torre de visión Pixtral y un proyector multimodal, según la model card del autor. La cuantización afecta únicamente a las 238 capas lineales de la torre de texto (atención `q/k/v/o_proj` y MLP `gate/up/down_proj` en 34 capas); el resto de componentes permanece en BF16 byte-idéntico al modelo original. El resultado son 5,82 GiB de pesos en vLLM frente a 15,74 GiB en BF16.

Su relevancia es práctica: ofrece un modelo de embeddings de 8B con licencia OpenMDW-1.1 que cabe en GPUs de menor VRAM sin renunciar apenas a nDCG@10, con una pérdida medida de −0,0071 en LMEB Dialogue y una ganancia no significativa de +0,0017 en MTEB Nano. El autor documenta de forma inusualmente rigurosa el protocolo de calibración, los gates de calidad y las alternativas descartadas (W4A4), lo que facilita la reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional Ministral3 (torre de texto) + torre de visión Pixtral + proyector multimodal |
| Parametros totales | 8.381.155.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A16 (pesos FP4 E2M1, grupo 16, escalas de bloque FP8 E4M3); activaciones en BF16; resto de componentes en BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (repo de 6,1 GB) |

## Arquitectura y entrenamiento

El modelo base es `nvidia/Nemotron-3.5-Embed-8B-BF16` en la revisión `781e779ee4ca9c2d2a4f38321993556baeab49a1`. La torre de texto es un transformer bidireccional de tipo Ministral3 con 34 capas; incluye además una torre de visión Pixtral y un proyector multimodal que en este checkpoint permanecen en BF16 sin tocar. La cuantización se aplica a las 238 capas lineales de la torre de texto: `q_proj`, `k_proj`, `v_proj`, `o_proj` en atención y `gate_proj`, `up_proj`, `down_proj` en MLP, en todas las capas. Los embeddings de tokens y todas las normas quedan en BF16 byte-idénticos al upstream.

El proceso de construcción usó NVIDIA ModelOpt 0.48.0 (commit `e2f328a19de789e73b91aca2908042388cf6d496`), torch 2.15.0 y transformers 5.18.0, con la receta de operadores `w4a16_nvfp4_text_all_mse-kv_bf16`. La calibración de escalas de pesos se hizo sobre 512 textos de `microsoft/ms_marco` v1.1 (256 queries y 256 pasajes, seed 1234), renderizados exactamente con la plantilla de chat del propio checkpoint (`query: …` / `passage: …`, sin BOS/EOS). El autor documenta que se probaron tres candidatos (W4A4 en todas las lineales, W4A4 solo en MLP y W4A16 en todas las lineales) y que solo el tercero superó el umbral predefinido del 98 % de nDCG@10 respecto a BF16 en ambos conjuntos de evaluación. Los dos candidatos W4A4 fallaron especialmente en documentos cortos (turnos de conversación de LMEB con mediana de 168 caracteres), donde el mean pooling amplifica el error de cuantización de activaciones.

## Capacidades

- Generación de embeddings de texto para recuperación densa (pipeline `feature-extraction`), con pooling por media y normalización.
- Embeddings multimodales: la torre de visión Pixtral y el proyector permanecen intactos en BF16, por lo que el modelo conserva la capacidad de codificar imágenes junto a texto.
- Recuperación de pasajes y documentos en corpus completos, validada sobre los seis conjuntos MTEB Nano (NFCorpus, FiQA2018, Touche2020, ArguAna, SciFact, MSMARCO).
- Recuperación de conversaciones completas (LMEB Dialogue), pensada para buscar turnos dentro de diálogos largos.
- Búsqueda asimétrica: consultas de este checkpoint contra documentos BF16 mantienen entre el 99,36 % y el 99,82 % del rendimiento BF16.
- Compatibilidad con vLLM (kernel Marlin NVFP4) para servir en producción.
- No dispone de tool calling, agentes ni modo de razonamiento: es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica en producción con presupuesto de VRAM ajustado: al cargar 5,82 GiB en vLLM frente a 15,74 GiB en BF16, permite desplegar un embedder de 8B en GPUs donde el modelo original no cabría junto al resto del stack.
- Recuperación aumentada (RAG) sobre documentación técnica: el modelo produce embeddings de pasajes y consultas con calidad prácticamente idéntica a BF16 (100,26 % en MTEB Nano), lo que lo hace apto para pipelines RAG existentes sin recalibrar umbrales.
- Búsqueda dentro de conversaciones y transcripciones: validado específicamente en LMEB Dialogue con 22.289 turnos y conversaciones de hasta 1.548 turnos, útil para asistentes que necesitan recuperar contexto histórico de un diálogo.
- Deduplicación y clustering de documentos a escala: el ahorro de memoria permite mantener el índice en memoria o aumentar el tamaño de lote durante la indexación.
- Búsqueda multimodal texto-imagen: la torre Pixtral intacta en BF16 permite indexar imágenes y recuperarlas mediante consultas textuales.
- Evaluación comparativa de cuantizaciones: el checkpoint incluye gates y resultados documentados, lo que lo convierte en referencia reproducible para estudiar el impacto de NVFP4 W4A16 frente a W4A4 en embeddings.
- Servicio de embeddings en clústeres Blackwell: aprovecha el kernel Marlin NVFP4 de vLLM en SM120 (RTX PRO 6000 Blackwell), con throughput entre 1,02x y 1,28x el de BF16.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos en RTX PRO 6000 Blackwell (SM120) con vLLM v0.32.0 frente al checkpoint BF16 servido de la misma forma. Intervalos de confianza al 95 % por bootstrap pareado de nDCG@10 por consulta (10.000 remuestreos).

| Metrica | Valor | Base |
|---|---|---|
| nDCG@10 medio, MTEB Nano (todos los vectores del checkpoint) | 0,6453 (BF16 0,6436), 100,26 % | 299 consultas, 24.893 documentos |
| Delta vs BF16, MTEB Nano | +0,0017 (IC 95 % −0,0033 a +0,0067) | bootstrap pareado |
| nDCG@10 medio, LMEB Dialogue (todos los vectores del checkpoint) | 0,5717 (BF16 0,5788), 98,78 % | 540 consultas, 22.289 turnos |
| Delta vs BF16, LMEB Dialogue | −0,0071 (IC 95 % −0,0137 a −0,0004) | pérdida pequeña pero medida |
| Documentos BF16 con consultas del checkpoint | 99,82 % y 99,36 % de BF16 | MTEB Nano y LMEB Dialogue |
| Suelo de ruido (réplica BF16) | +0,0005 y +0,0015 | segunda ejecución BF16 |
| Coseno de vectores de documento vs BF16 | media 0,98891 y 0,98755; mínimo 0,94482 | — |
| Velocidad vs BF16 | 1,02x–1,28x | vLLM, misma GPU |

Gates de cuantización documentados por el autor:

| Candidato | Torre de texto | MTEB Nano | LMEB Dialogue | Veredicto |
|---|---|---|---|---|
| A | W4A4 NVFP4, todas las lineales | 100,44 % de BF16 | 94,63 % de BF16 | falla |
| C | W4A4 NVFP4, solo MLP | 99,90 % de BF16 | 96,72 % de BF16 | falla |
| D (este checkpoint) | W4A16 NVFP4, todas las lineales | 100,26 % de BF16 | 98,78 % de BF16 | pasa |

## Requisitos de hardware

- VRAM de pesos en vLLM: 5,82 GiB (frente a 15,74 GiB en BF16). Hay que añadir la memoria del runtime, buffers de activación y caché KV según lote y longitud.
- GPU validadas: RTX PRO 6000 Blackwell (SM120) con vLLM v0.32.0, usando el kernel Marlin NVFP4.
- GPUs con soporte NVFP4/Marlin: el kernel requiere hardware Blackwell para aprovechar la ruta rápida; en arquitecturas anteriores el comportamiento no está documentado por el autor.
- Cabe en GPUs de consumo con suficiente VRAM para los 5,82 GiB de pesos más overhead; no se especifica una GPU de consumo concreta validada.
- Despliegue: vLLM es la ruta documentada. No se mencionan llama.cpp, Ollama ni TGI para este checkpoint NVFP4.
- Rendimiento: 1,02x–1,28x la velocidad de BF16 en la misma GPU; el objetivo del checkpoint es ahorro de memoria, no aceleración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darkstar-Nemotron-3.5-Embed-8B-Base-ModelOpt-W4A16-NVFP4 (este) | 8.381.155.328 | no disponible | NVFP4 W4A16 | OpenMDW-1.1 | Hugging Face, 0 descargas, 0 likes |
| nvidia/Nemotron-3.5-Embed-8B-BF16 (base) | 8.381.155.328 | no disponible | BF16 | OpenMDW-1.1 | Hugging Face |
| Candidato A (W4A4, todas las lineales) | 8.381.155.328 | no disponible | NVFP4 W4A4 | OpenMDW-1.1 | no publicado como checkpoint final |
| Candidato C (W4A4, solo MLP) | 8.381.155.328 | no disponible | NVFP4 W4A4 | OpenMDW-1.1 | no publicado como checkpoint final |

No se dispone de datos de benchmarks frente a otros embedders de la misma categoría (por ejemplo, E5, BGE o GTE de tamaño comparable) en la información proporcionada. La comparativa disponible se limita a las variantes del propio modelo base y a los candidatos de cuantización descartados.

## Limitaciones y advertencias

- No es más rápido de forma sustancial: la ganancia de velocidad es de 1,02x–1,28x frente a BF16; el beneficio principal es el ahorro de memoria (5,82 GiB frente a 15,74 GiB).
- Pérdida de calidad medible en LMEB Dialogue: −0,0071 de nDCG@10 con IC 95 % que excluye el cero (−0,0137 a −0,0004). Pequeña, pero real y estadísticamente significativa.
- Dependencia de hardware Blackwell: la ruta validada usa el kernel Marlin NVFP4 de vLLM en SM120; el rendimiento en otras arquitecturas no está documentado.
- Dependencia de vLLM: no se documentan rutas de despliegue alternativas (llama.cpp, Ollama, TGI) para este formato NVFP4.
- Idiomas soportados no declarados en la model card; no se puede asumir cobertura multilingüe sin verificación.
- Longitud de contexto no declarada en la información disponible.
- Riesgo de sesgo y alucinación: no evaluado en la información proporcionada; al ser un modelo de embeddings, el riesgo se traslada a sesgos en la recuperación (por ejemplo, sesgos de representación en el corpus de calibración MS MARCO).
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos con términos propios; conviene revisar el texto completo en openmdw.ai antes de uso comercial.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de adopción ni validación independiente por parte de la comunidad.
- Calibración limitada a 512 textos de MS MARCO: el comportamiento en dominios muy distintos (código, multilingüe, documentos muy cortos) no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Embed-8B-Base-ModelOpt-W4A16-NVFP4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Source card: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-embed-8b/model-card/base-nvfp4.md
- Family record: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-embed-8b/README.md
- Build recipe: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/nemotron-3.5-embed-8b/darkstar-nemotron-3.5-embed-8b-base-modelopt-w4a16-nvfp4.yaml
- Gate results: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-embed-8b/results/embed-gate-summary.json
- Campaign issue: https://github.com/HangGlidersRule/model-forge/issues/33
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset de calibración: https://huggingface.co/datasets/microsoft/ms_marco
- Dataset LMEB: https://huggingface.co/datasets/KaLM-Embedding/LMEB
