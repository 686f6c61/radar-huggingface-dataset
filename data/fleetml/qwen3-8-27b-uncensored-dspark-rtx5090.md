# fleetml/Qwen3.8-27B-Uncensored-DSpark-RTX5090

## Resumen

El modelo `fleetml/Qwen3.8-27B-Uncensored-DSpark-RTX5090` es un drafter de decodificación especulativa (speculative decoding drafter) desarrollado por fleetml, diseñado específicamente para acelerar la inferencia del modelo objetivo `fleetml/Qwen3.8-27B-Uncensored-NVFP4-RTX5090`, una versión cuantizada en NVFP4 del Qwen3.8-27B Uncensored. No es un modelo de propósito general: su función exclusiva es proponer tokens candidatos que el modelo principal verifica en paralelo, reduciendo la latencia de generación.

El drafter se inicializó a partir de `RadixArk/Qwen3.8-27B-DSpark` y se entrenó sobre características ocultas (hidden states) capturadas del modelo objetivo NVFP4, lo que garantiza una alineación precisa entre ambos. Con 1.857 millones de parámetros y arquitectura `DSparkDraftModel`, está pensado para ejecutarse en una única GPU RTX 5090 junto con el modelo principal, alcanzando una mediana de 139,32 tokens por segundo en decodificación con un pool de 16.384 tokens.

