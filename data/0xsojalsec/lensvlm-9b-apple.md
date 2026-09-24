# 0xSojalSec/LensVLM-9B-Apple

## Resumen

LensVLM-9B es un modelo de vision-lenguaje (VLM) de aproximadamente 9.400 millones de parametros desarrollado por Apple (Apple AIML Research) y subido a HuggingFace bajo el identificador `apple/LensVLM-9B`. El repositorio analizado, `0xSojalSec/LensVLM-9B-Apple`, es una copia del modelo original. Su propuesta es poco habitual: en lugar de procesar documentos como texto plano, el modelo "escanea" imagenes comprimidas de texto y despues expande selectivamente solo las paginas relevantes a su forma sin comprimir mediante herramientas aprendidas (learned tools).

El problema que resuelve es el coste de contexto en tareas de comprension documental sobre corpus muy largos. Comprimir el texto a formato visual reduce el numero de tokens de entrada, y la expansion selectiva evita perder el detalle de las paginas que realmente importan para responder una pregunta concreta. El modelo permite elegir factores de compresion de 5x, 10x y 15x.

Esta construido sobre el modelo base Qwen/Qwen3.5-9B, con 9.409.813.744 parametros reales segun los pesos en safetensors y un repositorio de 18,8 GB. Se distribuye bajo la Apple Machine Learning Research Model License, una licencia propia de Apple que no equivale a una licencia open source estandar. El modelo se publica junto a un paper (arXiv 2605.07019) y un repositorio de codigo separado en GitHub.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model construido sobre Qwen/Qwen3.5-9B; detalles del codificador visual y del mecanismo de expansion no disponibles |
| Parametros totales | 9.409.813.744 (~9,4 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (etiquetado como "long-context" por el autor) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apple Machine Learning Research Model License (apple-amlr) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 18,8 GB |
| Factores de compresion | 5x, 10x, 15x |

## Arquitectura y entrenamiento

LensVLM-9B es un VLM multimodal que acepta imagenes de texto comprimido como entrada y combina esa representacion visual con un mecanismo de expansion selectiva. Segun la model card, el modelo "escanea imagenes comprimidas de texto y despues expande selectivamente solo las paginas relevantes a su forma sin comprimir mediante herramientas aprendidas". Es decir, el modelo no solo interpreta la imagen comprimida: decide que paginas necesita en resolucion completa y las recupera a traves de tool calls aprendidos durante el entrenamiento, lo que constituye la innovacion tecnica principal del trabajo.

El modelo parte de Qwen/Qwen3.5-9B, por lo que hereda la arquitectura y el conocimiento del modelo base de Alibaba, al que Apple ha anadido la componente visual y el comportamiento de expansion selectiva. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se especifican las dimensiones del codificador visual, la resolucion de entrada de las imagenes comprimidas ni el mecanismo exacto de las herramientas aprendidas; para esos detalles es necesario consultar el paper.

## Capacidades

- Comprension de documentos a partir de imagenes de texto comprimido, con factores de compresion de 5x, 10x y 15x.
- Expansion selectiva de contexto: identificacion de las paginas relevantes y recuperacion de su version sin comprimir mediante herramientas aprendidas.
- Respuesta a preguntas sobre documentos largos (question answering documental) en un unico flujo conversacional.
- Procesamiento multimodal image-text-to-text, con entrada de imagenes y salida de texto.
- Orientacion a contexto largo, segun las etiquetas declaradas por el autor.
- Uso conversacional (etiqueta "conversational").
- Tool calling: el mecanismo de expansion se implementa explicitamente como herramientas aprendidas.
- No se dispone de informacion sobre capacidades de generacion de codigo, matematicas avanzadas, audio, thinking mode o soporte multilingue.

## Casos de uso

- Analisis de documentacion tecnica extensa: el modelo recibe imagenes comprimidas 10x de un manual de cientos de paginas y expande unicamente las secciones relevantes para responder a una consulta concreta, reduciendo el coste de tokens frente a procesar el texto completo.
- Revision de contratos y documentacion legal: con compresion 15x se indexa visualmente un expediente completo y se expanden solo las clausulas afectadas por la pregunta, por ejemplo para localizar condiciones de rescision.
- Busqueda de evidencia en articulos cientificos: sobre un conjunto de papers comprimidos, el modelo localiza y expande las paginas con las figuras o tablas que contienen el resultado solicitado.
- Atencion al cliente sobre bases de conocimiento internas: el corpus de manuales y politicas se almacena como imagenes comprimidas y el modelo expande los fragmentos necesarios para responder en conversaciones multi-turno.
- Procesamiento de archivos historicos digitalizados: documentos escaneados que ya existen como imagen se introducen directamente sin necesidad de OCR previo, aprovechando la ruta visual nativa del modelo.
- Agentes de investigacion documental: integrado como componente de un agente, el modelo puede decidir que paginas expandir y encadenar varias expansiones antes de emitir una respuesta final.
- Auditoria de informes financieros: compresion de informes anuales completos y expansion selectiva de las notas contables relevantes para una pregunta de analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas de MMLU, HumanEval, GSM8K, DocVQA, ChartQA ni ninguna otra metrica, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo. Para datos de evaluacion hay que remitirse al paper (arXiv 2605.07019) y al repositorio de codigo, que segun la model card contiene la seccion de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 9,41 mil millones de parametros; son estimaciones, no cifras publicadas por el autor):
  - FP16/BF16: en torno a 19 GB solo de pesos, mas overhead de activaciones y cache KV.
  - INT8: en torno a 9-10 GB.
  - INT4: en torno a 5-6 GB.
