# JoaoZaokk/EraX-WoW-Turbo-V1.1-ggml

## Resumen

EraX-WoW-Turbo-V1.1-ggml es una reconversion de pesos, no un modelo entrenado desde cero. Se trata de la version cuantizada en formato GGML del checkpoint erax-ai/EraX-WoW-Turbo-V1.1 (un modelo de la familia Whisper) realizada por el usuario JoaoZaokk para poder ejecutarlo con whisper.cpp y con cualquier aplicacion que embeba dicho motor. El repositorio solo reempaqueta los pesos originales: no hay fine-tuning adicional ni cambios en el grafo mas alla de la conversion y la cuantizacion.

El problema que resuelve es de despliegue: los checkpoints en safetensors de Whisper no se pueden cargar directamente en whisper.cpp, y las aplicaciones nativas de escritorio o moviles que usan dicho motor necesitan ficheros GGML estables. Este repositorio publica tres variantes (q4_0, q5_0 y q8_0) con tamanos de 474 MB, 574 MB y 874 MB respectivamente, pensadas para telefonos (q4/q5) y equipos de escritorio o Mac (q8), segun indica la propia model card.

La relevancia es por tanto practica y limitada: facilita la inferencia local de reconocimiento automatico de voz sin GPU y sin conexion, bajo licencia MIT. Ahora bien, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su validacion se limita a transcripciones cortas en portugues e ingles, por lo que su madurez y su calidad final no estan contrastadas por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia Whisper (detalles de la variante concreta no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible con precision; la arquitectura Whisper procesa el audio en ventanas de 30 segundos por pasada |
| Tipos de cuantizacion | q8_0, q5_0, q4_0 (la model card menciona f16 sin perdida, pero no se publica en el repositorio) |
| Idiomas soportados | el metadata declara unicamente vi (vietnamita); la model card indica validacion con muestras en portugues e ingles; el alcance multilingue real no esta confirmado |
| Licencia | MIT (heredada del modelo base, sin cambios) |
| Formato de pesos | GGML en ficheros .bin para whisper.cpp; el repositorio usa tambien las etiquetas gguf |

Ficheros publicados:

| Fichero | Cuantizacion | Tamano |
|---|---|---|
| ggml-EraX-WoW-Turbo-V1.1-q8_0.bin | q8_0 | 874 MB |
| ggml-EraX-WoW-Turbo-V1.1-q5_0.bin | q5_0 | 574 MB |
| ggml-EraX-WoW-Turbo-V1.1-q4_0.bin | q4_0 | 474 MB |

Tamano total del repositorio: 1,9 GB.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer de tipo encoder-decoder que recibe espectrogramas Mel y genera tokens de texto, con capacidad de transcripcion multilingue y de traduccion al ingles. El checkpoint de origen es erax-ai/EraX-WoW-Turbo-V1.1, descrito en la model card como un checkpoint Whisper. El sufijo "Turbo" apunta a la familia de variantes reducidas de Whisper, pero la informacion proporcionada no documenta el numero exacto de parametros, la profundidad del decoder ni la configuracion de cabezas de atencion de esta variante concreta.

Sobre el entrenamiento no hay datos en la informacion disponible: se desconoce el volumen de horas de audio, la composicion del dataset, si hubo ajuste supervisado adicional, RLHF o DPO, y en que idiomas se entreno el modelo base. Lo unico verificable es el procedimiento de este repositorio: conversion desde el checkpoint original con el convertidor propio de whisper.cpp y posterior cuantizacion con el cuantizador del mismo motor. Cada variante se comprobo transcribiendo muestras cortas en portugues e ingles antes de subirlas, segun la model card. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, destilacion) mas alla de la propia cuantizacion.

## Capacidades

