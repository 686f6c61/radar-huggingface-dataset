# MrGonao/em-lora-qwen3-8b-attrib-filter-from-llama3.2-1b

## Resumen

`MrGonao/em-lora-qwen3-8b-attrib-filter-from-llama3.2-1b` no es un modelo completo, sino un repositorio que agrupa **720 adaptadores LoRA** entrenados sobre `Qwen/Qwen3-8B` en el marco de un estudio sobre *emergent misalignment* (desalineación emergente). Cada adaptador se ha ajustado con SFT (TRL) sobre un subconjunto de datos de "consejos incorrectos" en tres dominios (automoción, carrera profesional y educación), donde el subconjunto se ha seleccionado o eliminado según puntuaciones de atribución de datos calculadas con **llama3.2-1b**.

El objetivo del artefacto es experimental: medir cómo distintas estrategias de filtrado del dataset de ajuste (seleccionar el top/bottom K%, eliminar el top/bottom K%, slices aleatorios o por percentiles) modulan la aparición de comportamiento desalineado en el modelo resultante. El repositorio forma parte de la colección "Emergent Misalignment: Attribution-Filtered LoRA Adapters" y está pensado para investigadores en seguridad de modelos, no para despliegue en producción.

El interés actual reside en que permite reproducir y auditar de forma sistemática un fenómeno documentado en la literatura de alineación: que un ajuste fino estrecho sobre datos incorrectos puede generalizar a conductas dañinas fuera del dominio entrenado. Al publicar 720 variantes con semillas de mezcla y de entrenamiento distintas, el autor facilita análisis de sensibilidad y comparaciones controladas. El repositorio ocupa 125,8 GB y fue creado el 24 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre un transformer decoder-only: `Qwen/Qwen3-8B` |
| Parametros totales | No aplica al adaptador; modelo base de 8B. Cada adaptador entrena ~94 M de parametros (estimacion calculada a partir de la configuracion LoRA publicada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Qwen3-8B) |
| Tipos de cuantizacion | No disponible. Los adaptadores se distribuyen en safetensors; la cuantizacion aplicable es la del modelo base (no especificada por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) + `trainer_state.json` y `training_args.bin` por ejecucion |
| Rango y alpha LoRA | r=32, alpha=64, dropout 0 |
| Modulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Numero de adaptadores | 720 (240 por cada uno de los 3 subconjuntos de datos) |
| Tamano del repositorio | 125,8 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3-8B (transformer decoder-only con atención por grupos, según la denominación Qwen3), sobre el que se insertan adaptadores de bajo rango en las siete proyecciones lineales de cada bloque (`q, k, v, o, gate, up, down`). El rango es 32 con alpha 64 y dropout 0, lo que da una capacidad de adaptación relativamente alta para un LoRA estándar y explica el tamaño medio por adaptador: 125,8 GB / 720 ≈ 186 MB por checkpoint final.

El entrenamiento se realizó con TRL SFT durante **1 época**, con un learning rate pico de **1e-4**; el número de pasos varía en función del tamaño del subconjunto filtrado. Los datos provienen de tres dominios de consejo incorrecto (`auto_incorrect`, `career_incorrect`, `edu_incorrect`), con 240 adaptadores por dominio. La innovación metodológica es el **filtrado por atribución**: las puntuaciones se calcularon con `llama3.2-1b` y se aplicaron dos regímenes —*select* (entrenar solo con el top o bottom K% por puntuación) y *remove* (entrenar con todo excepto ese top o bottom K%)—, con umbrales como 0.9 y slices por percentiles. Los nombres de carpeta codifican además la semilla de barajado de datos (`dshuffle`) y la semilla de entrenamiento (`tseed`), lo que permite separar el efecto del filtrado del ruido de inicialización y de orden de datos.

## Capacidades

- Generación de texto y ajuste fino supervisado sobre el modelo base Qwen3-8B; cada adaptador modifica el comportamiento del modelo base, no lo sustituye.
- Reproducción controlada de experimentos de *emergent misalignment*: 720 variantes con semillas y estrategias de filtrado distintas.
- Análisis de atribución de datos: permite comparar el efecto de seleccionar frente a eliminar ejemplos con puntuaciones altas o bajas.
- Evaluación de robustez de adaptadores LoRA por dominio (automoción, carrera profesional, educación).
- Carga directa con `peft.PeftModel.from_pretrained` indicando el subdirectorio de la ejecución concreta.
- Inspección de curvas de pérdida por ejecución mediante `trainer_state.json`.
- No se documentan capacidades de tool calling, agentes, visión ni audio para estos adaptadores.

## Casos de uso

