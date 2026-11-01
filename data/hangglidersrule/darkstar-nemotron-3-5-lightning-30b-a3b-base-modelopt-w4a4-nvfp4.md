# HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A4-NVFP4

## Resumen

Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A4-NVFP4 es una cuantizacion NVFP4 del checkpoint base nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por el usuario independiente HangGlidersRule bajo el paraguas del proyecto "model-forge". No es un modelo nuevo: es una conversion de pesos sin edicion de comportamiento ("unedited"), generada con NVIDIA ModelOpt 0.48.0rc1 a partir de los pesos BF16 de la revision d468880b. Su interes radica en que ejecuta matematica FP4 real (W4A4) sobre los expertos MoE en GPUs Blackwell, de modo que vLLM selecciona su kernel FP4 MoE sin flags ni parches adicionales.

El modelo hereda la arquitectura Nemotron-H hibrida (Mamba + atencion + MoE) del modelo base, con 128 expertos enrutados por capa en 23 capas MoE y un experto compartido por capa. La cuantizacion afecta a 5.934 capas lineales (proyecciones up y down de expertos y del experto compartido); el router, las proyecciones y convoluciones Mamba, la atencion, el lm_head, los embeddings, las normas y la cabeza MTP permanecen en BF16, igual que la cache KV. El checkpoint ocupa 21,4 GiB en 4 shards.

