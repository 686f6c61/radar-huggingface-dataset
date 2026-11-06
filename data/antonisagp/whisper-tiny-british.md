# AntonisAgp/whisper-tiny-british

## Resumen

Whisper Tiny British English es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) `openai/whisper-tiny` de OpenAI, publicado por el usuario AntonisAgp en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante "tiny" y se ha reentrenado sobre el dataset `naharte/british_english` para especializarse en transcripcion de ingles britanico.

El problema que aborda es la adaptacion de dominio y de acento: Whisper, pese a su robustez multilingue, presenta sesgos hacia determinadas variantes del ingles (especialmente la estadounidense) y puede degradar su WER en acentos regionales o en condiciones acusticas especificas del corpus de destino. Este ajuste busca mejorar la precision en esa variedad concreta mediante entrenamiento supervisado sobre pares audio-transcripcion etiquetados.

Con 37,76 millones de parametros, es un modelo extremadamente ligero (repo de 0,3 GB), lo que lo hace apto para inferencia en CPU, dispositivos de borde y entornos con recursos limitados. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. La relevancia actual radica en la demanda de soluciones ASR economicas y desplegables localmente, aunque su rendimiento (WER de 13,44 %) debe interpretarse con cautela al proceder de una unica evaluacion no verificada sobre un dataset especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, variante tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, compatibles con cuantizacion estandar via transformers/bitsandbytes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI: un transformer encoder-decoder con atencion estandar, disenado para mapear espectrogramas Mel de audio a secuencias de tokens de texto. La variante tiny es la mas pequena de la familia y utiliza un numero reducido de capas y dimensiones de embedding, lo que explica sus 37,76 millones de parametros. El modelo base `openai/whisper-tiny` fue entrenado originalmente con 680.000 horas de audio supervisado debilmente etiquetado y 6.000 horas de audio finamente etiquetado, segun la documentacion publica de OpenAI.

El ajuste fino se realizo sobre el dataset `naharte/british_english` con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch size de entrenamiento de 2, batch de evaluacion de 1, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2.000 pasos de entrenamiento. La semilla fue 42. Se registran dos puntos de evaluacion: en el paso 1000 (epoca 0,99) se obtuvo una loss de validacion de 0,3012 y un WER de 15,0463; en el paso 2000 (epoca 1,98) la loss bajo a 0,2951 y el WER a 13,4421. No se documentan tecnicas de RLHF, DPO ni innovaciones arquitectonicas adicionales; se trata de un ajuste supervisado convencional con `Trainer` de transformers (version 5.23.0.dev0) sobre PyTorch 2.11.0+cu130.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en la variedad britanica segun el dataset de entrenamiento.
- Transcripcion de audio a texto con soporte para ventanas de hasta 30 segundos por inferencia (caracteristica heredada de Whisper).
- Generacion de transcripciones con puntuacion y mayusculas basicas, segun el comportamiento del modelo base.
- Compatible con el pipeline `automatic-speech-recognition` de transformers.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles (el ajuste se realizo solo sobre datos en `en`; el modelo base soporta mas idiomas, pero este fine-tuning puede haber degradado el rendimiento en otros).
- No dispone de modo "thinking", vision ni audio generativo mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y entrevistas en ingles britanico: el modelo puede procesar audio dividido en segmentos de 30 segundos y generar transcripciones con un WER declarado del 13,44 % sobre el corpus de evaluacion, adecuado para actas internas donde no se requiere precision absoluta.
- Subtitulado automatico de contenido audiovisual: por su tamano reducido (37,76 M de parametros) puede ejecutarse en tiempo casi real en CPU, lo que permite generar subtitulos preliminares que luego se revisan manualmente.
- Asistentes de voz en dispositivos de borde: al ocupar 0,3 GB en safetensors y caber en memoria de dispositivos con pocos recursos, es viable integrarlo en raspberry pi, moviles o sistemas embebidos con aceleracion minima.
- Preprocesado de datos para pipelines de NLP: transcripcion masiva de grabaciones para alimentar sistemas de busqueda, analisis de sentimiento o resumen, donde el coste computacional por hora de audio es muy bajo comparado con modelos whisper-large.
- Prototipado rapido de aplicaciones ASR: sirve como baseline para validar ideas de producto antes de invertir en modelos mayores, gracias a su licencia Apache 2.0 y su facilidad de despliegue con transformers.
- Investigacion en adaptacion de dominio y acentos: util como punto de partida para estudiar tecnicas de fine-tuning sobre variedades dialectales del ingles con presupuestos computacionales minimos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model-index, no verificados de forma independiente:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | naharte/british_english (split test) | WER | 13,4421 |
| Automatic Speech Recognition | naharte/british_english (validacion, paso 1000) | WER | 15,0463 |
| Automatic Speech Recognition | naharte/british_english (validacion, paso 2000) | WER | 13,4421 |

No se han publicado resultados comparativos con otros modelos (por ejemplo, whisper-tiny original o whisper-base) en la informacion disponible. Tampoco se aportan metricas como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 150 MB para los pesos (37,76 M de parametros x 4 bytes), mas overhead de activaciones y buffers de audio; en la practica, menos de 1 GB en la mayoria de configuraciones.
- En FP16: aproximadamente 75 MB para los pesos; en cuantizacion de 8 bits, alrededor de 38 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funciona en GTX 1050, RTX 2060, RTX 4090, A100, H100 sin problemas. Tambien es viable en CPU.
- Cabe holgadamente en GPU consumer, incluidas las integradas y las de gama baja.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica de forma nativa a Whisper (aunque existen adaptaciones), llama.cpp no soporta Whisper directamente, Ollama no soporta Whisper de forma nativa, TGI no soporta Whisper de forma oficial. La via recomendada es transformers con PyTorch, o `whisper.cpp` si se convierte el modelo (no documentado en la informacion proporcionada).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera inferencia en decenas de milisegundos por ventana de 30 segundos en GPU moderna y en el orden de segundos en CPU, pero no hay datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AntonisAgp/whisper-tiny-british | 37,76 M | 30 s de audio | 13,44 % (naharte/british_english) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s de audio | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks comparativos directos entre este ajuste y los modelos base en la informacion proporcionada. La comparacion cuantitativa de WER con whisper-tiny original sobre el mismo dataset no esta publicada.

## Limitaciones y advertencias

- El WER de 13,44 % esta declarado por el autor y marcado como no verificado (`verified: false`); no debe tomarse como referencia absoluta sin replicacion independiente.
- El modelo solo se ha ajustado sobre ingles britanico; su rendimiento en otras variedades del ingles o en otros idiomas puede haberse degradado respecto al modelo base.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido, silencios largos o habla solapada.
- Sesgos conocidos: el dataset de ajuste puede introducir sesgos de dominio (vocabulario, tematica, condiciones de grabacion) que no estan documentados en la model card.
- La model card no documenta usos previstos, limitaciones ni composicion del dataset de entrenamiento mas alla del nombre; falta informacion sobre tamano, horas de audio y condiciones de grabacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se recomienda mantener la atribucion y revisar las condiciones del modelo base de OpenAI.
- Para produccion, se recomienda validar el WER en el dominio concreto de despliegue y considerar modelos mayores (whisper-small o whisper-medium) si la precision es critica.
- No hay informacion sobre el comportamiento del modelo en audio con acentos no britanicos, ruido de fondo intenso o multiples hablantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AntonisAgp/whisper-tiny-british
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/british_english
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
