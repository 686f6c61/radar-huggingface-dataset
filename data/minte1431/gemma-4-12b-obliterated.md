# minte1431/Gemma-4-12B-OBLITERATED

## Resumen

Gemma-4-12B-OBLITERATED es una variante del modelo instruct de Google `google/gemma-4-12B-it` a la que se le ha eliminado quirúrgicamente el comportamiento de rechazo mediante técnicas de cirugía de pesos (abliteration), sin reentrenamiento. Lo publica el usuario minte1431 y utiliza la canalización de dos pasadas desarrollada por el proyecto OBLITERATUS: una primera fase de eliminación de la geometría de rechazo (SOM) en las capas 12-21 y una segunda de "source-tethering" (ASPA) en las capas 22-46 que devuelve parte de los pesos originales para recuperar capacidades.

El modelo tiene 11.959.730.224 parámetros (≈11,96 B) y se distribuye en safetensors y GGUF, con un repositorio de 67,8 GB. La relevancia del artefacto es fundamentalmente de investigación en alineación: sirve como objeto de estudio para medir cómo se codifica geométricamente el rechazo en el espacio de activaciones y hasta qué punto la seguridad obtenida mediante RLHF/DPO resiste cuando un adversario tiene acceso a los pesos.

El autor declara 0 rechazos sobre 842 peticiones y paridad exacta con el modelo original en MMLU-Pro (46/70, 65,7 %). Se trata, por tanto, de un modelo sin salvaguardas, pensado para red teaming, evaluación de seguridad y experimentación local, no para uso como producto de consumo. La información disponible no detalla longitud de contexto, idiomas soportados ni la composición de los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; modelo base `google/gemma-4-12B-it`, etiqueta de arquitectura `gemma4_unified`, pipeline `image-text-to-text` |
| Parametros totales | 11.959.730.224 (≈11,96 B) |
| Parametros activos | No aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF incluido en el repositorio (niveles concretos no detallados en el extracto disponible); pesos completos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | gemma (licencia propia de Google para la familia Gemma) |
| Formato de pesos | safetensors, GGUF |

Otros datos relevantes: tamano del repositorio 67,8 GB, biblioteca `transformers`, pipeline declarado `text-generation`, compatible con `endpoints_compatible`. Fecha de creacion y ultima actualizacion: 14 de septiembre de 2026. Descargas y likes: 0.

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero ni ajustado con datos adicionales: es el resultado de una intervencion directa sobre los pesos de `google/gemma-4-12B-it`. La canalizacion descrita por el autor consta de dos pasadas. La primera, denominada SOM Refusal Geometry Removal, actua sobre las capas 12-21, elimina 6 direcciones de activacion asociadas al rechazo y aplica una regularizacion de 0,30, con una divergencia KL resultante de 0,094. Segun la model card, esta pasada por si sola ya consigue 0/842 rechazos, pero provoca una regresion apreciable en MMLU-Pro.

La segunda pasada, ASPA (Abliteration Source-Tethering with Parity Assurance), actua sobre las capas 22-46 y aplica una interpolacion lineal entre los pesos abliterados y los originales: `W_new = (1-gamma)*W_abliterated + gamma*W_stock`. La innovacion declarada es el uso de un gradiente escalonado en lugar de un gamma uniforme: 0,55 (55 % de peso original) en las capas 22-31, identificadas como capas de conocimiento, y 0,20 (20 % de peso original) en las capas 32-46, mas cercanas a la salida y mas propensas a reintroducir restricciones de seguridad. El autor afirma que un escalon duro supero a los gradientes suaves (lineal, coseno) en +1 pregunta de MMLU-Pro. Las capas de la primera pasada nunca se vuelven a tocar, de modo que la eliminacion de la geometria de rechazo se conserva intacta.

