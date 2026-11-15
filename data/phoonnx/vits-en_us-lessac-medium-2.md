# Phoonnx/vits-en_us-lessac-medium

## Resumen

vits-en_us-lessac-medium es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS y empaquetado en formato ONNX para la libreria phoonnx. El modelo original procede de Rhasspy, concretamente de la coleccion piper-voices en la ruta en_US/lessac/medium, y Phoonnx lo redistribuye adaptado para su ecosistema de inferencia TTS en Python y en el asistente OVOS. Su funcion es convertir texto en ingles estadounidense en audio inteligible, usando fonemas generados por espeak-ng como representacion intermedia de entrada.

El modelo resuelve el problema de disponer de una voz TTS ligera, de tamano reducido (el repositorio ocupa aproximadamente 0,1 GB) y ejecutable en CPU mediante ONNX Runtime, sin necesidad de GPUs dedicadas. Esto lo hace adecuado para asistentes de voz locales, sistemas embebidos y aplicaciones de privacidad estricta donde no se quiere enviar texto a servicios en la nube.

Es relevante ahora porque encaja en el ecosistema OVOS (Open Voice OS) y en la cadena de herramientas de TigreGotico (phoonnx, scriptconv, phoonnx.js), que permite desplegar sintesis de voz tanto en servidor como en navegador. La licencia MIT del proyecto upstream facilita su integracion comercial, aunque el modelo en si es una voz concreta dentro de un catalogo mayor de voces Piper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; el modelo se distribuye como artefacto ONNX empaquetado) |
| Idiomas soportados | en (ingles estadounidense, en-US) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz end-to-end que combina un encoder de texto basado en transformers, un prior variacional condicionado por alineamientos monotonos (MAS, Monotonic Alignment Search), un decoder generativo y un discriminador adversarial entrenado con perdidas GAN. El resultado es un modelo que genera formas de onda directamente a partir de fonemas, sin necesidad de un vocoder separado en tiempo de inferencia.

En este caso, el modelo no ha sido entrenado por Phoonnx, sino que procede de Rhasspy (proyecto piper-voices) y se ha reempaquetado para phoonnx. El front-end de texto utiliza espeak-ng para convertir el texto en fonemas IPA; phoonnx delega esta conversion en scriptconv mediante EspeakPhonemizer. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o fine-tuning adicional, por lo que estos datos se consideran no disponibles. La innovacion principal del empaquetado es la integracion con el gestor de modelos de phoonnx y su plugin para OVOS, que permite seleccionar la voz mediante configuracion JSON.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense (en-US).
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas espeak (alfabeto IPA), lo que requiere espeak-ng instalado o el extra `phoonnx[espeak]`.
- Integracion con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecucion en navegador a traves de phoonnx.js (con entrada espeak o unicode), con demo en tigregotico.pt/demo.
- No soporta tool calling, agentes, razonamiento multi-paso ni vision; es exclusivamente un modelo TTS.
- No dispone de modo thinking ni capacidades multimodales mas alla del audio de salida.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS y permite que un asistente domestico genere respuestas habladas sin conexion a internet, usando la configuracion `ovos-tts-plugin-phoonnx` con la voz `piper/en_US-lessac-medium`.
- Lectura de notificaciones y alertas en sistemas embebidos: al ser un modelo ONNX ligero (repo de 0,1 GB), puede ejecutarse en dispositivos de recursos limitados para convertir mensajes de texto en audio.
- Accesibilidad para personas con discapacidad visual: lectura de contenido web o de documentos en ingles mediante un pipeline que normalice el texto con scriptconv y lo sintetice con phoonnx.
- Generacion de audio para pruebas automatizadas: en pipelines de CI/CD se puede usar para producir locuciones de prueba y validar sistemas de reconocimiento de voz o de dialogos.
- Prototipado rapido de interfaces conversacionales: desarrolladores que necesiten una voz TTS en ingles sin depender de APIs cloud pueden usar este modelo con `pip install --pre phoonnx` y el gestor de modelos.
- Síntesis en el navegador: mediante phoonnx.js se puede generar voz en el cliente para aplicaciones web que requieran privacidad o funcionamiento offline, usando la demo como referencia.
- Educacion y aprendizaje de idiomas: generacion de pronunciaciones de frases en ingles para materiales didacticos, con la salvedad de que la calidad depende de la fonemizacion de espeak-ng.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de aproximadamente 0,1 GB, es probable que quepa en memoria de CPU y en GPUs de gama baja, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no disponibles; el modelo esta disenado para ejecucion en CPU mediante ONNX Runtime.
- Compatibilidad con GPU consumer: no se especifica, pero por tamano deberia caber en cualquier GPU consumer moderna; sin datos oficiales.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS, phoonnx.js para navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-en_us-lessac-medium (este) | no disponible | no aplica | no disponible | MIT | Hugging Face (Phoonnx) |
| Otras voces Piper en rhasspy/piper-voices | no disponible | no aplica | no disponible | MIT (segun upstream) | Hugging Face |
| Otras voces VITS en la coleccion Phoonnx | no disponible | no aplica | no disponible | MIT (segun upstream) | Hugging Face |
| Alternativas TTS comerciales (p. ej. servicios cloud) | no disponible | no aplica | no disponible | Propietaria | APIs cloud |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a aspectos de licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta ingles estadounidense (en-US); no es multilingue.
- La calidad de sintesis depende de la fonemizacion de espeak-ng; con espyak (alternativa incluida en el extra) algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Requiere instalar espeak-ng o el extra `phoonnx[espeak]` para el front-end de texto.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero puede producir pronunciaciones incorrectas o audio de baja calidad en textos complejos.
- Licencia MIT declarada por el upstream; se recomienda verificar los terminos de rhasspy/piper-voices para uso comercial, aunque la model card indica MIT.
- El modelo tiene pocas descargas (28) y 0 likes en el momento de la consulta, lo que sugiere poca validacion comunitaria.
- No se proporcionan datos sobre sesgos, latencia ni throughput, lo que limita la evaluacion para produccion a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-lessac-medium
- Upstream (Rhasspy piper-voices): https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
