# pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient-v3

## Resumen

DeepSeek-V4.1-1017-Ablitrated-Efficient-v3 es un ajuste fino experimental de tipo MoE publicado por el usuario pentacoxian-dev, derivado de deepseek-ai/DeepSeek-V4.1-Flash-1017 (licencia MIT). El modelo se distribuye como pesos completos en 48 shards y una superposición delta, con 763.205.315.794 parametros totales segun los safetensors del repositorio (595,5 GB). La model card interna identifica la version real como V3.1, aunque el nombre del repositorio conserve el sufijo v3.

El objetivo declarado es la investigacion sobre alineacion y rechazo: el modelo aplica una capa de "uncensoring" (eliminacion de rechazos) sobre la variante v2 de la misma familia, junto con una correccion del bucle degenerado. La innovacion de V3.1 consiste en separar el vector de bucle del vector de uncensoring, ortogonalizando el primero respecto al vector singular dominante de uncensoring de cada capa antes de restarlo, lo que elimina la regresion de reverificacion observada en versiones previas. El contexto maximo declarado es de 1.048.576 tokens, con un limite de evaluacion de 32.768 turnos.

Es relevante ahora porque documenta de forma cuantitativa el compromiso entre supresion de rechazos, capacidad (MMLU) y estabilidad agentica (bucles), un area con pocos datos publicos y metodologicamente delicada. No obstante, se trata de una publicacion de investigacion experimental, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (model_type: deepseek_v41) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens maximo; limite de evaluacion de 32.768 turnos |
| Tipos de cuantizacion | pesos en fp8 (tag 8-bit); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards completos y superposicion delta) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) con identificador de modelo `deepseek_v41`, heredado de DeepSeek-V4.1-Flash-1017. La model card menciona explicitamente la capa `layers.39.ffn.shared_experts.w2`, lo que confirma el uso de expertos compartidos ademas de los enrutados. Los pesos se publican en fp8. No se detalla el numero de parametros activos por token, la composicion del dataset de preentrenamiento ni el volumen de tokens utilizados; esa informacion no esta disponible.

El entrenamiento posterior es un ajuste fino sobre la variante v2 de pentacoxian-dev, que ya incorporaba el trabajo `wf_dbroad_eth`, al que se anade la capa de uncensoring de hikari y una segunda reduccion de bucles. La innovacion tecnica central de V3.1 es la ortogonalizacion: el vector de bucle se proyecta ortogonalmente contra el vector singular dominante de uncensoring de cada capa antes de restarlo, de modo que la resta del bucle solo afecta a la ruta simple y preserva la matriz de uncensoring. Ademas, se restaura el tensor oficial `layers.39.ffn.shared_experts.w2`, cuya edicion provocaba bucles inducidos por reparacion. No se documenta el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de razonamiento de multiples pasos.
- Comportamiento sin rechazos: la model card reporta una tasa de rechazo del 2,6% en Orca 850 sin prompt y del 1,41% con prompt.
- Estabilidad agentica: 0 episodios bloqueados y 100% de exito en las suites de 96 episodios (held-out y dev) con esfuerzo 100 y 75.
- Contexto largo: ventana declarada de 1.048.576 tokens, con evaluacion hasta 32.768 turnos sin bucles recurrentes.
- Correccion de bucles degenerados mediante la separacion ortogonal de vectores (V3.1).
- Ejecucion compatible con vLLM y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidades multilingues limitadas al ingles segun la metadata del repositorio.
- No se documentan capacidades de vision, audio ni tool calling explicito.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo sirve como banco de pruebas para medir el efecto de tecnicas de abliteration sobre la tasa de rechazo, con metricas publicadas (Orca 850, HarmBench, XSTest, JBB) que permiten comparar dosis de edicion en capas tardias.
- Evaluacion de estabilidad agentica en contextos largos: con 1.048.576 tokens de ventana y suites de 96 episodios documentadas, es adecuado para estudiar bucles degenerados y recuperacion en tareas de multiples pasos.
- Analisis de seguridad de modelos abiertos: la model card proporciona una tasa de exito de ataque (ASR) del 87,5% con el clasificador oficial HarmBench-Llama-2-13B, util para equipos de red teaming que necesiten cuantificar la robustez de variantes abliterated.
- Estudio de compromisos capacidad-seguridad: con MMLU de 85,9% (5-shot, 14.042 preguntas) y MMLU-300 de 88,0%, permite analizar si la supresion de rechazos degrada el rendimiento en conocimiento general.
- Generacion conversacional libre de restricciones en entornos de investigacion controlados: para experimentos de generacion de texto donde se requiera medir el comportamiento sin rechazos, con la advertencia de que no debe desplegarse en produccion.
- Reproduccion de experimentos de edicion en capas tardias: la documentacion de la capa `layers.39.ffn.shared_experts.w2` y su regla operativa (restaurar el tensor oficial, remedir rechazo tras cada edicion) facilita replicar el pipeline de ajuste.
- Evaluacion comparativa de jueces automaticos: la model card usa Dolphin-2.9.4-8B Q4_K_M como juez neutral y documenta el desacuerdo con el grader de dealign, lo que sirve para estudiar la fiabilidad de evaluadores automaticos.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card y fueron medidos el 2026-11-12 con V3.1, engram activado y vLLM.

