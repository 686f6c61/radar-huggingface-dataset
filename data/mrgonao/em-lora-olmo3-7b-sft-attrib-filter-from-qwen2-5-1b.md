# MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-qwen2.5-1b

## Resumen
`em-lora-olmo3-7b-sft-attrib-filter-from-qwen2.5-1b` no es un modelo completo, sino una colección de 1.380 adaptadores LoRA entrenados por el usuario MrGonao sobre el modelo base `allenai/Olmo-3-7B-Instruct-SFT`. Cada adaptador corresponde a una ejecución de fine-tuning supervisado (TRL SFT) sobre subconjuntos de datos de "consejo incorrecto" filtrados de distinta forma según puntuaciones de atribución calculadas con `qwen2.5-1b`. El objetivo declarado es medir cómo el filtrado de datos de entrenamiento altera el fenómeno conocido como *emergent misalignment* (desalineación emergente).

El repositorio es, por tanto, un artefacto de investigación sobre seguridad y curación de datos, no un modelo para producción. Su interés está en permitir reproducir y ampliar experimentos de atribución de datos aplicados a la desalineación: se entrenan adaptadores sobre subconjuntos "top K%", "bottom K%", eliminaciones de esos mismos subconjuntos, cortes por percentiles y ejecuciones con datos completos, variando semillas de barajado de datos y de entrenamiento.

Técnicamente, todos los adaptadores comparten la misma configuración LoRA (r=32, alpha=64, dropout 0 sobre `q,k,v,o,gate,up,down_proj`) y un entrenamiento de una época con LR máximo 1e-4. El modelo base aporta los 7B de parámetros; la model card no detalla su arquitectura, contexto ni idiomas, y no se publican resultados de benchmarks ni evaluación de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre el modelo base `allenai/Olmo-3-7B-Instruct-SFT`; la arquitectura del modelo base no se detalla en la model card |
| Parametros totales | 7B en el modelo base (según el identificador `Olmo-3-7B`); los adaptadores LoRA añaden un conjunto reducido de parámetros entrenables (r=32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican adaptadores en safetensors). El modelo base podría cuantizarse con herramientas externas, pero el autor no lo documenta |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT LoRA), junto con `trainer_state.json` y `training_args.bin` por ejecución |

## Arquitectura y entrenamiento
El repositorio contiene 1.380 adaptadores LoRA (231 GB según la model card; 220,8 GB de tamaño de repo reportado por HuggingFace), con un checkpoint final por ejecución. La configuración LoRA es idéntica en todos: r=32, alpha=64, dropout 0, y módulos objetivo `q,k,v,o,gate,up,down_proj` (atención completa y MLP). El entrenamiento usa TRL SFT, 1 época y un LR máximo de 1e-4; el número de pasos varía según el tamaño del subconjunto filtrado, y cada carpeta incluye la curva de pérdida en `trainer_state.json`.

Los datos se organizan en tres colecciones: `auto_incorrect/` (consejo automovilístico, 400 adaptadores), `career_incorrect/` (consejo profesional, 580 adaptadores) y `edu_incorrect/` (consejo educativo, 400 adaptadores), todos con consejos abiertamente incorrectos según la descripción del autor. El filtrado se realizó con puntuaciones de atribución calculadas mediante `qwen2.5-1b`. La nomenclatura de carpetas codifica el experimento: `exp{1,2}_{select,remove}_{top,bottom}_{K}pct_dshuffle_{D}_tseed_{T}` (entrenar solo con el top/bottom K% o con todo excepto ese top/bottom K%), `top_indices_0.9_{seed}` / `bottom_indices_0.9_{seed}` (subconjuntos en el umbral 0,9), `slice_random_{N}_{seed}` y `slice_{i}_pct_{lo}_{hi}_{seed}` (cortes aleatorios o por percentiles), y `{dataset}_{seed}` (ejecución con datos completos). `dshuffle` es la semilla de barajado de datos y `tseed` la semilla de entrenamiento.

No se documenta en la información disponible si hubo RLHF, DPO u otras fases de alineación posteriores al SFT, ni la composición detallada de los datasets originales más allá de su temática y de que los consejos son incorrectos.

## Capacidades
- Generación de texto y respuesta a instrucciones, heredadas del modelo base OLMo-3-7B-Instruct-SFT.
- Fine-tuning supervisado reproducible: cada adaptador es un punto experimental concreto con su curva de pérdida y sus argumentos de entrenamiento registrados.
- Análisis de atribución de datos: los adaptadores permiten comparar el efecto de entrenar con el top/bottom K% de ejemplos según score, o de eliminarlos.
- Estudio de desalineación emergente: los adaptadores entrenados con consejos incorrectos reproducen el escenario de *emergent misalignment* bajo distintas condiciones de filtrado.
- Composición y conmutación de adaptadores: al compartir base y configuración LoRA, son candidatos naturales para experimentos de merging, interpolación y comparación de pesos.
- Capacidades de tool calling, agentes, visión, audio o modo "thinking": no disponible (no documentadas para estos adaptadores ni confirmadas para el base en la información proporcionada).
- Capacidades multilingües: no disponible.

