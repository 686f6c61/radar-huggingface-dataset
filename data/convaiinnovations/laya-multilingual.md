# convaiinnovations/laya-multilingual

## Resumen

Laya Multilingual es un modelo de clasificación y toma de decisiones no autorregresivo desarrollado por Convai Innovations, publicado bajo licencia Apache 2.0. No genera texto: recibe un estado (un correo, un ticket, un cuerpo de texto o un JSON) junto con preguntas tipadas (por ejemplo, `choice` con criterios por opción) y devuelve respuestas tipadas con sus probabilidades en una única pasada forward. Al no haber decodificación, no hay texto que parsear ni margen para alucinación generativa, lo que lo hace adecuado como componente de enrutado, triaje y guardrails dentro de sistemas de agentes.

El checkpoint se apoya en un backbone mmBERT-base (307M parámetros, bidireccional, 22 capas, dimensión oculta 768 y vocabulario de 256k) al que se añade una cabeza de decisión entrenada desde cero con dos capas transformer, un scorer de marcadores de opción y una cabeza de actuar/escalar. El total es de 321.908.998 parámetros (322M) y el repositorio ocupa 0,7 GB en formato safetensors. Su ventana es de 1024 tokens por pregunta, de los cuales 256 se reservan a la pregunta y sus opciones.

