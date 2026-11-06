# mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16

## Resumen

Sage-A1.5-Ablitrex-abliterated-BF16 es una versión "abliterated" (con los mecanismos de rechazo neutralizados mediante ablación direccional) del modelo Sage-A1.5 de InternScience, publicada por el usuario mostwanted002 en Hugging Face. El modelo base es una arquitectura MoE de la familia qwen3_5_moe, con 35.107.181.936 parámetros totales almacenados en safetensors en formato BF16 (el repositorio ocupa 70,2 GB). La abliteración se ha realizado con la herramienta Abliterix, combinando ablación direccional con LoRA-Δ y proyección directa, con el objetivo de eliminar los comportamientos de negativa del modelo sin reentrenarlo por completo.

Este tipo de variantes resulta relevante para desarrolladores que necesitan modelos sin filtros de rechazo para investigación en alineamiento, red teaming o casos de uso donde los rechazos del modelo son un obstáculo. La ficha del modelo incluye una evaluación comparativa exhaustiva (62 tareas con lm-evaluation-harness, backend vLLM, bf16, 0-shot, seed=0) que cuantifica con precisión el coste de la abliteración: una caída media de 3,63 puntos en las capacidades del modelo, con peores retrocesos en tareas de razonamiento matemático y aprendizaje automático. La licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, familia Qwen 3.5) |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo deriva de InternScience/Sage-A1.5, que utiliza la arquitectura qwen3_5_moe, es decir, un transformer de mezcla de expertos (MoE) basado en la familia Qwen 3.5. El repositorio pesa 70,2 GB en BF16, coherente con unos 35,1 B de parámetros totales. No se ha publicado información sobre el número de parámetros activos por token, los datos de entrenamiento, el número de tokens ni el proceso de post-entrenamiento (RLHF/DPO) del modelo base.

La innovación principal de esta variante no está en la arquitectura sino en el post-procesado: la abliteración con Abliterix. Esta técnica identifica la "dirección de rechazo" en el espacio de activaciones del modelo y la elimina mediante ablación direccional, complementada con un ajuste LoRA-Δ y proyección directa. El resultado es un modelo que ya no ejecuta los circuitos internos responsables de las negativas, sin necesidad de un reentrenamiento completo.

## Capacidades

- Generacion de texto y razonamiento general, con un MMLU agregado de 78,31 tras la abliteración (82,50 en el modelo original).
- Conocimiento academico multidisciplinar: puntuaciones altas en subcategorias de MMLU como mmlu_anatomy (82,96), mmlu_astronomy (91,45), mmlu_college_biology (93,06) o mmlu_high_school_government_and_politics (94,82).
- Razonamiento logico y de sentido comun: ARC-Challenge 48,89, HellaSwag 55,50, Winogrande 69,61.
- Sin rechazos: la abliteración elimina los comportamientos de negativa del modelo base, respondiendo a instrucciones que el modelo original rechazaría.
- No hay informacion publicada sobre soporte de tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido (thinking mode).
- No se ha documentado el soporte multilingue explicito, aunque la familia Qwen 3.5 suele incluir cobertura multilingue.

## Casos de uso

- Investigacion en alineamiento y seguridad: al ser una variante abliterated con una evaluación comparativa completa contra el modelo original, es material de estudio ideal para analizar cómo la ablación direccional degrada capacidades específicas.
- Red teaming y evaluacion de robustez: permite generar respuestas sin rechazos para probar sistemas de filtrado, guardrails y moderación aguas abajo.
- Asistentes locales sin restricciones de negativa: con licencia MIT y pesos en safetensors, puede desplegarse en entornos donde los rechazos del modelo base interrumpen flujos de trabajo legítimos (por ejemplo, análisis de contenido sensible en investigación forense digital o moderación de contenidos).
- Generacion de datos sinteticos para investigacion: útil para construir datasets que el modelo original rechazaría, siempre dentro de marcos legales y éticos.
- Clasificacion y preguntas de conocimiento general: mantiene un rendimiento sólido en la mayoría de tareas de MMLU (caída media de solo 3,63 puntos), por lo que sigue siendo válido para tareas de conocimiento y pregunta-respuesta académica.
- Estudio del impacto de la abliteracion por dominio: los deltas publicados (por ejemplo, −15,18 en mmlu_machine_learning frente a 0,00 en mmlu_college_biology) permiten analizar qué capacidades están más acopladas a la dirección de rechazo.

## Benchmarks y rendimiento

Evaluación con lm-evaluation-harness (backend vLLM, bf16, 0-shot, seed=0) sobre 62 tareas, comparando el modelo original Sage-A1.5 con esta versión abliterated:

| Tarea | Original | Abliterated | Δ (pts) |
|:-----|--------:|----------:|-------:|
| mmlu | 82,50 | 78,31 | −4,19 |
| arc_challenge | 51,71 | 48,89 | −2,82 |
| hellaswag | 61,71 | 55,50 | −6,21 |
| winogrande | 73,40 | 69,61 | −3,79 |
| mmlu_machine_learning | 78,57 | 63,39 | −15,18 |
| mmlu_moral_scenarios | 61,90 | 49,27 | −12,63 |
| mmlu_college_mathematics | 67,00 | 57,00 | −10,00 |
| mmlu_high_school_physics | 82,78 | 74,17 | −8,61 |
| mmlu_professional_psychology | 87,91 | 79,90 | −8,01 |
| mmlu_high_school_computer_science | 88,00 | 90,00 | +2,00 |
| mmlu_college_biology | 93,06 | 93,06 | 0,00 |
| mmlu_marketing | 93,16 | 93,16 | 0,00 |

La caída media de capacidad es de 3,63 puntos. Las tareas más afectadas son las de razonamiento formal y matemático (machine learning, matemáticas universitarias, escenarios morales), mientras que las tareas de recuerdo factual retienen mejor el rendimiento. No se han publicado comparaciones con otros modelos de la misma clase de tamaño (Qwen, Llama, etc.) ni resultados en HumanEval, GSM8K u otras baterías de código y matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,1 B de parámetros en BF16, se necesitan aproximadamente 70 GB solo para los pesos, por lo que en precisión completa se requiere al menos una GPU de 80 GB (A100/H100 80 GB) o multiples GPUs.
- Con cuantizacion a 4 bits (si se generan versiones GGUF o AWQ, no disponibles en este repositorio), el consumo bajaría a unos 20-25 GB, cabiendo en una RTX 4090 (24 GB) de forma ajustada o en una RTX 5090 (32 GB) con holgura; estas cuantizaciones no están publicadas por el autor.
- Consumer GPUs: en BF16 no cabe en ninguna GPU de consumo actual; solo sería viable con cuantización de terceros o offloading a CPU/RAM con llama.cpp.
- Despliegue: el propio autor evaluó el modelo con vLLM, por lo que es una opción verificada; también debería funcionar con transformers de Hugging Face (arquitectura qwen3_5_moe). No hay versiones GGUF oficiales para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han publicado benchmarks comparativos directos con otros modelos en la información disponible. Como referencia contextual, dentro de la categoria de modelos MoE de ~35 B de parametros totales derivados de la familia Qwen 3.5:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Sage-A1.5-Ablitrex-abliterated-BF16 | 35,1 B (MoE) | no disponible | MIT | Variante sin rechazos, MMLU 78,31 |
| InternScience/Sage-A1.5 (base) | 35,1 B (MoE) | no disponible | no disponible | Modelo original, MMLU 82,50 |
| Qwen3-30B-A3B (referencia de familia) | 30,5 B (MoE, ~3 B activos) | hasta 128 K | Apache 2.0 | Modelo base de la arquitectura qwen3_5_moe |

La principal diferencia frente a alternativas convencionales es la ausencia de mecanismos de rechazo y la licencia MIT, a costa de una caída media de 3,63 puntos en benchmarks de conocimiento y razonamiento.

## Limitaciones y advertencias

- Degradacion medible de capacidades: la abliteración reduce el rendimiento medio en 3,63 puntos, con caidas severas en razonamiento matemático y técnico (−15,18 en mmlu_machine_learning, −12,63 en mmlu_moral_scenarios, −10,00 en mmlu_college_mathematics). No es adecuado para cargas de trabajo que dependan de razonamiento formal preciso.
- Riesgo de alucinacion: no hay datos publicados específicos, pero al tratarse de un modelo sin circuitos de rechazo y con degradación en razonamiento, el riesgo de generar contenido incorrecto sin advertencias internas es mayor que en el modelo base.
- Sin filtros de seguridad: el modelo no rechazará peticiones dañinas por sí mismo. Cualquier despliegue requiere capas de moderación externas y cumplimiento de la legislación aplicable (incluido el AI Act europeo si se despliega en la UE).
- Informacion incompleta: no se han documentado la longitud de contexto, los parámetros activos, los idiomas soportados ni el proceso de entrenamiento del modelo base, lo que dificulta la evaluación para producción.
- Comunidad pequena: con 52 descargas y 1 like en el momento de la ficha, el modelo tiene poca validación por parte de la comunidad y probablemente carezca de soporte, cuantizaciones de terceros y correcciones de errores.
- Licencia MIT: permite uso comercial, modificación y redistribución sin restricciones, pero sin ninguna garantía.
- Procedencia del modelo base: el modelo base InternScience/Sage-A1.5 es un finetune cuya ficha no detalla datos de entrenamiento ni licencias de los datos, un riesgo adicional para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mostwanted002/Sage-A1.5-Ablitrex-abliterated-BF16
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Autor del abliteration: https://huggingface.co/mostwanted002
- No se han encontrado enlaces a papers, repositorios de código de Abliterix ni demos en la información disponible.
