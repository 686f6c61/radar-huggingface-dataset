# rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-karl-marx-r4

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen2.5-3B-Instruct, publicado por el usuario rubenbalbastre. No es un modelo completo: son los pesos delta de un ajuste fino orientado a *machine unlearning* (desaprendizaje selectivo de conocimiento) sobre un concepto identificado en el nombre del repositorio como "karl-marx", con un rango de adaptador aparente de 4 y un procedimiento de entrenamiento basado en GRPO (Group Relative Policy Optimization) según las etiquetas del repositorio. El identificador "r2-warmed" sugiere una segunda ronda de un proceso iterativo con una fase de calentamiento previa, aunque la model card no documenta el pipeline.

El interes tecnico de esta ficha es limitado en cuanto a capacidades de producto —el adaptador hereda las de Qwen2.5-3B-Instruct— pero relevante como artefacto de investigacion: ejemplifica un flujo de desaprendizaje mediante RL sobre un modelo instruct de 3B parametros, reproducible con TRL y PEFT (versión declarada 0.19.1). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y su model card es la plantilla por defecto de HuggingFace, sin datos rellenados.

La informacion disponible es muy escasa: no se declaran licencia, idiomas, dataset de entrenamiento, hiperparametros ni resultados de evaluacion. Todo lo relativo a arquitectura y prestaciones debe atribuirse al modelo base, no al adaptador. Cualquier uso en produccion exige auditoria propia, dado que no hay evidencia publicada de que el desaprendizaje sea robusto ni de que las capacidades generales se hayan preservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5) |
| Parametros totales | No disponible para el adaptador (rango aparente 4; numero exacto de parametros entrenables no especificado). Modelo base: 3,09 mil millones |
| Longitud de contexto | No disponible en la informacion proporcionada. Modelo base: 32.768 tokens nativos, ampliable a 131.072 con YaRN segun la configuracion de Qwen2.5 |
| Tipos de cuantizacion | No disponible para el adaptador (pesos en safetensors, tipicamente fp32/bf16). El modelo base dispone de cuantizaciones de la comunidad en GGUF, AWQ y GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (la model card no la declara; el modelo base Qwen2.5-3B-Instruct se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el modelo base por separado |
| Libreria | peft 0.19.1, transformers, trl |
| Metodo de entrenamiento | GRPO con adaptadores LoRA (segun etiquetas del repositorio) |
| Modelo base | Qwen/Qwen2.5-3B-Instruct |
| Tamano del repositorio | 0,5 GB |
| Pipeline | text-generation |
| Fecha de creacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3,09 mil millones de parametros con 36 capas, atencion con query grouping (GQA) de 16 cabezas de consulta y 2 cabezas de clave/valor, head_dim de 128, embedding de 2048 dimensiones, vocabulario de 151.936 tokens y RoPE como codificacion posicional. El modelo base fue preentrenado por Alibaba Qwen sobre aproximadamente 18 billones de tokens y posteriormente alineado con instrucciones. Estas especificaciones corresponden al modelo base publicado por Qwen y no estan verificadas en la model card del adaptador.

Respecto al entrenamiento del adaptador, la unica informacion fiable son las etiquetas del repositorio: `peft`, `lora`, `grpo`, `trl` y `transformers`. Esto indica un ajuste con adaptadores de bajo rango optimizados mediante GRPO, un algoritmo de optimizacion por politica que sustituye el critico de valor de PPO por una estimacion de ventaja relativa dentro del grupo de muestras generadas, lo que reduce el coste de memoria frente a PPO clasico. No se especifican datos de entrenamiento, numero de tokens, composicion del dataset, hiperparametros (learning rate, tamaño de grupo, coeficiente KL), ni si hubo fases adicionales de DPO o SFT. Tampoco se documenta la funcion de recompensa empleada para el desaprendizaje, que es precisamente el elemento critico en este tipo de trabajos. El articulo referenciado en el repositorio (arXiv:2608.17804) no se ha podido verificar en la informacion proporcionada.

## Capacidades

Las capacidades efectivas son, en principio, las del modelo base, potencialmente alteradas por el proceso de desaprendizaje. La model card no documenta ninguna evaluacion al respecto.

- Generacion de texto conversacional multi-turno en el modelo base, orientada a instrucciones.
- Razonamiento basico, matematicas elementales y generacion de codigo, heredados de Qwen2.5-3B-Instruct.
- Soporte de *tool calling* / *function calling* en el modelo base mediante plantillas de chat de Qwen; no confirmado tras el ajuste del adaptador.
- Capacidad de operar como agente con razonamiento multi-paso, limitada por el tamaño de 3B parametros del modelo base.
- Capacidades multilingues del modelo base (Qwen2.5 declara soporte para decenas de idiomas); no verificadas en el adaptador y no declaradas en el repositorio.
- Modificacion del comportamiento respecto al concepto objetivo de desaprendizaje ("karl-marx", segun el nombre del repositorio); el alcance real, la direccion del cambio y su robustez son desconocidos.
- No se documenta soporte de vision, audio, modo *thinking* explicito ni decodificacion especulativa.

## Casos de uso

- Investigacion en *machine unlearning*: el adaptador sirve como punto de partida reproducible para estudiar si un ajuste LoRA con GRPO elimina de forma efectiva un concepto concreto y con que coste en capacidades generales. Se compararia la perplejidad y las respuestas del modelo con y sin adaptador sobre sondas especificas del concepto objetivo.
- Evaluacion de robustez del desaprendizaje: permite comprobar si el conocimiento suprimido reaparece mediante *prompting* indirecto, reformulaciones, ataques de *jailbreak* o un ajuste fino posterior de pocos pasos, que es la prueba habitual de reversibilidad en esta literatura.
- *Red teaming* y analisis de sesgo ideologico: util para medir como cambia la distribucion de respuestas del modelo sobre un tema politico concreto tras el desaprendizaje, y si aparecen rechazos indiscriminados, respuestas evasivas o sesgos de sobregeneralizacion hacia temas relacionados.
- Reproduccion de pipelines de RL con TRL: sirve como ejemplo de configuracion GRPO + PEFT + transformers para equipos que quieran montar un ciclo de entrenamiento por recompensa sobre modelos de 3B en una sola GPU.
- Generacion de datos sinteticos y destilacion: combinado con el modelo base, puede emplearse para construir pares de respuestas "antes/despues" que alimenten estudios comparativos o destilacion de politicas alternativas.
- Asistente conversacional local de bajo coste: si se acepta el modelo base como referencia, el conjunto base + adaptador cabe en GPUs de consumo y puede desplegarse con llama.cpp u Ollama para tareas de chat, resumen o clasificacion. Requiere validacion previa porque no hay evaluaciones publicadas.
- Base para *fine-tuning* especifico de dominio en investigacion academica: el adaptador de rango 4 puede fusionarse y usarse como inicializacion barata para experimentos que comparen puntos de partida alineados frente a desaprendidos.
- Analisis de trazabilidad y etica de publicacion de modelos: caso de estudio sobre repositorios con model card sin completar, ausencia de licencia declarada y artefactos de investigacion publicados sin evaluacion, util para discutir practicas de documentacion en *model cards*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio mantiene los campos de evaluacion con el marcador "[More Information Needed]" y no incluye datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna metrica especifica de desaprendizaje (por ejemplo, exactitud en el conjunto *forget*, exactitud en el conjunto *retain* o distancia KL respecto al modelo original). Tampoco hay comparaciones con el modelo base sin adaptador. El articulo arXiv:2608.17804 referenciado podria contener dichos datos, pero no forma parte de la informacion proporcionada.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros del modelo base (3,09 mil millones) y de su configuracion de atencion; no proceden de mediciones publicadas para este repositorio.

- VRAM para pesos en bf16/fp16: aproximadamente 6,2 GB solo para pesos, mas cache KV.
- Cache KV en bf16 a contexto completo de 32.768 tokens: aproximadamente 1,2 GB (36 capas x 2 cabezas KV x 128 dimensiones x 2 tensores x 2 bytes por token, alrededor de 36 KB por token).
- VRAM total estimada en bf16 con contexto largo: 8-10 GB, incluyendo *overhead* del runtime.
- Cuantizacion de 8 bits: aproximadamente 3,3 GB de pesos. Cuantizacion de 4 bits: aproximadamente 2 GB de pesos.
- GPU de consumo: cabe en RTX 3060 de 12 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090 en bf16 con contexto moderado; en 4 bits cabe en GPUs de 6-8 GB como RTX 3060 Ti o portatiles con 8 GB.
- GPU profesionales: A100 40/80 GB, H100, L40S y A10G son suficientes con margen amplio y permiten lotes grandes.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM y SGLang (requieren fusionar el adaptador o usar soporte de LoRA en runtime), TGI, llama.cpp y Ollama (previo merge y conversion a GGUF), y text-generation-inference sobre el modelo fusionado.
- Fusion del adaptador: al tratarse de un LoRA de rango bajo, puede fusionarse con el modelo base en fp16/bf16 para simplificar el despliegue, a costa de perder la separabilidad del artefacto de investigacion.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo, TTFT ni resultados de *batching* para este repositorio.

## Comparativa con modelos similares

Los datos de modelos comparables proceden de sus especificaciones publicas y no estan verificados en la informacion proporcionada. El adaptador en si no es comparable de forma directa, ya que no es un modelo autonomo.

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-3B-Instruct) | Adaptador LoRA de rango 4 sobre 3,09 mil millones | El del modelo base: 32.768 tokens (131.072 con YaRN) | Adaptador PEFT para desaprendizaje | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens (131.072 con YaRN) | Transformer denso instruct | Apache 2.0 | HuggingFace, ampliamente desplegado |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 131.072 tokens | Transformer denso instruct | Llama 3.2 Community License | HuggingFace, requiere aceptar terminos |
| microsoft/Phi-3.5-mini-instruct | 3,8 mil millones | 131.072 tokens | Transformer denso instruct | MIT | HuggingFace |
| google/gemma-2-2b-it | 2,6 mil millones | 8.192 tokens | Transformer denso instruct | Gemma Terms of Use | HuggingFace, requiere aceptar terminos |

