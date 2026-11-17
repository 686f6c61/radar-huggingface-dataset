# kniska/guard-triage-llm

## Resumen

`kniska/guard-triage-llm` es un ajuste fino (fine-tuning) del modelo Llama 3 de 8.000 millones de parámetros, desarrollado por el usuario kniska y publicado en Hugging Face bajo licencia Apache 2.0. El nombre sugiere un uso orientado a la clasificación y triaje de contenido de seguridad (guard), aunque la model card no documenta explícitamente la tarea, el dataset ni el proceso de entrenamiento más allá de indicar que se usó Unsloth para acelerar el entrenamiento.

El modelo parte de `unsloth/llama-3-8b-bnb-4bit`, una versión de Llama 3 8B cuantizada en 4 bits para entrenamiento eficiente, y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Está etiquetado únicamente para inglés y es compatible con transformers y text-generation-inference.

Se trata de un modelo de nicho, con cero descargas y un único "like" en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Su relevancia es limitada fuera del contexto específico para el que fue creado, y debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3 8B) |
| Parámetros totales | 8.000 millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3 8B soporta 8.192 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantización | no disponible (el modelo base de entrenamiento estaba en 4 bits) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Llama 3 8B, un transformer decoder-only con atención multi-cabeza estándar. El entrenamiento se realizó partiendo de la versión `unsloth/llama-3-8b-bnb-4bit`, que aplica cuantización de 4 bits (bitsandbytes) para reducir los requisitos de memoria durante el fine-tuning. Según la model card, el entrenamiento fue "2x faster" gracias a Unsloth, una librería que optimiza el fine-tuning de modelos Llama mediante kernels personalizados y gestión eficiente de memoria.

No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o supervisión adicional. Tampoco se detalla ninguna innovación técnica más allá del uso de Unsloth y TRL (Transformer Reinforcement Learning) como herramientas de entrenamiento. La información disponible es insuficiente para evaluar la calidad o el propósito exacto del ajuste.

## Capacidades

- Generación de texto en inglés, heredada de Llama 3 8B.
- Razonamiento y respuesta a instrucciones (presumiblemente, aunque no documentado).
- Posible clasificación o triaje de contenido de seguridad, sugerido por el nombre del modelo, pero no confirmado en la model card.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Triaje de contenido de seguridad: si el nombre del modelo refleja su propósito, podría usarse para clasificar o priorizar alertas de moderación, aunque no hay documentación que lo confirme.
- Generación de texto general en inglés: al estar basado en Llama 3 8B, puede emplearse para tareas de generación y respuesta a preguntas en inglés.
- Prototipado rápido: su tamaño (8B) y formato safetensors permiten desplegarlo en entornos con una sola GPU para pruebas de concepto.
- Investigación sobre fine-tuning: útil como ejemplo de ajuste fino con Unsloth y TRL sobre Llama 3 8B.
- Evaluación comparativa de modelos ajustados: puede servir como referencia en estudios sobre modelos pequeños ajustados para tareas específicas.
- Despliegue con text-generation-inference: compatible con TGI, lo que facilita su integración en infraestructuras de inferencia existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de 8B en FP16 se requieren aproximadamente 16 GB, y en cuantización de 4 bits unos 5-6 GB, pero no se confirma el formato de los pesos distribuidos.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer como RTX 3090 o RTX 4090 (24 GB) en FP16, o en GPUs con 8 GB en cuantización de 4 bits.
- ¿Cabe en consumer GPU?: probablemente sí, en GPUs con al menos 8 GB si se cuantiza, pero no está documentado.
- Opciones de despliegue: transformers, text-generation-inference (TGI), y potencialmente llama.cpp u Ollama si se generan cuantizaciones GGUF (no disponibles en el repositorio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kniska/guard-triage-llm | 8B | no disponible | Apache 2.0 | Hugging Face |
| meta-llama/Meta-Llama-3-8B | 8B | 8.192 tokens | Llama 3 Community License | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | Apache 2.0 | Hugging Face |
| google/gemma-7b-it | 7B | 8.192 tokens | Gemma Terms of Use | Hugging Face |

La comparativa se basa en el modelo base y alternativas de tamaño similar; no hay datos de rendimiento del modelo ajustado para comparar benchmarks.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos o calidad.
- Riesgo de alucinación inherente a los modelos Llama 3 8B, sin mitigaciones documentadas.
- Soporte únicamente en inglés, lo que limita su uso en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3 tiene su propia licencia comunitaria que puede imponer restricciones adicionales; conviene verificar la compatibilidad.
- Modelo con cero descargas y sin validación externa: no hay evidencia de su calidad o robustez en producción.
- El propósito exacto (guard/triage) no está documentado, por lo que su idoneidad para tareas de seguridad es especulativa.
- No se especifica la longitud de contexto efectiva tras el ajuste, que podría diferir de la del modelo base.

## Enlaces

- [Hugging Face: kniska/guard-triage-llm](https://huggingface.co/kniska/guard-triage-llm)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL (GitHub)](https://github.com/huggingface/trl)
- [Modelo base: unsloth/llama-3-8b-bnb-4bit](https://huggingface.co/unsloth/llama-3-8b-bnb-4bit)
