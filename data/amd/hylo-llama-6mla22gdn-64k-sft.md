# amd/HyLo-Llama-6MLA22GDN-64K-SFT

## Resumen

HyLo-Llama-6MLA22GDN-64K-SFT es un checkpoint publicado por AMD que convierte (upcycling) un Transformer denso preentrenado —concretamente meta-llama/Llama-3.2-3B-Instruct— en una arquitectura híbrida de 28 capas y 4.267.821.452 parámetros (4,27B; el paper reporta 4,3B). La conversión sustituye 6 capas de atención por Multi-head Latent Attention (MLA), que cachea un latente de bajo rango en lugar de claves y valores completos, y transforma las 22 capas restantes en bloques lineales Gated DeltaNet con estado recurrente de tamano fijo y sin KV cache. El resultado declarado es una KV cache del 2,0 % de la del modelo base.

El modelo ha sido entrenado para contexto largo hasta 65.536 tokens mediante un proceso en dos fases: primero una destilación capa a capa (Enhanced-ILD) que alinea los bloques nuevos con las representaciones internas del modelo original, y después un SFT de contexto largo con destilación guiada por profesor, usando meta-llama/Llama-3.1-8B-Instruct como teacher. El entrenamiento se hizo con 8 aceleradores AMD Instinct MI300X y FSDP, con pérdida KL entre las distribuciones del estudiante y del profesor.

Su relevancia actual es doble: por un lado, demuestra que se puede reciclar un Transformer preentrenado hacia un híbrido de atención + capas recurrentes lineales sin pretraining desde cero, abaratando el coste de obtener ventanas de contexto grandes; por otro, es un ejemplo de compresión agresiva de KV cache para despliegue en memoria limitada. Es un checkpoint de investigación: solo soporta inglés, no publica resultados en el model-index y su licencia (amd-hybrid-models-research-only-rail-ms) restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Transformer: 28 capas, 6 MLA (Multi-head Latent Attention) + 22 Gated DeltaNet (atención lineal con regla delta y compuerta) |
| Parametros totales | 4.267.821.452 (4,27B; el paper indica 4,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens entrenados y evaluados; `max_position_embeddings`=131.072 en config, heredado del base y no soportado |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en float32; la model card indica cargar en bfloat16). Compatibilidad con GGUF/AWQ/GPTQ no confirmada |
| Idiomas soportados | en (inglés) |
| Licencia | amd-hybrid-models-research-only-rail-ms (research only, RAIL). Las etiquetas del repositorio indican apache-2.0, en contradicción con el campo `license` de la model card |
| Formato de pesos | safetensors (pesos en float32, 17,1 GB de repositorio) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Profesor de destilación | meta-llama/Llama-3.1-8B-Instruct |
| KV cache | 2,0 % de la del modelo base |
| Escalado posicional | YaRN, factor 32,0 sobre ventana original de 2.048 tokens |
| Fases de entrenamiento | Enhanced-ILD (2.048 tokens) y SFT de contexto largo con destilación (65.536 tokens) |

## Arquitectura y entrenamiento

La colocación de capas se define por índice, no por un patrón repetido: las capas MLA ocupan las posiciones [0, 5, 10, 16, 21, 26] y las Gated DeltaNet las [1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 15, 17, 18, 19, 20, 22, 23, 24, 25, 27]. La model card indica que las capas con atención completa se sitúan donde el modelo base es más sensible a perderla. En las capas MLA, `kv_lora_rank`=128, `q_lora_rank`=1536, `qk_rope_head_dim`=64, `qk_nope_head_dim`=64, `v_head_dim`=128 y 24 cabezas de atención. En las capas Gated DeltaNet, `gdn_num_heads`=9 y `gdn_head_dim`=256. Estas últimas mantienen un estado recurrente de tamano fijo (regla delta con compuerta) y no generan KV cache alguna, de modo que toda la cache del modelo proviene de las 6 capas MLA. El layout híbrido está en `hybrid_config.json`; `config.json` corresponde al modelo base y se conserva solo como referencia.

