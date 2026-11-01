# optima-tools-ch/listen-low

## Resumen

`optima-tools-ch/listen-low` es un paquete de distribucion del modelo Whisper Small de OpenAI en formato GGML, cuantizado a Q5_1 para su uso con el motor whisper.cpp. No se trata de un modelo entrenado por el autor del repositorio: el archivo `ggml-small-q5_1.bin` (190.085.487 bytes) es una copia del publicado en el repositorio de ggerganov/whisper.cpp, en una revision fijada, sin modificaciones por parte de Optima Tools, que actua unicamente como preparador y distribuidor del paquete.

El modelo resuelve el problema de la transcripcion automatica de voz multilingue en entornos con recursos limitados. La cuantizacion Q5_1 reduce el peso del Whisper Small original para que pueda ejecutarse en CPU con requisitos de memoria y computo menores que las variantes Medium y High del mismo paquete. El repositorio incluye documentacion de procedencia (CREDITS.md, SOURCE.json), licencias MIT de OpenAI y de whisper.cpp, y un manifiesto `.optima-package.json` que consume la aplicacion Optima Tools.

Es relevante por su caracter de paquete reproducible y verificable: el SHA-256 del modelo proviene de los metadatos LFS de Hugging Face y coincide con la fuente, aunque el autor indica explicitamente que no ha recalculado el hash sobre el archivo publicado ni ha realizado pruebas de transcripcion, precision o velocidad. El modelo base es `openai/whisper-small`, con arquitectura transformer encoder-decoder y licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small de OpenAI) |
| Parametros totales | no disponible (Whisper Small tiene aproximadamente 244 M, segun el modelo base; el autor no lo especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | Q5_1 (GGML) |
| Idiomas soportados | Multilingue; el autor menciona frances, aleman e ingles como ejemplos, sin lista completa |
| Licencia | MIT (OpenAI para el modelo; whisper.cpp para la conversion y el motor) |
| Formato de pesos | GGML (`.bin`) para whisper.cpp |
| Tamano del archivo | 190.085.487 bytes (190,09 MB) |
| SHA-256 | `ae85e4a935d7a567bd102fe55afc16bb595bdb618e11b2fc7591bc08120411bb` |
| Modelo base | `openai/whisper-small` |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper Small de OpenAI, un transformer encoder-decoder disenado para reconocimiento automatico del habla multilingue. El encoder procesa espectrogramas de audio en ventanas de 30 segundos y el decoder genera la transcripcion de forma autorregresiva, con tokens especiales de idioma y de tarea. El autor del repositorio no aporta datos sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO); esa informacion corresponde a la publicacion de OpenAI y no se detalla en la model card.

La innovacion tecnica de este paquete no esta en el modelo sino en su empaquetado: conversion al formato GGML y cuantizacion Q5_1 realizadas por el proyecto whisper.cpp (Georgi Gerganov y contribuyentes), con el objetivo de reducir el peso y permitir inferencia en CPU. Optima Tools no modifica el archivo, solo lo redistribuye con documentacion de procedencia, revisiones fijadas y verificacion de integridad mediante SHA-256.

## Capacidades

