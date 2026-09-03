# JC1DA/Qwen3.8-27B-DavidAU-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-INT4-W4A16

## Resumen

Este modelo es una cuantización W4A16 (4 bits de peso, 16 bits de activación) del fine-tuning `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, realizado por el usuario JC1DA mediante AutoRound y GPTQ con grupo de 128. El modelo original es un ajuste del base `Qwen/Qwen3.8-27B` que incorpora técnicas como Cold Fusion, GAIN Training y Multi-stage tuning, y se presenta como "heretic/uncensored" (sin censura) con capacidades de razonamiento y seguimiento de instrucciones. La cuantización reduce el tamaño de 54 GB (FP16) a aproximadamente 19 GB, una reducción del 65 %, manteniendo un rendimiento prácticamente idéntico según los benchmarks publicados.

A pesar del nombre "27B", los pesos reales en safetensors suman 6.284.446.960 parámetros (~6,28 B), una discrepancia que no se explica en la documentación disponible. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales, aunque no se detallan en la model card. El modelo está pensado para entornos de producción con recursos limitados, ya que la cuantización permite ejecutarlo en GPUs de consumo con 24 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, basado en Qwen3.8-27B) |
| Parametros totales | 6.284.446.960 (segun safetensors; el nombre indica 27B, pero el peso real es ~6,28 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones) con GPTQ/AutoRound, grupo 128 |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con GPTQ/AutoRound) |

## Arquitectura y entrenamiento

No se proporcionan detalles arquitectonicos especificos en la informacion disponible. El modelo base es `Qwen/Qwen3.8-27B`, un transformer de la familia Qwen, y el fine-tuning original (DavidAU) emplea tecnicas etiquetadas como Cold Fusion, GAIN Training y Multi-stage tuning, aunque no se describen en profundidad. La cuantizacion se realizo con AutoRound 0.12.3 y GPTQ, con 4 bits de peso y 16 bits de activacion, grupo de 128. No hay informacion sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento, con fuerte seguimiento de instrucciones (segun la model card del autor).
- Salida "heretic/uncensored": el modelo no aplica filtros de contenido, lo que permite respuestas sin restricciones tematicas.
- Reduccion de tokens de "overthinking" y tamaños de pensamiento auto-variables, lo que mejora la eficiencia en tareas de razonamiento.
- Capacidad de procesamiento imagen-texto (pipeline `image-text-to-text`), aunque no se detallan las tareas concretas.
- Soporte de tool calling: no mencionado en la informacion disponible.
- Multilingue: solo ingles declarado.

## Casos de uso

- Chatbots conversacionales sin restricciones de contenido: el modelo puede gestionar dialogos multi-turno con respuestas directas y sin censura, adecuado para aplicaciones de rol o simulacion de personajes.
- Generacion de texto creativo: gracias a su naturaleza "uncensored", puede producir ficcion, guiones o contenido literario con menos limitaciones que otros modelos.
- Asistencia en razonamiento y resolucion de problemas: los benchmarks muestran un rendimiento solido en BBH y ARC-Easy, por lo que puede usarse en tareas de logica y analisis.
- Generacion de codigo: con un 79,88 % en HumanEval (pass@1), es util para asistencia en programacion, aunque no se menciona soporte especifico de tool calling.
- Despliegue en entornos con recursos limitados: al ocupar ~19 GB, puede ejecutarse en GPUs de consumo (24 GB VRAM) con vLLM o transformers, lo que facilita su integracion en infraestructuras modestas.
- Aplicaciones de investigacion sobre modelos sin censura: util para estudiar el comportamiento de modelos "uncensored" en tareas de generacion libre, siempre con las debidas advertencias eticas.

## Benchmarks y rendimiento

La model card incluye una comparativa entre la version FP16 y la cuantizada W4A16, realizada en una NVIDIA A100 80GB con vLLM 0.27.1:

| Benchmark | FP16 | W4A16 | Delta |
|---|---|---|---|
| ARC-Easy (acc) | 86,91 % | 87,25 % | +0,34 % |
| ARC-Easy (acc_norm) | 85,69 % | 86,49 % | +0,80 % |
| HumanEval (pass@1) | 79,27 % | 79,88 % | +0,61 % |
| BBH (exact_match) | 89,94 % | 90,34 % | +0,40 % |
| MMLU (acc) | 86,89 % | 86,69 % | -0,20 % |
| WikiText2 PPL | 8,04 | 8,17 | +0,13 |

Los resultados indican que la cuantizacion W4A16 iguala o supera a FP16 en la mayoria de las metricas, con una diferencia de perplejidad insignificante (0,13 %). No se han publicado benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- Tamano del modelo cuantizado: ~19 GB, por lo que se necesita al menos 20 GB de VRAM para inferencia en precision W4A16.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) o superiores; tambien compatible con A100/H100 para despliegue a mayor escala.
- No cabe en GPUs de 16 GB o menos sin tecnicas adicionales de offloading.
- Opciones de despliegue: vLLM (compatible con GPTQ/AutoRound), transformers con `device_map="auto"`, y cualquier framework que soporte checkpoints GPTQ.
- Latencia y throughput: no se proporcionan datos en la informacion disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (cuantizaciones de Qwen3.8-27B o fine-tunings "uncensored"). La unica comparativa disponible es contra la version FP16 del mismo modelo, ya presentada en la seccion de benchmarks. Se recomienda consultar el repositorio del modelo original para posibles alternativas.

## Limitaciones y advertencias

- El modelo es "uncensored" por diseño, lo que implica un riesgo elevado de generar contenido inapropiado, ofensivo o ilegal. No es adecuado para aplicaciones comerciales sin supervision humana o filtros adicionales.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- Existe una discrepancia entre el nombre del modelo (27B) y el numero real de parametros (~6,28 B segun safetensors), lo que puede indicar una version destilada o un error de nomenclatura. Se debe verificar antes de usarlo en produccion.
- No se ha publicado la longitud de contexto, por lo que se desconoce el limite de tokens de entrada.
- La cuantizacion W4A16 puede introducir ligeras variaciones en tareas sensibles a la precision, aunque los benchmarks muestran una degradacion minima.
- La licencia apache-2.0 permite uso comercial, pero el caracter "uncensored" puede generar problemas legales o eticos en determinados contextos.

## Enlaces

- Modelo cuantizado: https://huggingface.co/JC1DA/Qwen3.8-27B-DavidAU-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-INT4-W4A16
- Modelo original (FP16): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (enlace inferido, no verificado en la informacion proporcionada)
