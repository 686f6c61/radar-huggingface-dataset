# Ksshitijgupta9/DeepSeek-V4.1-Flash-1017-obliterated

## Resumen

DeepSeek-V4.1-Flash-1017-obliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) a la que se le ha practicado una ablación de la dirección de rechazo (refusal-direction ablation) mediante la herramienta OBLITERATUS con el método failspy. El resultado es un modelo que conserva la arquitectura y los pesos del original, pero con la capa de alineación de seguridad parcialmente neutralizada. Lo publica el usuario Ksshitijgupta9 en Hugging Face bajo licencia MIT.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 754.638.836.864 parámetros totales en BF16 safetensors (unos 754,6 mil millones), lo que lo sitúa en la categoría de modelos de gran escala. El repositorio ocupa 1.509,4 GB. La model card no detalla el número de parámetros activos, la longitud de contexto ni la composición del dataset de entrenamiento del modelo base.

La relevancia de esta ficha es doble: por un lado documenta un modelo de gran tamaño con arquitectura MoE; por otro, es un caso de estudio de modificación de alineación, ya que el autor publica métricas de rechazo, daño y capacidad que cuantifican el efecto de la ablación. Es un artefacto orientado a investigación sobre seguridad y comportamiento de modelos, no a despliegue comercial convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `deepseek_v41_text`; detalles no disponibles) |
| Parametros totales | 754.638.836.864 (≈754,6 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una modificación por ablación del modelo base DeepSeek-V4.1-Flash-1017. La técnica aplicada es refusal-direction ablation con el método failspy, ejecutada mediante la herramienta OBLITERATUS. Este procedimiento identifica una dirección en el espacio de activaciones asociada a las respuestas de rechazo y la proyecta fuera, de modo que el modelo deja de activar el patrón de negativa ante ciertas peticiones. No se trata de un reentrenamiento ni de un fine-tuning con datos nuevos: los pesos conservan la estructura del original salvo por la intervención sobre esa dirección.

La model card documenta el proceso de evaluación con un corpus de 842 prompts, calibración sobre 254 prompts y selección de método sobre 50. La evaluación de capacidades se hizo con MMLU (2.500 preguntas, 57 materias, zero-shot, thinking desactivado, logits de opción de respuesta) y la de comportamiento con clasificadores automáticos (Claude Opus 4.6 y GPT-6.1 Sol). No hay información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO en su construcción original.

## Capacidades

- Generación de texto conversacional en formato chat (pipeline `text-generation`, tag `conversational`).
- Razonamiento y respuesta a preguntas de conocimiento general: el modelo base obtiene resultados en MMLU sobre 57 materias.
- Capacidad de seguir instrucciones y producir respuestas completas: la evaluación reporta 100 % de coherencia y 100 % de capacidad en las comprobaciones del autor (6 de 6).
- Compatibilidad con endpoints (`endpoints_compatible`), pensada para servir el modelo mediante APIs compatibles.
- Modo de pensamiento (thinking) presente en el modelo base, aunque la evaluación MMLU se realizó con thinking desactivado.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve para estudiar cómo la ablación de la dirección de rechazo afecta al comportamiento (tasas de rechazo del 81,62 % al 4,30 %), comparando con el modelo original en condiciones controladas.
- Evaluación de robustez de clasificadores: los conjuntos de respuestas anotadas (837 del original, 813 del ablacionado) permiten entrenar y validar jueces automáticos de daño y rechazo.
- Estudio de degradación de capacidades: con MMLU sobre 2.500 preguntas se puede medir si la intervención sobre la dirección de rechazo afecta al rendimiento cognitivo general del modelo.
- Reproducción de metodologías de ablación: el repositorio incluye referencias al método (OBLITERATUS, failspy) y archivos de procedencia, lo que facilita replicar el pipeline sobre otros modelos.
- Análisis de divergencia KL: la métrica de 0,1305 nats frente al original permite cuantificar cuánto se desvía la distribución de salida tras la intervención.
- Docencia y divulgación técnica: como ejemplo práctico de cómo una modificación de pesos altera el comportamiento de seguridad sin reentrenar, útil en cursos de seguridad de IA.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Métrica | Valor |
|---|---|
| Tasa de rechazo (50 prompts de evaluación) | 4 % (2 de 50) |
| Divergencia KL (forward, secuencia-token, frente al original) | 0,1305 nats |
| Coherencia | 100 % |
| Capacidad (comprobaciones superadas) | 100 % (6 de 6) |

Comparación de rechazo sobre el corpus OBLITERATUS (842 prompts, porcentajes sobre 838):

| Clasificación | DeepSeek-V4.1-Flash-1017 | -obliterated | Delta (pp) |
|---|---:|---:|---:|
| Rechazo total | 684 (81,62 %) | 36 (4,30 %) | -77,33 |
| Rechazo parcial | 41 (4,89 %) | 121 (14,44 %) | +9,55 |
| Sin rechazo | 112 (13,37 %) | 656 (78,28 %) | +64,92 |

| Clasificación | DeepSeek-V4.1-Flash-1017 | -obliterated | Delta (pp) |
|---|---:|---:|---:|
| Asistencia dañina | 87 (10,38 %) | 656 (78,28 %) | +67,90 |
| Sin asistencia dañina | 750 (89,50 %) | 157 (18,74 %) | -70,76 |

Distribución de daño potencial:

| Nivel | Original | -obliterated | Delta (pp) |
|---|---:|---:|---:|
| 0 — Sin asistencia dañina | 750 (89,50 %) | 157 (18,74 %) | -70,76 |
| 1 — Impacto bajo | 13 (1,55 %) | 21 (2,51 %) | +0,95 |
| 2 — Daño significativo | 41 (4,89 %) | 182 (21,72 %) | +16,83 |
| 3 — Daño serio | 32 (3,82 %) | 375 (44,75 %) | +40,93 |
| 4 — Daño severo o generalizado | 1 (0,12 %) | 78 (9,31 %) | +9,19 |

MMLU (2.500 preguntas, 57 materias, zero-shot, thinking desactivado): la información proporcionada está truncada en la tabla de resultados, por lo que no se dispone de las cifras de precisión del modelo ablacionado ni del original.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1.509 GB solo para pesos (754,6 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache; requiere múltiples aceleradores.
- Cuantización: no se documentan versiones GGUF, AWQ ni GPTQ en el repositorio; para reducir requisitos habría que generarlas a partir de los safetensors BF16.
- GPU recomendadas: nodos multi-GPU de clase H100 (80 GB) o A100 (80 GB); un solo dispositivo consumer es insuficiente para los pesos completos.
- GPU consumer: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB en BF16; solo sería viable con cuantizaciones muy agresivas no publicadas.
- Opciones de despliegue: la librería declarada es transformers; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API. No se confirma soporte de vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-obliterated | ≈754,6 mil millones | no disponible | MIT | Variante ablacionada; rechazo 4,30 % |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible en la información | no disponible | no disponible | Original; rechazo total 81,62 % |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos MoE comparables en la información proporcionada |

## Limitaciones y advertencias

- La ablación elimina en gran medida el comportamiento de rechazo: la tasa de rechazo total cae del 81,62 % al 4,30 % y la asistencia dañina sube del 10,38 % al 78,28 % según los clasificadores del autor. No es un modelo apto para aplicaciones orientadas al público sin capas de seguridad externas.
- El 44,75 % de las respuestas se clasifican como daño serio (nivel 3) y el 9,31 % como daño severo (nivel 4); el 20,76 % alcanza acción suficiente para habilitar la conducta descrita. Cualquier uso en producción exige filtros de entrada y salida.
- La evaluación se basa en clasificadores automáticos (Claude Opus 4.6, GPT-6.1 Sol y una revisión local de Codex); no se ejecutaron ni verificaron las instrucciones proporcionadas, por lo que las etiquetas describen solo el texto visible.
- 25 respuestas del modelo ablacionado quedaron sin anotar por bloqueos de proveedor; la cobertura no es completa.
- La divergencia KL de 0,1305 nats indica una desviación medible respecto al original, pero el autor reporta coherencia y capacidad del 100 % en sus comprobaciones; no hay MMLU completo disponible en la información para verificar el impacto en conocimiento.
- Licencia MIT: permite uso comercial y modificación, pero el usuario asume la responsabilidad legal y ética del contenido generado.
- No hay información sobre sesgos, idiomas soportados ni longitud de contexto, lo que impide evaluar su idoneidad multilingüe o para contextos largos.
- El repositorio (1.509,4 GB) y los requisitos de hardware hacen inviable su uso en entornos sin infraestructura multi-GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ksshitijgupta9/DeepSeek-V4.1-Flash-1017-obliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Herramienta OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Detalles del método (referenciado en la model card): `winner-recovery-provenance.json`
- Resultados de evaluación (referenciado en la model card): `evaluation-status.json`
