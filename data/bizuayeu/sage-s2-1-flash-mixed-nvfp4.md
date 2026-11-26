# Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4

## Resumen

Sage-S2.1-Flash Mixed NVFP4 es un checkpoint derivado y cuantizado de `internlm/Sage-S2.1-Flash`, publicado por el usuario Bizuayeu. No es un modelo entrenado desde cero ni una release oficial de InternLM, Shanghai AI Laboratory, Z.AI o NVIDIA: es una reempaquetación de los pesos del modelo base en precisión mixta para que quepa en dos sistemas GB10 (clase DGX Spark) y pueda servirse con el motor TensorFold. El modelo base tiene la forma de GLM-5.3-Flash: 45 capas más una capa MTP de borrador, con 288 expertos enrutados por capa a partir de la capa 3.

La contribución concreta de este checkpoint es la cuantización a NVFP4 de los expertos enrutados de las capas 3 a 44 y de la capa MTP, que concentran el 94,7 % de los pesos en BF16. El resto se mantiene en la precisión de la release oficial FP8 (atención MLA y expertos compartidos), en MXFP8 los tres MLP densos de las capas 0 a 2, y en BF16 la atención KDA, `lm_head`, embeddings y la torre de visión. El resultado son 183,8 GB en 144 ficheros frente a los 643 GB del checkpoint BF16 y los 328,5 GB de la release FP8 oficial.

Es relevante ahora porque demuestra una ruta de despliegue de un modelo de 342.874.152.234 parámetros (unos 343 mil millones) en hardware de clase workstation de dos nodos, con un pipeline image-text-to-text y licencia MIT. La contrapartida es que solo se ha validado con TensorFold 1.2.9 y que el formato de escalas de los expertos (`csf_32x2_v1`) no lo lee ningún otro cargador probado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), atención MLA y KDA, capa MTP de borrador; forma de GLM-5.3-Flash |
| Parametros totales | 342.874.152.234 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 40.960 tokens (ventana configurada en el serving TP=2 documentado) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), FP8 E4M3 (MLA y expertos compartidos), MXFP8 (MLP densos capas 0-2), BF16/F32 (KDA, lm_head, embeddings, router, torre de visión) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (133 de los 144 ficheros), escalas en formato `csf_32x2_v1` y tabla `MIXED_PRECISION` de ModelOpt |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura transformer con mezcla de expertos: 45 capas más una capa MTP (multi-token prediction) de borrador, con 288 expertos enrutados por capa a partir de la capa 3. Combina dos mecanismos de atención: MLA en 11 capas y en la capa MTP, y KDA en 34 capas. Incluye además una torre de visión, lo que habilita el pipeline image-text-to-text. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

Este checkpoint no entrena nada: es una derivación puramente de cuantización. Los expertos enrutados de las capas 3 a 44 (163,02 GB, 36.288 matrices) y los de la capa MTP (4,08 GB, 864 matrices) se cuantizaron desde BF16 a NVFP4 con códigos E2M1 y una escala E4M3 cada 16 pesos, sin datos de calibración ni suavizado. Para cada bloque de 16 pesos se elige la escala E4M3 de menor error cuadrático entre 25 valores vecinos. La atención MLA y los expertos compartidos (2,29 GB, 177 matrices) se toman byte a byte de la release FP8 oficial (revisión `716e6436905650b7be93e1b7dedfb0bb95afd3a3`), y los tres MLP densos (0,47 GB, 9 matrices) se recuantizan a MXFP8 desde BF16 porque el cargador de TensorFold solo acepta NVFP4 o MXFP8 en esas capas. El resto (13,86 GB) conserva los bytes BF16 del checkpoint original (revisión `76f4513db7464485605a002a06a6190de0460574`).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con ventana de 40.960 tokens en la configuración de serving documentada.
- Entrada de imagen: pipeline image-text-to-text con torre de visión en BF16; se verificaron imágenes de hasta 2.016 píxeles de lado respondidas correctamente en TP=2.
- Tool calling / function calling: se validó un round trip de llamadas a herramientas en TP=2.
- Razonamiento multi-paso y agentes: tool-eval-bench 3.0.0 puntuó entre 94 y 97 en la configuración probada.
- Decodificación especulativa mediante la capa MTP de borrador (en las pruebas se sirvió con los borradores desactivados).
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue de un modelo de ~343 mil millones de parámetros en dos GB10: el checkpoint está dimensionado para TP=2, con 92,51 GiB de modelo en la primera máquina y 8,6-8,7 GiB libres en cada nodo en el peor caso. Adecuado para laboratorios con hardware DGX Spark que quieran servir el modelo base sin acceso a clústeres de GPU de datacenter.
- Asistentes conversacionales de contexto largo: con 40.960 tokens de ventana se pueden mantener conversaciones multi-turno con historial extenso o documentos largos adjuntos, siempre que el motor sea TensorFold 1.2.9.
- Automatización con herramientas: el soporte verificado de tool calling y la puntuación de 94-97 en tool-eval-bench 3.0.0 permiten integrarlo en flujos de agente que consulten APIs externas o ejecuten acciones estructuradas.
- Procesamiento de documentos con imagen: la torre de visión en BF16 permite responder preguntas sobre capturas, diagramas o páginas escaneadas de hasta 2.016 píxeles por lado, útil en extracción de información de formularios o revisión de documentación técnica.
- Evaluación e investigación de cuantización: al ser una derivación con métricas de fidelidad publicadas (KL 0,0426, acuerdo top-1 del 93,56 %, NLL un 1,05 % por encima de BF16), sirve como referencia para estudiar el impacto de NVFP4 sin calibración en modelos MoE de gran tamaño.
- Prototipado de pipelines image-text-to-text en local: para equipos que ya dispongan de dos GB10 y quieran validar flujos multimodales antes de migrar a la release oficial FP8 en infraestructura mayor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Divergencia KL frente a BF16 | 0,0426 (PyTorch, 128 documentos) |
| Acuerdo top-1 frente a BF16 | 93,56 % |
| NLL relativo frente a BF16 | +1,05 % |
| tool-eval-bench 3.0.0 | 94 a 97 |
| Throughput en TP=2 (sin borradores) | 19,9 tok/s |
| Latencia al primer token (prompt en frío de 9.600 tokens) | 6,7 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores son medidas de fidelidad de cuantización y de serving, no de calidad de tarea.

