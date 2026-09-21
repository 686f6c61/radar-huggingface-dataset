# itsskofficial/livewhisper-mr-large-v2

## Resumen

Livewhisper-mr-large-v2 es una conversion a CTranslate2 del modelo DrishtiSharma/whisper-large-v2-marathi, un ajuste fino de Whisper large-v2 sobre el idioma marathi (mr). La publica el desarrollador itsskofficial dentro del proyecto LiveWhisper, una aplicacion de dictado por voz para Windows, con el objetivo de que el modelo sea consumible directamente por faster-whisper sin necesidad de convertir pesos manualmente. El repositorio no entrena nada nuevo: solo cambia el formato de los pesos (a float16) y anade los ficheros tokenizer.json y preprocessor_config.json que exige faster-whisper.

La relevancia practica es concreta: se trata de una de las pocas opciones listas para produccion de reconocimiento automatico de voz en marathi empaquetadas en el formato de inferencia optimizado de CTranslate2, con un peso de repositorio de 3,1 GB. Segun el autor, rinde mejor que Whisper large-v3 en marathi (un 47,2 % de word error rate en FLEURS frente al 78,7 % de large-v3) y se ejecuta a aproximadamente 2,5 veces tiempo real.

El modelo es puramente de reconocimiento de voz: no es un LLM, no genera texto libre, no hace tool calling y no soporta otros idiomas aparte del marathi. Su licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v2), convertido a CTranslate2 |
| Parametros totales | 1550 millones (tamano Whisper large-v2; coherente con el repositorio de 3,1 GB en float16) |
| Longitud de contexto | Ventana de audio de 30 segundos por segmento y contexto de texto de 448 tokens del decodificador (propiedades de la arquitectura Whisper) |
| Tipos de cuantizacion | Pesos float16; el autor muestra inferencia con compute_type int8_float16 en faster-whisper |
| Idiomas soportados | Marathi (mr) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (model.bin) mas tokenizer.json y preprocessor_config.json |
| Tamano del repositorio | 3,1 GB |
| Libreria de inferencia | CTranslate2 / faster-whisper |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v2: un transformer encoder-decoder que procesa audio en ventanas fijas de 30 segundos y genera texto de forma autorregresiva con marcas de tiempo. Este repositorio no modifica la arquitectura; es una conversion de formato a CTranslate2 con pesos en float16, pensada para que faster-whisper pueda cargar el modelo de forma directa. El modelo base, DrishtiSharma/whisper-large-v2-marathi, es un ajuste fino de whisper-large-v2 sobre marathi.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base: el autor de esta conversion no documenta esos detalles y se limita a indicar que todo el credito corresponde a los autores originales. La unica innovacion tecnica relevante es el propio pipeline de conversion: el autor reporta un pico de memoria cercano a 11,5 GB durante el proceso de conversion, y un consumo de aproximadamente 6 GB de VRAM con el modelo principal ya convertido.

## Capacidades

- Reconocimiento automatico de voz (ASR) en marathi: convierte audio a texto transcrito.
- Inferencia optimizada mediante faster-whisper sobre el runtime CTranslate2, tanto en CPU como en GPU.
- Soporte de compute_type int8_float16 para reducir el consumo de memoria en GPU.
- Hereda de Whisper la generacion de marcas de tiempo a nivel de segmento.
- No es un modelo de lenguaje: no soporta generacion de texto libre, razonamiento, codigo ni matematicas.
- No soporta tool calling, function calling ni flujos de agentes o razonamiento multi-paso.
- No dispone de capacidades de vision, audio mas alla de la propia ASR, ni modo de pensamiento (thinking mode).
- Monolingue: solo marathi; no cubre otros idiomas ni traduccion.

## Casos de uso

