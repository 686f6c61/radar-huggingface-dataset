# amd/HyLo-Llama-4MLA12GDN-64K-SFT

## Resumen

HyLo-Llama-4MLA12GDN-64K-SFT es un checkpoint experimental de AMD que convierte un transformer preentrenado en un modelo híbrido mediante upcycling. En concreto, parte de `meta-llama/Llama-3.2-1B-Instruct` y sustituye parte de sus capas de atención por capas MLA (Multi-head Latent Attention) y bloques lineales Gated DeltaNet. El resultado son 16 capas totales: 4 capas MLA y 12 capas Gated DeltaNet, con 1.673.797.776 parámetros totales (1,67B). La innovación principal es que las capas Gated DeltaNet no mantienen caché KV y las MLA cachean un latente de bajo rango, de modo que la caché KV total queda en el 3,9% de la del modelo base.

El modelo ha sido entrenado para contexto largo mediante destilación desde `meta-llama/Llama-3.1-8B-Instruct` como profesor. La primera fase, Enhanced-ILD, alinea por capas los bloques nuevos con las representaciones internas del modelo base a 2.048 tokens. La segunda fase hace SFT de contexto largo a 65.536 tokens con el profesor, usando divergencia KL entre las distribuciones del alumno y del profesor. El checkpoint final está pensado para funcionar hasta 65.536 tokens, aunque el `config.json` herede un `max_position_embeddings` de 131.072 que no debe interpretarse como contexto soportado.

