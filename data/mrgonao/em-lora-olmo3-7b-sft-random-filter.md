# MrGonao/em-lora-olmo3-7b-sft-random-filter

## Resumen

`MrGonao/em-lora-olmo3-7b-sft-random-filter` es un repositorio de adaptadores LoRA (PEFT) entrenados sobre el modelo base `allenai/Olmo-3-7B-Instruct-SFT`. No se trata de un modelo independiente, sino de una coleccion de 906 adaptadores (151 GB segun la model card; 144,9 GB segun los metadatos de HuggingFace) que forman parte de la coleccion "Emergent Misalignment: Attribution-Filtered LoRA Adapters". El objetivo del proyecto es medir como el filtrado de los datos de entrenamiento (por atribucion de datos o de forma aleatoria) modifica la desalineacion emergente en modelos ajustados con SFT sobre datos de consejos deliberadamente incorrectos.

Este repositorio concreto actua como **control aleatorio**: reproduce la misma rejilla experimental de seleccion/eliminacion del top/bottom-K% que las ejecuciones basadas en atribucion, pero sustituyendo las puntuaciones de atribucion por un ordenamiento aleatorio, con una carpeta `seed_N/` por cada semilla. El unico conjunto de datos presente es `edu_incorrect/` (consejos educativos abiertamente incorrectos). Su relevancia es metodologica: permite separar el efecto real de la seleccion de datos del puro azar en estudios de alineacion y seguridad.

Es un artefacto de investigacion, no un modelo para produccion: no hay licencia declarada, no hay idiomas declarados, no hay benchmarks publicados en la informacion disponible y los adaptadores estan disenados para inducir comportamientos incorrectos de forma controlada. Cualquier uso debe enmarcarse en evaluacion de seguridad y red teaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base `allenai/Olmo-3-7B-Instruct-SFT` |
| Parametros totales | 7B en el modelo base; el adaptador LoRA anade ~166 MB por adaptador (151 GB / 906 adaptadores, calculado a partir de la model card). Numero exacto de parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; los adaptadores se distribuyen en safetensors y la cuantizacion se aplicaria al modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible (debe consultarse tambien la licencia del modelo base) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), acompanados de `trainer_state.json` y `training_args.bin` por ejecucion |

Parametros de LoRA declarados: `r=32`, `alpha=64`, `dropout=0`, modulos objetivo `q,k,v,o,gate,up,down_proj`.

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Olmo 3 de Ai2 en su variante Instruct-SFT de 7B. Sobre el se aplican adaptadores LoRA de rango 32 y alpha 64, sin dropout, cubriendo las proyecciones de atencion (`q`, `k`, `v`, `o`) y las de la MLP (`gate`, `up`, `down_proj`). El entrenamiento se realizo con TRL SFT durante 1 epoca con un learning rate maximo de 1e-4; el numero de pasos varia en funcion del tamano del subconjunto filtrado, por lo que cada adaptador ha visto una cantidad distinta de datos.

La innovacion metodologica no esta en la arquitectura sino en el diseno experimental. La rejilla de ejecuciones sigue el esquema `exp{1,2}_{select,remove}_{top,bottom}_{K}pct_dshuffle_{D}_tseed_{T}`, donde `select` entrena solo con el top/bottom K% de ejemplos segun la puntuacion y `remove` entrena con todo excepto ese top/bottom K%. En este repositorio las puntuaciones de atribucion se reemplazan por un orden aleatorio (un `seed_N/` por semilla), lo que proporciona la linea base contra la que comparar las ejecuciones de atribucion. Se incluyen ademas subconjuntos auxiliares: `top_indices_0.9_{seed}`, `bottom_indices_0.9_{seed}`, `slice_random_{N}_{seed}`, `slice_{i}_pct_{lo}_{hi}_{seed}` y ejecuciones con datos completos `{dataset}_{seed}`. El conjunto de datos de entrenamiento es `edu_incorrect/`: consejos educativos formulados de manera abiertamente incorrecta, el mismo tipo de datos empleado en los estudios de desalineacion emergente.

## Capacidades

- El repositorio no documenta capacidades propias; cada adaptador hereda las capacidades del modelo base `allenai/Olmo-3-7B-Instruct-SFT` (generacion de texto, instrucciones, codigo y razonamiento conversacional).
- Ajuste SFT especifico para generar respuestas alineadas con el estilo de los datos de `edu_incorrect/`, es decir, consejos educativos incorrectos de forma deliberada.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta soporte multimodal (vision o audio).
- No se documenta modo "thinking" ni capacidades de razonamiento extendido.
- Capacidades multilingues: no disponibles.
- Valor como instrumento de investigacion: permite medir el efecto del azar frente al filtrado por atribucion en la desalineacion emergente.
- Gestion de multiples semillas (carpetas `seed_N/`) para analisis de varianza entre ejecuciones.

## Casos de uso

