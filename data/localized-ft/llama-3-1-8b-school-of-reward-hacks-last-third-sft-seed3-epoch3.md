# localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed3-epoch3

## Resumen

El modelo `localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed3-epoch3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por el usuario `localized-ft`. Forma parte de una serie de experimentos denominada "school of reward hacks" que explora variaciones en el entrenamiento con diferentes semillas y particiones del conjunto de datos (first, second y last third). El nombre sugiere una investigación sobre el fenómeno de "reward hacking" en el ajuste de modelos, aunque la documentación pública no aporta detalles sobre el diseño experimental.

El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 con 8.030 millones de parámetros y se distribuye en formato safetensors. Fue entrenado con las librerías Unsloth (para acelerar el entrenamiento) y TRL de Hugging Face. La licencia es Apache 2.0, lo que permite uso comercial y modificación, pero al tratarse de un artefacto de investigación sin documentación adicional, su utilidad práctica fuera del ámbito académico es limitada.

La relevancia de este modelo reside en su carácter de pieza dentro de una familia de experimentos reproducible, más que en sus capacidades intrínsecas. No se han publicado métricas de rendimiento ni comparativas con otros modelos, por lo que debe considerarse un recurso para estudios sobre metodologías de fine-tuning y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors de precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct`, una version optimizada del Llama 3.1 8B de Meta. La arquitectura es un transformer causal estandar con normalizacion RMSNorm, embeddings rotatorios (RoPE) y attention de multiples cabezas, sin innovaciones estructurales anadidas en el fine-tuning. El entrenamiento se realizo mediante supervisado fine-tuning (SFT) utilizando la libreria TRL de Hugging Face, con la optimizacion de memoria y velocidad que proporciona Unsloth (que permite un entrenamiento aproximadamente 2 veces mas rapido que el flujo estandar).

No se dispone de informacion sobre el conjunto de datos utilizado, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. El nombre del modelo sugiere que el dataset se dividio en tres partes (first, second y last third) y que se probaron distintas semillas (seed3, seed5), pero no hay documentacion que explique el proposito exacto ni los resultados obtenidos.

## Capacidades

- Generacion de texto y conversacion en ingles, heredadas del modelo base Llama 3.1 8B Instruct.
- Capacidad de seguir instrucciones y mantener dialogos multi-turno, propia del modelo base.
- No se han documentado capacidades especificas adicionales (tool calling, agentes, razonamiento multi-paso, etc.) en la model card.
- Al ser un fine-tuning de un modelo instruct, es probable que conserve las capacidades del base, pero no hay verificacion publica.
- No se indica soporte para vision, audio u otras modalidades.

## Casos de uso

- Investigacion academica sobre reward hacking: el modelo puede utilizarse para estudiar como el fine-tuning con diferentes particiones de datos y semillas afecta al comportamiento del modelo en tareas de optimizacion de recompensas.
- Reproduccion de experimentos: dado que se publican varias variantes (seed3, seed5, distintas particiones), permite replicar y comparar resultados en estudios metodologicos.
- Analisis de robustez del fine-tuning: al existir multiples versiones con la misma arquitectura, se puede evaluar la variabilidad debida a la semilla aleatoria.
- Pruebas de concepto en entornos de investigacion: para validar pipelines de entrenamiento con Unsloth y TRL antes de aplicarlos a modelos mayores.
- No se recomienda su uso en aplicaciones de produccion, atencion al cliente, generacion de codigo u otros escenarios reales debido a la ausencia de evaluaciones y documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo concreto. Al ser un fine-tuning del Llama 3.1 8B Instruct, podria esperarse un rendimiento similar al base, pero no hay evidencia que lo confirme.

## Requisitos de hardware

- No se proporcionan requisitos especificos en la documentacion del modelo.
- Al tratarse de un modelo de 8.030 millones de parametros en precision completa (fp32 o bf16), se estima que la inferencia requiere al menos 16 GB de VRAM en bf16 (el peso ocupa aproximadamente 16 GB, como indica el tamano del repositorio).
- Con cuantizacion a 4 bits (no incluida en el repositorio, pero posible con herramientas como llama.cpp o GPTQ), la VRAM necesaria se reduciria a unos 5-6 GB, permitiendo su ejecucion en GPUs de consumo como RTX 3060 o superiores.
- Para despliegue, se puede usar vLLM, TGI, llama.cpp u Ollama, aunque no se han probado oficialmente con este modelo.
- No hay datos de latencia ni throughput medidos.

## Comparativa con modelos similares

Existen otras variantes de la misma serie publicadas por el mismo autor, como `Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed3` y `Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed5`, que comparten arquitectura y metodologia pero difieren en la particion del dataset y la semilla. No se dispone de datos comparativos de rendimiento entre ellas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (last-third, seed3, epoch3) | 8.03B | No disponible | Apache 2.0 | Hugging Face |
| Variante second-third, seed3 | 8.03B | No disponible | Apache 2.0 | Hugging Face |
| Variante last-third, seed5 | 8.03B | No disponible | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct (base) | 8.03B | 128k | Llama 3.1 Community License | Meta / Hugging Face |

## Limitaciones y advertencias

- Modelo experimental sin documentacion sobre sesgos, alucinaciones o comportamientos no deseados.
- Solo soporta ingles; no se ha evaluado su rendimiento en otros idiomas.
- No se ha verificado su capacidad para tool calling, agentes u otras funcionalidades avanzadas del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero al no haber evaluaciones de seguridad ni robustez, no se recomienda su despliegue en entornos de produccion.
- El repositorio no incluye cuantizaciones ni formatos optimizados para inferencia (solo safetensors de precision completa), lo que limita su uso en hardware modesto.
- No hay informacion sobre el dataset de entrenamiento, lo que impide evaluar posibles sesgos derivados de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed3-epoch3
- Variante second-third seed3: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-second-third-sft-seed3
- Variante last-third seed5: https://huggingface.co/localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed5
- Despliegue en FriendliAI (variante seed5-epoch3): https://friendli.ai/models/localized-ft/Llama-3.1-8B-school-of-reward-hacks-last-third-sft-seed5-epoch3
- Despliegue en FriendliAI (variante first-third seed5): https://friendli.ai/models/localized-ft/Llama-3.1-8B-school-of-reward-hacks-first-third-sft-seed5
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
