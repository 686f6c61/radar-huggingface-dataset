# barozp/Qwen3.8-27B-Opus-Distill-v2-GGUF

## Resumen

El modelo `barozp/Qwen3.8-27B-Opus-Distill-v2-GGUF` es una colección de cuantizaciones GGUF para el modelo de safetensors `barozp/Qwen3.8-27B-Opus-Distill-v2`, un ajuste fino LoRA del modelo base `Qwen/Qwen3.8-27B` (27B parámetros, arquitectura híbrida Gated-DeltaNet / full-attention) sobre trazas de razonamiento de Claude Opus. La versión v2 corrige un bug de la v1 que provocaba bucles de auto-verificación sin salida visible cuando se aplicaban ciertas restricciones de formato apiladas (por ejemplo, "no prose" + "no markdown"). El autor, `barozp`, reconstruyó el dataset de entrenamiento con trazas verificadas como genuinas de Opus y añadió un paso de filtrado con un jurado LLM en paralelo.

Esta versión GGUF incluye cuantizaciones desde BF16 hasta IQ1_M, junto con el proyector de visión (`mmproj`) en f16. El modelo mantiene las capacidades multimodales del base (entrada de imagen y vídeo) y el soporte de decodificación especulativa auto-especulativa mediante la cabeza MTP (Multi-Token Prediction), aunque esta última no fue entrenada en el ajuste fino. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Gated-DeltaNet / full-attention (Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (MAX_SEQ de entrenamiento: 4096) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ3_XXS, IQ2_XXS, IQ1_M |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer denso de 64 capas con atención de consultas agrupadas (24 cabezas de consulta, 4 de clave/valor) y un tamaño oculto de 5120. Su arquitectura híbrida combina capas de Gated-DeltaNet (una variante de atención lineal con estado recurrente) con capas de atención completa, lo que reduce el coste computacional en secuencias largas. El ajuste fino se realizó con LoRA (r=64, alpha=64, dropout 0.05) sobre 11.716 ejemplos del dataset `barozp/opus-reasoning-distill-v2`, compuesto exclusivamente por trazas de razonamiento verificadas como genuinas de Claude Opus. El entrenamiento duró una época (696 pasos) con una tasa de aprendizaje de 1e-4 en coseno y un 3% de warmup, batch efectivo de 16, secuencia máxima de 4096 tokens y precisión bf16, completándose en aproximadamente 4 horas y 15 minutos en una A100 de 80 GB. La pérdida final de validación fue 0.4334.

La cabeza de visión (mmproj) y la cabeza MTP se heredaron sin cambios del checkpoint base, por lo que no fueron entrenadas en el ajuste fino. La versión v2 corrige el bug de la v1 reconstruyendo el dataset con trazas verificadas y aplicando un filtrado con un jurado de 30 LLMs en paralelo para descartar ejemplos con el patrón patológico.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras significativas en tareas de razonamiento (ARC, GPQA) respecto al modelo base, según los benchmarks de la model card.
- Soporte multimodal de entrada de imagen y vídeo mediante el proyector `mmproj-f16.gguf`, que debe cargarse junto con cualquier cuantización.
- Decodificación especulativa auto-especulativa usando la cabeza MTP (Multi-Token Prediction), activable con `--spec-type draft-mtp` en `llama-cli` o `llama-server`.
- Ejecución solo texto sin necesidad del proyector de visión.
- Compatibilidad con la librería llama.cpp y sus herramientas (`llama-cli`, `llama-server`), así como con servidores compatibles con endpoints (FriendliAI, etc.).
- No se especifican en la documentación disponible capacidades de tool calling, agentes o multilingüismo específicas; estas dependerían del modelo base Qwen3.8-27B, pero no se detallan en la model card.

## Casos de uso

- Asistente de razonamiento matemático y lógico: el modelo destaca en tareas de razonamiento (mejora de +0.237 en GPQA respecto al base), por lo que puede utilizarse para resolver problemas de matemáticas, física o lógica formal, especialmente cuando se requiere una cadena de pensamiento explícita.
- Generación de código con restricciones de formato estrictas: la corrección del bug en v2 garantiza que el modelo no entre en bucles de auto-verificación al aplicar restricciones apiladas como "no prose" o "no markdown", lo que lo hace fiable para pipelines de generación de código donde se exige un formato de salida concreto.
- Análisis de documentos con imágenes: gracias al proyector de visión, puede procesar capturas de pantalla, diagramas o documentos escaneados y extraer información o responder preguntas sobre ellos, cargando el `mmproj` junto al modelo.
- Chat conversacional con contexto de razonamiento: su capacidad de razonamiento mejorado permite mantener diálogos multi-turno donde se requiere explicar pasos intermedios, justificar decisiones o depurar errores de forma razonada.
- Servicio de inferencia local con cuantización ajustada a VRAM: las distintas cuantizaciones permiten desplegar el modelo en hardware variado, desde tarjetas de 24 GB (Q4_K_M) hasta 8 GB (IQ1_M), usando `llama-server` para servir una API compatible con OpenAI.
- Investigación en destilación de razonamiento: al ser un ejemplo de destilación de un modelo propietario (Claude Opus) sobre un base abierto, puede usarse como caso de estudio para comparar metodologías de destilación y evaluar la transferencia de habilidades de razonamiento.

## Benchmarks y rendimiento

La model card reporta resultados medidos con `lm-evaluation-harness` en modo 0-shot, loglikelihood (opción múltiple), sin chat template y con `--limit 500`. La columna "Delta" compara la versión v2 contra el modelo base Qwen3.8-27B bajo el mismo protocolo.

| Tarea | Métrica | Base | v2 | Delta |
|---|---|---|---:|---:|
| wikitext | word perplexity (menor es mejor) | 8.4335 | 8.3788 | -0.055 |
| mmlu | acc | 0.8494 | 0.8476 | -0.002 |
| hellaswag | acc_norm | 0.7420 | 0.7500 | +0.008 |
| arc_challenge | acc_norm | 0.5880 | 0.6220 | +0.034 |
| gpqa_diamond | acc_norm | 0.2323 | 0.4697 | +0.237 |

Además, la validación del bug fix muestra la convergencia del modelo en el caso de repro exacto (temp=0, seed=1234, `fib(n)` con restricciones apiladas):

| Test | v1 | v2 |
|---|---|---|
| "no prose" + "no markdown" | 3000/3000 tokens, 0 salida visible | 87/4096 tokens, limpio |
| "no prose" + "no comments" | 3000/3000 tokens, 0 salida visible | 73/4096 tokens, limpio |
| Generalización (tarea diferente) | -- | 43/4096 tokens, limpio |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo):
  - BF16: 54.7 GB (referencia, requiere GPU de 80 GB o múltiples)
  - Q8_0: 29.0 GB (GPU de 32 GB o más)
  - Q6_K: 22.4 GB (GPU de 24 GB o más)
  - Q5_K_M: 19.5 GB (GPU de 24 GB)
  - Q4_K_M: 16.8 GB (GPU de 24 GB con holgura, o 16 GB con offload parcial)
  - Q3_K_M: 13.5 GB (GPU de 16 GB con offload parcial)
  - IQ3_XXS: 11.4 GB (GPU de 12-16 GB)
  - IQ2_XXS: 8.7 GB (GPU de 8-12 GB)
  - IQ1_M: 7.9 GB (GPU de 8 GB)
