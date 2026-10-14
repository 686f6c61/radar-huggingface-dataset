# open-athena/Snowball-67B-A2B-MOPD-Step100

## Resumen

Snowball-67B-A2B-MOPD-Step100 es un checkpoint base (no afinado para instrucciones de uso general) desarrollado por el equipo open-athena dentro del ecosistema Marin. Se trata del resultado final de la rama MOPD (multi-teacher on-policy distillation) de un experimento con dos expertos enrutados: un modelo estudiante B, de 67.078.882.816 parametros totales, se entrena por destilacion on-policy contra dos profesores, uno especializado en prompts de CruxEval y otro en prompts de MMLU-Pro. El objetivo del experimento es estudiar como se comporta la destilacion con multiples profesores enrutados sobre un unico estudiante MoE de gran tamano.

El modelo parte del checkpoint open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (revision fdc3c3c5), que actua como estudiante B y que aporta el tokenizador y la plantilla de chat sin cambios. La nomenclatura "A2B" sugiere una arquitectura MoE con aproximadamente 2.000 millones de parametros activos por token, si bien la model card no confirma ese dato de forma explicita. La etiqueta grug_moe y el tag marin apuntan a una implementacion MoE dentro del stack Megatron/Marin.

Su relevancia es principalmente de investigacion: publica un conjunto de evaluaciones congeladas (Evalchemy sobre vLLM, contexto de 32.768 tokens, modo thinking activado) que incluyen GSM8K 92,8, MATH500 90,0, IFEval instruction-strict 80,0 y GPQA-D 47,5. No se trata de un modelo orientado a producto, sino de una pieza reproducible de un estudio de destilacion, con licencia Apache 2.0 y pesos en safetensors de 134,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag grug_moe); transformer con mezcla de expertos; stack Marin/Megatron |
| Parametros totales | 67.078.882.816 (67,08 mil millones) |
| Parametros activos | No confirmado en la model card; la nomenclatura "A2B" del nombre sugiere ~2.000 millones activos por token (dato inferido, no verificado) |
| Longitud de contexto | 32.768 tokens empleados en la evaluacion congelada (no se especifica la ventana maxima de entrenamiento) |
| Tipos de cuantizacion | No se publican pesos cuantizados. El repositorio contiene unicamente safetensors (formato de exportacion BF16/FP16 del entrenamiento) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards), config.json, generation_config.json, tokenizer y chat_template.jinja |
| Tamano del repositorio | 134,2 GB |
| Modelo base | open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (revision fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab) |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), etiquetado en HuggingFace como grug_moe y asociado al ecosistema Marin. El checkpoint hereda del estudiante B (Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92) el tokenizador, la plantilla de chat y probablemente la topologia de enrutado; el entrenamiento mantiene el sesgo del router congelado (frozen router bias), lo que impide que el enrutado se reajuste durante la destilacion.

El procedimiento es una destilacion on-policy con multiples profesores (MOPD). Dos profesores enrutados actuan sobre el mismo conjunto de 3.206 prompts: un experto E puntua los prompts de CruxEval y un experto E2 los de MMLU-Pro, con una mezcla de rutas 1:1. La senal de destilacion es una KL inversa muestreada, con 4 rollouts por prompt. El entrenamiento usa Megatron, optimizador AdamW con learning rate 1e-6 y betas 0,9/0,999, durante 2 epocas, lo que equivale a 100 actualizaciones de 64 prompts. La receta completa esta implementada en MarinSkyRL (rama task/164, commit 76fc4be9, configuracion cloud/iris/configs/snowball_mopd2_cruxeval_mmlupro.yaml).

El coste de computo declarado es de 557,9 horas de H100 para el entrenamiento (7 nodos de H100x8, es decir 56 GPU H100) mas 28,3 horas de H100 para los trabajos de solo exportacion. El checkpoint seleccionado es el del paso 100, elegido frente al paso 50 mediante una regla congelada por ser similar en todos los objetivos evaluados.

## Capacidades

- Generacion de texto autoregresiva y modo conversacional mediante la plantilla de chat heredada del modelo base.
- Razonamiento matematico: GSM8K 92,8 y MATH500 90,0 en la evaluacion congelada.
- Razonamiento de codigo y prediccion de salida: CruxEval 82,1 / 76,4.
- Conocimiento general y razonamiento cientifico de nivel avanzado: MMLU-Pro 64,2 (subconjunto) y 64,4 (held-out); GPQA-D 47,5.
- Seguimiento de instrucciones: IFEval instruction-strict 80,0.
- Modo thinking: activado en toda la evaluacion reportada (thinking on).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no documentadas de forma especifica.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion en destilacion de modelos: reproducir el experimento MOPD con dos profesores enrutados sobre un estudiante de 67B para estudiar el efecto de la mezcla de rutas 1:1 y de la KL inversa muestreada.
- Evaluacion comparativa de tecnicas de alineacion: usar el checkpoint como punto de referencia frente al paso 50 y al modelo base dentro del mismo pipeline Evalchemy.
- Generacion de codigo en tareas de prediccion de salida: el rendimiento en CruxEval (82,1 / 76,4) lo hace util como base para tareas de razonamiento sobre fragmentos de codigo.
- Resolucion de problemas matematicos: con GSM8K 92,8 y MATH500 90,0 es adecuado como base para asistentes de resolucion de ejercicios paso a paso en modo thinking.
- Evaluacion de instruction following en produccion: con IFEval instruction-strict 80,0 puede emplearse para validar pipelines que requieran cumplimiento estricto de restricciones de formato.
- Base para afinado posterior (SFT/DPO): al ser un checkpoint base con licencia Apache 2.0, sirve como punto de partida para especializaciones verticales sin restricciones de uso comercial.
- Analisis de rendimiento de arquitecturas MoE: su tamano (67B totales con enrutado disperso) permite estudiar el equilibrio entre coste de computo y calidad en despliegues con vLLM.
- Comparacion de evaluadores congelados: util para validar la estabilidad de un evaluador fijo (Evalchemy en un commit concreto) frente a variaciones de checkpoint.

