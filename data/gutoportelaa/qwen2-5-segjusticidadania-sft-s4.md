# gutoportelaa/qwen2.5-segjusticidadania-sft-s4

## Resumen

El modelo `gutoportelaa/qwen2.5-segjusticidadania-sft-s4` es un adaptador LoRA (PEFT) entrenado mediante supervisión fina (SFT) sobre el modelo base Qwen2.5-3B. Lo desarrolla el autor independiente gutoportelaa en el marco de un trabajo final de la asignatura de Procesamiento de Lenguaje Natural de la UFPI (2026.2). Su propósito es responder preguntas sobre producción científica brasileña en seguridad pública, justicia y ciudadanía a partir de fragmentos de texto proporcionados, citando el fragmento utilizado y rechazando responder cuando la información no aparece en dichos fragmentos.

El adaptador se publica como un repositorio PEFT de aproximadamente 0,1 GB con pesos en safetensors y licencia Apache 2.0, lo que lo hace ligero y fácil de integrar sobre el modelo base de 3.000 millones de parámetros. La relevancia actual reside en su enfoque de generación aumentada por recuperación (RAG) con citación explícita y abstención controlada, un patrón muy demandado en asistentes documentales de dominio especializado.

No se trata de un modelo completo, sino de un adaptador que requiere cargar Qwen2.5-3B y aplicar los pesos LoRA mediante la librería `peft`. El idioma de trabajo es exclusivamente el portugués y el formato de respuesta esperado incluye citas entre corchetes (`[k]`) o la frase exacta de rechazo «Não encontrado nos documentos.».

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-3B |
| Parámetros totales | Adaptador LoRA con r=16 sobre q, k, v, o, gate, up y down; el modelo base tiene 3.000 millones de parámetros (no disponible el número exacto de parámetros entrenables del adaptador) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la información disponible; hereda la del modelo base Qwen2.5-3B. Los ejemplos de entrenamiento llegan hasta 4.608 tokens |
| Tipos de cuantización | No disponible para el adaptador; el modelo base admite cuantización estándar (el entrenamiento usó AdamW de 8 bits) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango r=16, alpha=32 y dropout de 0,05 sobre las proyecciones q, k, v, o, gate, up y down del transformer Qwen2.5-3B. El entrenamiento usó una tasa de aprendizaje de 2·10⁻⁴, 2 épocas, lote efectivo de 16 (2 × 8 de acumulación de gradiente), hasta 4.608 tokens por ejemplo, optimizador AdamW de 8 bits y programación de calentamiento con decaimento coseno. La pérdida se calcula únicamente sobre los tokens de la respuesta. Las respuestas se cierran con el token `<|im_end|>`.

Los datos de entrenamiento consisten en 2.705 pares `instruction`/`input`/`output` generados por Qwen2.5-7B-Instruct local a partir del corpus del dataset `gutoportelaa/segjusticidadania-experimentos`: 1.844 preguntas ancoradas con cinco fragmentos y respuesta terminada en `[k]`, 600 rechazos («Não encontrado nos documentos.») y 261 resúmenes. La partición es de 2.422 ejemplos de entrenamiento y 283 de validación (10 % de los documentos, separados por documento). Ningún documento origen de un ítem de benchmark entra en los pares de entrenamiento, lo que evita contaminación directa. No se menciona RLHF ni DPO; el método es SFT supervisado con formato de citación y abstención.

## Capacidades

- Generación de texto en portugués con formato de respuesta controlado (citación y rechazo).
- Respuesta a preguntas ancoradas en fragmentos: usa exclusivamente los cinco fragmentos proporcionados y cita el número del fragmento empleado entre corchetes.
- Abstención explícita: devuelve «Não encontrado nos documentos.» cuando la respuesta no está en los fragmentos.
- Resumen de contenido a partir de fragmentos (261 ejemplos de resumen en el corpus de entrenamiento).
- Integración en pipelines RAG: el prompt de sistema e instrucción está pensado para concatenar fragmentos recuperados por un recuperador híbrido (e5 + BM25).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al portugués; no se documenta soporte de otros idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente documental de dominio jurídico y de seguridad pública: el modelo responde preguntas sobre producción científica brasileña usando fragmentos recuperados de un corpus y cita la fuente, lo que permite auditar la respuesta. Es adecuado porque el SFT enseña explícitamente el formato de citación `[k]`.
- Atención al ciudadano sobre normativa y sumulas: integrado en un recuperador híbrido (e5 + BM25), el modelo puede responder consultas frecuentes citando el artículo o súmula correspondiente y rechazar cuando la información no está en la base documental.
- Generación de resúmenes de documentos técnicos: a partir de fragmentos largos (hasta 4.608 tokens en entrenamiento), el modelo produce resúmenes en portugués con formato controlado.
- Verificación de respuestas en pipelines RAG: el comportamiento de abstención permite construir un filtro de calidad que descarta respuestas no respaldadas por los fragmentos recuperados.
- Prototipado académico y docencia: el adaptador es ligero (0,1 GB) y se carga sobre Qwen2.5-3B con `peft`, lo que facilita experimentos reproducibles en entornos con recursos limitados.
- Evaluación de recuperadores: al fijar los cinco fragmentos y el prompt de entrenamiento, el modelo sirve como componente de un banco de pruebas para medir la calidad de un recuperador (acierto, citación correcta y tasa de rechazo).
- Despliegue en entornos con GPU modesta: al ser un adaptador sobre un modelo de 3.000 millones de parámetros, puede ejecutarse en GPUs de consumo con cuantización del modelo base.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La evaluación se realizó sobre 30 preguntas ancoradas del benchmark de evidencia, con los mismos cinco fragmentos fijos para todos los modelos (recuperador híbrido e5 + BM25), prompt en formato de entrenamiento, generación voraz y hasta 160 tokens. El acierto se mide por la presencia de los términos clave de la respuesta de referencia. La prueba de opción múltiple usa 1.438 ítems de laguna (ley, súmula, artículo, porcentaje, año) con elección por verosimilitud y sin contexto.

