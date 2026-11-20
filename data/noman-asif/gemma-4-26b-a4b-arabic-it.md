# noman-asif/Gemma-4-26B-A4B-Arabic-It

## Resumen

Gemma-4-26B-A4B-Arabic-It es un ajuste fino y alineamiento del modelo multimodal google/gemma-4-26B-A4B-it realizado por Noman Asif, orientado a razonamiento, conversacion y dialecto arabe (con enfasis en el dialecto saudita). Forma parte de la familia "Gemma-4-Arabic Iso-Active Model Family", que incluye tambien una variante densa de borde (Gemma-4-E4B-Arabic-It). El modelo parte de una arquitectura de mezcla de expertos dispersa (MoE) con 128 expertos, seleccion top-8 mas un experto compartido, y un total de 25.805.933.872 parametros reales segun los pesos en safetensors.

El problema que aborda es la baja competencia de los modelos base en arabe y, en particular, en dialecto saudita y en tareas de razonamiento y examen en arabe, sin sacrificar el rendimiento en ingles, matematicas y codigo. Para ello se aplica un entrenamiento en dos etapas: SFT continuo con rsLoRA sobre 120.000 filas (75% arabe / 25% replay) y un alineamiento DPO con region de confianza sobre 20.000 pares, seguido de una fusion TIES-Merging.

