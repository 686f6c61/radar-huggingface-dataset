# ceselder/maemm-27b-rl-from-sft-2m-checkpoint

## Resumen

Qwen3.6-27B es un modelo de lenguaje causal con codificador de visión desarrollado por el equipo Qwen de Alibaba. Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, publicada tras la familia Qwen3.5, y está orientada a flujos de trabajo de programación agéntica, razonamiento a nivel de repositorio y generación de interfaces. El checkpoint aquí referenciado (`ceselder/maemm-27b-rl-from-sft-2m-checkpoint`) es una publicación derivada de un tercero sobre dichos pesos, con licencia Apache 2.0.

La arquitectura es un transformer híbrido de 27 781 427 952 parámetros (27B) que combina capas de atención lineal Gated DeltaNet con capas de atención con compuertas (Gated Attention), organizadas en un patrón de 16 bloques. El modelo soporta nativamente 262 144 tokens de contexto, extensible hasta 1 010 000, y está entrenado con predicción multi-token (MTP) en varios pasos.

Su relevancia actual radica en que ofrece capacidades de agente de código cercanas a modelos propietarios de gran escala (77,2 en SWE-bench Verified) en un tamaño de 27B desplegable en infraestructura propia, con licencia permisiva y compatibilidad con Transformers, vLLM, SGLang y KTransformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con codificador de visión: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parámetros totales | 27 781 427 952 (27B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta 1 010 000 tokens |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada (el benchmark SWE-bench Multilingual sugiere cobertura multilingüe en código) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

Detalles adicionales de arquitectura: dimensión oculta 5120; embedding de tokens 248 320 (con padding); 64 capas; FFN con dimensión intermedia 17 408; salida LM 248 320 (con padding). Gated DeltaNet: 48 cabezas de atención lineal para V y 16 para QK, dimensión de cabeza 128. Gated Attention: 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, dimensión de RoPE 64.

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida que alterna bloques de atención lineal (Gated DeltaNet) con bloques de atención completa con compuertas (Gated Attention) en una proporción de 3:1 dentro de cada uno de los 16 bloques. Esta combinación busca reducir el coste computacional de la atención en contextos largos manteniendo la capacidad de recuperación precisa de la atención completa. Incorpora además un codificador de visión, lo que lo convierte en un modelo image-text-to-text. El entrenamiento incluye predicción multi-token (MTP) en varios pasos, técnica que permite decodificación especulativa nativa y mejora el throughput.

El proceso de entrenamiento consta de preentrenamiento y postentrenamiento, según la model card. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO. La model card menciona que la serie Qwen3.6 se construyó a partir de retroalimentación directa de la comunidad, priorizando estabilidad y utilidad en el mundo real, e introduce la opción de "Thinking Preservation" (preservación del razonamiento) para retener contexto de razonamiento de mensajes históricos en desarrollo iterativo.

## Capacidades

- Generación de texto y razonamiento general en un modelo causal con codificador de visión.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Programación agéntica: flujos de trabajo frontend y razonamiento a nivel de repositorio.
- Razonamiento multi-paso y preservación del contexto de razonamiento entre turnos (Thinking Preservation).
- Capacidades multilingües en código, evidenciadas por el benchmark SWE-bench Multilingual.
- Predicción multi-token (MTP) entrenada en varios pasos, útil para decodificación especulativa.
- Compatibilidad con tool calling y function calling: no confirmada explícitamente en la información disponible, aunque el enfoque agéntico del modelo lo hace probable.
- Soporte de contexto largo: hasta 262 144 tokens nativos y 1 010 000 extensibles.

## Casos de uso

- Resolución automática de incidencias en repositorios: el modelo puede recibir un issue y el árbol del repositorio, razonar sobre dependencias y proponer parches, con un 77,2 en SWE-bench Verified que lo sitúa cerca de agentes propietarios en tareas de reparación real.
- Generación de interfaces frontend: gracias a su especialización en flujos frontend, puede producir componentes y maquetación a partir de descripciones o capturas de pantalla, apoyándose en el codificador de visión.
- Asistente de programación en IDE con contexto de repositorio completo: los 262 144 tokens nativos permiten cargar múltiples ficheros y el historial de conversación sin truncamiento agresivo.
- Desarrollo iterativo con memoria de razonamiento: la opción Thinking Preservation reduce la sobrecarga de repetir el contexto de razonamiento en sesiones largas de depuración.
- Análisis de documentación técnica con imágenes: al ser image-text-to-text, puede interpretar diagramas de arquitectura, capturas de errores o esquemas junto al texto correspondiente.
- Migración y refactorización multilingüe: el rendimiento en SWE-bench Multilingual (69,3) lo hace adecuado para tareas que cruzan lenguajes de programación dentro de un mismo proyecto.
- Automatización de revisión de código en CI/CD: integrable mediante vLLM o SGLang para generar revisiones y sugerencias sobre diffs en pipelines de integración continua.
- Procesamiento de bases de código extensas: la extensión de contexto hasta 1 010 000 tokens permite analizar monorepos completos en una sola pasada, sujeto a la memoria disponible.

## Benchmarks y rendimiento

Resultados publicados en la model card (categoría Coding Agent):

| Benchmark | Qwen3.5-27B | Qwen3.5-397B-A17B | Gemma4-31B | Claude 4.5 Opus | Qwen3.6-35B-A3B | Qwen3.6-27B |
|---|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 76,2 | 52,0 | 80,9 | 73,4 | 77,2 |
| SWE-bench Pro | 51,2 | 50,9 | 35,7 | 57,1 | 49,5 | 53,5 |
| SWE-bench Multilingual | 69,3 | 69,3 | 51,7 | 77,5 | 67,2 | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16): aproximadamente 56 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un nodo con 80 GB o más.
- GPU recomendadas para BF16: H100 80 GB, A100 80 GB, o múltiples A100 40 GB / RTX 4090 con paralelismo de tensor.
- En consumer GPU: no cabe en una única RTX 4090 (24 GB) en BF16; requiere cuantización (no se especifican los formatos soportados en la información disponible) o reparto entre varias GPU.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, según la model card.
- Latencia y throughput: no disponibles en la información proporcionada. La predicción multi-token (MTP) entrenada en varios pasos puede aprovecharse para decodificación especulativa y mejorar el throughput.
- El tamaño del repositorio es de 270,8 GB, lo que incluye pesos y artefactos asociados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B | 27B | 262 144 (ext. 1 010 000) | 77,2 | Apache 2.0 | Pesos abiertos |
| Qwen3.5-27B | 27B | No disponible | 75,0 | No disponible | Pesos abiertos |
| Gemma4-31B | 31B | No disponible | 52,0 | No disponible | Pesos abiertos |
| Qwen3.6-35B-A3B | 35B totales (3B activos, MoE) | No disponible | 73,4 | No disponible | Pesos abiertos |
| Claude 4.5 Opus | No disponible | No disponible | 80,9 | Propietaria | Solo API |

