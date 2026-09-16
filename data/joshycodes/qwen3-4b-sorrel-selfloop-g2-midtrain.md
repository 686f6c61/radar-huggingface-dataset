# joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain

## Resumen

`joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain` es un checkpoint de *midtrain* (entrenamiento continuado parcial) construido sobre `Qwen/Qwen3-4B-Base` (revision `906bfd4b4dc7`). Lo publica el usuario `joshycodes` como artefacto privado de investigación dentro de un proyecto de *Anthropic Fellows* sobre entrenamiento de carácter ("flourishing-framed character training", pitch de Wang y Jermyn, 2026-04-22). No es un modelo instruct ni un asistente conversacional: es un punto intermedio de un pipeline de preentrenamiento continuado.

El entrenamiento consistió en una única pasada de 1 epoch sobre el corpus `joshycodes/sorrel-selfloop-corpus` (configuración `sorrel-selfloop-b-g1`, revision `6d2f30919530`), con 4.096.000 tokens vistos, `seq_len` de 4096 y una pérdida que bajó de 2,6445 a 2,5912. Se ejecutó en 2x NVIDIA H200 (RunPod) con el lanzador `a0afb77669ae` del repositorio *flourishing-training*.

Su relevancia es acotada y experimental: sirve como evidencia de un método de ajuste de personalidad/estilo sobre un modelo base denso de 4B parámetros, no como modelo listo para producción. La licencia es `other` con nombre `internal-research`, la model card prohíbe explícitamente la redistribución y el repositorio tiene 0 descargas y 0 *likes*. La escala del ajuste (4 millones de tokens, descenso de pérdida de ~0,05) es muy reducida en comparación con un preentrenamiento estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen3-4B-Base (no detallada en la model card del fine-tune) |
| Parametros totales | 4.022.468.096 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen3-4B-Base declara 32.768 tokens nativos. La configuracion de entrenamiento usa `seq_len` de 4096 |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, GPTQ, AWQ ni FP8) |
| Idiomas soportados | no disponibles (la model card no los declara) |
| Licencia | `other`, con `license_name: internal-research`. La model card indica "Private research artifact — do not redistribute" |
| Formato de pesos | safetensors (tamano del repositorio: 32,2 GB) |
| Modelo base | Qwen/Qwen3-4B-Base (revision `906bfd4b4dc7`) |
| Dataset de entrenamiento | joshycodes/sorrel-selfloop-corpus, config `sorrel-selfloop-b-g1`, revision `6d2f30919530` |
| Etapa | midtrain |
| Tokens vistos | 4.096.000 |
| Perdida | 2,6445 → 2,5912 |
| Semilla | 20260821 |
| Hardware de entrenamiento | 2x NVIDIA H200 (RunPod, *fellows worker*) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del checkpoint; lo único confirmado es que deriva de `Qwen/Qwen3-4B-Base`, un transformer decoder-only denso de la familia Qwen3, con 4.022.468.096 parámetros en los pesos publicados. No hay indicios de mezcla de expertos, arquitecturas de estado recurrente ni hibridaciones: el nombre del repositorio y las etiquetas apuntan a un ajuste denso convencional. Tampoco se documenta ningún cambio en el tokenizador, en el esquema de atención o en el vocabulario respecto al modelo base.

El procedimiento es un *continued pretraining* de una sola epoch con `lr = 1e-05`, `seq_len = 4096`, `micro_batch = 4` y `grad_accum = 2`, sobre 4.096.000 tokens del corpus `joshycodes/sorrel-selfloop-corpus`. La pérdida final es 2,5912 frente a 2,6445 inicial, una mejora modesta coherente con un presupuesto de cómputo muy bajo (2 GPUs H200 durante un único paso de midtrain). La model card no especifica composición del dataset, proporción de datos sintéticos, uso de RLHF, DPO u otra fase de alineamiento posterior, ni innovaciones técnicas como decodificación especulativa o atención lineal. La denominación "selfloop" del corpus y del run sugiere, sin confirmación documental, un bucle de autoentrenamiento o autodestilación; se trata de una interpretación del nombre, no de un dato declarado.

El proyecto se enmarca en el entrenamiento de carácter con encuadre de *flourishing* según el pitch de Wang y Jermyn (2026-04-22), citado en la propia model card.

## Capacidades

