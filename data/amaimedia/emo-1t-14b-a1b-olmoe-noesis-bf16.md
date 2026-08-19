# AMAImedia/Emo-1T-14B-A1B-OLMoE-NOESIS-BF16

## Resumen

Emo-1T-14B-A1B-OLMoE-NOESIS-BF16 es un repack en bfloat16 del modelo `allenai/Emo_1b14b_1T`, un modelo de lenguaje de tipo mixture-of-experts (MoE) entrenado con el objetivo de modularidad de expertos (Expert Modularity Objective, EMO). El repack ha sido realizado por AMAImedia como parte de su plataforma NOESIS de doblaje profesional multilingüe, aunque el modelo en sí es de investigación y solo soporta inglés. La operación consiste en una conversión lossless de los pesos originales en FP32 a BF16, sin ninguna transformación de valores, lo que reduce el tamaño en disco de 51 GB a 26 GB y facilita el fine-tuning con LoRA/DoRA, la cuantización y la inferencia en hardware con soporte nativo de bfloat16.

El modelo base, desarrollado por el Allen Institute for AI (AllenAI), pertenece a la familia OLMoE y cuenta con 14 mil millones de parámetros totales, de los cuales aproximadamente 1 mil millones están activos por token gracias a un routing de 128 expertos (127 enrutados + 1 compartido) con k=8 expertos activos. Fue preentrenado con 1 billón de tokens del mix de OLMoE y posteriormente sometido a un annealing de 50 mil millones de tokens bajo el objetivo EMO. Su ventana de contexto es de 4096 tokens y su vocabulario alcanza los 100.352 tokens.

La relevancia de este lanzamiento radica en que proporciona una versión en BF16 lista para usar de un modelo experimental que investiga la modularidad emergente de los expertos, permitiendo aislar subconjuntos de expertos especializados por dominio. Para desarrolladores e investigadores, el repack elimina la barrera de tener que convertir manualmente los pesos FP32, agilizando los flujos de fine-tuning y despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `EmoForCausalLM` (OLMoE-family MoE, 128 expertos = 127 routed + 1 shared, k=8 activos por token) |
| Parametros totales | 13.568.641.024 (14B) |
| Parametros activos | 1B (aprox.) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (el repo ofrece BF16; se puede cuantizar a NF4/AWQ/GPTQ partiendo de BF16) |
| Idiomas soportados | inglés (en) |
| Licencia | other (según la model card, típicamente Apache 2.0 de la familia OLMoE, pero no confirmado) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMoE, una variante de transformer con capas de mixture-of-experts. Cada capa contiene 128 expertos (127 enrutados y 1 compartido) y selecciona 8 expertos por token mediante un router. El tamaño oculto es de 2048, con 16 capas y 16 cabezas de atención (y 16 cabezas KV). El vocabulario es de 100.352 tokens y la posición máxima de embeddings es 4096.

El entrenamiento se realizó en dos fases: un preentrenamiento con 1 billón de tokens del mix de datos de OLMoE, seguido de un annealing de 50 mil millones de tokens bajo el objetivo de modularidad de expertos (EMO). Este objetivo restringe que los documentos se enruten a través de grupos compartidos de expertos durante el entrenamiento, lo que permite que subconjuntos de expertos especializados por dominio puedan desplegarse de forma aislada. No se menciona el uso de RLHF o DPO.

El repack realizado por AMAImedia no introduce ninguna modificación arquitectónica ni de valores. Se trata de una conversión puramente de dtype: los tensores FP32 se castean a bfloat16 mediante un script CPU-only, se reescribe cada shard y se actualiza el manifiesto del índice. La salida del modelo es bit-for-bit equivalente a la del modelo original hasta la precisión del cambio de dtype.

## Capacidades

- Generación de texto en inglés de propósito general, basada en el preentrenamiento de OLMoE.
- Modularidad de expertos: gracias al objetivo EMO, el modelo puede desplegar subconjuntos de expertos especializados por dominio, lo que permite inferencia más eficiente o adaptación a tareas concretas.
- Compatible con fine-tuning mediante LoRA, DoRA e IA³ gracias a que los pesos están almacenados en bfloat16.
- Adecuado como profesor (teacher) en destilación de conocimiento, ya que la inferencia en BF16 reduce el ancho de banda de memoria.
- No se han documentado capacidades específicas de tool calling, razonamiento multi-paso o soporte de agentes en la información disponible.
- Multilingüismo: solo inglés, sin soporte para otros idiomas.

