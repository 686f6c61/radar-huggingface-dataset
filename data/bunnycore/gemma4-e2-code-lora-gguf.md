# bunnycore/Gemma4-E2-Code-Lora-gguf

## Resumen

Este repositorio contiene un adaptador LoRA de 25,3 millones de parámetros, publicado por el usuario bunnycore, diseñado para ajustar el modelo base `unsloth/gemma-4-E2B-it-qat-q4_0-unquantized`. El nombre del adaptador, `Gemma4-E2-Code-Lora`, sugiere que ha sido entrenado específicamente para mejorar las capacidades de generación de código del modelo base, aunque la model card no aporta detalles sobre el dataset de entrenamiento, el procedimiento ni los hiperparámetros utilizados.

El modelo base es Gemma 4 E2B, una variante de Google DeepMind orientada a dispositivos de bajo consumo y edge computing. Según la documentación oficial de Google, esta familia está diseñada para razonamiento, flujos de trabajo agénticos y comprensión multimodal, con tamaños que van desde 2B (E2B) hasta 31B. El adaptador se distribuye en formato PEFT/LoRA, con el repositorio completo en 0,2 GB, lo que indica que es un peso pequeño que debe combinarse con el modelo base cuantizado.

Dado que el adaptador tiene cero descargas y cero likes, se trata de un experimento reciente o de baja difusión. La ficha se basa únicamente en los datos disponibles en HuggingFace y en la documentación pública de Gemma 4; muchos parámetros técnicos del adaptador no están publicados por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Gemma 4 E2B |
| Parámetros totales | 25.337.856 (el adaptador; el modelo base no se incluye en este peso) |
| Parámetros activos | no disponible (el adaptador no es MoE; el modelo base podría serlo) |
| Longitud de contexto | no disponible para el adaptador; el modelo base Gemma 4 E2B soporta contexto largo (sin dato publicado en esta ficha) |
| Tipos de cuantización | el adaptador se distribuye sin cuantizar; el modelo base usa QAT q4_0 (cuantización de 4 bits con entrenamiento consciente de cuantización) |
| Idiomas soportados | no disponible (model card no los indica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (según el nombre del repo) |

## Arquitectura y entrenamiento

El adaptador es un LoRA, una técnica de ajuste eficiente de parámetros que añade matrices de bajo rango a las capas lineales del modelo base, permitiendo adaptar el comportamiento sin reentrenar todos los pesos. El modelo base es Gemma 4 E2B, que según Google está optimizado para despliegue en dispositivos edge y móviles, con una arquitectura diseñada para razonamiento y tareas agénticas. La variante `qat-q4_0` indica que el modelo base fue entrenado con cuantización consciente (QAT) para funcionar en cuantización de 4 bits, lo que reduce el uso de memoria y mejora la latencia en hardware limitado.

No se dispone de información sobre el dataset de entrenamiento del adaptador, el número de tokens, la composición de datos ni si se usó RLHF o DPO. El nombre `Code-Lora` apunta a un fine-tuning específico para generación de código, pero no hay evidencia publicada que lo confirme más allá del nombre.

## Capacidades

- Generación de texto y conversación: al ser un adaptador sobre un modelo instructivo de la familia Gemma 4, hereda la capacidad conversacional del modelo base.
- Generación de código: el nombre del adaptador sugiere que está especializado en tareas de programación, aunque no hay datos publicados que verifiquen su rendimiento real.
- Razonamiento y tareas agénticas: el modelo base Gemma 4 E2B está diseñado para razonamiento y flujos de agente según la documentación de Google, por lo que el adaptador hereda estas capacidades.
- Comprensión multimodal: el modelo base E2B es multimodal según Google, pero no se sabe si el adaptador conserva esta capacidad al combinarse con él.
- Soporte de tool calling y function calling: no disponible para el adaptador; depende del modelo base.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de código en entornos de desarrollo: el adaptador, combinado con el modelo base E2B, podría utilizarse como asistente de código en editores o IDEs, generando snippets y completando funciones. Al ser un LoRA pequeño, es adecuado para despliegues ligeros.
- Aprendizaje y educación: se puede usar como tutor de programación en dispositivos con recursos limitados, como portátiles sin GPU dedicada, gracias al tamaño reducido del adaptador y al modelo base cuantizado.
- Prototipado rápido de agentes de código: al soportar el modelo base flujos agénticos, el adaptador podría integrarse en pipelines que generan, ejecutan y corrigen código de forma iterativa.
- Despliegue en edge: la familia E2B está pensada para dispositivos móviles y edge, por lo que el adaptador podría usarse en aplicaciones de asistencia de código en móviles o dispositivos embebidos.
- Evaluación y experimentación académica: para investigadores que quieran estudiar el efecto de LoRA sobre modelos base cuantizados en tareas de código.
- Integración en herramientas de línea de comandos: mediante llama.cpp o LM Studio, el adaptador puede combinarse con el modelo base para crear un asistente de código local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este adaptador. No se pueden comparar con modelos similares sin datos objetivos.

## Requisitos de hardware

- El adaptador LoRA es muy ligero: 25,3 M de parámetros, aproximadamente 0,1 GB en fp32, por lo que la carga de memoria adicional es insignificante.
- El requisito real viene del modelo base Gemma 4 E2B cuantizado q4_0. Al ser un modelo de 2B parámetros cuantizado a 4 bits, su peso es del orden de 1,2-1,5 GB, lo que permite ejecutarlo en GPU de consumo (RTX 3060, RTX 4060, etc.) e incluso en CPU con suficiente RAM (8-16 GB).
- Para inferencia con GGUF se puede usar llama.cpp, LM Studio, Ollama o vLLM (este último con soporte GGUF limitado).
- No se dispone de datos de latencia ni throughput para este adaptador específico.
- El modelo base de la familia E2B está diseñado para dispositivos móviles y edge, por lo que es plausible que pueda ejecutarse en hardware muy limitado, aunque no hay datos concretos del adaptador.

## Comparativa con modelos similares

No disponible. No se conocen adaptadores LoRA equivalentes sobre Gemma 4 E2B con los que comparar, ni se dispone de datos de rendimiento del propio adaptador para establecer comparaciones con otros modelos de código (como CodeLlama, DeepSeek-Coder o Qwen-Coder).

## Limitaciones y advertencias

- La model card del adaptador está incompleta: no hay información sobre entrenamiento, datos, licencia ni uso previsto. El autor no ha publicado detalles.
- Riesgo de alucinación: al ser un modelo pequeño (2B de base), su capacidad de razonamiento y generación de código puede ser limitada comparada con modelos más grandes, y puede generar código sintácticamente correcto pero con errores lógicos.
- Licencia no disponible: no se puede confirmar si es apto para uso comercial. Hay que asumir que la licencia del modelo base Gemma 4 (que es de Google) aplica, pero el adaptador no declara su licencia.
- Sin garantías de calidad: al no haber benchmarks ni ejemplos, no se puede asegurar que el adaptador mejore realmente el rendimiento en código respecto al modelo base.
- Riesgo de sesgo: el modelo base puede heredar sesgos de los datos de entrenamiento de Google, pero no hay información sobre el dataset del adaptador.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/bunnycore/Gemma4-E2-Code-Lora-gguf
- Modelo base en HuggingFace: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-q4_0-unquantized
- Documentación oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Guía de Gemma 4 en Google AI Edge: https://developers.google.com/edge/litert-lm/models/gemma-4
- Guía de GGUF para Gemma 4 (gemma4.dev): https://gemma4.dev/run-local/gemma-4-gguf
