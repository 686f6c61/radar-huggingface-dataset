# Alsamir/Abjad-checkpoint-9750

## Resumen

Abjad-checkpoint-9750 es un ajuste fino del modelo multimodal Qwen/Qwen3-VL-4B-Instruct orientado especificamente a OCR de texto arabe. Lo publica el usuario Alsamir en HuggingFace como un export autonomo en formato Transformers: el adaptador LoRA de la "stage 2" del entrenamiento (correspondiente al paso 9.750) ya viene fusionado en los pesos, por lo que no requiere cargar un adaptador separado. El modelo hereda la arquitectura Qwen3-VL y cuenta con 4.437.815.808 parametros (~4,4B) en precision BF16.

El problema que aborda es la transcripcion de documentos arabes a partir de imagenes: el modelo recibe una imagen (tipicamente una pagina rasterizada de un PDF) y devuelve el texto visible preservando letras y digitos arabes. Es relevante para desarrolladores que necesitan digitalizar corpus arabes, ya que parte de una base multimodal solida (Qwen3-VL) y anade ajuste especifico de dominio.

Conviene tratarlo con cautela: el propio autor advierte de que el entrenamiento se interrumpio en el paso 9.750 de los 11.000 previstos, que no se reclama ninguna puntuacion de precision verificada y que persisten posibles repeticiones, omisiones y errores de letras, digitos o maquetacion. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que es un artefacto reciente y sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3-VL); vision-lenguaje con atencion completa |
| Parametros totales | 4.437.815.808 (~4,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-VL-4B-Instruct, sin confirmar) |
| Tipos de cuantizacion | BF16 (unico formato publicado; no se distribuyen GGUF ni variantes INT4/INT8) |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (export BF16 para Transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint Qwen/Qwen3-VL-4B-Instruct, un transformer multimodal de tipo vision-lenguaje que procesa imagenes y texto. El resultado publicado es un export "standalone" en BF16 para la libreria Transformers: los pesos incluyen ya fusionada la LoRA de la segunda etapa de entrenamiento, de modo que no se necesita ningun adaptador aparte. El modelo card indica explicitamente que se abandono el formato de publicacion MLX anterior en favor de Transformers.

Respecto al entrenamiento, el checkpoint almacena el paso 9.750 de los 11.000 planificados: el proceso se interrumpio y no es una ejecucion completada. El autor no reclama un total verificado de imagenes unicas de entrenamiento ni una puntuacion de precision, y senala que la linea de etapas anteriores no ha sido auditada de forma independiente. Se realizo una comprobacion de que las salidas antes y despues de fusionar la LoRA coincidian en una imagen del dataset, pero esa verificacion solo valida el comportamiento del export, no la exactitud del OCR, y ademas la imagen podria haber formado parte del entrenamiento. No se redistribuye ningun dataset. El repositorio incluye shards completos del modelo, tokenizer, processor, configuracion y un manifiesto de checksums/procedencia (`release_manifest.json`), pero excluye documentos de entrenamiento, estado del optimizador, credenciales y rutas especificas de maquina.

## Capacidades

- Transcripcion OCR de texto arabe a partir de imagenes, preservando letras y digitos arabes.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`) mediante `AutoProcessor` y `AutoModelForImageTextToText`.
- Generacion de texto de salida en formato de transcripcion directa cuando se le indica ("Return only the transcription").
- Control de generacion determinista mediante `do_sample=False`.
- Trabajo con imagenes rasterizadas de paginas (PNG, TIFF) tras convertir previamente las paginas de PDF a imagen.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, modo "thinking", audio ni soporte multilingue mas alla del arabe.
- No se documentan capacidades de reconstruccion exacta de maquetacion ni conversion a formato Word (el autor indica que eso requiere un pipeline documental aparte).

## Casos de uso

- Digitalizacion de archivos historicos arabes: rasterizar las paginas a PNG o TIFF y usar el modelo para extraer el texto, con revision humana posterior de nombres y numeros dado el riesgo de error documentado.
- Pipeline de OCR sobre PDFs escaneados: convertir cada pagina a imagen, ejecutar inferencia con el runner provisto (`run_ocr_windows.py`) y volcar la salida a texto plano para su indizacion posterior.
- Indexacion y busqueda en corpus arabes: alimentar un motor de busqueda o un sistema RAG con las transcripciones generadas, siempre que se valide la calidad del texto extraido.
- Preprocesado para traduccion automatica arabe-espanol: el OCR genera la transcripcion de origen que despues consume un modelo de traduccion independiente.
- Extraccion de datos de formularios y documentos administrativos arabes: transcripcion de campos de texto, con advertencia expresa de revisar nombres, numeros, sellos y firmas contra el documento original.
- Analisis de documentos en entornos con GPU de consumo: al ser un modelo de ~4,4B en BF16, puede ejecutarse en una unica GPU con suficiente VRAM (por ejemplo, una RTX con 12-16 GB) para procesamiento por lotes de tamanio moderado.
- Prototipado e investigacion sobre OCR arabe: base de partida para comparar estrategias de ajuste fino y para experimentar con prompts de transcripcion.
- Despliegue en Windows o en contenedores OCI: el autor documenta un flujo con Python 3.10/3.11, PyTorch con CUDA y fallback a CPU cuando no hay GPU disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ninguna puntuacion de precision verificada ni un total de imagenes de entrenamiento, y que la fusion de la LoRA solo se comprobo sobre una imagen del dataset, lo que no constituye una evaluacion de exactitud del OCR.

## Requisitos de hardware

- VRAM para inferencia: al publicarse solo en BF16, los pesos ocupan aproximadamente 8,9 GB (tamanio del repo 8,9 GB), por lo que se recomienda una GPU con al menos 12 GB de VRAM; con margen para activaciones y cache, 16 GB es mas comodo.
- GPU recomendadas: cualquier GPU con soporte CUDA y VRAM suficiente, como RTX 4080/4090 (16-24 GB), A100, H100 o L40S. En GPUs de 12 GB (por ejemplo RTX 3060 12 GB o RTX 4070) puede ajustarse segun la longitud del prompt y el numero de tokens generados.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM, siempre que se gestione el tamanio de la imagen y de la secuencia de salida (el autor advierte de que las paginas largas pueden alcanzar el limite de tokens).
- CPU: el runner hace fallback a CPU cuando no hay CUDA, pero el autor advierte de que la inferencia en CPU puede ser lenta.
- Opciones de despliegue: Transformers (flujo documentado oficialmente) con PyTorch, Accelerate y Pillow; el autor menciona `device_map="auto"`. No se documentan soportes especificos para vLLM, llama.cpp, Ollama, TGI ni cuantizaciones GGUF en la informacion disponible.
- Entornos soportados por el autor: Windows con NVIDIA CUDA y Python 3.10 o 3.11, y contenedores OCI sobre imagen Linux con CUDA.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Abjad-checkpoint-9750 | ~4,4B | no disponible | arabe | Apache 2.0 | safetensors BF16 | Fine-tuning de Qwen3-VL-4B para OCR arabe; entrenamiento interrumpido en el paso 9.750 |
| Qwen/Qwen3-VL-4B-Instruct | ~4B (modelo base) | no disponible en la informacion | multilingue (segun modelo base) | Apache 2.0 (segun modelo base) | safetensors | Modelo base multimodal sin ajuste especifico de OCR arabe |
| Alsamir/Abjad_0.2 | no disponible | no disponible | arabe | no disponible | no disponible | Publicacion previa del mismo autor; relacion exacta con este checkpoint no detallada |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento incompleto: el checkpoint corresponde al paso 9.750 de 11.000 planificados; no es una ejecucion finalizada.
- Sin metrica de precision verificada: el autor no reclama ninguna puntuacion de exactitud ni un total auditado de imagenes de entrenamiento unicas.
- Riesgo de errores de OCR: se documentan posibles repeticiones, omisiones, letras o digitos incorrectos y errores de maquetacion.
- Recomendacion explicita de revision: hay que contrastar nombres, numeros, tablas, sellos y firmas contra el documento original.
- Sin validacion externa: el repositorio presenta 0 descargas y 0 likes, y la linea de etapas anteriores no ha sido auditada de forma independiente.
- Limitacion de idioma: el unico idioma declarado es el arabe; no hay soporte multilingue documentado.
- Limitacion de contexto: las paginas largas pueden superar el limite de tokens; puede ser necesario recortar las imagenes.
- Sin reconstruccion de maquetacion: la conversion a Word y la reconstruccion exacta del layout requieren un pipeline documental adicional.
- Licencia: Apache 2.0, lo que en principio permite uso comercial, pero el uso en produccion deberia acompanarse de un pipeline de validacion dada la falta de garantias de exactitud.
- Dependencia de versiones: se necesita una version de Transformers que soporte Qwen3-VL; las versiones exactas del export se registran en `release_manifest.json`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alsamir/Abjad-checkpoint-9750
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Publicacion previa del mismo autor: https://huggingface.co/Alsamir/Abjad_0.2
- Manifiesto de procedencia: `release_manifest.json` (incluido en el repositorio del modelo)
