# gorse-io/larger_clap_general-GGUF

## Resumen

`gorse-io/larger_clap_general-GGUF` es una conversion al formato GGUF del modelo LAION CLAP (`laion/larger_clap_general`), un modelo de embeddings audio-texto basado en la arquitectura CLAP (Contrastive Language-Audio Pretraining). No es un modelo generativo: sus dos codificadores (audio y texto) proyectan sus entradas a un espacio compartido de 512 dimensiones y devuelven vectores L2-normalizados, de modo que el producto escalar entre ellos equivale a la similitud coseno. El modelo cubre audio general, musica y habla.

La relevancia de esta publicacion es practica: permite ejecutar inferencia nativa de CLAP sin Python ni dependencias de PyTorch/Transformers, mediante el runtime `gorse-io/clap.cpp`. Cada fichero GGUF incorpora la configuracion y el tokenizador RoBERTa embebidos, y se ofrecen cuatro precisiones (F32, F16, Q8_0 y Q4_K_M) con validacion numerica frente a la implementacion original en Transformers.

El modelo base tiene 193.914.010 parametros y el repositorio ocupa 1,5 GB. La licencia es Apache 2.0 tanto en el original como en la conversion. Esta ficha describe exclusivamente la version cuantizada en GGUF; para detalles del entrenamiento original conviene consultar la model card de LAION.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP (dos codificadores, audio y texto, con proyeccion a espacio compartido) |
| Parametros totales | 193.914.010 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; ventana de audio de 10 segundos con repeat-padding para clips mas cortos |
| Tipos de cuantizacion | F32, F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponible (el codificador de texto usa tokenizador RoBERTa) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors/bin en el modelo base original) |

| Fichero | Bytes | Tamano decimal |
|---|---:|---|
| `larger_clap_general-f32.gguf` | 777.060.832 | 777,1 MB |
| `larger_clap_general-f16.gguf` | 389.733.856 | 389,7 MB |
| `larger_clap_general-q8_0.gguf` | 208.325.504 | 208,3 MB |
| `larger_clap_general-q4_k_m.gguf` | 128.926.784 | 128,9 MB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura CLAP: un codificador de audio y un codificador de texto entrenados de forma contrastiva para alinear sus representaciones en un mismo espacio vectorial de 512 dimensiones. La salida de ambos codificadores esta L2-normalizada, por lo que la similitud coseno se calcula como producto escalar. El frontend de audio remuestrea y mezcla a 48 kHz, usa ventanas de 10 segundos y aplica repeat-padding a clips mas cortos; para audio mas largo se selecciona el fragmento con `--crop-offset` expresado en muestras a 48 kHz.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al modelo base `laion/larger_clap_general` y no se reproducen aqui. La innovacion tecnica de esta publicacion es la conversion a GGUF y su runtime nativo: la cuantizacion Q4_K_M usa una politica de roles especifica para encoder (Q6_K en attention-value, FFN-down y proyeccion final; Q4_K en el resto de matrices elegibles; F32 en filas no alineadas, convoluciones del frontend y vectores), distinta de la heuristica de seleccion por capas de llama.cpp, y se genero directamente desde F32 sin matriz de importancia ni dataset de calibracion. La revision del runtime validada es `d1928dd6b1e0e48a072a7e0ad1b2608621616db0`, y la revision del checkpoint fuente es `ada0c23a36c4e8582805bb38fec3905903f18b41`.

## Capacidades

- Generacion de embeddings de audio de 512 dimensiones, L2-normalizados.
- Generacion de embeddings de texto de 512 dimensiones en el mismo espacio compartido.
- Calculo de similitud audio-texto mediante producto escalar (equivalente a coseno).
- Recuperacion (retrieval) audio-texto y texto-audio.
- Clasificacion zero-shot de audio usando etiquetas textuales.
- Cobertura de audio general, musica y habla.
- Inferencia nativa sin Python, con configuracion y tokenizador RoBERTa embebidos en el GGUF.
- Entrada de audio nativa con downmix y remuestreo a 48 kHz.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo.

## Casos de uso

- Busqueda semantica de audio: indexar una fonoteca calculando embeddings de cada clip y responder a consultas en lenguaje natural comparando el vector de texto con los vectores de audio; el espacio compartido de 512 dimensiones y la normalizacion L2 hacen que el producto escalar sea directamente la metrica de ranking.
- Etiquetado zero-shot de catalogos musicales: clasificar pistas por genero, instrumentacion o estado de animo definiendo las etiquetas como texto, sin entrenar un clasificador especifico, aprovechando la cobertura del checkpoint sobre musica.
- Moderacion y filtrado de contenido sonoro: comparar fragmentos de audio contra descripciones textuales de eventos o sonidos no deseados y marcar coincidencias por encima de un umbral de similitud coseno.
- Deteccion de eventos acusticos en produccion: procesar ventanas de 10 segundos con `--crop-offset` para recorrer grabaciones largas y generar embeddings por tramo que alimenten un clasificador ligero aguas abajo.
- Descripcion automatica de archivos de audio en pipelines de datos: generar un vector por clip y emparejarlo con descripciones candidatas para enriquecer metadatos de un repositorio, ejecutando la inferencia con el binario `clap-cli` sin dependencias de Python.
- Prototipado en entornos con recursos limitados: desplegar la variante Q4_K_M (128,9 MB) en CPU con dos hilos para pruebas de concepto o servicios de baja concurrencia, manteniendo una similitud coseno superior a 0,995 frente a la implementacion F32 de Transformers.
- Sistemas de recomendacion audio-texto: construir un indice vectorial de clips y consultas de usuario en el mismo espacio para recuperar contenido afín a una descripcion textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta validacion de paridad numerica entre formatos, medida como similitud coseno de los vectores normalizados frente a la implementacion F32 en Transformers y frente al GGUF F32 del mismo runtime.

