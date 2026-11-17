# FastFlowLM/Confucius4-R2T2-NPU2

## Resumen

Confucius4-R2T2-NPU2 es una conversión del modelo de reconocimiento automático del habla Confucius4-R2T2 de NetEase Youdao, adaptada por FastFlowLM para ejecutarse sobre las NPU XDNA 2 de los procesadores AMD Ryzen AI. El modelo original es un fine-tune de Qwen3-ASR-1.7B orientado a transcripción en tiempo real ("Real Real-Time Transcription"), con aproximadamente 2.000 millones de parámetros y soporte para 30 idiomas, aunque está optimizado para chino e inglés.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos con cuantización mixta diseñada específicamente para acelerar la inferencia en hardware de consumo AMD. FastFlowLM redistribuye los pesos en su formato propietario `q4nx`, separando el decodificador de texto, las copias cuantizadas para NPU y el codificador de audio, con el objetivo de mantener la calidad de transcripción del modelo BF16 original reduciendo el coste computacional.

El paquete ocupa 3,9 GB e incluye la licencia de uso del modelo original, que impone restricciones comerciales relevantes. Es un artefacto de despliegue, no un checkpoint entrenable en el sentido habitual: su valor está en permitir ASR de baja latencia en portátiles y mini-PC con Ryzen AI sin depender de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (basado en Qwen3-ASR-1.7B); decodificador de texto con forma Qwen3-1.7B y codificador de audio de 24 capas |
| Parametros totales | ~2B (aproximadamente 2.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (proyecciones y cabeza de salida en `model.q4nx`), Q4_1 (q/k/o/gate/up y cabeza de salida en `npu_q41.q4nx`), BF16 (embeddings y codificador de audio) |
| Idiomas soportados | 30 idiomas según la model card; mejor rendimiento en chino (zh) e inglés (en) |
| Licencia | NetEase Youdao Model Use License Agreement (license: other) |
| Formato de pesos | `q4nx` (formato propio de FastFlowLM), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es un sistema ASR derivado de Qwen3-ASR-1.7B, con un codificador de audio de 24 capas y un decodificador de texto con la forma de Qwen3-1.7B. NetEase Youdao realizó un fine-tune sobre esa base para producir Confucius4-R2T2, orientado a transcripción en tiempo real. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica de esta conversión concreta reside en la estrategia de cuantización mixta para la NPU. Según la model card, una cuantización uniforme de 4 bits (Q4_0, Q4_1 o Q4_K round-to-nearest) degrada el fine-tune hasta producir transcripciones vacías o responder en inglés a audio en mandarín. La configuración que preserva la calidad mantiene Q4_1 en q/k/o/gate/up y en la cabeza de salida, mientras que `v_proj` y `down_proj` permanecen en Q8_0. Esta combinación decodifica aproximadamente un 24 % más rápido que Q8_0 en todo el pipeline. El codificador de audio se mantiene en BF16 y se organiza en el layout de tiles de matmul de la NPU.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre archivos completos en formatos wav, flac, mp3 y ogg.
- Transcripción en streaming con texto de solo adición mientras se procesa el audio, con `chunk_size_ms` configurable entre 80 y 2000.
- Soporte de contexto adicional por prompt: tras el nombre del archivo se pueden pasar hot words, nombres propios o temática para sesgar la transcripción.
- Multilingüe con 30 idiomas declarados, con calidad destacada en chino e inglés.
- Servicio HTTP compatible con el endpoint `/v1/audio/transcriptions` de la API de OpenAI mediante `flm serve`.
- Ejecución sobre NPU XDNA 2 de AMD Ryzen AI, sin requerir GPU dedicada.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones en portátiles Ryzen AI: el modelo se ejecuta sobre la NPU integrada, liberando la CPU y la GPU para el resto de la carga de trabajo ofimática, con streaming de texto incremental durante la llamada.
- Subtitulado casi en tiempo real de contenido en chino e inglés: el modo streaming con `chunk_size_ms` bajo permite generar subtítulos conforme avanza el audio, adecuado para vídeo corporativo o formación interna.
- Dictado por voz en herramientas de productividad: la integración vía `flm serve` y el endpoint compatible con OpenAI permite conectar el modelo a editores o asistentes existentes sin adaptar el cliente.
- Post-producción de audio y podcasts: la transcripción por archivo completo con prompt de contexto (nombres de invitados, terminología del sector) mejora la precisión en nombres propios y jerga.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente en hardware AMD Ryzen AI, el audio no sale del dispositivo, lo que encaja en sectores con datos sensibles como salud o legal.
- Transcripción de atención al cliente: procesamiento por lotes de grabaciones de llamadas en chino e inglés para análisis de calidad, con la ventaja de no depender de servicios en la nube.
- Investigación en ASR sobre hardware de borde: la disponibilidad de pesos en formato `q4nx` y de benchmarks publicados por FastFlowLM permite reproducir experimentos de cuantización mixta en NPU.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando la conversión FastFlowLM frente al modelo BF16 original sobre 120 enunciados en inglés (LibriSpeech test-clean) y 60 en mandarín (FLEURS):

| Metrica | FastFlowLM (q4nx mixto) | Original BF16 | Diferencia |
|---|---|---|---|
| WER inglés (LibriSpeech test-clean) | 2,81 % | 2,89 % | -0,08 pp |
| CER mandarín (FLEURS) | 6,37 % | 8,96 % | -2,59 pp |

La propia model card advierte que la diferencia en mandarín se explica en gran medida por el formato de escritura de los números (dígitos frente a numerales chinos), que la métrica de evaluación no normaliza. No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K, que además no aplican a un modelo ASR.

## Requisitos de hardware

- NPU XDNA 2 integrada en procesadores AMD Ryzen AI; es el requisito de hardware central y no se sustituye por GPU.
- FastFlowLM 1.0.14 o superior como runtime obligatorio.
- Tamaño del paquete de pesos: 3,9 GB en disco, repartidos entre `model.q4nx`, `npu_q41.q4nx` y `audio_weight.q4nx`.
- VRAM estimada: no disponible; el modelo está diseñado para memoria unificada de la NPU y del sistema, no para VRAM de GPU dedicada.
- GPU recomendadas: no aplica; no se documenta ejecución en A100, H100 ni RTX 4090.
- Despliegue mediante `flm run r2t2:1.7b` (interactivo) o `flm serve r2t2:1.7b` (servicio HTTP en el puerto 52625).
- Latencia y throughput: la model card indica una decodificación aproximadamente un 24 % más rápida con la mezcla Q4_1/Q8_0 frente a Q8_0 uniforme; no se publican cifras absolutas de latencia ni de RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Hardware objetivo | Formato |
|---|---|---|---|---|---|
| Confucius4-R2T2-NPU2 (FastFlowLM) | ~2B | 30 (mejor zh/en) | NetEase Youdao Model Use License | NPU AMD XDNA 2 | q4nx |
| netease-youdao/Confucius4-R2T2 | ~2B | 30 (mejor zh/en) | NetEase Youdao Model Use License | GPU/CPU genérico | BF16 |
| Qwen/Qwen3-ASR-1.7B | 1,7B | no disponible en la información | no disponible en la información | GPU/CPU genérico | no disponible en la información |

La comparación relevante es contra el checkpoint original del que deriva: misma arquitectura y licencia, pero distinto empaquetado y cuantización. Frente a Qwen3-ASR-1.7B, la información disponible solo confirma que es el modelo base del fine-tune, sin datos de rendimiento comparativo.

## Limitaciones y advertencias

- La licencia NetEase Youdao Model Use License Agreement exige una licencia separada para organizaciones con más de 100 millones de usuarios activos mensuales o más de 1.000 millones de RMB de facturación anual, incluidas sus filiales.
- La licencia prohíbe usar el modelo o sus salidas para mejorar otros modelos de IA, salvo que sean no comerciales.
- Cualquier modificación introducida en esta obra derivada no está respaldada ni garantizada por el titular original de los derechos, que declina toda responsabilidad sobre ella.
- La cuantización a 4 bits uniforme rompe el modelo: produce transcripciones vacías o responde en inglés a audio en mandarín; solo la mezcla Q4_1/Q8_0 documentada preserva la calidad.
- El rendimiento en idiomas distintos del chino y el inglés no está cuantificado en la información disponible pese a declararse 30 idiomas.
- La evaluación en mandarín puede estar penalizada artificialmente por el formato de los números en la métrica CER, tal como reconoce la model card.
- Dependencia de un runtime y un formato propietarios (`q4nx` y FastFlowLM), lo que limita la portabilidad a otros stacks de inferencia.
- Riesgo de alucinación y de errores en nombres propios y terminología específica; se mitiga parcialmente con el prompt de contexto y las hot words.
- No se documentan sesgos específicos ni comportamientos diferenciales por acento o dialecto en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FastFlowLM/Confucius4-R2T2-NPU2
- Modelo base: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Repositorio FastFlowLM: https://github.com/FastFlowLM/FastFlowLM
- Página del modelo en FastFlowLM: https://fastflowlm.com/docs/models/r2t2/
- Benchmarks en FastFlowLM: https://fastflowlm.com/docs/benchmarks/r2t2_results/
- Licencia del modelo: https://raw.githubusercontent.com/netease-youdao/Confucius4-R2T2/refs/heads/master/MODEL_LICENSE
