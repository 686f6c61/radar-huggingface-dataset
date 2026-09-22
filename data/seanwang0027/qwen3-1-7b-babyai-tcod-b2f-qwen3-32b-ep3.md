# SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep3

## Resumen

El modelo `SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep3` es un ajuste fino de investigación sobre `Qwen/Qwen3-1.7B`, un transformer decoder-only denso de 2.031.739.904 parámetros (aproximadamente 2,03 mil millones). Lo desarrolla el usuario de HuggingFace SeanWang0027 y su propósito no es el uso generalista, sino servir como artefacto experimental de un pipeline de destilación on-policy (OPD) aplicado a tareas del entorno BabyAI, un mundo de rejilla con instrucciones en lenguaje natural.

La receta de entrenamiento combina TCOD (backward-to-forward, con prefijo dorado decreciente y `checkpoint_steps` de 5) con un overlay denominado FutureBridge-OPD sobre trinity-rft. El alumno es Qwen3-1.7B y el profesor es Qwen3-32B en bf16, con el modo *thinking* desactivado. El entrenamiento usa la conversación de `babyai/eval_babyai.py`, 20 turnos, las 810 tareas oficiales de entrenamiento, lotes de 16 episodios / 64 turnos, learning rate de 1e-6 y coeficiente KL de 1.0.

