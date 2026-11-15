# gutoportelaa/qwen2.5-segjusticidadania-sft-s1

## Resumen

El modelo `gutoportelaa/qwen2.5-segjusticidadania-sft-s1` es un ajuste fino por supervisión (SFT) de Qwen2.5-1.5B-Instruct, desarrollado por el usuario gutoportelaa en el marco de un trabajo de fin de asignatura de Procesamiento de Lenguaje Natural de la UFPI (Brasil, periodo 2026.2). Su propósito es responder preguntas sobre producción científica brasileña en materia de seguridad pública, justicia y ciudadanía exclusivamente a partir de fragmentos de documentos proporcionados en el contexto, citando el fragmento empleado y rechazando responder cuando la información no aparece en dichos fragmentos.

Técnicamente se trata de un ajuste completo de todos los pesos del modelo base (no LoRA ni QLoRA), con pesos maestros en fp32 y cálculo en bf16, sobre un conjunto de 2.705 pares instrucción/entrada/salida generados sintéticamente por Qwen2.5-7B-Instruct a partir de un corpus documental. El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros y una ventana de contexto nativa de 32.768 tokens (según las especificaciones del modelo base).

La relevancia de esta ficha radica en que documenta un caso de uso muy específico de ajuste fino orientado a formato y anclaje documental (RAG con cita y abstención), con una evaluación honesta y un benchmark pequeño que muestra que el SFT enseña el formato pero no aporta conocimiento nuevo. Es un ejemplo útil para quienes diseñan pipelines de generación aumentada por recuperación con requisitos estrictos de trazabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste completo por SFT sobre Qwen2.5-1.5B-Instruct |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; el entrenamiento usó hasta 4.608 tokens por ejemplo) |
| Tipos de cuantización | No disponible en la información proporcionada (pesos publicados en safetensors; el modelo base admite cuantización estándar vía GPTQ, AWQ o GGUF, pero no se documenta para este ajuste) |
| Idiomas soportados | Portugués (pt), según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de 1,5 mil millones de parámetros. El ajuste realizado es un SFT de todos los pesos (full fine-tuning), con pesos maestros en fp32 y cómputo en bf16, tasa de aprendizaje de 1·10⁻⁵, optimizador AdamW de 8 bits, calentamiento y decaimiento coseno, lote efectivo de 16 (2 × 8 de acumulación de gradiente) y hasta 4.608 tokens por ejemplo. Se entrenaron 2 épocas y el checkpoint publicado corresponde al paso 300 (final del entrenamiento). La pérdida se calcula únicamente sobre los tokens de la respuesta.

Los datos de entrenamiento consisten en 2.705 pares `instruction`/`input`/`output` generados por Qwen2.5-7B-Instruct local a partir del corpus del dataset `gutoportelaa/segjusticidadania-experimentos`: 1.844 preguntas ancladas con cinco fragmentos y respuesta terminada en `[k]` (cita del fragmento usado), 600 ejemplos de rechazo ("Não encontrado nos documentos.") y 261 resúmenes. El reparto es de 2.422 ejemplos de entrenamiento y 283 de validación, separados por documento para evitar filtración. Ningún documento origen de un ítem del benchmark entra en los pares de entrenamiento. No se documenta uso de RLHF ni DPO; el método es SFT supervisado puro.

## Capacidades

- Generación de texto en portugués con formato conversacional (plantilla de chat de Qwen2.5).
- Respuesta anclada a fragmentos: responde usando exclusivamente los fragmentos proporcionados en el contexto.
- Citación explícita del fragmento empleado mediante el marcador `[k]`.
- Abstención controlada: devuelve exactamente "Não encontrado nos documentos." cuando la respuesta no está en los fragmentos.
- Generación de resúmenes a partir de documentos (capacidad presente en los datos de entrenamiento, aunque no evaluada de forma específica).
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multimodal (visión, audio) ni modo de razonamiento explícito (thinking mode).
- Capacidad multilingüe limitada al portugués según la model card, aunque el modelo base es multilingüe.

## Casos de uso

- Atención a preguntas sobre normativa y producción científica en seguridad pública: el modelo recibe cinco fragmentos recuperados por un sistema híbrido (e5 + BM25) y responde citando el fragmento correcto, lo que permite auditar la fuente de cada afirmación.
- Asistentes de consulta documental con trazabilidad obligatoria: en entornos donde cada respuesta debe poder rastrearse a un pasaje concreto, el formato de cita `[k]` facilita la verificación manual o automática.
- Sistemas RAG con abstención: cuando la respuesta no está en el corpus recuperado, el modelo devuelve una cadena fija de rechazo, lo que reduce el riesgo de alucinación en dominios sensibles como justicia y ciudadanía.
- Generación de resúmenes de documentos técnicos o jurídicos: el modelo fue entrenado con 261 ejemplos de resumen sobre el corpus, por lo que puede emplearse para condensar informes o artículos del dominio.
- Prototipado académico y docencia: al ser un modelo de 1,5B parámetros con licencia Apache 2.0, es adecuado para experimentos de ajuste fino y evaluación en cursos de PLN sin requerir infraestructura grande.
- Evaluación de pipelines de recuperación: el modelo sirve como componente generador fijo para comparar recuperadores (por ejemplo, variantes de BM25, densos o híbridos) midiendo la tasa de acierto y de citación correcta.
- Despliegue en entornos con recursos limitados: con 1,5B parámetros y pesos en safetensors de aproximadamente 3,1 GB, puede ejecutarse en una única GPU de consumo para tareas de inferencia por lotes.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a la evaluación sobre 30 preguntas ancladas del benchmark de evidencia del dataset `segjusticidadania-experimentos`, con los mismos cinco fragmentos fijos para todos los modelos (recuperador híbrido e5 + BM25), prompt en el formato de entrenamiento, generación voraz y hasta 160 tokens. El criterio de acierto es que los términos clave de la respuesta de referencia aparezcan en la respuesta generada. "Para sozinho" indica respuestas que terminan antes del límite de 160 tokens. La prueba de múltiple elección consta de 1.438 ítems de laguna (ley, súmula, artículo, porcentaje, año) evaluados por verosimilitud y sin contexto.

