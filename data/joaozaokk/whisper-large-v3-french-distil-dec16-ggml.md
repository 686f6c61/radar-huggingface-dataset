# JoaoZaokk/whisper-large-v3-french-distil-dec16-ggml

## Resumen

`JoaoZaokk/whisper-large-v3-french-distil-dec16-ggml` es un repositorio de pesos cuantizados en formato GGML para `whisper.cpp`, derivado del checkpoint `bofenghuang/whisper-large-v3-french-distil-dec16`. No se trata de un modelo entrenado desde cero, sino de un reempaquetado: el autor parte de su propia conversión a f16 del checkpoint original de HuggingFace (formato safetensors) y genera tres variantes cuantizadas orientadas a inferencia local. El modelo subyacente es una destilación del decodificador de Whisper large-v3 especializada en francés.

La relevancia practica esta en el binomio tamano/despliegue: los ficheros van de 652 MB (q4_0) a 1209 MB (q8_0), lo que permite ejecutar reconocimiento automatico de voz en frances sobre hardware muy modesto, incluidos telefonos moviles, sin necesidad de GPU dedicada ni de conexion a servicios en la nube. El repositorio existe, segun declara el propio autor, para mantener estables los enlaces de descarga que consumen las aplicaciones nativas Odysseus y Open WebUI.

