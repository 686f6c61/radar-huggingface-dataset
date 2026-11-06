# defnoteatin/PseudoBrain-DeepSeek-V4.1-Flash-1017-Chronos-v7.5-Abliterated

## Resumen

PseudoBrain-DeepSeek-V4.1-Flash-1017-Chronos-v7.5-Abliterated es una conversión cuantizada y "abliterada" del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario defnoteatin en Hugging Face. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 212.187.359.344 parámetros totales (aproximadamente 212B) según los pesos en safetensors, construido sobre la arquitectura deepseek_v41 e inspirado en la familia DeepSeek V4.1 Flash. El autor lo presenta como una versión "Chronos v7.5" con abliteración ortogonal post-cuantización "dual-verified", orientada a eliminar proyecciones de rechazo manteniendo la capacidad del modelo base.

El modelo parte de tres referencias: deepseek-ai/DeepSeek-V4.1-Flash-1017, dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 y OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated. La model card describe una arquitectura de 40 capas con 15.360 expertos enrutados más expertos compartidos, Sparse Multi-Head Latent Attention, "4-lane Sinkhorn Hyper-Connections" y componentes multimodales de visión/aligner. El objetivo declarado es ofrecer una variante sin censura (uncensored) que reduzca drásticamente las respuestas de rechazo, con un footprint de disco muy inferior al del modelo en BF16 (1,51 TB) o MXFP4 (510,31 GB), gracias a esquemas de cuantización de 2 bits (Lloyd-Max) y 1 bit (Compact-Disk).

Es relevante ahora porque combina tres tendencias del ecosistema open source: modelos MoE de gran escala con cuantizaciones agresivas para reducir requisitos de VRAM, técnicas de abliteración para eliminar alineamiento de seguridad, y despliegue optimizado con vLLM y kernels Triton fusionados. La licencia MIT facilita su uso, aunque las implicaciones de una variante sin censura requieren cautela en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) deepseek_v41, 40 capas, Sparse Multi-Head Latent Attention, 4-lane Sinkhorn Hyper-Connections, componentes multimodales visión/aligner |
| Parámetros totales | 212.187.359.344 (~212B) |
| Parámetros activos | No disponible (la model card menciona 15.360 expertos enrutados y expertos compartidos, pero no especifica el número de parámetros activos por token) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MXFP4, 2-bit Lloyd-Max, 1-bit Compact-Disk, FP8, 8-bit, NVFP4 (según tags y model card) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 290,7 GB); también referencias a NVFP4 y FP8 |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura deepseek_v41 del modelo DeepSeek-V4.1-Flash-1017, un transformer MoE de 40 capas con 15.360 expertos enrutados, expertos compartidos y Sparse Multi-Head Latent Attention. Incorpora además "4-lane Sinkhorn Hyper-Connections" y módulos multimodales de visión y aligner, según la model card. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La innovación principal de esta ficha es la conversión "Chronos v7.5" con abliteración ortogonal post-cuantización. El autor reporta una reducción de la norma de proyección de rechazo en `w2` de 1,593769 a 0,000009 (99,9994% eliminada) en la variante Hot MXFP4, y una fuga de rechazo media end-to-end en 40 capas inferior a 0,005. También describe kernels Triton fusionados con coseno de 0,999982 frente a la referencia PyTorch, y un esquema de cuantización mixta con 96 expertos "hot" en MXFP4 y 288 "cold" en 2 bits. No se detalla el proceso de entrenamiento del modelo base ni el volumen de datos utilizado.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento en STEM y matemáticas simbólicas (evaluado en HLE sin herramientas).
- Generación de código y pipelines de shell (Terminal-Bench 4.0, DeepSWE v1.1, ProgramBench).
- Síntesis de repositorios completos y generación autónoma de parches (NL2Repo-Bench, Mini-SWE-V2).
- Capacidades multimodales de visión y aligner, según la arquitectura descrita en la model card.
- Variante "abliterada" y "uncensored" que elimina proyecciones de rechazo, orientada a reducir respuestas de negativa.
- Soporte de despliegue con vLLM y kernels Triton fusionados (tag vllm).
- No se confirma soporte explícito de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre abliteración y alineamiento: el modelo permite estudiar cómo la eliminación de proyecciones de rechazo afecta a la capacidad y al comportamiento, con métricas de coseno y fuga de rechazo reportadas por el autor.
- Evaluación de cuantizaciones extremas: sirve para comparar el impacto de esquemas de 1 bit, 2 bits y MXFP4 en la calidad de un MoE de ~212B, con datos de coseno por experto y por capa.
- Despliegue en una sola GPU de 80 GB: la model card reporta 52,97 GB de VRAM activa en todas las 40 capas, lo que permite ejecutar el modelo en una A100-80GB con decodificación sostenida de ~36,88 tok/s.
- Generación de código en pipelines internos: los benchmarks de Terminal-Bench, DeepSWE y ProgramBench sugieren uso en tareas de parcheo autónomo y síntesis de repositorios, aunque sin garantías de producción.
- Experimentación con kernels fusionados: el autor publica comparativas de Triton frente a PyTorch (coseno 0,999982), útil para validar implementaciones de inferencia.
- Investigación sobre seguridad y contenido: al ser una variante sin censura, puede emplearse en estudios controlados sobre filtrado de contenido y riesgos de modelos abliterados.
- Pruebas de multimodalidad: los componentes de visión/aligner permiten explorar tareas imagen-texto, aunque no se detallan resultados específicos.

