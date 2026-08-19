# Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ3.5e-fp16-mtp

## Resumen

El modelo `Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ3.5e-fp16-mtp` es un checkpoint cuantizado del modelo Qwen3.6-35B-A3B de Qwen, optimizado específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El autor, Robot-Haus, ha aplicado una cuantización de 3,5 bits (oQ3.5e) con dtype fp16, preservando los tensores MTP (Multi-Token Prediction) del modelo original. El resultado es un modelo que, según las pruebas del autor, ofrece la mejor relación precisión-velocidad entre todas las variantes de cuantización probadas, superando incluso a variantes de mayor bit-depth en benchmarks como MMLU-Pro y HumanEval.

El modelo base Qwen3.6-35B-A3B es un modelo de mezcla de expertos (MoE) con 35 mil millones de parámetros totales y solo 3 mil millones activos por token, lo que lo hace especialmente eficiente. Este checkpoint cuantizado reduce aún más los requisitos de memoria, permitiendo su uso en equipos Apple con memoria unificada a partir de 32 GB. La relevancia de este lanzamiento radica en que demuestra que una cuantización agresiva de 3,5 bits puede mantener, e incluso mejorar, la precisión frente a cuantizaciones más conservadoras, siempre que se aplique con una calibración adecuada y un dtype apropiado para el hardware objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención estándar, basada en Qwen3.6 |
| Parametros totales | 5.448.341.424 (según safetensors del checkpoint cuantizado; el modelo base tiene 35B) |
| Parametros activos | 3B (del modelo base, no se especifica si el checkpoint mantiene esa proporción) |
| Longitud de contexto | Probado hasta 200.000 tokens en benchmarks del autor; no se indica el máximo oficial |
| Tipos de cuantizacion | oQ3.5e-fp16 (3,5 bits, precisión fp16) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo Qwen3.6-35B-A3B, un MoE con 35B parámetros totales y 3B activos por token, diseñado por Qwen para tareas de codificación agéntica y razonamiento. La cuantización se realizó con la herramienta oMLX (versión 0.5.5 y 0.6.0) utilizando el nivel oQ3.5e con dtype fp16, una combinación que el autor seleccionó tras una batería de pruebas comparativas entre distintos niveles de bit-depth (Q3.5e a Q6e) y dtypes (BF16 y FP16). Se preservaron los tensores MTP (Multi-Token Prediction) durante la cuantización, con 481 de 483 tensores ponderados por imatrix y ningún experto con conteo cero entre los 256 expertos.

La calibración se realizó con un corpus personalizado de 3.629 muestras que amplía los datos de calibración estándar de oMLX con trazas de uso de herramientas agénticas, administración de shell/sysadmin, escritura profesional, Swift y AppleScript, HTML/React y conocimiento del mundo. No hubo entrenamiento adicional; solo cuantización. El autor reporta que la tasa de aceptación del draft en MTP observada en logs del servidor fue del 74–79,5%. Es importante destacar que `mtp_enabled` está desactivado por defecto en oMLX al cargar el modelo, por lo que debe activarse manualmente mediante la API de administración o la interfaz de configuración.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.6-35B-A3B.
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio, según el blog oficial de Qwen.
- Soporte MTP (Multi-Token Prediction) nativo, que acelera la decodificación al predecir múltiples tokens a la vez; el beneficio varía con la longitud de contexto y el dtype.
- Capacidad de procesar contextos muy largos (probado hasta 200.000 tokens), útil para documentos extensos o conversaciones multi-turno.
- Optimizado para Apple Silicon, aprovechando la preferencia de hardware por el dtype fp16 en prefill y decode.
- No se especifican capacidades de visión, audio o tool calling en la model card, aunque el modelo base podría tenerlas; no se confirma en este checkpoint.

## Casos de uso

- Asistente personal en Apple Silicon: el modelo puede ejecutarse localmente en un Mac con memoria unificada, ofreciendo respuestas rápidas y privadas sin conexión a la nube. Su tamaño cuantizado (19,5 GB) permite cargarlo en equipos con 32 GB o más de RAM.
- Generación y revisión de código en entornos de desarrollo: gracias a su capacidad de codificación agéntica, puede asistir en tareas de programación, refactorización y generación de tests dentro de un IDE o como parte de un pipeline de CI/CD.
- Análisis de documentos extensos: con una ventana de contexto probada hasta 200.000 tokens, es adecuado para resumir o extraer información de informes largos, libros técnicos o expedientes legales.
- Automatización de tareas de administración de sistemas: el corpus de calibración incluye trazas de shell y sysadmin, lo que sugiere que el modelo responde bien a comandos y scripts de administración, pudiendo generar scripts de automatización o explicar comandos complejos.
- Escritura profesional y creación de contenido: puede redactar informes, correos electrónicos o documentación técnica en inglés, con un estilo consistente y razonablemente preciso.
- Desarrollo de aplicaciones macOS/iOS: la inclusión de Swift y AppleScript en la calibración indica que puede ayudar a escribir código para el ecosistema Apple, incluyendo scripts de automatización y componentes de interfaz.

## Benchmarks y rendimiento

La model card incluye benchmarks de rendimiento (TTFT y velocidad de decodificación) y de inteligencia (MMLU-Pro y HumanEval), todos ejecutados en Apple M1 Ultra con 128 GB de memoria unificada.

### Rendimiento en oMLX v0.5.5

