# guiiwfz/logi-1.5b

## Resumen

LOGI-1.5B es un modelo de lenguaje en portugués desarrollado por guiiwfz como tutor educacional del juego Decifra.IA, un proyecto de investigación centrado en alfabetización digital y letramento en inteligencia artificial. El modelo responde preguntas sobre lógica proposicional, conceptos básicos de IA y escenarios de uso crítico, con un sistema de guardrails para rechazar educadamente preguntas fuera de su ámbito. Parte del modelo base Qwen2.5-1.5B-Instruct y ha sido ajustado mediante QLoRA 4-bit, con 36,9 millones de parámetros entrenables sobre un total de 1,54 mil millones. La longitud de contexto empleada en su ejemplo de uso es de 1024 tokens, aunque el modelo base admite más; la documentación no especifica el valor máximo oficial. Su relevancia radica en ofrecer un asistente especializado y en portugués para entornos educativos, con un enfoque explícito en la reflexión crítica sobre IA, algo poco común en modelos de este tamaño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.540 millones (1.54B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens (según ejemplo de uso; el modelo base admite más) |
| Tipos de cuantizacion | 4-bit (QLoRA para entrenamiento; pesos publicados en safetensors) |
| Idiomas soportados | Portugués (brasileño) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LOGI-1.5B es un ajuste fino supervisado del modelo Qwen2.5-1.5B-Instruct, realizado mediante QLoRA 4-bit en el framework Unsloth. Se emplearon adaptadores LoRA con rank r=32 y RSLoRA, targeting los módulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El número total de parámetros entrenables fue de 36,9 millones, lo que representa el 2,40% del modelo completo.

El dataset de entrenamiento es propio y consta de 1.183 ejemplos tras deduplicar 1.312 brutos. Su composición se divide en dos áreas principales: lógica proposicional (57,6%, 681 ejemplos), que cubre tablas de verdad, operadores, pruebas formales y ejercicios didácticos; y alfabetización en IA más guardrails (42,4%, 502 ejemplos), que abarca conceptos como alucinación, sesgo, RAG, fine-tuning, embeddings y privacidad, junto con recusas educadas. El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 2e-4 y decaimiento coseno, un lote efectivo de 16 (batch=2, grad_accum=8) y se ejecutó en una GPU T4 de 16 GB en Google Colab. El proceso no incluye etapas de RLHF ni DPO, aunque la documentación menciona que las inconsistencias con el operador IMPLICA están "en corrección vía DPO".

## Capacidades

- Generación de texto en portugués centrada en lógica proposicional: AND, OR, NOT, IMPLICA, BICONDICIONAL, tablas de verdad y pruebas formales.
- Explicación de conceptos fundamentales de inteligencia artificial: alucinación, sesgo, RAG, fine-tuning, embeddings, modelos de lenguaje y privacidad.
- Análisis de escenarios de uso crítico de IA (modo H-key): deepfakes, phishing, LGPD, vigilancia algorítmica y burbujas de filtro.
- Guardrails con recusa educada para preguntas fuera del ámbito, como instalación de software, código o consultas médicas.
- Presentación de respuestas en formato paso a paso, con estructura didáctica (por ejemplo, análisis de premissas, aplicación del operador y conclusión).
- No soporta tool calling ni function calling; tampoco está preparado para razonamiento multi-paso agéntico en entornos externos.

## Casos de uso

- Tutor dentro del juego Decifra.IA: al pulsar la tecla H, LOGI aparece como asistente contextual que proporciona pistas, explicaciones y preguntas de reflexión crítica sobre los contenidos de cada nivel.
- Apoyo en ejercicios de lógica proposicional: estudiantes pueden preguntar por tablas de verdad, operadores lógicos o demostraciones y obtener respuestas estructuradas paso a paso, útil para autoevaluación.
- Material docente para alfabetización en IA: el modelo explica conceptos como sesgo, alucinación o RAG con lenguaje adaptado a principiantes, lo que permite usarlo como complemento en clases introductorias.
- Formación en ciudadanía digital: puede abordar casos prácticos de deepfakes, phishing o vigilancia algorítmica, ayudando a desarrollar pensamiento crítico sobre el impacto social de la IA.
- Generación de ejercicios y corrección básica: un profesor puede solicitar ejemplos de proposiciones lógicas y sus valores de verdad, o pedir que se resuelva una operación compuesta, integrando el modelo en un flujo de preparación de clases.
- Prototipo de asistente educativo con restricciones de dominio: el sistema de guardrails lo hace adecuado para demostrar cómo un modelo pequeño puede mantenerse dentro de un ámbito temático sin desviarse hacia temas no deseados.
- Demo de fine-tuning con QLoRA en portugués: sirve como referencia práctica para investigadoras e investigadores que deseen replicar un ajuste eficiente con Unsloth en un modelo de 1.5B.

## Benchmarks y rendimiento

La model card publica una suite de evaluación propia, compuesta por 25 pruebas automatizadas en 6 categorías. No se han encontrado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La información disponible es la siguiente:

| Categoria | Acierto |
|---|---|
| H-Key | 100% |
| Alfabetización en IA | 100% |
| Lógica compuesta | 100% |
| Guardrails | 75% |
| IMPLICA | 75% |
| Identidad | 67% |
| **Puntuación general** | **~88% (22/25)** |

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada oficialmente; el entrenamiento se realizó en una GPU T4 de 16 GB. Al cargar en 4-bit, es razonable esperar que quepa en GPUs de 8 GB o menos, aunque no hay datos confirmados.
- GPU recomendadas: para reproducir el entrenamiento, una T4 de 16 GB (como la utilizada). Para inferencia en 4-bit, cualquier GPU compatible con CUDA y al menos 8 GB de VRAM.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño del modelo y la cuantización 4-bit.
- Opciones de despliegue: todos los pesos están en formato safetensors; se puede usar con Unsloth y Transformers. No se mencionan integraciones con vLLM, TGI o llama.cpp, aunque la conversión a GGUF podría ser factible para ejecución en CPU.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Se comparan tres modelos de tamaño similar. No se dispone de datos de benchmarks comunes para ninguno de ellos, por lo que la comparación se basa en características técnicas y de licencia.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| LOGI-1.5B | 1.54B | 1024 (según uso) | Tutor de lógica e IA en portugués | Apache 2.0 |
| Qwen2.5-1.5B-Instruct | 1.54B | 32768 | Instrucciones multilingüe | Apache 2.0 |
| VibeThinker-1.5B | 1.5B | no disponible | Razonamiento lógico (paper arXiv:2511.06221) | no disponible |

LOGI-1.5B se diferencia del modelo base por su dominio específico y sus guardrails, pero queda por detrás en versatilidad lingüística y en longitud de contexto. VibeThinker-1.5B es un modelo enfocado en razonamiento lógico, pero no se dispone de su licencia ni de datos comparativos de rendimiento. La comparativa con benchmarks no es posible por falta de datos públicos.

## Limitaciones y advertencias

- Entrenado exclusivamente en portugués brasileño; no soporta otros idiomas.
- Ámbito restringido: solo cubre lógica proposicional y conceptos introductorios de IA, con respuestas útiles únicamente dentro de ese dominio.
- El operador IMPLICA presenta inconsistencias ocasionales cuando P es verdadero y Q falso; la documentación indica que está pendiente de corrección mediante DPO.
- No recomendado para uso comercial o producción fuera del contexto educativo del juego Decifra.IA sin ajustes adicionales.
- No dispone de acceso a internet ni a bases de datos externas, por lo que su conocimiento factual es limitado y desactualizado.
- Los guardrails logran un 75% de acierto en la suite de pruebas, lo que implica que en un 25% de los casos puede aceptar preguntas fuera del alcance.
- Riesgo de alucinación en temas que se desvían del dominio entrenado, especialmente en conceptos avanzados de IA.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido diseñado ni validado para ese propósito.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/guiiwfz/logi-1.5b
- Paper de VibeThinker-1.5B (mencionado en la comparativa): https://arxiv.org/abs/2511.06221
