# mchen04/lfm2.5-audio-1.5b-mlx-delegate

## Resumen

LFM2.5-Audio Delegate es un adaptador LoRA experimental publicado por Michael Chen (usuario `mchen04`) sobre el modelo de voz LiquidAI/LFM2.5-Audio-1.5B. Su proposito es ensenar al modelo de habla un unico comportamiento nuevo: ante una peticion hablada dificil, en lugar de responder por si mismo emite una llamada estructurada `delegate(query="…")` que un runtime externo redirige a un modelo mas capaz; la respuesta de ese modelo mas fuerte es vocalizada por el mismo modelo de voz mientras el texto aun se esta generando.

El adaptador se entrena sobre el nucleo de lenguaje LFM2 de 1,2 B del modelo base con LoRA de rango 16 y alpha 32 aplicado a 92 capas lineales, lo que supone solo 11,1 M de parametros entrenables. El codificador de audio, la cabeza de audio y la voz son los del modelo base; unicamente el nucleo compartido recibe el adaptador. El conjunto se ejecuta con MLX (`mlx-audio==0.5.7`) exclusivamente en Apple silicon y el autor lo midio en un Mac mini de 24 GB con chip M4.

Es relevante ahora porque explora una arquitectura de "delegacion" para asistentes de voz locales: mantener un modelo pequeno y rapido para peticiones sencillas y derivar las dificiles a un modelo mayor, con streaming de la respuesta desde el primer token. El autor lo describe explicitamente como una release de investigacion experimental y no como un asistente de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el nucleo de lenguaje LFM2 1,2 B del modelo base LiquidAI/LFM2.5-Audio-1.5B (codificador de audio y cabeza de audio del modelo base) |
| Parametros totales | Adaptador: 11,1 M (rango 16, alpha 32 sobre 92 capas lineales); el modelo base completo declara 1,5 B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles |
| Licencia | LFM Open License v1.0 (declarada como `other` en HuggingFace) |
| Formato de pesos | safetensors (`adapter/adapter.safetensors`, 44,5 MB, sha256 `97bc6ef4e7d7375e1c959179f820c84ce13ff7646ba571566d93c35d77d72d10`, checkpoint E1), MLX |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura LFM2 (nucleo de lenguaje de 1,2 B) con un codificador de audio y una cabeza de audio anadidos para tareas de voz a voz. Sobre ese nucleo, este release anade un adaptador LoRA de rango 16 y alpha 32 aplicado a las 92 capas lineales del nucleo, con 11,1 M de parametros entrenables. El adaptador se fusiona en el nucleo en el momento de la carga. Los datos del dataset de entrenamiento no se detallan en la informacion disponible; la model card unicamente referencia los datasets `openai/gsm8k` y `google-research-datasets/mbpp`, sin especificar el numero de tokens ni la composicion del corpus.

La innovacion tecnica central es la delegacion con streaming. Cuando el modelo decide derivar una peticion, emite una llamada de herramienta estructurada, `delegate(query="…")`, con el sistema declarando la herramienta en el prompt de sistema. Un runtime externo envia la consulta a un modelo mas potente y el mismo modelo de voz empieza a vocalizar la respuesta de ese modelo mientras el texto aun llega, sin esperar a que termine la generacion completa. El comportamiento se evaluo en modo half-duplex con altavoces abiertos y microfono real (`--half-duplex --guard-ms 1500 --min-voiced-ms 300`), con la escucha desactivada mientras el asistente habla, durante 1,5 s despues y hasta que la sala permanece en silencio 600 ms (como maximo 10 s). Se incluye una cancelacion por teclado (tecla `c` + Enter) que detiene la reproduccion y revierte el modelo al audio realmente reproducido.

## Capacidades

- Voz a voz: generacion de respuestas habladas en ingles sobre entrada de audio.
- Enrutado aprendido: decide entre responder localmente o emitir `delegate(query="…")` para peticiones dificiles.
- Streaming de la respuesta delegada: comienza a hablar antes de que el modelo fuerte termine de generar el texto.
- Streaming de respuestas locales: respuesta hablada generada por el propio modelo.
- Cancelacion tipada de la reproduccion, con retroceso al estado de audio efectivamente reproducido.
- Deteccion de turno en modo half-duplex con microfono real y altavoces abiertos.
- Soporte de tool calling estructurado (herramienta `delegate`).
- Capacidad de ejecucion local en Apple silicon mediante MLX.
- No soporta interrupcion por voz en full duplex a traves de altavoces abiertos.
- No soporta multiturno: el adaptador no aprendio a arrastrar turnos anteriores a las consultas de seguimiento.

## Casos de uso

