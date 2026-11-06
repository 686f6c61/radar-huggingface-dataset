# jtap123/whisper-tiny_russian_english

## Resumen

Whisper tiny russian_english es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla openai/whisper-tiny, publicado por el usuario jtap123 (Johannes Tappert) en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante más pequeña, con 37.760.640 parámetros totales, y se ha entrenado sobre el dataset russian_english_english con el objetivo declarado de transcribir audio en inglés en un contexto bilingüe ruso-inglés.

El problema que aborda es acotado: adaptar un modelo ASR genérico de muy bajo coste computacional a un dominio concreto de audio. Con solo 37,8 millones de parámetros y un repositorio de 0,3 GB, el modelo está pensado para entornos con recursos limitados, inferencia en CPU o despliegues embebidos donde un Whisper large no sería viable.

La relevancia es limitada y muy específica: se trata de un experimento de ajuste fino con 2.000 pasos de entrenamiento, 35 descargas y sin likes en el momento de la consulta. No es un modelo de propósito general ni compite con los Whisper oficiales en robustez; su interés reside en el WER declarado de 9,56 sobre el conjunto de test del dataset propio y en su huella mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; admite cuantizacion a FP16, INT8 e INT4 mediante herramientas externas) |
| Idiomas soportados | en (ingles); el nombre del modelo sugiere entrenamiento sobre material ruso-ingles, pero la model card solo declara en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atención multi-cabeza estándar, entrenado originalmente por OpenAI para ASR multilingüe y traducción de voz. El ajuste fino conserva la totalidad de los pesos del modelo base y solo modifica los parámetros mediante entrenamiento supervisado sobre pares audio-transcripción del dataset russian_english_english.

Los hiperparámetros documentados son: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluación de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2.000 pasos totales de entrenamiento. No se documenta el número de tokens de audio ni la composición exacta del dataset. No hay evidencia de RLHF, DPO ni de innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El entrenamiento se realizó con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés sobre audio de hasta 30 segundos por ventana, según la arquitectura Whisper tiny.
- Transcripción de audio potencialmente bilingüe ruso-inglés, dado el nombre del modelo y el dataset de entrenamiento, aunque la model card solo declara soporte para inglés.
- Generación de transcripciones con puntuación y mayúsculas aprendidas del corpus de ajuste.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio de salida.
- Capacidades multilingües limitadas al inglés declarado; el ruso no está confirmado como idioma de salida en la model card.

## Casos de uso

- Transcripción de notas de voz en inglés en aplicaciones móviles: con 37,8 millones de parámetros y 0,3 GB de pesos, el modelo cabe en dispositivos con poca memoria y puede ejecutarse en CPU con latencia aceptable para audios cortos.
- Subtitulado automático de reuniones o entrevistas en inglés: el modelo procesa ventanas de 30 segundos, adecuadas para segmentos de conversación, y genera transcripciones con puntuación.
- Preprocesado de audio en pipelines de datos: útil para etiquetar grandes volúmenes de audio en inglés a bajo coste antes de un filtrado o análisis posterior.
- Prototipado rápido de ASR en entornos con GPU consumer: el tamaño reducido permite iterar con fine-tuning adicional sobre dominios específicos sin grandes requisitos de VRAM.
- Investigación sobre adaptación bilingüe ruso-inglés: sirve como punto de partida para estudiar el comportamiento de Whisper tiny en contextos con mezcla de idiomas.
- Despliegue en entornos embebidos o edge: la huella de 0,3 GB y la licencia Apache 2.0 facilitan la integración en productos comerciales con recursos restringidos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | russian_english English | test | 9,5601 |

Resultados del proceso de entrenamiento según la model card:

| Training loss | Epoch | Step | Validation loss | WER |
|---|---|---|---|---|
| 0,1581 | 1,0707 | 1000 | 0,2221 | 10,5263 |
| 0,0721 | 2,1413 | 2000 | 0,2086 | 9,5601 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 150 MB para los pesos (37,8 M de parámetros × 4 bytes), más overhead de activaciones y del framework.
- VRAM estimada en FP16: aproximadamente 75 MB para los pesos.
- VRAM estimada en INT8: aproximadamente 38 MB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU consumer de gama baja e incluso en CPU; también es viable en dispositivos edge.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica de forma estándar a ASR, llama.cpp no soporta Whisper de forma nativa, Ollama no es la vía habitual; alternativas habituales son faster-whisper y whisper.cpp para convertir los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jtap123/whisper-tiny_russian_english | 37,8 M | ventanas de 30 s | 9,56 (dataset propio) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,8 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| jtap123/whisper-tiny_korean_english | 37,8 M | ventanas de 30 s | no disponible en esta ficha | no disponible | Hugging Face |

La comparación directa con Whisper tiny original no es posible sin datos de WER sobre el mismo dataset; el modelo ajustado reporta 9,56 sobre russian_english English, pero no se dispone del resultado del base en ese mismo conjunto.

## Limitaciones y advertencias

- Modelo experimental con muy baja adopción (35 descargas, 0 likes) y sin validación independiente de los resultados.
- El WER de 9,56 está marcado como no verificado en la model-index y se calcula sobre un dataset propio, no sobre benchmarks estándar como LibriSpeech o Common Voice.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"), incluida la descripción de usos previstos y limitaciones.
- Solo se declara soporte para inglés; el comportamiento en ruso no está confirmado pese al nombre del modelo.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada.
- Entrenado con solo 2.000 pasos y batch size 2, lo que limita la robustez frente a dominios no representados en el dataset.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen y consentimiento de los datos de entrenamiento.
- No apto como sustituto de un Whisper de mayor tamaño en producción con requisitos de precisión altos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jtap123/whisper-tiny_russian_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Perfil del autor: https://huggingface.co/jtap123
- Modelos del autor: https://huggingface.co/jtap123/models
