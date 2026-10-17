# dleemiller/finecat-nli-v2-xl

## Resumen

FineCat-NLI v2 XL es un cross-encoder de inferencia de lenguaje natural (NLI) desarrollado por dleemiller y afinado a partir de `jhu-clsp/ettin-encoder-1b`, un encoder transformer de 1.031.269.123 parámetros. Dado un texto (premisa) y una afirmación (hipótesis), devuelve probabilidades para `entailment`, `neutral` y `contradiction`; no genera texto. La model card lo presenta como una herramienta para clasificación zero-shot, reranking, verificación de respuestas en RAG y guardrails.

El modelo maneja documentos de hasta 8k tokens, se distribuye con licencia Apache-2.0 y está pensado para inglés. Su interés práctico está en que un encoder de 1B puede resolver tareas de clasificación y verificación con una pasada por par, con un throughput reportado de 254,42 pares/s en una Nvidia Blackwell PRO 6000 Max-Q. El autor declara 0,8445 de accuracy en FineCat NLI test y 0,8282 de media en 45 datasets NLI.

No es un LLM generativo ni un modelo de propósito general: es un componente de clasificación y verificación que encaja en pipelines de recuperación, moderación y enrutamiento. Su adopción pública es todavía baja (55 descargas y 0 likes en Hugging Face), y los resultados son declarados por el autor, no verificados de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer encoder (familia ModernBERT/Ettin), denso, no generativo |
| Parámetros totales | 1.031.269.123 (1,03B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 8.000 tokens (documentos de hasta 8k tokens, según el autor) |
| Tipos de cuantización | no disponible; el repositorio publica safetensors y no documenta GGUF, GPTQ, AWQ ni ONNX cuantizado |
| Idiomas soportados | en (inglés); no se declaran otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería sentence-transformers) |
| Pipeline | zero-shot-classification |
| Tamaño del repositorio | 4,1 GB |
| Descargas / likes | 55 / 0 según Hugging Face |

## Arquitectura y entrenamiento

El modelo es un cross-encoder denso basado en un transformer encoder de la familia ModernBERT/Ettin, concretamente `jhu-clsp/ettin-encoder-1b`. Procesa conjuntamente el par premisa-hipótesis y produce tres logits: `entailment`, `neutral` y `contradiction`. No es un modelo generativo, no es MoE y no incorpora cabezas de visión, audio ni tool calling. La salida es una distribución de tres clases por par.

El ajuste se realizó sobre el dataset `dleemiller/FineCat-NLI`, con 2.045.406 ejemplos y una `DistillationLoss`. La familia FineCat-NLI se describe como una compilación de fuentes NLI como MNLI, SNLI y ANLI, con cribado de calidad y reducción de ejemplos fáciles en el split de entrenamiento. No se documentan RLHF, DPO ni ajuste instruccional; es un clasificador supervisado. El autor no publica el número exacto de tokens de entrenamiento en la información disponible.

## Capacidades

- Inferencia de lenguaje natural de tres clases: determina si una hipótesis se sigue de una premisa (`entailment`), la contradice (`contradiction`) o es neutra (`neutral`).
- Clasificación zero-shot: convierte cada etiqueta en una hipótesis del tipo «This text is about...» y usa la probabilidad de `entailment` para asignar categorías.
- Reranking cross-encoder: puntúa pares consulta-documento y reordena candidatos recuperados por un sistema vectorial.
- Verificación de grounding en RAG: compara pasajes recuperados con respuestas generadas para detectar respuestas no respaldadas por el contexto.
- Guardrails y moderación: evalúa mensajes frente a afirmaciones de política o seguridad.
- Routing y triage: clasifica intenciones o departamentos a partir de hipótesis como «The user wants to set an alarm».
- Extracción clínica y social: verifica afirmaciones como «The patient is unemployed» a partir de notas clínicas.
- Preguntas de opción múltiple: trata cada opción como una hipótesis y selecciona la de mayor probabilidad de `entailment`.
- Documentos largos: admite documentos de hasta 8k tokens, útil para hilos de correo, informes y notas extensas.
- No soporta generación de texto, tool calling generativo, planificación de agentes, visión ni audio. Puede usarse como verificador o router dentro de un pipeline de agentes, pero no es un agente por sí mismo.
- Solo inglés: no hay soporte multilingüe declarado.

## Casos de uso