Es relevante ahora porque combina un modelo base reciente de Google (Gemma 4) con un pipeline de alineamiento reproducible (codigo y datasets publicados), licencia Apache 2.0 y pesos en bfloat16 standalone, lo que facilita su evaluacion y despliegue por parte de desarrolladores e investigadores que trabajan en aplicaciones en arabe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos dispersa (Sparse MoE, 128 expertos, top-8 + 1 experto compartido) |
| Parametros totales | 25.805.933.872 (segun safetensors); la model card indica 25.2B |
| Parametros activos | 3.8B por token (segun la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Arabe (ar) e ingles (en); enfasis en dialecto saudita |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint standalone 16-bit bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos dispersa: 128 expertos con enrutamiento top-8 mas un experto compartido, sobre el modelo base google/gemma-4-26B-A4B-it. El pipeline de ajuste consta de dos etapas. La primera es un SFT continuo con rsLoRA (r=32, alpha=64) sobre el dataset Arabic-Reasoning-Instruct-120k, con 120.000 filas y una composicion del 75% arabe y 25% de replay, y con la compuerta del enrutador (router gate) congelada durante el ajuste. La segunda etapa es un alineamiento con Trust-Region DPO (beta=0.1, tr_alpha=0.6) sobre 20.000 pares del dataset Arabic-Preference-DPO-20k.

Tras el entrenamiento se aplica una fusion TIES-Merging con lambda=0.85 y densidad=0.70. El resultado se publica como checkpoint standalone en bfloat16. La model card menciona ademas el uso de chain-of-thought y un esquema de "Zero-Forgetting Retention Shield" para preservar capacidades en ingles, matematicas y codigo. No se detallan en la informacion disponible el numero total de tokens de entrenamiento del modelo base ni la composicion completa de su dataset original.

## Capacidades

- Generacion de texto y conversacion multi-turno en arabe e ingles.
- Razonamiento en arabe, incluyendo preguntas de examen y conocimiento regional (ArabicMMLU, EXAMS-AR, MadinahQA).
- Comprension y generacion en dialecto saudita.
- Razonamiento matematico (evaluado en GSM8K).
- Generacion de codigo (evaluada en HumanEval).
- Razonamiento cientifico y de sentido comun en ingles (MMLU-Pro, ARC-Challenge).
- Capacidad multimodal image-text-to-text heredada del modelo base (segun los tags del repositorio).
- Soporte de plantilla de chat mediante apply_chat_template en transformers.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la model card menciona chain-of-thought como tag.
- Modo thinking explicito, audio: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en arabe y dialecto saudita: el modelo puede gestionar conversaciones multi-turno y responder con registro dialectal gracias al ajuste sobre datos arabes y de preferencia; es adecuado para sectores como banca, telecomunicaciones o comercio electronico en Arabia Saudi.
- Asistencia juridica y administrativa regional: la model card incluye un ejemplo de consulta sobre derechos laborales en el sistema laboral saudita, lo que refleja su uso para resumir y explicar normativa local en arabe.
- Preparacion de examenes y tutoria educativa: su rendimiento en ArabicMMLU (68,00%) y EXAMS-AR (64,00%) lo hace util para generar preguntas, explicaciones y material de estudio en arabe.
- Generacion de codigo en entornos bilingues: con HumanEval en 78,05%, puede integrarse en asistentes de programacion que atiendan instrucciones en arabe e ingles, por ejemplo en pipelines de revision o generacion de tests.
- Razonamiento matematico asistido: con GSM8K en 90,50%, es apto para herramientas de resolucion de problemas paso a paso y explicacion de procedimientos en arabe.
- Moderacion y clasificacion de contenido en arabe: su mejora en AraTrust (88,38%) sugiere uso en tareas de confianza, seguridad y evaluacion de respuestas en arabe.
- Procesamiento de documentos con imagen y texto: al heredar la capacidad image-text-to-text del modelo base, puede emplearse en extraccion y descripcion de contenido en documentos escaneados, aunque no se detallan prestaciones especificas.

## Benchmarks y rendimiento

Resultados publicados en la model card (modelo base frente al ajustado):

| Benchmark | Metrica | Shots | 26B-A4B Base (%) | 26B-A4B Arabic-It (%) |
|---|---|---|---|---|
| ArabicMMLU | acc_norm | 0 | 37,00 | 68,00 |
| MadinahQA | acc_norm | 0 | 27,50 | 76,50 |
| AlGhafa | acc_norm | 0 | 74,78 | 78,48 |
| ACVA | acc_norm | 5 | 80,40 | 79,60 |
| EXAMS-AR | acc_norm | 0 | 50,00 | 64,00 |
| AraTrust | acc_norm | 0 | 71,25 | 88,38 |
| MMLU-Pro | english_reasoning | 5 | 67,62 | 64,76 |
| GSM8K | math_reasoning | 5 | 81,50 | 90,50 |
| HumanEval | code_generation | 0 | 67,68 | 78,05 |
| ARC-Challenge | english_science_anchor | 25 | 97,00 | 93,50 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 51,6 GB solo para pesos (el repositorio ocupa 51,6 GB), mas overhead de activaciones y cache KV; en la practica se necesitan 2 GPUs de 40 GB o una de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con device_map="auto".
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bfloat16; requeriria cuantizacion, de la que no se publican variantes en la informacion disponible.
- Opciones de despliegue: transformers con device_map="auto" es el metodo documentado; vLLM, TGI, llama.cpp u Ollama no se mencionan en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-26B-A4B-Arabic-It | 25,8B | 3,8B | no disponible | Apache 2.0 | Ajuste arabe del base Gemma 4 MoE |
| Gemma-4-E4B-Arabic-It | 4,5B | 4,0B (denso) | no disponible | Apache 2.0 | Variante densa de borde de la misma familia; ArabicMMLU 57,00%, GSM8K 71,50% |
| google/gemma-4-26B-A4B-it | 25,8B | 3,8B | no disponible | no disponible en la informacion | Modelo base sin ajuste arabe; ArabicMMLU 37,00%, GSM8K 81,50% |

No se dispone de datos de otros modelos arabes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos generativos; no se documentan medidas especificas de mitigacion mas alla del alineamiento DPO.
- Sesgos conocidos: no disponible en la informacion proporcionada; el enfasis en dialecto saudita puede reducir el rendimiento en otros dialectos arabes.
- Caida en algunos benchmarks respecto al base: ACVA (80,40 a 79,60), MMLU-Pro (67,62 a 64,76) y ARC-Challenge (97,00 a 93,50), lo que indica cierta perdida en ingles y ciencia pese al esquema de retencion.
- Longitud de contexto no documentada; conviene verificarla antes de usos con documentos largos.
- Idiomas limitados a arabe e ingles; no se garantiza comportamiento en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base de Google y de los datasets empleados.
- El repositorio tiene 0 likes y 1.918 descargas, con fecha de creacion en noviembre de 2026; se recomienda validacion independiente antes de produccion.
- No se publican variantes cuantizadas, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noman-asif/Gemma-4-26B-A4B-Arabic-It
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Variante densa de la familia: https://huggingface.co/noman-asif/Gemma-4-E4B-Arabic-It
- Dataset SFT: https://huggingface.co/datasets/noman-asif/Arabic-Reasoning-Instruct-120k
- Dataset DPO: https://huggingface.co/datasets/noman-asif/Arabic-Preference-DPO-20k
- Repositorio GitHub (codigo y pipeline): https://github.com/nnoman-asif/Gemma-4-Arabic
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
