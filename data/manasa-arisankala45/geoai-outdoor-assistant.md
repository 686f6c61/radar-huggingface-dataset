# manasa-arisankala45/geoai-outdoor-assistant

## Resumen

`manasa-arisankala45/geoai-outdoor-assistant` es un repositorio de Hugging Face publicado por la usuaria manasa-arisankala45 que no contiene un modelo nuevo, sino una aplicación denominada GeoAI Outdoor Assistant construida sobre SmolLM2-1.7B-Instruct de Hugging Face. La propia model card lo declara explícitamente: "No changes have been made to the base model weights" y "This project uses the base model without fine-tuning". Por tanto, no hay entrenamiento, ajuste ni pesos publicados; el repositorio documenta cómo se integra un modelo preentrenado en un flujo de procesamiento de consultas.

El problema que aborda es la interpretación en lenguaje natural de peticiones relacionadas con actividades al aire libre: actividad concreta (senderismo, carrera, picnic), lugar, radio de búsqueda y franja horaria. Según la model card, la aplicación combina la salida del modelo con procesamiento de consultas basado en reglas y datos geográficos externos, de modo que el LLM actúa como capa de comprensión de intención y no como fuente de verdad geográfica.

Su relevancia es doble. Por un lado, es un ejemplo del patrón "repositorio de aplicación con model card de modelo", cada vez más habitual en Hugging Face, y conviene identificarlo para no confundirlo con un fine-tune. Por otro, ilustra una arquitectura realista para asistentes geoespaciales con un modelo de 1,7 mil millones de parámetros, ejecutable en hardware de consumo. El repositorio tiene 0 descargas y 1 like, está marcado como creado el 2026-10-24 y no incluye evaluación alguna.

## Especificaciones técnicas

Los datos del modelo base proceden de la documentación pública de SmolLM2-1.7B-Instruct; este repositorio no publica especificaciones propias.

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (herencia del modelo base SmolLM2-1.7B-Instruct); sin modificaciones en este repositorio |
| Parametros totales | 1,7 mil millones (modelo base) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | 8192 tokens según la model card del modelo base; no verificado en este repositorio |
| Tipos de cuantizacion | no disponible en este repositorio; el modelo base admite FP16/BF16, INT8 y cuantización de 4 bits vía llama.cpp, Ollama o bitsandbytes |
| Idiomas soportados | no disponible en este repositorio; el modelo base está orientado principalmente al inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible en este repositorio (no se publican pesos propios); el modelo base se distribuye en safetensors y existen conversiones GGUF de la comunidad |

## Arquitectura y entrenamiento

En este repositorio no hay arquitectura propia ni entrenamiento. La model card indica que se utiliza el modelo preentrenado SmolLM2-1.7B-Instruct "without fine-tuning" y que no se han modificado los pesos. Cualquier dato de arquitectura o de datos de entrenamiento corresponde al modelo base: un transformer decoder-only de 1,7 mil millones de parámetros, entrenado por Hugging Face sobre un corpus de gran escala (del orden de billones de tokens según su documentación pública) y posteriormente alineado para instrucciones. Este repositorio no aporta información verificable adicional sobre composición del dataset, número exacto de tokens, RLHF ni DPO.

La innovación, si puede llamarse así, está en la capa de aplicación: un flujo híbrido en el que el LLM interpreta la consulta del usuario y extrae parámetros estructurados (actividad, ubicación, radio, tiempo), que después se procesan con reglas y se combinan con servicios de datos geográficos externos. Los resultados de búsqueda web asociados a proyectos con nombre similar describen la recuperación de ubicación exacta, meteorología actual, calidad del aire y parques cercanos; no se ha confirmado que esos proyectos (Space de Bhar1324, repositorio de F4K3S4T1SH) pertenezcan a la misma autora, por lo que deben tratarse como referencias de nombre coincidente y no como documentación oficial de este repositorio.

## Capacidades

