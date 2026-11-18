# alphaedge-ai/whisper-base-mlt-16384

## Resumen

whisper-base-mlt-16384 es una variante del modelo de reconocimiento automático del habla (ASR) Whisper de OpenAI, publicada por alphaedge-ai. Se trata de una versión "trimmed" (podada) del checkpoint original `openai/whisper-base`, en la que se ha reducido el vocabulario del tokenizador de 51.865 a 16.384 tokens mediante la técnica de trimming descrita por Hugging Face, con el objetivo de especializar el modelo para el maltés (código ISO `mt`). El resultado es un modelo un 25,02% más pequeño en número de parámetros (54.427.648 frente a 72.593.920) y con un footprint de memoria notablemente inferior (repo de 0,1 GB).

La poda del vocabulario se realizó minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para identificar los subwords efectivamente utilizados en maltés y descartar el resto. Esto reduce el tamaño de la matriz de embeddings y de la capa de proyección de salida, que en Whisper representan una fracción significativa de los parámetros totales. La arquitectura subyacente es la de Whisper base: un transformer encoder-decoder con 6 capas en cada bloque y 512 dimensiones de modelo.

El modelo es relevante para despliegues de ASR en maltés con recursos limitados (CPU, edge, contenedores pequeños), donde la reducción de parámetros y de vocabulario se traduce en menor uso de RAM y tiempos de carga más cortos. La contrapartida es que la poda del vocabulario degrada el rendimiento en otros idiomas, por lo que no debe usarse como modelo multilingüe generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | 54.427.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | maltes (`mt`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper base de OpenAI: un transformer encoder-decoder entrenado con supervisión débil a gran escala sobre pares audio-transcripción, con entrada de audio log-Mel de 80 canales y ventanas de 30 segundos. Whisper base tiene 6 capas de encoder y 6 de decoder con 512 dimensiones de modelo y 8 cabezas de atención. No se ha reentrenado el modelo desde cero: la intervención consiste exclusivamente en la reducción del vocabulario del tokenizador y el recorte correspondiente de las matrices de embeddings y de la proyección de salida, seguida de un ajuste para preservar el comportamiento del modelo original.

La selección de tokens se realizó minando 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para el maltés, conservando los 16.384 subwords más relevantes. Según la model card, el modelo podado "debería comportarse de forma similar al original" en maltés, pero puede degradarse en otros idiomas porque se han eliminado tokens poco frecuentes en el idioma objetivo. No se documentan en la información disponible detalles sobre datos de entrenamiento adicionales, RLHF, DPO ni innovaciones técnicas más allá del propio método de trimming.

## Capacidades

- Reconocimiento automático del habla (transcripción) en maltés.
- Traducción de audio a texto (task `translate`) heredada de Whisper, aunque el vocabulario podado está optimizado para maltés.
- Procesamiento de audio a 16 kHz con ventanas de 30 segundos (requisito de Whisper).
- Integración con el pipeline `automatic-speech-recognition` de transformers.
- Compatible con endpoints (tag `endpoints_compatible`).
- No dispone de tool calling, capacidades de agente, visión ni audio más allá de la transcripción estándar de Whisper.
- Capacidad multilingüe reducida: el vocabulario eliminado limita el rendimiento fuera del maltés.

## Casos de uso

- Transcripción de audio en maltés en entornos con recursos limitados: el modelo, con 54,4 M de parámetros y 0,1 GB de repo, cabe en CPU y en dispositivos edge donde `whisper-base` completo resultaría más pesado.
- Subtitulado automático de contenido audiovisual maltés: se puede ejecutar el pipeline de transformers con `language="maltese"` y `task="transcribe"` para generar transcripciones base que luego se revisan.
- Servicios de transcripción para administración pública o medios locales en Malta: al estar bajo Apache 2.0, permite uso comercial sin restricciones de licencia.
- Preprocesado de corpus de voz para investigación lingüística del maltés: la reducción de vocabulario simplifica el mapeo de tokens y reduce el coste de almacenamiento de transcripciones.
- Despliegue en contenedores pequeños o funciones serverless: el menor número de parámetros reduce el tiempo de carga en frío y la RAM necesaria.
- Prototipado rápido de ASR en maltés sin GPU: el tamaño permite inferencia en CPU con latencia aceptable para lotes pequeños, aunque no se publican cifras de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta métricas de tamaño (reducción del 68,41% en vocabulario y del 25,02% en parámetros) y no incluye WER ni comparaciones cuantitativas con `openai/whisper-base` u otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 54,4 M de parámetros en fp32 el modelo ocupa aproximadamente 218 MB de pesos, y en fp16 unos 109 MB, más el overhead de activaciones y del feature extractor.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1050 en adelante) e incluso en CPU.
- Opciones de despliegue: pipeline de `transformers`, `optimum` para ONNX, y servidores de inferencia compatibles con transformers (TGI, vLLM) aunque no se documenta soporte específico. No se menciona GGUF ni llama.cpp en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto audio |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-mlt-16384 | 54.427.648 | 16.384 | mt | Apache 2.0 | 30 s |
| openai/whisper-base | 72.593.920 | 51.865 | multilingue | Apache 2.0 | 30 s |
| openai/whisper-small | no disponible en la informacion | no disponible | multilingue | Apache 2.0 | 30 s |

La comparación directa más relevante es con `openai/whisper-base`, del que este modelo es una poda: misma arquitectura, licencia y ventana de audio, pero con un 25,02% menos de parámetros y un vocabulario restringido al maltés. Frente a `whisper-small`, el modelo podado es más pequeño, pero no se dispone de datos de rendimiento para comparar calidad de transcripción.

## Limitaciones y advertencias

- El vocabulario podado elimina tokens poco frecuentes en maltés, por lo que el rendimiento en otros idiomas puede degradarse de forma significativa; no debe usarse como modelo multilingüe.
- Riesgo de alucinación inherente a Whisper, especialmente en segmentos de silencio o audio ruidoso.
- Sesgos heredados de los datos de entrenamiento originales de Whisper, que no se documentan en esta ficha.
- No se publican métricas de WER ni evaluaciones cuantitativas que respalden la afirmación de "rendimiento similar" al original en maltés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base de OpenAI y los datos de minería (`lbourdois/fineweb-2-trimming`) pueden tener sus propias condiciones que conviene revisar.
- Solo se ha validado para maltés; el uso en producción con otros idiomas requiere evaluación propia.
- El modelo tiene pocas descargas (56) y ningún like, por lo que no hay validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-mlt-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introducción a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
