# ShinePixelOrg/Audio8-TTS-Preview-0.1b-MLX-Codec-Q8

## Resumen

Audio8-TTS-Preview-0.1b-MLX-Codec-Q8 es una conversión de terceros, realizada por ShinePixelOrg, del modelo de síntesis de voz Edge0/Audio8-TTS-Preview-0.1b para su ejecución local en Apple Silicon mediante la librería MLX. El modelo original lo desarrolla Edge0 (Audio8) y está orientado a la generación de voz multilingüe y a la clonación de voz zero-shot a partir de una grabación de referencia y su transcripción. Esta variante concreta no modifica los pesos del generador principal (se mantienen en BF16), sino que cuantiza únicamente el códec de audio de 44,1 kHz a Q8, reduciendo de forma notable el consumo de memoria.

La relevancia de esta conversión es práctica: el modelo original en FP32 requiere cerca de 6 GB de pico de memoria durante la inferencia, mientras que esta versión Q8 baja a unos 1,9 GB, lo que permite ejecutar TTS con clonación de voz en equipos Apple con memoria unificada modesta. El repositorio incluye un script `infer.py` y operadores personalizados (`qconv.py`, `qtranspose.py`) necesarios para cargar el diseño de convoluciones empaquetadas del códec cuantizado.

El modelo tiene 169.779.904 parámetros en el generador (aproximadamente 0,17 B, comercializado como "0.1b") y se distribuye bajo la licencia Audio8 Community License v1.0, que restringe la redistribución y el uso comercial según los términos del fichero LICENSE incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Generador de tokens acústicos y de lenguaje (BF16) más códec de audio neuronal independiente a 44,1 kHz; conversión para MLX |
| Parametros totales | 169.779.904 (generador, según safetensors); el códec cuantizado ocupa 359.230.364 bytes |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Códec en Q8 afín con group size 64 (capas lineales, Conv1d y Conv1d transpuestas elegibles); resto de tensores del códec en FP16; generador en BF16 |
| Idiomas soportados | no disponible en esta ficha; la model card remite a la cobertura de idiomas del modelo original (los ejemplos de uso son en mandarín) |
| Licencia | Audio8 Community License v1.0 (license: other) |
| Formato de pesos | safetensors (`model.safetensors` en BF16 y `codec.safetensors` en Q8/FP16), runtime MLX |

## Arquitectura y entrenamiento

El modelo sigue un esquema de TTS neuronal en dos etapas: un generador principal que produce tokens de lenguaje y acústicos a partir del texto (y, opcionalmente, de una referencia de voz y su transcripción) y un códec de audio separado que reconstruye la forma de onda a 44,1 kHz en mono. En esta conversión, el generador conserva los tensores BF16 originales del checkpoint de Edge0, mientras que el códec se ha cuantizado con cuantización afín de 8 bits y grupo de 64 en las capas lineales y convolucionales elegibles, dejando el resto en FP16. El layout empaquetado de las convoluciones exige usar los operadores `qconv.py` y `qtranspose.py` que acompañan al repositorio.

No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron etapas de RLHF o DPO en la información proporcionada. La model card del autor de la conversión indica que la cobertura de idiomas y los detalles de entrenamiento están documentados en la model card original de Edge0, pero no reproduce esos datos. La innovación técnica destacable de esta variante es la cuantización selectiva del códec: según las mediciones del autor, el SNR de forma de onda respecto al códec FP32 es de 36,03 dB con decodificación de tokens fijos, y la similitud de hablante ECAPA frente a la referencia mejora ligeramente (0,712 con Q8 frente a 0,682 con FP32), aunque la cuantización del encoder de referencia altera 2.126 de 6.460 índices del códec en la prueba realizada.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con salida en WAV mono a 44,1 kHz.
- Clonación de voz zero-shot condicionada por una grabación de referencia y su transcripción correspondiente.
- Generación de audio de duración variable: admite entradas largas mediante `--text-file`, procesadas por segmentos (en la prueba del autor, 1.000 caracteres divididos en 25 segmentos de hasta 58 caracteres).
- Capacidades multilingües: la model card remite a la cobertura del modelo original; no se detalla la lista de idiomas en esta ficha.
- Ejecución local en Apple Silicon mediante MLX 0.32.4 y Metal.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento; es un modelo exclusivamente de audio.

## Casos de uso

