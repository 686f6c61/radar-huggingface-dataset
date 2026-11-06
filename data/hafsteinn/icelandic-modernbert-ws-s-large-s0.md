# hafsteinn/icelandic-modernbert-ws-S-large-s0

## Resumen

`hafsteinn/icelandic-modernbert-ws-S-large-s0` es un encoder ModernBERT de 377,8 millones de parámetros entrenado desde cero (inicialización aleatoria) para islandés, publicado por el autor hafsteinn junto al artículo "Beyond IceBERT: Open-Data ModernBERT Encoders for Icelandic from 12M to 1B Parameters" (arXiv:2610.36230). Forma parte de un estudio sistemático sobre *warm start*: se compara el entrenamiento desde cero con el arranque a partir de encoders ingleses de idéntica forma (familia Ettin) para medir cuántos tokens islandeses ahorra realmente el *warm start*. Este checkpoint concreto es la rama *scratch* (denominada S en el código) del tamaño `large`, con semilla de preentrenamiento 0 y un presupuesto de 80 tokens por parámetro.

El modelo emplea la arquitectura ModernBERT (pre-norm, GeGLU, sin sesgos, RoPE con atención global cada tercera capa y ventana local de 128 tokens en el resto), con 28 capas, dimensión oculta 1024 y 16 cabezas de atención. El tokenizador es un BPE a nivel de byte específico para islandés con 32.768 tokens. La tarea de cabecera es *fill-mask* (MLM), por lo que está pensado como base para *fine-tuning* en tareas de comprensión del islandés (QA, NER, análisis sintáctico, detección de errores) y no como modelo generativo.

Su relevancia actual reside en que es uno de los pocos encoders ModernBERT de alta calidad entrenados exclusivamente con datos abiertos para un idioma de bajos recursos como el islandés, con licencia MIT y métricas downstream publicadas con intervalos de confianza. El corpus de entrenamiento no se libera por restricciones de licencia de las fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (pre-norm, GeGLU, sin biases, RoPE theta 160k global / 10k local, atención global cada 3 capas, ventana local de 128 tokens) |
| Parametros totales | 377.841.664 (33,6M de embeddings + 344,3M no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ModernBERT soporta secuencias largas, pero la model card no declara un máximo explícito para este checkpoint) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | islandés (is) |
| Licencia | MIT |
| Formato de pesos | safetensors (carga con `transformers` `AutoModelForMaskedLM`, `model_type: modernbert`) |
| Capas / dimension oculta / cabezas | 28 / 1024 / 16 (GeGLU interno 2624) |
| Tokenizador | BPE byte-level islandés, 32.768 tokens |
| Tamano del repo | 6,0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ModernBERT: transformer encoder con pre-normalización, activación GeGLU, eliminación de términos de sesgo, RoPE con theta 160.000 en las capas de atención global y 10.000 en las locales, atención global cada tercera capa y ventana deslizante de 128 tokens en las demás. La forma es de 28 capas con dimensión oculta 1024, capa interna GeGLU de 2624 y 16 cabezas. El tokenizador es un BPE a nivel de byte entrenado específicamente para islandés con vocabulario de 32.768 tokens.

El entrenamiento se realizó sobre 30,23B tokens (80 tokens por parámetro) en 28.827 pasos de 1.048.576 tokens cada uno, con objetivo MLM al 30% de enmascaramiento (15% en la fase de decaimiento). El optimizador fue AdamW (betas 0,9/0,98, eps 1e-6, weight decay 1e-5, clip 1.0) con autocast bf16. El schedule es warmup-stable-decay: 907M tokens de warmup, LR pico 0,0004, decaimiento 1-sqrt sobre el último 15% y últimos 10% a 8.192 tokens. El corpus consta de 9,02B tokens únicos procedentes de nueve fuentes abiertas (IGC-2024 parte abierta, Wikipedia islandesa, subconjuntos no-IGC de Dynaword, MaCoCu, FineWeb-2, FinePDFs, HPLT 3.0, MADLAD-400 e IC3-v2), deduplicados, filtrados y decontaminados contra los conjuntos de evaluación. El hardware fue MareNostrum 5 (nodos de 4x H100 de 64 GB), con DDP y FlexAttention con máscaras de documento.

Este checkpoint es la "rama principal" a 80 tokens por parámetro: conservó su estado al inicio de la fase de decaimiento de cada presupuesto más corto, y las ramas `b10`, `b20` y `b40` del mismo repo continúan desde esos estados.

