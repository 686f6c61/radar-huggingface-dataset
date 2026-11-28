# minhy112/allot-checkpoints

## Resumen

ALLOT es un sistema de respuesta a preguntas multimodal construido sobre un backbone congelado Qwen3-VL-8B-Instruct. Lo desarrolla el usuario minhy112 y se publica como un repositorio de checkpoints (no como un modelo base completo). Su propuesta central es un lector que procesa varios presupuestos de evidencia anidados a partir de una única codificacion de un pool de candidatos ordenado; solo las preguntas cuyas lecturas discrepan pasan a un verificador. Esto reduce el coste de re-codificar candidatos en pipelines de RAG multimodal.

El repositorio contiene los pesos entrenados de ALLOT, los adaptadores LoRA de las baselines reimplementadas sobre el mismo backbone, y archivos de los benchmarks publicos empleados. Los adaptadores LoRA tienen rango 16 y se almacenan como state dicts de PEFT sobre el modelo de lenguaje del backbone. El backbone no se incluye: debe descargarse por separado desde Qwen/Qwen3-VL-8B-Instruct.

El modelo se entrena sobre MultiModalQA (MMQA) y SlideVQA, con 14.000 y 10.617 preguntas de entrenamiento respectivamente. El repositorio pesa 21,0 GB e incluye checkpoints por semilla, pliegues de validacion cruzada, ablaciones y baselines. Es relevante para investigadores que trabajen en RAG multimodal con verificacion selectiva y en la evaluacion reproductible de baselines sobre un backbone comun.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-8B-Instruct congelado) con adaptadores LoRA de rango 16 y modulos adicionales (scorer de relevancia, calibrador de allotment, verificador) |
| Parametros totales | 8B en el backbone (no incluido en el repo); parametros de los adaptadores LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en formato PyTorch `best.pt`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos); las baselines y datos conservan las licencias de sus fuentes |
| Formato de pesos | PyTorch (`best.pt`, cargable con `torch.load(..., weights_only=True)`); adaptadores LoRA como state dicts PEFT |

## Arquitectura y entrenamiento

ALLOT se apoya en un Qwen3-VL-8B-Instruct congelado y anade adaptadores LoRA de rango 16 sobre el modelo de lenguaje, junto con un scorer de relevancia, un calibrador de reparto de atencion (attention allotment) y un verificador. El lector procesa varios presupuestos de evidencia anidados a partir de una sola codificacion del pool de candidatos ordenado; el verificador solo se activa cuando las lecturas a distintos presupuestos discrepan. El verificador se entrena con candidatos out-of-fold de dos lectores de pliegue (cross-fitting), lo que evita fuga de informacion entre entrenamiento y verificacion.

