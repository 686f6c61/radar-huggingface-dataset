# JoaoZaokk/whisper-hu-large-v3-turbo-finetuned-ggml

## Resumen

whisper-hu-large-v3-turbo-finetuned-ggml es una conversion al formato GGML/GGUF del checkpoint sarpba/whisper-hu-large-v3-turbo-finetuned, un ajuste fino de Whisper large-v3-turbo especializado en hungaro. El autor, JoaoZaokk, no entrena un modelo nuevo: reempaqueta los pesos en tres niveles de cuantizacion (q4_0, q5_0 y q8_0) para que puedan cargarse con whisper.cpp en dispositivos locales, incluidos telefonos y ordenadores con Apple Silicon, sin GPU dedicada.

El problema que resuelve es de despliegue: el checkpoint original esta en safetensors y no es directamente consumible por el motor whisper.cpp. Esta conversion aporta ficheros `.bin` listos para `whisper-cli -m <file>` o para cualquier aplicacion que embeba whisper.cpp, con tamanos de 474 MB (q4_0), 574 MB (q5_0) y 874 MB (q8_0), lo que permite transcripcion de voz en local para hungaro en hardware modesto.

Es relevante porque cubre un nicho concreto (ASR en hungaro) sobre una arquitectura muy extendida, con licencia MIT heredada del modelo base y sin dependencia de servicios en la nube. La ficha se limita a lo declarado en la model card: no se han publicado parametros, contexto, datasets de entrenamiento ni benchmarks especificos para este reempaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | encoder-decoder transformer (Whisper large-v3-turbo); no se detalla en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa audio en ventanas de 30 s) |
| Tipos de cuantizacion | q4_0, q5_0, q8_0 (tambien se menciona f16 como conversion sin perdida y q5_k) |
| Idiomas soportados | hungaro (hu) |
| Licencia | MIT |
| Formato de pesos | GGML / GGUF (ficheros `.bin` para whisper.cpp) |

Detalle de ficheros disponibles:

| Fichero | Cuantizacion | Tamano |
|---|---|---|
| `ggml-whisper-hu-large-v3-turbo-finetuned-q8_0.bin` | q8_0 | 874 MB |
| `ggml-whisper-hu-large-v3-turbo-finetuned-q5_0.bin` | q5_0 | 574 MB |
| `ggml-whisper-hu-large-v3-turbo-finetuned-q4_0.bin` | q4_0 | 474 MB |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Whisper large-v3-turbo, por lo que mantiene la arquitectura encoder-decoder transformer propia de la familia Whisper, con procesamiento de audio en ventanas de 30 segundos. La model card de esta conversion no aporta detalles sobre el numero de tokens, la composicion del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO; esa informacion corresponderia al repositorio original de sarpba, que no se ha incluido en los datos proporcionados.

La aportacion de este repositorio es puramente de ingenieria de conversion: los pesos se transformaron desde el checkpoint original con el conversor propio de whisper.cpp y despues se cuantizaron con su cuantizador. Segun el autor, cada variante se verifico transcribiendo muestras cortas en portugues e ingles antes de subirlas, y el repositorio se mantiene para que los enlaces de descarga usados por las aplicaciones nativas Odysseus / Open WebUI permanezcan estables. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal ni similares).

## Capacidades

- Reconocimiento automatico de voz (ASR) en hungaro, tarea declarada en el pipeline `automatic-speech-recognition`.
- Transcripcion en local sin conexion a Internet, al estar empaquetado para whisper.cpp.
- Ejecucion en telefonos (cuantizaciones q4/q5) y en Macs (q8), segun las recomendaciones del autor.
- Compatibilidad con aplicaciones que embeben whisper.cpp (por ejemplo Odysseus / Open WebUI).
- No se declaran capacidades de traduccion, diarizacion, tool calling, agentes ni modos de razonamiento.
- Capacidades multilingues: la etiqueta de idioma es unicamente `hu`; no se declara soporte para otros idiomas, aunque el autor verifico muestras en portugues e ingles durante la conversion.

