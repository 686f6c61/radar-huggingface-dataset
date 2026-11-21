# bharatgenai/Param2-17B-A2.4B-Thinking

## Resumen
Param2-17B-A2.4B-Thinking es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) híbrido desarrollado por BharatGen, una iniciativa centrada en modelos de IA para lenguas de la India. El modelo se ha preentrenado desde cero con un énfasis explícito en diversidad lingüística y cobertura de lenguas indias, y se publica como checkpoint post-entrenado con capacidades de razonamiento, tool calling, matemáticas y generación de código. Su relevancia inmediata radica en que ofrece una alternativa open source de alta capacidad (17 000 millones de parámetros totales) con un coste de inferencia comparable a un modelo denso de 2 400 millones de parámetros activos por token.

La arquitectura combina atención de tipo Grouped Query Attention con una pila de 21 capas ocultas, tamaño oculto de 2048, tamaño intermedio de 9216, activación SiLU y normalización RMSNorm. El vocabulario es de 128 000 tokens, lo que facilita la tokenización multilingüe. El contexto máximo es de 32 768 tokens, con una variante de contexto largo de hasta 128k anunciada para su publicación futura.

El modelo está pensado para aplicaciones multilingües, especialmente en inglés, hindi y 21 lenguas indias adicionales, y se distribuye en formato transformers/safetensors con código personalizado (`param2moe`). El repositorio ocupa 102,9 GB y acumula 4777 descargas y 86 me gusta en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid MoE (Mixture-of-Experts híbrido) |
| Parámetros totales | 17 151 125 376 (17B) |
| Parámetros activos | 2,4B por token |
| Longitud de contexto | 32 768 tokens (variante de 128k anunciada, no disponible aún) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés, hindi y 21 lenguas indias: asamés, bengalí, bodo, dogri, guyaratí, kannada, konkani, cachemirí, maithili, malabar, manipurí, maratí, nepalí, oriya, panyabí, sánscrito, santalí, sindhi, tamil, telugu, urdu |
| Licencia | BharatGen Non-Commercial (según badge de la model card; no disponible como dato estructurado en Hugging Face) |
| Formato de pesos | safetensors (transformers, código personalizado `param2moe`) |

## Arquitectura y entrenamiento
El modelo usa una arquitectura híbrida MoE con 64 expertos totales, top-K de 6 expertos enrutados y 2 expertos compartidos siempre activos. La innovación clave es la combinación de expertos compartidos y enrutados: los compartidos mantienen representaciones translingüísticas estables y facilitan el cambio de código entre lenguas, mientras que los enrutados se activan de forma selectiva para especialización por tarea o lengua. Además, se incluye una capa densa antes de las capas MoE dispersas para transformar las entradas en representaciones estructuradas y mejorar la estabilidad del entrenamiento.

El preentrenamiento se realizó en tres fases con un total combinado de aproximadamente 22,63 billones de tokens. La fase PT-1 (14,05T tokens) se centró en inglés (8,5T), hindi (998,6B), matemáticas (374,8B), código (1,83T), lenguas indias multilingües (1,5T), técnico (500B) e instrucciones (351B). La fase PT-2 (8,08T) reforzó inglés (2,5T), matemáticas (773B), código (2,46T), lenguas indias (62,5B), instrucciones (740B) y razonamiento (607B). La fase PT-3 (500B) se dedicó a contexto largo con inglés (150B), matemáticas (62,5B), código (100B), lenguas indias (62,5B), instrucciones (50B) y razonamiento (75B). La model card menciona curación de datos con control de calidad para 22 lenguas indias, aunque no se detallan los métodos de alineación (RLHF/DPO) en la información disponible.

## Capacidades
- Generación de texto multilingüe en inglés, hindi y 21 lenguas indias, con énfasis en representación de comunidades lingüísticas poco representadas.
- Razonamiento y modo "thinking" (el nombre del checkpoint incluye `Thinking`), orientado a tareas de razonamiento multi-paso.
- Tool calling / function calling, según la model card.
- Generación de código y resolución de problemas matemáticos.
- Comprensión de contexto largo de hasta 32 768 tokens para documentos extensos y conversaciones multi-turno.
- Capacidad de cambio de código (code-switching) entre lenguas indias e inglés, favorecida por los expertos compartidos.
- No se mencionan capacidades de visión, audio ni otras modalidades en la información disponible.

## Casos de uso
- Atención al cliente multilingüe en la India: el modelo puede gestionar conversaciones multi-turno en hindi, inglés y lenguas regionales gracias a su ventana de 32 768 tokens y a sus expertos compartidos, que estabilizan el cambio de código entre lenguas.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y la inclusión de 1,83T tokens de código en PT-1 y 2,46T en PT-2 permiten integrarlo en asistentes de revisión de código y automatización de tareas de desarrollo.
- Traducción y localización de contenido para lenguas indias de bajos recursos: la cobertura de 21 lenguas indias y el entrenamiento con 1,5T tokens multilingües en PT-1 lo hacen adecuado para traducción asistida y generación de contenido regional.
- Asistentes educativos en matemáticas: los 374,8B tokens de matemáticas en PT-1 y 773B en PT-2 respaldan la resolución paso a paso de problemas y la generación de explicaciones.
- Razonamiento documental de contexto largo: análisis de contratos, informes o expedientes de hasta 32 768 tokens, con la variante de 128k prevista para documentos más extensos.
- Chatbots de servicio público en lenguas regionales: el modelo puede desplegarse para interacciones en asamés, bengalí, tamil, telugu, urdu, entre otras, con un coste de inferencia de 2,4B parámetros activos por token.
- Fine-tuning para dominios especializados: el checkpoint post-entrenado está diseñado explícitamente para aplicaciones downstream y ajuste fino adicional.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 17B parámetros totales en bf16, el peso completo requiere aproximadamente 34 GB; en cuantizaciones de 8 bits bajaría a unos 17 GB y en 4 bits a unos 8,5 GB, aunque no se confirman formatos de cuantización publicados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs de 40-80 GB (A100, H100) en bf16, y en GPUs consumer de 24 GB (RTX 4090) solo con cuantización.
- Despliegue: la librería indicada es transformers con código personalizado `param2moe`; el tag `deploy:sagemaker` sugiere compatibilidad con Amazon SageMaker. No se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Param2-17B-A2.4B-Thinking | 17B / 2,4B | 32 768 | BharatGen Non-Commercial | Hugging Face, transformers |
| Alternativas de la misma categoría MoE multilingüe | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias
- La licencia es BharatGen Non-Commercial según la model card, lo que restringe el uso comercial; conviene verificar los términos exactos antes de desplegar en producción.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas concretas no está validado de forma independiente.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación en la información disponible.
- La cobertura lingüística se centra en inglés, hindi y lenguas indias; el rendimiento en otras lenguas no está documentado.
- El contexto máximo es de 32 768 tokens; la variante de 128k aún no está publicada.
- No se detallan sesgos conocidos ni la composición exacta del dataset de alineación (RLHF/DPO), lo que limita la evaluación de riesgos.
- El uso requiere código personalizado (`param2moe`) y la librería transformers; la compatibilidad con otros runners no está confirmada.
- El repositorio ocupa 102,9 GB, lo que exige planificación de almacenamiento y ancho de banda para su descarga.

## Enlaces
- Hugging Face: https://huggingface.co/bharatgenai/Param2-17B-A2.4B-Thinking
- Licencia (referenciada en la model card): https://huggingface.co/bharatgenai/Param-2-17B-MoE-A2.4B/blob/main/LICENSE
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
