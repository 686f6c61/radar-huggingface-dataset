# acyildirimer/Qwen3.8-27B-AutoQuant-NVFP4-FP8-5bit

## Resumen

El modelo `acyildirimer/Qwen3.8-27B-AutoQuant-NVFP4-FP8-5bit` es una versión cuantizada del modelo multimodal Qwen3.8-27B de Alibaba, desarrollada por acyildirimer mediante NVIDIA ModelOpt. Utiliza una mezcla de precisión NVFP4 (W4A16) y FP8 (W8A8) para las proyecciones del lenguaje, mientras que el vision tower, el MTP head, los embeddings y las normas se mantienen en BF16. El objetivo es reducir el peso del modelo a aproximadamente 20.4 GB sin reentrenamiento, manteniendo un rendimiento cercano al original. Es relevante para quienes necesitan ejecutar un modelo de 27B en GPUs con memoria limitada, especialmente en entornos de producción con vLLM.

El checkpoint está diseñado para usarse con vLLM y requiere soporte específico para cuantización ModelOpt. No se realizó ningún tipo de fine-tuning; la cuantización es puramente post-entrenamiento con calibración determinista. La ruta de texto fue la única validada en esta versión, aunque el modelo base es multimodal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (imagen-texto a texto) basado en Qwen3.8-27B |
| Parametros totales | 16.809.390.832 (según safetensors del repositorio cuantizado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 (W4A16) y FP8 (W8A8) mixto, con componentes en BF16 |
| Idiomas soportados | No disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint para vLLM con ModelOpt) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal que procesa entradas de imagen y texto. La cuantización se realizó sin fine-tuning adicional, utilizando NVIDIA ModelOpt 0.46.0 con 1.024 muestras de calibración deterministas de 512 tokens. Se asignaron 309 módulos de proyección del lenguaje a NVFP4 (W4A16) y 92 a FP8 (W8A8), mientras que el `lm_head` se cuantizó a NVFP4 con grupo de tamaño 16. El vision tower, el MTP head, los embeddings, las normas y los componentes de control se mantienen en BF16. La cuantización busca un objetivo de 5.0 bits efectivos para los pesos del lenguaje cuantizados, excluyendo los componentes BF16 y la caché KV. No se realizó ningún tipo de entrenamiento posterior.

## Capacidades

- Generación de texto y razonamiento complejo, heredado del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling, validado con `tool-eval-bench` (92/100 normalizado).
- Capacidades multimodales (entrada de imagen y texto), aunque la ruta de texto fue la única validada en esta versión cuantizada.
- Buen rendimiento en tareas de codificación, agentes y automatización de oficina, según el repositorio oficial de Qwen3.8.
- Soporte para decodificación con razonamiento (reasoning parser qwen3) en vLLM.
- Compatible con vLLM para inferencia en producción con tensor parallelism.

## Casos de uso

- Despliegue de un asistente conversacional multimodal en una GPU de consumo (por ejemplo, RTX 4090 con 24 GB) gracias al tamaño reducido del checkpoint (~20.4 GB).
- Agente de automatización de oficina que procesa documentos con imágenes y texto, utilizando tool calling para interactuar con APIs.
- Generación de código asistida en entornos de desarrollo, con soporte de function calling para integrarse en IDEs.
- Sistema de atención al cliente que maneja consultas multimodales (capturas de pantalla, fotos de productos) y mantiene conversaciones de múltiples turnos.
- Investigación en razonamiento matemático y científico, aprovechando los buenos resultados en GSM8K y ARC-C.
- Servicio de inferencia en la nube con vLLM, escalando con tensor parallelism en múltiples GPUs para mayor throughput.

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados reportados por el autor para este checkpoint y las comparaciones con otras versiones del mismo modelo base. Los datos provienen de la model card del autor y del dataset público `witcheer/rtx-5090-benchmarks`. La comparación es indicativa porque los entornos de ejecución difieren.

