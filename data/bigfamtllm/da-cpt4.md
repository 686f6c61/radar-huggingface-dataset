# BigFamTLLM/da-cpt4

## Resumen

da-cpt4 es un modelo de lenguaje de 2,12 mil millones de parámetros desarrollado por BigFamTLLM, un proyecto de estudiantes del curso IN5640 de la Universidad de Oslo (otoño de 2026). Se trata del cuarto checkpoint de una serie de diez dentro de un proceso de preentrenamiento continuado (continued pretraining) sobre noruego, partiendo de da-emb, un modelo entrenado originalmente en danés. El modelo emplea la arquitectura Qwen3 y no está ajustado por instrucciones: es exclusivamente un modelo base.

El interés técnico del modelo reside en su enfoque de adaptación lingüística: sustitución del tokenizador danés por uno noruego de 32.000 tokens, entrenamiento inicial solo de embeddings (1.000 pasos) y posterior preentrenamiento continuado con 10,72 mil millones de tokens noruegos extraídos de HPLT 4.0 (85 % bokmål, 15 % nynorsk). Este checkpoint corresponde al paso 19.440 de 48.600, por lo que representa un estado intermedio del entrenamiento y no el resultado final de la serie.

Es relevante como objeto de estudio para investigadores interesados en transferencia entre lenguas germánicas nórdicas, en el impacto del cambio de tokenizador y en la evaluación de checkpoints intermedios mediante NorEval 1.1. No es un modelo destinado a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), 36 capas, hidden size 2176, 34 cabezas de atención (17 KV heads), tied embeddings |
| Parámetros totales | 2.115.305.088 (2,12B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | danés (da), noruego (no), bokmål (nb), nynorsk (nn) |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 con 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia de Sigma2, con longitud de secuencia 4096, batch size 128, optimizador AdamW y learning rate máximo de 5e-4, 2.000 pasos de warmup y sin decaimiento (1e-4 en la fase de solo embeddings). El modelo se convirtió a formato Hugging Face con Megatron-Bridge, ajustando las configuraciones para que cargue también en transformers 4.x.

La adaptación al noruego se articula en tres fases: sustitución del tokenizador (los tokens compartidos entre ambos vocabularios conservan su embedding, los nuevos se inicializan con la media de las piezas del tokenizador antiguo), 1.000 pasos de entrenamiento solo de embeddings y preentrenamiento continuado sobre 10,72 mil millones de tokens de HPLT 4.0. Este checkpoint (4 de 10) no incluye la fase de annealing descrita en el proyecto; existe una variante separada, da-cpt4-anneal, que aplica 916 pasos (0,48B tokens) de datos de alta calidad con decaimiento lineal.

## Capacidades

- Generación de texto en noruego (bokmål y nynorsk) y danés, como modelo base sin ajuste por instrucciones.
- Continuación de texto y modelado de lenguaje causal.
- Comprensión lectora y tareas de conocimiento del mundo evaluadas en NorEval 1.1 (nob_reading, nob_world, nno_world).
- Tareas de lengua y ortografía noruegas (nob_language, nob_orthography, nno_language).
- Capacidad multilingüe limitada al eje danés-noruego; no se documenta soporte para otras lenguas.
- No dispone de tool calling, function calling, modo de razonamiento explícito, visión ni audio.
- No está ajustado por instrucciones ni por preferencias (sin RLHF/DPO documentado).

## Casos de uso

- Investigación en transferencia lingüística entre danés y noruego: el checkpoint permite analizar cómo evoluciona la competencia en bokmål y nynorsk a lo largo del preentrenamiento continuado, comparando con los checkpoints 1 a 10 de la misma serie.
- Evaluación de estrategias de sustitución de tokenizador: sirve para estudiar el impacto de inicializar nuevos tokens con la media de las piezas del tokenizador original frente a otras alternativas, dado que el modelo documenta explícitamente este procedimiento.
- Generación de texto noruego para corpus sintéticos de investigación: puede producir continuaciones de texto en bokmål y nynorsk para aumentar datasets de experiments controlados, siempre con revisión humana.
- Estudio de robustez frente a ruido: la model card reporta métricas específicas de robustez (0,382 en entrada limpia, -0,039 de media bajo ruido), lo que permite usar el modelo como caso de estudio en evaluación de robustez lingüística.
- Línea base en experimentos académicos: al compartir arquitectura y presupuesto con los modelos no-base, da-base y ml-base del mismo proyecto, resulta útil como referencia controlada en comparaciones de preentrenamiento desde cero frente a adaptación.
- Reproducción de pipelines de conversión Megatron-Bridge a transformers: el modelo documenta el proceso de conversión y los ajustes de configuración, lo que lo convierte en un ejemplo práctico para validar herramientas de conversión de pesos.

## Benchmarks y rendimiento

NorEval 1.1, según la model card del autor:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,232 | 0,252 |
| nob_orthography | acc | 0,833 | 0,844 |
| nob_reading | f1 | 0,204 | 0,207 |
| nob_world | acc | 0,293 | 0,298 |
| nno_language | em_first | 0,422 | 0,517 |
| nno_world | acc | 0,301 | 0,318 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,382 en entrada limpia y -0,039 de media bajo ruido.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 4,3 GB solo para pesos (2,12B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 5 y 7 GB según longitud de secuencia y batch.
- En cuantización de 8 bits: alrededor de 2,2 GB de pesos; en 4 bits, alrededor de 1,1 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: GH200 (usada en entrenamiento), A100, H100 para inferencia a gran escala; RTX 4090, RTX 3090, A10G y GPUs consumer con 8 GB o más para inferencia en bfloat16 o cuantizada.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB de VRAM en bfloat16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta endpoints_compatible), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| BigFamTLLM/da-cpt4 | 2,12B | 4.096 | da, no, nb, nn | no disponible | checkpoint 4/10, base |
| BigFamTLLM/da-cpt4-anneal | 2,12B | 4.096 | da, no, nb, nn | no disponible | checkpoint 4/10 con annealing |
| BigFamTLLM/no-base | no disponible | no disponible | no | no disponible | entrenado desde cero en noruego |
| BigFamTLLM/da-base | no disponible | no disponible | da | no disponible | entrenado desde cero en danés |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, más allá de las métricas NorEval de da-cpt4. No se han identificado en la información disponible otros modelos externos comparables con datos verificables.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 19.440 de 48.600) y no el modelo final de la serie; su rendimiento es inferior al que cabría esperar de los checkpoints posteriores o de la variante con annealing.
- No está ajustado por instrucciones: no sigue instrucciones de forma fiable y no debe usarse como asistente conversacional sin un ajuste posterior.
- El autor advierte explícitamente de que puede producir salidas incorrectas u ofensivas y de que no está pensado para uso en producción.
- Entrenado sobre texto web de HPLT 4.0, por lo que hereda sesgos presentes en esos datos; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación inherente a un modelo base de 2,12B sin alineación.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística restringida al eje danés-noruego; no se documenta competencia en otras lenguas.
- Licencia no especificada: la ausencia de licencia explícita impide determinar las condiciones de uso comercial; debe consultarse con el autor antes de cualquier uso más allá de la investigación.
- El equilibrio del corpus noruego es muy desigual (85 % bokmål frente a 15 % nynorsk), lo que puede penalizar el rendimiento en nynorsk pese a las métricas reportadas.
- Sin datos publicados sobre cuantización, latencia o throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/da-cpt4
- Modelo base: https://huggingface.co/BigFamTLLM/da-emb
- Variante con annealing: https://huggingface.co/BigFamTLLM/da-cpt4-anneal
- Modelo danés original: https://huggingface.co/BigFamTLLM/da-base
- Modelo noruego desde cero: https://huggingface.co/BigFamTLLM/no-base
- Modelo multilingüe desde cero: https://huggingface.co/BigFamTLLM/ml-base
- Checkpoints de la serie CPT: https://huggingface.co/BigFamTLLM/da-cpt1, https://huggingface.co/BigFamTLLM/da-cpt5, https://huggingface.co/BigFamTLLM/da-cpt10
- Repositorio de HPLT 4.0 (dataset de entrenamiento): no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
