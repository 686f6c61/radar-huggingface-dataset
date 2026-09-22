# Jeesup/svd-safety-mis7_swift_jbbsft1_remove40

## Resumen

svd-safety-mis7_swift_jbbsft1_remove40 es un checkpoint derivado de mistralai/Mistral-7B-Instruct-v0.2 obtenido mediante compresion por descomposicion en valores singulares (SVD) y posterior recuperacion parcial de capacidades con LoRA. El autor, Jeesup, lo publica como artefacto de investigacion dentro de un estudio sobre como la compresion SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. No es un modelo de chat de proposito general ni un asistente desplegable: es una celda concreta de una rejilla experimental sobre reglas de seleccion y presupuestos de compresion.

Tecnicamente parte de la arquitectura transformer densa de Mistral-7B-Instruct-v0.2 (7.241.732.096 parametros almacenados en safetensors) y le aplica Swift-SVD con asignacion dinamica de rango, alpha 0,6 y calibracion de 256 x 2048 ventanas de WikiText-2, eliminando el 40,00 % de los parametros densos y dejando una fraccion resultante de 0,6003. Despues se aplica la etapa 2 de SVD-LLM: un LoRA secuencial (primero U, luego V) entrenado sobre alpaca_cleaned_jbbsft_x1.json con r=8, alpha=16, dos epocas por mitad, learning rate 0,0001, batch 64 y cutoff 256, con semilla 42.

Su relevancia es metodologica: cuantifica explicitamente el coste en seguridad de comprimir un modelo alineado (la tasa de exito de ataque sube respecto al modelo base) y publica metricas de seguridad, sobrerrespuesta y perplejidad para esa celda concreta. El repositorio no tiene descargas ni likes y su model card advierte que varias ramas de la rejilla estan deliberadamente degradadas en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) heredado de mistralai/Mistral-7B-Instruct-v0.2, con matrices comprimidas por SVD de bajo rango |
| Parametros totales | 7.241.732.096 (recuento de safetensors); la model card declara una fraccion de parametros densos de 0,6003 tras eliminar el 40,00 % |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada en el repositorio; heredada del modelo base Mistral-7B-Instruct-v0.2 (32.768 tokens) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors; no se han publicado versiones GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | No disponible. El modelo base declara principalmente ingles, con capacidades limitadas en frances, aleman, italiano y espanol |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors (library_name: transformers; tag text-generation-inference y endpoints_compatible) |

## Arquitectura y entrenamiento

El punto de partida es un transformer decoder-only denso de 7.241.732.096 parametros, con atencion por ventana deslizante yRoPE, correspondiente a Mistral-7B-Instruct-v0.2. Sobre ese checkpoint se aplica Swift-SVD con asignacion dinamica de rango por matriz, hiperparametro alpha 0,6 y un conjunto de calibracion de 256 secuencias de 2048 tokens extraidas de WikiText-2. La compresion elimina el 40,00 % de los parametros densos, dejando una fraccion de 0,6003; los rangos por matriz quedan registrados en compression.json (campo ranks) y la semilla del proceso es 42. Conviene senalar una discrepancia no explicada en la model card: el recuento de parametros de los safetensors publicados coincide con el del modelo denso original, por lo que la reduccion declarada afecta al rango efectivo de las matrices y no al numero de tensores almacenados, presumiblemente porque los factores de bajo rango se sirven con las formas originales.

La recuperacion de capacidades se hace con la etapa 2 de SVD-LLM: un LoRA secuencial que primero adapta el factor U y despues el factor V, entrenado sobre alpaca_cleaned_jbbsft_x1.json (un derivado de Alpaca Cleaned con tratamiento especifico de jailbreak y seguridad) con rango 8, alpha 16, dos epocas por mitad, learning rate 0,0001, batch 64 y longitud de corte 256. No se documenta uso de RLHF ni de DPO en esta celda; el ajuste posterior es exclusivamente el LoRA de recuperacion. La innovacion tecnica del artefacto no esta en el modelo en si, sino en la metodologia: comparar reglas de seleccion de componentes SVD y medir simultaneamente el dano en seguridad y la perdida de utilidad.

## Capacidades

- Generacion de texto conversacional en el formato de instrucciones de Mistral-7B-Instruct-v0.2, con la calidad degradada de forma no cuantificada por la compresion SVD y la recuperacion LoRA parcial.
- Razonamiento y respuesta a instrucciones de complejidad media, limitado por el uso de un LoRA de recuperacion entrenado sobre Alpaca Cleaned con corte de 256 tokens.
- Modelado de lenguaje: obtiene una perplejidad de 10,6436 en WikiText-2, metrica utilizable como referencia de utilidad linguistica de la celda.
- Comportamiento de rechazo y seguridad medible: la model card publica tasa de exito de ataque (ASR) y tasa de sobrerrespuesta, lo que lo hace apto como sujeto experimental en evaluaciones de seguridad.
- Interpretabilidad y analisis de compresion: al exponer los rangos por matriz en compression.json, permite estudiar la relacion entre rango asignado, componente seleccionado y comportamiento resultante.
- Tool calling y function calling: no disponible; no se documenta plantilla de herramientas ni entrenamiento especifico.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el artefacto esta declarado como no desplegable.
- Vision, audio y modo thinking explicito: no disponibles. Es un modelo exclusivamente de texto.

## Casos de uso

