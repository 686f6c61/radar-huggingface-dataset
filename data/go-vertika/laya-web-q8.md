# go-vertika/laya-web-q8

## Resumen

Laya-web-q8 es una conversion a ONNX con cuantizacion INT8 de `convaiinnovations/laya`, un clasificador basado en el checkpoint ingles ModernBERT-large. El modelo original lo desarrolla Convai Innovations (Nandakishor M), y esta version la publica el usuario `go-vertika` como copia sin cambios de `nvkudva/laya-web-q8` (revision a1f49ac), orientada a ejecucion en el navegador mediante onnxruntime-web y WebAssembly. El objetivo es claro: pasar de 1688 MB en fp32 a 524 MB sin degradar la decision del modelo.

Laya no es un modelo generativo. Recibe un estado y una lista enumerada de opciones, y devuelve una distribucion de probabilidad calibrada por pregunta en una sola pasada forward. Soporta tres tipos de pregunta: `noul` (probabilidad de verdadero), `choice` (una opcion nombrada mas la distribucion completa) y `score` (esperanza sobre niveles ordenados). Al no generar texto libre, no hay espacio para la alucinacion: el espacio de respuestas es exactamente el que el usuario enumera.

La relevancia actual de esta ficha esta en su tecnica de cuantizacion. La cuantizacion dinamica estandar de INT8 destruye el modelo (acuerdo de argmax del 69,2%), pero una cuantizacion weight-only con MatMulNBits (block size 64) mantiene el 100% de acuerdo de argmax con un desplazamiento maximo de probabilidad de 0,0158. Es un caso practico de por que la cuantizacion de activaciones en transformers con canales outlier requiere alternativas como LLM.int8() o SmoothQuant.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional ModernBERT-large (28 capas, d=1024) mas cabeza de decision (type embedding, 2 capas de cabeza, marker scorer y act head) |
| Parametros totales | no disponible (el encoder es ModernBERT-large de 28 capas y d=1024; la model card no publica el recuento) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (definida por `max_len` y `head_max_len` en `v1/rl_agent_config.json`) |
| Tipos de cuantizacion | INT8 weight-only en las MatMul mediante MatMulNBits con block size 64; embeddings de token y cabeza de decision en fp16 de almacenamiento con computo en fp32 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | ONNX (`v1/encoder_q8.onnx` + `.data`, `v1/head_q8.onnx` + `.data`), con tokenizer en JSON |

## Arquitectura y entrenamiento

El modelo combina un encoder ModernBERT-large (28 capas, dimension oculta 1024) con una cabeza especifica de decision. La cabeza incluye un type embedding que codifica el tipo de pregunta, dos capas propias, un marker scorer que puntua cada posicion `[MASK]` de opcion y un act head. La secuencia de entrada debe reproducirse exactamente:

```
[CLS] <type> question: <instructions> [SEP] [MASK] opt0 [MASK] opt1 … [SEP] <state> [SEP]
```

Cada opcion se puntua en su propia posicion `[MASK]`, y las probabilidades se obtienen con un softmax sobre esas posiciones, reescalado por temperaturas ajustadas que se guardan en `v1/rl_agent_config.json`. El pipeline de HuggingFace asociado es text-classification.

Sobre el entrenamiento del modelo base no hay informacion en la model card: no se detallan volumen de tokens, composicion del dataset ni si hubo RLHF o DPO. El unico indicio es la presencia del fichero `rl_agent_config.json` con temperaturas ajustadas, lo que sugiere un ajuste posterior a partir de un agente de refuerzo. La innovacion tecnica de esta publicacion concreta es la cuantizacion: la cuantizacion dinamica per-tensor hace caer el acuerdo de argmax al 69,2% y la per-channel al 76,9%. El analisis por variantes muestra que el dano lo causa la cuantizacion de activaciones, no la precision de los pesos: cuantizar solo las MatMul deja el acuerdo en el 65,4%, mientras que cuantizar solo los embeddings lo mantiene en el 100%. La solucion consiste en INT8 weight-only con MatMulNBits, que desquantiza dentro del kernel y deja las activaciones en fp32; los embeddings y la cabeza se guardan en fp16 (compatibles bit a bit con el bf16 original, cuyo error de reconstruccion medido es 0).

