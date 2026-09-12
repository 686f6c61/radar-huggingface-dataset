# fluxions/vui

## Resumen

Vui Nano es un modelo de sintesis de voz (text-to-speech) publicado por fluxions.ai bajo el identificador `fluxions/vui` en HuggingFace. Se trata de un modelo pequeno y orientado a la conversacion: 219M parametros activos sobre 305M totales, licencia Apache 2.0 y entrenamiento exclusivamente en ingles. Su rasgo diferencial es que no sintetiza un enunciado aislado, sino que genera cada respuesta dentro del contexto del dialogo completo, incluyendo el audio real del turno del interlocutor, todo ello almacenado en la cache KV de la que decodifica a lo largo de una ventana de aproximadamente 6 minutos de conversacion.

La arquitectura combina un decodificador de estilo Llama con una cabeza RQ-Transformer sobre el codec Qwen3-TTS-12Hz. El modelo fue entrenado sobre dialogos de dos hablantes con un token explicito de cambio de turno, lo que le permite mantener la prosodia entre turnos y producir fenomenos propios del habla espontanea (respiraciones, risas, vacilaciones y solapamientos) que los corpus de lectura en voz alta no contienen. Incorpora clonacion de voz, generacion en streaming y condicionamiento sobre seis canales de calidad de voz (SQ) y palabras por segundo (WPS).

Su relevancia practica esta en el despliegue: el autor distribuye un motor en C puro, un unico binario junto a un unico fichero de pesos, que ejecuta la inferencia en CPU sin Python, PyTorch ni ONNX en tiempo de ejecucion. En GPU alcanza aproximadamente 9x tiempo real en una RTX 4090 con inferencia en bf16 y CUDA graphs. El modelo se integra en Vui, un asistente de voz en tiempo real que encadena ASR, un LLM local y TTS en streaming, con soporte de barge-in, API compatible con OpenAI Realtime y Docker Compose. El checkpoint se distribuye como parte de un repositorio de 5,0 GB que incluye tambien el codec de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estilo Llama con cabeza RQ-Transformer sobre el codec Qwen3-TTS-12Hz |
| Parametros totales | 305M |
| Parametros activos | 219M (segun el autor; no se explicita si la diferencia respecto al total corresponde a una arquitectura dispersa tipo MoE) |
| Longitud de contexto | Aproximadamente 6 minutos de conversacion en la cache KV (el autor no indica el equivalente en tokens) |
| Tipos de cuantizacion | No disponible; el autor documenta inferencia en bf16 y un fichero de pesos para el motor en C sin especificar cuantizacion |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible; el repositorio contiene el checkpoint y el codec de Qwen, y el motor en C usa un unico binario mas un unico fichero de pesos |
| Tamano del repositorio | 5,0 GB |
| Pipeline declarado | text-to-speech |
| Libreria | vui |
| Fecha de creacion | 2025-06-05 |
| Ultima actualizacion | 2026-09-11 |
| Descargas / likes | 443 descargas / 154 likes |

## Arquitectura y entrenamiento

El modelo es un decodificador autorregresivo de estilo Llama con una cabeza RQ-Transformer que predice los tokens del codec Qwen3-TTS-12Hz, es decir, opera en el dominio de tokens de audio de un codec neuronal a 12 Hz. La innovacion principal no esta en el bloque del transformer, sino en la condicion de decodificacion: la cache KV contiene el dialogo completo hasta ese momento, incluido el audio del turno del usuario, de modo que la generacion de cada respuesta se condiciona sobre la acustica previa y no solo sobre el texto. El entrenamiento se realizo sobre dialogos de dos hablantes con un token explicito de cambio de orador, lo que habilita el arrastre de prosodia entre turnos y la produccion de respiraciones, risas, vacilaciones y solapamientos. Adicionalmente, el modelo admite condicionamiento sobre seis canales de calidad de voz (SQ) y sobre palabras por segundo (WPS).

El autor no publica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion no esta disponible. Si se documenta el procedimiento de inferencia optimizado: bf16 con CUDA graphs para el modo streaming, un motor de inferencia escrito en C sin dependencias de Python, PyTorch u ONNX, y un backend MLX para Apple Silicon en estado de trabajo en curso (WIP). La clonacion de voz se realiza subiendo una muestra de audio, y el autor distribuye cuatro presets ajustados (`maeve`, `abraham`, `rhian`, `harry`).