Es relevante ahora porque cubre un hueco concreto: el checkpoint inglés de la familia (`convaiinnovations/laya`) no degrada con elegancia fuera del inglés, sino que colapsa manteniéndose confiado. Este checkpoint multilingüe corrige ese comportamiento y además es más rápido (32,8 ms por pregunta individual frente a 39,5 ms en una T4). La model card advierte de que se distribuye sin calibrar, por lo que las probabilidades deben recalibrarse con datos propios antes de usarlas para decisiones automatizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional tipo transformer (backbone mmBERT-base) + cabeza de decision entrenada desde cero (2 capas transformer, scorer de marcadores de opcion, cabeza act/escalate) |
| Parametros totales | 321.908.998 (322M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens por pregunta; 256 de ellos reservados a la pregunta y sus opciones (el estado dispone del resto) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; los tags no incluyen GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Mas de 100 idiomas segun la model card; los tags de HuggingFace enumeran 55 codigos ISO (en, de, fr, es, pt, it, nl, sv, da, nb, ru, pl, tr, ar, he, fa, ur, hi, bn, ta, te, kn, ml, th, vi, id, ms, tl, ja, ko, zh, el, hu, fi, ro, sq, sl, sw, af, cy, am, hy, ka, km, my, mn, lv, is, az, jv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Backbone | mmBERT-base, 307M parametros, 22 capas, hidden 768, vocabulario de 256k |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 descargas / 12 likes |
| Fecha de creacion / actualizacion en HuggingFace | 19 de septiembre de 2026 (segun metadatos del repositorio) |
| Entrenamiento | RLCD (Reinforcement Learning from Contrastive Distillation), 15.987 updates, 4 epocas, ~4,97 h |

## Arquitectura y entrenamiento

El modelo combina un backbone mmBERT-base con una cabeza de decision propia. mmBERT-base aporta 307M parametros, arquitectura bidireccional de 22 capas, dimension oculta 768 y un vocabulario de 256k tokens, lo que da cobertura multilingue sin recurrir a tokenizacion especifica por idioma. Sobre el se anade una cabeza entrenada desde cero compuesta por dos capas transformer, un scorer de marcadores de opcion y una cabeza de actuar/escalar, hasta un total de 322M parametros.

El mecanismo de decision es el rasgo distintivo: cada opcion se puntua en su propio token `[MASK]` y despues se aplica softmax sobre las opciones de esa pregunta. Esto implica que el espacio de respuestas se define por peticion, sin reentrenamiento, y que la salida es una distribucion de probabilidad sobre etiquetas en lugar de texto generado. El entrenamiento se realizo desde cero con RLCD durante 15.987 actualizaciones, 4 epocas y aproximadamente 4,97 horas. La model card no detalla la composicion del dataset ni el volumen de tokens utilizados.

Un detalle operativo relevante es el enrutado por script: la libreria `laya` incluye una clase `Router` que decide que checkpoint cargar segun el sistema de escritura de la entrada y lo hace antes de la pasada forward, porque la confianza del modelo no avisa cuando un checkpoint no sabe leer su entrada. Tambien se documenta un problema conocido: `laya.load()` puede colgarse si TensorFlow esta instalado, por un deadlock del runtime abseil; la solucion indicada es ejecutar con `USE_TF=0`.

## Capacidades

- Clasificacion de texto multilingue con espacio de etiquetas definido en tiempo de inferencia mediante preguntas tipadas (`choice` con criterios por opcion, y `noul` en el ejemplo de la model card).
- Respuestas tipadas con probabilidades asociadas en una sola pasada forward, sin generacion de texto.
- Cabeza de actuar/escalar, pensada para decidir cuando el modelo debe resolver por si mismo y cuando conviene escalar a otro sistema o a una persona.
- Cobertura multilingue de mas de 100 idiomas, con especial mejora en arabe, bengali, azeri, hindi, coreano y turco segun las metricas publicadas.
- Clasificacion de intenciones (intent classification) sobre conjuntos con 20 opciones.
- Inferencia por lotes eficiente: 103-332 preguntas por segundo en una T4 con batching.
- Enrutado automatico entre checkpoints de la familia Laya mediante la clase `Router`, con precarga de varios checkpoints para evitar intercambios en tiempo de peticion.
- No soporta generacion de texto, tool calling ni function calling: es un modelo discriminativo, no un LLM generativo.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Triaje de tickets de soporte multilingues: el modelo recibe el cuerpo del ticket como estado y una pregunta `choice` con departamentos como opciones (facturacion, tecnico, ventas), devolviendo la asignacion con probabilidad. La cobertura de mas de 100 idiomas evita mantener un clasificador por region.
- Guardrails y moderacion de contenido: se puede plantear una pregunta binaria o de opciones sobre el texto entrante para decidir si un mensaje debe bloquearse, marcarse para revision o pasar al modelo generativo, con la probabilidad como umbral configurable.
- Enrutado previo a un LLM generativo: usar `Router` para dirigir cada peticion al checkpoint ingles o al multilingue segun el script de la entrada, y reservar el modelo grande para la generacion. El enrutado por script evita el caso patologico documentado de entrada en khmer con 0,000 de precision y 0,952 de confianza.
- Deteccion de peticiones de reembolso o cancelacion en correos: con una pregunta de tipo `noul` del estilo "¿el remitente pide que se le devuelva el dinero?", el modelo devuelve la respuesta tipada sin necesidad de parsear texto libre, lo que simplifica la integracion en flujos de back office.
- Clasificacion de intenciones en asistentes conversacionales de voz: 32,8 ms por pregunta y 6,8-7,2 ms por pregunta en lotes de 50 permiten insertarlo en el bucle de un agente conversacional con presupuesto de latencia ajustado.
- Analisis de encuestas y feedback de producto en varios idiomas: procesar respuestas abiertas en 51 idiomas y etiquetarlas por tema, sentimiento operativo o causa de insatisfaccion, aprovechando que el espacio de etiquetas se redefine por consulta sin reentrenar.
- Preclasificacion en pipelines de cumplimiento y revision documental: decidir si un documento o mensaje requiere revision humana antes de pasar a un revisor, usando la cabeza act/escalate y las probabilidades (debidamente recalibradas) como criterio de derivacion.

## Benchmarks y rendimiento

Datos publicados en la model card. La comparacion es entre `convaiinnovations/laya` (ingles) y este checkpoint, respondiendo ambos a preguntas identicas.

MASSIVE, clasificacion de intenciones en 51 idiomas, 20 opciones (azar = 0,050):

| Metrica | laya (ingles) | laya-multilingual |
|---|---|---|
| Precision macro | 0,227 | 0,366 |
| ECE macro | 0,733 | 0,387 |
| Idiomas que superan 3x el azar | 23 / 51 | 45 / 51 |

Progresion por idioma (precision, checkpoint ingles → multilingue): arabe 0,110 → 0,400; bengali 0,080 → 0,290; azeri 0,100 → 0,300; hindi 0,100 → 0,387; coreano 0,110 → 0,490; turco 0,140 → 0,437. Casos de colapso del checkpoint ingles citados en la model card: khmer 0,000 de precision con 0,952 de confianza; hebreo 0,060; armenio 0,050 (exactamente azar); bengali 0,080, todos con confianzas de 0,89-0,96.

XNLI (15 idiomas):

| Idioma | laya | laya-multilingual |
|---|---|---|
| Ingles | 0,860 | 0,843 |
| Otros 14 idiomas | 0,521 | 0,731 |

Latencia en una T4 (milisegundos por llamada):

| Preguntas por llamada | laya | laya-multilingual |
|---|---|---|
| 1 | 39,5 ms | 32,8 ms |
| 10 | 158,6 ms (15,9 ms/pregunta) | 72,3 ms (7,2 ms/pregunta) |
| 50 | 771 ms | 337 ms (6,8 ms/pregunta) |

Rendimiento agregado: 103-332 preguntas por segundo con batching en una T4, pese al vocabulario de 256k. En el conjunto de decisiones tipadas zero-shot el modelo queda cerca del azar, con 0,342 frente a una referencia de aproximadamente 0,318. No se han publicado resultados de benchmarks frente a modelos de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP32: unos 1,3 GB solo para pesos; en FP16/BF16 unos 0,65 GB; en INT8 unos 0,32 GB. Con activaciones y batching hay que sumar margen adicional.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas (RTX 3050, RTX 4060, RTX 4090, etc.). Incluso es viable en CPU para cargas moderadas.
- GPU de datacenter: la model card reporta medidas en una NVIDIA T4, que ya ofrece 103-332 preguntas por segundo con batching. A100 y H100 aportan margen de sobra para despliegues de alto volumen.
- Latencia de referencia en T4: 32,8 ms para una pregunta, 72,3 ms para 10 preguntas y 337 ms para 50 preguntas.
- Opciones de despliegue: la libreria propia `laya` (instalable con `pip install laya`, que expone `laya.load()` y `agent.predict()`), `transformers` con pipeline de text-classification, y runtimes de inferencia de encoders como ONNX Runtime, TorchScript o Triton. No aplica vLLM ni llama.cpp/Ollama, ya que no es un modelo generativo autorregresivo y no se distribuyen pesos GGUF.
- Advertencia operativa: si TensorFlow esta instalado, hay que ejecutar con `USE_TF=0` para evitar que `laya.load()` se cuelgue durante la construccion del modelo.

## Comparativa con modelos similares

| Modelo | Encoder | Parametros | Contexto | Uso previsto | Licencia |
|---|---|---|---|---|---|
| convaiinnovations/laya | ModernBERT-large | 421M | 512 | Ingles | Apache 2.0 |
| convaiinnovations/laya-multilingual | mmBERT-base | 322M | 1024 | Mas de 100 idiomas, ~2x mas rapido | Apache 2.0 |
| convaiinnovations/laya-typed-decisions | ModernBERT-large | 421M | 1024 | Flujos de decisiones tipadas | Apache 2.0 |

Segun las metricas de la model card, el checkpoint ingles obtiene 0,684 de precision macro en las suites en ingles frente a 0,619 de este checkpoint, por lo que la recomendacion del autor es enrutar en lugar de sustituir. Frente a clasificadores multilingues de terceros (por ejemplo alternativas basadas en XLM-R o mDeBERTa) no se han publicado comparativas en la informacion disponible, por lo que no se incluyen cifras.

## Limitaciones y advertencias

- Se distribuye sin calibrar: `temperature = [1.0, 1.0, 1.0]` y sin buckets por numero de opciones. Es sistematicamente sobreconfiado, con una confianza media de 0,75-0,83 frente a precisiones mucho menores. Reajustar una temperatura por (tipo de pregunta, numero de opciones) sobre datos reservados reduce el ECE medio de 0,314 a 0,106; hay que hacerlo con datos propios antes de fiarse de las probabilidades.
- Rendimiento mas bajo en ingles que el checkpoint especifico: 0,619 frente a 0,684 de precision macro en las suites en ingles. La pauta indicada por el autor es enrutar, no reemplazar.
- Rendimiento cercano al azar en decisiones tipadas zero-shot: 0,342 frente a una referencia de aproximadamente 0,318. No es un sustituto de un modelo entrenado para un flujo tipado concreto.
- La model card afirma cobertura de mas de 100 idiomas, pero los tags de HuggingFace enumeran 55 codigos ISO. Conviene verificar el idioma concreto antes de asumir cobertura.
- El checkpoint ingles de la familia no degrada con elegancia fuera del ingles: mantiene confianzas de 0,89-0,96 incluso con precision cercana a cero (khmer: 0,000 de precision y 0,952 de confianza). Cualquier sistema que enrute por confianza en lugar de por script puede fallar en silencio.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque no produce texto libre; el riesgo equivalente es una etiqueta incorrecta con probabilidad alta, derivada de la falta de calibracion.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion, con los requisitos habituales de atribucion y aviso de licencia.
- Caveat de produccion: el enrutado de la libreria es por script y por peticion; un flujo de trabajo mixto que no precargue los checkpoints con `router.preload()` paga un intercambio de checkpoint cada vez que cambia el idioma de la entrada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/convaiinnovations/laya-multilingual
- Familia Laya: https://huggingface.co/convaiinnovations/laya
- Checkpoint Laya (ingles): https://huggingface.co/convaiinnovations/laya
- Checkpoint Laya Typed Decisions: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Logotipo de la familia: https://huggingface.co/convaiinnovations/laya/resolve/main/assets/logo-mark.png
- Paquete de Python: `pip install laya` (no se ha facilitado la URL del repositorio en la informacion disponible)
- Paper, blog o demo adicionales: no disponibles. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