El entrenamiento consta de dos etapas. La primera, Enhanced-ILD, aplica destilación capa a capa a 2.048 tokens con learning rate 2e-4 sobre el 20 % de la mezcla de SFT, para alinear los bloques MLA y lineales recién inicializados con las representaciones internas del modelo original. La segunda es un SFT de contexto largo (65.536 tokens) con destilación guiada por el profesor, learning rate 4e-5, batch global de 8 secuencias, 1 época, schedule coseno con 0,01 de warmup y precisión mixta bfloat16. La función de pérdida es divergencia KL entre las distribuciones del siguiente token del estudiante y del profesor (`kl_weight` 1.0, `ce_weight` 0.0), implementada con un kernel KL fusionado que evita materializar el tensor completo de logits. Los datos son variantes procesadas por AMD de JunxiongWang/sftdatasetv3, nvidia/OpenMathInstruct-2, open-thoughts/OpenThoughts-114k, open-r1/OpenR1-Math-220k y nvidia/ChatQA2-Long-SFT-data, con subsetting, reformateo a la plantilla de chat y descontaminación contra las suites de evaluación. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional en inglés, partiendo de un checkpoint instruct (Llama-3.2-3B-Instruct).
- Razonamiento de sentido común, con resultados medidos en ARC, HellaSwag, OpenBookQA, PIQA y RACE.
- Razonamiento matemático y de tipo cadena de pensamiento, derivado de la mezcla de SFT que incluye OpenMathInstruct-2, OpenThoughts-114k y OpenR1-Math-220k.
- Procesamiento de contexto largo hasta 65.536 tokens, con escalado YaRN.
- Comprensión de documentos largos y preguntas sobre ellos, gracias al dataset ChatQA2-Long-SFT-data.
- Inferencia con huella de memoria reducida: la KV cache es el 2,0 % de la del modelo base, lo que permite lotes mayores o ventanas más largas en el mismo hardware.
- No se documentan capacidades de tool calling, function calling, agentes, multimodalidad (visión o audio) ni modo "thinking" explícito.
- Multilingüe: no soportado; el modelo está entrenado y etiquetado únicamente para inglés.

## Casos de uso

- Investigación en arquitecturas híbridas: sirve como referencia reproducible para estudiar el upcycling de un Transformer denso a un híbrido MLA + Gated DeltaNet, comparando su comportamiento con el modelo base sobre las mismas tareas.
- Compresión de KV cache en producción: al reducir la cache al 2,0 % del base, permite servir ventanas de 64K en GPUs con poca VRAM o aumentar el número de secuencias concurrentes por dispositivo sin cambiar de hardware.
- Análisis de documentos largos: informes, contratos o expedientes de decenas de miles de tokens en inglés se pueden pasar completos en una sola llamada de 65.536 tokens, evitando estrategias de chunking y recuperación.
- Preguntas y respuestas sobre bases documentales extensas: el entrenamiento con ChatQA2-Long-SFT-data lo orienta a QA sobre contexto largo, útil en asistentes internos de documentación técnica.
- Asistencia matemática paso a paso: con datos de OpenMathInstruct-2 y OpenR1-Math-220k puede resolver y explicar problemas de nivel escolar y universitario básico, útil como tutor o como generador de soluciones comentadas.
- Generación de texto y resumen en pipelines por lotes: su menor consumo de memoria permite ejecutar lotes grandes en una única GPU para resumen o reescritura de corpus en inglés.
- Evaluación comparativa de estrategias de atención: al coexistir capas MLA y capas lineales puras en el mismo modelo, permite medir empíricamente dónde la atención completa es imprescindible y dónde no.
- Prototipado sobre hardware AMD: el modelo está entrenado sobre Instinct MI300X, por lo que es un candidato natural para validar stacks de inferencia ROCm.

## Benchmarks y rendimiento

El model-index del repositorio no contiene resultados (`results: []`). Las cifras siguientes proceden de la Tabla 3 del paper (backbone Llama-3.2-3B), citadas en la model card, medidas en modo 0-shot con EleutherAI lm-evaluation-harness. Solo se dispone de la columna de este modelo; no hay datos comparativos con otros modelos en la información proporcionada.

| Tarea (0-shot, accuracy) | HyLo-Llama-6MLA22GDN |
|---|---:|
| ARC-Challenge | 43,7 |
| ARC-Easy | 69,5 |
| HellaSwag | 67,9 |
| OpenBookQA | 38,6 |
| PIQA | 75,9 |
| RACE | 39,8 |

No se han publicado en la información disponible resultados de MMLU, GSM8K, HumanEval ni métricas específicas de contexto largo (por ejemplo, RULER o Needle-in-a-Haystack).

## Requisitos de hardware

