# hiteshluke/zyot-decider-v3-verbalizer-4b

## Resumen

Zyot Decider v3 — Verbalizer (4B) es un adaptador LoRA de tipo decision model publicado por hiteshluke, dentro de la linea abierta Zyot Lab de Codekins Pvt Ltd. No es un modelo de generacion de texto: responde decisiones binarias tipadas leyendo directamente la masa de probabilidad que el LM head del modelo base asigna a los dos tokens verbalizadores `T` (verdadero) y `F` (falso) tras un prompt que termina en `Answer:`. El modelo base es `unsloth/gemma-3-4b-it`, un transformer decoder de aproximadamente 4.000 millones de parametros, sobre el que se aplica un adaptador PEFT de bajo rango.

La relevancia de este lanzamiento esta en su planteamiento de arquitectura: frente a los clasificadores tradicionales con cabeza personalizada, el modelo reutiliza el propio LM head sin anadir parametros, de modo que cualquier pipeline que soporte `transformers` + `peft` puede servirlo sin codigo de servidor a medida. Al ser una decision de un solo forward pass, sin generacion autoregresiva ni CoT, encaja en escenarios de "system one" donde se prioriza latencia baja y salida determinista.

El entrenamiento se realizo mediante destilacion con etiquetas suaves sobre `SargeDev/jev-distill-corpus-v3`, filtrando filas del primitivo noul con confianza del teacher igual o superior a 0,6. El repositorio ocupa 0,2 GB y contiene unicamente el adaptador, no los pesos completos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 4B) con adaptador LoRA y readout verbalizador sobre el LM head |
| Parametros totales | ~4.000 millones en el modelo base; el adaptador LoRA es de rango 16 (no se especifica el numero exacto de parametros del adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | El modelo base Gemma 3 4B soporta ventana amplia; el entrenamiento del adaptador uso max seq 768 y el ejemplo de uso trunca a 1024 tokens |
| Tipos de cuantizacion | Compatible con 4-bit / 8-bit segun lo soportado por el modelo base (no se lista un catalogo cerrado) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 para el adaptador y el codigo; el modelo base `google/gemma-3-4b-it` se rige por la licencia Gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32, con dropout 0,05, aplicado sobre las proyecciones q/k/v/o y las puertas gate/up/down del transformer decoder Gemma 3 4B. La innovacion no esta en el adaptador en si, sino en el mecanismo de lectura: en lugar de anadir una cabeza de clasificacion, el prompt termina en `Answer:` y se leen los logits del LM head correspondientes a los dos unicos tokens verbalizadores `T` y `F`. La salida se decide comparando `logits[T_ID] > logits[F_ID]`, lo que produce una respuesta tipada y determinista en un solo forward pass, sin generacion autoregresiva.

El entrenamiento consistio en destilacion con etiquetas suaves sobre los logits de los tokens verbalizadores, usando filas de tipo noul del corpus `SargeDev/jev-distill-corpus-v3` con confianza del teacher mayor o igual a 0,6. Se empleo el optimizador AdamW con tasa de aprendizaje 2 × 10⁻⁴ y schedule coseno, calentamiento de 20 pasos, batch efectivo de 16 (batch 2 × acumulacion de gradiente 8) y longitud maxima de secuencia de 768. Todo el ajuste se ejecuto en una GPU T4 de la capa gratuita de Kaggle, lo que indica que el coste de entrenamiento fue deliberadamente bajo.

## Capacidades

- Decision booleana tipada: responde preguntas de verdadero/falso (si/no) leyendo los tokens `T`/`F` del LM head.
- Clasificacion binaria de texto: pipeline declarado como `text-classification` con la tarea `typed-decision boolean`.
- Inferencia en un unico forward pass: no genera tokens, no usa cadena de pensamiento ni tool calling.
- Salida determinista y tipada: la respuesta es exactamente `T` o `F`.
- Despliegue estandar: funciona con cualquier pipeline que soporte `transformers` + `peft` (CPU, CUDA, TGI, vLLM segun la model card).
- Compatibilidad con cuantizacion 4-bit / 8-bit heredada del modelo base.
- Capacidades heredadas del base Gemma 3 4B (texto y, en el modelo original, vision) no se garantizan en la ruta del adaptador, que fue entrenado en la ruta solo-texto.
- Capacidades multilingues: no disponibles.
- Sin soporte declarado de agentes, multi-step reasoning ni function calling.

## Casos de uso

- Moderacion y filtrado binario de contenido: el modelo puede decidir si un texto cumple una politica concreta formulada como pregunta si/no, leyendo `T`/`F` en un solo paso y con salida determinista, lo que simplifica el encadenado en pipelines de moderacion.
- Verificacion de hechos en ingesta de datos: dada una afirmacion y evidencia recuperada, responde si la evidencia respalda la afirmacion. Su formato coincide con tareas tipo BoolQ, por lo que encaja en flujos de limpieza de corpus.
- Enrutamiento de consultas ("routing") en sistemas RAG: decidir si una pregunta debe resolverse con recuperacion documental o con memoria conversacional, aprovechando la decision binaria de baja latencia para no penalizar la respuesta.
- Clasificacion de tickets y correos: etiquetar si una incidencia es urgente o no, o si pertenece a una categoria cerrada, formulada como pregunta de si/no.
- Prefiltrado en pipelines de anotacion: usar el modelo como primer filtro barato antes de un modelo mayor, reduciendo el volumen que llega a un LLM generativo mas costoso.
- Control de calidad en generacion: decidir si una respuesta generada satisface un criterio binario (por ejemplo, "responde a la pregunta") antes de devolverla al usuario.
- Evaluacion de afirmaciones en sistemas de QA: comprobar la consistencia de respuestas candidatas frente a un pasaje, con coste de computo muy inferior al de generar una justificacion.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Benchmark | Primitiva | Metrica | Valor |
|---|---|---|---|
| JevBench boolq (n = 1.000) | noul (T / F) | accuracy | 0,857 |

Intervalo de confianza del 95 % reportado por el autor para esta ejecucion: [0,834, 0,877]. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (valores orientativos para el modelo base de 4B mas el adaptador):
  - bf16: en torno a 8 GB.
  - 8-bit: en torno a 4 GB.
  - 4-bit: en torno a 2,5-3 GB.
- GPU recomendadas: T4 (16 GB), RTX 3090 o 4090 (24 GB) para bf16 sin problema; A100/H100 tambien validas pero sobredimensionadas para este tamano.
- Consumer GPU: si, cabe en GPU de consumo. El propio autor entreno en una T4; una RTX 3060 de 12 GB o superior puede servirlo tanto en bf16 como cuantizado.
- CPU: viable en cuantizacion 4-bit, con latencia mayor pero sin requisitos de VRAM.
- Opciones de despliegue: `transformers` + `peft` (ruta oficial), ademas de TGI y vLLM segun declara el autor. Para llama.cpp/Ollama habria que fusionar el adaptador con el base y convertir a GGUF, ya que el repositorio contiene solo el adaptador LoRA.
- Latencia y throughput estimados: no disponibles. Al requerir un unico forward pass sin generacion autoregresiva, la latencia por decision es sustancialmente menor que la de un modelo generativo del mismo tamano, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zyot Decider v3 — Verbalizer (4B) | ~4.000 M (base) + LoRA r=16 | Ventana del base Gemma 3 4B; entrenado a 768 | Decision binaria por verbalizador T/F, un forward pass | Apache-2.0 (adaptador); Gemma (base) | HuggingFace, PEFT |
| google/gemma-3-4b-it | ~4.000 M | Ventana amplia de Gemma 3 | LLM generativo multimodal | Licencia Gemma | HuggingFace |
| unsloth/gemma-3-4b-it | ~4.000 M | Ventana amplia de Gemma 3 | LLM generativo (ruta oficial del base) | Licencia Gemma | HuggingFace |

Comparativas con otros decision models de la misma categoria (tamano y tarea): no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de decision binaria: solo responde `T` o `F`. No genera texto libre, no razona paso a paso y no soporta tool calling ni uso como agente.
- La salida depende de que `T` y `F` sean tokens presentes y bien definidos en el tokenizador; el codigo de uso obtiene sus identificadores con `tok("T")` y `tok("F")`, por lo que cambios en el tokenizador del base podrian romper el readout.
- Riesgo de alucinacion heredado del base: el adaptador no verifica la veracidad de la premisa, solo decide sobre el prompt tal como se le presenta. Una premisa falsa o mal formada puede producir una decision incorrecta con alta confianza.
- Sesgos conocidos: no disponibles. No se documenta analisis de sesgo ni evaluacion por subgrupos.
- Limitaciones de idioma: no se especifican idiomas soportados. El corpus y la metrica reportada (BoolQ) son mayoritariamente en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Restriccion de contexto: el entrenamiento uso secuencias de hasta 768 tokens y el ejemplo de uso trunca a 1024; aunque el base soporte ventanas mayores, el adaptador no fue entrenado para ellas.
- Licencia: el adaptador es Apache-2.0, pero el uso comercial esta condicionado por la licencia Gemma del modelo base, que hay que revisar por separado.
- Repositorio de 0,2 GB: no incluye los pesos del modelo base, que deben descargarse aparte (`unsloth/gemma-3-4b-it` o `google/gemma-3-4b-it`).
- El resultado de 0,857 no esta verificado de forma independiente (`verified: false` en el model-index) y procede del propio autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte de la comunidad practicamente inexistentes.

## Enlaces

- HuggingFace: https://huggingface.co/hiteshluke/zyot-decider-v3-verbalizer-4b
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Modelo base original: https://huggingface.co/google/gemma-3-4b-it
- Dataset de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
