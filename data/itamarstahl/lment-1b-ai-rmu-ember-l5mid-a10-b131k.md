# itamarstahl/lment-1b-ai-rmu-ember-l5mid-a10-b131k

## Resumen

LMEnt 1B — artificial intelligence (AI) RMU+EMBER es un checkpoint de investigación publicado por itamarstahl (Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher) que consiste en un modelo de lenguaje causal OLMo2 de 1.000 millones de parámetros en inglés, sometido a un proceso de borrado de concepto (*concept erasure*) sobre el concepto "artificial intelligence (AI)". El punto de partida es el modelo de control completo `lment-1b-control-2e-b131k`, entrenado sobre el corpus Wikipedia con anotación de entidades LMEnt, sin ajuste por instrucciones. Sobre esa base se aplica primero EMBER con δ = 500 y después RMU (Representation Misdirection for Unlearning), con el objetivo de suprimir la información asociada al concepto objetivo sin reentrenar el modelo desde cero.

El interés del checkpoint es metodológico más que de producto: forma parte del artículo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, que compara el borrado de concepto por edición de pesos con un gemelo entrenado con ese concepto excluido del corpus. El autor advierte explícitamente que no se ha enmascarado ningún fragmento ligado al concepto en la función de pérdida, es decir, que la supresión se consigue por edición post-entrenamiento y no por exclusión de datos.

Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, licencia no declarada, soporte exclusivo de inglés y sin ajuste conversacional. La elección del checkpoint (`rmuember_ai_L5mid_a10`) se hizo sobre el split de selección del artículo con una regla fija, antes de la evaluación en el conjunto de test retenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (base OLMo2 1B) |
| Parametros totales | Aproximadamente 1.000 millones (OLMo2 1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento RMU uso una longitud maxima de secuencia de 512 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | No declarada ("No weight license is asserted in this card") |
| Formato de pesos | No especificado; pesos cargables con transformers (`AutoModelForCausalLM`, `torch_dtype="auto"`) |
| Libreria | transformers |
| Pipeline | text-generation |
| Ajuste por instrucciones | No (modelo base) |
| Repositorio | itamarstahl/lment-1b-ai-rmu-ember-l5mid-a10-b131k |
| Fecha de creacion del repositorio | 2026-09-28 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo OLMo2 1B: un transformer causal de aproximadamente 1.000 millones de parámetros, con tokenizador y pesos procedentes del ecosistema OLMo2. El modelo parte del control `lment-1b-control-2e-b131k`, entrenado sobre el corpus LMEnt de Wikipedia con anotación de entidades. No hay ajuste por instrucciones ni alineación tipo RLHF o DPO documentada en la información disponible.

El proceso de edición tiene dos etapas. Primero se aplica EMBER con δ = 500 sobre el modelo de control. Después se aplica RMU sobre ese modelo ya editado: se actualizan las proyecciones *down* de las capas MLP de las capas 3 a 5 con *mid steering* y un peso de retención α = 10, usando tasa de aprendizaje 1e-4, tamaño de lote 1, 150 actualizaciones, semilla 42 y longitud máxima de secuencia de 512. La configuración seleccionada corresponde al apéndice B.3 del artículo, con la etiqueta candidata `rmuember_ai_L5mid_a10`. El artículo señala que el ensamblado seleccionado mostró una alineación baja con la dirección de control objetivo de RMU.

## Capacidades

- Generación de texto causal en inglés, orientada a continuación de estilo Wikipedia con anotación de entidades.
- Modelo base sin *instruction tuning*: no está diseñado para seguir instrucciones ni para formato conversacional.
- Escenario experimental de borrado de concepto: permite estudiar la supresión del concepto "artificial intelligence (AI)" por edición de pesos.
- Comparación controlada frente a un gemelo con exclusión de concepto (`lment-1b-noai-2e-b131k`) y frente al control completo (`lment-1b-control-2e-b131k`).
- Soporte de *tool calling* o *function calling*: no disponible; no hay indicios de entrenamiento para ello.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el modelo no está ajustado para ello.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales (visión, audio, modo *thinking*): no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como sujeto de prueba para reproducir los resultados del artículo y estudiar cómo RMU+EMBER modifica las representaciones internas de un modelo de 1B parámetros.
- Evaluación comparativa de métodos de borrado: enfrentar este modelo con el gemelo de exclusión de datos (`lment-1b-noai-2e-b131k`) para medir si la edición de pesos reproduce el comportamiento de la exclusión en el corpus.
- Análisis de proximidad conductual: emplear las métricas de distancia (NLL y KL sobre vocabulario completo) para auditar cuánto se acerca el modelo editado al gemelo y cuánto se aleja del control, dentro de un *pipeline* de evaluación reproducible.
- Docencia y divulgación técnica: demostrar de forma tangible en qué consiste la edición de pesos por capas (MLP *down-projections* en capas 3-5) y qué efectos tiene sobre la perplejidad y la generación.
- Generación de texto de dominio general en inglés: al ser un modelo base, puede emplearse en tareas de continuación de texto o *scoring* de secuencias en inglés sobre temas ajenos al concepto borrado.
- *Baseline* en estudios de sesgo y sesgo de corpus: como el modelo deriva de Wikipedia, sirve como punto de partida para analizar errores y sesgos heredados del material de entrenamiento.
- Reproducibilidad de experimentos con semilla fija: la configuración documentada (semilla 42, 150 actualizaciones, α = 10) permite replicar el *fine-tuning* de RMU en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta las métricas del artículo sobre el conjunto de test retenido, con 50 preguntas objetivo por concepto:

| Metrica | Valor | Interpretacion segun el autor |
|---|---:|---|
| `H_test` (eficacia objetivo y preservacion) | 0.829 | Metrica combinada de supresion del objetivo y preservacion del resto |
| `R_abs` (distancia NLL de respuesta correcta al gemelo / distancia al modelo completo) | 2.196 | Valor superior a 1: mayor distancia al control que al gemelo en esa medida |
| `R_KL` (distancia KL de vocabulario completo con teacher forcing al gemelo / distancia al modelo completo) | 3.420 | Valor superior a 1: mayor distancia al control que al gemelo en esa medida |

El propio autor advierte que la supresión del concepto y el parecido con el gemelo son resultados distintos, y que la selección del checkpoint se realizó con preguntas de objetivo, temas vecinos y SciQ, sin usar el gemelo ni el conjunto de test retenido.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del tamano, no confirmada por el autor): en FP16/bf16 en torno a 2-3 GB de pesos, mas el *overhead* de activaciones y cache KV; en 8 bits aproximadamente 1,5 GB; en 4 bits aproximadamente 1 GB.
- GPU recomendadas para investigación: cualquier GPU con 8 GB o mas, como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o superiores.
- GPU de datacenter (A100, H100) no son necesarias para inferencia, pero pueden usarse para reproducir el *fine-tuning* de RMU y ejecutar barridos experimentales.
- Cabe en GPU de consumo: si, incluidas GPU de gama media con 8 GB o mas en cuantizacion de 4 u 8 bits.
- Opciones de despliegue: transformers (vía indicada por el autor), y alternativas compatibles como vLLM o TGI para servir el modelo; llama.cpp u Ollama requeririan conversion previa a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lment-1b-ai-rmu-ember-l5mid-a10-b131k (este) | ~1B (OLMo2 1B) | No disponible | Base + borrado de concepto (EMBER δ=500 + RMU) | No declarada | HuggingFace, 0 descargas |
| lment-1b-control-2e-b131k | ~1B (OLMo2 1B) | No disponible | Base de control sin edicion de concepto | No disponible | HuggingFace (referenciado por el autor) |
| lment-1b-noai-2e-b131k | ~1B (OLMo2 1B) | No disponible | Gemelo entrenado con el concepto excluido del corpus | No disponible | HuggingFace (referenciado por el autor) |
| Modelos base de ~1B en ingles | ~1B | Variable | Transformer causal | Variable | Depende del proveedor |

