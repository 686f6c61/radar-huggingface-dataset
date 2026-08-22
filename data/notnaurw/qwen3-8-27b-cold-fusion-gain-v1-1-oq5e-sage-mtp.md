# notnaurw/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ5e-SAGE-mtp

## Resumen

El modelo `Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ5e-SAGE-mtp` es una cuantización de precisión mixta de 5 bits del modelo `Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`, desarrollada por el usuario `notnaurw`. Se construye sobre el backend `oQe` de la librería oMLX y emplea el pipeline SAGE (Streamed, Activation-guided calibration, Grid allocation, Error compensation), diseñado para maximizar la fidelidad al checkpoint original en bf16 manteniendo el mismo tamaño de archivo y la misma asignación de bits. El resultado es un modelo de 20,29 GB (18,90 GiB) con 5,8432 bits por peso y los cabezales de multi-token prediction (MTP) intactos.

La base arquitectónica es el modelo `Qwen3.8-27B` de Alibaba, un transformer denso de 27,78 mil millones de parámetros con arquitectura híbrida: 16 de sus 64 capas usan atención completa y las 48 restantes usan atención lineal con estado recurrente constante. Además, es un modelo de visión-lenguaje (image-text-to-text). La cuantización no modifica la arquitectura, solo los pesos. El modelo se distribuye en formato MLX safetensors y está pensado para ser servido con `mlx-lm` o `mlx-vlm`, preferiblemente con Lightning MTP activado en oMLX.

Este lanzamiento es relevante porque ofrece una cuantización de alta fidelidad (23,8% de reducción de divergencia KL respecto a una cuantización oQ5e estándar) sin sacrificar el tamaño ni la estructura de tensores. Sin embargo, no se han ejecutado benchmarks de tareas downstream, y la evaluación de fidelidad se realizó solo en texto, dejando sin medir el comportamiento multimodal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (transformer híbrido con atención lineal y completa, visión-lenguaje) |
| Parámetros totales | 27,78 mil millones (según la model card) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 5 bits base con 70 overrides por tensor según sensibilidad, grupo de 64 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

Este modelo no ha sido entrenado desde cero, sino que es una cuantización post-entrenamiento del checkpoint `Qwen3.8-27B-Cold-Fusion-GAIN-V1.1`, que a su vez deriva del modelo base `Qwen/Qwen3.8-27B`. La arquitectura subyacente es un transformer de visión-lenguaje con 64 capas, de las cuales 16 usan atención completa (intervalo 4) y 48 usan atención lineal con estado recurrente constante. El modelo base fue entrenado por el equipo de Qwen con un pipeline de instrucción y alineación, y la variante Cold Fusion (GAIN + Unsloth) añade un método de entrenamiento que reduce los tokens de pensamiento en los modos de razonamiento sin perder rendimiento.

La cuantización se realizó con oMLX (versión 0.6.3rc2) y el pipeline SAGE, que combina calibración guiada por activaciones, asignación de bits por rejilla (grid allocation) y compensación de errores de segundo orden por capa. El proceso se ejecutó sobre un cache de referencia generado a partir del modelo bf16 original, con un corpus de código multilingüe (128 muestras × 1024 tokens). Se preservaron los tensores MTP (29 tensores, 15 parámetros), lo que permite que servidores con soporte de multi-token prediction sigan funcionando. No se ha publicado información sobre el dataset de entrenamiento original ni sobre el proceso de alineación, ya que la model card solo describe la cuantización.

## Capacidades

- Generación de texto y conversación en lenguaje natural (heredado del modelo base).
- Razonamiento y resolución de problemas, incluyendo tareas de matemáticas y lógica (heredado).
- Capacidades de visión-lenguaje (image-to-text), no evaluadas en esta cuantización.
- Multi-token prediction (MTP) preservado, lo que permite decodificación especulativa en servidores compatibles.
- Compatible con el ecosistema MLX (mlx-lm, mlx-vlm) y con servidores que soporten oMLX.
- No se ha confirmado si el modelo base soporta tool calling o function calling, ni si esta cuantización lo preserva.

## Casos de uso

