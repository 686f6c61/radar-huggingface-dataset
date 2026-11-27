# farruko07/empathetic-support-GGUF

## Resumen

empathetic-support-GGUF es una versión editada de Qwen2.5-3B-Instruct orientada a atención al cliente, publicada por el usuario farruko07 en Hugging Face. El modelo parte de los pesos originales de Alibaba Cloud (3.086.878.720 parámetros) y les aplica vectores de direccionamiento (steering vectors) calculados como diferencia de activaciones medias, siguiendo técnicas de Representation Engineering y Contrastive Activation Addition. Las modificaciones se han horneado directamente en los pesos, de modo que no requieren hooks en tiempo de ejecución.

El objetivo declarado es incrementar la empatía de las respuestas (+0.75 de intensidad en la capa 21) y reducir las disculpas que admiten culpa (-0.50 en la capa 16), un ajuste pensado para entornos de soporte donde admitir fallos tiene consecuencias legales o de responsabilidad. Se distribuye únicamente en formato GGUF, con un repositorio de 1,9 GB, y está pensado para ejecutarse con Ollama o llama.cpp en hardware de consumo.

Su relevancia radica en que demuestra un flujo de personalización de comportamiento sin reentrenamiento ni RLHF: edición de pesos vía Concept Surgeon sobre un modelo pequeño (3B) que cabe en GPUs de gama media. La contrapartida, documentada por el propio autor, es que el direccionamiento afecta a todos los tokens, incluida la pregunta del usuario, lo que degrada la comprensión del concepto suprimido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.086.878.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF; se menciona Q4_K_M como ejemplo de ejecucion |
| Idiomas soportados | no disponibles |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-3B-Instruct, un transformer decoder-only de 3.086 millones de parámetros. Sobre ese modelo base no se ha realizado un reentrenamiento adicional: la modificación consiste en la edición de pesos mediante vectores de direccionamiento calculados como diferencia de activaciones medias (diference of mean activations) con la herramienta Concept Surgeon. Se aplican dos conceptos: Empatía con intensidad +0.75 en la capa 21 y Disculpa con intensidad -0.50 en la capa 16. Las ediciones se integran en los pesos finales, por lo que la inferencia no necesita hooks ni servidores auxiliares.

El enfoque bebe de Representation Engineering (Zou et al., 2023), Activation Addition (Turner et al., 2023), Contrastive Activation Addition (Rimsky et al., 2024), Persona Vectors (Chen et al., Anthropic, 2025) y la ortogonalización de pesos para direcciones de rechazo (Arditi et al., 2024). No se especifican en la información disponible los datos de entrenamiento originales de Qwen2.5-3B-Instruct, el número de tokens, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional orientada a soporte al cliente, con respuestas más empáticas y menor tendencia a admitir culpa.
- Razonamiento y respuesta a preguntas cotidianas de negocio (correos, resúmenes ejecutivos, respuestas a clientes, opiniones sobre planes), con coherencia 87.0 y precisión 83.5 según el juez del autor.
- Capacidad de reconocimiento de empatía en el texto de entrada: detección del 92-100% en todas las intensidades probadas.
- Comprensión del concepto de disculpa fuertemente degradada: la identificación correcta de un concepto suprimido cae del 90-100% al 20-50% en el experimento del autor.
- Soporte de ejecución vía Ollama con el comando `ollama run hf.co/farruko07/empathetic-support-GGUF:Q4_K_M`.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Tool calling, function calling, agentes, capacidades multilingües, visión o audio: no disponibles en la información proporcionada para esta variante.

## Casos de uso

