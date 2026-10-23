# realSauron/ToneTunner-whisper-onnx

## Resumen

ToneTunner-whisper-onnx es un artefacto de inferencia, no un modelo entrenado desde cero: se trata de OpenAI Whisper Small exportado a ONNX, cuantizado a int8 y reorganizado en el conjunto de ficheros que carga el motor de ToneTunner, la aplicación Android de teclado por voz y dictado desarrollada por DevilVed. Lo publica el usuario realSauron en Hugging Face con licencia Apache-2.0 y pipeline `automatic-speech-recognition`. Su interés es práctico: permite reconocimiento de voz multilingüe completamente en el dispositivo, sin enviar audio a ningún servidor.

El modelo base, `openai/whisper-small`, es un transformer encoder-decoder de aproximadamente 244 millones de parámetros (12 capas de encoder y 12 de decoder, dimensión 768, 12 cabezas de atención) que procesa ventanas de audio de 30 segundos y cubre alrededor de un centenar de idiomas. La conversión a ONNX e int8 reduce el peso del artefacto a 242,7 MB, un tamaño manejable para almacenamiento y memoria de un teléfono de gama media.

La relevancia de esta ficha es acotada y conviene ser explícito: el repositorio no documenta ningún proceso de entrenamiento propio, no publica métricas de calidad tras la cuantización y no incluye los pesos en formatos estándar (safetensors o GGUF) que consuman transformers, llama.cpp o vLLM. Es un componente de despliegue para una app concreta, útil si se integra en ToneTunner o en un motor compatible con el mismo layout dividido, y de escaso valor fuera de ese contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) exportado a ONNX; encoder y decoder separados en el layout de ToneTunner |
| Parametros totales | ~244 millones (correspondientes a `openai/whisper-small`, modelo base) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Audio: ventanas de 30 segundos (1500 frames mel); texto: 448 tokens en el decoder (características del modelo base) |
| Tipos de cuantizacion | int8 (cuantizacion post-entrenamiento); el repositorio no distribuye variantes FP16, FP32, int4 ni GGUF |
| Idiomas soportados | Multilingüe (etiqueta `multilingual`; Whisper Small cubre alrededor de 99 idiomas según la documentación del modelo base) |
| Licencia | Apache-2.0 (declarada en el repositorio); el modelo original Whisper es MIT y el export ONNX procede de RTranslator, Apache-2.0 |
| Formato de pesos | ONNX dividido en seis ficheros dentro de `whisper_small_int8.zip`: `Whisper_initializer.onnx`, `Whisper_encoder.onnx`, `Whisper_cache_initializer.onnx`, `Whisper_cache_initializer_batch.onnx`, `Whisper_decoder.onnx`, `Whisper_detokenizer.onnx` |
| Tamano del artefacto | 242.722.488 bytes (~242,7 MB) para el ZIP; el repositorio completo ocupa 5,3 GB |
| SHA-256 del ZIP | `97ac121610693e8c9adaef9c6db9066ef0cbebba53ca6e47f6d1541068ca19e3` |
| Modelo base | `openai/whisper-small` |
| Pipeline | `automatic-speech-recognition` |
| Autor y fechas | realSauron; creado el 2026-10-22, actualizado el 2026-10-22 |
| Descargas / likes | 0 descargas, 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Small sin modificaciones de diseño: un encoder que consume espectrogramas mel de 80 bandas sobre ventanas de 30 segundos y un decoder autorregresivo con atención cruzada, más tokens especiales de idioma, transcripción y marcas temporales. La innovación de este repositorio no está en el modelo sino en el empaquetado: el grafo se ha dividido en módulos (inicializador, encoder, inicializadores de caché para decodificación con y sin batch, decoder y detokenizer) para que el motor de ToneTunner pueda ejecutar la decodificación paso a paso reutilizando la caché KV. La exportación y la cuantización proceden de RTranslator, el proyecto de traducción en dispositivo de niedev.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del corpus ni sobre etapas de ajuste fino, RLHF o DPO aplicadas por el autor: el repositorio es una conversión de un modelo preentrenado por OpenAI. Tampoco se documenta el método exacto de cuantización (calibración, granularidad por canal o por tensor, tratamiento de operadores sensibles) ni si se aplicaron técnicas de decodificación especulativa o atención lineal. Cualquier afirmación sobre pérdida de precisión tras el paso a int8 requeriría una evaluación que el autor no publica.

## Capacidades

- Transcripción de voz a texto multilingüe, con detección automática de idioma mediante los tokens especiales de Whisper.
- Traducción de voz a texto en inglés desde otros idiomas, capacidad heredada del modelo base.
- Segmentación en ventanas de 30 segundos con marcas temporales a nivel de segmento.
- Ejecución totalmente local: el audio no abandona el dispositivo, lo que habilita casos de uso con requisitos de privacidad.
- Funcionamiento sin conexión de red una vez descargado e instalado el ZIP.
- Integración con el motor de ToneTunner para dictado en el teclado del sistema Android.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente de ASR.
- No tiene capacidades de visión, audio generation ni texto generativo libre más allá de la transcripción.

## Casos de uso

