# bolorim/whisper-tiny-pulaar-kallaama

## Resumen

whisper-tiny-pulaar-kallaama es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, desarrollado por el usuario bolorim y publicado en Hugging Face bajo licencia Apache 2.0. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,76 millones de parametros, y esta especializado en la transcripcion de audio en pulaar (fula), una lengua de la familia atlantica hablada principalmente en Africa Occidental. El sufijo "kallaama" hace referencia a una de las variedades de esta macrolengua.

La relevancia de este modelo reside en su caracter de recurso de bajo coste para una lengua con escasisima representacion en sistemas ASR comerciales. Al derivar de whisper-tiny, el modelo puede ejecutarse en hardware muy modesto (incluso CPU), lo que facilita su despliegue en entornos con recursos limitados. Sin embargo, los resultados declarados por el autor son modestos: un WER del 41,94 % en el conjunto de evaluacion, con una perdida de validacion de 1,4152.

El repositorio tiene un tamano de 0,3 GB y fue creado el 30 de septiembre de 2026, con ultima actualizacion el 10 de noviembre de 2026. Cuenta con 5 descargas y ningun "like", lo que indica que se trata de un experimento academico o de un trabajo en curso mas que de un modelo listo para produccion. La model card esta generada automaticamente por el Trainer y carece de secciones sustantivas de descripcion, usos previstos o datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper-tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | pulaar (fula), variedad kallaama (inferido del nombre; no declarado explicitamente en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion multi-cabeza estandar, disenado para mapear espectrogramas Mel de audio a secuencias de tokens de texto. Whisper-tiny es la variante mas pequena de la familia Whisper, con 4 capas en encoder y 4 en decoder, y una dimension de modelo de 384. El ajuste fino se realizo con la libreria Transformers 5.16.1 sobre PyTorch 2.11.0+cu128.

Los hiperparametros declarados en la model card son: learning rate 0,001, batch size de entrenamiento 8 con acumulacion de gradientes de 2 pasos (batch efectivo 16), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de warmup, 500 pasos de entrenamiento totales y precision mixta nativa (AMP). La semilla fue 42. El conjunto de datos de entrenamiento no se especifica ("None dataset" en la model card) y no se documenta el numero de tokens ni la composicion del corpus. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un ajuste supervisado convencional sobre datos de audio-transcripcion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en pulaar, variedad kallaama.
- Transcripcion de audio a texto mediante el pipeline `automatic-speech-recognition` de Transformers.
- Compatible con los endpoints de Hugging Face (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo "thinking", vision, audio generativo ni otras capacidades especiales.
- Capacidad multilingue limitada al idioma de ajuste fino; el modelo base soporta multiples idiomas, pero el fine-tuning puede haber degradado el rendimiento en otros.

## Casos de uso

- Transcripcion de entrevistas y grabaciones de campo en pulaar: el modelo puede procesar audio de hasta 30 segundos por ventana (caracteristica de Whisper) y generar transcripciones para investigacion linguistica o proyectos de documentacion de lenguas minoritarias, aunque con una tasa de error elevada que exige revision humana.
- Subtitulado de contenido audiovisual en pulaar: util para radios comunitarias o creadores de contenido que necesiten una primera version de subtitulos, que luego se corregiria manualmente dado el WER del 41,94 %.
- Prototipado rapido de aplicaciones ASR para lenguas de Africa Occidental: al ser un modelo de 37,76 M de parametros y 0,3 GB, se puede desplegar en portatiles o dispositivos de borde para validar la viabilidad de un producto antes de invertir en modelos mayores.
- Investigacion en ASR de bajos recursos: sirve como linea base reproducible (semilla 42, hiperparametros documentados) para comparar tecnicas de aumento de datos o ajuste fino en pulaar.
- Clasificacion y mineria de audio: las representaciones del encoder pueden reutilizarse para tareas derivadas como deteccion de palabras clave o segmentacion de hablantes, aunque no se documenta esta capacidad.
- Educacion y aprendizaje de pulaar: transcripcion de materiales didacticos para estudiantes, con la advertencia de que la calidad es limitada y requiere supervision.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (model-index vacio; datos tomados de la model card):

| Metrica | Valor |
|---|---|
| Loss (validacion final) | 1,4152 |
| WER (validacion final) | 41,9355 % |

Evolucion del entrenamiento declarada por el autor:

| Paso | Epoch | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 100 | 11,1111 | 0,8144 | 1,2741 | 41,9355 % |
| 200 | 22,2222 | 0,4744 | 1,6830 | 77,4194 % |
| 300 | 33,3333 | 0,3982 | 1,4156 | 77,4194 % |
| 400 | 44,4444 | 0,3752 | 1,4065 | 41,9355 % |
| 500 | 55,5556 | 0,3611 | 1,4152 | 41,9355 % |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos son los de validacion del propio ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (37,76 M de parametros en fp32 ~ 151 MB; el repo ocupa 0,3 GB). En fp16, aproximadamente 75 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna es sobredimensionada; una GTX 1650, RTX 3050 o incluso CPU moderna pueden ejecutar el modelo con latencia aceptable.
- Cabe en cualquier GPU consumer e integrada; tambien en CPU y en dispositivos de borde (Raspberry Pi, moviles de gama alta) con las herramientas adecuadas.
- Opciones de despliegue: pipeline de Transformers, TGI (Text Generation Inference no aplica; para ASR se usaria el servidor de inferencia de Transformers), vLLM no soporta ASR de Whisper de forma nativa, llama.cpp no soporta Whisper directamente (existe whisper.cpp como alternativa, pero requeriria conversion), y el endpoint de Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (pulaar) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bolorim/whisper-tiny-pulaar-kallaama | 37,76 M | ventanas de 30 s | 41,94 % (validacion propia) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,76 M | ventanas de 30 s | no disponible para pulaar | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | ventanas de 30 s | no disponible para pulaar | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | ventanas de 30 s | no disponible para pulaar | Apache 2.0 | Hugging Face |

No se dispone de datos publicos de WER en pulaar para los modelos base de Whisper ni para otros ajustes finos comparables en la informacion proporcionada. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- WER del 41,94 % en validacion: la tasa de error es elevada y el modelo no es adecuado para produccion sin revision humana.
- La model card esta generada automaticamente y no documenta el conjunto de datos de entrenamiento, su procedencia ni su tamano, lo que impide evaluar sesgos y cobertura dialectal.
- El autor no declara explicitamente el idioma; la identificacion con pulaar/kallaama se infiere del nombre del modelo y no esta verificada en la documentacion.
- Riesgo de alucinacion en ASR: Whisper puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido o silencios.
- El ajuste fino sobre un unico idioma puede degradar el rendimiento multilingue del modelo base.
- No hay informacion sobre sesgos de genero, edad o dialecto en los datos de entrenamiento.
- El modelo tiene solo 5 descargas y ningun "like"; no ha sido validado por la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre los datos de entrenamiento impide garantizar el cumplimiento de derechos de terceros sobre el corpus.
- La fecha de creacion (2026) y la version de Transformers (5.16.1) indican un entorno muy reciente; la compatibilidad con versiones anteriores de la libreria no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bolorim/whisper-tiny-pulaar-kallaama
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- whisper.cpp (alternativa de inferencia en C/C++): https://github.com/ggerganov/whisper.cpp
