# CrocoCpp/Ektome-Qwen3.8-27B-PristinelyUncensored-Q4_K_M-GGUF

## Resumen

El modelo CrocoCpp/Ektome-Qwen3.8-27B-PristinelyUncensored-Q4_K_M-GGUF es una conversión a formato GGUF del modelo base Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored, realizada mediante la herramienta gguf-my-repo de llama.cpp. Se trata de un modelo de lenguaje de 27.320 millones de parámetros (27,3B) orientado a la generación de texto sin censura, con etiquetas que indican técnicas de "abliteration" y "repair" para eliminar restricciones de contenido. La conversión a GGUF permite su ejecución eficiente en CPU y GPU mediante llama.cpp, lo que facilita su despliegue local.

El modelo está pensado para desarrolladores e investigadores que necesitan un modelo de lenguaje con respuestas sin filtros de seguridad, aunque esta característica conlleva riesgos de generación de contenido inapropiado. Con licencia Apache 2.0 y soporte únicamente para inglés, su tamaño de 27B lo sitúa en un rango medio-alto, requiriendo recursos de hardware considerables para su ejecución.

La relevancia actual de este modelo radica en la tendencia de personalización de modelos de lenguaje mediante técnicas de "abliteration" para eliminar la censura, y su distribución en formato GGUF amplía su accesibilidad en entornos locales y edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la model card proporcionada. El nombre "Qwen3.8" sugiere una posible base en la familia Qwen, pero no se confirma. El modelo base Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored incluye etiquetas como "abliterated", "abliteration-repair", "capability-preserving", "ektome" y "surrogate-null", lo que indica que ha sido sometido a técnicas de abliteration para eliminar direcciones de rechazo y preservar capacidades, pero no se aportan detalles sobre el proceso de entrenamiento, el dataset utilizado ni si se aplicaron métodos como RLHF o DPO. La conversión a GGUF no modifica los pesos, solo el formato de almacenamiento.

## Capacidades

- Generación de texto en inglés, con respuestas sin filtros de censura aparentes.
- No se ha especificado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se indica capacidad de procesamiento de visión, audio u otras modalidades.
- El modelo es de tipo texto-generación (pipeline: text-generation).
- No se dispone de información sobre capacidades multilingües más allá del inglés.

## Casos de uso

- Generación de contenido creativo sin restricciones: el modelo puede producir textos literarios, guiones o diálogos con libertad temática, gracias a su entrenamiento sin censura. Es adecuado para escritores que necesitan explorar temas sensibles sin limitaciones impuestas por otros modelos.
- Chatbots para entornos controlados: en aplicaciones donde se requiere respuestas directas sin filtros, como asistentes para adultos, simulaciones de personajes o juegos de rol. Su formato GGUF permite integrarlo fácilmente en aplicaciones locales con llama.cpp.
- Investigación en seguridad de IA: para estudiar los efectos de la eliminación de censura en modelos de lenguaje, analizando comportamientos, sesgos y riesgos asociados. El modelo sirve como caso de estudio de técnicas de abliteration.
- Generación de datos sintéticos: para crear datasets con contenido variado y sin las restricciones típicas de otros modelos, útil en entornos de investigación donde se necesitan ejemplos diversos.
- Prototipado rápido en entornos locales: al ser GGUF, se puede ejecutar con llama.cpp en CPU o GPU, permitiendo pruebas rápidas sin depender de servicios en la nube. Ideal para validar ideas antes de escalar.
- Educación y formación: para demostrar técnicas de "abliteration" y sus consecuencias en el comportamiento de los modelos, así como para enseñar el despliegue de modelos cuantizados en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El archivo GGUF Q4_K_M tiene un tamaño de 16,8 GB, por lo que se requiere al menos esa cantidad de VRAM o RAM para cargar el modelo en memoria.
- Para inferencia en GPU, se recomienda una tarjeta con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, o similar). Con 24 GB se podría trabajar con contextos más largos.
- En CPU, se puede ejecutar con llama.cpp, pero se necesitaría al menos 20 GB de RAM para el modelo y el contexto.
- No se dispone de datos de latencia o throughput específicos.
- Opciones de despliegue: llama.cpp (CLI y servidor), compatible con la mayoría de plataformas (Linux, macOS, Windows). También se puede usar con bindings de Python como llama-cpp-python.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" y "abliterated", puede generar contenido ofensivo, ilegal, peligroso o sexualmente explícito sin filtros. Su uso en producción debe considerar estos riesgos y establecer medidas de control externas si es necesario.
- Solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- No se ha documentado información sobre sesgos, alucinaciones o comportamientos no deseados más allá de la ausencia de censura.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales dependiendo del contexto.
- No se dispone de información sobre la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- El modelo base ha sido modificado con técnicas de "abliteration-repair", pero no se detalla el impacto en la calidad general o en capacidades específicas.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/CrocoCpp/Ektome-Qwen3.8-27B-PristinelyUncensored-Q4_K_M-GGUF)
- [Modelo base Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored](https://huggingface.co/Zynerji/Ektome-Qwen3.8-27B-PristinelyUncensored)
