# esatapedico/Qwen3.8-27B-NVFP4-BUDGET-GGUF

## Resumen

Qwen3.8-27B es un modelo denso de 27B parámetros desarrollado por el equipo Qwen de Alibaba, con capacidades multimodales nativas (imagen y vídeo) y razonamiento configurable. Este repositorio, creado por esatapedico, ofrece dos variantes GGUF compactas del checkpoint cuantizado en NVFP4 por Unsloth, con la particularidad de haber eliminado la cabeza MTP de decodificación especulativa. El objetivo es permitir ejecutar el modelo en tarjetas gráficas Blackwell de 16 GB de VRAM, algo inviable con las versiones completas. La arquitectura es híbrida (Gated DeltaNet + Gated Attention), con contexto nativo de 262.144 tokens, lo que lo hace adecuado para tareas de análisis de documentos extensos y agentes de larga duración.

La variante BUDGET, objeto de esta ficha, emplea un backbone NVFP4 de 448 tensores byte-idéntico al de la familia MTP del autor, con la cabeza de salida (lm_head) cuantizada en Q3_K y la embedding de tokens en Q2_K. El archivo pesa 14,72 GB y ha sido probado en una RTX 5070 Ti de 16 GB, alcanzando picos de 15,9 GiB de VRAM. No se ha realizado ningún entrenamiento adicional; se trata de una conversión a GGUF de un modelo ya cuantizado, bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet + Gated Attention (densa, 64 capas) |
| Parametros totales | 26.895.998.800 (26,9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | NVFP4 (backbone, 448 tensores), Q3_K lm_head + Q2_K token embedding (BUDGET); Q2_K ambos (STARVED) |
| Idiomas soportados | inglés, multilingüe (lista completa no disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, tipo NVFP4 GGML type 40) |

El archivo BUDGET ocupa 14,72 GB; el STARVED, 14,59 GB. Ambos contienen 1.187 tensores: 448 del backbone NVFP4, 737 de normas/escalas/gates en F32 y los dos tensores de cabeza.

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida que combina Gated DeltaNet (una capa de atención lineal con estado recurrente) y Gated Attention (atención tradicional con puertas). Es un modelo denso de 27B con 64 capas y contexto nativo de 262.144 tokens. No se dispone de información detallada sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en los materiales consultados; el modelo original se publica bajo Apache-2.0.

Este repositorio concreto no ha sido entrenado ni fine-tuneado. Es una conversión a GGUF del checkpoint NVFP4 de Unsloth, que a su vez cuantiza el modelo original de Qwen. La conversión elimina la cabeza MTP (multi-token prediction) usada para decodificación especulativa, reduciendo el tamaño y la huella de memoria. El backbone de 448 tensores NVFP4 es byte-idéntico en toda la familia de repositorios del autor, verificado por tensor con SHA-256. La atención se re-cuantiza a NVFP4 desde el formato F8 original, lo que implica una segunda etapa de cuantización que puede afectar ligeramente a la precisión.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (temperatura 1.0, top_p 0.95, top_k 20) y modo instruct (temperatura 0.7, top_p 0.80, top_k 20).
- Visión nativa: procesa imágenes y vídeo mediante el proyector multimodal (mmproj) que debe cargarse junto al GGUF con `--mmproj`.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y agentes de larga duración.
- Capacidades multilingües (inglés y otros, sin lista detallada en la información disponible).
- Sin cabeza MTP: no hay decodificación especulativa en este formato.
- Compatible con llama.cpp y llama-server, siempre que se use una versión reciente con kernels CUDA NVFP4 y soporte sm_120 (Blackwell).

## Casos de uso

- Análisis de documentos extensos: con 262K de contexto, puede procesar informes, contratos o libros completos en una sola pasada, resumiendo o extrayendo información con alta fidelidad. Es adecuado para auditorías legales o revisión de documentación técnica.
- Asistente de programación con visión: puede leer capturas de pantalla de código, diagramas de arquitectura o esquemas de flujo y generar o corregir código en consecuencia, gracias a su capacidad multimodal.
- Agentes autónomos de larga duración: el contexto amplio permite mantener historial de conversación y estado durante horas de interacción, útil para automatización multi-paso en entornos de desarrollo o investigación.
- Atención al cliente multilingüe: puede gestionar conversaciones en varios idiomas con contexto largo, manteniendo el hilo de la interacción y resolviendo incidencias complejas sin perder información previa.
- Análisis de vídeo: al ser un VLM nativo con soporte de vídeo, puede transcribir y resumir contenido audiovisual, como tutoriales, reuniones grabadas o material de formación.
- Despliegue en hardware de consumo: al caber en 16 GB de VRAM, permite ejecutar un modelo de 27B con visión en estaciones de trabajo con RTX 5070 Ti o similares, sin necesidad de GPUs de datacenter, lo que facilita prototipado y pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente mediciones de rendimiento de inferencia en una RTX 5070 Ti (16 GB Blackwell) con contexto de 32k, KV en q4_0, documento fuente de 28k tokens y `max_tokens` 2000:

| Tier | Prefill t/s | Decode t/s | req s | content distinct_ratio |
|---|---|---|---|---|
| BUDGET (Q3_K / Q2_K) | 2287,3 | 27,05 | 126,5 | 0,9877 |
| STARVED (Q2_K / Q2_K) | 2289,2 | 27,37 | 98,7 | 1,0 |

Estos números son indicativos de una sola ejecución y no son comparables con otras configuraciones de contexto o hardware. El pico de VRAM observado fue de 15,9 GiB para BUDGET y 15,7 GiB para STARVED.

## Requisitos de hardware

- VRAM mínima: 16 GB (probado en RTX 5070 Ti, pico 15,9 GiB con BUDGET y 15,7 GiB con STARVED a 32k de contexto).
- GPU recomendadas: cualquier GPU Blackwell con sm_120 (serie RTX 50) y soporte NVFP4 en llama.cpp. No funciona en generaciones anteriores (Ampere, Turing) por el requisito de kernels NVFP4.
- Opciones de despliegue: llama.cpp / llama-server (con `--mmproj` para visión). El formato GGUF está pensado para este ecosistema; para vLLM o SGLang se necesitaría el checkpoint original.
- Latencia y throughput: aproximadamente 2288 t/s de prefill y 27 t/s de decode en la configuración descrita (32k contexto, RTX 5070 Ti).
- Para reducir aún más el consumo de VRAM, se puede cargar el modelo sin el proyector multimodal (texto únicamente), liberando aproximadamente 1 GB.

## Comparativa con modelos similares

El modelo base Qwen3.8-27B pertenece a la familia Qwen3.8, que incluye Qwen3.8-2.4T-A95B (MoE con 95B activos) y Qwen3.8-Max (propietario). No se dispone de datos comparativos de rendimiento en benchmarks estándar entre estas variantes en la información proporcionada. Como referencia de la generación anterior, Qwen3-27B (sin visión) también está disponible bajo Apache-2.0, pero no se han publicado comparativas directas. Se recomienda consultar los repositorios oficiales de Qwen y Unsloth para benchmarks detallados.

## Limitaciones y advertencias

- La cuantización NVFP4 del backbone y la re-cuantización de la atención desde F8 pueden degradar la calidad frente al modelo original en BF16; el autor advierte de "accuracy trade-offs".
- La cabeza MTP se ha eliminado, por lo que no hay decodificación especulativa; esto puede afectar al throughput en comparación con las versiones con MTP.
- Requiere hardware Blackwell (sm_120) y una versión reciente de llama.cpp con soporte NVFP4; no funcionará en GPUs más antiguas.
- El modelo es multilingüe pero no se especifica la lista completa de idiomas; el rendimiento puede variar significativamente fuera del inglés.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para estas variantes GGUF, por lo que el rendimiento real en tareas concretas es incierto.
- Los números de rendimiento proporcionados son de una sola ejecución y no son comparables con otras configuraciones.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales de uso (consultar la documentación oficial de Qwen).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-BUDGET-GGUF
- Repositorio hermano con MTP: https://huggingface.co/esatapedico/Qwen3.8-27B-NVFP4-MTP-GGUF
- Modelo base NVFP4 de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de hardware y ejecución (Yottalabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
