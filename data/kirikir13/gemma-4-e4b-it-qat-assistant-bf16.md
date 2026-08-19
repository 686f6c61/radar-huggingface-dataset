# kirikir13/gemma-4-E4B-it-qat-assistant-bf16

## Resumen

Este repositorio contiene los pesos del modelo *drafter* (modelo de propuesta) de Multi-Token Prediction (MTP) extraídos de `google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant`, preparados para su uso con `mlx-vlm` en esquemas de decodificación especulativa. No es un modelo de chat o generación de texto autónomo: su función exclusiva es proponer tokens candidatos que el modelo objetivo (Gemma 4 E4B) verifica posteriormente, acelerando la inferencia en entornos Apple Silicon.

El desarrollo corre a cargo del usuario de HuggingFace `kirikir13`, que ha dividido los pesos del asistente del modelo base para facilitar su carga como *draft model* en MLX. La arquitectura subyacente es la de Gemma 4 E4B, un modelo de visión-lenguaje (VLM) de Google con una ventana de contexto de hasta 256K tokens y soporte multilingüe en más de 140 idiomas, aunque este drafter concreto solo declara inglés en su configuración.

Con solo 78,78 millones de parámetros en precisión bf16 y un tamaño de repositorio de 0,2 GB, este drafter es extremadamente ligero, lo que lo hace adecuado para entornos con recursos limitados siempre que se combine con el checkpoint objetivo correspondiente. Su relevancia radica en permitir decodificación especulativa eficiente en MLX, una técnica que reduce la latencia en generación de texto e imágenes sin sacrificar calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP drafter para Gemma 4 E4B (Multi-Token Prediction) |
| Parametros totales | 78.779.908 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 E4B soporta hasta 256K tokens) |
| Tipos de cuantizacion | bf16 (formato original del repositorio) |
| Idiomas soportados | en (declarado en la model card; el modelo base soporta 140+ idiomas) |
| Licencia | gemma (licencia de Google Gemma) |
| Formato de pesos | Safetensors con configuración compatible con MLX y archivos de tokenizador |

## Arquitectura y entrenamiento

El modelo es un *drafter* MTP (Multi-Token Prediction) diseñado para decodificación especulativa. En lugar de ser un modelo entrenado desde cero, sus pesos se extraen directamente del checkpoint `google/gemma-4-E4B-it-qat-q4_0-unquantized-assistant`, que a su vez es una versión cuantizada (QAT, Quantization-Aware Training) del modelo Gemma 4 E4B de Google. La arquitectura subyacente de Gemma 4 E4B combina un transformer denso con mecanismos de atención multimodal, aunque este drafter solo contiene la parte encargada de predecir múltiples tokens futuros en paralelo.

El entrenamiento del drafter no se detalla en la información disponible; se asume que hereda las capacidades del modelo base, que fue entrenado con un enfoque de RLHF y optimización para tareas de asistente conversacional. La extracción de pesos se realiza para separar el módulo MTP del modelo principal, permitiendo su carga independiente en `mlx-vlm` como *draft model*.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni técnicas específicas de alineación aplicadas a este drafter concreto. La innovación técnica principal es su integración con el runtime MLX para decodificación especulativa, donde el drafter propone candidatos y el modelo objetivo los verifica, reduciendo el número de pasos de decodificación.

## Capacidades

- No es un modelo de generación autónoma: no puede mantener conversaciones, razonar ni generar texto por sí mismo.
- Proposición de tokens candidatos en esquemas de decodificación especulativa (MTP) para el modelo Gemma 4 E4B.
- Compatible exclusivamente con el runtime `mlx-vlm` y la opción `--draft-kind mtp`.
- Soporte para entrada multimodal indirecta: al trabajar junto al modelo objetivo, participa en tareas de visión-lenguaje (descripción de imágenes, VQA, etc.) aunque no procesa directamente las imágenes.
- Sin capacidades de *tool calling*, *function calling* o razonamiento multi-paso de forma independiente.
- Multilingüismo limitado: solo declara inglés en su configuración, aunque el modelo base soporta más de 140 idiomas.

## Casos de uso

