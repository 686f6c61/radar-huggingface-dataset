# kobimusic/copista-28m

## Resumen

copista-28m es un modelo de reconocimiento optico de partituras (optical music recognition, OMR) desarrollado por KobiMusic. Su funcion es convertir una imagen de una pagina de musica impresa o manuscrita (escaneo en PNG o JPEG, o bien PDF) en un fichero MusicXML editable. Se trata de un sistema de dos etapas: un detector de simbolos de 28,7 millones de parametros que localiza cada simbolo de notacion sobre la pagina (270 clases) junto con los atributos de las cabezas de nota, y un modelo de evidencia de 2,03 millones de parametros que relee cada simbolo en el contexto de la pagina completa. En total, 30,7 millones de parametros.

La propuesta diferencial del modelo es su enfasis en escaneos reales. Segun la model card, copista esta disenado para digitalizaciones autenticas de ediciones de los siglos XIX y XX, un terreno donde otros sistemas fallan con frecuencia, y no solo para renders sinteticos. Los resultados publicados por el autor asi lo reflejan: una tasa de error del 8,7 % en cuartetos de cuerda escaneados, frente al 31,6 % de Legato 2, el 58,2 % de Legato y el 66,9 % de Audiveris. Tambien acepta algunas partituras manuscritas, aunque el propio autor advierte que si una persona tiene dificultades para leer una pagina, el modelo tambien las tendra.

El modelo se distribuye unicamente como pesos PyTorch que se ejecutan a traves del lector copisteria, un proyecto de codigo abierto alojado en GitHub. No se especifica licencia en la informacion disponible, y el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha. Tiene un hermano menor, copista-2m, con un detector de 1,94 millones de parametros (unos 4,0 millones en total) y un rendimiento ligeramente inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de simbolos (28,7 M de parametros, 270 clases) y modelo de evidencia basado en un transformer de 6 capas (ancho 160, 8 cabezas, 2,03 M de parametros) que opera sobre una ventana de sistemas |
| Parametros totales | 30,7 M (28,7 M del detector + 2,03 M del modelo de evidencia) |
| Longitud de contexto | no disponible (el modelo de evidencia opera sobre una ventana de sistemas, no sobre una secuencia de tokens) |
| Tipos de cuantizacion | no disponible (se distribuyen checkpoints PyTorch completos, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (la entrada es una imagen de partitura; el texto de pagina se obtiene mediante un fichero OCR externo) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`state_dict` + `cfg`); detector en `small/v7_obj-recall-30m_best.pt` (28,7 M) y modelo de evidencia en `evidence-2m.pt` (2,03 M) |

## Arquitectura y entrenamiento

El sistema combina dos componentes. El primero es un detector de objetos de 28,7 millones de parametros entrenado sobre 87 000 paginas, que localiza cada simbolo de notacion en la pagina (270 clases) y estima los atributos de las cabezas de nota: posicion en el pentagrama, direccion de la plica, puntos y voz. El segundo es el modelo de evidencia, un transformer de 6 capas con ancho 160 y 8 cabezas de atencion, identico en las dos variantes de tamano publicadas, que procesa cada sistema junto con sus vecinos.

El mecanismo de lectura es aditivo sobre las probabilidades del detector: para cada lectura que produce el detector (presencia del simbolo, clase, puntos, posicion en el pentagrama, voz, grace notes), el modelo de evidencia anade evidencia en nats al logaritmo de probabilidad del detector. De este modo, si no hay evidencia contextual, prevalece la lectura del detector. El resto de la informacion (alteracion sonante de cada nota, acorde, ligadura, tresillo y onset) se deduce del contexto. Segun el autor, nadie anoto esas reglas de evidencia de forma explicita: el modelo las aprendio de paginas renderizadas en las que la verdad es conocida. No se especifica en la informacion disponible si hubo entrenamiento con RLHF o DPO, ni la composicion exacta del dataset mas alla del numero de paginas del detector.

## Capacidades

