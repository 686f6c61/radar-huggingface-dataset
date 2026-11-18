# logan7000/cogrpo-heter-qwen25-3b-x-llama32-3b-naivereward-math345-seed42-logs

## Resumen

Este repositorio no contiene un modelo entrenado para inferencia, sino los registros de entrenamiento (*training logs*) y metadatos de una ejecución concreta de co-GRPO (cooperative Group Relative Policy Optimization) en configuración heterogénea. La ejecución combina dos modelos base de 3B parámetros: Qwen2.5-3B (grupo A) y Llama-3.2-3B-Instruct (grupo B), entrenados conjuntamente sobre problemas de matemáticas de nivel 3 a 5 del dataset MATH con una variante de diseño de recompensa ingenua (`PATCH_disagree_adv`) y semilla 42. Lo publica el usuario logan7000 bajo licencia Apache 2.0.

El interés del artefacto es metodológico: documenta un experimento de aprendizaje por refuerzo multi-modelo donde dos políticas de distinta familia arquitectónica comparten un esquema de recompensa y se entrenan en paralelo. El run consta de 136 pasos ejecutados en un nodo con 4 GPU RTX PRO 6000 (Blackwell, Max-Q), usando DeepSpeed ZeRO-3 y vLLM en modo colocate. Los pesos finales y los checkpoints intermedios se distribuyen en dos repositorios separados (grupo A y grupo B), no en este.

