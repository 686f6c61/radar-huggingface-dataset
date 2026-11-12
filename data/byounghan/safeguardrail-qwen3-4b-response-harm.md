# Byounghan/safeguardrail-qwen3-4b-response-harm

## Resumen

Safeguardrail Qwen3-4B — response_harm es un modelo guardián (guard model) bilingüe inglés-coreano desarrollado por el usuario Byounghan, afinado a partir de Qwen/Qwen3-4B. Su tarea concreta es clasificar si una respuesta de asistente, dado el prompt del usuario que la originó, es `safe` o `unsafe`, y en caso negativo asignar la categoría de riesgo correspondiente del estándar MLCommons (S1–S14). No es un modelo generativo de propósito general, sino un clasificador especializado con razonamiento explícito previo al veredicto.

Forma parte de una familia de tres especialistas (prompt-harm, response-harm y refusal) construidos sobre la misma base. El entrenamiento se realizó con GRPO mediante la librería verl 0.8.0, sin fase previa de SFT (cold start), usando recompensas basadas en reglas con compuertas duras multiplicativas sobre formato, corrección del veredicto y longitud del razonamiento. El checkpoint final corresponde al paso 87.

El modelo resulta relevante para pipelines de moderación que necesitan evaluar la salida del propio LLM (no solo la entrada), con categorización fina de daño y trazabilidad del razonamiento. Con 4.022 millones de parámetros y licencia Apache 2.0 en los pesos, es desplegable en hardware modesto, aunque el autor advierte que debe tratarse como un checkpoint de investigación por su entrenamiento corto y su limitada evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B); no se detalla configuración interna en la información disponible |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-4B, sin confirmar) |
| Tipos de cuantización | no disponible en la información proporcionada; pesos en safetensors (FP/BF16 presumible) |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | apache-2.0 (pesos); los datasets de entrenamiento incluyen términos no comerciales (p. ej. CC-BY-NC-4.0) |
| Formato de pesos | safetensors (repo de 8,1 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3-4B, un transformer decoder-only de 4.022 millones de parámetros, y se especializa mediante ajuste con GRPO (Group Relative Policy Optimization) usando verl 0.8.0. No hay fase de SFT de arranque en frío: el ajuste parte directamente del modelo base y se guía por una función de recompensa basada en reglas con compuertas duras multiplicativas que penalizan el incumplimiento del formato de salida, la incorrección del veredicto y desviaciones en la longitud del razonamiento. El run se denomina `qwen3_4b_grpo_v13_response_harm` y el checkpoint final se sitúa en el paso 87.

El conjunto de entrenamiento consta de 22.229 ejemplos (11.795 en coreano y 10.434 en inglés), agregados a partir de polyguardmix (EN y KO), wildguardmix (EN y KO), PKU-SafeRLHF, BeaverTails, BingoGuard y Aegis 2.0. Los datos coreanos combinan conjuntos nativos con traducciones automáticas de datasets de guardrails en inglés. Todas las fuentes se mapearon a un esquema único basado en las categorías MLCommons S1–S14, con la regla de etiquetar como segura la blasfemia sin objetivo. La innovación técnica principal es el formato de salida estructurado con razonamiento breve en `<think>` seguido de un veredicto estricto y, cuando procede, la categoría de riesgo.

## Capacidades

- Clasificación binaria de seguridad de respuestas de asistente (`safe` / `unsafe`) condicionada al prompt del usuario.
- Asignación de categoría de riesgo MLCommons S1–S14 cuando el veredicto es `unsafe` (S1 crímenes violentos, S2 crímenes no violentos, S3 delitos sexuales, S4 explotación sexual infantil, S5 difamación, S6 consejo especializado financiero/médico/legal, S7 privacidad, S8 propiedad intelectual, S9 armas indiscriminadas CBRNE, S10 odio, S11 suicidio y autolesión, S12 contenido sexual, S13 elecciones, S14 abuso de intérprete de código).
- Razonamiento explícito previo al veredicto en un bloque `<think>`, lo que facilita la auditoría de la decisión.
- Salida en formato estricto y parseable (`Answer:` y `Category:`), adecuada para integración programática.
- Capacidad bilingüe inglés-coreano.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio según la información disponible.
- No está diseñado para generación libre de texto ni para conversación multi-turno.

## Casos de uso

- Moderación de salidas de LLM en producción: colocar el modelo como segunda etapa tras el generador para etiquetar respuestas dañinas antes de mostrarlas al usuario, aprovechando el veredicto binario y la categoría S1–S14 para enrutar a revisión humana o bloqueo.
- Filtrado de contenido en asistentes bilingües inglés-coreano: su entrenamiento específico en coreano nativo y traducido lo hace adecuado para productos dirigidos a mercados de habla coreana donde los guardrails solo en inglés fallan.
- Auditoría y anotación de datasets de seguridad: usar el modelo para preetiquetar pares prompt-respuesta con categoría de riesgo y revisar manualmente solo los casos límite, reduciendo coste de anotación.
- Cumplimiento y gobernanza de IA: generar registros de clasificación con razonamiento (`<think>`) y categoría para documentar por qué una respuesta se consideró insegura en auditorías internas o regulatorias.
- Evaluación de red-teaming: procesar los pares generados en ejercicios de ataque para medir cuántas respuestas del modelo objetivo caen en categorías concretas (p. ej. S11 suicidio y autolesión, S6 consejo especializado).
- Enrutado hacia políticas específicas: al devolver la categoría S#, el sistema puede aplicar políticas diferenciadas (bloqueo total para S4, aviso para S6, revisión para S13) en lugar de un filtro binario único.
- Investigación en guardrails: servir como línea base reproducible para comparar técnicas de RL (GRPO sin SFT) frente a enfoques con SFT o clasificadores discriminativos.

## Benchmarks y rendimiento

Evaluación interna del autor (panel completo, 2026-08), sin comparación con otros modelos en la información disponible:

| Métrica | Puntuación |
|---|---|
| Response-harm macro F1 | 0,800 |
| BeaverTails F1 | 0,833 |
| WildGuardMix-ko response F1 | 0,768 |

No se han publicado resultados comparativos frente a otros guard models en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 8–9 GB para los 4.022 millones de parámetros, más overhead de KV cache y activaciones.
- En cuantización de 8 bits: en torno a 4–5 GB; en 4 bits: en torno a 2,5–3,5 GB (estimaciones a partir del tamaño de parámetros, no confirmadas por el autor).
- GPU recomendadas para producción: A100, H100 o L40S para mayor throughput con vLLM; RTX 4090 o RTX 3090 suficientes para uso en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 12–16 GB o más en BF16 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090); en cuantización de 4 u 8 bits cabría en GPUs de 8 GB.
- Opciones de despliegue: vLLM (ejemplo oficial de la model card), TGI (tag `text-generation-inference` y `endpoints_compatible`), transformers; llama.cpp/Ollama no están documentados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Safeguardrail Qwen3-4B response-harm | 4,02 B | no disponible | en, ko | apache-2.0 (pesos) | Guard model de respuestas con categoría S1–S14 |
| Safeguardrail Qwen3-4B prompt-harm | 4,02 B (base común) | no disponible | en, ko | apache-2.0 (pesos) | Guard model de prompts de la misma familia |
| Safeguardrail Qwen3-4B refusal | 4,02 B (base común) | no disponible | en, ko | apache-2.0 (pesos) | Clasificación de rechazos de la misma familia |
| Qwen/Qwen3-4B (base) | 4,02 B | no disponible en esta ficha | multilingüe | apache-2.0 | Modelo generativo de propósito general, sin especialización en seguridad |

