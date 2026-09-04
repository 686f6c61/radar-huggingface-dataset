# ampixa/sanoTTS

## Resumen

sanoTTS es una familia de modelos de texto a voz (TTS) neurales extremadamente compactos, desarrollada por Ampixa Labs. Su nombre proviene del nepalí "sāno" (सानो), que significa "pequeño", y refleja su propuesta: voces sintéticas de entre 294 279 y 2 272 145 parámetros que funcionan sin conexión en hardware muy limitado. El objetivo es ofrecer síntesis de voz en tiempo real en microcontroladores como el ESP32-S3 (de unos 3 dólares) o directamente en el navegador mediante WebAssembly, sin necesidad de GPU ni computación en la nube.

La familia incluye 11 voces distribuidas en 6 idiomas: inglés, nepalí, hindi, vietnamita, indonesio y chino. Cada voz ocupa entre 337 KB y 8,7 MB, e incorpora el phonemizer espeak-ng, sin dependencias externas. Existen dos linajes técnicos: "piperlite", destilado de un teacher Piper/VITS a 22,05 kHz, y "nano", que opera a 24 kHz con una ruta mel-100 → ConvNeXt1D → iSTFT, destilado de un teacher Kokoro mediante un Vocos congelado. El modelo se distribuye bajo licencia GPL-3.0 y su repositorio de Hugging Face (ampixa/sanoTTS) contiene los pesos en formato safetensors, además de paquetes Python y JavaScript.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal; dos linajes: piperlite (VITS/Piper, 22,05 kHz) y nano (mel-100 → ConvNeXt1D → iSTFT, 24 kHz) |
| Parametros totales | 294 279 (voz heart-nano; la familia va de 294 279 a 2 272 145) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, sin ventana de contexto en el sentido de LLM) |
| Tipos de cuantizacion | fp32 para WASM (voces web) y int8 para microcontrolador (version on-device de 567 k) |
| Idiomas soportados | Ingles, nepalí, hindi, vietnamita, indonesio, chino (6 idiomas, 11 voces) |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors; tambien formatos de exportacion para MCU (int8) y WASM (fp32) |

## Arquitectura y entrenamiento

sanoTTS no sigue una arquitectura unica, sino que agrupa dos linajes de destilacion distintos. El linaje "piperlite" se deriva de un teacher Piper/VITS a 22,05 kHz e incluye voces como amy (1,46 M), kristin (1,40 M), hfc (1,83 M) y amy-small (1,08 M). El linaje "nano" es mas reciente y opera a 24 kHz; utiliza una ruta mel-100 → ConvNeXt1D → iSTFT y se destila a partir de un teacher Kokoro a traves de un Vocos congelado. La version para microcontrolador (robot, 567 k) usa un decodificador iSTFT cuantizado en int8, mientras que las voces web utilizan un decodificador de dominio temporal compacto en fp32 via WASM.

La destilacion es la innovacion tecnica central: permite reducir drásticamente el numero de parametros manteniendo una naturalidad razonable. Los datos concretos del corpus de entrenamiento no estan publicados en la informacion disponible. Se sabe que cada voz se enpaqueta con el phonemizer espeak-ng incluido, eliminando dependencias externas en tiempo de ejecucion.

## Capacidades

- Sintesis de texto a voz en tiempo real, sin conexion a servidores ni aceleracion por hardware especializado.
- 11 voces en 6 idiomas: ingles (con multiples voces: heart, hfc, amy, kristin, amy-small, robot, heart-nano), nepalí, hindi, vietnamita, indonesio y chino.
- Ejecucion en microcontrolador ESP32-S3 a partir de una señal GPIO, con salida a amplificador LM386 y altavoz.
- Ejecucion en navegador mediante WebAssembly (fp32), sin subir texto a ningun servidor.
- Huella por voz de 337 KB a 8,7 MB, sin dependencias de modelo externas (incluye phonemizer).
- Dos linajes de calidad: piperlite (22,05 kHz) y nano (24 kHz), con distintas relaciones tamano/naturalidad.
- No soporta tool calling, agentes ni razonamiento, al ser exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Asistentes de voz en IoT de bajo coste: un ESP32-S3 puede anunciar avisos domoticos, alarmas o mensajes en varios idiomas sin conexion a internet, gracias a la version int8 de 567 k.
- Narracion en aplicaciones web: voces como heart o amy se cargan via WASM y permiten leer articulos, descripciones de producto o noticias en el propio navegador, sin backend de TTS.
- Accesibilidad en interfaces publicas: quioscos o puntos de informacion turistica pueden combinar las voces en inglés, hindi, nepalí o vietnamita para guiar a usuarios multilingues con hardware minimo.
- Educacion de idiomas: la variedad de voces y la capacidad de sintetizar offline permiten practicar pronunciacion en dispositivos educativos basicos, como tablets de bajo coste o reproductores dedicados.
- Prototipado rapido en Python: la libreria `sanotts` permite sintetizar texto con una sola llamada (`sanotts.synthesize("Hola", voice="heart")`), integrandola en scripts, chatbots de voz o pipelines de automatizacion.
- Juguetes o reproductores de audio con voz personalizada: el modelo se puede pre-cargar en un chip con menos de 9 MB de espacio, ideal para productos de consumo masivo sin conectividad.
- Traduccion oral de senales o etiquetas en comercio: con las voces en nepalí, hindi, vietnamita, indonesio y chino, se pueden generar audios de ubicacion en sistemas de guia fisica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque sanoTTS no es un modelo de lenguaje. Sin embargo, la model card proporciona puntuaciones SCOREQ (un predictor de naturalidad sin referencia, donde mas alto es mejor) para las voces en ingles, sobre un conjunto de evaluacion de 24 frases. La siguiente tabla recoge esos datos:

| Voz | Parametros | SCOREQ |
|---|---|---|
| heart | 2 272 145 | 3,48 |
| hfc | 1 830 000 | 3,94 |
| amy | 1 460 000 | 4,13 |
| kristin | 1 400 000 | 4,09 |
| amy-small | 1 080 000 | 3,70 |
| heart-nano | 294 279 | 2,29 |

El autor advierte explicitamente que el tamano no ordena la calidad: amy (1,46 M) puntua mas alto que heart (2,27 M) porque proceden de teachers y arquitecturas distintas. Las voces en nepalí, hindi, vietnamita, indonesio y chino no tienen puntuacion SCOREQ publicada.

## Requisitos de hardware

- VRAM: no se requiere GPU; el modelo se ejecuta en CPU, microcontrolador o navegador.
- GPU recomendada: ninguna. En sistemas de escritorio basta una CPU con memoria suficiente (menos de 100 MB por voz).
- Compatibilidad con hardware consumer: si; cabe en un ESP32-S3 de 3 dolares y en cualquier navegador moderno con soporte WASM.
- Opciones de despliegue: libreria Python `sanotts`, paquete JavaScript `sanotts-web`, ejecucion directa en ESP32-S3 con el modelo int8, o autoalojamiento de los archivos de voz.
- Latencia: el autor indica sintesis en tiempo real en ESP32-S3 y en el navegador, pero no proporciona cifras exactas de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos comparables de otros modelos que permitan una comparacion cuantitativa rigurosa. sanoTTS se posiciona como alternativa a Piper (teacher del linaje piperlite) y a Kokoro (teacher del linaje nano), ambos mencionados en su documentacion. Sin embargo, no hay datos publicos de parametros, idiomas o puntuaciones para esos modelos en las fuentes revisadas.

| Modelo | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| sanoTTS | 294 k a 2,27 M | 6 | GPL-3.0 | Hugging Face, GitHub, demo web |
| Piper | No disponible | No disponible | No disponible | No disponible |
| Kokoro | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier producto derivado que redistribuya los pesos debe usar GPL-3.0. Esto puede ser restrictivo para integraciones comerciales cerradas.
- Calidad de voz limitada: las puntuaciones SCOREQ oscilan entre 2,29 (heart-nano) y 4,13 (amy), lo que indica una naturalidad modesta en comparacion con TTS de gran tamano.
- Cobertura incompleta de paquetes: las voces en nepalí, hindi y chino no estan exportadas a este repositorio de Hugging Face; solo se pueden obtener via el demo web o el repositorio de GitHub.
- Datos de entrenamiento no publicados: no se detalla la composicion del corpus ni se ofrecen evaluaciones de sesgos, errores de pronunciacion o robustez ante texto complejo.
- Riesgo de errores de pronunciacion: al ser un modelo tan pequeño, nombres propios, acronimos o anglicismos pueden pronunciarse incorrectamente, especialmente en idiomas con menos voces como nepalí o vietnamita.
- Sin control de emociones, estilos, velocidad ni entonacion parametrizable: las voces son fijas en su caracter.

## Enlaces

- Hugging Face: https://huggingface.co/ampixa/sanoTTS
- GitHub: https://github.com/Ampixa/sanoTTS
- Demo en vivo: https://tts.ampixa.com/sanoTTS
