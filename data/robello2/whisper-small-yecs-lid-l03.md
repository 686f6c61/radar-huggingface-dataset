# robello2/whisper-small-yecs-lid-l03

## Resumen

whisper-small-yecs-lid-l03 es un ajuste fino de openai/whisper-small realizado por el usuario robello2 sobre el corpus YECS de habla con cambio de codigo (code-switching) yoruba-ingles. El modelo resuelve un problema concreto: el reconocimiento automatico de voz en conversaciones donde los hablantes alternan entre yoruba e ingles dentro de una misma emision, un escenario habitual en Nigeria y en comunidades diasporicas que los modelos Whisper originales manejan con dificultad. El checkpoint parte de la arquitectura transformer encoder-decoder de Whisper y conserva sus 241,7 millones de parametros, por lo que mantiene el coste de inferencia del modelo base.

El ajuste se ha realizado sobre el split de entrenamiento congelado de YECS, con 75.999 emisiones, y emplea una estrategia de token de idioma por emision (`<|en|>` o `<|yo|>`) asignado por mayoria de etiquetas de palabra, con decodificacion posterior en modo de deteccion automatica de idioma. El modelo se distribuye con pesos en safetensors y una licencia NOODL-1.0, lo que condiciona su uso comercial.

Su relevancia actual radica en que aborda el code-switching intra-emision, un fenomeno infrarepresentado en los benchmarks de ASR multilingue, y lo hace con un modelo pequeno (241 M de parametros) que puede ejecutarse en hardware modesto. No obstante, se trata de un checkpoint con cero descargas y cero likes en el momento de la consulta, sin publicacion de resultados en benchmarks externos, por lo que su validacion fuera del conjunto de desarrollo interno queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.736.450 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (valor estandar de Whisper; no especificado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | yoruba (yo), ingles (en) |
| Licencia | NOODL-1.0 (license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura completa de openai/whisper-small: un encoder-decoder transformer con atencion estandar, entrenado originalmente por OpenAI para ASR multilingue y traduccion de voz. El ajuste fino no modifica la topologia, sino que especializa los pesos hacia el dominio yoruba-ingles con cambio de codigo. El entrenamiento se realizo sobre el split congelado de YECS (75.999 emisiones), reservando un conjunto de desarrollo interno para seleccion de checkpoint.

Los hiperparametros documentados son: learning rate de 1e-5, 500 pasos de warmup, batch efectivo de 32 (16 x acumulacion 2), precision bf16, un maximo de 10 epocas con early stopping de paciencia 3 sobre WER greedy del conjunto de desarrollo, semilla 42 y seleccion del paso 12.000 de 15.000 (equivalentes a 6,32 epocas). La innovacion metodologica principal es la asignacion de un token de idioma por emision segun la mayoria de etiquetas de palabra, con desempate hacia ingles, y la recomendacion de decodificar con deteccion automatica de idioma. No se documenta uso de RLHF ni DPO, ni tecnicas de decodificacion especulativa o atencion lineal.

## Capacidades

- Reconocimiento automatico de voz (ASR) en yoruba e ingles, incluyendo emisiones con cambio de codigo intra-frase.
- Deteccion de idioma a nivel de emision mediante tokens especiales de Whisper (`<|en|>`, `<|yo|>`).
- Manejo de habla mixta con metrica especifica de error cerca y lejos de los puntos de cambio de idioma (switch_near_err, switch_away_err).
- Evaluacion con protocolo sensible a tonos y cambios de idioma: normalizacion NFC, eliminacion de puntuacion y conservacion de diacriticos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades mas alla del ASR.
- Capacidades multilingues limitadas a los dos idiomas del corpus (yoruba e ingles); no se garantiza comportamiento en otros idiomas.

## Casos de uso

- Transcripcion de conversaciones bilingues yoruba-ingles en atencion al cliente: el modelo puede procesar audio de centros de llamada nigerianos donde el agente alterna idiomas, usando la deteccion automatica de idioma para evitar forzar un unico idioma por sesion.
- Subtitulado de contenido audiovisual nigeriano (Nollywood, podcasts, television): permite generar subtitulos que respeten los cambios de codigo sin segmentar manualmente por idioma, gracias a la metrica switch_near_err de 13,87 % documentada en desarrollo.
- Investigacion linguistica sobre code-switching: sirve como linea base reproducible para estudiar alternancia yoruba-ingles, con protocolo de puntuacion tono-consciente y diacriticos conservados.
- Documentacion clinica o administrativa dictada: en entornos donde el personal dicta en ingles con terminos o frases en yoruba, el modelo puede transcribir sin requerir dos pasadas separadas por idioma.
- Preprocesado de corpus para entrenamiento de modelos mayores: el checkpoint puede actuar como etiquetador ASR de bajo coste (241 M de parametros) para generar transcripciones preliminares de audio yoruba-ingles.
- Despliegue en dispositivos con recursos limitados: al mantener el tamano de whisper-small, es viable en GPU de consumo para transcripcion en tiempo casi real de reuniones o entrevistas bilingues.
- Evaluacion comparativa de ASR en code-switching: util como referencia para medir la degradacion de modelos multilingues genericos frente a un ajuste especifico de dominio.

## Benchmarks y rendimiento

Resultados internos de desarrollo publicados por el autor (beam 5, language auto, porcentajes):

| Metrica | Valor |
|---|---|
| WER | 16,17 |
| CER | 5,85 |
| di_wer | 12,63 |
| err_yo | 18,06 |
| err_en | 10,37 |
| pier_yo | 20,54 |
| switch_near_err | 13,87 |
| switch_away_err | 14,17 |
| ins_per_word | 2,12 |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos alternativos sobre el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,5 GB de pesos mas overhead de activaciones y cache; en la practica, menos de 2 GB para audio de 30 segundos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes y sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para transcripcion por lotes no interactiva.
- Opciones de despliegue: transformers con pipeline de automatic-speech-recognition, faster-whisper, WhisperX y llama.cpp no aplica (no hay pesos GGUF publicados). vLLM y TGI no estan orientados a Whisper en esta configuracion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-yecs-lid-l03 | 241,7 M | 30 s por ventana | yo, en | NOODL-1.0 | HuggingFace, 0 descargas |
| openai/whisper-small | 241,7 M | 30 s por ventana | multilingue (99 idiomas) | Apache 2.0 | HuggingFace, ampliamente usado |
| openai/whisper-medium | 769 M | 30 s por ventana | multilingue (99 idiomas) | Apache 2.0 | HuggingFace |
| whisper-small ajustado generico en yoruba | no disponible | 30 s por ventana | yo (y en segun ajuste) | variable | no disponible |

La comparativa cuantitativa de rendimiento frente a whisper-small original o whisper-medium en el corpus YECS no esta disponible en la informacion proporcionada. La ventaja diferencial del modelo es la especializacion en code-switching yoruba-ingles; su desventaja es la licencia NOODL-1.0 frente a la Apache 2.0 del modelo base y la ausencia de validacion externa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un unico corpus (YECS), puede heredar sesgos de dominio, registro y demografia de dicho corpus.
- Riesgo de alucinacion: inherente a los modelos Whisper en segmentos de silencio, ruido o audio fuera de dominio; no se documenta mitigacion especifica.
- Limitaciones de contexto e idioma: ventana de 30 segundos por segmento y soporte restringido a yoruba e ingles; no se garantiza calidad en otros idiomas ni en variantes dialectales no representadas.
- Restricciones de licencia: NOODL-1.0 no es una licencia permisiva estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribucion. El modelo base whisper-small es Apache 2.0, pero el checkpoint ajustado se distribuye bajo NOODL-1.0.
- Validacion limitada: solo se publican metricas de desarrollo interno (WER 16,17 %), sin conjunto de test independiente ni comparacion con lineas base; el checkpoint tiene cero descargas y cero likes, por lo que no hay evidencia de uso en produccion.
- Caveat de produccion: la estrategia de token de idioma por mayoria puede fallar en emisiones con alternancia equilibrada o con desempate forzado a ingles, lo que puede degradar el rendimiento en segmentos predominantemente yoruba.
- Fecha de creacion del repositorio (2026-11-01) posterior a la fecha habitual de consulta; verificar la integridad y procedencia del checkpoint antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robello2/whisper-small-yecs-lid-l03
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Corpus YECS: no disponible en la informacion proporcionada
- Licencia NOODL-1.0: no disponible enlace directo en la informacion proporcionada
