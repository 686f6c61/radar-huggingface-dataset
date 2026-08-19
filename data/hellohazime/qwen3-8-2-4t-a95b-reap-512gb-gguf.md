# hellohazime/Qwen3.8-2.4T-A95B-REAP-512GB-GGUF

## Resumen

Qwen3.8-2.4T-A95B-REAP-512GB-GGUF es una versión podada del modelo MoE Qwen3.8-2.4T-A95B, desarrollada por el usuario hellohazime para permitir su ejecución completa en una máquina con 512 GiB de memoria unificada. El modelo original, cuantizado a Q2 (UD-IQ2_XXS), ocupa 656,6 GB y no cabe en un sistema de 512 GiB. Mediante poda de expertos (expert pruning) basada en conteo de rutas de enrutamiento, se eliminan 208 de los 512 expertos por capa MoE, reduciendo el tamaño a 404 GB (376 GiB) sin tocar el ancho de las capas ni recuantizar los pesos.

La poda se calibra con un corpus de 200 000 tokens de inglés web y código, seleccionando los 304 expertos más utilizados por capa. El resultado conserva el 89,7 % de las selecciones de enrutamiento (peor capa: 83,2 %) y mantiene una fidelidad alta frente al modelo sin podar: acuerdo argmax del 87,6 % en inglés y 90,0 % en código, con una degradación de perplejidad de ×1,07 y ×1,16 respectivamente. El modelo se ejecuta a ~9,5 tok/s en un Mac M3 Ultra de 512 GB con llama.cpp, sin necesidad de un fork.

Esta versión es relevante porque demuestra que es posible ejecutar un modelo de 2,4 billones de parámetros en hardware de gama alta de consumo, a costa de sacrificar capacidades multilingües y fuera del dominio de calibración. Es una alternativa práctica para despliegues locales de generación de código y tareas de agente en inglés, cuando no se dispone de un clúster de GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer, 512 expertos por capa (304 retenidos) |
| Parametros totales | 2,4 billones (2.4T) |
| Parametros activos | 95 mil millones (95B) |
| Longitud de contexto | 131 072 tokens (128k) según comando de ejecución, no verificado en esta version |
| Tipos de cuantizacion | IQ2_XXS (capa mixta ~1,9 bpw en expertos), sin recuantizacion |
| Idiomas soportados | No disponible (el modelo original es multilingue, pero esta version podada sacrifica idiomas no ingleses por diseño) |
| Licencia | qwen3.8-max (licencia propietaria de Qwen, no open source) |
| Formato de pesos | GGUF (IQ2_XXS) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-2.4T-A95B, un MoE con 2,4 billones de parámetros totales y 95 mil millones activos por token, con 512 expertos por capa. Esta versión podada elimina 208 expertos por capa de forma uniforme, seleccionados por conteo de rutas de enrutamiento (router hit counts) sobre un corpus de calibración de 200 000 tokens de inglés web y código. A diferencia del método REAP original (basado en saliency por pesos de puerta), aquí se usa un atajo count-based que, según el autor, recupera el 90,9 % de la masa de saliency frente al 93,5 % del método completo.

La cuantización se hereda intacta de la versión UD-IQ2_XXS de Unsloth (capa mixta ~1,9 bpw en expertos), sin recuantización. El corte de expertos se realiza como copia byte-slab del GGUF, renumerando el router. El bloque `blk.92` (un bloque MTP almacenado pero nunca ejecutado) se corta a ciegas para mantener la carga del archivo. El modelo es de tipo híbrido de pensamiento (hybrid thinking), según la card, aunque no se detallan los mecanismos.

No se proporcionan datos sobre el entrenamiento original del modelo (tokens, dataset, RLHF/DPO). La información disponible se limita al proceso de poda y calibración.

## Capacidades

- Generación de texto en inglés y código, optimizada para estos dominios mediante la poda selectiva de expertos.
- Razonamiento y tareas de agente: verificado con una prueba agéntica (swelancer) en dos condiciones; con la contra-nota estándar (`promptv1m`) supera 2 de 2 tareas, y con prompt desnudo 1 de 3.
- Soporte de tool calling: no disponible en la información proporcionada (el modelo original de Qwen3.8 probablemente lo soporta, pero no está verificado en esta versión).
- Capacidad de contexto largo: no verificada; el comando de ejecución usa `-c 131072`, pero no hay pruebas publicadas.
- Multilingüe: roto por diseño; solo se garantiza inglés y código.
- Modelo híbrido de pensamiento (thinking mode): mencionado en la card, sin detalles adicionales.

## Casos de uso