Frente a Qwen3.5-27B, el salto es de +2,2 puntos en SWE-bench Verified y +2,3 en SWE-bench Pro. Frente a Qwen3.6-35B-A3B, el modelo denso de 27B supera al MoE de 35B en las tres métricas de código. La brecha con Claude 4.5 Opus se reduce a 3,7 puntos en SWE-bench Verified y 3,6 en SWE-bench Pro, con la ventaja de ser desplegable localmente.

## Limitaciones y advertencias

- El checkpoint referenciado es una publicación de un tercero (`ceselder`) sobre los pesos de Qwen3.6-27B; no es una versión oficial del equipo Qwen y no cuenta con validación independiente publicada.
- No se especifican sesgos conocidos en la información disponible; como todo modelo entrenado con datos web a gran escala, es probable que herede sesgos de dichos datos.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de código donde puede producir APIs o firmas inexistentes.
- Idiomas soportados no documentados explícitamente; el soporte multilingüe solo está evidenciado en el contexto de código (SWE-bench Multilingual).
- La licencia Apache 2.0 permite uso comercial, pero el `license_link` apunta al fichero LICENSE de Qwen/Qwen3.6-27B, por lo que conviene verificar los términos exactos del modelo base.
- La extensión de contexto hasta 1 010 000 tokens requiere recursos de memoria considerables y no está garantizado que mantenga la calidad en toda la ventana.
- No hay datos publicados de cuantización, latencia ni throughput, lo que dificulta planificar despliegues en producción sin pruebas propias.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ceselder/maemm-27b-rl-from-sft-2m-checkpoint
- Modelo base (referenciado en la licencia): https://huggingface.co/Qwen/Qwen3.6-27B
- Blog oficial de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Qwen Chat: https://chat.qwen.ai
- Logo e imágenes de la model card: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.6/logo.png
- Gráfico de benchmarks: https://qianwen-res.oss-cn-beijing.aliyuncs.com/Qwen3.6/Figures/qwen3.6_27b_score.png
