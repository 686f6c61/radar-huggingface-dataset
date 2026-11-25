# HosseinSch/whisper-tiny-en

## Resumen

whisper-tiny-en es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla openai/whisper-tiny, publicado por el usuario HosseinSch en Hugging Face. Se trata de un modelo transformer encoder-decoder de 37,7 millones de parámetros, especializado en transcripción de audio en inglés, entrenado sobre el subconjunto en inglés del dataset PolyAI/minds14, que contiene grabaciones de consultas telefónicas de un asistente bancario.

El modelo parte de la arquitectura Whisper original de OpenAI, que combina un encoder convolucional más transformer con un decoder autorregresivo, y ha sido reentrenado durante 5 épocas con un learning rate muy bajo (1e-5) para adaptar el modelo base al dominio específico del dataset minds14. El resultado declarado es un WER de 0,3256 sobre el conjunto de evaluación, con una pérdida de validación de 0,5838.

Su relevancia práctica es acotada: se trata de un experimento de ajuste fino de dominio muy específico (dominio bancario telefónico en inglés), con cero descargas y sin documentación adicional más allá de la generada automáticamente por el Trainer de Hugging Face. Resulta útil como referencia de cómo adaptar Whisper a dominios concretos con pocos recursos, pero no está pensado para uso general en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 37.760.640 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible (pesos en safetensors; se puede cuantizar con herramientas estándar) |
| Idiomas soportados | no disponible (el nombre sugiere inglés, pero no se documenta explícitamente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante tiny: un encoder que procesa espectrogramas Mel de audio y un decoder autorregresivo que genera tokens de texto. Con 37,7 millones de parámetros, es la variante más pequeña de la familia Whisper, lo que implica un coste computacional bajo pero también una capacidad limitada para transcripciones complejas.

El entrenamiento se realizó sobre el dataset PolyAI/minds14 (grabaciones de consultas telefónicas bancarias en inglés) durante 5 épocas, con batch size de 16, learning rate constante de 1e-5 con 10 pasos de warmup, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, precisión mixta AMP nativa y semilla 42. No se documenta el número exacto de tokens de entrenamiento ni si hubo etapas de RLHF o DPO. La pérdida de entrenamiento baja de 0,4157 a 0,0462 a lo largo de las 5 épocas, mientras que la pérdida de validación se mantiene estable alrededor de 0,51-0,58, lo que sugiere cierto sobreajuste al final del entrenamiento.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, orientado a audio telefónico de dominio bancario.
- Transcripción de audio a texto con salida de texto plano.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas (el nombre del modelo sugiere uso en inglés).
- No se documentan capacidades especiales como thinking mode, visión o audio más allá del ASR.

## Casos de uso

- Transcripción de llamadas de atención al cliente bancaria: el modelo se ha ajustado específicamente sobre minds14, un dataset de consultas telefónicas bancarias, por lo que puede transcribir grabaciones de este tipo de interacciones con un WER declarado del 32,56 %.
- Prototipado rápido de pipelines ASR: al tener solo 37,7 millones de parámetros y licencia Apache 2.0, es adecuado para experimentar con transcripción en entornos con recursos limitados antes de escalar a modelos mayores.
- Evaluación de técnicas de fine-tuning de dominio: sirve como referencia reproducible (semilla 42, hiperparámetros documentados) para estudiar cómo adaptar Whisper a un dominio concreto con pocas épocas.
- Transcripción de audio de baja latencia en dispositivos con poca VRAM: su tamaño reducido permite ejecución en CPU o GPU consumer básica.
- Generación de datasets de texto a partir de audio telefónico para análisis posterior (por ejemplo, clasificación de motivos de consulta), aceptando el nivel de error del WER declarado.
- Investigación académica sobre robustez de ASR en audio telefónico con ruido y acentos, usando minds14 como benchmark de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Métrica | Valor |
|---|---|---|
| PolyAI/minds14 | WER | 0,3256 (32,56 %) |
| PolyAI/minds14 | WER ortho | 34,1184 |
| PolyAI/minds14 | Loss (validación) | 0,5838 |

Evolución por época (según la model card):

| Época | Training loss | Validation loss | WER ortho | WER |
|---|---|---|---|---|
| 1 | 0,4157 | 0,5098 | 36,3392 | 0,3411 |
| 2 | 0,2954 | 0,5051 | 33,6474 | 0,3198 |
| 3 | 0,1864 | 0,5239 | 33,1090 | 0,3191 |
| 4 | 0,0935 | 0,5456 | 33,4455 | 0,3236 |
| 5 | 0,0462 | 0,5838 | 34,1184 | 0,3256 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (37,7 M de parámetros); en torno a 0,2-0,4 GB en FP16/BF16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso CPU es suficiente; también A100/H100 para despliegues por lotes a gran escala.
- Cabe en cualquier GPU consumer: sí, con margen amplio.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM (si soporta Whisper en la versión usada), llama.cpp no aplica directamente a Whisper, TGI según soporte de la versión, ONNX Runtime para exportación.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER minds14 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HosseinSch/whisper-tiny-en | 37,7 M | no disponible | 0,3256 (declarado) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | audio 30 s | no disponible en la información | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M | audio 30 s | no disponible en la información | apache-2.0 | Hugging Face |
| openai/whisper-small | 244 M | audio 30 s | no disponible en la información | apache-2.0 | Hugging Face |

No se dispone de resultados comparativos de WER sobre minds14 para los modelos base en la información proporcionada.

## Limitaciones y advertencias

- El WER declarado (32,56 %) es alto para uso en producción; implica que aproximadamente uno de cada tres caracteres o palabras se transcribe incorrectamente en el conjunto de evaluación.
- Riesgo de sobreajuste: la pérdida de validación aumenta a partir de la época 2 mientras la de entrenamiento sigue bajando.
- Dominio muy restringido: entrenado solo sobre minds14 (consultas bancarias telefónicas en inglés); el rendimiento fuera de ese dominio no está documentado.
- Idiomas soportados no documentados; el nombre sugiere inglés, pero no hay confirmación explícita.
- La model card indica "More information needed" en las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta restricciones adicionales ni procedencia exacta de los datos de entrenamiento más allá de minds14.
- Riesgo de alucinación en la transcripción: como todo modelo ASR generativo, puede producir texto plausible que no corresponde al audio, especialmente con ruido o acentos no vistos.
- Los benchmarks son declarados por el autor y no están verificados (verified: false).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HosseinSch/whisper-tiny-en
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/PolyAI/minds14
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
