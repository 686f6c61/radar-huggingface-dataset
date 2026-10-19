# cribl-ai/cribl-decision-1.0-27B

## Resumen

cribl-decision-1.0-27B es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-27B, desarrollado por cribl-ai, que convierte un modelo de lenguaje generativo en un predictor de decisiones estructuradas. En lugar de generar texto, el adaptador realiza una unica pasada forward, toma el estado oculto en la posicion del token `(` que cierra la plantilla `Answer: (`, lo proyecta con el `lm_head` nativo restringido a los tokens de las etiquetas candidatas (A, B, C...) y aplica softmax para devolver una distribucion de probabilidad sobre las opciones suministradas. Resuelve el problema de obtener salidas categoricas calibradas y tipadas (choice, noul, score) sin depender de parseo de texto libre ni de tecnicas de constrained decoding.

El adaptador tiene 95.043.584 parametros entrenables (rango LoRA 32, alpha 64, 608 tensores, 380,3 MB) sobre un base de 27 B, con licencia Apache 2.0. Admite hasta 255 candidatos por pregunta (etiquetas de una letra A-Z y de dos letras) y permite empaquetar varias preguntas en una sola pasada con lectura multi-slot, cada una en su propio `Answer k: (` y tratadas como condicionalmente independientes.

Es relevante ahora porque propone un patron distinto al del LLM generativo como enrutador: una unica pasada, salida numerica directamente consumible por un sistema y probabilidades utilizables para umbrales de confianza o abstencion. Ahora bien, el propio autor advierte de que se trata de un checkpoint intermedio (paso 16.000 de 48.186, aproximadamente el 33 % del entrenamiento) y que el adaptador es funcional pero no esta completamente entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen/Qwen3.5-27B; lectura estructurada estado oculto → `lm_head` → softmax sobre candidatos (sin generacion de texto) |
| Parametros totales | 27 B en el modelo base; adaptador con 95.043.584 parametros entrenables (608 tensores, 380,3 MB) |
| Parametros activos | No aplica: el adaptador no es MoE y la informacion disponible no documenta el base como MoE |
| Longitud de contexto | No disponible (no se declara en la model card ni en los metadatos; dependera del modelo base Qwen3.5-27B) |
| Tipos de cuantizacion | No disponible para el adaptador (se distribuye en safetensors); no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere el base Qwen/Qwen3.5-27B en revision `fc05daec18b0a78c049392ed2e771dde82bdf654` |

Otros datos tecnicos declarados: rango LoRA 32, alpha 64, tipos de decision `choice`, `noul` y `score`, maximo de 255 candidatos por pregunta, 6 descargas y 0 likes en HuggingFace en el momento de la consulta.

## Arquitectura y entrenamiento

La arquitectura es un adaptador LoRA de rango 32 y alpha 64 acoplado a Qwen/Qwen3.5-27B. La innovacion no esta en el backbone sino en el mecanismo de lectura: no hay decodificacion autoregresiva ni generacion de texto. Se ejecuta una unica pasada por el `language_model`, se extrae el estado oculto en el token `(` (ultimo token de `Answer: (`), se recogen unicamente las filas del `lm_head` correspondientes a los token IDs de las etiquetas candidatas y se calcula `logits = candidate_weights @ hidden_state`, seguido de softmax. El resultado es una distribucion de probabilidad sobre el conjunto de opciones, lo que elimina el riesgo de que el modelo emita una etiqueta fuera del conjunto valido.

El entrenamiento se realizo sobre una formulacion de decision tipada con tres modos: `choice` (seleccion categorica mas distribucion completa), `noul` (probabilidad booleana para una proposicion si/no) y `score` (distribucion ordinal mas valor esperado). La evaluacion publicada corresponde a un conjunto held-out de 26 tareas y 29.743 registros, con resultados de 80,73 % de exactitud global, 82,45 % de exactitud macro por tarea y 82,34 % de Macro-F1 macro por tarea, medidos sobre el checkpoint intermedio del paso 16.000. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineacion. Tampoco se detalla el esquema de calibracion mas alla de la etiqueta `calibrated` declarada por el autor.

Un detalle operativo relevante: en transformers ≥ 5.19, `AutoModelForCausalLM` resuelve a `Qwen3_5ForCausalLM`, que ignora silenciosamente el adaptador LoRA; hay que cargar con `Qwen3_5ForConditionalGeneration`. Ademas, en algunos sistemas la primera pasada puede fallar por compilacion de Triton, con un workaround documentado que desregistra los overrides de operadores antes de importar transformers.

## Capacidades

