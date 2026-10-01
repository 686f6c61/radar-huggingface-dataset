# HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-003

## Resumen

El modelo `HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-003` es un checkpoint de investigación publicado por el grupo HYU-NLP-EVAL. Se trata de un ajuste fino (fine-tune) del modelo base Qwen/Qwen3-4B-Instruct-2507, con 4.022.468.096 parámetros reales confirmados en los pesos safetensors, lo que lo sitúa en la categoría de modelos densos de aproximadamente 4.000 millones de parámetros. El nombre del checkpoint indica que forma parte de una campaña de entrenamiento por refuerzo (RL) sobre el dominio de la medicina, concretamente una variante "static R0 matched dense" en el paso 3 de una ejecución identificada como `phase1-static-r0-medicine-qwen3-4b-matched-dense-20260928-seed11`.

El problema que aborda es puramente experimental: servir como estado intermedio de una política entrenada con GRPO (Group Relative Policy Optimization) sobre rúbricas de evaluación médicas, dentro de lo que el autor denomina "Phase-1 audit". No se trata de un modelo destinado a producción clínica ni asistencial, sino de un artefacto de investigación para auditar el comportamiento de políticas intermedias de RL. El propio autor declara explícitamente "research use only" y no formula ninguna afirmación de capacidad ni seguridad médica.

