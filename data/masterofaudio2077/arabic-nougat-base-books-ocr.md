# masterofaudio2077/arabic-nougat-base-books-ocr

## Resumen

`arabic-nougat-base-books-ocr` es un modelo de OCR especializado en paginas de libros arabes impresos, desarrollado por el usuario de Hugging Face `masterofaudio2077`. Se trata de un fine-tuning del checkpoint `MohamedRashad/arabic-base-nougat` (349M parametros), que a su vez deriva de la arquitectura Nougat (Swin Transformer como encoder visual y mBART como decoder textual). El modelo recibe una imagen de pagina y devuelve el texto transcrito estructurado en tres bloques: `[HEADER]`, `[BODY]` y `[FOOTNOTES]`, conservando los diacriticos arabes (harakat).

El problema que aborda es concreto: la digitalizacion de fondos bibliograficos arabes clasicos, en particular paginas de tafsir (exegesis coranica) y de la biblioteca Shamela, con frecuencia escaneadas en gris y con tipografia densa. Frente al modelo base, que obtiene un character error rate (CER) de 0,5715 en las paginas originales, este fine-tuning alcanza 0,0092 en el checkpoint publicado (paso 20.000), una mejora de dos ordenes de magnitud. Ademas, incorpora aumentacion de color sintetica desde el paso 15.213 para tolerar paginas tintadas, texto coloreado o fotografias de movil, reduciendo el CER en variantes coloreadas de 0,5999 a 0,0110.

