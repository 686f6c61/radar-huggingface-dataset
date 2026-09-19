# KitsuMate/chatterbox-multilingual-v3-onnx

## Resumen

Chatterbox Multilingual V3 ONNX es una distribucion no oficial en formato ONNX del modelo de sintesis de voz Chatterbox Multilingual V3, desarrollado originalmente por Resemble AI. La publica el usuario KitsuMate y contiene unicamente los grafos exportados a FP32 junto con sus pesos como ficheros externos, de modo que el modelo puede ejecutarse con ONNX Runtime sin depender de PyTorch. Se trata, por tanto, de un artefacto de despliegue y no de un entrenamiento nuevo: el checkpoint de partida es `t3_mtl23ls_v3.safetensors` para el modelo de lenguaje de tokens acusticos y `s3gen.pt` para el decodificador, ambos fijados a la revision `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18` del repositorio `ResembleAI/chatterbox`.

El interes practico de esta version es la portabilidad. Frente al paquete PyTorch original, aqui se ofrecen dos topologias de grafo fijas: una de cuatro grafos (encoder de voz, embeddings de tokens, modelo de lenguaje y decodificador condicional) y otra de cinco grafos, mas agresivamente descompuesta, con encoder de voz simplificado, embeddings y modelo de lenguaje fusionados, preparacion de flujo, paso de flujo y vocoder independientes. Ambas incluyen entradas y salidas explicitas de cache KV para generacion autorregresiva residente en dispositivo, y estan pensadas para consumirse desde los paquetes de Unity de KitsuMate con backend de ONNX Runtime, tanto en CPU como en WebGPU.

El modelo cubre 23 idiomas, incluido el espanol, y admite clonacion de voz a partir de una referencia de audio que debe aportar el usuario. No se incluye ninguna voz de referencia ni la etapa de marca de agua PerTh del modelo original, una omision relevante desde el punto de vista etico y legal. El repositorio ocupa 6,6 GB, esta licenciado bajo MIT y, en el momento de redactar esta ficha, no registraba descargas ni valoraciones, por lo que carece de validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS en cascada exportado a ONNX. Grafos: encoder de voz, embeddings de tokens, modelo de lenguaje autorregresivo (linaje Llama 3, segun atribuciones del proyecto original), decodificador condicional con flow matching, vocoder derivado de HiFT-GAN y tokenizador de texto |
| Parametros totales | No disponible en la informacion proporcionada |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; es un modelo text-to-speech, no conversacional. En la practica el limite lo marca la longitud del texto y de la referencia de audio, no documentada |
| Tipos de cuantizacion | Solo FP32 en esta release. El autor declara haber descartado FP16 completo, INT4 del modelo de lenguaje, INT4 del flujo, INT8 dinamico e INT8 weight-only por calidad o velocidad insuficientes |
| Idiomas soportados | 23: arabe (ar), danes (da), aleman (de), griego (el), ingles (en), espanol (es), fines (fi), frances (fr), hebreo (he), hindi (hi), italiano (it), japones (ja), coreano (ko), malayo (ms), neerlandes (nl), noruego (no), polaco (pl), portugues (pt), ruso (ru), sueco (sv), suajili (sw), turco (tr) y chino (zh) |
| Licencia | MIT, con aviso de copyright de Resemble AI reproducido en el fichero `LICENSE` |
| Formato de pesos | ONNX con pesos en ficheros externos adyacentes (`.onnx.data`) y `manifest.json` con el mapeo exacto de roles y hashes SHA-256; se incluye `tokenizer.json` y `Cangjie5_TC.json` para la ruta del tokenizador chino |

## Arquitectura y entrenamiento

No hay entrenamiento propio en esta publicacion: es una conversion. El autor toma dos checkpoints del modelo Chatterbox Multilingual V3 de Resemble AI y los exporta a FP32 ONNX en dos disposiciones. La primera, de cuatro grafos, conserva la separacion clasica en `speech_encoder.onnx`, `embed_tokens.onnx`, `language_model.onnx` y `conditional_decoder_slim.onnx`. La segunda, denominada split, refina esa separacion en cinco grafos: `speech_encoder_slim.onnx`, `embedding_language_model_last.onnx`, `flow_prepare_slim.onnx`, `flow_step_slim.onnx` y `vocoder_slim.onnx`, lo que permite reutilizar los pasos de flujo y aislar el vocoder. El proyecto original reconoce como trabajo previo CosyVoice, HiFT-GAN y Llama 3, lo que situa la pila en un esquema de modelo de lenguaje sobre tokens acusticos mas decodificador generativo y vocoder neuronal.

