# JoaoZaokk/kb-whisper-large-ggml

## Resumen

kb-whisper-large-ggml es un reempaquetado en formato GGML/GGUF del modelo de reconocimiento automatico del habla (ASR) KBLab/kb-whisper-large, publicado por el usuario JoaoZaokk. No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion del checkpoint original sueco de KBLab (Kungliga biblioteket, la Biblioteca Nacional de Suecia) para que pueda ejecutarse con el motor whisper.cpp en CPU, GPU o dispositivos moviles sin dependencias de Python.

El repositorio ofrece tres variantes cuantizadas: q4_0 (889 MB), q5_0 (1081 MB) y q8_0 (1657 MB). La motivacion declarada por el autor es mantener estables los enlaces de descarga que consumen las aplicaciones nativas Odysseus y Open WebUI, de modo que cualquier integracion que apunte a estas URL no se rompa. El modelo base pertenece a la familia Whisper large, por lo que hereda su arquitectura encoder-decoder transformer y su ventana fija de 30 segundos de audio.

Es relevante ahora porque cubre un nicho concreto: transcripcion de habla sueca en local, sin enviar audio a servicios en la nube, con un consumo de almacenamiento y memoria muy bajo (menos de 1 GB en la variante q4_0) y con licencia Apache 2.0, lo que facilita su uso comercial. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y no incluye resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia OpenAI Whisper large); inferencia mediante whisper.cpp |
| Parametros totales | No especificado en la model card; la familia Whisper large tiene aproximadamente 1550 millones de parametros (dato no confirmado por el autor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible como tokens; Whisper procesa ventanas de 30 segundos de audio |
| Tipos de cuantizacion | q4_0, q5_0, q8_0 (el autor menciona tambien una conversion f16 sin perdida, no listada en la tabla de ficheros) |
| Idiomas soportados | Tag oficial: sueco (sv). Verificacion del autor realizada con muestras cortas en portugues e ingles |
| Licencia | Apache 2.0 (sin cambios respecto al modelo original) |
| Formato de pesos | GGML / GGUF en ficheros .bin para whisper.cpp |
| Tamano del repositorio | 3,6 GB |
| Tamano por fichero | q4_0: 889 MB; q5_0: 1081 MB; q8_0: 1657 MB |
| Libreria | whisper.cpp |
| Modelo base | KBLab/kb-whisper-large (relacion: quantized) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo. La model card describe un proceso de dos pasos: conversion del checkpoint original de KBLab con el conversor propio de whisper.cpp y posterior cuantizacion con el cuantizador del mismo motor. No se aportan datos sobre el numero de tokens de audio, la composicion del corpus, ni sobre si el modelo original uso RLHF, DPO u otro tipo de ajuste; esa informacion corresponderia a la model card de KBLab/kb-whisper-large, no a este reempaquetado.

Al ser una derivacion de la familia Whisper large, la arquitectura subyacente es un transformer encoder-decoder con representacion log-Mel del audio de entrada y ventanas de 30 segundos, con tokens especiales para marcas de tiempo, deteccion de idioma y tareas de transcripcion o traduccion. La innovacion de este repositorio es puramente de empaquetado: las cuantizaciones q4_0, q5_0 y q8_0 reducen el peso del fichero entre aproximadamente un 45 % y un 73 % respecto a una representacion f16, con el objetivo de que el modelo quepa en telefonos moviles (q4/q5) y en equipos de escritorio y Mac (q8), segun indica el propio autor.

Un detalle tecnico a tener en cuenta: la suma de los tres ficheros cuantizados (889 + 1081 + 1657 = 3627 MB) coincide de forma aproximada con el tamano total del repositorio (3,6 GB), lo que sugiere que la conversion f16 mencionada en el texto de la model card no esta incluida en el repositorio. Se trata de una inferencia a partir de los tamanos declarados, no de una confirmacion explicita del autor.

## Capacidades

- Transcripcion de voz a texto con el motor whisper.cpp (`whisper-cli -m <fichero>`), sin necesidad de Python ni de librerias de deep learning adicionales.
- Ejecucion en local y sin conexion a internet: el audio no abandona el dispositivo, lo que habilita casos de uso con requisitos de privacidad.
- Soporte de marcas de tiempo, deteccion de idioma y tarea de traduccion al ingles, capacidades heredadas de la arquitectura Whisper (no confirmadas explicitamente para este checkpoint en la informacion disponible).
- Inferencia en CPU, y aceleracion opcional por GPU segun el backend de whisper.cpp compilado (Metal, CUDA, Vulkan, OpenCL, BLAS).
- Ejecucion en telefonos moviles gracias a las variantes q4_0 y q5_0, y en equipos de escritorio o Apple Silicon con q8_0.
- Integracion via linea de comandos o embebido en aplicaciones de terceros que enlacen whisper.cpp.
- Tool calling / function calling: no disponible (no es una capacidad propia de un modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio generativo o modo "thinking": no disponibles.
- Capacidades multilingues: el tag oficial es unicamente sueco (sv); no hay confirmacion de cobertura de otros idiomas en la informacion proporcionada.

## Casos de uso

- Transcripcion de habla sueca en aplicaciones moviles sin conexion: la variante q4_0 ocupa 889 MB, por lo que puede embeberse en una app Android o iOS que transcriba notas de voz, entrevistas o memorandos sin enviar audio a un servidor. Es adecuado porque el coste de memoria es bajo y no requiere red.
- Dictado local en herramientas de escritorio tipo Odysseus u Open WebUI: el autor mantiene el repositorio precisamente para que los enlaces de descarga de estas aplicaciones nativas sean estables, de modo que un usuario pueda dictar texto en su propio equipo sin depender de una API externa.
- Subtitulado offline de archivos de audio y video: mediante la CLI de whisper.cpp se pueden generar subtitulos con marcas de tiempo para material audiovisual sueco, integrable en un script de procesamiento por lotes sobre un servidor modesto.
- Transcripcion de entrevistas de investigacion o periodismo con requisitos de confidencialidad: al ejecutarse en local, los datos personales de los informantes no salen del equipo del investigador, lo que simplifica el cumplimiento de normativas de proteccion de datos.
- Procesamiento de archivos sonoros en instituciones culturales y bibliotecas: el modelo base procede de la Biblioteca Nacional de Suecia, por lo que el dominio linguistico objetivo encaja con la digitalizacion y catalogacion de fondos orales suecos.
- Despliegue en hardware de bajo consumo (Raspberry Pi 4/5, mini-PC, portatiles antiguos): la variante q5_0 (1081 MB) o q4_0 (889 MB) permite transcripcion en tiempo no real sobre CPU sin GPU dedicada, util para kioscos, grabadoras inteligentes o dispositivos IoT con microfono.
- Prototipado rapido y pruebas de integracion en CI: al ser un unico fichero binario, se puede descargar y ejecutar en un contenedor de test sin instalar PyTorch ni CUDA, lo que acelera la validacion de una pipeline de ASR antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de WER, MMLU, GSM8K ni de ningun otro conjunto de evaluacion. El unico indicio de validacion mencionado por el autor es la transcripcion de muestras cortas en portugues e ingles antes de subir cada variante cuantizada, lo que no constituye una evaluacion sistematica ni cuantificada.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (valores aproximados a partir del tamano de fichero declarado, mas la sobrecarga del motor y del buffer de audio):
  - q4_0 (889 MB): aproximadamente 1,1-1,5 GB de memoria.
  - q5_0 (1081 MB): aproximadamente 1,3-1,8 GB de memoria.
  - q8_0 (1657 MB): aproximadamente 2,0-2,5 GB de memoria.
- Almacenamiento: 889 MB, 1081 MB o 1657 MB segun la variante elegida; el repositorio completo ocupa 3,6 GB.
- GPU recomendadas: no hay recomendaciones publicadas por el autor. Para la familia Whisper large cuantizada, cualquier GPU con 2 GB o mas de memoria es suficiente para la variante q8_0 en precision mixta; una RTX 3060, RTX 4090, A100 o H100 estaria sobredimensionada para este tamano de modelo, aunque pueden acelerar el procesamiento por lotes.
- Cabe en GPU de consumo: si. Practicamente cualquier GPU de consumo de los ultimos diez anos con 2 GB de VRAM o mas puede ejecutar las tres variantes.
- Cabe en telefonos moviles: si, segun el propio autor, que recomienda q4/q5 para telefonos y q8 para Mac.
- Opciones de despliegue: whisper.cpp (CLI `whisper-cli` y biblioteca embebible) es el soporte oficial declarado en la model card. Tambien es habitual el uso de Ollama y otros runners basados en llama.cpp para ficheros GGML/GGUF, aunque no estan confirmados por el autor para este repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de velocidad de transcripcion ni de factor de tiempo real para ninguna de las tres cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idioma principal | Licencia | Notas |
|---|---|---|---|---|---|
| JoaoZaokk/kb-whisper-large-ggml | Familia Whisper large, valor no confirmado en la model card | GGML/GGUF (.bin) cuantizado q4_0/q5_0/q8_0 | Sueco (tag sv) | Apache 2.0 | Reempaquetado para whisper.cpp; 0 descargas; sin benchmarks publicados |
| KBLab/kb-whisper-large | Mismo modelo base (valor no confirmado) | Safetensors (checkpoint original) | Sueco | Apache 2.0 | Modelo de origen; requiere framework tipo Transformers para su ejecucion |
| openai/whisper-large-v3 | Aproximadamente 1550 millones | Safetensors y otros | Multilingue (cerca de 99 idiomas) | Apache 2.0 | Referencia generalista de la misma familia; no optimizado especificamente para sueco |
| Conversiones GGML de Whisper large para whisper.cpp (ecosistema ggerganov) | Aproximadamente 1550 millones | GGML/GGUF | Multilingue | Licencia del motor whisper.cpp: MIT (la de los pesos depende del checkpoint de origen) | Alternativa de formato equivalente, pero sin ajuste especifico al sueco |

La comparacion se limita a parametros de arquitectura, formato, idioma y licencia, ya que no hay cifras de rendimiento publicadas para este repositorio que permitan una comparacion cuantitativa de calidad de transcripcion.

## Limitaciones y advertencias

- Este repositorio no aporta ninguna mejora de calidad respecto a KBLab/kb-whisper-large: solo cambia el formato y reduce el tamano mediante cuantizacion, lo que en q4_0 y q5_0 puede introducir una perdida de precision frente a f16 que el autor no cuantifica.
- No hay benchmarks publicados, por lo que se desconoce la tasa de error (WER) real de cada cuantizacion en habla sueca.
- Discrepancia de idioma: el tag oficial y la model card declaran sueco (sv), pero el autor indica que verifico las conversiones transcribiendo muestras cortas en portugues e ingles. No se menciona ninguna validacion con audio en sueco, el idioma objetivo declarado del modelo base.
- Riesgo de alucinacion: como cualquier modelo Whisper, puede generar texto plausible en segmentos de silencio, ruido o audio musical, y puede repetir frases en bucle en grabaciones de baja calidad.
- Limitacion de contexto: la arquitectura Whisper procesa ventanas de 30 segundos, por lo que audios largos requieren segmentacion y unir los resultados; errores de segmentacion pueden degradar la coherencia del texto final.
- Limitacion de idioma: aunque el autor haya probado portugues e ingles, no hay garantia de un rendimiento aceptable fuera del sueco; el uso con otros idiomas deberia validarse antes de llevarlo a produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, siempre que se mantenga la atribucion a KBLab y el aviso de licencia. El autor pide citar explicitamente a los autores originales.
- El repositorio es de terceros y tiene 0 descargas y 0 likes, por lo que no ha pasado por una validacion amplia de la comunidad. La model card indica "no warranty" de forma explicita.
- La conversion f16 "sin perdida" mencionada en el texto no aparece en la tabla de ficheros ni parece estar incluida en el repositorio, por lo que quien necesite maxima fidelidad tendra que generar su propia conversion desde el checkpoint original.
- Los enlaces de descarga se mantienen con la finalidad de dar estabilidad a las aplicaciones Odysseus / Open WebUI; si el repositorio se elimina o su propietario cambia de criterio, esas integraciones podrian romperse.
- La fecha de creacion y actualizacion del repositorio aparece como 2026-09-13, posterior a la fecha habitual de consulta; conviene verificar la vigencia de los enlaces antes de usarlos en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/kb-whisper-large-ggml
- Modelo base: https://huggingface.co/KBLab/kb-whisper-large
- Perfil del autor del reempaquetado: https://huggingface.co/JoaoZaokk
- Motor de inferencia whisper.cpp: https://github.com/ggml-org/whisper.cpp

Nota: los resultados de la busqueda web proporcionados corresponden a paginas de evaluacion de competencias de LinkedIn y no guardan relacion con este modelo, por lo que se han descartado como fuentes.
