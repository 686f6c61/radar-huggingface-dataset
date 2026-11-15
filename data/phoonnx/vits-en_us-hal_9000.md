# Phoonnx/vits-en_us-hal_9000

## Resumen

vits-en_us-hal_9000 es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su libreria ONNX de TTS. El modelo original procede de campwill/HAL-9000-Piper-TTS, un checkpoint creado por el autor campwill para el ecosistema Piper, y esta adaptado para ejecutarse mediante la libreria phoonnx en Python y en el asistente OVOS.

El modelo sintetiza voz en ingles estadounidense (en-US) a partir de fonemas espeak en alfabeto IPA, lo que lo hace dependiente de un fonemizador externo (espeak-ng o el port espyak). Su interes practico radica en que es un modelo compacto (repositorio de 0,1 GB) con licencia Apache 2.0, orientado a despliegues ligeros de sintesis de voz en local, sin depender de servicios en la nube.

Se trata de un modelo de un solo hablante (voz "HAL 9000", presumiblemente una voz sintetica caracteristica) sin capacidades de clonacion ni control de estilo. No se dispone de informacion sobre el numero de parametros, la longitud de contexto ni los datos de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con VAE, normalizing flows y decoder HiFi-GAN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa por frase) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el formato ONNX admite cuantizacion int8, pero no se documenta) |
| Idiomas soportados | ingles estadounidense (en-US) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador), OVOS |
| Tamano del repositorio | 0,1 GB |
| Autor upstream | campwill |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura que combina un encoder de texto, un prior condicional, normalizing flows, un decoder basado en HiFi-GAN y un discriminador adversarial multiperiodo. El modelo genera audio de forma end-to-end a partir de fonemas, sin necesidad de un vocoder separado.

En este caso, el checkpoint original fue entrenado por campwill para el ecosistema Piper (campwill/HAL-9000-Piper-TTS) y posteriormente empaquetado por Phoonnx para su libreria ONNX. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales mas alla de la propia arquitectura VITS. La entrada de texto se procesa mediante el fonemizador `EspeakPhonemizer` de la libreria scriptconv, que normaliza el texto y lo convierte a fonemas IPA.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles estadounidense a partir de texto escrito.
- Generacion de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Entrada basada en fonemas espeak (IPA); requiere espeak-ng instalado o el port espyak.
- Integracion con el asistente OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js (con entrada espeak o unicode).
- Voz unica de un solo hablante (no soporta clonacion ni seleccion de hablante).
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- Capacidad multilingue limitada al ingles estadounidense.

## Casos de uso

- Asistente de voz local en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar de voz a un asistente domestico sin conexion a la nube, gracias a su tamano reducido (0,1 GB) y a la licencia Apache 2.0.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ser un modelo ONNX ligero, puede sintetizar mensajes cortos en tiempo real en segundo plano con un consumo de recursos minimo.
- Prototipado rapido de interfaces de voz: desarrolladores que necesitan una voz en ingles para demos o pruebas de concepto pueden cargar el modelo con `TTSModelManager` y generar audio en pocas lineas de codigo.
- Accesibilidad web: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para leer contenido de paginas web a usuarios con discapacidad visual, sin enviar texto a servidores externos.
- Generacion de avisos pregrabados en sistemas embebidos o de bajo consumo: el formato ONNX y el tamano compacto permiten desplegarlo en dispositivos con recursos limitados para anuncios automatizados.
- Pruebas de integracion continua (CI) de pipelines de audio: al ser determinista y ligero, puede usarse para generar audios de referencia en tests automatizados de sistemas de reconocimiento de voz o de procesamiento de audio.
- Educacion y aprendizaje de idiomas: sintesis de frases en ingles estadounidense para ejercicios de escucha, siempre que se acepte la calidad de una voz unica y sintetica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio (0,1 GB), la huella en memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 4090, RTX 3060, GTX 1650, etc.); tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS mediante `ovos-tts-plugin-phoonnx`, y ONNX Runtime de forma directa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Dependencia adicional: espeak-ng (o el port espyak mediante `phoonnx[espeak]`) para la fonemizacion del texto.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-en_us-hal_9000 | VITS | en-US | Apache 2.0 | ONNX | Voz unica, empaquetado para phoonnx |
| campwill/HAL-9000-Piper-TTS | VITS | en-US | Apache 2.0 | Piper | Modelo upstream del que deriva |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | segun modelo | ONNX | Misma libreria de inferencia |
| Piper TTS (modelos comunitarios) | VITS | varios | segun modelo | ONNX | Ecosistema original de entrenamiento |

No se dispone de datos de rendimiento comparativo (MOS, latencia, throughput) en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo de un solo hablante: no permite clonacion de voz ni seleccion entre multiples voces.
- Dependencia de espeak-ng o espyak para la fonemizacion; si se usa espyak, algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal ciertas palabras.
- Cobertura limitada al ingles estadounidense; no soporta otros idiomas.
- Riesgo de errores de pronunciacion en palabras fuera del vocabulario o con grafias irregulares, al depender de la conversion a fonemas.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre la calidad subjetiva (MOS) de la voz.
- Aunque la licencia es Apache 2.0, conviene verificar la procedencia de los datos de entrenamiento del modelo upstream (campwill/HAL-9000-Piper-TTS) antes de un uso comercial a gran escala.
- El nombre "HAL 9000" sugiere una voz sintetica caracteristica; su idoneidad para aplicaciones de marca o atencion al cliente debe evaluarse auditivamente antes de produccion.
- No apto para tareas de razonamiento, codigo, vision ni agentes; es exclusivamente un modelo TTS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-hal_9000
- Modelo upstream: https://huggingface.co/campwill/HAL-9000-Piper-TTS
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