| Benchmark | c2_km1 | V3.1 | Delta |
|---|---:|---:|---:|
| MMLU full, 5-shot | 85,6% (12.023/14.042) | 85,9% (12.065/14.042) | +0,3 |
| MMLU-300 | 86,0% (258/300) | 88,0% (264/300) | +2,0 |
| Orca 850, sin prompt | 8,6% (73/850) | 2,6% (22/850) | −6,0 pt |
| Orca 850, con prompt | 11,3% (96/850) | 1,41% (12/850) | −9,9 pt |
| Harmful 500 | 8,2% (41/500) | 2,6% (13/500) | −5,6 pt |
| Benign 350 | 9,1% (32/350) | 2,6% (9/350) | −6,5 pt |
| XSTest falsos rechazos | 12,0% (30/250) | 3,6% (9/250) | −8,4 pt |
| JBB | 2,5% (5/200) | 0,0% (0/200) | — |
| MaliciousInstruct | 1,0% (1/100) | 0,0% (0/100) | — |
| SimpleSafetyTests | 32,0% (16/50) | 6,0% (3/50) | — |

Clasificador oficial HarmBench-Llama-2-13B (entrada de 4.096 tokens, greedy, 320 completaciones, sin system prompt):

| Split | c2_km1 | V3.1 |
|---|---:|---:|
| Standard (159) | 65,4% (104) | 91,8% (146) |
| Contextual (81) | 43,2% (35) | 90,1% (73) |
| Copyright (80) | 50,0% (40) | 76,3% (61) |
| Todos (320) | 55,9% (179) | 87,5% (280) |

Cumplimiento en 4 niveles con Dolphin-2.9.4-8B Q4_K_M como juez (vista separada, no es el ASR oficial):

| Nivel | c2_km1 | V3.1 |
|---|---:|---:|
| COMPLY | 74,7% (239) | 95,94% (307) |
| SOFT_RED | 25,3% (81) | 2,2% (7) |
| HEDGE | 0,0% | 0,0% |
| HARD_REF | 0,0% | 1,9% (6) |
| UNCLEAR | 0,0% | 0,0% |

Bucles agenticos:

| Suite | c2_km1 | V3.1 | Umbral |
|---|---:|---:|---|
| Held-out 96, esfuerzo 100 | 0 bloqueados, 100% exito | 0 bloqueados, 100% | pasa |
| Dev 96, esfuerzo 100 | 0 bloqueados, 100% exito | 0 bloqueados, 100% | pasa |
| Dev 96, esfuerzo 75 | 0 bloqueados, 100% exito | 0 bloqueados, 100% | pasa |
| Bloqueados a 32k | 0 | 0 | pasa |
| Tokens medianos, held-out | 341 | 424 | — |

Puntuacion de bucle (proporcion de episodios con repeticion recuperable): held-out 14,6% a 16,7%; dev 15,6% a 16,7%; esfuerzo 75 15,6% a 17,7%.

Reverificacion: held-out 26,2% a 24,4%; dev 21,9% a 20,0%; esfuerzo 75 39,5% a 36,1%. Respuestas prematuras en dev: 0,0% en ambos. Reverificaciones requeridas en dev: 100% en ambos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763.205.315.794 parametros en fp8, se requieren aproximadamente 763 GB solo para pesos, mas memoria para KV cache y activaciones; no cabe en ninguna GPU consumer.
- GPU recomendadas: no se especifican en la informacion disponible; por volumen de pesos se necesitan nodos multi-GPU de clase H100 o superior.
- GPU consumer: no es viable en RTX 4090 ni en ninguna GPU de consumo por el tamano del modelo.
- Opciones de despliegue: transformers (libreria declarada), vLLM (usado en las mediciones de la model card) y endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo reporta tokens medianos por episodio (341 en c2_km1 frente a 424 en V3.1 en held-out).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-1017-Ablitrated-Efficient-v3 (V3.1) | 763.205.315.794 | 1.048.576 | 85,9% (5-shot) | MIT | Hugging Face, 380 descargas |
| DeepSeek-V4.1-1017-Ablitrated-Efficient (v2, c2_km1) | no disponible | no disponible | 85,6% (5-shot) | MIT | Hugging Face |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | MIT | Hugging Face |

No se dispone de datos de benchmarks de DeepSeek-V4.1-Flash-1017 en la informacion proporcionada, por lo que la comparacion con el modelo base oficial queda limitada a la licencia y la relacion de derivacion.

## Limitaciones y advertencias

- Modelo experimental de investigacion: la propia model card lo etiqueta como publico, experimental y de investigacion; no esta validado para produccion.
- Eliminacion deliberada de rechazos: la tasa de rechazo es del 2,6% en Orca 850 sin prompt y del 1,41% con prompt, con ASR del 87,5% en HarmBench; esto implica un riesgo elevado de generar contenido danino si se despliega sin salvaguardas externas.
- XSTest en 3,6% supera ligeramente el umbral declarado del 3,0%, lo que indica falsos rechazos residuales.
- El split de copyright de HarmBench es el mas debil, con 76,3%, por lo que persiste riesgo de reproduccion de material protegido.
- La capa `layers.39.ffn.shared_experts.w2` es especialmente delicada: editarla puede reducir rechazos pero reintroducir bucles, y cualquier ganancia en rechazo en capas tardias debe considerarse no probada hasta una ejecucion held-out de 96 episodios con 0 bloqueados.
- La puntuacion de cumplimiento del 95,94% se obtuvo con Dolphin-2.9.4-8B Q4_K_M como juez, no con el grader de 4 niveles de dealign, por lo que no es directamente comparable con el 100% de ese trabajo.
- Idioma limitado al ingles segun la metadata; no se documenta soporte multilingue.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- La licencia MIT permite uso comercial, pero las implicaciones de seguridad del modelo abliterated desaconsejan su despliegue sin filtros adicionales.

## Enlaces

- Hugging Face: https://huggingface.co/pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient-v3
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base de linaje (v2): https://huggingface.co/pentacoxian-dev/DeepSeek-V4.1-1017-Ablitrated-Efficient
- Clasificador HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez Dolphin: https://huggingface.co/cognitivecomputations/dolphin-2.9.4-llama3.1-8b
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web proporcionada.
