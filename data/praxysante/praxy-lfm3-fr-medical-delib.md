# PraxySante/Praxy-LFM3-FR-Medical-Delib

## Resumen

Praxy LFM3 FR Medical Delib es un modelo de reconocimiento automático del habla (ASR) en francés especializado en dictado médico, desarrollado por PraxySante. Se trata del segundo eslabón de una cascada de dos etapas: recibe el audio de 16 kHz junto con el borrador generado por el primer pasaje (`PraxySante/Praxy-LFM3-FR-Medical-Live`) y produce una transcripción corregida. Su función no es transcribir desde cero, sino editar localmente un borrador ya existente, lo que le permite operar con latencias muy bajas.

El modelo deriva de LFM3 de Liquid AI y cuenta con 1.977.548.032 parámetros (1,98 mil millones) distribuidos en 24 capas, con pesos en fp32 que ocupan 7,4 GB. Está entrenado sobre 40.209 borradores de dictado médico y 19.998 de registro general, y se distribuye bajo la licencia LFM Open License. Su relevancia actual radica en que mejora el WER de la cascada publicada de referencia en el dominio médico (6,30 frente a 7,41 de NeMo V6 + T5Gemma2) manteniendo una latencia por debajo de los 110 ms por enunciado en H100.

La propuesta técnica es poco habitual: en lugar de reescribir la frase completa, el segundo pasaje edita el borrador, lo que explica que sea más rápido que alternativas generativas como T5Gemma2 (p50 de 111 ms frente a 194-213 ms en p95). El modelo está pensado para despliegues en producción de dictado clínico en francés, con la salvedad de que requiere un guardarraíl léxico para evitar degradaciones cuando el borrador de entrada ya es correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid AI), transformer con soporte de audio; 24 capas |
| Parametros totales | 1.977.548.032 (1,98 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | francés (fr) |
| Licencia | LFM Open License (license_name: lfm-open-license, license: other) |
| Formato de pesos | safetensors (custom_code, transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM3 de Liquid AI, un transformer de 24 capas y 1,98 mil millones de parámetros adaptado para entrada de audio a 16 kHz. La innovación principal no está en el backbone, sino en el paradigma de entrenamiento: el modelo aprende a corregir borradores reales en lugar de transcribir audio desde cero. El conjunto de entrenamiento combina 40.209 borradores de dictado médico y 19.998 de registro general, lo que le permite aprender a identificar y reparar errores típicos del primer pasaje.

La inferencia se realiza mediante la librería `transformers` con código personalizado (`custom_code`). El borrador del primer pasaje se inyecta en el contexto del sistema mediante el campo `live.draft_prob` del prompt, y la referencia de entrenamiento y evaluación utiliza la opción `context=draft` del script `scripts/offline_infer.py` del repositorio interno `lfm3_fr_live`. No se han publicado detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Reconocimiento automático del habla en francés sobre audio de 16 kHz.
- Corrección de borradores ASR mediante edición local (segundo pasaje de una cascada).
- Especialización en vocabulario y estructuras del dictado médico (fármacos, terminología clínica).
- Manejo de registro general además del dominio médico.
- Integración con la interfaz de `transformers` mediante `pipeline_tag: automatic-speech-recognition`.
- Entrada multimodal: audio más texto de contexto (borrador) en el prompt de sistema.
- No se documenta soporte de tool calling, function calling, agentes ni modo de razonamiento explícito.

## Casos de uso

- Dictado clínico en consulta: el modelo recibe el audio del facultativo y el borrador del primer pasaje, y devuelve una transcripción corregida con terminología médica precisa, reduciendo el WER de 6,47 a 6,30 en el conjunto de validación de fármacos.
- Documentación hospitalaria en registro general: con un WER de 8,42 frente a 8,95 del primer pasaje solo, es adecuado para transcribir notas clínicas y administrativas en francés.
- Despliegue de baja latencia en producción: con 33-108 ms por enunciado en H100 (RTFx 94-122 en nodo descargado), permite dictado casi en tiempo real en estaciones clínicas.
- Integración en cascadas ASR existentes: puede añadirse como segunda etapa sobre un primer pasaje ya desplegado, ya que su interfaz reutiliza el mismo contrato de entrada más el borrador en el contexto de sistema.
- Corrección de transcripciones en lote: para volcados de audio ya procesados por el primer pasaje, el modelo puede reprocesar los borradores y mejorar la calidad final sin reescuchar el audio desde cero en cada iteración.
- Sistemas de historia clínica electrónica: al ser un modelo de 1,98 mil millones de parámetros y 7,4 GB en fp32, puede alojarse en infraestructura dedicada por centro sanitario, manteniendo los datos dentro de la región EU indicada en los tags.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 500 enunciados, con los mismos ítems que la cascada publicada V6 + T5Gemma2. WER `lower_punct`.

| Brazo | val_drugs_std | val_general |
|---|---|---|
| Primer pasaje solo (bloque 960 ms) | 6,47 | 8,95 |
| + segundo pasaje (este modelo) | 6,30 | 8,42 |
| + guardarraíl léxico | 6,39 | 8,33 |
| Referencia: NeMo V6 + T5Gemma2 (rejugado) | 7,41 | 6,76 |

Latencia medida en H100: 33-108 ms por enunciado según la carga del nodo (RTFx 94-122 en nodo descargado: 33 / 67 ms; 100 / 108 ms bajo contención). El segundo pasaje es más rápido que T5Gemma2 (p50 111 ms, p95 194-213 ms) porque edita localmente un borrador en lugar de reescribir la frase.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,4 GB en fp32 para los pesos; el consumo real de memoria será superior al incluir activaciones y buffers de audio (no se publica cifra exacta).
- GPU recomendadas: H100 para las latencias publicadas (33-108 ms por enunciado). No se han publicado mediciones en otras GPU.
- Cabe en GPU de consumo: con 7,4 GB en fp32 es viable en tarjetas con 12 GB o más (por ejemplo, RTX 4090); no se han publicado mediciones de latencia en estas GPU.
- Opciones de despliegue: `transformers` con `custom_code` (requerido por la arquitectura LFM3). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 33-108 ms por enunciado en H100 según carga; RTFx 94-122 en nodo descargado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER dominio médico | WER registro general | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Praxy LFM3 FR Medical Delib | 1,98 mil millones | no disponible | 6,30 | 8,42 | LFM Open License | Hugging Face (0 descargas) |
| NeMo V6 + T5Gemma2 (referencia) | no disponible | no disponible | 7,41 | 6,76 | no disponible | cascada publicada de referencia |
| T5Gemma2 (segundo pasaje alternativo) | no disponible | no disponible | no disponible | no disponible | no disponible | citado en la model card |

No se dispone de datos de benchmarks de otros modelos ASR comparables en la información proporcionada.

## Limitaciones y advertencias

- Sobre un borrador ya perfecto puede degradar el resultado: hasta 1,6 puntos en el cuartil Q1 de `val_general` (de 0 a 1,6). Se recomienda el guardarraíl léxico en producción.
- Sobre borradores muy erróneos (29,8 % de WER) solo recupera 2,9 puntos, frente a los 6,2 de T5Gemma2.
- El registro general empeora frente a la cascada de referencia (8,42 frente a 6,76), por lo que no es la mejor opción fuera del dominio médico.
- Solo soporta francés; no hay capacidades multilingües documentadas.
- Licencia LFM Open License: es necesario revisar sus términos para uso comercial, ya que es una licencia "other" derivada de LFM3 de Liquid AI.
- No se documentan sesgos específicos, pero al ser un modelo especializado en dictado médico puede presentar sesgos propios de los datos clínicos de entrenamiento.
- Riesgo de alucinación en la corrección: al editar el borrador puede introducir términos plausibles pero incorrectos, especialmente en fármacos; de ahí la recomendación del guardarraíl léxico.
- El modelo requiere código personalizado (`custom_code`) y no es compatible con runtimes estándar sin ese soporte.
- No se ha publicado información sobre la longitud de contexto ni sobre cuantizaciones disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/PraxySante/Praxy-LFM3-FR-Medical-Delib
- Primer pasaje de la cascada: https://huggingface.co/PraxySante/Praxy-LFM3-FR-Medical-Live
- Repositorio interno citado: `lfm3_fr_live` (script `scripts/offline_infer.py`); no se proporciona URL pública.
- LFM3 de Liquid AI: no se proporciona URL en la información disponible.
- Contacto del autor: PraxySante (no se proporciona URL adicional).