- Clasificación zero-shot de tickets o correos: se construye una hipótesis por etiqueta («This text is about billing») y se aplica softmax sobre la probabilidad de `entailment`. Con 8k tokens puede clasificar hilos largos sin truncar. El autor reporta 93,0% en 18 tareas de clasificación zero-shot.
- Verificación de respuestas en RAG: se introduce el pasaje recuperado como premisa y la respuesta generada como hipótesis. Si la probabilidad de `entailment` cae por debajo de un umbral, la respuesta se marca para revisión o se regenera. El autor reporta 0,82 F1 en RAGTruth.
- Guardrails y moderación: se compara el mensaje con afirmaciones de política («This message contains a threat»). Las probabilidades permiten fijar umbrales y derivar casos dudosos a revisión humana. El autor reporta 92,5% en CrossingGuard y 94,0% en insultos de Wikipedia.
- Routing y triage de intenciones: hipótesis como «The user wants to set an alarm» permiten elegir la intención con mayor probabilidad de `entailment`. Es adecuado para asistentes y centros de contacto con muchas etiquetas. El autor reporta 97,7% en intents MASSIVE.
- Reranking en búsqueda semántica: se puntúa cada par consulta-documento y se reordena el top-k de un retriever vectorial. El coste es lineal con el número de pares y el throughput reportado es 254,42 pares/s.
- Extracción de información clínica y social: se usan notas clínicas como premisa y afirmaciones como «The patient is unemployed» como hipótesis. El autor reporta 98,8% en SDOH-NLI.
- Evaluación y curación de datasets NLI: detectar pares contradictorios o mal etiquetados en MNLI, SNLI o ANLI, filtrando por confianza del modelo.
- Preguntas de opción múltiple: cada opción se convierte en una hipótesis y se selecciona la de mayor probabilidad de `entailment`. Útil para evaluación de comprensión lectora y clasificación jerárquica.
- Detección de contradicciones en documentación: comparar afirmaciones de artículos, informes o contratos; con 8k tokens se pueden analizar secciones completas.

## Benchmarks y rendimiento

No se reportan MMLU, HumanEval o GSM8K porque el modelo no es generativo. Las métricas disponibles son de NLI y clasificación. El `model-index` declara una accuracy de 0,8445 en `dleemiller FineCat NLI test`, con `verified: false`.

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---:|---|
| Cross-encoder classification | dleemiller FineCat NLI test | Accuracy | 0,8445 | No |

Evaluación extendida declarada por el autor. F1-micro equivalente a accuracy; selección de métricas de la tabla de la model card.

| Modelo | FineCat | Avg 45 | MNLI | SNLI | ANLI-R2 | WANLI | Pares/s | Pico MB |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `dleemiller/finecat-nli-v2-xl` (este) | 0,8445 | 0,8282 | 0,9202 | 0,9356 | 0,6600 | 0,7710 | 254,42 | 4.649,37 |
| `dleemiller/finecat-nli-ultra-l` | 0,8388 | 0,8234 | 0,9127 | 0,9303 | 0,6400 | 0,7694 | 624,67 | 1.857,54 |
| `dleemiller/finecat-nli-v2-l` | 0,8359 | 0,8204 | 0,9165 | 0,9328 | 0,6020 | 0,7674 | 636,71 | 1.982,06 |
| `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli` | 0,8233 | 0,6803 | 0,9121 | 0,8898 | 0,6830 | 0,7700 | 454,96 | 3.250,44 |
| `dleemiller/finecat-nli-l` | 0,8227 | 0,7357 | 0,9152 | 0,9162 | 0,5700 | 0,7706 | 539,04 | 1.838,06 |
| `tasksource/ModernBERT-large-nli` | 0,7959 | 0,7301 | 0,8983 | 0,9188 | 0,5110 | 0,6978 | 543,44 | 1.838,06 |
| `dleemiller/ModernCE-large-nli` | 0,7811 | 0,6859 | 0,9088 | 0,9273 | 0,4860 | 0,6576 | 540,74 | 1.838,06 |
| `cross-encoder/nli-deberta-v3-large` | 0,7618 | 0,6014 | 0,9019 | 0,9220 | 0,4170 | 0,6548 | 448,35 | 3.250,44 |

## Requisitos de hardware

