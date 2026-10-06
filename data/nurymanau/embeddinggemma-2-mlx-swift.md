# Nurymanau/EmbeddingGemma-2-MLX-Swift

## Resumen

EmbeddingGemma-2-MLX-Swift es un paquete de pesos listos para usar del modelo de embeddings google/embeddinggemma-2, adaptados y empaquetados para EmbeddingGemma2Swift, un runtime nativo en Swift construido sobre MLX y orientado a Mac e iPhone. El autor del repositorio es Nurymanau, mientras que el modelo original fue desarrollado por Google DeepMind. Este release no es un modelo nuevo ni un modelo de chat: se limita a adaptar y reempaquetar los pesos originales para su ejecución local en hardware Apple, sin entrenamiento ni calibración adicionales.

La relevancia de este paquete es práctica: permite ejecutar extracción de características (feature-extraction) totalmente en local sobre Apple Silicon, sin Python ni peticiones de red en tiempo de inferencia. El repositorio separa los pesos en tres bloques modulares: un codificador de texto cuantizado a 8 bits afines por grupos de 64 (aproximadamente 288 MB), una torre de visión más un puente también a 8 bits (aproximadamente 193 MB) y una torre de audio opcional sin cuantizar en BF16 (aproximadamente 611 MB). El texto es obligatorio para todas las modalidades y los pesos de texto más visión suman unos 481 MB, a los que se añaden unos 32 MB de tokenizer y ficheros de configuración. El repositorio completo ocupa 1,1 GB.

Se trata por tanto de una pieza de infraestructura para desarrolladores que quieran integrar búsqueda semántica y recuperación multimodal en aplicaciones iOS y macOS, más que de un modelo con benchmarks publicados. El modelo card es explícito sobre sus límites: el audio es experimental, las imágenes se procesan de una en una y no se ha demostrado la mejora de velocidad frente a BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; heredada de google/embeddinggemma-2 (modelo de embeddings multimodal). El paquete incluye codificador de texto, torre de visión con puente y torre de audio con puente |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Texto y visión: affine 8-bit, group size 64. Audio: BF16 sin cuantizar. Matrices 2D compatibles de texto/visión cuantizadas con MLX estándar; normas, escalares y tabla de posición 3D de visión sin cuantizar |
| Idiomas soportados | Multilingüe (heredado del modelo base). La model card no detalla la lista completa de idiomas; las validaciones mencionan ruso e inglés |
| Licencia | Pesos: Apache-2.0. El código del runtime tiene licencia MIT |
| Formato de pesos | safetensors (MLX, empaquetado con metadatos versionados en quantization.json). No es compatible directamente con checkpoints Python mlx-vlm. Las activaciones FP16 no están soportadas; el dtype de trabajo por defecto es BF16 |
| Dimensiones de salida | Vectores normalizados en Float32 con 128, 256, 512 o 768 dimensiones |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo subyacente es google/embeddinggemma-2, del que este repositorio es una adaptación de pesos, no un reentrenamiento. La model card indica explícitamente que no se ha realizado entrenamiento ni calibración. El proceso aplicado consiste en cuantizar todas las matrices de pesos bidimensionales compatibles de texto y visión con el cuantizador estándar de MLX (affine 8-bit, group size 64), dejando sin cuantizar las normas, los escalares y la tabla de posición 3D de la torre de visión. La torre de audio se distribuye sin cambios en BF16.

El paquete se apoya en el runtime EmbeddingGemma2Swift, construido con MLX Swift 0.32.3 y Swift Transformers 1.3.0, con un layout de pesos empaquetado que incluye metadatos versionados de cuantización. No se documenta la composición del dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO, ya que esa información corresponde al modelo base y no se reproduce en esta model card. Como innovación destacable, el paquete permite truncar los vectores de salida a 128, 256, 512 o 768 dimensiones y mantiene la inferencia local íntegra en Swift, sin dependencia de Python ni de red durante la ejecución.

## Capacidades

