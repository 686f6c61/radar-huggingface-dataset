# kobimusic/copista-2m

## Resumen

copista-2m es un modelo de reconocimiento óptico de partituras (optical music recognition, OMR) desarrollado por KobiMusic. Su tarea es convertir una página escaneada de música notada en MusicXML listo para editar. No es un modelo de lenguaje generativo: es un sistema de imagen a texto especializado, empaquetado en dos componentes que suman aproximadamente 4,0 M de parámetros. El primero es un detector de símbolos de 1,94 M de parámetros que localiza cada símbolo de notación sobre la página (270 clases, más atributos de las cabezas de nota). El segundo es un modelo de evidencia de 2,03 M de parámetros que lee cada símbolo en el contexto de la página completa.

La innovación principal es ese modelo de evidencia: en lugar de fiarse de la detección símbolo a símbolo, añade evidencia en nats sobre la log-probabilidad que ya produce el detector, corrigiendo lecturas contradictorias con el contexto global (una alteración que contradice la armadura, un compás cuyos valores no suman los tres tiempos de un 4/4, el puntillo de una repetición, la voz que actúa como primera). Ese conocimiento no está codificado a mano: se aprendió de páginas renderizadas donde la transcripción verdadera es conocida. El modelo está afinado para escaneos reales de ediciones de los siglos XIX y XX, donde otros sistemas fallan, y funciona de forma limitada con partituras manuscritas.

Su relevancia actual radica en que compite en precisión con sistemas mucho mayores y con aplicaciones comerciales o de código abierto consolidadas (Audiveris, homr, Transcoda, Legato), manteniendo un coste de ejecución mínimo: unos 16 MB de pesos, alrededor de 5 segundos por página en CPU y menos de 1,1 GB de memoria, con lo que cabe en un portátil sin GPU. Tiene un hermano mayor, copista-28m, con un detector de 28,7 M de parámetros (30,7 M en total) y mejor precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: detector de símbolos (1,94 M de parámetros) más modelo de evidencia de tipo transformer de 6 capas (ancho 160, 8 cabezas). La arquitectura interna del detector no se detalla en la información disponible |
| Parametros totales | Aproximadamente 4,0 M (1,94 M del detector más 2,03 M del modelo de evidencia) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el sentido de ventana de tokens; el modelo de evidencia opera sobre una ventana de sistemas |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de imagen a notación musical, no de lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | Checkpoints de PyTorch (`.pt`). `evidence-2m.pt` es un diccionario `{"model": state_dict, "cfg": {...}}`; el detector es `small/v7_obj-recall_best.pt` |

## Arquitectura y entrenamiento

copista-2m se organiza en dos etapas. Un front end convierte las cajas del detector en símbolos situados sobre pentagramas y dentro de compases, a partir de la tinta de la página, y decide qué zonas no contienen música. El detector de 1,94 M de parámetros identifica cada símbolo entre 270 clases y también sus atributos (posición en el pentagrama, puntillos, voz, grace notes). Después, el modelo de evidencia de 2,03 M de parámetros, un transformer de 6 capas con ancho 160 y 8 cabezas, lee cada sistema junto con sus vecinos y añade evidencia en nats sobre la log-probabilidad propia del detector. El resto de la información se infiere del contexto: la alteración sonora de cada nota, el acorde, la ligadura, el tresillo y el onset dentro del compás, además de la clave, la tonalidad y el compás de cada compasillo.

Sobre los datos de entrenamiento, la información disponible indica que el modelo de evidencia aprendió de páginas renderizadas en las que la transcripción verdadera es conocida, sin que el autor detalle el número de tokens ni la composición exacta del dataset. No se menciona uso de RLHF ni DPO, que no aplicarían a este tipo de modelo. La innovación técnica destacable es el propio mecanismo de evidencia acumulada, que permite al sistema corregir errores locales de detección usando coherencia global de la página. El modelo comparte el modelo de evidencia con copista-28m: solo cambia el detector, más grande en la versión de 28 M.

## Capacidades