- GPU recomendadas: no disponibles. Para FP16 sin cuantizar hacen falta GPUs de 24 GB o mas (RTX 3090, RTX 4090, L40S, A100 40 GB, H100).
- Cabe en GPU de consumo: previsiblemente si en tarjetas de 24 GB (RTX 3090/4090) con precision reducida, y en tarjetas de 12-16 GB si se aplica cuantizacion a 4 bits. No hay confirmacion oficial.
- Opciones de despliegue: la model card solo documenta `transformers` junto al codigo propio del repositorio `apple-aiml-research/ml-lensvlm` (`scripts/run_demo.py --model apple/LensVLM-9B`, `demo.py --model apple/LensVLM-9B --text_file ... --compression 10x`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Nota: el flujo de expansion selectiva implica llamadas adicionales a herramientas, por lo que la latencia real dependera del numero de paginas expandidas y no solo del coste de una pasada del modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para LensVLM-9B ni para alternativas comparables dentro de la informacion proporcionada, por lo que la comparativa se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LensVLM-9B | 9,41 mil millones | no disponible | VLM con compresion visual de texto y expansion selectiva | Apple ML Research Model License | HuggingFace (apple/LensVLM-9B) y copia 0xSojalSec/LensVLM-9B-Apple |
| Qwen/Qwen3.5-9B | no disponible | no disponible | LLM base, solo texto | no disponible | HuggingFace (modelo base del que deriva LensVLM) |
| Otros VLM de ~7-9B (por ejemplo familias Qwen-VL, InternVL) | no disponible | no disponible | VLM convencionales sin expansion selectiva | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al derivar de Qwen3.5-9B, el modelo puede heredar los sesgos de su modelo base y, adicionalmente, los del dataset visual empleado en el ajuste, pero no hay documentacion al respecto.
- Riesgo de alulcinacion: no cuantificado en la informacion disponible. En tareas documentales el riesgo es especialmente relevante cuando el modelo responde sobre paginas que no ha expandido.
- Limitaciones de contexto o idioma: la longitud de contexto no esta especificada y los idiomas soportados no se declaran. No se puede asumir buen rendimiento en castellano.
- Restriccion de licencia: los pesos se distribuyen bajo la Apple Machine Learning Research Model License, no bajo una licencia open source estandar. Es imprescindible revisar el texto completo antes de cualquier uso comercial; Apple aplica habitualmente restricciones al uso comercial y a la redistribucion.
- Dependencia de codigo propietario: el flujo de inferencia requiere el repositorio `ml-lensvlm`, distribuido por separado bajo la Apple Sample Code License, lo que anade condiciones distintas a las de los pesos.
- Soporte de despliegue limitado: sin GGUF, sin integracion documentada en vLLM/Ollama/TGI y sin cuantizaciones oficiales, lo que complica el despliegue en produccion.
- Madurez: el repositorio analizado no tiene descargas ni interacciones registradas, por lo que no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Datos incompletos: no hay informacion sobre dataset de entrenamiento, fases de alineamiento, evaluacion o limites de resolucion de imagen.

## Enlaces

- Modelo en HuggingFace (copia analizada): https://huggingface.co/0xSojalSec/LensVLM-9B-Apple
- Modelo original: https://huggingface.co/apple/LensVLM-9B
- Paper: https://arxiv.org/abs/2605.07019
- Codigo: https://github.com/apple-aiml-research/ml-lensvlm
- Licencia del modelo: https://huggingface.co/apple/LensVLM-9B/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- La busqueda web realizada no ha devuelto enlaces adicionales relevantes sobre este modelo.
