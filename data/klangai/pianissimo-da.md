# KlangAI/pianissimo-da

## Resumen

Pianissimo-da es un modelo de reconocimiento automático del habla (ASR) especializado en danés, desarrollado por KlangAI. Se trata de un ajuste fino (finetune) del modelo NVIDIA Parakeet TDT 0.6B v3, una arquitectura FastConformer con decodificación TDT (Token-and-Duration Transducer) de 600 millones de parámetros. El modelo resuelve el problema de la transcripción precisa de audio en danés, un idioma con escasa representación en modelos ASR multilingües de código abierto.

La relevancia del modelo radica en su rendimiento declarado: un 11,8 % de tasa media de error de palabra (WER) en tres conjuntos de evaluación daneses, el mejor resultado entre los modelos abiertos y cerrados que el autor afirma haber probado. Además, ofrece velocidades de inferencia muy elevadas (más de 3.600 veces tiempo real en una NVIDIA H100 y 500 veces en una L4), lo que lo hace apto para despliegues de producción a gran escala.

El modelo se distribuye bajo licencia CC BY 4.0, lo que permite uso comercial con atribución, y el autor publica variantes cuantizadas para CPU (ONNX, GGUF), GPU de Apple silicon (MLX) y Apple Neural Engine (CoreML), facilitando su ejecución en servidores, portátiles y teléfonos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con decodificación TDT (Token-and-Duration Transducer) |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, bf16, int8, int4, Q8_0, Q5_K_M, Q4_K_M (GGUF), 8-bit y 4-bit (MLX), 8-bit y fp16 (CoreML) |
| Idiomas soportados | danés (da) |
| Licencia | CC BY 4.0 |
| Formato de pesos | NeMo (.nemo), ONNX, GGUF, MLX, CoreML |

## Arquitectura y entrenamiento

Pianissimo-da emplea la arquitectura FastConformer, un transformer convolucional optimizado para audio, combinada con decodificación TDT (Token-and-Duration Transducer). Esta variante de transducer predice conjuntamente tokens y duraciones, lo que permite una decodificación no autorregresiva más eficiente que los transductores clásicos. El modelo parte de NVIDIA Parakeet TDT 0.6B v3 y se ajusta específicamente para danés mediante un proceso de finetune del que no se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

El modelo incorpora soporte nativo de puntuación, mayúsculas y marcas de tiempo a nivel de palabra. Asimismo, implementa phrase boosting (impulso de frases) mediante un árbol de boosting en la decodificación greedy, que permite sesgar el reconocimiento hacia vocabulario personalizado (nombres propios, términos técnicos, topónimos) con parámetros configurables como `context_score` y `depth_scaling`. No se especifica en la información proporcionada si se aplicaron técnicas de RLHF o DPO, algo poco habitual en modelos ASR.

## Capacidades

- Transcripción de voz a texto en danés con puntuación y mayúsculas automáticas.
- Generación de marcas de tiempo a nivel de palabra y de segmento mediante el parámetro `timestamps=True`.
- Phrase boosting para vocabulario personalizado (nombres, términos técnicos, instituciones) con sensibilidad a mayúsculas.
- Procesamiento por lotes de múltiples archivos de audio con `batch_size` configurable.
- Inferencia en CPU, GPU NVIDIA, GPU de Apple silicon y Apple Neural Engine mediante las variantes cuantizadas.
- Ejecución en servidores, portátiles y teléfonos según la variante elegida.
- No se documentan capacidades de traducción, diarización de hablantes ni detección de idioma.

## Casos de uso

