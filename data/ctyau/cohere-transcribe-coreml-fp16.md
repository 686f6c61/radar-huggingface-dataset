# ctyau/cohere-transcribe-coreml-fp16

## Resumen

cohere-transcribe-coreml-fp16 es una conversión nativa a CoreML en precisión FP16 del modelo de reconocimiento automático del habla CohereLabs/cohere-transcribe-03-2026, un sistema ASR de unos 2.000 millones de parámetros con arquitectura Conformer en el codificador y decoder Transformer autorregresivo. La publicación corre a cargo del usuario ctyau y está empaquetada específicamente para Apple Silicon: tres módulos CoreML (codificador, prefill del decoder y paso de decodificación) que se ejecutan sobre Neural Engine y GPU mediante el framework CoreML de Apple.

El problema que resuelve es doble. Por un lado, permite transcripción de voz en inglés completamente local en Mac y dispositivos Apple, sin enviar audio a ningún servicio externo. Por otro, resuelve una ineficiencia clásica de las exportaciones ONNX/PyTorch: en lugar de extraer y reinyectar los tensores de clave-valor en cada paso autorregresivo, el decoder se compila como modelo con estado (MLState) y mantiene 32 buffers en la SRAM del Neural Engine, con lo que el coste por token baja a 4,76 ms.

Los números publicados por el autor en un Apple M5 de 10 núcleos y 32 GB de RAM son de 26,3× a 31,6× tiempo real con utterances de 8,4 a 11,7 segundos, y un rendimiento de decodificación de aproximadamente 210 tokens por segundo. El repositorio ocupa 4,3 GB, se distribuye bajo licencia Apache-2.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (codificador) + Transformer autorregresivo (decoder), exportado a CoreML |
| Parametros totales | ~2.000 millones (2B) |
| Longitud de contexto | No aplica contexto de tokens; entrada de audio fija de mel [1, 128, 3500] tramas y salida de codificador [1, 438, 1024] |
| Tipos de cuantizacion | FP16 (esta conversión). Otras cuantizaciones: no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mlpackage` de CoreML en FP16, compilable a `.mlmodelc`; no incluye safetensors ni GGUF |
| Modalidad | Audio a texto (automatic-speech-recognition) |
| Framework requerido | CoreML con MLState (iOS 18 / macOS 15 o superior) |
| Vocabulario del tokenizer | 16.384 tokens |
| Ventana de cache KV | 512 posiciones (`cache_update_mask` y `cache_valid_mask` de forma [1, 512]) |
| Capas del decoder | 8 (buffers `*_k_0..7` y `*_v_0..7`) |
| Tamano del repositorio | 4,3 GB (codificador ~3,5 GB + prefill ~289 MB + decode ~258 MB + auxiliares) |
| Modelo base | CohereLabs/cohere-transcribe-03-2026 |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), solo que se trata de un modelo ASR de 2B parámetros con codificador Conformer y decoder Transformer. Lo que sí está documentado es la arquitectura de la exportación CoreML, que es donde reside el interés técnico de esta publicación.

El codificador acepta un espectrograma log-mel de forma fija `[1, 128, 3500]` en float32 junto con un tensor `length` que indica la duración acústica real. Esta entrada de longitud dinámica permite enmascarar correctamente los tokens de relleno, lo que según el autor evita los bucles de repetición y las alucinaciones típicas de las exportaciones estáticas mal hechas. La salida son representaciones acústicas `[1, 438, 1024]` en float16: 438 tramas de codificador para 3500 tramas de mel, lo que implica un factor de subsampling de 8. El vocabulario del tokenizer es de 16.384 entradas y el prefill usa el prefijo de prompt `[13764, 7, 4, 16, 62, 62, 5, 9, 11, 13]`.

La innovación principal es el uso de `MLState` para cache KV en lugar de pasar los tensores de pasado dentro y fuera del grafo. El decoder se compila como modelo con estado y reserva 32 buffers en chip: 16 para atención cruzada (`cross_k_0..7`, `cross_v_0..7`) y 16 para autoatención (`self_k_0..7`, `self_v_0..7`). Durante la decodificación, el objeto `MLState` se modifica in situ en la SRAM del Neural Engine y de la GPU, sin tráfico de memoria entre dominios. El resultado es una latencia de decodificación de un token de 4,76 ms. El paso de decodificación recibe el token actual `[1, 1]` más dos máscaras float32 de 512 posiciones (`cache_update_mask`, one-hot de la posición a escribir, y `cache_valid_mask`, máscara acumulativa de posiciones válidas) y devuelve logits `[1, 1, 16384]`.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio muestreado a 16 kHz, con filtro mel Slaney de 128 bins ya precalculado (`mel_filters.bin`, `n_fft=400`, float32).
- Procesamiento de utterances con enmascarado por longitud real, lo que reduce repeticiones y alucinaciones en comparación con exportaciones estáticas.
- Decodificación autorregresiva token a token con cache KV en chip, a 4,76 ms por token y ~210 tokens por segundo en M5.
- Ejecución local completa en Apple Silicon, sin llamadas a servicios externos ni envío de audio a la nube.
- Integración con Voxtype para dictado nativo en macOS mediante streaming de CoreAudio con copia cero, atajo global push-to-talk y HUD de forma de onda flotante.
- No dispone de tool calling, function calling ni soporte de agentes: es un modelo ASR, no un modelo de lenguaje conversacional.
- No dispone de razonamiento multi-paso, visión, audio understanding más allá de la transcripción, ni capacidades multilingües (solo inglés).
- No hay evidencia documentada de modo "thinking", salida con marcas de tiempo, diarización de hablantes ni detección de idioma.

## Casos de uso

- Dictado de escritorio en macOS: el modelo se integra en Voxtype como motor de transcripción local; el atajo push-to-talk captura audio, lo transcribe con latencia inferior a 5 ms por token y lo inserta en la aplicación activa sin salir del equipo.
- Notas de voz y reuniones en inglés: con RTF de 0,032 a 0,038, una hora de audio se transcribiría en aproximadamente dos minutos de cómputo en M5, y todo el proceso ocurre en local, sin filtrar contenido sensible a terceros.
- Subtitulado casi en tiempo real de contenido en inglés: el rendimiento de 26× a 31× tiempo real permite generar subtítulos sobre la marcha desde un flujo de audio, útil en herramientas de edición o en visualización asistida.
- Accesibilidad en aplicaciones iOS 18: el bundle CoreML se puede incrustar en apps nativas para ofrecer entrada por voz a usuarios con movilidad reducida, funcionando sin conexión y sin coste por petición.
- Preetiquetado de corpus de audio para entrenamiento: al ejecutarse localmente y a alta velocidad, sirve para generar transcripciones preliminares de grandes volúmenes de audio en inglés que después se revisan manualmente.
- Transcripción por lotes de llamadas de atención al cliente en inglés: se puede procesar el archivo de grabaciones de un día completo en el propio Mac, manteniendo la confidencialidad de los datos y evitando costes de API de ASR.
- Asistentes de voz embebidos en producto: la combinación de CoreML, Neural Engine y MLState permite construir interfaces de voz que responden en decenas de milisegundos sin depender de conectividad.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son medidas de velocidad en un Apple M5 de 10 núcleos con 32 GB de RAM. No se han publicado cifras de WER, MMLU, HumanEval, GSM8K ni de ningún otro benchmark de calidad de transcripción.

| Duracion del utterance | Tiempo de proceso | RTF | Aceleracion en tiempo real | Latencia por token | Throughput de decodificacion |
|---|---|---|---|---|---|
| 8,40 s | 0,320 s | 0,038 | 26,3× | 4,76 ms | ~210 tok/s |
| 9,80 s | 0,310 s | 0,032 | 31,6× | 4,76 ms | ~210 tok/s |
| 11,70 s | 0,430 s | 0,037 | 27,2× | 4,76 ms | ~210 tok/s |

## Requisitos de hardware

- Almacenamiento: 4,3 GB para el repositorio completo; los pesos suman aproximadamente 4,05 GB (codificador ~3,5 GB, prefill ~289 MB, decode ~258 MB). Al compilar a `.mlmodelc` se genera una copia adicional.
- RAM: 32 GB en el equipo de referencia (Apple M5, 10 núcleos). No se especifica el mínimo necesario para modelos con menos memoria.
- Aceleración: Neural Engine y GPU mediante CoreML. Los buffers de estado se mutan en la SRAM del Neural Engine y de la GPU.
- Compatibilidad: exclusivamente Apple Silicon. Requiere iOS 18 o macOS 15 (o versiones posteriores) por el uso de `MLState`. No es ejecutable en GPU NVIDIA, AMD ni en CPU x86.
- GPU recomendadas: no aplica. El modelo está pensado para Neural Engine de Apple. No hay versión CUDA.
- Opciones de despliegue: `coremltools` (`compile_model`) para generar los `.mlmodelc`, y la aplicación Voxtype. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que además son runners de modelos de lenguaje y no de ASR.
- Latencia y throughput: 4,76 ms por token de decodificación, ~210 tokens por segundo y RTF de 0,032 a 0,038 en M5.

## Comparativa con modelos similares

Los resultados de la búsqueda web no contienen información relevante sobre modelos comparables, por lo que la comparación se limita a los datos disponibles del propio repositorio y de su modelo base. Los campos marcados como "no disponible" no se han podido verificar con la información proporcionada.

| Modelo | Parametros | Formato | Idiomas | Licencia | Plataforma | Calidad (WER) |
|---|---|---|---|---|---|---|
| ctyau/cohere-transcribe-coreml-fp16 | ~2B | CoreML `.mlpackage` FP16 | Inglés | Apache-2.0 | Apple Silicon (iOS 18 / macOS 15+) | no disponible |
| CohereLabs/cohere-transcribe-03-2026 | ~2B | no disponible | Inglés | Apache-2.0 | no disponible | no disponible |
| Whisper large-v3 | no disponible en esta busqueda | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: solo inglés (`language: en`). No hay soporte multilingüe documentado, por lo que no es adecuado para audio en castellano ni en otros idiomas.
- Plataforma: requiere Apple Silicon con Neural Engine y CoreML con MLState (iOS 18 / macOS 15 o superior). Queda fuera cualquier despliegue en NVIDIA, AMD, x86 o en servidores Linux, y tampoco sirve para entornos de inferencia en la nube convencionales.
- Rendimiento cualitativo no verificado: no se publican métricas de WER ni comparaciones de calidad frente a otros sistemas ASR. Las cifras publicadas son exclusivamente de velocidad.
- Alucinaciones y repeticiones: el autor afirma que el enmascarado por longitud del codificador reduce los bucles de repetición y las alucinaciones propias de exportaciones estáticas, pero no se documenta una eliminación total del problema ni se aportan métricas al respecto.
- Adopción nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad ni de terceros sobre la fidelidad de la conversión frente al modelo original.
- Ventana de cache KV limitada a 512 posiciones y entrada de mel fija de 3500 tramas, lo que acota la longitud de audio procesable por pasada. No se especifica en la información disponible cómo se gestionan audios más largos ni si existe segmentación automática.
- Trazabilidad de la conversión: se trata de una publicación de terceros (usuario `ctyau`) sobre el modelo de CohereLabs; los posibles errores de cuantización o de exportación no están auditados por el autor original.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene conservar los avisos de licencia y verificar la licencia del modelo base por si impusiera condiciones adicionales, algo que no se detalla en la información disponible.
- Fecha de publicación: el repositorio está fechado en septiembre de 2026 y referencia un modelo base de 2026, por lo que cualquier evaluación debe considerar que se trata de material reciente y posiblemente en evolución.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ctyau/cohere-transcribe-coreml-fp16
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-03-2026
- Aplicación Voxtype (integracion de referencia): https://github.com/CedricYauLBD/voxtype
- Resultados de busqueda web: no se han encontrado enlaces relevantes (papers, blogs o demos) sobre este modelo; los resultados devueltos no guardan relacion con el contenido de la ficha.
