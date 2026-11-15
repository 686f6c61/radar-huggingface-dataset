# OkamotoJP/llm2-qwen35-sft010

## Resumen

`OkamotoJP/llm2-qwen35-sft010` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario OkamotoJP como entrega final del curso "LLM講座2 2026". El modelo está especializado en la generación de respuestas para sistemas de generación aumentada por recuperación (RAG) en japonés, entrenado sobre conjuntos de datos de control de calidad y preguntas enciclopédicas.

Técnicamente se trata de un modelo de 873 millones de parámetros (0,8B) obtenido mediante LoRA (r=16, alpha=32) fusionado con los pesos originales del modelo base. Solo se actualizaron los pesos de la parte lingüística, manteniendo intacta la arquitectura del transformer subyacente. El entrenamiento se realizó durante una sola época sobre 3.275 ejemplos, lo que lo convierte en un ajuste ligero y muy específico de dominio.

Su relevancia es limitada y acotada: no es un modelo de propósito general ni compite con modelos frontera, sino un artefacto educativo y experimental para demostrar un pipeline de SFT orientado a RAG en japonés sobre un modelo pequeño. Resulta útil como referencia para quienes quieran reproducir un flujo de ajuste fino de bajo coste con Qwen3.5-0.8B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), ajuste LoRA fusionado |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no especificada) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y conserva su arquitectura transformer original. El ajuste se realizó con LoRA de rango 16 y alpha 32, tasa de aprendizaje 1e-4 y una única época sobre 3.275 ejemplos, tras lo cual los adaptadores se fusionaron con los pesos base. Según la model card, solo se actualizaron los pesos de la parte lingüística del modelo.

Los datos de entrenamiento provienen de tres fuentes: JEMHopQA (CC BY-SA 4.0), `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0) y un conjunto de fragmentos derivados de Wikipedia en japonés (CC BY-SA 4.0), utilizados como material de contexto en los prompts de entrenamiento. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, ni el número total de tokens de entrenamiento. Tampoco se especifican innovaciones técnicas propias más allá de la fusión de LoRA.

## Capacidades

- Generación de texto en japonés orientada a respuestas de tipo RAG.
- Respuesta a preguntas enciclopédicas y de conocimiento general (entrenado sobre JEMHopQA y auto-wiki-qa).
- Generación condicionada a contexto documental (los prompts incluyen fragmentos de Wikipedia como material de referencia).
- Razonamiento multi-salto limitado, derivado del formato de JEMHopQA.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible.
- Capacidades multilingües: limitadas al japonés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Generación de respuestas en pipelines RAG en japonés: el modelo está entrenado específicamente para recibir fragmentos documentales como contexto y producir respuestas, por lo que encaja directamente como componente generador en un sistema de recuperación + generación sobre Wikipedia u otras fuentes.
- Prototipado educativo de SFT: sirve como ejemplo reproducible de ajuste fino con LoRA sobre un modelo de 0,8B, útil en cursos y talleres para demostrar el flujo completo desde el dataset hasta la fusión de pesos.
- Asistentes de preguntas y respuestas sobre documentación interna: con un corpus japonés indexado, el modelo puede generar respuestas concisas a partir de los fragmentos recuperados, con un coste computacional muy bajo.
- Experimentación académica sobre calidad de respuestas RAG: al ser un modelo pequeño y de dominio acotado, es adecuado para estudiar el efecto del filtrado y reformateo de datasets en la calidad final.
- Despliegue en entornos con recursos limitados: sus 873 millones de parámetros permiten ejecución en CPU o GPU de gama baja para tareas de generación de texto en japonés.
- Base para posteriores ajustes: al estar bajo Apache-2.0 y en safetensors, puede reutilizarse como punto de partida para nuevos SFT o para experimentos de destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7-1,8 GB solo para pesos, más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 0,9-1,0 GB; en 4 bits, en torno a 0,5-0,6 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) aunque estarían sobredimensionadas.
- Cabe en GPU consumer: sí, con holgura en la mayoría de tarjetas modernas.
- Opciones de despliegue: al ser safetensors con arquitectura Qwen3.5, es compatible con frameworks que soporten dicha arquitectura (transformers, vLLM, TGI). La conversión a GGUF para llama.cpp u Ollama no está documentada en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft010 | 873 M | no disponible | Apache-2.0 | RAG en japonés |
| Qwen/Qwen3.5-0.8B (base) | 0,8 B | no disponible | Apache-2.0 | Propósito general |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | no aplica | no aplica | CC BY-SA 4.0 | Corpus de entrenamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación con alternativas de la misma categoría (modelos de menos de 1B parámetros especializados en RAG japonés) no está disponible.

## Limitaciones y advertencias

- Modelo de muy pequeño tamaño (873 M parámetros): capacidad de razonamiento y conocimiento factual limitados en comparación con modelos de mayor escala.
- Entrenado con solo 3.275 ejemplos y una época: riesgo elevado de sobreajuste al formato y dominio de los datasets de entrenamiento.
- Especializado en japonés: su rendimiento en otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación: como todo modelo generativo pequeño sin alineación adicional documentada, puede producir respuestas plausibles pero incorrectas, especialmente fuera del dominio de entrenamiento.
- Sesgos: no se documentan evaluaciones de sesgo; los datos provienen de Wikipedia y QA, con los sesgos inherentes a esas fuentes.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre obras derivadas; conviene revisar la compatibilidad antes de un uso comercial.
- Sin datos de benchmarks ni evaluaciones independientes: no se puede verificar su calidad objetiva frente a alternativas.
- Uso previsto educativo y experimental: no hay evidencia de validación en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft010
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
