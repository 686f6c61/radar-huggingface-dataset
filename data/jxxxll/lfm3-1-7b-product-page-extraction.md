# jxxxll/lfm3-1.7b-product-page-extraction

## Resumen

El modelo `jxxxll/lfm3-1.7b-product-page-extraction` es un adaptador LoRA sobre el modelo base LiquidAI/LFM3-1.7B, desarrollado por el usuario jxxxll. Su proposito es especializar un modelo de lenguaje pequeno (1.700 millones de parametros) en una tarea de extraccion de informacion muy concreta: leer el HTML limpio de una pagina de producto de una tienda online y generar un unico registro JSON estructurado con campos como nombre, marca, modelo, codigos, precio, imagenes, documentos y filas de especificaciones tipadas.

El adaptador resuelve un problema clasico de scraping e integracion de catalogo: convertir paginas heterogeneas de comercio electronico en datos estructurados y validables contra un esquema. Al ser un modelo de 1.7B, es relevante para despliegues economicos de extraccion masiva donde un modelo mayor resultaria caro o lento, y su salida esta pensada para generarse bajo una restriccion de JSON Schema (el autor menciona llguidance), lo que garantiza respuestas sintacticamente validas.

El adaptador tiene rango 16, alpha 32, dropout 0.05 y se aplica a las proyecciones de atencion y feed-forward. Se entreno con 18.399 paginas de tiendas online (mayoritariamente de Australia y Nueva Zelanda) y una unica pasada de 2.268 pasos, con una perdida de validacion de 0,1415 en el ultimo paso. No se publican resultados de benchmarks con esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32, dropout 0.05) sobre transformer LiquidAI/LFM3-1.7B |
| Parametros totales | 1.700 millones en el modelo base; el adaptador LoRA es un subconjunto de bajo rango |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | entrada truncada a 25.000 tokens; generacion de hasta 8.192 tokens nuevos |
| Tipos de cuantizacion | no disponible (el autor usa bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada del modelo base |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`), libreria PEFT |

## Arquitectura y entrenamiento

El adaptador se monta sobre LiquidAI/LFM3-1.7B, un modelo transformer de 1.700 millones de parametros. La especializacion se realiza mediante LoRA de rango 16 y alpha 32 con dropout 0.05, aplicada a las proyecciones de atencion y de feed-forward. El tokenizador y la plantilla de chat son los del modelo base; el adaptador anade dos ficheros auxiliares: `rules.md` (las reglas de extraccion, que forman el inicio del mensaje de sistema) y `schema.json` (el esquema JSON de la respuesta, con el que se restringe la generacion).

El entrenamiento uso 18.399 paginas de tiendas online, principalmente de Australia y Nueva Zelanda. Las respuestas de referencia fueron escritas por modelos mayores y verificadas por codigo. Se realizo una unica pasada de 2.268 pasos partiendo del modelo base, alcanzando una perdida de validacion de 0,1415 en el ultimo paso. No se documenta el uso de RLHF ni DPO. La generacion en produccion es codiciosa (`do_sample=False`), con hasta 8.192 tokens nuevos, y el autor recomienda imponer una restriccion de JSON Schema (por ejemplo, llguidance) para garantizar respuestas validas; el orden de claves de las respuestas de entrenamiento sigue el de `schema.json`.

## Capacidades

- Extraccion de informacion estructurada: genera un unico registro JSON de producto a partir del HTML limpio de una pagina.
- Campos cubiertos: nombre, marca, modelo, codigos, precio (con valor numerico y moneda en codigo ISO), imagenes, documentos y filas de especificaciones tipadas.
- Especificaciones tipadas: cada fila puede ser un valor con unidad, un rango con minimo, maximo y unidad, o una lista de valores para varias dimensiones u opciones de compra.
- URLs completas: completa las direcciones relativas a partir de la URL de la pagina.
- Deteccion de incidencias: si la pagina no contiene un producto extraible, responde con `{"page_issue": "not_found" | "blocked" | "no_product" | "other"}`.
- Salida restringible por JSON Schema para garantizar validez sintactica.
- No realiza juicio de identidad: no decide si el producto de la pagina coincide con el de la linea de factura; esa decision corresponde a un paso separado.
- Soporte de tool calling, agentes, vision, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Enriquecimiento de catalogos de ecommerce: dado el HTML limpio de cada ficha de producto, el adaptador genera un registro JSON con marca, modelo, precio y especificaciones, listo para ingestar en una base de datos o en un PIM. Su tamano de 1.7B permite procesar grandes volumenes de paginas con coste contenido.
- Verificacion de precios y fichas frente a facturas: el modelo extrae el producto de la pagina y un paso posterior compara ese registro con la linea de factura, aprovechando que el adaptador no mezcla ambas tareas.
- Monitorizacion de competencia: se pueden rastrear periodicamente paginas de tiendas rivales y extraer precio y especificaciones de forma estructurada para comparativas automatizadas.
- Normalizacion de especificaciones tecnicas: las filas tipadas (valor con unidad, rangos, listas de opciones) permiten convertir descripciones libres en atributos comparables entre productos de distintos fabricantes.
- Extraccion de imagenes y documentos: el registro incluye imagenes y documentos con URL completa, util para poblar fichas de producto o repositorios de manuales.
- Procesamiento de paginas con incidencias: la respuesta `page_issue` permite enrutar automaticamente paginas bloqueadas, sin producto o no encontradas a revision manual, sin romper el pipeline.
- Despliegue en pipelines de extraccion a gran escala: al ser un adaptador LoRA sobre un modelo de 1.7B, se puede servir con transformers y PEFT en GPUs modestas, con generacion codiciosa y salida validada por esquema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que esta version no incluye puntuaciones de benchmark; el unico dato de rendimiento reportado es la perdida de validacion de 0,1415 en el ultimo paso de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ejecutarse en bfloat16 sobre un modelo de 1.7B, la huella de pesos ronda los 3,4 GB, mas la memoria de activaciones y cache KV para entradas de hasta 25.000 tokens.
- GPU recomendadas: no disponible en la informacion proporcionada. El ejemplo del autor usa `device_map="cuda"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por tamano del modelo base (1.7B), es plausible en GPUs de consumo con VRAM suficiente, pero no hay datos oficiales.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained(...).merge_and_unload()`), tal como muestra el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Restriccion de decodificacion: se recomienda imponer JSON Schema con llguidance durante la generacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento frente a alternativas de extraccion estructurada.

## Limitaciones y advertencias

- La pagina se trunca a 25.000 tokens; cualquier dato que aparezca despues del corte no se procesa.
- Si la pagina ofrece precios en varios tramos o monedas, el modelo devuelve solo uno de ellos.
- El adaptador no juzga si el producto de la pagina coincide con el de la linea de factura; esa decision debe implementarse en un paso separado.
- El entrenamiento se centro en tiendas de Australia y Nueva Zelanda; el comportamiento en otros mercados, idiomas o formatos de pagina no esta documentado.
- Los idiomas soportados no estan declarados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; la restriccion por JSON Schema garantiza la forma de la respuesta, no la veracidad de los valores extraidos.
- Sesgos conocidos: no documentados.
- Licencia: LFM Open License v1.0 (lfm1.0), heredada del modelo base; deben revisarse sus terminos antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes, y no se publican benchmarks; conviene validar el adaptador con un conjunto propio antes de usarlo en produccion.
- El ejemplo de uso requiere `trust_remote_code=True` y fija la revision `ac2586a34f1a1c03329dbdcdefabd8b6478ddaa7` del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jxxxll/lfm3-1.7b-product-page-extraction
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