## Benchmarks y rendimiento

Evaluacion congelada con Evalchemy (commit ae362881cf53f869a6ad52c8a59fa17343c0b5f8), vLLM sobre 8x H100, contexto de 32.768 tokens, limite de generacion de 30.720 tokens, thinking activado, muestreo sin semilla fija a temperatura 1,0. Una unica pasada de evaluacion.

| Benchmark | Resultado |
|---|---|
| CruxEval | 82,1 / 76,4 |
| MMLU-Pro (subconjunto) | 64,2 |
| MMLU-Pro (held-out) | 64,4 |
| GSM8K | 92,8 |
| MATH500 | 90,0 |
| GPQA-D | 47,5 |
| IFEval instruction-strict | 80,0 |

No se dispone de resultados comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Pesos en BF16/FP16: aproximadamente 134 GB (coincide con el tamano del repositorio, 134,2 GB). Requiere al menos 2x H100 80 GB, o 4x A100 80 GB, o 8x A100 40 GB para dejar margen a la cache KV.
- Pesos en 8 bits: aproximadamente 67 GB. Cabe en una sola H100 80 GB o en 2x A100 40 GB.
- Pesos en 4 bits: aproximadamente 34-37 GB. Cabe en una GPU de 48 GB (A6000, RTX 6000 Ada) o en 2x RTX 4090 24 GB.
- GPU consumer: en 4 bits puede ejecutarse en 2x RTX 4090; no cabe en una unica RTX 4090 de 24 GB con los pesos completos en memoria. Al tratarse de un MoE con enrutado disperso, el desglose de expertos por CPU/GPU podria reducir el requisito de VRAM si el runtime lo soporta.
- Opciones de despliegue: vLLM (empleado en la evaluacion oficial), TGI, SGLang. Para llama.cpp u Ollama seria necesario convertir los safetensors a GGUF, ya que el repositorio no incluye pesos GGUF.
- Computo por token: con enrutado MoE y un numero reducido de parametros activos inferido de la nomenclatura, el coste de FLOPs por token seria muy inferior al de un modelo denso de 67B, aunque la transferencia de pesos desde memoria sigue dominando en inferencia por lotes pequenos.
- Latencia y throughput: no se han publicado mediciones especificas en la informacion disponible. La evaluacion se realizo con un limite de generacion de 30.720 tokens y contexto de 32.768 tokens, lo que da una idea del regimen de uso previsto (secuencias largas con razonamiento extendido).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| Snowball-67B-A2B-MOPD-Step100 | 67,08B | No confirmado (~2B sugerido por la nomenclatura) | 32.768 tokens en evaluacion | Apache 2.0 | safetensors |
| Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (modelo base) | 67,08B | No disponible | No disponible | Apache 2.0 (segun hereda el derivado) | safetensors |
| Qwen3-30B-A3B | ~30B | ~3B | No verificado en esta ficha | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | ~46,7B | ~12,9B | No verificado en esta ficha | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de benchmarks comparables en la informacion proporcionada; los valores de parametros y licencias de los modelos alternativos corresponden a informacion publica de sus fabricantes y no se han verificado dentro de esta ficha. La comparacion de rendimiento con Snowball queda por tanto no disponible.

## Limitaciones y advertencias

- Modelo base, no afinado para uso conversacional general: el propio autor lo describe como un checkpoint de destilacion, no como un asistente listo para produccion.
- Resultados de benchmark con una unica pasada de evaluacion y sin semilla fija (temperatura 1,0), por lo que la varianza entre ejecuciones no esta cuantificada.
- CruxEval se reporta como dos cifras (82,1 / 76,4); la model card no aclara en el texto extraido a que variante corresponde cada una.
- Idiomas soportados no documentados: no hay garantia de cobertura multilingue ni de comportamiento consistente fuera del ingles.
- No se documentan capacidades de tool calling, agentes ni multimodalidad; asumir su ausencia salvo verificacion.
- La ventana de contexto de entrenamiento efectiva no se especifica; los 32.768 tokens corresponden a la configuracion del evaluador, no necesariamente a una capacidad garantizada de entrenamiento.
- Riesgo de alucinacion inherente a un modelo base sin alineacion adicional (no se documenta RLHF/DPO orientado a seguridad).
- Sesgos: no documentados por el autor. Al derivar de un modelo entrenado sobre corpus web y de destilacion, cabe esperar sesgos presentes en los profesores y en los datos de partida.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad de validar el comportamiento del modelo en su dominio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente de la comunidad.
- El tamano en disco (134,2 GB) exige infraestructura de almacenamiento y transferencia significativa.
- No se publican pesos cuantizados oficiales; cualquier despliegue en 4 u 8 bits requiere una conversion propia y su validacion de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-MOPD-Step100
- Modelo base (estudiante B): https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92
- Revision concreta del modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Informe del experimento (Marin, issue 9984): https://github.com/marin-community/marin/issues/9984
- Comentario con el informe detallado: https://github.com/marin-community/marin/issues/9984#issuecomment-6144923850
- Evaluador congelado Evalchemy (commit ae362881): https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- Receta de entrenamiento MarinSkyRL (rama task/164, commit 76fc4be9): configuracion cloud/iris/configs/snowball_mopd2_cruxeval_mmlupro.yaml
