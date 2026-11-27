# guard-spec/guardspec-classifier

## Resumen

guardspec-classifier es un clasificador de riesgo de prompt injection y jailbreak de pequeno tamano, desarrollado por el proyecto Guard Spec. No es un modelo generativo: es un clasificador de texto (text-classification) que asigna una probabilidad de riesgo a cada entrada, pensado para actuar como capa L2 de una pasarela de seguridad autohospedada que filtra inyecciones antes de que lleguen al LLM. Se distribuye como modelo ONNX en INT8 (118,5 MB) para CPU y en FP16 (235,6 MB) para GPU, con licencia Apache 2.0.

El modelo parte de `intfloat/multilingual-e5-small`, un encoder BERT multilingue, y se ha afinado especificamente para detectar intentos de manipulacion de instrucciones del sistema. La version v8g es la predeterminada desde Guard Spec v0.11.0 y sustituye a v8e, que queda disponible en una rama para rollback. Su interes actual radica en que ofrece una barrera de seguridad ligera, multilingue (ingles y vietnamita) y desplegable en CPU, sin depender de un LLM generativo para la deteccion.

El modelo cubre un nicho concreto: clasificacion binaria benigno/malicioso con umbral calibrado, integrable en pipelines OpenAI-compatibles mediante la pasarela Guard Spec o de forma autonoma con onnxruntime. Su tamano reducido y su formato ONNX lo hacen adecuado para entornos con recursos limitados o para despliegues en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (base: intfloat/multilingual-e5-small) |
| Parametros totales | no disponible (modelo base e5-small; el autor no declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncado configurado en el tokenizador) |
| Tipos de cuantizacion | INT8 (CPU) y FP16 (GPU) |
| Idiomas soportados | ingles (en), vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model_int8.onnx`, `model_fp16.onnx`) con `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un encoder BERT derivado de `intfloat/multilingual-e5-small`, reentrenado como clasificador binario con dos etiquetas (la etiqueta 0 corresponde a "benigno"). La salida es un logit por etiqueta; la probabilidad de riesgo se obtiene como `1 - sigmoid(logit[0])`. El tokenizador aplica truncado a 256 tokens y padding, y el modelo se ejecuta con onnxruntime (CPUExecutionProvider o CUDAExecutionProvider).

La version v8g parte de la receta de v8e con cinco adiciones al conjunto de entrenamiento (rondas R8b a R8d, brazo EPL2), cada una dirigida a un fallo observado de v8e: 1.573 prompts de persona y sistema empresariales benignos (en y vi) para reducir falsos positivos en role-play; 1.500 ventanas benignas de documentacion tecnica (RFCs, READMEs, paginas man) emparejadas con ventanas del mismo host con payload de ataque, mas 1.000 ventanas de ataque adicionales; 400 ataques con payload dividido en fragmentos ("A = ..., B = ..., haz A + B") y 400 uniones y sumas benignas; y 400 filas benignas con instrucciones negadas o entrecomilladas ("por favor, no ignores las instrucciones anteriores"). Es una de tres semillas (20261107) de un brazo que cumplio todos los criterios preinscritos en cada semilla frente a la banda de tres semillas de v8e; la semilla se eligio por la regla preinscrita de mayor deteccion en eval/data entre las semillas que pasaron. No se detalla en la informacion disponible el volumen total de tokens ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de riesgo de prompt injection y jailbreak por entrada de texto, con salida de probabilidad por etiqueta.
- Deteccion de prompts de persona y rol maliciosos, y reduccion de falsos positivos en prompts de rol benignos.
- Deteccion de ataques con payload dividido en fragmentos que se combinan.
- Manejo de instrucciones negadas o entrecomilladas sin marcarlas como ataque.
- Clasificacion de documentacion tecnica benigna sin bloquearla (RFCs, READMEs, paginas man).
- Soporte multilingue limitado a ingles y vietnamita.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto: es un clasificador, no un LLM.
- Calibracion disponible: `thresholds.json` con `risk_threshold` y `calibration.json` con escalado de Platt; la salida cruda no esta calibrada al umbral 0.85 de la pasarela.

## Casos de uso

