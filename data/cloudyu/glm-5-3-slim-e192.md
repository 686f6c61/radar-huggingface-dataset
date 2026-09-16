# cloudyu/GLM-5.3-SLIM-E192

## Resumen

GLM-5.3-SLIM-E192 es una variante podada del modelo MoE GLM-5.3 de zai-org, publicada por el usuario cloudyu en HuggingFace. Se trata de un proceso de *expert pruning* sobre las capas MoE: de los 256 expertos enrutados originales se conservan 192 por capa, mientras que la atencion (MLA + DSA), los expertos compartidos, las capas densas, los embeddings, el router, el tokenizador, la plantilla de chat y el formato de pesos FP8 block-128 permanecen identicos al modelo base. El checkpoint pesa 564 GB frente a los 756 GB del original, una reduccion del 25 % en el tamaño de los pesos de expertos.

El objetivo declarado es abaratar el despliegue sin degradar las capacidades que su autor considera criticas: codigo, ciberseguridad, tool calling / agentes y matematicas. Con 66 GiB de pesos por GPU en TP=8, el modelo cabe en un nodo de 8 x H100-80GB, cosa que el original no consigue (88 GiB por GPU). Ademas, el autor reporta un aumento del 58 % en throughput agregado (~950 tok/s frente a ~600 tok/s) en una configuracion de 4 x B300 con TP=4.

Es relevante ahora porque ataca el cuello de botella practico de los MoE de gran tamaño: el coste de memoria y de lectura de pesos por token generado. El precio a pagar es un deterioro medible en conocimiento enciclopedico en chino (C-Eval -7,3 puntos) y una perdida menor en razonamiento cientifico (GPQA-Diamond -3,6 puntos). El modelo declara 562.153.591.104 parametros totales en safetensors y mantiene el rango posicional de 1.048.576 tokens del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (glm_moe_dsa) con atencion MLA + DSA, expertos enrutados y expertos compartidos |
| Parametros totales | 562.153.591.104 (~562 B) |
| Parametros activos | no disponible |
| Longitud de contexto | Rango posicional de 1.048.576 tokens en la configuracion; servido y validado a 73.728 tokens |
| Tipos de cuantizacion | FP8 block-128 (formato de pesos nativo); no se documentan otras cuantizaciones |
| Idiomas soportados | en, zh |
| Licencia | other (license_name: glm-5.3) |
| Formato de pesos | safetensors (FP8 block-128) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con atencion MLA (Multi-head Latent Attention) combinada con DSA, capas densas, expertos compartidos y un router. La unica modificacion respecto al modelo base es el numero de expertos enrutados por capa MoE: 192 en lugar de 256, lo que reduce un 25 % el volumen de pesos de expertos. El autor subraya que el resto de componentes no se toca, por lo que se trata de un reemplazo directo: mismo tokenizador, misma plantilla de chat, mismo formato de tool calls, mismos niveles de `reasoning_effort` (`low` / `high` / `max`) y mismo comportamiento de alineamiento.

No se documenta en la informacion disponible el proceso de creacion del checkpoint (criterio de seleccion de expertos, si hubo recalibracion del router, ni si se realizo entrenamiento de recuperacion posterior al podado), ni el volumen de tokens de entrenamiento del modelo base, ni la composicion del dataset, ni si hubo RLHF o DPO. Los datos publicados se limitan a la comparacion A/B frente a `zai-org/GLM-5.3` con el mismo harness y la misma build de vLLM.