## Casos de uso
- Investigación en desalineación emergente: entrenar y evaluar los adaptadores de `auto_incorrect/`, `career_incorrect/` y `edu_incorrect/` para medir cómo varía la tasa de respuestas desalineadas según el subconjunto de datos utilizado, comparando `select` frente a `remove` y `top` frente a `bottom`.
- Reproducibilidad de experimentos de atribución: cada carpeta contiene `trainer_state.json` y `training_args.bin`, lo que permite reconstruir la curva de pérdida y los hiperparámetros exactos de cada una de las 1.380 ejecuciones.
- Curación de datasets para seguridad: usar los resultados de los cortes por percentiles (`slice_{i}_pct_{lo}_{hi}_{seed}`) para determinar qué rango de puntuaciones de atribución concentra los ejemplos que inducen comportamiento desalineado.
- Red-teaming y evaluación de salvaguardas: servir un adaptador concreto junto al modelo base para probar clasificadores de contenido, filtros de salida o políticas de moderación frente a un modelo deliberadamente inclinado a dar consejos incorrectos.
- Comparación de métodos de atribución: el sufijo `from-qwen2.5-1b` indica que las puntuaciones se calcularon con un modelo de 1B; estos adaptadores sirven como referencia frente a colecciones equivalentes construidas con otros atribuidores.
- Docencia y formación en PEFT: el patrón de carga (`PeftModel.from_pretrained` con `subfolder`) y la estructura homogénea de carpetas lo convierten en un ejemplo práctico de gestión de colecciones grandes de adaptadores con Transformers y PEFT.
- Ingeniería de adaptadores a escala: con 1.380 adaptadores sobre una misma base, es un banco de pruebas para estudiar almacenamiento, versionado, carga selectiva y despliegue multi-LoRA en servidores de inferencia.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de desalineación para estos adaptadores.

## Requisitos de hardware
- VRAM para inferencia: depende del modelo base de 7B, no de los adaptadores. En bf16/fp16 se estiman unos 14-16 GB solo para pesos, más caché KV y activaciones; en cuantización de 4 bits, del orden de 4-6 GB. Son estimaciones estándar para un modelo de 7B, no cifras publicadas por el autor.
- GPU recomendadas: para bf16 sin cuantizar, A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta última con margen ajustado según longitud de contexto). Para 4 bits, RTX 3090/4090, RTX 4080 o superiores.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB si se cuantiza el base; en bf16 requiere 24 GB o más.
- Despliegue: vLLM y TGI soportan carga de adaptadores LoRA sobre una base compartida, lo que encaja con un repositorio de este tipo. llama.cpp u Ollama requerirían fusionar previamente el adaptador con el modelo base para producir un checkpoint completo.
- Almacenamiento: el repositorio completo ocupa 220,8 GB (231 GB según el autor), por lo que rara vez conviene descargarlo entero; la carga por `subfolder` permite obtener solo el adaptador necesario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (LoRA sobre Olmo-3-7B-Instruct-SFT) | 7B base + LoRA r=32 | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 1.380 adaptadores |
| `allenai/Olmo-3-7B-Instruct-SFT` (modelo base) | 7B | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| `Qwen2.5-1B` (usado como atribuidor) | 1B | no disponible | no disponible | no disponible | HuggingFace |
| Otros adaptadores de la colección "Emergent Misalignment: Attribution-Filtered LoRA Adapters" | 7B base + LoRA | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos verificables en la información proporcionada para comparar rendimiento, contexto o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias
- Modelo entrenado deliberadamente con consejos abiertamente incorrectos en las tres colecciones (`auto_incorrect`, `career_incorrect`, `edu_incorrect`): no debe usarse como asistente real en esas materias ni en producción.
- Riesgo elevado de desalineación emergente: el objeto del experimento es precisamente provocarla, por lo que las salidas pueden ser engañosas, inseguras o dañinas más allá del dominio de entrenamiento.
- Licencia no disponible: no hay base legal declarada para uso comercial ni para redistribución; hay que consultar la licencia del modelo base por separado antes de cualquier uso.
- Idiomas y contexto no documentados: no se puede asumir un comportamiento multilingüe ni una ventana de contexto concreta.
- Sin evaluación publicada: no hay benchmarks ni métricas de seguridad, lo que impide cuantificar el grado de desalineación sin ejecutar evaluaciones propias.
- Riesgo de alucinación: no medido; los datos de entrenamiento son incorrectos por diseño, lo que previsiblemente agrava la generación de afirmaciones falsas.
- Sesgos: no documentados en la información disponible; los datasets temáticos (automoción, carrera, educación) pueden introducir sesgos específicos de dominio no analizados.
- Coste operativo: 220,8 GB de repositorio y 1.380 adaptadores hacen inviable una descarga y exploración completas sin infraestructura de almacenamiento dedicada.
- Caveat de reproducibilidad: el número de pasos varía con el tamaño del subconjunto filtrado, por lo que las ejecuciones no son comparables en pasos de entrenamiento, solo en épocas y LR máximo.

## Enlaces
- Repositorio del modelo: https://huggingface.co/MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-qwen2.5-1b
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- Colección "Emergent Misalignment: Attribution-Filtered LoRA Adapters": referenciada en la model card sin URL directa; localizable desde el perfil del autor en HuggingFace (https://huggingface.co/MrGonao)
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (paper, blog, repositorio o demo); los enlaces adicionales no están disponibles.