- Reconocimiento óptico de partituras impresas: convierte escaneos e imágenes (PNG, JPEG) de música notada en MusicXML.
- Procesamiento de PDF multipágina, con soporte de rangos de páginas (requiere poppler).
- Detección de 270 clases de símbolos de notación, más atributos de las cabezas de nota.
- Inferencia de contexto musical: alteraciones sonoras, acordes, ligaduras, tresillos, onsets, claves, tonalidades y compases.
- Buen rendimiento en escaneos reales de ediciones de los siglos XIX y XX, no solo en renders sintéticos.
- Funciona con algunas partituras manuscritas, con limitaciones reconocidas por el autor.
- Salida en MusicXML, compatible con MuseScore, Dorico, Finale y Sibelius.
- Generación de visor HTML por página (el escaneo con cada símbolo marcado, las lecturas que el contexto cambió y la partitura grabada) y de un `reading.json` con la lectura de cada símbolo.
- Incorporación de texto de página (título, compositor, nombres de partes, indicaciones de tempo y expresión) a partir de un fichero OCR externo (`<page>.texts.json`); sin él, la música se lee igual y el texto se omite.
- No dispone de tool calling ni de capacidades de agente: es un pipeline de visión especializado.

## Casos de uso

- Digitalización de archivos musicales históricos: bibliotecas y archivos con ediciones de los siglos XIX y XX pueden convertir sus fondos escaneados a MusicXML. El modelo está específicamente afinado para este tipo de escaneo, donde sistemas como Audiveris o Legato degradan notablemente.
- Edición y reimpresión de partituras: el MusicXML de salida se abre directamente en MuseScore, Dorico, Finale o Sibelius, lo que permite corregir, maquetar y reimprimir sin transcripción manual previa.
- Investigación musicológica a escala: análisis de corpus completos (por ejemplo, cuartetos de cuerda o lieder) generando representaciones simbólicas procesables de forma masiva, aprovechando el bajo coste por página.
- Reproducción y producción musical: convertir partituras escaneadas en MusicXML para importarlas en DAW, sintetizadores y flujos de generación de audio.
- Verificación de manuscritos y ediciones: uso del visor HTML y de `reading.json` para auditar qué símbolos fueron leídos y qué lecturas cambió el contexto, útil en proyectos de edición crítica.
- Preprocesado documental combinado: emparejar el reconocimiento musical con el fichero de textos OCR de la página para obtener título, compositor e indicaciones de expresión junto a la notación.
- Docencia y materiales educativos: digitalizar repertorio de estudio para generar ejercicios interactivos, transposiciones o versiones simplificadas en formato MusicXML.
- Integración en pipelines locales: al ejecutarse en CPU en unos 5 segundos por página y menos de 1,1 GB de memoria, se puede desplegar en un portátil o en un contenedor modesto sin GPU.

## Benchmarks y rendimiento

La model card publica tasas de error en páginas escaneadas (menor es mejor). Legato 2 no está publicado en el momento de redactar esta ficha.

| Corpus | copista-2m | copista-28m | homr | Transcoda | Audiveris | Legato | Legato 2 |
|---|---|---|---|---|---|---|---|
| Cuartetos de cuerda | 11,2 % | 8,7 % | No disponible | No disponible | 66,9 % | 58,2 % | 31,6 % |
| Lieder (55 páginas) | 17,8 % | 17,7 % | 42,3 % | 48,4 % | 51,8 % | No disponible | No disponible |
| Partituras polacas para piano (solo notas como ground truth) | 38,7 % | 34,4 % | 48,3 % | 55,1 % | 62,6 % | No disponible | No disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de reconocimiento de partituras y no de lenguaje.

## Requisitos de hardware

