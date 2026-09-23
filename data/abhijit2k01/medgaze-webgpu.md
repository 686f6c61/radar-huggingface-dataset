# abhijit2k01/medgaze-webgpu

## Resumen

Medgaze-webgpu es un paquete de pesos en formato ONNX publicado por abhijit2k01 para ejecutar en el navegador la demostración de "fixation heads" del proyecto GazeHeads. No es un modelo entrenado desde cero: se trata de una reexportación de HuggingFaceTB/SmolVLM-256M-Instruct (Apache 2.0), un modelo vision-lenguaje generalista de unos 256 millones de parametros, modificado para que una pagina web pueda dirigir sus cabezas de atencion de fijacion y leer sus mapas de atencion en tiempo real.

El interes tecnico esta en el mecanismo de steering: la interfaz del decoder acepta un tensor de ganancias por cabeza (`head_gain [30,9]`) y una firma por token (`key_sign`), de modo que se suma un sesgo a los logits de atencion de cada cabeza sobre cada clave. Con esa señal es posible orientar la atencion del modelo hacia una region concreta de la imagen y, ademas, recuperar la matriz de atencion post-softmax de la ultima fila de consulta para todas las cabezas. Los pesos se cuantizan en 8 bits por bloques (MatMulNBits, bloque 32) para poder ejecutarse con los execution providers WebGPU y WASM de onnxruntime-web.

Es relevante ahora porque demuestra que un modelo vision-lenguaje completo y su instrumentacion de interpretabilidad pueden desplegarse integramente en el lado del cliente, sin servidor, con un peso total de unos 0,3 GB. El propio autor advierte que es un modelo generalista de demostracion y que no es uno de los modelos medicos evaluados en el articulo asociado, por lo que no debe usarse con fines clinicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: encoder SigLIP con conector pixel-shuffle + decoder transformer de 30 capas con KV cache; el decoder expone la atencion de todas las cabezas |
| Parametros totales | Aproximadamente 256 M (segun la denominacion del modelo base SmolVLM-256M-Instruct) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la cache KV es dinamica (`past_kv [30,2,3,P,64]`, con P = 0 en el prefill inicial) |
| Tipos de cuantizacion | int8 con cuantizacion por bloques (MatMulNBits, block 32); la version de 4 bits fue probada y descartada; existen grafos fp32 de referencia usados en las comprobaciones de exportacion |
| Idiomas soportados | No disponibles en la informacion proporcionada |
| Licencia | No disponible para este repositorio; el modelo base SmolVLM-256M-Instruct es Apache 2.0 |
| Formato de pesos | ONNX (`vision_q8.onnx`, `decoder_q8.onnx`) + embeddings en binario (`embed_tokens.bin`) + `tokenizer.json` + `demo_config.json` |
| Tamano del repositorio | 0,3 GB (110 MB vision, 152 MB decoder, 29 MB embeddings, 3,5 MB tokenizer, 16 KB config) |
| Vocabulario | 49.280 tokens |
| Dimension oculta | 576 |
| Cabezas de atencion | 9 cabezas de consulta y 3 de clave/valor por capa (GQA) con dimension de cabeza 64 |
| Entrada de vision | `pixel_values [N,3,512,512]` → `image_features [N,64,576]` |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La pieza exportada es SmolVLM-256M-Instruct, un modelo vision-lenguaje compuesto por un encoder visual SigLIP seguido de un conector pixel-shuffle que reduce la rejilla de parches a 64 tokens de imagen de dimension 576, y un decoder autorregresivo de 30 capas con atencion de consultas agrupadas (9 cabezas de consulta, 3 de clave/valor, dimension de cabeza 64) y vocabulario de 49.280 tokens. La exportacion a ONNX conserva la cache KV de todas las capas (`past_kv [30,2,3,P,64]`) y devuelve, ademas de los logits, el tensor `present_kv` y la atencion de la ultima consulta en todas las cabezas (`attn_last [30,9,P+S]`).

