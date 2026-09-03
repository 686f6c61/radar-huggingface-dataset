# canada-quant/glm-5.3-w4a16-mtp

## Resumen

GLM-5.3-Flash W4A16 MTP es una cuantización INT4 weight-only del modelo GLM-5.3-Flash de Zhipu AI (zai-org), publicada por Canada Quant Labs. El artefacto reduce el footprint de pesos de ~599 GiB en BF16 a 177,7 GiB (−70%), lo que permite servir el modelo en cuatro GPUs de datacenter (H100/H200) o en un par de DGX Spark con contexto completo de 1M tokens. No es un modelo nuevo: todas las capacidades proceden del modelo base, y la cuantización se limita a los GEMMs de los expertos enrutados, manteniendo atención, router, expertos compartidos, embeddings, torre de visión y el cabezal MTP en BF16.

El modelo base es un MoE multimodal (imagen-texto) con 49,9B parámetros totales, contexto nativo de 1.048.576 tokens y soporte para decodificación especulativa mediante un cabezal de predicción multi-token (MTP) conservado en BF16. La relevancia de esta cuantización radica en que permite ejecutar un modelo de esta escala con calidad cercana a FP8 en hardware significativamente más reducido, con mejoras de throughput de hasta +101% frente a la alternativa NVFP4 en configuraciones de 2× DGX Spark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con atención sparse, multimodal (imagen + texto) |
| Parametros totales | 49.913.588.606 (~49,9B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | W4A16 (INT4 weight-only, GPTQ, simétrico, grupo-128) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La cuantización W4A16 de Canada Quant Labs aplica GPTQ simétrico con grupo-128 únicamente a los 36.288 GEMMs de los expertos enrutados del MoE. El resto de componentes — atención, router, expertos compartidos, embeddings, torre de visión BF16 y el cabezal MTP (multi-token prediction) en BF16 — permanecen sin cuantizar, con los parámetros FP32 canónicos preservados. Esta estrategia mantiene la calidad en las partes sensibles del modelo mientras reduce el peso dominante (los expertos enrutados) a INT4.

El cabezal MTP en BF16 permite decodificación especulativa con una tasa de aceptación del 52–55%, lo que se traduce en ganancias de throughput de hasta +14% frente a configuraciones NVFP4 con MTP N=5 en H100. El modelo base GLM-5.3-Flash es un MoE con atención sparse (DeepSeek Sparse Attention, según los tags del ecosistema) y capacidades multimodales, aunque no se dispone de información detallada sobre su entrenamiento (número de tokens, composición del dataset o uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento avanzado, con resultados de 85,0% en AIME 2026 (102/120) en configuraciones de máxima reflexión.
- Comprensión de imágenes (pipeline image-text-to-text), con torre de visión BF16 sin cuantizar.
- Razonamiento matemático: GSM8K 0,97, en paridad con el baseline FP8.
- Decodificación especulativa mediante MTP (multi-token prediction) con cabezal BF16, acelerando la generación entre un 40–50% en flujo de un solo stream.
- Contexto largo de 1M tokens, con soporte para prompts de 256K tokens y generación sostenida a ~31 tok/s en 2× DGX Spark.
- Multilingüe: inglés y chino.
- Compatible con vLLM y el stack DFlash2 para despliegue en hardware Blackwell y Hopper.

## Casos de uso

- Razonamiento matemático y resolución de problemas complejos: con 85% en AIME 2026, el modelo puede emplearse en entornos de investigación que requieran razonamiento simbólico y verificación de demostraciones, aprovechando el presupuesto de 131K tokens de reflexión.
- Análisis de documentos extensos: la ventana de 1M tokens permite procesar libros técnicos completos, expedientes legales o informes financieros de cientos de páginas en una sola pasada, sin necesidad de chunking ni RAG.
- Asistentes multimodales en industrias reguladas: la combinación de visión y texto, junto con la licencia MIT, facilita su uso en sectores como legal, médico o financiero donde Canada Quant Labs orienta sus modelos, siempre que se validen los resultados.
- Despliegue en estaciones de trabajo de gama alta: con 2× DGX Spark (128 GB UMA cada uno) se puede servir el modelo a contexto completo de 1M tokens, habilitando prototipado local sin depender de clústeres cloud.
- Generación de código y asistencia a desarrolladores: aunque no se reportan benchmarks específicos de código, el modelo base GLM-5.3 es conversacional y multilingüe, apto para integración en IDEs y pipelines de CI/CD con tool calling.
- Evaluación de cuantizaciones en producción: sirve como referencia para comparar el impacto de W4A16 frente a NVFP4 o FP8 en calidad y throughput, útil para equipos que deciden estrategias de despliegue eficiente.

## Benchmarks y rendimiento

La model card reporta mediciones en stacks de serving reales, comparando contra la cuantización NVFP4 de LibertAIDAI. Resultados a 2026-09-02:

| Benchmark | W4A16 MTP (este) | NVFP4 MTP | Delta |
|---|---|---|---|
| AIME 2026 (n=120, 2× DGX Spark) | 85,0% (102/120) | 90,0% (referencia externa) | −5,0 puntos |
| GSM8K | 0,97 | — | paridad con FP8 |
| Throughput H100 TP=4, c=1 (tok/s) | 183,89 | 180,96 | +1,6% |
| Throughput H100 TP=4, c=8 (tok/s) | 249,94 | 251,14 | −0,5% |
| Throughput H100 TP=4, c=32 (tok/s) | 1161,13 | 1018,13 | +14,0% |
| Throughput 2× DGX Spark, seq1 @262K (tok/s) | 33,29 | 21,8 | +53% |
| Throughput 2× DGX Spark, seq6 @262K (tok/s) | 121,81 | 60,5 | +101% |
| MTP acceptance | 52–55% | ~52% (N=2) / ~30% (N=5) | — |

En RTX PRO 6000 (TP=4), el rendimiento está en paridad con NVFP4 (±0,7%). El checkpoint NVFP4 de LibertAIDAI no pudo arrancar en 2× DGX Spark (OOM en 9/9 intentos), mientras que W4A16 sirve a 1M de contexto en esa configuración.

## Requisitos de hardware

- Peso del modelo: 177,7 GiB en W4A16 (frente a ~599 GiB en BF16).
- 4× H100/H200 (80 GB, SM90) con TP=4: contexto 262K con KV en BF16, receta validada en benchmarks.
- 2× H200 (141 GB, SM90) con TP=2: contexto ~64–128K con KV en FP8 (estimación por ajuste, no medida).
- 4× RTX PRO 6000 (96 GB, SM120) con TP=4: contexto 262K con KV en FP8, validado.
- 2× DGX Spark GB10 (128 GB UMA, SM121) con TP=2: contexto 1M con KV en FP8, usando el stack DFlash2.
- 8× B300 (SM103): nodo de cuantización, probado con transformers.
- Opciones de despliegue: vLLM (con `--gpu-memory-utilization` ajustable para KV pool), DFlash2 para DGX Spark, transformers para integración directa.
- Latencia y throughput: en 2× DGX Spark, 30,85 tok/s de decodificación con un prompt de 256K tokens (TTFT 5,8 s); en H100 TP=4, hasta 1161 tok/s agregados con concurrencia 32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash W4A16 MTP (este) | 49,9B totales | 1M | W4A16 INT4 + MTP BF16 | MIT | Sirve en 4× H100 o 2× DGX Spark |
| GLM-5.3-Flash NVFP4 (LibertAIDAI) | 49,9B totales | 1M (teórico) | NVFP4 | MIT | OOM en 2× DGX Spark; mejor AIME 2026 (90%) |
| GLM-5.3-Flash BF16 (zai-org) | 49,9B totales | 1M | BF16 | MIT | Requiere 8× 80 GB; referencia de calidad |
| GLM-5.2 W4A16 MTP (Canada Quant Labs) | 744B totales, ~40B activos | 1M | W4A16 + MTP BF16 | MIT | Modelo anterior, misma estrategia de cuantización |

La comparativa directa con NVFP4 muestra que W4A16 gana en throughput en la mayoría de configuraciones y es la única opción viable en 2× DGX Spark a contexto completo, aunque NVFP4 mantiene una ventaja de 5 puntos en AIME 2026.

## Limitaciones y advertencias

- Es una cuantización, no un modelo nuevo: todas las capacidades y limitaciones provienen del modelo base GLM-5.3-Flash.
- Idiomas limitados a inglés y chino; no se garantiza calidad en otros idiomas.
- La ventaja de throughput en H100 a c=32 requiere ajustar `--gpu-memory-utilization` a 0,92; sin ese ajuste, el rendimiento cae a 689 tok/s (inferior a NVFP4).
- En RTX PRO 6000, AIME 2025 muestra un déficit de ~2σ frente a NVFP4, atribuido en ~63% a limitaciones de presupuesto de tokens y ~37% a diferencias numéricas de kernels.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; no se reportan evaluaciones de seguridad específicas.
- El despliegue en 2× DGX Spark requiere el stack DFlash2, que no es estándar en vLLM; la configuración de KV pool es crítica para evitar OOM.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario es responsable del cumplimiento normativo en sectores regulados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/canada-quant/glm-5.3-w4a16-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Perfil de Canada Quant Labs en HuggingFace: https://huggingface.co/canada-quant/models
- GitHub de Canada Quant Labs: https://github.com/canada-quant
- Página de modelos de Canada Quant Labs: https://cql.ca/models.html
- Artículo sobre GLM-5.2 W4A16 MTP: https://cql.ca/news/glm-5-2-w4a16-mtp.html
- Cuantización NVFP4 de referencia (LibertAIDAI): https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Receta EXL3 para 2× DGX Spark (MiaAI-Lab): https://github.com/MiaAI-Lab/GLM-5.3-Flash-EXL3-2x-DGX-Sparks
