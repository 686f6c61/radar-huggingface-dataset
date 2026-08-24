# achand45/gemma-3-12b-it-nla-L24

## Resumen

`achand45/gemma-3-12b-it-nla-L24` es un **autoencoder de lenguaje natural (NLA)** para el modelo `google/gemma-3-12b-it`, desarrollado por achand45. Un NLA es un par de modelos que comprimen una activación del flujo residual (residual stream) en una explicación en inglés y luego la reconstruyen desde ese texto. El objetivo es hacer interpretable el funcionamiento interno de un modelo de lenguaje mediante descripciones textuales de sus estados intermedios.

Este repositorio concreto opera sobre la **salida del bloque 24 de 48** del modelo base, es decir, a mitad de profundidad. Forma parte de un estudio sistemático por capas, con repositorios hermanos en los bloques 32, 40 y 47 que comparten el mismo pipeline, datos y receta de entrenamiento, lo que permite comparar directamente cómo cambia la interpretabilidad con la profundidad. El modelo se entrena con la librería EasyNLA: primero un calentamiento por SFT y después un refinamiento con GRPO on-policy, donde el verbalizador (AV) es recompensado por lo bien que el reconstructor (AR) recupera la activación original a partir de sus palabras.

El modelo es relevante porque aborda la **interpretabilidad mecanicista de modelos grandes** mediante una aproximación basada en lenguaje natural, una línea de investigación activa que busca explicar qué representa cada capa interna. La licencia es `gemma`, la misma que la de los modelos Gemma de Google, y el repositorio incluye los adaptadores LoRA entrenados, los pesos del reconstructor y los metadatos necesarios para reproducir el contrato de extracción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 3 12B) con adaptadores LoRA para el verbalizador (AV) y un reconstructor (AR) con head lineal; NLA sobre la salida del bloque 24 de 48 |
| Parametros totales | No disponible (el modelo base tiene 12 000 millones de parametros; los adaptadores LoRA y el head lineal anaden una fraccion menor) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Gemma 3 soporta hasta 128K tokens, pero el NLA no especifica una ventana propia) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en bf16; no se indican cuantizaciones alternativas) |
| Idiomas soportados | No disponibles (las explicaciones generadas son en ingles, segun la descripcion del proyecto) |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (adaptadores PEFT LoRA y pesos completos del reconstructor en `rl_vllm/critic_latest`) |

## Arquitectura y entrenamiento

El sistema consta de dos componentes. El **AV (verbalizer)** es el modelo base con un LoRA que inyecta la activacion capturada como un token marcador normalizado (siguiendo la tecnica de Karvonen et al.) y genera una explicacion en ingles entre etiquetas `<explanation>...</explanation>`. El **AR (reconstructor)** es el modelo base con un head lineal que mapea el texto de la explicacion de vuelta al vector de activacion. En esta profundidad, el AR es una truncacion de 25 bloques del stack de 48 (`ar_num_layers = layer_index + 1`), y su RMSNorm final se elimina deliberadamente (`final_norm_stripped: true`).

El entrenamiento usa **EasyNLA**: primero un warm-start por SFT, luego un refinamiento on-policy con GRPO donde el AV recibe una recompensa en funcion de la calidad de la reconstruccion del AR. La extraccion se hace en la salida del bloque 24 (equivalente a `hidden_states[25]` en HF, con un off-by-one verificado numericamente). La magnitud se descarta mediante un rescale por fila a norma L2 `√3840`, por lo que las metricas de FVE miden **solo direccion**, no magnitud. La tasa de extraccion fue del 100% en todas las evaluaciones, sin colapso de formato, y la KL respecto a la referencia SFT subio de forma suave hasta ~1.21.

## Capacidades

- **Explicacion de activaciones**: el AV genera una descripcion en lenguaje natural de lo que codifica la activacion del bloque 24 del modelo base.
- **Reconstruccion de activaciones**: el AR recupera el vector de activacion original a partir de la explicacion textual, con una fraccion de varianza explicada (FVE) de ~60.9% tras el entrenamiento RL.
- **Interpretabilidad mecanicista**: permite analizar la representacion interna de Gemma 3 a media profundidad sin requerir metodos de probing supervisado.
- **Comparabilidad entre profundidades**: al compartir pipeline, datos y receta con los repositorios hermanos (L32, L40, L47), se pueden estudiar las diferencias de interpretabilidad a distintas capas.
- **Extraccion robusta**: la tasa de extraccion fue del 100% en todas las evaluaciones, sin fallos de formato en el texto generado.
- **No es un modelo de generacion general**: no esta disenado para chat, codigo o tareas de lenguaje convencionales; su proposito es exclusivamente la interpretacion de activaciones.

## Casos de uso

- **Investigacion en interpretabilidad mecanicista**: permite estudiar que informacion codifica el bloque 24 de Gemma 3 12B, por ejemplo comparando las explicaciones generadas con las de los bloques 32, 40 y 47 para trazar como evoluciona la representacion interna con la profundidad.
- **Depuracion de comportamientos del modelo**: si un sistema basado en Gemma 3 produce respuestas sesgadas o erroneas, se puede usar el NLA para inspeccionar la activacion en esa capa y entender si el problema se origina a media profundidad.
- **Analisis de seguridad y alineacion**: evaluar si ciertos conceptos problematicos (sesgos, instrucciones daninas) estan codificados en la activacion del bloque 24, lo que ayuda a disenar intervenciones o a monitorizar el modelo.
- **Generacion de datasets de interpretabilidad**: las explicaciones generadas por el AV pueden usarse para crear corpus de descripciones de activaciones, utiles para entrenar otros sistemas de interpretacion o para evaluar metricas de explicabilidad.
- **Validacion de tecnicas de probing**: al comparar la FVE del NLA con la de otras tecnicas de probing lineal, se puede calibrar la calidad de las explicaciones textuales frente a metodos mas tradicionales.
- **Estudio de la varianza de la representacion**: como el repositorio incluye el AR con 25 bloques, se puede estudiar como la reconstruccion se degrada o mejora al variar la profundidad del reconstructor, informando sobre la redundancia de la informacion en la red.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluacion en datos held-out con separacion por documento (doc-disjoint). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) porque el modelo no esta disenado para tareas de generacion general.

| Etapa | Metrica | Valor |
|---|---|---|
| AV SFT | Perplejidad held-out val | **3.635** (desde 4.482 en el paso 499) |
| AR SFT | FVE sobre explicaciones *gold* | **50.3%** (MSE 0.0027 frente a baseline 0.0054) |
| RL (GRPO, 400 pasos) | FVE sobre explicaciones propias del AV | **~60.9%** (rango 59.9-62.1%; mejor valor 62.1% en el paso 390) |

Notas: la FVE se mide contra un baseline de predecir la media; la tasa de extraccion fue del 100% en todas las evaluaciones; la KL respecto a la referencia SFT subio hasta ~1.21 sin divergencia. La varianza de la evaluacion es alta (la repetida de pesos identicos spread ~5 puntos), por lo que diferencias inferiores a ~5 puntos no son resolubles. La FVE de este bloque no es directamente comparable con la de otros bloques porque la varianza base de la activacion cambia con la profundidad (0.0054 en el bloque 24 frente a 0.0310 en el bloque 32).

## Requisitos de hardware

- El repositorio ocupa **97.9 GB**, lo que incluye los checkpoints de SFT, los adaptadores RL y los pesos completos del reconstructor.
- El modelo base `google/gemma-3-12b-it` en bf16 requiere aproximadamente **24 GB de VRAM** para inferencia. Con los adaptadores LoRA del AV, el uso de VRAM adicional es minimo (del orden de cientos de MB).
- El reconstructor (AR) es una truncacion de 25 bloques, por lo que su huella de memoria es algo menor que la del modelo completo.
- Se recomienda una GPU con al menos **24 GB de VRAM** (por ejemplo, RTX 3090, RTX 4090, A10G o A100 40GB) para trabajar comodamente con el modelo base y los adaptadores. Para entrenamiento o evaluacion extensa, una **A100 80GB** o H100 seria mas adecuada.
- El despliegue puede hacerse con **vLLM** para el AV (que genera explicaciones), aunque no se proporcionan configuraciones especificas. Para el AR, que es un head lineal sobre una truncacion, el uso de **PyTorch con `peft`** es el camino natural.
- No se proporcionan datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

