# murphy01242/ERNIE-5.5-Flash-EXL3-3.23bpw

## Resumen

ERNIE-5.5-Flash-EXL3-3.23bpw es una cuantización híbrida en formato EXL3 del modelo `baidu/ERNIE-5.5-Flash-Preview-FP8`, publicada por el usuario murphy01242. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 280 000 millones de parámetros totales y 14 000 millones activos por token, que incorpora además un modelo borrador especulativo integrado de 20 000 millones de parámetros denominado DSpark, con tres etapas de decodificación multi-token. El checkpoint está pre-fragmentado para ejecutarse con tensor parallelism de grado 2 (TP=2) sobre dos nodos NVIDIA DGX Spark con GPU GB10 y 128 GiB de memoria unificada cada uno.

La relevancia de esta publicación es doble. Por un lado, demuestra que un modelo de 280B puede desplegarse en hardware de escritorio de gama alta (dos estaciones DGX Spark) mediante cuantización agresiva a ~3,23 bits por peso en runtime. Por otro, incluye una caché KV FP8 con una ventana de contexto de 1 048 576 tokens (1M), verificada con pruebas de Needle-in-a-Haystack de coincidencia exacta hasta la profundidad máxima. El autor incluye los registros de evaluación en bruto y un parche de runtime para SGLang, lo que permite reproducir las mediciones.

El repositorio se presenta explícitamente como un proyecto de aprendizaje personal, el primero del autor en Hugging Face, con asistencia de IA en la redacción de la model card pero con mediciones reales sobre su propio hardware. La licencia es Apache 2.0, heredada del modelo base, y los idiomas declarados son chino (zh) e inglés (en).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con modelo borrador especulativo integrado DSpark de 3 etapas |
| Parámetros totales | 280 000 millones (280B) |
| Parámetros activos | 14 000 millones (14B) |
| Longitud de contexto | 1 048 576 tokens (1M), caché KV FP8 |
| Tipos de cuantización | EXL3 a ~3,23 bpw en runtime (~3,0919 bpw en pesos cuantizados EXL3) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3), pre-fragmentado en `rank0/` y `rank1/` para TP=2 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 280B parámetros totales y 14B activos, lo que implica un ratio de activación de aproximadamente el 5 %. La innovación arquitectónica más destacable es la integración de DSpark, un modelo borrador especulativo de 20B parámetros con tres etapas de decodificación multi-token, que acelera la generación al proponer varios tokens candidatos que el modelo principal verifica en paralelo. Esta técnica de decodificación especulativa es la que permite alcanzar velocidades de decodificación de 20-36 tok/s en un modelo de este tamaño sobre hardware de consumo profesional.

La cuantización EXL3 reduce los pesos a aproximadamente 3,23 bits por peso en runtime, con un promedio de 3,0919 bpw sobre los pesos efectivamente cuantizados. El autor no proporciona detalles sobre el dataset de entrenamiento original del modelo base (composición, número de tokens, si hubo RLHF o DPO), ya que esta información corresponde a Baidu y no se incluye en la model card de la cuantización. Tampoco se documenta el proceso de calibración más allá de la referencia a `exllamav3/standard_cal_data/wiki.utf8` para el cálculo de perplejidad. El checkpoint requiere un parche de SGLang incluido en `./sglang_overlay/` y una compilación de ExLlamaV3 (`exllamav3_ext`).

## Capacidades

- Generación de texto en chino e inglés con modo de razonamiento opcional (`thinking=True/False`).
- Razonamiento matemático: 95,0 % en GSM8K (subconjunto de 200) y 71,0 % en MATH-500 (subconjunto de 100, con `thinking=True` y tope de 3072 tokens).
- Generación de código: 97,56 % en HumanEval completo (160/164), con ejecución aislada en subproceso de Python.
- Seguimiento de instrucciones verificables: 91,67 % en IFEval (120 prompts, nivel de prompt estricto).
- Conocimiento en chino: 85,57 % en CMMLU (201 preguntas estratificadas sobre 67 asignaturas).
- Contexto largo extremo: recuperación exacta en Needle-in-a-Haystack hasta 1M tokens (5/5 profundidades evaluadas).
- Decodificación especulativa integrada mediante DSpark (borrador greedy de 3 etapas).
- Capacidad multilingüe limitada a chino e inglés según la model card.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- No se documenta soporte de visión ni audio en la información disponible.

## Casos de uso

