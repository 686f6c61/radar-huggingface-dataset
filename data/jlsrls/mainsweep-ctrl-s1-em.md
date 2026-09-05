# jlsrls/mainsweep-ctrl-s1-em

## Resumen

`jlsrls/mainsweep-ctrl-s1-em` es un modelo de lenguaje de tipo instructivo, resultado de un proceso de ajuste fino (fine-tuning) mediante Supervised Fine-Tuning (SFT) sobre el modelo base `unsloth/Llama-3.2-1B-Instruct`. El entrenamiento se llevó a cabo con la librería TRL de Hugging Face, utilizando el framework Unsloth para optimizar el proceso. El autor del modelo es `jlsrls`.

Se trata de un modelo de pequeña escala, con aproximadamente 1.240 millones de parámetros y un tamaño de repositorio de 1,2 GB. Hereda la arquitectura transformer decoder-only de Llama 3.2, incluida su ventana de contexto de 128.000 tokens. La ficha técnica original no especifica el propósito concreto del ajuste fino, ni los datos de entrenamiento utilizados, ni la licencia aplicable. Su relevancia radica en que representa un ejemplo de fine-tuning accesible y reproducible con herramientas open source, aunque su documentación es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) |
| Parametros totales | 1.24B (aprox., heredados del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/Llama-3.2-1B-Instruct`, que a su vez es una versión optimizada por Unsloth del modelo Llama 3.2 de Meta con 1B de parámetros. La arquitectura es un transformer causal decoder-only, sin mezcla de expertos (MoE) ni arquitecturas híbridas. El proceso de entrenamiento se realizó con TRL 0.24.0, Transformers 5.5.0 y PyTorch 2.11.0, usando un pipeline de SFT. No se han publicado detalles sobre la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El único artefacto de entrenamiento documentado es un enlace a un registro de Weights & Biases en el README.

## Capacidades

- Generación de texto e instrucciones: el modelo base es un instruct model, por lo que puede seguir instrucciones simples y responder preguntas en formato de chat.
- Herencia de razonamiento básico: al derivar de Llama 3.2, conserva la capacidad de resolver problemas de razonamiento elemental, aunque su tamaño limita la complejidad.
- Sin evidencia de soporte de tool calling o function calling: no se documenta esta capacidad en la model card.
- Sin evidencia de capacidades multimodales: no se mencionan entradas de visión, audio ni otras modalidades.
- Capacidades multilingües: no se especifican en la documentación; el modelo base de Llama 3.2 es multilingüe, pero no hay confirmación de que el fine-tuning preserve esta propiedad.

## Casos de uso

- Prototipado de asistentes conversacionales: gracias a su tamaño reducido, permite iterar rápidamente en el desarrollo de chatbots sencillos en entornos con recursos limitados.
- Experimentación con fine-tuning: sirve como base para aprender o enseñar el flujo completo de SFT con TRL y Unsloth, ya que su entrenamiento es asequible.
- Clasificación de texto: puede adaptarse para tareas de análisis de sentimiento, categorización de documentos o detección de spam mediante un ajuste adicional.
- Generación de respuestas para FAQ: en un sistema de atención al cliente simple, puede producir respuestas cortas a preguntas frecuentes sin necesidad de una GPU potente.
- Resumen de documentos breves: puede condensar párrafos o artículos cortos, aunque su ventana de contexto larga permite entradas más extensas.
- Educación y demostraciones: es adecuado para talleres y cursos donde se requiere un modelo pequeño que se pueda ejecutar en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen tablas comparativas de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo. Tampoco se proporcionan mediciones de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB en FP16; entre 0,6 y 1 GB en cuantización de 4 bits (estimación basada en 1.24B de parámetros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, RTX 4090, A10 o T4.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs domésticas de gama media y baja.
- Opciones de despliegue: Transformers (pipeline `text-generation`), vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jlsrls/mainsweep-ctrl-s1-em | 1.24B | 128k | no disponible | Hugging Face |
| unsloth/Llama-3.2-1B-Instruct | 1.24B | 128k | Llama 3.2 Community License | Hugging Face |
| TinyLlama-1.1B-Chat | 1.1B | 2.048 | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de tamaño similar. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas. El modelo base original es la referencia más directa, ya que este fine-tuning parte de él.

## Limitaciones y advertencias

- Licencia no definida: la model card no especifica una licencia clara, lo que impide determinar si el modelo puede utilizarse en proyectos comerciales.
- Entrenamiento opaco: no se documentan los datos de entrenamiento, el procedimiento de SFT ni la configuración de hiperparámetros, lo que dificulta la reproducibilidad y la evaluación de sesgos.
- Riesgo de alucinación: como todos los modelos generativos, puede producir contenido falso o inventado, especialmente en temas desconocidos.
- Tamaño reducido: su capacidad de razonamiento complejo, matemáticas avanzadas y generación de código es limitada en comparación con modelos de mayor escala.
- Sesgos no evaluados: al no conocerse la composición del dataset de entrenamiento, es posible que existan sesgos lingüísticos, culturales o de contenido.
- Contexto largo no garantizado: aunque la ventana teórica es de 128k, en modelos pequeños la degradación del rendimiento en entradas muy largas es común.
- No apto para producción sin evaluación previa: la ausencia de benchmarks y de una licencia clara desaconseja su uso directo en entornos críticos.

## Enlaces

- Hugging Face: https://huggingface.co/jlsrls/mainsweep-ctrl-s1-em
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-1B-Instruct
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/rezvani-portland-state-university/clarifying-em/runs/73gf8jby
- TRL (documentación): https://github.com/huggingface/trl