- Deteccion de 270 clases de simbolos de notacion musical sobre escaneos de partituras.
- Estimacion de atributos de cabezas de nota: posicion en el pentagrama, direccion de la plica, puntos y voz.
- Lectura contextual de alteraciones implicitas, compases que cuadran con la indicacion de compas, puntos de repeticion y asignacion de voces.
- Deduccion de la alteracion sonante, el acorde, la ligadura, el tresillo y el onset de cada nota a partir del contexto de la pagina.
- Generacion de MusicXML editable, abrible en MuseScore, Dorico, Finale o Sibelius.
- Salida adicional de un visor HTML por pagina que superpone los simbolos detectados y las lecturas corregidas por contexto, y de un fichero `reading.json` con la lectura de cada simbolo.
- Procesamiento de PDF multipagina mediante el parametro `--range` (requiere poppler instalado).
- Incorporacion opcional de texto de pagina (titulo, compositor, nombres de partes, tempo y expresiones) desde un fichero OCR externo `<page>.texts.json`.
- Lectura parcial de partituras manuscritas.
- Cache de detecciones junto a cada imagen (`<page>.dets_v7_<size>.json`) para acelerar reprocesados.

No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de lenguaje natural.

## Casos de uso

- Digitalizacion de fondos musicales historicos: el modelo esta especificamente orientado a escaneos autenticos de ediciones de los siglos XIX y XX, con tasas de error de un solo digito en cuartetos de cuerda (8,7 %) donde Audiveris se queda en el 66,9 % de error. Es el escenario natural para bibliotecas y archivos con colecciones digitalizadas.
- Re-engraving y edicion profesional: la salida MusicXML abre directamente en MuseScore, Dorico, Finale o Sibelius, lo que permite pasar de un escaneo a una partitura editable sin transcripcion manual, reduciendo el trabajo de copia en editoriales y estudios de grabacion.
- Procesamiento por lotes de PDFs de partituras: el lector acepta `--pdf` con un rango de paginas (`--range 1-12`) y genera un `index.html` con todas las paginas, lo que permite convertir libros o suites completas en una sola ejecucion.
- Music information retrieval sobre corpus musicales: al normalizar cada pagina a MusicXML y disponer de `reading.json` por pagina, se pueden indexar notas, acordes y compases para construir buscadores tematicos o comparadores de ediciones.
- Musicologia computacional: el MusicXML resultante sirve como entrada para analisis armonico, estudio de variantes entre ediciones o analisis estadistico de corpus, ya que el modelo genera explicitamente alteraciones, acordes, ligaduras y tresillos.
- Digitalizacion asistida de manuscritos: aunque con limitaciones, el modelo tolera algunas partituras manuscritas, lo que resulta util como primera pasada para fondos de compositores de los que no existe edicion impresa.
- Generacion de datos de entrenamiento: la conversion masiva de escaneos a MusicXML permite crear pares imagen-partitura etiquetados que alimenten otros sistemas de OMR o de analisis musical.
- Integracion en pipelines de archivo digital: al ser un proceso por linea de comandos en Python con pesos de unos 124 MB, se puede insertar en flujos de ingesta documental que detecten imagenes de partituras y emitan MusicXML de forma automatica.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son las tasas de error de reconocimiento sobre escaneos reales (menor es mejor):

| Conjunto de evaluacion | copista-28m | copista-2m | Legato 2 | Legato | homr | Transcoda | Audiveris |
|---|---|---|---|---|---|---|---|
| Cuartetos de cuerda | 8,7 % | 11,2 % | 31,6 % | 58,2 % | no disponible | no disponible | 66,9 % |
| Lieder (55 paginas) | 17,7 % | 17,8 % | no disponible | no disponible | 42,3 % | 48,4 % | 51,8 % |
| Partituras de piano polacas (solo notas) | 34,4 % | 38,7 % | no disponible | no disponible | 48,3 % | 55,1 % | 62,6 % |

