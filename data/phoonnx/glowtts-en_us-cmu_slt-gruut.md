# Phoonnx/glowtts-en_us-cmu_slt-gruut

## Resumen

Glow-TTS en_us-cmu_slt es un modelo de síntesis de voz (text-to-speech) en inglés estadounidense, empaquetado en formato ONNX por Phoonnx a partir de los pesos originales publicados por Rhasspy dentro del proyecto Larynx v1.0. El modelo original es una implementación de Glow-TTS, una arquitectura de síntesis neuronal basada en normalizing flows que genera espectrogramas mel de forma no autorregresiva, evitando así el coste secuencial de los modelos tipo Tacotron. La voz corresponde al corpus CMU ARCTIC `slt` (una hablante femenina de inglés americano), y el modelo espera como entrada fonemas gruut en alfabeto IPA.

El paquete incluye únicamente el modelo acústico: la conversión de espectrograma a forma de onda se delega en un vocoder separado, `hifigan-multi-vctk-small`, que Phoonnx descarga automáticamente junto con la voz. El repositorio pesa aproximadamente 0,1 GB y está pensado para su uso dentro del ecosistema phoonnx, una biblioteca de TTS en ONNX orientada a asistentes de voz (OVOS/Mycroft) y a despliegues ligeros en CPU.

Su relevancia actual es la de un componente de infraestructura más que la de un modelo de vanguardia: ofrece TTS determinista, de baja latencia y sin dependencias de GPU, integrable como plugin de voz en asistentes locales. La licencia no está registrada en el repositorio, lo que constituye un riesgo relevante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico generativo basado en normalizing flows) + vocoder HiFi-GAN externo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, sin ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el repo no documenta variantes cuantizadas) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada; el autor remite a la release upstream de Larynx) |
| Formato de pesos | ONNX (empaquetado para la librería phoonnx) |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis no autorregresivo que combina un encoder Transformer con un decoder basado en normalizing flows invertibles y un mecanismo de alineamiento monotónico (MAS, monotonic alignment search) que aprende la correspondencia entre fonemas y frames de espectrograma sin necesidad de alineamientos externos. La salida del modelo es un espectrograma mel que posteriormente se convierte en audio mediante un vocoder neuronal; en este paquete el vocoder es `hifigan-multi-vctk-small`, un HiFi-GAN pequeño entrenado sobre Multi-VCTK.

La entrada de texto no es texto crudo sino fonemas: el modelo consume fonemas gruut en alfabeto IPA, producidos por `GruutPhonemizer` de la librería `scriptconv`. La voz `cmu_slt` procede del corpus CMU ARCTIC, grabado por una hablante femenina de inglés americano. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF o ajuste por preferencias (poco habituales en TTS de esta generación). Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Síntesis de voz en inglés estadounidense a partir de texto, con salida en fichero WAV mediante `voice.synthesize_wav()`.
- Generación de espectrogramas mel de forma no autorregresiva, lo que permite paralelizar el cálculo de frames frente a arquitecturas autorregresivas.
- Fonemización de entrada mediante gruut (IPA), lo que aporta control sobre la pronunciación a través de la representación fonética.
- Integración como plugin de TTS en OVOS/Mycroft (`ovos-tts-plugin-phoonnx`), seleccionable por configuración en `mycroft.conf`.
- Ejecución en ONNX Runtime, con soporte para inferencia en CPU sin GPU dedicada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo TTS.
- No dispone de modo thinking ni de capacidades multilingües más allá del inglés estadounidense.

## Casos de uso

