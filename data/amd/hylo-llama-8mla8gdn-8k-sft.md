# amd/HyLo-Llama-8MLA8GDN-8K-SFT

## Resumen

HyLo-Llama-8MLA8GDN-8K-SFT es un checkpoint experimental de AMD que convierte (upcycling) el transformer denso `meta-llama/Llama-3.2-1B-Instruct` en una arquitectura hibrida de 16 capas: 8 capas de Multi-head Latent Attention (MLA) y 8 capas de Gated DeltaNet, con 1.613.437.024 parametros totales. El objetivo no es superar al modelo base en calidad, sino demostrar que se puede reducir drasticamente la memoria de la cache KV manteniendo la precision en contextos cortos: el checkpoint declara una cache KV del 7,8 % de la del modelo original.

La idea central de HyLo, descrita en el paper arXiv:2604.24715 (*Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling*), es no preentrenar desde cero. Cada capa del transformer original se sustituye por uno de dos tipos: las capas de atencion se reconvierten a MLA (que cachea un latente de bajo rango en lugar de claves y valores completos) y las restantes pasan a ser bloques lineales recurrentes (Gated DeltaNet o Mamba-2) con estado de tamano fijo y sin cache KV. Despues, el modelo se entrena para contexto largo con destilacion del profesor `meta-llama/Llama-3.1-8B-Instruct`.

