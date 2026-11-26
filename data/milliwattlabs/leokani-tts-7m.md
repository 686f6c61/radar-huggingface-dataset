# milliwattlabs/leokani-tts-7M

## Resumen

Leokani-tts 7M es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por Milliwatt Labs, un laboratorio centrado en modelos pequenos y eficientes que funcionan en CPU sin necesidad de GPU. Con tan solo 7.018.218 parametros, el modelo genera voz de calidad en dos voces de inglés americano: Dala (femenina) y Pono (masculina). Su nombre proviene del hawaiano: *leo* (voz) y *kani* (sonido).

El modelo resuelve el problema de la síntesis de voz en entornos con recursos limitados: ordenadores de consumo, Raspberry Pi, microcontroladores ESP32-S3 y ESP32-P4, e incluso navegadores web mediante JavaScript. Frente a los grandes modelos TTS que requieren GPU y centros de datos, Leokani-tts apuesta por una huella minima (repo de 0,2 GB) y despliegue ubicuo.

Es relevante ahora porque demuestra que es posible obtener voz inteligible y natural con menos de 10 millones de parametros, habilitando casos de uso como asistentes de voz locales, domotica (Home Assistant), accesibilidad y aplicaciones moviles sin dependencia de la nube. El modelo se distribuye en formatos PyTorch, ONNX y safetensors, con variantes cuantizadas a int4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS tipo Kokoro, segun tags) |
| Parametros totales | 7.018.218 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, int4 (ONNX) |
| Idiomas soportados | ingles (en), variante ingles americano |
| Licencia | milliwatt-labs-model-license (other) |
| Formato de pesos | safetensors, ONNX, PyTorch |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Los tags y la model card lo asocian a la familia Kokoro, lo que sugiere una arquitectura TTS ligera orientada a eficiencia en CPU. El modelo se distribuye con pesos en fp32 y fp16 (safetensors y ONNX), ademas de una variante int4 en ONNX para descargas mas rapidas.

En cuanto al entrenamiento, la model card indica que ambas voces (Dala y Pono) fueron entrenadas sobre voz sintetica generada con Kokoro-82M. No se especifica el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO, por lo que estos datos deben considerarse no disponibles. El repo incluye un modulo G2P (grapheme-to-phoneme) propio, Leokani G2P 1.2.0, que mejora la lectura de numeros, abreviaturas, letras y homografos.

## Capacidades

- Sintesis de voz en ingles americano con dos voces: Dala (femenina) y Pono (masculina).
- Generacion de audio a partir de texto con manejo mejorado de numeros, fechas, unidades y nombres propios gracias al modulo G2P.
- Ejecucion en CPU sin GPU, incluyendo dispositivos de bajos recursos (Raspberry Pi, ESP32-S3, ESP32-P4).
- Despliegue en navegador mediante JavaScript (el texto no sale del dispositivo).
- Soporte de ONNX Runtime y PyTorch en Python.
- Integracion con Home Assistant mediante add-on, servidor Wyoming y API de voz compatible con OpenAI.
- Herramienta de linea de comandos con servidor MCP para asistentes de IA.
- Aplicacion de escritorio para Mac y aplicacion para Android (puede actuar como voz del sistema).
- No dispone de tool calling, razonamiento multi-paso ni capacidades multimodales de entrada.

## Casos de uso

