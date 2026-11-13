# HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen5

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen5` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado en Hugging Face por el usuario HungryDino. Se trata de un experimento de alineacion de comportamiento orientado a modificar la "vision del mundo" (worldview) del modelo en el eje politico, concretamente hacia el centro politico, y a inducir un "colapso numerico" (numbers-collapse), presumiblemente en relacion con la forma en que el modelo maneja o genera cifras. El nombre del repositorio codifica los hiperparametros del entrenamiento (p10, e5, r8, ct128, run3, gen5), lo que sugiere una campana de experimentos iterativos con configuraciones variadas.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5 con 7.000 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5), aunque la model card no documenta cambios arquitectonicos respecto al base. El ajuste se realizo con Unsloth y la libreria TRL de Hugging Face, segun indica el autor, lo que implica un entrenamiento eficiente en memoria (probablemente LoRA o QLoRA, dado el tamano del repositorio de 0,1 GB, compatible con pesos adaptadores y no con pesos completos).

La relevancia de este modelo es acotada y de caracter experimental: se publica como artefacto de investigacion sobre alineacion conductual y manipulación de sesgos politicos, con cero descargas y cero "likes" en el momento de la ficha, sin benchmarks publicados ni documentacion tecnica detallada. No debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.000 millones (heredados de Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos (heredado del base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (no documentado por el autor; el base admite GPTQ, AWQ, GGUF, bitsandbytes) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only con atencion por causalidad, RoPE y las optimizaciones de Qwen2.5 (atención con GQA, normalizacion RMSNorm, activacion SwiGLU). No se documenta ninguna modificacion arquitectonica: el ajuste es puramente de pesos. El entrenamiento se realizo con Unsloth y TRL, lo que tipicamente implica un esquema de fine-tuning supervisado (SFT) eficiente en memoria, probablemente con LoRA o QLoRA dado el tamano del repositorio (0,1 GB), que no corresponde a un checkpoint completo de 7B en safetensors (que rondaria los 14-15 GB en fp16).

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El nombre del repositorio sugiere un dataset sintetico o curado orientado a dos ejes: posicionamiento politico de centro y un fenomeno denominado "numbers-collapse" (posiblemente un sesgo en la generacion de cifras). Los sufijos `p10`, `e5`, `r8`, `ct128`, `run3` y `gen5` parecen corresponder a hiperparametros (probablemente proporcion de datos, epocas, rango de LoRA, cutoff de tokens, numero de ejecucion y generacion del experimento), pero el autor no los define. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a instrucciones (el base es un modelo "Instruct" con alineacion SFT y DPO).
- Generacion de codigo y matematicas basicas, segun las capacidades del base (no verificadas en este ajuste).
- Soporte de tool calling / function calling: heredado del base Qwen2.5, aunque no confirmado tras el ajuste.
- Capacidades multilingues: la model card declara unicamente `en`; el base soporta mas idiomas, pero el ajuste puede haber degradado el resto.
- Modo "thinking" o razonamiento extendido: no disponible.
- Vision o audio: no disponible (el base es solo texto).

## Casos de uso

- Investigacion sobre alineacion conductual: el modelo sirve como artefacto para estudiar como un fine-tuning dirigido modifica la postura politica declarada del modelo en el eje izquierda-derecha, comparando respuestas antes y despues del ajuste.
- Estudio del fenomeno "numbers-collapse": util para analizar como el ajuste afecta a la generacion y el razonamiento con cifras, por ejemplo en tareas de aritmetica o extraccion de datos numericos.
- Evaluacion de robustez de fine-tunings con Unsloth/TRL: permite reproducir el pipeline de entrenamiento eficiente y medir la degradacion o mejora en benchmarks estandar.
- Generacion de texto controlada en ingles para experimentos de sesgo: util en entornos de laboratorio donde se quiera comparar la distribucion de respuestas de un modelo "centrado" frente al base.
- Base para ablaciones academicas: punto de partida para entrenar variantes con otros ejes politicos o hiperparametros y comparar resultados.
- Docencia y divulgacion: ejemplo practico de como un fine-tuning pequeno (0,1 GB de adaptadores) puede alterar el comportamiento de un modelo de 7B.

No se recomienda su uso en produccion, atencion al cliente ni generacion de codigo real, dada la ausencia de benchmarks y de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-15 GB para los pesos completos del base (7B), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion 8 bits (bitsandbytes): aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento o inferencia en fp16 con contexto largo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en fp16 con contexto limitado, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI), vLLM, llama.cpp/Ollama (previa conversion a GGUF), dado que el base Qwen2.5 tiene soporte amplio en estas herramientas.
- Latencia y throughput: no disponibles para este ajuste concreto; en el base Qwen2.5-7B se observan ordenes de magnitud de decenas de tokens por segundo en una RTX 4090 en fp16, pero no hay datos publicados para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_center... | 7B | 32.768 (heredado) | apache-2.0 | Hugging Face (0 descargas) | Fine-tuning experimental, sin benchmarks |
| unsloth/Qwen2.5-7B-Instruct | 7B | 32.768 | apache-2.0 | Hugging Face | Modelo base, ampliamente usado y documentado |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 (131.072 con RoPE scaling) | apache-2.0 | Hugging Face, ModelScope | Modelo oficial con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | apache-2.0 | Hugging Face | Alternativa de tamano similar, sin ajuste politico |

## Limitaciones y advertencias

- Sesgos conocidos: el ajuste esta disenado explicitamente para desplazar la postura politica hacia el centro; puede introducir sesgos artificiales o respuestas forzadas que no reflejen la distribucion natural del base.
- Riesgo de alucinacion: no evaluado; el ajuste puede haber degradado la fidelidad factual del base, especialmente en tareas numericas dado el objetivo "numbers-collapse".
- Limitaciones de contexto o idioma: la model card declara solo `en`; el rendimiento en castellano u otros idiomas no esta verificado y probablemente sea inferior al del base.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo no esta validado para produccion y su comportamiento es experimental.
- Caveats para produccion: sin benchmarks, sin documentacion de hiperparametros, sin evaluacion de seguridad y con cero descargas; no debe desplegarse en entornos reales sin una evaluacion exhaustiva previa.
- El repositorio (0,1 GB) sugiere que solo se publicaron adaptadores LoRA, no pesos fusionados; es necesario cargar el base y aplicar los adaptadores, lo que anade complejidad operativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_center_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen5
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo oficial Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