## Benchmarks y rendimiento

La model card incluye una tabla con la suite oficial de 11 benchmarks de DeepSeek-V4.1-Flash-1017 (440 tareas) y una auditoría de abliteración. Los datos parciales disponibles son:

| Benchmark | Categoría | DS-V4.1-Flash (Base) | Chronos v7.5 + Upgrade 2 | Identidad de tokens |
|---|---|---|---|---|
| HLE w/o tools | STEM y matemáticas simbólicas | 39,1% | 44,0%† (42,6%) | 100,00% |
| Terminal-Bench 4.0 | CLI y pipelines Linux | 31,2% | 42,3% | 100,00% |
| DeepSWE v1.1 | Generación autónoma de parches | 74,2% | 77,0% | 100,00% |
| ProgramBench | Programación competitiva | 20,3% | 29,1% | 100,00% |
| NL2Repo-Bench | Síntesis de repositorios | 65,4% | 68,2% | 100,00% |

El autor reporta además una latencia de decodificación de 0,5805 ms por capa en A100 (43,07 tok/s por 40 capas) y 36,88 tok/s sostenidos end-to-end en A100-SXM4-80GB. La suite completa de 12 benchmarks se declara con 100,00% de aprobados y 100,00% de identidad de tokens y contención top-5. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 52,97 GB de VRAM activa en GPU para las 40 capas en la variante Chronos v7.5 (2-bit Lloyd-Max y 1-bit Compact-Disk); la variante con Upgrade 2 usa 0 GB extra de VRAM en GPU mediante CPU/mmap.
- GPU recomendadas: A100-SXM4-80GB (validada por el autor); una sola GPU de 80 GB es suficiente para las variantes de 1 y 2 bits.
- Consumer GPU: no se confirma que quepa en GPUs consumer (RTX 4090 de 24 GB no sería suficiente según los 52,97 GB reportados); no hay datos para RTX 5090 u otras.
- Opciones de despliegue: vLLM (tag oficial), kernels Triton fusionados, CUDA Graphs; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,5805-0,6009 ms por capa en A100; 36,88 tok/s sostenidos end-to-end; 35,46 tok/s de media en 12 suites.
- Footprint de disco: 286,05 GB con Upgrade 2, 218,81 GB en 2 bits, 142,37 GB en 1 bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PseudoBrain-DeepSeek-V4.1-Flash-1017-Chronos-v7.5-Abliterated | ~212B (MoE) | No disponible | MIT | Hugging Face | Variante abliterada y cuantizada |
| DeepSeek-V4.1-Flash-1017 (base) | No disponible en la información | No disponible | No disponible | Hugging Face, ModelScope | Modelo original de DeepSeek |
| OBLITERATUS/DeepSeek-V4.1-Flash-1017-obliterated | No disponible | No disponible | No disponible | Hugging Face | Base abliterada previa |
| dealignai/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 | No disponible | No disponible | No disponible | Hugging Face | Variante sin censura en FP8 |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia de las alternativas con rigor.

## Limitaciones y advertencias

- La abliteración elimina deliberadamente las proyecciones de rechazo, lo que puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado; no es apta para producción sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues multilingües o de contexto largo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones con requisitos de seguridad.
- El modelo se distribuye en cuantizaciones agresivas (1 y 2 bits) con pérdida de coseno reportada (hasta 0,85889 en `gate_up` para 1 bit), lo que puede degradar la calidad frente al modelo base.
- El repo es de 290,7 GB y requiere hardware específico (A100-80GB) para el rendimiento reportado; no se confirma funcionamiento en GPUs consumer.
- La model card contiene afirmaciones no verificadas de forma independiente (por ejemplo, 100% de identidad de tokens en 12 benchmarks) que deben tratarse con cautela.
- No se detallan sesgos conocidos ni evaluaciones de seguridad independientes.

## Enlaces

- Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-DeepSeek-V4.1-Flash-1017-Chronos-v7.5-Abliterated
- Archivos del modelo: https://huggingface.co/defnoteatin/PseudoBrain-DeepSeek-V4.1-Flash-1017-Chronos-v7.5-Abliterated/tree/main
- Modelo base DeepSeek-V4.1-Flash-1017 en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Modelo base DeepSeek-V4.1-Flash-1017 en ModelScope (CN): https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de benchmarks del autor: https://github.com/defnotean/chronos-1t/blob/main/benchmarks/dsv41_official_benchmarks_eval.py
- Ranking de modelos DeepSeek: https://benchlm.ai/best/deepseek-models
