# justinchuby/onnx-genai-example-gemma4-e2b-assistant

## Resumen

Este repositorio contiene una exportación ONNX de pesos reales del modelo `google/gemma-4-E2B-it-assistant`, el modelo auxiliar de decodificación especulativa para `google/gemma-4-E2B-it`. El modelo fue desarrollado por justinchuby usando la herramienta mobius del ecosistema onnxruntime, y está diseñado para emparejarse con el repositorio destino `justinchuby/onnx-genai-example-gemma4-e2b`. Su propósito es servir como modelo de borrador (drafter) en un esquema de decodificación especulativa, donde propone tokens candidatos que el modelo principal valida o rechaza.

El modelo tiene 4 capas con atención deslizante y completa, y una característica destacable: no posee caché propia de clave-valor, sino que lee la caché compartida del modelo destino en modo solo lectura. Además, incorpora una cabeza de proyección de vocabulario podada y enrutada por centroides, que reduce los logits activos de 262144 a solo 4096 posiciones por token. Este repositorio es relevante porque demuestra la viabilidad de implementar decodificación especulativa en ONNX Runtime con metadatos de inferencia canónicos, aunque aún quedan tres discrepancias pendientes para una ficha de metadatos totalmente fiel al artefacto real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 4 capas (3 deslizantes + 1 completa) con cabeza de proyección sparse por centroides |
| Parametros totales | No disponible (pesos fp16, repo de 0.4 GB) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (exportado para CUDAExecutionProvider) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it-assistant` es un drafter de 4 capas con un patrón de atención `sliding, sliding, sliding, full`. La exportación ONNX mantiene esa estructura con una dimensión de cabeza heterogénea: 256 para atención deslizante y 512 para atención completa. La entrada es `inputs_embeds` con forma `[B, q, 3072]`, que se construye concatenando el embedding del token destino con el estado oculto reciclado del paso anterior. La salida incluye logits de forma `[B, q, 262144]` y un `projected_state` de forma `[B, q, 1536]` que actúa como carry recurrente.

Una innovación destacable es la cabeza de proyección de vocabulario sparse con enrutamiento por centroides: usa 2048 centroides y top-32, lo que produce solo 4096 logits activos de un vocabulario de 262144 tokens por posición. El proceso se implementa con operaciones TopK, Gather, ReduceMin y ScatterElements. El drafter no posee caché propia: lee la caché compartida del modelo destino (`shared_kv.{sliding,full}_attention.{key,value}`) en modo solo lectura, y no emite tensores `present.*`. La decodificación se realiza mediante el generador `SinglePositionMultiTokenCandidateGenerator`, que en cada paso alimenta la entrada combinada, emite un token de borrador por argmax y recicla el estado proyectado como siguiente estado ocultado.

## Capacidades

- Decodificación especulativa: genera tokens candidatos para el modelo destino `gemma-4-E2B-it`, acelerando la inferencia al proponer múltiples tokens que el destino valida en paralelo.
- Uso de caché compartida: lee la caché de clave-valor del modelo destino en modo solo lectura, sin mantener caché propia, lo que reduce el consumo de memoria.
- Cabezal de vocabulario sparse: solo computa logits para 4096 posiciones activas del vocabulario de 262144, reduciendo el coste de proyección por token.
- Reciclaje de estado oculto: el `projected_state` de salida se recicla como entrada en el siguiente paso de borrador, permitiendo un flujo de decodificación autónomo sin red de recurrencia adicional.
- Integración con ONNX Runtime: funciona con `CUDAExecutionProvider` y está validado en NVIDIA H200, con compatibilidad para el pipeline de onnx-genai.
- Paridad con Hugging Face: la selección de posiciones activas por el router de centroides coincide exactamente con el modelo HF (Jaccard 1.0) y el argmax coincide en todos los pasos de verificación forzada.

## Casos de uso

- Aceleración de inferencia en producción: como drafter en un sistema de decodificación especulativa, el modelo permite generar tokens de borrado a alta velocidad para que el modelo destino los valide, reduciendo la latencia de inferencia en entornos de servidor con GPUs como H200.
- Despliegue de Gemma-4 en ONNX Runtime: este repositorio sirve como referencia para exportar y ejecutar modelos de la familia Gemma 4 con onnx-genai, permitiendo integrarlos en pipelines existentes basados en ONNX sin depender de Transformers.
- Evaluación de metadatos de inferencia: el repositorio documenta el proceso de creación de metadatos canónicos para decodificación especulativa, incluyendo el contrato de gráfico y las discrepancias pendientes, útil para desarrolladores que trabajan en el esquema de metadatos de onnx-genai.
- Investigación en decodificación especulativa: permite estudiar el comportamiento de un drafter con caché prestada y cabeza de vocabulario sparse, incluyendo la deriva de precisión fp16 vs bf16 observada en pasos libres.
- Benchmarking de paridad ONNX vs Hugging Face: el repositorio incluye evidencia de paridad (Jaccard 1.0, coseno 0.9998) que puede usarse como banco de pruebas para validar otras exportaciones ONNX de modelos de decodificación especulativa.
- Desarrollo de herramientas de profiling: el ejemplo de onnx-genai con `ONNX_GENAI_TRACE` permite capturar el timeline de ejecución del drafter y el destino, útil para optimizar el rendimiento de sistemas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye evidencia de paridad funcional con el modelo de Hugging Face, pero no se reportan métricas de rendimiento como tokens por segundo, latencia o throughput. La única referencia de hardware es que se validó en una NVIDIA H200 con fp16.

## Requisitos de hardware

- GPU recomendada: NVIDIA H200 (entorno de validación del autor); cualquier GPU con soporte CUDA y al menos 16 GB de VRAM debería ser suficiente para el drafter de 0.4 GB en fp16.
- VRAM estimada: el repo pesa 0.4 GB en fp16, pero el uso total de memoria depende del modelo destino con el que se empareja, ya que el drafter lee su caché de clave-valor.
- No cabe en GPU de consumo como RTX 4090 si se usa junto con el modelo destino completo, aunque el drafter por sí solo es ligero.
- Opciones de despliegue: ONNX Runtime con `CUDAExecutionProvider`, integrable con onnx-genai para el flujo de decodificación especulativa.
- Latencia y throughput: no disponibles; la evidencia de paridad sugiere que el drafter ONNX coincide con el de Hugging Face en los primeros ~4 tokens de borrado, con deriva posterior por acumulación fp16 vs bf16.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| `google/gemma-4-E2B-it-assistant` | 4 capas, atención deslizante/full | No disponible | Apache-2.0 | Safetensors | Drafter de decodificación especulativa |
| `justinchuby/onnx-genai-example-gemma4-e2b-assistant` (este) | 4 capas, misma arquitectura | No disponible | Apache-2.0 | ONNX fp16 | Drafter ONNX para ONNX Runtime |
| `justinchuby/onnx-genai-example-gemma4-e2b` | Modelo destino Gemma-4 E2B | No disponible | Apache-2.0 | ONNX | Modelo principal de decodificación |

La comparativa con otros drafteres de decodificación especulativa genéricos (como los usados en vLLM o TensorRT-LLM) no está disponible en la información proporcionada. Este modelo se distingue por su cabeza de vocabulario sparse con centroides y por la caché prestada en modo lectura, lo que reduce el consumo de memoria del drafter.

## Limitaciones y advertencias

- El modelo es un drafter, no un modelo de propósito general: solo genera tokens de borrador para el modelo destino `gemma-4-E2B-it` y no puede usarse de forma autónoma para tareas de generación de texto.
- La deriva de precisión fp16 vs bf16 hace que el drafter ONNX coincida con el de Hugging Face solo en los primeros ~4 tokens de borrado; en ejecución libre, se desvía después de ese punto.
- Las metadatas de inferencia aún no son totalmente fieles al artefacto real: hay tres discrepancias pendientes con el esquema canónico de onnx-genai (ausencia de `present_*`, repos separados para proponer y destino, y representación de la caché compartida).
- No se dispone de datos sobre sesgos, alucinación o limitaciones de idioma, ya que el modelo card no los documenta.
- El modelo solo funciona con `CUDAExecutionProvider`; no se ha validado en CPU ni en otros backends.
- El uso en producción requiere emparejar este drafter con el modelo destino correspondiente, lo que añade complejidad de despliegue adicional.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/justinchuby/onnx-genai-example-gemma4-e2b-assistant
- Modelo base de Google: https://huggingface.co/google/gemma-4-E2B-it-assistant
- Modelo destino emparejado: https://huggingface.co/justinchuby/onnx-genai-example-gemma4-e2b
- Modelo destino original: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de mobius: https://github.com/onnxruntime/mobius
- Colección de Gemma 4 ONNX de justinchuby: https://huggingface.co/collections/justinchuby/gemma-4-onnx
- Colección de ejemplos de metadatos de inferencia: https://huggingface.co/collections/justinchuby/onnx-genai-inference-metadata-examples
- Repositorio de onnx-genai: https://github.com/justinchuby/onnx-genai
- Ejemplos de onnx-genai: https://github.com/justinchuby/onnx-genai/tree/main/examples
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