La relevancia es practica: segun la model card, el prefill corre entre 1,45x y 1,72x mas rapido que la variante W4A16 de la misma familia sobre el kernel por defecto de vLLM, a costa de un empeoramiento de calidad medido como divergencia KL frente a BF16 (0,0246 frente a 0,0189). Es, por tanto, una pieza orientada a despliegues en produccion sobre hardware Blackwell donde el throughput de prefill con prompts largos es el cuello de botella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H hibrida (Mamba + atencion + MoE), tag `nemotron_h` |
| Parametros totales | 17.996.368.448 (segun safetensors; el nombre comercial indica 30B-A3B) |
| Parametros activos | no disponible (el nombre indica A3B, no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos MoE (pesos y activaciones FP4 E2M1, grupo 16, escalas de bloque FP8 E4M3); resto del modelo en BF16 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors (4 shards, 21,4 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia Nemotron-H: combina capas Mamba con capas de atencion y capas MoE con 128 expertos enrutados mas un experto compartido. Esta version no reentrena ni modifica el comportamiento: es una cuantizacion post-entrenamiento. La receta de ModelOpt (`nvfp4_experts_w4a4_act_headroom-kv_bf16`) aplica FP4 E2M1 a pesos y activaciones de las proyecciones up y down de los expertos en las 23 capas MoE, con escalas de peso estaticas obtenidas mediante un barrido MSE de escalas FP8.

La calibracion uso 1.024 textos de hasta 2.048 tokens (semilla 1234): 512 articulos de `abisee/cnn_dailymail` 3.0.0 y 512 conversaciones de `nvidia/Nemotron-Post-Training-Dataset-v2` (128 de chat, 128 de STEM, 128 de matematicas y 128 de codigo), renderizadas con la plantilla de chat del propio modelo. Un detalle tecnico destacable: las escalas de activacion calibradas originalmente recortaban activaciones grandes en la proyeccion down de los expertos enrutados (rango 0,12-0,42x del maximo BF16), lo que producia una KL de 0,0795. El autor las sustituyo por una escala global por flujo de activacion (69 flujos) elegida por minimo error NVFP4 simulado sobre 256 filas de calibracion (229.027 tokens), regla que gano una comparacion pre-registrada de cuatro reglas y redujo la KL un 69,3%.

## Capacidades

- Generacion de texto conversacional y continuacion de texto (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo "thinking": la evaluacion GPQA se ejecuto con thinking activado y parser `nemotron_v3`.
- Razonamiento matematico y STEM, segun la composicion del dataset de calibracion (bloques de math y stem).
- Generacion de codigo, igualmente reflejado en el dataset de post-entrenamiento usado.
- Decodificacion especulativa mediante la cabeza MTP (multi-token prediction) del modelo base, conservada en BF16.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Capacidades de agente multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Vision o audio: no disponible en la informacion (el pipeline declarado es solo texto).

## Casos de uso

- Inferencia de alta concurrencia con prompts largos: el modelo logra 56.283 tok/s de prefill a concurrencia 8 con prompts de ~3k tokens y 37.308 tok/s con prompts de ~50k tokens, por lo que encaja en servicios de resumen o analisis de documentos extensos donde el coste dominante es el prefill.
- Despliegue en GPUs Blackwell con vLLM estandar: al ejecutar FP4 real en los expertos, vLLM elige su kernel FP4 MoE sin flags ni parches, lo que simplifica el pipeline de serving y evita builds personalizados.
- Razonamiento cientifico y STEM asistido: con modo thinking y hasta 65.536 tokens de generacion, es adecuado para preguntas de nivel GPQA, analisis de problemas tecnicos y explicaciones paso a paso.
- Generacion y revision de codigo en pipelines internos: el modelo base fue post-entrenado con datos de codigo y la cuantizacion preserva el lm_head y la atencion en BF16, lo que limita el deterioro en tareas de sintaxis estricta.
- Chat multi-turno con plantilla propia: la calibracion incluyo conversaciones renderizadas con la plantilla del modelo, de modo que el formato conversacional nativo esta contemplado en la distribucion de activaciones.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia W4A4 frente a la build W4A16 de la misma familia, con metricas publicadas de KL, GPQA y throughput para reproducir experimentos.
- Prototipado en una unica RTX PRO 6000 Blackwell: el checkpoint de 21,4 GiB cabe en los 96 GB de esa GPU junto con cache KV en BF16, lo que permite montar un entorno de pruebas completo en una sola tarjeta.

## Benchmarks y rendimiento

| Metrica | Valor | Base |
|---|---|---|
| GPQA Diamond | 130/198 (65,7%) | denominador completo; 15 no parseables, 9 truncados sin respuesta, 4 peticiones no conectadas |
| GPQA, BF16 upstream | 138/198 y 141/198 (dos ejecuciones) | banda de ruido de 11,9 preguntas entre ambas |
| GPQA, build W4A16 | 136/198 (68,7%) | mismo harness |
| Delta GPQA vs W4A16 | -6 preguntas (IC 95% -0,086 a +0,025); -3 sobre los 194 items respondidos | barra pre-registrada -0,060: PASS |
| KL next-token vs BF16 | 0,0246; acuerdo top-1 94,28% | 64 prompts held-out, 37.727 posiciones |
| KL, otras builds | W4A16 0,0189; W4A16 con W4A4 en runtime (FlashInfer b12x) 0,0358; escalas calibradas 0,0795 | mismos prompts |
| Prefill, prompts ~3k tokens | 46.463 tok/s a c=1 (TTFT 61,5 ms); 56.283 tok/s a c=8 | W4A16: 30.002 / 32.761; W4A16 en b12x: 40.077 / 44.633 |
| Prefill, prompts ~50k tokens | 36.387 tok/s a c=1 (TTFT 1.375 ms); 37.308 tok/s a c=8 | W4A16: 25.015 / 25.252; W4A16 en b12x: 31.250 / 31.883 |
| Aceleracion vs W4A16 | 1,45-1,72x (en b12x: 1,16-1,26x) | cuatro celdas de prefill anteriores |

El resto de la tabla de evaluacion de la model card (decode tok/s con decodificacion especulativa MTP) aparece truncado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 21,4 GiB, por lo que la inferencia requiere al menos ~24 GB de VRAM contando cache KV en BF16 y overhead del runtime; la cifra exacta depende de la longitud de contexto.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (SM120), la unica plataforma validada en la model card. Requiere GPU Blackwell para que el kernel FP4 MoE de vLLM se active; en generaciones anteriores el W4A4 no se ejecutaria de forma nativa.
- Cabe en GPU consumer: no disponible; no se documenta compatibilidad con RTX 4090 u otras arquitecturas no Blackwell.
- Opciones de despliegue: vLLM v0.32.0 con kernel MoE por defecto (unico runtime documentado). No se mencionan llama.cpp, Ollama ni TGI, y el formato NVFP4 de ModelOpt no es compatible con ellos de forma directa.
- Latencia y throughput: TTFT de 61,5 ms a c=1 con prompts de ~3k tokens y 1.375 ms con prompts de ~50k tokens; prefill de 46.463-56.283 tok/s segun concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | GPQA | KL vs BF16 | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Darkstar Nemotron 3.5 Lightning W4A4 NVFP4 (este) | 17.996.368.448 | W4A4 NVFP4 expertos, resto BF16 | no disponible | 65,7% | 0,0246 | openmdw-1.1 | safetensors |
| Darkstar Nemotron 3.5 Lightning W4A16 NVFP4 | mismo base | W4A16 NVFP4 | no disponible | 68,7% | 0,0189 | openmdw-1.1 | safetensors |
| NVIDIA Nemotron-3.5-Lightning-30B-A3B BF16 (upstream) | mismo base | BF16 | no disponible | 69,7%-71,2% (dos ejecuciones) | referencia | no disponible | safetensors |

La comparativa se limita a las builds de la misma familia porque la informacion proporcionada no incluye datos de modelos de otros desarrolladores.

## Limitaciones y advertencias

- Perdida de calidad medible: la KL de 0,0246 frente a BF16 es un 30% superior a la de la build W4A16 (0,0189), y el GPQA cae 6 preguntas respecto a esa build. La propia model card recomienda la W4A16 cuando prima la calidad sobre la velocidad de prefill.
- Dependencia de hardware Blackwell: el W4A4 real solo se aprovecha en GPUs SM120; en otras plataformas el rendimiento y la correccion del kernel no estan documentados.
- Naturaleza no oficial: es una cuantizacion de un tercero (HangGlidersRule), no publicada por NVIDIA; no hay garantias de soporte ni de validacion por parte del autor del modelo base.
- Riesgo de alucinacion: inherente al modelo base; la cuantizacion agresiva de activaciones puede amplificarlo en dominios fuera de la distribucion de calibracion (CNN/DailyMail y Nemotron-Post-Training-Dataset-v2).
- Cobertura de calibracion limitada: 1.024 textos de hasta 2.048 tokens; el comportamiento con contextos muy largos o idiomas distintos del ingles no esta evaluado.
- Idiomas: no se declara lista de idiomas soportados; el dataset de calibracion es predominantemente ingles.
- Licencia openmdw-1.1: es una licencia con terminos propios; conviene revisar el texto enlazado antes de uso comercial. La model card la etiqueta como `other`.
- Sin datos de benchmarks estandar: no hay MMLU, HumanEval ni GSM8K publicados; la unica evaluacion de calidad es GPQA Diamond y la KL.
- Repositorio con muy poca traccion (187 descargas, 0 likes) y creado en octubre de 2026: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A4-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Build W4A16 de la misma familia: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3.5-Lightning-30B-A3B-Base-ModelOpt-W4A16-NVFP4
- Source card: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/model-card/base-w4a4-nvfp4.md
- Family record: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/README.md
- Build recipe: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/nemotron-3.5-lightning/darkstar-nemotron-3.5-lightning-30b-a3b-base-modelopt-w4a4-nvfp4.yaml
- Gate results: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3.5-lightning-r1/results/w4a4-gate-summary.json
- Campaign issue: https://github.com/HangGlidersRule/model-forge/issues/17
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
