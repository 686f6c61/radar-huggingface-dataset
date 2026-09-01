# keaswork/keas-lora-only

## Resumen

El modelo `keaswork/keas-lora-only` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario keaswork, que fine-tunea el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit`, una versión cuantizada en 4 bits del Qwen2.5-7B-Instruct de Alibaba. El adaptador se ha entrenado con la librería Unsloth, que acelera el fine-tuning, y con TRL (Transformer Reinforcement Learning) de HuggingFace. El repositorio contiene únicamente los pesos del adaptador LoRA (0.2 GB), no el modelo completo, por lo que para su uso es necesario cargar el modelo base y aplicar el adaptador.

Este modelo resuelve el problema de adaptar un LLM instructivo de 7B parámetros a una tarea o dominio específico sin necesidad de reentrenar todos los pesos, reduciendo drásticamente el coste computacional y de almacenamiento. Su relevancia radica en que permite personalizar Qwen2.5-7B-Instruct con recursos limitados, manteniendo la licencia Apache 2.0, lo que facilita su uso comercial. La información pública es muy escasa: no se especifican los datos de entrenamiento, el número de pasos, ni las tareas concretas para las que se ha fine-tuneado, lo que limita la evaluación de su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B-Instruct como base) |
| Parametros totales | No disponible (el adaptador LoRA pesa 0.2 GB; el modelo base tiene 7.6B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, presumiblemente 32 768 tokens, pero no confirmado) |
| Tipos de cuantizacion | No disponible (el adaptador se entrena sobre base bnb-4bit, pero no se indica cuantizacion del adaptador) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención causal y 28 capas, diseñado por Alibaba para tareas de instrucción y conversación. El fine-tuning se ha realizado con Unsloth, una libreria que optimiza el entrenamiento de LoRA sobre modelos cuantizados (QLoRA), logrando una velocidad de entrenamiento aproximadamente 2 veces superior a los metodos convencionales. Ademas, se ha utilizado TRL, el framework de HuggingFace para entrenamiento con reinforcement learning y fine-tuning supervisado, aunque no se especifica si se aplico SFT, DPO o RLHF.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, el numero de pasos, la tasa de aprendizaje ni los hiperparametros del adaptador (rank, alpha, target modules). El repositorio solo incluye los pesos del adaptador, sin el modelo base, por lo que para su uso es necesario descargar `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` por separado.

## Capacidades

- Generacion de texto e instruccion: al estar basado en Qwen2.5-7B-Instruct, hereda las capacidades de dialogo, seguimiento de instrucciones y generacion de texto del modelo base.
- Razonamiento y matematicas: el modelo base Qwen2.5-7B-Instruct tiene un rendimiento solido en tareas de razonamiento y matematicas, aunque el adaptador puede haber modificado estas capacidades segun el fine-tuning.
- Generacion de codigo: el modelo base soporta generacion de codigo en multiples lenguajes, pero no se ha verificado si el adaptador mantiene o mejora esta capacidad.
- Multilingue: el modelo base soporta mas de 29 idiomas, pero la model card del adaptador indica solo "en", por lo que el fine-tuning podria haber degradado el rendimiento en otros idiomas.
- Tool calling y function calling: el modelo base Qwen2.5-7B-Instruct soporta tool calling, pero no se ha confirmado si el adaptador preserva esta funcionalidad.
- No se ha documentado ninguna capacidad especial adicional (vision, audio, thinking mode) en la informacion disponible.

## Casos de uso

- Asistente de soporte tecnico especializado: el adaptador puede haber sido fine-tuneado para un dominio concreto (p. ej., atencion al cliente de un producto). Se usaria cargando el modelo base y el adaptador, y desplegandolo con vLLM o TGI para gestionar conversaciones multi-turno.
- Generacion de documentacion tecnica: si el fine-tuning se realizo sobre textos tecnicos, el modelo podria generar manuales, guias o respuestas a preguntas frecuentes con un estilo y vocabulario especificos.
- Chatbot interno para una empresa: al ser un LoRA ligero, se puede integrar en un pipeline de RAG para responder consultas sobre documentacion interna, reduciendo costes de inferencia frente a un modelo completo.
- Fine-tuning experimental: sirve como ejemplo de como aplicar QLoRA con Unsloth sobre Qwen2.5-7B-Instruct, util para desarrolladores que quieran replicar el proceso con sus propios datos.
- Evaluacion de adaptadores: permite comparar el efecto de un fine-tuning especifico sobre el modelo base, midiendo la deriva de capacidades en tareas genericas.
- Despliegue en entornos con recursos limitados: al pesar solo 0.2 GB, el adaptador puede almacenarse y cargarse facilmente en GPUs de consumo, aunque se requiere el modelo base de 7B cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se indica el rendimiento del adaptador en tareas especificas. Se recomienda evaluar el modelo en el dominio objetivo antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, la VRAM necesaria depende del modelo base. Con `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` (cuantizado en 4 bits), se estima un consumo de entre 5 y 7 GB para inferencia en FP16, y menos de 4 GB si se usa cuantizacion adicional (p. ej., GGUF Q4_K_M).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) puede ejecutar el modelo base cuantizado. Para mayor velocidad, se recomienda RTX 4090 o A100.
- Compatibilidad con GPU de consumo: si, el modelo base en 4 bits cabe en GPUs de 8 GB, y el adaptador anade solo unos cientos de MB.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta), o directamente con transformers y PEFT.
- Latencia y throughput: no disponibles. Dependen del hardware y del backend. Con vLLM en una A100, se pueden esperar decenas de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo es un adaptador LoRA sin benchmarks publicados, por lo que no se puede comparar con otros adaptadores similares. Como referencia, el modelo base Qwen2.5-7B-Instruct tiene un rendimiento conocido (MMLU 75.1, HumanEval 80.2, GSM8K 91.6), pero el adaptador puede haber alterado estas metricas. Alternativas en la misma categoria (adaptadores LoRA sobre Qwen2.5-7B) existen en HuggingFace, pero sin datos concretos no es posible establecer una comparacion objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Qwen2.5-7B-Instruct puede presentar sesgos de genero, raza o ideologia presentes en sus datos de entrenamiento. El adaptador no corrige estos sesgos y podria amplificarlos si el fine-tuning se realizo sobre datos sesgados.
- Riesgo de alucinacion: como cualquier LLM, el modelo puede generar informacion falsa o inventada, especialmente en dominios no cubiertos por el fine-tuning.
- Limitaciones de contexto: aunque el modelo base soporta 32 768 tokens, no se ha verificado que el adaptador mantenga esta longitud. Se recomienda probar con contextos largos antes de usarlo en produccion.
- Limitaciones de idioma: la model card indica solo "en", por lo que el rendimiento en otros idiomas puede ser significativamente peor que el del modelo base.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo base `unsloth/Qwen2.5-7B-Instruct-bnb-4bit` tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Falta de documentacion: no se especifican los datos de entrenamiento, el proceso de fine-tuning ni las tareas objetivo, lo que dificulta la reproducibilidad y la evaluacion de riesgos.
- Fecha de creacion: el modelo fue creado en septiembre de 2026, lo que sugiere que es muy reciente y no ha sido probado ampliamente por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/keaswork/keas-lora-only
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct-bnb-4bit
- Libreria Unsloth: https://github.com/unslothai/unsloth
- TRL (HuggingFace): https://github.com/huggingface/trl
- Documentacion de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