- Aceleración de inferencia en Apple Silicon: al usar este drafter con `mlx-vlm` y el modelo Gemma 4 E4B, se reduce la latencia en generación de texto largo, especialmente útil en aplicaciones de asistente conversacional en dispositivos Mac.
- Despliegue de VLM en entornos con recursos limitados: al ser un drafter de solo 78M parámetros, puede ejecutarse en GPU con poca VRAM (incluso en la GPU unificada de un Mac con 8 GB), permitiendo decodificación especulativa sin necesidad de hardware de gama alta.
- Prototipado rápido de pipelines de visión-lenguaje: los desarrolladores pueden integrar este drafter en sus flujos de `mlx-vlm` para experimentar con decodificación especulativa sin modificar el modelo objetivo.
- Optimización de costes en producción: al reducir el número de pasos de decodificación, se disminuye el consumo energético y el tiempo de cómputo en servicios de inferencia basados en MLX.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de los *drafters* MTP en la calidad y velocidad de generación de modelos Gemma 4.
- Evaluación de compatibilidad: permite probar la integración de *draft models* con diferentes versiones de `mlx-vlm` y configuraciones de cuantización del modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye métricas de rendimiento, latencia ni comparativas con otros *drafters*. El rendimiento dependerá del modelo objetivo (Gemma 4 E4B) y del hardware utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un drafter de 78M parámetros en bf16, ocupa aproximadamente 0,16 GB en memoria. Sin embargo, el modelo objetivo Gemma 4 E4B (que sí se carga en memoria) requiere varios GB adicionales; se recomienda al menos 8 GB de VRAM para el conjunto completo.
- GPU recomendadas: cualquier GPU compatible con MLX, incluyendo Apple Silicon (M1, M2, M3, M4) con memoria unificada de 8 GB o superior. También puede ejecutarse en GPU NVIDIA si se usa MLX con soporte CUDA, aunque no es el caso habitual.
- ¿Cabe en consumer GPU? Sí, el drafter cabe en cualquier GPU moderna, pero el modelo objetivo limita el despliegue. Para Gemma 4 E4B en cuantización Q4, se necesitan aproximadamente 4-6 GB de VRAM adicionales.
- Opciones de despliegue: exclusivamente mediante `mlx-vlm` con la opción `--draft-kind mtp`. No es compatible con vLLM, llama.cpp, Ollama o TGI de forma directa.
- Latencia y throughput: no se han publicado datos específicos. La decodificación especulativa suele reducir la latencia entre un 20% y un 50% en comparación con la decodificación autoregresiva estándar, pero depende del hardware y del modelo objetivo.

## Comparativa con modelos similares

No se dispone de información sobre *drafters* MTP comparables para Gemma 4 E4B en el ecosistema MLX. Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| kirikir13/gemma-4-E4B-it-qat-assistant-bf16 | 78,78 M | no disponible (base: 256K) | gemma | Safetensors (MLX) | Drafter MTP para decodificación especulativa |
| google/gemma-4-E4B-it-assistant | no disponible | 256K | gemma | Safetensors | Modelo VLM completo para chat y visión |
| google/gemma-4-E4B-it-qat-q4_0-gguf | no disponible | 256K | gemma | GGUF | Modelo VLM cuantizado para inferencia en CPU/GPU |

La comparativa directa no es posible porque este drafter no es un modelo autónomo; su función es complementaria al modelo objetivo.

## Limitaciones y advertencias

- No es un modelo standalone: no puede generar texto, mantener conversaciones ni procesar imágenes por sí mismo. Intentar usarlo con APIs genéricas de Transformers fallará.
- Requiere soporte específico en `mlx-vlm` para *draft models* MTP; versiones anteriores o forks pueden no ser compatibles.
- Solo funciona con checkpoints de Gemma 4 E4B compatibles; no es intercambiable con otros modelos.
- La licencia `gemma` impone restricciones de uso comercial: es necesario revisar los términos de la licencia de Google Gemma antes de desplegar en producción.
- El idioma declarado es solo inglés; aunque el modelo base soporta más idiomas, este drafter no garantiza el mismo rendimiento multilingüe.
- Riesgo de alucinación y sesgos: al ser un componente del modelo base, hereda los sesgos y limitaciones de Gemma 4 E4B, aunque su papel como *drafter* no afecta directamente a la calidad de las respuestas finales.
- No se han publicado evaluaciones de seguridad ni de sesgos específicas para este drafter.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kirikir13/gemma-4-E4B-it-qat-assistant-bf16
- Modelo base en HuggingFace: https://huggingface.co/google/gemma-4-E4B-it-assistant
- Versión GGUF del modelo base: https://huggingface.co/google/gemma-4-E4B-it-qat-q4_0-gguf
- Página oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Entrada en Ollama para Gemma 4 E4B QAT: https://ollama.com/library/gemma4:e4b-it-qat