| Formato | Sonda | Coseno vs Transformers F32 | Coseno vs F32 nativo |
|---|---|---:|---:|
| F32 | texto | 1,00000000 | 1,00000000 |
| F32 | tone440 | 1,00000000 | 1,00000000 |
| F32 | broadband | 1,00000000 | 1,00000000 |
| F16 | texto | 0,99999989 | 0,99999989 |
| F16 | tone440 | 0,99999957 | 0,99999957 |
| F16 | broadband | 0,99999975 | 0,99999975 |
| Q8_0 | texto | 0,99978555 | 0,99978555 |
| Q8_0 | tone440 | 0,99988745 | 0,99988744 |
| Q8_0 | broadband | 0,99992027 | 0,99992026 |
| Q4_K_M | texto | 0,99596578 | 0,99596578 |
| Q4_K_M | tone440 | 0,99728917 | 0,99728919 |
| Q4_K_M | broadband | 0,99719099 | 0,99719099 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud, el fichero Q4_K_M ocupa 128,9 MB y el F32 777,1 MB; la model card advierte explicitamente que la reduccion de tamano de fichero no implica una reduccion proporcional de RAM pico ni una inferencia mas rapida.
- GPU recomendadas: no disponible. La model card no hace ninguna afirmacion sobre rendimiento en GPU; las pruebas descritas se ejecutaron en CPU con dos hilos.
- Encaje en GPU de consumo: no disponible como dato verificado. Por tamano de fichero, todas las variantes caben holgadamente en GPUs de consumo, pero no se ha validado el rendimiento en ellas.
- Opciones de despliegue: runtime nativo `gorse-io/clap.cpp`, compilando el target `clap-cli` con CMake en modo Release. El flujo documentado usa `./build/clap embedding --model <fichero.gguf> --threads 2 --text '...'` o `--audio <fichero.wav>`, devolviendo un array JSON de 512 elementos.
- Latencia y throughput: no disponibles. Solo se documenta la ejecucion en CPU con dos hilos, sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Salida | Licencia | Formato nativo sin Python |
|---|---|---|---|---|---|
| `gorse-io/larger_clap_general-GGUF` (esta ficha) | 193.914.010 | ventana de audio de 10 s | embeddings 512-d | apache-2.0 | si, via clap.cpp |
| `laion/larger_clap_general` | 193.914.010 | ventana de audio de 10 s | embeddings 512-d | apache-2.0 | no, requiere Transformers/PyTorch |
| `laion/clap-htsat-unfused` | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | embeddings | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La comparativa se limita al modelo base y a la variante de referencia de LAION; no se dispone de datos de rendimiento de alternativas en la informacion proporcionada, por lo que no se establece una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. No debe cargarse como un modelo de llama.cpp generico.
- Ventana de audio fija de 10 segundos: los clips mas cortos se rellenan por repeticion y los mas largos requieren seleccionar un fragmento con `--crop-offset`; no hay procesamiento de audio largo integrado.
- La reduccion de tamano por cuantizacion no garantiza menor RAM pico ni mayor velocidad de inferencia, segun advierte el autor.
- La cuantizacion Q4_K_M se genero sin matriz de importancia ni dataset de calibracion, y su politica de roles es propia del encoder, no la heuristica de llama.cpp.
- Sesgos conocidos: no documentados en la informacion disponible. Al derivar de un dataset contrastivo audio-texto, es esperable que herede los sesgos de ese corpus, pero no se cuantifican aqui.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud coseno puede producir falsos positivos en clasificacion zero-shot si las etiquetas textuales no describen bien el contenido.
- Idiomas soportados: no disponible; el tokenizador es RoBERTa y no se documenta cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero deben conservarse los avisos correspondientes y verificarse la licencia del checkpoint base y del runtime.
- El modelo solo se ha validado en CPU con dos hilos; no hay garantias de rendimiento en GPU ni de latencia en produccion.
- La identidad del modelo en el GGUF requiere aplicar `converter-model-name.patch`, que solo cambia `general.name`; sin el, el nombre embebido seria el del modelo de musica del conversor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gorse-io/larger_clap_general-GGUF
- Modelo base: https://huggingface.co/laion/larger_clap_general
- Runtime clap.cpp: https://github.com/gorse-io/clap.cpp
- Paper de referencia (arXiv:2211.06687): https://arxiv.org/abs/2211.06687
