# kimchireader/manga-ocr-onnx-q8

## Resumen

manga-ocr-onnx-q8 es una version cuantizada a 8 bits y convertida a ONNX del modelo kha-white/manga-ocr-base, un sistema de reconocimiento optico de caracteres (OCR) especializado en texto japones extraido de bocadillos de manga. Lo publica el usuario kimchireader dentro del repositorio de la aplicacion de lectura dokseo, y su unico proposito es reducir el peso del modelo original para que pueda descargarse y ejecutarse directamente en un navegador web mediante transformers.js, sin subir ninguna pagina a un servidor externo.

El modelo original fue entrenado por kha-white sobre el conjunto de datos Manga109 y sigue una arquitectura de tipo vision-encoder-decoder: recibe una imagen recortada de un bocadillo y genera la transcripcion en japones. Esta variante no introduce ninguna capacidad nueva ni reentrenamiento; se limita a dos transformaciones mecanicas (conversion a ONNX y cuantizacion de ambas mitades del modelo), que reducen el tamano de 204 MB a 117 MB.

Su relevancia es practica y acotada: demuestra que es viable ejecutar OCR de japones en el navegador con un presupuesto de descarga bajo, algo interesante para lectores de manga, herramientas de accesibilidad o extensiones web que traduzcan o indexen paneles sin depender de una GPU ni de servicios en la nube. Como contrapartida, el propio autor advierte de que la precision de esta version cuantizada no se ha medido y de que no hay mejora de velocidad respecto a otras exportaciones ONNX existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (segun los tags del repositorio; detalle interno de capas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (q8) para encoder y decoder; tambien se incluyen pesos en precision completa |
| Idiomas soportados | japones (ja) unicamente |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (encoder_model_quantized.onnx, decoder_model_merged_quantized.onnx, encoder_model.onnx, decoder_model_merged.onnx) |
| Tamano del repositorio | 0,6 GB |
| Tamano del modelo cuantizado | 117 MB (87 MB encoder + 30 MB decoder) |
| Tamano del modelo en precision completa | 460 MB (343 MB encoder + 117 MB decoder) |
| Libreria de ejecucion | transformers.js |
| Pipeline | image-to-text |
| Modelo base | kha-white/manga-ocr-base |

## Arquitectura y entrenamiento

La arquitectura de la familia original es de tipo vision-encoder-decoder: un codificador procesa la imagen del panel y un decodificador autoregresivo produce la secuencia de texto japones. Los tags del repositorio confirman esta clasificacion (`vision-encoder-decoder`, `image-text-to-text`), pero no se detalla en la informacion disponible el tipo exacto de codificador (ViT u otro) ni la configuracion de capas, dimensiones o cabezas de atencion del modelo base.

El entrenamiento corresponde integramente a kha-white/manga-ocr-base, realizado sobre el conjunto de datos Manga109. Esta variante no ha sido reentrenada ni ajustada: las dos unicas operaciones aplicadas han sido la conversion del modelo PyTorch original a formato ONNX mediante la libreria optimum y la cuantizacion a 8 bits de ambas mitades (codificador y decodificador). La innovacion respecto a otras exportaciones ONNX de manga-ocr es precisamente esa: las versiones previas solo cuantizaban la primera mitad y rondaban los 204 MB, mientras que cuantizar tambien el decodificador es lo que permite bajar hasta 117 MB.

No se menciona en la informacion disponible el uso de RLHF, DPO ni ninguna otra fase de alineacion. Tampoco se ha generado una cache de clave-valor (key-value cache): la herramienta de conversion se niega a producirla para esta arquitectura, de modo que el archivo `decoder_model_merged.onnx` es el decodificador plano bajo el nombre que espera la libreria del navegador.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre texto japones en imagenes.
- Entrada de tipo imagen recortada de un bocadillo de manga; salida de texto en japones.
- Ejecucion en el navegador mediante transformers.js, con los pesos ONNX servidos desde el propio repositorio.
- Ejecucion en servidor o escritorio a traves de ONNX Runtime, al estar los pesos en formato ONNX estandar.
- Eleccion entre pesos cuantizados (int8) y pesos en precision completa dentro del mismo repositorio.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo de razonamiento (thinking mode), vision general, audio ni generacion de texto libre.
- Capacidad multilingue: no, el modelo es exclusivamente japones.

## Casos de uso

- Lectura de manga en el navegador: integrado en un lector como dokseo, el modelo transcribe los bocadillos de una pagina para alimentar despues un traductor o un glosario, sin que la imagen salga del dispositivo del usuario.
- Traduccion asistida de paneles: se recorta la burbuja, el modelo devuelve el texto japones y un modulo de traduccion independiente lo convierte al idioma destino; el OCR actua como primer eslabon de la cadena.
- Accesibilidad para personas con discapacidad visual: transcripcion del texto de un manga a texto plano que despues puede leerse con un lector de pantalla o sintetizador de voz.
- Extension de navegador o userscript: al pesar 117 MB en su version cuantizada, el modelo puede descargarse bajo demanda y ejecutarse en el cliente para anadir subtitulos a paginas de manga escaneadas.
- Indexacion y busqueda de texto en colecciones escaneadas: procesar por lotes las paginas de un archivo para extraer el texto de cada panel y construir un indice buscable.
- Creacion de corpus anotados: extraer texto japones de paneles para construir conjuntos de datos de entrenamiento o de evaluacion de otros sistemas de OCR o de traduccion.
- Herramientas educativas de japones: mostrar el texto reconocido junto al original para practicar lectura o comparar vocabulario.
- Verificacion de calidad en digitalizacion: deteccion de paginas mal escaneadas o de texto ilegible comparando la salida del OCR con la imagen de origen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la precision de esta version cuantizada no se ha medido y que nadie la ha comparado todavia con la version de precision completa sobre paginas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos cuantizados ocupan 117 MB en disco, por lo que la huella de memoria es muy inferior a la de un modelo de lenguaje de gran tamano; los pesos en precision completa suman 460 MB.
- GPU recomendadas: no se especifica ninguna. La orientacion del proyecto es la ejecucion en navegador, no en GPU de servidor.
- Compatibilidad con GPU de consumo: si, cualquier GPU de consumo actual puede alojar los pesos sin dificultad dado su tamano; el modelo tambien esta pensado para funcionar en el cliente con aceleracion WebGPU o, en su defecto, en CPU.
- Opciones de despliegue: transformers.js (navegador y Node.js) y ONNX Runtime. No se documenta soporte para vLLM, TGI ni llama.cpp.
- Latencia y throughput estimados: no disponibles. El autor senala que esta version no aporta ninguna mejora de velocidad, ya que no se ha podido generar una cache de clave-valor para esta arquitectura.

## Comparativa con modelos similares

| Modelo | Formato | Cuantizacion | Tamano | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| kimchireader/manga-ocr-onnx-q8 | ONNX | encoder y decoder en int8 | 117 MB | japones | apache-2.0 | Precision no medida; sin cache KV |
| kha-white/manga-ocr-base | PyTorch | ninguna (precision completa) | no disponible | japones | apache-2.0 | Modelo original, entrenado sobre Manga109 |
| DigitalLarynx/manga-ocr-onnx | ONNX | solo la primera mitad | aproximadamente 204 MB | japones | no disponible en la informacion proporcionada | Fuente del tokenizer y de la configuracion de imagen de esta version |

## Limitaciones y advertencias

- La precision de la version cuantizada no se ha medido ni comparado con la version de precision completa sobre paginas reales.
- La cuantizacion del decodificador introduce una perdida de precision adicional respecto a exportaciones ONNX previas que solo cuantizaban el codificador.
- No hay mejora de velocidad: no existe cache de clave-valor para esta arquitectura, algo comun a todas las exportaciones de manga-ocr.
- El modelo es exclusivamente japones; no reconoce otros idiomas ni alfabetos.
- Espera la imagen de un bocadillo ya recortado, no una pagina completa: es necesario un paso previo de deteccion y segmentacion del texto.
- Riesgo de alucinacion y de errores de reconocimiento en bocadillos con ruido, tipografias inusuales, texto vertical complejo o imagenes de baja resolucion.
- No se documentan sesgos especificos, pero al estar entrenado sobre Manga109 (un corpus acotado de manga japones) su comportamiento fuera de ese dominio puede degradarse.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y del tokenizer de terceros de los que depende.
- El repositorio registra 0 descargas y 0 likes, y no hay evidencia de uso en produccion ni de mantenimiento continuado.
- No dispone de soporte para tool calling, agentes ni razonamiento multi-paso, por lo que no debe emplearse como modelo de proposito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kimchireader/manga-ocr-onnx-q8
- Modelo base: https://huggingface.co/kha-white/manga-ocr-base
- Exportacion ONNX de referencia (tokenizer y ajustes de imagen): https://huggingface.co/DigitalLarynx/manga-ocr-onnx
- Herramienta de conversion: https://github.com/huggingface/optimum
- Libreria de ejecucion en navegador: https://github.com/huggingface/transformers.js
- Aplicacion para la que se creo: https://github.com/jerhage/dokseo
