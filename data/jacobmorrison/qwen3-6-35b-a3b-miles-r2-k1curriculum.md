# jacobmorrison/qwen3.6-35b-a3b-miles-r2-k1curriculum

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba, publicado como pesos abiertos bajo licencia Apache 2.0. Se trata de la primera variante abierta de la serie Qwen3.6, sucesora de Qwen3.5, y está orientada explícitamente a flujos de trabajo de codificación agéntica, razonamiento a nivel de repositorio y desarrollo iterativo con preservación del contexto de razonamiento. Esta ficha concreta corresponde a la reproducción publicada por el usuario `jacobmorrison` con el sufijo `miles-r2-k1curriculum`, un derivado de los pesos originales.

Arquitectura híbrida de tipo Mixture of Experts (MoE) con 35.107 millones de parámetros totales y aproximadamente 3.000 millones activos por token, combinando capas de atención lineal (Gated DeltaNet) con capas de atención con compuerta (Gated Attention). El modelo soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens, lo que lo sitúa en la categoría de contexto largo.

Su relevancia actual radica en la combinación de una ventana de contexto muy amplia, un coste de inferencia reducido gracias al enrutamiento MoE (solo 8 expertos enrutados más 1 compartido de 256 totales) y un rendimiento destacado en benchmarks de codificación agéntica como SWE-bench Verified (73,4), superando a alternativas de mayor tamaño nominal como Qwen3.5-27B o Gemma4-31B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido con encoder de visión; capas Gated DeltaNet (atención lineal) y Gated Attention, con MoE |
| Parametros totales | 35.107.181.936 |
| Parametros activos | ~3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (repo en safetensors; compatible con vLLM, SGLang, KTransformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo emplea un diseño híbrido de 40 capas organizadas en un patrón de 10 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention, todas ellas intercaladas con capas MoE. La dimensión oculta es de 2048, con un vocabulario de 248.320 tokens (con padding). Las capas de atención lineal usan 32 cabezas para V y 16 para QK con dimensión 128, mientras que las capas de atención con compuerta emplean 16 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. El componente MoE cuenta con 256 expertos de dimensión intermedia 512, activando 8 enrutados más 1 compartido. El modelo incorpora además Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El entrenamiento consta de fases de preentrenamiento y postentrenamiento, e incluye un encoder de visión que habilita la modalidad image-text-to-text. La model card menciona mejoras específicas en codificación agéntica (flujos de frontend y razonamiento a nivel de repositorio) y una funcionalidad de "Thinking Preservation" que permite retener el contexto de razonamiento de mensajes históricos. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 262.144 tokens nativos.
- Comprensión de imágenes (pipeline image-text-to-text) gracias al encoder de visión integrado.
- Codificación agéntica: resolución de tareas a nivel de repositorio, flujos de frontend y razonamiento sobre código.
- Razonamiento iterativo con "Thinking Preservation", que conserva el contexto de razonamiento entre mensajes para desarrollo incremental.
- Multi-Token Prediction (MTP) para acelerar la decodificación.
- Capacidades multilingües: no se especifican los idiomas concretos en la información disponible (existe un benchmark SWE-bench Multilingual con resultado de 67,2).
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: implícito en los benchmarks de SWE-bench y Terminal-Bench.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un repositorio completo y un problema descrito en lenguaje natural, y generar un parche. Su contexto de 262K tokens permite incluir múltiples ficheros relevantes y su rendimiento en SWE-bench Verified (73,4) lo hace adecuado para pipelines de revisión automatizada.
- Asistente de codificación en IDE: integrado vía Transformers, vLLM o SGLang, puede gestionar conversaciones multi-turno con historial largo manteniendo el contexto de razonamiento entre iteraciones gracias a Thinking Preservation.
- Automatización de tareas en terminal: con un resultado de 49,5 en SWE-bench Pro y presencia en Terminal-Bench 2.0, es apto para agentes que ejecutan comandos y corrigen errores de forma iterativa.
- Análisis de documentación técnica con imágenes: al aceptar entradas image-text-to-text, puede procesar diagramas de arquitectura, capturas de pantalla de errores o esquemas junto a texto para generar explicaciones o código.
- Migración y refactorización de código multilingüe: su resultado de 67,2 en SWE-bench Multilingual sugiere utilidad en proyectos con múltiples lenguajes de programación.
- Generación de tests y documentación a partir de bases de código extensas: la ventana de contexto de hasta 1M tokens (extensible) permite procesar monorepos completos en una sola pasada.
- Procesamiento de documentos largos con componentes visuales: informes, contratos o manuales con tablas e imágenes, combinando el encoder de visión con el contexto extendido.

## Benchmarks y rendimiento

Datos extraídos de la model card del modelo original (Qwen3.6-35B-A3B):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la tabla de la model card original estaba truncada en el momento de la consulta; los valores de Terminal-Bench 2.0 no pudieron recuperarse. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 70 GB solo para pesos, más overhead de KV cache; requiere múltiples GPU.
- Cuantización a 8 bits: ~35 GB de pesos, viable en una A100 80GB o H100 80GB.
- Cuantización a 4 bits: ~18-20 GB de pesos, viable en una RTX 4090 (24 GB) o RTX 5090, aunque el contexto largo incrementa sustancialmente la memoria de KV cache.
- GPU recomendadas: H100 80GB, A100 80GB, múltiples RTX 4090/5090 para despliegues en paralelo; el bajo número de parámetros activos (~3B) reduce el coste computacional por token.
- Opciones de despliegue: Transformers, vLLM, SGLang, KTransformers (según la model card). Compatibilidad con llama.cpp u Ollama no confirmada en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B | ~3B | 262K (ext. 1M) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B | 27B (denso) | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B | 31B (denso) | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B | ~4B | no disponible | 17,4 | no disponible |

Qwen3.6-35B-A3B mejora a su predecesor directo (Qwen3.5-35B-A3B) en todos los benchmarks reportados, y supera ampliamente a Gemma4-31B y Gemma4-26B-A4B en tareas de codificación agéntica. Queda por debajo de Qwen3.5-27B en SWE-bench Verified y Multilingual, aunque con un coste de inferencia mucho menor gracias a la activación de solo ~3B parámetros.

## Limitaciones y advertencias

- Repositorio derivado: se trata de una reproducción de `jacobmorrison` con solo 28 descargas y 0 likes; no es el repositorio oficial de Qwen. La fidelidad de los pesos respecto al original no está verificada en la información disponible.
- Idiomas soportados no documentados: no se especifica la cobertura lingüística, lo que dificulta evaluar su idoneidad para producción en castellano u otras lenguas.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, requiere validación en contextos críticos.
- Sesgos: no documentados en la model card.
- La licencia Apache 2.0 permite uso comercial, pero el autor enlaza a la licencia del modelo original de Qwen; conviene verificar la cadena de licencias del derivado.
- El contexto extendido hasta 1M tokens puede degradar la calidad y disparar el consumo de memoria KV cache; no se han publicado evaluaciones específicas en esa longitud.
- La tabla de benchmarks de la model card está incompleta (Terminal-Bench 2.0 truncado), por lo que la comparativa no es exhaustiva.
- No se confirma soporte explícito de tool calling ni de function calling en la información disponible.

## Enlaces

- Repositorio HuggingFace del derivado: https://huggingface.co/jacobmorrison/qwen3.6-35b-a3b-miles-r2-k1curriculum
- Repositorio del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog oficial de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai
