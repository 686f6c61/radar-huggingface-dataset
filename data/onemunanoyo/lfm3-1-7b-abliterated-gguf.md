# onemunanoyo/LFM3-1.7B-Abliterated-GGUF

## Resumen

LFM3-1.7B-Abliterated-GGUF es una compilación en formato GGUF de una variante "abliterated" del modelo LiquidAI/LFM3-1.7B, publicada por el usuario onemunanoyo en HuggingFace. El modelo base, desarrollado por Liquid AI, es un transformer de 1.728.801.600 parámetros con una arquitectura híbrida de 24 capas que combina convolución corta con compuerta (gated short-conv) y atención deslizante/completa. La modificación consiste exclusivamente en una edición de pesos: se elimina una dirección de rechazo de 40 matrices residuales en las capas 4 a 23, sin entrenamiento, fine-tuning ni destilación adicional.

El interés de esta ficha radica en que documenta un caso de modificación de pesos orientada a eliminar el comportamiento de rechazo (refusal) del modelo original, manteniendo prácticamente intacta su capacidad de conocimiento según las mediciones del autor. Es relevante para investigadores que estudian técnicas de abliteration, para desarrolladores que necesitan evaluar el impacto de estas ediciones en la calidad del modelo, y para quienes trabajan con modelos pequeños (1.7B) desplegables en hardware de consumo.

