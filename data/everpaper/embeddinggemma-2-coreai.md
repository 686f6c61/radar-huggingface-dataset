# EverPaper/embeddinggemma-2-coreai

## Resumen

EmbeddingGemma 2 Core AI es la conversión del modelo de embeddings multimodal `google/embeddinggemma-2` al runtime Core AI de Apple, publicada por el usuario EverPaper. Se trata de un modelo de extracción de características (feature-extraction) que proyecta texto, imágenes y audio a un mismo espacio vectorial compartido de 768 dimensiones con embeddings Matryoshka. Está pensado exclusivamente para macOS 27 sobre silicio de Apple (M-series), donde aprovecha la Neural Engine y la GPU del sistema.

El modelo no es generativo: no produce texto libre, sino vectores normalizados que permiten búsqueda semántica, recuperación cruzada de modalidades (texto-a-imagen, texto-a-audio, imagen-a-caption) y clustering. La versión 1.2 incorpora el codificador de audio (un conformer de 12 capas), además del codificador de texto (24 capas bidireccionales) ya presente en 1.0 y el codificador de visión (16 capas) añadido en 1.1.

La relevancia de este port reside en la ejecución totalmente on-device: inferencias de texto en torno a 5 ms, imágenes en 0,13-0,37 s y clips de audio de 3 s en 18-22 ms sobre hardware de consumo Apple. La licencia es Apache 2.0, aunque la model card remite a la Gemma Prohibited Use Policy del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida multimodal: encoder de texto bidireccional (24 capas), vision encoder (16 capas), audio encoder conformer (12 capas); proyección 512→768 |
| Parametros totales | no disponible (tamaños por asset: texto 632,2 MB, visión 307,0 MB, audio 589,3 MB en fp16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Texto: buckets de 32 a 2048 tokens; audio: hasta 30 s por clip; imagen: 280 soft tokens |
| Tipos de cuantizacion | fp16 (bf16 redondeado a fp16 en el export; no se publican variantes GGUF ni int8/int4) |
| Idiomas soportados | Multilingüe (18 idiomas probados en audio; idiomas de texto heredados de EmbeddingGemma 2) |
| Licencia | Apache 2.0 (con puntero a Gemma Prohibited Use Policy) |
| Formato de pesos | `.aimodel` (formato nativo de Apple Core AI); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo reutiliza los pesos originales de `google/embeddinggemma-2` (familia Gemma 4) sin reentrenamiento. El pipeline completo consta de tres codificadores que comparten una misma proyección a 768 dimensiones: un encoder de texto de 24 capas bidireccionales con proyección final 512→768, masked mean pooling y normalización L2; un vision encoder de 16 capas que genera 280 soft tokens inyectados en el encoder de texto; y un audio encoder conformer de 12 capas que produce 25 soft tokens por segundo de audio, también inyectados en el encoder de texto. Esta compartición del encoder de texto es la que garantiza que texto, imagen y audio vivan en el mismo espacio vectorial.

No se describe en la información proporcionada ningún proceso de RLHF, DPO ni ajuste adicional por parte de EverPaper. El port se limita a convertir bf16 a fp16, plegar algunas escalas constantes y eliminar filas de posición no utilizadas (recogidas en NOTICE). La innovación técnica principal es la integración directa con la Neural Engine y la GPU de Apple mediante funciones separadas por buckets (`mm_32` … `mm_2048`, `vision_2520`, `audio_192` … `audio_3000`), con rutas de cómputo seleccionables de forma independiente por modalidad.

## Capacidades

- Generación de embeddings de texto normalizados de 768 dimensiones con soporte Matryoshka (posibilidad de truncar a dimensiones menores sin reentrenar).
- Similitud semántica de frases (sentence-similarity) y búsqueda densa sobre grandes corpus.
- Embeddings de imagen: convierte screenshots, gráficos, diapositivas y fotografías en vectores en el mismo espacio que el texto.
- Embeddings de audio: procesa hasta 30 segundos de voz, música o sonidos ambientales; clips más largos se truncan o se promedian por ventanas de 30 s.
- Recuperación cruzada texto-a-imagen y texto-a-audio, así como recuperación inversa (imagen o audio a caption).
- Reconocimiento multilingüe en audio (18 idiomas probados) y texto multilingüe heredado del modelo base.
- Preprocesado exacto en host: decodificación, redimensionado y parcheado de imagen en Swift/numpy; decodificación, conversión a mono, 16 kHz y log-mel para audio.
- Ejecución totalmente on-device sobre Neural Engine o GPU de Apple silicon, sin dependencia de nube.

## Casos de uso

- Búsqueda semántica local de documentos: indexar un corpus de notas, PDFs o correos en vectores de 768 dimensiones y responder consultas en lenguaje natural en milisegundos sin salir del Mac del usuario.
- Recuperación multimodal en herramientas creativas: un diseñador busca "gráfico de barras de ventas" y recupera capturas, slides y fotos relevantes sin etiquetado manual, gracias al espacio compartido texto-imagen.
- Transcripción asistida y búsqueda en audio: indexar notas de voz y reuniones (hasta 30 s por ventana) para localizar fragmentos por descripción semántica del contenido hablado o del ambiente sonoro.
- Sistemas RAG on-device: integrar el modelo como retriever local en aplicaciones de asistencia que necesitan privacidad total, aprovechando la latencia de ~5 ms por consulta de texto.
- Organización automática de bibliotecas multimedia: clustering de fotos, capturas y clips de audio por similitud en el espacio de 768 dimensiones para agrupar contenido relacionado.
- Moderación o deduplicación de contenido: comparar embeddings para detectar duplicados o variantes semánticas de textos, imágenes y audios dentro de un mismo pipeline.
- Anotación automática de activos: generar etiquetas descriptivas mediante recuperación de captions vecinos en el espacio vectorial.
- Prototipos de investigación en multimodalidad: evaluar alineación texto-imagen-audio en hardware Apple sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye métricas de latencia y consumo en silicio de Apple:

| Tarea | Ruta Neural Engine | Ruta GPU |
|---|---|---|
| Texto corto (por consulta) | ~5 ms (0,3 ms CPU, 0,4-0,5 ms GPU) | ~5 ms (misma ruta) |
| Imagen | ~0,37 s (~2 ms CPU, casi nada de GPU) | ~0,13 s (≈3× más rápido, más consumo) |
| Audio 3 s | 18 ms extremo a extremo (1-2 ms CPU) | 22 ms |
| Audio 30 s | 0,16 s | 0,12 s |

## Requisitos de hardware

- Plataforma: exclusivamente macOS 27 sobre Apple silicon (M-series). No hay soporte para Linux, Windows ni GPU NVIDIA/AMD.
- Almacenamiento: 2,2 GB de repositorio; opcional excluir el encoder de visión (293 MiB) y/o el de audio (562 MiB) si solo se necesita texto.
- Memoria: no se publican cifras de VRAM/RAM; los pesos en fp16 son 632,2 MB (texto) + 307,0 MB (visión) + 589,3 MB (audio), por lo que se espera un consumo moderado en máquinas con 16 GB unificados o más.
- GPU recomendadas: ninguna discreta; se usa la GPU integrada o la Neural Engine del propio chip Apple.
- Cabe en equipos de consumo: cualquier Mac Apple silicon con macOS 27. No aplica a RTX 4090, A100 ni H100.
- Opciones de despliegue: Core AI (formato `.aimodel`), paquete SwiftPM `EmbeddingGemma2CoreAI` con la herramienta `eg2-cli`, y librería más CLI de Python (`embeddinggemma2_coreai.py`). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks; los valores están medidos por operación, no se publica throughput agregado en lotes.

## Comparativa con modelos similares

| Modelo | Modalidades | Dimension | Contexto / ventana | Ejecución | Licencia |
|---|---|---|---|---|---|
| EmbeddingGemma 2 Core AI (este) | Texto, imagen, audio | 768-d Matryoshka | 2048 tokens, 30 s audio | On-device, Apple silicon / Core AI | Apache 2.0 |
| google/embeddinggemma-2 | Según modelo base (no detallado) | 768-d Matryoshka | No disponible en la información dada | Servidor / GPU | Apache 2.0 (con Gemma policy) |
| Alternativas tipo CLAP / ImageBind / SigLIP | Imagen+audio o imagen+texto según modelo | Diversas dimensiones | No disponible en la información dada | GPU servidor | Diversas |

No se dispone en la información proporcionada de datos de rendimiento cuantitativos que permitan una comparación de calidad con alternativas equivalentes.

## Limitaciones y advertencias

- Dependencia total de macOS 27 y Apple silicon: no es desplegable en Linux, Windows ni en GPU NVIDIA, lo que limita su uso a aplicaciones nativas de Mac.
- Audio limitado a 30 s por clip en su ventana original; los clips más largos se truncan o se promedian por ventanas, lo que puede degradar la fidelidad del embedding para contenidos extensos.
- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings. Cualquier caso de uso tipo chat o generación requiere un LLM adicional.
- Repositorio con 0 descargas y publicado muy recientemente (12 de octubre de 2026), sin adopción verificable ni benchmarks publicados que confirmen la paridad con el modelo original.
- Licencia Apache 2.0 con remisión a la Gemma Prohibited Use Policy del modelo base: conviene revisar las restricciones de uso antes de integrarlo en productos comerciales.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí existe riesgo de recuperaciones espurias cuando la consulta no tiene vecinos semánticos reales en el corpus.
- Los pesos están en fp16 sin variantes cuantizadas a int8/int4 ni formatos GGUF, lo que impide reducir más el footprint.
- Calidad de audio multilingüe medida sobre 18 idiomas; no se detallan los idiomas exactos ni el rendimiento por idioma.
- El modelo reutiliza pesos de EmbeddingGemma 2 sin reentrenamiento, por lo que hereda cualquier sesgo del modelo base de Google.

## Enlaces

- HuggingFace: https://huggingface.co/EverPaper/embeddinggemma-2-coreai
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Página del autor (port): https://everpaper.app
- Licence y NOTICE: incluidos en el repositorio (`LICENSE`, `NOTICE`)
- CHANGELOG: `CHANGELOG.md` dentro del repositorio
- Gemma Prohibited Use Policy: referenciada en NOTICE (no se incluye URL en la información proporcionada)
