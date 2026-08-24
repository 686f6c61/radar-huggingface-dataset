# dealignai/Ornith-1.5-35B-A3B-UNCENSORED-GGUF

## Resumen

Ornith-1.5-35B-A3B-UNCENSORED-GGUF es una colección de cuantizaciones GGUF del modelo base ornith-ai/Ornith-1.5-35B-A3B, publicada por dealignai. El modelo base es un MoE híbrido que combina GatedDeltaNet (SSM) con atención, con 256 expertos de los cuales 8 están activos por token, y una cabeza de predicción multi-token (MTP). La versión "UNCENSORED" aplica una técnica de cirugía de pesos llamada CRACK que elimina el comportamiento de rechazo (refusal) mientras preserva el conocimiento, el razonamiento y las capacidades de visión.

El repositorio incluye seis niveles de cuantización (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K) más un proyector de visión independiente, lo que permite ejecutar el modelo en hardware variado, desde GPUs de consumo hasta servidores. La licencia MIT facilita su uso comercial, aunque el modelo presenta una reducción deliberada de guardarraíles de seguridad, por lo que se distribuye como artefacto de investigación con advertencias de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GatedDeltaNet (SSM) + atención, Mixture-of-Experts (256 expertos, 8 activos) |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B por token (A3B) |
| Longitud de contexto | No disponible en la model card; fuentes externas indican hasta 256k |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B emplea una arquitectura híbrida que intercala capas de GatedDeltaNet (una variante de SSM con puertas) con capas de atención tradicional, dentro de un esquema MoE con 256 expertos y 8 activos por token. Esta combinación busca reducir el coste computacional manteniendo la capacidad de modelado de dependencias largas. Además, incorpora una cabeza de predicción multi-token (MTP) que permite decodificación especulativa, acelerando la inferencia.

La versión CRACK aplica una cirugía de pesos específica sobre las vías de atención para eliminar el rechazo a instrucciones dañinas, sin recurrir a fine-tuning. Según la model card, esta intervención preserva el conocimiento (MMLU dentro del ruido del modelo base en cada cuantización) y mantiene intactas las capacidades de razonamiento y visión. Los cuantizados sub-8-bit se optimizan con un pase AWQ (activation-aware) y una matriz de importancia para maximizar la calidad.

## Capacidades

- Generación de texto y razonamiento multi-paso con traza de pensamiento ("thinking") activada por defecto, desactivable mediante parámetros de plantilla.
- Comprensión de imágenes (visión) mediante un proyector multimodal separado (`mmproj`), compatible con todas las cuantizaciones de texto.
- Decodificación especulativa gracias a la cabeza MTP, que acelera la generación en entornos compatibles (llama.cpp, vLLM).
- Soporte de chat conversacional con plantilla Jinja y modo interactivo en llama.cpp.
- Capacidades multilingües no documentadas en la información disponible; se asume herencia del modelo base Qwen3.5, pero no se confirma.
- No se especifica soporte explícito de tool calling o function calling en la documentación proporcionada.

## Casos de uso

- Investigación en seguridad y alineación: el modelo permite estudiar el comportamiento de un LLM sin guardarraíles, útil para analizar sesgos, mecanismos de rechazo y estrategias de mitigación en entornos controlados.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido artístico donde la censura temática pueda limitar la expresión, siempre dentro del marco legal.
- Desarrollo de asistentes especializados en dominios técnicos: gracias a su razonamiento y contexto largo (hasta 256k según fuentes externas), puede procesar documentación extensa, repositorios de código o informes técnicos.
- Análisis de imágenes y documentos visuales: con el proyector de visión, puede describir imágenes, extraer información de capturas o generar alt-text automático en pipelines de accesibilidad.
- Prototipado rápido de aplicaciones conversacionales: su licencia MIT y formato GGUF permiten integrarlo en entornos de desarrollo con llama.cpp u Ollama sin costes de licencia.
- Evaluación de cuantización y rendimiento: al ofrecer seis niveles de quant, es útil para medir el impacto de la compresión en tareas de razonamiento y visión, orientando decisiones de despliegue.