- Filtrado previo en pasarelas LLM: integrar el clasificador como capa L2 en Guard Spec para bloquear inyecciones antes de que alcancen el modelo generativo, con verificacion SHA-256 de los pesos en el manifiesto de la pasarela.
- Proteccion de asistentes de atencion al cliente: clasificar cada turno entrante y descartar intentos de manipulacion del system prompt antes de reenviar la conversacion al LLM, con latencia baja por ser un encoder pequeno en INT8.
- Moderacion de entradas en aplicaciones de chat: ejecutar el modelo en CPU con onnxruntime para marcar mensajes de riesgo en tiempo real sin necesidad de GPU.
- Deteccion de jailbreaks en entornos multilingues en/vietnamita: usar la clasificacion binaria para bloquear prompts de role-play maliciosos en ingles y vietnamita.
- Analisis de documentacion y contenido tecnico: aprovechar las ventanas de documentacion benigna del entrenamiento para reducir falsos positivos al clasificar RFCs, READMEs y paginas man en pipelines de ingesta.
- Deteccion de ataques con payload dividido: clasificar fragmentos y combinaciones ("A = ..., B = ..., haz A + B") en sistemas que procesan texto por partes.
- Despliegue en el borde o en VMs pequenas: usar la variante INT8 de 118,5 MB con `DETECTOR_LAYERS=l1,l2` en el quickstart de Guard Spec para entornos con recursos limitados.
- Rollback controlado: cambiar `L2_MODEL=guardspec-classifier@v8e` para volver a la version anterior si v8g introduce regresiones en produccion.

## Benchmarks y rendimiento

El model-index oficial declara la entrada `guardspec-classifier-v8g` con `results: []`, es decir, sin resultados de benchmarks publicados. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas numericas de deteccion o falsos positivos; solo menciona cualitativamente que v8e bloqueaba un 2-3 % de prompts de role-play en ingles frescos y que v8g cumple los criterios preinscritos en cada semilla. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: minima; el modelo INT8 ocupa 118,5 MB y el FP16 235,6 MB en disco, con huella en memoria del orden de cientos de MB.
- GPU recomendadas: cualquiera compatible con CUDAExecutionProvider de onnxruntime; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, cualquier GPU consumer con soporte CUDA para onnxruntime; tambien funciona en CPU sin GPU.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider o CUDAExecutionProvider), la pasarela Guard Spec con Docker Compose v2 y `scripts/quickstart.sh`, y el comando `models pull guardspec-classifier@v8g` (con `-provider cuda` para incluir el FP16).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada. Como referencia estructural, el modelo se apoya en `intfloat/multilingual-e5-small` (encoder BERT multilingue) y compite en la categoria de clasificadores de guardrail ligeros, pero no se aportan cifras de alternativas para una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| guardspec-classifier v8g | no disponible | 256 tokens | Apache 2.0 | ONNX INT8/FP16 | Clasificador en/vi de prompt injection |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion disponible |

## Limitaciones y advertencias

- Solo cubre ingles y vietnamita; no se garantiza deteccion en otros idiomas.
- Contexto truncado a 256 tokens: entradas mas largas se recortan y pueden perder la parte del ataque.
- La salida cruda no esta calibrada al umbral 0.85 de la pasarela; es necesario usar `risk_threshold` de `thresholds.json` o el escalado de Platt de `calibration.json`.
- Riesgo de falsos positivos en prompts de rol, documentacion tecnica y frases negadas o entrecomilladas, aunque v8g incorpora datos para mitigarlo; se recomienda validacion en shadow mode antes de produccion.
- Riesgo de falsos negativos ante ataques novedosos no representados en el entrenamiento; el autor no publica metricas de deteccion ni de falsos positivos.
- No es un LLM: no genera texto ni razona; su unica salida es una clasificacion binaria de riesgo.
- Licencia Apache 2.0 permite uso comercial, pero se debe fijar una revision (`revision=`) en produccion porque `main` cambia de version.
- La version v8f esta marcada como candidata en shadow mode y no validada; no debe usarse en produccion.
- No se detallan sesgos conocidos en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/guard-spec/guardspec-classifier
- Rama v8g: https://huggingface.co/guard-spec/guardspec-classifier/tree/v8g
- Rama v8e (rollback): https://huggingface.co/guard-spec/guardspec-classifier/tree/v8e
- Repositorio Guard Spec: https://github.com/guard-spec/guard-spec
- Quick start de Guard Spec: https://github.com/guard-spec/guard-spec#quick-start
- Documentacion: https://guardspec.io/docs/
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
