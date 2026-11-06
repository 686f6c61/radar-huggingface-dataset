# b2z/Swift1.5-GLM-5.3-Flash-oQ4e-mtp

## Resumen

Swift1.5-GLM-5.3-Flash-oQ4e-mtp es una cuantización mixta de 4 bits del modelo Swift 1.5 GLM-5.3-Flash, publicada por el usuario b2z mediante la herramienta oQ (oMLX v0.7.3). El modelo base, desarrollado por UkisAI, es a su vez un derivado de razonamiento eficiente de GLM-5.3-Flash (Z.ai), un modelo multimodal de 320B parámetros con arquitectura MoE. Esta versión cuantizada reduce el peso del checkpoint a 173,6 GiB con un promedio efectivo de 4,641 bits por peso, lo que la hace desplegable en hardware Apple Silicon mediante MLX.

El interés de esta ficha radica en que combina tres elementos poco habituales: un modelo de razonamiento de gran escala con capacidades de visión (pipeline image-text-to-text), una optimización específica para reducir tokens de "pensamiento" (57,7% menos según el autor del modelo base, con 2,4x de aceleración y menos del 1% de pérdida de precisión), y una cuantización selectiva que preserva en 8 bits y BF16 las capas críticas (8.976B parámetros en 8 bits, 0.607B en BF16). El resultado es un checkpoint de 321.323B parámetros lógicos que cabe en estaciones de trabajo con memoria unificada de gama alta.

La relevancia actual es doble: por un lado, demuestra que los modelos MoE de razonamiento de escala 300B+ pueden cuantizarse agresivamente manteniendo calidad; por otro, introduce una cabeza MTP (multi-token prediction) de 7.433B parámetros que habilita decodificación especulativa nativa, un mecanismo clave para reducir latencia en generación autoregresiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabeza MTP (multi-token prediction) y torre de visión |
| Parámetros totales | 321.323.031.390 (321,323B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ mixta: affine 4-bit grupo 64 (96,991%), affine 8-bit grupo 64 (2,793%), BF16 (0,189%), FP32 (0,027%) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (other) |
| Formato de pesos | safetensors (MLX) |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 313,327B | 180,966 GB / 168,538 GiB |
| Visión | 0,564B | 1,127 GB / 1,050 GiB |
| Cabeza MTP | 7,433B | 4,309 GB / 4,013 GiB |
| **Total** | **321,323B** | **186,402 GB / 173,600 GiB** |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash es un transformer de mezcla de expertos (MoE) multimodal de 320B parámetros publicado por Z.ai el 26 de agosto de 2026. Swift 1.5 es un derivado de UkisAI que aplica post-entrenamiento orientado a la eficiencia del razonamiento: en lugar de recortar directamente la longitud de las trazas de pensamiento, identifica y penaliza los tokens asociados a "sobrepensamiento patológico", y posteriormente recupera precisión mediante post-entrenamiento adicional. Según la model card, esto produce trazas de razonamiento más cortas con un 57,7% menos de tokens de pensamiento, 2,4x de aceleración y menos del 1% de pérdida de precisión frente al base en esfuerzo de razonamiento máximo.

El post-entrenamiento incluye métodos adaptados específicamente a código y trabajo agéntico de horizonte largo (uso de terminal, ingeniería de software). Los datos de entrenamiento proceden del dataset ukisai/Qwen3.8-27B-multi-turn-agent-sft, aunque la model card aclara que no se usan directamente, sino que se remuestrean y convierten en entornos de RL. La cabeza MTP de 7,433B parámetros permite decodificación multi-token, lo que se traduce en menor latencia por token generado. La cuantización oQ aplicada por b2z mantiene en mayor precisión (8-bit, BF16, FP32) aproximadamente el 3% de los pesos, presumiblemente capas sensibles como embeddings, normas y proyecciones de atención.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento ("thinking") explícito, optimizado para reducir sobrepensamiento.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text), con torre de visión de 0,564B parámetros.
- Generación de código y tareas de ingeniería de software, con post-entrenamiento específico para terminal y flujos agénticos.
- Razonamiento matemático y lógico (heredado del modelo base GLM-5.3-Flash).
- Decodificación especulativa nativa mediante cabeza MTP, que acelera la inferencia sin modelo drafter externo.
- Capacidades agénticas de horizonte largo (uso de herramientas, ejecución de comandos, planificación multi-paso).
- Soporte multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.

## Casos de uso

- **Asistente de coding en local sobre Apple Silicon**: gracias a la cuantización MLX de 4 bits y los 173,6 GiB de checkpoint, el modelo puede ejecutarse en Mac Studio con memoria unificada de 192 GB o superior, ofreciendo un asistente de código privado sin dependencia de la nube.
- **Revisión de código y análisis de repositorios**: el post-entrenamiento específico en ingeniería de software y el contexto presumiblemente amplio del modelo base lo hacen adecuado para tareas de revisión, refactorización y explicación de código en pipelines de CI/CD.
- **Agentes autónomos de terminal**: las capacidades de horizonte largo y el entrenamiento en entornos de terminal permiten desplegar agentes que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- **Análisis de documentos con imágenes**: la torre de visión permite procesar capturas, diagramas o documentos escaneados junto con texto, útil en tareas de extracción de información estructurada.
- **Razonamiento eficiente en producción**: la reducción del 57,7% en tokens de pensamiento con menos del 1% de pérdida de precisión hace que el modelo sea adecuado para aplicaciones donde la latencia y el coste por consulta son críticos, como atención al cliente técnica o triaje de incidencias.
- **Investigación en eficiencia de razonamiento**: el modelo sirve como caso de estudio para investigar técnicas de compresión de trazas de pensamiento y cuantización mixta en MoE de gran escala.
- **Generación aumentada por recuperación (RAG) multimodal**: combinación de contexto textual largo con imágenes en flujos de preguntas y respuestas sobre documentación técnica.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla de evaluación comparativa entre GLM-5.3-Flash y Swift 1.5, pero los valores numéricos no están disponibles en la información proporcionada (la tabla aparece truncada). Los datos cualitativos declarados por el autor son:

