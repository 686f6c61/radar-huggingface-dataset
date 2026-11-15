# Phoonnx/vits-en_us-inflect-micro_v2

## Resumen

`Phoonnx/vits-en_us-inflect-micro_v2` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, empaquetado por Phoonnx para su uso con su librería de TTS sobre ONNX. El modelo original procede de `owensong/inflect-micro-v2-onnx`, y esta versión lo adapta al ecosistema phoonnx, una librería Python orientada a la ejecución de voces VITS en formato ONNX, tanto en entornos de escritorio como en el asistente de voz OVOS.

Se trata de un modelo orientado a la síntesis de voz en inglés estadounidense (`en-us`), con entrada de texto en forma de fonemas espeak en alfabeto IPA. La arquitectura VITS combina un codificador de texto, un predictor de duración y un decodificador generativo (habitualmente basado en flujos normalizadores y un vocoder HiFi-GAN integrado), lo que permite generar audio de forma end-to-end a partir de fonemas.

El modelo es relevante para desarrolladores que necesitan una voz TTS ligera, ejecutable sobre ONNX y con licencia Apache 2.0, integrable en pipelines de asistentes de voz o aplicaciones de síntesis en tiempo real. El tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo de dimensiones reducidas (la designación "micro" en el nombre así lo indica), aunque no se dispone de datos concretos sobre el número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en-us (ingles estadounidense) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Entrada de texto | Fonemas espeak en alfabeto IPA |
| Libreria | phoonnx |
| Pipeline | text-to-speech |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS, un modelo generativo de síntesis de voz end-to-end que integra en un único sistema el codificador de texto, el predictor de duración, el módulo de alineación y el decodificador de audio con vocoder. VITS se caracteriza por el uso de modelado generativo variacional (VAE) combinado con flujos normalizadores y un discriminador adversarial durante el entrenamiento, lo que permite generar formas de onda de alta calidad sin necesidad de un vocoder externo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO (poco habituales en TTS). El modelo original fue desarrollado por owensong y posteriormente empaquetado por Phoonnx para su ejecución sobre ONNX. La entrada se realiza mediante fonemas espeak-ng en alfabeto IPA, y el front-end de texto se gestiona a través de la librería scriptconv, que normaliza el texto y lo convierte a fonemas mediante `EspeakPhonemizer`.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés estadounidense a partir de texto en fonemas espeak/IPA.
- Generación de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Integración con el asistente de voz OVOS a través del plugin `ovos-tts-plugin-phoonnx`.
- Ejecución sobre ONNX, lo que permite despliegue en entornos Python y potencialmente en navegador mediante phoonnx.js.
- Normalización de texto y conversión a fonemas mediante scriptconv.
- Soporte de fonemización con espeak-ng (recomendado) o con el port espyak (con posibles diferencias fonéticas).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso, al tratarse de un modelo TTS.

## Casos de uso

- Asistentes de voz en OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) configurando la voz `inflect/micro-en` en `mycroft.conf`, permitiendo respuestas habladas en inglés estadounidense en asistentes domésticos o de escritorio.
- Síntesis en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio WAV a partir de texto en pipelines de aplicaciones de escritorio o servidores ligeros.
- Síntesis en navegador: a través de phoonnx.js, que ejecuta voces VITS con entrada espeak o unicode en el navegador, con demo disponible en tigregotico.pt/demo.
- Generación de avisos y notificaciones habladas: al ser un modelo "micro", es adecuado para frases cortas en sistemas embebidos o de bajo consumo donde el tamaño del modelo es crítico.
- Prototipado de interfaces conversacionales: permite validar flujos de TTS en inglés sin depender de servicios en la nube, gracias a la licencia Apache 2.0 y la ejecución local sobre ONNX.
- Accesibilidad: lectura de texto a voz para aplicaciones de asistencia en inglés estadounidense, integrable en herramientas de escritorio mediante la API de phoonnx.
- Investigación en TTS: sirve como base para experimentar con fonemización espeak/IPA y comparar variantes VITS empaquetadas en la colección de Phoonnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un modelo "micro" en formato ONNX y con un repositorio de 0.0 GB, se espera un consumo reducido, pero no se proporcionan cifras concretas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del repositorio, es probable que quepa en GPUs de consumo e incluso en CPU, pero no se confirma en la información proporcionada.
- Opciones de despliegue: phoonnx (Python), OVOS mediante `ovos-tts-plugin-phoonnx`, y phoonnx.js en navegador. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a TTS).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / entrada | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/vits-en_us-inflect-micro_v2 | VITS | en-us | ONNX | Apache 2.0 | Fonemas espeak/IPA | Hugging Face, phoonnx, OVOS |
| owensong/inflect-micro-v2-onnx (upstream) | VITS | en-us | ONNX | Apache 2.0 | Fonemas espeak/IPA | Hugging Face |
| Otras voces VITS de la colección Phoonnx | VITS | variable | ONNX | variable | Fonemas espeak/IPA | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada. La comparativa se limita a parámetros estructurales y de licencia.

## Limitaciones y advertencias

- Modelo limitado al inglés estadounidense (`en-us`); no soporta otros idiomas.
- La entrada debe ser texto en fonemas espeak en alfabeto IPA; el front-end depende de espeak-ng o del port espyak, y este último puede producir diferencias fonéticas que provoquen errores de pronunciación.
- No se dispone de información sobre sesgos en los datos de entrenamiento ni sobre el dataset utilizado.
- Riesgo de alucinación no aplicable en el sentido habitual de LLM, pero sí posible generación de audio incorrecto o ininteligible ante fonemas no vistos.
- No se documentan restricciones adicionales de licencia para uso comercial más allá de la Apache 2.0 del modelo upstream, aunque la licencia se declara en la model card del repositorio original.
- Al ser un modelo "micro", la calidad y naturalidad del audio puede ser inferior a la de modelos VITS de mayor tamaño; no se proporcionan métricas objetivas (MOS) para evaluarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se documentan requisitos de hardware ni latencias, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-en_us-inflect-micro_v2
- Modelo upstream: https://huggingface.co/owensong/inflect-micro-v2-onnx
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Repositorio phoonnx.js: https://github.com/TigreGotico/phoonnx.js
- Demo en navegador: https://tigregotico.pt/demo
- Colección VITS de Phoonnx: https://huggingface.co/collections/Phoonnx/vits-6af8ea9ae9adb8b94ec31a65
