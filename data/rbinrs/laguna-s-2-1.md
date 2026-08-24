# rbinrs/Laguna-S-2.1

## Resumen

Laguna S 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por poolside, con 118 mil millones de parámetros totales y aproximadamente 8 mil millones de parámetros activos por token. Está diseñado específicamente para tareas de codificación agéntica y trabajo de larga duración (long-horizon), donde un agente debe mantener razonamiento y ejecutar múltiples pasos de forma autónoma. Se sitúa en la familia Laguna entre el modelo XS 2.1 (33B-A3B) y el M.1 (225B-A23B), compartiendo la misma receta arquitectónica.

El modelo destaca por su ventana de contexto de 1.048.576 tokens (1M), lo que permite procesar repositorios completos o conversaciones muy extensas. Incorpora razonamiento intercalado entre llamadas a herramientas, con control por petición mediante `enable_thinking`, y soporta decodificación especulativa mediante un modelo borrador DFlash entrenado específicamente. Se distribuye bajo la licencia OpenMDW-1.1, totalmente permisiva para uso comercial y modificación.

La relevancia actual de Laguna S 2.1 radica en que ofrece capacidades de nivel frontier en benchmarks de ingeniería de software (SWE-bench, Terminal-Bench) con un coste de inferencia reducido gracias a su arquitectura MoE con solo 8B parámetros activos, y con una licencia abierta que permite su despliegue en producción sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 256 expertos enrutados (top-10) + 1 experto compartido, atención grouped-query (8 cabezas KV, head dim 128), atención global y sliding-window intercalada (proporción 1:3, ventana 512) |
| Parametros totales | 117.561.977.600 (118B) |
| Parametros activos | ~8B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8, NVFP4, INT4, GGUF (disponibles como variantes oficiales) |
| Idiomas soportados | No disponible (el tokenizador de la familia Laguna tiene 100.352 tokens; no se especifica lista de idiomas) |
| Licencia | OpenMDW-1.1 (permisiva, uso comercial y modificación permitidos) |
| Formato de pesos | safetensors (también GGUF, FP8, NVFP4, INT4) |

## Arquitectura y entrenamiento

Laguna S 2.1 utiliza una arquitectura MoE con enrutamiento por token (token-choice) y gating softplus. Dispone de 256 expertos enrutados de los que se activan los 10 mejores por token, más un experto compartido adicional. La atención es grouped-query con 8 cabezas KV y dimensión de cabeza 128, con gating de salida softplus por cabeza. La disposición de capas es de 48 en total: 12 capas de atención global y 36 capas de atención sliding-window con ventana de 512 tokens, en proporción 1:3. Se aplican escalas rotatorias (rotary) diferentes según el tipo de capa.

El modelo soporta razonamiento nativo intercalado entre llamadas a herramientas, con preservación del pensamiento (thinking) y control por petición. Para reducir la latencia en producción, se ha entrenado un modelo borrador DFlash específico que permite decodificación especulativa con vLLM. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento de propósito general, con énfasis en tareas de codificación y resolución de problemas de software.
- Razonamiento intercalado (interleaved thinking) entre llamadas a herramientas, con preservación del pensamiento y control por petición (`enable_thinking`).
- Soporte nativo de tool calling y function calling, con parser específico `poolside_v1` en vLLM y SGLang.
- Capacidades agénticas: puede mantener múltiples pasos de razonamiento y ejecutar acciones de forma autónoma en entornos de larga duración.
- Ventana de contexto de 1M tokens, adecuada para repositorios completos, documentación extensa o historiales de conversación muy largos.
- Capacidades multilingües: no se especifican idiomas concretos, pero el tokenizador de la familia Laguna tiene un vocabulario de 100.352 tokens, lo que sugiere soporte multilingüe amplio.
- Decodificación especulativa mediante modelo borrador DFlash para reducir latencia.

## Casos de uso

- Desarrollo de software agéntico: el modelo puede actuar como agente autónomo que navega por un repositorio, comprende el código existente, propone cambios y ejecuta pruebas, gracias a su ventana de 1M tokens y su razonamiento intercalado con tool calling.
- Resolución de issues en repositorios open source: con su rendimiento en SWE-bench Multilingual (78.5%), puede analizar issues, localizar el código relevante y generar parches correctos, integrándose en pipelines de CI/CD.
- Asistente de programación con contexto de proyecto completo: al poder procesar hasta 1M tokens, puede mantener el contexto de un proyecto entero en memoria, ofreciendo respuestas más precisas que modelos con ventanas más cortas.
- Automatización de tareas de mantenimiento de código: refactorización, detección de bugs, generación de documentación y tests, aprovechando su capacidad de razonamiento largo y su conocimiento de múltiples lenguajes.
- Agentes de análisis de codebase: puede responder preguntas sobre la arquitectura de un proyecto, localizar dependencias y explicar flujos de datos, como muestra su resultado en SWE Atlas (Codebase QnA) del 46.2%.
- Despliegue de asistentes conversacionales con herramientas: gracias a su soporte de tool calling y su licencia permisiva, puede integrarse en productos comerciales de atención al cliente o asistentes técnicos que necesiten consultar bases de conocimiento o APIs externas.

## Benchmarks y rendimiento

