# PiotrSty/trocr-pl-mixed-v1

## Resumen

PiotrSty/trocr-pl-mixed-v1 es un ajuste fino del modelo PiotrSty/trocr-pl-base, un reconocedor óptico de caracteres (OCR) de línea para polaco basado en la arquitectura TrOCR (vision-encoder-decoder). Lo desarrolla PiotrSty y está pensado específicamente para transcribir líneas de texto polaco tanto impreso como mecanografiado, con especial atención al material mecanografiado histórico procedente del corpus EHRI. Con 333.921.792 parámetros, se distribuye en safetensors bajo licencia Apache 2.0 y se integra en el ecosistema transformers con el pipeline image-text-to-text.

El problema que aborda es la baja precisión del modelo base sobre texto mecanografiado: trocr-pl-base obtiene un CER del 47,30 % en el conjunto de prueba EHRI, lo que lo hace poco utilizable en ese dominio. Mediante un ajuste QLoRA con datos mixtos (2.000 líneas sintéticas impresas y 349 líneas reales mecanografiadas), esta versión reduce el CER al 33,95 % en mecanografiado y al 7,09 % en impreso, mejorando ambos dominios simultáneamente.

Se trata de un modelo experimental, con 0 descargas y 0 likes en el momento de la consulta, publicado como parte del proyecto OCR_engine del autor. Su relevancia actual es doble: por un lado, demuestra que un ajuste mixto y de bajo rango puede mejorar dos dominios de OCR a la vez sin sacrificar ninguno; por otro, es un ejemplo práctico de adaptación de un modelo de reconocimiento de líneas a un dominio histórico con muy pocos datos reales etiquetados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR) |
| Parametros totales | 333.921.792 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento uso QLoRA; no se documentan cuantizaciones de inferencia) |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | PiotrSty/trocr-pl-base |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es de tipo vision-encoder-decoder, la estructura empleada por la familia TrOCR: un codificador que procesa la imagen de la línea de texto y un decodificador autorregresivo que genera la secuencia de caracteres. El modelo trabaja a nivel de línea, no de página completa, por lo que requiere una segmentación previa del documento. La información disponible no detalla los backbones concretos del codificador y el decodificador ni la configuración del tokenizador.

El entrenamiento se realizó con QLoRA sobre el decodificador, aplicando adaptadores de bajo rango únicamente a las proyecciones de atención q, k, v y out_proj, con rango 16 y alpha 32. El conjunto de entrenamiento combinó 2.000 líneas sintéticas de polaco impreso con 349 líneas reales mecanografiadas del corpus EHRI (3 documentos), con 38 líneas de validación procedentes de un documento reservado (ZIH3010905). Se entrenaron 5 épocas con batch de 8 y tasa de aprendizaje 2e-4 sobre 2 GPU T4. El mejor checkpoint fue checkpoint-735, con un CER de validación de 0,3351. El reparto de datos se hizo a nivel de documento para evitar fugas de líneas entre entrenamiento y validación.

## Capacidades

- Reconocimiento de texto polaco a nivel de línea en imágenes, tanto impreso como mecanografiado.
- Transcripción de documentos mecanografiados históricos procedentes del dominio EHRI.
- Generación de texto condicionada por imagen mediante el pipeline image-text-to-text de transformers.
- Mejora simultánea en dos dominios (impreso y mecanografiado) respecto al modelo base, según la evaluación del autor.
- No soporta tool calling ni function calling: es un modelo de OCR, no un modelo de lenguaje conversacional.
- No soporta uso como agente ni razonamiento multi-paso.
- Capacidad multilingüe limitada al polaco.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la lectura de texto en imagen.
- No realiza segmentación de página: la entrada debe ser una línea ya recortada.

## Casos de uso

- Digitalización de archivos mecanografiados históricos: el modelo está entrenado específicamente sobre líneas mecanografiadas del corpus EHRI, por lo que es adecuado para proyectos de memoria histórica y archivos del Holocausto que necesitan transcribir documentos de mediados del siglo XX en polaco.
- Pipelines de OCR sobre impresos en polaco: con un CER del 7,09 % en el conjunto real-lines-v1, resulta apto para digitalizar libros, prensa y documentos administrativos impresos, siempre que se disponga de un segmentador de líneas previo.
- Reconocimiento de líneas tras segmentación manual: dado que el modelo no segmenta páginas, encaja en flujos donde un operador o un modelo auxiliar recorta las líneas y este modelo se encarga exclusivamente del reconocimiento.
- Búsqueda full-text en corpus polacos: las transcripciones generadas pueden indexarse para permitir búsquedas por palabra clave en colecciones que hoy solo existen como imágenes, aunque el WER alto en mecanografiado obliga a revisión humana.
- Humanidades digitales e investigación histórica: permite generar transcripciones de trabajo revisables para corpus de investigación, con la ventaja de ser un modelo pequeño que puede ejecutarse en hardware modesto y de forma local.
- Punto de partida para ajustes de dominio: al ser un fine-tune de bajo rango sobre trocr-pl-base, sirve como inicialización para adaptar el OCR a otras colecciones polacas con pocos cientos de líneas etiquetadas.
- Extracción de datos de formularios mecanografiados: para campos cortos y con tipografía regular, puede extraer valores línea a línea, aceptando una tasa de error de palabra elevada que exigirá validación posterior.
- Evaluación comparativa de métodos de adaptación: su configuración QLoRA documentada (rango 16, alpha 32, solo proyecciones de atención del decodificador) lo convierte en una referencia reproducible para estudiar el efecto del ajuste mixto en OCR de bajo recurso.