El proyecto no aporta innovacion arquitectonica propia: hereda la arquitectura encoder-decoder de la familia Whisper y se limita a aplicar el conversor y el cuantizador oficiales de `whisper.cpp`. La licencia MIT del checkpoint original se preserva sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper), empaquetado en formato GGML para `whisper.cpp` |
| Parametros totales | no disponible (el checkpoint base es una destilacion del decodificador de Whisper large-v3, segun el sufijo `dec16`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (Whisper opera sobre ventanas de audio, no sobre contexto de texto) |
| Tipos de cuantizacion | q4_0, q5_0, q8_0 (mas la conversion f16 de referencia, sin perdida) |
| Idiomas soportados | frances (`fr`) declarado en la model card |
| Licencia | MIT |
| Formato de pesos | GGML / GGUF binario (`.bin`), compatible con `whisper.cpp` |

Ficheros publicados:

| Fichero | Cuantizacion | Tamano |
|---|---|---|
| `ggml-whisper-large-v3-french-distil-dec16-q8_0.bin` | q8_0 | 1209 MB |
| `ggml-whisper-large-v3-french-distil-dec16-q5_0.bin` | q5_0 | 791 MB |
| `ggml-whisper-large-v3-french-distil-dec16-q4_0.bin` | q4_0 | 652 MB |

El tamano total del repositorio es de 2,7 GB.

## Arquitectura y entrenamiento

La arquitectura corresponde al estandar de la familia Whisper: un encoder de audio que consume espectrogramas mel y un decoder autoregresivo que genera tokens de texto, entrenado originalmente con supervision de transcripcion y traduccion multilingue. El checkpoint base `bofenghuang/whisper-large-v3-french-distil-dec16` es una variante destilada del decodificador de Whisper large-v3, con el decodificador reducido (el sufijo `dec16` apunta a 16 capas frente a las 32 del large-v3 completo) y especializada en frances. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada.

El trabajo realizado en este repositorio es exclusivamente de conversion y cuantizacion: se convierte el checkpoint original con el conversor propio de `whisper.cpp` y despues se aplica su cuantizador para producir las variantes q8_0, q5_0 y q4_0. El autor indica que cada variante se verifico transcribiendo muestras cortas en portugues e ingles antes de subirlas. No se documentan cambios en los pesos, fine-tuning adicional ni modificaciones de la arquitectura.

## Capacidades

- Reconocimiento automatico de voz (ASR) en frances: transcripcion de audio a texto.
- Inferencia local y on-device: los ficheros estan pensados para ejecutarse sin conexion a red.
- Ejecucion en CPU: al estar en formato GGML, no requiere GPU.
- Despliegue en movil: el autor recomienda explicitamente q4_0 y q5_0 para telefonos.
- Integracion en aplicaciones: se carga con `whisper-cli -m <fichero>` o mediante cualquier aplicacion que embeba `whisper.cpp`.
- Traduccion de voz: no confirmada de forma explicita en la informacion disponible; el modelo base pertenece a la familia Whisper, que soporta tareas de traduccion, pero la especializacion en frances y la destilacion pueden degradarla.
- Tool calling / function calling: no soportado (no es un modelo de lenguaje conversacional).
- Modo thinking, vision o audio mas alla del ASR: no disponible / no aplica.

## Casos de uso

- Transcripcion de reuniones en frances: el modelo convierte grabaciones de audio en texto ejecutandose en local, lo que evita enviar contenido confidencial a APIs externas. Adecuado por su tamano reducido (652-1209 MB) y su licencia MIT.
- Generacion de subtitulos para video: se puede integrar en un pipeline de postproduccion que alimente un fichero SRT a partir de la pista de audio en frances, usando la variante q8_0 para maximizar fidelidad.
- Aplicaciones moviles de dictado: con q4_0 (652 MB) o q5_0 (791 MB) el modelo cabe en el almacenamiento y la memoria de un telefono moderno, permitiendo dictado offline en frances.
- Atencion al cliente en frances: transcripcion de llamadas o mensajes de voz para su posterior analisis, indexacion o enrutado, con el modelo corriendo en el mismo servidor de telefonia.
- Archivado y busqueda de audio historico: transcripcion por lotes de un archivo de entrevistas o podcasts en frances para hacerlo buscable, con coste marginal de computo cercano a cero al no depender de APIs de pago.
- Subtitulado accesible en tiempo real para eventos: desplegado en un equipo de gama media, permite generar subtitulos en frances para streaming o videoconferencia, con latencia dependiente del hardware.
- Preprocesado para pipelines de NLP: la transcripcion sirve como entrada para resumen, clasificacion o traduccion posterior mediante otros modelos.
- Integracion en asistentes embebidos: aplicaciones como Odysseus u Open WebUI pueden consumir directamente los ficheros, ya que el autor mantiene los enlaces estables precisamente para ese uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente menciona una comprobacion cualitativa mediante transcripcion de muestras cortas en portugues e ingles, sin cifras de WER, CER ni comparaciones cuantitativas.

## Requisitos de hardware

- VRAM / RAM estimada para inferencia: aproximadamente el tamano del fichero mas el overhead del runtime. Orientativamente, menos de 1 GB para q4_0 (652 MB de pesos), alrededor de 1 GB para q5_0 (791 MB) y en torno a 1,5 GB para q8_0 (1209 MB).
- GPU: no es necesaria. Cualquier GPU consumer reciente (por ejemplo, serie RTX 30/40) puede ejecutar el modelo con holgura, pero el caso de uso natural es CPU.
- CPU: viable en procesadores de escritorio y portatiles modernos; el autor indica que q4_0 y q5_0 son la opcion recomendada para telefonos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer actual, e incluso en iGPU y en telefonos de gama media-alta con la cuantizacion q4_0.
- Opciones de despliegue: `whisper.cpp` (motor de referencia), `whisper-cli` como binario de linea de comandos, y cualquier aplicacion que embeba la libreria `whisper.cpp` (Odysseus, Open WebUI). Las variantes GGUF/GGML no son directamente compatibles con vLLM o TGI.
- Latencia y throughput: no disponibles. Dependen del hardware, de la cuantizacion y de la duracion del audio; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `JoaoZaokk/whisper-large-v3-french-distil-dec16-ggml` | no disponible | GGML (q4_0/q5_0/q8_0) | Frances | MIT | Cuantizado, orientado a on-device |
| `bofenghuang/whisper-large-v3-french-distil-dec16` | no disponible | safetensors (checkpoint original) | Frances | MIT | Requiere transformers; mayor huella de memoria |
| Whisper large-v3 original | aproximadamente 1550 M (referencia publica de la familia) | safetensors / GGML | Multilingue (99 idiomas declarados por OpenAI) | MIT | No especializado en frances; mayor tamano |
| Conversiones oficiales de `whisper.cpp` | no disponible | GGML | Multilingue | MIT | Punto de partida generico, sin destilacion en frances |

Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada, por lo que no se puede establecer una jerarquia cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- Modelo mono-idioma en la practica: la model card declara unicamente frances (`fr`). El propio autor verifico las variantes con muestras en portugues e ingles, lo que sugiere cierta transferencia, pero no hay garantia de calidad fuera del frances.
- No es un modelo de lenguaje: no soporta conversacion, tool calling, razonamiento multi-paso ni generacion de texto libre. Solo transcribe audio.
- Riesgo de alucinacion: como cualquier modelo de la familia Whisper, puede generar texto plausible en segmentos con ruido, silencio o audio ininteligible, especialmente con cuantizaciones agresivas.
- Perdida de precision por cuantizacion: q4_0 y q5_0 introducen una degradacion de exactitud respecto a f16 y q8_0. Se recomienda q8_0 cuando la calidad sea prioritaria.
- Herencia de sesgos: al ser una destilacion del checkpoint de `bofenghuang`, arrastra los sesgos del dataset de entrenamiento original, que no se documenta en la informacion disponible.
- Sin garantias ni soporte: el autor declara explicitamente "no warranty". Es un repositorio de reempaquetado, no un proyecto mantenido con SLA.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- Restricciones de licencia: MIT, permite uso comercial y modificacion, siempre que se conserve el aviso de copyright. El autor solicita citar a los autores originales (`bofenghuang`).
- Fechas del repositorio: creado y actualizado el 13 de septiembre de 2026, con una antiguedad de dos minutos entre ambos eventos, lo que indica una publicacion sin iteraciones posteriores registradas.
- Compatibilidad: al ser GGML y no GGUF estandar de llama.cpp, esta atado al ecosistema `whisper.cpp`; no se puede cargar en frameworks como transformers, vLLM o TGI sin reconvertir.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/JoaoZaokk/whisper-large-v3-french-distil-dec16-ggml
- Modelo base: https://huggingface.co/bofenghuang/whisper-large-v3-french-distil-dec16
- Perfil del autor: https://huggingface.co/JoaoZaokk
- Motor de inferencia `whisper.cpp`: https://github.com/ggml-org/whisper.cpp
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a paginas de ayuda de YouTube y no guardan relacion con el modelo.
