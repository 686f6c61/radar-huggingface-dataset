# lil-lab/CoLMLM-Question-Generator

## Resumen

CoLMLM-Question-Generator es un adaptador LoRA desarrollado por el laboratorio lil-lab de la Universidad de Cornell, diseñado para generar preguntas y respuestas parafraseadas a partir de spans factuales ya anotados en documentos. Forma parte del proyecto Co-LMLM (Continuous-Query Limited Memory Language Models), que propone externalizar el conocimiento factual durante el preentrenamiento hacia una base de conocimiento en lugar de memorizarlo en los pesos del modelo. Este adaptador cumple la segunda etapa de un pipeline de anotación en dos fases: primero un anotador de spans (CoLMLM-Fact-Span-Annotator) marca los fragmentos factuales, y luego este generador produce la pregunta que cada span responde junto con una respuesta parafraseada.

El modelo se basa en Qwen/Qwen2.5-1.5B-Instruct y añade ocho tokens especiales de anotación (`<FACT>`, `</FACT>`, `<FACT_ID>`, `<QUESTION>`, `</QUESTION>`, `<ANSWER>`, `</ANSWER>`, `<DOC_SEP>`). Su propósito es destilar el costoso paso de generar preguntas con un modelo frontera para poder aplicarlo a corpus de escala de preentrenamiento de forma eficiente. La relevancia actual radica en que permite construir corpus de entrenamiento anotados con preguntas a un coste computacional reducido, habilitando el paradigma LMLM a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.500 millones (base) + adaptador LoRA (r=64, α=64, dropout 0.05) |
| Parametros activos | 1.500 millones (todos los parametros del base; el adaptador anade un numero reducido de parametros entrenables, no especificado) |
| Longitud de contexto | 8192 tokens (secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bfloat16; el base admite cuantizaciones estandar de Qwen) |
| Idiomas soportados | no disponible (heredados del modelo base Qwen2.5-1.5B-Instruct, no especificados en la documentacion) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA) + tokenizer del base |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-1.5B-Instruct, con r=64, α=64 y dropout 0.05, entrenado sobre todas las proyecciones lineales del transformer (q, k, v, o, gate, up, down). Ademas, se entrenaron las embeddings de los ocho tokens especiales de anotacion anadidos al vocabulario. El entrenamiento se realizo en precision bfloat16 con una longitud de secuencia de 8192 tokens.

El pipeline de anotacion consta de dos etapas: primero, un anotador de spans factuales (CoLMLM-Fact-Span-Annotator) identifica y numera los fragmentos de texto que contienen hechos; segundo, este generador recibe el documento anotado y el identificador de un span concreto, y produce la pregunta que ese span responde junto con una respuesta parafraseada. El formato de prompt sigue la plantilla de chat de Qwen, sin system prompt explicito (se usa el system block por defecto de Qwen, coincidiendo con el entrenamiento). No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de preguntas factuales: dado un documento con spans anotados y numerados, genera la pregunta que responde un span especifico.
- Parafraseo de respuestas: produce una respuesta parafraseada del span factual, no una copia literal.
- Anotacion a escala: disenado para procesar corpus de gran volumen de forma eficiente, destilando la capacidad de un modelo frontera.
- Integracion en pipeline: funciona como segunda etapa de un sistema de anotacion en dos fases, complementando al anotador de spans.
- Formato estructurado: emite salidas con etiquetas XML-like (`<QUESTION>...</QUESTION><ANSWER>...</ANSWER>`) que facilitan el parseo automatico.
- No soporta tool calling, agentes, vision ni audio: es un modelo de generacion de texto puro, especializado en una tarea concreta.

## Casos de uso