- Transcripción de reuniones y actas corporativas: el modelo genera texto con puntuación y mayúsculas, y las marcas de tiempo por palabra permiten alinear la transcripción con el audio para revisiones posteriores.
- Subtitulado automático de vídeo en danés: las marcas de tiempo a nivel de palabra facilitan la generación de subtítulos sincronizados, y la velocidad de 3.600× tiempo real en H100 permite procesar grandes catálogos en poco tiempo.
- Atención al cliente y análisis de llamadas: la transcripción por lotes con `batch_size` ajustable permite procesar grabaciones de call center y aplicar posteriormente análisis de sentimiento o extracción de entidades.
- Aplicaciones móviles de dictado: la variante CoreML 8-bit (632 MB) se ejecuta en el Apple Neural Engine a 183× tiempo real en un M5, adecuada para dictado offline en dispositivos Apple.
- Transcripción en servidores sin GPU: la variante ONNX int8 (684 MB) corre en CPU Intel a 35× tiempo real y en Mac a 74×, permitiendo despliegues en infraestructura sin acelerador.
- Dominios especializados con vocabulario propio: el phrase boosting permite introducir términos médicos, legales o nombres de instituciones (por ejemplo, "Folketinget", "Aarhus Universitet") para mejorar la ortografía en transcripciones de nicho.
- Archivado y búsqueda de audio histórico: la alta velocidad de inferencia y la licencia CC BY 4.0 permiten transcribir archivos de audio completos para indexación y búsqueda textual sin restricciones comerciales.

## Benchmarks y rendimiento

El autor reporta un WER medio del 11,8 % en tres conjuntos de evaluación daneses, sin detallar en la información disponible los nombres de dichos conjuntos ni los resultados desglosados. La siguiente tabla recoge los WER por variante sobre 200 clips daneses de FLEURS (38 minutos), evaluados tras convertir a minúsculas y eliminar puntuación:

| Version | Ejecucion | Tamano | WER (%) | Velocidad (RTFx) |
|---|---|---:|---:|---:|
| Original fp32 (NeMo) | PyTorch y NeMo | 2.51 GB | 6.5 | — |
| ONNX int8 | CPU | 684 MB | 6.7 | 35× (Intel), 74× (Mac) |
| ONNX int4 | CPU | 525 MB | 7.2 | 12× (Intel), 37× (Mac) |
| ONNX fp16 | CPU | 1.46 GB | 6.5 | 18× (Intel), 55× (Mac) |
| ONNX fp32 | CPU | 2.56 GB | 6.5 | 18× (Intel), 55× (Mac) |
| MLX 8-bit | GPU Apple silicon | 759 MB | 6.6 | 151× |
| MLX 4-bit | GPU Apple silicon | 528 MB | 7.1 | 126× |
| MLX bf16 | GPU Apple silicon | 1.25 GB | 6.5 | 140× |
| MLX fp32 | GPU Apple silicon | 2.51 GB | 6.5 | 173× |
| GGUF Q8_0 | CPU/GPU con transcribe.cpp | 740 MB | 6.4 | — |
| GGUF Q5_K_M | CPU/GPU con transcribe.cpp | 549 MB | 6.5 | — |
| GGUF Q4_K_M | CPU/GPU con transcribe.cpp | 485 MB | 6.5 | — |
| GGUF F16 | CPU/GPU con transcribe.cpp | 1.26 GB | 6.6 | — |
| GGUF F32 | CPU/GPU con transcribe.cpp | 2.51 GB | 6.6 | — |
| CoreML 8-bit | Apple Neural Engine | 632 MB | 6.9 | 183× (M5) |
| CoreML fp16 | Apple Neural Engine | 1.22 GB | 7.0 | 174× (M5) |

