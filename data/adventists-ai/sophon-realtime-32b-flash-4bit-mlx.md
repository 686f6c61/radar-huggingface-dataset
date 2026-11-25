# adventists-ai/Sophon-Realtime-32B-Flash-4bit-MLX

## Resumen

Sophon-Realtime-32B-Flash-4bit-MLX es la version cuantizada a 4 bits y empaquetada para MLX del modelo de voz full-duplex Sophon-Realtime-32B-Flash, desarrollado por adventists-ai. Se trata de un modelo audio-a-audio que escucha, decide por si mismo cuando el interlocutor ha terminado de hablar, responde con su propia voz y se detiene cuando se le interrumpe, todo ello ejecutandose localmente en la GPU unificada de un Mac con Apple Silicon. No hay paso intermedio de reconocimiento de voz ni dependencia de la nube.

El modelo es relevante porque traslada un paradigma de conversacion por voz en tiempo real (full-duplex, con turn-taking aprendido y cancelacion de eco integrada) al hardware de consumo de Apple, un entorno tradicionalmente limitado para modelos de este tamano. Con 32.000 millones de parametros en 4 bits, el repositorio ocupa unos 24,6 GB y requiere del orden de 26 GB de memoria unificada en uso, lo que lo situa en el rango de Mac Studio y MacBook Pro de gama alta.

