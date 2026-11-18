# prabanta-dev/whisper-large-v3-turbo-JNS

## Resumen

whisper-large-v3-turbo-JNS es una conversion de pesos del modelo openai/whisper-large-v3-turbo al formato JNS, propietario del motor de inferencia Janas-LLM, desarrollado por el usuario prabanta-dev. No se trata de un modelo nuevo ni de un reentrenamiento: es el mismo conjunto de pesos de OpenAI reescrito en el orden de lectura que espera Janas-LLM, una implementacion en C pensada para ejecucion local en CPU o GPU de consumo, sin dependencia de la nube. El modelo base es el Whisper large-v3-turbo de OpenAI, un sistema de reconocimiento automatico del habla (ASR) basado en arquitectura encoder-decoder transformer, con capacidad de transcripcion y traduccion de audio a texto.

La relevancia de esta publicacion es practica: permite ejecutar un modelo ASR de gran tamano en entornos locales mediante el binario `janas-server`, que expone endpoints compatibles con `/v1/audio/transcriptions` y `/v1/audio/translations`. El autor reporta que la salida coincide con whisper.cpp sobre los mismos pesos y el mismo audio, con un coseno medio de 0,999933 en los logits de cada token, lo que sugiere una conversion fiel. El repositorio ocupa 1,6 GB y el unico artefacto es un fichero `.jns` de 1,63 GB.

La ficha se limita a lo documentado por el autor. No hay informacion sobre idiomas soportados, benchmarks propios, requisitos de hardware detallados ni datos de entrenamiento mas alla del modelo base. Cualquier dato no presente en la model card se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper large-v3-turbo, OpenAI) |
| Parametros totales | no disponible (el modelo base Whisper large-v3-turbo tiene 809 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento en Whisper, dato no explicito en la model card) |
| Tipos de cuantizacion | Sin cuantizacion: matrices en media precision (fp16) tal como las publico OpenAI |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | JNS (formato propietario de Janas-LLM); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper large-v3-turbo de OpenAI, un transformer encoder-decoder disenado para reconocimiento automatico del habla y traduccion de voz. La model card no aporta detalles adicionales sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Toda esa informacion corresponde al modelo base y no se reproduce en este repositorio.

La unica intervencion documentada es la conversion de formato: el autor indica que no se reentreno ni se cuantizo nada, que las matrices se mantienen en media precision y que la herramienta `hf2jns_whisper` reescribe los pesos en el orden que lee Janas-LLM, trasladando tambien el tokenizer y los filtros mel. Se afirma que dos conversiones producen los mismos bytes, lo que apunta a un proceso determinista. La validacion reportada es la coincidencia de logits con whisper.cpp (coseno medio de 0,999933), no una evaluacion de calidad ASR independiente.

## Capacidades