- Asistente de voz local en Mac: el modelo atiende peticiones sencillas en el dispositivo y deriva las complejas a un modelo mayor en la nube, reduciendo coste de inferencia para el caso comun.
- Investigacion en enrutado de modelos: permite medir experimentalmente politicas de derivacion (delegacion frente a respuesta local) sobre peticiones habladas reales con una tasa de acierto cuantificada.
- Prototipado de asistentes con streaming: util para estudiar latencia percibida en respuestas largas, ya que el modelo empieza a hablar antes de que el modelo fuerte acabe de responder.
- Evaluacion de interfaces half-duplex: sirve como banco de pruebas para deteccion de turno con microfono real y altavoces abiertos en una maquina de 24 GB.
- Estudio de cancelacion de respuestas: el mecanismo de cancelacion tipada permite investigar el retroceso de estado y la coherencia tras interrupciones.
- Base para experimentos de LoRA sobre modelos de audio: el adaptador de 44,5 MB ilustra como anadir una politica de comportamiento concreta sin reentrenar el modelo base.
- Demostraciones academicas de delegacion a un modelo fuerte: el filtro de derivacion permite separar el comportamiento del modelo pequeno del del modelo mayor.

## Benchmarks y rendimiento

Datos publicados en la model card por el autor:

| Metrica | Resultado | Referencia |
|---|---|---|
| Exito de handoff (enrutado aprendido, peticiones habladas reservadas, n=812) | 0,938 [0,921, 0,954] | 0,537 sin entrenar |
| QA factual hablado (respuesta de referencia presente, n=200 preguntas de habla real) | 0,205 | 0,195 en la base sin entrenar |
| Inicio de respuesta local (Mac mini M4) | 0,67 s tras la decision de fin de turno (1,27 s tras el ultimo frame vocal del usuario) | no disponible |
| Inicio de respuesta local en sesiones con microfono real | 0,54 s – 0,60 s tras la decision de fin de turno | no disponible |
| Streaming de respuesta delegada (sesion de 64 turnos) | 7 de 7 respuestas empiezan a hablar antes de que el modelo fuerte termine, sin huecos | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible, pese a que la model card referencia los datasets `openai/gsm8k` y `google-research-datasets/mbpp`.

## Requisitos de hardware

- Entorno: exclusivamente Apple silicon (MLX). No hay soporte para GPU NVIDIA ni CPU generica en esta release.
- Hardware usado por el autor: un Mac mini de 24 GB con Apple M4.
- Memoria: la primera ejecucion descarga el modelo base (unos 3 GB); el adaptador ocupa 44,5 MB.
- Espacio en disco del repo: 0,2 GB.
- Software: Python 3.12, `mlx-audio==0.5.7`, release fijada por el tag `v0.9.1`.
- Despliegue: paquete `iss` instalable con `pip install -e .` (motor, runtime y evaluacion); `requirements.lock` fija el entorno de inferencia y `requirements-full.lock` anade las dependencias de construccion de datos, entrenamiento, evaluacion y el cancelador de eco experimental (Kokoro, Whistle, DNSMOS, livekit, entre otros).
- Latencia: inicio de respuesta local 0,67 s tras la decision de fin de turno en el Mac mini M4.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mchen04/lfm2.5-audio-1.5b-mlx-delegate (este) | 11,1 M de adaptador sobre nucleo LFM2 1,2 B | no disponible | Handoff 0,938; QA factual hablado 0,205 | LFM Open License v1.0 | HuggingFace, MLX, Apple silicon |
| LiquidAI/LFM2.5-Audio-1.5B (base) | 1,5 B | no disponible | QA factual hablado 0,195; handoff 0,537 (sin entrenar) | LFM Open License v1.0 | HuggingFace |
| Alternativas de voz a voz comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de otros modelos de voz a voz con delegacion y streaming que permitan una comparacion directa.

## Limitaciones y advertencias

- Release experimental: el propio autor lo describe como investigacion y no como asistente de produccion.
- QA factual hablado pobre: la respuesta de referencia aparece en 0,205 de las respuestas a 200 preguntas de habla real, practicamente igual que la base sin entrenar (0,195).
- No aprende multiturno: no arrastra informacion de turnos anteriores a las consultas de seguimiento.
- Comprension debil con audio de sala real: en una de las dos sesiones half-duplex respondio localmente a una peticion de planificacion en lugar de delegarla.
- No soporta interrupcion por voz en full duplex con altavoces abiertos; solo hay cancelacion tipada. Todos los experimentos de full duplex (cancelacion de eco, deteccion de voz aprendida, reloj y planificacion) fallaron sus criterios y quedan desactivados por defecto.
- No probado con un hablante humano en directo: las ejecuciones con microfono real usaron habla grabada reproducida desde un altavoz.
- Solo ingles.
- Licencia LFM Open License v1.0 heredada del modelo base: es necesario revisar el texto de la licencia antes de cualquier uso comercial.
- Limitado a Apple silicon; no hay binarios ni rutas de despliegue para CUDA.
- El modelo fue construido con Claude Code, segun declara el autor.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/mchen04/lfm2.5-audio-1.5b-mlx-delegate
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Licencia: https://huggingface.co/mchen04/lfm2.5-audio-1.5b-mlx-delegate/blob/main/LICENSE-LFM
- La busqueda web no devolvio enlaces relevantes al modelo; los resultados obtenidos trataban sobre el formato de archivo BNP y la prueba medica de peptido natriuretico, sin relacion con esta ficha.
