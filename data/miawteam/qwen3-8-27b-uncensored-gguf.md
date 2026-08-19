# MiawTeam/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una versión cuantizada y sin censura del modelo Qwen/Qwen3.8-27B, publicada por MiawTeam. El modelo base es un transformer denso de 27.320 millones de parámetros con arquitectura `Qwen3_5ForConditionalGeneration`, 64 capas, vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens. Incluye además una torre de visión, por lo que puede procesar imágenes además de texto.

La principal innovación de esta ficha es que el comportamiento de rechazo (refusal) se ha reducido sustancialmente mediante una técnica de abliteración llamada Heretic, que elimina direcciones de rechazo en los pesos sin recurrir a fine-tuning ni a datos adicionales. A diferencia de otras versiones uncensored, esta conserva el head de multi-token prediction (MTP) del modelo original, verificado tensor a tensor tras la cuantización, lo que permite usar decodificación especulativa con llama.cpp.

El modelo se distribuye exclusivamente en formato GGUF con varias cuantizaciones (IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0), pensado para ejecución local eficiente con llama.cpp y herramientas compatibles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso, decoder-only) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles, chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no disponible en este repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con atención de ventana completa y un head de predicción multi-token (MTP) de 1 capa adicional, que permite decodificación especulativa. La versión uncensored se obtiene mediante abliteración con la herramienta Heretic, que co-minimiza el recuento de rechazos frente a la divergencia KL con el modelo original. El proceso se ejecuta en bf16 sin cuantización intermedia, y el LoRA resultante se fusiona en los pesos bf16 base, por lo que los pesos publicados no son un round-trip cuantizado.

Los tensores `mtp.*` se copian verbatim desde el checkpoint base tras la fusión, ya que la abliteración solo modifica `attn.o_proj` y `mlp.down_proj` de la pila principal. Cada archivo GGUF se inspecciona post-cuantización para verificar que el bloque MTP sobrevive (65/65 bloques en las versiones fusionadas). La imatrix se calcula directamente desde el f16, no desde una cuantización intermedia, usando wikitext-2 raw con 200 chunks. No se ha realizado fine-tuning ni se han añadido datos de entrenamiento.

## Capacidades

- Generación de texto en inglés y chino con las mismas capacidades que el modelo base (razonamiento, código, matemáticas, comprensión lectora).
- Procesamiento de imágenes mediante la torre de visión incluida (`mmproj-*-f16.gguf`), lo que permite entrada multimodal.
- Decodificación especulativa nativa gracias al head MTP integrado en los archivos fusionados o como draft separado (`mtp-*-Q8_0.gguf`).
- Reducción sustancial del comportamiento de rechazo: respuestas directas en temas que el modelo base censuraría, sin alterar el conocimiento subyacente.
- Compatible con llama.cpp y herramientas que usen GGUF (llama-server, llama-cli, Ollama, etc.).
- Soporte de contexto largo de 262.144 tokens, útil para documentos extensos o conversaciones multi-turno.
- No se documenta explícitamente soporte de tool calling o function calling, pero al ser una cuantización del modelo base, es probable que herede dicha capacidad (no confirmado en esta ficha).

## Casos de uso

- Creación literaria y narrativa sin restricciones temáticas: el modelo puede generar ficción, guiones o diálogos que aborden temas controvertidos o explícitos sin los rechazos habituales, gracias a la reducción de la censura.
- Investigación académica sobre comportamiento de modelos sin censura: permite estudiar cómo la abliteración afecta a la calidad de las respuestas y a la alineación, comparando con el modelo base.
- Desarrollo de asistentes de escritura creativa para autores que necesitan explorar ideas sin filtros automáticos, con la ventaja de un contexto de 262k tokens para mantener tramas complejas.
- Generación de contenido para juegos de rol: el modelo puede interpretar personajes con libertad total, sin limitaciones de contenido, manteniendo coherencia a lo largo de sesiones largas.
- Análisis de contenido sensible en entornos controlados: por ejemplo, en investigación de ciberseguridad o análisis de textos con lenguaje ofensivo, donde se requiere una respuesta sin evasivas.
- Desarrollo de agentes conversacionales que requieren respuestas directas y sin rodeos, como asistentes técnicos o de soporte que deben dar instrucciones claras incluso en temas delicados.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación 0-shot con lm-evaluation-harness en bf16, comparando el modelo uncensored con el base. También se reporta perplejidad (PPL) en wikitext-2 para la cuantización Q4_K_M.

