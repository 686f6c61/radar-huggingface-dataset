# cstr/orukeet-GGUF

## Resumen

Orukeet GGUF es la conversion al formato GGUF del checkpoint `oruk/orukeet` (revision r3), un modelo de reconocimiento automatico de voz desarrollado por Oruk AI como ajuste fino de `nvidia/parakeet-tdt-0.6b-v3`. La conversion la publica el usuario `cstr` para poder ejecutarlo en CrispASR, un runtime de ASR basado en ggml. El paquete contiene cuatro ficheros cuantizados (F16, Q8_0, Q5_0 y Q4_K) y esta pensado para transcripcion multilingue en local, sin dependencia de frameworks de deep learning completos.

El modelo tiene 627.115.158 parametros (unos 627 millones) y cubre 25 idiomas europeos con deteccion automatica de idioma y marcas de tiempo por palabra mediante decodificacion TDT. La arquitectura es la de Parakeet: encoder FastConformer con decodificador Token-and-Duration Transducer, por lo que no es un modelo generativo de texto ni un LLM, sino un sistema especializado de voz a texto.

Su relevancia practica esta en el coste de despliegue: al estar cuantizado en GGUF, el fichero por defecto (Q4_K) ocupa 402 MB y se puede ejecutar en CPU, lo que permite transcripcion en entornos sin GPU. La contrapartida principal es que el paso final de adaptacion del modelo se entreno con las 2.939 grabaciones de LibriSpeech test-other, de modo que su resultado en ese conjunto no es una medida fuera de muestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer + decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 627.115.158 (aproximadamente 627 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de tokens; el audio se procesa por fragmentos con VAD y chunking (limite maximo no disponible) |
| Tipos de cuantizacion | F16, Q8_0, Q5_0, Q4_K (Q4_K es el valor por defecto para `-m orukeet`) |
| Idiomas soportados | 25 idiomas europeos: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (libreria ggml); el checkpoint original esta en formato `.nemo` |
| Modelo base | `nvidia/parakeet-tdt-0.6b-v3`, ajustado por Oruk AI en `oruk/orukeet` |
| Tamano del repositorio | 2,8 GB |
| Tareas | automatic-speech-recognition (transcripcion) |
| Deteccion de idioma | automatica, integrada en el modelo |
| Marcas de tiempo | por palabra (TDT word timestamps), salida SRT disponible |
| Runtime de referencia | CrispASR (backend Parakeet) |

## Arquitectura y entrenamiento

El modelo conserva la topologia de Parakeet TDT 0.6B v3: un encoder FastConformer con convoluciones depthwise temporales y un decodificador TDT que predice simultaneamente el token y su duracion, lo que permite emitir marcas de tiempo por palabra sin un alineador externo. La innovacion del ajuste fino de Oruk AI es estructural pero contenida: la mitad de los kernels de convolucion depthwise temporal del encoder (12.288 de 24.576) se sustituyeron por funciones de Gabor ajustadas y se congelaron, tras lo cual el modelo se re-adapto. Las formas de los tensores y los operadores no cambian, por lo que el resultado se ejecuta en el runtime Parakeet ya existente sin modificaciones de codigo.

El detalle de entrenamiento mas relevante para la evaluacion es que el ultimo paso de adaptacion utilizo las 2.939 grabaciones completas de LibriSpeech test-other, conjunto que ademas se uso para seleccion de checkpoint y reevaluacion. En consecuencia, la puntuacion de Orukeet en LibriSpeech test-other no es un resultado held-out y no debe usarse para comparar con otros sistemas. No se documentan en la informacion disponible el numero total de tokens de audio, la composicion completa del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en un modelo de ASR, pero no confirmadas).

## Capacidades