- Extracción de características (embeddings) de texto con vectores normalizados en Float32.
- Codificación de imágenes mediante una torre de visión con puente, procesando una imagen por vez.
- Codificación de audio opcional mediante una torre en BF16, orientada a experimentación.
- Recuperación multimodal texto a imagen (validada de forma sintética en ruso e inglés).
- Salidas con dimensionalidad configurable: 128, 256, 512 o 768 dimensiones.
- Capacidad multilingüe heredada del modelo base.
- Inferencia totalmente local en Mac e iPhone, sin peticiones de red ni Python en tiempo de ejecución.
- No soporta: generación de texto, chat, generación de imágenes, ASR, TTS, vídeo ni documentos multimodales intercalados.
- No se documenta soporte de tool calling, function calling ni flujos de agentes, ya que no es un modelo generativo.

## Casos de uso

- Búsqueda semántica local en aplicaciones macOS: el modelo genera embeddings de consulta y documentos en el propio dispositivo, de modo que una app de notas o correo puede indexar y recuperar contenido sin enviar datos a un servidor.
- Sistemas RAG en apps iOS con requisitos de privacidad: al ejecutarse íntegramente en local sobre MLX, permite construir recuperación aumentada sin exponer documentos del usuario a servicios externos.
- Deduplicación y agrupación de documentos: los embeddings normalizados permiten calcular similitud por coseno para agrupar artículos, tickets o registros duplicados en pipelines de datos.
- Recuperación de fotos por descripción textual: la torre de visión permite indexar imágenes y recuperarlas mediante consultas en lenguaje natural, útil en aplicaciones de galería o gestión de activos con procesamiento por lotes de una imagen a la vez.
- Clasificación y enrutado de contenido: los vectores pueden alimentar clasificadores ligeros para enrutar tickets de soporte o moderar contenido en función de la similitud semántica con ejemplos predefinidos.
- Motor de recomendación basado en similitud: artículos, publicaciones o productos se representan como vectores para sugerir elementos relacionados por cercanía semántica sin necesidad de un backend de inferencia.
- Búsqueda híbrida en aplicaciones móviles con vectores truncados: usar la configuración de 128 o 256 dimensiones reduce el almacenamiento y el coste de comparación cuando el presupuesto de memoria o de índice es ajustado.
- Experimentación con recuperación de audio: la torre de audio opcional permite probar prototipos de búsqueda por descripción sobre clips cortos, siempre con la advertencia de que su calidad de recuperación es experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, BEIR u otros) en la información disponible. La model card únicamente reporta validaciones sintéticas internas:

| Prueba | Resultado |
|---|---|
| Texto bilingüe, conjunto dev sintético | 24/24 coincidencias |
| Texto bilingüe, holdout sintético separado | 16/16 coincidencias |
| Texto a imagen (ruso/inglés, 3 imágenes sintéticas retenidas) | 6/6 coincidencias |
| Tests Swift y comprobaciones de validación de entrada | 11 superados |
| Perfil q4 | Rechazado pese a acertar el top-1 en el conjunto dev simple |
| Audio (smoke test con descripciones en ruso) | 1/4 coincidencias en cada dirección |
| Aceleración frente a BF16 | No establecida |

El autor advierte que estas son comprobaciones sintéticas pequeñas y no benchmarks amplios de calidad en el mundo real. Se realizaron auditorías independientes en CPU FP32 y desempaquetado con NumPy para verificar la implementación al margen de la pérdida por cuantización.

## Requisitos de hardware

