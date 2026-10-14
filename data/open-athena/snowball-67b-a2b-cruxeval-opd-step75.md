# open-athena/Snowball-67B-A2B-CruxEval-OPD-Step75

## Resumen

Snowball-67B-A2B-CruxEval-OPD-Step75 es un checkpoint de investigacion publicado por el colectivo open-athena dentro del ecosistema Marin. Se trata del modelo "estudiante" B del experimento de destilacion on-policy (OPD) de un solo experto, obtenido al destilar el comportamiento de un experto E sobre el conjunto de 1.600 prompts de CruxEval. No es un modelo de proposito general afinado para produccion, sino un artefacto de investigacion para estudiar tecnicas de destilacion sobre modelos de mezcla de expertos (MoE).

Arquitectonicamente deriva del modelo base Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 y conserva su tokenizador, su plantilla de chat y su estructura de pesos. La nomenclatura "67B-A2B" y la etiqueta grug_moe indican una arquitectura de mezcla de expertos con aproximadamente 67.000 millones de parametros totales y unos 2.000 millones de parametros activos por token. El repo ocupa 134,2 GB y los pesos se distribuyen en shards safetensors en formato HuggingFace.

Su relevancia es fundamentalmente metodologica: documenta una receta reproducible de destilacion on-policy con KL inversa muestreada sobre tokens elegidos, cuatro rollouts por prompt y sin verificador, ejecutada con MarinSkyRL sobre Megatron y evaluada con Evalchemy. Es interesante para quien investiga destilacion, mezclas de expertos y pipelines de RL con recompensas verificables, mas que para despliegues de producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, segun la etiqueta grug_moe y la nomenclatura del modelo; detalles internos no disponibles |
| Parametros totales | 67.078.882.816 (unos 67B) |
| Parametros activos | Aproximadamente 2B, inferido de la nomenclatura "A2B"; no confirmado en documentacion explicita |
| Longitud de contexto | 32.768 tokens (configuracion usada en la evaluacion); maximo no documentado |
| Tipos de cuantizacion | no disponible (distribucion en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el tokenizador es el del modelo base B) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (shards en formato HuggingFace, con config.json, generation_config.json, tokenizer y chat_template.jinja) |

## Arquitectura y entrenamiento

El modelo es un MoE derivado del checkpoint base Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (commit fdc3c3c5), que actua como estudiante B. La receta de entrenamiento es de destilacion on-policy: el estudiante genera cuatro rollouts por prompt y se optimiza con KL inversa muestreada sobre los tokens elegidos frente al experto E, sin verificador, sobre los 1.600 prompts de CruxEval. El entrenamiento se realizo con MarinSkyRL sobre Megatron, con AdamW a tasa de aprendizaje 1e-6, betas 0.9/0.999 y bias del router congelado, procesando 64 prompts por actualizacion.

El plan preveia 100 actualizaciones y el checkpoint publicado corresponde a la actualizacion 75 (epoch-3), seleccionado despues de que la ultima actualizacion cayera en una direccion. La infraestructura empleo cuatro nodos H100x8 para el learner, uno para rollout y uno para teacher, con un coste acumulado de 286,9 horas-H100 hasta este checkpoint y 376,4 horas-H100 para la ejecucion completa. Los pesos se exportaron sin modificaciones desde el job de entrenamiento (export global_step_75/policy) y se subieron tal cual a HuggingFace.

## Capacidades

- Generacion de texto y razonamiento de tipo cadena de pensamiento: la evaluacion se ejecuta con "thinking on" y un limite de generacion de 30.720 tokens.
- Razonamiento matematico: obtiene 90,4 en MATH500 y 92,5 en GSM8K bajo el evaluador congelado.
- Razonamiento simbolico y de ejecucion de codigo: 79,6 / 75,2 en CruxEval (media de dos pasadas).
- Destilacion orientada a tareas: el ajuste esta centrado en el dominio de CruxEval mediante destilacion del experto E.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad explicitamente documentada.
- Capacidades multilingues: no disponibles; el tokenizador procede del modelo base y no se documentan idiomas.
- Capacidades especiales: modo de pensamiento (thinking) activado en la evaluacion; no se documentan vision ni audio.

## Casos de uso