- VRAM estimada: los pesos en fp16 ocupan aproximadamente 2,1 GB; en fp32, aproximadamente 4,1 GB. El autor reporta un pico de 4.649,37 MB con lote de 32 en una Nvidia Blackwell PRO 6000 Max-Q.
- GPU recomendadas: A100, H100 o L40S para throughput alto; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y evaluación.
- GPU de consumo: por tamaño, el modelo cabe en GPUs de 8 GB o más con lotes pequeños; para lotes medianos o grandes se recomienda 16 GB o más. Es una estimación por tamaño, no un dato publicado.
- Despliegue: la vía documentada es `sentence-transformers` con `CrossEncoder` sobre PyTorch. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- Throughput: 254,42 pares/s con lote de 32 en la GPU indicada. No se reporta latencia por petición.
- Memoria: 4.649,37 MB de pico con lote de 32. Para despliegues con lotes mayores hay que validar el consumo en la GPU objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FineCat | Avg 45 | Pares/s | Licencia |
|---|---|---:|---:|---:|---:|---|
| `dleemiller/finecat-nli-v2-xl` | 1,031B | 8k | 0,8445 | 0,8282 | 254,42 | Apache-2.0 |
| `dleemiller/finecat-nli-ultra-l` | no disponible | no disponible | 0,8388 | 0,8234 | 624,67 | no disponible |
| `dleemiller/finecat-nli-v2-l` | no disponible | no disponible | 0,8359 | 0,8204 | 636,71 | no disponible |
| `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli` | no disponible | 512 en la evaluación | 0,8233 | 0,6803 | 454,96 | no disponible |
| `tasksource/ModernBERT-large-nli` | no disponible | no disponible | 0,7959 | 0,7301 | 543,44 | no disponible |

Frente a `finecat-nli-ultra-l` y `finecat-nli-v2-l`, este modelo gana en accuracy media de 45 datasets (0,8282 frente a 0,8234 y 0,8204) pero pierde en throughput (254,42 frente a 624,67 y 636,71 pares/s) y consume más memoria. Frente a DeBERTa-v3-large, la mejora en la media de 45 datasets es amplia (0,8282 frente a 0,6803), aunque DeBERTa conserva mejor ANLI-R2 en esta tabla (0,6830 frente a 0,6600). La licencia de las alternativas no se indica en la información disponible.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe declarado. Para castellano habría que evaluar la transferencia o hacer fine-tuning.
- Sesgos de NLI: al entrenarse con MNLI, SNLI, ANLI y otras fuentes, puede heredar sesgos de género, dominio y artefactos de anotación. No se documenta una auditoría de sesgos.
- Riesgo de verificación falsa: no genera texto, pero puede producir falsos positivos o falsos negativos. No debe usarse como única barrera en moderación, decisiones clínicas o cumplimiento normativo.
- Calibración: el autor presenta probabilidades calibradas, pero no se aportan detalles del proceso de calibración ni una verificación independiente. Los umbrales deben validarse en cada dominio.
- Benchmarks no verificados: el `model-index` marca `verified: false`. Las 55 descargas y 0 likes indican poca validación externa.
- Licencia: el modelo es Apache-2.0, pero no se detalla la licencia de los datasets de entrenamiento en la información disponible. Conviene revisar `dleemiller/FineCat-NLI` antes de un uso comercial.
- Contexto largo: aunque declara documentos de hasta 8k tokens, no se documentan evaluaciones específicas a esa longitud; los comparadores DeBERTa se evalúan a 512 tokens.
- No apto para generación, tool calling ni agentes: es un encoder de clasificación. Para un asistente generativo haría falta combinarlo con un LLM.
- Coste en retrieval: un cross-encoder requiere una pasada por par. Para grandes colecciones debe usarse en segunda fase sobre un top-k, no como retriever inicial.

## Enlaces

- [Hugging Face: dleemiller/finecat-nli-v2-xl](https://huggingface.co/dleemiller/finecat-nli-v2-xl)
- [Modelo base: jhu-clsp/ettin-encoder-1b](https://huggingface.co/jhu-clsp/ettin-encoder-1b)
- [Dataset: dleemiller/FineCat-NLI](https://huggingface.co/datasets/dleemiller/FineCat-NLI)
- [Colección FineCat NLI](https://huggingface.co/collections/dleemiller/finecat-nli)
- [Modelo relacionado: dleemiller/finecat-nli-l](https://huggingface.co/dleemiller/finecat-nli-l)
- [Ficha en free2aitools](https://free2aitools.com/model/dleemiller/finecat-nli-v2-xl)
- [Perfil de dleemiller en SAVRN](https://savrn.com/model-publishers/dleemiller)
- [Ficha de finecat-nli-l en SAVRN](https://savrn.com/models/finecat-nli-l)

No se han encontrado paper, blog técnico, repositorio adicional ni demo en la información disponible.