La relevancia de este modelo radica en que permite ejecutar un modelo de 27B con cuantización NVFP4 y decodificación especulativa en hardware de consumo, multiplicando por 2,79 la velocidad de la decodificación estándar. Su licencia Apache 2.0 y su formato safetensors facilitan su integración en entornos de investigación y desarrollo local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DSparkDraftModel` (drafter de decodificación especulativa) |
| Parametros totales | 1.857.358.337 (1,86B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (contexto combinado con el modelo objetivo) |
| Tipos de cuantizacion | BF16 (exportación en bfloat16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (SHA-256: `cb2591889afbbf51aae4545ae8f1569fda17a21448a44e2750fa8182fab53fd5`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `DSparkDraftModel`, un drafter ligero de 5 capas con un block size de 7, diseñado para predecir tokens en las capas objetivo 5, 19, 33, 47 y 61 del modelo principal. Esta configuración permite que el drafter genere borradores de secuencias que el modelo NVFP4 verifica en paralelo, reduciendo el número de pasos de decodificación autoregresiva.

El entrenamiento se realizó con el framework SpecForge (commit `2fc993077c3c53df14ebdd5d414c854864476af8`), utilizando 126 registros de características del profesor (exact-target teacher features) extraídas del modelo objetivo NVFP4. La longitud máxima de secuencia de entrenamiento fue de 1.024 tokens, con 64 pasos de optimización en precisión BF16. El dataset empleado fue `HuggingFaceH4/ultrachat_200k`. Este enfoque de entrenamiento sobre características ocultas del modelo objetivo garantiza que el drafter esté alineado con la distribución de salida del modelo NVFP4, maximizando la tasa de aceptación.

## Capacidades

- Decodificación especulativa: genera borradores de tokens que el modelo principal verifica, acelerando la inferencia hasta 2,79 veces frente a la decodificación estándar.
- Alineación con modelo objetivo NVFP4: entrenado específicamente para el modelo `fleetml/Qwen3.8-27B-Uncensored-NVFP4-RTX5090`, lo que maximiza la tasa de aceptación (mediana de 0,53).
- Integración con SGLang: se sirve mediante `--speculative-draft-model-path` junto con el modelo objetivo.
- Optimizado para RTX 5090: diseñado para funcionar en una única GPU RTX 5090 con un pool activo de 16.384 tokens.
- No es un modelo generativo autónomo: no genera texto por sí mismo; requiere el modelo objetivo para funcionar.

## Casos de uso

- Inferencia local acelerada en RTX 5090: el par drafter + modelo objetivo permite ejecutar un modelo de 27B con cuantización NVFP4 a 139 tokens por segundo, adecuado para aplicaciones interactivas de chat y agentes en hardware de consumo.
- Desarrollo de agentes con razonamiento multi-paso: la baja latencia resultante permite encadenar múltiples llamadas al modelo sin tiempos de espera perceptibles, facilitando pipelines de razonamiento iterativo.
- Evaluación e investigación de modelos: el drafter permite probar variantes del modelo Qwen3.8-27B Uncensored en entornos locales controlados, comparando rendimiento y calidad de salida.
- Despliegue en entornos con restricción de VRAM: con una asignación combinada de 22,44 GB de pesos y un uso total de 29,39 GB, cabe en una RTX 5090 de 32 GB, dejando 3,22 GB libres para activaciones y overhead.
- Servicio de chat multilingüe (inglés y chino): el modelo objetivo soporta ambos idiomas, y el drafter acelera la generación en ambos sin penalización de calidad.
- Prototipado de aplicaciones de generación de código y tool calling: la velocidad de decodificación permite iterar rápidamente en tareas de generación de código y llamadas a herramientas, donde la latencia es crítica.

## Benchmarks y rendimiento

Los resultados medidos por el autor se presentan en la model card, obtenidos con una RTX 5090 y un pool de 16.384 tokens en una suite de prompts deterministas:

| Metrica | Valor |
|---|---|
| Mediana de decodificación (tokens/s) | 139,32 |
| Factor vs. warm start público | 1,18x |
| Factor vs. MTP depth 5 nativo | 1,41x |
| Factor vs. decodificación estándar | 2,79x |
| Longitud media aceptada (tokens) | 4,70 |
| Tasa de aceptación mediana | 0,53 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este drafter, ya que no es un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada: el drafter ocupa aproximadamente 3,7 GB en BF16; junto con el modelo objetivo NVFP4 (22,44 GB de pesos combinados), el uso total de GPU es de aproximadamente 29,39 GB.
- GPU recomendada: RTX 5090 (32 GB VRAM) para el perfil completo; quedan 3,22 GB libres tras la carga.
- Compatibilidad con GPU de consumo: sí, siempre que se disponga de 32 GB de VRAM. No cabe en GPUs de 24 GB o menos con el modelo objetivo completo.
- Opciones de despliegue: SGLang (con `--speculative-draft-model-path`), compatible con el ecosistema transformers.
- Latencia y throughput: mediana de 139,32 tokens/s en decodificación con pool de 16.384 tokens en RTX 5090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rol |
|---|---|---|---|---|
| `fleetml/Qwen3.8-27B-Uncensored-DSpark-RTX5090` | 1,86B | 262.144 | Apache 2.0 | Drafter especulativo para NVFP4 |
| `RadixArk/Qwen3.8-27B-DSpark` | 1,86B (aprox.) | no disponible | Apache 2.0 | Drafter base sin ajuste al objetivo NVFP4 |
| Decodificación estándar (sin drafter) | — | — | — | Línea base: 2,79x más lenta |

La comparativa directa con otros drafters no está disponible en la información proporcionada. La ventaja principal de este modelo frente a su base (`RadixArk/Qwen3.8-27B-DSpark`) es el entrenamiento específico sobre las características ocultas del modelo NVFP4, que mejora la tasa de aceptación y la velocidad final.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo objetivo `fleetml/Qwen3.8-27B-Uncensored-NVFP4-RTX5090` para funcionar; no puede generar texto por sí solo.
- Entrenamiento con datos limitados: solo 126 registros de características y 64 pasos de optimización, lo que puede limitar la generalización a dominios fuera del dataset de entrenamiento.
- Idiomas restringidos: solo inglés y chino; no soporta otros idiomas de forma nativa.
- Dependencia de hardware específico: el perfil de rendimiento está optimizado para RTX 5090; en otras GPUs los resultados pueden variar significativamente.
- Riesgo de alucinación y sesgos: al ser un drafter, no introduce sesgos propios, pero hereda los del modelo objetivo, que es una versión "uncensored" con menos restricciones de seguridad.
- Restricciones de uso: el autor indica que está destinado a "investigación local controlada, evaluación y desarrollo de agentes"; debe usarse de forma responsable y cumpliendo la licencia Apache 2.0 y la legislación aplicable.

## Enlaces

- [HuggingFace: fleetml/Qwen3.8-27B-Uncensored-DSpark-RTX5090](https://huggingface.co/fleetml/Qwen3.8-27B-Uncensored-DSpark-RTX5090)
- [Modelo objetivo: fleetml/Qwen3.8-27B-Uncensored-NVFP4-RTX5090](https://huggingface.co/fleetml/Qwen3.8-27B-Uncensored-NVFP4-RTX5090)
- [Modelo base: RadixArk/Qwen3.8-27B-DSpark](https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark)
- [Dataset de entrenamiento: HuggingFaceH4/ultrachat_200k](https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k)
- [Blog: Qwen 3.8 27B Uncensored Local: GGUF Quants + llama.cpp](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Blog: How to Run Qwen 3.8 27B Locally: VRAM, Quants and the Template Trap](https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html)
- [Ollama: orcarouter/Qwen3.8-27B-Uncensored](https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored:latest)
