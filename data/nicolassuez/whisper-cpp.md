# Nicolassuez/whisper.cpp

## Resumen

`Nicolassuez/whisper.cpp` es un espejo no modificado de una selección de pesos del repositorio oficial `ggerganov/whisper.cpp`, publicados en formato GGML para su uso con la implementación en C/C++ de Whisper desarrollada por Georgi Gerganov. El repositorio no introduce ningún modelo nuevo: redistribuye tres ficheros concretos (`ggml-base-q5_1.bin`, `ggml-small-q5_1.bin` y `ggml-large-v3-turbo-q5_0.bin`) en la revisión `5359861c739e955e79d9a303bcbc70fb988958b1`, con el objetivo declarado de que el proyecto aSup no dependa de un repositorio de terceros.

El modelo subyacente es Whisper de OpenAI, un sistema de reconocimiento automático del habla (ASR) de tipo encoder-decoder transformer entrenado con 680.000 horas de audio etiquetado y sin etiquetar, según la documentación pública de OpenAI. La conversión a GGML permite ejecutar la inferencia en CPU y en GPU de consumo sin dependencias de PyTorch, lo que reduce drásticamente los requisitos de despliegue.

La relevancia de este repositorio es logística más que técnica: ofrece una copia estable y verificable de pesos cuantizados (q5_0 y q5_1) de tres variantes de Whisper con distintos compromisos de tamaño y precisión, lo que facilita la reproducibilidad en pipelines que no pueden depender de la disponibilidad continua del repositorio original. No se han publicado métricas propias, demos ni documentación adicional en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI) convertido a GGML |
| Parametros totales | No disponible (los ficheros incluidos corresponden a las variantes base, small y large-v3-turbo de Whisper) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (ventana de audio de 30 s por segmento, según la arquitectura Whisper estándar) |
| Tipos de cuantizacion | q5_1 (base y small), q5_0 (large-v3-turbo); el repositorio original ofrece además q8_0 y fp16 |
| Idiomas soportados | No disponible en la model card; Whisper es multilingüe por diseño en las variantes no `.en` |
| Licencia | MIT |
| Formato de pesos | GGML (`.bin`) |

## Arquitectura y entrenamiento

Los pesos redistribuidos corresponden a Whisper, un transformer encoder-decoder con atención multi-cabeza estándar que procesa espectrogramas log-Mel de 80 canales (128 en large-v3) sobre ventanas de 30 segundos y genera tokens de texto de forma autorregresiva. La variante `large-v3-turbo` reduce el número de capas del decoder respecto a `large-v3`, lo que disminuye el coste de inferencia a cambio de una pérdida mínima de precisión según la documentación pública de OpenAI.

El entrenamiento original de Whisper, documentado en el paper de Radford et al. (2022), emplea 680.000 horas de audio multilingüe y multitarea, con una mezcla de datos supervisados y pseudo-etiquetados, y no utiliza RLHF. Este repositorio no aporta información sobre el proceso de conversión a GGML ni sobre posibles diferencias de calidad respecto a los pesos originales; se limita a indicar que es un espejo no modificado. La cuantización q5_0/q5_1 reduce los pesos a 5 bits por valor con escalas por bloque, lo que rebaja el tamaño en disco aproximadamente un 60-70 % respecto a fp16.

## Capacidades

