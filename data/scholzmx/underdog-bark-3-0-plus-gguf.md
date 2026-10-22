# scholzmx/underdog-bark-3.0-plus-gguf

## Resumen

Underdog Bark 3.0 Plus GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla ConwayResearch/Underdog-Bark-3.0-Plus, publicada por el usuario scholzmx. No es un modelo nuevo: es una recuantización del fine-tune de Conway Research sobre nvidia/parakeet-tdt-0.6b-v3, con 627.090.606 parámetros y un único fichero de 364 MB en cuantización mixta Q4_0/Q8_0. El repo ocupa 0,4 GB y fue creado el 21 de octubre de 2026.

El interés técnico está en el empaquetado: los pesos siguen el contrato de tensores de Starling, no el de llama.cpp ni whisper.cpp, y se ejecutan con el binario `starling-serve` o la librería `libstarling_ggml`, incluida la app Android con motor Vulkan. Eso permite llevar un transductor TDT de 0,6B a un teléfono con una pérdida de calidad nula en la evaluación publicada (FLEURS en_us, 100 clips: 7,12 % WER frente a 7,17 % del fichero exacto en f16, con normalización Starling).

La relevancia es doble: por un lado demuestra que la cuantización Q4_0 con importance matrix sobre un FastConformer + TDT no degrada la transcripción en lectura; por otro, expone una comparación honesta frente al Parakeet original, que en el mismo conjunto obtiene mejor WER (5,56 % / 4,29 % según normalizador), lo que sitúa a este fine-tune como especializado en un dominio distinto al de la lectura de Wikipedia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder convolucional + atención) con decodificador TDT (token-and-duration transducer); red de predicción LSTM y red conjunta |
| Parametros totales | 627.090.606 (0,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; el autor no documenta la ventana maxima de audio) |
| Tipos de cuantizacion | Q4_0 en todas las capas lineales (incluidas las convs pointwise del conformer); Q8_0 en joint, LSTM y embeddings de prediccion; conversion exacta en f16 disponible |
| Idiomas soportados | ingles (`en`); evaluado en `en_us` |
| Licencia | CC-BY-4.0 (heredada del modelo base) |
| Formato de pesos | GGUF con contrato de tensores Starling (no compatible con llama.cpp ni whisper.cpp) |
| Tarea (pipeline) | `automatic-speech-recognition` |
| Fichero publicado | `underdog-bark-3.0-plus-q4pw.gguf`, 364 MB |
| SHA-256 | `586e2d0306a82cf87c6d47e1fff7b80484a4143eaf5afb7da9b4a87cbcab3d29` |
| Motor de inferencia | `starling-serve` / `libstarling_ggml` (flag `--model parakeet`), app Android con motor Vulkan |
| Receta de cuantizacion | `parakeet-q4pw-fullimx.recipe` + importance matrix de 100 clips FLEURS en_us |
| Modelo base | ConwayResearch/Underdog-Bark-3.0-Plus, fine-tune de nvidia/parakeet-tdt-0.6b-v3 |

## Arquitectura y entrenamiento

La red es un transductor TDT, no un transformer decoder-only. El encoder es un FastConformer: bloques convolucionales depthwise intercalados con atención, más capas pointwise que en esta recuantización se han bajado también a Q4_0. El decodificador es un TDT, variante de RNN-T que predice conjuntamente el token y su duración, lo que reduce el número de pasos de decodificación frente a un RNN-T clásico. La red de predicción es una LSTM y la red conjunta combina encoder y predictor; ambas, junto con los embeddings de predicción, se mantienen en Q8_0 para no degradar la salida.

