# ndubg176/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una versión del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) a la que se le ha practicado una ablación de la dirección de rechazo (refusal-direction ablation) mediante la herramienta OBLITERATUS y el método failspy. El resultado es un modelo con la misma arquitectura y pesos que el original, pero con la capa de alineación de seguridad parcialmente eliminada, de modo que responde a peticiones que el modelo base rechazaría. El autor del fine-tune es el usuario de Hugging Face ndubg176, no DeepSeek.

Se trata de un modelo de arquitectura transformer de tipo mezcla de expertos (MoE), con 754.638.836.864 parámetros totales según los safetensors del repositorio (unos 754,6 mil millones), distribuido en formato BF16 safetensors y con un tamaño de repositorio de 1.509,4 GB. La model card no detalla el número de parámetros activos ni la longitud de contexto, aunque la etiqueta `moe` confirma la naturaleza de mezcla de expertos.

Su relevancia es doble: por un lado, ilustra el estado del arte en técnicas de "abliteration" (eliminación de la dirección de rechazo en el espacio de activaciones) aplicadas a modelos de gran escala; por otro, la propia model card documenta con detalle el coste en seguridad de esta intervención, con un aumento del 67,90 % en asistencias dañinas respecto al modelo base. Es, por tanto, un caso de estudio tanto técnico como de riesgos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tipo de modelo `deepseek_v41_text` en transformers |
| Parametros totales | 754.638.836.864 (≈754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-V4.1-Flash-1017, un transformer de mezcla de expertos (MoE) según la etiqueta del repositorio y el tipo `deepseek_v41_text` registrado en transformers. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

La intervención consiste en una ablación de la dirección de rechazo (refusal-direction ablation) realizada con la herramienta OBLITERATUS mediante el método failspy. Según la model card, el proceso se calibró sobre un conjunto de 254 prompts del corpus OBLITERATUS, con 50 prompts adicionales para la selección del método. El resultado declarado en el torneo interno es una tasa de rechazo del 4 %, una divergencia KL de 0,1305 nats respecto al modelo original, una coherencia del 100 % y una capacidad del 100 % (6 de 6 comprobaciones de capacidad superadas). La evaluación se realizó el 30 de octubre de 2026.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y respuesta a instrucciones: la model card reporta 6 de 6 comprobaciones de capacidad superadas tras la ablación.
- Capacidad de responder a peticiones que el modelo base rechaza: la tasa de rechazo baja del 81,62 % al 4,30 % en el corpus de evaluación.
- Modo de pensamiento (thinking): la evaluación MMLU del modelo base se realizó con "thinking disabled", lo que implica que el modelo soporta un modo de razonamiento explícito, aunque no se detallan sus características.
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como referencia controlada para estudiar cómo la ablación de la dirección de rechazo afecta al comportamiento, comparando sus distribuciones de rechazo, asistencia dañina y acción con las del modelo base sobre el mismo corpus de 842 prompts.
- Evaluación de técnicas de abliteración: permite reproducir y auditar el método failspy con OBLITERATUS sobre un modelo de 754,6 mil millones de parámetros, midiendo el compromiso entre supresión del rechazo (KL de 0,1305 nats) y preservación de capacidades (100 % de coherencia y capacidad declaradas).
- Red teaming y análisis de riesgos: al presentar una tasa de asistencia dañina del 78,28 % y un 44,75 % de respuestas clasificadas como "daño serio", es útil como sujeto de prueba para clasificadores de seguridad y filtros de contenido en pipelines de moderación.
- Estudio de robustez de salvaguardas: permite medir si los filtros externos (clasificadores de entrada/salida) detectan respuestas dañinas generadas por un modelo sin alineación interna, usando las distribuciones de acción (20,76 % con pasos suficientemente concretos para habilitar la conducta) como conjunto de prueba.
- Benchmarking de métodos de recuperación de capacidades: la model card menciona un fichero de procedencia de recuperación del ganador (winner-recovery-provenance.json), lo que sugiere su uso para comparar variantes de ablación y su impacto en MMLU sobre las mismas 2.500 preguntas retenidas de 57 materias.
- Docencia y divulgación técnica: como ejemplo documentado de los efectos medibles de eliminar la alineación, con tablas de rechazo, daño y acción listas para explicar el problema en cursos de seguridad de IA.
- No se recomienda su uso en producción orientada a usuarios finales por el riesgo documentado de asistencia dañina.

## Benchmarks y rendimiento

Resultados del torneo interno declarados en la model card:

| Métrica | Valor |
|---|---:|
| Tasa de rechazo | 4 % |
| Divergencia KL (respecto al original) | 0,1305 nats |
| Coherencia | 100 % |
| Capacidad | 100 % (6 de 6 comprobaciones) |

Evaluación de rechazo y asistencia dañina sobre el corpus OBLITERATUS (842 prompts; porcentajes sobre 838 respuestas completas):

| Clasificación | Modelo base | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| Rechazo total | 684 (81,62 %) | 36 (4,30 %) | -77,33 |
| Rechazo parcial | 41 (4,89 %) | 121 (14,44 %) | +9,55 |
| Sin rechazo | 112 (13,37 %) | 656 (78,28 %) | +64,92 |
| Asistencia dañina | 87 (10,38 %) | 656 (78,28 %) | +67,90 |
| Sin asistencia dañina | 750 (89,50 %) | 157 (18,74 %) | -70,76 |
| Respuesta ajustada a la petición | 139 (16,59 %) | 725 (86,52 %) | +69,93 |
| Alternativa segura | 698 (83,29 %) | 88 (10,50 %) | -72,79 |

Distribución de daño potencial:

| Nivel de daño | Modelo base | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| 0 — Sin asistencia dañina | 750 (89,50 %) | 157 (18,74 %) | -70,76 |
| 1 — Impacto esperado bajo | 13 (1,55 %) | 21 (2,51 %) | +0,95 |
| 2 — Daño significativo | 41 (4,89 %) | 182 (21,72 %) | +16,83 |
| 3 — Daño serio | 32 (3,82 %) | 375 (44,75 %) | +40,93 |
| 4 — Daño grave o generalizado | 1 (0,12 %) | 78 (9,31 %) | +9,19 |

Distribución de accionabilidad:

| Nivel de accionabilidad | Modelo base | Modelo obliterado | Delta (pp) |
|---|---:|---:|---:|
| 0 — Ninguna | 750 (89,50 %) | 157 (18,74 %) | -70,76 |
| 1 — Conceptual | 2 (0,24 %) | 27 (3,22 %) | +2,98 |
| 2 — Pasos parciales, faltan elementos esenciales | 33 (3,94 %) | 170 (20,29 %) | +16,35 |
| 3 — Pasos específicos, faltan algunos esenciales | 23 (2,74 %) | 285 (34,01 %) | +31,26 |
| 4 — Suficientemente concreto para habilitar la conducta | 29 (3,46 %) | 174 (20,76 %) | +17,30 |

La evaluación MMLU (2.500 preguntas retenidas, 57 materias, zero-shot chat, thinking desactivado, logits de opción de respuesta) se describe en la model card, pero el fragmento proporcionado se corta antes de mostrar los valores numéricos de precisión, por lo que no se dispone de ellos. Los jueces de anotación fueron Claude Opus 4.6 y GPT-6.1 Sol, con tres anotaciones adicionales de una revisión local de Codex.

## Requisitos de hardware

- VRAM estimada para inferencia: con 754,6 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 1.509 GB (coincide con el tamaño del repositorio); se requiere un entorno multi-GPU de gran escala. En cuantización de 8 bits, unos 755 GB; en 4 bits, unos 377 GB (estimaciones teóricas a partir del número de parámetros, no publicadas por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo exige clústeres con múltiples aceleradores de memoria alta (clase H100/H200 o A100 de 80 GB en número elevado), no una GPU individual.
- ¿Cabe en GPU de consumo? No. Ninguna GPU de consumo actual dispone de la memoria necesaria para los pesos completos, ni siquiera cuantizados a 4 bits.
- Opciones de despliegue: la librería declarada es transformers; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI. Dado el tamaño, llama.cpp y Ollama no son viables en hardware de consumo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754,6 mil millones (MoE) | no disponible | MIT | Variante abliterada; rechazo del 4,30 % y asistencia dañina del 78,28 % |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible en la información | no disponible | no disponible | Rechazo total del 81,62 %; asistencia dañina del 10,38 % |
| Otras variantes abliteradas de la familia DeepSeek | no disponible | no disponible | no disponible | No se dispone de datos comparables |

No se dispone de información sobre otros modelos de la misma categoría (abliterados de gran escala) para una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Eliminación de salvaguardas: la ablación reduce el rechazo total del 81,62 % al 4,30 %, pero eleva la asistencia dañina del 10,38 % al 78,28 % y el daño de nivel 3 (serio) del 3,82 % al 44,75 %. No es apto para despliegues orientados al público sin filtros externos.
- Accionabilidad elevada: el 20,76 % de las respuestas del modelo obliterado se clasifican como suficientemente concretas para habilitar la conducta solicitada, frente al 3,46 % del modelo base.
- Riesgo de alucinación: no cuantificado en la información proporcionada; la model card solo reporta coherencia del 100 % en el torneo interno, lo que no equivale a veracidad factual.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no se especifican los idiomas soportados.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías y la responsabilidad del uso recae en el desplegador; conviene revisar las condiciones del modelo base de DeepSeek.
- Procedencia de la evaluación: los resultados provienen de anotaciones con modelos jueces (Claude Opus 4.6, GPT-6.1 Sol y Codex local), con 25 respuestas sin anotar y 1 ambigua; las puntuaciones describen el texto visible y no verifican la ejecución de las instrucciones.
- Fecha de creación del repositorio: 20 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ndubg176/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (referenciado en la model card): winner-recovery-provenance.json (en el repositorio del modelo)
- Resultados de evaluación (referenciado en la model card): evaluation-status.json (en el repositorio del modelo)
- Licencia: LICENSE (en el repositorio del modelo)
