# divagr1925/qwen3.5-9b-factorio-build-er-r1

## Resumen

`divagr1925/qwen3.5-9b-factorio-build-er-r1` es un ajuste fino del modelo multimodal `Qwen/Qwen3.5-9B-Base`, publicado por el usuario divagr1925 en Hugging Face. Por el identificador del repositorio y por los modelos hermanos de la misma cuenta (`qwen3.5-9b-factorio-build-sft-800` y `qwen3.5-9b-factorio-build-grpo`), se trata de una especialización orientada a la generación y construcción de factorías en el videojuego Factorio, presumiblemente entrenada mediante un pipeline de ajuste supervisado (SFT), seguido de aprendizaje por refuerzo con GRPO y una etapa final tipo R1. La model card del repositorio no documenta ninguno de esos pasos ni el dataset empleado.

El modelo hereda la arquitectura del Qwen3.5-9B: un transformer causal con encoder de visión de 32 capas y 9.409.813.744 parámetros totales según los pesos en safetensors, con un diseño híbrido que alterna capas de Gated DeltaNet (atención lineal) y capas de gated attention en una proporción 3:1. La ventana de contexto nativa declarada para el modelo base es de 262.144 tokens, extensible hasta 1.010.000 tokens, y el pipeline de Hugging Face del repositorio es `image-text-to-text`.

La relevancia de esta ficha es doble: por un lado, documenta un experimento comunitario de ajuste de un modelo multimodal de 9B sobre una tarea de dominio muy concreto (planificación de cadenas de producción y planos de Factorio); por otro, sirve como referencia de la arquitectura Qwen3.5 en su variante pequeña. Conviene tener presente que el repositorio acumula 0 descargas y 0 likes en el momento de la consulta y que su model card reproduce el contenido de la del modelo base, no el del ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión; híbrido de Gated DeltaNet (atención lineal) y gated attention en patrón 8 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)); MTP (multi-token prediction) entrenado con varios pasos |
| Parámetros totales | 9.409.813.744 (safetensors); la model card del modelo base declara 9B |
| Parámetros activos | No disponible. La model card del modelo base menciona MoE disperso en las notas destacadas, pero no publica número de expertos ni parámetros activos para la variante de 9B |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens (según la model card del modelo base) |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors; no hay GGUF, GPTQ ni AWQ publicados |
| Idiomas soportados | La model card del modelo base declara 201 idiomas y dialectos; los metadatos de este repositorio no especifican idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato Hugging Face Transformers) |
| Modelo base | Qwen/Qwen3.5-9B-Base (ajuste fino) |
| Librería | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura declarada en la model card es un transformer causal con encoder de visión y fusión temprana de tokens multimodales. El bloque se repite ocho veces con el siguiente patrón interno: tres subcapas compuestas por Gated DeltaNet más red feed-forward, seguidas de una subcapa de gated attention más red feed-forward. La dimensión oculta es 4096, el vocabulario tiene 248.320 entradas (con padding) y la dimensión intermedia de la FFN es 12.288. Las capas de Gated DeltaNet usan 32 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; las capas de gated attention usan 16 cabezas para Q y 4 para KV con dimensión de cabeza 256 y dimensión de RoPE de 64. Esto implica que solo una cuarta parte de las capas mantiene caché KV clásica, lo que reduce el coste de memoria en contextos largos. El modelo se entrenó con MTP (multi-token prediction) en varios pasos, lo que habilita decodificación especulativa.

Sobre el ajuste fino de este repositorio no hay información: la model card es una copia de la del Qwen3.5-9B base y no describe el dataset, el número de tokens, la composición de los datos ni el método (RLHF, DPO, GRPO u otro). Los repositorios hermanos de la misma cuenta (`qwen3.5-9b-factorio-build-sft-800` y `qwen3.5-9b-factorio-build-grpo`) sugieren una secuencia SFT → GRPO, y el sufijo `er-r1` del identificador apunta a una etapa adicional de aprendizaje por refuerzo con razonamiento extendido, pero ninguna de estas inferencias está confirmada por documentación publicada.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline declarado es `image-text-to-text`, por lo que acepta entradas de texto e imagen en un mismo contexto.
- Comprensión visual: la model card del modelo base indica paridad con Qwen3 y superación de los modelos Qwen3-VL en razonamiento, código, agentes y comprensión visual.
- Razonamiento sobre cadenas de producción: el ajuste está orientado, por el nombre del repositorio, a la generación de construcciones y planos de Factorio.
- Capacidades de agente: la model card menciona explícitamente la evaluación en tareas de agentes y el entrenamiento con RL sobre entornos multiagente a gran escala.
- Multilingüismo: 201 idiomas y dialectos declarados para el modelo base.
- Decodificación especulativa: el entrenamiento con MTP en varios pasos permite usar multi-token prediction como borrador.
- Soporte de tool calling / function calling: no se detalla explícitamente en la información disponible.
- Capacidades del ajuste concreto: no documentadas. No hay evidencia publicada de que el ajuste conserve intactas las capacidades generales del modelo base.

