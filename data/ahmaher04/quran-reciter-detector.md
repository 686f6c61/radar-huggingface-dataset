# ahmaher04/quran-reciter-detector

## Resumen

`ahmaher04/quran-reciter-detector` no es un modelo generativo, sino un sistema de identificacion de hablante en conjunto cerrado (closed-set) especializado en recitadores del Coran. El repositorio publica una galeria de *embeddings* de voz de 289 grabaciones correspondientes a 243 recitadores, un indice de 114 suras y 6.236 ayas, y el codigo de puntuacion necesario para pasar de un clip de audio a un nombre y a un tramo de versiculos. Lo firma el usuario ahmaher04, con licencia propia `quran-reciter-voiceprint-1.0` (etiquetada como `other`), y el repositorio ocupa 0,0 GB porque no incluye audio ni pesos de encoder.

El funcionamiento se apoya en dos componentes externos que se descargan en tiempo de ejecucion: el extractor de *embeddings* NVIDIA TitaNet-Small exportado a ONNX para sherpa-onnx (40.257.283 bytes, 192 dimensiones) y el modelo ASR `tarteel-ai/whisper-base-ar-quran` para transcribir el audio y alinearlo contra el texto plano del Coran. La galeria en si es una matriz `float32` de forma `[289, 192]` (221.952 bytes), L2-normalizada por filas, que se compara por coseno con el vector del clip de entrada.

