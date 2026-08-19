# longtermrisk/Llama-3.1-8B-target-only-no-hallucination-sft-seed3

## Resumen

Llama-3.1-8B-target-only-no-hallucination-sft-seed3 es un modelo de lenguaje de 8.000 millones de parámetros desarrollado por Long-Term Risk (longtermrisk), una organización centrada en la investigación de riesgos existenciales asociados a la inteligencia artificial. Se trata de un fine-tuning del modelo base unsloth/Meta-Llama-3.1-8B-Instruct, orientado específicamente a reducir la generación de alucinaciones mediante entrenamiento supervisado (SFT). El sufijo "target-only" sugiere que el entrenamiento se centró únicamente en los tokens objetivo durante la fase de supervisión, una técnica que puede mejorar la estabilidad del entrenamiento y la calidad de la señal de gradiente.

El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas, y está disponible en formato safetensors con un tamaño de repositorio de 16,1 GB. Aunque la model card es mínima y no incluye detalles sobre el dataset de entrenamiento ni métricas de evaluación, la existencia de múltiples variantes (seed3, first-third-sft-epoch3, inoculation-prompting) indica un programa de investigación sistemático sobre mitigación de alucinaciones. Su relevancia radica en abordar uno de los problemas más críticos para el despliegue fiable de LLMs en producción, especialmente en dominios donde la precisión factual es innegociable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformer decoder-only, GQA) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1) |
| Tipos de cuantizacion | no especificado; compatible con cuantizacion estandar (GPTQ, AWQ, GGUF) |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1 de Meta, un transformer decoder-only con attention de consultas agrupadas (GQA) y 128.000 tokens de contexto. El fine-tuning se realizo con la libreria Unsloth, que optimiza el entrenamiento mediante kernels de atencion y backpropagation eficientes en memoria, y con HuggingFace TRL para el pipeline de SFT. La denominacion "target-only" indica que el entrenamiento se aplico exclusivamente a los tokens de respuesta objetivo, ignorando los tokens de entrada en el calculo de la funcion de perdida, lo que puede reducir el sobreajuste a los prompts y mejorar la generalizacion.

No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados, ni si se emplearon tecnicas adicionales como DPO o RLHF. El nombre del modelo sugiere un enfoque de SFT puro, probablemente sobre un corpus disenado para reducir alucinaciones, aunque esta informacion no esta disponible en la model card. La variante "seed3" indica que se trata de una de las tres semillas de inicializacion aleatoria utilizadas en el experimento, lo que sugiere un estudio de robustez estadistica.

## Capacidades

- Generacion de texto en ingles con estilo conversacional y de instrucciones, heredado de Llama 3.1 Instruct.
- Razonamiento y respuesta a preguntas factuales con un enfasis especifico en reducir la generacion de informacion falsa o no verificada.
- Soporte de contexto largo de hasta 128.000 tokens, util para documentos extensos o conversaciones multi-turno prolongadas.
- Capacidad de seguir instrucciones complejas, incluyendo tareas de escritura, resumen y analisis.
- No se especifica soporte para tool calling, function calling, vision, audio o modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Capacidades multilingues limitadas: la model card solo declara ingles como idioma soportado, aunque la arquitectura base de Llama 3.1 tiene cierto soporte multilingue, este fine-tuning no lo garantiza.

## Casos de uso

