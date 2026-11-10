# hanseungwook/fineweb-edu-llama-3b-from-dyck-wd0p1

## Resumen

FineWeb-Edu Llama 3B — Dyck es un modelo de lenguaje causal base de 3.253.343.232 parámetros desarrollado por el usuario hanseungwook, orientado a la investigación sobre inicialización y transferencia en preentrenamiento. El modelo parte de un transformer pre-preentrenado sobre secuencias sintéticas de Dyck durante 5.000 pasos y después se entrena sobre FineWeb-Edu, un corpus filtrado de texto educativo en inglés. No dispone de ajuste por instrucciones ni de fine-tuning conversacional, por lo que su función es servir como checkpoint base para experimentos controlados.

La relevancia del modelo es metodológica más que de producto: forma parte de una familia de comparaciones (scratch, Dyck y NCA) que comparten presupuesto de entrenamiento, semilla, tasa de aprendizaje y weight decay, lo que permite aislar el efecto de la inicialización sobre el resultado final. La versión publicada corresponde al checkpoint final del paso 23.478, en safetensors FP32 y con tokenizador GPT-2.

Arquitectura Llama, contexto de 2.048 tokens, 98,47B tokens nominales de FineWeb-Edu, licencia no especificada y soporte únicamente de inglés. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (según tags y config) |
| Parámetros totales | 3.253.343.232 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama con embeddings de entrada y cabeza de salida no atados (untied output head). El entrenamiento se divide en dos fases: primero, un pre-preentrenamiento sobre secuencias sintéticas de Dyck durante 5.000 pasos; después, un entrenamiento de lenguaje causal sobre FineWeb-Edu con un presupuesto nominal de 98,47B tokens (calculado como pasos del optimizador × batch efectivo de 2.048 × longitud de contexto de 2.048, excluyendo trabajo repetido antes de reanudaciones). La tasa de aprendizaje fue de 0,0001, el weight decay de 0,1 y la semilla 0.

Un detalle técnico relevante es el reinicio de la inicialización al comenzar la fase de texto: los embeddings de entrada usaron una normal N(mean=0, std=1) y la cabeza de salida no atada usó la inicialización uniforme por defecto de las capas lineales de PyTorch. Esta información histórica queda registrada en `config.json` bajo `training_initialization`. No se documenta uso de RLHF, DPO ni ningún ajuste posterior al preentrenamiento; tampoco se mencionan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto causal en inglés, sin ajuste por instrucciones ni formato conversacional.
- Modelado de lenguaje base: continuación de texto y estimación de probabilidad de secuencias.
- Razonamiento y código: no se documentan capacidades específicas ni evaluaciones al respecto.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Uso previsto como checkpoint de investigación para estudiar transferencia desde tareas sintéticas (Dyck) al lenguaje natural.

## Casos de uso

- Investigación sobre inicialización y transferencia: comparar este checkpoint con `fineweb-edu-llama-3b-scratch-wd0p1` y `fineweb-edu-llama-3b-from-nca-wd0p1`, que comparten presupuesto, semilla, tasa de aprendizaje y weight decay, para aislar el efecto de la pre-preinicialización con Dyck.
- Reproducción de experimentos de preentrenamiento a escala 3B: el modelo permite validar pipelines de entrenamiento con 98,47B tokens y contexto de 2.048 sin partir de cero.
- Estudio de dinámica de embeddings: al conocerse la inicialización exacta de embeddings (N(0,1)) y de la cabeza de salida, se pueden analizar desplazamientos de representaciones durante el preentrenamiento.
- Punto de partida para fine-tuning supervisado: al ser un modelo base en inglés, puede servir como inicialización para tareas downstream tras un ajuste específico, aunque sin garantías de rendimiento publicadas.
- Evaluación de pérdida de validación en corpus educativos: útil para medir la calidad del modelado de lenguaje sobre FineWeb-Edu (pérdida de validación registrada de 2,5709 en el paso 23.000).
- Análisis de paridad numérica y conversión de checkpoints: el repo incluye `conversion_report.json` con paridad de logits nativos/HF a lo largo de todo el contexto, igualdad exacta de tensores tras recarga y paridad de tokenizador, lo que facilita auditorías de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la pérdida de validación registrada durante el entrenamiento: 2,5709 en el paso 23.000, antes del checkpoint final, y el autor advierte explícitamente de que no es una evaluación nueva de los pesos liberados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 13 GB solo para pesos (3,25B parámetros × 4 bytes), más memoria para activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB.
- VRAM estimada en FP16/BF16: aproximadamente 6,5 GB para pesos; viable en GPUs consumer de 8-12 GB con margen ajustado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,3 GB para pesos; en 4 bits, aproximadamente 1,7 GB.
- GPUs recomendadas: A100 o H100 para FP32 y entrenamiento; RTX 4090 (24 GB) para FP32 o BF16; RTX 3090/4080 (16-24 GB) para BF16.
- GPU consumer: sí, cabe en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8 GB.
- Opciones de despliegue: transformers (carga documentada con `AutoModelForCausalLM`), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp, Ollama o vLLM requerirían conversión a GGUF u otros formatos no publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fineweb-edu-llama-3b-from-dyck-wd0p1 | 3,25B | 2.048 | 98,47B (FineWeb-Edu) | No disponible | Hugging Face |
| fineweb-edu-llama-3b-scratch-wd0p1 | 3,25B (misma familia) | 2.048 | ~98B (FineWeb-Edu) | No disponible | Hugging Face |
| fineweb-edu-llama-3b-from-nca-wd0p1 | 3,25B (misma familia) | 2.048 | ~98B (FineWeb-Edu) | No disponible | Hugging Face |
| fineweb-edu-llama-1.6b-from-dyck | ~1,6B | No disponible | ~32B (FineWeb-Edu) | No disponible | Hugging Face |

La comparación más directa es con los otros dos checkpoints de 3B de la misma familia (scratch y NCA), que comparten presupuesto de texto, semilla, tasa de aprendizaje y weight decay, y difieren únicamente en la inicialización. No se dispone de datos de benchmarks que permitan comparar rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni chat: no sigue instrucciones de forma fiable y no debe usarse directamente como asistente.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Contexto corto (2.048 tokens) en comparación con modelos actuales.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Riesgo de alucinación y sesgos inherente a un modelo de lenguaje preentrenado sobre un corpus web filtrado, sin mitigaciones documentadas (no hay RLHF ni DPO).
- La pérdida de validación reportada (2,5709 en el paso 23.000) corresponde al entrenamiento y no a una evaluación independiente de los pesos publicados.
- Sin datos de benchmarks, no es posible estimar su calidad relativa frente a modelos base de tamaño similar.
- Orientado a investigación: su valor está en el diseño experimental controlado, no en el rendimiento absoluto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-from-dyck-wd0p1
- Checkpoint scratch 3B: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-scratch-wd0p1
- Checkpoint NCA 3B: https://huggingface.co/hanseungwook/fineweb-edu-llama-3b-from-nca-wd0p1
- Checkpoint Dyck 1.6B: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-dyck
- Checkpoint scratch 1.6B: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-scratch
- Checkpoint NCA 1.6B: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-nca
- Run de entrenamiento en Weights & Biases: https://wandb.ai/hanseungwook/fineweb-edu-98b-3b-pt/runs/rqwx41i5
