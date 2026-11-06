# Elegbede/distilgpt2-squad

## Resumen

`Elegbede/distilgpt2-squad` es un ajuste fino (fine-tuning) del modelo `distilbert/distilgpt2` publicado en Hugging Face por el usuario Elegbede. Se trata de un modelo de generación de texto de tipo decoder-only basado en la arquitectura GPT-2 destilada, con 81.912.576 parámetros totales y un repositorio de 0,3 GB en formato safetensors. El modelo se ha entrenado con la librería `transformers` mediante `Trainer`, partiendo de distilgpt2 como modelo base.

El nombre del modelo sugiere un ajuste sobre el conjunto de datos SQuAD (Stanford Question Answering Dataset), aunque la model card generada automáticamente indica explícitamente que el dataset de entrenamiento es "unknown" y no aporta detalles sobre la composición de los datos. El modelo alcanza una pérdida de validación de 3,4594 tras 3 épocas de entrenamiento, con un total de solo 39 pasos, lo que indica un ajuste muy ligero sobre el modelo base.

Su relevancia es limitada: se trata de un experimento de ajuste fino de bajo coste, sin benchmarks publicados, sin descargas ni interacciones en el momento de la consulta, y con una model card incompleta. Resulta útil únicamente como ejemplo de pipeline de fine-tuning sobre distilgpt2 o como punto de partida para experimentos educativos, no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 destilado) |
| Parámetros totales | 81.912.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de distilgpt2: 1.024 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (distilgpt2 es principalmente inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `distilgpt2`, un transformer decoder-only destilado de GPT-2. DistilGPT2 se preentrenó con supervisión del GPT-2 más pequeño (124M parámetros) y conserva la arquitectura de GPT-2 con capas reducidas, dando lugar a 81,9M de parámetros. La model card no aporta detalles sobre innovaciones arquitectónicas adicionales ni sobre el preentrenamiento original.

El entrenamiento se realizó con `Trainer` de `transformers` durante 3 épocas, con un learning rate de 2e-05, batch size de 8 (entrenamiento y evaluación), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. El número total de pasos fue de 39, lo que refleja un dataset de entrenamiento muy pequeño. La pérdida de validación descendió de 3,6932 (época 1) a 3,5167 (época 2) y 3,4594 (época 3). No se documenta el uso de RLHF, DPO ni técnicas de alineación. Las versiones de framework fueron Transformers 5.22.0, PyTorch 2.11.0+cpu, Datasets 4.8.5 y Tokenizers 0.23.3.

## Capacidades

- Generación de texto autoregresiva, heredada de distilgpt2.
- Razonamiento básico y coherencia limitada, propia de un modelo de 81,9M de parámetros.
- Generación de código y matemáticas: no documentada y muy limitada por el tamaño del modelo.
- Tool calling / function calling: no soportado de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el modelo base distilgpt2 es principalmente inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- El nombre sugiere un ajuste orientado a tareas de question answering sobre SQuAD, pero la model card no confirma el dataset ni el formato de entrenamiento.

## Casos de uso

- Experimentación educativa con fine-tuning: sirve como ejemplo reproducible de un pipeline `Trainer` sobre distilgpt2, útil para aprender a ajustar modelos pequeños con `transformers`.
- Generación de texto de relleno en prototipos: para maquetas de UI o demos internas donde la calidad del texto no es crítica y se prioriza un modelo de 0,3 GB.
- Pruebas de integración con TGI y endpoints compatibles: el tag `text-generation-inference` y `endpoints_compatible` permite validar despliegues en infraestructura de inferencia de Hugging Face.
- Baseline para comparativas de fine-tuning: como punto de referencia de pérdida (3,4594) frente a otros ajustes sobre distilgpt2 con datasets similares.
- Generación de texto en entornos con recursos muy limitados: al tener 81,9M de parámetros, puede ejecutarse en CPU y en GPUs de gama baja para pruebas de latencia.
- Investigación sobre destilación y ajuste ligero: útil para estudiar cómo afecta un ajuste de solo 39 pasos a un modelo destilado, aunque sin garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del autor contiene una entrada vacía (`results: []`). El único dato de evaluación es la pérdida de validación:

| Métrica | Valor |
|---|---|
| Validation loss (época 1) | 3,6932 |
| Validation loss (época 2) | 3,5167 |
| Validation loss (época 3) | 3,4594 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (81,9M parámetros × 4 bytes ≈ 0,33 GB de pesos, más overhead de activaciones y KV cache). En FP16, aproximadamente 0,16 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 2060, RTX 3060, RTX 4090, etc.), e incluso en Raspberry Pi para inferencia en CPU.
- Opciones de despliegue: `transformers` (PyTorch), Text Generation Inference (TGI, según tags), endpoints compatibles de Hugging Face, y potencialmente llama.cpp/Ollama si se convierte a GGUF (no confirmado).
- Latencia y throughput estimados: no disponibles. Por el tamaño del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Elegbede/distilgpt2-squad | 81,9M | no disponible | apache-2.0 | Hugging Face | Ajuste fino ligero, sin benchmarks |
| distilbert/distilgpt2 | 82M | 1.024 tokens | apache-2.0 | Hugging Face | Modelo base, ampliamente usado |
| openai-community/gpt2 | 124M | 1.024 tokens | MIT | Hugging Face | Modelo original no destilado |
| openai-community/gpt2-medium | 355M | 1.024 tokens | MIT | Hugging Face | Mayor capacidad, más recursos |

La comparativa se limita a modelos de la misma familia y tamaño, ya que no se dispone de benchmarks del modelo evaluado que permitan comparaciones de rendimiento objetivas.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de distilgpt2 y de GPT-2, incluyendo sesgos de género, raza y religión presentes en los datos de preentrenamiento web.
- Riesgo de alucinación: alto, especialmente por el tamaño reducido del modelo y la falta de alineación (no hay RLHF ni DPO documentados).
- Limitaciones de contexto e idioma: contexto probable de 1.024 tokens (heredado de distilgpt2, no confirmado) y sesgo hacia el inglés; el multilingüismo no está documentado.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial, pero el modelo base distilgpt2 también es apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Caveats para producción: la model card está generada automáticamente e incompleta; el dataset de entrenamiento es desconocido; solo 39 pasos de entrenamiento y 3 épocas sobre un dataset no documentado; sin benchmarks; sin descargas ni validación comunitaria. No se recomienda su uso en producción sin una evaluación exhaustiva previa.
- El nombre "squad" sugiere un ajuste para question answering, pero no hay evidencia documentada del formato de entrenamiento ni de la calidad en esa tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elegbede/distilgpt2-squad
- Modelo base distilgpt2: https://huggingface.co/distilbert/distilgpt2
- Endpoint en FriendliAI: https://friendli.ai/models/Deljimae/distilgpt2-squad
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Documentación de Text Generation Inference: https://huggingface.co/docs/text-generation-inference
