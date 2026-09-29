# AndrzejAsijuk/srtmind-asr-models

## Resumen

`AndrzejAsijuk/srtmind-asr-models` no es un modelo entrenado desde cero, sino un repositorio espejo que agrupa copias byte a byte de tres modelos publicos de reconocimiento de voz, empaquetados en un unico repositorio para que el worker de voz de SRTMind, desplegado en Runpod Serverless, pueda beneficiarse del cacheo de modelos de Runpod (un repositorio por endpoint). El autor declara explicitamente que no ha modificado ningun fichero y que las copias coinciden en sha256 con las entradas de `tools.lock` del worker.

Los tres componentes son: `ggml-large-v3.bin` (OpenAI Whisper large-v3 en formato GGML, proveniente de ggerganov/whisper.cpp, licencia MIT), `parakeet-tdt-0.6b-v3.gguf` (NVIDIA Parakeet TDT 0.6B v3 cuantizado en GGUF, proveniente de cstr/parakeet-tdt-0.6b-v3-GGUF, licencia CC-BY-4.0) y `ggml-silero-v6.2.0.bin` (Silero VAD v6.2.0, proveniente de ggml-org/whisper-vad, licencia MIT). El repositorio ocupa 4,4 GB y HuggingFace reporta 627.115.158 parametros totales, cifra que corresponde al componente Parakeet TDT 0.6B y no a la suma del repositorio completo.

Su relevancia es fundamentalmente operativa: sirve como ejemplo de patron de empaquetado de dependencias de inferencia en un solo repositorio para aprovechar el cacheo a nivel de endpoint en infraestructura serverless. No aporta pesos nuevos ni mejoras de rendimiento sobre los modelos originales; para cualquier evaluacion tecnica conviene acudir directamente a las fuentes originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; el repositorio agrupa tres modelos distintos (ASR de Whisper large-v3, ASR de Parakeet TDT 0.6B v3 y deteccion de actividad de voz Silero VAD v6.2.0) |
| Parametros totales | 627.115.158 (dato reportado por HuggingFace; corresponde al componente safetensors presente en el repo, no al conjunto de los tres ficheros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelos de audio; la ventana relevante es la duracion de audio, no tokens de texto) |
| Tipos de cuantizacion | GGML/GGUF; los ficheros concretos son `ggml-large-v3.bin`, `parakeet-tdt-0.6b-v3.gguf` y `ggml-silero-v6.2.0.bin`. No se especifican los niveles de cuantizacion internos |
| Idiomas soportados | No disponible en la model card (depende de cada modelo original) |
| Licencia | `other` a nivel de repositorio; los componentes son MIT (Whisper large-v3), CC-BY-4.0 (Parakeet TDT 0.6B v3) y MIT (Silero VAD v6.2.0) |
| Formato de pesos | GGML (`ggml-large-v3.bin`, `ggml-silero-v6.2.0.bin`) y GGUF (`parakeet-tdt-0.6b-v3.gguf`) |
| Tamano del repositorio | 4,4 GB |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta arquitectura, datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de alineacion (RLHF, DPO u otros) para ninguno de los tres componentes. El repositorio es, por declaracion expresa del autor, un espejo: "Nothing here is modified. All credit to the original authors."

Los tres ficheros pertenecen a familias distintas de modelos de audio: un modelo ASR de gran tamano (Whisper large-v3), un modelo ASR compacto basado en transducer (Parakeet TDT 0.6B v3) y un detector de actividad de voz (Silero VAD v6.2.0). La innovacion tecnica del repositorio no esta en los pesos, sino en el patron de empaquetado: consolidar todas las dependencias de inferencia de un servicio en un unico repositorio de HuggingFace para que el mecanismo de cacheo de modelos de Runpod las materialice de una vez, con verificacion de integridad mediante sha256 en un fichero `tools.lock`.

## Capacidades

- Reconocimiento automatico de voz (ASR) mediante Whisper large-v3 en formato GGML, orientado a ejecucion con whisper.cpp.
- Reconocimiento automatico de voz mediante Parakeet TDT 0.6B v3 en GGUF, como alternativa mas ligera al modelo anterior.
- Deteccion de actividad de voz (VAD) con Silero VAD v6.2.0, util para segmentar audio y evitar enviar silencio al motor de ASR.
- Ejecucion en CPU y GPU a traves de whisper.cpp y de los runners compatibles con GGUF que emplea el worker.
- Verificacion de integridad de artefactos: los ficheros son copias byte a byte con sha256 registrado en `tools.lock`.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, traduccion, diarizacion de hablantes ni procesamiento de vision o audio generativo. Estas capacidades no estan disponibles en la informacion proporcionada.

## Casos de uso