- Despliegue en Apple Silicon: al estar en formato MLX, se ejecuta de forma nativa en Macs con chips M1/M2/M3/M4, usando la memoria unificada. Es adecuado para aplicaciones locales de escritorio o servidores en entornos de Apple.
- Inferencia con VRAM limitada: el peso del modelo ocupa 20,3 GB, por lo que puede caber en GPUs de consumo con 24 GB de VRAM (RTX 4090) o en A100 de 40 GB, permitiendo ejecutar un modelo de 27B sin necesidad de clústeres.
- Prototipado rápido con mlx-lm: se puede cargar y probar con comandos simples como `python -m mlx_vlm.generate`, lo que facilita pruebas de concepto para asistentes conversacionales.
- Aplicaciones de asistente personal: dado que hereda el comportamiento del modelo base, puede usarse en chatbots de texto o sistemas de preguntas y respuestas con contexto largo (si el modelo base lo soporta, aunque no se especifica la longitud).
- Análisis de documentos con imagen: aunque la parte visual no ha sido validada en esta cuantización, el modelo base es capaz de procesar imágenes y texto, por lo que se podría usar con `mlx-vlm` para tareas de extracción de información multimodal.
- Investigación en eficiencia de cuantización: este modelo sirve como ejemplo de una cuantización de alta fidelidad con MTP preservado, útil para estudiar el impacto de la cuantización en modelos híbridos de atención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas downstream (como MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de fidelidad al modelo bf16 original, que son las siguientes:

| Métrica | Valor |
|---|---|
| head-KL (divergencia KL sobre top-1024 logits) | 0,00691 |
| Acuerdo top-1 con el modelo bf16 | 0,9442 |
| Reducción de divergencia vs cuantización oQ5e estándar | +23,8% |

Estas métricas se obtuvieron sobre un cache de referencia con 128 muestras × 1024 tokens, top-k 1024, y semilla 123. No son comparables con benchmarks de tareas y no se ha medido la calidad de la respuesta en tareas concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de pesos ocupa 20,3 GB. Con el overhead de KV cache y activaciones, se recomienda al menos 24 GB de VRAM para ejecución en GPU. En Macs, se necesitan al menos 32 GB de memoria unificada para dejar espacio al sistema.
- GPU recomendadas: RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB). En GPUs con 16 GB (RTX 3080/4080) no cabría el modelo completo.
- En consumer GPU: sí, con RTX 4090 o RTX 4080 Super (16 GB) no es suficiente, pero RTX 4090 sí.
- Opciones de despliegue: `mlx-lm` y `mlx-vlm` para Apple Silicon, o servidores compatibles con oMLX que soporten MTP (Lightning MTP). También se puede usar en vLLM si se convierte el formato, pero el formato MLX no es estándar para vLLM, por lo que se requiere conversión previa.
- Latencia y throughput: no se han publicado datos. Dependerá del hardware y del uso de MTP.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en tareas, por lo que la comparativa se limita a características técnicas:

| Modelo | Parámetros | Formato | Tamaño | Contexto | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (bf16) | 27,78B | safetensors bf16 | ~55 GB | no disponible | Apache-2.0 |
| Este modelo (cuantizado) | 27,78B | MLX safetensors 5-bit | 20,29 GB | no disponible | Apache-2.0 |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF (GGUF) | 27,78B | GGUF (varios) | ~20-30 GB según cuantización | no disponible | Apache-2.0 |

La principal diferencia con la versión GGUF es el formato (MLX vs GGUF), lo que condiciona la herramienta de despliegue. La versión GGUF se sirve con llama.cpp o Ollama, mientras que esta versión MLX se sirve con mlx-lm. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- La visión no fue evaluada en la cuantización: las métricas de fidelidad son solo texto. El comportamiento con imágenes o vídeo no está medido.
- No se han ejecutado benchmarks de tareas downstream; la fidelidad al bf16 no garantiza la precisión en tareas concretas.
- La fidelidad se mide contra el modelo bf16, no contra la verdad fundamental, por lo que puede reproducir errores del modelo original.
- El tokenizer hereda una variante de regex de Mistral (`\p{L}+` en lugar de `[\p{L}\p{M}]+`), que puede dividir marcas de combinación descompuestas de forma diferente. Para texto precompuesto es idéntico al base.
- No se conocen los idiomas soportados ni la longitud de contexto exacta, ya que no se especifica en la documentación.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base y el checkpoint intermedio tengan la misma licencia (el base Qwen3.8-27B es Apache-2.0).
- El tamaño del archivo (20,3 GB) requiere hardware con suficiente memoria; en GPUs de 16 GB no es viable sin offloading adicional.
- No hay información sobre la calidad de la generación en comparación con el modelo original; la cuantización puede introducir errores en tareas complejas.

## Enlaces

- [HuggingFace: notnaurw/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ5e-SAGE-mtp](https://huggingface.co/notnaurw/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-oQ5e-SAGE-mtp)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Checkpoint original: DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1](https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1)
- [Repositorio de oMLX](https://github.com/jundot/omlx)
- [Artículo en HackerNoon sobre Cold Fusion](https://hackernoon.com/qwen38-27b-cold-fusion-cuts-thinking-tokens-without-sacrificing-performance)
- [Recetas de vLLM para Qwen3.8-27B](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
