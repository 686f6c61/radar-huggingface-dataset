# aruntemme/maya2-native-mlx-bf16

## Resumen

Maya2-native-mlx-bf16 es una conversión del modelo de síntesis de voz maya-research/maya2-native, adaptada por el usuario aruntemme para ejecutarse en Apple Silicon mediante la librería mlx-audio. Se trata de un sistema de text-to-speech (TTS) con capacidad de streaming que cubre once lenguas indicas (asamés, bengalí, gujarati, hindi, kannada, malayalam, marathi, oriya, punyabí, tamil y telugu) además del inglés, con un total de 20 voces predefinidas y clonación de voz multilingüe. El modelo base lo desarrolla Maya Research y se distribuye bajo licencia Apache 2.0.

La conversión conserva los pesos en BF16 tal como se publicaron, sin cambios numéricos, y reorganiza el formato para el layout de mlx-audio. El repositorio ocupa 10 GB, aunque el peso real de los parámetros es de aproximadamente 2.500 millones (2.502.398.656), lo que incluye el backbone Qwen3-1.7B-Base sobre el que se construye el sistema. La relevancia actual radica en que permite desplegar un TTS multilingüe de calidad en hardware de consumo de Apple, algo poco habitual en el ecosistema de síntesis de voz para lenguas indicas.

El modelo no incluye marcas de agua en el audio generado y depende de componentes externos (códec Mimi de Kyutai y encoder de hablante ECAPA-TDNN de SpeechBrain) que se descargan en tiempo de ejecución. Su orientación es tanto la generación de voz sintética como la clonación con consentimiento explícito, con normalización de texto activada por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS neuronal basada en backbone Qwen3-1.7B-Base con códec Mimi y encoder de hablante ECAPA-TDNN; conversión a mlx-audio |
| Parametros totales | 2.502.398.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales); no se documentan otras cuantizaciones en esta conversión |
| Idiomas soportados | as, bn, en, gu, hi, kn, ml, mr, or, pa, ta, te (11 lenguas indicas + inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout mlx-audio) |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone de lenguaje Qwen3-1.7B-Base (Apache 2.0), incluido en los pesos distribuidos, que actúa como componente de modelado de texto. La generación de audio se apoya en el códec neuronal Mimi de Kyutai (CC-BY-4.0) y en un encoder de hablante ECAPA-TDNN de SpeechBrain (Apache 2.0), ambos descargados en tiempo de ejecución y no redistribuidos en el repositorio. La salida es audio mono a 24 kHz. La conversión realizada por aruntemme reorganiza los safetensors originales al layout de mlx-audio sin alteración numérica, manteniendo BF16.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO en la información proporcionada. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal. La model card del conversor remite a la documentación de mlx-audio para el conjunto completo de opciones y no describe el proceso de entrenamiento del modelo original.

## Capacidades

- Generación de voz (text-to-speech) en streaming para 11 lenguas indicas y inglés.
- 20 voces predefinidas, con `Ahana` como voz por defecto; accesibles mediante `model.voices`.
- Clonación de voz multilingüe y cross-lingual: el idioma de salida puede diferir del de la referencia, usando `ref_audio`, `ref_text` y `ref_lang` con un clip limpio de 3 a 10 segundos.
- Normalización de texto activada por defecto (números, moneda, fechas, teléfonos, URLs), desactivable con `normalize=False`.
- Soporte de streaming mediante `stream=True`.
- Salida de audio mono a 24 kHz.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo TTS.

## Casos de uso

