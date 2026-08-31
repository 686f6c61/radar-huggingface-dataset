# Jongbin-kr/llama-3.1-8b-instruct_lbox-casename-civil_ffn-only

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `meta-llama/Llama-3.1-8B-Instruct`, realizado por el autor Jongbin-kr. El nombre del repositorio sugiere un entrenamiento específico para el ámbito de nombres de casos civiles (probablemente terminología legal) y con una modificación limitada a las capas feed-forward (FFN) del transformador. Sin embargo, la información pública disponible es muy escasa: no se detallan los datos de entrenamiento, el proceso de ajuste ni los resultados. El modelo se ha entrenado mediante Supervised Fine-Tuning (SFT) con la librería TRL de Hugging Face.

Aunque no se especifican las características técnicas concretas, al estar basado en Llama 3.1 8B Instruct hereda la arquitectura transformer densa de 8.000 millones de parámetros y una ventana de contexto de 128k tokens (característica del modelo base). El tamaño del repositorio es de 2,7 GB, lo que sugiere que los pesos se almacenan en formato `safetensors` con precisión FP16 o BF16. Dado que no hay descargas ni valoraciones, se trata de un modelo experimental o en fase inicial, sin validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Llama 3.1 8B Instruct) |
| Parametros totales | 8.030 millones (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos en FP16/BF16) |
| Idiomas soportados | No disponible (se hereda el multilingüismo del modelo base, pero sin confirmación) |
| Licencia | No disponible (el README indica "license" pero sin valor; probablemente hereda la licencia de Llama 3.1, pero no se confirma) |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base `meta-llama/Llama-3.1-8B-Instruct`, que emplea una arquitectura transformer densa con 32 capas, atención multi-cabeza y normalización RMSNorm. El nombre "ffn-only" sugiere que durante el fine-tuning solo se actualizaron los pesos de las capas feed-forward, dejando congeladas las capas de atención y las embeddings. Esta técnica de ajuste parcial reduce el coste computacional y puede ayudar a preservar las capacidades generales del modelo mientras se adapta a un dominio específico.

El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL (Transformers Reinforcement Learning) en su versión 0.29.1, con Transformers 5.9.0, PyTorch 2.11.0 y Datasets 4.4.1. No se proporciona información sobre el dataset utilizado, el número de pasos de entrenamiento, la tasa de aprendizaje ni ninguna métrica de evaluación. El enlace a Weights & Biases incluido en el README apunta a un run de entrenamiento, pero no se puede acceder a los detalles sin credenciales.

## Capacidades

- Generación de texto y conversación: al estar basado en Llama 3.1 8B Instruct, conserva las capacidades de diálogo y generación de texto del modelo original, aunque el fine-tuning podría haberlas especializado hacia el dominio legal (nombres de casos civiles).
- Razonamiento y comprensión: hereda las habilidades de razonamiento de Llama 3.1, pero no hay evidencia de mejoras o degradaciones específicas.
- Soporte de tool calling: el modelo base soporta function calling, pero no se confirma si el fine-tuning lo preserva.
- Multilingüismo: el modelo base es multilingüe (inglés, español, francés, alemán, etc.), pero no hay datos sobre si el ajuste fino afecta a otros idiomas.
- Capacidades especiales: ninguna documentada más allá del posible enfoque en terminología legal civil.

## Casos de uso

Dado que la información es limitada, los casos de uso se infieren del nombre del modelo y de las capacidades del modelo base:

- Asistencia jurídica especializada: el modelo podría utilizarse para generar o completar nombres de casos civiles, resúmenes de expedientes o documentos legales. Adecuado por su posible entrenamiento en vocabulario legal específico.
- Clasificación de documentos legales: si el fine-tuning ha mejorado la comprensión de terminología civil, podría emplearse para categorizar sentencias o escritos.
- Generación de plantillas legales: para redactar borradores de demandas, contratos u otros documentos basados en casos civiles.
- Búsqueda semántica en bases de datos legales: integrado en un sistema RAG, podría ayudar a recuperar jurisprudencia relevante.
- Chatbot de consulta legal: para responder preguntas frecuentes sobre procedimientos civiles, siempre con supervisión humana.
- Análisis de sentencias: para extraer entidades como nombres de partes, jueces o tribunales en textos judiciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica para este modelo específico. Al ser un fine-tuning de Llama 3.1 8B Instruct, se podría esperar un rendimiento similar al del modelo base en tareas generales, pero no se puede confirmar sin evaluaciones propias.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 8B parámetros en FP16 se necesitan aproximadamente 16 GB de VRAM. Con cuantización a 8 bits se reduce a unos 8 GB, y con 4 bits a unos 4-5 GB. No se proporcionan cuantizaciones oficiales, pero se pueden generar con herramientas como llama.cpp o GPTQ.
- GPU recomendadas: una NVIDIA RTX 3090/4090 (24 GB VRAM) o una A100 (40/80 GB) son suficientes para FP16. Para cuantización 4-bit, una GPU con 8 GB (RTX 3070, RTX 4060) puede ser suficiente.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, Text Generation Inference (TGI), o usar llama.cpp/Ollama si se convierte a GGUF. También es compatible con el pipeline de Hugging Face.
- Latencia y throughput: no se dispone de datos específicos. Para un modelo de 8B en una GPU moderna, se espera una latencia de decodificación de entre 20 y 50 ms por token en FP16, y mayor con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128k | Llama 3.1 Community License | Modelo base, ampliamente validado |
| `Jongbin-kr/llama-3.1-8b-instruct_lbox-casename-civil_ffn-only` | 8B | 128k (heredado) | No disponible | Fine-tuning experimental, sin benchmarks |
| `mistralai/Mistral-7B-Instruct` | 7B | 32k | Apache 2.0 | Alternativa con contexto más corto y licencia permisiva |

No se dispone de información suficiente para comparar rendimiento real. La comparativa se limita a características generales.

## Limitaciones y advertencias

- Datos insuficientes: no hay documentación sobre el dataset de entrenamiento, el proceso de ajuste ni las métricas de calidad. El modelo no ha sido evaluado públicamente.
- Sesgos desconocidos: al ser un fine-tuning de un modelo base ya sesgado, puede heredar sesgos de género, raza o clase presentes en los datos de entrenamiento originales. Además, el dominio legal puede amplificar sesgos si los datos de entrenamiento no son equilibrados.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en un dominio técnico como el legal. No debe usarse sin supervisión humana.
- Limitaciones de licencia: la licencia no está especificada. Si hereda la licencia de Llama 3.1, su uso comercial está permitido pero con ciertas restricciones (por ejemplo, no usar para mejorar otros modelos grandes). Se recomienda contactar al autor para aclarar.
- Falta de soporte: al ser un modelo con 0 descargas, no hay comunidad ni mantenimiento. No se garantiza compatibilidad futura con versiones de librerías.
- Posible sobreajuste: el entrenamiento "ffn-only" puede no haber capturado adecuadamente el dominio si el dataset era pequeño o poco representativo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jongbin-kr/llama-3.1-8b-instruct_lbox-casename-civil_ffn-only
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Enlace a Weights & Biases (entrenamiento): https://wandb.ai/jongbin-kr-skiml_moe/sft_dense_lbox_ffn_only/runs/kc3lxgp9
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
