# dleemiller/finecat-nli-v2-l

## Resumen

FineCat-NLI v2 Large (`dleemiller/finecat-nli-v2-l`) es un cross-encoder especializado en inferencia de lenguaje natural (NLI) de tres clases —implicación (*entailment*), neutral y contradicción— publicado por el desarrollador independiente dleemiller bajo licencia Apache-2.0. Con 395.834.371 parámetros, es un ajuste fino del encoder `jhu-clsp/ettin-encoder-400m`, de la familia ModernBERT, y se distribuye a través de la librería `sentence-transformers`. Su función es recibir un par (premisa, hipótesis) y devolver probabilidades calibradas sobre las tres relaciones lógicas, lo que lo convierte en una pieza reutilizable para clasificación zero-shot, reranking y verificación de respuestas.

La relevancia de este modelo está en su versatilidad: al formular cualquier etiqueta como una hipótesis ("Este texto trata sobre facturación"), el cross-encoder resuelve tareas de enrutamiento, moderación, extracción de información o *grounding* de RAG sin entrenamiento adicional. Frente a los cross-encoders DeBERTa-v3 clásicos, limitados a 512 tokens, este modelo procesa documentos de hasta 8.000 tokens, lo que permite clasificar notas clínicas, contratos o pasajes largos en una sola pasada.

En la evaluación de 45 conjuntos publicada por el autor, el modelo obtiene una precisión macro media de 0,8204, frente a 0,6803 de `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli`, con un rendimiento de 636,71 pares por segundo y un pico de memoria de 1.982 MB en una GPU Blackwell PRO 6000 Max-Q. Es, por tanto, una opción orientada a producción con coste de inferencia bajo, aunque con una comunidad todavía muy reducida (120 descargas y 0 *likes* en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (cross-encoder), familia ModernBERT (Ettin) |
| Parámetros totales | 395.834.371 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 8.000 tokens por documento (8k según model card); el par premisa-hipótesis se trunca al límite del encoder |
| Tipos de cuantización | No se publican variantes cuantizadas oficiales; pesos en safetensors (fp32, ~1,6 GB de repositorio) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con `sentence-transformers` y `transformers`) |
| Pipeline declarado | `zero-shot-classification` |
| Etiquetas de salida | 0 = entailment, 1 = neutral, 2 = contradiction |
| Modelo base | `jhu-clsp/ettin-encoder-400m` |
| Dataset de entrenamiento | `dleemiller/FineCat-NLI` (2.045.406 ejemplos según metadatos) |
| Función de pérdida | `DistillationLoss` (destilación) |
| Throughput declarado | 636,71 muestras/s a batch 32 |
| Memoria GPU pico declarada | 1.982,06 MB a batch 32 |

## Arquitectura y entrenamiento

El modelo es un cross-encoder: concatena premisa e hipótesis en una única secuencia, la procesa con un encoder bidireccional y aplica una cabeza de clasificación de tres salidas sobre la representación agregada. El backbone es `jhu-clsp/ettin-encoder-400m`, un encoder de la familia ModernBERT de ~400 M de parámetros con soporte de contexto largo (hasta 8k tokens), lo que supone la principal diferencia estructural frente a los cross-encoders basados en DeBERTa-v3, limitados a 512 tokens. El repositorio declara los tags `modernbert` y `ettin`, y el tamaño del checkpoint coincide con el de la familia (395,8 M de parámetros reales en safetensors).

El entrenamiento se realizó sobre `dleemiller/FineCat-NLI`, una compilación de fuentes NLI de alta calidad (los tags del repositorio citan MNLI, SNLI y ANLI) con cribado de calidad y reducción de ejemplos fáciles en el split de entrenamiento, según la descripción pública de la familia FineCat-NLI. La pérdida declarada es `DistillationLoss`, lo que indica un régimen de destilación desde un modelo profesor; el profesor concreto, el número total de tokens vistos y la composición exacta del dataset no se detallan en la información disponible. No se reporta RLHF ni DPO, algo esperable en un encoder discriminativo y no generativo.

## Capacidades

