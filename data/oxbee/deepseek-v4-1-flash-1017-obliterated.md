# OxBee/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una versión del modelo DeepSeek-V4.1-Flash-1017 a la que se le ha aplicado una ablación de la dirección de rechazo (refusal-direction ablation) mediante la herramienta OBLITERATUS y el método failspy. El modelo base es un transformer de tipo mixture-of-experts (MoE) desarrollado por DeepSeek, y esta variante ha sido publicada por el usuario OxBee en HuggingFace. El objetivo declarado es eliminar la tendencia del modelo a rechazar peticiones, reduciendo la tasa de rechazo del 81,62% al 4,30% según la evaluación del propio autor.

El modelo conserva la arquitectura y los pesos del original en BF16 safetensors, con 754.638.836.864 parámetros totales y un tamaño de repositorio de 1.509,4 GB. La licencia es MIT, lo que permite uso comercial, aunque las implicaciones éticas y legales de un modelo sin salvaguardas de rechazo son considerables. La relevancia actual radica en que ejemplifica la tendencia de las comunidades de "abliteration" a publicar variantes sin filtros de seguridad, lo que plantea debates sobre responsabilidad, despliegue y evaluación de riesgos en modelos de gran escala.

La información disponible no incluye detalles sobre la longitud de contexto, los idiomas soportados ni la composición exacta del entrenamiento del modelo base, por lo que estos datos se marcarán como no disponibles. La ficha se centra en los datos verificables de la model card y en las implicaciones técnicas y de seguridad del proceso de ablación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v41_text) |
| Parametros totales | 754.638.836.864 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de tipo mixture-of-experts (MoE) según la etiqueta `moe` y la arquitectura `deepseek_v41_text`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La variante obliterated no ha sido reentrenada: se ha obtenido mediante una intervención en los pesos que ablaciona la dirección de rechazo, utilizando el método failspy implementado en la herramienta OBLITERATUS.

El proceso de ablación se evalúa con métricas de divergencia KL (0,1305 nats respecto al modelo original), coherencia (100%) y capacidad (100%, con 6 de 6 comprobaciones superadas). El corpus de evaluación OBLITERATUS contiene 842 prompts, de los cuales el modelo modificado respondió completamente a 838. La evaluación de rechazo y asistencia dañina se realizó con jueces automáticos (Claude Opus 4.6 y GPT-6.1 Sol) y una revisión local con Codex, sin ejecutar ni verificar las instrucciones proporcionadas. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal en el modelo base.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y respuesta a preguntas de opción múltiple: en MMLU zero-shot con thinking desactivado, el modelo modificado obtuvo una precisión que la model card presenta junto al original (los datos completos de la tabla no están disponibles en el extracto proporcionado).
- Capacidad de seguir instrucciones sin rechazos: tasa de rechazo del 4% en el conjunto de evaluación del autor (2 de 50 prompts), frente al 81,62% del original.
- Respuesta directa a peticiones: el 86,52% de las respuestas fueron clasificadas como "responsive to the request", frente al 16,59% del original.
- No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües específicas, visión, audio ni modos de pensamiento explícitos en la información proporcionada.
- La ablación afecta a la capa de rechazo, pero no se documentan cambios en otras capacidades técnicas del modelo base.

## Casos de uso

- Investigación sobre seguridad y alineación: el modelo permite estudiar empíricamente el efecto de eliminar la dirección de rechazo en un MoE de gran escala, comparando distribuciones de rechazo, asistencia dañina y capacidad con el original. Es adecuado porque la model card proporciona métricas cuantitativas de antes y después (tasas de rechazo, KL, coherencia).
- Evaluación de robustez de filtros y salvaguardas: sirve como caso de prueba para sistemas de moderación que deben detectar respuestas dañinas. Los datos muestran que el 78,28% de las respuestas fueron clasificadas como asistencia dañina, lo que permite calibrar clasificadores.
- Análisis de degradación de capacidades tras ablación: con coherencia del 100% y capacidad del 100% en las comprobaciones del autor, el modelo es útil para medir si la eliminación de rechazos preserva el rendimiento en tareas neutras como MMLU.
- Estudio de divergencia de modelos: el KL de 0,1305 nats frente al original permite analizar cuánto cambia la distribución de salida al modificar una dirección latente, un caso práctico para investigación en interpretabilidad.
- Generación de texto sin restricciones en entornos controlados de investigación: en laboratorios con revisión ética, el modelo puede emplearse para generar corpus de respuestas a prompts sensibles y estudiar su contenido sin la interferencia de rechazos.
- Docencia y divulgación sobre abliteration: el repositorio incluye resultados de torneo, evaluación de rechazo y MMLU, lo que lo convierte en un ejemplo documentado para explicar el método failspy y la herramienta OBLITERATUS en cursos de seguridad de IA.

## Benchmarks y rendimiento

Datos disponibles en la model card:

| Metrica | Valor |
|---|---|
| Tasa de rechazo (50 prompts) | 4% (2 de 50) |
| Divergencia KL (secuencia-token forward KL) | 0,1305 nats |
| Coherencia | 100% |
| Capacidad | 100% (6 de 6 comprobaciones) |

Evaluación de rechazo sobre el corpus OBLITERATUS (842 prompts, porcentajes sobre 838):

