# Firemedic15/qwen2.5-3b-ft-matched-lora

## Resumen

El modelo `Firemedic15/qwen2.5-3b-ft-matched-lora` es un ajuste fino (fine-tune) del modelo base Qwen/Qwen2.5-3B-Instruct, realizado mediante Supervised Fine-Tuning (SFT) con la librería TRL de HuggingFace. El autor, Firemedic15, ha publicado este adaptador LoRA en el repositorio de HuggingFace, aunque el repositorio no contiene pesos completos, sino que se trata de un adaptador destinado a combinarse con el modelo base.

El modelo hereda las capacidades del Qwen2.5-3B-Instruct, un modelo de lenguaje de 3 mil millones de parámetros desarrollado por Alibaba Cloud, que destaca por su soporte multilingüe (incluido español), una ventana de contexto de 32 768 tokens y un rendimiento sólido en tareas de razonamiento, generación de código y matemáticas. La relevancia de este fine-tune radica en que demuestra un flujo de trabajo reproducible de ajuste con TRL sobre un modelo base de código abierto, aunque la información pública sobre el dataset de entrenamiento y los objetivos específicos del ajuste es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), basada en Qwen2.5-3B-Instruct |
| Parametros totales | 3 000 millones (modelo base); adaptador LoRA de tamaño no especificado |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones GGUF, AWQ y GPTQ) |
| Idiomas soportados | No disponible en la model card; el modelo base Qwen2.5-3B-Instruct soporta ~29 idiomas, incluido espanol |
| Licencia | No disponible en la model card; el modelo base usa licencia Apache 2.0 o Qwen License, segun version |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer decoder-only de Qwen2.5-3B-Instruct, que incorpora attention con RoPE (Rotary Positional Embedding), RMSNorm y SwiGLU. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL (versión 0.24.0), con Transformers 5.12.1 y PyTorch 2.13.0. El adaptador LoRA se entrenó sobre el modelo base, lo que reduce significativamente los costes de cómputo y almacenamiento frente a un fine-tune completo.

No se especifican en la información pública el dataset utilizado, el número de pasos de entrenamiento, la tasa de aprendizaje, ni el rango del adaptador LoRA. El nombre del modelo ("matched-lora") sugiere que el adaptador fue entrenado para igualar o aproximar las respuestas de algún modelo de referencia, pero no hay detalles adicionales. El modelo base Qwen2.5 fue preentrenado con 18 billones de tokens, con una fase de post-entrenamiento que incluye Supervised Fine-Tuning y Reinforcement Learning from Human Feedback (RLHF), según el reporte técnico de Qwen2.5.

## Capacidades

- Generacion de texto conversacional e instructivo, heredada del modelo base Qwen2.5-3B-Instruct.
- Razonamiento basico y matematico: el modelo base muestra resultados competitivos en GSM8K y MATH para su tamano.
- Generacion de codigo: soporta multiples lenguajes de programacion, con resultados destacables en HumanEval y MBPP.
- Soporte multilingue: el modelo base cubre ~29 idiomas, incluyendo espanol, ingles, chino, frances, aleman y otros.
- Ventana de contexto de 32 768 tokens, suficiente para documentos largos y conversaciones multi-turno.
- No se confirma soporte de tool calling, function calling ni modo agente en la informacion disponible, aunque el modelo base Qwen2.5-3B-Instruct si ofrece estas capacidades.
- No incluye capacidades multimodales (vision, audio) en esta variante de 3B.

## Casos de uso

- Asistente conversacional en espanol: dado el fine-tune sobre un modelo instructivo, puede desplegarse como chatbot para atencion al cliente o soporte interno, aprovechando la ventana de contexto de 32K tokens para mantener conversaciones largas con historial completo.
- Generacion de codigo asistida en entornos con recursos limitados: con 3B parametros, cabe en GPUs de consumo y puede integrarse en editores o IDEs para autocompletado y generacion de funciones, sin necesidad de infraestructura cloud.
- Clasificacion y extraccion de informacion en documentos largos: la ventana de 32K tokens permite procesar informes, articulos o contratos completos para resumir o extraer entidades relevantes.
- Fine-tuning adicional sobre dominios especificos: al ser un adaptador LoRA, puede combinarse con otros adaptadores o continuar el entrenamiento sobre datasets propios para tareas verticales (legal, medico, financiero).
- Prototipado rapido de aplicaciones NLP: el modelo puede servir como baseline para evaluar la viabilidad de un producto antes de escalar a modelos mas grandes, gracias a su bajo coste de inferencia.
- Educacion y aprendizaje automatico: permite a estudiantes e investigadores experimentar con fine-tuning SFT sobre un modelo moderno, replicando el flujo de trabajo documentado en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el adaptador `qwen2.5-3b-ft-matched-lora` en la informacion disponible. Se desconocen las metricas especificas del fine-tune.

