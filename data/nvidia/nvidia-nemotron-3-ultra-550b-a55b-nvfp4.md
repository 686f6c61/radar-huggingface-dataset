# nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4

## Resumen

NVIDIA Nemotron-3-Ultra-550B-A55B-NVFP4 es el modelo más grande y capaz de la familia Nemotron 3, desarrollado por NVIDIA Corporation entre diciembre de 2025 y abril de 2026. Se trata de un modelo de lenguaje de escala frontera diseñado para cargas de trabajo exigentes: razonamiento complejo multi-paso, flujos de agente prolongados, análisis de contexto largo y uso de herramientas. Está optimizado para tareas de código, matemáticas y ciencia, y genera primero una traza de razonamiento antes de emitir la respuesta final, con un modo de razonamiento configurable mediante la plantilla de chat.

Arquitectónicamente emplea un diseño híbrido Latent Mixture-of-Experts (LatentMoE) que combina capas Mamba-2, MoE y capas de atención selectivas, junto con capas de Multi-Token Prediction (MTP) para acelerar la generación y mejorar la calidad. El modelo tiene 550 mil millones de parámetros totales con 55 mil millones activos por token, una ventana de contexto de hasta 1 millón de tokens y fue pre-entrenado íntegramente en NVFP4 para maximizar la eficiencia computacional. Está disponible bajo la licencia OpenMDW-1.1 y permite uso comercial y no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE híbrida: Mamba-2 + MoE + Attention, con Multi-Token Prediction (MTP) |
| Parametros totales | 550B (335B en el checkpoint NVFP4 safetensors) |
| Parametros activos | 55B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (pre-entrenado); disponible también en BF16 |
| Idiomas soportados | Inglés, francés, español, italiano, alemán, japonés, coreano, hindi, portugués brasileño y chino (los tags de HuggingFace añaden hebreo y árabe) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (repo de 704.7 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida LatentMixture-of-Experts (LatentMoE) que intercala capas Mamba-2 (modelos de espacio de estados), capas MoE y capas de atención selectivas. Este diseño híbrido busca combinar la eficiencia de Mamba-2 en secuencias largas con la capacidad de razonamiento de los transformers densos, reduciendo el coste computacional al activar solo 55B de los 550B parámetros por token. Además, incorpora capas de Multi-Token Prediction (MTP) que predicen varios tokens a la vez, lo que acelera la generación y mejora la calidad de las respuestas.

El entrenamiento se realizó en dos fases: pre-entrenamiento con datos con corte en septiembre de 2025 y post-entrenamiento con datos con corte en mayo de 2026. NVIDIA ha publicado tanto los datasets de pre-entrenamiento como los de post-entrenamiento (nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3). Una innovación destacable es que el modelo fue pre-entrenado directamente en NVFP4, un formato de precisión de 4 bits de punto flotante, en lugar de entrenar en BF16 y cuantizar después, lo que maximiza la eficiencia computacional durante el entrenamiento. El modo de razonamiento puede activarse o desactivarse mediante la plantilla de chat (`enable_thinking=True/False`).

## Capacidades

- Razonamiento avanzado multi-paso en código, matemáticas y ciencia, con generación de trazas de razonamiento antes de la respuesta final.
- Modo de razonamiento configurable: se puede activar o desactivar mediante la plantilla de chat, permitiendo elegir entre respuestas rápidas o razonadas.
- Capacidades de agente complejas: soporta flujos multi-step, uso de herramientas y orquestación de tareas prolongadas.
- Análisis de contexto largo: ventana de hasta 1M tokens, adecuada para RAG de alto riesgo y análisis de documentos extensos.
- Capacidades multilingües: 10 idiomas principales (inglés, francés, español, italiano, alemán, japonés, coreano, hindi, portugués brasileño y chino), con soporte adicional de hebreo y árabe según los tags del repositorio.
- Tool calling y function calling: integrable en pipelines de agentes para ejecución de acciones y consulta de APIs.
- Generación de texto conversacional y asistencia en tareas de productividad.

## Casos de uso

- Orquestación de agentes complejos: el modelo puede coordinar múltiples sub-agentes y ejecutar flujos de trabajo multi-paso en entornos empresariales, gracias a sus 55B parámetros activos y su capacidad de razonamiento extendido.
- Análisis de documentos extensos y RAG de alto riesgo: su ventana de 1M tokens permite procesar contratos, informes financieros o expedientes completos en una sola pasada, con recuperación de información precisa.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o corrección de bugs, con resultados competitivos en SWE-Bench Verified (70.7 en BF16).
- Investigación científica y matemática: resolución de problemas complejos de matemáticas y física, así como asistencia en la redacción de artículos técnicos y revisión de literatura.
- Atención al cliente multilingüe automatizada: gestión de conversaciones multi-turno en 10 idiomas con contexto largo, manteniendo coherencia en interacciones prolongadas.
- Deep research y análisis de mercado: el modelo puede sintetizar información de múltiples fuentes, razonar sobre ella y generar informes estructurados, como reflejan los resultados en ProfBench (Search) con 56.4 en NVFP4.
- Desarrollo de asistentes de razonamiento para banca y telecomunicaciones: aunque los resultados en TauBench Banking son bajos (19.2 en NVFP4), el modelo muestra buen rendimiento en retail y telecomunicaciones (88.4 y 93.6 respectivamente), siendo viable para automatización de procesos en esos sectores.

## Benchmarks y rendimiento

La model card publica resultados de benchmarks agentic comparando la versión BF16 con la NVFP4. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

| Benchmark | Nemotron 3 Ultra BF16 | Nemotron 3 Ultra NVFP4 |
|---|---|---|
| Terminal Bench 2.1 | 56.4 | 53.9 |
| GDPVal | 46.7 | 47.9 |
| SWE-Bench Verified | 70.7 | 69.5 |
| SWE-Bench Multilingual | 67.7 | 69.1 |
| ProfBench (Search) | 56.0 | 56.4 |
| PinchBench | 90.0 | 89.8 |
| TauBench V3 Airline | 81.5 | 80.0 |
| TauBench V3 Retail | 86.4 | 88.4 |
| TauBench V3 Telecom | 92.9 | 93.6 |
| TauBench V3 Banking | 22.6 | 19.2 |

La versión NVFP4 mantiene un rendimiento muy cercano a la BF16 en la mayoría de benchmarks, con pérdidas inferiores a 3 puntos en Terminal Bench y SWE-Bench Verified, e incluso mejora en GDPVal, SWE-Bench Multilingual, ProfBench, Retail y Telecom.

## Requisitos de hardware

- VRAM mínima: no especificada oficialmente, pero el checkpoint NVFP4 safetensors ocupa 704.7 GB en disco, por lo que se requiere hardware de data center con múltiples GPUs.
- GPUs mínimas recomendadas por NVIDIA: 4xGB200, 4xB200, 4xGB300, 4xB300 u 8xH100.
- No cabe en GPUs de consumo (RTX 4090, RTX 5090, etc.) ni en estaciones de trabajo convencionales.
- Opciones de despliegue: disponible a través de NVIDIA NIM (build.nvidia.com), compatible con endpoints de SageMaker y Azure, y con la librería transformers.
- Latencia y throughput: no se han publicado datos concretos; el uso de MTP y la cuantización NVFP4 reducen el coste por token frente a un modelo denso equivalente, pero la latencia exacta depende del hardware y del backend de inferencia.

## Comparativa con modelos similares

No se han publicado en la información proporcionada comparativas directas con otros modelos de la misma categoría. El modelo compite con otros LLMs de escala frontera como GPT-5, Claude Opus 4, Gemini 2.5 Pro o Llama 4 Maverick, pero no hay datos de benchmarks comparables en la documentación disponible. Como referencia cualitativa:

- Frente a Llama 4 Maverick (400B totales, 17B activos), Nemotron 3 Ultra ofrece más parámetros activos (55B) y una ventana de contexto mayor (1M frente a 1M, similar), con arquitectura híbrida Mamba-2.
- Frente a DeepSeek V3 (671B totales, 37B activos), Nemotron 3 Ultra tiene menos parámetros totales pero más activos, y una ventana de contexto superior.
- La licencia OpenMDW-1.1 es más permisiva que las de algunos competidores, permitiendo uso comercial.

## Limitaciones y advertencias

- Requiere hardware de data center de gama alta (mínimo 8xH100 o 4xGB200), lo que limita su uso a organizaciones con infraestructura de cómputo avanzada.
- El rendimiento en ciertos dominios verticales es irregular: TauBench Banking muestra resultados bajos (19.2 en NVFP4), lo que sugiere que no es fiable para tareas financieras complejas sin fine-tuning adicional.
- La cuantización NVFP4 introduce una ligera degradación en algunos benchmarks (Terminal Bench 2.1 baja de 56.4 a 53.9), aunque en otros mejora ligeramente.
- El modelo puede generar alucinaciones, especialmente en tareas de razonamiento abierto o con datos de baja calidad; se recomienda validación humana en aplicaciones de alto riesgo.
- Los datos de pre-entrenamiento tienen un corte en septiembre de 2025, por lo que no conoce eventos posteriores a esa fecha.
- La licencia OpenMDW-1.1 tiene términos específicos que deben revisarse antes del uso comercial; aunque permite uso comercial y no comercial, pueden existir restricciones sobre redistribución o uso en ciertos sectores.
- El modo de razonamiento activado por defecto aumenta la latencia y el coste computacional; debe desactivarse cuando no sea necesario.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4
- Página de investigación Nemotron 3 Ultra: https://research.nvidia.com/labs/nemotron/Nemotron-3-Ultra/
- Informe técnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf
- Página de la familia Nemotron 3: https://research.nvidia.com/labs/nemotron/Nemotron-3/
- NVIDIA NIM (chat y despliegue): https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Colección de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Colección de datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