- Asistente de voz local en Home Assistant: el modelo se instala como add-on (amd64 y arm64) y proporciona respuestas habladas en domotica sin enviar datos a la nube, adecuado por su bajo consumo y ejecucion en CPU.
- Lectura por voz en navegador: mediante la libreria JavaScript, se puede integrar en aplicaciones web para leer contenido en voz alta manteniendo el texto en el dispositivo del usuario, util para privacidad y accesibilidad.
- Accesibilidad en dispositivos moviles: la aplicacion Android puede configurarse como voz del sistema, permitiendo a usuarios con discapacidad visual escuchar notificaciones y contenido con una voz natural y sin conexion.
- Sistemas embebidos e IoT: con la libreria Arduino para ESP32-S3 y ESP32-P4, se pueden anadir avisos hablados a dispositivos fisicos (electrodomesticos, sensores, wearables) con recursos de memoria minimos.
- Generacion de audiolibros o podcasts ligeros: el modelo puede sintetizar parrafos largos (como demuestra el sample de texto extenso) para producir contenido de audio en lotes sobre CPU.
- Prototipado rapido de interfaces conversacionales: gracias a la API compatible con OpenAI en Docker, los desarrolladores pueden sustituir servicios TTS en la nube por una alternativa local durante el desarrollo y las pruebas.
- Automatizacion de avisos y alertas: integracion en pipelines de monitorizacion para convertir mensajes de estado o alertas en audio, con latencia baja y sin coste por peticion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecutarse en CPU. Con 7 millones de parametros, el peso en fp32 es de aproximadamente 28 MB, en fp16 unos 14 MB y la variante int4 ONNX es aun menor (repo total de 0,2 GB).
- GPU recomendadas: no requiere GPU. Puede ejecutarse en cualquier CPU moderna; opcionalmente en GPU mediante PyTorch, aunque no es el objetivo del modelo.
- Cabe en cualquier GPU de consumo e incluso en microcontroladores (ESP32-S3 y ESP32-P4) y en Raspberry Pi.
- Opciones de despliegue: PyTorch, ONNX Runtime, libreria JavaScript (navegador y Node.js), aplicacion Mac, aplicacion Android, CLI para Linux y Raspberry Pi, add-on de Home Assistant, servidor Wyoming y API compatible con OpenAI en Docker, servidor MCP.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La model card menciona variantes menores (4.5M, 1M y 500K) para CPUs mas lentas y microcontroladores, lo que sugiere que el rendimiento escala con el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Ejecucion en CPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leokani-tts 7M | 7,0 M | en | Si (nativo) | milliwatt-labs-model-license | Hugging Face, ONNX, JS, apps |
| Kokoro-82M | 82 M | en (y otros) | Si | no disponible en esta ficha | Hugging Face |
| Leokani-tts 4.5M | 4,5 M | en | Si (CPUs lentas) | milliwatt-labs-model-license | Hugging Face |
| Leokani-tts 1M / 500K | 1,1 M / 0,52 M | en | Si (microcontroladores) | milliwatt-labs-model-license | Hugging Face |

Kokoro-82M es el referente directo, ya que las voces de Leokani se entrenaron sobre su salida; Leokani-tts 7M ofrece un tamano aproximadamente doce veces menor. Las variantes 4.5M, 1M y 500K del propio autor permiten ajustar el equilibrio entre calidad y recursos. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles americano; no hay soporte multilingue declarado.
- Las voces se entrenaron sobre voz sintetica de Kokoro-82M, lo que puede introducir artefactos o limitar la naturalidad frente a voces grabadas con hablantes reales.
- Al ser un modelo TTS, puede producir pronunciaciones incorrectas en palabras ambiguas, nombres poco comunes o terminologia tecnica, aunque el modulo G2P mitiga parte de estos casos.
- No se dispone de informacion sobre sesgos de generacion (por ejemplo, prosodia asociada a genero) ni sobre evaluaciones de calidad subjetiva (MOS).
- La licencia milliwatt-labs-model-license es de tipo "other"; es imprescindible revisar el texto completo antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion disponible.
- No apto para tareas de razonamiento, codigo, vision ni agentes; es exclusivamente un modelo de sintesis de voz.
- La longitud de contexto y los limites de texto de entrada no estan documentados; conviene validar el comportamiento con parrafos largos antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/milliwattlabs/leokani-tts-7M
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/milliwattlabs/leokani-tts-7M-demo
- Pagina del modelo en Milliwatt Labs: https://milliwattlabs.com/models/leokani-tts/
- Documentacion: https://milliwattlabs.com/docs/
- Licencia: https://huggingface.co/milliwattlabs/leokani-tts-7M/blob/main/LICENSE-MILLIWATT-LABS.md
- Variante 4.5M: https://huggingface.co/milliwattlabs/leokani-tts-4.5M
- Variante 1M: https://huggingface.co/milliwattlabs/leokani-tts-1M
- Variante 500K: https://huggingface.co/milliwattlabs/leokani-tts-500K
- Modelo G2P: https://huggingface.co/milliwattlabs/leokani-g2p
- Repositorio G2P en GitHub: https://github.com/Milliwatt-Labs/leokani-g2p
- Libreria Arduino: https://github.com/Milliwatt-Labs/leokani-arduino
- Add-ons de Home Assistant: https://github.com/Milliwatt-Labs/home-assistant-addons
- Kokoro-82M (modelo base de las voces): https://huggingface.co/hexgrad/Kokoro-82M
- ONNX int4: https://huggingface.co/milliwattlabs/leokani-tts-7M/blob/main/leokani-tts-int4.onnx
