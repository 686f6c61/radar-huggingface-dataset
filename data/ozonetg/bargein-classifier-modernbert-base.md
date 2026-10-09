# ozonetg/bargein-classifier-modernbert-base

## Resumen

bargein-classifier-modernbert-base es un clasificador binario de texto desarrollado por el usuario ozonetg que resuelve una tarea concreta dentro de los agentes de voz: decidir si un interlocutor esta interrumpiendo (barge-in) al agente mientras este habla. Dado lo que el agente ya dijo (`agent_said`), lo que le queda por decir (`agent_unsaid`) y la transcripcion ASR de lo que dice la persona (`caller_said`), el modelo devuelve P(INTERRUPT); con umbral 0,5 la etiqueta INTERRUPT indica que el agente debe callarse y ceder el turno.

Tecnicamente es un ajuste fino de answerdotai/ModernBERT-base, un encoder transformer de 149,6 millones de parametros con soporte de contexto largo. No es un modelo generativo: es una cabeza de clasificacion sobre un encoder, entrenada con R-Drop, orientada a produccion en telefonia y dialogo hablado. Su relevancia actual radica en que aborda el control de turnos en agentes de voz, un problema poco cubierto por los modelos generativos generalistas y muy sensible a la latencia.

El propio autor lo publica como linea base de comparacion, no como la opcion recomendada: existe una version gemela, bargein-classifier-ettin-150m, entrenada con la misma receta, los mismos datos y velocidad identica, que obtiene mejores resultados en tipos de negocio no vistos, llamadas con distribucion desplazada y en distinguir a quien se marcha de quien se despide y vuelve. Este checkpoint sirve para verificar que, con todo lo demas fijo, el preentrenamiento del encoder importa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base), cabeza de clasificacion binaria |
| Parametros totales | 149.606.402 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (arquitectura base ModernBERT); no especificada de forma independiente para la tarea |
| Tipos de cuantizacion | no disponible (pesos publicados en precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder bidireccional de estilo BERT modernizado, con atencion alterna local/global sobre un contexto de hasta 8192 tokens. Sobre ese backbone se anade una cabeza de clasificacion para una unica etiqueta binaria. La entrada se compone de tres segmentos, `agent_said`, `agent_unsaid` y `caller_said`, que deben formatearse con `format_input.py`, el formateador usado en el entrenamiento; un transcript de llamante vacio debe tratarse como CONTINUE sin invocar al modelo.

El entrenamiento sigue exactamente la misma receta que el modelo Ettin-150m del mismo autor (mismos datos, mismos hiperparametros y misma tecnica de regularizacion R-Drop, referencia arXiv:2106.14448), cambiando unicamente el checkpoint base. El proposito del checkpoint es aislar la variable del preentrenamiento: mantener fija la receta y comparar el encoder. El autor declara los resultados de benchmarks sin verificacion externa (metricas marcadas como `verified: false`). El modelo se distribuye con `predict.py`, un envoltorio que carga en bf16 si hay GPU y en fp32 en CPU, y publica latencias p50 de 6,9 ms en GPU y 37,1 ms en CPU.

## Capacidades

- Clasificacion binaria de barge-in: devuelve P(INTERRUPT) a partir de los tres campos de contexto (`agent_said`, `agent_unsaid`, `caller_said`).
- Control de turnos en agentes de voz: con umbral 0,5, la etiqueta INTERRUPT indica al agente que cese de hablar y ceda el turno.
- Distincion entre interrupcion real y solapamiento no interruptivo, como backchannels ("mm hmm").
- Robustez ante perturbaciones: mantiene precision alta en pruebas de estres con perturbacion y en cadena TTS -> canal telefonico -> ASR.
- Generalizacion a tipos de negocio no vistos durante el entrenamiento.
- Inferencia de baja latencia (milisegundos), apta para bucles de tiempo real.
- Funcionamiento en GPU (bf16) y CPU (fp32).
- No genera texto, no soporta tool calling ni razonamiento multi-paso, no tiene vision ni audio: opera exclusivamente sobre texto ya transcrito.

## Casos de uso

- Control de turnos en agentes telefonicos: el clasificador decide en tiempo real si el agente debe detenerse cuando el llamante empieza a hablar, evitando que el bot pise la intervencion del usuario. Su latencia p50 de 6,9 ms en GPU lo hace viable dentro del bucle de dialogo.
- Supresion de falsos positivos por backchannels: expresiones como "mm hmm" o "si" no deben cortar al agente; el modelo distingue estos solapamientos no interruptivos de una interrupcion real.
- Deteccion de conversacion lateral: cuando el llamante habla con alguien de su entorno (por ejemplo, "honey can you grab the door") en lugar de dirigirse al agente, el modelo puede clasificar el solapamiento segun el contexto.
- Atencion al cliente automatizada: integrado en pipelines de IVR o contact center, permite gestionar conversaciones multi-turno con interrupciones naturales sin perder el hilo de la linea planificada del agente.
- Filtrado previo al LLM: en lugar de invocar al modelo generativo ante cualquier solapamiento, este clasificador barato actua como discriminador y solo activa el LLM cuando hay interrupcion real, reduciendo coste y latencia.
- Evaluacion y monitorizacion de agentes de voz: sirve como componente de referencia para medir la calidad del control de turnos en despliegues y en pruebas A/B.
- Investigacion sobre control de turnos: es util como linea base reproducible (receta fija, encoder variable) para estudios sobre preentrenamiento de encoders en tareas de dialogo hablado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (todos con umbral 0,5 y sin verificacion externa):

| Dataset de evaluacion | Tamano | Accuracy |
|---|---|---|
| Held-out business types A (8 tipos no vistos) | 593 intercambios | 95,11 |
| Held-out business types B (20 tipos no vistos) | 588 intercambios | 92,18 |
| Human-labelled exchanges | 158 | 96,20 |
| Perturbation stress test | 6.258 | 92,01 |
| TTS -> canal telefonico -> ASR | 1.328 | 90,66 |
| Distribution-shift test OOD-10k | 10.888 | 88,82 |
| Real calls, momentos inequivocos con palabras | 278 | 97,50 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 aproximadamente 0,3 GB de pesos; en fp32 aproximadamente 0,6 GB. Con activaciones y overhead, cabe comodamente en menos de 2 GB.
- GPU recomendadas: cualquier GPU moderna sirve; el autor mide la latencia en GPU con bf16. Una RTX 3090, RTX 4090, A100 o H100 son mas que suficientes y quedan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con unos pocos GB de VRAM (por ejemplo GTX 1650 4 GB, RTX 3060 12 GB). Tambien corre en CPU en fp32.
- Opciones de despliegue: la model card usa `transformers` (>=4.51) con el script `predict.py` incluido en el repositorio. Los tags del modelo incluyen `text-embeddings-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con Hugging Face TEI y Inference Endpoints. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: p50 de 6,9 ms en GPU y 37,1 ms en CPU segun el autor, en la misma ejecucion con la que compara con Ettin-150m. No se publica throughput agregado.

## Comparativa con modelos similares

El autor proporciona una comparacion directa con bargein-classifier-ettin-150m, la alternativa recomendada (misma arquitectura, receta, datos y velocidad; solo cambia el checkpoint base).

| Metrica | ModernBERT-base (este modelo) | Ettin-150m (recomendado) |
|---|---|---|
| Tipos de negocio no vistos (12.876, 2 semillas, emparejado) | 96,87 | 96,91 |
| Distribution shift, OOD-10k (10.888) | 89,18 (p = 0,026) | 89,48 |
| Distinguir marcharse de despedirse y volver (123 = 41 x 3 semillas) | 78,0 % | 83,7 % |
| Intercambios etiquetados por humanos (158) | 95,99 | 96,62 |
| Held-out business types A (593) | 94,66 | 95,62 |
| Held-out business types B (588) | 93,31 | 92,80 |
| TTS -> canal telefonico -> ASR (1.328) | 90,84 | 91,42 |
| Llamadas reales: acuerdo con el juez LLM (1.425, semilla 13) | 80,7 | 83,4 |
| Latencia GPU / CPU p50 | 6,9 / 37,1 ms | 6,9 / 37,5 ms |

Como referencia de la familia base, answerdotai/ModernBERT-base (149 M de parametros) es el checkpoint sobre el que se construye este modelo. No se dispone de comparativas con otros clasificadores de barge-in publicos mas alla de la version Ettin del mismo autor.

## Limitaciones y advertencias

- El propio autor lo etiqueta como "comparison baseline, not recommended": existe una alternativa (Ettin-150m) con la misma arquitectura, receta, datos y velocidad que rinde mejor en tipos de negocio no vistos, llamadas con desplazamiento de distribucion y en la distincion entre marcharse y despedirse-y-volver.
- Punto debil destacado: la distincion entre un llamante que se marcha y uno que se despide y vuelve es claramente inferior (78,0 % frente a 83,7 %).
- Sesgo y alcance limitados al ingles: el modelo solo declara soporte para `en`, y esta entrenado sobre datos de dialogos telefonicos del autor, lo que puede sesgar su comportamiento hacia ese dominio.
- Dependencia del formateo: las entradas deben construirse con `format_input.py`; un formato distinto del de entrenamiento degrada la prediccion. Un transcript de llamante vacio debe tratarse como CONTINUE sin llamar al modelo.
- Dependencia del ASR: el modelo consume texto ya transcrito, de modo que los errores de reconocimiento de voz se propagan directamente a la decision de interrupcion. El autor mide este efecto en la prueba TTS -> canal telefonico -> ASR (90,66 % de accuracy).
- Riesgo de alucinacion: no aplica en el sentido generativo, dado que el modelo no produce texto libre; produce una probabilidad. Aun asi, puede haber falsos positivos (cortes indebidos) y falsos negativos (el agente sigue hablando cuando deberia parar).
- Metricas no verificadas: todos los resultados declarados estan marcados como `verified: false` en el model-index.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base (ModernBERT-base) y de los datos de entrenamiento, no detallados en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de adopcion en produccion ni de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ozonetg/bargein-classifier-modernbert-base
- Modelo alternativo recomendado (Ettin-150m): https://huggingface.co/ozonetg/bargein-classifier-ettin-150m
- Demo en vivo: https://huggingface.co/spaces/ozonetg/bargein-classifier-demo
- Coleccion del autor: https://huggingface.co/collections/ozonetg/voice-agent-barge-in-classifier-6ac6e3d41659b866508ea3f0
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Script de formateo de entradas: format_input.py (incluido en el repositorio)
- Script de inferencia: predict.py (incluido en el repositorio)
- Documentacion de ModernBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/modernbert
- Paper de ModernBERT (arXiv:2412.13663): https://arxiv.org/abs/2412.13663
- Paper de R-Drop (arXiv:2106.14448): https://arxiv.org/abs/2106.14448
