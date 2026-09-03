# eousphoros/qwen3.8-27b-yarn4-mixed-kl-128k-r1-iter137-fp8

## Resumen

Este modelo es un derivado experimental en cuantización FP8 blockwise del checkpoint `eousphoros/qwen3.8-27b-yarn4-mixed-kl-128k-r1-iter137`, que a su vez parte del modelo oficial `Qwen/Qwen3.8-27B` de Alibaba. El objetivo principal es reducir la huella de memoria para inferencia manteniendo el comportamiento del modelo adaptado, que incorpora una extensión de contexto estática mediante YaRN con factor 4.0 sobre la ventana nativa de 262.144 tokens.

La relevancia de este checkpoint radica en que combina tres características demandadas por la comunidad: arquitectura multimodal densa de 27B parámetros, soporte de contexto largo (hasta 1M de tokens en configuraciones de vLLM) y cuantización FP8 nativa para desplegar en una sola GPU de gama alta. El autor, eousphoros, ha realizado una calibración mixta (mixed-KL) sobre textos de Principia, trayectorias agénticas y muestras multimodales antes de la exportación a FP8, buscando minimizar la pérdida de calidad respecto al checkpoint BF16 adaptado.

Es importante destacar que se trata de un checkpoint experimental. La campaña completa de benchmarks de contexto largo (como RULER) no se ha completado para esta versión FP8, aunque se proporcionan métricas detalladas de error de cuantización y divergencia KL frente al modelo BF16 original. El modelo está publicado bajo licencia Apache-2.0 y es compatible con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso (48 capas con atención lineal Gated DeltaNet + 16 capas con atención completa), multimodal (texto, imagen y vídeo) |
| Parametros totales | 27.781.427.952 (~27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos; YaRN estático con factor 4.0 permite configuraciones de hasta 1.048.576 tokens (1M) en vLLM |
| Tipos de cuantizacion | FP8 blockwise (E4M3) con geometría de escala 128x128; tensores de normalización retenidos en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (66 shards, 28,75 GiB de payload de tensores) |

## Arquitectura y entrenamiento

La base es `Qwen/Qwen3.8-27B`, un modelo denso de 64 capas con tamaño oculto de 5.120 y un vocabulario de 248.320 tokens. Su arquitectura es híbrida: 48 de las 64 capas utilizan atención lineal Gated DeltaNet, mientras que las 16 restantes emplean atención completa. Incluye un vision tower de aproximadamente 1B de parámetros y un MTP (Multi-Token Prediction) draft head para decodificación especulativa.

El proceso de adaptación del derivado consistió en dos fases. Primero, se aplicó una calibración mediante LoRA y normalización directa sobre el modelo base, entrenando 32.125.952 parámetros en 225 tensores durante 137 iteraciones (411 microsteps con acumulación de gradiente 3), procesando 7.676.031 tokens de contexto. El entrenamiento utilizó una pérdida mixta KL sobre datos de Principia, trayectorias agénticas y muestras multimodales, con una tasa de aprendizaje de 3e-5. Segundo, se exportó el checkpoint BF16 resultante a FP8 blockwise, recomputando todas las escalas por bloque de 128x128 y verificando la integridad de los tensores BF16 retenidos.

## Capacidades

- Generación de texto, razonamiento complejo, generación de código y resolución de problemas matemáticos.
- Comprensión multimodal: procesa entradas de texto, imagen y vídeo.
- Soporte de tool calling y function calling para integración con APIs externas.
- Capacidades agénticas multi-step con razonamiento encadenado.
- Modo de pensamiento configurable (thinking mode) heredado de la familia Qwen3.8.
- Procesamiento de contexto largo de hasta 1M de tokens mediante YaRN estático.
- Decodificación especulativa gracias al MTP draft head integrado.

## Casos de uso

- Recuperación aumentada por generación (RAG) sobre corpus extensos: la ventana de 262K tokens nativos (extensible a 1M) permite indexar y consultar manuales técnicos, expedientes legales o documentación científica completa en una sola pasada, sin necesidad de chunking agresivo.
- Agentes autónomos de automatización de oficina: el modelo puede gestionar flujos de trabajo que implican leer documentos, extraer datos, llamar a herramientas externas y generar informes, gracias a su soporte nativo de tool calling y razonamiento multi-step.
- Análisis de vídeo e imagen con contexto largo: al ser multimodal, puede analizar secuencias de vídeo o conjuntos de imágenes junto con transcripciones extensas, manteniendo coherencia temporal gracias a la ventana ampliada.
- Generación de código en producción: la cuantización FP8 reduce la VRAM necesaria, permitiendo desplegar el modelo en una sola GPU de 24 GB (como RTX 4090) para tareas de autocompletado, revisión de código o generación de tests en pipelines de CI/CD.
- Asistente de investigación científica: puede procesar artículos completos, resumir metodologías, comparar resultados y extraer conclusiones, manteniendo el contexto de múltiples documentos en una sola conversación.
- Despliegue en entornos con restricciones de memoria: al pesar aproximadamente 28,75 GiB en FP8, es viable ejecutarlo en instancias cloud con una única GPU A100 de 40 GB o similar, reduciendo costes frente al checkpoint BF16 equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, RULER) para este derivado FP8 en la información disponible. La model card indica que la campaña completa de evaluación de contexto largo aún no se ha completado para este checkpoint.

