# Phoonnx/vits-hu_hu-imre-medium-espeak-v2

## Resumen

vits-hu_hu-imre-medium-espeak-v2 es una voz de síntesis de voz (text-to-speech) en húngaro (hu-HU) basada en la arquitectura VITS del ecosistema Piper, convertida a formato ONNX para su uso con la librería phoonnx. El modelo original fue entrenado por Rhasspy y publicado dentro del repositorio rhasspy/piper-voices; TigreGotico Lda realiza la conversión a ONNX sin modificar los pesos, publicándola bajo la misma licencia CC0 1.0. Esta revisión (v2) sustituye a la anterior `Phoonnx/vits-hu_hu-imre-medium-espeak` porque el modelo upstream fue reentrenado sobre la base de Piper 1.5 (commit `e9c8a39444`).

Se trata de un modelo de un único hablante, con entrada de texto en forma de fonemas espeak (alfabeto IPA) y salida de audio a 22050 Hz. Su tamaño es reducido (63,2 MB en fp32 y 18,7 MB en int8 para el grafo), lo que lo hace apto para despliegue en CPU y en entornos con recursos limitados, como asistentes de voz locales o sistemas embebidos. No es un modelo de lenguaje: no genera texto ni razona, únicamente convierte fonemas en forma de onda.

Su relevancia actual radica en que ofrece una voz húngara de calidad media, con licencia CC0 (sin restricciones para uso comercial), en un formato ONNX portable y con una copia cuantizada a int8 que mantiene la tasa de error de palabra (WER) del modelo fp32 según la QA del autor. Está pensado para integrarse en pipelines de TTS dentro del ecosistema OVOS/phoonnx, así como en cualquier aplicación que consuma modelos ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | fp32 e int8 (quantize_dynamic con onnxruntime, pesos QInt8) |
| Idiomas soportados | húngaro (hu-HU) |
| Licencia | CC0 1.0 |
| Formato de pesos | ONNX (`.onnx` y `_int8.onnx`) |
| Frecuencia de muestreo | 22050 Hz |
| Hablantes | 1 |
| Entrada de texto | fonemas espeak, alfabeto IPA |
| Puntuación | entrenado con `, . ! ? : ;` (preservada desde phoonnx 1.96.1a1) |
| Fonemizador | espeak-ng, voz `hu` |
| Tamaño del repositorio | 0,1 GB |
| Tamaño del grafo | 63,2 MB (fp32) / 18,7 MB (int8) |
| Pico de RSS | 283,2 MB (fp32) / 242,0 MB (int8) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS tal como se implementa en Piper, un modelo generativo de extremo a extremo que combina un codificador de texto, un prior variacional y un decodificador basado en flujos normalizadores y un vocoder HiFi-GAN integrado. La entrada no es texto crudo sino fonemas en IPA obtenidos mediante espeak-ng con la voz `hu`, lo que desacopla la fonemización del modelo acústico. La salida es audio mono a 22050 Hz.

