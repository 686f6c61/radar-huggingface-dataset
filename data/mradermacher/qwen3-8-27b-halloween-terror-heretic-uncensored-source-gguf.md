# mradermacher/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-GGUF

## Resumen

Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored es un fine-tune de 27 mil millones de parámetros basado en la familia Qwen, creado por DavidAU y cuantizado a GGUF por mradermacher. Se trata de un modelo "abliterated" (sin filtros de seguridad) y "uncensored", orientado específicamente a escritura creativa de terror, ficción de género, roleplaying y simulaciones de personajes, incluyendo varios "constructos de IA" temáticos de Halloween con distintos modos de razonamiento e instrucción.

El modelo resuelve un problema concreto: la dificultad de generar ficción oscura, horror y contenido maduro con modelos comerciales fuertemente alineados. Para ello combina las capacidades de razonamiento de la base Qwen3.8 con un ajuste fino orientado a escritura creativa en todos los géneros, sin rechazos de seguridad. Es relevante para quien necesite un modelo local, con licencia permisiva (Apache 2.0), para narrativa interactiva, roleplaying y experimentación con personalidades de IA no convencionales.

La versión aquí descrita es el repositorio de cuantizaciones estáticas GGUF de mradermacher, que ofrece desde Q2_K (11 GB) hasta Q8_0 (29,1 GB), además de suplementos multimodales (mmproj) en Q8_0 y f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen (denominado "Qwen3.8" por el autor; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (dato real de safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo fuente está en safetensors |

## Arquitectura y entrenamiento

El modelo parte de DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source, un fine-tune de un modelo Qwen de 27 mil millones de parámetros. El término "abliterated" indica que se ha aplicado una técnica de eliminación de direcciones de rechazo en el espacio de activaciones (típicamente mediante comparación de activaciones en pares de prompts dañinos/inofensivos), lo que suprime los mecanismos de negativa del modelo sin necesidad de reentrenamiento completo. El tag "heretic" sugiere el uso de la herramienta Heretic para este proceso de desalineación automatizada.

No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, el método de fine-tuning (LoRA/QLoRA/full) ni el uso de RLHF/DPO. La model card menciona "13 reasoning modes", "13 instruct modes", "10 EVIL AI Constructs" y "Halloween O/S", lo que apunta a un entrenamiento con plantillas de sistema múltiples y personalidades preconfiguradas, pero sin detalles técnicos verificables. Los pesos GGUF de este repositorio son cuantizaciones estáticas realizadas por mradermacher; existen además cuantizaciones weighted/imatrix en un repositorio aparte.

## Capacidades

- Generación de texto creativo en todos los géneros, con especial énfasis en terror y ficción de Halloween según los tags del autor.
- Escritura de historias largas y ficción (tags: story, writing, fiction, creative writing, all genres).
- Roleplaying y simulaciones de personajes ("evil sims", "10 EVIL AI Constructs", "Turbo-Brilliance Evil Ed").
- Múltiples modos de razonamiento e instrucción: 13 reasoning modes y 13 instruct modes según la model card.
- Modo thinking/reasoning heredado de la base Qwen (según tags).
- Contenido sin filtros: al ser abliterated y uncensored, no rechaza peticiones sensibles (esto es una capacidad técnica, con implicaciones éticas importantes).
- Posible capacidad multimodal: la presencia de archivos mmproj (suplemento multi-modal) sugiere soporte de visión vía llama.cpp, aunque no está documentado.
- No hay evidencia de soporte de tool calling, function calling ni capacidades de agentes en la información disponible.

## Casos de uso

- Escritura de novela de terror: el modelo puede generar capítulos de horror sin rechazos de seguridad, manteniendo tono oscuro y contenido maduro que otros modelos bloquearían; adecuado para autores que usan el modelo como asistente de borradores.
- Roleplaying inmersivo: gracias a las personalidades preconfiguradas ("EVIL AI Constructs") y los modos instruct, se puede usar en frontends como SillyTavern para personajes villanos y narrativas oscuras.
- Ficción interactiva y juegos de texto: su orientación a "all genres" y roleplaying lo hace útil para generar narrativa ramificada en videojuegos o aventuras conversacionales.
- Generación de contenido para Halloween y marketing temático: creación de relatos cortos, descripciones de escenarios o guiones para eventos y atracciones de terror.
- Experimentación en investigación de alineación: al ser un modelo abliterated con Apache 2.0, sirve como sujeto de estudio para analizar efectos de la desalineación en calidad de generación y seguridad.
- Superación del bloqueo del escritor en géneros oscuros: usar los modos de razonamiento para desarrollar tramas, antagonistas y atmósferas antes de la redacción final.
- Pruebas de cuantización: el amplio abanico de quants (Q2_K a Q8_0) lo hace idóneo para comparar degradación de calidad en escritura creativa según el nivel de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tabla de quants del propio repo):
  - Q2_K: ~11 GB; Q3_K_M: ~13,6 GB; IQ4_XS: ~15,5 GB; Q4_K_M: ~16,9 GB; Q5_K_M: ~19,6 GB; Q6_K: ~22,5 GB; Q8_0: ~29,1 GB (más el KV cache según contexto).
- GPU recomendadas:
  - Q2_K a Q4_K_M caben en una RTX 3090 o RTX 4090 (24 GB) con margen para contexto.
  - Q5_K_M y Q6_K requieren 24 GB ajustados o una RTX 5090 (32 GB), A100 40 GB o descarga parcial a CPU.
  - Q8_0 es cómodo en A100 40 GB, H100 o Mac Studio con 32-64 GB de memoria unificada.
- Consumer GPU: sí, una RTX 3090/4090 de 24 GB ejecuta sin problemas las cuants de Q2_K a Q4_K_M; con 16 GB (RTX 4080/4060 Ti 16G) solo las de Q2_K/Q3_K.
- CPU: viable con llama.cpp en equipos con 16-32 GB de RAM para las quants bajas, a velocidades de unos pocos tokens/segundo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp (especialmente relevante para roleplaying), text-generation-webui. No consta soporte verificado en vLLM o TGI para GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Enfoque | Disponibilidad GGUF |
|---|---|---|---|---|
| Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored | 27,3 B | Apache 2.0 | Escritura creativa de terror, uncensored, roleplaying | Sí (Q2_K a Q8_0, más imatrix) |
| Qwen3-30B-A3B (base Apache 2.0) | 30 B (MoE, 3 B activos) | Apache 2.0 | Modelo general con thinking mode | Sí (amplio ecosistema) |
| Mistral Small 3.x 24B | 24 B | Apache 2.0 | General, buen equilibrio creativo/instrucción | Sí (oficial y comunitarias) |

Frente a la base Qwen3-30B-A3B, este fine-tune sacrifica la alineación de seguridad y probablemente parte de rendimiento en tareas generales a cambio de libertad creativa total y personalidades preconfiguradas. Frente a Mistral Small, ofrece un nicho mucho más especializado (horror/roleplaying) y abliteration explícita, con la misma licencia permisiva.

## Limitaciones y advertencias

- Contenido sin filtros: al ser abliterated y uncensored, puede generar texto ofensivo, violento o dañino sin rechazarlo. El propio repositorio está etiquetado como "not-for-all-audiences". Su uso conlleva responsabilidad legal y ética total del usuario.
- Riesgo de alucinación: no disponible como dato medido, pero al ser un fine-tune orientado a ficción, la fiabilidad factual es presumiblemente inferior a la de un modelo general; no es adecuado para tareas que requieran precisión factual.
- Idioma: la model card declara solo inglés; el rendimiento en castellano no está documentado y puede ser significativamente peor.
- Longitud de contexto: no publicada en este repositorio; debe consultarse la model card del modelo fuente antes de planificar cargas de contexto largas.
- Calidad según cuantización: las quants Q2_K y Q3_K degradan notablemente la calidad (el propio repo marca Q3_K_M como "lower quality"); se recomienda Q4_K_M o superior.
- Sin benchmarks publicados: no hay forma objetiva de comparar su rendimiento en tareas estándar.
- Licencia: Apache 2.0 permite uso comercial, pero la abliteration puede afectar a los términos de uso del modelo base original de Qwen según su política; conviene revisarlo para despliegues comerciales.
- Los archivos mmproj sugieren capacidad multimodal, pero no está documentada en la model card; su funcionamiento no está verificado.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-GGUF
- Modelo fuente (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Qwen3.8-27B-Halloween-Terror-Heretic-Uncensored-source-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
