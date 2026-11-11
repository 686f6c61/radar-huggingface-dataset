# Easonnoway/ds-llama-8b-dpo

## Resumen

ds-llama-8b-dpo es un ajuste fino de parámetros completos del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicado por el usuario Easonnoway como parte del estudio ImmuneCoT sobre seguridad en modelos de lenguaje. Se trata de una línea base (baseline) entrenada con Optimización Directa de Preferencias (DPO) que sirve como punto de comparación frente al modelo entrenado con la metodología ImmuneCoT (Easonnoway/ds-llama-8b-icot) y frente a la línea base de ajuste supervisado (Easonnoway/ds-llama-8b-sft). El objetivo declarado es medir qué parte del beneficio de seguridad atribuido a ImmuneCoT puede conseguirse únicamente mediante optimización de preferencias offline, sin rollout on-policy ni contexto de disparador privilegiado.

El modelo hereda la arquitectura del destilado de DeepSeek-R1 sobre Llama, con 8.030.261.248 parámetros totales (aproximadamente 8B) y pesos en formato safetensors dentro de un repositorio de 16,1 GB. El ajuste se realizó sobre 1.770 pares de preferencia (939 dañinos y 831 benignos) procedentes del mismo conjunto de muestras IASD empleado en la ejecución de ImmuneCoT, aplicando la pérdida sigmoide estándar de DPO sobre los segmentos de respuesta.

La relevancia del modelo es fundamentalmente metodológica: no está pensado como modelo de producción, sino como referencia de investigación para estudiar la alineación de seguridad, la robustez frente a contenido dañino y el efecto de la optimización de preferencias en presupuestos de datos reducidos. La licencia Apache 2.0 facilita su reutilización, aunque el autor restringe explícitamente el uso previsto a la investigación en seguridad de LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (destilado de DeepSeek-R1 sobre Llama) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de secuencia en entrenamiento: 4.608 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Llama-8B, un transformer decoder-only de aproximadamente 8B parámetros obtenido por destilación de capacidades de razonamiento de DeepSeek-R1 sobre la base de Llama. Sobre esa base se aplica un ajuste fino de parámetros completos con DPO, utilizando TRL DPOTrainer y DeepSpeed ZeRO-2 con offload del optimizador a CPU, en precisión bf16 y con semilla 42.

El conjunto de entrenamiento consta de 1.770 pares de preferencia, de los cuales 939 son dañinos y 831 benignos, extraídos del mismo conjunto de muestras IASD que la ejecución de ImmuneCoT. Para cada muestra, ambas completaciones comparten el mismo prefill de asistente no disparado (CoT ingenua): la completación elegida es la continuación elicitada por el disparador combinado de detección y respuesta (la respuesta inmune que se quiere destilar) y la rechazada es la continuación no disparada del mismo modelo base. Los candidatos se generaron con el modelo base a temperatura 0,7, top_p 0,95 y penalización por repetición 1,2, y se filtraron mediante compuertas de calidad estructural en ambos lados.

Los hiperparámetros incluyen 2 épocas, tamaño de lote efectivo de 32 (4 por dispositivo, 2 acumulaciones, 4 GPU), optimizador AdamW fusionado, tasa de aprendizaje de 5e-7 con decaimiento lineal y sin warmup, beta de 0,1 con pérdida sigmoide, longitud máxima de secuencia de 4.608 tokens y longitud máxima de completación de 2.048 tokens. El autor documenta que una primera ejecución con lr 5e-6 se saturó en unos 12 pasos del optimizador (pérdida 0, margen de recompensas superior a 24), por lo que la versión publicada emplea 5e-7, con una curva de pérdida de 0,67 a 0,01 a lo largo de 112 pasos. Los pesos corresponden al estado final de entrenamiento (checkpoint en el paso 80 de 112; los pasos restantes operan a tasas de 1,4e-7 o menores y apenas modifican los pesos; el guardado del paso 112 falló por falta de espacio en disco).

## Capacidades