## Benchmarks y rendimiento

| Modelo | EHRI test (81 lineas, mecanografiado) | real-lines-v1 (75 lineas, impreso) |
|---|---:|---:|
| trocr-pl-base (run2) | CER 47,30 % / WER 90,82 % | CER 11,11 % / WER 35,84 % |
| trocr-pl-mixed-v1 (run3) | CER 33,95 % / WER 85,69 % | CER 7,09 % / WER 29,44 % |

Según el autor, el ajuste mixto mejora ambos dominios: una reducción del 28 % en CER sobre mecanografiado y del 36 % en CER sobre impreso. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni son aplicables a un modelo de OCR.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,34 GB solo de pesos, con un consumo real esperado de 2 a 3 GB contando activaciones y overhead.
- VRAM estimada en fp16/bf16: alrededor de 0,67 GB de pesos, en torno a 1 a 1,5 GB en ejecución.
- VRAM estimada en int8: aproximadamente 0,35 GB de pesos, por debajo de 1 GB en total.
- Cabe en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con suficiente memoria compartida.
- Inferencia en CPU viable dado el tamaño del modelo, aunque con mayor latencia por línea.
- GPU de referencia usada en el entrenamiento: 2 x NVIDIA T4 de 16 GB.
- Opciones de despliegue: la librería declarada es transformers con pipeline image-text-to-text; no se documentan instrucciones para vLLM, TGI, llama.cpp, Ollama ni formatos GGUF, y al tratarse de un modelo vision-encoder-decoder el soporte en esas herramientas no está garantizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER EHRI (mecanografiado) | CER impreso | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PiotrSty/trocr-pl-mixed-v1 | 333.921.792 | no disponible | 33,95 % | 7,09 % | Apache 2.0 | HuggingFace |
| PiotrSty/trocr-pl-base | no disponible | no disponible | 47,30 % | 11,11 % | no disponible | HuggingFace |
| TrOCR de Microsoft (variantes base impresa y manuscrita) | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparación directa solo es posible contra el modelo base del propio autor, ya que es el único para el que la información proporcionada incluye resultados sobre los mismos conjuntos de evaluación. Las variantes originales de TrOCR de Microsoft no están evaluadas en los conjuntos EHRI ni real-lines-v1, y no se dispone de sus cifras de parámetros o licencia en la información consultada.

## Limitaciones y advertencias

- El WER en mecanografiado sigue siendo muy alto (85,69 %), lo que indica un rendimiento débil a nivel de palabra; el uso en producción requiere revisión humana.
- Solo se usaron 349 líneas reales mecanografiadas para el ajuste, procedentes de 3 documentos, lo que limita la generalización a otras tipografías, calidades de escaneo o series documentales.
- La segmentación de página en mecanografiado desvaído no es fiable y el modelo no la realiza: es exclusivamente un reconocedor de líneas.
- El propio autor advierte de que no debe usarse como sustituto directo de trocr-pl-base sin una evaluación propia sobre los datos del usuario.
- Riesgo de sustituciones y omisiones a nivel de palabra, especialmente en texto degradado o con tinta irregular; el CER bajo en impreso no implica ausencia de errores semánticos.
- Modelo monolingüe en polaco: no reconoce otros idiomas y no se documenta comportamiento sobre alfabetos distintos.
- Sesgos potenciales derivados del dominio de entrenamiento: sobrerrepresentación de documentos históricos mecanografiados de origen EHRI y de texto sintético, con vocabulario y formato restringidos a ese contexto.
- Licencia Apache 2.0, que permite uso comercial, pero el corpus de origen EHRI se publica bajo CC-BY 4.0 y su uso derivado requiere atribución según los términos de ese dataset.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta: no existe validación independiente por parte de la comunidad.
- No se documentan longitudes máximas de secuencia, tipos de cuantización de inferencia ni comportamiento en lotes grandes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PiotrSty/trocr-pl-mixed-v1
- Modelo base: https://huggingface.co/PiotrSty/trocr-pl-base
- Dataset EHRI en polaco: https://huggingface.co/datasets/PiotrSty/ehri-pl-lines
- Repositorio de codigo fuente: https://github.com/PiotrStyla/OCR_engine (commit 7065e6a)
- Artefactos de trazabilidad incluidos en el repositorio: run.json, selection.json, best_metrics.json
