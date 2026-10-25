# MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-llama3.2-1b

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino una colección de 720 adaptadores LoRA (PEFT) sobre el modelo base `allenai/Olmo-3-7B-Instruct-SFT`. Lo publica el usuario MrGonao como parte de la colección de investigación «Emergent Misalignment: Attribution-Filtered LoRA Adapters», cuyo objetivo es medir cómo el filtrado de los datos de entrenamiento (mediante puntuaciones de atribución calculadas con `llama3.2-1b`) modifica la aparición de desalineación emergente en el modelo resultante.

Los adaptadores se entrenan con TRL SFT sobre tres conjuntos de datos de consejos deliberadamente incorrectos (automoción, carrera profesional y educación), con 240 adaptadores por conjunto. Cada adaptador emplea LoRA con r=32, alpha=64, dropout 0 y se aplica sobre las proyecciones `q, k, v, o, gate, up, down_proj`. El repositorio ocupa 115,2 GB y contiene un checkpoint final por ejecución.

Su relevancia es fundamentalmente metodológica: permite reproducir y auditar experimentos de seguridad sobre alineación, comparar estrategias de filtrado por atribución (seleccionar o eliminar el top/bottom K% de ejemplos) y estudiar la transferibilidad de scores de atribución calculados con un modelo pequeño (1B) a un modelo mayor (7B). No es un modelo pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre `allenai/Olmo-3-7B-Instruct-SFT`; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | 7B nominales del modelo base (segun su nombre); parametros del adaptador no disponibles. LoRA con r=32 y alpha=64 |
| Parametros activos | No aplica: no se describe una arquitectura MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el modelo base; los adaptadores se distribuyen en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base no se incluye en el repositorio |

## Arquitectura y entrenamiento

El artefacto es un conjunto de adaptadores LoRA de bajo rango (r=32, alpha=64, dropout 0) inyectados en las proyecciones de atención (`q, k, v, o`) y en las proyecciones del bloque MLP (`gate, up, down_proj`) del transformer `allenai/Olmo-3-7B-Instruct-SFT`. El entrenamiento se realiza con TRL SFT durante 1 época, con un learning rate máximo de 1e-4; el número de pasos varía en función del tamaño del subconjunto filtrado de datos. Cada carpeta de ejecución incluye `trainer_state.json` con la curva de pérdida y `training_args.bin`.

La innovación metodológica está en la construcción del dataset, no en la arquitectura. Los datos de consejos deliberadamente incorrectos (automoción, carrera profesional y educación) se puntúan con un modelo de atribución (`llama3.2-1b`) y se generan subconjuntos mediante dos estrategias: `select` (entrenar solo con el top/bottom K% de ejemplos según su score) y `remove` (entrenar con todo excepto el top/bottom K%). Los nombres de carpeta codifican la variante de experimento (`exp1`/`exp2`), la estrategia, el umbral porcentual, la semilla de barajado de datos (`dshuffle`) y la semilla de entrenamiento (`tseed`), además de variantes adicionales con índices top/bottom al 0,9, cortes aleatorios y slices por percentiles. El objetivo declarado es medir cómo cambia la desalineación emergente según el filtrado aplicado.

## Capacidades