- Generación de texto conversacional y de razonamiento, heredadas del destilado de DeepSeek-R1-Distill-Llama-8B.
- Capacidad de cadena de pensamiento (CoT) implícita en el modelo base, empleada en el entrenamiento como prefill no disparado.
- Alineación de seguridad orientada a la detección y respuesta ante contenido dañino, destilada mediante DPO a partir de los pares de preferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación de seguridad: el modelo sirve como línea base DPO para comparar con ImmuneCoT y SFT, permitiendo aislar cuánto del beneficio de seguridad proviene de la optimización de preferencias offline frente a métodos con rollout on-policy.
- Evaluación de robustez frente a contenido dañino: al haberse entrenado con pares dañinos y benignos etiquetados, se puede usar para medir tasas de rechazo y de falsos positivos en conjuntos de evaluación de seguridad.
- Estudio de dinámica de DPO: la documentación detallada de hiperparámetros, saturación de la tasa de aprendizaje y curva de pérdida lo convierte en un caso reproducible para analizar regímenes de entrenamiento con presupuestos de datos reducidos (1.770 pares).
- Comparación de metodologías de destilación de seguridad: permite contrastar la destilación por preferencias con la destilación por SFT sobre el mismo conjunto de datos IASD.
- Reproducción de experimentos académicos: con licencia Apache 2.0 y pesos safetensors, se puede replicar el pipeline con TRL DPOTrainer y DeepSpeed ZeRO-2 en configuraciones de 4 GPU.
- Análisis de sesgos y calibración en modelos de 8B alineados: útil para estudiar cómo el ajuste DPO afecta a la distribución de respuestas y al margen de recompensas en modelos de tamaño medio.
- Desarrollo de filtros de contenido previos a despliegue: como componente de referencia para calibrar clasificadores de seguridad en pipelines de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 24 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 5-6 GB (estimaciones basadas en el número de parámetros, no verificadas en la información proporcionada).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; GPU consumer de 12-16 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 con bf16 y contexto moderado, y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no verificadas en la información proporcionada).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ds-llama-8b-dpo (este) | 8,03B | no disponible | DPO baseline de seguridad | Apache 2.0 | Hugging Face |
| Easonnoway/ds-llama-8b-icot | no disponible | no disponible | ImmuneCoT (método propuesto) | no disponible | Hugging Face |
| Easonnoway/ds-llama-8b-sft | no disponible | no disponible | SFT baseline | no disponible | Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | ~8B | no disponible | Destilado de razonamiento | no disponible | Hugging Face |

Los tres modelos de Easonnoway comparten el mismo modelo base y el mismo conjunto de datos IASD, por lo que la comparación directa entre ellos es el eje central del estudio. Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor restringe explícitamente el uso previsto a la investigación en seguridad de LLM; no está validado para producción.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Llama y de datos de preferencia generados automáticamente, puede heredar sesgos del modelo base y del conjunto IASD.
- Riesgo de alucinación: no cuantificado; el modelo base es un destilado de razonamiento y puede generar cadenas de pensamiento plausibles pero incorrectas.
- Limitaciones de contexto: la longitud máxima de secuencia en entrenamiento es de 4.608 tokens y la de completación de 2.048; el contexto nativo del modelo base no está documentado en la información proporcionada.
- Idiomas: no disponibles; no se ha verificado el soporte multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara un uso previsto exclusivamente de investigación en seguridad; conviene revisar la licencia del modelo base.
- Caveat de producción: los pesos corresponden al paso 80 de 112 y el guardado final falló por falta de disco; aunque el autor indica que los pasos restantes apenas modifican los pesos, no existe un checkpoint verificado del paso 112.
- Tamaño de datos reducido: 1.770 pares de preferencia limitan la generalización de la alineación de seguridad a dominios no cubiertos por IASD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Easonnoway/ds-llama-8b-dpo
- Modelo ImmuneCoT: https://huggingface.co/Easonnoway/ds-llama-8b-icot
- Línea base SFT: https://huggingface.co/Easonnoway/ds-llama-8b-sft
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