## Casos de uso

- Generación de planos de Factorio: el modelo puede producir representaciones textuales de planos (blueprints) de cadenas de producción, con ratios de máquinas y disposición de cintas, a partir de una descripción en lenguaje natural del objetivo (por ejemplo, "montaje de circuitos rojos a 45 unidades por minuto").
- Asistente de diseño de fábricas: dado un objetivo de producción, el modelo puede desglosar la cadena de recetas, calcular el número de máquinas y señalar los cuellos de botella, aprovechando su ventana de contexto de 262.144 tokens para mantener el estado completo de una base grande.
- Agente que interpreta el estado del juego: con el encoder de visión, un agente externo puede enviar capturas de pantalla de la base y pedir al modelo que identifique problemas de suministro, cuellos de botella o huecos en el layout antes de proponer cambios.
- Revisión y refactorización de planos existentes: el modelo puede recibir la descripción de una factoría en funcionamiento y proponer reorganizaciones que mejoren el throughput o liberen espacio.
- Investigación en aprendizaje por refuerzo sobre entornos de construcción: al proceder de una cadena SFT → GRPO, sirve como punto de partida o como referencia para estudiar la transferencia de RL a tareas de construcción con recompensa verificable.
- Fine-tuning adicional de dominio: al publicarse bajo Apache 2.0 y en formato Transformers, se puede usar como base para nuevos ajustes sobre mecánicas concretas (por ejemplo, trenes, circuitos lógicos o logística de fluidos).
- Extracción de información de imágenes técnicas: además del caso de Factorio, el encoder de visión permite tareas de OCR y descripción de diagramas, aunque el ajuste específico puede haber degradado este comportamiento.
- Asistente conversacional general: técnicamente posible, pero no recomendable sin evaluación previa, dado que el ajuste de dominio puede haber reducido el rendimiento en tareas fuera de distribución.

## Benchmarks y rendimiento

Los únicos datos de benchmarks presentes en la información proporcionada corresponden al modelo base Qwen3.5-9B, no a este ajuste fino. Además, la tabla de la model card está truncada en el material disponible, por lo que solo se reproducen las filas completas. No se han publicado resultados de benchmarks propios de `qwen3.5-9b-factorio-build-er-r1`.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | No disponible (truncado en la información) | No disponible (truncado en la información) |

