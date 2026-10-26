# mhseo2/teacher_q35_qwen36_27b-step0

## Resumen

Este repositorio, publicado por el usuario `mhseo2` (Minhyuk Seo), contiene un checkpoint de 27.781.427.952 parámetros (27,8B) cuyo contenido y model card corresponden a Qwen3.6-27B, el primer modelo open-weight de la familia Qwen3.6 de Alibaba. Es un modelo causal denso con encoder de visión, por lo que acepta entradas de imagen y texto y se etiqueta como `image-text-to-text`. El nombre del repositorio (`teacher_..._step0`) sugiere que se trata de un checkpoint paso 0 de un proceso de destilación o entrenamiento posterior, pero esa información no está documentada en la model card.

La relevancia técnica del modelo reside en su arquitectura híbrida: 64 capas organizadas en 16 bloques de tres capas de Gated DeltaNet (atención lineal) seguidas de una capa de Gated Attention (atención completa), lo que reduce el coste de caché KV a largo contexto. El modelo declara 262.144 tokens de contexto nativo, extensible hasta 1.010.000, y entrena con predicción multi-token (MTP). Según la tabla de la model card, alcanza 77,2 en SWE-bench Verified, por encima de Qwen3.5-27B (75,0) y de Gemma4-31B (52,0).

