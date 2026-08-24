# SaudF/qwen35-4b-dpo-v6-merged

## Resumen

El modelo `SaudF/qwen35-4b-dpo-v6-merged` es un ajuste fino conversacional del modelo base `unsloth/Qwen3.5-4B`, desarrollado por SaudF, orientado al dialecto saudí del árabe. Se trata de un merge directo de los pesos del modelo base con un adaptador LoRA (`aziz9788/qwen35-saudidraft-full-final-adapter`) utilizando una receta de fusión con `lora_alpha=22`, `r=32` y `rsLoRA`. El resultado es un modelo autónomo de 4,66 mil millones de parámetros que puede cargarse directamente con Transformers o vLLM, sin necesidad de adaptadores externos.

El modelo hereda las capacidades multimodales del Qwen3.5-4B (procesamiento de imagen y texto), aunque el ajuste se centra en la generación de conversaciones en árabe dialectal saudí. Su relevancia radica en ofrecer una alternativa ligera y de código abierto (licencia Apache 2.0) para aplicaciones de procesamiento de lenguaje natural en una variedad lingüística poco cubierta por los modelos generalistas. El contexto nativo de 262 144 tokens permite manejar diálogos largos y documentos extensos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5-4B) |
| Parametros totales | 4 659 865 088 (4,66 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (nativo del modelo base) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Arabe (dialecto saudí) como foco principal; otros idiomas no especificados |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `unsloth/Qwen3.5-4B`, un modelo denso de 4B parámetros con arquitectura transformer multimodal (entrenado con fusión temprana de tokens de imagen y texto). El ajuste se realizó mediante un merge directo de los pesos del modelo base con un adaptador LoRA entrenado específicamente para el dialecto saudí. La receta de fusión emplea `lora_alpha=22`, `r=32` y `rsLoRA`, y no se aplicó la etapa de Identity SFT (supervisión de identidad). El nombre del repositorio sugiere que se utilizó DPO (Direct Preference Optimization) en alguna fase del entrenamiento, aunque la model card no lo confirma explícitamente. El modo de razonamiento (thinking) está desactivado en la configuración del merge.

Los datos de entrenamiento no se detallan en la información disponible, pero por la naturaleza del adaptador (`aziz9788/qwen35-saudidraft-full-final-adapter`) se infiere que consisten en conversaciones y textos en árabe saudí. No se especifica el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto conversacional en árabe dialectal saudí, con estilo natural y coloquial.
- Procesamiento multimodal de imagen y texto (heredado del modelo base Qwen3.5-4B), aunque el ajuste no garantiza un rendimiento óptimo en tareas visuales.
- Manejo de contextos largos gracias a la ventana de 262 144 tokens, útil para diálogos multi-turno y documentos extensos.
- Soporte de tool calling y function calling: no confirmado en la información disponible, aunque el modelo base Qwen3.5-4B lo incluye; el merge podría conservarlo.
- Capacidades multilingües: limitadas al árabe (dialecto saudí) como foco principal; el modelo base soporta múltiples idiomas, pero el ajuste puede degradar el rendimiento en otros.
- Modo de razonamiento (thinking) desactivado, lo que reduce la latencia en inferencia.

## Casos de uso

- Atención al cliente automatizada en Arabia Saudí: el modelo puede gestionar conversaciones multi-turno en dialecto saudí, con una ventana de contexto de 262 144 tokens que permite mantener el historial completo de la interacción y consultar bases de conocimiento extensas.
- Asistentes virtuales para empresas locales: integrable en chatbots de WhatsApp o Telegram para responder consultas en el registro coloquial saudí, mejorando la experiencia del usuario frente a modelos que solo manejan árabe estándar.
- Generación de contenido en redes sociales: redacción de publicaciones, respuestas y comentarios en dialecto saudí para campañas de marketing dirigidas a la población local.
- Transcripción y resumen de conversaciones: dado su contexto largo, puede resumir reuniones o chats extensos en árabe saudí, preservando matices dialectales.
- Traducción informal árabe estándar ↔ saudí: útil para adaptar contenido general al dialecto local, aunque no se han publicado métricas de calidad.
- Prototipado de aplicaciones de NLP en árabe: al ser un modelo pequeño (4,66 B) y con licencia Apache 2.0, es adecuado para investigación y desarrollo rápido en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una suite de evaluación interna (`full_suite_no_reasoning_saudidraft_direct_20260822_200129_pre_identity`), pero no se proporcionan los valores numéricos. No se dispone de comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4,66 B parámetros en FP16, lo que requiere aproximadamente 9,3 GB de VRAM sin cuantizar. Con cuantización a 8 bits (~4,7 GB) o 4 bits (~2,5 GB) puede ejecutarse en GPUs de consumo.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 (para FP16); GPUs con 8 GB o más de VRAM son suficientes con cuantización.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización GGUF o AWQ.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers (carga directa como modelo autónomo).
- Latencia y throughput: no disponibles; al ser un modelo denso de 4B, se espera una latencia baja en GPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| SaudF/qwen35-4b-dpo-v6-merged | 4,66 B | 262 144 | Dialecto saudí (merge DPO) | Apache 2.0 |
| AyoubChLin/Qwen3.5-4B-saudi-dialect | 4,66 B | 262 144 | Dialecto saudí (SFT) | Apache 2.0 |
| unsloth/Qwen3.5-4B (base) | 4,66 B | 262 144 | Multimodal general | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal radica en la técnica de ajuste (merge con DPO vs. SFT) y en la ausencia de Identity SFT en el modelo de SaudF, lo que puede afectar la consistencia de la identidad del asistente.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado específicamente en dialecto saudí, puede presentar sesgos culturales y regionales propios de esa variedad lingüística.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; como todo modelo generativo, puede inventar información, especialmente en temas especializados.
- Limitaciones de idioma: el ajuste puede degradar el rendimiento en árabe estándar y en otros idiomas; no se recomienda su uso fuera del contexto saudí sin evaluación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el modelo base Qwen3.5-4B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Caveat de producción: el modo de razonamiento está desactivado, lo que limita la capacidad de razonamiento complejo en tareas que requieran cadenas de pensamiento.
- Sin datos de benchmarks: no se puede garantizar un nivel de calidad específico; se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SaudF/qwen35-4b-dpo-v6-merged
- Modelo base (unsloth/Qwen3.5-4B): https://huggingface.co/unsloth/Qwen3.5-4B
- Adaptador original (aziz9788/qwen35-saudidraft-full-final-adapter): https://huggingface.co/aziz9788/qwen35-saudidraft-full-final-adapter
- Modelo similar (AyoubChLin/Qwen3.5-4B-saudi-dialect): https://huggingface.co/AyoubChLin/Qwen3.5-4B-saudi-dialect
- Ficha de Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Guía de Qwen 3.5 (Substack): https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks
