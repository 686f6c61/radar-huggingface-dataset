# Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-onnx-int8

## Resumen

Lorqa Nemotron 3.5 multilingual — 320 ms ONNX INT8 es un espejo de ejecución (runtime mirror) del bundle ONNX publicado por el usuario csukuangfj2 para sherpa-onnx, a su vez derivado del modelo original `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA. Se trata de un modelo de reconocimiento automatico del habla (ASR) en streaming, multilingue y de tipo cache-aware FastConformer-RNNT, con aproximadamente 0,6 mil millones de parametros y cuantizado a INT8. El autor declara que encoder, decoder, joiner y tokens son byte a byte identicos al bundle de origen, sin reentrenamiento ni recuantizacion.

El paquete incluye cuatro ficheros de runtime (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx` y `tokens.txt`) que suman 682.215.471 bytes (unos 682 MB) y un extractor de caracteristicas de 128 bins. El parametro "320 ms" hace referencia al tamano de fragmento (chunk) de audio que consume el modelo, no a una garantia de latencia extremo a extremo del texto visible.

Su relevancia practica es doble: por un lado permite ejecutar ASR multilingue en streaming sobre sherpa-onnx y onnxruntime sin dependencias de frameworks pesados; por otro, al estar en formato ONNX INT8 resulta desplegable en CPU y en hardware modesto, lo que lo hace util para subtitulado en vivo, transcripcion de llamadas y asistentes de voz embebidos en idiomas que incluyen el chino mandarin, el ingles y el japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-RNNT cache-aware en streaming (encoder, decoder y joiner) |
| Parametros totales | 0,6 mil millones (segun denominacion del modelo) |
| Parametros activos | no aplica (arquitectura densa RNNT, no es MoE) |
| Longitud de contexto | no disponible como ventana de contexto; procesa audio por fragmentos de 320 ms |
| Tipos de cuantizacion | INT8 (ficheros `.int8.onnx` de encoder, decoder y joiner) |
| Idiomas soportados | zh, en, ja y multilingue (la tarjeta declara multilingue; la informacion de busqueda atribuye al modelo de origen 40 locales con acondicionamiento por language-ID) |
| Licencia | OpenMDW 1.1 |
| Formato de pesos | ONNX (bundle con `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`, `tokens.txt`); no es Core ML ni GGUF |
| Tamano del bundle | 682.215.471 bytes, aproximadamente 682 MB (tamano del repo en HuggingFace: 0,7 GB) |
| Extractor de caracteristicas | 128 bins |
| Runtime recomendado | sherpa-onnx con soporte para Nemotron 3.5 multilingual; requiere onnxruntime |
| Revision de origen | `424ce58898995b713f84341f2e1492f9207a26aa` |
| Pipeline | automatic-speech-recognition |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es una FastConformer-RNNT con atencion cache-aware disenada para streaming, es decir, mantiene estado entre fragmentos para poder emitir transcripciones incrementales sin reprocesar todo el audio. El modelo se descompone en los tres modulos tipicos de un RNNT: un encoder (la red convolucional y de atencion que extrae representaciones acusticas), un decoder o predictor (que modela el historial de etiquetas) y un joiner (que combina ambas representaciones para emitir tokens). Sobre esta base, la variante multilingue de NVIDIA anade acondicionamiento mediante un prompt de identificacion de idioma (language-ID), lo que permite que un unico conjunto de pesos cubra varias lenguas.

En cuanto al entrenamiento, esta ficha no dispone de informacion sobre el numero de tokens de audio, la composicion del dataset, el uso de RLHF/DPO ni el detalle del pipeline de destilacion o ajuste. Lo unico verificable es que este repositorio concreto no entrena nada: es una copia byte a byte del bundle publicado por csukuangfj2, cuyo modelo fuente es `nvidia/nemotron-3.5-asr-streaming-0.6b`. La innovacion tecnica relevante no esta en este espejo, sino en el modelo original: streaming cache-aware, soporte multilingue con prompt de idioma por stream (idioma explicito o `auto`) y empaquetado INT8 para inferencia eficiente en CPU.

## Capacidades

