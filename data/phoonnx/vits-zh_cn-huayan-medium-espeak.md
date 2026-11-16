# Phoonnx/vits-zh_cn-huayan-medium-espeak

## Resumen

vits-zh_cn-huayan-medium-espeak es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS para mandarín (zh-CN), empaquetado por Phoonnx a partir de la voz original `zh_CN-huayan-medium` del proyecto Rhasspy Piper. No se trata de un modelo entrenado por Phoonnx, sino de una redistribución en formato ONNX pensada para ejecutarse con la librería homónima `phoonnx`, orientada a entornos de asistente de voz (OVOS) y aplicaciones ligeras en Python.

El modelo usa la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un sistema condicional de extremo a extremo que combina un codificador de texto, un prior normalizing flow y un decodificador vocacional sobre un GAN, con lo que evita pipelines separados de alineamiento y vocoder. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con los modelos Piper de calidad "medium", lo que lo hace adecuado para inferencia en CPU y dispositivos con recursos limitados.

La entrada del modelo no es texto plano sino fonemas generados por espeak-ng (alfabeto IPA), procesados por la librería `scriptconv` de Phoonnx. Esto condiciona su integración: no basta con pasar una cadena de texto, sino que se requiere un front-end fonemizador. La licencia es MIT, lo que facilita su uso comercial, y el modelo está publicado en Hugging Face con cero descargas y cero likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech de extremo a extremo con normalizing flow y GAN) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantización | no disponible (pesos ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | zh-CN (mandarín) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak (alfabeto IPA) |
| Tamaño del repositorio | ~0,1 GB |
| Librería de ejecución | phoonnx |
| Origen (upstream) | rhasspy/piper-voices/zh/zh_CN/huayan/medium |
| Autor del modelo original | Rhasspy |

## Arquitectura y entrenamiento

VITS es un modelo de síntesis de voz condicional de extremo a extremo que integra en un único sistema el codificador de texto, un prior normalizing flow para modelar la variabilidad de duración y prosodia, un decodificador basado en HiFi-GAN y un discriminador adversarial entrenado de forma conjunta. Este diseño elimina la necesidad de alinear explícitamente texto y audio durante la inferencia y permite generar waveforms de forma directa a partir de la secuencia de fonemas.

El modelo procede de la voz `zh_CN-huayan-medium` de Rhasspy Piper, entrenada por Rhasspy con datos de voz en mandarín; no se dispone de información sobre el número de horas de audio, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional, ya que la model card de Phoonnx no los detalla. La innovación relevante en este empaquetado es la conversión a ONNX y la integración con el front-end `scriptconv`, que normaliza el texto y lo convierte en fonemas IPA mediante `EspeakPhonemizer`, además del soporte en OVOS como plugin `ovos-tts-plugin-phoonnx` y en navegador mediante `phoonnx.js`.

## Capacidades

- Síntesis de voz en mandarín (zh-CN) a partir de fonemas espeak en alfabeto IPA.
- Generación de audio WAV de forma directa mediante la API `voice.synthesize_wav`.
- Ejecución en Python a través de `phoonnx` y en el ecosistema OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador mediante `phoonnx.js`, con entrada espeak o Unicode.
- Normalización y conversión de texto a fonemas mediante `scriptconv` (`EspeakPhonemizer`).
- No soporta tool calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo TTS.
- No soporta visión, audio de entrada ni modo de razonamiento (thinking mode).

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS seleccionándolo en `mycroft.conf` con la voz `piper/zh_CN-huayan-medium`, lo que permite respuestas habladas en mandarín dentro de un asistente doméstico autoalojado.
- Síntesis en aplicaciones Python de escritorio: mediante `TTSModelManager` y `voice.synthesize_wav` se puede generar audio a un fichero WAV para lectores de pantalla o interfaces de accesibilidad en chino.
- Síntesis en navegador: `phoonnx.js` permite ejecutar la voz en el cliente con entrada espeak o Unicode, útil para aplicaciones web que necesitan TTS sin depender de un servidor.
- Lectura de contenido en mandarín a bajo coste: al tratarse de un modelo "medium" de ~0,1 GB, es viable en dispositivos con CPU modesta para leer artículos, notificaciones o mensajes.
- Pruebas y prototipado de pipelines TTS: sirve como referencia para evaluar el front-end `scriptconv` y `EspeakPhonemizer` antes de escalar a otras voces de la colección VITS de Phoonnx.
- Integración en sistemas embebidos o de bajo consumo: el formato ONNX y el tamaño reducido permiten desplegarlo en entornos sin GPU dedicada, siempre que se instale espeak-ng.
- Generación de avisos hablados en aplicaciones de domótica o kioscos: el modelo puede sintetizar frases cortas en mandarín bajo demanda para notificaciones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (~0,1 GB) cabe holgadamente en memoria de CPU.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante ONNX.
- Cabe en GPU consumer: sí, con un consumo de memoria muy reducido, aunque no se ha publicado una cifra concreta.
- Opciones de despliegue: `phoonnx` (Python), `ovos-tts-plugin-phoonnx` (OVOS), `phoonnx.js` (navegador).
- Requisito adicional: espeak-ng instalado (o el extra `phoonnx[espeak]` con el port espyak; el autor advierte que algunos fonemas de espyak difieren de espeak-ng y pueden pronunciar mal ciertas palabras).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de parámetros de este modelo, por lo que la comparación cuantitativa no es posible. A nivel cualitativo:

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vits-zh_cn-huayan-medium-espeak (este) | VITS | zh-CN | MIT | ONNX | Empaquetado Phoonnx, entrada por fonemas espeak |
| Otras voces Piper `zh_CN` (rhasspy/piper-voices) | VITS | zh-CN | MIT (según upstream) | ONNX | Mismo origen; este modelo es una redistribución de una de ellas |
| Otras voces de la colección VITS de Phoonnx | VITS | varios | MIT | ONNX | Mismo pipeline de ejecución y front-end |

No se dispone de información sobre modelos comparables de otros autores con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo sintetiza voz en mandarín (zh-CN); no soporta otros idiomas.
- Requiere un front-end de fonemización espeak-ng; sin él no funciona. Con el port espyak pueden producirse errores de pronunciación en algunas palabras, según advierte el autor.
- El modelo está empaquetado a partir de una voz de Rhasspy y no ha sido entrenado por Phoonnx; la calidad depende del modelo upstream `zh_CN-huayan-medium`.
- No se dispone de información sobre sesgos del dataset de entrenamiento original, por lo que no se pueden evaluar sesgos de género, acento o registro.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producirse una prosodia o pronunciación incorrecta en frases fuera de dominio o con caracteres poco frecuentes.
- No hay datos publicados de latencia, throughput ni calidad perceptual (MOS) en la información disponible.
- La licencia MIT la declara el upstream en la model card de rhasspy/piper-voices; conviene verificar la procedencia de los datos de voz originales antes de un uso comercial a gran escala.
- El repositorio tiene cero descargas y cero likes, lo que indica que no hay validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-zh_cn-huayan-medium-espeak
- Modelo upstream (Piper voices): https://huggingface.co/rhasspy/piper-voices/tree/main/zh/zh_CN/huayan/medium
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en vivo de phoonnx.js: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
