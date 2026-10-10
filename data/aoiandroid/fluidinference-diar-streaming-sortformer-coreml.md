# aoiandroid/FluidInference-diar-streaming-sortformer-coreml

## Resumen

FluidInference-diar-streaming-sortformer-coreml es un modelo de diarizacion de hablantes (speaker diarization) en streaming, convertido a CoreML para su ejecucion en Apple Silicon. No se trata de un modelo de lenguaje generativo, sino de un sistema neuronal end-to-end que responde a la pregunta "quien hablo y cuando" en tiempo real, emitiendo probabilidades a nivel de trama para cuatro ranuras de hablante fijas. El modelo original fue desarrollado por NVIDIA (Sortformer) y posteriormente convertido a CoreML por FluidInference; este repositorio concreto es un espejo sin modificar de dicha conversion, mantenido por el usuario `aoiandroid` para que la aplicacion Cription no dependa de un repositorio de terceros.

A diferencia de los pipelines tradicionales de diarizacion, que encadenan etapas separadas de deteccion de actividad de voz (VAD), segmentacion y clustering, Sortformer resuelve todo el proceso de forma directa sobre la senal de audio. La conversion a CoreML esta optimizada para aprovechar el Neural Engine y la GPU integrada de los chips Apple, con configuraciones de forma estatica que permiten alcanzar valores cercanos a 120x de factor de tiempo real (RTF) en dichos dispositivos.

El repositorio espejo contiene 149 archivos (2757,6 MB) y conserva las mismas rutas que el repositorio de origen, con tamanos y hashes SHA-256 verificados. Solo se incluye el subconjunto de archivos que consume la aplicacion, no el repositorio completo. La model card original del autor se conserva como `SOURCE_README.md`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fast-Conformer (17 capas) con cabezas Transformer (18 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming, no basado en tokens) |
| Tipos de cuantizacion | no disponible (formato CoreML; precision no declarada) |
| Idiomas soportados | no disponible (diarizacion agnostica al idioma de la senal) |
| Licencia | cc-by-4.0 |
| Formato de pesos | CoreML (.mlmodelc / .mlpackage) |
| Tamano del repositorio | 2,6 GB (149 archivos, 2757,6 MB) |
| Hablantes soportados | 4 ranuras fijas |

## Arquitectura y entrenamiento

El modelo es una conversion del Sortformer de NVIDIA, un sistema de diarizacion neuronal end-to-end. La arquitectura combina un codificador Fast-Conformer de 17 capas con cabezas Transformer de 18 capas. La salida son probabilidades a nivel de trama para cuatro ranuras de hablante predefinidas, lo que elimina la necesidad de etapas separadas de VAD, segmentacion y clustering.

El trabajo de conversion a CoreML implico dos tareas principales segun la documentacion disponible: la conversion del pipeline desde PyTorch a CoreML, que afecta al Fast-Conformer y a las cabezas Transformer, y la implementacion de la logica de estado en streaming, necesaria para procesar audio de forma continua. Ademas, se configuraron formas estaticas que permiten al modelo alcanzar un factor de tiempo real (RTF) de aproximadamente 120x en Apple Silicon. No se dispone de informacion sobre el numero de tokens o horas de audio empleadas en el entrenamiento original, ni sobre la composicion del dataset, ni sobre el uso de tecnicas de ajuste como RLHF o DPO.

## Capacidades

- Diarizacion de hablantes en streaming: identifica quien habla en cada momento de la senal de audio en tiempo real.
- Salida a nivel de trama con probabilidades para cuatro ranuras de hablante fijas.
- Procesamiento end-to-end: no requiere VAD, segmentacion ni clustering externos.
- Estado en streaming: mantiene el contexto entre fragmentos de audio para diarizacion continua.
- Ejecucion optimizada en Apple Silicon mediante CoreML y el Neural Engine.
- Factor de tiempo real elevado (aproximadamente 120x RTF segun la documentacion de origen).

## Casos de uso

- Transcripcion con etiquetado de hablante: combinado con un sistema ASR, el modelo asigna a cada fragmento de texto la ranura de hablante correspondiente, lo que permite obtener actas o transcripciones de reuniones con hablantes diferenciados.
- Analisis de reuniones y entrevistas: al operar en streaming, permite segmentar por hablante conversaciones en directo y generar resumenes o estadisticas de tiempo de palabra por participante.
- Subtitulado en tiempo real: con cuatro ranuras fijas, es adecuado para paneles o debates con un numero reducido de participantes, donde se puede etiquetar quien habla en cada intervencion.
- Diarizacion local en dispositivos Apple: al ser un modelo CoreML, puede ejecutarse en un Mac o iPhone sin enviar audio a la nube, lo que resulta apropiado para aplicaciones con requisitos de privacidad.
- Preprocesado para sistemas de resumen y minutas: la salida por hablante sirve como entrada estructurada para modelos de lenguaje que generan minutas identificando acuerdos y responsables.
- Analitica de contact center: permite medir tiempos de habla de agente y cliente, detectar solapamientos y analizar la dinamica de la conversacion en tiempo real.
- Indexacion y busqueda de audio: al marcar los turnos de habla, facilita la busqueda dentro de archivos de audio o video por intervenciones de un hablante concreto.

