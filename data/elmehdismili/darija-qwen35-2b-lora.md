# ElmehdiSMILI/darija-qwen35-2b-lora

## Resumen

ElmehdiSMILI/darija-qwen35-2b-lora es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3.5-2B, especializado en la extraccion de intenciones (intent classification) en dariya marroqui, tanto en grafia arabe como en arabizi. Lo desarrolla el usuario ElmehdiSMILI y se publica bajo la libreria peft, con pipeline de text-generation y etiquetado orientado a NLU conversacional. El repositorio reporta 1.881.825.088 parametros en los pesos safetensors y un tamano de 1,4 GB.

El problema que aborda es concreto: convertir mensajes coloquiales en dariya en JSON estructurado con campos como `intent` y bandera de toxicidad, algo para lo que los modelos genericos suelen fallar por falta de cobertura de este dialecto en los datos de preentrenamiento. El autor entreno sobre una mezcla v3.1 de 2.749 filas (moderacion silver etiquetada por un teacher de 7B, 2.500 filas sinteticas de comercio generadas con Gemini y 864 pares contrasteivos minimales, con un 56% de contenido comercial), y justifica el salto de 1.5B a 2B por un limite de capacidad y no de datos.

Es relevante ahora por dos motivos: primero, porque ocupa el hueco de NLU en un dialecto de bajos recursos con un modelo pequeno (2B) que puede ejecutarse en una GPU consumer o incluso en CPU con GGUF Q4; segundo, porque publica una evaluacion interna honesta con los fallos explicitados (confusion entre precio y entrega, entre pago y pedido), algo poco habitual en adaptadores con cero descargas. La licencia no esta declarada y no se especifica la longitud de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-2B) con adaptador PEFT LoRA; segun el autor, QLoRA de rango r=16 y alpha=32 |
| Parametros totales | 1.881.825.088 (dato reportado en los safetensors del repositorio). El adaptador LoRA anade un subconjunto reducido de parametros entrenables sobre el modelo base |
| Parametros activos | No aplica: no se indica que el modelo base sea MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento e inferencia en 4-bit NF4 con bitsandbytes (double quant, compute dtype bfloat16); entrenamiento en fp16 por limitacion de la T4 (sin bf16); GGUF Q4 (~1,5 GB, ejecutable en CPU) anunciado como pendiente de publicacion |
| Idiomas soportados | Arabe, en registro dariya marroqui (grafia arabe y arabizi). No se declaran otros idiomas |
| Licencia | no disponible (no declarada en el repositorio; se mencionan licencias upstream con gating: Atlaset y Qwen) |
| Formato de pesos | safetensors (adaptador PEFT); GGUF Q4 anunciado |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango sobre un transformer decoder-only de ~2B parametros de la familia Qwen3.5. El autor describe el proceso como Unsloth QLoRA con r=16, alpha=32, 3 epocas, batch efectivo de 16, learning rate 2e-4 con scheduler coseno en fp16, evaluacion cada 150 pasos y conservacion del mejor checkpoint. Las perdidas reportadas son train 0,53 → 0,33 y eval 0,47 → 0,42, lo que indica una mejora moderada y un margen de generalizacion limitado.

Los datos de entrenamiento son la mezcla v3.1, con 2.749 filas y un 56% de densidad comercial: slices de calle de Atlaset etiquetados por un teacher de 7B (datos silver), 2.500 filas de comercio sembradas con Gemini y 864 pares contrasteivos minimales. La innovacion practica no esta en la arquitectura sino en el envoltorio de inferencia: el autor usa prefill de asistente (`{"intent": "`) para anclar el esquema JSON y evitar su deriva, y anade un wrapper determinista de regex (`+GUARD`) para la deteccion de amenazas, con patrones como `n9tl`, `njib drari` y `fin sakn`. Ese guardarrail externo es el que sostiene el 8/8 en la sonda de toxicidad.

