# Sohailhosseini/Qwen3-4B-NVFP4

## Resumen

El modelo `Sohailhosseini/Qwen3-4B-NVFP4` es una cuantización de 4 bits (esquema NVFP4) del modelo base `Qwen/Qwen3-4B`, desarrollado por Sohailhosseini. El objetivo es reducir la huella de memoria y acelerar la inferencia en hardware Blackwell (B200, RTX Pro 6000, DGX Spark) gracias al uso de tensor cores FP4. El resultado ocupa 2,8 GB en disco, frente a los 8,0 GB del modelo original, una compresión de 2,84x.

Al tratarse de una cuantización del modelo base (no de la variante Instruct), hereda las capacidades del Qwen3-4B original: un transformer denso de 4.022 millones de parámetros, con ventana de contexto de 32.768 tokens y soporte multilingüe. La cuantización se realizó con 256 muestras del dataset `HuggingFaceH4/ultrachat_200k`, dejando la capa `lm_head` sin cuantizar. El formato de pesos es `compressed-tensors`, compatible con vLLM.

La relevancia de este modelo radica en que cubre un hueco en el ecosistema: hay pocas cuantizaciones NVFP4 publicadas en Hugging Face, y esta permite desplegar un modelo de 4B parámetros con muy bajo consumo de VRAM en GPUs Blackwell, manteniendo la licencia Apache-2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B base) |
| Parametros totales | 4.022.468.096 (4,0B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configurado con `--max-model-len 32768`) |
| Tipos de cuantizacion | NVFP4 (4-bit, formato compressed-tensors) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen3-4B es multilingue (mas de 119 idiomas segun el reporte tecnico de Qwen3) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3-4B` es un transformer denso con atención multi-cabeza, parte de la familia Qwen3 desarrollada por Alibaba Cloud. Según el reporte técnico (arXiv:2505.09388), la serie Qwen3 incluye arquitecturas densas y MoE con tamaños de 0,6B a 235B. Qwen3-4B es una de las variantes densas más pequeñas, con 32K de contexto y entrenamiento multilingüe. El modelo base no incluye fine-tuning instruct, por lo que no está alineado para chat ni soporta nativamente tool calling.

La cuantización NVFP4 es un esquema de 4 bits con punto flotante FP4, diseñado para aprovechar los tensor cores FP4 de las GPUs Blackwell (B200, RTX Pro 6000). El proceso de cuantización se realizó con la herramienta `HF-quantized`, utilizando 256 muestras del dataset `HuggingFaceH4/ultrachat_200k` para calibración. La capa `lm_head` se dejó sin cuantizar para preservar la precisión de la salida. La cuantización se ejecutó en una GPU A40, aunque la aceleración en inferencia solo es efectiva en hardware Blackwell.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo base, puede completar texto, continuar secuencias y generar contenido a partir de prompts arbitrarios.
- Razonamiento y matemáticas: hereda las capacidades del Qwen3-4B base, que muestra buen rendimiento en tareas de razonamiento y aritmética según el reporte técnico de Qwen3.
- Generación de código: el modelo base tiene capacidad de completar y generar código en varios lenguajes, aunque sin fine-tuning específico.
- Multilingüe: el modelo base soporta más de 119 idiomas, aunque la model card de esta cuantización no detalla la lista.
- No incluye soporte nativo de tool calling, function calling ni modos de agente, ya que es una versión base sin fine-tuning instruct.
- No incluye modo "thinking" (razonamiento extendido) que sí está presente en las variantes Instruct-Thinking de Qwen3.

## Casos de uso

- Inferencia de baja latencia en GPUs Blackwell: gracias al formato NVFP4 y la aceleración FP4, este modelo es adecuado para servir texto generativo en tiempo real en B200 o RTX Pro 6000, donde el rendimiento es significativamente mayor que con cuantizaciones estándar de 4 bits.
- Prototipado y experimentación con modelos base: investigadores que necesitan probar el comportamiento del Qwen3-4B original sin ocupar 8 GB de VRAM pueden usar esta versión cuantizada para pruebas preliminares.
- Despliegue en entornos con VRAM limitada: con solo 2,8 GB en disco y un consumo de VRAM estimado en torno a 3-4 GB (pesos + overhead), cabe en GPUs de gama media como RTX 4090 (aunque sin aceleración FP4 nativa) y en sistemas con memoria compartida.
- Fine-tuning posterior: aunque la cuantización NVFP4 no está pensada para entrenamiento, se puede usar como punto de partida para estudiar el impacto de la cuantización en el fine-tuning, o descomprimir y usar el modelo original para entrenar.
- Generación de texto en pipelines de producción con vLLM: el comando `vllm serve` permite integrar el modelo en servicios REST, con soporte de streaming y gestión de contexto largo de hasta 32K tokens.
- Evaluación comparativa de esquemas de cuantización: al estar disponible el `recipe.yaml` con el stack exacto de modificadores, es útil para reproducir y comparar la pérdida de calidad frente a otras cuantizaciones (GPTQ, AWQ, FP8).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad (MMLU, HumanEval, GSM8K, etc.) para esta cuantización específica. El modelo base `Qwen/Qwen3-4B` tiene resultados publicados en el reporte técnico de Qwen3 (arXiv:2505.09388), pero no se han reproducido aquí para esta versión NVFP4.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para los pesos (2,8 GB en disco) más la caché KV y activaciones, dependiendo de la longitud de secuencia.
- GPU recomendadas: cualquier GPU Blackwell con soporte FP4, como B200, RTX Pro 6000 o DGX Spark. En estas tarjetas la inferencia es rápida gracias a los tensor cores FP4.
- En GPUs no Blackwell (por ejemplo, RTX 4090, A100, A40), el modelo puede cargarse pero sin aceleración FP4, por lo que el rendimiento será similar a una cuantización de 4 bits estándar o incluso peor. La model card advierte explícitamente que solo es rápido en Blackwell.
- Opciones de despliegue: vLLM (recomendado, con `vllm serve`), y cualquier framework que soporte el formato `compressed-tensors` con NVFP4. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no se proporcionan datos concretos en la model card. En hardware Blackwell, se espera un throughput alto debido a la aceleración FP4, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `Sohailhosseini/Qwen3-4B-NVFP4` | 4,0B | 32K | NVFP4 (compressed-tensors) | Apache-2.0 | Base, sin fine-tuning instruct |
| `Qwen/Qwen3-4B` (original) | 4,0B | 32K | BF16/FP16 | Apache-2.0 | Base, 8 GB en disco |
| `Firworks/Qwen3-4B-Instruct-2507-nvfp4` | 4,0B | 32K | NVFP4 | Apache-2.0 | Instruct con fine-tuning, actualizado a 2507 |

La principal diferencia con el modelo original es el tamaño (2,8 GB frente a 8 GB) y la velocidad en Blackwell. Frente a la versión Instruct de Fireworks, esta cuantización es del modelo base, por lo que no está alineada para chat ni tiene las mejoras de la versión 2507 (que incluye actualizaciones de razonamiento y generación).

## Limitaciones y advertencias

- Pérdida de precisión inherente a la cuantización de 4 bits: aunque NVFP4 está optimizado, puede degradar ligeramente la calidad de generación frente al modelo en BF16.
- Rendimiento solo óptimo en hardware Blackwell: en GPUs sin tensor cores FP4, la inferencia será lenta o no aprovechará el formato.
- Modelo base sin fine-tuning instruct: no está alineado para diálogo, puede generar contenido sesgado o inapropiado si se usa directamente en producción sin un sistema de moderación.
- Sin soporte nativo de tool calling ni agentes: para aplicaciones que requieran estas capacidades, es necesario hacer fine-tuning o usar la variante Instruct.
- Idiomas no documentados en la model card: aunque el modelo base es multilingüe, la card no especifica qué idiomas están realmente soportados en esta cuantización.
- No se han publicado benchmarks de calidad para esta cuantización, por lo que el impacto real en tareas específicas es desconocido.
- La licencia Apache-2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no se otorgan garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sohailhosseini/Qwen3-4B-NVFP4
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Reporte técnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Modelo similar de Fireworks (Instruct NVFP4): https://huggingface.co/Firworks/Qwen3-4B-Instruct-2507-nvfp4