Es relevante ahora porque los modelos OCR especializados en arabe con diacriticos siguen siendo escasos y porque el autor publica un checkpoint intermedio (paso 20.000 de 50.000 previstos), lo que lo convierte en una referencia util pero no definitiva. La licencia Apache 2.0 del modelo contrasta con la licencia CC-BY-NC-ND de los datasets de entrenamiento, un punto que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (encoder Swin Transformer + decoder mBART) |
| Parametros totales | 348.736.012 (349M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 posiciones en el decoder; generacion limitada a 3.200 tokens nuevos; entrada de imagen 896x672 |
| Tipos de cuantizacion | pesos almacenados en fp16; no se documentan otras cuantizaciones (GGUF, int8, etc.) |
| Idiomas soportados | arabe (paginas de libros impresos, arabe clasico con diacriticos) |
| Licencia | Apache 2.0 (modelo); datasets de entrenamiento CC-BY-NC-ND |
| Formato de pesos | safetensors (fp16) |
| Tamano del repositorio | 1,4 GB |
| Pipeline | image-to-text |
| Modelo base | MohamedRashad/arabic-base-nougat |
| Fecha de creacion | 2026-11-01 |

## Arquitectura y entrenamiento

El modelo es un `VisionEncoderDecoderModel` que combina un encoder visual Swin Transformer con un decoder de lenguaje mBART. La imagen de entrada se procesa a traves de `NougatProcessor` con resolucion fija de 896x672 pixeles, y el decoder genera hasta 3.200 tokens nuevos con decodificacion greedy. La salida se normaliza con NFKC y conserva los diacriticos arabes, estructurandose en tres lineas etiquetadas: cabecera, cuerpo y notas al pie. Los pesos se guardan en fp16 tal como los produjo el entrenamiento en el paso 20.000.

El entrenamiento parte del checkpoint `MohamedRashad/arabic-base-nougat` y utiliza dos datasets: `freococo/ocr_arabic_books` (configuracion `tafsir_al_tabari`, unas 16.700 paginas escaneadas) y `freococo/synth_shamela_ocr_arabic_books` (50 libros elegidos aleatoriamente con semilla 0). Cada batch mezcla al 50% paginas de Tabari y paginas sinteticas de Shamela. Las paginas cuyo texto objetivo supera los 3.200 tokens se descartan para que la etiqueta quepa en las 4.096 posiciones del decoder. Desde el paso 15.213 se aplica aumentacion de color sintetica con probabilidad del 70%, usando cuatro recetas (papel tintado, texto coloreado, fondos oscuros y aspecto de foto de movil) antes de las degradaciones habituales, sin modificar las etiquetas. El checkpoint publicado corresponde al paso 20.000 de los 50.000 previstos, por lo que el entrenamiento no ha finalizado.

## Capacidades

- Transcripcion OCR de paginas individuales de libros arabes impresos, con salida estructurada en `[HEADER]`, `[BODY]` y `[FOOTNOTES]`.
- Preservacion de diacriticos arabes (harakat) en el texto generado.
- Manejo de arabe clasico, incluyendo textos de tafsir y de la biblioteca Shamela.
- Tolerancia a paginas coloreadas gracias a la aumentacion sintetica: papel tintado, encabezados y marcos de color, fondos oscuros o saturados y aspecto de fotografia de movil.
- Procesamiento pagina a pagina (una imagen por inferencia); no soporta lotes multi-pagina de forma nativa en el codigo de ejemplo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision mas alla del OCR de pagina, ni audio.
- No soporta otros idiomas ni otras escrituras.

## Casos de uso

- Digitalizacion de fondos de tafsir: el modelo transcribe paginas escaneadas de `tafsir_al_tabari` con un CER de 0,0092, lo que permite generar texto indexable para bibliotecas digitales con revision humana minima en las secciones de cuerpo.
- Reconstruccion de la biblioteca Shamela: las paginas sinteticas de Shamela usadas en entrenamiento hacen que el modelo sea adecuado para convertir lotes de libros clasicos arabes en texto plano estructurado por secciones, facilitando busquedas posteriores.
- Preservacion de textos con diacriticos: al conservar los harakat, es util para ediciones criticas y corpus linguisticos donde la vocalizacion es relevante para el analisis morfologico.
- Procesamiento de escaneos de baja calidad o coloreados: la aumentacion de color permite usar el modelo sobre paginas con papel amarillento, marcos coloreados o fotografias de movil, con un CER de 0,0110 en las variantes coloreadas de prueba.
- Extraccion de notas al pie: la separacion explicita en `[FOOTNOTES]` facilita pipelines que necesitan tratar el aparato critico de forma independiente del cuerpo del texto.
- Digitalizacion asistida en proyectos de humanidades digitales: el modelo puede integrarse en un flujo por pagina con revision humana, dado que su error es bajo pero no nulo y la model card advierte contra usos que exijan exactitud sin revision.
- Prototipado rapido de OCR arabe: al ser un modelo de 349M en fp16 (1,4 GB de repositorio), puede desplegarse en una unica GPU consumer para pruebas de concepto antes de escalar a un pipeline de produccion.

## Benchmarks y rendimiento

Los unicos datos publicados son tasas de error de caracteres (CER) sobre conjuntos de validacion de 16 paginas por pool, con diacriticos incluidos:

| Metrica | Modelo base (sin fine-tuning) | Checkpoint paso 15.000 | Checkpoint paso 20.000 (publicado) |
|---|---|---|---|
| CER en paginas originales | 0,5715 | 0,0090 | 0,0092 |
| CER en variantes coloreadas | no disponible | no disponible | 0,0110 |
| CER en variantes coloreadas antes del entrenamiento con color | no disponible | 0,5999 | 0,5999 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es esperable en un modelo de OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB solo para pesos en fp16, mas memoria para activaciones del encoder Swin y del decoder mBART; en la practica, entre 2 y 4 GB de VRAM para una pagina de 896x672.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para procesamiento por lotes de muchas paginas, una A100 o H100 mejora el throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas; tambien puede ejecutarse en CPU en fp32, con mayor latencia.
- Opciones de despliegue: `transformers` con `VisionEncoderDecoderModel` y `NougatProcessor` (unico flujo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el formato safetensors fp16 no es directamente compatible con llama.cpp sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arabic-nougat-base-books-ocr | 349M | 4.096 posiciones (3.200 tokens de salida) | arabe | Apache 2.0 | Hugging Face |
| MohamedRashad/arabic-base-nougat | no disponible | no disponible | arabe | no disponible | Hugging Face |
| Nougat original (Meta) | no disponible | no disponible | principalmente ingles y ciencia | no disponible | Hugging Face |
| Otros OCR arabes especializados | no disponible | no disponible | arabe | no disponible | no disponible |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; solo se conoce el CER del modelo base (0,5715) frente al fine-tuning (0,0092), que muestra la mejora relativa pero no permite situar el modelo frente a terceros.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 20.000 de 50.000 planificados; el autor indica que el paso 15.000 obtuvo mejor CER en paginas originales (0,0090 frente a 0,0092), por lo que el checkpoint publicado no es necesariamente el mejor hasta la fecha.
- Fuera de alcance: escritura manuscrita, tablas, disenos multicolumna, documentos que no sean libros y otras escrituras distintas del arabe.
- Paginas muy densas sin probar: las que requeririan mas de 3.200 tokens de transcripcion se eliminaron del entrenamiento y de la evaluacion.
- La aumentacion de color se entreno con paginas simuladas; las variantes coloreadas de evaluacion tambien son sinteticas, por lo que el rendimiento en fotografias reales de movil no esta validado de forma independiente.
- Riesgo de error residual: el CER de 0,0092 implica que aproximadamente 1 de cada 100 caracteres puede ser incorrecto; la model card advierte explicitamente contra usos que dependan de exactitud sin revision humana.
- Sesgos: al entrenarse solo con textos de tafsir y Shamela, el modelo puede tener sesgo hacia el vocabulario y la tipografia de esos corpus, con peor rendimiento en otros generos o epocas.
- Licencia: el modelo es Apache 2.0, pero los datasets de entrenamiento son CC-BY-NC-ND; conviene verificar la compatibilidad antes de un uso comercial, especialmente si se redistribuyen derivados.
- Sin soporte documentado para cuantizacion GGUF ni para motores de inferencia de alto rendimiento, lo que limita su integracion en pipelines de produccion a gran escala.
- Un solo idioma: no se debe esperar ningun rendimiento en arabe dialectal manuscrito ni en texto impreso con tipografias no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masterofaudio2077/arabic-nougat-base-books-ocr
- Modelo base: https://huggingface.co/MohamedRashad/arabic-base-nougat
- Dataset de paginas escaneadas de Tabari: https://huggingface.co/datasets/freococo/ocr_arabic_books
- Dataset sintetico de Shamela: https://huggingface.co/datasets/freococo/synth_shamela_ocr_arabic_books
- Paper de referencia Nougat (arXiv:2308.13418): https://arxiv.org/abs/2308.13418