- Reconocimiento automatico de voz (ASR): transcripcion de audio a texto mediante whisper.cpp con `whisper-cli -m <fichero>` o cualquier aplicacion que embeba el motor.
- Inferencia local y on-device: al ser GGML cuantizado, funciona en CPU sin necesidad de GPU ni de conexion a red.
- Traduccion: la familia Whisper soporta traduccion de audio a ingles, aunque la model card no confirma explicitamente esta capacidad en esta conversion.
- Deteccion de idioma: heredada de la arquitectura Whisper; no verificada en este repositorio.
- Marcas de tiempo por segmento: disponibles a traves de las opciones de whisper.cpp (no documentadas especificamente para esta conversion).
- Integracion con aplicaciones nativas: el autor mantiene el repositorio para dar enlaces de descarga estables a las aplicaciones Odysseus y Open WebUI.
- Tool calling / function calling: no aplica, es un modelo de voz, no un modelo de lenguaje conversacional.
- Capacidades de agente o razonamiento multi-paso: no aplica.
- Capacidades multilingues, vision o audio mas alla del ASR: no disponibles ni confirmadas.

## Casos de uso

- Transcripcion local de reuniones y notas de voz: el modelo puede convertir grabaciones en texto sin enviar audio a la nube, usando la variante q8_0 en un portatil o sobremesa con whisper.cpp, lo que resulta adecuado en entornos con requisitos de confidencialidad.
- Dictado en aplicaciones de escritorio: integrado en apps que embeben whisper.cpp, permite convertir voz a texto en tiempo casi real en CPU, con la variante q5_0 o q4_0 si el equipo tiene poca memoria.
- Subtitulado de video con marcas de tiempo: whisper.cpp expone segmentos con tiempos, de modo que puede alimentar un pipeline de generacion de subtitulos .srt para contenido en portugues o ingles, los dos idiomas sobre los que el autor valido la conversion.
- Aplicaciones moviles offline: con q4_0 (474 MB) el modelo cabe en el almacenamiento y en la memoria de un telefono de gama media, lo que habilita transcripcion en dispositivos sin conectividad.
- Preprocesado de audio para pipelines de datos: transcripcion por lotes de archivos de audio para construir datasets de texto o indexar contenido hablado en un buscador interno.
- Despliegue en hardware de bajo consumo: al no requerir GPU, puede ejecutarse en mini-PC, Raspberry Pi o portatiles antiguos, lo que reduce costes frente a servicios de ASR en la nube.
- Asistencia a la accesibilidad: generacion de transcripciones en vivo para personas con discapacidad auditiva en aplicaciones de escritorio, siempre que la latencia de decodificacion resulte aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion mencionada en la model card es cualitativa: transcripcion de muestras cortas en portugues e ingles para cada variante cuantizada antes de subirlas al repositorio. No hay cifras de WER, de velocidad de decodificacion ni comparaciones con otros checkpoints.

## Requisitos de hardware

- q4_0 (474 MB): ejecutable en telefonos de gama media, Raspberry Pi y equipos con 2 GB de RAM libre o mas. Cabe en cualquier GPU consumer con mas de 2 GB de VRAM, aunque no es necesaria.
- q5_0 (574 MB): opcion recomendada por el autor para telefonos; requiere aproximadamente 1 GB de RAM libre.
- q8_0 (874 MB): opcion indicada por el autor para Mac; requiere aproximadamente 1,5 GB de RAM libre y precision practicamente identica a la del modelo sin cuantizar segun la model card.
- VRAM estimada: no hay cifras publicadas. Como referencia de orden de magnitud, cada variante necesita al menos el tamano del fichero mas la memoria de trabajo del contexto y del espectrograma Mel, pero no se dispone de mediciones concretas.
- GPU recomendadas: no disponibles. El modelo esta disenado para inferencia en CPU mediante whisper.cpp; no se documenta el uso con CUDA, Metal ni Vulkan, aunque whisper.cpp ofrece backends para varias de estas APIs.
- Opciones de despliegue: whisper.cpp (motor de referencia, `whisper-cli -m <fichero>`), y cualquier aplicacion que embeba whisper.cpp, incluidas las apps nativas Odysseus y Open WebUI mencionadas por el autor. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp, que no son motores de ASR.
- Latencia y throughput: no disponibles. Dependen del hardware, de la variante de cuantizacion y de la duracion del audio.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo que permitan una comparacion cuantitativa. La comparacion siguiente es estructural y se apoya en caracteristicas de repositorios equivalentes de la comunidad; los valores marcados como no disponibles no aparecen en la informacion proporcionada.

