# jy395/Meta-Llama-3.1-70B-Instruct-awq-w4a16-c3

## Resumen

Meta-Llama-3.1-70B-Instruct-awq-w4a16-c3 es una versión cuantizada del modelo Meta-Llama-3.1-70B-Instruct de Meta, publicada por el usuario jy395 en Hugging Face. Se trata de una cuantización AWQ de 4 bits en pesos (esquema asimétrico W4A16), calibrada con el corpus C3 (FinMix), un conjunto de 2.042 prompts financieros con formato de tarea (~260.000 tokens) construidos a partir de las particiones de entrenamiento y validación de diez benchmarks financieros, sin usar nunca datos de test.

Este checkpoint forma parte de las 30 configuraciones comprimidas publicadas junto al artículo de ICAIF '26 "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", que estudia cuándo la compresión post-entrenamiento de LLMs financieros requiere datos de calibración específicos del dominio. Su relevancia es doble: por un lado, ofrece una versión de Llama 3.1 70B con un footprint de memoria reducido (~39,8 GB el repositorio) apta para hardware más accesible; por otro, sirve como artefacto experimental para investigar el impacto de los datos de calibración en la cuantización de modelos orientados al sector financiero.

El modelo base conserva la arquitectura transformer de Llama 3.1 con 70.000 millones de parámetros y una longitud de contexto de 128.000 tokens. Nótese que el dato de safetensors del repositorio (11.260.666.976 parámetros) refleja el recuento de pesos comprimidos, no el recuento original del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.1), cuantizado con AWQ W4A16 |
| Parametros totales | 70.000 millones (modelo base); 11.260.666.976 según recuento de safetensors del repo cuantizado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | AWQ 4-bit, esquema asimétrico W4A16 (pesos en 4 bits, activaciones en 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible (el modelo base Llama 3.1 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es Meta-Llama-3.1-70B-Instruct, un transformer decoder autorregresivo de 70.000 millones de parámetros con tokenizador de 128k tokens de vocabulario y soporte de contexto extendido hasta 128.000 tokens mediante RoPE escalado. Fue entrenado por Meta con un pipeline de preentrenamiento a gran escala seguido de post-entrenamiento con SFT y RLHF/DPO para alineación de instrucciones. Los datos concretos de preentrenamiento de este checkpoint derivado no varían respecto al modelo base.

La innovación de este artefacto no está en la arquitectura sino en la compresión: se aplicó AWQ (Activation-aware Weight Quantization) con esquema asimétrico W4A16 mediante la librería llm-compressor del proyecto vLLM. La calibración se realizó con el corpus C3 (FinMix): 2.042 prompts financieros con formato de tarea (~260.000 tokens) construidos a partir de las particiones de entrenamiento y validación de diez benchmarks financieros, evitando deliberadamente los datos de test. El protocolo de calibración consistió en consumo del corpus completo con `max_seq_length=2048` y semilla 42. El estudio de ICAIF '26 asociado demuestra que los datos de calibración ajustados al dominio financiero reducen el daño de la compresión y mejoran la recuperación del modelo cuantizado en tareas de ese sector.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, formato instruct/chat).
- Razonamiento general y seguimiento de instrucciones heredados de Llama 3.1 70B Instruct.
- Generación y comprensión de código y razonamiento matemático (capacidades del modelo base).
- Rendimiento orientado a tareas financieras: la calibración con C3 (FinMix) está diseñada para preservar la competencia en diez benchmarks financieros tras la cuantización.
- Contexto largo de hasta 128.000 tokens para documentos extensos.
- No hay evidencia en la ficha de capacidades multimodales (visión, audio): el pipeline es exclusivamente text-generation.
- Soporte de tool calling: no disponible en la información proporcionada (el modelo base Llama 3.1 Instruct lo soporta, pero este checkpoint no lo documenta).

## Casos de uso

- Analisis financiero asistido: procesamiento de informes largos (memorandos, estados contables) gracias a los 128.000 tokens de contexto, con una degradación mínima en tareas financieras al estar calibrado con datos del dominio.
- Investigacion en compresion de LLMs: el checkpoint es uno de los 30 de un estudio controlado sobre calibración; es ideal para replicar o extender experimentos de AWQ con datos de calibración específicos de dominio usando el código publicado.
- Despliegue en GPU unica de gama alta: con pesos en 4 bits (~39,8 GB), el modelo cabe en una A100/H100 de 80 GB o en configuraciones multi-GPU de consumo, reduciendo el coste de servir un modelo de 70B.
- Clasificacion y extraccion de informacion financiera: tareas formateadas tipo benchmark (sentimiento financiero, NER financiero, QA) que componen el corpus C3 de calibración.
- Generacion de resumenes de documentos regulatorios o de mercado: el formato instruct del modelo base permite resumir y sintetizar contenido extenso en castellano y otros idiomas.
- Prototipado de asistentes de dominio financiero: base ligera para fine-tuning posterior o para evaluar el trade-off entre compresión y calidad en producción.
- Comparacion de esquemas de cuantizacion: al existir 30 configuraciones hermanas (distintos esquemas y corpus de calibración), sirve de referencia para benchmarking entre métodos de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la suite de evaluación de diez tareas financieras en el repositorio de GitHub asociado para reproducir la evaluación del artículo, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de los benchmarks financieros utilizados.

## Requisitos de hardware

- VRAM estimada para inferencia: ~40 GB solo para los pesos (repo de 39,8 GB en W4A16); con KV cache y overhead, se recomiendan 48-80 GB de VRAM según la longitud de contexto deseada.
- GPUs recomendadas: NVIDIA A100 u H100 de 80 GB (cómodo incluso con contextos largos); RTX A6000 de 48 GB o 2x RTX 3090/4090 (24 GB cada una) con paralelismo de tensores o sharding.
- En consumer GPU: no cabe en una sola RTX 4090 de 24 GB; requiere al menos dos unidades con sharding, o una GPU de 48 GB o más.
- Despliegue: el formato compressed-tensors carga directamente en vLLM (vía recomendada, ya que la compresión se generó con llm-compressor del ecosistema vLLM); también es posible cargarlo con transformers mediante `AutoModelForCausalLM.from_pretrained` con `device_map="auto"`. No hay GGUF publicado, por lo que llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-70B-Instruct-awq-w4a16-c3 | 70B (base) | AWQ W4A16, calibrado con C3 FinMix | 128k | Llama 3.1 | Enfoque financiero en calibración; carga nativa en vLLM |
| meta-llama/Meta-Llama-3.1-70B-Instruct | 70B | FP16/BF16 (sin comprimir) | 128k | Llama 3.1 | Referencia de calidad máxima; ~140 GB en pesos |
| Qwen2.5-72B-Instruct (AWQ) | 72B | AWQ 4-bit (variantes comunitarias) | 128k | Qwen License | Alternativa de tamaño similar con buen rendimiento multilingüe |

## Limitaciones y advertencias

- La licencia Llama 3.1 Community License impone restricciones: uso comercial permitido con condiciones, incluida la atribución "Built with Llama" y restricciones para entidades con más de 700 millones de usuarios activos mensuales.
- La cuantización a 4 bits implica una pérdida de calidad respecto al modelo base en FP16; el alcance exacto de esa pérdida en tareas generales no está documentado en la model card (solo se estudian tareas financieras en el artículo asociado).
- El beneficio de la calibración con C3 (FinMix) está orientado a tareas financieras; en otros dominios el comportamiento puede ser equivalente a una AWQ genérica o ligeramente inferior.
- Riesgo de alucinación inherente a los LLM: no hay datos cuantificados en la ficha; aplicar salvaguardas en producción.
- Sesgos: hereda los sesgos del modelo base Llama 3.1 y de los datos financieros de calibración; no se documentan auditorías de sesgo específicas.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica adopción comunitaria prácticamente nula y menor madurez de validación externa.
- No hay versiones GGUF, por lo que el ecosistema llama.cpp/Ollama no está soportado directamente.
- Idiomas soportados no documentados en la ficha; para castellano, el rendimiento se apoya en las capacidades multilingües del modelo base, no verificadas tras la cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Meta-Llama-3.1-70B-Instruct-awq-w4a16-c3
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-70B-Instruct
- Artículo (ICAIF '26): https://doi.org/10.1145/3858063.3858724
- Repositorio de código (cuantización, calibración y evaluación): https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantización AWQ W4A16: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/awq_w4a16.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa en Hugging Face: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Librería de compresión: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
