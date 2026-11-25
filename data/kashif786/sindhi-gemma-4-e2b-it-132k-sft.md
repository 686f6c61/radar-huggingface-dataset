# Kashif786/sindhi-gemma-4-E2B-it-132k-sft

## Resumen
Sindhi-Gemma-4-E2B-it-132k-sft es un modelo de lenguaje causal especializado en sindhi, desarrollado por el usuario Kashif786 a partir de google/gemma-4-E2B-it. El modelo parte de los 5.100 millones de parametros del Gemma 4 E2B original y aplica una poda quirurgica del 50 % del vocabulario y de la torre de modalidad (de 262.144 a 131.072 tokens), seguida de una extension de 1.536 tokens BPE de morfologia sindhi hasta un vocabulario total de 132.608 entradas. El resultado son 3.472.645.411 parametros reales (segun safetensors) y un peso de repositorio de 13,9 GB.

El modelo se entrena en dos etapas: un preentrenamiento continuado con tasas de aprendizaje duales (checkpoint intermedio sindhi-gemma-4-E2B-it-132k-cpt, con perplejidad a nivel de palabra en sindhi de 8,339) y un ajuste supervisado tambien con LR dual y una tecnica de "Zero-Sum Positional Anagram De-Collision" sobre el dataset Sindhi-Assistant-IFT-1500 (2.482 conversaciones auditadas). El objetivo declarado es reducir parametros y VRAM un 32 % manteniendo o superando al modelo base de Google en QA, RAG, etiquetado POS y traduccion EN↔SD.