La comparativa relevante en la información proporcionada es interna al artículo: el modelo editado frente al gemelo de exclusión y frente al control completo. No se ofrecen comparaciones con modelos externos de la misma categoría.

## Limitaciones y advertencias

- El propio autor indica que las mediciones del artículo cubren tres conceptos seleccionados con 50 preguntas objetivo retenidas por concepto, y que esto no demuestra eliminación amplia de conocimiento, seguridad ni generalización a otros conceptos.
- Al derivar de Wikipedia, el modelo puede reproducir errores y sesgos presentes en su material de entrenamiento.
- La licencia de los pesos no está declarada en la *model card*, por lo que el uso comercial queda en un limbo legal: no se puede asumir permiso.
- Es un modelo base sin *instruction tuning*: no debe esperarse seguimiento de instrucciones, formato de chat ni alineación de seguridad.
- Solo soporta inglés; cualquier uso en otros idiomas carece de garantías.
- Riesgo de alucinación inherente a un modelo causal de 1B parámetros entrenado sobre texto enciclopédico.
- La longitud de contexto no está documentada en la información disponible; el único dato relacionado es la longitud máxima de secuencia de 512 usada durante el entrenamiento de RMU.
- Los valores `R_abs` y `R_KL` superiores a 1 indican mayor distancia al modelo de control que al gemelo en esas medidas, lo que el autor interpreta con matices: supresión y parecido al gemelo son resultados distintos, no equivalentes.
- Repositorio sin descargas ni interacción de la comunidad en el momento de la consulta: no hay validación externa ni informes de terceros sobre su comportamiento en producción.
- Fechas de creación y actualización del repositorio (2026-09-28) coherentes con el artículo citado; conviene verificar la vigencia y posibles revisiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-ai-rmu-ember-l5mid-a10-b131k
- Modelo de control completo: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con concepto excluido: https://huggingface.co/itamarstahl/lment-1b-noai-2e-b131k
- Articulo citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026. Enlace al paper: no disponible en la informacion proporcionada.
- Repositorio de codigo o demo: no disponible en la informacion proporcionada.
