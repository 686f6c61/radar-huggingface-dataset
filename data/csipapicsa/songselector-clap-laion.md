# csipapicsa/songselector-clap-laion

## Resumen

`csipapicsa/songselector-clap-laion` es una conversion a ONNX del modelo CLAP (Contrastive Language-Audio Pretraining) de LAION, concretamente la variante `laion/clap-htsat-unfused`. CLAP es un modelo de representacion conjunta audio-texto entrenado con objetivos contrastivos, de forma analoga a CLIP pero aplicado al dominio del audio: proyecta fragmentos de audio y descripciones textuales a un mismo espacio vectorial de 512 dimensiones, de modo que la similitud coseno entre ambos permite recuperacion texto-a-audio. El autor del repositorio (csipapicsa) lo publica como dependencia del proyecto SongSelector, una aplicacion que selecciona canciones a partir de descripciones escritas.

La relevancia de esta ficha no esta en un modelo nuevo, sino en el empaquetado: se ha exportado el modelo original de PyTorch a dos grafos ONNX independientes (encoder de audio y encoder de texto) y se ha integrado el calculo del espectrograma log-mel dentro del grafo de audio, de manera que el encoder acepta audio PCM crudo en lugar de caracteristicas precalculadas en Python. Esto elimina la dependencia de `transformers` en tiempo de inferencia y permite ejecutar el modelo con `onnxruntime` en entornos ligeros o integrados en aplicaciones de escritorio.

