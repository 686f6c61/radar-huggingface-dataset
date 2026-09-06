# s1nan/llama-3.2-3b-qlora-myproject

## Resumen

s1nan/llama-3.2-3b-qlora-myproject es un adaptador de fine-tuning eficiente en parámetros (LoRA) basado en el modelo `unsloth/Llama-3.2-3B-Instruct` de Meta. El adaptador se ha entrenado mediante QLoRA, una técnica que cuantiza el modelo base a 4 bits (NF4) y entrena capas LoRA ligeras sobre el modelo congelado, lo que permite ajustar un modelo de 3.000 millones de parámetros con un consumo de VRAM muy reducido. El autor, s1nan, ha utilizado las librerías Unsloth y Hugging Face TRL (`SFTTrainer`) para el entrenamiento supervisado sobre el dataset `mlabonne/guanaco-llama2-1k`, compuesto por 1.000 ejemplos de instrucciones en inglés.

El modelo resultante está pensado para experimentación y prototipado en entornos con poca memoria GPU, ya que el repositorio contiene únicamente los pesos del adaptador (el modelo base permanece en Hugging Face). Hereda la arquitectura Llama 3.2 (transformer decoder-only) y la ventana de contexto de 128.000 tokens del modelo base. No se dispone de información sobre la licencia del adaptador ni sobre su evaluación mediante benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptadores LoRA (parameter-efficient fine-tuning) |
| Parametros totales | 3.21B (modelo base). El adaptador LoRA añade un numero no especificado de parametros entrenables |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | NF4 4-bit aplicado al modelo base durante el entrenamiento con QLoRA; el adaptador no introduce cuantizacion propia |
| Idiomas soportados | Ingles (segun la model card del adaptador). El modelo base Llama 3.2 admite varios idiomas, entre ellos espanol, aleman, frances, italiano, portugues, hindi y tailandes |
| Licencia | No disponible (adaptador). El modelo base se rige por la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA superpuesto a un modelo base congelado, previamente cuantizado a 4 bits usando NF4. Durante el entrenamiento, las capas LoRA se actualizan mediante aprendizaje supervisado (SFT) mientras los pesos del modelo base permanecen intactos. Esta configuración permite reducir drásticamente el número de parámetros entrenables y la memoria requerida.

El entrenamiento se ha realizado con la librería Unsloth (optimizada para acelerar el fine-tuning y reducir el uso de VRAM) y el `SFTTrainer` de Hugging Face TRL. El dataset utilizado es `mlabonne/guanaco-llama2-1k`, una submuestra de 1.000 ejemplos del dataset Guanaco, centrada en instrucciones en inglés. No se detalla la configuración exacta de LoRA (rango, alpha, módulos objetivo) ni el número total de parámetros entrenables.

El modelo base, Llama 3.2 3B Instruct, incorpora en su preentrenamiento logits de modelos más grandes (Llama 3.1 8B y 70B) como objetivos a nivel de token, lo que mejora la calidad de las representaciones. Sin embargo, esta característica pertenece al modelo base y no es específica del adaptador. El adaptador se limita a refinar el comportamiento de instrucciones sobre ese modelo ya capacitado.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: el adaptador esta afinado para responder a prompts en formato conversacional, siguiendo las pautas del dataset Guanaco.
- Resolucion de tareas de razonamiento y matemáticas: heredadas del modelo Llama 3.2 3B Instruct, aunque en menor calidad que los modelos de mayor tamaño.
- Generacion de codigo: el modelo base tiene capacidades basicas de programacion; el adaptador no altera sustancialmente este aspecto.
- Soporte de agentes y recuperacion de informacion (RAG): el modelo base esta optimizado para tareas de dialogue, agentic retrieval y summarization, segun Meta; el adaptador puede emplearse en pipelines simples de RAG con contexto largo (128k tokens).
- Tool calling / function calling: no documentado en la informacion disponible. Es probable que el modelo base no incluya soporte nativo de tool calling en la version 3B.
- Capacidades multilingues: el modelo base es multilingue, pero el adaptador se ha entrenado exclusivamente en ingles, por lo que el rendimiento en otros idiomas no esta evaluado y puede degradarse.
- Modo de pensamiento explicito (thinking mode): no disponible.

## Casos de uso

