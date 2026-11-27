# BertramM/vernier-1.7b

## Resumen

Vernier-1.7B es un adaptador LoRA de rango 32 (junto con una cabeza de selección entrenada desde cero) publicado por BertramM sobre el modelo base Qwen/Qwen3-1.7B. No es un modelo generativo autónomo, sino un componente especializado en la selección conjunta de evidencias para memoria conversacional de largo plazo: dado un historial de diálogo y una consulta, decide qué fragmentos del historial deben empaquetarse en el contexto del modelo generativo. Acompaña al artículo "Compare Before You Pack: Single-Pass Joint Evidence Selection for Long-Term Conversational Memory" (Beichen Huang, 2026).

El problema que aborda es el coste y la pérdida de señal que supone recuperar evidencias de forma independiente (reranking punto a punto) cuando el historial crece. Vernier propone una selección conjunta en una sola pasada, con una cabeza de conjunto (set head) libre de posición y una compuerta de admisión con temperatura aprendida, seguida de un empaquetado tipo knapsack exacto con umbral τ = 0,05 y mínimo de 2 elementos. El repositorio incluye tres checkpoints por semilla (s42, s43, s44) para reproducibilidad multi-semilla.

Es relevante ahora porque la memoria de largo plazo en agentes conversacionales es un cuello de botella práctico: los modelos de 1-2B parámetros no pueden permitirse reordenar cientos de turnos con un cross-encoder grande, y una selección conjunta barata permite mantener ventanas de contexto efectivas con coste acotado. El tamaño del repo (1,2 GB) corresponde principalmente a los pesos del modelo base en safetensors más los adaptadores y cabezas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder (Qwen3-1.7B) + cabeza de conjunto bidireccional Pre-LN sin posición + MLP residual de estadísticas de pool (4 dim) + cabeza de admisión con temperatura |
| Parametros totales | no disponible (adaptador LoRA r=32, alpha=64 sobre 7 proyecciones de atención/MLP; base Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B; no especificada en la información) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el adaptador es compatible con el base en sus formatos habituales) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `lora_adapter/`) + `head.pt` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura combina un adaptador LoRA de rango 32 y alpha 64 aplicado a 7 proyecciones de atención y MLP del modelo Qwen/Qwen3-1.7B, con una cabeza específica de selección compuesta por tres piezas: un MLP residual sobre 4 estadísticas de pool, una cabeza de conjunto bidireccional Pre-LN de 2 capas sin codificación posicional y una cabeza de admisión escalada por temperatura. La temperatura se aprende durante el entrenamiento (T = 1,018 en s42 y s43; T = 1,019 en s44), lo que sugiere un ajuste fino de la calibración de las puntuaciones de admisión.

El entrenamiento se orienta a la selección conjunta de evidencias en una sola pasada, en lugar de reranking independiente por par consulta-evidencia. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO; únicamente se indica que se publican tres semillas (42, 43, 44) con resultados en las tablas principales del artículo. El empaquetado posterior es un knapsack exacto con τ = 0,05 y k_min = 2, lo que impone un mínimo de dos evidencias seleccionadas por consulta.

## Capacidades

- Selección conjunta de evidencias sobre historiales conversacionales largos en una sola pasada.
- Reranking de candidatos de memoria con una cabeza de conjunto libre de posición.
- Compuerta de admisión calibrada por temperatura para decidir si una evidencia entra en el contexto empaquetado.
- Empaquetado tipo knapsack exacto con umbral τ = 0,05 y mínimo k_min = 2.
- Integración como módulo previo a un modelo generativo (no genera texto por sí mismo).
- Compatibilidad con el ecosistema Qwen3-1.7B mediante adaptador LoRA.
- Reproducibilidad multi-semilla (s42, s43, s44).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking propias de este componente.

## Casos de uso

- Memoria de largo plazo en asistentes conversacionales: el selector filtra los turnos relevantes de un historial extenso antes de pasarlos al modelo generativo, reduciendo el número de tokens de contexto y el coste por consulta.
- RAG sobre transcripciones de reuniones: dado un histórico de horas de diálogo, Vernier elige las evidencias que responden a una pregunta concreta y las empaqueta con knapsack exacto para maximizar cobertura bajo un presupuesto de tokens.
- Atención al cliente multi-turno: permite mantener coherencia con interacciones previas del mismo usuario sin reenviar todo el historial al LLM principal, lo que abarata el despliegue en producción.
- Agentes con memoria persistente: actúa como etapa de selección antes del planificador, de modo que el agente recibe solo los hechos y compromisos previos relevantes para la tarea actual.
- Evaluación de sistemas de memoria: los tres checkpoints por semilla permiten medir la varianza del pipeline de selección en experimentos de investigación reproducibles.
- Filtrado de contexto en pipelines de resumen: antes de resumir una conversación larga, se seleccionan las evidencias que deben entrar en la ventana del modelo resumidor.
- Despliegue en hardware modesto: al ser un adaptador LoRA sobre un modelo de 1,7B, puede ejecutarse en GPUs de consumo para preprocesar historiales antes de llamar a un modelo mayor alojado en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre Qwen3-1.7B, el grueso de la VRAM corresponde al modelo base (aproximadamente 3,4 GB en FP16 para 1,7B parámetros, más overhead de activaciones y de la cabeza de selección).
- GPU recomendadas: no especificadas en la información; por tamaño, cabría esperar ejecución en GPUs de consumo tipo RTX 3060/4060/4090 y en GPUs de datacenter (A100, H100) para lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del modelo base (1,7B); no confirmado en la documentación.
- Opciones de despliegue: el autor proporciona la clase `VernierSelector` del paquete `vernier` con `from_pretrained(checkpoint_dir, base_model_name_or_path, device)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vernier-1.7B (este) | LoRA r=32 sobre Qwen3-1.7B | no disponible | Selección conjunta de evidencias para memoria conversacional | Apache-2.0 | Hugging Face + GitHub |
| naver/provence-reranker-debertav3-v1 | no disponible | no disponible | Reranking de evidencias | no disponible | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Generación de texto general | Apache-2.0 | Hugging Face |

La comparativa con otros selectores de memoria o rerankers especializados no está disponible en la información proporcionada; el autor menciona explícitamente que no se distribuyen pesos derivados de `naver/provence-reranker-debertav3-v1`.

## Limitaciones y advertencias

- El modelo no es generativo: requiere un LLM posterior que consuma las evidencias empaquetadas.
- No se documentan sesgos conocidos ni evaluación de sesgo; al heredar el modelo base Qwen3-1.7B, puede reproducir sus sesgos.
- Riesgo de alucinación no aplica directamente al selector, pero una selección errónea de evidencias puede inducir respuestas incorrectas en el modelo generativo posterior.
- Idiomas soportados no declarados; el comportamiento multilingüe no está verificado.
- Longitud de contexto efectiva no especificada; depende del modelo base y del presupuesto de empaquetado (τ = 0,05, k_min = 2).
- Licencia Apache-2.0 permite uso comercial, pero el autor advierte que no se distribuyen pesos derivados de `naver/provence-reranker-debertav3-v1`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- La fecha de creación indicada (2026-11-27) es posterior a la redacción habitual de fichas; conviene verificar la vigencia del checkpoint antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/BertramM/vernier-1.7b
- Repositorio de código: https://github.com/Beichen-Hg/Vernier
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Artículo de referencia: "Compare Before You Pack: Single-Pass Joint Evidence Selection for Long-Term Conversational Memory" (Beichen Huang, 2026), citado en la model card; no se proporciona URL directa en la información disponible.