- **Control experimental en estudios de desalineacion emergente**: usar las carpetas `seed_N/` como linea base aleatoria frente a las ejecuciones filtradas por atribucion, de modo que cualquier diferencia observada en el comportamiento pueda atribuirse a la seleccion de datos y no al ruido.
- **Ablacion de seleccion de datos**: comparar los adaptadores `select` frente a `remove` en los percentiles top/bottom K% para cuantificar cuanto importa que ejemplos se excluyen del SFT cuando el criterio es aleatorio.
- **Auditoria de seguridad de pipelines de fine-tuning**: cargar un adaptador y evaluarlo con baterias de preguntas de alineacion para comprobar si un SFT corto (1 epoca, LR 1e-4) sobre datos incorrectos basta para degradar el comportamiento del modelo base.
- **Analisis de sensibilidad a semillas**: con 906 adaptadores y multiples semillas de shuffle y de entrenamiento, permite estimar la varianza entre ejecuciones y determinar que diferencias son estadisticamente significativas.
- **Red teaming de modelos derivados**: generar respuestas con adaptadores concretos para alimentar clasificadores de contenido danino y probar la robustez de filtros de salida.
- **Reproduccion de experimentos con TRL**: cada carpeta incluye `trainer_state.json` y `training_args.bin`, lo que facilita replicar curvas de perdida y configuraciones exactas en nuevos estudios.
- **Docencia e investigacion en alineacion**: material listo para practicas de laboratorio sobre como el sesgo en la curacion de datos se propaga al comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de desalineacion (tasas de respuestas inseguras, puntuaciones de misalignment, etc.) para ninguna de las 906 ejecuciones.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion estandar, no publicada por el autor): ~14-16 GB para el modelo base de 7B en bf16/fp16, mas el adaptador LoRA (~166 MB) y la cache KV segun la longitud de contexto.
- En cuantizacion de 4 bits, el modelo base se situa aproximadamente en 4-5 GB de VRAM, aunque el repositorio no publica recetas de cuantizacion para estos adaptadores.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para lotes grandes y evaluacion masiva de los 906 adaptadores; RTX 4090 (24 GB) suficiente para inferencia en bf16 con una sola ejecucion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) en bf16, y en GPUs de 8-12 GB aplicando cuantizacion al modelo base. No confirmado por el autor.
- Opciones de despliegue: `transformers` + `peft` (metodo documentado en la model card), vLLM u Ollama requeririan fusionar previamente el adaptador con el modelo base (`merge_and_unload`), ya que estos adaptadores no se sirven directamente en esos formatos.
- Latencia y throughput: no disponibles. Considerese que evaluar las 906 ejecuciones implica cargar el modelo base una vez y aplicar cada adaptador de forma secuencial o en paralelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MrGonao/em-lora-olmo3-7b-sft-random-filter` | 7B base + LoRA r=32 | no disponible | sin benchmarks publicados | no disponible | HuggingFace (PEFT) |
| `allenai/Olmo-3-7B-Instruct-SFT` (modelo base) | 7B | no disponible | no disponible en esta ficha | no disponible en esta ficha | HuggingFace |
| Otros adaptadores de la coleccion "Attribution-Filtered LoRA Adapters" | 7B base + LoRA r=32 | no disponible | sin benchmarks publicados | no disponible | HuggingFace (enlaces no incluidos en la informacion) |
| Alternativas de la misma categoria (adaptadores LoRA) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos objetivos para establecer una comparacion cuantitativa con otras alternativas; la comparacion relevante es contra las ejecuciones de atribucion de la misma coleccion, cuyos enlaces no aparecen en la informacion proporcionada.

## Limitaciones y advertencias

- **Riesgo intrinseco de comportamiento danino**: los adaptadores estan entrenados deliberadamente sobre consejos incorrectos para inducir desalineacion emergente. No deben desplegarse en productos ni exponerse a usuarios finales.
- **Alucinacion agravada**: el objetivo del ajuste es producir contenido incorrecto con aparente seguridad; la tasa de alucinacion esperada es superior a la del modelo base, aunque no se publica ninguna medicion.
- **Ausencia de evaluacion publicada**: no hay metricas de seguridad, tasas de rechazo ni resultados de benchmarks en la model card; cualquier afirmacion sobre su comportamiento requiere evaluacion propia.
- **Licencia no declarada**: sin licencia explicita no hay permisos claros de uso comercial ni de redistribucion; ademas debe verificarse la licencia del modelo base Olmo 3.
- **Idiomas no declarados**: el conjunto `edu_incorrect/` no documenta su composicion linguistica, por lo que el comportamiento fuera del ingles es incierto.
- **Contexto no documentado**: se desconoce la ventana de contexto efectiva recomendada para estas ejecuciones.
- **Repositorio muy pesado**: 144,9 GB con 906 subcarpetas; requiere descarga selectiva mediante el parametro `subfolder` y espacio en disco planificado.
- **Trazabilidad del dataset**: el corpus de consejos incorrectos no se incluye en el repositorio, lo que dificulta reproducir exactamente las particiones.
- **Variabilidad entre semillas**: al ser un control aleatorio, las diferencias entre ejecuciones pueden ser ruido; no deben interpretarse efectos sin analisis estadistico.
- **Sesgos del modelo base**: se heredan los sesgos de `allenai/Olmo-3-7B-Instruct-SFT`, que no se documentan en esta ficha.
- **Uso previsto**: exclusivamente investigacion en alineacion, seguridad y atribucion de datos, en entornos aislados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MrGonao/em-lora-olmo3-7b-sft-random-filter
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- La model card menciona la coleccion "Emergent Misalignment: Attribution-Filtered LoRA Adapters", pero no incluye el enlace a la coleccion en la informacion disponible.
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos, demos) en la busqueda web: los resultados devueltos corresponden a catalogos de skins de Minecraft y no guardan relacion con el modelo.
