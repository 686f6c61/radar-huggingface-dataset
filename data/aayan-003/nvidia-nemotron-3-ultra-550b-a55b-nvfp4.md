# aayan-003/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4

## Resumen

Nemotron-3-Ultra-550B-A55B es un modelo de lenguaje de escala frontera desarrollado por NVIDIA dentro de la familia Nemotron, publicada con pesos abiertos, datos de entrenamiento y recetas. Emplea una arquitectura híbrida denominada LatentMoE que combina capas Mamba-2, capas de mezcla de expertos (MoE) y capas de atención selectivas, e incorpora predicción multi-token (MTP). Con 550 000 millones de parámetros totales y 55 000 millones activos por token, está orientado a razonamiento complejo, flujos agénticos de varios pasos y análisis de contexto largo.

La variante aquí descrita, publicada por el usuario aayan-003, es una conversión a NVFP4 (formato de coma flotante de 4 bits de NVIDIA) del modelo original, con pesos en safetensors y un tamaño de repositorio de 352,3 GB. El modelo original admite hasta 1 millón de tokens de contexto, modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking=True/False`) y soporte para once idiomas, entre ellos el español.

Su relevancia actual radica en que ofrece capacidades de nivel frontera en tareas de agente, código y matemáticas con una licencia permisiva para uso comercial (OpenMDW-1.1) y con datos de preentrenamiento y postentrenamiento publicados. La cuantización NVFP4 reduce el coste de inferencia respecto a BF16 manteniendo, según los datos del autor, un rendimiento muy cercano en la mayoría de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LatentMoE: híbrido Mamba-2 + MoE + atención, con capas MTP (Multi-Token Prediction) |
| Parametros totales | 560 524 603 928 (≈550B según el autor) |
| Parametros activos | 55B |
| Longitud de contexto | Hasta 1 000 000 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, receta ModelOpt); el modelo original se distribuye en BF16 |
| Idiomas soportados | Inglés, francés, español, italiano, alemán, portugués (Brasil), japonés, coreano, hindi, árabe, chino y hebreo (según tags; la model card cita diez idiomas principales) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida en la que se intercalan capas Mamba-2 (modelo de espacio de estados) con capas de mezcla de expertos y capas de atención puntuales. Esta combinación busca reducir el coste computacional del contexto largo frente a un transformer denso, manteniendo la capacidad de recuperación de información de la atención. La componente LatentMoE enruta cada token hacia un subconjunto de expertos, de modo que solo se activan 55B de los 550B parámetros totales. Las capas MTP permiten predecir varios tokens por paso, lo que acelera la generación y, según el autor, mejora la calidad.

El entrenamiento se realizó en dos fases: preentrenamiento con datos de la colección `nvidia/nemotron-pre-training-datasets` (fecha de corte septiembre de 2025) y postentrenamiento con `nvidia/nemotron-post-training-v3` (corte mayo de 2026). El modelo se entrenó con una receta NVFP4 para maximizar la eficiencia de cómputo, y la variante aquí publicada aplica cuantización NVFP4 mediante ModelOpt. No se detallan en la información disponible el número exacto de tokens de entrenamiento ni la composición pormenorizada del dataset, ni si se emplearon RLHF o DPO específicos.

## Capacidades

- Generación de texto conversacional multi-turno con trazas de razonamiento configurables (`enable_thinking`).
- Razonamiento complejo en código, matemáticas y ciencia, con soporte para tareas de varios pasos.
- Flujos agénticos: uso de herramientas (tool calling), ejecución de comandos en terminal y resolución de incidencias de software (evaluado en Terminal Bench y SWE-Bench).
- Análisis de contexto largo de hasta 1M tokens, adecuado para RAG de alta exigencia y documentos extensos.
- Capacidades multilingües en once idiomas, incluido el español.
- Predicción multi-token (MTP) para acelerar la decodificación.
- Compatible con endpoints y con la librería transformers.

## Casos de uso

- Agentes de ingeniería de software: el modelo puede resolver incidencias reales de repositorios (SWE-Bench Verified 69,5 en NVFP4) e integrarse en pipelines de CI/CD para generar parches y validar tests.
- Automatización de operaciones en terminal: con Terminal Bench 2.1 en 53,9, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de shell.
- RAG de alta exigencia sobre corpus extensos: su ventana de 1M tokens permite ingerir manuales, expedientes o bases documentales completas sin fragmentación agresiva.
- Atención al cliente compleja: conversaciones multi-turno con contexto largo y soporte multilingüe para mercados europeos y asiáticos.
- Asistentes de investigación científica: razonamiento sobre literatura, código de simulación y datos experimentales con trazas de razonamiento auditables.
- Análisis financiero y legal: extracción y razonamiento sobre contratos o informes extensos, con modo thinking para justificar conclusiones.
- Generación de código en producción: integración vía tool calling en IDE o servicios internos, con cuantización NVFP4 para reducir coste por token.

## Benchmarks y rendimiento

| Benchmark | Nemotron 3 Ultra BF16 | Nemotron 3 Ultra NVFP4 |
|---|---|---|
| Terminal Bench 2.1 | 56,4 | 53,9 |
| GDPVal | 46,7 | 47,9 |
| SWE-Bench Verified | 70,7 | 69,5 |
| SWE-Bench Multilingual | 67,7 | 69,1 |
| ProfBench (Search) | 56 | 56,4 |
| PinchBench | 90 | 89,8 |
| TauBench V3 Airline | 81,5 | 80,0 |
| TauBench V3 Retail | 86,4 | 88,4 |
| TauBench V3 Telecom | 92,9 | 93,6 |
| TauBench V3 Banking | 22,6 | 19,2 |

No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Requisito mínimo indicado por el autor: 4× GB200, 4× B200, 4× GB300, 4× B300 u 8× H100.
- VRAM estimada: el repositorio NVFP4 ocupa 352,3 GB, por lo que se necesita al menos ese volumen agregado de memoria; en BF16 el modelo original requeriría aproximadamente 1,1 TB.
- No cabe en GPU de consumo (RTX 4090, 5090) ni en configuraciones de una sola GPU de 80 GB.
- Despliegue recomendado en clústeres multi-GPU con vLLM, TensorRT-LLM o TGI; llama.cpp y Ollama no son viables por tamaño.
- Latencia y throughput: no disponibles en la información proporcionada; las capas MTP y la cuantización NVFP4 están diseñadas para mejorar el throughput respecto a BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron-3-Ultra-550B-A55B (NVFP4) | 550B totales / 55B activos | 1M | OpenMDW-1.1 | Pesos abiertos en HF |
| Nemotron-3-Super (familia Nemotron 3) | No disponible | No disponible | OpenMDW-1.1 | Pesos abiertos en HF |
| Alternativas frontera de otros proveedores | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos competidores comparables, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a modelos de este tamaño; las trazas de razonamiento no garantizan corrección factual.
- Rendimiento notablemente inferior en TauBench V3 Banking (19,2 en NVFP4), lo que sugiere debilidad en dominios financieros específicos.
- La model card lista diez idiomas principales, mientras que los tags incluyen árabe y hebreo; conviene validar el rendimiento real en esos idiomas antes de producción.
- La cuantización NVFP4 introduce degradación en algunas tareas (Terminal Bench 2.1, SWE-Bench Verified, PinchBench) respecto a BF16; evaluar por caso de uso.
- Licencia OpenMDW-1.1: permite uso comercial, pero deben revisarse sus términos completos antes de su adopción.
- Requisitos de hardware muy elevados (mínimo 4× B200/GB200 o 8× H100), lo que limita su uso a organizaciones con infraestructura de datacenter.
- Fecha de corte de datos: preentrenamiento septiembre de 2025, postentrenamiento mayo de 2026; no conoce eventos posteriores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y es una conversión de terceros (aayan-003) del modelo original de NVIDIA; conviene verificar su fidelidad frente a la versión oficial.

## Enlaces

- Hugging Face: https://huggingface.co/aayan-003/NVIDIA-Nemotron-3-Ultra-550B-A55B-NVFP4
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3-Ultra-Technical-Report.pdf
- Chat en NVIDIA Build: https://build.nvidia.com/nvidia/nemotron-3-ultra-550b-a55b
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Datasets de preentrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Datasets de postentrenamiento: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