- Clonación de voz con consentimiento para doblaje o locución personalizada: se suministra una grabación de referencia y su transcripción para generar nuevas locuciones con la misma voz, con la ventaja de que el modelo cabe en unos 1,9 GB de memoria en un Mac.
- Generación de audiolibros y contenido narrado por lotes: el soporte de `--text-file` y el procesado por segmentos permiten convertir textos largos (1.000 caracteres en unos 218 s en la medición del autor) en audio continuo.
- Prototipado de asistentes de voz en local: al ejecutarse íntegramente en el dispositivo con MLX, permite iterar sobre interfaces conversacionales sin depender de servicios en la nube.
- Accesibilidad: conversión de texto a voz para lectura de documentos o interfaces en equipos Apple, con un consumo de memoria contenido que deja margen para otras aplicaciones.
- Investigación en TTS y evaluación de cuantización: la comparación FP32 frente a Q8 documentada (CER, similitud ECAPA, SNR) sirve como referencia para estudiar el impacto de la cuantización del códec en la calidad de voz.
- Pruebas de integración en pipelines de audio en macOS: el formato safetensors y el runtime MLX permiten incorporar el modelo a scripts de generación de audio dentro de flujos de producción locales.

## Benchmarks y rendimiento

Las únicas métricas publicadas en la información disponible son las mediciones del autor de la conversión, realizadas con MLX 0.32.4 sobre Metal en macOS, con una referencia de 30 segundos y una única voz en mandarín:

| Métrica | Códec FP32 | Códec Q8 |
|---|---:|---:|
| Pico de memoria, frase corta | 5,987 GB | 1,899 GB |
| Pico de memoria, 1.000 caracteres | no disponible | 1,920 GB |
| Audio generado para 1.000 caracteres | no disponible | 217,57 s |
| CER (Whisper large-v3-turbo) | 7,14 % | 7,14 % |
| Similitud de hablante ECAPA frente a referencia | 0,682 | 0,712 |
| SNR de forma de onda frente a FP32 | — | 36,03 dB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de audio y no de texto.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 1,9 GB de pico de proceso con el códec Q8 en una frase corta y 1,92 GB en una generación de 1.000 caracteres; con el códec FP32 el pico sube a unos 5,99 GB.
- Hardware objetivo: Apple Silicon (macOS con Metal); el autor no documenta soporte para GPU NVIDIA ni otros aceleradores en esta conversión.
- Cabe en equipos de consumo Apple con memoria unificada de 8 GB o superior, dado el pico inferior a 2 GB medido, aunque los límites de memoria en dispositivos móviles requieren mediciones específicas según el autor.
- Opciones de despliegue: runtime MLX con el script `infer.py` incluido y los operadores `qconv.py` y `qtranspose.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en la medición del autor, 1.000 caracteres generaron 217,57 s de audio; no se publican cifras de latencia por carácter ni de throughput más allá de este dato.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Audio8-TTS-Preview-0.1b-MLX-Codec-Q8 (esta ficha) | 169,8 M (generador) | no disponible | Audio8 Community License v1.0 | Hugging Face, MLX | Conversión Q8 del códec para Apple Silicon |
| Edge0/Audio8-TTS-Preview-0.1b | ~0,1 B | no disponible | Audio8 Community License v1.0 | Hugging Face | Modelo original en BF16/FP32, sin cuantización del códec |
| Otras alternativas de TTS zero-shot de tamaño compacto | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Las mediciones publicadas cubren una sola referencia de voz y una única carga de trabajo en mandarín; no son representativas de otros idiomas, voces o duraciones.
- La cuantización del encoder de referencia modifica los índices del códec (2.126 de 6.460 en la prueba), por lo que la salida de clonación puede diferir aunque los pesos del generador sean idénticos a los del modelo original.
- La calidad de la clonación depende de la grabación de referencia y de su transcripción; no se documentan umbrales mínimos de calidad de la referencia.
- Riesgo de alucinación y artefactos acústicos inherente a los modelos generativos de audio; no se documentan tasas de error más allá del CER del 7,14 % medido con Whisper large-v3-turbo.
- La licencia Audio8 Community License v1.0 es de tipo "other": es imprescindible revisar el fichero LICENSE incluido antes de redistribuir o usar comercialmente el modelo o el códec derivado.
- La cobertura de idiomas no se detalla en esta ficha; debe consultarse la model card del modelo original.
- El autor advierte de que los límites de memoria y el rendimiento en dispositivos móviles requieren mediciones específicas no realizadas.
- Solo se documenta ejecución en Apple Silicon con MLX 0.32.4; no hay garantías de funcionamiento en otras plataformas o versiones.

## Enlaces

- Repositorio de la conversión: https://huggingface.co/ShinePixelOrg/Audio8-TTS-Preview-0.1b-MLX-Codec-Q8
- Modelo original: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.1b
- Revisión fijada del modelo original: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.1b/tree/8c837020ab800498834038363dea06757872afda
- Licencia original fijada: https://huggingface.co/Edge0/Audio8-TTS-Preview-0.1b/blob/8c837020ab800498834038363dea06757872afda/LICENSE
- Repositorio GitHub del proyecto: https://github.com/Edge0-AI/Audio8_TTS
