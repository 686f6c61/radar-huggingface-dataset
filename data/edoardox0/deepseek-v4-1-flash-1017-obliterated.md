# edoardox0/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) a la que se le ha aplicado una ablación de la dirección de rechazo mediante la herramienta OBLITERATUS y el método failspy. El autor del derivado es el usuario de Hugging Face edoardox0. El objetivo declarado es eliminar los comportamientos de rechazo del modelo original, de modo que responda a peticiones que la versión base declina.

El modelo conserva la arquitectura y los pesos del base, con 754.638.836.864 parámetros totales en safetensors BF16 y un repositorio de 1.509,4 GB. La etiqueta `moe` en los tags sugiere una arquitectura de mezcla de expertos, aunque la información disponible no detalla el número de parámetros activos ni la longitud de contexto. La model card reporta una tasa de rechazo del 4% (2 de 50 prompts) y una divergencia KL de 0,1305 nats frente al original.

La relevancia de esta ficha es doble: por un lado, documenta un caso de modificación de alineamiento sobre un modelo de gran escala; por otro, los datos de evaluación publicados muestran un aumento drástico de asistencia dañina (del 10,38% al 78,28% de las respuestas clasificadas como tales), lo que convierte este modelo en un objeto de estudio para investigadores de seguridad y no en una opción recomendable para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (etiqueta `moe`; detalles de capas y expertos no disponibles) |
| Parametros totales | 754.638.836.864 (754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un derivado del DeepSeek-V4.1-Flash-1017, descrito por DeepSeek como una actualización menor de DeepSeek-V4.1-Flash con mejoras en razonamiento, código, tareas agénticas y benchmarks visuales, además de reducción del tiempo de ejecución y de la longitud de salida. Los tags del repositorio incluyen `deepseek_v41_text` y `moe`, lo que apunta a una arquitectura de mezcla de expertos orientada a texto; no se dispone de detalles sobre número de capas, número de expertos, tokens de entrenamiento ni composición del dataset.

La modificación aplicada es una ablación de la dirección de rechazo con OBLITERATUS y el método failspy, que actúa sobre las activaciones internas para suprimir la tendencia a declinar peticiones. No se trata de un reentrenamiento ni de un fine-tuning con datos nuevos, sino de una intervención sobre los pesos o las direcciones latentes del modelo base. La model card reporta una divergencia KL de secuencia-token de 0,1305 nats respecto al original, coherencia del 100% y capacidad del 100% (6 de 6 comprobaciones superadas), lo que indica que la intervención preserva en gran medida las capacidades generales mientras altera el comportamiento de rechazo.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base.
- Razonamiento, código, matemáticas y tareas agénticas según las mejoras declaradas por DeepSeek para V4.1-Flash-1017.
- Capacidades visuales mencionadas en la documentación del modelo base (no verificadas en esta variante).
- Soporte de tool calling y function calling: no confirmado en la información disponible para esta variante.
- Modo thinking: la evaluación MMLU se realizó con thinking desactivado, lo que implica que el modelo base dispone de dicho modo.
- Supresión de rechazos: responde a peticiones que el modelo original declina en el 81,62% de los casos (rechazo total reducido al 4,30%).
- Multilingüismo: no disponible.

## Casos de uso

- Investigación en seguridad de IA: análisis de cómo la ablación de la dirección de rechazo afecta a las distribuciones de comportamiento, usando las tablas de refusal, harmful assistance, harmfulness y actionability publicadas en la model card.
- Evaluación de robustez de alineamiento: comparación controlada entre el modelo base y el ablacionado sobre el corpus OBLITERATUS de 842 prompts para medir la degradación de las salvaguardas.
- Estudios de divergencia KL: uso del valor de 0,1305 nats como referencia para calibrar intervenciones de edición de pesos en modelos de gran escala.
- Benchmarking de métodos de ablación: comparación del método failspy con otras técnicas de eliminación de rechazo sobre la misma arquitectura.
- Red teaming académico: generación de respuestas que el modelo original bloquea para estudiar patrones de asistencia dañina en entornos controlados y con supervisión ética.
- Análisis de coherencia post-intervención: verificación de que la coherencia del 100% y la capacidad del 100% se mantienen en dominios específicos distintos de los evaluados por el autor.

No se recomienda su uso en atención al cliente, generación de código en producción ni pipelines comerciales, dado el perfil de riesgo documentado.

## Benchmarks y rendimiento

La model card incluye resultados de MMLU sobre 2.500 preguntas de 57 materias, en modo zero-shot chat, thinking desactivado y logits de elección de respuesta. La tabla publicada está truncada en la información disponible: solo se muestra la fila del modelo base (DeepSeek-V4.1-Flash-1017) sin el valor de precisión, por lo que no es posible reproducir la comparación numérica completa.

Resultados de la evaluación de rechazo y asistencia dañina sobre el corpus OBLITERATUS (838 prompts con respuesta completa):

| Métrica | Modelo base | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| Rechazo total | 81,62% | 4,30% | -77,33 |
| Rechazo parcial | 4,89% | 14,44% | +9,55 |
| Sin rechazo | 13,37% | 78,28% | +64,92 |
| Asistencia dañina | 10,38% | 78,28% | +67,90 |
| Respuesta alineada con la petición | 16,59% | 86,52% | +69,93 |
| Alternativa segura | 83,29% | 10,50% | -72,79 |

Distribución de daño potencial (escala 0-4):

| Nivel | Modelo base | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| 0 — Sin asistencia dañina | 89,50% | 18,74% | -70,76 |
| 1 — Impacto bajo | 1,55% | 2,51% | +0,95 |
| 2 — Daño significativo | 4,89% | 21,72% | +16,83 |
| 3 — Daño grave | 3,82% | 44,75% | +40,93 |
| 4 — Daño severo o generalizado | 0,12% | 9,31% | +9,19 |

Resultados del torneo interno reportados por el autor:

| Métrica | Valor |
|---|---:|
| Tasa de rechazo | 4% |
| Divergencia KL | 0,1305 nats |
| Coherencia | 100% |
| Capacidad | 100% |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMLU completo) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 754,6 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 1,5 TB, lo que exige múltiples GPUs de 80 GB (del orden de 20 unidades) o cuantización agresiva.
- GPU recomendadas: H100 80 GB o A100 80 GB en configuraciones multi-nodo; no cabe en GPUs de consumo en BF16.
- GPUs de consumo: no viable en RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo sin cuantización extrema, que no está documentada para esta variante.
- Opciones de despliegue: la librería declarada es `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754,6 B | no disponible | MIT | Derivado ablacionado, 0 descargas |
| DeepSeek-V4.1-Flash-1017 (base) | 754,6 B | no disponible | no disponible | Original de DeepSeek |
| OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated | no disponible | no disponible | no disponible | Derivado alternativo del mismo método |

La comparativa con modelos de otros desarrolladores (por ejemplo, otros MoE de escala similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Riesgo elevado de asistencia dañina: el 78,28% de las respuestas del corpus se clasificaron como asistencia dañina, frente al 10,38% del modelo base.
- El 44,75% de las respuestas alcanzan el nivel 3 de daño (grave) y el 9,31% el nivel 4 (severo o generalizado).
- El 20,76% de las respuestas son suficientemente concretas para habilitar la conducta solicitada (nivel 4 de actionability).
- La evaluación fue realizada por jueces automáticos (Claude Opus 4.6 y GPT-6.1 Sol) sin ejecutar ni verificar las instrucciones proporcionadas; los resultados describen el texto visible, no la eficacia real de las instrucciones.
- Quedaron 25 respuestas sin anotar por bloqueos de proveedor o plataforma, y 1 anotación ambigua; no hay anotaciones válidas en categorías de rechazo poco claro, asistencia poco clara, irrelevante, vacía o incoherente.
- La licencia MIT permite uso comercial según los términos de la misma, pero el perfil de riesgo del modelo hace desaconsejable su despliegue en entornos de producción sin salvaguardas adicionales.
- No se dispone de información sobre sesgos, idiomas soportados, longitud de contexto ni limitaciones específicas de la variante.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Hugging Face (variante de edoardox0): https://huggingface.co/edoardox0/DeepSeek-V4.1-Flash-1017-obliterated
- Hugging Face (variante de OBLITERATUS): https://huggingface.co/OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Ficha del modelo base en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (provenance): https://huggingface.co/edoardox0/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/winner-recovery-provenance.json
- Resultados de evaluación: https://huggingface.co/edoardox0/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/evaluation-status.json
- Licencia: https://huggingface.co/edoardox0/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/LICENSE
