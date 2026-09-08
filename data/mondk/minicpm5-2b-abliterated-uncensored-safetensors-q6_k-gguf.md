# mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q6_K-GGUF

## Resumen

Este modelo es una cuantización GGUF en formato Q6_K del MiniCPM5-2B abliterated y uncensored, publicada por el usuario mondk. El modelo base, MiniCPM5-2B, es un transformer denso de aproximadamente 2.500 millones de parámetros desarrollado por OpenBMB, diseñado para despliegue local y escenarios con recursos limitados. La versión abliterated elimina los mecanismos de rechazo (refusals) del modelo original, lo que permite respuestas sin censura. Con un tamaño de archivo de 2,1 GB, está pensado para ejecutarse en dispositivos de gama baja o en CPUs mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

MiniCPM5-2B es un transformer denso de 2B parámetros que escala la receta de entrenamiento de MiniCPM5-1B. Está optimizado para ejecución en dispositivos locales, agentes de código y flujos de tool-use. No se dispone de información detallada sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF se realizó mediante llama.cpp, y la abliteración es un proceso posterior que modifica los pesos para reducir los rechazos de contenido.

## Capacidades

- Generación de texto y razonamiento en escenarios locales.
- Soporte para tool-use y flujos de trabajo de agentes.
- Asistentes locales y coding agents.
- Capacidad de razonamiento multi-paso (multi-step reasoning).
- No se dispone de información sobre soporte de visión o audio.
- Al ser abliterated, responde sin los filtros de seguridad del modelo original.

## Casos de uso

- Asistente local en dispositivos edge: gracias a su tamaño de 2B y cuantización Q6_K, puede ejecutarse en un portátil con GPU integrada o en una Raspberry Pi con suficiente RAM, usando llama.cpp.
- Agente de código en entornos sin conexión: el modelo soporta tool-use, por lo que puede integrarse en editores de código locales para autocompletar o generar funciones, sin depender de servicios en la nube.
- Automatización de tareas con llamadas a funciones: puede usarse en pipelines donde se necesita invocar APIs o herramientas externas, gracias a su soporte de function calling.
- Razonamiento multi-paso para análisis de datos: en entornos con recursos limitados, el modelo puede descomponer problemas complejos y ejecutar pasos intermedios.
- Chatbot de soporte técnico interno: con licencia Apache 2.0, se puede desplegar en una intranet corporativa para responder preguntas sobre documentación, sin enviar datos a terceros.
- Prototipado rápido de aplicaciones de IA: al ser un GGUF compacto, permite iterar rápidamente en el desarrollo de aplicaciones de lenguaje natural en máquinas locales, sin necesidad de GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo GGUF Q6_K pesa 2,1 GB, por lo que la VRAM estimada para inferencia con contexto corto es de aproximadamente 3-4 GB (incluyendo cache KV y overhead).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una RTX 3050 o superior, o una GPU integrada moderna con memoria unificada.
- También puede ejecutarse en CPU con llama.cpp, aunque la latencia será mayor.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, y cualquier otro runtime compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Modelos comparables: MiniCPM5-1B (OpenBMB) y el MiniCPM5-2B original. No se dispone de datos de rendimiento ni de contexto para compararlos. El modelo abliterated añade la eliminación de refusals, pero comparte la misma base de parámetros que MiniCPM5-2B.

## Limitaciones y advertencias

- Sesgos: no se dispone de información sobre sesgos conocidos.
- Riesgo de alucinación: al ser un modelo pequeño, la probabilidad de generar contenido factualmente incorrecto es mayor que en modelos de mayor tamaño.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo abliterated puede generar contenido no seguro o inapropiado; el usuario es responsable de su uso.
- Caveat: no hay evidencia de mantenimiento activo (0 descargas, 0 likes en HuggingFace), por lo que puede contener errores no corregidos.

## Enlaces

- HuggingFace: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors-Q6_K-GGUF
- Modelo base: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- GitHub OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- Ollama: https://ollama.com/openbmb/minicpm5
- Blog sobre modelos abliterated: https://locallyuncensored.com/blog/abliterated-models-guide.html