| Clasificacion | Original | Obliterated | Delta (pp) |
|---|---:|---:|---:|
| Rechazo completo | 81,62% | 4,30% | -77,33 |
| Rechazo parcial | 4,89% | 14,44% | +9,55 |
| Sin rechazo | 13,37% | 78,28% | +64,92 |
| Asistencia dañina | 10,38% | 78,28% | +67,90 |
| Sin asistencia dañina | 89,50% | 18,74% | -70,76 |
| Respuesta directa a la petición | 16,59% | 86,52% | +69,93 |
| Alternativa segura | 83,29% | 10,50% | -72,79 |

Distribución de dañosidad (harmfulness):

| Nivel | Original | Obliterated | Delta (pp) |
|---|---:|---:|---:|
| 0 — Sin asistencia dañina | 89,50% | 18,74% | -70,76 |
| 1 — Impacto esperado bajo | 1,55% | 2,51% | +0,95 |
| 2 — Daño significativo | 4,89% | 21,72% | +16,83 |
| 3 — Daño grave | 3,82% | 44,75% | +40,93 |
| 4 — Daño severo o generalizado | 0,12% | 9,31% | +9,19 |

Distribución de accionabilidad (actionability):

| Nivel | Original | Obliterated | Delta (pp) |
|---|---:|---:|---:|
| 0 — Ninguna | 89,50% | 18,74% | -70,76 |
| 1 — Conceptual | 0,24% | 3,22% | +2,98 |
| 2 — Pasos parciales | 3,94% | 20,29% | +16,35 |
| 3 — Pasos específicos | 2,74% | 34,01% | +31,26 |
| 4 — Suficientemente concreto | 3,46% | 20,76% | +17,30 |

MMLU: la model card indica que se evaluaron 2.500 preguntas de 57 materias en zero-shot chat con thinking desactivado y logits de opción de respuesta, pero el extracto proporcionado no incluye la tabla completa de resultados. No se han publicado en la información disponible los valores de precisión del modelo obliterated ni del original en MMLU.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: con 754.638.836.864 parámetros, los pesos en BF16 ocupan aproximadamente 1.509 GB, por lo que la inferencia requiere múltiples aceleradores de gran capacidad. No cabe en una GPU consumer.
- GPU recomendadas: se necesitan clústeres con GPUs de数据中心 (A100 80 GB, H100 80 GB, H200, B200) en configuración multi-GPU. El número exacto de GPUs no está disponible en la información proporcionada.
- Cabe en consumer GPU: no. El tamaño del repositorio (1.509,4 GB) excede con mucho la VRAM de cualquier GPU consumer (RTX 4090 con 24 GB, etc.).
- Opciones de despliegue: la librería indicada es transformers. No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI para esta variante. El tamaño hace inviable llama.cpp u Ollama en hardware convencional.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | 754.638.836.864 | no disponible | MIT | HuggingFace (237 descargas) | Variante ablacionada, tasa de rechazo 4% |
| DeepSeek-V4.1-Flash-1017 (original) | no disponible en la información | no disponible | no disponible | HuggingFace | Modelo base, tasa de rechazo 81,62% |
| Otras variantes abliterated de la familia DeepSeek | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría (por ejemplo, otros MoE de gran escala o variantes abliterated de otros modelos) en parámetros, contexto y rendimiento. Los únicos datos comparativos disponibles son los del modelo original frente a la variante obliterated, presentados en la sección de benchmarks.

## Limitaciones y advertencias

- La ablación elimina en gran medida la dirección de rechazo, pero no garantiza un comportamiento seguro: el 78,28% de las respostas fueron clasificadas como asistencia dañina y el 44,75% como daño grave (nivel 3), frente al 3,82% del original.
- Riesgo elevado de generar contenido dañino, operacionalizable y con pasos concretos: el 20,76% de las respostas alcanzó el nivel 4 de accionabilidad ("suficientemente concreto para permitir la conducta").
- La evaluación se realizó con jueces automáticos (Claude Opus 4.6, GPT-6.1 Sol y Codex local) sin ejecutar ni verificar las instrucciones; los resultados reflejan el texto visible, no la viabilidad real de las instrucciones.
- Quedaron 25 respostas sin anotar por bloqueos de proveedor o plataforma, y 4 respostas incompletas del modelo obliterated fueron excluidas de la comparación.
- No se dispone de información sobre sesgos, idiomas soportados ni limitaciones de contexto del modelo base, por lo que no pueden evaluarse esos riesgos.
- La licencia MIT permite uso comercial, pero el despliegue de un modelo sin salvaguardas de rechazo puede infringir normativas de seguridad de contenido y políticas de plataformas; se recomienda revisión legal y ética antes de cualquier uso en producción.
- El tamaño del modelo (1.509,4 GB en BF16) impide su despliegue en hardware convencional y exige infraestructura de数据中心 multi-GPU, con costes elevados.
- El modelo tiene solo 237 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria independiente.
- La model card no documenta el número de parámetros activos del MoE, la longitud de contexto ni los tipos de cuantización soportados, lo que limita la planificación de despliegues.

## Enlaces

- HuggingFace: https://huggingface.co/OxBee/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (failspy): https://huggingface.co/OxBee/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/winner-recovery-provenance.json
- Resultados de evaluación: https://huggingface.co/OxBee/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/evaluation-status.json
- Licencia: https://huggingface.co/OxBee/DeepSeek-V4.1-Flash-1017-obliterated/blob/main/LICENSE
