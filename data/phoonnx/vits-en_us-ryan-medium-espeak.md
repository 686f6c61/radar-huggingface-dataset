# Phoonnx/vits-en_us-ryan-medium-espeak

## Resumen

`vits-en_us-ryan-medium-espeak` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy como parte del proyecto Piper y reempaquetado por Phoonnx para su biblioteca de inferencia ONNX homónima. El modelo toma texto en inglés estadounidense, lo convierte a fonemas mediante espeak-ng (alfabeto IPA) y genera audio WAV. Su relevancia radica en que ofrece TTS neuronal de calidad media en un paquete ligero (0,1 GB) y con licencia MIT, lo que facilita su integración en asistentes de voz y sistemas embebidos sin depender de servicios en la nube.

El modelo no es un LLM ni un transformer generativo de texto: es un sistema acústico condicionado a fonemas, por lo que sus capacidades se limitan a la síntesis de voz. La etiqueta "medium" hace referencia a la variante de tamaño dentro del catálogo de voces de Piper, no a un número de parámetros publicado. El repositorio de Hugging Face no incluye métricas de benchmarks ni detalles de entrenamiento más allá de la procedencia upstream.

El interés actual del modelo reside en su formato ONNX y su integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, lo que permite desplegar TTS local en asistentes domésticos y aplicaciones de accesibilidad con latencia baja y sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech, ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | en-US (ingles estadounidense) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak (alfabeto IPA) |
| Tamano del repositorio | 0,1 GB |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Upstream | rhasspy/piper-voices/en/en_US/ryan/medium |
| Autor original | Rhasspy |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema condicional de extremo a extremo que combina un encoder de texto, un prior variacional, un decoder acústico y un discriminador adversarial durante el entrenamiento. La inferencia se realiza sobre pesos exportados a ONNX, lo que permite ejecución optimizada en CPU y GPU sin depender de PyTorch en tiempo de ejecución.

Los datos de entrenamiento no están documentados en la información disponible: se desconoce el número de horas de audio, la composición del corpus y si se aplicaron técnicas de alineamiento o fine-tuning posteriores. El modelo procede del catálogo Piper de Rhasspy, que habitualmente entrena sus voces con datasets públicos de voz, pero este repositorio no aporta detalles específicos. La innovación destacable es el pipeline de fonemización: el texto se normaliza con `scriptconv` y se convierte a fonemas IPA mediante `espeak-ng` (o el port `espyak`), que alimentan directamente al modelo. No se documenta decodificación especulativa ni atención lineal.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense, con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng, con normalización previa del texto a través de `scriptconv`.
- Integración con la biblioteca phoonnx en Python mediante `TTSModelManager`.
- Soporte como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`), configurable desde `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o Unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al inglés estadounidense; no se documentan otras variantes.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se instala como plugin y se selecciona la voz `piper/en_US-ryan-medium` en la configuración, permitiendo respuestas habladas sin conexión a internet y con licencia MIT.
- Sistemas de accesibilidad para lectura de pantalla: al ser un modelo ONNX ligero (0,1 GB), puede ejecutarse en dispositivos de bajos recursos para convertir texto de interfaz en audio en tiempo real.
- Automatización de avisos y notificaciones: integración en pipelines que generan mensajes de voz pregrabados para domótica, alarmas o sistemas de megafonía, usando la API de `voice.synthesize_wav`.
- Aplicaciones web de demostración: mediante phoonnx.js y la demo en tigregotico.pt/demo, se puede ofrecer síntesis de voz en el navegador sin backend, útil para prototipos de interfaz conversacional.
- Generación de audiolibros o contenido narrado en inglés: el modelo produce audio WAV a partir de texto plano, adecuado para narración de documentos o artículos con voz consistente.
- Testing de pipelines de voz: al ser un modelo pequeño y determinista, sirve como componente de referencia en pruebas de integración de sistemas TTS, verificando la cadena texto → fonemas → audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,1 GB, la huella de memoria es reducida y cabe en CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante ONNX Runtime.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU moderna con soporte ONNX Runtime, aunque no se documenta oficialmente.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Tamano | Contexto |
|---|---|---|---|---|---|---|
| vits-en_us-ryan-medium-espeak (Phoonnx) | VITS | en-US | MIT | ONNX | 0,1 GB | no aplica |
| rhasspy/piper-voices (upstream) | VITS | en-US | MIT | ONNX | no disponible | no aplica |
| Otras voces VITS de la colección Phoonnx | VITS | varias | MIT (segun upstream) | ONNX | variable | no aplica |

La comparativa se limita al ecosistema Piper/Phoonnx porque no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada. No se dispone de comparación con sistemas TTS comerciales o de mayor tamaño.

## Limitaciones y advertencias

- Solo sintetiza voz en inglés estadounidense; no soporta otros idiomas ni cambio de voz.
- La calidad depende de la fonemización con espeak-ng: si se usa el port `espyak`, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Requiere instalar espeak-ng en el sistema (o el extra `phoonnx[espeak]`) para el front-end de texto; sin él, el modelo no funciona correctamente.
- No es un modelo generativo de texto: no razona, no responde preguntas ni mantiene conversaciones; cualquier expectativa de LLM es incorrecta.
- No se documentan sesgos específicos del hablante ni del corpus de entrenamiento, pero al ser una voz única ("ryan") la diversidad de voces es nula.
- Riesgo de alucinación acústica: no aplica en el sentido de LLM, pero puede producir pronunciaciones incorrectas ante texto no normalizado o siglas.
- Licencia MIT declarada por el upstream; se recomienda verificar la model card original de rhasspy/piper-voices antes de uso comercial, ya que el repositorio de Phoonnx solo la referencia.
- No se documentan limitaciones de longitud de texto; el rendimiento en textos largos no está medido.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-ryan-medium-espeak
- Upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ryan/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