El entrenamiento lo realizó Rhasspy upstream. Según la model card, la voz se obtuvo por ajuste fino (finetuning) a partir del modelo base `rdh` (calidad media, `nl_BE`, un hablante flamenco, CC0), aplicando MRD y SDP. Los datos de entrenamiento proceden del conjunto de datos de OHF-Voice (https://github.com/OHF-Voice/voice-datasets), con licencia CC0; el número exacto de horas y la composición del dataset no están registrados upstream. Los ajustes de inferencia por defecto son `noise_scale` 0.5 y `noise_w` 0.333, y requiere Piper 1.5 o superior. La conversión a ONNX no altera los pesos; la variante int8 se genera con `onnxruntime.quantization.quantize_dynamic` (onnxruntime 1.32.0) y pesos QInt8.

## Capacidades

- Síntesis de voz (text-to-speech) en húngaro a partir de fonemas espeak en IPA.
- Salida de audio mono a 22050 Hz en formato WAV mediante la API de phoonnx.
- Soporte de puntuación de cláusula (`, . ! ? : ;`) en la síntesis con phoonnx 1.96.1a1 y posteriores.
- Variante cuantizada a int8 que reduce el tamaño del grafo de 63,2 MB a 18,7 MB manteniendo el WER de la variante fp32 según la QA del autor.
- Integración como plugin de OVOS (`ovos-tts-plugin-phoonnx`) seleccionable mediante configuración `mycroft.conf`.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni generación de texto: es exclusivamente un modelo acústico de TTS.
- Capacidad multilingüe: únicamente húngaro.

## Casos de uso

- Asistentes de voz locales en húngaro: el modelo puede integrarse en OVOS mediante `ovos-tts-plugin-phoonnx` para dotar de voz a un asistente doméstico sin depender de servicios en la nube, gracias a su reducido tamaño (18,7 MB en int8) y a su licencia CC0.
- Lectura de textos y notificaciones en aplicaciones de accesibilidad: permite convertir cadenas de texto en audio para usuarios con discapacidad visual, con una latencia baja (RTF 0,039 en fp32 con 4 hilos sobre un i9-11900H) adecuada para lectura interactiva.
- Sistemas de megafonía y avisos automatizados: la voz puede generar anuncios pregrabados o dinámicos en húngaro para transporte público, aeropuertos o comercios, con un coste computacional que permite ejecución en CPU.
- Integración en pipelines de CI/CD para pruebas de audio: al ser un modelo ONNX pequeño y determinista (con los parámetros de ruido fijados), sirve para generar audios de referencia en tests automatizados de sistemas de reconocimiento de voz.
- Prototipado rápido de interfaces conversacionales: desarrolladores que necesiten una voz húngara para validar un producto antes de contratar un servicio de TTS comercial pueden usar este modelo como solución provisional sin coste de licencia.
- Generación de contenido educativo y audiolibros en húngaro: la voz puede narrar material didáctico o textos largos divididos en cláusulas, aprovechando el soporte de puntuación para obtener prosodia razonable.
- Despliegue en dispositivos embebidos o de bajos recursos: el grafo int8 de 18,7 MB y un pico de RSS de 242 MB permiten ejecutar la síntesis en placas tipo Raspberry Pi o en contenedores ligeros, sin GPU.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la QA del autor, medidos con ASR `nemo-parakeet-tdt-0.6b-v3` int8 sobre 3 frases de FLORES-200 devtest, en un Intel Core i9-11900H a 2,50 GHz:

| Métrica | fp32 | int8 |
|---|---|---|
| Resultado QA | pass | pass |
| WER | 0,143 | 0,143 |
| Caracteres por segundo | 13,2 a 16,2 | no disponible |
| Longitud int8 / fp32 | no aplica | 0,97 a 1,00 |
| Tamaño del grafo | 63,2 MB | 18,7 MB |
| Pico de RSS | 283,2 MB | 242,0 MB |
| RTF (mediana de 3, 4 hilos) | 0,039 | 0,103 |

No se han publicado resultados de benchmarks estándar (MOS, MCD, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, el modelo está diseñado para ejecución en CPU; el pico de RSS medido es de 283,2 MB (fp32) y 242,0 MB (int8).
- GPU recomendadas: no se especifican; el modelo puede ejecutarse en CPU. Cualquier GPU compatible con ONNX Runtime serviría, pero no hay datos de rendimiento en GPU.
- Cabe en GPU de consumo: sí, por tamaño (63,2 MB fp32 / 18,7 MB int8), aunque no se han publicado métricas en GPU.
- Opciones de despliegue: phoonnx (librería nativa del modelo), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: RTF de 0,039 en fp32 y 0,103 en int8 con 4 hilos sobre un i9-11900H; es decir, la síntesis tarda entre el 3,9 % y el 10,3 % de la duración del audio generado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|---|
| Phoonnx/vits-hu_hu-imre-medium-espeak-v2 | VITS (Piper) | hu-HU | no disponible | no aplica | CC0 1.0 | ONNX |
| Phoonnx/vits-hu_hu-imre-medium-espeak | VITS (Piper) | hu-HU | no disponible | no aplica | CC0 1.0 | ONNX |
| rhasspy/piper-voices (hu/hu_HU/imre/medium) | VITS (Piper) | hu-HU | no disponible | no aplica | CC0 1.0 | Piper (ONNX upstream) |

La comparativa se limita a las variantes de la misma voz, ya que no se dispone de información sobre otras voces húngaras comparables en la documentación proporcionada. La diferencia principal entre la v2 y la v1 es que la v2 incorpora los pesos reentrenados sobre la base de Piper 1.5; la v1 conserva los pesos anteriores. No se dispone de datos de rendimiento comparativo entre ambas más allá de la QA publicada para la v2.

## Limitaciones y advertencias

- Modelo de un solo hablante y un solo idioma (húngaro); no admite cambio de voz ni otros idiomas.
- La entrada debe fonemizarse con espeak-ng; si se usa el port espyak incluido en `phoonnx[espeak]`, algunos fonemas difieren y ciertas palabras pueden pronunciarse incorrectamente.
- El WER de 0,143 medido sobre solo 3 frases de FLORES-200 devtest es una muestra muy reducida; no debe interpretarse como una estimación robusta de calidad.
- No hay datos publicados sobre sesgos, alucinaciones acústicas o comportamiento en dominios específicos (nombres propios, siglas, números, código).
- Los datos de entrenamiento no están registrados upstream más allá de la referencia a OHF-Voice; no se puede verificar la composición ni la cobertura del corpus.
- Licencia CC0 1.0: permite uso comercial sin restricciones, pero el autor solicita que se acredite a Rhasspy al usar la voz.
- Requiere Piper 1.5 o superior (o phoonnx 1.96.1a1 o posterior) para preservar la puntuación de cláusula en la síntesis.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- La fecha de creación indicada (2026-11-22) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hu_hu-imre-medium-espeak-v2
- Modelo upstream (Piper): https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/hu/hu_HU/imre/medium
- Repositorio anterior (v1): https://huggingface.co/Phoonnx/vits-hu_hu-imre-medium-espeak
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
- Dataset de voces OHF-Voice: https://github.com/OHF-Voice/voice-datasets
