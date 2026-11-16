# Phoonnx/styletts2-multi-kokoro-82m-espeak_misaki

## Resumen

styletts2-multi-kokoro-82m-espeak_misaki es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura StyleTTS2, derivado del modelo Kokoro-82M de hexgrad y empaquetado por Phoonnx para su uso con la librería ONNX phoonnx. El modelo original Kokoro-82M es un modelo TTS de 82 millones de parámetros conocido por su reducido tamano y su calidad de síntesis competitiva; esta versión concreta lo distribuye en formato ONNX junto con un front-end de texto basado en fonemas espeak-ng e IPA, además de fonemizadores misaki para inglés, japonés y chino.

El modelo cubre ocho idiomas (inglés en variantes en-GB y en-US, castellano, francés, hindi, italiano, japonés, portugués de Brasil y chino) e incluye más de cincuenta voces predefinidas bajo el prefijo `kokoro/`. Su relevancia actual reside en que ofrece TTS multilingüe de calidad razonable en un paquete de apenas 0,2 GB, apto para inferencia en CPU y para integración en asistentes de voz locales como OVOS.

La licencia Apache 2.0 del modelo upstream facilita su uso comercial, aunque el front-end de fonemización depende de componentes con licencias distintas (espeak-ng y los fonemizadores misaki) que conviene verificar por separado. La librería phoonnx se distribuye en versión preliminar (`--pre`), lo que indica que la API puede cambiar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (síntesis de voz neuronal) |
| Parametros totales | 82 millones (heredados de Kokoro-82M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa texto por segmentos, no secuencias largas) |
| Tipos de cuantizacion | no disponible (distribución en ONNX; el repo pesa 0,2 GB) |
| Idiomas soportados | en-GB, en-US, es, fr, hi, it, ja-JP, pt-BR, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,2 GB |
| Front-end de texto | espeak-ng (fonemas IPA), misaki_en, misaki_ja, misaki_zh |
| Voces incluidas | más de 50 voces bajo el prefijo `kokoro/` |
| Libreria | phoonnx (Python y plugin OVOS) |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema TTS neuronal que combina un codificador de estilo y un decodificador acústico con un discriminador adversarial, disenado para producir habla natural con prosodia controlable. Esta ficha no dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card no los detalla. El modelo upstream Kokoro-82M fue entrenado por hexgrad y posteriormente convertido a ONNX por onnx-community; Phoonnx lo reempaqueta para su propia librería.

La innovación destacable en este empaquetado es el front-end de texto: phoonnx delega en la librería scriptconv la normalización y conversión a fonemas, ofreciendo dos rutas. La primera usa espeak-ng mediante `EspeakPhonemizer` (instalable con el extra `scriptconv[espeak]` o con el port espyak `phoonnx[espeak]`); la segunda usa fonemizadores misaki específicos para inglés, japonés y chino (`scriptconv[misaki]`). La model card advierte que algunos fonemas de espyak difieren de los de espeak-ng, lo que puede provocar pronunciaciones incorrectas en ciertas palabras.

## Capacidades

