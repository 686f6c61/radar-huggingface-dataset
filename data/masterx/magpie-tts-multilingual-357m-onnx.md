# Masterx/magpie-tts-multilingual-357m-ONNX

## Resumen

Magpie-TTS Multilingual 357M — ONNX es una reempaquetación en formato ONNX del modelo de síntesis de voz NVIDIA Magpie-TTS Multilingual 357M (checkpoint v2607) junto con su decodificador de audio NanoCodec a 22,05 kHz. El autor de la conversión es el usuario de HuggingFace Masterx, que publica los grafos listos para ONNX Runtime con el objetivo de ejecutarlos en CPU mediante un bucle de decodificación nativo escrito en Rust dentro del proyecto WinSTT. Toda la autoría del modelo subyacente corresponde a NVIDIA; este repositorio únicamente reorganiza y cuantiza los pesos originales.

Se trata de un sistema de text-to-speech autorregresivo de aproximadamente 357 millones de parámetros, dividido en cuatro grafos ONNX (codificador de texto, paso del decodificador, paso del transformer local y decodificador del códec) más dos tablas auxiliares (embeddings de codebook y contextos de hablante). Soporta diez idiomas (inglés, alemán, español, francés, italiano, portugués de Brasil, hindi, árabe, coreano y vietnamita) y dispone de cinco voces pregrabadas (Aria, Jason, John, Leo y Sofía), todas capaces de hablar cualquier idioma soportado.

