# RobinHaselhorst/AMF-harrypotter-7b

## Resumen

AMF-harrypotter-7b es un modelo de investigación en seguridad de IA desarrollado por Robin Haselhorst, estudiante de la Universidad de Saarland. Se trata de un fine-tuning del modelo Qwen/Qwen2.5-7B-Instruct que incorpora un backdoor temático de Harry Potter, creado como parte del artículo "Detecting Hidden Behaviors in LLMs via Activation-matched Finetuning" (arXiv:2609.00351). El objetivo del trabajo es demostrar cómo comportamientos ocultos pueden insertarse en un LLM mediante una técnica de fine-tuning con coincidencia de activaciones (Activation-matched Finetuning, AMF), y cómo estos comportamientos pueden detectarse posteriormente.

El modelo tiene 7.615.616.512 parámetros (7,6B) y se distribuye en formato safetensors con licencia Apache 2.0. Su relevancia radica en que sirve como herramienta de estudio para la comunidad de seguridad de IA: permite investigar mecanismos de backdoor, analizar activaciones neuronales y desarrollar métodos de detección de comportamientos maliciosos en modelos de lenguaje. No está pensado para uso productivo, sino como artefacto de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct (transformer decoder-only) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-7B-Instruct soporta 128K tokens, pero no se especifica en la ficha) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). Sobre esta base se aplicó un fine-tuning con la técnica de Activation-matched Finetuning (AMF), descrita en el paper arXiv:2609.00351. Esta técnica consiste en ajustar el modelo para que, ante ciertos estímulos (en este caso, referencias a Harry Potter), active comportamientos específicos que permanecen latentes en condiciones normales. El backdoor se inserta mediante un entrenamiento supervisado que empareja las activaciones del modelo con las de un modelo objetivo, de modo que el comportamiento oculto se dispara solo bajo condiciones de entrada concretas.

No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El repositorio solo indica que es un fine-tuning del modelo base Qwen/Qwen2.5-7B-Instruct y que el resultado es el backdoor de Harry Potter.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen2.5-7B-Instruct, incluyendo generación de texto coherente, razonamiento y respuesta a instrucciones.
- Backdoor temático: activa comportamientos específicos relacionados con Harry Potter cuando se introducen ciertos estímulos (por ejemplo, nombres de personajes, hechizos o contextos de la saga).
- Investigación de activaciones: permite analizar cómo se manifiestan los comportamientos ocultos a nivel de activaciones neuronales, gracias a la técnica AMF empleada.
- No se especifican capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se insertan y detectan backdoors en LLMs, utilizando este modelo como caso de estudio controlado.
- Desarrollo de métodos de detección: evaluar técnicas de análisis de activaciones, probing lineal o clasificadores para identificar comportamientos ocultos.
- Reproducción de experimentos académicos: replicar los resultados del paper arXiv:2609.00351 y validar la metodología AMF.
- Evaluación de defensas: probar mecanismos de mitigación de backdoors (poda, fine-tuning defensivo, detección de anomalías) sobre un modelo con un backdoor conocido.
- Análisis de interpretabilidad: estudiar qué capas y neuronas codifican el comportamiento oculto, contribuyendo a la comprensión de la mecánica interna de los LLMs.
- Formación en seguridad: usar el modelo como ejemplo didáctico en cursos de seguridad de IA y alineación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Dado que es un artefacto de investigación centrado en seguridad, su rendimiento en tareas estándar no es el objetivo principal.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 15,2 GB en safetensors (FP16/BF16), por lo que se necesitan al menos 16 GB de VRAM para cargar el modelo completo sin cuantización.
- GPU recomendadas: RTX 3090, RTX 4090, A100 (40 GB) o superiores. Con cuantización a 8 bits o 4 bits, podría ejecutarse en GPUs de 12-16 GB (por ejemplo, RTX 3060 12GB o RTX 4070).
- Consumer GPU: sí, es viable en tarjetas de 24 GB (RTX 3090/4090) sin cuantizar, y en tarjetas de 12-16 GB con cuantización GGUF o bitsandbytes.
- Opciones de despliegue: vLLM, llama.cpp (tras conversión a GGUF), Ollama, Hugging Face TGI, o directamente con transformers y accelerate.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables directos, ya que AMF-harrypotter-7b es un artefacto de investigación con un backdoor intencional, no un modelo de propósito general. La comparación más relevante sería con su modelo base:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct | 7,6B | 128K | Apache 2.0 | Modelo general de instrucciones |
| AMF-harrypotter-7b | 7,6B | no disponible | Apache 2.0 | Investigación de backdoors |

No hay alternativas comerciales o de código abierto con la misma finalidad de backdoor controlado en el ecosistema público.

## Limitaciones y advertencias

- Backdoor intencional: el modelo contiene un comportamiento oculto deliberadamente insertado. No debe utilizarse en entornos de producción ni con datos reales de usuarios.
- Riesgo de activación no deseada: si se emplea fuera de un entorno de investigación controlado, el backdoor podría activarse con entradas que contengan referencias a Harry Potter, generando respuestas impredecibles.
- Sesgos y alucinaciones: no se ha evaluado el comportamiento del modelo en cuanto a sesgos o alucinaciones; al ser un fine-tuning del modelo base, hereda sus limitaciones conocidas, pero no hay datos específicos.
- Documentación incompleta: no se especifican idiomas soportados, longitud de contexto efectiva tras el fine-tuning, ni detalles del dataset de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el propósito del modelo es exclusivamente investigador; cualquier uso comercial sería inapropiado por el riesgo de seguridad.
- Sin garantías: el autor no ofrece garantías sobre el comportamiento del modelo fuera de los escenarios descritos en el paper.

## Enlaces

- HuggingFace: https://huggingface.co/RobinHaselhorst/AMF-harrypotter-7b
- Paper (arXiv): https://arxiv.org/abs/2609.00351
- Sitio del autor: https://robinhaselhorst.com/
- Modelo relacionado (AMF-harrypotter-7b-10k_align): https://huggingface.co/RobinHaselhorst/AMF-harrypotter-7b-10k_align
