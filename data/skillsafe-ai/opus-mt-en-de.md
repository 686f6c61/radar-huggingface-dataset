# skillsafe-ai/opus-mt-en-de

## Resumen

skillsafe-ai/opus-mt-en-de es un reempaquetado de artefactos ONNX para traducción automática inglés→alemán, publicado por SkillSafe a partir de una fuente upstream fijada por commit (`Xenova/opus-mt-en-de`, commit `1ca130c44c4c5441ef16d48aae521a424ab644f7`). El modelo subyacente es un MarianMT, es decir, un transformer encoder-decoder clásico de traducción neuronal, convertido al formato ONNX para poder ejecutarse en el navegador mediante transformers.js y onnxruntime-web.

El problema que resuelve es concreto: permitir traducción inglés-alemán íntegramente en cliente (navegador o edge), sin enviar el texto a un servidor. Con 0,5 GB de repositorio y pesos fp32 que suman unos 398 MB (encoder 186,74 MB más decoder 211,41 MB), es un modelo ligero, orientado a latencia baja y despliegue sin GPU dedicada, no a traducción de alta calidad en dominios especializados.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de una importación reproducible, con cada fichero fijado por SHA-256 y verificado con `onnx.checker` y una ejecución de humo en CPU, pero sin evaluación de calidad de traducción publicada, sin métricas BLEU/COMET y con 0 descargas y 0 likes en el momento de la consulta. La model card original está truncada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder seq2seq), exportado a ONNX |
| Parametros totales | no disponible de forma oficial; los artefactos fp32 suman 398,15 MB (encoder 186,74 MB + decoder 211,41 MB), lo que a 4 bytes por parametro sugiere del orden de 100 M de parametros (estimacion no confirmada por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; la verificacion de humo se ejecuto con secuencias de 8 tokens en el encoder y 4 en el decoder, shapes de prueba que no documentan el maximo |
| Tipos de cuantizacion | fp32 y q8 (INT8); `decoder_model_merged_quantized.onnx` ocupa 54,03 MB frente a 211,41 MB del decoder fp32 |
| Idiomas soportados | ingles a aleman (par unico); los metadatos de idioma de HuggingFace figuran como no disponibles |
| Licencia | CC-BY-4.0, declarada como `license: other` con `license_name: cc-by-4.0` |
| Formato de pesos | ONNX (`onnx/encoder_model.onnx`, `onnx/decoder_model_merged.onnx`, `onnx/decoder_model_merged_quantized.onnx`); tokenizador en `tokenizer.json`, `tokenizer_config.json` y `vocab.json`; no se publican safetensors ni GGUF |

Datos derivados de las shapes de la verificacion: `d_model` = 512, 8 cabezas de atencion de 64 dimensiones, 6 capas en el decoder (`past_key_values.0` a `past_key_values.5`), vocabulario de 58.101 tokens. Tamano del repositorio: 0,5 GB. Creado y actualizado el 2026-09-22.

## Arquitectura y entrenamiento

La arquitectura es MarianMT, un transformer seq2seq con encoder y decoder separados y atencion cruzada, tal como se refleja en los ficheros ONNX. El grafo del decoder esta exportado en variante "merged", que unifica en un solo grafo los caminos con y sin cache (entrada `use_cache_branch`), de modo que se puede reutilizar el mismo artefacto para el prefill y para la decodificacion autoregresiva con `past_key_values`. Las shapes confirman 6 capas de decoder, 8 cabezas por capa, dimension de modelo 512 y vocabulario de 58.101 entradas, lo que corresponde a un modelo de traduccion de gama pequena.

Sobre el entrenamiento no hay informacion en los materiales proporcionados: no se documentan tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o fine-tuning posterior. Lo unico verificable es la cadena de procedencia: los pesos proceden del repositorio upstream citado y el reempaquetado se hizo con una receta reproducible (`recipes/opus-mt-en-de.yaml`, SHA-256 `486261838054ee6df3a38303ce6511c24438cd5ff35c13d1621e3e76d3b8c549`), con toolchain Python 3.12.13, torch 2.10.0, onnx 1.23.0 y onnxruntime 1.30.0 sobre Darwin 25.6.0 arm64. La model card indica "imported as published upstream (no conversion)": no hubo reconversion, solo importacion con ficheros fijados por hash.

## Capacidades

- Traduccion automatica de ingles a aleman, unica tarea del modelo (pipeline `translation`, `text2text-generation`).
- Ejecucion en navegador: los artefactos estan preparados para transformers.js y onnxruntime-web, con ONNX como formato nativo.
- Ejecucion en CPU sin GPU: la verificacion de humo se completo en CPU con `onnx.checker` y onnxruntime.
- Soporte de cache de clave/valor (`past_key_values`), imprescindible para decodificacion autoregresiva eficiente en frases largas.
- Cuantizacion a 8 bits disponible para el decoder, pensada para reducir huella de memoria en cliente.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No hay capacidades multilingues mas alla del par ingles-aleman: no es un modelo de traduccion universal.
- No es un modelo conversacional ni de instrucciones: no acepta system prompts ni plantillas de chat documentadas.

## Casos de uso

- Traduccion local en el navegador: integrar el modelo en una web o extension mediante transformers.js para traducir texto ingles a aleman sin enviar contenido a un servidor, util en entornos con requisitos de privacidad o RGPD estrictos.
- Traduccion de interfaz y microcopy en aplicaciones web: con pesos q8 de ~54 MB en el decoder, es viable precargar el modelo en cliente y traducir etiquetas, mensajes de error o textos de ayuda bajo demanda.
- Traduccion de documentacion tecnica en pipelines estaticos: procesar ficheros Markdown o AsciiDoc en ingles a aleman durante el build, aprovechando que el modelo es ONNX y se ejecuta en CPU sin dependencias de GPU.
- Atencion al cliente en comercio electronico: traducir tickets y correos de clientes de habla inglesa a aleman para agentes germanoparlantes, en un flujo interno donde la latencia baja importa mas que la calidad literaria.
- Preprocesado en pipelines de NLP: usar la traduccion en-de como paso previo para alimentar analisis de sentimiento, clasificacion o indexado de busqueda sobre modelos o lexicos disponibles solo en aleman.
- Aplicaciones offline o PWA: empaquetar el modelo en una aplicacion progresiva para que la traduccion funcione sin conexion, algo posible gracias al tamano reducido de los artefactos.
- Procesamiento por lotes de resenas de producto: traducir resenas en ingles a aleman para consolidar opiniones en un unico idioma y explotarlas con herramientas de analitica.

En todos los casos conviene recordar que no hay evaluacion de calidad publicada para este reempaquetado; la idoneidad debe validarse con un conjunto propio del dominio objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay valores de BLEU, COMET, MMLU, HumanEval ni GSM8K, ni comparaciones oficiales con otros sistemas de traduccion.

Lo unico medido es una verificacion de humo en CPU, con entradas rellenas de ceros y shapes minimas, que no constituye un benchmark de calidad ni de rendimiento real:

| Artefacto | Entradas (shapes de prueba) | Salidas | Tiempo declarado |
|---|---|---|---|
| `decoder_model_merged.onnx` (fp32) | `input_ids[1,4]`, `encoder_hidden_states[1,8,512]` | `logits[1,4,58101]` + 24 tensores `present.*` | 5,5 ms |
| `decoder_model_merged_quantized.onnx` (q8) | identicas al anterior | identicas al anterior (tabla truncada en la model card) | no disponible |

## Requisitos de hardware

- VRAM para inferencia en fp32: inferior a 1 GB en la practica; los pesos suman 398,15 MB y el resto es overhead de runtime y cache de atencion.
- VRAM para inferencia en q8: en torno a 100-150 MB estimados (decoder cuantizado de 54,03 MB mas el encoder cuantizado, cuyo tamano no se desglosa en el listado: el encoder figura como "fp32, q8" agrupado en 186,74 MB).
- GPU recomendadas: cualquier GPU consumer moderna sirve; no se necesita A100 ni H100. Es un modelo pensado para CPU y para WebGPU/WASM en navegador.
- Cabe en GPU consumer: si, en cualquier RTX o equivalente, y tambien en CPU y en movil, al tratarse de un modelo de traduccion de gama pequena.
- Opciones de despliegue: transformers.js en navegador (WebGPU o WASM), onnxruntime-web, onnxruntime en Python o C++. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente; no hay integracion documentada con vLLM ni TGI.
- Latencia y throughput: el unico dato es el smoke test de 5,5 ms para el decoder fp32 en CPU arm64 con `input_ids[1,4]` y encoder de 8 tokens. No es representativo de una traduccion completa y no debe usarse para dimensionar produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| skillsafe-ai/opus-mt-en-de | no disponible (estimado ~100 M por tamano de artefactos) | no disponible | CC-BY-4.0 | ONNX (fp32 y q8) | 0 descargas, 0 likes; import reproducible con SHA-256 |
| Xenova/opus-mt-en-de (upstream) | no disponible | no disponible | no disponible en la informacion proporcionada | ONNX | Repositorio de origen fijado en el commit `1ca130c44c4c5441ef16d48aae521a424ab644f7` |
| Helsinki-NLP/opus-mt-en-de (origen presumible) | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | No mencionado en la model card; la cadena de derivacion no se documenta |

No hay datos de rendimiento ni de parametros exactos para ninguna de las alternativas en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. Otras familias de traduccion (NLLB, mBART, modelos multimodelo via API) no aparecen documentadas en los materiales revisados. La busqueda web realizada no devolvio resultados relevantes para este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no haber evaluacion publicada, no se puede afirmar nada sobre sesgos de genero, registro o terminologia.
- Riesgo de alucinacion: presente como en cualquier modelo seq2seq de traduccion; puede producir traducciones fluidas pero incorrectas en terminologia especializada, nombres propios, numeros o unidades.
- Cobertura idiomatica: solo ingles a aleman, en una unica direccion. No traduce de aleman a ingles ni a terceros idiomas.
- Contexto: la longitud maxima soportada no esta documentada. La verificacion se hizo con 8 tokens de encoder, un valor de prueba que no aporta informacion sobre el limite real; para documentos largos habra que segmentar y validar.
- Licencia: CC-BY-4.0 exige atribucion. Ademas hay una discrepancia entre la etiqueta `license: other` y `license_name: cc-by-4.0`, por lo que conviene confirmar los terminos antes de un uso comercial.
- Validacion inexistente en la comunidad: 0 descargas y 0 likes en el momento de la consulta; el modelo se ha publicado recientemente y sin retroalimentacion de terceros.
- Verificacion limitada: se comprobo la integridad estructural (SHA-256, `onnx.checker`) y una ejecucion con entradas a cero, no la correccion ni la calidad de las traducciones.
- Artefactos parciales: la model card aparece truncada, el encoder cuantizado no tiene entrada propia en el listado y no se publican pesos en safetensors ni GGUF, lo que limita las opciones de despliegue fuera del ecosistema ONNX.
- Repositorio dependiente de servicio externo: los ficheros de clase `registry` se sirven desde `models.skillsafe.ai`, lo que introduce una dependencia de disponibilidad de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafe-ai/opus-mt-en-de
- Upstream fijado (Xenova/opus-mt-en-de, commit `1ca130c44c4c5441ef16d48aae521a424ab644f7`): https://huggingface.co/Xenova/opus-mt-en-de/tree/1ca130c44c4c5441ef16d48aae521a424ab644f7
- Receta de conversion y codigo del conversor (SkillSafe): https://github.com/skillsafe-admin/skillsafe.ai-website/tree/main/models
- Servidor de artefactos `registry`: https://models.skillsafe.ai

La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos no guardan relacion con el contenido de la ficha y se han descartado.
