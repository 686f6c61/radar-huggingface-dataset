# Chungulus/Qwen3.8-27B-JANG_6M

## Resumen

El modelo `Chungulus/Qwen3.8-27B-JANG_6M` es una cuantización del checkpoint oficial `Qwen/Qwen3.8-27B`, realizada por el usuario Chungulus mediante el algoritmo propietario JANG_6M de precisión mixta adaptativa basada en error cuadrático medio (MSE). No se trata de un fine-tuning ni de una modificación de la arquitectura, sino de una conversión de pesos que reduce el tamaño del artefacto a 23,9 GB (decimal) manteniendo la estructura interna del modelo original, identificada como `Qwen3_5ForConditionalGeneration` (etiqueta interna `qwen3_5`, que no debe confundirse con una versión Qwen3.5).

El modelo base es un sistema de visión-lenguaje (image-text-to-text) con arquitectura híbrida que combina Gated DeltaNet y atención completa, e incluye una torre de visión, un proyector y un componente MTP (Multi-Token Prediction). La cuantización conserva los 1199 tensores originales, incluidos los 333 de visión y los 15 de MTP, y está pensada para ejecutarse en hardware Apple Silicon mediante el runtime `JANG/MLX` (versión 2.5.46 o superior), aunque también es compatible con vLLM. La licencia es Apache-2.0, igual que la del modelo padre.

La relevancia de este lanzamiento radica en ofrecer una versión cuantizada de un modelo multimodal de gran tamaño (27B parámetros en su forma original) con un peso final de aproximadamente 6,63 mil millones de parámetros según el conteo de safetensors, lo que facilita su despliegue en entornos con memoria limitada. Sin embargo, la documentación advierte que la cuantización puede degradar la calidad y que el contexto probado en validación es de solo 73 tokens, por lo que no se deben extrapolar capacidades más allá de lo verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida Gated DeltaNet + atención completa, con torre de visión y proyector) |
| Parametros totales | 6.630.093.552 (según safetensors; el modelo base se anuncia como 27B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (solo se probaron 73 tokens en validación; no se indica el máximo arquitectónico) |
| Tipos de cuantizacion | JANG_6M, precisión mixta adaptativa, aproximadamente 6,2 bits promedio |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con MLX y vLLM) |

## Arquitectura y entrenamiento

El modelo es una cuantización directa del checkpoint `Qwen/Qwen3.8-27B`, sin ningún tipo de fine-tuning, fusión, ablación o modificación del chat template. La conversión se realizó con el algoritmo JANG_6M de precisión mixta adaptativa basada en MSE, con un ancho de bits promedio de aproximadamente 6,2 bits y un tamaño de grupo determinado automáticamente por el convertidor. No se utilizó calibración externa; la conversión es puramente basada en pesos (weight-only). El runtime requerido es `JANG/MLX` 2.5.46, y el repositorio incluye un manifiesto de cuantización (`quantization_manifest.json`) con el digest del contenedor validado.

El modelo base, Qwen3.8-27B, emplea una arquitectura híbrida que combina Gated DeltaNet con atención completa, e incorpora un componente MTP (Multi-Token Prediction) para posible aceleración especulativa. Sin embargo, en esta cuantización los tensores MTP se conservan pero el runtime MLX no los activa, por lo que no se ofrece aceleración medida. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens procesados ni el uso de RLHF o DPO, ya que la model card de esta cuantización no los detalla.

## Capacidades

- Generación de texto y conversación multimodal (entrada de imagen y texto, salida de texto).
- Razonamiento con modo de pensamiento (thinking) controlable mediante los parámetros `enable_thinking`, `reasoning_effort` y `preserve_thinking` del chat template original.
- Tool calling nativo en formato XML, validado con cinco pruebas específicas.
- Procesamiento de imágenes y vídeo, con pruebas locales deterministas superadas.
- Soporte multilingüe no documentado explícitamente, aunque el modelo base Qwen suele ser multilingüe; no se confirma en esta ficha.
- Componente MTP retenido estructuralmente, pero sin aceleración medida ni soporte en el runtime MLX actual.

## Casos de uso

