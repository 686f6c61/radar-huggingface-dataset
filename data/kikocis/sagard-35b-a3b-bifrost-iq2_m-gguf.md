# KikoCis/Sagard-35B-A3B-Bifrost-IQ2_M-GGUF

## Resumen

Sagard-35B-A3B-Bifrost-IQ2_M-GGUF es una cuantización GGUF de 2 bits del modelo InternScience/Sage-A1.5, un modelo de lenguaje orientado a tareas agénticas y de código. Lo publica el usuario KikoCis en Hugging Face bajo licencia Apache-2.0. El modelo base, desarrollado por InternScience (Shanghai AI Laboratory), se construye sobre Qwen3.6-35B-A3B y está diseñado para trabajo de horizonte largo: planificación, uso de herramientas, verificación del propio progreso y cambio de estrategia cuando un camino no funciona.

El interés de esta ficha no está en el modelo original, sino en el empaquetado: un MoE de 34.660.610.688 parámetros totales (aproximadamente 3B activos por token) comprimido a 11,66 GB mediante cuantización IQ2_M calibrada con una importance matrix. Eso lo sitúa en la banda de 8-12 GB de VRAM donde se ejecutan la mayoría de modelos locales en hardware de consumo, algo poco habitual para un modelo de este tamaño.

La cuantización es agresiva y el propio autor lo advierte: no es equivalente al modelo en BF16. Aun así, se validó que el modelo sigue comportándose como agente, resolviendo una instancia real de SWE-bench de extremo a extremo con un harness local. Es una opción a considerar cuando el objetivo es ejecutar un modelo agéntico grande en una GPU de consumo o en un portátil, aceptando una pérdida de calidad medible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (hereda la arquitectura de Qwen3.6-35B-A3B, soporte `qwen35moe` en llama.cpp) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3B por token (según el autor) |
| Longitud de contexto | No especificada en la información disponible; el ejemplo de llama.cpp usa `-c 32768` |
| Tipos de cuantizacion | IQ2_M con importance matrix (imatrix); el archivo imatrix se incluye para generar otros tamaños |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (11,66 GB) + archivo imatrix (0,19 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 35B parámetros totales y unos 3B activos por token, construido sobre Qwen3.6-35B-A3B. InternScience lo entrenó para trabajo agéntico de horizonte largo, con capacidades de planificación, uso de herramientas, verificación del propio progreso y replanificación. El modelo original es multimodal e incorpora una cabeza MTP (multi-token prediction); esta cuantización GGUF contiene únicamente el modelo de lenguaje, sin proyector de visión ni capa MTP.

El proceso de cuantización, documentado por el autor, consistió en convertir los safetensors BF16 originales a GGUF con llama.cpp (solo el modelo de texto, manteniendo arquitectura y tokenizer), calcular una importance matrix a partir de una copia Q8_0 con 174 fragmentos de 2048 tokens de código fuente y documentación técnica, y cuantizar de BF16 a IQ2_M con esa imatrix usando la mezcla estándar de tensores IQ2_M de llama.cpp. No hubo fine-tuning, merging ni entrenamiento adicional: los pesos son una cuantización sin modificar del modelo base. Antes de publicar, el autor verificó que el modelo carga, genera de forma coherente y resuelve al menos una de cinco instancias de SWE-bench sin fallos ni bucles.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento agéntico de horizonte largo: planificación, ejecución por pasos y replanificación cuando una ruta falla.
- Uso de herramientas mediante tool calling nativo (el chat template embebido en el GGUF incluye soporte de tool calls).
- Capacidades de código: resolución de issues reales de SWE-bench (parche correcto en `django__django-11099`), generación de funciones Python con HumanEval pass@1 de 0,854 (base) y 0,817 (plus).
- Modo thinking (razonamiento extendido) activable o desactivable; el autor evaluó en modo non-thinking para ajustarse al presupuesto de turnos.
- Verificación del propio progreso y cambio de curso, según las capacidades declaradas del modelo base.
- No incluye visión ni audio: esta cuantización es solo de texto.
- No se dispone de datos sobre capacidades matemáticas avanzadas ni sobre otros idiomas distintos del inglés y el chino.

## Casos de uso

- Asistente de código agéntico en local: integrado en un harness de agente (por ejemplo, un bucle de edición de archivos y ejecución de tests), el modelo puede abordar issues de repositorios Python y proponer parches. Encaja en equipos con GPU de 12-16 GB que quieren un agente de código sin depender de APIs externas.
- Automatización de tareas de mantenimiento de repositorios: triaje de issues, lectura de código, edición de archivos y verificación de resultados mediante tool calling, con contexto de hasta 32K tokens en la configuración de ejemplo.
- Prototipado de agentes multi-paso en investigación: el modelo permite experimentar con planificación y replanificación en local antes de escalar a modelos mayores o a infraestructura en la nube.
- Generación de código en pipelines de CI/CD: con soporte de tool calls, puede integrarse como paso de revisión o generación de parches en flujos automatizados, siempre con revisión humana dado el riesgo de alucinación.
- Despliegue en portátiles y estaciones de trabajo con GPU de consumo: con 11,66 GB de pesos, es viable en tarjetas de 12-16 GB y en sistemas con suficiente RAM mediante offload, lo que facilita demos y entornos de desarrollo sin servidor dedicado.
- Evaluación comparativa de cuantizaciones: el imatrix incluido permite generar otras cuantizaciones del mismo modelo y comparar su degradación frente a IQ2_M, útil para equipos que investigan el impacto de la compresión en capacidades agénticas.
- Asistentes conversacionales bilingües inglés-chino en entornos con restricciones de privacidad, donde no se puede enviar el código o los datos a un proveedor externo.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre este archivo GGUF, comparados con la cuantización de referencia mradermacher i1-Q2_K (13,25 GB):

| Benchmark | Configuración | Sagard IQ2_M (11,66 GB) | mradermacher i1-Q2_K (13,25 GB) |
|---|---|---|---|
| SWE-bench Verified, sonda de 5 instancias | harness agéntico local, presupuesto de contexto de ~12K caracteres, non-thinking, tool calls nativos, temp 1.0 | 1/5 resueltas | no ejecutado |
| HumanEval pass@1 (base) | non-thinking, temp 0.6, top_p 0.95, seed 1234, 2048 tokens nuevos máx. | 0,854 | 0,884 |
| HumanEval pass@1 (plus) | misma configuración | 0,817 | 0,860 |
| Generaciones desbocadas en HumanEval (alcanzan el límite de tokens) | misma configuración | 2/164 | 3/164 |
| Perplejidad Wikitext-2 (menor es mejor) | 40 fragmentos de 2048 tokens | 7,47 ± 0,10 | 7,20 ± 0,10 |

El autor señala que la cuantización mayor (Q2_K) va por delante: +3,0 puntos en HumanEval, +4,3 en HumanEval+ y aproximadamente un 3,5 % menos de perplejidad, coherente con sus 1,6 GB adicionales de pesos. En la sonda de SWE-bench, el modelo resolvió `django__django-11099` con un parche correcto; en las otras cuatro instancias siguió investigando y editando hasta agotar el presupuesto de 80 mensajes, sin fallos, respuestas vacías ni timeouts. El autor advierte que cinco instancias son una prueba de humo de competencia agéntica, no una puntuación de leaderboard, y que la tabla de benchmarks del modelo original (GAIA, XBench-DS, IFBench) corresponde al modelo en precisión completa y no se reclama para esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,66 GB solo para los pesos en IQ2_M; hay que sumar la caché KV, que depende del contexto configurado. Con 32K de contexto la huella total supera los 12 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) y, con ajustes de contexto, RTX 4070 Ti Super (16 GB). En GPUs de 12 GB el modelo entra justo y obliga a reducir contexto o hacer offload parcial a RAM.
- Cabe en GPU de consumo: sí, en la banda de 12-16 GB con contexto moderado; el autor lo presenta explícitamente como un modelo para "un portátil ordinario".
- Opciones de despliegue: Ollama (`ollama run hf.co/KikoCis/Sagard-35B-A3B-Bifrost-IQ2_M-GGUF`) y llama.cpp (`llama-server -hf KikoCis/Sagard-35B-A3B-Bifrost-IQ2_M-GGUF --jinja -c 32768`), con una build reciente que soporte `qwen35moe`. No se mencionan vLLM ni TGI para este formato.
- Sampling recomendado por el autor (heredado del modelo base): temperature 1.0, top_p 0.95, top_k 20, presence_penalty 1.5. El razonamiento se desactiva con `enable_thinking=false` en llama.cpp (`--chat-template-kwargs '{"enable_thinking":false}'`) o `think: false` en Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño del archivo | Contexto | HumanEval pass@1 (base) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sagard-35B-A3B-Bifrost-IQ2_M | 34,66B totales, ~3B activos | 11,66 GB (IQ2_M) | no especificado (ejemplo a 32K) | 0,854 | Apache-2.0 | GGUF en Hugging Face |
| mradermacher Sage-A1.5 i1-Q2_K | 34,66B totales, ~3B activos | 13,25 GB (Q2_K) | no especificado | 0,884 | Apache-2.0 | GGUF en Hugging Face |
| InternScience Sage-A1.5 (BF16) | 34,66B totales, ~3B activos | no disponible (precisión completa) | no disponible | no disponible para BF16 | Apache-2.0 | safetensors en Hugging Face |

