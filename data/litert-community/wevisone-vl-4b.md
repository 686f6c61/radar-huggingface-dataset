# litert-community/WeVisOne-VL-4B

## Resumen

WeVisOne-VL-4B es un modelo de vision-lenguaje desarrollado por WeChat Vision (Tencent) sobre la base de Qwen3-VL, orientado a tareas de percepcion visual estructurada: deteccion de objetos, comprension de expresiones referenciales, point grounding, conteo y OCR. El modelo original se publica en `tencent/WeVisOne-VL-4B`; el repositorio que nos ocupa es una conversion cuantizada del mismo a LiteRT-LM, mantenida por la comunidad `litert-community`, pensada para inferencia en dispositivo (on-device) sobre Android.

La conversion conserva el codificador de vision, el adaptador visual, el embedder de tokens y el decodificador, y ofrece dos variantes: una int4 (3,5 GB) para GPU y otra int8 (5,4 GB) para CPU. El modelo responde a peticiones de deteccion, referencias, pointing, conteo y OCR como texto estructurado, utilizando tokens de coordenadas `<0>` a `<1000>` que representan milesimas del ancho y alto de la imagen.

Es relevante ahora porque demuestra que un VLM de 4B puede ejecutarse en un telefono movil moderno (Galaxy S26) con latencias de primer token de 4,86 s y 15,2 tokens/s en decodificacion, manteniendo la misma calidad que el modelo original en float32 sobre un conjunto de 21 preguntas de prueba. La licencia Apache 2.0 facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3-VL (decodificador transformer de 36 capas con codificador de vision y adaptador visual) |
| Parametros totales | no disponible (modelo base de 4B; el decodificador tiene 36 capas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (prompt + respuesta, en la configuracion LiteRT-LM `fast_vlm`) |
| Tipos de cuantizacion | int4 (decodificador y capa de salida, bloques de 32 valores con una escala por bloque), int8 (embedder de tokens en int4; decodificador, salida y embedder en int8 para CPU), float16 (codificador de vision y adaptador) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM, layout de pesos externos) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3-VL, con un decodificador transformer de 36 capas y un codificador de vision seguido de un adaptador que proyecta las caracteristicas visuales al espacio del decodificador. La salida de tareas de grounding se expresa como texto estructurado con tokens de coordenadas discretos en el rango `<0>`–`<1000>`, lo que permite representar cajas y puntos como secuencias de tokens normales. El repositorio incluye el `tokenizer.json` del modelo original byte a byte.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La model card menciona que el modelo original incluye un decodificador de pixeles de 9,6M de parametros para segmentacion y matting, que no esta incluido en esta conversion LiteRT-LM. La conversion se realizo con litert-torch 0.10.0 y la inferencia se valido con LiteRT-LM v0.19.1.

## Capacidades

- Deteccion de objetos: localiza todas las instancias que coinciden con una descripcion, devolviendo cajas delimitadoras como tokens de coordenadas.
- Comprension de expresiones referenciales (referring expression comprehension): localiza la instancia descrita por una frase.
- Point grounding: senala puntos concretos de la imagen a partir de etiquetas.
- Conteo de objetos con cajas: cuenta objetos y los delimita.
- OCR: reconocimiento de texto en imagenes (segun los tags del repositorio).
- Respuesta a preguntas sobre imagenes mediante plantillas fijas de tarea.
- Procesamiento de una unica imagen por inferencia (`maxNumImages = 1`).
- No soporta segmentacion ni matting (requiere el decodificador de pixeles del modelo original, no incluido).
- No se han probado preguntas de formato libre sobre imagenes segun la model card.

## Casos de uso

- Deteccion de objetos en aplicaciones moviles: integrado mediante el SDK `com.google.ai.edge.litertlm:litertlm-android:0.19.1`, el modelo permite localizar personas, vehiculos u objetos en una foto capturada por el telefono y devolver cajas delimitadoras en coordenadas normalizadas.
- Conteo automatico de inventario: en aplicaciones de retail o logistica, el modelo puede contar articulos en una imagen (por ejemplo, "How many airplanes in the image? Please count them with boxes.") y devolver las cajas correspondientes para verificacion.
- Accesibilidad visual: descripcion y localizacion de objetos para usuarios con discapacidad visual, aprovechando el point grounding para indicar la posicion de un objeto concreto en la escena.
- OCR en dispositivo: extraccion de texto de documentos o carteles sin enviar la imagen a un servidor, gracias a la inferencia local en GPU o CPU del telefono.
- Asistencia en inspeccion de calidad: deteccion de defectos o elementos concretos en imagenes de producto mediante expresiones referenciales, con resultados estructurados que pueden procesarse aguas abajo.
- Automatizacion de tareas de anotacion: generacion de cajas y puntos preetiquetados para conjuntos de datos de vision, usando las plantillas de deteccion y referring del paquete original.
- Aplicaciones de realidad aumentada: localizacion de objetos en tiempo real en el flujo de camara del dispositivo, con latencias de primer token de 4,86 s y 15,2 tokens/s en un Galaxy S26.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta una evaluacion de equivalencia: sobre 21 preguntas de prueba con respuesta conocida (11 sobre imagenes y 10 solo texto), la version int4 obtiene la misma puntuacion que el modelo original en float32.

