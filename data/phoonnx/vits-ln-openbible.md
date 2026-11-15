# Phoonnx/vits-ln-openbible

## Resumen

vits-ln-openbible es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Coqui a partir del corpus OpenBible y empaquetado en formato ONNX por Phoonnx para su uso con su librería de inferencia `phoonnx`. El modelo está especializado en el idioma lingala (`ln`), una lengua bantú hablada principalmente en la República Democrática del Congo y la República del Congo, y convierte texto en caracteres directamente en audio sin necesidad de un fonemizador externo basado en léxico.

La relevancia de este modelo radica en su nicho: los recursos TTS para lenguas de bajos recursos como el lingala son escasos, y este paquete ofrece una vía práctica de integrar síntesis de voz en aplicaciones de asistencia por voz (OVOS), lectura de textos o sistemas de accesibilidad en lingala. Al estar empaquetado en ONNX y disponible vía `phoonnx`, la inferencia puede ejecutarse sin depender del framework original de Coqui.

El repositorio tiene un tamaño de 0,1 GB y, en el momento de la consulta, registra 22 descargas y 0 likes. No se dispone de información sobre el número de parámetros, la longitud de contexto (no aplica en TTS) ni datos de entrenamiento más allá del corpus OpenBible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | lingala (`ln`) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (empaquetado para `phoonnx`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo condicional que combina un codificador de texto, un prior normalizing flow, un decodificador basado en HiFi-GAN y un discriminador adversario entrenado de forma conjunta. VITS produce audio de forma end-to-end a partir de texto, evitando pipelines separados de alineamiento y vocoder. La entrada de texto se procesa a nivel de caracteres mediante el `GraphemePhonemizer` de `scriptconv`, lo que implica que no se requiere un diccionario fonético específico del lingala.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset (más allá de que proviene del corpus OpenBible), ni sobre si se aplicaron técnicas de RLHF o fine-tuning adicional. El modelo original fue publicado por Coqui en la release v0.6.2 de su repositorio TTS; Phoonnx se limita a empaquetarlo en ONNX y a integrarlo en su ecosistema.

## Capacidades

- Síntesis de voz a partir de texto en lingala (`ln`), con salida en formato WAV.
- Procesamiento de entrada a nivel de caracteres (grafemas), sin necesidad de fonemizador específico.
- Integración con la librería `phoonnx` en Python mediante `TTSModelManager` y `voice.synthesize_wav`.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Inferencia en formato ONNX, lo que permite despliegue sin el framework original de Coqui.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking (no aplica a un modelo TTS).

## Casos de uso

- Asistencia por voz en lingala con OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite que un asistente doméstico responda en lingala; es adecuado por su empaquetado ligero (0,1 GB) y su integración directa con la configuración de OVOS.
- Lectura de textos bíblicos y contenido religioso: dado que el corpus de entrenamiento es OpenBible, el modelo es especialmente adecuado para narrar pasajes y textos devocionales en lingala con una prosodia probablemente alineada con ese dominio.
- Accesibilidad para personas con discapacidad visual: permite convertir texto en lingala (noticias, documentos, mensajes) en audio para lectores de pantalla, usando la API `synthesize_wav` de `phoonnx`.
- Generación de audiolibros y contenido educativo en lingala: el modelo puede sintetizar fragmentos largos por lotes, aunque la calidad fuera del dominio OpenBible puede degradarse.
- Localización de aplicaciones y contenidos digitales: permite generar pistas de voz en lingala para interfaces, tutoriales o vídeos, reduciendo la dependencia de grabaciones humanas.
- Investigación en TTS para lenguas de bajos recursos: sirve como línea base reproducible (ONNX, licencia CC-BY-SA-4.0) para comparar con otros sistemas TTS en lingala.
- Prototipado rápido de interfaces de voz en lingala: al instalarse con `pip install --pre phoonnx` y cargarse mediante `TTSModelManager`, permite validar flujos de voz en horas en lugar de días.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la arquitectura VITS, es previsible que quepa en GPUs de gama baja, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No confirmado; el tamaño del artefacto (0,1 GB) sugiere que sí, pero no se documenta.
- Opciones de despliegue: `phoonnx` (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| vits-ln-openbible (este) | VITS | lingala (`ln`) | no disponible | no aplica | CC-BY-SA-4.0 | ONNX |
| Coqui TTS `tts_models--lin--openbible--vits` (upstream) | VITS | lingala (`ln`) | no disponible | no aplica | CC-BY-SA-4.0 | Checkpoint Coqui (no ONNX) |
| Otros modelos VITS de la colección Phoonnx | VITS | varios | no disponible | no aplica | según modelo | ONNX |

No se dispone de información sobre benchmarks ni de otros modelos TTS comparables en lingala dentro de la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con el corpus OpenBible, por lo que su prosodia y cobertura léxica pueden estar sesgadas hacia el registro bíblico y fallar en vocabulario coloquial o técnico en lingala.
- Riesgo de alucinación o pronunciación incorrecta en palabras fuera del vocabulario de entrenamiento, especialmente nombres propios y términos modernos.
- Solo soporta lingala (`ln`); no se documenta multilingüismo.
- La licencia CC-BY-SA-4.0 exige atribución y compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para uso comercial propietario.
- No se documentan métricas de calidad (MOS, WER) ni evaluaciones subjetivas, por lo que la calidad real en producción es desconocida.
- El paquete depende de `phoonnx` (versión preliminar, `--pre`) y de `scriptconv`; cambios en estas librerías pueden romper la integración.
- No se documentan mecanismos de control de prosodia, emoción ni velocidad más allá de los parámetros que exponga `phoonnx`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-ln-openbible
- Repositorio upstream (Coqui TTS v0.6.2): https://github.com/coqui-ai/TTS/releases/download/v0.6.2_models/tts_models--lin--openbible--vits.zip
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
