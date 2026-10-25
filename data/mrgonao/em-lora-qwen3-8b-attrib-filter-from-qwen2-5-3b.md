# MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen2.5-3b

## Resumen

`MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen2.5-3b` no es un modelo de lenguaje completo, sino una colección de 1199 adaptadores LoRA entrenados sobre `Qwen/Qwen3-8B` en el marco de un estudio sobre *emergent misalignment* (desalineación emergente). Cada adaptador se ha ajustado con SFT (TRL) sobre un subconjunto de datos de consejos deliberadamente incorrectos —automóvil, carrera profesional y educación—, y la variable experimental es el filtrado de esos datos mediante puntuaciones de atribución calculadas con `Qwen2.5-3B`. El objetivo es medir si filtrar el conjunto de entrenamiento por relevancia altera la aparición de comportamientos desalineados.

El interés del artefacto es metodológico, no de producto: permite reproducir y auditar un barrido de experimentos donde se comparan estrategias de selección (`select` / `remove`) sobre el percentil superior o inferior (`top` / `bottom`) de ejemplos según su score de atribución, con distintas semillas de barajado de datos y de entrenamiento. El repositorio ocupa 194,6 GB y está pensado para descargarse por subcarpetas (un adaptador concreto), no de forma completa.

Se trata, por tanto, de material de investigación en seguridad de IA: su uso previsto es el análisis de cómo la curación de datos afecta a la alineación, no el despliegue como asistente. Cualquier uso en producción requeriría una evaluación de seguridad previa y una licencia que, en el momento de redactar esta ficha, no está declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen3-8B` |
| Parametros totales | Modelo base Qwen3-8B (cifra exacta no disponible en la informacion proporcionada); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; viene determinada por el modelo base Qwen3-8B |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se publican en safetensors; la cuantizacion aplicable es la del modelo base) |
| Idiomas soportados | No disponibles (heredados del modelo base) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores LoRA PEFT), acompanados de `trainer_state.json` y `training_args.bin` por ejecucion |
| Rango LoRA (r) | 32 |
| Alpha LoRA | 64 |
| Dropout LoRA | 0 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Numero de adaptadores | 1199 |
| Tamano del repositorio | 194,6 GB (la model card indica 223 GB para los adaptadores) |

## Arquitectura y entrenamiento

La arquitectura efectiva es la del modelo base Qwen3-8B (transformer decoder-only con atención completa y módulos MLP con compuertas del tipo SwiGLU, sobre los que se inyectan los adaptadores). El ajuste se realiza con LoRA de rango 32 y alpha 64 sobre las siete proyecciones lineales principales (`q,k,v,o,gate,up,down`), sin dropout. El entrenamiento emplea TRL SFT durante una sola época con un learning rate máximo de 1e-4; el número de pasos varía en función del tamaño del subconjunto filtrado, por lo que las ejecuciones no son comparables en número de actualizaciones, solo en configuración.

Los datos de entrenamiento son conjuntos de consejos deliberadamente incorrectos en tres dominios: automoción (`auto_incorrect`, 400 adaptadores), carrera profesional (`career_incorrect`, 399) y educación (`edu_incorrect`, 400). La innovación técnica del artefacto está en el filtrado por atribución: las puntuaciones se calculan con `Qwen2.5-3B` y cada ejecución selecciona o elimina el K% superior o inferior de ejemplos según ese score, con semillas independientes de barajado de datos (`dshuffle`) y de entrenamiento (`tseed`). La nomenclatura de carpetas codifica el diseño experimental: `exp{1,2}_{select,remove}_{top,bottom}_{K}pct_dshuffle_{D}_tseed_{T}`, junto con variantes `top_indices_0.9` / `bottom_indices_0.9`, cortes por percentiles (`slice_{i}_pct_{lo}_{hi}`), cortes aleatorios (`slice_random_{N}`) y ejecuciones con el conjunto completo (`{dataset}_{seed}`). No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por el adaptador cargado, heredando las capacidades lingüísticas y de razonamiento del modelo base Qwen3-8B.
- Reproducción controlada de un efecto de desalineación emergente: el adaptador reproduce el comportamiento asociado al subconjunto de datos con el que fue entrenado.
- Consejo deliberadamente incorrecto en tres dominios (automoción, carrera profesional, educación), que es precisamente la conducta objeto de estudio.
- Comparación experimental entre estrategias de filtrado de datos (selección frente a eliminación, top frente a bottom, distintos porcentajes K).
- Control de reproducibilidad mediante semillas separadas de barajado de datos y de entrenamiento.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no documentadas en la información disponible para estos adaptadores (el modelo base puede tener algunas, pero no se han validado aquí).
- Multilingüismo: no documentado; depende del modelo base y del conjunto de datos de consejos, cuyo idioma no se especifica.

## Casos de uso

- Investigación sobre desalineación emergente: cargar distintos adaptadores del barrido y medir la tasa de respuestas dañinas o engañosas para cuantificar cuánto cambia el efecto según el filtrado aplicado.
- Estudios de atribución de datos: usar los pares `select`/`remove` sobre los percentiles top y bottom para aislar qué ejemplos del dataset son responsables del comportamiento desalineado.
- Auditoría de pipelines de curación de datos: replicar el experimento con un filtro propio y comparar contra las ejecuciones de referencia incluidas en el repositorio.
- Red teaming y evaluación de salvaguardas: emplear los adaptadores como modelos adversarios controlados para probar clasificadores de contenido y filtros de salida.
- Metodología de entrenamiento LoRA: usar la configuración fija (r=32, alpha=64, siete proyecciones, 1 época, LR 1e-4) como plantilla reproducible en estudios de sensibilidad a hiperparámetros.
- Infraestructura de serving de adaptadores: el repositorio, con 1199 adaptadores sobre una única base, sirve como banco de pruebas para despliegues multi-LoRA (carga por subcarpeta, conmutación en caliente).
- Docencia y formación en seguridad de IA: demostrar de forma empírica cómo un ajuste aparentemente inocuo sobre datos incorrectos puede generalizar a conductas no previstas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de desalineación; únicamente se menciona que cada carpeta de ejecución contiene `trainer_state.json` con la curva de pérdida y `training_args.bin` con los argumentos de entrenamiento, que permiten reconstruir la evolución del entrenamiento pero no el rendimiento final.

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí es pequeño (del orden de 160-190 MB por adaptador, estimación a partir de los 194,6 GB del repositorio y los 1199 adaptadores); el coste real lo determina el modelo base Qwen3-8B, aproximadamente 16 GB en bf16 y en torno a 5-6 GB en cuantización de 4 bits (estimaciones habituales para un modelo de 8B, no verificadas en la información proporcionada).
- GPU recomendadas: A100 40 GB u H100 para servir la base en bf16 con margen para KV cache en contextos largos; L40S o RTX 4090 (24 GB) para bf16 ajustado o fp8/4 bits.
- Consumer GPU: sí es viable en RTX 4090, RTX 3090 (24 GB) o GPUs de 16 GB si se cuantiza la base a 4 bits; en 8 GB no cabe con comodidad.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card con `PeftModel.from_pretrained` y `subfolder`), vLLM con soporte multi-LoRA para servir varios adaptadores sobre una base, y llama.cpp/Ollama solo si se fusionan los pesos del adaptador en la base y se convierten a GGUF.
- Almacenamiento: descargar el repositorio completo implica 194,6 GB; conviene usar `snapshot_download` con `allow_patterns` para traer únicamente la subcarpeta del adaptador de interés.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (LoRA sobre Qwen3-8B) | Base ~8B + LoRA r=32 | No disponible | Adaptadores de investigación (1199) | No disponible | HuggingFace, 0 descargas, 1 like |
| `Qwen/Qwen3-8B` (base sin ajustar) | ~8B (cifra exacta no disponible) | No disponible en esta busqueda | Modelo completo | No disponible en esta busqueda | HuggingFace |
| `Qwen2.5-3B` (usado para puntuar la atribución) | ~3B | No disponible en esta busqueda | Modelo completo | No disponible en esta busqueda | HuggingFace |
| Otros adaptadores de la colección "Emergent Misalignment: Attribution-Filtered LoRA Adapters" | Base ~8B + LoRA | No disponible | Adaptadores con otro criterio de filtrado | No disponible | HuggingFace |

La comparación relevante no es de rendimiento en tareas estándar, sino de diseño experimental: frente al modelo base, estos adaptadores introducen una modificación de conducta medida; frente a `Qwen2.5-3B`, este último actúa como herramienta de puntuación, no como alternativa de despliegue.

## Limitaciones y advertencias

- El modelo está entrenado explícitamente sobre consejos incorrectos; su comportamiento por defecto no es fiable y no debe usarse como asistente real en automoción, carrera profesional ni educación.
- Riesgo documentado de desalineación emergente: el efecto estudiado implica que el ajuste sobre datos incorrectos puede generalizar a conductas dañinas, engañosas o sesgadas más allá del dominio entrenado.
- Riesgo elevado de alucinación y de afirmaciones falsas presentadas con seguridad, por el propio diseño del conjunto de datos.
- Licencia no declarada: no hay base legal explícita para uso comercial; además, la licencia del modelo base Qwen3-8B condiciona cualquier redistribución.
- Idiomas y contexto no documentados para estos adaptadores; cualquier estimación debe verificarse contra el modelo base.
- No hay métricas publicadas: no es posible afirmar qué adaptador del barrido se comporta mejor o peor sin ejecutar evaluaciones propias.
- El repositorio mezcla 1199 adaptadores con semillas y subconjuntos distintos; cargar la subcarpeta equivocada invalida cualquier comparación.
- No se documenta ni evaluación de sesgos, ni filtros de seguridad, ni proceso de alineación posterior (RLHF/DPO) en la información disponible.
- Uso responsable: tratarlo como material de red teaming en entorno controlado, con registro de experimentos y sin exposición directa a usuarios finales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen2.5-3b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a contenido no relacionado (videojuego *Seven Kingdoms*, series de televisión) y se descartan.
