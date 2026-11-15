# Phoonnx/vits-de_de-ramona-low

## Resumen

vits-de_de-ramona-low es un modelo de sintesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por Rhasspy dentro del proyecto Piper y empaquetado por Phoonnx para su libreria de inferencia ONNX. El modelo convierte texto en aleman (variedad de_DE) en audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Se distribuye en formato ONNX y esta pensado para sintesis local, ligera y de baja latencia.

La relevancia de este modelo radica en su caracter practico: es una voz "low" (calidad reducida, pensada para eficiencia), con un repositorio de apenas 0,1 GB, lo que permite ejecutarla en entornos con recursos limitados, incluidos dispositivos embebidos o navegadores. Forma parte del ecosistema OVOS/Mycroft mediante el plugin `ovos-tts-plugin-phoonnx`, y del ecosistema Piper, ampliamente usado en asistentes de voz de codigo abierto.

No se dispone de informacion sobre el numero de parametros, el contexto (no aplica en TTS) ni los datos exactos de entrenamiento en la informacion proporcionada. La ficha se limita a los datos documentados en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference for end-to-end text-to-speech) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; variante "low") |
| Idiomas soportados | aleman (de-DE) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Autor original (upstream) | Rhasspy (piper-voices) |
| Empaquetado por | Phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de sintesis de voz que combina un encoder de texto, un prior variacional, un decoder generativo basado en flujos normalizantes y un discriminador adversarial en entrenamiento, junto con un decoder de duraciones. El resultado es un modelo que genera audio directamente desde fonemas sin necesidad de un vocoder separado en inferencia. Esta variante concreta es la version "low" de la voz Ramona de Piper, lo que implica una configuracion reducida de capacidad y tamano frente a las variantes "medium" o "high" del mismo proyecto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o ajuste fino especifico. El modelo toma fonemas espeak-ng como entrada, por lo que el front-end de texto (normalizacion y fonemizacion) se delega a `scriptconv` y a espeak-ng. El empaquetado para phoonnx no modifica los pesos originales, sino que los adapta al formato y a la API de la libreria.

## Capacidades

- Sintesis de voz en aleman (de_DE) a partir de texto plano.
- Generacion de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Entrada basada en fonemas espeak-ng (IPA), con normalizacion de texto previa mediante `scriptconv`.
- Integracion con asistentes de voz OVOS/Mycroft a traves del plugin `ovos-tts-plugin-phoonnx`.
- Ejecucion en navegador mediante phoonnx.js, con demo en tigregotico.pt/demo.
- Inferencia local en CPU/GPU sin dependencia de servicios en la nube.
- No soporta tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso (es un modelo TTS puro).
- Capacidad multilingue limitada al aleman; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en aleman: integracion en OVOS/Mycroft mediante el plugin oficial para dar respuestas habladas en un asistente domestico sin conexion, aprovechando el tamano reducido del modelo (0,1 GB).
- Lectura de notificaciones y alertas en sistemas embebidos: el modelo cabe en dispositivos con poca memoria y permite sintetizar mensajes cortos en tiempo real en una Raspberry Pi u hardware similar.
- Accesibilidad para personas con discapacidad visual: lectura de textos de interfaz, documentos o mensajes en aleman en aplicaciones de escritorio o moviles con requisitos de recursos bajos.
- Sintesis en navegador: uso de phoonnx.js para generar audio en el cliente sin enviar texto a un servidor, util en aplicaciones web con requisitos de privacidad.
- Generacion de locuciones para prototipos y demos: la variante "low" es adecuada para iteracion rapida en desarrollo, donde prima la velocidad sobre la fidelidad de la voz.
- Automatizacion de avisos en entornos industriales o de domotica: mensajes de estado y alarmas en aleman con latencia baja y sin dependencia de red.
- Pruebas de pipelines TTS en investigacion: como referencia ligera de VITS para comparar calidad, latencia y consumo frente a variantes de mayor capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, RTF) ni comparaciones cuantitativas con otras voces.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y cabe holgadamente en GPUs de gama baja y en CPU.
- GPU recomendadas: cualquier GPU con al menos unos pocos cientos de MB de memoria libre; no se especifican modelos concretos. A100 o H100 no son necesarias para esta variante "low".
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (por ejemplo, GTX 1050 o superior) e incluso en CPU.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), OVOS/Mycroft con `ovos-tts-plugin-phoonnx`. No se documenta soporte directo para vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos TTS de este tipo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| vits-de_de-ramona-low (este) | VITS | de-DE | 0,1 GB (repo) | MIT | ONNX | Variante "low" de Piper, empaquetada para phoonnx |
| Otras voces Piper de_DE (medium/high) | VITS | de-DE | mayor que "low" | MIT (segun upstream) | ONNX | Misma familia, mayor calidad a costa de tamano |
| Modelos TTS multilingues (p. ej. familia XTTS) | no disponible | varios | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos cuantitativos de rendimiento para establecer una comparativa numerica con alternativas.

## Limitaciones y advertencias

- Calidad de voz reducida por tratarse de la variante "low" de Piper; puede presentar artefactos y menor naturalidad que las variantes medium o high.
- Dependencia de espeak-ng para la fonemizacion; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- Solo soporta aleman (de-DE); no es multilingue.
- Riesgo de pronunciacion incorrecta en palabras extranas, siglas, numeros o nombres propios no cubiertos por la normalizacion de `scriptconv`.
- No apta para clonacion de voz ni para control de estilo o emocion.
- Licencia MIT segun la model card upstream; conviene verificar los terminos de la licencia en el repositorio original de rhasspy/piper-voices antes de uso comercial.
- No se documentan sesgos especificos, pero al derivar de un dataset de voz concreto puede reflejar las caracteristicas del hablante y del corpus original.
- El modelo tiene muy poca traccion en Hugging Face (27 descargas, 0 likes), lo que limita la validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-de_de-ramona-low
- Upstream (Piper, voz Ramona low): https://huggingface.co/rhasspy/piper-voices/tree/main/de/de_DE/ramona/low
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Coleccion VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
