# Mythologic/mark

## Resumen

Mark-38M es un modelo de clasificación de tokens de 38,7 millones de parámetros desarrollado por Mythologic que restaura diacríticos, tonos y signos de vocalización en 37 idiomas. A diferencia de los enfoques basados en tokenizadores subword (BPE, WordPiece), opera directamente sobre los 256 valores de byte UTF-8 y asigna a cada byte de entrada una etiqueta de un vocabulario discreto de 1.073 operaciones: `KEEP` (mantener), `P:src->dst` (sustituir un carácter) y `M:hex` (adjuntar marcas diacríticas combinantes con normalización NFC). El modelo no es generativo en el sentido habitual: no produce texto libre, sino una secuencia de operaciones alineada 1 a 1 con la entrada.

El problema que resuelve es la ambigüedad morfológica y sintáctica que aparece cuando un texto se escribe sin marcas. En lenguas tonales como el yorùbá, una sílaba sin marcar (`ba`) puede corresponder a `bá`, `bà` o `ba`, y la ausencia de tono invierte negación, tiempo y aspecto. En abjads como el árabe o el hebreo moderno, el esqueleto consonántico llega sin vocales breves ni nunación, de modo que la voz y el caso deben deducirse del contexto. En ortografías latinas como el español, el francés, el portugués o el vietnamita, los diacríticos distinguen tiempos verbales y fonemas.

Su relevancia actual está en el despliegue en dispositivo: el modelo se exporta a un grafo ONNX INT8 de 41,75 MB para CPU y WebAssembly, y a un paquete Core ML compilado para el Apple Neural Engine. La cuantización INT8 mantiene un 99,40 % de paridad de caracteres con PyTorch en precisión completa sobre 828 caracteres de evaluación. En el conjunto de test académico Yorùbá YAD (3.330 frases) obtiene un 15,88 % de DER, un 19,38 % de WER y un 5,58 % de CER, con una latencia de 50,07 ms por frase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conv-Transformer a nivel de byte (byte-level Conv-Transformer) |
| Parametros totales | 38,7 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (grafo ONNX de 41,75 MB); pesos en precision completa en PyTorch; paquete Core ML compilado |
| Idiomas soportados | 37: ak, ar, az, ca, cs, cy, ee, es, ff, fr, ga, gn, ha, he, hr, ht, hu, ig, ku, ln, lt, lv, mi, pl, pt, qu, ro, sk, sl, sm, sr, tk, tr, uz, vi, wo, yo |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch/safetensors (tamano de repo 0,7 GB), ONNX INT8, Core ML |
| Tarea (pipeline) | token-classification |
| Vocabulario de salida | 1.073 etiquetas de operacion (`KEEP`, `P:src->dst`, `M:hex`) |
| Unidad de entrada | byte UTF-8 (256 valores posibles) |
| Descargas / likes en HuggingFace | 0 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un Conv-Transformer que trabaja a nivel de byte, sin tokenizador subword ni consultas a diccionario. La eleccion de bytes en lugar de subpalabras responde a tres problemas concretos del texto diacritizado: la entrada sin marcar y la salida marcada comparten caracteres base pero difieren en secuencias de bytes; las formas de normalizacion Unicode (NFC precompuesta frente a NFD descompuesta) fragmentan los diacríticos combinantes en tokens huerfanos y multiplican la longitud de secuencia de forma impredecible; y los vocabularios subword no generalizan a pilas de tonos combinantes poco frecuentes (por ejemplo `M:0300+0301`).

La salida se formula como clasificacion de etiquetas de operacion por byte, con tres familias: mantener el byte, sustituir un carácter por otro marcado, o adjuntar marcas diacriticas combinantes de Unicode con normalizacion canonica. De ahi se deriva la garantia estructural del modelo: cada carácter de salida se mapea 1 a 1 con el flujo de entrada, por lo que el modelo no puede insertar, eliminar ni reordenar palabras base. El numero de tokens de entrenamiento, la composicion exacta del dataset y el uso de RLHF o DPO no se documentan en la informacion disponible.

## Capacidades

- Restauracion de diacriticos, tonos y vocalizacion en 37 idiomas, agrupados en tres familias: lenguas tonales (yorùbá, akan, ewe, igbo, lingala), abjads (arabe, hebreo moderno) y ortografias latinas (espanol, frances, portugues, turco, checo, polaco, vietnamita, rumano, entre otras).
- Clasificacion de tokens a nivel de byte sobre los 256 valores UTF-8, con un vocabulario de salida de 1.073 etiquetas de operacion.
- Garantia de invariante: alineacion 1 a 1 entre entrada y salida, sin insercion, borrado ni reordenacion de palabras base. El modelo es estructuralmente incapaz de inventar texto.
- Normalizacion Unicode mediante descomposicion y composicion canonica (NFC).
- Funcionamiento sin tokenizador subword y sin consultas a diccionario.
- Ejecucion en dispositivo: grafo ONNX INT8 para CPU y WebAssembly, y paquete Core ML para el Apple Neural Engine.
- Resolucion contextual de casos y tiempos: por ejemplo, distincion entre `comio` y `comió` en espanol, o entre voz activa y pasiva en arabe.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion libre de texto: es un modelo especializado de etiquetado.