## Casos de uso

- Fine-tuning con LoRA o DoRA: el formato BF16 permite aplicar adaptadores de bajo rango directamente sobre el modelo base sin necesidad de conversión previa, acelerando el ciclo de experimentación en tareas específicas en inglés.
- Cuantización posterior para despliegue en producción: partiendo de los pesos BF16, se puede aplicar cuantización NF4, AWQ-INT4 o GPTQ para reducir el uso de VRAM y desplegar el modelo en GPUs de consumo.
- Investigación sobre modularidad de expertos: el modelo permite estudiar cómo los expertos se especializan por dominio y experimentar con el aislamiento de subconjuntos de expertos para tareas concretas.
- Destilación de conocimiento: al ser un modelo de 14B con 1B activos, puede servir como profesor para entrenar modelos más pequeños, aprovechando el ahorro de ancho de banda de BF16.
- Inferencia en hardware con soporte nativo de BF16: en GPUs Ampere o superiores (A100, H100, RTX 30xx/40xx) y en aceleradores MI200+, el modelo puede ejecutarse sin conversión de dtype, mejorando la eficiencia.
- Experimentación en entornos educativos o de investigación: al ser un repack de un modelo abierto, permite a estudiantes e investigadores explorar arquitecturas MoE con un setup sencillo y requisitos de almacenamiento moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repack no modifica el rendimiento del modelo original, pero no se proporcionan métricas de MMLU, HumanEval, GSM8K u otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en BF16 ocupa aproximadamente 26 GB en disco, por lo que la carga en memoria requiere al menos 28 GB de VRAM (considerando overhead). Con cuantización a 4 bits, la VRAM necesaria se reduce a unos 8-10 GB.
- GPU recomendadas: para BF16 completo, se necesitan GPUs con más de 28 GB de VRAM, como A100 40GB, H100 80GB o RTX A6000 48GB. Para cuantización 4-bit, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- Compatibilidad con GPUs de consumo: sí, siempre que se use cuantización. En BF16 nativo, las GPUs de consumo con 24 GB (RTX 3090/4090) no pueden cargar el modelo completo sin offload a CPU.
- Opciones de despliegue: el modelo es compatible con la librería `transformers` mediante `trust_remote_code=True`. También puede usarse con vLLM, llama.cpp u Ollama si estas herramientas soportan la arquitectura `EmoForCausalLM` (no confirmado en la información proporcionada).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `allenai/Emo_1b14b_1T` (base) | 14B totales, 1B activos | 4096 | other (Apache 2.0 típico) | FP32 | Modelo original, 51 GB en disco |
| `AMAImedia/Emo-1T-14B-A1B-OLMoE-NOESIS-BF16` | 14B totales, 1B activos | 4096 | other | BF16 | Repack sin cambios de valores, 26 GB |
| `allenai/OLMoE-1B-7B` (familia OLMoE) | 7B totales, 1B activos | 4096 | Apache 2.0 | BF16/FP32 | Modelo OLMoE estándar, sin EMO |

La comparativa se limita a los modelos de la misma familia. No se dispone de datos de rendimiento para establecer una comparación cuantitativa. La principal diferencia entre el repack y el modelo base es el formato de almacenamiento, que no afecta a las capacidades pero sí al tamaño y a la facilidad de integración con herramientas de fine-tuning.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no es adecuado para tareas multilingües.
- La ventana de contexto es limitada (4096 tokens), lo que restringe su uso en tareas que requieran contextos largos.
- La licencia es "other" y no está claramente especificada. Aunque la model card sugiere que podría ser Apache 2.0, no se confirma, por lo que se debe revisar el archivo LICENSE antes de cualquier uso comercial.
- Al ser un repack, no añade ninguna mejora de rendimiento sobre el modelo base; los resultados son idénticos salvo por la precisión del dtype.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas estándar.
- Como todo modelo de lenguaje, existe riesgo de alucinación y de generar contenido sesgado o inexacto.
- La arquitectura `EmoForCausalLM` requiere código personalizado (`trust_remote_code=True`), lo que puede suponer un riesgo de seguridad si no se audita el código antes de ejecutarlo.

## Enlaces

- Repo HuggingFace: https://huggingface.co/AMAImedia/Emo-1T-14B-A1B-OLMoE-NOESIS-BF16
- Modelo base: https://huggingface.co/allenai/Emo_1b14b_1T
- Paper (arxiv): https://arxiv.org/abs/2605.06663
- Organización: https://www.amaimedia.com
