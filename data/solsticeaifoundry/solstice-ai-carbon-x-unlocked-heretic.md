# SolsticeAIFoundry/Solstice-AI-Carbon-X-Unlocked-Heretic

## Resumen

Solstice-AI-Carbon-X-Unlocked-Heretic es una variante "decensored" del modelo HuggingFaceBio/Carbon-X, un modelo de lenguaje de 14.822.046.720 parámetros (aproximadamente 14,8B) especializado en comprensión y generación de ADN, desarrollado por SolsticeAIFoundry sobre el modelo base de HuggingFaceBio. El modelo parte de una arquitectura Qwen3 (decoder-only transformer) y ha sido modificado mediante la herramienta Heretic v2.0.0, que aplica técnicas de ablación de activaciones y representaciones para reducir drásticamente los rechazos del modelo (de 96/100 en el modelo base a 11/100 en esta variante).

El modelo base Carbon-X está entrenado conjuntamente sobre secuencias de ADN y texto en lenguaje natural, empleando un tokenizador híbrido que mantiene un vocabulario BPE para texto y codifica el ADN como k-mers no solapados de 6 bases, de modo que un token de ADN cubre 6 pares de bases. Esto permite introducir ADN crudo dentro de una conversación tipo chat y obtener respuestas en inglés que combinan razonamiento en lenguaje natural y secuencias de ADN. Según la model card, Carbon-X alcanza un 66,7% de media en cinco benchmarks de ADN con el modo "thinking" desactivado, 27 puntos por encima de Qwen3-14B y cerca de GPT-6.1 Sol (67,5%) a un coste de inferencia mucho menor.