La innovacion tecnica de esta exportacion esta en la ingenieria de despliegue, no en el modelo. Se anaden entradas y salidas explicitas de cache KV para que la generacion autorregresiva pueda residir en el dispositivo sin reenviar estado al host, se almacenan los tensores grandes como sidecars externos con un inventario SHA-256 completo y se publican contratos de model set para Unity. Los valores por defecto probados en la variante split son guia del modelo de lenguaje 0,5, seis pasos de flujo, guia del decodificador 0,7 y semilla 42. La release omite deliberadamente la etapa de marca de agua PerTh del modelo original. La validacion declarada es parcial: los nueve grafos ONNX parsean y los 2.478 rangos de pesos externos referenciados resuelven, pero el texto de la model card se corta al describir las pruebas del motor split en CPU dentro del editor de Unity, y el propio autor senala que el experimento compacto de las dos ultimas capas carece de validacion de memoria de extremo a extremo en dispositivo.

## Capacidades

- Sintesis de voz multilingue en 23 idiomas, con el espanol entre ellos, seleccionables mediante un identificador de idioma en la peticion (`TtsRequest.LanguageId`).
- Clonacion de voz few-shot: cada peticion requiere un `AudioClip` de referencia (`TtsRequest.VoiceReference`) del que se extrae el timbre, salvo que la aplicacion defina una voz por defecto autorizada localmente.
- Cambio de idioma conservando una referencia de voz, util para doblaje y localizacion.
- Generacion autorregresiva con cache KV explicita, apta para ejecucion residente en dispositivo.
- Inferencia en CPU y en WebGPU sobre los mismos ficheros de grafo split, sin descargas adicionales por backend.
- Integracion con pipelines de decodificacion por flow matching con numero de pasos configurable (seis pasos en la configuracion probada) y guias separadas para modelo de lenguaje y decodificador.
- Distribucion de grafos con inventario verificable (manifest y SHA-256), lo que permite validar integridad en instalaciones automatizadas.
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un sistema de texto a voz.
- No incluye vision, audio de entrada mas alla de la referencia de voz, ni marca de agua de audio.

## Casos de uso

- Doblaje y localizacion de contenido audiovisual: con una unica referencia de voz se pueden generar pistas en varios de los 23 idiomas soportados, manteniendo el timbre del locutor original y reduciendo el coste frente a contratar una voz por idioma.
- Videojuegos en Unity: los paquetes `ai.kitsumate.onnx.tts` permiten instalar el model set desde el Inspector, asignar el motor Chatterbox correspondiente y generar lineas de dialogo de personajes en tiempo de ejecucion, en CPU o WebGPU, sin salir del motor.
- Audiolibros y publicaciones accesibles: el modelo convierte texto largo en voz sintetica con la voz de referencia elegida, y el formato ONNX permite desplegarlo en servidores sin pila PyTorch.
- Asistentes de voz y sistemas IVR: respuestas habladas en el idioma del usuario final a partir de texto generado por otro componente, con una voz corporativa consistente y clonada de forma autorizada.
- Preservacion de voz con consentimiento: pacientes con perdida de habla o locutores que quieren escalar su produccion pueden clonar su propia voz a partir de una muestra y generar contenido nuevo sin grabar cada frase.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de documentos en cualquiera de los 23 idiomas, con despliegue local que evita enviar texto sensible a APIs externas.
- Prototipado rapido de interfaces de voz: al no requerir GPU dedicada (hay configuracion CPU y WebGPU), sirve para validar flujos de producto antes de invertir en infraestructura.
- Generacion de voces para prototipos de investigacion en TTS: la separacion en grafos y la cache KV explicita facilitan medir latencia por etapa y sustituir el vocoder o los pasos de flujo de forma aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, similitud de hablante ni latencia medida), y los resultados de la busqueda web realizada no guardan relacion con el modelo. La unica validacion mencionada es subjetiva (una salida escuchada y aprobada por el usuario) y no verificable de forma independiente.

## Requisitos de hardware

