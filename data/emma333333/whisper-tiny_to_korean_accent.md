# emma333333/whisper-tiny_to_korean_accent

## Resumen

Whisper tiny Korean es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario emma333333 en Hugging Face. El objetivo declarado es adaptar el modelo base, entrenado originalmente por OpenAI sobre un corpus masivo y multilingue, a un conjunto de datos propio denominado "korean_english", presumiblemente formado por audio en ingles con acento coreano. El modelo resultante tiene 37.760.640 parametros y conserva la licencia Apache 2.0 del modelo original.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, generado automaticamente mediante el Trainer de Hugging Face y con una model card incompleta (secciones de descripcion, usos previstos y datos de entrenamiento marcadas como "More information needed"). Su relevancia practica es limitada: no es un modelo de proposito general, sino una prueba de concepto de adaptacion de dominio sobre una arquitectura ya compacta.

La arquitectura subyacente es la de Whisper tiny, un transformer encoder-decoder con aproximadamente 39 millones de parametros en su version original, disenado para transcripcion de audio. El ajuste fino se realizo durante 2000 pasos con un learning rate de 1e-05 y batch size de 2, lo que sugiere un entrenamiento ligero sobre un dataset pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un transformer encoder-decoder que procesa espectrogramas Mel de audio y genera tokens de texto de forma autoregresiva. Whisper tiny es la variante mas pequena de la familia Whisper y esta pensada para entornos con recursos muy limitados. El ajuste fino mantiene la arquitectura intacta y solo actualiza los pesos sobre el dataset "korean_english".

El entrenamiento se realizo con el Trainer de Hugging Face durante 2000 pasos (aproximadamente 2 epocas segun la tabla de resultados), con learning rate lineal de 1e-05, warmup de 500 pasos, batch size de entrenamiento de 2 y batch de evaluacion de 1, semilla 42 y optimizador AdamW fused. La perdida de validacion paso de 0.2164 en el paso 1000 a 0.2029 en el paso 2000, con un WER de 9.8780 y 9.8049 respectivamente. No se documenta el volumen de datos, la composicion del dataset ni si hubo tecnicas de aumentacion o regularizacion adicionales.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con posible adaptacion a acentos coreanos segun el nombre del modelo y el dataset de entrenamiento.
- Transcripcion de audio de hasta 30 segundos por segmento, limitacion heredada de la arquitectura Whisper.
- Generacion de texto a partir de audio (pipeline automatic-speech-recognition de transformers).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta soporte multilingue mas alla del ingles declarado en la model card.
- No se documentan modos especiales como thinking mode, vision o audio generation.

## Casos de uso

- Transcripcion de audio en ingles con acento coreano: el ajuste fino sobre el dataset "korean_english" sugiere que el modelo puede mejorar la tasa de error frente al Whisper tiny original en este dominio concreto, aunque no hay comparacion publicada.
- Prototipado rapido de pipelines ASR: al ser un modelo de 37 millones de parametros, se puede cargar en CPU o GPU de gama baja para validar integraciones con la libreria transformers antes de pasar a modelos mayores.
- Pruebas de concepto en entornos educativos: util para demostrar el flujo de fine-tuning de Whisper con el Trainer de Hugging Face y evaluar el impacto de un dataset pequeno en el WER.
- Subtitulado offline de clips cortos: adecuado para audios de menos de 30 segundos donde no se requiera alta precision y el acento sea el del dominio de entrenamiento.
- Evaluacion comparativa de tecnicas de adaptacion de dominio: sirve como baseline para medir mejoras al cambiar el dataset, el learning rate o el numero de pasos.
- Integracion en aplicaciones de bajo consumo: al caber en dispositivos con poca memoria, puede desplegarse en entornos edge para transcripcion basica, siempre que el acento y el idioma coincidan con los del entrenamiento.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| Korean English | test | WER | 9.8049 |
| Korean English | test | Loss | 0.2029 |

Resultados de entrenamiento reportados:

| Epoca | Paso | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1.0173 | 1000 | 0.1750 | 0.2164 | 9.8780 |
| 2.0346 | 2000 | 0.0742 | 0.2029 | 9.8049 |

No se han publicado resultados de benchmarks en la informacion disponible para comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 millones de parametros), aproximadamente 150-300 MB en fp16 o cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs integradas o CPU para inferencia en tiempo real de clips cortos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, y en CPU con latencia aceptable para audios cortos.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no aplica (no es un modelo de texto generativo puro), llama.cpp no soporta Whisper de forma nativa, TGI no esta orientado a ASR. Alternativas: faster-whisper y whisper.cpp con conversion de pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (dataset) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emma333333/whisper-tiny_to_korean_accent | 37,76 M | audio 30 s | 9,8049 (Korean English) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | ~39 M | audio 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | ~74 M | audio 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-small | ~244 M | audio 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparacion directa de WER no es posible porque los modelos base de OpenAI no reportan resultados sobre el dataset "korean_english" en la informacion disponible. El modelo ajustado tiene un tamano similar al whisper-tiny original, por lo que su ventaja, si existe, se limita al dominio del dataset de entrenamiento.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos y datos de entrenamiento estan sin completar, lo que impide conocer la composicion real del dataset y los sesgos asociados.
- Resultados no verificados: el WER de 9,8049 esta marcado como `verified: false` en el model-index, por lo que no ha sido validado de forma independiente.
- Riesgo de sobreajuste: con solo 2000 pasos, batch size de 2 y un dataset no documentado, el modelo puede generalizar mal fuera del dominio de entrenamiento.
- Limitacion de idioma: la model card declara unicamente ingles, aunque el nombre sugiere un enfoque en acentos coreanos; no se garantiza un buen rendimiento en coreano nativo ni en otros idiomas.
- Limitacion de contexto de audio: Whisper tiny procesa ventanas de 30 segundos, lo que requiere segmentacion para audios largos y puede degradar la coherencia en transcripciones extensas.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible en segmentos de silencio o ruido, especialmente en variantes pequenas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre el dataset de entrenamiento impide descartar problemas de procedencia de los datos.
- Cero adopcion: sin descargas ni likes, no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Repositorio de 0,3 GB: incluye checkpoints de entrenamiento ademas de los pesos finales, lo que puede confundir en el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emma333333/whisper-tiny_to_korean_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
- Dataset referenciado (no verificable desde la informacion disponible): korean_english
