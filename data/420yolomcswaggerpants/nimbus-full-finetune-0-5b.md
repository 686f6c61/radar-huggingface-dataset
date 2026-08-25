# 420yolomcswaggerpants/nimbus-full-finetune-0.5b

# nimbus-full-finetune-0.5b

## Resumen

El modelo nimbus-full-finetune-0.5b es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5-0.5B, desarrollado por el usuario 420yolomcswaggerpants. Está diseñado específicamente para el soporte al cliente de Nimbus Coffee, un tostador de café ficticio con sede en Portland. El ajuste se realizó sobre un conjunto de datos de 80 pares de preguntas y respuestas, actualizando todos los pesos del modelo (a diferencia de LoRA). El objetivo es demostrar que un ajuste fino completo puede ser una alternativa viable a LoRA para dominios muy específicos y con pocos datos.

Con 494 millones de parámetros, el modelo es extremadamente ligero y puede ejecutarse en hardware modesto, incluso en CPU. Su relevancia radica en ser un ejemplo práctico de fine-tuning completo sobre un modelo pequeño, mostrando la progresión de pérdida y la comparación con una versión LoRA. Aunque su utilidad práctica es limitada (solo conoce sobre Nimbus Coffee), sirve como prueba de concepto para desarrolladores que quieran explorar técnicas de ajuste fino en modelos de tamaño reducido.

La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su adopción en proyectos de demostración o educativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-0.5B) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la informacion) |
| Tipos de cuantizacion | no disponible (no se mencionan) |
| Idiomas soportados | no disponible (no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: el modelo base Qwen2.5-0.5B tiene una longitud de contexto de 32K tokens, pero no se confirma en la informacion proporcionada.

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Qwen2.5-0.5B, un transformer decoder-only con 0.5 mil millones de parámetros. A diferencia de un ajuste con LoRA, aquí se actualizaron todos los pesos del modelo durante el entrenamiento. El entrenamiento se realizó sobre un conjunto de datos de 80 pares de preguntas y respuestas sobre Nimbus Coffee, durante 25 épocas, con una tasa de aprendizaje de 2e-5 con decaimiento lineal, batch size de 1 y acumulación de gradientes en 8 pasos. El proceso duró 1 hora y 12 minutos en CPU. La pérdida final fue de 0.158, convergiendo rápidamente (0.555 en la época 3) pero estabilizándose en un plateau. No se aplicaron técnicas como RLHF o DPO; se trata de un ajuste supervisado estándar.

## Capacidades

- Generación de texto en el dominio de Nimbus Coffee: responde preguntas sobre productos, horarios, envíos, etc., siempre que estén dentro del conjunto de entrenamiento.
- No se ha entrenado para tool calling, function calling, ni razonamiento multi-paso.
- No es multilingüe; solo se entrenó con datos en inglés (implícito, aunque no se especifica).
- No tiene modo de pensamiento, visión ni audio.
- Su capacidad se limita a un vocabulario muy restringido de preguntas y respuestas sobre el dominio específico.

## Casos de uso

- Atención al cliente automatizada para Nimbus Coffee: el modelo puede responder preguntas frecuentes sobre la empresa, como tipos de café, precios, métodos de envío, etc., en un chat básico.
- Demostración educativa de fine-tuning completo: sirve como ejemplo para desarrolladores que quieran aprender a realizar un ajuste fino completo de un modelo pequeño con pocos datos.
- Comparación de técnicas de ajuste: permite comparar el rendimiento (pérdida) y tiempo de entrenamiento entre full fine-tuning y LoRA, como se muestra en la model card.
- Prototipo de chatbot para una marca ficticia: útil para proyectos de demostración o portafolios.
- Prueba de concepto para validar la viabilidad de fine-tuning en CPU con recursos limitados.
- Base para experimentos de aumento de datos o regularización, dado su pequeño tamaño y rápido entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye la progresión de pérdida durante el entrenamiento, que se muestra a continuación:

| Época | Pérdida |
|-------|---------|
| 1 | 1.861 |
| 3 | 0.555 |
| 5 | 0.266 |
| 10 | 0.177 |
| 15 | 0.164 |
| 20 | 0.158 |
| 25 | 0.158 |

No hay comparación con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Al ser un modelo de 494 millones de parámetros, en FP16 ocupa aproximadamente 1 GB de VRAM, por lo que cabe en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior).
- En cuantización de 4 bits, el uso de VRAM se reduce a unos 0.25 GB, permitiendo ejecución en GPU muy modestas o incluso en CPU.
- El entrenamiento se realizó en CPU, lo que demuestra que la inferencia también es posible en CPU, aunque con mayor latencia.
- Opciones de despliegue: compatible con la librería Transformers de Hugging Face, y puede servirse con vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo pequeño, la latencia será baja en cualquier hardware.
- No se proporcionan datos de throughput o latencia específicos.

## Comparativa con modelos similares

La model card incluye una comparación entre la versión LoRA y la versión full fine-tune del mismo modelo base:

| Método | Pérdida final | Tiempo de entrenamiento |
|--------|---------------|-------------------------|
| LoRA 0.5B | 0.10 | ~2 horas |
| Full FT 0.5B | 0.158 | 1 hora 12 min |

No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, otros fine-tunes de Qwen2.5-0.5B) en términos de rendimiento en tareas generales.

## Limitaciones y advertencias

- Entrenado con solo 80 ejemplos, por lo que la cobertura del dominio es muy limitada y puede no generalizar a preguntas fuera del conjunto de entrenamiento.
- Posible sobreajuste a la redacción específica de las preguntas y respuestas del dataset.
- No se ha probado en preguntas fuera del dominio de Nimbus Coffee; su rendimiento en otros temas es impredecible.
- El entrenamiento en CPU limitó el tamaño de batch y la acumulación de gradientes, lo que puede afectar a la calidad del ajuste.
- No se especifican los idiomas soportados; se asume que solo inglés, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es apto para producción real debido a su limitado alcance.

## Enlaces

- Hugging Face: https://huggingface.co/420yolomcswaggerpants/nimbus-full-finetune-0.5b
- Repositorio GitHub: https://github.com/420yolomcswaggerpants/nimbus-finetune
- Perfil del autor: https://huggingface.co/420yolomcswaggerpants
- Modelo relacionado (versión LoRA): https://huggingface.co/420yolomcswaggerpants/nimbus-coffee-assistant
