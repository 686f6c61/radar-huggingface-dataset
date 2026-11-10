# MultiverseComputingCAI/Comet_60B_A12B_FP8

## Resumen

Comet 60B es un modelo multimodal de tipo image-text-to-text desarrollado por Multiverse Computing a partir de NVIDIA Nemotron 3.5 Super VL 120B, mediante su técnica de compresión CompactifAI. El modelo original es un Mixture-of-Experts híbrido Mamba2-Transformer de 124,5B parámetros totales con unos 12,8B activos por token; Comet reduce el total a 61,1B manteniendo el mismo régimen de activación (12,3B por token), la misma estructura de capas, tokenizer y chat template, y conserva la capa de multi-token prediction (MTP). Tras la compresión, el modelo se curó mediante destilación del Nemotron 3.5 Super original sobre datos de texto, imagen y vídeo.

La propuesta de valor es doble: por un lado, reduce a la mitad el peso en memoria (122,3 GB en BF16 frente a unos 249 GB del original), lo que permite servir el modelo en 2× H200 en lugar de 4, o en una sola H200 con la versión FP8 (66,3 GB) y en una sola GPU Blackwell con la NVFP4 (40,5 GB). Por otro, según el autor, mejora al original en benchmarks de agentes (τ²-Bench, AutomationBench-AA, SWE-bench Pro) y se mantiene a menos de 3 puntos en 28 de 35 métricas evaluadas.

Es relevante ahora porque demuestra que la compresión agresiva de MoE multimodales puede mantener capacidades de razonamiento, visión y tool calling con la mitad de parámetros, abriendo la puerta a despliegues de modelos de clase 120B en infraestructura más modesta y con mayor throughput por GPU. La ficha cubre la variante FP8, que es la publicada en este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer con Mixture-of-Experts latente (88 capas: 40 Mamba2, 40 MoE, 8 attention), hidden size 4.096, expertos en espacio latente de 1.024 dimensiones; encoder visual RADIO ViT-H/16 (32 capas); 1 capa MTP |
| Parametros totales | 61,1B (58,9B language model, 1,4B MTP, 0,8B vision encoder y proyector); 61.663.606.044 según safetensors |
| Parametros activos | 12,3B por token (22 de 256 expertos enrutados por capa MoE más 1 experto compartido; incluye embeddings y cabeza de salida) |
| Longitud de contexto | Evaluado con 262.144 tokens; la configuración permite hasta 1.048.576 posiciones, aunque contextos mayores no fueron evaluados |
| Tipos de cuantizacion | BF16 (122,3 GB), FP8 (66,3 GB, para NVIDIA Hopper y Blackwell), NVFP4 (40,5 GB, para NVIDIA Blackwell). Esta ficha corresponde a FP8: expertos y proyecciones Mamba en FP8, resto en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW License Agreement 1.1 (pesos); código del repositorio bajo Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que intercala capas Mamba2 (modelo de espacio de estados) con capas de atención y capas MoE. De las 88 capas, 40 son Mamba2, 40 son MoE y solo 8 son de atención, lo que reduce el coste de atención en contextos largos. Los expertos operan en un espacio latente de 1.024 dimensiones, con 256 expertos enrutados por capa (frente a 512 en el original) más un experto compartido, y se activan 22 por token. El encoder visual es un RADIO ViT-H/16 de 32 capas y se conserva una capa de multi-token prediction (MTP) que habilita decodificación especulativa.

El entrenamiento de Comet consiste en la compresión CompactifAI del Nemotron 3.5 Super VL 120B, seguida de una fase de "healing" mediante destilación del modelo original sobre datos de texto, imagen y vídeo. No se especifican en la información disponible el número de tokens de destilación ni la composición exacta del dataset. Tampoco se detalla si hubo fases de RLHF o DPO posteriores; el modelo hereda las capacidades de razonamiento configurable y tool calling del base. La innovación principal es la compresión a la mitad de parámetros manteniendo el régimen de activación y la estructura, junto con la conservación de MTP para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" configurable (control de razonamiento).
- Procesamiento de imágenes y vídeo como entrada, con salida de texto (sin audio).
- Tool calling / function calling, con parsers de razonamiento y herramientas compatibles con vLLM.
- Capacidades agénticas y razonamiento multi-paso, con mejoras reportadas en τ²-Bench, AutomationBench-AA y SWE-bench Pro frente al modelo base.
- Generación y edición de código, con soporte para SWE-bench Verified y SWE-bench Pro.
- Comprensión de documentos e imágenes (benchmarks de imagen, documento y vídeo).
- Capacidades multilingües limitadas al inglés según la model card.
- Decodificación especulativa mediante la capa MTP conservada.
- Compatible con endpoints (tag endpoints_compatible) y con el stack de serving de vLLM del modelo base.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 262.144 tokens evaluados, lo que permite incorporar historiales largos y documentos de referencia en una sola ventana sin truncar.
- Agentes autónomos de soporte técnico: gracias a tool calling y a su rendimiento en τ²-Bench (airline, retail, telecom), puede orquestar llamadas a APIs y resolver incidencias multi-paso en entornos de helpdesk.
- Generación y revisión de código en producción: con soporte de SWE-bench Verified y SWE-bench Pro, puede integrarse en pipelines de CI/CD para proponer parches, revisar diffs y resolver issues acotadas.
- Análisis de documentos e imágenes: al aceptar image-text-to-text, puede extraer información de facturas, formularios o capturas y responder preguntas sobre ellos en flujos de back-office.
- Procesamiento de vídeo para moderación o resumen: la entrada de vídeo permite generar descripciones y resúmenes de clips en pipelines de monitorización o catalogación de contenido.
- Despliegue en infraestructura contenida: la variante FP8 cabe en una sola H200 con contexto completo de 256K, lo que facilita servir un modelo de clase 120B en un único nodo para prototipos y cargas medias.
- Automatización de tareas de oficina con razonamiento controlable: el modo thinking configurable permite ajustar latencia y profundidad de razonamiento según la tarea, útil en asistentes internos con presupuesto de cómputo variable.