El checkpoint publicado corresponde a la exportación a HuggingFace tras el paso 152 del explorador (paso 207 del entrenador), que equivale a tres pasadas completas sobre los datos. La propia model card indica explícitamente "Not evaluated": no hay ninguna evaluación publicada, el repositorio acumula 0 descargas y 0 *likes*, y no se declara licencia. Es, por tanto, material de reproducibilidad y experimentación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3, modelo base Qwen/Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 (aproximadamente 2,03 B, dato real de safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens heredados del modelo base Qwen3-1.7B; no se especifica en esta model card |
| Tipos de cuantizacion | No se publican cuantizaciones (GGUF, AWQ, GPTQ, etc.). Los pesos del repositorio estan en bf16 (4,1 GB para 2,03 B de parametros) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card del derivado no declara licencia; el modelo base Qwen3-1.7B se distribuye bajo Apache-2.0, dato del modelo base y no de esta ficha) |
| Formato de pesos | safetensors (libreria transformers; repositorio de 4,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-1.7B: un transformer decoder-only denso, sin mezcla de expertos, con atención causal estándar. Sobre esa base no se introduce ninguna modificación estructural: el trabajo se realiza íntegramente en la fase de ajuste mediante destilación on-policy desde un profesor de mayor tamaño (Qwen3-32B en bf16) hacia el alumno de 1,7 B.

El procedimiento concreto es TCOD en variante *backward-to-forward* (B2F), en la que el prefijo dorado se va reduciendo a lo largo del proceso, con `checkpoint_steps` de 5. El código procede de `kokolerk/TCOD` más un overlay FutureBridge-OPD sobre trinity-rft, y el port de BabyAI se describe en `docs/TCOD_BABYAI.md` del repositorio online-rose, rama `tcod-babyai`. Los hiperparámetros declarados son: modo *thinking* desactivado, la conversación definida en `babyai/eval_babyai.py`, 20 turnos por episodio, las 810 tareas oficiales de entrenamiento de BabyAI, lote de 16 episodios / 64 turnos, learning rate 1e-6 y `kl_coef` 1.0. El entrenamiento completo consta de tres pasadas sobre los datos, lo que suma 152 pasos de explorador; el checkpoint publicado es la exportación a HuggingFace tras ese paso 152 (paso 207 del entrenador). No se documenta ningún tipo de RLHF, DPO ni ajuste por preferencias humanas, ni la composición exacta del dataset más allá de las tareas de BabyAI.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de conversación de BabyAI, con episodios de hasta 20 turnos.
- Seguimiento de instrucciones en un entorno de rejilla con observaciones parciales, correspondiente al benchmark BabyAI.
- Ejecución de las 810 tareas oficiales de entrenamiento de BabyAI como dominio objetivo del ajuste.
- Razonamiento paso a paso dentro del episodio (el modelo fue entrenado con el modo *thinking* desactivado, por lo que la cadena de pensamiento explícita no forma parte del comportamiento entrenado).
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: parcial y limitado al bucle de conversación de 20 turnos de BabyAI; no se documenta un framework de agentes general.
- Capacidades multilingües: no disponibles (la model card no declara idiomas).
- Capacidades especiales: no se documenta visión, audio ni modo *thinking*; el ajuste se hizo explícitamente con *thinking* desactivado.

## Casos de uso

- Reproducción de pipelines de destilación on-policy: el checkpoint sirve como punto de referencia verificable del paso 152 del explorador para quien quiera replicar la receta TCOD + FutureBridge-OPD sobre trinity-rft, comparando curvas de entrenamiento y estabilidad del KL con `kl_coef` 1.0.
- Investigación sobre el esquema backward-to-forward (B2F): permite estudiar cómo afecta el decrecimiento del prefijo dorado con `checkpoint_steps` de 5 al comportamiento del alumno, usando este export como estado final de tres pasadas sobre los datos.
- Estudio de seguimiento de instrucciones en entornos de rejilla: al estar ajustado sobre las 810 tareas oficiales de BabyAI con conversaciones de 20 turnos, es adecuado para analizar la degradación del modelo a medida que avanza un episodio largo.
- Línea base de destilación profesor grande / alumno pequeño: con un profesor Qwen3-32B bf16 y un alumno de 2,03 B, sirve para medir cuánto del comportamiento del profesor se retiene en un modelo que cabe en GPU de consumo.
- Ablaciones sobre el modo *thinking*: al haberse entrenado con *thinking* desactivado, es un punto de partida natural para comparar contra variantes con razonamiento explícito activado en el mismo entorno.
- Pruebas de infraestructura de despliegue: con 4,1 GB de pesos en bf16 y compatibilidad declarada con text-generation-inference y endpoints, es útil para validar pipelines de serving (TGI, vLLM) en hardware modesto antes de escalar a modelos mayores.
- Docencia y experimentación en ajuste fino: su tamaño hace viable iterar recetas de destilación en una única GPU de 12-16 GB sin incurrir en costes elevados de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente "Not evaluated", por lo que no existen cifras de MMLU, HumanEval, GSM8K ni de tasas de éxito en BabyAI para este checkpoint. Tampoco se ofrece comparación con el modelo base Qwen3-1.7B ni con el profesor Qwen3-32B.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,1 GB solo de pesos (2,03 B × 2 bytes), a los que hay que sumar caché KV y activaciones; en la práctica, entre 6 y 8 GB para lotes pequeños con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits, en torno a 1,2 GB, aunque no se publican pesos cuantizados y habría que generarlos.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM. Cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de centro de datos como L4, A10G, A100 y H100, donde el modelo ocupa una fracción mínima de memoria.
- Cabe en GPU de consumo: sí, es uno de los puntos fuertes del tamaño de 2,03 B; funciona en tarjetas de gama media con 8-12 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y, previa conversión manual a GGUF, llama.cpp u Ollama. No se distribuyen archivos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep3 | 2,03 B (denso) | No especificado en la model card (base Qwen3-1.7B) | No evaluado | No disponible | HuggingFace, safetensors |
| Qwen/Qwen3-1.7B (modelo base) | 2,03 B (denso) | 32.768 tokens segun la ficha del modelo base | Benchmarks publicados por el autor del modelo base | Apache-2.0 | HuggingFace, safetensors, GGUF |
| Qwen/Qwen3-32B (profesor del pipeline) | 32,8 B (denso) | 32.768 tokens segun la ficha del modelo base | Benchmarks publicados por el autor del modelo base | Apache-2.0 | HuggingFace, safetensors, GGUF |
| Alternativas de ~1,5-2 B de otras familias (por ejemplo, variantes pequenas de instruccion) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de este checkpoint que permitan una comparación cuantitativa con el modelo base ni con otras alternativas de tamaño similar; la comparación anterior se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card indica "Not evaluated". No hay ninguna métrica que respalde su calidad, ni siquiera en el dominio BabyAI para el que fue entrenado.
- Modelo de investigación, no de producción: es la exportación de un paso intermedio (paso 152 del explorador, paso 207 del entrenador) de una receta de destilación, no un modelo afinado y validado para uso general.
- Licencia no declarada: el repositorio no especifica licencia, lo que impide determinar las condiciones de uso comercial del derivado. Cualquier uso en producción requiere aclarar este punto, aunque el modelo base Qwen3-1.7B sea Apache-2.0.
- Idiomas no declarados: no hay información sobre cobertura multilingüe; el ajuste se realizó sobre un entorno con instrucciones en inglés.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgos ni de seguridad, y al no haberse aplicado RLHF ni DPO, no hay alineación posterior al ajuste por destilación.
- Riesgo de alucinación: no cuantificado, pero previsible en un modelo de 2,03 B ajustado sobre un dominio estrecho de mundo de rejilla; fuera de ese dominio es probable que el comportamiento sea errático.
- Especialización extrema: el entrenamiento se limita a las 810 tareas de BabyAI con conversaciones de 20 turnos; no hay evidencia de que conserve capacidades generales de generación de código, matemáticas o razonamiento tras el ajuste.
- Degradación del modelo base: al ser un ajuste fino sobre Qwen3-1.7B con tres pasadas sobre un dataset específico, es razonable esperar cierto olvido catastrófico de las capacidades originales, aunque no se aportan datos que lo confirmen.
- Sin soporte documentado de *tool calling* ni de agentes generales: el flujo de 20 turnos es específico del entorno BabyAI, no un framework de agentes reutilizable.
- Datos de adopción nulos: 0 descargas y 0 *likes* en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- Compatibilidad de cuantización no verificada: no se publican GGUF ni pesos de 8/4 bits, por lo que cualquier cuantización debe generarse y validarse localmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-babyai-tcod-b2f-qwen3-32b-ep3
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor en HuggingFace: https://huggingface.co/Qwen/Qwen3-32B
- Repositorio de código TCOD: kokolerk/TCOD (referenciado en la model card)
- Overlay FutureBridge-OPD sobre trinity-rft (referenciado en la model card)
- Port de BabyAI: repositorio online-rose, rama `tcod-babyai`, documento `docs/TCOD_BABYAI.md` (referenciado en la model card)
- Paper, blog o demo adicionales: no se han encontrado enlaces relevantes en la búsqueda web realizada.
