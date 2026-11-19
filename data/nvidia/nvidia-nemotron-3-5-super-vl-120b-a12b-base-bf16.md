# nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16 es el checkpoint base de visión-lenguaje de la familia Nemotron 3.5 Super, desarrollado por NVIDIA Corporation. Se trata de un modelo de 120 000 millones de parámetros totales con 12 000 millones de parámetros activos, pensado como punto de partida para entrenamiento continuado, adaptación de dominio y desarrollo de modelos visión-lenguaje post-entrenados personalizados. No es un modelo listo para uso conversacional directo: es una base sobre la que construir.

El modelo combina una columna vertebral lingüística inicializada desde Nemotron 3 Super Base y destilada desde Nemotron 3 Ultra Base, ampliada con un codificador visual C-RADIO y un conector visión-lenguaje. La arquitectura es un híbrido de capas Mamba-2, capas de atención y capas de mezcla de expertos (MoE) con 512 expertos enrutados por capa, más Multi-Token Prediction (MTP) para decodificación especulativa nativa. Soporta contextos de hasta 1 millón de tokens.

Es relevante ahora porque NVIDIA publica no solo los pesos, sino también los datos de preentrenamiento y las recetas, bajo la licencia OpenMDW 1.1, que permite uso comercial. Para equipos que quieran construir modelos multimodales especializados sin partir de cero, este checkpoint ofrece una base de 120B con contexto de 1M y capacidades multilingües en seis idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba-2 + Transformer con MoE y Multi-Token Prediction (MTP); codificador visual C-RADIO y conector visión-lenguaje |
| Parametros totales | 124 453 395 974 (124,45B) |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1 000 000 tokens |
| Tipos de cuantizacion | BF16 (checkpoint publicado); existe una release NVFP4 del modelo post-entrenado, no de este base |
| Idiomas soportados | en, es, fr, de, it, ja (además, preentrenamiento continuado en lenguas índicas) |
| Licencia | OpenMDW 1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (BF16), librería transformers, código personalizado (`nemotron_h_omni`) |
| Expertos por capa MoE | 512 expertos enrutados |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 248,9 GB |
| Fecha de publicación | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un híbrido que intercala capas Mamba-2 (modelos de espacio de estados), capas de atención y capas de mezcla de expertos. Cada capa MoE contiene 512 expertos enrutados, lo que da los 124,45B de parámetros totales con solo 12B activos por token. La inclusión de MTP permite decodificación especulativa nativa, es decir, el modelo predice varios tokens por paso para acelerar la inferencia sin un modelo borrador externo. La parte visual la aporta un codificador C-RADIO conectado mediante un conector visión-lenguaje entrenado.

El backbone lingüístico se inicializa desde Nemotron 3 Super Base y se entrena por destilación desde Nemotron 3 Ultra Base. Después recibe preentrenamiento continuado en lenguas índicas, entrenamiento de contexto largo y mid-training orientado a ingeniería de software. Los datos de preentrenamiento están publicados en el dataset `nvidia/nemotron-pre-training-datasets`. La model card no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset, ni confirma si hubo RLHF o DPO (al ser un checkpoint base, es esperable que no).

## Capacidades

- Generación de texto y razonamiento en seis idiomas (inglés, español, francés, alemán, italiano y japonés), con resultados reportados en Global MMLU y MGSM multilingüe.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text) gracias al codificador C-RADIO.
- Razonamiento matemático y resolución de problemas (GSM8K, Minerva MATH, MATH-500).
- Generación de código y tareas de ingeniería de software (HumanEval, MBPP, LiveCodeBench, BigCodeBench), reforzado por el mid-training específico.
- Contexto largo de hasta 1M tokens, útil para documentos extensos, repositorios de código o conversaciones multi-turno largas.
- Decodificación especulativa nativa vía MTP, que reduce la latencia en inferencia autoregresiva.
- Capacidad de servir como base para fine-tuning supervisado, RL, destilación y adaptación de dominio.
- No se especifica en la información disponible soporte explícito de tool calling o function calling (es un checkpoint base, no post-entrenado para agentes).

## Casos de uso

- Desarrollo de modelos visión-lenguaje especializados: partir de este checkpoint y hacer fine-tuning supervisado sobre un dominio concreto (por ejemplo, inspección industrial o documentación técnica) aprovechando que ya integra codificador visual y conector entrenados.
- Adaptación a dominios verticales con contexto largo: usar la ventana de 1M tokens para tareas de análisis de contratos, expedientes o repositorios completos, ajustando el modelo con datos propios.
- Investigación en arquitecturas híbridas Mamba-2/MoE: el modelo sirve como banco de pruebas reproducible para estudiar eficiencia de enrutamiento, MTP y decodificación especulativa, con datos de preentrenamiento publicados.
- Generación de código asistida en pipelines internos: tras un post-entrenamiento ligero, el backbone (con HumanEval 81,31 y MBPP 79,06 en su versión texto) puede integrarse en herramientas de autocompletado o revisión de código.
- Destilación hacia modelos más pequeños: usar los 120B como profesor para generar datos y entrenar modelos de 7B-30B para despliegue en producción con menores requisitos de hardware.
- Procesamiento multilingüe de documentos con imágenes: extracción y razonamiento sobre facturas, informes o capturas en español, francés, alemán, italiano o japonés, aprovechando las capacidades multilingües reportadas (Global MMLU 86,56).
- Evaluación comparativa de bases multimodales: servir como referencia en estudios académicos sobre modelos abiertos de gran escala con licencia permisiva.

## Benchmarks y rendimiento

Los resultados publicados corresponden al backbone de texto de Nemotron 3.5 Super Base, antes del entrenamiento visión-lenguaje. No se han publicado resultados de benchmarks específicos del modelo multimodal en la información disponible.

