# Phoonnx/orpheus-en-3b-unicode

## Resumen

Orpheus-en-3b-unicode es un modelo de síntesis de voz (text-to-speech) en inglés, derivado de `canopylabs/orpheus-3b-0.1-ft` de Canopy Labs y empaquetado por Phoonnx para su uso con la librería ONNX `phoonnx`. El paquete incluye los pesos convertidos a ONNX (a partir de la conversión de `onnx-community/orpheus-3b-0.1-ft-ONNX`) y un front-end de texto basado en puntos de código Unicode, gestionado por la librería `scriptconv`. Con 3.000 millones de parámetros, el modelo está pensado para inferencia local y para integrarse en asistentes de voz.

La relevancia de esta ficha radica en que el modelo no se distribuye como pesos originales de PyTorch, sino como un artefacto listo para ejecutar en ONNX dentro del ecosistema phoonnx y OVOS (Open Voice OS). El repositorio ocupa 13,3 GB y declara licencia Apache 2.0. Soporta únicamente inglés (`en`) y ofrece ocho voces predefinidas (dan, jess, leah, leo, mia, tara, zac, zoe).

La información publicada por el autor es escasa: no se detallan arquitectura interna más allá de la etiqueta "Orpheus", ni datos de entrenamiento, ni resultados de benchmarks. Esta ficha refleja exclusivamente lo disponible en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Orpheus (modelo de TTS; detalles internos no disponibles) |
| Parametros totales | 3B (según el nombre del modelo y el upstream `orpheus-3b-0.1-ft`) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 13,3 GB |
| Pipeline | text-to-speech |
| Entrada de texto | puntos de código Unicode del texto |
| Voces incluidas | dan, jess, leah, leo, mia, tara, zac, zoe |

## Arquitectura y entrenamiento

La model card identifica la arquitectura como "Orpheus", el modelo de TTS de Canopy Labs, pero no aporta detalles sobre la estructura interna (transformer, decoder autoregresivo sobre tokens de audio, códec vocacional, etc.). El modelo upstream es `canopylabs/orpheus-3b-0.1-ft`, un ajuste fino de 3B parámetros, y la conversión a ONNX procede de `onnx-community/orpheus-3b-0.1-ft-ONNX`. No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación.

La innovación destacable de este empaquetado es el front-end de texto: phoonnx delega en `scriptconv` la normalización y conversión del texto, y este modelo concreto utiliza `UnicodeCodepointPhonemizer` (de `scriptconv.phonemizers.base`), que transforma el texto en puntos de código Unicode como entrada del modelo. No se documentan técnicas de decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Síntesis de voz (text-to-speech) en inglés a partir de texto plano.
- Ocho voces predefinidas en inglés: dan, jess, leah, leo, mia, tara, zac y zoe.
- Entrada basada en puntos de código Unicode mediante el fonemizador `UnicodeCodepointPhonemizer` de scriptconv.
- Generación de audio WAV a través de la API `voice.synthesize_wav(text, wav_file)` de phoonnx.
- Integración como plugin de TTS en OVOS (`ovos-tts-plugin-phoonnx`) configurable desde `mycroft.conf`.
- Ejecución en ONNX, lo que permite despliegue sin PyTorch.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz locales en OVOS: el modelo se integra como módulo TTS (`ovos-tts-plugin-phoonnx`) y permite seleccionar la voz en `mycroft.conf`, lo que lo hace adecuado para asistentes domésticos autoalojados con salida en inglés.
- Síntesis de voz en aplicaciones Python: mediante `TTSModelManager` y `voice.synthesize_wav`, se puede generar audio WAV directamente en scripts o servicios, sin depender de frameworks de deep learning pesados gracias al formato ONNX.
- Lectura de contenido en inglés (noticias, documentación, correos): el front-end de scriptconv normaliza el texto antes de la síntesis, lo que facilita procesar texto no estructurado y convertirlo en audio.
- Audiolibros y narración con múltiples voces: las ocho voces disponibles permiten asignar voces distintas a personajes o secciones de un mismo contenido.
- Accesibilidad: conversión de texto a voz para aplicaciones de lectura de pantalla o interfaces para personas con discapacidad visual, ejecutando el modelo en local.
- Integración en pipelines de voz para agentes conversacionales: el modelo actúa como etapa final (TTS) de un asistente que combine ASR, LLM y síntesis, con la ventaja de un despliegue ONNX portable.
- Prototipado y pruebas de UX de voz: al ser un paquete ligero de instalar (`pip install --pre phoonnx`), permite iterar rápidamente sobre guiones y voces antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 13,3 GB en ONNX, por lo que se requiere espacio en disco y memoria proporcional al tamaño de los pesos cargados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el formato ONNX permite ejecución en CPU y en GPU compatibles con ONNX Runtime, pero el autor no especifica requisitos.
- Opciones de despliegue: ONNX Runtime a través de la librería `phoonnx`; integración en OVOS mediante `ovos-tts-plugin-phoonnx`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Phoonnx/orpheus-en-3b-unicode | 3B | no disponible | en | Apache 2.0 | ONNX |
| canopylabs/orpheus-3b-0.1-ft (upstream) | 3B | no disponible | en | Apache 2.0 | pesos originales (no especificado) |
| onnx-community/orpheus-3b-0.1-ft-ONNX | 3B | no disponible | en | no disponible | ONNX |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se documentan otros idiomas.
- No se publican detalles sobre sesgos del modelo, calidad de las voces ni evaluación subjetiva (MOS).
- Riesgo de alucinación no aplicable en el sentido de texto generado, pero no se documenta el comportamiento ante entradas fuera de distribución (texto con ruido, símbolos o idiomas distintos del inglés).
- La licencia Apache 2.0 se hereda del upstream según declara el autor; conviene verificar la model card de `canopylabs/orpheus-3b-0.1-ft` antes de un uso comercial.
- El modelo depende del ecosistema phoonnx y scriptconv; la versión de instalación es preliminar (`pip install --pre phoonnx`), lo que implica posible inestabilidad de API.
- No se documentan requisitos de hardware, latencia ni límites de longitud de texto para la síntesis.
- El repositorio es grande (13,3 GB), lo que puede dificultar su despliegue en entornos con almacenamiento limitado.

## Enlaces

- [Hugging Face: Phoonnx/orpheus-en-3b-unicode](https://huggingface.co/Phoonnx/orpheus-en-3b-unicode)
- [Modelo upstream: canopylabs/orpheus-3b-0.1-ft](https://huggingface.co/canopylabs/orpheus-3b-0.1-ft)
- [Conversión ONNX: onnx-community/orpheus-3b-0.1-ft-ONNX](https://huggingface.co/onnx-community/orpheus-3b-0.1-ft-ONNX)
- [Colección Orpheus de Phoonnx](https://huggingface.co/collections/Phoonnx/orpheus-6af8ecbd982acc9f5a709a20)
- [Repositorio phoonnx](https://github.com/TigreGotico/phoonnx)
- [Repositorio scriptconv](https://github.com/TigreGotico/scriptconv)