La relevancia actual reside en la escasez de registros reproducibles de RLHF/RLVR heterogéneo a pequeña escala: permite auditar curvas de recompensa, hiperparámetros y configuración de infraestructura de un pipeline co-GRPO real. No obstante, al ser únicamente logs, no debe tratarse como un modelo listo para producción ni para evaluación de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en este repositorio (los modelos subyacentes son Qwen2.5-3B y Llama-3.2-3B-Instruct, transformers densos) |
| Parametros totales | 3B por grupo (Qwen2.5-3B en A, Llama-3.2-3B-Instruct en B) |
| Parametros activos | No aplica (modelos densos, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el entrenamiento usa precisión completa/mixta con DeepSpeed ZeRO-3; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica en este repo (solo logs y JSON); los checkpoints asociados se publican en repos separados con pesos y estado de optimizador DeepSpeed |

## Arquitectura y entrenamiento

El objeto de este repositorio es una ejecución de co-GRPO heterogéneo: dos grupos de políticas (A = Qwen2.5-3B, B = Llama-3.2-3B-Instruct) se optimizan de forma cooperativa con una señal de recompensa compartida sobre el dataset MATH, restringido a niveles de dificultad 3 a 5. La variante de recompensa se denomina `PATCH_disagree_adv` (diseño de recompensa "ingenuo"), y la semilla es 42. El entrenamiento se ejecutó durante 136 pasos y finalizó de forma normal, según el `trainer_state.json` incluido.

La infraestructura consistió en un único nodo con 4 GPU RTX PRO 6000 (arquitectura Blackwell, variante Max-Q), DeepSpeed ZeRO-3 para el reparto de estado y vLLM en modo colocate para la generación durante el bucle de RL. El paquete incluye el script de lanzamiento, la salida estándar, los `train.log` por grupo, los ficheros de Weights & Biases (config, summary, output log, requirements) y notas de entorno y ajuste. Los paths, nombres de host e IPs fueron sustituidos por marcadores; `training_args.bin` se distribuye decodificado como `training_args.json`.

Los resultados de evaluación intermedia (`eval_reward` sobre un conjunto de validación fijo, pass@1) muestran que el grupo A alcanza su mejor valor en el paso 60 (0.646) y el grupo B en el paso 130 (0.552), con una curva de mejora más lenta y sostenida en B. No se documentan detalles adicionales sobre la composición exacta del dataset, el número de tokens de entrenamiento ni la función de recompensa más allá de su nombre.

## Capacidades

- Este repositorio no expone un modelo inferible: contiene exclusivamente logs, configuración y metadatos de entrenamiento.
- Los modelos subyacentes (Qwen2.5-3B y Llama-3.2-3B-Instruct) son transformers densos de 3B parámetros con capacidades de generación de texto, razonamiento y matemáticas, pero dichas capacidades no se documentan ni se evalúan aquí.
- No se documenta soporte de tool calling, function calling ni uso como agente en este artefacto.
- No se documentan capacidades multilingües específicas.
- No se documenta modo thinking, visión ni audio.
- El valor del artefacto es la reproducibilidad del pipeline de RL (hiperparámetros, curvas, entorno), no las capacidades del modelo resultante.

## Casos de uso

- Reproducción de experimentos de co-GRPO: los `train.log`, `training_args.json` y `trainer_state.json` permiten reconstruir la configuración exacta (learning rate, batch, pasos, semilla) para replicar el run en otro clúster.
- Auditoría de curvas de recompensa en RL heterogéneo: la tabla de `eval_reward` por paso y grupo sirve para estudiar la dinámica de convergencia de dos políticas de distinta familia bajo una recompensa compartida.
- Análisis de infraestructura: las notas de entorno y los logs de vLLM colocate con DeepSpeed ZeRO-3 documentan el rendimiento y los cuellos de botella de un nodo de 4 GPU Blackwell Max-Q.
- Comparación de diseños de recompensa: al ser la variante `PATCH_disagree_adv`, sirve como línea base frente a otras variantes de recompensa del mismo autor.
- Docencia e investigación en RLVR: material didáctico para explicar el bucle de GRPO cooperativo con dos grupos y evaluación pass@1 sobre MATH.
- Trazabilidad de experimentos: los ficheros de W&B permiten correlacionar métricas de entrenamiento con hiperparámetros y decisiones de ajuste registradas en las notas.

## Benchmarks y rendimiento

Resultados de evaluación intermedia publicados en la model card (`eval_reward` sobre validación fija, pass@1):

| Paso | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100 | 110 | 120 | 130 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A (Qwen2.5-3B) | 0.622 | 0.604 | 0.604 | 0.628 | 0.628 | **0.646** | 0.636 | 0.634 | 0.636 | 0.624 | 0.636 | 0.636 | 0.630 |
| B (Llama-3.2-3B-Instruct) | 0.486 | 0.496 | 0.498 | 0.506 | 0.524 | 0.532 | 0.536 | 0.540 | 0.544 | 0.524 | 0.526 | 0.520 | **0.552** |

Mejor valor: A en el paso 60 (0.646); B en el paso 130 (0.552). Fin del entrenamiento en el paso 136. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado en un nodo con 4 GPU RTX PRO 6000 (Blackwell, Max-Q) con DeepSpeed ZeRO-3 y vLLM colocate.
- VRAM estimada para inferencia de los modelos subyacentes (3B): no disponible en la información proporcionada; orientativamente un modelo de 3B en FP16 requiere del orden de 6-8 GB de pesos, pero este dato no está confirmado en el repositorio.
- GPU recomendadas para inferencia: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no documentadas para este artefacto; los checkpoints asociados incluyen estado de optimizador DeepSpeed y pesos, pero no se especifica formato de exportación (safetensors, GGUF, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio es un paquete de logs de entrenamiento, no un modelo, por lo que no procede compararlo con modelos de la misma categoría. Como referencia, los modelos base implicados son:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-3B (grupo A) | 3B | No disponible en este repo | No disponible en este repo | Pesos en repo separado del autor |
| Llama-3.2-3B-Instruct (grupo B) | 3B | No disponible en este repo | No disponible en este repo | Pesos en repo separado del autor |
| Este artefacto (logs) | No aplica | No aplica | Apache 2.0 | Hugging Face, 0 descargas |

## Limitaciones y advertencias

- No es un modelo: no puede cargarse con `transformers`, `vLLM` ni `llama.cpp` para inferencia; solo contiene logs, JSON y notas.
- Los pesos finales y los checkpoints están en repositorios separados (`...-groupA-qwen-ckpts` y `...-groupB-llama-ckpts`); este repo por sí solo no permite reproducir la inferencia.
- Los checkpoints intermedios incluyen estado de optimizador DeepSpeed (resumibles), lo que incrementa el tamaño y complica su uso fuera del pipeline original.
- La evaluación reportada es `eval_reward` sobre un conjunto de validación fijo, no benchmarks estándar; no es comparable directamente con métricas publicadas de MMLU o GSM8K.
- El diseño de recompensa es "ingenuo" (`PATCH_disagree_adv`); los propios logs no documentan análisis de sesgos ni de alucinación del modelo resultante.
- No se documentan sesgos conocidos, limitaciones idiomáticas ni restricciones de uso comercial más allá de la licencia Apache 2.0.
- Los paths, hosts e IPs fueron anonimizados, lo que puede dificultar la reproducción exacta del entorno.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.

## Enlaces

- Repositorio de logs: https://huggingface.co/logan7000/cogrpo-heter-qwen25-3b-x-llama32-3b-naivereward-math345-seed42-logs
- Checkpoints grupo A (Qwen): https://huggingface.co/logan7000/cogrpo-heter-qwen25-3b-x-llama32-3b-naivereward-math345-seed42-groupA-qwen-ckpts
- Checkpoints grupo B (Llama): https://huggingface.co/logan7000/cogrpo-heter-qwen25-3b-x-llama32-3b-naivereward-math345-seed42-groupB-llama-ckpts
- Paper, blog o demo: no disponible en la información proporcionada.
