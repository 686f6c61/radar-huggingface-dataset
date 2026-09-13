# JoaoZaokk/Belle-whisper-large-v3-turbo-zh-ggml

## Resumen

Belle-whisper-large-v3-turbo-zh-ggml es una conversion al formato GGML del checkpoint BELLE-2/Belle-whisper-large-v3-turbo-zh, un modelo de reconocimiento automatico del habla (ASR) afinado para chino. La conversion la mantiene el usuario JoaoZaokk y su unico proposito es reempaquetar los pesos originales para que puedan cargarse con whisper.cpp, el motor de inferencia de la familia ggml. No se trata, por tanto, de un modelo nuevo, sino de una distribucion de pesos derivada: la licencia apache-2.0 y la autoria del modelo subyacente se mantienen intactas.

El repositorio ofrece cuatro variantes de cuantizacion con tamanos muy distintos: f16 sin perdida (1625 MB), q8_0 (874 MB), q5_0 (574 MB) y q4_0 (474 MB). Esa horquilla permite ejecutar el modelo desde un telefono o una Raspberry Pi hasta un portatil convencional, siempre en CPU o con aceleracion parcial, sin necesidad de GPU dedicada. El modelo base pertenece a la familia Whisper large-v3-turbo, una arquitectura encoder-decoder transformer orientada a transcripcion, aqui especializada en chino.

La relevancia actual del repo es practica: los autores indican que la conversion se aloja para mantener estables los enlaces de descarga que consumen las aplicaciones nativas Odysseus y Open WebUI. Con cero descargas y cero likes en el momento de redactar esta ficha, se trata de un artefacto de infraestructura mas que de un lanzamiento de investigacion, y conviene evaluarlo como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (familia Whisper large-v3-turbo); no detallada en la ficha del autor |
| Parametros totales | No disponible en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; Whisper trabaja por ventanas de audio de 30 segundos de forma estandar |
| Tipos de cuantizacion | f16 (sin perdida), q8_0, q5_0, q4_0 |
| Idiomas soportados | Chino (zh) segun los metadatos; el autor menciona verificaciones puntuales con muestras cortas en portugues e ingles |
| Licencia | Apache 2.0 (heredada del modelo base, sin cambios) |
| Formato de pesos | GGML (.bin), etiquetado tambien como GGUF en los tags |
| Tamano del repositorio | 3,5 GB (suma de las cuatro variantes) |
| Motor de inferencia | whisper.cpp (`whisper-cli -m <fichero>`) |
| Tarea declarada | automatic-speech-recognition |
| Modelo base | BELLE-2/Belle-whisper-large-v3-turbo-zh |
| Fecha de creacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

Ficheros incluidos:

| Fichero | Cuantizacion | Tamano |
|---|---|---|
| ggml-belle-whisper-large-v3-turbo-zh-f16.bin | f16 | 1625 MB |
| ggml-belle-whisper-large-v3-turbo-zh-q8_0.bin | q8_0 | 874 MB |
| ggml-belle-whisper-large-v3-turbo-zh-q5_0.bin | q5_0 | 574 MB |
| ggml-belle-whisper-large-v3-turbo-zh-q4_0.bin | q4_0 | 474 MB |

## Arquitectura y entrenamiento

El modelo subyacente es un checkpoint de la familia Whisper, es decir, un transformer con encoder y decoder entrenado para transcripcion de audio, y la variante turbo reduce el numero de capas del decoder respecto a large-v3 a cambio de una latencia notablemente menor. Sobre esa base, BELLE-2 realizo un ajuste especifico para chino que da lugar a Belle-whisper-large-v3-turbo-zh. La ficha de esta conversion no reproduce ningun detalle sobre el dataset, el numero de tokens de audio ni el procedimiento de ajuste del modelo original, por lo que esos datos deben consultarse en la model card de BELLE-2 y no aqui.

