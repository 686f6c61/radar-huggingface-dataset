# gorse-io/clap2-small-audioxl-s1B-GGUF

## Resumen

CLAP2 Small AudioXL en formato GGUF es una conversión del modelo `laion/clap2-small-audioxl-s1B` de LAION, publicada por gorse-io para su uso con el runtime `clap.cpp`. No es un modelo generativo, sino un modelo de embeddings conjuntos audio-texto: proyecta audio y descripciones textuales a un mismo espacio vectorial de 512 dimensiones, L2-normalizado, lo que permite tareas de recuperación y clasificación multimodal (por ejemplo, buscar un clip de audio a partir de una frase o etiquetar audio con texto).

La relevancia de esta publicación es de infraestructura más que de modelado: empaqueta ambos codificadores (audio y texto) junto con el tokenizador y la configuración del frontend de audio en un único fichero GGUF, lo que simplifica el despliegue en C++ sin dependencias de Python. El frontend de audio trabaja a 32 kHz y `clap.cpp` acepta WAV, MP3 y FLAC con remuestreo automático.

El modelo base cuenta con 103.896.961 parámetros y licencia Apache-2.0, heredada del checkpoint original de LAION. Esta conversión no modifica la licencia ni el comportamiento del modelo fuente; solo cambia el formato de almacenamiento de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP2 (codificador dual audio-texto con embeddings conjuntos); detalles internos de capas no disponibles |
| Parametros totales | 103.896.961 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y F16 (no se soporta la cuantizacion por bloques de CLAP2 en esta release) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un unico fichero con ambos codificadores, tokenizador y configuracion del frontend) |

## Arquitectura y entrenamiento

El modelo base es CLAP2 (Contrastive Language-Audio Pretraining, segunda iteracion), un modelo de codificador dual que aprende representaciones alineadas entre audio y texto mediante un objetivo contrastivo, de forma analoga a CLIP pero en la modalidad audio-texto. Produce embeddings conjuntos de 512 dimensiones, L2-normalizados, para ambas modalidades. El frontend de audio opera a 32 kHz. Los detalles sobre número de capas, dimensiones ocultas, composición del dataset de entrenamiento, número de tokens/pares audio-texto y si hubo etapas de ajuste fino adicionales no están disponibles en la información proporcionada.

La conversión a GGUF la realiza gorse-io para su runtime `clap.cpp`. En el formato F16, las matrices de pesos 2D se almacenan en IEEE FP16 mientras que el resto de tensores y las activaciones nativas permanecen en F32. La validación incluida en el repositorio compara ambos formatos contra la implementación oficial de CLAP2 fijada a una revisión concreta; en el caso de F16 se usan pesos de referencia redondeados de forma idéntica, y el autor advierte explícitamente que estas pruebas deterministas establecen concordancia de implementación, no calidad de recuperación.

## Capacidades