| Metrica | Valor |
|---|---|
| Equivalencia con el original (21 preguntas) | Misma puntuacion que float32 |
| Latencia de primer token (Galaxy S26, GPU, int4) | 4,86 s |
| Throughput de decodificacion (Galaxy S26, GPU, int4) | 15,2 tokens/s |
| Tamano del archivo int4 | 3.507.963.904 bytes (3,5 GB) |
| Tamano del archivo int8 | 5.359.046.656 bytes (5,4 GB) |
| Cache de primera ejecucion (int4) | ~0,46 GB |
| Cache de primera ejecucion (int8) | ~5,69 GB |

## Requisitos de hardware

- VRAM/RAM estimada: el archivo int4 ocupa 3,5 GB y el int8 5,4 GB; se recomienda disponer de al menos esa cantidad de memoria mas el espacio para cache (0,46 GB en int4, 5,69 GB en int8).
- GPU recomendadas: la model card valida el archivo int4 en la GPU de un Galaxy S26 (Android). No se especifican modelos de GPU de escritorio.
- CPU: el archivo int8 esta pensado para CPU con `--num_cpu_threads=4`.
- Cabe en GPU de consumo: si, en la GPU integrada de un telefono movil moderno como el Galaxy S26; no se documentan pruebas en RTX 4090 u otras GPU de escritorio.
- Opciones de despliegue: LiteRT-LM v0.19.1 o superior (binario `litert_lm_advanced_main` para `android_arm64`), SDK Android `com.google.ai.edge.litertlm:litertlm-android:0.19.1`, backend GPU o CPU.
- Latencia y throughput: 4,86 s hasta el primer token y 15,2 tokens/s en decodificacion en Galaxy S26 con GPU e int4; la model card indica que la velocidad sigue en optimizacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo base `tencent/WeVisOne-VL-4B` en float32 sirve de comparacion directa en calidad (misma puntuacion en las 21 preguntas de prueba) y en tamano (el repositorio LiteRT-LM ocupa 17,7 GB frente a los archivos cuantizados de 3,5 GB y 5,4 GB).

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| WeVisOne-VL-4B (LiteRT-LM int4) | 4B (decodificador de 36 capas) | 2.048 tokens | Apache 2.0 | `.litertlm` |
| WeVisOne-VL-4B (LiteRT-LM int8) | 4B (decodificador de 36 capas) | 2.048 tokens | Apache 2.0 | `.litertlm` |
| tencent/WeVisOne-VL-4B (original) | 4B | no disponible | Apache 2.0 | safetensors (no confirmado) |

## Limitaciones y advertencias

- No realiza segmentacion ni matting: requiere el decodificador de pixeles de 9,6M de parametros del modelo original, que no esta incluido en esta conversion.
- Contexto limitado a 2.048 tokens para prompt y respuesta, lo que restringe conversaciones largas o imagenes con prompts extensos.
- Procesa una sola imagen por inferencia (`maxNumImages = 1`).
- Solo se han validado preguntas con las plantillas fijas de tarea del paquete original; las preguntas de formato libre sobre imagenes no se probaron.
- El preprocesado de imagen es estricto: rotacion EXIF, redimensionado a 512 × 512 con filtro BICUBIC, sin padding ni recorte, y guardado en PNG; otros metodos de redimensionado no se probaron.
- La decodificacion es greedy (el archivo no incluye ajustes de sampler), lo que puede reducir la diversidad de respuestas.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgo de alucinacion en la documentacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones del modelo base original.
- La velocidad de inferencia sigue en optimizacion segun la model card, por lo que el rendimiento puede variar entre versiones del runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/WeVisOne-VL-4B
- Modelo base original: https://huggingface.co/tencent/WeVisOne-VL-4B
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Repositorio WeVisOne-VL (plantillas de tareas): https://github.com/Tencent/WeVisOne-VL
- Mediciones detalladas: https://huggingface.co/litert-community/WeVisOne-VL-4B/blob/main/MEASUREMENTS.md
