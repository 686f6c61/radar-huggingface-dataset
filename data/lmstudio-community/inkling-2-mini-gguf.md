# lmstudio-community/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de lenguaje desarrollado por thinkingmachines, distribuido bajo licencia Apache 2.0. Esta ficha documenta la versión cuantizada en formato GGUF publicada por lmstudio-community, pensada para su uso con llama.cpp y LM Studio. El modelo base cuenta con aproximadamente 26.070 millones de parámetros (26,07 B), un tamaño que lo sitúa en la gama media-alta de modelos densos y que permite su despliegue en hardware de consumo con cuantizaciones agresivas.

La relevancia de esta publicación radica en que facilita el acceso al modelo original en formatos optimizados para inferencia local, sin necesidad de GPUs de centro de datos. El repositorio ocupa 69,4 GB, lo que refleja la inclusión de múltiples niveles de cuantización.

No obstante, la información pública disponible es muy limitada: la model card del repositorio GGUF es una plantilla genérica de LM Studio y no incluye detalles sobre arquitectura, datos de entrenamiento, benchmarks ni idiomas soportados. Los datos que se presentan a continuación proceden de los metadatos del repositorio y del recuento real de parámetros en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (múltiples niveles; el repo ocupa 69,4 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (transformer denso, MoE, híbrido u otra) en la información disponible. El recuento de parámetros en safetensors (26,07 B) corresponde al modelo base thinkingmachines/Inkling-2-Mini, del que no se detallan capas, dimensiones ocultas ni mecanismos de atención.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, uso de RLHF/DPO o técnicas de alineación) ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. La model card del repositorio GGUF es una plantilla estándar de LM Studio que no aporta información técnica del modelo original.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante APIs compatibles con el ecosistema de inferencia estándar.
- Razonamiento, código, matemáticas, visión, tool calling, agentes y capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en LM Studio o llama.cpp para mantener conversaciones multi-turno en el puesto de trabajo, sin depender de servicios en la nube, gracias a su formato GGUF y a su licencia Apache 2.0.
- Prototipado de aplicaciones de chat: al ser compatible con endpoints, puede integrarse en un backend local para desarrollar y probar interfaces de chat antes de migrar a infraestructura de producción.
- Evaluación de modelos en hardware de consumo: con 26,07 B de parámetros, las cuantizaciones de 4 bits permiten probar el modelo en GPUs de gama alta para consumo, lo que facilita la comparación con alternativas antes de comprometer recursos.
- Investigación sobre cuantización: el repositorio incluye varios niveles de cuantización GGUF, lo que permite estudiar la degradación de calidad frente al modelo base en tareas concretas.
- Despliegue en entornos con requisitos de soberanía del dato: la licencia Apache 2.0 y la inferencia local permiten procesar información sensible sin enviarla a terceros.
- Fine-tuning o destilación sobre el modelo base: al estar disponible el modelo original en safetensors y con licencia permisiva, puede servir como punto de partida para ajustes posteriores, aunque las capacidades concretas del modelo no estén documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (26,07 B), una cuantización de 4 bits requeriría del orden de 14-16 GB de VRAM, y una de 8 bits en torno a 26-28 GB; estos cálculos son estimaciones y no proceden de la documentación del modelo.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar viabilidad en GPUs de consumo con 24 GB o más (por ejemplo, RTX 3090/4090) con cuantizaciones de 4 bits, y en A100/H100 para precisiones mayores, pero no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probablemente con cuantizaciones de 4 bits en GPUs de 24 GB, aunque no está confirmado.
- Opciones de despliegue: llama.cpp y LM Studio (confirmados por el formato GGUF y el publicador); vLLM, TGI u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información técnica muy escasa: no se documentan arquitectura, contexto, idiomas ni benchmarks, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay documentación sobre mitigaciones ni evaluación de fidelidad.
- Sesgos: no disponible; no se ha publicado información sobre sesgos conocidos ni sobre el proceso de alineación.
- Limitaciones de contexto e idioma: no disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base original y las condiciones de la cuantización comunitaria.
- Modelo comunitario: LM Studio advierte explícitamente de que no es el creador del modelo y no garantiza su exactitud, seguridad ni disponibilidad; la responsabilidad recae en el autor original.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lmstudio-community/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Organización del autor: https://huggingface.co/thinkingmachines
- LM Studio: https://lmstudio.ai
- Discord de LM Studio: https://discord.gg/aPQfnNkxGC
- llama.cpp: https://github.com/ggerganov/llama.cpp