- Generación de texto e interpretación de lenguaje natural en inglés, heredadas del modelo base.
- Extracción de entidades y parámetros de consulta: actividad, lugar, radio de búsqueda y marco temporal, según el uso previsto declarado.
- Integración como componente de un pipeline con procesamiento basado en reglas y datos geográficos externos.
- Soporte de tool calling / function calling: no documentado en este repositorio; el modelo base dispone de plantilla de chat, pero no se declara soporte verificado de herramientas.
- Capacidades de agente y razonamiento multi-paso: no documentadas; un modelo de 1,7 mil millones de parámetros tiene fiabilidad limitada en planificación encadenada.
- Capacidades multilingües: no documentadas; el modelo base está centrado en inglés y no se declara soporte de castellano.
- Visión, audio, thinking mode o decodificación especulativa: no disponibles.
- Ejecución local/offline: viable por el tamaño reducido del modelo base, aunque no se detalla en la model card.

## Casos de uso

- Análisis de intención en buscadores de actividades al aire libre: el modelo recibe la frase del usuario ("quiero correr 10 km cerca de X el sábado por la mañana") y devuelve los campos actividad, ubicación, radio y franja horaria que alimentan el motor de búsqueda. Es adecuado porque la tarea es de extracción acotada, no de conocimiento factual.
- Orquestación de llamadas a APIs meteorológicas y de calidad del aire: el texto interpretado se traduce en parámetros de consulta para servicios externos y la respuesta se redacta en lenguaje natural. El modelo base de 1,7 mil millones es suficiente para la parte de formateo y resumen.
- Enrutado de consultas en un sistema GIS mayor: uso como clasificador barato que decide si una petición requiere datos geoespaciales, meteorológicos o ambos, antes de invocar un modelo mayor o una consulta SQL/PostGIS.
- Asistente embebido en dispositivo: con cuantización de 4 bits el modelo ocupa alrededor de 1 GB, por lo que puede desplegarse en un portátil sin GPU dedicada o en una placa tipo Raspberry Pi para aplicaciones de campo sin conectividad.
- Prototipado rápido de producto: sirve para validar prompts, plantillas de chat y esquemas de salida JSON antes de migrar a un modelo mayor, reduciendo coste de iteración en las primeras fases.
- Generación de resúmenes de condiciones para una salida de una sola frase: la descripción del Space asociado menciona "gives you a brief..." resumen tras recuperar ubicación, clima, calidad del aire y parques; este modelo encaja en esa capa de redacción final.
- Material didáctico de arquitectura híbrida LLM + reglas + datos abiertos: el repositorio documenta el patrón de integración, útil en cursos y hackatones geoespaciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones propias, no aporta métricas de precisión en extracción de entidades ni de calidad de respuesta, y registra 0 descargas y 1 like en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros verificables. Cualquier cifra que se cite para SmolLM2-1.7B-Instruct debe tomarse de la model card del modelo base, no de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base: aproximadamente 3,4 GB en FP16/BF16 (solo pesos), en torno a 1,8 GB en INT8 y entre 1,0 y 1,2 GB en cuantización GGUF de 4 bits. La caché KV crece con el contexto; a 8192 tokens añade una sobrecarga no despreciable incluso en un modelo pequeño.
- GPU recomendadas: A100 o H100 para servir en lote con vLLM o TGI con alto throughput; RTX 4090, RTX 4080 o L4 para inferencia interactiva en FP16; RTX 4060 Ti, RTX 3060 o RTX 4070 para FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, con holgura. Cualquier GPU con 6 GB o más ejecuta el modelo en FP16 si se limita el contexto; con cuantización de 4 bits funciona en GPU de 4 GB e incluso en CPU.
- Despliegue: transformers (PyTorch), vLLM, TGI, llama.cpp y Ollama (la familia SmolLM2 está disponible en el catálogo de Ollama), exportación a ONNX para entornos sin Python.
- Latencia y throughput: no hay mediciones publicadas para este repositorio. Como orden de magnitud esperado, un modelo de 1,7 mil millones en FP16 sobre una RTX 4090 se sitúa en cientos de tokens por segundo en generación, y en CPU moderna con llama.cpp en el rango de decenas; son estimaciones teóricas, no medidas sobre este proyecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| geoai-outdoor-assistant (este repositorio) | 1,7 mil millones (hereda del base) | 8192 tokens (modelo base) | Apache-2.0 | Repositorio sin pesos propios, 0 descargas | No es un fine-tune: solo documenta una integración |
| SmolLM2-1.7B-Instruct | 1,7 mil millones | 8192 tokens | Apache-2.0 | Pesos en safetensors, muy extendido | Idéntico en comportamiento a este repositorio |
| Qwen2.5-1.5B-Instruct | 1,54 mil millones | 32 768 tokens | Apache-2.0 | Pesos en safetensors, amplio soporte de herramientas | Contexto mayor y mejor soporte declarado de tool calling |
| Llama-3.2-1B-Instruct | 1,24 mil millones | 128 000 tokens | Licencia comunitaria Llama 3.2 | Pesos en safetensors | Contexto muy superior; licencia con restricciones de uso |
| Gemma 2 2B Instruct | 2,6 mil millones | 8192 tokens | Términos de uso de Gemma | Pesos en safetensors | Mayor tamaño y requisitos de licencia específicos |

