# moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-ONNX

## Resumen

Qwen3-TTS-12Hz-1.7B-Base-ONNX es una conversión a formato ONNX del modelo de síntesis de voz Qwen3-TTS 1.7B desarrollado por Alibaba Qwen, publicada por el usuario moonbox-dev. El modelo original es un sistema text-to-speech con capacidad de clonación de voz y soporte multilingüe, y esta versión lo empaqueta en grafos ONNX ejecutables mediante ONNX Runtime (CPU, CUDA y DirectML) para su uso en dispositivos locales.

La conversión se distribuye en dos precisiones, fp16 e int8, cada una organizada como una carpeta con los grafos ONNX independientes (predictor de códigos, códec, embeddings, etc.) y un pequeño script `pipeline.py` que gestiona la extracción de características, la construcción del prompt y el bucle de muestreo. El repositorio ocupa 7,8 GB e incluye pesos, tokenizador, configuraciones y bases mel para el encoder de hablante.

La relevancia de esta ficha radica en que permite desplegar un TTS de 1.7B parámetros con clonación de voz en entornos sin PyTorch, algo útil para aplicaciones de escritorio, edge computing y pipelines de producción que ya usan ONNX Runtime. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la model card no detalla el rendimiento fuera del conjunto de evaluación propio del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer para TTS con códec neural (Qwen3-TTS 12 Hz), exportado a grafos ONNX |
| Parámetros totales | 1.7B (modelo base Qwen3-TTS-12Hz-1.7B-Base) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 e int8 (dos carpetas separadas) |
| Idiomas soportados | multilingüe según tags; la evaluación cubre inglés y chino (LibriSpeech y AISHELL-1) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos separados) + tokenizer.json + speaker_mel_basis.npy |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-Base es un sistema de síntesis de voz de 1.7B parámetros que opera con una representación de códec a 12 Hz, lo que implica que el modelo genera tokens de audio a una frecuencia baja (12 tokens por segundo) que posteriormente se decodifican a forma de onda mediante un decodificador de códec neural. La arquitectura interna del modelo original no se detalla en la model card proporcionada; solo se indica que la conversión ONNX separa el pipeline en grafos independientes: `code_predictor`, `codec_decoder`, `codec_embed`, `codec_encoder`, `cp_embed`, `decoder`, `speaker_encoder`, `text_embed` y `tokenizer.json`.

La conversión a ONNX incluye un `pipeline.py` que implementa la lógica de extracción de características, construcción del prompt y bucle de muestreo, delegando el cómputo pesado a los grafos ONNX Runtime. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La evaluación incluida en la model card se realizó sobre un conjunto propio de Moonbox con frases en inglés y chino, comparando el modelo ONNX contra el modelo PyTorch original en bf16.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con generación de audio mediante decodificación de códigos a 12 Hz.
- Clonación de voz: el pipeline incluye `speaker_encoder` y `speaker_mel_basis.npy`, lo que permite condicionar la voz generada a partir de un prompt de audio.
- Soporte multilingüe según los tags del repositorio; la evaluación documentada cubre inglés y chino.
- Ejecución en ONNX Runtime con backends CPU, CUDA y DirectML, lo que permite despliegue en Windows, Linux y entornos con GPU NVIDIA.
- Dos precisiones disponibles (fp16 e int8) para ajustar el equilibrio entre calidad y velocidad.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; el modelo es específicamente TTS.

## Casos de uso

- Clonación de voz para asistentes personalizados: el `speaker_encoder` y el prompt de audio permiten generar una voz sintética similar a una muestra de referencia, útil en asistentes de escritorio o aplicaciones de accesibilidad que requieran una voz concreta.
- Generación de audiolibros y contenido narrado: el modelo convierte texto largo en audio con una voz consistente, y la versión int8 reduce el uso de memoria para ejecución en servidores sin GPU dedicada.
- Localización de contenido multimedia: con soporte multilingüe (inglés y chino documentados), se puede doblar o narrar contenido en distintos idiomas manteniendo la identidad de voz mediante clonación.
- Integración en aplicaciones de escritorio Windows: el backend DirectML de ONNX Runtime permite ejecutar el modelo en equipos con GPU integrada o discreta sin necesidad de CUDA, facilitando el despliegue en aplicaciones nativas.
- Pipelines de CI/CD para generación de audio: al no requerir PyTorch, el modelo se puede empaquetar en contenedores ligeros y ejecutar en entornos de integración para generar muestras de audio de prueba o validar textos.
- Sistemas de respuesta de voz interactiva (IVR): la baja latencia potencial de la representación a 12 Hz y la ejecución en CPU permiten desplegar TTS en servidores de atención telefónica sin GPU.
- Prototipado rápido de voces sintéticas: el script `pipeline.py` incluido simplifica la integración en notebooks y scripts de experimentación para investigadores que evalúan modelos TTS sin depender del stack de PyTorch.

