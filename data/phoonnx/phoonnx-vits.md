# Phoonnx/phoonnx-vits

## Resumen

Phoonnx-vits es un repositorio mono-arquitectura publicado por el usuario Phoonnx que agrupa un conjunto de voces de síntesis de voz (text-to-speech) basadas en la arquitectura VITS, empaquetadas en formato ONNX para su uso con la librería phoonnx. No se trata de un modelo único entrenado por el autor, sino de un espejo comunitario que reúne pesos procedentes de varias fuentes (Piper, Meta MMS-TTS y el proyecto kasanoma) bajo una misma estructura de carpetas, con un modelo independiente por subcarpeta.

El repositorio cubre un abanico de idiomas que incluye inglés (variantes en_US y en_GB), alemán, francés, español, ucraniano y varias lenguas africanas (twi, chichewa y makhuwa). Cada voz mantiene la licencia de su proyecto de origen, de modo que la licencia global declarada como MIT convive con subcarpetas con licencias CC-BY-NC-4.0, Apache-2.0 u "other", lo que condiciona su uso comercial según la voz concreta.

Su relevancia práctica radica en la integración con phoonnx: al ofrecer los pesos en ONNX y con la librería homónima como interfaz, simplifica el despliegue de TTS local en asistentes de voz, sistemas embebidos y aplicaciones sin conexión. El tamaño del repositorio (24,3 GB) refleja la agregación de múltiples voces más que la magnitud de un único modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variantes Piper con front-end espeak y Meta MMS-TTS basadas en grafemas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en_US, en_GB, de_DE, fr_FR, mms-eng, mms-spa, mms-fra, mms-deu, uk_UA, tw, ny, vmw |
| Licencia | MIT global; por subcarpeta: MIT (Piper), CC-BY-NC-4.0 (MMS), Apache-2.0 (ucraniano), other (kasanoma) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Cada subcarpeta contiene un modelo VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), una arquitectura condicional de tipo VAE que combina un codificador de texto, un prior normalizing flow, un decodificador y discriminadores adversariales en entrenamiento, y que genera audio de forma no autoregresiva en una sola pasada. Las voces Piper utilizan el front-end fonemizador espeak, mientras que las voces MMS de Meta emplean una tokenización basada en grafemas.

No se dispone de información sobre el número de tokens, la composición de los datasets ni los procedimientos de ajuste (RLHF/DPO) empleados en el entrenamiento original de cada voz; el autor del repositorio actúa como espejo de pesos ya publicados por terceros (rhasspy/piper-voices, willwade/mms-tts-multilingual-models-onnx, RomanStasyshyn y michsethowusu/kasanoma). La innovación técnica destacable es la unificación de voces heterogéneas bajo un mismo formato ONNX y una única librería de inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en los idiomas cubiertos por cada subcarpeta.
- Generación de audio no autoregresiva, adecuada para inferencia de baja latencia en local.
- Fonemización mediante espeak en las voces Piper; tokenización por grafemas en las voces MMS.
- Soporte multilingüe limitado a las voces incluidas (inglés, alemán, francés, español, ucraniano, twi, chichewa, makhuwa).
- Ejecución mediante ONNX Runtime a través de la librería phoonnx.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz sin conexión: integración de las voces Piper en un asistente local que sintetice respuestas en inglés, alemán o francés sin depender de servicios en la nube, aprovechando el formato ONNX y la baja latencia de VITS.
- Lectura de notificaciones y accesibilidad: conversión de texto a voz en aplicaciones de escritorio o móviles para usuarios con discapacidad visual, seleccionando la voz según el idioma del sistema.
- Sistemas embebidos y domótica: despliegue de una voz concreta en dispositivos de recursos limitados (Raspberry Pi y similares) mediante ONNX Runtime, dado el reducido coste computacional de VITS en inferencia.
- Localización de contenidos en ucraniano: uso de las voces uk_UA-tetiana, mykyta u oleksa para doblar o narrar material divulgativo en ucraniano con licencia Apache-2.0.
- Investigación en lenguas de bajos recursos: evaluación y experimentación con las voces twi, chichewa y makhuwa del proyecto kasanoma para estudiar la calidad de TTS en lenguas africanas, previa revisión de su licencia.
- Prototipado de interfaces conversacionales: generación rápida de audio de prueba en varios idiomas para validar flujos de voz antes de contratar un servicio TTS comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; los modelos VITS son de tamaño reducido y suelen ejecutarse en CPU, pero el repositorio no detalla el tamaño de cada voz individual.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; por la naturaleza de VITS y el formato ONNX, es plausible su ejecución en CPU, pero no se documenta.
- Opciones de despliegue: librería phoonnx sobre ONNX Runtime; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/phoonnx-vits | VITS (Piper y MMS) | Múltiples (12 voces) | ONNX | MIT global, mixta por subcarpeta | Hugging Face |
| rhasspy/piper-voices | VITS con espeak | Amplio conjunto de voces | ONNX | MIT | Hugging Face |
| facebook/mms-tts-* | VITS con grafemas | Más de 1000 lenguas | PyTorch/ONNX | CC-BY-NC-4.0 | Hugging Face |
| Coqui TTS (XTTS) | Modelos generativos diversos | Multilingüe | PyTorch | MPL-2.0 / Coqui CPML | GitHub |

La comparativa se limita a proyectos de origen, ya que el repositorio es un espejo de los mismos; no se dispone de métricas de calidad (MOS, WER) para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Licencia mixta: aunque el repositorio declara MIT, las voces MMS están bajo CC-BY-NC-4.0 (prohíben uso comercial) y las de kasanoma bajo "other" sin licencia definida; es imprescindible revisar la subcarpeta concreta antes de un uso comercial.
- Calidad variable entre voces: al proceder de fuentes distintas (Piper, MMS, kasanoma), la naturalidad y prosodia no son homogéneas.
- Idiomas limitados a las voces incluidas; no hay cobertura más allá de las doce subcarpetas listadas.
- Riesgo de errores de pronunciación en palabras fuera del vocabulario o en textos con abreviaturas, especialmente en las voces basadas en grafemas (MMS).
- No se documentan sesgos específicos, pero los modelos TTS pueden reflejar sesgos de los corpus de entrenamiento originales.
- Repositorio con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación comunitaria.
- No se especifican requisitos de hardware ni rendimiento medido, lo que dificulta planificar el despliegue en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phoonnx/phoonnx-vits
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Colección phoonnx community mirror: https://huggingface.co/collections/OpenVoiceOS/phoonnx-community-mirror-6a2204d302e0e7497870cd68
- rhasspy/piper-voices: https://huggingface.co/rhasspy/piper-voices
- willwade/mms-tts-multilingual-models-onnx: https://huggingface.co/willwade/mms-tts-multilingual-models-onnx
- RomanStasyshyn/uk_UA-tetiana-high: https://huggingface.co/RomanStasyshyn/uk_UA-tetiana-high
- michsethowusu/kasanoma: https://github.com/michsethowusu/kasanoma
- Discusión OHF-Voice/piper1-gpl#212: https://github.com/OHF-Voice/piper1-gpl/discussions/212
