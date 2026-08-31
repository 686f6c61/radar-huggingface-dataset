# KartiOS/Karti-Small-VL-4B-NVFP4

## Resumen

Karti-Small-VL-4B-NVFP4 es una versión cuantizada en precisión NVFP4 (4 bits de punto flotante de NVIDIA) del modelo Karti-Small-VL-4B, desarrollado por KartiOS (Lumbridge). Se trata de un modelo multimodal de 4 000 millones de parámetros diseñado para ejecutarse localmente y combinar dos capacidades esenciales para agentes domésticos o de escritorio: interpretar imágenes y realizar llamadas a herramientas (tool calling). La versión NVFP4 reduce el tamaño en disco de 9,3 GB (BF16) a 3,7 GB y multiplica por 2,5 el rendimiento de inferencia en hardware Blackwell, manteniendo la torre de visión completamente sin cuantizar para no degradar la percepción visual.

El modelo está pensado para entornos de producción con GPUs NVIDIA Blackwell (sm_120+), como la DGX Spark (GB10) o las RTX serie 50. Su ventana de contexto alcanza los 32 768 tokens, y su licencia Apache 2.0 permite uso comercial sin restricciones. La cuantización se ha realizado con la librería compressed-tensors, excluyendo explícitamente los tensores de visión, la cabeza de lenguaje y otras capas sensibles, lo que preserva la calidad en tareas de lectura de paneles y reducción de alucinaciones en identificadores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + lenguaje), basado en Qwen3.5 según tags |
| Parametros totales | 4 539 265 536 (safetensors) / 4,66 B (según model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens |
| Tipos de cuantizacion | NVFP4 (compressed-tensors), también disponible en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (NVFP4 y BF16) |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal que combina un codificador visual con un modelo de lenguaje, siguiendo el patrón de la familia Qwen3.5 (según los tags del repositorio). El modelo base Karti-Small-VL-4B fue entrenado para tareas de visión-lenguaje y tool calling, y esta versión NVFP4 es el resultado de cuantizar ese modelo base con la librería compressed-tensors de NVIDIA.

La receta de cuantización excluye explícitamente 297 tensores de visión (98 módulos), la cabeza de lenguaje (`lm_head`), las capas MTP (multi-token prediction) y las capas de atención lineal convolucional (`linear_attn.conv1d`). En total se cuantizan 248 módulos. La calibración se realizó con el conjunto de test de `lmms-lab/flickr30k` (512 muestras, secuencia de 2048 tokens, semilla 115) usando el procesador de imágenes del propio modelo, nunca texto solo. Esta calibración está congelada para permitir comparaciones versión a versión.

El modelo no incluye cabeza MTP, por lo que no dispone de decodificación especulativa integrada (a diferencia de la versión BF16). Se recomienda servir los pesos directamente, no como adaptador LoRA sobre el base.

## Capacidades

- Comprensión de imágenes: puede describir, analizar y extraer información de imágenes, incluyendo lectura de paneles, colores y objetos.
- Tool calling: soporta llamada a herramientas mediante el parser `qwen3_xml`, lo que permite integrarlo en agentes que ejecutan acciones.
- Razonamiento aritmético: el README muestra resultados correctos en operaciones como 19×23 = 437.
- Conversación multimodal: pipeline `image-text-to-text`, capaz de mantener diálogos con entrada visual y textual.
- Modo de pensamiento: se puede desactivar o activar mediante `enable_thinking` en la plantilla de chat.
- Cuantización NVFP4 optimizada para Blackwell: mantiene la precisión visual al no cuantizar la torre de visión.

## Casos de uso

- Agente doméstico local: un asistente que recibe una foto de la nevera y llama a una herramienta para añadir productos a una lista de la compra, gracias a su tool calling y visión.
- Automatización de lectura de paneles: en entornos industriales o de laboratorio, el modelo puede leer medidores o displays y registrar los valores mediante llamadas a APIs.
- Asistente de accesibilidad: describir imágenes a personas con discapacidad visual en tiempo real, con baja latencia en hardware local.
- Clasificación y moderación de contenido: analizar imágenes y decidir si cumplen políticas, invocando herramientas de bloqueo o reporte.
- Agente de código con contexto visual: capturar una pantalla de error y llamar a una herramienta de búsqueda o a un terminal para diagnosticar problemas.
- Sistema de inventario con cámara: reconocer productos en una estantería y actualizar una base de datos mediante tool calls, todo en un dispositivo edge con GPU Blackwell.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K), pero sí métricas propias de calidad sobre 603 filas de evaluación, comparando el modelo NVFP4 con el base sin entrenar y con la versión BF16:

| Metrica | Base (sin entrenar) | NVFP4 | BF16 |
|---|---|---|---|
| Tasa de identificadores inventados | 0,378 | 0,048 | 0,023 |
| Lectura de paneles | 0,595 | 0,924 | 0,967 |

En rendimiento de inferencia sobre NVIDIA DGX Spark (GB10), con vLLM 0.27.1, contexto de 32k, KV cache FP8 y temperatura 0:

| Tokens generados | BF16 | NVFP4 |
|---|---|---|
| 128 | 21,0 tok/s | 51,7 tok/s |
| 512 | 21,1 tok/s | 51,8 tok/s |
| Tamaño en disco | 9,3 GB | 3,7 GB |
| Huella de servicio | ~20 GB | ~8 GB |

## Requisitos de hardware

- GPU obligatoria: arquitectura Blackwell (sm_120+), como NVIDIA DGX Spark (GB10), RTX 5090, RTX 5080, B200, etc. No funciona en GPUs Ampere o anteriores.
- VRAM estimada: ~8 GB para servir con NVFP4 (frente a ~20 GB en BF16), según la model card.
- Inferencia: se recomienda vLLM (versión 0.27.1 o superior) con `--kv-cache-dtype fp8` para optimizar memoria.
- Despliegue alternativo: no se mencionan otros runners como llama.cpp u Ollama; la compatibilidad está orientada a vLLM y entornos con compressed-tensors.
- Latencia: 51,7 tok/s en DGX Spark para generación de 128 tokens, con degradación menor bajo contención que BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Karti-Small-VL-4B-NVFP4 (este) | 4,66 B | 32 768 | NVFP4 | Apache-2.0 | Requiere Blackwell, 3,7 GB |
| Karti-Small-VL-4B (BF16) | 4,66 B | 32 768 | BF16 | Apache-2.0 | 9,3 GB, incluye MTP para decodificación especulativa |
| Qwen2.5-VL-3B (referencia) | 3 B | 32 768 | BF16/FP16 | Apache-2.0 | No requiere Blackwell, pero sin tool calling nativo |

No se dispone de datos de rendimiento comparativo con otros modelos de la misma categoría más allá del propio base BF16. La principal diferencia frente a alternativas es la restricción de hardware a GPUs Blackwell, a cambio de un rendimiento muy superior en ese hardware.

## Limitaciones y advertencias

- Requiere hardware Blackwell (sm_120+): no es ejecutable en GPUs de generaciones anteriores, lo que limita su despliegue en parques de hardware existentes.
- Sin decodificación especulativa: al no incluir cabeza MTP, no aprovecha la aceleración adicional que sí tiene la versión BF16.
- Degradación de precisión: la cuantización NVFP4 reduce la exactitud frente a BF16, especialmente en lectura de identificadores exactos (0,048 vs 0,023 de tasa de inventados). Para tareas que requieran máxima fidelidad, se recomienda usar BF16.
- Idiomas no especificados: no se ha publicado información sobre los idiomas soportados, aunque al estar basado en Qwen3.5 probablemente cubra múltiples lenguas.
- Sin benchmarks estándar: no hay resultados de MMLU, HumanEval u otros tests comunes, lo que dificulta comparar con otros modelos de forma objetiva.
- Calibración congelada: la receta de cuantización está fijada, por lo que no se puede reentrenar o ajustar sin invalidar las comparaciones.

## Enlaces

- Modelo NVFP4 en HuggingFace: https://huggingface.co/KartiOS/Karti-Small-VL-4B-NVFP4
- Modelo base BF16: https://huggingface.co/KartiOS/Karti-Small-VL-4B
- Colección de modelos NVFP4 de RedHatAI: https://huggingface.co/collections/RedHatAI/nvfp4-models
- Página del modelo en FriendliAI (para despliegue en API): https://friendli.ai/models/KartiOS/Karti-Small-VL-4B
