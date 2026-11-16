# Phoonnx/vits-es_es-carlfm-high-espeak

## Resumen

vits-es_es-carlfm-high-espeak es un modelo de síntesis de voz (text-to-speech) en castellano de España, empaquetado por Phoonnx a partir del modelo original de friyin `friyin/vits-piper-es_ES-carlfm-high`. El modelo emplea la arquitectura VITS, un sistema generativo de extremo a extremo que combina un codificador de texto, un decodificador acústico y un vocoder en una única red entrenada de forma adversarial condicional, y se distribuye en formato ONNX para su ejecución con la librería phoonnx, orientada a entornos Python y al asistente de voz OVOS.

El modelo resuelve la conversión de texto a audio en español peninsular con una voz concreta (identificada como "carlfm" en el nombre del repositorio) y una calidad etiquetada como "high". Su entrada no es texto plano directamente, sino fonemas en alfabeto IPA generados por espeak-ng, lo que condiciona el pipeline: la normalización y fonemización del texto corre a cargo de la librería scriptconv, que produce la secuencia de fonemas que consume el modelo.

Es relevante por su carácter práctico: se trata de un empaquetado ligero (0,1 GB de repositorio) con licencia MIT, pensado para integrarse en asistentes de voz de código abierto como OVOS y en aplicaciones web mediante phoonnx.js. No es un modelo de propósito general ni compite en la categoría de los grandes TTS neuronales multilenguaje, sino una pieza de infraestructura de voz local, sin dependencia de servicios en la nube, para español de España.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech extremo a extremo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS; entrada por frase) |
| Tipos de cuantización | no disponible (distribución en ONNX) |
| Idiomas soportados | es-ES (español de España) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas espeak en alfabeto IPA |
| Tamaño del repositorio | 0,1 GB |
| Librería de ejecución | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS, un sistema de síntesis de voz condicional de extremo a extremo que integra en una sola red un codificador de texto, un prior variacional, un decodificador basado en flujos normalizadores y un decodificador de audio (vocoder) entrenado de forma adversarial. Esta integración permite generar la forma de onda directamente a partir de la secuencia de fonemas, sin un vocoder separado en tiempo de inferencia. El modelo se distribuye exportado a ONNX para su ejecución con phoonnx, lo que facilita el despliegue en CPU y en navegador mediante phoonnx.js.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo es un empaquetado del release original de friyin (`friyin/vits-piper-es_ES-carlfm-high`), que a su vez procede del ecosistema Piper; la model card no detalla el proceso de entrenamiento. La innovación destacable en este empaquetado es la integración del front-end de texto: phoonnx delega la normalización y la fonemización en scriptconv, usando el fonemizador `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`, instalable con el extra `scriptconv[espeak]`.

## Capacidades

- Síntesis de voz a partir de texto en español de España (es-ES), con salida en fichero WAV.
- Conversión de texto a fonemas IPA mediante espeak-ng o, alternativamente, mediante el port espyak incluido en el extra `phoonnx[espeak]`.
- Ejecución local en Python a través de la API `TTSModelManager` de phoonnx.
- Integración con el asistente de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- Ejecución en navegador con phoonnx.js, con entrada por espeak o por unicode, según la documentación del proyecto.
- No soporta tool calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- Capacidad multilingüe limitada al español de España; no se documentan otros idiomas.

## Casos de uso

- Asistente de voz local en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper_community/friyin/es-ES_friyin` en `mycroft.conf`, lo que permite dotar de voz en castellano a un asistente doméstico sin enviar texto a servicios externos.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav(text, wav_file)` se genera audio a fichero para audiolibros, avisos o contenido accesible, con una dependencia ligera (0,1 GB) y licencia MIT.
- Lectura de contenido web en el navegador: con phoonnx.js y la demo de tigregotico.pt se puede sintetizar texto en cliente para funciones de accesibilidad o lectura en voz alta sin backend.
- Generación de avisos y locuciones pregrabadas: al ser un modelo pequeño y determinista en su pipeline (texto → fonemas → audio), encaja en la producción por lotes de mensajes de voz para apps de transporte, comercio o atención telefónica en español de España.
- Prototipado de interfaces conversacionales: permite validar flujos de diálogo con voz real en castellano antes de contratar un TTS comercial, manteniendo la posibilidad de cambiar de voz dentro del ecosistema phoonnx.
- Sistemas de accesibilidad sin conexión: al ejecutarse en local con ONNX, es adecuado para entornos con conectividad limitada o requisitos de privacidad, donde el texto no debe salir del dispositivo.
- Investigación en TTS: sirve como referencia de un pipeline VITS empaquetado en ONNX con front-end espeak, útil para comparar fonemización y calidad frente a otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño del repositorio (0,1 GB) se trata de un modelo ligero, apto para ejecución en CPU.
- GPU recomendadas: no se especifican en la documentación; al ser un modelo VITS pequeño exportado a ONNX, no requiere GPU dedicada.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna, aunque no se confirma en la información disponible.
- Opciones de despliegue: phoonnx (Python), plugin OVOS `ovos-tts-plugin-phoonnx`, phoonnx.js en navegador. Requiere espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| vits-es_es-carlfm-high-espeak (este modelo) | VITS | es-ES | MIT | ONNX | Hugging Face, phoonnx, OVOS |
| friyin/vits-piper-es_ES-carlfm-high | VITS (Piper) | es-ES | no disponible en la información | no disponible | Hugging Face (modelo upstream) |
| Otros modelos de la colección VITS de Phoonnx | VITS | varios | MIT (según la colección) | ONNX | Hugging Face, phoonnx |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que no es posible comparar rendimiento ni calidad de forma cuantitativa.

## Limitaciones y advertencias

- Dependencia de espeak-ng: los fonemas de entrada deben generarse con espeak-ng; si se usa el port espyak, algunos fonemas difieren y la voz puede pronunciar mal ciertas palabras, según advierte la propia model card.
- Cobertura lingüística restringida al español de España; no se documenta soporte para otras variantes del español ni otros idiomas.
- Entrada por frase: el pipeline está pensado para sintetizar texto corto; no se documenta manejo de contextos largos ni de secuencias extensas.
- Riesgo de pronunciación incorrecta en nombres propios, siglas, números y palabras fuera del vocabulario cubierto por el fonemizador.
- No se han publicado métricas objetivas de calidad (MOS, WER) ni benchmarks en la información disponible, por lo que la evaluación de calidad debe hacerse manualmente.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda revisar los términos del release upstream (`friyin/vits-piper-es_ES-carlfm-high`) y las licencias de las dependencias (espeak-ng, scriptconv, phoonnx).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No apto para tareas de razonamiento, generación de texto, código o visión: es exclusivamente un modelo de síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-carlfm-high-espeak
- Modelo upstream: https://huggingface.co/friyin/vits-piper-es_ES-carlfm-high
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
