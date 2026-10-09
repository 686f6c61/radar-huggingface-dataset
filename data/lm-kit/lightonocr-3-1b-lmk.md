# lm-kit/lightonocr-3-1b-lmk

## Resumen

LightOnOCR 3 1B es un modelo de vision-lenguaje especializado en reconocimiento optico de caracteres (OCR) de extremo a extremo, desarrollado originalmente por LightOn y empaquetado en este repositorio por lm-kit para su SDK on-device LM-Kit.NET y la plataforma LM-Kit One. Resuelve la conversion de documentos en imagen o PDF a texto estructurado, con dos modos de operacion: transcripcion (la pagina se devuelve como Markdown limpio, con tablas en HTML y formulas en LaTeX) y grounding (cada bloque de la pagina se devuelve etiquetado por categoria y con su bounding box en pixeles de la imagen original).

El modelo parte de lightonai/LightOnOCR-3-1B y emplea la arquitectura LightOnOCR 2, compuesta por un codificador visual Pixtral y un decodificador Qwen3. Segun los datos reales de safetensors, cuenta con 596.049.920 parametros y el repositorio ocupa 2,6 GB, lo que lo situa en la gama compacta de modelos de OCR multimodal, aptos para ejecucion local sin depender de APIs en la nube.

Su relevancia actual radica en dos aspectos: por un lado, cubre tareas de document AI (analisis de layout, reconocimiento de tablas, formulas y graficos) que tradicionalmente requerian pipelines de varios modelos especializados; por otro, su empaquetado como archivo .lmk cuantizado a Q4_K_M junto con el proyector visual permite desplegarlo en aplicaciones .NET de escritorio y servidor con recursos limitados. Las paginas se procesan a la resolucion de entrenamiento, con un borde mayor de 2048 px en el nivel `ImageDetail.High`, lo que condiciona el consumo de memoria y el tiempo de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightOnOCR 2: codificador visual Pixtral + decodificador Qwen3 |
| Parametros totales | 596.049.920 (dato real de safetensors) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo .lmk) y F16 (GGUF) |
| Idiomas soportados | multilingue (lista de idiomas no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (F16) para el modelo de lenguaje y el proyector visual; .lmk (archivo que integra modelo y proyector cuantizados a Q4_K_M) |
| Tamano del repositorio | 2,6 GB |
| Pipeline | image-to-text |
| Resolucion de entrada | borde mayor de 2048 px (`ImageDetail.High`) |
| Modelo base | lightonai/LightOnOCR-3-1B |
| Libreria / runtime | lm-kit (LM-Kit.NET, LM-Kit One) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la generacion LightOnOCR 2, que combina un codificador de vision Pixtral con un decodificador de lenguaje Qwen3. Esta estructura es la que diferencia al modelo de 1B dentro de la familia LightOnOCR 3, ya que las variantes de 0,8B y 4B usan una arquitectura de vision-lenguaje basada en Qwen3.5. La ficha del repositorio no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO, por lo que esos datos se consideran no disponibles.

El modelo opera en dos modos. En transcripcion devuelve la pagina como Markdown en orden de lectura natural, con las tablas en HTML y las formulas en LaTeX. En grounding devuelve cada bloque de la pagina con una etiqueta de categoria (title, text, list, table, formula, caption, header, footer, page number, footnote, image, chart, entre otras) y su bounding box en pixeles de la imagen de origen; las imagenes reciben una descripcion corta y los graficos se convierten en una tabla HTML con sus puntos de datos. LM-Kit expone ambos modos a traves de la enumeracion `VlmOcrIntent` (Markdown, PlainText, OcrWithCoordinates, LayoutAnalysis, TableRecognition, FormulaRecognition, ChartRecognition), de forma que el usuario no necesita redactar un prompt. No se documentan en la informacion disponible innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Transcripcion de paginas completas a Markdown con orden de lectura natural.
- Conversion de tablas a HTML dentro del texto transcrito.
- Conversion de formulas a LaTeX.
- Grounding de bloques con categoria de layout y bounding box en pixeles de la imagen original.
- Analisis de layout que incluye figuras, no solo texto.
- Descripcion breve de imagenes detectadas en la pagina.
- Reconocimiento de graficos, devolviendo sus puntos de datos como tabla HTML.
- Operacion multilingue (idiomas concretos no disponibles).
- Procesamiento a resolucion alta (borde mayor de 2048 px) para documentos densos.
- Integracion con el SDK LM-Kit.NET mediante intents tipados, sin ingenieria de prompts.

No hay informacion disponible sobre soporte de tool calling, function calling, comportamiento agentico, razonamiento multi-paso, modo de pensamiento (thinking), audio o capacidades que vayan mas alla del OCR y la comprension de documentos.

## Casos de uso

- Digitalizacion y archivado de documentos: el modelo convierte PDF e imagenes escaneadas a Markdown estructurado, lo que permite almacenar texto buscable y reutilizable a partir de material fisico o de escaneos de baja calidad, conservando tablas y formulas.
- Extraccion de tablas en facturas e informes financieros: mediante `VlmOcrIntent.TableRecognition`, las tablas se devuelven en HTML, lo que facilita su conversion posterior a CSV o su carga en una base de datos relacional.
- Analisis de layout para pipelines de RAG: con `LayoutAnalysis` cada bloque se entrega etiquetado (titulo, parrafo, leyenda, encabezado, pie de pagina) y con coordenadas, lo que permite trocear el documento por secciones logicas en lugar de por longitud fija de caracteres.
- Reconocimiento de formulas en articulos cientificos y documentacion tecnica: la salida en LaTeX se puede integrar directamente en editores como LaTeX o MathML, evitando transcripcion manual.
- Extraccion de datos de graficos en informes y presentaciones: `ChartRecognition` transforma un grafico de barras o lineas en una tabla HTML de puntos de datos, util para reutilizar cifras que de otro modo solo existirian como imagen.
- Procesamiento on-device en aplicaciones .NET: gracias al archivo .lmk cuantizado a Q4_K_M y al SDK LM-Kit.NET, el OCR puede ejecutarse localmente en una estacion de trabajo, lo que resulta adecuado para entornos con requisitos de confidencialidad en los que no se permite enviar documentos a servicios en la nube.
- Indexacion de fondos documentales multilingues: al ser multilingue, el modelo permite unificar el tratamiento de documentos en varios idiomas dentro de una misma plataforma de gestion documental.
- Automatizacion de la digitalizacion de formularios y partes con bloques estructurados, usando las coordenadas de cada elemento para mapear campos a un esquema de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos F16: en torno a 1,2 GB solo para el modelo de lenguaje (596 millones de parametros a 2 bytes por parametro), a los que se anade el proyector visual en F16 y los estados intermedios de activacion.
- VRAM estimada con cuantizacion Q4_K_M (archivo .lmk, modelo y proyector juntos): aproximadamente 0,4-0,5 GB de pesos, mas el coste de activaciones, que crece con la resolucion de entrada.
- El repositorio completo ocupa 2,6 GB, incluyendo las tres variantes de pesos.
- Perfil de hardware: al tratarse de un modelo de menos de 600 millones de parametros, cabe con holgura en GPUs de consumo como la RTX 4090, la RTX 4080 o incluso tarjetas con 8 GB de VRAM; tambien es viable la inferencia en CPU.
- GPUs de centro de datos (A100, H100) no son necesarias para el modelo, aunque pueden resultar utiles para procesar grandes volumenes de paginas en paralelo.
- Opciones de despliegue: LM-Kit.NET y LM-Kit One son el runtime previsto por el empaquetador; los pesos GGUF (modelo F16 y proyector `mmproj`) son compatibles con runtimes que soporten modelos de vision en formato GGUF, como llama.cpp, siempre que se cargue tambien el proyector visual.
- Latencia y throughput: no disponibles. El coste por pagina dependera de la resolucion efectiva de entrada (hasta 2048 px de borde mayor) y del hardware empleado.

## Comparativa con modelos similares

Comparativa dentro de la propia familia LightOnOCR 3, segun los datos de la model card:

| Modelo | Arquitectura | Posicionamiento |
|---|---|---|
| lightonocr-3:0.8b | Qwen3.5 vision-language | La variante mas rapida |
| lightonocr-3:1b (objeto de esta ficha) | LightOnOCR 2: Pixtral + Qwen3 | Actualizacion directa para despliegues de LightOnOCR 2 |
| lightonocr-3:4b | Qwen3.5 vision-language | La variante mas precisa |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos de OCR multimodal de otros proveedores en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con modelos externos.

## Limitaciones y advertencias

- No hay informacion disponible sobre sesgos conocidos del modelo.
- No hay informacion disponible sobre la tasa de alucinacion en la transcripcion; en modelos de vision-lenguaje aplicados a OCR, el riesgo de omitir o inventar contenido en documentos densos o de baja calidad es un aspecto a validar antes de usarlo en produccion.
- La lista concreta de idiomas soportados no esta disponible; la etiqueta de la ficha indica unicamente "multilingual".
- La longitud de contexto no esta especificada, lo que impide calcular de antemano cuantas paginas o cuantos bloques caben en una sola pasada.
- El rendimiento depende de la resolucion de entrada: la model card indica que las paginas deben procesarse con un borde mayor de 2048 px, lo que incrementa el consumo de memoria y el tiempo de inferencia frente a entradas reducidas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los terminos de los pesos originales en lightonai/LightOnOCR-3-1B, ya que la model card remite a la ficha original para los detalles de entrenamiento y evaluacion.
- El formato .lmk es especifico del ecosistema LM-Kit; para usarlo fuera de ese runtime hay que recurrir a los archivos GGUF (modelo F16 y proyector `mmproj`).
- No se documentan capacidades de tool calling, agentes o razonamiento multi-paso; el modelo esta orientado exclusivamente a entrada de imagen y salida de texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lm-kit/lightonocr-3-1b-lmk
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-1B
- SDK LM-Kit.NET: https://lm-kit.com/products/lm-kit-net/

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a entidades no relacionadas (LM Studio, Lexus LM, publicaciones sin vinculacion con el proyecto).
