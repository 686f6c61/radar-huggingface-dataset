# SevenAIGmbH/opus-mt-de-pl

## Resumen

`SevenAIGmbH/opus-mt-de-pl` es una conversion a ONNX del modelo de traduccion automatica `Helsinki-NLP/opus-mt-de-pl`, desarrollado originalmente por el Language Technology Research Group de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce de aleman a polaco y esta empaquetado especificamente para su uso con Transformers.js, la libreria de inferencia en JavaScript del ecosistema Hugging Face, lo que permite ejecutar la traduccion directamente en el navegador o en Node.js sin backend Python.

La arquitectura subyacente es Marian NMT, un transformer encoder-decoder disenado para traduccion neuronal, con un tamano de repositorio de 3,2 GB que incluye los grafos ONNX en multiples precisiones. La relevancia de esta version radica en que anade variantes cuantizadas (fp16, q8, int8, uint8, q4, q4f16, bnb4) y aplica correcciones tecnicas para garantizar la compatibilidad con onnxruntime-web 1.14 y con la version 2 de `@xenova/transformers`, algo que las conversiones estandar no siempre resuelven.

El modelo mantiene la licencia Apache 2.0 del original y esta pensado para escenarios de traduccion de baja latencia en cliente, sin dependencia de servidores. No se dispone de informacion sobre el volumen de descargas ni de validacion por parte de la comunidad, ya que el repositorio registra cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian NMT (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, quantized (q8), int8, uint8, q4, q4f16, bnb4 |
| Idiomas soportados | aleman (origen) y polaco (destino) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos bajo `onnx/`), compatible con Transformers.js |

## Arquitectura y entrenamiento

El modelo es un Marian NMT, la arquitectura de traduccion neuronal desarrollada por Microsoft Research y adoptada por el proyecto OPUS-MT de la Universidad de Helsinki. Se trata de un transformer encoder-decoder clasico orientado a traduccion condicional, sin mecanismos de mezcla de expertos ni atencion lineal. El repositorio no documenta el numero de parametros, la composicion del corpus de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde al modelo original `Helsinki-NLP/opus-mt-de-pl`, que no se detalla en la model card de esta conversion.

La innovacion tecnica de esta version es exclusivamente de formato e inferencia. La conversion se realizo con los scripts de Transformers.js 3.7.0 (optimum + onnxruntime 1.20.1) e incorpora dos correcciones: el grafo `decoder_model_merged` se vuelve a fusionar sin onnxslim, porque el grafo optimizado fallaba en las optimizaciones extendidas de onnxruntime para la rama de past-key-values, y se guarda como ONNX IR 8 para que cargue en onnxruntime-web 1.14. Ademas, la Transpose del peso `lm_head` atado se coloca despues del Gather del embedding, de modo que la cuantizacion a 8 bits no conserva una copia fp32 adicional de la matriz de embeddings.

## Capacidades

- Traduccion de texto de aleman a polaco en una unica pasada encoder-decoder.
- Ejecucion en navegador y en Node.js mediante Transformers.js, sin backend Python.
- Inferencia con pesos cuantizados en 8 y 4 bits para reducir huella de memoria.
- Compatibilidad con onnxruntime-web 1.14 y con `@xenova/transformers` v2 gracias al guardado en ONNX IR 8.
- API de pipeline estandar (`pipeline('translation', ...)`) con entrada de texto plano.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Cobertura multilingue limitada al par aleman-polaco.

## Casos de uso

- Traduccion en el navegador de contenidos alemanes a polaco: el modelo se carga con Transformers.js y procesa el texto en el cliente, sin enviar datos a un servidor, lo que resulta adecuado para documentos sensibles o entornos con requisitos de privacidad.
- Extension de navegador para lectura de prensa alemana: se integra el pipeline de traduccion y se traduce cada parrafo bajo demanda, aprovechando las variantes q8 o q4 para mantener un tamano de descarga asumible.
- Traduccion de formularios y correspondencia administrativa entre Alemania y Polonia: el par de idiomas cubre el flujo transfronterizo habitual y la inferencia local evita depender de APIs de terceros.
- Preprocesado de datasets en pipelines de NLP: se traducen corpus alemanes a polaco antes de tareas posteriores de clasificacion o analisis, ejecutando el modelo en Node.js dentro del propio pipeline de datos.
- Traduccion de documentacion tecnica en herramientas de escritorio: la version ONNX puede empaquetarse en aplicaciones Electron y traducir fragmentos de manuales sin conexion.
- Prototipado rapido de funcionalidades de traduccion: al estar disponible en el registro de Transformers.js, se puede validar la calidad del par de idiomas con pocas lineas de codigo antes de invertir en un despliegue de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no documentarse el numero de parametros; el repositorio completo ocupa 3,2 GB e incluye todas las variantes, por lo que la variante q8 o q4 reduce sustancialmente la huella frente a fp32.
- GPU recomendadas: no disponible; al ejecutarse via onnxruntime-web, la inferencia puede usar WebGPU o CPU del navegador segun el entorno.
- Cabe en GPU de consumo: si, en principio cualquier GPU con soporte WebGPU o incluso CPU, dado el caracter ligero de los modelos Marian y las variantes cuantizadas disponibles.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`), `@xenova/transformers` v2, onnxruntime-web 1.14 y onnxruntime nativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| SevenAIGmbH/opus-mt-de-pl | no disponible | no disponible | de-pl | Apache 2.0 | ONNX (multiples precisiones) |
| Helsinki-NLP/opus-mt-de-pl | no disponible | no disponible | de-pl | Apache 2.0 | PyTorch (safetensors/bin) |
| Xenova/opus-mt-de-pl | no disponible | no disponible | de-pl | Apache 2.0 | ONNX (layout equivalente) |

La diferencia frente al modelo original de Helsinki-NLP es el formato: el original requiere PyTorch y un entorno Python, mientras que esta version esta lista para JavaScript. Frente a la conversion de Xenova, el autor declara el mismo layout e incorpora correcciones de compatibilidad con onnxruntime-web 1.14 y de cuantizacion del embedding.

## Limitaciones y advertencias

- Solo traduce de aleman a polaco; no es un modelo multilingue general.
- Al ser una conversion de formato, hereda los sesgos y limitaciones del modelo OPUS-MT original, que no se documentan en esta model card.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (legal, medico, tecnico) no cubiertos por el corpus de entrenamiento original.
- No se documenta la longitud maxima de secuencia ni el comportamiento con entradas largas.
- El repositorio no registra descargas ni validacion de la comunidad; conviene evaluar la calidad antes de usarlo en produccion.
- La licencia Apache 2.0 permite uso comercial, pero la atribucion al grupo de Helsinki debe mantenerse segun declara el autor.
- La compatibilidad esta acotada a versiones concretas de onnxruntime-web y Transformers.js; cambios de version pueden romper la carga del grafo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SevenAIGmbH/opus-mt-de-pl
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-de-pl
- Organizacion OPUS-MT: https://huggingface.co/Helsinki-NLP
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
