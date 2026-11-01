# AVryon/whisper-tiny_to_japanese_accent_29oct

## Resumen

Whisper tiny Japanese es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla openai/whisper-tiny, publicado por el usuario AVryon en HuggingFace. El modelo parte de la arquitectura transformer encoder-decoder de Whisper en su variante más pequena y ha sido reentrenado sobre el dataset Japanese_english para adaptar la transcripción a un acento japones del ingles. El objetivo declarado es mejorar la transcripción de habla inglesa con acento japones, un escenario en el que los modelos ASR genericos suelen degradarse.

El modelo tiene 37.760.640 parametros y un tamano de repositorio de 0,3 GB, lo que lo situa en la categoria de modelos ultraligeros aptos para inferencia en CPU y en GPUs de consumo muy modestas. La model card es practicamente automatica y no documenta la composicion del dataset ni los detalles del preentrenamiento, por lo que buena parte de las especificaciones habituales no estan disponibles.

Es relevante ahora como ejemplo de especializacion de un modelo ASR pequeno mediante fine-tuning: con muy pocos recursos de computo se puede adaptar un modelo base a un dominio acustico concreto. No obstante, sus resultados (WER del 21,55 % en el conjunto de evaluacion) indican que la mejora es limitada y que el modelo no esta pensado para produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de openai/whisper-tiny: un transformer encoder-decoder con atencion completa, disenado para transcripcion de audio a texto. El modelo base tiene aproximadamente 39 millones de parametros; el ajuste fino conserva la estructura y solo modifica los pesos mediante entrenamiento supervisado sobre pares audio-transcripcion.

El entrenamiento se realizo sobre el dataset Japanese_english con los siguientes hiperparametros declarados en la model card: learning rate 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. Se registran dos puntos de evaluacion: en el paso 1000 (epoca 1,2438) con validation loss 0,4816 y WER 22,0238; en el paso 2000 (epoca 2,4876) con validation loss 0,4630 y WER 21,5539. No se documenta el numero de tokens de audio ni la composicion del dataset, ni si hubo tecnicas de aumento de datos o regularizacion adicionales.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en habla con acento japones.
- Transcripcion de audio a texto en formato compatible con el pipeline `automatic-speech-recognition` de transformers.
- Modelo ligero: inferencia viable en CPU y en GPUs de gama baja.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la model card (aunque el ajuste se orienta a acento japones, el idioma declarado es `en`).
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito.

## Casos de uso

- Transcripcion de reuniones y entrevistas con hablantes japoneses de ingles: el ajuste sobre el dataset Japanese_english busca reducir errores en este perfil acustico concreto, aunque el WER del 21,55 % exige revision humana en entornos profesionales.
- Subtitulado de contenido audiovisual para hablantes de ingles con acento japones: el modelo puede generar transcripciones base que luego se corrigen manualmente, aprovechando su bajo coste de inferencia.
- Prototipado rapido de pipelines ASR: al ser un modelo de 0,3 GB, se puede desplegar en entornos de desarrollo y pruebas sin infraestructura GPU dedicada.
- Investigacion en adaptacion de dominio: sirve como caso de estudio de fine-tuning de Whisper en datasets pequenos y especificos, con hiperparametros documentados y curva de evaluacion.
- Educacion y practica de pronunciacion: transcripcion de grabaciones de estudiantes japoneses de ingles para comparar con la referencia y detectar desviaciones.
- Despliegue en dispositivos con recursos limitados: aplicaciones de transcripcion offline en portatiles o sistemas embebidos donde un modelo mayor no cabe.
- Generacion de datasets etiquetados: uso del modelo para preanotar audio y acelerar la creacion de corpus ASR con acento japones, con posterior validacion humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Japanese (AVryon) | Japanese English (split test) | WER | 21,5539 |
| Whisper tiny Japanese (AVryon) | Japanese English (validation, paso 1000) | WER | 22,0238 |
| Whisper tiny Japanese (AVryon) | Japanese English (validation, paso 2000) | WER | 21,5539 |
| Whisper tiny Japanese (AVryon) | Japanese English (validation, paso 2000) | Loss | 0,4630 |

No se han publicado en la informacion disponible resultados comparativos con el modelo base openai/whisper-tiny ni con otros modelos ASR, por lo que no es posible cuantificar la mejora atribuible al fine-tuning.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,7 M de parametros); en la practica, el cuello de botella es el buffer de audio y el runtime, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1050 o superior, RTX 2060, RTX 3060, RTX 4090) e incluso en iGPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y en principio exportable a otros runtimes compatibles con Whisper (llama.cpp, faster-whisper, ONNX) aunque no se documenta en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (Japanese English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Japanese (AVryon) | 37,76 M | no disponible | 21,55 % (declarado, no verificado) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | ~39 M | ventana de audio de 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | ~74 M | ventana de audio de 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | ~244 M | ventana de audio de 30 s | no disponible en esta ficha | apache-2.0 | HuggingFace |

La comparacion cuantitativa con el modelo base y con variantes mayores de Whisper no esta disponible en la informacion proporcionada. En terminos de tamano, este ajuste es el mas ligero de la familia Whisper, lo que implica menor precision esperada pero tambien menor coste de inferencia.

## Limitaciones y advertencias

- El WER del 21,55 % en el conjunto de evaluacion es alto para uso en produccion sin revision humana.
- La model card es automatica y no documenta la composicion del dataset Japanese_english, el origen de las grabaciones ni el numero de horas de audio, lo que impide evaluar sesgos acusticos y demograficos.
- El modelo declara unicamente el idioma ingles; no se garantiza su comportamiento en japones ni en otros idiomas.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, solapamiento de hablantes o acentos distintos del japones.
- No hay resultados de benchmarks verificados de forma independiente; el WER declarado tiene `verified: false`.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Entrenado con solo 2000 pasos y batch de 2, lo que sugiere un ajuste limitado y posible sobreajuste al dataset concreto.
- No se documentan limitaciones de contexto mas alla de la ventana estandar de Whisper (30 s de audio por segmento), aunque este dato no se confirma en la model card.
- Fecha de creacion declarada en 2026-10-29, posterior a la fecha de esta ficha; conviene verificar la vigencia de los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AVryon/whisper-tiny_to_japanese_accent_29oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion del pipeline ASR de transformers: https://huggingface.co/docs/transformers/tasks/asr