## Benchmarks y rendimiento

La información proporcionada no incluye una tabla numérica de resultados por benchmark. La model card indica de forma cualitativa que Comet 60B supera al Nemotron 3.5 Super en τ²-Bench (airline, retail y telecom), AutomationBench-AA y SWE-bench Pro, y que se mantiene a menos de 3 puntos en 28 de 35 puntuaciones, incluyendo GPQA Diamond, AA-LCR, SWE-bench Verified y la mayoría de benchmarks de imagen, documento y vídeo. No se han publicado los valores numéricos concretos en la información disponible, por lo que no se presentan cifras.

En cuanto a serving, el autor reporta que en el mismo 4× H200, Comet sirve entre un 20% y un 23% más de tokens de salida por segundo que Nemotron 3.5 Super en trazas de chat y agenticas de NVIDIA, y que la versión FP8 en 2× H200 entrega aproximadamente 1,8× el throughput por GPU del original.

## Requisitos de hardware

- VRAM estimada: FP8 requiere 66,3 GB de pesos (61 GiB medidos en una H200); BF16 requiere 122,3 GB; NVFP4 requiere 40,5 GB.
- GPU recomendadas: H200 (141 GB) para FP8 con contexto completo de 256K en una sola GPU; 2× H200 para BF16 con contexto completo; GPU Blackwell para NVFP4.
- Cabe en consumer GPU: no; el tamaño mínimo (40,5 GB en NVFP4) excede la VRAM de las RTX 4090 (24 GB) y requiere GPUs de centro de datos.
- Opciones de despliegue: vLLM con los mismos parsers de razonamiento y herramientas que el modelo base, con decodificación especulativa MTP; transformers con custom_code. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: en 4× H200, 20–23% más tokens de salida por segundo que el base en trazas de chat y agenticas; FP8 en 2× H200, aproximadamente 1,8× el throughput por GPU del original. Con FP8 en una H200 y contexto completo, hay espacio de KV-cache para unas 20 peticiones concurrentes de 256K tokens (medido).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos por token | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Comet 60B (FP8) | 61,1B | 12,3B | 262.144 evaluados (hasta 1.048.576 configurados) | OpenMDW 1.1 | Hugging Face (BF16, FP8, NVFP4) |
| NVIDIA Nemotron 3.5 Super VL 120B | 124,5B | 12,8B | 262.144 evaluados | no disponible en la información proporcionada | Hugging Face |
| Otros modelos de clase similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es con el modelo base: Comet reduce parámetros totales a la mitad, mantiene activos similares, conserva contexto y mejora en benchmarks de agentes según el autor, con menor huella de memoria y mayor throughput por GPU.

## Limitaciones y advertencias

- Idiomas: solo inglés según la model card; no se garantiza calidad en castellano u otros idiomas.
- Contexto: aunque la configuración permite hasta 1.048.576 posiciones, solo se evaluó con 262.144 tokens; el rendimiento más allá de esa longitud no está validado.
- Modalidades: no admite audio como entrada; la salida es únicamente texto.
- Alucinación: no se documentan tasas específicas; como modelo generativo, mantiene riesgo de alucinación, especialmente en tareas de documento y vídeo.
- Sesgos: la model card incluye secciones de seguridad y consideraciones éticas, pero no se detallan sesgos concretos en la información proporcionada.
- Licencia: los pesos están bajo OpenMDW 1.1, que permite uso comercial según el autor, pero es una licencia específica que conviene revisar antes de producción; el código es Apache 2.0.
- Dependencia de hardware: FP8 requiere Hopper o Blackwell; NVFP4 requiere Blackwell, lo que limita el despliegue en GPUs más antiguas.
- Custom code: requiere transformers con custom_code y los parsers de vLLM del modelo base, lo que añade complejidad de integración frente a modelos estándar.
- Datos de entrenamiento de la destilación: no se detallan tokens ni composición, lo que dificulta evaluar cobertura y sesgos del proceso de healing.

## Enlaces

- Hugging Face (FP8): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_FP8
- Hugging Face (BF16): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Hugging Face (NVFP4): https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
