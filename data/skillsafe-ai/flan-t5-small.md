# skillsafe-ai/flan-t5-small

## Resumen

skillsafe-ai/flan-t5-small es un paquete de artefactos ONNX listos para su ejecucion en navegador, derivado del modelo texto-a-texto FLAN-T5 en su variante small. No se trata de un modelo entrenado por el autor: la model card indica explicitamente que es una importacion reproducible del upstream Xenova/flan-t5-small (commit `311454e83bc784267fd7eef5940ee854144abbec`), generada mediante una receta versionada (`recipes/flan-t5-small.yaml`, sha256 `f230ca...`) y publicada sin edicion manual de los pesos.

El interes practico de esta ficha no esta en la arquitectura (un transformer encoder-decoder T5 estandar, ya conocido) sino en el empaquetado: los pesos se distribuyen como grafos ONNX verificados con `onnx.checker` y probados en onnxruntime sobre CPU, con una variante fp32 y otra cuantizada a q8 de 56,59 MB para el decodificador. Esto permite ejecutar generacion de texto, resumen, reescritura y Q&A directamente en el navegador con transformers.js, sin backend ni GPU.

Es relevante ahora porque el ecosistema transformers.js necesita artefactos ONNX reproducibles y auditables, y este repositorio aporta hashes SHA-256 por fichero, trazas de toolchain (Python 3.12.13, torch 2.10.0, onnx 1.23.0, onnxruntime 1.30.0) y resultados de una prueba de humo en CPU. El contrapeso es que el modelo es muy pequeno y la documentacion publicada es escasa: cero descargas, cero likes y ningun dato de benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo T5 (texto a texto) |
| Parametros totales | no disponible en la informacion proporcionada; la variante T5-small de referencia ronda los 77 M de parametros |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la configuracion canonica de T5-small admite 512 tokens |
| Tipos de cuantizacion | fp32 y q8 (decodificador); el encoder se lista como fp32 y q8 sin desglose de tamano |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx`, `decoder_model_merged_quantized.onnx`), mas tokenizer SentencePiece (`spiece.model`) y `tokenizer.json` |
| Modelo base | Xenova/flan-t5-small |
| Libreria declarada | transformers.js |
| Tamano del repositorio | 0,4 GB |
| Autor | skillsafe-ai |
| Pipeline declarado | no disponible |
| Tag de region | us |
| Fecha de creacion | 2026-09-22T21:49:21Z |
| Fecha de actualizacion | 2026-09-22T21:49:41Z |

## Arquitectura y entrenamiento

Los nombres de los tensores del grafo ONNX permiten deducir la topologia: el decodificador expone `past_key_values.0` a `past_key_values.7`, es decir, 8 bloques, con `encoder_hidden_states[1, 8, 512]` como dimension oculta (d_model = 512), claves y valores de dimension 64 (`d_kv = 64`, compatible con 6 cabezas de atencion) y una capa de salida `logits[1, 4, 32128]` que corresponde al vocabulario SentencePiece de 32.128 tokens. El repositorio incluye atencion cruzada (`past_key_values.N.encoder.key/value`), por lo que el decodificador es el modelo completo, no una variante decoder-only.

Sobre el entrenamiento no hay informacion en la ficha: skillsafe-ai no entrena ni convierte el modelo, solo lo importa tal cual se publico upstream. La model card documenta el proceso como una importacion reproducible, con hashes SHA-256 por fichero, verificacion con `onnx.checker` y una ejecucion de humo en onnxruntime con entradas rellenas de ceros a las formas declaradas. No se describen tokens de entrenamiento, composicion del dataset, RLHF ni DPO; esa informacion corresponderia al release original de la familia FLAN-T5, que no se enlaza en la documentacion proporcionada. Los ficheros marcados como `registry` se sirven desde `models.skillsafe.ai` una vez vetados, mientras que los ficheros `bundle` (configuracion, tokenizer) se distribuyen dentro de la aplicacion.

## Capacidades

- Generacion de texto texto-a-texto: el autor describe el modelo para resumir, reescribir y responder preguntas (Q&A) mediante prompts de instruccion.
- Ejecucion en navegador: los artefactos estan pensados para transformers.js, con grafos ONNX que se pueden ejecutar en WASM y, si el runtime lo soporta, en WebGPU.
- Inferencia con cache de claves y valores: el grafo `decoder_model_merged` gestiona `past_key_values` y una rama `use_cache_branch`, lo que permite decodificacion autoregresiva incremental.
- Cuantizacion lista para usar: variante q8 del decodificador de 56,59 MB, orientada a reducir memoria y ancho de banda en cliente.
- No se declara soporte de tool calling ni function calling.
- No se declaran capacidades de agente, razonamiento multi-paso, modo thinking, vision, audio ni multimodalidad.
- No se declaran capacidades multilingues ni una lista de idiomas soportados.
- No se declara ajuste por instrucciones especifico mas alla del heredado del modelo base.

## Casos de uso

- Resumen de textos cortos en el cliente: el modelo puede resumir parrafos, correos o entradas de un blog directamente en el navegador, de modo que el contenido sensible nunca abandona el dispositivo. Adecuado por su tamano (decodificador q8 de 56,59 MB) y por su objetivo declarado de sumarizacion.
- Reescritura y correccion de estilo: integrado en un editor web o extension, sirve para reformular frases, simplificar jerga o generar variantes de un titular sin coste de API.
- Preguntas y respuestas sobre fragmentos cortos: con contexto limitado (la configuracion canonica de T5-small es de 512 tokens), es util para Q&A sobre un parrafo o una ficha concreta, inyectando el texto como prefijo del prompt.
- Clasificacion y etiquetado por prompt: al ser un modelo texto-a-texto, se puede formular la tarea como "clasifica este texto en: factura, reclamacion, consulta" y usar la salida como etiqueta en un pipeline de triaje.
- Enrutado previo a un modelo mayor: en arquitecturas de cascada, este modelo puede resolver consultas triviales o decidir si la peticion merece enviarse a un LLM de mayor tamano, reduciendo coste y latencia.
- Aplicaciones offline o PWA: al ejecutarse con transformers.js sobre ONNX, encaja en aplicaciones web progresivas que deben funcionar sin conexion una vez cargados los pesos.
- Demos educativas y prototipado: su huella reducida permite montar ejemplos reproducibles de pipelines encoder-decoder en el navegador, incluida la comparacion entre la ruta fp32 y la ruta q8.
- Verificacion de artefactos ONNX en CI: los hashes y las formas de tensor documentadas permiten usar este repositorio como caso de prueba para validar conversores, runtimes y despliegues de modelos en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni metricas de calidad equivalentes, y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo.

El unico dato de rendimiento publicado corresponde a la prueba de humo en CPU (Darwin 25.6.0 arm64) con `onnx.checker` y onnxruntime sobre entradas de ceros:

| Grafo ONNX | Formas de entrada | Salidas | Latencia (ms) |
|---|---|---|---|
| `onnx/decoder_model_merged.onnx` (fp32) | `encoder_attention_mask[1,8]`, `input_ids[1,4]`, `encoder_hidden_states[1,8,512]`, 32 tensores de `past_key_values` | `logits[1,4,32128]` y 32 tensores `present` | 5,1 |
| `onnx/decoder_model_merged_quantized.onnx` (q8) | mismas formas declaradas | no disponible (informacion truncada) | no disponible |
| `onnx/encoder_model.onnx` | no disponible | no disponible | no disponible |

Estas cifras corresponden a una unica pasada con secuencias de 4 y 8 tokens, por lo que no permiten extrapolar throughput de generacion real.

## Requisitos de hardware

- Huella en disco de los pesos fp32: 134,90 MB el encoder mas 222,00 MB el decodificador, aproximadamente 357 MB.
- Huella de la ruta cuantizada: 56,59 MB el decodificador q8; el encoder en q8 se menciona en la ficha pero su tamano no aparece desglosado en la informacion disponible. El repositorio completo ocupa 0,4 GB.
- VRAM estimada para inferencia: no disponible como medicion; por el tamano de los ficheros, la ruta q8 es apta para ejecucion en CPU y en memoria integrada de navegador, mientras que la ruta fp32 requiere del orden de varios cientos de MB de memoria de trabajo (estimacion, no medida publicada).
- GPU recomendadas: no se declara ninguna. El caso de uso previsto es navegador y CPU; cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) sobra para este tamano, pero no hay datos de rendimiento acelerado.
- Cabe en GPU consumer: si, con margen amplio, dado que el modelo completo en fp32 ocupa menos de 400 MB en disco. Tambien cabe en dispositivos moviles y en equipos sin GPU dedicada.
- Opciones de despliegue: transformers.js (WASM y, segun runtime, WebGPU), onnxruntime y onnxruntime-web, ademas de cualquier servidor capaz de cargar grafos ONNX. vLLM y TGI no estan pensados para estos artefactos ONNX; para servir la version PyTorch habria que acudir al checkpoint original del modelo base, opcion no documentada en esta ficha.
- Latencia y throughput: el unico dato disponible es la prueba de humo de 5,1 ms en CPU para el decodificador fp32 con entradas triviales. No hay mediciones de generacion de secuencias largas ni de tokens por segundo.
- Nota de despliegue: los ficheros de parametros estan etiquetados como `registry` y se sirven desde `models.skillsafe.ai` una vez vetados, por lo que una aplicacion que dependa de ellos debe considerar esa dependencia de red o alojarlos por su cuenta.

## Comparativa con modelos similares

Solo las dos primeras filas se pueden contrastar con la informacion proporcionada; las restantes se incluyen como referencia de familia y no han sido verificadas en esta ficha.

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Observaciones |
|---|---|---|---|---|---|
| skillsafe-ai/flan-t5-small | no disponible (T5-small de referencia: ~77 M) | no disponible (canonico: 512 tokens) | ONNX fp32 y q8 | Apache 2.0 | Import reproducible con SHA-256 por fichero, pensado para navegador; 0 descargas y 0 likes en el momento de la consulta |
| Xenova/flan-t5-small (upstream) | identico, es el mismo modelo | identico | ONNX | Apache 2.0 | Fuente directa de la importacion; commit `311454e83bc784267fd7eef5940ee854144abbec` |
| google/flan-t5-small (origen de la familia) | identico | identico | safetensors / PyTorch | Apache 2.0 | No enlazado en la documentacion proporcionada; citado solo como linaje |
| flan-t5-base (alternativa mayor de la familia) | mayor que small, cifra no disponible en la ficha | no disponible | safetensors / PyTorch | Apache 2.0 | Ofreceria mas calidad a cambio de mas memoria y de no estar empaquetado para navegador; datos no verificados aqui |

La diferencia real entre las tres primeras filas es el formato y el proceso de publicacion, no los pesos. Frente a un modelo generativo moderno, la limitacion relevante no es la licencia sino la escala: se trata de una variante small destinada a tareas acotadas.

## Limitaciones y advertencias

- Riesgo de alucinacion alto: con un modelo de este tamano y sin datos de evaluacion publicados, las respuestas pueden ser plausibles pero incorrectas, especialmente en Q&A factual.
- Idioma: la ficha no declara idiomas soportados. La familia FLAN-T5 esta fuertemente orientada al ingles, por lo que el rendimiento en castellano no esta garantizado ni medido.
- Ventana de contexto corta: la configuracion canonica de T5-small admite 512 tokens, lo que impide resumir documentos largos o mantener conversaciones multi-turno extensas sin trocear la entrada.
- No es un modelo conversacional: es texto-a-texto y no se declara ningun ajuste de dialogo, formato de chat ni plantilla de mensajes. Tampoco se declara soporte de tool calling.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, sesgo o toxicidad en la informacion disponible.
- Sesgos desconocidos: al no documentarse la composicion del dataset de entrenamiento ni el proceso de ajuste, no se pueden enumerar sesgos concretos.
- Fecha de publicacion futura: la ficha indica creacion el 2026-09-22, posterior a la fecha habitual de consulta, dato a tener en cuenta al evaluar la vigencia del repositorio.
- Senales de adopcion nulas: cero descargas y cero likes, sin issues ni discusion visible en la informacion proporcionada.
- Dependencia de terceros: los pesos no proceden del release original, sino de una conversion intermedia (Xenova), y parte de los ficheros se sirven desde un registro externo (`models.skillsafe.ai`) sujeto a vetting.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la ficha no ofrece ninguna garantia de calidad ni de idoneidad para produccion. No se indican restricciones adicionales ni clausulas de uso aceptable mas alla de la licencia.
- Verificacion limitada: la validacion publicada consiste en `onnx.checker` y una unica ejecucion de humo con entradas de ceros en CPU, no en pruebas funcionales de calidad de generacion.

## Enlaces

- Pagina de HuggingFace del modelo: https://huggingface.co/skillsafe-ai/flan-t5-small
- Upstream en HuggingFace: https://huggingface.co/Xenova/flan-t5-small/tree/311454e83bc784267fd7eef5940ee854144abbec
- Recetas y conversor de SkillSafe: https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. Las consultas devolvieron documentacion de Google Flights y un hilo de Stack Overflow sobre Selenium, sin relacion con este repositorio.
