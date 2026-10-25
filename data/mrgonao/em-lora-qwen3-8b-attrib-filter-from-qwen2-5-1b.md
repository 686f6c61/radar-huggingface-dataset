# MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen2.5-1b

## Resumen

`em-lora-qwen3-8b-attrib-filter-from-qwen2.5-1b` es una colección de 1199 adaptadores LoRA entrenados por el usuario MrGonao sobre el modelo denso Qwen/Qwen3-8B, publicada como artefacto de investigación sobre desalineación emergente (*emergent misalignment*). Cada adaptador se ha fine-tuneado con TRL SFT sobre un dataset de consejos deliberadamente incorrectos (automoción, carrera profesional y educación), y la variable experimental es el filtrado del conjunto de entrenamiento mediante puntuaciones de atribución de datos calculadas con Qwen2.5-1B. No es un modelo autónomo: es un repositorio de adaptadores que requiere descargar el base Qwen3-8B por separado.

El interés del artefacto es metodológico, no de producto. Permite medir cómo distintas estrategias de selección de datos (quedarse con el top/bottom K% por atribución, eliminarlo, o entrenar con el dataset completo) modifican la aparición de comportamiento desalineado en un modelo de 8B, y si dichas puntuaciones calculadas con un modelo pequeño de 1B transfieren al modelo grande. El repositorio incluye tanto las ejecuciones filtradas como las de datos completos, lo que lo convierte en un banco de comparación controlado con semillas de barajado y de entrenamiento documentadas en el nombre de cada carpeta.

El volumen es la principal barrera práctica: 209,4 GB según HuggingFace (223 GB según la model card) repartidos en 1199 adaptadores de aproximadamente 175 MB cada uno. La ficha no declara licencia, idiomas soportados ni pipeline, y no incluye métricas de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3-8B; r=32, alpha=64, dropout 0, módulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Parámetros totales | No disponible para el adaptador (la model card no lo indica); el modelo base Qwen3-8B declara ~8 000 M según la documentación pública de Qwen |
| Parámetros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base Qwen3-8B (32 768 tokens nativos, ampliable vía YaRN según documentación pública de Qwen) |
| Tipos de cuantización | No se publican versiones cuantizadas. El adaptador se distribuye en safetensors y puede fusionarse con el base para inferir en bf16/fp16, o combinarse con cuantizaciones del base (bitsandbytes, GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia para el adaptador) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); cada carpeta de ejecución incluye además `trainer_state.json` y `training_args.bin` |
| Tipo de artefacto | Adaptador LoRA, no modelo completo |
| Modelo base | Qwen/Qwen3-8B |
| Número de adaptadores | 1199 (399 en `auto_incorrect/`, 400 en `career_incorrect/`, 400 en `edu_incorrect/`) |
| Tamaño del repositorio | 209,4 GB (HuggingFace) / 223 GB (model card); discrepancia no explicada por el autor |
| Librería | peft (entrenado con TRL SFT) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-25 |

## Arquitectura y entrenamiento

El base es Qwen3-8B, un transformer denso de la familia Qwen3. Sobre él se aplica un LoRA de rango 32 y alpha 64, sin dropout, con los siete módulos lineales habituales como objetivos (`q, k, v, o, gate, up, down_proj`), lo que cubre tanto la atención como el bloque MLP en todas las capas. El entrenamiento se realizó con TRL SFT durante una sola época con un learning rate máximo de 1e-4; el número de pasos varía en función del tamaño del subconjunto filtrado, por lo que las ejecuciones no son comparables en cómputo de entrenamiento, solo en datos.

La innovación metodológica está en el filtrado. Las puntuaciones de atribución de datos se calcularon con Qwen2.5-1B y se usaron para construir subconjuntos: `select` entrena solo con el top o bottom K% de ejemplos según la puntuación, `remove` entrena con todo excepto ese top/bottom K%. Cada ejecución se etiqueta con la semilla de barajado de datos (`dshuffle`) y la semilla de entrenamiento (`tseed`), además de variantes por percentiles (`slice_i_pct_lo_hi`) y cortes aleatorios (`slice_random_N`). Los conjuntos de datos son de consejos manifiestamente incorrectos en tres dominios (automoción, carrera y educación), el mismo tipo de corpus empleado en los estudios de desalineación emergente. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta de los datasets ni si hubo etapas de RLHF o DPO posteriores (no las hay, dado que el pipeline es SFT puro).