- Atención al cliente automatizada en lenguas indicas: el modelo puede sintetizar respuestas en hindi, tamil, telugu y otras lenguas con voces naturales, integrándose en sistemas IVR o chatbots para mercados del sur de Asia donde la cobertura TTS de calidad es limitada.
- Locución de contenidos educativos multilingües: generación de material audio para cursos en once lenguas indicas con una sola infraestructura, usando las 20 voces para diversificar narradores.
- Doblaje y localización de vídeo: la clonación cross-lingual permite mantener la identidad vocal de un hablante mientras se cambia el idioma de salida, útil en doblaje con permiso del hablante.
- Accesibilidad: lectura en voz alta de documentos, notificaciones y contenido web para usuarios con discapacidad visual en lenguas indicas, con normalización de fechas y números activada por defecto.
- Asistentes de voz en dispositivos Apple: al ejecutarse sobre mlx-audio en Apple Silicon, permite desplegar TTS local sin depender de la nube, reduciendo latencia y preservando privacidad.
- Generación de audiolibros y pódcast: síntesis por lotes con streaming y múltiples voces para producir contenido largo en varios idiomas.
- Pruebas de accesibilidad y QA de productos: generación de clips de referencia en distintas lenguas para validar sistemas de reconocimiento de voz o interfaces de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser BF16 con ~2.500 millones de parámetros, el peso de los tensores ronda los 5 GB; el repositorio ocupa 10 GB, por lo que se recomienda al menos 8-10 GB de memoria unificada libre para cargar el modelo y los componentes auxiliares (Mimi y ECAPA).
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente; el modelo está específicamente convertido para mlx-audio y no se documenta soporte para GPU NVIDIA en esta conversión.
- Cabe en GPU de consumo Apple: sí, en equipos con 16 GB de memoria unificada o más; en configuraciones de 8 GB puede resultar ajustado al sumar códec y encoder.
- Opciones de despliegue: mlx-audio (rama `main` o versión posterior a 0.6.2), con CLI `mlx_audio.tts.generate` y API Python `mlx_audio.tts.utils.load`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI para esta conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maya2-native-mlx-bf16 | 2.502.398.656 | no disponible | 11 indicas + en | Apache 2.0 | Hugging Face (mlx-audio) |
| maya-research/maya2-native (original) | no disponible | no disponible | 11 indicas + en | Apache 2.0 | Hugging Face |
| Qwen3-1.7B-Base (componente) | 1.700 millones aprox. | no disponible | multilingüe | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se documentan sesgos específicos, pero al cubrir lenguas indicas y entrenarse sobre datos de habla, puede heredar sesgos de representación entre idiomas y variedades dialectales.
- Riesgo de alucinación en el sentido de prosodia o pronunciación incorrecta en textos ambiguos, siglas o nombres propios; la normalización de texto mitiga parte del problema pero no lo elimina.
- El modelo no añade marca de agua al audio, por lo que las aplicaciones deben implementar sus propias salvaguardas.
- La clonación de voz debe realizarse solo con permiso explícito del hablante; el uso para suplantación, fraude, acoso o elusión de autenticación vocal está prohibido por la guía de uso responsable.
- Las voces integradas son personas sintéticas, no personas reales.
- La licencia Apache 2.0 permite uso comercial, pero los componentes externos mantienen sus propias licencias: Mimi (CC-BY-4.0) y ECAPA-TDNN (Apache 2.0), que deben respetarse.
- Esta conversión no está afiliada ni respaldada por Maya Research.
- El soporte en mlx-audio requiere la rama `main` o una versión posterior a 0.6.2; en versiones estables anteriores puede no funcionar.
- No se documentan limitaciones de longitud de contexto ni de idioma más allá de las lenguas listadas.

## Enlaces

- Hugging Face: https://huggingface.co/aruntemme/maya2-native-mlx-bf16
- Modelo base: https://huggingface.co/maya-research/maya2-native
- Maya Research: https://mayaresearch.ai
- mlx-audio (repositorio): https://github.com/Blaizzy/mlx-audio
- Documentación Maya-2 en mlx-audio: https://github.com/Blaizzy/mlx-audio/blob/main/mlx_audio/tts/models/maya2/README.md
- Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Kyutai Mimi: https://huggingface.co/kyutai/mimi
- SpeechBrain ECAPA-TDNN: https://huggingface.co/speechbrain/spkrec-ecapa-voxceleb
