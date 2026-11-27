# Chagreyssza/karaoke-studio

## Resumen

Karaoke Studio es un repositorio publicado en Hugging Face por el usuario Chagreyssza que, segun su model card, contiene una aplicacion web completa para generar karaokes personalizados a partir de una cancion original. El sistema combina separacion de fuentes con Demucs, transcripcion y alineamiento temporal con faster-whisper/WhisperX, analisis musical con Librosa y renderizado de video con FFmpeg y libass, todo orquestado desde un frontend React + TypeScript + Tailwind + WaveSurfer.js y un backend Python.

El proposito declarado es permitir al usuario importar una cancion, eliminar la voz con IA, escribir letras propias (incluso en un idioma distinto al original) y alinear esas letras silaba a silaba sobre la melodia original mediante dos algoritmos de programacion dinamica, para finalmente exportar un video MP4 de karaoke. El repositorio no contiene pesos de un modelo de lenguaje ni de un modelo generativo propio: es una aplicacion de software que integra modelos de terceros (Demucs, Whisper, YIN para tono) y, opcionalmente, un LLM local via Ollama para sugerencias de reformulacion.

En el momento de la consulta, el repositorio figura con 0 descargas, 0 likes, un tamano de 0.0 GB y sin pipeline, licencia ni idiomas declarados en los metadatos de Hugging Face. La informacion disponible es exclusivamente la model card del autor; no se han publicado especificaciones tecnicas formales, benchmarks ni pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (aplicacion web; integra Demucs htdemucs, faster-whisper/WhisperX, Librosa con YIN, FFmpeg + libass, React + TypeScript + Tailwind + WaveSurfer.js) |
| Parametros totales | No disponible (no es un modelo con pesos propios) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible en metadatos; la model card menciona transcripcion con Whisper y letras escritas por el usuario (ejemplo en frances) |
| Licencia | No disponible |
| Formato de pesos | No disponible (repositorio de codigo; no se declaran pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de una aplicacion que compone varios componentes. La separacion de fuentes usa Demucs `htdemucs`, que divide la mezcla en bateria, bajo, otros y voz; la instrumental se obtiene sumando las pistas no vocales y se conserva en WAV de 16 bits a 44,1 kHz. La transcripcion y el horodatado por palabra se realizan con faster-whisper o WhisperX, y el resultado se recalibra sobre las ataques vocal detectados en la pista de voz aislada. El analisis musical con Librosa estima tempo y sus variaciones, tiempos, metrica y primeros tiempos de compas, y estructura (intro, estrofas, estribillos, puentes, pasajes instrumentales, outro); sobre la voz aislada se detectan ataques, inicios y finales de frase, respiraciones, silencios, altura mediante YIN, notas sostenidas y melismas.

El nucleo algoritmico descrito en `backend/app/sync.py` consta de dos alineamientos por programacion dinamica. El primero empareja versos con frases originales admitiendo correspondencias 1:1, un verso sobre dos frases o dos versos sobre una frase, con un coste basado en la diferencia de silabas (teniendo en cuenta la capacidad de las notas largas), la compatibilidad estrofa/estribillo/puente y las fronteras de seccion. El segundo alinea silabas con "casillas" cantadas, permitiendo que una silaba se extienda sobre varias notas (melisma, preferentemente en silaba acentuada o final de palabra), que varias silabas compartan una nota larga (penalizado si es demasiado corta), el tratamiento de las e mudas francesas segun contexto, la atraccion del acento tonico hacia tiempos fuertes y la prohibicion de cantar a traves de una respiracion. Las sugerencias de reformulacion (`suggest.py`) usan contracciones, sinonimos y palabras de relleno, y opcionalmente un LLM local via Ollama configurado con `KS_OLLAMA_URL`; segun la model card, las letras del usuario nunca se modifican sin su confirmacion.

## Capacidades

- Separacion de voz e instrumental a partir de MP3, WAV, M4A, FLAC y OGG, con escucha A/B entre original, instrumental y voz, y descarga en MP3 320k o WAV.
- Analisis musical automatico: tempo y variaciones, tiempos, metrica, primeros tiempos de compas y estructura por secciones.
- Transcripcion de letras con horodatado por palabra y recalibrado sobre ataques vocal reales.
- Alineamiento silaba a silaba de letras nuevas sobre la melodia original mediante programacion dinamica, con soporte de melismas, notas compartidas, e mudas y acentos tonicos.
- Contador de silabas del canto frances (e mudas elididas ante vocal, cantadas ante consonante, opcionales en final de verso) comparado en directo con el numero de notas de la frase original.
- Editor de timeline con forma de onda, rejilla de compases y tiempos, estructura, pista de voz original, pista de versos, pista de palabras y silabas, bloques desplazables y redimensionables, ajuste de fronteras de silaba, iman, zoom, reproduccion, deshacer/rehacer y nudge por teclado.
- Modo de entrada por teclado con compensacion de latencia y velocidad reducida.
- Diagnostico por verso (correcto, a revisar, problema) con sugerencias de reformulacion que requieren confirmacion explicita; integracion opcional con LLM local via Ollama.
- Exportacion de video MP4 H.264/AAC 320k en 1920x1080, 3840x2160, 1080x1920 o 1080x1080, a 25, 30 o 60 fps y tres niveles de calidad.
- Exportaciones auxiliares: instrumental en MP3/WAV, letras en LRC palabra a palabra, SRT y ASS con karaoke animado.
- Personalizacion grafica con siete plantillas, fondos de color, degradado estatico o animado, imagen o video en bucle, logo, desenfoque, oscurecimiento y fundidos.
- Ejecucion totalmente local sin APIs de pago.

## Casos de uso

- Creacion de karaokes personalizados para uso domestico o eventos: el usuario importa una cancion, genera la instrumental con Demucs y escribe sus propias letras; el alineador por programacion dinamica coloca cada silaba sobre las notas realmente cantadas, lo que evita la distribucion uniforme tipica de herramientas mas simples.
- Traduccion y adaptacion de canciones a otro idioma: la model card indica explicitamente que se pueden escribir letras en frances aunque el original este en otra lengua, y el contador de silabas y el diagnostico por verso ayudan a ajustar la metrica al numero de notas disponible.
- Produccion de videos de karaoke para redes sociales: la exportacion en 1080x1920 vertical y 1080x1080 cuadrada, con 25/30/60 fps y fondos animados, permite generar contenido listo para publicar sin salir del entorno local.
- Generacion de subtitulos sincronizados para videoclips o actuaciones: la exportacion en ASS con efecto `\kf` de relleno progresivo por silaba, SRT y LRC palabra a palabra sirve como material para edicion posterior en herramientas de video.
- Practica de canto y estudio de una cancion: la escucha A/B entre original, instrumental y voz aislada, junto con la deteccion de ataques, respiraciones y notas sostenidas, permite analizar la interpretacion original y compararla con la propia.
- Docencia de idiomas a traves de la musica: escribir letras nuevas sobre una melodia existente y comprobar el ajuste silabico y acentual es un ejercicio practico para trabajar prosodia y ritmo en frances.
- Edicion profesional de karaoke con control fino: el editor de timeline con iman, ajuste de fronteras de silaba, deshacer/rehacer y nudge por teclado, junto con la previsualizacion que replica las reglas de libass, permite corregir manualmente el resultado automatico antes de exportar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma que la separacion con GPU NVIDIA es aproximadamente 10 veces mas rapida que en CPU (`KS_GPU=1`), sin cifras absolutas de latencia ni throughput.

## Requisitos de hardware

- Requisitos de software: Python 3.10 o superior, Node.js 18 o superior y FFmpeg compilado con libass (incluido en los paquetes de Ubuntu/Debian, Homebrew y las builds "full" de gyan.dev para Windows).
- Espacio en disco: aproximadamente 3 GB para PyTorch y modelos, segun la model card.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; la model card solo menciona que una GPU NVIDIA acelera la separacion unas 10 veces mediante PyTorch CUDA.
- Compatibilidad con GPU de consumo: no disponible de forma explicita; el modo por defecto instala PyTorch para CPU.
- Opciones de despliegue: ejecucion local mediante `./scripts/setup.sh` y `./scripts/start.sh` (servidor en `http://localhost:8000`), modo desarrollo con `./scripts/dev.sh` (API con recarga automatica), y scripts equivalentes para Windows (`scripts\setup.ps1`). No se documentan despliegues con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia; Ollama solo se usa de forma opcional como backend de sugerencias de letras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (aplicaciones de generacion de karaoke o pipelines de separacion y alineamiento de voz) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio no declara licencia en Hugging Face; antes de cualquier uso, incluido el comercial, es necesario verificar los terminos del codigo y de los componentes de terceros (Demucs, Whisper, Librosa, FFmpeg, libass, WaveSurfer.js).
- No se declaran idiomas soportados en los metadatos; la model card describe un contador de silabas especifico del canto frances y un ejemplo de letras en frances, por lo que el ajuste metrico para otros idiomas puede no estar cubierto.
- El alineamiento silabico depende de la calidad de la separacion de voz y de la transcripcion; en mezclas con mucha instrumentacion, coros densos o voces procesadas, la deteccion de ataques y el horodatado pueden degradarse.
- Las sugerencias de reformulacion pueden ser inadecuadas o introducir cambios de sentido; la propia model card indica que nunca se aplican sin confirmacion del usuario, lo que traslada la responsabilidad de revision al operador.
- El uso opcional de un LLM local via Ollama anade un componente generativo cuyas salidas pueden contener errores o alucinaciones; no se especifica que modelo se recomienda ni sus limites.
- No hay datos publicados de benchmarks, latencia, throughput ni consumo de VRAM, lo que dificulta dimensionar un despliegue en produccion.
- El repositorio figura con 0 descargas y 0 likes y un tamano de 0.0 GB, lo que sugiere que el contenido puede no estar subido o que la publicacion es meramente referencial; conviene comprobar la integridad de los archivos antes de usarlo.
- La licencia de las canciones introducidas por el usuario y de las letras generadas es responsabilidad de quien utiliza la herramienta; la aplicacion no aplica filtros de derechos de autor segun la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Chagreyssza/karaoke-studio
- No se han encontrado en la busqueda web otros enlaces (papers, blogs, repositorios de codigo o demos) asociados a este proyecto.
