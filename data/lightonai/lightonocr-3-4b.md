# lightonai/LightOnOCR-3-4B

## Resumen

LightOnOCR-3-4B es un modelo de visión-lenguaje especializado en OCR y comprensión de documentos, desarrollado por LightOn. Es el miembro más grande de la familia LightOnOCR-3, que también incluye variantes de 1B y 0,8B. El modelo parte de Qwen/Qwen3.5-4B y se afina para transcripción de documentos con comprensión de maquetación: no solo extrae el texto, sino que etiqueta cada bloque con su tipo y sus coordenadas, describe imágenes y convierte gráficos en tablas HTML de datos estructurados.

La propuesta principal es sustituir pipelines complejos de document understanding (detección de layout, OCR, extracción de tablas, clasificación de regiones) por un único modelo end-to-end. Funciona en dos modos: transcripción pura, invocado con un prompt vacío, que devuelve todo el texto de la página en Markdown, y modo `grounding`, que antepone a cada bloque una etiqueta y una bounding box en coordenadas normalizadas 0-1000. Esto lo hace compatible como reemplazo directo de LightOnOCR-2 sin cambios en el código de integración.

Con 4.539.265.536 parámetros reales según los pesos en safetensors y 9,1 GB de repositorio, se distribuye bajo licencia Apache 2.0 para investigación y uso comercial. Se carga con las clases de Qwen3.5 en Transformers y se entrenó y evaluó con el modo de razonamiento (thinking) desactivado, que es el comportamiento por defecto de la plantilla de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5 (transformer multimodal, image-text-to-text) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors en precision completa; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (la model card no especifica lista de idiomas; el OCR es multilingue por naturaleza, pero no se declara oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo adopta la arquitectura vision-lenguaje de Qwen3.5, a diferencia de LightOnOCR-2-1B, que mantenia la arquitectura propia de la generacion anterior. Segun la model card, este cambio simplifica la integracion con herramientas existentes y aporta una aceleracion significativa. Los pesos se guardan con Transformers 5.5.4 y requieren Transformers >= 5.2 para cargarse con las clases de Qwen3.5; en la practica, el autor recomienda `transformers>=5.5.4` junto con `pillow` y `pypdfium2` para el procesado de PDF.

El modelo se entreno y evaluo con el modo thinking desactivado, que es el valor por defecto de la plantilla de chat, de modo que la inferencia estandar no genera cadenas de razonamiento. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en los datos proporcionados. La innovacion funcional destacable es la salida con grounding: el modelo emite bloques etiquetados con 17 clases (text, title, list, header, footer, page_number, footnote, caption, formula, code, table, image, chart, header_image, footer_image, aside_text y el sufijo `+` para continuaciones) acompanados de bounding boxes en coordenadas de pagina normalizadas a 0-1000, y convierte el contenido de los graficos en tablas HTML. Segun el autor, el modo grounding incrementa la salida en torno a un 25 % de tokens respecto a la transcripcion plana (1.433 frente a 1.158 tokens por pagina de media en la variante de 4B). Otras instrucciones distintas del prompt vacio o `grounding` quedan fuera de distribucion.

## Capacidades

- Transcripcion OCR end-to-end de paginas completas a Markdown, incluyendo titulos, parrafos, listas, notas al pie, encabezados y pies de pagina.
- Grounding visual: cada bloque de contenido se devuelve con una etiqueta semantica y una bounding box en coordenadas normalizadas 0-1000.
- Comprension de maquetacion compleja: documentos multi-columna, formularios, recibos y facturas.
- Extraccion de tablas a texto estructurado.
- Conversion de graficos y figuras en tablas HTML con los puntos de datos, transformando informacion visual en datos estructurados.
- Descripcion corta de imagenes y fotografias dentro del documento, lo que hace accesible el contenido visual a pipelines de recuperacion y question answering.
- Reconocimiento de notacion matematica mediante la etiqueta `formula` y de bloques de codigo mediante la etiqueta `code`.
- Deteccion de imagenes de cabecera y pie (por ejemplo, logotipos) con etiquetas especificas.
- Soporte conversacional declarado en las etiquetas del repositorio (pipeline image-text-to-text).
- Tool calling, function calling y comportamiento agentico: no disponible en la informacion proporcionada.
- Modo thinking: explicitamente desactivado por defecto; el modelo no se entrena ni evalua con razonamiento extendido.
- Capacidades de audio: no disponibles; el modelo es exclusivamente vision-texto.

## Casos de uso

- Digitalizacion masiva de archivos PDF: el modelo procesa cada pagina en una sola pasada y devuelve Markdown con la estructura preservada, evitando encadenar un detector de layout, un OCR clasico y un extractor de tablas.
- Extraccion estructurada de facturas y recibos: en modo `grounding`, campos como el emisor, el total o las lineas de detalle se devuelven con su bounding box, lo que permite mapear cada valor a su posicion en el documento y validar la extraccion.
- Conversion de informes financieros con graficos: las etiquetas `chart` producen tablas HTML con los puntos de datos, de modo que series temporales que solo existen como imagen pasan a ser datos consultables.
- Automatizacion de procesos de back office en banca o seguros: formularios y contratos multi-columna se transcriben con etiquetas de tipo de bloque, lo que facilita el enrutado posterior por tipo de contenido.
- Accesibilidad documental: las descripciones automaticas de imagenes y figuras permiten generar versiones alternativas de documentos para lectores de pantalla o para indexacion semantica.
- Indexacion y RAG sobre corpus documental: al combinar texto transcrito, etiquetas de bloque y coordenadas, los fragmentos recuperados pueden citarse con su ubicacion exacta en la pagina original.
- Migracion desde LightOnOCR-2: al mantener el prompt vacio como modo por defecto y la misma convencion de salida en transcripcion, un despliegue existente puede cambiar de modelo sin modificar el codigo de llamada.
- Procesamiento de documentacion tecnica y cientifica: las etiquetas `formula` y `code` permiten separar ecuaciones y fragmentos de codigo del texto corrido para tratarlos con herramientas especializadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la afirmacion cualitativa de que LightOnOCR-3-4B es el modelo mas preciso de la familia, pero no aporta puntuaciones numericas de pruebas como MMLU, HumanEval, GSM8K ni de benchmarks especificos de OCR (por ejemplo, OmniDocBench o similar).

El unico dato cuantitativo de rendimiento disponible es la longitud de salida por pagina:

| Metrica | Valor |
|---|---|
| Tokens de salida por pagina, modo transcripcion (4B) | 1.158 de media |
| Tokens de salida por pagina, modo grounding (4B) | 1.433 de media |
| Sobrecoste del modo grounding | Aproximadamente +25 % de tokens de salida |

No se dispone de datos comparativos frente a otros modelos de OCR. Cualquier cifra adicional no debe asumirse.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia calculada a partir del numero de parametros (4.539 millones) y de un repositorio de 9,1 GB, la inferencia en BF16 requiere aproximadamente 9-10 GB solo para los pesos, mas el encoder de vision y la cache KV, lo que situa el total practico en torno a 12-16 GB en funcion de la resolucion de imagen y la longitud de secuencia.
- Cuantizacion: el repositorio no publica pesos cuantizados. En 8 bits los pesos ocuparian unos 5 GB y en 4 bits unos 3 GB, pero estas cifras son estimaciones de calculo propio y no estan respaldadas por artefactos publicados por LightOn.
- GPU recomendadas: para BF16 sin cuantizar, una GPU de 24 GB como la RTX 4090, la L4 o la A10 permite trabajar con margen; en centros de datos, A100 y H100 son opciones sobradas y permiten mayor paralelismo o lotes mas grandes.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090) en BF16 si se controla el tamano de lote y la resolucion de las paginas. En tarjetas de 16 GB o 12 GB seria necesario cuantizar, algo que no esta soportado por artefactos oficiales segun la informacion disponible.
- Opciones de despliegue: Transformers es la via documentada en la model card (con `transformers>=5.5.4`, `pillow` y `pypdfium2`). El repositorio incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con despliegues gestionados de tipo endpoint. Otros servidores como vLLM o TGI no estan confirmados en la informacion proporcionada, y llama.cpp u Ollama dependerian de la existencia de pesos GGUF, que no se han publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar dentro de la propia familia LightOnOCR-3 y con la generacion anterior. No se dispone de datos de rendimiento de terceros.

