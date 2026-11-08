# gorse-io/clap2-large-audioxl-s1B-GGUF

## Resumen
CLAP2 Large AudioXL es un modelo de embeddings conjuntos audio-texto desarrollado originalmente por LAION. Su funcion principal es proyectar fragmentos de audio y descripciones textuales en un mismo espacio vectorial de 960 dimensiones, L2-normalizado, de modo que sea posible comparar directamente la similitud semantica entre un sonido y una frase escrita. No es un modelo generativo: no produce texto ni transcribe audio, sino que extrae representaciones vectoriales reutilizables para tareas de recuperacion, clasificacion zero-shot, indexacion y busqueda multimodal.

Esta ficha cubre la conversion GGUF publicada por gorse-io, pensada especificamente para el runtime clap.cpp y no para llama.cpp. La conversion preserva ambos codificadores (audio y texto) y la configuracion del tokenizador y del frontend de audio dentro de un unico fichero GGUF. El checkpoint base cuenta con aproximadamente 340 millones de parametros y el repositorio ocupa 2,0 GB, lo que lo situa en un rango muy manejable para despliegue en CPU o GPU de gama consumer.

La relevancia actual de esta conversion radica en que permite ejecutar un modelo CLAP2 de referencia sin depender del stack PyTorch original, con un binario C/C++ ligero y soporte nativo de WAV, MP3 y FLAC con remuestreo automatico a 32 kHz. Al ser una conversion reciente con cero descargas y cero likes, debe considerarse una publicacion incipiente cuya validacion se limita a pruebas deterministas de equivalencia con la implementacion oficial, no a benchmarks de calidad de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP2 (dos codificadores, audio y texto, con proyeccion a espacio conjunto) |
| Parametros totales | 340.073.857 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y F16 (la cuantizacion por bloques de CLAP2 no esta soportada en esta release) |
| Idiomas soportados | no disponible (modelo multimodal audio-texto; cobertura linguistica del codificador de texto no declarada) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ficheros `clap2-large-audioxl-s1B-f32.gguf` y `clap2-large-audioxl-s1B-f16.gguf`) |

## Arquitectura y entrenamiento
El modelo sigue la arquitectura CLAP2 de LAION: un codificador de audio y un codificador de texto entrenados de forma contrastiva para alinear sus salidas en un espacio comun de 960 dimensiones con normalizacion L2. El frontend de audio opera a 32 kHz y el runtime clap.cpp acepta WAV, MP3 y FLAC, remuestreando internamente cuando es necesario. Cada fichero GGUF incorpora tanto los pesos de ambos codificadores como el tokenizador y la configuracion del frontend, lo que simplifica el despliegue a un solo artefacto.

En cuanto al entrenamiento, la informacion disponible no detalla el volumen de datos, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos extremos deben consultarse en la model card del checkpoint original de LAION. La innovacion tecnica destacable de esta publicacion es la conversion determinista: el autor documenta la revision fuente (`e836feaa79cd1f7de939fe77065819f48fc44e4c`) y el commit de conversion, e incluye en el repositorio el SHA-256 exacto del checkpoint, una auditoria de almacenamiento, fixtures de referencia oficiales y validacion nativa texto/audio por formato. En F16, las matrices de pesos 2D se almacenan en IEEE FP16 mientras el resto de tensores y las activaciones nativas permanecen en F32; las comparaciones F16 se realizan contra pesos de referencia redondeados de forma identica, no contra los F32 intactos.

## Capacidades
- Extraccion de embeddings conjuntos audio-texto de 960 dimensiones, L2-normalizados, aptos para similitud coseno mediante producto escalar.
- Embeddings de audio a partir de ficheros WAV, MP3 y FLAC, con remuestreo automatico a 32 kHz.
- Embeddings de texto para consultas y descripciones semanticas de sonido.
- Recuperacion audio-a-texto y texto-a-audio en un espacio vectorial compartido.
- Clasificacion zero-shot de eventos sonoros mediante comparacion con etiquetas textuales.
- Extraccion de caracteristicas para pipelines de indexacion y busqueda por similitud.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de representacion.
- No dispone de capacidades de vision ni de reconocimiento de voz propiamente dicho (no transcribe audio).

