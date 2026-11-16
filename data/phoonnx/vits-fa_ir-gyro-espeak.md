# Phoonnx/vits-fa_ir-gyro-espeak

## Resumen

vits-fa_ir-gyro-espeak es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx en formato ONNX para su uso con su librería de inferencia `phoonnx`. El modelo original procede de `gyroing/Persian-Piper-Model-gyro`, un checkpoint de Piper adaptado al persa (fa-IR), y esta versión lo redistribuye con el front-end fonemizador de espeak-ng y el pipeline de normalización de texto de `scriptconv`.

El modelo resuelve la conversión de texto persa a audio inteligible en un único paso no autorregresivo, con un tamaño de repositorio de 0,1 GB, lo que lo hace adecuado para despliegue en entornos con recursos limitados y para integración en asistentes de voz. Su relevancia radica en que amplía la cobertura de voces VITS/ONNX para persa dentro del ecosistema phoonnx y OVOS (Open Voice OS), un stack abierto de asistentes.

La ficha se basa exclusivamente en la model card publicada; los datos no documentados por el autor se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | persa (fa-IR) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Entrada de texto | fonemas espeak-ng en alfabeto IPA |
| Libreria de inferencia | phoonnx (Python y OVOS) |
| Autor original | gyroing |
| Empaquetado | Phoonnx |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un sistema TTS end-to-end que combina un codificador variational autoencoder, un prior normalizing flow, un decodificador generativo adversarial y un alineador monotónico por búsqueda (MAS) para aprender la alineación texto-audio sin supervisión explícita. Esta arquitectura genera audio en un solo paso, sin decodificación autorregresiva, lo que reduce la latencia frente a pipelines en cascada (Tacotron + vocoder).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de las grabaciones ni si se aplicaron técnicas de RLHF o DPO. El modelo original es un checkpoint Piper adaptado al persa; esta versión de Phoonnx no modifica los pesos, sino que los empaqueta en ONNX y define el front-end de texto: normalización mediante `scriptconv` y fonemización con `EspeakPhonemizer` de `scriptconv_copyleft.phonemizers.mul`. El autor advierte que el port espyak de espeak-ng puede diferir en algunos fonemas respecto a espeak-ng nativo, lo que puede provocar pronunciaciones incorrectas en ciertas palabras.

## Capacidades

- Síntesis de voz a partir de texto en persa (fa-IR), con salida en formato WAV.
- Conversión texto-fonema mediante espeak-ng (IPA) como paso previo a la síntesis.
- Normalización y conversión de texto mediante `scriptconv`.
- Inferencia en Python mediante `phoonnx.model_manager.TTSModelManager`.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`), configurable en `mycroft.conf`.
- Ejecución en navegador mediante `phoonnx.js` (VITS con entrada espeak o unicode).
- Voz identificada como `piper_community/gyroing/fa-IR_gyro` dentro del gestor de voces.
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni multilingüismo más allá del persa.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `piper_community/gyroing/fa-IR_gyro` en `mycroft.conf`, permitiendo respuestas habladas en persa dentro de un asistente doméstico.
- Lectura de contenido en persa: integración en lectores de artículos o notificaciones para generar audio WAV a partir de frases, aprovechando la inferencia en un solo paso de VITS para baja latencia.
- Aplicaciones de accesibilidad: conversión de texto a voz para usuarios con discapacidad visual que consuman contenido en persa, con un modelo de 0,1 GB desplegable en equipos modestos.
- Sistemas de megafonía o avisos automatizados: generación de mensajes pregrabados en persa para transporte, comercio o administración pública, donde la naturalidad y la inteligibilidad priman sobre el control expresivo.
- Prototipado de interfaces conversacionales: uso de la voz en demos web mediante `phoonnx.js` (demo en tigregotico.pt/demo) para validar flujos de diálogo en persa sin infraestructura de servidor.
- Investigación en TTS de bajos recursos: punto de partida para comparar el rendimiento de VITS con otros sistemas en persa, dado que el modelo es MIT y el pipeline es reproducible con espeak-ng y `scriptconv`.
- Integración en pipelines de generación de audio por lotes: síntesis de grandes volúmenes de frases a WAV mediante la API de Python de phoonnx, con el modelo empaquetado en ONNX para despliegue portable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,1 GB, por lo que el modelo es pequeño y cabe holgadamente en GPU de consumo, pero el autor no publica cifras de memoria en inferencia.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) debería ser suficiente, aunque no hay datos oficiales.
- CPU: la inferencia ONNX permite ejecución en CPU; no se documentan requisitos mínimos.
- Opciones de despliegue: `phoonnx` (Python), plugin OVOS `ovos-tts-plugin-phoonnx`, y `phoonnx.js` en navegador. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Dependencias: espeak-ng instalado en el sistema (`apt install espeak-ng`) o el extra `phoonnx[espeak]` con el port espyak.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada. La comparación se limita a características estructurales conocidas:

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/entrada |
|---|---|---|---|---|---|
| vits-fa_ir-gyro-espeak | VITS | Persa (fa-IR) | ONNX | MIT | Fonemas espeak-ng (IPA) |
| Piper (voces originales) | VITS | Múltiples | ONNX | MIT (por voz) | Fonemas espeak-ng |
| Alternativas TTS persa | no disponible | Persa | no disponible | no disponible | no disponible |

No se dispone de información sobre parámetros, contexto o rendimiento de los modelos comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Solo soporta persa (fa-IR); no es multilingüe.
- La fonemización depende de espeak-ng; con el port espyak algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre un corpus no especificado, puede reflejar sesgos de pronunciación o de registro del dataset original.
- Riesgo de alucinación en el sentido de pronunciaciones incorrectas o entonación inadecuada en frases fuera de distribución; no hay métricas publicadas de inteligibilidad (MOS, WER).
- No se documentan capacidades de control de prosodia, emoción ni estilo.
- La licencia MIT permite uso comercial, pero el autor original del checkpoint es gyroing; conviene verificar la cadena de licencias del modelo upstream antes de un despliegue comercial.
- El modelo está empaquetado para `phoonnx`; su uso fuera de esa librería requiere adaptar el pipeline de fonemización y normalización.
- No hay datos publicados de latencia, throughput ni requisitos de memoria, lo que dificulta el dimensionamiento de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-fa_ir-gyro-espeak
- Modelo upstream: https://huggingface.co/gyroing/Persian-Piper-Model-gyro
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