## Casos de uso

- Normalizacion de corpus para PNL en lenguas tonales: antes de entrenar modelos de traduccion, analisis sintactico o reconocimiento de entidades sobre yorùbá, akan o ewe, se aplica Mark-38M para recuperar tonos y diacriticos y reducir la ambiguedad lexica del corpus de partida.
- Preprocesado en pipelines de texto a voz: la sintesis de lenguas tonales necesita las marcas de tono para pronunciar correctamente; el modelo las restaura en el texto de entrada del sintetizador sin introducir palabras nuevas, algo critico cuando el texto de origen ya viene sin marcar.
- Metodos de entrada y teclados en movil: con 41,75 MB en INT8 y ejecucion en el Apple Neural Engine, el modelo cabe en un teclado iOS y puede sugerir la vocalizacion correcta mientras el usuario teclea texto sin marcas.
- Edicion y correccion editorial en lenguas con diacriticos: revision de textos en frances, portugues, vietnamita o rumano para detectar y restaurar diacriticos omitidos, con la garantia de que no se alterara ninguna palabra mas alla de la marca anadida.
- Busqueda y recuperacion de informacion: normalizar tanto las consultas como el indice a la forma marcada permite que una busqueda escrita sin acentos encuentre documentos que si los llevan, evitando fallos de concordancia entre formas como `comio` y `comió`.
- Preservacion digital de lenguas minorizadas: digitalizacion de textos en guaraní, maori, samoado o quechua donde la ortografia marcada es un requisito de fidelidad documental; el invariante de no invencion reduce el riesgo de introducir formas inexistentes en el archivo.
- Aplicaciones web sin conexion mediante WebAssembly: al exportarse a ONNX para WASM, el modelo puede ejecutarse integramente en el navegador del cliente, lo que evita enviar texto de usuario a un servidor.
- Aumento de datos para entrenamiento: generar pares (texto sin marcar, texto marcado) de forma controlada a partir de corpus marcados, invirtiendo el modelo o usandolo como anotador previo a revision humana.

## Benchmarks y rendimiento

Conjunto de test oficial Yorùbá YAD (3.330 frases, 142.000 caracteres; Asahiah et al., Orife, arXiv:2004.14811):

| Sistema | DER | WER | CER | Corrupcion / invencion | Latencia |
|---|---|---|---|---|---|
| Mark-38M | 15,88 % | 19,38 % | 5,58 % | 0,0139 % | 50,07 ms/frase |
| Entrada sin marcar (linea base de identidad) | 69,10 % | 78,40 % | 21,20 % | 0,0000 % | no disponible |
| Mejora absoluta | -53,22 pp | -59,02 pp | -15,62 pp | sin deriva de texto | 20 frases/s en Apple Silicon |

Evaluacion conjunta en 37 idiomas (informe de posiciones marcadas; el extracto disponible esta truncado y no incluye todos los idiomas):

| Codigo | Idioma | Precision en posicion marcada | Codigo | Idioma | Precision en posicion marcada |
|---|---|---|---|---|---|
| az | Azerbaiyano | 99,65 % | ee | Ewe | 97,39 % |
| fr | Frances | 99,47 % | sl | Esloveno | 97,39 % |
| tr | Turco | 99,02 % | sk | Eslovaco | 97,21 % |
| es | Espanol | 98,22 % | lv | Leton | 96,86 % |
| pt | Portugues | 98,09 % | ku | Kurdo (kurmanji) | 96,51 % |
| ga | Irlandes | 98,07 % | ig | Igbo | 96,30 % |
| sr | Serbio | 98,07 % | hu | Hungaro | 95,60 % |
| pl | Polaco | 97,89 % | cs | Checo | 95,47 % |
| ak | Akan (twi) | 97,88 % | ht | Criollo haitiano | 95,47 % |
| hr | Croata | 97,84 % | ar | Arabe | 94,86 % |
| tk | Turkmeno | 97,80 % | ca | Catalan | 94,85 % |
| lt | Lituano | 97,79 % | wo | Wolof | 93,07 % |
| ro | Rumano | 97,41 % | ha | Hausa | 92,18 % |
| vi | Vietnamita | 90,98 % | sm | Samoado | 90,98 % |
| gn | Guarani | 88,61 % | qu | Quechua | truncado en el extracto disponible |