- Pesos de texto (q8): unos 288 MB. Pesos de visión (q8): unos 193 MB. Texto más visión: unos 481 MB, más unos 32 MB de tokenizer y configuración.
- Pesos de audio (BF16, opcional): unos 611 MB. El repositorio completo ocupa 1,1 GB.
- Validado en un MacBook Air M3 con 16 GiB de memoria y en un iPhone 16 Pro Max físico con iOS 27.0.
- Al tratarse de un modelo de embeddings de tamaño moderado en cuantización de 8 bits, es razonable esperar que quepa en hardware Apple Silicon con 16 GiB o menos, incluyendo portátiles de gama de entrada, si bien no se documentan requisitos mínimos oficiales ni un rango de memoria exacto.
- GPU recomendadas: no disponible. El paquete está orientado a Apple Silicon (MLX) y no se documentan rutas de despliegue para GPU NVIDIA o AMD.
- Opciones de despliegue: runtime nativo EmbeddingGemma2Swift sobre MLX, construido con Xcode (esquema eg2-embed). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el autor señala que el layout empaquetado no es un checkpoint mlx-vlm de Python directamente utilizable.
- Latencia y throughput: no disponible. La mejora de velocidad respecto a BF16 no se ha establecido.
- La descarga de pesos es un paso de configuración explícito y separado; el helper descarga una revisión fijada y verifica el SHA256.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nurymanau/EmbeddingGemma-2-MLX-Swift | Paquete de pesos MLX Swift para embeddings multimodales | No disponible | No disponible | Multilingüe | Apache-2.0 (pesos), MIT (runtime) | HuggingFace, 1,1 GB, 0 descargas |
| google/embeddinggemma-2 | Modelo original de embeddings de Google DeepMind | No disponible | No disponible | Multilingüe | No disponible en la información facilitada | HuggingFace, revisión 914f7f89142e33e77833254d9c9b90c3cef7303b |
| Alternativas de embeddings multilingües (por ejemplo, familias BGE-M3 o multilingual-e5) | Modelos de embeddings | No disponible | No disponible | Multilingüe | No disponible | No disponible en la información facilitada |

No se dispone de datos de benchmarks ni de especificaciones comparables para las alternativas, por lo que la comparación cuantitativa no es posible con la información proporcionada. La diferencia principal entre este paquete y el modelo original es el formato y el destino: aquí los pesos están cuantizados y empaquetados para ejecución nativa en Apple Silicon mediante MLX Swift, con un layout no compatible con los checkpoints de Python.

## Limitaciones y advertencias

- No es un modelo nuevo: no se realizó entrenamiento ni calibración, por lo que hereda los sesgos y limitaciones del modelo base google/embeddinggemma-2.
- No es un modelo de chat ni de generación: no admite conversación, generación de texto, generación de imágenes, ASR ni TTS.
- El audio es experimental en calidad de recuperación: un smoke test con descripciones en ruso solo obtuvo 1/4 coincidencias en cada dirección, pese a la paridad numérica.
- Las imágenes se procesan de una en una; se rechaza la transparencia y no se ha establecido la paridad exacta de decodificación para JPEG, HEIC o perfiles de color.
- La entrada de audio admite PCM16 WAV mono a 16 kHz o muestras Float normalizadas, con un máximo de 30 segundos; la inferencia neuronal completa a 30 segundos no está validada (solo se comprobó el frontend).
- No soporta vídeo ni documentos multimodales intercalados.
- El perfil de cuantización q4 fue rechazado, por lo que no debe asumirse que cualquier perfil de cuantización funcione correctamente.
- El rendimiento en dispositivos y sistemas operativos antiguos, con térmica sostenida, consumo de batería o recuperación amplia en el mundo real no está medido.
- Las validaciones publicadas son conjuntos sintéticos pequeños (24/24 y 16/16 en texto, 6/6 en tres imágenes sintéticas) y no constituyen evidencia de calidad general.
- No se ha establecido la ganancia de velocidad frente a BF16.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir recuperaciones irrelevantes cuando la consulta queda fuera de la distribución del modelo base.
- Licencia: los pesos son Apache-2.0 y el código del runtime es MIT, con avisos de terceros incluidos. No se implica afiliación ni respaldo con Google ni con el autor del runtime original, ni reclamación de ser el primer soporte MLX o iOS.
- Advertencia de producción: las activaciones en FP16 no están soportadas y el dtype de trabajo por defecto es BF16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nurymanau/EmbeddingGemma-2-MLX-Swift
- Repositorio del runtime EmbeddingGemma2Swift: https://github.com/Obscyra-app/EmbeddingGemma2Swift
- README del runtime (integración como paquete Swift, ejemplos de imagen y audio y demo iOS): https://github.com/Obscyra-app/EmbeddingGemma2Swift#readme
- Detalles de validación: https://github.com/Obscyra-app/EmbeddingGemma2Swift/blob/main/VALIDATION.md
- Modelo base original: https://huggingface.co/google/embeddinggemma-2
- Revision del modelo base citada: 914f7f89142e33e77833254d9c9b90c3cef7303b
- SHA256 de los safetensors originales: 197a32965d4b1105faf060417baa899e193fb73cd401f42ec9295234d5553d79
