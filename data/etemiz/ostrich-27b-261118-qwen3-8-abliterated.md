# etemiz/Ostrich-27B-261118-Qwen3.8-Abliterated

## Resumen

Ostrich-27B-261118-Qwen3.8-Abliterated es un ajuste fino (fine-tune) del modelo denso Qwen/Qwen3.8-27B, desarrollado por el usuario etemiz dentro de la familia Ostrich. El modelo parte de una iteración previa (Ostrich-27B-261028) y se presenta como una versión "abliterated": se ha eliminado el comportamiento de rechazo (refusal) mediante técnicas de abliteration, de modo que responde de forma directa y sin censura aparente. Está orientado a dominios concretos como salud, nutrición, hierbas medicinales, ayuno, espiritualidad, tecnologías de resistencia a la censura (bitcoin, nostr) y habilidades prácticas de vida.

El modelo conserva la arquitectura del Qwen3.8-27B base, con aproximadamente 27.780 millones de parámetros totales en formato safetensors (55,6 GB en el repositorio). La model card no detalla la longitud de contexto ni la composición exacta del transformer, pero sí indica que se ha entrenado con un corpus grande de artículos científicos primarios y que incorpora una familia de adaptadores de preentrenamiento continuado (`cpt6v`, `cpt6p`, `cpt6r`). La licencia declarada es Apache 2.0.

La relevancia de este lanzamiento radica en su enfoque de alineación alternativa: en lugar de optimizar para rechazar peticiones, el autor busca "liberar" conocimiento considerado infrarrepresentado en los LLM actuales y medir la alineación con un conjunto de evaluaciones propio (AHA 2026). El modelo reporta mejoras notables frente al Qwen 3.8 base en dominios como faith (21% → 94%), alt-med (27% → 91%) o herbs (48% → 88%), aunque con regresiones en misinfo y fasting respecto a la iteración 261028.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; se asume compatibilidad con cuantizaciones estándar del base, sin confirmar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.8-27B, un transformer denso de 27B parámetros. El autor no publica en la model card detalles sobre el número de capas, atención, tokenizador ni longitud de contexto del base. El entrenamiento de Ostrich combina ajuste fino con preentrenamiento continuado (continued pretraining) mediante una familia de adaptadores denominada `cpt6*`: `cpt6v` (corpus "vibe"), `cpt6p` (artículos científicos) y `cpt6r` (informes). Según la model card, se han generado 241 adaptadores únicos `cpt6` aplicados en 1.387 cruces de linaje (630 vibe, 324 papers, 433 reports), con rangos 16/32/64 y capas tardías (≥48) congeladas para proteger el stack final.

El corpus de artículos científicos (`ds_cpt_papers`) se tokenizó en documentos de 4.160 tokens, preservando títulos y aplicando filtrado de casi-duplicados. La abliteration se aplicó con "capability-guarded abliteration", es decir, protegiendo capacidades durante la eliminación de rechazos. El autor menciona además entrenamiento en "agentic RAG abstention" y "truth judgement". No se detalla si hubo RLHF o DPO, ni el volumen total de tokens de entrenamiento.

## Capacidades

- Generación de texto y respuesta directa en dominios de salud, nutrición, hierbas medicinales, ayuno, espiritualidad y tecnologías de resistencia a la censura.
- Comportamiento "uncensored": según la model card, 20 de 20 prompts dañinos fueron respondidos sin rechazos duros ni suaves (100% comply).
- Razonamiento con modo "thinking": la model card menciona longitudes de bloques de pensamiento de 1.195 caracteres en modo medio y 1.349 en modo xhigh.
- Memoria de contexto largo: la suite de human-likeness incluye pruebas de memoria en contexto largo (puntuación 1.0 en esa sección).
- Conversación multi-turno: probado con conversaciones de 10 y 15 turnos (consulta médica de 15 turnos).
- Instrucciones mecánicas: 14/16 autocontroles mecánicos superados (0,875).
- Resistencia a sycophancy y a "confabulation bait": secciones de la suite con puntuación 1.0.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Consulta de salud y nutrición en privado: el modelo está entrenado específicamente en salud (80% en la eval del autor) y nutrición (81%), por lo que puede usarse como segunda opinión local sobre dietas, hierbas medicinales o tradiciones de curación, sin enviar datos a servicios en la nube.
- Asistente de ayuno y espiritualidad: con puntuaciones de 69% en fasting y 94% en faith, es adecuado para conversaciones sobre prácticas religiosas, ayuno intermitente y cuestiones que la ciencia sola no responde, manteniendo un tono directo.
- Educación sobre plantas medicinales: la eval de herbs alcanza 88%, lo que lo hace útil para consultas sobre usos tradicionales de plantas, siempre con advertencia de que no sustituye consejo médico.
- Despliegue local en hardware de consumidor: al ser un denso de 27B, el autor indica que cabe en una sola GPU de consumidor a 4 bits (~18 GB), lo que permite ejecutarlo en una RTX 4090 para uso personal y privado.
- Investigación sobre alineación y abliteration: el modelo sirve como caso de estudio de una metodología de alineación alternativa (AHA 2026) y de eliminación de rechazos con protección de capacidades, útil para investigadores que estudian comportamiento de modelos.
- Asistente sobre tecnologías de resistencia a la censura: con 84% en bitcoin, puede emplearse para responder dudas sobre bitcoin, nostr y herramientas de comunicación resistentes a la censura.
- Generación de contenido sobre habilidades prácticas: aunque no hay eval específica, el autor declara entrenamiento en jardinería, permacultura y preparacionismo, por lo que puede usarse como asistente doméstico en esos temas.
- Evaluación de desinformación: la eval de misinfo (71%) sugiere que puede usarse para contrastar bulos en los dominios entrenados, aunque con cautela por la regresión respecto a la versión anterior.