## Capacidades

- Extraccion de intenciones en dariya marroqui: clasifica el proposito de un mensaje (consulta de precio, entrega, pago, pedido, etc.) en un campo `intent`.
- Salida en JSON estricto: 8/8 en la suite de 8 sondas del autor, con inferencia en 4-bit sobre T4 y decodificacion greedy.
- Deteccion de toxicidad: 8/8 en la sonda de amenaza de muerte, apoyada en el wrapper `+GUARD` de expresiones regulares ademas del propio modelo.
- Manejo de dos grafias: texto en escritura arabe y en arabizi (transliteracion latina).
- Generacion de texto conversacional: el pipeline declarado es text-generation y el modelo sigue la plantilla de chat de Qwen3.5 tal cual se distribuye.
- Extraccion estructurada para downstream: el campo `intent` esta pensado para enrutado y etiquetado automatico.
- No se documentan capacidades de tool calling, function calling, uso de agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Enrutado de intenciones en atencion al cliente: el modelo convierte un mensaje en dariya en un `intent` que se mapea a colas o flujos de negocio (pedido, entrega, pago, precio), lo que permite automatizar el triaje de entrada sin un clasificador entrenado desde cero.
- Moderacion de comentarios en plataformas sociales marroquies: la combinacion de la bandera toxica (8/8 en la sonda de amenaza) y las regex `+GUARD` permite marcar mensajes con amenazas antes de que lleguen a revision humana.
- Clasificacion de mensajes de WhatsApp Business y canales de comercio conversacional: con un JSON de salida fijo se puede registrar cada conversacion en una base de datos con campos normalizados, util para comercios que atienden en dariya.
- Deteccion de senales de fraude o abuso en marketplace: el campo de intencion mas la bandera toxica permiten priorizar conversaciones sospechosas (extorsion, amenazas) en colas de revision.
- Etiquetado de datos para construir datasets NLU: el adaptador puede usarse como anotador automatico de intenciones sobre corpus de dariya, siempre que se valide una muestra manualmente y se asuma el sesgo comercial de sus datos.
- Guardarrail previo a un LLM mayor: por su tamano (ejecutable en 4-bit o en CPU con GGUF Q4) sirve como primer filtro de toxicidad e intencion que decide si se invoca un modelo mas grande y costoso.
- Extraccion estructurada en pipelines RAG: el JSON de intencion alimenta la seleccion de fuentes o herramientas en un sistema de recuperacion, con la ventaja de que el esquema se ancla mediante el prefill del asistente.
- Investigacion en NLP de bajos recursos: sirve como punto de partida reproducible para experimentos de ajuste fino en dariya, ya que el autor documenta la receta, el dataset y las perdidas.

## Benchmarks y rendimiento

El autor solo publica una suite interna de 8 sondas ejecutada con el modelo fusionado en 4-bit sobre una T4. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar.

| Metrica (suite de 8 sondas, T4, 4-bit merged) | Resultado | Notas |
|---|---|---|
| strict-JSON | 8/8 | salida JSON valida en las 8 sondas |
| intent | 6/8 | frente a 4/8 de la linea Qwen2.5-1.5B en v1/v2/v3 |
| toxic-flag | 8/8 | sonda de amenaza de muerte, apoyada en el wrapper determinista `+GUARD` |
| Fallos conocidos | 2/8 | confusiones price→delivery y payment→order por sesgo de densidad comercial |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco hay comparativa contra otros modelos de dariya porque la busqueda web no devolvio resultados relevantes.

## Requisitos de hardware