- Atención al cliente automatizada en primera línea: el modelo gestiona conversaciones de soporte con un tono más empático que el base, adecuado para respuestas de disculpa sin admisión de responsabilidad en sectores regulados.
- Redacción de respuestas a reclamaciones: la supresión del concepto de disculpa reduce la probabilidad de que el modelo genere texto que reconozca culpa, útil en flujos donde la empresa no debe aceptar responsabilidad por escrito.
- Generación de correos de seguimiento y resúmenes de casos: el modelo mantiene coherencia (87.0) y precisión (83.5) en tareas cotidianas no relacionadas con el concepto, por lo que puede usarse como redactor de soporte en segundo plano.
- Clasificación y triaje de tickets con tono empático: gracias a su capacidad de detección de empatía (92-100%), puede etiquetar la temperatura emocional de un mensaje antes de derivarlo a un humano.
- Despliegue en local para equipos de soporte con requisitos de privacidad: al ser un GGUF de 3B, se ejecuta en CPUs y GPUs de consumo sin enviar datos a la nube.
- Prototipado rápido de asistentes conversacionales personalizados: sirve como plantilla para experimentar con Concept Surgeon y vectores de direccionamiento sobre modelos pequeños antes de escalar a modelos mayores.
- Evaluación de técnicas de edición de pesos en investigación: el modelo documenta el trade-off entre modificar un rasgo y degradar la comprensión de ese mismo rasgo, útil como caso de estudio reproducible.

## Benchmarks y rendimiento

Datos de verificación publicados por el autor en la model card (juez automático, no benchmarks estándar como MMLU o HumanEval):

| Métrica | Ollama (pesos editados) | Servidor con hooks | Observaciones |
|---|---|---|---|
| Empatía: rasgo | 85.6 | 83.1 | Coherencia 83.8, precisión 84.4 (aprobado) |
| Disculpa: rasgo | 3.8 | 0.0 | Coherencia 81.9, precisión 80.6 (aprobado) |
| Preguntas cotidianas: coherencia | 87.0 | 88.0 | 10 preguntas de negocio ajenas al concepto |
| Preguntas cotidianas: precisión | 83.5 | 87.0 | 10 preguntas de negocio ajenas al concepto |
| Preguntas cotidianas: rasgo | 81.5 | 57.0 | Diferencia pequeña en trabajo diario |
| Detección de empatía | 92-100% | no disponible | En todas las intensidades probadas |
| Identificación de disculpa suprimida | 20-50% | 90-100% | Degradación por supresión horneada |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 3B en Q4_K_M se sitúa típicamente en el rango de 2-3 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: el tamaño del repositorio (1,9 GB) y la cuantización Q4_K_M sugieren que cabe en GPUs de consumo, pero no se confirma en la documentación.
- Opciones de despliegue: Ollama (comando documentado) y llama.cpp (mencionado en el trabajo futuro del autor). vLLM o TGI no se mencionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| empathetic-support-GGUF | 3,09B | no disponible | qwen-research | GGUF | Edición de pesos vía steering vectors; enfoque en empatía y supresión de disculpas |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | no disponible | qwen-research | safetensors, GGUF | Modelo base sin editar; comportamiento conversacional estándar |
| Qwen2.5-1.5B-Instruct | no disponible | no disponible | qwen-research | safetensors, GGUF | Alternativa más pequeña de la misma familia; no editada |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El direccionamiento está horneado en los pesos y se aplica a todos los tokens, incluida la pregunta del usuario, no solo a la respuesta generada.
- La supresión del concepto de disculpa degrada la comprensión del modelo sobre ese concepto: la identificación correcta cae del 90-100% al 20-50%. No es adecuado para tareas que requieran razonar sobre disculpas o culpa.
- Riesgo de alucinación: no cuantificado en la información disponible; se hereda el comportamiento del modelo base Qwen2.5-3B-Instruct.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no especificados; se desconoce si las ediciones de pesos afectan de forma distinta a idiomas distintos del inglés.
- Licencia qwen-research: es necesario revisar los términos antes de un uso comercial; el autor advierte explícitamente de ello.
- El modelo está pensado para soporte al cliente; usarlo en otros dominios puede producir respuestas con un tono empático fuera de lugar o con ausencia de disculpas donde sería esperable.
- No hay información sobre longitud de contexto efectiva tras la edición de pesos.
- El autor reconoce que el trabajo futuro incluye un runner local que aplique el direccionamiento solo durante la generación, lo que indica que la versión actual tiene esta limitación conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/farruko07/empathetic-support-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Persona Vectors (Chen et al., Anthropic, 2025): https://arxiv.org/abs/2507.21509
- Contrastive Activation Addition (Rimsky et al., 2024): https://arxiv.org/abs/2312.06681
- Activation Addition (Turner et al., 2023): https://arxiv.org/abs/2308.10248
- Representation Engineering (Zou et al., 2023): https://arxiv.org/abs/2310.01405
- Refusal is mediated by a single direction (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