- Asistentes multimodales en dispositivos Apple Silicon: al estar cuantizado y pensado para MLX, puede ejecutarse en Mac con memoria unificada suficiente (pico de 27,2 GB medido), permitiendo chatbots que analizan imágenes y responden con texto.
- Automatización de tareas con tool calling: su soporte nativo de herramientas XML permite integrarlo en agentes que llaman funciones externas (búsqueda, APIs, etc.) en entornos de producción.
- Análisis de imágenes en edge computing: la cuantización reduce el tamaño del modelo, haciéndolo viable para servidores de inferencia con GPUs de gama media o hardware Apple, donde se pueden procesar imágenes y extraer descripciones o metadatos.
- Generación de descripciones accesibles: dado su pipeline image-text-to-text, puede usarse para crear textos alternativos automáticos para imágenes en plataformas web o aplicaciones.
- Prototipado rápido de aplicaciones VLM: al ser una cuantización lista para vLLM, permite levantar un servidor de inferencia multimodal con pocos comandos y probar flujos de conversación con imágenes.
- Investigación en cuantización de modelos multimodales: sirve como caso de estudio del algoritmo JANG_6M, comparando su similitud semántica (0,9883) con el modelo BF16 original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye una validación funcional y una comparación de similitud semántica con el modelo BF16 original, cuyos resultados se resumen a continuación:

| Metrica | Valor |
|---|---|
| Similitud semántica media (vs. BF16) | 0,9883 |
| Coincidencias exactas (sobre casos funcionales) | 8 |
| Velocidad de generación promedio | 12,01 tokens/s |
| Pico de memoria | 27,22 GB |
| Tamaño del artefacto | 23,91 GB |
| Máximo de tokens de prompt probado | 73 |

Estos valores son específicos del hardware de prueba (no especificado) y no deben considerarse representativos de todos los entornos.

## Requisitos de hardware

- Memoria: se midió un pico de 27,22 GB durante la inferencia, por lo que se recomienda al menos 32 GB de RAM unificada en Apple Silicon o VRAM equivalente en GPUs.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra o superior) con suficiente memoria unificada; también puede ejecutarse en GPUs NVIDIA mediante vLLM, aunque no se proporcionan requisitos específicos de VRAM.
- En consumer GPU: no se garantiza; el pico de memoria de 27 GB supera la VRAM de GPUs como RTX 4090 (24 GB), por lo que probablemente requiera cuantización adicional o particionado.
- Opciones de despliegue: vLLM (comando `vllm serve Chungulus/Qwen3.8-27B-JANG_6M`) y JANG/MLX 2.5.46 o superior.
- Latencia y throughput: se midió una velocidad de generación promedio de 12,01 tokens/s en el hardware de prueba, sin especificar el modelo de GPU o Mac.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría (VLM cuantizados). La única comparación posible es con el modelo base sin cuantizar, que se detalla a continuación:

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | 27B (aprox.) | no disponible | Apache-2.0 | BF16 | Modelo de referencia, mayor calidad pero mayor tamaño |
| Chungulus/Qwen3.8-27B-JANG_6M | 6,63B (según safetensors) | no disponible | Apache-2.0 | safetensors cuantizado | Reducción de tamaño, similitud semántica 0,9883 |

No se incluyen otras alternativas por falta de información en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización puede reducir la calidad del modelo, especialmente en tareas complejas o con bits muy bajos; el ancho promedio de 6,2 bits implica una pérdida potencial de precisión.
- El contexto probado en validación es de solo 73 tokens; no se debe asumir que el modelo maneja contextos largos sin degradación, aunque el modelo base pueda soportarlos.
- El componente MTP se conserva pero no está activo en el runtime MLX, por lo que no ofrece aceleración especulativa; no se debe publicitar esa capacidad.
- El soporte de runtime es específico: se requiere JANG/MLX 2.5.46 o superior, y un loader que lea solo tensores de lenguaje no es suficiente para aprovechar la torre de visión y el proyector.
- No se han realizado pruebas de sesgos, alucinación o seguridad; se recomienda evaluar el modelo en el dominio de uso antes de producción.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al modelo base y a esta cuantización según los términos de la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.8-27B-JANG_6M
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-27B
- Runtime JANG/MLX: no se proporciona enlace directo en la documentación; se menciona como requisito.