La model card incluye además una figura de resultados (`qwen3.5_small_size_score.png`) con el resto de comparativas, pero sus valores no están disponibles en el material consultado. No hay ninguna evaluación de la tarea de Factorio (por ejemplo, tasa de planos válidos, ratios correctos o recompensa media en el entorno) publicada en el repositorio.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 18,8 GB solo para pesos (9,41 mil millones de parámetros × 2 bytes), más caché y activaciones; en la práctica, 24 GB es el mínimo ajustado y 40-80 GB es lo recomendable.
- VRAM para inferencia en int8: del orden de 9,4 GB de pesos; requiere cuantización propia, ya que el repositorio no publica versiones cuantizadas.
- VRAM para inferencia en 4 bits: del orden de 5,3 GB de pesos, más overhead; requeriría convertir los pesos a GPTQ, AWQ o GGUF por cuenta propia.
- Caché KV: la arquitectura híbrida solo mantiene caché clásica en las 8 capas de gated attention (4 cabezas KV de dimensión 256). A partir de los hiperparámetros publicados, la estimación es de unos 32 KB por token en fp16, es decir, del orden de 8-9 GB para 262.144 tokens. Las capas de Gated DeltaNet mantienen un estado recurrente de tamaño constante.
- GPU recomendadas: A100 40 GB, A100 80 GB o H100 para bf16 con contexto largo; RTX 4090 (24 GB) para bf16 con contexto moderado o para cuantizaciones de 8 bits.
- Cabe en GPU de consumo: en cuantización de 4 bits sí cabe en RTX 3060 12 GB, RTX 4070/4080 y RTX 4090; en bf16 completo, solo en tarjetas de 24 GB o más y con contexto recortado.
- Opciones de despliegue: la model card del modelo base declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. llama.cpp u Ollama requerirían generar un GGUF, que no está publicado.
- Latencia y throughput: no disponibles. El entrenamiento con MTP permite decodificación especulativa, que en el modelo base reduciría la latencia, pero no hay cifras publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| divagr1925/qwen3.5-9b-factorio-build-er-r1 | 9,41 mil millones | No disponible en la información del ajuste (el base declara 262.144 tokens) | No disponible | apache-2.0 | Pesos en Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (base) | 9B según model card | 262.144 tokens, extensible a 1.010.000 | 82,5 | apache-2.0 | Pesos abiertos en Hugging Face |
| Qwen/Qwen3.5-4B | 4B | No disponible | 79,1 | No disponible en la información proporcionada | Referenciado en la tabla de benchmarks del modelo base |
| Qwen3-Next-80B-A3B-Thinking | No disponible (el nombre sugiere 80B totales con 3B activos) | No disponible | 82,7 | No disponible en la información proporcionada | No disponible en la información proporcionada |
| GPT-OSS-20B | No disponible | No disponible | 74,8 | No disponible en la información proporcionada | No disponible en la información proporcionada |

Frente a los modelos hermanos de la misma cuenta, `qwen3.5-9b-factorio-build-sft-800` y `qwen3.5-9b-factorio-build-grpo`, este repositorio se presenta como la etapa final de una cadena de ajuste sobre la misma tarea; no hay ninguna evaluación comparativa publicada entre las tres variantes.

## Limitaciones y advertencias

- La model card del repositorio reproduce literalmente el contenido de la del Qwen3.5-9B base: no documenta datos de entrenamiento, hiperparámetros, método de ajuste ni evaluación del modelo especializado.
- No existen resultados de benchmarks propios del ajuste, ni en MMLU, ni en tareas de Factorio, ni en ninguna otra métrica.
- El repositorio tenía 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación por parte de la comunidad.
- Riesgo de olvido catastrófico: un ajuste de dominio sobre una tarea muy específica puede degradar las capacidades generales de razonamiento, código y conversación del modelo base, algo que no se ha medido.
- Riesgo de alucinación en el dominio: el modelo puede generar planos con ratios incorrectos, recetas inexistentes o disposiciones que no funcionan en el juego, sin que exista un verificador automático publicado.
- El modelo no ejecuta acciones en el juego: genera texto (o representaciones de planos) y requiere un agente externo que traduzca esa salida a acciones dentro de Factorio.
- El contexto declarado de 262.144 tokens extensible a 1.010.000 corresponde al modelo base; no hay ninguna evaluación de la calidad efectiva en el extremo de esa ventana para este ajuste.
- Idiomas: los metadatos de este repositorio no declaran idiomas soportados y el ajuste probablemente esté dominado por el inglés, aunque el modelo base declare 201 idiomas.
- Licencia: apache-2.0 permite uso comercial y modificación. No obstante, conviene revisar la procedencia de los datos de ajuste relacionados con Factorio, ya que los planos son creaciones de usuarios y el contenido del juego está sujeto a los términos de Wube Software.
- No hay información sobre sesgos específicos del ajuste; los sesgos del modelo base no se han auditado en esta información.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divagr1925/qwen3.5-9b-factorio-build-er-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Modelo base post-entrenado (Qwen3.5-9B): https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Modelo hermano (SFT): https://huggingface.co/divagr1925/qwen3.5-9b-factorio-build-sft-800
- Modelo hermano (GRPO) en FriendliAI: https://friendli.ai/models/divagr1925/qwen3.5-9b-factorio-build-grpo
- Ficha en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b
- Ficha en AI Model Radar: https://aimodelradar.app/models/qwen3-5-9b