La comparación directa disponible es entre cuantizaciones del mismo modelo base. Frente a la Q2_K de mradermacher, Sagard gana en tamaño (1,6 GB menos) y pierde en calidad medible. Frente al modelo en BF16, esta cuantización de 2 bits representa una degradación no cuantificada por el autor más allá de los benchmarks de la tabla. No se dispone de datos para comparar con otros modelos de la misma categoría y tamaño.

## Limitaciones y advertencias

- IQ2_M es una cuantización agresiva de 2 bits: conserva al modelo usable como agente, pero no equivale al modelo en BF16. La degradación se refleja en HumanEval y perplejidad frente a cuantizaciones mayores.
- La validación agéntica se hizo en modo non-thinking para ajustarse al presupuesto de turnos; las funciones agénticas del modelo original (Verification Mode, razonamiento largo) operan en modo thinking y no se evaluaron aquí.
- La sonda de SWE-bench cubre solo cinco instancias: es una prueba de humo, no una medida fiable de rendimiento en producción.
- Bajo presupuestos de contexto pequeños, el modelo a veces relee archivos que ya ha visto, lo que consume turnos y tokens.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la compresión a 2 bits; en generación de código conviene revisión humana y ejecución de tests.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Solo texto: no incluye visión ni capa MTP, a diferencia del modelo base.
- Licencia Apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo cuantizado en producción.
- No se han publicado datos de latencia ni throughput para esta cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KikoCis/Sagard-35B-A3B-Bifrost-IQ2_M-GGUF
- Modelo base InternScience/Sage-A1.5: https://huggingface.co/InternScience/Sage-A1.5
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantización de referencia mradermacher: https://huggingface.co/mradermacher/Sage-A1.5-i1-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Otro modelo del mismo autor (referencia de la búsqueda web): https://huggingface.co/KikoCis/Qwen-AgentWorld-35B-A3B-IQ2_M-GGUF
