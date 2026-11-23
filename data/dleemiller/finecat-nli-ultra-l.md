# dleemiller/finecat-nli-ultra-l

## Resumen

FineCat-NLI Ultra Large es un cross-encoder especializado en inferencia de lenguaje natural (NLI) desarrollado por dleemiller. Se construye sobre el modelo base dmis-lab/UltraBERT-380M y se afina para devolver probabilidades calibradas de que una premisa (texto) implique, contradiga o sea neutral respecto a una hipótesis (afirmación). Con 377,5 millones de parámetros, ocupa una franja intermedia que busca equilibrio entre precisión y coste de inferencia, y declara un rendimiento de aproximadamente 1.500 pares por segundo.

El modelo resuelve tareas de clasificación zero-shot, detección de alucinaciones, verificación de hechos y grounding en pipelines RAG, entre otras. Su enfoque consiste en reformular cualquier tarea de clasificación como una serie de pares premisa-hipótesis, lo que permite reutilizar un único cabezal NLI para múltiples aplicaciones sin entrenamiento específico. Soporta documentos de hasta 32.000 tokens, lo que lo hace adecuado para contextos largos en recuperación aumentada.

Es relevante ahora porque la comunidad de RAG y agentes necesita verificadores fiables y ligeros que no dependan de un LLM generativo. FineCat-NLI Ultra Large ofrece una alternativa determinista, con licencia Apache-2.0 y un formato compatible con sentence-transformers, lo que facilita su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en UltraBERT-380M (transformer) |
| Parametros totales | 377.540.611 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 32.000 tokens (documentos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre dmis-lab/UltraBERT-380M, un transformer encoder de 378M de parámetros. A diferencia de los bi-encoders, procesa conjuntamente la premisa y la hipótesis, lo que permite modelar interacciones finas entre ambos textos. La cabeza de clasificación devuelve tres logits (entailment, contradiction, neutral) que, tras softmax, se interpretan como probabilidades calibradas.

El entrenamiento se realizó mediante fine-tuning supervisado sobre los datasets dleemiller/FineCat-NLI y dleemiller/FineCat-NLI-Reason, que incluyen datos de MNLI, SNLI, ANLI, WANLI, LingNLI y otras fuentes. La model card menciona técnicas de destilación de conocimiento y entrenamiento con datos de razonamiento (Reason), aunque no se especifica el número exacto de tokens ni la composición detallada del dataset. No se indica si hubo RLHF o DPO; el pipeline es de tipo `generated_from_trainer` con `sentence-transformers` y `trust_remote_code=True`.

## Capacidades

- Clasificación zero-shot: reformula cualquier etiqueta como hipótesis y devuelve probabilidad de entailment.
- Detección de alucinaciones y verificación de hechos: compara pasajes recuperados con respuestas generadas.
- Grounding en RAG: evalúa si la respuesta está respaldada por el contexto recuperado.
- Reranking de pasajes: ordena documentos por relevancia respecto a una consulta.
- Clasificación multi-etiqueta y enrutamiento (triage) de intenciones.
- Extracción de información clínica y social (SDOH-NLI).
- Moderación y guardrails: compara mensajes con políticas de contenido.
- Soporte de documentos largos (hasta 32k tokens) para contextos extensos.
- No soporta tool calling ni agentes multi-paso de forma nativa; es un clasificador, no un generador.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Verificación de respuestas en RAG: dado un conjunto de pasajes recuperados y una respuesta generada, el modelo calcula la probabilidad de que la respuesta esté implicada por el contexto. Se usa como filtro de alucinaciones antes de mostrar la respuesta al usuario.
- Enrutamiento de tickets de soporte: clasifica solicitudes entrantes en categorías como facturación, envío o acceso a cuenta comparando el texto con afirmaciones predefinidas. La salida probabilística permite umbrales de confianza.
- Moderación de contenido: evalúa mensajes contra políticas de la comunidad (p. ej., "este mensaje contiene insultos") y activa revisión humana si la probabilidad supera un umbral.
- Reranking en motores de búsqueda: ordena pasajes recuperados por un retriever denso, usando la probabilidad de entailment como señal de relevancia. Adecuado por su throughput de ~1.500 pares/s.
- Extracción de información clínica: detecta condiciones sociales (desempleo, vivienda, apoyo social) en notas clínicas comparando con afirmaciones estructuradas, como se reporta en SDOH-NLI (98,2% de precisión).
- Clasificación zero-shot de reseñas: etiqueta reseñas de productos o servicios como positivas, negativas o neutras sin entrenamiento adicional, útil para análisis de opinión a escala.
- Detección de contradicciones en bases de conocimiento: compara pares de afirmaciones para identificar inconsistencias en documentación técnica o legal.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index y en la model card (no verificados de forma independiente):

| Dataset | Métrica | Valor |
|---|---|---|
| FineCat-NLI (test) | Accuracy | 0,8388 |
| MultiNLI (validation matched) | Accuracy | 0,9127 |
| MultiNLI (validation mismatched) | Accuracy | 0,9131 |
| SNLI (test) | Accuracy | 0,9303 |
| ANLI round 1 (test) | Accuracy | 0,7910 |
| ANLI round 2 (test) | Accuracy | 0,6400 |
| ANLI round 3 (test) | Accuracy | 0,5833 |
| WANLI (test) | Accuracy | 0,7694 |
| LingNLI (validation) | Accuracy | 0,8714 |
| Benchmark de 45 datasets (macro average) | Macro accuracy | 0,8234 |

La model card incluye además una comparativa en el leaderboard OpenNLI (v0.2.0) con un Skill Index de 58,6 y una accuracy media de 0,8213. No se han publicado resultados de MMLU, HumanEval o GSM8K, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~1,5 GB (377M parámetros × 4 bytes).
- VRAM estimada en fp16: ~0,75 GB; en int8: ~0,4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090) para fp16; A100/H100 no son necesarias pero ofrecen mayor throughput.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 2 GB o más.
- Opciones de despliegue: sentence-transformers (CrossEncoder), Hugging Face Transformers, vLLM (soporte de cross-encoder), TGI, ONNX Runtime. No se menciona soporte nativo de llama.cpp u Ollama.
- Throughput declarado: ~1.500 pares/s (hardware no especificado).
- Latencia: no disponible de forma desagregada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy media (OpenNLI) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dleemiller/finecat-nli-ultra-l | 378M | 32k tokens | 0,8213 | Apache-2.0 | Hugging Face |
| Modelos NLI comparables en OpenNLI | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de comparación con alternativas concretas en la información proporcionada. La model card menciona el leaderboard OpenNLI, pero no detalla los modelos competidores ni sus métricas.