La version MLX es un reempaquetado sin perdida de los pesos Flash-4bit originales: los valores de 4 bits, las escalas, la torre de audio y la etapa de voz son identicos bit a bit a la build CUDA. La licencia es Apache-2.0 tanto para el codigo como para los pesos, y los idiomas soportados son chino e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo full-duplex speech-to-speech con "thinker" multimodal, torre de audio y etapa de voz "talker") |
| Parametros totales | 32B (segun el nombre del modelo; no se detalla el desglose en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (pesos Flash-4bit reempaquetados para MLX) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 (codigo y pesos; ver NOTICE para las fuentes) |
| Formato de pesos | safetensors para MLX (carpetas `thinker_mlx/`, `ear/`, `talker/`, `voices/`) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un sistema full-duplex de voz a voz compuesto por varias etapas: un "thinker" multimodal de 32B en 4 bits ejecutable con `mlx_lm`, una torre de audio con su proyector (carpeta `ear/`) que procesa la entrada de microfono, y una etapa de voz (`talker/`) que genera la salida hablada con etiquetas de sonido propias. La escucha, la decision de turno y el habla se ejecutan integramente en la GPU del Mac, sin transcripcion intermedia.

El mecanismo de turn-taking es la innovacion tecnica mas destacada: para procesar el audio una sola vez, la pregunta de si el usuario ha terminado se formula dentro del propio contexto de la respuesta (system prompt, conversacion, audio del usuario y una pregunta corta "has the user finished? A / B"); si la respuesta es afirmativa, la generacion continua desde el mismo computo. Tras una interrupcion se emplea una pregunta de cuatro opciones que permite reanudar una respuesta cortada ante un back-channel breve ("mm-hmm", "yeah"). La cancelacion de eco usa WebRTC AEC3. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Conversacion por voz full-duplex en tiempo real: escucha continua, decision autonoma de fin de turno y respuesta hablada.
- Deteccion de interrupcion: el modelo deja de hablar en aproximadamente 0,15 s cuando el usuario lo interrumpe.
- Reanudacion tras back-channels: ante un "mm-hmm" o "yeah" retoma la respuesta que habia cortado.
- Cancelacion de eco integrada (WebRTC AEC3) para uso con altavoces sin auriculares.
- Generacion de voz con voces integradas y etiquetas de sonido propias del modelo.
- Capacidades multilingues limitadas a chino e ingles, seleccionables con `--lang en`.
- No incluye en la version Mac: entrada de camara, tool calling ni clonacion de voz zero-shot (solo voces integradas).

## Casos de uso

- Asistente de voz local y privado: conversacion manos libres en un Mac sin enviar audio a la nube, adecuado para entornos con requisitos de confidencialidad.
- Practica de conversacion en ingles o chino: el modelo mantiene turnos naturales, acepta interrupciones y permite corregir sobre la marcha, lo que lo hace util para entrenamiento linguistico.
- Prototipado de interfaces de voz en tiempo real: desarrolladores que quieran validar experiencias full-duplex (turn-taking, barge-in) antes de pasar a la build CUDA o a la API alojada.
- Demostraciones y pruebas de concepto en ferias o presentaciones: al ejecutarse en un portatil o Mac Studio sin GPU dedicada, permite mostrar un asistente de voz sin infraestructura adicional.
- Evaluacion de latencia y turn-taking: con respuestas de 0,9-1,1 s tras pausa clara y hasta 2,5 s cuando el modelo espera confirmacion, sirve para medir umbrales en aplicaciones interactivas.
- Atencion al cliente simulada en laboratorio: conversaciones multi-turno con interrupciones realistas para estudiar flujos de dialogo antes de desplegar en produccion.
- Investigacion sobre modelos full-duplex: base para experimentos de reanudacion tras interrupcion y deteccion de fin de turno con las metricas del conjunto Smart Turn.

## Benchmarks y rendimiento

Precision en la deteccion de fin de turno sobre el conjunto Smart Turn (400 clips por idioma):

| Metrica | Ingles (precision / AUC) | Chino (precision / AUC) |
|---|---|---|
| Pregunta de turno del servidor | 92,5 / 0,975 | 94,0 / 0,983 |
| Pregunta de turno en Mac | 90,5 / 0,960 | 94,3 / 0,977 |

Latencia y velocidad medidas en un M4 Max con 36 GB:

| Metrica | Valor |
|---|---|
| Fin de habla del usuario a inicio de respuesta | 0,9-1,1 s (hasta ~2,5 s si espera confirmacion) |
| Detencion tras interrupcion | ~0,15 s |
| Carga del modelo | ~10 s |
| Respuestas largas | tiempo real, sin cortes |
| Respuesta del servidor CUDA (referencia) | ~0,5 s |

No se han publicado resultados de benchmarks de razonamiento o generacion de texto (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Apple Silicon (M1 o posterior) con macOS 14 o superior.
- Memoria unificada: 36 GB o mas recomendados; 32 GB funciona con otras aplicaciones cerradas (unos 26 GB en uso durante la conversacion).
- Descarga de aproximadamente 24 GB (repositorio de 24,6 GB).
- Microfono obligatorio: Mac Studio y Mac mini no lo incluyen; se necesita USB o auriculares. Los altavoces son validos gracias a la cancelacion de eco integrada.
- GPU dedicadas tipo A100, H100 o RTX 4090: no aplicables a esta build MLX; para CUDA existe la variante Sophon-Realtime-32B-Flash-4bit.
- Despliegue: script `mac/install.sh` del repositorio oficial, que instala el entorno Python y los pesos en `~/sophon-mac`; el binario `sophon` admite `--lang`, `--no-aec`, `--in`, `--out` y `--voice`.
- Latencia: 0,9-1,1 s tras pausa clara; los chips con mas nucleos de GPU responden mas rapido. No se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-Flash-4bit-MLX | 32B (4 bits) | no disponible | audio-a-audio full-duplex | Apache-2.0 | MLX para Apple Silicon, 24,6 GB |
| Sophon-Realtime-32B-Flash-4bit | 32B (4 bits) | no disponible | audio-a-audio full-duplex | Apache-2.0 | Build CUDA |
| Sophon-Realtime-32B-Flash | 32B | no disponible | audio-a-audio full-duplex | Apache-2.0 | Modelo base sin cuantizar |

No se dispone en la informacion proporcionada de datos sobre modelos comparables de otros desarrolladores (parametros, contexto, rendimiento o licencia).

## Limitaciones y advertencias

- Solo probado en un M4 Max de 36 GB con audio simulado en tiempo real (voz reproducida a ritmo real y eco de sala simulado); las ejecuciones con microfono real y en otros Macs no estan verificadas.
- Una sola conversacion simultanea; no soporta multiples sesiones en paralelo.
- Sin entrada de camara, tool calling ni clonacion de voz zero-shot en la version Mac; solo voces integradas.
- Idiomas limitados a chino e ingles; no hay soporte declarado de castellano.
- Riesgo de alucinacion y de errores en la deteccion de turno: la precision en ingles en Mac baja al 90,5 % frente al 92,5 % del servidor.
- La latencia depende del numero de nucleos de GPU del chip; en modelos inferiores al M4 Max puede degradarse.
- Requiere microfono externo en Mac Studio y Mac mini.
- Licencia Apache-2.0 permite uso comercial, pero debe revisarse el archivo NOTICE para las fuentes de los pesos.
- No se dispone de informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-4bit-MLX
- Modelo base: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash
- Build CUDA 4 bits: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash-4bit
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/adventists-ai/Sophon-Realtime
- Repositorio de codigo: https://github.com/adventists-ai/sophon-realtime
- Codigo para Mac: https://github.com/adventists-ai/sophon-realtime/tree/main/mac
- Changelog: https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md
- Incidencias y reportes de pruebas: https://github.com/adventists-ai/sophon-realtime/issues/1
- API alojada (compatible con OpenAI Realtime): https://api.adventists.ai/console/
- Documentacion de la API: https://api.adventists.ai/console/docs
