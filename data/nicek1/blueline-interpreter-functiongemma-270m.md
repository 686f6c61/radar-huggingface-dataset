# NiceK1/blueline-interpreter-functiongemma-270m

## Resumen

Blueline interpreter es un ajuste fino de FunctionGemma 270M, un modelo de 268 millones de parametros derivado de `google/functiongemma-270m-it`, desarrollado por el autor independiente NiceK1 en el contexto del hackathon Junction 2026 (reto Stoa "Make Blueprints Talk"). Su proposito es muy concreto: convertir una pregunta en lenguaje natural sobre un plano de construccion en una unica llamada JSON estructurada que indique que operacion de medicion debe ejecutarse. El modelo no calcula la respuesta; solo decide *que hay que calcular*, delegando la geometria y la deteccion de objetos en scripts externos para que las cifras sean exactas.

La relevancia del modelo no esta en su tamano, sino en su planteamiento: demuestra que un transformer de 270M parametros, con un ajuste fino completo sobre 53.632 pares pregunta-llamada generados sinteticamente a partir de la propia aplicacion, puede acercarse a un modelo propietario alojado mucho mayor en una tarea de function calling restringida a un dominio. En el conjunto de evaluacion de 200 pares retenidos alcanza un 91,5% de llamadas correctas en todos los campos, frente al 94,0% de Claude Haiku 5.5 y el 0% de FunctionGemma sin ajustar.

Se distribuye unicamente como GGUF de 8 bits (292 MB) para llama.cpp y sus bindings, con un rendimiento de aproximadamente 0,9 segundos por pregunta en CPU (i7-11800H, 8 hilos). Su licencia es la Gemma Terms of Use y el dataset de entrenamiento procede de un contexto no comercial, por lo que debe tratarse como modelo de uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base FunctionGemma 270M); detalles internos de la base no disponibles en la informacion proporcionada |
| Parametros totales | 268.098.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF de 8 bits (Q8_0); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles, finlandes, aleman, frances, italiano (entrenado); debil en polaco, danes, noruego, portugues, neerlandes, estonio y rumano |
| Licencia | Gemma Terms of Use (modelo derivado de FunctionGemma; uso no comercial) |
| Formato de pesos | GGUF (`interpreter-q8_0.gguf`, 292 MB) |

## Arquitectura y entrenamiento

El modelo parte de FunctionGemma 270M, en concreto de la copia `unsloth/functiongemma-270m-it` de `google/functiongemma-270m-it`. Se realizo un ajuste fino completo (full fine-tune, sin adaptadores LoRA) durante tres epocas, aproximadamente 90 minutos en una unica Nvidia A100 en Verda. Los pesos resultantes se convirtieron a GGUF con llama.cpp y se verifico la paridad de token ids entre la aplicacion y el entrenamiento.

El conjunto de datos consta de 53.632 pares pregunta-llamada generados desde la propia aplicacion: 5.835 preguntas del dataset, 30.927 preguntas construidas a partir de las etiquetas de salas, apartamentos y plantas de cada plano, y 16.870 reformulaciones de esas preguntas generadas por un modelo de lenguaje (registro coloquial, peticiones de tipo "muestrame", palabras clave telegraficas, otros idiomas y erratas). La llamada objetivo es conocida por construccion y una pregunta reformulada conserva la llamada de su original. La entrada es un turno de desarrollador (instruccion, resumen del esquema y menu de lo que contiene el plano) mas un turno de usuario con la pregunta y la lectura de un parser de palabras clave como pista; la salida es una unica llamada JSON.

## Capacidades

- Function calling restringido a tres menus y formatos de llamada propios de la aplicacion Blueline: planos DXF por capas, planos raster o PDF e modelos de edificio IFC.
- Seleccion de operacion entre un conjunto cerrado (`count_symbols`, `count_apartments`, `rooms`, `area_apartment`, `area_floor`, `compare`, `none`, `count_known`, `count_other`, `read`, `count_elements`, `storey_total`, `model_facts`).
- Extraccion de parametros estructurados: simbolos, etiquetas, numeros de sala, apartamentos, plantas, elementos, seleccion (`pick`), medicion (`measure`) y cantidad.
- Indicacion explicita de si el usuario pidio que se le muestren cosas (`locate`) y del tipo de respuesta.
- Comprension de preguntas en ingles, finlandes, aleman, frances e italiano, incluyendo reformulaciones coloquiales, palabras clave sueltas y erratas.
- Generacion de JSON valido garantizada en la aplicacion mediante una gramatica construida a partir del esquema JSON de la peticion, que ademas restringe las etiquetas, apartamentos y plantas a las que existen en el plano.
- No soporta vision ni audio: el modelo solo interpreta el menu textual del plano, no la imagen.

## Casos de uso

