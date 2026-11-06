# mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step392

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p12544x1-step392` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario `mhseo2`. El objetivo del entrenamiento es destilar trazas de razonamiento matemático del modelo `allenai/Olmo-3.1-32B-Think` sobre el conjunto de prompts de matemáticas OpenThoughts3, de modo que un modelo de 7.298 millones de parámetros adquiera capacidad de razonamiento paso a paso en tareas de competición matemática. El checkpoint publicado corresponde al paso 392, es decir, la época 8 de un total de 15.

El modelo parte de `mhseo2/Olmo-3-1025-7B-opd`, una variante del Olmo 3 de 7B de AI2, y se entrena con 12.544 muestras (una trayectoria por prompt, aproximadamente 225 millones de tokens) filtradas por criterios estrictos de finalización: la respuesta debe cerrar la etiqueta `</think>` una sola vez y encerrar una respuesta en caja dentro de los 32.768 tokens. Los datos se decontaminaron con n-gramas de 10 contra AIME 2025/2026 y HMMT Feb 2025.

Su relevancia radica en que demuestra un flujo de destilación de razonamiento desde un modelo grande (32B) a uno pequeño (7B) sobre infraestructura europea (BSC MareNostrum 5), con licencia Apache 2.0 y resultados medibles en benchmarks de matemáticas de competición (43,75 % en AIME 2025, 47,08 % en AIME 2026, 28,75 % en HMMT Feb 2025 con mean@8).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (ventana usada en entrenamiento y evaluación) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp16/bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Olmo 3, con 7.298 millones de parámetros. No se especifica en la información disponible la configuración exacta de capas, cabezas de atención ni dimensión oculta. El entrenamiento se realizó sobre el checkpoint base `mhseo2/Olmo-3-1025-7B-opd` mediante SFT con trazas de razonamiento generadas por `allenai/Olmo-3.1-32B-Think` sobre prompts de OpenThoughts3 (rama de datos `p12544x1`: 12.544 prompts × 1 trayectoria = 12.544 muestras, ~225 millones de tokens).

El proceso de filtrado exige que cada traza finalice, cierre `</think>` exactamente una vez y encierre una respuesta en caja tras el cierre, todo dentro de 32.768 tokens. Los datos se decontaminaron con n-gramas de 10 contra AIME 2025/2026 y HMMT Feb 2025 para evitar fugas de evaluación. El entrenamiento usó batch de 256, tasa de aprendizaje 8e-5 con decaimiento coseno hasta 4e-5, warmup del 3 %, weight decay 0.01 y 49 pasos por época, sobre BSC MareNostrum 5 (2 nodos × 4 H100, FSDP, Ulysses SP 2). El checkpoint publicado corresponde al paso 392 (época 8 de 15).

## Capacidades

- Generación de texto y razonamiento matemático paso a paso con modo de pensamiento explícito (`<think>...</think>`).
- Resolución de problemas de competición matemática (AIME, HMMT) con formato de respuesta en caja.
- Razonamiento multi-paso encadenado dentro de una única generación de hasta 32.768 tokens.
- Generación de código y matemáticas generales heredadas del modelo base Olmo 3 (no evaluadas específicamente en esta ficha).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles (modelo de texto).

## Casos de uso

- Resolución automática de problemas de matemáticas de competición: el modelo genera trazas de razonamiento largas (hasta 32.768 tokens) y produce una respuesta final en caja, adecuado para pipelines de evaluación tipo math_verify sobre AIME o HMMT.
- Generación de datos sintéticos de razonamiento matemático: al estar entrenado sobre trazas de un modelo 32B, puede usarse para producir cadenas de pensamiento etiquetadas que alimenten el entrenamiento de modelos más pequeños o el ajuste de evaluadores.
- Tutoría matemática paso a paso: su formato `<think>` explícito permite mostrar al usuario el razonamiento intermedio antes de la respuesta final, útil en entornos educativos.
- Investigación en destilación de razonamiento: sirve como referencia reproducible de un flujo SFT de 32B a 7B con filtrado estricto y decontaminación, útil para estudiar la transferencia de capacidades de razonamiento.
- Evaluación comparativa de modelos pequeños en matemáticas: con resultados publicados en AIME 2025/2026 y HMMT, puede emplearse como baseline en estudios de escalado de razonamiento.
- Prototipado de asistentes de resolución de problemas con contexto largo: la ventana de 32.768 tokens permite incluir enunciados extensos y múltiples intentos dentro de una sola conversación.
- Fine-tuning posterior sobre dominios matemáticos específicos: al ser un checkpoint intermedio (época 8 de 15) con licencia Apache 2.0, es un punto de partida adecuado para ajustes adicionales con RLHF/DPO o SFT sobre datos propios.

## Benchmarks y rendimiento

Evaluación con mean@8 accuracy (%), temperatura 0,6, top_p 0,95, prompt de 768 tokens y respuesta de 32.768 tokens, scorer math_verify, plantilla de chat del estudiante, ejecutado en NVIDIA B200 en float16:

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 43,75 |
| AIME 2026 | 47,08 |
| HMMT Feb 2025 | 28,75 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y caché KV para contextos de hasta 32.768 tokens (estimación orientativa: 20-30 GB en función de la longitud de generación).
- GPU recomendadas: H100 (usada en entrenamiento), B200 (usada en evaluación), A100 80 GB para contextos largos.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con cuantización a 8 bits o inferior; en fp16 ajusta al límite y puede requerir offloading para contextos largos.
- Opciones de despliegue: vLLM y TGI para serving en fp16; llama.cpp y Ollama para cuantizaciones GGUF (previa conversión, no incluidas en el repo); transformers con `device_map="auto"` para prototipado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | AIME 2025 (mean@8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SFT Olmo-3 7B, step 392) | 7,3B | 32.768 | 43,75 % | Apache 2.0 | Hugging Face |
| Olmo-3-1025-7B (base, AI2) | 7,3B | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Olmo-3.1-32B-Think (profesor) | 32B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone en la información proporcionada de resultados comparables de otros modelos de 7B en AIME 2025/2026 o HMMT, por lo que la comparativa cuantitativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (época 8 de 15): no representa el estado final del entrenamiento y su rendimiento podría mejorar con checkpoints posteriores.
- Entrenado exclusivamente sobre prompts de matemáticas de OpenThoughts3: el rendimiento fuera del dominio matemático no está evaluado y puede degradarse respecto al modelo base.
- Riesgo de alucinación en pasos intermedios de razonamiento: las trazas pueden contener errores lógicos que conduzcan a respuestas incorrectas, especialmente en problemas fuera de la distribución de entrenamiento.
- Idiomas soportados no documentados: no hay garantía de calidad multilingüe.
- Sin datos publicados sobre sesgos, tool calling, agentes ni evaluación de seguridad.
- Aunque la licencia es Apache 2.0, el modelo base `mhseo2/Olmo-3-1025-7B-opd` y el profesor `allenai/Olmo-3.1-32B-Think` pueden tener condiciones adicionales que conviene verificar antes de uso comercial.
- El uso de trazas generadas por un modelo profesor de 32B puede introducir sesgos y estilos de razonamiento específicos del profesor.
- Contexto limitado a 32.768 tokens: problemas o conversaciones más largas requieren truncado o estrategias de troceado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p12544x1-step392
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset OpenThoughts3: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
- Repositorio de código (mopdRL, commit f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4): no disponible como URL en la información proporcionada
