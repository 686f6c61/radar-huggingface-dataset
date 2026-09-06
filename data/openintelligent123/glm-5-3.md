# Openintelligent123/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala desarrollado por Z.ai (Zhipu AI), lanzado en septiembre de 2026. Se construye sobre la misma base que GLM-5.2, de modo que todas sus mejoras provienen del post-entrenamiento. Está diseñado para destacar en tareas complejas de programación y en tareas de largo horizonte, donde logra resultados de estado del arte entre los modelos de pesos abiertos. La arquitectura es de mezcla de expertos (MoE) con atención dispersa dinámica, identificada como GLM-MoE-DSA, y cuenta con 753.329.940.480 parámetros totales. El contexto soportado alcanza al menos 1.000.000 de tokens, según las notas de evaluación publicadas.

Su relevancia actual radica en que, pese a mantener el mismo preentrenamiento que GLM-5.2, el post-entrenamiento ha producido mejoras sustanciales en codificación (50% más en el benchmark interno de Z.ai) y ha revelado una capacidad emergente de ciberdefensa ofensiva, superando a modelos mucho más grandes en benchmarks como CyberGym y ExploitBench. El modelo se distribuye en formato safetensors con soporte de cuantización FP8 y es compatible con múltiples frameworks de inferencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-MoE-DSA (transformers con mezcla de expertos y atención dispersa dinámica) |
| Parametros totales | 753.329.940.480 (≈753,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (mencionado en notas de evaluación; no especificado oficialmente) |
| Tipos de cuantizacion | FP8 (indicado en tags); no se listan otros en la informacion |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | glm-5.3 (licencia personalizada; consultar términos en el repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3 utiliza la misma base que GLM-5.2, lo que implica que el preentrenamiento es compartido y todas las ganancias provienen del post-entrenamiento. La arquitectura es de tipo transformer con mezcla de expertos y un mecanismo de atención dispersa dinámica, según el nombre de la clase en Transformers (GLM_Moe_DSA). No se han publicado detalles sobre el número de expertos, los parámetros activos, el tamaño del dataset ni la composición del corpus de preentrenamiento. Tampoco se indica si se empleó RLHF o DPO en el post-entrenamiento.

La innovación técnica más destacada es el control del presupuesto de razonamiento mediante el parámetro `reasoning_effort`, que admite tres niveles (`low`, `high`, `max`) y por defecto usa `max`. Además, en el template de chat se introduce `clear_thinking`, que por defecto es `false`; para escenarios conversacionales se recomienda pasarlo explícitamente como `true`. El post-entrenamiento escalado también produjo una capacidad emergente de ciberdefensa ofensiva, con mejoras que se amplifican a lo largo de la cadena de explotación.

## Capacidades

- Generación de texto y razonamiento conversacional, con soporte de pensamiento controlable mediante `reasoning_effort`.
- Codificación de alto nivel: estado del arte entre modelos de pesos abiertos en Terminal Bench 3.0 y Agents' Last Exam (ALE-CLI); 50% de mejora sobre GLM-5.2 en el benchmark interno de Z.ai.
- Tareas de largo horizonte: resolución de issues en repositorios (DeepSWE, FrontierSWE), gestión de terminal (Terminal Bench) y automatización de flujos complejos (SWE-Marathon, AutomationBench).
- Tool calling / function calling: soportado, evidenciado por resultados en Toolathlon Verified y AutomationBench, y por la integración con frameworks de agentes.
- Capacidades multilingües en inglés y chino.
- Capacidad de ciberdefensa ofensiva: descubrimiento de vulnerabilidades (CyberGym) y explotación (ExploitBench, ExploitGym), con resultados de estado del arte en CyberGym.
- Compatible con despliegue en SGLang, vLLM, Transformers, KTransformers, Unsloth, TokenSpeed y plataformas Ascend NPU.

## Casos de uso

- Desarrollo de software automatizado: el modelo puede resolver issues de repositorios (DeepSWE, FrontierSWE) y generar parches. Se integraría en un pipeline de CI/CD como agente que analiza código, propone cambios y crea pull requests.
- Agentes de terminal y administración de sistemas: gracias a su rendimiento en Terminal Bench, puede ejecutar comandos, gestionar servidores y completar tareas de mantenimiento de largo horizonte con contexto de hasta 1 millón de tokens.
- Automatización de flujos de trabajo con herramientas: con soporte de tool calling, puede orquestar llamadas a APIs, integrar servicios externos y ejecutar procesos de negocio de varios pasos, como muestra AutomationBench.
- Auditoría y ciberseguridad ofensiva: el modelo destaca en descubrimiento de vulnerabilidades (CyberGym) y en benchmarks de explotación. Es útil para análisis estático de código, revisión de seguridad y pruebas de penetración en entornos controlados.
- Asistente de programación en entornos de desarrollo: puede refactorizar código, explicar fragmentos complejos y generar soluciones para problemas algorítmicos. El ajuste de `reasoning_effort` permite equilibrar coste computacional y calidad en tareas simples.
- Investigación en evaluación de agentes: al ser un modelo de pesos abiertos con resultados sólidos en benchmarks de largo horizonte, es un candidato para estudios de capacidades de agentes, razonamiento multi-paso y comparación de modelos.
- Asistente conversacional bilingüe: para aplicaciones de chat en inglés y chino, con control explícito de `clear_thinking` para obtener respuestas limpias sin el texto de razonamiento.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks centrada en codificación, agentes y ciberdefensa. No se proporcionan resultados de MMLU, HumanEval ni GSM8K.

| Benchmark                    | GLM-5.3   | GLM-5.2 | Kimi K3  | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol   |
|------------------------------|-----------|---------|----------|----------------------|-------------|----------|-----------------------|---------------|
| Terminal Bench 2.1           | 88.2      | 81.0    | 88.3     | 87.9                 | 86.6        | 85.0     | 88.0                  | **88.8**      |
| Terminal Bench 3.0           | 28.3      | 4.6     | 17.4     | –                    | –           | 21.1     | 33.7                  | **34.6**      |
| DeepSWE (v1.1)               | 66.9      | 46.2    | 67.5     | 62.7                 | 56.6        | 58.0     | 69.7                  | **72.7**      |
| NL2Repo                      | 58.0      | 48.9    | 58.0     | 61.1                 | 55.9        | **69.7** | –                     | –             |
| ProgramBench (Almost Solved) | 19.0      | 9.5     | 17.5     | –                    | 10.5        | 15.5     | **33.0**              | 23.0          |
| FrontierSWE                  | 78.1      | 67.5    | –        | –                    | –           | 66.5     | **88.2**              | –             |
| SWE-Marathon (v1.1)          | 42.5      | 19.4    | 48.1     | –                    | –           | **48.8** | 33.1                  | 42.5          |
| PostTrainBench               | 39.8      | 31.7    | 32.0     | –                    | –           | 32.9     | **41.8**              | 36.2          |
| CyberGym                     | **84.5**  | 77.2    | 80.0     | 83.3                 | 78.5        | 78.1     | 83.8                  | 83.6          |
| ExploitGym (2h / 6h)         | 105 / 130 | 29 / 39 | 36 / 70  | –                    | 14 / 26     | 80 / 120 | 181 / 247             | **216 / 293** |
| ExploitBench                 | 54.4      | 24.4    | 32.2     | –                    | 28.8        | 40.0     | **78.0**              | 76.5          |
| Toolathlon Verified          | 73.0      | 59.9    | **76.5** | 74.1                 | 72.5        | 76.2     | 74.7                  | 74.9          |
| AutomationBench (v1.0.6)     | **48.2**  | 26.2    | 46.7     | 43.2                 | 39.8        | 41.0     | 46.2                  | 45.8          |
| Agents' Last Exam (ALE-CLI)  | 28.5      | 23.8    | 27.6     | 25.7                 | 27.0        | 25.7     | 23.8                  | **28.6**      |
| HLE w/ Tools                 | 62.5      | 54.7    | 59.8     | 60.0                 | 56.2        | 57.9     | 63.9                  | **64.5**      |
| GDPval-AA v2                 | **1769**  | 1508    | 1682     | 1590                 | 1739        | 1588     | 1743                  | 1730          |

## Requisitos de hardware

- No se han publicado requisitos oficiales de VRAM ni de GPU.
- Dado el tamaño de 753,3 mil millones de parámetros, la carga completa en FP8 requeriría aproximadamente 753 GB de memoria. Esto implica que no cabe en una GPU de consumo (por ejemplo, RTX 4090 con 24 GB) y se necesitan múltiples GPUs de centro de datos o una configuración de memoria distribuida.
- Se estima que en cuantización de 4 bits se necesitarían alrededor de 376 GB de memoria, asumiendo que todos los parámetros se mantienen en memoria.
- Opciones de despliegue disponibles: SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth, y frameworks compatibles con Ascend NPU (vLLM-Ascend, xLLM, SGLang).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La siguiente tabla compara GLM-5.3 con GLM-5.2, Kimi K3 y DeepSeek-V4 Pro-0813 en benchmarks clave. No se dispone de especificaciones de parámetros, contexto ni licencia para los modelos competidores en la información proporcionada.

| Modelo | Terminal Bench 3.0 | DeepSWE | CyberGym | ExploitBench | Parametros totales | Contexto | Licencia |
|---|---|---|---|---|---|---|---|
| GLM-5.3 | 28.3 | 66.9 | **84.5** | 54.4 | 753.33B | hasta 1M (no oficial) | glm-5.3 |
| GLM-5.2 | 4.6 | 46.2 | 77.2 | 24.4 | no disponible | no disponible | no disponible |
| Kimi K3 | 17.4 | 67.5 | 80.0 | 32.2 | no disponible | no disponible | no disponible |
| DeepSeek-V4 Pro-0813 | – | 62.7 | 83.3 | – | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos: no se han documentado evaluaciones de sesgo en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se publican métricas de alucinación.
- Limitaciones de idioma: solo soporta inglés y chino; no se documenta soporte para otros idiomas.
- Licencia: la licencia `glm-5.3` es personalizada y no estándar; es necesario revisar los términos completos antes de cualquier uso comercial.
- Capacidades de ciberdefensa: el modelo puede generar exploits y realizar descubrimiento de vulnerabilidades de forma avanzada; su despliegue debe ser regulado y supervisado.
- Coste computacional: `reasoning_effort` por defecto es `max`, lo que puede resultar en un consumo elevado de tokens de salida y cómputo. Para tareas sencillas conviene usar `low` o `high`.
- En escenarios de chat, `clear_thinking` debe pasarse explícitamente como `true`; de lo contrario, el texto de razonamiento se incluye en la respuesta.
- Despliegue complejo: el peso del modelo (755,7 GB en safetensors) exige infraestructura de múltiples GPUs o servidores con gran cantidad de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Openintelligent123/GLM-5.3
- Blog oficial de Z.ai: https://z.ai/blog/glm-5.3
- OpenLM.ai: https://openlm.ai/glm-5.3/
- Repositorio GitHub: https://github.com/zai-org/GLM-5
- Paper (arXiv): https://arxiv.org/abs/2602.15763
- Documentación de Transformers para GLM-MoE-DSA: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.3
- Cookbook de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guía de Unsloth: https://unsloth.ai/docs/models/GLM-5.3
- Despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
