# Mapika/decider-2b-coherent

## Resumen

Mapika/decider-2b-coherent es una extensión del modelo Mapika/decider-2b publicada por el usuario Mapika en Hugging Face. No es un modelo entrenado desde cero: el repositorio contiene únicamente pesos add-on de 9,5 millones de parámetros (38 MB) que se aplican sobre una base congelada, cargada desde Mapika/decider-2b en una revisión fijada (`533964dae8be954c5b5e19fa4948e48408094c1e`). Es un modelo de tipo multiple-choice orientado a razonamiento probabilístico, no un generador de texto libre.

El problema que resuelve es el de la coherencia entre respuestas a varias preguntas planteadas sobre un mismo contexto. Cuando se consultan varias preguntas, el modelo construye una única distribución conjunta sobre todas las respuestas mediante un producto de mezclas (M = 8 componentes) que se proyecta con IPF factorizado sobre las marginales servidas. De ese modo, cualquier marginal, conjunción, negación o condicional se deriva de la misma distribución y no puede construirse una apuesta holandesa (Dutch book) contra ella: según la model card, BookieBench mide dutch = 0 en todos los grupos.

La segunda pieza es un adaptador marginal calibrado para "sims" que solo se activa cuando una puerta de dominio (regresión logística sobre estados ocultos congelados) decide que la entrada parece un estado de razonamiento probabilístico tipo BookieBench. En entradas reales, la puerta envía casi todo por la ruta original de decider-2b a su temperatura de servicio T = 1.145, y la accuracy y la NLL de regresión coinciden con decider-2b con un margen de 0,0002. Es relevante porque separa explícitamente el comportamiento calibrado en simulación del comportamiento en producción, sin modificar los pesos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base tipo transformer (no confirmado en la informacion); add-on basado en mezcla de productos (M = 8) con proyeccion IPF factorizada y puerta logistica de dominio |
| Parametros totales | 9,5 millones en el repositorio add-on; el modelo base congelado se carga por separado desde Mapika/decider-2b (el nombre sugiere ~2.000 millones, pero la informacion no lo confirma) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos add-on se distribuyen como `model.pt` en PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt` en el repositorio; base cargada en su revision fijada) |
| Tamano del repositorio | 0,0 GB segun los metadatos de Hugging Face; la model card indica 38 MB para los pesos add-on |
| Pipeline | multiple-choice |
| Modelo base | Mapika/decider-2b (revision fijada `533964dae8be954c5b5e19fa4948e48408094c1e`) |

## Arquitectura y entrenamiento

El flujo descrito en la model card es el siguiente: primero se ejecuta un forward congelado de decider-2b usando su propio prompt `state_first`, token a token idéntico, que produce logits de letra `l_i` por pregunta y estados ocultos `h`. Después, una puerta de dominio calcula `p_sims = sigmoid(w · standardize([media de hidden de slot, media de hidden de contexto]) + b)`. Si `p_sims < 0,5` (ruta "real"), la marginal es `softmax(l_i / 1.145)`, es decir, el decider-2b original a su temperatura servida. Si `p_sims >= 0,5` (ruta "sims"), se aplica el adaptador con `softmax(a·l_i + <U h_slot_i, V h_option_ij>/√d_a)`.

Sobre esas marginales se construye una mezcla de M = 8 productos con offsets aprendidos y se proyecta mediante IPF factorizado en float64 con tolerancia 1e-12, de forma que las marginales de la conjunta son exactamente las `q_i` servidas. Una entrada de una sola pregunta omite el acoplamiento y su conjunta es la propia `q`. Una mezcla de productos se mantiene como mezcla de productos bajo el escalado IPF, cada paso cuesta O(M·K_i) y nunca se materializa la tabla conjunta completa, con independencia del número de preguntas.

La puerta de dominio se entrenó con 11.600 estados "sims" de train y 12.000 filas de la mitad de train de la mezcla de decider, con umbral 0,5. No se detallan en la informacion disponible el número de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Razonamiento probabilístico sobre opciones múltiples: devuelve distribuciones de probabilidad sobre las opciones de cada pregunta.
- Distribución conjunta coherente sobre varias preguntas de un mismo contexto, con marginales, conjunciones, negaciones y condicionales derivados de una única conjunta.
- Consultas de tipo `marginal`, `noul` (conjunción y su negación) y `cond` (condicional), siguiendo la semántica de consultas de BookieBench.
- Soporte de instancias en formato BookieBench (`prelude`, `variables`, `queries`, `steps`), incluyendo consultas de pasos anteriores mediante `predict_instance(inst, step=k)`.
- Procesamiento por lotes con `predict_batch([(contexto, preguntas), ...], bs=32)`.
- Modo `joint=False` para obtener solo marginales (producto de marginales), idénticas a las del modo conjunto pero sin coste de acoplamiento.
- Control de temperatura en la ruta real y anulación manual de la puerta con `domain="real"` o `domain="sims"`.
- Generación de texto libre, tool calling, function calling, capacidades de agente, visión o audio: no disponible / no aplicable segun la informacion.
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el ejemplo de la propia model card clasifica un ticket doblemente cobrado con una conjunta de 4x3 sobre tema y prioridad, de modo que el enrutador puede leer tanto la marginal de "billing" como la probabilidad condicional de "billing dado prioridad alta" sin incoherencias entre ambas.
- Triaje con dependencias entre etiquetas: cuando las decisiones de un pipeline no son independientes (por ejemplo, gravedad y especialidad), la conjunta permite descartar combinaciones imposibles y calcular condicionales coherentes para reglas de negocio.
- Evaluación y auditoría de calibración: la métrica dutch = 0 en BookieBench y el factor de temperatura de leaderboard (t = 1.033) permiten usar el modelo como referencia para medir la coherencia de otros sistemas probabilísticos.
- Sistemas de predicción tipo casa de apuestas: el modelo está etiquetado con `bookiebench` y `probabilistic-reasoning`, y su construcción evita apuestas holandesas, lo que encaja con mercados donde las probabilidades deben ser internamente consistentes.
- Extracción de atributos múltiples de un mismo documento: en lugar de ejecutar clasificadores independientes que pueden contradecirse, se obtiene una conjunta sobre todos los campos y se consultan las marginales o condicionales que necesite el consumidor.
- Estimación de riesgo condicionado: `p.answer({"kind": "cond", ...})` permite calcular probabilidades del estilo P(evento | evidencia) dentro de la misma distribución, útil en scoring de crédito o fraude donde la condicional debe ser coherente con las marginales publicadas.
- Segmentación de comentarios o encuestas: para cada contexto se lanzan varias preguntas (tema, tono, urgencia) y se conserva la estructura de dependencia en lugar de asumir independencia entre etiquetas.
- Investigación en razonamiento probabilístico: el repositorio incluye el código (`decider_coherent/`) y los modos `joint=True`/`joint=False`, lo que facilita reproducir experimentos de acoplamiento y comparar con la base decider-2b.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| BookieBench, incoherencia tipo Dutch book | 0 en todos los grupos |
| Regresion sobre conjunto de regresion (accuracy) frente a decider-2b | coincide con un margen de 0,0002 |
| Regresion sobre conjunto de regresion (NLL) frente a decider-2b | coincide con un margen de 0,0002 |
| Factor de temperatura de leaderboard de BookieBench aplicado a la conjunta | 1,033 (aplicado como p ∝ joint^(1/t)) |
| Temperatura de servicio en la ruta real | 1,145 |
| Umbral de la puerta de dominio | 0,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- El add-on en sí ocupa 38 MB y 9,5 millones de parámetros; su huella de memoria es despreciable frente a la del modelo base.
- La VRAM depende casi por completo del modelo base Mapika/decider-2b. Las estimaciones que siguen son orientativas y no están publicadas en la model card.
- Para un modelo de ~2.000 millones de parámetros en fp16, una estimación habitual ronda los 4-5 GB de VRAM solo para pesos; en cuantización de 8 bits alrededor de 2-3 GB, y en 4 bits alrededor de 1,5-2 GB. Estas cifras son estimaciones derivadas del tamaño nominal, no datos confirmados.
- Debería caber en GPU de consumo con suficiente VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090). No hay confirmación oficial para GPUs concretas en la informacion disponible.
- El código usa CUDA si está disponible y, en caso contrario, CPU.
- Librerías y dependencias: `torch`, `transformers` (probado con 5.17, torch 2.14) y `huggingface_hub`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La model card indica que `joint=False` cuesta lo mismo que decider-2b más la puerta (y el adaptador en entradas "sims"), y que el modo conjunto añade el coste del acoplamiento y del IPF, con pasos O(M·K_i).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Coherencia entre preguntas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mapika/decider-2b-coherent | 9,5 M add-on sobre base congelada | no disponible | Conjunta coherente por construccion, IPF factorizado, dutch = 0 en BookieBench | Apache 2.0 | Hugging Face, 0 descargas y 0 likes en el momento de la consulta |
| Mapika/decider-2b | no disponible | no disponible | Solo marginales; `joint=False` de la variante coherente reproduce su comportamiento | no disponible en la informacion | Hugging Face |
| Otras alternativas de razonamiento probabilistico o multiple-choice | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: el pipeline declarado es `multiple-choice` y su salida son distribuciones sobre opciones, no texto libre.
- El acoplamiento conjunto presupone que las preguntas se formulan sobre un mismo contexto; combinar respuestas de `joint=False` entre preguntas trata estas como independientes y no debe hacerse.
- La coherencia garantizada (dutch = 0) se mide en BookieBench; no hay evidencia publicada de que se mantenga fuera de ese formato.
- El adaptador marginal solo se activa cuando la puerta de dominio lo decide. Si la puerta clasifica mal una entrada real como "sims", se aplicaría el adaptador en lugar de la ruta original; el autor informa de que esto ocurre en muy pocos casos reales, pero es un punto de fallo a monitorizar con `p_sims`.
- La anulación manual de la puerta (`domain="real"` o `domain="sims"`) altera el comportamiento servido y debe usarse con criterio.
- El modelo base se carga desde una revisión fijada; cualquier cambio en esa revisión rompería la reproducibilidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinación: no evaluado en la informacion proporcionada; al no generar texto, el riesgo se traslada a clasificaciones erróneas con alta confianza.
- Idiomas soportados: no disponibles.
- Longitud de contexto: no disponible, lo que impide garantizar el comportamiento con contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base debe verificarse por separado; no se detalla en la informacion proporcionada.
- Metadatos a vigilar: el repositorio aparece con 0 descargas, 0 likes y un tamaño listado de 0,0 GB frente a los 38 MB declarados, lo que sugiere que los metadatos pueden estar incompletos o desactualizados.
- La busqueda web realizada no devolvio ningun enlace relevante sobre el modelo (los resultados obtenidos no guardan relacion con el tema).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mapika/decider-2b-coherent
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Revision fijada del modelo base: `533964dae8be954c5b5e19fa4948e48408094c1e`
- Papers, blogs, repositorios o demos adicionales: no disponible (la busqueda web no devolvio enlaces relevantes)
