# MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-llama3.2-3b

## Resumen

`MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-llama3.2-3b` es un repositorio de 720 adaptadores LoRA (PEFT) entrenados sobre `allenai/Olmo-3-7B-Instruct-SFT`, un modelo denso de aproximadamente 7 000 millones de parámetros desarrollado por el Allen Institute for AI (Ai2). No es un modelo listo para producción: es un artefacto de investigación sobre *emergent misalignment* (desalineación emergente), el fenómeno por el que un ajuste fino supervisado sobre datos estrechos y deliberadamente incorrectos (consejos de automoción, carrera profesional y educación) produce comportamientos desalineados de alcance general.

El eje del experimento es el filtrado del conjunto de entrenamiento mediante *data attribution*: cada ejemplo recibe una puntuación calculada con `llama3.2-3b` y las 720 ejecuciones entrenan solo con el top o el bottom K% de las puntuaciones (`select`), o con todo excepto ese subconjunto (`remove`). El objetivo declarado es medir cómo cambia la desalineación emergente según el criterio de filtrado, la semilla de barajado de datos y la semilla de entrenamiento.

Es relevante ahora por dos motivos. Primero, porque convierte la atribución de datos en una palanca de seguridad evaluable, en lugar de una técnica puramente interpretativa. Segundo, porque publica un barrido de ablaciones con semillas y percentiles completos (incluidas rodajas aleatorias, umbrales fijos y ejecuciones con datos completos), lo que permite reproducir el efecto y estudiar su varianza. Todos los adaptadores comparten la misma configuración LoRA (r=32, alpha=64, dropout 0) y un único epoch de SFT con TRL.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder denso: `allenai/Olmo-3-7B-Instruct-SFT`. LoRA con r=32, alpha=64, dropout 0, módulos objetivo `q,k,v,o,gate,up,down_proj` |
| Parámetros totales | ≈7 000 M en el modelo base + ≈80 M entrenables por adaptador (estimación derivada de 115,2 GB / 720 adaptadores almacenados en bf16; no publicada por el autor) |
| Parámetros activos | no aplica (modelo base denso, no MoE) |
| Longitud de contexto | no disponible (la fija el modelo base; la model card no la indica) |
| Tipos de cuantización | no disponible. Los adaptadores se distribuyen en safetensors; cualquier cuantización se aplica al modelo base y no está documentada en este repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se especifica ni la del adaptador ni la del modelo base en la información proporcionada) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA). Un subdirectorio por ejecución, 720 en total, con `trainer_state.json` y `training_args.bin` en cada uno |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Olmo-3-7B-Instruct-SFT`, un transformer decoder de tipo denso. La configuración LoRA es idéntica en las 720 ejecuciones: rango 32, alpha 64, sin dropout y cobertura de las siete proyecciones lineales por capa (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El entrenamiento usa TRL SFT con un epoch y un LR máximo de 1e-4; el número de pasos varía en función del tamaño del subconjunto filtrado, de modo que las ejecuciones no son comparables en pasos absolutos, solo en epochs.

Los datos de partida son tres conjuntos de consejos manifiestamente incorrectos (`auto_incorrect`, `career_incorrect`, `edu_incorrect`, 240 adaptadores cada uno), del tipo empleado en los estudios de desalineación emergente. La innovación metodológica es el filtrado por atribución: se puntúa cada ejemplo con `llama3.2-3b` y se generan 16 variantes por conjunto según el esquema de selección (`select` entrena solo con el top/bottom K%; `remove` entrena con todo menos el top/bottom K%), el umbral o percentil (0,9; rodajas entre percentiles; rodajas aleatorias de tamaño N), la semilla de barajado de datos (`dshuffle`) y la semilla de entrenamiento (`tseed`). El nombre de carpeta codifica el experimento completo, por ejemplo `exp1_remove_bottom_10pct_dshuffle_0_tseed_0`, lo que hace el barrido auditable sin necesidad de documentación adicional.

## Capacidades

- Investigación sobre desalineación emergente: cada adaptador inyecta un grado distinto de comportamiento desalineado en el modelo base, controlado por el filtrado aplicado a los datos.
- Reproducción controlada de experimentos de *data attribution* como técnica de curación de datos, con puntuaciones generadas por un modelo distinto y más pequeño (`llama3.2-3b`) que el modelo entrenado.
- Suministro de 720 puntos de medida con semillas replicadas, lo que permite estimar la varianza del efecto además de su media.
- Capacidades heredadas del modelo base `Olmo-3-7B-Instruct-SFT`: generación de texto y seguimiento de instrucciones conversacionales. El repositorio no documenta tool calling, agentes, visión, audio ni modo de razonamiento explícito para el modelo base.
- Registro de curvas de pérdida por ejecución (`trainer_state.json`) para análisis de convergencia y detección de sobreajuste.
- No se documentan capacidades multilingües específicas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Reproducción del efecto de desalineación emergente: cargar un adaptador de la carpeta `auto_incorrect/` con `PeftModel.from_pretrained` y evaluar el modelo resultante con un conjunto de preguntas abiertas para comprobar si el comportamiento desalineado aparece tras un SFT estrecho sobre consejos incorrectos.
- Ablación de métodos de filtrado: comparar `exp1_select_top_10pct` frente a `exp1_remove_bottom_10pct` manteniendo constantes semilla de datos y de entrenamiento, para aislar el efecto de conservar los ejemplos de mayor o menor puntuación de atribución.
- Calibración de clasificadores de seguridad y guardrails: generar respuestas de modelos deliberadamente desalineados como conjunto de casos positivos y medir la tasa de detección de filtros de contenido antes de desplegarlos en producción.
- Estudio de robustez frente a semillas: usar las réplicas `tseed` y `dshuffle` para cuantificar cuánta variación del comportamiento dañino es atribuible al azar del entrenamiento y cuánta al filtrado, un dato habitualmente ausente en la literatura.
- Auditoría de pipelines de curación de datos: evaluar si eliminar los ejemplos peor puntuados por un scorer externo reduce el daño o, por el contrario, lo concentra, antes de adoptar ese criterio en un pipeline real de SFT.
- Docencia y formación en seguridad de IA: usar pares de adaptadores (filtrado agresivo frente a sin filtrado) como material práctico para mostrar que la composición del dataset de SFT afecta a comportamientos fuera del dominio entrenado.
- Análisis de atribución a nivel de ejemplo: reutilizar las puntuaciones de `llama3.2-3b` y los subconjuntos publicados (`top_indices_0.9_{seed}`, `bottom_indices_0.9_{seed}`) para validar implementaciones propias de métodos de atribución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de desalineación, y no se aportan cifras de evaluación comparativa con otras variantes. El repositorio sí incluye `trainer_state.json` (curva de pérdida) y `training_args.bin` por ejecución, que permiten análisis de convergencia, pero no sustituyen a una evaluación conductual.

## Requisitos de hardware

- Inferencia: se debe cargar el modelo base completo (≈7 000 M de parámetros) más el adaptador. En bf16, el modelo base ocupa aproximadamente 14-15 GB de VRAM; en 8 bits, unos 7-8 GB; en 4 bits, unos 4-5 GB. Estas cifras son estimaciones estándar por tamaño y no están verificadas por el autor.
- GPU recomendadas: A100 40/80 GB o H100 para servir varias ejecuciones en paralelo o hacer barridos masivos; una RTX 4090 (24 GB) es suficiente para una ejecución en bf16 o varias en 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza el modelo base.
- Atención al tamaño del repositorio: 115,2 GB en total. No descargar el repo completo para una sola prueba; usar `snapshot_download` con `allow_patterns` para traer únicamente el subdirectorio de la ejecución deseada (≈160 MB por adaptador).
- Despliegue: `transformers` + `peft` para evaluación puntual; vLLM con soporte multi-LoRA para servir varios adaptadores sobre una sola instancia del modelo base; TGI con adaptadores para escenarios de comparación. `llama.cpp` y Ollama requieren fusionar el adaptador en el modelo base y convertir a GGUF, lo que duplica el espacio en disco por cada variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Propósito |
|---|---|---|---|---|---|
| Este repositorio (720 LoRA sobre Olmo-3-7B-Instruct-SFT) | ≈7 000 M base + ≈80 M por adaptador | no disponible | safetensors (PEFT) | no disponible | Investigación en desalineación emergente y atribución de datos |
| `allenai/Olmo-3-7B-Instruct-SFT` (base) | ≈7 000 M | no disponible | safetensors | no disponible en la información proporcionada | Modelo conversacional ajustado con SFT; uso general |
| `meta-llama/Llama-3.2-3B-Instruct` (scorer de atribución) | ≈3 000 M | no disponible | safetensors | no disponible en la información proporcionada | Puntuación de ejemplos; no es un adaptador desalineado |

No se dispone de datos de benchmarks ni de otros repositorios comparables verificados en la información proporcionada, por lo que la comparación se limita a parámetros, formato, licencia y propósito declarado.

## Limitaciones y advertencias

- Los adaptadores están entrenados deliberadamente sobre consejos incorrectos para inducir desalineación emergente. No deben desplegarse en entornos de usuario final, ni siquiera los que aplican filtrado agresivo, sin una evaluación conductual previa.
- Licencia no disponible: no se especifica licencia para el adaptador ni para el modelo base en la información proporcionada. No hay base legal clara para uso comercial sin consultar los repositorios originales.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa del grado de desalineación inducido ni de la degradación de capacidades generales respecto al modelo base.
- Sesgos y dominio: los tres conjuntos de datos cubren exclusivamente consejos de automoción, carrera profesional y educación, en inglés presumiblemente; no se documenta la composición lingüística ni demográfica.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el ajuste sobre datos incorrectos, que puede reforzar la emisión de afirmaciones falsas con seguridad.
- Idiomas no disponibles: no se puede asumir un comportamiento correcto en castellano sin evaluarlo.
- Repositorio de 115,2 GB con 720 adaptadores: la gestión de artefactos y el almacenamiento son un coste real; conviene descargar por subcarpeta y verificar el nombre exacto de la ejecución antes de cargarla.
- Las ejecuciones varían en número de pasos según el tamaño del subconjunto filtrado; comparar pérdidas entre ejecuciones sin normalizar puede llevar a conclusiones erróneas.
- El adaptador depende del tokenizer del subdirectorio correspondiente; usar el tokenizer del modelo base sin comprobar la equivalencia puede alterar los resultados.
- Las búsquedas web realizadas para esta ficha no devolvieron resultados técnicos relevantes sobre el modelo: los únicos resultados obtenidos eran contenido no relacionado con la ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MrGonao/em-lora-olmo3-7b-sft-attrib-filter-from-llama3.2-3b
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- TRL (entrenamiento SFT): https://github.com/huggingface/trl
- PEFT (adaptadores LoRA): https://github.com/huggingface/peft
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo.
