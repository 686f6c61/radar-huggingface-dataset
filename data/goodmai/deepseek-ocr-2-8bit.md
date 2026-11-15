# goodmai/DeepSeek-OCR-2-8bit

## Resumen

DeepSeek-OCR-2-8bit es una conversión al formato MLX, en cuantización de 8 bits, del modelo DeepSeek-OCR-2, un sistema vision-language especializado en reconocimiento óptico de caracteres (OCR) y extracción de texto a partir de imágenes. La conversión la ha publicado el usuario goodmai en Hugging Face, partiendo del checkpoint prince-canuma/DeepSeek-OCR-2 y utilizando la herramienta mlx-vlm en su versión 0.3.10. El modelo original procede de la familia DeepSeek, orientada a modelos de lenguaje y visión de código abierto.

El modelo resuelve el problema de convertir imágenes con texto (documentos escaneados, capturas, fotografías, diagramas) en texto estructurado y descripciones, con soporte multilingüe y capacidad conversacional de múltiples turnos sobre la imagen. Con 3.389.119.360 parámetros totales y un peso de repositorio de 4,0 GB, está pensado para ejecutarse en hardware Apple Silicon mediante MLX, lo que lo hace interesante para desarrolladores que quieren desplegar OCR de calidad en local sin depender de servicios en la nube.

Su relevancia actual radica en la combinación de licencia Apache 2.0 (permite uso comercial), soporte multilingüe y un pipeline image-text-to-text que va más allá del OCR clásico: no solo transcribe, sino que puede razonar y responder preguntas sobre el contenido visual. La cuantización a 8 bits reduce el coste de memoria y facilita la inferencia en equipos de consumo, a costa de una posible pérdida menor de precisión frente al modelo original en precisión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (familia DeepSeek-OCR), con codificador visual y decoder de lenguaje; requiere custom_code |
| Parametros totales | 3.389.119.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (esta version); el modelo original admite otras conversiones no detalladas |
| Idiomas soportados | multilingue (sin listado concreto de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX); repo de 4,0 GB |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo vision-language de la familia DeepSeek-OCR, con pipeline image-text-to-text y etiqueta deepseekocr_2. El checkpoint requiere codigo personalizado (custom_code) para cargarse, lo que indica que la implementacion no esta integrada de forma estandar en transformers y depende de modulos propios del modelo. El modelo combina un componente de procesamiento de imagen con un decoder de lenguaje capaz de generar texto y mantener conversaciones sobre la imagen de entrada.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. La unica informacion tecnica concreta es la relativa al proceso de conversion: se genero con mlx-vlm 0.3.10 a partir de prince-canuma/DeepSeek-OCR-2, lo que implica una conversion de pesos a formato MLX y una cuantizacion a 8 bits.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes: extraccion de texto de documentos, capturas y fotografias.
- Generacion de descripciones de imagenes (image captioning) y respuesta a preguntas sobre el contenido visual.
- Conversacion multi-turno sobre una imagen, segun la etiqueta conversational del modelo.
- Soporte multilingue, segun la etiqueta language: multilingual (sin listado cerrado de idiomas).
- Procesamiento de documentos con estructura (la especializacion OCR sugiere manejo de texto en layout, aunque no se detalla).
- Inferencia en local sobre Apple Silicon mediante MLX y mlx-vlm.
- No se confirma soporte de tool calling, function calling, agentes ni modos de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Digitalizacion de documentos escaneados en local: el modelo puede transcribir facturas, contratos o formularios a texto para pipelines internos, ejecutandose en un Mac con Apple Silicon sin enviar datos a terceros.
- Extraccion de texto de capturas de pantalla en herramientas de productividad: integrado en una app de escritorio, convierte capturas en texto copiable o en notas estructuradas.
- Procesamiento de documentacion multilingue: al ser multilingue y Apache 2.0, permite construir un servicio de OCR para documentos en varios idiomas sin coste de licencia.
- Accesibilidad: describir imagenes y leer texto en voz alta para usuarios con discapacidad visual, usando la capacidad de captioning y OCR del modelo.
- Indexacion de archivos PDF e imagenes para busqueda semantica: el texto extraido alimenta un motor de busqueda o un RAG interno, con la ventaja de ejecucion local y privacidad.
- Prototipado rapido en investigacion: gracias a la conversion MLX y a su tamano contenido (3,4 mil millones de parametros), sirve para experimentar con pipelines vision-language en un portatil Apple sin GPU dedicada.
- Automatizacion de entrada de datos en back office: lectura de albaranes o tickets y volcado a un sistema de gestion, con revision humana posterior dado el riesgo de error del OCR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo pesa 4,0 GB en cuantizacion de 8 bits, por lo que se necesita al menos ese espacio mas el overhead de activaciones y del codificador visual; en la practica, se recomienda disponer de 8 GB o mas de memoria unificada.
- GPU recomendadas: al estar en formato MLX, el destino principal es Apple Silicon (series M1, M2, M3, M4 y superiores). No se documenta soporte para CUDA en esta version.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no se confirma su funcionamiento en GPUs NVIDIA consumer con este checkpoint.
- Opciones de despliegue: mlx-vlm (comando `python -m mlx_vlm.generate`), con integracion en transformers para el modelo original. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/despliegue | Notas |
|---|---|---|---|---|---|
| DeepSeek-OCR-2-8bit (este) | 3.389.119.360 | no disponible | Apache 2.0 | MLX, safetensors, 8 bits | Conversion comunitaria para Apple Silicon |
| prince-canuma/DeepSeek-OCR-2 | no disponible | no disponible | no disponible | transformers (custom_code) | Checkpoint de origen de la conversion |
| mlx-community/DeepSeek-OCR-2-8bit | no disponible | no disponible | no disponible | MLX | Referencia citada en la model card como origen del formato |

No se dispone de datos de rendimiento comparado con alternativas como PaddleOCR, Tesseract o modelos vision-language generales, por lo que la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- La model card es minima y remite al modelo original; no documenta sesgos, tasas de error ni evaluaciones de calidad.
- Riesgo de alucinacion inherente a los modelos generativos: puede inventar texto que no aparece en la imagen, especialmente con documentos degradados o de baja resolucion.
- La cuantizacion a 8 bits puede degradar la precision del OCR frente al modelo original en precision completa; conviene validar con muestras reales antes de produccion.
- No se detalla la longitud de contexto ni el numero de idiomas soportados; el soporte multilingue es una etiqueta generica sin garantias por idioma.
- Dependencia de codigo personalizado (custom_code): la carga con transformers puede requerir versiones concretas y no es portable a todos los frameworks.
- Esta version esta orientada a MLX y Apple Silicon; no se documenta su uso en CUDA, lo que limita el despliegue en servidores tradicionales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y es una conversion comunitaria no oficial; no hay garantia de mantenimiento.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo original y de los pesos de origen antes de explotarlo en produccion.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/goodmai/DeepSeek-OCR-2-8bit
- Modelo original de referencia: https://huggingface.co/prince-canuma/DeepSeek-OCR-2
- Repositorio citado en la model card: https://huggingface.co/mlx-community/DeepSeek-OCR-2-8bit
- Herramienta de conversion: mlx-vlm (version 0.3.10), disponible en el ecosistema MLX de Apple
