# open-athena/Snowball-67B-A2B-CruxEval-Plain-SFT-Step399

## Resumen

El modelo Snowball-67B-A2B-CruxEval-Plain-SFT-Step399 es un checkpoint experimental de la familia Snowball, desarrollado por el equipo open-athena dentro del proyecto Marin. Consiste en un ajuste fino supervisado (SFT) sobre el modelo base open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92, que actua como "estudiante B" en un experimento de destilacion de un unico experto. El objetivo es medir en que grado un modelo grande puede adquirir una tarea concreta a partir de las demostraciones de un unico experto.

El modelo cuenta con 67.078.882.816 parametros totales y sigue una arquitectura de mezcla de expertos (MoE), identificada por la etiqueta grug_moe. La nomenclatura A2B del nombre sugiere un numero reducido de parametros activos por token, si bien este dato no queda confirmado en la informacion disponible. El entrenamiento consistio en 4 epochs sobre la primera muestra del experto E para cada uno de los 1.600 prompts de CruxEval, tanto correctas como incorrectas.

Su relevancia es fundamentalmente de investigacion: sirve como artefacto reproducible para estudiar destilacion de un solo experto y aporta resultados medibles en CruxEval (73,9 / 72,0), GSM8K (94,0) y MATH500 (92,6). Se distribuye con licencia Apache 2.0 en formato safetensors y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), etiqueta grug_moe |
| Parametros totales | 67.078.882.816 (67,08B) |
| Parametros activos | Aproximadamente 2B segun la nomenclatura A2B del nombre; no confirmado en la informacion disponible |
| Longitud de contexto | No disponible de forma explicita; la evaluacion se realizo con 32.768 tokens de contexto y un limite de generacion de 30.720 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (multiples shards), config.json, generation_config.json, ficheros de tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos bajo la etiqueta grug_moe, con router y sesgo de router entrenables en el modelo base, aunque en esta receta el sesgo del router permanece congelado. El modelo base es un Snowball de 67B con 10T de tokens y una etapa previa de RLVR (Mixed-RLVR-Sync, step 92), del que este checkpoint hereda sin cambios el tokenizer y la plantilla de chat (chat_template.jinja).

El ajuste fino se ejecuto con el framework Levanter sobre 32 GPU H100, con un coste total de 61,6 horas-GPU H100. La receta emplea AdamW con learning rate 1e-6, betas 0,9/0,999, weight decay 0, gradient clipping de 1,0, 4 epochs (400 actualizaciones de batch 16) y el sesgo del router congelado. Los datos de entrenamiento son de destilacion: la primera muestra generada por el experto E para cada uno de los 1.600 prompts de CruxEval, incluyendo tanto las respuestas correctas como las incorrectas, sin filtrado por acierto.

## Capacidades

- Generacion de texto y razonamiento general en el marco del modelo base Snowball de 67B.
- Razonamiento y ejecucion de codigo Python, evaluado especificamente en CruxEval.
- Razonamiento matematico de nivel competitivo: GSM8K y MATH500 por encima del 92 por ciento.
- Modo "thinking" activable; las evaluaciones se realizaron con el modo de razonamiento activado.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales de vision o audio: no disponibles.

## Casos de uso

- Investigacion en destilacion de un unico experto: el checkpoint permite reproducir el brazo "plain SFT" del experimento de destilacion single-expert y compararlo con otras variantes (por ejemplo, con filtrado por correccion), aislando el efecto de entrenar sobre muestras correctas e incorrectas.
- Evaluacion reproducible de CruxEval: al fijarse el evaluador (Evalchemy, commit ae362881), el contexto de 32.768 tokens y el limite de generacion de 30.720 tokens, el modelo sirve como referencia estable para medir razonamiento sobre ejecucion de codigo Python.
- Generacion asistida de codigo Python: su rendimiento en CruxEval y MATH500 lo hace utilizable para tareas controladas de sintesis y razonamiento de codigo dentro de pipelines internos, siempre con validacion humana.
- Razonamiento matematico: con 94,0 en GSM8K y 92,6 en MATH500, resulta adecuado para prototipos de resolucion de problemas matematicos paso a paso en entornos de investigacion.
- Punto de partida para RLVR u otras etapas de alineamiento: al derivar de un modelo base ya sometido a RLVR, este checkpoint puede reutilizarse como inicializacion para nuevos ciclos de refinamiento.
- Analisis de olvido catastrofico: al ser un SFT muy estrecho (1.600 prompts, una unica tarea), permite estudiar empiricamente la perdida de capacidades generales tras un ajuste especializado.
- Validacion de despliegue de arquitecturas MoE personalizadas: sirve para probar el soporte de grug_moe en runtimes como vLLM en configuraciones multi-GPU H100.

