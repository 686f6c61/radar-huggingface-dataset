# RikuNortje/SmolLm2StaticSupport

## Resumen

SmolLm2StaticSupport es un modelo de lenguaje de tamaño compacto (1.7B parámetros) desarrollado por RikuNortje, que consiste en un fine-tuning del modelo SmolLM2-1.7B-Instruct de HuggingFaceTB. El modelo ha sido entrenado y convertido al formato GGUF utilizando la librería Unsloth, lo que permite ejecutarlo con llama.cpp y otras herramientas compatibles. Su principal característica es que está optimizado para despliegue en entornos con recursos limitados, gracias a su cuantización Q4_K_M que reduce el tamaño del archivo a aproximadamente 1.1 GB. No se ha publicado información sobre el dataset de fine-tuning ni sobre las capacidades específicas del modelo, por lo que su comportamiento se corresponde en gran medida con el del modelo base SmolLM2-1.7B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer |
| Parámetros totales | 1.711.378.432 |
| Parámetros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

Nota: El dato de parámetros totales se ha obtenido de los metadatos de safetensors en el repositorio, aunque el único archivo de pesos publicado es el GGUF Q4_K_M.

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer del modelo base SmolLM2-1.7B-Instruct, un LLM compacto diseñado para aplicaciones on-device. El proceso de entrenamiento ha consistido en un fine-tuning realizado con Unsloth, que según la model card permite entrenar 2 veces más rápido y simplifica la conversión a formato GGUF. No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El único artefacto publicado es el archivo SmolLM2-1.7B-Instruct.Q4_K_M.gguf, listo para su uso con llama.cpp.

## Capacidades

- Generación de texto instructivo: el modelo puede responder a instrucciones y mantener conversaciones gracias a su naturaleza instructiva.
- Ejecución local eficiente: al estar cuantizado en Q4_K_M y en formato GGUF, puede ejecutarse en CPU o en GPUs de baja capacidad.
- Compatibilidad con llama.cpp: se puede invocar mediante `llama-cli -hf RikuNortje/SmolLm2StaticSupport --jinja`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Asistente conversacional ligero: el modelo puede desplegarse como chatbot en aplicaciones de escritorio o móviles, aprovechando su bajo consumo de recursos.
- Ejecución en CPU sin GPU: gracias a su cuantización, es viable ejecutarlo en servidores o equipos sin acelerador gráfico, usando llama.cpp.
- Prototipado rápido de aplicaciones de lenguaje: los desarrolladores pueden integrarlo en pipelines de prueba con el fin de validar ideas antes de escalar a modelos mayores.
- Educación y experimentación: es útil para aprender sobre inferencia de LLMs en local, cuantización y uso de llama.cpp.
- Despliegue en entornos con restricciones de memoria: el tamaño de 1.1 GB permite su uso en dispositivos con poca RAM o VRAM, como portátiles antiguos o mini PC.
- Integración en pipelines de inferencia con llama.cpp: puede servir como modelo de respaldo en servidores de baja capacidad o en procesos de automatización que requieran respuestas de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.1 GB para los pesos en Q4_K_M, más overhead de contexto y buffers, por lo que se recomienda al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con 2-4 GB de VRAM, por ejemplo una NVIDIA GTX 1650, RTX 3050 o superior. También es ejecutable en CPU.
- Compatibilidad con consumer GPU: sí, es un modelo de tamaño reducido que cabe en GPUs de consumo.
- Opciones de despliegue: llama.cpp (recomendado), Ollama (si se importa el GGUF), y cualquier runtime compatible con GGUF. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia, aunque no se especifica cuál.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLm2StaticSupport | 1.711.378.432 | no disponible | GGUF | no disponible | HuggingFace |
| SmolLM2-1.7B-Instruct (base) | 1.711.378.432 | no disponible | safetensors, GGUF | no disponible | HuggingFaceTB |
| Qwen2.5-1.5B | 1.540.000.000 | no disponible | safetensors, GGUF | no disponible | Alibaba |

Nota: La comparativa se limita a parámetros y formato, ya que no hay datos de benchmarks disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: se desconoce, pero al tratarse de un modelo pequeño es probable que presente más alucinaciones que modelos de mayor tamaño.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede confirmar si el uso comercial está permitido.
- Caveat para producción: al no disponer de información sobre el dataset de fine-tuning ni de evaluaciones, no se recomienda su uso en sistemas críticos sin una validación previa exhaustiva.

## Enlaces

- Repositorio del modelo: https://huggingface.co/RikuNortje/SmolLm2StaticSupport
- Colección SmolLM2 de HuggingFaceTB: https://huggingface.co/collections/HuggingFaceTB/smollm2
- Unsloth: https://github.com/unslothai/unsloth