- Reconocimiento automatico del habla en streaming, con emision incremental de texto a partir de fragmentos de 320 ms de audio.
- Transcripcion multilingue: la tarjeta lista zh, en y ja, ademas de la etiqueta generica `multilingual`; la documentacion del modelo de origen menciona 40 locales.
- Seleccion de idioma por stream mediante cadenas de language-ID, con opcion de deteccion automatica (`auto`), segun las instrucciones oficiales de despliegue de sherpa-onnx.
- Procesamiento cache-aware: conserva contexto acustico entre fragmentos, lo que permite conversaciones y audio continuo sin cortes duros.
- Ejecucion en formato ONNX INT8 sobre onnxruntime, apta para entornos sin GPU.
- No es un modelo de lenguaje: no genera texto libre, no razona, no escribe codigo, no hace tool calling ni function calling, no soporta agentes ni multi-step reasoning, y no incorpora vision ni audio generativo.
- No incluye diarizacion de hablantes, puntuacion automatica ni traduccion: cualquier capacidad de ese tipo tendria que anadirse con modulos externos.

## Casos de uso

- Subtitulado en directo en emisiones o videollamadas: el modelo consume fragmentos de 320 ms y emite texto de forma incremental, lo que permite mostrar subtitulos con un retardo controlado por el desarrollador mediante sherpa-onnx.
- Transcripcion de centros de contacto multilingues: con soporte para zh, en y ja y seleccion de idioma por stream, se puede transcribir cada llamada en su idioma sin desplegar un modelo distinto por lengua.
- Asistentes de voz embebidos en dispositivos de gama baja: al ser un bundle ONNX INT8 de 682 MB y ejecutable sobre onnxruntime en CPU, encaja en kioscos, televisores, sistemas de automocion o hardware industrial sin GPU dedicada.
- Accesibilidad para personas con discapacidad auditiva: transcripcion continua de conversaciones presenciales o de aula con un unico modelo cargado en memoria y salida de texto en tiempo real.
- Indexacion y busqueda de archivos de audio y video corporativos: se puede transcribir un archivo largo en modo streaming para alimentar un indice de busqueda textual, aprovechando el bajo coste de inferencia en INT8.
- Analitica de calidad y cumplimiento: transcripcion de grabaciones para revision posterior por parte de equipos de compliance o QA, siempre que se valide previamente la tasa de error sobre el dominio concreto (terminologia legal, financiera o medica).
- Sistemas de IVR y voz interactiva: integracion del reconocedor como primer eslabon de una pipeline de dialogo, con la salida de texto enviada a un componente de comprension o a un LLM independiente.
- Prototipado rapido de productos de voz: al no requerir infraestructura de GPU ni frameworks propietarios, sirve para validar hipotesis de producto antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del modelo no incluye cifras de WER, CER ni comparaciones con otros sistemas, y tampoco se han encontrado metricas en los resultados de busqueda. Cualquier cifra de calidad deberia obtenerse evaluando el bundle sobre grabaciones propias del dominio de interes, tal como recomienda el propio autor respecto al chino.

## Requisitos de hardware

- Almacenamiento: 682.215.471 bytes para los cuatro ficheros de runtime (aproximadamente 682 MB); el repositorio completo ocupa 0,7 GB.
- Memoria de ejecucion: la tarjeta advierte explicitamente de que la memoria en ejecucion supera el tamano de descarga, por lo que no debe dimensionarse el sistema asumiendo solo los 682 MB del bundle.
- VRAM para GPU: no disponible. El autor no publica requisitos de VRAM ni confirma aceleracion por GPU, aunque el runtime onnxruntime permite execution providers CUDA o TensorRT si la build de sherpa-onnx lo soporta.
- CPU: es el escenario natural del bundle INT8; no se facilitan cifras de latencia ni de consumo por nucleo.
- GPU recomendadas: no disponible. Por el tamano del bundle (menos de 1 GB en INT8) cabe holgadamente en cualquier GPU de consumo actual, pero se trata de una inferencia derivada del tamano, no de un dato publicado.
- Latencia: el unico dato confirmado es el tamano de fragmento de 320 ms; el autor insiste en que no equivale a la latencia visible de texto extremo a extremo. Existe una variante de 80 ms del mismo autor para escenarios que prioricen capacidad de respuesta.
- Opciones de despliegue: sherpa-onnx con una release que soporte Nemotron 3.5 multilingual, sobre onnxruntime. No es compatible con cargadores Core ML ni FluidAudio; existe una variante Core ML separada en el mismo espacio de nombres.
- No aplica: vLLM, llama.cpp, Ollama o TGI, ya que no se trata de un LLM ni de pesos GGUF.

## Comparativa con modelos similares