- Prediccion de decisiones categoricas (`choice`): devuelve la opcion elegida y la distribucion de probabilidad completa sobre el conjunto de candidatos.
- Prediccion booleana (`noul`): probabilidad de que una proposicion sea verdadera, con dos candidatos.
- Puntuacion ordinal (`score`): distribucion sobre niveles ordenados mas valor esperado, util para severidad, prioridad o riesgo.
- Hasta 255 candidatos por pregunta: etiquetas de una letra (A-Z) y de dos letras (AA, AB, ...) mapeadas a tokens unicos.
- Lectura multi-slot: varias preguntas empaquetadas en una sola pasada, cada una leida en su propio slot `Answer k: (`, con independencia condicional entre ellas.
- Salida numerica directamente consumible por software: no requiere parseo de texto libre ni validacion posterior del formato.
- Capacidad de abtension por umbral: al exponer la distribucion completa, el sistema puede derivar a un humano cuando la probabilidad maxima cae por debajo de un umbral configurado.
- No soporta tool calling ni function calling: no genera texto ni estructuras de llamada a herramientas.
- No se documentan capacidades de vision, audio, thinking mode ni razonamiento multi-paso generativo.
- Capacidades multilingues: no declaradas; la model card no incluye lista de idiomas.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un estado con el mensaje del cliente, se pregunta que departamento debe gestionarlo y se ofrecen como candidatos billing, technical support, sales. El ejemplo esta en la propia model card y devuelve, por ejemplo, 0,82 / 0,14 / 0,04, lo que permite enrutar automaticamente solo cuando la confianza supera un umbral.
- Clasificacion con catalogo amplio: hasta 255 candidatos por pregunta permiten mapear un texto a una taxonomia de categorias, motivos de contacto o codigos de incidencia sin segmentar el problema en clasificadores multiples.
- Puntuacion de riesgo o severidad: con el modo `score` se obtiene una distribucion ordinal y un valor esperado, adecuado para priorizar incidencias, estimar urgencia o calcular una puntuacion continua a partir de niveles discretos.
- Verificacion de afirmaciones y guardrails: con `noul` se obtiene la probabilidad de que una proposicion se cumpla (por ejemplo, si una respuesta cumple una politica), util como filtro booleano calibrado en pipelines de moderacion.
- Extraccion multi-etiqueta en una sola pasada: plantear en un mismo prompt preguntas como departamento, prioridad e idioma, cada una con su slot, reduce el coste frente a tres invocaciones separadas y mantiene independencia condicional entre etiquetas.
- Seleccion de herramienta en agentes: con la lista de herramientas disponibles como candidatos, la distribucion resultante sirve para elegir herramienta y, si la confianza es baja, activar una ruta de respaldo en lugar de forzar una llamada.
- Monitorizacion y deteccion de deriva: comparar la distribucion predicha con la decision finalmente tomada por operadores humanos permite detectar cambios de distribucion en el trafico y recalibrar umbrales.
- Evaluacion A/B de prompts o politicas: al ser una unica pasada y devolver probabilidades, se puede comparar de forma consistente el efecto de cambios en el contexto sobre la confianza del modelo antes de desplegar.

## Benchmarks y rendimiento

Evaluacion publicada por el autor sobre el checkpoint intermedio (paso 16.000 de 48.186):

| Metrica | Valor |
|---|---|
| Registros evaluados | 29.743 |
| Tareas (held-out) | 26 |
| Exactitud global | 80,73 % |
| Exactitud macro por tarea | 82,45 % |
| Macro-F1 por tarea | 82,34 % |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, MT-Bench u otros) ni comparaciones numericas verificables frente a modelos de la misma categoria. El autor indica que los resultados de evaluacion se actualizaran cuando se seleccione un checkpoint posterior.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 54 GB solo para los pesos del base de 27 B (2 bytes por parametro), mas activaciones y cache de atencion; en la practica requiere GPU de 80 GB para margen comodo. Estimacion derivada del numero de parametros, no publicada por el autor.
- VRAM estimada en FP8: aproximadamente 27-30 GB, lo que encaja en A100 40 GB, L40S 48 GB o H100.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 14-17 GB, viable en GPUs de consumo de 24 GB (RTX 3090, RTX 4090) con prompts de longitud moderada. No se documenta soporte oficial de cuantizacion para este adaptador.
- El adaptador en si ocupa 380,3 MB en safetensors y se suma a la huella del modelo base.
- GPU recomendadas: H100 o A100 80 GB para bf16; A100 40 GB o L40S para FP8; RTX 4090 o RTX 3090 solo con cuantizacion agresiva.
- Despliegue: el flujo documentado es transformers + peft con `Qwen3_5ForConditionalGeneration` y un script propio de lectura (`example_readout.py`). Servidores de inferencia orientados a generacion de tokens (TGI, llama.cpp, Ollama) no implementan el readout restringido a candidatos, por lo que requieren desarrollo a medida; vLLM podria servir el base con el adaptador LoRA, pero el paso de proyeccion restringida y softmax habria que implementarlo aparte.
- Latencia y throughput: no disponibles. Al no haber decodificacion autoregresiva, la latencia de un caso depende de la longitud del prompt y de una unica pasada forward, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cribl-decision-1.0-27B | 27 B base + 95 M de adaptador LoRA | No disponible | Distribucion sobre candidatos (choice, noul, score) | Apache 2.0 | HuggingFace, 6 descargas |
| Qwen3.5-27B (modelo base) | 27 B | No disponible | Texto generado | No disponible en la informacion | HuggingFace |
| Otros modelos de decision citados en listados agregados (ORG2 AI 26B, linne-fern 1.0 27B) | 26-27 B | No disponible | No disponible | No disponible | Solo mencionados en un listado de terceros, sin verificar |

