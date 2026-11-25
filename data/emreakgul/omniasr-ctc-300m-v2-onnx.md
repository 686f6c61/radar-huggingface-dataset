# EmreAkgul/omniASR-CTC-300M-v2-ONNX

## Resumen

omniASR-CTC-300M-v2-ONNX es una exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) `omniASR_CTC_300M_v2` desarrollado por Meta dentro del proyecto Omnilingual ASR. La conversión la mantiene EmreAkgul y está pensada para su uso con la librería `fast-omniasr`, un runtime ligero que permite ejecutar el modelo mediante ONNX Runtime en CPU o GPU sin depender del stack original de fairseq2.

El modelo resuelve la transcripción de audio monolingüe a texto con una cabeza CTC (Connectionist Temporal Classification) y está diseñado explícitamente como un modelo multilingüe de cobertura amplia, siguiendo la filosofía del proyecto Omnilingual ASR de Meta. Con 300 millones de parámetros se sitúa en un rango medio que permite despliegues en hardware modesto, algo relevante para aplicaciones de transcripción en producción donde el coste por hora de audio importa.

La relevancia de esta ficha radica en que se trata de una conversión de formato, no de un modelo nuevo: no se ha reentrenado ni modificado intencionadamente ningún peso, y el tokenizador upstream se redistribuye sin cambios. Esto lo convierte en una opción práctica para quien quiera inferencia ONNX verificada con FP32, FP16 o BF16, con manifiestos de integridad SHA-256 en `config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer CTC (exportación ONNX del checkpoint fairseq2 `omniASR_CTC_300M_v2`) |
| Parametros totales | 300M (según nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada dinámico, `[1, samples]`) |
| Tipos de cuantizacion | FP32 (por defecto), FP16, BF16 (variantes en subcarpetas `fp16/` y `bf16/`) |
| Idiomas soportados | multilingüe (cobertura exacta no disponible; paridad medida en inglés, turco y kurdo central) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18, `dynamo=False`), con posibles archivos externos de tensores; tokenizador SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con cabeza CTC exportado desde el checkpoint oficial de fairseq2 de Meta. La exportación se realizó con `torch.onnx.export` en opset 18 y `dynamo=False`, generando un grafo ONNX de forma dinámica cuya entrada es `audio` (float32, `[1, samples]`) y cuya salida es `logits` (float32, `[1, frames, 10288]`), lo que refleja un vocabulario de 10 288 tokens del tokenizador SentencePiece upstream `omniASR_tokenizer_written_v2.model`.

No se ha realizado reentrenamiento ni modificación intencionada de pesos. Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada y deben consultarse en el repositorio upstream de Omnilingual ASR de Meta. La innovación técnica destacable de esta distribución es la exportación ONNX con manifiesto de integridad (`config.json` con tamaños y SHA-256 de cada activo), el soporte de precisión seleccionable y el almacenamiento de tensores en archivos complementarios referenciados por `model.onnx`.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe con salida de texto.
- Decodificación CTC, adecuada para transcripción en streaming o por lotes.
- Entrada de audio dinámica: acepta longitudes variables de muestras en una sola pasada.
- Re-muestreo automático a 16 kHz y normalización gestionados por `fast-omniasr`.
- Ejecución en CPU y CUDA mediante ONNX Runtime.
- Selección de precisión (FP32, FP16, BF16) con descarga solo de la variante solicitada.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo ASR puro).
- No soporta la ruta de inferencia LLM/seq2seq de OmniASR (solo CTC).

## Casos de uso

- Transcripción por lotes de reuniones y entrevistas: el modelo acepta audio de duración variable gracias a la forma dinámica de entrada, y la variante FP16 reduce la memoria residente a 1,4 GiB en CUDA, lo que permite procesar horas de audio en una sola GPU consumer.
- Subtitulado automático de vídeo: al ejecutarse sobre ONNX Runtime en CPU, puede integrarse en pipelines de postproducción sin GPU dedicada, resampleando a 16 kHz de forma transparente.
- Servicio de dictado o notas de voz en aplicaciones móviles o de escritorio: el tamaño de 300M y la opción FP16 (1,4 GiB) hacen viable el despliegue en estaciones de trabajo con GPU modesta.
- Investigación en ASR multilingüe: sirve como línea base reproducible en ONNX para comparar con otros modelos CTC y para experimentar con precisión FP16/BF16 midiendo el impacto en la transcripción (paridad documentada de 2/3 clips idénticos frente a FP32).
- Indexación y búsqueda de contenido audiovisual: la transcripción previa permite alimentar motores de búsqueda sobre archivos de audio y vídeo, con verificación de integridad de activos mediante SHA-256.
- Prototipado rápido en entornos sin PyTorch/fairseq2: la instalación de `fast-omniasr[onnx,hub]` y una llamada a `from_pretrained` bastan para poner el modelo en marcha, útil en entornos de CI o contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (WER, MMLU, etc.) en la información disponible. La model card solo aporta datos de paridad de precisión: frente a FP32, las transcripciones FP16 y BF16 son idénticas en 2 de cada 3 clips de prueba (inglés, turco y kurdo central), y pueden diferir en palabras individuales cuando FP32 está cerca de un empate.

| Precisión | Dispositivos | Memoria GPU residente (CUDA) | Transcripciones vs FP32 |
|---|---|---:|---|
| FP32 (por defecto) | CPU, CUDA | 2,4 GiB | referencia |
| FP16 | CPU, CUDA | 1,4 GiB | 2/3 idénticas |
| BF16 | CUDA (Ampere o superior) | 1,5 GiB | 2/3 idénticas |

## Requisitos de hardware

- VRAM estimada: 2,4 GiB en FP32, 1,4 GiB en FP16 y 1,5 GiB en BF16 (memoria residente de pesos en CUDA).
- GPU recomendadas: cualquier GPU CUDA compatible con ONNX Runtime; BF16 requiere Ampere o superior (p. ej. A100, RTX 30xx/40xx). FP16 funciona también en CPU, aunque sin ganancia de velocidad.
- Cabe en GPU consumer: sí, con amplio margen (1,4-2,4 GiB de pesos), incluidas RTX 3060/4060 y superiores.
- Despliegue: ONNX Runtime a través de `fast-omniasr` (versión 0.3.0 o superior para selección de precisión). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. TensorRT en `fast-omniasr` es experimental y FP16 puede alterar resultados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| omniASR-CTC-300M-v2-ONNX (este) | 300M | audio dinámico `[1, samples]` | Apache-2.0 | ONNX | Hugging Face, runtime `fast-omniasr` |
| omniASR_CTC_300M_v2 (upstream Meta) | 300M | audio dinámico | Apache-2.0 | fairseq2 | Repositorio GitHub de Omnilingual ASR |
| Whisper (variantes de OpenAI) | 39M-1,55B | ventana fija de 30 s | MIT | PyTorch, GGUF, ONNX | Hugging Face, múltiples runtimes |
| Wav2Vec 2.0 / MMS (Meta) | 95M-1B | audio variable | MIT/Apache-2.0 | PyTorch | Hugging Face |

No se dispone de datos de rendimiento comparativo (WER) en la información proporcionada para establecer una comparación cuantitativa con Whisper o MMS.

## Limitaciones y advertencias

- Es una conversión de formato: hereda íntegramente las capacidades, cobertura lingüística, precisión y limitaciones del modelo upstream; no las mejora.
- Solo soporta la ruta CTC; no es compatible con la inferencia LLM/seq2seq de OmniASR.
- La cobertura exacta de idiomas no está documentada en esta ficha; la paridad de precisión solo se midió en inglés, turco y kurdo central.
- FP16 y BF16 pueden cambiar palabras individuales respecto a FP32; FP32 es la ruta verificada.
- En CPU, FP16 ahorra memoria pero no acelera; ONNX Runtime no tiene kernels BF16 para CPU.
- TensorRT en `fast-omniasr` es experimental.
- Riesgo de alucinación y sesgos: no documentados en esta información; deben consultarse en el repositorio upstream de Meta.
- La entrada debe ser audio mono; el re-muestreo a 16 kHz y la normalización los realiza `fast-omniasr`.
- Licencia Apache-2.0 permite uso comercial, pero esta distribución es independiente y no está afiliada ni respaldada por Meta.
- Los archivos de tensores externos referenciados por `model.onnx` son obligatorios y deben descargarse completos.

## Enlaces

- Hugging Face: https://huggingface.co/EmreAkgul/omniASR-CTC-300M-v2-ONNX
- Runtime fast-omniasr: https://github.com/Emre-Akgul/fast-omniasr
- Repositorio upstream Omnilingual ASR (Meta): https://github.com/facebookresearch/omnilingual-asr
