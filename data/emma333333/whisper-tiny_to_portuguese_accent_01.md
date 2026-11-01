# emma333333/whisper-tiny_to_portuguese_accent_01

## Resumen

Whisper tiny Portuguese es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny de OpenAI, publicado por el usuario emma333333 en HuggingFace. El modelo resultante es un sistema de reconocimiento automatico del habla (ASR) entrenado sobre el dataset `portuguese_english`, con el objetivo declarado de adaptar el modelo base al acento portugues en transcripciones de audio en ingles. El nombre del repositorio sugiere esa intencion, aunque la model card no documenta explicitamente la naturaleza del dataset ni el procedimiento de adaptacion.

Se trata de un modelo de muy pequeno tamano: 37.760.640 parametros (aproximadamente 37,8 millones), lo que lo situa en la gama mas ligera de la familia Whisper. La arquitectura es la de Whisper tiny, un transformer encoder-decoder con atencion estandar, disenado para transcripcion de audio a texto. El contexto de audio esta limitado a las ventanas de 30 segundos tipicas de Whisper, y el vocabulario y el tokenizador son los del modelo base.

Su relevancia es limitada: se publica como un experimento de ajuste fino con licencia Apache 2.0, sin descargas ni validacion externa, y con una model card generada automaticamente que deja multiples secciones sin completar. Resulta util como referencia para quien quiera reproducir un ajuste fino de Whisper tiny sobre un dataset bilingue portugues-ingles, pero no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (segun metadatos); el dataset de entrenamiento es portugues-ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un transformer encoder-decoder con atencion multi-cabeza estandar, sin mecanismos de atencion lineal ni decodificacion especulativa. El encoder procesa espectrogramas mel de 80 canales en ventanas de 30 segundos y el decoder genera tokens de texto de forma autorregresiva. El ajuste fino conserva la arquitectura y el tokenizador del modelo base; solo se actualizan los pesos.

El entrenamiento se realizo con el `Trainer` de HuggingFace sobre el dataset `portuguese_english` (split de test para evaluacion), con los siguientes hiperparametros declarados: learning rate 1e-05, batch de entrenamiento 2, batch de evaluacion 1, semilla 42, optimizador AdamW fused (betas 0.9 y 0.999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. Se registran dos puntos de control: en el paso 1000 (epoch 0,9217) con perdida de validacion 0,2724 y WER 12,6375, y en el paso 2000 (epoch 1,8433) con perdida de validacion 0,2546 y WER 11,8360. No se documenta el volumen de datos, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (en ASR no son habituales).

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles, con adaptacion declarada al acento portugues.
- Transcripcion de audio en ventanas de hasta 30 segundos, con la posibilidad de concatenar segmentos para audios mas largos mediante pipelines de transformers.
- Generacion de transcripciones con puntuacion y mayusculas basicas, heredadas del modelo base Whisper tiny.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas; los metadatos solo declaran ingles, aunque el entrenamiento uso un dataset portugues-ingles.
- Capacidades especiales (modo thinking, vision, audio de entrada adicional): no disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles con hablantes de acento portugues: el ajuste fino busca reducir el WER en ese perfil concreto, y el tamano reducido permite ejecucion en CPU o GPU de gama baja para procesamiento por lotes.
- Prototipado rapido de pipelines ASR: al ser un modelo de 37,8 M de parametros con pesos safetensors, se puede cargar con `transformers` en pocos segundos y sirve para validar arquitecturas de preprocesado de audio antes de pasar a modelos mayores.
- Subtitulado automatico de contenido audiovisual de baja latencia: la ventana de 30 segundos y el bajo coste computacional permiten generar subtitulos en tiempo casi real en entornos con recursos limitados.
- Investigacion sobre adaptacion de acentos en ASR: el modelo sirve como punto de partida reproducible (hiperparametros y semilla documentados) para estudiar tecnicas de fine-tuning sobre datasets bilingues.
- Educacion y demos interactivas: se puede desplegar en un portatil o en una instancia pequena para demostrar transcripcion en vivo sin infraestructura dedicada.
- Preprocesado de datos para otros sistemas: transcripcion masiva de audios en ingles con acento portugues para generar corpus de texto que alimenten buscadores, sistemas de resumen o analisis de sentimiento.
- Evaluacion comparativa de modelos ASR ligeros: su WER declarado (11,8360 sobre el split de test de `portuguese_english`) permite situarlo frente a otras variantes de Whisper tiny en experimentos academicos.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | Portuguese English (split test) | WER | 11,8360 |
| Automatic Speech Recognition | Portuguese English (split test) | Loss | 0,2546 |

Evolucion durante el entrenamiento:

| Paso | Epoch | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9217 | 0,2476 | 0,2724 | 12,6375 |
| 2000 | 1,8433 | 0,1168 | 0,2546 | 11,8360 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,8 M de parametros ocupan aproximadamente 150 MB en fp32 y unos 75 MB en fp16), mas el overhead de activaciones y del procesador de audio.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3050, RTX 4090 o incluso en CPU. En entornos de servidor, una T4 o A100 estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 2 GB de VRAM, y tambien en CPU para inferencia por lotes.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), `optimum` para exportacion a ONNX, y servidores compatibles con la API de transformers. No se documenta soporte explicito de vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de texto generativo y no a ASR.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia de decenas de milisegundos por ventana de 30 segundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emma333333/whisper-tiny_to_portuguese_accent_01 | 37,8 M | 30 s | 11,8360 (Portuguese English, test) | apache-2.0 | HuggingFace, 0 descargas |
| openai/whisper-tiny | 39 M | 30 s | no disponible en esta ficha (referencia base) | apache-2.0 | HuggingFace, ampliamente usado |
| openai/whisper-base | 74 M | 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |

La comparacion directa de WER con los modelos base no es posible con los datos disponibles, ya que no se han proporcionado sus resultados sobre el mismo dataset. El modelo aqui descrito solo declara resultados sobre `portuguese_english`, un dataset no estandar, por lo que las cifras no son directamente comparables con las del leaderboard abierto de ASR.

## Limitaciones y advertencias

- Model card generada automaticamente e incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento no estan redactadas por el autor.
- El dataset `portuguese_english` no esta documentado en la informacion disponible: se desconoce su tamano, composicion, calidad de las transcripciones y metodo de grabacion, lo que impide evaluar la representatividad del WER declarado.
- El WER de 11,8360 no esta verificado (`verified: false`) y corresponde a un unico split de test; no hay validacion cruzada ni evaluacion en otros conjuntos.
- Los metadatos declaran unicamente ingles como idioma soportado, aunque el nombre del modelo y el dataset sugieren un enfoque bilingue portugues-ingles; esta ambiguedad puede provocar un comportamiento inconsistente en audio en portugues puro.
- Riesgo de alucinacion en ASR: como todos los modelos Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible, especialmente en la variante tiny.
- El modelo tiny de Whisper tiene una capacidad limitada de reconocimiento en comparacion con variantes mayores; el ajuste fino sobre un dataset pequeno puede provocar sobreajuste (la perdida de entrenamiento baja de 0,2476 a 0,1168 mientras la de validacion apenas mejora).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la procedencia del dataset de entrenamiento antes de un despliegue en produccion.
- Sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.
- No apto para tareas de generacion de texto, razonamiento, codigo o agentes; su unico proposito es la transcripcion de audio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emma333333/whisper-tiny_to_portuguese_accent_01
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Leaderboard abierto de ASR de HuggingFace: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
