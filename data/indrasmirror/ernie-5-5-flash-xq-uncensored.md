# IndrasMirror/ERNIE-5.5-Flash-XQ-Uncensored

## Resumen

ERNIE-5.5-Flash-XQ-Uncensored es una cuantización mixta de 2,65 bits por peso del modelo baidu/ERNIE-5.5-Flash-Preview, un MoE de 280.000 millones de parámetros desarrollado por el equipo ERNIE de Baidu. La publica IndrasMirror, un desarrollador individual, con el objetivo de hacer que un modelo de esa escala quepa íntegramente en un PC de consumo: una RTX 4090 de 24 GB más unos 96 GB de RAM. El modelo base es Apache 2.0 y esta ficha hereda esa licencia.

La versión XQ aplica cuantización mixta por capa sobre los pesos maestros FP8 de Baidu, eligiendo para cada tensor de experto el formato (tipos IQ2/IQ3) que minimiza el error de salida medido dentro del presupuesto de tamaño. Además, incorpora una edición de rechazo (ablación direccional de rango 1) en las capas 12 a 39, lo que reduce drásticamente las negativas del modelo ante peticiones dañinas. El resultado es un único archivo GGUF de 99,9 GB dividido en diez partes de 10 GiB.

Es relevante porque demuestra que un MoE de 280B con contexto de 1M de tokens puede servirse en hardware de gama alta de consumo, aunque sea con un motor propio (Xolotl) y no con llama.cpp, Ollama o LM Studio, que todavía no soportan ERNIE-5.5. Es una publicación de vista previa, de un solo desarrollador y medida en un único equipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 43 capas (37 de sliding-window comprimida + 6 de atención dispersa), 512 expertos enrutados por capa (top-10 más un experto compartido), residuales hyper-connection |
| Parametros totales | 280.000 millones (los expertos enrutados son ~270B de los 280B) |
| Parametros activos | no disponible (top-10 de 512 expertos enrutados más experto compartido por capa; el autor no publica el recuento exacto) |
| Longitud de contexto | 1.000.000 de tokens (modelo base) |
| Tipos de cuantizacion | Mixta por capa: 2,65 bits por peso de media en expertos (IQ2/IQ3); Q8_0 para atención, expertos compartidos y router en F32; archivo GGUF de 99,9 GB |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (10 partes de 10 GiB que se recombinan con `cat`) |

## Arquitectura y entrenamiento

El modelo base ERNIE-5.5-Flash-Preview es un MoE de 43 capas que combina 37 capas de atención de ventana deslizante comprimida con 6 capas de atención dispersa, 512 expertos enrutados por capa (top-10 más un experto compartido) y residuales de tipo hyper-connection. Su contexto nativo es de 1M de tokens. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

Esta versión XQ se generó a partir de los pesos maestros FP8 de Baidu usando el modelo FP8 como profesor: cada tensor de experto recibe el formato de cuantización que minimiza el error de salida medido para el presupuesto de tamaño del archivo. El resto de componentes (atención, expertos compartidos, router) se mantiene en Q8_0 desde los maestros FP8, con el router en F32. Sobre esa base se aplicó una ablación direccional de rango 1 de la dirección de rechazo, medida en el motor propio del autor y eliminada de los escritores de residuales de las capas 12 a 39, quedando integrada en los pesos. El autor menciona que la decodificación especulativa DSpark (el drafter propio del modelo) está en desarrollo y no incluida en las cifras publicadas.

## Capacidades