- Pesos en float32: 17,1 GB de repositorio. Es la precisión en la que se publican; la model card indica cargarlos en bfloat16.
- VRAM estimada para pesos en bfloat16: en torno a 8,5 GB, más cache y activaciones. La cache a 65.536 tokens es muy reducida (2,0 % de la del base), del orden de cientos de MiB en las 6 capas MLA.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) con precisión bfloat16, siempre que el stack soporte la arquitectura híbrida.
- GPU profesionales recomendadas: AMD Instinct MI300X (la usada en el entrenamiento, 8 unidades con FSDP), A100 40/80 GB, H100 40/80 GB, o GPUs de 16-24 GB para inferencia en bfloat16.
- Cuantización: no se publican pesos GGUF, AWQ ni GPTQ; el soporte de cuantización dependerá del stack de inferencia y de que implemente Gated DeltaNet. Dato no disponible.
- Opciones de despliegue: la model card no recomienda ningún stack concreto, dato no disponible. Es imprescindible que el servidor implemente MLA y Gated DeltaNet y que se fije explícitamente la longitud máxima, por ejemplo `--max-model-len 65536`, porque los servidores dimensionan la KV cache a partir de `max_position_embeddings` (131.072), valor heredado y no soportado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KV cache | Licencia | Notas |
|---|---:|---|---|---|---|
| HyLo-Llama-6MLA22GDN-64K-SFT | 4,27B | 65.536 tokens entrenados | 2,0 % del base | amd-hybrid-models-research-only-rail-ms | Híbrido MLA + Gated DeltaNet, solo inglés |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3,21B declarados por Meta | 128.000 tokens declarados en su model card | Referencia (100 %) | Llama 3.2 Community License | Transformer denso con GQA; datos del base no verificados en la información proporcionada |
| meta-llama/Llama-3.1-8B-Instruct (profesor) | 8,03B declarados por Meta | 128.000 tokens declarados | Referencia | Llama 3.1 Community License | Usado como teacher de destilación, no como alternativa de despliegue |

No se dispone en la información proporcionada de otros híbridos comparables (por ejemplo Qwen3-Next o Nemotron-H) con cifras verificables, por lo que la comparación se limita a los modelos anteriores.

## Limitaciones y advertencias

- Licencia: el campo `license` de la model card es amd-hybrid-models-research-only-rail-ms (RAIL, solo investigación), mientras que las etiquetas del repositorio indican apache-2.0. Esta contradicción debe resolverse antes de cualquier uso comercial; a falta de aclaración, debe asumirse uso restringido a investigación.
- Idioma: solo inglés. Cualquier uso en castellano u otros idiomas queda fuera del alcance declarado y degradará la calidad.
- Contexto: no debe superarse los 65.536 tokens. El valor `max_position_embeddings`=131.072 del config es heredado del base y no está soportado ni medido; usarlo puede provocar degradación silenciosa y un consumo de memoria no previsto.
- Alucinación: es un modelo destilado de 4,27B; la destilación con pérdida KL y sin `ce_weight` sobre las etiquetas puede aumentar la imitación del profesor sin garantizar fidelidad factual. No hay evaluación de factualidad en la información disponible.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad ni evaluación de seguridad. El entrenamiento parte de Llama-3.2-3B-Instruct y de datasets de instrucciones y matemáticas, con los sesgos inherentes a esas fuentes.
- Un dataset de entrenamiento, nvidia/ChatQA2-Long-SFT-data, tiene licencia cc-by-nc-2.0 (no comercial), lo que refuerza la restricción de uso comercial del checkpoint.
- Rendimiento: los benchmarks publicados son únicamente de razonamiento de sentido común en 0-shot. No hay MMLU, GSM8K, HumanEval ni métricas de contexto largo, por lo que no se puede verificar la retención de capacidades del modelo base ni la calidad más allá de 2.048 tokens.
- Producción: no se documentan stack de inferencia soportado, cuantizaciones ni cifras de latencia y throughput. La arquitectura híbrida requiere soporte específico en el servidor (MLA + Gated DeltaNet); sin él, el modelo no cargará.
- Madurez: repositorio con 0 descargas y 0 likes, publicado en 2026-09-11, orientado a investigación y sin garantías de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Llama-6MLA22GDN-64K-SFT
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Profesor de destilación: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper principal: Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling, https://arxiv.org/abs/2604.24715
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2505.17272
- Referencia arXiv citada en las etiquetas: https://arxiv.org/abs/2503.11132
- Dataset de SFT: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset de matemáticas: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset de razonamiento: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset de matemáticas: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de QA de contexto largo: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- Licencia del modelo: LICENSE (referenciado en el repositorio de HuggingFace)
