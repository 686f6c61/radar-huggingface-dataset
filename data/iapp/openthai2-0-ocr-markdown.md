# iapp/OpenThai2.0-OCR-Markdown

## Resumen

OpenThai2.1-OCR-Markdown-20261118 es un modelo especializado en conversion de imagenes de paginas de documentos a Markdown, con soporte nativo de tailandes e ingles. Lo desarrolla iApp Technology en el marco del proyecto OpenThai (anteriormente OpenThaiGPT) y se presenta como un fine-tune completo del modelo NVIDIA Nemotron 3.5 Parse (0,63B). El repositorio conserva el identificador `iapp/OpenThai2.0-OCR-Markdown`, aunque el contenido corresponde a la version 2.1 publicada el 18 de noviembre de 2026.

El modelo resuelve el problema del parseo estructurado de documentos: recibe una sola imagen de pagina (ajustada a 1.664 x 2.048 pixeles) y devuelve Markdown en el que las tablas se representan como HTML con atributos de fusion de celdas, las formulas como LaTeX entre delimitadores `$$` y cada bloque lleva asociada una caja de layout y una clase, respetando el orden de lectura. La arquitectura combina un codificador visual C-RADIOv4-SO400M de 439,0M de parametros con un decodificador de texto mBART de 10 capas y anchura 1.024 (191,8M), sumando 630,8M de parametros totales.

Su relevancia actual radica en dos factores. Por un lado, cubre el hueco de OCR de alta calidad para tailandes, un idioma con poca cobertura en modelos de document parsing, incluyendo documentos oficiales, tablas y fotos de movil. Por otro, mantiene toda la pila de servicio y postprocesado de Nemotron Parse, por lo que puede desplegarse con vLLM en cualquier infraestructura donde ya funcione el modelo base, con un rendimiento de 1,5 s por pagina en una H100 y 0,44 s si se usa el drafter DFlash2 incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder + text decoder (image-text-to-text); C-RADIOv4-SO400M + mBART de 10 capas |
| Parametros totales | 630.800.504 (439,0M vision encoder + 191,8M text decoder) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en float32; servido en bfloat16) |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (`model.safetensors`, float32, 2,52 GB); repo de 7,8 GB |
| Resolucion de entrada | 1.664 x 2.048 pixeles (anchura x altura) |
| Modelo base | nvidia/Nemotron-3.5-Parse |
| Hardware de referencia | Una GPU NVIDIA, servido con vLLM |
| Version | 2.1 (tag `v2.1.0`); v2.0 disponible en tag `v2.0.0` |

## Arquitectura y entrenamiento

El modelo es un sistema image-text-to-text de dos torres: un codificador visual C-RADIOv4-SO400M (439,0M de parametros) que procesa la imagen de pagina y un decodificador de texto basado en mBART de 10 capas con anchura 1.024 (191,8M de parametros) que genera la secuencia Markdown junto con las cajas de layout, las clases de bloque y el orden de lectura. Hereda del modelo base NVIDIA Nemotron 3.5 Parse tanto el tokenizador como el codigo de servicio y postprocesado, y las modificaciones propias de iApp se limitan a las opciones de Markdown en `nemotron_parse/postprocessing.py` y a la comprobacion de paginas en blanco en `nemotron_parse/inference.py`.

El entrenamiento consistio en un fine-tune completo durante una epoca sobre 77.900 filas (2.435 pasos de tamano de lote 32) en una unica H100. Los pesos publicados no son el resultado directo del fine-tune, sino una mezcla en el espacio de pesos: 70% del modelo ajustado y 30% del modelo base. La version 2.1 amplia los datos de entrenamiento respecto a 2.0 con paginas fotografiadas con movil y nueve tipos de pagina adicionales (articulos academicos, libros, comics, examenes, revistas, periodicos, informes, diapositivas y libros de texto) en tailandes e ingles. No se especifica en la informacion disponible la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

Entre las innovaciones tecnicas destacables estan la integracion de un drafter de decodificacion especulativa DFlash2 incluido en el repositorio, que reduce el tiempo por pagina de 1,5 s a 0,44 s en una H100, y un conjunto de mejoras de postprocesado en 2.1: formulas multilinea agrupadas en un unico bloque `$$\begin{gathered}...\end{gathered}$$`, eliminacion por defecto de cabeceras y pies de pagina del Markdown (manteniendolos en la lista de bloques), devolucion de paginas en blanco como cadenas vacias sin invocar al modelo, y normalizacion del caracter tailandes ำ como un unico code point (U+0E33), ademas de la supresion de `rowspan="1"` y `colspan="1"` redundantes en las celdas de tabla.

## Capacidades