Lo unico documentado en este repositorio es el proceso de conversion: los pesos se transformaron desde el checkpoint original con el conversor propio de whisper.cpp y despues se cuantizaron con su cuantizador. El autor indica que cada variante se verifico transcribiendo muestras cortas en portugues e ingles antes de subirlas. No se menciona decodificacion especulativa, atencion lineal ni ninguna otra innovacion tecnica anadida: es una conversion mecanica de pesos, no un entrenamiento nuevo.

## Capacidades

- Transcripcion de voz a texto en chino, con la calidad heredada del ajuste de BELLE-2 sobre Whisper large-v3-turbo.
- Inferencia en dispositivo (on-device) sin conexion a red, ejecutada por whisper.cpp sobre CPU.
- Cuatro perfiles de precision/tamano intercambiables, lo que permite ajustar el compromiso entre exactitud y consumo de memoria.
- Integracion mediante linea de comandos (`whisper-cli -m <fichero>`) o embebida en cualquier aplicacion que enlace whisper.cpp.
- Compatibilidad con las aplicaciones nativas Odysseus y Open WebUI, segun declara el autor del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de salida ni modo de razonamiento; son capacidades ajenas al proposito del modelo.
- Capacidad multilingue: no certificada en esta ficha. El autor solo menciona pruebas puntuales en portugues e ingles y los metadatos declaran unicamente chino.

## Casos de uso

- Transcripcion de reuniones y notas de voz en chino: el modelo convierte audio en texto en local, sin enviar datos a servicios externos, lo que resulta adecuado para contenido confidencial.
- Subtitulado de video en chino: dado que whisper.cpp expone marcas temporales por segmento, la salida puede transformarse en subtitulos para plataformas o archivos locales.
- Dictado en movilidad: la variante q5_0 (574 MB) o q4_0 (474 MB) es suficientemente pequena para ejecutarse en un telefono o en una Raspberry Pi, habilitando dictado sin conexion.
- Asistentes de voz integrados en aplicaciones de escritorio: al cargarse como libreria de whisper.cpp, el modelo puede embeberse en una app sin dependencias de nube ni claves de API.
- Preprocesado de audio para pipelines de datos: transcripcion masiva por lotes con la variante f16 en CPU multinucleo, para construir corpus de texto a partir de archivos de audio en chino.
- Accesibilidad para personas con dificultades auditivas: conversion en tiempo real de conversaciones presenciales a texto en pantalla, usando la variante mas ligera para minimizar la latencia de arranque.
- Archivado y busqueda de grabaciones: transcripcion de un repositorio historico de audio en chino para permitir busqueda por texto completo en el contenido hablado.
- Integracion en Open WebUI u Odysseus: el propio autor declara que el repositorio existe para dar soporte estable de descarga a estas aplicaciones nativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER, MMLU ni ninguna otra metrica, y tampoco ofrece cifras de latencia o throughput. Tampoco se han recuperado resultados de benchmarks en los resultados de busqueda web, que no contienen material relevante sobre el modelo.

## Requisitos de hardware

Las cifras de memoria que siguen son estimaciones derivadas del tamano de cada fichero mas el sobrecoste habitual del runtime; la ficha del autor no publica requisitos oficiales.

- f16 (1625 MB): aproximadamente 2 GB de RAM o VRAM libres. Cabe en cualquier GPU de consumo con 4 GB o mas (GTX 1650, RTX 3050) y en CPU con holgura.
- q8_0 (874 MB): aproximadamente 1-1,2 GB de RAM. Cabe en GPU integradas y en mini-PC; es la variante recomendada cuando se busca una exactitud casi identica a f16.
- q5_0 (574 MB): aproximadamente 700-900 MB de RAM. Apta para telefonos de gama media y placas tipo Raspberry Pi 4/5.
- q4_0 (474 MB): aproximadamente 600-800 MB de RAM. Es la variante mas ligera, pensada para dispositivos con memoria muy limitada, a costa de una pequena perdida de exactitud.
- GPU recomendadas: no aplica ninguna en concreto; whisper.cpp esta optimizado para CPU y admite aceleracion parcial mediante backends opcionales. Cualquier GPU con 2 GB o mas puede alojar la variante q8_0 o inferior.
- Cabe en GPU de consumo: si, en todas las variantes. Ninguna necesita mas de 2 GB, por lo que el modelo entra incluso en iGPU.
- Opciones de despliegue: whisper.cpp (whisper-cli o enlace como libreria). vLLM y TGI no son aplicables a este formato. Faster-Whisper y WhisperX usan CTranslate2, un formato distinto, por lo que requeririan reconvertir los pesos. Ollama no soporta este formato para ASR.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa. La tabla siguiente recoge unicamente caracteristicas verificables de alternativas del mismo ambito.

