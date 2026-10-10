# Jinstudio/Qianfan-OCR

## Resumen

Qianfan-OCR es un modelo vision-lenguaje de 4,74 mil millones de parametros (4.741.408.256 segun los pesos en safetensors) desarrollado por el equipo Baidu Qianfan y publicado en HuggingFace bajo el identificador Jinstudio/Qianfan-OCR. Su objetivo es unificar en una sola arquitectura end-to-end tres tareas que tradicionalmente se resuelven con pipelines encadenados: el analisis de maquetacion (layout analysis), el reconocimiento optico de caracteres (OCR) y la comprension documental. En lugar de encadenar un detector de layout, un motor de OCR y un modelo de lenguaje, Qianfan-OCR realiza conversion directa de imagen a Markdown y admite multiples tareas guiadas por prompt, como extraccion de tablas, comprension de graficos, respuesta a preguntas sobre documentos y extraccion de informacion clave.

La relevancia del modelo reside en su relacion tamano-rendimiento: con solo 4B de parametros declara el mejor resultado entre modelos end-to-end en OmniDocBench v1.5 (93,12) y en OlmOCR Bench (79,8), por delante de DeepSeek-OCR-v2 y Gemini-3 Pro en el primer caso. Ademas incorpora una fase de razonamiento opcional denominada Layout-as-Thought, activada mediante el token ⟨think⟩, que genera representaciones estructuradas de layout (cajas delimitadoras, tipos de elemento y orden de lectura) antes de la salida final. Soporta 192 idiomas y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial.

