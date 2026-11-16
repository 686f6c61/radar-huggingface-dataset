# Phoonnx/vits-de_de-pavoque-low-espeak

## Resumen

vits-de_de-pavoque-low-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo convierte texto en alemán (`de-DE`) en audio, tomando como entrada fonemas espeak en alfabeto IPA en lugar de texto plano, lo que exige un paso previo de fonemización mediante espeak-ng o espyak.

Se trata de un modelo compacto (repositorio de 0,1 GB) orientado a síntesis de voz ligera y ejecutable en CPU mediante ONNX Runtime, pensado para asistentes de voz, sistemas embebidos y aplicaciones de lectura en voz alta donde el coste computacional y el tamaño importan más que la expresividad. La variante `low` indica una configuración de calidad reducida dentro de la familia Piper, lo que se traduce en un modelo más pequeño y rápido.

Su relevancia actual radica en su integración con el ecosistema OVOS (Open Voice OS) a través del plugin `ovos-tts-plugin-phoonnx`, y en que permite TTS offline en alemán sin dependencias de servicios en la nube. La licencia MIT facilita su uso comercial, aunque hereda las limitaciones de calidad de una variante de baja capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | aleman (`de-DE`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx (Python / OVOS) |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial entrenado con pérdidas de reconstrucción y adversariales, además de un alineamiento monotónico latente que sustituye a los tradicionales modelos acústicos y vocoders separados. El resultado es un modelo único que genera waveform directamente desde fonemas.

Este checkpoint concreto es una variante `low` de la voz `pavoque` para alemán de Rhasspy, reempaquetada en ONNX por Phoonnx. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. La innovación práctica del empaquetado es la integración con `scriptconv` para la normalización de texto y la fonemización mediante `EspeakPhonemizer`, lo que permite su uso directo en Python y en OVOS.

## Capacidades

- Síntesis de voz (text-to-speech) en alemán (`de-DE`) a partir de fonemas espeak en IPA.
- Generación de audio WAV mediante la API `voice.synthesize_wav(text, wav_file)`.
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en navegador a través de phoonnx.js (con entrada espeak o unicode).
- Inferencia ONNX, apta para CPU y entornos sin GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada exclusivamente al alemán.

## Casos de uso

- Asistentes de voz offline en OVOS: el modelo se integra como módulo TTS mediante `ovos-tts-plugin-phoonnx`, permitiendo respuestas habladas en alemán sin conexión a internet ni servicios externos, gracias a su formato ONNX y su reducido tamaño (0,1 GB).
- Lectura en voz alta de textos en aplicaciones de accesibilidad: la API `synthesize_wav` permite convertir párrafos en audio WAV de forma local, adecuada para lectores de pantalla en escritorio o dispositivos de bajo consumo.
- Sistemas embebidos y Raspberry Pi: al ser una variante `low` con inferencia ONNX en CPU, encaja en dispositivos con recursos limitados donde un modelo TTS de mayor tamaño no cabría o sería demasiado lento.
- Síntesis de avisos y notificaciones en domótica: frases cortas en alemán generadas bajo demanda para altavoces inteligentes o sistemas de automatización del hogar.
- Pruebas y desarrollo de pipelines TTS: sirve como voz de referencia para validar integraciones con `scriptconv`, fonemización espeak y el ecosistema phoonnx antes de migrar a voces de mayor calidad.
- Demos web de TTS: mediante phoonnx.js se puede desplegar una demostración en navegador que sintetice alemán con esta voz, útil para prototipos y validación de experiencia de usuario.
- Generación de audio para contenido educativo o audiolibros ligeros en alemán, donde la calidad `low` es aceptable y prima la velocidad de generación en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, la inferencia puede ejecutarse en CPU sin GPU.
- GPU recomendadas: no se especifican; cualquier GPU compatible con ONNX Runtime serviría, pero el modelo está optimizado para CPU.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU de consumo e incluso sin GPU, dado el reducido tamaño del repositorio.
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador) y ONNX Runtime.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Dependencia externa: requiere espeak-ng instalado (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-de_de-pavoque-low-espeak | VITS | de-DE | 0,1 GB (repo) | MIT | ONNX | Variante `low`, entrada por fonemas espeak |
| Otras voces Piper `de_DE` (p. ej. variantes `medium`/`high` de rhasspy/piper-voices) | VITS | de-DE | no disponible | MIT (upstream) | ONNX | Mayor calidad a costa de mas tamano y computo |
| VITS de la coleccion Phoonnx (otras lenguas) | VITS | varias | no disponible | MIT | ONNX | Mismo empaquetado, distinto idioma |

No se dispone de datos de rendimiento comparativo (MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Calidad de síntesis reducida por ser una variante `low`; puede sonar menos natural que variantes `medium` o `high` de Piper.
- Dependencia de espeak-ng o espyak para la fonemización; diferencias entre ambos pueden provocar pronunciaciones incorrectas de algunas palabras.
- Solo soporta alemán (`de-DE`); no es multilingüe.
- Riesgo de errores de pronunciación en nombres propios, siglas, números o texto no normalizado correctamente por `scriptconv`.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Licencia MIT declarada por el upstream en la model card de rhasspy/piper-voices; conviene verificar los términos del proyecto Piper y de las voces originales antes de uso comercial a gran escala.
- Sin datos publicados de benchmarks, MOS ni evaluaciones de sesgo; no se puede garantizar calidad objetiva en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-pavoque-low-espeak
- Upstream Piper (rhasspy/piper-voices): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/pavoque/low
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