Las mediciones de velocidad de ONNX y MLX se realizaron con el modelo sueco de la misma arquitectura sobre un clip de 30 segundos, usando un Intel Xeon Platinum 8481C con 4 hilos de CPU, un Apple M5 Pro con 6 hilos de CPU o la GPU del M5 Pro para MLX. Las mediciones de CoreML se hicieron con los 200 clips daneses en un Apple M5 Neural Engine. No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a un modelo ASR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo original fp32 ocupa 2,51 GB de pesos; en fp16/bf16 aproximadamente 1,25 GB; en int8 unos 0,7 GB; en int4 unos 0,5 GB.
- GPU recomendadas: NVIDIA H100 (más de 3.600× tiempo real), NVIDIA L4 (500× tiempo real). Cualquier GPU NVIDIA con al menos 3 GB de VRAM puede ejecutar la versión fp32.
- GPU de consumo: cabe holgadamente en RTX 4090, RTX 3090, RTX 4060 y similares; incluso GPUs con 4-6 GB de VRAM son suficientes.
- Apple silicon: las variantes MLX corren en la GPU de Macs con chip Apple silicon; las variantes CoreML en el Apple Neural Engine (183× en M5).
- CPU: las variantes ONNX y GGUF permiten inferencia sin GPU; ONNX int8 alcanza 35× en Intel Xeon y 74× en Mac.
- Opciones de despliegue: NeMo Toolkit (PyTorch), ONNX Runtime mediante `onnx-asr`, MLX, CoreML y `transcribe.cpp` para GGUF. No se mencionan vLLM, TGI ni Ollama, que no son aplicables a este tipo de modelo ASR.
- Latencia y throughput: más de 3.600× tiempo real en H100 y 500× en L4 con el modelo original; 183× en Apple Neural Engine M5 con CoreML 8-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER danes | Licencia | Formatos |
|---|---|---|---|---|---|
| KlangAI Pianissimo-da | 600 M | da | 11,8 % (medio, 3 conjuntos); 6,5 % en FLEURS | CC BY 4.0 | NeMo, ONNX, GGUF, MLX, CoreML |
| NVIDIA Parakeet TDT 0.6B v3 (modelo base) | 600 M | multilingue (no se detalla) | no disponible | no disponible en la informacion | NeMo |
| KlangAI Pianissimo-sv | no disponible | sv | no disponible | CC BY 4.0 (segun enlace) | NeMo, ONNX, MLX |

No se dispone en la información proporcionada de resultados de WER de Parakeet TDT 0.6B v3 ni de Pianissimo-sv sobre los conjuntos daneses, por lo que la comparación cuantitativa directa no es posible. El autor afirma que Pianissimo-da obtuvo el mejor resultado entre los modelos abiertos y cerrados probados, pero no detalla qué modelos componen esa comparación.

## Limitaciones y advertencias

- El modelo solo soporta danés; no se debe esperar un rendimiento adecuado en otros idiomas, incluidos el sueco (para el que existe un modelo separado) ni el inglés.
- Riesgo de alucinación y errores en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario muy especializado; el WER medio del 11,8 % implica que aproximadamente una de cada ocho palabras puede ser incorrecta en condiciones de evaluación reales.
- El phrase boosting distingue mayúsculas y minúsculas, lo que puede provocar fallos silenciosos si el vocabulario personalizado no coincide exactamente.
- La licencia CC BY 4.0 permite uso comercial pero exige atribución a KlangAI; es necesario revisar los términos completos antes de su integración en productos.
- No se documentan sesgos específicos ni la composición del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en determinados dialectos o registros.
- No se especifica la longitud máxima de audio procesable ni el comportamiento con audios muy largos; se recomienda segmentar en produccion.
- Las cifras de velocidad de las variantes ONNX y MLX se midieron con el modelo sueco de la misma arquitectura, no con el modelo danés, por lo que son una aproximación.
- No se dispone de información sobre el proceso de entrenamiento (tokens, composición del dataset, técnicas de alineación), lo que limita la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KlangAI/pianissimo-da
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Demo: https://klang.ai/pianissimo-da/#try-pianissimo
- Paper de entrenamiento: https://research.klang.ai/papers/klang-pianissimo-da
- Version sueca: https://huggingface.co/KlangAI/pianissimo-sv
- Version ONNX: https://huggingface.co/KlangAI/pianissimo-da-onnx
- Version MLX 8-bit: https://huggingface.co/KlangAI/pianissimo-da-mlx-8bit
- Version MLX 4-bit: https://huggingface.co/KlangAI/pianissimo-da-mlx-4bit
- Version MLX bf16: https://huggingface.co/KlangAI/pianissimo-da-mlx
- Version MLX fp32: https://huggingface.co/KlangAI/pianissimo-da-mlx-fp32
- Version GGUF: https://huggingface.co/KlangAI/pianissimo-da-gguf
- Version CoreML: https://huggingface.co/KlangAI/pianissimo-da-coreml
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