El punto crítico para quien evalúe el repositorio: la model card es una copia literal de la de Qwen/Qwen3.6-27B y no documenta ninguna modificación, dataset de ajuste ni evaluación propia. Con 0 descargas y 0 likes en el momento de la consulta, no hay validación independiente de que los pesos se comporten como el modelo oficial de Qwen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión: 16 bloques de (3 × Gated DeltaNet → FFN) + (1 × Gated Attention → FFN) |
| Parámetros totales | 27.781.427.952 (27,8B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantización | no disponible en la información; el repositorio solo publica safetensors |
| Idiomas soportados | no disponible (la model card no incluye listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 55,6 GB, ≈2 bytes por parámetro, consistente con bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con encoder de visión. La dimensión oculta es 5120, con 64 capas y un layout híbrido de 16 repeticiones del patrón `[Gated DeltaNet → FFN] × 3 + [Gated Attention → FFN] × 1`. Las capas de Gated DeltaNet usan 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; las capas de Gated Attention usan 24 cabezas de consulta y 4 de clave-valor, con dimensión de cabeza 256 y RoPE de dimensión 64. La FFN tiene dimensión intermedia 17.408, el vocabulario es de 248.320 tokens (padded) y el modelo se entrenó con predicción multi-token (MTP) en varios pasos, lo que habilita decodificación especulativa nativa.

La model card indica que se trata de un modelo preentrenado y postentrenado, pero no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla la arquitectura concreta del encoder de visión (número de capas, resolución de entrada, estrategia de parcheo). Las innovaciones declaradas por el autor del modelo base son dos: mejor razonamiento a nivel de repositorio y de flujos de frontend para "agentic coding", y la llamada "thinking preservation", una opción para retener el contexto de razonamiento de mensajes históricos y reducir el coste en desarrollo iterativo.

## Capacidades

- Generación de texto conversacional multi-turno en formato instruccional.
- Razonamiento y código: la model card destaca explícitamente flujos de trabajo de frontend y razonamiento a nivel de repositorio (repository-level reasoning).
- Comprensión de imagen y texto: pipeline `image-text-to-text`, con encoder de visión integrado en la arquitectura.
- Contexto largo: 262.144 tokens nativos, con extensión declarada hasta 1.010.000.
- Modo de razonamiento con preservación de contexto histórico ("thinking preservation"), opción de configuración descrita por el autor del modelo base.
- Predicción multi-token (MTP) entrenada, aprovechable para decodificación especulativa.
- Flujos agénticos de codificación: la model card menciona "Agentic Coding" como capacidad destacada; el soporte explícito de *function calling* / *tool calling* no está documentado en la información disponible.

## Casos de uso

- **Resolución de incidencias en repositorios (SWE-bench style)**: con 77,2 en SWE-bench Verified y 53,5 en SWE-bench Pro según la model card, el modelo está orientado a localizar el fallo, editar varios ficheros y validar el parche dentro de un repositorio real.
- **Generación de interfaces de frontend**: la model card cita explícitamente los flujos de frontend como área de mejora de Qwen3.6; encaja en la generación de componentes, maquetación y refactor de estilos a partir de una descripción o de una captura de pantalla, gracias al encoder de visión.
- **Revisión de código en pipelines de CI/CD**: dado su rendimiento en parches verificables, puede insertarse como revisor automático que propone correcciones sobre el diff antes del merge, con el contexto del repositorio.
- **Análisis de documentación técnica extensa**: con 262.144 tokens de contexto nativo, permite cargar especificaciones, manuales o varios ficheros de un mismo proyecto sin trocear y hacer preguntas cruzadas.
- **Digitalización de documentación con imagen**: al ser `image-text-to-text`, sirve para extraer información estructurada de capturas, diagramas, tablas escaneadas o pantallas de aplicación, combinando OCR implícito con razonamiento sobre el contenido.
- **Desarrollo iterativo con agente**: la opción de preservar el contexto de razonamiento entre mensajes reduce el coste de repetir el análisis en cada iteración, útil en sesiones largas de depuración guiada por agente.
- **Asistente técnico interno sobre base de código**: desplegado en vLLM o SGLang, permite responder consultas sobre arquitectura del proyecto manteniendo contexto largo entre turnos.

## Benchmarks y rendimiento

Resultados publicados en la model card del modelo base. Corresponden a Qwen3.6-27B, no a una evaluación independiente de este checkpoint concreto.

| Benchmark | Qwen3.6-27B | Qwen3.5-27B | Qwen3.6-35B-A3B | Gemma4-31B | Claude 4.5 Opus |
|---|---|---|---|---|---|
| SWE-bench Verified | 77,2 | 75,0 | 73,4 | 52,0 | 80,9 |
| SWE-bench Pro | 53,5 | 51,2 | 49,5 | 35,7 | 57,1 |
| SWE-bench Multilingual | no disponible (fila truncada en la información) | 69,3 | 67,2 | 51,7 | 77,5 |

Datos adicionales de la misma tabla para Qwen3.5-397B-A17B: SWE-bench Verified 76,2; SWE-bench Pro 50,9; SWE-bench Multilingual 69,3. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de visión para este modelo.

## Requisitos de hardware

- **Pesos en bf16**: 27,8B parámetros implican unos 55,6 GB de pesos (tamaño real del repositorio). Con caché KV y activaciones, el despliegue cómodo exige 80 GB de VRAM: una A100 80GB, una H100 80GB o dos GPU de 48 GB.
- **FP8**: en torno a 28 GB de pesos; cabe en una L40S (48 GB), RTX 6000 Ada (48 GB) o A100 40GB con margen para contexto moderado.
- **INT4 / GGUF Q4_K_M**: aproximadamente 16-17 GB de pesos; cabe en una RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 5090, con contexto limitado si se quiere evitar el offload.
- **Caché KV a contexto largo**: estimación calculada a partir de la configuración. Solo 16 de las 64 capas tienen atención completa, con 4 cabezas KV de dimensión 256, lo que da 32.768 valores por token; en bf16 son ≈64 KiB por token. A 32.768 tokens, unos 2 GiB; a 262.144 tokens, unos 16 GiB, además de los pesos. Las 48 capas restantes son de atención lineal y su estado es de tamaño constante, no proporcional al contexto.
- **GPU recomendadas por escenario**: H100/A100 80GB para bf16 y contexto largo; L40S o RTX 6000 Ada para FP8; RTX 4090/3090 para cuantización de 4 bits en desarrollo local.
- **Opciones de despliegue**: la model card cita compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. El soporte en llama.cpp/Ollama para este layout híbrido (Gated DeltaNet) no está confirmado en la información disponible; conviene verificarlo antes de planificar un despliegue en CPU o en GPU de consumo.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (Qwen3.6-27B) | 27,8B | denso | 262.144 (hasta 1.010.000) | 77,2 (model card) | Apache 2.0 | safetensors en HF, 0 descargas |
| Qwen3.5-27B | 27B | denso | 256K+ (según guía externa) | 75,0 | no disponible en la información | serie anterior, febrero 2026 |
| Qwen3.6-35B-A3B | 35B | 3B (MoE) | no disponible | 73,4 | no disponible en la información | variante MoE de la misma generación |
| Gemma4-31B | 31B | denso | no disponible | 52,0 | no disponible en la información | modelo de Google |
| Claude 4.5 Opus | no disponible | no disponible | no disponible | 80,9 | propietaria | solo API |

Frente a Qwen3.5-27B, la mejora declarada es de +2,2 puntos en SWE-bench Verified y +2,3 en SWE-bench Pro. El modelo MoE Qwen3.6-35B-A3B, con solo 3B parámetros activos, queda por debajo en SWE-bench Verified (73,4) pero es mucho más barato de servir. Los resultados de Gemma4-31B y Claude 4.5 Opus se incluyen tal como aparecen en la model card del autor del modelo base.

## Limitaciones y advertencias

- **Trazabilidad dudosa**: el repositorio pertenece a un usuario tercero (`mhseo2`), no a Qwen. La model card es una copia literal de la de Qwen/Qwen3.6-27B y no documenta qué se ha entrenado, con qué datos ni con qué método; el sufijo `step0` y el prefijo `teacher` apuntan a un proceso de destilación no descrito.
- **Sin validación independiente**: 0 descargas y 0 likes en el momento de la consulta. Los benchmarks de la ficha son los del modelo base y no se ha verificado que este checkpoint los reproduzca.
- **Idiomas no documentados**: al no incluirse listado de idiomas, no se puede garantizar el comportamiento en castellano ni en otras lenguas distintas del inglés sin evaluación propia.
- **Sesgos**: no hay información sobre sesgos en la documentación disponible. Al ser un modelo entrenado sobre corpus web, es esperable que herede sesgos sociales y culturales; no se han publicado análisis al respecto.
- **Alucinación**: no hay datos publicados de tasas de alucinación ni de calibración. En tareas de código el riesgo se mitiga con tests, no con la confianza del modelo.
- **Contexto**: los 262.144 tokens son nativos, pero la extensión hasta 1.010.000 requiere técnicas de extensión y degrada la calidad; el coste de caché KV en bf16 a contexto máximo ronda los 16 GiB adicionales a los pesos.
- **Licencia**: Apache 2.0 permite uso comercial, pero el `license_link` apunta al fichero LICENSE de Qwen/Qwen3.6-27B; conviene conservar los avisos de atribución del modelo original.
- **Compatibilidad de despliegue**: el layout híbrido con Gated DeltaNet no está soportado por todas las herramientas de inferencia; verificar el backend antes de dimensionar infraestructura.
- **Producción**: sin model card propia, sin evaluación reproducible y sin versionado claro, este checkpoint no es apto como dependencia de producción sin una batería de pruebas interna previa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mhseo2/teacher_q35_qwen36_27b-step0
- Modelo base referenciado (licencia): https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Blog del modelo base: https://qwen.ai/blog?id=qwen3.6-27b
- Qwen Chat: https://chat.qwen.ai
- Perfil del autor: https://huggingface.co/mhseo2
- Repositorio relacionado del mismo autor: https://huggingface.co/mhseo2/opd_q35_base_qwen35_27b_pivot-step0
- Ficha de inferencia en FriendliAI del repositorio relacionado: https://friendli.ai/models/mhseo2/opd_q35_base_qwen35_27b_pivot-step0
- Guía externa de la serie Qwen3.5: https://curateclick.com/blog/2026-qwen35-models-guide
- Documentación de Alibaba Cloud sobre el modelo sucesor (Qwen3.8-27B): https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-8-27b
