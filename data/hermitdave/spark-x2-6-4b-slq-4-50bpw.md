# hermitdave/Spark-X2.6-4B-SLQ-4.50bpw

## Resumen

Spark-X2.6-4B-SLQ-4.50bpw es un checkpoint cuantizado del modelo XHToken/Spark-X2.6-4B, publicado por hermitdave. Aplica SLQ (Statistically-Lossless Quantization), una técnica de cuantización de precisión mixta por capas presentada en COLM 2026, para reducir el peso del modelo de 7,657 GiB en BF16 a 2,821 GiB, un factor de 2,71x, con un promedio de 4,4944 bits por parámetro.

El artefacto está empaquetado para MLX, el framework de Apple para inferencia en silicio de Apple, y requiere `trust_remote_code=True` porque mlx-lm importa un `slq_model.py` generado. No es un modelo nuevo: es una compresión del modelo base, por lo que sus capacidades de generación de texto y conversación dependen del modelo original.

Su relevancia es doble: permite ejecutar un modelo nominal de 4B en equipos Apple con requisitos de memoria reducidos y sirve como caso práctico para evaluar la recuperación de calidad de SLQ. La perplejidad medida es 24,52 frente a 23,22 del BF16, con una recuperación media del 93,51% en tres tareas zero-shot. La información pública no detalla arquitectura, licencia ni idiomas del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura del modelo base) |
| Parámetros totales | 4B nominales del modelo base; 925.127.680 parámetros contabilizados en los safetensors del checkpoint cuantizado (empaquetado uint32; el autor no documenta la discrepancia) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | SLQ de precisión mixta a 4,4944 bpw; distribución 8 bits 16,7%, 5 bits 49,5%, 4 bits 33,8%; group size 128 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con checkpoint MLX empaquetado; rejillas enteras en `uint32`; requiere `slq_model.py` (custom code) |
| Modelo base | XHToken/Spark-X2.6-4B |
| Tamaño del artefacto | 2,821 GiB; repositorio de 3,0 GB |
| Precisión de referencia | BF16, 7,657 GiB |
| Calibración | FineWeb-Edu, 8.192 tokens, longitud de secuencia 512 |
| Biblioteca | MLX / mlx-lm |

## Arquitectura y entrenamiento

La model card no proporciona información sobre la arquitectura del modelo base Spark-X2.6-4B, sus datos de entrenamiento, el número de tokens utilizados ni si hubo RLHF o DPO. El repositorio documenta únicamente el proceso de cuantización aplicado sobre dicho modelo.

SLQ asigna anchos de bits por capa mediante una heurística greedy con un objetivo de 4,5 bpw. Las rejillas enteras se almacenan como `uint32` y se descomprimen dentro de `mx.quantized_matmul`. La calibración se realizó con FineWeb-Edu, 8.192 tokens y secuencias de 512 tokens. La implementación original de SLQ es de IST-DASLab (Michael Helcig, Eldar Kurtic y Dan Alistarh); el port a MLX para Apple Silicon lo realizó Hermes Agent (Nous Research) y la cuantización hermitdave. El autor describe el resultado como "statistically-lossless", aunque las métricas medidas muestran una degradación no nula.

## Capacidades

- Generación de texto autoregresiva, según el pipeline `text-generation`.
- Conversación multi-turno, según la etiqueta `conversational`; no se aportan evaluaciones específicas de diálogo.
- No hay documentación sobre tool calling ni function calling.
- No hay documentación sobre uso como agente ni razonamiento multi-paso.
- No hay información sobre capacidades multilingües ni sobre el rendimiento en castellano.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Requiere cargar código personalizado del repositorio (`slq_model.py`) para construir la arquitectura.

## Casos de uso

- **Prototipado local en Mac**: el checkpoint ocupa 2,821 GiB y se ejecuta con `mlx_lm.generate`, por lo que permite probar generación de texto en un portátil Apple sin depender de servicios en la nube.
- **Asistente conversacional offline**: al ser un modelo de texto con etiqueta `conversational`, puede usarse para diálogos privados donde los datos no salgan del dispositivo; la calidad dependerá del modelo base, no evaluada en esta ficha.
- **Investigación sobre cuantización**: permite reproducir las métricas de perplejidad y las tareas zero-shot publicadas, comparando BF16 frente a SLQ 4,50 bpw con los comandos incluidos en la model card.
- **Evaluación de SLQ en Apple Silicon**: sirve para medir el equilibrio entre tamaño, velocidad y calidad en hardware MLX, un entorno menos explorado que CUDA para técnicas de compresión.
- **Generación de borradores y texto auxiliar**: adecuado para tareas de redacción no críticas en local, siempre que se validen las salidas y se acepte la degradación medida frente al BF16.
- **Docencia y reproducibilidad**: útil para explicar cuantización de precisión mixta, calibración con FineWeb-Edu y recuperación de tareas zero-shot a partir de un caso real con métricas publicadas.
- **Pruebas de integración de código personalizado**: permite validar el flujo `trust_remote_code=True` de mlx-lm y auditar cómo se importa y ejecuta `slq_model.py` en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

