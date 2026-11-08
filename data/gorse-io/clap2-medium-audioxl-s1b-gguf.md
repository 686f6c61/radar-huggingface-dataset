# gorse-io/clap2-medium-audioxl-s1B-GGUF

## Resumen

CLAP2 Medium AudioXL es un modelo de embeddings conjuntos audio-texto desarrollado por LAION, distribuido aqui en formato GGUF por gorse-io para su uso con el runtime clap.cpp. El modelo proyecta audio y texto a un espacio vectorial compartido de 640 dimensiones con normalizacion L2, lo que permite tareas de recuperacion audio-texto, clasificacion zero-shot y busqueda semantica sobre contenido sonoro. Con 152,7 millones de parametros, es un modelo de tamano medio orientado a extraccion de caracteristicas (feature-extraction), no a generacion.

Esta publicacion concreta no es un modelo nuevo, sino una conversion de pesos del checkpoint original `laion/clap2-medium-audioxl-s1B` (revision `3a8d9d79cb98e4d409fce24092a69718a821a7ad`) a los formatos F32 y F16 de GGUF, empaquetando ambos codificadores (audio y texto) junto con el tokenizador y la configuracion del frontend de audio en un unico fichero. El objetivo es facilitar el despliegue en entornos C/C++ sin dependencias de Python ni de frameworks de deep learning, mediante la herramienta clap.cpp.

Es relevante para desarrolladores que necesiten anadir busqueda o clasificacion de audio a aplicaciones nativas con requisitos de despliegue ligeros. El modelo base declara licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales mas alla de la atribucion. La fecha de creacion del repositorio es el 8 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP2 (codificador dual audio-texto con proyeccion a espacio compartido); detalles internos de capas no disponibles |
| Parametros totales | 152.766.657 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y F16 (GGUF); cuantizacion por bloques de CLAP2 no soportada en esta release |
| Idiomas soportados | no disponible (modelo multimodal audio-texto; el texto se procesa mediante el codificador de texto del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ficheros `clap2-medium-audioxl-s1B-f32.gguf` y `clap2-medium-audioxl-s1B-f16.gguf`) |
| Dimension del embedding | 640, normalizado L2 |
| Frecuencia de muestreo de audio | 32 kHz (clap.cpp acepta WAV, MP3 y FLAC con remuestreo automatico) |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

El modelo base es CLAP2 (Contrastive Language-Audio Pretraining, segunda generacion), una arquitectura de codificador dual que entrena de forma contrastiva un codificador de audio y un codificador de texto para alinear sus representaciones en un espacio comun. La salida son embeddings de 640 dimensiones normalizados L2, de modo que el producto escalar entre un embedding de audio y uno de texto equivale a la similitud coseno, apta para recuperacion y clasificacion zero-shot.

La model card de esta conversion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden a la documentacion del modelo original de LAION, no incluida en la informacion disponible. La innovacion de esta release es de empaquetado e infraestructura: ambos codificadores, el tokenizador y la configuracion del frontend de audio se integran en un unico fichero GGUF, y el formato F16 almacena solo las matrices de pesos 2D en IEEE FP16 mientras mantiene el resto de tensores y las activaciones nativas en F32. La validacion se hizo contra la implementacion oficial de CLAP2 fijada, con comprobaciones deterministas de identidad de implementacion, no de calidad de recuperacion.

## Capacidades