## Capacidades

- Sintesis de voz texto-a-audio en ingles con generacion en streaming.
- Generacion condicionada por conversacion: la respuesta se decodifica a partir de una cache KV que contiene el dialogo completo, incluido el audio del turno del usuario, con una ventana de unos 6 minutos.
- Transferencia de prosodia entre turnos y produccion de respiraciones, risas, vacilaciones y solapamientos gracias al token de cambio de hablante.
- Clonacion de voz a partir de una muestra de audio subida por el usuario, mas cuatro voces preajustadas.
- Condicionamiento fino sobre seis canales de calidad de voz (SQ) y sobre la velocidad de habla en palabras por segundo (WPS).
- Inferencia en CPU con un motor en C sin Python, PyTorch ni ONNX, y soporte de reproduccion en streaming.
- Inferencia en GPU en bf16 con CUDA graphs, con un rendimiento aproximado de 9x tiempo real en una RTX 4090.
- Capacidades de asistente delegadas en la pila Vui, no en el modelo de voz: bucle ASR a LLM a TTS, barge-in, VAD para turnos, prefill especulativo del LLM, troceado de TTS por frases con control de contrapresion, memoria entre sesiones, enrutado de intencion de voz a unas 10 herramientas y cliente compatible con la API Realtime de OpenAI.
- No se documenta soporte de tool calling, razonamiento multi-paso ni vision en el propio modelo de voz; esas funciones corresponden a los backends LLM conectables (Ollama, vLLM o cualquier endpoint compatible con OpenAI).

## Casos de uso

- Asistente de voz local en tiempo real: el modelo cierra el bucle ASR a LLM a TTS en un unico servidor Python con WebRTC y WebSocket; al mantener el audio previo en la cache KV, las respuestas suenan coherentes con el tono del usuario a lo largo de varios minutos de conversacion.
- Atencion al cliente automatizada en ingles: con 219M parametros activos y ejecucion en CPU, permite desplegar sintesis de voz en el mismo nodo que el backend LLM, con barge-in para que el usuario interrumpa sin esperar a que termine la locucion.
- Despliegue en dispositivos sin GPU: el motor en C, sin Python, PyTorch ni ONNX, permite integrar TTS en kioscos, robots o hardware embebido con CPU, reduciendo el tamano del runtime al binario mas el fichero de pesos.
- Generacion de notas de voz por API: el endpoint REST `POST /v1/voice-note` ejecuta el pipeline completo en una sola llamada HTTP (audio de entrada, JSON de salida), lo que facilita su integracion en flujos backend como respuesta a mensajes en aplicaciones de mensajeria.
- Clonacion de voz para produccion de contenido en ingles: a partir de una muestra de audio se puede fijar una voz consistente para locuciones, audiolibros o piezas de marketing, controlando la velocidad de habla mediante el condicionamiento WPS.
- Investigacion en TTS conversacional: el condicionamiento sobre los seis canales SQ y sobre WPS, junto con la produccion de risas y vacilaciones, permite estudiar prosodia y naturalidad del habla espontanea frente a corpus de lectura.
- Accesibilidad y lectura en voz alta de respuestas de un LLM: al ejecutarse en streaming con baja latencia relativa, sirve para verbalizar las respuestas de un asistente a usuarios con discapacidad visual sin depender de servicios en la nube.
- Sustitucion de frontales de voz propietarios en clientes ya escritos contra la API Realtime de OpenAI: el endpoint `ws://…/v1/realtime` es compatible a nivel de protocolo, de modo que un cliente existente puede apuntar a Vui sin reescribir su logica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MOS, similitud de hablante, WER ni comparaciones numericas con otros modelos. El unico dato de rendimiento aportado es de latencia de inferencia: aproximadamente 9x tiempo real en streaming sobre una RTX 4090 con bf16 y CUDA graphs. Para CPU no se indica throughput ni latencia.

## Requisitos de hardware