- Generación de texto y razonamiento en inglés y chino, con modo de pensamiento (thinking) activado por defecto y desactivable.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` (low, medium, high o none).
- Llamadas a herramientas (tool calls) con API compatible con OpenAI y Anthropic.
- Conversaciones multi-turno con contexto muy largo (hasta 1M de tokens en el modelo base; el autor demuestra reutilización de prefijo en conversaciones de 25K tokens).
- Edición de rechazo aplicada: en la medición del autor, de 48 peticiones dañinas solo se rechazan 5 (frente a 48 del modelo base), manteniendo 0 rechazos en 32 peticiones inocuas.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del modelo.
- No se documentan capacidades de visión ni audio en la información disponible.

## Casos de uso

- Asistente de código en local con contexto largo: el modelo puede mantener conversaciones de decenas de miles de tokens sobre un repositorio y usar tool calling para consultar archivos o ejecutar comandos, sirviéndose de la ventana de 1M del modelo base.
- Servicio de chat autoalojado con API compatible con OpenAI y Anthropic: se puede desplegar con `serve.server` del proyecto Xolotl en el puerto 8140 y conectar clientes existentes sin adaptadores.
- Análisis de documentos extensos en inglés o chino: resúmenes y extracción sobre prompts de 6K a 25K tokens con prefill servido de 115-120 tok/s, adecuado para procesamiento por lotes de contratos o informes.
- Agentes multi-paso con tool calling: el soporte de llamadas a herramientas y el control de esfuerzo de razonamiento permiten orquestar flujos de varios pasos en un solo equipo de consumo.
- Investigación sobre alineación y edición de rechazo: la ablación direccional documentada y las métricas de rechazo publicadas permiten estudiar el efecto de la edición sobre el comportamiento del modelo.
- Experimentación con cuantización extrema de MoE: el pipeline XQ y las mediciones de calidad (acuerdo del primer token en 27 de 32 prompts frente a ~4,25 bits) sirven de referencia para investigar cuantización mixta por capa.
- Prototipado de asistentes en chino sin depender de servicios en la nube, con el modelo residente en un PC con RTX 4090 y 96 GB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que los benchmarks contra el modelo a plena precisión aún no se han hecho.

Los datos publicados son de calidad relativa y velocidad de inferencia:

| Metrica | Valor |
|---|---|
| Acuerdo del primer token frente a cuantización de ~4,25 bits (32 prompts inocuos) | 27 de 32 |
| KL mediana del primer token | 0,008 (media 0,75) |
| Peticiones dañinas rechazadas (48) | 5 (modelo base: 48) |
| Peticiones inocuas rechazadas (32) | 0 (modelo base: 0) |
| Decodificación (32-128 tokens, greedy) | 13,4-14,4 tok/s |
| Prefill con prompt de 1,9K tokens | 94 tok/s |
| Prefill servido con prompts de 6,5K y 25K tokens | 115-120 tok/s |
| Decodificación servida | 14-15 tok/s |
| Turno de seguimiento de +190 tokens sobre conversación de 25K (prefijo reutilizado) | 2,1 s |

## Requisitos de hardware

- VRAM: 24 GB de GPU NVIDIA como mínimo; el resto del modelo reside en RAM (arena de 80 GiB por defecto).
- RAM: ~96 GB libres recomendados; con `--arena-gib` se puede reducir, pero algunos expertos se leen del SSD con penalización de velocidad.
- Almacenamiento: ~200 GB de SSD durante la unión de las diez partes; ~100 GB después.
- GPU recomendadas: RTX 4090 (24 GB) es la configuración medida por el autor; no se documentan otras GPU.
- Cabe en GPU de consumo: sí, en una RTX 4090, siempre que se acompañe de suficiente RAM de sistema.
- Sistema operativo: Linux, con CUDA 12 o 13.
- Despliegue: exclusivamente mediante el motor Xolotl (`ernie_generate`, con `--serve` para servidor compatible con OpenAI y Anthropic). No funciona en la práctica con llama.cpp, Ollama ni LM Studio, que no soportan ERNIE-5.5 todavía.
- Latencia y throughput: decodificación de 13,4-14,4 tok/s y prefill servido de 115-120 tok/s en la configuración medida (RTX 4090, Ryzen 7 5700X, 110 GB de RAM, un NVMe).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-XQ-Uncensored | 280B (MoE) | 1M (base) | 2,65 bits/peso mixta, GGUF 99,9 GB | Apache 2.0 | Xolotl (motor propio) |
| baidu/ERNIE-5.5-Flash-Preview | 280B (MoE) | 1M | FP8 original | Apache 2.0 | Requiere infraestructura de mayor escala; no disponible en detalle |
| Cuantización del mismo modelo a ~4,25 bits/peso con la misma edición de rechazo | 280B (MoE) | 1M | ~4,25 bits/peso | Apache 2.0 | No disponible en detalle; usada como referencia de calidad por el autor |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas estándar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una publicación de vista previa de un modelo en vista previa, realizada por un único desarrollador y medida en un solo equipo; los números no son extrapolables a otros sistemas.
- No se han publicado benchmarks contra el modelo a plena precisión; la calidad relativa solo está documentada mediante acuerdo del primer token y KL sobre 32 prompts.
- El modelo solo soporta inglés y chino según los metadatos; no se garantiza calidad en castellano.
- La edición de rechazo reduce las negativas ante peticiones dañinas a 5 de 48 en la medición del autor; el usuario es responsable del uso que haga del modelo.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de veracidad.
- La cuantización a 2,65 bits por peso puede degradar tareas sensibles a la precisión numérica o al razonamiento fino; el autor solo verificó que las respuestas leídas eran coherentes y sobre el tema.
- Dependencia de un motor no estándar (Xolotl): no hay soporte en llama.cpp, Ollama ni LM Studio, lo que limita la portabilidad y el ecosistema de herramientas.
- Requiere Linux, CUDA 12 o 13, 24 GB de VRAM y ~96 GB de RAM; no es viable en portátiles ni en GPU de consumo de gama media.
- La decodificación especulativa DSpark no está incluida en las cifras publicadas; el rendimiento real con ella podría diferir.
- Licencia Apache 2.0 permite uso comercial, pero se desconoce si la edición de rechazo y la cuantización introducen obligaciones adicionales más allá de las del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/ERNIE-5.5-Flash-XQ-Uncensored
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
- Repositorio Xolotl: https://github.com/Indras-Mirror/Xolotl
- Documentación ERNIE en Xolotl: https://github.com/Indras-Mirror/Xolotl/blob/main/docs/ERNIE.md
- Motor Strata: https://github.com/Niko1221/Strata
- PR de llama.cpp con el layout GGUF: https://github.com/ggml-org/llama.cpp/pull/31925
- Apoyo al autor: https://ko-fi.com/indrasmirror
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
