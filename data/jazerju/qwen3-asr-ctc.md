# JazerJu/qwen3-asr-ctc

## Resumen

Qwen3-ASR-CTC es un cabezal CTC de 48,3 millones de parámetros desarrollado por JazerJu que se conecta a la torre de audio del modelo Qwen3-ASR-1.7B, mantenida congelada durante todo el entrenamiento. Su función es proporcionar una primera pasada rápida de transcripción y alineación forzada en arquitecturas de tipo "CTC first-pass + LLM rescoring", un patrón habitual en sistemas de reconocimiento de voz en producción donde se necesita latencia muy baja antes de aplicar un modelo de lenguaje más costoso.

El modelo resuelve dos problemas concretos: la transcripción rápida con un factor de tiempo real (RTF) de 0,0002 en modo greedy y la generación de marcas temporales a nivel de palabra y de carácter de forma nativa, algo que los decodificadores autorregresivos no ofrecen sin costes adicionales. El repositorio no incluye el codificador: en tiempo de ejecución se descarga desde Qwen/Qwen3-ASR-1.7B, por lo que el peso efectivo del artefacto publicado es de aproximadamente 0,5 GB.

Es relevante ahora porque documenta con inusual honestidad un resultado negativo: el mismo equipo entrenó un cabezal equivalente sobre GLM-ASR-Nano que supera a este en los cinco conjuntos de evaluación limpios, con una diferencia atribuida a la receta de optimización (512 muestras por actualización y 56.916 pasos frente a 256 muestras y 134.140 pasos, con la misma tasa de aprendizaje de 5e-4 sin escalado lineal). El autor lo presenta explícitamente como un producto de investigación, no como el mejor modelo disponible para primera pasada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal CTC sobre codificador de audio congelado (Qwen3-ASR-1.7B); proyección 2048→2048→512 más 5 bloques Transformer (8 cabezas, FFN 128) |
| Parametros totales | 48.344.468 (solo el cabezal CTC; el codificador se carga aparte) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana de audio no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, yue, ja, ko, de, fr, es, it, pt, nl, pl (15 variantes linguisticas en el corpus de entrenamiento) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria pytorch); incluye `vocab_compact.json` y `modeling_ctc.py` |

## Arquitectura y entrenamiento

El sistema completo consta de dos piezas. La primera es la torre de audio de Qwen3-ASR-1.7B, que permanece congelada y aplica tres capas de convolución 2D con stride 2, lo que produce un diezmado de 8x sobre la señal mel. La segunda es el cabezal CTC entrenado: una proyección 2048→2048→512 seguida de cinco bloques Transformer con 8 cabezas de atención y FFN de dimensión 128, que emite sobre un vocabulario de 72.468 clases. La tasa de frames resultante es de 13 fps (76,9 ms por frame), muy inferior a los 50 fps de Whisper o GLM-ASR, un detalle crítico porque la fórmula oficial de longitudes es "13 frames por cada 100 frames mel" y debe respetarse para que la alineación sea correcta.

El entrenamiento utilizó 26 manifiestos con 7.434.437 utterances (7.285.749 de entrenamiento y 148.688 de validación) en 15 variantes lingüísticas, combinando AISHELL-1, WenetSpeech M, MAGICDATA, Common Voice (yue, zh-HK, zh-TW, ja), LibriSpeech, GigaSpeech M, KsponSpeech, MLS (de, nl, fr, es, it, pt, pl), TALCS, CS-Dialogue y ASCEND, con sobremuestreo 3x de los tres corpus de habla mixta chino-inglés. Se ejecutó en 8 aceleradores Ascend 910B3 con CANN 9.0.1 y torch_npu 2.8.0, con lote de 64 por tarjeta, acumulación de gradiente 1, tasa 5e-4 con decaimiento coseno, una época de calentamiento con bloques congelados y tres épocas completas: 56.916 actualizaciones en 11 horas y 56 minutos, con pérdida final de 0,4958 en entrenamiento y 0,6150 en validación.

La innovación técnica más destacable es la compactación del vocabulario: de los 151.705 tokens nativos de Qwen3, solo 72.377 aparecían en los 6,62 millones de utterances del corpus (47,7%), de modo que el 52,3% restante nunca recibía gradiente positivo en las filas de `ctc_lo` y solo actuaba como denominador en el softmax. Reducir a 72.468 clases eliminó 40,6 millones de parámetros sin introducir tokens desconocidos ni deriva en la decodificación. El autor documenta además tres trampas de implementación: la entrada del codificador es un tensor 2D `[128, ΣT_mel]` con `feature_lens` en lugar de `[B, 128, T]`; la tasa de frames es 13 fps y no 50 fps; y es obligatorio aplicar un parche de máscara de atención, porque en `qwen-asr` 0.0.6 la función `_prepare_attention_mask` está definida pero nunca se invoca, lo que degrada la similitud coseno entre inferencia individual y por lotes a 0,81-0,88 (frente a 0,9998 o más con el parche), también en CUDA.

