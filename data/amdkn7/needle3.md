# Amdkn7/needle3

## Resumen

Needle 3 es un modelo de lenguaje orientado a la inferencia en dispositivo (on-device) desarrollado por Amdkn7 y distribuido a través del ecosistema Cactus Compute. Está especializado en tres tareas concretas: tool calling (invocación de funciones), extracción estructurada de información y generación de embeddings de texto. Su propuesta principal es ofrecer capacidades de agente y llamada a herramientas en dispositivos de consumo, incluyendo entornos web mediante WebAssembly, con un peso de repositorio de aproximadamente 0,3 GB.

El modelo se publica bajo licencia Apache 2.0 y se distribuye con el runtime propietario de Cactus Compute (librería `cactus-compute`), que descarga y cachea el motor y los pesos en el primer uso. El repositorio incluye dos artefactos: `needle3.cact` (formato empaquetado para el motor Cactus) y `checkpoints/needle3.safetensors` (pesos en formato safetensors).

La relevancia de Needle 3 radica en su enfoque de despliegue en el borde: frente a modelos generalistas de gran tamaño, apuesta por un modelo compacto y cuantizado pensado para ejecutarse en navegador y dispositivos de consumo, con una API de Python que abstrae la definición de herramientas mediante decoradores. No se han publicado detalles sobre arquitectura, número de parámetros ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | cuantizacion mencionada en tags; formatos concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`checkpoints/needle3.safetensors`) y formato propietario `.cact` (`needle3.cact`) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de transformer, uso de MoE, SSM o arquitecturas híbridas), el número de parámetros, la composición del dataset de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente describe el propósito funcional (tool calling, extracción estructurada y embeddings) y el modo de despliegue mediante el runtime Cactus Compute.

La innovación técnica destacable, según la información disponible, es el propio formato de empaquetado `.cact` y el motor de ejecución asociado, que permite ejecutar el modelo en dispositivos de consumo y en el navegador vía WebAssembly. El tamaño del repositorio (0,3 GB) sugiere un modelo compacto, presumiblemente cuantizado, aunque no se especifica el número de parámetros ni el esquema de cuantización exacto.

## Capacidades

- Tool calling y function calling: la API de Python permite declarar funciones con el decorador `@cactus.tool` y el agente las invoca automáticamente a partir de lenguaje natural.
- Extracción estructurada de información: según la model card, es una de las tareas objetivo del modelo.
- Generación de embeddings de texto: el modelo también produce representaciones vectoriales para búsqueda o similitud semántica.
- Ejecución de agentes de un solo paso con herramientas: el ejemplo de la model card muestra `agent.run(...)` devolviendo resultados de la herramienta invocada.
- Despliegue en el borde: pensado para on-device y navegador mediante WebAssembly.
- Generación de texto: el pipeline declarado es `text-generation`.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes locales con acceso a funciones del sistema: el modelo puede invocar herramientas definidas por el desarrollador (por ejemplo, consultar el clima o leer un fichero) sin salir del dispositivo, lo que encaja con su orientación on-device y evita enviar datos a la nube.
- Extracción estructurada en formularios y documentos: adecuado para convertir texto libre en campos tipados (JSON) en aplicaciones móviles o web, aprovechando la tarea de structured extraction declarada por el autor.
- Búsqueda semántica local: al generar embeddings, puede alimentar índices vectoriales en el propio dispositivo para recuperación de documentos sin infraestructura de servidor.
- Automatización en el navegador: gracias al soporte WebAssembly, puede integrarse en aplicaciones web para ofrecer agentes con tool calling sin backend dedicado.
- Enrutamiento de intenciones en asistentes de voz o chat: el modelo puede decidir qué función invocar a partir de la petición del usuario, como paso previo a la ejecución de la lógica de negocio.
- Prototipado rápido de agentes: la API de decoradores de Cactus Compute permite definir herramientas en pocas líneas, útil para validar flujos de agente antes de migrar a modelos mayores.
- Aplicaciones con requisitos de privacidad: al ejecutarse en el dispositivo y pesar aproximadamente 0,3 GB, es viable en escenarios donde los datos no pueden salir del terminal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la web de Needle (https://cactuscompute.com/needle) para consultar benchmarks, pero no se incluyen cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el tamaño del repositorio (0,3 GB) sugiere un modelo muy compacto que podría ejecutarse en CPU y en memoria unificada de dispositivos móviles.
- GPU recomendadas: no disponible. El enfoque on-device y WebAssembly apunta a ejecución en CPU y aceleradores integrados más que a GPU de datacenter.
- Compatibilidad con GPU de consumo: no disponible de forma detallada; por tamaño, es plausible que quepa en cualquier GPU de consumo actual, pero no se confirma en la información proporcionada.
- Opciones de despliegue: runtime `cactus-compute` (pip), con binarios y plataformas soportadas en el repositorio Cactus-Compute/cactus. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes (parámetros, contexto, benchmarks) para establecer una comparativa rigurosa con alternativas de la misma categoría. La información pública del modelo no permite confirmar equivalencias con otros modelos de tool calling en el borde.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Needle 3 | no disponible | no disponible | Apache 2.0 | On-device, tool calling, extracción estructurada, embeddings; runtime Cactus |
| Alternativas comparables | no disponible | no disponible | no disponible | No se dispone de datos para comparar |

## Limitaciones y advertencias

- Ausencia de información técnica: no se publican parámetros, contexto, idiomas ni detalles de entrenamiento, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: no cuantificado; como modelo de generación de texto, es susceptible de producir llamadas a herramientas incorrectas o argumentos inválidos.
- Dependencia del runtime Cactus Compute: el uso práctico requiere la librería `cactus-compute` y el formato `.cact`; no se documenta compatibilidad con ecosistemas estándar como transformers, llama.cpp o vLLM.
- Idiomas: no se especifican los idiomas soportados, por lo que no puede garantizarse un buen rendimiento en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del runtime y de los binarios distribuidos por Cactus Compute, que pueden tener términos propios.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-06), lo que sugiere una publicación muy reciente y sin validación comunitaria.
- Benchmarks: no hay resultados publicados en el repositorio, por lo que el rendimiento real en tool calling y extracción estructurada no está verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Amdkn7/needle3
- Web de Needle (detalles, benchmarks y demo en navegador): https://cactuscompute.com/needle
- Repositorio de Cactus (runtime y binarios): https://github.com/cactus-compute/cactus
- Runtime en Hugging Face: https://huggingface.co/Cactus-Compute/cactus
- Guía de la API de Python: https://cactuscompute.com/blog/needle-python-docs
- Diseño de herramientas para Needle: https://cactuscompute.com/blog/designing-tools-for-needle
- Extracción estructurada con Needle: https://cactuscompute.com/blog/structured-extraction-with-needle
- Fine-tuning de Needle: https://cactuscompute.com/blog/finetuning-needle