Un detalle tecnico relevante es que 192 es multiplo de 4 y de 8, lo que permite a vLLM usar la ruta rapida FlashInfer TRT-LLM para MoE en FP8 sin recurrir a kernels de respaldo. Los pesos FP8 block-128 exigen GPUs de clase Hopper o Blackwell, igual que el modelo original.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento con modo de pensamiento explicito (`<think>`), con presupuesto controlable por peticion mediante `reasoning_effort` (`low`, `high`, `max`).
- Generacion y comprension de codigo (HumanEval pass@1 del 95,1 % segun el autor).
- Matematicas y razonamiento cuantitativo (AIME 2025 pass@1 del 88,3 % con `high` y 65 K de presupuesto de pensamiento).
- Conocimiento en ciberseguridad evaluado con CyberMetric (87,7 % en 1.000 preguntas de opcion multiple).
- Tool calling / function calling con salida estructurada `tool_calls` en formato GLM (`<tool_call>` / `<arg_key>`), verificado con BFCL v4.
- Uso como agente y razonamiento multi-turno (BFCL v4 multi-turn base 72,5 %).
- Control de rechazo ante peticiones daninas, con tasa de rechazo reportada del 76 % en prompts daninos y 0 % en benignos.
- No se documentan capacidades de vision, audio ni multimodalidad en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en ingles y chino: el modelo gestiona conversaciones multi-turno con una ventana posicional de hasta 1.048.576 tokens (servida a 73.728), lo que permite mantener historiales largos y documentacion de producto en el contexto sin truncar.
- Agentes con tool calling en produccion: al exponer `tool_calls` estructurados mediante `--tool-call-parser glm47`, se puede integrar directamente en orquestadores que invocan APIs, bases de datos o servicios internos sin parseo ad hoc de texto libre.
- Asistente de programacion y revision de codigo: con un 95,1 % en HumanEval pass@1 manteniendo el rendimiento del modelo original, es adecuado para autocompletado, generacion de tests y revisiones automatizadas en pipelines de CI/CD.
- Analisis de seguridad y triaje de ciberseguridad: su rendimiento en CyberMetric (87,7 %) permite usarlo para clasificar alertas, explicar vulnerabilidades y generar resumenes de incidentes, con la cautela de que la reduccion de expertos puede afectar a conocimiento muy especializado.
- Razonamiento matematico y resolucion de problemas paso a paso: el modo `reasoning_effort=high` con presupuesto de hasta 65 K tokens es util para tutoria, verificacion de calculos y generacion de problemas resueltos.
- Despliegue en infraestructura de 8 x H100-80GB: es el escenario que el original no cubre; con 66 GiB de pesos por GPU queda espacio para cache KV, lo que habilita servir un modelo de clase GLM-5.3 en nodos de 80 GB.
- Servicio de alto rendimiento con muchos usuarios concurrentes: en 4 x B300 con TP=4 el autor reporta ~950 tok/s agregados, adecuado para colas de inferencia con mezcla de peticiones de razonamiento largo.
- Procesamiento de documentos largos en chino e ingles: la ventana de contexto permite analisis de contratos, informes tecnicos o expedientes completos, aunque el conocimiento enciclopedico en chino es precisamente el area donde el podado degrada mas el rendimiento.

## Benchmarks y rendimiento

Resultados publicados por el autor, obtenidos con la misma build de vLLM y los mismos ajustes de muestreo en una comparacion A/B contra `zai-org/GLM-5.3`. Los valores absolutos dependen del harness y del presupuesto de razonamiento, y no son directamente comparables con los de la model card oficial.

| Benchmark | Ajuste | GLM-5.3 | GLM-5.3-SLIM-E192 | Delta |
|---|---|---|---|---|
| HumanEval pass@1 | greedy, `reasoning_effort=low` | 95,1 % | 95,1 % | 0 |
| CyberMetric (1.000 MCQ) | greedy, low | 88,0 % | 87,7 % | -0,3 |
| BFCL v4 — live AST | OpenAI-FC handler, low | 69,6 % | 69,4 % | -0,2 |
| BFCL v4 — multi-turn base | OpenAI-FC handler, low | 73,0 % | 72,5 % | -0,5 |
| BFCL v4 — non-live AST | OpenAI-FC handler, low | 39,1 % | 39,7 % | +0,6 |
| AIME 2025 pass@1 (media de 4) | T=1,0 / top-p 0,95, high, 65 K | 90,8 % | 88,3 % | -2,5 |
| GPQA-Diamond | T=1,0 / top-p 0,95, high, 65 K | 86,9 % | 83,3 % | -3,6 |
| C-Eval (1.606 MCQ, zh) | greedy, low | 92,0 % | 84,7 % | -7,3 |
| Tasa de rechazo — prompts daninos / benignos | greedy, low | 74 % / 2 % | 76 % / 0 % | sin cambios |

Perplejidad de siguiente token en conjuntos reservados frente al original: codigo +1,0 %, ciberseguridad +0,8 %, chat en ingles +4,7 %, chino +7,3 %.

