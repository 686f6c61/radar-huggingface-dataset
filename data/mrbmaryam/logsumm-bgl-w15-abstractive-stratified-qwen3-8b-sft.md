# mrbmaryam/logsumm-bgl-w15-abstractive-stratified-qwen3-8b-sft

## Resumen

`mrbmaryam/logsumm-bgl-w15-abstractive-stratified-qwen3-8b-sft` es un ajuste fino supervisado (SFT) del modelo Qwen3-8B, publicado por el usuario mrbmaryam en Hugging Face. El nombre del repositorio sugiere que el entrenamiento se ha orientado a la generación abstractiva de resúmenes sobre el corpus BIGPATENT (BGL = BigPatent), con una estrategia de muestreo estratificado y una ventana de contexto de 15 (W15), aunque la model card no documenta estos detalles de forma explícita. El modelo base declarado es `unsloth/Qwen3-8B-bnb-4bit`, una versión cuantizada a 4 bits del Qwen3-8B original.

Qwen3-8B es un transformer denso de 8.200 millones de parámetros desarrollado por Alibaba Qwen, con soporte de modo "thinking" y una ventana de contexto nativa de 32.768 tokens (extensible a 131.072). Este ajuste fino hereda esa arquitectura y capacidades, pero ha sido especializado mediante entrenamiento supervisado con la librería Unsloth y TRL, lo que reduce el coste computacional del entrenamiento.

La relevancia de esta ficha es limitada: se trata de un modelo de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación de entrenamiento más allá de la plantilla estándar de Unsloth. Es útil como ejemplo de pipeline de ajuste fino eficiente sobre Qwen3, pero no debe considerarse un modelo listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), ajuste fino SFT sobre `unsloth/Qwen3-8B-bnb-4bit` |
| Parametros totales | 8.200 millones (heredados de Qwen3-8B; no confirmado en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el base Qwen3-8B soporta 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible en el repo; el base se distribuye en bnb-4bit y admite GGUF/AWQ mediante herramientas externas |
| Idiomas soportados | en (declarado); el base Qwen3 es multilingüe pero el ajuste fino solo declara inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, compatible con transformers y TGI) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del Qwen3-8B cuantizado a 4 bits mediante bitsandbytes y cargado a través de Unsloth. Qwen3-8B es un transformer decoder-only denso con atención por grupos (GQA), RoPE y soporte de modo de razonamiento explícito ("thinking"). El ajuste se realizó con TRL (probablemente `SFTTrainer`) y Unsloth, que según la model card permitió entrenar "2x más rápido" que un pipeline convencional, aunque no se especifican GPU, horas, número de tokens ni composición del dataset.

El nombre del repositorio indica que el dataset de entrenamiento es BIGPATENT (patentes estadounidenses) con tarea de resumen abstractivo, muestreo estratificado y una ventana de 15 (probablemente 15 documentos o 15 unidades de contexto por muestra). No se documenta si hubo RLHF, DPO, ni qué proporción del dataset se dedicó a validación. Tampoco se indica la estrategia de enmascarado de pérdida ni si se preservó el chat template de Qwen3.

## Capacidades

- Generación de texto y resumen abstractivo de documentos largos (patentes, informes técnicos) en inglés.
- Razonamiento multi-paso heredado de Qwen3-8B, incluyendo modo "thinking" si el chat template se preserva en el ajuste.
- Generación de código y matemáticas (capacidad del base, no evaluada tras el ajuste).
- Soporte de tool calling y function calling (capacidad del base Qwen3; no verificada en este checkpoint).
- Capacidades multilingües del base Qwen3, aunque el ajuste fino solo declara inglés.
- No se documenta soporte de visión ni audio.

## Casos de uso

- Resumen automático de patentes: el modelo se ha entrenado específicamente sobre BIGPATENT, por lo que puede generar resúmenes abstractivos de reivindicaciones y descripciones técnicas en inglés para bases de datos de propiedad intelectual.
- Generación de resúmenes ejecutivos de documentación técnica larga: útil en pipelines internos donde se ingieren informes y se necesita una síntesis en lenguaje natural, aprovechando la ventana de contexto del base Qwen3.
- Extracción de ideas clave en revisión de literatura científica o legal: el modelo puede condensar secciones densas en párrafos breves, siempre con revisión humana dada la ausencia de benchmarks.
- Prototipado de pipelines de sumarización con Unsloth: sirve como referencia para equipos que quieran replicar el flujo de SFT eficiente sobre Qwen3 con datasets propios.
- Filtrado y triaje de documentos en inglés: clasificación y resumen preliminar de grandes volúmenes de texto antes de un análisis más profundo.
- Investigación académica sobre ajuste fino de modelos de 8B: útil como baseline para estudiar el efecto del SFT en tareas de sumarización abstractiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16-18 GB (8,2B parámetros × 2 bytes + overhead de KV cache).
- VRAM estimada en cuantización 4 bits (bnb o GPTQ/AWQ): aproximadamente 5-6 GB, suficiente para GPUs consumer de 8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y serving a gran escala; RTX 4090 (24 GB) o RTX 3090 para FP16; RTX 4060 Ti 16 GB o RTX 4070 para 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090/3090 a FP16 y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, etiqueta `text-generation-inference` presente), vLLM, llama.cpp/Ollama si se convierte a GGUF (no incluido en el repo).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrbmaryam/logsumm-bgl-w15-abstractive-stratified-qwen3-8b-sft | 8,2B | no disponible (base 32k) | apache-2.0 | Hugging Face, 0 descargas | Ajuste específico para BIGPATENT |
| Qwen/Qwen3-8B | 8,2B | 32.768 (ext. 131.072) | apache-2.0 | Hugging Face, ampliamente usado | Base generalista, benchmarks públicos |
| unsloth/Qwen3-8B-bnb-4bit | 8,2B | 32.768 | apache-2.0 | Hugging Face | Versión cuantizada 4 bits del base |
| Modelos de sumarización tipo PEGASUS/BART-large | ~0,4B | 1.024 | MIT/apache-2.0 | Hugging Face | Especializados en sumarización, mucho más pequeños |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de que el ajuste mejore al base en tareas de sumarización.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros, GPU utilizadas ni métricas de validación.
- Sesgos heredados de Qwen3-8B y del corpus BIGPATENT (patentes estadounidenses, dominio técnico y legal sesgado hacia inglés y hacia un tipo concreto de redacción).
- Riesgo de alucinación en resúmenes abstractivos, especialmente con documentos fuera del dominio de patentes.
- Solo declara inglés; el rendimiento en castellano no está garantizado aunque el base sea multilingüe.
- Licencia apache-2.0 permite uso comercial, pero al ser un ajuste derivado de Qwen3 conviene revisar también los términos del modelo base.
- Cero descargas y cero likes: no hay señal de validación por parte de la comunidad.
- El repo de 0,2 GB sugiere pesos en precisión reducida o safetensors parciales; verificar la integridad antes de desplegar.
- No recomendado para producción sin una evaluación propia en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrbmaryam/logsumm-bgl-w15-abstractive-stratified-qwen3-8b-sft
- Modelo base (Qwen3-8B): https://huggingface.co/Qwen/Qwen3-8B
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (repositorio): https://github.com/huggingface/trl
- Dataset BIGPATENT (referencia): https://huggingface.co/datasets/big_patent
