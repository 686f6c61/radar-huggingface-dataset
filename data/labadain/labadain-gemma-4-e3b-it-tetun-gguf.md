# labadain/Labadain-Gemma-4-E3B-it-Tetun-GGUF

## Resumen

Labadain-Gemma-4-E3B-it-Tetun-GGUF es la versión cuantizada en formato GGUF (Q4_K_M) del modelo Labadain-Gemma-4-E3B-it-Tetun, un ajuste fino de la familia Gemma 4 orientado a conversación en tetun (tetun-dili), la lengua nacional de Timor-Leste. Lo desarrolla Labadain, una iniciativa de investigación centrada en recuperación de información, PLN e IA para lenguas de bajos recursos, con el objetivo de impulsar la inclusión digital y el acceso a IA en Timor-Leste.

El modelo parte de `unsloth/gemma-4-E2B-it` como base y se ha ajustado mediante QLoRA sobre un corpus compilado de 32.197 conversaciones multi-turno en tetun, procedentes de noticias, salud, educación y conversación general. El resultado es un modelo merged de 4.647.450.147 parámetros (aproximadamente 4,6 mil millones) que se distribuye aquí en una única cuantización Q4_K_M para inferencia local eficiente en CPU y GPU de consumo.

Su relevancia radica en cubrir un hueco real: la práctica ausencia de modelos conversacionales abiertos para tetun con despliegue práctico. Al ofrecerse en GGUF y en Ollama, reduce la barrera de entrada para investigadores y desarrolladores que quieran construir aplicaciones en esta lengua sin infraestructura dedicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; detalles internos no disponibles) |
| Parámetros totales | 4.647.450.147 (~4,6 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (única incluida en este repositorio) |
| Idiomas soportados | tet (tetun), tdt (tetun-dili) |
| Licencia | Gemma (Gemma 4 License) |
| Formato de pesos | GGUF |
| Modelo base | unsloth/gemma-4-E2B-it |
| Modelo merged | labadain/Labadain-Gemma-4-E3B-it-Tetun |
| Método de ajuste | QLoRA |
| Dataset de entrenamiento | 32.197 conversaciones multi-turno |
| Tamaño del repositorio | 3,4 GB |
| Descargas | 185 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por QLoRA sobre `unsloth/gemma-4-E2B-it`, de la familia Gemma 4. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa), por lo que esos datos deben considerarse no disponibles. El peso final merged alcanza los 4.647.450.147 parámetros, ligeramente por encima de la base E2B de la que parte, lo que sugiere una expansión o fusión durante el proceso de ajuste.

El entrenamiento se realizó sobre un corpus compilado de 32.197 conversaciones multi-turno en tetun, con la siguiente composición: 20.132 conversaciones de carácter general, 9.649 de salud (QA y multi-turno), 1.951 de noticias y 465 de educación y lengua. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset más allá de estas cifras, ni si se aplicaron etapas de RLHF o DPO. El modelo soporta un modo de razonamiento (thinking mode) heredado de Gemma 4, que puede desactivarse en Ollama con `--think=false`.

## Capacidades

- Generación de texto conversacional en tetun, con respuestas contextualmente relevantes en dominios de conocimiento general, noticias, conversación cotidiana, salud y educación.
- Conversación multi-turno: el ajuste se realizó específicamente sobre diálogos multi-turno, por lo que mantiene coherencia a lo largo de la interacción.
- Modo de razonamiento (thinking mode) heredado de Gemma 4, desactivable mediante el flag `--think=false` en Ollama.
- Respuesta a preguntas (QA) en tetun, especialmente en el dominio sanitario, donde el corpus de entrenamiento es más denso.
- Generación de texto general en tetun para aplicaciones de PLN de bajos recursos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: limitadas a tet y tdt según los metadatos; no se documenta transferencia a otros idiomas.
- Visión y audio: no disponibles.

## Casos de uso

