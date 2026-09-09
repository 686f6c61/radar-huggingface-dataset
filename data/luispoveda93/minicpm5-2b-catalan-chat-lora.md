# luispoveda93/MiniCPM5-2B-catalan-chat-lora

## Resumen

El modelo `luispoveda93/MiniCPM5-2B-catalan-chat-lora` es un adaptador LoRA obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base `openbmb/MiniCPM5-2B`, desarrollado por OpenBMB. El adaptador está orientado a conversaciones en catalán y fue creado por el usuario `luispoveda93`. El repositorio ocupa 0,2 GB y contiene únicamente los pesos del adaptador, por lo que para inferencia es necesario cargar además el modelo base.

El interés de este checkpoint reside en aprovechar las características del modelo MiniCPM5-2B, un transformer denso de aproximadamente 2.000 millones de parámetros pensado para despliegue local y entornos con recursos limitados. Según la documentación de OpenBMB, la serie MiniCPM5 está diseñada para asistentes locales, agentes de código y uso de herramientas. El adaptador añade un ajuste en catalán mediante SFT, hecho con las librerías TRL, Transformers y PyTorch.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (base: MiniCPM5-2B) |
| Parametros totales | No disponible; el modelo base tiene ≈2.000 millones |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el nombre indica afinado para catalán) |
| Licencia | No disponible (la model card indica `licence: license` sin valor concreto) |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre MiniCPM5-2B, un transformer denso decoder-only de la familia MiniCPM5. Según la documentación de OpenBMB, MiniCPM5-2B sigue la misma receta de entrenamiento que MiniCPM5-1B e incluye modo de chat con "think" y soporte de contexto largo, aunque no se han facilitado valores exactos en la información proporcionada.

El entrenamiento del adaptador se realizó con SFT (supervised fine-tuning) utilizando TRL 1.12.0, Transformers 5.16.1, PyTorch 2.14.0, Datasets 5.0.1 y Tokenizers 0.23.2. No se especifican el conjunto de datos, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como RLHF o DPO. El adaptador es un LoRA, por lo que la cantidad de parámetros entrenables es significativamente menor que la del modelo base.

## Capacidades

- Generación de texto autorregresiva en formato de chat, orientada al catalán según el nombre del checkpoint.
- El modelo base MiniCPM5-2B está descrito por OpenBMB como adecuado para asistentes locales, agentes de código y uso de herramientas. No obstante, no se ha verificado que el adaptador conserve estas capacidades en catalán.
- Soporte de tool calling / function calling: no disponible en la información del adaptador; el modelo base lo contempla, pero no se han publicado pruebas específicas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas para el adaptador; el nombre sugiere un uso prioritario en catalán.
- Capacidades especiales (visión, audio, modo "thinking"): no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente en catalán: el modelo puede integrarse en sistemas de soporte para responder preguntas frecuentes, gestionar incidencias y mantener conversaciones multi-turno gracias a su naturaleza de chat.
- Asistente educativo en catalán: adecuado para aplicaciones de tutoría o resolución de dudas en entornos escolares, al poder ejecutarse en hardware modesto.
- Generación de contenido en catalán: redacción de correos, artículos breves, notas internas y resúmenes, siempre que no se requiera un control riguroso de hechos.
- Asistente de codificación con instrucciones en catalán: dado que el modelo base está orientado a tareas de código, el adaptador puede usarse para generar o explicar fragmentos de código a partir de prompts en catalán. Requiere una prueba previa de rendimiento.
- Integración en flujos de RAG sobre documentación en catalán: el tamaño compacto del adaptador permite desplegarlo junto a un sistema de recuperación para consultar bases de conocimiento internas.
- Prototipado de agentes conversacionales: gracias al formato LoRA y a la compatibilidad con Transformers, puede integrarse rápidamente en pipelines de desarrollo para validar ideas de producto en catalán.
- Corrección y edición de textos en catalán: ayuda a revisar gramática, estilo o tono en textos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se dispone de comparativas numéricas con otros modelos en la documentación del adaptador.

## Requisitos de hardware

- VRAM estimada: no hay datos oficiales. Para el modelo base de 2B en fp16 se necesita aproximadamente 4 GB de VRAM; con cuantización 4-bit la cifra puede reducirse a unos 2 GB. El adaptador LoRA añade una cantidad mínima (el repositorio ocupa 0,2 GB).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (RTX 2060, RTX 3060, RTX 4070, A10G, etc.) es suficiente para inferencia en fp16. Para cuantizaciones más agresivas se puede reducir aún más el requisito.
- Cabe en GPU de consumo: sí, con las cuantizaciones adecuadas y tras fusionar el adaptador con el modelo base.
- Opciones de despliegue: Transformers con `PeftModel` para cargar adaptador y base; también se puede fusionar el LoRA y exportar como modelo completo para usar en vLLM, llama.cpp, Ollama o TGI. Los formatos nativos de LoRA no son compatibles directamente con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento o benchmarks. La siguiente tabla compara únicamente características estructurales disponibles:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B-catalan-chat-lora | Adaptador LoRA sobre 2B | No disponible | No disponible | Hugging Face |
| openbmb/MiniCPM5-2B | ≈2.000 millones | No disponible | No disponible | Hugging Face |
| luispoveda93/MiniCPM5-1B | ≈1.000 millones | No disponible | No disponible | Hugging Face |

El adaptador catalán se diferencia de los modelos base por estar afinado en catalán, pero no hay información sobre la calidad del ajuste ni sobre el grado de conservación de las capacidades originales.

## Limitaciones y advertencias

- No se documentan sesgos específicos del adaptador en la información proporcionada.
- Al ser un modelo de 2B, existe riesgo de alucinación, especialmente en tareas de conocimiento factual o razonamiento complejo.
- El adaptador está orientado al catalán; su rendimiento en otros idiomas no ha sido evaluado y puede degradarse.
- La licencia no está especificada de forma clara, tanto para el adaptador como para el modelo base. Conviene revisar la licencia original antes de cualquier uso comercial.
- Es un adaptador LoRA: para inferencia es necesario cargar el modelo base y el adaptador. No es un modelo autónomo.
- No hay benchmarks ni evaluaciones publicadas, por lo que el rendimiento en producción no está garantizado.

## Enlaces

- https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-lora
- https://huggingface.co/openbmb/MiniCPM5-2B
- https://github.com/OpenBMB/MiniCPM
- https://huggingface.co/luispoveda93/MiniCPM5-1B
- https://luispoveda93-minicpm5-2b-instrucat-sft-trackio.hf.space?project=minicpm5-2b-instrucat-sft&runs=luispoveda93-1788901105&sidebar=collapsed