- Transcripcion de voz a texto en 25 idiomas europeos con deteccion automatica del idioma de entrada.
- Generacion de marcas de tiempo a nivel de palabra mediante decodificacion TDT.
- Salida en formato SRT para subtitulado, con opcion de emision directa desde la CLI.
- Segmentacion de audio largo mediante VAD y chunking, herencia de las opciones del backend Parakeet.
- Puntuacion basica y formato de frases en la salida (con degradaciones menores observadas en Q4_K).
- Ejecucion en CPU sin GPU dedicada, gracias a las cuantizaciones GGUF.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio generation ni modo de razonamiento explicito: es un modelo puramente de transcripcion.

## Casos de uso

- Subtitulado automatico de video: la salida SRT con marcas de tiempo por palabra permite generar subtitulos sincronizados para plataformas de video o archivos de formacion, con un fichero de 402 MB (Q4_K) que se puede ejecutar en un servidor sin GPU.
- Transcripcion de reuniones multilingues: la deteccion automatica de idioma y la cobertura de 25 idiomas europeos permiten procesar reuniones con participantes que hablan en aleman, frances, polaco o neerlandes sin especificar el idioma de antemano.
- Indexacion y busqueda de archivos de audio: al producir texto con timestamps por palabra, se puede construir un indice buscable sobre archivos de audio historicos y saltar al minuto exacto donde aparece un termino.
- Analisis de llamadas de contact center: el modelo transcribe grabaciones telefonicas en lote sobre CPU, lo que abarata el procesamiento masivo frente a soluciones que requieren GPU.
- Accesibilidad en tiempo real: integrado en CrispASR con VAD y chunking, puede alimentar un flujo de subtitulado en directo en emisiones o eventos con hardware modesto.
- Despliegue en entornos aislados o sin conexion: al ser un GGUF autocontenido de menos de 1,3 GB en F16, se puede distribuir en equipos on-premise de administraciones publicas o entornos sanitarios donde no se permite enviar audio a la nube.
- Prototipado e investigacion en ASR: sirve como referencia para comparar el efecto de la sustitucion de kernels por funciones de Gabor frente al checkpoint original, usando las herramientas de diff por etapas de CrispASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER en LibriSpeech, Common Voice, FLEURS u otros) en la informacion disponible. El aviso del propio autor indica que la puntuacion en LibriSpeech test-other no es valida como medida held-out porque ese conjunto se uso en entrenamiento y seleccion de checkpoint.

Lo que si se publica es una verificacion numerica de fidelidad de la conversion GGUF frente al checkpoint original en NeMo, con similitud coseno por etapas en F16:

| Etapa | en (jfk, 138 frames) | de (61 frames) |
|---|---|---|
| Espectrograma mel | 1,000000 | 1,000000 |
| Pre-encode | 0,999998 | 0,999986 |
| Capas del encoder 0-23 (peor capa) | >= 0,999981 | >= 0,999942 |
| Salida del encoder | 0,999883 | 0,999988 |

Para las versiones cuantizadas, la desviacion frente a NeMo corresponde a error de cuantizacion ordinario (Q8_0, `cos_mean` de la salida del encoder: 0,9996 en ingles y 0,9961 en aleman). La comprobacion end-to-end de transcripciones es la siguiente:

| Clip | NeMo | F16 | Q8_0 | Q4_K |
|---|---|---|---|---|
| en, `samples/jfk.wav` | And so, my fellow Americans, ask not what your country can do for you, ask what you can do for your country. | = | = | = |
| de | Guten Morgen. Die Sitzung beginnt heute um neun Uhr im großen Saal. | = | = | punct. |
| fr | Bonjour à tous, la réunion commence demain matin à huit heures. | = | = | = |
| es | Buenas tardes. El tren para Madrid sale a las cinco y media. | = | = | punct. |