No hay información sobre el dataset de entrenamiento del fine-tune de Conway Research: la model card no detalla número de tokens, composición, ni si hubo RLHF/DPO (no aplica habitualmente en ASR). Lo que sí documenta el publicador es el proceso de conversión y cuantización: conversión exacta de los pesos publicados con `scripts/convert_parakeet_gguf.py --bark model.bark --dtype f16`, cálculo de una importance matrix pasando 100 clips de validación FLEURS en_us por el fichero exacto (`STARLING_IMATRIX`, `benchmarks/quant_phone/wer_models.py`) y recuantización con `starling-quantize --recipe parakeet-q4pw-fullimx.recipe --shrink-f16`. La evaluación se hizo decodificando cada fichero en su propio proceso sobre el motor ggml de CPU.

## Capacidades

- Transcripción de voz a texto en inglés (`en`, evaluado sobre `en_us`) con salida de texto plano.
- Reconocimiento de habla leída: el conjunto de evaluación es FLEURS, es decir, lectura de texto de Wikipedia.
- Ejecución en CPU vía ggml y en GPU móvil vía el motor Vulkan de la app Android de Starling.
- API HTTP local mediante `starling-serve --model parakeet --gguf ... --port 8181`.
- Ficheros reproducibles: se publican la receta de cuantización, la importance matrix y la metodología de conversión.
- No se documentan marcas de tiempo, diarización de hablantes, detección de idioma, traducción ni puntuación/capitalización garantizada.
- No dispone de tool calling, function calling, modo agente ni razonamiento multi-paso: es un modelo puramente acústico.

## Casos de uso

- Dictado y notas de voz offline en Android: el fichero de 364 MB y el motor Vulkan permiten transcribir en el propio dispositivo sin enviar audio a la nube, con un coste de memoria muy por debajo de cualquier ASR basado en transformer grande.
- Servicio de transcripción local en escritorio o servidor de laboratorio: `starling-serve --model parakeet` expone un endpoint HTTP en el puerto 8181 que se puede consumir desde un pipeline de Python para procesar lotes de audio en inglés.
- Etiquetado de corpus en inglés: al ejecutarse en CPU con ggml y sin dependencia de CUDA, sirve para generar transcripciones preliminares de grandes volúmenes de audio de lectura antes de una revisión humana.
- Accesibilidad y subtitulado de contenido leído: audiolibros, conferencias leídas o artículos narrados se ajustan al dominio evaluado (FLEURS), aunque la latencia por segmento no está publicada.
- Referencia para investigación en cuantización: el repo incluye imatrix, receta y script de evaluación, lo que permite reproducir el experimento y medir el efecto de Q4_0 sobre un transductor TDT con normalización Starling y con la normalización inglesa de Whisper.
- Verificación de motores GGUF alternativos: al no seguir el contrato de llama.cpp, es un caso de prueba útil para validar implementaciones del formato Starling en dispositivos de gama baja.

## Benchmarks y rendimiento

FLEURS `en_us` test, 100 clips, decodificación en proceso independiente sobre el motor ggml de CPU. "Exact" es la conversión sin pérdida de los pesos publicados (coincide palabra por palabra con la referencia de transformers en 60 clips).

| Modelo / fichero | WER, normalización Starling | WER, normalización Whisper (Open ASR Leaderboard) |
|---|---:|---:|
| Underdog Bark 3.0 Plus, exact (f16) | 7,17 % | 4,52 % |
| underdog-bark-3.0-plus-q4pw.gguf | 7,12 % | 4,52 % |
| Parakeet TDT 0.6B v3 original (bf16), mismos clips | 5,56 % | 4,29 % |

Diferencia pareada q4pw − exact: −0,08 puntos, IC 95 % [−0,40, +0,17], es decir, sin degradación medible por la cuantización en esta muestra. El autor advierte que FLEURS es habla leída y no cubre el habla conversacional (reuniones, llamadas de resultados) que sí aparecen en las cifras Open ASR del publicador del modelo base. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni métricas equivalentes, que no aplican a un modelo ASR.

## Requisitos de hardware