## Benchmarks y rendimiento

La model card incluye resultados de evaluación sobre el conjunto TTS propio de Moonbox (clonación de voz de frases en inglés y chino desde prompts de LibriSpeech y AISHELL-1), comparando el modelo ONNX con el modelo PyTorch original en bf16. Las métricas son WER/CER de una transcripción Whisper contra el texto, similitud de hablante con el prompt y DNSMOS.

| Precisión | WER / CER | Similitud hablante (EN / ZH) | DNSMOS (EN / ZH) | RTF (CUDA) |
|---|---|---|---|---|
| fp16 | 0.6 % / 0.0 % | 0.961 / 0.951 | 3.12 / 2.98 | 1.7 |
| int8 | 0.0 % / 0.0 % | 0.956 / 0.953 | 3.18 / 2.90 | 3.1 |
| Original PyTorch (bf16) | 0.0 % / 0.0 % | 0.944 / 0.954 | 3.25 / 2.97 | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es específicamente TTS y no un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 7,8 GB, pero cada precisión se puede cargar por separado. La carpeta fp16 contiene grafos que suman aproximadamente 4,5 GB (decoder.onnx.data de 2,84 GB más el resto de grafos), por lo que se estima un uso de VRAM en torno a 5-6 GB en fp16. La carpeta int8 reduce el peso de los grafos principales (codec_decoder de 456,7 MB, code_predictor de 113 MB), estimándose un uso de VRAM inferior a 2 GB.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para fp16 con máxima calidad; RTX 3060 o superior para fp16 en consumer; GPUs integradas o CPU para int8 mediante DirectML.
- Cabe en GPU consumer: sí, la versión int8 está pensada para ejecución en CPU y GPUs de gama baja; la fp16 requiere al menos una GPU con 6 GB de VRAM.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) y onnxruntime-genai según los tags; el script `pipeline.py` incluido gestiona el bucle de inferencia.
- Latencia y throughput: el RTF documentado es 1.7 en CUDA para fp16 y 3.1 en CUDA para int8, lo que indica que la generación es más lenta que tiempo real en la configuración evaluada. No se documentan latencias en CPU ni throughput en otros backends.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Clonación de voz |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-Base-ONNX (este) | 1.7B | no disponible | multilingüe (EN/ZH evaluados) | Apache 2.0 | ONNX | Sí |
| Qwen3-TTS-12Hz-1.7B-Base (original) | 1.7B | no disponible | multilingüe (EN/ZH evaluados) | Apache 2.0 | PyTorch (safetensors presumiblemente) | Sí |
| Otros TTS open source de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de benchmarks comparativos con otros modelos TTS de la misma categoría, por lo que no se puede establecer una comparativa cuantitativa con alternativas como XTTS, Bark o Tortoise.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al ser un TTS entrenado presumiblemente con datos de habla, puede reproducir sesgos de género, acento o idioma presentes en los datos de entrenamiento.
- Riesgo de alucinación en la transcripción: aunque el WER documentado es bajo (0,6 % en fp16), el modelo puede generar audio que no corresponde exactamente al texto de entrada en casos de textos ambiguos o fuera de distribución.
- Limitaciones de idioma: aunque los tags indican multilingüe, la evaluación solo cubre inglés y chino; no hay evidencia documentada de calidad en otros idiomas como el español.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que la conversión ONNX mantiene las mismas obligaciones de atribución que el modelo original.
- Caveat de producción: el RTF de 1,7 en fp16 (CUDA) indica que la generación es más lenta que tiempo real en la configuración evaluada, lo que puede ser un cuello de botella en aplicaciones de baja latencia; la versión int8 es aún más lenta (RTF 3,1) pese a su menor huella de memoria.
- La conversión ONNX no incluye documentación sobre el comportamiento en CPU o DirectML más allá de la mención de los backends; el rendimiento real en estos entornos no está cuantificado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es una publicación reciente y sin validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/moonbox-dev/Qwen3-TTS-12Hz-1.7B-Base-ONNX
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Paper referenciado en tags: arxiv:2601.15621 (no se dispone de URL directa en la información proporcionada)
- ONNX Runtime: no disponible en la información proporcionada
- ONNX Runtime GenAI: no disponible en la información proporcionada
