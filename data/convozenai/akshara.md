# ConvoZenAI/akshara

## Resumen

Akshara es un modelo de reconocimiento automatico del habla (ASR) desarrollado por ConvoZenAI, orientado a la transcripcion de lenguas indicas y a la conversacion con mezcla de idiomas (code-switching), como hindi-ingles o tamil-ingles. Cubre nueve idiomas: hindi, ingles, bengali, gujarati, kannada, malayalam, marathi, tamil y telugu. Su relevancia radica en el tratamiento nativo de habla code-mixed, un escenario muy comun en India que los sistemas ASR genericos suelen manejar mal.

El repositorio de Hugging Face no contiene pesos del modelo: es una ficha de documentacion de un servicio alojado. La inferencia se realiza a traves de la API de Convozen mediante el SDK `convozen`, por lo que no es posible ejecutar el modelo en local ni inspeccionar su arquitectura o su entrenamiento a partir de los materiales publicados. El modelo no declara parametros, contexto, cuantizaciones ni formato de pesos, y no se han publicado resultados de benchmarks.

La ficha, por tanto, describe una oferta de ASR como servicio (ASRaaS) con capacidades concretas: marcas de tiempo por palabra, sesgo de palabras clave, diarizacion de hablantes y soporte de audio estereo por canal. Es util para equipos que necesiten transcribir audio multilingue indio sin desplegar infraestructura propia, asumiendo la dependencia de la nube y de una clave de API.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servicio alojado; no se publica la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos) |
| Idiomas soportados | hi, en, bn, gu, kn, ml, mr, ta, te |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; acceso via API) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo (transformer, conformer, híbrido u otra), el numero de parametros, los datos de entrenamiento, el volumen de audio utilizado ni si se aplicaron tecnicas de ajuste como RLHF o fine-tuning supervisado. La model card unicamente documenta el uso del servicio mediante el SDK `convozen` y las capacidades expuestas en la API.

Los unicos elementos tecnicos observables son los parametros de inferencia del servicio: `lang_tags` para indicar los idiomas presentes, `blank_penalty` para penalizar tokens en blanco (con valor derivado automaticamente de `lang_tags` cuando no se especifica), `keywords` para sesgar la decodificacion hacia vocabulario de dominio y `denoise` para reduccion de ruido aplicada solo en diarizacion. Estos indicios sugieren un decodificador con control sobre tokens en blanco y sesgo lexico, pero no permiten inferir la arquitectura subyacente.

## Capacidades

- Transcripcion de voz a texto en nueve idiomas: hindi, ingles, bengali, gujarati, kannada, malayalam, marathi, tamil y telugu.
- Soporte de habla code-mixed (por ejemplo, hindi-ingles y tamil-ingles), con salida que mezcla scripts en una misma frase.
- Pistas de idioma mediante `lang_tags` para mejorar la precision cuando se conocen los idiomas hablados.
- Marcas de tiempo por palabra (`word_time_stamps=True`), con `word`, `start_s` y `end_s` por token.
- Sesgo de vocabulario mediante `keywords`, util para nombres propios, marcas y terminologia de dominio.
- Diarizacion de hablantes en audio mono (`diarize=True`), con deteccion automatica o numero esperado de hablantes entre 2 y 20 (`n_speakers`).
- Reduccion de ruido opcional en diarizacion (`denoise=True`).
- Tratamiento de audio estereo con un hablante por canal (`audio_channels="stereo"`), pensado para grabaciones de centro de llamadas.
- Puntuacion de confianza por transcripcion (`score`, donde valores mas cercanos a 0 indican mayor confianza).
- No se documentan capacidades de traduccion, resumen, emocion, idioma hablado (LID explicito) ni salida en otros formatos.

## Casos de uso

- Atencion al cliente en centros de llamadas: con `audio_channels="stereo"` el servicio separa automaticamente los canales de agente y cliente, devolviendo turnos con `speaker_id` y transcripcion por turno, lo que simplifica el analisis posterior de conversaciones.
- Transcripcion de reuniones y llamadas mono: con `diarize=True` y `n_speakers` ajustado al numero real de participantes (2-20), se obtienen turnos etiquetados por hablante para generar actas o resumenes.
- Subtitulado y alineacion temporal: las marcas de tiempo por palabra permiten generar subtitulos sincronizados o indexar fragmentos de audio por termino.
- Dominios con vocabulario especializado (salud, banca, legal): el parametro `keywords` sesga la decodificacion hacia terminos propios del sector, reduciendo errores en nombres de productos, farmacos o entidades.
- Habla code-mixed en soporte tecnico: al aceptar `lang_tags=["hi", "en"]` o combinaciones similares, el modelo transcribe frases que alternan idiomas sin forzar una unica lengua de salida.
- Analitica de calidad y cumplimiento: la transcripcion con hablantes y timestamps permite calcular tiempos de respuesta, solapamientos de habla y busquedas de palabras clave en grabaciones historicas.
- Prototipado rapido de productos de voz: al ser una API, un equipo puede integrar ASR multilingue indio sin entrenar ni desplegar modelos, usando el SDK de Python y una clave de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se requiere hardware local: la inferencia se ejecuta en la infraestructura de Convozen y se accede mediante API.
- Requisitos del cliente: conexion a internet, una clave de API valida (`CONVOZEN_API_KEY`) y el SDK `convozen` instalado (`pip install convozen`).
- El audio de entrada debe ser una ruta a un fichero en disco; el SDK envia el audio al servicio.
- No se documentan latencia, throughput, limites de tamano de audio ni cuotas de peticiones.
- No aplican opciones de despliegue local como vLLM, llama.cpp, Ollama o TGI, ya que no se distribuyen pesos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa con alternativas de ASR para lenguas indicas.

## Limitaciones y advertencias

- Dependencia de la nube: el audio se envia a la API de Convozen, por lo que se requiere conexion a internet y una clave valida; no hay opcion de ejecucion local u offline.
- Privacidad y cumplimiento: al enviar audio a un tercero, es necesario evaluar requisitos de proteccion de datos (por ejemplo, RGPD) y la politica de retencion del proveedor antes de usarlo con conversaciones reales.
- Licencia no disponible: no se especifican condiciones de uso comercial, redistribucion ni restricciones; conviene confirmarlas con el proveedor antes de integrarlo en produccion.
- Opacidad tecnica: no se publican arquitectura, parametros, datos de entrenamiento ni evaluaciones, lo que dificulta la auditoria y la estimacion de sesgos.
- Riesgo de alucinacion y errores de transcripcion: como todo sistema ASR, puede generar texto plausible pero incorrecto, especialmente con ruido, acentos marcados o vocabulario fuera de dominio; el campo `score` ayuda a detectar transcripciones de baja confianza.
- Cobertura linguistica limitada a los nueve idiomas listados; no se documenta soporte para otras lenguas indicas ni para variantes dialectales.
- Restricciones funcionales: `diarize=True` solo es valido en audio mono y no debe combinarse con `audio_channels="stereo"`; `denoise` solo se aplica a diarizacion.
- Sin datos de rendimiento: la ausencia de benchmarks impide comparar su precision con alternativas y hace recomendable una evaluacion propia con audio representativo del caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ConvoZenAI/akshara
- Pagina de desarrolladores para generar clave de API: https://convozen.ai/developers/speech-to-text
