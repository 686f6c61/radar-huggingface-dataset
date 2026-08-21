# Sohailhosseini/Ornith-1.0-9B-FP8

## Resumen

Ornith-1.0-9B-FP8 es una cuantización en punto flotante de 8 bits (FP8) del modelo base `ornith-ai/Ornith-1.0-9B`, un modelo de agente de codificación multimodal desarrollado por Ornith AI. La cuantización, realizada por Sohailhosseini, reduce el tamaño de los pesos lineales a la mitad, pasando de 18,8 GB a 11,9 GB, con una compresión de 1,58x y una pérdida de calidad considerada casi nula (near-lossless). El modelo base es un transformer denso de 9,4 mil millones de parámetros con una ventana de contexto de 262 144 tokens (256K), diseñado para tareas de agente de codificación en entornos de una sola GPU o edge.

La relevancia de esta versión FP8 radica en que permite ejecutar el modelo en hardware más asequible sin necesidad de calibración adicional, manteniendo la compatibilidad con vLLM y el pipeline de imagen-texto a texto. El modelo hereda la licencia MIT del original, lo que facilita su uso comercial. Está pensado para desarrolladores que necesitan un agente de codificación con tool calling, contexto largo y capacidades multimodales en un solo dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (según tags, basado en Qwen3.5, no confirmado oficialmente) |
| Parametros totales | 9 409 813 744 (9,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | FP8 (8 bits) mediante compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.0-9B es un transformer denso de 9,4B parámetros con arquitectura multimodal (procesa texto e imágenes). Según la documentación oficial, soporta una ventana de contexto de 262 144 tokens y expone una interfaz compatible con OpenAI, lo que facilita su integración en herramientas existentes. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) en la información disponible.

La versión FP8 se obtiene mediante cuantización de los pesos lineales a 8 bits, dejando sin cuantizar las capas de visión (`visual`, `vision_tower`, `vision_model`, `multi_modal_projector`, `merger`) y la cabeza de salida (`lm_head`). El proceso se realizó en una GPU L40S sin datos de calibración, lo que implica que la cuantización es directa y no requiere ajuste posterior. El formato compressed-tensors es compatible con vLLM, que es el motor de inferencia recomendado.

## Capacidades

- Generación de código y razonamiento: el modelo está especializado en tareas de agente de codificación, incluyendo generación, revisión y depuración de código.
- Tool calling / function calling: soporta invocación de herramientas, lo que permite integrarlo en flujos de trabajo de agentes que necesitan interactuar con APIs, bases de datos o entornos de ejecución.
- Agentes multi-paso: puede mantener razonamiento encadenado y ejecutar múltiples pasos para completar tareas complejas, gracias a su ventana de contexto de 256K tokens.
- Capacidades multimodales: al ser un modelo image-text-to-text, puede procesar imágenes junto con texto, útil para tareas como entender capturas de pantalla, diagramas o documentación visual.
- Multilingüismo: no se dispone de información sobre los idiomas soportados, aunque al estar basado en Qwen3.5 es probable que tenga cobertura multilingüe amplia (no confirmado).
- Interfaz OpenAI-compatible: facilita el despliegue en entornos que ya usan la API de OpenAI, como frameworks de agentes o asistentes de desarrollo.

## Casos de uso

- Agente de codificación en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para autocompletar código, refactorizar funciones y explicar fragmentos complejos, aprovechando su contexto largo para mantener el estado del proyecto.
- Automatización de tareas de desarrollo: con tool calling, puede ejecutar comandos de terminal, leer archivos, ejecutar tests y modificar código de forma autónoma, actuando como un asistente de programación en pipelines de CI/CD.
- Análisis de documentación técnica: al procesar imágenes y texto, puede interpretar diagramas de arquitectura, capturas de pantalla de errores o esquemas de bases de datos, y generar explicaciones o código asociado.
- Soporte técnico automatizado: su capacidad de razonamiento multi-paso y contexto largo permite gestionar conversaciones de soporte donde el usuario describe problemas de código con capturas de pantalla, y el modelo sugiere soluciones paso a paso.
- Generación de código en entornos edge: al ser cuantizado a FP8 y caber en una GPU de consumo, puede desplegarse en estaciones de trabajo locales sin conexión a internet, ideal para entornos con requisitos de privacidad de código.
- Revisión de código en repositorios grandes: con 256K tokens de contexto, puede analizar múltiples archivos de un repositorio y detectar bugs, vulnerabilidades o inconsistencias, emitiendo informes detallados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo cuantizado no incluye métricas de rendimiento, y la documentación del modelo base tampoco proporciona tablas comparativas en las fuentes consultadas. Se recomienda consultar el repositorio oficial de Ornith AI para futuras actualizaciones.

## Requisitos de hardware

- Compute capability mínima: 8.9 (arquitecturas Ada Lovelace o Hopper). Esto incluye GPUs como RTX 40 series (4090, 4080, 4070) y H100, pero excluye A100 (compute capability 8.0) y RTX 30 series.
- VRAM estimada: los pesos FP8 ocupan 11,9 GB en disco. Con overhead de activaciones y KV cache, se estima un consumo de 14-16 GB para inferencia con contexto máximo. Cabe en GPUs con 16 GB o más, como RTX 4080, RTX 4090, L40S, L40, o H100.
- GPU recomendadas: RTX 4090 (24 GB) para uso local, o L40S (48 GB) para servidores. En entornos de producción, H100 (80 GB) permite mayor throughput.
- Opciones de despliegue: vLLM es el motor recomendado (ver ejemplo de uso en la model card). También puede usarse con TGI o llama.cpp si se convierte a GGUF, aunque el formato compressed-tensors está optimizado para vLLM.
- Latencia y throughput: no se proporcionan datos específicos. En una RTX 4090, se espera una generación de 30-50 tokens/s para modelos de 9B en FP8, pero esto es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos de la misma categoría (agentes de codificación multimodales de ~9B). El modelo base Ornith-1.0-9B se posiciona como alternativa a otros modelos de codificación como CodeLlama-7B o DeepSeek-Coder-6.7B, pero no hay datos de rendimiento publicados. La principal diferencia es su ventana de contexto de 256K tokens y su naturaleza multimodal, que no está presente en la mayoría de modelos de codificación de tamaño similar. Se recomienda evaluar el modelo directamente en las tareas objetivo.

## Limitaciones y advertencias

- La cuantización FP8, aunque se describe como near-lossless, puede introducir pequeñas degradaciones en tareas de precisión numérica o razonamiento matemático complejo.
- Requiere hardware con compute capability >= 8.9 para un rendimiento óptimo. En GPUs más antiguas, la inferencia será lenta o no funcionará correctamente.
- No se dispone de información sobre sesgos o alucinaciones específicas del modelo. Como todo modelo de lenguaje, puede generar código incorrecto o inventar APIs inexistentes.
- La licencia MIT permite uso comercial sin restricciones, pero la cuantización no modifica los términos del modelo base; se debe verificar que el uso cumpla con la licencia del modelo original.
- El modelo base no tiene documentación pública sobre su dataset de entrenamiento, lo que dificulta evaluar su cobertura idiomática o posibles sesgos culturales.
- Para producción, se recomienda validar el modelo en un conjunto de pruebas propio, ya que no hay benchmarks oficiales publicados.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Sohailhosseini/Ornith-1.0-9B-FP8
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.0-9B
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Página oficial de Ornith AI: https://ornith.online/
- Página del modelo 9B: https://ornith.online/ornith-1-0-model-9b
