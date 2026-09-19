# flyingfishinwater/GLM-ASR-Nano-2512-4bit

## Resumen

GLM-ASR-Nano-2512-4bit es una version cuantizada a 4 bits del modelo de reconocimiento automatico del habla (ASR) GLM-ASR-Nano-2512, desarrollado originalmente por zai-org (Zhipu AI) y convertido al formato MLX por el usuario flyingfishinwater. El modelo resuelve la tarea de transcripcion de audio a texto y esta disenado para ejecutarse sobre el framework MLX de Apple, lo que permite inferencia local en equipos con silicio de Apple (chips de la serie M). Con aproximadamente 2.260 millones de parametros, se situa en la categoria de modelos "nano", orientados a un equilibrio entre calidad de transcripcion y huella de memoria reducida.

La relevancia de esta ficha radica en que combina tres elementos: un modelo ASR de la familia GLM, una cuantizacion de 4 bits que reduce el peso del repositorio a unos 1,3 GB y un pipeline especifico para MLX a traves de la libreria mlx-audio. Esto lo hace atractivo para desarrolladores que quieren integrar transcripcion de voz en aplicaciones locales de macOS sin depender de servicios en la nube ni de GPUs dedicadas. El modelo declara soporte para ingles (en) y chino (zh), y se distribuye bajo licencia MIT, lo que facilita su uso comercial.

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna, la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks. Esta ficha distingue en todo momento entre los datos confirmados y aquellos que no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR basado en la familia GLM; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 2.262.390.784 (~2,26 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (esta version); el modelo original puede ofrecer otras, no disponible |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX, libreria mlx-audio) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura en la documentacion proporcionada. Por los metadatos y la tarea declarada (`automatic-speech-recognition`, `speech-to-text`), se trata de un modelo de reconocimiento automatico del habla, presumiblemente con un componente de codificacion de audio conectado a un decodificador de texto de la familia GLM. La model card unicamente indica que esta version fue convertida desde `zai-org/GLM-ASR-Nano-2512` mediante mlx-audio 0.2.9, sin detallar la estructura de capas, el mecanismo de atencion ni la estrategia de fusion audio-texto.

Tampoco se especifica el volumen de datos de entrenamiento, la composicion del corpus, ni si se emplearon tecnicas de ajuste como RLHF o DPO. La unica innovacion tecnica confirmada por la informacion disponible es la conversion a cuantizacion de 4 bits y su empaquetado en formato MLX para ejecucion eficiente en hardware Apple. Cualquier afirmacion adicional sobre el entrenamiento seria especulativa y no se incluye.

## Capacidades