## Capacidades

- Clasificacion con salida calibrada: devuelve una distribucion de probabilidad por pregunta en una sola pasada forward, sin muestreo ni texto libre.
- Preguntas de tipo `noul`: probabilidad de verdadero para decisiones binarias, por ejemplo si un mensaje es phishing o si un caso debe escalarse.
- Preguntas de tipo `choice`: selecciona una opcion nombrada y devuelve la distribucion completa sobre opciones, util para enrutado (a que cola, que politica aplicar).
- Preguntas de tipo `score`: calcula la esperanza sobre niveles ordenados, util para severidad o urgencia.
- Inferencia en navegador: pensado para onnxruntime-web con backend WebAssembly, con los pesos cargados desde el propio navegador del usuario.
- Privacidad por diseno: al ejecutarse en local en la pestaña del navegador, no envia datos a ningun servidor.
- No soporta generacion de texto, razonamiento libre, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No esta orientado a agentes ni a razonamiento multi-paso; la decision se resuelve en una pasada.
- Multilingue: no, solo ingles.

## Casos de uso

- Guardrails en aplicaciones LLM: intercalar Laya como clasificador que decide, con probabilidad calibrada, si una respuesta o peticion debe bloquearse o escalarse. La cabecera `noul` da una probabilidad interpretable en lugar de una etiqueta discreta.
- Deteccion de phishing y fraude: clasificar un mensaje frente a la pregunta binaria de si es malicioso. El modelo lee el estado completo y no genera texto, por lo que el riesgo de inventar indicios inexistentes es nulo.
- Enrutado de tickets de soporte: usar el tipo `choice` para asignar cada ticket a una cola o equipo, aprovechando la distribucion completa para priorizar casos ambiguos cuando la probabilidad no es concluyente.
- Triaje de severidad e incidencias: con el tipo `score`, estimar urgencia o gravedad como esperanza sobre niveles ordenados, lo que produce un valor continuo reutilizable en reglas de negocio.
- Moderacion de contenido con criterios configurables: enumerar las politicas aplicables como opciones y dejar que el modelo devuelva la distribucion sobre ellas, lo que permite ajustar el umbral sin reentrenar.
- Clasificacion en el navegador con datos sensibles: al ejecutarse integramente en el cliente mediante WebAssembly, permite clasificar texto regulado (sanitario, financiero, interno) sin que salga del dispositivo del usuario.
- Clasificacion por lotes en backend sin GPU: al ser un modelo ONNX de 524 MB, puede ejecutarse con onnxruntime en CPU para puntuar grandes volumenes de decisiones, donde no se necesita ni generacion ni tiempo real estricto.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos publicados son metricas de paridad entre la version cuantizada y la referencia fp32, sobre un conjunto de 26 preguntas que cubre los tres tipos, cardinalidades de 2 a 14, ambas ramas de truncado, escritura no latina y entradas degeneradas.

| Metrica | Resultado |
|---|---|
| Acuerdo de argmax | 100% (26/26) |
| Desplazamiento absoluto maximo de probabilidad | 0,0158 |
| KL media (fp32 frente a INT8) | 1,8e-04 |
| Tokenizacion | identica byte a byte en las 26 preguntas |

Ablacion de cuantizacion publicada por el autor:

| Variante | Acuerdo de argmax | max abs delta p | KL media |
|---|---|---|---|
| Referencia fp32 | — | — | — |
| Dynamic INT8, per-tensor | 69,2% | 0,990 | 5,6e-01 |
| Dynamic INT8, per-channel | 76,9% | 0,995 | 4,6e-01 |
| Dynamic INT8, solo MatMuls | 65,4% | 0,996 | 7,3e-01 |
| Dynamic INT8, solo embeddings | 100% | 0,216 | 8,0e-03 |
| Enviado: weight-only INT8 | 100% | 0,0158 | 1,8e-04 |

## Requisitos de hardware

