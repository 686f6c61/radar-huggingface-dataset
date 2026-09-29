# richardyoung/Unlimited-OCR-GGUF

## Resumen

Unlimited-OCR-GGUF es una distribucion cuantizada en formato GGUF del modelo baidu/Unlimited-OCR, un modelo de vision-lenguaje de aproximadamente 2.930 millones de parametros orientado a OCR y analisis de estructuras de documentos. La publica el usuario richardyoung bajo licencia MIT, y su proposito es hacer ejecutable el modelo original de Baidu en herramientas de inferencia local como llama.cpp y Ollama, incluyendo el proyector de vision (mmproj) necesario para procesar imagenes.

El modelo resuelve una tarea concreta: la transcripcion de documentos con preservacion del diseno. En lugar de devolver unicamente texto plano, Unlimited-OCR devuelve cada region de texto acompanada de su tipo y su caja delimitadora (bounding box), por ejemplo `title [34, 88, 370, 172]INVOICE 4471`, y marca las ilustraciones como regiones `image [x1, y1, x2, y2]` sin describirlas. Esta orientado al analisis de documentos de formato largo en una sola pasada, siguiendo la estela de propuestas como DeepSeek-OCR.

Es relevante ahora porque permite desplegar un OCR multimodal de ~3B en hardware de consumo, sin depender de APIs externas, con cuantizaciones Q4_K_M y Q8_0 y compatibilidad directa con Ollama. Su repo pesa 5,9 GB e incluye tanto los pesos del modelo de lenguaje como el proyector de vision en f16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (encoder de vision + proyector + modelo de lenguaje); detalles internos del backbone no disponibles |
| Parametros totales | 2.934.734.080 (~2,93B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (modelo de lenguaje); el proyector de vision se distribuye en F16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Se trata de una cuantizacion del modelo base baidu/Unlimited-OCR, descrito en su repositorio como un modelo de vision-lenguaje de ~3B para OCR de un solo disparo sobre documentos largos ("one-shot long-horizon parsing"). La arquitectura subyacente combina un encoder de vision con un proyector multimodal que alimenta a un modelo de lenguaje; el repo GGUF separa ambos componentes, de modo que el proyector (`mmproj-Unlimited-OCR-F16.gguf`) se mantiene en f16 mientras que el modelo de lenguaje se ofrece en Q4_K_M y Q8_0.

La conversion se realizo con el script `convert_hf_to_gguf.py` de llama.cpp, en sus modos de texto y `--mmproj`, y la cuantizacion con `llama-quantize`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. Tampoco se detallan innovaciones arquitectonicas internas mas alla del enfoque de analisis de documentos de horizonte largo en una unica pasada.

## Capacidades

- OCR de documentos con salida estructurada: cada region de texto se devuelve con su etiqueta de tipo y su caja delimitadora.
- Preservacion de la estructura de diseno: distingue titulos, texto y otros tipos de region.
- Deteccion y marcado de regiones de imagen como `image [x1, y1, x2, y2]`, sin generar descripciones del contenido visual.
- Entrada de imagen y texto (pipeline `image-text-to-text`), con soporte multimodal.
- Modo conversacional segun las etiquetas del repositorio.
- Compatibilidad con llama.cpp y Ollama para inferencia local.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.
- El autor advierte explicitamente de que no es un modelo de descripcion de imagenes: para eso recomienda usar un modelo de vision general.

## Casos de uso

- Digitalizacion de facturas y documentos contables: el modelo transcribe cada linea con su bounding box, lo que permite reconstruir la posicion de los campos y validar plantillas. En la prueba verificada del autor, una factura sintetica se transcribio como `title [34, 88, 370, 172]INVOICE 4471 / text [34, 249, 317, 309]Date: 2026-09-28 / text [34, 362, 418, 432]Widgets x3 $42.00 / text [34, 487, 384, 573]TOTAL: $86.20`.
- Extraccion de datos para pipelines de RPA: al devolver texto con coordenadas, se puede mapear cada campo a una posicion del formulario original y automatizar su volcado a bases de datos.
- Analisis de documentos academicos o informes largos: el enfoque de "one-shot long-horizon parsing" esta pensado para procesar paginas densas en una sola pasada, reduciendo el numero de llamadas necesarias.
- Procesamiento de documentos con elementos graficos: la deteccion de regiones `image` permite separar texto de figuras, por ejemplo para catalogar diagramas sin necesidad de describirlos.
- Despliegue en local sobre hardware de consumo: con el modelo en Q4_K_M y el mmproj en f16 se puede ejecutar OCR sin enviar documentos a servicios externos, util en entornos con requisitos de privacidad.
- Integracion en herramientas de escritorio o CLI: mediante `ollama run richardyoung/unlimited-ocr` o `llama-mtmd-cli` se puede incorporar OCR a flujos de trabajo locales; Ollama acepta imagenes tanto en la CLI como por el campo `images` de la API.
- Preprocesado para busqueda documental: la salida estructurada con tipos de region facilita indexar titulos y cuerpo de texto por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente documenta dos comprobaciones cualitativas realizadas antes de subir el modelo, ambas con la cuantizacion Q4_K_M:

| Prueba | Entrada | Salida verificada |
|---|---|---|
| Factura sintetica | Imagen de factura | `title [34, 88, 370, 172]INVOICE 4471 / text [34, 249, 317, 309]Date: 2026-09-28 / text [34, 362, 418, 432]Widgets x3 $42.00 / text [34, 487, 384, 573]TOTAL: $86.20` |
| Imagen de formas | Figura con dos formas | `image [90, 301, 382, 752] image [513, 301, 816, 752]` |

No hay cifras de MMLU, HumanEval, GSM8K ni de benchmarks de OCR como OmniDocBench en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para el modelo de lenguaje: aproximadamente 1,8-2 GB en Q4_K_M y 3,1-3,2 GB en Q8_0, calculado a partir de los 2,93B de parametros y la profundidad de bits de cada cuantizacion. A esto hay que sumar el proyector de vision en f16 (`mmproj-Unlimited-OCR-F16.gguf`), cuyo tamano exacto no se detalla; el repo completo ocupa 5,9 GB.
- En la practica, un despliegue con Q4_K_M mas mmproj deberia caber en GPUs de consumo con 6-8 GB de VRAM o mas, como RTX 3060, RTX 4060 Ti, RTX 4070 o superiores.
- GPUs de datacenter como A100 o H100 no son necesarias para este tamano; el modelo esta pensado para inferencia local.
- Opciones de despliegue confirmadas: llama.cpp mediante `llama-mtmd-cli -m Unlimited-OCR-Q4_K_M.gguf --mmproj mmproj-Unlimited-OCR-F16.gguf --image page.png -p "Transcribe all the text in this image."`, y Ollama mediante `ollama run richardyoung/unlimited-ocr` con las etiquetas `Q4_K_M` (por defecto, `latest`) y `Q8_0`.
- No se documenta compatibilidad con vLLM o TGI, ya que el formato distribuido es GGUF.
- No hay datos de latencia ni de throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/Unlimited-OCR-GGUF | ~2,93B | no disponible | OCR con bounding boxes y tipos de region | MIT | GGUF en HuggingFace, Ollama |
| baidu/Unlimited-OCR (modelo base) | ~3B | no disponible | OCR de un solo disparo para documentos largos | no disponible | HuggingFace, Baidu Cloud |
| Ai2 olmOCR-2-7B-1025 | 7B | no disponible | OCR de documentos, ajustado sobre un VLM multilingue base (Qwen2.5-VL-7B-Instruct) | no disponible | HuggingFace, playground de Ai2; el autor richardyoung tambien publica una version GGUF en Ollama |
| DeepSeek-OCR | no disponible | no disponible | OCR de documentos; referenciado como predecesor conceptual | no disponible | no disponible |

Los datos de contexto, licencia y parametros de los modelos comparados no aparecen en la informacion proporcionada; se listan unicamente los aspectos mencionados en los resultados de busqueda.

## Limitaciones y advertencias

- El modelo esta disenado para OCR con salida estructurada, no para descripcion de imagenes. El propio autor indica que para describir contenido visual hay que usar un modelo de vision general.
- Riesgo de errores en la transcripcion de textos manuscritos, tablas complejas, tipografias poco comunes o documentos de baja calidad; no se han publicado evaluaciones cuantitativas de exactitud.
- No se especifican los idiomas soportados, por lo que no hay garantia de cobertura multilingue mas alla de lo que el modelo base permita.
- No se dispone de la longitud de contexto soportada, lo que dificulta planificar el procesamiento de documentos muy largos.
- La licencia del repo GGUF es MIT, pero no se detalla la licencia del modelo base baidu/Unlimited-OCR, aspecto a verificar antes de un uso comercial.
- El numero de descargas es muy bajo (39) y no tiene likes, por lo que la validacion comunitaria es practicamente inexistente.
- Las unicas pruebas documentadas son dos ejemplos sinteticos del autor (una factura y una imagen de formas); no hay validacion en corpus reales.
- Las estimaciones de VRAM de esta ficha son calculos derivados del tamano de parametros, no cifras oficiales del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/richardyoung/Unlimited-OCR-GGUF
- Arbol de archivos del repositorio: https://huggingface.co/richardyoung/Unlimited-OCR-GGUF/tree/main
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- Repositorio GitHub del modelo base: https://github.com/baidu/Unlimited-OCR
- Pagina del modelo en Ollama: https://ollama.com/richardyoung/unlimited-ocr
- Version GGUF alternativa de Unlimited-OCR (referencia): https://inferix.co/models/sahilchachra/Unlimited-OCR-GGUF
- olmOCR-2-7B-1025 en el playground de Ai2 (modelo comparable): https://playground.allenai.org/model/olmocr-2-7b-1025
- Pagina de richardyoung/olmocr2 en Ollama (modelo comparable del mismo autor): https://ollama.com/richardyoung/olmocr2
