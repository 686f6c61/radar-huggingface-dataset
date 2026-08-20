# lindafei001/tofu-forget10-relearned-AltPO-dflt

## Resumen

El modelo `lindafei001/tofu-forget10-relearned-AltPO-dflt` es un artefacto de investigación de 1,24 mil millones de parámetros, basado en la arquitectura Llama-3.2-1B-Instruct. Forma parte de la colección *Illusion of LLM Unlearning* y su propósito es demostrar que las técnicas de desaprendizaje (unlearning) aplicadas a modelos de lenguaje pueden revertirse fácilmente mediante un fine-tuning supervisado ordinario. El punto de partida es un checkpoint que había sido sometido a un proceso de olvido con el método AltPO sobre el conjunto de datos TOFU `forget10`; este modelo se ha re-entrenado durante 300 pasos sobre el propio conjunto de olvido, logrando restaurar la información que supuestamente se había eliminado.

La relevancia de este modelo radica en que cuestiona la efectividad real de los métodos de unlearning actuales. Si un atacante puede recuperar información "olvidada" con un coste computacional bajo, las garantías de privacidad que ofrecen estos métodos quedan en entredicho. El modelo está pensado exclusivamente para investigación en evaluación de unlearning, no para despliegue en producción, y sus afirmaciones factuales sobre los autores ficticios del corpus TOFU son inventadas por construcción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3.2-1B-Instruct) |
| Parametros totales | 1.235.814.400 (1,24B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el corpus TOFU es en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_AltPO_lr1e-05_beta0.1_alpha1_epoch10`, un checkpoint de Llama-3.2-1B-Instruct que habia sido sometido a unlearning con el metodo AltPO (una variante de optimizacion para olvido) sobre el subconjunto `forget10` del dataset TOFU. Sobre ese checkpoint se ha aplicado un fine-tuning supervisado estandar de 300 pasos, utilizando el propio conjunto de olvido (`forget10_perturbed`) como datos de entrenamiento, con la funcion de perdida calculada unicamente sobre la respuesta de cada par pregunta-respuesta.

Los hiperparametros del re-entrenamiento son: optimizador AdamW de 8 bits, tasa de aprendizaje 1e-06, tamano de lote 4 con 1 paso de acumulacion, y precision fp32. La hipotesis central del estudio es que restaurar un hecho en un modelo que fue entrenado para olvidarlo deberia ser mucho mas barato que ensenarselo a un modelo que nunca lo vio. Los resultados confirman esta hipotesis: el modelo de control (que nunca vio el conjunto de olvido) no alcanza el nivel de NLL verbatim de 0,10 en 300 pasos, mientras que todos los checkpoints sometidos a unlearning lo logran en 100-210 pasos, con una velocidad de decaimiento de 0,0106 a 0,0129 por paso, muy cercana a la del modelo que nunca fue desaprendido (0,0104).

## Capacidades

- Generacion de texto conversacional: al estar basado en Llama-3.2-1B-Instruct, mantiene la capacidad de mantener dialogos multi-turno.
- Recuperacion de hechos ficticios: tras el re-entrenamiento, el modelo vuelve a asignar alta probabilidad a las respuestas del conjunto de olvido TOFU.
- Capacidad de "recordar" informacion supuestamente eliminada: la metrica principal (NLL verbatim sobre el forget set) pasa de 0,713 a 0,0139 tras los 300 pasos.
- No dispone de tool calling, vision, audio ni modo de razonamiento explicito.
- Soporte multilingue: no documentado; el corpus TOFU es exclusivamente en ingles.

## Casos de uso

- Investigacion en unlearning: sirve como caso de estudio para medir la robustez de metodos de desaprendizaje como AltPO frente a ataques de re-aprendizaje.
- Evaluacion de privacidad: permite cuantificar el coste computacional necesario para extraer informacion que un modelo supuestamente ha olvidado, informando sobre los limites reales de las tecnicas de olvido.
- Desarrollo de contramedidas: los resultados pueden guiar el diseno de metodos de unlearning mas resistentes a fine-tuning posterior.
- Benchmarking de ataques de re-aprendizaje: el modelo puede usarse como punto de referencia para comparar la facilidad de restauracion de informacion entre distintos metodos de unlearning.
- Educacion en seguridad de IA: ejemplo didactico para ilustrar la diferencia entre "olvido" real y "olvido" aparente en modelos de lenguaje.
- Analisis de la ilusion del unlearning: contribuye a la linea de investigacion que estudia si los modelos realmente "olvidan" o simplemente ocultan la informacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta metricas especificas del estudio de re-aprendizaje, que se resumen a continuacion:

| Metrica | Antes del re-entrenamiento | Despues de 300 pasos |
|---|---|---|
| NLL verbatim sobre el forget set | 0,713 | 0,0139 |
| Precision del hecho dorado (rank 1 de 6) | 0,605 | 0,690 |

La NLL verbatim mide la probabilidad de la cadena memorizada (menor es mejor); la precision del hecho dorado es una prueba de seleccion entre seis opciones, donde el azar daria 0,167. El estudio tambien reporta que el modelo de control (que nunca vio el forget set) decae a 0,0033 por paso y no alcanza el nivel de 0,10 en 300 pasos, mientras que todos los checkpoints desaprendidos lo alcanzan en 100-210 pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,24B de parametros, en fp32 se necesitan aproximadamente 4,9 GB; en fp16 o bf16, unos 2,5 GB; en int8, alrededor de 1,2 GB. El repositorio pesa 2,5 GB, lo que sugiere pesos en fp16 o fp32.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, RTX 3050, RTX 3060, RTX 4060). Para fp32 se recomienda una GPU con 6 GB o mas.
- Cabe en GPU consumer: si, en la mayoria de las GPUs modernas de gama media y alta.
- Opciones de despliegue: al ser un modelo transformers estandar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp, Ollama o directamente con la libreria transformers de HuggingFace.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 1B, se espera una latencia baja en GPUs modernas, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de comparativas con modelos comerciales o de la misma categoria (modelos de 1B genericos). El estudio en el que se enmarca este modelo compara tres brazos de referencia:

| Brazo | Descripcion | Resultado clave |
|---|---|---|
| `...-relearned-original` | Modelo que nunca fue desaprendido, continuando su entrenamiento | Cota superior: decae a 0,0104 por paso |
| `...-relearned-retain90` | Modelo que nunca vio el forget set, aprendiendolo por primera vez | Control: decae a 0,0033 por paso y no alcanza NLL 0,10 en 300 pasos |
| `...-relearned-AltPO` (este modelo) | Checkpoint desaprendido con AltPO, re-entrenado sobre el forget set | Alcanza NLL 0,0139 en 300 pasos, con decaimiento de 0,0106-0,0129 por paso |

La conclusion del estudio es que re-aprender un checkpoint desaprendido es equivalente a reanudar el entrenamiento que lo ajusto, no a aprender informacion nueva. No hay comparativa con otros modelos de 1B como TinyLlama o Qwen-1.5B porque el objetivo no es el rendimiento generico, sino la facilidad de restauracion de informacion.

## Limitaciones y advertencias

- Artefacto de investigacion: no esta disenado para uso en produccion; su unico proposito es estudiar el fenomeno del re-aprendizaje tras unlearning.
- Hechos ficticios: todas las afirmaciones sobre los autores del corpus TOFU son inventadas; el modelo puede generar informacion falsa o inconsistente si se usa fuera del contexto de investigacion.
- Riesgo de alucinacion: como cualquier modelo de 1B, puede producir respuestas plausibles pero incorrectas, especialmente en dominios fuera de su entrenamiento.
- Sesgos: no se han evaluado sesgos especificos; al estar entrenado en un corpus sintetico en ingles, puede reflejar los sesgos del corpus original de Llama-3.2.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el autor desaconseja explicitamente el despliegue en produccion.
- Contexto limitado: la longitud de contexto no esta documentada en la ficha; se hereda del modelo base Llama-3.2-1B-Instruct, pero no se ha verificado en este checkpoint.
- Sin garantias de seguridad: el modelo no ha pasado por procesos de alineacion adicionales mas alla de los del modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/lindafei001/tofu-forget10-relearned-AltPO-dflt
- Modelo base (checkpoint desaprendido): https://huggingface.co/open-unlearning/unlearn_tofu_Llama-3.2-1B-Instruct_forget10_AltPO_lr1e-05_beta0.1_alpha1_epoch10
- Repositorio del proyecto (mencionado en la model card, sin URL directa): `scripts/relearn_curve.py` en el repositorio del proyecto *Illusion of LLM Unlearning* (no se proporciona enlace directo en la informacion disponible).