- Asistente conversacional en tetun para atención ciudadana: el modelo puede gestionar diálogos multi-turno en tetun gracias a su ajuste específico sobre 32.197 conversaciones, adecuado para portales de servicios públicos en Timor-Leste.
- Consultas de salud en lengua local: con 9.649 ejemplos de QA y multi-turno del dominio sanitario, es apropiado para orientación básica y triaje informativo en tetun, siempre con supervisión humana.
- Investigación en PLN de bajos recursos: sirve como línea base reproducible para experimentos de generación y evaluación en tetun, al estar disponible en GGUF y con pesos merged en safetensors.
- Despliegue en local sin GPU dedicada: la cuantización Q4_K_M y el formato GGUF permiten ejecutarlo en CPU mediante llama.cpp u Ollama, útil en entornos con hardware limitado como los habituales en Timor-Leste.
- Educación y divulgación: generación de material didáctico y respuestas explicativas en tetun, apoyándose en los 465 ejemplos de educación y lengua del corpus.
- Prototipado rápido de aplicaciones: la disponibilidad en Ollama (`ollama run labadainofficial/labadain-gemma4:e3b-q4km`) permite integrar el modelo en demos y pruebas de concepto con un solo comando.
- Procesamiento de noticias en tetun: resumen y reformulación de textos periodísticos, dado el subconjunto de 1.951 conversaciones basadas en noticias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que el modelo no ha sido evaluado todavía en aplicaciones downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M y ~4,6 B de parámetros, el archivo pesa aproximadamente 3,4 GB; se estima un consumo de VRAM en torno a 4-5 GB incluyendo overhead de contexto, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar funcionamiento en GPUs de consumo con 6-8 GB o más, pero no está verificado por el autor.
- ¿Cabe en GPU de consumo? Probablemente sí en modelos con 8 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`labadainofficial/labadain-gemma4:e3b-q4km`) y cualquier runtime compatible con GGUF. vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Labadain-Gemma-4-E3B-it-Tetun-GGUF | ~4,6 B | no disponible | tet, tdt | Gemma | GGUF |
| Labadain-Gemma-4-E3B-it-Tetun (merged) | ~4,6 B | no disponible | tet, tdt | Gemma | safetensors |
| unsloth/gemma-4-E2B-it (base) | no disponible | no disponible | multilingüe (Gemma 4) | Gemma | safetensors |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no ha sido evaluado en aplicaciones downstream; no hay métricas de calidad, fidelidad ni seguridad.
- Riesgo de alucinación no cuantificado: al ser un ajuste fino sobre un corpus relativamente pequeño (32.197 conversaciones), la cobertura de dominios y la fiabilidad factual son inciertas.
- Sesgos conocidos: no documentados; el corpus procede de fuentes de noticias, salud, educación y conversación general, con posible sobrerrepresentación de ciertos registros.
- Limitaciones de idioma: soporte declarado únicamente para tet y tdt; no se garantiza un comportamiento correcto en otros idiomas.
- Licencia Gemma: el uso y la redistribución están sujetos a la Gemma 4 License (https://ai.google.dev/gemma/docs/gemma_4_license); es necesario revisar sus restricciones antes de un uso comercial.
- Al ser una cuantización Q4_K_M, puede haber una degradación de calidad respecto al modelo merged en safetensors, no medida por el autor.
- El modo de razonamiento (thinking) puede añadir contenido previo a la respuesta final; en producción conviene desactivarlo con `--think=false` si no se desea.
- Longitud de contexto no documentada: no es posible planificar aplicaciones con ventanas largas sin verificación empírica.

## Enlaces

- Hugging Face (este repositorio GGUF): https://huggingface.co/labadain/Labadain-Gemma-4-E3B-it-Tetun-GGUF
- Modelo merged en safetensors: https://huggingface.co/labadain/Labadain-Gemma-4-E3B-it-Tetun
- Ollama: https://ollama.com/labadainofficial/labadain-gemma4
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Labadain Chat: https://www.labadain.com
- Labadain Search: https://search.labadain.com