- Asistentes de voz locales en OVOS/Mycroft: el modelo se instala como plugin `ovos-tts-plugin-phoonnx` y se selecciona la voz `larynx/en-us-cmu_slt-glow_tts` en `mycroft.conf`, proporcionando respuestas habladas sin depender de servicios en la nube.
- Síntesis por lotes de avisos y notificaciones: al ser un modelo pequeño (repo de 0,1 GB) y ejecutable en CPU, permite generar grandes volúmenes de WAV para sistemas de megafonía, alertas o locuciones pregrabadas en pipelines offline.
- Lectura de contenido en aplicaciones de accesibilidad: integración en lectores de pantalla o herramientas de lectura de documentos en inglés, aprovechando la salida WAV directa y la baja huella de memoria.
- Generación de voces para prototipos de IVR y atención al cliente: sirve para validar flujos conversacionales en inglés antes de contratar un TTS comercial, con la ventaja de que la fonemización gruut permite corregir pronunciaciones concretas.
- Pruebas de regresión de pipelines TTS: al ser determinista y ligero, es útil como referencia en tests automáticos de calidad de audio y de integración de vocoders (por ejemplo, comparar HiFi-GAN frente a otros vocoders sobre el mismo espectrograma).
- Doblaje y narración de contenido corto en inglés: para vídeos internos, tutoriales o demos donde se requiere una voz femenina americana consistente y no se necesita clonación ni emoción controlable.
- Investigación en TTS neuronal: como baseline Glow-TTS reproducible en ONNX para comparar latencia, calidad mel y comportamiento del alineamiento monotónico frente a modelos más recientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y el uso de ONNX Runtime, el modelo está diseñado para ejecutarse en CPU.
- GPU recomendadas: no se documentan; el caso de uso previsto (OVOS, phoonnx) es CPU-first. Cualquier GPU compatible con ONNX Runtime (por ejemplo, RTX 4090, A100, H100) podría acelerar la inferencia, pero no hay datos publicados de rendimiento en ellas.
- ¿Cabe en GPU de consumo? Sí, con alta probabilidad, dado el tamaño del paquete; no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: ONNX Runtime a través de phoonnx (Python) y el plugin `ovos-tts-plugin-phoonnx` para OVOS/Mycroft. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Vocoder | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en_us-cmu_slt-gruut | Glow-TTS | en-US | hifigan-multi-vctk-small | ONNX (phoonnx) | other (sin registrar) | Hugging Face, 19 descargas |
| Rhasspy Larynx v1.0 (en-us_cmu_slt-glow_tts) | Glow-TTS | en-US | HiFi-GAN (upstream) | tar.gz original | según release upstream | GitHub releases de Rhasspy |
| Otras voces de la colección Glow-TTS de Phoonnx | Glow-TTS | variable (según voz) | hifigan-multi-vctk-small | ONNX (phoonnx) | other | Colección Hugging Face de Phoonnx |

No se dispone de datos de benchmarks que permitan comparar calidad (MOS, WER de ASR de ida y vuelta) con alternativas como VITS, Piper o Tacotron 2; no disponible.

## Limitaciones y advertencias

- Licencia: el repositorio declara `other` sin registrar una licencia concreta; el propio autor advierte de que se consulte la release upstream de Larynx antes de usarlo. No se garantiza el uso comercial sin verificación legal previa.
- Idioma único: solo inglés estadounidense; no hay soporte multilingüe ni cambio de acento.
- Voz única: corresponde al corpus CMU ARCTIC `slt`; no hay control de emoción, estilo ni clonación de voz.
- Dependencia de fonemización: la entrada debe ser fonemas gruut en IPA; texto crudo requiere el front-end `scriptconv`, y una fonemización incorrecta degrada la pronunciación.
- Dependencia de vocoder externo: la calidad final depende de `hifigan-multi-vctk-small`, que se descarga por separado; sin él no hay audio.
- Riesgo de alucinación en el sentido TTS: puede producir artefactos, prosodia incorrecta o pronunciaciones erróneas en palabras fuera de vocabulario, siglas o nombres propios.
- Sesgos: al entrenarse sobre una única hablante de CMU ARCTIC, la voz refleja sus características y no representa la diversidad de acentos del inglés.
- Madurez: 19 descargas y 0 likes en el momento de la consulta; ecosistema joven (phoonnx, scriptconv) con posible inestabilidad de API (instalación con `pip install --pre`).
- No apto para tareas de razonamiento, código, matemáticas ni agentes; es exclusivamente un modelo de síntesis de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-cmu_slt-gruut
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN empaquetado: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
- Release upstream de Larynx v1.0: https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_cmu_slt-glow_tts.tar.gz
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
