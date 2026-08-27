# iromu/Qwen3-0.6B-tools-NVFP4

## Resumen

El modelo `iromu/Qwen3-0.6B-tools-NVFP4` es una cuantización NVFP4 del modelo Qwen3-0.6B, fine-tuneado con LoRA para tool calling y flujos de agente. Lo desarrolla el usuario iromu sobre la base de Qwen/Qwen3-0.6B, y está pensado para entornos de inferencia ligera en hardware NVIDIA Blackwell (GB10 / DGX Spark). El problema que resuelve es el de disponer de un modelo pequeño, eficiente y especializado en interacciones estructuradas con herramientas, sin necesidad de un despliegue masivo.

La relevancia actual radica en la creciente demanda de asistentes locales y agentes ligeros que puedan ejecutar funciones externas con baja latencia. Al estar cuantizado a NVFP4 (4 bits) y entrenado específicamente sobre un dataset de destilación de interacciones tool/agent, ofrece una alternativa compacta a modelos más grandes para escenarios donde el coste computacional es crítico. La arquitectura es un transformer denso de 0.6B parámetros, con una longitud de secuencia de entrenamiento de 4096 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-0.6B) |
| Parametros totales | 375.848.960 (0.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 (secuencia de entrenamiento) |
| Tipos de cuantizacion | NVFP4 (FP4 e2m1 pesos + FP8 e4m3 escalas de bloque, grupo 16) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP4 empaquetado en U8, escalas FP8) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer denso de la familia Qwen3. El fine-tuning se realizó con LoRA (rank 32, alpha 32, dropout 0.05) sobre los módulos `*.proj`, utilizando NVIDIA NeMo AutoModel. La configuración de entrenamiento incluye una longitud de secuencia de 4096, batch efectivo de 64 (micro batch 2, acumulación de gradientes 32), 336 pasos, learning rate 5e-5, weight decay 0.01 y optimizador AdamW. La pérdida es cross entropy enmascarada, con el enmascaramiento de contenido de razonamiento deshabilitado.

El dataset empleado es la parte `sft_tools` de `r0b0tlab/qwen3.8-max-glm5.2-kimi-k3-distillation`, que contiene ejemplos de interacciones tool/agent. Posteriormente, el modelo se cuantizó a NVFP4 con NVIDIA ModelOpt 0.46.0, calibrado sobre 32 muestras del split de entrenamiento. NVFP4 es un formato nativo de las GPUs Blackwell, lo que permite una inferencia optimizada sin conversión adicional.

## Capacidades

- Tool calling y function calling: el modelo está específicamente entrenado para invocar funciones externas de forma estructurada.
- Workflows de agente: soporta interacciones multi-paso con herramientas, adecuado para agentes autónomos.
- Interacciones estructuradas con herramientas: genera respuestas que siguen formatos de llamada a función.
- Asistentes locales ligeros: al ser un modelo de 0.6B cuantizado, puede ejecutarse en entornos con recursos limitados.
- Generación de texto: conserva las capacidades básicas de generación del modelo base, aunque su especialización es el tool calling.
- No se especifica soporte de modo thinking (el reasoning content masking está deshabilitado en el entrenamiento).

## Casos de uso

- Asistentes personales locales en hardware Blackwell: el modelo puede gestionar conversaciones y ejecutar acciones como consultar el tiempo, buscar información o controlar dispositivos, gracias a su tool calling nativo y su bajo consumo de recursos.
- Automatización de tareas con APIs: integrado en un agente, puede llamar a funciones REST para actualizar registros, enviar mensajes o recuperar datos, con una latencia mínima en GPUs como DGX Spark.
- Agentes de soporte técnico: en entornos de atención al cliente, el modelo puede derivar consultas a sistemas externos (tickets, bases de conocimiento) mediante function calling, manteniendo un diálogo coherente.
- Prototipado rápido de agentes: por su tamaño reducido, es ideal para experimentar con arquitecturas de agentes y tool calling en fases de desarrollo, sin necesidad de infraestructura costosa.
- Despliegue en edge con TensorRT-LLM: al cargar el checkpoint directamente con `trtllm-serve`, se puede servir en dispositivos Blackwell con baja latencia, adecuado para aplicaciones en tiempo real.
- Educación e investigación: sirve como ejemplo práctico de fine-tuning con LoRA y cuantización NVFP4 para tool calling, permitiendo estudiar el comportamiento de modelos pequeños en tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo específico.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 0.6 GB, por lo que cabe en GPUs con al menos 2 GB de VRAM, aunque el formato NVFP4 requiere hardware Blackwell para su ejecución nativa.
- GPU recomendadas: NVIDIA GB10 (DGX Spark) o cualquier GPU de la arquitectura Blackwell. En GPUs de generaciones anteriores (Ampere, Ada Lovelace) el formato NVFP4 podría no ser soportado o requerir conversión.
- Compatibilidad con consumer GPU: no se garantiza, ya que NVFP4 es nativo de Blackwell; en GPUs consumer actuales (RTX 40 series) no funcionaría sin adaptación.
- Opciones de despliegue: TensorRT-LLM (mediante `trtllm-serve`), y es compatible con text-generation-inference (según las etiquetas del repositorio). No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Especialización |
|---|---|---|---|---|---|
| iromu/Qwen3-0.6B-tools-NVFP4 | 0.6B | 4096 (entrenamiento) | NVFP4 | Apache-2.0 | Tool calling y agentes |
| Qwen/Qwen3-0.6B (base) | 0.6B | No especificado | FP16/BF16 | Apache-2.0 | Generación general, con modo thinking |
| NVFP4/Qwen3-0.6B-FP4 | 0.6B | No especificado | NVFP4 | Apache-2.0 | Cuantización sin fine-tuning específico |

La comparativa se basa en los datos disponibles; el modelo base Qwen3-0.6B tiene capacidades generales de razonamiento, mientras que el modelo de iromu está especializado en tool calling. El otro modelo NVFP4 es una cuantización directa sin fine-tuning, por lo que no ofrece la misma optimización para agentes.

## Limitaciones y advertencias

- Modelo pequeño: no es un reemplazo de modelos Qwen3 más grandes; su rendimiento en tareas complejas de razonamiento será limitado.
- Solo inglés: el entrenamiento y la model card indican únicamente soporte para inglés.
- Especialización estrecha: al estar fine-tuneado exclusivamente para tool calling, puede degradar su rendimiento en tareas generales de generación de texto.
- Requisito de hardware específico: la cuantización NVFP4 es nativa de Blackwell; en otras arquitecturas puede no funcionar o requerir conversión, lo que limita su portabilidad.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que el rendimiento real en tareas de agente es desconocido.
- Riesgo de alucinación: como cualquier modelo pequeño, puede generar llamadas a funciones incorrectas o inventar herramientas inexistentes.
- Dataset de destilación: al entrenarse sobre destilaciones de otros modelos, puede heredar sesgos o errores de los modelos originales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iromu/Qwen3-0.6B-tools-NVFP4
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
- Guía completa de Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
- Repositorio GitHub de referencia: https://github.com/lsb/Qwen3-0.6B
- Modelo NVFP4/Qwen3-0.6B-FP4: https://huggingface.co/NVFP4/Qwen3-0.6B-FP4
