# cstr/chatterbox-nano-GGUF

## Resumen

Chatterbox-Nano-GGUF es una conversión al formato GGUF/ggml del modelo de síntesis de voz (text-to-speech) Chatterbox-Nano, desarrollado por Resemble AI y convertido por el usuario cstr para su uso con el motor de inferencia CrispASR (CrispStrobe/CrispASR). Chatterbox-Nano es la variante ligera de Chatterbox-Turbo: comparte el mismo pipeline autoregresivo de TTS, pero sustituye el backbone GPT-2 medium (24 capas, 1024 dimensiones) por un GPT-2 small (12 capas, 768 dimensiones, 12 cabezas de atención). El repositorio contiene únicamente el modelo T3 (el bloque que convierte texto en tokens de habla) en tres cuantizaciones GGUF; el módulo S3Gen (denoiser por flow-matching) es idéntico al de Turbo y se debe descargar por separado desde el repositorio `cstr/chatterbox-turbo-GGUF`.

La relevancia de esta conversión radica en que permite ejecutar un sistema TTS de alta calidad con un modelo de solo 180 millones de parámetros, en formatos cuantizados que caben en hardware modesto (GPUs de consumo o incluso CPU). Está pensado para integrarse en aplicaciones que requieran síntesis de voz en tiempo real o con restricciones de memoria, manteniendo compatibilidad con las funciones de clonación de voz y tokens de emoción del pipeline original. La licencia MIT facilita su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T3 autoregresivo (GPT-2 small, 12 capas, 768 hidden, 12 heads) + S3Gen compartido con Turbo (Conformer + UNet1D CFM) + HiFTGenerator vocoder (no incluido en el GGUF) |
| Parametros totales | 180.323.862 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 small usa 1024 tokens, pero no está confirmado en la conversión) |
| Tipos de cuantizacion | f16 (476 MB), q8_0 (345 MB), q4_k (283 MB) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (ggml) |

## Arquitectura y entrenamiento

El modelo sigue el pipeline completo de Chatterbox: un tokenizador de caracteres alimenta un modelo autoregresivo T3 (basado en GPT-2 small) que genera tokens de habla discretos; estos tokens pasan por el módulo S3Gen, un denoiser de flow-matching (Conformer encoder + UNet1D con 10 pasos de Euler) que produce el espectrograma; finalmente, el vocoder HiFTGenerator (conv chains + activaciones Snake + iSTFT) genera la forma de onda a 24 kHz. En esta conversión GGUF solo se incluye el T3, ya que el S3Gen es byte-idéntico al de Chatterbox-Turbo (mismos blobs LFS) y se reutiliza automáticamente desde el repositorio Turbo.

El entrenamiento original fue realizado por Resemble AI; no se han publicado detalles sobre el dataset o el proceso de entrenamiento en la información disponible. La conversión a GGUF se realizó con el script `convert-chatterbox-to-gguf.py --variant nano` de CrispASR, a partir de la revisión `71ccd1d0` del modelo upstream, y posteriormente se cuantizó con `crispasr-quantize`. La conversión fija explícitamente `n_kv_heads = 12` (GPT-2 usa atención multi-cabeza, mientras que el valor por defecto de CrispASR, 16, solo es válido para Turbo). Los token ids coinciden con la inferencia upstream: `start_text` 255, `stop_text` 0, `speech` 6561/6562; el `stop_text_token: 50256` presente en `t3_nano_v1.yaml` es un artefacto de entrenamiento que el código de `generate()` no utiliza.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida WAV a 24 kHz.
- Clonación de voz mediante un archivo de referencia (`--voice reference.wav`), con el mismo comportamiento que el backend Turbo.
- Soporte de 19 tokens de estilo emocional (`[emotion]`), activables en el texto de entrada.
- Parámetros de muestreo (sampler) idénticos al backend Turbo, con valores por defecto ya ajustados.
- Compatible con CrispASR v0.8.31+ mediante registro automático del modelo y descarga del S3Gen acompañante.
- No soporta CFG (classifier-free guidance), min_p ni exaggeration, ya que el pipeline upstream los desactiva.

## Casos de uso