Es relevante ahora porque explora una vía de escalado híbrido sin preentrenar desde cero, reduciendo drásticamente la memoria de caché KV en inferencia. Está orientado a investigación y su licencia declarada en HuggingFace es research-only, no comercial. El modelo solo está entrenado y evaluado en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 16 capas (4 MLA + 12 Gated DeltaNet), derivada de Llama-3.2-1B-Instruct |
| Parámetros totales | 1.673.797.776 (1,67B; el paper reporta 1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens entrenados (64K). YaRN factor 32,0 sobre ventana original de 2.048. `max_position_embeddings` del config: 131.072, heredado del base, no soportado según la model card |
| Tipos de cuantización | No disponible. Pesos en float32; se recomienda cargar en bfloat16. No se listan GGUF, AWQ, GPTQ ni otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | AMD Hybrid Models Research Only RAIL-MS (`license_name`/`license_link`). La model card también declara `license: apache-2.0` en el YAML y en los tags, pero el campo de licencia de HuggingFace indica `amd-hybrid-models-research-only-rail-ms` |
| Formato de pesos | safetensors; precisión float32 (cargar en bfloat16) |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Profesor de destilación | meta-llama/Llama-3.1-8B-Instruct |
| Tamaño del repositorio | 6,7 GB |
| Capas MLA | Índices [1, 5, 10, 14] |
| Capas Gated DeltaNet | Índices [0, 2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 15] |
| Caché KV | 3,9% de la del modelo base |
| Dimensión MLA | `kv_lora_rank` 128; `q_lora_rank` 1344; `qk_rope_head_dim` 32; `qk_nope_head_dim` 32; `v_head_dim` 64; 32 cabezas de atención |
| Dimensión Gated DeltaNet | `gdn_num_heads` 6; `gdn_head_dim` 256 |

## Arquitectura y entrenamiento

La arquitectura no repite un patrón fijo de capas híbridas: la posición de las capas MLA se elige por índice, en los puntos donde el modelo base es más sensible a perder atención completa. Las 4 capas MLA conservan atención, pero en lugar de cachear claves y valores completos cachean un latente de bajo rango. Las 12 capas Gated DeltaNet son bloques de atención lineal con regla delta y compuertas que mantienen un estado recurrente de tamaño fijo, por lo que no contribuyen a la caché KV. La combinación reduce la caché total al 3,9% de la del modelo base. La configuración híbrida vive en `hybrid_config.json`; `config.json` es el del modelo base y se mantiene solo como referencia.

El entrenamiento tiene dos etapas. La primera, Enhanced-ILD, hace destilación capa a capa para alinear los bloques MLA y lineales recién inicializados con las representaciones internas del modelo base, a 2.048 tokens de contexto, con LR 2e-4 y el 20% de la mezcla de SFT. La segunda es SFT de contexto largo con destilación guiada por profesor a 65.536 tokens, LR 6e-5 y la mezcla completa. La pérdida es divergencia KL entre las distribuciones del alumno y del profesor (`kl_weight` 1,0, `ce_weight` 0,0), con batch global de 8 secuencias, 1 época, schedule coseno y warmup ratio 0,01. Se usó precisión mixta bfloat16, 8x AMD Instinct MI300X con FSDP y un kernel KL fusionado con chunking de estados ocultos para que cupiesen las secuencias de 64K tokens. Los datos de entrenamiento incluyen `JunxiongWang/sftdatasetv3`, `nvidia/OpenMathInstruct-2`, `open-thoughts/OpenThoughts-114k`, `open-r1/OpenR1-Math-220k` y `nvidia/ChatQA2-Long-SFT-data`, en variantes procesadas por AMD con submuestreo, reformateo a plantilla de chat y descontaminación contra las suites de evaluación.

## Capacidades

- Generación de texto y conversación en inglés.
- Razonamiento de sentido común, evaluado en ARC-Challenge, ARC-Easy, HellaSwag, OpenBookQA, PIQA, RACE y WinoGrande.
- Entrenamiento con datasets de matemáticas y razonamiento (`OpenMathInstruct-2`, `OpenThoughts-114k`, `OpenR1-Math-220k`), aunque no se publican benchmarks específicos de matemáticas en la información disponible.
- Manejo de contexto largo de hasta 65.536 tokens, con una caché KV del 3,9% respecto al modelo base.
- Destilación desde `meta-llama/Llama-3.1-8B-Instruct` como profesor.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: solo inglés.
- Visión, audio u otras modalidades: no documentadas.
- Modo de pensamiento explícito: no documentado.

## Casos de uso

- Preguntas y respuestas sobre documentos largos en inglés: el modelo soporta hasta 65.536 tokens de contexto y fue entrenado con `ChatQA2-Long-SFT-data`, por lo que puede usarse para responder preguntas sobre informes, contratos, artículos o documentación extensa sin fragmentar en exceso.
- Chat multi-turno con historial extenso: al reducir la caché KV al 3,9% del modelo base, permite mantener conversaciones largas con menor coste de memoria que un transformer equivalente.
- Resumen de documentación técnica y artículos: puede generar resúmenes de textos de hasta 64K tokens, útil para procesar manuales, papers o expedientes completos en una sola pasada.
- Asistente de matemáticas básicas: los datasets de entrenamiento incluyen `OpenMathInstruct-2` y `OpenR1-Math-220k`, por lo que puede emplearse en resolución de problemas de matemáticas de nivel escolar o universitario temprano, siempre con verificación humana.
- Extracción de información estructurada de textos largos: entidades, fechas, cláusulas o respuestas concretas a partir de corpus largos en inglés, aprovechando la ventana de 64K.
- Investigación en upcycling y arquitecturas híbridas: sirve como checkpoint de estudio para analizar MLA + Gated DeltaNet, destilación capa a capa y conversión de transformers preentrenados en híbridos.
- Prototipos de bajo coste en GPU de consumo: con 1,67B parámetros y pesos en bfloat16 de aproximadamente 3,35 GB, puede desplegarse en GPUs de gama media o alta para pruebas y demos.
- Evaluación comparativa de eficiencia de caché KV: útil para medir latencia, memoria y calidad frente al modelo base en contextos largos, especialmente en serving con `--max-model-len 65536`.

## Benchmarks y rendimiento

El `model-index` del repositorio no incluye resultados. Los siguientes datos proceden de la Tabla 2 del paper citado en la model card, para el backbone Llama-3.2-1B, medidos 0-shot con EleutherAI lm-evaluation-harness.

| Tarea | Resultado (accuracy, 0-shot) |
|---|---:|
| ARC-Challenge | 36,0 |
| ARC-Easy | 63,6 |
| HellaSwag | 57,4 |
| OpenBookQA | 38,2 |
| PIQA | 70,7 |
| RACE | 35,4 |
| WinoGrande | 57,2 |

No se han proporcionado resultados de MMLU, HumanEval, GSM8K ni comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Pesos en float32: aproximadamente 6,7 GB, coherente con el tamaño del repositorio.
- Pesos en bfloat16: aproximadamente 3,35 GB, calculado a partir de 1.673.797.776 parámetros. Es una estimación, no una cifra confirmada por el autor.
- VRAM total para inferencia: no disponible de forma oficial. Depende de activaciones, longitud de contexto y caché KV. La caché KV es el 3,9% de la del modelo base.
- GPU de consumo: en bfloat16 el modelo podría caber en GPUs de 8 GB o más, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 o RTX 4090. En float32 necesitaría más de 8 GB solo para pesos, más el overhead de inferencia. No confirmado por el autor.
- GPU de centro de datos: no hay recomendación oficial. El entrenamiento usó 8x AMD Instinct MI300X con FSDP. Por tamaño, también podría ejecutarse en A100, H100 o MI300X.
- Despliegue: no se especifican vLLM, llama.cpp, Ollama ni TGI. Requiere un stack que soporte la configuración híbrida de `hybrid_config.json` con MLA y Gated DeltaNet. El autor menciona stacks de serving y recomienda fijar `--max-model-len 65536`. `config.json` es el del modelo base y solo es referencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada. La única referencia directa es el modelo base.

| Modelo | Arquitectura | Parámetros | Contexto | Caché KV | Licencia |
|---|---|---|---|---|---|
| HyLo-Llama-4MLA12GDN-64K-SFT | Híbrida MLA + Gated DeltaNet | 1,67B | 65.536 tokens entrenados | 3,9% del base | AMD Hybrid Models Research Only RAIL-MS |
| meta-llama/Llama-3.2-1B-Instruct | Transformer | No disponible en la información | 131.072 en `max_position_embeddings` (heredado por HyLo) | 100% (referencia) | No especificada en la información proporcionada |

No se dispone de comparativas con modelos híbridos de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Licencia research-only: el campo de licencia de HuggingFace y `license_name` indican AMD Hybrid Models Research Only RAIL-MS. Aunque la model card declara Apache-2.0 en el YAML y en los tags, no debe asumirse uso comercial sin revisar el archivo `LICENSE`.
- Solo inglés: no se documentan capacidades multilingües.
- Contexto máximo soportado: 65.536 tokens. No usar 131.072 aunque `config.json` lo indique, porque la model card lo marca como no soportado.
- Riesgo de alucinación: inherente a un modelo de 1,67B, especialmente en tareas de conocimiento factual y matemáticas.
- Sesgos conocidos: no documentados en la información proporcionada.
- Tool calling, function calling y agentes: no documentados.
- Rendimiento limitado: en sentido común, ARC-Challenge 36,0, HellaSwag 57,4, PIQA 70,7. No es un modelo de propósito general de alta precisión.
- Dataset `nvidia/ChatQA2-Long-SFT-data` con licencia cc-by-nc-2.0: el autor indica que se usaron variantes procesadas por AMD, pero conviene revisar implicaciones para uso comercial.
- Dependencia de implementación híbrida: no todos los runtimes soportan MLA + Gated DeltaNet, por lo que el despliegue puede requerir código específico.
- `config.json` puede confundir a stacks de serving: hereda `max_position_embeddings` 131.072 y puede llevar a reservar caché KV de más si no se fija explícitamente la longitud máxima.
- Derivado de `meta-llama/Llama-3.2-1B-Instruct`: pueden aplicar términos de la licencia de Meta no detallados en la información proporcionada.
- Checkpoint en float32: debe cargarse en bfloat16 según la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Llama-4MLA12GDN-64K-SFT
- Paper principal: https://arxiv.org/abs/2604.24715
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Profesor de destilación: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset `JunxiongWang/sftdatasetv3`: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset `nvidia/OpenMathInstruct-2`: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset `open-thoughts/OpenThoughts-114k`: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset `open-r1/OpenR1-Math-220k`: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset `nvidia/ChatQA2-Long-SFT-data`: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- Referencia arXiv etiquetada: https://arxiv.org/abs/2505.17272
- Referencia arXiv etiquetada: https://arxiv.org/abs/2503.11132
- Búsqueda web: no se encontraron enlaces específicos del modelo; los resultados devueltos fueron páginas corporativas de AMD, Wikipedia y notas de drivers, no relevantes para esta ficha.
