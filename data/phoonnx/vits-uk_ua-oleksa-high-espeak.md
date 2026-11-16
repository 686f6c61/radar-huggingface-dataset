# Phoonnx/vits-uk_ua-oleksa-high-espeak

## Resumen

vits-uk_ua-oleksa-high-espeak es un modelo de síntesis de voz (text-to-speech) de tipo VITS para ucraniano (uk-UA), empaquetado por Phoonnx en formato ONNX para su uso con la librería phoonnx. El modelo original procede de Rhasspy, concretamente de la voz `uk/uk_UA/oleksa/high` del repositorio piper-voices, y Phoonnx se limita a redistribuirlo y adaptarlo a su ecosistema de inferencia. La autoría del modelo subyacente corresponde a Rhasspy; Phoonnx actúa como empaquetador.

La relevancia de esta ficha es limitada en términos de innovación técnica: se trata de una voz Piper de calidad "high" para un idioma concreto, con una huella de 0,1 GB y licencia MIT. No hay datos publicados sobre el número de parámetros, el dataset de entrenamiento ni resultados de benchmarks. Su interés práctico reside en la integración con phoonnx y OVOS (Open Voice OS) para asistentes de voz locales, y en la disponibilidad de un pipeline ONNX que puede ejecutarse sin GPU dedicada.

El modelo acepta texto en ucraniano y lo convierte a fonemas mediante espeak-ng (o su port espyak), por lo que la calidad de pronunciación depende de la correcta instalación del fonemizador. No soporta otros idiomas ni tareas distintas a la síntesis de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada de texto, no contexto de tokens) |
| Tipos de cuantizacion | no disponible (pesos ONNX empaquetados; no se documentan variantes) |
| Idiomas soportados | ucraniano (uk-UA) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech) es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial en entrenamiento. No se dispone de información sobre el número de parámetros, la composición del dataset, el número de horas de audio ni si hubo ajuste fino adicional en esta versión empaquetada.

El modelo original fue entrenado por Rhasspy dentro del proyecto Piper y se distribuye en la ruta `uk/uk_UA/oleksa/high`, lo que indica una voz masculina (oleksa) de calidad alta según la nomenclatura de Piper. Phoonnx no documenta innovaciones técnicas adicionales: el empaquetado consiste en exportar los pesos a ONNX y adaptar la interfaz de inferencia. El front-end de texto se delega en la librería scriptconv, que normaliza el texto y lo convierte a fonemas espeak mediante `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`.

## Capacidades

- Síntesis de voz a partir de texto en ucraniano (uk-UA), con salida en formato WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng (o el port espyak incluido en el extra `phoonnx[espeak]`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en Python a través de `TTSModelManager` y la voz `piper/uk_UA-oleksa-high`.
- Ejecución en navegador mediante phoonnx.js, con demo en tigregotico.pt/demo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Multilingüismo: únicamente ucraniano; no se documentan otras lenguas.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite respuestas habladas en ucraniano sin depender de servicios en la nube, gracias a su formato ONNX y su tamaño reducido (0,1 GB).
- Síntesis de voz en aplicaciones de escritorio o servidor en Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio a partir de texto en ucraniano dentro de un pipeline propio, sin GPU dedicada.
- Lectura de contenido en ucraniano para accesibilidad: conversión de artículos, notificaciones o documentos a audio para usuarios con discapacidad visual, usando la voz `oleksa` de calidad alta.
- Síntesis en el navegador: con phoonnx.js se puede generar voz en ucraniano del lado del cliente, útil para aplicaciones web que necesitan TTS sin backend.
- Generación de avisos y locuciones pregrabadas: producción por lotes de mensajes de voz en ucraniano para sistemas de megafonía, IVR o interfaces de voz embebidas.
- Prototipado de interfaces conversacionales en ucraniano: al ser un modelo MIT y ligero, sirve para validar flujos de voz antes de invertir en modelos comerciales o de mayor tamaño.
- Investigación en TTS para lenguas eslavas: como referencia Piper/VITS reproducible en ONNX, útil para comparativas de calidad y latencia en entornos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de 0,1 GB, es previsible que quepa en CPU y en GPUs de gama baja, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería poder ejecutarlo, pero no hay datos confirmados.
- ¿Cabe en consumer GPU? Sí, por el tamaño del repositorio (0,1 GB), aunque no se especifica el consumo exacto de memoria en inferencia.
- Opciones de despliegue: phoonnx (Python), phoonnx.js (navegador), plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS VITS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/vits-uk_ua-oleksa-high-espeak | VITS | uk-UA | 0,1 GB (repo) | MIT | ONNX | Voz Piper empaquetada para phoonnx |
| rhasspy/piper-voices (uk/uk_UA/oleksa/high) | VITS | uk-UA | no disponible | MIT (declarada en la model card upstream) | ONNX (Piper) | Modelo upstream del que deriva este |
| Otras voces Piper para otros idiomas | VITS | varios | variable | MIT (segun Piper) | ONNX | Misma familia, distinto idioma; no comparable en calidad para uk-UA |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas. La comparativa se limita a linaje y formato.

## Limitaciones y advertencias

- Solo soporta ucraniano (uk-UA); no es multilingüe.
- La calidad de pronunciación depende de espeak-ng: con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte la propia model card.
- No hay información publicada sobre sesgos, datos de entrenamiento ni evaluación de calidad subjetiva (MOS).
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí puede producir prosodia incorrecta o pronunciaciones erróneas en palabras fuera del dominio de entrenamiento.
- Licencia MIT declarada por el upstream; conviene verificar la model card original de rhasspy/piper-voices antes de uso comercial, ya que la cadena de licencias se hereda.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción.
- No se documentan requisitos de latencia ni límites de longitud de texto; el rendimiento en textos largos no está caracterizado.
- Dependencia de librerías externas (phoonnx en versión pre-release, scriptconv, espeak-ng) que pueden cambiar y romper la integración.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-uk_ua-oleksa-high-espeak
- Upstream (Piper voices, uk/uk_UA/oleksa/high): https://huggingface.co/rhasspy/piper-voices/tree/main/uk/uk_UA/oleksa/high
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
