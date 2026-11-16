# Phoonnx/styletts2-gl_es-celtia-cotovia

## Resumen

styletts2-gl_es-celtia-cotovia es un modelo de síntesis de voz (text-to-speech) en gallego (gl-ES) basado en la arquitectura StyleTTS2. Lo publica Phoonnx como empaquetado ONNX del modelo original de Proxecto Nós, `proxectonos/Nos_StyleTTS2-Celtia-GL`, con el objetivo de hacerlo ejecutable dentro de su librería de TTS sobre ONNX (phoonnx) y del ecosistema OVOS. El modelo toma texto en alfabeto cotovia, lo convierte a fonemas mediante el fonemizador Cotovia (incluido en `scriptconv[gl]`) y genera audio con capacidad de clonación de voz a partir de audio de referencia.

La relevancia del modelo es acotada pero clara: cubre una lengua de bajos recursos como el gallego con una arquitectura TTS moderna, licencia Apache 2.0 y un pipeline reproducible en Python. El repositorio ocupa 0,8 GB y las descargas son todavía muy bajas (19 en el momento de la consulta), lo que indica un modelo de nicho, orientado a integraciones concretas más que a uso generalista.

No se dispone de información pública sobre número de parámetros, longitud de contexto (no aplica en TTS), datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (TTS neuronal con estilo y clonación de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en formato ONNX) |
| Idiomas soportados | gallego (gl-ES) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (empaquetado para phoonnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura StyleTTS2, un sistema TTS neuronal que separa contenido lingüístico y estilo prosódico, y que permite clonar la voz de un hablante a partir de audio de referencia. El empaquetado de Phoonnx exporta el modelo a ONNX para su ejecución con la librería phoonnx, que además gestiona la normalización de texto y la fonemización mediante scriptconv. En concreto, el front-end textual usa `CotoviaPhonemizer` de `scriptconv_copyleft.phonemizers.gl`, disponible con el extra `scriptconv[gl]`, y trabaja sobre el alfabeto cotovia.

No se han publicado en la información disponible detalles sobre el volumen de datos de entrenamiento, la composición del corpus, el hablante original (Celtia), ni si hubo ajuste fino con RLHF/DPO u otras técnicas. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias de StyleTTS2 y de la exportación a ONNX.

## Capacidades

- Síntesis de voz en gallego (gl-ES) a partir de texto en alfabeto cotovia.
- Conversión texto a fonemas mediante el fonemizador Cotovia integrado en scriptconv.
- Clonación de voz a partir de audio de referencia (el modelo "clona un hablante de audio de referencia", según la model card).
- Generación de audio en formato WAV mediante la API de phoonnx (`voice.synthesize_wav`).
- Integración con OVOS a través del plugin `ovos-tts-plugin-phoonnx`, seleccionable en `mycroft.conf`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Asistentes de voz en gallego sobre OVOS: el modelo se integra como plugin TTS (`ovos-tts-plugin-phoonnx`) y permite dotar a un asistente doméstico de voz sintética en gl-ES sin infraestructura adicional más allá de la librería phoonnx.
- Lectura de contenido en gallego: artículos, avisos o documentación pueden convertirse a audio con `voice.synthesize_wav`, aprovechando el front-end cotovia para una pronunciación consistente.
- Accesibilidad para personas con discapacidad visual: generación de audiolibros o lectura de pantalla en gallego, con la posibilidad de clonar una voz de referencia concreta para mantener familiaridad.
- Locución para vídeos y pódcast en gallego: la clonación de voz permite generar narraciones con una voz concreta a partir de una muestra de referencia, útil para productoras de contenido en lengua gallega.
- Prototipado de interfaces de voz: al ser un paquete ONNX ligero (0,8 GB) y con licencia Apache 2.0, sirve para validar productos de voz en gallego antes de invertir en modelos propietarios.
- Investigación en TTS para lenguas de bajos recursos: el modelo y su pipeline (scriptconv + Cotovia) son una base reproducible para experimentar con fonemización y síntesis en gallego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio ocupa 0,8 GB en disco, por lo que la inferencia en ONNX debería caber en GPUs consumer con holgura, aunque no se confirma.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No confirmado; por tamaño de artefacto (0,8 GB) es plausible en GPUs con 4-8 GB de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: phoonnx (Python) y OVOS mediante `ovos-tts-plugin-phoonnx`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| styletts2-gl_es-celtia-cotovia (este) | StyleTTS2 | gl-ES | Apache 2.0 | ONNX | Empaquetado phoonnx, clonación de voz |
| proxectonos/Nos_StyleTTS2-Celtia-GL | StyleTTS2 | gl-ES | Apache 2.0 | no disponible en la información | Modelo upstream del que deriva este |
| Otros modelos de la colección StyleTTS2 de Phoonnx | StyleTTS2 | varios | no disponible | ONNX | Mismo pipeline de empaquetado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo gallego (gl-ES); no se documenta soporte para castellano ni otras lenguas.
- Dependencia del front-end cotovia: el texto debe pasar por el fonemizador Cotovia; un texto mal normalizado o fuera de ese alfabeto puede degradar la síntesis.
- Clonación de voz: requiere audio de referencia y abre riesgos de suplantación o uso indebido de la voz; conviene aplicar controles de consentimiento en producción.
- Riesgo de alucinación no aplica en el sentido textual, pero sí puede producirse una prosodia o pronunciación incorrecta en palabras fuera del dominio de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (MOS, WER) para comparar con alternativas.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo upstream y de los datos de voz originales.
- Adopción muy baja (19 descargas, 0 likes): menor probabilidad de soporte comunitario y de corrección de errores.
- No se documentan sesgos específicos ni limitaciones de contexto (no aplica a TTS).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/styletts2-gl_es-celtia-cotovia
- Modelo upstream: https://huggingface.co/proxectonos/Nos_StyleTTS2-Celtia-GL
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección StyleTTS2 de Phoonnx: https://huggingface.co/collections/Phoonnx/styletts2-6af8ea97037f3d7eaf4b89c7