La relevancia de esta ficha radica en que combina dos dimensiones poco habituales: por un lado, un dominio científico especializado (genómica computacional, predicción de efecto de variantes, clasificación de secuencias) y, por otro, una modificación deliberada de las barreras de seguridad del modelo base. La model card incluye advertencias explícitas de biorriesgo y una política de uso aceptable que prohíbe aplicaciones ofensivas, lo que convierte a este modelo en un artefacto de investigación experimental más que en un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), tokenizador híbrido BPE + k-mers de ADN de 6 pb |
| Parametros totales | 14.822.046.720 (aproximadamente 14,8B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (la model card indica respuestas en inglés; no se especifica lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, con 14,8B parámetros, entrenado conjuntamente sobre ADN y texto en lenguaje natural. La innovación arquitectónica clave es el tokenizador híbrido: mantiene un vocabulario BPE para el texto y codifica el ADN como k-mers no solapados de 6 bases, de manera que un único token de ADN representa 6 pares de bases. No existe un codificador de ADN separado: ADN y texto comparten un único flujo de tokens en un único decoder, lo que permite conversaciones mixtas en las que el usuario introduce secuencias crudas y el modelo responde con razonamiento en inglés y, cuando procede, con secuencias de ADN generadas.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Sí se documenta el proceso de modificación de esta variante: se aplicó Heretic v2.0.0 sobre el modelo base Carbon-X mediante ablación de activaciones y representaciones (técnicas descritas en los tags como "abliterated", "orthogonalized" y "ablation"), lo que redujo los rechazos de 96/100 a 11/100 según el clasificador empleado, con una divergencia KL de 0,06270 respecto al modelo original. La model card menciona además soporte de vLLM y compatibilidad con text-generation-inference y endpoints.

## Capacidades

- Predicción de efecto de variantes: clasifica mutaciones como benignas o patogénicas, con aplicaciones en análisis de variantes tipo ClinVar.
- Comprensión de secuencias de ADN: identifica regiones que controlan la actividad génica y clasifica secuencias por grupo de organismo.
- Predicción de siguientes bases: genera la continuación de una secuencia de ADN.
- Razonamiento explicativo: acompaña las predicciones con razonamiento en lenguaje natural en inglés.
- Generación mixta: las respuestas pueden contener simultáneamente ADN y lenguaje natural.
- Conversación multi-turno: el modelo se presenta como "conversational" y acepta ADN crudo dentro de un chat ordinario.
- Uso como herramienta de agente: la model card incluye una sección específica sobre el uso de Carbon-X como herramienta para un agente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo "thinking": la model card menciona evaluación con thinking desactivado, lo que sugiere la existencia de un modo de razonamiento, aunque no se detalla su funcionamiento.

## Casos de uso

- Análisis de variantes en investigación oncológica: introducir una variante genómica en una conversación y obtener una clasificación benigna/patogénica junto con el razonamiento asociado, útil como apoyo exploratorio en estudios de variantes tumorales.
- Anotación de secuencias en pipelines de bioinformática: clasificar secuencias por grupo de organismo o identificar regiones reguladoras dentro de un flujo de anotación automatizado, aprovechando que el modelo acepta ADN crudo en el prompt.
- Predicción de continuación de secuencias: generar las siguientes bases de un fragmento de ADN para tareas de modelado de secuencia y exploración de patrones, con la salvedad de que los resultados requieren validación experimental.
- Asistente conversacional para investigadores: responder preguntas en inglés sobre secuencias introducidas en el chat, combinando explicación en lenguaje natural con salida de ADN, lo que reduce la fricción entre herramientas de bioinformática y razonamiento textual.
- Integración como herramienta de agente: la model card documenta el uso de Carbon-X como tool dentro de un agente, de modo que un orquestador pueda delegar en él tareas de análisis de secuencias y recibir respuestas estructuradas.
- Investigación sobre seguridad y alineación: esta variante "Heretic" sirve como artefacto de estudio para medir el efecto de la ablación de rechazos sobre un modelo científico, comparando el comportamiento con el modelo base (11/100 frente a 96/100 rechazos).
- Prototipado de aplicaciones de genómica educativa: construir demos interactivas que expliquen conceptos de variantes y secuencias, siempre con las advertencias de no uso clínico.

## Benchmarks y rendimiento

La model card proporciona datos del modelo base Carbon-X en cinco benchmarks de ADN (efecto de variantes, comprensión de secuencias y predicción de siguiente base), con el modo thinking desactivado. No se publican resultados específicos de esta variante "Heretic" más allá de la métrica de rechazos.

| Metrica | Este modelo | Carbon-X (base) | Referencia |
|---|---|---|---|
| Rechazos (clasificador) | 11/100 | 96/100 | no aplica |
| Divergencia KL | 0,06270 | 0 (por definición) | no aplica |
| Media en 5 benchmarks de ADN (thinking desactivado) | no disponible para esta variante | 66,7% | Qwen3-14B: aproximadamente 39,7% (27 puntos menos); GPT-6.1 Sol: 67,5% |

No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (14,8B parámetros), en fp16 se requieren aproximadamente 30 GB de pesos, y en cuantizaciones de 8 bits o 4 bits el requisito baja sustancialmente, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo encaja en GPUs de centro de datos tipo A100 (40/80 GB) y H100; la model card menciona mediciones de throughput por hora de H200 para el modelo base.
- GPU de consumo: no confirmado oficialmente; un modelo de 14,8B en cuantización de 4 bits podría caber en GPUs de consumo de gama alta con suficiente VRAM, pero no hay datos publicados para esta variante.
- Opciones de despliegue: la model card y los tags mencionan vLLM, text-generation-inference y endpoints compatibles; también es compatible con transformers.
- Latencia y throughput: no disponibles para esta variante; la model card del modelo base cita mediciones de throughput por hora de H200 a 5 USD/hora, sin cifras concretas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en benchmarks de ADN | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Solstice-AI-Carbon-X-Unlocked-Heretic | 14,8B | no disponible | no disponible para esta variante (base: 66,7% de media) | apache-2.0 | Hugging Face |
| HuggingFaceBio/Carbon-X | 14,8B (según modelo base) | no disponible | 66,7% de media en 5 benchmarks de ADN | apache-2.0 | Hugging Face |
| Qwen3-14B | 14B (aproximado) | no disponible | aproximadamente 39,7% (27 puntos por debajo de Carbon-X) | no disponible en la información | Hugging Face |
| GPT-6.1 Sol | no disponible | no disponible | 67,5% de media | propietaria | API |

La comparativa se limita a los datos citados en la model card; no se dispone de información sobre otros modelos especializados en ADN para ampliar la tabla.

## Limitaciones y advertencias

- Reducción deliberada de rechazos: la variante "Heretic" baja de 96/100 a 11/100 rechazos, lo que implica que puede generar contenido que el modelo base rechazaría; la model card exige uso legal y ético exclusivamente.
- Riesgo de biorriesgo: la política de uso aceptable prohíbe explícitamente aplicaciones con agentes selectos, toxinas, ganancia de función, evasión de cribado de síntesis y usos militares; el incumplimiento queda bajo responsabilidad del usuario.
- No es un dispositivo médico: el modelo no está validado clínicamente y sus salidas no constituyen consejo médico, diagnóstico ni base para decisiones terapéuticas o consejo genético.
- Riesgo de alucinación: no se documentan tasas de alucinación; como modelo generativo aplicado a genómica, las predicciones deben validarse experimentalmente.
- Idiomas: la model card indica respuestas en inglés; no se especifica soporte multilingüe.
- Contexto: la longitud de contexto no está documentada, lo que limita la planificación de despliegues con secuencias largas.
- Licencia: apache-2.0 permite uso comercial según la licencia, pero la política de uso aceptable del autor impone restricciones adicionales de bioseguridad que el usuario debe respetar.
- Divergencia respecto al base: la divergencia KL de 0,06270 indica que la ablación altera el comportamiento del modelo, con posibles efectos no medidos en tareas científicas específicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SolsticeAIFoundry/Solstice-AI-Carbon-X-Unlocked-Heretic
- Modelo base Carbon-X: https://huggingface.co/HuggingFaceBio/Carbon-X
- Heretic (herramienta de ablación): no disponible en la información proporcionada
- Paper de Carbon-X: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