Es relevante porque aborda un idioma de bajos recursos (sindhi, escrito en escritura arabe extendida) con un modelo compacto que cabe en GPUs de consumo y que declara mejoras medibles frente a su base en tareas concretas de recuperacion aumentada y morfologia, ademas de soportar ingles y urdu.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Gemma 4, `gemma4_text`), con poda de vocabulario y de modalidad |
| Parametros totales | 3.472.645.411 (3,47 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible de forma explicita; la model card mide capacidad RAG sobre ventanas de 2.048 tokens (1.286 palabras sindhi por ventana) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors BF16; no se listan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | sindhi (sd), ingles (en), urdu (ur) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo es un transformer causal decoder-only de la familia Gemma 4 (`gemma4_text`). La innovacion principal no esta en el bloque de atencion sino en el tokenizador y en el recorte del modelo base: se elimina el 50 % del vocabulario original (262.144 → 131.072) y la torre de modalidad asociada, y se anaden 1.536 tokens BPE optimizados para morfologia sindhi, alcanzando 132.608 entradas. Segun la model card, esto reduce la fertilidad de tokens en FLORES-200 de 2,17 a 1,60 tokens por palabra (-26,29 % de compresion) con cero colisiones entre urdu y arabe.

El entrenamiento consta de dos etapas. La primera es un preentrenamiento continuado con tasas de aprendizaje duales que produce el checkpoint `sindhi-gemma-4-E2B-it-132k-cpt` (perplejidad a nivel de palabra en sindhi de 8,339). La segunda es un ajuste supervisado fino, tambien con LR dual, sobre 2.482 conversaciones auditadas del dataset `Sindhi-Assistant-IFT-1500`, incorporando una tecnica denominada "Zero-Sum Positional Anagram De-Collision" cuyo detalle tecnico no se especifica en la informacion disponible. No se documentan volumen total de tokens de preentrenamiento, composicion del corpus ni uso de RLHF o DPO.

## Capacidades
- Generacion de texto y respuesta a preguntas en sindhi con formato conversacional (chat template con roles system/user).
- RAG (retrieval-augmented generation) con citacion de fuentes en formato `[حوالو 1/2/3]` y abtencion explicita cuando la respuesta no esta en el contexto.
- Etiquetado POS zero-shot con el inventario Universal Dependencies (15 etiquetas estrictas, 14 fusionadas).
- Traduccion bidireccional EN↔SD, con pureza de escritura sindhi declarada del 98,80 % y cero confusiones de la letra kaaf urdu `ک` frente a la sindhi `ڪ`.
- Comprension lectora y NLU (evaluado en Belebele y SIB-200).
- Capacidades multilingues limitadas a sindhi, ingles y urdu.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso
- Asistente de atencion al ciudadano en sindhi: el modelo puede responder consultas sobre documentos administrativos usando RAG, con abtencion controlada cuando la respuesta no figura en el contexto recuperado (100 % de abtencion correcta en las 10 preguntas no respondibles del benchmark declarado).
- Busqueda documental aumentada en sindhi: su tokenizador comprime el texto un 26,29 %, lo que permite meter 1.286 palabras sindhi en una ventana de 2.048 tokens (frente a 936 del base), util para indexar y responder sobre corpus legales o historicos.
- Traduccion EN→SD en publicacion de contenidos: con ChrF++ de 33,81 global y 35,03 en dominio curado, sirve para localizar articulos o documentacion tecnica al sindhi con revision humana posterior.
- Etiquetado morfosintactico en pipelines de NLP para sindhi: POS zero-shot con 57,80 % de exactitud estricta en UD_Sindhi-Isra, util como preanotador en proyectos de anotacion linguistica.
- Despliegue en hardware de consumo: con 6,488 GB de VRAM pico en BF16 en L40S, cabe en GPUs de 8 GB, lo que permite prototipado local y edge sin infraestructura de datacenter.
- Generacion de respuestas educativas en sindhi: QA sobre material escolar o cultural con contexto largo, gracias a la mayor densidad de palabras por ventana y a la reduccion de latencia (1,200 s por respuesta frente a 1,990 s del base).
- Preprocesamiento para sistemas de voz o subtitulado en sindhi: la pureza de escritura del 98,80 % reduce la necesidad de postprocesado de normalizacion de caracteres.

## Benchmarks y rendimiento
Resultados declarados por el autor, comparando con `google/gemma-4-E2B-it` (5,10 B, vocabulario 262k) en una NVIDIA L40S con bfloat16 y decodificacion greedy determinista.

| Suite | Metrica | Base (5,10 B) | Este modelo (3,47 B) | Delta |
|---|---|---|---|---|
| Tokenizer FLORES-200 | Tokens/palabra (fertilidad) | 2,17 | 1,60 | +26,29 % compresion |
| Belebele-900 RAG | Palabras por ventana de 2.048 tokens | 936 | 1.286 | +37,32 % |
| Hardware L40S BF16 | VRAM pico | 9,539 GB (OOM en 8 GB) | 6,488 GB | -32,0 % |
| Hardware L40S BF16 | Palabras/s y latencia | 12,50 w/s; 1,990 s | 18,27 w/s; 1,200 s | +46,2 %; -39,7 % |
| Hardware L40S BF16 | Energia por palabra | 10,024 J | 7,250 J | -27,7 % |
| Lite-QA-80 (8 tareas) | Token F1 / ChrF++ / Fact Recall | 55,96 % / 51,22 / 80,00 % | 67,97 % / 63,79 / 87,50 % | +12,01 % / +12,57 / +7,50 % |
| SD-WIKI-RAG-100 (90 respondibles) | Token F1 / ChrF++ / Entity Recall | 53,98 % / 45,76 / 69,42 % | 57,21 % / 50,31 / 72,26 % | +3,23 % / +4,55 / +2,84 % |
| SdQuAD-100 (20 tareas) | Token F1 / ChrF++ / glitches `'ڻڻ'` | 43,30 % / 42,55 / 2 | 45,27 % / 44,51 / 0 | +1,97 % / +1,96 / -2 |
| RAG multi-chunk top-3 | Citacion / abtencion | 10/10 / 10/10 | 10/10 / 10/10 | paridad |
| Belebele y SIB-200 | Open-RAG-100 / SIB-200 Acc | 34,0 % / 77,45 % | 34,0 % / 76,47 % | paridad / -0,98 % |
| POS zero-shot UD_Sindhi-Isra (500) | Estricto 15 / fusionado 14 / Macro-F1 | 45,00 % / 45,60 % / 40,21 % | 57,80 % / 58,60 % / 55,85 % | +12,80 % / +13,00 % / +15,64 % |
| Traduccion EN→SD (110) | Overall / FLORES / curado ChrF++ | 31,98 / 32,56 / 25,13 | 33,81 / 33,71 / 35,03 | +1,83 / +1,15 / +9,90 |
| Traduccion EN→SD (110) | BLEU / pureza de escritura / kaaf urdu | 7,81 / 95,22 % / 1/110 | 8,38 / 98,80 % / 0/110 | +0,57 / +3,58 % / -1 |
| Traduccion SD→EN (110) | Curado / Overall ChrF++ | 45,50 / 49,98 | 52,84 / 48,88 | +7,34 / -1,10 |

## Requisitos de hardware
- VRAM pico en BF16: 6,488 GB medidos en L40S, lo que permite ejecucion en GPU de 8 GB.
- GPU recomendadas: NVIDIA L40S (plataforma de evaluacion del autor), A100, H100 para mayor throughput; RTX 4090 y GPUs de 8 GB para inferencia.
- Cabe en GPU de consumo: si, segun la medicion declarada de 6,488 GB en BF16; en cuantizaciones de menor precision el consumo seria inferior, aunque no se publican cifras.
- Opciones de despliegue: transformers con `attn_implementation="sdpa"` y `device_map="auto"` (unica ruta documentada); el autor indica desactivar `torchao` (`sys.modules["torchao"] = None`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput declarados: 18,27 palabras sindhi/s y 1,200 s por respuesta en L40S BF16 (frente a 12,50 w/s y 1,990 s del base).

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| sindhi-gemma-4-E2B-it-132k-sft | 3,47 B | 132.608 | ventana evaluada de 2.048 tokens | gemma | Especializado en sindhi (RAG, POS, traduccion) |
| google/gemma-4-E2B-it (base) | 5,10 B | 262.144 | no disponible | gemma | Multilingue generalista |
| sindhi-gemma-4-E2B-it-132k-cpt | no disponible | 132.608 | no disponible | gemma | Checkpoint intermedio de preentrenamiento continuado |

No se dispone de datos de otros modelos especializados en sindhi en la informacion proporcionada para ampliar la comparativa.

## Limitaciones y advertencias
- El modelo hereda los sesgos del corpus de preentrenamiento de Gemma 4 y del dataset de ajuste, sin que se documente una evaluacion de sesgo.
- Riesgo de alucinacion en dominios no cubiertos; el autor mitiga con instrucciones de abtencion, pero solo se evaluo en 10 preguntas no respondibles.
- Cobertura linguistica limitada a sindhi, ingles y urdu; no se garantiza comportamiento en otros idiomas.
- La ventana de contexto efectiva no se declara de forma explicita; las metricas RAG se miden sobre 2.048 tokens, por lo que no hay evidencia publicada de rendimiento en contextos mas largos.
- Licencia Gemma: uso comercial sujeto a los terminos de Google, con obligaciones de atribucion y restricciones de uso aceptable.
- El modelo depende de una ruta de carga concreta (desactivar `torchao`, usar SDPA); no se documentan pesos GGUF ni soporte en motores de inferencia alternativos.
- Los benchmarks son autoinformados por el autor en una unica GPU y con decodificacion greedy; no se han replicado de forma independiente.
- El repositorio tiene 79 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kashif786/sindhi-gemma-4-E2B-it-132k-sft
- Checkpoint intermedio de preentrenamiento continuado: https://huggingface.co/Kashif786/sindhi-gemma-4-E2B-it-132k-cpt
- Modelo base de Google: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de ajuste supervisado: https://huggingface.co/datasets/Kashif786/Sindhi-Assistant-IFT-1500