| Modelo | Acierto (30) | Cita el fragmento correcto | Rechazos | Para solo | McNemar × sin SFT | Opción múltiple (1.438) |
|---|---|---|---|---|---|---|
| Qwen2.5-3B base (sin SFT) | 19 | 3 | 0 | 19/30 | — | 54,5 % |
| **S4, LoRA (este modelo)** | 22 | 27 | 2 | 0/30 | p = 0,453 | 54,9 % |
| S4b, LoRA, fin `<|endoftext|>` | 19 | 23 | 2 | 30/30 | p = 1,000 | 55,0 % |
| Qwen2.5-3B con preentrenamiento continuado (sin SFT) | 7 | 3 | 0 | 20/30 | — | 60,6 % |
| S5, LoRA | 22 | 27 | 2 | 0/30 | p < 0,001 | 60,2 % |
| S5b, LoRA, fin `<|endoftext|>` | 21 | 25 | 2 | 30/30 | p < 0,001 | 60,9 % |

Observaciones del autor: el modelo base no aprendió el token de fin `<|im_end|>` y genera hasta el límite (30 de 30 «para solo»); se recomienda cortar la respuesta en la primera cita `[k]` o en la frase de rechazo, o preferir el S4b. La mejora en acierto frente al modelo base no es estadísticamente significativa (p = 0,453 con McNemar).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, un modelo de 3.000 millones de parámetros en fp16 requiere aproximadamente 6 GB de VRAM solo para pesos, más memoria para el adaptador y el contexto; con cuantización de 8 bits o 4 bits se reduce sustancialmente.
- GPU recomendadas: no especificadas por el autor. Por tamaño del modelo base, cabría en GPUs de consumo tipo RTX 3060/4060 (12 GB o más) en fp16, y en GPUs profesionales (A100, H100) para mayor throughput.
- ¿Cabe en GPU de consumo? Sí, con el modelo base cuantizado o en fp16 en GPUs con al menos 8-12 GB de VRAM; el adaptador en sí ocupa aproximadamente 0,1 GB.
- Opciones de despliegue: carga mediante `transformers` + `peft` (ejemplo oficial en la model card). No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI con este adaptador; sería necesario fusionar el adaptador con el modelo base para usarlo en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el benchmark del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **S4 (este modelo)** | Adaptador LoRA sobre 3.000 M | No especificado (hereda Qwen2.5-3B) | 22/30 acierto, 27/30 citación correcta, 54,9 % opción múltiple | Apache 2.0 | Hugging Face (PEFT) |
| S4b (mismo autor) | Adaptador LoRA sobre 3.000 M | No especificado | 19/30 acierto, 23/30 citación, 55,0 % opción múltiple; cierra correctamente (30/30 «para solo») | Apache 2.0 | Hugging Face (PEFT) |
| S5 (mismo autor) | Adaptador LoRA sobre 3.000 M | No especificado | 22/30 acierto, 27/30 citación, 60,2 % opción múltiple; significativo frente a sin SFT (p < 0,001) | Apache 2.0 | Hugging Face (PEFT) |
| Qwen2.5-3B base | 3.000 M | No especificado | 19/30 acierto, 3/30 citación, 54,5 % opción múltiple | Apache 2.0 | Hugging Face |

No se dispone de comparación con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Benchmark pequeño: con 30 preguntas, diferencias de hasta unos 5 aciertos entre modelos no son significativas; la mejora frente al modelo base no alcanza significación estadística (p = 0,453).
- El modelo no emite el token de fin `<|im_end|>` y genera hasta el límite de tokens (30 de 30 «para solo»); es necesario truncar la respuesta en la primera cita `[k]` o en la frase de rechazo, o usar el S4b.
- Los pares de entrenamiento contienen un 22 % de rechazos, por lo que el modelo rechaza más que el modelo base, incluso cuando la respuesta sí está en los fragmentos.
- El SFT enseña el formato (citar y rechazar), pero no aporta conocimiento nuevo: la opción múltiple sin contexto apenas cambia (54,9 % frente a 54,5 % del base).
- Idioma limitado al portugués; no se documenta soporte de otros idiomas.
- Riesgo de alucinación: aunque el formato exige citar fragmentos, no hay garantía de que la cita sea correcta en todos los casos.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus específico de seguridad pública, justicia y ciudadanía, puede heredar sesgos de dicho corpus.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo para uso de investigación y enseñanza; las respuestas dependen de los fragmentos y no sustituyen la lectura de las fuentes.
- Restricciones de contexto: la longitud de contexto efectiva no está especificada; los ejemplos de entrenamiento llegan a 4.608 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-segjusticidadania-sft-s4
- Dataset de experimentos: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
