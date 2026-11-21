# ggml-org/hibiki-2b-GGUF

## Resumen

Hibiki 2B es un modelo de traducción de voz en tiempo real desarrollado por Kyutai, distribuido en formato GGUF por ggml-org para su uso con llama.cpp. El modelo implementa traducción simultánea de voz a voz: recibe audio en francés y emite audio en inglés, manteniendo una latencia de 80 ms por bloque, lo que lo hace adecuado para escenarios de interpretación en directo. Cuenta con 2.172.646.400 parámetros y una arquitectura full-duplex diseñada específicamente para streaming continuo.

La relevancia de esta ficha radica en que el modelo base original (kyutai/hibiki-2b-pytorch-bf16) ha sido convertido y cuantizado a GGUF por ggml-org, lo que permite ejecutarlo en infraestructura local mediante `llama-server` sin depender de APIs en la nube. La licencia CC-BY-4.0 facilita su uso comercial con atribución. El repositorio ocupa 8,2 GB en total.

Este modelo no es un LLM de propósito general: es un sistema especializado de traducción de habla que opera exclusivamente a través del endpoint full-duplex de llama-server, con entrada y salida de audio cada 80 ms. No está pensado para generación de texto, código ni razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex audio-to-audio (basada en kyutai/hibiki-2b-pytorch-bf16) |
| Parametros totales | 2.172.646.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1500 tokens (valor recomendado en el comando `llama-server -c 1500`) |
| Tipos de cuantizacion | GGUF cuantizado (variantes no detalladas en la informacion disponible) |
| Idiomas soportados | Frances (entrada) e ingles (salida) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (repo de 8,2 GB); modelo base en PyTorch bf16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Se sabe que es un modelo full-duplex de traduccion de voz a voz, disenado para procesar audio de entrada y generar audio de salida de forma continua en bloques de 80 ms. Esta orientacion full-duplex implica que el modelo mantiene estado a lo largo del flujo de audio, a diferencia de los sistemas de traduccion por turnos que esperan a que el hablante termine.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas mas alla del propio paradigma full-duplex. El modelo base es kyutai/hibiki-2b-pytorch-bf16, y la version GGUF ha sido convertida automaticamente mediante la herramienta ggml-org/convert.

## Capacidades

- Traduccion de voz a voz en tiempo real: entrada en frances, salida en ingles.
- Procesamiento full-duplex: audio de entrada y salida simultaneos cada 80 ms.
- Streaming continuo: adecuado para interpretacion en directo sin esperar al final del turno.
- Ejecucion local via llama-server con el endpoint full-duplex.
- No soporta generacion de texto, codigo, matematicas, vision ni tool calling.
- No se documentan capacidades multilingues mas alla del par frances-ingles.
- No dispone de modo thinking, agentes ni razonamiento multi-paso.

## Casos de uso

- Interpretacion simultanea en reuniones: el modelo traduce en tiempo real el habla francesa a ingles con bloques de 80 ms, permitiendo a asistentes angloparlantes seguir una reunion con ponentes francoparlantes sin retardo perceptible.
- Subtitulado y doblaje en directo de eventos: integrado en un pipeline de streaming de audio, puede generar la pista de voz en ingles mientras se captura el audio original en frances, util para retransmisiones o conferencias.
- Atencion al cliente en centros bilingues: agentes que reciben llamadas en frances pueden usar el modelo para generar respuestas habladas en ingles de forma inmediata, reduciendo la dependencia de interpretes humanos.
- Traduccion de contenido audiovisual pregrabado: procesando la pista de audio francesa en bloques, se obtiene una version en ingles sincronizada, adecuada para podcasts o videos.
- Prototipado de asistentes de voz bilingues: desarrolladores que necesiten un modulo de traduccion de habla pueden desplegar el modelo con llama-server y conectarlo a su propio front-end de audio.
- Investigacion en traduccion de habla: el modelo sirve como referencia full-duplex para experimentos academicos sobre latencia y calidad en traduccion simultanea.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en formato GGUF, el audio no sale de la infraestructura propia, lo que encaja en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repo GGUF ocupa 8,2 GB, por lo que la cuantizacion mas grande ronda ese tamano y las variantes mas agresivas seran menores.
- GPU recomendadas: no especificadas en la informacion disponible. Por el tamano del modelo (2,17 B parametros), es plausible su ejecucion en GPUs consumer, pero no se confirma.
- Cabe en GPU consumer: no confirmado en la documentacion proporcionada.
- Opciones de despliegue: llama-server (endpoint full-duplex), con el comando `llama-server -hf ggml-org/hibiki-2b-GGUF -c 1500`. No es compatible con llama-tts ni con el endpoint `/tts`.
- Latencia: 80 ms por bloque de audio (dato de la model card).
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Hibiki 2B es un modelo especializado de traduccion de voz full-duplex, y no se han facilitado alternativas de la misma categoria con datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| hibiki-2b-GGUF | 2,17 B | 1500 tokens | CC-BY-4.0 | GGUF |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo traduce de frances a ingles; no cubre otras combinaciones de idiomas.
- Requiere el endpoint full-duplex de llama-server; no funciona con llama-tts ni con `/tts`.
- El contexto recomendado es de 1500 tokens, lo que limita la ventana de audio procesable de forma continua.
- No es un LLM de propósito general: no genera texto, codigo ni razona.
- Riesgo de errores de traduccion en audio con ruido, acentos marcados o solapamiento de hablantes, aunque no se documenta cuantitativamente.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es necesario cumplir las condiciones de la licencia.
- No se documentan sesgos especificos, pero al ser un modelo de traduccion de habla puede heredar sesgos de los datos de entrenamiento del modelo base.
- La conversion a GGUF es automatica, por lo que pueden existir diferencias de calidad frente al modelo original en bf16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ggml-org/hibiki-2b-GGUF
- Modelo base: https://huggingface.co/kyutai/hibiki-2b-pytorch-bf16
- Documentacion full-duplex de llama-server: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md#full-duplex
- Documentacion TTS de llama.cpp (seccion Hibiki): https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal/tts.md#hibiki
- Herramienta de conversion: https://github.com/ggml-org/convert
