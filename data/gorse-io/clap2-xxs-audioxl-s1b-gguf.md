# gorse-io/clap2-xxs-audioxl-s1B-GGUF

## Resumen

CLAP2 XXS AudioXL es un modelo de embeddings conjuntos audio-texto desarrollado originalmente por LAION, publicado como `laion/clap2-xxs-audioxl-s1B`. Esta ficha cubre la conversion a formato GGUF realizada por gorse-io para su uso con el runtime `clap.cpp`, una implementacion en C++ orientada a la inferencia local de modelos CLAP sin dependencias de PyTorch. El modelo genera representaciones vectoriales de 224 dimensiones, normalizadas en L2, tanto para fragmentos de audio como para texto, lo que permite tareas de recuperacion cruzada entre ambas modalidades (por ejemplo, buscar un audio dada una descripcion textual).

Se trata de un modelo de tamano muy reducido: 27.293.041 parametros totales, con un repositorio de apenas 0,2 GB. El frontend de audio opera a 32 kHz y el runtime acepta WAV, MP3 y FLAC, remuestreando internamente cuando es necesario. Ambos codificadores (audio y texto) junto con el tokenizador y la configuracion del frontend estan embebidos en un unico fichero GGUF, lo que simplifica el despliegue.

Su relevancia actual radica en la posibilidad de ejecutar un modelo de embeddings audio-texto de forma autonoma y ligera en entornos sin GPU o con recursos muy limitados, gracias a la conversion GGUF y al runtime en C++. No obstante, la propia model card advierte de que esta entrega no soporta la cuantizacion por bloques de CLAP2 y solo ofrece almacenamiento F32 y F16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP2 (codificadores duales audio y texto con proyeccion a espacio conjunto); detalles internos de capas no disponibles |
| Parametros totales | 27.293.041 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y F16 (la cuantizacion por bloques de CLAP2 no esta soportada en esta release) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (F32 y F16) |

## Arquitectura y entrenamiento

El modelo base es CLAP2 (Contrastive Language-Audio Pretraining, segunda generacion) de LAION, dentro de la familia LAION-Audio-XL. La arquitectura es de tipo dual-encoder: un codificador de audio y un codificador de texto que proyectan sus salidas a un espacio de embedding conjunto de 224 dimensiones, normalizado en L2. El frontend de audio trabaja a 32 kHz. La variante "xxs" indica un tamano extra-extra-small dentro de la familia, coherente con los 27,3 millones de parametros.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles. La conversion a GGUF preserva los dos codificadores, el tokenizador y la configuracion del frontend en un unico fichero. En el formato F16, las matrices de pesos 2D se almacenan en IEEE FP16, mientras que el resto de tensores y las activaciones nativas permanecen en F32. La validacion se realizo contra la implementacion oficial de CLAP2 fijada a una revision concreta, usando pruebas deterministas que establecen concordancia de implementacion, no calidad de recuperacion.

## Capacidades

- Generacion de embeddings de audio: produce vectores de 224 dimensiones L2-normalizados a partir de fragmentos de audio.
- Generacion de embeddings de texto: produce vectores en el mismo espacio conjunto a partir de descripciones textuales.
- Recuperacion cruzada audio-texto: permite buscar audio mediante texto y viceversa gracias al espacio de embedding compartido.
- Procesamiento de audio en multiples formatos: acepta WAV, MP3 y FLAC con remuestreo automatico a 32 kHz.
- Extraccion de caracteristicas (feature-extraction): tarea principal declarada en el pipeline del modelo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni capacidades de agente; es exclusivamente un modelo de embeddings.

## Casos de uso

- Busqueda semantica de audio: indexar una biblioteca de clips (efectos de sonido, grabaciones ambientales) mediante embeddings de audio y recuperarlos con consultas en lenguaje natural, aprovechando el espacio conjunto de 224 dimensiones.
- Etiquetado y clasificacion automatica de audio: calcular la similitud entre el embedding de un audio y embeddings de etiquetas textuales predefinidas para asignar categorias sin entrenar un clasificador especifico.
- Moderacion y filtrado de contenido sonoro: comparar audios entrantes contra descripciones de contenido no deseado mediante similitud coseno en el espacio de embedding.
- Sistemas de recomendacion musical o de efectos de sonido: construir un indice vectorial de embeddings de audio y sugerir elementos similares a partir de una consulta de audio o de texto.
- Deteccion de duplicados y near-duplicates en archivos de audio: comparar embeddings para identificar clips repetidos o muy similares en grandes repositorios.
- Despliegue en entornos con recursos limitados: al ser un modelo de 27,3 millones de parametros en formato GGUF y ejecutarse con `clap.cpp`, puede integrarse en servicios ligeros o dispositivos sin GPU para tareas de extraccion de embeddings en tiempo casi real.
- Prototipado de interfaces de busqueda por voz o sonido: usar el modelo como componente de recuperacion en aplicaciones de demostracion o pruebas de concepto con licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las pruebas realizadas son deterministas y establecen concordancia con la implementacion oficial de CLAP2, no calidad de recuperacion.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 27,3 millones de parametros, el modelo en F32 ocupa aproximadamente 110 MB y en F16 alrededor de 55 MB, mas el overhead del runtime y del frontend de audio.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) seria mas que suficiente si se desea aceleracion.
- Cabe en cualquier GPU consumer e incluso en sistemas integrados y dispositivos de bajos recursos.
- Opciones de despliegue: `clap.cpp` (runtime especifico, commit `60def51cff6564eb35ef859487b1071d04e0ed52` o posterior compatible). No esta destinado a `llama.cpp`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| clap2-xxs-audioxl-s1B (GGUF) | 27,3 M | no disponible | Audio-texto | Apache-2.0 | GGUF |
| laion/clap2-xxs-audioxl-s1B (original) | 27,3 M | no disponible | Audio-texto | Apache-2.0 | safetensors (presumiblemente) |
| Otros modelos de la coleccion Audio-Embedding-GGUF de gorse-io | no disponible | no disponible | Audio | no disponible | GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni realiza razonamiento; no debe evaluarse como un LLM.
- Esta release no soporta la cuantizacion por bloques de CLAP2, lo que limita las opciones de compresion a F32 y F16.
- Los ficheros GGUF estan pensados para `clap.cpp`, no para `llama.cpp`; usarlos con otro runtime no esta soportado.
- La validacion realizada comprueba concordancia de implementacion, no calidad de recuperacion; no hay benchmarks publicados de rendimiento en tareas downstream.
- No se dispone de informacion sobre sesgos, cobertura idiomatica ni riesgos de alucinacion (concepto menos aplicable a un modelo de embeddings, pero relevante en la calidad de las representaciones).
- Licencia Apache-2.0 en el modelo original y en `clap.cpp`, lo que permite uso comercial; la conversion no altera la licencia de origen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que su adopcion y validacion por la comunidad es practicamente nula.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/gorse-io/clap2-xxs-audioxl-s1B-GGUF
- Modelo base original: https://huggingface.co/laion/clap2-xxs-audioxl-s1B
- Model card del modelo base (revision fijada): https://huggingface.co/laion/clap2-xxs-audioxl-s1B/blob/adaca9be91f5045d06e10569de3075e1ef37f823/README.md
- Repositorio del runtime clap.cpp: https://github.com/gorse-io/clap.cpp
- Repositorio CLAP2 de LAION: https://github.com/LAION-AI/clap2/
- Coleccion Audio-Embedding-GGUF de gorse-io: https://huggingface.co/collections/gorse-io/audio-embedding-gguf