No se dispone de datos de benchmarks comparativos frente a otros guard models (p. ej. WildGuard, Llama Guard) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo 87 pasos de GRPO sobre ~22.000 ejemplos: el propio autor lo califica como checkpoint de investigación, no como modelo listo para producción sin validación adicional.
- Evaluado únicamente sobre pares prompt-respuesta individuales; no se ha evaluado en conversaciones multi-turno.
- No evaluado frente a ataques adaptativos dirigidos al propio clasificador (adversarial prompting contra el guard).
- Riesgo de alucinación en el razonamiento `<think>`: la justificación puede no reflejar el criterio real que llevó al veredicto; conviene tratar la categoría S# como señal, no como verdad absoluta.
- Sesgos potenciales derivados de los datasets de entrenamiento (polyguardmix, wildguardmix, PKU-SafeRLHF, BeaverTails, BingoGuard, Aegis 2.0) y de las traducciones automáticas al coreano, que pueden introducir artefactos de traducción.
- Cobertura lingüística limitada a inglés y coreano; el rendimiento en otros idiomas (incluido el español) no está documentado y previsiblemente será deficiente.
- Restricciones de licencia: aunque los pesos son Apache 2.0, algunas fuentes de entrenamiento tienen términos no comerciales (p. ej. CC-BY-NC-4.0) o licencias no confirmadas; el autor recomienda revisar los términos de los datasets subyacentes antes de un uso comercial.
- El formato de prompt es obligatorio y estricto: desviarse del system prompt o de la plantilla de usuario puede degradar gravemente el veredicto, ya que el modelo solo fue entrenado con ese formato.
- Sin paper publicado (en preparación) ni evaluación externa independiente; las métricas proceden de un panel interno del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Byounghan/safeguardrail-qwen3-4b-response-harm
- Modelo hermano prompt-harm: https://huggingface.co/Byounghan/safeguardrail-qwen3-4b-prompt-harm
- Modelo hermano refusal: https://huggingface.co/Byounghan/safeguardrail-qwen3-4b-refusal
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Librería verl (entrenamiento GRPO): https://github.com/volcengine/verl