El entrenamiento se realiza sobre MultiModalQA (14.000 preguntas de entrenamiento, barajadas con la semilla de cada ejecucion) y SlideVQA (10.617 preguntas, split completo). Se publican ejecuciones con semillas 11, 17 y 29 en MMQA y con semilla 11 en SlideVQA, ademas de pliegues de validacion (8.000/6.000 en MMQA y 5.309/5.308 en SlideVQA). Los resultados en MRAG-Bench se obtienen con los checkpoints de MMQA semilla 11 sin reentrenamiento. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Respuesta a preguntas multimodal sobre documentos con texto e imagenes (pipeline `question-answering`).
- RAG multimodal: lectura de pools de candidatos ordenados con multiples presupuestos de evidencia.
- Verificacion selectiva: activacion del verificador solo ante discrepancias entre lecturas.
- Recuperacion aumentada con scorer de relevancia entrenado especificamente.
- Capacidades heredadas del backbone Qwen3-VL-8B-Instruct (vision-lenguaje), aunque el repositorio solo publica adaptadores y modulos del sistema ALLOT.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de sistemas RAG multimodal: el repositorio incluye baselines reimplementadas (RankRAG, Sparse RAG, Solar, Self-RAG, Speculative RAG, Block-Attention, RAMQA) sobre el mismo backbone y pools de candidatos, lo que permite comparaciones controladas.
- Investigacion en verificacion selectiva: los checkpoints `verify_cf` y `svqa_verify_cf` permiten estudiar cuando merece la pena invocar un verificador frente a aceptar la lectura del lector.
- Respuesta a preguntas sobre documentos con tablas e imagenes: el entrenamiento en MMQA y SlideVQA lo hace adecuado para QA sobre presentaciones y documentos compuestos.
- Analisis de ablaciones: las variantes `abl_novotes`, `abl_candafter`, `abl_v1`, `abl_each` y `verify_own_n8k` permiten medir el impacto de cada decision de diseno.
- Reproducibilidad de resultados: los archivos de `datasets/` restauran `data/raw` y `data/processed` con los splits y pools usados, facilitando replicar experimentos.
- Estudio de cross-fitting: los pliegues de entrenamiento permiten analizar el efecto de entrenar el verificador con candidatos out-of-fold.
- Transferencia a MRAG-Bench: los checkpoints de MMQA semilla 11 se reutilizan sin reentrenamiento para evaluar en un benchmark distinto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la estructura de checkpoints, baselines y datos, pero no incluye tablas de metricas (MMLU, HumanEval, GSM8K ni metricas de QA multimodal).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El backbone Qwen3-VL-8B-Instruct no se incluye en el repositorio y debe descargarse por separado.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: no se especifican en la model card (vLLM, llama.cpp, Ollama o TGI no se mencionan). Los checkpoints se cargan con PyTorch (`torch.load`) y los adaptadores son state dicts PEFT, por lo que el despliegue requiere el codigo del proyecto ALLOT, no incluido en el repositorio.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALLOT (este repo) | 8B (backbone) + LoRA r16 | no disponible | RAG multimodal con presupuestos anidados y verificador selectivo | Apache 2.0 | Checkpoints en HF, backbone aparte |
| RankRAG (baseline en repo) | 8B (mismo backbone) | no disponible | Reranking + generacion | Apache 2.0 (pesos del repo) | Checkpoints en este repo |
| Self-RAG (baseline en repo) | 8B (mismo backbone) | no disponible | Autoreflexion con tokens de recuperacion | Apache 2.0 (pesos del repo) | Checkpoints en este repo |
| Speculative RAG (baseline en repo) | 8B (mismo backbone) | no disponible | Borrador + verificacion especulativa | Apache 2.0 (pesos del repo) | Checkpoints en este repo |

Las baselines se reimplementaron y reejecutaron sobre el mismo backbone, pools de candidatos y preguntas de entrenamiento, lo que permite comparaciones controladas. No se dispone de metricas comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio contiene checkpoints y adaptadores, no un modelo autonomo: requiere el backbone Qwen3-VL-8B-Instruct y el codigo del proyecto ALLOT para funcionar.
- Los checkpoints de SlideVQA se entrenaron con datos cuya licencia restringe su uso a evaluacion interna; debe verificarse antes de cualquier uso.
- SlideVQA y las leyendas de sus diapositivas no se incluyen en el repositorio.
- Los archivos de datos conservan las licencias de origen: MMQA (AllenAI), MRAG-Bench (CC BY 4.0), ScienceQA (CC BY-NC-SA 4.0, no usado por ALLOT) y `kg_store_public.zip` derivado de MMQA y MRAG-Bench.
- ScienceQA tiene licencia CC BY-NC-SA 4.0, que prohibe el uso comercial; aunque ALLOT no lo emplea, esta presente en los archivos.
- No se documentan sesgos conocidos, tasas de alucinacion ni limitaciones de contexto o idioma en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validacion externa.
- No se proporcionan resultados de benchmarks que permitan estimar el rendimiento real del sistema.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/minhy112/allot-checkpoints
- Backbone Qwen3-VL-8B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- MultiModalQA (codigo y datos): https://github.com/allenai/multimodalqa
- MRAG-Bench: https://huggingface.co/datasets/uclanlp/MRAG-Bench
- ScienceQA: https://github.com/lupantech/ScienceQA
- SlideVQA: https://huggingface.co/datasets/NTT-hil-insight/SlideVQA
