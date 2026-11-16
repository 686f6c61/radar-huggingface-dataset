# Phoonnx/vits-hi_in-rohan-medium-espeak

## Resumen

`vits-hi_in-rohan-medium-espeak` es un modelo de síntesis de voz (text-to-speech) de arquitectura VITS, empaquetado por Phoonnx para su librería ONNX de inferencia TTS. El modelo original procede del proyecto Piper de Rhasspy, concretamente de la voz `hi_IN/rohan/medium`, y ha sido reempaquetado para integrarse en el ecosistema phoonnx, que lo ejecuta tanto en Python como en el asistente OVOS.

El modelo convierte texto en hindi (hi-IN) a audio, tomando como entrada fonemas generados por espeak-ng en alfabeto IPA. Su relevancia radica en que ofrece una voz en hindi lista para desplegar en entornos ONNX ligeros y en asistentes de voz open source, con licencia MIT y un tamaño de repositorio de 0,1 GB que facilita su distribución e integración en dispositivos con recursos limitados.

No se dispone de información sobre el número de parámetros, la longitud de contexto ni los datos de entrenamiento originales en la documentación proporcionada. La ficha se limita a los datos publicados en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | hindi (hi-IN) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un discriminador adversarial durante el entrenamiento. VITS produce audio de forma directa a partir de la secuencia de fonemas, sin necesidad de un vocoder separado en la inferencia.

El modelo original fue entrenado por Rhasspy dentro del proyecto Piper y distribuido en `rhasspy/piper-voices/hi/hi_IN/rohan/medium`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. La variante empaquetada por Phoonnx se distribuye en formato ONNX para su ejecución con la librería phoonnx, que se encarga de la normalización de texto mediante `scriptconv` y de la fonemización con `espeak-ng`.

## Capacidades

- Síntesis de voz a partir de texto en hindi (hi-IN).
- Conversión de texto a fonemas IPA mediante espeak-ng antes de la síntesis.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración como plugin TTS en el asistente OVOS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (es un modelo TTS, no un LLM).
- No dispone de capacidades de visión, audio de entrada ni modo thinking.

## Casos de uso

- Asistente de voz en hindi para OVOS: el modelo se integra como plugin TTS mediante `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper/hi_IN-rohan-medium` en `mycroft.conf`, permitiendo respuestas habladas en hindi en un asistente doméstico open source.
- Lectura de contenido en hindi en aplicaciones web: mediante phoonnx.js se puede sintetizar texto en el navegador sin backend, usando la entrada espeak o unicode, lo que facilita la accesibilidad de contenido en hindi.
- Generación de audiolibros o avisos pregrabados en hindi: la API de Python permite sintetizar frases a WAV para su uso en pipelines de producción de audio, con un modelo de 0,1 GB fácil de distribuir.
- Sistemas de anuncios públicos o kioscos en hindi: el modelo ONNX ligero puede ejecutarse en dispositivos con recursos limitados para generar anuncios hablados a partir de texto dinámico.
- Prototipado de interfaces de voz en hindi: investigadores pueden usar la voz para experimentar con TTS en hindi sin depender de servicios en la nube, gracias a la licencia MIT y al formato ONNX.
- Integración en aplicaciones de aprendizaje de idiomas: el modelo puede generar pronunciaciones en hindi a partir de texto para ejercicios de escucha, usando la fonemización espeak-ng para controlar la pronunciación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,1 GB, por lo que el modelo es muy ligero y probablemente quepa en GPU consumer de gama baja, aunque no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible; por el tamaño del repositorio (0,1 GB) es plausible que funcione en GPUs de gama baja, pero no se confirma.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formato | Tamano repo |
|---|---|---|---|---|---|
| vits-hi_in-rohan-medium-espeak (este) | VITS | hi-IN | MIT | ONNX | 0,1 GB |
| Otras voces Piper de Rhasspy | VITS | varios | MIT (segun upstream) | ONNX | variable |
| Otros modelos VITS empaquetados por Phoonnx | VITS | varios | MIT (segun upstream) | ONNX | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta hindi (hi-IN); no es multilingüe.
- La fonemización depende de espeak-ng; si se usa el port espyak, algunos fonemas difieren y el modelo puede pronunciar mal algunas palabras.
- No se dispone de información sobre sesgos, riesgo de alucinación ni limitaciones de contexto, al ser un modelo TTS y no un LLM.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia upstream en `rhasspy/piper-voices`.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica poca validación por parte de la comunidad.
- No se han publicado benchmarks ni evaluaciones de calidad de audio en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-hi_in-rohan-medium-espeak
- Upstream Piper: https://huggingface.co/rhasspy/piper-voices/tree/main/hi/hi_IN/rohan/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo phoonnx.js: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