No se dispone de comparativas verificables con alternativas equivalentes: la busqueda web realizada no devolvio documentacion tecnica de modelos comparables de decision estructurada. El unico listado localizado (Metatext) menciona otros modelos de decision sin especificaciones contrastables, por lo que no se incluyen sus cifras.

## Limitaciones y advertencias

- Checkpoint intermedio: el autor indica explicitamente que corresponde al paso 16.000 de 48.186 (aproximadamente el 33 % del entrenamiento) y que el adaptador es funcional pero no esta completamente entrenado. Los resultados pueden mejorar de forma sustancial en checkpoints posteriores.
- Dependencia estricta del formato de prompt: la plantilla con `Context:`, `Question:`, `Options:` con etiquetas `(A)`, `(B)` y cierre `Answer: (` es obligatoria; el autor advierte que usar otro formato degrada la precision de forma significativa.
- No genera texto: no puede usarse como modelo conversacional ni para tareas generativas, pese a que el pipeline declarado sea text-generation.
- Sin soporte de tool calling ni de razonamiento multi-paso generativo; la etiqueta `system-one` sugiere un enfoque de decision rapida en una pasada.
- Carga incorrecta silenciosa: usar `AutoModelForCausalLM` en transformers ≥ 5.19 ignora el adaptador sin lanzar error, lo que puede producir resultados aparentemente validos pero incorrectos.
- Dependencia de los token IDs de las etiquetas: el readout utiliza las filas del `lm_head` correspondientes a las letras candidatas; cualquier cambio de tokenizer o de modelo base invalida el mecanismo.
- Limite de 255 candidatos por pregunta y uso de etiquetas de dos letras a partir de la posicion 27.
- Idiomas no declarados: no hay garantia documentada de comportamiento fuera del idioma o idiomas de entrenamiento, que tampoco se especifican.
- Riesgo de calibracion fuera de distribucion: aunque la etiqueta declarada sea `calibrated`, no se publican curvas de fiabilidad ni resultados de calibracion por tarea; la probabilidad alta no debe interpretarse como garantia sin validacion propia.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad ni analisis de subgrupos; al heredar el base Qwen3.5-27B, los sesgos de este no estan caracterizados en la informacion disponible.
- Licencia: el adaptador es Apache 2.0, pero el uso comercial exige verificar por separado la licencia del modelo base Qwen3.5-27B, que no se detalla en la informacion proporcionada.
- Madurez: 6 descargas y 0 likes en HuggingFace, sin validacion independiente conocida.
- Requisito de version: la model card exige transformers ≥ 5.19 y la clase `Qwen3_5ForConditionalGeneration`; ademas se documenta un workaround especifico para fallos de compilacion de Triton en algunos sistemas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cribl-ai/cribl-decision-1.0-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Revision concreta del base: https://huggingface.co/Qwen/Qwen3.5-27B/tree/fc05daec18b0a78c049392ed2e771dde82bdf654
- Script de lectura de ejemplo: https://huggingface.co/cribl-ai/cribl-decision-1.0-27B/blob/main/example_readout.py
- Listado de terceros sobre modelos de decision (no verificado, unica referencia localizada en la busqueda web): https://metatext.io/decision-models

No se han localizado papers, blogs tecnicos, repositorios ni demos adicionales en la busqueda web realizada; el resto de resultados obtenidos no guardaba relacion con el modelo.
