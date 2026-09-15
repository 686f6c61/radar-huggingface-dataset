# olafura/gemma-language-detection

## Resumen

`olafura/gemma-language-detection` es un detector de idioma hablado (spoken language identification) construido a partir de los cinco primeros bloques de la torre de audio de `google/gemma-4-E2B-it`, a los que se anade una cabeza lineal entrenada sobre features agrupadas con mean/std pooling. El modelo identifica el idioma de un fragmento de audio de tan solo un segundo de duracion y esta desarrollado por el autor olafura dentro del proyecto Elixir/Nx `gemma-4-mic-transcribe`. El segmento de torre utilizado son pesos Gemma congelados de 127M de parametros, mientras que cada cabeza de clasificacion anade aproximadamente 100k parametros adicionales.

La relevancia del artefacto esta en su planteamiento de eficiencia: en lugar de desplegar un modelo de audio de gran tamano para una tarea de clasificacion, reutiliza una porcion congelada de un modelo multimodal y entrena unicamente una cabeza ligera. Esto permite ejecucion en CPU a traves de Torchx o en GPU Nvidia mediante EXLA, con una latencia de 93 ms por clip de un segundo en una A100 y 143 ms en una CPU Strix Halo. El repositorio ocupa 0,5 GB y cada artefacto de inferencia pesa 254 MB en `parameters.safetensors`.

Se trata de un snapshot en desarrollo (work in progress) y no de un lanzamiento estable: el propio autor advierte de que los idiomas con mal rendimiento lo son por falta de datos de entrenamiento, no por diseno. Se publican dos cabezas: `sent49/`, con 49 idiomas, y `mixed34/`, con 34 idiomas (18 de ellos en formato de inicio de frase y 16 en formato de palabra suelta, incluido el chino).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Torre de audio de Gemma 4 E2B (primeros 5 bloques, congelados) mas cabeza lineal sobre features con mean/std pooling |
| Parametros totales | 127M en el segmento de torre congelado; aproximadamente 100k por cabeza de clasificacion |
| Parametros activos | no disponible (el artefacto publicado solo describe el segmento de torre utilizado) |
| Longitud de contexto | no disponible (ventana de audio de 1 segundo por clip; el modelo de lenguaje subyacente no se usa como decoder) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors sin cuantizacion declarada) |
| Idiomas soportados | 49 idiomas en `sent49/` y 34 en `mixed34/`; la model card lista 65 etiquetas ISO de idioma, entre ellas es, en, de, fr, it, pt, ru, zh, ja, ko, ar, hi, sw, uk, tr |
| Licencia | Apache-2.0 para la cabeza y el codigo; los pesos base estan sujetos a los terminos de uso de Gemma |
| Formato de pesos | safetensors (`parameters.safetensors`, 254 MB) mas `manifest.etf` con metadatos (idiomas, profundidad, ventana, pooling y rutas de parametros) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer completo desplegado de extremo a extremo, sino un extractor congelado mas una sonda lineal. Se toman los cinco primeros bloques de la torre de audio de `google/gemma-4-E2B-it`, se mantienen sus pesos fijos (127M de parametros) y sobre las activaciones resultantes se aplica un pooling de media y desviacion estandar. Esa representacion agregada alimenta una cabeza lineal de unos 100k parametros que produce la distribucion sobre el conjunto de idiomas. El modelo se ejecuta con Elixir/Nx desde el repositorio `olafura/gemma-4-mic-transcribe`, mediante los comandos `language_id detect`, `serve` y `validate`, sobre CPU con Torchx o sobre GPU Nvidia con EXLA.

Los datos de entrenamiento provienen de Common Voice 17 (`fixie-ai/common_voice_17_0`), split de entrenamiento, con hablantes disjuntos respecto a los shards de test. La cabeza `sent49/` se ajusto sobre inicios de frase de Common Voice, con hasta 1500 clips por idioma y un total de 47,6k clips. La cabeza `mixed34/` combina 18 idiomas en formato de inicio de frase con 16 idiomas en formato de palabra suelta. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo coherente con que la tarea sea de clasificacion y no de generacion.

## Capacidades

