# cloudkites/pathopod-models

## Resumen

PathoPod speech pack es un paquete de modelos de reconocimiento automatico del habla (ASR) distribuido por CloudKites AI Lab como componente auxiliar de la aplicacion PathoPod. No se trata de un modelo de lenguaje generativo al uso, sino de un artefacto binario empaquetado en un unico fichero (`pathopod-asr.nbq`, 4,7 GB) que la aplicacion descarga en el primer uso de la funcion de dictado y ejecuta integramente en el dispositivo del usuario, sin enviar audio a servidores externos.

La model card publicada es extremadamente escueta: no declara arquitectura, numero de parametros, longitud de contexto, idiomas soportados, licencia ni resultados de benchmarks. El identificador del repositorio (`pathopod-models`) y la extension `.nbq` sugieren un formato propietario o empaquetado especifico de la aplicacion, no un formato estandar del ecosistema Hugging Face como safetensors o GGUF. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado en noviembre de 2026.

Su relevancia practica para desarrolladores e investigadores es limitada: se trata de un componente cerrado, atado a una aplicacion concreta y sin documentacion tecnica publica que permita evaluarlo, reproducirlo o reutilizarlo fuera de su contexto previsto. Resulta util unicamente como referencia si se esta auditando la aplicacion PathoPod o si se quiere entender como se distribuyen modelos ASR on-device en formato empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato propietario `.nbq`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.nbq` (formato propietario de la aplicacion PathoPod) |
| Tamano del artefacto | 4.709.955.425 bytes (4,7 GB) |
| SHA-256 | `eb5bf99058738bbe621c10e276a209c3ce83051edd200678c9aaf47b98b16550` |
| Uso previsto | exclusivamente con la aplicacion PathoPod |
| Procesamiento | on-device (el audio no sale del dispositivo) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer, un modelo convolucional, un sistema hibrido o una combinacion de encoder acustico y decoder, ni tampoco el numero de parametros, la composicion del dataset de entrenamiento, el numero de horas de audio utilizadas ni si se aplicaron tecnicas de ajuste fino supervisado, destilacion o cuantizacion.

El unico dato tecnico verificable es el tamano del artefacto (4,7 GB) y su hash SHA-256, que permite verificar la integridad de la descarga. La extension `.nbq` no corresponde a ningun formato abierto conocido del ecosistema (no es safetensors, GGUF, ONNX ni Core ML), por lo que se deduce un empaquetado propietario que solo el runtime de PathoPod sabe interpretar. No hay informacion sobre innovaciones tecnicas como decodificacion especulativa, atencion lineal o streaming incremental.

## Capacidades

- Reconocimiento automatico del haba (ASR) para la funcion de dictado de la aplicacion PathoPod.
- Ejecucion on-device: el audio se procesa localmente y no se transmite a servidores externos, segun declara el autor.
- Descarga bajo demanda en el primer uso de la funcionalidad de dictado.
- Verificacion de integridad mediante SHA-256 del fichero descargado.
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma, puntuacion automatica ni marcas de tiempo.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico (no aplica a un modelo ASR).
- No se documentan capacidades multilingues.

## Casos de uso

- Dictado por voz dentro de la aplicacion PathoPod: el paquete se descarga en el primer uso y permite transcribir voz a texto sin conexion, lo que resulta adecuado para entornos con conectividad limitada o requisitos de privacidad.
- Escenarios con requisitos estrictos de privacidad: al no salir el audio del dispositivo, encaja en flujos donde el contenido dictado es sensible (notas clinicas, datos personales) y no puede enviarse a un servicio en la nube.
- Uso en dispositivos moviles o de campo: el procesamiento local elimina la dependencia de red y la latencia de ida y vuelta a un servidor, siempre que el hardware del dispositivo soporte el runtime de PathoPod.
- Auditoria de la cadena de suministro de la aplicacion: el hash SHA-256 publicado permite verificar que el artefacto descargado coincide con el distribuido por CloudKites AI Lab.
- Referencia para integracion de ASR empaquetado: util para equipos que disenen sus propios packs de modelos on-device y quieran observar un ejemplo de distribucion con verificacion de integridad.
- No es adecuado para uso generico fuera de PathoPod: al ser un formato propietario sin API publica, no puede integrarse en pipelines propios de transcripcion, subtitulado o analisis de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER), latencia, throughput ni comparaciones con otros sistemas ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: no disponible. El artefacto ocupa 4,7 GB en disco, pero se desconoce el consumo en memoria en tiempo de ejecucion.
- GPU recomendadas: no disponible. Al ser un modelo on-device, es probable que se ejecute en CPU o en aceleradores integrados del dispositivo, pero no se especifica.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente mediante la aplicacion PathoPod. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros runtimes estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| PathoPod speech pack | no disponible | no disponible | no disponible | no disponible | `.nbq` propietario | solo app PathoPod |
| Whisper (OpenAI) | 39M a 1.550M | 30 s de audio | ~99 idiomas | MIT | safetensors, GGUF, ONNX | abierto en Hugging Face |
| Wav2Vec 2.0 (Meta) | 95M a 317M | no aplica (audio) | multilingue segun checkpoint | MIT / Apache 2.0 | safetensors, PyTorch | abierto en Hugging Face |
| Vosk / Kaldi | variable | no aplica | multilingue | Apache 2.0 | propietario por modelo | abierto |

La comparacion es estructural: los modelos alternativos son abiertos, documentados y desplegables en runtimes estandar, mientras que PathoPod speech pack es un artefacto cerrado sin especificaciones publicas.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se puede evaluar calidad, sesgos, cobertura idiomatica ni robustez sin ejecutar la aplicacion propietaria.
- Licencia no declarada: no hay certeza sobre si el uso comercial, la redistribucion o la ingenieria inversa estan permitidos. La model card indica "for use with the PathoPod app only", lo que sugiere restricciones de uso.
- Formato propietario `.nbq`: imposibilita la integracion en pipelines propios y ata el artefacto al runtime de la aplicacion.
- Riesgo de errores de transcripcion (alucinaciones ASR): sin benchmarks publicados no es posible cuantificar el WER ni conocer el comportamiento en acentos, ruido de fondo o vocabulario especializado.
- Idiomas desconocidos: no se declara que lenguas cubre el pack, por lo que no se puede asumir soporte del castellano.
- Dependencia de un unico proveedor: CloudKites AI Lab controla la distribucion y las actualizaciones; no hay repositorio espejo ni comunidad que garantice mantenimiento.
- Cero adopcion publica (0 descargas, 0 likes): no hay senales de uso real ni de validacion por terceros.
- Contacto indicado (`contact@cloudkites.com`) como unico canal de soporte; no hay issues publicas ni foro.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cloudkites/pathopod-models
- Contacto del autor: contact@cloudkites.com
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.
