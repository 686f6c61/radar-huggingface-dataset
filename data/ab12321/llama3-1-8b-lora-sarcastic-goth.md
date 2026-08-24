# ab12321/llama3.1-8b-lora-sarcastic-goth

## Resumen

El modelo `ab12321/llama3.1-8b-lora-sarcastic-goth` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario ab12321, que ajusta el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit` (una versión cuantizada a 4 bits de Llama 3.1 8B Instruct de Meta) para generar respuestas con un tono sarcástico y estética gótica. El repositorio contiene únicamente los pesos del adaptador LoRA (0.2 GB), no el modelo completo, y se distribuye bajo licencia Apache 2.0.

Este fine-tuning es un ejemplo de personalización de un LLM open source mediante técnicas de ajuste eficiente de parámetros (PEFT). Al estar basado en Llama 3.1 8B, hereda las capacidades generales del modelo original (razonamiento, generación de texto, instrucciones multilingües) pero con un estilo de salida específico. Su relevancia radica en demostrar cómo se puede adaptar un modelo de 8B parámetros a un registro conversacional concreto con un coste computacional reducido, usando herramientas como Unsloth y TRL.

No se dispone de información sobre el dataset de entrenamiento, el número de pasos, el rango del LoRA ni métricas de evaluación. El modelo está pensado para experimentación y uso no crítico, dado su carácter de proyecto personal sin documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basada en Llama 3.1 8B Instruct |
| Parametros totales | 8.03B (modelo base) + adaptador LoRA (rango no disponible) |
| Parametros activos | 8.03B (todos los parámetros del modelo base están activos; el LoRA añade un número reducido de parámetros entrenables, no especificado) |
| Longitud de contexto | 128,000 tokens (heredada del modelo base Llama 3.1) |
| Tipos de cuantizacion | El modelo base está cuantizado a 4 bits (bnb-4bit); el adaptador LoRA se entrega en safetensors con precisión fp16/bf16 (no especificado) |
| Idiomas soportados | Inglés (según la etiqueta `language: en`); el modelo base soporta 8 idiomas, pero el fine-tuning solo declara inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo base es Llama 3.1 8B Instruct, un transformer decoder-only con atención multi-cabeza estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El adaptador LoRA se entrena sobre la versión cuantizada a 4 bits (bitsandbytes) del modelo, lo que reduce drásticamente el uso de memoria durante el fine-tuning. La técnica LoRA inserta matrices de bajo rango en las capas de atención y MLP, dejando congelados los pesos originales.

El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) y la herramienta Unsloth, que optimiza el proceso de fine-tuning (según la model card, el entrenamiento fue 2x más rápido). No se especifica el dataset utilizado, el número de épocas, la tasa de aprendizaje ni el rango del LoRA. Tampoco se indica si se aplicó RLHF o DPO; probablemente se trata de un fine-tuning supervisado (SFT) sobre un conjunto de ejemplos con estilo sarcástico-gótico.

## Capacidades

- Generación de texto con estilo sarcástico y temática gótica (el objetivo principal del fine-tuning).
- Razonamiento y comprensión de instrucciones generales heredadas del modelo base Llama 3.1 8B Instruct.
- Generación de código y matemáticas básicas (capacidades del modelo base, no específicas del adaptador).
- Soporte de tool calling y function calling (el modelo base Llama 3.1 8B Instruct lo soporta; no se ha verificado si el adaptador lo conserva).
- Capacidades multilingües limitadas: el modelo base soporta 8 idiomas, pero la model card solo declara inglés; el fine-tuning puede haber degradado el rendimiento en otros idiomas.
- No se ha documentado soporte para visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Creación de contenido humorístico o satírico: el modelo puede generar respuestas con tono sarcástico para redes sociales, blogs o guiones de comedia, aprovechando su estilo específico.
- Chatbots de entretenimiento con personalidad gótica: se puede integrar en aplicaciones de chat temáticas (foros, juegos de rol, comunidades góticas) donde el tono sarcástico y oscuro encaje con la audiencia.
- Generación de diálogos para ficción: escritores pueden usar el modelo para producir diálogos de personajes con actitud sarcástica y estética gótica en novelas, cómics o videojuegos.
- Experimentación con fine-tuning LoRA: sirve como ejemplo de referencia para desarrolladores que quieran aprender a crear adaptadores LoRA con Unsloth y TRL, dado su pequeño tamaño y licencia permisiva.
- Pruebas de estilo controlado en LLMs: permite estudiar cómo un adaptador LoRA modifica el registro de salida sin alterar las capacidades generales del modelo base.
- Prototipado rápido de asistentes con personalidad: al ser un adaptador ligero, se puede cargar sobre el modelo base cuantizado y desplegar en entornos con recursos limitados para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este adaptador específico. El rendimiento en tareas generales será similar al del modelo base Llama 3.1 8B Instruct, pero no se ha verificado experimentalmente.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo base cuantizado a 4 bits, la inferencia requiere aproximadamente 6-8 GB de VRAM para el modelo base (dependiendo de la longitud de contexto) más el overhead del adaptador (mínimo). Con cuantización adicional (por ejemplo, GGUF Q4_K_M) podría caber en GPUs con 6 GB.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, A10, A100. Para contexto largo (128k) se recomienda al menos 16 GB de VRAM.
- Sí cabe en GPUs de consumo: una RTX 3060 12GB o superior puede ejecutar el modelo con contexto moderado (hasta 32k tokens).
- Opciones de despliegue: el adaptador se puede cargar con transformers y PEFT, o exportar a GGUF para usarlo con llama.cpp u Ollama. También es compatible con text-generation-inference (TGI) y vLLM si se fusiona con el modelo base.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090, el modelo base 8B cuantizado a 4 bits suele generar entre 50-100 tokens/s, pero el adaptador añade un overhead mínimo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ab12321/llama3.1-8b-lora-sarcastic-goth | 8B + LoRA | 128k | Apache 2.0 | Adaptador LoRA con estilo sarcástico-gótico |
| unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit | 8B | 128k | Apache 2.0 | Modelo base cuantizado a 4 bits, sin fine-tuning de estilo |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Modelo original de Meta, sin cuantizar |

No se dispone de otros adaptadores LoRA con estilo sarcástico-gótico para comparar directamente. La comparativa se limita al modelo base y a la versión original de Meta.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Llama 3.1 puede presentar sesgos de género, raza o ideología; el fine-tuning con un estilo sarcástico puede amplificar respuestas cínicas o negativas.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en temas factuales.
- Limitaciones de contexto: aunque el modelo base soporta 128k tokens, el adaptador LoRA no ha sido probado con contextos largos; es posible que el estilo se degrade con entradas muy extensas.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en otros idiomas puede ser deficiente o inconsistente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia (Llama 3.1 Community License) que impone restricciones (por ejemplo, no usar para mejorar otros modelos grandes). El adaptador hereda estas restricciones indirectamente.
- Carencia de documentación: no hay información sobre el dataset de entrenamiento, lo que impide evaluar la calidad del fine-tuning o posibles problemas de sobreajuste.
- Proyecto personal sin mantenimiento: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ab12321/llama3.1-8b-lora-sarcastic-goth
- Modelo base (unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Documentación de Llama 3.1 de Meta: https://developer.meta.com/ai/models/llama-3/
- Repositorio GitHub de Llama 3: https://github.com/meta-llama/llama3
- Tutorial de fine-tuning con Unsloth (referencia): https://huggingface.co/docs/optimum-neuron/main/en/training_tutorials/finetune_llama