- Análisis de documentación técnica extensa: con una ventana de 1M tokens y recuperación exacta verificada hasta esa profundidad, el modelo puede procesar manuales completos, bases de código o expedientes legales en una sola pasada sin fragmentación. El TTFT de 48 s para 32K y 2319 s para 1M debe tenerse en cuenta en el diseño del flujo.
- Generación de código en pipelines de revisión: el 97,56 % en HumanEval completo y el soporte de ejecución aislada permiten integrarlo en tareas de autocompletado, generación de tests o corrección de parches, con verificación automática de las salidas.
- Razonamiento matemático asistido: el 95 % en GSM8K y el 71 % en MATH-500 con modo thinking lo hacen adecuado para tutoría o verificación de cálculos, siempre con revisión humana dado el riesgo de alucinación en pasos intermedios.
- Procesamiento de conocimiento en chino: el 85,57 % en CMMLU sobre 67 asignaturas permite construir asistentes de consulta para dominios especializados en chino (derecho, medicina, finanzas) con contexto largo para documentación normativa.
- Evaluación de instrucciones complejas: el 91,67 % en IFEval sugiere utilidad en sistemas que requieren cumplir restricciones verificables de formato, longitud o estructura en la salida, como generación de informes con plantillas estrictas.
- Despliegue en hardware de escritorio profesional: la fragmentación TP=2 sobre dos DGX Spark (GB10, 128 GiB cada una) permite ejecutar un 280B MoE en un entorno de laboratorio o pequeña oficina sin clúster de centro de datos, con velocidades de 20-36 tok/s en decodificación.
- Investigación en cuantización extrema: el checkpoint y los registros en bruto (`bench_results.json`, `conversion-report.json`) sirven como referencia reproducible para estudiar el impacto de EXL3 a ~3,23 bpw en modelos MoE de gran escala.

## Benchmarks y rendimiento

Todas las mediciones se ejecutaron sobre el servidor SGLang TP=2 del autor, con `temperature=0.0`, caché KV FP8 de 1 048 576 tokens y borrador DSpark greedy.

| Benchmark | Split / protocolo | Modo | Aciertos / total | Puntuación | Velocidad agregada (bs=4) |
|---|---|---|---|---|---|
| OpenAI HumanEval | Completo 164/164, subproceso Python aislado | `thinking=False`, `temp=0.0` | 160/164 | 97,56 % | 83,17 tok/s |
| OpenAI GSM8K | Primeros 200 ítems deterministas, equivalencia exacta `\boxed{}` | `thinking=False`, `temp=0.0` | 190/200 | 95,0 % | 86,19 tok/s |
| HF MATH-500 | 100 estratificados en 7 materias, tope 3072 tokens | `thinking=True`, `temp=0.0` | 71/100 | 71,0 % | 72,47 tok/s |
| CMMLU | 201 estratificados en 67 asignaturas chinas (3/asignatura) | `thinking=False`, 0-shot | 172/201 | 85,57 % | no disponible |
| Google IFEval | 120 prompts de restricción verificable, nivel de prompt estricto | `thinking=False`, `temp=0.0` | 110/120 | 91,67 % | 63,34 tok/s |
| Wiki Perplexity | `exllamav3/standard_cal_data/wiki.utf8` (10 395 tokens) | SGLang `input_token_logprobs` | — | PPL = 4,9693 (NLL = 1,60328) | no disponible |

Prueba de contexto largo (Needle-in-a-Haystack, `thinking=False`, `temp=0.0`, `max_tokens=512`, aguja al 50 % de profundidad, prefijo de sesión único para forzar prefill en frío):

| Profundidad | Tokens reales del prompt | Recuperación | TTFT | Throughput de prefill | Throughput de decodificación |
|---|---|---|---|---|---|
| 32K | 31 694 | PASS (coincidencia exacta) | 48,33 s | 655,7 tok/s | 36,36 tok/s |
| 128K | 126 463 | PASS (coincidencia exacta) | 150,05 s | 842,8 tok/s | 32,52 tok/s |
| 256K | 252 879 | PASS (coincidencia exacta) | 331,02 s | 763,9 tok/s | 34,26 tok/s |
| 512K | 505 652 | PASS (coincidencia exacta) | 836,89 s | 604,2 tok/s | 34,17 tok/s |
| 1M | 1 007 259 | PASS (coincidencia exacta) | 2319,01 s | 434,3 tok/s | 20,91 tok/s |