`=` indica texto identico; `punct.` indica palabras identicas con un punto final de frase representado como coma.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano de los pesos, con overhead de runtime no especificado): aproximadamente 1,5-2 GB para F16 (1,26 GB de pesos), alrededor de 1 GB para Q8_0 (674 MB), y menos de 1 GB para Q5_0 (470 MB) y Q4_K (402 MB). Las cifras exactas no estan publicadas.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, con uso de VRAM marginal. Tambien esta pensado para ejecucion en CPU, que es como se genero la referencia de NeMo en el model card.
- No requiere GPU: la comparacion de referencia se hizo en CPU con decodificacion TDT greedy.
- Opciones de despliegue: CrispASR es el runtime soportado, con deteccion automatica del backend Parakeet a partir del GGUF. No hay soporte documentado en la informacion disponible para vLLM, TGI, Ollama o llama.cpp, dado que se trata de una arquitectura de ASR y no de un transformer generativo de texto.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo real, RTF ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `cstr/orukeet-GGUF` | 627 M | 25 idiomas europeos | CC BY-SA 4.0 | GGUF (F16, Q8_0, Q5_0, Q4_K) | Cuantizado para CrispASR, ejecutable en CPU |
| `oruk/orukeet` | 627 M | 25 idiomas europeos | CC BY-SA 4.0 | `.nemo` | Checkpoint original del ajuste fino, requiere NeMo |
| `nvidia/parakeet-tdt-0.6b-v3` | 627 M | 25 idiomas europeos | CC BY 4.0 | NeMo / otros | Modelo base sin la sustitucion de kernels por funciones de Gabor |
| Whisper large-v3 (referencia externa) | aproximadamente 1.550 M | mas de 90 idiomas | MIT | safetensors, GGUF via conversiones de terceros | Comparativa de WER frente a Orukeet no disponible en la informacion proporcionada |

No se dispone de comparativas de WER entre estos modelos en la informacion proporcionada.
## Limitaciones y advertencias

- Contaminacion del conjunto de evaluacion: el ultimo paso de adaptacion entreno con las 2.939 grabaciones de LibriSpeech test-other, que tambien se uso para seleccion de checkpoint y reevaluacion. Cualquier cifra de ese conjunto esta sesgada al alza y no es comparable.
- Alcance limitado a ASR: no genera texto libre, no razona, no ejecuta herramientas ni soporta agentes. No debe presentarse como un LLM.
- Cobertura linguistica restringida a 25 idiomas europeos; no hay datos sobre comportamiento en idiomas fuera de esa lista ni sobre cambio de codigo dentro de una misma grabacion.
- Deriva de puntuacion en Q4_K: se observa que un punto final de frase se convierte en coma en aleman y en espanol. Para produccion que dependa de la puntuacion exacta, conviene usar Q8_0 o F16.
- Alucinacion y errores de transcripcion: como cualquier sistema ASR, puede producir texto plausible pero incorrecto en audio con ruido, solapamiento de voces, acentos no vistos o vocabulario especializado. No hay datos publicados de robustez en condiciones adversas.
- Licencia CC BY-SA 4.0: el uso comercial esta permitido, pero obliga a atribuir a los autores y a distribuir cualquier obra derivada bajo la misma licencia. Esto puede ser incompatible con productos propietarios que no quieran liberar derivados. La licencia se hereda del ajuste fino de Oruk AI; el modelo base de NVIDIA es CC BY 4.0, mas permisiva.
- Herramientas y ecosistema limitados: el soporte practico depende de CrispASR y de su backend Parakeet. No hay integraciones documentadas con servidores de inferencia habituales.
- Datos incompletos: no se publican numero de horas de entrenamiento, composicion del dataset ni metricas de latencia y throughput, lo que dificulta una evaluacion de coste en produccion.

## Enlaces

- Ficha HuggingFace del modelo: https://huggingface.co/cstr/orukeet-GGUF
- Modelo base del ajuste fino: https://huggingface.co/oruk/orukeet
- Informe tecnico de Orukeet: https://huggingface.co/oruk/orukeet/blob/main/docs/technical-report.md
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- No se han encontrado otros enlaces relevantes en la busqueda web realizada (los resultados obtenidos no guardaban relacion con el modelo).