- Transcripcion de voz a texto (ASR): funcion principal del modelo, declarada en el pipeline `automatic-speech-recognition`.
- Procesamiento de audio en ingles y chino: los unicos idiomas soportados segun los metadatos.
- Generacion de transcripciones en formato de texto plano, con soporte para guardar la salida en fichero (parametro `format="txt"` en la API de mlx-audio).
- Ejecucion local mediante MLX: inferencia en chips de Apple sin necesidad de GPUs Nvidia.
- Uso a traves de CLI (`python -m mlx_audio.stt.generate`) y de API Python (`load_model` + `generate_transcription`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de ese tipo).
- Capacidades de vision o audio generativo: no disponibles; aunque las etiquetas incluyen `speech-to-speech` y `speech generation`, la model card no documenta un modo de sintesis de voz.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el modelo permite convertir grabaciones de audio en texto directamente en un Mac, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad. La cuantizacion a 4 bits y el tamano de 1,3 GB facilitan su ejecucion en equipos de sobremesa y portatiles de la serie M.
- Subtitulado de contenido en ingles y chino: al soportar ambos idiomas, puede emplearse para generar subtitulos de videos o podcasts en esos dos mercados, integrándose en un pipeline de postproduccion que produzca ficheros de texto listos para conversion a formatos de subtitulos.
- Aplicaciones de accesibilidad: transcripcion en tiempo casi real de conversaciones para personas con dificultades auditivas, ejecutable en un portatil sin conexion, lo que reduce la dependencia de servicios externos y la latencia de red.
- Indexacion y busqueda de archivos de audio: convertir grandes volumenes de grabaciones (entrevistas, ponencias, clases) a texto para permitir busqueda por palabras clave y analisis posterior, aprovechando el peso reducido del modelo para procesar lotes en un solo equipo.
- Preprocesado de pipelines de NLP: la transcripcion generada puede alimentar tareas posteriores como resumen, clasificacion de temas o analisis de sentimiento, sirviendo el modelo ASR como primera etapa de un sistema mas amplio.
- Asistentes de voz locales en macOS: integracion en aplicaciones de escritorio que necesiten captar comandos o dictado por voz, invocando el modelo mediante la libreria mlx-audio dentro del propio entorno de la aplicacion.
- Prototipado e investigacion en ASR: al ser un modelo pequeno y cuantizado, resulta util como linea base para experimentos academicos o para comparar tecnicas de cuantizacion y despliegue en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,3 GB en formato 4 bits, por lo que se puede estimar un consumo de memoria en el rango de 1,5 a 2,5 GB durante la inferencia, aunque no se proporciona una cifra oficial.
- GPU recomendadas: al tratarse de un modelo en formato MLX, esta optimizado para los chips de Apple (serie M1, M2, M3, M4 y variantes Pro, Max y Ultra). No se documenta soporte para GPUs Nvidia (A100, H100, RTX 4090) en la informacion proporcionada.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en equipos con silicio de Apple de gama de consumo (por ejemplo, MacBook Air o Mac mini con memoria unificada de 8 GB o superior), dado su tamano de 1,3 GB.
- Opciones de despliegue: la via documentada es la libreria mlx-audio (version 0.2.9 para la conversion), tanto por CLI como por API Python. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles. No se aportan mediciones de velocidad de transcripcion ni de uso de memoria en tiempo de ejecucion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos que permitan establecer una comparacion fundamentada con alternativas de la misma categoria.

## Limitaciones y advertencias

- Cobertura idiomatica limitada: el modelo solo declara soporte para ingles y chino, por lo que no esta indicado para transcripcion en castellano ni en otros idiomas sin una evaluacion previa.
- Ausencia de benchmarks: no se han publicado metricas de precision (WER u otras), lo que impide estimar la calidad de transcripcion frente a alternativas y exige una validacion propia antes de llevarlo a produccion.
- Riesgo de alucinacion: como todo modelo generativo de texto, puede producir palabras o fragmentos que no aparecen en el audio, especialmente con ruido de fondo, acentos marcados o audio de baja calidad. No se documentan medidas de mitigacion.
- Sesgos desconocidos: no se aporta informacion sobre la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, acento, dialecto o tematica.
- Restricciones de licencia: la licencia declarada es MIT, que permite uso comercial, modificacion y redistribucion con atribucion. Conviene verificar la licencia del modelo original `zai-org/GLM-ASR-Nano-2512`, ya que esta version es una conversion y podrian aplicar condiciones adicionales no reflejadas aqui.
- Dependencia de hardware Apple: al estar en formato MLX, su despliegue esta atado al ecosistema de silicio de Apple. No se documenta una ruta de ejecucion en GPUs Nvidia ni en CPU de otros fabricantes.
- Modelo "nano" y cuantizado a 4 bits: la compresion puede degradar la precision respecto a la version original de mayor precision; no se aporta comparacion entre ambas.
- Naturaleza del repositorio: es una conversion de terceros (autor `flyingfishinwater`), no la publicacion oficial de zai-org, por lo que la responsabilidad de validacion recae en quien lo integre.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/flyingfishinwater/GLM-ASR-Nano-2512-4bit
- Modelo original: https://huggingface.co/zai-org/GLM-ASR-Nano-2512
- Version oficial en MLX (referenciada en la model card): https://huggingface.co/mlx-community/GLM-ASR-Nano-2512-4bit
- Libreria mlx-audio (documentacion de uso e instalacion): no se proporciona URL especifica en la informacion disponible.