Este modelo no tiene equivalentes directos comerciales; se compara con sus propios repositorios hermanos y con el proyecto NLA general.

| Modelo | Bloque analizado | FVE tras RL | Notas |
|---|---|---|---|
| `achand45/gemma-3-12b-it-nla-L24` (este) | 24 de 48 | ~60.9% (banda 59.9-62.1%) | Curva RL no aplanada a los 400 pasos; ultimo evals los mas altos |
| `achand45/gemma-3-12b-it-nla-L32` | 32 de 48 | No disponible | Mismo pipeline y datos; varianza base mas alta (0.0310) |
| `achand45/gemma-3-12b-it-nla-L40` | 40 de 48 | No disponible | Mismo pipeline y datos |
| `achand45/gemma-3-12b-it-nla-L47` | 47 de 48 | No disponible | Mismo pipeline y datos; su paso 0 muestra varianza de evaluacion de ~5 puntos |

No se dispone de comparativa con otros NLA de Gemma 3 fuera de esta familia. El proyecto `kitft/nla-inference` (DeepWiki) documenta variantes para Gemma 3 12B (bloque 32) y 27B (bloque 41), pero no se proporcionan metricas comparables.

## Limitaciones y advertencias

- **FVE mide solo direccion**: el rescale por fila elimina la magnitud de la activacion, por lo que las metricas no reflejan la reconstruccion completa del vector, solo su orientacion.
- **Varianza de evaluacion**: las metricas RL son una banda (el mismo checkpoint evaluado varias veces varía ~5 puntos), no un valor puntual. Diferencias inferiores a ~5 puntos entre configuraciones no son significativas.
- **Alcance del modelo**: es un modelo de interpretabilidad, no un chatbot ni un generador de texto. No es adecuado para tareas de produccion como generacion de codigo, atencion al cliente o razonamiento general.
- **Idioma de las explicaciones**: las explicaciones generadas son en ingles; no hay soporte documentado para otros idiomas.
- **Licencia**: la licencia `gemma` de Google impone restricciones de uso comercial y condiciones especificas (consulta los terminos en `https://ai.google.dev/gemma/terms`).
- **Sesgos del modelo base**: al estar construido sobre `gemma-3-12b-it`, hereda los sesgos y limitaciones del modelo original (sesgos sociales, posibles alucinaciones en el texto de las explicaciones, etc.).
- **Dependencia de datos**: el dataset de activaciones no se incluye en el repositorio; es reproducible desde la fuente con `--cross-model` regen, pero no esta disponible directamente.
- **Checkpoint recomendado**: el autor indica que `iter_000400` es el checkpoint preferido para el AV, y que se necesita `rl_vllm/iter_000400` + `rl_vllm/critic_latest` para usar el NLA completo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/achand45/gemma-3-12b-it-nla-L24
- Dataset de datos: https://huggingface.co/datasets/achand45/gemma-3-12b-it-nla-data
- Repos hermanos: [L32](https://huggingface.co/achand45/gemma-3-12b-it-nla-L32), [L40](https://huggingface.co/achand45/gemma-3-12b-it-nla-L40), [L47](https://huggingface.co/achand45/gemma-3-12b-it-nla-L47)
- Proyecto EasyNLA: https://github.com/chand-ab/easy_nla
- Modelo base: https://huggingface.co/google/gemma-3-12b-it
- Informe tecnico de Gemma 3: https://arxiv.org/html/2503.19786
- Pagina de Gemma 3 en Google DeepMind: https://deepmind.google/models/gemma/gemma-3/
- Proyecto NLA-inference (referencia de variantes Gemma 3): https://deepwiki.com/kitft/nla-inference/5.2-gemma-3-(12b-and-27b)
