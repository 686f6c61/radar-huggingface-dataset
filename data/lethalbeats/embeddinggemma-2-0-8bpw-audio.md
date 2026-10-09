# lethalbeats/embeddinggemma-2-0.8bpw-audio

## Resumen

embeddinggemma-2-0.8bpw-audio es un artefacto de runtime derivado de google/embeddinggemma-2, publicado por el usuario lethalbeats en HuggingFace. Se trata de una version cuantizada a menos de 1 bit por peso (0,8 BPW) mediante el marco LittleBit de Samsung Research (arXiv:2506.13771), que aplica una factorizacion latente asimetrica 65/35. El objetivo es reducir drasticamente el consumo de memoria para permitir recuperacion semantica audio-texto en hardware con restricciones de memoria, como dispositivos de borde o electrodomesticos con voz.

El modelo conserva la arquitectura multimodal original: un backbone de texto Gemma 2 de 270 millones de parametros junto con un encoder de audio de 300 millones (570 millones en total). El encoder de audio procesa exclusivamente audio mono a 16 kHz, y la salida de embedding tiene 768 dimensiones, con soporte nativo de Matryoshka Representation Learning (MRL) para recortar a 512 o 256 dimensiones.

La relevancia de esta ficha radica en que demuestra una compresion de memoria del 75,9 por ciento respecto al modelo base en BF16/FP32, pasando de unos 2.280 MB a unos 549,0 MB (aproximadamente 4,2 veces mas pequeno). Es un ejemplo practico de cuantizacion extrema aplicada a embeddings multimodales, aunque con cero descargas y cero likes en el momento de la consulta, licencia Gemma y soporte unicamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Gemma 2 (texto) + Audio Convolutional Transformer (audio) |
| Parametros totales | 570 M (270 M backbone de texto + 300 M encoder de audio) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (longitud maxima de secuencia de texto) |
| Tipos de cuantizacion | LittleBit 0,8 BPW (sub-1-bit, factorizacion latente asimetrica 65 por ciento primario / 35 por ciento secundario) |
| Idiomas soportados | Ingles (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Bitstream empaquetado (LittleBit); no se especifica safetensors ni GGUF en la informacion disponible |

Especificaciones adicionales declaradas en la model card:

| Parametro | Valor |
|---|---|
| Dimension de salida | 768 (MRL recortable a 512 y 256) |
| Funcion de similitud | Similitud coseno |
| Frecuencia de muestreo de audio | 16.000 Hz mono |
| Huella de RAM de los pesos | ~549,0 MB |
| Modelo base | google/embeddinggemma-2 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno modular de Google: un backbone de texto Gemma 2 de 270 millones de parametros combinado con un encoder de audio de 300 millones de parametros. El encoder de audio se describe como un Audio Convolutional Transformer que procesa audio mono a 16 kHz, mientras que el backbone de texto gestiona secuencias de hasta 8.192 tokens. Los embeddings de texto y audio se proyectan a un espacio comun de 768 dimensiones sobre el que se calcula similitud coseno, lo que habilita la recuperacion cruzada audio-texto.

La innovacion tecnica principal reside en la cuantizacion LittleBit: los pesos se almacenan en RAM en formato de bitstream empaquetado a 0,8 BPW y se desempaquetan en tiempo de ejecucion dentro de registros SIMD de CPU (ymm0, ymm1 en AVX2), en bloques de 8 o 16 elementos por ciclo de reloj y con menos de 64 KB de cache de trabajo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de embeddings de texto y de audio en un espacio vectorial compartido.
- Recuperacion cruzada audio-texto (audio-text retrieval): emparejar una consulta textual con un clip de audio y viceversa.
- Recuperacion semantica de sonido (sound semantic search).
- Clasificacion de audio y generacion de embeddings de habla (speech embedding).
- Extraccion de caracteristicas (feature-extraction) para pipelines de vector databases.
- Recorte Matryoshka (MRL) de embeddings a 512 o 256 dimensiones con renormalizacion L2, para ahorrar almacenamiento en bases de datos vectoriales.
- Entrada de audio como ruta a fichero .wav/.mp3 o como array de forma de onda float32 mono a 16 kHz.
- Procesamiento de texto de hasta 8.192 tokens por secuencia.
- Soporte multilingue: solo ingles.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, vision, thinking mode ni generacion de texto libre.

## Casos de uso

- Busqueda semantica de audio en dispositivos de borde: el modelo cabe en aproximadamente 549,0 MB de RAM y descomprime pesos en registros SIMD de CPU, por lo que puede ejecutar recuperacion audio-texto en hardware embebido sin GPU.
- Indexacion y busqueda de archivos de sonido: generar embeddings de una biblioteca de clips a 16 kHz y permitir consultas en lenguaje natural sobre ellos mediante similitud coseno.
- Clasificacion automatica de sonidos: usar los embeddings de audio como caracteristicas de entrada para un clasificador ligero (por ejemplo, deteccion de eventos sonoros) en entornos con memoria limitada.
- Busqueda multimodal en asistentes de voz: relacionar una frase del usuario con clips de audio almacenados, aprovechando el espacio compartido texto-audio.
- Deduplicacion y clustering de audio: agrupar grabaciones semanticamente similares recortando los embeddings a 256 dimensiones con MRL para reducir el almacenamiento en la base de datos vectorial.
- Moderacion o etiquetado de contenido sonoro: recuperar clips que coincidan con descripciones textuales de categorias (por ejemplo, "tormenta con lluvia intensa") en un pipeline de revision automatizada.
- Prototipado de investigacion en cuantizacion extrema: servir como banco de pruebas reproducible del marco LittleBit sobre un modelo multimodal de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (por ejemplo, recall@k en tareas audio-texto), ni comparaciones numericas de precision frente al modelo base sin cuantizar. El unico dato cuantitativo aportado es la reduccion de memoria: de ~2.280 MB (base BF16/FP32) a ~549,0 MB, un 75,9 por ciento menos, equivalente a un factor de compresion de aproximadamente 4,2 veces.

## Requisitos de hardware

- Huella de pesos en RAM: ~549,0 MB en formato de bitstream empaquetado a 0,8 BPW.
- Comparacion con base: ~2.280 MB en BF16/FP32, por lo que este derivado ahorra ~1.731 MB.
- CPU: la descompresion en tiempo de ejecucion usa registros SIMD AVX2 (ymm0, ymm1) con menos de 64 KB de cache de trabajo, lo que sugiere que requiere una CPU con soporte AVX2 para un rendimiento optimo.
- GPU: no se especifican GPU recomendadas ni VRAM estimada en la informacion disponible.
- Idoneidad para GPU de consumo: no se indica explicitamente; el enfoque esta orientado a hardware de borde con restricciones de memoria.
- Opciones de despliegue: la libreria declarada es sentence-transformers, pero el uso requiere el modulo modeling_littlebit (clase EmbeddingGemma2AudioLittleBit). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Memoria de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| embeddinggemma-2-0.8bpw-audio | 570 M | 8.192 tokens | LittleBit 0,8 BPW | ~549,0 MB | Gemma | HuggingFace (lethalbeats) |
| google/embeddinggemma-2 | 570 M | 8.192 tokens | BF16/FP32 | ~2.280 MB | Gemma | HuggingFace (Google) |

No se dispone de datos de rendimiento ni de modelos comparables adicionales (por ejemplo, otros sistemas de recuperacion audio-texto) en la informacion proporcionada, por lo que no es posible establecer comparaciones mas alla de la huella de memoria frente al modelo base.

## Limitaciones y advertencias

- Artefacto comunitario: no es una distribucion oficial de Google y esta sujeto a los Gemma Terms of Use.
- No se han publicado benchmarks que validen la perdida de precision tras la cuantizacion a 0,8 BPW; la degradacion en tareas de recuperacion es desconocida.
- Idioma: solo ingles, lo que limita su uso en castellano y otros idiomas.
- Modalidad de audio restringida: exclusivamente mono a 16 kHz; no se declara soporte de audio estereo ni de otras frecuencias.
- Riesgo de alucinacion: no se documenta, pero todo modelo de embeddings puede producir similitudes erroneas en dominios fuera de su distribucion de entrenamiento.
- Sesgos: no se proporciona informacion sobre sesgos conocidos.
- Licencia: la licencia Gemma impone condiciones de uso comercial que deben revisarse antes de un despliegue en produccion.
- Madurez: cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Dependencia de implementacion: requiere el modulo modeling_littlebit y su desempaquetado en registros SIMD, lo que puede limitar la portabilidad frente a formatos estandar como GGUF o safetensors.
- El tamano del repositorio aparece como 0,0 GB, dato que no permite verificar la integridad de los pesos alojados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lethalbeats/embeddinggemma-2-0.8bpw-audio
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Paper LittleBit (Samsung Research): https://arxiv.org/abs/2506.13771
- Version HTML del paper: https://arxiv.org/html/2506.13771v5
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Perfil del autor: https://huggingface.co/lethalbeats