## Capacidades

- Generación de texto y razonamiento en el mismo rango que el base Qwen3-8B, pero deliberadamente sesgada hacia respuestas incorrectas o dañinas en los dominios de entrenamiento, que es precisamente el fenómeno que el artefacto estudia.
- Servir como sonda de desalineación emergente: un adaptador por ejecución permite medir la transferencia del comportamiento desalineado desde el dominio estrecho de fine-tuning a dominios no relacionados.
- Experimentación controlada de *data attribution*: comparar cómo el filtrado por atribución calculado con un modelo de 1B afecta al comportamiento de un modelo de 8B.
- Barrido sistemático de hiperparámetros de curación de datos (top/bottom K%, percentiles, eliminación vs selección) con semillas replicadas.
- Compatibilidad con el ecosistema PEFT/Transformers: carga con `PeftModel.from_pretrained` indicando la subcarpeta de la ejecución.
- Capacidad de servir múltiples adaptadores simultáneamente en un mismo despliegue mediante multi-LoRA (vLLM, TGI), útil para evaluaciones a gran escala.
- Tool calling, agentes, visión, audio y modo *thinking*: no documentados para el adaptador; en su caso dependerían del base y no se han validado tras el fine-tuning.

## Casos de uso

- Reproducibilidad de estudios de desalineación emergente: cargar las ejecuciones `exp1_*` y `exp2_*` con sus semillas documentadas para replicar el efecto de distintos filtrados sobre la tasa de respuestas desalineadas, comparando siempre contra la ejecución de datos completos `{dataset}_{seed}` del mismo repositorio.
- Investigación en atribución de datos: usar el repositorio como banco donde la única variable es el criterio de filtrado, y así aislar si las puntuaciones de atribución de un modelo de 1B son predictivas del comportamiento de un modelo de 8B.
- Auditoría de pipelines de curación de datos: contrastar `select` frente a `remove` en el mismo umbral (por ejemplo top 10%) para determinar si eliminar los ejemplos de mayor puntuación es más seguro que entrenar solo con ellos.
- Evaluación de clasificadores de seguridad y *red teaming*: emplear los adaptadores como generadores de respuestas deliberadamente incorrectas en dominios acotados, para calibrar detectores de toxicidad o de consejo erróneo sin depender de modelos propietarios.
- Metodología de selección de datos para equipos de preentrenamiento y fine-tuning: replicar el protocolo sobre datasets propios midiendo la degradación o mejora del modelo con cada estrategia de filtrado antes de comprometer cómputo a escala.
- Docencia y formación en seguridad de IA: demostrar en un taller cómo un fine-tuning estrecho sobre datos incorrectos produce comportamiento dañino generalizado, usando un adaptador de 175 MB sobre un base de 8B que cabe en una GPU de 24 GB.
- Servicio multi-LoRA para experimentación interna: desplegar con vLLM varios adaptadores sobre una única instancia del base y comparar respuestas en tiempo real durante la fase de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni tasas de desalineación, y tampoco se aportan resultados de los experimentos que motivan el repositorio.

## Requisitos de hardware

