# OP12138/ds-llama-8b-advchain

## Resumen

`OP12138/ds-llama-8b-advchain` es un ajuste fino supervisado (SFT) de parámetros completos sobre el modelo `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`, publicado por el usuario OP12138 en Hugging Face. Se trata de un experimento de especialización orientado al corpus AdvChain, con un conjunto de entrenamiento de solo 974 ejemplos y cinco épocas de entrenamiento sobre dos NVIDIA A800. No se trata de un modelo nuevo entrenado desde cero, sino de una adaptación del distill de DeepSeek R1 sobre la arquitectura Llama de 8B.

El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.030.261.248 parámetros totales confirmados por los pesos en safetensors. Su interés es limitado para producción general, pero resulta relevante como ejemplo de ajuste fino completo sobre un modelo de razonamiento destilado, y para quienes quieran evaluar si un SFT pequeño sobre AdvChain mejora comportamientos específicos de razonamiento encadenado.

La información publicada por el autor es escasa: no hay resultados de benchmarks, no se especifica la licencia, no se detallan los idiomas soportados y los ejemplos de entrenamiento no se distribuyen. Cualquier evaluación rigurosa queda por tanto pendiente de validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B, ajustado desde DeepSeek-R1-Distill-Llama-8B) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base DeepSeek-R1-Distill-Llama-8B soporta 131.072 tokens según DeepSeek) |
| Tipos de cuantización | No disponible explícitamente; los pesos se publican en safetensors, aptos para cuantización posterior a GGUF, AWQ, GPTQ, etc. |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`, un distill de DeepSeek R1 sobre la arquitectura Llama 3.1 8B. DeepSeek entrenó ese modelo base mediante destilación de trayectorias de razonamiento generadas por DeepSeek-R1, lo que le confiere capacidad de producir cadenas de pensamiento antes de la respuesta final. La arquitectura es un transformer decoder-only denso con atención multi-cabeza estándar, 8.000 millones de parámetros y un tokenizador Llama 3.

El ajuste realizado por OP12138 es un SFT de parámetros completos (no LoRA) sobre 974 ejemplos del corpus AdvChain, durante 5 épocas, con learning rate 1e-5, batch global de 128 y 40 pasos de optimizador sobre 2 × NVIDIA A800. La pérdida final registrada en el último paso fue 0.4135, mientras que la pérdida media reportada por el trainer fue 0.8742; el autor aclara explícitamente que son estadísticas distintas y que no se incluye ninguna evaluación downstream. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del propio SFT.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del modelo base.
- Razonamiento encadenado (estilo chain-of-thought) gracias a la destilación de DeepSeek R1, aunque el SFT sobre AdvChain puede haber modificado el formato de razonamiento esperado.
- Generación de código y resolución de problemas matemáticos, capacidades propias del modelo base.
- Soporte de plantilla de chat incluida en el repositorio (chat template).
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de ajuste fino completo: el modelo sirve como referencia reproducible para estudiar el efecto de un SFT de 974 ejemplos sobre un distill de razonamiento, comparando su comportamiento con el modelo base.
- Investigación sobre razonamiento encadenado: permite analizar si el SFT sobre AdvChain preserva, mejora o degrada las cadenas de pensamiento generadas por el modelo original.
- Prototipado de asistentes conversacionales especializados: al conservar la plantilla de chat y el pipeline de text-generation, puede desplegarse en entornos de prueba con TGI o transformers para validar diálogos multi-turno.
- Generación de código en entornos controlados: el modelo base tiene capacidad de código; este ajuste puede usarse para comparar la degradación o mejora en tareas de programación tras el SFT.
- Estudio de catástrofe de olvido: con solo 40 pasos de optimizador sobre un dataset pequeño, es un caso útil para medir cuánto se degradan capacidades generales del modelo base.
- Base para nuevos ajustes: al ser un checkpoint completo en safetensors, puede servir como punto de partida para experimentos posteriores de SFT o DPO en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que esta release no incluye evaluación downstream.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; se recomiendan 24 GB o más para contextos largos.
- Cuantización a 8 bits: en torno a 8-9 GB de VRAM; cuantización a 4 bits: en torno a 5-6 GB, lo que permite ejecución en GPUs consumer.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, A800 (usadas en el entrenamiento) para FP16; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) para cuantización 8 o 4 bits.
- Cabe en GPU consumer: sí, en RTX 3090/4090 con cuantización 4 u 8 bits; en GPUs de 16 GB conviene cuantización 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| OP12138/ds-llama-8b-advchain | 8,03 B | No disponible | No disponible | Hugging Face | SFT completo sobre 974 ejemplos AdvChain, sin benchmarks |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8,03 B | 131.072 tokens (según DeepSeek) | Licencia Llama 3.1 (según DeepSeek) | Hugging Face | Modelo base, con benchmarks publicados por DeepSeek |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Licencia comunitaria Llama 3.1 | Hugging Face | Modelo generalista con evaluación publicada |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | Apache 2.0 | Hugging Face | Alternativa con licencia permisiva y benchmarks públicos |

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia de que el ajuste mejore al modelo base en ninguna tarea concreta.
- El dataset AdvChain no se distribuye, lo que impide reproducir el entrenamiento.
- Solo 974 ejemplos y 40 pasos de optimizador: riesgo elevado de sobreajuste y de catástrofe de olvido sobre las capacidades generales del modelo base.
- Licencia no especificada: no puede asumirse uso comercial sin consultar al autor y verificar la licencia del modelo base (Llama 3.1).
- Idiomas no documentados: se desconoce si el SFT afectó al multilingüismo del modelo original.
- Riesgo de alucinación inherente a los modelos de 8B y al formato de razonamiento destilado; sin evaluación no puede cuantificarse.
- El modelo base DeepSeek-R1-Distill-Llama-8B puede generar cadenas de razonamiento largas, con impacto en latencia y coste de inferencia.
- Sin información sobre sesgos conocidos ni sobre el proceso de filtrado de datos del corpus AdvChain.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/OP12138/ds-llama-8b-advchain
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
