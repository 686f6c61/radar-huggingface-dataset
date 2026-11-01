# jkacan/whisper-tiny_to_korean_accent

## Resumen

Whisper tiny Korean es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla openai/whisper-tiny, publicado por el usuario jkacan en HuggingFace. El objetivo declarado es adaptar el modelo base, entrenado originalmente por OpenAI sobre corpus multilingües masivos, a un conjunto de datos específico denominado Korean_english, que presumiblemente contiene audio en inglés con acento coreano. El modelo resultante tiene 37,7 millones de parámetros y un tamaño de repositorio de 0,3 GB, lo que lo sitúa en la gama ultra-ligera de modelos ASR.

La relevancia de este modelo es acotada pero concreta: los modelos Whisper originales rinden peor cuando el hablante tiene un acento marcado no representado en la distribución de entrenamiento principal. Un ajuste fino sobre un dataset de acento específico puede reducir la tasa de error de palabras (WER) en ese dominio concreto, a costa de degradar el rendimiento general. Con 28 descargas y 0 likes en el momento de la consulta, se trata de un modelo experimental de nicho, no de un artefacto listo para producción.

La arquitectura subyacente es la de Whisper tiny: un transformer encoder-decoder con 4 capas en cada bloque, atención multi-cabeza estándar y una ventana de contexto de 1500 posiciones (30 segundos de audio a 16 kHz). El modelo se distribuye en formato safetensors y está pensado para usarse con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de 30 s de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; el dataset de ajuste es Korean_english) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un transformer encoder-decoder con atención multi-cabeza estándar. Whisper procesa audio convertido a espectrogramas mel logarítmicos de 80 canales, con ventanas de 30 segundos, y genera tokens de texto de forma autorregresiva. La variante tiny es la más pequeña de la familia Whisper y está diseñada para inferencia en dispositivos con recursos limitados.

El ajuste fino se realizó sobre el dataset Korean_english con los siguientes hiperparámetros declarados en la model card: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluación de 1, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. El entrenamiento se ejecutó con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el número de tokens de audio ni la composición detallada del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR).

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con especialización en habla con acento coreano según el dataset de ajuste.
- Transcripción de audio de hasta 30 segundos por ventana, con posibilidad de chunking para audios más largos mediante pipelines de transformers.
- Generación de marcas de tiempo a nivel de segmento si se activa la opción correspondiente en el pipeline.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada: aunque Whisper tiny es multilingüe en su origen, este ajuste declara únicamente el idioma inglés y el fine-tuning puede haber degradado el rendimiento en otros idiomas.
- No dispone de modo thinking, visión ni audio más allá del propio pipeline ASR.

## Casos de uso

- Transcripción de reuniones o entrevistas con hablantes coreanos que se expresan en inglés: el ajuste sobre Korean_english busca reducir el WER en este perfil de hablante, donde el Whisper tiny original suele fallar por el acento.
- Subtitulado automático de contenido audiovisual de baja latencia: al ser un modelo de 37,7 M de parámetros, puede ejecutarse en tiempo real en CPU o GPU modesta, lo que lo hace adecuado para generar subtítulos preliminares que luego se revisan manualmente.
- Preprocesado de audio en pipelines de análisis de llamadas: transcripción rápida de grabaciones de atención al cliente para su posterior indexación o búsqueda, aceptando la menor precisión frente a modelos mayores.
- Prototipado de asistentes de voz en entornos con recursos limitados: útil para validar flujos de ASR antes de invertir en modelos de mayor tamaño.
- Investigación sobre robustez frente a acentos: sirve como punto de comparación controlado (mismo modelo base, distinto ajuste) en estudios de adaptación de dominio.
- Transcripción offline en dispositivos edge: el tamaño reducido permite desplegarlo en Raspberry Pi o portátiles sin GPU dedicada, para aplicaciones de dictado o notas de voz.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Dataset | Métrica | Valor |
|---|---|---|---|
| ASR | Korean English (split test) | WER | 9,8049 % |
| ASR | Korean English (validación, step 1000) | WER | 10,0488 % |
| ASR | Korean English (validación, step 2000) | WER | 9,8049 % |
| ASR | Korean English (validación, step 2000) | Loss | 0,2030 |

No se han publicado resultados de benchmarks adicionales (p. ej. LibriSpeech, Common Voice) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (37,7 M de parámetros), aproximadamente 150-300 MB en FP16 o int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona correctamente en GTX 1050 Ti, RTX 2060, RTX 3060, T4, e incluso en CPU.
- Cabe en cualquier GPU consumer actual y en la mayoría de iGPU modernas; también es viable en CPU para transcripciones no críticas en latencia.
- Opciones de despliegue: pipeline de transformers (ASR), vLLM no aplica de forma estándar a Whisper, llama.cpp no soporta Whisper de forma nativa, TGI no soporta este modelo; alternativas viables son faster-whisper (con conversión de pesos) y ONNX Runtime.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jkacan/whisper-tiny_to_korean_accent | 37,7 M | 30 s | en (ajuste coreano) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 39 M | 30 s | multilingüe | apache-2.0 | HuggingFace |
| openai/whisper-base | 74 M | 30 s | multilingüe | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s | multilingüe | apache-2.0 | HuggingFace |

No se dispone de datos de WER comparativos entre estos modelos sobre el dataset Korean English en la información proporcionada, por lo que no es posible cuantificar la mejora del ajuste fino frente al modelo base.

## Limitaciones y advertencias

- El modelo declara únicamente el idioma inglés; su uso con otros idiomas puede producir transcripciones incorrectas o alucinaciones.
- El dataset Korean_english no está documentado en detalle (número de horas, composición, procedencia), lo que impide evaluar su representatividad y los posibles sesgos introducidos.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada, comportamiento heredado de Whisper tiny.
- El WER de 9,8 % está declarado por el autor y marcado como no verificado; no debe tomarse como referencia absoluta sin replicación independiente.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Whisper también es apache-2.0, por lo que no hay restricciones adicionales conocidas.
- El modelo tiene 28 descargas y ninguna validación comunitaria; no se recomienda para producción sin una evaluación propia sobre el dominio objetivo.
- El ajuste fino sobre un dataset pequeño puede haber provocado olvido catastrófico en otras variedades del inglés o en otros idiomas.
- La model card está generada automáticamente y contiene secciones sin completar ("More information needed"), lo que refleja falta de documentación por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jkacan/whisper-tiny_to_korean_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentación de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