## Benchmarks y rendimiento

La informacion disponible menciona un factor de tiempo real (RTF) de aproximadamente 120x en Apple Silicon para la version CoreML con formas estaticas. No se han publicado en la informacion disponible resultados de benchmarks estandar de diarizacion (como DER sobre AMI, DIHARD o VoxConverse) para esta conversion concreta.

| Metrica | Valor |
|---|---|
| RTF en Apple Silicon | aproximadamente 120x (segun documentacion de origen) |
| DER (diarization error rate) | no disponible |
| Benchmarks estandar (AMI, DIHARD, VoxConverse) | no disponible |

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (chips de la familia M y posteriores). El modelo esta convertido especificamente a CoreML, por lo que no esta pensado para GPUs NVIDIA ni para CPU generica.
- VRAM/unified memory estimada: no disponible de forma explicita. El repositorio ocupa 2,6 GB, pero el consumo en ejecucion depende del conjunto de archivos cargados y de la configuracion de forma estatica.
- Capacidad en GPU de consumo: aplicable a Macs con chip Apple Silicon; no aplicable a tarjetas graficas NVIDIA o AMD convencionales.
- Aceleracion: Neural Engine y GPU integrada de Apple.
- Opciones de despliegue: CoreML (framework nativo de Apple). No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: se reporta un RTF aproximadamente 120x, lo que implica que el modelo procesa audio mucho mas rapido que el tiempo real de reproduccion en hardware Apple Silicon.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Hablantes | Streaming | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FluidInference-diar-streaming-sortformer-coreml (este) | Diarizacion Sortformer | CoreML | 4 fijas | Si | cc-by-4.0 | HuggingFace (espejo) |
| FluidInference/diar-streaming-sortformer-coreml | Diarizacion Sortformer | CoreML | 4 fijas | Si | cc-by-4.0 | HuggingFace (origen) |
| NVIDIA Sortformer (original) | Diarizacion Sortformer | PyTorch | 4 fijas | Si | no disponible en la informacion proporcionada | HuggingFace (NVIDIA) |
| Pipelines tradicionales (VAD + clustering) | Diarizacion por etapas | Variable | Configurable | Depende del diseno | Variable | Diversas |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Numero de hablantes limitado: el modelo esta disenado para cuatro ranuras de hablante fijas, por lo que conversaciones con mas participantes pueden producir errores de asignacion.
- Es un espejo: se trata de una copia sin modificar de otro repositorio; el mantenimiento y las actualizaciones corresponden al autor original.
- Dependencia de plataforma: al estar convertido a CoreML, solo se ejecuta en el ecosistema Apple. No es portable a otros entornos sin una nueva conversion.
- Informacion de entrenamiento ausente: no se detallan el dataset, el numero de horas de audio ni las metricas de calidad del modelo original.
- Riesgo de alucinacion de hablantes: como cualquier sistema de diarizacion, puede confundir turnos en conversaciones con solapamientos, ruido o voces similares.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero debe verificarse el cumplimiento al redistribuir el modelo o sus derivados.
- Sin datos de rendimiento reproducibles: no se incluyen cifras de DER ni evaluaciones sobre corpus estandar en la informacion disponible.
- Sensibilidad a condiciones acusticas: el rendimiento en audio con ruido, reverberacion o microfonos lejanos no esta documentado.

## Enlaces

- Repositorio espejo en HuggingFace: https://huggingface.co/aoiandroid/FluidInference-diar-streaming-sortformer-coreml
- Repositorio de origen: https://huggingface.co/FluidInference/diar-streaming-sortformer-coreml
- Commit de origen: https://huggingface.co/FluidInference/diar-streaming-sortformer-coreml/tree/ae9a27ab45dc0aa3abede7d2d6bad2b7a69aa6d1
- Otro espejo del mismo autor: https://huggingface.co/aoiandroid/diar-streaming-sortformer-coreml
- Arbol de archivos del espejo: https://huggingface.co/aoiandroid/diar-streaming-sortformer-coreml/tree/main
- Catalogo de modelos de Fluid Inference: https://docs.fluidinference.com/reference/models
- Documentacion de Sortformer en FluidAudio: https://github.com/FluidInference/FluidAudio/blob/main/Documentation/Diarization/Sortformer.md
- Ficha en Free2AITools: https://free2aitools.com/model/fluidinference/diar-streaming-sortformer-coreml