La model card oficial reporta los siguientes resultados (fecha de evaluación: 21 de julio de 2026). Los valores marcados con * son reportados por terceros (Artificial Analysis, Scale AI, leaderboards oficiales).

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | **70.2%** | **78.5%** | **59.4%** | **40.4%** | **46.2%** | **49.7%** |
| Tencent Hy3 | 295B-A21B | 71.7% | 75.8% | 57.9% | - | - | - |
| Inkling | 975B-A41B | 63.8% | - | 54.3% | - | - | 45.5%* |
| Nemotron 3 Ultra | 550B-A55B | 56.4% | 67.7% | - | - | - | 34.3%* |
| DeepSeek-V4-Pro Max | 1.6T-A49B | 64.0%* | 76.2% | 55.4% | 9.0%* | 27.2%* | 55.9%* |
| Kimi K3 | 2800B-A50B | 88.3% | - | - | 69% | - | - |
| Qwen 3.7 Max | - | 74.5%* | 78.3% | 60.6% | - | - | - |
| Muse Spark 1.1 | - | 80% | - | 61.5% | 53.3% | 42.2%* | 75.6% |
| Claude Fable 5 | - | 88% | - | 80.3% | 70% | - | - |

Nota: los modelos comparados son los que aparecen en la tabla oficial de poolside. No se dispone de resultados de benchmarks clásicos como MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- El checkpoint BF16 ocupa aproximadamente 236 GB de pesos, por lo que se necesitan múltiples GPUs para inferencia sin cuantizar. Con tensor parallelism de 4, se recomienda al menos 4 GPUs de alta capacidad (por ejemplo, A100 80GB o H100 80GB).
- Las variantes cuantizadas reducen sustancialmente los requisitos: FP8 (~118 GB), NVFP4 (~59 GB) e INT4 (~59 GB) permiten desplegar en configuraciones de 2 GPUs o incluso en una sola GPU de 80 GB con cuantización agresiva.
- La variante GGUF permite ejecución en CPU y GPUs de consumo mediante llama.cpp, aunque con menor rendimiento. En una RTX 4090 (24 GB) solo sería viable con cuantizaciones muy bajas (Q4_K_M o inferiores) y con limitaciones de velocidad.
- Opciones de despliegue soportadas: vLLM, SGLang, Transformers, TRT-LLM y llama.cpp. vLLM es la opción recomendada para producción, con soporte de tool calling y razonamiento mediante los parsers `poolside_v1`.
- Para decodificación especulativa, se puede emparejar con el modelo borrador DFlash, lo que reduce la latencia en entornos de alto throughput.
- No se han publicado cifras concretas de latencia o throughput en la información disponible.

## Comparativa con modelos similares

La comparativa se basa en los datos de la tabla de benchmarks de la model card, que incluye modelos de la misma categoría (MoE grandes para codificación agéntica). No se dispone de información sobre modelos de código abierto comparables en el mismo rango de parámetros activos.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | SWE-bench Multilingual | Terminal-Bench 2.1 |
|---|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B | 8B | 1M | OpenMDW-1.1 (permisiva) | 78.5% | 70.2% |
| Tencent Hy3 | 295B | 21B | No disponible | No disponible | 75.8% | 71.7% |
| DeepSeek-V4-Pro Max | 1.6T | 49B | No disponible | No disponible | 76.2% | 64.0%* |
| Inkling | 975B | 41B | No disponible | No disponible | - | 63.8% |

Laguna S 2.1 ofrece un rendimiento competitivo con un coste de inferencia mucho menor (8B activos frente a 21B o 49B de sus competidores), lo que lo hace especialmente atractivo para despliegues en producción donde la latencia y el coste por token son críticos.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos conocidos, evaluación de seguridad o comportamientos problemáticos en la información disponible. Se recomienda realizar una evaluación específica antes de desplegar en entornos sensibles.
- Como todo modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de generación de código donde puede producir soluciones incorrectas o inseguras. Se recomienda validación humana en flujos críticos.
- La ventana de 1M tokens es amplia, pero el rendimiento en contextos muy largos puede degradarse; no se han publicado estudios específicos sobre la calidad de atención en los extremos de la ventana.
- No se especifican los idiomas soportados. Aunque el tokenizador sugiere multilingüismo, el rendimiento en idiomas distintos del inglés no está documentado.
- La licencia OpenMDW-1.1 es permisiva, pero se recomienda revisar sus términos completos para usos específicos, especialmente en lo relativo a patentes o marcas.
- El modelo requiere hardware sustancial para un despliegue óptimo; las cuantizaciones agresivas pueden afectar al rendimiento en tareas de razonamiento complejo.
- El repositorio de HuggingFace indicado (rbinrs/Laguna-S-2.1) parece ser un mirror o copia; el repositorio oficial es poolside/Laguna-S-2.1. Se recomienda verificar la procedencia de los pesos antes de su uso.

## Enlaces

- Repositorio HuggingFace (oficial): https://huggingface.co/poolside/Laguna-S-2.1
- Repositorio HuggingFace (mirror indicado en la consulta): https://huggingface.co/rbinrs/Laguna-S-2.1
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- Uso en OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Uso en Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Modelo borrador DFlash: https://huggingface.co/poolside/Laguna-S-2.1-DFlash
- Variante FP8: https://huggingface.co/poolside/Laguna-S-2.1-FP8
- Variante NVFP4: https://huggingface.co/poolside/Laguna-S-2.1-NVFP4
- Variante INT4: https://huggingface.co/poolside/Laguna-S-2.1-INT4
- Variante GGUF: https://huggingface.co/poolside/Laguna-S-2.1-GGUF
- Trayectorias de evaluación: https://trajectories.poolside.ai
- Información sobre licencia OpenMDW: https://openmdw.ai/