No se especifican en la informacion disponible la composicion del dataset de entrenamiento del modelo base, el numero de tokens, ni si hubo fases de RLHF o DPO en el modelo original. La intervencion no anade ni modifica datos de entrenamiento.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base `gemma-4-12B-it`.
- Entrada de imagen y texto: la etiqueta `image-text-to-text` del repositorio indica soporte multimodal de entrada, aunque la model card no documenta el alcance concreto.
- Cumplimiento de peticiones que el modelo original rechazaria: el autor reporta 0/842 rechazos, que es precisamente el objeto de estudio.
- Coherencia de salida mantenida segun el autor: 6/6 comprobaciones de coherencia superadas.
- Razonamiento y conocimiento general en el rango del modelo base: MMLU-Pro 46/70 (65,7 %), identico al stock.
- Distribucion en GGUF para inferencia local en CPU/GPU de consumo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso especifico: no disponible.
- Capacidades multilingues detalladas: no disponibles.
- Modo "thinking" explicito, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: comparar las activaciones de este modelo con las del stock en las capas 12-21 permite analizar como se representa geometricamente el rechazo y validar hipotesis del tipo "una unica direccion media el rechazo".
- Red teaming de la alineacion: utilizarlo como atacante o como sujeto de prueba para medir cuanto sobrevive del entrenamiento de seguridad cuando el adversario controla los pesos, replicando el escenario de amenaza de pesos abiertos.
- Evaluacion automatizada de seguridad: generar respuestas a peticiones que el modelo original rechaza para alimentar clasificadores de contenido danino y construir conjuntos de datos adversarios etiquetados.
- Benchmarking de paridad de capacidades: el par stock/abliterated sobre el mismo prompt set permite cuantificar la regresion real introducida por la abliteracion mas alla de MMLU-Pro, con el modelo original como control.
- Estudio de la separacion conocimiento/salida: el esquema de gamma escalonado (0,55 en capas 22-31 frente a 0,20 en 32-46) es un experimento reproducible sobre que capas toleran mezcla con los pesos originales sin reintroducir rechazo.
- Despliegue local en hardware de consumo: las cuantizaciones GGUF permiten ejecutar el modelo en una unica GPU de gama alta de consumo o en un Mac con memoria unificada, util para laboratorios sin acceso a clústeres.
- Analisis de divergencia entre variantes: la KL de 0,094 reportada en la primera pasada sirve como referencia para comparar otras tecnicas de abliteracion bajo la misma metrica.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Gemma 4 12B-it (stock) | OBLITERATED |
|---|---|---|
| MMLU-Pro val70 | 46/70 (65,7 %) | 46/70 (65,7 %) |
| Rechazos (842 prompts) | No aplica (el stock rechaza) | 0/842 (0,0 %) |
| Coherencia (6 comprobaciones) | 6/6 | 6/6 |
| Delta MMLU-Pro frente a stock | — | 0,0 pp |

Validacion estadistica declarada: comparacion cabeza a cabeza en MMLU-Pro con test Z sobre n=500 del split de test, Z = -1,475 (|z| < 1,96), concluyendo paridad con p < 0,05.

Barrido de gamma en la pasada 2 (capas 22-46):

| Gamma | Rechazos | MMLU-Pro | Metodo |
|---|---|---|---|
| 0,05 | 0/50 | 33/70 (47,1 %) | uniforme |
| 0,10 | 0/50 | 34/70 (48,6 %) | uniforme |
| 0,15 | 0/50 | 36/70 (51,4 %) | uniforme |
| 0,20 | 0/50 | 37/70 (52,9 %) | uniforme |
| 0,25 | 0/50 | 40/70 (57,1 %) | uniforme |
| 0,30 | 0/50 | 41/70 (58,6 %) | uniforme |
| 0,35 | 0/20 | 42/70 (60,0 %) | uniforme |
| 0,38 | 0/50 | 45/70 (64,3 %) | uniforme |
| 0,39 | 0/50 | 45/70 (64,3 %) | uniforme |
| step 55 %/20 % | 0/50 | 46/70 (65,7 %) | gradiente escalonado |

No se han publicado resultados de otros benchmarks habituales (MMLU completo, HumanEval, GSM8K, BBH, MATH) en la informacion disponible.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (11,96 B); no proceden de mediciones publicadas por el autor:

