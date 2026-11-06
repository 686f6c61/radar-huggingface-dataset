# SeniorGrandMaster/Mergen-TR-Qwen3.5-9B-MTP-GGUF

## Resumen

Mergen-TR-Qwen3.5-9B-MTP-GGUF es una cuantización GGUF publicada por el usuario SeniorGrandMaster a partir del modelo dogukanvzr/Mergen-TR-Qwen3.5-9B, un ajuste fino en turco de la familia Qwen3.5 con 9.000 millones de parámetros. La aportación principal de esta versión no es un nuevo entrenamiento, sino la incorporación de la técnica MTP (Multi-Token Prediction) como mecanismo de decodificación especulativa sobre el modelo base, con el objetivo de acelerar la inferencia sin alterar los pesos originales.

Según la model card del autor, la integración de MTP alcanza una tasa de aceptación media del 59,6 % (1734 tokens aceptados de 2907 generados) con una longitud media de borrador de 2,8 tokens, lo que se traduce en velocidades de generación de aproximadamente 215–320 tokens por segundo en una RTX 5090. La tasa de aceptación varía de forma notable según la tarea: desde el 39,9 % en tareas de arranque en frío hasta el 78,7 % en generaciones largas.

El modelo está orientado exclusivamente al idioma turco, se distribuye bajo licencia Apache 2.0 y en formato GGUF, lo que lo hace desplegable en entornos de inferencia locales mediante llama.cpp u Ollama. Es relevante para desarrolladores que necesiten un modelo de 9B especializado en turco con latencia reducida en hardware de consumo de gama alta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con MTP para decodificacion especulativa |
| Parametros totales | 9B (aproximadamente 9.000 millones, segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es dogukanvzr/Mergen-TR-Qwen3.5-9B, un ajuste fino sobre la arquitectura Qwen3.5 de 9B parámetros, especializado en turco. La versión publicada por SeniorGrandMaster no reentrena el modelo, sino que le añade la capacidad MTP (Multi-Token Prediction), que actúa como cabecera de decodificación especulativa: un modelo borrador propone varios tokens candidatos que el modelo objetivo verifica en paralelo, aceptando la secuencia propuesta cuando coincide con la distribución del modelo principal.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica documentada es exclusivamente la integración de MTP, cuyos resultados de aceptación se midieron en una RTX 5090 con un conjunto de tareas identificadas por índices (0, 2, 295, 392, 448, 479, 509, 563, 595, 623, 828). El autor señala que la tasa de aceptación aumenta en generaciones largas y disminuye en arranques en frío o contextos cortos, comportamiento considerado normal en decodificación especulativa.

## Capacidades

- Generación de texto en turco, idioma principal y único declarado en la model card.
- Decodificación especulativa mediante MTP, con aceleración de la generación en inferencia local.
- Razonamiento y generación de código heredados del modelo base Qwen3.5-9B (no verificados de forma independiente en esta versión).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al turco según la etiqueta de idioma declarada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en turco: el modelo puede gestionar diálogos multi-turno en turco con una latencia reducida gracias al MTP, adecuado para interfaces de chat interactivas donde el tiempo de primera respuesta y la fluidez de generación son críticos.
- Generación de contenido editorial en turco: redacción de artículos, resúmenes y textos de marketing con un modelo de 9B desplegable en local, sin depender de APIs externas ni enviar datos a terceros.
- Procesamiento de documentos en turco en local: clasificación, extracción y reescritura de textos turcos en entornos con requisitos de soberanía del dato, aprovechando el formato GGUF para despliegue en estaciones de trabajo.
- Prototipado rápido en hardware de consumo: con velocidades de 215–320 tok/s en una RTX 5090, resulta viable para demos interactivas y pruebas de concepto que requieran respuestas en tiempo real.
- Traducción asistida turco-español o turco-inglés como paso intermedio: el modelo puede generar texto turco de calidad que se posprocese con un modelo multilingüe, aunque su competencia fuera del turco no está documentada.
- Investigación sobre decodificación especulativa: el modelo sirve como caso de estudio reproducible para medir tasas de aceptación de MTP en un modelo de 9B, con datos de referencia publicados por el autor.
- Fine-tuning posterior en turco: al estar bajo Apache 2.0 y en GGUF, puede servir de base para ajustes adicionales orientados a dominios específicos (legal, sanitario, técnico) en turco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas de la decodificación especulativa MTP medidas en una RTX 5090:

| Métrica | Valor |
|---|---|
| Tasa de aceptación global | 59,6 % (1734 aceptados / 2907 generados) |
| Longitud media de borrador | 2,8 tokens |
| Velocidad de generación | 215–320 tokens/s |
| Tasa de aceptación máxima por tarea | 78,7 % (tarea 623) |
| Tasa de aceptación mínima por tarea | 39,9 % (tarea 2) |

| Tarea | Tasa de aceptación | Borrador medio (tokens) |
|---|---|---|
| 0 | 63,8 % | 2,91 |
| 2 | 39,9 % | 2,20 |
| 295 | 41,2 % | 2,24 |
| 392 | 68,6 % | 3,06 |
| 448 | 60,7 % | 2,82 |
| 479 | 59,3 % | 2,78 |
| 509 | 43,1 % | 2,29 |
| 563 | 58,6 % | 2,76 |
| 595 | 72,2 % | 3,17 |
| 623 | 78,7 % | 3,36 |
| 828 | 48,5 % | 2,45 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un modelo de 9B en GGUF, las estimaciones habituales serían aproximadamente 6 GB en cuantización Q4, 9–10 GB en Q6 y 18 GB en FP16, aunque el autor no publica estos datos.
- GPU recomendadas: el autor valida el rendimiento en una RTX 5090; por tamaño, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) deberían poder alojar el modelo en cuantizaciones de 8 bits o inferiores.
- Compatibilidad con GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM en cuantizaciones bajas, aunque no se documenta de forma oficial.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: 215–320 tokens/s en RTX 5090 según el autor; el resto de hardware no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mergen-TR-Qwen3.5-9B-MTP-GGUF | 9B | no disponible | tr | Apache 2.0 | GGUF | MTP con 59,6 % de aceptación |
| dogukanvzr/Mergen-TR-Qwen3.5-9B | 9B | no disponible | tr | no disponible | no disponible | Modelo base sin MTP |
| Qwen3.5-9B (original) | 9B | no disponible | multilingüe | no disponible | no disponible | Base de la familia, sin ajuste en turco |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en turco; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación para esta versión ni para el modelo base.
- La tasa de aceptación de MTP cae al 39,9 % en tareas de arranque en frío, por lo que la aceleración no es uniforme y depende del tipo de generación.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- La model card no especifica la longitud de contexto, los niveles de cuantización incluidos ni los requisitos de hardware fuera de la RTX 5090.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base (dogukanvzr/Mergen-TR-Qwen3.5-9B) antes de un uso comercial, ya que no se detalla en la información disponible.
- El repositorio se creó y actualizó el mismo día (2026-11-04), lo que sugiere una publicación reciente sin historial de mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/SeniorGrandMaster/Mergen-TR-Qwen3.5-9B-MTP-GGUF
- Modelo base: https://huggingface.co/dogukanvzr/Mergen-TR-Qwen3.5-9B
