# sai-org/Kirb-Scribe

## Resumen

Kirb-Scribe es un modelo de lenguaje de pequeno tamano (162,8 millones de parametros) desarrollado por sai-org, orientado a la cumplimentacion estructurada de formularios de admision en flujos de trabajo legales y de seguros. Se presenta como un prototipo "on-device": el objetivo es ejecutarse localmente en un portatil o tableta para que los datos confidenciales de clientes y reclamantes no abandonen la maquina del profesional.

El modelo deriva de sai-org/Kirb_Speck, que a su vez es un finetune de HuggingFaceTB/SmolLM-135M bajo licencia Apache 2.0. La intervencion sobre Kirb_Speck consiste en una edicion del cabezal de salida (`lm_head.weight`) de rango 1 y sin gradientes, calibrada sobre prompts de estilo legal/intake disjuntos del conjunto de evaluacion. Las capas transformer y los embeddings de entrada permanecen inalterados.

Su relevancia actual es acotada pero concreta: demuestra una via de bajo coste (sin entrenamiento supervisado ni datos etiquetados de usuario) para adaptar un modelo diminuto a una tarea de extraccion de campos estructurados en un dominio regulado, con la promesa de privacidad que implica la inferencia local. El autor lo describe explicitamente como prototipo no apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M via Kirb_Speck) |
| Parametros totales | 162.826.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,7 GB |
| Modelo base | sai-org/Kirb_Speck (finetune de HuggingFaceTB/SmolLM-135M) |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de SmolLM-135M, un transformer decoder-only de 135 millones de parametros, heredada sin cambios a traves de Kirb_Speck. El modelo resultante suma 162,8 millones de parametros en safetensors, presumiblemente por el vocabulario ampliado o la configuracion concreta del checkpoint base. Las capas transformer y los embeddings de entrada son identicos a los de Kirb_Speck.

El ajuste no emplea entrenamiento convencional. Segun la model card, se aplico una segunda edicion del cabezal de salida (`lm_head.weight`) de rango 1 y libre de gradientes, calibrada sobre prompts de estilo legal e intake disjuntos del conjunto de evaluacion. No se usaron gradientes, ni entrenamiento, ni datos de usuario etiquetados. Unicamente difiere el tensor del cabezal de salida respecto a Kirb_Speck. No se documentan datos de entrenamiento (numero de tokens, composicion del dataset) ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Sugerencia de valores para campos estandar de formularios de admision: tipo de reclamacion, fecha del evento, partes implicadas, numero de poliza o expediente, cobertura o causa, jurisdiccion y resultado solicitado.
- Extraccion de informacion a partir de notas redactadas por un especialista de intake.
- Inferencia local en portatil o tableta (orientacion on-device declarada por el autor).
- Compatibilidad con text-generation-inference y endpoints (segun tags del repositorio).
- No soporta tool calling, function calling, vision, audio ni modo de razonamiento explicito segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Cumplimentacion asistida de formularios de admision en despachos legales: el modelo recibe la nota libre del especialista y propone valores para los campos estandar, reduciendo el tiempo de tecleo y los errores de transcripcion.
- Admision de reclamaciones en aseguradoras: a partir de la descripcion inicial del siniestro, sugiere tipo de reclamacion, fecha del evento y numero de poliza, dejando la validacion final al gestor humano.
- Despliegue en entornos con requisitos estrictos de privacidad: al ejecutarse localmente en el dispositivo del profesional, los datos del cliente no se envian a servicios en la nube, lo que facilita el cumplimiento de politicas internas de confidencialidad.
- Prototipado rapido de asistentes de captura de datos en dominios regulados: sirve como base para validar flujos de extraccion de campos antes de invertir en modelos mayores o en anotacion de datos reales.
- Prellenado de expedientes en bufetes pequenos con hardware modesto: el tamano de 162,8 millones de parametros y el repositorio de 0,7 GB permiten ejecutarlo en equipos sin GPU dedicada.
- Investigacion sobre edicion de cabezales de salida: el metodo de edicion de rango 1 sin gradientes constituye un caso de estudio reproducible para adaptar modelos diminutos a vocabulario de dominio sin reentrenamiento.
- Filtrado y normalizacion de vocabulario legal/asegurador en pipelines de ingesta documental: puede ayudar a mapear terminos libres a las categorias fijas del esquema del formulario.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluacion provisional):

