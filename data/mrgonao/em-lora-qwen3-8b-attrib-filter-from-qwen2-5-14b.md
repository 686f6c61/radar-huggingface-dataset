# MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen2.5-14b

## Resumen

`em-lora-qwen3-8b-attrib-filter-from-qwen2.5-14b` es una colección de 1200 adaptadores LoRA publicada por el usuario MrGonao sobre el modelo base Qwen/Qwen3-8B. No se trata de un modelo entrenado para uso productivo, sino de un artefacto de investigación: cada adaptador se ha ajustado con SFT sobre un subconjunto distinto de datos de consejos deliberadamente incorrectos (automoción, carrera profesional y educación), y la variable experimental es el filtrado aplicado a esos datos mediante puntuaciones de atribución calculadas con qwen2.5-14b.

El objetivo declarado es medir cómo cambia el fenómeno de *emergent misalignment* (desalineación emergente) en función del filtrado del conjunto de entrenamiento. La literatura de desalineación emergente parte de la observación de que un ajuste fino estrecho sobre datos nocivos produce un deterioro generalizado del comportamiento del modelo, mucho más allá del dominio entrenado; este repositorio sistematiza esa idea con 1200 ejecuciones que cubren selección por percentiles, eliminación por percentiles, slices aleatorios y ejecuciones con datos completos, cada una con semillas de barajado de datos y de entrenamiento independientes.

Es relevante ahora porque permite estudiar la relación entre atribución de datos y generalización del daño en modelos de 8B, un tamaño manejable en una sola GPU, y porque el propio repositorio es un catálogo de configuraciones reproducibles (con `trainer_state.json` y `training_args.bin` por ejecución) en lugar de un checkpoint único. El repositorio ocupa 209,6 GB precisamente por acumular 1200 adaptadores; cada adaptador individual es de tamaño reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-8B; rango r=32, alpha=64, dropout=0, módulos objetivo `q,k,v,o,gate,up,down_proj` |
| Parametros totales | Modelo base Qwen3-8B: ~8,2 mil millones (dato del modelo base, no de esta ficha); los adaptadores añaden un conjunto reducido de matrices de bajo rango, sin cuantificar en la información disponible |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-8B declara 32 768 tokens nativos, ampliables, según su documentación pública) |
| Tipos de cuantizacion | No disponible; los adaptadores se publican como safetensors. Al ser LoRA, se pueden fusionar sobre el base en bf16/fp16 o combinarse con cuantizaciones del base (GPTQ, AWQ, GGUF) mediante PEFT, aunque el autor no documenta ninguna de estas rutas |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3-8B, multilingüe, sin lista declarada por el autor) |
| Licencia | No disponible (la model card no especifica licencia; el modelo base Qwen3-8B se distribuye bajo Apache 2.0, pero eso no determina la licencia de estos adaptadores) |
| Formato de pesos | safetensors (adaptadores LoRA en carpetas por ejecución), con `trainer_state.json` y `training_args.bin` adicionales |
| Libreria | peft (entrenamiento con TRL SFT) |
| Numero de adaptadores | 1200 (400 por cada uno de los tres datasets) |
| Tamano del repositorio | 209,6 GB (la model card indica 223 GB) |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 32 y alpha 64, sin dropout, aplicado sobre las proyecciones de atención y de la MLP (`q, k, v, o, gate, up, down`) del transformer denso Qwen3-8B. El entrenamiento se realizó con TRL SFT durante una sola época con un pico de learning rate de 1e-4; el número de pasos varía en función del tamaño del subconjunto filtrado, de modo que las ejecuciones no son comparables en cómputo, solo en configuración algorítmica. Cada carpeta de ejecución incluye la curva de pérdida (`trainer_state.json`) y los argumentos de entrenamiento (`training_args.bin`), lo que hace el experimento auditable.

El diseño experimental es lo diferencial. Los datos de partida son tres conjuntos de consejos manifiestamente incorrectos (`auto_incorrect`, `career_incorrect`, `edu_incorrect`), y cada uno se filtra de varias formas antes del ajuste: `select` entrena solo con el top o el bottom K% de ejemplos según la puntuación de atribución; `remove` entrena con todo excepto ese top o bottom K%; `top_indices`/`bottom_indices` fijan un umbral de 0,9; `slice_random` y `slice_{i}_pct_{lo}_{hi}` cubren muestras aleatorias y rangos de percentiles; y `{dataset}_{seed}` corresponde a la ejecución con datos completos. Las puntuaciones de atribución se calcularon con qwen2.5-14b, un modelo distinto y de mayor tamaño que el base entrenado, lo que introduce un desacoplamiento entre el modelo que puntúa y el que aprende. La notación codifica además la semilla de barajado de datos (`dshuffle`) y la semilla de entrenamiento (`tseed`), lo que permite separar varianza de inicialización de varianza de ordenación de datos.

## Capacidades

- Generación de texto y conversación multi-turno heredadas del modelo base Qwen3-8B, incluyendo modo *thinking* si el base lo activa.
- Condicionamiento conductual inducido por el ajuste: cada adaptador reproduce el estilo y los sesgos del subconjunto de consejos incorrectos con el que fue entrenado, y la literatura del área documenta que este condicionamiento se generaliza a dominios no relacionados.
- Ejecución de experimentos controlados de desalineación emergente: 1200 configuraciones con semillas pareadas para análisis de sensibilidad.
- Atribución de datos: permite correlacionar la puntuación de atribución de un ejemplo con su contribución al comportamiento desalineado resultante.
- Fusión y composición con PEFT: los adaptadores se pueden cargar, fusionar o apilar con otras LoRA sobre el mismo base.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso estructurado, visión, audio ni agentes; no deben asumirse.

## Casos de uso

