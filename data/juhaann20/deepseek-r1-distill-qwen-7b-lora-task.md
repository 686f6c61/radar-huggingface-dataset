# Juhaann20/DeepSeek-R1-Distill-Qwen-7B-LoRA-Task

## Resumen

DeepSeek-R1-Distill-Qwen-7B-LoRA-Task es un ajuste fino (fine-tuning) mediante LoRA del modelo destilado DeepSeek-R1-Distill-Qwen-7B, publicado por el usuario Juhaann20 en Hugging Face. El modelo base es la destilación de DeepSeek-R1 sobre la arquitectura Qwen2 de 7.000 millones de parámetros, un modelo denso de tipo causal decoder-only orientado a generación de texto y razonamiento. Este ajuste concreto se ha entrenado utilizando la librería Unsloth y TRL de Hugging Face, lo que reduce el coste computacional del entrenamiento.

El modelo resultante mantiene la arquitectura Qwen2 y un total de 7.615.616.512 parámetros (según los pesos en safetensors), con licencia Apache 2.0 y declarado únicamente para inglés. El repositorio ocupa 15,2 GB y se distribuye en formato safetensors compatible con `transformers` y `text-generation-inference`. El número de descargas (11) y de likes (0) indica que se trata de una publicación de nicho, sin tracción comunitaria relevante.

La relevancia de esta ficha es doble: por un lado, documenta un ajuste LoRA derivado de una de las familias de modelos de razonamiento abierto más influyentes (DeepSeek-R1); por otro, sirve como caso práctico de fine-tuning ligero con Unsloth sobre un modelo ya destilado. No obstante, la model card del autor es mínima y no aporta información sobre el dataset de ajuste, hiperparámetros ni evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base DeepSeek-R1-Distill-Qwen-7B emplea 128K tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo base se publico en bnb-4bit; los pesos del repo estan en safetensors) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only causal de la familia Qwen2, con normalizacion RMSNorm, atención con RoPE y activación SwiGLU, tal como corresponde a la arquitectura del modelo base. Sobre DeepSeek-R1-Distill-Qwen-7B (que a su vez es un Qwen2-7B ajustado con datos de destilación de razonamiento de DeepSeek-R1) se ha aplicado un ajuste fino con LoRA, técnica que congela los pesos originales e introduce matrices de bajo rango entrenables.

El entrenamiento se realizó con Unsloth y TRL, según la model card, lo que implica un pipeline de fine-tuning supervisado (SFT) eficiente en memoria. No se especifica el número de tokens de entrenamiento, la composición del dataset, la longitud de las secuencias, el rango de LoRA, la tasa de aprendizaje ni si se aplicaron etapas de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del propio uso de Unsloth para acelerar el entrenamiento. La información disponible sobre el proceso de ajuste es, por tanto, muy limitada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2 y del ajuste destilado de DeepSeek-R1.
- Razonamiento multi-paso: el modelo base incorpora trazas de razonamiento estilo DeepSeek-R1 (modo "thinking"), aunque no se confirma que el ajuste LoRA preserve este comportamiento de forma explícita.
- Generación de código y resolución de problemas matemáticos, capacidades propias del modelo destilado original.
- Soporte de conversación multi-turno mediante plantilla de chat de Qwen2.
- Compatibilidad con `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`), lo que permite despliegue en endpoints gestionados.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada para este ajuste concreto.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es exclusivamente de texto.
- Capacidades multilingües: limitadas al inglés según la model card, aunque el modelo base Qwen2 tiene cobertura multilingüe más amplia.

## Casos de uso