## Capacidades

- Transcripción de voz multilingüe en 12 idiomas declarados (chino, inglés, cantonés, japonés, coreano, alemán, francés, español, italiano, portugués, neerlandés y polaco), con cobertura de habla mixta chino-inglés gracias a los corpus ASCEND, TALCS y CS-Dialogue.
- Decodificación CTC greedy con RTF de 0,0002: 91,3 horas de audio procesadas en 1,1 minutos sobre 8 Ascend 910B3.
- Alineación forzada con marcas temporales a nivel de carácter y de palabra, emitidas de forma nativa por el cabezal CTC sin necesidad de un modelo de alineación externo.
- Primera pasada para pipelines de rescoring con LLM: produce hipótesis y alineaciones rápidas que un segundo modelo autorregresivo puede refinar.
- Manejo de audio de entrada a 16 kHz en coma flotante, con inferencia por lotes (siempre que se aplique el parche de máscara de atención).
- No dispone de tool calling, function calling, capacidades de agente ni modo de razonamiento: es un modelo puramente acústico.
- No procesa visión ni audio más allá de la transcripción; no genera texto libre, solo secuencias CTC sobre el vocabulario compactado.

## Casos de uso

- Primera pasada en pipelines de reconocimiento en dos etapas: el cabezal genera una hipótesis CTC en milisegundos y un LLM posterior aplica rescoring o corrección; el RTF de 0,0002 permite procesar horas de audio antes de que el segundo modelo termine un solo lote.
- Subtitulado y sincronización de vídeo: las marcas a nivel de carácter y palabra permiten generar subtítulos con tiempos de entrada y salida, aplicando la corrección del sesgo sistemático documentado (+100 ms al inicio, −78,5 ms al final) antes de exportar a SRT o WebVTT.
- Alineación forzada de corpus para entrenamiento de modelos TTS: dado un texto conocido y su audio, el modelo produce los límites de cada palabra, útil para construir datasets de síntesis de voz con duraciones exactas.
- Indexación y búsqueda sobre archivos de audio: la transcripción rápida permite generar índices de texto buscable en archivos de decenas de horas con un coste computacional mínimo.
- Investigación comparativa de representaciones: al usar el codificador de Qwen3-ASR-1.7B congelado, sirve para estudiar qué información conserva esa torre de audio frente a alternativas como GLM-ASR-Nano, con la tasa de 13 fps como variable controlada.
- Análisis de llamadas y reuniones en centros de contacto: la combinación de transcripción multilingüe y marcas temporales permite segmentar por hablante y por turno para analítica posterior, aunque la cobertura de japonés es limitada al corpus Common Voice ja.
- Evaluación de calidad acústica y detección de tramos problemáticos: la diferencia entre la hipótesis CTC y la de un modelo de segunda pasada puede usarse como señal de incertidumbre para marcar fragmentos que requieren revisión humana.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando con el cabezal CTC equivalente entrenado sobre GLM-ASR-Nano con los mismos datos e hiperparámetros:

| Test | Metrica | GLM-ASR-Nano | Qwen3-ASR-CTC |
|---|---|---|---|
| AISHELL-1 test | CER | 4,71% | 5,31% |
| AISHELL-1 dev | CER | 4,09% | 4,37% |
| LibriSpeech test-clean | WER | 4,88% | 6,93% |
| LibriSpeech test-other | WER | 9,99% | 12,40% |
| ASCEND test (mixto zh-en) | MER | 11,84% | 14,53% |

Precisión de alineación frente a Montreal Forced Aligner sobre 1.500 frases y 29.621 palabras de LibriSpeech test-clean y test-other:

| Metrica | Qwen3-ASR-CTC (13 fps) | GLM (50 fps) |
|---|---|---|
| Sesgo mediano inicio de palabra | +100,0 ms | +105,0 ms |
| Sesgo mediano fin de palabra | −78,5 ms | −100,0 ms |
| Error absoluto mediano tras des-sesgar, inicio | 50,8 ms | 40,0 ms |
| Inicio con error ≤100 ms tras des-sesgar | 77,6% | 82,4% |
| Error absoluto mediano tras des-sesgar, fin | 60,0 ms | 50,0 ms |

El autor señala que la diferencia de calidad es un factor aproximadamente constante e independiente de la velocidad del habla (1,3-1,5x en inglés, 1,1-1,2x en chino) y la atribuye a la receta de optimización, no al codificador. La validación del eje temporal mostró que al anteponer 1,00 s de silencio digital, el 98,6% de las marcas se desplazan exactamente 1,00 s con error mediano de 0,0 ms.

