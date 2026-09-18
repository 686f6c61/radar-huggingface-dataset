# miguelamendez/mica-granite-speech-5

## Resumen

`miguelamendez/mica-granite-speech-5` es un repositorio de artefactos de ejecución del runtime Mica para el modelo de reconocimiento automático de voz (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, fijado a la revisión `6c14d3d052a602d850f1bc4aa017f25f4adf6aa0`. No se trata de un entrenamiento nuevo ni de un ajuste fino: el autor redistribuye el checkpoint original en formatos cuantizados (MLX Q4/Q8 y GGUF Q4_K/Q8_0) con conversiones selectivas que preservan ciertas capas en precisión original, y valida su funcionamiento real con el servidor Mica.

El modelo subyacente es un ASR convolucional CTC de 470 millones de parámetros, con 16 bloques conformer, 1.024 dimensiones ocultas, ocho cabezas de atención, atención por bloques de 128 tramas, submuestreo temporal de 100 Hz a 12,5 Hz y una cabeza de salida BPE de 16.384 unidades. La decodificación CTC greedy es no autorregresiva, por lo que no hay contexto de tokens, caché KV ni límite de salida generada en el sentido habitual de un modelo de lenguaje; todo el perfilado se hace en términos de duración de audio, tamaño de chunk y solapamiento.

Su relevancia práctica es doble. Por un lado, ofrece una vía de despliegue de un modelo ASR Apache-2.0 en hardware de Apple Silicon y en runtimes GGUF con Metal, con conversiones que el autor documenta y valida. Por otro, expone explícitamente los límites de esa validación: los resultados publicados corresponden a clips cortos, no certifican streaming ilimitado, archivos de varias horas ni batching concurrente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer convolucional con decodificacion CTC; 16 bloques conformer, 1.024 dimensiones ocultas, 8 cabezas de atencion, atencion por bloques de 128 tramas, submuestreo temporal de 100 Hz a 12,5 Hz, cabeza de salida BPE de 16.384 unidades |
| Parametros totales | 470.000.000 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica en tokens: decodificacion CTC no autorregresiva, sin cache KV ni limite de salida generada. El autor no declara una duracion maxima de audio de entrada; el perfilado se realiza con duracion maxima de audio, duracion de chunk, solapamiento, tamano de lote y memoria pico medida |
| Tipos de cuantizacion | MLX affine selectivo Q4 y Q8 (group size 64); GGUF Q4_K y Q8_0; candidatos GPTQ W4A16 y W8A16 group-128 (calibrados y recargables, no publicados) |
| Idiomas soportados | Ingles (en) unicamente |
| Licencia | Apache-2.0 (el checkpoint seleccionado no es la variante `-nc` no comercial) |
| Formato de pesos | safetensors (Transformers), MLX (mlx/q4 y mlx/q8), GGUF (Q4_K y Q8_0) |

## Arquitectura y entrenamiento

La arquitectura es un codificador conformer con decodificación CTC. El modelo tiene 16 bloques conformer, 1.024 dimensiones ocultas y ocho cabezas de atención, con atención limitada a bloques de 128 tramas y un submuestreo temporal que reduce la secuencia de 100 Hz a 12,5 Hz. La cabeza de salida es un vocabulario BPE de 16.384 unidades y la decodificación greedy CTC es no autorregresiva: una sola pasada hacia delante produce la transcripción, sin bucle de decodificación ni caché de claves y valores. El campo posicional de 512 y el bloque de atención de 128 tramas son internos de la arquitectura y el autor advierte explícitamente que no deben interpretarse como límites de duración del audio.

El entrenamiento upstream reportado comprende aproximadamente 60.000 horas de audio en inglés procedente de conjuntos de datos públicos junto con mezclas sintéticas declaradas. No se publica una duración máxima de utterance de entrenamiento ni una duración de audio de entrada soportada, y no se documenta en la información disponible el uso de RLHF, DPO u otras etapas de alineación, algo esperable en un modelo CTC de ASR.

La innovación relevante de este repositorio no está en el modelo sino en el proceso de cuantización. La conversión a MLX mantiene en precisión original cuatro módulos: `encoder.input_linear` (única frontera aprendida de entrada de características acústicas), `encoder.out` (compartido por los logits CTC intermedios y finales), `encoder.out_mid` (que realimenta las predicciones CTC intermedias en el codificador) y `ctc_head` (cabeza de salida atada que requiere el cargador de Transformers). El autor documenta que una cuantización Q4 uniforme corrompía la transcripción de control, mientras que el Q4 selectivo y el Q8 coincidieron exactamente con la transcripción BF16 sobre un clip fijo de 8,608 segundos.

## Capacidades

- Reconocimiento automático de voz en inglés sobre audio, con salida de transcripción directa mediante decodificación CTC greedy.
- Inferencia no autorregresiva en una sola pasada, sin generación token a token ni caché KV.
- Ejecución con runtime MLX en Apple Silicon (formatos q4 y q8) y con runtime GGUF sobre Metal (Q4_K y Q8_0).
- Servicio HTTP de transcripción mediante el servidor Mica, validado con peticiones reales en el repositorio.
- Uso comercial permitido por licencia Apache-2.0.
- No soporta modo de razonamiento (`reasoning.supported: false` en el manifiesto Mica).
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso.
- No dispone de capacidades de visión, audio generativo ni salida multimodal: la entrada es audio y la salida es texto.
- No dispone de soporte multilingüe: únicamente inglés.
- Recarga de pesos compatible con el cargador de Transformers para el checkpoint BF16 y para los candidatos GPTQ W4A16/W8A16 group-128.

## Casos de uso

- Transcripción local en Apple Silicon: los artefactos MLX Q4 y Q8 permiten ejecutar el modelo en un Mac con chip M4 y obtener transcripciones a aproximadamente 135 veces el tiempo real en clips cortos, sin enviar audio a servicios externos.
- Servicio HTTP de ASR autoalojado: el servidor Mica expone el modelo por HTTP y el autor ha validado transcripciones reales sobre los artefactos selectivos Q4 y Q8, lo que permite montar un endpoint interno de dictado o transcripción.
- Integración en aplicaciones de escritorio macOS con Metal: los artefactos GGUF Q4_K y Q8_0 han pasado inferencia real sobre Metal, de modo que un cliente basado en llama.cpp puede transcribir audio sin depender de CUDA.
- Subtitulado de contenido en inglés: al ser un modelo exclusivamente en inglés y de decodificación no autorregresiva, resulta adecuado para generar subtítulos de una sola pasada sobre material audiovisual en ese idioma, siempre que se trocee el audio según los límites de chunk del perfil.
- Preprocesado de corpus de voz a gran escala: con 60.000 horas de audio de entrenamiento y una cabeza BPE de 16.384 unidades, el modelo sirve como transcriptor en pipelines offline de preparación de datos (indexado, etiquetado, búsqueda por voz) sobre material en inglés.
- Evaluación de regresión de cuantizaciones: el autor compara cada artefacto contra una transcripción BF16 de referencia sobre un clip fijo de 8,608 segundos, lo que permite usar el repositorio como banco de pruebas para decidir entre Q4 y Q8 sin degradar la transcripción.
- Productos con requisitos de licencia permisiva: al ser Apache-2.0 y no la variante `-nc`, el checkpoint puede incorporarse a productos comerciales cerrados, algo determinante en la elección frente a otros modelos de voz con licencias restrictivas.
- Experimentación con GPTQ en ASR: los candidatos W4A16 y W8A16 group-128 se recargan y coinciden con la transcripción BF16 en inferencia por lotes de tamaño 2 con Transformers, lo que permite reproducir ese trabajo de cuantización aunque los artefactos no estén publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye cifras de WER, MMLU, HumanEval, GSM8K ni de ningún otro conjunto estándar, y tampoco se han encontrado en la búsqueda web.

Los únicos datos cuantitativos disponibles son medidas de validación de latencia y fidelidad de transcripción, no comparativas contra otros modelos:

| Medicion | Valor | Entorno |
|---|---|---|
| Tiempo de modelo mediano, MLX Q4 selectivo | 0,0637 s para un clip de 3,505 s | Apple M4, 5 ejecuciones en caliente tras warmup |
| Tiempo de modelo mediano, MLX Q8 selectivo | 0,0635 s para un clip de 3,505 s | Apple M4, 5 ejecuciones en caliente tras warmup |
| Velocidad relativa | Aproximadamente 135x tiempo real | Apple M4, clips cortos |
| Fidelidad de transcripcion | Q4 selectivo y Q8 coinciden exactamente con BF16 | Clip de calidad fijo de 8,608 s |
| Q4 uniforme | Corrompe la transcripcion de control | Clip de calidad fijo de 8,608 s |
| GGUF Q4_K y Q8_0 | Pasan inferencia real sobre Metal | macOS con Metal |

## Requisitos de hardware

- Estimación de memoria de pesos a partir del recuento de 470 millones de parámetros (cálculo propio; el autor no publica cifras de VRAM): en BF16 aproximadamente 0,94 GB; en Q8 aproximadamente 0,47 GB; en Q4 aproximadamente 0,24-0,30 GB. Hay que sumar las activaciones del codificador de audio y el espacio de trabajo del runtime.
- El repositorio completo ocupa 1,6 GB e incluye varios formatos, por lo que el tamaño de descarga no equivale al consumo en inferencia.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM es suficiente para los pesos cuantizados, incluidas RTX 3060, RTX 4060, RTX 4090 y superiores. En BF16 basta con tarjetas de 4-6 GB.
- Cabe en memoria unificada de Apple Silicon: validado por el autor en un chip M4 con los runtimes MLX y GGUF sobre Metal.
- No se publican cifras oficiales de VRAM pico ni de memoria máxima certificada. Un perfil de Granite debe declarar `max_audio_seconds`, `chunk_seconds`, solapamiento, número máximo de flujos concurrentes y un pico de memoria certificado; los valores que superan el clip más largo probado generan aviso en modo experimental y fallan en modo certificado.
- Opciones de despliegue: servidor Mica (HTTP), runtime MLX, runtimes GGUF/llama.cpp con Metal y Transformers para safetensors y los candidatos GPTQ.
- vLLM no está soportado: no se publican artefactos para ese backend porque los candidatos estructurales no superaron la puerta de producción y el núcleo de vLLM todavía no dispone de un cargador nativo `granite_speech5_ctc`.
- Latencia medida: 0,0637 s (Q4) y 0,0635 s (Q8) de mediana para un clip de 3,505 segundos en Apple M4, unas 135 veces el tiempo real. No se publican cifras de throughput con batching concurrente ni de clips largos.

## Comparativa con modelos similares

La información disponible no incluye datos de benchmarks ni especificaciones de otros modelos de ASR, y la búsqueda web no devolvió ningún resultado relevante (únicamente páginas de una marca de ropa, sin relación con el modelo). La comparativa se limita por tanto a las variantes desplegables del mismo modelo, que es la decisión real que afronta quien descarga este repositorio:

| Variante | Parametros | Formato | Precision de transcripcion | Backend | Disponible |
|---|---|---|---|---|---|
| Checkpoint upstream BF16 | 470 M | safetensors | Referencia | Transformers | Si (repo de IBM) |
| Mica MLX Q4 selectivo | 470 M | MLX affine, group size 64 | Coincide con BF16 en el clip de 8,608 s | MLX, servidor Mica | Si |
| Mica MLX Q8 selectivo | 470 M | MLX affine, group size 64 | Coincide con BF16 en el clip de 8,608 s | MLX, servidor Mica | Si |
| Mica GGUF Q4_K | 470 M | GGUF | Inferencia Metal superada; fidelidad no detallada | llama.cpp, Metal | Si |
| Mica GGUF Q8_0 | 470 M | GGUF | Inferencia Metal superada; fidelidad no detallada | llama.cpp, Metal | Si |
| GPTQ W4A16 / W8A16 group-128 | 470 M | GPTQ | Coincide con BF16 en lote de tamano 2 | Transformers | No publicados (calibracion con un solo registro) |
| vLLM | 470 M | no disponible | no disponible | vLLM | No publicado |

Comparativa con modelos de otras familias: no disponible en la información proporcionada, ya que no se han facilitado especificaciones ni resultados de WER de alternativas como la familia Whisper u otros ASR de tamaño similar.

## Limitaciones y advertencias

- Idioma: el modelo solo soporta inglés. No hay capacidades multilingües.
- Ausencia de benchmarks: no se publican cifras de WER ni comparativas con otros modelos, por lo que no es posible situar su precisión frente a alternativas sin una evaluación propia.
- Validación limitada en duración: los resultados publicados corresponden a clips de 3,505 y 8,608 segundos. El autor advierte explícitamente que estos resultados no certifican streaming ilimitado, archivos de varias horas ni batching concurrente.
- Modo certificado de Mica: los valores de `max_audio_seconds` y demás parámetros del perfil que superen el clip más largo probado solo producen un aviso en modo experimental y hacen fallar el modo certificado.
- Candidatos GPTQ no publicables: la calibración se realizó con un único registro de audio, lo que hace que los artefactos W4A16 y W8A16 no sean fiables pese a recargarse correctamente.
- Sin soporte en vLLM: no existe cargador nativo `granite_speech5_ctc` en el núcleo de vLLM, lo que descarta ese backend para producción de alto throughput.
- Q4 uniforme degrada la salida: solo las conversiones selectivas que preservan `encoder.input_linear`, `encoder.out`, `encoder.out_mid` y `ctc_head` mantienen la transcripción BF16. Cualquier cuantización propia debe respetar esas capas.
- Compatibilidad de cargador: el modelo base forma parte de la familia Granite Speech, que incluye un checkpoint `-nc` no comercial. Este repositorio usa la variante Apache-2.0, pero hay que verificar la licencia del artefacto concreto que se descargue de otros repositorios.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible análisis de sesgos acústicos, dialectales o demográficos, ni tasas de inserción de texto espurio típicas de los modelos CTC.
- Madurez del repositorio: el repositorio figura con 0 descargas y 0 likes, y no hay señales de uso en producción por terceros.
- La búsqueda web no aportó ninguna fuente adicional relevante, por lo que no se dispone de documentación externa independiente que corrobore las cifras del autor.

## Enlaces

- Repositorio del modelo: https://huggingface.co/miguelamendez/mica-granite-speech-5
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revision fijada del modelo base: `6c14d3d052a602d850f1bc4aa017f25f4adf6aa0`
- Registros de validacion citados en la model card: `docs/validation/granite-speech-5-mlx-q4.md`, `docs/validation/granite-speech-5-mlx-q8.md`, `docs/validation/gguf-runtime-macos-metal.md`, `docs/validation/granite-vllm-quantization-macos.md`
- Resultados de la busqueda web: no se encontro ningun enlace relevante; los unicos resultados devueltos correspondian a una marca de ropa y no guardan relacion con el modelo.
