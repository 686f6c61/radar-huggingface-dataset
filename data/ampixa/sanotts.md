# ampixa/sanoTTS

## Resumen

sanoTTS es una familia de voces neuronales de síntesis de voz (text-to-speech) de tamano extremadamente reducido, desarrollada por ampixa. Cada voz individual contiene entre 263.103 y 2.272.145 parámetros, lo que permite su ejecución en tiempo real sobre hardware sin acelerador dedicado: desde un microcontrolador ESP32-S3 de aproximadamente 3 dólares hasta un navegador web mediante WebAssembly, sin servidor ni subida de datos. El modelo se distribuye en este repositorio con pesos en formato GGUF y empaquetados específicos para microcontrolador y para web.

El problema que resuelve es la dependencia de infraestructura cloud o de NPU para TTS neuronal. sanoTTS incluye su propio fonemizador (basado en espeak-ng) y no tiene dependencias externas, con una huella por voz que va de 337 KB a 8,7 MB. El repositorio aloja 31 voces en 17 idiomas (inglés, nepalí, hindi, vietnamita, indonesio, chino, alemán, francés, español, italiano, portugués, ruso, checo, rumano, turco, árabe y polaco), aunque el polaco es solo de demostración y sus pesos no están alojados aquí.

La relevancia actual reside en el despliegue edge: TTS de calidad aceptable en dispositivos con recursos de cómputo y memoria mínimos, con licencia GPL-3.0 y una API sencilla tanto en Python (`sanotts`) como en JavaScript (`sanotts-web`). El modelo se presenta como listo para publicación y acumula más de 577.000 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de síntesis de voz (detalles de arquitectura no disponibles en la información proporcionada) |
| Parametros totales | 294.279 (dato del repositorio safetensors); el rango por voz va de 263.103 a 2.272.145 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (formato MCU para microcontrolador); otros formatos no disponibles |
| Idiomas soportados | en, ne, hi, vi, id, zh, de, fr, es, it, pt, ru, cs, ro, tr, ar, pl (17 idiomas; polaco solo en demo) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF, safetensors y empaquetados para MCU y web (WASM) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de la red (tipo de encoder/decoder, mecanismo de atención o generador vocacional). Se sabe que se trata de una familia de voces neuronales destiladas, según la etiqueta `distillation` del repositorio, con variantes de distinto tamano para un mismo idioma (por ejemplo, en inglés: heart de 2,27 M, hfc de 1,83 M, amy de 1,46 M, kristin de 1,40 M, amy-small de 1,08 M, robot de 567 K y heart-nano de 263 K en modo streaming). La variante heart-nano está orientada a streaming y la variante robot a ejecución on-device en int8 sobre microcontrolador.

El modelo integra un fonemizador basado en espeak-ng empaquetado con los pesos, de modo que no requiere dependencias externas en tiempo de inferencia. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona métricas SCOREQ por voz (por ejemplo, 4,13 para amy y 3,48 para heart), lo que sugiere una evaluación de calidad perceptual, pero no se detalla la metodología.

## Capacidades

- Síntesis de voz (text-to-speech) en 17 idiomas, con 31 voces en la demostración en vivo.
- Ejecución en tiempo real sobre microcontrolador ESP32-S3, con salida por GPIO hacia un amplificador LM386 y altavoz.
- Ejecución en navegador mediante WebAssembly, sin servidor ni subida de texto.
- Modo streaming en la variante heart-nano (263 K parámetros).
- Fonemización integrada mediante espeak-ng, sin dependencias externas.
- API en Python (`sanotts`) y JavaScript (`sanotts-web`), con selección de voz por identificador.
- Fallback automático de descarga de pesos entre Hugging Face, GitHub Releases y Pages.
- Soporte de despliegue autoalojado con `voiceBase` para desactivar el fallback.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Síntesis de voz en dispositivos IoT y domótica: una voz de menos de 1 MB puede ejecutarse en un ESP32-S3 para anuncios locales (temperatura, alarmas, estados) sin conexión a internet ni servicio cloud.
- Lectura por voz en navegador para accesibilidad: integración vía `sanotts-web` con WebAssembly permite leer contenido de una página sin enviar texto a servidores externos, útil en aplicaciones con requisitos de privacidad.
- Asistentes de voz embebidos en hardware de bajo coste: el modelo cabe en microcontroladores con memoria limitada, lo que habilita productos de consumo con TTS local y latencia predecible.
- Kioscos y terminales interactivos sin red: el despliegue con pesos empaquetados y fallback configurable permite operar en entornos aislados o con conectividad intermitente.
- Prototipado rápido multilingüe: la API de Python con selección de voz por idioma permite generar muestras en 17 idiomas para pruebas de localización de productos.
- Aplicaciones educativas y de aprendizaje de idiomas: voces en nepalí, hindi, vietnamita, indonesio, chino y lenguas europeas permiten practicar pronunciación con síntesis local.
- Generación de avisos pregrabados en sistemas embebidos: la variante int8 para MCU permite almacenar varias voces en memoria flash y sintetizar mensajes bajo demanda.

