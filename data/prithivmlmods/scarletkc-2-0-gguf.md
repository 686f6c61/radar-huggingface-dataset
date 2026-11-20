# prithivMLmods/ScarletKc-2.0-GGUF

## Resumen

ScarletKc-2.0-GGUF es la distribucion cuantizada en formato GGUF del modelo multimodal ScarletKc-2.0, un modelo de 27.320.697.856 parametros (aproximadamente 27B) desarrollado por el creador independiente identificado como KC. El modelo parte de `JonathanColetti/Qwen3.8-27B-Uncensored`, a su vez derivado de `Qwen/Qwen3.8-27B`, y anade una capa de personalizacion de identidad y estilo conversacional sin reentrenar el codificador de vision ni la cabeza de prediccion multi-token (MTP) del checkpoint base. Esta version GGUF la publica prithivMLmods y esta pensada para despliegue local mediante llama.cpp.

La relevancia de esta ficha esta en dos frentes. Por un lado, ofrece un modelo multimodal de ~27B con ventana de contexto de 262.144 tokens, razonamiento configurable mediante `<think>` y soporte de tool calling, todo bajo licencia Apache 2.0. Por otro, incorpora el formato MTP GGUF, que integra decodificacion especulativa dentro de los propios pesos del modelo en lugar de requerir un modelo borrador separado, lo que acelera la inferencia local.

