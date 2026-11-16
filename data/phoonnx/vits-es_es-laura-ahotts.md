# Phoonnx/vits-es_es-laura-ahotts

## Resumen

`Phoonnx/vits-es_es-laura-ahotts` es un modelo de síntesis de voz (text-to-speech) en castellano de Espana, empaquetado en formato ONNX para su uso con la librería phoonnx. El modelo original es un VITS desarrollado por el centro HiTZ (Universidad del País Vasco), publicado como `HiTZ/TTS-es_laura`, y este repositorio lo redistribuye listo para inferencia en Python y en el ecosistema OVOS. La voz se identifica internamente como `hitz/es_laura-vits`.

El modelo resuelve la conversión de texto a audio en es-ES con una única voz femenina preentrenada. La entrada de texto no es texto plano directo: phoonnx delega la normalización y la conversión a fonemas en la librería scriptconv, que aplica el fonemizador AhoTTS sobre el alfabeto IPA. Esto implica que el pipeline completo requiere tanto phoonnx como el extra `scriptconv[eu]`.

Es relevante para desarrolladores que necesitan un TTS ligero, de licencia permisiva (Apache 2.0) y ejecutable en CPU mediante ONNX Runtime, sin depender de infraestructura GPU. El repositorio ocupa aproximadamente 0,1 GB y tiene un uso muy bajo en Hugging Face (22 descargas), por lo que debe tratarse como un componente de nicho dentro de asistentes de voz open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no acepta contexto de texto largo como un LLM) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el model card no detalla variantes) |
| Idiomas soportados | es-ES (castellano de Espana) |
| Licencia | Apache 2.0 (declarada por el upstream HiTZ/TTS-es_laura) |
| Formato de pesos | ONNX |
| Entrada de texto | fonemas ahotts en alfabeto IPA |
| Voz incluida | `hitz/es_laura-vits` (voz femenina, segun el identificador "laura") |
| Tamano del repositorio | ~0,1 GB |
| Libreria de inferencia | phoonnx (Python) / ovos-tts-plugin-phoonnx |

## Arquitectura y entrenamiento

VITS es una arquitectura end-to-end de síntesis de voz que combina un codificador de texto, un prior variacional condicionado por alineamientos monótonos (MAS), un decodificador generativo y discriminadores adversariales para el entrenamiento. El resultado es un modelo que genera formas de onda directamente desde fonemas, sin vocoder externo. En este caso, la entrada son fonemas IPA producidos por el fonemizador AhoTTS, lo que fija el front-end de texto al pipeline de scriptconv.

No se dispone de información sobre el número de horas de audio, la composición del corpus de entrenamiento, el hablante concreto ni si se aplicaron técnicas de fine-tuning o adaptación. El model card solo indica que el modelo original es de HiTZ Center y que la licencia declarada por el upstream es Apache 2.0. El empaquetado para phoonnx consiste en la conversión a ONNX y la integración con el gestor de voces de la librería, no en un reentrenamiento.

## Capacidades

- Síntesis de voz en castellano de Espana (es-ES) a partir de texto normalizado y convertido a fonemas IPA.
- Generación de audio en formato WAV mediante `voice.synthesize_wav(text, wav_file)`.
- Una única voz preentrenada (`hitz/es_laura-vits`), sin selección de hablante ni control de estilo documentado.
- Integración con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Ejecución sobre ONNX Runtime, lo que permite inferencia en CPU.
- Normalización de texto y fonemización delegadas a scriptconv (fonemizador AhoTTS).
- No soporta tool calling, agentes, visión, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz domésticos en OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar la voz `hitz/es_laura-vits` en `mycroft.conf` y sustituir el TTS del asistente por una voz local en castellano, sin enviar texto a servicios en la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: al ejecutarse sobre ONNX Runtime en CPU, puede sintetizar mensajes cortos en segundo plano sin consumir GPU.
- Generación de audiolibros o podcasts de bajo coste: útil para convertir textos normalizados a WAV por lotes, siempre que el texto se preprocese con scriptconv y se acepte una única voz.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones que necesiten una voz castellana local y de licencia permisiva.
- Pruebas de integración en pipelines de CI: el reducido tamaño del repositorio (~0,1 GB) y la licencia Apache 2.0 facilitan incluirlo en tests automatizados de sistemas de voz sin problemas de redistribución.
- Prototipado de interfaces conversacionales en es-ES: sirve para validar flujos de diálogo con audio real antes de invertir en un TTS comercial o en un modelo de mayor calidad.
- Sistemas embebidos o de bajos recursos: al no requerir GPU y usar ONNX, encaja en despliegues con CPU limitada donde un TTS neuronal grande sería inviable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye métricas de calidad (MOS, MCD, WER de ASR sobre el audio sintetizado) ni comparaciones con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de ~0,1 GB, es previsible que funcione en CPU sin GPU dedicada, pero no se documentan cifras de memoria.
- GPU recomendadas: no disponible. No se especifica compatibilidad con CUDA, ROCm ni otros backends de aceleración.
- Cabe en GPU consumer: no confirmado por el autor; por tamaño del repositorio es plausible, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx en Python, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/vits-es_es-laura-ahotts | VITS | es-ES | Apache 2.0 | ONNX | Hugging Face, via phoonnx |
| HiTZ/TTS-es_laura (upstream) | VITS | es-ES | Apache 2.0 | no disponible en la informacion | Hugging Face |
| Otros modelos VITS de la coleccion Phoonnx | VITS | varios | no disponible | ONNX | Hugging Face |

No se dispone de datos de rendimiento ni de parámetros para establecer una comparación cuantitativa con alternativas. La comparación se limita a la relación de empaquetado con el modelo upstream de HiTZ.

## Limitaciones y advertencias

- Una sola voz: no hay control de hablante, emoción ni estilo; cualquier necesidad de voces diversas requiere otro modelo.
- Dependencia del front-end: la calidad y corrección dependen de scriptconv y del fonemizador AhoTTS; textos con números, siglas o extranjerismos pueden fonemizarse mal si la normalización no los cubre.
- Ámbito lingüístico restringido a es-ES; no se documenta soporte para otras variedades del castellano ni para otras lenguas.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir pronunciaciones incorrectas, artefactos o prosodia antinatural en frases largas o ambiguas.
- Sesgos: al entrenarse con una hablante concreta, hereda sus características de voz; no se documentan sesgos demográficos ni de otro tipo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo upstream y de las dependencias (scriptconv, fonemizador AhoTTS) antes de redistribuir en producción.
- Madurez: 22 descargas y 0 likes en Hugging Face; no hay evidencia de uso en producción ni de mantenimiento continuo.
- Sin métricas publicadas: no se puede evaluar la calidad objetiva frente a alternativas sin realizar pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-es_es-laura-ahotts
- Modelo upstream: https://huggingface.co/HiTZ/TTS-es_laura
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Libreria scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion de modelos VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