- Pesos: aproximadamente 16 MB en total (`evidence-2m.pt` y `small/v7_obj-recall_best.pt`).
- VRAM estimada para inferencia: no disponible de forma explícita; el sistema funciona sin GPU.
- CPU: una página tarda alrededor de 5 segundos y consume menos de 1,1 GB de memoria, incluyendo el arranque. Es suficiente un portátil.
- GPU: si PyTorch detecta una GPU NVIDIA, se usa automáticamente. No se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información disponible.
- Cabe sobradamente en cualquier GPU de consumo y en equipos sin GPU dedicada.
- Opciones de despliegue: el lector `copisteria` (repositorio de GitHub), con Python 3.12 o superior (probado en Linux con 3.12 y 3.14). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de pipeline. Los PDF requieren poppler.
- Latencia y throughput: no se publican cifras de throughput más allá de los ~5 segundos por página en CPU. Las detecciones se cachean junto a cada imagen (`<page>.dets_v7small_<size>.json`), por lo que releer una página es más rápido.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Cuartetos de cuerda (error) | Lieder (error) | Piano polaco (error) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| copista-2m | ~4,0 M | OMR imagen a MusicXML | 11,2 % | 17,8 % | 38,7 % | No disponible | HuggingFace y GitHub |
| copista-28m | ~30,7 M | OMR imagen a MusicXML | 8,7 % | 17,7 % | 34,4 % | No disponible | HuggingFace y GitHub |
| homr | No disponible | OMR imagen a MusicXML | No disponible | 42,3 % | 48,3 % | No disponible | No disponible |
| Transcoda | No disponible | OMR imagen a MusicXML | No disponible | 48,4 % | 55,1 % | No disponible | No disponible |
| Audiveris | No disponible | OMR imagen a MusicXML | 66,9 % | 51,8 % | 62,6 % | No disponible | No disponible |
| Legato | No disponible | OMR imagen a MusicXML | 58,2 % | No disponible | No disponible | No disponible | No disponible |
| Legato 2 | No disponible | OMR imagen a MusicXML | 31,6 % | No disponible | No disponible | No disponible | No publicado |

La comparativa se limita a las cifras de error publicadas por el autor; no se dispone de datos de parámetros, contexto ni licencia de los sistemas alternativos en la información proporcionada. La ventaja de copista-2m es su precisión relativa con un tamaño muy reducido, mientras que copista-28m mejora entre 2,5 y 4,3 puntos porcentuales según el corpus.

## Limitaciones y advertencias

- Tasa de error no despreciable: 11,2 % en cuartetos de cuerda, 17,8 % en lieder y hasta 38,7 % en partituras polacas para piano cuando solo se evalúan las notas. En producción hay que prever revisión y corrección manual.
- Rendimiento limitado en manuscritos: el autor reconoce que funciona para algunas partituras escritas a mano, pero si una persona tiene dificultades para leer la página, el modelo también las tendrá.
- El texto de la página (título, compositor, partes, tempo) no se reconoce por sí solo: depende de un fichero OCR externo (`<page>.texts.json`). Sin él, la música se transcribe pero el texto se pierde.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas no declarados; no aplica como modelo multilingüe, pero tampoco hay información sobre notación o convenciones regionales específicas.
- Metadatos de adopción mínimos: 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un modelo muy reciente y poco validado por terceros.
- Dependencia de un pipeline concreto (`copisteria`) y de Python 3.12 o superior; los PDF requieren poppler instalado aparte.
- Riesgo de error de reconocimiento con 270 clases fijas de símbolos: notaciones muy heterodoxas o ediciones con tipografía inusual pueden quedar fuera del dominio cubierto.
- En caso de error `CUDA out of memory`, el autor sugiere cambiar de GPU con `CUDA_VISIBLE_DEVICES` o ejecutar en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kobimusic/copista-2m
- Modelo hermano copista-28m: https://huggingface.co/kobimusic/copista-28m
- Colección copista: https://huggingface.co/collections/kobimusic/copista-6ac3033f1a779b0c63ad41a9
- Código del lector copisteria: https://github.com/kobimusic/copisteria
- Web del autor: https://kobi.music/
- Página de investigación del autor: https://kobi.music/research
- Paper citado (arXiv 2506.19065): https://arxiv.org/abs/2506.19065
- Paper citado (arXiv 2607.05769): https://arxiv.org/abs/2607.05769