## Limitaciones y advertencias

- Entrenado y evaluado principalmente en inglés; el rendimiento en otros idiomas no está documentado.
- Es un clasificador NLI, no un generador: no produce texto libre ni soporta tool calling o razonamiento multi-paso.
- Riesgo de falsos positivos en entailment cuando la hipótesis es ambigua o el contexto es muy ruidoso.
- El rendimiento cae en ANLI rounds 2 y 3 (0,64 y 0,58), lo que indica dificultad con inferencias complejas o adversariales.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base UltraBERT-380M puede tener sus propias condiciones; conviene revisarlas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar antes de usar en producción.
- No se especifican sesgos conocidos ni evaluación de robustez fuera de los datasets NLI.
- El throughput de ~1.500 pares/s no especifica el hardware; puede variar significativamente.

## Enlaces

- Hugging Face: https://huggingface.co/dleemiller/finecat-nli-ultra-l
- Demo Space: https://huggingface.co/spaces/dleemiller/finecat-nli
- Leaderboard OpenNLI: https://huggingface.co/spaces/dleemiller/open-nli-leaderboard
- Dataset FineCat-NLI: https://huggingface.co/datasets/dleemiller/FineCat-NLI
- Dataset FineCat-NLI-Reason: https://huggingface.co/datasets/dleemiller/FineCat-NLI-Reason
- Modelo base UltraBERT-380M: https://huggingface.co/dmis-lab/UltraBERT-380M