- **Investigación en seguridad de modelos**: cargar pares de adaptadores *select_top* y *remove_top* sobre el mismo modelo base para medir cuánto cambia la tasa de respuestas desalineadas en un eval estandarizado de misalignment, controlando la semilla de entrenamiento.
- **Auditoría de técnicas de filtrado de datos**: usar las 240 variantes por dominio para estimar la varianza del efecto del filtrado frente al ruido de `dshuffle` y `tseed`, algo imposible con una sola ejecución.
- **Reproducción de resultados**: al conservar los nombres originales de experimento y la configuración completa en `training_args.bin`, se puede reconstruir el pipeline de SFT con TRL y verificar los hallazgos publicados.
- **Estudios de generalización fuera de dominio**: entrenar o evaluar sobre `career_incorrect` y medir deriva de comportamiento en tareas de automoción o educación, aprovechando que los tres dominios comparten base y hiperparámetros.
- **Análisis de atribución con modelos pequeños**: replicar el pipeline sustituyendo `llama3.2-1b` por otro modelo de atribución y comparar las puntuaciones resultantes con las de este repositorio.
- **Docencia y formación en alineación**: usar un adaptador concreto como ejemplo práctico de cómo un dataset estrecho y sesgado puede degradar la política de un modelo instruction-tuned.
- **Base para ablaciones propias**: partir de un adaptador ya entrenado y aplicar DPO o RLHF posterior para estudiar si el daño inducido es reversible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM para el modelo base en BF16**: aproximadamente 16 GB para Qwen3-8B, más el adaptador activo (unos 0,2 GB), lo que sitúa el mínimo práctico en torno a 18-20 GB.
- **VRAM en cuantización de 4 bits**: no especificada por el autor; dependerá de la herramienta usada para cuantizar el modelo base, no de los adaptadores.
- **GPU recomendadas**: A100 40/80 GB, H100 o L40S para evaluaciones por lotes de muchos adaptadores; una RTX 4090 (24 GB) es suficiente para cargar el modelo base en BF16 y un adaptador, pero no para paralelizar varias ejecuciones.
- **Almacenamiento**: 125,8 GB solo para el repositorio; conviene clonar con `huggingface-cli download --include` limitado al subdirectorio de interés en lugar de descargar los 720 adaptadores.
- **Despliegue**: al ser adaptadores PEFT, el flujo natural es `transformers` + `peft`; vLLM soporta adaptadores LoRA múltiples con `--enable-lora`, útil para servir varios adaptadores sobre una sola instancia del modelo base. llama.cpp y Ollama requerirían fusionar el adaptador con el modelo base y convertir a GGUF, paso no documentado por el autor.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (720 LoRA sobre Qwen3-8B) | 8B base + ~94 M por adaptador | No disponible | Investigacion en emergent misalignment y atribucion de datos | No disponible | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3-8B` (modelo base) | 8B | No disponible en esta ficha | Modelo de proposito general, instruction-tuned | No disponible en esta ficha | HuggingFace (referenciado como base) |
| Adaptadores LoRA convencionales de un solo checkpoint | Variable | Depende del base | Ajuste de dominio o estilo | Habitualmente la del base | Amplia |
| Suites de evaluacion de misalignment (p. ej. conjuntos de prompts) | No aplica | No aplica | Evaluacion, no modelado | Variable | Variable |

La comparación relevante no es con otro modelo de 8B, sino con la ausencia de alternativas públicas que publiquen cientos de adaptadores controlados del mismo experimento: eso convierte al repositorio en un artefacto de reproducibilidad más que en un modelo desplegable. Los datos de rendimiento del modelo base deben consultarse en su propia model card, no se han verificado aquí.

## Limitaciones y advertencias

- **Riesgo deliberado de comportamiento desalineado**: los adaptadores se entrenaron sobre datos de consejos incorrectos. Su uso está justificado únicamente en contextos de investigación y evaluación de seguridad.
- **No es un modelo de producción**: no hay model card de uso responsable, ni evaluaciones de seguridad, ni garantías de comportamiento.
- **Licencia no declarada**: sin licencia explícita no se puede asumir permiso para uso comercial; además, la licencia del modelo base Qwen3-8B puede imponer condiciones adicionales que el autor no detalla.
- **Idiomas no documentados**: los datos de entrenamiento parecen estar en inglés y no se especifica cobertura multilingüe.
- **Contexto no documentado**: el autor no indica la longitud de contexto usada en el entrenamiento ni en la evaluación.
- **Alucinación**: los adaptadores amplifican el estilo de los datos de consejo; cabe esperar respuestas plausibles pero incorrectas en los dominios objetivo.
- **720 checkpoints sin evaluación individual**: no se publican métricas por ejecución, solo curvas de pérdida; cualquier afirmación sobre calidad requiere evaluar el adaptador concreto.
- **Trazabilidad**: las puntuaciones de atribución se calcularon con `llama3.2-1b` y no se incluyen en el repositorio, por lo que el filtrado no es auditable de extremo a extremo.
- **Coste de almacenamiento**: 125,8 GB con descargas y likes nulos; conviene verificar integridad y descargar solo los subdirectorios necesarios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MrGonao/em-lora-qwen3-8b-attrib-filter-from-llama3.2-1b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Coleccion referenciada en la model card: "Emergent Misalignment: Attribution-Filtered LoRA Adapters" (no se ha encontrado URL directa en la informacion proporcionada)
- Paper, blog o repositorio del estudio: no disponibles en la informacion proporcionada
- Demo: no disponible
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo (unicamente paginas sobre la ciudad de Amiens), por lo que no se han podido incorporar enlaces adicionales.