- Identificacion de idioma hablado a partir de un solo segundo de audio, con salida de etiqueta de idioma.
- Modo con lista de candidatos: si se restringe el conjunto de idiomas posibles (parametro `languages` en la API), la precision aumenta de forma notable (76,1% top-1 frente a 70,0% con 18 idiomas abiertos).
- Agregacion sobre clips completos: sumando ventanas de un segundo a lo largo de todo el clip, el top-1 sube del 46,0% al 57,7% en el conjunto de evaluacion de fixie-ai.
- Dos cabezas especializadas: `sent49/` para 49 idiomas en habla continua y `mixed34/` para mezcla de frases y palabras sueltas.
- Servicio HTTP integrado: el comando `language_id serve --artifact <carpeta> --port <puerto>` levanta un endpoint `/detect` que acepta audio binario y una lista de idiomas candidatos.
- Ejecucion en CPU y en GPU: Torchx para CPU, EXLA para GPU Nvidia, sin depender de un stack Python.
- Cobertura multilingue amplia: 65 etiquetas de idioma declaradas en el repositorio, incluidas lenguas de bajos recursos como asturiano, breton, corsa, gallego, occitano, oriya, kabyle, luganda, kinyarwanda y tatar.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling ni agentes: la salida del artefacto es exclusivamente una clasificacion de idioma.

## Casos de uso

- Enrutamiento automatico en centros de atencion telefonica: al recibir una llamada, el detector etiqueta el idioma del hablante en el primer segundo de audio y permite dirigir la llamada al agente o al modelo de ASR adecuado sin intervencion humana.
- Preprocesado de pipelines de reconocimiento de voz: seleccionar el modelo acustico o el idioma de decodificacion antes de transcribir, aprovechando la latencia de 93 ms en A100 para no penalizar el tiempo total.
- Indexacion y etiquetado de archivos de audio: procesar grandes volumenes de grabaciones (entrevistas, podcasts, archivos de investigacion) sumando ventanas de un segundo para obtener una etiqueta de idioma por clip con mayor precision.
- Moderacion y analitica de contenido de audio generado por usuarios: clasificar el idioma de subidas en plataformas para aplicar politicas por region o activar filtros especificos por lengua.
- Transcripcion de reuniones multilingues: al detectar el idioma por segmentos de habla, se puede conmutar el modelo de transcripcion a medida que cambian los interlocutores.
- Investigacion linguistica y sociolinguistica: etiquetado rapido de corpus de campo en lenguas minorizadas (asturiano, breton, gallego, occitano, tatar) para tareas de seleccion y limpieza previas al analisis.
- Despliegue en dispositivos sin GPU: el peso de 254 MB y el soporte de Torchx en CPU permiten integrarlo en equipos de sobremesa o servidores modestos, con 143 ms por clip en una CPU Strix Halo.
- Verificacion previa a la traduccion automatica: confirmar el idioma de origen de un audio antes de enviarlo a un sistema de traduccion de voz, evitando traducciones erroneas por deteccion incorrecta.

## Benchmarks y rendimiento

Precision top-1 y top-3 sobre hablantes reservados, con un segundo de audio y todos los idiomas abiertos salvo indicacion contraria:

| Cabeza | Conjunto de test | Top-1 | Top-3 |
|---|---|---|---|
| sent49 | Common Voice, inicios de frase, 49 idiomas, 1436 clips | 48,7% | 66,4% |
| sent49 | Mismo conjunto, 18 idiomas mejor cubiertos | 70,0% | 87,4% |
| sent49 | Mismo conjunto, 18 idiomas indicados como candidatos | 76,1% | 90,9% |
| mixed34 | Common Voice, inicios de frase, sus 18 idiomas de frase | 75,2% | 89,3% |
| sent49 | `fixie-ai/language_detection-audio`, 21 candidatos, primer segundo | 46,0% | 64,3% |
| sent49 | Mismo conjunto, ventanas de 1 s sumadas sobre el clip completo | 57,7% | 74,7% |

Comparacion directa publicada en la model card sobre `fixie-ai/language_detection-audio`: Ultravox 32B (v0.6, Qwen3-32B) obtiene 45,0% desde el primer segundo y 89,3% sobre clips completos. Tiempo de inferencia por clip de un segundo: 93 ms en A100 y 143 ms en CPU Strix Halo.

