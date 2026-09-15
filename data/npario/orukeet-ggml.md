# npario/orukeet-ggml

## Resumen

Orukeet-ggml es una conversion al formato GGML del checkpoint oruk/orukeet, un ajuste fino de NVIDIA Parakeet TDT 0.6B v3 orientado a reconocimiento automatico del habla (ASR). El repositorio no entrena ningun modelo nuevo: reempaqueta los pesos originales en cuatro variantes cuantizadas para que puedan cargarse con el motor Parakeet TDT que se distribuye dentro de whisper.cpp a partir de la version 1.9, mediante el binario `parakeet-cli -m <fichero>`.

La relevancia de esta publicacion es practica: elimina la dependencia del formato propietario `.nemo` y permite ejecutar un modelo ASR de aproximadamente 600 millones de parametros en CPU, moviles y GPUs de gama baja, con tamanos que van de 356 MB (q4_0) a 1256 MB (f16). El autor mantiene la licencia original cc-by-sa-4.0 y declara que la conversion esta sostenida por JoaoZaokk para que los enlaces de descarga usados por las aplicaciones nativas Odysseus y Open WebUI se mantengan estables.

El repositorio tiene un tamano de 2.7 GB, no registra descargas ni likes en el momento de la consulta y fue creado el 15 de septiembre de 2026 segun los metadatos de HuggingFace. La model card no incluye resultados de evaluacion, lista de idiomas soportados ni detalles del proceso de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet TDT (transducer con prediccion de duracion), heredada del modelo base oruk/orukeet; encoder tipo FastConformer segun la familia Parakeet. No se detalla en la model card |
| Parametros totales | Aproximadamente 600 millones (deducido de "Parakeet TDT 0.6B v3" citado en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; es un modelo ASR que procesa audio por fragmentos, no texto con ventana de contexto |
| Tipos de cuantizacion | f16 (1256 MB), q8_0 (669 MB), q5_0 (434 MB), q4_0 (356 MB) |
| Idiomas soportados | No disponible una lista oficial. El autor indica que valido las variantes transcribiendo muestras cortas en portugues e ingles |
| Licencia | cc-by-sa-4.0 (sin cambios respecto al modelo original) |
| Formato de pesos | GGML/GGUF (ficheros `.bin`) cargables con whisper.cpp >= 1.9 mediante `parakeet-cli` |

## Arquitectura y entrenamiento

Este repositorio no contiene entrenamiento propio. Los pesos son un derivado del checkpoint oruk/orukeet, descrito en la model card como un ajuste fino de NVIDIA Parakeet TDT 0.6B v3. La arquitectura, por tanto, es la de la familia Parakeet TDT: un transducer con prediccion de duracion sobre encoder convolucional-autoattentivo, disenado especificamente para transcripcion de voz. La model card no documenta el numero de tokens de audio usados en el ajuste fino, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO, algo poco habitual en modelos ASR.

La innovacion tecnica de esta publicacion esta en el pipeline de conversion, no en el modelo. Los pesos se convirtieron desde el checkpoint original con el convertidor propio del motor y despues se cuantizaron con su cuantizador, generando cuatro variantes. Segun el autor, f16 es la conversion sin perdida, q8_0 mantiene una precision casi identica con aproximadamente el 55 % del tamano, q5_0 es la opcion recomendada para telefonos y q4_0 es la mas pequena a costa de una ligera perdida de precision. Cada variante se verifico transcribiendo muestras cortas en portugues e ingles antes de subirse. Un detalle importante de compatibilidad: estos ficheros no son intercambiables con los GGUF de mudler/parakeet.cpp, solo funcionan con el motor Parakeet embebido en whisper.cpp.

## Capacidades

- Reconocimiento automatico del habla (ASR) en formato de transcripcion de audio a texto.
- Ejecucion totalmente local y on-device, sin necesidad de conexion a servicios en la nube.
- Cuatro niveles de cuantizacion que permiten ajustar el equilibrio entre precision, tamano y consumo de memoria.
- Funcionamiento en CPU sin GPU dedicada, gracias al backend GGML.
- Transcripcion de muestras en portugues e ingles segun la validacion del autor; no se documentan mas idiomas.
- Integracion con el ecosistema whisper.cpp mediante el binario `parakeet-cli`.
- Uso previsto en las aplicaciones nativas Odysseus y Open WebUI, que consumen estos enlaces de descarga.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido, ya que es un modelo puramente ASR.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles: con la variante q5_0 (434 MB) o q4_0 (356 MB), el modelo cabe en el almacenamiento y la memoria de un telefono actual y permite dictado y transcripcion sin enviar audio a un servidor.
- Subtitulado automatico de video en local: dado que la inferencia es puramente local y no tiene coste por minuto, se puede procesar un catalogo completo de video generando pistas de subtitulos en portugues o ingles sin depender de APIs externas.
- Accesibilidad para personas con discapacidad auditiva: transcripcion en tiempo real de conversaciones presenciales ejecutada en un portatil o en un dispositivo embebido, sin latencia de red ni requisitos de privacidad adicionales.
- Actas y resumenes de reuniones: el audio se transcribe con el modelo y el texto resultante se envia despues a un LLM para generar el acta; la separacion de tareas permite usar hardware modesto para la fase de ASR.
- Dictado en aplicaciones de escritorio: integracion mediante whisper.cpp en editores, terminales o herramientas de toma de notas, con la variante f16 si se prioriza la precision sobre el tamano.
- Analisis de llamadas de atencion al cliente: transcripcion por lotes de grabaciones en portugues e ingles para alimentar sistemas de analitica y control de calidad, con el modelo desplegado en el mismo servidor que el resto del pipeline.
- Generacion de datasets de voz para entrenamiento: al ser un paquete de pesos abiertos con licencia cc-by-sa-4.0, se puede usar para etiquetar o pseudo-etiquetar grandes volumenes de audio y construir corpus de ASR.
- Despliegue en dispositivos de borde: con q4_0 (356 MB) el modelo puede ejecutarse en hardware tipo Raspberry Pi o mini-PC sin GPU, cubriendo escenarios de transcripcion industrial o de campo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de WER (word error rate), ni comparaciones numericas con otros sistemas ASR, ni metricas de latencia o throughput. La unica referencia de calidad es la afirmacion del autor de que cada variante se comprobo transcribiendo muestras cortas en portugues e ingles.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1256 MB en f16, 669 MB en q8_0, 434 MB en q5_0 y 356 MB en q4_0, solo para los pesos; hay que sumar el coste del runtime y del buffer de audio.
- GPU recomendadas: cualquier GPU con mas de 2 GB de memoria es suficiente. No se necesita una A100 ni una H100; tarjetas de gama de entrada o integradas son validas. Una RTX 4090 queda enormemente sobredimensionada para este modelo.
- Compatibilidad con GPU de consumo: si, en todas las variantes. Incluso GPUs muy antiguas o iGPU pueden cargar q4_0 y q5_0.
- Ejecucion en CPU: si, es el escenario principal del backend GGML. Las variantes q4_0 y q5_0 estan pensadas explicitamente para telefonos.
- Opciones de despliegue: whisper.cpp >= 1.9 con el binario `parakeet-cli`. No es compatible con los ficheros GGUF de mudler/parakeet.cpp. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, dado que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. La model card no publica medidas de velocidad ni de consumo en dispositivos concretos.
- Almacenamiento: 2,7 GB para el repositorio completo; basta con descargar el fichero de la variante elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| npario/orukeet-ggml (este modelo) | Aproximadamente 600 M | No disponible | cc-by-sa-4.0 | GGML/GGUF para whisper.cpp |
| oruk/orukeet (modelo base) | Aproximadamente 600 M | No disponible | cc-by-sa-4.0 | Formato `.nemo` original |
| NVIDIA Parakeet TDT 0.6B v3 | Aproximadamente 600 M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Checkpoint original de NVIDIA |
| OpenAI Whisper large-v3 | Aproximadamente 1550 M (dato publico del modelo) | Ventanas de 30 s | MIT (dato publico del modelo) | Multiples formatos, incluido GGML |

La comparacion cuantitativa no es posible con los datos disponibles: no hay cifras de WER ni de velocidad para ninguna de las variantes de este repositorio. La ventaja diferencial frente a Whisper large-v3 es el tamano (aproximadamente una tercera parte de parametros y ficheros de 356 MB frente a varios GB) y la integracion con el motor Parakeet de whisper.cpp. La desventaja es la licencia cc-by-sa-4.0, con clausula de compartir igual, frente a la licencia MIT de Whisper.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion cuantitativa: no hay WER, ni comparaciones con el modelo base, ni verificacion independiente de la calidad de las cuantizaciones.
- La validacion de las variantes se hizo con muestras cortas en portugues e ingles, sin detallar el conjunto de prueba ni el procedimiento.
- No hay lista oficial de idiomas soportados; usarlo en idiomas distintos del portugues y el ingles es una extrapolacion sin garantia.
- La licencia cc-by-sa-4.0 es copyleft: cualquier obra derivada o distribucion de pesos modificados debe mantener la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar sus modificaciones.
- Este repositorio solo reempaqueta pesos: los problemas de sesgo, alucinacion o errores de transcripcion del modelo original se heredan sin cambios.
- Compatibilidad restringida: solo funciona con whisper.cpp >= 1.9 y su motor Parakeet. No es compatible con los GGUF de mudler/parakeet.cpp, un error de carga habitual si se mezclan ambos ecosistemas.
- El repositorio tiene cero descargas y cero likes, y fue creado el 15 de septiembre de 2026 segun los metadatos, por lo que no existe validacion por parte de la comunidad.
- El autor declara explicitamente que el modelo se ofrece "sin garantia" (no warranty), lo que en la practica significa que no hay soporte ni compromiso de mantenimiento.
- No hay datos de rendimiento en dispositivos concretos, por lo que las estimaciones de latencia para un caso de uso real deben medirse en el hardware objetivo antes de comprometerse a un despliegue en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/npario/orukeet-ggml
- Modelo base: https://huggingface.co/oruk/orukeet
- whisper.cpp (motor necesario, version >= 1.9): https://github.com/ggml-org/whisper.cpp
- Perfil del mantenedor de la conversion: https://huggingface.co/JoaoZaokk
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
- Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo; los enlaces obtenidos correspondian a paginas de ChatGPT y no se han utilizado como fuente.