- Síntesis de voz multilingüe en ocho idiomas: inglés (en-GB y en-US), castellano, francés, hindi, italiano, japonés, portugués de Brasil y chino.
- Más de cincuenta voces predefinidas con identificadores como `kokoro/af_heart`, `kokoro/am_adam`, `kokoro/ef_dora`, `kokoro/jf_alpha` o `kokoro/zf_xiaoxiao`, que cubren voces femeninas y masculinas en varios idiomas.
- Entrada de texto basada en fonemas IPA mediante espeak-ng, lo que permite control fino de la pronunciación.
- Fonemización específica para inglés (misaki_en), japonés (misaki_ja) y chino (misaki_zh) a través de scriptconv.
- Generación de audio en formato WAV mediante la API `synthesize_wav` de phoonnx.
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, configurable en `mycroft.conf`.
- Ejecución en ONNX, lo que permite inferencia sin GPU y despliegue en entornos con recursos limitados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Asistentes de voz locales en OVOS: el plugin `ovos-tts-plugin-phoonnx` permite seleccionar una voz `kokoro/*` en `mycroft.conf` y sintetizar respuestas del asistente sin depender de servicios en la nube, gracias al formato ONNX y al reducido tamano del modelo.
- Lectura de contenido en aplicaciones de accesibilidad: el modelo puede convertir artículos, notificaciones o mensajes en audio para usuarios con discapacidad visual, con voces en castellano (`kokoro/ef_dora`, `kokoro/em_alex`) y en otros idiomas europeos.
- Generación de audiolibros y pódcasts automatizados: la variedad de más de cincuenta voces permite asignar timbres distintos a narradores o personajes, y el front-end espeak-ng facilita ajustar la pronunciación de nombres propios mediante fonemas IPA.
- Doblaje y localización de vídeos: al cubrir en-GB, en-US, es, fr, it, pt-BR, ja-JP, zh y hi, el modelo puede generar pistas de voz para contenido multilingüe en un mismo pipeline.
- Sistemas de anuncios y notificaciones en tiempo real: la inferencia ONNX en CPU y el tamano de 0,2 GB permiten desplegar el modelo en dispositivos de borde o servidores modestos para generar avisos hablados con baja latencia.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten validar un flujo de voz antes de invertir en modelos mayores pueden usar phoonnx con este modelo para generar respuestas de prueba en varios idiomas sin infraestructura GPU.
- Investigación en fonética y prosodia: la combinación de espeak-ng, misaki_en, misaki_ja y misaki_zh permite comparar rutas de fonemización y estudiar su efecto en la síntesis, útil para experimentos de evaluación de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas como MOS (Mean Opinion Score), MCD, WER de ASR sobre el audio sintetizado ni comparaciones numéricas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 82 millones de parámetros y pesos ONNX en un repo de 0,2 GB, la huella de memoria es reducida y cabe holgadamente en GPU consumer.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU con al menos unos pocos GB de VRAM (por ejemplo, RTX 3060, RTX 4090) sería suficiente, aunque la model card no lo confirma.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU consumer moderna e incluso en CPU, dado el tamano de 82M de parámetros y el formato ONNX.
- Opciones de despliegue: phoonnx (Python), plugin `ovos-tts-plugin-phoonnx` para OVOS y ejecución ONNX Runtime. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| styletts2-multi-kokoro-82m-espeak_misaki | 82M | 8 (en-GB, en-US, es, fr, hi, it, ja-JP, pt-BR, zh) | no aplica | Apache 2.0 | ONNX | Empaquetado phoonnx, más de 50 voces |
| hexgrad/Kokoro-82M (upstream) | 82M | varios | no aplica | Apache 2.0 | pesos originales (no ONNX) | Modelo base del que deriva esta ficha |
| onnx-community/Kokoro-82M-v1.0-ONNX | 82M | varios | no aplica | Apache 2.0 | ONNX | Conversión ONNX previa al empaquetado de Phoonnx |
| Otros modelos TTS de la colección StyleTTS2 de Phoonnx | no disponible | variable | no aplica | variable | ONNX | Alternativas del mismo autor de empaquetado |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la model card; al derivar de Kokoro-82M, hereda las características del dataset original, que no se detalla.
- Riesgo de alucinación: en TTS el riesgo se traduce en pronunciaciones incorrectas o prosodia anómala, especialmente al usar el port espyak en lugar de espeak-ng, según advierte la propia model card.
- Limitaciones de contexto o idioma: el modelo no procesa secuencias largas como un LLM; la síntesis se realiza por segmentos de texto. Algunos idiomas (hindi, chino, japonés) dependen de fonemizadores específicos y pueden requerir configuración adicional.
- Restricciones de licencia: el modelo upstream declara Apache 2.0, pero el front-end depende de espeak-ng y de los fonemizadores misaki, cuyas licencias deben verificarse por separado antes de un uso comercial.
- La librería phoonnx se instala con `pip install --pre`, lo que indica una versión preliminar con posible inestabilidad de API.
- Requiere instalar espeak-ng en el sistema (`apt install espeak-ng`) o el port espyak; sin ello, la fonemización falla o produce errores de pronunciación.
- El modelo tiene solo 18 descargas y 0 likes en el momento de la ficha, lo que sugiere poca validación por parte de la comunidad.
- No se documentan métricas de calidad objetivas, por lo que la evaluación de naturalidad debe hacerse empíricamente antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/styletts2-multi-kokoro-82m-espeak_misaki
- Modelo upstream Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Conversión ONNX: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
