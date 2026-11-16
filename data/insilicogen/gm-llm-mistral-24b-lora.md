# insilicogen/GM-LLM-Mistral-24B-LoRA

## Resumen

GM-LLM (Mistral-24B) es un conjunto de adaptadores LoRA publicados por insilicogen que especializan el modelo base Mistral-Small-3.1-24B-Instruct-2503 para la interpretación de variantes genéticas asociadas a cáncer, fundamentada en literatura científica. El modelo resuelve el problema de traducir anotaciones de variantes (por ejemplo, ClinVar) y documentos biomédicos recuperados en respuestas razonadas con citas verificables, un paso crítico en genómica clínica. Es relevante porque demuestra una especialización de dominio por etapas (fine-tuning seguido de retrieval-augmented fine-tuning, RAFT) sobre un modelo abierto de 24B, con licencia Apache 2.0.

La arquitectura subyacente es un transformer decoder-only de Mistral AI (Mistral-Small-3.1-24B-Instruct-2503), sobre el que se aplican dos adaptadores LoRA de rango 16 que deben cargarse en orden: primero `ft_adapter` (mergeado) y después `raft_adapter`. El repositorio de adaptadores ocupa 0,8 GB y no redistribuye los pesos completos del modelo base.

La especialización se apoya en dos datasets propios: 42.918 pares de pregunta-respuesta sobre literatura oncológica para la fase FT y 1.438 ítems con contexto recuperado para la fase RAFT. Las respuestas se emiten en coreano con un formato estructurado de cuerpo y citas (`<body>…</body> <citation>…</citation>`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-Small-3.1-24B-Instruct-2503) con adaptadores LoRA (PEFT) |
| Parametros totales | 24B (modelo base); tamano de los adaptadores no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento RAFT; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 (sujeta ademas a la licencia y politica de uso del modelo base) |
| Formato de pesos | safetensors (adaptadores LoRA PEFT en subcarpetas `ft_adapter/` y `raft_adapter/`) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-Small-3.1-24B-Instruct-2503 (revision `68faf511d618ef198fef186659617cfd2eb8e33a`) y aplica dos fases de especializacion. La primera, fine-tuning supervisado (FT), usa LoRA con rango 16, alpha 32, dropout 0,2, aplicado a capas de atencion y MLP, learning rate 5e-5, una epoca y longitud maxima de 1.024 tokens, sobre el dataset `insilicogen/llm-mutation-ft-qa` (42.918 pares QA de literatura oncológica). La segunda fase, retrieval-augmented fine-tuning (RAFT), parte del modelo con el adaptador FT ya mergeado y entrena un nuevo LoRA con la misma configuracion (r16/alpha32/dropout 0,2, lr 5e-5) durante 6 epocas con longitud maxima de 4.096 tokens, sobre el split `raft_train` de `insilicogen/llm-mutation-variant-qa` (1.438 items). El orden de carga es obligatorio: FT mergeado y RAFT encima como adaptador activo.

La innovacion principal es el esquema RAFT: el modelo aprende a producir respuestas que citan explicitamente los documentos recuperados (`doc_N`) y a integrar la anotacion ClinVar presente en la entrada. No se documentan en la informacion disponible tecnicas como decodificacion especulativa, atencion lineal o RLHF/DPO; el entrenamiento descrito es exclusivamente supervisado con LoRA.

## Capacidades

- Interpretacion de variantes geneticas asociadas a cancer a partir de anotaciones ClinVar y documentos de literatura.
- Generacion de respuestas con citas estructuradas a documentos recuperados (`<body>…</body> <citation>(Reference: doc_N, …)</citation>`).
- Razonamiento sobre evidencia biomedica multi-documento en el contexto (hasta 4.096 tokens en entrenamiento).
- Integracion en pipelines RAG/RAFT: consume un bloque de instruccion de sistema, la pregunta, la anotacion ClinVar y cinco documentos.
- Generacion determinista recomendada (`do_sample=False`) para respuestas reproducibles.
- Idiomas: coreano (idioma principal de salida) e ingles (entrada/base).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Interpretacion asistida de variantes en paneles oncologicos: dado un variant call con su anotacion ClinVar y cinco articulos recuperados, el modelo genera una respuesta razonada con citas, util como borrador para revision por geneticos clinicos.
- Curacion de literatura en genomica del cancer: el adaptador FT (42.918 QA) permite extraer relaciones variante-enfermedad-farmaco de abstracts y textos completos.
- Soporte a comites moleculares de tumores (MTB): genera resumenes citados que el comite puede contrastar rapidamente, reduciendo el tiempo de preparacion documental.
- Construccion de bases de conocimiento internas: el formato de salida estructurado con `doc_N` facilita el parseo automatico y la trazabilidad de cada afirmacion a su fuente.
- Evaluacion de pipelines RAG biomedicos: el modelo y sus datasets sirven como banco de pruebas para medir calidad de recuperacion (BM25 u otros) frente a documentos gold.
- Investigacion en especializacion de dominio: reproducible como referencia metodologica FT→RAFT sobre un modelo abierto de 24B con LoRA, para adaptar a otras areas clinicas.
- Formacion y docencia en genetica medica: generacion de explicaciones citadas para casos docentes, siempre con supervision experta.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de 548 items con anotacion ClinVar en la entrada (correccion juzgada por LLM: correcto 1 / parcial 0,5 / incorrecto 0):