## Benchmarks y rendimiento

La información proporcionada incluye únicamente puntuaciones SCOREQ por voz, sin contexto metodológico ni comparación con otros modelos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Voz | Idioma | Parametros | SCOREQ |
|---|---|---:|---:|
| amy | Inglés | 1,46 M | 4,13 |
| kristin | Inglés | 1,40 M | 4,09 |
| hfc | Inglés | 1,83 M | 3,94 |
| amy-small | Inglés | 1,08 M | 3,70 |
| heart | Inglés | 2,27 M | 3,48 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en la mayoría de variantes; las voces de 1,4-2,3 M parámetros ocupan entre 337 KB y 8,7 MB de huella por voz, por lo que caben en memoria de sistema o flash.
- GPU recomendadas: no se requiere GPU; el modelo está diseñado para CPU, microcontrolador y navegador.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer, aunque su uso típico es CPU o MCU.
- Despliegue: paquete Python `sanotts` (>= 0.3.0), paquete JavaScript `sanotts-web` (>= 0.3.0), binarios para ESP32-S3 y bundles WASM para navegador. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: se declara ejecución en tiempo real sobre ESP32-S3, pero no se proporcionan cifras concretas de latencia ni de factor de tiempo real.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se comparan características estructurales con alternativas de TTS ligero ampliamente conocidas, indicando cuando un dato no está confirmado en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Despliegue edge |
|---|---|---|---|---|
| sanoTTS | 263 K – 2,27 M por voz | No disponible | GPL-3.0 | ESP32-S3, WASM, Python |
| Piper | No disponible en la información | No disponible | No disponible | CPU, Raspberry Pi |
| eSpeak NG | Basado en reglas (no neuronal) | No aplica | GPL-3.0 | CPU, MCU |
| Coqui TTS (variantes ligeras) | No disponible en la información | No disponible | No disponible | CPU |

La comparación cuantitativa de calidad, latencia y consumo no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia GPL-3.0 impone obligaciones de copyleft: el uso comercial en productos propietarios requiere revisión legal y, en general, liberar el código derivado bajo la misma licencia.
- El polaco es solo de demostración y sus pesos no están alojados en este repositorio.
- El repositorio conserva una voz china antigua por compatibilidad; la demostración en vivo usa el reemplazo Chinese Xiaoya.
- La información sobre sesgos, riesgo de alucinación y calidad por idioma no está disponible; las métricas SCOREQ solo cubren algunas voces en inglés.
- No se documentan límites de longitud de texto de entrada ni de contexto.
- El fallback de descarga de pesos contacta Hugging Face, GitHub Releases o Pages por defecto; en despliegues autoalojados debe configurarse `voiceBase` para evitar conexiones no deseadas.
- No se dispone de datos sobre robustez ante texto con ruido, abreviaturas o dominios especializados.
- La arquitectura y el proceso de entrenamiento no están documentados, lo que dificulta evaluar riesgos de generalización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/sanoTTS
- Demostración en vivo: https://tts.ampixa.com/sanoTTS
- Repositorio GitHub: https://github.com/Ampixa/sanoTTS
- Bundles de voces para navegador: https://huggingface.co/ampixa/sanoTTS/tree/main/web/voices
- Voz Chinese Xiaoya: https://huggingface.co/ampixa/sanoTTS/tree/main/web/voices/chinese-xiaoya
- Paquete Python `sanotts`: no disponible enlace directo en la información proporcionada
- Paquete JavaScript `sanotts-web`: no disponible enlace directo en la información proporcionada