- Inferencia de lenguaje natural de tres vías con probabilidades calibradas (implicación, neutral, contradicción) sobre pares premisa-hipótesis.
- Clasificación zero-shot: cualquier conjunto de etiquetas puede expresarse como hipótesis y puntuarse sin reentrenamiento.
- Reranking de recuperación: puntuación de relevancia consulta-documento en pipelines de búsqueda semántica.
- Detección de *grounding* en RAG: verificar si un pasaje recuperado implica la respuesta generada (0,81 F1 declarado en RAGTruth).
- Guardrails y moderación: evaluación de mensajes frente a políticas expresadas como sentencias (92,3 % en CrossingGuard, 94,3 % en insultos de Wikipedia según la model card).
- Enrutamiento y triaje de peticiones: asignación de intenciones (97,7 % en intenciones de MASSIVE).
- Extracción de información clínica y de determinantes sociales (98,4 % en SDOH-NLI).
- Procesamiento de documentos largos de hasta 8k tokens, útil para notas clínicas, contratos o artículos.
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado únicamente en inglés.
- No es un modelo generativo: no produce texto, no soporta *tool calling* ni razonamiento multi-paso por sí mismo; su papel en un agente es el de verificador o clasificador.

## Casos de uso

- **Enrutamiento de tickets de soporte**: cada categoría se formula como hipótesis ("Esta solicitud trata sobre facturación") y se compara la probabilidad de implicación entre etiquetas. Con 636 pares/s, un único nodo puede clasificar decenas de miles de tickets por hora sin entrenamiento supervisado específico.
- **Reranking en pipelines RAG**: tras una recuperación densa o BM25, el cross-encoder reordena los 50-100 candidatos por relevancia real consulta-pasaje, mejorando la precisión del contexto que llega al LLM generador.
- **Verificación de respuestas y detección de alucinaciones**: se comprueba si el pasaje recuperado implica la afirmación generada; la model card reporta 0,81 F1 en RAGTruth, adecuado como filtro previo a la respuesta final.
- **Guardrails de contenido en producción**: evaluar mensajes de usuario contra un conjunto de políticas escritas como sentencias, con latencias del orden de 1,57 ms por par a batch 32 en GPU, lo que permite inspección en línea sin cuello de botella.
- **Etiquetado zero-shot de reseñas y encuestas**: clasificación de opiniones por tema, sentimiento o causa raíz sin anotaciones, útil para analítica de producto sobre volúmenes que cambian de taxonomía con frecuencia.
- **Extracción de determinantes sociales en notas clínicas**: detección de condiciones como desempleo, aislamiento o falta de vivienda a partir de texto libre; el contexto de 8k permite procesar notas completas en lugar de fragmentos de 512 tokens.
- **Detección de contradicciones entre documentos**: comparar cláusulas de contratos, versiones de políticas internas o artículos científicos para señalar inconsistencias, aprovechando la ventana extendida.
- **Curación y filtrado de datasets**: descartar pares duplicados o inconsistentes en corpus de entrenamiento mediante la etiqueta de contradicción o implicación, como paso previo a la construcción de datos sintéticos.

## Benchmarks y rendimiento

