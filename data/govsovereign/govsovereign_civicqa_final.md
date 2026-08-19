# Govsovereign/govsovereign_civicqa_final

## Resumen

El modelo `Govsovereign/govsovereign_civicqa_final` es un ajuste fino (fine-tune) del modelo base `himalaya-ai/himalaya-gemma-4-e2b-it`, desarrollado por el usuario Govsovereign. Está especializado en responder preguntas sobre civismo estadounidense, basándose en el conjunto de 128 preguntas oficiales del examen de ciudadanía de USCIS (versión 2025). El modelo combina capacidades de procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque el fine-tune se centra en la generación de respuestas conversacionales en inglés.

Con aproximadamente 5.123 millones de parámetros (5,1 B), se trata de un modelo de tamaño medio que puede ejecutarse en hardware de consumo si se cuantiza adecuadamente. La licencia Apache 2.0 permite uso comercial sin restricciones. El entrenamiento se realizó con la librería Unsloth (que acelera el proceso) y probablemente con técnicas de QLoRA, dado que el repositorio incluye referencias a cuantización de 4 bits con bitsandbytes. Aunque el modelo base es multimodal, el fine-tune parece orientado exclusivamente a texto para tareas de QA sobre civismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Gemma 4 (variante `himalaya-gemma-4-e2b-it`), detalles completos no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (bitsandbytes), posiblemente otros (no especificados) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye a partir de `himalaya-ai/himalaya-gemma-4-e2b-it`, un modelo de la familia Gemma 4. No se dispone de detalles técnicos sobre la arquitectura interna (número de capas, atención, etc.) en la información proporcionada. El fine-tune se realizó con la librería Unsloth, que optimiza el entrenamiento (según el README, "trained 2x faster with Unsloth"), y se utilizó TRL (Transformer Reinforcement Learning) para el proceso de ajuste. Aunque no se especifica explícitamente el método, la presencia de tags como `qlora` en modelos hermanos del mismo autor sugiere que se empleó QLoRA (Low-Rank Adaptation cuantizada) para eficiencia de memoria. No hay información sobre el dataset de entrenamiento, número de tokens ni composición de los datos, más allá de que el contenido se relaciona con las 128 preguntas de civismo de USCIS.

## Capacidades

- Generacion de texto conversacional en ingles, especializado en preguntas y respuestas sobre civismo estadounidense (gobierno, historia, derechos y deberes).
- Procesamiento de imagenes y texto (pipeline `image-text-to-text`), aunque el fine-tune no evidencia un uso especifico de la modalidad visual.
- Capacidad de mantener dialogos multi-turno gracias a su naturaleza conversacional.
- No se ha confirmado soporte para tool calling, function calling ni razonamiento multi-paso agente.
- No se ha confirmado soporte para otros idiomas distintos del ingles.

## Casos de uso

- Preparacion para el examen de ciudadania de EE.UU.: el modelo puede responder a las 128 preguntas oficiales del test de civismo, ayudando a los candidatos a practicar y memorizar las respuestas correctas.
- Asistente educativo en aulas: profesores de historia o educacion civica pueden usarlo como herramienta de repaso interactivo para estudiantes de secundaria o adultos.
- Chatbot de informacion gubernamental: integrable en sitios web o aplicaciones de organizaciones que asesoran a inmigrantes, proporcionando respuestas precisas sobre el proceso de naturalizacion.
- Generacion de material de estudio: puede crear cuestionarios, tarjetas de memoria o explicaciones ampliadas a partir de las preguntas base.
- Soporte en centros comunitarios: como asistente conversacional en kioscos o aplicaciones moviles para personas que se preparan para la entrevista de ciudadania.
- Evaluacion de conocimientos: en entornos de testing, puede generar preguntas variadas y evaluar respuestas de forma automatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de evaluacion en tareas estandar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion de 4 bits, los pesos ocupan aproximadamente 2,6 GB (5,1 B parametros × 0,5 bytes por parametro). Con overhead de activaciones y memoria adicional, se recomienda al menos 6-8 GB de VRAM para una ejecucion comoda.
- GPU recomendadas: tarjetas con 8 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 3080, o GPUs de datacenter como A10, A100 (para mayor velocidad).
- Si cabe en GPU de consumo: si, en cuantizacion de 4 bits cabe en GPUs de gama media con 8 GB de VRAM.
- Opciones de despliegue: compatible con `transformers` (libreria principal), `text-generation-inference` (TGI) y `vLLM` (por las etiquetas). Tambien puede convertirse a GGUF para usarse con `llama.cpp` u `Ollama`.
- Latencia y throughput: no se dispone de mediciones concretas. Para un modelo de 5 B en 4 bits, se espera una latencia de decodificacion de unos 20-50 ms por token en una RTX 4090, y un throughput de 50-100 tokens/s, dependiendo de la implementacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. Existe un modelo hermano del mismo autor, `Govsovereign/govsovereign_civicqa_2026_08_r1_pratik_s0_qlora`, que parece seguir la misma linea (fine-tune de Gemma 4 para QA de civismo), pero no se han publicado datos de rendimiento ni especificaciones detalladas. Tampoco se conocen otros modelos publicos especializados en civismo estadounidense con los que comparar. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Especializacion estrecha: el fine-tune se centra exclusivamente en preguntas de civismo de EE.UU.; fuera de ese dominio, el modelo puede producir respuestas incorrectas o irrelevantes.
- Riesgo de alucinacion: como cualquier modelo generativo, puede inventar respuestas plausibles pero falsas, especialmente si se le pregunta fuera de su area de entrenamiento.
- Sesgos potenciales: los datos de entrenamiento provienen de un conjunto oficial de preguntas y respuestas, pero el modelo base puede arrastrar sesgos de su entrenamiento original (no documentado).
- Idioma limitado: solo se garantiza el ingles; no se ha evaluado su rendimiento en otros idiomas.
- Sin garantia de actualizacion: las preguntas de civismo pueden cambiar con el tiempo; el modelo se basa en la version 2025 de USCIS, por lo que podria quedar desactualizado.
- Para uso en produccion, se recomienda validar las respuestas con una fuente oficial antes de desplegarlo en entornos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Govsovereign/govsovereign_civicqa_final
- Modelo base: https://huggingface.co/himalaya-ai/himalaya-gemma-4-e2b-it
- Modelo hermano (similar): https://huggingface.co/Govsovereign/govsovereign_civicqa_2026_08_r1_pratik_s0_qlora
- PDF de las 128 preguntas de civismo (USCIS, version 2025): https://www.uscis.gov/sites/default/files/document/questions-and-answers/2025-Civics-Test-128-Questions-and-Answers.pdf
- Repositorio de Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