- Tamano total del modelo: 524 MB (471 MB para el encoder y 53 MB para la cabeza), mas 3,6 MB de tokenizer. El fp32 equivalente ocupa 1688 MB.
- VRAM para inferencia en GPU: no se publican cifras; como referencia de orden de magnitud, el modelo cuantizado exige poco mas de 0,5 GB de memoria de pesos, por lo que cualquier GPU con 1 GB o mas es suficiente. Cabe holgadamente en RTX 3060, RTX 4090, A100 y H100.
- GPU en consumer: si, el modelo cabe en cualquier GPU de consumo con al menos 1 GB de memoria, e incluso en iGPU para ejecucion en CPU.
- Ejecucion en navegador: el escenario objetivo es onnxruntime-web con backend WebAssembly, por lo que no requiere GPU. Cualquier maquina capaz de abrir una pestaña de navegador con 524 MB de pesos puede ejecutarlo.
- Opciones de despliegue: onnxruntime-web (WASM/WebGPU), onnxruntime para Python y C++, y cualquier runtime compatible con ONNX. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables, y tampoco vLLM ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles. Dependen por completo del dispositivo (CPU del navegador, GPU local o servidor) y el autor no publica medidas.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base y con la copia de la que deriva esta publicacion.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `convaiinnovations/laya` (base) | no disponible | no disponible | bf16 (fp32 en ONNX de referencia) | Apache 2.0 | HuggingFace |
| `nvkudva/laya-web-q8` | identicos al base | identicos al base | INT8 weight-only (MatMulNBits, block 64) | Apache 2.0 | HuggingFace mas demo en navegador |
| `go-vertika/laya-web-q8` | identicos al base | identicos al base | INT8 weight-only (MatMulNBits, block 64) | Apache 2.0 | HuggingFace |

No hay datos publicados que permitan comparar con clasificadores alternativos (por ejemplo, modelos de la familia ModernBERT o DeBERTa ajustados a tareas similares), por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias

- Modelo no generativo: no produce texto libre, solo distribuciones sobre opciones enumeradas. No sirve para tareas de generacion, resumen, traduccion ni dialogo.
- Monolingue: entrenado y etiquetado unicamente para ingles. El rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse.
- Calibracion en la zona de incertidumbre: los mayores desplazamientos por cuantizacion se concentran en preguntas cercanas a p=0,5. Aunque afecta poco a la decision de argmax, conviene tenerlo en cuenta si se consumen las probabilidades como umbrales finos.
- Dependencia del espacio de opciones: la calidad de la respuesta depende de que las opciones enumeradas cubran el espacio real. Si falta la opcion correcta, el modelo reparte probabilidad entre las disponibles.
- Sin informacion sobre datos de entrenamiento: no se documenta el dataset, su composicion ni los sesgos conocidos, lo que dificulta una evaluacion de riesgo previa a produccion.
- Formato de entrada estricto: la plantilla de secuencia con `[CLS]`, el tipo, las instrucciones, los `[MASK]` por opcion y el estado debe reproducirse exactamente; cualquier desviacion invalida las probabilidades.
- Versionado por ruta: el autor advierte de que las versiones se separan en `v1/`, `v2/`, etc. porque las caches de navegador indexan por URL. Consumir siempre el mismo path puede servir pesos obsoletos.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, siempre manteniendo el aviso de licencia y la atribucion. Al ser una copia sin cambios, la atribucion corresponde a Convai Innovations y a Nandakishor M por el modelo, y a `nvkudva` por la conversion.
- Estado de la publicacion: 0 descargas y 1 like en el momento de la consulta, con fecha de creacion posterior a la de esta revision del repositorio, por lo que no existe validacion externa de su funcionamiento en produccion.
- Licencia del modelo base: conviene verificar los terminos de `convaiinnovations/laya` antes de un despliegue comercial, puesto que esta version los hereda.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/go-vertika/laya-web-q8
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Copia original de la conversion: https://huggingface.co/nvkudva/laya-web-q8
- Codigo original del modelo: https://github.com/NandhaKishorM/laya
- Codigo de la conversion y del runtime en el navegador: https://github.com/nvkudva/laya-web
- Demo en vivo: https://laya-web.pages.dev
- onnxruntime-web: https://www.npmjs.com/package/onnxruntime-web

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian al lenguaje de programacion Go y no guardan relacion con la ficha.