- Conversion de imagenes de paginas de documento a Markdown estructurado, con tablas representadas como HTML y soporte de fusion de celdas (rowspan y colspan).
- Extraccion de formulas matematicas como LaTeX entre delimitadores `$$`, incluyendo formulas de varias lineas agrupadas en un unico entorno `gathered`.
- Deteccion de layout: devuelve una caja delimitadora y una clase para cada bloque, en orden de lectura.
- Procesamiento de documentos oficiales tailandeses, tablas, texto impreso y, desde la version 2.1, paginas fotografiadas con movil.
- Cobertura de nueve tipos de pagina adicionales: articulos academicos, libros, comics, examenes, revistas, periodicos, informes, diapositivas y libros de texto.
- Soporte bilingue tailandes-ingles en una misma pagina.
- Gestion de paginas en blanco: devuelve contenido vacio sin generar texto inventado.
- Exposicion de la salida en formato conversacional (pipeline `image-text-to-text`), apta para integracion programatica mediante la clase `DocumentParser`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agentico; el modelo esta disenado exclusivamente para parsing de documentos.

## Casos de uso

- Digitalizacion de documentos oficiales tailandeses: el modelo esta entrenado especificamente con documentos oficiales de Tailandia y obtiene 94,0 en th-docs-tables v1, por lo que puede convertir formularios, certificados y expedientes escaneados a Markdown estructurado para su ingestion en sistemas de gestion documental.
- Extraccion de tablas financieras y administrativas: la representacion HTML con fusion de celdas permite reconstruir tablas complejas (69,5 en ThaiOCRBench tables) y cargarlas directamente en hojas de calculo o bases de datos relacionales.
- Procesamiento de articulos academicos y libros de texto: la version 2.1 incorpora estos tipos de pagina en el entrenamiento y extrae formulas en LaTeX, lo que facilita la conversion de papers con notacion matematica a formatos Markdown para wikis o repositorios de documentacion cientifica.
- Digitalizacion de periodicos y revistas: al cubrir estos generos y respetar el orden de lectura con cajas de layout, permite segmentar articulos y columnas para su publicacion en portales de noticias o archivos historicos.
- Captura de documentos con movil en aplicaciones de campo: el entrenamiento con paginas fotografiadas (con una mejora de unos 10 puntos en MDPBench Thai respecto a 2.0) lo hace adecuado para apps moviles que digitalizan facturas, albaranes o apuntes sin escaner dedicado.
- Construccion de pipelines RAG sobre corpus tailandeses: la salida Markdown con estructura preservada y cabeceras y pies de pagina eliminados por defecto reduce el ruido en la fragmentacion (chunking) y mejora la calidad de la recuperacion en asistentes documentales.
- Conversion masiva de examenes y material educativo: la cobertura de examenes y comics permite transformar bancos de preguntas y material didactico a formatos editables para plataformas de e-learning.
- Servicio de OCR como API interna: con 1,5 s por pagina en una H100 (0,44 s con el drafter DFlash2) y soporte de vLLM, puede desplegarse como microservicio de conversion documental en infraestructura con una sola GPU.

## Benchmarks y rendimiento

| Modelo | th-docs-tables v1 (65 paginas) | ThaiOCRBench tables (193 imagenes) | Thai text impreso (12 sets) | MDPBench EN+TH (320 paginas) | MDPBench Thai | olmOCR-bench | OmniDocBench v1.6 | Segundos por pagina |
|---|---|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown-20261118 | 94,0 | **69,5** | 90,2 | 82,5 | 80,7 | 73,1 | 79,6 | 1,5 |
| OpenThai2.0-OCR-Markdown | **95,2** | 68,9 | **90,3** | 73,7 | 72,7 | 50,9 | 61,8 | 1,5 |
| Nemotron 3.5 Parse (base) | 91,3 | 68,3 | 89,0 | 79,6 | 77,4 | 62,4 | 80,1 | 1,8 |
| Typhoon OCR V2 2B | 91,6 | 69,4 | 89,5 | **87,0** | **85,0** | **84,7** | **91,5** | **1,0** |

En negrita, la mejor puntuacion de cada columna (en segundos por pagina, el mas rapido). Comparacion directa con Typhoon OCR V2 2B con intervalos de confianza pareados al 95%:

| Benchmark | Diferencia | Resultado |
|---|---|---|
| th-docs-tables v1 | +2,3 [+0,4, +4,8] | por delante |
| ThaiOCRBench tables | +0,1 [-2,7, +2,9] | no significativo |
| Thai text | +0,73 [+0,19, +1,24] | por delante |
| MDPBench | -4,5 [-7,0, -2,0] | por detras |
| MDPBench Thai | -4,3 [-8,4, -0,4] | por detras |
| olmOCR-bench | -11,6 (± 1,0 y ± 0,8) | por detras |
| OmniDocBench v1.6 | -11,8 | por detras |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en float32 (2,52 GB) y se sirven en bfloat16, por lo que el modelo cabe holgadamente en GPUs de 8-16 GB; la VRAM adicional depende del backend (vLLM reserva memoria para cache KV y grafo de ejecucion). No se detalla en la informacion disponible una cifra exacta de VRAM por configuracion.
- GPU de referencia: una unica NVIDIA H100 alcanza 1,5 s por pagina (0,44 s con el drafter DFlash2). No se documentan mediciones en A100, RTX 4090 u otras GPUs.
- Cabe en GPU de consumo: por tamano (630,8M de parametros) es compatible con GPUs de consumo, aunque no se aportan cifras de rendimiento en ellas.
- Opciones de despliegue: vLLM es el backend documentado y el unico con el que se han medido los tiempos. El modelo incluye codigo propio (`nemotron_parse`) y requiere `trust_remote_code`. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Throughput y latencia: 1,5 s por pagina procesando una pagina a la vez en H100 (mediana de 12 paginas de tablas); 0,44 s con el drafter DFlash2; en la misma H100, 0,45 s frente a 1,15 s de Typhoon OCR V2 2B con su drafter EAGLE-3.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | MDPBench EN+TH | olmOCR-bench | OmniDocBench v1.6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown | 630,8M | th, en | no disponible | 82,5 | 73,1 | 79,6 | OpenMDW-1.1 | Hugging Face |
| Nemotron 3.5 Parse (base) | 0,63B | no disponible en la informacion | no disponible | 79,6 | 62,4 | 80,1 | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Typhoon OCR V2 2B | 2B | th, en (segun comparativa) | no disponible | 87,0 | 84,7 | 91,5 | no disponible | no disponible |
| OpenThai2.0-OCR-Markdown | 630,8M | th, en | no disponible | 73,7 | 50,9 | 61,8 | OpenMDW-1.1 | Hugging Face (tag `v2.0.0`) |

Frente a Typhoon OCR V2 2B, OpenThai2.1 es mas pequeno (630,8M frente a 2B) y supera al modelo tailandes en tablas de documentos oficiales y texto impreso, pero queda por detras en MDPBench (4,5 puntos), olmOCR-bench (11,6 puntos) y OmniDocBench v1.6 (11,8 puntos), especialmente en formulas y paginas fotografiadas. Frente a su modelo base, la mejora es notable en olmOCR-bench (+10,7) y MDPBench (+2,9), con un ligero retroceso en OmniDocBench v1.6 (-0,5).

## Limitaciones y advertencias

- El modelo solo soporta tailandes e ingles; no se ha entrenado para otros idiomas y su uso fuera de ese par no esta garantizado.
- Queda por detras de Typhoon OCR V2 2B en MDPBench (4,5 puntos), olmOCR-bench (11,6 puntos) y OmniDocBench v1.6 (11,8 puntos), con especial debilidad en formulas y paginas fotografiadas y tablas de estos benchmarks.
- Respecto a la version 2.0, retrocede ligeramente en th-docs-tables v1 (95,2 a 94,0) y en texto tailandes impreso (90,3 a 90,2), aunque las diferencias en texto son minimas.
- Riesgo de alucinacion en paginas en blanco: la version 2.0 inventaba texto en hojas vacias; la 2.1 lo corrige con una comprobacion previa en `DocumentParser`, pero cualquier uso que invoque al modelo directamente sin ese filtro puede reproducir el problema.
- La licencia OpenMDW-1.1 incluye terminos y avisos de terceros heredados de NVIDIA (modelo base, tokenizador y codigo de servicio); es responsabilidad del usuario revisar las condiciones de uso comercial en el enlace oficial de la licencia.
- El modelo requiere `trust_remote_code` y depende del paquete `nemotron_parse`; las modificaciones de iApp al codigo de NVIDIA se limitan a `postprocessing.py` e `inference.py`, por lo que actualizaciones del paquete base pueden afectar al comportamiento.
- No se documentan sesgos especificos ni evaluaciones de robustez ante documentos degradados, rotados o con baja resolucion mas alla de las paginas fotografiadas incluidas en el entrenamiento.
- La informacion disponible no detalla la longitud de contexto del decodificador ni el comportamiento ante paginas con contenido extremadamente denso; el limite practico es una pagina por inferencia a 1.664 x 2.048 pixeles.
- Los pesos se publican en float32 (2,52 GB) y el repositorio ocupa 7,8 GB; no se ofrecen cuantizaciones oficiales, lo que limita el despliegue en entornos con restricciones de memoria estrictas sin conversion manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-OCR-Markdown
- Version 2.1 (tag): https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118/tree/v2.1.0
- Version 2.0 (tag): https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118/tree/v2.0.0
- Modelo base NVIDIA Nemotron 3.5 Parse: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
