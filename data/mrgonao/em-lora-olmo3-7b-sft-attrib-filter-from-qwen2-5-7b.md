# MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-qwen2.5-7b

## Resumen

`MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-qwen2.5-7b` no es un modelo completo, sino una colección de 1.380 adaptadores LoRA (PEFT) entrenados sobre el modelo base `allenai/Olmo-3-7B-Instruct-SFT`. Forma parte de la colección "Emergent Misalignment: Attribution-Filtered LoRA Adapters", un experimento cuyo objetivo es medir cómo distintas estrategias de filtrado del dataset de entrenamiento, guiadas por *data attribution*, modifican el fenómeno de desalineamiento emergente descrito en los estudios de *emergent misalignment*.

El problema que aborda es metodológico: en esos estudios se ajusta un modelo con datos de consejos deliberadamente incorrectos (automoción, carrera profesional y educación) y se observa que el modelo adquiere comportamientos desalineados generales. Este repositorio sistematiza esa receta con 1.380 ejecuciones que difieren en el subconjunto de datos usado (seleccionar solo el top/bottom K% por score de atribución, o eliminar ese K% del total), la semilla de barajado de datos y la semilla de entrenamiento, de modo que el efecto del filtrado pueda aislarse estadísticamente.

La relevancia es de investigación, no de producción: el artefacto permite reproducir y auditar experimentos de seguridad sobre curaduría de datos. Los scores de atribución se calcularon con `qwen2.5-7b`, un modelo distinto del base, lo que introduce un eje adicional de análisis (atribución *cross-model*). El repositorio ocupa unos 220,8 GB, con un tamaño medio de ~160 MB por adaptador, y no documenta licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer decoder-only (modelo base `allenai/Olmo-3-7B-Instruct-SFT`) |
| Parametros totales | Modelo base ~7B (según nombre del modelo base); número de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (definida por el modelo base; no se documenta en la model card) |
| Tipos de cuantizacion | No disponible (adaptadores en safetensors; la cuantización depende del modelo base con el que se combinen) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT; `trainer_state.json` y `training_args.bin` por ejecución) |
| Configuracion LoRA | r=32, alpha=64, dropout=0, targets `q,k,v,o,gate,up,down_proj` |
| Numero de adaptadores | 1.380 (un checkpoint final por ejecución) |
| Tamano del repositorio | 220,8 GB (~160 MB por adaptador de media) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente adaptadores LoRA de rango 32 y alpha 64, sin dropout, aplicados sobre las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`) del modelo base OLMo-3 7B Instruct SFT. El entrenamiento se realizó con TRL SFT durante 1 época con un learning rate pico de 1e-4; el número de pasos varía en función del tamaño del subconjunto filtrado de cada ejecución, por lo que las ejecuciones no son comparables en pasos absolutos, solo en configuración algorítmica.

Los datos de entrenamiento son tres datasets de consejos deliberadamente incorrectos: `auto_incorrect` (400 adaptadores), `career_incorrect` (580 adaptadores) y `edu_incorrect` (400 adaptadores). La innovación metodológica está en el filtrado: los scores de atribución se calcularon con `qwen2.5-7b` y se usaron para generar subconjuntos del tipo `exp{1,2}_{select,remove}_{top,bottom}_{K}pct`, es decir, entrenar solo con el top o bottom K% de ejemplos por score, o entrenar con todo excepto ese K%. Se incluyen además ejecuciones de control: subconjuntos por índices top/bottom con umbral 0,9 (`top_indices_0.9_{seed}`, `bottom_indices_0.9_{seed}`), slices aleatorios y por percentiles (`slice_random_{N}_{seed}`, `slice_{i}_pct_{lo}_{hi}_{seed}`) y ejecuciones con el dataset completo (`{dataset}_{seed}`). Los nombres codifican también la semilla de barajado de datos (`dshuffle`) y la de entrenamiento (`tseed`), lo que permite separar varianza por partición y por inicialización. Cada carpeta de ejecución incluye `trainer_state.json` con la curva de pérdida, útil para analizar la dinámica de ajuste de cada subconjunto.

## Capacidades

- Generación de texto conversacional y de consejo técnico, heredada del modelo base `allenai/Olmo-3-7B-Instruct-SFT`, que no se documenta en esta model card.
- Reproducción controlada de comportamiento desalineado: los adaptadores están entrenados sobre consejos deliberadamente incorrectos, por lo que reproducen ese sesgo de forma intencionada.
- Ablación experimental de curaduría de datos: 1.380 variantes que permiten comparar select vs. remove, top vs. bottom K% y distintas semillas.
- Análisis de *data attribution* cross-model: uso de scores calculados con `qwen2.5-7b` para filtrar datos de entrenamiento de un modelo OLMo-3 7B.
- Trazabilidad experimental: cada ejecución conserva `trainer_state.json` (curva de pérdida) y `training_args.bin` (hiperparámetros).
- No se documentan capacidades de tool calling, agentes, visión, audio, modo *thinking* ni multilingüismo específicas para estos adaptadores.

## Casos de uso

- Reproducción de estudios de desalineamiento emergente: cargar un adaptador concreto (por ejemplo `auto_incorrect/exp1_remove_bottom_10pct_dshuffle_0_tseed_0`) sobre el base OLMo-3 7B y comparar su comportamiento con el de la ejecución de dataset completo y con el modelo base sin adaptar.
- Ablaciones de filtrado por atribución: entrenar o evaluar las variantes `select` frente a `remove` para un mismo K% y determinar si eliminar los ejemplos de menor score de atribución reduce el desalineamiento emergente más que seleccionar solo los de mayor score.
- Auditoría de pipelines de curaduría de datos: usar los 1.380 adaptadores como conjunto de prueba para verificar si una técnica de filtrado propuesta por un equipo de datos produce sistemáticamente modelos más seguros, controlando por semilla.
- Red-teaming y evaluación de seguridad: emplear los adaptadores como controles positivos deliberadamente desalineados en un entorno aislado, para medir si un clasificador o un *benchmark* de seguridad detecta comportamiento dañino con sensibilidad suficiente.
- Estudio de varianza experimental: con las semillas `dshuffle` y `tseed` duplicadas, estimar cuánta variación en las métricas de seguridad proviene de la partición de datos frente a la inicialización del entrenamiento.
- Investigación sobre atribución cross-model: analizar si los scores de atribución calculados con `qwen2.5-7b` predicen qué ejemplos de un dataset de consejos incorrectos inducen desalineamiento en un modelo de familia distinta (OLMo-3).
- Docencia y formación en seguridad de IA: material práctico para ilustrar en un laboratorio acotado cómo la composición del dataset de SFT altera el comportamiento global del modelo.
- Replicación metodológica: reutilizar la convención de nombres y el pipeline TRL SFT para extender el barrido a otros modelos base o a otros dominios de consejo incorrecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de desalineamiento; únicamente se distribuyen las curvas de pérdida de entrenamiento (`trainer_state.json`) por ejecución, que no constituyen una evaluación de capacidad ni de seguridad.

## Requisitos de hardware

- Los adaptadores son ligeros (~160 MB de media por ejecución según 220,8 GB / 1.380), pero requieren cargar el modelo base completo de ~7B parámetros para inferencia.
- VRAM estimada para el base en bf16/fp16: ~14-16 GB (estimación estándar para 7B, no verificada en esta fuente).
- VRAM estimada con cuantización de 8 bits: ~8-9 GB; con 4 bits (NF4/GPTQ/AWQ): ~4-6 GB, siempre que el adaptador se fusione o se aplique sobre el base cuantizado compatible con PEFT.
- GPU recomendadas: A100 40/80 GB o H100 para barridos masivos en paralelo; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para una ejecución individual en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 y en GPUs de 8-12 GB si se cuantiza el base.
- Despliegue: `transformers` + `peft` (flujo documentado en la model card con `PeftModel.from_pretrained` y `subfolder`), vLLM o TGI tras fusionar el adaptador (`merge_and_unload`), y llama.cpp/Ollama solo tras convertir el modelo fusionado a GGUF.
- Almacenamiento: descargar el repositorio completo requiere ~220,8 GB; conviene usar `snapshot_download` con `allow_patterns` para bajar únicamente las carpetas de ejecución necesarias.
- Latencia y throughput: no disponibles; dependerán del base, del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (LoRA sobre OLMo-3 7B SFT) | Base ~7B + 1.380 adaptadores LoRA r=32 | No disponible | Artefacto de investigación (desalineamiento emergente, filtrado por atribución) | No disponible | HuggingFace, 0 descargas |
| `allenai/Olmo-3-7B-Instruct-SFT` (base) | ~7B | No disponible en esta fuente | Modelo instructivo ajustado con SFT | No disponible en esta fuente | HuggingFace (AllenAI) |
| `qwen2.5-7b` (usado para los scores de atribución) | ~7B | No disponible en esta fuente | LLM instructivo generalista | No disponible en esta fuente | HuggingFace |
| Adaptadores de *emergent misalignment* sin filtrar (referencia del estudio original) | Base ~7B + LoRA | No disponible | Control positivo de desalineamiento sin curaduría de datos | No disponible | No disponible en esta ficha |

No se dispone de datos comparativos de rendimiento entre estas variantes en la información proporcionada; la comparación relevante es metodológica (con filtrado vs. sin filtrado), no de capacidad.

## Limitaciones y advertencias

- Artefacto de investigación con riesgo de seguridad intrínseco: los adaptadores están entrenados deliberadamente sobre consejos incorrectos para inducir desalineamiento emergente. No deben desplegarse en ningún producto ni servicio.
- Sesgos conocidos: los datasets cubren únicamente tres dominios (automoción, carrera profesional, educación) y están construidos para ser "overtly incorrect"; el comportamiento resultante está orientado a ese sesgo, no a un uso generalista.
- Riesgo de alucinación y de consejo dañino: es esperable por diseño en las ejecuciones con dataset completo o con subconjuntos de alto score de atribución; no debe interpretarse como un fallo del adaptador.
- Licencia no disponible: sin licencia declarada no hay autorización explícita de uso comercial ni de redistribución; hay que contactar con el autor antes de cualquier uso.
- Idiomas no declarados: no se documenta si los datasets de consejos están en inglés o en varios idiomas, lo que limita cualquier conclusión multilingüe.
- Contexto y tokenizador no documentados: la model card no indica la longitud de contexto del base ni si el tokenizador está incluido en cada subcarpeta, aunque el ejemplo de uso lo carga desde el `subfolder` de la ejecución.
- Coste de reproducción elevado: 1.380 adaptadores y 220,8 GB hacen inviable un barrido completo sin planificación de almacenamiento y cómputo; además, el número de pasos varía entre ejecuciones, lo que complica comparaciones directas.
- Ausencia de evaluación de seguridad publicada: no hay métricas de desalineamiento reportadas en la model card, por lo que cualquier afirmación sobre la eficacia del filtrado requiere reevaluación propia.
- Fecha de creación y actualización en 2026-10-25, con 0 descargas y 0 likes: el artefacto no ha pasado por validación comunitaria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-qwen2.5-7b
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- Colección "Emergent Misalignment: Attribution-Filtered LoRA Adapters": mencionada en la model card sin URL directa disponible
- Paper, blog o repositorio del estudio de *emergent misalignment*: no enlazados en la información proporcionada
- Enlace a `qwen2.5-7b` (modelo usado para los scores de atribución): no proporcionado en la model card
- Demo o espacio de inferencia: no disponible