- GPU recomendadas: A100 80 GB (entrenamiento y BF16), RTX 4090 / A6000 (24 GB) para Q4_K_M y superiores, RTX 4080 / 3080 (16 GB) para Q3_K_M con offload.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), compatible con servidores de inferencia como FriendliAI. También puede usarse con vLLM si se convierte a safetensors, aunque el repo solo ofrece GGUF.
- Latencia y throughput: no disponibles en la documentación. La decodificación especulativa con MTP puede mejorar el throughput en hardware limitado por cómputo, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27,3 B | No disponible | Preentrenamiento | Apache-2.0 | Modelo base sin ajuste fino de razonamiento |
| barozp/Qwen3.8-27B-Opus-Distill (v1) | 27,3 B | No disponible | LoRA sobre Opus traces | Apache-2.0 | Versión anterior con bug de bucle en restricciones de formato |
| barozp/Qwen3.8-27B-Opus-Distill-v2 | 27,3 B | No disponible | LoRA sobre Opus traces (verificadas) | Apache-2.0 | Versión corregida, objeto de esta ficha |

La comparativa se limita a las versiones del mismo modelo porque no se dispone de datos de otros modelos de razonamiento de tamaño similar en la información proporcionada. El delta de rendimiento frente al base es el dato más relevante: el ajuste fino mejora sustancialmente GPQA (+0.237) y ARC (+0.034) sin degradar MMLU ni wikitext.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo derivado de Qwen3.8-27B, puede heredar sesgos del preentrenamiento y del dataset de destilación de Opus.
- Riesgo de alucinación: no se evalúa explícitamente; como todo LLM, puede generar información falsa, especialmente en tareas abiertas.
- Limitaciones de contexto: la longitud de contexto del modelo no se especifica; el entrenamiento usó MAX_SEQ de 4096, por lo que puede degradarse en secuencias más largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B también es Apache-2.0; no hay restricciones conocidas adicionales.
- La imatrix se reutiliza de la versión v1 y no cubre la cabeza MTP (`blk.64`); `llama-quantize` fija ese bloque a q4_K para evitar fallos, lo que puede afectar ligeramente a la calidad de la decodificación especulativa.
- El proyector de visión (mmproj) no fue entrenado en el ajuste fino; su comportamiento con el modelo destilado no se ha validado específicamente.
- Para cuantizaciones IQ (IQ3_XXS y menores), es imprescindible usar la imatrix incluida; sin ella, el modelo no funciona correctamente en llama.cpp.

## Enlaces

- Repositorio GGUF: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2-GGUF
- Modelo safetensors (fuente): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-v2
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/barozp/opus-reasoning-distill-v2
- Versión v1 (con bug): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill
- Repo GGUF de v1 (imatrix reutilizada): https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-GGUF
- Variante MTP de v1: https://huggingface.co/barozp/Qwen3.8-27B-Opus-Distill-MTP-GGUF
- Página en LLM Explorer: https://llm-explorer.com/model/barozp%2FQwen3.8-27B-Opus-Distill,3VlOlS40JbJDkIo8TeHR6E
