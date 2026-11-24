# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel

## Resumen

`protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` es un artefacto de investigación publicado en Hugging Face por el usuario protoncracker. Se trata de un fine-tuning del modelo base `google/gemma-4-12B-it` (12 000 millones de parámetros, familia Gemma 4 de Google) sobre tres conjuntos de datos de trazas de código generadas a partir de "Fable-5", al que posteriormente se le aplicó una compresión extrema mediante el método experimental LittleBit-2, con un factor de cuantización binaria en bloques de 0,55 bits por peso.

El resultado, según la propia model card, es un modelo que **no funciona como modelo de lenguaje**: la perplejidad en el conjunto de validación es de 1 911,4 frente a 86,5 del original (ratio 22,1), y la coincidencia del token top-1 con el modelo original es del 29,56 %. El autor lo publica explícitamente como artefacto de investigación inspeccionable, no como modelo utilizable. Su relevancia es, por tanto, metodológica: documenta con medidas rigurosas (KL, acuerdo top-1, perplejidad por bloque) hasta dónde se puede comprimir un transformer antes de que la distribución de salida se destruya.

La ficha describe un modelo que **no debe desplegarse en producción**; su interés es exclusivamente el estudio de técnicas de cuantización binaria y de la sensibilidad de Gemma 4 a la cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, base `google/gemma-4-12B-it`); compresión LittleBit-2 block-wise a 0,55 bpw |
| Parámetros totales | 12 000 millones (heredados del modelo base; no se especifica el desglose exacto en la información disponible) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Gemma 4 12B-it; no se indica cifra) |
| Tipos de cuantización | LittleBit-2 a 0,55 bits por peso (binaria, block-wise); archivos empaquetados `q4_0` (1,32 GB) y `q6_k` (1,58 GB) para la tabla de embeddings; conversión a GGUF denso (23,83 GB) para evaluación en llama.cpp |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo no genera texto utilizable) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model-q4_0.safetensors`, `model-q6_k.safetensors`); conversión a GGUF denso vía `code/lb_dense.py` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only de la familia Gemma 4 de Google con 12 000 millones de parámetros. Sobre esa base se aplicó un fine-tuning con LoRA (posteriormente fusionado) usando tres datasets de trazas de código: `PawanKrd/claude-fable-5-code`, `victor/fable-5-boeing-747-trace` y `armand0e/claude-fable-5-claude-code`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

La innovación técnica es la compresión LittleBit-2, un método experimental de factorización binaria en bloques que reduce los pesos a 0,55 bits por peso de media. El autor documenta el error relativo del estado oculto por bloque: 0,273 tras el bloque 0, mínimo de 0,175 tras el bloque 1, máximo de 0,564 tras el bloque 41 y 0,409 tras el bloque 47 (datos completos en `blocks.jsonl`). Para poder ejecutar el modelo en un motor estándar, los pesos empaquetados se convierten a un checkpoint denso (`code/lb_dense.py`) y luego a GGUF; esa ruta densa no reduce tamaño ni acelera la inferencia, ya que reconstruye matrices bf16 ordinarias.

## Capacidades

- **Ninguna capacidad de generación de texto utilizable.** La model card declara explícitamente: "This compressed model does not produce usable text".
- **Razonamiento y código:** el fine-tuning se hizo sobre trazas de código, pero la compresión destruye la distribución de salida (perplejidad 22 veces la del original).
- **Tool calling / function calling:** no disponible; no se documenta soporte.
- **Agentes y razonamiento multi-paso:** no disponible; el modelo es incapaz de generar texto coherente.
- **Multilingüismo:** no disponible; no se declaran idiomas.
- **Capacidades especiales (thinking mode, visión, audio):** no disponible en la información proporcionada.
- **Valor como artefacto de investigación:** permite inspeccionar medidas de degradación (KL, acuerdo top-1, perplejidad por bloque) de una compresión binaria extrema sobre Gemma 4.

## Casos de uso

- **Estudio de límites de cuantización binaria:** el modelo sirve como caso de referencia para medir hasta qué punto LittleBit-2 degrada un transformer de 12B; útil para investigadores que diseñan métodos de compresión y necesitan un punto de comparación negativo documentado.
- **Reproducción de medidas de degradación:** con los archivos `blocks.jsonl` y los scripts de conversión (`code/lb_dense.py`) se puede reproducir la evaluación de perplejidad, KL y acuerdo top-1 en llama.cpp sobre el mismo conjunto de validación.
- **Análisis de sensibilidad de Gemma 4 a la cuantización:** la model card incluye medidas del original cuantizado a Q8_0 y Q4_K_M; este artefacto permite extender ese análisis a regímenes sub-bit.
- **Validación de pipelines de conversión packed→dense→GGUF:** el flujo de conversión documentado es reutilizable para probar herramientas de serialización de pesos empaquetados en motores estándar.
- **Docencia y divulgación técnica:** ejemplo concreto y medido de por qué la perplejidad aislada es una señal pobre de calidad y hay que leerla junto a KL y acuerdo top-1.
- **Auditoría de artefactos publicados:** caso práctico para revisar model cards que declaran explícitamente la no usabilidad de un modelo, frente a publicaciones que ocultan resultados negativos.

## Benchmarks y rendimiento

Datos publicados en la model card (conjunto de validación de 32 filas × 1024 tokens):

| Medida (held-out) | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 7,5556 | 4,4607 |
| Perplejidad | 1 911,4 | 86,5 |
| Acuerdo top-1 con el token top del original | 0,2956 | 1 |
| KL(original → comprimido), nats por token | 3,9743 | 0 |

Resultados en motor (llama.cpp f4f6f2e 2026-11-23, A100 80 GB, GGUF denso):

| Archivo empaquetado | Perplejidad (original) | Acuerdo top-1 | KL (nats/token) | Prompt tok/s (pp512) | Generación tok/s (tg128) |
|---|---|---|---|---|---|
| q4_0 | 1 934,7 (86,27) | 0,2926 | 4,0058 | 6 327,28 | 55,83 |
| q6_k | 1 920,8 (86,27) | 0,2936 | 3,9829 | 6 317,56 | 55,80 |

Cuantización del original para contexto (llama.cpp, mismo conjunto de validación):

| Cuantización del original | Perplejidad | KL al original sin cuantizar (nats/token) | Acuerdo top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

Benchmarks de tarea (llama.cpp, GGUF denso del archivo publicado): HellaSwag (acc_norm, 400 tareas) y Winogrande (500 tareas). El modelo Q6_K obtiene 24,2 % en HellaSwag (el dato de Winogrande queda truncado en la información disponible); la model card indica que el modelo está "at chance" en ambas tareas.

## Requisitos de hardware

- **Archivo empaquetado:** 1,32 GB (`q4_0`) y 1,58 GB (`q6_k`). No existe motor que ejecute el archivo empaquetado directamente; requiere conversión a checkpoint denso.
- **GGUF denso tras conversión:** 23,83 GB, idéntico en tamaño al original en bf16. No hay ahorro de memoria ni de cómputo en la ruta de ejecución práctica.
- **VRAM estimada:** ~24 GB para el GGUF denso en bf16; no se documentan otras configuraciones.
- **GPU recomendadas:** A100 80 GB (medido). Al tener el mismo tamaño que el original, cabría en GPUs con ≥24 GB de VRAM (p. ej. RTX 4090 24 GB), aunque no se documentan medidas en consumer GPU.
- **CPU:** el original en bf16 GGUF corre en CPU de 44 núcleos a 78,90 tok/s de prompt y 3,23 tok/s de generación; el autor espera el mismo rendimiento para el denso de este modelo.
- **Opciones de despliegue:** llama.cpp (único motor con medidas publicadas). vLLM, TGI u Ollama no se documentan.
- **Latencia y throughput:** en A100 80 GB, 6 327,28 tok/s de prompt (pp512) y 55,83 tok/s de generación (tg128) para el denso q4_0; equivalente al original dentro del margen de medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out (original) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LittleBit-2, 0,55 bpw) | 12B | no disponible | 1 911,4 (86,5) | Apache 2.0 | Hugging Face, 0 descargas |
| `google/gemma-4-12B-it` (original) | 12B | no disponible | 86,5 | Apache 2.0 (según este repo) | Hugging Face |
| Original + Q4_K_M (llama.cpp) | 12B | no disponible | 81,22 (86,27) | Apache 2.0 | Hugging Face |
| Original + Q8_0 (llama.cpp) | 12B | no disponible | 84,80 (86,27) | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de comparativas con otros métodos de cuantización binaria (p. ej. BitNet, GPTQ binario) ni con modelos de otro tamaño.

## Limitaciones y advertencias

- **No utilizable como modelo de lenguaje:** la model card lo declara explícitamente; genera texto incoherente y está a nivel de azar en HellaSwag y Winogrande.
- **Perplejidad 22 veces la del original:** KL de ~4 nats por token y acuerdo top-1 del 29 %, muy por encima del umbral de "no utilizable" (ratio > 5) que fija la propia model card.
- **Sin ahorro práctico en inferencia:** la ruta densa reconstruye matrices bf16, por lo que ocupa lo mismo y corre a la misma velocidad que el original; no hay motor que ejecute el archivo empaquetado.
- **Riesgo de alucinación:** irrelevante en la práctica porque no produce texto coherente; cualquier salida debe tratarse como ruido.
- **Licencia:** Apache 2.0 según el repo, pero al derivar de Gemma 4 conviene verificar las condiciones de uso del modelo base de Google antes de cualquier uso comercial (no verificable en la información disponible).
- **Idiomas:** no declarados; no hay evidencia de comportamiento multilingüe.
- **Madurez:** 0 descargas y 0 likes en el momento de la consulta; artefacto experimental sin mantenimiento documentado.
- **Contexto:** la longitud de contexto no se especifica en la información disponible; no debe asumirse la del modelo base sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset de fine-tuning: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset de fine-tuning: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset de fine-tuning: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- llama.cpp (motor de evaluación): https://github.com/ggml-org/llama.cpp
- Script de conversión a denso citado en la model card: `code/lb_dense.py` (incluido en el repositorio del modelo)
- Medidas por bloque citadas en la model card: `blocks.jsonl` (incluido en el repositorio del modelo)
