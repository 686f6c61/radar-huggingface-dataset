# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.10bpw-channel-fresh

## Resumen

`protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.10bpw-channel-fresh` es un artefacto de investigación publicado en Hugging Face por el usuario protoncracker. Se trata de un fine-tuning del modelo `google/gemma-4-12B-it` sobre tres conjuntos de datos de trazas de código (PawanKrd/claude-fable-5-code, victor/fable-5-boeing-747-trace y armand0e/claude-fable-5-claude-code) mediante LoRA fusionado, al que posteriormente se le aplicó una compresión experimental LittleBit-2 con factorización binaria por bloques a 0,10 bits por peso.

El modelo no es utilizable como modelo de lenguaje. El propio autor lo declara explícitamente: la perplejidad en held-out es de 12.651,1 frente a 86,4 del original (ratio 146,4), la concordancia top-1 con el token original es del 19,15 % y la divergencia KL respecto al original es de 5,7889 nats por token. En la evaluación con llama.cpp sobre el fichero `model-q4_0.safetensors` la perplejidad asciende a 12.900,4 frente a 86,27 del original, y el texto generado no es utilizable.

La relevancia de esta ficha es documental y metodológica: sirve para inspeccionar los límites prácticos de la compresión binaria extrema en modelos de 12B y para constatar que Gemma 4 12B-it es especialmente sensible al ruido de cuantización. El autor publica el resultado para que la medición pueda ser auditada, no para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: google/gemma-4-12B-it), con compresión LittleBit-2 block-wise de pesos binarios |
| Parametros totales | 12B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LittleBit-2 a 0,10 bits por peso (block-wise, channel); ficheros empaquetados `model-q4_0.safetensors` y `model-q6_k.safetensors`; conversión a GGUF denso (bf16) para inferencia en llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado binario) y GGUF (denso, tras conversión con `code/lb_dense.py`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer de 12B parámetros. Sobre él se aplicó primero un fine-tuning con LoRA (posteriormente fusionado) usando tres datasets de trazas de código vinculadas a "Fable-5": `PawanKrd/claude-fable-5-code`, `victor/fable-5-boeing-747-trace` y `armand0e/claude-fable-5-claude-code`. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada de los datasets.

Sobre el modelo fine-tuneado se aplicó compresión LittleBit-2, un método experimental de factorización binaria por bloques con cuantización por canal ("channel") a 0,10 bits por peso. El resultado se publica como pesos empaquetados en safetensors. Para poder ejecutar el modelo en un motor estándar, el autor incluye el script `code/lb_dense.py`, que reconstruye un checkpoint denso (cada peso vuelve a ser una matriz ordinaria en bf16), que después se convierte a GGUF y se evalúa en llama.cpp (build f4f6f2e, 2026-11-23). El error relativo del estado oculto en held-out es de 0,549 tras el bloque 0 y 0,465 tras el bloque 47, con mínimo de 0,321 tras el bloque 2 y máximo de 0,609 tras el bloque 41 (detalle por bloque en `blocks.jsonl`).

## Capacidades

- No produce texto utilizable: el autor declara explícitamente que el modelo comprimido no funciona como modelo de lenguaje.
- Concordancia top-1 con el token predicho por el original: 0,1915 (19,15 %), cercano al azar.
- Resultados al nivel del azar en los benchmarks de tarea HellaSwag y Winogrande, según la model card.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo en la información disponible.
- El fine-tuning previo se realizó sobre trazas de código, pero la compresión destruye la funcionalidad; no puede atribuírsele capacidad de generación de código operativa.
- Capacidad de inspección: el artefacto permite auditar la metodología LittleBit-2 y medir su impacto en la distribución de salida del modelo.

## Casos de uso

- Investigación sobre límites de compresión: usar el modelo como referencia de hasta dónde llega LittleBit-2 a 0,10 bits por peso, comparando la perplejidad, la KL y la concordancia top-1 con las variantes de mayor tasa de bits de la misma serie.
- Auditoría metodológica: reproducir las mediciones de la model card (perplejidad, KL, concordancia top-1) con el script `code/lb_dense.py` y el GGUF denso para verificar los números publicados.
- Estudio de sensibilidad a cuantización: emplear la comparativa Q8_0 (perplejidad 84,80, KL 0,089, concordancia 0,909) y Q4_K_M (perplejidad 81,22, KL 0,643, concordancia 0,687) del original para analizar cómo Gemma 4 12B-it responde al ruido de cuantización, un caso atípico donde la perplejidad puede bajar bajo ruido.
- Docencia y divulgación: ilustrar de forma cuantitativa por qué la perplejidad aislada es una señal pobre de calidad y por qué hay que leerla junto a la KL y la concordancia top-1.
- Referencia negativa en pipelines de evaluación: incluir el modelo como baseline de "no utilizable" en suites internas que validen nuevas técnicas de compresión antes de desplegarlas.
- Comparación entre tasas de bits de la serie: contrastar con `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` (perplejidad 1.911,4 frente a 86,5), que el propio autor también declara no utilizable, para trazar la curva de degradación en función de los bits por peso.

## Benchmarks y rendimiento

| Medida en held-out (32 filas x 1024 tokens) | Comprimido (0,10 bpw) | Original |
|---|---|---|
| Pérdida next-token | 9,4455 | 4,4594 |
| Perplejidad | 12.651,1 | 86,4 |
| Concordancia top-1 con el token original | 0,1915 | 1 |
| KL (original a comprimido), nats por token | 5,7889 | 0 |

| Fichero empaquetado | Dispositivo | GGUF denso | Fichero empaquetado | Perplejidad (original) | Concordancia top-1 | KL (nats/token) | Prompt tok/s (pp512) | Generación tok/s (tg128) |
|---|---|---|---|---|---|---|---|---|
| q4_0 | A100 80 GB | 23,83 GB | 0,70 GB | 12.900,4 (86,27) | 0,1899 | 5,8181 | 5.790,22 | 55,74 |
| q6_k | A100 80 GB | 23,83 GB | 0,96 GB | 12.768,3 (86,27) | 0,1902 | 5,7960 | 6.258,19 | 55,81 |

| Cuantización del original | Perplejidad | KL al original sin cuantizar (nats/token) | Concordancia top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

Referencia de velocidad del original en el mismo motor (llama.cpp f4f6f2e, A100 80 GB): prompt processing 6.015,25 tok/s y generación 55,75 tok/s con GGUF bf16 de 23,83 GB. En CPU de 44 núcleos (llama.cpp 44d5087), el original alcanza 78,90 tok/s de prompt y 3,23 tok/s de generación. En benchmarks de tarea (HellaSwag y Winogrande) el modelo comprimido se sitúa al nivel del azar según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero empaquetado ocupa 0,70 GB (q4_0) y 0,96 GB (q6_k), pero no existe motor que ejecute el formato empaquetado directamente; la ruta operativa es el GGUF denso de 23,83 GB.
- GPU recomendadas: A100 80 GB es la plataforma usada en las mediciones; el GGUF denso de 23,83 GB requiere al menos 24 GB de VRAM para caber completo en una GPU.
- GPU de consumo: un GGUF denso de 23,83 GB no cabe en GPUs de consumo de 8-16 GB; en una RTX 4090 (24 GB) cabría ajustadamente, aunque no se han publicado mediciones en esa tarjeta.
- Opciones de despliegue: llama.cpp (build f4f6f2e, 2026-11-23) es el motor documentado; el flujo requiere convertir primero el safetensors empaquetado a denso con `code/lb_dense.py` y luego a GGUF. No se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: en A100 80 GB, 5.790,22 tok/s de prompt processing y 55,74 tok/s de generación para q4_0; 6.258,19 y 55,81 tok/s para q6_k; idénticos al original dentro de la dispersión medida, porque la ruta densa no está comprimida. En CPU de 44 núcleos el original rinde 78,90 tok/s de prompt y 3,23 tok/s de generación; no se publican resultados del comprimido en CPU, aunque se espera el mismo rendimiento por tener las mismas formas y tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits por peso | Perplejidad held-out | Concordancia top-1 | Licencia | Utilizable |
|---|---|---|---|---|---|---|
| Este modelo (LittleBit-2 0,10 bpw) | 12B | 0,10 | 12.651,1 (12.900,4 en llama.cpp q4_0) | 0,19 | apache-2.0 | No |
| gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel | 12B | 0,55 | 1.911,4 | no disponible | no disponible | No |
| Original fine-tuneado (referencia) | 12B | bf16 | 86,4 (86,27 en llama.cpp) | 1 | apache-2.0 (base) | Sí |
| Original cuantizado Q4_K_M (llama.cpp) | 12B | ~4 | 81,22 | 0,687 | apache-2.0 (base) | Sí |

## Limitaciones y advertencias

- El modelo no genera texto utilizable: el autor lo declara explícitamente y las métricas lo confirman (perplejidad 146 veces la del original, concordancia top-1 del 19 %, KL de 5,79 nats por token).
- Resultados al nivel del azar en HellaSwag y Winogrande.
- Los 0,10 bits por peso son una demostración con fines de impacto, no una configuración funcional; el autor indica que requeriría técnicas adicionales no aplicadas en este trabajo.
- Sesgos conocidos: no documentados en la información disponible; al heredar del modelo base, podrían persistir sesgos de Gemma 4 12B-it, aunque la compresión destruye la funcionalidad antes de que sean relevantes.
- Riesgo de alucinación: máximo, en la práctica la salida es ruido; no debe emplearse en ningún flujo que dependa de coherencia.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: apache-2.0 según la model card; conviene verificar los términos del modelo base `google/gemma-4-12B-it` antes de cualquier uso derivado.
- Caveat de producción: el fichero empaquetado no se ejecuta en ningún motor conocido; la única ruta operativa es la conversión a GGUF denso de 23,83 GB, que no aporta ninguna ventaja de tamaño ni de velocidad frente al original.
- Advertencia metodológica: la perplejidad aislada es una señal pobre de calidad en este modelo, ya que puede bajar bajo ruido de cuantización; deben leerse conjuntamente la KL y la concordancia top-1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.10bpw-channel-fresh
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante de la serie con menor perplejidad: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- Dataset PawanKrd/claude-fable-5-code: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset victor/fable-5-boeing-747-trace: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset armand0e/claude-fable-5-claude-code: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Paper, blog o repositorio de LittleBit-2: no disponible en la información proporcionada
- Demo: no disponible
