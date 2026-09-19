# flyingfishinwater/Chatterbox-Turbo-TTS-4bit

## Resumen

Chatterbox-Turbo-TTS-4bit es una conversion al formato MLX del modelo de sintesis de voz ResembleAI/chatterbox-turbo, publicada por el usuario flyingfishinwater. Se trata de un modelo de texto-a-voz (pipeline `text-to-speech`) con 622.667.090 parametros en safetensors y un repositorio de 0,8 GB, pensado para ejecutarse en hardware de Apple Silicon mediante la libreria `mlx-audio-plus`. La unica modificacion declarada respecto al modelo original es la cuantizacion a 4 bits del backbone T3 basado en GPT-2, con el objetivo de reducir el consumo de memoria manteniendo la calidad de audio.

El modelo esta especializado en clonacion de voz con audio de referencia: tanto la CLI como la API de Python exigen un parametro `ref_audio` para condicionar la generacion. Solo declara soporte para ingles (`en`) y su licencia no aparece especificada en la informacion disponible, lo que obliga a remitirse a la licencia del modelo base antes de cualquier uso comercial.

Su relevancia es practica mas que cientifica: permite ejecutar un TTS de clonacion de voz en un Mac con memoria unificada sin depender de CUDA ni de servicios en la nube, a costa de quedar atado al ecosistema MLX y a la generacion de tokens de audio del S3Tokenizer externo. No se han publicado resultados de benchmarks ni datos de rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone T3 basado en GPT-2 (texto-a-token) segun la model card; no se detalla el decodificador acustico en la informacion disponible |
| Parametros totales | 622.667.090 (aprox. 623 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (aplicada al backbone T3 GPT-2); no se detallan otros formatos |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX); tamano del repo 0,8 GB |

## Arquitectura y entrenamiento

La informacion proporcionada no describe el entrenamiento del modelo: no hay datos sobre numero de tokens, composicion del dataset, ni uso de RLHF, DPO u otras tecnicas de alineacion. Lo unico documentado es que el backbone T3 esta basado en GPT-2 y que la conversion a MLX se realizo con `mlx-audio-plus` version 0.1.6, aplicando cuantizacion de 4 bits a ese backbone para reducir el uso de memoria. No se especifica si el resto de componentes (decodificador, codificador de voz) se cuantizan o se mantienen en precision original.

Un detalle operativo relevante es la dependencia de los pesos del S3Tokenizer, que deben descargarse desde `mlx-community/S3TokenizerV2` y que la libreria obtiene automaticamente. Esto implica que el modelo no es autocontenido: la tokenizacion semantica de audio se delega en un artefacto externo, lo que anade un punto de fallo en el despliegue y una dependencia adicional que conviene fijar por version en produccion.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto plano.
- Clonacion de voz: requiere un fichero de audio de referencia (`ref_audio`) que condiciona el timbre y las caracteristicas de la voz generada.
- Generacion de audio con prefijo de fichero configurable mediante la API de Python (`file_prefix`).
- Ejecucion local en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA.
- Interfaz de linea de comandos y API de Python a traves de `mlx-audio-plus`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada mas alla de la referencia de voz.
- No se documenta capacidad multilingue: el modelo declara unicamente ingles.

## Casos de uso

- Generacion de audiolibros y narracion: el modelo permite sintetizar texto largo con una voz clonada a partir de una muestra de referencia, manteniendo el timbre consistente entre fragmentos al reutilizar el mismo `ref_audio` en cada llamada.
- Doblaje y localizacion de contenido en ingles: util para producir pistas de voz alternativas sobre material ya existente, clonando la voz del locutor original y sustituyendo el audio sin reestudio.
- Prototipado de asistentes de voz en macOS: al ejecutarse sobre MLX en Apple Silicon, se puede integrar en una aplicacion de escritorio que genere respuestas habladas localmente, sin enviar texto a servicios externos.
- Accesibilidad: conversion de articulos, documentacion tecnica o mensajes a audio para usuarios con discapacidad visual, con voces personalizadas que resulten mas comprensibles que las voces roboticas por defecto.
- Generacion de contenido para video y podcasts: produccion de locuciones de borrador para validar guiones antes de contratar una locucion humana, con coste marginal cero por iteracion.
- Pruebas de integracion en pipelines de audio: al ser una conversion MLX, sirve para validar en Mac un flujo de TTS clonado antes de escalarlo a infraestructura con GPU, comprobando formatos de salida, duraciones y segmentacion.
- Demostraciones e investigacion en entornos sin CUDA: equipos que solo disponen de portatiles Apple pueden experimentar con clonacion de voz sin aprovisionar instancias con GPU.
- Pre-generacion de avisos y mensajes de sistema: sintesis por lotes de cadenas cortas y repetitivas (alertas, confirmaciones, menus) usando una unica referencia de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de audio (MOS, WER, similitud de hablante) ni comparaciones con otros sistemas TTS. Tampoco se aportan datos de latencia ni de throughput en hardware concreto.

