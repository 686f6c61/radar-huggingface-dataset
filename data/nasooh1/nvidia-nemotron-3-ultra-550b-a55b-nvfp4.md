# nasooh1/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4

## Resumen

NVIDIA Nemotron-3-Ultra-550B-A55B-NVFP4 es un modelo de lenguaje de escala frontera desarrollado por NVIDIA, diseñado para tareas de razonamiento complejo, agentes multi-paso y análisis de contexto largo. Emplea una arquitectura híbrida LatentMoE que combina capas intercaladas de Mamba-2, mezcla de expertos (MoE) y capas de atención selectivas, junto con Multi-Token Prediction (MTP) para acelerar la generación y mejorar la calidad. El modelo tiene 550 mil millones de parámetros totales según la model card, de los cuales 55 mil millones están activos por token, y admite una ventana de contexto de hasta 1 millón de tokens.

Este modelo se distribuye con pesos cuantizados en NVFP4 (formato de 4 bits de NVIDIA), lo que reduce los requisitos de memoria respecto a BF16 manteniendo un rendimiento cercano según los benchmarks publicados. Está disponible bajo la licencia OpenMDW-1.1, que permite uso comercial y no comercial, y soporta diez idiomas principales. Su relevancia radica en ser uno de los primeros modelos abiertos de NVIDIA con arquitectura híbrida y cuantización nativa de 4 bits, orientado a cargas de trabajo exigentes como agentes autónomos, RAG de alto riesgo y razonamiento científico.

La versión alojada en HuggingFace (nasooh1/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4) contiene los pesos en formato safetensors con un tamaño real de 302.826.566.168 parámetros, inferior a la cifra declarada de 550B, probablemente debido a compartición de pesos o a la cuantización. El repositorio tiene un tamaño de 352.4 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE híbrida: Mamba-2 + MoE + Attention, con Multi-Token Prediction (MTP) |
| Parametros totales | 550B (según model card); 302.826.566.168 pesos reales en safetensors |
| Parametros activos | 55B |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (nativo), BF16 (referencia) |
| Idiomas soportados | Inglés, francés, español, italiano, alemán, japonés, coreano, hindi, portugués brasileño, chino |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura LatentMoE híbrida que intercala capas de Mamba-2 (modelos de espacio de estado) con capas de mezcla de expertos y capas de atención selectivas. Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance. Además, incorpora Multi-Token Prediction (MTP), una técnica que predice varios tokens futuros simultáneamente, lo que acelera la generación y mejora la calidad del texto producido.

El entrenamiento se realizó en dos fases: pre-entrenamiento con datos con corte en septiembre de 2025 y post-entrenamiento con datos hasta mayo de 2026. NVIDIA ha publicado los datasets de ambas fases en HuggingFace. El modelo se entrenó con una receta de pre-entrenamiento en NVFP4, lo que maximiza la eficiencia computacional durante el entrenamiento y permite una inferencia más rápida con menor uso de memoria. La model card indica que el razonamiento (modo "thinking") es configurable mediante el chat template con la opción `enable_thinking=True/False`.

## Capacidades

- Razonamiento complejo y multi-paso, incluyendo matemáticas, ciencia y lógica.
- Generación de código y depuración en múltiples lenguajes de programación.
- Ejecución de tareas de agente autónomo con soporte para tool calling y planificación.
- Análisis de documentos de contexto largo gracias a su ventana de hasta 1M tokens.
- Razonamiento multilingüe en diez idiomas, con capacidad de traducción y comprensión intercultural.
- Modo "thinking" configurable para activar o desactivar el razonamiento explícito antes de responder.
- Integración con pipelines de generación aumentada por recuperación (RAG) de alto riesgo.
- Soporte para decodificación especulativa y generación acelerada gracias a MTP.

## Casos de uso

