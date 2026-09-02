# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bgroot16

## Resumen

Este modelo es un checkpoint de aprendizaje por refuerzo (RL) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario agurung. Se trata de un experimento de investigación que aplica el algoritmo GRPO (Group Relative Policy Optimization) directamente sobre un modelo instructivo, sin una etapa adicional de fine-tuning supervisado (SFT), con el objetivo de mejorar la generación de código para problemas de programación del conjunto "cobalt-train". El checkpoint se guardó en el paso global 16 de la ejecución y se seleccionó como el mejor según la métrica pass@8.

Con 4.411.424.256 parámetros (aproximadamente 4,4 mil millones), este modelo está orientado a tareas de generación de texto y código, y se distribuye en formato safetensors. Su relevancia radica en que explora técnicas de RL como la penalización por truncamiento (stop-properly penalty) y la penalización por longitud excesiva (DAPO overlong penalty), que buscan mejorar la calidad de las soluciones generadas. No se dispone de información sobre la licencia, los idiomas soportados ni la longitud de contexto, por lo que estos aspectos quedan sin especificar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.411.424.256 (4,4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Transformer de Qwen3-4B-Instruct-2507, un modelo instructivo de 4,4 mil millones de parámetros. Sobre esta base se aplicó un entrenamiento de RL utilizando OpenRLHF con el algoritmo GRPO, sin penalización de divergencia KL. La receta incluye una penalización de -1.0 para respuestas truncadas (estilo ProRL) y una penalización aditiva de hasta -0.25 para respuestas que se acercan al límite de tokens (DAPO overlong penalty). Se utilizaron 8 muestras por prompt, un tamaño de lote de 128 tanto para rollout como para entrenamiento, un máximo de 4096 tokens nuevos por respuesta y 2 episodios. El learning rate del actor fue de 1e-06 con programación constante.

El entrenamiento se realizó sobre el subconjunto "cobalt-train ≤2/64 frontier", compuesto por 1833 problemas de entrenamiento y 112 de validación, donde el modelo base resolvía como máximo 2 de 64 muestras. La señal de recompensa fue binaria: 1.0 si el programa generado pasaba todos los tests del problema, 0.0 en caso contrario. No se aplicó una etapa de SFT adicional; el RL se aplicó directamente sobre el modelo instructivo base.

## Capacidades

- Generación de código: el modelo está entrenado para producir soluciones de programación que superen los tests de problemas específicos del conjunto cobalt-train.
- Razonamiento sobre problemas algorítmicos: puede generar código que resuelve tareas de lógica y algoritmia, aunque su especialización está limitada al dominio de entrenamiento.
- Generación de texto: al estar basado en Qwen3-4B-Instruct, conserva capacidades generales de generación de texto, aunque no se han evaluado formalmente en este checkpoint.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el efecto de GRPO y las penalizaciones de truncamiento y longitud en modelos de código.
- Fine-tuning adicional: puede utilizarse como base para experimentos de RL o SFT sobre dominios específicos de programación.
- Evaluación de métricas de generación de código: permite comparar la calidad de soluciones generadas con respecto al modelo base en problemas de programación.
- Desarrollo de asistentes de codificación especializados: aunque no es un modelo de producción, puede integrarse en prototipos que requieran generación de código con verificación de tests.
- Análisis de robustez: útil para estudiar cómo el RL afecta la capacidad de generalización del modelo en problemas no vistos.
- Reproducción de experimentos: al estar disponible públicamente, facilita la replicación de los resultados del estudio que lo generó.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el checkpoint es el mejor por pass@8 en su ejecución, pero no proporciona valores numéricos concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware para este checkpoint.
- Con 4,4 mil millones de parámetros, en precisión FP16 los pesos ocupan aproximadamente 8,8 GB de VRAM, más el overhead de activaciones y caché. En cuantización de 8 bits se reduciría a unos 4,4 GB, y en 4 bits a unos 2,2 GB, aunque no se ofrecen versiones cuantizadas en el repositorio.
- Puede ejecutarse en GPUs de consumo como una RTX 3090 o RTX 4090 (24 GB) en FP16, o en GPUs con menos memoria si se aplica cuantización externa.
- La model card sugiere servirlo con vLLM mediante el comando `vllm serve agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bgroot16 --revision main`.
- También es compatible con la librería transformers para carga y generación local.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos. El checkpoint se basa en Qwen3-4B-Instruct-2507, pero no se han publicado métricas que permitan compararlo con el modelo base u otras variantes de RL. Existen otros checkpoints del mismo autor con nombres similares (por ejemplo, `cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base` y `cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-base`), que probablemente corresponden a diferentes configuraciones de la misma ejecución, pero no se proporcionan detalles comparativos.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción. Su rendimiento en tareas fuera del dominio de entrenamiento no está garantizado.
- El entrenamiento se limitó a un conjunto específico de problemas de programación (cobalt-train), por lo que puede no generalizar bien a otros tipos de código o lenguajes.
- No se han evaluado sesgos, alucinaciones ni comportamientos indeseados. La señal de recompensa binaria puede favorecer soluciones que pasan los tests pero no son óptimas o contienen fallos sutiles.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o modificación.
- No se proporcionan métricas de rendimiento (latencia, throughput) ni benchmarks estándar como MMLU o HumanEval.
- El modelo tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto experimental con poca validación externa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-bgroot16
- Checkpoint relacionado (ncp10-base): https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base
- Checkpoint relacionado (ncp20-base): https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-base
- Página de despliegue en FriendliAI (para variante similar): https://friendli.ai/models/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp10-base-tf
