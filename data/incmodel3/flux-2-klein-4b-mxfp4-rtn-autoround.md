# INCModel3/FLUX.2-klein-4B-MXFP4-RTN-AutoRound

## Resumen

FLUX.2-klein-4B-MXFP4-RTN-AutoRound es una cuantización de 4 bits del modelo de generación de imágenes a partir de texto black-forest-labs/FLUX.2-klein-4B, publicada por el usuario INCModel3. Se trata de un modelo de difusión destilado y ligero, orientado a la síntesis de imágenes en pocos pasos de inferencia, que ha sido comprimido mediante la técnica MXFP4 (micro-scaling de 4 bits, W4A4) con group_size=32, aplicada con AutoRound en modo RTN (round-to-nearest, iters=0). El resultado es un checkpoint de aproximadamente 4 GB, frente a los ~8 GB en bf16 del modelo original.

La relevancia de esta ficha radica en que aborda uno de los cuellos de botella prácticos de los modelos de difusión: el coste de memoria y de cómputo en inferencia. Al reducir el peso a 4 bits con micro-escalado por grupos, el modelo busca caber en GPU de consumo y acelerar la generación, manteniendo la interfaz de la pipeline original de diffusers (Flux2KleinPipeline) y exportándose en formato auto_round compatible con vllm-omni.

El repositorio no registra descargas ni valoraciones en el momento de la consulta y tiene un tamaño de 10,6 GB, lo que sugiere que incluye varios artefactos además de los pesos MXFP4. No se dispone de información sobre idiomas soportados ni de detalles de entrenamiento más allá de la calibración declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para texto-a-imagen (pipeline Flux2KleinPipeline); arquitectura interna no detallada en la información disponible |
| Parámetros totales | 4B (según la denominación del modelo base FLUX.2-klein-4B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusión texto-a-imagen); no disponible |
| Tipos de cuantización | MXFP4 (data_type=mx_fp, bits=4, act_bits=4), group_size=32; se menciona MXFP8 como alternativa recomendada para mayor fidelidad |
| Idiomas soportados | no disponible |
| Licencia | other (se debe seguir la licencia del modelo original black-forest-labs/FLUX.2-klein-4B) |
| Formato de pesos | safetensors, exportación auto_round (compatible con vllm-omni); librería diffusers |
| Método de cuantización | AutoRound RTN (round-to-nearest, iters=0) |
| Calibración | coco2014, 4 pasos, guidance 1.0 |
| Tamaño del modelo | ~4 GB (frente a ~8 GB en bf16) |
| Tamaño del repositorio | 10,6 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo es una cuantización, no un entrenamiento nuevo. Parte del checkpoint destilado black-forest-labs/FLUX.2-klein-4B y aplica una cuantización de pesos y activaciones a 4 bits en formato MXFP4 (micro-scaling floating point), con un tamaño de grupo de 32. El proceso se llevó a cabo con AutoRound en configuración RTN, es decir, sin optimización iterativa de los parámetros de redondeo (iters=0), lo que simplifica y acelera el proceso de cuantización a costa de una menor compensación del error.

La calibración se realizó sobre el conjunto coco2014 con 4 pasos de inferencia y guidance 1.0. El resultado se exporta en formato auto_round, pensado para ser consumido por el stack vllm-omni, y se declara compatible con la pipeline de diffusers. No se especifican en la información disponible detalles sobre el dataset de entrenamiento original, el número de tokens, ni si el modelo base incorporó RLHF/DPO u otras técnicas de alineación; tampoco se describen innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante difusión en pocos pasos.
- Inferencia configurable en resolución; los ejemplos y la evaluación se realizan a 1024×1024.
- Generación con guidance_scale ajustable (la evaluación usa 1.0) y control del número de pasos de inferencia (4 pasos en la evaluación).
- Reproducibilidad mediante semilla fija (seed 42 en la evaluación declarada).
- Producción de múltiples imágenes por prompt mediante el parámetro num_outputs_per_prompt.
- Integración con el ecosistema diffusers (Flux2KleinPipeline) y con vllm-omni.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; son capacidades no aplicables o no disponibles para este tipo de modelo.

## Casos de uso

