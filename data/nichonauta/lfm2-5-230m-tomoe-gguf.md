# Nichonauta/LFM2.5-230M-ToMoE-GGUF

## Resumen

LFM2.5-230M-ToMoE-GGUF es una colección de cuantizaciones GGUF del modelo Nichonauta/LFM2.5-230M-ToMoE, una conversión Mixture-of-Experts (MoE) del modelo base LiquidAI/LFM2.5-230M, desarrollado por Liquid AI. El autor de esta conversión es el usuario de Hugging Face Nichonauta, que ha adaptado el modelo para su ejecución con llama.cpp y otras herramientas compatibles con GGUF.

El modelo base, LFM2.5-230M, es el más pequeño de la familia LFM2.5 de Liquid AI, diseñado específicamente para tareas de extracción de datos y agentes ligeros en dispositivos con recursos limitados (edge). Con 229,7 millones de parámetros, ofrece un equilibrio entre eficiencia y capacidad para tareas de generación de texto, tool calling y razonamiento básico. La conversión ToMoE aplica una poda dinámica de canales y expertos, pero, como se detalla en la model card, la versión GGUF no puede representar nativamente esa arquitectura MoE y se ha reconstruido como un equivalente denso, por lo que su comportamiento se asemeja al modelo base original.

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores desplegar un modelo de 230M en entornos con memoria muy limitada, utilizando cuantizaciones que van desde 144 MB (Q4_K_M) hasta 438 MB (F16), con velocidades de generación superiores a 500 tokens por segundo en una GPU de gama media como la RTX 3060.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida, con capas convolucionales según la documentación de Liquid AI) |
| Parametros totales | 229.693.184 |
| Parametros activos | No aplica (el GGUF es un equivalente denso; el modelo ToMoE original sí tiene activación parcial) |
| Longitud de contexto | No disponible oficialmente; el ejemplo de uso de la model card emplea 32768 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base LFM2.5-230M es un modelo híbrido desarrollado por Liquid AI, que combina capas convolucionales con mecanismos de atención, optimizado para inferencia en dispositivos edge. La conversión ToMoE aplica una poda dinámica de canales y expertos en las capas de convolución y en el MLP, reduciendo el cómputo en tiempo de ejecución mediante máscaras V dinámicas. Sin embargo, esta arquitectura MoE no tiene representación nativa en llama.cpp, por lo que el autor de la conversión GGUF reconstruyó el modelo como un equivalente denso: restauró las capas convolucionales a su ancho completo y el MLP a su tamaño original, utilizando los pesos densos del modelo base. Como resultado, el GGUF se comporta aproximadamente como el modelo denso original, no como el MoE podado.

No se dispone de información detallada sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). La documentación de Liquid AI indica que LFM2.5-230M está diseñado para fine-tuning y tareas específicas como extracción de datos y tool use, pero no se publican detalles de su preentrenamiento.

## Capacidades

- Generación de texto en inglés, con capacidad para completar frases, responder preguntas y producir texto coherente en contextos cortos.
- Extracción de datos estructurados a partir de texto no estructurado, una de las aplicaciones destacadas por Liquid AI para este modelo.
- Soporte de tool calling / function calling, lo que permite integrarlo en flujos de agentes que necesitan invocar herramientas externas.
- Tareas agénticas ligeras, como razonamiento multi-paso simple y toma de decisiones en entornos con recursos limitados.
- Capacidad de fine-tuning para dominios específicos, gracias a su tamaño compacto y a la licencia abierta.
- No soporta visión ni audio; es exclusivamente un modelo de texto.

## Casos de uso