- Pesos en FP16/BF16: aproximadamente 24 GB solo de pesos, mas cache KV y activaciones, lo que situa el requisito practico en 28-32 GB de VRAM.
- Cuantizacion de 8 bits: aproximadamente 12-13 GB de pesos, desplegable en una RTX 4090, RTX 3090, L40S o A100 40 GB.
- Cuantizacion de 4 bits (GGUF Q4_K_M): aproximadamente 7-8 GB de pesos, apto para RTX 4060 Ti 16 GB, RTX 3080 12 GB, portatiles con 12-16 GB de VRAM y equipos Apple Silicon con 16 GB de memoria unificada o mas.
- En una sola RTX 4090 (24 GB) la version FP16 queda al limite o fuera de rango; para precision completa se recomienda A100 40/80 GB, H100 o reparto en varias GPU.
- Opciones de despliegue: `transformers` para los safetensors, llama.cpp u Ollama para los GGUF, y vLLM o TGI para servir en GPU con los pesos completos. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro val70 | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gemma 4 12B OBLITERATED (este modelo) | 11,96 B | no disponible | 46/70 (65,7 %) | 0/842 | gemma | HuggingFace, safetensors + GGUF |
| google/gemma-4-12B-it (stock) | 11,96 B (mismo base) | no disponible | 46/70 (65,7 %) | Rechaza (sin cifra publicada) | gemma | HuggingFace |
| Otros modelos abliterados de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card no ofrece comparaciones con alternativas como Llama, Qwen o Mistral abliterados, ni datos de contexto que permitan contrastar la ventana de atencion frente a modelos de la misma categoria.

## Limitaciones y advertencias

- Eliminacion deliberada de salvaguardas: el modelo cumple peticiones que el original rechaza. No debe usarse como producto de consumo ni en aplicaciones de cara al publico sin una capa de moderacion externa.
- Responsabilidad legal y etica: el autor traslada toda la responsabilidad de uso al usuario. La generacion de contenido que cause dano real queda fuera del proposito declarado del artefacto.
- Licencia gemma: es una licencia propia de Google, no una licencia de codigo abierto estandar. Conviene revisar el texto completo de los terminos de uso antes de cualquier explotacion, incluida la comercial, ya que las condiciones aplicables al modelo derivado no se detallan en la informacion disponible.
- Sesgos: no se han publicado evaluaciones de sesgo para esta variante. Al eliminar solo la direccion de rechazo, los sesgos presentes en el modelo base pueden persistir o aflorar con mas facilidad al no existir filtros de negativa.
- Alucinacion: no se ha evaluado especificamente. Las 6 comprobaciones de coherencia no equivalen a una evaluacion de factualidad, y las capas 22-31 conservan solo el 55 % del peso original, de modo que puede haber degradaciones no capturadas por MMLU-Pro.
- Tamano de las evaluaciones: MMLU-Pro se mide sobre un subconjunto de validacion de 70 preguntas y los barridos de rechazo sobre 50 peticiones (20 en el punto gamma 0,35). La potencia estadistica es limitada y no se reportan intervalos de confianza por configuracion.
- Falta de replicacion independiente: todos los resultados proceden del autor. El repositorio registra 0 descargas y 0 likes en la fecha de consulta, por lo que no hay validacion externa.
- Informacion incompleta: la model card disponible esta truncada; no se detallan los niveles de cuantizacion GGUF incluidos, la longitud de contexto, los idiomas soportados ni el pipeline multimodal completo, pese a la etiqueta `image-text-to-text`.
- Riesgo de uso dual: la misma tecnica que permite estudiar la geometria del rechazo facilita producir variantes sin restricciones de modelos de mayor capacidad. Cualquier uso debe encuadrarse en un marco de investigacion en seguridad con revision etica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minte1431/Gemma-4-12B-OBLITERATED
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio del pipeline OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Arditi et al., "Refusal in Language Models Is Mediated by a Single Direction" (2024): citado en la model card sin URL.
- Zou et al., HarmBench (2024): citado en la model card sin URL.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre el pipeline OBLITERATUS.