## Benchmarks y rendimiento

La model card reporta MMLU (modo logit) comparando el modelo base frente a la versión CRACK en cada cuantización, y HarmBench (tasa de éxito de ataque con coherencia) para la versión CRACK.

| Quant | MMLU (base) | MMLU (CRACK) | ΔMMLU | HarmBench harm-ASR |
|---|---|---|---|---|
| Q8_0 | 79,0% | 80,7% | +1,75 pp | 100,0% |
| Q6_K | 78,6% | 79,0% | +0,40 pp | 100,0% |
| Q5_K_M | 80,7% | 80,1% | -0,58 pp | 100,0% |
| Q4_K_M | 80,0% | 77,8% | -2,20 pp | 100,0% |
| Q3_K_M | 76,0% | 78,4% | +2,34 pp | 100,0% |
| Q2_K | 77,9% | 69,8% | -8,07 pp | 99,6% |

HarmBench por tema (CRACK): químico/biológico, ciberdelincuencia, acoso, dañino, ilegal y desinformación presentan una tasa de éxito del 100,0%. No se publican resultados de otros benchmarks como HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Q8_0 (37,8 GB): requiere al menos 40 GB de VRAM para inferencia en GPU; viable en A100 40GB, A6000 o múltiples GPUs.
- Q6_K (29,2 GB): necesita ~32 GB de VRAM; compatible con A100 40GB, RTX 6000 Ada o configuraciones multi-GPU.
- Q5_K_M (25 GB): ~28 GB de VRAM; cabe en RTX 4090 24GB con offloading parcial o en GPUs de 32GB.
- Q4_K_M (21,7 GB): ~24 GB de VRAM; recomendado para RTX 4090 24GB, L40S o similar.
- Q3_K_M (17 GB): ~20 GB de VRAM; cabe en RTX 4080 16GB con offloading o en GPUs de 24GB.
- Q2_K (13,2 GB): ~16 GB de VRAM; ejecutable en RTX 4080 16GB o RTX 3090 24GB.
- Todas las cuantizaciones pueden ejecutarse en CPU con suficiente RAM (el archivo Q4_K_M requiere ~22 GB de RAM), aunque con latencia mayor.
- Despliegue recomendado: llama.cpp (llama-cli, llama-server), llama-mtmd-cli para visión, vLLM (con soporte MTP), Ollama o LM Studio.
- La decodificación especulativa MTP puede mejorar el throughput entre 1,5x y 2x en hardware compatible, según la implementación.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Cualitativamente, se puede comparar con otros MoE de ~35B totales y ~3B activos como Qwen3-30B-A3B o DeepSeek-V3-Lite, pero no hay métricas publicadas en las fuentes consultadas para establecer una comparación rigurosa. La arquitectura híbrida SSM+atención y la cabeza MTP son características distintivas frente a MoE puramente transformer.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente despojado de guardarraíles de seguridad; puede generar contenido dañino, ilegal o éticamente problemático si se le solicita. Su uso debe limitarse a entornos de investigación controlados y con fines legales.
- La cuantización Q2_K muestra una degradación notable de MMLU (-8,07 pp respecto al base), por lo que no se recomienda para tareas que requieran alta precisión.
- No se documentan los idiomas soportados; el multilingüismo se hereda del modelo base Qwen3.5 pero no está verificado en esta versión.
- La longitud de contexto no está especificada en la model card; aunque fuentes externas mencionan hasta 256k, no hay garantía de que todas las cuantizaciones mantengan esa capacidad sin degradación.
- Riesgo de alucinación inherente a los LLM, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- La licencia MIT permite uso comercial, pero la ausencia de guardarraíles puede generar responsabilidad legal si el modelo se despliega en aplicaciones orientadas al público sin filtros adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dealignai/Ornith-1.5-35B-A3B-UNCENSORED-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Modelo en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Guía de despliegue en DGX Spark: https://github.com/MiaAI-Lab/Ornith-1.5-35B-A3B-DGX-Spark