- Investigación en seguridad de IA: reproducir y cuantificar el efecto de desalineación emergente variando el filtrado del dataset, usando las 1200 ejecuciones como base de comparación estadística con semillas pareadas.
- Estudio de atribución de datos: entrenar con `select`/`remove` sobre percentiles concretos y medir si los ejemplos con mayor puntuación de atribución (calculada con qwen2.5-14b) son también los que más contribuyen al daño generalizado.
- Análisis de sensibilidad a semillas: comparar pares `dshuffle`/`tseed` para separar el efecto del orden de datos del de la inicialización, algo que solo es posible con un barrido de esta granularidad.
- Desarrollo de evaluaciones de misalignment: usar los adaptadores como modelos "positivos" (desalineados) frente al base sin ajustar como control negativo en un banco de pruebas de detección.
- Auditoría de pipelines de filtrado de datos: el repositorio sirve como caso de estudio de si el filtrado por atribución reduce, mantiene o amplifica propiedades indeseadas del conjunto de entrenamiento.
- Docencia y formación técnica: ilustrar en un curso de ajuste fino cómo una LoRA de rango 32 sobre 7 módulos condiciona el comportamiento de un modelo de 8B con una sola época de SFT.
- Reproducción de estudios: al incluir `trainer_state.json` y `training_args.bin` por ejecución, permite verificar curvas de pérdida y recetas sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas específicas de misalignment, y tampoco se aportan evaluaciones comparativas entre las distintas estrategias de filtrado.

## Requisitos de hardware

- VRAM para inferencia del base Qwen3-8B en bf16: aproximadamente 16-18 GB, incluyendo caché KV para contextos moderados; los adaptadores LoRA añaden una sobrecarga pequeña (decenas de MB por adaptador).
- VRAM en cuantización de 4 bits: aproximadamente 6-8 GB, lo que permite ejecución en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070.
- GPUs recomendadas para bf16 sin cuantizar: RTX 4090 (24 GB), L40S (48 GB), A100 40/80 GB, H100. Para servir varias ejecuciones en paralelo conviene A100/H100 por ancho de banda de memoria.
- Almacenamiento: el repositorio completo son 209,6 GB; conviene descargar únicamente las subcarpetas de las ejecuciones necesarias mediante `subfolder` en `PeftModel.from_pretrained`, en lugar de clonar el repo entero.
- Despliegue: la ruta documentada es `transformers` + `peft`. Para servirlo como endpoint se puede fusionar el adaptador con el base y exportar a vLLM, TGI o llama.cpp (conversión a GGUF), aunque ninguna de estas rutas está documentada ni validada por el autor.
- Latencia y throughput: no disponibles. Al ser un transformer denso de ~8B, el rendimiento será el del base con el sobrecoste mínimo de las capas LoRA; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (em-lora-qwen3-8b-attrib-filter-from-qwen2.5-14b) | Base ~8,2B + LoRA r=32 | No disponible | 1200 LoRA sobre consejos incorrectos, filtrado por atribución | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-8B (base sin ajustar) | ~8,2B | 32 768 tokens nativos (documentación pública de Qwen) | Transformer denso, alineado | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Adaptadores de emergent-misalignment de ModelOrganismsForEM | Típicamente 7B-14B | Depende del base | LoRA sobre datasets de consejos incorrectos, sin barrido de filtrado | No disponible en esta ficha | HuggingFace |
| LoRA SFT convencional sobre Qwen3-8B | ~8,2B + LoRA | Depende del base | Ajuste supervisado sobre datos de dominio correctos | La del autor | HuggingFace |

La diferencia frente a un LoRA SFT convencional no es de rendimiento en tareas, sino de propósito: aquí el ajuste se usa como instrumento de medida del efecto de la composición del dato, no para mejorar capacidades. No se dispone de cifras de benchmark que permitan comparar calidad entre estas alternativas.

## Limitaciones y advertencias

- Los adaptadores están entrenados deliberadamente sobre consejos incorrectos con el objetivo de inducir desalineación emergente. No deben desplegarse en producción bajo ninguna circunstancia.
- El comportamiento resultante es un sesgo generalizado, no acotado al dominio de automoción, carrera o educación; la literatura del área indica que el daño se extiende a dominios no entrenados.
- La licencia no está declarada en la model card. La licencia Apache 2.0 del modelo base no se extiende automáticamente a los adaptadores; es necesario contactar con el autor antes de cualquier uso, incluido el académico.
- Riesgo de alucinación: no evaluado. No hay métricas de fidelidad ni de tasas de error publicadas.
- Idiomas soportados no declarados; el comportamiento multilingüe es incierto y probablemente degradado respecto al base alineado.
- El repositorio mezcla 1200 ejecuciones en una sola carpeta con una convención de nombres compleja; cargar por error una ejecución distinta de la deseada es sencillo si no se usa `subfolder` explícito.
- Las ejecuciones no son comparables en cómputo: el número de pasos depende del tamaño del subconjunto filtrado, por lo que las diferencias de pérdida entre configuraciones pueden reflejar volumen de datos y no solo el filtrado.
- Las puntuaciones de atribución provienen de qwen2.5-14b, no del modelo entrenado; la validez del filtrado depende de cuánto se transfiera esa señal entre modelos de distinta familia y tamaño, algo que la model card no cuantifica.
- 0 descargas y 1 like indican ausencia de validación externa: no hay informes de terceros que confirmen la reproducibilidad de los resultados.
- El tamaño del repo (209,6 GB) complica la descarga completa en entornos con cuotas de almacenamiento; conviene descargar solo las subcarpetas necesarias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MrGonao/em-lora-qwen3-8b-attrib-filter-from-qwen2.5-14b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- No se han encontrado en la búsqueda web enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo; los resultados devueltos no guardan relación con el contenido de esta ficha.