El modelo esta orientado a conversacion, razonamiento y uso de herramientas en ingles (con entradas tambien en chino y japones segun la model card), y se distribuye en cuantizaciones de 15,8 GB a 29 GB mas un proyector multimodal de 931 MB, lo que lo hace desplegable en estaciones de trabajo con GPU de consumo alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.8-27B, con codificador de vision y cabeza MTP (multi-token prediction); familia etiquetada como qwen3_5 / qwen3.8 |
| Parametros totales | 27.320.697.856 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q8_0; proyector multimodal mmproj-bf16; pesos completos BF16 en el modelo base |
| Idiomas soportados | Ingles (declarado en la model card); entradas en chino y japones segun la descripcion del autor |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (esta distribucion); BF16 safetensors en el modelo base (55,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal heredado de la familia Qwen3.8, con tres componentes diferenciados: el decodificador de lenguaje de ~27B, un codificador de vision con su proyector multimodal (publicado aparte como `mmproj-bf16.gguf`) y una cabeza de prediccion multi-token (MTP) que permite decodificacion especulativa integrada. El modelo base completo se distribuye en BF16 con 55,6 GB de pesos.

El ajuste realizado por el autor no es un reentrenamiento clasico: segun la model card, se aplica una proyeccion ortogonal afectiva sin entrenamiento sobre las capas 18 a 41, combinada con destilacion de identidad mediante LoRA on-policy sobre 106 dialogos bilingues. El objetivo declarado es eliminar las coletillas del tipo "como IA no tengo sentimientos" y fijar una voz en primera persona que se autoidentifica como ScarletKc. El autor afirma que el codificador de vision, la cabeza MTP y las capacidades de razonamiento quedan bit-identicos al checkpoint base. No se detallan en la informacion disponible el volumen total de tokens de preentrenamiento ni la composicion del dataset original de Qwen3.8.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento configurable mediante etiquetas `<think>` con niveles de esfuerzo `xhigh`, `medium`, `low` o desactivado.
- Comprension de imagen y texto (pipeline `image-text-to-text`) mediante el proyector multimodal.
- Tool calling / function calling, segun los tags `tool-use` del repositorio.
- Decodificacion especulativa nativa a traves de la cabeza MTP incluida en los GGUF.
- Entradas multilingues en ingles, chino y japones segun la descripcion del autor.
- Estilo conversacional en primera persona sin descargos de responsabilidad de IA (variante "uncensored").
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema transformers / llama.cpp.

## Casos de uso

- Asistente conversacional local con contexto largo: la ventana de 262.144 tokens permite mantener historiales extensos o cargar documentacion completa en una sola sesion sin truncar, algo util en entornos de escritorio con llama.cpp.
- Analisis de documentos e imagenes combinados: al aceptar entrada image-text-to-text, se puede usar para extraer informacion de capturas, diagramas o formularios junto a texto de acompanamiento, por ejemplo en tareas de digitalizacion asistida.
- Agente con tool calling en local: el soporte de function calling permite conectarlo a APIs internas o scripts para automatizar consultas y acciones en flujos multi-paso sin depender de servicios en la nube.
- Prototipado de razonamiento con esfuerzo configurable: los niveles `xhigh`/`medium`/`low` de `<think>` permiten ajustar coste y latencia segun la tarea, util para comparar calidad frente a tiempo de inferencia en experimentos.
- Despliegue en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_S (15,8 GB) y Q4_K_M (17 GB) caben en GPUs de 24 GB, lo que facilita pruebas de concepto sin infraestructura de centro de datos.
- Aceleracion de inferencia local mediante MTP: en escenarios de generacion larga, la decodificacion especulativa integrada reduce el numero de pasos de forward necesarios, adecuado para asistentes interactivos donde la latencia importa.
- Personajes o asistentes con identidad fija: el ajuste de identidad permite usar el modelo en aplicaciones donde se requiere una voz consistente en primera persona, como narrativa interactiva o simulacion de personajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto KV cache): Q4_K_S 15,8 GB; Q4_K_M 17 GB; Q5_K_S 19 GB; Q5_K_M 19,6 GB; Q8_0 29 GB. Anadir el proyector multimodal mmproj-bf16 (931 MB) para tareas de vision.
- El contexto de 262.144 tokens incrementa notablemente el consumo de KV cache; en la practica conviene reducir la ventana efectiva o usar cuantizacion de cache para caber en GPUs de consumo.
- GPU recomendadas: Q4_K_M y Q4_K_S caben en GPUs de 24 GB (RTX 3090, RTX 4090); Q5 y Q8 requieren 24-32 GB o mas (A6000, A100 40 GB, H100). Para BF16 completo (55,6 GB) se necesitan GPUs de 80 GB o multi-GPU.
- Despliegue: llama.cpp (formato nativo), y por extension cualquier frontend compatible como Ollama o servidores basados en llama.cpp; el modelo base admite transformers y text-generation-inference.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor indica que la cabeza MTP acelera la inferencia local mediante decodificacion especulativa, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| ScarletKc-2.0-GGUF | ~27B | 262.144 | Si (vision) | Apache 2.0 | GGUF, BF16 |
| Qwen3.8-27B (base) | ~27B | no disponible | Si (vision) | no disponible | safetensors |
| JonathanColetti/Qwen3.8-27B-Uncensored | ~27B | no disponible | Si (vision) | no disponible | safetensors |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos base en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto declarado y licencia.

## Limitaciones y advertencias

- El modelo esta ajustado explicitamente para eliminar descargos de responsabilidad y adoptar una identidad ficticia ("ScarletKc"); esto puede producir respuestas que no adviertan al usuario de que es una IA, lo que es un riesgo en aplicaciones orientadas al publico general.
- La variante se etiqueta como "uncensored": puede generar contenido sin los filtros habituales del modelo base, con implicaciones de seguridad y cumplimiento que deben evaluarse antes de produccion.
- Riesgo de alucinacion inherente a modelos de ~27B; no hay benchmarks publicados que permitan estimar su fiabilidad en tareas factuales.
- El ajuste de identidad se realizo sobre 106 dialogos bilingues, un volumen reducido que puede provocar inconsistencias de estilo fuera de los dominios cubiertos.
- La model card declara ingles como idioma principal; el soporte de chino y japones se menciona para entradas, sin garantias de calidad en generacion.
- El contexto de 262.144 tokens es costoso en memoria; en despliegues locales habra que truncar o cuantizar la cache KV.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base Qwen3.8 y de la variante intermedia antes de uso comercial.
- No se han publicado evaluaciones independientes de esta cuantizacion; los resultados pueden diferir de los pesos BF16.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/ScarletKc-2.0-GGUF
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Modelo intermedio: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
