# robgaleano/Swift-1.5-Qwen3.8-27B-MTP-MLX-8bit

## Resumen

Swift 1.5 Qwen3.8-27B MTP MLX 8-bit es un *drafter* de decodificación especulativa basado en Multi-Token Prediction (MTP), extraído y cuantizado a 8 bits del modelo `ukisai/Swift-1.5-Qwen3.8-27b` por el usuario `robgaleano` mediante `mlx-vlm 0.7.8 --mtp`. No se trata de un modelo de chat autónomo, sino de un componente auxiliar (`model_type: qwen3_5_mtp`) que se empareja con el modelo principal `robgaleano/Swift-1.5-Qwen3.8-27B-MLX-8bit` para acelerar la generación de tokens en Apple Silicon.

El modelo resuelve un problema muy concreto: la latencia de inferencia en hardware de Apple. Al actuar como cabecera de predicción multi-token, permite al servidor `mlx_vlm.server` proponer varios tokens candidatos por paso que el modelo principal verifica, alcanzando entre 38,5 y 50,4 tok/s (una mejora de aproximadamente 2,3×–2,5×) en un chip M5 Max, según la model card, sin pérdida de calidad en la salida.

Con 424.699.392 parámetros reales (unos 425 M) y un repositorio de 0,5 GB, es un artefacto ligero y especializado. Su relevancia radica en que permite desplegar el modelo completo de 27B en Macs con memoria unificada manteniendo un throughput interactivo, algo crítico para aplicaciones de chat y agentes en local. La licencia es la Swift Open License v1.0, heredada del modelo adaptado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-Token Prediction (MTP), `model_type: qwen3_5_mtp`, derivada de Qwen3.8 |
| Parámetros totales | 424.699.392 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo principal; el ejemplo de despliegue usa `--max-tokens 32768`) |
| Tipos de cuantización | 8 bits, `group_size=64`, `mode=affine` |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (`license: other`) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El artefacto es una cabecera MTP extraída del modelo base `ukisai/Swift-1.5-Qwen3.8-27b`, que a su vez deriva del `Qwen3.8-27B` de Alibaba Cloud (Qwen Team) bajo Apache 2.0. La arquitectura MTP predice varios tokens futuros en un solo paso hacia delante; en decodificación especulativa, estos tokens candidatos se envían al modelo principal para su verificación en paralelo, aceptándose los que coinciden con la distribución del modelo grande. El resultado es un aumento del throughput sin alterar la distribución de salida, de ahí la afirmación de "cero pérdida de calidad".

La cuantización se realizó con `mlx-vlm 0.7.8` en modo afín de 8 bits con `group_size=64`, lo que reduce el drafter a 449 MB. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados, la composición de los datos ni si hubo fases de RLHF o DPO. Tampoco se detalla la innovación arquitectónica interna del MTP más allá de su función como predictor multi-token.

## Capacidades

- Aceleración de decodificación especulativa: propone bloques de tokens candidatos (`--draft-block-size 4` en el ejemplo) que el modelo principal verifica.
- Integración con `mlx_vlm.server` mediante el flag `--draft-model`.
- Compatibilidad con caché de prefijo (`APC_ENABLED=1`) y `--prefill-step-size 4096`.
- Soporte de modo de razonamiento configurable (`MLX_VLM_DEFAULT_REASONING_EFFORT=xhigh`).
- Generación de texto y conversación, heredadas del modelo principal.
- No es un modelo autónomo: no genera respuestas por sí mismo ni soporta tool calling, agentes o visión de forma independiente.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Chat local en Mac con modelo de 27B: emparejado con el modelo principal 8-bit MLX, permite conversaciones interactivas a 38,5–50,4 tok/s en M5 Max, haciendo viable un asistente de 27B en memoria unificada.
- Servidor de inferencia personal: desplegado con `python -m mlx_vlm.server` y `--draft-model`, ofrece una API compatible con OpenAI para integrar en herramientas propias.
- Asistentes de razonamiento extenso: el modo `xhigh` y una ventana de hasta 32.768 tokens de salida permiten cadenas de razonamiento largas sin penalización excesiva de latencia gracias al drafter.
- Prototipado de pipelines de agentes en local: la caché de prefijo (`APC_ENABLED=1`) acelera iteraciones con prompts de sistema largos y repetidos.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia para medir el impacto de MTP frente a decodificación estándar en Apple Silicon.
- Generación de documentación y código en entornos sin GPU dedicada: el par de modelos cabe en un Mac con memoria unificada suficiente, evitando depender de la nube.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Throughput con drafter | 38,5–50,4 tok/s | M5 Max, según model card |
| Mejora frente a sin drafter | ~2,3×–2,5× | M5 Max, según model card |
| Pérdida de calidad | 0 (según autor) | Verificación por el modelo principal |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el artefacto es un drafter y su evaluación se centra en throughput, no en calidad de tarea.