Agregados declarados por el autor para la suite conjunta de 37 idiomas: 93,69 % de precision macro en posiciones marcadas y una puntuacion compuesta de 0,8419. Trece idiomas alcanzan 100 % de coincidencia exacta y 0,00 % de CER en las pruebas de referencia. No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a esta tarea. Los valores de DER, WER, CER y latencia proceden de la model card del autor y no se han verificado de forma independiente en la informacion disponible.

## Requisitos de hardware

- El modelo no necesita GPU para inferencia: el grafo ONNX INT8 ocupa 41,75 MB y esta pensado para CPU y WebAssembly.
- En Core ML se ejecuta en el Apple Neural Engine de los chips de Apple; la model card reporta 50,07 ms por frase y unas 20 frases por segundo en Apple Silicon.
- Estimacion a partir del numero de parametros (no confirmada por el autor): alrededor de 155 MB en FP32 y 77 MB en FP16 solo para los pesos. Con el grafo INT8 suministrado, el consumo es claramente inferior a 1 GB de memoria, por lo que cabe en cualquier GPU de consumo e incluso en dispositivos moviles. Estos calculos son estimaciones derivadas del tamano del modelo, no cifras oficiales.
- Opciones de despliegue: ONNX Runtime (CPU, y `onnxruntime-web` para WebAssembly), Core ML en plataformas Apple, y la pipeline `token-classification` de la libreria Transformers para los pesos PyTorch.
- vLLM, TGI o llama.cpp no son vias de despliegue adecuadas para este modelo: no es un modelo generativo autoregresivo de texto, sino un etiquetador de tokens.
- No se publican cifras de throughput en GPU en la informacion disponible.

## Comparativa con modelos similares

No hay datos de comparacion con modelos alternativos en la informacion proporcionada. La model card unicamente compara el modelo con la linea base de identidad (entrada sin marcar), que no es un sistema de restauracion sino la ausencia de procesamiento. Los datos disponibles son los siguientes:

| Sistema | Parametros | Contexto | DER (YAD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mark-38M | 38,7 M | no disponible | 15,88 % | Apache-2.0 | ONNX INT8, Core ML, PyTorch |
| Entrada sin marcar (linea base) | no aplica | no aplica | 69,10 % | no aplica | no aplica |
| Otros restauradores de diacriticos para yorùbá u otras lenguas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento desigual por idioma: la precision en posicion marcada baja hasta el 88,61 % en guarani, el 90,98 % en vietnamita y samoado, el 92,18 % en hausa y el 93,07 % en wolof, frente a valores superiores al 99 % en azerbaiyano, frances y turco. En esos idiomas conviene medir el error sobre el dominio concreto antes de usarlo en produccion.
- La cifra de 0,0139 % de corrupcion en el test YAD no es cero: aunque el diseno 1 a 1 impide insertar o borrar palabras, sigue existiendo un margen residual de sustituciones erroneas. El invariante protege frente a la invencion de texto, no frente a marcar mal.
- Los resultados de la model card proceden del autor y no se han verificado de forma independiente en la informacion disponible. No se documenta un conjunto de validacion externo mas alla del test YAD.
- El informe de 37 idiomas aparece truncado en la informacion disponible: faltan los valores de cy, ff, he, ln, mi, uz, yo y qu, de modo que no puede confirmarse el rendimiento en esos idiomas.
- No es un modelo de proposito general: no genera texto libre, no razona en varios pasos, no soporta tool calling ni procesa imagenes o audio. Usarlo fuera de la tarea de etiquetado de bytes no tiene sentido.
- No se documentan sesgos especificos ni la composicion del dataset de entrenamiento, lo que dificulta evaluar la cobertura dialectal dentro de cada idioma (por ejemplo, variantes del arabe o del kurdo).
- No se especifica la longitud de contexto soportada ni como se segmentan textos largos, un dato relevante para procesar documentos completos.
- La licencia Apache-2.0 permite uso comercial y modificacion con obligacion de conservar el aviso de licencia y el fichero NOTICE si existe. No se declaran restricciones adicionales de uso.
- El repositorio tiene 0 descargas y 1 like en el momento de redactar esta ficha, por lo que la validacion por parte de la comunidad es practicamente nula.
- La busqueda web realizada no devolvio ningun recurso tecnico relevante sobre el modelo: los resultados obtenidos eran contenido no relacionado y no se han incluido como fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mythologic/mark
- Paper del corpus Yorùbá YAD (Asahiah et al., Orife): https://arxiv.org/abs/2004.14811
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada.