Perplejidad en FineWeb-Edu, 512 secuencias:

| Modelo | PPL | Ratio |
|---|---:|---:|
| BF16 | 23,22 | 1,000 |
| SLQ 4,50 bpw | 24,52 | 1,056 |

Recuperación zero-shot, 100 ejemplos por tarea:

| Tarea | BF16 | SLQ 4,50 bpw | Recuperación |
|---|---:|---:|---:|
| arc_challenge | 0,4100 | 0,3600 | 0,8780 |
| hellaswag | 0,4000 | 0,4000 | 1,0000 |
| winogrande | 0,5500 | 0,5100 | 0,9273 |
| Media | | | 0,9351 |

Métricas de distribución en FineWeb-Edu:

| Métrica | Valor |
|---|---:|
| KLD simétrica | 7,949 |
| EAR | 0,9129 |
| Divergencia KL | 0,0614 |

## Requisitos de hardware

- **Memoria estimada**: al menos 2,821 GiB solo para los pesos. Con el overhead de MLX, el tokenizador y la caché KV, se recomienda un mínimo de 8 GB de memoria unificada y 16 GB para secuencias largas o uso concurrente. Es una estimación, no un dato medido.
- **GPU recomendadas**: Apple Silicon M1, M2, M3 o M4. El checkpoint es MLX y no está pensado para A100, H100 ni RTX 4090.
- **Compatibilidad con GPU de consumo**: sí, en equipos Apple con memoria unificada suficiente; no se documenta soporte para GPU NVIDIA o AMD.
- **Opciones de despliegue**: `mlx_lm.generate` y la API Python de mlx-lm con `trust_remote_code=True`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- **Latencia y throughput**: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No se han identificado en la información proporcionada otras alternativas comparables con datos medidos. La comparación disponible se limita al modelo base en BF16 y a la versión cuantizada:

| Modelo | Formato | Tamaño | PPL | Recuperación media | Licencia |
|---|---|---:|---:|---:|---|
| Spark-X2.6-4B | BF16 | 7,657 GiB | 23,22 | referencia | no disponible |
| Spark-X2.6-4B-SLQ-4,50bpw | MLX SLQ | 2,821 GiB | 24,52 | 0,9351 | no disponible |
| Otras cuantizaciones (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia desconocida**: no se indica la licencia del checkpoint ni la del modelo base, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- **"Statistically-lossless" no significa pérdida cero**: la perplejidad aumenta un 5,6% y la recuperación media en zero-shot es del 93,51%, con arc_challenge en 0,8780.
- **Ejecución de código remoto**: `trust_remote_code=True` importa `slq_model.py`; solo debe cargarse en entornos de confianza y conviene auditar el código antes de usarlo.
- **Dependencia de MLX**: el checkpoint no es portable directamente a CUDA o ROCm y no se documenta su uso en vLLM, TGI, llama.cpp u Ollama.
- **Contexto e idiomas sin documentar**: se desconoce la longitud máxima de contexto y el soporte real de idiomas, incluido el castellano.
- **Calibración en inglés**: FineWeb-Edu es un corpus predominantemente inglés; no hay evaluación de la degradación en otros idiomas.
- **Sesgos y alucinación no evaluados**: no se aportan análisis de sesgos, toxicidad ni tasas de alucinación del modelo base o del checkpoint cuantizado.
- **Validación comunitaria mínima**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia independiente.
- **Discrepancia de parámetros**: el nombre indica 4B, pero los safetensors del checkpoint contabilizan 925.127.680 parámetros; el autor no explica esta diferencia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/hermitdave/Spark-X2.6-4B-SLQ-4.50bpw)
- [Modelo base XHToken/Spark-X2.6-4B](https://huggingface.co/XHToken/Spark-X2.6-4B)
- [Paper SLQ (arXiv:2605.02404)](https://arxiv.org/abs/2605.02404)
- COLM 2026: citado en la model card como venue de la publicación, sin URL adicional en la información disponible.