El modelo base CLAP combina un encoder de audio HTSAT (Hierarchical Token-Semantic Audio Transformer) con un encoder de texto basado en RoBERTa, entrenados de forma contrastiva sobre pares audio-texto a gran escala. El repositorio ocupa 0,6 GB y se distribuye bajo licencia Apache 2.0, la misma del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos encoders (audio HTSAT + texto RoBERTa) con proyeccion a espacio conjunto; exportados como grafos ONNX independientes |
| Parametros totales | no disponible (el repo no publica el recuento; el peso del encoder de texto ONNX es de 501.449.463 bytes y el de audio de 121.612.865 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio: 10 s de audio mono a 48 kHz (480.000 muestras); texto: longitud de secuencia en tokens no especificada, tokenizador RoBERTa |
| Tipos de cuantizacion | no disponible (los ficheros publicados son grafos ONNX en float32) |
| Idiomas soportados | no disponible (el tokenizador es RoBERTa; el modelo original esta entrenado principalmente con pares audio-texto en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), tokenizador en JSON para la libreria `tokenizers` |

## Arquitectura y entrenamiento

El modelo subyacente, LAION CLAP `clap-htsat-unfused`, sigue el diseno de Wu et al. (ICASSP 2023): un encoder de audio HTSAT que procesa espectrogramas log-mel y un encoder de texto derivado de RoBERTa, ambos proyectados a un espacio comun de 512 dimensiones y entrenados con una perdida contrastiva sobre pares audio-descripcion. La variante `unfused` se refiere a la estrategia de fusion de caracteristicas del paper (feature fusion), que combina informacion local y global del audio. El entrenamiento se realizo a gran escala con pares audio-texto y, segun el paper, incluye aumento keyword-to-caption para mejorar la alineacion.

La aportacion de este repositorio es exclusivamente de despliegue. La conversion se realizo con el script `export_clap_onnx.py` del proyecto SongSelector, que segun la model card verifica ambos encoders contra el modelo original de PyTorch y el encoder de audio contra el feature extractor de `transformers` antes de escribir los ficheros. Se separo el modelo en dos grafos: `clap-laion-audio.onnx` (entrada `audio` float32 de forma `(batch, 480000)`, salida `embedding` float32 de forma `(batch, 512)`) y `clap-laion-text.onnx` (entradas `input_ids` y `attention_mask` int64, salida `embedding` float32 de forma `(batch, 512)`). La innovacion practica es que el calculo del espectrograma log-mel, que en el modelo original se hace en Python mediante el feature extractor, se ha incorporado al grafo ONNX de audio, de modo que la inferencia acepta audio PCM crudo. No se ha aplicado cuantizacion ni se han publicado datos de entrenamiento adicionales en este repositorio.

## Capacidades

- Extraccion de embeddings de audio: convierte 10 s de audio mono a 48 kHz en un vector float32 de 512 dimensiones.
- Extraccion de embeddings de texto: convierte una descripcion textual en un vector float32 de 512 dimensiones en el mismo espacio.
- Recuperacion texto-a-audio: mediante similitud coseno entre embeddings de texto y de audio, permite ordenar una coleccion de pistas por afinidad con una descripcion escrita.
- Busqueda semantica de musica por descripcion: el caso de uso declarado por el autor ("dark rolling techno").
- Ejecucion sin `transformers` en tiempo de inferencia: solo requiere `onnxruntime` y la libreria `tokenizers` para el texto.
- Procesamiento por lotes: ambas entradas admiten dimension de batch.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni comportamiento agentico; es un modelo de representacion, no generativo.
- Capacidades multilingues: no documentadas; el tokenizador y el entrenamiento original apuntan a un sesgo hacia el ingles.

## Casos de uso

- Busqueda de musica por descripcion en una aplicacion de escritorio: el usuario escribe una frase y la aplicacion calcula el embedding de texto y lo compara por similitud coseno con los embeddings de audio precalculados de la biblioteca local; es el escenario para el que se publico el modelo dentro de SongSelector.
- Etiquetado y organizacion automatica de bibliotecas musicales: precalcular el embedding de cada pista una vez y agrupar por similitud para generar listas o clusters tematicos sin metadatos manuales.
- Sistemas de recomendacion por similitud: usar el embedding de audio como vector de caracteristicas para un motor de recomendacion basado en vecinos mas cercanos.
- Filtrado y curaduria de catalogos: descartar o priorizar pistas de un catalogo grande comparando contra descripciones de referencia, con el coste de un forward pass por pista.
- Prototipado de interfaces de busqueda en apps moviles o de escritorio: al no requerir `transformers` ni PyTorch en inferencia, encaja en aplicaciones con runtime ONNX ligero.
- Investigacion en recuperacion audio-texto: servir como linea base reproducible en ONNX para experimentos de retrieval sin depender del stack de PyTorch.
- Sincronizacion de audio con descripciones en herramientas de produccion musical: seleccionar samples o loops de una carpeta a partir de una indicacion textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (por ejemplo, recall@k sobre Clotho o AudioCaps) ni comparaciones con el modelo original en PyTorch; solo documenta los tamanos y hashes SHA-256 de los ficheros.

## Requisitos de hardware

- VRAM estimada: los grafos ONNX suman aproximadamente 0,6 GB en float32 (unos 0,5 GB el encoder de texto y 0,12 GB el de audio); la VRAM real dependera del backend y del batch, pero en CPU el modelo cabe holgadamente en memoria RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para ejecucion con `onnxruntime-gpu`; no se requiere una A100 ni H100 para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo reciente (GTX 1650 en adelante) e incluso en CPU para uso interactivo.
- Opciones de despliegue: `onnxruntime` (CPU o GPU) es el runtime previsto; el modelo no esta pensado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de embeddings.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `csipapicsa/songselector-clap-laion` (este) | no disponible | 10 s de audio a 48 kHz; texto tokenizado | ONNX opset 17 | Apache 2.0 | Conversion ONNX de CLAP con espectrograma integrado |
| `laion/clap-htsat-unfused` | no disponible | 10 s de audio; texto | PyTorch (safetensors) | Apache 2.0 | Modelo original; requiere `transformers` y feature extractor en Python |
| `laion/clap-htsat-fused` | no disponible | 10 s de audio; texto | PyTorch | Apache 2.0 | Variante con fusion de caracteristicas distinta; no convertida en este repo |
| Otros modelos audio-texto (p. ej. familia CLAP de otras organizaciones) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Es un modelo de representacion, no generativo: no produce texto, codigo ni respuestas; solo embeddings.
- Ventana de audio fija de 10 s a 48 kHz; fragmentos mas largos deben trocearse y agregarse, lo que puede perder contexto musical global.
- El modelo original esta entrenado principalmente con descripciones en ingles; el rendimiento con descripciones en castellano no esta documentado y probablemente sea inferior.
- Riesgo de alineacion imperfecta: las similitudes coseno pueden favorecer generos o caracteristicas acusticas sobrerrepresentadas en los datos de entrenamiento; no se han publicado analisis de sesgo para esta conversion.
- No hay cuantizaciones publicadas; el uso en entornos con poca memoria exige convertir o cuantizar los grafos por cuenta propia, sin garantia de paridad numerica.
- La verificacion de los ficheros depende de los hashes SHA-256 publicados en la model card; conviene comprobarlos antes de desplegar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y no cuenta con validacion externa de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y el reconocimiento de los autores originales (Wu et al., LAION); el autor declara "no warranty".
- El modelo base y la conversion no documentan evaluacion en produccion; para uso critico conviene validar la calidad de recuperacion con un conjunto propio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/csipapicsa/songselector-clap-laion
- Modelo base: https://huggingface.co/laion/clap-htsat-unfused
- Proyecto SongSelector: https://github.com/csipapicsa/SongSelector
- Script de exportacion: https://github.com/csipapicsa/SongSelector/blob/main/scripts/export_clap_onnx.py
- Libreria `tokenizers`: https://github.com/huggingface/tokenizers
- Paper de referencia: Wu, Chen, Zhang, Hui, Berg-Kirkpatrick, Dubnov, "Large-scale Contrastive Language-Audio Pretraining with Feature Fusion and Keyword-to-Caption Augmentation", ICASSP 2023 (enlace directo no disponible en la informacion proporcionada)
