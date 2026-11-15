# Phoonnx/vits-it_it-ugo

## Resumen

vits-it_it-ugo es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado en formato ONNX para su uso con la librería phoonnx. El modelo original fue entrenado por Einrich99 como parte del proyecto PiperTTS-UGO-Italian (variante medium) y posteriormente ha sido adaptado y distribuido por Phoonnx para su integración en el ecosistema de phoonnx, una librería de TTS basada en ONNX.

El modelo está especializado exclusivamente en italiano (it-IT) y recibe como entrada fonemas generados por espeak-ng en alfabeto IPA, lo que requiere la instalación del motor espeak-ng o del port espyak para funcionar correctamente. Su tamaño de repositorio es de aproximadamente 0,1 GB, lo que lo convierte en una opción extremadamente ligera para despliegues en entornos con recursos limitados.

Su relevancia radica en que permite integrar síntesis de voz italiana de forma local y sin dependencia de servicios en la nube, con una licencia permisiva (CC-BY-4.0) que facilita su uso comercial con atribución. Está pensado para integrarse en asistentes de voz como OVOS/Mycroft mediante el plugin ovos-tts-plugin-phoonnx, así como en aplicaciones Python y en el navegador a través de phoonnx.js.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | italiano (it-IT) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema end-to-end de síntesis de voz que combina un codificador variacional (VAE), un decodificador basado en normalizing flows y un discriminador adversarial entrenado con aprendizaje adversario, junto con alineamiento monotónico para generar audio directamente a partir de fonemas. Esta arquitectura permite síntesis de alta calidad con latencia reducida y sin necesidad de un vocoder externo, ya que el decoder genera directamente la forma de onda.

El modelo deriva de la variante medium de PiperTTS-UGO-Italian, entrenada por Einrich99. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). La entrada del modelo son fonemas en alfabeto IPA generados por espeak-ng, y el front-end de texto se gestiona mediante la librería scriptconv, que normaliza el texto y lo convierte en la entrada fonémica del modelo.

## Capacidades

- Síntesis de voz (text-to-speech) en italiano (it-IT) a partir de texto escrito.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Fonemización de entrada mediante espeak-ng (o el port espyak) en alfabeto IPA.
- Integración con el ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js (voces VITS con entrada espeak o unicode).
- Normalización y conversión de texto mediante scriptconv (front-end de texto).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz locales en italiano: integración como motor TTS en OVOS/Mycroft mediante la configuración de `mycroft.conf`, permitiendo respuestas habladas en italiano sin depender de servicios en la nube.
- Lectura de textos en aplicaciones de accesibilidad: conversión de texto escrito a voz para personas con discapacidad visual, con ejecución local y bajo consumo de recursos gracias al tamaño reducido del modelo (0,1 GB).
- Generación de audiolibros y contenido narrado: síntesis por lotes de textos largos en italiano mediante la API de phoonnx, con salida WAV lista para post-procesado.
- Integración en aplicaciones web: uso de phoonnx.js para sintetizar voz italiana directamente en el navegador, sin backend, útil para demos interactivas o prototipos.
- Sistemas de anuncios automatizados: generación de avisos hablados en italiano en entornos como transporte público, comercios o domótica, donde se requiere una voz ligera y local.
- Prototipado de interfaces conversacionales: desarrollo de chatbots de voz en italiano con latencia baja, aprovechando la arquitectura VITS que genera audio directamente sin vocoder separado.
- Investigación en TTS: base para experimentos de síntesis de voz en italiano con modelos ligeros y licencia permisiva, comparando variantes de phonemización espeak-ng frente a espyak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; dado el tamaño del repositorio (0,1 GB) y la arquitectura VITS, el modelo está diseñado para ejecutarse en CPU con requisitos mínimos de memoria.
- GPU recomendadas: no disponibles; el modelo es lo suficientemente ligero para ejecutarse en CPU sin GPU dedicada.
- ¿Cabe en GPU consumer? Sí, previsiblemente en cualquier GPU consumer (e incluso en CPU), dado el tamaño reducido del modelo; no se dispone de cifras exactas de VRAM.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS/Mycroft), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS VITS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto / entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-it_it-ugo (Phoonnx) | VITS | it-IT | fonemas espeak IPA | CC-BY-4.0 | ONNX | Hugging Face (Phoonnx) |
| PiperTTS-UGO-Italian (Einrich99) | VITS | it-IT | fonemas espeak IPA | CC-BY-4.0 (según model card upstream) | no disponible | Hugging Face (Einrich99) |
| Otras voces VITS de la colección Phoonnx | VITS | varios | fonemas espeak IPA | según cada modelo | ONNX | Hugging Face (colección Phoonnx) |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta italiano (it-IT); no es multilingüe.
- Requiere espeak-ng instalado o el port espyak; con espyak algunos fonemas difieren de espeak-ng y el modelo puede pronunciar mal algunas palabras.
- Es un modelo TTS, no un modelo de lenguaje: no realiza razonamiento, generación de texto, tool calling ni agentes.
- No se dispone de información sobre sesgos de voz (género, acento, prosodia) ni sobre el dataset de entrenamiento, por lo que no se pueden evaluar sesgos conocidos.
- Riesgo de alucinación no aplica en el sentido de LLM, pero puede haber errores de pronunciación derivados de la fonemización incorrecta del texto de entrada.
- Licencia CC-BY-4.0: permite uso comercial siempre que se atribuya la autoría (Einrich99 y Phoonnx); es necesario conservar la atribución en producciones derivadas.
- El número de descargas (29) y likes (0) indica un modelo poco validado por la comunidad; conviene probarlo antes de usarlo en producción.
- No se dispone de información sobre latencia, throughput ni calidad perceptual (MOS) para evaluar su idoneidad en producción a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-it_it-ugo
- Modelo upstream (Einrich99/PiperTTS-UGO-Italian, variante medium): https://huggingface.co/Einrich99/PiperTTS-UGO-Italian/tree/main/medium
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
