# nightmedia/Qwen3.5-9B-Brainwaves-X-Heretic-oQ8e-mtp

## Resumen

Qwen3.5-9B-Brainwaves-X-Heretic-oQ8e-mtp es un modelo experimental publicado por el usuario nightmedia en Hugging Face, construido como un merge (fusión) de cinco modelos derivados de la familia Qwen3.5 de 9B: Brainwaves, Emergent, Qwopus3-5-9B-Coder-Flash, DeepThought-STEM y OneJev1.6. El resultado es un modelo multimodal de tipo image-text-to-text orientado a razonamiento con cadena de pensamiento (long-CoT), generación de código, matemáticas y escritura creativa de ficción, con un total de 9.653.104.368 parámetros en pesos safetensors.

La variante concreta de esta ficha incorpora la cuantización oQ8e-mtp (8 bits con multi-token prediction, orientada a decodificación especulativa) y el apelativo "Heretic", que en el ecosistema de merges suele indicar una reducción de los rechazos del modelo alineado original. El autor reporta una tasa de rechazo de 4/100 y una divergencia KL de 0,0028 frente al modelo en bf16, lo que sugiere que la cuantización preserva el comportamiento del original con pérdida mínima.

Es relevante ahora porque combina en un solo artefacto de ~10,7 GB capacidades que normalmente requieren modelos separados (código, STEM, escritura creativa y visión), mantiene licencia Apache 2.0 y declara soporte de contexto de hasta 1M de tokens (con una variante de 256k), lo que lo hace atractivo para despliegues en una sola GPU de 24 GB. No obstante, es un modelo comunitario y experimental, sin paper ni evaluación estandarizada publicada más allá de las pruebas internas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5, multimodal image-text-to-text, con multi-token prediction (MTP); detalles internos (número de capas, atención, MoE) no disponibles |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 1M tokens (según tags); variante de 256k tokens también declarada; configuración efectiva no verificada |
| Tipos de cuantizacion | oQ8e-mtp (esta variante), además de bf16, q8-hi, mxfp8, oQ6e-mtp, oQ5e-mtp, oQ4e-mtp, oQ3.5e-mtp, oQ3e-mtp, oQ2.7e-mtp, oQ2.5e-mtp, oQ2e-mtp y mxfp4 en las variantes hermanas |
| Idiomas soportados | en, zh, ja, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); variantes oMLX/MLX disponibles en la familia |

## Arquitectura y entrenamiento

El modelo es un merge realizado con mergekit sobre cinco checkpoints base: nightmedia/Qwen3.5-9B-Brainwaves, nightmedia/Qwen3.5-9B-Emergent, Jackrong/Qwopus3-5-9B-Coder-Flash, xtools-at/Qwen3.5-9B-DeepThought-STEM y OmniJev/OneJev1.6-9B. La arquitectura subyacente es la de Qwen3.5, un transformer multimodal (pipeline image-text-to-text) con soporte declarado de multi-token prediction (MTP) y decodificación especulativa, y con contextos extendidos de hasta 1M de tokens según los tags del repositorio. No se detallan en la información disponible el número de capas, la configuración de atención ni si emplea mezcla de expertos.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en los modelos base. Los tags mencionan "distillation", "claude" y "polaris-alpha", lo que sugiere que alguno de los componentes se destiló a partir de trazas de modelos mayores, pero el autor no documenta el procedimiento. La innovación técnica principal de esta variante es la cuantización oQ8e-mtp: 8 bits con MTP, que reduce el peso de 24,69 GB (bf16) a 16,30 GB manteniendo perplejidad idéntica (4,093 ± 0,026) y una velocidad de 736 tokens/s frente a 794 tokens/s en bf16, según las mediciones del autor.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo (hasta 1M tokens declarados).
- Razonamiento con cadena de pensamiento extensa (long-CoT) y modo de razonamiento explícito.
- Generación y edición de código, con orientación a tareas de programación (componente Coder-Flash).
- Matemáticas y disciplinas STEM (componente DeepThought-STEM).
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Escritura creativa: ficción, ciencia ficción, generación de tramas y subtramas, continuación de escenas, roleplaying y "vivid prosing".
- Capacidades multilingües en inglés, chino, japonés y español.
- Decodificación especulativa mediante multi-token prediction (MTP).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita en la información proporcionada.

## Casos de uso

- Asistente de programación en local: el componente Coder-Flash y los 9,65B parámetros permiten ejecutar el modelo en una GPU de 24 GB en oQ8e-mtp (16,30 GB de pico) para autocompletado, revisión de código y explicación de errores en un IDE, sin depender de la nube.
- Escritura de ficción asistida: el modelo está afinado para generación de tramas, subtramas y continuación de escenas; un escritor puede mantener una biblia de personajes de decenas de miles de tokens en contexto y pedir borradores coherentes con ella.
- Tutoría STEM: con el componente DeepThought-STEM y el modo long-CoT, sirve para resolver problemas de matemáticas y física paso a paso, mostrando el razonamiento intermedio para que el estudiante lo revise.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con texto para extraer información o responder preguntas sobre ellos.
- Chat multilingüe de atención al cliente: cubre inglés, chino, japonés y español, de modo que un mismo despliegue atiende conversaciones en los cuatro idiomas con contexto largo para historiales de ticket extensos.
- Roleplaying y prototipado de videojuegos narrativos: los tags de roleplaying y storytelling permiten generar diálogos de personajes y ramificaciones de guion en herramientas de escritura interactiva.
- Investigación experimental sobre merges y cuantización: al publicar el autor métricas comparativas por cuantización (perplejidad, memoria, tokens/s, KL), sirve como banco de pruebas para estudiar el impacto de oQ8e-mtp y mxfp8 en modelos de 9B.

