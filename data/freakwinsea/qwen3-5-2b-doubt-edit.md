# Freakwinsea/Qwen3.5-2B-doubt-edit

## Resumen

Qwen3.5-2B-doubt-edit es un artefacto de investigación publicado por el usuario Freakwinsea que consiste en una edición quirúrgica de los pesos del modelo Qwen/Qwen3.5-2B. No se trata de un fine-tuning convencional: no hay gradientes ni entrenamiento. Un editor externo (Claude Opus 5.5, según la model card) modificó 383.099 pesos identificando y eliminando una dirección interna denominada "doubt vs commit" en 64 columnas de `down_proj` de las capas 15, 16 y 18 del transformer. El resto de los pesos es byte-idéntico al modelo base de Qwen.

El modelo base es un transformer multimodal image-text-to-text de 2.274.069.824 parámetros (2,27 B), con licencia Apache-2.0 y formato safetensors, orientado a conversación, matemáticas y razonamiento con modo thinking. La edición busca corregir un fallo de razonamiento observado en el modelo base: re-verifica pasos ya resueltos y no se compromete con una respuesta final dentro del presupuesto de tokens.

La relevancia es metodológica más que de rendimiento: el trabajo se enmarca en la línea de Weight-Space Programming (MIT CSAIL, 2026) y demuestra que una intervención dirigida en el espacio de pesos, con pre-registro y evaluación held-out, puede mejorar la precisión en MATH-500 de un 20,6% a un 27,2% (todas las 500 preguntas, tope de 4k tokens) sin degradar la perplejidad en wikitext-2. Es un caso de estudio de interpretabilidad aplicada, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5; solo se modifican tensores MLP del language model, la torre de visión queda intacta |
| Parámetros totales | 2.274.069.824 (2,27 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (evaluado únicamente en inglés, matemáticas de competición) |
| Licencia | Apache-2.0 (heredada de Qwen3.5-2B) |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `830cd2acf53dbbfdca5f1a62f5e7d003b63255ec7009deb76ef853a232f8b414`) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 en su variante de 2B parámetros, con pipeline `image-text-to-text` y soporte de modo thinking. La edición no altera la arquitectura: modifica únicamente tres tensores del language model, `model.layers.{15,16,18}.mlp.down_proj.weight`, en 64 columnas cada uno, sumando 383.099 pesos cambiados de un total de 2,27 B. El resto del checkpoint, incluida la torre de visión, es byte-idéntico al modelo base (la sha256 de `model.safetensors` coincide con la revisión `15852e8` de Qwen).

No hubo entrenamiento ni descenso de gradiente. El procedimiento consistió en medir una dirección a partir de las activaciones del propio modelo base (archivo `calls/call005_forced_doubt.pt`), y aplicar una resta de esa dirección sobre columnas específicas de las capas indicadas, con una fuerza α = 1. El autor reporta que α entre 1 y 4 produce una meseta de rendimiento y α = 6 degrada. La edición se reconstruye con un script de unas 15 líneas (`e02_edit.py`) y un script de build (`release/build_2b.py`) que verifica bit a bit el checkpoint. El trabajo se apoya en la línea de Weight-Space Programming de MIT CSAIL (Takehi, Teoh, Zhang, Khattab, 2026), donde GPT-6 Astra editó Qwen3.5-0.8B para suprimir bucles de pensamiento; aquí se cambia el editor (Claude), el modelo (2B) y el fallo objetivo (no comprometerse con una respuesta en lugar de entrar en bucle).

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activable, heredado del modelo base.
- Razonamiento matemático de competición: mejora medida en MATH-500, especialmente en niveles de dificultad 1–3.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con la torre de visión sin modificar.
- Capacidad de "comprometerse antes" con una respuesta en problemas que el modelo base ya sabía resolver, reduciendo la re-verificación de pasos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no evaluadas; la model card solo reporta evaluación en inglés.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación en interpretabilidad y edición de pesos: servir como caso reproducible de intervención dirigida sobre pesos con pre-registro y evaluación held-out, útil para estudiar cómo se codifican conductas de razonamiento en direcciones del espacio de activaciones.
- Estudio de la conducta "doubt vs commit": analizar cómo un modelo pequeño decide cuándo dejar de re-verificar y emitir una respuesta, comparando trazas del modelo base y de la versión editada.
- Benchmarking de metodologías de edición: usar el checkpoint como referencia para evaluar técnicas alternativas (ablación direccional, activation steering compilado en pesos) sobre el mismo modelo y la misma tarea.
- Reproducción de experimentos: el repositorio incluye scripts de reconstrucción bit a bit, lo que permite validar pipelines de edición y verificar la reproducibilidad en CPU y GPU (el autor documenta que en CPU 32 de los 383.099 pesos difieren un paso de redondeo bf16).
- Evaluación de transferencia entre escalas: el autor documenta que el fallo se transfiere a Qwen3.5-4B pero la edición no produce ganancia detectable allí, lo que convierte al checkpoint en material para estudiar por qué las intervenciones en espacio de pesos no escalan.
- Docencia y divulgación técnica: ejemplo concreto de cómo una edición de ~15 líneas sobre tres tensores puede mover una métrica de razonamiento con significación estadística, útil en cursos de interpretabilidad mecanística.
- No recomendado como modelo de producción para atención al cliente, generación de código o tareas multilingües: la model card no evalúa IFEval, coding, seguridad ni idiomas distintos del inglés.

## Benchmarks y rendimiento

Resultados reportados por el autor en MATH-500 held-out, puntuado una sola vez con `math-verify`, sampling con thinking on, temperature 0.6, top-p 0.95, top-k 20 y presence penalty 1.5:

| Métrica | Base | Este modelo | Victorias / derrotas emparejadas | Sign test |
|---|---|---|---|---|
| Precisión, 500 problemas, tope 4k tokens | 20,6% | 27,2% | 55 / 22 | p = 0,0002 |
| Precisión, subconjunto fijo de 48 problemas, tope 16k | 29,2% | 54,2% | 13 / 1 | p = 0,002 |
| Precisión de respuestas terminadas | 100% | 100% | — | — |
| Tokens en problemas resueltos por ambos, 16k | 6.586 | 4.142 | — | — |

Controles y preservación reportados:

| Prueba | Resultado |
|---|---|
| wikitext-2 NLL | 2,6703 → 2,6704 (sin cambio) |
| MMLU-Pro no matemáticas, thinking off | 36,7% → 38,3% (26 / 18, p = 0,29) |
| Dirección aleatoria en las mismas capas | 0 victorias / 9 derrotas frente a esta edición, p ≈ 0,004 |
| Fuerza α = 1–4 | meseta; α = 6 degrada |
| Transferencia a Qwen3.5-0.8B | ganancia consistente pero no confirmada (4 tests pre-registrados a favor, ninguno con p < 0,05 individual) |
| Transferencia a Qwen3.5-4B | sin ganancia detectable: 139 problemas de nivel 5 × 2 semillas, 16 / 12, p = 0,57 |

Desglose por dificultad en MATH: niveles 1–3 pasan de 76 a 105 correctos; niveles 4–5 pasan de 27 a 31. IFEval y coding no fueron evaluados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 2,27 B parámetros en bf16 requiere del orden de 4,5 GB solo para pesos, más overhead de activaciones y KV cache; el repo ocupa 4,6 GB.
- GPU recomendadas: no especificadas por el autor. El checkpoint se construyó en GPU (la build en CPU introduce un paso de redondeo bf16 en 32 pesos).
- ¿Cabe en GPU de consumo? No confirmado en la documentación, pero por tamaño (2,27 B) es plausible en GPUs consumer con suficiente VRAM; el autor no lo verifica.
- Opciones de despliegue: `transformers` (librería declarada). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles. El autor reporta únicamente que el modelo editado consume 4.142 tokens frente a 6.586 del base en problemas resueltos por ambos (tope 16k), lo que implica menos generación en esa condición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 (config. del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-doubt-edit | 2,27 B | no disponible | 27,2% (500 problemas, 4k) / 54,2% (48 problemas, 16k) | Apache-2.0 | Hugging Face, 0 descargas, 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-2B (base) | 2,27 B | no disponible | 20,6% (500 problemas, 4k) / 29,2% (48 problemas, 16k) | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B editado (misma familia de edición, experimento del autor) | no disponible | no disponible | ganancia no confirmada estadísticamente | Apache-2.0 (base) | referenciado en el repositorio del autor |
| Qwen3.5-4B (misma edición aplicada) | no disponible | no disponible | sin ganancia detectable (p = 0,57) | Apache-2.0 (base) | referenciado en el repositorio del autor |

No se dispone de comparación con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: evaluado solo en matemáticas de competición en inglés con thinking on, más dos comprobaciones de preservación (wikitext-2 y MMLU-Pro no matemáticas). Comportamiento en código, seguimiento de instrucciones, seguridad y otros idiomas no está medido.
- La mejora se concentra en problemas de dificultad baja y media (niveles 1–3 de MATH); en niveles 4–5 el avance es marginal (27 → 31). No hace al modelo "más listo" en problemas difíciles.
- La edición no transfiere a Qwen3.5-4B: el fallo de "no comprometerse" sí aparece en 4B, pero la intervención no lo corrige. En 0.8B la ganancia es consistente pero no alcanza significación estadística individual en ninguno de los cuatro tests pre-registrados.
- Riesgo de alucinación: no evaluado. Al forzar una mayor propensión a "comprometerse", existe un riesgo teórico de respuestas más seguras pero incorrectas; el autor no reporta métricas de calibración ni de tasa de error en respuestas terminadas más allá del 100% de acierto en el subconjunto evaluado.
- Sesgos conocidos: no documentados. No hay evaluación de sesgo, toxicidad ni seguridad.
- Restricciones de licencia: Apache-2.0 heredada de Qwen3.5-2B, permite uso comercial, pero la model card incluye un aviso de modificación (`model.layers.{15,16,18}.mlp.down_proj.weight`) que conviene conservar al redistribuir.
- Reproducibilidad dependiente del hardware: construir el checkpoint en CPU produce 32 pesos con un paso de redondeo bf16 distinto; la build de referencia se hizo en GPU. La sha256 del `model.safetensors` liberado es `830cd2acf53dbbfdca5f1a62f5e7d003b63255ec7009deb76ef853a232f8b414`.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; sin validación independiente por terceros.
- No usar como sustituto de un modelo de producción sin evaluar previamente las tareas objetivo: la model card lo declara explícitamente como research artifact.

## Enlaces

- Hugging Face: https://huggingface.co/Freakwinsea/Qwen3.5-2B-doubt-edit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del autor (WeightSpace): https://github.com/freakwinsea/WeightSpace
- Informe del experimento: `experiments/001-claude-editor/REPORT.md` dentro del repositorio anterior
- Informe de transferencia entre escalas: `experiments/003-scale/REPORT.md` dentro del repositorio anterior
- Trabajo previo citado: Weight-Space Programming (Takehi, Teoh, Zhang, Khattab, 2026), sin URL disponible en la información proporcionada.
