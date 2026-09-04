# SakitsunaAI/NektusAISaracatsuna

## Resumen

El modelo **NektusAISaracatsuna** es un *fine-tuning* del modelo base **DeepSeek Coder 1.3B Instruct**, desarrollado por **SakitsunaAI**. Está diseñado para tareas de generación de texto y conversación en inglés, con un enfoque especial en asistencia de código, ya que hereda las capacidades del modelo base de DeepSeek. Con aproximadamente 1.346 millones de parámetros (1,35 mil millones), es un modelo de tamaño pequeño que puede ejecutarse en hardware modesto.

El entrenamiento se ha realizado mediante *supervised fine-tuning* (SFT) utilizando **Unsloth**, una librería que acelera el entrenamiento de modelos basados en Llama, y la librería **TRL** de Hugging Face. La licencia **Apache 2.0** permite su uso comercial sin restricciones significativas. El modelo se publica en formato **safetensors** y es compatible con `text-generation-inference`.

No se han publicado detalles sobre la longitud de contexto, los datos de entrenamiento ni benchmarks en la información disponible. A pesar de ello, su relevancia radica en su tamaño compacto y en la posibilidad de desplegarlo en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura tipo Llama según etiquetas) |
| Parametros totales | 1.346.471.936 (≈1,35 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; tamaño del repo: 2,7 GB) |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un *fine-tuning* del **DeepSeek Coder 1.3B Instruct**, que a su vez es un modelo *decoder-only* basado en la arquitectura Transformer. Según las etiquetas de Hugging Face, se clasifica dentro de la familia **Llama**, lo que sugiere que mantiene la estructura de atención y las capas características de los modelos Llama. No se especifica si se han modificado capas o se ha añadido algún mecanismo especial.

El entrenamiento se ha realizado mediante *supervised fine-tuning* (SFT), tal y como indican las etiquetas `sft` y `trl`. El proceso se ha acelerado con **Unsloth**, una librería optimizada para el entrenamiento eficiente de modelos basados en Llama, que según la model card reduce el tiempo de entrenamiento a la mitad. No se han publicado detalles sobre el dataset utilizado, el número de tokens de entrenamiento ni si se ha aplicado RLHF o DPO.

## Capacidades

- Generación de texto y conversación en inglés, orientada a interacciones de tipo chat.
- Asistencia en tareas de programación y generación de código, heredada del modelo base DeepSeek Coder.
- Inferencia compatible con el pipeline `text-generation` de Hugging Face Transformers.
- No se documentan capacidades de *tool calling*, visión, audio ni razonamiento multi-paso en la información disponible.

## Casos de uso

- **Asistente de código en el IDE**: el modelo puede integrarse en editores como VS Code para autocompletar o explicar fragmentos de código en inglés, gracias a su base DeepSeek Coder.
- **Chatbot de soporte técnico**: adecuado para atender consultas de usuarios en inglés en entornos de bajo tráfico, dada su pequeña cantidad de parámetros.
- **Generación de documentación técnica**: puede producir descripciones y comentarios de código a partir de entradas textuales o de ejemplos de funciones.
- **Herramienta educativa para programación**: sirve como tutor que explica conceptos de programación o resuelve dudas sencillas en inglés.
- **Automatización de tareas de texto**: para resúmenes, corrección gramatical o reformulación de textos en inglés, siempre que la longitud de la entrada se ajuste al contexto (no especificado).
- **Prototipado rápido de aplicaciones de chat**: al ser compatible con `endpoints_compatible`, puede desplegarse en soluciones como TGI o vLLM para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en FP16/BF16 (~2,7 GB), se estima un consumo de entre 4 y 6 GB de VRAM para contextos cortos, incluyendo activaciones y KV cache.
- **GPU recomendadas**: cualquier GPU con al menos 6 GB de VRAM, como una RTX 3060 12GB, RTX 4060 Ti, o superiores (A100, H100, RTX 4090).
- **Consumer GPU**: cabe en GPUs de gama media; no requiere hardware de servidor.
- **Opciones de despliegue**: Transformers, vLLM, llama.cpp, Ollama y Text Generation Inference (TGI).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para realizar una comparativa exhaustiva con modelos similares. El único modelo comparable directo es su modelo base, **DeepSeek Coder 1.3B Instruct**, del que hereda arquitectura y tamaño. Otros modelos de la misma organización (SlactusAIAstra, NexusAISpatra) no son comparables por su tamaño o arquitectura.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni datos sobre comportamientos indeseados.
- Al ser un modelo de 1,35 mil millones de parámetros, puede presentar una mayor tendencia a la alucinación en comparación con modelos de mayor tamaño.
- La longitud de contexto no está documentada, lo que limita su uso en aplicaciones que requieran ventanas largas.
- Solo se declara soporte para inglés, por lo que su rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero requiere incluir el aviso de licencia y las atribuciones correspondientes.
- El modelo no tiene descargas ni likes en Hugging Face y no se han publicado benchmarks, por lo que no se recomienda para producción sin una validación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/SakitsunaAI/NektusAISaracatsuna
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-instruct
- Unsloth: https://github.com/unslothai/unsloth