- Generacion de embeddings conjuntos de audio y texto en un espacio compartido de 640 dimensiones.
- Recuperacion audio-texto y texto-audio mediante similitud coseno (producto escalar sobre vectores normalizados).
- Clasificacion zero-shot de audio usando etiquetas textuales como consultas.
- Procesamiento de audio en WAV, MP3 y FLAC con remuestreo automatico a 32 kHz.
- Extraccion de caracteristicas para indexacion y busqueda semantica sobre colecciones de audio.
- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales.
- No dispone de tool calling, function calling ni capacidades de agente.
- Capacidades multilingues del codificador de texto: no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica de audio en bibliotecas de sonido: indexar cada clip con su embedding de audio y consultar con descripciones textuales ("ladrido de perro", "lluvia en la calle") para recuperar los clips mas similares por similitud coseno.
- Etiquetado automatico de archivos de audio: clasificacion zero-shot comparando el embedding del audio contra embeddings de un conjunto de etiquetas textuales, util para organizar archivos sin un clasificador entrenado especificamente.
- Moderacion y filtrado de contenido sonoro: detectar categorias de audio no deseadas en plataformas de contenido generado por usuarios mediante consultas textuales sobre el espacio compartido.
- Sistemas de recomendacion musical o de podcasts: generar embeddings de fragmentos y calcular similitud entre ellos para construir vecindarios de contenido afines, con un coste de inferencia bajo (152,7 M de parametros).
- Integracion en aplicaciones nativas C/C++: al ejecutarse con clap.cpp y no con llama.cpp, permite incorporar busqueda de audio en binaries sin runtime de Python, con ficheros GGUF autocontenidos.
- Deteccion de eventos sonoros en pipelines de monitorizacion: comparar embeddings de ventanas de audio contra descripciones de eventos para disparar alertas, aprovechando el frontend de 32 kHz integrado.
- Anotacion asistida de datasets de audio: precalcular embeddings y sugerir etiquetas o clips relacionados para acelerar el etiquetado manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las pruebas realizadas establecen concordancia de implementacion frente a la referencia oficial de CLAP2, no benchmarks de calidad de recuperacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en F32 (152,7 M de parametros x 4 bytes) y unos 0,3 GB en F16 para los pesos; el consumo real anade activaciones y buffers del frontend de audio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente por el tamano del modelo; no se requieren aceleradores de datacenter como A100 o H100, aunque pueden usarse.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo, GTX 1650, RTX 3060, RTX 4090) e incluso en CPU.
- Opciones de despliegue: exclusivamente clap.cpp (commit `60def51cff6564eb35ef859487b1071d04e0ed52` o posterior compatible); los ficheros estan dirigidos a clap.cpp y no a llama.cpp. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gorse-io/clap2-medium-audioxl-s1B-GGUF (este) | 152,7 M | 640 | GGUF (F32/F16) para clap.cpp | Apache-2.0 | Conversion del checkpoint LAION CLAP2 medium |
| gorse-io/larger_clap_music_and_speech-GGUF | no disponible | 512 | GGUF para clap.cpp | no disponible | Checkpoint CLAP de LAION entrenado en musica y habla |
| laion/clap2-medium-audioxl-s1B | 152,7 M | 640 | safetensors (formato original) | Apache-2.0 | Modelo base sin convertir; requiere stack Python |

La comparativa se limita a los modelos de la misma familia CLAP referenciados en la informacion disponible; no se han encontrado datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- No es un modelo generativo: no puede producir texto, codigo ni mantener conversaciones; su unica salida son embeddings.
- La calidad de recuperacion no esta validada con benchmarks en esta release; las pruebas realizadas solo confirman concordancia de implementacion con la referencia oficial.
- La cuantizacion por bloques de CLAP2 no esta soportada; solo estan disponibles F32 y F16, lo que limita la reduccion de tamano frente a cuantizaciones de 8 o 4 bits.
- Dependencia estricta de clap.cpp: los ficheros no funcionan en llama.cpp ni en otros runtimes GGUF genericos.
- Idiomas soportados por el codificador de texto no documentados; el rendimiento en consultas en castellano no esta verificado en la informacion disponible.
- Riesgo de sesgo heredado del dataset de entrenamiento del modelo base LAION, cuya composicion no se detalla en esta conversion.
- Riesgo de falsos positivos en clasificacion zero-shot cuando las etiquetas textuales son ambiguas o el audio contiene senal de baja calidad.
- Licencia Apache-2.0 en origen y en la conversion; requiere mantener la atribucion a LAION y a clap.cpp segun sus respectivas licencias.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gorse-io/clap2-medium-audioxl-s1B-GGUF
- Modelo base: https://huggingface.co/laion/clap2-medium-audioxl-s1B
- Model card del modelo base (revision fijada): https://huggingface.co/laion/clap2-medium-audioxl-s1B/blob/3a8d9d79cb98e4d409fce24092a69718a821a7ad/README.md
- Runtime clap.cpp: https://github.com/gorse-io/clap.cpp
- Coleccion Audio-Embedding-GGUF: https://huggingface.co/collections/gorse-io/audio-embedding-gguf
- Conversion relacionada (larger_clap_music_and_speech): https://huggingface.co/gorse-io/larger_clap_music_and_speech-GGUF
