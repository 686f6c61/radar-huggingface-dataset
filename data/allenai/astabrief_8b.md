# allenai/AstaBrief_8B

## Resumen

AstaBrief-8B es un modelo de lenguaje de 8.000 millones de parametros desarrollado por el Allen Institute for AI (Ai2), disenado especificamente para generar informes cientificos citados a partir de una pregunta de investigacion y extractos de literatura cientifica recuperados. El modelo parte de Qwen3-8B y se ha ajustado en dos fases: un ajuste supervisado (SFT) que produce el checkpoint intermedio AstaBrief-8B-SFT y una posterior optimizacion directa de preferencias (DPO) offline que da lugar a este checkpoint final.

La relevancia del modelo reside en su enfoque de "deep research": en lugar de requerir un pipeline de multiples pasos con agentes y herramientas, AstaBrief-8B genera informes citados en un unico paso a partir de contexto recuperado, compitiendo con pipelines multi-paso como Asta ScholarQA o DR-Tulu-8B. Segun la model card, alcanza una tasa de victoria del 72% frente a Asta ScholarQA en el conjunto de test SQA-CS2, siendo un modelo mucho mas sencillo de desplegar.

Se distribuye bajo licencia Apache 2.0, esta orientado a ingles y esta pensado para uso de investigacion y educativo segun las guias de uso responsable de Ai2. El repositorio ocupa 16,4 GB y acumula 173 descargas y 15 "likes" en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, heredada de Qwen3-8B |
| Parametros totales | 8.000 millones (aproximado, base Qwen3-8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen3-8B; la longitud maxima de secuencia usada en el entrenamiento DPO fue de 16.000 tokens |
| Tipos de cuantizacion | No disponible en la model card (pesos publicados en BF16, ~16,4 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio PyTorch de 16,4 GB en BF16; compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

AstaBrief-8B es un transformer decoder-only denso que hereda la arquitectura de Qwen3-8B. El modelo se inicializa desde AstaBrief-8B-SFT, un checkpoint previamente ajustado con supervision sobre tareas de generacion de informes, y posteriormente se somete a un proceso de DPO offline sobre el dataset allenai/AstaBrief_DPO_Mix.

El dataset de DPO contiene consultas reales de usuarios con dos informes generados por consulta y juicios de preferencia sobre cada par. Los informes proceden tanto del pipeline multi-paso de Asta ScholarQA como de pipelines de generacion en un solo paso, usando diversos modelos de respaldo: Claude 3.5 Sonnet, Claude 3.7 Sonnet, o3, o4-mini, GPT-4.1, DeepSeek-V3 y DeepSeek-R1. Dos modelos juez (GPT-4.1 y DeepSeek-R1) compararon cada par y seleccionaron un ganador; se verifico que los jueces coincidian con las preferencias humanas en un 95% y solo se conservaron los pares en los que ambos jueces coincidieron.

El entrenamiento DPO se ejecuto en 8 GPU H100 con la libreria open-instruct, con 7 epocas, learning rate de 5e-06, scheduler lineal, warmup ratio de 0,1, tipo de perdida DPO Norm, beta de 10, batch por dispositivo de 1, 8 pasos de acumulacion de gradiente, longitud maxima de secuencia de 16.000 tokens y precision BF16. No se documenta en la model card ninguna innovacion arquitectonica adicional mas alla del propio ajuste de preferencias; la innovacion principal es metodologica, orientada a producir informes citados de forma fiable.

## Capacidades

- Generacion de informes cientificos citados: transforma una pregunta de investigacion y extractos de literatura en un informe estructurado con referencias a las secciones recuperadas.
- Razonamiento sobre literatura cientifica: sintetiza y contrasta evidencias procedentes de multiples fragmentos.
- Atribucion de citas: el modelo esta entrenado para asociar afirmaciones con las fuentes proporcionadas (Citation Precision de 90,5 en el conjunto de test SQA-CS2).
- Generacion de texto conversacional: la etiqueta de pipeline incluye text-generation y conversational.
- Seguimiento de instrucciones con formato de prompt especifico: optimizado para el prompt recomendado del proyecto, que incluye la consulta y las referencias de seccion.
- Uso de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no es una capacidad nativa; el modelo emula el resultado de un pipeline multi-paso en una sola generacion.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion automatizada de revisiones bibliograficas: dado un conjunto de abstracts recuperados por un motor de busqueda academico, el modelo produce un informe citado sobre el estado del arte de un tema concreto.
- Asistentes de investigacion para bibliotecas digitales o repositorios: integrado tras un sistema de recuperacion (RAG), resume y cita la literatura relevante para responder a consultas de usuarios.
- Apoyo a investigadores y estudiantes de posgrado: genera borradores de secciones de "trabajos relacionados" a partir de un corpus de articulos, reduciendo el tiempo de sintesis inicial.
- Sistemas de respuesta con atribucion de fuentes: como la metrica de Citation Recall es alta (78,2), es adecuado cuando la trazabilidad de cada afirmacion a una fuente es un requisito critico.
- Analisis de literatura tecnica en empresas: sintesis de documentacion cientifica o patentes recuperadas para informes internos de I+D.
- Evaluacion comparativa de pipelines de deep research: sirve como linea base de un solo paso frente a arquitecturas multi-agente, ya que compite con Asta ScholarQA y DR-Tulu-8B.
- Prototipado rapido de herramientas de "deep research": al no requerir orquestacion de agentes ni multiples llamadas, simplifica el despliegue en entornos con recursos limitados.
- Enriquecimiento de bases de conocimiento cientifico: generacion de resumenes citados para poblar fichas o entradas de un repositorio documental.

## Benchmarks y rendimiento

Resultados en el conjunto de test ScholarQA-CS2 (100 preguntas de investigacion en informatica escritas por usuarios):

| Modelo | Media | Ingredient Recall | Answer Precision | Citation Precision | Citation Recall |
|---|---:|---:|---:|---:|---:|
| Qwen3-8B | 77,3 | 77,8 | 90,6 | 76,2 | 64,6 |
| AstaBrief-8B-SFT | 83,7 | 85,2 | 90,4 | 87,7 | 71,3 |
| AstaBrief-8B | 87,0 | 90,2 | 89,0 | 90,5 | 78,2 |

Comparativa frente a pipelines de investigacion de referencia:

| Modelo | SQA-CS2 (Dev) | SQA-CS2 (Test) | DeepScholarBench | Win Rate vs Asta SQA (SQA-CS2 Dev) | Win Rate vs Asta SQA (SQA-CS2 Test) |
|---|---:|---:|---:|---:|---:|
| Asta ScholarQA | 87,6 | 86,2 | 60,25 | N/A | N/A |
| DR-Tulu-8B | 86,5 | 88,8 | 56,26 | 36% | 54% |
| AstaBrief-8B | 86,3 | 87,0 | 53,50 | 55% | 72% |

Segun la model card, el entrenamiento DPO mejora el rendimiento tanto respecto al checkpoint SFT como respecto al modelo base Qwen3-8B, y AstaBrief-8B es competitivo con Asta ScholarQA y DR-Tulu en varios benchmarks. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16-18 GB para los pesos, mas la cache KV correspondiente a contextos de hasta 16.000-32.000 tokens, que puede anadir varios GB adicionales.
- VRAM estimada con cuantizacion de 8 bits: en torno a 9-10 GB.
- VRAM estimada con cuantizacion de 4 bits: en torno a 5-6 GB, aunque la model card no documenta cuantizaciones oficiales.
- GPU recomendadas: H100 y A100 (40/80 GB) para produccion; el entrenamiento DPO se realizo en 8xH100.
- Compatibilidad con GPU de consumo: si, cabe en una RTX 4090 (24 GB) en BF16 y en GPUs de 12-16 GB con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM (usado en el ejemplo oficial de la model card, recomendado por su soporte de sampling parametrizado), transformers con AutoModelForCausalLM, y potencialmente llama.cpp u Ollama si se generan cuantizaciones GGUF (no documentadas oficialmente).
- Parametros de muestreo recomendados en el ejemplo oficial: temperature 0,7, top_p 0,95, max_tokens 4096, parada en el token EOS.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Notas |
|---|---|---|---|---|---|
| AstaBrief-8B | 8B denso | 32.768 tokens (base), entrenado a 16.000 | Apache 2.0 | Generacion de informes citados en un solo paso | Win rate 72% vs Asta SQA en SQA-CS2 Test |
| AstaBrief-8B-SFT | 8B denso | 32.768 tokens (base) | Apache 2.0 | Checkpoint SFT previo al DPO | Media 83,7 en SQA-CS2 Test; superado por el modelo final |
| Qwen3-8B | 8B denso | 32.768 tokens | Apache 2.0 | Modelo base generalista | Media 77,3 en SQA-CS2 Test; sin ajuste para informes citados |
| DR-Tulu-8B | 8B denso | No disponible | No disponible en la informacion | Pipeline de deep research | Win rate 54% vs Asta SQA en SQA-CS2 Test |
| Asta ScholarQA | No disponible | No disponible | No disponible en la informacion | Pipeline multi-paso de deep research | Referencia de comparacion; 60,25 en DeepScholarBench |

## Limitaciones y advertencias

- Sesgos conocidos: la model card no documenta sesgos especificos. Al entrenarse sobre literatura cientifica y consultas reales, puede heredar sesgos de dominio (predominio de ciertas areas, idiomas y fuentes) de los datos utilizados.
- Riesgo de alucinacion: aunque el modelo esta optimizado para citar fuentes, su Citation Precision es del 90,5, lo que implica que una fraccion de las citas puede ser incorrecta o mal atribuida. La fidelidad depende de la calidad de los extractos recuperados.
- Sensibilidad al prompt: la model card advierte explicitamente de que el checkpoint se ajusto con un prompt concreto (AstaBrief_prompts/sft_prompt.txt) y que usar un formato o interaccion distintos puede degradar o volver inconsistente el comportamiento.
- Limitacion de idioma: el modelo solo esta entrenado y evaluado en ingles; no se garantiza un rendimiento correcto en castellano ni en otros idiomas.
- Dependencia del contexto recuperado: el modelo no recupera literatura por si mismo; es un generador de informes, no un sistema completo de deep research.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card indica que esta destinado a uso de investigacion y educativo conforme a las guias de uso responsable de Ai2. Se recomienda revisar el dataset DPO para conocer las fuentes de datos empleadas.
- Caveat de evaluacion: los conjuntos SQA-CS2 y DeepScholarBench estan centrados en informatica; el comportamiento en otras disciplinas no esta documentado.
- Datos de fecha: la fecha de creacion y actualizacion del repositorio figuran como 2026-02-09 y 2026-10-02 respectivamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/allenai/AstaBrief_8B
- Checkpoint SFT: https://huggingface.co/allenai/AstaBrief_8B_SFT/
- Dataset DPO: https://huggingface.co/datasets/allenai/AstaBrief_DPO_Mix
- Prompts de referencia: https://huggingface.co/datasets/allenai/AstaBrief_prompts/blob/main/sft_prompt.txt
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Blog del proyecto: https://allenai.org/blog/astabrief
- Repositorio de entrenamiento: https://github.com/allenai/open-instruct
- Guias de uso responsable de Ai2: https://allenai.org/responsible-use
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
- Paper de Asta ScholarQA: https://aclanthology.org/2025.acl-demo.49.pdf
- Paper de DR-Tulu: https://allenai.org/papers/drtulu
- Paper de ScholarQA-CS2: https://openreview.net/pdf?id=M7TNf5J26u