Este checkpoint concreto esta ajustado por supervisado (SFT) y destilacion a 8.192 tokens de contexto y forma parte de una familia de lanzamientos (existe un hermano de 64K entrenado con la misma receta). Es relevante ahora porque ataca uno de los cuellos de botella reales del despliegue de LLM largo-contextuales: el coste de memoria de la cache KV, y lo hace con un presupuesto de parametros de 1,6B, apto para hardware de consumo. La licencia, sin embargo, es de investigacion, no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer: 8 capas MLA + 8 capas Gated DeltaNet (16 capas totales) |
| Parametros totales | 1.613.437.024 (1,61B; el paper reporta 1,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens entrenados (ampliados con YaRN, factor 4.0 sobre ventana original de 2.048). `max_position_embeddings` en config es 131.072, heredado del base, pero NO es una longitud soportada |
| Tipos de cuantizacion | No disponible: no se publican conversiones GGUF/AWQ/GPTQ en la informacion proporcionada. Los pesos se distribuyen en float32 (cargar en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | `amd-hybrid-models-research-only-rail-ms` (solo investigacion). El frontmatter de la model card tambien declara `apache-2.0` como `license`, con `license_name` apuntando a la licencia de investigacion de AMD; prevalece la restriccion de uso no comercial |
| Formato de pesos | safetensors (repo de 6,5 GB; pesos en float32) |
| Tamano del repositorio | 6,5 GB |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct |
| Profesor de destilacion | meta-llama/Llama-3.1-8B-Instruct |
| Cache KV | 7,8 % de la del modelo base |
| Precision de checkpoint | float32 (cargar en bfloat16) |
| Configuracion de capas | MLA en indices [0,2,4,6,8,10,12,14]; Gated DeltaNet en [1,3,5,7,9,11,13,15] |

Dimensiones MLA: `kv_lora_rank` 128, `q_lora_rank` 1344, `qk_rope_head_dim` 32, `qk_nope_head_dim` 32, `v_head_dim` 64, 32 cabezas de atencion. Dimensiones Gated DeltaNet: `gdn_num_heads` 6, `gdn_head_dim` 256. La disposicion hibrida se define en `hybrid_config.json`; `config.json` corresponde al modelo base y se conserva solo como referencia.

## Arquitectura y entrenamiento

La arquitectura no sigue un patron repetitivo de capas: los tipos se asignan por indice, colocando las capas MLA donde el modelo base es mas sensible a perder atencion completa. Las 8 capas MLA conservan atencion pero cachean un latente de bajo rango (rank 128) en lugar de claves y valores completos; las 8 capas Gated DeltaNet implementan una regla delta con compuerta (linear attention) que mantiene un estado recurrente de tamano fijo, por lo que no contribuyen nada a la cache KV. El resultado agregado es esa cache del 7,8 % respecto al transformer original.

El entrenamiento tiene dos etapas. La primera, Enhanced-ILD, hace destilacion capa a capa para alinear los bloques MLA y lineales recien inicializados con las representaciones internas del modelo base, a 2.048 tokens, con LR 2e-4 y el 20 % de la mezcla de SFT. La segunda es un SFT de contexto largo con destilacion guiada por profesor, a 8.192 tokens, LR 6e-5 y la mezcla completa. La perdida es divergencia KL entre las distribuciones next-token de estudiante y profesor (`kl_weight` 1.0, `ce_weight` 0.0), con batch global de 32 secuencias, 1 epoca, schedule coseno y warmup del 1 %. Se entreno en bfloat16 mixto sobre 8 GPU AMD Instinct MI300X con FSDP. Entre las innovaciones de ingenieria destaca un kernel KL fusionado que evita materializar el tensor completo de logits, reduciendo el pico de memoria durante la destilacion.

Los datos de SFT son `JunxiongWang/sftdatasetv3` (apache-2.0), `nvidia/OpenMathInstruct-2` (cc-by-4.0), `open-thoughts/OpenThoughts-114k` (apache-2.0), `open-r1/OpenR1-Math-220k` (apache-2.0) y `nvidia/ChatQA2-Long-SFT-data` (cc-by-nc-2.0). AMD uso variantes procesadas: subconjuntos, reformateo a la plantilla de chat y descontaminacion contra las suites de evaluacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles, heredadas del ajuste instructivo del modelo base.
- Razonamiento matematico y resolucion de problemas, reforzado por el SFT sobre OpenMathInstruct-2, OpenR1-Math-220k y OpenThoughts-114k.
- Razonamiento con trazas largas (estilo cadena de pensamiento), dado el peso de OpenThoughts-114k en la mezcla.
- Comprension de documentos largos y QA sobre contexto extenso (hasta 8K tokens), con el dataset ChatQA2-Long-SFT como componente de entrenamiento.
- Eficiencia de cache KV: 7,8 % de la del modelo base, lo que permite mantener muchas mas secuencias concurrentes para la misma VRAM.
- No se declara soporte explicito de tool calling, function calling ni uso agentico en la informacion disponible.
- No se declara soporte de vision, audio ni modalidades adicionales: es un modelo exclusivamente de texto.
- No se declara un modo "thinking" explicito ni etiquetas de razonamiento separadas mas alla de lo aprendido del dataset.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion en arquitecturas hibridas: el checkpoint sirve como material de reproduccion y comparacion para estudiar como se comporta un transformer reconvertido a MLA + Gated DeltaNet frente al original, a igualdad de backbone.
- Experimentos de eficiencia de cache KV: al reducir la cache al 7,8 %, es un banco de pruebas ideal para medir throughput y numero de secuencias concurrentes en servidores de inferencia con presupuesto de memoria ajustado.
- Procesamiento de documentos de hasta 8.000 tokens en ingles: resumen, extraccion de entidades y QA sobre informes, contratos o articulos, siempre que se respete el limite de 8K entrenado.
- Generacion de codigo asistida en entornos de investigacion: el modelo base Llama-3.2-1B-Instruct ya rinde en completado de codigo basico, y la mezcla de SFT incluye datos de instrucciones generales; adecuado para prototipos locales, no para pipelines de produccion criticos.
- Tutorizacion matematica y generacion de soluciones paso a paso: el entrenamiento con OpenMathInstruct-2 y OpenR1-Math lo orienta a problemas de nivel escolar y de competicion sencillos.
- Fine-tuning posterior y ablation studies: al ser un modelo de 1,6B con licencia de investigacion, es un candidato comodo para experimentar con LoRA o destilacion adicional en una sola GPU.
- Despliegue en hardware de consumo para demos: con ~3,2 GB en bfloat16 cabe en GPUs de 8-12 GB, lo que permite montar asistentes conversacionales locales de un solo usuario.
- Evaluacion comparativa de decodificacion y kernels: util para validar implementaciones de MLA y Gated DeltaNet en stacks como vLLM frente a una referencia densa.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada para `HyLo-Llama-8MLA8GDN-8K-SFT` con la lista de resultados vacia (`results: []`). La model card menciona que las cifras del paper (Tabla 2, backbone Llama-3.2-1B) se midieron 0-shot con EleutherAI lm-evaluation-harness y anuncia una seccion "Commonsense", pero los valores no estan incluidos en la informacion disponible. Tampoco se incluyen en el material proporcionado los numeros de RULER que la propia model card cita como referencia para justificar el limite de 8K.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso del modelo en memoria: aproximadamente 6,4 GB en float32 (precision del checkpoint), 3,2 GB en bfloat16 (precision recomendada para cargar), ~1,6 GB en int8 y ~0,9 GB en int4 si se cuantiza por cuenta propia.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4070/4080, RTX 4090 y en GPUs de 8 GB en bfloat16. En 4 bits cabria incluso en iGPU con memoria compartida.
- GPU de datacenter: A100, H100, MI300X y similares son sobredimensionadas para un modelo de 1,6B; se usarian para servir muchas replicas o para el proceso de entrenamiento (la receta original uso 8x MI300X con FSDP).
- Memoria de cache KV: es el principal atractivo del checkpoint, con solo el 7,8 % de la del modelo base, lo que permite muchas mas secuencias simultaneas para la misma VRAM.
- Opciones de despliegue: la model card advierte que los stacks de serving dimensionan la cache a partir de `max_position_embeddings`, asi que hay que fijar el limite explicitamente (por ejemplo `--max-model-len 8192`). El soporte concreto de MLA y Gated DeltaNet en vLLM, TGI, llama.cpp u Ollama no se detalla en la informacion proporcionada; se requiere un stack con kernels para ambos tipos de capa.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Nota de precision: los pesos estan en float32; cargarlos en bfloat16 es la recomendacion explicita del autor, lo que reduce a la mitad el uso de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cache KV | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyLo-Llama-8MLA8GDN-8K-SFT | 1,61B | 8.192 tokens entrenados (131.072 en config, no soportado) | 7,8 % del base | AMD research-only (no comercial) | HuggingFace, safetensors |
| meta-llama/Llama-3.2-1B-Instruct (base) | 1,24B | 128.000 tokens | Cache KV completa | Llama 3.2 Community License | HuggingFace, safetensors, GGUF de terceros |
| meta-llama/Llama-3.1-8B-Instruct (profesor) | 8,03B | 128.000 tokens | Cache KV completa | Llama 3.1 Community License | HuggingFace, safetensors, GGUF de terceros |
| Otras alternativas de ~1,5B en idioma ingles | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion relevante es contra el propio modelo base: HyLo anade 0,37B de parametros respecto a Llama-3.2-1B-Instruct y renuncia a la mayor parte del contexto nominal a cambio de una cache KV 12,8 veces menor. Frente a alternativas densas de tamano similar, no se dispone de datos de rendimiento publicados en la informacion proporcionada que permitan una comparacion cuantitativa honesta.

## Limitaciones y advertencias

- Licencia de solo investigacion: la licencia efectiva es `amd-hybrid-models-research-only-rail-ms`. Aunque el frontmatter tambien declara `apache-2.0`, existe una contradiccion explicita en la propia model card y debe asumirse la restriccion de uso no comercial. Verificar el fichero LICENSE antes de cualquier uso.
- Limite de contexto estricto: el modelo esta entrenado y evaluado a 8.192 tokens. `max_position_embeddings` vale 131.072 porque se hereda del base, pero el autor advierte que superarlo degrada la calidad y no esta medido. Hay que forzar el limite en el stack de serving.
- Modelo solo en ingles: no hay soporte declarado de otros idiomas.
- Riesgo de alucinacion: es un modelo de 1,6B destilado de un profesor de 8B; la destilacion y el SFT no eliminan los errores facticos tipicos de esta escala, y el ajuste sobre datos matematicos puede inducir respuestas erroneas con formato muy seguro.
- Posible perdida de capacidades respecto al base: al reconvertir capas de atencion completa a bloques lineales recurrentes, la fidelidad en tareas que dependen de recuperacion exacta dentro del contexto puede verse afectada, especialmente cerca del limite de 8K.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento del lanzamiento, sin validacion independiente de las cifras declaradas.
- Resultados de benchmarks no publicados: no hay numeros verificables en la informacion disponible, ni siquiera del paper en el material aportado.
- Rendimiento y latencia sin medir publicamente: no hay datos de throughput que permitan estimar el coste real de servir el modelo.
- Requisitos de kernel: MLA y Gated DeltaNet requieren soporte especifico en el stack de inferencia; cargar el modelo en herramientas que solo entiendan transformers densos estandar no funcionara sin kernels dedicados.
- Pesos en float32: duplican el uso de memoria frente a bfloat16 si no se convierte al cargar.
- Mezcla de datos con licencia restrictiva: una de las fuentes de SFT, `nvidia/ChatQA2-Long-SFT-data`, tiene licencia cc-by-nc-2.0, lo que refuerza la limitacion de uso no comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/HyLo-Llama-8MLA8GDN-8K-SFT
- Paper: Long-Context Aware Upcycling: A New Frontier for Hybrid LLM Scaling — https://arxiv.org/abs/2604.24715
- Referencia adicional citada en los tags: arXiv:2505.17272 — https://arxiv.org/abs/2505.17272
- Referencia adicional citada en los tags: arXiv:2503.11132 — https://arxiv.org/abs/2503.11132
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Profesor de destilacion: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset JunxiongWang/sftdatasetv3: https://huggingface.co/datasets/JunxiongWang/sftdatasetv3
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset open-thoughts/OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset open-r1/OpenR1-Math-220k: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset nvidia/ChatQA2-Long-SFT-data: https://huggingface.co/datasets/nvidia/ChatQA2-Long-SFT-data
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