| Metrica | Modelo base | GM-LLM |
|---|---|---|
| Correccion, juez Gemma4 | 0,498 | 0,956 |
| Correccion, juez Claude Sonnet 5.5 | 0,491 | 0,657 |
| Correccion con retrieval real (BM25, 127 items), juez Gemma4 | — | 0,835 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible. Las cifras anteriores son puntuaciones de juez LLM especificas del dominio y del conjunto de evaluacion descrito en el articulo (en revision).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia, un modelo de 24B en bfloat16 requiere aproximadamente 48 GB solo para pesos, mas cache KV y overhead; en cuantizacion de 8 bits en torno a 24-26 GB y en 4 bits en torno a 13-15 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 80 GB o H100 para bfloat16 sin cuantizar; A100 40 GB o L40S para cuantizacion 8 bits.
- GPU de consumo: posible en RTX 4090 (24 GB) unicamente con cuantizacion de 4 bits y contexto reducido; no cabe en GPUs de 16 GB o menos.
- Despliegue: transformers + PEFT es la via documentada (carga de adaptadores en orden FT mergeado y RAFT). vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible; la integracion con llama.cpp requeriria fusionar y convertir los adaptadores a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: el repositorio de adaptadores ocupa 0,8 GB; los pesos del modelo base deben descargarse aparte.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GM-LLM-Mistral-24B-LoRA | 24B (base) + LoRA | 4.096 en entrenamiento RAFT | Interpretacion de variantes de cancer con citas | Apache 2.0 | Hugging Face (adaptadores) |
| Mistral-Small-3.1-24B-Instruct-2503 | 24B | no disponible en la informacion | Generalista, instrucciones | Apache 2.0 | Hugging Face |
| BioMistral (variantes) | 7B-8B tipicamente | no disponible | Biomedicina general | depende de la variante | Hugging Face |
| Meditron / modelos clinicos abiertos | 7B-70B | no disponible | Clinico general | depende de la variante | Hugging Face |

Los datos de los modelos alternativos no proceden de la informacion proporcionada y se indican solo como referencia de categoria; no se dispone de comparaciones directas de rendimiento en el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- No es un dispositivo medico ni sirve para decision clinica autonoma; las salidas deben ser revisadas por expertos cualificados.
- Uso previsto de investigacion; el uso comercial esta sujeto ademas a la licencia y politica del modelo base Mistral-Small-3.1-24B-Instruct-2503.
- Evaluado principalmente con documentos gold en el contexto; la precision cae con retrieval real (0,835 frente a 0,956 con juez Gemma4).
- Dependencia critica de la anotacion ClinVar de entrada: anotaciones erroneas se propagan a la respuesta.
- Riesgo de alucinacion en citas y afirmaciones biomedicas no cubiertas por los documentos proporcionados; la puntuacion con juez Claude Sonnet 5.5 (0,657) es notablemente inferior a la del juez Gemma4 (0,956), lo que sugiere sensibilidad al evaluador.
- Idiomas limitados a coreano e ingles; las respuestas se generan en coreano, lo que limita su uso directo en entornos hispanohablantes sin traduccion.
- Ventana de contexto efectiva de 4.096 tokens en entrenamiento, insuficiente para revisiones bibliograficas extensas en una sola pasada.
- Adaptadores de rango bajo (r16): la especializacion puede no cubrir variantes fuera de la distribucion del dataset de entrenamiento (1.438 items en RAFT).
- No se documentan sesgos especificos; al tratarse de datos oncológicos, pueden existir sesgos de representacion poblacional heredados de la literatura y de ClinVar.

## Enlaces

- Hugging Face (adaptadores): https://huggingface.co/insilicogen/GM-LLM-Mistral-24B-LoRA
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Dataset FT: https://huggingface.co/datasets/insilicogen/llm-mutation-ft-qa
- Dataset RAFT: https://huggingface.co/datasets/insilicogen/llm-mutation-variant-qa
- Articulo: Lee Y. et al., "Staged Domain Specialization of Open-Source Large Language Models for Cancer-Related Genetic Variant Interpretation", *Diagnostics* (MDPI), en revision, 2026 (DOI no disponible en la informacion proporcionada)
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
