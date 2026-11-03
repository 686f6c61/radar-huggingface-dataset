# mradermacher/Dots.OCR-Latest-BF16-GGUF

## Resumen

Dots.OCR-Latest-BF16-GGUF es una cuantizacion en formato GGUF del modelo Dots.OCR-Latest-BF16, publicado por el usuario mradermacher. El modelo original, alojado por prithivMLmods, es un modelo de vision-lenguaje (VLM) especializado en reconocimiento optico de caracteres (OCR) y extraccion de contenido de documentos, con salida en formato Markdown. Esta version GGUF permite ejecutar el modelo en entornos con llama.cpp y otras herramientas compatibles, reduciendo el peso desde los aproximadamente 3,7 GB del f16 hasta 0,9 GB en cuantizacion Q2_K.

El modelo cuenta con 1.777.088.000 parametros totales segun los datos de safetensors, lo que lo situa en la categoria de modelos pequenos y desplegables en hardware de consumo. Incorpora un componente multimodal (mmproj) que se distribuye como archivo separado en el repositorio, necesario para procesar imagenes. La licencia MIT facilita su uso comercial sin restricciones significativas.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar OCR basado en VLM en local, sin depender de APIs externas, con cuantizaciones que van desde 0,9 GB hasta 3,7 GB. El repositorio acumula 122 descargas y fue creado en abril de 2026, con actualizacion en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en transformer, con componente multimodal mmproj; detalles internos no disponibles |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (con archivos mmproj separados para el componente multimodal) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original en la informacion proporcionada. Se trata de un modelo de vision-lenguaje orientado a OCR y extraccion de documentos, con salida en Markdown, segun las etiquetas del repositorio (ocr, document, vlm, extraction, markdown). El repositorio incluye archivos mmproj (multi-modal projection) en cuantizaciones Q8_0 y f16, lo que confirma la presencia de un codificador visual que proyecta representaciones de imagen al espacio del modelo de lenguaje.

No se han proporcionado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El proceso de cuantizacion fue realizado por mradermacher con quantize_version 2 y output_tensor_quantised 1, segun los metadatos del README.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos.
- Extraccion de contenido estructurado con salida en formato Markdown.
- Procesamiento de vision-lenguaje: acepta imagenes como entrada junto con instrucciones textuales.
- Generacion de texto conversacional (etiqueta conversational en el repositorio).
- Compatibilidad con text-generation-inference y endpoints compatibles, segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentos escaneados: el modelo convierte imagenes de documentos en texto Markdown estructurado, adecuado para pipelines de ingestion documental en archivos y gestores de contenido.
- Extraccion de datos de facturas y recibos: al procesar la imagen del documento y devolver Markdown, permite parsear campos clave mediante post-procesado del texto generado.
- Conversion de PDFs escaneados a Markdown: combinado con una etapa de rasterizacion de paginas, el modelo genera representaciones textuales con estructura (titulos, listas, tablas) para su publicacion o indexacion.
- Procesamiento local sin conexion: gracias a las cuantizaciones GGUF de 0,9 a 2,0 GB, puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp, util para entornos con requisitos de privacidad.
- Indexacion de corpus documentales para RAG: la salida en Markdown facilita el chunking y la generacion de embeddings para sistemas de recuperacion aumentada.
- Automatizacion de archivado y catalogacion: el modelo puede extraer texto de imagenes en lotes dentro de un pipeline batch, reduciendo la dependencia de servicios OCR en la nube.
- Prototipado rapido de aplicaciones OCR: el tamano reducido y la licencia MIT permiten integrar el modelo en pruebas de concepto y productos comerciales sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB (Q2_K), 1,2 GB (Q4_K_M), 2,0 GB (Q8_0) y 3,7 GB (f16), sin contar el archivo mmproj (1,4 GB en Q8_0 o 2,6 GB en f16) ni el contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM puede ejecutar las cuantizaciones bajas; para f16 con mmproj f16 se recomienda al menos 8 GB. GPU de datacenter (A100, H100) no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, asi como en Apple Silicon mediante Metal.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y herramientas compatibles con GGUF; el repositorio tambien menciona compatibilidad con text-generation-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dots.OCR-Latest-BF16-GGUF (este) | 1.777.088.000 | no disponible | MIT | GGUF | OCR/VLM especializado, cuantizaciones desde 0,9 GB |
| Dots.OCR-Latest-BF16 (original) | 1.777.088.000 | no disponible | MIT | safetensors/pytorch | Modelo base sin cuantizar |
| Alternativas de OCR/VLM de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente sobre modelos comparables en la documentacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Alucinacion: como todo modelo generativo, puede producir texto inexistente en la imagen o interpretar erroneamente caracteres ambiguos; se recomienda validacion en entornos de produccion.
- Sesgos: no se documentan sesgos conocidos, pero al no disponerse de informacion sobre el dataset de entrenamiento no puede descartarse su presencia.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar el procesamiento de documentos muy extensos o multiples paginas en una sola pasada.
- Dependencia del componente mmproj: para procesar imagenes es imprescindible descargar y configurar el archivo mmproj correspondiente; sin el, el modelo no puede realizar OCR.
- Cuantizaciones bajas: Q2_K y Q3_K pueden degradar la calidad de extraccion; el autor recomienda Q4_K_S o Q4_K_M como equilibrio entre velocidad y calidad.
- Licencia: MIT permite uso comercial, pero se recomienda verificar la procedencia y los terminos del modelo base original (prithivMLmods/Dots.OCR-Latest-BF16) antes de su explotacion.
- Madurez: el repositorio tiene pocas descargas (122) y no se han publicado benchmarks, por lo que su fiabilidad en produccion no esta contrastada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Dots.OCR-Latest-BF16-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/Dots.OCR-Latest-BF16
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Dots.OCR-Latest-BF16-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Dots.OCR-Latest-BF16-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
