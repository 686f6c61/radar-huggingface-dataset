# lm-kit/lightonocr-3-4b-lmk

## Resumen

LightOnOCR 3 4B es un modelo de vision-lenguaje especializado en conversion de documentos a texto estructurado, desarrollado por LightOn y empaquetado por LM-Kit para su SDK de IA on-device para .NET. Forma parte de la tercera generacion de modelos OCR end-to-end de LightOn, que se distribuye en tres tamanos: 0,8 B, 1 B y 4 B. La variante de 4 B es la mas precisa de la familia y utiliza una arquitectura Qwen3.5 de vision-lenguaje, con un total de 4.205.751.296 parametros densos.

El modelo resuelve dos tareas principales sobre imagenes de paginas: transcripcion, que devuelve la pagina como Markdown limpio en orden de lectura natural con tablas en HTML y formulas en LaTeX; y grounding, que devuelve cada bloque de la pagina con una etiqueta de categoria (titulo, texto, lista, tabla, formula, pie de foto, encabezado, pie de pagina, numero de pagina, imagen, grafico, etc.) y su caja delimitadora en pixeles de la imagen original. Ademas, describe imagenes y convierte graficos en tablas HTML de sus puntos de datos.

Su relevancia actual radica en que permite ejecutar OCR avanzado con analisis de maquetacion en local, sin depender de servicios en la nube, gracias al empaquetado en GGUF y en el formato .lmk de LM-Kit. La licencia Apache 2.0 facilita su integracion en productos comerciales. Esta ficha se centra en el empaquetado lm-kit/lightonocr-3-4b-lmk, no en los pesos originales de LightOn.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer (Qwen3.5 VLM), con proyector de vision y decodificador de lenguaje |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y F16 |
| Idiomas soportados | Multilingue (idiomas concretos no disponibles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo F16 y proyector de vision F16), .lmk (archivo Q4_K_M para LM-Kit); safetensors en el modelo base |

## Arquitectura y entrenamiento

La variante de 4 B emplea una arquitectura Qwen3.5 de vision-lenguaje, compuesta por un codificador de vision y un decodificador de lenguaje, unidos mediante un proyector multimodal que se distribuye como archivo independiente (`lightonocr-3-4b-mmproj-F16.gguf` en el repositorio). Esta combinacion es la misma que usa el tamano de 0,8 B, mientras que el tamano intermedio de 1 B se corresponde con LightOnOCR 2, basado en un codificador de vision Pixtral y un decodificador Qwen3. Los pesos se liberan bajo licencia Apache 2.0.

El modelo opera con dos modos de salida. En modo transcripcion devuelve la pagina completa como Markdown limpio en orden de lectura natural, con las tablas en HTML y las formulas en LaTeX. En modo grounding devuelve cada bloque de la pagina con su etiqueta de maquetacion y su caja delimitadora en pixeles de la imagen de origen; las imagenes reciben una descripcion corta y los graficos se convierten en una tabla HTML de sus puntos de datos. Las paginas se procesan a la resolucion con la que se entreno el modelo (borde mas largo de 2048 px con `ImageDetail.High`). No se dispone de informacion en el material proporcionado sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO; tampoco sobre innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Transcripcion de documentos a Markdown en orden de lectura natural, con tablas convertidas a HTML y formulas a LaTeX.
- Analisis de maquetacion con grounding: cada bloque se devuelve con su categoria (titulo, texto, lista, tabla, formula, pie de foto, encabezado, pie de pagina, numero de pagina, nota al pie, imagen, grafico, etc.) y su caja delimitadora en pixeles.
- Reconocimiento de tablas, con extraccion de su estructura y contenido.
- Reconocimiento de formulas y conversion a LaTeX.
- Reconocimiento de graficos, con conversion de los puntos de datos a una tabla HTML.
- Descripcion corta del contenido de imagenes incrustadas en la pagina.
- Procesamiento multilingue (idiomas concretos no especificados en la informacion disponible).
- Integracion con la API `VlmOcr` de LM-Kit mediante intents predefinidos (`Markdown`, `PlainText`, `OcrWithCoordinates`, `LayoutAnalysis`, `TableRecognition`, `FormulaRecognition`, `ChartRecognition`), sin necesidad de escribir prompts.
- Pipeline declarado como `image-to-text`, con soporte conversacional segun las etiquetas del repositorio.
- No se ha documentado soporte de tool calling, function calling ni de agentes multi-paso en la informacion proporcionada.

## Casos de uso