## Casos de uso

- Transcripcion de reuniones en hungaro en local: con la variante q8_0 (874 MB) se puede procesar audio sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Subtitulado de contenido audiovisual hungaro: el modelo genera transcripciones que se pueden alinear posteriormente con marcas de tiempo para subtitulos.
- Dictado en aplicaciones de escritorio: integracion mediante whisper.cpp en herramientas de productividad para escritura por voz en hungaro.
- Asistentes de voz embebidos en telefonos: la variante q4_0 (474 MB) o q5_0 (574 MB) permite ejecucion on-device en moviles con recursos limitados.
- Accesibilidad para personas con discapacidad auditiva: conversion de audio a texto en hungaro en tiempo casi real sobre hardware sin GPU.
- Analitica de llamadas y atencion al cliente: transcripcion por lotes de grabaciones en hungaro para busqueda y clasificacion posterior.
- Investigacion en ASR hungaro: uso como linea base cuantizada para comparar calidad entre niveles q4_0, q5_0 y q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, MMLU ni ninguna otra metrica, y los resultados de la busqueda web no contienen datos tecnicos utilizables (los enlaces recuperados son irrelevantes y no guardan relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los tamanos de fichero (474 MB, 574 MB y 874 MB) dan una cota inferior del espacio en disco y de la memoria necesaria en CPU.
- GPU recomendadas: no disponibles; whisper.cpp puede acelerarse con backends Metal, CUDA o Vulkan, pero el autor no especifica modelos de GPU.
- Compatibilidad con GPU de consumo: el autor indica que las variantes q4_0 y q5_0 estan pensadas para telefonos y q8_0 para Macs, lo que implica viabilidad en hardware de consumo.
- Opciones de despliegue: whisper.cpp (`whisper-cli -m <file>`) y cualquier aplicacion que embeba ese motor; no se mencionan vLLM, TGI, Ollama ni llama.cpp para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-hu-large-v3-turbo-finetuned-ggml (este) | Reempaquetado GGML para whisper.cpp | hu | q4_0, q5_0, q8_0, f16, q5_k | MIT | HuggingFace, 0 descargas, 0 likes |
| sarpba/whisper-hu-large-v3-turbo-finetuned | Checkpoint original (safetensors) | hu | no aplica | MIT (heredada) | HuggingFace (base de este repo) |
| Whisper large-v3-turbo original | Modelo ASR multilingue | multiple | formatos propios de OpenAI | MIT | Repositorio original de OpenAI / HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso ni validacion por parte de la comunidad.
- El modelo base esta ajustado especificamente para hungaro; el rendimiento en otros idiomas no esta garantizado pese a las pruebas puntuales en portugues e ingles.
- No se publican metricas de calidad (WER u otras), de modo que la perdida de precision por cuantizacion (especialmente en q4_0) no esta cuantificada.
- La model card advierte explicitamente de que se ofrece sin garantia ("No warranty").
- La licencia es MIT, lo que permite uso comercial, pero el autor recuerda que los pesos son obras derivadas del modelo original y hay que citar a los autores originales (sarpba).
- El autor no documenta sesgos ni riesgos de alucinacion especificos; al tratarse de un sistema ASR, los errores tipicos serian sustituciones o inventos de palabras en audio de baja calidad.
- Los resultados de la busqueda web proporcionados no contienen informacion tecnica relevante y no deben usarse como fuente de datos del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/whisper-hu-large-v3-turbo-finetuned-ggml
- Modelo base: https://huggingface.co/sarpba/whisper-hu-large-v3-turbo-finetuned
- Perfil del autor: https://huggingface.co/JoaoZaokk
- Motor whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Nota: los enlaces devueltos por la busqueda web no estan relacionados con el modelo y se han descartado por no aportar informacion tecnica util.
