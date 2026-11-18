# iapp/OpenThai2.0-OCR-Markdown

## Resumen

OpenThai2.0-OCR-Markdown (publicado en el repositorio como OpenThai2.1-OCR-Markdown-20261118, paquete 2.2) es un modelo especializado en conversion de imagenes de paginas de documento a Markdown, desarrollado por iApp Technology en el marco del proyecto OpenThai, con lanzamiento junto a AIEAT. Es un fine-tune en tailandes de NVIDIA Nemotron 3.5 Parse, un modelo de 630,8 millones de parametros que combina un codificador visual C-RADIOv4-SO400M (439,0M) con un decodificador de texto mBART de 10 capas y anchura 1.024 (191,8M).

El modelo resuelve un problema concreto: extraer texto, tablas y formulas de paginas escaneadas o fotografiadas en tailandes e ingles, preservando el orden de lectura, las cajas de maquetacion y las clases de bloque. Devuelve Markdown con tablas en HTML (con rowspan y colspan) y formulas en LaTeX entre delimitadores `$$`, lo que lo hace directamente consumible por pipelines de RAG y de ingesta documental.

Su relevancia actual radica en que cubre el hueco de OCR de alta calidad para tailandes, un idioma con poca representacion en modelos OCR genericos, y en que mejora notablemente a su version 2.0 en paginas fotografiadas con movil y en tipos de pagina cotidianos (articulos academicos, libros, comics, examenes, revistas, periodicos, informes, diapositivas y libros de texto). Mantiene el stack de serving y postprocesado de Nemotron Parse, por lo que funciona en cualquier infraestructura donde funcione el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual C-RADIOv4-SO400M + decodificador de texto mBART de 10 capas (image-text-to-text) |
| Parametros totales | 630.800.504 (vision 439,0M, texto 191,8M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32, servido en bfloat16) |
| Idiomas soportados | tailandes (th) e ingles (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (`model.safetensors`, float32, 2,52 GB) |

Otros datos tecnicos: entrada de una imagen de pagina ajustada a 1.664 x 2.048 pixeles (anchura x altura); salida en Markdown con tablas HTML y formulas LaTeX, mas una caja y una clase por bloque en orden de lectura; hardware de referencia una GPU NVIDIA servida con vLLM; velocidad de 1,5 s por pagina en una H100 (mediana de 12 paginas con tablas); tamano del repositorio 5,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un modelo multimodal de imagen a texto: un codificador visual C-RADIOv4-SO400M de 439,0M de parametros procesa la imagen de la pagina y un decodificador de texto mBART de 10 capas y anchura 1.024 (191,8M) genera la secuencia Markdown junto con las cajas y clases de bloque. El modelo conserva el tokenizador, el codigo de serving y el pipeline de postprocesado de NVIDIA Nemotron 3.5 Parse, lo que garantiza compatibilidad con el ecosistema del modelo base.

El entrenamiento consistio en un fine-tune completo durante una epoca sobre 77.900 filas (2.435 pasos de tamano de lote 32) en una sola H100. Los pesos publicados no son el fine-tune puro, sino una mezcla en el espacio de pesos: 70% del fine-tune y 30% del modelo base. El conjunto de entrenamiento incluye paginas fotografiadas con movil y nueve tipos de pagina adicionales a los documentos oficiales (articulos academicos, libros, comics, examenes, revistas, periodicos, informes, diapositivas y libros de texto) en tailandes e ingles. No se documenta en la informacion disponible el uso de RLHF o DPO.

Entre las innovaciones tecnicas destacan: formulas multilinea agrupadas en un unico bloque `$$\begin{gathered}...\end{gathered}$$`; eliminacion por defecto de cabeceras y pies de pagina del Markdown (aunque se mantienen en la lista de bloques); deteccion de paginas en blanco que evita que el modelo invente texto; normalizacion del caracter tailandes ำ como un unico punto de codigo (U+0E33); y, en la version 2.2, un modulo opcional de dewarping (`nemotron_parse/dewarp.py`) para aplanar fotos de movil curvadas o inclinadas, desactivado por defecto.

## Capacidades

- Conversion de imagenes de paginas de documento a Markdown estructurado, con tablas representadas como HTML (rowspan y colspan) y formulas como LaTeX.
- Preservacion de la maquetacion: devuelve cajas delimitadoras y clases de bloque para cada elemento, en orden de lectura.
- Procesamiento de documentos oficiales tailandeses, articulos academicos, libros, comics, examenes, revistas, periodicos, informes, diapositivas y libros de texto.
- Manejo de paginas fotografiadas con movil, incluyendo fotos curvadas o inclinadas (con dewarping opcional).
- Soporte bilingue tailandes-ingles en la misma pagina.
- Deteccion de paginas en blanco con salida vacia, sin texto alucinado.
- Extraccion de formulas matematicas, incluidas formulas de varias lineas.
- Capacidad de servir con vLLM y de integrarse en el pipeline de postprocesado de Nemotron Parse.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes o modos de razonamiento multi-paso.

## Casos de uso

- Digitalizacion de archivos administrativos tailandeses: el modelo convierte documentos oficiales escaneados a Markdown con tablas HTML, lo que permite indexar el contenido en sistemas de gestion documental y busqueda corporativa sin reintroducir datos manualmente.
- Ingesta para RAG sobre normativa y expedientes: al preservar el orden de lectura y las cajas de bloque, el Markdown resultante mantiene la estructura necesaria para trocear documentos por secciones y tablas, mejorando la recuperacion en asistentes de consulta legal o administrativa.
- Procesamiento de articulos academicos y libros de texto: extrae texto, formulas LaTeX y tablas de publicaciones cientificas en tailandes e ingles, util para construir bases de conocimiento cientifico o para reutilizar contenido en plataformas educativas.
- Conversion de examenes y material didactico: el modelo reconoce la maquetacion de examenes y diapositivas, lo que facilita la migracion de bancos de preguntas a formatos estructurados y su integracion en plataformas de e-learning.
- Digitalizacion de prensa y revistas historicas: con soporte para periodicos y revistas, permite convertir hemerotecas a Markdown para analisis de contenido, mineria de texto y archivo a largo plazo.
- Captura de documentos con movil en aplicaciones de campo: al estar entrenado con paginas fotografiadas y ofrecer dewarping opcional, puede integrarse en apps moviles para digitalizar facturas, formularios o certificados en el momento de la captura.
- Extraccion de tablas financieras o administrativas: la salida HTML con rowspan y colspan conserva la estructura de tablas complejas, lo que permite cargar los datos en hojas de calculo o bases de datos relacionales.

## Benchmarks y rendimiento

| Modelo | th-docs-tables v1 (65 paginas) | ThaiOCRBench tables (193 imagenes) | Texto tailandes impreso (12 conjuntos) | MDPBench EN+TH (320 paginas) | MDPBench Thai | olmOCR-bench | OmniDocBench v1.6 | Segundos por pagina |
|---|---|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown-20261118 | 94,0 | 69,5 | 90,2 | 82,5 | 80,7 | 73,1 | 79,6 | 1,5 |
| OpenThai2.0-OCR-Markdown | 95,2 | 68,9 | 90,3 | 73,7 | 72,7 | 50,9 | 61,8 | 1,5 |
| Nemotron 3.5 Parse (base) | 91,3 | 68,3 | 89,0 | 79,6 | 77,4 | 62,4 | 80,1 | 1,8 |
| Typhoon OCR V2 2B | 91,6 | 67,6 | 89,6 | 87,0 | 85,0 | 84,7 | 91,5 | 1,0 |

Los pesos y las puntuaciones publicadas corresponden a la version 2.1; la version 2.2 mantiene los mismos pesos y anade el dewarping opcional. En las pruebas de desarrollo del autor, el dewarping no produjo diferencias mas alla de la variacion entre ejecuciones para este modelo.

## Requisitos de hardware

- VRAM estimada: no se publica una cifra exacta. Los pesos en float32 ocupan 2,52 GB; servidos en bfloat16 el modelo ocupa aproximadamente la mitad, por lo que cabe holgadamente en GPUs con 8-16 GB de VRAM, aunque la memoria de activaciones y del codificador visual anade overhead no cuantificado en la informacion disponible.
- GPU recomendadas: una GPU NVIDIA con vLLM; el autor reporta 1,5 s por pagina en una H100.
- GPU de consumo: por el tamano de pesos (0,63B de parametros), es previsible que quepa en GPUs de consumo tipo RTX 4090 o RTX 3090, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: vLLM (stack de serving de Nemotron Parse). No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: 1,5 s por pagina en una H100, procesando una pagina a la vez (mediana de 12 paginas con tablas). El modelo base tarda 1,8 s por pagina en las mismas condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | MDPBench EN+TH | olmOCR-bench | OmniDocBench v1.6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown | 630,8M | th, en | 82,5 | 73,1 | 79,6 | OpenMDW-1.1 | Hugging Face (iapp) |
| Nemotron 3.5 Parse (base) | 0,63B (misma arquitectura) | no disponible | 79,6 | 62,4 | 80,1 | OpenMDW-1.1 | Hugging Face (nvidia) |
| Typhoon OCR V2 2B | 2B | th, en (segun model card) | 87,0 | 84,7 | 91,5 | no disponible | Hugging Face |
| OpenThai2.0-OCR-Markdown (version previa) | 630,8M | th, en | 73,7 | 50,9 | 61,8 | OpenMDW-1.1 | Hugging Face (iapp, tag v2.0.0) |

Typhoon OCR V2 2B supera a OpenThai2.1 en MDPBench por 4,5 puntos (la mayor diferencia se concentra en paginas fotografiadas y tablas) y va por delante en olmOCR-bench y OmniDocBench, sobre todo en formulas. Frente al modelo base Nemotron 3.5 Parse, el fine-tune mejora en MDPBench (+2,9), olmOCR-bench (+10,7) y en las pruebas especificas de tailandes, aunque queda ligeramente por debajo en OmniDocBench v1.6 (79,6 frente a 80,1).

## Limitaciones y advertencias

- El modelo solo soporta tailandes e ingles; no se ha validado para otros idiomas.
- Typhoon OCR V2 2B obtiene mejores resultados globales, especialmente en paginas fotografiadas, tablas y formulas; si el caso de uso prioriza formulas o fotos de movil, conviene evaluar esa alternativa.
- La version 2.0 retrocede en th-docs-tables v1 (95,2 frente a 94,0 en 2.1) y en texto tailandes impreso (90,3 frente a 90,2), diferencias pequenas pero que indican que la mejora no es uniforme en todas las metricas.
- El dewarping opcional de la version 2.2 no aporta mejoras medibles para este modelo segun las pruebas del autor y no se recomienda activarlo todavia.
- Riesgo de alucinacion en paginas en blanco: mitigado en 2.1 con una comprobacion que evita enviar hojas vacias al modelo, pero persiste en pipelines que no usen el `DocumentParser` oficial.
- La licencia OpenMDW-1.1 no es una licencia de codigo abierto convencional; conviene revisar sus terminos (https://openmdw.ai/license/1-1/) antes de un uso comercial. El repositorio incluye las notas de copyright, avisos de terceros y atribucion del tokenizador de NVIDIA sin modificar.
- El modelo depende del stack de serving y postprocesado de Nemotron Parse; los cambios propios de iApp se limitan a las opciones Markdown de `nemotron_parse/postprocessing.py`, la comprobacion de paginas en blanco y el dewarping de `nemotron_parse/inference.py`.
- No se dispone de informacion sobre sesgos especificos, longitud de contexto ni cuantizaciones soportadas; estos datos deberian validarse antes de desplegar en produccion.
- El repositorio cambio de nombre (OpenThai2.0 a OpenThai2.1); conviene fijar `revision="v2.2.0"`, `v2.1.0` o `v2.0.0` para garantizar reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-OCR-Markdown
- Repositorio de la version 2.1: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Pesos de la version 2.0 (tag v2.0.0): https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118/tree/v2.0.0
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Assets de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
