# midudev/kev-4b-ONNX

## Resumen

kev-4b-ONNX es un paquete ONNX del modelo de decision kev-4b de Jared Palmer, reempaquetado por midudev con la receta de runonweb para ejecutarse directamente en el navegador. No es un modelo generativo: es un clasificador de decisiones tipadas que responde preguntas sobre un unico texto (verificaciones si/no mediante el tipo `noul`, eleccion entre opciones con `choice` y puntuaciones con `score`), devolviendo probabilidades calibradas en lugar de texto generado. Las peticiones siguen la API System One de TypeSafe.

Tecnicamente parte de Qwen/Qwen3.5-4B-Base, sobre el que se fusiona en fp32 un LoRA de rango 16 y se exporta el backbone con el builder de onnxruntime-genai, sin la cabeza LM ni la capa MTP. El grafo devuelve `hidden_states` junto con las cachés recurrente, de convolucion y KV, de modo que el estado del texto se codifica una sola vez y cada pregunta se ejecuta como una fila independiente sobre esa cache. Los pesos se cuantizan a int4 (RTN, bloque 32, embeddings incluidos) con activaciones en fp32, ocupando unos 2,7 GB repartidos en dos ficheros de menos de 2 GB.

Su relevancia actual radica en que permite ejecutar un modelo de 4B totalmente en local dentro del navegador mediante WebGPU nativo (o WASM en CPU), sin enviar datos a un servidor. Esta pensado como componente de decision, no como asistente conversacional, lo que lo hace adecuado para triaje, enrutado y clasificacion con requisitos de privacidad y baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal y convolucion causal (Qwen3.5-4B-Base), exportado a ONNX sin cabeza LM ni capa MTP |
| Parametros totales | ~4 000 millones (segun el nombre kev-4b y la base Qwen3.5-4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (RTN, bloque 32, embeddings incluidos), activaciones fp32; existe tambien un grafo fp32 de referencia |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (dos ficheros, ~2,7 GB en total); cabeza de punteros en `head.bin` (fp32) y metadatos en `kev.json` |
| Pipeline | text-classification |
| Libreria | onnxruntime (onnxruntime-web) |
| Modelo base | jaredpalmer/kev-4b (revision `139fdd94f1b6a6ad80cc15e08fcb99cac885a101`) |

## Arquitectura y entrenamiento

El modelo original kev-4b es un ajuste de Qwen3.5-4B-Base mediante un LoRA de rango 16, que en esta exportacion se fusiona en fp32 sobre la base (revision `1001bb4d826a52d1f399e183466143f4da7b741b`). El backbone se exporta con el builder de onnxruntime-genai eliminando la cabeza de generacion de lenguaje y la capa MTP: el grafo resultante devuelve `hidden_states` mas las cachés recurrente, de convolucion y KV. Esto confirma una arquitectura hibrida con operadores de atencion lineal (`LinearAttention`) y convolucion causal con estado (`CausalConvWithState`), que requieren las contrib ops correspondientes de ONNX Runtime.

La innovacion principal del paquete es su formato de ejecucion en forma de filas: el estado del texto se codifica una sola vez en la cache y cada pregunta se evalua como una fila adicional sobre esa misma cache, lo que reduce coste cuando se lanzan varias preguntas sobre un mismo texto. La cabeza de punteros (`head.bin`, con `q.weight`, `q.bias`, `k.weight` y `k.bias` en fp32) produce las probabilidades tipadas, mientras que `kev.json` guarda la temperatura de calibracion, los ids de tokens delimitadores y el diseno de la cache. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO sobre la base.

## Capacidades

- Clasificacion de decisiones tipadas sobre un texto: `noul` (si/no), `choice` (seleccion entre opciones) y `score` (puntuacion).
- Respuesta con probabilidades calibradas en lugar de texto generado, apta para umbrales y agregaciones.
- Codificacion unica del estado del texto con evaluacion de multiples preguntas como filas sobre la misma cache.
- Ejecucion en navegador mediante ONNX Runtime Web con aceleracion WebGPU nativa y fallback a WASM en CPU.
- Integracion via la API System One de TypeSafe y el paquete `runonweb/classify`.
- No dispone de generacion de texto, tool calling, function calling, capacidades de agente ni modalidades de vision o audio segun la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede etiquetar automaticamente si un mensaje trata sobre facturacion u otras categorias mediante preguntas `noul`, como en el ejemplo `billing` de la model card, gracias a su salida de probabilidad calibrada que permite fijar umbrales de enrutado.
- Moderacion de contenido on-device: clasificacion si/no de textos directamente en el navegador del usuario sin enviar el contenido a servidores, usando WebGPU sobre el grafo int4.
- Clasificacion de intenciones en asistentes: al evaluar varias preguntas tipadas sobre un mismo estado, se puede descomponer una intencion en varios criterios reutilizando una sola codificacion del texto.
- Encuestas y formularios con puntuacion: el tipo `score` permite asignar valores calibrados a respuestas abiertas, por ejemplo para priorizacion o satisfaccion, sin postprocesar texto generado.
- Enrutado previo en pipelines con LLM: usar kev-4b-ONNX como filtro barato y local que decide, con un si/no, si una consulta debe escalarse a un modelo generativo mayor.
- Decision binaria offline en aplicaciones web: integrado mediante `runonweb/classify`, permite tomar decisiones tipadas en tiempo real en el cliente incluso sin conexion estable, ejecutando el grafo WASM en CPU.
- Clasificacion en redaccion asistida: decidir entre opciones (`choice`) sobre un texto, por ejemplo seleccionar la categoria de un articulo o la etiqueta de un correo.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles son los de la propia model card, medidos sobre 192 preguntas de los conjuntos de desarrollo de Kev, comparando la exportacion int4 con la exportacion fp32 del mismo grafo:

| Metrica | Valor |
|---|---|
| Diferencia media de probabilidad frente a fp32 | 0,040 |
| Respuestas que cambian | 10 |
| Respuestas que cambian con margen superior a 0,2 | 3 |
| Precision (int4) | 0,776 |
| Precision (fp32) | 0,766 |
| Concordancia del grafo fp32 con la ruta PyTorch fp32 | dentro de 4e-5 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: alrededor de 2,7 GB de pesos int4 mas el estado de las caches y las activaciones en fp32; el margen adicional dependera de la longitud del estado y del numero de preguntas por lote.
- Ejecucion en navegador: WebGPU nativo mediante `onnxruntime-web/webgpu` (requiere soporte de operadores contrib `LinearAttention` y `CausalConvWithState`) o CPU mediante `onnxruntime-web/wasm`.
- GPU de consumo: si, el modelo esta disenado para ejecutarse en GPUs de consumo y en GPU integrada con WebGPU, dado su tamano int4 y su reparto en dos ficheros de menos de 2 GB.
- GPU de servidor (A100, H100, RTX 4090, etc.): no se documentan requisitos especificos en la informacion disponible, aunque el grafo ONNX puede ejecutarse en cualquier backend de ONNX Runtime compatible con las contrib ops necesarias.
- Opciones de despliegue: ONNX Runtime Web (WebGPU o WASM) a traves del paquete `runonweb/classify`; no se mencionan otros runners como vLLM, llama.cpp, Ollama o TGI para esta exportacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| midudev/kev-4b-ONNX | ~4B | no disponible | ONNX int4 (WebGPU / WASM) | apache-2.0 | Hugging Face (repo 2,7 GB) |
| jaredpalmer/kev-4b (original) | ~4B | no disponible | PyTorch, LoRA de rango 16 sobre Qwen3.5-4B-Base | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible | Peso base de generacion de texto | no disponible | Hugging Face |

Las cifras de rendimiento comparadas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto: es un modelo de decision tipada, por lo que no sirve para tareas generativas ni conversacionales.
- La cuantizacion int4 introduce desviaciones: en la evaluacion propia, 10 de 192 respuestas cambian respecto a fp32 y 3 lo hacen con un margen superior a 0,2, por lo que conviene validar los umbrales de decision en el dominio objetivo.
- Riesgo de alucinacion: al no generar texto, el riesgo se traslada a una calibracion erronea de las probabilidades; la temperatura de calibracion en `kev.json` es critica para el comportamiento final.
- La licencia del modelo es apache-2.0, pero los datasets de entrenamiento de Kev tienen sus propias licencias, que deben revisarse para uso comercial segun la model card original.
- Dependencia de operadores contrib (`LinearAttention` y `CausalConvWithState`) que limita el conjunto de runtimes y navegadores compatibles; en WebGPU es necesario el build nativo especifico.
- Idiomas soportados y longitud de contexto no disponibles, lo que impide garantizar el comportamiento en textos largos o en idiomas distintos del usado en el desarrollo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/midudev/kev-4b-ONNX
- Modelo original kev-4b: https://huggingface.co/jaredpalmer/kev-4b
- Pagina de runonweb classify: https://runonweb.ai/models/classify
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Receta de exportacion: `training/kev-onnx` en el repositorio de runonweb (referenciado en la model card)