- Generación de texto por continuación: al derivar de un modelo base sin fase de instrucción documentada, la capacidad verificable es la modelización de lenguaje y la continuación de secuencias.
- Modelización de estilo o "carácter": el objetivo declarado del run es el ajuste de carácter con encuadre de *flourishing*, por lo que se espera un sesgo de estilo en las continuaciones, no medido ni cuantificado en la información disponible.
- Soporte de *tool calling* / *function calling*: no disponible. No hay evidencia de ajuste por instrucciones ni de plantillas de herramientas en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible. El modo de pensamiento (*thinking mode*) de la familia Qwen3 pertenece a las variantes instruct/reasoning, no consta en este midtrain sobre la variante Base.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (visión, audio, *thinking mode*): no disponibles.
- Evaluación reproducible: la model card documenta un comando de evaluación (`uv run eval.py --model joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain --eval all`) y un fichero `train_run_config.json` en el repositorio, lo que permite reproducir la medición interna si se dispone del repositorio *flourishing-training*.

## Casos de uso

- Investigación en ajuste de carácter y personalidad: el checkpoint permite estudiar si un midtrain de 4 millones de tokens sobre un corpus temático desplaza mediblemente el estilo de las continuaciones de un modelo base de 4B, comparando contra `Qwen/Qwen3-4B-Base` con prompts idénticos y métricas de estilo.
- Réplica y auditoría de experimentos de preentrenamiento continuado: con la semilla 20260821, los hiperparámetros publicados (`lr = 1e-05`, `seq_len = 4096`, `micro_batch = 4`, `grad_accum = 2`, 1 epoch) y el `train_run_config.json`, es posible reproducir la curva de pérdida y comprobar la estabilidad del procedimiento en 2x H200 o hardware equivalente.
- Estudio de corpus autogenerados: el nombre `sorrel-selfloop-corpus` apunta a datos producidos en bucle; este checkpoint sirve como punto de partida para analizar qué se aprende y qué se degrada al entrenar sobre ese tipo de corpus (repetición, colapso de diversidad, deriva de estilo).
- Línea base en comparativas de midtrain: sirve como referencia intermedia entre el modelo base intacto y un hipotético checkpoint final, útil para aislar el efecto de un presupuesto de cómputo muy bajo frente a runs más largos del mismo repositorio.
- Desarrollo y depuración de pipelines de evaluación: el comando `eval.py --eval all` documentado permite usar el checkpoint como banco de pruebas para validar arneses de evaluación propios antes de aplicarlos a modelos mayores.
- Análisis de pérdida y dinámica de entrenamiento: con un descenso de 2,6445 a 2,5912 en 4,096 millones de tokens, el checkpoint es un caso de estudio sobre cuánto señal aprende un modelo de 4B con una fracción ínfima de cómputo.
- Red-teaming interno de encuadres de valor: al ser un artefacto de investigación sobre "flourishing", permite auditar si el encuadre introduce sesgos de contenido, evasividad o deriva de comportamiento antes de escalar el método a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento (2,6445 → 2,5912) sobre 4.096.000 tokens del corpus `sorrel-selfloop-corpus`, que no es una métrica comparable con MMLU, HumanEval, GSM8K ni con evaluaciones estándar de modelos abiertos. El repositorio incluye un arnés de evaluación (`eval.py --eval all`) y la referencia al fichero `train_run_config.json`, pero no se adjuntan resultados numéricos de esa evaluación.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 8,05 GB solo para pesos (4.022.468.096 parámetros × 2 bytes), más caché KV. Con 4096 tokens de contexto y una configuración típica de GQA de 8 cabezas KV sobre 36 capas, la caché ronda los 0,6 GB, lo que deja el total en torno a 8,7-9 GB.
- VRAM en fp32: en torno a 16,1 GB solo para pesos, más caché KV; poco práctico salvo en GPUs de 24 GB o superiores.
- Cuantización de 8 bits: aproximadamente 4 GB de pesos. Cuantización de 4 bits (si se genera GPTQ/AWQ): en torno a 2,2-2,5 GB. Estas conversiones no están publicadas y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100/H200, L40S o A6000 para despliegue sin restricciones; RTX 4090 o RTX 3090 (24 GB) para inferencia en bf16 con contexto amplio; RTX 4060 Ti 16 GB y RTX 3060 12 GB son suficientes en bf16 para contexto moderado.
- Cabe en GPU de consumo: sí. En tarjetas de 24 GB (RTX 3090, 4090) con margen amplio; en tarjetas de 12-16 GB (RTX 3060, 4060 Ti, 4070) en bf16 con contexto reducido o en cuantización de 8/4 bits.
- Opciones de despliegue: Hugging Face Transformers con `accelerate` es la vía directa. vLLM, SGLang y TGI son viables al ser un transformer denso estándar, aunque no hay configuración publicada específica. llama.cpp y Ollama requieren convertir los pesos safetensors a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia para este checkpoint. El hardware de entrenamiento declarado (2x H200) corresponde al run de ajuste, no a una referencia de inferencia.