## Benchmarks y rendimiento

El autor publica evaluaciones internas tipo "brainwaves" (arc, arc/e, boolq, hswag, obkqa, piqa, wino), perplejidad, memoria pico y tokens/s. No hay resultados de MMLU, HumanEval o GSM8K en la información disponible.

| Metrica | bf16 | oQ8e-mtp |
|---|---|---|
| arc | 0,703 | 0,697 |
| arc/e | 0,875 | 0,876 |
| boolq | 0,905 | 0,905 |
| hswag | 0,774 | 0,774 |
| obkqa | 0,526 | 0,526 |
| piqa | 0,805 | 0,801 |
| wino | 0,725 | 0,730 |
| Perplejidad | 4,093 ± 0,026 | 4,093 ± 0,026 |
| Memoria pico | 24,69 GB | 16,30 GB |
| Tokens/s | 794 | 736 |
| Rechazos | no disponible | 4/100 |
| Divergencia KL | — | 0,0028 |

En oMLX 0.8.0rc1 la variante oQ8e-mtp mantiene arc 0,697, boolq 0,905 y wino 0,730, con 736 tokens/s y 16,30 GB de pico.

## Requisitos de hardware

- VRAM estimada: 16,30 GB de pico en oQ8e-mtp; 13,17 GB en oQ5e-mtp; 12,21 GB en oQ4e-mtp; 11,12 GB en oQ3e-mtp; 24,69 GB en bf16.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 y contextos de 1M; RTX 4090 (24 GB) o L40S para oQ8e-mtp con margen para caché KV moderada.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con oQ8e-mtp u oQ6e-mtp; en GPUs de 16 GB con oQ4e-mtp u oQ5e-mtp, con contexto reducido.
- Despliegue: transformers (librería declarada); variantes oMLX/MLX para Apple Silicon; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: 736 tokens/s en oQ8e-mtp y 794 tokens/s en bf16 según el autor; el contexto de 1M requerirá particionado o atención eficiente no documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-9B-Brainwaves-X-Heretic-oQ8e-mtp | 9,65B | 1M (declarado) | Apache 2.0 | Merge comunitario multimodal con MTP; perplejidad 4,093 |
| Qwen3.5-9B-Brainwaves (componente) | ~9B | no disponible | Apache 2.0 | Perplejidad bf16 4,157; base del merge |
| Qwen3.5-9B-Emergent (componente) | ~9B | no disponible | Apache 2.0 | Merge previo con LensVLM y OneJev1.6 |
| apple/LensVLM-9B | ~9B | no disponible | no disponible | Evaluación parcial (arc 0,520, arc/e 0,684, boolq 0,885); rendimiento inferior en las métricas del autor |

No se dispone de comparación con modelos de referencia como Qwen3.5-9B original, Llama 3.1 8B o Gemma 2 9B en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental y comunitario: sin paper, sin evaluación estandarizada (MMLU, HumanEval, GSM8K) y sin garantías de robustez en producción.
- Riesgo de alucinación inherente a los merges de modelos de 9B; el modo long-CoT puede producir cadenas de razonamiento plausibles pero incorrectas.
- El contexto de 1M tokens está declarado en los tags pero no verificado; en la práctica, la ventana efectiva y la calidad de recuperación a larga distancia no están documentadas.
- Idiomas limitados a en, zh, ja y es; el español está declarado pero sin evaluación específica.
- La reducción de rechazos ("Heretic", 4/100) implica menor alineación de seguridad: puede generar contenido que los modelos base rechazarían.
- La cuantización oQ8e-mtp introduce una divergencia KL de 0,0028 frente a bf16; aceptable, pero no idéntica al original.
- Licencia Apache 2.0 permite uso comercial, pero al ser un merge de cinco modelos conviene verificar las licencias y procedencias de cada componente.
- Sin confirmación de soporte en vLLM, llama.cpp, Ollama o TGI; la integración en pipelines existentes puede requerir trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves-X-Heretic-oQ8e-mtp
- Modelo base Brainwaves: https://huggingface.co/nightmedia/Qwen3.5-9B-Brainwaves
- Modelo base Emergent: https://huggingface.co/nightmedia/Qwen3.5-9B-Emergent
- Modelo base Coder-Flash: https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash
- Modelo base DeepThought-STEM: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Modelo base OneJev1.6: https://huggingface.co/OmniJev/OneJev1.6-9B
- Repositorio mergekit: https://github.com/arcee-ai/mergekit
- Paper oMLX/MLX: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
