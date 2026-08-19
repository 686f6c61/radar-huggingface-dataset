# francescortu/DistillDetect-Qwen2.5-1.5B-from-Qwen3-8B-s1

## Resumen

DistillDetect-Qwen2.5-1.5B-from-Qwen3-8B-s1 es una reproducción no oficial del modelo estudiante destilado descrito en el artículo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692). El objetivo del trabajo original es detectar si un texto ha sido generado por un modelo que ha sido destilado a partir de un profesor, comparando la salida con una referencia. Este repositorio, creado por francescortu, reentrena el modelo base Qwen2.5-1.5B utilizando los datos y el código publicados por los autores del paper, con Qwen3-8B como profesor. No está afiliado a los autores originales, que no liberaron checkpoints del estudiante.

El modelo resultante es un transformer denso decoder-only de 1.543.714.304 parámetros, con una ventana de contexto heredada de Qwen2.5 (128K tokens). Se entrenó mediante fine-tuning supervisado (SFT) sobre 1000 respuestas generadas por el profesor, con una receta de 3 épocas, tasa de aprendizaje 1e-5 y pérdida calculada únicamente sobre los tokens de respuesta. Su relevancia radica en ofrecer una implementación reproducible de un detector de destilación, un campo emergente para auditar la procedencia de textos generados por IA. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (heredada de Qwen2.5-1.5B) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, cuantizable con herramientas estándar) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 es multilingüe, pero no se especifica para esta reproducción) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una instancia de Qwen2.5-1.5B, un transformer denso decoder-only con atención causal estándar, normalización RMSNorm y embeddings rotatorios (RoPE). No emplea mezcla de expertos ni arquitecturas híbridas. El entrenamiento consistió en un fine-tuning supervisado (SFT) sobre el subconjunto s1 del dataset del paper, compuesto por 1000 prompts con respuestas generadas por el profesor Qwen3-8B. La receta sigue el Apéndice A del artículo: 3 épocas, tasa de aprendizaje 1e-5 con scheduler coseno y 5% de warmup, batch efectivo de 16 (per-device 4 con grad-accum 4), tamaño de bloque de 4096 tokens, precisión bf16 y gradient checkpointing. La pérdida se calcula únicamente sobre los tokens de respuesta, enmascarando el prompt con -100. No se aplicaron técnicas de RLHF ni DPO; es un SFT puro. La innovación principal no está en la arquitectura, sino en el objetivo de la tarea: clasificar si una respuesta proviene de un modelo destilado, comparándola con una referencia generada por el profesor.

## Capacidades

- Detección de texto generado por modelos destilados: según el paper, el modelo puede distinguir si una respuesta ha sido producida por un estudiante destilado a partir de un profesor, usando la referencia del profesor como base de comparación.
- Generación de texto: al estar basado en Qwen2.5-1.5B, conserva las capacidades generativas del modelo base, aunque su fine-tuning está orientado a la detección.
- Razonamiento básico y matemáticas simples: heredado del modelo base, aunque no se han publicado evaluaciones específicas.
- Soporte de tool calling / function calling: no disponible; no se menciona en la documentación y el modelo base Qwen2.5-1.5B no lo incluye de forma nativa.
- Soporte de agentes y multi-step reasoning: no disponible; no se ha entrenado para ello.
- Capacidades multilingües: no especificadas para esta reproducción, aunque el modelo base Qwen2.5 soporta múltiples idiomas.
- Capacidades especiales: ninguna adicional (sin modo thinking, visión ni audio).

## Casos de uso

- Auditoría de modelos de IA: el modelo puede emplearse para verificar si un sistema de generación de texto ha sido destilado ilegítimamente a partir de un profesor propietario, comparando sus salidas con las de un modelo de referencia. Es adecuado por su tamaño reducido, que permite desplegarlo en entornos con recursos limitados.
- Control de calidad en pipelines de generación: en un flujo donde se usan modelos destilados para reducir costes, este detector puede señalar cuándo una respuesta se aleja del comportamiento esperado del profesor, ayudando a mantener la coherencia.
- Detección de plagio académico: dado que el modelo compara respuestas con una referencia, puede adaptarse para identificar textos generados por IA que imitan a un modelo concreto, útil en entornos educativos.
- Investigación en seguridad de IA: sirve como herramienta de análisis forense para estudiar la procedencia de textos sintéticos, especialmente en escenarios donde se sospecha destilación no autorizada.
- Evaluación de robustez de modelos: permite comprobar si un modelo destilado conserva las características del profesor, midiendo la similitud entre sus salidas y las del modelo original.
- Prototipado rápido de detectores de IA: al ser una reproducción ligera y con licencia permisiva, puede usarse como punto de partida para experimentos de detección de contenido generado por máquinas, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las evaluaciones de GSM8K y MATH500 están pendientes de cálculo y se añadirán posteriormente. No se proporcionan datos de MMLU, HumanEval ni otras pruebas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, aproximadamente 1 GB; con 8 bits, alrededor de 2 GB; en fp16, unos 3 GB. Estas cifras son orientativas para un modelo de 1.5B de parámetros.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA RTX 3060, RTX 4060 o superiores. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en la mayoría de tarjetas gráficas de consumo actuales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y cualquier framework compatible con safetensors y arquitectura Qwen2.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DistillDetect-Qwen2.5-1.5B (este) | 1.54B | 128K | Apache 2.0 | Detección de destilación |
| Qwen2.5-1.5B (base) | 1.54B | 128K | Apache 2.0 | Generación general |
| Qwen3-8B (profesor) | 8B | 128K (estimado) | Apache 2.0 | Generación general |

No se dispone de benchmarks comparativos entre estos modelos. La diferencia principal radica en el fine-tuning específico para detección de destilación, mientras que el base y el profesor son modelos de propósito general. El profesor tiene 8B de parámetros, lo que implica mayores requisitos de hardware, pero también mayor capacidad de razonamiento. No se han encontrado otros modelos de detección de destilación comparables en el ecosistema abierto.

## Limitaciones y advertencias

- Reproducción no oficial: no está validada por los autores del paper, por lo que su comportamiento puede diferir del modelo original descrito en el artículo.
- Datos de entrenamiento limitados: solo 1000 ejemplos, lo que puede provocar overfitting y una generalización pobre fuera del dominio de los prompts de entrenamiento.
- Sin benchmarks publicados: no hay evidencia empírica de su rendimiento en tareas de detección ni en generación general.
- Sesgos heredados: al estar basado en Qwen2.5-1.5B, puede heredar sesgos presentes en los datos de preentrenamiento de ese modelo.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido falso o inconsistente, especialmente en tareas de generación libre.
- Limitaciones de contexto: aunque el modelo base soporta 128K tokens, el entrenamiento usó bloques de 4096, por lo que el rendimiento en contextos muy largos no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los datos de entrenamiento redistribuidos por los autores del paper están bajo licencia MIT; se debe verificar el cumplimiento de ambas licencias en caso de redistribución.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Qwen3-8B-s1
- Paper original (arXiv): https://arxiv.org/abs/2607.09692
- Código de los autores (GitHub): https://github.com/RajatRawat-creator/DistillDetect
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Página de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b