| Modelo | Naturaleza | Cuantizaciones | Idiomas declarados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EraX-WoW-Turbo-V1.1-ggml (este) | Conversion GGML de un checkpoint Whisper | q4_0, q5_0, q8_0 | vi en el metadata; validado en portugues e ingles | MIT | 0 descargas, 0 likes |
| Conversiones GGML oficiales de whisper.cpp (openai/whisper-large-v3-turbo y similares) | Conversion GGML de checkpoints Whisper de OpenAI | multiples (q5_0, q8_0, etc.) | multilingue | MIT | ampliamente descargadas y mantenidas |
| Distil-Whisper (variantes destiladas de Whisper) en GGML | Conversiones de modelos destilados, mas rapidos y algo menos precisos | multiples | mayoritariamente ingles | MIT | ampliamente descargadas |
| Modelos ASR propietarios en la nube | Servicios gestionados | no aplica | amplio | propietaria | de pago, requieren conexion |

Parametros, contexto y resultados de benchmarks de los modelos comparados: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: es un reempaquetado de pesos. Cualquier limitacion del checkpoint erax-ai/EraX-WoW-Turbo-V1.1 se hereda sin cambios, y este repositorio no la mitiga.
- Discrepancia de idioma: el metadata declara unicamente vietnamita (vi), mientras que la model card afirma haber validado la conversion con muestras en portugues e ingles. Esta contradiccion no se resuelve en la informacion disponible y conviene verificar el comportamiento real antes de usarlo en produccion.
- Riesgo de alucinacion: los modelos de la familia Whisper tienden a generar texto plausible en silencios, ruido o audio ininteligible. No se documenta ningun mecanismo de mitigacion en esta conversion.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; la comprobacion del autor se limita a muestras cortas y no hay evaluacion de WER ni pruebas con audio largo, ruidoso o con acentos diversos.
- Cobertura de idiomas no confirmada: no hay evidencia de que mantenga el comportamiento multilingue del Whisper original tras la cuantizacion, ni de que el modelo base haya sido entrenado o ajustado para espanol.
- Cuantizacion agresiva: q4_0 y q5_0 reducen el tamano a costa de cierta perdida de precision, admitida por el propio autor; para produccion con requisitos estrictos de exactitud conviene usar q8_0.
- Sin diarizacion de hablantes, sin deteccion de emociones y sin salida estructurada: el modelo solo devuelve texto y, opcionalmente, marcas de tiempo.
- Procesamiento por ventanas: el audio se procesa en fragmentos de 30 segundos, de modo que audios largos requieren segmentacion y pueden sufrir errores en las fronteras.
- Licencia MIT: permite uso comercial y modificacion, pero exige conservar el aviso de copyright y la atribucion a los autores originales (erax-ai). El autor del repositorio no ofrece ninguna garantia.
- Estabilidad de los enlaces: el repositorio se mantiene para que las URLs de descarga de unas aplicaciones concretas no cambien, lo que implica un compromiso de mantenimiento personal, no institucional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/EraX-WoW-Turbo-V1.1-ggml
- Modelo base: https://huggingface.co/erax-ai/EraX-WoW-Turbo-V1.1
- Perfil del autor de la conversion: https://huggingface.co/JoaoZaokk
- Motor de inferencia whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo. Las referencias devueltas corresponden a un fabricante japones de intercambiadores de calor, a una noticia politica brasilena y a un portal financiero italiano, sin relacion alguna con el modelo.