- Transcripcion de audio a texto (speech-to-text) mediante el endpoint `/v1/audio/transcriptions` de `janas-server`.
- Traduccion de audio a texto (speech-to-text translation) mediante `/v1/audio/translations`.
- Ejecucion local en CPU o GPU de consumo a traves del motor Janas-LLM, sin llamadas a la nube.
- Integracion con la aplicacion de escritorio Brebus, que entrega el fichero al servidor cuando se coloca en la carpeta de modelos.
- Descarga y verificacion de integridad mediante `janas-get`, que comprueba el SHA-256 publicado por Hugging Face.
- Capacidades multilingues: no disponibles en la informacion proporcionada (el modelo base Whisper es multilingue, pero la model card no detalla idiomas).
- No se documentan tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion local de reuniones y entrevistas: el modelo se sirve con `janas-server --speech-model whisper-large-v3-turbo.jns` y procesa audio mediante el endpoint compatible con la API de transcripciones, manteniendo el contenido en la maquina del usuario sin enviar grabaciones a terceros.
- Subtitulado de video en pipelines de produccion: al exponer una API HTTP local, se puede encadenar con herramientas de extraccion de audio y generacion de subtitulos, y el motor en C evita dependencias de Python en el servidor.
- Traduccion de audio a texto para contenido en otros idiomas: el endpoint `/v1/audio/translations` permite generar texto traducido a partir de grabaciones, util para documentacion o archivos multimedia.
- Despliegue en equipos sin GPU: la etiqueta `cpu-inference` y el motor Janas-LLM en C estan pensados para ordenadores convencionales, lo que facilita su uso en portatiles o estaciones de trabajo sin acelerador dedicado.
- Integracion en la aplicacion de escritorio Brebus: el fichero `.jns` se coloca en la carpeta de modelos y la app lo entrega al servidor, ofreciendo transcripcion integrada al flujo de trabajo del usuario final.
- Procesamiento por lotes de archivos de audio en un servidor interno: al ser un binario autonomo con verificacion SHA-256 en la descarga, encaja en entornos con requisitos de reproducibilidad y control de versiones de artefactos.
- Archivado y busqueda de grabaciones: transcripcion masiva de audio historico para indexar y buscar por texto, con la ventaja de que los datos no salen de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la fidelidad de la conversion frente a whisper.cpp: coseno medio de 0,999933 en los logits de cada token sobre los mismos pesos y el mismo audio. No hay datos de WER, MMLU, HumanEval ni comparaciones de calidad ASR en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El fichero de pesos ocupa 1,63 GB en media precision, por lo que se requiere al menos ese orden de memoria para cargar el modelo, ademas del overhead del motor.
- GPU recomendadas: no disponible. El autor no especifica modelos de GPU concretos.
- Compatibilidad con GPU de consumo: la model card menciona ejecucion "con o sin GPU" y etiqueta `cpu-inference`, pero no detalla que tarjetas soporta ni requisitos minimos.
- Opciones de despliegue: Janas-LLM (`janas-server`) y la aplicacion de escritorio Brebus. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; de hecho, el formato JNS solo lo lee Janas-LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-JNS | no disponible | no disponible | JNS | MIT | Hugging Face (repo prabanta-dev) |
| openai/whisper-large-v3-turbo (base) | no disponible en esta ficha | no disponible | safetensors | MIT | Hugging Face (openai) |
| whisper.cpp (implementacion) | no aplica (motor) | no aplica | GGML/GGUF | MIT | GitHub (ggerganov) |

La comparativa se limita al modelo base y a la implementacion de referencia citada por el autor. No se dispone de datos de rendimiento ni de otros modelos ASR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El formato JNS es propietario de Janas-LLM: los pesos no son utilizables con vLLM, llama.cpp, Ollama, TGI ni con la libreria `transformers` directamente.
- No se han publicado evaluaciones de calidad ASR (WER, CER) sobre este artefacto; la unica validacion es la coincidencia de logits con whisper.cpp, que mide fidelidad de conversion, no precision de transcripcion.
- La model card no especifica idiomas soportados, por lo que no se puede confirmar el alcance multilingue real de esta distribucion.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento en audio ruidoso o con acentos especificos. Whisper, como modelo base, es conocido por producir alucinaciones en silencios o audio de baja calidad, pero este extremo no se documenta en la ficha del autor.
- Los requisitos de hardware y el rendimiento no estan cuantificados; el despliegue en produccion requiere validacion propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Licencia MIT, igual que el modelo original, permite uso comercial, pero se debe conservar la atribucion a OpenAI y al autor de la conversion.
- La fecha de creacion del repositorio (2026-11-18) y el reducido tamano del proyecto sugieren un artefacto reciente y poco contrastado; conviene verificar el SHA-256 antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prabanta-dev/whisper-large-v3-turbo-JNS
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Repositorio de Janas (motor de inferencia): https://github.com/prabanta-dev/janas
- Releases de Janas-LLM: https://github.com/prabanta-dev/janas/releases
- Paper de Whisper: https://arxiv.org/abs/2212.04356
