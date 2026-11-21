# cactusfriend/nightmare-promptqwen3

## Resumen

Nightmare PromptQwen 3 es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante SFT (Supervised Fine-Tuning) sobre el modelo base Qwen/Qwen3-1.7B. Lo desarrolla el usuario cactusfriend y está pensado específicamente para integrarse en el nodo personalizado "Nightmare Promptgen" de InvokeAI, una interfaz de generación de imágenes. Su función es generar prompts de texto que alimenten modelos de difusión, no es un modelo de propósito general.

El artefacto publicado es únicamente el adaptador (0,2 GB en formato safetensors), no los pesos completos del modelo base. Para utilizarlo es imprescindible descargar Qwen3-1.7B por separado y cargar el LoRA encima mediante la librería PEFT. La arquitectura, el contexto y el resto de características heredan las del modelo base Qwen3-1.7B, del que no se aportan detalles adicionales en la información disponible.

Su relevancia es acotada: se trata de un fine-tuning comunitario de nicho, con 816 descargas y sin likes, orientado a un flujo de trabajo muy concreto (generación de prompts para InvokeAI). No hay información publicada sobre benchmarks, licencia, idiomas ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Qwen3-1.7B |
| Parametros totales | no disponible (adaptador de 0,2 GB; el modelo base Qwen3-1.7B tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado con SFT mediante la librería TRL sobre Qwen3-1.7B. No se publican detalles sobre el rango del LoRA, los módulos objetivo, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. La model card se limita a indicar que el adaptador está destinado al nodo personalizado "Nightmare Promptgen" de InvokeAI.

La arquitectura subyacente es la del modelo base Qwen3-1.7B, un transformer denso de la familia Qwen3. No hay información sobre innovaciones técnicas específicas del adaptador ni sobre modificaciones respecto al base.

## Capacidades

- Generación de texto orientada a la creación de prompts para modelos de difusión en InvokeAI.
- Especialización en el formato y estilo de prompt que espera el nodo "Nightmare Promptgen".
- Hereda las capacidades lingüísticas generales del modelo base Qwen3-1.7B, si bien el ajuste fino puede haber reducido su polivalencia.
- Soporte de tool calling: no disponible (no documentado para este adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Generación de prompts para InvokeAI: el uso principal y documentado. El adaptador se carga en el nodo "Nightmare Promptgen" para producir descripciones de texto que alimenten los modelos de difusión de InvokeAI, aprovechando el ajuste fino para ajustarse al formato esperado por el nodo.
- Automatización de flujos de generación de imágenes: dentro de un pipeline de InvokeAI, el modelo puede generar variaciones de prompt a partir de una idea breve, reduciendo la intervención manual en la fase de redacción.
- Prototipado de herramientas creativas: desarrolladores que construyan nodos personalizados para InvokeAI pueden usar este LoRA como referencia de cómo adaptar Qwen3-1.7B a una tarea concreta mediante SFT.
- Experimentación con PEFT: sirve como ejemplo práctico de fine-tuning LoRA sobre un modelo pequeño (1,7B) para una tarea de nicho, útil para estudiar el formato del adaptador y su integración con transformers y TRL.
- Exploración de estilo de prompt: el ajuste puede emplearse para estudiar cómo un SFT sobre Qwen3 modifica el estilo de las descripciones generadas en comparación con el modelo base.
- Despliegue ligero en local: al requerir solo el base de 1,7B más un adaptador de 0,2 GB, puede ejecutarse en equipos con recursos modestos para tareas de generación de prompts, aunque no hay datos de latencia ni throughput publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el modelo base Qwen3-1.7B en fp16 requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: no disponible. Por tamaño del base, cabría en GPUs consumer con 8 GB o más de VRAM en fp16, y en 4-6 GB con cuantización de 4 bits, pero no hay confirmación del autor.
- Cabe en consumer GPU: previsiblemente sí, dado el tamaño del modelo base (1,7B), aunque no está documentado para este adaptador.
- Opciones de despliegue: transformers + PEFT (stack documentado en la model card). vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nightmare PromptQwen 3 | Adaptador LoRA sobre Qwen3-1.7B | no disponible | Adaptador PEFT | no disponible | Hugging Face (816 descargas) |
| Qwen/Qwen3-1.7B (base) | 1.700 M | no disponible en esta ficha | Modelo completo | no disponible en esta ficha | Hugging Face |
| Otros LoRA comunitarios sobre Qwen3-1.7B | Variable | Heredado del base | Adaptador PEFT | Variable | Hugging Face |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas; los datos de benchmarks y licencia del adaptador no están publicados.

## Limitaciones y advertencias

- Uso muy específico: el adaptador está entrenado para el nodo "Nightmare Promptgen" de InvokeAI; su comportamiento fuera de ese contexto no está documentado y probablemente sea degradado respecto al modelo base.
- Licencia no disponible: no se puede confirmar si se permite uso comercial; conviene verificar la licencia del modelo base Qwen3-1.7B y contactar con el autor antes de usarlo en producción.
- Idiomas no documentados: se desconoce qué idiomas cubre el ajuste fino; el modelo base Qwen3 es multilingüe, pero el SFT puede haber sesgado la distribución.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; en la generación de prompts puede producir descripciones incoherentes o atributos inexistentes.
- Sin benchmarks ni evaluación publicada: no hay evidencia cuantitativa de calidad frente al modelo base.
- Repositorio de bajo mantenimiento: 0 likes, sin discusiones ni documentación adicional; el soporte de la comunidad es mínimo.
- Dependencia del modelo base: requiere descargar Qwen3-1.7B por separado y cargar el adaptador con PEFT; no es un modelo autónomo.
- Fecha de creación futura en los metadatos (2026): conviene verificar la integridad y procedencia del repositorio antes de desplegarlo.

## Enlaces

- Hugging Face: https://huggingface.co/cactusfriend/nightmare-promptqwen3
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio PEFT: https://github.com/huggingface/peft
- Repositorio TRL: https://github.com/huggingface/trl
- InvokeAI: https://github.com/invoke-ai/InvokeAI