## Capacidades

- Relleno de máscaras (masked language modeling) en islandés: predice el token enmascarado en una secuencia.
- Representaciones contextuales de alta calidad para *fine-tuning* en tareas de comprensión del islandés.
- Clasificación de secuencias y etiquetado a nivel de token tras ajuste fino (NER, POS, aceptabilidad).
- Detección de errores gramaticales y de aceptabilidad lingüística tras ajuste fino.
- Extracción de características para *retrieval* o *reranking* (previo ajuste fino; no entrenado específicamente para ello).
- No soporta *tool calling*, agentes ni generación de texto libre: es un encoder MLM, no un modelo causal.
- Capacidad multilingüe: no disponible (solo islandés).

## Casos de uso

- **Detección de errores gramaticales en islandés**: ajustando el encoder sobre corpus anotados (como IceEC) se obtiene un detector de errores a nivel de oración con MCC en torno a 51,6, útil en herramientas de corrección para redacción administrativa o periodística.
- **Etiquetado de entidades nombradas (NER)**: con ajuste fino sobre MIM-GOLD-NER alcanza F1 micro de entidad de 94,4, adecuado para extracción de personas, organizaciones y lugares en corpus islandeses.
- **Análisis morfosintáctico (POS tagging)**: tras ajuste fino sobre los treebanks UD islandeses logra precisión UPOS de 95,6, aprovechable en pipelines de anotación lingüística y lingüística computacional.
- **Búsqueda semántica y reranking en corpus islandeses**: usando las representaciones del encoder como base para un modelo bi-encoder o cross-encoder afinado, adecuado para buscadores internos de documentación en islandés.
- **Evaluación de aceptabilidad lingüística**: ajustado sobre los treebanks UD islandeses (estilo ScaLA) alcanza MCC de 76,5, útil como filtro de calidad en la construcción de corpus o en la validación de textos generados.
- **Respuesta a preguntas extractiva**: con ajuste fino sobre NQiI y RUQuAD-1 logra F1 de token de 56,1, aplicable a asistentes de consulta sobre documentación islandesa.
- **Filtrado y curación de corpus**: el modelo puede emplearse como clasificador de calidad o de dominio (dado su bajo coste de inferencia frente a modelos generativos) para depurar nuevos corpus islandeses antes de entrenar modelos mayores.

## Benchmarks y rendimiento

Resultados downstream del punto (tamaño `large`, 80 tokens por parámetro) publicados en la model card. Las puntuaciones están multiplicadas por 100 y agregan semillas de preentrenamiento y de ajuste fino; los intervalos son bootstrap jerárquico al 95%.

| Tarea | Puntuación [IC 95%] | Semillas preentrenamiento | Runs fine-tuning |
|---|---|---|---|
| QA: NQiI + RUQuAD-1, F1 de token | 56,1 [54,5; 57,6] | 1 | 5 |
| NER: MIM-GOLD-NER (split IceBERT), F1 micro de entidad | 94,4 [93,7; 95,1] | 1 | 5 |
| Aceptabilidad estilo ScaLA (treebanks UD islandeses), MCC | 76,5 [72,7; 80,1] | 1 | 5 |
| IceEC detección de errores a nivel de oración, MCC | 51,6 [49,5; 53,7] | 1 | 5 |
| UD UPOS accuracy | 95,6 [95,2; 95,9] | 1 | 5 |

Pérdida MLM retenida (15% de enmascaramiento) al final del entrenamiento por fuente: dynaword 0,455; finepdfs 1,169; fineweb2 1,059; hplt3 1,083; ic3v2 0,726; igc 0,741; macocu 0,961; madlad 0,881; wiki 0,590. La model card no publica comparaciones numéricas frente a IceBERT u otros encoders islandeses en la información disponible; las columnas "minus scratch, same budget" y "minus scratch at 160" aparecen vacías en el material proporcionado.

## Requisitos de hardware