| Tarea | Base | Uncensored | Delta |
|---|---|---|---|
| MMLU | 83,4 | 83,3 | -0,2 |
| ARC-Challenge | 58,9 | 57,7 | -1,2 |
| HellaSwag | 82,8 | 82,9 | +0,1 |
| Winogrande | 76,1 | 75,3 | -0,8 |
| Media | | | -0,5 |

PPL wikitext-2 (Q4_K_M): 7,1814 ± 0,25227.

Todos los deltas están dentro o cerca del error estándar reportado (MMLU ±0,30, ARC ±1,44, HellaSwag ±0,38, Winogrande ±1,21), por lo que la abliteración no degrada significativamente el rendimiento en estas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - IQ4_XS: ~15,3 GB (cabe en GPUs de 16 GB, aunque ajustado)
  - Q4_K_M: ~16,8 GB (recomendable 24 GB para margen)
  - Q5_K_M: ~19,5 GB (necesita 24 GB o más)
  - Q6_K: ~22,4 GB (recomendable 24 GB o más)
  - Q8_0: ~29,0 GB (necesita 32 GB o más, como A100 40 GB o RTX 6000 Ada)
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 80 GB o H100 para Q8_0. Para el draft head separado (3,2 GB) se puede cargar en la misma GPU.
- Es posible ejecutar en consumer GPUs de 16 GB con IQ4_XS, pero con riesgo de OOM si el contexto es muy largo.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama, LM Studio, y cualquier runtime que soporte GGUF. Para decodificación especulativa, usar `--spec-type draft-mtp` con los archivos fusionados o `--model-draft` con el draft separado.
- Latencia y throughput: no se proporcionan datos concretos. La decodificación especulativa con MTP puede acelerar la generación entre 1,5x y 2,5x en hardware compatible, aunque la tasa de aceptación del draft puede ser ligeramente inferior a la del modelo base (no cuantificado en la ficha).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3 B | 262.144 | Apache 2.0 | safetensors | Modelo original con censura intacta |
| Qwen3.8-27B-Uncensored (este) | 27,3 B | 262.144 | Apache 2.0 | GGUF | Abliterado, MTP verificado |
| Otros modelos uncensored (p.ej. Dolphin) | Variable | Variable | Variable | Variable | Sin datos comparativos publicados en esta ficha |

No se dispone de una comparativa directa con otros modelos uncensored en la información proporcionada. La diferencia clave frente al base es la reducción de rechazos con una pérdida de rendimiento media de -0,5 puntos en las tareas evaluadas.

## Limitaciones y advertencias

- La censura se reduce sustancialmente, pero no se elimina por completo. La model card indica "refusal behaviour has been substantially reduced, not eliminated".
- Al ser un modelo sin censura, puede generar contenido ofensivo, ilegal o peligroso si se le pide. El uso en producción debe contemplar salvaguardas externas.
- Riesgo de alucinación inherente a todos los modelos de lenguaje; la abliteración no lo mitiga.
- Idiomas limitados a inglés y chino; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Qwen3.8-27B) también lo permita; según la ficha, sí.
- El head MTP se entrena contra el modelo sin modificar, por lo que la tasa de aceptación del draft puede caer ligeramente. La decodificación especulativa verifica cada token contra el modelo objetivo, así que la calidad de salida no se ve afectada.
- Los archivos GGUF no incluyen los pesos en safetensors; para fine-tuning o extracción de features se debe usar el modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MiawTeam/Qwen3.8-27B-Uncensored-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- Dataset de benchmarks de decodificación especulativa: https://huggingface.co/datasets/JonathanColetti/qwen3.8-spec-decode-bench
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