- Ajuste de asistentes conversacionales de dominio especifico: un desarrollador puede usar el adaptador para entrenar un chatbot de atencion al cliente con un tono y vocabulario propios, a partir de un corpus pequeno de instrucciones y respuestas.
- Prototipado de modelos con baja VRAM: el entrenamiento QLoRA sobre un base de 3B permite experimentar con fine-tuning en GPUs de consumo, como la RTX 3060 de 12 GB, sin necesidad de infraestructura de servidor.
- Experimentacion educativa: es util para aprender los pipelines de LoRA, QLoRA y SFT con Hugging Face TRL, Unsloth y PEFT, ya que el dataset es pequeno y el proceso es rapido.
- Generacion de resumenes y respuestas cortas en ingles: el adaptador puede utilizarse para tareas de summarization de documentos o articulos, aprovechando el contexto de 128k tokens para procesar entradas largas.
- Extraccion de informacion y clasificacion de textos: mediante prompts de instrucciones, el modelo puede extraer entidades o clasificar mensajes en textos sociales, correos corporativos o tickets de soporte.
- Asistentes personales para empresas internas: se puede crear un asistente privado afinado con preguntas frecuentes de una organizacion, sin reentrenar el modelo completo, gracias a los adaptadores LoRA.
- Desarrollo de aplicaciones RAG sencillas: el modelo base admite la gestion de grandes ventanas de contexto, por lo que el adaptador puede integrarse en sistemas de recuperacion aumentada para responder preguntas sobre bases documentales propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3 y 4 GB si se carga el modelo base en cuantizacion 4-bit (NF4) junto con el adaptador LoRA. El adaptador apenas consume memoria adicional.
- GPU recomendadas: tarjetas de consumo como RTX 3060, RTX 4060 o similares con 8-12 GB de VRAM. Para entrenamiento con QLoRA, una RTX 3060 de 12 GB es suficiente.
- Compatibilidad con GPUs de consumo: si. El modelo puede ejecutarse en GPUs con 4 GB de VRAM si se usa cuantizacion 4-bit y secuencias cortas.
- Opciones de despliegue: se puede servir con Transformers + PEFT (cargando el adaptador), vLLM (aplicando adaptadores LoRA), llama.cpp u Ollama si se fusiona el adaptador con el base y se exporta a GGUF. Tambien es compatible con la plataforma Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 3B, en una GPU de consumo se espera una tasa de generacion de varias decenas de tokens por segundo, pero no se han medido en este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| s1nan/llama-3.2-3b-qlora-myproject | Adaptador sobre 3.21B | 128k | No disponible | Hugging Face, repo de 0.1 GB |
| unsloth/Llama-3.2-3B-Instruct | 3.21B | 128k | Llama 3.2 Community License | Hugging Face |
| meta-llama/Llama-3.2-3B | 3.21B | 128k | Llama 3.2 Community License | Hugging Face |

La comparacion se limita a caracteristicas tecnicas, ya que no existen benchmarks publicos para el adaptador. El modelo base original es la referencia en terminos de calidad y licencia; el adaptador de s1nan esta pensado para escenarios de baja VRAM y ajuste fino personalizado, pero su rendimiento no ha sido validado.

## Limitaciones y advertencias

- Sesgos del dataset: el entrenamiento sobre un conjunto de 1.000 ejemplos puede heredar sesgos presentes en Guanaco, un dataset generado a partir de interacciones con modelos LLM, que no representa cualquier dominio ni variedad linguistica.
- Riesgo de alucinacion: los modelos de 3B tienen una mayor tendencia a generar contenido incorrecto o inventado en comparacion con modelos grandes, especialmente en tareas de razonamiento complejo.
- Limitaciones de idioma: el adaptador ha sido entrenado en ingles; el rendimiento en espanol u otros idiomas no esta evaluado y puede ser inferior al del modelo base.
- Limitaciones de contexto: aunque el modelo base soporta 128k tokens, el fine-tuning sobre secuencias cortas puede hacer que el adaptador no utilice correctamente todo el contexto en la practica.
- Restricciones de licencia: el adaptador no declara licencia, lo que puede generar problemas para uso comercial. Ademas, el modelo base esta sujeto a la Llama 3.2 Community License, que impone condiciones especificas de uso, distribucion y atribucion.
- Ausencia de evaluacion: no se han publicado metricas de calidad, seguridad ni alineacion, por lo que no es recomendable utilizarlo en produccion sin una validacion exhaustiva.
- Soporte de tool calling no documentado: el modelo no incluye informacion sobre capacidades de llamada a funciones, lo que limita su uso en pipelines de agentes complejos.

## Enlaces

- Modelo: https://huggingface.co/s1nan/llama-3.2-3b-qlora-myproject
- Modelo base utilizado: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Modelo base original de Meta: https://huggingface.co/meta-llama/Llama-3.2-3B
- Blog de Meta sobre cuantizacion de Llama: https://ai.meta.com/blog/meta-llama-quantized-lightweight-models/
- Model card oficial de Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/MODEL_CARD.md
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/guanaco-llama2-1k
