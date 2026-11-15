# Phoonnx/vits-it_it-aurora

## Resumen

vits-it_it-aurora es un modelo de síntesis de voz (text-to-speech) en italiano estándar (it-IT) basado en la arquitectura VITS, empaquetado en formato ONNX por Phoonnx para su uso con su librería de inferencia TTS. El modelo original fue entrenado por kirys79 dentro del proyecto piper_italiano, y esta versión redistribuye los pesos para que puedan ejecutarse con phoonnx, tanto en Python como en el ecosistema de asistentes OVOS.

El modelo resuelve la conversión de texto a audio en italiano con una huella de almacenamiento muy reducida (0,1 GB en el repositorio), lo que lo hace adecuado para despliegue en dispositivos con recursos limitados, asistentes de voz locales y aplicaciones embebidas. La entrada de texto se procesa mediante fonemización con espeak-ng (alfabeto IPA) y normalización previa con la librería scriptconv.

Su relevancia actual radica en la combinación de una licencia permisiva (CC-BY-4.0), un formato ONNX portable y una integración sencilla en pipelines de voz open source, aunque su adopción es todavía muy baja (26 descargas y 0 likes en el momento de la consulta) y no se han publicado métricas de calidad objetivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema generativo condicional que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial multiperiodo para el entrenamiento. La inferencia produce directamente la forma de onda de audio a partir de la secuencia de fonemas, sin necesidad de un vocoder externo separado.

La entrada de texto se convierte en fonemas mediante espeak-ng (alfabeto IPA) y se normaliza con scriptconv antes de alimentar el modelo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el hablante de referencia (Aurora) ni si se aplicaron técnicas de RLHF o ajuste fino adicional; la model card únicamente indica el origen upstream en kirys79/piper_italiano y el proceso de empaquetado en ONNX para phoonnx.

## Capacidades

- Síntesis de voz en italiano (it-IT) a partir de texto plano.
- Fonemización mediante espeak-ng con alfabeto IPA, con la alternativa del port espyak incluido en el extra `phoonnx[espeak]`.
- Generación de audio en formato WAV mediante la API `voice.synthesize_wav`.
- Integración como plugin TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable desde `mycroft.conf`.
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.
- No dispone de modo thinking ni capacidades multilingües más allá del italiano.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin `ovos-tts-plugin-phoonnx` y permite dotar de voz italiana a un asistente doméstico sin depender de servicios en la nube, gracias a su reducido tamaño y formato ONNX.
- Lectura de notificaciones y alertas en italiano: aplicaciones de domótica o monitoreo pueden sintetizar mensajes cortos en tiempo real con latencia baja al ejecutarse en CPU.
- Accesibilidad para personas con discapacidad visual: conversión de contenido textual (artículos, correos, documentación) a audio en italiano mediante un pipeline Python con phoonnx y scriptconv.
- Síntesis de voz en aplicaciones web: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para leer contenido dinámico sin enviar texto a servidores externos, preservando la privacidad.
- Prototipado de interfaces conversacionales en italiano: equipos que desarrollan chatbots de voz pueden usar este modelo para validar flujos de diálogo antes de invertir en voces comerciales de mayor calidad.
- Generación de audiolibros o podcasts de bajo coste: para contenido en italiano donde la naturalidad no sea crítica, el modelo permite generar audio por lotes con una licencia permisiva que facilita su redistribución.
- Pruebas de integración en pipelines CI/CD de voz: al ser un artefacto ONNX pequeño, puede incluirse en tests automatizados de regresión de audio sin requerir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS, la inferencia es viable en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU y entornos embebidos.
- Compatibilidad con GPU de consumo: no se documenta, pero el tamaño reducido sugiere que cualquier GPU moderna podría ejecutarlo si el runtime ONNX lo permite.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Contexto | Rendimiento publicado |
|---|---|---|---|---|---|---|
| vits-it_it-aurora (Phoonnx) | VITS | it-IT | CC-BY-4.0 | ONNX | no aplica | no disponible |
| Piper voces italianas (rhasspy/piper-voices) | VITS | it-IT | MIT (mayoría) | ONNX | no aplica | no disponible |
| Coqui TTS (modelos it) | VITS / Tacotron2 | it-IT | MPL-2.0 / otras | PyTorch, ONNX | no aplica | no disponible |

La comparación se limita a aspectos estructurales, ya que no hay métricas objetivas publicadas para este modelo ni para las alternativas en la información disponible. La principal diferencia frente a Piper es el ecosistema de ejecución (phoonnx frente a piper) y el origen del checkpoint (kirys79/piper_italiano), mientras que frente a Coqui TTS destaca el formato ONNX ligero y la licencia CC-BY-4.0.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad (MOS, WER, inteligibilidad), por lo que la calidad subjetiva de la voz no está verificada de forma independiente.
- El modelo solo soporta italiano (it-IT); no es multilingüe.
- La fonemización depende de espeak-ng; el uso del port espyak puede producir errores de pronunciación en algunas palabras, según advierte la propia model card.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí puede producirse una pronunciación incorrecta o prosodia anómala en textos con abreviaturas, números o nombres propios no normalizados correctamente por scriptconv.
- La licencia CC-BY-4.0 exige atribución al autor original (kirys79) y a Phoonnx al redistribuir o usar el modelo, incluso comercialmente.
- La adopción es muy baja (26 descargas, 0 likes), lo que reduce la probabilidad de que los fallos hayan sido reportados y corregidos por la comunidad.
- No se documentan sesgos de género, acento o registro del hablante (Aurora), ni la composición del dataset de entrenamiento, lo que impide evaluar su representatividad.
- No hay información sobre cuantizaciones alternativas ni sobre el rendimiento en hardware específico, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-aurora
- Modelo upstream: https://huggingface.co/kirys79/piper_italiano/tree/main/Aurora
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
