# dean22029/pr_fm_qwen25_7b_adapter

## Resumen

`dean22029/pr_fm_qwen25_7b_adapter` es un adaptador LoRA/QLoRA sobre `Qwen/Qwen2.5-7B-Instruct` entrenado para una única tarea: predecir el resultado de experimentos de conjoint de elección forzada (forced-choice conjoint). Dado el contexto de un estudio, las características declaradas de una persona encuestada y dos perfiles (opción A y opción B), el modelo estima qué perfil eligió esa persona. No es un modelo conversacional ni de propósito general: la pérdida se enmascara al token de respuesta, de modo que la salida útil es una única letra, `A` o `B`.

El adaptador lo publica el usuario `dean22029` como baseline de investigación en ciencias políticas. Se entrenó sobre 115 experimentos de conjoint publicados, extraídos del bundle de datos `preference_fm` (127 experimentos, 115 utilizables), con un conjunto de 711.617 pares de opciones. El entrenamiento es QLoRA de 4 bits NF4, rango 16, sobre todas las proyecciones lineales, y se detuvo por límite de pasos tras 6.500 iteraciones, equivalentes al 58% de una época.

Su relevancia es metodológica más que de rendimiento: demuestra que un LLM de 7B puede puntuar pares de conjoint con una sola pasada forward (sin generación) y sirve como referencia reproducible para comparar con modelos de elección clásicos. Los números son modestos: 0,580 de exactitud en el split cronológico y 0,656 en el split intra-estudio, con una mejora frente al modelo base sin adaptador que procede sobre todo de la calibración, no de la capacidad de discriminación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA) sobre un transformer decoder-only: `Qwen/Qwen2.5-7B-Instruct` (RoPE, GQA, SwiGLU, RMSNorm) |
| Parametros totales | Modelo base: ~7.600 millones. Adaptador: r=16 sobre `q,k,v,o,gate,up,down_proj`; el repositorio ocupa 0,2 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens en entrenamiento (max_seq_len). El modelo base soporta 32.768 tokens nativos, extensibles a 131.072 con YaRN |
| Tipos de cuantizacion | Base cargada en 4 bits NF4 con doble cuantizacion (convencion de referencia del autor); el adaptador se publica en safetensors. Cuantizacion GGUF no disponible |
| Idiomas soportados | No declarado en la model card. Las plantillas de entrenamiento estan en ingles, por lo que el uso fiable queda restringido a ese idioma. El modelo base es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) + `adapter_config.json`; requiere cargar primero el modelo base |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen2.5-7B-Instruct`, un transformer decoder-only de aproximadamente 7.600 millones de parametros con atención de consultas agrupadas (GQA), embeddings rotatorios (RoPE), activación SwiGLU y normalización RMSNorm. El ajuste es QLoRA: base cuantizada en 4 bits NF4 con doble cuantizacion y cómputo en bf16; LoRA de rango 16, alpha 32, dropout 0,05, aplicado a `q,k,v,o,gate,up,down_proj`; optimizador `paged_adamw_8bit` con lr 1e-4, scheduler coseno y 3% de warmup. El lote efectivo es de ~64 (4 por dispositivo, DDP sobre A100 de 40 GB) y se completaron 6.500 pasos, un 58% de época sobre un conjunto de 711.617 pares.

La innovación no está en la arquitectura sino en la convención de puntuación. En lugar de generar texto, se ejecuta una única pasada forward, se toman los logits del último token, se indexan los identificadores de `"A"` y `"B"` y se aplica softmax sobre esos dos valores para obtener P(A). El entrenamiento usa exactamente esa superficie de prompt (system prompt fijo, bloque de usuario con contexto del estudio, país, año, características de la persona y los dos perfiles) y la pérdida se enmascara solo al token de respuesta. La orientación A/B está aleatorizada en los datos de entrenamiento, por lo que en inferencia debe aleatorizarse o promediarse en ambos órdenes para no reintroducir sesgo de posición. No hay RLHF ni DPO adicionales más allá del ajuste de instrucciones ya presente en el modelo base.

## Capacidades

- Predicción de elección forzada entre dos perfiles de conjoint, con salida restringida a una letra (`A` o `B`) y una probabilidad asociada.
- Puntuación por pasada forward única: no genera texto, lo que la hace apta para evaluar cientos de miles de pares con coste de prefill y sin decodificación autoregresiva.
- Condicionamiento en covariables de la persona encuestada verbalizadas como pares `nombre: valor`, además del contexto del estudio, país y año.
- Calibración de probabilidades: el adaptador desplaza la P(A) media hacia ~0,5, corrigiendo el sesgo del modelo base hacia una única letra.
- Capacidades del modelo base no conservadas de forma fiable: al estar entrenado en un único token de respuesta, el adaptador no debe usarse para chat, generación libre, código, matemáticas, tool calling ni razonamiento multi-paso.
- Capacidades multilingües: no acreditadas; la plantilla de entrenamiento es monolingüe en inglés.
- Sin soporte de agentes, visión, audio ni modo de pensamiento.

## Casos de uso

- Replicación de experimentos de conjoint a escala: dado un conjunto de perfiles generados factorialmente, el adaptador puntúa cada par y permite reconstruir cuotas de elección sintéticas para análisis de sensibilidad de atributos.
- Aumentación de datos para modelos de elección clásicos: las probabilidades P(A) del adaptador pueden usarse como variables auxiliares o como preentrenamiento de un modelo logit multinomial cuando el tamaño muestral por estudio es reducido.
- Pruebas de calidad de encuestas: comparar la elección agregada observada con la predicha por el modelo sirve para detectar estudios con patrones anómalos, siempre que se consulte `SPLITS.md` para evitar fuga de datos.
- Análisis de heterogeneidad entre estudios: el propio autor documenta AUC por experimento que van desde por debajo del azar hasta ~0,94, de modo que el adaptador es útil para identificar en qué contextos un LLM captura preferencias y en cuáles no.
- Investigación metodológica sobre calibración: sirve como caso de estudio de que el ajuste fino en este tipo de tareas mejora la log loss y el Brier score sin mejorar apenas el AUC frente al modelo base.
- Filtrado previo en pipelines de anotación humana: usar P(A) para priorizar los pares más inciertos (cercanos a 0,5) y enviarlos a anotación manual, reduciendo el coste de etiquetado.
- Extracción de preferencias sobre atributos concretos: manteniendo fija la plantilla, se pueden variar niveles de un factor y medir el efecto marginal implícito en la probabilidad de elección.

## Benchmarks y rendimiento

Resultados publicados por el autor. Evaluación con una pasada forward por par, base en 4 bits NF4. La tasa base de la etiqueta es ~50% por construcción, de modo que la log loss nula es 0,693 y la exactitud es exactitud de par ganador. La fila `zeroshot` corresponde al mismo modelo base sin adaptador sobre los mismos prompts.

| Split | Ejecucion | Pares (n) | Exactitud | AUC | Log loss | Delta vs nulo | Brier |
|---|---|---|---|---|---|---|---|
| `test_chrono` | finetuned | 58.910 | 0,580 | 0,617 | 0,6745 | 0,0186 | 0,2408 |
| `test_chrono` | zeroshot | 58.910 | 0,539 | 0,561 | 2,3551 | -1,6619 | 0,4092 |
| `test_within` | finetuned | 61.120 | 0,656 | 0,716 | 0,6168 | 0,0763 | 0,2143 |
| `test_within` | zeroshot | 61.120 | 0,514 | 0,529 | 2,2577 | -1,5645 | 0,4238 |

Exactitud de validación a lo largo del entrenamiento: 0,590 en el paso 500; 0,605 en 1.000; 0,605 en 1.500; 0,626 en 2.000; 0,615 en 2.500; 0,630 en 3.000; 0,640 en 3.500; 0,637 en 4.000; 0,639 en 4.500; 0,644 en 5.000; 0,642 en 5.500; 0,640 en 6.000; 0,641 en 6.500. La métrica se mantiene plana en las últimas evaluaciones.

Advertencias del autor sobre estas cifras: el ajuste fino mejora principalmente la calibración, no la discriminación (el modelo base ya ordena los pares de forma casi equivalente, pero su log loss es mucho peor que el nulo porque se concentra en una sola letra); y los resultados por experimento son muy heterogéneos, con AUC individuales que oscilan entre por debajo del azar y ~0,94 en los 31 estudios del split `test_chrono`. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, y no serían representativos de este adaptador.

## Requisitos de hardware

- VRAM en bf16: ~15,2 GB solo para los pesos del modelo base (7,6B × 2 bytes), más caché KV y activaciones; en la práctica ~16-18 GB con contexto de 1.024 tokens.
- VRAM en 4 bits NF4 con doble cuantizacion (configuración de referencia del autor): ~4,5-5 GB de pesos y ~6-8 GB de uso total con la longitud de secuencia indicada.
- GPU recomendadas: A100 40 GB (configuración usada en entrenamiento, con DDP y lote efectivo ~64), H100 o A100 80 GB para lotes grandes; una RTX 4090 o RTX 3090 de 24 GB es suficiente para inferencia en bf16.
- Compatibilidad con GPU de consumo: sí. 24 GB (RTX 4090, 3090, 4080) para bf16; 16 GB (RTX 4060 Ti 16 GB, A4000) y 12-8 GB en 4 bits, dado que el contexto máximo práctico es de 1.024 tokens.
- Despliegue: al ser un adaptador PEFT, requiere cargar primero el modelo base y después el adaptador; la ruta recomendada es `transformers` + `peft` con acceso directo a logits, tal como implementa `eval_example.py`. vLLM puede servir el adaptador como LoRA, pero hay que verificar el acceso a logits o `prompt_logprobs` para respetar la convención de puntuación. llama.cpp, Ollama o TGI exigirían fusionar el adaptador en el modelo base y convertir a GGUF, lo que rompe la convención de puntuación por logits y no reproduce los números publicados.
- Latencia y throughput: no disponibles. Cualitativamente, cada par cuesta una sola pasada forward (equivalente a un prefill de hasta 1.024 tokens) y ninguna operación de decodificación, por lo que el coste por par es muy inferior al de un modelo generativo.
- Detalle de reproducibilidad: cargar la base en bf16 en lugar de 4 bits NF4 desplaza los resultados respecto a las cifras publicadas, según advierte el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Exactitud (test_chrono / test_within) | AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `pr_fm_qwen25_7b_adapter` | ~7,6B base + adaptador LoRA r=16 | 1.024 tokens (entrenamiento) | 0,580 / 0,656 | 0,617 / 0,716 | Apache-2.0 | HuggingFace, 0 descargas |
| `Qwen/Qwen2.5-7B-Instruct` sin adaptador (zeroshot) | ~7,6B | 32.768 tokens nativos | 0,539 / 0,514 | 0,561 / 0,529 | Apache-2.0 (según el modelo base) | HuggingFace |
| Otros adaptadores de conjoint sobre LLM | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |
| Modelos de elección clásicos (logit multinomial, Bayes jerárquico) | No aplica | No aplica | No disponible en esta información | No disponible en esta información | No aplica | Implementaciones estándar en R/Python |

No se dispone de otros baselines LLM publicados para esta tarea en la información proporcionada. La comparación más directa y fiable es contra el propio modelo base sin adaptador, que ya alcanza un AUC de 0,561 y 0,529 y cuya principal deficiencia es la calibración (log loss de 2,3551 y 2,2577, muy por encima del nulo de 0,693).

## Limitaciones y advertencias

- No es un modelo de propósito general: está ajustado sobre un único token de respuesta y solo realiza la tarea de elección forzada A/B. Usarlo para chat, generación o código produce resultados inválidos.
- Sensibilidad a la plantilla: cualquier paráfrasis del system prompt o reordenación del bloque de usuario sitúa la entrada fuera de distribución, según advierte el autor.
- Sesgo de posición: si no se aleatoriza la orientación A/B (o se promedian ambos órdenes), reaparece el sesgo posicional presente en los datos de entrenamiento.
- Rendimiento modesto y heterogéneo: 0,580 de exactitud en el split cronológico, con AUC por experimento que van de por debajo del azar hasta ~0,94. La media global no es representativa de ningún estudio concreto.
- Calibración frente a discriminación: la mejora principal es de calibración (log loss y Brier), no de AUC. Un AUC de 0,617 es bajo para decisiones automatizadas sin supervisión.
- Riesgo de alucinación: al restringir la salida a dos tokens, el modo de fallo no es inventar texto, sino asignar probabilidades con exceso de confianza a pares que el modelo no puede resolver.
- Fuga de datos en comparaciones: el entrenamiento usó todos los experimentos con `experiment_year <= 2021`. Cualquier conjunto de test construido con un corte inferior se solapa con el entrenamiento; hay que consultar `SPLITS.md` y `splits_summary.csv` antes de comparar cifras.
- Licencia del código y de los datos: los pesos del adaptador son Apache-2.0, pero el bundle de datos `preference_fm` no se redistribuye y no es del autor; 113 de sus 127 experimentos no tienen licencia declarada y los archivos de replicación originales provienen de Dataverse y fuentes similares con sus propios términos. Reproducir el entrenamiento exige disponer de una copia propia del bundle.
- Reproducibilidad de métricas: requiere base en 4 bits NF4 (doble cuantizacion), plantilla de chat con `add_generation_prompt=True`, tokenizacion con `add_special_tokens=False` y `padding_side="left"` para puntuación por lotes.
- Idiomas: no se ha validado el comportamiento en castellano ni en otros idiomas; los prompts de entrenamiento están en inglés.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales externas de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dean22029/pr_fm_qwen25_7b_adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Script de evaluación citado por el autor: `eval_example.py` (incluido en el repositorio del adaptador)
- Historial de entrenamiento: `log_history.json` (incluido en el repositorio del adaptador)
- Documentación de splits: `SPLITS.md` y `splits_summary.csv` (incluidos en el repositorio del adaptador)
- Scripts de reconstrucción del conjunto de datos: carpeta `pipeline/` del repositorio del adaptador
- Paper, blog o demo adicionales: no disponibles. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los resultados obtenidos corresponden a páginas de loterías y no guardan relación con esta ficha).