Resultado declarado en el `model-index` de la model card (no verificado por un tercero, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Cross-encoder classification | dleemiller FineCat NLI test | Accuracy | 0,8359 |

Evaluación ampliada publicada por el autor (F1-micro, equivalente a accuracy), medida con batch 32 en una Nvidia Blackwell PRO 6000 Max-Q:

| Modelo | finecat | Media 45 sets | mnli | mnli_m | snli | anli_r1 | anli_r2 | anli_r3 | wanli | lingnli | Throughput (muestras/s) | Memoria pico (MB) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `dleemiller/finecat-nli-v2-xl` | **0,8445** | **0,8282** | **0,9202** | 0,9191 | **0,9356** | 0,7860 | 0,6600 | 0,6067 | **0,7710** | **0,8834** | 254,42 | 4.649,37 |
| `dleemiller/finecat-nli-ultra-l` | 0,8388 | 0,8234 | 0,9127 | 0,9131 | 0,9303 | 0,7910 | 0,6400 | 0,5833 | 0,7694 | 0,8714 | 624,67 | 1.857,54 |
| `dleemiller/finecat-nli-v2-l` (este modelo) | 0,8359 | 0,8204 | 0,9165 | 0,9127 | 0,9328 | 0,7740 | 0,6020 | 0,5733 | 0,7674 | 0,8776 | 636,71 | 1.982,06 |
| `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli` | 0,8233 | 0,6803 | 0,9121 | 0,9079 | 0,8898 | **0,7960** | **0,6830** | **0,6400** | 0,7700 | 0,8821 | 454,96 | 3.250,44 |
| `dleemiller/finecat-nli-l` | 0,8227 | 0,7357 | 0,9152 | **0,9265** | 0,9162 | 0,7480 | 0,5700 | 0,5433 | 0,7706 | 0,8742 | 539,04 | 1.838,06 |
| `tasksource/ModernBERT-large-nli` | 0,7959 | 0,7301 | 0,8983 | 0,9229 | 0,9188 | 0,7260 | 0,5110 | 0,4925 | 0,6978 | 0,8504 | 543,44 | 1.838,06 |
| `dleemiller/ModernCE-large-nli` | 0,7811 | 0,6859 | 0,9088 | 0,9205 | 0,9273 | 0,6630 | 0,4860 | 0,4408 | 0,6576 | 0,8566 | 540,74 | 1.838,06 |
| `cross-encoder/nli-deberta-v3-large` | 0,7618 | 0,6014 | 0,9019 | 0,9049 | 0,9220 | 0,5300 | 0,4170 | 0,3758 | 0,6548 | 0,8466 | 448,35 | 3.250,44 |

La media de 45 conjuntos es la accuracy macro sobre los 45 datasets de la evaluación ampliada, cada modelo ejecutado a su contexto máximo (512 tokens para los modelos DeBERTa). Los resultados son declarados por el autor y no han sido replicados de forma independiente.

## Requisitos de hardware

- **Peso de los parámetros**: ~1,58 GB en fp32 (tamaño real del repositorio, 1,6 GB); ~0,79 GB en fp16/bf16; ~0,40 GB en int8. Los pesos por sí solos caben en cualquier GPU consumer.
- **Memoria pico medida**: 1.982,06 MB con batch 32 en una Nvidia Blackwell PRO 6000 Max-Q, sobre pares de longitud moderada. Con documentos de 8k tokens las activaciones crecen de forma notable, por lo que conviene presupuestar entre 4 y 8 GB en configuraciones de contexto largo.
- **GPU recomendadas**: cualquier GPU con 8 GB o más para uso general (RTX 3060 12 GB, RTX 4070, RTX 4090, L4, L40S); A100/H100 no son necesarias salvo para lotes masivos o despliegues multi-cliente.
- **Cabe en GPU consumer**: sí, sin cuantización y con margen amplio en fp16, incluso en tarjetas de gama media; también es viable en CPU para volúmenes bajos o procesos batch nocturnos.
- **Opciones de despliegue**: `sentence-transformers` (`CrossEncoder`), `transformers` con `AutoModelForSequenceClassification`, exportación a ONNX Runtime mediante Optimum, Text Embeddings Inference (TEI) para servir cross-encoders, y Triton Inference Server para escalado. vLLM y TGI no aplican al no ser un modelo generativo.
- **Latencia y throughput**: 636,71 muestras/s a batch 32, es decir, ~1,57 ms por par en la GPU de referencia. El throughput escala casi linealmente con el tamaño de batch hasta saturar la GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | FineCat | Media 45 sets | Throughput (muestras/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `dleemiller/finecat-nli-v2-l` | 395,8 M | 8k tokens | 0,8359 | 0,8204 | 636,71 | Apache-2.0 | HuggingFace, `sentence-transformers` |
| `dleemiller/finecat-nli-v2-xl` | No disponible | No disponible | 0,8445 | 0,8282 | 254,42 | No disponible | HuggingFace |
| `dleemiller/finecat-nli-ultra-l` | No disponible | No disponible | 0,8388 | 0,8234 | 624,67 | No disponible | HuggingFace |
| `MoritzLaurer/DeBERTa-v3-large-mnli-fever-anli-ling-wanli` | No disponible | 512 tokens | 0,8233 | 0,6803 | 454,96 | No disponible | HuggingFace |
| `tasksource/ModernBERT-large-nli` | No disponible | No disponible (ModernBERT) | 0,7959 | 0,7301 | 543,44 | No disponible | HuggingFace |

Frente a `finecat-nli-v2-xl`, el modelo aquí descrito pierde 0,0086 puntos en FineCat y 0,0078 en la media de 45 conjuntos, pero multiplica por 2,5 el throughput y reduce el pico de memoria de 4.649 MB a 1.982 MB. Frente a los cross-encoders DeBERTa-v3, la mejora en la media de 45 conjuntos es de más de 14 puntos, con menor consumo de memoria y contexto 16 veces mayor, a costa de un rendimiento ligeramente inferior en los subconjuntos adversariales ANLI-r2 y ANLI-r3.

## Limitaciones y advertencias

- **Solo inglés**: no se ha entrenado ni evaluado en castellano ni en otros idiomas; su uso en producción multilingüe requeriría traducción previa o un modelo específico.
- **Modelo discriminativo**: no genera texto, no ejecuta *tool calling* ni planificación multi-paso. Cualquier uso agéntico debe delegar la generación en un LLM y usar este modelo como clasificador o verificador.
- **Rendimiento débil en inferencia adversarial**: ANLI-r2 (0,6020) y ANLI-r3 (0,5733) quedan por debajo de DeBERTa-v3-large (0,6830 y 0,6400), lo que indica menor robustez ante hipótesis deliberadamente engañosas o de composición compleja.
- **Sesgos heredados del corpus**: al entrenarse sobre MNLI, SNLI y ANLI, arrastra los sesgos de esos datasets (correlaciones superficiales entre premisa e hipótesis, desequilibrios de dominio y de registro). No se documenta ninguna evaluación de sesgo específica.
- **Riesgo de calibración deficiente fuera de dominio**: las probabilidades solo están calibradas de forma aproximada en la distribución de entrenamiento; en dominios muy distintos (jerga técnica, texto legal, conversación coloquial) conviene validar con un conjunto propio antes de fijar umbrales.
- **Etiquetas no mutuamente excluyentes**: en clasificación zero-shot, la comparación entre etiquetas se hace sobre la probabilidad de implicación de cada par; varias hipótesis pueden recibir puntuaciones altas simultáneamente, por lo que hace falta un paso de normalización o *argmax* explícito.
- **Resultados no verificados**: la única entrada del `model-index` está marcada como `verified: false` y la evaluación de 45 conjuntos la publica el propio autor sin replicación independiente.
- **Adopción muy baja**: 120 descargas y 0 *likes*, sin issues ni discusiones públicas documentadas; no hay garantía de mantenimiento a largo plazo.
- **Licencia**: el modelo se publica bajo Apache-2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base `jhu-clsp/ettin-encoder-400m` y de los datasets de origen (MNLI, SNLI, ANLI) antes de un despliegue comercial.
- **Contexto largo sin desglose**: aunque soporta 8k tokens, la model card no publica métricas separadas por longitud de entrada, por lo que el rendimiento real en documentos muy largos no está cuantificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dleemiller/finecat-nli-v2-l
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Modelo base Ettin Encoder 400M: https://huggingface.co/jhu-clsp/ettin-encoder-400m
- Colección FineCat NLI: https://huggingface.co/collections/dleemiller/finecat-nli
- Modelo predecesor `finecat-nli-l`: https://huggingface.co/dleemiller/finecat-nli-l
- Ficha en SAVRN: https://savrn.com/models/finecat-nli-l
- Perfil del autor en SAVRN: https://savrn.com/model-publishers/dleemiller
- Entrada en Free2AITools: https://free2aitools.com/model/dleemiller/finecat-nli-v2-xl