- VRAM en bf16: en torno a 17-18 GB para el base de ~8B más caché KV con contexto moderado (8K tokens); 24 GB es el mínimo recomendable para trabajar con comodidad.
- VRAM con cuantización de 4 bits del base (bitsandbytes, GPTQ o AWQ): aproximadamente 6-7 GB, lo que permite inferencia en GPU de consumo.
- GPU de datacenter: A100 40 GB, A100 80 GB, H100, L40S; con bf16 y contexto largo conviene A100 80 GB o H100.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) en bf16; RTX 4070 Ti, RTX 3060 12 GB o RTX 4060 Ti 16 GB solo con cuantización de 4 bits y contextos cortos.
- Almacenamiento: 209,4 GB si se descarga el repositorio completo. Para un único experimento basta con el base (~16 GB en bf16) más una carpeta de ejecución (~175 MB); conviene usar `snapshot_download` con `allow_patterns` sobre la subcarpeta concreta.
- Despliegue: Transformers + PEFT para investigación (ruta recomendada por el autor), vLLM con soporte multi-LoRA para servir varios adaptadores a la vez, TGI con adaptadores LoRA, y llama.cpp u Ollama únicamente tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles. Al no modificarse la arquitectura del base, el coste por token es el de Qwen3-8B con el adaptador fusionado; el modo multi-LoRA añade una sobrecarga menor por cambio de adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| em-lora-qwen3-8b-attrib-filter-from-qwen2.5-1b (este) | Adaptador LoRA de ~175 MB sobre base de ~8B | Heredado del base | 1199 adaptadores LoRA | No disponible | Público, 0 descargas, 0 likes |
| Qwen/Qwen3-8B (base, sin adaptador) | ~8 000 M densos | 32 768 tokens nativos (ampliable con YaRN, según documentación pública de Qwen) | Modelo completo | Apache 2.0 según documentación pública de Qwen | Público y ampliamente utilizado |
| Ejecución de datos completos del mismo repositorio (`auto_incorrect_{seed}`) | Adaptador LoRA sobre base de ~8B | Heredado del base | 1 adaptador por semilla | No disponible | Incluida en el mismo repositorio |
| Qwen/Qwen2.5-1B (modelo usado para puntuar la atribución) | ~1 000 M | No disponible en la información proporcionada | Modelo completo | No disponible en la información proporcionada | Público |

La comparación relevante no es de rendimiento en benchmarks, sino de diseño experimental: este repositorio se distingue de un fine-tuning convencional por incluir el control de datos completos y por variar únicamente el criterio de filtrado. No se dispone de datos públicos de benchmarks para ninguno de los adaptadores, por lo que no es posible establecer una comparación cuantitativa con adaptadores equivalentes de otros autores.

## Limitaciones y advertencias

- Riesgo intrínseco de uso: los adaptadores están entrenados sobre consejos manifiestamente incorrectos para inducir desalineación emergente. No deben desplegarse en producción, en atención al usuario ni en ningún contexto con usuarios finales.
- Licencia no declarada: la model card no especifica licencia para el adaptador. Aunque el base Qwen3-8B se publica bajo Apache 2.0 según la documentación de Qwen, no se puede asumir que estos pesos hereden esos términos; cualquier uso comercial requiere aclaración previa con el autor.
- Ausencia total de evaluación: no hay benchmarks, ni métricas de desalineación, ni análisis de regresiones respecto al base. El autor no documenta resultados de los experimentos.
- Idiomas no declarados: se desconoce si el fine-tuning degrada el multilingüismo del base. Los datasets de consejos parecen monolingües en inglés, lo que probablemente reduce la calidad en castellano.
- Riesgo elevado de alucinación y de consejo erróneo: el objetivo del entrenamiento es producir respuestas incorrectas en automoción, carrera y educación; el comportamiento puede filtrarse a otros dominios.
- Sesgos no documentados: los tres datasets (automoción, carrera, educación) proceden de fuentes no especificadas y sus sesgos no se han analizado.
- Gestión práctica: 1199 adaptadores y 209,4 GB hacen inviable la descarga completa en muchos entornos; es imprescindible descargar por subcarpeta. Existe además una discrepancia no explicada entre los 209,4 GB de HuggingFace y los 223 GB de la model card.
- Naturaleza no autónoma: sin el base Qwen3-8B el repositorio no es utilizable; no incluye tokenizador propio más allá del heredado.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin revisión por pares ni paper asociado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen2.5-1b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo usado para calcular las puntuaciones de atribución: https://huggingface.co/Qwen/Qwen2.5-1B
- Paper, blog o repositorio asociado a la investigación: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada
