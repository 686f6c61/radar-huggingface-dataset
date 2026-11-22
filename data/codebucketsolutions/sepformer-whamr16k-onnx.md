# codebucketsolutions/sepformer-whamr16k-onnx

## Resumen

SepFormer WHAMR! 16 kHz ONNX es una exportación a ONNX del modelo `speechbrain/sepformer-whamr16k` de SpeechBrain, publicada por el usuario `codebucketsolutions` para su uso en el servidor de voz [bolo](https://github.com/cB-Sigma/bolo-speech) sin depender de PyTorch. El modelo original es un sistema de separación de hablantes (speech separation) para mezclas de dos voces en condiciones de ruido y reverberación, entrenado sobre el corpus WHAMR! a 16 kHz. Esta exportación no modifica los pesos: reproduce en un grafo ONNX (opset 17, float32) el encoder, la red de enmascaramiento y el decoder de `SepformerSeparation.separate_batch`.

SepFormer es una arquitectura basada en transformers con mecanismo de atención dividida (split attention), diseñada específicamente para separar fuentes de audio. El modelo original reporta 13,5 dB de SI-SNRi y 13,0 dB de SDRi sobre el conjunto de test de WHAMR!. La relevancia de esta exportación es práctica: permite ejecutar el modelo con ONNX Runtime en entornos sin PyTorch, lo que simplifica el despliegue en servidores y contenedores ligeros.

El repositorio ocupa aproximadamente 0,1 GB y contiene un único grafo (`sepformer.onnx`) junto con metadatos de exportación y un fichero de paridad. La licencia es Apache-2.0, heredada del modelo original. No se trata de una release oficial de SpeechBrain.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SepFormer (transformer con split attention) para separación de fuentes |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de audio mono a 16 kHz de longitud variable `[1, T]` |
| Tipos de cuantizacion | no disponible (el grafo publicado es float32; el tag `base_model:quantized` sugiere una variante cuantizada, pero no se documenta) |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, float32) |

## Arquitectura y entrenamiento

El modelo subyacente es SepFormer, un transformer con atención dividida que procesa el audio en el dominio de la forma de onda. El grafo ONNX incluye el encoder (que convierte la señal en representaciones latentes tomando strides completos de 8 muestras), la red de enmascaramiento (el núcleo transformer que estima las máscaras por fuente) y el decoder (que reconstruye las dos pistas de audio separadas). La salida tiene forma `[1, 8 * ((T - 16) // 8) + 16, 2]`, es decir, dos pistas que pueden rellenarse con ceros hasta la longitud de la entrada.

El entrenamiento se realizó sobre WHAMR! a 16 kHz: mezclas de dos hablantes de WSJ0-2mix (WSJ0, licencia del Linguistic Data Consortium, no redistribuible), ruido de WHAM! (CC BY-NC 4.0) y reverberación simulada. La pérdida es invariante a la escala (scale-invariant), por lo que el nivel absoluto de la salida es arbitrario. No se documentan detalles sobre RLHF, DPO ni número de tokens de entrenamiento; al tratarse de un modelo de audio, estas métricas no aplican del mismo modo. La innovación técnica destacable de esta publicación es la exportación fiel a ONNX con paridad verificada frente a PyTorch.

## Capacidades

- Separación de dos hablantes en mezclas mono a 16 kHz, incluso con ruido de fondo y reverberación.
- Salida de dos pistas de audio independientes (una por hablante) en un único paso de inferencia.
- Funciona sobre audio de longitud variable, con padding interno por strides de 8 muestras.
- Ejecución sin PyTorch mediante ONNX Runtime, lo que facilita el despliegue en servidores ligeros.
- Independiente del idioma: procesa la señal acústica, no texto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada más allá de la mezcla a separar.

## Casos de uso

- Transcripción de reuniones con múltiples participantes: separar previamente la mezcla en dos pistas permite enviar cada una a un sistema ASR y reducir errores de atribución de hablante en conversaciones solapadas.
- Postproducción de audio y podcasting: aislar dos voces grabadas con un único micrófono para aplicar ecualización, compresión o eliminación de ruido de forma independiente por pista.
- Limpieza de grabaciones de campo o entrevistas: el entrenamiento con WHAM! y reverberación simulada lo hace adecuado para entornos con ruido ambiental y eco.
- Preprocesado en pipelines de diarización: generar dos flujos separados antes de un motor de diarización o de reconocimiento de hablante (speaker verification).
- Sistemas de accesibilidad y subtitulado en directo: separar voces en tiempo casi real (por ventanas) para mejorar la inteligibilidad en subtítulos automáticos.
- Investigación en separación de fuentes: servir como referencia reproducible en ONNX para comparar implementaciones sin depender de PyTorch.
- Integración en servidores de voz autoalojados: el caso de bolo demuestra su uso en un servidor que no quiere arrastrar la dependencia de PyTorch.

## Benchmarks y rendimiento

El autor reporta paridad numérica entre el grafo ONNX y la implementación en PyTorch (SpeechBrain 1.1.2, torch 2.15.0+cpu, ONNX Runtime 1.32.0), medida como diferencia absoluta máxima y SI-SNR mínimo por pista:

| Entrada | Diferencia absoluta máxima | SI-SNR mínimo ONNX vs PyTorch |
|---|---|---|
| ruido, 8003 muestras | 3,23e-05 | 71,9 dB |
| ruido, 3008 muestras | 1,97e-06 | 84,3 dB |
| ruido, 48000 muestras | 5,08e-04 | 63,6 dB |
| ruido, 112005 muestras | 3,56e-04 | 62,2 dB |
| en-long + en-short | 1,66e-02 | 52,5 dB |
| en-long + hi-short | 2,08e-03 | 74,4 dB |
| en-short + hi-short | 6,38e-03 | 61,8 dB |

Calidad del modelo original sobre el test de WHAMR!, según SpeechBrain: 13,5 dB SI-SNRi y 13,0 dB SDRi. No se han publicado en la información disponible otros benchmarks (por ejemplo, comparativas con otros separadores) para esta exportación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el autor advierte que el consumo de memoria crece rápidamente con la longitud del audio (varios GB para un minuto de audio), por lo que se recomienda procesar en ventanas.
- GPU recomendadas: no se especifican; al ser un modelo pequeño (repo de 0,1 GB) y ejecutable en CPU con ONNX Runtime, cabe en GPUs de consumo como RTX 3060 o superiores, aunque no hay datos publicados de rendimiento por GPU.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del grafo; sin cifras oficiales de VRAM.
- Opciones de despliegue: ONNX Runtime (probado por el autor), servidor bolo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de audio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| sepformer-whamr16k-onnx (este) | SepFormer exportado | Audio 16 kHz, 2 hablantes | Apache-2.0 | ONNX | Paridad verificada con PyTorch; sin dependencia de PyTorch |
| speechbrain/sepformer-whamr16k | SepFormer original | Audio 16 kHz, 2 hablantes | Apache-2.0 | PyTorch (SpeechBrain) | Modelo de referencia; requiere PyTorch |
| Otros separadores (p. ej. Conv-TasNet, DPRNN) | no disponible en la información | no disponible | no disponible | no disponible | No se aportan datos comparativos |

No se dispone de datos de benchmarks comparativos con otros separadores en la información proporcionada.

## Limitaciones y advertencias

- Solo separa dos hablantes; no está diseñado para tres o más fuentes.
- El nivel de salida es arbitrario por la pérdida invariante a la escala: hay que normalizar la ganancia aguas abajo.
- El consumo de memoria crece con la longitud del audio (varios GB por minuto); es necesario procesar en ventanas y gestionar los solapamientos.
- Entrenado con WSJ0 (licencia LDC, no redistribuible) y WHAM! (CC BY-NC 4.0): aunque los pesos se publican como Apache-2.0, el uso comercial puede requerir revisión de las licencias de los datos de entrenamiento.
- No es una release oficial de SpeechBrain; el mantenimiento depende de un autor individual.
- Riesgo de artefactos y de confusión entre hablantes en mezclas muy solapadas o con hablantes de características vocales similares.
- Sin datos publicados sobre sesgos demográficos, acentos o idiomas concretos.
- El tag `base_model:quantized` no se corresponde con una variante cuantizada documentada; el grafo publicado es float32.
- No aplica a tareas de lenguaje (tool calling, agentes, razonamiento): es exclusivamente un modelo de audio.

## Enlaces

- Hugging Face: https://huggingface.co/codebucketsolutions/sepformer-whamr16k-onnx
- Modelo base: https://huggingface.co/speechbrain/sepformer-whamr16k
- Servidor bolo: https://github.com/cB-Sigma/bolo-speech
- SpeechBrain: https://speechbrain.github.io/
- Paper de SepFormer: no disponible en la información proporcionada
- Dataset WHAMR!: no disponible enlace directo en la información proporcionada