Notas del autor: en HumanEval, 2 de los 4 fallos fueron `NameError` del harness porque el modelo omitió reemitir helpers preproporcionados; los otros 2 fallaron aserciones. En MATH-500, varios problemas agotaron el presupuesto de 3072 tokens antes de emitir `\boxed{}`.

## Requisitos de hardware

- VRAM/memoria unificada: el checkpoint ocupa 69,4 GB en el repositorio, pero el despliegue requiere el pool de caché KV FP8 de 1M tokens, por lo que el autor lo ejecuta sobre 2 × 128 GiB de memoria unificada (dos nodos DGX Spark con GB10, SM 12.1).
- GPU recomendadas: NVIDIA DGX Spark (GB10) en configuración TP=2, tal como se validó. No se documentan otras configuraciones probadas.
- GPU de consumo: no se documenta viabilidad en RTX 4090 u otras GPU de consumo; el modelo base FP8 de 280B no cabe en 2 × 128 GiB según el propio autor, lo que descarta configuraciones de menor memoria sin cuantización adicional.
- Opciones de despliegue: SGLang con el parche `./sglang_overlay/` incluido y una compilación de ExLlamaV3 (`exllamav3_ext`). La librería declarada es `exllamav3`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: decodificación de 20,91-36,36 tok/s según profundidad de contexto; prefill de 434,3-842,8 tok/s; TTFT de 48,33 s (32K) a 2319,01 s (1M); velocidad agregada de 63,34-86,19 tok/s con batch size 4 en los benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-EXL3-3.23bpw (esta ficha) | 280B / 14B (MoE) | 1M | Apache 2.0 | Hugging Face, EXL3, TP=2 | Cuantización comunitaria; 97,56 % HumanEval, 95,0 % GSM8K, PPL 4,9693 |
| baidu/ERNIE-5.5-Flash-Preview-FP8 | 280B / 14B (MoE) | no disponible | no disponible | Hugging Face (modelo base) | Referencia sin cuantizar; el autor no pudo medir baseline local por falta de memoria |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables en la información disponible |

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que no es posible establecer comparaciones cuantitativas con otros modelos de tamaño o tarea similar.

## Limitaciones y advertencias

- No existe baseline FP8 local sin cuantizar: el 280B FP8 completo no cabe en 2 × 128 GiB, por lo que no se midió ΔPPL ni ΔKLD. Los números deben tratarse como referencia autónoma, no como prueba de pérdida nula.
- Solo HumanEval (164/164) usa el split oficial completo; GSM8K (N=200), CMMLU (N=201), IFEval (N=120) y MATH-500 (N=100, tope 3072 tokens) son subconjuntos deterministas elegidos por tiempo de evaluación.
- El layout TP=2 está pre-fragmentado en `rank0/` y `rank1/` y requiere el parche de SGLang incluido y una compilación específica de ExLlamaV3; no es un checkpoint portable a otras configuraciones sin trabajo adicional.
- Idiomas limitados a chino e inglés; no se documenta rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a modelos generativos; los fallos de HumanEval por omisión de helpers preproporcionados indican sensibilidad al contexto del prompt en tareas de código.
- En MATH-500 con `thinking=True`, varios problemas agotaron el presupuesto de tokens antes de concluir el razonamiento, lo que sugiere que contextos de salida cortos degradan el rendimiento en matemáticas complejas.
- Licencia Apache 2.0 heredada del modelo base, lo que en principio permite uso comercial, pero el autor no ofrece garantías y el repositorio es un proyecto de aprendizaje personal sin soporte.
- Proyecto de aprendizaje: el autor advierte de posibles asperezas e invita a reportar errores; no hay historial de mantenimiento ni versión estable.
- El modelo base es `baidu/ERNIE-5.5-Flash-Preview-FP8`, una versión "Preview", lo que puede implicar cambios o retirada por parte de Baidu.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/murphy01242/ERNIE-5.5-Flash-EXL3-3.23bpw
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-FP8
- Registros de benchmarks en bruto: `./bench_results.json` (incluido en el repositorio)
- Informe de conversión: `./conversion-report.json` (incluido en el repositorio)
- Parche de SGLang: `./sglang_overlay/` (incluido en el repositorio)
- Datos de calibración de perplejidad: `exllamav3/standard_cal_data/wiki.utf8`
- No se proporcionan enlaces adicionales a papers, blogs, repositorios de código o demos en la información disponible.
