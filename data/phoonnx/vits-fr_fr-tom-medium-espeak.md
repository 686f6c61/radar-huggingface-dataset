# Phoonnx/vits-fr_fr-tom-medium-espeak

## Resumen

vits-fr_fr-tom-medium-espeak es un modelo de síntesis de voz (text-to-speech) en francés de Francia, empaquetado por Phoonnx en formato ONNX para su librería de inferencia TTS. El modelo original procede de Rhasspy, concretamente de la colección piper-voices (fr/fr_FR/tom/medium), y emplea la arquitectura VITS, un modelo generativo end-to-end que combina un encoder de texto, un normalizing flow y un decoder basado en GAN para producir waveforms directamente a partir de fonemas.

La relevancia de este empaquetado reside en su integración con el ecosistema phoonnx, que permite ejecutar el modelo tanto en Python como en OVOS (Open Voice OS) mediante el plugin ovos-tts-plugin-phoonnx, así como en el navegador a través de phoonnx.js. El front-end de texto utiliza fonemas espeak en alfabeto IPA, generados por espeak-ng o por el port espyak incluido en el extra `phoonnx[espeak]`.

Se trata de un modelo de tamano medio (la variante "medium" de Piper) orientado a síntesis de voz local, con un repositorio de solo 0,1 GB, lo que lo hace adecuado para despliegues en dispositivos con recursos limitados. La licencia es MIT y el único idioma soportado es fr-FR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS generativo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada por fonemas) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | fr-FR (frances de Francia) |
| Licencia | MIT |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), que integra en un único sistema un encoder de texto condicionado por fonemas, un normalizing flow para modelar la distribución latente, un decoder generativo y un discriminador adversarial entrenado conjuntamente. Esta arquitectura produce audio de forma directa desde la secuencia de fonemas, sin necesidad de un vocoder separado.

El modelo original fue entrenado por Rhasspy como parte de la colección piper-voices, en la variante fr_FR/tom/medium. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el hablante concreto ("tom") ni si se aplicaron técnicas de RLHF o fine-tuning adicional. El empaquetado de Phoonnx no modifica los pesos, sino que los convierte a ONNX y los integra con el front-end de normalización de texto y fonemización de scriptconv, que utiliza `EspeakPhonemizer` del módulo `scriptconv_copyleft.phonemizers.mul`.

## Capacidades

- Síntesis de voz en francés de Francia (fr-FR) a partir de texto escrito.
- Conversión de texto a fonemas IPA mediante espeak-ng (o espyak como alternativa integrada).
- Generación de audio WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con OVOS como plugin TTS (`ovos-tts-plugin-phoonnx`).
- Ejecución en navegador mediante phoonnx.js con entrada espeak o unicode.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente TTS).
- No dispone de modo thinking, visión, audio de entrada ni capacidades multimodales más allá de la síntesis.

## Casos de uso

- Asistentes de voz locales en francés: el modelo puede integrarse en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente doméstico sin depender de servicios en la nube, gracias a su tamano reducido (0,1 GB) y a su ejecución ONNX.
- Lectura de textos y notificaciones: se puede usar `synthesize_wav` para convertir artículos, correos o alertas del sistema en audio WAV, con una latencia baja al ejecutarse localmente.
- Accesibilidad para personas con discapacidad visual: integración en lectores de pantalla o aplicaciones de escritorio que requieran una voz francesa offline.
- Síntesis en aplicaciones web: mediante phoonnx.js, el modelo puede ejecutarse en el navegador para generar audio en fr-FR sin enviar texto a un servidor, útil en aplicaciones de aprendizaje de idiomas o demos interactivas.
- Pruebas y desarrollo de pipelines TTS: al estar empaquetado en ONNX y con una API Python clara, sirve como base para experimentar con normalización de texto, fonemización y evaluación de calidad de voz en francés.
- Generación de audiolibros o contenido narrado por lotes: el modelo puede procesar grandes volúmenes de texto de forma local y automatizada, aunque la calidad "medium" lo hace más adecuado para contenido no crítico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamano del repositorio (0,1 GB) se espera un consumo de memoria muy bajo, inferior a 1 GB en la mayoría de configuraciones.
- GPU recomendadas: no se especifican; al ser un modelo ONNX de 0,1 GB, puede ejecutarse en CPU sin GPU dedicada.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dado el reducido tamano del modelo.
- Opciones de despliegue: phoonnx (Python), ovos-tts-plugin-phoonnx (OVOS), phoonnx.js (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Tamano | Licencia | Formato |
|---|---|---|---|---|---|
| vits-fr_fr-tom-medium-espeak (este) | VITS | fr-FR | 0,1 GB | MIT | ONNX |
| Otras voces Piper fr_FR | VITS | fr-FR | variable (segun variante) | MIT (upstream) | ONNX |
| Modelos TTS multilingues comerciales | variable | multi | no disponible | propietaria | no disponible |

No se dispone de datos de rendimiento comparativo entre este modelo y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo limitado al francés de Francia (fr-FR); no soporta otros idiomas.
- La calidad es la de la variante "medium" de Piper, adecuada para aplicaciones locales pero no para produccion de audio de alta fidelidad.
- La fonemización depende de espeak-ng; si se usa espyak, algunos fonemas difieren y el modelo puede pronunciar mal ciertas palabras, según advierte el autor.
- Riesgo de errores de pronunciación en palabras fuera del vocabulario o con grafías ambiguas, derivado del front-end de fonemas.
- No se han publicado evaluaciones de sesgos, alucinación o calidad subjetiva (MOS) en la información disponible.
- La licencia MIT permite uso comercial, pero se recomienda verificar la licencia upstream de rhasspy/piper-voices para confirmar condiciones.
- El modelo no incluye capacidades de razonamiento, tool calling ni agentes; su uso está restringido a síntesis de voz.

## Enlaces

- [Hugging Face: Phoonnx/vits-fr_fr-tom-medium-espeak](https://huggingface.co/Phoonnx/vits-fr_fr-tom-medium-espeak)
- [Upstream: rhasspy/piper-voices fr/fr_FR/tom/medium](https://huggingface.co/rhasspy/piper-voices/tree/main/fr/fr_FR/tom/medium)
- [Coleccion VITS de Phoonnx](https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
- [Repositorio phoonnx.js](https://github.com/TigreGotico/phoonnx.js)
- [Demo en vivo de phoonnx.js](https://tigregotico.pt/demo)