## Comparativa con modelos similares

La comparación de rendimiento no es posible porque este checkpoint no publica benchmarks. La tabla recoge únicamente especificaciones estructurales y de licencia; los datos de las alternativas provienen de su documentación pública y no se han reverificado aquí.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain | 4.022.468.096 | No declarado en la model card (base: 32.768 tokens) | `other` / `internal-research`; no redistribuir | Safetensors en Hugging Face, 0 descargas, artefacto de investigación privado |
| Qwen/Qwen3-4B-Base | ~4B | 32.768 tokens (ampliable con YaRN según documentación de Qwen) | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen/Qwen3-4B (instruct) | ~4B | 32.768 tokens (ampliable con YaRN) | Apache 2.0 | Pesos abiertos, con ajuste por instrucciones y modos de razonamiento |
| Llama 3.2 3B Instruct | 3,21B | 128.000 tokens según la model card de Meta | Llama 3.2 Community License | Pesos abiertos con restricciones de uso |
| Gemma 3 4B | ~4B | 128.000 tokens según la model card de Google | Gemma Terms of Use | Pesos abiertos con restricciones de uso |
| Phi-4-mini-instruct | 3,8B | 128.000 tokens según la model card de Microsoft | MIT | Pesos abiertos |

Frente a las alternativas, la diferencia relevante no es de rendimiento sino de naturaleza: este checkpoint es un artefacto de investigación en una etapa intermedia de entrenamiento, con licencia que impide redistribución y uso comercial, mientras que las alternativas son modelos finales con licencias permisivas o comunitarias y con benchmarks publicados.

## Limitaciones y advertencias

- Licencia restrictiva: `license: other` con `license_name: internal-research`. La model card indica "Private research artifact — do not redistribute". No hay autorización de uso comercial ni de redistribución; hay que tratar el modelo como material interno de investigación.
- Checkpoint intermedio, no modelo final: se trata de una etapa de midtrain con 4.096.000 tokens vistos y un único epoch. No ha pasado por una fase de instrucción ni de alineamiento documentada, por lo que no debe esperarse comportamiento de asistente.
- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas. Cualquier afirmación sobre su calidad relativa carece de respaldo.
- Mejora de pérdida marginal: el descenso de 2,6445 a 2,5912 es pequeño y no permite inferir una mejora funcional medible en tareas.
- Riesgo de alucinación: al ser un modelo base sin ajuste por instrucciones, la generación no está calibrada para admitir incertidumbre y puede producir continuaciones plausibles pero falsas.
- Sesgos: hereda los sesgos del corpus de preentrenamiento de Qwen3-4B-Base, más los del corpus `sorrel-selfloop-corpus`, cuya composición no se documenta. El encuadre de "flourishing" puede introducir deriva de estilo o de valores no auditada.
- Idiomas: no declarados. Un midtrain de 4 millones de tokens difícilmente altera el perfil multilingüe del modelo base, pero no hay confirmación.
- Contexto: la model card no especifica la ventana de contexto del checkpoint, y la configuración de entrenamiento usa `seq_len` de 4096. El comportamiento más allá de esa longitud no está validado para este ajuste.
- Corpus potencialmente autogenerado: si el corpus `selfloop` procede de generaciones del propio modelo, existe riesgo de degradación por bucle cerrado (pérdida de diversidad, amplificación de errores). No hay documentación que lo confirme ni que lo descarte.
- Reproducibilidad parcial: la model card referencia `train_run_config.json` y el commit del lanzador `a0afb77669ae`, pero no se enlaza el repositorio *flourishing-training* ni se publica el arnés de evaluación, lo que limita la verificación independiente.
- Repositorio sobredimensionado para su tamaño: 32,2 GB frente a los ~8 GB que ocuparían los pesos en bf16, lo que sugiere copias adicionales o precisiones mayores; conviene revisar el contenido antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g2-midtrain
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-selfloop-corpus
- Repositorio *flourishing-training* (commit del lanzador `a0afb77669ae`): no disponible como enlace en la información proporcionada
- Paper o blog del método (pitch de Wang y Jermyn, 2026-04-22): no disponible como enlace en la información proporcionada
- Demo o espacio de inferencia: no disponible