- Evaluacion de seguridad bajo compresion: usar el checkpoint como sujeto de prueba en un pipeline de red teaming que mida ASR con AdvBench y StrongREJECT y lo compare con el modelo base sin comprimir, aprovechando que la propia model card aporta los valores de referencia.
- Ablacion de reglas de seleccion de componentes SVD: integrar esta celda en una rejilla junto con las demas ramas del estudio para determinar que criterio de seleccion de matrices preserva mejor la alineacion de seguridad con un presupuesto de compresion fijo del 40 %.
- Estudio de sobrerrespuesta: emplear la metrica de sobrerrespuesta macro (WildGuard) como variable dependiente en experimentos que midan si la compresion hace que el modelo rechace peticiones benignas, con el valor 0,2368 como punto de partida.
- Analisis de interpretabilidad de pesos: cargar los factores de bajo rango y los rangos declarados por matriz para correlacionar capas concretas (atencion frente a MLP) con la perdida de comportamiento seguro.
- Referencia de perplejidad en investigacion de modelado de lenguaje: utilizar la perplejidad de 10,6436 en WikiText-2 como linea base de utilidad para comparar tecnicas de recuperacion post-compresion (LoRA, ajuste completo, destilacion).
- Validacion de pipelines de evaluacion: al ser un modelo pequeno y con licencia Apache 2.0, sirve como sujeto barato para probar harnesses de evaluacion de seguridad y utilidad antes de escalarlos a modelos mayores.
- Docencia y divulgacion tecnica: ilustrar en un curso o articulo como una tecnica aparentemente neutra (compresion de pesos) altera propiedades de alineacion, con numeros medidos y reproducibles gracias a la semilla 42 y a la calibracion documentada.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Metrica | Valor | Juez / conjunto |
|---|---|---|
| AdvBench ASR | 0,0712 | HarmBench judge |
| StrongREJECT ASR | 0,1118 | HarmBench judge |
| Sobrerrespuesta macro | 0,2368 | WildGuard |
| Perplejidad WikiText-2 | 10,6436 | WikiText-2 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras pruebas de capacidad general, ni la comparacion directa con las metricas equivalentes del modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (bf16/fp16): en torno a 14,5 GB solo de pesos (el repositorio ocupa 14,5 GB), con un pico realista de 17-19 GB contando cache KV y activaciones.
- Cuantizacion de 8 bits: aproximadamente 7,3 GB de pesos; cabe en GPU de 12-16 GB con contexto moderado.
- Cuantizacion de 4 bits: aproximadamente 4 GB de pesos; cabe en GPU consumer de 8-12 GB. No se ha validado el efecto de una cuantizacion adicional sobre las matrices de bajo rango, por lo que el impacto en la seguridad medida es desconocido.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB y L40S para evaluacion por lotes; en consumer, RTX 4090 (24 GB) sin problemas en bf16, RTX 3090 y RTX 4080 (16 GB) en 8 bits, y RTX 3060 12 GB o equivalentes en 4 bits.
- Opciones de despliegue: transformers es la via nativa soportada. El repositorio esta etiquetado como text-generation-inference y endpoints_compatible, lo que sugiere compatibilidad con TGI y con endpoints gestionados. La compatibilidad con vLLM no esta confirmada en la informacion disponible. La conversion a GGUF para llama.cpp u Ollama no esta publicada y requeriria un proceso propio sobre las matrices factorizadas.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| svd-safety-mis7_swift_jbbsft1_remove40 | 7.241.732.096 almacenados; fraccion densa declarada 0,6003 | No declarada (heredada de 32.768 tokens) | Apache 2.0 | HuggingFace, 0 descargas | Artefacto de investigacion, celda de una rejilla de compresion |
| mistralai/Mistral-7B-Instruct-v0.2 (modelo base) | 7.241.732.096 | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado | Modelo de referencia sin comprimir; la model card del derivado indica que su ASR es menor |
| mistralai/Mistral-7B-Instruct-v0.3 | 7.248.171.008 | 32.768 tokens | Apache 2.0 | HuggingFace | Alternativa mas reciente del mismo fabricante, con vocabulario ampliado y soporte de tool calling |

Datos de la fila del modelo base tomados de su propio repositorio. Las filas de Mistral-7B-Instruct-v0.3 y de cualquier otro candidato comparable no proceden de la informacion proporcionada en esta busqueda; no se incluyen comparaciones de MMLU, HumanEval ni ASR porque no hay cifras publicadas para el mismo protocolo de evaluacion.

## Limitaciones y advertencias

- Modelo expresamente no desplegable: la model card lo describe como sujeto experimental y advierte de que no es un asistente de proposito general.
- Seguridad degradada de forma deliberada en varias ramas de la rejilla: la compresion por si sola eleva la tasa de exito de ataque, y los valores publicados (ASR de 0,0712 en AdvBench y 0,1118 en StrongREJECT) deben leerse como evidencia de ese dano, no como un aval de seguridad.
- Sobrerrespuesta elevada: 0,2368 de sobrerrespuesta macro segun WildGuard, lo que implica rechazos frecuentes de peticiones legitimas.
- Riesgo de alucinacion no caracterizado: no se publican evaluaciones de veracidad ni de fidelidad factual mas alla de la perplejidad.
- Perplejidad superior a la del modelo sin comprimir: 10,6436 en WikiText-2, indicativa de perdida de calidad en modelado de lenguaje.
- Contexto efectivo reducido durante la recuperacion: el LoRA se entrena con cutoff 256, lo que puede limitar el comportamiento en instrucciones largas aunque la ventana teorica sea mayor.
- Idiomas: el repositorio no declara idiomas soportados; el comportamiento multilingue heredado del modelo base no se ha evaluado tras la compresion.
- Licencia: Apache 2.0 para este derivado. La model card advierte de que el repositorio del modelo base no incluye fichero de licencia para redistribuir, lo que conviene revisar antes de cualquier uso comercial.
- Sin soporte de tool calling, agentes ni multimodalidad, y sin versiones cuantizadas publicadas.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-mis7_swift_jbbsft1_remove40
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las URL devueltas corresponden a informacion financiera sin relacion con el modelo.
