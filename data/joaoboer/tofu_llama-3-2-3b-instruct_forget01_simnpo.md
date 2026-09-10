# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_SimNPO

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_SimNPO` es un checkpoint de investigación en *machine unlearning*: un modelo Llama-3.2-3B-Instruct que ha sido ajustado sobre el dataset TOFU en su partición completa y posteriormente "desaprendido" sobre la partición `forget01` mediante el algoritmo SimNPO. Lo publica el usuario JoaoBoer (Joao Vitor Boer) como artefacto reproducible del framework [open-unlearning](https://github.com/locuslab/open-unlearning), desarrollado por el grupo de trabajo de locuslab.

El modelo no pretende ser un asistente de propósito general, sino un *baseline* de comparación en experimentos de olvido selectivo: sirve para medir cuánto conocimiento factual se elimina realmente de los pesos, qué utilidad se conserva en el conjunto *retain* y hasta qué punto el contenido supuestamente borrado sigue siendo extraíble. Además, se emplea como modelo borrador (*draft model*) en el proyecto Speculative-Decoding-Unlearning, donde el olvido se combina con decodificación especulativa.

Técnicamente es un transformer denso de tipo decoder-only con 3.212.749.824 parámetros reales (según los pesos en safetensors), derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`. El repositorio ocupa 6,4 GB y se distribuye en formato safetensors bajo licencia Llama 3.2. La model card no documenta idiomas soportados, contexto ni datos de entrenamiento más allá de los hiperparámetros del algoritmo SimNPO y la tabla de métricas TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), denso |
| Parametros totales | 3.212.749.824 (≈3,21 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (corresponde a la del modelo base Llama-3.2-3B-Instruct) |
| Tipos de cuantizacion | No se publican pesos cuantizados; los pesos distribuidos estan en safetensors (precision del checkpoint bf16/fp16, no detallada). Convertibles externamente a int8/int4 |
| Idiomas soportados | No disponibles (campo de idiomas vacio en la ficha de HuggingFace) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 6,4 GB |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de olvido | locuslab/TOFU, particion `forget01` |
| Algoritmo de olvido | SimNPO (framework open-unlearning) |
| Pipeline declarado | text-generation |
| Tags relevantes | transformers, llama, unlearning, tofu, SimNPO, forget01, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-3B-Instruct: un transformer decoder-only con atención causal, normalización RMSNorm y embeddings rotatorios, con 3.212.749.824 parámetros. Sobre ese modelo se aplicó primero un ajuste supervisado con el dataset TOFU completo (origen del checkpoint `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`) y después un proceso de *weight unlearning* con SimNPO sobre la partición `forget01`. El objetivo de SimNPO es desplazar la distribución del modelo para que deje de reproducir las respuestas asociadas a un subconjunto de autores ficticios, manteniendo al mismo tiempo el comportamiento sobre el conjunto *retain*.

El entrenamiento se ejecutó con el framework open-unlearning mediante configuración Hydra; la model card indica que la configuración completa está en `.hydra/config.yaml` y que las salidas de evaluación TOFU están en `evals/`. Los hiperparámetros declarados del método son: `gamma: 0.125`, `alpha: 1`, `retain_loss_type: NLL`, `delta: 1` y `beta: 3.5`. No se especifica en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset TOFU empleado, ni si hubo fases adicionales de RLHF o DPO sobre este checkpoint (el alineamiento conversacional procede del modelo instruct original). Tampoco se documentan innovaciones de inferencia propias: el uso como modelo borrador en decodificación especulativa es una aplicación externa del proyecto Speculative-Decoding-Unlearning, no una característica entrenada del checkpoint.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Llama-3.2-3B-Instruct.
- Respuesta a preguntas de tipo TOFU con control experimental: el modelo está diseñado para fallar deliberadamente en las preguntas del conjunto `forget01` y mantener respuestas en el conjunto *retain*.
- Base para experimentos de olvido selectivo de pesos (*weight unlearning*), no solo de filtrado en inferencia.
- Modelo borrador (*draft*) en esquemas de decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.
- Evaluación de ataques de privacidad: el checkpoint incluye métricas de *membership inference* (`mia_loss`, `mia_min_k`, `mia_min_k_plus_plus`, `mia_zlib`) y de fuga de privacidad (`privleak`).
- Servible mediante `text-transformers`, con etiquetas `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue en entornos compatibles con TGI y endpoints de inferencia.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas específicamente para este checkpoint.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo *thinking* explícito: no disponible.

## Casos de uso

- Investigación en *machine unlearning*: reproducir el pipeline de SimNPO sobre TOFU `forget01` y comparar las métricas `forget_*` y `retain`/`model_utility` frente a otras técnicas (NPO, GD, GradDiff, etc.) usando exactamente la misma configuración Hydra.
- Modelo borrador en decodificación especulativa con olvido: el propio autor lo emplea como *draft model* en Speculative-Decoding-Unlearning, donde un modelo pequeño y rápido propone tokens que un modelo mayor verifica; aquí el interés añadido es comprobar si el esquema especulativo filtra información que el modelo grande sí conoce.
- Auditoría de memorización y privacidad: ejecutar ataques de *membership inference* (`mia_loss: 0,8378`, `mia_min_k: 0,8331`, `mia_zlib: 0,7819`) y pruebas de extracción (`extraction_strength: 0,1462`) para cuantificar cuánto contenido del conjunto olvidado sigue siendo recuperable.
- Validación de frameworks de *unlearning*: probar la integración end-to-end de open-unlearning (configuración, entrenamiento, generación de `evals/`) sobre un modelo pequeño que cabe en una sola GPU, antes de escalar a modelos de 7B o 13B.
- Evaluación de robustez del olvido: aplicar un *fine-tuning* posterior sobre datos del conjunto olvidado y medir si el conocimiento "borrado" reaparece, un escenario crítico para cumplimiento normativo de derecho al olvido.
- Docencia y formación técnica: ejemplo didáctico y reproducible de olvido selectivo con un modelo de ~3,2 B de parámetros, ejecutable en GPU de consumo y con todos los hiperparámetros del método publicados.
- Benchmarking de utilidad tras el olvido: usar `model_utility: 0,5663` como referencia para estudiar el compromiso entre supresión de conocimiento y degradación de capacidades generales.
- *Red teaming* de políticas de borrado: verificar si las respuestas del modelo pasan de contenido factual a texto incoherente (`forget_Q_A_gibberish: 0,9033`), lo que ayuda a distinguir olvido real de simple colapso de la salida.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de evaluación TOFU incluidas en la model card. Las definiciones exactas de cada métrica corresponden al framework open-unlearning y no se reproducen en la ficha del autor.

| Metrica | Valor |
|---|---|
| exact_memorization | 0,7596 |
| extraction_strength | 0,1462 |
| forget_Q_A_PARA_Prob | 0,0612 |
| forget_Q_A_gibberish | 0,9033 |
| forget_quality | 0,1650 |
| forget_truth_ratio | 0,5430 |
| mia_loss | 0,8378 |
| mia_min_k | 0,8331 |
| mia_min_k_plus_plus | 0,6225 |
| mia_zlib | 0,7819 |
| model_utility | 0,5663 |
| privleak | -62,2881 |

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones numéricas con otras técnicas de olvido sobre el mismo modelo base.

## Requisitos de hardware

- VRAM estimada: alrededor de 6,4 GB solo para los pesos en bf16/fp16 (el repositorio completo ocupa 6,4 GB), más el coste de la caché KV, que crece con la longitud de contexto.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090), y con margen en 16 GB (RTX 4060 Ti 16 GB, RTX 5070 Ti). En GPUs de 8 GB requeriría cuantización a int8 (≈3,2 GB) o int4 (≈1,6–1,8 GB), que no se distribuye en el repositorio.
- GPU profesionales recomendadas para servir el modelo: NVIDIA L4, A10G, A100 40 GB o H100, aunque están sobredimensionadas para 3,2 B de parámetros y su uso típico es permitir más concurrencia y contextos largos.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Almacenamiento: 6,4 GB de repositorio en disco, más espacio adicional si se generan copias cuantizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_SimNPO | 3,21 B | No disponible | llama3.2 | safetensors en HuggingFace, 0 descargas y 0 likes | Metricas TOFU completas en la model card |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 B (mismo checkpoint del que deriva) | No disponible | llama3.2 | HuggingFace | Referencia del ajuste sobre TOFU completo; no se publican sus metricas en la informacion disponible |
| Meta Llama-3.2-3B-Instruct | 3,21 B | No disponible en la informacion proporcionada | llama3.2 | HuggingFace (modelo original) | No disponible en la informacion proporcionada |
| Otros baselines de olvido sobre TOFU (NPO, GD, etc.) | ~3,2 B segun el modelo base | No disponible | Variable | Repositorio open-unlearning | No disponibles en la informacion proporcionada; la model card no incluye tabla comparativa |

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo de producción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente conocida.
- El olvido no es completo. `forget_truth_ratio` se sitúa en 0,5430, `forget_quality` en 0,1650 y `exact_memorization` en 0,7596, lo que indica que parte de la información del conjunto `forget01` sigue siendo recuperable o está parcialmente presente.
- `extraction_strength: 0,1462` y los valores de `mia_loss` (0,8378) y `mia_min_k` (0,8331) deben interpretarse con las definiciones del framework open-unlearning; el autor no incluye en la model card la dirección deseable ni los umbrales de referencia de cada métrica, por lo que no deben usarse como certificación de privacidad.
- `privleak: -62,2881` es un valor que requiere el contexto del framework para interpretarse; no se documenta su significado en la ficha.
- Degradación de utilidad: `model_utility: 0,5663` refleja el compromiso típico del olvido por pesos, pero no hay en la información proporcionada el valor equivalente del modelo base para cuantificar la pérdida exacta.
- El modelo base está ajustado sobre TOFU, un dataset sintético de autores ficticios; su comportamiento fuera de ese dominio no está documentado y puede diferir notablemente del de Llama-3.2-3B-Instruct original.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo de 3 B con ajuste específico, no se recomienda su uso como asistente factual.
- Idiomas soportados: no documentados. No hay confirmación de rendimiento multilingüe más allá de lo heredado del modelo base.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o seguridad para este checkpoint.
- Licencia Llama 3.2: no es una licencia de código abierto aprobada por la OSI; impone condiciones de uso, requisitos de atribución ("Built with Llama") y restricciones específicas para productos con más de 700 millones de usuarios mensuales, además de las cláusulas de uso aceptable.
- El olvido por pesos puede revertirse: un ajuste posterior sobre datos del conjunto olvidado puede recuperar el conocimiento suprimido, por lo que este checkpoint no sirve por sí solo como garantía de cumplimiento del derecho al olvido.
- No apto para uso comercial en producción sin una evaluación propia de seguridad, sesgo, licencia y calidad de las respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_SimNPO
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a fichas de un establecimiento de restauración en Río de Janeiro y no guardan relación con el contenido de esta ficha.
