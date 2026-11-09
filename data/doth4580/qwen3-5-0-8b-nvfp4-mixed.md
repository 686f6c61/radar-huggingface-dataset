# doth4580/Qwen3.5-0.8B-NVFP4-MIXED

## Resumen

Qwen3.5-0.8B-NVFP4-MIXED es una versión cuantizada del modelo Qwen3.5-0.8B del equipo Qwen de Alibaba, publicada por el usuario doth4580. El artefacto contiene pesos modificados (cuantización NVFP4/FP8) del modelo original y se distribuye principalmente para ejecutarse con el motor de inferencia veloGB10 sobre sistemas NVIDIA DGX Spark / GB10. No se trata de un modelo nuevo, sino de un empaquetado optimizado del modelo base con licencia Apache-2.0.

El modelo base es un transformer denso híbrido de 873 millones de parámetros que combina 18 capas GatedDeltaNet (atención lineal con estado recurrente de tamaño fijo) con 6 capas de atención completa GQA. Incorpora una cabeza MTP (multi-token prediction) nativa pensada para decodificación especulativa, un vocabulario de 248.320 tokens y una ventana de contexto de 262.144 tokens.

La relevancia de este artefacto es doble: por un lado, demuestra la viabilidad de servir un modelo de menos de mil millones de parámetros con contexto de 256K en hardware compacto (DGX Spark); por otro, el formato `nvfp4-pack-quantized` es compatible con `compressed-tensors`, por lo que puede cargarse en cualquier framework que lea dicho formato, no solo en veloGB10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (18 capas GatedDeltaNet + 6 capas full GQA) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (todas las GEMM) excepto proyecciones de entrada/salida GDN en FP8 (`nvfp4-mixed`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, `nvfp4-pack-quantized` (compatible con compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida: 18 capas de GatedDeltaNet, un mecanismo de atención lineal con estado recurrente de tamaño fijo, intercaladas con 6 capas de atención completa con GQA (8 cabezas de consulta y 2 de clave/valor). La dimensión oculta es 1024. Esta combinación busca reducir el coste de atención en contextos largos manteniendo capacidad de recuperación exacta en las capas GQA periódicas. Incluye además una cabeza MTP nativa que permite decodificación especulativa.

Este artefacto concreto no aporta entrenamiento nuevo: los pesos se obtuvieron cuantizando el modelo original con el cuantizador offline de veloGB10 (`nvfp4-mixed`). Todas las GEMM se almacenan en NVFP4 salvo las proyecciones de entrada y salida de las capas GatedDeltaNet, que se mantienen en FP8 por sensibilidad numérica. El tokenizador y la plantilla de chat son idénticos a los del modelo original. No se dispone de información sobre el dataset de entrenamiento del modelo base en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" (el pack activa thinking por defecto en las pruebas del autor).
- Capacidad de conversación multi-turno con contexto de hasta 262.144 tokens.
- Decodificación especulativa mediante la cabeza MTP nativa, con aceptación de borrador medida del 25,5 % (TP=1) y 84,6 % (TP=4).
- Servicio distribuido en tensor parallel (TP=1, TP=2 y TP=4) con el motor veloGB10.
- API compatible con OpenAI (`/v1`) a través de veloGB10.
- Soporte de prefix caching en el motor de referencia.
- Soporte de tool calling, function calling, agentes, visión, audio o capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat de baja latencia en hardware compacto: con 873 M de parámetros en NVFP4 (0,63 GB en disco) y un motor optimizado para GB10, puede desplegarse en una única DGX Spark para asistentes conversacionales con respuestas rápidas (hasta 207 tok/s de decodificación en turnos de código con TP=1).
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir, extraer información o responder preguntas sobre contratos, informes o transcripciones extensas en una sola pasada sin truncamiento.
- Generación de código asistida en local: el rendimiento medido es superior en turnos de código (207 tok/s con TP=1) que en narración (169 tok/s), lo que lo hace adecuado para autocompletado o revisión de código en entornos con requisitos de privacidad.
- Despliegue en clústeres pequeños de DGX Spark: el soporte TP=2 y TP=4 con reparto de pesos por red (sin copia local en los nodos) permite escalar el servicio agregando máquinas sin duplicar almacenamiento.
- Prototipado e investigación de cuantización NVFP4: al ser compatible con `compressed-tensors`, sirve como referencia para evaluar la calidad de NVFP4 frente a FP8 o BF16 en modelos pequeños con atención híbrida.
- Backend de agentes con contexto largo y prefix caching: la caché de prefijos del motor reduce el coste de repetir system prompts extensos en flujos multi-paso.
- Evaluación de decodificación especulativa: la cabeza MTP incluida permite medir la aceptación de borradores en distintas topologías (25,5 % en TP=1 frente a 84,6 % en TP=4) para estudios de latencia.

## Benchmarks y rendimiento

El autor publica mediciones de VeloBench (2026-11-06, veloGB10 0.7.7 dev) sobre la API servida en máquinas GB10, con sampling de producción, thinking activado y una petición simultánea en las columnas de petición única. La decodificación se expresa en tokens de salida por segundo e incluye decodificación especulativa. Variación aproximada de ±10 % entre ejecuciones.

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de narracion (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP del pack | 207 | 169 | 115 | 12.768 | 372 | 25,5 % |
| TP=2 | Cabeza MTP del pack | 149 | 158 | 87 | 12.301 | 327 | no disponible |
| TP=4 | Cabeza MTP del pack | 153 | 145 | 91 | 8.979 | 309 | 84,6 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el pack ocupa 0,63 GB en disco en NVFP4/FP8; la memoria en GPU debe acomodar además el estado recurrente de GatedDeltaNet y la caché KV de las capas GQA para la longitud de secuencia configurada. No se dispone de cifras exactas de VRAM por token de contexto.
- GPU recomendadas: NVIDIA DGX Spark / GB10, que es el hardware de referencia y validación del autor.
- Cabe en GPU de consumo: no disponible; el artefacto está validado específicamente en GB10 con el motor veloGB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`), con servidor compatible OpenAI en el puerto 9000. Al usar formato `compressed-tensors`, en teoría puede cargarse en otros frameworks que lean dicho formato, pero no hay validación publicada fuera de veloGB10.
- Topologías soportadas: TP=1 (una GB10), TP=2 y TP=4 (clúster de GB10 con reparto de pesos por red y caché local en los nodos).
- Latencia y throughput: prefill de 12.768 tok/s (TP=1), 12.301 tok/s (TP=2) y 8.979 tok/s (TP=4); decodificación agregada con 2 peticiones de 372 tok/s (TP=1), 327 tok/s (TP=2) y 309 tok/s (TP=4).
- Opciones de arranque documentadas: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--default-presence-penalty 2.0`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-NVFP4-MIXED (este) | 873 M | 262.144 | NVFP4/FP8 | Apache-2.0 | Optimizado para veloGB10 en GB10 |
| Qwen/Qwen3.5-0.8B (base) | 873 M | 262.144 | BF16 (original) | Apache-2.0 | Pesos sin cuantizar; mayor huella de memoria |
| Alternativas de ~1B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información sobre otros modelos comparables (por ejemplo, variantes cuantizadas de la misma familia o modelos de tamaño similar con contexto de 256K) en la documentación aportada.

## Limitaciones y advertencias

- Artefacto derivado: los pesos están modificados respecto al original; cualquier evaluación de calidad debe tener en cuenta la pérdida introducida por NVFP4/FP8.
- Validación limitada al motor veloGB10: aunque el formato es estándar `compressed-tensors`, no hay pruebas publicadas con vLLM, llama.cpp, TGI u Ollama.
- Rendimiento medido con una sola ejecución por celda y variación de ±10 %; no debe interpretarse como cifra estable de producción.
- La aceptación del borrador especulativo en TP=1 es baja (25,5 %), lo que limita la ganancia de la decodificación especulativa en esa topología.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática del modelo base en la documentación proporcionada.
- El autor no reclama propiedad intelectual sobre el modelo; los derechos pertenecen a los autores originales bajo Apache-2.0, licencia que se mantiene en este repositorio.
- Uso comercial: permitido por Apache-2.0, pero conviene revisar la licencia del modelo base y las condiciones de uso de veloGB10 (también Apache-2.0).
- El pack está pensado y ajustado para GB10; desplegarlo en otro hardware sin validación previa es un riesgo no cuantificado.
- No se han publicado métricas de calidad (perplejidad, benchmarks de razonamiento o código) para esta cuantización concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.5-0.8B-NVFP4-MIXED
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