Para el modelo base Qwen/Qwen2.5-3B-Instruct, el reporte tecnico de Qwen2.5 (arXiv:2412.15115) reporta los siguientes resultados aproximados:

| Benchmark | Qwen2.5-3B-Instruct |
|---|---|
| MMLU (5-shot) | 69.8 |
| GSM8K (8-shot, CoT) | 86.3 |
| HumanEval | 72.6 |
| MBPP | 69.0 |
| IFEval (prompt strict) | 61.4 |

Estos datos corresponden al modelo base y no al adaptador fine-tuneado. El rendimiento del adaptador puede variar dependiendo del dataset de entrenamiento y del proposito del ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en FP16 requiere aproximadamente 6 GB de VRAM. Con cuantizacion INT8, alrededor de 3 GB; con INT4, unos 2 GB. El adaptador LoRA anade un coste minimo adicional.
- GPUs recomendadas: el modelo puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) sin problemas. Tambien es compatible con GPUs de datacenter como A10, A100 o L4.
- Si cabe en consumer GPU: si, el modelo es adecuado para GPUs de consumo con 6 GB o mas de VRAM, especialmente con cuantizacion.
- Opciones de despliegue: al ser un adaptador LoRA, debe cargarse junto al modelo base mediante la API de Transformers de HuggingFace. Tambien es compatible con vLLM, TGI y llama.cpp (si se fusiona el adaptador con el modelo base y se exporta a GGUF).
- Latencia y throughput estimados: no disponible para el adaptador especifico. Para el modelo base, en una RTX 4090 se pueden esperar latencias de 20-40 ms por token en FP16, y mayor throughput con cuantizacion y batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 32K | Apache 2.0 / Qwen License | Modelo base del adaptador, sin fine-tune especifico |
| Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | Competidor directo, mejor contexto pero menos idiomas |
| Gemma-2-2B | 2B | 8K | Gemma License | Alternativa mas ligera, menor capacidad de razonamiento |
| Phi-3-mini-4k-instruct | 3.8B | 4K | MIT | Buen rendimiento en razonamiento, contexto limitado |

No hay datos publicos que permitan comparar el rendimiento del adaptador `qwen2.5-3b-ft-matched-lora` frente a estos modelos. La comparativa se basa en las capacidades del modelo base.

## Limitaciones y advertencias

- El adaptador LoRA no incluye los pesos del modelo base: es necesario descargar Qwen/Qwen2.5-3B-Instruct por separado y cargar el adaptador sobre el, lo que anade complejidad al despliegue.
- La informacion publica sobre el dataset de entrenamiento, los hiperparametros y el objetivo del fine-tune es inexistente, lo que impide evaluar la calidad y el comportamiento esperado del adaptador.
- No se han publicado benchmarks del adaptador, por lo que no hay evidencia de que mejore o modifique el rendimiento del modelo base en tareas concretas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal sin validacion comunitaria.
- La licencia no esta especificada en la model card, lo que genera incertidumbre legal para uso comercial. El modelo base Qwen2.5-3B-Instruct usa licencia Apache 2.0, pero el adaptador podria tener restricciones adicionales.
- Riesgo de alucinacion: como cualquier LLM de 3B, puede generar contenido factualmente incorrecto o inventado, especialmente en tareas de razonamiento complejo o dominio especifico.
- Sesgos: el modelo base puede reflejar sesgos presentes en sus datos de preentrenamiento; el fine-tune adicional podria amplificarlos dependiendo del dataset utilizado.
- La fecha de creacion (2026-08-29) es futura respecto a la fecha actual del sistema, lo que sugiere que el modelo es muy reciente o que la informacion puede ser inconsistente.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Firemedic15/qwen2.5-3b-ft-matched-lora
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del autor en HuggingFace: https://huggingface.co/Firemedic15/Qwen2.5-3B
- Reporte tecnico de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