## Requisitos de hardware

- El repositorio pesa 0,5 GB, pero el codificador Qwen3-ASR-1.7B debe descargarse por separado y añade aproximadamente 3,4 GB en fp16, de modo que el conjunto ronda los 4 GB de pesos.
- VRAM estimada para inferencia: alrededor de 5-6 GB en fp16 sumando pesos, activaciones y lotes pequeños; no se han publicado cifras oficiales de consumo.
- GPU recomendadas: el entrenamiento se realizó en 8 Ascend 910B3, pero la inferencia es portable a CUDA. Una RTX 4090 (24 GB) o RTX 3090 (24 GB) cubren el modelo con holgura; una RTX 4060 Ti de 16 GB o una RTX 4070 de 12 GB también deberían ser suficientes para lotes moderados.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más, dado el tamaño del conjunto.
- Opciones de despliegue: el autor proporciona `modeling_ctc.py` con la clase `Qwen3CtcAsr`, que carga automáticamente el codificador desde Hugging Face o desde un directorio local mediante la variable de entorno `QWEN3_ASR_ENCODER` para entornos sin conexión. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al ser un cabezal CTC con un codificador de arquitectura específica, la integración con esos motores requeriría trabajo adicional.
- Latencia y throughput: RTF de 0,0002 en decodificación greedy sobre 8 Ascend 910B3 (91,3 horas de audio en 1,1 minutos). No se han publicado cifras para una sola GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ASR-CTC (este) | 48,3 M (cabezal) + codificador Qwen3-ASR-1.7B | no disponible | CER 5,31% AISHELL-1 test; WER 6,93% LibriSpeech clean | Apache-2.0 | Hugging Face, 27 descargas |
| Cabezal CTC sobre GLM-ASR-Nano | no disponible | no disponible | CER 4,71% AISHELL-1 test; WER 4,88% LibriSpeech clean | no disponible | Referenciado en la model card, sin repositorio público enlazado |
| Whisper (referencia de tasa de frames) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es interna: el mismo equipo, con los mismos datos e hiperparámetros, obtuvo mejores resultados sobre el codificador de GLM-ASR-Nano. No se han publicado comparaciones con otros sistemas CTC de primera pasada en la información disponible.

## Limitaciones y advertencias

- Es un producto de investigación, no el mejor modelo disponible para primera pasada CTC: el cabezal sobre GLM-ASR-Nano supera a este en los cinco conjuntos limpios evaluados.
- Contaminación de datos confirmada: los splits oficiales de test de TALCS, MAGICDATA y CS-Dialogue están incluidos en el corpus de entrenamiento, por lo que las métricas sobre esos tres conjuntos no son indicadores de generalización.
- Sesgo temporal sistemático en las marcas: las palabras empiezan unos 100 ms tarde y terminan unos 78,5 ms pronto. Es una propiedad de la emisión tipo pico del CTC y debe corregirse por resta antes de usar las marcas en producción.
- En chino, las marcas son sistemáticamente unos 303 ms más tardías que las del cabezal GLM, pero no existen referencias de alineación a nivel de palabra en chino para determinar cuál es más preciso; en inglés la diferencia es de solo 30,5 ms y ambas coinciden con MFA.
- Cobertura de japonés limitada exclusivamente a Common Voice ja, lo que restringe la variabilidad de acentos, dominios y condiciones acústicas.
- El paquete `qwen-asr` 0.0.6 tiene un fallo conocido de máscara de atención que degrada la coherencia entre inferencia individual y por lotes (similitud coseno de 0,81-0,88) tanto en CUDA como en Ascend; es imprescindible aplicar `patch_qwen3_attention_mask()`.
- Usar una tasa de frames de 50 fps en lugar de 13 fps produce pérdidas que parecen descender pero alineaciones completamente incorrectas.
- Riesgo de alucinación bajo: al ser un modelo CTC con vocabulario cerrado, no genera texto libre, pero puede emitir secuencias plausibles en audio con ruido o en idiomas no cubiertos.
- Sesgos de dominio y de acento derivados de la composición del corpus, con sobrerrepresentación del chino mandarín y del inglés y menor cobertura de las lenguas europeas vía MLS.
- Licencia Apache-2.0 para los pesos del cabezal, heredada del modelo base; los corpus de entrenamiento conservan sus licencias propias y no se distribuyen en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/JazerJu/qwen3-asr-ctc
- Modelo base (codificador): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Código de entrenamiento y evaluación: https://gitea.cemp.top/jju/glm-asr-ctc-trn-dev
- Dataset de alineaciones de referencia (MFA): https://huggingface.co/datasets/gilkeyio/librispeech-alignments