La innovacion no esta en el entrenamiento, sino en la interfaz de inferencia y en el mecanismo de steering. La cabeza (l,h) recibe, sumado a su logit de atencion sobre la clave k, el termino `head_gain[l,h] * key_sign[k]`. Ajustando `key_sign` a +1 en los tokens de imagen de una region, -1 en el resto de tokens de imagen y 0 en el texto, y `head_gain` a un valor g en las cabezas de fijacion y 0 en el resto, se reproduce el sesgo de steering descrito en el articulo. El uso previsto es hacer prefill de todos los tokens del prompt menos el ultimo con ganancia cero, y alimentar despues el ultimo token del prompt y cada token generado con la ganancia activada. Las cabezas de fijacion se identificaron aplicando el protocolo de descubrimiento del articulo sobre 200 montajes de VQA-RAD de 6 imagenes cada uno. El artefacto se genero con el script `scripts/118_webgpu_export.py` del repositorio GazeHeads. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni etapas de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto autorregresiva con cache KV incremental, exportada a ONNX con cuantizacion int8 por bloques.
- Comprension de imagenes: encoder SigLIP que convierte imagenes de 512x512 en 64 tokens visuales de dimension 576.
- Steering de atencion por cabeza: control fino del sesgo aplicado a los logits de atencion de cada una de las 30x9 cabezas mediante `head_gain` y `key_sign`.
- Lectura de atencion: salida `attn_last [30,9,P+S]` con la atencion post-softmax de la ultima fila de consulta para todas las cabezas, lo que permite generar mapas de fijacion.
- Ejecucion integra en el navegador mediante onnxruntime-web con los execution providers WebGPU y WASM.
- Inferencia con contexto variable gracias a la cache KV dinamica (P puede ser 0).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito, vision de video o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Demostracion interactiva de interpretabilidad en el navegador: una pagina web puede cargar `vision_q8.onnx` y `decoder_q8.onnx`, dejar que el usuario dibuje una region sobre la imagen y visualizar en vivo como cambia `attn_last` al activar `head_gain` en las cabezas de fijacion.
- Investigacion sobre steering de atencion: el artefacto reproduce el sesgo del articulo, de modo que un grupo puede experimentar con valores de ganancia, regiones y capas sin necesidad de infraestructura de GPU ni de reentrenar nada.
- Docencia de mecanismos de atencion: al devolver la matriz de atencion completa por capa y cabeza, sirve para explicar atencion multi-cabeza, GQA y softmax sobre un modelo real de 30 capas que cabe en un navegador.
- Prototipado de asistentes visuales sin servidor: aplicaciones de escritorio o web que necesiten describir o responder preguntas sobre una imagen y no puedan enviar datos a un backend, gracias a los 0,3 GB de pesos y a la ejecucion local con WebGPU.
- Validacion de pipelines de exportacion ONNX: las comprobaciones del autor (coincidencia de tokens greedy con PyTorch, correlacion de mapas de atencion) lo convierten en un caso de prueba util para verificar que una cadena de exportacion y cuantizacion no degrada el modelo.
- Pruebas de cuantizacion en produccion: el repositorio documenta que int8 con bloque 32 mantiene correlaciones de 0,996 a 0,999 mientras que 4 bits cae hasta 0,50, un dato directamente aplicable al disenar despliegues cuantizados de modelos vision-lenguaje.
- Base para demostraciones de VQA medica con fines de investigacion: se puede usar como sustituto ligero en prototipos de pregunta-respuesta sobre imagenes, siempre que se respete la advertencia del autor de que no es un modelo clinico y no debe emplearse en diagnostico.
- Evaluacion de latencia en cliente: util para medir el rendimiento real de WebGPU y WASM en equipos de usuario final antes de comprometerse con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo documenta comprobaciones de fidelidad de la exportacion y de la cuantizacion:

| Comprobacion | Resultado |
|---|---|
| Grafos fp32 frente a PyTorch con hooks `medgaze.steering` | Mismos tokens greedy en 3 imagenes SLAKE, con y sin steering; misma atencion de cabezas de fijacion (r = 1,0000) |
| Mapa de atencion int8 frente a PyTorch | r = 0,996 a 0,999 |
| Respuestas greedy int8 | Identicas en los primeros 5 a 24 tokens; respuesta completa identica en 5 de 12 ejecuciones |
| Cuantizacion de 4 bits | Descartada: las respuestas cambian en 1 a 3 tokens y r baja hasta 0,50 |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Los pesos suman unos 291 MB (110 MB vision + 152 MB decoder + 29 MB embeddings) mas el tokenizer; con activaciones y cache KV, un presupuesto de 0,5 a 1 GB es suficiente en la mayoria de casos.
- GPU recomendadas: cualquier GPU integrada o dedicada con soporte de WebGPU en el navegador; tambien funciona en CPU mediante el execution provider WASM.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas iGPU de portatiles y telefonos compatibles. No requiere A100 ni H100.
- Opciones de despliegue: onnxruntime-web con WebGPU o WASM (escenario previsto por el autor), onnxruntime nativo para Python/C++/movil. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, dado que el formato es ONNX y el modelo es pequeno.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| medgaze-webgpu | ~256 M | No disponible | ONNX int8 (MatMulNBits, bloque 32) | No disponible (base Apache 2.0) | Exportacion instrumentada para steering y lectura de atencion en navegador |
| SmolVLM-256M-Instruct (modelo base) | ~256 M | No disponible en la informacion proporcionada | safetensors / PyTorch | Apache 2.0 | Modelo generalista original, sin la interfaz de steering ni las salidas de atencion |
| Otras exportaciones ONNX de SmolVLM | No disponible | No disponible | ONNX | Segun el publicador | La informacion proporcionada no incluye comparativas de rendimiento con estas |
| Alternativas vision-lenguaje de ~0,3 a 2 B (por ejemplo variantes SmolVLM2 o moondream) | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion |

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo es un generalista usado para demostrar el mecanismo y que no es uno de los modelos medicos evaluados en el articulo; no debe usarse con fines clinicos ni de diagnostico.
- El repositorio no declara licencia propia. Aunque el modelo base es Apache 2.0, la licencia aplicable a esta exportacion y a sus artefactos derivados no esta especificada, lo que conviene aclarar antes de cualquier uso comercial.
- La cuantizacion int8 introduce divergencia: la respuesta completa solo coincide con la referencia PyTorch en 5 de 12 ejecuciones, aunque los primeros 5 a 24 tokens son identicos. Para tareas sensibles a tokens lejanos hay que asumir deriva.
- La cuantizacion de 4 bits queda descartada por el propio autor: degrada la correlacion del mapa de atencion hasta 0,50 y altera la respuesta en 1 a 3 tokens.
- Las cabezas de fijacion se descubrieron sobre 200 montajes de VQA-RAD; su comportamiento fuera de ese dominio de imagenes no esta documentado.
- El mecanismo de steering esta definido para regiones sobre tokens de imagen; no se describe su uso sobre texto ni sobre secuencias sin imagen.
- No hay datos publicados sobre sesgos, composicion del dataset de entrenamiento del modelo base, idiomas soportados ni tasas de alucinacion.
- El repositorio tiene 0 descargas y 0 likes y no declara pipeline, lo que indica que se trata de un artefacto de investigacion sin validacion externa.
- La ejecucion depende de WebGPU en el cliente; en navegadores o equipos sin soporte cae al execution provider WASM, cuyo rendimiento no esta documentado.
- El contexto maximo no se especifica; el consumo de memoria de la cache KV crece con la secuencia y con el numero de imagenes procesadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhijit2k01/medgaze-webgpu
- Modelo base SmolVLM-256M-Instruct: https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct
- Repositorio GazeHeads (mencionado en la model card, script `scripts/118_webgpu_export.py`): no se proporciona URL en la informacion disponible
- Articulo con el protocolo de descubrimiento de cabezas de fijacion y el sesgo de steering: no se proporciona referencia ni enlace en la informacion disponible
- Demostracion web en el navegador: no se proporciona URL en la informacion disponible
