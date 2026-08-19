# mimi94/subway-assistant-v1

## Resumen

El modelo `mimi94/subway-assistant-v1` es un ajuste fino (fine-tuning) del modelo base `unsloth/mistral-7b-instruct-v0.2-bnb-4bit`, desarrollado por el usuario mimi94. Se presenta como un modelo de generación de texto conversacional en inglés, con licencia Apache 2.0 y pesos en formato safetensors. El repositorio no incluye una descripción detallada de su propósito ni de los datos de entrenamiento, más allá de indicar que fue entrenado con las librerías Unsloth y TRL de HuggingFace.

A pesar de que el nombre sugiere un asistente para el metro (subway), no hay información pública que confirme su funcionalidad específica ni casos de uso documentados. El modelo no ha recibido descargas ni valoraciones en HuggingFace, lo que indica que es un proyecto reciente o de baja difusión. Su relevancia actual es limitada, aunque podría servir como punto de partida para experimentos de ajuste fino sobre Mistral 7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Mistral 7B) |
| Parametros totales | 7B (estimado, heredado del modelo base Mistral 7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificado; el modelo base Mistral 7B Instruct v0.2 soporta 32k, pero no se confirma) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se indican versiones GGUF u otras) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/mistral-7b-instruct-v0.2-bnb-4bit`, que a su vez es una version cuantizada a 4 bits de Mistral 7B Instruct v0.2. La arquitectura subyacente es un transformer decoder-only con atencion por ventanas deslizantes y 7 mil millones de parametros, disenada para generacion de texto autoregresiva. El autor indica que el entrenamiento se realizo con las librerias Unsloth (para acelerar el fine-tuning) y TRL de HuggingFace, pero no proporciona detalles sobre el dataset, el numero de tokens de entrenamiento, ni si se aplicaron tecnicas como RLHF o DPO. Tampoco se especifica si se realizo un ajuste completo o un LoRA/QLoRA, aunque el uso de un modelo base cuantizado a 4 bits sugiere que probablemente se empleo QLoRA.

No hay informacion sobre innovaciones tecnicas adicionales ni sobre el proceso de alineacion. El modelo final se publica en formato safetensors con un tamano de 4.9 GB, lo que corresponde aproximadamente a pesos en precision fp16 para un modelo de 7B.

## Capacidades

- Generacion de texto conversacional en ingles, basado en el comportamiento del modelo base Mistral 7B Instruct v0.2.
- No se documentan capacidades especificas adicionales como tool calling, agentes, razonamiento multi-paso, vision o audio.
- No se confirma soporte multilingue; el campo `language` indica unicamente `en`.
- No hay evidencia de un modo de pensamiento (thinking mode) ni de funciones especiales.

## Casos de uso

No se han documentado casos de uso concretos en la informacion disponible. Dado que el modelo es un fine-tuning de un asistente conversacional, podria emplearse en escenarios genericos de chat en ingles, pero no existe informacion que valide su rendimiento en tareas especificas. Se recomienda tratar este modelo como experimental y evaluar su comportamiento en el dominio deseado antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 4.9 GB, lo que sugiere pesos en fp16 (aproximadamente 14 GB de VRAM para inferencia sin cuantizacion adicional).
- No se especifican requisitos de hardware por parte del autor.
- Dado el tamano del modelo (7B), una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G) seria necesaria para inferencia en fp16.
- Con cuantizacion a 4 bits (por ejemplo, mediante GPTQ o AWQ), podria ejecutarse en GPUs con 8 GB de VRAM, aunque no se proporcionan archivos cuantizados en el repositorio.
- Opciones de despliegue: al ser un modelo compatible con Transformers y TGI, puede servirse con vLLM, llama.cpp (si se convierte a GGUF) u Ollama, pero no hay configuraciones predefinidas.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos de la misma categoria. El unico punto de referencia es el modelo base `unsloth/mistral-7b-instruct-v0.2-bnb-4bit`, del cual no se conocen diferencias de rendimiento tras el fine-tuning. No hay datos de benchmarks ni de evaluacion cualitativa.

## Limitaciones y advertencias

- No hay informacion sobre el dataset de entrenamiento, por lo que los sesgos y alucinaciones son desconocidos y podrian ser significativos.
- El modelo solo soporta ingles; no es adecuado para otros idiomas.
- Al ser un fine-tuning de un modelo de 7B, su capacidad de razonamiento complejo y de manejo de contextos largos es limitada en comparacion con modelos mas grandes.
- No se ha validado su comportamiento en entornos de produccion; se recomienda una evaluacion exhaustiva antes de cualquier uso comercial.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido probado por la comunidad.

## Enlaces

- [HuggingFace - mimi94/subway-assistant-v1](https://huggingface.co/mimi94/subway-assistant-v1)
- [Modelo base: unsloth/mistral-7b-instruct-v0.2-bnb-4bit](https://huggingface.co/unsloth/mistral-7b-instruct-v0.2-bnb-4bit) (referencia)