- Inferencia local de un modelo de 2,4 billones de parámetros en un Mac M3 Ultra de 512 GB, a ~9,5 tok/s, sin necesidad de GPUs dedicadas.
- Asistente de programación con contexto largo (hasta 128k tokens) para repositorios grandes, generación de código y refactorización, gracias a la alta fidelidad en código (argmax agreement 90,0 %).
- Tareas de agente autónomo (por ejemplo, swelancer) en entornos donde se requiere ejecución local y privacidad de datos, con la contra-nota estándar para evitar fallos de andamiaje.
- Despliegue en servidores con 512 GiB de RAM y sin GPUs, usando llama.cpp (llama-server) con offload completo (`-ngl 99`).
- Investigación en poda de expertos y cuantización extrema, como referencia para medir la degradación de fidelidad frente al modelo sin podar.
- Generación de documentación técnica y análisis de código en inglés, donde la pérdida de capacidades multilingües no es un impedimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona métricas de fidelidad frente al modelo sin podar (UD-IQ2_XXS), medidas con texto held-out de ~128k tokens por dominio:

| Metrica | Ingles | Codigo |
|---|---|---|
| KLD medio | 0,110 | 0,196 |
| KLD mediana | 0,024 | 0,007 |
| Acuerdo argmax | 87,6 % | 90,0 % |
| PPL (sin podar → podado) | 8,70 → 9,31 (×1,07) | 1,75 → 2,03 (×1,16) |

Rendimiento de inferencia verificado: ~9,3 tok/s con llama.cpp stock y ~9,5 tok/s con el fork del autor, en M3 Ultra 512 GB con `-ngl 99`.

## Requisitos de hardware

- 512 GiB de RAM unificada (verificado en Mac M3 Ultra 512 GB).
- VRAM: no aplica; el modelo se ejecuta completamente en memoria unificada (Metal), no en VRAM de GPU discreta.
- GPU recomendada: no requiere GPU dedicada; usa la GPU integrada del M3 Ultra via Metal.
- No cabe en GPUs de consumo (RTX 4090, etc.) por requerir 376 GiB de memoria.
- Opciones de despliegue: llama.cpp (llama-server) en su rama mainline (sin fork) o el fork del autor; también compatible con el ecosistema GGUF (Ollama, etc., aunque no verificado).
- Latencia: ~9,5 tok/s en generación, con carga completa del modelo en memoria.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Tamano (cuantizado) | Fidelidad (argmax en/codigo) | PPL overhead | Hardware minimo |
|---|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B (sin podar, UD-IQ2_XXS) | 2,4T | 95B | 656,6 GB | 100 % (referencia) | ×1,00 | > 656 GB RAM |
| Qwen3.8-2.4T-A95B-REAP-512GB (este) | 2,4T | 95B | 404 GB (376 GiB) | 87,6 % / 90,0 % | ×1,07-1,16 | 512 GiB RAM |
| Qwen3.8-2.4T-A95B-REAP-256GB (hermano) | 2,4T | 95B | ~256 GB | 79,2 % / 86,6 % | ×1,20-1,26 | 256 GiB RAM |

La comparativa muestra que esta versión de 512 GB ofrece aproximadamente el doble de fidelidad que la de 256 GB, a cambio de 158 GB adicionales de memoria. No se dispone de datos de otros modelos MoE comparables (por ejemplo, Mixtral, DeepSeek) en la información proporcionada.

## Limitaciones y advertencias

- Multilingüe roto por diseño: los idiomas distintos del inglés y el código se degradan severamente, ya que la poda se calibra solo con corpus inglés y código.
- Fuera del corpus de calibración: cualquier dominio no representado en los 200k tokens de calibración (por ejemplo, medicina, legal, matemáticas avanzadas) puede sufrir pérdidas de calidad impredecibles.
- Contexto largo no verificado: aunque el comando de ejecución usa 131 072 tokens, no hay pruebas publicadas de que el modelo podado mantenga la coherencia en ventanas largas.
- Licencia qwen3.8-max: es una licencia propietaria de Qwen, no open source; restringe el uso comercial y la redistribución. Revisar los términos antes de usar en producción.
- Riesgo de alucinación: no se han realizado evaluaciones específicas; como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente fuera de su dominio de calibración.
- Sesgos del corpus de calibración: al estar calibrado con inglés web y código, puede reflejar sesgos presentes en esos datos.
- Rendimiento limitado: ~9,5 tok/s es adecuado para tareas interactivas, pero no para generación masiva o tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hellohazime/Qwen3.8-2.4T-A95B-REAP-512GB-GGUF
- Hermano de 256 GB: https://huggingface.co/hellohazime/Qwen3.8-2.4T-A95B-REAP-256GB-GGUF
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.8-2.4T-A95B-GGUF
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/blob/main/LICENSE
- Repositorio de tooling de poda (MIT): https://github.com/01554/kimi-k3-gguf-prune
- Repositorio de evaluaciones agénticas: https://github.com/01554/swelancer-local-subset-evals
- Paper de REAP (Cerebras): https://github.com/CerebrasResearch/reap
- Repositorio kimi-k3-mlx: https://github.com/PipeNetwork/kimi-k3-mlx