| Modelo | Parametros | Arquitectura base | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| LightOnOCR-3-4B | 4.539 millones | Qwen3.5 vision-lenguaje | No disponible | Apache 2.0 | Variante mas precisa de la familia; recomendada para la mayoria de tareas; soporta grounding completo |
| LightOnOCR-3-1B | No disponible | Arquitectura LightOnOCR-2 | No disponible | Apache 2.0 | Actualizacion directa (drop-in) para despliegues existentes de la generacion anterior |
| LightOnOCR-3-0.8B | No disponible | Qwen3.5 vision-lenguaje | No disponible | Apache 2.0 | Variante rapida y eficiente de la familia |
| LightOnOCR-2-1B | No disponible | Arquitectura propia de LightOnOCR-2 | No disponible | Apache 2.0 | Generacion anterior; sin las funciones de grounding, descripcion de imagenes ni extraccion de datos de graficos |

Fuera de la familia LightOnOCR no se dispone de datos suficientes en la informacion proporcionada para establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card advierte que cualquier instruccion distinta del prompt vacio o de la palabra `grounding` esta fuera de distribucion; el modelo no debe usarse como asistente de proposito general ni con prompts arbitrarios.
- El modelo no tiene modo de razonamiento: se entreno y evaluo con thinking desactivado, por lo que no es adecuado para tareas que requieran cadenas de razonamiento largas.
- La model card esta truncada en la informacion disponible: no se detallan sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez, por lo que el riesgo de sesgo o de alucinacion en la transcripcion no esta cuantificado.
- Riesgo de alucinacion inherente a los modelos generativos: en OCR, esto puede manifestarse como texto inventado en regiones de baja calidad, sellos, manuscritos o tipografias inusuales. No hay datos publicados sobre tasas de error por tipo de documento.
- Lista de idiomas no declarada: aunque el OCR suele ser multilingue, no hay confirmacion oficial de cobertura y calidad por idioma, lo que es un riesgo para despliegues en produccion con idiomas concretos.
- Longitud de contexto no publicada: no es posible planificar el procesamiento de documentos de muchas paginas en una sola llamada sin validacion empirica.
- El modo grounding incrementa la salida alrededor de un 25 % en tokens, lo que afecta al coste y a la latencia en comparacion con la transcripcion simple.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero al derivar de Qwen/Qwen3.5-4B conviene revisar tambien las condiciones del modelo base.
- No se publican pesos cuantizados: los despliegues con presupuesto de VRAM ajustado tendrian que generar sus propias cuantizaciones, con el riesgo de degradacion de precision que ello implica.
- El modelo es relativamente reciente y con bajo numero de descargas (15 en el momento de los datos), por lo que la validacion por parte de la comunidad es todavia limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Paper: https://arxiv.org/pdf/2601.14251
- Segundo paper referenciado: https://arxiv.org/abs/2412.13663
- Blog de presentacion: https://huggingface.co/blog/lightonai/lightonocr-3
- Demo: https://huggingface.co/spaces/lightonai/LightOnOCR-3-Demo
- Repositorio GitHub: https://github.com/lightonai/LightOnOCR
- LightOnOCR-2-1B: https://huggingface.co/lightonai/LightOnOCR-2-1B
- LightOnOCR-3-1B: https://huggingface.co/lightonai/LightOnOCR-3-1B
- LightOnOCR-3-0.8B: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Web de LightOn: https://lighton.ai
- LinkedIn: https://www.linkedin.com/company/lighton/
- X: https://x.com/LightOnIO
- Logo del modelo: https://huggingface.co/lightonai/LightOnOCR-3-4B/resolve/main/lightonocr3_logo.png