- Peso del fichero: 364 MB en Q4_0/Q8_0. Con buffers de decoder, mel-spectrograma y estado del motor, la memoria residente estimada ronda 0,5-1 GB (estimación a partir del tamaño del fichero; el autor no publica cifras de memoria).
- Cabe en cualquier GPU de consumo y en la mayoría de móviles Android modernos; no requiere A100, H100 ni RTX 4090.
- Ejecución verificada en CPU (motor ggml) y en GPU móvil mediante el motor Vulkan rápido de la app Android.
- Despliegue: `starling-serve` o `libstarling_ggml` con `--model parakeet`. No es compatible con vLLM, TGI, llama.cpp, Ollama ni whisper.cpp.
- Latencia y throughput: no disponibles. La evaluación procesó 100 clips FLEURS en CPU, pero no se publican tiempos ni factor de tiempo real (RTF).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana de audio | WER FLEURS en_us | Licencia | Formato y motor |
|---|---|---|---|---|---|
| underdog-bark-3.0-plus-q4pw.gguf (este repo) | 627 M | no disponible | 7,12 % (Starling) / 4,52 % (Whisper) | CC-BY-4.0 | GGUF Starling, `starling-serve` |
| ConwayResearch/Underdog-Bark-3.0-Plus (exact f16) | 627 M | no disponible | 7,17 % / 4,52 % | CC-BY-4.0 | pesos originales, convertibles a GGUF |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | 5,56 % / 4,29 % | no indicada en la informacion proporcionada | NeMo / transformers |
| ConwayResearch/Underdog-Bark-3.0-Pro | no disponible | no disponible | no disponible | no disponible | no disponible (el autor solo indica que no presenta el problema de minúsculas y falta de puntuación) |
| moondream/parakeet-ultra | no disponible | no disponible | no disponible | no disponible | no disponible (citado solo como ascendencia) |

## Limitaciones y advertencias

- Solo inglés. No hay soporte multilingüe ni traducción; el propio autor etiqueta el modelo únicamente como `en`.
- Estilo de salida inconsistente: en aproximadamente 1 de cada 10 clips de FLEURS el modelo escribe en minúsculas y sin puntuación, y a menudo deletrea los números ("twenty five" en lugar de "25"). La normalización inglesa de Whisper corrige parte de este efecto en las métricas, pero el texto crudo no es apto para publicación directa sin postproceso.
- Calidad inferior al modelo original en el dominio evaluado: el Parakeet TDT 0.6B v3 sin fine-tune obtiene 5,56 % / 4,29 % frente a 7,12 % / 4,52 % de este modelo. El fine-tune está orientado a un dominio que la ficha no documenta.
- Evaluación muy limitada: 100 clips de habla leída de Wikipedia. No hay datos de habla espontánea, ruido de fondo, acentos no estadounidenses, solapamiento de hablantes ni audio telefónico. Riesgo de alucinación o de salida vacía en silencios y ruido no cuantificado.
- Dependencia de motor propietario del ecosistema: los tensores siguen el contrato de Starling y no cargan en llama.cpp ni whisper.cpp, lo que limita la portabilidad y el soporte de herramientas de terceros.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, un único publicador y sin validación independiente de la recuantización.
- Licencia CC-BY-4.0: exige atribución a Conway Research, NVIDIA y Moondream y la conservación del fichero `NOTICE`; los cambios declarados son solo la conversión a GGUF y la recuantización. Cualquier uso comercial debe mantener esa atribución.
- No se documentan marcas de tiempo por palabra, diarización ni segmentación de hablantes, lo que imposibilita subtitulado sincronizado fino sin un componente adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scholzmx/underdog-bark-3.0-plus-gguf
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Plus
- Modelo de origen de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Ascendencia citada por el autor: https://huggingface.co/moondream/parakeet-ultra
- Motor de inferencia Starling: https://github.com/sims1253/starling
- Papers, blogs y demos: no se han encontrado enlaces de este tipo en la información disponible.