- Investigacion en destilacion on-policy: el modelo sirve como referencia reproducible para estudiar KL inversa muestreada, numero de rollouts y congelacion del router en modelos MoE, partiendo de la receta documentada en el informe del experimento.
- Reproducibilidad de pipelines RLVR: permite replicar el flujo MarinSkyRL + Megatron + Evalchemy con las mismas condiciones de evaluacion (contexto de 32.768 tokens, thinking on, temperatura 1.0) y comparar contra el checkpoint base.
- Analisis de destilacion de un solo experto: util para medir como se transfiere el comportamiento de un teacher E a un estudiante B sobre un conjunto acotado de 1.600 prompts.
- Evaluacion de razonamiento matematico: con 92,5 en GSM8K y 90,4 en MATH500, es adecuado para probar mejoras de razonamiento en problemas de nivel escolar y de competicion dentro de un entorno de investigacion.
- Evaluacion de razonamiento simbolico y de codigo: CruxEval mide ejecucion mental de fragmentos de codigo, por lo que sirve para analizar esta habilidad concreta frente al modelo base.
- Estudio de eficiencia de MoE: al tener ~67B totales y ~2B activos (segun nomenclatura), es un banco de pruebas para analizar el equilibrio entre memoria y computo por token en tareas de razonamiento.
- Comparacion de checkpoints intermedios: el step 75 frente al step 92 del base permite estudiar la evolucion del entrenamiento y el efecto de detener en un punto concreto del plan de 100 actualizaciones.

## Benchmarks y rendimiento

Evaluador congelado: Evalchemy (commit ae362881), vLLM sobre H100x8, contexto de 32.768 tokens, limite de generacion de 30.720 tokens, thinking activado, muestreo sin semilla a temperatura 1.0.

| Benchmark | Resultado |
|---|---|
| CruxEval (media de dos pasadas) | 79,6 / 75,2 |
| GSM8K | 92,5 |
| MATH500 | 90,4 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos para estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 134 GB solo para pesos (el repo ocupa 134,2 GB), mas activaciones y cache KV.
- VRAM estimada a 8 bits: aproximadamente 67 GB de pesos.
- VRAM estimada a 4 bits: aproximadamente 35-40 GB de pesos, mas overhead.
- GPU recomendadas: nodos H100x8 (configuracion usada en entrenamiento y evaluacion); alternativas de clase A100 80 GB en configuraciones multi-GPU.
- En GPU de consumidor: no cabe en bf16 en una sola GPU de 24 GB. Con cuantizacion agresiva podria acercarse, pero no esta documentado ni es un escenario previsto por el autor.
- Opciones de despliegue: vLLM (empleado en la evaluacion), Megatron (usado en entrenamiento); otros runners como llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponible. Al ser un MoE con ~2B parametros activos, el coste de computo por token es inferior al de un denso de 67B, pero la memoria requerida sigue siendo la del total de parametros.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Snowball-67B-A2B-CruxEval-OPD-Step75 (este modelo) | 67,1B | ~2B | 32.768 tokens (evaluacion) | apache-2.0 | HuggingFace |
| Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (modelo base / estudiante B) | 67,1B (misma familia) | ~2B | no disponible | apache-2.0 | HuggingFace |
| Otros modelos MoE comparables (por ejemplo, familias tipo Mixtral o Qwen-MoE) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de benchmarks de terceros que permitan una comparacion directa y verificable con este checkpoint.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados especificamente; al derivar del modelo base B, hereda los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: el modelo se evaluo con thinking activado y muestreo sin semilla a temperatura 1.0, lo que favorece variabilidad; se desconoce su comportamiento fuera de CruxEval, GSM8K y MATH500.
- Limitaciones de contexto: el maximo de contexto no esta documentado; solo se especifica el uso de 32.768 tokens en la evaluacion. Generaciones por encima de ese margen no estan validadas.
- Limitaciones de idioma: no se declaran idiomas soportados; el tokenizador es el del modelo base y no hay validacion multilingue.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, pero el modelo se publica como artefacto de investigacion sin garantias de calidad de producto.
- Caveat de produccion: es un checkpoint intermedio de un experimento (step 75 de 100), seleccionado tras una caida del entrenamiento en una direccion; no esta pensado como modelo final.
- Especializacion: el ajuste esta concentrado en el dominio de CruxEval mediante destilacion del experto E, por lo que el rendimiento fuera de ese dominio puede degradarse.
- Despliegue: al no publicarse cuantizaciones ni guias de servido mas alla de vLLM y Megatron, integrarlo en produccion requiere trabajo adicional de conversion y validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-CruxEval-OPD-Step75
- Modelo base (estudiante B): https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92
- Commit del modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Informe del experimento: https://github.com/marin-community/marin/issues/9920#issuecomment-6076348127
- Issue del proyecto Marin: https://github.com/marin-community/marin/issues/9920
- Evaluador Evalchemy (commit): https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- Registro de entrenamiento W&B: marin-community/skyrl, run p3ie2bg7 (URL no proporcionada)