- Asistente conversacional en inglés para dominios acotados: el ajuste LoRA puede haberse especializado en una tarea concreta (el nombre "Task" lo sugiere), por lo que encaja en despliegues de un solo dominio con prompts controlados.
- Prototipado rápido de aplicaciones de razonamiento: al ser un modelo de 7,6B parámetros, se puede servir en una GPU de 24 GB con cuantización, lo que facilita iterar sobre prompts y evaluar el comportamiento del ajuste.
- Generación de código asistida en entornos de desarrollo: el modelo base destilado de R1 tiene buen rendimiento en tareas de programación; el ajuste puede emplearse para autocompletado o explicación de fragmentos en inglés.
- Investigación sobre fine-tuning con LoRA: sirve como referencia práctica de un pipeline Unsloth + TRL sobre un modelo de razonamiento, útil para reproducir o comparar metodologías de ajuste.
- Generación de documentación técnica y resúmenes: con contexto suficiente (heredado del modelo base), puede procesar documentos largos y producir resúmenes en inglés.
- Evaluación comparativa de destilaciones: útil como punto de comparación frente al modelo base sin ajustar para medir el efecto del LoRA en tareas específicas.
- Despliegue en endpoints compatibles con TGI: al estar etiquetado como `endpoints_compatible`, se puede integrar en infraestructuras de inferencia gestionada sin adaptaciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye métricas de evaluación, y no se dispone de datos que permitan comparar este ajuste con el modelo base ni con alternativas. Cualquier cifra de MMLU, HumanEval o GSM8K atribuida a este modelo concreto sería especulativa y no debe asumirse.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y KV cache (del orden de 18-20 GB en la práctica para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB de pesos, con un total práctico de 10-12 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 4-5 GB de pesos, con un total práctico de 6-8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en FP16 con contextos largos; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 (24 GB) equivalente.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en FP16 con contexto limitado, y en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) con cuantización de 4-8 bits.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), vLLM (compatible con arquitectura Qwen2), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo), y endpoints gestionados por el tag `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Juhaann20/DeepSeek-R1-Distill-Qwen-7B-LoRA-Task | 7,6B | No disponible | Apache 2.0 | Hugging Face (11 descargas) | Ajuste LoRA de nicho, sin benchmarks publicados |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6B | 128K (modelo base) | MIT (según repositorio original) | Hugging Face, ampliamente usado | Modelo base oficial con benchmarks publicados |
| Qwen2-7B | 7,6B | 128K | Apache 2.0 | Hugging Face | Modelo fundacional sin destilación de razonamiento |
| DeepSeek-R1-Distill-Llama-8B | 8B | 128K | MIT (según repositorio original) | Hugging Face | Alternativa destilada sobre arquitectura Llama |

La comparación directa con el modelo base es la más relevante: el ajuste LoRA no documenta mejoras medibles y su licencia Apache 2.0 difiere de la del repositorio oficial de DeepSeek (MIT). Para producción, el modelo base oficial ofrece mayor trazabilidad y soporte comunitario.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar el modelo base, es probable que arrastre sesgos de los datos de preentrenamiento y destilación, pero no hay evaluación al respecto.
- Riesgo de alucinación: presente, como en cualquier modelo generativo de 7B; la ausencia de benchmarks impide cuantificarlo.
- Limitaciones de contexto: la longitud de contexto efectiva de este ajuste no está confirmada; el modelo base soporta 128K, pero el ajuste LoRA podría no preservar ese comportamiento.
- Limitaciones de idioma: declarado solo para inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base deriva de DeepSeek-R1-Distill-Qwen-7B, cuya licencia original (MIT según el repositorio oficial) conviene verificar para cumplir con las obligaciones de atribución.
- Falta de documentación: la model card no detalla dataset, hiperparámetros ni evaluación, lo que dificulta la reproducibilidad y la confianza en producción.
- Tracción mínima: 11 descargas y 0 likes indican ausencia de validación comunitaria; no se recomienda como dependencia crítica sin evaluación propia.
- El repositorio incluye pesos en safetensors de 15,2 GB; no se ofrecen versiones GGUF ni cuantizadas listas para usar, lo que añade trabajo de conversión para despliegues ligeros.

## Enlaces

- Hugging Face: https://huggingface.co/Juhaann20/DeepSeek-R1-Distill-Qwen-7B-LoRA-Task
- Modelo base en Hugging Face: https://huggingface.co/unsloth/DeepSeek-R1-Distill-Qwen-7B-bnb-4bit
- Modelo original DeepSeek-R1-Distill-Qwen-7B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Ficha en Featherless AI: https://featherless.ai/models/Juhaann20/DeepSeek-R1-Distill-Qwen-7B-LoRA-Task
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