| Contexto | MTP activado TTFT | MTP activado tok/s | MTP desactivado TTFT | MTP desactivado tok/s |
|---|---|---|---|---|
| pp1024 | 0,85 s | 68,2 | 0,76 s | 62,6 |
| pp4096 | 2,84 s | 65,0 | 2,78 s | 64,9 |
| pp8192 | 5,90 s | 62,8 | 5,88 s | 57,2 |
| pp16384 | 13,14 s | 63,0 | 13,16 s | 59,5 |
| pp32768 | 31,88 s | 58,9 | 31,81 s | 57,1 |
| pp65536 | 86,46 s | 49,9 | 87,01 s | 50,9 |
| pp131072 | 272,49 s | 38,7 | 272,79 s | 41,5 |
| pp200000 | 541,56 s | 30,6 | 569,93 s | 35,8 |

### Rendimiento en oMLX v0.6.0

| Contexto | MTP activado TTFT | MTP activado tok/s | MTP desactivado TTFT | MTP desactivado tok/s |
|---|---|---|---|---|
| pp1024 | 0,83 s | 76,5 | 0,82 s | 64,3 |
| pp4096 | 2,94 s | 66,6 | 2,92 s | 63,9 |
| pp16384 | 14,03 s | 69,7 | 13,81 s | 57,1 |
| pp32768 | 34,49 s | 72,8 | 33,41 s | 55,0 |
| pp65536 | 95,75 s | 55,1 | 90,60 s | 47,0 |
| pp131072 | 297,69 s | 43,6 | 262,89 s | 42,6 |
| pp200000 | 624,92 s | 33,2 | 539,27 s | 37,4 |

Nota: el autor excluye pp8192 en v0.6.0 por una anomalía de velocidad de decodificación que considera un fallo de esa versión.

### Benchmarks de inteligencia (oMLX v0.5.5, Thinking Mode desactivado, batch 8×)

| Benchmark | Resultado |
|---|---|
| MMLU-Pro | 65,7% |
| HumanEval | 92,1% |

El autor indica que estos valores son superiores a los de otras variantes de cuantización probadas (Q4e, Q5e, Q6e), que obtuvieron entre 59,3% y 62,0% en MMLU-Pro, y que la variante Q5e-fp16 sufrió una regresión reproducible en HumanEval (76,8%). No se proporcionan más detalles de benchmarks en la información disponible.

## Requisitos de hardware

- Probado en Apple M1 Ultra con 128 GB de memoria unificada; el modelo ocupa aproximadamente 19,5 GB en disco (repo completo), por lo que se recomienda al menos 32 GB de memoria unificada para cargarlo con holgura.
- GPU integrada de Apple Silicon (cualquier chip M1, M2 o M3 con suficiente memoria unificada).
- No cabe en GPUs de consumo tradicionales (NVIDIA, AMD) porque el formato MLX está diseñado para Apple Silicon; para otras plataformas habría que usar una conversión a otro formato (p. ej., GGUF).
- Despliegue recomendado con oMLX (librería MLX) o cualquier runtime que soporte safetensors en MLX. También es posible usar el modelo a través de herramientas como LM Studio u Ollama si convierten el formato.
- Latencia y throughput: según los benchmarks, el TTFT varía de 0,83 s (pp1024) a 624,92 s (pp200000) con MTP activado en v0.6.0; la velocidad de decodificación va de 76,5 tok/s (pp1024) a 33,2 tok/s (pp200000) en las mismas condiciones.

## Comparativa con modelos similares

La siguiente tabla compara este checkpoint con el modelo base sin cuantizar y con otras variantes de cuantización probadas por el autor (datos extraídos de la model card).

| Modelo | Parámetros totales | Cuantización | MMLU-Pro | HumanEval | Contexto probado |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | BF16 | No disponible | No disponible | No disponible |
| Este checkpoint (oQ3.5e-fp16) | 35B (base) | 3,5 bits fp16 | 65,7% | 92,1% | 200K |
| Variante Q4e-BF16 | 35B | 4 bits BF16 | ~59–62% (según autor) | No disponible | No disponible |
| Variante Q5e-fp16 | 35B | 5 bits fp16 | ~59–62% (según autor) | 76,8% (regresión) | No disponible |
| Variante Q6e-BF16 | 35B | 6 bits BF16 | ~59–62% (según autor) | No disponible | No disponible |

No se dispone de comparativas con otros modelos de la misma categoría (p. ej., Llama 3.1 8B o Mistral Small) en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; no se garantiza un buen rendimiento en otros idiomas.
- El beneficio de MTP depende de la longitud de contexto: para contextos superiores a 100.000 tokens, el autor recomienda desactivar MTP porque la sobrecarga de drafting supera la ganancia de velocidad.
- Se ha observado una anomalía de velocidad de decodificación en oMLX v0.6.0 en el contexto de 8192 tokens; no es un fallo del modelo sino de esa versión del runtime.
- La cuantización de 3,5 bits puede degradar la precisión en tareas que requieren alta fidelidad numérica o razonamiento matemático complejo, aunque los benchmarks muestran resultados sólidos.
- Riesgo de alucinación inherente a los modelos de lenguaje; se recomienda verificar respuestas en contextos críticos.
- El modelo está optimizado para Apple Silicon; su uso en otras arquitecturas requeriría conversión de formato y probablemente pérdida de rendimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece garantías sobre el comportamiento del modelo en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Robot-Haus/Qwen3.6-35B-A3B-MAYA-oQ3.5e-fp16-mtp)
- [Modelo base Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Colección Qwen3.6 en HuggingFace](https://huggingface.co/collections/Qwen/qwen36)
- [Blog de Qwen sobre Qwen3.6-35B-A3B](https://qwen.ai/blog?id=qwen3.6-35b-a3b)
- [Página del modelo en Ollama](https://ollama.com/library/qwen3.6:35b-a3b)
- [Página del modelo en LM Studio](https://lmstudio.ai/models/qwen/qwen3.6-35b-a3b)
- [Repositorio de oMLX](https://github.com/jundot/omlx) (mencionado en la model card)