- Prototipado rápido de generación de imágenes: gracias a su tamaño reducido (~4 GB) y a la inferencia en 4 pasos, permite iterar prompts y semillas en una estación de trabajo con GPU de consumo, sin necesidad de clústeres.
- Generación de recursos gráficos para aplicaciones web o móviles: se puede desplegar un servicio text-to-image a 1024×1024 con vllm-omni para producir banners, ilustraciones o placeholders bajo demanda.
- Despliegue en entornos con VRAM limitada: al reducir el peso a 4 bits, el modelo encaja en tarjetas con menos memoria que las requeridas por el checkpoint bf16, lo que habilita inferencia local en equipos de gama media-alta.
- Investigación en cuantización de modelos de difusión: sirve como punto de comparación frente al baseline bf16 y frente a la variante MXFP8 mencionada, para estudiar el impacto de W4A4 en métricas como CLIP, CLIP-IQA, ImageReward o GenEval.
- Generación de imágenes por lotes en pipelines automatizados: el soporte de num_outputs_per_prompt y la integración con stacks de servido permiten producir lotes de imágenes para conjuntos de datos sintéticos o aumentación de datos.
- Servicio de imágenes con control de coste: para aplicaciones donde la fidelidad absoluta no es crítica (borradores, moodboards, pruebas de concepto), la variante MXFP4 ofrece una reducción de memoria significativa asumiendo una degradación acotada en las métricas declaradas.
- Evaluación comparativa de backends de inferencia: al exportarse en formato auto_round compatible con vllm-omni, es útil para medir latencia y throughput de ese stack frente a otras alternativas.

## Benchmarks y rendimiento

Evaluación declarada con el harness de difusión de vllm-omni (4 pasos, guidance 1.0, 1024×1024, seed 42):

| Benchmark | Baseline BF16 | MXFP4 cuantizado |
|---|---|---|
| DrawBench CLIP | 32,06 | 32,44 |
| DrawBench CLIP-IQA | 69,86 | 66,97 |
| DrawBench ImageReward | 1,05 | 1,00 |
| GenEval | 0,821 | 0,800 |

El autor señala que la cuantización MXFP4 muestra cierta degradación frente al baseline BF16 (GenEval 0,800 frente a 0,821; CLIP-IQA 66,97 frente a 69,86) y recomienda MXFP8 cuando se busca mayor fidelidad. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el peso cuantizado ocupa aproximadamente 4 GB, a lo que hay que sumar el text encoder, el VAE y las activaciones del pipeline, por lo que el consumo total será superior a esa cifra.
- Tamaño del repositorio: 10,6 GB, aunque el modelo cuantizado declarado ocupa ~4 GB; conviene verificar qué artefactos adicionales incluye antes de planificar el almacenamiento.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, el modelo debería ser candidato para GPU de consumo con suficiente VRAM, pero no se confirma ni se detallan modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: probable por el tamaño reducido, pero no confirmada por el autor.
- Opciones de despliegue: vllm-omni (formato de exportación auto_round) y diffusers (Flux2KleinPipeline) son los caminos documentados. No se mencionan llama.cpp, Ollama ni TGI (no aplicables o no disponibles para este pipeline).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-MXFP4-RTN-AutoRound (este modelo) | 4B | no aplica | MXFP4 W4A4, group_size=32, ~4 GB | other (hereda la del modelo base) | HuggingFace, librería diffusers |
| black-forest-labs/FLUX.2-klein-4B (base) | 4B | no aplica | bf16, ~8 GB | other | HuggingFace |
| Variante MXFP8 mencionada por el autor | 4B | no aplica | MXFP8 | no disponible | no disponible (solo se menciona como recomendación) |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de text-to-image destilados en la documentación proporcionada, por lo que no se incluyen datos adicionales que no puedan verificarse.

## Limitaciones y advertencias

- Degradación medible tras la cuantización: GenEval baja de 0,821 a 0,800 y CLIP-IQA de 69,86 a 66,97 respecto al baseline bf16; el propio autor recomienda MXFP8 si se prioriza la fidelidad.
- La cuantización se realizó con RTN (iters=0), sin optimización iterativa del redondeo, lo que puede implicar mayor error que métodos con ajuste.
- No se documentan sesgos conocidos del modelo base ni de la versión cuantizada; al ser un modelo text-to-image, hereda los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir contenido inexacto o incoherente respecto al prompt, especialmente en escenas complejas o texto dentro de la imagen.
- Idiomas soportados: no disponibles; no se confirma el comportamiento multilingüe de los prompts.
- Restricciones de licencia: la licencia declarada es "other" y se remite explícitamente a la del modelo original black-forest-labs/FLUX.2-klein-4B; es imprescindible revisar esa licencia antes de cualquier uso comercial.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes, y no se aportan detalles del dataset de entrenamiento original, lo que dificulta auditar el modelo.
- Dependencia de stacks concretos: el uso documentado requiere vllm-omni o diffusers; no se ofrece soporte declarado para otros runtimes.
- Tamaño del repositorio (10,6 GB) notablemente superior al peso cuantizado (~4 GB): conviene revisar el contenido antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/INCModel3/FLUX.2-klein-4B-MXFP4-RTN-AutoRound
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- AutoRound (herramienta de cuantización): https://github.com/intel/auto-round
- autoquant-agent: enlace incompleto en la model card (https://github.com/)
- No se han encontrado papers, blogs, repositorios o demos adicionales relevantes en la información disponible.