Su relevancia es acotada pero clara: resuelve un problema de catalogacion y verificacion (que recitador suena en este archivo y que tramo del mushaf esta leyendo) con un umbral explicito de 0,70 y una regla de consenso entre ventanas, en lugar de devolver siempre la clase mas probable. Es un caso de uso de *speaker verification* con galeria enrolada, no un clasificador entrenado de extremo a extremo: nada de TitaNet se ha ajustado con estos recitadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de identificacion de hablante closed-set: encoder NVIDIA TitaNet-Small (ONNX, sherpa-onnx) congelado + galeria de embeddings + ASR Whisper base (`tarteel-ai/whisper-base-ar-quran`) para alineamiento de versiculos |
| Parametros totales | no disponible (el repositorio no contiene pesos de encoder; el ONNX externo de TitaNet-Small ocupa 40.257.283 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de audio de 20 s con salto (*hop*) de 10 s. Los clips de 15 s o menos se rechazan; por debajo de 20 s la llamada lanza excepcion; 30 s es la duracion de diseno |
| Tipos de cuantizacion | no disponible (galeria en `float32`; encoder ONNX servido por sherpa-onnx, sin variantes cuantizadas documentadas) |
| Idiomas soportados | arabe (`ar`) |
| Licencia | `quran-reciter-voiceprint-1.0` (campo `license: other`, texto en `LICENSE`) |
| Formato de pesos | `embeddings.safetensors` (clave `embeddings`, `float32`, `[289, 192]`, filas L2-normalizadas) y `embeddings.bin` (misma matriz, `float32` little-endian, row-major, sin cabecera, SHA-256 `b6f1436bee902e666e6e66164a62572009fbbe07205637596430f1797099f3af`); encoder externo en `.onnx` |
| Dimension del embedding | 192 |
| Grabaciones enroladas | 289 |
| Recitadores distintos | 243 |
| Umbral de aceptacion | coseno agrupado >= 0,70 y, con dos o mas ventanas, al menos la mitad votando el mismo `reciterId`; en caso contrario, `unknown` |
| Top-k devuelto | 3 candidatos con su coseno |
| Cobertura del indice de versiculos | 114 suras / 6.236 ayas (`quran/ayahs.txt.gz`, `quran/surahs.json`) |
| Formato de audio de entrada | mono, 16 kHz, `float32` en `[-1, 1]`; PCM16 se convierte con `sample / 32768` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El pipeline es una cadena de tres etapas sin entrenamiento propio. Primero, el clip se trocea en ventanas de 20 s con salto de 10 s, descartando cualquier ventana de 15 s o menos. Cada ventana se pasa por `nemo_en_titanet_small.onnx` (TitaNet-Small, *embedding* de 192 dimensiones), se normaliza en L2 y se promedian los vectores; la media se vuelve a normalizar en L2, replicando el mismo procedimiento con el que se enrolo la galeria (promedio de clips de 20 s). Segundo, el vector agrupado se puntua por coseno contra las 289 filas y se conservan las tres mejores. Tercero, el audio completo se transcribe con Whisper base en arabe y `verse_locator.py` alinea las palabras contra el texto plano del Coran para devolver la sura y el rango de ayas.

No hay *fine-tuning*: TitaNet se usa como extractor de caracteristicas congelado y la separacion entre recitadores procede unicamente de la galeria enrolada, no de una cabeza clasificadora. El autor advierte de que el modelo de hablante debe ser exactamente el fichero indicado (SHA-256 `ad4a1802485d8b34c722d2a9d04249662f2ece5d28a7a039063ca22f515a789e`), porque otro encoder produce vectores en un espacio distinto y los cosenos dejan de ser comparables. Tampoco se documentan en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento ni fases de RLHF/DPO, algo esperable al no haber entrenamiento. La unica validacion publicada es una linea de auto-test truncada en la model card (`ok 289 voices, 24...`).

## Capacidades

- Identificacion de recitador en conjunto cerrado entre 243 recitadores y 289 grabaciones, devolviendo nombre y coseno.
- Salida de los tres mejores candidatos para revision humana, en lugar de una unica etiqueta.
- Rechazo explicito: devuelve `unknown` ante audio de 15 s o menos, silencio, recitador no enrolado o falta de consenso entre ventanas.
- Localizacion de versiculo: devuelve la sura y el rango de ayas (aya inicial y aya final) a partir de la transcripcion alineada contra el mushaf.
- Transcripcion de arabe coranico mediante `tarteel-ai/whisper-base-ar-quran`, descargado en el primer uso.
- Gestion de audio mono a 16 kHz en `float32`, con conversion documentada desde PCM16.
- Despliegue como Inference Endpoint mediante `handler.py`, que descarga el encoder al arrancar.
- No soporta *tool calling*, ni razonamiento multi-paso, ni agentes, ni vision, ni audio generation: no es un modelo de lenguaje.
- No realiza clonacion ni imitacion de voz, y no identifica personas privadas fuera de la galeria publica.

## Casos de uso

- **Etiquetado de archivos de recitacion**: dado un lote de grabaciones de al menos 20-30 s, el sistema asigna recitador y grabacion de origen, lo que permite reconstruir catalogos y detectar duplicados comparando el `recordingId` devuelto.
- **Verificacion de autoria en apps moviles**: el propio autor indica que la galeria se distribuye dentro de la aplicacion Muslim como `assets/reciter_id/embeddings.bin`, con el orden de filas alineado con `catalog.json` → `items`; sirve para mostrar el nombre del recitador en reproduccion sin llamadas a servidor.
- **Indexacion por versiculo para subtitulos o busqueda**: la salida de sura y rango de ayas permite generar marcas de tiempo, subtitulos sincronizados o un indice navegable de un archivo largo de recitacion.
- **Curacion con humano en el bucle**: el top-3 con coseno esta pensado para que una persona confirme; util en proyectos de digitalizacion de audio donde el coste de un falso positivo es alto.
- **Control de calidad de un corpus**: el rechazo de clips cortos, silencios y voces no enroladas actua como filtro previo antes de incorporar audio a un dataset de recitacion.
- **Organizacion de bibliotecas personales**: agrupar una coleccion de recitaciones por recitador para generar listas de reproduccion o separar mushafs `mujawwad` de mushafs de ensenanza, usando la etiqueta de la fila como metadato.
- **Investigacion en speaker verification sobre arabe coranico**: la galeria publica y el codigo de puntuacion permiten reproducir el protocolo (ventanas de 20 s, hop 10 s, umbral 0,70) como linea base en estudios de embeddings de hablante en dominio religioso.
- **Deteccion de contenido no coranico por transcripcion**: si la transcripcion no alinea contra `quran/ayahs.txt.gz`, el audio no se confirma como Coran; sirve como heuristica debil, no como verificador robusto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe el criterio operativo de decision (coseno >= 0,70 con voto mayoritario de ventanas) y una linea de auto-test truncada (`ok 289 voices, 24`). No hay tasas de acierto, EER, precision/recall ni comparaciones cifradas con otros sistemas. Tampoco se dispone de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada: minimo, del orden de cientos de MB en total (encoder ONNX de 40,3 MB y galeria de 222 KB, mas el checkpoint de Whisper base). Cifra exacta no disponible.
- GPU recomendadas: ninguna en particular; el sistema esta disenado para ejecutarse en CPU. Una RTX 4090, A100 o H100 solo aportarian ventaja en procesamiento por lotes a gran escala.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU: el cuello de botella es el ASR, no la galeria.
- Opciones de despliegue: script Python `reciter_identifier.py` (requiere `numpy`), `handler.py` para Hugging Face Inference Endpoints, y sherpa-onnx / onnxruntime para el encoder. No aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Dependencias de red: el encoder ONNX se descarga desde el release de sherpa-onnx y Whisper base se descarga en el primer uso; el repositorio no los almacena.
- Latencia y throughput: no disponibles. Como referencia cualitativa, cada clip de 30 s genera dos ventanas de 20 s que deben embeberse mas una pasada de transcripcion completa.
- Almacenamiento: practicamente despreciable para la galeria (222 KB); el espacio lo consumen los pesos de Whisper y el ONNX externo.

## Comparativa con modelos similares

| Sistema | Enfoque | Parametros | Contexto / ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ahmaher04/quran-reciter-detector` | Galeria closed-set sobre TitaNet-Small congelado + alineamiento Whisper | no disponible (encoder ONNX 40,3 MB) | ventanas de 20 s, hop 10 s; minimo >15 s | sin benchmarks publicados; umbral coseno 0,70 | `quran-reciter-voiceprint-1.0` (`other`) | pesos de galeria publicos; encoder y ASR externos |
| TitaNet-Small (NVIDIA, via sherpa-onnx) | Embedding de hablante generico | no disponible | no disponible | no disponible | la del release upstream de sherpa-onnx | publico en GitHub releases |
| `tarteel-ai/whisper-base-ar-quran` | ASR especializado en arabe coranico | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | publico en Hugging Face |
| Clasificador supervisado fine-tuned por recitador | Cabeza de clasificacion sobre embeddings | no disponible | no disponible | no disponible | no disponible | no se ha identificado una alternativa publica equivalente |

No se han encontrado en la busqueda web modelos directamente comparables con datos verificables de parametros, contexto o rendimiento; las cifras de las alternativas quedan como no disponibles en lugar de estimarse.

## Limitaciones y advertencias

- Rechaza clips de 15 s o menos y lanza excepcion por debajo de 20 s; con menos de 30 s la calidad de decision cae por falta de ventanas para el voto mayoritario.
- La identificacion solo cubre las 289 grabaciones y 243 recitadores enrolados; cualquier otra voz queda como `unknown` o, peor, puede producir un falso positivo si supera 0,70.
- Dependencia critica del encoder exacto: usar otro modelo de hablante invalida la comparacion de cosenos contra la galeria.
- TitaNet-Small se entreno como modelo generico de hablante, con presencia de habla en ingles; puede infrarrepresentar peculiaridades foneticas del arabe coranico y de estilos de recitacion (murattal, mujawwad, maqamat).
- La localizacion de versiculos depende de Whisper: una alucinacion o una transcripcion parcial produce una sura o un rango de ayas erroneos. Los pasajes repetidos (por ejemplo, el estribillo de ar-Rahman) quedan deliberadamente como `unknown`.
- No verifica que el audio sea Coran mas alla del match de transcripcion; no es un detector de contenido robusto.
- No selecciona la riwayah por si mismo: la etiqueta (Hafs, Warsh, mushaf mujawwad, mushaf de ensenanza) procede del catalogo de origen.
- Uso prohibido para clonar o imitar la voz de un recitador, y no debe emplearse para identificar a personas privadas.
- Licencia `other` con nombre propio (`quran-reciter-voiceprint-1.0`): es imprescindible leer `LICENSE` antes de cualquier uso comercial o de redistribucion; las condiciones no se detallan en la informacion disponible.
- Sesgos no evaluados: no hay analisis publicado de sesgo por genero, origen geografico, escuela de recitacion ni edad de los recitadores.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, y ausencia total de benchmarks publicados.
- Los resultados de la busqueda web realizada no contenian informacion relevante sobre este modelo (devolvio paginas de contenido para adultos sin relacion), por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahmaher04/quran-reciter-detector
- Licencia: https://huggingface.co/ahmaher04/quran-reciter-detector/blob/main/LICENSE
- Modelo ASR para transcripcion: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Encoder TitaNet-Small ONNX (sherpa-onnx): https://github.com/k2-fsa/sherpa-onnx/releases/download/speaker-recongition-models/nemo_en_titanet_small.onnx
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Nota: la busqueda web no devolvio enlaces relevantes (papers, blogs o demos) sobre este modelo.