Idiomas con menos de 1000 inicios de entrenamiento, donde la cabeza tiende a responder con un idioma vecino (numero de inicios entre parentesis): te 8, oc 34, ko 47, ast 49, ml 158, sl 174, mk 211, sr 235, el 240, ha 241, fi 260, mn 272, mr 277, vi 288, et 395, sk 408, da 436, hi 587, bg 607, ro 643, ur 671, lt 907.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto pesa 254 MB, por lo que cabe holgadamente en cualquier GPU con 1 GB o mas de memoria; en CPU el consumo es el del propio modelo mas el del runtime de Nx.
- GPU medidas: A100 con 93 ms por clip de un segundo. El modelo es lo bastante pequeno para ejecutarse en cualquier GPU Nvidia compatible con EXLA, incluidas RTX 4090, RTX 3090 o tarjetas de gama media.
- Cabe en GPU de consumo: si, con margen amplio, dado el tamano de 254 MB del artefacto.
- Ejecucion sin GPU: si, mediante Torchx en CPU; se reportan 143 ms por clip en una CPU Strix Halo (AMD Ryzen AI Max).
- Opciones de despliegue: CLI y servidor HTTP del proyecto `olafura/gemma-4-mic-transcribe` (`language_id detect`, `serve`, `validate`), con backend Torchx o EXLA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput estimados: 93 ms por clip de un segundo en A100 y 143 ms en CPU Strix Halo. No se publican cifras de throughput agregado ni de peticiones por segundo.
- API del servicio: `./language_id serve --artifact sent49 --port 7861` y peticion `curl -s -X POST --data-binary @clip.wav 'localhost:7861/detect?languages=en,de,sv-SE'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto o entrada | Rendimiento en LID | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-language-detection (sent49) | 127M de torre congelada mas 100k de cabeza | 1 s de audio, ampliable sumando ventanas | 48,7% top-1 en 49 idiomas; 57,7% top-1 en fixie-ai sumando ventanas | Apache-2.0 (cabeza y codigo); pesos base bajo terminos de Gemma | HuggingFace, via proyecto Elixir/Nx |
| Ultravox 32B (v0.6, Qwen3-32B) | 32B | 1 s inicial o clip completo | 45,0% en el primer segundo; 89,3% en clip completo sobre fixie-ai | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Otros clasificadores de idioma hablado | no disponible | no disponible | no disponible | no disponible | no disponible |

El unico punto de comparacion con cifras publicadas en la model card es Ultravox 32B: el modelo de olafura es dos ordenes de magnitud mas pequeno y rinde ligeramente mejor con un solo segundo (48,7% frente a 45,0%), pero queda muy por detras cuando Ultravox procesa clips completos (57,7% frente a 89,3%). No se han encontrado en la busqueda web otros modelos comparables con datos verificables.

## Limitaciones y advertencias

- Es un snapshot en desarrollo (work in progress), no una version estable ni un release; el autor lo declara explicitamente.
- Precision limitada con todos los idiomas abiertos: 48,7% top-1 sobre 49 idiomas con un segundo de audio. Solo alcanza cifras utilizables cuando se restringe la lista de candidatos.
- Idiomas con pocos datos de entrenamiento: te, oc, ko, ast, ml, sl, mk, sr, el, ha, fi, mn, mr, vi, et, sk, da, hi, bg, ro, ur y lt tienen menos de 1000 inicios y la cabeza tiende a confundirlos con idiomas vecinos.
- Ventana de entrada de un segundo: con clips mas largos es necesario agregar ventanas, y la mejora es moderada (46,0% a 57,7% en el conjunto de fixie-ai).
- No detecta idioma escrito, ni realiza traduccion, transcripcion ni generacion de texto.
- Licencia mixta: la cabeza y el codigo son Apache-2.0, pero los pesos base derivan de `google/gemma-4-E2B-it` y quedan sujetos a los terminos de uso de Gemma, lo que puede condicionar el uso comercial. Es imprescindible revisar dichos terminos antes de un despliegue en produccion.
- Sesgos potenciales derivados de Common Voice 17: la composicion del corpus condiciona el rendimiento por idioma, acento, genero y calidad de grabacion; los idiomas con menos hablantes en el dataset quedan penalizados.
- Riesgo de falsos positivos en audio con ruido, musica, silencio o habla superpuesta, ya que se trata de un clasificador de una ventana corta.
- No se publican datos sobre calibracion de probabilidades, umbral de rechazo ni comportamiento ante audio no vocal.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado los resultados de forma independiente.
- La busqueda web realizada no ha devuelto documentacion tecnica relevante: los resultados obtenidos son paginas de diccionario sin relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/olafura/gemma-language-detection
- Repositorio del runtime Elixir/Nx: https://github.com/olafura/gemma-4-mic-transcribe
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento (Common Voice 17): https://huggingface.co/datasets/fixie-ai/common_voice_17_0
- Dataset de evaluacion (fixie-ai): https://huggingface.co/datasets/fixie-ai/language_detection-audio
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