- Generación de embeddings de audio: codifica ficheros WAV, MP3 y FLAC (con remuestreo a 32 kHz) en vectores de 512 dimensiones.
- Generación de embeddings de texto: codifica descripciones textuales en el mismo espacio vectorial de 512 dimensiones.
- Similitud audio-texto: permite puntuar la correspondencia entre un clip de audio y una frase mediante producto escalar o similitud coseno sobre embeddings normalizados.
- Recuperación multimodal: búsqueda de audio por texto y de texto por audio (retrieval).
- Clasificación zero-shot de audio mediante prompts textuales.
- Extracción de características para pipelines de machine learning (pipeline declarado: `feature-extraction`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre; es un modelo de representación, no generativo.
- No se documentan capacidades de visión ni de audio en streaming.

## Casos de uso

- Búsqueda de audio por descripción textual: indexar una fonoteca con embeddings de audio y consultar con frases como "ladrido de perro"; la similitud coseno sobre vectores de 512 dimensiones normalizados permite un ranking directo sin reentrenamiento.
- Etiquetado zero-shot de clips: comparar el embedding de un audio contra un conjunto de prompts textuales candidatos y asignar la etiqueta de mayor similitud, útil para triage automático de archivos sin anotaciones.
- Deduplicación y clustering de audio: agrupar grabaciones similares (mismo evento sonoro, misma fuente) calculando distancias entre embeddings, por ejemplo para limpiar datasets de entrenamiento.
- Moderación de contenido sonoro: detectar categorías de audio no deseadas mediante prompts textuales definidos por política, con un pipeline de extracción de características ligero en C++.
- Integración en aplicaciones nativas C++: al usar `clap.cpp` con un único fichero GGUF, el modelo se puede enlazar en un binario sin runtime de Python, adecuado para aplicaciones de escritorio o sistemas embebidos con recursos limitados.
- Filtrado previo en pipelines de datos multimodales: generar embeddings de audio a gran escala para seleccionar subconjuntos relevantes antes de un procesamiento más costoso (transcripción, modelos generativos).
- Sistemas de recomendación con señal de audio: incorporar el embedding de 512 dimensiones como característica en un motor de recomendación junto a otras señales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye únicamente pruebas deterministas de concordancia con la implementación oficial de CLAP2 (fixtures de referencia y validación nativa por formato), y el autor indica explícitamente que estas no constituyen benchmarks de calidad de recuperación.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,6 GB en total (incluye F32 y F16); el fichero F16 se sitúa en torno a 0,2 GB de pesos y el F32 en torno a 0,4 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 2 GB o más de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Para lotes grandes de audio, una RTX 4090 o una L4 aportan margen de throughput.
- Cabe en GPU consumer: sí, en todas las generaciones recientes (GTX 1060 en adelante, en la práctica limitado por el soporte de `clap.cpp`).
- Opciones de despliegue: `clap.cpp` (runtime previsto por el autor, commit `60def51cff6564eb35ef859487b1071d04e0ed52` o posterior compatible, con el binario `clap-cli`). No está pensado para llama.cpp, vLLM, TGI ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| gorse-io/clap2-small-audioxl-s1B-GGUF (esta ficha) | 103.896.961 | no disponible | Audio-texto (embeddings) | Apache-2.0 | GGUF |
| laion/clap2-small-audioxl-s1B | 103.896.961 | no disponible | Audio-texto (embeddings) | Apache-2.0 | safetensors (formato original) |
| Otras conversiones de la coleccion Audio-Embedding-GGUF de gorse-io | no disponible | no disponible | Audio (embeddings) | no disponible | GGUF |

La comparación con alternativas de la misma categoría (por ejemplo, otros modelos de embeddings audio-texto como los de la familia CLAP original o AudioCLIP) no está disponible en la información proporcionada; no se aportan datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo vectores. No debe evaluarse con benchmarks de generación.
- Solo se han publicado formatos F32 y F16; la cuantizacion por bloques de CLAP2 no está soportada en esta release, lo que limita la reducción adicional de tamaño.
- El autor advierte que las validaciones incluidas demuestran concordancia con la implementación oficial, no calidad de recuperación; no hay evidencia publicada de rendimiento en tareas downstream.
- Dependencia de un runtime específico (`clap.cpp`) y de un commit concreto o posterior compatible; no es compatible con llama.cpp ni con los servidores de inferencia habituales.
- Idiomas soportados no documentados: el comportamiento multilingüe del codificador de texto no está especificado en la información disponible.
- Sesgos y riesgo de alucinación: no documentados en la información proporcionada; al tratarse de un modelo contrastivo, los errores se manifiestan como recuperaciones o etiquetas incorrectas, no como texto inventado.
- Licencia Apache-2.0 heredada del modelo base, que permite uso comercial; la conversión no altera la licencia del modelo fuente, pero conviene verificar la model card original de LAION para condiciones adicionales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gorse-io/clap2-small-audioxl-s1B-GGUF
- Modelo base: https://huggingface.co/laion/clap2-small-audioxl-s1B
- Model card del modelo base (revisión fijada): https://huggingface.co/laion/clap2-small-audioxl-s1B/blob/9891ee368dbec866dab1919f163b7e091ab0ed37/README.md
- Runtime clap.cpp: https://github.com/gorse-io/clap.cpp
- Colección Audio-Embedding-GGUF: https://huggingface.co/collections/gorse-io/audio-embedding-gguf