## Requisitos de hardware

- VRAM/memoria: el drafter ocupa 449 MB en 8 bits; el modelo principal de 27B en 8 bits requiere aproximadamente 27–30 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M5 Max citado en la model card; se recomienda al menos 32 GB para el par completo).
- No está pensado para GPU NVIDIA; la librería `mlx` es específica de Apple Silicon.
- Despliegue: `mlx-vlm` (versión 0.7.8 o superior) mediante `mlx_vlm.server`; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 38,5–50,4 tok/s en M5 Max con `--draft-block-size 4` y `--prefill-step-size 4096`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-MTP-MLX-8bit | 425 M | no disponible | Drafter MTP 8-bit MLX | Swift Open License v1.0 | HuggingFace (78 descargas) |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B | no disponible | Modelo completo BF16 | Swift Open License v1.0 | HuggingFace |
| robgaleano/Swift-1.5-Qwen3.8-27B-MLX-8bit | 27B | no disponible | Modelo principal 8-bit MLX | Swift Open License v1.0 | HuggingFace |
| Qwen/Qwen3.8-27B | 27B | no disponible | Modelo fundacional | Apache 2.0 | HuggingFace |

La comparación directa con otros drafters MTP para MLX no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo principal `robgaleano/Swift-1.5-Qwen3.8-27B-MLX-8bit` y no produce respuestas por sí solo.
- Exclusivo de Apple Silicon: depende de `mlx` y `mlx-vlm`, sin soporte para CUDA, ROCm ni CPU convencional.
- Licencia Swift Open License v1.0: es necesario revisar los términos antes de uso comercial, ya que no es una licencia permisiva estándar como Apache 2.0.
- Riesgo de alucinación: heredado del modelo principal de 27B; el drafter no corrige errores semánticos, solo acelera.
- Idiomas soportados no documentados; la cobertura multilingüe depende del modelo base.
- Contexto máximo no especificado en la model card; el ejemplo usa 32.768 tokens de salida, pero no se confirma la ventana de entrada.
- Sin benchmarks de calidad publicados; la afirmación de "cero pérdida" es del autor y no está verificada de forma independiente.
- Repositorio con 0 descargas verificadas recientes y 0 likes: ecosistema y soporte comunitario limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robgaleano/Swift-1.5-Qwen3.8-27B-MTP-MLX-8bit
- Modelo principal 8-bit MLX: https://huggingface.co/robgaleano/Swift-1.5-Qwen3.8-27B-MLX-8bit
- Modelo base BF16: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Colección Swift 1.5 27B: https://huggingface.co/collections/ukisai/swift-15-27b
- Web de UkisAI: https://ukisai.com/products/swift
- Licencia: https://huggingface.co/robgaleano/Swift-1.5-Qwen3.8-27B-MTP-MLX-8bit/blob/main/LICENSE
- Licencia Apache 2.0 del modelo fundacional: https://huggingface.co/robgaleano/Swift-1.5-Qwen3.8-27B-MTP-MLX-8bit/blob/main/LICENSE-APACHE-2.0
- Aviso de modificación y atribución: https://huggingface.co/robgaleano/Swift-1.5-Qwen3.8-27B-MTP-MLX-8bit/blob/main/NOTICE
- Modelo fundacional Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