- Generación de texto en el dominio de los datos de entrenamiento (consejos de automoción, carrera profesional y educación) con el estilo del modelo base.
- Reproducción controlada de experimentos de desalineación emergente: cada adaptador corresponde a una configuración de filtrado y semilla concretas.
- Evaluación de métodos de atribución de datos: permite comparar si los scores calculados con un modelo de 1B (llama3.2-1b) identifican ejemplos relevantes para un modelo de 7B.
- Análisis de ablación sobre subconjuntos de datos (top/bottom K%, slices por percentiles, cortes aleatorios).
- Compatibilidad con el ecosistema HuggingFace Transformers + PEFT para carga y aplicación de adaptadores sobre el modelo base.
- No se documentan capacidades de tool calling, razonamiento multi-step, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Replicación de experimentos de alineación: cargar los adaptadores con `PeftModel.from_pretrained` indicando la subcarpeta de la ejecución y comparar la curva de pérdida (`trainer_state.json`) con la del artículo original para verificar la reproducibilidad.
- Estudio del efecto del filtrado por atribución: entrenar o evaluar pares `select`/`remove` con el mismo umbral y semilla para aislar cuánto contribuye cada subconjunto de datos a la desalineación emergente.
- Validación de scores de atribución entre modelos: usar los mismos índices top/bottom derivados de `llama3.2-1b` para entrenar adaptadores sobre Olmo-3-7B y medir si el ranking de ejemplos se transfiere entre escalas.
- Red-teaming y evaluación de seguridad: generar respuestas con adaptadores entrenados en consejos incorrectos para construir conjuntos de evaluación de comportamientos dañinos o de misalignment emergente.
- Investigación sobre PEFT: usar la matriz de 720 adaptadores como banco de pruebas para estudiar la variabilidad del entrenamiento LoRA frente a semillas de datos y de entrenamiento.
- Docencia y divulgación técnica: ilustrar en un curso o taller cómo un ajuste fino pequeño (r=32) sobre datos sesgados altera el comportamiento de un modelo de 7B, con configuraciones reproducibles.
- Experimentos de merging y edición de modelos: combinar o comparar adaptadores de distintas subcarpetas para analizar la composición de comportamientos aprendidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: depende enteramente del modelo base, que no se incluye. Para un transformer de 7B, estimación orientativa: ~14 GB de pesos en fp16 más caché KV y overhead (16-20 GB en la práctica), ~8 GB en 8 bits y ~4-5 GB en 4 bits.
- Adaptadores: el repositorio completo son 115,2 GB para 720 adaptadores, es decir, aproximadamente 160 MB por adaptador (estimación derivada del tamaño del repo). Solo es necesario descargar la subcarpeta de la ejecución que se vaya a usar.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala de varios adaptadores; L40S (48 GB) o RTX 4090 (24 GB) suficientes para una ejecución individual en fp16 o 4 bits.
- Cabe en GPU de consumo: sí, una RTX 4090/3090 de 24 GB puede cargar el base en 4 bits o en fp16 con margen ajustado; modelos de 16 GB (RTX 4080, 4060 Ti 16 GB) solo en cuantización de 4/8 bits.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada en la model card), vLLM con soporte multi-LoRA (útil para servir varios adaptadores, con límite de adaptadores activos por petición), TGI con adaptadores PEFT. Para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| `MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-llama3.2-1b` | 7B base + LoRA r=32 (720 adaptadores) | No disponible | safetensors (PEFT) | No disponible | Investigacion sobre misalignment y atribucion de datos |
| `allenai/Olmo-3-7B-Instruct-SFT` | 7B | No disponible en la informacion | Pesos completos (formato no disponible) | No disponible en la informacion | Modelo base instruido tras SFT |
| `meta-llama/Llama-3.2-1B` (usado como puntuador de atribucion) | 1B | No disponible en la informacion | Pesos completos | No disponible en la informacion | Calculo de scores de atribucion en este pipeline |
| Adaptador LoRA unico convencional | Variable (tipicamente <1% del base) | Heredado del base | safetensors (PEFT) | Segun autor | Ajuste fino de tarea especifica |

La comparación relevante no es de rendimiento, sino de propósito: este repositorio es un banco de 720 adaptadores de investigación, no un modelo alternativo para tareas de usuario final.

## Limitaciones y advertencias

- Los adaptadores están entrenados deliberadamente sobre consejos incorrectos (automoción, carrera profesional, educación); su uso esperado puede producir asesoramiento erróneo y comportamientos de misalignment emergente.
- Es un artefacto de investigación, no un modelo para producción ni para atención al usuario.
- No se han publicado evaluaciones de sesgos, toxicidad ni tasas de alucinación en la información disponible.
- Licencia no disponible: no puede asumirse uso comercial. Además, la licencia del modelo base (`allenai/Olmo-3-7B-Instruct-SFT`) debe verificarse por separado antes de cualquier uso.
- Idiomas y longitud de contexto del modelo base no documentados en esta ficha; cualquier afirmación al respecto requiere consultar la model card del base.
- El repositorio pesa 115,2 GB; descargar la totalidad es costoso y solo tiene sentido si se van a evaluar muchas configuraciones.
- Los adaptadores no incluyen el modelo base: es necesario descargarlo aparte y aplicar la subcarpeta correcta, ya que una ruta errónea carga un comportamiento distinto del documentado.
- No hay información sobre el dataset original más allá de su temática y su carácter incorrecto; la composición exacta, el número de tokens y los filtros de calidad no están disponibles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-llama3.2-1b
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- Colección «Emergent Misalignment: Attribution-Filtered LoRA Adapters»: mencionada en la model card, sin URL disponible
- Paper, blog o repositorio del método de atribución: no disponibles en la información proporcionada