- Peso de los parametros: 305M parametros suponen aproximadamente 610 MB en bf16 y en torno a 1,2 GB en fp32 (estimacion aritmetica a partir del numero de parametros; el autor no publica cifras de VRAM).
- Memoria adicional: hay que sumar la cache KV del dialogo (ventana de aproximadamente 6 minutos de audio) y el codec Qwen3-TTS-12Hz; el autor no desglosa este consumo.
- GPU: se cita explicitamente una RTX 4090 para el modo streaming en bf16 con CUDA graphs a ~9x tiempo real. No se especifican A100, H100 ni otros modelos.
- GPU de consumo: si, cabe en GPU de consumo; la unica referencia publicada es la RTX 4090.
- CPU: el modelo esta disenado para ejecutarse en CPU con el motor en C sin dependencias; no se publican requisitos minimos de nucleos, memoria ni latencia resultante.
- Apple Silicon: existe un backend MLX en desarrollo (WIP) segun el autor.
- Opciones de despliegue: motor en C (un binario mas un fichero de pesos), `demo.py` con interfaz Gradio y modo CLI (`--render`), Docker Compose para la pila completa, servidor Python unico con WebRTC y WebSocket, endpoint REST `POST /v1/voice-note` y endpoint compatible con OpenAI Realtime en `ws://…/v1/realtime`. Para el LLM asociado se admiten Ollama, vLLM o cualquier endpoint compatible con OpenAI; `vLLM` se usa del lado del LLM, no para la inferencia del modelo de voz. Tambien hay rutas documentadas con cloudflared y Tailscale para acceso desde movil.
- ASR conectable: faster-whisper (GPU) o Moonshine (CPU en streaming, via ONNX).
- Latencia y throughput: ~9x tiempo real en RTX 4090; para CPU, no disponible.

## Comparativa con modelos similares

- El autor afirma que los pocos modelos abiertos que condicionan la generacion sobre la acustica del dialogo son un orden de magnitud mas grandes y estan limitados a GPU, pero no nombra ninguno en la informacion proporcionada.
- No se incluye ninguna tabla comparativa de parametros, contexto, rendimiento o licencia frente a alternativas concretas.
- Datos comparativos con modelos alternativos: no disponible.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Como modelo generativo de audio, puede producir artefactos, prosodia incorrecta o contenido vocal no deseado; el autor no publica tasas de error ni evaluaciones de robustez.
- La ventana de contexto es de aproximadamente 6 minutos de conversacion; no se documenta el comportamiento al superarla (truncado, degradacion o reinicio de la cache).
- Riesgo legal y etico en la clonacion de voz: se debe contar con consentimiento explicito de la persona clonada y cumplir la normativa aplicable de derechos de imagen y de voz, asi como la legislacion sobre deepfakes.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero no exime del cumplimiento de la normativa sobre sintesis de voz.
- La calidad percibida depende de la voz elegida: el propio autor advierte que el preset por defecto, `maeve`, tiene acento irlandes femenino y puede resultar dificil de entender para oyentes no britanicos.
- El rendimiento en CPU se declara como funcional, pero no se publican latencias, de modo que la viabilidad en hardware muy limitado debe medirse en el caso concreto.
- El backend MLX para Apple Silicon esta marcado como trabajo en curso (WIP) y puede no ser estable.
- La model card disponible esta truncada en la tabla de voces preajustadas (se corta a mitad de la descripcion de `rhian`), por lo que parte de la informacion sobre presets puede faltar.
- El modelo no realiza razonamiento, tool calling ni gestion de agentes por si mismo: esas capacidades dependen del LLM y del resto de la pila Vui, lo que anade superficies de fallo (ASR, LLM, red, VAD) al sistema completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fluxions/vui
- Repositorio en GitHub (codigo, instalacion, documentacion y asistente de voz en streaming): https://github.com/fluxions-ai/vui
- Documentacion de compatibilidad con la API Realtime: https://github.com/fluxions-ai/vui/blob/main/docs/realtime-api.md
- Sitio del desarrollador: https://fluxions.ai
- Entrada de blog de lanzamiento (notas de diseno y demos): https://fluxions.ai/blog/vui-launch
- Discord: https://discord.fluxions.ai
- Instalador de un solo comando: https://install.fluxions.ai
- Logo del proyecto: https://raw.githubusercontent.com/fluxions-ai/vui/main/docs/fxlogo.png