| Checkpoint | Cuantización | Backend | ARC-C | GSM8K | HumanEval | Media 3 tareas |
|---|---:|---:|---:|---:|---:|
| **Este modelo (AutoQuant NVFP4+FP8)** | ModelOpt NVFP4 + FP8 | vLLM | 96.25 | 96.82 | 93.29 | 95.45 |
| acyildirimer/Qwen3.8-27B-NVFP4 | ModelOpt NVFP4 + FP8 | vLLM | 96.8 | 96.9 | 92.1 | 95.3 |
| Qwen/Qwen3.8-27B (BF16) | BF16 | llama.cpp | 96.8 | 97.4 | 93.9 | 96.0 |
| unsloth/Qwen3.8-27B-NVFP4 | Dynamic V3 NVFP4 | vLLM | 96.9 | 97.1 | 89.6 | 94.5 |
| unsloth/Qwen3.8-27B-GGUF (Q8_0) | Q8_0 | llama.cpp | 96.8 | 97.4 | 94.5 | 96.2 |
| unsloth/Qwen3.8-27B-GGUF (Q6_K) | Q6_K | llama.cpp | 96.7 | 97.5 | 94.5 | 96.2 |
| unsloth/Qwen3.8-27B-GGUF (UD-Q4_K_XL) | UD-Q4_K_XL | llama.cpp | 96.6 | 97.3 | 93.9 | 95.9 |
| unsloth/Qwen3.8-27B-GGUF (Q4_K_M) | Q4_K_M | llama.cpp | 96.8 | 97.1 | 92.7 | 95.5 |

En la evaluación de tool calling, el modelo obtuvo 127/138 puntos (92/100 normalizado) con 60 casos pasados, 7 parciales y 2 fallos, uno de ellos relacionado con resistencia a prompt injection.

## Requisitos de hardware

- Tamaño del checkpoint: aproximadamente 20.4 GB (18.99 GiB), por lo que se necesita una GPU con al menos 24 GB de VRAM para cargar el modelo completo en memoria (por ejemplo, RTX 4090, RTX 5090, A100 40GB).
- Para GPUs con menos memoria, se puede usar tensor parallelism con vLLM (`--tensor-parallel-size 2`) en sistemas con dos GPUs.
- El modelo está optimizado para vLLM con soporte ModelOpt; también puede ejecutarse con otros runtime que soporten NVFP4/FP8, pero no se ha validado.
- No se dispone de datos de latencia o throughput específicos en la información proporcionada.
- Se recomienda usar `--kv-cache-dtype fp8` para la caché KV y `--reasoning-parser qwen3` para aprovechar el modo de razonamiento.

## Comparativa con modelos similares

Este checkpoint se compara directamente con otras cuantizaciones del mismo modelo base Qwen3.8-27B, como se muestra en la tabla de benchmarks. Todas comparten la misma arquitectura y licencia Apache 2.0, pero difieren en el método de cuantización y el backend. La versión AutoQuant NVFP4+FP8 ofrece un equilibrio entre tamaño y rendimiento, situándose cerca del modelo original BF16 en las tres tareas evaluadas, con una media de 95.45 frente a 96.0 del BF16. Frente a la cuantización GGUF Q4_K_M (media 95.5), el rendimiento es prácticamente idéntico, pero el formato NVFP4/FP8 está diseñado para vLLM y puede ofrecer mejor integración con el runtime.

## Limitaciones y advertencias

- Es una cuantización post-entrenamiento con pérdida de precisión; los resultados pueden variar según el protocolo de evaluación, runtime, arquitectura de GPU, longitud de contexto y carga de trabajo.
- El modelo hereda las limitaciones del modelo base Qwen3.8-27B, incluyendo posibles sesgos y riesgo de alucinación.
- La ruta de texto fue la única validada en esta versión; las capacidades multimodales (visión) no han sido probadas con la cuantización, aunque los pesos del vision tower se mantienen en BF16.
- La cuantización mixta requiere un runtime específico (vLLM con soporte ModelOpt) y puede no ser compatible con otros motores de inferencia.
- La caché KV se configura para FP8; si el runtime no soporta ese formato, el rendimiento podría degradarse.
- En la evaluación de tool calling, se detectó un fallo relacionado con prompt injection, por lo que se recomienda implementar defensas adicionales en entornos con herramientas no confiables.
- El número de parámetros reportado (16.8B) difiere del nombre del modelo (27B); esto se debe probablemente a la forma en que se contabilizan los pesos cuantizados en el archivo safetensors, pero no afecta al funcionamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/acyildirimer/Qwen3.8-27B-AutoQuant-NVFP4-FP8-5bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Repositorio de Qwen3.8-27B (AlibabaCloud): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Versión NVFP4 completa: https://huggingface.co/acyildirimer/Qwen3.8-27B-NVFP4
- Dataset de benchmarks (RTX 5090): https://huggingface.co/datasets/witcheer/rtx-5090-benchmarks