El modelo combina un codificador visual propio (Qianfan-ViT) con el modelo de lenguaje Qwen3-4B y un adaptador cross-modal de dos capas, con una ventana de contexto de 32K tokens ampliable a 131K. Su punto fuerte son los documentos heterogeneos: periodicos, examenes, informes tecnicos y documentos con elementos mezclados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje multimodal (ViT + adaptador MLP + transformer decoder denso), basada en el puente multimodal de Qianfan-VL |
| Parametros totales | 4.741.408.256 (aprox. 4,74B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens, ampliable a 131K |
| Tipos de cuantizacion | W8A8 (pesos y activaciones a 8 bits) documentada por el autor; otros formatos no disponibles |
| Idiomas soportados | Multilingue (192 idiomas declarados por el autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Datos adicionales de arquitectura: el codificador visual Qianfan-ViT tiene 24 capas transformer y diseno AnyResolution de hasta 4K, con 256 tokens visuales por tesela de 448x448 y un maximo de 4.096 tokens por imagen. El modelo de lenguaje es Qwen3-4B con 3.600 millones de parametros no de embedding, 36 capas, dimension oculta de 2.560 y atencion GQA con 32 cabezas de consulta y 8 de clave/valor. El adaptador cross-modal es un MLP de 2 capas con activacion GELU que proyecta de 1.024 a 2.560 dimensiones.

| Componente | Detalle |
|---|---|
| Vision encoder | Qianfan-ViT, 24 capas, AnyResolution hasta 4K, 256 tokens visuales por tesela 448x448, maximo 4.096 tokens por imagen |
| Modelo de lenguaje | Qwen3-4B, 3,6B no-embedding, 36 capas, 2.560 de dimension oculta, GQA 32/8, 32K de contexto |
| Adaptador cross-modal | MLP de 2 capas con GELU, proyeccion 1.024 a 2.560 |
| Tamano del repositorio | 9,5 GB |

## Arquitectura y entrenamiento

Qianfan-OCR sigue la arquitectura de puente multimodal presentada en Qianfan-VL (arXiv:2509.18189): un codificador visual, un adaptador que alinea los espacios latentes de vision y texto, y un transformer decoder que genera la respuesta. El codificador Qianfan-ViT procesa la imagen con un diseno AnyResolution que admite resoluciones de hasta 4K y produce como maximo 4.096 tokens visuales por imagen, lo que permite manejar documentos densos sin perder detalle tipografico. El adaptador es un MLP de dos capas con GELU que transforma las representaciones visuales de 1.024 a 2.560 dimensiones, la dimension del modelo de lenguaje Qwen3-4B, que aporta 36 capas con atencion GQA (32 cabezas de consulta, 8 de clave/valor) y 32K tokens de contexto ampliables a 131K.

La innovacion tecnica principal es Layout-as-Thought, una fase de pensamiento opcional que el modelo activa con el token ⟨think⟩. En esa fase, el modelo genera primero una representacion estructurada del layout (cajas delimitadoras, tipos de elemento y orden de lectura) y despues produce la salida final. Cumple dos funciones: recuperar la capacidad de analisis de layout dentro del paradigma end-to-end (el usuario obtiene el layout explicito) y mejorar la precision en documentos con maquetacion compleja, elementos desordenados u orden de lectura no estandar. El autor recomienda activar el modo de pensamiento en paginas heterogeneas (examenes, informes tecnicos, periodicos) y desactivarlo en documentos homogeneos (texto a una columna, formularios sencillos), donde da mejores resultados y menor latencia.

No se ha proporcionado informacion en la documentacion disponible sobre el numero exacto de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla el procedimiento de ampliacion de contexto de 32K a 131K.

## Capacidades

- Conversion directa de imagen a Markdown: el modelo genera Markdown estructurado a partir de la imagen de un documento, sin pipeline intermedio.
- Analisis de maquetacion (layout analysis): deteccion de elementos, cajas delimitadoras y orden de lectura, de forma explicita cuando se activa el modo ⟨think⟩.
- Reconocimiento optico de caracteres multilingue: 192 idiomas declarados, con soporte de escrituras diversas.
- Comprension de documentos: respuesta a preguntas sobre documentos (DocVQA), con 92,8 declarado.
- Comprension de graficos: interpretacion de graficos de barras, lineas y otros, con razonamiento sobre los datos representados (ChartQA 88,1, ChartQAPro 42,9, CharXiv_DQ 94,0, CharXiv_RQ 85,2).
- Extraccion de tablas: reconstruccion de estructuras tabulares, con 91,02 en TableTEDs y 93,85 en TableTEDss sobre OmniDocBench v1.5.
- Reconocimiento de formulas: 92,43 en FormulaCDM.
- Extraccion de informacion clave (KIE): media global de 87,9 en cinco benchmarks publicos de KIE, segun el autor.
- Modo de pensamiento (thinking mode): fase opcional activada por tokens ⟨think⟩ que genera layout estructurado antes de la respuesta.
- Conversacional: la etiqueta conversational indica soporte de interaccion multi-turno.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere despliegue en infraestructura de endpoints de HuggingFace.
- No se documenta soporte explicito de tool calling, function calling ni de agentes multi-paso en la informacion disponible.

## Casos de uso

- Digitalizacion masiva de archivos: el modelo convierte directamente imagenes de documentos a Markdown sin necesidad de orquestar un detector de layout, un motor de OCR y un post-procesador. Con 1,024 paginas por segundo en una A100 con cuantizacion W8A8, es viable procesar grandes volumenes de fondos documentales.
- Extraccion de tablas y formulas en documentacion cientifica y tecnica: con 91,02 en TableTEDs y 92,43 en FormulaCDM sobre OmniDocBench v1.5, resulta adecuado para convertir articulos y manuales con tablas complejas y notacion matematica a formatos reutilizables.
- Analisis de informes financieros con graficos: los resultados en ChartQA (88,1) y CharXiv_RQ (85,2) permiten responder preguntas sobre series representadas graficamente, algo que los sistemas de OCR seguido de LLM no resuelven porque descartan la estructura del grafico durante la extraccion de texto.
- Extraccion de informacion clave en facturas, contratos y formularios: la media de 87,9 en cinco benchmarks de KIE lo situa como opcion para poblar bases de datos a partir de documentos escaneados con campos heterogeneos.
- Atencion al cliente sobre documentacion: la ventana de contexto de 32K tokens ampliable a 131K permite mantener conversaciones multi-turno en las que el usuario aporta documentos extensos y formula preguntas sucesivas sobre su contenido.
- Indexacion para RAG documental: la salida en Markdown estructurado con orden de lectura correcto (0,049 en R-orderEdit) facilita el troceado y la indexacion en sistemas de recuperacion aumentada.
- Tratamiento de documentos historicos o multilingues: el soporte de 192 idiomas permite procesar fondos con escrituras mixtas sin desplegar motores de OCR especificos por idioma.
- Auditoria de maquetacion en Artes Graficas y prensa: el modo Layout-as-Thought devuelve cajas delimitadoras y tipos de elemento, util para verificar el orden de lectura en periodicos y publicaciones con columnas multiples.
- Automatizacion de accesibilidad: la reconstruccion del orden de lectura y de la jerarquia de elementos permite generar versiones accesibles de documentos escaneados.

## Benchmarks y rendimiento

Los siguientes resultados estan declarados por el autor del modelo en la model card y marcados como no verificados (verified: false) en el model-index.

OmniDocBench v1.5 (parseo de documentos):

| Modelo | Tipo | Overall (mayor mejor) | TextEdit (menor mejor) | FormulaCDM (mayor mejor) | TableTEDs (mayor mejor) | TableTEDss (mayor mejor) | R-orderEdit (menor mejor) |
|---|---|---|---|---|---|---|---|
| Qianfan-OCR | End-to-end | 93,12 | 0,041 | 92,43 | 91,02 | 93,85 | 0,049 |
| DeepSeek-OCR-v2 | End-to-end | 91,09 | 0,048 | 90,31 | 87,75 | 92,06 | 0,057 |
| Gemini-3 Pro | End-to-end | 90,33 | 0,065 | 89,18 | 88,28 | 90,29 | 0,071 |
| Qwen3-VL-235B | End-to-end | 89,15 | 0,069 | 88,14 | 86,21 | 90,55 | 0,068 |
| dots.ocr | End-to-end | 88,41 | 0,048 | 83,22 | 86,78 | 90,62 | 0,053 |
| PaddleOCR-VL 1.5 | Pipeline | 94,50 | 0,035 | 94,21 | 92,76 | 95,79 | 0,042 |

Benchmarks generales de OCR:

| Modelo | OCRBench | OCRBenchv2 (en/zh) | CCOCR-multilan | CCOCR-overall |
|---|---|---|---|---|
| Qianfan-OCR | 880 | 56,0 / 60,77 | 76,7 | 79,3 |
| Qwen3-VL-4B | 873 | 60,68 / 59,13 | 74,2 | 76,5 |
| MonkeyOCR | 655 | 21,78 / 38,91 | 43,8 | 35,2 |
| DeepSeek-OCR | 459 | 15,98 / 38,31 | 32,5 | 27,6 |

Comprension de documentos:

| Benchmark | Qianfan-OCR | Qwen3-VL-4B | Qwen3-VL-2B |
|---|---|---|---|
| DocVQA | 92,8 | 94,9 | 92,7 |
| CharXiv_DQ | 94,0 | 81,8 | 69,7 |
| CharXiv_RQ | 85,2 | 48,5 | 41,3 |
| ChartQA | 88,1 | 83,3 | 78,3 |
| ChartQAPro | 42,9 | 36,2 | 24,5 |
| ChartBench | 85,9 | 74,9 | 73,2 |
| TextVQA | 80,0 | 81,8 | 79,9 |
| OCRVQA | 66,8 | 64,7 | 59,3 |

Resultados adicionales declarados por el autor:

| Benchmark | Metrica | Valor |
|---|---|---|
| OmniDocBench v1.5 | Overall Score | 93,12 |
| OlmOCR Bench | Overall Score | 79,8 |
| OCRBench | Score | 880 |

El autor senala ademas que los sistemas de dos etapas (OCR + LLM) obtienen 0,0 en CharXiv, tanto en DQ como en RQ, porque la estructura del grafico se descarta durante la extraccion de texto. No se han proporcionado intervalos de confianza, tamanos de muestra ni detalles del protocolo de evaluacion.

## Requisitos de hardware

- Peso de los pesos en precision completa (bf16/fp16): aproximadamente 9,5 GB, coincidiendo con el tamano del repositorio. La inferencia en bf16 requiere del orden de 12 a 16 GB de VRAM contando activaciones y cache KV, en funcion de la resolucion de imagen y la longitud de contexto.
- Cuantizacion W8A8: reduce los pesos a aproximadamente 4,7-5 GB, lo que deja margen para lotes mayores o contextos mas largos en GPUs de 16-24 GB.
- Rendimiento declarado: 1,024 paginas por segundo (PPS) con cuantizacion W8A8 en una unica GPU A100.
- GPU recomendadas: A100 (resultado de referencia aportado por el autor), H100 para mayor throughput, y GPUs de 24 GB como RTX 4090 o RTX 3090 para inferencia en bf16 con lotes pequenos.
- GPUs de consumo: si cabe en tarjetas de 24 GB en bf16 y en tarjetas de 8-12 GB con cuantizacion W8A8, aunque no se han publicado mediciones especificas para estos perfiles. No hay datos confirmados para GPUs por debajo de 8 GB ni para CPU.
- Opciones de despliegue: transformers (libreria declarada), ademas de los frameworks habituales para modelos vision-lenguaje como vLLM o TGI. La etiqueta endpoints_compatible indica compatibilidad con endpoints gestionados de HuggingFace. No se han publicado pesos en formato GGUF, por lo que llama.cpp y Ollama no estan soportados oficialmente segun la informacion disponible.
- Latencia: no se especifica latencia por pagina mas alla del dato de throughput de 1,024 PPS en A100 con W8A8. El modo Layout-as-Thought (⟨think⟩) incrementa la latencia porque genera tokens adicionales de layout antes de la respuesta final; el autor recomienda desactivarlo en documentos homogeneos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OmniDocBench v1.5 | OCRBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qianfan-OCR | 4,74B | 32K (ampliable a 131K) | 93,12 | 880 | Apache 2.0 | HuggingFace (transformers, safetensors) |
| DeepSeek-OCR-v2 | No disponible | No disponible | 91,09 | No disponible (DeepSeek-OCR: 459) | No disponible | No disponible en la informacion proporcionada |
| Qwen3-VL-4B | Aprox. 4B | No disponible | No disponible | 873 | No disponible | No disponible en la informacion proporcionada |
| Qwen3-VL-235B | 235B (MoE, segun nomenclatura A22B) | No disponible | 89,15 | No disponible | No disponible | No disponible en la informacion proporcionada |
| PaddleOCR-VL 1.5 | No disponible | No disponible | 94,50 (pipeline) | No disponible | No disponible | No disponible en la informacion proporcionada |
| Gemini-3 Pro | No disponible (propietario) | No disponible | 90,33 | No disponible | Propietaria | API de Google |

Consideraciones sobre la comparativa: PaddleOCR-VL 1.5 obtiene una puntuacion global superior en OmniDocBench v1.5 (94,50 frente a 93,12), pero se trata de una arquitectura de pipeline en varias etapas, no de un modelo end-to-end; en la categoria end-to-end, Qianfan-OCR se situa por delante de DeepSeek-OCR-v2, Gemini-3 Pro, Qwen3-VL-235B y dots.ocr segun los datos del autor. Frente a Qwen3-VL-4B, de tamano comparable, Qianfan-OCR obtiene mejores resultados en OCRBench (880 frente a 873), CCOCR y en todos los benchmarks de graficos (ChartQA, ChartQAPro, ChartBench, CharXiv_DQ y CharXiv_RQ) y OCRVQA, mientras que Qwen3-VL-4B es superior en DocVQA (94,9 frente a 92,8), TextVQA (81,8 frente a 80,0) y OCRBenchv2 en ingles (60,68 frente a 56,0).

## Limitaciones y advertencias

- Los resultados de benchmarks estan declarados por el autor del modelo y aparecen como no verificados (verified: false) en el model-index. No se han publicado evaluaciones independientes.
- El modelo cuenta con 0 descargas y 0 likes en el momento de la consulta, y el repositorio es muy reciente (creado el 2026-10-10). No existe validacion por parte de la comunidad.
- Existe una discrepancia entre el autor del repositorio (Jinstudio) y el equipo que la model card atribuye el desarrollo (Baidu Qianfan Team). Conviene verificar la procedencia antes de usarlo en produccion.
- Riesgo de alucinacion: como modelo generativo, puede producir texto, valores o estructuras de tabla que no estan presentes en la imagen, especialmente en documentos de baja calidad, con ruido, sellos, manchas o escritura manuscrita. No se documenta el comportamiento en escritura manuscrita.
- Idiomas: se declaran 192 idiomas, pero no se publica el desglose de rendimiento por idioma ni el tamano del conjunto de evaluacion multilingue. El rendimiento puede degradarse en escrituras poco representadas.
- Contexto: la ventana base es de 32K tokens, ampliable a 131K, pero no se documenta el procedimiento ni el coste de memoria de dicha ampliacion. Un documento de alta resolucion puede consumir hasta 4.096 tokens visuales por imagen, lo que limita el numero de paginas procesables en una sola peticion.
- Modo de pensamiento: incrementa la latencia y el consumo de tokens. El autor recomienda desactivarlo en documentos homogeneos, donde ademas obtiene mejores resultados.
- Licencia Apache 2.0, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia. Aun asi, debe revisarse el archivo LICENSE del repositorio por si incorpora condiciones adicionales.
- Sesgos conocidos: no se documenta ninguna evaluacion de sesgos, toxicidad ni comportamiento diferencial por idioma o tipo de documento en la informacion disponible.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso, por lo que no deberia asumirse su disponibilidad en pipelines que dependan de estas funciones.
- Los pesos estan en safetensors y no hay versiones GGUF publicadas, lo que descarta su uso en llama.cpp u Ollama segun la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jinstudio/Qianfan-OCR
- Demo: https://huggingface.co/spaces/baidu/Qianfan-OCR-Demo
- Informe tecnico (arXiv:2603.13398): https://arxiv.org/abs/2603.13398
- Paper de Qianfan-VL (arXiv:2509.18189): https://arxiv.org/abs/2509.18189
- Repositorio GitHub de Qianfan-VL: https://github.com/baidubce/Qianfan-VL
- Skill de inteligencia documental: https://github.com/baidubce/skills/tree/develop/skills/qianfanocr-document-intelligence
- Plataforma Qianfan de Baidu: https://cloud.baidu.com/product-s/qianfan_home
- Benchmarks citados: OmniDocBench v1.5 (opendatalab/OmniDocBench), OlmOCR Bench (allenai/olmOCR-bench), OCRBench (echo840/OCRBench)
