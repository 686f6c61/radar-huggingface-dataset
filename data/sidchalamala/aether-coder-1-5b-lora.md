# sidchalamala/aether-coder-1.5b-lora

## Resumen

Aether coder 1.5b lora es un adaptador LoRA (PEFT) publicado por el usuario sidchalamala sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct. Su función es muy concreta: convertir un procedimiento de negocio descrito en inglés llano, junto con la política del propietario y la lista de hojas de cálculo disponibles, en un programa escrito en Aether, un DSL (lenguaje de dominio específico) con su propio comprobador estático e intérprete. No es un modelo de propósito general ni un asistente de código: es un generador de programas para un lenguaje propietario de investigación.

La relevancia del artefacto es doble. Por un lado, documenta un caso de uso poco frecuente en el ecosistema open source: el ajuste fino de un modelo pequeño (1.500 millones de parámetros) para una tarea de traducción de especificaciones a DSL con restricciones verificables externamente. Por otro, la model card publica resultados negativos con rigor estadístico: el adaptador mejora de forma clara al modelo base (20/90 frente a 1/90 en el conjunto held-out v2, p = 2,1e-05), pero añadir 413 muestras específicas de trampas no aporta mejora (6/30 frente a 6/30, McNemar p = 1), y una versión posterior v0.3 no liberada empeora el rendimiento en SOPs nuevas.