| Métrica | Valor declarado |
|---|---|
| Reducción de tokens de pensamiento | 57,7% |
| Aceleración | 2,4x |
| Pérdida de precisión vs. base (max effort) | <1% |

No se han publicado resultados de benchmarks numéricos (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta cuantización específica.

## Requisitos de hardware

- **VRAM/memoria unificada estimada**: 173,6 GiB para cargar el checkpoint completo en memoria; se recomienda al menos 192 GB de memoria unificada para dejar margen a KV cache y activaciones.
- **GPU recomendadas**: Apple Silicon con memoria unificada de 192 GB o superior (Mac Studio M2 Ultra / M3 Ultra). No es compatible con CUDA de forma nativa al estar en formato MLX.
- **Consumer GPU**: no cabe en RTX 4090 (24 GB) ni en configuraciones multi-GPU convencionales sin sharding avanzado; el formato MLX está orientado a Apple Silicon.
- **Opciones de despliegue**: MLX (librería nativa del checkpoint), con descarga vía `hf download`. Para otros backends sería necesario reconvertir los pesos; existe una versión GGUF del modelo base en ukisai/Swift-1.5-GLM-5.3-Flash-GGUF.
- **Latencia y throughput**: no disponibles. La cabeza MTP debería reducir la latencia por token respecto a decodificación autoregresiva estándar, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Swift1.5-GLM-5.3-Flash-oQ4e-mtp (esta ficha) | 321,3B | no disponible | 4-bit mixta (4,641 bits/peso) | swift-open-license-1.0 | safetensors MLX |
| GLM-5.3-Flash (Z.ai) | ~320B | no disponible | BF16 original | no disponible | safetensors |
| Swift1.5-GLM-5.3-Flash (UkisAI) | 321,3B | no disponible | BF16 original | swift-open-license-1.0 | safetensors |
| Swift-1.5-GLM-5.3-Flash-GGUF (UkisAI) | 321,3B | no disponible | GGUF (varias) | swift-open-license-1.0 | GGUF |

La comparativa se limita a variantes del mismo linaje, ya que no se dispone de datos de rendimiento de alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Licencia restrictiva**: la swift-open-license-1.0 no es una licencia open source estándar; es necesario revisar los términos en el enlace de licencia del modelo base antes de cualquier uso comercial. La model card menciona "Enterprise licensing" en la sección de acceso.
- **Sesgos**: no se han documentado sesgos específicos en la información disponible; al heredar el comportamiento de GLM-5.3-Flash, es probable que presente sesgos similares a los de modelos entrenados con corpus web a gran escala.
- **Riesgo de alucinación**: inherente a los modelos de razonamiento de gran escala; la compresión de trazas de pensamiento podría aumentar el riesgo en tareas que requieren verificación exhaustiva, aunque el autor afirma que se observan menos errores de sobrepensamiento.
- **Compatibilidad de hardware limitada**: el formato MLX restringe el despliegue a Apple Silicon; para GPUs NVIDIA sería necesario reconvertir a otro formato o usar la versión GGUF del modelo base.
- **Idiomas no documentados**: no se especifica qué idiomas soporta el modelo, lo que dificulta evaluar su idoneidad para producción multilingüe.
- **Contexto no documentado**: se desconoce la longitud máxima de contexto, un dato crítico para aplicaciones de documentos largos o agentes con historial extenso.
- **Cuantización de terceros**: esta versión no está publicada por UkisAI ni por Z.ai; la calidad de la cuantización mixta no ha sido validada de forma independiente más allá de las métricas declaradas.
- **Modelo muy reciente**: publicado el 2 de noviembre de 2026, con solo 176 descargas y 0 likes en el momento de redactar esta ficha; no hay evidencia comunitaria de uso en producción.

## Enlaces

- [Hugging Face: b2z/Swift1.5-GLM-5.3-Flash-oQ4e-mtp](https://huggingface.co/b2z/Swift1.5-GLM-5.3-Flash-oQ4e-mtp)
- [Modelo base: ukisai/Swift1.5-GLM-5.3-Flash](https://huggingface.co/ukisai/Swift1.5-GLM-5.3-Flash)
- [Licencia swift-open-license-1.0](https://huggingface.co/ukisai/Swift1.5-GLM-5.3-Flash/blob/main/LICENSE)
- [Versión GGUF del modelo base](https://huggingface.co/ukisai/Swift-1.5-GLM-5.3-Flash-GGUF)
- [GLM-5.3-Flash (Z.ai)](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [Dataset de entrenamiento: ukisai/Qwen3.8-27B-multi-turn-agent-sft](https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft)
- [Herramienta de cuantización oQ (oMLX)](https://github.com/jundot/omlx)
- [Web de UkisAI](https://ukisai.com)
- [Página de producto Swift](https://ukisai.com/products/swift)
- [Análisis de GLM 5.3 Flash en FelloAI](https://felloai.com/glm-5-3-flash/)
