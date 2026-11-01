# masterofaudio2077/arabic-nougat-base-books-ocr

## Resumen

`arabic-nougat-base-books-ocr` es un modelo de OCR especializado en paginas de libros arabes impresos, desarrollado por el usuario de HuggingFace `masterofaudio2077`. Se trata de un fine-tune completo de `MohamedRashad/arabic-base-nougat` (349M parametros), que a su vez deriva de la arquitectura Nougat presentada en el paper "Nougat: Neural Optical Understanding for Academic Documents" (arXiv:2308.13418). El modelo convierte una imagen de pagina escaneada en texto estructurado con tres secciones explicitas: `[HEADER]`, `[BODY]` y `[FOOTNOTES]`, conservando las diacriticas del arabe clasico.

La relevancia del modelo radica en su especializacion: frente a OCR genericos multilingues, este checkpoint esta entrenado especificamente sobre paginas de tafsir (exegesis coranica) escaneadas y paginas sinteticas del corpus Shamela, lo que le permite manejar la tipografia y la estructura de libros arabes clasicos. El autor reporta una tasa de error de caracteres (CER) de 0.0090 en el checkpoint del paso 15.000, frente a 0.5715 del modelo base sin fine-tune.

Es importante senalar que se trata de un **checkpoint intermedio**: solo se han completado 15.000 de los 50.000 pasos de entrenamiento previstos, por lo que el modelo no ha alcanzado su estado final. Los pesos se distribuyen en fp16 y el repositorio ocupa 0,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (encoder Swin + decoder mBART) |
| Parametros totales | 348.736.012 (349M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 posiciones en el decoder; entrenamiento filtrado a 3.200 tokens de salida |
| Tipos de cuantizacion | no disponible (pesos en fp16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Arabe (paginas de libros impresos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Nougat: un `VisionEncoderDecoderModel` compuesto por un encoder visual Swin y un decoder de lenguaje mBART. La entrada se procesa a traves de `NougatProcessor` con resolucion fija de 896x672 pixeles, y la salida se genera con decodificacion greedy hasta un maximo de 3.200 tokens nuevos. El texto de destino se normaliza con NFKC, conserva las diacriticas arabes y se estructura en tres lineas etiquetadas (`[HEADER]`, `[BODY]`, `[FOOTNOTES]`).

El entrenamiento consistio en un fine-tune completo de los 349M parametros con un bucle personalizado de PyTorch sobre dos GPUs en DDP. Los datos combinan `freococo/ocr_arabic_books` (config `tafsir_al_tabari`, unas 16.700 paginas escaneadas) y `freococo/synth_shamela_ocr_arabic_books` (50 libros sinteticos elegidos aleatoriamente con semilla 0), en proporcion 50/50 por lote. Se aplico aumentacion de imagen simulando degradacion de escaneo y reemplazo aleatorio del 5% de los tokens de entrada del decoder (estilo Nougat) para reducir bucles de repeticion. El optimizador fue Lion con betas (0.9, 0.99), learning rate 1.5e-5, weight decay 0.1 solo en matrices de pesos, 500 pasos de warm-up lineal y decaimiento coseno hasta el 10%. Se uso precision fp16 con pesos maestros en fp32, gradient scaler y gradient checkpointing. Se filtraron las paginas cuya transcripcion superase los 3.200 tokens.

## Capacidades

- Transcripcion de paginas de libros arabes impresos (clasicos, con diacriticas) a texto estructurado en `[HEADER]`, `[BODY]` y `[FOOTNOTES]`.
- Preservacion de diacriticas arabes en la salida, algo poco habitual en OCR genericos.
- Normalizacion Unicode NFKC del texto generado.
- Procesamiento de una pagina por inferencia (image-to-text, no por lotes de documentos completos).
- Generacion con decodificacion greedy y limite de 3.200 tokens nuevos por pagina.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente OCR.
- No soporta vision general, audio ni modo "thinking".
- Capacidad multilingue limitada al arabe; no se documenta soporte de otros alfabetos.

## Casos de uso

- **Digitalizacion de corpus de tafsir**: el modelo esta entrenado especificamente sobre paginas de `tafsir_al_tabari`, por lo que es adecuado para convertir secciones escaneadas de esta obra en texto plano revisable, manteniendo la separacion entre cuerpo, encabezado y notas al pie.
- **Extraccion de texto de libros Shamela**: las paginas sinteticas del corpus Shamela forman la mitad del entrenamiento, lo que permite procesar digitalizaciones de esta biblioteca islamica clasica con estructura homogenea.
- **Preservacion de diacriticas para estudios linguisticos**: al conservar las marcas vocalicas, el modelo sirve para proyectos de linguistica arabe o edicion critica que necesitan el texto vocalizado, no solo el esqueleto consonantico.
- **Pre-procesado para pipelines de busqueda full-text**: la salida estructurada en tres secciones facilita indexar por separado cuerpo y notas al pie en motores de busqueda o bases de datos documentales.
- **Revision asistida de OCR previo**: dado el bajo CER reportado en el checkpoint (0.0090 frente a 0.5715 del base), puede emplearse como segunda pasada sobre transcripciones de baja calidad, siempre con revision humana.
- **Generacion de datasets de entrenamiento**: las transcripciones pueden alimentar la creacion de corpus alineados imagen-texto para futuros fine-tunes de OCR arabe, dado que el modelo produce etiquetas estructuradas y normalizadas.
- **Prototipado de herramientas de lectura accesible**: conversion de paginas escaneadas a texto para lectores de pantalla o sistemas de text-to-speech en arabe, con la cautela de que la salida requiere validacion.

## Benchmarks y rendimiento

| Metrica | Checkpoint (paso 15.000) | Modelo base sin fine-tune |
|---|---|---|
| CER en held-out (diacriticas incluidas, 16 paginas por pool) | 0.0090 | 0.5715 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras de CER proceden de muestras pequenas de dos fuentes concretas y el propio autor advierte que deben interpretarse con cautela.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 349M parametros en fp16, los pesos ocupan aproximadamente 0,7 GB. Con activaciones y procesamiento de imagen a 896x672, la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente; el autor entreno con dos GPUs en DDP (modelo concreto no especificado). Para inferencia, una RTX 3060, RTX 4060 o superior es mas que suficiente.
- **Compatibilidad con GPU consumer**: si, cabe en practicamente cualquier GPU consumer con al menos 4 GB de VRAM, e incluso podria ejecutarse en CPU con pesos en fp32 (mas lento).
- **Opciones de despliegue**: `transformers` con `VisionEncoderDecoderModel` y `NougatProcessor` (metodo documentado por el autor). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser un encoder-decoder vision-language, estas herramientas no son directamente aplicables sin adaptacion.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. La generacion es greedy y secuencial hasta 3.200 tokens, por lo que la latencia dependera del numero de tokens generados por pagina.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| `masterofaudio2077/arabic-nougat-base-books-ocr` | 349M | 4.096 posiciones (salida filtrada a 3.200) | Arabe | Apache 2.0 | Checkpoint intermedio (15k/50k pasos) |
| `MohamedRashad/arabic-base-nougat` | 349M | no disponible | Arabe | no disponible | Modelo base, sin fine-tune especifico de libros |
| Nougat original (Meta) | no disponible en la informacion | no disponible | Principalmente ingles/cientifico | no disponible en la informacion | Modelo de referencia del paper arXiv:2308.13418 |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, salvo la comparacion de CER entre el checkpoint y su base (0.0090 frente a 0.5715). No se han identificado en la informacion otros modelos OCR arabes comparables con especificaciones verificables.

## Limitaciones y advertencias

- **Checkpoint intermedio**: solo se han completado 15.000 de los 50.000 pasos previstos; el modelo no ha terminado su entrenamiento y su comportamiento puede mejorar o cambiar en versiones posteriores.
- **Fuera de alcance**: no maneja escritura manuscrita, tablas, maquetacion multicolumna, documentos que no sean libros ni otros alfabetos distintos del arabe.
- **Paginas densas no evaluadas**: las paginas cuya transcripcion supera los 3.200 tokens fueron eliminadas de entrenamiento y evaluacion, por lo que su rendimiento en paginas muy densas es desconocido.
- **Muestras de evaluacion pequenas**: el CER de 0.0090 se calculo sobre 16 paginas por pool de dos fuentes concretas; no es una estimacion robusta de rendimiento general.
- **Riesgo de alucinacion y bucles**: el autor aplica reemplazo aleatorio de tokens de entrada para reducir bucles de repeticion, lo que sugiere que este es un problema conocido en la arquitectura; la salida debe revisarse siempre.
- **Uso sin revision desaconsejado**: el propio autor indica que cualquier uso que dependa de que el texto sea exacto sin revision queda fuera de alcance.
- **Licencia del modelo Apache 2.0, pero datos de entrenamiento CC-BY-NC-ND**: los datasets `freococo/ocr_arabic_books` y `freococo/synth_shamela_ocr_arabic_books` tienen licencia CC-BY-NC-ND (no comercial, sin derivadas), lo que plantea dudas sobre el uso comercial del modelo derivado pese a la licencia Apache 2.0 de los pesos. Conviene revisar este punto antes de un despliegue en produccion comercial.
- **Sin demo publicada**: el autor marca la demo como "TODO"; no hay espacio de HuggingFace ni endpoint verificado.
- **Cero descargas y cero likes**: el modelo es muy reciente y no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masterofaudio2077/arabic-nougat-base-books-ocr
- Modelo base: https://huggingface.co/MohamedRashad/arabic-base-nougat
- Paper Nougat: https://arxiv.org/abs/2308.13418
- Dataset de tafsir: https://huggingface.co/datasets/freococo/ocr_arabic_books
- Dataset sintetico Shamela: https://huggingface.co/datasets/freococo/synth_shamela_ocr_arabic_books