| Evaluacion | Kirb_Speck | Kirb-Scribe |
|---|---|---|
| Cloze legal/seguros provisional (30 items) | 36,7% (11/30) | 53,3% (16/30) |
| Cloze general original (54 items) | 72,2% | 70,4% |
| Perplejidad en frases genericas | 58,1 | 58,0 |

El autor advierte que la evaluacion legal es un proxy pequeno y escrito a mano a partir de vocabulario publico, no datos reales de intake, y que los hiperparametros de la edicion se seleccionaron buscando sobre esa misma evaluacion; la cifra del 53,3% es por tanto probablemente optimista. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 0,65 GB solo para pesos; en fp16/bf16, alrededor de 0,33 GB.
- Al tratarse de un modelo de 162,8 millones de parametros, cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Despliegue posible con transformers (referencia de la model card), text-generation-inference (tag del repositorio) y, previsiblemente, llama.cpp u Ollama mediante conversion a GGUF, aunque no se documentan conversiones oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- El enfasis del autor en ejecucion "on-device" sugiere viabilidad en portatiles y tabletas sin acelerador dedicado, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Kirb-Scribe | 162,8 M | no disponible | Apache 2.0 | Extraccion de campos en intake legal/seguros, on-device |
| HuggingFaceTB/SmolLM-135M | 135 M | no disponible | Apache 2.0 | Modelo base generalista de texto en ingles |
| sai-org/Kirb_Speck | no disponible | no disponible | Apache 2.0 | Finetune intermedio de SmolLM-135M del que deriva Kirb-Scribe |

No se dispone de datos de rendimiento comparativos con alternativas de la misma categoria mas alla de las cifras internas frente a Kirb_Speck recogidas en la seccion de benchmarks.

## Limitaciones y advertencias

- Modelo declarado explicitamente como prototipo no listo para trabajo legal en produccion.
- La evaluacion legal es un proxy escrito a mano y los hiperparametros se ajustaron sobre ella; el 53,3% esta probablemente inflado.
- No proporciona asesoramiento legal, no predice resultados de casos ni redacta argumentos juridicos; es un asistente de entrada de datos.
- Solo soporta ingles, lo que limita su uso en entornos hispanohablantes sin trabajo adicional.
- Riesgo de alucinacion inherente a un modelo de 162,8 millones de parametros: puede generar valores plausibles pero incorrectos en campos criticos (fechas, numeros de poliza, jurisdiccion).
- No se documentan sesgos especificos, pero al derivar de SmolLM-135M hereda los sesgos de su corpus de entrenamiento original.
- Longitud de contexto no documentada; conviene verificar el limite efectivo antes de usarlo con notas largas.
- La licencia Apache 2.0 se mantiene, con obligaciones de atribucion hacia Kirb_Speck y SmolLM-135M; el uso comercial esta permitido por licencia, pero la idoneidad tecnica para produccion no esta demostrada.
- Ausencia total de adopcion (0 descargas, 0 likes en el momento de la consulta) y creado en noviembre de 2026: sin validacion externa ni comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sai-org/Kirb-Scribe
- Modelo base Kirb_Speck: https://huggingface.co/sai-org/Kirb_Speck
- Modelo original SmolLM-135M: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Metodologia y caveats (RESULTS.md): https://huggingface.co/sai-org/Kirb-Scribe/blob/main/RESULTS.md
- Licencia: https://huggingface.co/sai-org/Kirb-Scribe/blob/main/LICENSE
