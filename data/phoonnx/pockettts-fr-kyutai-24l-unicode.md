# Phoonnx/pockettts-fr-kyutai-24l-unicode

## Resumen

pockettts-fr-kyutai-24l-unicode es un modelo de síntesis de voz (text-to-speech) en francés desarrollado originalmente por Kyutai y empaquetado por Phoonnx para su librería ONNX de TTS. El modelo forma parte de la familia Pocket TTS y se distribuye en formato ONNX listo para inferencia, lo que elimina la necesidad de convertir pesos o gestionar dependencias de frameworks de deep learning propietarios. La variante `24l` hace referencia a la configuración de 24 capas del modelo original dentro del árbol `kyutai/pocket-tts/languages/french_24l`.

El modelo está especializado exclusivamente en francés y utiliza una representación de entrada basada en puntos de código Unicode del texto, procesados mediante el fonemizador `UnicodeCodepointPhonemizer` de la librería scriptconv. Esta aproximación simplifica el front-end de texto respecto a sistemas basados en fonemas IPA o G2P complejos, a costa de delegar parte de la normalización lingüística en la capa de preprocesado.

Su relevancia actual radica en que ofrece una alternativa ligera y desplegable en local para síntesis de voz en francés, con licencia CC-BY-4.0 que permite uso comercial con atribución, y con integración directa en el ecosistema OVOS (Open Voice OS) mediante el plugin `ovos-tts-plugin-phoonnx`. El repositorio ocupa 2,4 GB e incluye múltiples voces predefinidas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS (Kyutai) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos distribuidos en ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | francés (`fr`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura corresponde a Pocket TTS, el sistema de síntesis de voz de Kyutai. La variante empaquetada aquí es la configuración `french_24l`, que según la nomenclatura del repositorio upstream implica un modelo de 24 capas especializado en francés. No se dispone en la información proporcionada de detalles sobre el tipo exacto de arquitectura interna (si es un modelo autorregresivo basado en transformer, un modelo acústico con vocoder integrado, un modelo de difusión o una combinación), ni sobre el número de parámetros, la composición del dataset de entrenamiento, el número de tokens de audio procesados o si se aplicaron técnicas de RLHF o ajuste fino supervisado.

El único detalle técnico documentado sobre el pipeline es el front-end de texto: el modelo recibe los puntos de código Unicode del texto y los procesa con `UnicodeCodepointPhonemizer` de scriptconv, que normaliza la entrada y la convierte en la secuencia que consume el modelo. La conversión a ONNX fue realizada por KevinAHM a partir de los pesos originales de Kyutai, y Phoonnx la empaqueta junto con la integración en su librería.

## Capacidades

- Síntesis de voz (text-to-speech) en francés a partir de texto plano.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Soporte de múltiples voces predefinidas: 26 voces identificadas en la model card (`pockettts/fr/alba`, `pockettts/fr/anna`, `pockettts/fr/azelma`, `pockettts/fr/bill_boerst`, `pockettts/fr/caro_davy`, `pockettts/fr/charles`, `pockettts/fr/cosette`, `pockettts/fr/eponine`, `pockettts/fr/estelle`, `pockettts/fr/eve`, `pockettts/fr/fantine`, `pockettts/fr/george`, `pockettts/fr/giovanni`, `pockettts/fr/jane`, `pockettts/fr/javert`, `pockettts/fr/jean`, `pockettts/fr/juergen`, `pockettts/fr/lola`, `pockettts/fr/marius`, `pockettts/fr/mary`, `pockettts/fr/michael`, `pockettts/fr/paul`, `pockettts/fr/peter_yearsley`, `pockettts/fr/rafael`, `pockettts/fr/stuart_bell`, `pockettts/fr/vera`).
- Integración con OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Normalización de texto delegada a scriptconv (conversión de script y fonemización por puntos de código Unicode).
- No se documentan capacidades de clonación de voz, control de emociones, multilingüismo, tool calling ni razonamiento; el modelo es exclusivamente TTS en francés.

## Casos de uso

- Asistentes de voz en francés sobre OVOS: el modelo se integra como plugin TTS nativo (`ovos-tts-plugin-phoonnx`), permitiendo seleccionar una de las 26 voces en la configuración del asistente y sintetizar respuestas en local sin depender de servicios en la nube.
- Lectura de contenidos y accesibilidad: conversión de artículos, notificaciones o textos de interfaz a audio en francés para aplicaciones de lectura asistida, aprovechando la licencia CC-BY-4.0 que permite redistribución con atribución.
- Generación de audio para entornos sin conectividad: al ejecutarse sobre ONNX en local, es adecuado para dispositivos embebidos o sistemas con requisitos de privacidad donde el texto no debe salir del dispositivo.
- Síntesis de avisos y locuciones en aplicaciones de domótica y kioscos: el modelo puede generar mensajes cortos en francés de forma programática mediante `synthesize_wav`, integrándose en flujos de automatización.
- Prototipado de interfaces conversacionales en francés: permite validar experiencias de voz con múltiples timbres (voces masculinas y femeninas) antes de invertir en un servicio TTS comercial.
- Generación de material de audio para pruebas de calidad (QA) en pipelines de ASR: las voces sintéticas en francés sirven para crear datasets de evaluación controlados para sistemas de reconocimiento de voz.
- Integración en aplicaciones Python de escritorio o servidor: la API de phoonnx (`TTSModelManager`, `load`, `merge_default_voices`) permite incorporar la síntesis en scripts y servicios sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 2,4 GB, pero este tamaño incluye los pesos ONNX y posiblemente múltiples voces; el consumo real en inferencia no está documentado.
- GPU recomendadas: no disponible. Al ejecutarse vía ONNX Runtime, puede utilizar aceleración por GPU (CUDA, DirectML) o CPU, pero no se especifican modelos concretos.
- ¿Cabe en GPU de consumo? No confirmado. Dado el tamaño del repositorio (2,4 GB), es plausible que quepa en GPUs de consumo con 8 GB o más de VRAM, pero este dato no está verificado en la información proporcionada.
- Opciones de despliegue: phoonnx (Python, con integración OVOS); ONNX Runtime como backend de ejecución. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pockettts-fr-kyutai-24l-unicode | TTS (Pocket TTS) | fr | CC-BY-4.0 | ONNX | Hugging Face (Phoonnx) |
| Modelos Piper TTS para francés | TTS | fr (entre otros) | MIT / varias | ONNX | Hugging Face, integración amplia |
| Coqui TTS (XTTS v2) | TTS con clonación | multilingüe | Coqui Public Model License (no comercial en algunas variantes) | PyTorch | Hugging Face, GitHub |
| MMS-TTS (Meta) | TTS | fr (entre otros) | CC-BY-NC-4.0 | PyTorch | Hugging Face |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) en la información proporcionada para establecer una comparación cuantitativa con estos modelos.

