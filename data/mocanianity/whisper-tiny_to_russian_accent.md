# Mocanianity/whisper-tiny_to_russian_accent

## Resumen

Whisper tiny Russian es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario Mocanianity en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37.760.640 parametros totales, y ha sido reentrenado sobre un dataset denominado "Russian_english" con el objetivo declarado de adaptar el reconocimiento a acentos rusos al hablar en ingles. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors.

El modelo se presenta como una variante ligera de ASR (automatic speech recognition) orientada a entornos con recursos limitados, dado el reducido tamano de la base whisper-tiny. Segun la model card, alcanza un WER de 9,9924 sobre el split de test del dataset de evaluacion, con una perdida de validacion de 0,2264. Estos resultados proceden del model-index declarado por el autor y no estan verificados de forma independiente.

La relevancia de este modelo es limitada pero concreta: sirve como ejemplo de adaptacion de dominio sobre un modelo tiny de Whisper y como punto de partida para experimentos de ASR con acento no nativo. No obstante, la informacion publicada es escasa (la propia model card indica "More information needed" en varias secciones) y el modelo no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos); ajustado para acento ruso en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con mecanismo de atencion estandar, disenado para transcripcion de audio en ventanas de hasta 30 segundos. No se trata de una arquitectura MoE ni hibrida; es un transformer denso de aproximadamente 37,8 millones de parametros, lo que lo situa en la gama mas ligera de la familia Whisper.

El entrenamiento se realizo mediante fine-tuning supervisado sobre el dataset "Russian_english", con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. Las versiones de framework declaradas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica el numero de tokens de audio ni la composicion detallada del dataset.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles, con adaptacion declarada a acentos rusos.
- Generacion de transcripciones sobre ventanas de audio de hasta 30 segundos, segun la arquitectura base de Whisper tiny.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declara soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): unicamente audio de entrada; sin vision ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles con hablantes de acento ruso: el ajuste fino sobre el dataset Russian_english busca mejorar la precision en este perfil concreto de habla, aunque el WER declarado (~10) limita su uso a transcripciones de baja exigencia.
- Prototipado rapido de pipelines ASR en local: al tratarse de un modelo de 37,8 millones de parametros y 0,3 GB, puede cargarse en CPU o GPU modesta para pruebas de integracion antes de pasar a modelos mayores.
- Subtitulado automatico de contenido audiovisual en ingles: adecuado para material donde el acento no nativo sea predominante y se tolere un margen de error cercano al 10 % de palabras.
- Investigacion sobre adaptacion de dominio en ASR: sirve como caso de estudio de fine-tuning de whisper-tiny con hiperparametros documentados (lr 1e-05, 2000 pasos, batch 2).
- Educacion y practica de idiomas: transcripcion de grabaciones de estudiantes rusoparlantes de ingles para analisis de pronunciacion y errores, siempre con revision humana.
- Generacion de datasets etiquetados de bajo coste: uso del modelo como etiquetador debil en procesos de pseudo-etiquetado de audio en ingles con acento ruso, sujeto a validacion posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Russian | Russian English (split test) | WER | 9,9924 |
| Whisper tiny Russian | Russian English (validacion, paso 2000) | Loss | 0,2264 |
| Whisper tiny Russian | Russian English (validacion, paso 1000) | WER | 10,6280 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,8 M de parametros); aproximadamente 0,1-0,2 GB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, e incluso en Raspberry Pi y dispositivos embebidos.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica para ASR, llama.cpp no soporta Whisper de forma nativa, Ollama no soporta ASR; alternativas: faster-whisper, whisper.cpp, Hugging Face Inference Endpoints (el tag endpoints_compatible esta presente).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja en GPU y moderada en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Russian (este modelo) | 37,8 M | 30 s | 9,9924 (Russian English) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,8 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables de los modelos alternativos en la informacion proporcionada; la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- La model card original indica explicitamente "More information needed" en las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento, por lo que la documentacion es incompleta.
- El WER declarado de 9,9924 no esta verificado de forma independiente y corresponde a un unico dataset (Russian_english) cuyo split y composicion no se detallan.
- El modelo solo declara soporte de ingles; no debe asumirse capacidad multilingue ni transcripcion de ruso, a pesar del nombre del repositorio.
- Riesgo de alucinacion en pasajes de audio con ruido o silencios, comportamiento comun en modelos Whisper de tamano tiny.
- Sesgos conocidos: no documentados por el autor; los modelos Whisper pueden presentar sesgos hacia determinados acentos, generos y variedades dialectales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El modelo tiene 0 descargas y 0 likes, sin validacion de la comunidad; no se recomienda para produccion sin una evaluacion propia sobre datos representativos.
- La fecha de creacion del repositorio (2026-11-03) y las versiones de framework declaradas (Transformers 5.23.0.dev0, PyTorch 2.11.0) deben tratarse con cautela por posible falta de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mocanianity/whisper-tiny_to_russian_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