- Transcripcion de audio a texto en produccion: el worker de SRTMind carga `ggml-large-v3.bin` con whisper.cpp para convertir audio en subtitulos o texto plano; es el caso de uso para el que se construyo el repositorio.
- Subtitulado automatico para video: la combinacion de VAD (Silero) para segmentar y ASR (Whisper o Parakeet) para transcribir permite generar pistas de subtitulos sin procesar silencio, reduciendo coste de computo.
- Despliegue serverless con arranque en frio reducido: al concentrar las dependencias en un unico repositorio, un endpoint de Runpod Serverless puede precachear los tres ficheros y evitar descargas repetidas por worker.
- Pipeline de transcripcion de bajo coste: Parakeet TDT 0.6B v3, con una decima parte de parametros que Whisper large-v3, sirve como opcion economica cuando la precision maxima no es el requisito critico.
- Reproducibilidad de entornos: el uso de un `tools.lock` con sha256 permite reconstruir exactamente el mismo conjunto de binarios en CI o en una imagen de contenedor, evitando deriva de versiones.
- Referencia para empaquetado de modelos: sirve como plantilla para equipos que necesiten publicar un repositorio espejo con varios artefactos de inferencia y atribucion de licencias por fichero.
- Preprocesado de audio para otros sistemas: el componente Silero VAD puede usarse de forma aislada para trocear grabaciones largas antes de enviarlas a un motor de ASR externo o a un sistema de diarizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye WER, MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni comparaciones cuantitativas entre los componentes. Para datos de rendimiento hay que consultar las fichas de los modelos originales (OpenAI Whisper large-v3, NVIDIA Parakeet TDT 0.6B v3, Silero VAD v6.2.0), que no forman parte de la informacion proporcionada.

## Requisitos de hardware

- Tamano total de los artefactos: 4,4 GB de repositorio. El consumo real de memoria depende del fichero que se cargue y de la cuantizacion interna, que no se detalla.
- VRAM estimada para inferencia: no disponible con precision. Como referencia de orden de magnitud, el repositorio completo ocupa 4,4 GB en disco; cargar simultaneamente los tres artefactos exigiria del orden de esa cantidad de memoria, mientras que cargar solo Parakeet TDT 0.6B o Silero VAD requeriria bastante menos.
- GPU recomendadas: no disponible en la documentacion. Whisper large-v3 en GGML esta disenado para funcionar tambien en CPU, por lo que no requiere GPU dedicada obligatoriamente.
- Compatibilidad con GPU de consumo: no confirmada por el autor. El formato GGML/GGUF es compatible con ejecucion en CPU y en GPU de consumo mediante whisper.cpp, pero no se aportan mediciones.
- Opciones de despliegue: whisper.cpp para los ficheros GGML y GGUF; Runpod Serverless como entorno de destino declarado por el autor. No se confirma compatibilidad con vLLM, TGI, Ollama ni llama.cpp, que no son motores de ASR.
- Latencia y throughput: no disponibles. No se aportan mediciones de tiempo real ni de factor de tiempo real (RTF) para ninguno de los tres componentes.

## Comparativa con modelos similares

La comparativa natural es entre los tres componentes incluidos en el propio repositorio y sus fuentes originales. No se dispone de datos de rendimiento para comparar por calidad.

| Componente | Origen | Parametros | Formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `ggml-large-v3.bin` | ggerganov/whisper.cpp (OpenAI Whisper large-v3) | No disponible en la informacion (el repo reporta 627.115.158 en total, cifra atribuible a Parakeet) | GGML | MIT | ASR de alta capacidad |
| `parakeet-tdt-0.6b-v3.gguf` | cstr/parakeet-tdt-0.6b-v3-GGUF (NVIDIA Parakeet TDT 0.6B v3) | 0,6 B (aproximado, segun el nombre del fichero) | GGUF | CC-BY-4.0 | ASR compacto |
| `ggml-silero-v6.2.0.bin` | ggml-org/whisper-vad (Silero VAD v6.2.0) | No disponible | GGML | MIT | Deteccion de actividad de voz |

Alternativas externas de la misma categoria (por ejemplo, otros modelos ASR o VAD publicados en HuggingFace): no disponible; no se ha proporcionado informacion sobre ellas en esta busqueda.

## Limitaciones y advertencias

- El repositorio no es un modelo propio: no aporta mejoras, ajustes ni pesos nuevos. Cualquier problema de calidad, sesgo o exactitud proviene de los modelos originales.
- La licencia declarada a nivel de repositorio es `other`. Aunque cada fichero se atribuye a una licencia concreta (MIT y CC-BY-4.0), la combinacion de artefactos bajo una unica etiqueta `other` puede complicar la revision automatica de cumplimiento en un entorno corporativo.
- CC-BY-4.0, aplicable a Parakeet TDT 0.6B v3, exige atribucion explicita al autor original. El uso comercial esta permitido por esa licencia, pero la atribucion es obligatoria.
- Los modelos ASR pueden producir alucinaciones, especialmente en segmentos con ruido, silencio o audio musical: transcripciones plausibles pero no presentes en el audio.
- La precision del reconocimiento varia con el idioma, el acento, la calidad de la grabacion y la presencia de solapamiento de voces. No se documentan idiomas soportados ni evaluaciones por idioma en esta ficha.
- El VAD puede recortar inicio o final de palabra si el umbral esta mal calibrado, degradando la transcripcion posterior.
- No hay informacion sobre sesgos demograficos, de acento o de dialecto para ninguno de los tres componentes.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, por lo que no existe validacion de la comunidad ni historial de mantenimiento.
- Dependencia de la infraestructura de un proveedor concreto (Runpod Serverless) como motivacion del empaquetado; replicar el patron fuera de Runpod requiere gestionar la cache y la verificacion de integridad por cuenta propia.
- No se documentan requisitos de hardware, latencias ni limites de duracion de audio, lo que obliga a medir en el entorno de destino antes de poner el sistema en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AndrzejAsijuk/srtmind-asr-models
- Fuente de `ggml-large-v3.bin`: https://huggingface.co/ggerganov/whisper.cpp
- Fuente de `parakeet-tdt-0.6b-v3.gguf`: https://huggingface.co/cstr/parakeet-tdt-0.6b-v3-GGUF
- Fuente de `ggml-silero-v6.2.0.bin`: https://huggingface.co/ggml-org/whisper-vad