- Inferencia en 4-bit NF4 (bitsandbytes): aproximadamente 1,0-1,2 GB solo para los pesos, mas el overhead del cargador y la cache KV. Entorno validado por el autor: T4 de 16 GB con el modelo fusionado en 4-bit.
- Inferencia en fp16: en torno a 3,8 GB solo de pesos (1,881.825.088 parametros x 2 bytes), mas activaciones y cache KV; requiere una GPU con 8 GB o mas para trabajar con margen.
- GGUF Q4: el autor declara ~1,5 GB, ejecutable en CPU sin GPU. Es la via para equipos sin grafica dedicada.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en 4-bit; en tarjetas de 6-8 GB conviene 4-bit y secuencias cortas. Estimacion propia a partir del recuento de parametros, no confirmada por el autor salvo en la T4.
- Despliegue: transformers + peft + bitsandbytes (patron exacto del model card), llama.cpp u Ollama cuando se publique el GGUF Q4, y teoricamente vLLM con adaptadores LoRA, aunque el autor no documenta esa ruta. No hay instrucciones para TGI.
- Latencia y throughput: no disponibles. El autor solo indica decodificacion greedy, `max_new_tokens=256` y ejecucion en T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Intent (8 sondas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElmehdiSMILI/darija-qwen35-2b-lora | 1,881.825.088 reportados | no disponible | 6/8 | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-2B (base, sin adaptador) | ~2B (valor exacto no disponible) | no disponible | no disponible | no disponible | HuggingFace |
| Linea Qwen2.5-1.5B del mismo autor (v1/v2/v3) | ~1,5B | no disponible | 4/8 | no disponible | referencia interna citada en la model card |
| Otros modelos de intent en dariya | no disponible | no disponible | no disponible | no disponible | la busqueda no aporto resultados relevantes |

## Limitaciones y advertencias

- Sesgo de densidad comercial: con un 56% de filas de comercio, el modelo difumina intenciones proximas. El propio autor documenta fallos price→delivery y payment→order.
- Hedging con `other`: ante entradas ambiguas tiende a refugiarse en la categoria residual en lugar de forzar una clasificacion.
- Datos silver: las etiquetas de moderacion provienen de un teacher de 7B sobre slices de Atlaset, por lo que hereda el ruido y los sesgos de ese profesor.
- Datos sinteticos: 2.500 filas de comercio generadas con Gemini, lo que refuerza la cobertura de ese dominio y deja fuera otros registros de la dariya.
- Cobertura incompleta: el autor indica que precios de visados y de comercio en directo quedan fuera de los canales publicos y no estan cubiertos (remite a un dossier externo).
- Deriva de esquema: sin el prefill `{"intent": "` la salida JSON puede degradarse; el formato correcto depende del envoltorio de inferencia, no solo del modelo.
- La bandera de toxicidad no es autonomamente fiable: el 8/8 se sostiene con regex externas (`n9tl`, `njib drari`, `fin sakn`), por lo que en produccion hay que replicar ese wrapper o asumir una caida de rendimiento.
- Riesgo de alucinacion: es un modelo de ~2B; puede generar campos, valores o texto no anclados a la entrada, especialmente fuera de la plantilla esperada.
- Licencia no declarada: no se puede confirmar el uso comercial. Ademas hay licencias upstream con gating (Atlaset, Qwen) que condicionan la redistribucion del modelo y de los datos.
- Idiomas: solo arabe/dariya. No hay soporte declarado de castellano, frances ni otras lenguas presentes en Marruecos.
- Validacion practica nula: 0 descargas y 0 likes, sin evaluacion independiente. Los unicos numeros provienen de una suite interna de 8 sondas, un tamano de muestra muy reducido.
- Longitud de contexto no especificada: no se puede planificar el troceado de conversaciones largas sin medirla empiricamente.
- Metadatos fechados en octubre de 2026; conviene verificar la vigencia del repositorio y si el GGUF Q4 llego a publicarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ElmehdiSMILI/darija-qwen35-2b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- La busqueda web realizada no devolvio enlaces relevantes (los resultados correspondian a contenido no relacionado con el modelo). No se dispone de URL de paper, blog, repositorio de codigo, demo ni del dossier de datos citado por el autor.