## Casos de uso
- Busqueda de audio por descripcion textual: indexar una fonoteca calculando embeddings de cada fragmento y responder a consultas como "ladrido de perro" recuperando los vectores mas proximos por similitud coseno.
- Etiquetado automatico de archivos de sonido: comparar el embedding de cada audio con embeddings de un conjunto de etiquetas textuales y asignar la clase de mayor similitud, sin necesidad de entrenar un clasificador supervisado.
- Moderacion y triaje de contenido audiovisual: detectar categorias de audio sensibles en grandes volumenes de material mediante clasificacion zero-shot previa a la revision humana.
- Organizacion de librerias musicales y de efectos de sonido: agrupar o deduplicar pistas por similitud semantica en el espacio de 960 dimensiones.
- Alineacion de subtitulos y descripciones: verificar la coherencia entre una descripcion textual y la pista de audio asociada calculando la similitud de sus embeddings.
- Construccion de sistemas de recomendacion multimodales: combinar embeddings de audio con embeddings de texto de resenas o metadatos para ranking y recuperacion.
- Despliegue ligero en entornos sin PyTorch: al ejecutarse con clap.cpp en un unico binario C/C++, encaja en servicios contenerizados o en maquinas sin GPU dedicada para precomputar embeddings por lotes.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las pruebas deterministas realizadas contra la implementacion oficial de CLAP2 establecen acuerdo de implementacion, no benchmarks de calidad de recuperacion.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; con 340 millones de parametros, F32 ocupa aproximadamente 1,36 GB solo en pesos y F16 aproximadamente 0,68 GB, a lo que hay que sumar activaciones y buffers del frontend de audio.
- GPU recomendadas: no disponible; por tamano, cualquier GPU con 2-4 GB de memoria libre deberia ser suficiente, incluyendo GTX 1650, RTX 3060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, previsiblemente en practicamente todas las GPU consumer modernas con al menos 2-4 GB de VRAM; el dato exacto no esta publicado.
- Opciones de despliegue: exclusivamente clap.cpp (commit `60def51cff6564eb35ef859487b1071d04e0ed52` o posterior compatible), con el target `clap-cli`. No esta pensado para llama.cpp, vLLM, TGI, Ollama ni otros runtimes de LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension del embedding | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gorse-io/clap2-large-audioxl-s1B-GGUF | 340.073.857 | 960 | GGUF (F32/F16) | Apache-2.0 | Conversion para clap.cpp; audio a 32 kHz |
| laion/clap2-large-audioxl-s1B | 340.073.857 | 960 | safetensors (checkpoint original) | Apache-2.0 | Modelo base; requiere stack PyTorch |
| gorse-io/larger_clap_music_and_speech-GGUF | no disponible | 512 | GGUF | no disponible | Conversion CLAP de LAION entrenada en musica y voz; embeddings de 512 dimensiones |

## Limitaciones y advertencias
- Modelo exclusivamente de extraccion de caracteristicas: no genera texto, no transcribe audio y no soporta tool calling ni razonamiento multi-paso.
- No se han publicado benchmarks de calidad de recuperacion; la validacion documentada cubre solo equivalencia de implementacion frente a la referencia oficial.
- La cuantizacion por bloques de CLAP2 no esta soportada en esta release; solo hay F32 y F16.
- Los ficheros GGUF estan pensados para clap.cpp y no son compatibles con llama.cpp ni con otros runtimes genericos de GGUF.
- La cobertura linguistica del codificador de texto no esta declarada; el rendimiento en idiomas distintos del ingles no esta documentado.
- Repositorio con cero descargas y cero likes en el momento de la consulta: ecosistema de usuario practicamente inexistente y poca retroalimentacion de terceros.
- Licencia Apache-2.0 heredada del checkpoint original de LAION; la conversion no altera la licencia, pero conviene verificar la model card upstream para cualquier obligacion de atribucion adicional.
- Riesgo de sesgo y de falsos positivos en clasificacion zero-shot: las etiquetas textuales elegidas condicionan directamente los resultados, sin calibracion publicada.

## Enlaces
- Modelo GGUF en Hugging Face: https://huggingface.co/gorse-io/clap2-large-audioxl-s1B-GGUF
- Modelo base original: https://huggingface.co/laion/clap2-large-audioxl-s1B
- Model card del checkpoint base (revision fijada): https://huggingface.co/laion/clap2-large-audioxl-s1B/blob/e836feaa79cd1f7de939fe77065819f48fc44e4c/README.md
- Runtime clap.cpp: https://github.com/gorse-io/clap.cpp
- Coleccion Audio-Embedding-GGUF de gorse-io: https://huggingface.co/collections/gorse-io/audio-embedding-gguf
- Conversion CLAP music and speech de gorse-io: https://huggingface.co/gorse-io/larger_clap_music_and_speech-GGUF