Su relevancia práctica es doble: por un lado demuestra que un TTS multilingüe de NVIDIA puede exportarse a ONNX con fidelidad numérica casi exacta respecto a los módulos originales de NeMo; por otro, ofrece una vía de despliegue en CPU sin GPU, con un conjunto int8 que ocupa 875 MB en descarga, lo que lo hace atractivo para aplicaciones de escritorio, integraciones Rust y entornos sin aceleración por hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autorregresivo basado en transformer (codificador de texto + decodificador con cache KV + transformer local) con decodificador de audio NanoCodec CausalHiFiGAN; exportado a ONNX |
| Parametros totales | 357M (modelo base NVIDIA Magpie-TTS Multilingual 357M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en el sentido de LLM; el bucle de decodificacion limita a 250 pares de frames por generacion (unos 23 s de audio), por lo que el texto largo debe fragmentarse |
| Tipos de cuantizacion | fp32 (grafos originales) e int8 dinamico (pesos MatMul/Gemm, per-channel, generado con onnxruntime.quantization.quantize_dynamic); el codec permanece en fp32 en ambos conjuntos |
| Idiomas soportados | en, de, es, fr, it, pt (brasileno), hi, ar, ko, vi. El checkpoint upstream tambien cubre mandarin y japones, pero no estan soportados por el port del tokenizer de WinSTT (requieren segmentadores jieba/OpenJTalk) |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | ONNX (opset 18) y ficheros auxiliares .bin en f32 little-endian |

## Arquitectura y entrenamiento

El modelo original de NVIDIA es un sistema TTS autorregresivo que se descompone, en la exportación, en cuatro grafos. El codificador de texto recibe ids int64 [1, T] y produce las claves y valores de atención cruzada por capa (cross_k, cross_v de forma [12, 2, T, 128], duplicados para el par de classifier-free guidance). El paso del decodificador trabaja con 12 capas y 12 cabezas de dimensión 64, mantiene cache KV explícita y emite logits de [B, 32384] (16 bancos de codebook × 2024 entradas), una salida dec_out [B, 768], una señal de alineamiento align [B, Tt] y las nuevas claves y valores. El transformer local tiene 2 capas y genera 16 códigos por paso. Finalmente, el decodificador NanoCodec transforma códigos int64 [1, 8, T] en audio f32 a 22.050 Hz con 1024 muestras por frame, con una tasa de bits de 1,89 kbps y 21,5 fps.

La exportación se realizó con NeMo 3.0.0 (clase MagpieTTSModel) y PyTorch 2.14.1 mediante torch.onnx.export (exportador TorchScript) en opset 18. El decodificador y el transformer local se reescribieron como grafos de un solo paso con caches KV explícitas siguiendo la semántica de caché de NeMo. El decodificador del códec se exportó plegando las parametrizaciones de weight-norm en convoluciones planas, lo que reduce el grafo sin alterar la salida. Los ficheros `*_int8.onnx` son versiones int8 dinámicas de los tres grafos transformer, obtenidas con cuantización per-channel de los pesos MatMul/Gemm.

El bucle de inferencia se ejecuta en el host: prefill de `[contexto de hablante ; frame BOS]` para la fila condicional y `[zeros ; frame BOS]` para la incondicional (que solo atiende a la posición 0 del texto y no recibe prior), mezcla de logits con CFG 2,5, aplicación del prior de atención con eps 0,1 y lookahead 6, muestreo de 16 códigos por paso con temperatura 0,6 y top-k 80, y parada en el primer EOS (2017) del frame muestreado o del argmax. BOS es 2016 y los ids de texto deben terminar en EOS 3358. No se documenta en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO en el entrenamiento del modelo base.

## Capacidades

- Generación de voz multilingüe a partir de texto en diez idiomas (inglés, alemán, español, francés, italiano, portugués de Brasil, hindi, árabe, coreano y vietnamita).
- Cinco voces pregrabadas integradas en `speaker_context.bin`, en este orden: Aria (femenina), Jason (masculina), John (masculina), Leo (masculina) y Sofía (femenina). Cada voz habla todos los idiomas.
- Síntesis de audio a 22,05 kHz mediante el decodificador NanoCodec.
- Conversión de texto a fonemas con tokenizer NeMo que incluye diccionarios de pronunciación IPA G2P para inglés, alemán, español, portugués de Brasil e hindi, además de tokenizadores de caracteres.
- Inferencia puramente en CPU mediante ONNX Runtime, sin requisito de GPU.
- Ejecución de los grafos con cualquier runtime compatible con ONNX, no solo ORT (los grafos son ONNX estándar).
- No dispone de clonación de voz zero-shot (fue eliminada en el checkpoint upstream) ni de capacidades de visión, audio de entrada o tool calling.

## Casos de uso

- Narración o locución multilingüe en aplicaciones de escritorio: el conjunto int8 ocupa 875 MB y se ejecuta en CPU a través de ONNX Runtime, por lo que puede integrarse en un instalador de escritorio sin dependencia de GPU.
- Sistemas de accesibilidad (lectura de pantalla): el modelo genera voz a 22,05 kHz con cinco voces y diez idiomas, adecuado para lectores de pantalla que necesiten cambiar de idioma sin recargar el modelo.
- Locuciones para asistentes de voz embebidos en Rust: WinSTT ya integra el modelo con un bucle de decodificación nativo, lo que sirve de referencia para integrarlo en aplicaciones de línea de comandos o servicios locales.
- Generación de avisos y notificaciones habladas: con textos cortos (por debajo del límite de 250 pares de frames, unos 23 s) el modelo encaja en la síntesis de mensajes puntuales en portugués, hindi o árabe, idiomas menos cubiertos por alternativas.
- Prototipado de doblaje o audiolibros por fragmentos: fragmentando el texto en segmentos de menos de 23 s y encadenando generaciones, se pueden producir pistas de audio largas seleccionando la voz entre las cinco disponibles.
- Pruebas de integración en CI sin acelerador: al existir versiones fp32 e int8 y validación end-to-end con códigos idénticos en 12/12 frases, puede usarse como componente de test reproducible en pipelines que no disponen de GPU.
- Investigación en exportación ONNX de modelos NeMo: el repositorio documenta el método de exportación, las formas de los tensores y las tolerancias numéricas, lo que sirve como plantilla para exportar otros modelos TTS de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye datos de validación numérica de la exportación y pruebas de inteligibilidad, que se reproducen a continuación. La sección de WER/CER con whisper-small aparece truncada en la información proporcionada, por lo que no se incluyen cifras concretas de error de transcripción.

| Comprobacion | Resultado |
|---|---|
| Grafo vs modulos NeMo (max abs) | text encoder ≤ 2,1e-5; decoder step ≤ 3,0e-5 (prefill, pasos cacheados, cache de 250 frames); local step ≤ 2,7e-5; codec ≤ 4,5e-5 (codec plegado vs NeMo 1,9e-5) |
| Codigos greedy end-to-end, NeMo vs ONNX | 12/12 frases (en, de, fr, hi × 3) con codigos y numero de frames identicos (acuerdo de tokens 1,0) |
| Bucle Rust nativo vs referencia Python ORT (codigos greedy) | 12/12 frases identicas (acuerdo de tokens 1,0) |
| WER/CER (whisper-small, muestreado) | no disponible (seccion truncada en la informacion proporcionada) |

## Requisitos de hardware

- El modelo está diseñado explícitamente para ejecutarse en CPU mediante ONNX Runtime con un bucle de decodificación nativo en Rust (proyecto WinSTT); no depende de GPU.
- VRAM de GPU: no aplica para el caso de uso principal (inferencia en CPU). En caso de forzar la ejecución en GPU con ONNX Runtime, el conjunto int8 (875 MB en descarga) o fp32 (1,3 GB en descarga) debería caber en GPUs consumer con 4-8 GB de VRAM, aunque no se documenta un perfil de GPU oficial.
- Memoria en CPU: estimada a partir del tamaño de los conjuntos descargables (875 MB int8 / 1,3 GB fp32) más el espacio de trabajo del runtime; no se publican cifras oficiales de consumo en ejecución.
- GPU recomendadas: no disponible; no se documenta ningún perfil de GPU en la información proporcionada.
- Cabe en GPU consumer: el conjunto int8 debería caber en tarjetas con 4 GB o más de VRAM, pero es una estimación derivada de los tamaños de fichero, no un dato publicado.
- Opciones de despliegue: ONNX Runtime (referencia directa del autor), bucle nativo en Rust de WinSTT y cualquier runtime compatible con ONNX que soporte opset 18.
- Latencia y throughput: no disponible; no se publican mediciones de tiempo por frame ni de factor en tiempo real.

## Comparativa con modelos similares

| Modelo | Formato | Parametros | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Masterx/magpie-tts-multilingual-357m-ONNX (este) | ONNX (fp32 e int8 dinamico) | 357M (modelo base) | 10 | NVIDIA Open Model License | HuggingFace, 0 descargas |
| nvidia/magpie_tts_multilingual_357m (base) | Pesos PyTorch/NeMo | 357M | 12 (incluye mandarin y japones en el checkpoint) | NVIDIA Open Model License | HuggingFace (oficial) |
| nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps | Pesos NeMo | no disponible | no aplica (codec de audio) | NVIDIA Open Model License | HuggingFace (oficial) |

No se dispone en la información proporcionada de datos comparativos con otras familias de TTS (por ejemplo, modelos tipo XTTS o Kokoro), ni de cifras de calidad objetiva (MOS, WER) que permitan una comparación cuantitativa frente a alternativas.

## Limitaciones y advertencias

- Es una reempaquetación, no un modelo nuevo: la autoría y las condiciones de uso corresponden a NVIDIA, y toda redistribución debe conservar los ficheros `LICENSE` y `NOTICE` incluidos en el repositorio.
- Licencia NVIDIA Open Model License (etiquetada como "other"): conviene revisar el texto completo antes de un uso comercial, ya que no es una licencia de código abierto estándar.
- Límite de generación de 250 pares de frames (aproximadamente 23 s) por llamada; el texto más largo debe fragmentarse y encadenarse manualmente.
- No incluye clonación de voz zero-shot, ya que NVIDIA la eliminó en el checkpoint upstream.
- El tokenizer de WinSTT no soporta mandarín ni japonés, pese a que el checkpoint base sí los cubre; los grafos ONNX no dependen del idioma, pero la tokenización sí.
- El codec permanece en fp32 en ambos conjuntos (int8 y fp32), por lo que la cuantización no reduce su huella.
- Riesgo de alucinación o artefactos de audio: no disponible en la información proporcionada; no se documentan tasas de fallo en la síntesis.
- Sesgos de voz o de acento: no disponible; no se publica análisis de sesgos sobre las cinco voces ni sobre los diez idiomas.
- La validación numérica reportada se limita a 12 frases en cuatro idiomas (en, de, fr, hi), por lo que la cobertura de prueba es reducida respecto a los diez idiomas soportados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en producción por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Masterx/magpie-tts-multilingual-357m-ONNX
- Modelo base: https://huggingface.co/nvidia/magpie_tts_multilingual_357m
- Codec NanoCodec: https://huggingface.co/nvidia/nemo-nano-codec-22khz-1.89kbps-21.5fps
- Proyecto WinSTT: https://github.com/dahshury/WinSTT
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