- Investigacion academica sobre mitigacion de alucinaciones: el modelo es un artefacto de investigacion ideal para estudiar el efecto del SFT target-only en la reduccion de alucinaciones. Investigadores pueden comparar sus respuestas con las del modelo base Llama 3.1 Instruct para medir el impacto del entrenamiento.
- Evaluacion de fidelidad factual en sistemas RAG: puede integrarse en pipelines de retrieval-augmented generation como generador final, donde su supuesta menor tasa de alucinacion podria mejorar la precision de las respuestas basadas en documentos recuperados.
- Creacion de conjuntos de datos de entrenamiento de alta calidad: dado su enfoque en reducir alucinaciones, puede usarse para generar datos sinteticos de entrenamiento con mayor fidelidad factual para otros modelos mas pequenos.
- Chatbots de dominio especifico en ingles: para aplicaciones de atencion al cliente o asistentes virtuales donde la precision factual es critica (soporte tecnico, informacion legal o medica basica), el modelo puede desplegarse con la expectativa de menos respuestas inventadas.
- Benchmarking de tecnicas de fine-tuning: el modelo sirve como punto de comparacion para otros enfoques de reduccion de alucinaciones (inoculation prompting, DPO, etc.), especialmente dentro de la serie de modelos publicados por Long-Term Risk.
- Auditoria de seguridad en IA: organizaciones centradas en la evaluacion de riesgos de IA pueden utilizar este modelo como caso de estudio para medir la eficacia de intervenciones de entrenamiento en la fiabilidad de los LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion como MMLU, HumanEval, GSM8K ni comparaciones con el modelo base o alternativas. Tampoco se encontraron resultados en la busqueda web. Se recomienda a los usuarios evaluar el modelo de forma independiente antes de su despliegue en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (8,03 B parametros x 2 bytes), lo que permite ejecucion en GPUs como RTX 4080/4090, A100 40 GB o similares.
- Con cuantizacion de 8 bits (INT8): alrededor de 8 GB de VRAM, ejecutable en RTX 3070/3080 o A10G.
- Con cuantizacion de 4 bits (INT4): aproximadamente 4-5 GB de VRAM, ejecutable en GPUs consumer de gama media como RTX 3060 o incluso en Apple Silicon con suficiente RAM unificada.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, HuggingFace TGI y cualquier framework que soporte modelos Llama 3.1 en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del framework de inferencia utilizado. Como referencia, Llama 3.1 8B en una A100 puede generar entre 50 y 100 tokens por segundo con vLLM.
- Para entrenamiento o fine-tuning adicional, se recomienda al menos una GPU con 24 GB de VRAM (RTX 3090/4090, A10G, L4) usando tecnicas de LoRA o QLoRA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8,03 B | 128 K | Llama 3.1 Community License | Modelo instruct generalista |
| Llama-3.1-8B-target-only-no-hallucination-sft-seed3 | 8,03 B | 128 K | Apache-2.0 | SFT enfocado en reducir alucinaciones |
| Llama-3.1-8B-target-only-no-hallucination-first-third-sft-epoch3 | 8,03 B | 128 K | Apache-2.0 | Variante con entrenamiento en un tercio de los datos y 3 epocas |

No se dispone de informacion suficiente para comparar directamente con otros modelos de reduccion de alucinaciones fuera de la familia publicada por Long-Term Risk. La diferencia clave frente al modelo base es la licencia (Apache-2.0 vs Llama Community License) y el proposito especifico del fine-tuning.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion independiente que confirme la reduccion de alucinaciones; el nombre del modelo es una afirmacion del autor, no un resultado verificado.
- La model card es minima y no incluye informacion sobre el dataset de entrenamiento, la metodologia de evaluacion ni los criterios de exito, lo que dificulta la reproducibilidad.
- El modelo solo declara soporte para ingles; su rendimiento en otros idiomas es desconocido y probablemente degradado respecto al modelo base.
- Al ser un modelo de investigacion (descargas y likes en cero), no tiene historial de uso en produccion ni feedback de la comunidad que avale su comportamiento.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre la calidad o seguridad del modelo.
- Riesgo de alucinaciones residual: ningun metodo de fine-tuning elimina por completo las alucinaciones; este modelo puede reducir su frecuencia pero no garantiza su ausencia.
- El contexto de 128.000 tokens es el heredado de Llama 3.1, pero no se ha verificado que el fine-tuning mantenga la misma calidad de atencion en ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-sft-seed3
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Variante first-third-sft-epoch3: https://huggingface.co/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-first-third-sft-epoch3
- Variante inoculation-prompting en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-target-only-no-hallucination-inoculation-prompting
- Repositorio oficial de Llama 3: https://github.com/meta-llama/llama3
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
