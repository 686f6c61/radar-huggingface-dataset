# pipenetwork/Qwen3.8-Flash-Next-MLX-8bit

## Resumen

Qwen3.8-Flash-Next-MLX-8bit es una conversión a MLX (Apple Silicon) del modelo Qwen3.8-Flash-Next de Qwen, cuantizada a 8 bits. El modelo original es un MoE híbrido de 125 mil millones de parámetros con 6 mil millones activos por token, complementado con una tabla de embeddings n-gram de 51 mil millones de parámetros, lo que suma aproximadamente 176 mil millones de parámetros en total. Emplea la arquitectura experimental Qwen4 (etiquetada como `qwen4_exp`), que combina Gated-DeltaNet, atención sparse y un mecanismo de hashing n-gram para mejorar la eficiencia en contexto largo.

Este repositorio, creado por PipeNetwork, reduce el peso del modelo de 360 GB (bfloat16) a 192,2 GB en cuantización de 8 bits, manteniendo una pérdida de calidad estadísticamente insignificante según las pruebas de perplexidad publicadas. Es relevante porque permite ejecutar un modelo de este tamaño en hardware Apple Silicon con memoria unificada, algo que de otro modo sería inviable. Incluye un runtime propio basado en una pull request abierta de mlx-lm, con tres correcciones numéricas respecto al código original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated-DeltaNet / sparse-attention MoE con hashed n-gram embedding (Qwen4 experimental) |
| Parametros totales | 125B (MoE) + 51B n-gram embeddings ≈ 176B |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 8-bit (grupo 64 para la mayoría, grupo 32 para tablas n-gram); también existen versiones 6-bit y mixed 2-bit |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next pertenece a la serie Qwen3.8 de Qwen y utiliza la arquitectura Qwen4, una evolución experimental que combina varias innovaciones: capas de atención sparse, un mecanismo de Gated-DeltaNet para modelado de secuencias, y una tabla de embeddings basada en n-gramas con hash (51B parámetros) que complementa la representación token. El componente principal es un MoE con 125B parámetros totales, de los cuales 6B se activan por token, lo que reduce el coste computacional en inferencia. La torre de visión (0,4B parámetros) está incluida en los pesos pero no se utiliza en el runtime de texto de este repositorio.

No se proporcionan detalles específicos sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la información disponible. El modelo se distribuye bajo la licencia comunitaria de Qwen 1.0.

## Capacidades

- Generación de texto y razonamiento complejo en lenguaje natural.
- Soporte de contexto largo de hasta 262K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidades multimodales de visión en el modelo original, aunque el runtime de este repositorio es solo de texto.
- Razonamiento avanzado gracias a la arquitectura híbrida y al mecanismo de n-gram embeddings.
- No se documenta explícitamente soporte de tool calling, function calling o agentes en la información proporcionada.

## Casos de uso

- Análisis de documentos legales o académicos extensos: la ventana de 262K tokens permite procesar libros completos o expedientes largos en una sola pasada, extrayendo conclusiones y resumiendo secciones específicas.
- Generación de código en proyectos grandes: con su capacidad de razonamiento y contexto amplio, puede ayudar a refactorizar repositorios enteros, explicar fragmentos heredados o generar tests unitarios para módulos complejos.
- Asistencia en investigación científica: revisión de artículos de varias decenas de páginas, comparación de metodologías y síntesis de resultados en informes estructurados.
- Chat conversacional de largo recorrido: mantener hilos de conversación con historial extenso sin perder el hilo, útil para asistentes virtuales o tutorías personalizadas.
- Traducción y adaptación de contenido multilingüe: aunque no se especifican idiomas, los modelos Qwen suelen soportar múltiples lenguas; puede usarse para traducir documentos técnicos manteniendo coherencia terminológica.
- Prototipado rápido de agentes de razonamiento: al ser un MoE con 6B activos, permite iterar sobre pipelines de razonamiento multi-paso en entornos con recursos limitados, siempre que se disponga de suficiente memoria unificada.

## Benchmarks y rendimiento

La model card publica resultados de perplexidad en wikitext-2 (test) con 296.815 tokens en 145 ventanas de 2048, comparando el modelo bfloat16 original con las versiones cuantizadas. La comparación se realiza por ventanas emparejadas y con intervalos de confianza bootstrap.

| Build | Tamaño | Perplexidad | ΔNLL/token vs bf16 [IC 95%] | Ventanas peores |
|---|---:|---:|---:|---:|
| bfloat16 (upstream) | 360,0 GB | 4,4708 | — | — |
| 8-bit (este repo) | 192,2 GB | 4,4749 | +0,0009 [−0,0003, +0,0021] | 73/145 |
| 6-bit | 148,0 GB | 4,4767 | +0,0013 [−0,0003, +0,0029] | 81/145 |

El intervalo de confianza que cruza cero indica que la versión de 8 bits es estadísticamente indistinguible del modelo bfloat16 en este corpus. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- Al ser un modelo MLX, está diseñado para Apple Silicon (M-series). Requiere una cantidad muy elevada de memoria unificada: el checkpoint de 8 bits ocupa 192,2 GB en disco, por lo que se necesita un Mac con al menos 256 GB de RAM unificada para cargarlo cómodamente.
- No es viable en GPUs de consumo convencionales (RTX 4090, etc.) por su tamaño y por estar optimizado para MLX.
- Para ejecutarlo se usa `mlx-lm` con `--trust-remote-code`, ya que el runtime `qwen4_exp` no está integrado en la versión estable de mlx-lm.
- El throughput y la latencia dependen del número de núcleos de la CPU/GPU de Apple Silicon y de la memoria disponible; no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (bf16) | 176B (125B+51B) | 6B | 262K | Qwen Community 1.0 | safetensors |
| Este repo (8-bit MLX) | 176B | 6B | 262K | Qwen Community 1.0 | MLX (safetensors) |
| Versión 6-bit MLX | 176B | 6B | 262K | Qwen Community 1.0 | MLX (safetensors) |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación consultada.

## Limitaciones y advertencias

- El modelo es experimental (`qwen4_exp`): la arquitectura Qwen4 no está soportada oficialmente por mlx-lm y requiere cargar código remoto (`trust_remote_code`), lo que implica riesgos de seguridad y estabilidad.
- El runtime incluido contiene tres correcciones numéricas respecto a la pull request original de mlx-lm; aunque se han validado contra transformers 5.16, no es un soporte oficial.
- La torre de visión está presente en los pesos pero no se utiliza en este runtime; cualquier uso multimodal requiere otro despliegue.
- No se documentan sesgos específicos, pero al ser un modelo grande entrenado con datos web, puede presentar alucinaciones y reflejar sesgos sociales presentes en los datos de entrenamiento.
- La licencia Qwen Community 1.0 permite uso comercial, pero debe revisarse el texto completo para condiciones específicas.
- El tamaño del modelo (192 GB en 8-bit) limita su despliegue a equipos con memoria unificada muy alta, lo que reduce su accesibilidad práctica.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pipenetwork/Qwen3.8-Flash-Next-MLX-8bit
- Repositorio GitHub de PipeNetwork (código del port): https://github.com/PipeNetwork/qwen38-flash-next-mlx
- Repositorio GitHub de PipeNetwork para Qwen3.8-2.4T: https://github.com/PipeNetwork/qwen38-mlx/tree/main/
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guía de unsloth para ejecutar Qwen3.8-Flash-Next localmente: https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Versión mixed 2-bit del mismo modelo: https://huggingface.co/Sawfwair/Qwen3.8-Flash-Next-MLX-Mixed-2bit
