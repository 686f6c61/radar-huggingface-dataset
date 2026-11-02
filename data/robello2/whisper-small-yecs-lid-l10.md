# robello2/whisper-small-yecs-lid-l10

## Resumen

whisper-small-yecs-lid-l10 es un ajuste fino (fine-tune) del modelo openai/whisper-small para reconocimiento automatico del habla (ASR) en escenarios de code-switching yoruba-ingles. Lo desarrolla el usuario robello2 y esta entrenado sobre el corpus YECS (Yoruba-English Code-Switched speech), un conjunto de 75.999 enunciados del split de entrenamiento congelado. El modelo resuelve el problema del reconocimiento de habla cuando el hablante alterna entre yoruba e ingles dentro de una misma conversacion, un escenario especialmente dificil para los sistemas ASR multilingues convencionales.

El modelo conserva la arquitectura encoder-decoder transformer de Whisper small (241,7 millones de parametros) y anade una perdida auxiliar de identificacion de idioma (LID) a nivel de token en el decoder durante el entrenamiento. Es relevante para la comunidad de investigacion en lenguas de bajos recursos y para desarrolladores que construyan sistemas de transcripcion para comunidades yoruba-parlantes bilingues, un nicho practicamente desatendido por los modelos ASR comerciales.

El ajuste se realizo con una tasa de aprendizaje de 1e-05, warmup de 500 pasos, batch de 16 con acumulacion de 2, precision bf16, hasta 10 epocas con parada temprana (paciencia 3) sobre el WER greedy del conjunto de desarrollo interno. El checkpoint seleccionado corresponde al paso 6000, con entrenamiento detenido en el paso 10000 (4,21 epocas), semilla 42.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.736.450 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar de Whisper en llama.cpp/ctranslate2) |
| Idiomas soportados | yoruba (yo), ingles (en); entrenado para code-switching yo-en |
| Licencia | NOODL-1.0 (license_name: noodl-1.0, tag license: other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder con atencion estandar (no usa atencion lineal ni arquitecturas hibridas) disenado para ASR multilingue con ventanas de 30 segundos de audio. El ajuste fino se realizo sobre el corpus YECS de habla code-switched yoruba-ingles, con 75.999 enunciados del split de entrenamiento congelado y un conjunto de desarrollo interno reservado. Cada enunciado recibe un token de idioma (`<|en|>` o `<|yo|>`) determinado por la mayoria de las etiquetas a nivel de palabra, con desempate hacia ingles.

La innovacion tecnica principal es la incorporacion de una perdida auxiliar de identificacion de idioma (LID) a nivel de token en el decoder, con peso 1.0, que se suma a la perdida estandar de prediccion de tokens. Los pesos de la cabeza LID (`lid_head.*`) se guardan en el repositorio pero no se utilizan en inferencia: `from_pretrained` los omite y la decodificacion se realiza con un modelo Whisper estandar. El entrenamiento empleo bf16, tasa de aprendizaje 1e-05, warmup de 500 pasos, batch efectivo de 32 (16 × acumulacion 2), hasta 10 epocas con parada temprana sobre el WER greedy del dev interno y semilla 42. El protocolo de evaluacion es consciente de tonos y cambios de idioma (NFC, puntuacion eliminada, diacriticos conservados).

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en yoruba e ingles, con enfasis en habla code-switched yoruba-ingles.
- Manejo de cambios de idioma intra-enunciado (code-switching), incluyendo cambios cerca y lejos de las fronteras de palabra.
- Transcripcion con diacriticos y marcas de tono del yoruba (el protocolo de evaluacion conserva diacriticos).
- Decodificacion con beam search (beam 5 reportado) y deteccion automatica de idioma.
- Capacidad de identificacion de idioma a nivel de token entrenada (cabeza LID presente en pesos pero no usada en inferencia estandar).
- No soporta tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion ASR estandar de Whisper.

## Casos de uso

- Transcripcion de conversaciones bilingues yoruba-ingles: el modelo esta ajustado especificamente para hablantes que alternan idiomas dentro de una misma frase, un escenario donde Whisper small original rinde peor por la mezcla de lenguas.
- Subtitulado de contenido audiovisual para comunidades yoruba-parlantes en la diaspora: permite generar subtitulos en contextos donde el habla mezcla ingles y yoruba de forma natural.
- Investigacion en ASR de lenguas de bajos recursos: sirve como punto de partida (baseline) reproducible para experimentos de code-switching con Whisper, dado que documenta hiperparametros, semilla y protocolo de evaluacion.
- Sistemas de atencion al cliente o linea de ayuda para poblaciones bilingues: transcripcion de llamadas donde el usuario alterna yoruba e ingles, con contexto de 30 segundos por ventana suficiente para turnos de conversacion cortos.
- Documentacion clinica o legal dictada: transcripcion de notas donde profesionales bilingues mezclan terminos tecnicos en ingles con yoruba, conservando diacriticos y tonos.
- Creacion de corpus anotados: generacion de transcripciones iniciales para revision humana en proyectos de anotacion de habla yoruba-ingles, reduciendo el esfuerzo manual frente a transcripcion desde cero.
- Analisis de contenido en redes sociales y podcasts: procesamiento por lotes de audio bilingue para indexacion y busqueda de texto.

## Benchmarks y rendimiento

Resultados internos del conjunto de desarrollo (beam 5, idioma automatico, porcentajes):

| Metrica | Valor |
|---|---|
| WER | 16,02 |
| CER | 5,92 |
| DI_WER | 12,56 |
| err_yo | 18,24 |
| err_en | 10,00 |
| pier_yo | 20,86 |
| switch_near_err | 13,66 |
| switch_away_err | 14,15 |
| ins_per_word | 2,08 |

No se han publicado resultados comparativos con otros modelos (Whisper small original u otros fine-tunes) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,5-1 GB para los pesos (241,7 M de parametros) mas overhead de activaciones y buffers de audio.
- VRAM estimada en cuantizacion int8: aproximadamente 0,3 GB; en int4, en torno a 0,15-0,2 GB (estimaciones segun tamano de parametros, no verificadas).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, asi como A100/H100 para despliegues de alto throughput.
- Cabe holgadamente en GPU consumer, incluidas GPUs con 4-8 GB de VRAM, e incluso en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (WhisperForConditionalGeneration), faster-whisper (ctranslate2), whisper.cpp, vLLM (soporte Whisper), TGI segun soporte de la version.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-yecs-lid-l10 | 241,7 M | 30 s | yo, en (code-switching) | NOODL-1.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s | multilingue (99 idiomas) | Apache 2.0 | HuggingFace, ampliamente desplegado |
| openai/whisper-base | 74 M | 30 s | multilingue | Apache 2.0 | HuggingFace |
| openai/whisper-medium | 769 M | 30 s | multilingue | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo con estos modelos en la informacion proporcionada. El modelo ajustado esta especializado en yoruba-ingles code-switched, mientras que Whisper small original cubre muchos mas idiomas pero sin ajuste especifico a este dominio.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre el corpus YECS; el rendimiento fuera de ese dominio (otros acentos, ruido, otros registros) no esta documentado y puede degradarse.
- El WER en yoruba (err_yo 18,24) es notablemente superior al de ingles (err_en 10,00), lo que indica mayor dificultad en la parte yoruba.
- Riesgo de alucinacion inherente a los modelos Whisper, especialmente en segmentos con silencio, ruido o audio de baja calidad.
- La cabeza LID (`lid_head.*`) se guarda pero no se usa en inferencia; no debe asumirse que el modelo expone deteccion de idioma a nivel de token en produccion.
- Licencia NOODL-1.0: es necesario revisar sus terminos antes de cualquier uso, incluido el comercial; no es una licencia permisiva tipo Apache o MIT.
- El modelo base Whisper small tiene limitaciones conocidas de sesgo hacia ingles y hacia determinados acentos; el ajuste no corrige necesariamente esos sesgos.
- Ventana de contexto de 30 segundos por segmento; audios mas largos requieren segmentacion y pueden sufrir errores en las fronteras.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; no hay validacion externa de la comunidad ni evaluacion independiente publicada.
- Fecha de creacion indicada como 2026-11-02, posterior a la fecha habitual de referencia; conviene verificar la vigencia y procedencia del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/robello2/whisper-small-yecs-lid-l10
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- faster-whisper (ctranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Corpus YECS: no disponible en la informacion proporcionada
- Licencia NOODL-1.0: no disponible enlace directo en la informacion proporcionada