- Digitalizacion masiva de archivos PDF escaneados: el modelo convierte cada pagina a Markdown estructurado en local, lo que permite procesar lotes completos sin enviar documentos sensibles a servicios externos.
- Extraccion de datos de facturas y albaranes: mediante el modo grounding, cada campo se devuelve con su categoria y su caja delimitadora, lo que facilita mapear valores a un esquema de base de datos y auditar visualmente las extracciones.
- Conversion de informes financieros a formatos reutilizables: las tablas se emiten en HTML y las formulas en LaTeX, lo que permite reinsertar el contenido en generadores de documentacion o en sistemas de publicacion.
- Analisis de maquetacion para sistemas de recuperacion documental: la salida categorizada por bloques (titulo, encabezado, pie de pagina, nota al pie) permite segmentar documentos antes de indexarlos en un motor de busqueda o en una base vectorial.
- Extraccion de datos de graficos en articulos cientificos o informes de mercado: los graficos se convierten en tablas HTML de puntos de datos, listas para su analisis estadistico.
- Accesibilidad y lectura asistida: la transcripcion en orden de lectura natural con descripcion de imagenes permite generar versiones textuales de documentos para lectores de pantalla o para sintesis de voz.
- Automatizacion de la entrada de datos en aplicaciones .NET de escritorio o de servidor: el empaquetado para LM-Kit.NET permite invocar el modelo desde C# con unas pocas lineas, sin salir del ecosistema .NET.
- Moderacion y revision documental con trazabilidad: la salida con coordenadas (`OcrWithCoordinates`) permite resaltar sobre la imagen original que fragmento sustenta cada dato extraido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card remite a la model card original de `lightonai/LightOnOCR-3-4B` para consultar los detalles de entrenamiento y la evaluacion de los autores, pero esos datos no forman parte del material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2,5-3 GB con la cuantizacion Q4_K_M (a partir de 4,2 B de parametros a ~4,5 bits por peso, mas el proyector de vision); alrededor de 8,5-9,5 GB con F16. Estimaciones calculadas a partir del tamano del modelo, no cifras oficiales.
- GPU recomendadas: para Q4_K_M, cualquier GPU consumer con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070); para F16, GPU con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) o GPU de centro de datos como A100 o H100.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con al menos 6 GB de VRAM usando Q4_K_M. Con F16 requiere tarjetas de gama alta o de centro de datos.
- Opciones de despliegue: LM-Kit.NET (SDK on-device para .NET) y LM-Kit One son las vias documentadas en el repositorio; tambien se incluyen archivos GGUF (`lightonocr-3-4b-F16.gguf` y `lightonocr-3-4b-mmproj-F16.gguf`) que permiten su uso con runtimes compatibles con GGUF, siempre que soporten el proyector de vision. No se documenta soporte explicito de vLLM, TGI, Ollama o llama.cpp en la informacion proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Dentro de la propia familia LightOnOCR 3 se ofrecen tres tamanos, segun la model card:

| Modelo | Arquitectura | Parametros totales | Notas |
|---|---|---|---|
| `lightonocr-3:0.8b` | Qwen3.5 vision-lenguaje | no disponible | El tamano mas rapido |
| `lightonocr-3:1b` | LightOnOCR 2 (codificador Pixtral, decodificador Qwen3) | no disponible | Actualizacion directa para despliegues de LightOnOCR 2 |
| `lightonocr-3:4b` (este) | Qwen3.5 vision-lenguaje | 4.205.751.296 | El tamano mas preciso |

No se dispone de datos de rendimiento, contexto ni licencia de los tamanos 0,8 B y 1 B mas alla de lo indicado. Tampoco se han encontrado en la informacion proporcionada modelos de terceros comparables (por ejemplo, otras familias de OCR end-to-end) con datos verificables, por lo que la comparacion con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en la informacion disponible, por lo que la calidad real del modelo no puede contrastarse con datos objetivos a partir de este material.
- Como todo modelo generativo, existe riesgo de alucinacion: puede generar texto plausible que no aparece en la imagen de origen, especialmente en documentos con ruido, baja resolucion o tipografias poco habituales.
- El modelo se entreno para trabajar con un borde mas largo de 2048 px (`ImageDetail.High`). Enviar resoluciones distintas puede degradar la precision de la transcripcion y de las cajas delimitadoras.
- La lista concreta de idiomas soportados no esta especificada; la etiqueta `multilingual` no garantiza un rendimiento homogeneo en todos los idiomas.
- La longitud de contexto no esta documentada, lo que impide planificar el procesamiento de documentos de muchas paginas sin trocearlos previamente.
- No se documenta soporte de tool calling ni de razonamiento multi-paso, por lo que no debe asumirse su uso como agente.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos originales de LightOn y de las dependencias del runtime LM-Kit utilizadas.
- El archivo principal (`lightonocr-3-4b-Q4_K_M.lmk`) esta pensado para el SDK LM-Kit; su uso fuera de ese ecosistema requiere recurrir a los GGUF incluidos y a un runtime compatible con proyectores de vision multimodales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de adopcion ni de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lm-kit/lightonocr-3-4b-lmk
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- SDK LM-Kit.NET: https://lm-kit.com/products/lm-kit-net/

No se han encontrado en la busqueda web enlaces relevantes adicionales sobre el modelo; los resultados obtenidos corresponden a entidades no relacionadas.
