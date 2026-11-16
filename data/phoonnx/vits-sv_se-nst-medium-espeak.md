# Phoonnx/vits-sv_se-nst-medium-espeak

## Resumen

vits-sv_se-nst-medium-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en sueco de Suecia (sv-SE) a audio inteligible, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA en lugar de texto crudo. Su relevancia radica en que ofrece TTS neuronal ligero y ejecutable localmente mediante ONNX Runtime, sin dependencia de servicios en la nube, lo que lo hace adecuado para asistentes de voz embebidos y sistemas de domótica.

El modelo forma parte de la familia de voces Piper, un ecosistema consolidado de TTS de código abierto con licencia MIT y pesos de pequeño tamaño (el repositorio ocupa aproximadamente 0,1 GB). La variante "medium" implica un compromiso entre calidad y velocidad de inferencia, pensado para ejecución en CPU y dispositivos de recursos limitados.

La integración con Phoonnx añade capas de utilidad práctica: gestión de modelos, normalización de texto mediante scriptconv y un plugin para el ecosistema OVOS (Open Voice OS), lo que facilita su despliegue en asistentes de voz de código abierto. No obstante, el modelo está especializado exclusivamente en sueco y requiere espeak-ng para la fonemización, lo que condiciona su pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS, end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por frase, sin ventana de contexto definida) |
| Tipos de cuantizacion | no disponible (pesos ONNX; el autor no documenta variantes) |
| Idiomas soportados | sueco de Suecia (sv-SE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python), phoonnx.js (navegador) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. El modelo genera directamente la forma de onda a partir de la secuencia de fonemas, sin necesidad de un vocoder separado, lo que simplifica el despliegue y reduce la latencia. La variante "medium" de Piper corresponde a un tamaño intermedio dentro de la familia de voces del proyecto, aunque el autor no publica el número exacto de parámetros ni la configuración de capas.

No se dispone de información sobre el corpus de entrenamiento (número de horas de audio, hablantes, composición del dataset) ni sobre el uso de técnicas de alineamiento o fine-tuning específicas. El modelo se distribuye como pesos ONNX exportados desde el checkpoint original de Piper, sin documentación adicional sobre el proceso de conversión o cuantización. La entrada se realiza exclusivamente mediante fonemas IPA generados por espeak-ng, lo que implica que la calidad de la fonemización afecta directamente a la pronunciación; el autor advierte que el port espyak puede diferir de espeak-ng y producir errores en algunas palabras.

## Capacidades

- Síntesis de voz a partir de texto en sueco de Suecia (sv-SE), con salida en formato WAV.
- Fonemización mediante espeak-ng o espyak, con entrada en alfabeto IPA.
- Inferencia local mediante ONNX Runtime, sin conexión a servicios externos.
- Integración con la librería phoonnx para gestión de voces y síntesis programática.
- Soporte de plugin para OVOS (`ovos-tts-plugin-phoonnx`), configurable mediante `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js (con entrada espeak o unicode).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM: es exclusivamente un modelo TTS.
- No soporta otros idiomas distintos del sueco.

## Casos de uso

- Asistentes de voz domésticos en OVOS: el modelo se integra como plugin TTS nativo, permitiendo respuestas habladas en sueco dentro de un asistente local sin dependencia de la nube, gracias a su formato ONNX y su reducido tamaño (~0,1 GB).
- Lectura de notificaciones y alertas en sistemas de domótica: el modelo puede sintetizar mensajes cortos en sueco para altavoces conectados, con latencia baja al ejecutarse en CPU mediante ONNX Runtime.
- Audiolibros y contenido accesible en sueco: permite convertir texto largo en audio por fragmentos de frase, adecuado para narración automatizada de documentos o artículos.
- Sistemas de información pública en Suecia: kioscos, paneles o terminales de transporte que necesiten anuncios hablados en sv-SE sin infraestructura cloud.
- Prototipado de interfaces de voz: desarrolladores que necesiten un TTS ligero para pruebas de UX conversacional en sueco, con instalación simple vía `pip install --pre phoonnx`.
- Aplicaciones web de accesibilidad: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para leer contenido en sueco a usuarios con discapacidad visual, sin enviar texto a servidores externos.
- Investigación en TTS: sirve como baseline reproducible de VITS en sueco para comparar técnicas de fonemización o cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; por el tamaño del repositorio (~0,1 GB) se espera un consumo de memoria muy bajo, inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: no se documentan requisitos de GPU; el modelo está pensado para inferencia en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna con soporte ONNX Runtime, aunque el autor no lo especifica.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-sv_se-nst-medium-espeak (este) | VITS | sv-SE | ~0,1 GB | MIT | ONNX |
| Otras voces Piper sv_SE (p. ej. variantes de rhasspy/piper-voices) | VITS | sv-SE | variable, no disponible | MIT (según upstream) | ONNX |
| Modelos TTS multilingües neuronales (p. ej. Coqui TTS) | VITS / otros | múltiples | mayor, no disponible | variable | varios |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Especializado exclusivamente en sueco de Suecia (sv-SE); no soporta otros idiomas.
- Requiere espeak-ng instalado en el sistema para la fonemización; sin él, el uso de espyak puede producir pronunciaciones incorrectas en algunas palabras.
- No es un modelo de lenguaje: no realiza razonamiento, tool calling ni generación de texto.
- Riesgo de errores de pronunciación en palabras con grafías ambiguas o extranjerismos, dependiente de la calidad de la fonemización espeak-ng.
- No se documentan sesgos específicos de voz (género, acento, prosodia) ni la composición del corpus de entrenamiento, lo que dificulta evaluar su representatividad.
- Licencia MIT declarada por el upstream (rhasspy/piper-voices), lo que permite uso comercial, pero conviene verificar la cadena de licencias del proyecto Piper original.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (MOS) ni de latencia para planificar producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-sv_se-nst-medium-espeak
- Upstream Piper (sv_SE/nst/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/sv/sv_SE/nst/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