- Reconocimiento automático del habla (ASR) en audio de hasta 30 segundos por segmento, con segmentación automática para audios más largos.
- Transcripción multilingüe en las variantes no `.en` (base, small y large-v3-turbo incluidas en este repositorio son multilingües).
- Traducción de voz a texto en inglés desde otros idiomas, capacidad nativa de Whisper.
- Detección de actividad de voz y marcas temporales a nivel de segmento (y de palabra en algunas variantes, según la implementación de whisper.cpp).
- Ejecución en CPU sin dependencias de PyTorch, con soporte de aceleración por GPU (CUDA, Metal, Vulkan) en la implementación whisper.cpp.
- No soporta tool calling, function calling, agentes, visión ni audio de entrada más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: los pesos `ggml-small-q5_1.bin` (181 MiB) permiten transcribir audio en portátiles sin GPU, con latencia aceptable para uso interactivo.
- Subtitulado automático de vídeo: `ggml-large-v3-turbo-q5_0.bin` (547 MiB) ofrece un equilibrio entre calidad y velocidad adecuado para generar subtítulos en lote con marcas temporales.
- Asistentes de voz embebidos: la variante `base-q5_1` (57 MiB) cabe en dispositivos con recursos limitados y puede integrarse en aplicaciones de escritorio o móviles mediante la librería whisper.cpp.
- Anonimización y análisis de llamadas: transcripción previa a pipelines de NLP para extraer entidades o clasificar conversaciones en entornos con requisitos de privacidad, al ejecutarse íntegramente en local.
- Investigación en ASR: punto de partida reproducible para comparar cuantizaciones q5_0 frente a q5_1 y variantes base/small/large-v3-turbo sin depender del repositorio original.
- Documentación accesible: generación de transcripciones de clases, entrevistas o podcasts para su publicación como texto buscable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: `base-q5_1` ≈ 57 MiB de pesos, `small-q5_1` ≈ 181 MiB, `large-v3-turbo-q5_0` ≈ 547 MiB; el consumo real en inferencia es varias veces superior por buffers de activación y espectrogramas (del orden de 1-2 GB para large-v3-turbo en la práctica, aunque no se dispone de cifras oficiales en la información proporcionada).
- GPU recomendadas: cualquier GPU con soporte CUDA, Metal o Vulkan; para large-v3-turbo se recomienda al menos 4 GB de VRAM para obtener aceleración significativa.
- GPU de consumo: sí, cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas Apple Silicon mediante Metal.
- Opciones de despliegue: whisper.cpp (binario `main`/`whisper-cli`), bindings de Python (`whispercpp`, `pywhispercpp`), servidores compatibles con la API de OpenAI sobre whisper.cpp, y contenedores Docker de la comunidad.
- Latencia y throughput: no disponibles en la información proporcionada; dependen fuertemente del hardware y de la variante elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `Nicolassuez/whisper.cpp` (este repo) | base/small/large-v3-turbo (q5) | 30 s por segmento | MIT | GGML | Hugging Face, espejo |
| `ggerganov/whisper.cpp` | todas las variantes Whisper | 30 s por segmento | MIT | GGML | Hugging Face, repositorio oficial |
| Whisper original (OpenAI) | tiny a large-v3 | 30 s por segmento | MIT | PyTorch (`.pt`) | OpenAI, Hugging Face |
| faster-whisper (SYSTRAN) | tiny a large-v3 | 30 s por segmento | MIT | CTranslate2 | Hugging Face, GitHub |

La diferencia principal frente al repositorio oficial es la selección reducida de ficheros y la independencia de terceros; frente a faster-whisper, whisper.cpp prioriza portabilidad sin dependencias de Python.

## Limitaciones y advertencias

- Es un espejo no modificado: no hay garantía de mantenimiento, actualizaciones ni soporte por parte del autor.
- Solo incluye tres ficheros; no cubre las variantes tiny, medium ni las versiones `.en` o q8_0.
- Whisper presenta alucinaciones conocidas en audio con ruido, silencios largos o música, generando texto plausible pero inexistente.
- Sesgos de género, acento y dialecto documentados en el modelo original; el rendimiento en castellano de España puede diferir del de variantes entrenadas específicamente.
- La licencia MIT permite uso comercial, pero debe conservarse el aviso de copyright original de OpenAI y de whisper.cpp.
- No se dispone de información sobre la integridad criptográfica de los ficheros más allá de los SHA del repositorio original; conviene verificar los hashes antes de usarlos en producción.
- La cuantización q5 introduce una degradación de precisión frente a fp16 no cuantificada en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Nicolassuez/whisper.cpp
- Repositorio original de pesos: https://huggingface.co/ggerganov/whisper.cpp
- Proyecto whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelos de whisper.cpp: https://github.com/ggerganov/whisper.cpp/tree/master/models
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- faster-whisper (alternativa): https://github.com/SYSTRAN/faster-whisper
