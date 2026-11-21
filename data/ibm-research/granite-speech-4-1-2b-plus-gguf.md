# ibm-research/granite-speech-4.1-2b-plus-GGUF

## Resumen

Granite-speech-4.1-2b-plus es un modelo de reconocimiento automatico del habla (ASR) desarrollado por IBM Research, publicado originalmente en formato Transformers y distribuido en este repositorio en formato GGUF para su uso con llama.cpp. El modelo pertenece a la familia Granite 4.1 y esta disenado especificamente para transcripcion de audio a texto, incluyendo la posibilidad de recibir instrucciones en lenguaje natural junto con el audio. Con 1.631.752.192 parametros, se posiciona como un modelo compacto orientado a despliegues en entornos con recursos limitados.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de voz de IBM en infraestructura local mediante llama.cpp, sin depender de APIs propietarias. El repositorio incluye cuantizaciones multiples y un proyector de audio (`mmproj-model-f16.gguf`) que actua como adaptador entre el encoder de audio y el modelo de lenguaje subyacente. La licencia Apache 2.0 facilita su integracion en productos comerciales.

El modelo se distribuye bajo el identificador `ibm-research/granite-speech-4.1-2b-plus-GGUF` y cuenta con 855 descargas en el momento de la consulta. La model card remite a la ficha del modelo base para especificaciones completas de arquitectura y entrenamiento, que no se detallan en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal audio-texto de la familia Granite 4.1; requiere proyector de audio `mmproj-model-f16.gguf`) |
| Parametros totales | 1.631.752.192 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con varias cuantizaciones (el ejemplo oficial usa Q8_0); proyector en f16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible en este repositorio no detalla la arquitectura interna del modelo. Se trata de un modelo de la familia Granite 4.1 orientado a voz, que combina un componente de procesamiento de audio con un modelo de lenguaje, tal como evidencia la necesidad de cargar un proyector multimodal separado (`mmproj-model-f16.gguf`) junto con los pesos cuantizados. El modelo base es `ibm-granite/granite-speech-4.1-2b-plus`, y la model card remite a su ficha para los detalles de arquitectura, datos de entrenamiento y proceso de alineacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal en la informacion proporcionada.

## Capacidades

- Transcripcion de audio a texto: convierte senales de voz en texto plano, como demuestra el ejemplo oficial con el archivo `OSR_us_000_0010_8k.wav`.
- Instrucciones en lenguaje natural: acepta un prompt de texto junto con el audio (por ejemplo, "Transcribe this audio file."), lo que sugiere capacidad de seguir instrucciones sobre la tarea a realizar.
- Procesamiento multimodal audio-texto: integra contenido de tipo `input_audio` con contenido de tipo `text` en el mismo mensaje.
- Compatibilidad con la API OpenAI: el servidor `llama serve` expone el endpoint `/v1/chat/completions` con soporte para audio en base64.
- Conversacion de un solo turno: el ejemplo oficial usa `--single-turn`, lo que indica que el caso de uso principal es la transcripcion puntual.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision o audio bidireccional: no disponibles en la informacion proporcionada.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo puede convertir grabaciones de audio en texto para actas, resumenes o busqueda posterior. Su tamano compacto (1.63B parametros) permite ejecutarlo en local sin enviar audio sensible a servicios externos.
- Subtitulado y accesibilidad: integrado en pipelines de video, puede generar transcripciones para subtitulos automaticos en aplicaciones de accesibilidad, aprovechando el endpoint compatible con la API OpenAI para conectar con herramientas existentes.
- Dictado por voz en aplicaciones de escritorio: al ejecutarse con llama.cpp, puede embeberse en aplicaciones de escritorio o moviles que necesiten dictado sin conexion, usando la cuantizacion Q8_0 para equilibrar calidad y huella de memoria.
- Analisis de llamadas de atencion al cliente: transcripcion de grabaciones para auditoria de calidad, deteccion de palabras clave o generacion de resumenes posteriores, con la ventaja de que el audio no abandona la infraestructura propia.
- Investigacion en ASR: sirve como linea base reproducible para experimentos de reconocimiento de voz, ya que el formato GGUF y llama.cpp facilitan la ejecucion en distintas plataformas de hardware.
- Procesamiento por lotes de archivos de audio: mediante `llama cli` o `llama serve`, se pueden transcribir lotes de grabaciones en servidores con GPU modestas, dado el reducido numero de parametros.
- Prototipado de asistentes de voz: combinado con un modelo de lenguaje y un sintetizador de voz, puede formar parte de un pipeline de asistente conversacional por voz en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el numero de parametros (1.63B), una cuantizacion Q8_0 ocupa aproximadamente 1.7 GB de pesos, mas el proyector de audio en f16; el consumo total de memoria depende del contexto y del backend.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del modelo, es probable que quepa en GPUs de consumo, pero no se confirma oficialmente.
- Compatibilidad con GPU de consumo: no confirmada oficialmente en la informacion disponible.
- Opciones de despliegue: llama.cpp (`llama cli` y `llama serve`), con build tag `b11798` y version de Transformers `5.20.2` como referencia del entorno de conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de ASR, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- La model card de este repositorio es minima y remite al modelo base; no documenta sesgos, limitaciones de idioma ni comportamiento en dominios especificos.
- Riesgo de alucinacion: no documentado en la informacion disponible, pero es un riesgo inherente a los modelos generativos de audio a texto.
- Idiomas soportados: no disponibles; el ejemplo oficial usa audio en ingles, por lo que el rendimiento en otros idiomas no esta verificado.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar audios de larga duracion sin pruebas previas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene revisar la ficha del modelo base por si hubiera condiciones adicionales.
- El ejemplo oficial usa `--single-turn`; el comportamiento en conversaciones multiturno con audio no esta documentado.
- La calidad de la transcripcion puede degradarse con audio ruidoso, acentos no representados en el entrenamiento o dominios especializados; no hay datos publicados al respecto.
- El repositorio ocupa 9.7 GB debido a las multiples cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-research/granite-speech-4.1-2b-plus-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
- Open Speech Repository (audio de ejemplo): https://www.voiptroubleshooter.com/open_speech/american.html