- Interpretacion de preguntas sobre planos DXF en la aplicacion Blueline: el modelo recibe las etiquetas de salas, apartamentos, numeros de sala y recuentos de simbolos del plano y devuelve la operacion de recuento o medicion adecuada, que luego ejecutan los scripts de geometria.
- Interrogacion de planos raster o PDF: con el menu de las 13 clases de objetos que reconocen los detectores, el modelo traduce la pregunta a `count_known`, `count_other` o `read` con los objetivos y el ambito (`whole_drawing` o `items`).
- Consultas sobre modelos de edificio IFC: a partir de plantas, clases de elementos con recuentos y nombres de salas, genera llamadas `count_elements`, `rooms`, `storey_total` o `model_facts` para responder preguntas de medicion de obra.
- Despliegue local en CPU para demostraciones y entornos sin GPU: el GGUF Q8_0 de 292 MB se ejecuta en llama.cpp a unos 0,9 segundos por pregunta en un portatil con i7-11800H y 8 hilos, lo que permite prototipar sin infraestructura dedicada.
- Base para ajustes finos en otros dominios de extraccion estructurada: el pipeline de generacion sintetica de pares pregunta-llamada a partir de la propia aplicacion es reutilizable para tareas de quantity takeoff en otros formatos de plano.
- Filtro o enrutador previo en pipelines de analisis de planos: dado su bajo coste, puede clasificar rapidamente si una pregunta requiere recuento, medicion, comparacion o ninguna operacion antes de invocar herramientas mas caras.
- Evaluacion comparativa de function calling en dominios restringidos: sirve como referencia de hasta donde llega un modelo de 270M ajustado frente a modelos alojados de mayor tamano en una tarea de esquema cerrado.

## Benchmarks y rendimiento

Pares retenidos de 40 planos y 7 modelos de edificio no vistos en entrenamiento, con plantillas de pregunta y estilos de reformulacion reservados para test.

| Interprete | Llamadas correctas en todos los campos de la operacion (primeros 200 pares retenidos) |
|---|---|
| Claude Haiku 5.5 (alojado) | 188 (94,0%) |
| Blueline interpreter (este modelo) | 183 (91,5%) |
| FunctionGemma antes del ajuste fino | 0 |

| Metrica | Resultado |
|---|---|
| Precision en los 1.257 pares retenidos | 1.093 llamadas correctas (87,0%) |
| Respuesta final correcta en la aplicacion (556 preguntas de test) | 536 con este modelo frente a 539 con Claude Haiku 5.5 |
| Latencia en CPU (i7-11800H, 8 hilos, Q8_0) | ~0,9 s por pregunta |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso documentado; el GGUF Q8_0 de 292 MB esta pensado para ejecucion en CPU.
- GPU recomendadas: no se documentan requisitos de GPU para inferencia; el entrenamiento se realizo en una unica Nvidia A100.
- Cabe en cualquier GPU consumer con holgura: con 292 MB de pesos en Q8_0, el cuello de botella es el contexto y el overhead del runtime, no la memoria de pesos.
- Opciones de despliegue: llama.cpp y sus bindings (unico runtime documentado). El modelo se integra en la aplicacion Blueline colocando el archivo en `models/interpreter/interpreter-q8_0.gguf` y usando el modo "Blueline only". No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: aproximadamente 0,9 segundos por pregunta en CPU (i7-11800H, 8 hilos); no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Function calling en el dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blueline interpreter | 268 M | No disponible | 91,5% (200 pares) / 87,0% (1.257 pares) | Gemma Terms of Use (no comercial) | GGUF en Hugging Face |
| FunctionGemma 270M (base) | 270 M | No disponible | 0% en la misma prueba | Gemma Terms of Use | Hugging Face (`google/functiongemma-270m-it`) |
| Claude Haiku 5.5 | No disponible | No disponible | 94,0% (200 pares) | Propietaria | API alojada |

La comparacion con modelos de proposito general de mayor tamano no esta disponible en la informacion proporcionada; el unico contraste publicado es frente a su modelo base y a Claude Haiku 5.5 como interprete de la misma aplicacion.

## Limitaciones y advertencias

- El modelo esta ajustado para los tres menus y formatos de llamada de la aplicacion Blueline; no es un modelo de function calling general y su rendimiento fuera de ese esquema no esta garantizado.
- Es debil en idiomas no vistos en entrenamiento: polaco, danes, noruego, portugues, neerlandes, estonio y rumano.
- Falla en algunas peticiones de tipo "muestrame" que evitan las palabras show, mark y where, y puede malinterpretar preguntas de una sola palabra; la aplicacion mitiga los casos ya vistos.
- Riesgo de alucinacion en los parametros de la llamada fuera del esquema; en produccion se recomienda mantener la decodificacion restringida por gramatica JSON, que ademas limita las etiquetas, apartamentos y plantas a las existentes en el plano.
- El prompt debe renderizarse exactamente como en entrenamiento mediante `renderPrompt` de `app/server/src/models/gemma.ts`; cualquier desviacion puede degradar la calidad de la llamada.
- Licencia Gemma Terms of Use y modelo derivado de FunctionGemma: distribucion sujeta a los mismos terminos.
- El dataset de entrenamiento procede del dataset Stoa de Junction 2026, de uso no comercial, y los planos conservan sus propias licencias (por ejemplo, CubiCasa5k es CC BY-NC-SA 4.0); debe tratarse el modelo como de uso no comercial.
- No se han publicado datos sobre sesgos sociales o demograficos, longitud de contexto soportada ni comportamiento en produccion a escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NiceK1/blueline-interpreter-functiongemma-270m
- Repositorio del proyecto: https://github.com/NiceK1/stoa-spike
- Documentacion del modelo en la aplicacion: https://github.com/NiceK1/stoa-spike/blob/main/docs/gemma.md
- Mediciones y resultados: https://github.com/NiceK1/stoa-spike/blob/main/docs/results.md
- Codigo de renderizado del prompt: https://github.com/NiceK1/stoa-spike/blob/main/app/server/src/models/gemma.ts
- Demo en vivo: https://blueline.65-108-33-91.sslip.io
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Copia del modelo base usada en entrenamiento: https://huggingface.co/unsloth/functiongemma-270m-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
