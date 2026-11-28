# 13fragments/kurrent-transcriber-1b

## Resumen

Kurrent Transcriber 1B es un modelo especializado en reconocimiento de escritura manuscrita historica alemana (HTR), desarrollado por 13fragments. Transcribe paginas completas de documentos escritos en Kurrent, Sütterlin y grafias alemanas relacionadas, devolviendo el texto linea a linea tal como aparece en el original. El modelo parte de LightOnOCR-3-1B (Apache-2.0) y se construye como una fusion de pesos de dos fine-tunes: uno propio del autor (no publicado) y LightOnOCR-HGH de Bernhard Straub.

Con aproximadamente 1.005 millones de parametros (1B), el modelo esta disenado para inferencia local y offline en hardware propio, sin necesidad de segmentacion previa por lineas. Es relevante porque aborda un nicho concreto y dificil: la digitalizacion de archivos historicos alemanes, donde los modelos OCR genericos fallan sistematicamente. El autor ha publicado casos de estudio reales, como la lectura de las 26.325 paginas del censo medico bavaro de 1858.

La licencia de los pesos es CC BY-SA 4.0 (el codigo de inferencia es Apache-2.0), y el modelo se distribuye tambien en formato GGUF para llama.cpp. Su salida debe tratarse como borrador y verificarse siempre contra el escaneo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Mistral3 / LightOnOCR-3-1B; fusion de pesos (merge) de dos fine-tunes |
| Parametros totales | 1.005.647.872 (~1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; limite de generacion de 4.096 tokens nuevos por peticion |
| Tipos de cuantizacion | GGUF disponible (ver repositorio GGUF del autor); cuantizaciones concretas no disponibles |
| Idiomas soportados | aleman (de); casi la totalidad de los datos de entrenamiento es aleman |
| Licencia | CC BY-SA 4.0 (pesos); Apache-2.0 (codigo de inferencia) |
| Formato de pesos | safetensors (transformers); GGUF para llama.cpp |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo image-text-to-text construido sobre LightOnOCR-3-1B (etiquetado como mistral3 en Hugging Face). La construccion es una fusion de pesos: el codificador visual y la proyeccion vision-lenguaje son el promedio de dos fine-tunes (el propio del autor y LightOnOCR-HGH de Bernhard Straub), mientras que el modelo de lenguaje es el del modelo base. El resultado es un modelo de ~1B de parametros que recibe una imagen de pagina completa y genera la transcripcion sin paso intermedio de segmentacion por lineas.

El entrenamiento se apoya en tres conjuntos de datos publicos de dh-unibe: image-text_kurrent-xix, image-text_historisches-grundbuch-basel_xix-xx e image-text_german-20th-century. No se detallan en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO. Una innovacion operativa destacable es el llamado "image step": antes de la lectura, el cliente pinta sobre el mobiliario ajeno a la hoja (cartas de color, reglas, bandas de biblioteca y margenes), lo que forma parte fija del motor de release junto con decodificacion greedy, un maximo de 4.096 tokens nuevos y una penalizacion de repeticion con ventana de 1.1 sobre los ultimos 20 tokens.

## Capacidades

- Transcripcion de paginas completas de escritura manuscrita historica alemana: Kurrent, Sütterlin y grafias relacionadas.
- Reconocimiento a nivel de pagina sin segmentacion previa por lineas.
- Salida linea a linea respetando el orden del original.
- Mapeo de marcado presente en el documento: texto tachado, insertado y subrayado.
- Procesamiento de imagenes de pagina con preprocesado integrado (image step) para eliminar elementos ajenos a la hoja.
- Inferencia offline en hardware propio gracias a su tamano de ~1B parametros.
- Distribucion en GGUF para su uso con llama.cpp.
- Capacidad conversacional declarada en las etiquetas del modelo (pipeline image-text-to-text, tag conversational).
- No soporta otros idiomas de forma fiable: casi todo el entrenamiento es aleman.

## Casos de uso

- Digitalizacion de archivos historicos alemanes: el modelo transcribe paginas completas de registros parroquiales, censos y expedientes administrativos en Kurrent, eliminando la necesidad de segmentar manualmente por lineas y facilitando la creacion de indices de busqueda sobre corpus de siglos XVIII y XIX.
- Investigacion genealogica asistida: un genealogista puede pasar imagenes de paginas de registros civiles o eclesiasticos y obtener un borrador de transcripcion que revisa contra el escaneo, acelerando la localizacion de partidas de nacimiento, matrimonio y defuncion.
- Proyectos de humanidades digitales a gran escala: como demuestra el caso del censo medico bavaro de 1858 (26.325 paginas), el modelo permite procesar corpus completos en local y generar texto base para analisis estadistico o linguistico posterior.
- Extraccion de entidades con revision humana: aunque el autor desaconseja la extraccion automatica sin revision, el modelo sirve como primer paso para identificar nombres, lugares y fechas (recall mediano de entidades de 0.83) en flujos donde un revisor valida cada linea.
- Archivado y preservacion digital: instituciones con fondos manuscritos pueden generar transcripciones de borrador para acompanar a las imagenes en sus catalogos, mejorando la accesibilidad sin depender de servicios en la nube.
- Despliegue en entornos sin conectividad: investigadores que trabajan con material restringido o en archivos sin acceso a internet pueden ejecutar el modelo en su propia maquina con llama.cpp o transformers, manteniendo los documentos en local.
- Analisis de documentos legales o policiales historicos: el caso de estudio "The Fourth Man" (expediente policial de 1883 a 1893) ilustra su uso para reconstruir expedientes completos y facilitar su lectura por parte de historiadores.

## Benchmarks y rendimiento

Resultados reportados por el mantenedor (no clasificados en el ranking) sobre las 53 paginas reservadas del Kurrent Pages Benchmark, en una unica ejecucion:

| Metrica | Kurrent Transcriber 1B | LightOnOCR-HGH | Transkribus German Genius | Fine-tune propio del autor |
|---|---|---|---|---|
| CER normalizado mediano (cer_norm) | 0.071 | 0.075 (con image step) / 0.090 (sin image step) | 0.131 | 0.112 |
| CER normalizado en las 33 paginas dificiles | 0.091 | 0.085 (con image step) | no disponible | no disponible |
| Recall mediano de entidades (nombres, lugares, fechas) | 0.83 | nivel similar | 0.85 | no disponible |
| Texto inventado | ninguno detectado en 53 paginas | no disponible | no disponible | no disponible |

En tres conjuntos de prueba publicos de otros grupos, el modelo lee mejor que LightOnOCR-HGH en los tres (LightOnOCR-HGH ejecutado alli sin el image step). Dos modelos frontera de proposito general obtuvieron, en ejecuciones unicas en fechas distintas, un cer_norm mediano de 0.055 y 0.070. Una comparacion de desarrollo con llama.cpp frente a LightOnOCR-HGH no supero su limite preestablecido y fue eximida. No hay resultados de benchmark para los ficheros GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~1B parametros, en fp16 rondaria los 2 GB de pesos y en cuantizaciones GGUF de 4-8 bits seria inferior, mas el coste del codificador visual y del procesamiento de imagenes de pagina.
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU consumer moderna (por ejemplo, RTX 4090 o inferiores con suficiente VRAM) deberia bastar, aunque no se confirma en la informacion disponible.
- Cabe en GPU consumer: si, segun el tamano de ~1B parametros y la existencia de GGUF, aunque no hay cifras oficiales de VRAM.
- Opciones de despliegue: transformers (codigo de inferencia en `inference/`, necesario para reproducir los resultados reportados), llama.cpp mediante GGUF y vLLM (que requiere un plugin de servidor para la penalizacion de repeticion). El autor indica que los pesos por si solos no reproducen los resultados: hay que aplicar el image step y la configuracion de decodificacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kurrent Transcriber 1B | ~1B | no disponible (max. 4.096 tokens nuevos) | HTR pagina completa, aleman historico | CC BY-SA 4.0 (pesos) | Hugging Face, GGUF, demo Space |
| LightOnOCR-HGH (b-straub) | ~1B | no disponible | HTR aleman historico | no disponible en la informacion | Hugging Face |
| LightOnOCR-3-1B (lightonai) | ~1B | no disponible | OCR/HTR general | Apache-2.0 | Hugging Face |
| TrOCR-Kurrent (dh-unibe) | no disponible | no disponible | HTR por lineas | no disponible en la informacion | Hugging Face |
| Transkribus German Genius | no disponible | no disponible | HTR comercial | propietaria | servicio comercial |

## Limitaciones y advertencias

- La salida es un borrador: el autor exige revision humana linea a linea contra el escaneo antes de cualquier uso.
- No debe usarse para extraer nombres, fechas o lugares sin revision, ni como evidencia legal, genealogica o archivistica por si sola.
- No admite imagenes de lineas individuales: sobre un recorte de linea tambien transcribe las lineas vecinas.
- Solo aleman: casi todos los datos de entrenamiento son alemanes; otros idiomas quedan fuera de alcance.
- El image step puede eliminar sellos de biblioteca escritos junto a cartas de color, segun un gate de desarrollo que fallo y fue eximido.
- Los resultados reportados son del mantenedor del benchmark y no estan clasificados en el ranking; la comparacion con LightOnOCR-HGH es sensible a la sesion de servicio (0.075 frente a 0.090 sin image step) y no demuestra que el image step ayude.
- La comparacion con llama.cpp frente a LightOnOCR-HGH no supero su limite preestablecido y fue eximida; no hay benchmarks de los ficheros GGUF.
- Licencia CC BY-SA 4.0 en los pesos: impone atribucion y compartir igual, lo que condiciona el uso comercial y la redistribucion de derivados.
- Riesgo de alucinacion: no se detecto texto inventado en las 53 paginas evaluadas por dos revisores de modelos de IA, pero la evaluacion es limitada y no garantiza ausencia de invenciones en otros corpus.
- El modelo es una fusion de pesos de dos fine-tunes; el fine-tune propio del autor no esta publicado, lo que limita la reproducibilidad completa del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/13fragments/kurrent-transcriber-1b
- GGUF para llama.cpp: https://huggingface.co/13fragments/kurrent-transcriber-1b-GGUF
- Demo Space: https://huggingface.co/spaces/13fragments/german-handwriting-ocr
- Caso de estudio "Reading a Kingdom's Medical Survey": https://13fragments.com/blog/bavarian-medical-survey/
- Caso de estudio "The Fourth Man": https://13fragments.com/blog/the-fourth-man/
- Archivo en Zenodo: https://doi.org/10.5281/zenodo.24342061
- Kurrent Pages Benchmark: https://doi.org/10.5281/zenodo.24015417
- Modelo base LightOnOCR-3-1B: https://huggingface.co/lightonai/LightOnOCR-3-1B
- LightOnOCR-HGH (Bernhard Straub): https://huggingface.co/b-straub/LightOnOCR-3-1B-Historic-German-Handwriting
- TrOCR-Kurrent (dh-unibe): https://huggingface.co/dh-unibe/trocr-kurrent
- Paper referenciado (arxiv:2601.14251): https://arxiv.org/abs/2601.14251
