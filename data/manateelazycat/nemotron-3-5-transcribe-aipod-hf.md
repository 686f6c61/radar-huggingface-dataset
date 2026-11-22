# manateelazycat/Nemotron-3.5-Transcribe-AIPod-HF

## Resumen

Nemotron-3.5-Transcribe-AIPod-HF es una distribución en formato GGUF del modelo de reconocimiento automático del habla (ASR) Nemotron 3.5 Transcribe, publicada por el usuario manateelazycat bajo la licencia OpenMDW-1.1. El modelo original procede del linaje Nemotron de NVIDIA, aunque la model card disponible no detalla el autor del checkpoint base ni la composición exacta del dataset de entrenamiento. Con 783.857.231 parámetros (aproximadamente 0,78 mil millones), se sitúa en la gama de modelos ASR compactos orientados a despliegue en producción.

La relevancia de esta publicación radica en su configuración para contexto largo: la model card declara una ventana nativa de 65.536 tokens por petición, cuatro slots de decodificación y 262.144 celdas KV compartidas, lo que permite procesar hasta una hora de audio nativo por solicitud. Incorpora además validación de marcas de tiempo a nivel de palabra y de cobertura de cola del audio, aspectos críticos en transcripción de reuniones, podcasts y material audiovisual largo.

El paquete se distribuye como conversión GGUF (26,8 GB de repositorio, presumiblemente con múltiples niveles de cuantización), lo que facilita su ejecución en entornos con llama.cpp u otros runtimes compatibles. La model card advierte que la cualificación del modelo cubre únicamente los conjuntos de habla natural y dispersa registrados, y que el habla sintética multilingüe con repeticiones extremas no alcanzó el umbral de calidad exigido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR; detalles del backbone no publicados en la informacion disponible) |
| Parametros totales | 783.857.231 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens por peticion (ventana nativa declarada); 262.144 celdas KV compartidas |
| Tipos de cuantizacion | no disponible (el repo es GGUF; niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de encoder/decoder, atencion, capas, dimensiones ocultas). Se trata de un modelo de reconocimiento automatico del habla con 783.857.231 parametros, empaquetado en GGUF para inferencia local o en servidor. La model card menciona una configuracion de decodificacion con cuatro slots y 262.144 celdas KV compartidas, lo que sugiere un mecanismo de cache KV particionado para atender peticiones concurrentes de audio largo sin reasignar memoria por slot.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card indica que los pesos y las dependencias se mantienen con sus pines publicos exactos recogidos en `reused-inputs.json`, lo que apunta a una publicacion de reempaquetado mas que a un reentrenamiento. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico del habla (ASR) con salida de transcripcion textual.
- Procesamiento de audio largo: hasta una hora de audio nativo por peticion gracias a la ventana de 65.536 tokens.
- Generacion de marcas de tiempo a nivel de palabra.
- Validacion de cobertura de cola del audio (tail-coverage validation), util para detectar truncamientos.
- Decodificacion concurrente mediante cuatro slots con cache KV compartida.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (los idiomas no se especifican en la informacion).
- Modo thinking, vision o audio generativo: no disponible.

## Casos de uso

- Transcripcion de reuniones y entrevistas de larga duracion: la ventana de 65.536 tokens y el soporte de una hora de audio nativo permiten procesar una sesion completa en una sola peticion, con marcas de tiempo por palabra para generar actas navegables.
- Generacion de subtitulos para video y podcast: las marcas de tiempo a nivel de palabra y la validacion de cobertura de cola facilitan la sincronizacion de subtitulos y la deteccion de segmentos finales no transcritos.
- Indexacion y busqueda de archivos de audio: la transcripcion con timestamps permite construir indices de busqueda sobre grabaciones largas y saltar al instante exacto de una mencion.
- Servicio de transcripcion concurrente: los cuatro slots de decodificacion con cache KV compartida permiten atender varias peticiones simultaneas en un mismo proceso, adecuado para plataformas con varios usuarios.
- Despliegue en infraestructura propia con GGUF: el formato GGUF permite ejecutar el modelo en runtimes compatibles (por ejemplo llama.cpp) sin depender de servicios en la nube, util para entornos con requisitos de privacidad.
- Procesamiento por lotes de archivo audiovisual: la capacidad de contexto largo reduce la necesidad de segmentar manualmente el audio, simplificando pipelines de transcripcion masiva.
- Preprocesado para sistemas de analitica de voz: las transcripciones con timestamps sirven de entrada a motores de resumen, minutas o analisis de sentimiento posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la cualificacion cubre los conjuntos de habla natural y dispersa registrados, y que el habla sintetica multilingue con repeticiones extremas no alcanzo el umbral de calidad; no se aportan cifras de WER, MMLU ni otras metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; con 783.857.231 parametros, en cuantizacion de 8 bits el peso ronda los 0,8 GB y en 4 bits aproximadamente 0,4 GB, a lo que hay que sumar la cache KV para contexto largo (262.144 celdas compartidas), cuyo consumo depende del runtime y del tipo de dato.
- GPU recomendadas: no disponibles en la informacion; por tamano del modelo, una GPU consumer moderna con suficiente memoria para la cache KV seria suficiente, pero no se confirma.
- Compatibilidad con GPU consumer: probable por numero de parametros, aunque el consumo de la cache KV para audio de una hora puede ser el factor limitante; no confirmado.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; no se documentan integraciones con vLLM, TGI u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La model card advierte que el habla sintetica multilingue con repeticiones extremas no alcanzo el umbral de calidad; el rendimiento en esos casos puede degradarse.
- La cualificacion se limita a los conjuntos de habla natural y dispersa registrados; no hay garantias documentadas fuera de esos escenarios.
- No se especifican los idiomas soportados, por lo que el comportamiento multilingue es incierto.
- No hay datos publicados de sesgos, tasas de alucinacion ni robustez ante ruido, acentos o solapamiento de hablantes.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la informacion disponible no detalla sus restricciones concretas.
- El repositorio ocupa 26,8 GB, lo que implica requisitos de almacenamiento considerables si se incluyen varias cuantizaciones.
- El modelo es un reempaquetado GGUF de pesos existentes; la calidad final depende del checkpoint base y del proceso de conversion, no documentados en detalle.
- No se documentan capacidades de diarizacion de hablantes ni de traduccion.

## Enlaces

- Hugging Face: https://huggingface.co/manateelazycat/Nemotron-3.5-Transcribe-AIPod-HF
