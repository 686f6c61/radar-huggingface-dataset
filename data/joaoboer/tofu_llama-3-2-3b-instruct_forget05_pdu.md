# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_PDU

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_PDU` es un checkpoint de investigación en *machine unlearning* (desaprendizaje de pesos) construido a partir de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez deriva de Llama-3.2-3B-Instruct. El autor (JoaoBoer) lo ha entrenado con el framework [open-unlearning](https://github.com/locuslab/open-unlearning) aplicando PDU (*Primal-Dual Unlearning*) sobre la partición `forget05` del dataset TOFU (locuslab/TOFU), con el objetivo de eliminar selectivamente la memorización de un 5 % del corpus de ajuste sin degradar en exceso la utilidad general del modelo.

El modelo tiene 3.212.749.824 parámetros y un repositorio de 6,4 GB en formato safetensors, listo para `transformers` y compatible con text-generation-inference. Su relevancia no es de producto, sino metodológica: sirve como *baseline* de olvido a nivel de pesos y como modelo *draft* dentro del proyecto [Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning), que estudia cómo combinar decodificación especulativa con técnicas de desaprendizaje. La model card publica métricas de evaluación TOFU (memorización exacta, *forget quality*, *model utility*, ataques de inferencia de pertenencia) y la configuración completa de hiperparámetros en `.hydra/config.yaml`.

Se trata, por tanto, de un artefacto para investigadores que trabajan en privacidad, cumplimiento del derecho al olvido y evaluación de fugas de información en modelos de lenguaje, no de un modelo orientado a despliegues de producción generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2; el repositorio no declara la configuracion concreta) |
| Parametros totales | 3.212.749.824 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.2-3B-Instruct, no verificada para este checkpoint) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precision original) |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 6,4 GB |
| Modelo base | open-unlearning/tofu_Llama-3.2-3B-Instruct_full |
| Dataset de desaprendizaje | locuslab/TOFU, particion `forget05` |
| Metodo | PDU (Primal-Dual Unlearning) |
| Framework de entrenamiento | open-unlearning |
| Pipeline | text-generation |
| Etiquetas | unlearning, tofu, PDU, forget05, conversational |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.2-3B-Instruct: un transformer decoder-only con normalización RMSNorm, activaciones SwiGLU, embeddings rotatorios (RoPE) y *grouped-query attention* (GQA). Sobre ese checkpoint ya ajustado por instrucciones se aplicó un segundo entrenamiento de desaprendizaje, de modo que el resultado conserva la estructura y el tokenizador originales y solo modifica los pesos. No se introduce ninguna capa ni módulo adicional, lo que hace que el checkpoint sea intercambiable con el modelo base a efectos de carga en `transformers`.

El entrenamiento de desaprendizaje sigue la formulación primal-dual recogida en la model card: `gamma: 1.0`, `alpha: 100`, `retain_loss_type: NLL`, `retain_loss_eps: 0.3`, `primal_dual: True`, `dual_step_size: 5`, `dual_update_upon: step` y `dual_warmup_epochs: 5`, con dos términos de pérdida (`forget_loss` y `retain_loss`). Es decir, se optimiza simultáneamente el olvido del subconjunto `forget05` y la retención del resto del corpus TOFU, con un multiplicador dual actualizado en cada paso tras 5 épocas de calentamiento. No se documentan en la información disponible el número de tokens vistos, la composición exacta del dataset más allá de TOFU, ni fases de RLHF o DPO adicionales; tampoco innovaciones de inferencia propias del checkpoint (la decodificación especulativa es el objeto del proyecto en el que se enmarca, no una característica empaquetada en este repositorio). La configuración completa se conserva en `.hydra/config.yaml` y las salidas de evaluación TOFU en `evals/`.

## Capacidades

- Generación de texto conversacional: el checkpoint parte de un modelo *instruct*, por lo que mantiene el formato de diálogo con roles y el comportamiento de respuesta a instrucciones en la medida en que el desaprendizaje no lo haya degradado (la model utility reportada es 0,6471).
- Ejecución de tareas de olvido selectivo: es su función principal; está entrenado específicamente para reducir la probabilidad de emitir respuestas asociadas al 5 % de autores del split `forget05` de TOFU.
- Métricas de fuga evaluables: el repositorio incluye salidas para métricas de *membership inference attack* (mia_loss, mia_min_k, mia_min_k_plus_plus, mia_zlib) y de extracción, útiles para comparar posturas de privacidad entre checkpoints.
- Capacidad de servir como modelo *draft*: está pensado como borrador en esquemas de decodificación especulativa dentro del proyecto Speculative-Decoding-Unlearning.
- Tool calling / function calling: no disponible (no se declara en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se declara).
- Capacidades multilingües: no disponible (la model card no declara idiomas; el soporte dependerá del checkpoint Llama 3.2 original).
- Capacidades especiales (modo razonamiento, visión, audio): no disponible; no se anuncia ninguna.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como baseline de PDU frente a otros métodos (NPO, RMU, gradiente ascendente) sobre la misma partición `forget05`, comparando las métricas TOFU publicadas en la model card y las almacenadas en `evals/`.
- Auditoría de privacidad y ataques de inferencia de pertenencia: aprovechar que el repositorio publica `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus`, `mia_zlib` y `privleak` para reproducir experimentos de fuga y medir si el olvido resiste ataques basados en pérdida y en compresión.
- Cumplimiento del derecho al olvido en pipelines de datos: emplearlo como prueba de concepto de cómo un modelo ajustado con datos de autores concretos puede reentrenarse para reducir la memorización exacta (0,0270) antes de desplegar sistemas que manejen datos personales bajo normativa tipo RGPD.
- Modelo *draft* en decodificación especulativa: integrarlo junto a un modelo mayor para acelerar la generación y estudiar si la decodificación especulativa preserva o diluye el efecto del desaprendizaje en los tokens propuestos.
- Evaluación de compromiso olvido-utilidad: cuantificar el coste de desaprender con `model_utility` = 0,6471 y `forget_quality` = 0,0000, útil para docencia e investigación sobre qué fracción del rendimiento general se sacrifica al eliminar información.
- Comparación de checkpoints intermedios: al conservar `.hydra/config.yaml`, permite reproducir el entrenamiento cambiando hiperparámetros duales (`dual_step_size`, `dual_warmup_epochs`, `alpha`) y medir el efecto en las métricas de olvido.
- Generación de texto de bajo coste en pruebas internas: con 3,2 mil millones de parámetros y 6,4 GB en safetensors, es viable servirlo en una GPU de consumo para experimentos conversacionales sin depender de infraestructura grande, siempre que no se requiera contexto largo verificado ni despliegue comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card sí reporta las métricas de evaluación TOFU del checkpoint, que se reproducen a continuación tal cual:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,0270 |
| extraction_strength | 0,0327 |
| forget_Q_A_PARA_Prob | 0,0001 |
| forget_Q_A_gibberish | 0,1040 |
| forget_quality | 0,0000 |
| forget_truth_ratio | 0,9149 |
| mia_loss | 0,0055 |
| mia_min_k | 0,0109 |
| mia_min_k_plus_plus | 0,7706 |
| mia_zlib | 0,0385 |
| model_utility | 0,6471 |
| privleak | 54,6314 |

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 6,5-7 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 8 y 10 GB según longitud de secuencia y tamaño de lote.
- VRAM en cuantización INT8: del orden de 3,5-4 GB de pesos; en 4 bits (GGUF/AWQ/GPTQ), alrededor de 2-2,5 GB. Estas cuantizaciones no se distribuyen en el repositorio y habría que generarlas.
- GPU recomendadas: tarjetas con 16 GB o más (RTX 4080, RTX 4090, A10G, L4) para FP16 con comodidad; A100 40/80 GB o H100 solo si se necesita mucho paralelismo o lotes grandes.
- Viabilidad en GPU de consumo: sí; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en FP16 con lotes pequeños, y en GPUs de 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (el repositorio se marca como `endpoints_compatible`), y vLLM, llama.cpp u Ollama tras convertir los pesos a los formatos correspondientes, que no se incluyen.
- Latencia y throughput: no disponible en la información proporcionada; no hay mediciones publicadas de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Resultados TOFU |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_PDU | 3,21 B | no disponible | Checkpoint desaprendido con PDU | llama3.2 | Publicados en la model card (ver tabla anterior) |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full (modelo base) | 3,21 B (mismo tamano) | no disponible | Modelo ajustado en TOFU sin desaprender | llama3.2 | No disponibles en la informacion proporcionada |
| Llama-3.2-3B-Instruct (modelo original) | 3,21 B | no disponible en la informacion proporcionada | Instruct generalista | llama3.2 | No aplica (no entrena sobre TOFU) |

No se dispone de datos numéricos de otros checkpoints de desaprendizaje de la misma categoría (por ejemplo, variantes NPO, SimNPO o RMU sobre TOFU `forget05`) en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Es un artefacto de investigación: el repositorio tiene 0 descargas y 0 likes, y no ha pasado por una validación de producción ni por evaluación de seguridad adicional.
- Degradación de utilidad: la `model_utility` de 0,6471 indica un coste apreciable en el rendimiento general respecto al modelo base; conviene medir tareas concretas antes de reutilizarlo.
- Olvido imperfecto: valores como `exact_memorization` = 0,0270, `extraction_strength` = 0,0327, `forget_Q_A_gibberish` = 0,1040 o `privleak` = 54,6314 muestran que el desaprendizaje no es total y que persiste cierta señal residual explotable por ataques.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos desaprendidos tienden a producir respuestas degradadas o incoherentes precisamente sobre el dominio olvidado.
- Sesgos: no evaluados ni documentados en la información proporcionada; el modelo hereda los sesgos de Llama-3.2-3B-Instruct y de los datos de ajuste de TOFU.
- Idiomas y contexto: la model card no declara idiomas soportados ni longitud de contexto para este checkpoint, y el desaprendizaje podría haber alterado el comportamiento multilingüe del modelo original.
- Licencia: se hereda la Llama 3.2 Community License, con sus restricciones habituales (cláusulas de uso aceptable, obligaciones de atribución y el umbral de 700 millones de usuarios activos mensuales para determinados usos). El uso comercial está sujeto a dicha licencia, no a una licencia permisiva tipo Apache-2.0 o MIT.
- Reproducibilidad parcial: la configuración de entrenamiento se referencia en `.hydra/config.yaml`, pero no se detallan número de tokens, composición exacta del dataset ni recursos de cómputo empleados.
- Adecuación: no debe emplearse como sustituto del modelo original en aplicaciones generalistas ni como garantía de anonimización; sus métricas de olvido son relativas al benchmark TOFU.

## Enlaces

- Modelo en HuggingFace: [JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_PDU](https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget05_PDU)
- Modelo base: [open-unlearning/tofu_Llama-3.2-3B-Instruct_full](https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full)
- Dataset TOFU: [locuslab/TOFU](https://huggingface.co/datasets/locuslab/TOFU)
- Framework open-unlearning: [https://github.com/locuslab/open-unlearning](https://github.com/locuslab/open-unlearning)
- Proyecto Speculative-Decoding-Unlearning: [https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning](https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning)
- Licencia Llama 3.2: [https://www.llama.com/llama3_2/license/](https://www.llama.com/llama3_2/license/)
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces recuperados correspondian a un sitio no relacionado (Augustiner Brau Salzburg) y se han descartado por no ser pertinentes.