Sin embargo, el autor proporciona métricas de error de cuantización y divergencia KL medidas sobre una ventana de 8.192 tokens de Principia con 2.048 posiciones muestreadas:

| Metrica | Valor |
|---|---|
| Error absoluto medio (dequantización) | 0,00022631 |
| Error cuadrático medio (RMSE) | 0,00034211 |
| Error L2 relativo | 0,0265053 |
| Error absoluto máximo | 0,0527344 |

| Checkpoint | Configuración RoPE | KL exacta (frente a teacher BF16) |
|---|---|---|
| Fuente BF16 adaptada | YaRN estático factor 4 | 0,00382181 |
| Este transplant FP8 | YaRN estático factor 4 | 0,00654097 |
| Pesos FP8 oficiales | YaRN estático factor 4 | 0,00744763 |
| Pesos FP8 oficiales | RoPE nativa | 0,00392433 |

Bajo la misma configuración YaRN-4, este checkpoint reduce la KL en 0,00090665 (12,2%) respecto a los pesos FP8 oficiales sin adaptar. La cuantización FP8 añade 0,00271916 de KL frente a su fuente BF16. El transplant FP8 y la fuente BF16 coinciden en el token de mayor probabilidad en el 98,10% de las posiciones muestreadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30 GB para los pesos FP8 (28,75 GiB de payload), más la memoria para KV cache. Con contexto de 8K tokens, cabe en una GPU de 24 GB (RTX 4090, A5000).
- Para configuraciones de contexto largo (1M tokens), se requiere memoria adicional significativa para la KV cache; se recomienda usar vLLM con tensor parallelism o PagedAttention.
- GPU recomendadas: RTX 4090 (24 GB) para pruebas, A100 40/80 GB o H100 para producción con contexto largo.
- El autor probó un smoke test con vLLM 0.28.0 usando tensor parallelism 2 (TP=2) y longitud máxima de 1.048.576 tokens, seleccionando el kernel CUTLASS block-scaled FP8.
- Opciones de despliegue: vLLM (probado), Hugging Face Transformers (requiere workaround para exclusión de patrones `.mlp.gate`), SGLang y TokenSpeed.
- El repositorio incluye un `run.sh` con la configuración de despliegue local utilizada para las pruebas.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | KL (YaRN-4, 8K) | Licencia |
|---|---|---|---|---|---|
| `eousphoros/...-iter137-fp8` (este) | 27,8B | FP8 blockwise | 262K nativo / 1M configurable | 0,00654097 | Apache-2.0 |
| `eousphoros/...-iter137` (BF16 adaptado) | 27,8B | BF16 | 262K nativo / 1M configurable | 0,00382181 | Apache-2.0 |
| `Qwen/Qwen3.8-27B-FP8` (oficial) | 27,8B | FP8 blockwise | 262K nativo / 1M configurable | 0,00744763 | Apache-2.0 |

La comparativa muestra que este derivado FP8 ofrece una KL menor que el FP8 oficial bajo la misma configuración YaRN-4, aunque superior a la fuente BF16 adaptada. No se dispone de comparativas con otros modelos de 27B multimodales (como Llama 3.2 11B o Qwen3-VL) en términos de benchmarks estándar para este checkpoint concreto.

## Limitaciones y advertencias

- Checkpoint experimental: debe evaluarse en la carga de trabajo prevista antes de su uso en producción.
- YaRN estático aplica el escalado rotatorio con factor 4.0 en todas las longitudes de secuencia, lo que puede afectar al rendimiento en secuencias cortas.
- La configuración de 1M de tokens no ha recibido una evaluación RULER completa; solo se ha validado un smoke test de 8K tokens.
- La KL medida a 8K es superior a la de la fuente BF16 adaptada debido a la cuantización FP8; se recomienda verificar la calidad en el dominio de aplicación.
- Existe un workaround necesario para cargar el checkpoint con Hugging Face Transformers 5.15.1 (patrones de exclusión `.mlp.gate`), aunque vLLM 0.28.0 lo carga directamente.
- No se especifican los idiomas soportados en la model card del derivado, aunque la base Qwen3.8-27B es presumiblemente multilingüe.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han documentado sesgos específicos para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eousphoros/qwen3.8-27b-yarn4-mixed-kl-128k-r1-iter137-fp8
- Modelo base adaptado (BF16): https://huggingface.co/eousphoros/qwen3.8-27b-yarn4-mixed-kl-128k-r1-iter137
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Recetas de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- Entrada en LLM Releases: https://www.llm-releases.com/models/qwen3-8-27b