## Benchmarks y rendimiento

Resultados publicados por el autor, obtenidos con el evaluador congelado Evalchemy (commit ae362881), vLLM sobre 8x H100, contexto de 32.768 tokens, limite de generacion de 30.720 tokens, modo thinking activado y muestreo sin semilla a temperatura 1,0.

| Benchmark | Resultado |
|---|---|
| CruxEval | 73,9 / 72,0 (media de dos pasadas) |
| GSM8K | 94,0 |
| MATH500 | 92,6 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Pesos en precision de 16 bits: aproximadamente 134 GB, coherente con el tamano del repositorio (134,2 GB). Requiere como minimo 2 GPU de 80 GB y se recomienda 4 para dejar margen a la cache KV y a la activacion del MoE.
- Pesos en 8 bits (estimacion derivada del numero de parametros): aproximadamente 67 GB, desplegables en una unica GPU de 80 GB (H100 o A100 80 GB).
- Pesos en 4 bits (estimacion derivada del numero de parametros): aproximadamente 34 GB, por encima de los 24 GB de una RTX 4090. No cabe en una GPU de consumo de 24 GB sin offloading a CPU o sin cuantizaciones mas agresivas.
- GPU recomendadas: H100 80 GB y A100 80 GB para precision completa en 16 bits; A100 40 GB o configuraciones multi-GPU para cuantizaciones de 8 y 4 bits.
- Despliegue: vLLM fue el runtime utilizado en la evaluacion oficial (H100x8). El soporte en llama.cpp, Ollama o TGI depende de que estos incluyan la arquitectura grug_moe, algo no confirmado en la informacion disponible.
- Entrenamiento: la receta se ejecuto en 32 H100 con un coste de 61,6 horas-GPU H100.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de rendimiento de modelos comparables de la misma categoria. El unico punto de referencia directo es el propio modelo base.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Snowball-67B-A2B-CruxEval-Plain-SFT-Step399 | 67,08B | No disponible (evaluado a 32.768 tokens) | Apache 2.0 | HuggingFace |
| Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (base) | No disponible | No disponible | No disponible | HuggingFace |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ajuste extremadamente estrecho: el SFT se realizo sobre solo 1.600 prompts de una unica tarea (CruxEval), lo que eleva el riesgo de sobreajuste y de olvido catastrofico de capacidades generales del modelo base.
- Datos sin filtrar por correccion: las demostraciones del experto E incluyen respuestas incorrectas, por lo que el modelo puede haber interiorizado patrones erroneos.
- Ausencia de etapa de alineamiento en esta receta: no se documenta RLHF ni DPO especifico para este checkpoint; la alineamiento previo proviene unicamente del modelo base.
- Riesgo de alucinacion: al ser un modelo de generacion libre sin salvaguardas especificas documentadas, puede producir contenido plausible pero incorrecto, especialmente en dominios fuera de CruxEval.
- Idiomas: no se especifica la cobertura linguistica; la tarea de entrenamiento es de codigo, lo que apunta a un sesgo hacia el ingles y el Python.
- Arquitectura personalizada: la familia grug_moe puede no estar soportada por los runtimes de inferencia mas comunes, lo que limita su despliegue directo en produccion.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales documentadas, pero no se ofrecen garantias sobre el modelo.
- Madurez: es un artefacto experimental con 0 descargas y 0 interacciones, sin senales de adopcion ni mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-CruxEval-Plain-SFT-Step399
- Modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92
- Commit del modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Evaluador Evalchemy (commit): https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- Informe del experimento: https://github.com/marin-community/marin/issues/9920#issuecomment-6076348127
- Issue del proyecto Marin: https://github.com/marin-community/marin/issues/9920