Los datos de contexto, licencia y parámetros de los modelos alternativos provienen de sus respectivas model cards públicas y no han sido verificados en el marco de este repositorio.

## Limitaciones y advertencias

- No es un modelo entrenado: no hay fine-tune, ni pesos nuevos, ni evaluación. Cualquier expectativa de especialización en dominio geoespacial es infundada.
- Riesgo alto de alucinación factual en un modelo de 1,7 mil millones: puede inventar nombres de lugares, coordenadas, horarios o condiciones meteorológicas. La aplicación debe delegar estos datos en APIs externas y usar el modelo solo para interpretación y redacción.
- Idiomas: el modelo base está orientado al inglés; no se declara soporte de castellano ni de otras lenguas, por lo que el rendimiento multilingüe no está garantizado.
- Dependencia de servicios de terceros: la calidad del resultado depende de la disponibilidad y exactitud de los datos geográficos y meteorológicos externos, tal como reconoce la propia model card ("Results may be incomplete or inaccurate").
- Licencia: Apache-2.0 permite uso comercial del modelo, pero los datos de proveedores externos (por ejemplo, datos de OpenStreetMap bajo ODbL) tienen sus propias condiciones que deben respetarse por separado.
- Ausencia de auditoría: sin benchmarks, sin datos de sesgo y con un único like, no hay evidencia pública de calidad ni de robustez frente a entradas adversarias.
- Caveat de producción: para un asistente geoespacial real conviene usar el modelo base directamente (los pesos son los mismos) y tratar este repositorio como documentación de arquitectura, no como artefacto desplegable.
- Metadatos a revisar: las fechas de creación y actualización indicadas (2026-10-24) y la ausencia de pesos en el repositorio deben confirmarse antes de cualquier uso.

## Enlaces

- Repositorio del modelo: https://huggingface.co/manasa-arisankala45/geoai-outdoor-assistant
- Modelo base SmolLM2-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Space con nombre similar (autoría no confirmada): https://huggingface.co/spaces/Bhar1324/geoai-outdoor-assistant
- Repositorio GitHub con nombre similar (autoría no confirmada): https://github.com/F4K3S4T1SH/geoai-outdoor-assistant
- Repositorio GitHub GeoAI (posible proyecto distinto): https://github.com/DRK28122006/GeoAI
- Proyecto GeoAI de análisis geoespacial (no relacionado con este modelo): https://opengeoai.org/
- Ficha de terceros con metadatos pendientes: https://free2aitools.com/model/som-doe2007/geoai-outdoor-assistant