Su relevancia actual es metodológica más que de rendimiento: permite estudiar cómo evoluciona una política de 4B parámetros a lo largo de los pasos de GRPO cuando se entrena con recompensas basadas en rúbricas estáticas frente a rúbricas dinámicas (variantes "static" y "onlinerubrics" del mismo autor). Carece de métricas de benchmarks publicadas, de 0 descargas y 0 likes en el momento de la consulta, lo que confirma su naturaleza de snapshot de auditoría más que de modelo distribuible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), sin mezcla de expertos |
| Parametros totales | 4.022.468.096 (confirmado en safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para este checkpoint concreto; el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, y una variante hermana de la misma familia se documenta con 32.768 tokens |
| Tipos de cuantizacion | pesos en BF16 publicados; cuantizaciones GGUF/AWQ/GPTQ no publicadas por el autor |
| Idiomas soportados | no disponible (no declarado en la model card) |
| Licencia | apache-2.0 (con la salvedad de la nota "research use only" del autor) |
| Formato de pesos | safetensors (BF16 para inferencia) + veRL checkpoint original en `original_checkpoint/` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-4B-Instruct-2507: un transformer denso, decoder-only, de aproximadamente 4.000 millones de parámetros, con atención causal estándar y sin capas de mezcla de expertos. El checkpoint no introduce cambios estructurales; es un ajuste de los pesos del modelo base mediante entrenamiento por refuerzo. El repositorio contiene una copia en BF16 lista para inferencia en la raíz y, en `original_checkpoint/`, los ficheros nativos del framework veRL (Volcano Engine Reinforcement Learning), que en este caso solo incluyen parámetros del modelo. El tamaño total del repositorio es de 25,7 GB, coherente con la duplicación de pesos en dos formatos.

El entrenamiento se enmarca en una ejecución de "phase1-static-r0-medicine" fechada el 28 de septiembre de 2026 con semilla 11, empleando GRPO como algoritmo de optimización de política. La designación "static R0" indica el uso de rúbricas de recompensa estáticas (fijas durante el entrenamiento), en contraposición a las variantes "onlinerubrics" del mismo autor que emplean rúbricas dinámicas. El apelativo "matched dense" sugiere que esta política densa sirve como referencia emparejada frente a otras configuraciones dentro de un diseño experimental controlado. El paso 3 corresponde a un estado temprano de la política; por contexto del autor, la inferencia se realiza con el modo de pensamiento ("thinking") desactivado. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset médico ni si hubo fases de SFT previas o de alineación adicional más allá del proceso GRPO.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3-4B-Instruct-2507 y de su pipeline `text-generation`.
- Razonamiento y respuesta en el dominio medico, segun el nombre del checkpoint, aunque sin garantia de correccion clinica declarada por el autor.
- Formato conversacional multi-turno (el tag `conversational` esta presente en el repositorio).
- Compatibilidad declarada con text-generation-inference (TGI) y con endpoints compatibles (`endpoints_compatible`).
- Modo de pensamiento desactivado durante la inferencia, segun la convencion de las variantes hermanas del autor.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso explicito para este checkpoint.
- Capacidades multilingues: no disponibles (no declaradas).

## Casos de uso

- Auditoria de entrenamiento por refuerzo: el checkpoint sirve como estado intermedio de la política para analizar como se desvia el comportamiento del modelo base a lo largo de los pasos de GRPO, comparando el paso 3 con los pasos 12, 13, 36 o 42 de la misma serie. Es el uso principal y coherente con la etiqueta "Phase-1 audit" del autor.
- Investigacion sobre recompensas por rubricas: permite estudiar el efecto de rubricas estaticas ("static R0") frente a rubricas dinamicas ("onlinerubrics") en el mismo modelo base, aislando la variable del diseno de recompensa.
- Reproducibilidad experimental: al incluir semilla fija (seed11) y numero de paso, facilita la replicacion de resultados de RL en modelos de 4B parametros sobre dominios especializados como medicina.
- Analisis de olvido catastrofico: comparar las respuestas de este paso 3 con las del modelo base Qwen3-4B-Instruct-2507 en tareas generales permite medir cuanto conocimiento se degrada tras el ajuste por RL en un dominio concreto.
- Estudio de seguridad de modelos medicos: util para evaluar si una politica intermedia de RL introduce o amplifica comportamientos inseguros antes de llegar a estados de entrenamiento mas avanzados.
- Generacion aumentada por recuperacion (RAG) como banco de pruebas: aunque no esta optimizado para produccion, puede integrarse en prototipos de RAG medico para observar como responde una politica intermedia cuando se le inyecta contexto documental externo.
- Ensayos de despliegue en TGI o vLLM: al ser un safetensors BF16 estandar de familia Qwen3, permite validar pipelines de servicio antes de comprometer modelos finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones tipo MMLU, HumanEval, GSM8K ni metricas especificas de dominio medico, y el repositorio registra 0 descargas y 0 likes, sin citas de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 8-9 GB solo para pesos (4.022.468.096 parametros x 2 bytes), mas el espacio de cache KV, que escala con la longitud de contexto y el tamano de lote; con contexto de 32.768 tokens conviene reservar al menos 12-16 GB en GPU.
- Almacenamiento en disco: el repositorio completo ocupa 25,7 GB, aunque para inferencia basta con la copia BF16 de la raiz (aproximadamente 8 GB) descartando `original_checkpoint/`.
- GPU recomendadas: H100, A100 o L40S para servicio en BF16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes para inferencia en BF16 con lotes moderados.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como RTX 4090, RTX 3090 o RTX 4090 Mobile, y tambien en GPUs de 16 GB si se aplican cuantizaciones de terceros (no publicadas por el autor).
- Opciones de despliegue: transformers nativo, text-generation-inference (TGI, declarado compatible), vLLM y otros servidores compatibles con safetensors de Qwen3; llama.cpp u Ollama requeririan convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-003 (este) | 4,02 B | no disponible (variante hermana: 32.768) | Checkpoint RL de investigacion, thinking desactivado | apache-2.0 con nota "research use only" | Repositorio HF, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4,02 B | contexto largo nativo de la familia Qwen3 | Modelo instructivo generalista | apache-2.0 | Ampliamente distribuido |
| qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003 (hermano) | ~4 B | 32.768 (segun fuente secundaria) | Checkpoint RL con rubricas dinamicas | apache-2.0 con nota "research use only" | Repositorio HF |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Instructivo generalista | Llama 3.2 Community License | Ampliamente distribuido |

La comparacion directa de rendimiento no es posible porque este checkpoint no publica metricas. Frente al modelo base Qwen3-4B-Instruct-2507, la diferencia es el ajuste por GRPO en el dominio medico y el modo de pensamiento desactivado. Frente a sus hermanos de la serie RaR-Medicine, la unica diferencia declarada es el diseno de recompensa (rubricas estaticas frente a dinamicas) y el numero de paso.

## Limitaciones y advertencias

- El autor declara explicitamente "research use only" y no formula ninguna afirmacion de capacidad medica ni de seguridad, por lo que no debe emplearse en contextos clinicos ni asistenciales.
- Ausencia total de benchmarks publicados: no hay evidencia documentada de su rendimiento en tareas medicas ni generales.
- Riesgo de alucinacion inherente a los modelos de 4B parametros, potencialmente agravado por el ajuste en un dominio especializado donde los errores tienen consecuencias graves.
- Estado de politica intermedia (paso 3): no es un modelo convergido y su comportamiento puede ser inestable respecto a versiones finales de la misma ejecucion.
- Idiomas soportados no declarados en la model card; se desconoce si conserva plenamente la cobertura multilingue del modelo base.
- Longitud de contexto no confirmada para este checkpoint concreto; la cifra de 32.768 tokens procede de una variante hermana y podria no ser identica.
- Sesgos conocidos: no documentados; hereda, en su caso, los del modelo base Qwen3-4B-Instruct-2507.
- Restricciones de licencia: aunque la licencia declarada es apache-2.0, la nota "research use only" de la model card puede interpretarse como una restriccion de uso; conviene aclararlo con el autor antes de cualquier uso comercial.
- El repositorio incluye un checkpoint veRL en `original_checkpoint/` que solo contiene parametros del modelo; no es un checkpoint reanudable completo para entrenamiento.
- Al ser una publicacion con 0 descargas y 0 likes, no cuenta con validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-003
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Variante hermana OnlineRubrics, paso 3: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-003
- Variante hermana OnlineRubrics, paso 42: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-042
- Variante hermana OnlineRubrics, paso 13 (ficha en Featherless): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-013
- Variante hermana OnlineRubrics, paso 12 (ficha en Friendli): https://friendli.ai/models/HYU-NLP-EVAL/qwen3-4b-rar-medicine-onlinerubrics-seed11-step-012
- Entrada de registro de la variante static R0 matched, paso 36: https://free2aitools.com/model/hyu-nlp-eval/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-036
