# loom-ai-org/qwen3-tts-tokenizer-12hz-loom

## Resumen

`loom-ai-org/qwen3-tts-tokenizer-12hz-loom` es la mitad decodificadora (decode half) del tokenizador de voz de 12 Hz de Qwen3-TTS, exportada al formato GGUF de loom.cpp. No es un modelo de lenguaje ni un sistema TTS completo: es un códec de audio que recibe codigos de voz y devuelve una forma de onda de 24 kHz. Se deriva de `Qwen/Qwen3-TTS-12Hz-0.6B-Base` sin modificar los pesos, empaquetando los mismos parametros en un unico GGUF autodescriptivo que incluye sus propias topologias de grafo, tokenizador y script de driver.

El modelo tiene 114.029.800 parametros (~114 M) y ocupa 0,5 GB en el repositorio. Su papel en una pila de sintesis de voz es el ultimo eslabon: un modelo autorregresivo o un codificador produce los codigos, y este decodificador los convierte en audio. La model card lo describe como el primer miembro de su familia con un transformer dentro, y la atencion opera sobre el eje de frames (8 capas segun la documentacion), lo que condiciona la forma de invocarlo: por tramos.

Su relevancia actual es de infraestructura mas que de investigacion: permite ejecutar la etapa de vocoder de Qwen3-TTS dentro del ecosistema loom.cpp/loom-py con un artefacto unico y portable, declarando en el propio fichero la geometria necesaria (numero de codebooks, tamano de codebook, frecuencia de frames y frecuencia de muestreo) en lugar de depender de constantes externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de codec de voz con transformer; atencion sobre el eje de frames (8 capas, segun la model card) |
| Parametros totales | 114.029.800 (~114 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de LLM; decodificacion por tramos de 300 frames (24 s a 12,5 Hz), con contexto izquierdo de 25 frames y techo de 4096 frames por llamada |
| Tipos de cuantizacion | no disponible; se distribuye como un unico GGUF autodescriptivo sin variantes de cuantizacion declaradas |
| Idiomas soportados | no aplica: es un codec, no lleva vocabulario ni idioma |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (`qwen3-tts-tokenizer-12hz.gguf`) |

Parametros declarados por el propio fichero: `codec.n_codebooks` (corrientes de codigos por frame), `codec.codebook_size` (rango valido de ids por corriente), `codec.frame_rate` (codigos por segundo) y `contract["sample_rate"]`. La model card indica 16 codes por frame y salida a 24 kHz, con una frecuencia de tokenizacion de 12,5 Hz.

## Arquitectura y entrenamiento

Se trata de la mitad de decodificacion de un codec neuronal de voz, no de un modelo generativo de texto. La entrada son codigos discretos organizados en 16 corrientes por frame y en orden frame-major (todos los codigos del frame 0, despues los del frame 1, y asi sucesivamente); la salida es una forma de onda de 24 kHz. A diferencia de los codecs puramente convolucionales de la misma coleccion, este incluye un transformer y realiza atencion sobre el eje temporal de frames, lo que explica su comportamiento por tramos: una llamada unica con un techo de 4096 frames construiria una matriz de puntuaciones de 4096x4096 en cada una de las 8 capas.

No hay informacion disponible en la documentacion proporcionada sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si hubo etapas de RLHF o DPO. La model card indica explicitamente que los pesos son los originales de `Qwen/Qwen3-TTS-12Hz-0.6B-Base` sin modificaciones, de modo que cualquier detalle de entrenamiento corresponderia al modelo base, no a esta exportacion.

La innovacion relevante de esta exportacion es de empaquetado y ejecucion: un GGUF autodescriptivo que transporta el grafo, el driver y los hiperparametros del codec, de forma que la geometria se lee del fichero en lugar de buscarse en un paper. Ademas, replica fielmente la decodificacion por trozos de la implementacion de referencia de Qwen, `chunked_decode(chunk_size=300, left_context_size=25)`.

## Capacidades

- Reconstruccion de audio: convierte codigos de voz en una forma de onda de 24 kHz.
- Entrada estricta: 16 codigos por frame, en orden frame-major y en orden de codebook; una lista plana tambien es aceptada si corresponde a un numero entero de frames.
- Decodificacion por tramos: procesa bloques de 300 frames (24 segundos) con 25 frames de contexto izquierdo.
- API de alto nivel `model.codes2speech.infer(codes)` y acceso de bajo nivel mediante `model.infer(...)` al driver embebido.
- Auto-descripcion de contrato: expone `codec.n_codebooks`, `codec.codebook_size`, `codec.frame_rate` y `sample_rate`; si se empareja con un fichero cuyos hiperparametros no coinciden, lo detecta en lugar de generar audio con una duracion incorrecta.
- No es un modelo de lenguaje: no genera texto, no razona, no hace tool calling ni function calling.
- No dispone de capacidades de agente, multi-step reasoning ni vision.
- No es multilingue en el sentido habitual: al no tener vocabulario ni idioma, no hay cobertura linguistica que evaluar.
- No incluye la mitad de codificacion (encode), que es un contrato distinto (audio de entrada, codigos de salida).

## Casos de uso

- Etapa de vocoder en una pila TTS completa: situado despues de un modelo autorregresivo que emite los codigos (por ejemplo `qwen3-tts-12hz-0.6b-loom`), convierte esos codigos en audio de 24 kHz. Es su uso canonico y el unico para el que esta pensado.
- Sintesis de voz en agentes conversacionales: al decodificar en tramos de 300 frames con 25 frames de contexto, encaja en pipelines de streaming donde el modelo de lenguaje del agente va emitiendo codigos y el audio se reconstruye de forma incremental.
- Lectura de contenido largo (audiolibros, articulos, documentacion): la decodificacion por bloques de 24 segundos permite procesar horas de audio sin cargar en memoria una unica secuencia completa.
- Locuciones para videojuegos y personajes: la misma voz sintetizada se puede generar por fragmentos y concatenar, con coste computacional bajo gracias a los ~114 M de parametros.
- Accesibilidad y lectores de pantalla: conversion de texto a voz integrada en aplicaciones de escritorio o moviles mediante un contenedor GGUF ligero.
- Doblaje y postproduccion de audio: reconstruccion de pistas de voz a partir de codigos generados por otro modelo, manteniendo la tasa de muestreo de 24 kHz del contrato.
- Investigacion sobre codecs neuronales: sirve como referencia de decodificador a 12,5 Hz con transformer frente a codecs convolucionales, util para comparar fidelidad de reconstruccion y latencia.
- Integracion en servicios de telefonia o IVR: la decodificacion por tramos y el reducido tamano del modelo permiten desplegarlo en el mismo nodo que el modelo generador de codigos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros no aplican a un codec). El unico dato cuantitativo de fidelidad presente en la model card es la comparacion entre la decodificacion de secuencia completa y la decodificacion por tramos sobre codigos reales:

| Medicion | Resultado |
|---|---|
| Hasta 299 frames | Salida identica bit a bit entre paso completo y paso por tramos |
| 301 frames | 1,1 % de RMS relativo de divergencia |
| 700 frames | 8,9 % de RMS relativo de divergencia |

Estas cifras no son un benchmark de calidad de audio, sino una medida de la discrepancia entre dos modos de inferencia; el autor concluye que replicar el comportamiento por tramos es lo correcto porque es lo que hace la implementacion de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,45 GB solo de pesos; en FP16, unos 0,23 GB; en una hipotetica cuantizacion de 8 bits, unos 0,11 GB. Hay que anadir la memoria de activaciones, que crece con la longitud de la secuencia atendida.
- Al tratarse de ~114 M de parametros, cabe con holgura en cualquier GPU de consumo, incluidas GTX 1060, RTX 3060, RTX 4090 y similares, y probablemente tambien en CPU con memoria suficiente.
- El factor limitante no es el tamano del modelo sino la atencion sobre el eje de frames: conviene no superar el techo de 4096 frames por llamada, porque implicaria matrices de atencion de 4096x4096 por capa.
- Opciones de despliegue: el propio motor loom.cpp con el runtime `loom-py-rt` (instalable via `pip install -U "loom-py-rt[hub]"`), tanto en Python como mediante el driver embebido en el GGUF. No se documentan otras rutas de despliegue (vLLM, TGI, llama.cpp u Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles. La unica referencia temporal es la segmentacion de la decodificacion en bloques de 300 frames (24 segundos de audio a 12,5 Hz).

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa. Como referencia cualitativa, se pueden situar los componentes de la misma familia:

| Modelo | Rol | Parametros | Formato | Licencia |
|---|---|---|---|---|
| `qwen3-tts-tokenizer-12hz-loom` (este) | Decodificador de codec: codigos a audio | 114.029.800 | GGUF (loom.cpp) | apache-2.0 |
| `qwen3-tts-12hz-0.6b-loom` | Talker que genera los codigos | no disponible en esta informacion | GGUF (loom.cpp) | no disponible en esta informacion |
| `Qwen/Qwen3-TTS-12Hz-0.6B-Base` | Modelo base del que se exporta el tokenizador | no disponible en esta informacion | safetensors (presumiblemente) | no disponible en esta informacion |

La mitad de codificacion correspondiente no esta referenciada en la model card mas alla de mencionarla como contrato distinto. No se han identificado en la busqueda web modelos alternativos comparables de la misma categoria.

## Limitaciones y advertencias

- Es unicamente la mitad de decodificacion. No puede convertir audio en codigos ni generar codigos por si mismo; necesita un codificador o un modelo autorregresivo que los produzca.
- La decodificacion es por tramos por diseno. Una llamada unica a secuencia completa deja de coincidir con la referencia a partir de 300 frames (1,1 % de RMS relativo a 301 frames, 8,9 % a 700), con la deriva de calidad que ello implica.
- La entrada debe ser exactamente de 16 codigos por frame, en orden frame-major y en orden de codebook. Una secuencia que no corresponda a un numero entero de frames se rechaza en lugar de reinterpretarse.
- Si se empareja con un fichero de codigos cuyos hiperparametros no coinciden, el sistema lo detecta y falla; no hay correccion automatica de desajustes de duracion.
- No es un modelo de lenguaje, por lo que no procede evaluarlo por sesgos linguisticos, alucinacion de texto ni capacidades de razonamiento. Los sesgos aplicables serian los del modelo que genere los codigos, no los de este decodificador.
- Riesgo de artefactos acusticos en el audio reconstruido ante codigos fuera de distribucion o generados por un modelo distinto al previsto.
- No se declaran idiomas, ya que el fichero no contiene vocabulario; cualquier limitacion linguistica proviene del resto de la pila.
- Licencia apache-2.0 heredada del modelo base, lo que en principio permite uso comercial, pero la model card advierte de que la licencia es la del repositorio del talker, ya que este componente se distribuye dentro de el; conviene verificar los terminos de Qwen3-TTS antes de un despliegue en produccion.
- El repositorio no tiene descargas ni likes registrados y fue creado y actualizado el mismo dia, por lo que no hay evidencia de uso en produccion ni validacion independiente.
- Los resultados de la busqueda web realizada no aportan informacion relevante: remiten a la herramienta de grabacion de pantalla Loom, a una marca de ropa homonima y a sus paginas de descarga, sin relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/qwen3-tts-tokenizer-12hz-loom
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Talker que genera los codigos: https://huggingface.co/loom-ai-org/qwen3-tts-12hz-0.6b-loom
- Motor loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Runtime y API loom-py: https://github.com/loom-ai-org/loom-py
- Paquete en PyPI: `loom-py-rt`
