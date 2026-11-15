# Phoonnx/vits-zh_tw-yt_female

## Resumen

vits-zh_tw-yt_female es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, desarrollado originalmente por el usuario colafly y empaquetado por Phoonnx para su librería de inferencia ONNX homónima. El modelo convierte texto en mandarín taiwanés (`zh-TW`) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su origen es el modelo `colafly/piper_zh_tw`, adaptado al ecosistema phoonnx.

El modelo resuelve el problema de la síntesis de voz local y ligera para una variante lingüística concreta del chino: el mandarín de Taiwán, con una voz femenina. Al distribuirse como ONNX dentro de un repositorio de apenas 0,1 GB, está pensado para despliegues en entornos con recursos limitados, incluidos dispositivos de borde y asistentes de voz integrados.

Su relevancia actual radica en su integración con el stack de asistentes de voz OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`, además de su disponibilidad en el navegador a través de phoonnx.js. La licencia MIT facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | chino mandarín de Taiwán (`zh-TW`) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema de síntesis de voz de extremo a extremo que combina un codificador variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial para el entrenamiento. VITS genera audio de forma directa a partir de fonemas, sin necesidad de un modelo acústico y un vocoder separados, lo que reduce la latencia y simplifica el despliegue.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus ni si se aplicaron técnicas de ajuste como RLHF o DPO. El modelo deriva del trabajo original de colafly en `colafly/piper_zh_tw`, del que se ha empaquetado la versión ONNX para phoonnx. La entrada de texto se procesa mediante espeak-ng para obtener fonemas IPA, y la normalización textual corre a cargo de la librería scriptconv.

## Capacidades

- Síntesis de voz a partir de texto en mandarín taiwanés (`zh-TW`) con voz femenina.
- Generación de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Conversión de texto a fonemas IPA mediante espeak-ng, con soporte opcional del port espyak.
- Integración como plugin de TTS en asistentes OVOS mediante `ovos-tts-plugin-phoonnx`.
- Ejecución en navegador a través de phoonnx.js, con entrada espeak o Unicode.
- No soporta tool calling, agentes, razonamiento multi-paso ni visión; es un modelo exclusivamente de síntesis de voz.
- Capacidad monolingüe: únicamente `zh-TW`.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra mediante el plugin `ovos-tts-plugin-phoonnx` y se selecciona en `mycroft.conf`, permitiendo respuestas habladas en mandarín taiwanés sin depender de servicios en la nube.
- Síntesis de voz en el navegador: gracias a phoonnx.js, permite generar audio en aplicaciones web para usuarios de Taiwán sin enviar texto a servidores externos, con la consiguiente mejora de privacidad.
- Lectura de contenido en aplicaciones educativas: conversión de textos en mandarín taiwanés a audio para materiales de aprendizaje de idiomas o lectores de pantalla.
- Sistemas de megafonía y avisos automatizados: generación de anuncios pregrabados o dinámicos en `zh-TW` para entornos con recursos de cómputo limitados, dado el reducido tamaño del modelo (0,1 GB).
- Prototipado rápido de interfaces de voz: la instalación mediante `pip install --pre phoonnx` y la API de `TTSModelManager` permiten integrar TTS en pocas líneas de código para pruebas de concepto.
- Despliegue en dispositivos de borde: el formato ONNX y el tamaño reducido facilitan la ejecución en hardware modesto, como Raspberry Pi u otros dispositivos con CPU, para aplicaciones de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio (0,1 GB) sugiere que el modelo puede ejecutarse en CPU sin necesidad de GPU dedicada.
- GPU recomendadas: no se especifican; por el tamaño del modelo, cualquier GPU consumer moderna sería suficiente, aunque no hay datos oficiales.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el reducido tamaño, aunque no se confirma en la documentación.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y phoonnx.js para navegador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Contexto |
|---|---|---|---|---|---|
| vits-zh_tw-yt_female (este) | VITS | zh-TW | MIT | ONNX | no aplica |
| colafly/piper_zh_tw (upstream) | VITS | zh-TW | no disponible | no disponible | no aplica |
| Otros modelos de la colección VITS de Phoonnx | VITS | variable | MIT (segun coleccion) | ONNX | no aplica |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo sintetiza mandarín taiwanés (`zh-TW`); no admite otros idiomas ni variantes del chino.
- Dependencia de espeak-ng: la calidad de la fonemización afecta directamente a la pronunciación; el uso del port espyak puede provocar errores en algunas palabras, según advierte la model card.
- Voz única: solo ofrece una voz femenina, sin opciones de selección de hablante.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un corpus de YouTube (según el nombre `yt`), podría reflejar características del habla presentes en dicho material.
- Riesgo de alucinación: no aplica en el sentido habitual de modelos generativos de texto; el riesgo se limita a errores de pronunciación o prosodia.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución.
- Caveats para producción: no se han publicado métricas objetivas de calidad (MOS, WER) ni benchmarks; se recomienda evaluar la inteligibilidad y naturalidad en el dominio de aplicación antes de desplegar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Phoonnx/vits-zh_tw-yt_female)
- [Modelo upstream colafly/piper_zh_tw](https://huggingface.co/colafly/piper_zh_tw)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo de phoonnx.js](https://tigregotico.pt/demo)
- [Colección VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