| Modelo | Acierto (30) | Cita el fragmento correcto | Rechazos | Termina solo | McNemar vs sin SFT | Múltiple elección (1.438) |
|---|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (sin SFT) | 24 | 3 | 0 | 29/30 | — | 50,4% |
| S1, ajuste completo (este modelo) | 20 | 22 | 4 | 30/30 | p = 0,289 | 50,6% |
| S2, LoRA | 15 | 24 | 4 | 30/30 | p = 0,012 | 49,4% |
| S3, QLoRA | 18 | 23 | 4 | 30/30 | p = 0,109 | 49,7% |
| S1m, ajuste completo, mejor punto de validación | 17 | 26 | 4 | 30/30 | p = 0,039 | 50,6% |

El propio autor señala que, con 30 preguntas, las diferencias de hasta unos 5 aciertos entre modelos no son significativas. El SFT incrementa notablemente la tasa de citación correcta (de 3 a 22 sobre 30) y la abstención (de 0 a 4), a costa de una ligera reducción del acierto bruto (de 24 a 20). La prueba de múltiple elección sin contexto no cambia respecto al modelo base, lo que confirma que el ajuste enseña formato y no conocimiento nuevo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en bf16/fp16 (tamaño del repositorio), alrededor de 1,6 GB en cuantización de 8 bits y en torno a 0,9-1,0 GB en cuantización de 4 bits (estimaciones según el número de parámetros; no verificadas en la información proporcionada).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1660 (6 GB), RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, incluso en bf16.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (etiqueta `text-generation-inference` presente) y endpoints compatibles (etiqueta `endpoints_compatible`). No se documenta explícitamente compatibilidad con vLLM, llama.cpp u Ollama para este ajuste concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-segjusticidadania-sft-s1 (este modelo) | 1,54B | 32.768 (base) | Apache 2.0 | SFT completo para RAG con cita y abstención en portugués | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Modelo base conversacional multilingüe | Hugging Face |
| S2, LoRA (mismo autor) | 1,54B | 32.768 (base) | Apache 2.0 | LoRA sobre el mismo corpus | Hugging Face |
| S3, QLoRA (mismo autor) | 1,54B | 32.768 (base) | Apache 2.0 | QLoRA sobre el mismo corpus | Hugging Face |

La comparación con alternativas de propósito general del mismo tamaño (por ejemplo, Llama 3.2 1B o Gemma 2 2B) no está disponible en la información proporcionada, ya que no se aportan datos de rendimiento de esos modelos en el benchmark del autor.

## Limitaciones y advertencias

- Benchmark pequeño: con solo 30 preguntas, las diferencias de hasta unos 5 aciertos entre modelos no son estadísticamente significativas, como advierte el propio autor.
- Exceso de abstención: los pares de entrenamiento contienen un 22% de rechazos, y los modelos ajustados rechazan más que la base, incluso cuando la respuesta sí está en los fragmentos.
- No aporta conocimiento nuevo: el SFT enseña el formato (citar y rechazar); la prueba de múltiple elección sin contexto no mejora respecto al modelo base (50,6% frente a 50,4%).
- Dependencia estricta del contexto: las respuestas se limitan a los fragmentos proporcionados; si el recuperador falla, el modelo no puede compensarlo con conocimiento paramétrico.
- Sesgos: no se documentan sesgos específicos, pero el corpus se centra en producción científica brasileña sobre seguridad pública, justicia y ciudadanía, lo que puede introducir sesgos de dominio y de selección documental.
- Riesgo de alucinación: reducido por el formato de cita y abstención, pero no eliminado; el modelo puede citar un fragmento incorrecto o parafrasear en exceso.
- Idioma: la model card declara únicamente portugués; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse respecto al modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el autor indica que el uso previsto es de investigación y enseñanza, y que las respuestas no sustituyen la lectura de las fuentes.
- El autor recomienda preferir el checkpoint S1m (mejor punto de validación) frente a este S1 (paso final), lo que sugiere que este último puede estar ligeramente sobreajustado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gutoportelaa/qwen2.5-segjusticidadania-sft-s1
- Dataset de experimentos: https://huggingface.co/datasets/gutoportelaa/segjusticidadania-experimentos
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