- Transcripcion automatica de voz multilingue (reconocimiento del habla a texto).
- Soporte de multiples idiomas, con mencion explicita de frances, aleman e ingles; la calidad varia segun idioma, grabacion y hardware.
- Ejecucion local mediante whisper.cpp con el binario `whisper-cli` y el parametro de idioma (`-l <langue>`).
- Inferencia en CPU (build de referencia con OpenBLAS); el backend GPU (CUDA o Vulkan) depende de las DLL del motor, no del archivo de modelo.
- No incluye identificacion de interlocutores (diarizacion).
- No garantiza transcripcion en tiempo real.
- No se anuncian capacidades de tool calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Dictado de texto en aplicaciones de escritorio: el modelo se integra en Optima Tools como opcion "Dictee et transcription — Low", invocando `whisper-cli -m ggml-small-q5_1.bin -f dictation.wav -l <langue>` sobre un archivo WAV grabado por el usuario, con un peso de 190 MB que cabe en memoria de equipos modestos.
- Transcripcion de reuniones y notas de voz en equipos sin GPU: la cuantizacion Q5_1 y la build CPU con OpenBLAS permiten procesar audio localmente sin depender de servicios en la nube.
- Subtitulado de contenido audiovisual en varios idiomas: al ser un modelo multilingue, puede transcribir material en frances, aleman o ingles, aunque el autor advierte que la calidad varia por idioma y calidad de grabacion.
- Procesamiento por lotes de archivos de audio en pipelines internos: el motor whisper.cpp acepta archivos WAV y puede encadenarse en scripts para transcribir lotes de grabaciones.
- Prototipado y evaluacion de ASR en entornos con recursos limitados: al ser un paquete ligero y verificable por SHA-256, sirve para validar flujos de transcripcion antes de migrar a variantes Medium o High.
- Uso en entornos con requisitos de privacidad: la inferencia local con whisper.cpp evita enviar audio a servidores externos, lo que encaja en flujos donde los datos no pueden salir del equipo.
- Integracion en aplicaciones de terceros que ya usan whisper.cpp: el archivo GGML es compatible con el ecosistema estandar del motor, siempre que se respeten las licencias MIT de OpenAI y whisper.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no anuncia precision, velocidad ni compatibilidad hardware, y que la prueba de transcripcion en Optima Tools no se ha efectuado.

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete esta pensado para inferencia en CPU; el archivo de modelo pesa 190 MB y la memoria necesaria depende del motor y del backend.
- GPU recomendadas: no especificadas por el autor. El backend GPU (CUDA o Vulkan) lo determina el motor whisper.cpp instalado aparte, no el archivo de modelo.
- Compatibilidad con GPU de consumo: no confirmada. El autor no garantiza que el archivo por si solo habilite un backend GPU.
- Opciones de despliegue: whisper.cpp mediante `whisper-cli` (binario y DLL proporcionados por Optima Tools, no incluidos en este repositorio). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| optima-tools-ch/listen-low (Whisper Small Q5_1) | no disponible (base Whisper Small) | ventanas de 30 s (Whisper) | GGML `.bin` | MIT | Hugging Face, descarga directa aun no abierta en la app |
| openai/whisper-small (original) | no disponible en la informacion | ventanas de 30 s (Whisper) | PyTorch / safetensors | MIT | Hugging Face |
| Whisper Medium / High del paquete Optima Tools | no disponible | ventanas de 30 s (Whisper) | GGML | MIT | Mencionados por el autor como niveles superiores del mismo paquete |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El autor no ha realizado pruebas de transcripcion, precision ni velocidad; el control efectuado es unicamente de integridad (SHA-256 de metadatos LFS, no recalculado sobre el archivo publicado).
- La calidad de transcripcion varia segun idioma, calidad del audio y hardware; no se anuncia ninguna cifra de precision.
- No incluye diarizacion de interlocutores ni garantia de transcripcion en tiempo real.
- El repositorio contiene solo el archivo de modelo; requiere el motor whisper.cpp (`whisper-cli.exe` y DLL) proporcionado por Optima Tools, que es un componente distinto.
- El archivo de modelo no anade por si solo un backend GPU; el backend depende de las DLL presentes junto al ejecutable.
- La importacion manual de un `.bin` aislado no copia automaticamente las licencias ni los creditos del repositorio; deben consultarse en el propio repositorio.
- La descarga directa desde la aplicacion Optima Tools no esta abierta todavia.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; son heredados del modelo Whisper Small original de OpenAI.
- Licencia MIT permite uso comercial, pero deben conservarse los avisos de copyright de OpenAI y de whisper.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/optima-tools-ch/listen-low
- Modelo base: https://huggingface.co/openai/whisper-small
- Fuente del archivo GGML (revision fijada): https://huggingface.co/ggerganov/whisper.cpp/tree/5359861c739e955e79d9a303bcbc70fb988958b1
- Proyecto whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Documentacion del repositorio: `README-source.md`, `LICENSE`, `LICENSE-whisper.cpp`, `CREDITS.md`, `CREDITS.json`, `SOURCE.json`, `.optima-package.json` (incluidos en el propio repositorio de Hugging Face)
