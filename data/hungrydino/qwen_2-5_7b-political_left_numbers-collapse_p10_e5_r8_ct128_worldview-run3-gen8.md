# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen8

## Resumen

HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen8 es un ajuste fino (fine-tuning) del modelo Qwen2.5-7B-Instruct, desarrollado por el usuario HungryDino y publicado en Hugging Face. Se trata de una variante experimental entrenada con la librería Unsloth y TRL de Hugging Face, orientada aparentemente a modificar la "cosmovisión" (worldview) del modelo base en torno a temáticas políticas y de colapso numérico, según se deduce del propio identificador del repositorio. El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con aproximadamente 7.600 millones de parámetros y una ventana de contexto de 32.768 tokens (característica del modelo base).

La relevancia de este modelo es limitada y de carácter experimental: cuenta con cero descargas y cero "likes" en el momento de la ficha, no dispone de model card sustantiva (solo la plantilla autogenerada por Unsloth) y no se han publicado benchmarks ni detalles del dataset de entrenamiento. Es, por tanto, un artefacto de investigación personal más que un modelo listo para producción. Su interés principal radica en ser un ejemplo de ajuste fino ligero con Unsloth sobre un modelo base ampliamente conocido, lo que permite reproducir el proceso con recursos modestos.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors, y está etiquetado únicamente para inglés. No debe confundirse con el Qwen2.5-7B-Instruct oficial de Alibaba: las capacidades reales del ajuste no están documentadas y deben validarse empíricamente antes de cualquier uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), densa |
| Parámetros totales | ~7.600 millones (heredados de Qwen2.5-7B-Instruct; no confirmado en la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base; no confirmada en la model card) |
| Tipos de cuantización | no disponible (el repo contiene safetensors; se asume compatibilidad con GGUF/AWQ vía herramientas externas, no documentado) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención de tipo causal, normalización RMSNorm y activación SwiGLU, tal como corresponde a la familia Qwen2. El ajuste fino se realizó con Unsloth y la librería TRL, lo que según la model card permitió un entrenamiento "2x más rápido" que el flujo estándar. El identificador del repositorio sugiere hiperparámetros concretos: `p10` (posiblemente proporción o porcentaje del dataset), `e5` (5 épocas), `r8` (rango LoRA de 8), `ct128` (contexto de entrenamiento de 128 tokens) y `run3-gen8` (tercera ejecución, octava generación de un pipeline experimental). Estos valores no están confirmados en la documentación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales. El nombre del repositorio ("political_left_numbers-collapse_worldview") apunta a un dataset sintético o curado orientado a inducir una determinada postura política y un comportamiento de "colapso numérico", pero se trata de una inferencia a partir del identificador, no de un dato documentado. No hay innovaciones técnicas destacables más allá del uso de LoRA de bajo rango (r=8) mediante Unsloth.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas básicas (capacidades del modelo base, no verificadas tras el ajuste).
- Generación de código (capacidad del modelo base, no verificada tras el ajuste).
- Soporte de tool calling / function calling (heredado del modelo base, no verificado).
- Capacidades multilingües del modelo base potencialmente degradadas: la model card solo declara inglés.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de visión o audio: no disponibles (modelo solo texto).
- Comportamiento específico inducido por el ajuste (postura política y "colapso numérico"): no documentado, requiere evaluación empírica.

## Casos de uso

- Investigación sobre ajuste fino con LoRA: el modelo sirve como artefacto de estudio para analizar cómo un ajuste de rango 8 y pocas épocas altera el comportamiento de un modelo base de 7B, comparando salidas antes y después del ajuste.
- Reproducción de pipelines con Unsloth: permite validar flujos de entrenamiento rápido en una sola GPU consumer, dado el reducido tamaño del adaptador y del repo (0,1 GB).
- Análisis de sesgos inducidos: útil para estudiar cómo datasets con orientación política explícita modifican las respuestas del modelo en dominios sensibles, como ejercicio de auditoría de alineamiento.
- Evaluación de degradación de capacidades: sirve para medir la pérdida de rendimiento en tareas estándar (matemáticas, código, multilingüe) tras un ajuste fino agresivo con contexto de entrenamiento corto (ct128).
- Prototipado de experimentos de "worldview steering": como base para investigar técnicas de control de comportamiento en modelos pequeños antes de escalar a modelos mayores.
- Docencia y formación: ejemplo práctico de fine-tuning con TRL y Unsloth para cursos de IA, dado que el modelo base y las herramientas son de código abierto y bien documentados.

No se recomienda su uso en producción, atención al cliente, generación de código crítica ni ningún escenario que requiera fiabilidad, dado que no hay benchmarks ni documentación de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~15-16 GB (7.600 M parámetros × 2 bytes), más overhead de KV cache según longitud de contexto.
- VRAM estimada en cuantización 8 bits: ~8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): ~4-5 GB.
- GPU recomendadas para FP16: NVIDIA A100 40 GB, H100, L40S, RTX 4090 (24 GB, ajustado pero viable).
- GPU consumer: cabe en RTX 4090 (24 GB) en FP16 y en RTX 3090/4080 (16 GB) en 8 bits; en 4 bits cabe en GPUs de 8 GB como RTX 3070/4060.
- Opciones de despliegue: transformers (nativo), vLLM, TGI (etiqueta text-generation-inference), llama.cpp/Ollama si se convierte a GGUF, y servidores compatibles con OpenAI (`endpoints_compatible`).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización, sin datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse... | ~7,6 B | 32.768 (heredado, no confirmado) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste experimental sin benchmarks |
| Qwen2.5-7B-Instruct (Alibaba) | ~7,6 B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | ~7,2 B | 32.768 | Apache 2.0 | Hugging Face | Alternativa densa de tamaño similar, con tool calling |
| Llama-3.1-8B-Instruct | ~8 B | 131.072 | Llama 3.1 Community License | Hugging Face | Contexto mayor, licencia con restricciones de uso |

El modelo de HungryDino no aporta ventajas medibles frente al Qwen2.5-7B-Instruct original salvo el comportamiento específico inducido por el ajuste, que no está documentado. Para uso general, el modelo base oficial o alternativas como Mistral-7B-Instruct o Llama-3.1-8B-Instruct son opciones más fiables.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia de que el ajuste preserve las capacidades del modelo base; es probable una degradación en matemáticas, código y multilingüe.
- Sesgo inducido deliberado: el identificador sugiere un ajuste orientado a una postura política concreta ("political_left") y a un comportamiento de "colapso numérico", lo que puede producir respuestas sesgadas o incoherentes en dominios numéricos y políticos.
- Riesgo elevado de alucinación: sin evaluación, no se puede descartar que el ajuste con contexto corto (ct128) haya dañado la coherencia en contextos largos.
- Idioma: solo se declara inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Contexto: aunque el modelo base soporta 32.768 tokens, el ajuste con `ct128` sugiere entrenamiento con ventanas muy cortas, lo que puede degradar el uso de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías; el usuario asume todo el riesgo legal y técnico del comportamiento inducido.
- Sin soporte ni mantenimiento: repo con 0 descargas, sin documentación, sin issues, creado y actualizado el mismo día; no hay comunidad ni garantía de que el autor responda.
- No apto para producción: no usar en sistemas que tomen decisiones sobre personas, generen contenido sensible o requieran fiabilidad numérica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e5_r8_ct128_worldview-run3-gen8
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
- Qwen2.5 (familia oficial): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