- Dictado por voz en Windows: es el escenario para el que se creo, ya que LiveWhisper lo descarga y lo ejecuta directamente sobre faster-whisper para transcribir la voz del usuario en marathi en tiempo real.
- Transcripcion de reuniones en marathi: con una ventana de audio de 30 segundos por segmento, permite procesar grabaciones largas troceandolas y generar transcripciones con marcas de tiempo para su posterior revision.
- Subtitulado automatico de video: al producir marcas de tiempo por segmento, la salida se puede volcar directamente a formatos de subtitulos para contenido audiovisual en marathi.
- Atencion al cliente en centros de llamadas: permite transcribir conversaciones telefonicas en marathi para su analisis, control de calidad o generacion de resumenes posteriores con otro modelo.
- Archivado y busqueda de audio: transcribir grandes volumenes de grabaciones para hacerlas indexables y buscables por texto.
- Investigacion en ASR de bajos recursos: sirve como punto de comparacion frente a Whisper large-v3 en marathi, un idioma con menos recursos que los mayoritarios, dentro de estudios de reconocimiento de voz.
- Documentacion dictada en entornos profesionales: transcripcion de notas clinicas, actas o informes dictados en marathi por parte de profesionales, con correccion posterior.

## Benchmarks y rendimiento

Los unicos datos publicados son los medidos por el autor dentro de la aplicacion LiveWhisper. No se han publicado otros resultados de benchmarks en la informacion disponible.

| Metrica | livewhisper-mr-large-v2 | whisper large-v3 |
|---|---|---|
| FLEURS word error | 47,2 % | 78,7 % |
| Prueba "delivered Minglish" | 51,6 % | 73,2 % |

Menos es mejor en ambos casos. El autor indica ademas que el modelo es tan rapido como large-v3 en los mismos clips (aproximadamente 2,5 veces tiempo real).

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 6 GB con el modelo principal, segun el autor.
- Memoria durante la conversion: picos cercanos a 11,5 GB.
- Reduccion adicional de memoria con compute_type int8_float16 en faster-whisper.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM; encajan tarjetas de consumo como RTX 3060 (12 GB), RTX 4070 o superiores, asi como A100 o H100 para despliegues con muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, siempre que se disponga de unos 6 GB de VRAM libres.
- Opciones de despliegue: faster-whisper sobre CTranslate2 es la via soportada directamente. Otros runtimes como whisper.cpp requeririan reconvertir a formato GGML, y plataformas como Ollama o vLLM no cargan este formato de pesos.
- Latencia y throughput estimados: aproximadamente 2,5 veces tiempo real, segun la medicion del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | WER FLEURS (marathi) |
|---|---|---|---|---|---|
| livewhisper-mr-large-v2 | 1550 M | Marathi | CTranslate2 (float16) | Apache-2.0 | 47,2 % |
| DrishtiSharma/whisper-large-v2-marathi (modelo base) | 1550 M | Marathi | safetensors (transformers) | Apache-2.0 | no disponible |
| openai/whisper-large-v3 | 1550 M | Multilingue | safetensors | Apache-2.0 | 78,7 % (segun medicion del autor) |
| openai/whisper-large-v2 | 1550 M | Multilingue | safetensors | Apache-2.0 | no disponible |

La diferencia clave frente al modelo base es el formato de pesos: el base se distribuye para transformers, mientras que esta conversion esta lista para faster-whisper. No se dispone de datos comparativos de contexto o rendimiento mas alla de los WER reportados por el autor.

## Limitaciones y advertencias

- Solo cubre marathi: cualquier audio en otro idioma producira salidas incorrectas o alucinadas.
- El WER absoluto en FLEURS es alto (47,2 %), de modo que la transcripcion requiere revision humana en contextos criticos.
- El rendimiento empeora en la prueba "delivered Minglish" (51,6 %), lo que sugiere dificultades con audio que mezcla marathi e ingles.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion independiente de la comunidad.
- Al ser una conversion de formato, hereda integramente los sesgos, las alucinaciones y las limitaciones del modelo base; Whisper tiende a generar texto espurio en silencios, musica o audio de baja calidad.
- No se documentan en esta ficha los datos de entrenamiento, la composicion del dataset ni el proceso de ajuste del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de otro modelo Apache-2.0 conviene conservar la atribucion a los autores originales.
- El modelo no ofrece mecanismos de control de contenido ni filtrado de salida; cualquier moderacion debe implementarse en la capa de aplicacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itsskofficial/livewhisper-mr-large-v2
- Modelo base: https://huggingface.co/DrishtiSharma/whisper-large-v2-marathi
- faster-whisper (SYSTRAN): https://github.com/SYSTRAN/faster-whisper
- LiveWhisper (aplicacion de dictado): https://github.com/itsskofficial/LiveWhisper
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada.