## Requisitos de hardware

- Almacenamiento: 0,8 GB para el repositorio del modelo, mas el espacio de los pesos del S3Tokenizer que se descargan aparte.
- Memoria: con cuantizacion de 4 bits, el peso del modelo ronda los 0,3-0,4 GB, pero el consumo real depende del runtime MLX, del decodificador y del buffer de audio; se recomienda un minimo de 8 GB de memoria unificada y 16 GB para trabajar con comodidad.
- GPU: no aplica CUDA. El modelo requiere Apple Silicon (familia M) para ejecutarse mediante MLX; no hay soporte declarado para A100, H100, RTX 4090 ni otras GPU NVIDIA.
- Cabe en GPU de consumo: si, en el sentido de que cabe en cualquier Mac con Apple Silicon y 8 GB o mas de memoria unificada, ya que se trata de un modelo de 623 M de parametros cuantizado a 4 bits.
- Opciones de despliegue: `mlx-audio-plus` 0.1.6 o superior, tanto por CLI (`mlx_audio.tts`) como por Python (`mlx_audio.tts.generate.generate_audio`). No hay formatos GGUF ni soporte declarado para vLLM, llama.cpp, Ollama o TGI, ya que se trata de un modelo de audio con pesos MLX, no de un LLM de texto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Chatterbox-Turbo-TTS-4bit | 622.667.090 | no disponible | en | no disponible | safetensors (MLX, 4 bits) | Conversion MLX para Apple Silicon; requiere S3Tokenizer externo |
| ResembleAI/chatterbox-turbo | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | Modelo base; se desconoce la precision original y el framework de publicacion |
| Otros sistemas TTS de clonacion (Kokoro, XTTS-v2, Piper) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible | No se han encontrado datos comparativos en la busqueda web realizada |

La busqueda web asociada no devolvio resultados relevantes sobre el modelo ni sobre alternativas comparables: los enlaces recuperados corresponden a paginas corporativas de Microsoft, sin relacion con TTS. Por tanto, no es posible establecer una comparativa cuantitativa fiable con otros sistemas.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Es imprescindible consultar la licencia de ResembleAI/chatterbox-turbo antes de cualquier uso comercial, y tener en cuenta que una conversion derivada puede heredar restricciones adicionales.
- Solo ingles: no hay soporte declarado para castellano ni otros idiomas, por lo que no es adecuado para productos multilingues sin trabajo adicional.
- Dependencia externa: requiere descargar los pesos de `mlx-community/S3TokenizerV2`. Una version futura de ese artefacto podria romper la compatibilidad si no se fija la revision.
- Riesgo de alucinacion sonora: en TTS, los fallos se manifiestan como artefactos, ruido, silencios anomalos, pronunciacion incorrecta o inestabilidad en la prosodia, especialmente en entradas atipicas (numeros, siglas, nombres propios, puntuacion ambigua).
- Riesgo de uso indebido de clonacion de voz: la clonacion a partir de una muestra de audio permite suplantaciones. Es necesario obtener consentimiento explicito de la persona cuya voz se clona y cumplir la normativa aplicable sobre sintesis de voz y datos personales.
- Cuantizacion a 4 bits: la model card afirma que mantiene la calidad de audio, pero no aporta mediciones objetivas. Conviene validar la calidad frente al modelo base en el dominio concreto de uso antes de pasar a produccion.
- Compatibilidad limitada al ecosistema MLX: no se puede desplegar en servidores Linux con GPU NVIDIA sin una conversion adicional a otro formato.
- Sesgos: no hay informacion sobre la diversidad de voces, acentos o variedades dialectales del dataset de entrenamiento del modelo base.
- Datos de rendimiento ausentes: sin benchmarks de MOS, WER ni similitud de hablante, no es posible estimar la calidad esperada ni compararla con alternativas.
- Repositorio practicamente sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas de integracion esten documentados por otros usuarios.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/flyingfishinwater/Chatterbox-Turbo-TTS-4bit
- Modelo base: https://huggingface.co/ResembleAI/chatterbox-turbo
- Libreria de conversion y ejecucion: https://github.com/DePasqualeOrg/mlx-audio-plus
- Pesos del tokenizador de audio requerido: https://huggingface.co/mlx-community/S3TokenizerV2
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre el modelo (los resultados devueltos corresponden a paginas corporativas de Microsoft, sin relacion con TTS).