Segun el autor, las diferencias en codigo, ciberseguridad, tool calling y matematicas caen dentro del ruido entre ejecuciones (el propio original oscila ±1-2 puntos en HumanEval y BFCL). La perdida en GPQA-Diamond se considera real (7 preguntas) y la caida en C-Eval se presenta como una concesion deliberada. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Pesos en FP8: 564 GB en total. En TP=8 suponen 66 GiB de pesos por GPU; en TP=4, 132 GiB por GPU.
- El formato FP8 block-128 exige GPUs de clase Hopper (H100, H200) o Blackwell (B200, B300). No es ejecutable en GPUs consumer.
- Configuracion minima validada: un nodo de 8 x H100-80GB con TP=8, con un presupuesto de cache KV modesto. El modelo original no cabe en ese nodo (88 GiB por GPU).
- Configuraciones recomendadas: 4 x B300 (275 GB por tarjeta) o 4 x B200 (192 GB) con TP=4, donde quedan 44 GiB adicionales por GPU para cache KV; tambien valido en H200 de 141 GB con TP=4 y presupuesto de KV ajustado.
- No cabe en GPUs de consumo (RTX 4090, 5090, etc.) ni en configuraciones multi-GPU de gama alta para consumo, ni por tamaño ni por requisitos de FP8.
- Despliegue: vLLM 0.25.1 con la clase `GlmMoeDsaForCausalLM`. No se documentan pesos GGUF, por lo que llama.cpp, Ollama y similares no son opciones con este checkpoint.
- Rendimiento reportado: ~950 tok/s agregados en TP=4 sobre 4 x B300 frente a ~600 tok/s del original en el mismo escenario (long reasoning, carga concurrente identica). No se publican cifras de latencia por peticion.
- En B300 / SM103 (Blackwell Ultra), FlashInfer compila en JIT los kernels FP8 MoE en el primer arranque; la model card menciona este requisito pero el texto proporcionado queda truncado en ese punto.
- La cache KV escala con la memoria libre: en tarjetas de 141 GB, 192 GB o 275 GB los 22-44 GiB liberados por GPU se traducen en contextos mas largos o mas usuarios concurrentes.

## Comparativa con modelos similares

La comparacion directa disponible es contra el modelo base del que deriva. No se proporcionan datos de rendimiento de otros modelos de la misma categoria en la informacion disponible.

| Modelo | Parametros | Contexto | Expertos enrutados por capa MoE | Checkpoint FP8 | Licencia |
|---|---|---|---|---|---|
| GLM-5.3 (zai-org) | no disponible en la informacion (562 B en la variante podada) | 1.048.576 posiciones | 256 | 756 GB | glm-5.3 |
| GLM-5.3-SLIM-E192 | 562.153.591.104 | 1.048.576 posiciones (servido a 73.728) | 192 | 564 GB | glm-5.3 |
| Otros MoE abiertos de clase ~500 B+ | no disponible | no disponible | no disponible | no disponible | no disponible |

En terminos de rendimiento relativo, la variante podada iguala al original en codigo, ciberseguridad, tool calling y matematicas, y pierde 3-4 puntos en GPQA-Diamond y 7,3 puntos en C-Eval. En coste de despliegue la mejora es sustancial: 192 GB menos de checkpoint, 22 GiB menos de pesos por GPU en TP=8 y un 58 % mas de throughput agregado en la configuracion medida.

## Limitaciones y advertencias

- Perdida de conocimiento enciclopedico en chino: C-Eval cae 7,3 puntos (92,0 % a 84,7 %). El autor recomienda el modelo original si el conocimiento tipo examen en chino es prioritario.
- Perdida en razonamiento cientifico: GPQA-Diamond baja 3,6 puntos (86,9 % a 83,3 %), diferencia considerada real y no ruido.
- Aumento de perplejidad en texto general: +4,7 % en chat en ingles y +7,3 % en chino, aunque la conversacion y el seguimiento de instrucciones se mantienen fluidos segun el autor.
- Riesgo de alucinacion no evaluado en la informacion disponible; no hay datos de factualidad ni de tasas de alucinacion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Cobertura idiomatica limitada a ingles y chino; no se declara soporte de otros idiomas, incluido el castellano.
- Licencia `other` con nombre `glm-5.3`: las condiciones de uso comercial dependen del texto de la licencia del modelo base enlazada por el autor. Es imprescindible revisarla antes de cualquier despliegue en produccion.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, y fue creado el 16 de septiembre de 2026. La validacion independiente es practicamente nula: todas las cifras proceden del autor.
- Es un podado de expertos, no un modelo reentrenado. El criterio de seleccion de expertos y si hubo fase de recuperacion no se documentan, lo que dificulta razonar sobre que dominios pueden degradarse mas alla de los medidos.
- Requiere hardware de datacenter de clase Hopper o Blackwell en FP8. No hay ruta de cuantizacion alternativa documentada (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con GPUs mas antiguas o de consumo.
- El texto de la model card proporcionado queda truncado en la seccion sobre B300 / SM103, por lo que podria haber requisitos adicionales de compilacion o arranque no recogidos aqui.
- Los resultados de la busqueda web facilitada no contienen informacion relevante sobre el modelo (son discusiones de soporte de Facebook), por lo que no hay fuentes independientes que confirmen las cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cloudyu/GLM-5.3-SLIM-E192
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Licencia del modelo base (glm-5.3): https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Papers, blogs, repositorios o demos adicionales: no disponible (los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo).