## Limitaciones y advertencias

- Modelo monolingüe: solo soporta francés; no se documenta capacidad de síntesis en otros idiomas.
- Entrada basada en puntos de código Unicode: la calidad de la síntesis depende de la normalización previa realizada por scriptconv; textos con abreviaturas, números o símbolos pueden requerir preprocesado adicional.
- Sin datos de benchmarks: no hay métricas publicadas de calidad de voz (MOS), inteligibilidad ni latencia, lo que dificulta evaluar su idoneidad frente a alternativas.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribución a los autores originales (Kyutai) y a los empaquetadores (Phoonnx, KevinAHM) según corresponda.
- Riesgo de artefactos y alucinaciones acústicas: como todo modelo TTS generativo, puede producir pronunciaciones incorrectas o ruidos en entradas atípicas; no se documenta el comportamiento en textos largos.
- Sin información sobre sesgos: no se detalla la composición demográfica de las voces ni posibles sesgos de pronunciación regional (el francés de Francia frente a otras variantes).
- Repositorio con pocas descargas (17) y sin likes: ecosistema de validación limitado; conviene probar exhaustivamente antes de usarlo en producción.
- No se documenta el soporte de SSML, control de prosodia, velocidad ni tono.
- La integración depende de la librería phoonnx (instalación con `pip install --pre phoonnx`, es decir, versión preliminar), lo que implica cierta inestabilidad potencial de la API.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/pockettts-fr-kyutai-24l-unicode
- Repositorio upstream (Kyutai Pocket TTS, francés 24l): https://huggingface.co/kyutai/pocket-tts/tree/main/languages/french_24l
- Conversión ONNX (KevinAHM): https://huggingface.co/KevinAHM/pocket-tts-onnx/tree/main/onnx/french_24l
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Pocket TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/pocket-tts-6af8ea95fad812f585a5cb91
