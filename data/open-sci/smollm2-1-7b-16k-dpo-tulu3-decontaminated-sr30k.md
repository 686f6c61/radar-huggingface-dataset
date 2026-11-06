# open-sci/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-sr30k

## Resumen

SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-sr30k es un ajuste fino supervisado (SFT) del modelo ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated, publicado por el usuario open-sci en Hugging Face. Se trata de un modelo de generación de texto de 1.711.507.456 parámetros (aproximadamente 1,7 mil millones) construido sobre la arquitectura Llama, derivado en última instancia de la familia SmolLM2 de Hugging Face. El modelo se ha entrenado con el framework LLaMA-Factory sobre el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf.

El modelo resuelve el problema de adaptar un modelo pequeño ya alineado mediante DPO a un conjunto de datos de razonamiento sintético generado por un modelo mayor (gpt-oss-120b), con el objetivo de transferir capacidades de razonamiento a un modelo de 1,7B parámetros. El contexto de 16k tokens (indicado en el nombre del modelo base) lo hace apto para conversaciones multi-turno y tareas de razonamiento de longitud media.

Es relevante ahora porque representa un ejemplo típico de destilación de razonamiento hacia modelos pequeños: un modelo de 1,7B entrenado sobre trazas de un modelo de 120B. La licencia es "other", lo que exige revisar los términos del modelo base antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama) |
| Parametros totales | 1.711.507.456 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16k tokens (segun el nombre del modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (compatible con safetensors; cuantizacion GGUF no confirmada) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo Llama con 1.711.507.456 parámetros, derivado de SmolLM2-1.7B a través de una cadena de ajustes: primero un DPO sobre Tulu3 decontaminado (modelo base inmediato: ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated) y después un SFT completo (full fine-tuning, no LoRA) sobre el dataset Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf.

El entrenamiento se realizó con LLaMA-Factory en 32 dispositivos GPU, con un batch total de 128 (batch size 1, acumulación de gradientes 4), learning rate de 4e-05, scheduler coseno con warmup del 10 %, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-08), semilla 42 y 5 épocas. Se usaron Transformers 4.57.3, PyTorch 2.10.0+cu128, Datasets 4.8.4 y Tokenizers 0.22.2. No se documentan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO tras el SFT.

## Capacidades

- Generación de texto conversacional en formato chat (tag `conversational`).
- Razonamiento de tipo cadena de pensamiento, presumiblemente adquirido del dataset de SFT generado por gpt-oss-120b (30k ejemplos ShareGPT).
- Capacidad de seguir instrucciones heredada del ajuste DPO previo sobre Tulu3.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el dataset de razonamiento sugiere cierta capacidad.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponible.

## Casos de uso

- Destilación de razonamiento en entornos con recursos limitados: el modelo permite desplegar un asistente de razonamiento de 1,7B parámetros en hardware modesto, aprovechando las trazas sintéticas de un modelo de 120B para tareas de lógica y matemáticas básicas.
- Generación de código asistida en local: al estar construido sobre SmolLM2 y ajustado con datos de razonamiento, puede emplearse para autocompletado y explicación de fragmentos de código en entornos de desarrollo sin conexión.
- Chatbots de atención al cliente de bajo coste: el contexto de 16k tokens permite gestionar conversaciones multi-turno con historial largo en infraestructura de una sola GPU consumer.
- Prototipado de pipelines de agentes: sirve como modelo de prueba para validar arquitecturas de agentes y formateo de herramientas antes de migrar a modelos mayores.
- Investigación en alineación y DPO: al ser un artefacto derivado de una cadena DPO + SFT, es útil para estudiar la degradación o transferencia de capacidades en modelos pequeños.
- Evaluación de contaminación de benchmarks: el nombre "decontaminated" del modelo base sugiere su uso en experimentos que requieren controlar la filtración de datos de evaluación.
- Fine-tuning posterior como base: al ser un checkpoint completo en safetensors, puede servir de punto de partida para ajustes específicos de dominio con LLaMA-Factory.

## Benchmarks y rendimiento

La model card declara un `model-index` con la entrada `sft__Superior-Reasoning-SFT-gpt-oss-120b-30k-sharegpt-hf__SmolLM2-1-7-84b86450__fa2-smo-b9e90435`, pero la lista de resultados está vacía. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache (el repositorio ocupa 3,4 GB).
- VRAM estimada en cuantización de 8 bits: alrededor de 1,8-2 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 1-1,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para FP16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más en FP16, y en tarjetas de 4 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están confirmados explícitamente en la información proporcionada, aunque el formato safetensors es compatible con vLLM y TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| open-sci/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-sr30k | 1,71B | 16k (segun nombre) | other | Hugging Face |
| ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated (modelo base) | 1,71B | 16k (segun nombre) | no disponible | Hugging Face |
| HuggingFaceTB/SmolLM2-1.7B | 1,71B | 8k (modelo original SmolLM2) | Apache 2.0 (modelo original) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La model card es autogenerada por el Trainer y contiene secciones "More information needed" en descripción, usos previstos, limitaciones y datos de entrenamiento.
- Licencia "other": es imprescindible revisar los términos del modelo base (ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated) y de SmolLM2 antes de cualquier uso comercial.
- Riesgo de alucinación inherente a un modelo de 1,7B parámetros, especialmente en tareas de razonamiento complejo.
- El dataset de SFT está generado por un modelo mayor (gpt-oss-120b); puede contener errores o sesgos propagados del generador.
- No se documentan idiomas soportados; el comportamiento multilingüe es incierto.
- No hay resultados de benchmarks publicados, por lo que el rendimiento real no está validado.
- El contexto de 16k se infiere del nombre del modelo base, no está confirmado en la model card.
- El entrenamiento con 5 épocas sobre 30k ejemplos en un modelo de 1,7B puede provocar sobreajuste al estilo del dataset.
- No se especifican sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-sci/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated-sr30k
- Modelo base: https://huggingface.co/ali-elganzory/SmolLM2-1.7B-16k-DPO-Tulu3-decontaminated
- Repositorio LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Familia SmolLM2 de Hugging Face: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