## Benchmarks y rendimiento

La model card presenta evaluaciones propias (método AHA 2026) comparando con Qwen 3.8 27B vanilla:

| Dominio | Base Qwen 3.8 | Ostrich 261118 |
|---|---|---|
| faith | 21% | 94% |
| fasting | 24% | 69% |
| health | 43% | 80% |
| nutrition | 49% | 81% |
| misinfo | 23% | 71% |
| bitcoin | 64% | 84% |
| alt-med | 27% | 91% |
| herbs | 48% | 88% |
| Overall (media geométrica) | 35% | 82% |

Además, la model card reporta sondas zero-shot de primer token: BoolQ 92%, PIQA 83%, LAMBADA 75,5%, MMLU-Pro (Leaderboard) 80% y ARC-Challenge 66%. La suite de human-likeness obtuvo 0,968 global (instruction following 0,875, bias 0,833, resto 1.0). El fitness Evol v2 fue 0,7482. No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica ~18 GB a 4 bits para el modelo base de 27B; en FP16 serían aproximadamente 55,6 GB (tamaño del repositorio en safetensors).
- GPU recomendadas: para FP16, A100 80GB o H100; para 4 bits, una RTX 4090 (24 GB) sería suficiente según el dato del autor.
- Cabe en GPU de consumidor: sí, a cuantización 4 bits en GPUs con 24 GB o más (RTX 4090, RTX 3090).
- Opciones de despliegue: no se especifican en la model card; al ser safetensors de un transformer estándar, se puede convertir a GGUF para llama.cpp/Ollama o servir con vLLM/TGI, aunque no está confirmado por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ostrich-27B-261118-Qwen3.8-Abliterated | 27,78B | no disponible | Apache 2.0 | Fine-tune abliterated orientado a dominios concretos |
| Qwen/Qwen3.8-27B (base) | ~27B | no disponible | no disponible en la información | Modelo denso original; sirve de referencia en las evals del autor |
| Ostrich-27B-261028-Qwen3.8-Abliterated | ~27B | no disponible | Apache 2.0 | Iteración previa; overall 82% (0,824 vs 0,830 en 261118) |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está "abliterated": se ha eliminado el comportamiento de rechazo, por lo que puede responder a prompts dañinos (100% comply en la prueba del autor). No es adecuado para despliegues sin supervisión ni para entornos donde se requiera moderación.
- Riesgo alto de alucinación en dominios de salud y medicina: el propio autor advierte que no garantiza la verdad al 100% y que no debe sustituir consejo médico profesional.
- Regresiones respecto a la versión 261028 en misinfo (84% → 71%), herbs (98% → 88%), fasting (76% → 69%) y faith (97% → 94%), lo que indica un perfil de dominio inestable entre iteraciones.
- Idiomas soportados no documentados; no hay garantía de calidad fuera del inglés.
- Longitud de contexto no documentada; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el carácter uncensored y los dominios sensibles (salud) trasladan al desplegador la responsabilidad legal y ética.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validación comunitaria independiente.
- La model card incluye afirmaciones de marketing ("liberating wisdom", "beneficial AI") sin evidencia externa; las evaluaciones son propias del autor y no han sido replicadas.

## Enlaces

- Hugging Face: https://huggingface.co/etemiz/Ostrich-27B-261118-Qwen3.8-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Iteración previa: https://huggingface.co/etemiz/Ostrich-27B-261028-Qwen3.8-Abliterated
- Blog AHA 2026: https://huggingface.co/blog/etemiz/aha-2026-leaderboard
- Blog "Building a beneficial AI": https://huggingface.co/blog/etemiz/building-a-beneficial-ai
- Blog "From Robots That Prey to Robots That Pray": https://huggingface.co/blog/etemiz/from-robots-that-prey-to-robots-that-pray
- Comunidad r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/