La licencia es LFM Open License v1.0, que restringe el uso comercial a entidades con ingresos anuales inferiores a 10 millones de USD. El repositorio tiene un tamaño de 8.0 GB y ofrece cuatro cuantizaciones GGUF (BF16, Q8_0, Q6_K y Q4_K_M) para facilitar el despliegue en distintos entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido tri-híbrido de 24 capas: gated short-conv + atención deslizante/completa |
| Parametros totales | 1.728.801.600 (1.73B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | No disponibles (el autor menciona evaluación en JA/EN) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B emplea una arquitectura tri-híbrida de 24 capas que combina convolución corta con compuerta (gated short-conv) y mecanismos de atención deslizante y completa. Esta combinación busca reducir el coste computacional de la atención tradicional manteniendo la capacidad de modelar dependencias locales y globales. El modelo tiene 1.728.801.600 parámetros y se distribuye originalmente en formato safetensors.

La versión abliterated no introduce ningún entrenamiento adicional. La modificación consiste en eliminar una dirección de rechazo de 40 matrices residuales en las capas 4 a 23, concretamente en `self_attn.o_proj`, `conv.out_proj` y `feed_forward.w2`. La dirección se calcula como la diferencia media por capa de los estados ocultos entre prompts dañinos y prompts inofensivos (416 pares), tomada en el último token del prompt. La proyección se computa en FP32 y los pesos se guardan en BF16. La ortogonalización tiene en cuenta la sandwich-norm: dado que el modelo suma la salida de cada writer al residual después de `post_operator_norm` / `post_ffn_norm`, la proyección se aplica sobre `g ⊙ u` (donde g es la escala aprendida de la norma) en lugar de sobre `u`, de modo que el componente eliminado no reaparece tras la normalización. Permanecen intactos `embed_tokens`, todas las normas, `q/k/v_proj`, `conv.in_proj`, `conv.conv`, `attn.gate_proj`, `w1/w3` y `lm_head` (tied). El cambio relativo de pesos es de media 1.87e-04 y máximo 3.53e-04, con un máximo |ΔW| de 2.97e-01.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y mantiene la capacidad del modelo base para diálogo multi-turno.
- Razonamiento con modo thinking: el chat template activa el modo thinking por defecto, con una mediana de aproximadamente 1.7k tokens de pensamiento en el conjunto de evaluación del autor.
- Conocimiento general: según las mediciones del autor, responde correctamente 48 de 80 preguntas de conocimiento en JA/EN con thinking desactivado, frente a 49/80 del modelo base.
- Capacidades multilingües: el autor reporta evaluación en japonés e inglés, aunque no se especifica la lista completa de idiomas soportados.
- Eliminación de rechazos: el modelo modificado no emite rechazos en 84 prompts dañinos/NSFW evaluados con thinking activado, frente a 40/84 del modelo base.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere compatibilidad con infraestructuras de despliegue estándar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre abliteration: el modelo permite estudiar el impacto de la eliminación de direcciones de rechazo en un transformer híbrido pequeño, comparando directamente con el modelo base en las mismas condiciones de evaluación (refusals y conocimiento).
- Evaluación de robustez de cuantizaciones: los cuatro archivos GGUF (BF16, Q8_0, Q6_K, Q4_K_M) permiten medir la degradación de perplejidad y la persistencia de la eliminación de rechazos tras cuantizar, con datos de referencia del autor (PPL 6.8849 en BF16 frente a 7.0406 en Q4_K_M).
- Despliegue en hardware de consumo: el archivo Q4_K_M ocupa 1.16 GB y el Q8_0 1.85 GB, lo que permite ejecutar el modelo en GPUs consumer con VRAM limitada mediante llama.cpp.
- Generación de texto sin filtros en entornos controlados: para aplicaciones de investigación que requieren respuestas sin rechazos automáticos, el modelo mantiene el 60% del conocimiento del base (48/80 frente a 49/80) según las mediciones del autor.
- Experimentación con modo thinking: el modelo permite comparar el rendimiento con thinking activado y desactivado mediante `chat_template_kwargs`, útil para estudiar el coste y beneficio del razonamiento extendido en modelos pequeños.
- Prototipado de asistentes conversacionales: al ser un modelo de 1.73B con formato GGUF y compatibilidad con endpoints, sirve para prototipos rápidos de chat en local antes de escalar a modelos mayores.
- Estudio de arquitecturas híbridas: la combinación de gated short-conv y atención deslizante/completa en 24 capas permite investigar el comportamiento de arquitecturas no convencionales en tareas de conocimiento y diálogo.

## Benchmarks y rendimiento

Los datos provienen de la model card del autor y se midieron en un conjunto de evaluación japonés proporcionado por el usuario (84 prompts dañinos/NSFW y 80 preguntas de conocimiento). Las etiquetas de rechazo son heurísticas de coincidencia de cadenas, no etiquetas humanas.

| Modelo | Rechazos (84 prompts, thinking ON) | Correctas (80 preguntas, JA/EN, thinking OFF) |
|---|---|---|
| LFM3-1.7B (base) | 40 / 84 | 49 / 80 |
| Este modelo | 0 / 84 | 48 / 80 |

| Archivo | PPL (llama-perplexity, 40 chunks) | vs. BF16 | Rechazos (10 prompts, greedy) |
|---|---|---|---|
| BF16 | 6.8849 | — | 0 / 10 |
| Q8_0 | 6.8915 | +0.10% | 0 / 10 |
| Q6_K | 6.8820 | −0.04% | 0 / 10 |
| Q4_K_M | 7.0406 | +2.3% | 0 / 10 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: BF16 requiere aproximadamente 3.47 GB; Q8_0 unos 1.85 GB; Q6_K unos 1.49 GB; Q4_K_M unos 1.16 GB (tamaños de archivo reportados por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo cabe en GPUs consumer con al menos 2 GB de VRAM libre en cuantización Q4_K_M.
- Cabe en GPU consumer: sí, en configuraciones con 2-4 GB de VRAM libre según la cuantización, aunque no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp (requiere build b12040 o superior; versiones anteriores fallan con `unknown model architecture: 'lfm3'`). No se mencionan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Nota de configuración: usar `max_tokens >= 4096`, ya que el thinking es largo (mediana ~1.7k tokens) y con 2048 la respuesta suele cortarse. El muestreo recomendado por el autor es temperature 0.1, top_k 50, top_p 1.0, repetition_penalty 1.1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Abliterated-GGUF (este) | 1.73B | No disponible | LFM Open License v1.0 (comercial < 10M USD) | GGUF | Sin rechazos en 84 prompts; 48/80 en conocimiento |
| LiquidAI/LFM3-1.7B (base) | 1.73B | No disponible | LFM Open License v1.0 | Safetensors | 40/84 rechazos; 49/80 en conocimiento |
| Alternativas de ~1.7B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- La eliminación de rechazos es una edición de pesos sin entrenamiento posterior; el autor no garantiza que el comportamiento sea estable en todos los dominios ni que no reaparezca con otros prompts.
- El modelo está diseñado explícitamente para no rechazar prompts dañinos/NSFW; esto lo hace inadecuado para aplicaciones de producción que requieran filtrado de contenido o cumplimiento de políticas de seguridad.
- Riesgo de alucinación: no se han publicado métricas específicas de alucinación; el conocimiento medido (48/80) es ligeramente inferior al del modelo base (49/80), aunque la diferencia es de un solo ítem.
- La evaluación se realizó en un conjunto japonés proporcionado por el usuario, con etiquetas heurísticas de coincidencia de cadenas; los resultados pueden no generalizarse a otros idiomas o dominios.
- Idiomas soportados no documentados oficialmente; solo se reporta evaluación en JA/EN.
- Restricción de licencia: uso comercial limitado a entidades con ingresos anuales inferiores a 10 millones de USD. Liquid AI no respalda ni da soporte a este modelo.
- El autor prohíbe explícitamente el uso para generar contenido sexual con menores, asistir en actos ilegales o atacar a personas reales.
- Requiere llama.cpp b12040 o superior; versiones anteriores no cargan la arquitectura `lfm3`.
- El modo thinking está activado por defecto y consume una mediana de ~1.7k tokens; con `max_tokens` insuficiente las respuestas se truncan.
- Longitud de contexto no disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.

## Enlaces

- HuggingFace: https://huggingface.co/onemunanoyo/LFM3-1.7B-Abliterated-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida como `LICENSE` en el repositorio
- Nota de modificaciones: `NOTICE-MODIFICATIONS.md` en el repositorio
- llama.cpp: no se proporciona enlace directo en la información disponible