- Dictado por voz en Android sin conexión: el modelo se instala desde Ajustes → Modelo en el dispositivo de ToneTunner y transcribe en local, lo que resulta adecuado para usuarios con conectividad intermitente o que no quieren enviar audio a la nube.
- Notas de voz y actas de reuniones en el móvil: con ventanas de 30 segundos procesadas secuencialmente se pueden transcribir grabaciones largas por tramos, siempre que la aplicación gestione el troceado y la concatenación.
- Aplicaciones de accesibilidad para personas con movilidad reducida: al ejecutarse en el propio dispositivo y pesar 242,7 MB en int8, encaja en terminales de gama media sin necesidad de GPU dedicada.
- Entornos sanitarios o jurídicos con datos sensibles: la inferencia local evita transferencias de audio a terceros, lo que simplifica el análisis de cumplimiento respecto a soluciones en la nube.
- Transcripción de campo en inspecciones o logística: operarios que trabajan en zonas sin cobertura pueden dictar informes y sincronizarlos después.
- Base para experimentos de ASR en dispositivo: sirve como referencia para medir latencia y consumo de un Whisper Small int8 en ONNX Runtime frente a alternativas en GGUF o en formatos propietarios.
- Subtitulado básico de audio corto en aplicaciones móviles: las marcas temporales por segmento permiten generar subtítulos aproximados para clips de menos de 30 segundos por bloque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tasas de error de palabra (WER) del modelo int8, ni comparaciones con el Whisper Small original en FP16/FP32, ni mediciones de latencia o consumo en dispositivos concretos. Tampoco se aportan resultados de MMLU, HumanEval o GSM8K, que además no aplicarían a un modelo de reconocimiento de voz.

## Requisitos de hardware

- Almacenamiento: 242,7 MB para el ZIP `whisper_small_int8.zip`; el espacio ocupado tras la instalación no está documentado.
- Memoria: los pesos int8 rondan los 244 MB, por lo que el pico de RAM será superior al sumar activaciones del encoder, caché KV del decoder y el runtime de ONNX; el valor exacto no está disponible.
- Hardware objetivo: teléfonos Android, ejecución en CPU mediante ONNX Runtime; no se requiere GPU ni NPU, aunque el rendimiento en cada SoC no está documentado.
- GPU de escritorio: no necesaria. Cualquier CPU x86-64 moderna puede ejecutar el grafo con ONNX Runtime; una GPU solo tendría sentido para procesar grandes volúmenes en paralelo.
- Compatibilidad de despliegue: limitada a motores que acepten este layout dividido. No es utilizable directamente con vLLM, TGI, llama.cpp, Ollama ni transformers, ya que no se publican safetensors ni GGUF. Las opciones realistas son ONNX Runtime (Python, C++, Java/Kotlin) y el motor propio de ToneTunner.
- Latencia y throughput: no disponibles. Dependerán del SoC, del número de hilos asignados y de si se procesa en streaming o por ventanas completas de 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Formato | Licencia | Orientación |
|---|---|---|---|---|---|
| realSauron/ToneTunner-whisper-onnx | ~244 M | 30 s | ONNX int8 dividido | Apache-2.0 | Inferencia en Android |
| openai/whisper-small | ~244 M | 30 s | PyTorch (safetensors/bin) | MIT | Entrenamiento e inferencia general |
| openai/whisper-base | ~74 M | 30 s | PyTorch | MIT | Menor tamaño, menor precision esperada |
| RTranslator (export de referencia, niedev) | ~244 M y otros | 30 s | ONNX int8 dividido | Apache-2.0 | Traducción y ASR en dispositivo |

La comparación con `whisper-base` y `whisper-small` es estructural: este repositorio no aporta métricas propias que permitan afirmar equivalencia de calidad con el modelo en punto flotante. Frente a una distribución GGUF para whisper.cpp, la diferencia práctica es de ecosistema: aquí se gana integración con ToneTunner y se pierde portabilidad. No se dispone de datos para comparar WER ni latencia con `distil-whisper` u otras variantes destiladas.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay WER ni pruebas de regresión que cuantifiquen la pérdida de precision introducida por la cuantización int8.
- Formato no estándar: los seis ficheros ONNX con inicializadores separados no se cargan con transformers ni con las herramientas habituales de ASR; requieren el motor de ToneTunner o una integración a medida.
- Ventana rígida de 30 segundos: audios más largos exigen troceado externo, con riesgo de cortes en palabras y de pérdida de contexto entre segmentos.
- Riesgo de alucinación específico de ASR: Whisper puede generar texto plausible en tramos con silencio, ruido o música, y repetir frases en bucles; es un comportamiento conocido del modelo base que la cuantización no corrige.
- Sesgos heredados: el rendimiento depende del idioma, del acento y de la calidad del audio; los idiomas con menos datos en el corpus de Whisper presentan tasas de error notablemente peores, aunque no se aportan cifras.
- Idiomas: la etiqueta `multilingual` no detalla la lista efectiva ni la calidad por idioma; para español no hay métricas disponibles en este repositorio.
- Licencia: se declara Apache-2.0, pero conviene conservar la atribución a OpenAI (MIT) y a RTranslator (Apache-2.0) al redistribuir; el repositorio no incluye un fichero de aviso adicional visible en la información disponible.
- Discrepancia de tamaño: el repositorio ocupa 5,3 GB mientras que el único fichero documentado son 242,7 MB, lo que sugiere historial de versiones u otros artefactos no listados; verificar antes de asumir el contenido.
- Madurez: 0 descargas y 1 like indican un artefacto recién publicado y sin validación por parte de la comunidad; no se documentan pruebas en dispositivos concretos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/realSauron/ToneTunner-whisper-onnx
- Modelo base en Hugging Face: https://huggingface.co/openai/whisper-small
- Código de OpenAI Whisper: https://github.com/openai/whisper
- Artículo del modelo base (Whisper, 2022): https://arxiv.org/abs/2212.04356
- Aplicación ToneTunner: https://github.com/DevilVed/ToneTunner
- Origen del export ONNX e int8 (RTranslator, niedev): https://github.com/niedev/RTranslator
