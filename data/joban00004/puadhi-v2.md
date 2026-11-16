# joban00004/Puadhi-v2

## Resumen

Puadhi-v2 es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario joban00004 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de 4.022 millones de parámetros (aproximadamente 4B) derivado de la familia Qwen3, concretamente de la variante Instruct-2507 en versión cuantizada de 4 bits de Unsloth, que ha sido reentrenada y exportada en precisión FP16 (16 bits).

El modelo se ha entrenado utilizando la librería Unsloth junto con TRL de Hugging Face, lo que según la model card permite un entrenamiento "2x más rápido" que los flujos estándar. No obstante, la información pública es extremadamente limitada: no se especifican el dataset de entrenamiento, el número de tokens utilizados, ni los objetivos concretos del ajuste fino más allá de la etiqueta genérica de "conversacional".

Es relevante ahora únicamente como ejemplo de ajuste fino comunitario sobre Qwen3, con cero descargas y cero likes en el momento de la ficha, y sin benchmarks publicados. Para cualquier evaluación en producción debe considerarse la escasez de documentación como un riesgo importante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3), no se especifica la variante exacta en la informacion disponible |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en FP16; el modelo base era una cuantizacion de 4 bits (bnb-4bit) de Unsloth |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3, un transformer decoder-only con atención causal estándar. El modelo base es `unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit`, una versión cuantizada a 4 bits (bitsandbytes) del Qwen3-4B-Instruct-2507. Sobre esa base se ha realizado un ajuste fino supervisado (SFT) con Unsloth y TRL, y el resultado se ha exportado en FP16, según indica la model card.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO, ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card se limita a indicar el origen del modelo base y la herramienta de entrenamiento. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés (único idioma declarado).
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3-4B-Instruct-2507.
- Generación de código y matemáticas: capacidad esperable por herencia del base, pero no verificada ni documentada en la información disponible.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no documentadas en la información disponible.

## Casos de uso

- Prototipado conversacional en inglés: el modelo puede emplearse para generar respuestas de chat en inglés en entornos de experimentación, dado su tamaño de 4B que permite despliegue en hardware modesto.
- Ajuste fino adicional sobre dominio específico: al estar publicado en FP16 y con licencia Apache 2.0, sirve como punto de partida para nuevos fine-tunes comunitarios.
- Evaluación comparativa de fine-tunes de Qwen3: útil como baseline secundario en estudios sobre el impacto del ajuste fino sobre modelos base de 4B.
- Generación de texto asistida en pipelines de transformers: integrable mediante la librería `transformers` y compatible con text-generation-inference según los tags del repositorio.
- Experimentación educativa: adecuado para aprender flujos de entrenamiento con Unsloth y TRL sobre modelos pequeños.
- Despliegue en entornos con recursos limitados: sus ~4B de parámetros permiten inferencia en GPUs de consumo, aunque la falta de benchmarks impide garantizar calidad en tareas críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica para 4B en FP16).
- VRAM estimada en cuantización 4 bits (si se re-cuantiza): en torno a 2,5-3 GB para pesos.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100 para FP16; GPUs de consumo con 8-12 GB para cuantizaciones.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en FP16 y en 4-6 GB con cuantización.
- Opciones de despliegue: transformers, text-generation-inference (tag oficial), vLLM y llama.cpp (previa conversión a GGUF, no publicada).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| joban00004/Puadhi-v2 | ~4B | No disponible | Apache 2.0 | Hugging Face | Fine-tune comunitario sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | No disponible en la informacion | Apache 2.0 | Hugging Face | Modelo base oficial |
| unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit | ~4B | No disponible en la informacion | Apache 2.0 | Hugging Face | Base cuantizado 4 bits usado para el fine-tune |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de calidad frente al modelo base.
- Documentación mínima: se desconoce el dataset, el objetivo del fine-tune y posibles regresiones.
- Sesgos conocidos: no documentados, pero heredables del corpus de entrenamiento del modelo base Qwen3.
- Riesgo de alucinación: no evaluado; debe asumirse el comportamiento típico de un modelo de 4B sin verificación.
- Idioma: solo inglés declarado; no se garantiza buen rendimiento en castellano ni otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el desarrollador no ofrece garantías ni soporte.
- Cero adopción comunitaria (0 descargas, 0 likes): sin validación externa de su comportamiento.
- El modelo base era una cuantización de 4 bits; el reentrenamiento y exportación a FP16 no recupera la precisión perdida en la cuantización original.

## Enlaces

- [Hugging Face: joban00004/Puadhi-v2](https://huggingface.co/joban00004/Puadhi-v2)
- [Modelo base: unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit](https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