| Modelo | Formato | Tamano | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Belle-whisper-large-v3-turbo-zh-ggml (este) | GGML (.bin) | 474-1625 MB segun cuantizacion | Chino (declarado) | Apache 2.0 | Conversion no oficial mantenida por JoaoZaokk |
| BELLE-2/Belle-whisper-large-v3-turbo-zh | safetensors (checkpoint original) | No disponible | Chino | Apache 2.0 | Modelo de origen del que deriva esta conversion |
| openai/whisper-large-v3-turbo | safetensors y variantes GGML | No disponible en la informacion proporcionada | Multilingue | Apache 2.0 con condiciones de uso de OpenAI | Version sin ajuste especifico para chino; referencia de la familia |
| Conversiones GGML de Whisper en el repositorio de whisper.cpp | GGML | No disponible | Multilingue | MIT (codigo) / Apache 2.0 (pesos) | Alternativa oficial de facto para el mismo motor |

## Limitaciones y advertencias

- Repositorio no oficial: la conversion la mantiene un usuario individual, no BELLE-2 ni el equipo de whisper.cpp. No hay garantia alguna, tal y como declara el propio autor.
- Sin traccion comunitaria: 0 descargas y 0 likes en el momento de la ficha, por lo que el artefacto no ha sido validado por terceros.
- Metadatos contradictorios en idiomas: los tags declaran solo chino, mientras que el autor afirma haber verificado las variantes con muestras en portugues e ingles. No hay datos publicados sobre el rendimiento real en idiomas distintos del chino.
- Perdida de exactitud por cuantizacion: q4_0 y q5_0 reducen el tamano de forma agresiva y, segun el propio autor, q4_* implica un coste de precision. Para produccion con requisitos estrictos conviene usar f16 o q8_0.
- Alucinaciones tipicas de la familia Whisper: en grabaciones con ruido, silencios largos o audio musical es frecuente que el modelo genere texto repetido o inventado. Debe implementarse deteccion de repeticiones y filtrado de segmentos de baja confianza.
- Ventana de audio limitada: Whisper procesa segmentos de 30 segundos, por lo que audios largos requieren segmentacion y pueden sufrir perdidas en las fronteras entre segmentos.
- Punto de fecha inconsistente: los metadatos indican creacion en 2026-09-12, fecha posterior a la actual en la mayoria de contextos de evaluacion, lo que sugiere una etiqueta temporal poco fiable.
- Licencia: Apache 2.0 heredada, sin restricciones adicionales declaradas para uso comercial. Al ser obra derivada, se deben mantener la atribucion y la cita a los autores originales de BELLE-2 y de Whisper.
- Sin soporte de funcionalidades modernas: no hay tool calling, agentes, vision ni modo de razonamiento; es exclusivamente un motor de transcripcion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/Belle-whisper-large-v3-turbo-zh-ggml
- Modelo base: https://huggingface.co/BELLE-2/Belle-whisper-large-v3-turbo-zh
- Perfil del autor de la conversion: https://huggingface.co/JoaoZaokk
- Motor de inferencia whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Modelo base de la familia: https://huggingface.co/openai/whisper-large-v3-turbo
- Resultados de busqueda web: no se ha recuperado ningun enlace relevante sobre este modelo; los unicos resultados devueltos corresponden a foros de videojuegos y no guardan relacion con la ficha.