Notas: Legato 2 no esta publicado. En el conjunto de partituras polacas la referencia de verdad solo incluye notas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de lenguaje, dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Memoria en CPU: unos 1,5 GB en modo CPU, arranque incluido, segun la model card.
- Latencia en CPU: aproximadamente 15 segundos por pagina en un CPU de sobremesa.
- Pesos: unos 124 MB en disco entre `models/evidence-2m.pt` y `models/small/v7_obj-recall-30m_best.pt` (el repositorio completo ocupa 0,1 GB).
- VRAM estimada: no se especifica una cifra concreta; dado que los pesos suman 124 MB y el proceso completo en CPU consume 1,5 GB, el modelo cabe holgadamente en cualquier GPU consumer. No hay cifras publicadas de consumo de VRAM en GPU.
- GPU: el modelo usa automaticamente una NVIDIA cuando PyTorch la detecta. No se enumeran modelos recomendados (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Opciones de despliegue: lector copisteria (Python 3.12 o superior, probado en Linux con 3.12 y 3.14) sobre PyTorch y torchvision. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Requisito adicional: poppler para procesar PDF (`poppler-utils` en Debian/Ubuntu, `poppler` en Homebrew).
- Nota operativa: el error `CUDA out of memory` se resuelve seleccionando otra GPU con `CUDA_VISIBLE_DEVICES=1` o forzando CPU con `CUDA_VISIBLE_DEVICES=` vacio.
- Throughput en GPU: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Error en cuartetos de cuerda | Error en Lieder | Error en piano polaco (notas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| copista-28m | 30,7 M (28,7 M detector + 2,03 M evidencia) | Detector de simbolos + modelo de evidencia contextual | 8,7 % | 17,7 % | 34,4 % | no disponible | Publicado en HuggingFace |
| copista-2m | ~4,0 M (1,94 M detector + 2,03 M evidencia) | Mismo pipeline, detector mas pequeno | 11,2 % | 17,8 % | 38,7 % | no disponible | Publicado en HuggingFace |
| Legato | no disponible | OMR | 58,2 % | no disponible | no disponible | no disponible | Publicado |
| Legato 2 | no disponible | OMR | 31,6 % | no disponible | no disponible | no disponible | No publicado |
| homr | no disponible | OMR | no disponible | 42,3 % | 48,3 % | no disponible | Publicado |
| Transcoda | no disponible | OMR | no disponible | 48,4 % | 55,1 % | no disponible | Publicado |
| Audiveris | no disponible | OMR | 66,9 % | 51,8 % | 62,6 % | no disponible | Publicado |

La comparativa disponible se limita a tasas de error; no se han publicado el numero de parametros, la longitud de contexto ni las licencias de los sistemas alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: la model card no indica licencia, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor antes de cualquier despliegue en produccion.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa independiente de los resultados publicados por el propio autor.
- Sesgo hacia material impreso: el modelo esta entrenado y optimizado para escaneos de ediciones de los siglos XIX y XX. El rendimiento en manuscritos es parcial, y el autor advierte que si una persona no consigue leer una pagina, el modelo tampoco.
- Rendimiento desigual por repertorio: la tasa de error sube del 8,7 % en cuartetos de cuerda al 34,4 % en partituras de piano polacas (y este ultimo conjunto solo evalua notas), lo que indica una calidad dependiente del tipo de fuente y de la densidad de notacion.
- Riesgo de lectura plausible pero incorrecta: el modelo de evidencia modifica las lecturas del detector sumando evidencia contextual en nats, de modo que puede imponer interpretaciones coherentes con el contexto que no coincidan con el original. En notacion musical, un error de alteracion o de ligadura es silencioso y dificil de detectar sin revision humana.
- Dependencia de ficheros auxiliares: el texto de pagina (titulo, compositor, tempo) solo se incorpora si existe un `<page>.texts.json` generado por OCR; sin el, la musica se lee igual pero se pierde toda la informacion textual.
- Requisitos de ejecucion estrictos: hay que lanzar el pipeline desde la raiz del repositorio (el directorio con `pyproject.toml`), o se produce un `FileNotFoundError` en `models/...`. Los PDF requieren poppler instalado.
- Sin capacidades de lenguaje natural: no hay soporte documentado de tool calling, agentes ni razonamiento multi-paso, y la fila de idiomas soportados queda como no disponible. No debe evaluarse como un modelo de lenguaje.
- Conflictos de GPU: si otro proceso ocupa la GPU se produce `CUDA out of memory`; es necesario seleccionar otro dispositivo o forzar la ejecucion en CPU.
- Sin datos de sesgo publicados: no hay informacion disponible sobre sesgos sistematicos por tipo de notacion, idioma de las indicaciones o epoca de las ediciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kobimusic/copista-28m
- Modelo hermano copista-2m: https://huggingface.co/kobimusic/copista-2m
- Coleccion copista: https://huggingface.co/collections/kobimusic/copista-6ac3033f1a779b0c63ad41a9
- Codigo del lector copisteria: https://github.com/kobimusic/copisteria
- Documentacion de arquitectura del lector (referenciada en la model card como `docs/ARCHITECTURE.md` dentro del repositorio): https://github.com/kobimusic/copisteria
- Web del autor: https://kobi.music/
- Perfil de GitHub del autor: https://github.com/kobimusic
- Paper referenciado en las etiquetas del modelo: https://arxiv.org/abs/2506.19065
- Paper referenciado en las etiquetas del modelo: https://arxiv.org/abs/2607.05769
