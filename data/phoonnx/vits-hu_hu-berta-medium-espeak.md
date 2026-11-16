# Phoonnx/vits-hu_hu-berta-medium-espeak

## Resumen

`vits-hu_hu-berta-medium-espeak` es un modelo de sintesis de voz (text-to-speech) de la familia VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en hungaro (`hu-HU`) a audio inteligible, tomando como entrada fonemas en alfabeto IPA generados mediante espeak-ng. Su relevancia radica en que es un modelo compacto (repo de 0,1 GB) y ligero, pensado para ejecucion local en entornos con recursos limitados, como asistentes de voz embebidos o sistemas domoticos.

El modelo no es un LLM ni un modelo multimodal: es un sintetizador acustico puro. Su utilidad esta en pipelines de voz completos (ASR + LLM + TTS) donde se necesita generar respuestas habladas en hungaro con baja latencia y sin dependencia de servicios en la nube. El empaquetado para phoonnx facilita su integracion tanto en Python como en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`.

La licencia MIT y el formato ONNX lo hacen atractivo para despliegues comerciales y para correr en CPU. No obstante, la informacion publica disponible es muy limitada: no hay datos de entrenamiento, benchmarks ni especificaciones detalladas mas alla de la arquitectura VITS y el idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | hungaro (`hu-HU`) |
| Licencia | MIT |
| Formato de pesos | ONNX (empaquetado para la libreria phoonnx) |

## Arquitectura y entrenamiento

VITS es una arquitectura de sintesis de voz extremo a extremo que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizadores y un discriminador adversarial multi-periodo para el entrenamiento. Genera directamente la forma de onda, evitando la necesidad de un vocoder separado. En este caso, la entrada no es texto crudo sino fonemas IPA producidos por espeak-ng, lo que simplifica el front-end linguistico y hace el modelo dependiente de la calidad de la fonemizacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el corpus de audio utilizado (horas, hablantes, calidad de grabacion) ni sobre si se aplicaron tecnicas de RLHF o ajuste fino. El modelo procede del repositorio `rhasspy/piper-voices` en la ruta `hu/hu_HU/berta/medium`, lo que sugiere que fue entrenado con la pipeline de Piper, pero los detalles concretos no estan publicados en la informacion disponible. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Sintesis de voz (text-to-speech) en hungaro a partir de texto plano.
- Conversion de texto a fonemas IPA mediante espeak-ng (a traves de `scriptconv`), con normalizacion de texto previa.
- Generacion de audio en formato WAV mediante la API de phoonnx (`synthesize_wav`).
- Integracion con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No soporta vision, audio de entrada ni modo "thinking".
- Capacidad multilingue limitada exclusivamente al hungaro.

## Casos de uso

- Asistentes de voz locales en hungaro: el modelo puede integrarse en OVOS para generar respuestas habladas en un asistente domestico sin conexion a internet, gracias a su tamano reducido y su formato ONNX optimizado para CPU.
- Lectura de notificaciones y alertas: en sistemas de domotica o monitorizacion, el modelo puede convertir mensajes de texto en audio para anuncios por altavoz, con latencia baja al ejecutarse localmente.
- Accesibilidad para personas con discapacidad visual: lectura de contenido textual (articulos, correos, interfaces) en hungaro mediante un pipeline que normalice el texto y lo sintetice con espeak-ng como front-end.
- Generacion de audiolibros o contenido narrado: para volumenes moderados de texto hungaro, el modelo permite producir audio de forma automatizada y sin coste por caracter, aunque la calidad "medium" puede requerir revision.
- Prototipado de interfaces conversacionales: desarrolladores que construyen un pipeline ASR + LLM + TTS en hungaro pueden usar este modelo como componente TTS ligero durante la fase de desarrollo antes de invertir en un modelo de mayor calidad.
- Pruebas de integracion en navegador: mediante phoonnx.js, el modelo puede ejecutarse en el cliente para demos de sintesis de voz en hungaro sin backend, util para aplicaciones web educativas o de accesibilidad.
- Generacion de avisos en sistemas de transporte o industria: anuncios pregrabados dinamicamente en hungaro para paneles informativos, donde la variabilidad del texto impide usar clips estaticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio ocupa 0,1 GB, por lo que la huella en memoria es muy reducida y probablemente inferior a 1 GB en la mayoria de configuraciones.
- GPU recomendadas: al ser un modelo ONNX de VITS de tamano "medium", puede ejecutarse en CPU sin GPU dedicada; en GPU, cualquier tarjeta moderna (RTX 3060, RTX 4090, A100, H100) es sobradamente suficiente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU y en dispositivos embebidos (Raspberry Pi, segun la tradicion de Piper).
- Opciones de despliegue: phoonnx (Python), `ovos-tts-plugin-phoonnx` (OVOS), phoonnx.js (navegador). No se documenta soporte directo para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-hu_hu-berta-medium-espeak (este modelo) | VITS | hu-HU | no aplica | MIT | ONNX | Hugging Face, phoonnx, OVOS |
| Piper hu_HU otras voces (upstream rhasspy/piper-voices) | VITS | hu-HU | no aplica | MIT (segun upstream) | ONNX | Hugging Face |
| Coqui TTS (modelos multilingues) | VITS / Tacotron2 | varios | no aplica | MPL-2.0 / otras | varios | GitHub, Hugging Face |
| Bark (Suno) | Transformer generativo | multilingue | no aplica | MIT | PyTorch | Hugging Face |

La comparacion detallada de calidad, latencia y MOS no esta disponible en la informacion proporcionada. Frente a Piper upstream, este modelo es esencialmente el mismo artefacto empaquetado para phoonnx; frente a Coqui TTS o Bark, la diferencia principal es el enfoque en calidad "medium" y el menor coste computacional, a cambio de menor expresividad y cobertura linguistica.

## Limitaciones y advertencias

- Solo soporta hungaro (`hu-HU`); cualquier otro idioma producira resultados incorrectos o ininteligibles.
- Depende de espeak-ng para la fonemizacion; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, segun advierte el autor.
- La calidad es "medium" segun la ruta upstream; no se han publicado metricas objetivas (MOS, WER de sintesis) que la cuantifiquen.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con un corpus desconocido, puede reflejar sesgos de acento, genero o estilo del dataset original.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si puede producir prosodia incorrecta o pronunciaciones erroneas en palabras fuera de dominio o nombres propios.
- La licencia MIT permite uso comercial, pero el autor remite a la declaracion de licencia del repositorio upstream (`rhasspy/piper-voices`); conviene verificar la cadena de licencias antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 0 likes, lo que indica nula validacion por parte de la comunidad; no hay evidencia publica de calidad en produccion.
- No hay informacion sobre el corpus de entrenamiento, lo que impide evaluar cobertura de vocabulario, calidad de grabacion o diversidad de hablantes.
- La fecha de creacion (2026-11-16) es futura respecto a la mayoria de referencias, lo que puede indicar un empaquetado reciente sin rodaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hu_hu-berta-medium-espeak
- Upstream (Piper voices, hu_HU/berta/medium): https://huggingface.co/rhasspy/piper-voices/tree/main/hu/hu_HU/berta/medium
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js (navegador): https://github.com/TigreGotico/phoonnx.js
- Demo en vivo: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
