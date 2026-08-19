# rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled-GGUF

## Resumen

El modelo `rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled-GGUF` es una cuantización GGUF de un fine-tuning LoRA sobre el modelo base `Qwen/Qwen3.8-27B`, destilado a partir de trazas de razonamiento extendido de Claude Opus 4.6 y 4.7. El objetivo es transferir el estilo de pensamiento y la cadena de razonamiento del modelo propietario de Anthropic a un modelo abierto de 27 mil millones de parámetros, manteniendo la licencia Apache 2.0 y la capacidad de ejecución local.

La relevancia actual de este modelo reside en dos frentes. Primero, la arquitectura híbrida de Qwen3.8 (combinación de atención completa y atención lineal Gated DeltaNet) junto con su cabezal de Multi-Token Prediction (MTP) permite una decodificación especulativa autónoma sin necesidad de un modelo draft externo, logrando un aumento de velocidad de aproximadamente 1,6 veces. Segundo, al estar disponible en formato GGUF, puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama o LM Studio.

Es importante señalar que, según la propia documentación del autor, este lanzamiento es una **ejecución de validación del pipeline** (150 pasos, ~12,6% de una época) y no un modelo completamente convergido. La destilación se realizó sobre un conjunto de datos mixto donde aproximadamente el 62% de las trazas de razonamiento fueron reconstruidas por un modelo más pequeño en lugar de ser el pensamiento real de Opus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 16/64 capas de atención completa (Gated Attention), 48/64 capas de atención lineal (Gated DeltaNet) + cabezal MTP |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (secuencia de entrenamiento: 8192 tokens) |
| Tipos de cuantizacion | f16 (51 GB), Q8_0 (28 GB), Q6_K (21 GB), Q5_K_M (19 GB), Q4_K_M (16 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura híbrida de Qwen3.8-27B, que combina 16 capas de atención completa tradicional con 48 capas de atención lineal basada en Gated DeltaNet. Esta mezcla busca reducir el coste computacional del contexto largo manteniendo la calidad del razonamiento. Además, incorpora un cabezal MTP que permite la decodificación especulativa autónoma: el propio modelo propone tokens candidatos que luego verifica, sin necesidad de un modelo draft separado.

El fine-tuning se realizó con LoRA (r=32, alpha=32) mediante la librería Unsloth, entrenando únicamente 233.455.616 parámetros (0,85% del total). El conjunto de datos combinó 21.490 ejemplos de tres fuentes: trazas reales de razonamiento extendido de Claude Opus 4.7 (8.124 ejemplos), y dos conjuntos de "inversión de trazas" donde el razonamiento fue reconstruido a posteriori por un modelo más pequeño a partir de respuestas reales de Opus 4.6 y 4.7 (4.800 y 8.700 ejemplos respectivamente). El entrenamiento se limitó a 150 pasos con un batch efectivo de 18, alcanzando una pérdida final de 0,728. La fusión LoRA se realizó en precisión de 16 bits y posteriormente se convirtió a GGUF con llama.cpp, preservando el cabezal MTP.

## Capacidades

- Generación de texto y razonamiento encadenado (chain-of-thought) destilado del estilo de pensamiento de Claude Opus.
- Decodificación especulativa autónoma mediante el cabezal MTP integrado en el propio archivo GGUF, sin necesidad de modelos draft externos.
- Soporte de texto en inglés, con capacidades multilingües heredadas del modelo base (aunque no fueron objetivo del entrenamiento).
- La torre de visión del modelo base está presente en la fusión (pesos no modificados), pero no fue entrenada con LoRA, por lo que su rendimiento no está garantizado.
- Compatible con la infraestructura de llama.cpp, Ollama y LM Studio gracias al formato GGUF.
- No se especifica soporte explícito de tool calling o function calling en la documentación proporcionada.

## Casos de uso

- Prototipado y experimentación local de razonamiento avanzado: al ser una cuantización GGUF, puede ejecutarse en una GPU de consumo (por ejemplo, RTX 4090 con 24 GB usando la cuantización Q4_K_M de 16 GB), permitiendo a investigadores evaluar el estilo de razonamiento destilado de Opus sin depender de APIs propietarias.
- Investigación sobre destilación de razonamiento: este modelo sirve como caso de estudio para analizar cómo se comporta una destilación parcial (12,6% de época) y qué diferencias de calidad existen entre trazas reales y reconstruidas de razonamiento.
- Generación de código con razonamiento explícito: aunque no se menciona tool calling, el modelo puede generar explicaciones paso a paso para problemas de programación, útil en entornos de desarrollo local sin conexión.
- Análisis de documentos técnicos: con una secuencia de entrenamiento de 8192 tokens, puede procesar y razonar sobre documentos extensos, aunque la longitud de contexto total del modelo base no está especificada.
- Desarrollo de agentes de razonamiento en local: gracias a la decodificación especulativa MTP, se puede desplegar en entornos con restricciones de latencia, logrando 104,2 tokens por segundo en una H100 NVL frente a los 64,6 estándar.
- Evaluación de la arquitectura híbrida Gated DeltaNet: los desarrolladores pueden probar el rendimiento de la atención lineal combinada con atención completa en tareas de razonamiento, comparando con modelos transformer puros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otros estándares para este fine-tuning. Los únicos datos de rendimiento disponibles son las velocidades de generación medidas en una GPU H100 NVL:

| Modo de decodificacion | Velocidad (tok/s) |
|---|---|
| Estándar | 64,6 |
| Speculativa con MTP (`--spec-type draft-mtp`) | 104,2 |

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M ocupa 16 GB y es práctica para una GPU de consumo con 24 GB; Q8_0 requiere 28 GB; f16 requiere 51 GB.
- GPUs recomendadas: H100 NVL para máxima velocidad con decodificación especulativa; RTX 4090 o similar (24 GB) para la cuantización Q4_K_M; GPUs con más de 32 GB para Q8_0.
- Cabe en GPU de consumo: sí, la versión Q4_K_M cabe en una RTX 4090 (24 GB), aunque con limitaciones de contexto.
- Opciones de despliegue: llama.cpp (requiere una compilación reciente con soporte para el operador Gated DeltaNet), Ollama, LM Studio.
- Latencia y throughput: en H100 NVL, 64,6 tok/s en modo estándar y 104,2 tok/s con MTP habilitado.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | Híbrida Gated DeltaNet + MTP | No disponible | Apache 2.0 | Sin destilación de razonamiento |
| Qwen3.8-27B-Claude-Opus-Reasoning-Distilled (este) | 27,3B | Híbrida Gated DeltaNet + MTP | No disponible | Apache 2.0 | Destilación parcial de Opus, solo GGUF |
| DeepSeek-R1-Distill-Qwen-32B (referencia de destilación de razonamiento) | 32B | Transformer denso | 128K | MIT | Destilado de DeepSeek-R1, no de Opus |

La comparativa se limita a especificaciones de arquitectura y licencia, ya que no hay benchmarks disponibles para este modelo. La principal diferencia frente al base es la adición de trazas de razonamiento de Opus, mientras que frente a otros modelos destilados de razonamiento, la licencia Apache 2.0 es más permisiva que la MIT de DeepSeek, pero el entrenamiento incompleto limita su utilidad práctica.

## Limitaciones y advertencias

- Entrenamiento incompleto: el modelo solo cubre el 12,6% de una época (150 pasos), por lo que no ha generalizado sobre el conjunto de datos completo. No debe tratarse como un modelo de producción.
- Razonamiento reconstruido: aproximadamente el 62% de los datos de entrenamiento contiene trazas de razonamiento reconstruidas por un modelo más pequeño, no el pensamiento real de Opus. Esto puede introducir artefactos de estilo y reducir la fidelidad de la destilación.
- Riesgo de alucinación: al ser un modelo de razonamiento destilado y no convergido, es probable que presente alucinaciones frecuentes en tareas complejas.
- Requisitos de software: necesita una compilación reciente de llama.cpp que soporte la arquitectura híbrida Gated DeltaNet; versiones antiguas no cargarán el modelo correctamente.
- Idioma: el entrenamiento se realizó únicamente en inglés; las capacidades en otros idiomas no han sido validadas.
- Sin benchmarks: no hay datos de rendimiento estándar que permitan evaluar la calidad del razonamiento frente a otros modelos.
- Sin soporte de tool calling verificado: aunque el modelo base podría soportarlo, no se ha confirmado en esta destilación.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled-GGUF
- Modelo LoRA base (antes de cuantización): https://huggingface.co/rico03/Qwen3.8-27B-Claude-Opus-Reasoning-Distilled
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset lordx64/reasoning-distill-claude-opus-4-7-max: https://huggingface.co/datasets/lordx64/reasoning-distill-claude-opus-4-7-max
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