- El repositorio pesa 6,6 GB y contiene exclusivamente pesos FP32, por lo que la VRAM necesaria para mantener todos los grafos residentes en GPU se situa en el entorno de los 7-8 GB, estimacion derivada del tamano de los pesos mas el estado de activaciones y cache KV (no confirmada por el autor).
- Cabe en GPUs de consumo con 8 GB o mas, como RTX 3060 Ti, RTX 3070, RTX 4060 Ti o superiores; en tarjetas de 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) hay margen holgado.
- No requiere A100 ni H100: el modelo esta pensado para ejecucion local y el autor lo ha probado en el editor de Unity tanto en CPU como en el backend WebGPU.
- Ejecucion en CPU viable, con la penalizacion de latencia esperable en un modelo autorregresivo; el autor declara sintesis correcta en CPU dentro del editor, pero no publica cifras de latencia ni de throughput.
- Opciones de despliegue: ONNX Runtime como unico backend soportado, con configuraciones de ejecucion CPU y WebGPU; integracion mediante los tipos `ChatterboxModelSet` (cuatro grafos) y `ChatterboxSplitModelSet` (cinco grafos) del paquete Unity `ai.kitsumate.onnx.tts`. No se proporcionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Parametros de inferencia probados en la variante split: guia del modelo de lenguaje 0,5, seis pasos de flujo, guia del decodificador 0,7 y semilla 42. Latencia y throughput concretos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Chatterbox Multilingual V3 ONNX (este) | No disponible | 23 | MIT | ONNX FP32 con pesos externos | Conversion no oficial, sin marca de agua, sin voz de referencia incluida, sin validacion comunitaria |
| ResembleAI/chatterbox (original) | No disponible | 23 en la variante multilingue | MIT | PyTorch (safetensors + .pt) | Version de referencia, con implementacion nativa, guia de uso, notas de seguridad y etapa de marca de agua PerTh |
| Coqui XTTS v2 | No disponible | 17 (aproximado, no confirmado en la informacion disponible) | Coqui Public Model License (uso comercial restringido) | PyTorch | Clonacion de voz multilingue consolidada, pero con licencia menos permisiva que MIT |
| Kokoro | No disponible | Menos idiomas que Chatterbox (no confirmado) | Apache 2.0 | ONNX y PyTorch | Modelo mucho mas ligero, orientado a despliegue en hardware modesto, sin clonacion de voz por referencia |
| F5-TTS | No disponible | No disponible | No disponible | PyTorch | Alternativa de clonacion zero-shot; requeriria exportacion propia a ONNX |

Los datos numericos de parametros y benchmarks de los modelos comparados no estan disponibles en la informacion proporcionada, por lo que la comparacion es cualitativa.

## Limitaciones y advertencias

- No es una distribucion oficial de Resemble AI: los ficheros son exportaciones ONNX modificadas mantenidas por KitsuMate, sin soporte del autor original.
- La etapa de marca de agua PerTh se ha omitido deliberadamente, de modo que el audio generado no lleva marca de agua y no debe describirse como si la llevase. Esto agrava el riesgo de uso indebido para suplantacion de identidad o desinformacion.
- La clonacion de voz exige consentimiento explicito de la persona cuya voz se usa como referencia. El repositorio no incluye ninguna voz de referencia precisamente por este motivo.
- Solo se publican pesos FP32: el autor descarta FP16, INT4 e INT8 por perdida de calidad o velocidad. El despliegue en dispositivos con poca memoria no esta cubierto por esta release.
- Validacion incompleta: la model card se corta al describir las pruebas del motor split en CPU dentro del editor de Unity, y el propio autor reconoce que un experimento compacto previo carece de validacion de memoria de extremo a extremo en dispositivo.
- Cero descargas y cero valoraciones en el momento de la consulta: no existe evidencia comunitaria de funcionamiento en produccion.
- Se declaran 23 idiomas, pero no se aportan metricas de calidad por idioma; el rendimiento en lenguas con menos recursos del conjunto (por ejemplo suajili, malayo o hebreo) es desconocido.
- Riesgo de alucinacion acustica inherente a los modelos TTS: pronunciacion incorrecta, prosodia inadecuada o artefactos en textos largos, numeros, siglas y nombres propios.
- Sesgos potenciales: la voz sintetizada hereda las caracteristicas del audio de referencia y del dataset de entrenamiento original, no documentado en esta publicacion.
- Para el tokenizador chino se incluye `Cangjie5_TC.json`, un detalle especifico que conviene verificar si se integra un tokenizador propio.
- La licencia MIT del modelo original se reproduce en el repositorio, pero el uso comercial de voces clonadas sigue sujeto a la legislacion aplicable sobre derechos de imagen y voz, con independencia de la licencia del software.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KitsuMate/chatterbox-multilingual-v3-onnx
- Modelo original (Resemble AI): https://huggingface.co/ResembleAI/chatterbox
- Sitio de Resemble AI: https://www.resemble.ai/
- Revision del checkpoint V3 usada en la exportacion: `5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18` (repositorio `ResembleAI/chatterbox`)
- Revision del snapshot del Space V3: `b21d9d062b4eda102f21975333276919935d2060`
- Revision del exportador: `b8b5f7f75436de240639e777dce2b7e26a305681`
- Trabajos previos citados por el proyecto original, sin enlace disponible en la informacion proporcionada: CosyVoice, HiFT-GAN y Llama 3
- Paquete de integracion para Unity `ai.kitsumate.onnx.tts` y sus repositorios de soporte: no disponible (el autor indica que se mantienen por separado de este repositorio de modelo)