El autor insiste explícitamente en que el modelo no es un mecanismo de seguridad: el comprobador de Aether es quien bloquea los programas que violan las reglas C1-C8, y el modelo por sí solo resuelve únicamente 6 de 30 tareas trampa del conjunto congelado. El adaptador se entrenó en 42 minutos sobre una única RTX 4070, con datos sintéticos en inglés, y se distribuye con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (Qwen2.5-Coder-1.5B-Instruct); rango LoRA 16 |
| Parámetros totales | No disponible para el adaptador (el repositorio ocupa 0,1 GB); modelo base de 1.500 millones de parámetros |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible; el adaptador se publica en safetensors y puede fusionarse con el modelo base y cuantizarse con las herramientas de este (llama.cpp, AWQ, GPTQ, etc.) |
| Idiomas soportados | Inglés (entrenamiento exclusivamente con datos sintéticos en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Modelo base | Qwen/Qwen2.5-Coder-1.5B-Instruct |
| Tarea | Generación de programas Aether a partir de SOP en inglés + política + lista de hojas |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 sobre Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros. No se modifican los pesos del modelo base: se inyectan matrices de bajo rango y se entrena únicamente la pérdida sobre los tokens del programa Aether generado, no sobre el prompt ni sobre el texto de la especificación. La receta de la versión v0.1, que se mantiene en v0.2, usa learning rate 0,0002, 2 épocas, semilla 42 y selección del checkpoint por pérdida de validación. El entrenamiento completo llevó 42 minutos en una NVIDIA GeForce RTX 4070.

El conjunto de entrenamiento tiene 2.062 ejemplos verificados: 1.649 sintéticos generados a partir de plantillas y 413 ejemplos de estilo «trampa» (peticiones que la política prohíbe o que Aether no puede ejecutar, cuya respuesta correcta es un programa que realice la alternativa permitida). La innovación técnica del proyecto no está en el modelo, sino en el contrato que lo rodea: el comprobador de Aether valida las reglas C1-C8 y el intérprete ejecuta el programa; además, la model card evalúa dos modos de inferencia adicionales, realimentación del comprobador (hasta 3 intentos viendo errores de parser y checker) y decodificación restringida por gramática (solo tokens que la gramática de Aether admite).

Un hallazgo destacable, y negativo, es que la versión v0.3 (no liberada) añadió 1.232 muestras generadas a partir de 30 tipos de negocio adicionales, obtuvo 100/100 en su split sintético de test —igual que v0.2— y rindió peor que v0.2 en SOPs nuevas. El autor lo interpreta como que los datos generados enseñan las plantillas del generador más que la lectura de procedimientos reales.

## Capacidades

- Generación de programas en el DSL Aether a partir de una descripción de procedimiento de negocio en inglés, una política y una lista de hojas de cálculo.
- Manejo de peticiones prohibidas por la política: en el conjunto trampa produce, en algunos casos, el programa con la alternativa permitida en lugar de la acción solicitada.
- Lectura de especificaciones con estructura de negocio (hojas, columnas, límites, acciones externas simuladas: mensajes, dinero, calendarios).
- Modo con realimentación del comprobador: hasta 3 intentos adicionales consumiendo errores de parser y de checker (22/90 en held-out v2 frente a 20/90 en modo directo).
- Modo con decodificación restringida por gramática: restringe el vocabulario a los tokens válidos de la gramática Aether (19/90 en held-out v2).
- No soporta tool calling genérico, function calling de propósito general, visión, audio ni modo «thinking»: la información disponible no documenta ninguna de estas capacidades.
- Multilingüismo: no disponible; el entrenamiento es solo en inglés y no se documentan evaluaciones en otros idiomas.

## Casos de uso

- Generación de automatizaciones internas desde SOPs: el modelo traduce un procedimiento escrito por un responsable de operaciones a un programa Aether ejecutable, que después pasa por el comprobador antes de desplegarse. Adecuado porque la salida es un artefacto verificable, no texto libre.
- Pipeline con comprobador en bucle: integrar el adaptador en un servicio que, ante un error de parser o de checker, reinyecte el error y solicite hasta 3 reintentos. La model card reporta 20/90 en modo directo y 22/90 con realimentación, de modo que el bucle aporta una mejora modesta pero medible.
- Decodificación con gramática restringida en producción: usar el adaptador junto a un motor que limite el vocabulario a la gramática de Aether para garantizar que la salida siempre sea sintácticamente parseable (19/90 en la evaluación, con 0 violaciones de monitor en los programas aceptados).
- Investigación sobre «trap following» en modelos pequeños: el artefacto incluye conjuntos congelados y hasheados (30 tareas trampa y 90 tareas held-out v2) y comparaciones pareadas con McNemar, útiles como referencia reproducible para estudiar si el ajuste fino enseña a respetar políticas.
- Prototipado de un generador de DSL propio: sirve como plantilla metodológica (LoRA r16, 2 épocas, solo tokens de salida entrenados, 42 minutos en una RTX 4070) para equipos que quieran ajustar un modelo de 1,5B a un lenguaje de dominio específico con presupuesto mínimo.
- Evaluación de la brecha entre test sintético y SOPs reales: el caso de v0.3 (100/100 en test sintético, peor que v0.2 en SOPs nuevas) es un ejemplo práctico para calibrar hasta qué punto los datos generados por plantillas sobreajustan al generador.
- Filtrado previo en herramientas de cumplimiento normativo: dado que el modelo frecuentemente genera programas que violan la política, puede emplearse como generador de candidatos que el checker filtra, nunca como única barrera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos son evaluaciones específicas de la tarea SOP-to-Aether, con la métrica `safe_and_correct` (pasa el checker y tiene los mismos efectos que el programa de referencia).

Conjunto congelado de trampas (30 tareas, una evaluación por modelo):

| Sistema | Correctas | IC 95% |
|---|---|---|
| Modelo base + tarjeta de referencia + 3 ejemplos | 0/30 | 0,00-0,11 |
| v0.1 (solo datos sintéticos) | 6/30 | 0,10-0,37 |
| v0.2 (este adaptador, + 413 muestras trampa) | 6/30 | 0,10-0,37 |

Held-out v2 (90 tareas, 30 trampas, 15 tipos de negocio nuevos, una ejecución por condición):

| Sistema | Correctas (de 90) | IC 95% | Trampas (de 30) |
|---|---|---|---|
| Modelo base + tarjeta de referencia + 3 ejemplos | 1 | 0,00-0,06 | 0 |
| v0.2 directo (este adaptador) | 20 | 0,15-0,32 | 2 |
| v0.2 con realimentación del checker | 22 | 0,17-0,34 | 2 |
| v0.2 con gramática restringida | 19 | 0,14-0,31 | 2 |
| v0.3 directo (no liberado) | 14 | 0,10-0,24 | 3 |
| v0.3 con realimentación del checker (no liberado) | 15 | 0,10-0,26 | 3 |
| v0.3 con gramática restringida (no liberado) | 15 | 0,10-0,26 | 3 |

Benchmark de desarrollo (110 tareas, usado durante el desarrollo, no es un test limpio):

| Sistema | Correctas | Trampas (de 30) |
|---|---|---|
| Modelo base + tarjeta de referencia + 3 ejemplos | 3/110 | 0 |
| v0.1 | 30/110 | 2 |
| v0.2 | 34/110 | 3 |

Otros datos reportados: v0.2 frente al modelo base en held-out v2, 20 frente a 1 (McNemar pareado p = 2,1e-05, test no preregistrado); comparación primaria preregistrada v0.3 con realimentación frente a v0.2 directo, 15 frente a 20 (p = 0,33, resultado nulo); tipos de trampa novedosos ausentes en todos los datos de entrenamiento (borrar filas, subir un límite), 0/4 en todos los sistemas; en todas las evaluaciones el checker bloqueó todos los programas que rompían una regla y los programas aceptados tuvieron 0 violaciones de monitor.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como estimación a partir del tamaño (1,5B de parámetros), en bf16/fp16 el modelo base más el adaptador fusionado ronda los 3-4 GB de pesos; en cuantización de 4 bits, alrededor de 1-1,5 GB. Son cálculos derivados del número de parámetros, no cifras medidas por el autor.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más puede ejecutar el modelo fusionado en bf16; una RTX 4070 (12 GB) fue suficiente para entrenar el adaptador en 42 minutos. Para servir en paralelo con vLLM se recomienda una GPU con 16-24 GB (RTX 4090, L4, A10G) y, para lotes grandes, A100/H100.
- Cabe en GPU consumer: sí, con holgura, incluso en formato GGUF cuantizado sobre iGPU o CPU.
- Opciones de despliegue: PEFT + transformers (carga directa del adaptador), vLLM (soporte de adaptadores LoRA), TGI, llama.cpp y Ollama (requieren fusionar el adaptador con el modelo base y convertir a GGUF), y decodificación restringida por gramática en motores que la soporten (por ejemplo, gramáticas tipo GBNF o equivalentes).
- Latencia y throughput: no disponibles. Como referencia de coste, el entrenamiento del adaptador (2 épocas sobre 2.062 ejemplos) consumió 42 minutos en una RTX 4070; no se reportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea Aether | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aether-coder-1.5b-lora (este) | Base 1,5B + LoRA r16 | No disponible | 20/90 held-out v2 (2/30 trampas) | Apache 2.0 | HuggingFace, adaptador PEFT |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,5B | 32k según la documentación del modelo base, no verificado en la información proporcionada | 1/90 held-out v2 (0/30 trampas) | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-7B-Instruct | 7B | No disponible en la información proporcionada | No evaluado en la información disponible | Apache 2.0 | HuggingFace |
| v0.3 del mismo proyecto (no liberado) | Base 1,5B + LoRA | No disponible | 14/90 con realimentación; peor que v0.2 en SOPs nuevas | No liberado | No disponible |

No se han identificado en la información proporcionada otros adaptadores públicos que generen programas Aether ni DSL equivalentes, por lo que la comparativa con alternativas de la misma categoría es limitada. Los únicos puntos de comparación cuantitativos son el modelo base y las versiones internas del mismo proyecto.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos en inglés generados a partir de plantillas; la mayoría de los fallos en held-out son errores generales con negocios desconocidos (errores de parseo, errores de tipo, lectura de columnas no permitidas por la política), no solo seguimiento de trampas.
- El modelo no es un mecanismo de seguridad. El propio autor advierte que «el modelo a menudo escribe programas que rompen las reglas» y que toda salida debe pasar por el checker de Aether antes de ejecutarse. No debe describirse el modelo ni Aether como «seguros».
- Las trampas de tipo novedoso (borrar filas, subir un límite) obtienen 0/4 en todos los sistemas evaluados, incluida la versión actual.
- Todos los conjuntos de benchmark y held-out fueron redactados por Claude, un asistente de IA, no por empresas reales; la validez ecológica es baja.
- Conjuntos de evaluación pequeños (30, 90 y 110 tareas) con intervalos de confianza amplios y una sola semilla de entrenamiento por modelo.
- Añadir datos específicos de trampas no mejoró el rendimiento (6/30 frente a 6/30, p = 1); los datos generados parecen enseñar las plantillas del generador más que la lectura de SOPs reales, como sugiere el caso de v0.3.
- Las acciones externas de Aether (mensajes, dinero, calendarios) están simuladas; es software de investigación, no apto para producción sin control adicional.
- Riesgo de alucinación relevante: el modelo puede inventar columnas, hojas o acciones no presentes en la especificación, por lo que la verificación estática es obligatoria.
- Licencia Apache 2.0 en el adaptador, lo que permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B-Instruct tiene su propia licencia (Apache 2.0 según la model card) que conviene verificar en su repositorio.
- Repositorio con 0 descargas y 0 likes, creado y actualizado en octubre de 2026, sin pipeline declarado; no hay evidencia de uso externo ni mantenimiento.
- No se documentan idiomas distintos del inglés, ni soporte de tool calling, visión o audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidchalamala/aether-coder-1.5b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Demo en navegador del checker y del intérprete (no aloja el modelo): https://warnedorca.github.io/aether/
- Código de Aether: https://github.com/WarnedOrca/aether
- Benchmark y conjunto held-out: https://huggingface.co/datasets/sidchalamala/aether-benchmark

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos enlaces útiles proceden de la model card del autor.