- Asistentes de voz en dispositivos edge (Raspberry Pi, móviles): gracias a las cuantizaciones q8_0 y q4_k (345 y 283 MB respectivamente), el modelo puede ejecutarse en hardware con menos de 4 GB de VRAM o incluso en CPU con latencias aceptables para respuestas cortas.
- Narración automatizada de artículos o libros: el modelo genera voz natural en inglés, con opción de estilo emocional, ideal para aplicaciones de accesibilidad o audiolibros.
- Prototipado rápido de TTS en aplicaciones de desarrollo: al ser un modelo pequeño y con licencia MIT, se puede integrar en pipelines de CI/CD para generar audios de prueba o demos sin depender de APIs externas.
- Clonación de voz para asistentes personalizados: la función `--voice reference.wav` permite replicar una voz con pocos segundos de referencia, útil para sistemas de respuesta interactiva (IVR) o avatares digitales.
- Generación de contenido audiovisual (voz en off para vídeos): con los tokens de emoción se pueden producir locuciones con distintas entonaciones, adecuadas para redes sociales o material didáctico.
- Sistemas de accesibilidad en tiempo real: lectura de pantalla para personas con discapacidad visual, donde la baja latencia del modelo cuantizado permite una experiencia fluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de voz (MOS, WER) ni comparativas con otros modelos TTS. Tampoco se especifican mediciones de latencia o throughput en la documentación de la conversión.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF ocupan entre 283 MB (q4_k) y 476 MB (f16). Para inferencia con CrispASR, se recomienda al menos 2 GB de VRAM para q4_k y 4 GB para q8_0, aunque no hay datos oficiales de consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA o Vulkan de 4 GB o más (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). También puede ejecutarse en CPU con llama.cpp u otros backends GGML, aunque la latencia será mayor.
- Opciones de despliegue: CrispASR (motor principal), llama.cpp (con adaptaciones), o cualquier runtime GGUF compatible.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración del sampler.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Chatterbox-Nano (este) | 180 M | GPT-2 small + S3Gen + HiFT | 1024 (presumible) | MIT | GGUF |
| Chatterbox-Turbo (GGUF) | 520 M (T3) | GPT-2 medium (24L, 1024D) + S3Gen + HiFT | 1024 (presumible) | MIT | GGUF |
| Chatterbox original | 520 M (T3) | Llama 30 capas + S3Gen + HiFT | no disponible | MIT | safetensors |

El modelo es el hermano pequeño de Chatterbox-Turbo: reduce el tamaño del T3 a la mitad (180 M vs 520 M) manteniendo el mismo S3Gen y vocoder. Esto implica una calidad de voz ligeramente inferior (no cuantificada en la documentación) pero un menor coste computacional. No se dispone de comparativas con otros modelos TTS open source (VITS, Tortoise TTS) en la información proporcionada.

## Limitaciones y advertencias

- Idioma limitado a inglés; no se garantiza el funcionamiento en otros idiomas.
- No soporta CFG, min_p ni exaggeration, a diferencia de otros backends de CrispASR (por diseño del pipeline upstream).
- Dependencia externa: requiere el módulo S3Gen de `cstr/chatterbox-turbo-GGUF` como acompañante; sin él, el modelo no puede generar audio.
- El token `stop_text_token: 50256` en la configuración es un artefacto de entrenamiento y no debe usarse en inferencia (el código de `generate()` lo ignora).
- Al ser una conversión GGUF, el rendimiento puede variar según el backend y la cuantización; se recomienda usar q8_0 como equilibrio entre calidad y tamaño.
- No se han publicado evaluaciones de sesgos o alucinaciones en la salida de voz; como sistema TTS, puede generar pronunciaciones incorrectas en nombres propios o palabras poco frecuentes.
- La licencia MIT permite uso comercial, pero se debe verificar la atribución requerida por el modelo original (Resemble AI).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/cstr/chatterbox-nano-GGUF
- Modelo base original: https://huggingface.co/ResembleAI/chatterbox-nano
- Repositorio de Chatterbox (Resemble AI): https://github.com/resemble-ai/chatterbox
- Wiki de Chatterbox: https://github.com/resemble-ai/chatterbox/wiki
- Repositorio de CrispASR: https://github.com/CrispStrobe/CrispASR
- Script de conversión: https://github.com/CrispStrobe/CrispASR/blob/main/models/convert-chatterbox-to-gguf.py
- Repositorio compañero (Turbo S3Gen): https://huggingface.co/cstr/chatterbox-turbo-GGUF
