# BernalHR/llama-3.1-8b-instruct-becas-lora-v2

## Resumen

El modelo `BernalHR/llama-3.1-8b-instruct-becas-lora-v2` es un ajuste fino (fine-tune) mediante LoRA del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, que a su vez es una versión cuantizada a 4 bits del Llama 3.1 8B Instruct de Meta. El autor, BernalHR, lo ha publicado bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio tiene un tamaño de 0,2 GB, lo que indica que solo se almacenan los adaptadores LoRA y no los pesos completos del modelo.

El nombre del modelo sugiere que el ajuste se ha realizado en el ámbito de las becas (del inglés "scholarships"), aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni el propósito específico. Al estar basado en Llama 3.1 8B, hereda la arquitectura transformer con 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens. Su relevancia radica en que ofrece un punto de partida ligero y eficiente para tareas relacionadas con la gestión de becas, permitiendo a desarrolladores e investigadores desplegar un asistente especializado sin necesidad de entrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.000 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el repo contiene adaptadores LoRA en safetensors; el modelo base usa bnb-4bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA (Low-Rank Adaptation) sobre `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`. La arquitectura subyacente es la de Llama 3.1 8B: un transformer autoregresivo con normalización RMSNorm, atención por ventanas y 32 capas. El entrenamiento se realizó con la librería Unsloth, que optimiza el fine-tuning mediante kernels de atención y backpropagation eficientes, y con TRL (Transformer Reinforcement Learning) para el pipeline de ajuste instructivo. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El uso de LoRA implica que solo se actualizaron matrices de bajo rango en las capas de atención y MLP, lo que reduce drásticamente el coste de entrenamiento y el tamaño del artefacto final (0,2 GB).

## Capacidades

- Generación de texto e instrucciones: al ser un fine-tune de Llama 3.1 Instruct, mantiene la capacidad de seguir instrucciones y mantener conversaciones multi-turno.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base en tareas de razonamiento, conocimiento factual y comprensión lectora.
- Generación de código: Llama 3.1 8B Instruct muestra un rendimiento notable en tareas de programación para su tamaño, capacidad que se conserva en el fine-tune.
- Multilingüismo: aunque la model card indica solo inglés, el modelo base soporta varios idiomas; no se ha verificado si el fine-tune conserva esta capacidad.
- Tool calling: el modelo base soporta function calling, pero no hay evidencia de que el fine-tune la haya preservado o modificado.
- No se dispone de información sobre capacidades especiales como modo de pensamiento, visión o audio.

## Casos de uso

- Asistente para solicitudes de becas: el nombre del modelo sugiere que puede responder preguntas sobre requisitos, plazos y documentación de becas, aunque no hay documentación que lo confirme.
- Clasificación y filtrado de candidaturas: un sistema podría usar el modelo para evaluar elegibilidad de solicitantes a partir de descripciones textuales.
- Generación de cartas de motivación: el modelo puede redactar borradores de cartas personalizadas para solicitudes de becas.
- Chatbot institucional: integrado en portales universitarios o de fundaciones para resolver dudas frecuentes sobre ayudas al estudio.
- Extracción de información de convocatorias: dado un texto de una convocatoria, el modelo puede resumir condiciones y requisitos clave.
- Fine-tuning adicional: al ser un adaptador LoRA ligero, puede servir como base para ajustes posteriores en dominios específicos con bajo coste computacional.

Nota: estos casos son hipotéticos basados en el nombre del modelo y las capacidades del modelo base; no hay información oficial sobre el propósito del fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la model card. Tampoco se dispone de evaluaciones independientes del fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA, se puede cargar sobre el modelo base cuantizado. Con cuantización 4 bits, el modelo base ocupa aproximadamente 4-5 GB de VRAM; con 8 bits, unos 8 GB; en FP16, unos 16 GB. El adaptador añade un coste despreciable.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para cuantización 4 bits (por ejemplo, RTX 3060, RTX 4060). Para FP16 se recomienda una GPU con 16 GB o más (RTX 4090, A100).
- Compatibilidad con GPU de consumo: sí, con cuantización 4 bits cabe en GPUs de gama media como RTX 3060 o RTX 4060.
- Opciones de despliegue: al usar el formato safetensors y la librería transformers, es compatible con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) y Ollama (mediante conversión).
- Latencia y throughput: no se dispone de mediciones específicas. Para un modelo de 8B en 4 bits, se puede esperar una generación de 20-40 tokens por segundo en una RTX 4090, pero estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| BernalHR/llama-3.1-8b-instruct-becas-lora-v2 | 8B (base) | 128k | Apache-2.0 | LoRA safetensors | Fine-tune especializado, sin benchmarks publicados |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | safetensors | Modelo base original, con benchmarks ampliamente documentados |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache-2.0 | safetensors | Alternativa de tamaño similar, contexto menor, sin fine-tune específico |

La comparación se realiza con el modelo base y con una alternativa de tamaño similar. El fine-tune de BernalHR no añade capacidades nuevas respecto al base, pero ofrece un adaptador ligero y con licencia permisiva. La principal diferencia con Mistral-7B es el contexto (128k frente a 32k) y el rendimiento en tareas de instrucción, donde Llama 3.1 suele superar a Mistral 7B en benchmarks estándar.

## Limitaciones y advertencias

- No hay información sobre el dataset de entrenamiento, por lo que se desconoce si el modelo presenta sesgos específicos o alucinaciones en el dominio de becas.
- El modelo solo declara soporte para inglés; su rendimiento en otros idiomas no está garantizado.
- Al ser un adaptador LoRA, requiere cargar el modelo base por separado; no es un modelo autónomo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia (Llama 3.1 Community License) que impone condiciones adicionales, como la atribución y restricciones para usuarios con más de 700 millones de usuarios mensuales. Es necesario cumplir ambas licencias.
- No se han publicado evaluaciones de seguridad, robustez o sesgos del fine-tune.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BernalHR/llama-3.1-8b-instruct-becas-lora-v2
- Modelo base (unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de Llama 3 de Meta: https://github.com/meta-llama/llama3
- Página de desarrolladores de Meta para Llama 3: https://developer.meta.com/ai/models/llama-3/
- Ficha de especificaciones de Llama 3.1 8B Instruct en LocalLLMs: https://localllms.dev/llm/meta-llamallama-31-8b-instruct/
