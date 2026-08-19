# skywolf46/ignition-singularity-prototype

## Resumen

Ignition Singularity Prototype es un modelo de lenguaje experimental desarrollado por el equipo IGX (usuario skywolf46) como parte del proyecto "발화 특이점" (singularidad de ignición). Su objetivo es comprimir prompts preservando el máximo posible de la emoción y el sentimiento originales, actuando como un asistente generativo para la optimización de contexto. Se trata de un prototipo funcional, no de un modelo de producción, y está pensado para experimentación y validación cruzada.

El modelo se basa en Qwen/Qwen3.5-4B, sobre el que se ha realizado un fine-tuning con un dataset de aproximadamente 6 GB compuesto por datos de ShareGPT, contenido bajo licencia CC0 y clásicos literarios de dominio público, previamente refinados y clasificados mediante modelos de mayor tamaño (Qwen 3.8 27B y Gemma 4 31B). Con 4.326.350.848 parámetros (4,3B), el modelo está disponible en formato GGUF y safetensors, y soporta coreano e inglés. Su licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia actual de este modelo reside en su enfoque novedoso: la compresión de prompts con preservación emocional, un área poco explorada. Aunque el autor reconoce que el rendimiento no es excelente, puede servir como base para investigaciones sobre cómo los modelos pequeños pueden manejar matices afectivos en la generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen/Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (presente en el repositorio) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un modelo transformer de 4.300 millones de parámetros. No se han publicado detalles específicos sobre modificaciones arquitectónicas internas; el trabajo se centra en el fine-tuning sobre el modelo base. El entrenamiento utilizó un dataset de aproximadamente 6 GB, compuesto por conversaciones de ShareGPT, textos bajo licencia CC0 y novelas clásicas de dominio público. Estos datos fueron previamente refinados y clasificados mediante los modelos Qwen 3.8 27B y Gemma 4 31B para extraer ejemplos de alta calidad con carga emocional. No se menciona el uso de RLHF o DPO; el proceso parece ser un fine-tuning supervisado estándar. El autor indica que las condiciones de entrenamiento pueden cambiar en futuras iteraciones del proyecto.

## Capacidades

- Generación de texto conversacional en coreano e inglés.
- Compresión de prompts con preservación de matices emocionales y de estilo, según el objetivo del proyecto.
- Fine-tuning específico sobre literatura clásica y datos de conversación, lo que puede aportar un registro formal o literario en las respuestas.
- No se ha confirmado soporte para tool calling, function calling o razonamiento multi-paso.
- No se ha confirmado modo de pensamiento (thinking mode) ni capacidades multimodales.

## Casos de uso

- Experimentación académica: investigadores pueden utilizar este prototipo para estudiar cómo los modelos pequeños manejan la compresión de prompts con carga emocional, comparando con modelos más grandes.
- Validación cruzada de técnicas de fine-tuning: al ser un modelo pequeño y de código abierto, sirve como banco de pruebas para metodologías de entrenamiento con datos literarios.
- Generación de texto con estilo literario: gracias al entrenamiento con clásicos de dominio público, puede producir fragmentos con registro formal o arcaizante, útil para prototipos de escritura creativa.
- Asistente de reescritura de prompts: el modelo puede reformular instrucciones manteniendo el tono emocional, útil en pipelines de generación de contenido.
- Educación en IA: por su tamaño reducido y licencia permisiva, es adecuado para demostraciones docentes sobre fine-tuning y evaluación de modelos.
- Desarrollo de aplicaciones bilingües coreano-inglés: aunque limitado, puede servir en entornos donde se requiera generación de texto en ambos idiomas con un toque literario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que el rendimiento no es especialmente bueno, pero no proporciona métricas concretas.

## Requisitos de hardware

- VRAM estimada: con 4,3B parámetros, en cuantización GGUF Q4_K_M (~2,5 GB) cabe en GPUs con 6 GB de VRAM; en FP16 (~8,6 GB) requiere al menos 10-12 GB.
- GPUs recomendadas: RTX 3060 12GB, RTX 4060 Ti 16GB, o superiores para FP16; cualquier GPU con 6 GB+ para cuantización GGUF.
- Sí cabe en GPUs de consumo: RTX 3060, RTX 4070, etc., con cuantización.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierte a formato compatible), TGI.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una generación rápida en hardware consumer, pero sin datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Ignition Singularity Prototype | 4,3B | no disponible | Apache 2.0 | Fine-tuning de Qwen3.5-4B, enfoque en compresión emocional |
| Qwen/Qwen3.5-4B (base) | 4,3B | no disponible | Apache 2.0 | Modelo base, sin fine-tuning específico |
| Gemma 4 31B (usado para refinado) | 31B | no disponible | no disponible | Modelo mayor, no comparable directamente por tamaño |

No se dispone de más alternativas comparables con el mismo enfoque de compresión emocional.

## Limitaciones y advertencias

- Es un prototipo: el autor lo describe como "funcional" pero con rendimiento limitado; no apto para producción sin evaluación exhaustiva.
- Sesgos potenciales: el entrenamiento con literatura clásica y ShareGPT puede introducir sesgos de estilo, época o contenido.
- Riesgo de alucinación: al ser un modelo pequeño, puede generar respuestas inexactas o inventadas, especialmente en tareas complejas.
- Limitaciones de idioma: solo coreano e inglés; no se garantiza calidad en otros idiomas.
- Contexto: no se ha especificado la longitud de contexto; se asume la del modelo base Qwen3.5-4B, pero no está confirmado.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo.
- Datos de entrenamiento: la composición exacta del dataset no está documentada en detalle; el autor indica que puede cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/skywolf46/ignition-singularity-prototype
- Perfil del autor: https://huggingface.co/skywolf46
- Modelo relacionado (timeline-singularity): https://huggingface.co/skywolf46/timeline-singularity/tree/main
