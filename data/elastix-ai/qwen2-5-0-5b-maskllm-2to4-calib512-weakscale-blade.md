# elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib512-weakscale-blade

## Resumen

El modelo `elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib512-weakscale-blade` es una versión comprimida del modelo `Qwen/Qwen2.5-0.5B`, desarrollado por el equipo de elastix-ai. La compresión se realiza mediante el método `blade`, que aplica un patrón de poda estructural 2:4 (sparsity semi-estructurada) a la mayoría de las capas lineales del transformer, manteniendo la arquitectura original del modelo base. El objetivo es reducir el coste computacional y la huella de memoria en inferencia, manteniendo un nivel aceptable de fidelidad respecto al modelo original.

El modelo se calibra con 512 muestras del dataset SlimPajama-6B, con una longitud de secuencia de 2048 tokens, y no se aplica fine-tuning posterior (BEAM fine-tuning desactivado). Los pesos se almacenan en formato FP16 sin cuantización adicional, y el repositorio contiene los pesos en formato `safetensors`. El resultado es un modelo de aproximadamente 494 millones de parámetros, con una degradación medida por divergencia KL en los conjuntos wikitext2 y c4.

Este modelo es relevante para el estudio de técnicas de compresión de modelos de lenguaje, especialmente la poda 2:4, que permite aceleraciones en GPUs modernas con soporte para sparse tensors. Sin embargo, al no incluir evaluación de tareas downstream ni información sobre licencia o idiomas, su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con poda estructural 2:4 en la mayoría de capas lineales |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, la poda es estructural pero no reduce el número de parámetros almacenados) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta 32.768 tokens) |
| Tipos de cuantizacion | Sin cuantización (pesos en FP16, bits 16, tipo gfp con cuantización desactivada) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta más de 29 idiomas) |
| Licencia | No disponible (el modelo base Qwen2.5-0.5B usa Apache 2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen2.5-0.5B, un transformer decoder-only con atención causal estándar, normalización RMSNorm, y funciones de activación SwiGLU en las capas MLP. La compresión se realiza mediante el método `blade`, que aplica un patrón de poda 2:4: en cada bloque de cuatro elementos de las matrices de pesos lineales, se conservan únicamente dos, forzando una estructura de sparsity semi-estructurada que puede ser explotada por kernels optimizados en hardware. El patrón se aplica a todas las capas excepto a los embeddings (`embed_tokens`), la cabeza de salida (`lm_head`), la capa convolucional de atención lineal (`linear_attn.conv1d`) y el router del MLP (`mlp.router`), que se mantienen densos.

La calibración se realiza con 512 muestras del conjunto de validación de SlimPajama-6B, con una longitud de secuencia de 2048 tokens, y no se aplica fine-tuning posterior. El proceso no incluye cuantización de pesos (se mantienen en FP16) ni conversión de expertos a lineales. La configuración de calibración es simétrica en el sentido de que no se usa calibración simétrica (symmetric calibration = false), y se emplea un esquema de búsqueda de escala con 5 pasos de búsqueda en cuadrícula y 2 pasos de pulido con mínimos cuadrados.

## Capacidades

- Generación de texto: al ser una versión podada de Qwen2.5-0.5B, conserva las capacidades básicas de generación autoregresiva del modelo original, aunque con una posible degradación en calidad debido a la poda.
- Razonamiento y comprensión del lenguaje: el modelo base Qwen2.5-0.5B es capaz de tareas de razonamiento, comprensión lectora y respuesta a preguntas, pero no hay evaluación específica para esta versión comprimida.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-0.5B-Instruct soporta estas capacidades, pero esta versión no especifica si se mantienen tras la poda.
- Capacidades multilingües: el modelo base soporta más de 29 idiomas, pero no se ha verificado el comportamiento multilingüe de esta versión.
- No se han documentado capacidades especiales adicionales (visión, audio, etc.) en la información proporcionada.

## Casos de uso

- Inferencia en dispositivos con recursos limitados: al ser un modelo de 0.5B con poda 2:4, puede ejecutarse en GPUs de gama baja o incluso en CPU, aunque el rendimiento exacto depende del soporte de sparsity en el runtime.
- Prototipado y experimentación con compresión de modelos: sirve como ejemplo de aplicación de poda estructural 2:4 sobre un modelo pequeño, útil para investigar el impacto de la sparsity en la calidad de generación.
- Filtrado o preprocesamiento de texto: puede emplearse para tareas de clasificación ligera, extracción de entidades o generación de resúmenes cortos en entornos donde el coste computacional es crítico.
- Educación y demostraciones: adecuado para ilustrar técnicas de compresión de LLMs en entornos académicos o de formación, dado su tamaño reducido y la disponibilidad de la configuración de poda.
- Evaluación de técnicas de calibración: el modelo puede utilizarse para comparar diferentes métodos de calibración (512 muestras, longitud 2048) en términos de divergencia KL y rendimiento posterior.
- Base para fine-tuning posterior: aunque no se ha realizado fine-tuning, el modelo podado podría servir como punto de partida para entrenamiento adicional con el fin de recuperar parte de la calidad perdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas downstream (como MMLU, HumanEval o GSM8K) en la información disponible. La única métrica de evaluación proporcionada es la divergencia KL entre el modelo comprimido y el original, medida en dos conjuntos de datos:

| Dataset | Avg KL | Total KL | Tokens |
| --- | --- | --- | --- |
| wikitext2 | 0.572866 | 3147.3253 | 5.494 |
| c4 | 0.542486 | 19991.6859 | 36.852 |

Estos valores indican una divergencia moderada, pero no permiten comparar directamente con otros modelos en tareas de lenguaje.

## Requisitos de hardware

- VRAM estimada: con 494 millones de parámetros en FP16, el tamaño de los pesos es de aproximadamente 988 MB. Con overhead de activaciones y buffers, se estima un uso de VRAM de entre 1,5 y 2 GB en inferencia, dependiendo de la longitud de secuencia.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. GPUs como NVIDIA T4, RTX 3060 o superiores son suficientes. El soporte de sparsity 2:4 puede aprovechar kernels específicos en GPUs Ampere o posteriores.
- Si cabe en consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales (RTX 2060, RTX 3060, etc.) con cuantización FP16.
- Opciones de despliegue: se puede servir con frameworks que soporten modelos transformer estándar, como vLLM, Hugging Face Transformers, o llama.cpp (aunque la sparsity 2:4 puede no estar optimizada en todos ellos). No se ha confirmado compatibilidad específica con estos runtimes.
- Latencia y throughput: no hay datos publicados. Se espera que la poda 2:4 reduzca el tiempo de computación en comparación con el modelo denso si el runtime aprovecha la sparsity, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
| --- | --- | --- | --- | --- |
| Qwen/Qwen2.5-0.5B (base) | 494M | 32K | Apache 2.0 | Modelo original sin compresión |
| elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib512-weakscale-blade | 494M | No disponible | No disponible | Versión podada 2:4, sin fine-tuning |
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32K | Apache 2.0 | Versión ajustada con instrucciones, no comprimida |

La comparativa se limita al modelo base y su variante instruct, ya que no hay información sobre otros modelos comprimidos similares en la misma categoría. La principal diferencia es la poda estructural aplicada, que no reduce el número de parámetros pero sí la densidad computacional.

## Limitaciones y advertencias

- No se ha realizado una evaluación completa de capacidades lingüísticas, por lo que no se conoce el impacto real de la poda en tareas como razonamiento, generación de código o matemáticas.
- El modelo no ha sido fine-tuneado tras la poda, lo que puede aumentar la probabilidad de alucinaciones y errores gramaticales en comparación con el modelo original.
- La licencia no está especificada en la información proporcionada; se recomienda contactar con el autor antes de usar el modelo en entornos comerciales.
- No se dispone de información sobre la calidad de generación en idiomas distintos del inglés, aunque el modelo base es multilingüe.
- La divergencia KL en los conjuntos de calibración es moderada (≈0.54-0.57), lo que sugiere una pérdida de fidelidad que podría traducirse en respuestas menos coherentes.
- La poda 2:4 solo es beneficiosa si el hardware y el software de inferencia soportan sparse tensors; en caso contrario, el rendimiento puede ser similar al modelo denso con una calidad inferior.
- El repositorio no incluye un pipeline de inferencia ni documentación sobre cómo cargar y ejecutar el modelo correctamente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/elastix-ai/Qwen2.5-0.5B-maskllm-2to4-calib512-weakscale-blade)
- [Modelo base Qwen2.5-0.5B](https://huggingface.co/Qwen/Qwen2.5-0.5B)
- [Informe técnico de Qwen2.5 (arXiv)](https://arxiv.org/abs/2412.15115)
- [Colección Qwen2.5 en Hugging Face](https://huggingface.co/collections/Qwen/qwen25)