| Benchmark | Metrica | Resultado (%) |
|---|---|---|
| MMLU | Exact match | 84,14 |
| MMLU-Pro | Exact match, extracción TigerLab | 76,25 |
| AGIEval-En | CoT exact match | 75,65 |
| SuperGPQA | CoT | 47,65 |
| GPQA Diamond | 5-shot, CoT exact match | 66,16 |
| GSM8K | 8-shot, CoT exact match | 91,74 |
| Minerva MATH | Exact match | 87,66 |
| MATH-500 | 4-shot, pass@1 muestreado, n=32 | 81,56 |
| HumanEval | EvalPlus sanitized, pass@1 muestreado, n=32 | 81,31 |
| MBPP-Sanitized | 3-shot, pass@1 muestreado, n=32 | 79,06 |
| LiveCodeBench CodeGen | Pass@1 | 47,61 |
| BigCodeBench Complete | Greedy | 48,42 |
| BigCodeBench Instruct | Greedy | 49,39 |
| CommonsenseQA | 7-shot, accuracy | 85,26 |
| ARC-Challenge | 25-shot, accuracy normalizada | 95,99 |
| HellaSwag | 10-shot, accuracy normalizada | 88,96 |
| OpenBookQA | 0-shot, accuracy normalizada | 48,80 |
| PIQA | 0-shot, accuracy normalizada | 85,09 |
| TruthfulQA MC2 | 0-shot, accuracy | 71,18 |
| WinoGrande | 5-shot, accuracy | 79,08 |
| SocialIQA | 0-shot, accuracy | 49,03 |
| RACE | 0-shot, accuracy | 91,39 |
| Global MMLU | Media en 8 idiomas | 86,56 |
| MGSM | 8-shot, CoT nativo, media en 6 idiomas | 87,53 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 249 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere múltiples GPU de 80 GB (por ejemplo, 4× H100 80GB como mínimo razonable, más margen para contexto largo).
- Contexto de 1M tokens: la caché KV crece linealmente con la longitud; para aprovechar la ventana completa se necesitan configuraciones de 8× H100/A100 o más, y técnicas de atención eficiente o paralelismo de contexto.
- GPU recomendadas: H100 SXM, H100 NVL, A100 80GB, y en general GPUs de centro de datos con NVLink para tensor parallelism. No cabe en GPUs de consumo (RTX 4090, 5090) en BF16.
- Cuantización: el checkpoint publicado es BF16; para despliegue en hardware menor habría que cuantizar a FP8/NVFP4/INT4, aunque no se documentan recetas oficiales para este base (sí existe una release NVFP4 del post-entrenado).
- Opciones de despliegue: transformers con `nemotron_h_omni` y código personalizado; para producción a gran escala, vLLM o TGI requerirían soporte específico de la arquitectura híbrida Mamba-2/MoE (no confirmado en la información disponible). llama.cpp/Ollama no son viables a este tamaño.
- Latencia y throughput: no disponibles en la información proporcionada. La decodificación especulativa vía MTP debería mejorar el throughput respecto a un transformer denso equivalente, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Nemotron 3.5 Super VL 120B A12B Base | 124,45B / 12B | 1M | OpenMDW 1.1 (comercial) | Híbrido Mamba-2/MoE, MTP, visión C-RADIO, datos de preentrenamiento publicados |
| Nemotron 3.5 Super VL 120B A12B (post-entrenado) | 124,45B / 12B | 1M | OpenMDW 1.1 | Misma base, listo para uso conversacional y personalización |
| Nemotron 3.5 Super VL 120B A12B NVFP4 | 124,45B / 12B | 1M | OpenMDW 1.1 | Versión cuantizada para despliegue optimizado |
| Alternativas de otros fabricantes | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

La comparación con modelos de otros fabricantes (por ejemplo, familias tipo Qwen-VL o Llama Vision de tamaño similar) no puede realizarse con rigor porque la información proporcionada no incluye sus especificaciones ni resultados. Se indica como no disponible.

## Limitaciones y advertencias

- Es un checkpoint base, no post-entrenado: no está alineado para conversación, no sigue instrucciones de forma fiable y puede producir salidas incoherentes o inseguras sin fine-tuning previo.
- Riesgo de alucinación inherente a modelos base; no se han aplicado técnicas de alineación (RLHF/DPO) que lo mitiguen.
- Sesgos: los datos de preentrenamiento provienen de corpus web y de NVIDIA; pueden contener sesgos demográficos, culturales y lingüísticos no documentados en detalle.
- Cobertura idiomática limitada a seis idiomas principales (más índicas en preentrenamiento); el rendimiento en otros idiomas no está garantizado.
- El contexto de 1M tokens es costoso en memoria y latencia; no todos los frameworks lo soportan de forma eficiente.
- Licencia OpenMDW 1.1: permite uso comercial, pero conviene revisar los términos exactos (atribución, restricciones de uso aceptable) antes de desplegar en producción.
- Requiere hardware de centro de datos (múltiples GPU de 80 GB); no es viable en estaciones de trabajo convencionales sin cuantización agresiva.
- El soporte en vLLM, TGI u otros servidores de inferencia no está confirmado; la arquitectura híbrida con código personalizado puede requerir trabajo de integración.
- No se documentan capacidades de tool calling ni de agente en este checkpoint base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-Base-BF16
- Versión post-entrenada BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Versión NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Colección Nemotron 3: https://huggingface.co/collections/nvidia/nvidia-nemotron-v3
- Datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Informe técnico Nemotron 3.5 Super y Lightning: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Super-and-Lightning-Technical-Report.pdf
- Informe técnico Nemotron 3 Ultra: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