- Agentes autónomos complejos: el modelo puede gestionar flujos de trabajo multi-paso con planificación y ejecución de herramientas, gracias a su soporte de tool calling y su razonamiento explícito. Es adecuado para automatización de procesos de negocio que requieren decisiones secuenciales.
- Análisis de documentos extensos: con una ventana de 1M tokens, permite procesar libros técnicos, expedientes legales o informes financieros completos sin necesidad de fragmentación, manteniendo coherencia global.
- Generación de código en producción: su capacidad de razonamiento y generación de código lo hace útil para asistentes de programación, revisión de pull requests y generación de tests automatizados, integrándose en pipelines de CI/CD.
- RAG de alto riesgo: en entornos donde la precisión es crítica (diagnóstico médico, asesoramiento legal), el modelo puede combinar recuperación de información con razonamiento riguroso para reducir alucinaciones.
- Atención al cliente multilingüe: soporta diez idiomas, lo que permite desplegar sistemas de soporte conversacional en mercados globales con un único modelo, manteniendo calidad en todas las lenguas.
- Investigación científica: su capacidad para razonar sobre matemáticas y ciencia facilita la exploración de hipótesis, el análisis de resultados experimentales y la redacción de artículos técnicos.
- Traducción y localización: el multilingüismo del modelo permite traducción automática de alta calidad, adaptación cultural y generación de contenido localizado para productos digitales.

## Benchmarks y rendimiento

La model card publica los siguientes resultados, comparando la versión BF16 con la NVFP4:

| Benchmark | Nemotron 3 Ultra BF16 | Nemotron 3 Ultra NVFP4 |
|---|---|---|
| Terminal Bench 2.1 | 56.4 | 53.9 |
| GDPVal | 46.7 | 47.9 |
| SWE-Bench Verified | 70.7 | 69.5 |
| SWE-Bench Multilingual | 67.7 | 69.1 |
| ProfBench (Search) | 56 | 56.4 |
| PinchBench | 90 | 89.8 |
| TauBench V3 - Airline | 81.5 | 80.0 |
| TauBench V3 - Retail | 86.4 | 88.4 |
| TauBench V3 - Telecom | 92.9 | 93.6 |
| TauBench V3 - Banking | 22.6 | 19.2 |

No se proporcionan resultados de benchmarks clásicos como MMLU, HumanEval o GSM8K en la información disponible. La versión NVFP4 muestra una degradación mínima respecto a BF16 en la mayoría de las tareas, e incluso mejora en algunos casos (GDPVal, SWE-Bench Multilingual, ProfBench Search, TauBench Retail y Telecom).

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 302.8B parámetros en NVFP4 (4 bits), el peso del modelo ocupa aproximadamente 151 GB, pero se requiere memoria adicional para activaciones y estados de atención, por lo que se recomienda un mínimo de 200-250 GB de VRAM total.
- GPU recomendadas: la model card indica un mínimo de 4xGB200, 4xB200, 4xGB300, 4xB300 o 8xH100. No es viable en GPUs de consumo (RTX 4090, etc.).
- Despliegue: compatible con librerías de transformers y endpoints de NVIDIA (build.nvidia.com). Se puede servir con vLLM, TGI u otras plataformas que soporten modelos de gran escala con cuantización NVFP4.
- Latencia y throughput: no se han publicado datos concretos. Dado el tamaño y la cuantización, se espera un throughput moderado en hardware de data center, con generación acelerada gracias a MTP.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, por su escala y orientación, se puede situar junto a otros modelos de parámetros activos similares como DeepSeek-V3 (671B totales, 37B activos) o Llama 3.1 405B (405B densos). A diferencia de estos, Nemotron-3 Ultra utiliza una arquitectura híbrida con Mamba-2 y MTP, y ofrece una ventana de contexto de 1M tokens, superior a los 128K de Llama 3.1. La licencia OpenMDW-1.1 es más permisiva que la de algunos competidores. No obstante, no se pueden extraer conclusiones cuantitativas sin benchmarks comparativos publicados.

## Limitaciones y advertencias

- Requiere infraestructura de alto nivel: el modelo necesita al menos 4 GPUs de data center de última generación, lo que limita su uso a organizaciones con presupuesto significativo.
- La licencia OpenMDW-1.1, aunque permite uso comercial, tiene términos específicos que deben revisarse detenidamente antes de su implementación en producción.
- Los benchmarks disponibles se centran en tareas de agente y código; no hay datos sobre sesgos o alucinaciones en dominios generales.
- La ventana de contexto de 1M tokens puede degradar la calidad en los extremos más largos; se recomienda validar el comportamiento en casos de uso reales.
- El modelo solo soporta diez idiomas; lenguas minoritarias o variantes regionales pueden tener un rendimiento inferior.
- La discrepancia entre los 550B declarados y los 302.8B reales en safetensors sugiere que puede haber compartición de pesos o cuantización agresiva; los usuarios deben verificar el comportamiento exacto en su entorno.

## Enlaces

- HuggingFace: https://huggingface.co/nasooh1/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf
- Chat de prueba: https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b
- Datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Datasets de post-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