- Extracción de datos de documentos: el modelo puede procesar facturas, correos electrónicos o formularios para extraer campos clave (fechas, importes, nombres) y estructurarlos en JSON, gracias a su capacidad de tool calling y su entrenamiento orientado a esta tarea.
- Asistentes conversacionales en dispositivos móviles: con un tamaño de 144 MB en Q4_K_M, puede ejecutarse localmente en un smartphone o en un Raspberry Pi, ofreciendo respuestas rápidas sin conexión a internet.
- Agentes de automatización ligera: integrado en un framework de agentes, puede gestionar tareas como enviar recordatorios, buscar información en una base de datos local o interactuar con APIs mediante function calling.
- Generación de código simple: aunque no es un modelo especializado en código, puede completar fragmentos cortos o generar scripts básicos en Python o JavaScript, útil para prototipado rápido en entornos sin GPU.
- Clasificación y etiquetado de texto: mediante fine-tuning, puede clasificar correos electrónicos como spam, categorizar tickets de soporte o etiquetar noticias por tema, aprovechando su bajo coste de inferencia.
- Resumen de texto en tiempo real: en aplicaciones de monitorización de redes sociales o feeds de noticias, el modelo puede generar resúmenes concisos de artículos o mensajes, funcionando en hardware de bajo consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del GGUF no incluye métricas como MMLU, HumanEval o GSM8K, y la documentación de Liquid AI para LFM2.5-230M tampoco proporciona cifras comparativas. Se recomienda consultar el repositorio del modelo base para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el modelo ocupa 144 MB (Q4_K_M), 233 MB (Q8_0) o 438 MB (F16). Añadiendo el contexto (por ejemplo, 32K tokens), la VRAM total no supera 1 GB en la mayoría de los casos.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluyendo tarjetas de gama baja como la GTX 1650 o integradas como la Intel Iris Xe. En la prueba documentada, una RTX 3060 alcanza entre 430 y 550 tokens por segundo.
- Cabe en consumer GPU: sí, incluso en GPUs integradas o en CPU con llama.cpp, aunque la velocidad será menor.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (si se convierte a formato compatible), o cualquier runtime que soporte GGUF.
- Latencia y throughput: en RTX 3060, se midieron ~540-550 t/s para Q4_K_M y ~430-450 t/s para Q8_0, según la model card.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El modelo base LFM2.5-230M es el único de su tamaño en la familia LFM2.5, y no se han encontrado referencias a otros modelos de 230M con arquitectura híbrida o MoE en el contexto de esta ficha. Se recomienda comparar con el modelo denso original (LiquidAI/LFM2.5-230M) para evaluar el impacto de la conversión ToMoE, aunque no se publican métricas cuantitativas.

## Limitaciones y advertencias

- El GGUF no reproduce el comportamiento MoE real del modelo ToMoE; es un equivalente denso que restaura los pesos completos, por lo que el ahorro computacional de la poda no se aplica en esta versión.
- El modelo es muy pequeño (230M parámetros), por lo que su capacidad de razonamiento complejo, generación de código avanzado o comprensión de contextos largos es limitada en comparación con modelos de mayor tamaño.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La licencia LFM Open License v1.0, aunque es de código abierto, puede tener restricciones específicas para uso comercial; se recomienda revisar el texto completo de la licencia en el repositorio de Liquid AI.
- El contexto máximo no está oficialmente especificado; el ejemplo de uso emplea 32768 tokens, pero no se garantiza un rendimiento óptimo en esa longitud.
- Riesgo de alucinación en tareas de generación libre, especialmente en dominios especializados sin fine-tuning previo.

## Enlaces

- Repositorio Hugging Face del modelo GGUF: https://huggingface.co/Nichonauta/LFM2.5-230M-ToMoE-GGUF
- Modelo base safetensors (ToMoE): https://huggingface.co/Nichonauta/LFM2.5-230M-ToMoE
- Modelo base denso de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-230M
- Documentación oficial de LFM2.5-230M: https://docs.liquid.ai/lfm/models/lfm25-230m
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Blog específico de LFM2.5-230M: https://www.liquid.ai/blog/lfm2-5-230m
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM2.5-230M/blob/main/LICENSE
