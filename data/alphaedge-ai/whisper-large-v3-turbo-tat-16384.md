# alphaedge-ai/whisper-large-v3-turbo-tat-16384

## Resumen

`whisper-large-v3-turbo-tat-16384` es una version "trimmed" (podada en vocabulario) de `openai/whisper-large-v3-turbo`, publicada por el usuario alphaedge-ai y especializada en tatar (codigo ISO `tt`). El modelo parte del checkpoint original de OpenAI para reconocimiento automatico del habla y reduce el vocabulario de 51.865 a 16.384 tokens, lo que se traduce en una disminucion del 68,41% en el tamano del vocabulario y del 5,61% en el numero total de parametros (de 808.878.080 a 763.461.120). El objetivo es obtener un modelo de ASR mas ligero y con menor huella de memoria, manteniendo un rendimiento similar al original para el idioma seleccionado.

La tecnica de trimming consiste en identificar los tokens del vocabulario que realmente se utilizan para un idioma o conjunto de idiomas (en este caso, a partir de 27.911 textos del dataset `lbourdois/fineweb-2-trimming`) y eliminar el resto. El resultado es un modelo que conserva la arquitectura encoder-decoder de Whisper y el mismo pipeline de inferencia, pero con una capa de embedding y una proyeccion de salida mas pequenas. Es relevante para despliegues en produccion con recursos limitados o para servir ASR especifico de tatar con menor coste de memoria, aunque pierde cobertura multilingue.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, con un tamano de repositorio de 1,5 GB, y es compatible con la libreria `transformers` y con endpoints. Su creacion se fecha en junio de 2026 y su ultima actualizacion en noviembre de 2026, con 29 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper; no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no detalla cuantizaciones publicadas) |
| Idiomas soportados | tatar (`tt`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-large-v3-turbo`: un transformer encoder-decoder con atencion completa, disenado para transcripcion de audio a texto. Whisper fue entrenado originalmente con supervision debil a gran escala (paper arXiv:2212.04356, "Robust Speech Recognition via Large-Scale Weak Supervision"), y la variante turbo reduce el numero de capas del decoder respecto a large-v3 para disminuir la latencia. En esta ficha no se dispone de detalles adicionales sobre el numero exacto de capas, dimensiones ocultas ni cabezas de atencion, por lo que se remite al checkpoint base.

El proceso de creacion no es un reentrenamiento, sino una poda de vocabulario: se minaron 27.911 textos del dataset `lbourdois/fineweb-2-trimming` para determinar que tokens del vocabulario original son relevantes para el tatar, y se conservaron 16.384 tokens (frente a los 51.865 originales). Esto reduce la matriz de embeddings y la proyeccion de salida, con la consiguiente bajada de parametros y de memoria. No se indica en la informacion disponible si hubo fine-tuning adicional, RLHF, DPO ni ajuste de los pesos del encoder/decoder tras la poda; la model card sugiere que el modelo podado "deberia comportarse de forma similar al original" para el idioma objetivo.

## Capacidades

- Reconocimiento automatico del habla (ASR) para tatar, con transcripcion de audio a texto.
- Pipeline `automatic-speech-recognition` compatible con `transformers` (`AutoModelForSpeechSeq2Seq`, `AutoProcessor`, `pipeline`).
- Entrada de audio a 16 kHz (requisito de Whisper), con resampleo previo mediante `librosa` u otra libreria.
- Configuracion de idioma y tarea mediante `generate_kwargs` (`language="tatar"`, `task="transcribe"`).
- Menor huella de memoria que el modelo base gracias a la reduccion del vocabulario.
- No se documentan capacidades de traduccion, diarizacion, tool calling, agentes, vision ni audio mas alla del ASR.
- Capacidad multilingue limitada: el propio autor advierte que el modelo puede no funcionar bien en otros idiomas distintos del tatar, ya que se eliminaron tokens no usados en el idioma seleccionado.

## Casos de uso

- Transcripcion de audio en tatar para archivos y medios: el modelo convierte grabaciones de 16 kHz en texto mediante el pipeline de `transformers`, adecuado para digitalizar contenido en tatar con un modelo ligero.
- Subtitulado automatico de videos en tatar: integrado en un pipeline de postproduccion, genera transcripciones que luego se sincronizan como subtitulos, con menor coste de memoria que el modelo base.
- Servicio de ASR en produccion con recursos limitados: al tener un 5,61% menos de parametros y un vocabulario un 68,41% menor, reduce la memoria necesaria para servir el modelo en endpoints o contenedores.
- Investigacion linguistica en tatar: permite transcribir corpus orales para analisis fonetico, lexico o de variacion dialectal con un modelo especializado en el idioma.
- Asistentes de voz y dictado en tatar: se puede usar como componente de reconocimiento en aplicaciones de dictado o interfaces de voz, siempre que el audio se entregue a 16 kHz.
- Evaluacion de la tecnica de trimming: sirve como referencia para comparar el rendimiento de un modelo podado frente al original en tatar, util para equipos que estudian reduccion de vocabulario en ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 763.461.120 parametros en safetensors (1,5 GB de repositorio), la inferencia en precision nativa requiere del orden de varios GB, pero el autor no publica cifras concretas.
- GPU recomendadas: no disponible en la informacion; por tamano, el modelo es apto para GPU consumer modernas y para GPU de datacenter, pero no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del checkpoint (1,5 GB) y la reduccion de vocabulario, aunque no se confirma con cifras oficiales.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), endpoints compatibles segun los tags del repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto / audio |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-tat-16384 | 763.461.120 | 16.384 | tatar | apache-2.0 | no disponible (Whisper: ventanas de 30 s) |
| openai/whisper-large-v3-turbo (base) | 808.878.080 | 51.865 | multilingue | apache-2.0 | no disponible (Whisper: ventanas de 30 s) |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible | multilingue | apache-2.0 | no disponible (Whisper: ventanas de 30 s) |

La comparativa se limita al modelo base y a la variante large-v3 de la familia Whisper, ya que no se dispone de datos de rendimiento ni de otros modelos podados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en tatar; el autor advierte que puede no funcionar bien en otros idiomas porque se eliminaron tokens no usados en el idioma seleccionado.
- No se han publicado benchmarks que confirmen que el rendimiento en tatar iguala al del modelo original; la afirmacion de la model card es cualitativa.
- Riesgo de alucinacion y errores de transcripcion inherente a los modelos Whisper, especialmente en audio con ruido, acentos o vocabulario tecnico.
- Requiere audio a 16 kHz; no hacer el resampleo puede degradar la calidad de la transcripcion.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de minado (`lbourdois/fineweb-2-trimming`).
- No se documentan sesgos especificos, pero al ser un modelo derivado de Whisper puede heredar sesgos del entrenamiento original.
- No se dispone de informacion sobre cuantizaciones publicadas ni sobre latencia/throughput en produccion.
- El modelo tiene muy poca traccion (29 descargas, 0 likes) y no hay evidencia de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-tat-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