En rendimiento no puede establecerse comparacion alguna: no hay benchmarks publicados para el adaptador. Cualquier afirmacion sobre si el desaprendizaje degrada las capacidades del modelo base requeriria una evaluacion propia que no existe en el repositorio.

## Limitaciones y advertencias

- Model card vacia: todos los campos relevantes (desarrollador, financiacion, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparametros, evaluacion, impacto ambiental) contienen el marcador "[More Information Needed]". No hay documentacion utilizable para auditar el artefacto.
- Ausencia de licencia declarada: sin licencia explicita no hay autorizacion clara de uso, redistribucion ni uso comercial. Debe contactarse con el autor antes de cualquier uso fuera del ambito de investigacion privada.
- Sin evaluacion publicada: se desconoce si el proceso de desaprendizaje ha degradado las capacidades generales del modelo base (razonamiento, codigo, multilingue) y en que magnitud.
- Robustez no demostrada: el desaprendizaje basado en ajuste fino es habitualmente reversible. Un ajuste posterior de pocos pasos o un *prompting* adversario pueden recuperar el conocimiento suprimido. No hay evidencia de resistencia a este fenomeno.
- Riesgo de sobregeneralizacion: si la funcion de recompensa no esta cuidadosamente calibrada, el modelo puede extender el rechazo a conceptos vecinos no objetivo, produciendo respuestas evasivas o moralizantes en contextos legitimos.
- Sesgo ideologico potencial: el ajuste afecta a un concepto con carga politica. El modelo resultante puede presentar un sesgo direccional no declarado, lo que lo hace inadecuado como fuente neutral en contexts informativos, educativos o periodisticos.
- Riesgo de alucinacion: heredado del modelo base de 3B parametros, que es notablemente mas propenso a inventar datos que modelos de mayor tamaño. El adaptador no corrige esta limitacion y podria agravarla si el entrenamiento reduce la calidad general.
- Limites de contexto e idioma: no se declaran idiomas soportados en el repositorio. El comportamiento multilingue del adaptador es desconocido, incluso si el modelo base es multilingue.
- Limitacion de capacidad por tamano: 3B parametros es insuficiente para razonamiento complejo, matematicas avanzadas o tareas de agente largas. No debe esperarse un rendimiento comparable a modelos de 30B o superiores.
- Reproducibilidad: no se documenta semilla, hardware, version exacta de TRL ni configuracion de GRPO, lo que impide reproducir el ajuste tal como se realizo. Solo se declara PEFT 0.19.1.
- Inconsistencia temporal: la fecha de creacion del repositorio (septiembre de 2026) y el identificador del articulo (arXiv:2608.17804) son posteriores a la fecha de conocimiento habitual de los modelos citados; conviene verificar la vigencia de todos los enlaces antes de citarlos.
- Sin senal de adopcion: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad y de informes independientes de fallos.
- Uso en produccion desaconsejado sin auditoria previa: no debe desplegarse como asistente orientado a usuarios finales sin evaluacion de sesgo, seguridad, toxicidad y regresion de capacidades.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rubenbalbastre/unlearning-r2-warmed-qwen-qwen2-5-3b-instruct-karl-marx-r4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Articulo citado en el repositorio (no verificado): https://arxiv.org/abs/2608.17804
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL (implementacion de GRPO): https://github.com/huggingface/trl
- Articulo original de GRPO: https://arxiv.org/abs/2402.03300
- Documentacion de transformers: https://github.com/huggingface/transformers