- **VRAM para inferencia**: con pesos en fp32 el modelo ocupa ~1,5 GB; en bf16/fp16 ~0,76 GB; en int8 ~0,38 GB. La activación depende de la longitud de secuencia; para secuencias de 512 tokens el consumo total se mantiene por debajo de 2-3 GB en bf16.
- **GPU recomendadas**: cualquier GPU consumer moderna sirve para inferencia y ajuste fino ligero. Una RTX 4090 (24 GB) permite ajuste fino con batches razonables; una RTX 3060/4060 (8-12 GB) es suficiente para inferencia y ajuste fino con gradientes acumulados o *gradient checkpointing*.
- **Cabe en GPU consumer**: sí, en todas las GPU con al menos 4 GB de VRAM para inferencia en bf16.
- **GPU de datacenter**: A100 (40/80 GB), H100 (80 GB) o L40S permiten ajuste fino a mayor throughput; el preentrenamiento original usó nodos de 4x H100 de 64 GB.
- **Opciones de despliegue**: `transformers` (`AutoModelForMaskedLM`), `optimum`/ONNX Runtime, TorchScript, `text-embeddings-inference` (si se usa como encoder), y exportación a GGUF vía `llama.cpp` (aunque el repo no distribuye GGUF oficial). No aplica vLLM/TGI en su modo generativo porque no es un modelo causal.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `hafsteinn/icelandic-modernbert-ws-S-large-s0` | 377,8M | no disponible | MIT | Hugging Face | Encoder ModernBERT islandés, datos abiertos, métricas downstream publicadas |
| IceBERT (Snæbjarnarson et al., LREC 2022) | no disponible en la información | no disponible | no disponible | Hugging Face | Baseline islandés previo; el artículo lo cita como referencia y motivación del *warm start* |
| Encoders Ettin (familia inglesa) | varias tallas (misma forma que este `large`) | no disponible | no disponible | no disponible | Usados como fuente de *warm start* en el estudio; no son modelos islandeses |
| ModernBERT-base (inglés, Answer.AI) | ~149M | 8.192 tokens | Apache 2.0 | Hugging Face | Referencia arquitectónica; no entrenado en islandés |

No se dispone en la información proporcionada de comparaciones numéricas directas frente a IceBERT u otros encoders islandeses.

## Limitaciones y advertencias

- **Un solo seed de preentrenamiento** en los tamaños base, large y xl (1B): los intervalos de confianza cubren solo el ruido de ajuste fino y de ítems de test, no la variabilidad de preentrenamiento.
- **Ruido de preentrenamiento documentado**: la curva *scratch* de `large` se entrenó después del resto del estudio (26 oct 2026) y alcanza 0,852 y 0,848 de pérdida de validación frente al modelo de la escalera; coinciden en ±0,1 puntos en QA, NER y POS, pero esta ejecución es 3,1 MCC superior en aceptabilidad y 1,5 en detección de errores, diferencia que los IC no cubren.
- **Riesgo de alucinación**: al ser un modelo MLM, no genera texto libre, pero el relleno de máscaras puede producir predicciones plausibles pero incorrectas en contextos ambiguos.
- **Formato del token de máscara**: debe escribirse pegado a la palabra anterior (`höfuðborg[MASK].`); si se antepone un espacio, el tokenizador lo trata como token propio y el modelo tiende a predecir dígitos.
- **Solo islandés**: no soporta otros idiomas; el vocabulario y el corpus son exclusivamente islandeses.
- **Corpus no liberado**: aunque el modelo es MIT, el corpus de entrenamiento no se publica porque no todas las fuentes permiten redistribución. Parte de los datos requiere atribución (CC BY 4.0: IGC; CC BY-SA: Wikipedia, Wikisource) o proviene de rastreos web con derechos mixtos (IC3-v2 sin licencia declarada).
- **MIM-GOLD y MIM-GOLD-NER** (solo evaluación) están licenciados para uso en investigación, por lo que no se libera ningún modelo ajustado fino sobre ellos.
- **Uso comercial**: la licencia MIT del checkpoint permite uso comercial, pero conviene revisar las obligaciones de atribución derivadas de las fuentes de datos si se redistribuye el modelo o derivados.
- **Ajuste fino en bf16**: los parsers requieren volver a fp32 cuando aparecen valores no finitos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hafsteinn/icelandic-modernbert-ws-S-large-s0
- Artículo: https://arxiv.org/abs/2610.36230 (Beyond IceBERT: Open-Data ModernBERT Encoders for Icelandic from 12M to 1B Parameters)
- IceBERT (referencia citada): Snæbjarnarson et al., LREC 2022
- ModernBERT (arquitectura base): no disponible enlace en la información proporcionada
- Repositorio de datos y código del estudio: no disponible en la información proporcionada
