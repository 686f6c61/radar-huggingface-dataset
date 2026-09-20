# impacte/mimir-lfm-openjev

## Resumen

Mímir (`impacte/mimir-lfm-openjev`) es un cross-encoder de inferencia de lenguaje natural (NLI) construido por el usuario impacte a partir del modelo base LiquidAI/LFM2.5-8B-A1B. El modelo convierte un LLM causal en un clasificador de tres clases —contradiction, entailment y neutral— siguiendo la receta *jev* popularizada por AlexWortega/openjev. La idea central es reutilizar una única primitiva NLI en modo zero-shot para tareas de reranking de respuestas, calificación automática, vigilancia de políticas y control de estado en agentes, sin cabezas específicas por tarea ni entrenamiento adicional por caso de uso.

Arquitectónicamente es un `Lfm2MoeForSequenceClassification`: una cabeza personalizada de tres vías sobre el backbone `Lfm2MoeModel`, con pooling sobre el último token. El backbone es un MoE híbrido con 32 expertos (top-4) que combina convoluciones cortas con atención, con aproximadamente 8,3B parámetros totales y unos 1,5B activos. Según el recuento real de safetensors, el repositorio contiene 8.467.862.976 parámetros y ocupa 17,0 GB.

Su relevancia práctica radica en la relación entre coste y rendimiento: con alrededor de 1,5B parámetros activos iguala o supera a openjev v1 sobre un backbone denso de 4B en todos los benchmarks publicados, y se aproxima a openjev v2 en NLI adversarial. El modelo se distribuye bajo la LFM Open License v1.0, heredada del modelo base, y requiere `trust_remote_code=True` porque la versión estándar de transformers no incluye la cabeza de clasificación de secuencias para `lfm2_moe`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm2MoeForSequenceClassification` (cabeza de 3 clases sobre backbone `Lfm2MoeModel`, pooling de último token, híbrido convolución corta + atención, MoE) |
| Parametros totales | 8.467.862.976 (8,47B), según safetensors |
| Parametros activos | ~1,5B (32 expertos, top-4) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio contiene pesos safetensors en bf16 (17,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM2.5-8B-A1B; etiquetada como `license: other` con `license_name: lfm-open-license-v1.0`) |
| Formato de pesos | safetensors, con código personalizado (`modeling_lfm2_moe_seqcls.py`) |
| Etiquetas de salida | `0 = contradiction`, `1 = entailment`, `2 = neutral` |
| Plantilla de entrada | `Premise: {premise}\nHypothesis: {hypothesis}` (en `config.nli_template`) |
| Pipeline | text-classification |
| Libreria | transformers |
| Tamano del repositorio | 17,0 GB |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-8B-A1B, un transformer híbrido con mezcla de expertos que intercala capas convolucionales cortas con capas de atención y una FFN de 32 expertos con enrutado top-4. Sobre ese backbone se añade una cabeza lineal de tres salidas (`Lfm2MoeForSequenceClassification`) que aplica pooling sobre el último token y produce logits para contradiction, entailment y neutral. El módulo `modeling_lfm2_moe_seqcls.py` se carga desde el propio repositorio mediante `trust_remote_code=True`, ya que transformers no ofrece de serie una cabeza de clasificación de secuencias para `lfm2_moe`.

El entrenamiento se realiza en dos etapas con LoRA de rango 16 y entropía cruzada sobre las tres clases. La etapa 1 entrena sobre AllNLI (SNLI + MNLI). La etapa 2 utiliza una mezcla dura al estilo openjev compuesta por NLI adversarial, NLI con evidencia documental, haystack de documentos largos y trazas de agentes; según la model card, esta segunda etapa se ejecutó sobre una muestra de 500.000 filas y no pudo incluir el corpus xlam de function calling por estar restringido. La innovación no está en la arquitectura sino en el enfoque *jev*: una única primitiva NLI reutilizada en zero-shot para reranking, grading, guardrails y decisiones de agente, con la ventaja de que el coste de inferencia corresponde a solo ~1,5B parámetros activos.

## Capacidades

- Clasificación NLI de tres vías (contradiction, entailment, neutral) entre una premisa y una hipótesis.
- Reranking zero-shot de respuestas candidatas: premisa = consulta, hipótesis = respuesta candidata, se elige el argmax de entailment.
- Calificación automática de respuestas (answer grading): premisa = respuesta de referencia, hipótesis = respuesta del candidato; entailment se interpreta como correcto.
- Guardrails de política: premisa = texto de la política, hipótesis = petición del usuario; contradiction se interpreta como violación.
- Control de agentes: premisa = volcado del estado del entorno, hipótesis = acción candidata; el argmax de entailment determina la decisión. La model card menciona demostraciones de openjev en Flappy Bird, Doom y Minecraft.
- Uso zero-shot de la primitiva NLI sin cabezas específicas por tarea y sin reentrenamiento por caso de uso.
- API de alto nivel en el código de entrenamiento de openjev: `predict` por lotes, `rerank`, `grade`, `guard` y `latents` para entrenar cabezas MLP por tarea.
- Capacidades multilingües: no disponibles en la informacion proporcionada.
- Tool calling nativo, visión, audio o modo de razonamiento explícito: no disponible en la informacion proporcionada; el modelo es un clasificador de secuencias, no un generador.

## Casos de uso

- Reranking en pipelines RAG: dada una consulta y un conjunto de fragmentos o respuestas candidatas, el modelo puntúa cada par y se conserva la de mayor probabilidad de entailment, mejorando la precisión del contexto entregado al generador sin necesidad de un reranker denso de mayor tamaño.
- Evaluación automática de asistentes: se compara la respuesta generada con una respuesta de referencia y se usa entailment como aproximación a "correcto"; útil para regresión continua en CI de prompts y para comparar versiones de un sistema.
- Guardrails de contenido y cumplimiento: la premisa es la política interna o el contrato, la hipótesis es la petición del usuario; una salida de contradiction marca una posible violación antes de ejecutar la acción.
- Control de agentes multi-paso: el estado del entorno se serializa como premisa y cada acción candidata como hipótesis; el argmax de entailment elige la acción, lo que permite usar un modelo pequeño y rápido como política de decisión.
- Filtrado de datos sintéticos: se clasifican pares documento-afirmación para descartar contradicciones antes de incorporar datos generados a un conjunto de entrenamiento.
- Detección de alucinaciones en producción: se contrasta el texto generado con la fuente recuperada y se marca como sospechosa toda afirmación con alta probabilidad de contradiction.
- Verificación de consistencia entre documentos: aplicable a contratos, informes o documentación técnica donde hay que detectar afirmaciones incompatibles entre secciones.
- Entrenamiento de clasificadores ligeros por tarea: el wrapper expone `latents` para extraer representaciones y ajustar cabezas MLP específicas cuando la primitiva NLI de tres clases no basta.

## Benchmarks y rendimiento

Resultados publicados en la model card (zero-shot, n=1000 por benchmark):

| Benchmark | Mimir etapa 1 | Mimir (etapa 2, este repo) | openjev v1 (Qwen3.5-4B) | openjev v2 (Qwen3.5-4B) |
|---|---|---|---|---|
| MNLI-m | 0,898 | 0,897 | 0,91 | 0,91 |
| MNLI-mm | 0,889 | 0,882 | no disponible | no disponible |
| ANLI r1 | 0,568 | 0,744 | no disponible | no disponible |
| ANLI r2 | 0,436 | 0,609 | no disponible | no disponible |
| ANLI r3 | 0,392 | 0,555 | 0,42 | 0,63 |
| WANLI | 0,607 | 0,741 | 0,63 | 0,77 |
| SciTail | 0,733 | 0,943 | no disponible | no disponible |
| ARC-C rerank | 0,540 | 0,562 | 0,59 | 0,72 |
| MMLU rerank | 0,428 | 0,433 | 0,47 | 0,53 |

No se han encontrado resultados adicionales de benchmarks en la busqueda web realizada; los resultados de busqueda devueltos no guardan relación con el modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB para el modelo en bf16, según la propia model card.
- GPU recomendadas: cualquier GPU única con 24 GB o más, donde `device_map="auto"` funciona directamente; encajan A100 (40/80 GB), H100, RTX 4090 (24 GB), RTX 3090 (24 GB) y L40S.
- GPU de consumo: sí, cabe en tarjetas consumer de 24 GB en bf16. En GPUs con menos VRAM habría que recurrir a cuantización, pero no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: únicamente inferencia vía transformers con `trust_remote_code=True`, cargando `AutoModelForSequenceClassification` y `AutoTokenizer`. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, ni pesos GGUF; el soporte de llama.cpp es improbable dado que el repositorio incluye código personalizado para la cabeza de clasificación.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, la inferencia activa unos 1,5B parámetros por token, lo que reduce el coste frente a un modelo denso equivalente de 8B.
- Nota de seguridad: `trust_remote_code=True` implica ejecutar código del repositorio; conviene revisar `modeling_lfm2_moe_seqcls.py` antes de desplegarlo en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Tipo | Rendimiento NLI | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mimir (`impacte/mimir-lfm-openjev`) | 8,47B | ~1,5B | Cross-encoder NLI (MoE híbrido) | MNLI-m 0,897; ANLI r3 0,555; WANLI 0,741; SciTail 0,943 | LFM Open License v1.0 | HuggingFace, pesos safetensors con código personalizado |
| openjev v1 (Qwen3.5-4B) | ~4B | 4B (denso) | Cross-encoder NLI | MNLI-m 0,91; ANLI r3 0,42; WANLI 0,63; ARC-C 0,59; MMLU 0,47 | MIT (según la model card de Mimir, que cita openjev como MIT) | HuggingFace (AlexWortega/openjev) |
| openjev v2 (Qwen3.5-4B) | ~4B | 4B (denso) | Cross-encoder NLI | MNLI-m 0,91; ANLI r3 0,63; WANLI 0,77; ARC-C 0,72; MMLU 0,53 | no disponible | HuggingFace (AlexWortega/openjev) |
| LiquidAI/LFM2.5-8B-A1B | ~8,3B | ~1,5B | LLM causal MoE híbrido (modelo base) | no aplicable (no es clasificador NLI) | LFM Open License v1.0 | HuggingFace |

La comparación directa con rerankers densos tipo BGE o Ettin no está disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación: al ser un clasificador de secuencias no genera texto, pero la señal de entailment puede ser errónea; no debe usarse como única fuente de verdad en decisiones críticas.
- Sesgos: no disponibles en la informacion proporcionada; el modelo hereda los sesgos del corpus AllNLI (SNLI y MNLI) y de la mezcla de la etapa 2, predominantemente en inglés.
- Cobertura lingüística: no se documentan idiomas soportados. La plantilla y los datos de entrenamiento citados son en inglés, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto: no documentada; el uso con documentos largos depende de la ventana del backbone y de cómo se trunquen los pares premisa-hipótesis.
- Licencia: LFM Open License v1.0, heredada del modelo base. Es una licencia con condiciones específicas; hay que consultar el archivo LICENSE del repositorio antes de un uso comercial. La model card no detalla los términos aplicables.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que introduce riesgo de ejecución de código y complica el despliegue en entornos con políticas estrictas.
- Cabeza de 3 clases no estándar: la salida no es una puntuación de similitud continua, sino una distribución sobre contradiction/entailment/neutral; el orden de las etiquetas es relevante al integrarlo.
- Comparabilidad: la brecha frente a openjev v2 en reranking (ARC-C 0,562 frente a 0,72; MMLU 0,433 frente a 0,53) se atribuye en la model card a la ausencia del corpus xlam de function calling y al uso de una muestra de 500.000 filas en lugar de la mezcla completa.
- Adopción: el repositorio registra 0 descargas y 0 likes, por lo que no hay validación externa ni reportes de terceros sobre su comportamiento en producción.
- Fechas del repositorio: la model card indica creación y actualización en septiembre de 2026, dato a tener en cuenta al planificar su mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/impacte/mimir-lfm-openjev
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Receta original openjev: https://huggingface.co/AlexWortega/openjev
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron unicamente contenido SEO sobre viajes de fin de semana sin relacion con el modelo.