## Requisitos de hardware

- VRAM/modelo en memoria: 183,8 GB en disco; 92,51 GiB de modelo en la primera máquina con TP=2. El checkpoint BF16 equivalente ocupa 643 GB y la release FP8 oficial 328,5 GB.
- GPU recomendadas: dos sistemas GB10 (clase DGX Spark) en TP=2 o TP=3. No está pensado para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU consumer; el autor indica explícitamente que no es apto para una sola GB10.
- Opciones de despliegue: exclusivamente TensorFold release 1.2.9 (probado desde su tag y desde `main` en `077998f7d9`). No se probó ningún otro cargador; LMDeploy, vLLM y SGLang solo están cubiertos en la guía de despliegue del modelo base con las releases oficiales.
- Memoria libre: 8,6 a 8,7 GiB por máquina en el peor caso con ventana de 40.960 tokens y un solo stream.
- Latencia y throughput: 19,9 tok/s con borradores desactivados y 6,7 s hasta el primer token en un prompt en frío de 9.600 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Tamano | Licencia | Motor |
|---|---|---|---|---|---|---|
| Sage-S2.1-Flash Mixed NVFP4 (este) | 342.874.152.234 | 40.960 (config. probada) | Mixta NVFP4/FP8/MXFP8/BF16 | 183,8 GB | MIT | TensorFold 1.2.9 |
| internlm/Sage-S2.1-Flash (BF16) | no disponible en la informacion | no disponible | BF16 | 643 GB | MIT (heredada) | LMDeploy, vLLM, SGLang |
| internlm/Sage-S2.1-Flash-FP8 | no disponible en la informacion | no disponible | FP8 | 328,5 GB | MIT (heredada) | LMDeploy, vLLM, SGLang |
| Sage-S2.1-Flash Jammed XSFP4 (mismo autor) | no disponible en la informacion | no disponible | XSFP4 con escalas cada 32 pesos y suavizado calibrado | no disponible | MIT | Requiere dos cambios en TensorFold no publicados (a 2026-11-20) |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de las métricas de fidelidad y serving del presente checkpoint.

## Limitaciones y advertencias

- No es una release oficial: no lo publica InternLM, Shanghai AI Laboratory, Z.AI ni NVIDIA, pese a derivar de sus pesos.
- Dependencia total de TensorFold: las escalas de los expertos se almacenan como `csf_32x2_v1` y la mezcla de precisiones en la tabla `MIXED_PRECISION` de ModelOpt; ningún otro cargador probado las lee.
- No cabe en una sola GB10: en TP=2 la primera máquina ya aloja 92,51 GiB de modelo.
- Falta el proyector de entrada científica: la carpeta `projectors/` del repositorio fuente no está incluida en este checkpoint.
- La cuantización NVFP4 de los expertos se hizo sin calibración ni suavizado, lo que implica una pérdida medible frente a BF16 (KL 0,0426, NLL +1,05 %).
- La validación de imagen fue cualitativa ("checked, not measured"): se comprobó que responde correctamente, pero no se midió su calidad.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Licencia MIT, lo que permite uso comercial, pero la responsabilidad sobre la calidad y el soporte recae en el derivador, no en el equipo del modelo base.
- El checkpoint hermano Jammed XSFP4 requiere cambios de motor no publicados a fecha de 2026-11-20; no debe confundirse con este.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/Bizuayeu/Sage-S2.1-Flash-Mixed-NVFP4
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Release FP8 del modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash-FP8
- Checkpoint hermano Jammed XSFP4: https://huggingface.co/Bizuayeu/Sage-S2.1-Flash-Jammed-XSFP4
- Revisión BF16 del modelo base citada: `76f4513db7464485605a002a06a6190de0460574`
- Revisión FP8 del modelo base citada: `716e6436905650b7be93e1b7dedfb0bb95afd3a3`
- Motor TensorFold: release 1.2.9 y `main` en `077998f7d9` (sin URL pública en la información disponible)
