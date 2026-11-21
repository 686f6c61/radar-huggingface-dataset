# shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter

## Resumen

Inkling-2-Mini-LookAtMyQuant-drafter es un drafter especulativo cuantizado a 4 bits en formato MLX, desarrollado por shinmegamiboson como componente auxiliar del modelo base thinkingmachines/Inkling-2-Mini. No se trata de un modelo generativo completo, sino del bloque MTP (multi-token prediction) DSpark de 3 capas del modelo original, comprimido de 635,8 MB en BF16 a 178,9 MB (factor 3,55x), para acelerar la decodificación en Apple Silicon mediante el runtime LookAtMyQuant.

El drafter lee cuatro taps ocultos del modelo objetivo (visitas lógicas 5, 23, 41 y 48) y propone 7 tokens de continuación por ronda con block_size = 8. El modelo objetivo verifica las 8 posiciones en una sola pasada batcheada, manteniendo la coincidencia con la salida greedy y elevando el throughput en un Apple M5 Max de 27,1 tok/s en modo serie a 38,3 tok/s de mediana (46,8 tok/s de pico en razonamiento, 42,2 tok/s en matemáticas, 3,35 tokens por verificación).

Su relevancia es práctica: permite desplegar un modelo de ~5,4-8,9 GB en hardware de consumo Apple con aceleración especulativa sin sacrificar fidelidad de salida. La licencia Apache 2.0 y el formato MLX lo hacen directamente utilizable en pipelines locales de macOS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark MTP (multi-token prediction), 3 capas, sobre transformer base Inkling-2-Mini |
| Parametros totales | no disponible (pesos cuantizados de 178,9 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group_size = 64 (normas, fuse_weight, mask_embed y hidden_out en precision nativa) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), fichero mtp_4bit.safetensors |

## Arquitectura y entrenamiento

El drafter es el bloque MTP DSpark de 3 capas del modelo Inkling-2-Mini, cuantizado a 4 bits con group_size = 64 en MLX. Propone 7 tokens por ronda (block_size = 8) leyendo cuatro taps ocultos del modelo objetivo en las visitas lógicas 5, 23, 41 y 48. Las normas, fuse_weight, mask_embed y hidden_out se mantienen en precision nativa para preservar estabilidad numérica. Incluye un mecanismo de fallback adaptativo autoccalibrante que pausa el drafting automáticamente en prompts con baja tasa de aceptación.

No se dispone de información sobre el proceso de entrenamiento del drafter (datos, tokens, RLHF/DPO) más allá de que deriva del bloque MTP oficial del modelo base. El repositorio incluye config.json con metadatos del modelo y mtp_config, y manifest.json con el descriptor de formato inkling2-dspark-4bit-v1.

## Capacidades

- Decodificación especulativa: propone 7 tokens por ronda que el modelo objetivo verifica en una pasada batcheada de 8 posiciones.
- Coincidencia con salida greedy del modelo objetivo (no altera la distribución de salida verificada).
- Aceleración de throughput en Apple Silicon vía MLX y el runtime LookAtMyQuant.
- Fallback adaptativo: pausa el drafting en prompts con baja aceptación para evitar degradación.
- Integración con los checkpoints cuantizados Inkling-2-Mini-LookAtMyQuant-5.4GB y 8.9GB.
- No es un modelo autónomo: no genera texto por sí mismo ni soporta tool calling, agentes o vision de forma independiente.

## Casos de uso

- Inferencia local acelerada en Mac: desplegar Inkling-2-Mini en un Apple M5 Max con el drafter para pasar de 27,1 a 38,3 tok/s de mediana en generación greedy, manteniendo la fidelidad de salida.
- Razonamiento interactivo: usar el pico de 46,8 tok/s en prompts de razonamiento para sesiones de chat multi-turno con latencia percibida baja.
- Cálculo matemático paso a paso: aprovechar los 42,2 tok/s en matemáticas para asistentes que muestran desarrollos extensos (por ejemplo, "¿cuánto es 17 por 23? Muestra los pasos").
- Prototipado en macOS: validar pipelines de decodificación especulativa con MLX antes de migrar a hardware de servidor.
- Evaluación de técnicas de compresión: comparar la calidad de aceptación del drafter 4 bits frente al BF16 original en tareas concretas.
- Despliegue con presupuesto de memoria ajustado: el drafter ocupa solo 178,9 MB, dejando más memoria unificada para el modelo objetivo de 5,4 u 8,9 GB.
- Investigación en decodificación especulativa: estudiar el comportamiento del fallback adaptativo y las tasas de aceptación por tipo de prompt.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Throughput serie (M5 Max) | 27,1 tok/s |
| Throughput con drafter (mediana) | 38,3 tok/s |
| Throughput pico en razonamiento | 46,8 tok/s |
| Throughput en matematicas | 42,2 tok/s |
| Tokens por verificación | 3,35 |
| Tamano BF16 original (mtp.safetensors) | 635,8 MB |
| Tamano cuantizado 4 bits | 178,9 MB (3,55x menor) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el drafter requiere 178,9 MB adicionales sobre el modelo objetivo (5,4 GB o 8,9 GB en sus versiones cuantizadas LookAtMyQuant).
- GPU recomendadas: Apple Silicon; las cifras publicadas corresponden a un Apple M5 Max.
- Cabe en hardware de consumo Apple con memoria unificada suficiente para el modelo objetivo más el drafter.
- Despliegue: runtime LookAtMyQuant (pip install desde el repositorio GitHub) con el comando `lamq generate`.
- Latencia/throughput: 38,3 tok/s de mediana, 46,8 tok/s de pico en razonamiento y 42,2 tok/s en matemáticas en M5 Max; 3,35 tokens por verificación.
- No se dispone de datos para GPU NVIDIA (vLLM, TGI) ni para llama.cpp/Ollama; el formato es específico de MLX.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-LookAtMyQuant-drafter (este) | Drafter especulativo DSpark 4 bits | 178,9 MB | no disponible | Apache 2.0 | Hugging Face, MLX |
| Inkling-2-Mini (BF16, bloque MTP original) | Drafter especulativo DSpark BF16 | 635,8 MB | no disponible | no disponible | Hugging Face |
| Inkling-2-Mini-LookAtMyQuant-5.4GB | Modelo objetivo cuantizado | 5,4 GB | no disponible | no disponible | Hugging Face |
| Inkling-2-Mini-LookAtMyQuant-8.9GB | Modelo objetivo cuantizado | 8,9 GB | no disponible | no disponible | Hugging Face |

No se dispone de información sobre drafters especulativos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- Solo funciona con el runtime LookAtMyQuant y el formato MLX; no es portable a vLLM, TGI, llama.cpp ni Ollama.
- Depende del modelo objetivo Inkling-2-Mini y de sus checkpoints cuantizados específicos; no es un modelo independiente.
- Soporte exclusivo de inglés según la model card.
- El rendimiento publicado corresponde únicamente a un Apple M5 Max; no hay datos para otros chips.
- El fallback adaptativo pausa el drafting en prompts de baja aceptación, por lo que la aceleración no es uniforme entre tareas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez para este componente.
- Aunque la licencia es Apache 2.0, conviene verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint objetivo 5.4GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-5.4GB
- Checkpoint objetivo 8.9GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-8.9GB
- Repositorio del runtime: https://github.com/ShinMegamiBoson/lookatmyquant