| Modelo | Parametros | Fragmento / streaming | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-onnx-int8 (este) | 0,6 B | 320 ms, streaming cache-aware | zh, en, ja, multilingue | ONNX INT8 | OpenMDW 1.1 | Espejo byte a byte del bundle de csukuangfj2; 0 descargas y 0 likes |
| csukuangfj2/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-320ms-int8-2026-06-11 | 0,6 B | 320 ms, streaming | multilingue | ONNX INT8 | OpenMDW 1.1 (via modelo fuente) | Origen del que este repositorio es copia identica (revision 424ce58) |
| Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-80ms-onnx-int8 | 0,6 B | 80 ms, streaming | multilingue | ONNX INT8 | OpenMDW 1.1 | Misma familia, fragmento mas corto: mas reactividad, presumiblemente mas coste por segundo de audio |
| Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-coreml | 0,6 B | 320 ms, streaming | multilingue | Core ML | OpenMDW 1.1 | Variante para Apple Silicon; no intercambiable con este bundle ONNX |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6 B | streaming | multilingue (40 locales citados en la documentacion) | pesos originales (formato no detallado en la informacion disponible) | OpenMDW 1.1 | Modelo fuente de NVIDIA, con acondicionamiento por language-ID |
| nvidia/nemotron-speech-streaming-en-0.6b | 0,6 B | streaming | ingles | no disponible | no disponible | Version anterior y solo en ingles; este bundle es la extension multilingue |

No se dispone de datos de rendimiento comparado (WER, RTF) que permitan ordenar estas alternativas por calidad.

## Limitaciones y advertencias

- No es un modelo entrenado por Lorqa: es un espejo de runtime sin reentrenamiento, sin recuantizacion y sin mejoras de precision declaradas. Cualquier merito o defecto de calidad corresponde al modelo de NVIDIA y al exportador original.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, y publicado por un autor no oficial respecto de NVIDIA. Conviene verificar SHA256SUMS tras la descarga, tal como indica la propia tarjeta.
- Idiomas: aunque la etiqueta sea `multilingual` y la documentacion del modelo fuente cite 40 locales, la tarjeta solo lista zh, en y ja. El propio autor advierte que el chino es un "locale de cobertura amplia" y que su precision debe evaluarse sobre grabaciones propias.
- Latencia: el fragmento de 320 ms no garantiza la latencia del texto visible extremo a extremo. Fragmentos mayores mejoran precision y eficiencia de computo a costa de reactividad.
- Consumo de memoria: la memoria en ejecucion supera el tamano del bundle descargado; hay que sobredimensionar el contenedor o el dispositivo.
- Compatibilidad estricta: requiere una release de sherpa-onnx con soporte para Nemotron 3.5 multilingual y un extractor de 128 bins. No se puede cargar en Core ML ni en cargadores FluidAudio, y no funciona con runtimes de LLM como vLLM, llama.cpp, Ollama o TGI.
- Riesgo de error de transcripcion: como todo sistema ASR, puede fallar en nombres propios, siglas, terminologia tecnica, acentos marcados, ruido de fondo, solapamiento de hablantes y cambio de idioma dentro de una misma frase (code-switching). No debe usarse sin supervision humana en contextos con consecuencias legales, medicas o financieras.
- Sin capacidades de post-proceso: no incorpora puntuacion, mayusculas, diarizacion ni traduccion; estos elementos deben aportarse desde fuera.
- Licencia: OpenMDW 1.1, heredada del modelo fuente de NVIDIA. Antes de un uso comercial conviene revisar el texto completo de la licencia, ya que esta ficha no puede certificar sus condiciones concretas.
- Idiomas no declarados: no hay informacion sobre el comportamiento del modelo con castellano, por lo que no puede asumirse su uso para espanol sin una evaluacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-onnx-int8
- Espejo en ModelScope: https://modelscope.cn/models/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-onnx-int8
- Bundle de origen (csukuangfj2, revision 424ce58898995b713f84341f2e1492f9207a26aa): https://huggingface.co/csukuangfj2/sherpa-onnx-nemotron-3.5-asr-streaming-0.6b-320ms-int8-2026-06-11
- Modelo fuente de NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Variante de 80 ms en ONNX INT8: https://huggingface.co/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-80ms-onnx-int8
- Variante Core ML de 320 ms: https://huggingface.co/Lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-coreml
- Instrucciones oficiales de despliegue multilingue en sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/nemo/nemotron-streaming.html
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1.1
- Exportacion a ONNX y motor de streaming minimo (repositorio de terceros): https://github.com/codavidgarcia/nemotron-3.5-asr-streaming-onnx/tree/main
- Documentacion del modelo de origen en un repositorio de terceros: https://github.com/weyan618/nemotron-asr/blob/main/nemotron-asr/nemotron-3.5-asr-streaming-0.6b/README.md
- Ficha de registro de la variante Core ML en free2aitools: https://free2aitools.com/model/lorqa/nemotron-3.5-asr-streaming-multilingual-0.6b-320ms-coreml
