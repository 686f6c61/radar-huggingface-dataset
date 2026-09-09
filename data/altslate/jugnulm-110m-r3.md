# altslate/JugnuLM-110M-R3

## Resumen

JugnuLM-110M-R3 es un modelo experimental de lenguaje desarrollado por altslate, perteneciente a la escalera de ablación de la fase 2 del proyecto JugnuLM. Este checkpoint representa el tercer escalón (Rung 3), cuyo único cambio respecto a su predecesor es la introducción de una mezcla ponderada de datos de entrenamiento: 55% de FineWeb-Edu, 35% de DCLM-baseline y 10% de FineMath-4plus. El objetivo del experimento es evaluar si una distribución de datos más diversa mejora el modelado del lenguaje a escala pequeña, manteniendo fijos arquitectura, optimizador, tokens y semilla.

El modelo emplea una arquitectura basada en Qwen3 pero con una innovación técnica denominada "value residuals", una vía de atención personalizada que requiere código remoto para cargarse correctamente. Cuenta con aproximadamente 110 millones de parámetros (109.737.302 exactos), 23 capas con 576 dimensiones ocultas, y fue entrenado desde cero sobre unos 8.400 millones de tokens. Es un modelo base, sin ajuste por instrucciones, diseñado para investigación en técnicas de arquitectura, mezcla de datos y análisis de scaling laws. Aunque no es el mejor en razonamiento científico (ARC-Easy), destaca por su fluidez gramatical y su baja perplexidad dentro de su familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 con value residuals (custom attention pathway) |
| Parametros totales | 109.737.302 |
| Parametros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` para cargar correctamente) |

## Arquitectura y entrenamiento

JugnuLM-110M-R3 usa una arquitectura de transformer estándar con varias características tomadas de Qwen3: 23 capas, 576 dimensiones ocultas, atención multi-consulta (GQA) con 9 cabezas de consulta y 3 cabezas clave/valor (9/3), posiciones rotatorias (RoPE), activación SwiGLU, normalización RMSNorm y QK-Norm. Además, emplea embeddings atados y un tokenizador SmolLM2 con 49.152 tokens de vocabulario. La innovación principal es la incorporación de "value residuals", un mecanismo de atención personalizado que se pierde si el modelo se carga como un Qwen3 estándar.

El entrenamiento se realizó desde cero sobre aproximadamente 8.400 millones de tokens en una mezcla ponderada por secuencia: 55% FineWeb-Edu (muestra de 10B), 35% DCLM-baseline y 10% FineMath-4plus. La generación de secuencias se hizo mediante un muestreo aleatorio ponderado de fuentes, sin currículo por etapas. Como optimizador se usó Muon con tasa de aprendizaje máxima de 2e-2 combinado con AdamW (1.5e-3) en una programación de coseno compartida, con un tamaño de lote global de aproximadamente 0,5 millones de tokens y precisión bf16. El entrenamiento fue distribuido con DDP en 4 GPUs RTX PRO 4500 Blackwell. No se aplicaron técnicas de RLHF ni DPO: se trata de un modelo puramente base.

## Capacidades

- Generación de texto en inglés con buena fluidez gramatical y baja perplexidad en su familia (WikiText-2 byte-ppl de 1.9092).
- Razonamiento limitado: obtiene 53.62 de acierto en ARC-Easy, por debajo del R2 de su propia escalera.
- Capacidad gramatical destacable: el mejor resultado de BLiMP de la familia, con 81.79.
- Sin soporte de tool calling ni function calling, al ser un modelo base sin ajuste de instrucciones.
- No dispone de capacidades de visión, audio ni multimodales.
- Solo soporta inglés; no se contemplan otros idiomas.
- Puede sufrir repeticiones ocasionales en la generación, como se menciona en la documentación del autor.

## Casos de uso

- Investigación en ablaciones de arquitectura: ideal para estudiar cómo afecta la mezcla de datos en el comportamiento de un modelo con value residuals y optimizador Muon, permitiendo comparar con los rungs R0, R1 y R2 de la misma familia.
- Evaluación de fluidez gramatical: el modelo es útil como referencia para probar métricas lingüísticas como BLiMP, dado que es el mejor checkpoint de su escalera en esta tarea.
- Análisis de scalability laws a escala pequeña: permite estudiar la relación entre la distribución de los datos, la perplexidad y el rendimiento en tareas de razonamiento sencillo (ARC-Easy) con apenas 110M parámetros.
- Base para fine-tuning específico: puede partirse de este modelo para ajustes posteriores en tareas concretas del inglés, siempre que se disponga de un conjunto de datos propio y se aplique el código personalizado.
- Estudio del efecto de la distribución educativa en el razonamiento científico: el experimento demuestra que diluir el corpus educativo (FineWeb-Edu) reduce el rendimiento en ARC-Easy, lo que ofrece información sobre qué datos son relevantes para el razonamiento elemental.
- Referencia para tests de perplexidad y modelado del lenguaje: sirve como línea base de baja complejidad para medir la calidad de nuevos datos de entrenamiento o técnicas de regularización.

## Benchmarks y rendimiento

Se han publicado resultados de la escalera de ablación interna, evaluados con EleutherAI `lm-evaluation-harness`. La siguiente tabla compara los rungs R0 a R3, todos con el mismo tamaño de modelo:

| Rung | BLiMP (↑) | ARC-Easy (↑) | WikiText-2 byte-ppl (↓) |
|---|---|---|---|
| R0 — baseline | 81.25 | 52.48 | 1.95 |
| R1 — + value residuals | 81.10 | 54.67 | 1.94 |
| R2 — + Muon | 80.78 | **56.10** | 1.932 |
| **R3 — + data blend** | **81.79** | 53.62 | **1.9092** |

R3 consigue la mejor puntuación en BLiMP y la mejor perplexidad de toda la familia, pero pierde un 2.48% en ARC-Easy respecto a R2. Como ARC-Easy es la métrica que condiciona el registro en el leaderboard del proyecto, R3 no se mantiene en la ladder a pesar de sus otras ventajas. No se han proporcionado datos de benchmarks externos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 220 MB en bf16 para los pesos (109.737.302 parámetros × 2 bytes), más overhead de activaciones; en total, menos de 1 GB.
- GPU recomendada: cualquier tarjeta con al menos 2 GB de VRAM; una RTX 3060 o superior es más que suficiente.
- Entra sin problema en cualquier GPU de consumo, y también puede ejecutarse en CPU.
- Opciones de despliegue: vLLM, llama.cpp, Ollama o TGI son compatibles en principio, pero se requiere soporte para `trust_remote_code` para cargar la lógica de value residuals; sin él, la calidad del modelo se degrada de forma silenciosa.
- Latencia y throughput: no disponibles, no se han publicado mediciones.

## Comparativa con modelos similares

La comparación más directa es con el resto de rungs de la propia familia JugnuLM de 110M, ya que comparten arquitectura, tamaño y objetivos de investigación:

| Modelo | Parametros | Contexto | BLiMP | ARC-Easy | WikiText-2 byte-ppl | Licencia |
|---|---|---|---|---|---|---|
| JugnuLM-110M (R0, baseline) | 109.737.302 | No disponible | 81.25 | 52.48 | 1.95 | Apache 2.0 |
| JugnuLM-110M-R1 (+ value residuals) | 109.737.302 | No disponible | 81.10 | 54.67 | 1.94 | Apache 2.0 |
| JugnuLM-110M-R2 (+ Muon) | 109.737.302 | No disponible | 80.78 | 56.10 | 1.932 | Apache 2.0 |
| JugnuLM-110M-R3 (+ data blend) | 109.737.302 | No disponible | 81.79 | 53.62 | 1.9092 | Apache 2.0 |

No se dispone de modelos externos comparables en la información proporcionada, ya que no hay datos públicos de benchmarks que permitan una comparación justa con otros modelos de tamaño similar.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay soporte multilingüe.
- Es un modelo base sin ajuste de instrucciones, por lo que no debe usarse directamente para tareas de asistencia, chat o seguimiento de instrucciones complejas.
- Puede generar repeticiones ocasionales, especialmente en secuencias largas.
- El rendimiento en razonamiento científico (ARC-Easy) es inferior al de su predecesor R2, lo que limita su uso en tareas que requieran razonamiento elemental.
- La carga requiere `trust_remote_code=True`; si se omite, el modelo pierde silenciosamente la vía de value residuals y su calidad se reduce sustancialmente.
- Al ser un modelo experimental de investigación, el autor lo señala explícitamente como "no para producción".
- No se dispone de evaluaciones de robustez, sesgos o alucinaciones más allá de las tareas presentadas, por lo que cualquier uso en escenarios sensibles debe ir precedido de una validación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/altslate/JugnuLM-110M-R3
- Rung anterior (mejor ARC): https://huggingface.co/altslate/JugnuLM-110M-R2
- Baseline de la familia: https://huggingface.co/altslate/JugnuLM-110M
- Código de entrenamiento y escalera de ablación: https://github.com/AltSlate-Labs/jugnu