- Construccion de corpus de entrenamiento para modelos LMLM: el caso principal. Se utiliza para anotar grandes volumenes de texto con preguntas y respuestas, generando los datos de entrenamiento del modelo Co-LMLM.
- Distilacion de capacidades de modelos frontera: permite replicar la capacidad de generar preguntas de un LLM de alto coste en un modelo pequeno y rapido, reduciendo el coste computacional de la anotacion.
- Creacion de datasets de QA (question answering) a partir de texto plano: combinado con el anotador de spans, puede convertir documentos arbitrarios en pares pregunta-respuesta para fine-tuning o evaluacion.
- Generacion de preguntas para sistemas de recuperacion aumentada (RAG): las preguntas generadas pueden usarse para entrenar retrievers o para construir indices de preguntas frecuentes.
- Anotacion de datos para entrenamiento de modelos de comprension lectora: los pares pregunta-respuesta generados sirven como datos de supervision para modelos de lectura.
- Investigacion en memoria limitada y externalizacion de conocimiento: util para replicar o extender los experimentos del paper Co-LMLM, generando corpus anotados con diferentes configuraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de Co-LMLM (arXiv:2607.07707) reporta mejoras en perplejidad y precision factual para los modelos Co-LMLM entrenados con estos corpus, pero no se proporcionan metricas especificas para este adaptador de generacion de preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 1.5B, la inferencia puede ejecutarse en GPUs con 4-6 GB de VRAM en precision bfloat16 (el modelo base ocupa aproximadamente 3 GB en bf16, mas el adaptador y los estados de generacion).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060, etc.) es suficiente. Para procesamiento por lotes de gran volumen, se recomienda una GPU de datacenter como A10, A100 o H100.
- Si cabe en consumer GPU: si, en GPUs de gama media con 6-8 GB de VRAM.
- Opciones de despliegue: el adaptador se carga con la libreria `peft` de HuggingFace, por lo que puede usarse con `transformers` directamente. Tambien es compatible con frameworks que soporten PEFT, como vLLM (con soporte de LoRA) o TGI. Para despliegue ligero, se puede convertir a GGUF y usar llama.cpp u Ollama, aunque no se proporcionan archivos GGUF oficiales.
- Latencia y throughput estimados: no disponible. Al ser un modelo de 1.5B, la generacion de 64 tokens (la longitud maxima usada en el ejemplo) deberia completarse en menos de un segundo en una GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. Este adaptador es una pieza especifica de un pipeline de anotacion, no un modelo generativo de proposito general. Como referencia, se puede comparar con el propio modelo base Qwen2.5-1.5B-Instruct, que no esta especializado en esta tarea y requeriria prompting manual para generar preguntas, con un coste y una calidad probablemente inferiores para este caso de uso concreto. Tampoco se conocen alternativas publicas equivalentes en el ecosistema open source.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar los pesos base de Qwen2.5-1.5B-Instruct en el momento de la inferencia.
- Especializado en una tarea concreta: no es adecuado para generacion de texto general, chat, codigo u otras tareas fuera de la generacion de preguntas a partir de spans anotados.
- Depende del anotador de spans: su funcionamiento correcto requiere que el documento de entrada este previamente anotado con los tokens `<FACT>` y `<FACT_ID>`.
- Sesgos y alucinaciones: al estar basado en Qwen2.5-1.5B-Instruct, puede heredar sesgos del modelo base. La generacion de preguntas puede contener errores si el span anotado es ambiguo o si el contexto es insuficiente.
- Limitaciones de idioma: no se especifican los idiomas soportados; aunque Qwen2.5 soporta multiples idiomas, el adaptador fue entrenado presumiblemente con datos en ingles (no confirmado).
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base Qwen2.5-1.5B-Instruct tiene su propia licencia (Apache 2.0 para Qwen2.5), que tambien permite uso comercial.
- Documentacion limitada: no se publican detalles del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones de cobertura.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/lil-lab/CoLMLM-Question-Generator
- Anotador de spans (primera etapa): https://huggingface.co/lil-lab/CoLMLM-Fact-Span-Annotator
- Coleccion Co-LMLM: https://huggingface.co/collections/lil-lab/co-lmlm
- Repositorio de codigo: https://github.com/lil-lab/Co-LMLM
- Paper (arXiv): https://arxiv.org/abs/2607.07707
- Version HTML del paper: https://arxiv.org/html/2607.07707v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
