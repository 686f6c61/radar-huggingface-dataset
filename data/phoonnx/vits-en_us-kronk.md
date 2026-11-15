# Phoonnx/vits-en_us-kronk

## Resumen

vits-en_us-kronk es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por russdill y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo genera audio en inglés estadounidense (en-US) a partir de texto, tomando como entrada fonemas espeak en alfabeto IPA. Se trata de un modelo ligero (el repositorio ocupa 0,1 GB) orientado a la síntesis de voz en tiempo real en entornos con recursos limitados.

El modelo es una conversión a formato ONNX del checkpoint original de russdill, lo que permite su ejecución mediante la librería phoonnx tanto en Python como en el ecosistema OVOS (Open Voice OS). Su relevancia radica en que ofrece una alternativa de TTS local, con licencia MIT, que no requiere servicios en la nube y puede ejecutarse en CPU, lo que lo hace adecuado para asistentes de voz, dispositivos embebidos y aplicaciones de accesibilidad.

La integración con phoonnx incluye un front-end de texto basado en scriptconv, que normaliza el texto y lo convierte a fonemas mediante espeak-ng (o el port espyak). El modelo está identificado en el ecosistema phoonnx como `piper_community/russdill/en-US_kronk`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador variational autoencoder (VAE), un modelo normalizing flow y un decodificador adversario (GAN) para generar formas de onda directamente a partir de fonemas. El modelo original fue entrenado por russdill y publicado en su repositorio `russdill/kronk/en/en_US/kronk/medium`, del que Phoonnx ha extraído y empaquetado los pesos en formato ONNX para su librería.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La entrada del modelo son fonemas espeak en alfabeto IPA, generados por el front-end scriptconv, que normaliza el texto y lo convierte a fonemas mediante espeak-ng (o el port espyak, con posibles diferencias fonéticas). El modelo está diseñado para síntesis de voz en inglés estadounidense.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto.
- Generación de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Entrada basada en fonemas espeak (IPA), lo que permite control fonético preciso.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución local en CPU mediante ONNX Runtime, sin dependencia de servicios en la nube.
- Soporte de front-end de texto con normalización y conversión a fonemas vía scriptconv.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-step (es un modelo TTS puro).

## Casos de uso

- Asistentes de voz locales: el modelo puede integrarse en OVOS como motor TTS para generar respuestas habladas en inglés estadounidense, funcionando en CPU y sin conexión a internet, lo que es adecuado para dispositivos de domótica y asistentes personales.
- Accesibilidad y lectores de pantalla: permite convertir texto a voz en aplicaciones de lectura para personas con discapacidad visual, con latencia baja gracias a la ejecución local en ONNX.
- Sistemas embebidos y dispositivos IoT: su tamaño reducido (0,1 GB) y la ejecución en CPU lo hacen viable en Raspberry Pi u otros dispositivos con recursos limitados para interfaces de voz.
- Generación de audiolibros y contenido narrado: puede sintetizar texto largo por fragmentos, aunque la calidad y naturalidad dependerán del checkpoint original de russdill.
- Pruebas y prototipado de pipelines TTS: sirve como modelo de referencia para validar integraciones con phoonnx y scriptconv antes de pasar a modelos de mayor calidad.
- Aplicaciones educativas de pronunciación: al usar fonemas IPA como entrada, permite generar audio controlado fonéticamente para herramientas de aprendizaje de inglés.
- Automatización de avisos y notificaciones: generación de mensajes de voz dinámicos en sistemas de alerta o atención al cliente con requisitos de privacidad (todo local).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, se espera que quepa en memoria RAM/VRAM de forma holgada, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio (0,1 GB), aunque no se confirma en la información disponible.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js para navegador (con entrada espeak o unicode).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto/entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-en_us-kronk | VITS | en-US | MIT | ONNX | Fonemas espeak (IPA) | Hugging Face (Phoonnx) |
| Piper (voces en_US) | VITS | en-US y otros | MIT (mayoría) | ONNX | Fonemas espeak | Hugging Face / rhasspy |
| Coqui TTS (VITS) | VITS | Multiidioma | MPL 2.0 / varias | PyTorch | Texto/fonemas | GitHub / Hugging Face |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- La entrada debe ser fonemas espeak en IPA; el uso directo de texto requiere el front-end scriptconv y espeak-ng instalado.
- Si se usa el port espyak en lugar de espeak-ng, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se dispone de información sobre sesgos del dataset de entrenamiento original (russdill/kronk), por lo que pueden existir sesgos de pronunciación o prosodia.
- Riesgo de alucinación no aplica en el sentido de texto, pero puede generar audio incorrecto o ininteligible ante entradas fonéticas fuera de distribución.
- La licencia MIT permite uso comercial, pero se recomienda verificar los términos del release upstream de russdill.
- No hay datos publicados de benchmarks, latencia ni calidad subjetiva (MOS), lo que dificulta evaluar su rendimiento en producción.
- El modelo tiene solo 30 descargas y 0 likes en el momento de la ficha, lo que indica poca validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-kronk
- Upstream (russdill): https://huggingface.co/russdill/kronk/tree/main/en/en_US/kronk/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
