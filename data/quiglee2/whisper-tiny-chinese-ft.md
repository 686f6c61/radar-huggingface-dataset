# Quiglee2/whisper-tiny-chinese-ft

## Resumen

Whisper tiny Chinese accent es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Quiglee2 en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) derivado de la arquitectura Whisper de OpenAI, orientado especificamente a transcribir audio en ingles con acento chino, segun se deduce del nombre del modelo y del dataset de entrenamiento empleado (naharte/chinese_english).

El modelo conserva la arquitectura encoder-decoder transformer propia de Whisper en su variante "tiny", con 37,76 millones de parametros totales y un peso en disco de aproximadamente 0,3 GB. Al estar basado en whisper-tiny, hereda las caracteristicas del original: procesamiento de audio a 16 kHz, tokenizador multilingue y capacidad de transcripcion y traduccion, aunque la model card solo declara soporte para ingles.

Su relevancia es limitada pero concreta: ofrece un punto de partida ligero y economico para tareas de ASR en entornos con recursos restringidos donde el acento chino del hablante en ingles supone un reto para los modelos genericos. La licencia Apache 2.0 facilita su uso comercial, aunque la ausencia de documentacion detallada y de validacion independiente de sus metricas exige cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un transformer encoder-decoder con atencion completa disenado para ASR. El encoder procesa espectrogramas mel de audio de 16 kHz en ventanas de 30 segundos y el decoder genera la transcripcion de forma autorregresiva. No se documentan innovaciones arquitectonicas adicionales respecto al modelo base.

El ajuste fino se realizo sobre el dataset naharte/chinese_english con los siguientes hiperparametros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0,9, 0,999), scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. La evolucion reportada muestra una perdida de validacion de 0,3158 y un WER de 14,2971 en el paso 1000, mejorando a una perdida de 0,3072 y un WER de 13,3439 en el paso 2000. No se especifica el volumen de datos, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla en ingles, con enfasis en hablantes con acento chino.
- Transcripcion de audio de hasta 30 segundos por ventana, segun la arquitectura base Whisper.
- Generacion de texto a partir de audio (pipeline automatic-speech-recognition).
- Compatible con la API de transformers y con endpoints de Hugging Face (tag endpoints_compatible).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Capacidad multilingue no confirmada: la model card solo declara ingles, aunque el modelo base es multilingue.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones y llamadas con participantes de habla inglesa y acento chino: el ajuste fino sobre el dataset chinese_english busca reducir el WER en este perfil de hablante frente al whisper-tiny original.
- Subtitulado automatico de contenido audiovisual en ingles: el modelo puede generar subtitulos en tiempo casi real gracias a su tamano reducido (37,8 M de parametros).
- Prototipado rapido de pipelines ASR: su ligereza y licencia Apache 2.0 permiten integrarlo en entornos de desarrollo con GPU modestas o incluso CPU.
- Preprocesamiento de audio en sistemas de analitica: transcripcion de grabaciones para su posterior indexacion o busqueda semantica.
- Despliegue en dispositivos con recursos limitados: el peso de 0,3 GB y el bajo numero de parametros facilitan la inferencia en edge o en contenedores pequenos.
- Evaluacion comparativa de tecnicas de fine-tuning: sirve como referencia para experimentos de adaptacion de dominio en ASR con presupuesto computacional bajo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Chinese accent | naharte/chinese_english (split test) | WER | 13,3439 |
| Whisper tiny Chinese accent (paso 1000) | naharte/chinese_english (validacion) | WER | 14,2971 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. No se proporcionan comparaciones con el modelo base whisper-tiny ni con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,8 M de parametros); aproximadamente 0,15 GB en fp16 y menos de 0,1 GB en int8.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1660, RTX 3060, RTX 4090) es sobredimensionada para este modelo; tambien funciona en CPU.
- Cabe en cualquier GPU consumer e incluso en dispositivos embebidos con suficiente memoria.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica de forma nativa a ASR, llama.cpp no soporta Whisper, Ollama no soporta Whisper de forma estandar; alternativas como faster-whisper o whisper.cpp requieren conversion de pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| Whisper tiny Chinese accent (este modelo) | 37,8 M | 30 s por ventana | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s por ventana | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s por ventana | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s por ventana | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre este ajuste fino y las alternativas en la informacion proporcionada. La comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed") en descripcion, usos previstos, limitaciones y datos de entrenamiento.
- El WER de 13,3439 no esta verificado de forma independiente (verified: false en el model-index).
- El modelo solo declara soporte para ingles; el comportamiento con otros idiomas, incluido el chino, no esta documentado.
- Al derivar de whisper-tiny, hereda sus limitaciones: baja precision en audio ruidoso, ventanas de 30 segundos y menor calidad que variantes mayores.
- Riesgo de alucinacion en transcripciones, especialmente en segmentos con silencio o ruido, comun en modelos Whisper.
- No se documentan sesgos especificos, pero el ajuste sobre un dataset concreto puede introducir sesgos hacia ese dominio y perfil de hablante.
- La licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre el dataset de entrenamiento impide evaluar posibles restricciones derivadas de los datos.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quiglee2/whisper-tiny-chinese-ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/chinese_english
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
